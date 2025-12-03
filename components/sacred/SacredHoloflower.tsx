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
          {/* Breathing Light Field Rings - Maximum brightness and density */}
          <g className="breathing-rings">
            {[1, 0.95, 0.9, 0.85, 0.8, 0.75, 0.7, 0.65, 0.6, 0.55, 0.5, 0.45].map((scale, i) => (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={size * 0.45 * scale * (1 + coherenceLevel * 0.15)}
                fill="none"
                stroke="url(#enhancedLightFieldGradient)"
                strokeWidth={3 + coherenceLevel * 4}
                strokeOpacity={0.7 - i * 0.04}
                strokeDasharray={`${size * 0.012} ${size * 0.006}`}
                className="transition-all duration-400"
                style={{
                  animation: `breathe ${2 + i * 0.2}s ease-in-out infinite, rotate ${6 + i * 1}s linear infinite`,
                  filter: 'drop-shadow(0 0 4px #FFE5B4)'
                }}
              />
            ))}
          </g>

          {/* Magical Voice Recognition Field - Different states for listening, user speaking, and MAIA speaking */}
          {/* User Speaking Aura - Warm golden glow when user voice is detected */}
          {voiceAmplitude > 0.1 && !isMaiaSpeaking && (
            <g opacity={Math.min(0.4, voiceAmplitude * 0.8)} className="user-voice-field">
              <circle
                cx={size / 2}
                cy={size / 2}
                r={size * (0.16 + voiceAmplitude * 0.25)}
                fill="none"
                stroke="url(#userVoiceGradient)"
                strokeWidth={1 + voiceAmplitude * 2}
                opacity={0.5}
                className="transition-all duration-150"
                filter="url(#magicalGlow)"
                style={{
                  animation: `voicePulse ${0.8 + voiceAmplitude}s ease-in-out infinite`
                }}
              />
              <circle
                cx={size / 2}
                cy={size / 2}
                r={size * (0.24 + voiceAmplitude * 0.35)}
                fill="none"
                stroke="url(#userVoiceGradient)"
                strokeWidth={1 + voiceAmplitude * 1}
                opacity={0.3}
                className="transition-all duration-200"
                filter="url(#magicalGlow)"
              />
            </g>
          )}

          {/* MAIA Speaking Field - Gentle purple/lavender when MAIA is speaking */}
          {isMaiaSpeaking && (
            <g opacity={0.3} className="maia-voice-field">
              <circle
                cx={size / 2}
                cy={size / 2}
                r={size * 0.18}
                fill="none"
                stroke="url(#maiaVoiceGradient)"
                strokeWidth={2}
                opacity={0.5}
                className="transition-all duration-300"
                filter="url(#maiaGlow)"
                style={{
                  animation: `maiaSpeak 2s ease-in-out infinite`
                }}
              />
              <circle
                cx={size / 2}
                cy={size / 2}
                r={size * 0.26}
                fill="none"
                stroke="url(#maiaVoiceGradient)"
                strokeWidth={1}
                opacity={0.3}
                className="transition-all duration-400"
                filter="url(#maiaGlow)"
              />
            </g>
          )}

          {/* Listening Shimmer - Subtle blue/silver sparkles when listening */}
          {isListening && !voiceAmplitude && (
            <g opacity={0.25} className="listening-field">
              <circle
                cx={size / 2}
                cy={size / 2}
                r={size * 0.14}
                fill="none"
                stroke="url(#listeningGradient)"
                strokeWidth={1}
                opacity={0.4}
                className="transition-all duration-500"
                filter="url(#listeningGlow)"
                style={{
                  animation: `listeningShimmer 3s ease-in-out infinite`
                }}
                strokeDasharray={`${size * 0.008} ${size * 0.016}`}
              />
            </g>
          )}

          {/* Magical Particle Ring - Subtle sparkles around the field */}
          {(isListening || voiceAmplitude > 0 || isMaiaSpeaking) && (
            <g opacity={0.15} className="magical-particles">
              {[...Array(6)].map((_, i) => {
                const angle = (i / 6) * Math.PI * 2;
                const baseRadius = size * 0.37;
                const x = size / 2 + Math.cos(angle) * baseRadius;
                const y = size / 2 + Math.sin(angle) * baseRadius;
                return (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r={1}
                    fill={isMaiaSpeaking ? "#E6E6FA" : voiceAmplitude > 0.1 ? "#FFD700" : "#E0E6FF"}
                    opacity={0.5}
                    className="transition-all duration-300"
                    style={{
                      animation: `sparkle ${2 + i * 0.3}s ease-in-out infinite`,
                      animationDelay: `${i * 0.2}s`
                    }}
                  />
                );
              })}
            </g>
          )}

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

            <radialGradient id="enhancedLightFieldGradient" cx="50%" cy="50%">
              <stop offset="0%" stopColor="#FFE5B4" stopOpacity="1" />
              <stop offset="30%" stopColor="#FFF4E6" stopOpacity="0.9" />
              <stop offset="60%" stopColor="#D4B896" stopOpacity="0.7" />
              <stop offset="80%" stopColor="#B8860B" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#8b4513" stopOpacity="0.3" />
            </radialGradient>

            <radialGradient id="amberVoiceGradient" cx="50%" cy="50%">
              <stop offset="0%" stopColor="#FFD700" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#FFA500" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#FF8C00" stopOpacity="0.3" />
            </radialGradient>

            {/* Magical Voice Recognition Gradients */}
            <radialGradient id="userVoiceGradient" cx="50%" cy="50%">
              <stop offset="0%" stopColor="#FFD700" stopOpacity="0.8" />
              <stop offset="40%" stopColor="#FFA500" stopOpacity="0.6" />
              <stop offset="70%" stopColor="#FF8C00" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#CD853F" stopOpacity="0.2" />
            </radialGradient>

            <radialGradient id="maiaVoiceGradient" cx="50%" cy="50%">
              <stop offset="0%" stopColor="#E6E6FA" stopOpacity="0.7" />
              <stop offset="50%" stopColor="#DDA0DD" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#9370DB" stopOpacity="0.3" />
            </radialGradient>

            <radialGradient id="listeningGradient" cx="50%" cy="50%">
              <stop offset="0%" stopColor="#E0E6FF" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#B0C4DE" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#4682B4" stopOpacity="0.2" />
            </radialGradient>

            {/* Glow filters for light field effects */}
            <filter id="amberVoiceGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
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

            {/* Magical Voice Recognition Filters */}
            <filter id="magicalGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>

            <filter id="maiaGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>

            <filter id="listeningGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
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

        .amber-voice-field circle {
          transform-origin: 50% 50%;
        }

        /* Magical Voice Recognition Animations */
        @keyframes voicePulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.6;
          }
          50% {
            transform: scale(1.08);
            opacity: 0.9;
          }
        }

        @keyframes maiaSpeak {
          0%, 100% {
            transform: scale(1) rotate(0deg);
            opacity: 0.7;
          }
          33% {
            transform: scale(1.03) rotate(2deg);
            opacity: 0.8;
          }
          66% {
            transform: scale(1.06) rotate(-1deg);
            opacity: 0.9;
          }
        }

        @keyframes listeningShimmer {
          0%, 100% {
            transform: scale(1) rotate(0deg);
            opacity: 0.4;
            stroke-dashoffset: 0;
          }
          50% {
            transform: scale(1.02) rotate(180deg);
            opacity: 0.7;
            stroke-dashoffset: 10;
          }
        }

        @keyframes sparkle {
          0%, 100% {
            transform: scale(1) rotate(0deg);
            opacity: 0.3;
          }
          25% {
            transform: scale(1.2) rotate(90deg);
            opacity: 0.8;
          }
          50% {
            transform: scale(0.8) rotate(180deg);
            opacity: 0.6;
          }
          75% {
            transform: scale(1.1) rotate(270deg);
            opacity: 0.9;
          }
        }

        .user-voice-field circle {
          transform-origin: 50% 50%;
        }

        .maia-voice-field circle {
          transform-origin: 50% 50%;
        }

        .listening-field circle {
          transform-origin: 50% 50%;
        }

        .magical-particles circle {
          transform-origin: 50% 50%;
        }
      `}</style>
    </MotionOrchestrator>
  );
};

export default SacredHoloflower;
