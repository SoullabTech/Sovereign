import { soullabColors } from './soullabColors'

/**
 * Soullab Gradient System
 * Pre-defined gradients combining the brand palette for backgrounds, auras, and UI elements
 */

export const soullabGradients = {
  // Primary gradients (using core 500 values)
  warmth: `linear-gradient(135deg, ${soullabColors.terracotta[500]} 0%, ${soullabColors.amber[500]} 100%)`,
  nature: `linear-gradient(135deg, ${soullabColors.sage[500]} 0%, ${soullabColors.ocean[500]} 100%)`,
  earth: `linear-gradient(135deg, ${soullabColors.terracotta[500]} 0%, ${soullabColors.sage[500]} 100%)`,
  sunset: `linear-gradient(135deg, ${soullabColors.amber[500]} 0%, ${soullabColors.ocean[500]} 100%)`,
  
  // Subtle backgrounds (using lighter shades)
  warmthSubtle: `linear-gradient(135deg, ${soullabColors.terracotta[100]} 0%, ${soullabColors.amber[100]} 100%)`,
  natureSubtle: `linear-gradient(135deg, ${soullabColors.sage[100]} 0%, ${soullabColors.ocean[100]} 100%)`,
  earthSubtle: `linear-gradient(135deg, ${soullabColors.terracotta[100]} 0%, ${soullabColors.sage[100]} 100%)`,
  sunsetSubtle: `linear-gradient(135deg, ${soullabColors.amber[100]} 0%, ${soullabColors.ocean[100]} 100%)`,
  
  // Dark mode gradients
  warmthDark: `linear-gradient(135deg, ${soullabColors.terracotta[800]} 0%, ${soullabColors.amber[800]} 100%)`,
  natureDark: `linear-gradient(135deg, ${soullabColors.sage[800]} 0%, ${soullabColors.ocean[800]} 100%)`,
  earthDark: `linear-gradient(135deg, ${soullabColors.terracotta[800]} 0%, ${soullabColors.sage[800]} 100%)`,
  sunsetDark: `linear-gradient(135deg, ${soullabColors.amber[800]} 0%, ${soullabColors.ocean[800]} 100%)`,
  
  // Radial auras (for glows and orbs)
  aura: {
    terracotta: `radial-gradient(circle at center, ${soullabColors.terracotta[400]}40 0%, transparent 70%)`,
    sage: `radial-gradient(circle at center, ${soullabColors.sage[400]}40 0%, transparent 70%)`,
    ocean: `radial-gradient(circle at center, ${soullabColors.ocean[400]}40 0%, transparent 70%)`,
    amber: `radial-gradient(circle at center, ${soullabColors.amber[400]}40 0%, transparent 70%)`,
  },
  
  // Mesh gradients (complex multi-point)
  mesh: {
    harmony: `
      radial-gradient(at 20% 30%, ${soullabColors.terracotta[300]}30 0px, transparent 50%),
      radial-gradient(at 80% 20%, ${soullabColors.sage[300]}30 0px, transparent 50%),
      radial-gradient(at 40% 60%, ${soullabColors.ocean[300]}30 0px, transparent 50%),
      radial-gradient(at 90% 70%, ${soullabColors.amber[300]}30 0px, transparent 50%)
    `,
    balance: `
      radial-gradient(at 10% 20%, ${soullabColors.sage[200]}40 0px, transparent 50%),
      radial-gradient(at 90% 80%, ${soullabColors.ocean[200]}40 0px, transparent 50%),
      radial-gradient(at 50% 50%, ${soullabColors.amber[200]}30 0px, transparent 50%)
    `,
  },
  
  // Overlays (for glass morphism effects)
  overlay: {
    light: `linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)`,
    dark: `linear-gradient(180deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.6) 100%)`,
    frosted: `linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)`,
  },
  
  // Animated gradient keyframes (for CSS animations)
  animated: {
    warmthShift: {
      '0%': `linear-gradient(135deg, ${soullabColors.terracotta[500]} 0%, ${soullabColors.amber[500]} 100%)`,
      '50%': `linear-gradient(135deg, ${soullabColors.amber[500]} 0%, ${soullabColors.terracotta[500]} 100%)`,
      '100%': `linear-gradient(135deg, ${soullabColors.terracotta[500]} 0%, ${soullabColors.amber[500]} 100%)`,
    },
    natureShift: {
      '0%': `linear-gradient(135deg, ${soullabColors.sage[500]} 0%, ${soullabColors.ocean[500]} 100%)`,
      '50%': `linear-gradient(135deg, ${soullabColors.ocean[500]} 0%, ${soullabColors.sage[500]} 100%)`,
      '100%': `linear-gradient(135deg, ${soullabColors.sage[500]} 0%, ${soullabColors.ocean[500]} 100%)`,
    },
  }
}

// Helper function to create custom gradients
export function createGradient(
  type: 'linear' | 'radial' = 'linear',
  colors: string[],
  angle: number = 135,
  stops?: number[]
): string {
  if (type === 'linear') {
    const colorStops = colors.map((color, i) => {
      const stop = stops?.[i] ?? (i * 100) / (colors.length - 1)
      return `${color} ${stop}%`
    }).join(', ')
    return `linear-gradient(${angle}deg, ${colorStops})`
  } else {
    const colorStops = colors.map((color, i) => {
      const stop = stops?.[i] ?? (i * 100) / (colors.length - 1)
      return `${color} ${stop}%`
    }).join(', ')
    return `radial-gradient(circle at center, ${colorStops})`
  }
}

// Tone-based gradients (for Attune panel)
export const toneGradients = {
  grounded: soullabGradients.earthSubtle,
  balanced: soullabGradients.natureSubtle,
  poetic: soullabGradients.warmthSubtle,
}

// Theme-based backgrounds
export const themeBackgrounds = {
  light: {
    primary: soullabGradients.warmthSubtle,
    secondary: soullabGradients.natureSubtle,
    accent: soullabGradients.sunsetSubtle,
  },
  dark: {
    primary: soullabGradients.warmthDark,
    secondary: soullabGradients.natureDark,
    accent: soullabGradients.sunsetDark,
  }
}

// Export gradient CSS classes for Tailwind extension
export const gradientClasses = {
  'gradient-warmth': soullabGradients.warmth,
  'gradient-nature': soullabGradients.nature,
  'gradient-earth': soullabGradients.earth,
  'gradient-sunset': soullabGradients.sunset,
  'gradient-warmth-subtle': soullabGradients.warmthSubtle,
  'gradient-nature-subtle': soullabGradients.natureSubtle,
  'gradient-earth-subtle': soullabGradients.earthSubtle,
  'gradient-sunset-subtle': soullabGradients.sunsetSubtle,
}