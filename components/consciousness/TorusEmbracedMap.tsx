'use client';

import React from 'react';

interface TorusEmbracedMapProps {
  children: React.ReactNode;
  size?: number;
  showLabels?: boolean;
}

/**
 * Torus Embraced Map - Visual wrapper showing the consciousness map
 * emerging from the center of a nested torus field
 *
 * Creates the visual of:
 * - Map sits in the center (visible)
 * - Torus vortex wraps around it completely
 * - Shows the "apple → tree → universe" fractal nesting
 */
export default function TorusEmbracedMap({
  children,
  size = 800,
  showLabels = true
}: TorusEmbracedMapProps) {
  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        background: '#F5F0E8'
      }}
    >
      {/* SVG Torus Field - wraps around everything */}
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          pointerEvents: 'none'
        }}
      >
        <defs>
          {/* Gradients for depth */}
          <radialGradient id="torusWarm" cx="50%" cy="30%">
            <stop offset="0%" stopColor="#D4C5B0" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#C9B896" stopOpacity="0.3" />
          </radialGradient>

          <radialGradient id="torusCool" cx="50%" cy="70%">
            <stop offset="0%" stopColor="#B8AFA0" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#A89D8E" stopOpacity="0.3" />
          </radialGradient>

          {/* Glow filter */}
          <filter id="softGlow">
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Outer universe torus */}
        <g opacity="0.4">
          {/* Top arc */}
          <ellipse
            cx={size / 2}
            cy={size * 0.15}
            rx={size * 0.42}
            ry={size * 0.08}
            fill="none"
            stroke="#988C7C"
            strokeWidth="4"
            opacity="0.5"
          />
          {/* Bottom arc */}
          <ellipse
            cx={size / 2}
            cy={size * 0.85}
            rx={size * 0.42}
            ry={size * 0.08}
            fill="none"
            stroke="#988C7C"
            strokeWidth="4"
            opacity="0.5"
          />
          {/* Side curves */}
          <path
            d={`M ${size * 0.08} ${size * 0.15} Q ${size * 0.02} ${size * 0.5} ${size * 0.08} ${size * 0.85}`}
            fill="none"
            stroke="#988C7C"
            strokeWidth="3"
            opacity="0.4"
          />
          <path
            d={`M ${size * 0.92} ${size * 0.15} Q ${size * 0.98} ${size * 0.5} ${size * 0.92} ${size * 0.85}`}
            fill="none"
            stroke="#988C7C"
            strokeWidth="3"
            opacity="0.4"
          />
        </g>

        {/* Middle collective torus */}
        <g opacity="0.5">
          {/* Top funnel - descending (warm) */}
          <ellipse
            cx={size / 2}
            cy={size * 0.25}
            rx={size * 0.35}
            ry={size * 0.07}
            fill="url(#torusWarm)"
            opacity="0.6"
            filter="url(#softGlow)"
          />
          <ellipse
            cx={size / 2}
            cy={size * 0.25}
            rx={size * 0.35}
            ry={size * 0.07}
            fill="none"
            stroke="#C9B896"
            strokeWidth="2.5"
          />

          {/* Spiral vortex lines descending */}
          <ellipse cx={size / 2} cy={size * 0.3} rx={size * 0.32} ry={size * 0.06}
            fill="none" stroke="#C1A880" strokeWidth="1.5" opacity="0.5"/>
          <ellipse cx={size / 2} cy={size * 0.35} rx={size * 0.28} ry={size * 0.055}
            fill="none" stroke="#B39870" strokeWidth="1.5" opacity="0.4"/>
          <ellipse cx={size / 2} cy={size * 0.4} rx={size * 0.24} ry={size * 0.05}
            fill="none" stroke="#A58860" strokeWidth="1.5" opacity="0.3"/>

          {/* Bottom funnel - ascending (cool) */}
          <ellipse
            cx={size / 2}
            cy={size * 0.75}
            rx={size * 0.35}
            ry={size * 0.07}
            fill="url(#torusCool)"
            opacity="0.6"
            filter="url(#softGlow)"
          />
          <ellipse
            cx={size / 2}
            cy={size * 0.75}
            rx={size * 0.35}
            ry={size * 0.07}
            fill="none"
            stroke="#A89D8E"
            strokeWidth="2.5"
          />

          {/* Spiral vortex lines ascending */}
          <ellipse cx={size / 2} cy={size * 0.7} rx={size * 0.24} ry={size * 0.05}
            fill="none" stroke="#9B9082" strokeWidth="1.5" opacity="0.3"/>
          <ellipse cx={size / 2} cy={size * 0.65} rx={size * 0.28} ry={size * 0.055}
            fill="none" stroke="#8E8376" strokeWidth="1.5" opacity="0.4"/>
          <ellipse cx={size / 2} cy={size * 0.6} rx={size * 0.32} ry={size * 0.06}
            fill="none" stroke="#A89D8E" strokeWidth="1.5" opacity="0.5"/>

          {/* Side flow curves */}
          <path
            d={`M ${size * 0.15} ${size * 0.25} Q ${size * 0.1} ${size * 0.5} ${size * 0.15} ${size * 0.75}`}
            fill="none"
            stroke="#C1A880"
            strokeWidth="2"
            strokeDasharray="5,5"
            opacity="0.4"
          />
          <path
            d={`M ${size * 0.85} ${size * 0.25} Q ${size * 0.9} ${size * 0.5} ${size * 0.85} ${size * 0.75}`}
            fill="none"
            stroke="#A89D8E"
            strokeWidth="2"
            strokeDasharray="5,5"
            opacity="0.4"
          />
        </g>

        {/* Inner personal torus - clearly wraps the map */}
        <g opacity="0.7">
          {/* Top entrance - descending energy */}
          <ellipse
            cx={size / 2}
            cy={size * 0.33}
            rx={size * 0.28}
            ry={size * 0.06}
            fill="url(#torusWarm)"
            opacity="0.7"
            filter="url(#softGlow)"
          />
          <ellipse
            cx={size / 2}
            cy={size * 0.33}
            rx={size * 0.28}
            ry={size * 0.06}
            fill="none"
            stroke="#C9B896"
            strokeWidth="3"
          />

          {/* Vortex spiraling into map */}
          <ellipse cx={size / 2} cy={size * 0.37} rx={size * 0.26} ry={size * 0.052}
            fill="none" stroke="#C1A880" strokeWidth="2" opacity="0.6"/>
          <ellipse cx={size / 2} cy={size * 0.41} rx={size * 0.23} ry={size * 0.045}
            fill="none" stroke="#B39870" strokeWidth="2" opacity="0.5"/>
          <ellipse cx={size / 2} cy={size * 0.45} rx={size * 0.20} ry={size * 0.04}
            fill="none" stroke="#A58860" strokeWidth="2" opacity="0.4"/>

          {/* Bottom exit - ascending energy */}
          <ellipse
            cx={size / 2}
            cy={size * 0.67}
            rx={size * 0.28}
            ry={size * 0.06}
            fill="url(#torusCool)"
            opacity="0.7"
            filter="url(#softGlow)"
          />
          <ellipse
            cx={size / 2}
            cy={size * 0.67}
            rx={size * 0.28}
            ry={size * 0.06}
            fill="none"
            stroke="#A89D8E"
            strokeWidth="3"
          />

          {/* Vortex spiraling out from map */}
          <ellipse cx={size / 2} cy={size * 0.63} rx={size * 0.20} ry={size * 0.04}
            fill="none" stroke="#8E8376" strokeWidth="2" opacity="0.4"/>
          <ellipse cx={size / 2} cy={size * 0.59} rx={size * 0.23} ry={size * 0.045}
            fill="none" stroke="#9B9082" strokeWidth="2" opacity="0.5"/>
          <ellipse cx={size / 2} cy={size * 0.55} rx={size * 0.26} ry={size * 0.052}
            fill="none" stroke="#A89D8E" strokeWidth="2" opacity="0.6"/>

          {/* Side curves wrapping around the map */}
          <path
            d={`M ${size * 0.22} ${size * 0.33} Q ${size * 0.18} ${size * 0.5} ${size * 0.22} ${size * 0.67}`}
            fill="none"
            stroke="#C1A880"
            strokeWidth="2.5"
            opacity="0.5"
          />
          <path
            d={`M ${size * 0.78} ${size * 0.33} Q ${size * 0.82} ${size * 0.5} ${size * 0.78} ${size * 0.67}`}
            fill="none"
            stroke="#A89D8E"
            strokeWidth="2.5"
            opacity="0.5"
          />
        </g>

        {/* Radial field lines from center */}
        <g opacity="0.2">
          <line x1={size / 2} y1={size * 0.35} x2={size / 2} y2={size * 0.65}
            stroke="#8B7D6B" strokeWidth="0.5"/>
          <line x1={size * 0.35} y1={size / 2} x2={size * 0.65} y2={size / 2}
            stroke="#8B7D6B" strokeWidth="0.5"/>
          <line x1={size * 0.38} y1={size * 0.38} x2={size * 0.62} y2={size * 0.62}
            stroke="#8B7D6B" strokeWidth="0.5"/>
          <line x1={size * 0.62} y1={size * 0.38} x2={size * 0.38} y2={size * 0.62}
            stroke="#8B7D6B" strokeWidth="0.5"/>
        </g>

        {/* Labels */}
        {showLabels && (
          <g fontFamily="serif" fontStyle="italic" opacity="0.65">
            <text x={size / 2} y={size * 0.08} textAnchor="middle" fill="#8B7D6B" fontSize="14">
              Universe (Cosmic Torus)
            </text>
            <text x={size * 0.05} y={size / 2} textAnchor="start" fill="#9B8A76" fontSize="12">
              Collective
            </text>
            <text x={size / 2} y={size * 0.28} textAnchor="middle" fill="#A89D8E" fontSize="11">
              Personal (Apple)
            </text>
          </g>
        )}

        {/* Flow indicators */}
        <g opacity="0.5" fontFamily="serif" fontStyle="italic" fontSize="10">
          <text x={size * 0.12} y={size * 0.3} fill="#C1A880">
            ↓ Experience
          </text>
          <text x={size * 0.75} y={size * 0.72} fill="#A89D8E" textAnchor="end">
            Spirit ↑
          </text>
        </g>
      </svg>

      {/* Consciousness map in the center - sits INSIDE the torus */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 2,
          width: '35%',
          height: '35%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {children}
      </div>

      {/* Fractal indicator */}
      <div
        style={{
          position: 'absolute',
          bottom: 20,
          left: 20,
          color: '#8B7D6B',
          fontSize: '9px',
          fontFamily: 'serif',
          fontStyle: 'italic',
          opacity: 0.5,
          zIndex: 3
        }}
      >
        "As above, so below"<br />
        Each torus contains the pattern
      </div>
    </div>
  );
}

