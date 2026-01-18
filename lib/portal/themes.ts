/**
 * SOULLAB PORTAL THEMES
 *
 * 5 Distinct visual themes inspired by high-end astrology sites
 * blended with Soullab's warm, conscious aesthetic
 *
 * Inspirations:
 * - costarastrology.com: Clean, minimalist, high-end luxury
 * - chani.com: Modern app aesthetic, accessible warmth
 * - melooha.com: Artistic, ethereal, visually rich
 */

export interface PortalTheme {
  id: string;
  name: string;
  description: string;
  preview: string; // Short description for selection UI

  colors: {
    // Backgrounds
    background: string;
    surface: string;
    surfaceAlt: string;

    // Accents
    primary: string;
    secondary: string;
    accent: string;

    // Text
    text: string;
    textMuted: string;
    textLight: string;

    // UI
    border: string;
    borderLight: string;

    // States
    success: string;
    error: string;
  };

  typography: {
    displayFont: string;
    bodyFont: string;
    displayWeight: string;
    headingStyle: 'uppercase' | 'capitalize' | 'normal';
    letterSpacing: string;
  };

  borderRadius: {
    small: string;
    medium: string;
    large: string;
    full: string;
  };

  shadows: {
    soft: string;
    medium: string;
    elevated: string;
  };

  // Theme-specific characteristics
  characteristics: {
    glassmorphism: boolean;
    gradients: boolean;
    decorativeElements: 'minimal' | 'moderate' | 'rich';
    imageStyle: 'rounded' | 'sharp' | 'organic';
  };
}

/**
 * THEME 1: TERRA NOVA
 *
 * Warm, earthy, grounded - like costarastrology with more soul
 * Best for: Healers, earth-based practitioners, grounded energy workers
 */
export const terraNova: PortalTheme = {
  id: 'terra-nova',
  name: 'Terra Nova',
  description: 'Warm earth tones meet celestial wisdom. Grounded, nurturing, authentic.',
  preview: 'Earthy & Grounded',

  colors: {
    background: '#FFFEF9', // Warm ivory
    surface: '#F8F4EF', // Soft linen
    surfaceAlt: '#E8E0D5', // Sandy beige

    primary: '#B87351', // Terracotta
    secondary: '#4A5D4A', // Forest green
    accent: '#C9A962', // Warm gold

    text: '#3D3532', // Deep brown
    textMuted: '#6B6460', // Muted brown
    textLight: '#9A938A', // Warm gray

    border: '#E8E0D5',
    borderLight: '#F0EAE2',

    success: '#4A5D4A',
    error: '#B85C5C',
  },

  typography: {
    displayFont: "'Cormorant Garamond', serif",
    bodyFont: "'Jost', sans-serif",
    displayWeight: '300',
    headingStyle: 'normal',
    letterSpacing: '0.02em',
  },

  borderRadius: {
    small: '0.5rem',
    medium: '1rem',
    large: '1.5rem',
    full: '9999px',
  },

  shadows: {
    soft: '0 2px 8px rgba(61, 53, 50, 0.06)',
    medium: '0 4px 16px rgba(61, 53, 50, 0.08)',
    elevated: '0 8px 32px rgba(61, 53, 50, 0.12)',
  },

  characteristics: {
    glassmorphism: false,
    gradients: true,
    decorativeElements: 'moderate',
    imageStyle: 'rounded',
  },
};

/**
 * THEME 2: COSMIC MINIMAL
 *
 * Clean, airy, sophisticated - pure costarastrology luxury
 * Best for: High-end practitioners, minimalist aesthetic lovers
 */
export const cosmicMinimal: PortalTheme = {
  id: 'cosmic-minimal',
  name: 'Cosmic Minimal',
  description: 'Pure, refined, spacious. Where silence speaks volumes.',
  preview: 'Clean & Luxurious',

  colors: {
    background: '#FFFFFF',
    surface: '#FAFAFA',
    surfaceAlt: '#F5F5F5',

    primary: '#1A1A1A', // Near black
    secondary: '#8B7355', // Warm taupe
    accent: '#C4A77D', // Muted gold

    text: '#1A1A1A',
    textMuted: '#666666',
    textLight: '#999999',

    border: '#E5E5E5',
    borderLight: '#F0F0F0',

    success: '#4A6741',
    error: '#C4574B',
  },

  typography: {
    displayFont: "'Playfair Display', serif",
    bodyFont: "'Inter', sans-serif",
    displayWeight: '400',
    headingStyle: 'normal',
    letterSpacing: '0.01em',
  },

  borderRadius: {
    small: '0.25rem',
    medium: '0.5rem',
    large: '0.75rem',
    full: '9999px',
  },

  shadows: {
    soft: '0 1px 3px rgba(0, 0, 0, 0.04)',
    medium: '0 4px 12px rgba(0, 0, 0, 0.06)',
    elevated: '0 12px 40px rgba(0, 0, 0, 0.08)',
  },

  characteristics: {
    glassmorphism: false,
    gradients: false,
    decorativeElements: 'minimal',
    imageStyle: 'sharp',
  },
};

