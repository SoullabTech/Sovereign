'use client';

import React from 'react';
import Image from 'next/image';

interface SacredGeometryBackgroundProps {
  children: React.ReactNode;
  imagePath: string; // Path relative to /public
  size?: number;
  showLabels?: boolean;
  tint?: string; // Hex color for tint overlay
  opacity?: number; // Opacity of the background image (0-1)
  label?: string; // Optional label to show at top
}

/**
 * Sacred Geometry Background - Flexible background wrapper
 *
 * Wraps any content with a sacred geometry image background.
 * Highly customizable for different images, tints, and opacities.
 */
export default function SacredGeometryBackground({
  children,
  imagePath,
  size = 800,
  showLabels = true,
  tint = '#D4A574',
  opacity = 0.35,
  label
}: SacredGeometryBackgroundProps) {
  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        overflow: 'hidden',
        background: '#F5F0E8',
        borderRadius: '8px',
        boxShadow: '0 8px 32px rgba(139, 125, 107, 0.15)'
      }}
    >
      {/* Sacred Geometry Background - Full Bleed */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0
        }}
      >
        <Image
          src={imagePath}
          alt="Sacred Geometry Background"
          fill
          style={{
            objectFit: 'cover',
            objectPosition: 'center',
            opacity: opacity
          }}
          priority
        />
      </div>

      {/* Tint Overlay - Creates the sacred glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          background: `radial-gradient(circle at center,
            ${tint}15 0%,
            ${tint}25 40%,
            ${tint}35 70%,
            ${tint}20 100%)`,
          mixBlendMode: 'multiply',
          pointerEvents: 'none'
        }}
      />

      {/* Soft inner glow to lift the center */}
      <div
        style={{
          position: 'absolute',
          inset: '20%',
          zIndex: 2,
          background: 'radial-gradient(circle, rgba(255,255,255,0.6) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none'
        }}
      />

      {/* Content - Centered */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 10,
          width: '50%',
          height: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          filter: 'drop-shadow(0 4px 20px rgba(139, 125, 107, 0.3))'
        }}
      >
        {children}
      </div>

      {/* Optional Labels */}
      {showLabels && label && (
        <div
          style={{
            position: 'absolute',
            top: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            color: '#8B7D6B',
            fontSize: '13px',
            fontFamily: 'serif',
            fontStyle: 'italic',
            opacity: 0.7,
            textShadow: '0 2px 8px rgba(255,255,255,0.8)',
            letterSpacing: '0.5px',
            zIndex: 5,
            pointerEvents: 'none'
          }}
        >
          {label}
        </div>
      )}

      {/* Subtle corner accents */}
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 3,
          pointerEvents: 'none'
        }}
      >
        <defs>
          <radialGradient id={`cornerGlow-${imagePath}`}>
            <stop offset="0%" stopColor={tint} stopOpacity="0.15" />
            <stop offset="100%" stopColor={tint} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Corner glows */}
        <circle cx="0" cy="0" r={size * 0.15} fill={`url(#cornerGlow-${imagePath})`} />
        <circle cx={size} cy="0" r={size * 0.15} fill={`url(#cornerGlow-${imagePath})`} />
        <circle cx="0" cy={size} r={size * 0.15} fill={`url(#cornerGlow-${imagePath})`} />
        <circle cx={size} cy={size} r={size * 0.15} fill={`url(#cornerGlow-${imagePath})`} />
      </svg>
    </div>
  );
}

/**
 * Preset configurations for common sacred geometry backgrounds
 */
export const SacredGeometryPresets = {
  torus: {
    imagePath: '/sacred-geometry/iStock-1008544140-0.png',
    label: 'Toroidal Field of Consciousness',
    tint: '#D4A574',
    opacity: 0.35
  },
  goldenRatio: {
    imagePath: '/sacred-geometry/GoldenRatio005-0.png',
    label: 'Golden Ratio Sacred Field',
    tint: '#C9B896',
    opacity: 0.3
  },
  flowerOfLife: {
    imagePath: '/sacred-geometry/iStock-1168629991.png',
    label: 'Flower of Life Field',
    tint: '#B8AFA0',
    opacity: 0.4
  },
  merkaba: {
    imagePath: '/sacred-geometry/iStock-1794921394.png',
    label: 'Merkaba Light Field',
    tint: '#A89D8E',
    opacity: 0.35
  },
  rachelWhiteBlack: {
    imagePath: '/sacred-geometry/black/rachel white art 01.png',
    label: 'Sacred Geometry Portal (Dark)',
    tint: '#8B7D6B',
    opacity: 0.25
  },
  rachelWhiteLight: {
    imagePath: '/sacred-geometry/white/rachel white art 01.png',
    label: 'Sacred Geometry Portal (Light)',
    tint: '#D4C5B0',
    opacity: 0.3
  }
};
