/**
 * STELLIUM DESIGN SYSTEM
 *
 * High-end, soulful design tokens and theme packages
 * for practitioner environments
 *
 * "Not software. A sanctuary."
 */

// ============================================
// THEME PACKAGES
// ============================================

export type ThemePackage =
  | 'sanctuary'      // Default - warm, grounded, candlelit
  | 'celestial'      // Astrology - cosmic, starlit, deep indigo
  | 'terra'          // Bodywork - earth tones, organic, grounded
  | 'ember'          // Coaching - warm energy, amber, motivating
  | 'haven'          // Therapy - soft, safe, calming blues
  | 'mystic'         // Shamanic - deep purple, sacred, mysterious
  | 'minimal'        // Clean, spacious, almost white
  | 'midnight'       // Deep dark mode, elegant
  | 'soullab';       // B2C consumer - warm off-white, refined elegance

export interface ThemeTokens {
  name: ThemePackage;
  displayName: string;
  description: string;

  colors: {
    // Backgrounds
    bg: {
      primary: string;
      secondary: string;
      tertiary: string;
      elevated: string;
      sunken: string;
    };
    // Text
    text: {
      primary: string;
      secondary: string;
      muted: string;
      accent: string;
      inverse: string;
    };
    // Accents
    accent: {
      primary: string;
      secondary: string;
      glow: string;
    };
    // Borders
    border: {
      subtle: string;
      default: string;
      strong: string;
    };
    // Semantic
    semantic: {
      success: string;
      warning: string;
      error: string;
      info: string;
    };
    // Special
    special: {
      gold: string;
      silver: string;
      rose: string;
    };
  };

  typography: {
    fontFamily: {
      display: string;
      body: string;
      mono: string;
    };
    fontWeight: {
      light: number;
      regular: number;
      medium: number;
      semibold: number;
    };
    letterSpacing: {
      tight: string;
      normal: string;
      wide: string;
    };
  };

  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
  };

  radius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };

  shadows: {
    subtle: string;
    default: string;
    elevated: string;
    glow: string;
  };

  motion: {
    duration: {
      instant: string;
      fast: string;
      normal: string;
      slow: string;
      ritual: string;  // For sacred transitions
    };
    easing: {
      default: string;
      gentle: string;
      bounce: string;
    };
  };
}

// ============================================
// THEME DEFINITIONS
// ============================================

