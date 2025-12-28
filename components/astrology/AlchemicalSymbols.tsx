/**
 * Alchemical Elemental Symbols
 *
 * Hemisphere-based alchemy symbols for the four classical elements:
 *
 * RIGHT HEMISPHERE (No line - retrograde/receptive):
 * - Fire: △ (simple upward triangle) - Calcinatio
 * - Water: ▽ (simple downward triangle) - Solutio
 *
 * LEFT HEMISPHERE (With line - direct/active):
 * - Air: △— (upward triangle with horizontal line)
 * - Earth: ▽— (downward triangle with horizontal line)
 */

interface AlchemicalSymbolProps {
  element: 'fire' | 'water' | 'earth' | 'air';
  size?: number;
  color?: string;
  opacity?: number;
}

export function AlchemicalSymbol({
  element,
  size = 24,
  color = '#B8860B',
  opacity = 0.7
}: AlchemicalSymbolProps) {
  const halfSize = size / 2;
  const strokeWidth = size / 12;
  // Unique ID for each instance to avoid gradient conflicts
  const uniqueId = `${element}-${Math.random().toString(36).substr(2, 9)}`;

  switch (element) {
    case 'fire':
      // Simple upward triangle △ (RIGHT HEMISPHERE - no line)
      return (
        <svg width={size} height={size} viewBox="0 0 100 100">
          <path
            d="M 50 15 L 85 85 L 15 85 Z"
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinejoin="miter"
            opacity={opacity}
          />
        </svg>
      );

    case 'water':
      // Simple downward triangle ▽ (RIGHT HEMISPHERE - no line)
      return (
        <svg width={size} height={size} viewBox="0 0 100 100">
          <path
            d="M 50 85 L 15 15 L 85 15 Z"
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinejoin="miter"
            opacity={opacity}
          />
        </svg>
      );

    case 'earth':
      // Downward triangle with horizontal line ▽— (LEFT HEMISPHERE - with line)
      return (
        <svg width={size} height={size} viewBox="0 0 100 100">
          {/* Inverted triangle */}
          <path
            d="M 50 85 L 15 15 L 85 15 Z"
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinejoin="miter"
            opacity={opacity}
          />
          {/* Horizontal line through middle */}
          <line
            x1="25"
            y1="50"
            x2="75"
            y2="50"
            stroke={color}
            strokeWidth={strokeWidth}
            opacity={opacity}
          />
        </svg>
      );

    case 'air':
      // Upward triangle with horizontal line △— (LEFT HEMISPHERE - with line)
      return (
        <svg width={size} height={size} viewBox="0 0 100 100">
          {/* Upward triangle */}
          <path
            d="M 50 15 L 85 85 L 15 85 Z"
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinejoin="miter"
            opacity={opacity}
          />
          {/* Horizontal line through middle */}
          <line
            x1="25"
            y1="50"
            x2="75"
            y2="50"
            stroke={color}
            strokeWidth={strokeWidth}
            opacity={opacity}
          />
        </svg>
      );
  }
}

// Export mapping for easy reference
export const alchemicalElementMapping = {
  fire: {
    houses: [1, 5, 9],
    symbol: '△',
    hemisphere: 'Right Hemisphere',
    alchemicalOperation: 'Calcinatio',
    meaning: 'Active, ascending, transformative energy (no line - retrograde/receptive)',
    process: 'Experience → Expression → Expansion',
  },
  water: {
    houses: [4, 8, 12],
    symbol: '▽',
    hemisphere: 'Right Hemisphere',
    alchemicalOperation: 'Solutio',
    meaning: 'Receptive, descending, purifying energy (no line - retrograde/receptive)',
    process: 'Heart → Healing → Holiness',
  },
  earth: {
    houses: [10, 2, 6],
    symbol: '▽—',
    hemisphere: 'Left Hemisphere',
    alchemicalOperation: 'Coagulatio',
    meaning: 'Grounding, crystallizing, manifesting energy (with line - direct/active)',
    process: 'Mission → Means → Medicine',
  },
  air: {
    houses: [7, 11, 3],
    symbol: '△—',
    hemisphere: 'Left Hemisphere',
    alchemicalOperation: 'Sublimatio',
    meaning: 'Communicative, connecting, circulating energy (with line - direct/active)',
    process: 'Connection → Community → Consciousness',
  },
} as const;
