// root/tailwind.config.ts
import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  safelist: [
    // Remove the oracle pattern that doesn't match any classes
    // Instead, safelist any dynamic classes we actually use
    'bg-fire-base', 'bg-water-base', 'bg-earth-base', 'bg-air-base',
    'text-fire-base', 'text-water-base', 'text-earth-base', 'text-air-base',
    'border-fire-base', 'border-water-base', 'border-earth-base', 'border-air-base'
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "sacred-gradient": "linear-gradient(135deg, #B69A78 0%, #7A9A65 50%, #6B9BD1 100%)",
        "sacred-radial": "radial-gradient(circle at center, rgba(255, 215, 0, 0.1) 0%, transparent 70%)",
      },
      colors: {
        // 🜃 ANCIENT-FUTURE PALETTE - Technology as temple instrument
        // "Surfaces absorb light instead of emitting it" - cinematic and grounded
        // Aesthetic ontology: ritual tool + instrument panel
        soul: {
          // Earth-Tech Fusion - volcanic basalt to oxidized bronze
          background: '#1A1513',      // Volcanic basalt - primary background (darker, more absorptive)
          surface: '#2C231F',         // Oxidized bronze - cards, panels (matte, not glassy)
          surfaceHover: '#3A2F28',    // Aged bronze - hover states

          // Hairline geometry - barely visible instrument guides
          border: '#2D241E',          // Subsurface divider - hairline only
          borderSubtle: '#1F1A17',    // Even subtler - etched lines

          // Text hierarchy - archive records
          textPrimary: '#FDFBF9',     // Soft ivory - primary text (ancient record clarity)
          textSecondary: '#CBBFAD',   // Muted sand - secondary (weathered inscription)
          textTertiary: '#8C6A4A',    // Aged copper - tertiary (faded etching)

          // Light behavior - candle + circuitry
          accent: '#E3B778',          // Sun-touched sand - primary accent
          accentGlow: '#F0C98A',      // Amber edge glow - 10-15px blur
          highlight: '#D4A574',       // Warm brass - threshold moments
          link: '#9B8774',            // Dusty bronze - interactive elements

          // Elemental signatures - reclaimed technology
          fireWarm: '#D67E5C',        // Ember glow
          waterWarm: '#7A9299',       // Weathered steel
          earthWarm: '#8C8165',       // Ancient clay
          airWarm: '#BFA98A',         // Desert haze
          aetherWarm: '#A38E9D',      // Twilight stone
        },

        // Spiralogic Oracle Primary Elemental Colors (preserved for compatibility)
        spiralogic: {
          fire: '#FF6B6B',
          water: '#4ECDC4',
          earth: '#95E77E',
          air: '#A8DADC',
          aether: '#9B5DE5',
          dark: '#1C1614',            // Updated to warm umber
          'dark-secondary': '#2A201E', // Updated to warm surface tone
          light: '#F7F9FB',
          gold: '#E3B778',            // Updated to warm gold
        },

        // Earth Tone Sacred Palette - Based on Facet Colors
        sacred: {
          brown: "#B69A78",     // Base earth brown
          tan: "#D4B896",       // Light tan
          sienna: "#C85450",    // Sacred sienna
          sage: "#7A9A65",      // Sacred sage green
        },
        // Elemental Earth Tones - From Facets
        fire: {
          DEFAULT: '#FF6B6B',   // Spiralogic fire
          base: "#C85450",      // Fire facet red
          glow: "#E06B67",      // Fire glow
          shadow: "#A84440",    // Fire shadow
        },
        water: {
          DEFAULT: '#4ECDC4',   // Spiralogic water
          base: "#6B9BD1",      // Water facet blue
          glow: "#83B3E9",      // Water glow
          shadow: "#5383B9",    // Water shadow
        },
        earth: {
          DEFAULT: '#95E77E',   // Spiralogic earth
          base: "#7A9A65",      // Earth facet green
          glow: "#92B27D",      // Earth glow
          shadow: "#628253",    // Earth shadow
        },
        // 🏜️ DUNE AESTHETIC PALETTE - The Spice Must Flow
        dune: {
          // Desert Sand Tones
          'spice-sand': '#D4A574',     // Primary background, warm desert sand
          'deep-sand': '#8B6F47',      // Text on light backgrounds
          'dune-amber': '#E6B887',     // Highlights, accents
          'sienna-rock': '#A0522D',    // Borders, dividers

          // Spice Orange (The Melange)
          'spice-orange': '#FF8C42',   // Primary actions, CTAs
          'spice-glow': '#FFA85C',     // Hover states, active elements
          'spice-deep': '#CC6F35',     // Pressed states

          // Fremen Blue (Eyes of Ibad)
          'ibad-blue': '#1E3A5F',      // Deep consciousness states
          'fremen-azure': '#2E5A8A',   // Water references, integration
          'spice-blue': '#4A7BA7',     // Links, secondary actions

          // Caladan Water (Memory of Home)
          'caladan-teal': '#2C7873',   // Success states, completion
          'water-deep': '#1A4D4A',     // Backgrounds for reflection
          'ocean-mist': '#5FA8A3',     // Subtle highlights

          // Semantic Colors
          'bene-gesserit-gold': '#B8860B',  // Wisdom, insights
          'navigator-purple': '#6A4C93',    // Prescient states, patterns
          'atreides-green': '#4A7C59',      // Growth, integration
          'harkonnen-crimson': '#8B0000',   // Warnings, critical states
          'guild-silver': '#C0C0C0',        // Neutral, inactive
        },
        air: {
          DEFAULT: '#A8DADC',   // Spiralogic air
          base: "#D4B896",      // Air facet tan
          glow: "#F0D4B2",      // Air glow
          shadow: "#B89A7A",    // Air shadow
        },
        aether: {
          DEFAULT: '#9B5DE5',   // Spiralogic aether
        },
        dark: '#0A0E27',
        light: '#F7F9FB',
        gold: '#FFD700',
        // Sacred Gold Accents - Premium Highlights
        gold: {
          divine: "#FFD700",    // Primary accent - Divine Gold
          amber: "#F6AD55",     // Secondary accent - Sacred Amber
          ethereal: "#FEB95A",  // Tertiary accent - Ethereal Gold
          whisper: "#FEF5E7",   // Background accent - Whisper Gold
        },
        // Sacred Neutrals - Text and UI Elements
        neutral: {
          pure: "#FFFFFF",      // Text/contrast - Pure Light
          silver: "#E2E8F0",    // Secondary text - Sacred Silver
          mystic: "#A0AEC0",    // Tertiary text - Mystic Gray
          shadow: "#4A5568",    // Subdued elements - Shadow Gray
        },
        // Ain Soph Blue - Community Hub Aesthetic
        'ain-soph': {
          blue: "#1a2332",      // Navy blue background - The infinite void
          gold: "#d4c5a0",      // Tan/gold text - Divine light
          amber: "#c8a868",     // Rich amber accent - Sacred warmth
        },
        // 🔮 JADE ANALYTICS PALETTE - Rich, cinematic jade aesthetic
        jade: {
          // Deep backgrounds - no white tones
          'abyss': '#0D1F17',          // Deepest jade black - primary background
          'shadow': '#162B20',         // Dark jade shadow - card backgrounds
          'night': '#1F3A2A',          // Jade night - panels, surfaces
          'dusk': '#2A4B37',           // Jade dusk - elevated surfaces

          // Mid-range jade tones
          'moss': '#3D6B4A',           // Moss jade - borders, dividers
          'forest': '#4F7B5C',         // Forest jade - secondary accents
          'sage': '#618B6E',           // Sage jade - primary accent
          'malachite': '#739B7F',      // Malachite jade - interactive elements

          // Lighter jade accents - but still rich
          'seafoam': '#85AB91',        // Seafoam jade - active states
          'mineral': '#97BBA3',        // Mineral jade - highlights
          'jade': '#A8CBB4',           // Classic jade - text emphasis
          'pale': '#BADBC6',           // Pale jade - lightest accent

          // Special luxury variants - rich metallics
          'bronze': '#4A6B52',         // Bronze jade - metallic depth
          'copper': '#5C7D64',         // Copper jade - warm metallics
          'silver': '#6E8F76',         // Silver jade - cool metallics
          'gold': '#7FA188',           // Gold jade - premium highlights
          'platinum': '#91B39A',       // Platinum jade - luxury accents
        },

        tesla: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
        },
        "tesla-red": "#DC2626",
        "tesla-blue": "#3B82F6",
      },
      spacing: {
        // Golden Ratio Based Spacing System
        'sacred-xs': '0.618rem',  // φ⁻¹
        'sacred-sm': '1rem',       // Base unit
        'sacred-md': '1.618rem',   // φ
        'sacred-lg': '2.618rem',   // φ + 1
        'sacred-xl': '4.236rem',   // φ²
        'sacred-2xl': '6.854rem',  // φ³
        'sacred-3xl': '11.09rem',  // φ⁴
      },
      borderRadius: {
        'sacred-sm': '4px',        // Subtle Sacred curves
        'sacred-md': '8px',        // Standard Sacred radius
        'sacred-lg': '16px',       // Prominent Sacred curves
        'sacred': '13px',          // Golden ratio derived
      },
      boxShadow: {
        'sacred-subtle': '0 1px 3px rgba(10, 14, 39, 0.1)',
        'sacred-glow': '0 4px 20px rgba(255, 215, 0, 0.1)',
        'sacred-deep': '0 10px 40px rgba(10, 14, 39, 0.3)',
        'sacred-gold': '0 0 30px rgba(255, 215, 0, 0.2)',
        'sacred-inner': 'inset 0 2px 10px rgba(255, 215, 0, 0.05)',
      },
      fontFamily: {
        'sacred-primary': ['Inter', 'SF Pro Display', '-apple-system', 'sans-serif'],
        'sacred-accent': ['Crimson Pro', 'Georgia', 'serif'],
      },
      letterSpacing: {
        'archive': '0.015em',     // Open tracking - "dust between letters"
        'etched': '0.02em',       // Even more air - for headings/mantras
      },
      animation: {
        // Premium Sacred Animations
        "emergence": "emergence 1.618s ease-out",
        "jitterbug": "jitterbug 2.618s ease-in-out",
        "spiral": "spiral 3.236s ease-in-out infinite",
        "sacred-hover": "sacred-hover 0.382s ease-out",
        "sacred-pulse": "sacred-pulse 2s infinite",
        "sacred-rotate": "sacred-rotate 10s infinite linear",
        "consciousness-ripple": "consciousness-ripple 2s infinite",
        "golden-spin": "golden-spin 6.18s linear infinite",
        "float-sacred": "float-sacred 4.236s ease-in-out infinite",
      },
      keyframes: {
        emergence: {
          '0%': { opacity: '0', transform: 'scale(0.618) translateY(20px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        jitterbug: {
          '0%': { transform: 'rotate(0deg) scale(1)' },
          '25%': { transform: 'rotate(90deg) scale(1.1)' },
          '50%': { transform: 'rotate(180deg) scale(1)' },
          '75%': { transform: 'rotate(270deg) scale(0.9)' },
          '100%': { transform: 'rotate(360deg) scale(1)' },
        },
        spiral: {
          '0%': { transform: 'rotate(0deg) translateX(0)' },
          '100%': { transform: 'rotate(360deg) translateX(10px)' },
        },
        'sacred-hover': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' },
        },
        'sacred-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.618' },
        },
        'golden-spin': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'float-sacred': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [forms],
};

export default config;
