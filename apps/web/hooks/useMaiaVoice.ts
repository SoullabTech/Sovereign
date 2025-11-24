"use client";

/**
 * Hook for Maia Realtime Voice using OpenAI WebRTC
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { MaiaRealtimeWebRTC, MaiaRealtimeConfig } from '@/lib/voice/MaiaRealtimeWebRTC';

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export interface UseMaiaVoiceConfig {
  userId: string;
  element: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  conversationStyle?: 'natural' | 'consciousness' | 'adaptive';
  voice?: 'alloy' | 'echo' | 'shimmer' | 'ash' | 'ballad' | 'coral' | 'sage' | 'verse';
  systemPrompt?: string;
  autoConnect?: boolean;
}

export interface UseMaiaVoiceReturn {
  // State
  isConnected: boolean;
  isSpeaking: boolean;
  isListening: boolean;
  messages: Message[];
  error: string | null;

  // Actions
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  sendText: (text: string) => void;
  interrupt: () => void;
}

/**
 * Main hook for Maia Realtime voice using OpenAI WebRTC
 */
export function useMaiaVoice(config: UseMaiaVoiceConfig): UseMaiaVoiceReturn {
  const clientRef = useRef<MaiaRealtimeWebRTC | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Initialize client
  useEffect(() => {
    const clientConfig: MaiaRealtimeConfig = {
      voice: config.voice || 'shimmer',
      systemPrompt: config.systemPrompt || '',
      userId: config.userId,
      element: config.element,
      conversationStyle: config.conversationStyle,
      onConnected: () => {
        console.log('✅ Connected to Maia');
        setIsConnected(true);
        setError(null);
      },
      onDisconnected: () => {
        console.log('❌ Disconnected from Maia');
        setIsConnected(false);
        setIsSpeaking(false);
        setIsListening(false);
      },
      onError: (err) => {
        console.error('❌ Maia error:', err);
        setError(err.message);
      },
      onAudioStart: () => {
        console.log('🔊 MAIA started speaking');
        setIsSpeaking(true);
        setIsListening(false);
      },
      onAudioEnd: () => {
        console.log('🎤 MAIA finished speaking - ready to listen');
        setIsSpeaking(false);
        setIsListening(true);
      },
      onTranscript: (text, isUser) => {
        if (!text.trim()) return;

        const newMessage: Message = {
          id: Date.now().toString() + Math.random(),
          text,
          isUser,
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, newMessage]);
      },
    };

    clientRef.current = new MaiaRealtimeWebRTC(clientConfig);

    return () => {
      if (clientRef.current?.isConnected()) {
        clientRef.current?.disconnect();
      }
    };
  }, []); // Only create once

  // Auto-connect if requested
  useEffect(() => {
    if (config.autoConnect && clientRef.current && !isConnected) {
      connect();
    }
  }, [config.autoConnect]);

  const connect = useCallback(async () => {
    if (!clientRef.current) {
      console.error('Client not initialized');
      return;
    }

    try {
      await clientRef.current.connect();
      setIsListening(true); // Start listening after connection
    } catch (err) {
      console.error('Connection failed:', err);
      setError(err instanceof Error ? err.message : 'Connection failed');
    }
  }, []);

  const disconnect = useCallback(async () => {
    if (clientRef.current) {
      await clientRef.current.disconnect();
    }
  }, []);

  const sendText = useCallback((text: string) => {
    if (clientRef.current?.isConnected()) {
      clientRef.current.sendText(text);
    } else {
      console.warn('Not connected - cannot send text');
    }
  }, []);

  const interrupt = useCallback(() => {
    if (clientRef.current?.isConnected()) {
      clientRef.current.cancelResponse();
      setIsSpeaking(false);
      setIsListening(true);
    }
  }, []);

  return {
    isConnected,
    isSpeaking,
    isListening,
    messages,
    error,
    connect,
    disconnect,
    sendText,
    interrupt,
  };
}

// Re-export the Message type for convenience
export type { Message };