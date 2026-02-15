'use client';

interface MiniSparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  fill?: boolean;
}

export function MiniSparkline({
  data,
  width = 120,
  height = 32,
  color = '#f59e0b',
  fill = false,
}: MiniSparklineProps) {
  if (!data || data.length === 0) {
    // Empty state: flat line at center
    return (
      <svg width={width} height={height} className="w-full">
        <line
          x1={0}
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke={color}
          strokeWidth={1}
          opacity={0.3}
        />
      </svg>
    );
  }

  // Normalize data to fit within viewBox
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1; // Avoid division by zero

  const padding = 2;
  const chartHeight = height - padding * 2;
  const chartWidth = width;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * chartWidth;
    const normalizedValue = (value - min) / range;
    const y = chartHeight - normalizedValue * chartHeight + padding;
    return { x, y };
  });

  // Create SVG path
  const pathData = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');

  // Create fill path (if enabled)
  const fillPathData = fill
    ? `${pathData} L ${width} ${height} L 0 ${height} Z`
    : '';

  return (
    <svg width={width} height={height} className="w-full" viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <linearGradient id="sparkline-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0.05} />
        </linearGradient>
      </defs>

      {fill && fillPathData && (
        <path
          d={fillPathData}
          fill="url(#sparkline-gradient)"
        />
      )}

      <path
        d={pathData}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
