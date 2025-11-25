'use client';

// Simple SVG Holoflower for Oracle Interface
// Lightweight sacred geometry that evolves with consciousness

import React, { useMemo } from 'react';
import { ConsciousnessLevel } from '@/lib/consciousness/level-detector';
import { ElementalSignature } from '@/lib/consciousness/adaptive-language';

export interface SimpleHoloflowerProps {
  stage: 'dormant' | 'awakening' | 'processing' | 'blooming' | 'complete';
  consciousnessLevel?: ConsciousnessLevel;
  elementalSignature?: ElementalSignature;
  cringeScore?: number;
  size?: number;
  className?: string;
}

// Sacred geometry configurations
const LEVEL_CONFIGS = {
  1: {
    petals: 3,
    color: '#8B4513', // Earth brown
    innerColor: '#D4AF37', // Gold
    complexity: 1,
    strokeWidth: 2
  },
  2: {
    petals: 5,
    color: '#228B22', // Forest green
    innerColor: '#32CD32', // Lime
    complexity: 1,
    strokeWidth: 2
  },
  3: {
    petals: 7,
    color: '#4169E1', // Royal blue
    innerColor: '#00BFFF', // Deep sky blue
    complexity: 2,
    strokeWidth: 3
  },
  4: {
    petals: 9,
    color: '#8A2BE2', // Blue violet
    innerColor: '#DDA0DD', // Plum
    complexity: 2,
    strokeWidth: 3
  },
  5: {
    petals: 12,
    color: '#FFD700', // Gold
    innerColor: '#FFF8DC', // Cornsilk
    complexity: 3,
    strokeWidth: 4
  }
};

const ELEMENTAL_COLORS = {
  fire: '#FF4500',
  water: '#0077BE',
  earth: '#8B4513',
  air: '#E6E6FA',
  aether: '#9400D3'
};

