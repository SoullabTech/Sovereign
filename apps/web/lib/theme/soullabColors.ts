/**
 * Soullab Design System Color Tokens
 * Muted, earthy palette for professional sacred technology
 */

export const soullabColors = {
  // Primary palette
  red: '#a94724',      // Terracotta - alerts, failures
  yellow: '#cea22c',   // Golden amber - highlights, active states
  green: '#6d7934',    // Sage - success, positive metrics
  blue: '#236586',     // Deep ocean - primary actions, main trends
  black: '#000000',    // Pure black - text, strong contrast
  gray: '#777777',     // Neutral gray - secondary text, dividers
  brown: '#33251d',    // Dark earth - accents, depth
  
  // Extended palette for charts
  chart: {
    primary: '#236586',    // Blue - main data lines
    secondary: '#6d7934',  // Green - secondary trends
    highlight: '#cea22c',  // Yellow - hover states, peaks
    danger: '#a94724',     // Red - errors, warnings
    neutral: '#777777',    // Gray - baselines, grids
    accent: '#33251d',     // Brown - special emphasis
  },
  
  // Semantic colors
  semantic: {
    success: '#6d7934',
    warning: '#cea22c',
    error: '#a94724',
    info: '#236586',
  },
  
  // Background gradients (subtle)
  gradients: {
    light: 'linear-gradient(135deg, #f9f9f9 0%, #ffffff 100%)',
    warm: 'linear-gradient(135deg, rgba(206,162,44,0.03) 0%, rgba(169,71,36,0.03) 100%)',
    cool: 'linear-gradient(135deg, rgba(35,101,134,0.03) 0%, rgba(109,121,52,0.03) 100%)',
    earth: 'linear-gradient(135deg, rgba(51,37,29,0.02) 0%, rgba(119,119,119,0.02) 100%)',
  },
  
  // Opacity variants
  opacity: {
    red10: 'rgba(169, 71, 36, 0.1)',
    yellow10: 'rgba(206, 162, 44, 0.1)',
    green10: 'rgba(109, 121, 52, 0.1)',
    blue10: 'rgba(35, 101, 134, 0.1)',
    gray10: 'rgba(119, 119, 119, 0.1)',
    brown10: 'rgba(51, 37, 29, 0.1)',
  }
}

// Chart color sequences for multiple data series
export const chartColorSequence = [
  soullabColors.blue,
  soullabColors.green,
  soullabColors.yellow,
  soullabColors.brown,
  soullabColors.red,
  soullabColors.gray,
]

// Tailwind-compatible class names
export const soullabTailwind = {
  text: {
    primary: 'text-[#000000]',
    secondary: 'text-[#777777]',
    accent: 'text-[#cea22c]',
    muted: 'text-[#33251d]',
  },
  bg: {
    red: 'bg-[#a94724]',
    yellow: 'bg-[#cea22c]',
    green: 'bg-[#6d7934]',
    blue: 'bg-[#236586]',
    gray: 'bg-[#777777]',
    brown: 'bg-[#33251d]',
  },
  border: {
    subtle: 'border-[#77777720]',
    accent: 'border-[#cea22c]',
    primary: 'border-[#236586]',
  }
}