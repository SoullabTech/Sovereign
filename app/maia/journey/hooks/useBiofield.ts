/**
 * useBiofield Hook - Journey Page Phase 5
 *
 * Unified hook for biofield data streaming.
 * Orchestrates HRV, voice, and breath sensors.
 *
 * Phase: 4.4-C Phase 5 (Biofield Integration)
 * Created: December 23, 2024
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  HRVBridge,
  VoiceProsodyAnalyzer,
  BreathDetector,
  type HRVData,
  type VoiceData,
  type BreathData,
  type HRVSource,
  type BreathMode,
} from '../lib/biofield/sensors';
import {
  calculateBiofieldCoherence,
  mapCoherenceToVisual,
  mapCoherenceToAudio,
  type BiofieldCoherence,
  type VisualParams,
  type AudioParams,
} from '../lib/biofield/mappers';

// ============================================================================
// Types
// ============================================================================

export interface UseBiofieldOptions {
  /** HRV source (default: 'stub') */
  hrvSource?: HRVSource;

  /** Breath detection mode (default: 'microphone') */
  breathMode?: BreathMode;

  /** Enable HRV sensor */
  enableHRV?: boolean;

  /** Enable voice analysis */
  enableVoice?: boolean;

  /** Enable breath detection */
  enableBreath?: boolean;

  /** Auto-connect on mount */
  autoConnect?: boolean;

  /** Enable debug logging */
  debug?: boolean;
}

export interface BiofieldState {
  // Raw sensor data
  hrv: HRVData | null;
  voice: VoiceData | null;
  breath: BreathData | null;

  // Derived coherence
  coherence: BiofieldCoherence | null;

  // Mapped parameters
  visualParams: VisualParams | null;
  audioParams: AudioParams | null;

  // Connection state
  connected: boolean;
  connecting: boolean;
  sources: {
    hrv: boolean;
    voice: boolean;
    breath: boolean;
  };

