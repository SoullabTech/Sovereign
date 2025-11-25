/**
 * AIN AMBER DESIGN SYSTEM
 * =======================
 * The sacred color palette and design principles for Soullab
 * NO PURPLE - Only amber, black, and sacred geometry
 */

export const AIN_AMBER_COLORS = {
  // Primary Amber Spectrum
  amber: {
    50: '#FEF3E2',   // Lightest amber - barely visible
    100: '#FDE8CC',  // Very light amber
    200: '#FBDBA7',  // Light amber
    300: '#F9CD82',  // Soft amber
    400: '#F6AD55',  // PRIMARY AMBER (main brand color)
    500: '#F59E0B',  // Medium amber
    600: '#D97706',  // Deep amber
    700: '#B45309',  // Dark amber
    800: '#92400E',  // Very dark amber
    900: '#78350F',  // Darkest amber
  },

  // Background Colors (replacing purple)
  background: {
    primary: '#0A0A0A',     // Near black
    secondary: '#1A1A1A',   // Very dark gray
    tertiary: '#2A2A2A',    // Dark gray
    sacred: '#1a1f3a',      // Deep blue-black (current Maya background)
  },

  // Text Colors
  text: {
    primary: '#FEFEFE',     // Almost white
    secondary: '#E5E5E5',   // Light gray
    muted: '#A0A0A0',       // Muted gray
    amber: '#F6AD55',       // Amber for highlights
  },

  // Functional Colors
  functional: {
    error: '#DC2626',       // Red
    success: '#10B981',     // Green
    warning: '#F59E0B',     // Amber
    info: '#3B82F6',        // Blue (sparingly)
  },

  // Sacred Geometry Overlays
  sacred: {
    geometry: 'rgba(246, 173, 85, 0.02)',  // 2% amber for background patterns
    glow: 'rgba(246, 173, 85, 0.1)',       // 10% amber for glows
    pulse: 'rgba(246, 173, 85, 0.2)',      // 20% amber for pulses
    highlight: 'rgba(246, 173, 85, 0.3)',  // 30% amber for highlights
  }
};

export const AIN_AMBER_GRADIENTS = {
  // Replace purple gradients
  primary: 'linear-gradient(135deg, #F6AD55 0%, #F59E0B 100%)',
  subtle: 'linear-gradient(135deg, rgba(246, 173, 85, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%)',
  dark: 'linear-gradient(135deg, #0A0A0A 0%, #1a1f3a 100%)',
  sacred: 'linear-gradient(135deg, rgba(246, 173, 85, 0.05) 0%, transparent 100%)',
};

export const AIN_AMBER_SHADOWS = {
  sm: '0 1px 2px 0 rgba(246, 173, 85, 0.05)',
  md: '0 4px 6px -1px rgba(246, 173, 85, 0.1)',
  lg: '0 10px 15px -3px rgba(246, 173, 85, 0.1)',
  xl: '0 20px 25px -5px rgba(246, 173, 85, 0.1)',
  glow: '0 0 30px rgba(246, 173, 85, 0.3)',
};

export const AIN_AMBER_CLASSES = {
  // Backgrounds (to replace purple backgrounds)
  backgrounds: {
    primary: 'bg-black',
    secondary: 'bg-gray-900',
    sacred: 'bg-[#1a1f3a]',
    amber: 'bg-amber-500',
    amberSubtle: 'bg-amber-500/10',
  },

  // Text
  text: {
    primary: 'text-amber-50',
    secondary: 'text-amber-100',
    muted: 'text-amber-200/60',
    highlight: 'text-amber-400',
  },

  // Borders
  borders: {
    subtle: 'border-amber-500/20',
    medium: 'border-amber-500/40',
    strong: 'border-amber-500/60',
  },

  // Buttons (to replace purple buttons)
  buttons: {
    primary: 'bg-amber-500 hover:bg-amber-600 text-white',
    secondary: 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-200',
    ghost: 'hover:bg-amber-500/10 text-amber-300',
  },

  // Gradients (as Tailwind classes)
  gradients: {
    toAmber: 'bg-gradient-to-r from-amber-500/20 to-amber-600/20',
    toDark: 'bg-gradient-to-b from-black to-[#1a1f3a]',
    subtle: 'bg-gradient-to-br from-amber-500/5 to-transparent',
  }
};

/**
 * DESIGN PRINCIPLES
 */
export const AIN_AMBER_PRINCIPLES = {
  // Color Usage
  colors: {
    primary: 'Amber is the primary brand color - represents consciousness, warmth, sacred fire',
    backgrounds: 'Dark backgrounds only - black, near-black, deep blue-black',
    accents: 'Amber for all accents, highlights, and interactive elements',
    forbidden: 'NO PURPLE, NO PINK, NO BRIGHT COLORS except amber',
  },

  // Sacred Geometry
  geometry: {
    opacity: '2% maximum for background patterns',
    shapes: 'Circles, spirals, golden ratio proportions',
    animation: 'Subtle pulsing, no aggressive movement',
  },

  // Typography
  typography: {
    headers: 'Light weight, tracking-wide, amber-50',
    body: 'Regular weight, good readability, amber-100',
    muted: 'Amber-200 with 40-60% opacity',
  },

  // Interaction
  interaction: {
    hover: 'Subtle amber glow, never purple',
    focus: 'Amber ring, not blue or purple',
    active: 'Deeper amber, slight scale',
  },

  // Spacing
  spacing: {
    sacred: 'Use golden ratio (1.618) for proportions',
    breathing: 'Generous whitespace for sacred feel',
    density: 'Never cramped, always spacious',
  }
};

/**
 * Utility function to convert all purple classes to amber
 */
export function purpleToAmber(className: string): string {
  return className
    .replace(/purple/g, 'amber')
    .replace(/violet/g, 'amber')
    .replace(/indigo/g, 'amber')
    .replace(/fuchsia/g, 'amber')
    .replace(/pink/g, 'amber')
    .replace(/from-black/g, 'from-black')
    .replace(/to-[#1a1f3a]/g, 'to-[#1a1f3a]')
    .replace(/bg-gradient-to-b from-black to-black/g, 'bg-gradient-to-b from-black to-[#1a1f3a]');
}

/**
 * CSS Variables for global usage
 */
export const AIN_AMBER_CSS_VARS = `
  :root {
    --ain-amber-50: #FEF3E2;
    --ain-amber-100: #FDE8CC;
    --ain-amber-200: #FBDBA7;
    --ain-amber-300: #F9CD82;
    --ain-amber-400: #F6AD55;
    --ain-amber-500: #F59E0B;
    --ain-amber-600: #D97706;
    --ain-amber-700: #B45309;
    --ain-amber-800: #92400E;
    --ain-amber-900: #78350F;

    --ain-bg-primary: #0A0A0A;
    --ain-bg-secondary: #1A1A1A;
    --ain-bg-sacred: #1a1f3a;

    --ain-text-primary: #FEFEFE;
    --ain-text-secondary: #E5E5E5;
    --ain-text-muted: #A0A0A0;

    --ain-shadow-glow: 0 0 30px rgba(246, 173, 85, 0.3);
  }
`;

export default AIN_AMBER_COLORS;