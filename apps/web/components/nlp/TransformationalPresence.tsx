/**
 * 🧠 TRANSFORMATIONAL PRESENCE - NLP-Informed Interface
 *
 * This component creates transformational experiences through unconscious
 * pattern installation rather than cognitive explanation.
 *
 * PRINCIPLE: The interface itself induces the state.
 *
 * Like Kelly's book - written to create transformation through the reading
 * experience itself, not through explanation of transformation.
 *
 * NLP Patterns Used:
 * - Pace and Lead: Match user's rhythm, then guide deeper
 * - Embedded Commands: Visual/somatic cues bypass conscious mind
 * - State Anchoring: Colors, rhythms, and gestures anchor states
 * - Somatic Entrainment: Breathing animations entrain user's physiology
 * - Unconscious Induction: Experience teaches, not explanation
 */

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type PresenceState = 'dialogue' | 'patient' | 'scribe';

export interface PresenceTransition {
  from: PresenceState;
  to: PresenceState;
  trigger: 'automatic' | 'gesture' | 'breath-sync';
}

interface TransformationalPresenceProps {
  currentState: PresenceState;
  onStateChange?: (state: PresenceState, transition: PresenceTransition) => void;
  userSilenceDuration?: number; // Track how long user has been silent
  userSpeechTempo?: number; // Words per minute (to detect pacing)
  isListening?: boolean;
  isSpeaking?: boolean;
  children?: React.ReactNode; // Holoflower or other content to wrap
  biometricEnabled?: boolean; // Enable Apple Watch / health data integration
}

/**
 * State configurations - unconscious signals
 */
const STATE_ESSENCE = {
  dialogue: {
    breathCycle: 4000, // 4 seconds (2s in, 2s out) - conversational
    colorTemp: '#D4B896', // Warm gold - active, engaged, solar
    fieldRadius: 250, // Intimate - close connection
    glowIntensity: 0.7,
    silenceThreshold: 3500, // Quick response expected
    description: 'conversational rhythm' // For accessibility only
  },
  patient: {
    breathCycle: 8000, // 8 seconds (4s in, 4s out) - contemplative
    colorTemp: '#9370DB', // Soft purple - deep, emotional, lunar
    fieldRadius: 400, // Expanded - room to feel
    glowIntensity: 0.5,
    silenceThreshold: 8000, // Longer pauses welcome
    description: 'deep listening space'
  },
  scribe: {
    breathCycle: 12000, // 12 seconds (6s in, 6s out) - meditative
    colorTemp: '#4682B4', // Cool blue - vast, witnessing, cosmic
    fieldRadius: 600, // Vast - infinite container
    glowIntensity: 0.3,
    silenceThreshold: 999999, // Manual trigger only
    description: 'witnessing presence'
  }
};