  // Error state
  error: Error | null;
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * useBiofield Hook
 *
 * Provides unified access to biofield sensors (HRV, voice, breath).
 * Automatically calculates coherence and maps to visual/audio parameters.
 *
 * @example
 * ```tsx
 * const biofield = useBiofield({
 *   hrvSource: 'polar-h10',
 *   enableVoice: true,
 *   enableBreath: true,
 *   autoConnect: false,
 * });
 *
 * // Connect to sensors
 * const handleConnect = async () => {
 *   await biofield.connect();
 * };
 *
 * // Use coherence data
 * useEffect(() => {
 *   if (biofield.coherence) {
 *     console.log('Combined coherence:', biofield.coherence.combined);
 *   }
 * }, [biofield.coherence]);
 *
 * // Clean up on unmount
 * useEffect(() => {
 *   return () => biofield.disconnect();
 * }, []);
 * ```
 */
export function useBiofield(options: UseBiofieldOptions = {}) {
  const {
    hrvSource = 'stub',
    breathMode = 'microphone',
    enableHRV = true,
    enableVoice = true,
    enableBreath = true,
    autoConnect = false,
    debug = false,
  } = options;

  // State
  const [state, setState] = useState<BiofieldState>({
    hrv: null,
    voice: null,
    breath: null,
    coherence: null,
    visualParams: null,
    audioParams: null,
    connected: false,
    connecting: false,
    sources: {
      hrv: false,
      voice: false,
      breath: false,
    },
    error: null,
  });

  // Sensor instances (persistent across renders)
  const sensorsRef = useRef<{
    hrv: HRVBridge | null;
    voice: VoiceProsodyAnalyzer | null;
    breath: BreathDetector | null;
  }>({
    hrv: null,
    voice: null,
    breath: null,
  });

  // Base color for visual modulation (can be customized)
  const baseColorRef = useRef('#3B82F6'); // Default: blue (Water element)

  // ============================================================================
  // Sensor Data Handlers
  // ============================================================================

  const handleHRVData = useCallback((data: HRVData) => {
    setState((prev) => {
      const newState = { ...prev, hrv: data };

      // Recalculate coherence and parameters
      const coherence = calculateBiofieldCoherence(data, prev.voice, prev.breath);
      const visualParams = mapCoherenceToVisual(baseColorRef.current, coherence);
      const audioParams = mapCoherenceToAudio(coherence);

      return {
        ...newState,
        coherence,
        visualParams,
        audioParams,
      };
    });
  }, []);

  const handleVoiceData = useCallback((data: VoiceData) => {
    setState((prev) => {
      const newState = { ...prev, voice: data };

      // Recalculate coherence and parameters
      const coherence = calculateBiofieldCoherence(prev.hrv, data, prev.breath);
      const visualParams = mapCoherenceToVisual(baseColorRef.current, coherence);
      const audioParams = mapCoherenceToAudio(coherence);

      return {
        ...newState,
        coherence,
        visualParams,
        audioParams,
      };
    });
  }, []);

  const handleBreathData = useCallback((data: BreathData) => {
    setState((prev) => {
      const newState = { ...prev, breath: data };

      // Recalculate coherence and parameters
      const coherence = calculateBiofieldCoherence(prev.hrv, prev.voice, data);
      const visualParams = mapCoherenceToVisual(baseColorRef.current, coherence);
      const audioParams = mapCoherenceToAudio(coherence);

      return {
        ...newState,
        coherence,
        visualParams,
        audioParams,
      };
    });
  }, []);

  // ============================================================================
  // Connection Management
  // ============================================================================

  const connect = useCallback(async () => {
    setState((prev) => ({ ...prev, connecting: true, error: null }));

    try {
      // Initialize HRV sensor
      if (enableHRV && !sensorsRef.current.hrv) {
        sensorsRef.current.hrv = new HRVBridge({ source: hrvSource, debug });
        await sensorsRef.current.hrv.connect();
        sensorsRef.current.hrv.onData(handleHRVData);
        log('[useBiofield] HRV connected');
      }

      // Initialize voice analyzer
      if (enableVoice && !sensorsRef.current.voice) {
        sensorsRef.current.voice = new VoiceProsodyAnalyzer({ debug });
        await sensorsRef.current.voice.start();
        sensorsRef.current.voice.onData(handleVoiceData);
        log('[useBiofield] Voice connected');
      }

      // Initialize breath detector
      if (enableBreath && !sensorsRef.current.breath) {
        sensorsRef.current.breath = new BreathDetector({ debug });
        await sensorsRef.current.breath.start(breathMode);
        sensorsRef.current.breath.onData(handleBreathData);
        log('[useBiofield] Breath connected');
      }

      setState((prev) => ({
        ...prev,
        connected: true,
        connecting: false,
        sources: {
          hrv: sensorsRef.current.hrv?.connected || false,
          voice: sensorsRef.current.voice?.active || false,
          breath: sensorsRef.current.breath?.active || false,
        },
      }));
    } catch (error) {
      console.error('[useBiofield] Connection failed:', error);
      setState((prev) => ({
        ...prev,
        connecting: false,
        error: error instanceof Error ? error : new Error('Connection failed'),
      }));
    }
  }, [enableHRV, enableVoice, enableBreath, hrvSource, breathMode, debug, handleHRVData, handleVoiceData, handleBreathData]);

  const disconnect = useCallback(() => {
    if (sensorsRef.current.hrv) {
      sensorsRef.current.hrv.disconnect();
      sensorsRef.current.hrv = null;
      log('[useBiofield] HRV disconnected');
    }

    if (sensorsRef.current.voice) {
      sensorsRef.current.voice.stop();
      sensorsRef.current.voice = null;
      log('[useBiofield] Voice disconnected');
    }

    if (sensorsRef.current.breath) {
      sensorsRef.current.breath.stop();
      sensorsRef.current.breath = null;
      log('[useBiofield] Breath disconnected');
    }

    setState((prev) => ({
      ...prev,
      connected: false,
      sources: {
        hrv: false,
        voice: false,
        breath: false,
      },
    }));
  }, []);

  // ============================================================================
  // Lifecycle
  // ============================================================================

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  // ============================================================================
  // Public API
  // ============================================================================

  const setBaseColor = useCallback((color: string) => {
    baseColorRef.current = color;

    // Recalculate visual params with new color
    setState((prev) => {
      if (!prev.coherence) return prev;

      const visualParams = mapCoherenceToVisual(color, prev.coherence);
      return { ...prev, visualParams };
    });
  }, []);

  // ============================================================================
  // Utils
  // ============================================================================

  function log(...args: any[]): void {
    if (debug) {
      console.log(...args);
    }
  }

  // ============================================================================
  // Return
  // ============================================================================

  return {
    // State
    ...state,

    // Actions
    connect,
    disconnect,
    setBaseColor,

    // Computed
    isActive:
      state.sources.hrv || state.sources.voice || state.sources.breath,
  };
}

// ============================================================================
// Convenience Hook: useBiofieldForThread
// ============================================================================

/**
 * Convenience hook that automatically sets base color from thread element.
 *
 * @example
 * ```tsx
 * const biofield = useBiofieldForThread('water', {
 *   enableVoice: true,
 *   autoConnect: true,
 * });
 * ```
 */
export function useBiofieldForThread(
  element: string,
  options: UseBiofieldOptions = {}
) {
  const biofield = useBiofield(options);

  // Element color mapping
  useEffect(() => {
    const elementColors: Record<string, string> = {
      earth: '#10B981', // Green
      water: '#3B82F6', // Blue
      fire: '#EF4444',  // Red
      air: '#8B5CF6',   // Purple
      aether: '#A78BFA', // Light purple
    };

    const color = elementColors[element] || elementColors.water;
    biofield.setBaseColor(color);
  }, [element, biofield]);

  return biofield;
}