/**
 * Simple demo placeholder for the consciousness map
 */
export function ConsciousnessMapPlaceholder() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(232,223,208,0.95), rgba(240,235,225,0.98))',
        border: '2px solid rgba(193,168,128,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        boxShadow: 'inset 0 0 30px rgba(139,125,107,0.2)'
      }}
    >
      <div
        style={{
          textAlign: 'center',
          color: '#8B7D6B',
          fontFamily: 'serif',
          fontStyle: 'italic',
          fontSize: '11px',
          opacity: 0.7
        }}
      >
        12-House<br />
        Consciousness<br />
        Map
      </div>

      {/* Simple circle divisions to show houses */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 200 200"
        style={{
          position: 'absolute',
          inset: 0
        }}
      >
        <g opacity="0.3">
          {/* 12 house divisions */}
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i * 30 - 90) * (Math.PI / 180);
            const x2 = 100 + 90 * Math.cos(angle);
            const y2 = 100 + 90 * Math.sin(angle);
            return (
              <line
                key={i}
                x1="100"
                y1="100"
                x2={x2}
                y2={y2}
                stroke="#8B7D6B"
                strokeWidth="0.5"
              />
            );
          })}
          <circle cx="100" cy="100" r="90" fill="none" stroke="#8B7D6B" strokeWidth="1" />
          <circle cx="100" cy="100" r="70" fill="none" stroke="#8B7D6B" strokeWidth="0.5" />
          <circle cx="100" cy="100" r="50" fill="none" stroke="#8B7D6B" strokeWidth="0.5" />
        </g>
      </svg>
    </div>
  );
}
