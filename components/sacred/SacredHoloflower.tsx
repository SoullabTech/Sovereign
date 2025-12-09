// Sacred Holoflower - Preserves exact visual fidelity with interaction overlay
import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { SPIRALOGIC_FACETS, getFacetById } from '@/data/spiralogic-facets';
import { MotionOrchestrator, MotionState, CoherenceShift } from '../motion/MotionOrchestrator';

interface SacredHoloflowerProps {
  activeFacetId?: string;
  userCheckIns?: Record<string, number>; // facetId -> intensity (0-1)
  onPetalClick?: (facetId: string) => void;
  onPetalHover?: (facetId: string | null) => void;
  size?: number;
  showLabels?: boolean;
  interactive?: boolean;
  motionState?: MotionState;
  coherenceLevel?: number; // 0.0 - 1.0
  coherenceShift?: CoherenceShift;
  isListening?: boolean;
  isProcessing?: boolean;
  isResponding?: boolean;
  showBreakthrough?: boolean;
  dimmed?: boolean; // Dim for chat mode (accessibility)
  voiceAmplitude?: number; // 0.0 - 1.0 for voice visualization
  isMaiaSpeaking?: boolean; // true when MAIA is speaking
  modeColor?: string; // Color for the light field based on mode
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

  // Update motion state based on props
  useEffect(() => {
    if (showBreakthrough) {
      setCurrentMotionState('breakthrough');
    } else if (isListening) {
      setCurrentMotionState('listening');
    } else if (isProcessing) {
      setCurrentMotionState('processing');
    } else if (isResponding) {
      setCurrentMotionState('responding');
    } else {
      setCurrentMotionState('idle');
    }
  }, [isListening, isProcessing, isResponding, showBreakthrough]);