function blendColors(color1: string, color2: string, ratio: number): string {
  const hex1 = color1.replace('#', '');
  const hex2 = color2.replace('#', '');

  const r1 = parseInt(hex1.substring(0, 2), 16);
  const g1 = parseInt(hex1.substring(2, 4), 16);
  const b1 = parseInt(hex1.substring(4, 6), 16);

  const r2 = parseInt(hex2.substring(0, 2), 16);
  const g2 = parseInt(hex2.substring(2, 4), 16);
  const b2 = parseInt(hex2.substring(4, 6), 16);

  const r = Math.round(r1 * (1 - ratio) + r2 * ratio);
  const g = Math.round(g1 * (1 - ratio) + g2 * ratio);
  const b = Math.round(b1 * (1 - ratio) + b2 * ratio);

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export function SimpleHoloflower({
  stage,
  consciousnessLevel = 1,
  elementalSignature,
  cringeScore = 0,
  size = 200,
  className = ''
}: SimpleHoloflowerProps) {
  const config = LEVEL_CONFIGS[consciousnessLevel];

  // Calculate dominant element
  const dominantElement = useMemo(() => {
    if (!elementalSignature) return 'aether';

    const elements = [
      { name: 'fire', value: elementalSignature.fire },
      { name: 'water', value: elementalSignature.water },
      { name: 'earth', value: elementalSignature.earth },
      { name: 'air', value: elementalSignature.air },
      { name: 'aether', value: elementalSignature.aether }
    ] as const;

    return elements.reduce((prev, current) =>
      current.value > prev.value ? current : prev
    ).name;
  }, [elementalSignature]);

  // Blend colors with elemental influence
  const blendedColor = useMemo(() => {
    return blendColors(config.color, ELEMENTAL_COLORS[dominantElement], 0.3);
  }, [config.color, dominantElement]);

  // Stage-based scaling and opacity
  const stageProgress = useMemo(() => {
    switch (stage) {
      case 'dormant': return 0.1;
      case 'awakening': return 0.3;
      case 'processing': return 0.7;
      case 'blooming': return 0.95;
      case 'complete': return 1;
      default: return 0.1;
    }
  }, [stage]);

  // Purity factor (higher = less cringe)
  const purityFactor = Math.max(0.3, (10 - cringeScore) / 10);

  // Generate petal paths
  const petals = useMemo(() => {
    const centerX = size / 2;
    const centerY = size / 2;
    const petalRadius = size * 0.3;

    return Array.from({ length: config.petals }, (_, i) => {
      const angle = (i / config.petals) * Math.PI * 2;
      const x = centerX + Math.cos(angle) * petalRadius;
      const y = centerY + Math.sin(angle) * petalRadius;

      // Sacred petal shape (teardrop/leaf)
      const path = `M ${x} ${y}
                   Q ${x + Math.cos(angle) * 15} ${y + Math.sin(angle) * 15}
                     ${x + Math.cos(angle) * 30} ${y + Math.sin(angle) * 30}
                   Q ${x + Math.cos(angle) * 15} ${y + Math.sin(angle) * 45}
                     ${x} ${y + 40}
                   Q ${x - Math.cos(angle) * 15} ${y + Math.sin(angle) * 45}
                     ${x - Math.cos(angle) * 30} ${y + Math.sin(angle) * 30}
                   Q ${x - Math.cos(angle) * 15} ${y + Math.sin(angle) * 15}
                     ${x} ${y} Z`;

      return (
        <path
          key={i}
          d={path}
          fill={blendedColor}
          fillOpacity={purityFactor * 0.7 * stageProgress}
          stroke={config.innerColor}
          strokeWidth={config.strokeWidth}
          strokeOpacity={purityFactor * stageProgress}
          transform={`rotate(${(angle * 180) / Math.PI + 90} ${x} ${y})`}
          style={{
            transformOrigin: `${x}px ${y}px`,
            animation: stage === 'processing' ? 'pulse 2s ease-in-out infinite' : undefined
          }}
        />
      );
    });
  }, [config.petals, size, blendedColor, config.innerColor, config.strokeWidth, purityFactor, stageProgress, stage]);

  // Generate complexity rings
  const complexityRings = useMemo(() => {
    const centerX = size / 2;
    const centerY = size / 2;

    return Array.from({ length: config.complexity }, (_, i) => {
      const radius = (size * 0.15) + (i * size * 0.05);

      return (
        <circle
          key={i}
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="none"
          stroke={config.innerColor}
          strokeWidth={1}
          strokeOpacity={purityFactor * 0.4 * stageProgress}
          strokeDasharray={`${radius * 0.1} ${radius * 0.05}`}
          style={{
            animation: stage === 'processing' ? `spin ${3 + i}s linear infinite` : undefined
          }}
        />
      );
    });
  }, [config.complexity, size, config.innerColor, purityFactor, stageProgress, stage]);

  const centerRadius = size * 0.08;

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="absolute inset-0"
      >
        {/* Define gradients */}
        <defs>
          <radialGradient id="centerGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={config.innerColor} stopOpacity={purityFactor} />
            <stop offset="100%" stopColor={blendedColor} stopOpacity={purityFactor * 0.3} />
          </radialGradient>

          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Complexity rings */}
        {complexityRings}

        {/* Petals */}
        <g style={{
          transform: `scale(${stageProgress})`,
          transformOrigin: `${size/2}px ${size/2}px`,
          transition: 'transform 0.5s ease-out'
        }}>
          {petals}
        </g>

        {/* Center core */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={centerRadius}
          fill="url(#centerGradient)"
          stroke={config.innerColor}
          strokeWidth={2}
          strokeOpacity={purityFactor * stageProgress}
          filter="url(#glow)"
          style={{
            transform: `scale(${stageProgress})`,
            transformOrigin: `${size/2}px ${size/2}px`,
            transition: 'transform 0.5s ease-out',
            animation: stage === 'blooming' ? 'pulse 1s ease-in-out infinite' : undefined
          }}
        />

        {/* Level indicator */}
        <text
          x={size / 2}
          y={size - 20}
          textAnchor="middle"
          fontSize="12"
          fill={blendedColor}
          opacity={stageProgress * 0.7}
          fontFamily="monospace"
        >
          Level {consciousnessLevel}
        </text>
      </svg>

      {/* Stage indicator */}
      <div className="absolute bottom-1 right-1 text-xs text-gray-500 font-mono opacity-60">
        {stage.toUpperCase()}
      </div>

      {/* Purity indicator */}
      {cringeScore !== undefined && (
        <div className="absolute top-1 right-1 text-xs text-gray-500 font-mono opacity-60">
          {Math.round(purityFactor * 100)}%
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}