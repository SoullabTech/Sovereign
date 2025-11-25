// Sacred Holoflower - Preserves exact visual fidelity with interaction overlay
import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { SPIRALOGIC_FACETS, getFacetById } from '@/data/spiralogic-facets';
import { MotionOrchestrator, MotionState, CoherenceShift } from '../motion/MotionOrchestrator';

interface SacredHoloflowerProps {
  activeFacetId?: string;
  userCheckIns?: Record<string, number>;
  onPetalClick?: (facetId: string) => void;
  onPetalHover?: (facetId: string | null) => void;
  size?: number;
  showLabels?: boolean;
  interactive?: boolean;
  motionState?: MotionState;
  coherenceLevel?: number;
  coherenceShift?: CoherenceShift;
  isListening?: boolean;
  isProcessing?: boolean;
  isResponding?: boolean;
  showBreakthrough?: boolean;
  dimmed?: boolean;
  voiceAmplitude?: number;
  isMaiaSpeaking?: boolean;
}

export const SacredHoloflower: React.FC<SacredHoloflowerProps> = ({
  activeFacetId,
  userCheckIns = {},
  onPetalClick,
  onPetalHover,
  size = 500,
  showLabels = false,
  interactive = true,
  motionState = 'idle',
  coherenceLevel = 0.5,
  coherenceShift = 'stable',
  isListening = false,
  isProcessing = false,
  isResponding = false,
  showBreakthrough = false,
  dimmed = false,
  voiceAmplitude = 0,
  isMaiaSpeaking = false
}) => {
  const [hoveredFacet, setHoveredFacet] = useState<string | null>(null);
  const [currentMotionState, setCurrentMotionState] = useState<MotionState>(motionState);
  const [tapEffectFacet, setTapEffectFacet] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const createPetalPath = (facet: typeof SPIRALOGIC_FACETS[0], index: number): string => {
    const centerX = size / 2;
    const centerY = size / 2;

    // Create more scattered, organic positioning instead of rigid segments
    const baseRadius = (size / 2) * 0.7;
    const petalRadius = size * 0.06; // Individual petal size
    const variance = (Math.sin(index * 1.618) * 0.3 + 1) * baseRadius; // Golden ratio variance

    const angle = (index / SPIRALOGIC_FACETS.length) * Math.PI * 2;
    const offsetX = Math.cos(angle + index * 0.1) * variance;
    const offsetY = Math.sin(angle + index * 0.1) * variance;

    const petalX = centerX + offsetX;
    const petalY = centerY + offsetY;

    // Create organic petal shapes instead of pie segments
    return `M ${petalX - petalRadius} ${petalY}
            C ${petalX - petalRadius * 0.7} ${petalY - petalRadius * 0.8},
              ${petalX + petalRadius * 0.7} ${petalY - petalRadius * 0.8},
              ${petalX + petalRadius} ${petalY}
            C ${petalX + petalRadius * 0.7} ${petalY + petalRadius * 0.8},
              ${petalX - petalRadius * 0.7} ${petalY + petalRadius * 0.8},
              ${petalX - petalRadius} ${petalY} Z`;
  };

  const handlePetalInteraction = (facetId: string, eventType: 'click' | 'hover' | 'leave') => {
    if (!interactive) return;

    if (eventType === 'click') {
      setTapEffectFacet(facetId);
      onPetalClick?.(facetId);
    } else if (eventType === 'hover') {
      setHoveredFacet(facetId);
      onPetalHover?.(facetId);
    } else if (eventType === 'leave') {
      setHoveredFacet(null);
      onPetalHover?.(null);
    }
  };

  return (
    <MotionOrchestrator
      motionState={motionState}
      coherenceLevel={coherenceLevel}
      coherenceShift={coherenceShift}
      activeFacetIds={activeFacetId ? [activeFacetId] : []}
    >
      <div
        ref={containerRef}
        className="sacred-holoflower-container relative"
        style={{
          width: size,
          height: size,
          background: 'transparent',
          overflow: 'visible',
          opacity: dimmed ? 0.3 : 1,
          transition: 'opacity 0.3s ease'
        }}
      >
        {/* Sacred Holoflower SVG Visualization */}
        <svg
          width={size}
          height={size}
          className="absolute inset-0"
          style={{ zIndex: 1 }}
        >
          {/* Breathing Light Field Rings - Based on original holoflower complexity rings */}
          <g className="breathing-rings">
            {[1, 0.8, 0.6, 0.4, 0.2].map((scale, i) => (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={size * 0.4 * scale * (1 + coherenceLevel * 0.1)}
                fill="none"
                stroke="url(#lightFieldGradient)"
                strokeWidth={1 + coherenceLevel * 2}
                strokeOpacity={0.3 - i * 0.05}
                strokeDasharray={`${size * 0.02} ${size * 0.01}`}
                className="transition-all duration-500"
                style={{
                  animation: `breathe ${3 + i * 0.5}s ease-in-out infinite, rotate ${10 + i * 2}s linear infinite`
                }}
              />
            ))}
          </g>

          {/* Dynamic Voice Response Field */}
          <g opacity={Math.max(0.3, voiceAmplitude * 0.8 + coherenceLevel * 0.4)} className="voice-field">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={size * (0.15 + voiceAmplitude * 0.3)}
              fill="none"
              stroke={isMaiaSpeaking ? "url(#maiaVoiceGradient)" : "url(#userVoiceGradient)"}
              strokeWidth={2 + voiceAmplitude * 4}
              opacity={0.7}
              className="transition-all duration-200"
              filter="url(#voiceGlow)"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={size * (0.25 + voiceAmplitude * 0.4)}
              fill="none"
              stroke={isMaiaSpeaking ? "url(#maiaVoiceGradient)" : "url(#userVoiceGradient)"}
              strokeWidth={1 + voiceAmplitude * 2}
              opacity={0.4}
              className="transition-all duration-300"
              filter="url(#voiceGlow)"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={size * (0.35 + voiceAmplitude * 0.5)}
              fill="none"
              stroke={isMaiaSpeaking ? "url(#maiaVoiceGradient)" : "url(#userVoiceGradient)"}
              strokeWidth={0.5 + voiceAmplitude * 1}
              opacity={0.2}
              className="transition-all duration-400"
              filter="url(#voiceGlow)"
            />
          </g>

          {/* Central Core */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size * (0.08 + voiceAmplitude * 0.02)}
            fill="url(#coreGradient)"
            className="drop-shadow-lg transition-all duration-200"
            style={{
              filter: `drop-shadow(0 0 ${8 + voiceAmplitude * 12}px #D4B896)`
            }}
          />

          {/* Sacred Petals - Modified to remove pie chart appearance */}
          {SPIRALOGIC_FACETS.map((facet, index) => (
            <g key={facet.id}>
              <path
                d={createPetalPath(facet, index)}
                fill={`url(#petal-${index})`}
                stroke="none"
                strokeWidth="0"
                opacity={activeFacetId === facet.id ? 0.9 : Math.max(0.2, 0.3 + coherenceLevel * 0.3 + voiceAmplitude * 0.2)}
                className="transition-all duration-300"
                style={{
                  filter: activeFacetId === facet.id
                    ? `drop-shadow(0 0 ${10 + voiceAmplitude * 15}px ${facet.color.glow})`
                    : voiceAmplitude > 0.1
                      ? `drop-shadow(0 0 ${voiceAmplitude * 8}px ${facet.color.glow})`
                      : 'none',
                  mixBlendMode: 'multiply'
                }}
              />
            </g>
          ))}

          {/* Gradients */}
          <defs>
            <radialGradient id="coreGradient" cx="50%" cy="50%">
              <stop offset="0%" stopColor="#D4B896" stopOpacity="1" />
              <stop offset="100%" stopColor="#8b4513" stopOpacity="0.8" />
            </radialGradient>

            <radialGradient id="lightFieldGradient" cx="50%" cy="50%">
              <stop offset="0%" stopColor="#FFE5B4" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#D4B896" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#8b4513" stopOpacity="0.1" />
            </radialGradient>

            <radialGradient id="userVoiceGradient" cx="50%" cy="50%">
              <stop offset="0%" stopColor="#06FFA5" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#00D9FF" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#4DABF7" stopOpacity="0.2" />
            </radialGradient>

            <radialGradient id="maiaVoiceGradient" cx="50%" cy="50%">
              <stop offset="0%" stopColor="#9D4EDD" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#C77DFF" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#E0AAFF" stopOpacity="0.2" />
            </radialGradient>

            {/* Glow filters for light field effects */}
            <filter id="voiceGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>

            <filter id="breathingGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>

            {SPIRALOGIC_FACETS.map((facet, index) => (
              <radialGradient key={`petal-${index}`} id={`petal-${index}`} cx="50%" cy="50%">
                <stop offset="0%" stopColor={facet.color.glow} stopOpacity="0.8" />
                <stop offset="100%" stopColor={facet.color.glow} stopOpacity="0.3" />
              </radialGradient>
            ))}
          </defs>
        </svg>

        {/* REMOVED: Blue voice ring as requested by user */}
      </div>

      {/* Light field animations */}
      <style jsx>{`
        @keyframes breathe {
          0%, 100% {
            transform: scale(1);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.6;
          }
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .breathing-rings circle {
          transform-origin: 50% 50%;
        }

        .voice-field circle {
          transform-origin: 50% 50%;
        }
      `}</style>
    </MotionOrchestrator>
  );
};

export default SacredHoloflower;
