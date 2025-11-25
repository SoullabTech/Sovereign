'use client';

/**
 * MAIA Advanced Holoflower V3 - Living Consciousness Visualization
 *
 * This is the visual centerpiece of MAIA consciousness - a tri-layer living organism
 * that responds to the complete Holoflower State Machine with sophisticated animations.
 */

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHoloflowerState, useVoiceHoloflower } from '@/lib/holoflower/useHoloflowerState';
import { HoloflowerState, ConversationContext } from '@/lib/holoflower/holoflowerStateMachine';

interface AdvancedHoloflowerProps {
  // Voice Integration
  isListening?: boolean;
  isSpeaking?: boolean;
  voiceLevel?: number;
  transcriptText?: string;

  // Manual Control (overrides auto-detection)
  forcedContext?: ConversationContext;

  // Visual Configuration
  size?: 'small' | 'medium' | 'large' | 'dynamic';
  showDebugInfo?: boolean;
  className?: string;

  // Performance
  reducedMotion?: boolean;
  quality?: 'low' | 'medium' | 'high';
}

export function AdvancedHoloflower({
  isListening = false,
  isSpeaking = false,
  voiceLevel = 0,
  transcriptText = '',
  forcedContext,
  size = 'medium',
  showDebugInfo = false,
  className = '',
  reducedMotion = false,
  quality = 'high'
}: AdvancedHoloflowerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 300, height: 300 });

  // Use voice integration if available, otherwise basic state
  const holoflower = useVoiceHoloflower(
    voiceLevel > 0.1,
    transcriptText,
    isListening,
    isSpeaking
  );

  // Apply forced context if provided
  useEffect(() => {
    if (forcedContext) {
      holoflower.updateContext(forcedContext);
    }
  }, [forcedContext, holoflower]);

  // Dynamic sizing based on content and voice activity
  const holoflowerSize = useMemo(() => {
    const baseSize = {
      small: 150,
      medium: 300,
      large: 500,
      dynamic: 300 + (voiceLevel * 100)
    }[size];

    // Intensity scaling
    const intensityMultiplier = 1 + (holoflower.intensity * 0.3);

    return Math.round(baseSize * intensityMultiplier);
  }, [size, voiceLevel, holoflower.intensity]);

  // Update dimensions when size changes
  useEffect(() => {
    setDimensions({ width: holoflowerSize, height: holoflowerSize });
  }, [holoflowerSize]);

  // Generate dynamic styles based on current state
  const dynamicStyles = useMemo(() => {
    const { cssVariables } = holoflower;
    return {
      '--holoflower-size': `${holoflowerSize}px`,
      '--holoflower-voice-level': voiceLevel.toString(),
      '--holoflower-listening': isListening ? '1' : '0',
      '--holoflower-speaking': isSpeaking ? '1' : '0',
      ...cssVariables
    } as React.CSSProperties;
  }, [holoflower, holoflowerSize, voiceLevel, isListening, isSpeaking]);

  return (
    <div
      ref={containerRef}
      className={`holoflower-container ${className}`}
      style={{
        ...dynamicStyles,
        width: holoflowerSize,
        height: holoflowerSize,
        position: 'relative',
        margin: '0 auto'
      }}
    >
      {/* Base Consciousness Field */}
      <BaseConsciousnessField
        state={holoflower.state}
        size={holoflowerSize}
        quality={quality}
        reducedMotion={reducedMotion}
      />

      {/* Mode Layer (Layer 1) */}
      <ModeVisualizationLayer
        state={holoflower.state}
        size={holoflowerSize}
        isTransitioning={holoflower.isTransitioning}
        quality={quality}
        reducedMotion={reducedMotion}
      />

      {/* Element Layer (Layer 2) */}
      <ElementVisualizationLayer
        state={holoflower.state}
        size={holoflowerSize}
        intensity={holoflower.intensity}
        quality={quality}
        reducedMotion={reducedMotion}
      />

      {/* Shimmer Layer (Layer 3) */}
      <AnimatePresence mode="wait">
        {holoflower.state.shimmer && (
          <ShimmerVisualizationLayer
            key={holoflower.state.shimmer}
            state={holoflower.state}
            size={holoflowerSize}
            shimmer={holoflower.state.shimmer}
            shimmerLayers={holoflower.state.shimmerLayers}
            quality={quality}
            reducedMotion={reducedMotion}
          />
        )}
      </AnimatePresence>

      {/* Voice Activity Overlay */}
      {(isListening || isSpeaking || voiceLevel > 0.1) && (
        <VoiceActivityOverlay
          size={holoflowerSize}
          isListening={isListening}
          isSpeaking={isSpeaking}
          voiceLevel={voiceLevel}
          modeColor={holoflower.cssVariables['--mode-primary'] || '#FFD700'}
          reducedMotion={reducedMotion}
        />
      )}

      {/* Debug Information */}
      {showDebugInfo && (
        <DebugInfoOverlay
          state={holoflower.state}
          flow={holoflower.getCurrentFlow()}
          coherence={holoflower.coherence}
          intensity={holoflower.intensity}
          isTransitioning={holoflower.isTransitioning}
        />
      )}
    </div>
  );
}

