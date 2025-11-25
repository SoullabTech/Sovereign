/**
 * Circadian Rhythm - Living Color System
 *
 * Not a dark mode toggle. A breathing rhythm that follows the sun.
 * Colors drift with time of day, creating a natural nervous system for the platform.
 *
 * Philosophy:
 * - Day Mode (6am-8pm): Pale backgrounds, warm highlights
 * - Night Mode (8pm-6am): Near-black base with indigo/gold accents
 * - Transition: 3-second fade, ambient light detection
 * - Typography: Slightly cooler at night for calm
 */

export interface CircadianPalette {
  // Base colors
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  // Elemental colors (adjusted for time of day)
  fire: { primary: string; accent: string; glow: string };
  water: { primary: string; accent: string; glow: string };
  earth: { primary: string; accent: string; glow: string };
  air: { primary: string; accent: string; glow: string };
  aether: { primary: string; accent: string; glow: string };
  // Transition duration
  transitionDuration: string;
}

/**
 * Detect current time of day
 */
export function getTimePhase(): 'dawn' | 'day' | 'dusk' | 'night' {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 8) return 'dawn';
  if (hour >= 8 && hour < 18) return 'day';
  if (hour >= 18 && hour < 21) return 'dusk';
  return 'night';
}

/**
 * Check if currently in day mode
 */
export function isDayMode(): boolean {
  const hour = new Date().getHours();
  return hour >= 6 && hour < 20;
}

/**
 * Get circadian color palette based on current time
 */
export function getCircadianPalette(): CircadianPalette {
  const isDay = isDayMode();

  if (isDay) {
    // Day Mode - Pale backgrounds, warm highlights
    return {
      background: {
        primary: '#fafaf9',      // stone-50
        secondary: '#fef3c7',    // amber-50/20
        tertiary: '#f5f5f4',     // stone-100
      },
      text: {
        primary: '#1c1917',      // stone-900
        secondary: '#57534e',    // stone-600
        tertiary: '#78716c',     // stone-500
      },
      fire: {
        primary: '#C85450',
        accent: '#F5A362',
        glow: 'rgba(200, 84, 80, 0.2)',
      },
      water: {
        primary: '#6B9BD1',
        accent: '#8BADD6',
        glow: 'rgba(107, 155, 209, 0.2)',
      },
      earth: {
        primary: '#7A9A65',
        accent: '#A8C69F',
        glow: 'rgba(122, 154, 101, 0.2)',
      },
      air: {
        primary: '#D4B896',
        accent: '#E8D4BF',
        glow: 'rgba(212, 184, 150, 0.2)',
      },
      aether: {
        primary: '#9B8FAA',
        accent: '#B5A8C1',
        glow: 'rgba(155, 143, 170, 0.2)',
      },
      transitionDuration: '3000ms',
    };
  } else {
    // Night Mode - Near-black base with indigo/gold accents
    return {
      background: {
        primary: '#0a0a0f',      // Deep night
        secondary: '#1a1a2e',    // Indigo dark
        tertiary: '#16213e',     // Blue-gray night
      },
      text: {
        primary: '#e7e5e4',      // stone-200
        secondary: '#a8a29e',    // stone-400
        tertiary: '#78716c',     // stone-500
      },
      fire: {
        primary: '#F5A362',      // Warmer at night
        accent: '#C85450',
        glow: 'rgba(245, 163, 98, 0.3)',
      },
      water: {
        primary: '#8BADD6',      // Softer at night
        accent: '#3D5A80',
        glow: 'rgba(139, 173, 214, 0.3)',
      },
      earth: {
        primary: '#A8C69F',      // Gentler at night
        accent: '#5F7A4F',
        glow: 'rgba(168, 198, 159, 0.3)',
      },
      air: {
        primary: '#E8D4BF',      // Lighter at night
        accent: '#B8997A',
        glow: 'rgba(232, 212, 191, 0.3)',
      },
      aether: {
        primary: '#B5A8C1',      // Mystical glow
        accent: '#7D6E8F',
        glow: 'rgba(181, 168, 193, 0.3)',
      },
      transitionDuration: '3000ms',
    };
  }
}

/**
 * Get Tailwind classes for circadian backgrounds
 */
export function getCircadianBgClasses(): string {
  return isDayMode()
    ? 'bg-gradient-to-b from-stone-50 via-amber-50/20 to-stone-100'
    : 'bg-gradient-to-b from-[#0a0a0f] via-[#1a1a2e] to-[#16213e]';
}

/**
 * Get Tailwind classes for circadian text
 */
export function getCircadianTextClasses(variant: 'primary' | 'secondary' | 'tertiary' = 'primary'): string {
  const isDay = isDayMode();

  const variants = {
    primary: isDay ? 'text-stone-900' : 'text-stone-200',
    secondary: isDay ? 'text-stone-600' : 'text-stone-400',
    tertiary: isDay ? 'text-stone-500' : 'text-stone-500',
  };

  return variants[variant];
}

/**
 * Get elemental color for current time of day
 */
export function getElementalColor(
  element: 'fire' | 'water' | 'earth' | 'air' | 'aether',
  variant: 'primary' | 'accent' | 'glow' = 'primary'
): string {
  const palette = getCircadianPalette();
  return palette[element][variant];
}

/**
 * React hook for circadian awareness
 */
export function useCircadianMode() {
  if (typeof window === 'undefined') return true; // SSR default to day

  const [isDay, setIsDay] = React.useState(isDayMode());

  React.useEffect(() => {
    // Update on mount
    setIsDay(isDayMode());

    // Check every minute for time changes
    const interval = setInterval(() => {
      setIsDay(isDayMode());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return isDay;
}

// For server components
import React from 'react';
