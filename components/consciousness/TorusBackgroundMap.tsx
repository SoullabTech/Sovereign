'use client';

import React from 'react';
import Image from 'next/image';

interface TorusBackgroundMapProps {
  children: React.ReactNode;
  size?: number;
  showLabels?: boolean;
  amberTint?: string; // Hex color for amber tint overlay
  torusOpacity?: number; // Opacity of the torus background (0-1)
  isDarkMode?: boolean; // Whether to use dark/twilight styling
}

/**
 * Torus Background Map - Sacred geometry torus as backdrop
 *
 * Uses the iStock-1008544140 sacred geometry torus as a full-bleed
 * background with a light amber tint, centering the consciousness
 * field map in the middle.
 *
 * Visual hierarchy:
 * - Torus fills entire box (background layer)
 * - Light amber overlay creates sacred glow
 * - Consciousness map centered and prominent
 */
export default function TorusBackgroundMap({
  children,
  size = 800,
  showLabels = true,
  amberTint = '#D4A574',
  torusOpacity = 0.35,
  isDarkMode = false
}: TorusBackgroundMapProps) {
  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        overflow: 'hidden',
        background: isDarkMode
          ? 'radial-gradient(circle at center, rgba(30, 58, 95, 0.3) 0%, rgba(15, 23, 41, 0.5) 100%)'
          : '#F5F0E8',
        borderRadius: '8px',
        boxShadow: isDarkMode
          ? '0 8px 32px rgba(59, 130, 246, 0.15), 0 0 60px rgba(139, 92, 246, 0.1)'
          : '0 8px 32px rgba(139, 125, 107, 0.15)'
      }}
    >
      {/* Sacred Geometry Torus Background - Full Bleed */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0
        }}
      >
        <Image
          src="/consciousness-torus.svg"
          alt="Sacred Torus Geometry"
          fill
          style={{
            objectFit: 'contain',
            objectPosition: 'center',
            opacity: torusOpacity
          }}
          priority
        />
      </div>

      {/* Amber Tint Overlay - Creates the sacred glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          background: `radial-gradient(circle at center,
            ${amberTint}15 0%,
            ${amberTint}25 40%,
            ${amberTint}35 70%,
            ${amberTint}20 100%)`,
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
          background: isDarkMode
            ? 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(139, 92, 246, 0.08) 40%, transparent 70%)'
            : 'radial-gradient(circle, rgba(255,255,255,0.6) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none'
        }}
      />

      {/* Consciousness Map - Centered and Prominent */}
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
      {showLabels && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 5,
            pointerEvents: 'none'
          }}
        >
          {/* Top label */}
          <div
            style={{
              position: 'absolute',
              top: 24,
              left: '50%',
              transform: 'translateX(-50%)',
              color: isDarkMode ? '#A5B4CB' : '#8B7D6B',
              fontSize: '13px',
              fontFamily: 'serif',
              fontStyle: 'italic',
              opacity: isDarkMode ? 0.9 : 0.7,
              textShadow: isDarkMode
                ? '0 2px 8px rgba(59, 130, 246, 0.4), 0 0 20px rgba(139, 92, 246, 0.3)'
                : '0 2px 8px rgba(255,255,255,0.8)',
              letterSpacing: '0.5px'
            }}
          >
            The Toroidal Field of Consciousness
          </div>

          {/* Bottom fractal note */}
          <div
            style={{
              position: 'absolute',
              bottom: 24,
              left: '50%',
              transform: 'translateX(-50%)',
              color: isDarkMode ? '#8B9BB8' : '#8B7D6B',
              fontSize: '10px',
              fontFamily: 'serif',
              fontStyle: 'italic',
              opacity: isDarkMode ? 0.8 : 0.6,
              textAlign: 'center',
              textShadow: isDarkMode
                ? '0 1px 4px rgba(59, 130, 246, 0.3)'
                : '0 1px 4px rgba(255,255,255,0.8)'
            }}
          >
            "As above, so below" — The map sits at the heart of the torus
          </div>
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
          <radialGradient id="cornerGlow">
            <stop offset="0%" stopColor={amberTint} stopOpacity="0.15" />
            <stop offset="100%" stopColor={amberTint} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Corner glows */}
        <circle cx="0" cy="0" r={size * 0.15} fill="url(#cornerGlow)" />
        <circle cx={size} cy="0" r={size * 0.15} fill="url(#cornerGlow)" />
        <circle cx="0" cy={size} r={size * 0.15} fill="url(#cornerGlow)" />
        <circle cx={size} cy={size} r={size * 0.15} fill="url(#cornerGlow)" />
      </svg>
    </div>
  );
}

/**
 * Consciousness Map Placeholder
 * Simple circular placeholder showing 12-house wheel structure
 */
export function ConsciousnessMapPlaceholder() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.95), rgba(245,240,232,0.9))',
        border: '3px solid rgba(212,165,116,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        boxShadow: `
          inset 0 0 40px rgba(212,165,116,0.15),
          0 4px 20px rgba(139,125,107,0.2)
        `
      }}
    >
      <div
        style={{
          textAlign: 'center',
          color: '#8B7D6B',
          fontFamily: 'serif',
          fontStyle: 'italic',
          fontSize: '14px',
          opacity: 0.8,
          zIndex: 2
        }}
      >
        12-House<br />
        Consciousness<br />
        Map
      </div>

      {/* 12-House Division Overlay */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 200 200"
        style={{
          position: 'absolute',
          inset: 0
        }}
      >
        <defs>
          <radialGradient id="wheelGradient" cx="50%" cy="50%">
            <stop offset="0%" stopColor="rgba(212,165,116,0.05)" />
            <stop offset="100%" stopColor="rgba(212,165,116,0.15)" />
          </radialGradient>
        </defs>

        {/* Circular wheel background */}
        <circle
          cx="100"
          cy="100"
          r="90"
          fill="url(#wheelGradient)"
          opacity="0.6"
        />

        {/* 12 house division lines */}
        <g opacity="0.35">
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i * 30 - 90) * (Math.PI / 180);
            const x2 = 100 + 85 * Math.cos(angle);
            const y2 = 100 + 85 * Math.sin(angle);
            return (
              <line
                key={i}
                x1="100"
                y1="100"
                x2={x2}
                y2={y2}
                stroke="#D4A574"
                strokeWidth="1.5"
              />
            );
          })}
        </g>

        {/* Concentric circles */}
        <g opacity="0.3">
          <circle cx="100" cy="100" r="85" fill="none" stroke="#D4A574" strokeWidth="2" />
          <circle cx="100" cy="100" r="65" fill="none" stroke="#C9B896" strokeWidth="1.5" />
          <circle cx="100" cy="100" r="45" fill="none" stroke="#B8AFA0" strokeWidth="1" />
          <circle cx="100" cy="100" r="25" fill="none" stroke="#A89D8E" strokeWidth="1" />
        </g>

        {/* Center point */}
        <circle
          cx="100"
          cy="100"
          r="3"
          fill="#D4A574"
          opacity="0.6"
        />
      </svg>
    </div>
  );
}
