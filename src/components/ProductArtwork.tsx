import type { ArtworkVariant, BackdropTone } from '../types/store';

export const BACKDROP_STYLES: Record<BackdropTone, string> = {
  crimson: 'bg-[#8F1D1D] text-white',
  clay: 'bg-[#EDE4DC] text-[#1F1B18]',
  mist: 'bg-[#DDE8EC] text-[#1F1B18]',
  sand: 'bg-[#EFE7DC] text-[#1F1B18]',
};

interface ProductArtworkProps {
  variant: ArtworkVariant;
  className?: string;
}

export function ProductArtwork({ variant, className = 'w-full h-full' }: ProductArtworkProps) {
  switch (variant) {
    case 'ps1-console':
      return (
        <svg viewBox="0 0 240 240" fill="none" className={className} aria-hidden="true">
          <ellipse cx="120" cy="184" rx="76" ry="11" fill="black" fillOpacity="0.16" />
          {/* Classic Grey PlayStation 1 / PSone body */}
          <rect x="38" y="88" width="164" height="82" rx="14" fill="#CFCBC4" stroke="#A6A097" strokeWidth="1.5" />
          {/* Circular CD lid */}
          <circle cx="120" cy="126" r="34" fill="#C4BFB7" stroke="#9D968D" strokeWidth="1.5" />
          <circle cx="120" cy="126" r="14" fill="#B5AFA6" />
          {/* Left Power & Reset buttons */}
          <circle cx="62" cy="116" r="8" fill="#B8B2A9" stroke="#969087" strokeWidth="1.2" />
          <circle cx="62" cy="140" r="6" fill="#B8B2A9" stroke="#969087" strokeWidth="1.2" />
          {/* Right Open button */}
          <circle cx="178" cy="116" r="8" fill="#B8B2A9" stroke="#969087" strokeWidth="1.2" />
          {/* Memory card & controller front ports */}
          <rect x="66" y="162" width="40" height="8" rx="2" fill="#46413C" />
          <rect x="134" y="162" width="40" height="8" rx="2" fill="#46413C" />
          {/* Subtle tri-color retro crest */}
          <rect x="112" y="118" width="16" height="4" rx="1" fill="#8F1D1D" />
          <rect x="115" y="124" width="10" height="4" rx="1" fill="#2A5B84" />
        </svg>
      );

    case 'ps2-console':
      return (
        <svg viewBox="0 0 240 240" fill="none" className={className} aria-hidden="true">
          <ellipse cx="120" cy="198" rx="64" ry="10" fill="black" fillOpacity="0.18" />
          {/* Iconic PS2 vertical monolith with stepped overhang */}
          <rect x="74" y="42" width="66" height="148" rx="3" fill="#1C1A19" stroke="#36322F" strokeWidth="1.2" />
          <rect x="140" y="54" width="24" height="136" rx="2" fill="#141211" />
          {/* Horizontal cooling ribs */}
          <path d="M76 58H138M76 66H138M76 74H138M76 82H138M76 90H138" stroke="#2D2926" strokeWidth="2" />
          {/* Blue PS2 accent stripe & disc tray */}
          <rect x="88" y="108" width="4" height="42" rx="1" fill="#2E64B5" />
          <rect x="147" y="70" width="8" height="72" rx="1" fill="#292523" />
          {/* Power & Eject LEDs */}
          <circle cx="152" cy="158" r="2.5" fill="#3B82F6" />
          <circle cx="152" cy="168" r="2.5" fill="#22C55E" />
          {/* Vertical stand */}
          <rect x="64" y="186" width="110" height="8" rx="3" fill="#23201E" />
        </svg>
      );

    case 'ps3-slim':
      return (
        <svg viewBox="0 0 240 240" fill="none" className={className} aria-hidden="true">
          <ellipse cx="120" cy="182" rx="82" ry="11" fill="black" fillOpacity="0.16" />
          {/* Curved matte-black PS3 Slim deck */}
          <path
            d="M36 96C36 86 44 78 54 78H186C196 78 204 86 204 96V158C204 166 197 172 189 172H51C43 172 36 166 36 158V96Z"
            fill="#1F1C1A"
            stroke="#3B3633"
            strokeWidth="1.5"
          />
          {/* Glossy front trim */}
          <rect x="38" y="138" width="164" height="14" fill="#12100F" />
          {/* Slot-loading Blu-ray drive */}
          <rect x="64" y="143" width="112" height="3" rx="1.5" fill="#3A3532" />
          {/* Silver accent bar & power LED */}
          <rect x="52" y="158" width="136" height="3" rx="1.5" fill="#A6A098" fillOpacity="0.7" />
          <circle cx="176" cy="164" r="2.5" fill="#22C55E" />
          {/* Embossed lid curve */}
          <path d="M46 98C90 90 150 90 194 98" stroke="#35302D" strokeWidth="2" />
        </svg>
      );

    case 'ps4-pro':
      return (
        <svg viewBox="0 0 240 240" fill="none" className={className} aria-hidden="true">
          <ellipse cx="120" cy="186" rx="80" ry="11" fill="black" fillOpacity="0.18" />
          {/* Three-tier slanted PS4 Pro silhouette */}
          <path d="M52 74H194L184 96H42L52 74Z" fill="#2B2725" />
          <path d="M46 98H188L178 122H36L46 98Z" fill="#211D1B" />
          <path d="M40 124H182L172 148H30L40 124Z" fill="#171412" />
          {/* Signature blue light bar */}
          <path d="M48 97H184" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" />
          {/* Front DualShock 4 */}
          <g transform="translate(68, 134)">
            <path
              d="M14 20C18 10 26 8 36 10H64C74 8 82 10 86 20L92 42C94 48 87 52 81 49L70 40H30L19 49C13 52 6 48 8 42L14 20Z"
              fill="#262220"
              stroke="#46403C"
              strokeWidth="1.2"
            />
            <rect x="34" y="10" width="32" height="14" rx="2" fill="#171412" />
            <circle cx="38" cy="32" r="5" fill="#171412" />
            <circle cx="62" cy="32" r="5" fill="#171412" />
          </g>
        </svg>
      );

    case 'psp-vita':
      return (
        <svg viewBox="0 0 240 240" fill="none" className={className} aria-hidden="true">
          <ellipse cx="120" cy="176" rx="84" ry="10" fill="black" fillOpacity="0.16" />
          {/* Sleek oval PSP / Vita handheld */}
          <rect x="26" y="76" width="188" height="90" rx="44" fill="#1F1B18" stroke="#423C38" strokeWidth="2" />
          {/* Chrome inner ring */}
          <rect x="32" y="82" width="176" height="78" rx="38" stroke="#A6A098" strokeOpacity="0.45" strokeWidth="1.5" />
          {/* Widescreen OLED display */}
          <rect x="66" y="88" width="108" height="66" rx="4" fill="#11100F" />
          <rect x="70" y="92" width="100" height="58" rx="2" fill="url(#vitaScreen)" />
          {/* Left D-Pad & Thumbstick */}
          <circle cx="48" cy="108" r="9" fill="#2D2825" />
          <circle cx="48" cy="134" r="6" fill="#3B3531" />
          {/* Right Face buttons & Thumbstick */}
          <circle cx="192" cy="108" r="9" fill="#2D2825" />
          <circle cx="192" cy="134" r="6" fill="#3B3531" />
          <defs>
            <linearGradient id="vitaScreen" x1="70" y1="92" x2="170" y2="150" gradientUnits="userSpaceOnUse">
              <stop stopColor="#2A466D" />
              <stop offset="1" stopColor="#1B2230" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'xbox-original':
      return (
        <svg viewBox="0 0 240 240" fill="none" className={className} aria-hidden="true">
          <ellipse cx="120" cy="186" rx="80" ry="11" fill="black" fillOpacity="0.18" />
          {/* Chunky Original Xbox chassis */}
          <rect x="36" y="76" width="168" height="96" rx="10" fill="#1E1C1A" stroke="#36322F" strokeWidth="1.5" />
          {/* Iconic embossed X across top */}
          <path d="M54 84L186 154M186 84L54 154" stroke="#2D2A27" strokeWidth="14" strokeLinecap="round" />
          {/* Center Emerald Jewel */}
          <circle cx="120" cy="118" r="19" fill="#14361D" stroke="#358C4B" strokeWidth="2" />
          <path d="M111 109L129 127M129 109L111 127" stroke="#5ED178" strokeWidth="3" strokeLinecap="round" />
          {/* Front disc bezel & 4 controller ports */}
          <rect x="52" y="156" width="60" height="8" rx="2" fill="#2B2724" />
          <circle cx="142" cy="160" r="4" fill="#11100F" />
          <circle cx="156" cy="160" r="4" fill="#11100F" />
          <circle cx="170" cy="160" r="4" fill="#11100F" />
          <circle cx="184" cy="160" r="4" fill="#11100F" />
        </svg>
      );

    case 'xbox-360':
      return (
        <svg viewBox="0 0 240 240" fill="none" className={className} aria-hidden="true">
          <ellipse cx="120" cy="198" rx="58" ry="10" fill="black" fillOpacity="0.16" />
          {/* Concave Xbox 360 S vertical tower */}
          <path
            d="M84 44C94 48 146 48 156 44L162 186C146 190 94 190 78 186L84 44Z"
            fill="#1D1A18"
            stroke="#393431"
            strokeWidth="1.5"
          />
          {/* Angular side vent */}
          <path d="M88 64H112V132H86L88 64Z" fill="#292523" />
          {/* Disc tray slot */}
          <rect x="134" y="58" width="6" height="92" rx="2" fill="#12100E" />
          {/* Iconic Ring of Light */}
          <circle cx="120" cy="154" r="12" fill="#12100E" stroke="#4ADE80" strokeWidth="2.5" />
          <circle cx="120" cy="154" r="5" fill="#2D2926" />
        </svg>
      );

    case 'xbox-one-x':
      return (
        <svg viewBox="0 0 240 240" fill="none" className={className} aria-hidden="true">
          <ellipse cx="120" cy="176" rx="84" ry="10" fill="black" fillOpacity="0.16" />
          {/* Two-tier stealth horizontal Xbox One X */}
          <rect x="34" y="102" width="172" height="32" rx="3" fill="#24211F" />
          <rect x="40" y="134" width="160" height="24" rx="2" fill="#171412" />
          {/* Disc slot on recessed lower tier */}
          <rect x="52" y="142" width="76" height="3" rx="1.5" fill="#0E0C0B" />
          {/* Glowing Xbox Nexus button */}
          <circle cx="184" cy="118" r="6" fill="#FAF8F5" fillOpacity="0.9" />
          <path d="M181 115L187 121M187 115L181 121" stroke="#1F1B18" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );

    case 'gamecube':
      return (
        <svg viewBox="0 0 240 240" fill="none" className={className} aria-hidden="true">
          <ellipse cx="120" cy="196" rx="66" ry="10" fill="black" fillOpacity="0.16" />
          {/* Iconic Indigo GameCube body */}
          <rect x="56" y="64" width="128" height="118" rx="10" fill="#4B488A" stroke="#36336B" strokeWidth="1.5" />
          {/* Top disc lid */}
          <circle cx="120" cy="96" r="28" fill="#5D599E" stroke="#3D3A75" strokeWidth="1.5" />
          <circle cx="120" cy="96" r="10" fill="#1F1B18" />
          {/* Power / Reset / Open buttons */}
          <circle cx="76" cy="86" r="7" fill="#D5D2E0" />
          <circle cx="76" cy="108" r="5" fill="#D5D2E0" />
          <circle cx="164" cy="86" r="7" fill="#D5D2E0" />
          {/* Front grey controller & memory plate */}
          <rect x="64" y="130" width="112" height="44" rx="4" fill="#B5B2BE" />
          <circle cx="82" cy="154" r="6" fill="#2A2624" />
          <circle cx="107" cy="154" r="6" fill="#2A2624" />
          <circle cx="133" cy="154" r="6" fill="#2A2624" />
          <circle cx="158" cy="154" r="6" fill="#2A2624" />
          <rect x="76" y="136" width="28" height="7" rx="1.5" fill="#8C8996" />
          <rect x="136" y="136" width="28" height="7" rx="1.5" fill="#8C8996" />
        </svg>
      );

    case 'wii-console':
      return (
        <svg viewBox="0 0 240 240" fill="none" className={className} aria-hidden="true">
          <ellipse cx="120" cy="200" rx="56" ry="9" fill="black" fillOpacity="0.14" />
          {/* Tilted crisp white Wii deck on translucent grey stand */}
          <g transform="rotate(-6 120 120)">
            <rect x="92" y="42" width="52" height="144" rx="4" fill="#FAF8F5" stroke="#CFC7BC" strokeWidth="1.5" />
            {/* Blue illuminated disc slot */}
            <rect x="128" y="64" width="4" height="72" rx="2" fill="#38BDF8" />
            {/* Power, Reset, Eject buttons */}
            <circle cx="106" cy="60" r="3.5" fill="#D4CEC5" />
            <circle cx="106" cy="72" r="3" fill="#D4CEC5" />
            <circle cx="106" cy="154" r="3.5" fill="#D4CEC5" />
            {/* SD Card flap */}
            <rect x="102" y="100" width="14" height="36" rx="2" fill="#EFEAE2" stroke="#D4CEC5" strokeWidth="1" />
          </g>
          {/* Stand base */}
          <path d="M78 188H162L154 196H86L78 188Z" fill="#BDB7AE" />
        </svg>
      );

    case 'wii-u':
      return (
        <svg viewBox="0 0 240 240" fill="none" className={className} aria-hidden="true">
          <ellipse cx="120" cy="184" rx="86" ry="11" fill="black" fillOpacity="0.16" />
          {/* Wii U GamePad */}
          <rect x="24" y="68" width="192" height="104" rx="20" fill="#1F1C1A" stroke="#3B3633" strokeWidth="1.5" />
          {/* 6.2" Touchscreen */}
          <rect x="64" y="82" width="112" height="76" rx="4" fill="#110F0E" />
          <rect x="68" y="86" width="104" height="68" rx="2" fill="url(#wiiuGrad)" />
          {/* Left & Right thumbsticks and controls */}
          <circle cx="44" cy="96" r="8" fill="#2E2926" stroke="#453F3B" strokeWidth="1.2" />
          <circle cx="196" cy="96" r="8" fill="#2E2926" stroke="#453F3B" strokeWidth="1.2" />
          <path d="M38 122H50M44 116V128" stroke="#4A4440" strokeWidth="4" strokeLinecap="round" />
          <circle cx="196" cy="122" r="3" fill="#4A4440" />
          <circle cx="188" cy="130" r="3" fill="#4A4440" />
          <circle cx="204" cy="130" r="3" fill="#4A4440" />
          <circle cx="196" cy="138" r="3" fill="#4A4440" />
          <defs>
            <linearGradient id="wiiuGrad" x1="68" y1="86" x2="172" y2="154" gradientUnits="userSpaceOnUse">
              <stop stopColor="#2D628F" />
              <stop offset="1" stopColor="#1B2A3A" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'gba-sp':
      return (
        <svg viewBox="0 0 240 240" fill="none" className={className} aria-hidden="true">
          <ellipse cx="120" cy="202" rx="54" ry="9" fill="black" fillOpacity="0.15" />
          {/* Clamshell Top Screen */}
          <rect x="70" y="34" width="100" height="82" rx="10" fill="#B82525" stroke="#8F1D1D" strokeWidth="1.5" />
          <rect x="80" y="44" width="80" height="62" rx="4" fill="#1F1B18" />
          <rect x="88" y="50" width="64" height="50" rx="2" fill="#8FB89B" />
          {/* Clamshell Hinge */}
          <rect x="66" y="114" width="108" height="10" rx="5" fill="#991B1B" />
          {/* Bottom Control Deck */}
          <rect x="70" y="124" width="100" height="72" rx="10" fill="#B82525" stroke="#8F1D1D" strokeWidth="1.5" />
          {/* D-pad & A/B buttons */}
          <path d="M84 154H104M94 144V164" stroke="#231F1D" strokeWidth="6" strokeLinecap="round" />
          <circle cx="144" cy="158" r="6" fill="#231F1D" />
          <circle cx="156" cy="148" r="6" fill="#231F1D" />
          <circle cx="120" cy="138" r="3" fill="#231F1D" />
        </svg>
      );

    case 'n3ds-ds':
      return (
        <svg viewBox="0 0 240 240" fill="none" className={className} aria-hidden="true">
          <ellipse cx="120" cy="202" rx="64" ry="9" fill="black" fillOpacity="0.16" />
          {/* Upper Widescreen Clamshell */}
          <rect x="54" y="34" width="132" height="80" rx="10" fill="#2A2624" stroke="#45403D" strokeWidth="1.5" />
          <rect x="72" y="44" width="96" height="58" rx="3" fill="#141210" />
          <rect x="76" y="48" width="88" height="50" rx="2" fill="url(#dsTopGrad)" />
          {/* Hinge */}
          <rect x="50" y="114" width="140" height="10" rx="5" fill="#1B1816" />
          {/* Lower Touch Deck */}
          <rect x="54" y="124" width="132" height="72" rx="10" fill="#2A2624" stroke="#45403D" strokeWidth="1.5" />
          <rect x="84" y="134" width="72" height="52" rx="3" fill="#141210" />
          <circle cx="69" cy="146" r="6.5" fill="#8C867E" />
          <path d="M63 166H75M69 160V172" stroke="#4F4945" strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="171" cy="146" r="3" fill="#DC2626" />
          <circle cx="164" cy="153" r="3" fill="#2563EB" />
          <circle cx="178" cy="153" r="3" fill="#16A34A" />
          <circle cx="171" cy="160" r="3" fill="#EAB308" />
          <defs>
            <linearGradient id="dsTopGrad" x1="76" y1="48" x2="164" y2="98" gradientUnits="userSpaceOnUse">
              <stop stopColor="#8F1D1D" />
              <stop offset="1" stopColor="#26201D" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'dreamcast':
      return (
        <svg viewBox="0 0 240 240" fill="none" className={className} aria-hidden="true">
          <ellipse cx="120" cy="184" rx="78" ry="11" fill="black" fillOpacity="0.15" />
          {/* Crisp Retro Cream Dreamcast Body */}
          <rect x="40" y="76" width="160" height="96" rx="14" fill="#F2EDE4" stroke="#C9C1B5" strokeWidth="1.5" />
          {/* Circular GD-ROM Lid */}
          <circle cx="120" cy="120" r="36" fill="#E6DFD3" stroke="#C2B9AC" strokeWidth="1.5" />
          {/* Signature Dreamcast Orange Swirl */}
          <path
            d="M120 118C123 114 128 117 125 122C122 127 113 125 113 118C113 109 125 106 131 113"
            stroke="#D95D24"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Power LED & Open/Power Buttons */}
          <circle cx="62" cy="134" r="6" fill="#DCD5C8" />
          <circle cx="178" cy="134" r="6" fill="#DCD5C8" />
          <polygon points="120,144 117,150 123,150" fill="#D95D24" />
          {/* 4 Front Controller Ports */}
          <rect x="64" y="160" width="112" height="10" rx="3" fill="#DED7CA" />
          <circle cx="80" cy="165" r="3.5" fill="#46413C" />
          <circle cx="106" cy="165" r="3.5" fill="#46413C" />
          <circle cx="134" cy="165" r="3.5" fill="#46413C" />
          <circle cx="160" cy="165" r="3.5" fill="#46413C" />
        </svg>
      );

    case 'ps5-slim':
      return (
        <svg viewBox="0 0 240 240" fill="none" className={className} aria-hidden="true">
          <ellipse cx="120" cy="204" rx="58" ry="10" fill="black" fillOpacity="0.18" />
          <path
            d="M84 42C84 36 89 32 95 32L116 36V194L84 188C81 150 81 82 84 42Z"
            fill="#F6F3EE"
            stroke="#D6CFC6"
            strokeWidth="1.5"
          />
          <rect x="112" y="36" width="22" height="158" rx="4" fill="#1F1B18" />
          <path d="M123 44V186" stroke="#3B5B9D" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.8" />
          <path
            d="M132 36L158 40C165 41 170 47 170 54V182C170 189 164 194 157 194H132V36Z"
            fill="#FFFFFF"
            stroke="#DED7CE"
            strokeWidth="1.5"
          />
          <rect x="155" y="96" width="3" height="66" rx="1.5" fill="#2B2623" />
          <path d="M83 108H170" stroke="#C8C0B6" strokeWidth="1.5" />
          <ellipse cx="126" cy="195" rx="46" ry="6" fill="#2A2522" />
          <g transform="translate(46, 134)">
            <path
              d="M18 28C22 14 34 10 46 12H78C90 10 102 14 106 28L114 54C116 62 108 68 100 64L86 52H38L24 64C16 68 8 62 10 54L18 28Z"
              fill="#FAF8F5"
              stroke="#D5CEC5"
              strokeWidth="1.5"
            />
            <path d="M44 12H80L76 34H48L44 12Z" fill="#231F1D" />
            <circle cx="48" cy="40" r="7" fill="#2C2724" />
            <circle cx="76" cy="40" r="7" fill="#2C2724" />
            <circle cx="92" cy="25" r="3" fill="#4B433E" />
            <circle cx="32" cy="25" r="4" fill="#4B433E" />
          </g>
        </svg>
      );

    case 'switch-oled':
      return (
        <svg viewBox="0 0 240 240" fill="none" className={className} aria-hidden="true">
          <ellipse cx="120" cy="186" rx="76" ry="11" fill="black" fillOpacity="0.14" />
          <path
            d="M44 74C32 74 26 84 26 98V146C26 160 34 170 46 170H62V74H44Z"
            fill="#FAF8F5"
            stroke="#CFC7BC"
            strokeWidth="1.5"
          />
          <circle cx="44" cy="100" r="8" fill="#2A2522" />
          <circle cx="44" cy="128" r="3.5" fill="#2A2522" />
          <circle cx="37" cy="135" r="3.5" fill="#2A2522" />
          <circle cx="51" cy="135" r="3.5" fill="#2A2522" />
          <circle cx="44" cy="142" r="3.5" fill="#2A2522" />
          <rect x="62" y="72" width="116" height="100" rx="5" fill="#1F1B18" />
          <rect x="69" y="79" width="102" height="86" rx="3" fill="#2A2522" />
          <path d="M72 82H168V162H72V82Z" fill="url(#oledGrad)" />
          <path d="M76 82L126 162H76V82Z" fill="white" fillOpacity="0.06" />
          <path
            d="M178 74H194C206 74 214 84 214 98V146C214 160 206 170 194 170H178V74Z"
            fill="#FAF8F5"
            stroke="#CFC7BC"
            strokeWidth="1.5"
          />
          <circle cx="196" cy="134" r="8" fill="#2A2522" />
          <circle cx="196" cy="96" r="3.5" fill="#2A2522" />
          <circle cx="189" cy="103" r="3.5" fill="#2A2522" />
          <circle cx="203" cy="103" r="3.5" fill="#2A2522" />
          <circle cx="196" cy="110" r="3.5" fill="#2A2522" />
          <defs>
            <linearGradient id="oledGrad" x1="72" y1="82" x2="168" y2="162" gradientUnits="userSpaceOnUse">
              <stop stopColor="#8F1D1D" />
              <stop offset="1" stopColor="#26201D" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'xbox-series-x':
      return (
        <svg viewBox="0 0 240 240" fill="none" className={className} aria-hidden="true">
          <ellipse cx="120" cy="202" rx="56" ry="10" fill="black" fillOpacity="0.16" />
          <path d="M84 48L134 38V186L84 196V48Z" fill="#262220" />
          <path d="M134 38L164 50V194L134 186V38Z" fill="#181513" />
          <path d="M84 48L114 36L164 50L134 60L84 48Z" fill="#322D2A" />
          <ellipse cx="124" cy="48" rx="18" ry="5" fill="#2E5F3E" fillOpacity="0.85" />
          <circle cx="96" cy="68" r="4" fill="#FAF8F5" fillOpacity="0.85" />
          <rect x="92" y="136" width="3" height="44" rx="1.5" fill="#12100E" />
          <g transform="translate(114, 146)">
            <path
              d="M12 16C16 8 24 6 34 8H56C66 6 74 8 78 16L84 36C86 42 79 46 73 43L62 34H28L17 43C11 46 4 42 6 36L12 16Z"
              fill="#2B2725"
              stroke="#46403C"
              strokeWidth="1.2"
            />
            <circle cx="24" cy="20" r="4.5" fill="#171412" />
            <circle cx="56" cy="27" r="4.5" fill="#171412" />
            <circle cx="45" cy="14" r="3" fill="#FAF8F5" fillOpacity="0.8" />
          </g>
        </svg>
      );

    case 'steam-deck':
      return (
        <svg viewBox="0 0 240 240" fill="none" className={className} aria-hidden="true">
          <ellipse cx="120" cy="184" rx="84" ry="11" fill="black" fillOpacity="0.22" />
          <rect x="26" y="74" width="188" height="96" rx="22" fill="#231F1D" stroke="#3D3734" strokeWidth="1.5" />
          <path d="M26 94C20 112 20 144 30 162C38 172 52 172 56 164V84C44 82 32 86 26 94Z" fill="#191614" />
          <path d="M214 94C220 112 220 144 210 162C202 172 188 172 184 164V84C196 82 208 86 214 94Z" fill="#191614" />
          <rect x="66" y="84" width="108" height="76" rx="4" fill="#110F0E" />
          <rect x="70" y="88" width="100" height="68" rx="2" fill="url(#deckScreen)" />
          <rect x="40" y="122" width="18" height="18" rx="3" fill="#322D2A" />
          <rect x="182" y="122" width="18" height="18" rx="3" fill="#322D2A" />
          <circle cx="50" cy="100" r="7" fill="#3E3834" stroke="#E05A2B" strokeWidth="1.5" />
          <circle cx="190" cy="100" r="7" fill="#3E3834" stroke="#E05A2B" strokeWidth="1.5" />
          <defs>
            <linearGradient id="deckScreen" x1="70" y1="88" x2="170" y2="156" gradientUnits="userSpaceOnUse">
              <stop stopColor="#3B2F2F" />
              <stop offset="1" stopColor="#1B1817" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'retro-pocket':
      return (
        <svg viewBox="0 0 240 240" fill="none" className={className} aria-hidden="true">
          <ellipse cx="120" cy="204" rx="52" ry="9" fill="black" fillOpacity="0.14" />
          <rect x="68" y="34" width="104" height="162" rx="14" fill="#8F1D1D" stroke="#6E1414" strokeWidth="1.5" />
          <rect x="78" y="46" width="84" height="76" rx="6" fill="#181513" />
          <rect x="86" y="54" width="68" height="60" rx="2" fill="#D5DEC8" />
          <rect x="92" y="92" width="56" height="16" fill="#5D7450" />
          <rect x="102" y="78" width="16" height="14" fill="#3C4E32" />
          <circle cx="138" cy="68" r="6" fill="#8A9E78" />
          <path d="M92 142H100V134H108V142H116V150H108V158H100V150H92V142Z" fill="#231F1D" />
          <circle cx="144" cy="140" r="5" fill="#231F1D" />
          <circle cx="134" cy="149" r="5" fill="#231F1D" />
          <circle cx="154" cy="149" r="5" fill="#231F1D" />
          <circle cx="144" cy="158" r="5" fill="#231F1D" />
          <rect x="110" y="178" width="20" height="3" rx="1.5" fill="#5D1010" />
        </svg>
      );

    case 'dualsense-edge':
      return (
        <svg viewBox="0 0 240 240" fill="none" className={className} aria-hidden="true">
          <ellipse cx="120" cy="184" rx="76" ry="11" fill="black" fillOpacity="0.14" />
          <path d="M34 86C24 86 18 96 18 110V136C18 150 26 160 38 160H58V86H34Z" fill="#FAF8F5" stroke="#CFC7BC" strokeWidth="1.5" />
          <path d="M182 86H202C214 86 222 96 222 110V136C222 150 214 160 202 160H182V86Z" fill="#FAF8F5" stroke="#CFC7BC" strokeWidth="1.5" />
          <rect x="54" y="72" width="132" height="84" rx="6" fill="#1F1B18" />
          <rect x="60" y="78" width="120" height="72" rx="3" fill="url(#portalGrad)" />
          <circle cx="38" cy="108" r="8" fill="#2A2522" />
          <circle cx="202" cy="134" r="8" fill="#2A2522" />
          <defs>
            <linearGradient id="portalGrad" x1="60" y1="78" x2="180" y2="150" gradientUnits="userSpaceOnUse">
              <stop stopColor="#263B59" />
              <stop offset="1" stopColor="#1B1817" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'game-zelda-totk':
    case 'game-elden-ring':
    case 'game-mario-odyssey':
    case 'game-gt7':
    case 'game-hollow-knight': {
      const palettes: Record<string, { spine: string; cover: string; accent: string; badge: string }> = {
        'game-zelda-totk': { spine: '#B91C1C', cover: '#1E2B26', accent: '#D4B06A', badge: 'NSW' },
        'game-elden-ring': { spine: '#1F1B18', cover: '#231D16', accent: '#C8A253', badge: 'PS5' },
        'game-mario-odyssey': { spine: '#D92626', cover: '#B81D1D', accent: '#F6E6D0', badge: 'NSW' },
        'game-gt7': { spine: '#1F1B18', cover: '#1A2433', accent: '#D8DEE9', badge: 'PS5' },
        'game-hollow-knight': { spine: '#B91C1C', cover: '#1D222B', accent: '#C8D3E6', badge: 'NSW' },
      };
      const p = palettes[variant];
      return (
        <svg viewBox="0 0 240 240" fill="none" className={className} aria-hidden="true">
          <ellipse cx="122" cy="204" rx="54" ry="9" fill="black" fillOpacity="0.16" />
          <rect x="66" y="34" width="110" height="162" rx="8" fill={p.cover} stroke="#1F1B18" strokeOpacity="0.2" strokeWidth="1.5" />
          <path d="M66 42C66 37.5 69.5 34 74 34H82V196H74C69.5 196 66 192.5 66 188V42Z" fill={p.spine} />
          <rect x="82" y="34" width="94" height="20" rx="2" fill="#FAF8F5" fillOpacity="0.94" />
          <text x="92" y="48" fill="#1F1B18" fontSize="9" fontWeight="700" fontFamily="monospace">
            {p.badge}
          </text>
          <circle cx="129" cy="112" r="28" stroke={p.accent} strokeWidth="2" strokeOpacity="0.85" />
          <path d="M129 88L142 112L129 136L116 112L129 88Z" fill={p.accent} fillOpacity="0.85" />
          <rect x="98" y="160" width="62" height="5" rx="2.5" fill="#FAF8F5" fillOpacity="0.7" />
          <rect x="110" y="170" width="38" height="3" rx="1.5" fill="#FAF8F5" fillOpacity="0.4" />
          <circle cx="164" cy="166" r="24" fill="#FAF8F5" stroke="#D1C9BE" strokeWidth="1.5" />
          <circle cx="164" cy="166" r="7" fill="#FAF8F5" stroke="#B5ADA2" strokeWidth="1.5" />
        </svg>
      );
    }

    case 'game-chrono-cib':
      return (
        <svg viewBox="0 0 240 240" fill="none" className={className} aria-hidden="true">
          <ellipse cx="120" cy="196" rx="64" ry="9" fill="black" fillOpacity="0.15" />
          <path
            d="M58 54C58 46 64 40 72 40H168C176 40 182 46 182 54V176C182 182 177 186 171 186H69C63 186 58 182 58 176V54Z"
            fill="#C7C2BA"
            stroke="#9E978E"
            strokeWidth="1.5"
          />
          <rect x="66" y="48" width="18" height="6" rx="1.5" fill="#A9A299" />
          <rect x="66" y="58" width="18" height="6" rx="1.5" fill="#A9A299" />
          <rect x="156" y="48" width="18" height="6" rx="1.5" fill="#A9A299" />
          <rect x="156" y="58" width="18" height="6" rx="1.5" fill="#A9A299" />
          <rect x="74" y="76" width="92" height="88" rx="4" fill="#1F1B18" />
          <circle cx="120" cy="116" r="22" stroke="#D4A64A" strokeWidth="2.5" />
          <path d="M120 98V116L132 124" stroke="#FAF8F5" strokeWidth="2.5" strokeLinecap="round" />
          <rect x="88" y="148" width="64" height="5" rx="2.5" fill="#8F1D1D" />
          <rect x="80" y="176" width="80" height="10" rx="2" fill="#46403B" />
        </svg>
      );
  }
}
