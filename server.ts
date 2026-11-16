import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import type { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { INITIAL_CATALOG } from './src/data/catalog.ts';
import type {
  InventoryLogEntry,
  Order,
  OrderItem,
  PaymentIntent,
  PaymentToken,
  Product,
  ProductCategory,
  ProductCondition,
  ShippingAddress,
} from './src/types/store.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const STORE_PATH = path.join(DATA_DIR, 'store.json');

interface StoreState {
  products: Product[];
  orders: Order[];
  logs: InventoryLogEntry[];
}

interface StoredIntent extends PaymentIntent {
  items: Array<{ productId: string; quantity: number }>;
  used: boolean;
}

function createInitialLogs(products: Product[]): InventoryLogEntry[] {
  return products.slice(0, 4).map((p, idx) => ({
    id: `log-init-${idx + 1}`,
    timestamp: p.updatedAt,
    productId: p.id,
    productTitle: p.title,
    sku: p.sku,
    delta: p.stock,
    newStock: p.stock,
    reason: 'restock',
  }));
}

function loadStore(): StoreState {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (fs.existsSync(STORE_PATH)) {
    try {
      const raw = fs.readFileSync(STORE_PATH, 'utf-8');
      const parsed = JSON.parse(raw) as Partial<StoreState>;
      if (Array.isArray(parsed.products) && parsed.products.length > 0) {
        const existingIds = new Set(parsed.products.map((p) => p.id));
        const missingSeeds = INITIAL_CATALOG.filter((item) => !existingIds.has(item.id));
        const mergedProducts =
          missingSeeds.length > 0 ? [...parsed.products, ...missingSeeds] : parsed.products;
        const mergedState: StoreState = {
          products: mergedProducts,
          orders: Array.isArray(parsed.orders) ? parsed.orders : [],
          logs: Array.isArray(parsed.logs) ? parsed.logs : [],
        };
        if (missingSeeds.length > 0) {
          fs.writeFileSync(STORE_PATH, JSON.stringify(mergedState, null, 2), 'utf-8');
        }
        return mergedState;
      }
    } catch {
      // Fall back to initial seed if corrupted
    }
  }
  const initial: StoreState = {
    products: INITIAL_CATALOG,
    orders: [],
    logs: createInitialLogs(INITIAL_CATALOG),
  };
  fs.writeFileSync(STORE_PATH, JSON.stringify(initial, null, 2), 'utf-8');
  return initial;
}

function saveStore(state: StoreState): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(STORE_PATH, JSON.stringify(state, null, 2), 'utf-8');
}

const state: StoreState = loadStore();
const intents = new Map<string, StoredIntent>();
const idempotencyCache = new Map<string, Order>();
const sseClients = new Set<Response>();

function broadcastEvent(event: string, payload: unknown): void {
  const message = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(message);
    } catch {
      sseClients.delete(client);
    }
  }
}

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

