'use client';

/**
 * TrigramGlyph — Renders a 3-line trigram symbol
 *
 * Yang lines are solid. Yin lines are broken.
 * Lines rendered bottom to top.
 */

interface TrigramGlyphProps {
  lines: [boolean, boolean, boolean];   // bottom to top, true = yang
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

const SIZE_CONFIG = {
  sm: { width: 24, lineHeight: 3, gap: 3 },
  md: { width: 36, lineHeight: 4, gap: 4 },
  lg: { width: 48, lineHeight: 5, gap: 5 },
};

export default function TrigramGlyph({
  lines,
  size = 'md',
  color = '#94a3b8',
  className = '',
}: TrigramGlyphProps) {
  const config = SIZE_CONFIG[size];
  const totalHeight = 3 * config.lineHeight + 2 * config.gap;

  const renderedLines = [...lines].reverse().map((isYang, reversedIndex) => {
    const y = reversedIndex * (config.lineHeight + config.gap);

    if (isYang) {
      return (
        <rect
          key={reversedIndex}
          x={0}
          y={y}
          width={config.width}
          height={config.lineHeight}
          rx={1}
          fill={color}
        />
      );
    } else {
      const segmentWidth = (config.width - config.gap) / 2;
      return (
        <g key={reversedIndex}>
          <rect x={0} y={y} width={segmentWidth} height={config.lineHeight} rx={1} fill={color} />
          <rect x={segmentWidth + config.gap} y={y} width={segmentWidth} height={config.lineHeight} rx={1} fill={color} />
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
      aria-label="Trigram"
    >
      {renderedLines}
    </svg>
  );
}
