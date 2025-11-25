/**
 * Spiralogic Seasonal Color Palettes
 *
 * Inspired by natural cycles and elemental wisdom.
 * Each season has its own palette while maintaining Spiralogic's sacred depth.
 *
 * Design Philosophy:
 * - Warm color temperatures (even "cool" colors have warmth)
 * - Sophisticated earthy tones (not flat or garish)
 * - Depth through layered opacity and gradients
 * - Each season aligns with elemental energy
 *
 * Usage: User can choose seasonal theme, or auto-switch based on calendar
 */

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

interface ColorPalette {
  name: string;
  description: string;
  element: string; // Elemental association

  // Core colors
  background: {
    primary: string;      // Main background
    secondary: string;    // Cards, panels
    tertiary: string;     // Subtle highlights
  };

  text: {
    primary: string;      // Main text (user + MAIA)
    secondary: string;    // Labels, captions
    muted: string;        // Timestamps, metadata
    user: string;         // User-specific text color
    maia: string;         // MAIA-specific text color
  };

  accent: {
    primary: string;      // Main brand color
    secondary: string;    // Secondary actions
    tertiary: string;     // Subtle accents
    glow: string;         // Holoflower glow
  };

  // Semantic colors
  success: string;
  warning: string;
  error: string;
  info: string;

  // Elemental colors (for holoflower)
  elements: {
    fire: string;
    water: string;
    earth: string;
    air: string;
    aether: string;
  };

  // Gradients (for depth and richness)
  gradients: {
    background: string;   // Subtle background gradient
    accent: string;       // Accent gradient
    holoflower: string;   // Holoflower radiance
  };
}

/**
 * SPRING: Awakening, Fresh Growth, Air + Water
 *
 * Palette: Fresh greens, cherry blossom pinks, morning dew blues
 * Feeling: Renewal, clarity, gentle emergence
 */
export const springPalette: ColorPalette = {
  name: 'Spring Awakening',
  description: 'Fresh growth, morning dew, cherry blossoms',
  element: 'Air + Water',

  background: {
    primary: '#f8f7f5',      // Warm off-white with hint of green
    secondary: '#f0f4f0',    // Soft sage
    tertiary: '#fef6f7'      // Blush white
  },

  text: {
    primary: '#2a3428',      // Deep forest green
    secondary: '#5a6856',    // Moss
    muted: '#8a9888',        // Sage
    user: '#3a4438',         // User messages: grounded green
    maia: '#4a3448'          // MAIA messages: subtle plum (wisdom)
  },

  accent: {
    primary: '#7fb069',      // Fresh spring green
    secondary: '#e8b4b8',    // Cherry blossom pink
    tertiary: '#b8d4e0',     // Morning sky blue
    glow: '#c9e4ca'          // Soft green glow
  },

  success: '#6fa568',
  warning: '#e8b86d',
  error: '#d88080',
  info: '#7eb3d4',

  elements: {
    fire: '#f4a460',         // Warm apricot
    water: '#7eb3d4',        // Sky blue
    earth: '#8b9a7a',        // Fresh grass
    air: '#c9dde0',          // Clear sky
    aether: '#d4c9e8'        // Lavender mist
  },

  gradients: {
    background: 'linear-gradient(to bottom, #f8f7f5 0%, #f0f4f0 100%)',
    accent: 'linear-gradient(135deg, #7fb069 0%, #b8d4e0 100%)',
    holoflower: 'radial-gradient(circle, rgba(201, 228, 202, 0.6) 0%, rgba(184, 212, 224, 0.3) 50%, transparent 100%)'
  }
};

/**
 * SUMMER: Fullness, Golden Light, Fire + Earth
 *
 * Palette: Golden ambers, deep blues, warm terracotta
 * Feeling: Abundance, radiance, embodiment
 */