function computeTotals(items: Array<{ product: Product; quantity: number }>) {
  const subtotal = roundCurrency(
    items.reduce((sum, entry) => sum + entry.product.price * entry.quantity, 0)
  );
  const shipping = subtotal >= 150 || subtotal === 0 ? 0 : 8.5;
  const tax = roundCurrency(subtotal * 0.0825);
  const total = roundCurrency(subtotal + shipping + tax);
  return { subtotal, shipping, tax, total };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  // Health check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ ok: true, connectedClients: sseClients.size });
  });

  // Real-time Server-Sent Events stream
  app.get('/api/events', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    sseClients.add(res);
    res.write(
      `event: inventory:sync\ndata: ${JSON.stringify({
        products: state.products,
        orders: state.orders,
        logs: state.logs.slice(0, 40),
        connectedClients: sseClients.size,
      })}\n\n`
    );

    const heartbeat = setInterval(() => {
      try {
        res.write(`: heartbeat ${Date.now()}\n\n`);
      } catch {
        clearInterval(heartbeat);
        sseClients.delete(res);
      }
    }, 20000);

    req.on('close', () => {
      clearInterval(heartbeat);
      sseClients.delete(res);
    });
  });

  // Get full catalog, orders, and audit logs
  app.get('/api/catalog', (_req: Request, res: Response) => {
    res.json({
      products: state.products,
      orders: state.orders,
      logs: state.logs.slice(0, 40),
    });
  });

  // Intake new console or video game listing
  app.post('/api/inventory', (req: Request, res: Response) => {
    const body = req.body as Partial<Product>;
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const sku = typeof body.sku === 'string' ? body.sku.trim().toUpperCase() : '';
    const category: ProductCategory = body.category === 'console' ? 'console' : 'game';
    const condition: ProductCondition =
      body.condition === 'new' || body.condition === 'used-mint' || body.condition === 'used-good'
        ? body.condition
        : 'used-mint';
    const price = Number(body.price);
    const stock = Math.max(0, Math.floor(Number(body.stock ?? 1)));

    if (!title || !Number.isFinite(price) || price <= 0) {
      res.status(400).json({ error: 'Valid title and positive price are required.' });
      return;
    }

    const now = new Date().toISOString();
    const id = `${title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')}-${crypto.randomBytes(2).toString('hex')}`;

    const newProduct: Product = {
      id,
      sku: sku || `${category === 'console' ? 'CON' : 'GAM'}-${crypto.randomInt(100, 999)}`,
      title,
      category,
      condition,
      platform: body.platform ?? 'PlayStation 5',
      price: roundCurrency(price),
      msrp: body.msrp ? roundCurrency(Number(body.msrp)) : undefined,
      stock,
      backdrop: body.backdrop ?? 'clay',
      artwork:
        body.artwork ??
        (category === 'console' ? 'ps5-slim' : 'game-zelda-totk'),
      featured: Boolean(body.featured),
      summary:
        typeof body.summary === 'string' && body.summary.trim()
          ? body.summary.trim()
          : condition === 'new'
            ? 'Factory-sealed retail unit verified by our intake desk.'
            : 'Pre-owned edition inspected, cleaned, and bench-tested.',
      inspectionNotes:
        Array.isArray(body.inspectionNotes) && body.inspectionNotes.length > 0
          ? body.inspectionNotes
          : condition === 'new'
            ? ['Factory seal intact', '12-month warranty eligible']
            : ['Full hardware & media diagnostics passed', '90-day Cartridge & Console warranty'],
      updatedAt: now,
    };

    state.products = [newProduct, ...state.products];

    const logEntry: InventoryLogEntry = {
      id: `log-${crypto.randomUUID()}`,
      timestamp: now,
      productId: newProduct.id,
      productTitle: newProduct.title,
      sku: newProduct.sku,
      delta: newProduct.stock,
      newStock: newProduct.stock,
      reason: 'intake',
    };
    state.logs = [logEntry, ...state.logs].slice(0, 80);
    saveStore(state);

    broadcastEvent('inventory:created', newProduct);
    broadcastEvent('log:added', logEntry);

    res.status(201).json({ product: newProduct, log: logEntry });
  });

  // Real-time inventory adjustment (stock, price, condition, featured)
  app.patch('/api/inventory/:id', (req: Request, res: Response) => {
    const id = req.params.id;
    const idx = state.products.findIndex((p) => p.id === id);
    if (idx === -1) {
      res.status(404).json({ error: 'Product not found.' });
      return;
    }

    const current = state.products[idx];
    const body = req.body as {
      stockDelta?: number;
      stock?: number;
      price?: number;
      condition?: ProductCondition;
      featured?: boolean;
    };

    let nextStock = current.stock;
    if (typeof body.stockDelta === 'number' && Number.isFinite(body.stockDelta)) {
      nextStock = Math.max(0, Math.floor(current.stock + body.stockDelta));
    } else if (typeof body.stock === 'number' && Number.isFinite(body.stock)) {
      nextStock = Math.max(0, Math.floor(body.stock));
    }

    const nextPrice =
      typeof body.price === 'number' && Number.isFinite(body.price) && body.price > 0
        ? roundCurrency(body.price)
        : current.price;

    const nextCondition: ProductCondition =
      body.condition === 'new' || body.condition === 'used-mint' || body.condition === 'used-good'
        ? body.condition
        : current.condition;

    const nextFeatured =
      typeof body.featured === 'boolean' ? body.featured : current.featured;

    const now = new Date().toISOString();
    const updated: Product = {
      ...current,
      stock: nextStock,
      price: nextPrice,
      condition: nextCondition,
      featured: nextFeatured,
      updatedAt: now,
    };

    state.products[idx] = updated;

    const delta = nextStock - current.stock;
    let logEntry: InventoryLogEntry | null = null;
    if (delta !== 0) {
      logEntry = {
        id: `log-${crypto.randomUUID()}`,
        timestamp: now,
        productId: updated.id,
        productTitle: updated.title,
        sku: updated.sku,
        delta,
        newStock: updated.stock,
        reason: delta > 0 ? 'restock' : 'adjustment',
      };
      state.logs = [logEntry, ...state.logs].slice(0, 80);
    }

    saveStore(state);
    broadcastEvent('inventory:updated', updated);
    if (logEntry) {
      broadcastEvent('log:added', logEntry);
    }

    res.json({ product: updated, log: logEntry });
  });

  // Delete listing
  app.delete('/api/inventory/:id', (req: Request, res: Response) => {
    const id = req.params.id;
    const exists = state.products.some((p) => p.id === id);
    if (!exists) {
      res.status(404).json({ error: 'Product not found.' });
      return;
    }
    state.products = state.products.filter((p) => p.id !== id);
    saveStore(state);
    broadcastEvent('inventory:deleted', { id });
    res.json({ ok: true, id });
  });

  // Step 1 of Secure Payment Gateway: Create server-verified Payment Intent
  app.post('/api/payments/intent', (req: Request, res: Response) => {
    const body = req.body as {
      items?: Array<{ productId: string; quantity: number }>;
    };

    if (!Array.isArray(body.items) || body.items.length === 0) {
      res.status(400).json({ error: 'Your shopping bag is empty.' });
      return;
    }

    const resolved: Array<{ product: Product; quantity: number }> = [];
    const conflicts: string[] = [];

    for (const item of body.items) {
      const quantity = Math.floor(Number(item.quantity));
      const product = state.products.find((p) => p.id === item.productId);
      if (!product) {
        conflicts.push(`Item "${item.productId}" is no longer listed.`);
        continue;
      }
      if (quantity <= 0) {
        conflicts.push(`Invalid quantity for ${product.title}.`);
        continue;
      }
      if (product.stock < quantity) {
        conflicts.push(
          product.stock === 0
            ? `${product.title} just sold out.`
            : `Only ${product.stock} unit(s) of ${product.title} left in stock.`
        );
        continue;
      }
      resolved.push({ product, quantity });
    }

    if (conflicts.length > 0) {
      res.status(409).json({ error: conflicts[0], conflicts });
      return;
    }

    const totals = computeTotals(resolved);
    const intentId = `pi_${crypto.randomBytes(8).toString('hex')}`;
    const clientSecret = `cs_${crypto.randomBytes(12).toString('hex')}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    const intent: StoredIntent = {
      intentId,
      clientSecret,
      ...totals,
      requires3DS: totals.total >= 250,
      expiresAt,
      items: resolved.map((r) => ({ productId: r.product.id, quantity: r.quantity })),
      used: false,
    };

    intents.set(intentId, intent);

    const publicIntent: PaymentIntent = {
      intentId: intent.intentId,
      clientSecret: intent.clientSecret,
      subtotal: intent.subtotal,
      shipping: intent.shipping,
      tax: intent.tax,
      total: intent.total,
      requires3DS: intent.requires3DS,
      expiresAt: intent.expiresAt,
    };

    res.status(201).json(publicIntent);
  });

  // Step 2 of Secure Payment Gateway: Confirm tokenized payment & atomically commit stock
  app.post('/api/payments/confirm', (req: Request, res: Response) => {
    const idempotencyKey = req.header('Idempotency-Key');
    if (idempotencyKey && idempotencyCache.has(idempotencyKey)) {
      res.json({ order: idempotencyCache.get(idempotencyKey), idempotentReplay: true });
      return;
    }

    const body = req.body as {
      intentId?: string;
      clientSecret?: string;
      paymentToken?: PaymentToken;
      shippingAddress?: ShippingAddress;
      threeDSecureCode?: string;
    };

    if (!body.intentId || !body.clientSecret || !body.paymentToken || !body.shippingAddress) {
      res.status(400).json({ error: 'Missing payment confirmation fields.' });
      return;
    }

    const intent = intents.get(body.intentId);
    if (!intent || intent.clientSecret !== body.clientSecret) {
      res.status(404).json({ error: 'Payment session expired or invalid. Please retry.' });
      return;
    }

    if (intent.used) {
      res.status(409).json({ error: 'This payment intent has already been processed.' });
      return;
    }

    if (Date.now() > Date.parse(intent.expiresAt)) {
      intents.delete(intent.intentId);
      res.status(410).json({ error: 'Payment session timed out. Please re-verify inventory.' });
      return;
    }

    // Validate 3D Secure verification if required
    if (intent.requires3DS) {
      const code = (body.threeDSecureCode ?? '').trim();
      if (!/^\d{6}$/.test(code) || code === '000000') {
        res.status(402).json({
          error: '3D Secure verification failed. Enter the 6-digit verification code (not 000000).',
        });
        return;
      }
    }

    // Atomic live stock verification before capture
    const resolved: Array<{ index: number; product: Product; quantity: number }> = [];
    for (const line of intent.items) {
      const idx = state.products.findIndex((p) => p.id === line.productId);
      if (idx === -1 || state.products[idx].stock < line.quantity) {
        const available = idx === -1 ? 0 : state.products[idx].stock;
        const name = idx === -1 ? line.productId : state.products[idx].title;
        res.status(409).json({
          error:
            available === 0
              ? `${name} was purchased by another shopper just moments ago.`
              : `Only ${available} unit(s) of ${name} remain available.`,
        });
        return;
      }
      resolved.push({ index: idx, product: state.products[idx], quantity: line.quantity });
    }

    // Commit inventory decrement & build authoritative order
    const now = new Date().toISOString();
    const orderItems: OrderItem[] = [];
    const createdLogs: InventoryLogEntry[] = [];
    const updatedProducts: Product[] = [];

    for (const entry of resolved) {
      const updated: Product = {
        ...entry.product,
        stock: entry.product.stock - entry.quantity,
        updatedAt: now,
      };
      state.products[entry.index] = updated;
      updatedProducts.push(updated);

      orderItems.push({
        productId: updated.id,
        sku: updated.sku,
        title: updated.title,
        condition: updated.condition,
        platform: updated.platform,
        unitPrice: updated.price,
        quantity: entry.quantity,
        artwork: updated.artwork,
        backdrop: updated.backdrop,
      });

      const logEntry: InventoryLogEntry = {
        id: `log-${crypto.randomUUID()}`,
        timestamp: now,
        productId: updated.id,
        productTitle: updated.title,
        sku: updated.sku,
        delta: -entry.quantity,
        newStock: updated.stock,
        reason: 'sale',
      };
      createdLogs.push(logEntry);
    }

    const orderNumber = `ORD-${new Date().getFullYear()}-${crypto.randomInt(1000, 9999)}`;
    const order: Order = {
      id: crypto.randomUUID(),
      orderNumber,
      createdAt: now,
      status: 'confirmed',
      items: orderItems,
      subtotal: intent.subtotal,
      shipping: intent.shipping,
      tax: intent.tax,
      total: intent.total,
      payment: {
        paymentId: `pay_${crypto.randomBytes(7).toString('hex')}`,
        authorizationCode: crypto.randomBytes(3).toString('hex').toUpperCase(),
        method: body.paymentToken.method,
        brand: body.paymentToken.brand,
        last4: body.paymentToken.last4,
        threeDSecureVerified: intent.requires3DS,
        gatewayStatus: 'captured',
      },
      shippingAddress: {
        fullName: body.shippingAddress.fullName.trim(),
        email: body.shippingAddress.email.trim(),
        street: body.shippingAddress.street.trim(),
        city: body.shippingAddress.city.trim(),
        state: body.shippingAddress.state.trim(),
        postalCode: body.shippingAddress.postalCode.trim(),
      },
    };

    intent.used = true;
    state.orders = [order, ...state.orders].slice(0, 50);
    state.logs = [...createdLogs, ...state.logs].slice(0, 80);
    saveStore(state);

    if (idempotencyKey) {
      idempotencyCache.set(idempotencyKey, order);
    }

    for (const p of updatedProducts) {
      broadcastEvent('inventory:updated', p);
    }
    for (const l of createdLogs) {
      broadcastEvent('log:added', l);
    }
    broadcastEvent('order:created', order);

    res.status(201).json({ order });
  });

  // Mount Vite middleware in dev or serve static bundle in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.join(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  const port = Number(process.env.PORT) || 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Cartridge & Console server running on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