export const themes: Record<ThemePackage, ThemeTokens> = {
  sanctuary: {
    name: 'sanctuary',
    displayName: 'Sanctuary',
    description: 'Warm, grounded, candlelit. The default sacred workspace.',
    colors: {
      bg: {
        primary: '#1a1815',      // Deep warm charcoal
        secondary: '#242019',    // Slightly lighter
        tertiary: '#2d2820',     // Card backgrounds
        elevated: '#363029',     // Elevated surfaces
        sunken: '#141210',       // Recessed areas
      },
      text: {
        primary: '#f5f0e8',      // Warm cream
        secondary: '#c4baa8',    // Muted cream
        muted: '#8a8070',        // Subtle
        accent: '#d4a574',       // Warm gold
        inverse: '#1a1815',      // For light surfaces
      },
      accent: {
        primary: '#d4a574',      // Warm brass/gold
        secondary: '#a67c52',    // Deeper gold
        glow: 'rgba(212, 165, 116, 0.15)',
      },
      border: {
        subtle: 'rgba(212, 165, 116, 0.1)',
        default: 'rgba(212, 165, 116, 0.2)',
        strong: 'rgba(212, 165, 116, 0.4)',
      },
      semantic: {
        success: '#7a9f6e',
        warning: '#d4a574',
        error: '#c45c4a',
        info: '#6a8caf',
      },
      special: {
        gold: '#d4a574',
        silver: '#a8a8a8',
        rose: '#c49898',
      },
    },
    typography: {
      fontFamily: {
        display: '"Cormorant Garamond", Georgia, serif',
        body: '"Inter", -apple-system, sans-serif',
        mono: '"JetBrains Mono", monospace',
      },
      fontWeight: {
        light: 300,
        regular: 400,
        medium: 500,
        semibold: 600,
      },
      letterSpacing: {
        tight: '-0.02em',
        normal: '0',
        wide: '0.05em',
      },
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem',
      '3xl': '4rem',
    },
    radius: {
      sm: '0.375rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem',
      full: '9999px',
    },
    shadows: {
      subtle: '0 1px 2px rgba(0, 0, 0, 0.2)',
      default: '0 4px 12px rgba(0, 0, 0, 0.3)',
      elevated: '0 8px 24px rgba(0, 0, 0, 0.4)',
      glow: '0 0 20px rgba(212, 165, 116, 0.15)',
    },
    motion: {
      duration: {
        instant: '0ms',
        fast: '150ms',
        normal: '250ms',
        slow: '400ms',
        ritual: '800ms',
      },
      easing: {
        default: 'cubic-bezier(0.4, 0, 0.2, 1)',
        gentle: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
        bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },

  celestial: {
    name: 'celestial',
    displayName: 'Celestial',
    description: 'Cosmic depths. Starlit indigo. For astrologers reading the sky.',
    colors: {
      bg: {
        primary: '#0d1117',      // Deep space
        secondary: '#161b22',    // Slightly lighter
        tertiary: '#1c2128',     // Card backgrounds
        elevated: '#22272e',     // Elevated surfaces
        sunken: '#080a0d',       // Deep recessed
      },
      text: {
        primary: '#e6edf3',      // Starlight
        secondary: '#8b949e',    // Muted star
        muted: '#484f58',        // Distant star
        accent: '#79c0ff',       // Celestial blue
        inverse: '#0d1117',
      },
      accent: {
        primary: '#79c0ff',      // Celestial blue
        secondary: '#a371f7',    // Cosmic purple
        glow: 'rgba(121, 192, 255, 0.15)',
      },
      border: {
        subtle: 'rgba(121, 192, 255, 0.1)',
        default: 'rgba(121, 192, 255, 0.2)',
        strong: 'rgba(121, 192, 255, 0.4)',
      },
      semantic: {
        success: '#56d364',
        warning: '#e3b341',
        error: '#f85149',
        info: '#79c0ff',
      },
      special: {
        gold: '#e3b341',
        silver: '#c9d1d9',
        rose: '#f78166',
      },
    },
    typography: {
      fontFamily: {
        display: '"Cinzel", Georgia, serif',
        body: '"Inter", -apple-system, sans-serif',
        mono: '"JetBrains Mono", monospace',
      },
      fontWeight: {
        light: 300,
        regular: 400,
        medium: 500,
        semibold: 600,
      },
      letterSpacing: {
        tight: '-0.02em',
        normal: '0',
        wide: '0.1em',
      },
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem',
      '3xl': '4rem',
    },
    radius: {
      sm: '0.375rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem',
      full: '9999px',
    },
    shadows: {
      subtle: '0 1px 2px rgba(0, 0, 0, 0.3)',
      default: '0 4px 12px rgba(0, 0, 0, 0.4)',
      elevated: '0 8px 24px rgba(0, 0, 0, 0.5)',
      glow: '0 0 30px rgba(121, 192, 255, 0.2)',
    },
    motion: {
      duration: {
        instant: '0ms',
        fast: '150ms',
        normal: '300ms',
        slow: '500ms',
        ritual: '1000ms',
      },
      easing: {
        default: 'cubic-bezier(0.4, 0, 0.2, 1)',
        gentle: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
        bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },

  terra: {
    name: 'terra',
    displayName: 'Terra',
    description: 'Earth tones. Organic warmth. For bodyworkers grounded in matter.',
    colors: {
      bg: {
        primary: '#1c1917',      // Rich earth
        secondary: '#27221e',    // Warm brown
        tertiary: '#302924',     // Clay
        elevated: '#3d352d',     // Sandstone
        sunken: '#151311',       // Deep soil
      },
      text: {
        primary: '#f5f5f4',      // Warm white
        secondary: '#d6d3d1',    // Stone
        muted: '#a8a29e',        // Weathered
        accent: '#a3b18a',       // Sage green
        inverse: '#1c1917',
      },
      accent: {
        primary: '#a3b18a',      // Sage
        secondary: '#8b7355',    // Terracotta
        glow: 'rgba(163, 177, 138, 0.15)',
      },
      border: {
        subtle: 'rgba(163, 177, 138, 0.1)',
        default: 'rgba(163, 177, 138, 0.2)',
        strong: 'rgba(163, 177, 138, 0.4)',
      },
      semantic: {
        success: '#a3b18a',
        warning: '#d4a373',
        error: '#bc6c4c',
        info: '#7c9885',
      },
      special: {
        gold: '#d4a373',
        silver: '#a8a29e',
        rose: '#c4a484',
      },
    },
    typography: {
      fontFamily: {
        display: '"Libre Baskerville", Georgia, serif',
        body: '"Source Sans 3", -apple-system, sans-serif',
        mono: '"JetBrains Mono", monospace',
      },
      fontWeight: {
        light: 300,
        regular: 400,
        medium: 500,
        semibold: 600,
      },
      letterSpacing: {
        tight: '-0.01em',
        normal: '0',
        wide: '0.04em',
      },
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem',
      '3xl': '4rem',
    },
    radius: {
      sm: '0.25rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem',
      full: '9999px',
    },
    shadows: {
      subtle: '0 1px 3px rgba(0, 0, 0, 0.2)',
      default: '0 4px 10px rgba(0, 0, 0, 0.25)',
      elevated: '0 8px 20px rgba(0, 0, 0, 0.35)',
      glow: '0 0 20px rgba(163, 177, 138, 0.1)',
    },
    motion: {
      duration: {
        instant: '0ms',
        fast: '150ms',
        normal: '250ms',
        slow: '400ms',
        ritual: '700ms',
      },
      easing: {
        default: 'cubic-bezier(0.4, 0, 0.2, 1)',
        gentle: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
        bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },

  ember: {
    name: 'ember',
    displayName: 'Ember',
    description: 'Warm energy. Amber glow. For coaches igniting transformation.',
    colors: {
      bg: {
        primary: '#1a1614',
        secondary: '#251f1b',
        tertiary: '#2f2721',
        elevated: '#3a3028',
        sunken: '#141110',
      },
      text: {
        primary: '#faf6f1',
        secondary: '#d9cfc2',
        muted: '#a69b8c',
        accent: '#f59e0b',
        inverse: '#1a1614',
      },
      accent: {
        primary: '#f59e0b',      // Amber
        secondary: '#dc7c0c',
        glow: 'rgba(245, 158, 11, 0.15)',
      },
      border: {
        subtle: 'rgba(245, 158, 11, 0.1)',
        default: 'rgba(245, 158, 11, 0.2)',
        strong: 'rgba(245, 158, 11, 0.4)',
      },
      semantic: {
        success: '#84cc16',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
      },
      special: {
        gold: '#f59e0b',
        silver: '#a1a1aa',
        rose: '#fb7185',
      },
    },
    typography: {
      fontFamily: {
        display: '"Playfair Display", Georgia, serif',
        body: '"Inter", -apple-system, sans-serif',
        mono: '"JetBrains Mono", monospace',
      },
      fontWeight: {
        light: 300,
        regular: 400,
        medium: 500,
        semibold: 600,
      },
      letterSpacing: {
        tight: '-0.02em',
        normal: '0',
        wide: '0.05em',
      },
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem',
      '3xl': '4rem',
    },
    radius: {
      sm: '0.375rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem',
      full: '9999px',
    },
    shadows: {
      subtle: '0 1px 2px rgba(0, 0, 0, 0.2)',
      default: '0 4px 12px rgba(0, 0, 0, 0.3)',
      elevated: '0 8px 24px rgba(0, 0, 0, 0.4)',
      glow: '0 0 25px rgba(245, 158, 11, 0.2)',
    },
    motion: {
      duration: {
        instant: '0ms',
        fast: '120ms',
        normal: '200ms',
        slow: '350ms',
        ritual: '600ms',
      },
      easing: {
        default: 'cubic-bezier(0.4, 0, 0.2, 1)',
        gentle: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
        bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },

  haven: {
    name: 'haven',
    displayName: 'Haven',
    description: 'Soft blues. Safe container. For therapists holding space.',
    colors: {
      bg: {
        primary: '#14181d',
        secondary: '#1c2127',
        tertiary: '#242a31',
        elevated: '#2c333b',
        sunken: '#0e1115',
      },
      text: {
        primary: '#e8ecf0',
        secondary: '#a8b3bf',
        muted: '#6b7785',
        accent: '#60a5fa',
        inverse: '#14181d',
      },
      accent: {
        primary: '#60a5fa',      // Soft blue
        secondary: '#3b82f6',
        glow: 'rgba(96, 165, 250, 0.12)',
      },
      border: {
        subtle: 'rgba(96, 165, 250, 0.08)',
        default: 'rgba(96, 165, 250, 0.15)',
        strong: 'rgba(96, 165, 250, 0.3)',
      },
      semantic: {
        success: '#4ade80',
        warning: '#facc15',
        error: '#f87171',
        info: '#60a5fa',
      },
      special: {
        gold: '#fbbf24',
        silver: '#94a3b8',
        rose: '#fda4af',
      },
    },
    typography: {
      fontFamily: {
        display: '"Lora", Georgia, serif',
        body: '"Inter", -apple-system, sans-serif',
        mono: '"JetBrains Mono", monospace',
      },
      fontWeight: {
        light: 300,
        regular: 400,
        medium: 500,
        semibold: 600,
      },
      letterSpacing: {
        tight: '-0.01em',
        normal: '0',
        wide: '0.03em',
      },
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem',
      '3xl': '4rem',
    },
    radius: {
      sm: '0.5rem',
      md: '0.75rem',
      lg: '1rem',
      xl: '1.25rem',
      full: '9999px',
    },
    shadows: {
      subtle: '0 1px 3px rgba(0, 0, 0, 0.15)',
      default: '0 4px 10px rgba(0, 0, 0, 0.2)',
      elevated: '0 8px 20px rgba(0, 0, 0, 0.3)',
      glow: '0 0 20px rgba(96, 165, 250, 0.1)',
    },
    motion: {
      duration: {
        instant: '0ms',
        fast: '180ms',
        normal: '300ms',
        slow: '450ms',
        ritual: '900ms',
      },
      easing: {
        default: 'cubic-bezier(0.4, 0, 0.2, 1)',
        gentle: 'cubic-bezier(0.2, 0, 0.1, 1)',
        bounce: 'cubic-bezier(0.34, 1.2, 0.64, 1)',
      },
    },
  },

  mystic: {
    name: 'mystic',
    displayName: 'Mystic',
    description: 'Deep purple. Sacred mystery. For shamanic guides walking between worlds.',
    colors: {
      bg: {
        primary: '#13111c',
        secondary: '#1a172a',
        tertiary: '#221e36',
        elevated: '#2a2542',
        sunken: '#0c0a14',
      },
      text: {
        primary: '#ede9fe',
        secondary: '#a5a1c2',
        muted: '#6b6790',
        accent: '#a78bfa',
        inverse: '#13111c',
      },
      accent: {
        primary: '#a78bfa',      // Mystic purple
        secondary: '#8b5cf6',
        glow: 'rgba(167, 139, 250, 0.15)',
      },
      border: {
        subtle: 'rgba(167, 139, 250, 0.1)',
        default: 'rgba(167, 139, 250, 0.2)',
        strong: 'rgba(167, 139, 250, 0.4)',
      },
      semantic: {
        success: '#86efac',
        warning: '#fcd34d',
        error: '#fca5a5',
        info: '#a78bfa',
      },
      special: {
        gold: '#fcd34d',
        silver: '#c4b5fd',
        rose: '#f9a8d4',
      },
    },
    typography: {
      fontFamily: {
        display: '"Crimson Pro", Georgia, serif',
        body: '"Inter", -apple-system, sans-serif',
        mono: '"JetBrains Mono", monospace',
      },
      fontWeight: {
        light: 300,
        regular: 400,
        medium: 500,
        semibold: 600,
      },
      letterSpacing: {
        tight: '-0.02em',
        normal: '0',
        wide: '0.08em',
      },
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem',
      '3xl': '4rem',
    },
    radius: {
      sm: '0.375rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem',
      full: '9999px',
    },
    shadows: {
      subtle: '0 1px 3px rgba(0, 0, 0, 0.25)',
      default: '0 4px 12px rgba(0, 0, 0, 0.35)',
      elevated: '0 8px 24px rgba(0, 0, 0, 0.45)',
      glow: '0 0 30px rgba(167, 139, 250, 0.2)',
    },
    motion: {
      duration: {
        instant: '0ms',
        fast: '200ms',
        normal: '350ms',
        slow: '500ms',
        ritual: '1200ms',
      },
      easing: {
        default: 'cubic-bezier(0.4, 0, 0.2, 1)',
        gentle: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
        bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },

  minimal: {
    name: 'minimal',
    displayName: 'Minimal',
    description: 'Clean. Spacious. Almost nothing. For those who want the work to breathe.',
    colors: {
      bg: {
        primary: '#fafafa',
        secondary: '#f5f5f5',
        tertiary: '#ffffff',
        elevated: '#ffffff',
        sunken: '#f0f0f0',
      },
      text: {
        primary: '#171717',
        secondary: '#525252',
        muted: '#a3a3a3',
        accent: '#171717',
        inverse: '#fafafa',
      },
      accent: {
        primary: '#171717',
        secondary: '#404040',
        glow: 'rgba(23, 23, 23, 0.05)',
      },
      border: {
        subtle: 'rgba(0, 0, 0, 0.04)',
        default: 'rgba(0, 0, 0, 0.08)',
        strong: 'rgba(0, 0, 0, 0.15)',
      },
      semantic: {
        success: '#16a34a',
        warning: '#ca8a04',
        error: '#dc2626',
        info: '#2563eb',
      },
      special: {
        gold: '#ca8a04',
        silver: '#71717a',
        rose: '#e11d48',
      },
    },
    typography: {
      fontFamily: {
        display: '"Inter", -apple-system, sans-serif',
        body: '"Inter", -apple-system, sans-serif',
        mono: '"JetBrains Mono", monospace',
      },
      fontWeight: {
        light: 300,
        regular: 400,
        medium: 500,
        semibold: 600,
      },
      letterSpacing: {
        tight: '-0.02em',
        normal: '0',
        wide: '0.05em',
      },
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem',
      '3xl': '4rem',
    },
    radius: {
      sm: '0.25rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem',
      full: '9999px',
    },
    shadows: {
      subtle: '0 1px 2px rgba(0, 0, 0, 0.03)',
      default: '0 2px 8px rgba(0, 0, 0, 0.06)',
      elevated: '0 4px 16px rgba(0, 0, 0, 0.08)',
      glow: '0 0 0 rgba(0, 0, 0, 0)',
    },
    motion: {
      duration: {
        instant: '0ms',
        fast: '100ms',
        normal: '150ms',
        slow: '250ms',
        ritual: '400ms',
      },
      easing: {
        default: 'cubic-bezier(0.4, 0, 0.2, 1)',
        gentle: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
        bounce: 'cubic-bezier(0.34, 1.2, 0.64, 1)',
      },
    },
  },

  midnight: {
    name: 'midnight',
    displayName: 'Midnight',
    description: 'Deep dark. Elegant. For those who work best in the quiet hours.',
    colors: {
      bg: {
        primary: '#09090b',
        secondary: '#121214',
        tertiary: '#18181b',
        elevated: '#1f1f23',
        sunken: '#050506',
      },
      text: {
        primary: '#fafafa',
        secondary: '#a1a1aa',
        muted: '#52525b',
        accent: '#e4e4e7',
        inverse: '#09090b',
      },
      accent: {
        primary: '#e4e4e7',
        secondary: '#a1a1aa',
        glow: 'rgba(228, 228, 231, 0.08)',
      },
      border: {
        subtle: 'rgba(255, 255, 255, 0.04)',
        default: 'rgba(255, 255, 255, 0.08)',
        strong: 'rgba(255, 255, 255, 0.15)',
      },
      semantic: {
        success: '#4ade80',
        warning: '#fbbf24',
        error: '#f87171',
        info: '#60a5fa',
      },
      special: {
        gold: '#fbbf24',
        silver: '#a1a1aa',
        rose: '#fb7185',
      },
    },
    typography: {
      fontFamily: {
        display: '"DM Serif Display", Georgia, serif',
        body: '"Inter", -apple-system, sans-serif',
        mono: '"JetBrains Mono", monospace',
      },
      fontWeight: {
        light: 300,
        regular: 400,
        medium: 500,
        semibold: 600,
      },
      letterSpacing: {
        tight: '-0.02em',
        normal: '0',
        wide: '0.05em',
      },
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem',
      '3xl': '4rem',
    },
    radius: {
      sm: '0.375rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem',
      full: '9999px',
    },
    shadows: {
      subtle: '0 1px 2px rgba(0, 0, 0, 0.4)',
      default: '0 4px 12px rgba(0, 0, 0, 0.5)',
      elevated: '0 8px 24px rgba(0, 0, 0, 0.6)',
      glow: '0 0 20px rgba(228, 228, 231, 0.05)',
    },
    motion: {
      duration: {
        instant: '0ms',
        fast: '150ms',
        normal: '250ms',
        slow: '400ms',
        ritual: '700ms',
      },
      easing: {
        default: 'cubic-bezier(0.4, 0, 0.2, 1)',
        gentle: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
        bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },

  soullab: {
    name: 'soullab',
    displayName: 'Soullab',
    description: 'Warm, refined, grounded elegance. The primary B2C consumer aesthetic.',
    colors: {
      bg: {
        primary: '#f8f7f5',      // Warm off-white
        secondary: '#f4f3f0',    // Slightly warmer
        tertiary: '#ffffff',     // Cards (bg-white/40 equivalent)
        elevated: '#ffffff',     // Elevated surfaces
        sunken: '#f0efec',       // Deepest warmth
      },
      text: {
        primary: '#292524',      // stone-800
        secondary: '#57534e',    // stone-600
        muted: '#78716c',        // stone-500
        accent: '#5a7a6f',       // Sage accent
        inverse: '#f8f7f5',      // For dark surfaces
      },
      accent: {
        primary: '#5a7a6f',      // Sage - growth, grounding
        secondary: '#6b5a98',    // Violet - consciousness, intuition
        glow: 'rgba(90, 122, 111, 0.1)',
      },
      border: {
        subtle: 'rgba(214, 211, 209, 0.4)',   // stone-200/40
        default: 'rgba(214, 211, 209, 0.6)',  // stone-200/60
        strong: 'rgba(168, 162, 158, 0.6)',   // stone-400/60
      },
      semantic: {
        success: '#5a7a6f',      // Sage
        warning: '#8a7a5a',      // Gold
        error: '#a85a5a',        // Muted red
        info: '#6b5a98',         // Violet
      },
      special: {
        gold: '#8a7a5a',         // Wisdom, achievement
        silver: '#a8a29e',       // stone-400
        rose: '#98706b',         // Warm rose
      },
    },
    typography: {
      fontFamily: {
        display: '"Inter", -apple-system, sans-serif',
        body: '"Inter", -apple-system, sans-serif',
        mono: '"JetBrains Mono", monospace',
      },
      fontWeight: {
        light: 300,              // Headers prefer light
        regular: 400,
        medium: 500,
        semibold: 600,
      },
      letterSpacing: {
        tight: '0',
        normal: '0.025em',       // tracking-wide default
        wide: '0.2em',           // For uppercase labels
      },
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem',
      '3xl': '4rem',
    },
    radius: {
      sm: '0.5rem',
      md: '0.75rem',
      lg: '1rem',
      xl: '1.25rem',             // rounded-xl
      full: '9999px',
    },
    shadows: {
      subtle: '0 1px 2px rgba(0, 0, 0, 0.03)',
      default: '0 2px 8px rgba(0, 0, 0, 0.05)',
      elevated: '0 4px 16px rgba(0, 0, 0, 0.08)',
      glow: '0 0 0 rgba(0, 0, 0, 0)',  // No glow for light theme
    },
    motion: {
      duration: {
        instant: '0ms',
        fast: '150ms',
        normal: '200ms',
        slow: '300ms',
        ritual: '500ms',
      },
      easing: {
        default: 'cubic-bezier(0.4, 0, 0.2, 1)',
        gentle: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
        bounce: 'cubic-bezier(0.34, 1.2, 0.64, 1)',
      },
    },
  },
};

// ============================================
// THEME UTILITIES
// ============================================

export function getTheme(name: ThemePackage): ThemeTokens {
  return themes[name] || themes.sanctuary;
}

export function getThemeList(): { name: ThemePackage; displayName: string; description: string }[] {
  return Object.values(themes).map(t => ({
    name: t.name,
    displayName: t.displayName,
    description: t.description,
  }));
}

// CSS variable generator for runtime theme switching
export function themeToCSSVariables(theme: ThemeTokens): Record<string, string> {
  return {
    '--bg-primary': theme.colors.bg.primary,
    '--bg-secondary': theme.colors.bg.secondary,
    '--bg-tertiary': theme.colors.bg.tertiary,
    '--bg-elevated': theme.colors.bg.elevated,
    '--bg-sunken': theme.colors.bg.sunken,
    '--text-primary': theme.colors.text.primary,
    '--text-secondary': theme.colors.text.secondary,
    '--text-muted': theme.colors.text.muted,
    '--text-accent': theme.colors.text.accent,
    '--text-inverse': theme.colors.text.inverse,
    '--accent-primary': theme.colors.accent.primary,
    '--accent-secondary': theme.colors.accent.secondary,
    '--accent-glow': theme.colors.accent.glow,
    '--border-subtle': theme.colors.border.subtle,
    '--border-default': theme.colors.border.default,
    '--border-strong': theme.colors.border.strong,
    '--font-display': theme.typography.fontFamily.display,
    '--font-body': theme.typography.fontFamily.body,
    '--font-mono': theme.typography.fontFamily.mono,
    '--radius-sm': theme.radius.sm,
    '--radius-md': theme.radius.md,
    '--radius-lg': theme.radius.lg,
    '--radius-xl': theme.radius.xl,
    '--shadow-subtle': theme.shadows.subtle,
    '--shadow-default': theme.shadows.default,
    '--shadow-elevated': theme.shadows.elevated,
    '--shadow-glow': theme.shadows.glow,
    '--duration-fast': theme.motion.duration.fast,
    '--duration-normal': theme.motion.duration.normal,
    '--duration-slow': theme.motion.duration.slow,
    '--duration-ritual': theme.motion.duration.ritual,
    '--easing-default': theme.motion.easing.default,
    '--easing-gentle': theme.motion.easing.gentle,
  };
}

// Recommended theme by modality
export const modalityThemeMap: Record<string, ThemePackage> = {
  astrology: 'celestial',
  bodywork: 'terra',
  coaching: 'ember',
  therapy: 'haven',
  shamanic: 'mystic',
  default: 'sanctuary',
};

export function getRecommendedTheme(modality: string): ThemePackage {
  return modalityThemeMap[modality] || 'sanctuary';
}

// ============================================
// CONTEXT-BASED THEME RECOMMENDATIONS
// ============================================

/**
 * Theme recommendations by page context.
 *
 * The Stellium system supports two primary aesthetic directions:
 *
 * 1. SOULLAB (Light) - For consumer-facing B2C pages
 *    - Warm off-white backgrounds, sage/violet/gold accents
 *    - Lighter typography weights, wider letter-spacing
 *    - Use for: membership, community, journal, onboarding, marketing
 *
 * 2. DARK THEMES (Immersive) - For atmospheric practitioner tools
 *    - Deep backgrounds with glowing accents
 *    - Preserved particles, sacred geometry, star fields
 *    - Use for: Oracle, Astrology charts, Labtools, practitioner workspaces
 */
export type PageContext =
  | 'consumer'          // B2C pages (membership, community, marketing)
  | 'practitioner'      // B2B practitioner workspaces
  | 'immersive'         // Atmospheric tools (Oracle, Astrology)
  | 'journal'           // Personal reflection spaces
  | 'onboarding';       // Welcome/signup flows

export const contextThemeMap: Record<PageContext, ThemePackage> = {
  consumer: 'soullab',
  practitioner: 'sanctuary',
  immersive: 'celestial',
  journal: 'soullab',
  onboarding: 'soullab',
};

export function getThemeByContext(context: PageContext): ThemePackage {
  return contextThemeMap[context] || 'soullab';
}

/**
 * Specific page recommendations
 */
export const pageThemeMap: Record<string, ThemePackage> = {
  // Consumer / B2C - Use Soullab
  '/maia/membership': 'soullab',
  '/maia/community': 'soullab',
  '/maia/community/commons': 'soullab',
  '/labtools/journal': 'soullab',
  '/begin': 'soullab',
  '/intro-maia': 'soullab',
  '/onboarding': 'soullab',
  '/signin': 'soullab',

  // Immersive / Atmospheric - Use dark themes
  '/oracle': 'celestial',
  '/astrology': 'celestial',
  '/labtools': 'sanctuary',

  // Practitioner workspaces - Use contextual dark
  '/practitioner': 'sanctuary',
  '/worldcraft': 'sanctuary',
};

export function getThemeForPage(pathname: string): ThemePackage {
  // Exact match first
  if (pageThemeMap[pathname]) {
    return pageThemeMap[pathname];
  }

  // Prefix match
  for (const [path, theme] of Object.entries(pageThemeMap)) {
    if (pathname.startsWith(path)) {
      return theme;
    }
  }

  // Default to soullab for consumer experience
  return 'soullab';
}