export const summerPalette: ColorPalette = {
  name: 'Summer Radiance',
  description: 'Golden hour, deep ocean, terracotta earth',
  element: 'Fire + Earth',

  background: {
    primary: '#faf7f2',      // Warm cream
    secondary: '#f5ede1',    // Sand
    tertiary: '#f2e8d5'      // Golden wheat
  },

  text: {
    primary: '#2e2419',      // Deep warm brown
    secondary: '#5a4a3a',    // Rich earth
    muted: '#8a7a6a',        // Warm gray
    user: '#3e3429',         // User: grounded earth
    maia: '#4a3428'          // MAIA: warm wisdom
  },

  accent: {
    primary: '#d4a574',      // Golden amber (current Spiralogic!)
    secondary: '#d88860',    // Terracotta
    tertiary: '#6b8e9f',     // Deep ocean blue
    glow: '#e8c9a1'          // Warm amber glow
  },

  success: '#a58f6f',
  warning: '#e8a86d',
  error: '#d46860',
  info: '#6b8e9f',

  elements: {
    fire: '#e89860',         // Warm flame
    water: '#5a7e8f',        // Deep ocean
    earth: '#9a8070',        // Rich soil
    air: '#b8c4c9',          // Summer haze
    aether: '#d4c4b8'        // Warm sand
  },

  gradients: {
    background: 'linear-gradient(to bottom, #faf7f2 0%, #f5ede1 100%)',
    accent: 'linear-gradient(135deg, #d4a574 0%, #e89860 100%)',
    holoflower: 'radial-gradient(circle, rgba(232, 201, 161, 0.6) 0%, rgba(212, 165, 116, 0.3) 50%, transparent 100%)'
  }
};

/**
 * AUTUMN: Transformation, Deep Richness, Fire + Water
 *
 * Palette: Burnt oranges, rich burgundies, deep teals
 * Feeling: Harvest, release, alchemy
 */
export const autumnPalette: ColorPalette = {
  name: 'Autumn Alchemy',
  description: 'Burnt leaves, burgundy wine, twilight sky',
  element: 'Fire + Water',

  background: {
    primary: '#f7f3ed',      // Warm parchment
    secondary: '#f0e6d8',    // Aged paper
    tertiary: '#ede3d3'      // Wheat
  },

  text: {
    primary: '#3a2820',      // Deep brown
    secondary: '#5a4838',    // Rich earth
    muted: '#8a7868',        // Warm gray-brown
    user: '#4a3830',         // User: grounded
    maia: '#523838'          // MAIA: burgundy wisdom
  },

  accent: {
    primary: '#c86850',      // Burnt orange
    secondary: '#9a5050',    // Burgundy
    tertiary: '#5a7873',     // Deep teal
    glow: '#d89880'          // Warm glow
  },

  success: '#8a7060',
  warning: '#d89060',
  error: '#c85850',
  info: '#6a8883',

  elements: {
    fire: '#d87850',         // Burning leaves
    water: '#5a7873',        // Deep lake
    earth: '#9a7860',        // Autumn soil
    air: '#a89888',          // Misty air
    aether: '#b89888'        // Twilight
  },

  gradients: {
    background: 'linear-gradient(to bottom, #f7f3ed 0%, #f0e6d8 100%)',
    accent: 'linear-gradient(135deg, #c86850 0%, #9a5050 100%)',
    holoflower: 'radial-gradient(circle, rgba(216, 152, 128, 0.6) 0%, rgba(200, 104, 80, 0.3) 50%, transparent 100%)'
  }
};

/**
 * WINTER: Stillness, Crystal Clarity, Water + Air
 *
 * Palette: Cool silvers, deep purples, icy blues (all with warmth)
 * Feeling: Depth, reflection, inner light
 */
