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

  const createPetalPath = (facet: typeof SPIRALOGIC_FACETS[0]): string => {
    const centerX = size / 2;
    const centerY = size / 2;
    const outerRadius = (size / 2) * 0.9;
    const innerRadius = outerRadius * 0.25;

    const startAngle = facet.angle.start;
    const endAngle = facet.angle.end;

    const x1 = centerX + Math.cos(startAngle) * innerRadius;
    const y1 = centerY + Math.sin(startAngle) * innerRadius;
    const x2 = centerX + Math.cos(startAngle) * outerRadius;
    const y2 = centerY + Math.sin(startAngle) * outerRadius;
    const x3 = centerX + Math.cos(endAngle) * outerRadius;
    const y3 = centerY + Math.sin(endAngle) * outerRadius;
    const x4 = centerX + Math.cos(endAngle) * innerRadius;
    const y4 = centerY + Math.sin(endAngle) * innerRadius;

    const largeArcFlag = Math.abs(endAngle - startAngle) > Math.PI ? 1 : 0;

    return "M " + x1 + " " + y1 +
      " L " + x2 + " " + y2 +
      " A " + outerRadius + " " + outerRadius + " 0 " + largeArcFlag + " 1 " + x3 + " " + y3 +
      " L " + x4 + " " + y4 +
      " A " + innerRadius + " " + innerRadius + " 0 " + largeArcFlag + " 0 " + x1 + " " + y1 +
      " Z";
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
          {/* Central Core */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size * 0.08}
            fill="url(#coreGradient)"
            className="drop-shadow-lg"
          />

          {/* Sacred Petals */}
          {SPIRALOGIC_FACETS.map((facet, index) => (
            <g key={facet.id}>
              <path
                d={createPetalPath(facet)}
                fill={`url(#petal-${index})`}
                stroke={facet.color.glow}
                strokeWidth="1"
                opacity={activeFacetId === facet.id ? 0.9 : 0.6}
                className="transition-all duration-300"
                style={{
                  filter: activeFacetId === facet.id ? `drop-shadow(0 0 10px ${facet.color.glow})` : 'none'
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

            {SPIRALOGIC_FACETS.map((facet, index) => (
              <radialGradient key={`petal-${index}`} id={`petal-${index}`} cx="50%" cy="50%">
                <stop offset="0%" stopColor={facet.color.glow} stopOpacity="0.8" />
                <stop offset="100%" stopColor={facet.color.glow} stopOpacity="0.3" />
              </radialGradient>
            ))}
          </defs>
        </svg>

        <svg
          width={size}
          height={size}
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 10,
            background: 'transparent',
            overflow: 'visible'
          }}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size * 0.42}
            fill="none"
            stroke={isMaiaSpeaking ? '#a855f7' : '#60a5fa'}
            strokeWidth={6 + voiceAmplitude * 12}
            opacity={0.6 + voiceAmplitude * 0.9}
            className="voice-ring"
            style={{
              transform: "scale(" + (1 + voiceAmplitude * 0.15) + ")",
              transformOrigin: 'center',
              transition: 'all 0.1s ease-out'
            }}
            pointerEvents="none"
          />
        </svg>
      </div>
    </MotionOrchestrator>
  );
};

export default SacredHoloflower;