  // Clear tap effect after animation
  useEffect(() => {
    if (tapEffectFacet) {
      const timeout = setTimeout(() => {
        setTapEffectFacet(null);
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [tapEffectFacet]);

  // Create petal path for hit detection
  const createPetalPath = (facet: typeof SPIRALOGIC_FACETS[0]): string => {
    const centerX = size / 2;
    const centerY = size / 2;
    const outerRadius = (size / 2) * 0.9;
    const innerRadius = outerRadius * 0.25;

    const startAngle = facet.angle.start;
    const endAngle = facet.angle.end;

    // Calculate path points
    const x1 = centerX + Math.cos(startAngle) * innerRadius;
    const y1 = centerY + Math.sin(startAngle) * innerRadius;
    const x2 = centerX + Math.cos(startAngle) * outerRadius;
    const y2 = centerY + Math.sin(startAngle) * outerRadius;
    const x3 = centerX + Math.cos(endAngle) * outerRadius;
    const y3 = centerY + Math.sin(endAngle) * outerRadius;
    const x4 = centerX + Math.cos(endAngle) * innerRadius;
    const y4 = centerY + Math.sin(endAngle) * innerRadius;

    const largeArcFlag = Math.abs(endAngle - startAngle) > Math.PI ? 1 : 0;

    return `
      M ${x1} ${y1}
      L ${x2} ${y2}
      A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x3} ${y3}
      L ${x4} ${y4}
      A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x1} ${y1}
      Z
    `;
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

  // Get glow effect for active/hovered petals
  const getPetalEffect = (facetId: string) => {
    const facet = getFacetById(facetId);
    const isActive = activeFacetId === facetId;
    const isHovered = hoveredFacet === facetId;
    const isTapped = tapEffectFacet === facetId;
    const checkInIntensity = userCheckIns[facetId] || 0;

    if (isActive || isHovered || checkInIntensity > 0 || isTapped) {
      let opacity = 0;
      let filter = 'blur(4px)';
      let animation = 'none';

      if (isTapped) {
        opacity = 0.8;
        filter = 'blur(6px)';
        animation = 'petalRipple 0.3s ease-out';
      } else if (isActive) {
        opacity = 0.6;
        filter = 'blur(8px)';
        animation = currentMotionState === 'responding' ? 'pulse 1.5s infinite' : 'pulse 2s infinite';
      } else if (isHovered) {
        opacity = 0.4;
        filter = 'blur(4px)';
      } else if (checkInIntensity > 0) {
        opacity = checkInIntensity * 0.5;
        filter = 'blur(4px)';
      }

      return {
        fill: facet.color.glow,
        opacity,
        filter,
        animation
      };
    }
    return null;
  };

  return (
    <MotionOrchestrator
      motionState={currentMotionState}
      coherenceLevel={coherenceLevel}
      coherenceShift={coherenceShift}
      activeFacetIds={activeFacetId ? [activeFacetId] : []}
    >
      <div
        ref={containerRef}
        className={`sacred-holoflower-container relative ${
          currentMotionState === 'listening' ? 'holoflower-listening' :
          currentMotionState === 'processing' ? 'holoflower-processing' :
          currentMotionState === 'responding' ? 'holoflower-responding' :
          showBreakthrough ? 'breakthrough-moment' : ''
        }`}
        style={{
          width: size,
          height: size,
          background: 'transparent',
          overflow: 'visible',
          opacity: dimmed ? 0.3 : 1,
          transition: 'opacity 0.3s ease',
          pointerEvents: interactive ? 'auto' : 'none'  // Pass clicks through when not interactive
        }}
      >
        {/* Base Holoflower Image - Sacred Spiralogic mandala */}
        <Image
          src="/holoflower.png"
          alt="Spiralogic Holoflower"
          width={size}
          height={size}
          className="absolute inset-0 object-contain"
          priority
        />

      {/* Interactive Overlay */}
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
        <defs>
          {/* Glow filters for each element */}
          {['fire', 'water', 'earth', 'air'].map(element => (
            <filter key={element} id={`glow-${element}`}>
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          ))}

          {/* Pulse animation */}
          <style>
            {`
              @keyframes pulse {
                0%, 100% { opacity: 0.6; }
                50% { opacity: 0.9; }
              }
            `}
          </style>
        </defs>

        {/* Petal overlays */}
        {SPIRALOGIC_FACETS.map(facet => {
          const effect = getPetalEffect(facet.id);
          const isActiveFacet = activeFacetId === facet.id;
          const isInactive = currentMotionState === 'responding' && !isActiveFacet;
          
          return (
            <g key={facet.id}>
              {/* Glow effect layer */}
              {effect && (
                <path
                  d={createPetalPath(facet)}
                  fill={effect.fill}
                  opacity={effect.opacity}
                  filter={`url(#glow-${facet.element})`}
                  className={`
                    petal-overlay
                    ${isActiveFacet ? 'petal-active' : ''}
                    ${isInactive ? 'petal-inactive' : ''}
                    ${tapEffectFacet === facet.id ? 'petal-tap-effect' : ''}
                  `}
                  style={{ 
                    animation: effect.animation,
                    mixBlendMode: 'screen'
                  }}
                  pointerEvents="none"
                />
              )}

              {/* Invisible hit area */}
              <path
                d={createPetalPath(facet)}
                fill="transparent"
                className={interactive ? 'cursor-pointer' : ''}
                style={{ pointerEvents: interactive ? 'all' : 'none' }}
                onClick={() => handlePetalInteraction(facet.id, 'click')}
                onMouseEnter={() => handlePetalInteraction(facet.id, 'hover')}
                onMouseLeave={() => handlePetalInteraction(facet.id, 'leave')}
              />

              {/* Check-in indicator dots */}
              {userCheckIns[facet.id] && userCheckIns[facet.id] > 0 && (
                <circle
                  cx={size / 2 + Math.cos((facet.angle.start + facet.angle.end) / 2) * (size * 0.35)}
                  cy={size / 2 + Math.sin((facet.angle.start + facet.angle.end) / 2) * (size * 0.35)}
                  r={4 + userCheckIns[facet.id] * 4}
                  fill="white"
                  opacity={0.8}
                  className="petal-intensity-fill"
                  style={{
                    transform: `scale(${1 + userCheckIns[facet.id] * 0.2})`
                  }}
                  pointerEvents="none"
                />
              )}
            </g>
          );
        })}

      </svg>

      {/* Facet info tooltip */}
      {hoveredFacet && showLabels && (
        <div 
          className="absolute bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3 z-20"
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            maxWidth: '200px'
          }}
        >
          <div className="text-sm">
            <div className="font-semibold capitalize mb-1">
              {getFacetById(hoveredFacet).element} • Stage {getFacetById(hoveredFacet).stage}
            </div>
            <div className="text-xs text-gray-600 mb-2">
              {getFacetById(hoveredFacet).essence}
            </div>
            <div className="text-xs italic">
              "{getFacetById(hoveredFacet).practice}"
            </div>
          </div>
        </div>
      )}

      {/* Elemental corner indicators (optional) */}
      {showLabels && (
        <div className="absolute inset-0 pointer-events-none">
          {[
            { element: 'air', x: '15%', y: '15%' },
            { element: 'fire', x: '85%', y: '15%' },
            { element: 'water', x: '85%', y: '85%' },
            { element: 'earth', x: '15%', y: '85%' }
          ].map(({ element, x, y }) => (
            <div
              key={element}
              className="absolute text-xs font-medium capitalize"
              style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}
            >
              <span className="text-white/70 drop-shadow-md">
                {element}
              </span>
            </div>
          ))}
        </div>
      )}
      </div>
    </MotionOrchestrator>
  );
};

export default SacredHoloflower;