export const TransformationalPresence: React.FC<TransformationalPresenceProps> = ({
  currentState,
  onStateChange,
  userSilenceDuration = 0,
  userSpeechTempo = 120,
  isListening = false,
  isSpeaking = false,
  children,
  biometricEnabled = false,
  showChatInterface = false,
  onToggleVoiceText
}) => {
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'exhale'>('inhale');
  const [transitionProgress, setTransitionProgress] = useState(0);
  const [suggestedState, setSuggestedState] = useState<PresenceState | null>(null);
  const [coherenceScore, setCoherenceScore] = useState<number | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Track if biometric monitoring has been initialized to prevent duplicate starts
  const biometricMonitoringStarted = React.useRef(false);

  // Ensure client-side rendering for animations to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Defensive: ensure currentState maps to a valid essence, fallback to dialogue
  const essence = STATE_ESSENCE[currentState] || STATE_ESSENCE['dialogue'];

  /**
   * BREATHING ANIMATION - Entrainment Device
   * The visual breathing unconsciously entrains user's actual breathing
   */
  useEffect(() => {
    if (!essence) return; // Safety guard
    const halfCycle = essence.breathCycle / 2;

    const breathInterval = setInterval(() => {
      setBreathPhase(prev => prev === 'inhale' ? 'exhale' : 'inhale');
    }, halfCycle);

    return () => clearInterval(breathInterval);
  }, [essence.breathCycle]);

  /**
   * BIOMETRIC MONITORING - Apple Watch / Health Data Integration
   * Monitor HRV and suggest states based on coherence
   */
  useEffect(() => {
    if (!biometricEnabled || typeof window === 'undefined') return;

    // Prevent duplicate monitoring sessions
    if (biometricMonitoringStarted.current) return;

    let monitoringInterval: NodeJS.Timeout;

    const startBiometricMonitoring = async () => {
      try {
        // Mark as started to prevent duplicates
        biometricMonitoringStarted.current = true;

        // Dynamically import biometric modules (client-side only)
        const { biometricStorage } = await import('@/lib/biometrics/BiometricStorage');
        const { coherenceDetector } = await import('@/lib/biometrics/CoherenceDetector');

        // Initialize storage (now idempotent - won't log multiple times)
        // Wrap all biometric operations in try-catch to prevent IndexedDB errors
        // from interrupting speech recognition during long Scribe Mode sessions
        try {
          await biometricStorage.init();

          // Check if we have health data
          const hasData = await biometricStorage.hasHealthData();
          if (!hasData) {
            console.log('⌚ No health data imported yet');
            return;
          }

          // Load recent health data
          const healthData = await biometricStorage.getLatestHealthData();
          if (healthData) {
            // Load HRV history (last 60 minutes)
            coherenceDetector.loadHistory(healthData, 60);
          }
        } catch (error) {
          // Silent fail - don't interrupt speech recognition if biometric data unavailable
          console.log('⌚ Biometric monitoring unavailable (database connection issue), continuing without biometric data');
          return; // Exit gracefully without starting interval
        }

        // Monitor coherence every 30 seconds
        monitoringInterval = setInterval(async () => {
          try {
            const latestHRV = await biometricStorage.getLatestHRV();
            if (latestHRV) {
              coherenceDetector.addReading(latestHRV);
            }

            // Analyze coherence
            const coherence = coherenceDetector.analyzeCoherence();
            setCoherenceScore(coherence.score);

            console.log('⌚ Coherence:', {
              level: coherence.level,
              score: coherence.score,
              trend: coherence.trend,
              suggested: coherence.suggestedPresenceState
            });

            // Should we suggest state transition?
            const shouldTransition = coherenceDetector.shouldSuggestTransition(
              currentState,
              coherence
            );

            if (shouldTransition) {
              console.log('🌀 Biometric suggests:', coherence.suggestedPresenceState);
              setSuggestedState(coherence.suggestedPresenceState);

              // Auto-transition for strong signals
              if (coherence.confidence > 0.8) {
                onStateChange?.(coherence.suggestedPresenceState, {
                  from: currentState,
                  to: coherence.suggestedPresenceState,
                  trigger: 'automatic' // Biometric-driven automatic transition
                });
              }
            }
          } catch (error) {
            // Silent fail on polling errors - don't log to avoid console spam
            // This prevents IndexedDB connection errors from interrupting speech recognition
          }
        }, 30000); // Every 30 seconds
      } catch (error) {
        console.error('❌ Biometric monitoring error:', error);
        // Reset flag on error so it can be retried
        biometricMonitoringStarted.current = false;
      }
    };

    startBiometricMonitoring();

    return () => {
      if (monitoringInterval) {
        clearInterval(monitoringInterval);
      }
      // Reset flag on cleanup
      biometricMonitoringStarted.current = false;
    };
  }, [biometricEnabled, currentState, onStateChange]);

  /**
   * AUTOMATIC STATE DETECTION - Pace and Lead (Voice-based)
   * Interface detects user's rhythm and suggests deeper states
   */
  useEffect(() => {
    // If user's pauses are lengthening beyond current threshold
    if (userSilenceDuration > essence.silenceThreshold * 1.5) {
      // Suggest deeper state
      if (currentState === 'dialogue') {
        setSuggestedState('patient');
      } else if (currentState === 'patient') {
        setSuggestedState('scribe');
      }
    }

    // If user's speech is very fast (> 180 wpm), suggest dialogue
    if (userSpeechTempo > 180 && currentState !== 'dialogue') {
      setSuggestedState('dialogue');
    }
  }, [userSilenceDuration, userSpeechTempo, currentState, essence.silenceThreshold]);

  /**
   * SUBTLE STATE TRANSITION
   * When state suggestion is made, begin subtle visual transition
   * User can accept (do nothing) or reject (gesture)
   */
  useEffect(() => {
    if (suggestedState && suggestedState !== currentState) {
      // Begin subtle transition over 10 seconds
      let progress = 0;
      const transitionInterval = setInterval(() => {
        progress += 0.01; // 1% per 100ms = 10 seconds to full transition
        setTransitionProgress(progress);

        if (progress >= 1) {
          // Transition complete - shift state
          onStateChange?.(suggestedState, {
            from: currentState,
            to: suggestedState,
            trigger: 'automatic'
          });
          setSuggestedState(null);
          setTransitionProgress(0);
          clearInterval(transitionInterval);
        }
      }, 100);

      return () => clearInterval(transitionInterval);
    }
  }, [suggestedState, currentState, onStateChange]);

  /**
   * GESTURE DETECTION
   * Swipe down = deepen (dialogue → patient → scribe)
   * Swipe up = quicken (scribe → patient → dialogue)
   * Touch and hold = stay in current state (reject suggestion)
   */
  const handleGesture = useCallback((direction: 'deepen' | 'quicken' | 'stay') => {
    if (direction === 'stay') {
      // Cancel any suggested transition
      setSuggestedState(null);
      setTransitionProgress(0);
      return;
    }

    let newState: PresenceState = currentState;

    if (direction === 'deepen') {
      if (currentState === 'dialogue') newState = 'patient';
      else if (currentState === 'patient') newState = 'scribe';
    } else if (direction === 'quicken') {
      if (currentState === 'scribe') newState = 'patient';
      else if (currentState === 'patient') newState = 'dialogue';
    }

    if (newState !== currentState) {
      onStateChange?.(newState, {
        from: currentState,
        to: newState,
        trigger: 'gesture'
      });
    }
  }, [currentState, onStateChange]);

  /**
   * VISUAL FIELD - Ambient Container
   * Expands/contracts based on state
   * Color shifts unconsciously signal state change
   */
  const currentColor = transitionProgress > 0 && suggestedState
    ? interpolateColor(
        essence.colorTemp,
        STATE_ESSENCE[suggestedState].colorTemp,
        transitionProgress
      )
    : essence.colorTemp;

  const currentRadius = transitionProgress > 0 && suggestedState
    ? essence.fieldRadius + (STATE_ESSENCE[suggestedState].fieldRadius - essence.fieldRadius) * transitionProgress
    : essence.fieldRadius;

  // Prevent hydration mismatch by only rendering animations on client
  if (!isMounted) {
    return (
      <div
        className="transformational-presence"
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {/* Render children immediately for SSR */}
        <div className="holoflower-core" style={{ position: 'relative', zIndex: 10 }}>
          {children}
        </div>
      </div>
    );
  }

  return (
    <div
      className="transformational-presence"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      suppressHydrationWarning
    >
      {/* AMBIENT FIELD - Unconscious State Indicator */}
      <motion.div
        className="ambient-field"
        animate={{
          width: currentRadius * 2,
          height: currentRadius * 2,
          opacity: essence.glowIntensity * (breathPhase === 'inhale' ? 1 : 0.7),
          filter: `blur(${breathPhase === 'inhale' ? 40 : 60}px)`
        }}
        transition={{
          width: { duration: 2, ease: 'easeInOut' },
          height: { duration: 2, ease: 'easeInOut' },
          opacity: { duration: essence.breathCycle / 2000, ease: 'easeInOut' },
          filter: { duration: essence.breathCycle / 2000, ease: 'easeInOut' }
        }}
        style={{
          position: 'absolute',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${currentColor}40, ${currentColor}10, transparent)`,
          pointerEvents: 'none'
        }}
      />

      {/* BREATHING INDICATOR - Somatic Entrainment */}
      <motion.div
        className="breath-ring"
        animate={{
          scale: breathPhase === 'inhale' ? 1.1 : 1,
          opacity: breathPhase === 'inhale' ? 0.7 : 0.4
        }}
        transition={{
          duration: essence.breathCycle / 2000,
          ease: 'easeInOut'
        }}
        style={{
          position: 'absolute',
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: `radial-gradient(circle, transparent 45%, ${currentColor}20 60%, ${currentColor}40 75%, transparent 100%)`,
          boxShadow: `
            0 0 30px ${currentColor}40,
            0 0 50px ${currentColor}20,
            inset 0 0 30px ${currentColor}15
          `,
          filter: 'blur(2px)',
          pointerEvents: 'none'
        }}
      />

      {/* COHERENCE INDICATOR - Subtle biometric visualization */}
      {biometricEnabled && coherenceScore !== null && (
        <motion.div
          className="coherence-glow"
          animate={{
            opacity: coherenceScore / 200, // 0-0.5 (subtle)
            scale: [1, 1.02, 1],
          }}
          transition={{
            opacity: { duration: 2 },
            scale: { duration: 4, repeat: Infinity, ease: 'easeInOut' }
          }}
          style={{
            position: 'absolute',
            width: currentRadius * 2.2,
            height: currentRadius * 2.2,
            borderRadius: '50%',
            background: `radial-gradient(circle,
              rgba(100, 200, 150, ${coherenceScore / 400}) 0%,
              transparent 60%)`,
            pointerEvents: 'none',
            zIndex: 1,
            filter: `hue-rotate(${coherenceScore * 1.2}deg)` // 0° (red/low) → 120° (green/high)
          }}
        />
      )}

      {/* MODE SWITCHER REMOVED - Now controlled from top navigation bar in page.tsx */}

      {/* HOLOFLOWER CORE - Children rendered here inherit state transformations */}
      <div className="holoflower-core" style={{ position: 'relative', zIndex: 10 }}>
        {children}
      </div>

      {/* GESTURE DETECTION OVERLAY */}
      <div
        className="gesture-overlay"
        style={{
          position: 'absolute',
          inset: 0,
          touchAction: 'pan-y'
        }}
        onTouchStart={(e) => {
          const touch = e.touches[0];
          const startY = touch.clientY;
          const startTime = Date.now();

          const handleTouchMove = (moveEvent: TouchEvent) => {
            const currentTouch = moveEvent.touches[0];
            const deltaY = currentTouch.clientY - startY;

            if (Math.abs(deltaY) > 50) {
              if (deltaY > 0) handleGesture('deepen'); // Swipe down
              else handleGesture('quicken'); // Swipe up

              document.removeEventListener('touchmove', handleTouchMove);
              document.removeEventListener('touchend', handleTouchEnd);
            }
          };

          const handleTouchEnd = () => {
            const duration = Date.now() - startTime;
            if (duration > 1000) {
              // Long press = stay
              handleGesture('stay');
            }
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleTouchEnd);
          };

          document.addEventListener('touchmove', handleTouchMove);
          document.addEventListener('touchend', handleTouchEnd);
        }}
      />

      {/* ACCESSIBILITY: Screen reader only */}
      <div className="sr-only" aria-live="polite">
        {currentState === 'dialogue' && 'Conversational rhythm'}
        {currentState === 'patient' && 'Deep listening space'}
        {currentState === 'scribe' && 'Witnessing presence'}
      </div>
    </div>
  );
};

/**
 * Color interpolation helper
 */
function interpolateColor(color1: string, color2: string, progress: number): string {
  const c1 = hexToRgb(color1);
  const c2 = hexToRgb(color2);

  if (!c1 || !c2) return color1;

  const r = Math.round(c1.r + (c2.r - c1.r) * progress);
  const g = Math.round(c1.g + (c2.g - c1.g) * progress);
  const b = Math.round(c1.b + (c2.b - c1.b) * progress);

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}