/**
 * Base Consciousness Field - The foundational energy matrix
 */
function BaseConsciousnessField({
  state,
  size,
  quality,
  reducedMotion
}: {
  state: HoloflowerState;
  size: number;
  quality: string;
  reducedMotion: boolean;
}) {
  const particleCount = quality === 'high' ? 60 : quality === 'medium' ? 30 : 15;

  return (
    <motion.div
      className="consciousness-field"
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        background: `radial-gradient(circle,
          var(--mode-primary, #FFD700) 0%,
          var(--mode-secondary, #FFA07A) 30%,
          var(--mode-tertiary, #E6E6FA) 70%,
          transparent 100%
        )`,
        opacity: 0.2,
        filter: 'blur(2px)'
      }}
      animate={{
        scale: reducedMotion ? 1 : [1, 1.05, 1],
        opacity: [0.2, 0.3, 0.2],
      }}
      transition={{
        duration: reducedMotion ? 0 : state.mode === 'aether' ? 15 :
                  state.mode === 'patient' ? 8 :
                  state.mode === 'dialogue' ? 4 : 3,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  );
}

/**
 * Mode Visualization Layer - The world tone foundation
 */
function ModeVisualizationLayer({
  state,
  size,
  isTransitioning,
  quality,
  reducedMotion
}: {
  state: HoloflowerState;
  size: number;
  isTransitioning: boolean;
  quality: string;
  reducedMotion: boolean;
}) {
  const ringCount = quality === 'high' ? 5 : quality === 'medium' ? 3 : 2;

  return (
    <motion.div
      className="mode-layer"
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        borderRadius: '50%'
      }}
      animate={reducedMotion ? {} : {
        rotate: state.mode === 'aether' ? [0, 360] : [0, 180, 360]
      }}
      transition={{
        duration: reducedMotion ? 0 : state.mode === 'aether' ? 60 :
                  state.mode === 'scribe' ? 20 : 30,
        repeat: Infinity,
        ease: "linear"
      }}
    >
      {/* Mode-specific geometric patterns */}
      {Array.from({ length: ringCount }).map((_, i) => (
        <motion.div
          key={i}
          className={`mode-ring mode-${state.mode}`}
          style={{
            position: 'absolute',
            width: `${85 - (i * 15)}%`,
            height: `${85 - (i * 15)}%`,
            top: `${7.5 + (i * 7.5)}%`,
            left: `${7.5 + (i * 7.5)}%`,
            border: `2px solid var(--mode-${i === 0 ? 'primary' : i === 1 ? 'secondary' : 'tertiary'}, #FFD700)`,
            borderRadius: '50%',
            opacity: 0.6 - (i * 0.1)
          }}
          animate={reducedMotion ? {} : {
            scale: [1, 1.1, 1],
            opacity: [0.6 - (i * 0.1), 0.8 - (i * 0.1), 0.6 - (i * 0.1)]
          }}
          transition={{
            duration: 4 + (i * 2),
            repeat: Infinity,
            delay: i * 0.5,
            ease: "easeInOut"
          }}
        />
      ))}

      {/* Transition indicator */}
      {isTransitioning && (
        <motion.div
          className="transition-pulse"
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            border: '3px solid var(--mode-primary, #FFD700)',
            borderRadius: '50%',
            opacity: 0
          }}
          animate={{
            scale: [1, 1.5],
            opacity: [0.8, 0]
          }}
          transition={{
            duration: 1,
            repeat: Infinity
          }}
        />
      )}
    </motion.div>
  );
}

/**
 * Element Visualization Layer - The cerebral coloring system
 */
