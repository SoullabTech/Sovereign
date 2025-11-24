/**
 * MAIA Holoflower V3 - React Integration Hook
 * Bridges MAIA consciousness → UI
 *
 * This hook provides the React interface to the Holoflower State Machine,
 * making the tri-layer consciousness system available to React components.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { HoloflowerStateMachine, HoloflowerState, ConversationContext } from './holoflowerStateMachine';

/**
 * Hook Configuration
 */
interface HoloflowerConfig {
  // Auto-detection settings
  enableAutoDetection?: boolean;
  silenceThreshold?: number; // milliseconds

  // Performance settings
  updateThrottle?: number; // milliseconds between updates

  // Initial state
  initialMode?: 'dialogue' | 'patient' | 'scribe' | 'aether';
  initialElement?: 'fire' | 'water' | 'earth' | 'air' | 'aether';

  // Debug mode
  debug?: boolean;
}

/**
 * Hook Return Value
 */
interface HoloflowerHookReturn {
  // Current state
  state: HoloflowerState;
  cssVariables: Record<string, string>;

  // Control methods
  updateContext: (context: ConversationContext) => void;
  forceMode: (mode: 'dialogue' | 'patient' | 'scribe' | 'aether') => void;
  forceElement: (element: 'fire' | 'water' | 'earth' | 'air' | 'aether') => void;
  reset: () => void;

  // State queries
  isTransitioning: boolean;
  coherence: number;
  intensity: number;

  // History and analytics
  getHistory: () => HoloflowerState[];
  getCurrentFlow: () => string;
}

/**
 * Main Holoflower React Hook
 */
export function useHoloflowerState(config: HoloflowerConfig = {}): HoloflowerHookReturn {
  const {
    enableAutoDetection = true,
    silenceThreshold = 3000,
    updateThrottle = 100,
    initialMode = 'dialogue',
    initialElement = 'air',
    debug = false
  } = config;

  // State machine instance (persisted across renders)
  const stateMachineRef = useRef<HoloflowerStateMachine>();

  // React state
  const [currentState, setCurrentState] = useState<HoloflowerState>(() => {
    if (!stateMachineRef.current) {
      stateMachineRef.current = new HoloflowerStateMachine({
        mode: initialMode,
        element: initialElement
      });
    }
    return stateMachineRef.current.getCurrentState();
  });

  // CSS variables (memoized)
  const [cssVariables, setCssVariables] = useState<Record<string, string>>({});

  // Auto-detection state
  const silenceTimerRef = useRef<NodeJS.Timeout>();
  const lastUpdateRef = useRef<number>(0);
  const [silenceDuration, setSilenceDuration] = useState(0);

  // Initialize state machine if needed
  useEffect(() => {
    if (!stateMachineRef.current) {
      stateMachineRef.current = new HoloflowerStateMachine({
        mode: initialMode,
        element: initialElement
      });
    }

    // Subscribe to state changes
    const unsubscribe = stateMachineRef.current.subscribe((newState) => {
      setCurrentState(newState);
      setCssVariables(stateMachineRef.current!.getCSSVariables());

      if (debug) {
        console.log('🌺 Holoflower state updated:', {
          mode: newState.mode,
          element: newState.element,
          shimmer: newState.shimmer,
          coherence: newState.coherence.toFixed(2),
          intensity: newState.intensity.toFixed(2)
        });
      }
    });

    return unsubscribe;
  }, [initialMode, initialElement, debug]);

  // Silence detection for auto-mode
  useEffect(() => {
    if (!enableAutoDetection) return;

    const updateSilence = () => {
      setSilenceDuration(prev => prev + 100);
    };

    const interval = setInterval(updateSilence, 100);
    return () => clearInterval(interval);
  }, [enableAutoDetection]);

  // Throttled update function
  const updateContext = useCallback((context: ConversationContext) => {
    const now = Date.now();
    if (now - lastUpdateRef.current < updateThrottle) return;
    lastUpdateRef.current = now;

    // Reset silence timer when there's activity
    if (context.userSpeaking || context.maiaSpeaking) {
      setSilenceDuration(0);
    }

    // Add auto-detected silence duration
    const enhancedContext = {
      ...context,
      silenceDuration: context.silenceDuration ?? silenceDuration
    };

    stateMachineRef.current?.updateState(enhancedContext);
  }, [updateThrottle, silenceDuration]);

  // Force mode change (for manual control)
  const forceMode = useCallback((mode: 'dialogue' | 'patient' | 'scribe' | 'aether') => {
    updateContext({ messageType: mode === 'dialogue' ? 'collaborative' :
                    mode === 'patient' ? 'therapeutic' :
                    mode === 'scribe' ? 'analytical' : 'contemplative' });
  }, [updateContext]);

  // Force element change
  const forceElement = useCallback((element: 'fire' | 'water' | 'earth' | 'air' | 'aether') => {
    const processingTypeMap = {
      fire: 'breakthrough',
      water: 'depth-work',
      earth: 'structuring',
      air: 'clarifying',
      aether: 'transcending'
    } as const;

    updateContext({ processingType: processingTypeMap[element] });
  }, [updateContext]);

  // Reset state machine
  const reset = useCallback(() => {
    if (stateMachineRef.current) {
      stateMachineRef.current = new HoloflowerStateMachine({
        mode: initialMode,
        element: initialElement
      });
    }
    setSilenceDuration(0);
  }, [initialMode, initialElement]);

  // Get state history
  const getHistory = useCallback(() => {
    return stateMachineRef.current?.getStateHistory() ?? [];
  }, []);

  // Get current flow description
  const getCurrentFlow = useCallback(() => {
    const state = currentState;
    const flow = [];

    flow.push(`Mode: ${state.mode}`);
    flow.push(`Element: ${state.element}`);
    if (state.shimmer) {
      flow.push(`Shimmer: ${state.shimmer}`);
    }

    if (state.isTransitioning) {
      flow.push('(transitioning)');
    }

    return flow.join(' → ');
  }, [currentState]);

  return {
    // Current state
    state: currentState,
    cssVariables,

    // Control methods
    updateContext,
    forceMode,
    forceElement,
    reset,

    // State queries
    isTransitioning: currentState.isTransitioning,
    coherence: currentState.coherence,
    intensity: currentState.intensity,

    // History and analytics
    getHistory,
    getCurrentFlow
  };
}

/**
 * Simplified hook for basic usage
 */
export function useBasicHoloflower() {
  return useHoloflowerState({
    enableAutoDetection: true,
    debug: false
  });
}

/**
 * Hook for manual control (no auto-detection)
 */
export function useManualHoloflower() {
  return useHoloflowerState({
    enableAutoDetection: false,
    debug: false
  });
}

/**
 * Hook for development/debugging
 */
export function useDebugHoloflower() {
  return useHoloflowerState({
    enableAutoDetection: true,
    debug: true,
    updateThrottle: 50 // Faster updates for debugging
  });
}

/**
 * Hook factory for voice integration
 */
export function useVoiceHoloflower(
  voiceActive: boolean,
  transcriptText: string,
  isListening: boolean,
  isSpeaking: boolean
) {
  const holoflower = useHoloflowerState();

  useEffect(() => {
    holoflower.updateContext({
      userMessage: transcriptText,
      userSpeaking: voiceActive && !isListening,
      maiaSpeaking: isSpeaking,
      maiaListening: isListening
    });
  }, [voiceActive, transcriptText, isListening, isSpeaking, holoflower]);

  return holoflower;
}