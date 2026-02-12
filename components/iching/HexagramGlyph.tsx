'use client';

/**
 * HexagramGlyph — Renders a 6-line hexagram symbol
 *
 * Yang lines are solid. Yin lines are broken (gap in the middle).
 * Changing lines are highlighted with a distinct color.
 * Lines are rendered bottom to top (position 1 at bottom).
 */

interface HexagramGlyphProps {
  lines: boolean[];                  // 6 booleans, bottom to top. true = yang
  changingLines?: number[];          // positions (1-6) that are changing
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_CONFIG = {
  sm: { width: 32, lineHeight: 3, gap: 3, strokeWidth: 3 },
  md: { width: 48, lineHeight: 4, gap: 4, strokeWidth: 4 },
  lg: { width: 64, lineHeight: 5, gap: 5, strokeWidth: 5 },
};

export default function HexagramGlyph({
  lines,
  changingLines = [],
  size = 'md',
  className = '',
}: HexagramGlyphProps) {
  const config = SIZE_CONFIG[size];
  const changingSet = new Set(changingLines);
  const totalHeight = 6 * config.lineHeight + 5 * config.gap;

  // Render lines bottom to top (position 1 = bottom)
  const renderedLines = [...lines].reverse().map((isYang, reversedIndex) => {
    const position = 6 - reversedIndex; // position 6 at top, 1 at bottom
    const y = reversedIndex * (config.lineHeight + config.gap);
    const isChanging = changingSet.has(position);
    const color = isChanging ? '#f59e0b' : '#94a3b8'; // amber for changing, slate for stable

    if (isYang) {
      // Yang: solid line
      return (
        <rect
          key={position}
          x={0}
          y={y}
          width={config.width}
          height={config.lineHeight}
          rx={1}
          fill={color}
        />
      );
    } else {
      // Yin: broken line (two segments with gap)
      const segmentWidth = (config.width - config.gap) / 2;
      return (
        <g key={position}>
          <rect
            x={0}
            y={y}
            width={segmentWidth}
            height={config.lineHeight}
            rx={1}
            fill={color}
          />
          <rect
            x={segmentWidth + config.gap}
            y={y}
            width={segmentWidth}
            height={config.lineHeight}
            rx={1}
            fill={color}
          />
        </g>
      );
    }
  });

  return (
    <svg
      width={config.width}
      height={totalHeight}
      viewBox={`0 0 ${config.width} ${totalHeight}`}
      className={className}
      role="img"
      aria-label="Hexagram"
    >
      {renderedLines}
    </svg>
  );
}
