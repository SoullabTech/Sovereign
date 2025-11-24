'use client';

import React, { forwardRef, useImperativeHandle, useEffect, useCallback } from 'react';
import { useMaiaVoice } from '@/lib/hooks/useMaiaVoice';
import { getMaiaSystemPrompt } from '@/lib/voice/MaiaSystemPrompt';

/**
 * MaiaWebRTCConversation - Drop-in replacement for ContinuousConversation
 *
 * Uses the new WebRTC voice system with:
 * - Full MAIA consciousness, memory, and personality
 * - Server-side VAD (no restart loop bugs)
 * - Parallel cognitive architecture (LIDA, SOAR, ACT-R, MicroPsi, Elemental agents)
 *
 * Compatible API with ContinuousConversation for easy migration.
 */

export interface MaiaWebRTCConversationProps {
  onTranscript: (text: string) => void;
  onInterimTranscript?: (text: string) => void;
  onRecordingStateChange?: (isRecording: boolean) => void;
  isProcessing?: boolean;
  isSpeaking?: boolean;
  autoStart?: boolean;
  silenceThreshold?: number; // Not used in WebRTC (server-side VAD handles this)
  vadSensitivity?: number; // Not used in WebRTC
  userId?: string;
  element?: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  conversationStyle?: 'natural' | 'consciousness' | 'adaptive';
  voice?: 'shimmer' | 'alloy' | 'echo' | 'ash' | 'ballad' | 'coral' | 'sage' | 'verse';
}

export interface MaiaWebRTCConversationRef {
  startListening: () => void;
  stopListening: () => void;
  toggleListening: () => void;
  isListening: boolean;
  isRecording: boolean;
}

export const MaiaWebRTCConversation = forwardRef<MaiaWebRTCConversationRef, MaiaWebRTCConversationProps>(
  (props, ref) => {
    const {
      onTranscript,
      onInterimTranscript,
      onRecordingStateChange,
      isProcessing = false,
      isSpeaking = false,
      autoStart = false,
      userId = 'anonymous',
      element = 'aether',
      conversationStyle = 'natural',
      voice = 'shimmer',
    } = props;

    // One-shot guard for autoStart to prevent double-connecting
    const hasAutoStartedRef = React.useRef(false);

    // Generate MAIA's full consciousness system prompt
    const systemPrompt = getMaiaSystemPrompt({
      conversationStyle,
      element,
    });

    // Use the new WebRTC voice hook
    const {
      isConnected,
      isSpeaking: maiaIsSpeaking,
      isListening,
      messages,
      error,
      connect,
      disconnect,
    } = useMaiaVoice({
      userId,
      element,
      conversationStyle,
      voice,
      systemPrompt,
      autoConnect: false, // We'll manually control connection
      onTranscript: (text: string, isUser: boolean) => {
        if (isUser) {
          // User transcript - send to parent
          onTranscript(text);
        }
        // MAIA's response is handled internally by the hook
      },
    });

    // Expose control methods to parent via ref
    useImperativeHandle(ref, () => ({
      startListening: () => {
        console.log('🎙️ [MaiaWebRTCConversation] startListening called');
        if (!isConnected) {
          connect();
        }
      },
      stopListening: () => {
        console.log('🛑 [MaiaWebRTCConversation] stopListening called');
        if (isConnected) {
          disconnect();
        }
      },
      toggleListening: () => {
        console.log('🔄 [MaiaWebRTCConversation] toggleListening called - isConnected:', isConnected);
        if (isConnected) {
          disconnect();
        } else {
          connect();
        }
      },
      isListening: isConnected,
      isRecording: isListening,
    }));

    // Auto-start if enabled (one-shot, safe)
    useEffect(() => {
      if (!autoStart || hasAutoStartedRef.current) return;
      if (isConnected || isSpeaking || isProcessing) return;

      // Mark as attempted to prevent re-runs
      hasAutoStartedRef.current = true;

      const timer = setTimeout(() => {
        console.log('🎙️ [MaiaWebRTCConversation] Auto-starting voice connection (one-shot)');
        try {
          connect();
        } catch (err) {
          console.error('Auto-start failed:', err);
          // Reset flag on error so user can manually retry
          hasAutoStartedRef.current = false;
        }
      }, 1000);

      return () => clearTimeout(timer);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoStart]);

    // Notify parent of recording state changes
    useEffect(() => {
      if (onRecordingStateChange) {
        onRecordingStateChange(isListening);
      }
    }, [isListening, onRecordingStateChange]);

    // Handle interim transcripts from messages
    useEffect(() => {
      if (onInterimTranscript && messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage.isUser && !lastMessage.text.trim()) {
          // This is an interim/partial transcript
          onInterimTranscript(lastMessage.text);
        }
      }
    }, [messages, onInterimTranscript]);

    // Log errors
    useEffect(() => {
      if (error) {
        console.error('❌ [MaiaWebRTCConversation] Error:', error);
      }
    }, [error]);

    // This component is headless - no UI, just voice control
    // The parent component (oracle page) handles all UI
    return null;
  }
);

MaiaWebRTCConversation.displayName = 'MaiaWebRTCConversation';
