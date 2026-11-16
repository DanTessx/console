export type ProductCategory = 'console' | 'game';

export type ProductCondition = 'new' | 'used-mint' | 'used-good';

export type Platform =
  | 'PlayStation 5'
  | 'PlayStation 4'
  | 'PlayStation 3'
  | 'PlayStation 2'
  | 'PlayStation 1'
  | 'PSP / PS Vita'
  | 'Xbox Series X'
  | 'Xbox One'
  | 'Xbox 360'
  | 'Original Xbox'
  | 'Nintendo Switch'
  | 'Wii U'
  | 'Nintendo Wii'
  | 'GameCube'
  | 'Nintendo 3DS / DS'
  | 'Game Boy Advance'
  | 'Sega Dreamcast'
  | 'Steam Deck'
  | 'Retro Handheld'
  | 'Nintendo 64';

export type ArtworkVariant =
  | 'ps5-slim'
  | 'ps4-pro'
  | 'ps3-slim'
  | 'ps2-console'
  | 'ps1-console'
  | 'psp-vita'
  | 'switch-oled'
  | 'wii-u'
  | 'wii-console'
  | 'gamecube'
  | 'n3ds-ds'
  | 'gba-sp'
  | 'dreamcast'
  | 'xbox-series-x'
  | 'xbox-one-x'
  | 'xbox-360'
  | 'xbox-original'
  | 'steam-deck'
  | 'retro-pocket'
  | 'dualsense-edge'
  | 'game-elden-ring'
  | 'game-zelda-totk'
  | 'game-mario-odyssey'
  | 'game-gt7'
  | 'game-chrono-cib'
  | 'game-hollow-knight';

export type BackdropTone = 'crimson' | 'clay' | 'mist' | 'sand';

export interface Product {
  id: string;
  sku: string;
  title: string;
  category: ProductCategory;
  condition: ProductCondition;
  platform: Platform;
  price: number;
  msrp?: number;
  stock: number;
  backdrop: BackdropTone;
  artwork: ArtworkVariant;
  featured: boolean;
  summary: string;
  inspectionNotes: string[];
  updatedAt: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface ShippingAddress {
  fullName: string;
  email: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
}

export interface PaymentToken {
  tokenId: string;
  method: 'card' | 'express-wallet';
  brand: 'Visa' | 'Mastercard' | 'Amex' | 'Express Pay';
  last4: string;
  expMonth: string;
  expYear: string;
  cardholderName: string;
}

export interface OrderItem {
  productId: string;
  sku: string;
  title: string;
  condition: ProductCondition;
  platform: Platform;
  unitPrice: number;
  quantity: number;
  artwork: ArtworkVariant;
  backdrop: BackdropTone;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: 'confirmed' | 'preparing' | 'shipped';
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  payment: {
    paymentId: string;
    authorizationCode: string;
    method: 'card' | 'express-wallet';
    brand: string;
    last4: string;
    threeDSecureVerified: boolean;
    gatewayStatus: 'captured';
  };
  shippingAddress: ShippingAddress;
}

export interface PaymentIntent {
  intentId: string;
  clientSecret: string;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  requires3DS: boolean;
  expiresAt: string;
}

export interface InventoryLogEntry {
  id: string;
  timestamp: string;
  productId: string;
  productTitle: string;
  sku: string;
  delta: number;
  newStock: number;
  reason: 'sale' | 'restock' | 'intake' | 'adjustment';
}

export function formatConditionLabel(condition: ProductCondition): string {
  switch (condition) {
    case 'new':
      return 'New Sealed';
    case 'used-mint':
      return 'Used · Mint';
    case 'used-good':
      return 'Used · Tested';
  }
}
