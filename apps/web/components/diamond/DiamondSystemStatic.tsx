'use client';

import React from 'react';

interface DiamondSystemStaticProps {
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  className?: string;
}

export default function DiamondSystemStatic({
  size = 'md',
  showLabels = true,
  className = '',
}: DiamondSystemStaticProps) {
  const sizeClasses = {
    sm: 'w-64 h-64',
    md: 'w-96 h-96',
    lg: 'w-[600px] h-[600px]',
  };

  const facets = [
    { id: 'engage', name: 'Engage', icon: '🔥', color: '#ff6b35', x: 50, y: 10 },
    { id: 'deepen', name: 'Deepen', icon: '💧', color: '#4a90e2', x: 80, y: 30 },
    { id: 'listen', name: 'Listen', icon: '💨', color: '#e8d5a0', x: 80, y: 70 },
    { id: 'reflect', name: 'Reflect', icon: '🪞', color: '#d4b896', x: 50, y: 90 },
    { id: 'guide', name: 'Guide', icon: '🌱', color: '#7cb342', x: 20, y: 70 },
    { id: 'spiral', name: 'Spiral', icon: '🌀', color: '#9b59b6', x: 20, y: 30 },
    { id: 'evolve', name: 'Evolve', icon: '🧬', color: '#e91e63', x: 50, y: 50 },
  ];

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-radial from-[#d4b896]/10 via-transparent to-transparent blur-2xl" />

      {/* SVG Diamond */}
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        style={{ filter: 'drop-shadow(0 0 15px rgba(212, 184, 150, 0.2))' }}
      >
        {/* Connection lines */}
        <g opacity="0.15">
          {facets.map((facet, i) =>
            facets.slice(i + 1).map((other, j) => (
              <line
                key={`line-${i}-${j}`}
                x1={facet.x}
                y1={facet.y}
                x2={other.x}
                y2={other.y}
                stroke="#d4b896"
                strokeWidth="0.15"
              />
            ))
          )}
        </g>

        {/* Facet points */}
        {facets.map((facet) => (
          <g key={facet.id}>
            {/* Glow */}
            <circle
              cx={facet.x}
              cy={facet.y}
              r={4}
              fill={facet.color}
              opacity={0.2}
            />
            {/* Point */}
            <circle cx={facet.x} cy={facet.y} r={1.5} fill={facet.color} />
          </g>
        ))}
      </svg>

      {/* Labels */}
      {showLabels &&
        facets.map((facet) => (
          <div
            key={`label-${facet.id}`}
            className="absolute"
            style={{
              left: `${facet.x}%`,
              top: `${facet.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className="flex flex-col items-center gap-0.5 bg-black/40 backdrop-blur-sm px-2 py-1 rounded">
              <div className={size === 'sm' ? 'text-sm' : 'text-base'}>
                {facet.icon}
              </div>
              <div
                className={`text-[#d4b896] font-medium tracking-wider uppercase ${
                  size === 'sm' ? 'text-[8px]' : size === 'md' ? 'text-[10px]' : 'text-xs'
                }`}
              >
                {facet.name}
              </div>
            </div>
          </div>
        ))}
    </div>
  );
}