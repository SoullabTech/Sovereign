"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { MayaHybridVoiceSystem, ConversationState, MayaVoiceConfig } from '@/lib/voice/MayaHybridVoiceSystem';

export interface UseMayaVoiceOptions {
  userId: string;
  characterId?: string;
  element?: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  conversationStyle?: 'natural' | 'consciousness' | 'adaptive';
  previousStyle?: 'natural' | 'consciousness' | 'adaptive';
  enableNudges?: boolean;
  autoStart?: boolean;
  onResponse?: (text: string, audioUrl?: string) => void;
  onError?: (error: string) => void;
}

export interface MayaVoiceControls {
  // State
  state: ConversationState;
  isActive: boolean;
  transcript: string;
  isListening: boolean;
  isSpeaking: boolean;
  isPaused: boolean;

  // Controls
  start: () => Promise<boolean>;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  toggleNudges: () => void;

  // Config
  nudgesEnabled: boolean;
}

/**
 * React hook for Maya Hybrid Voice System
 * Provides complete voice interaction with pause/resume
 */
export function useMayaVoice(options: UseMayaVoiceOptions): MayaVoiceControls {
  const [state, setState] = useState<ConversationState>('dormant');
  const [transcript, setTranscript] = useState('');
  const [nudgesEnabled, setNudgesEnabled] = useState(options.enableNudges ?? false);

  const systemRef = useRef<MayaHybridVoiceSystem | null>(null);

  // Initialize voice system
  useEffect(() => {
    const config: MayaVoiceConfig = {
      userId: options.userId,
      characterId: options.characterId || 'maya-default',
      element: options.element,
      conversationStyle: options.conversationStyle,
      previousStyle: options.previousStyle,
      enableNudges: nudgesEnabled,
      silenceThreshold: 1500,
      nudgeThreshold: 45,
      apiEndpoint: '/api/maya-chat',
    };

    const system = new MayaHybridVoiceSystem(config, {
      onStateChange: (newState) => {
        setState(newState);
      },
      onTranscript: (text, isFinal) => {
        if (isFinal) {
          setTranscript((prev) => prev + ' ' + text);
        }
      },
      onResponse: (text, audioUrl) => {
        options.onResponse?.(text, audioUrl);
      },
      onError: (error) => {
        console.error('Voice system error:', error);
        options.onError?.(error);
      },
      onNudge: () => {
        console.log('👋 Maya nudged');
      },
    });

    systemRef.current = system;

    // Auto-start if requested
    if (options.autoStart) {
      system.start();
    }

    // Cleanup on unmount
    return () => {
      system.destroy();
    };
  }, [options.userId, options.characterId, options.element, options.conversationStyle, options.previousStyle]);

  // Update nudges setting
  useEffect(() => {
    systemRef.current?.setNudgesEnabled(nudgesEnabled);
  }, [nudgesEnabled]);

  // Log element changes for debugging
  useEffect(() => {
    console.log('🎭 Element changed to:', options.element);
  }, [options.element]);

  // Controls
  const start = useCallback(async (): Promise<boolean> => {
    if (!systemRef.current) {
      console.error('Voice system not initialized');
      return false;
    }
    return await systemRef.current.start();
  }, []);

  const stop = useCallback(() => {
    systemRef.current?.stop();
    setTranscript('');
  }, []);

  const pause = useCallback(() => {
    systemRef.current?.pause();
  }, []);

  const resume = useCallback(() => {
    systemRef.current?.resume();
  }, []);

  const toggleNudges = useCallback(() => {
    setNudgesEnabled((prev) => !prev);
  }, []);

  // Derived state
  const isActive = state !== 'dormant';
  const isListening = state === 'listening';
  const isSpeaking = state === 'speaking';
  const isPaused = state === 'paused';

  return {
    state,
    isActive,
    transcript,
    isListening,
    isSpeaking,
    isPaused,
    start,
    stop,
    pause,
    resume,
    toggleNudges,
    nudgesEnabled,
  };
}