/**
 * THEME 3: MYSTIC GARDEN
 *
 * Lush, botanical, ethereal - melooha's artistic richness
 * Best for: Plant medicine workers, nature mystics, botanical healers
 */
export const mysticGarden: PortalTheme = {
  id: 'mystic-garden',
  name: 'Mystic Garden',
  description: 'Where nature meets the numinous. Lush, alive, enchanting.',
  preview: 'Botanical & Ethereal',

  colors: {
    background: '#F9FAF5', // Sage white
    surface: '#F2F5EC', // Soft sage
    surfaceAlt: '#E8EDE0', // Muted green

    primary: '#3D5A45', // Deep forest
    secondary: '#9B7B6C', // Dusty rose
    accent: '#B8956B', // Antique gold

    text: '#2C3E2F', // Forest black
    textMuted: '#5C6B5E', // Muted green
    textLight: '#8A958C', // Sage gray

    border: '#D9E1D3',
    borderLight: '#E8EDE0',

    success: '#4A6741',
    error: '#A65D57',
  },

  typography: {
    displayFont: "'Spectral', serif",
    bodyFont: "'Source Sans 3', sans-serif",
    displayWeight: '300',
    headingStyle: 'normal',
    letterSpacing: '0.015em',
  },

  borderRadius: {
    small: '0.75rem',
    medium: '1.25rem',
    large: '2rem',
    full: '9999px',
  },

  shadows: {
    soft: '0 2px 10px rgba(61, 90, 69, 0.06)',
    medium: '0 6px 20px rgba(61, 90, 69, 0.08)',
    elevated: '0 16px 48px rgba(61, 90, 69, 0.1)',
  },

  characteristics: {
    glassmorphism: true,
    gradients: true,
    decorativeElements: 'rich',
    imageStyle: 'organic',
  },
};

/**
 * THEME 4: CELESTIAL ROSE
 *
 * Soft, feminine, dreamy - blush tones with cosmic depth
 * Best for: Divine feminine practitioners, intuitive readers, heart-centered healers
 */
export const celestialRose: PortalTheme = {
  id: 'celestial-rose',
  name: 'Celestial Rose',
  description: 'Soft as moonlight, deep as love. Tender, intuitive, radiant.',
  preview: 'Feminine & Dreamy',

  colors: {
    background: '#FFFBFA', // Rose white
    surface: '#FDF6F4', // Blush cream
    surfaceAlt: '#F5E8E4', // Dusty rose

    primary: '#C48B7F', // Terracotta rose
    secondary: '#7B6B8A', // Muted lavender
    accent: '#D4A574', // Soft gold

    text: '#4A3F44', // Deep mauve
    textMuted: '#7A6E72', // Muted mauve
    textLight: '#A89A9E', // Rose gray

    border: '#EAD9D4',
    borderLight: '#F5E8E4',

    success: '#7B9B7A',
    error: '#C47B7B',
  },

  typography: {
    displayFont: "'Tenor Sans', serif",
    bodyFont: "'Nunito Sans', sans-serif",
    displayWeight: '400',
    headingStyle: 'normal',
    letterSpacing: '0.02em',
  },

  borderRadius: {
    small: '0.625rem',
    medium: '1.25rem',
    large: '2rem',
    full: '9999px',
  },

  shadows: {
    soft: '0 2px 12px rgba(196, 139, 127, 0.08)',
    medium: '0 6px 24px rgba(196, 139, 127, 0.1)',
    elevated: '0 12px 48px rgba(196, 139, 127, 0.12)',
  },

  characteristics: {
    glassmorphism: true,
    gradients: true,
    decorativeElements: 'moderate',
    imageStyle: 'rounded',
  },
};