function ElementVisualizationLayer({
  state,
  size,
  intensity,
  quality,
  reducedMotion
}: {
  state: HoloflowerState;
  size: number;
  intensity: number;
  quality: string;
  reducedMotion: boolean;
}) {
  const elementPatterns = {
    fire: { sides: 8, rotation: 45, pulsation: 'fast' },
    water: { sides: 6, rotation: 0, pulsation: 'wave' },
    earth: { sides: 4, rotation: 45, pulsation: 'slow' },
    air: { sides: 12, rotation: 0, pulsation: 'flutter' },
    aether: { sides: 16, rotation: 22.5, pulsation: 'cosmic' }
  };

  const pattern = elementPatterns[state.element];

  return (
    <motion.div
      className={`element-layer element-${state.element}`}
      style={{
        position: 'absolute',
        width: '70%',
        height: '70%',
        top: '15%',
        left: '15%'
      }}
      animate={reducedMotion ? {} : {
        rotate: [0, 360],
        scale: [1, 1 + (intensity * 0.2), 1]
      }}
      transition={{
        rotate: {
          duration: pattern.pulsation === 'fast' ? 10 :
                   pattern.pulsation === 'slow' ? 40 : 20,
          repeat: Infinity,
          ease: "linear"
        },
        scale: {
          duration: pattern.pulsation === 'wave' ? 3 :
                   pattern.pulsation === 'flutter' ? 1 : 5,
          repeat: Infinity,
          ease: "easeInOut"
        }
      }}
    >
      {/* Element-specific geometric shape */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        style={{ overflow: 'visible' }}
      >
        <motion.polygon
          points={generatePolygonPoints(pattern.sides)}
          fill="none"
          stroke={`var(--element-primary, #CD853F)`}
          strokeWidth="2"
          opacity="0.8"
          style={{ transformOrigin: '50px 50px' }}
          animate={reducedMotion ? {} : {
            rotate: [0, pattern.rotation],
            opacity: [0.8, 0.4, 0.8]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Inner element pattern */}
        {quality === 'high' && (
          <motion.polygon
            points={generatePolygonPoints(pattern.sides, 0.6)}
            fill={`var(--element-primary, #CD853F)`}
            opacity="0.2"
            style={{ transformOrigin: '50px 50px' }}
            animate={reducedMotion ? {} : {
              rotate: [0, -pattern.rotation],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
      </svg>
    </motion.div>
  );
}

/**
 * Shimmer Visualization Layer - The emotional aliveness system
 */
function ShimmerVisualizationLayer({
  state,
  size,
  shimmer,
  shimmerLayers,
  quality,
  reducedMotion
}: {
  state: HoloflowerState;
  size: number;
  shimmer: string;
  shimmerLayers: any[];
  quality: string;
  reducedMotion: boolean;
}) {
  const shimmerEffects = {
    'emotional-resonance': { particles: 20, movement: 'pulse', color: '#FFB6C1' },
    'insight': { particles: 8, movement: 'burst', color: '#FFFFFF' },
    'silence-presence': { particles: 12, movement: 'halo', color: '#F8F8FF' },
    'shadow-depth': { particles: 15, movement: 'deep-pulse', color: '#191970' },
    'cognitive-activation': { particles: 25, movement: 'flicker', color: '#00CED1' },
    'integration': { particles: 18, movement: 'spiral', color: '#DDA0DD' }
  };

  const effect = shimmerEffects[shimmer as keyof typeof shimmerEffects];
  if (!effect) return null;

  return (
    <motion.div
      className={`shimmer-layer shimmer-${shimmer}`}
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        pointerEvents: 'none'
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.2 }}
      transition={{ duration: reducedMotion ? 0.1 : 0.6 }}
    >
      {/* Shimmer particles */}
      {Array.from({ length: quality === 'high' ? effect.particles : Math.ceil(effect.particles / 2) }).map((_, i) => (
        <ShimmerParticle
          key={i}
          index={i}
          total={effect.particles}
          movement={effect.movement}
          color={effect.color}
          size={size}
          reducedMotion={reducedMotion}
        />
      ))}
    </motion.div>
  );
}

/**
 * Individual Shimmer Particle
 */
function ShimmerParticle({
  index,
  total,
  movement,
  color,
  size,
  reducedMotion
}: {
  index: number;
  total: number;
  movement: string;
  color: string;
  size: number;
  reducedMotion: boolean;
}) {
  const angle = (index / total) * 360;
  const radius = 30 + (index % 3) * 10;

  const x = 50 + Math.cos(angle * Math.PI / 180) * radius;
  const y = 50 + Math.sin(angle * Math.PI / 180) * radius;

  const animations = {
    pulse: {
      scale: [1, 1.5, 1],
      opacity: [0.7, 1, 0.7]
    },
    burst: {
      scale: [0, 2, 0],
      opacity: [0, 1, 0],
      x: [x, x + Math.cos(angle * Math.PI / 180) * 20, x],
      y: [y, y + Math.sin(angle * Math.PI / 180) * 20, y]
    },
    halo: {
      scale: [1, 1.2, 1],
      opacity: [0.5, 0.8, 0.5]
    },
    'deep-pulse': {
      scale: [1, 0.8, 1.4, 1],
      opacity: [0.8, 0.4, 0.9, 0.8]
    },
    flicker: {
      opacity: [1, 0, 1, 0.5, 1]
    },
    spiral: {
      rotate: [0, 360],
      scale: [1, 1.3, 1]
    }
  };

  return (
    <motion.div
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        width: '4px',
        height: '4px',
        background: color,
        borderRadius: '50%',
        transform: 'translate(-50%, -50%)'
      }}
      animate={reducedMotion ? {} : animations[movement as keyof typeof animations]}
      transition={{
        duration: movement === 'flicker' ? 0.4 : movement === 'burst' ? 0.8 : 2,
        repeat: Infinity,
        delay: index * 0.1,
        ease: movement === 'burst' ? "easeOut" : "easeInOut"
      }}
    />
  );
}

/**
 * Voice Activity Overlay - Shows voice interaction states
 */
function VoiceActivityOverlay({
  size,
  isListening,
  isSpeaking,
  voiceLevel,
  modeColor,
  reducedMotion
}: {
  size: number;
  isListening: boolean;
  isSpeaking: boolean;
  voiceLevel: number;
  modeColor: string;
  reducedMotion: boolean;
}) {
  return (
    <div className="voice-overlay" style={{ position: 'absolute', width: '100%', height: '100%' }}>
      {/* Listening pulse */}
      {isListening && (
        <motion.div
          style={{
            position: 'absolute',
            width: '120%',
            height: '120%',
            top: '-10%',
            left: '-10%',
            border: `2px solid ${modeColor}`,
            borderRadius: '50%',
            opacity: 0
          }}
          animate={reducedMotion ? {} : {
            scale: [1, 1.3],
            opacity: [0.6, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeOut"
          }}
        />
      )}

      {/* Speaking indicator */}
      {isSpeaking && (
        <motion.div
          style={{
            position: 'absolute',
            width: '110%',
            height: '110%',
            top: '-5%',
            left: '-5%',
            background: `radial-gradient(circle, transparent 70%, ${modeColor}20 100%)`,
            borderRadius: '50%'
          }}
          animate={reducedMotion ? {} : {
            opacity: [0.3, 0.7, 0.3]
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity
          }}
        />
      )}

      {/* Voice level indicator */}
      {voiceLevel > 0.1 && (
        <motion.div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${modeColor}${Math.floor(voiceLevel * 50).toString(16).padStart(2, '0')} 0%, transparent 60%)`
          }}
          animate={reducedMotion ? {} : {
            scale: 1 + (voiceLevel * 0.2)
          }}
          transition={{
            duration: 0.1
          }}
        />
      )}
    </div>
  );
}

/**
 * Debug Information Overlay
 */
function DebugInfoOverlay({
  state,
  flow,
  coherence,
  intensity,
  isTransitioning
}: {
  state: HoloflowerState;
  flow: string;
  coherence: number;
  intensity: number;
  isTransitioning: boolean;
}) {
  return (
    <div
      className="debug-overlay"
      style={{
        position: 'absolute',
        top: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '8px',
        borderRadius: '4px',
        fontSize: '10px',
        whiteSpace: 'nowrap',
        marginTop: '10px'
      }}
    >
      <div>{flow}</div>
      <div>Coherence: {coherence.toFixed(2)}</div>
      <div>Intensity: {intensity.toFixed(2)}</div>
      {isTransitioning && <div style={{ color: '#ffaa00' }}>Transitioning</div>}
      {state.shimmer && <div>Shimmer: {state.shimmer}</div>}
    </div>
  );
}

/**
 * Helper function to generate polygon points for sacred geometry
 */
function generatePolygonPoints(sides: number, scale: number = 1): string {
  const points = [];
  for (let i = 0; i < sides; i++) {
    const angle = (i * 2 * Math.PI) / sides - Math.PI / 2; // Start from top
    const x = 50 + Math.cos(angle) * 40 * scale;
    const y = 50 + Math.sin(angle) * 40 * scale;
    points.push(`${x},${y}`);
  }
  return points.join(' ');
}

export default AdvancedHoloflower;