export const winterPalette: ColorPalette = {
  name: 'Winter Depths',
  description: 'Silver moonlight, deep purple, crystalline blue',
  element: 'Water + Air',

  background: {
    primary: '#f5f5f7',      // Soft silver-white
    secondary: '#eeeef4',    // Lavender gray
    tertiary: '#f0f0f8'      // Subtle purple-white
  },

  text: {
    primary: '#2a2838',      // Deep purple-black
    secondary: '#4a4858',    // Charcoal
    muted: '#7a788a',        // Cool gray
    user: '#3a3848',         // User: grounded purple
    maia: '#3a2848'          // MAIA: deep wisdom purple
  },

  accent: {
    primary: '#8878a8',      // Soft purple
    secondary: '#6888a8',    // Cool blue
    tertiary: '#a8a8b8',     // Silver
    glow: '#b8a8d8'          // Purple glow
  },

  success: '#7888a8',
  warning: '#a898b8',
  error: '#a87888',
  info: '#7898b8',

  elements: {
    fire: '#b89898',         // Soft ember
    water: '#7888a8',        // Deep water
    earth: '#988890',        // Frozen earth
    air: '#b8c8d8',          // Clear winter sky
    aether: '#c8b8e8'        // Ethereal purple
  },

  gradients: {
    background: 'linear-gradient(to bottom, #f5f5f7 0%, #eeeef4 100%)',
    accent: 'linear-gradient(135deg, #8878a8 0%, #6888a8 100%)',
    holoflower: 'radial-gradient(circle, rgba(184, 168, 216, 0.6) 0%, rgba(136, 120, 168, 0.3) 50%, transparent 100%)'
  }
};

/**
 * Palette Collection
 */
export const seasonalPalettes: Record<Season, ColorPalette> = {
  spring: springPalette,
  summer: summerPalette,
  autumn: autumnPalette,
  winter: winterPalette
};

/**
 * Get current season based on month (Northern Hemisphere)
 */
export function getCurrentSeason(): Season {
  const month = new Date().getMonth(); // 0-11

  if (month >= 2 && month <= 4) return 'spring';  // Mar-May
  if (month >= 5 && month <= 7) return 'summer';  // Jun-Aug
  if (month >= 8 && month <= 10) return 'autumn'; // Sep-Nov
  return 'winter';                                 // Dec-Feb
}

/**
 * Generate CSS custom properties for a palette
 */
export function generatePaletteCSS(palette: ColorPalette): string {
  return `
:root {
  /* Backgrounds */
  --color-bg-primary: ${palette.background.primary};
  --color-bg-secondary: ${palette.background.secondary};
  --color-bg-tertiary: ${palette.background.tertiary};

  /* Text */
  --color-text-primary: ${palette.text.primary};
  --color-text-secondary: ${palette.text.secondary};
  --color-text-muted: ${palette.text.muted};
  --color-text-user: ${palette.text.user};
  --color-text-maia: ${palette.text.maia};

  /* Accents */
  --color-accent-primary: ${palette.accent.primary};
  --color-accent-secondary: ${palette.accent.secondary};
  --color-accent-tertiary: ${palette.accent.tertiary};
  --color-accent-glow: ${palette.accent.glow};

  /* Semantic */
  --color-success: ${palette.success};
  --color-warning: ${palette.warning};
  --color-error: ${palette.error};
  --color-info: ${palette.info};

  /* Elements */
  --color-fire: ${palette.elements.fire};
  --color-water: ${palette.elements.water};
  --color-earth: ${palette.elements.earth};
  --color-air: ${palette.elements.air};
  --color-aether: ${palette.elements.aether};

  /* Gradients */
  --gradient-background: ${palette.gradients.background};
  --gradient-accent: ${palette.gradients.accent};
  --gradient-holoflower: ${palette.gradients.holoflower};
}
  `.trim();
}

/**
 * Usage Example
 */
export const paletteUsageExample = `
// In your theme provider or settings
import { seasonalPalettes, getCurrentSeason, generatePaletteCSS } from '@/lib/design/seasonal-palettes';

// Auto-detect season
const currentSeason = getCurrentSeason();
const palette = seasonalPalettes[currentSeason];

// Or let user choose
const userPreferredSeason = 'autumn';
const palette = seasonalPalettes[userPreferredSeason];

// Apply to document
const style = document.createElement('style');
style.textContent = generatePaletteCSS(palette);
document.head.appendChild(style);
`;