/**
 * THEME 5: MIDNIGHT ALCHEMY
 *
 * Deep, mysterious, transformative - dark mode with warmth
 * Best for: Shadow workers, alchemists, depth psychologists
 */
export const midnightAlchemy: PortalTheme = {
  id: 'midnight-alchemy',
  name: 'Midnight Alchemy',
  description: 'The gold hidden in darkness. Transformative, mysterious, powerful.',
  preview: 'Dark & Mystical',

  colors: {
    background: '#1A1915', // Warm black
    surface: '#252320', // Dark warm gray
    surfaceAlt: '#2E2B27', // Lighter warm gray

    primary: '#D4A574', // Alchemical gold
    secondary: '#8B7355', // Bronze
    accent: '#C9A962', // Bright gold

    text: '#F5F2EC', // Warm white
    textMuted: '#B8B3A9', // Muted cream
    textLight: '#7A7670', // Warm gray

    border: '#3A3733',
    borderLight: '#2E2B27',

    success: '#7B9B6A',
    error: '#C47B6B',
  },

  typography: {
    displayFont: "'Cinzel', serif",
    bodyFont: "'Raleway', sans-serif",
    displayWeight: '400',
    headingStyle: 'capitalize',
    letterSpacing: '0.04em',
  },

  borderRadius: {
    small: '0.375rem',
    medium: '0.75rem',
    large: '1rem',
    full: '9999px',
  },

  shadows: {
    soft: '0 2px 8px rgba(0, 0, 0, 0.3)',
    medium: '0 4px 16px rgba(0, 0, 0, 0.4)',
    elevated: '0 8px 32px rgba(0, 0, 0, 0.5)',
  },

  characteristics: {
    glassmorphism: true,
    gradients: true,
    decorativeElements: 'moderate',
    imageStyle: 'rounded',
  },
};

// All themes
export const portalThemes: PortalTheme[] = [
  terraNova,
  cosmicMinimal,
  mysticGarden,
  celestialRose,
  midnightAlchemy,
];

// Default theme for new portals
export const defaultTheme = terraNova;

// Get theme by ID
export function getThemeById(id: string): PortalTheme {
  return portalThemes.find(t => t.id === id) || defaultTheme;
}

// Theme categories for easier selection
export const themeCategories = [
  {
    name: 'Warm & Grounded',
    themes: ['terra-nova'],
    description: 'Earth-connected, nurturing energy',
  },
  {
    name: 'Clean & Refined',
    themes: ['cosmic-minimal'],
    description: 'Minimalist luxury, sophisticated',
  },
  {
    name: 'Nature & Mystical',
    themes: ['mystic-garden'],
    description: 'Botanical, ethereal, alive',
  },
  {
    name: 'Feminine & Soft',
    themes: ['celestial-rose'],
    description: 'Heart-centered, intuitive',
  },
  {
    name: 'Deep & Transformative',
    themes: ['midnight-alchemy'],
    description: 'Shadow work, alchemy, depth',
  },
];

/**
 * Generate CSS variables from theme
 */
export function themeToCSSVariables(theme: PortalTheme): Record<string, string> {
  return {
    '--color-background': theme.colors.background,
    '--color-surface': theme.colors.surface,
    '--color-surface-alt': theme.colors.surfaceAlt,
    '--color-primary': theme.colors.primary,
    '--color-secondary': theme.colors.secondary,
    '--color-accent': theme.colors.accent,
    '--color-text': theme.colors.text,
    '--color-text-muted': theme.colors.textMuted,
    '--color-text-light': theme.colors.textLight,
    '--color-border': theme.colors.border,
    '--color-border-light': theme.colors.borderLight,
    '--color-success': theme.colors.success,
    '--color-error': theme.colors.error,
    '--font-display': theme.typography.displayFont,
    '--font-body': theme.typography.bodyFont,
    '--font-display-weight': theme.typography.displayWeight,
    '--radius-small': theme.borderRadius.small,
    '--radius-medium': theme.borderRadius.medium,
    '--radius-large': theme.borderRadius.large,
    '--radius-full': theme.borderRadius.full,
    '--shadow-soft': theme.shadows.soft,
    '--shadow-medium': theme.shadows.medium,
    '--shadow-elevated': theme.shadows.elevated,
  };
}

/**
 * For Loralee Geil specifically
 * Based on her identity: Musician, Healer, Astrologer
 * Recommended theme: Terra Nova (earthy warmth) or Celestial Rose (feminine intuitive)
 */
export const loraleeRecommendedTheme = terraNova;
