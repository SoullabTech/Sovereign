'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { MaiaRealtimeWebRTC, MaiaRealtimeConfig } from '../voice/MaiaRealtimeWebRTC';
import { getMaiaSystemPrompt } from '../voice/MaiaSystemPrompt';

export interface VoiceMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export interface UseMaiaVoiceOptions {
  userId?: string;
  element?: string;
  conversationStyle?: 'natural' | 'consciousness' | 'adaptive';
  voice?: 'alloy' | 'echo' | 'shimmer' | 'ash' | 'ballad' | 'coral' | 'sage' | 'verse';
  systemPrompt?: string;
  autoConnect?: boolean;
}

export function useMaiaVoice(options: UseMaiaVoiceOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const clientRef = useRef<MaiaRealtimeWebRTC | null>(null);
  const userTranscriptBuffer = useRef<string>('');
  const assistantTranscriptBuffer = useRef<string>('');

  const addMessage = useCallback((text: string, isUser: boolean) => {
    const message: VoiceMessage = {
      id: `${Date.now()}-${Math.random()}`,
      text,
      isUser,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, message]);
  }, []);

  const connect = useCallback(async () => {
    // Guard against multiple simultaneous connection attempts
    if (clientRef.current?.isConnected()) {
      console.log('✅ Already connected');
      return;
    }

    // Check if already connecting
    const client = clientRef.current;
    if (client && (client as any).isConnecting) {
      console.log('⏳ Connection already in progress, please wait...');
      return;
    }

    try {
      console.log('🚀 Starting voice connection...');

      // Generate MAIA's personality prompt if not provided
      const systemPrompt = options.systemPrompt || getMaiaSystemPrompt({
        conversationStyle: options.conversationStyle || 'natural',
        element: options.element || 'aether',
      });

      const config: MaiaRealtimeConfig = {
        userId: options.userId || 'anonymous',
        element: options.element || 'aether',
        conversationStyle: options.conversationStyle || 'natural',
        voice: options.voice || 'shimmer',
        systemPrompt,
        onTranscript: (text: string, isUser: boolean) => {
          if (isUser) {
            userTranscriptBuffer.current += text;
          } else {
            assistantTranscriptBuffer.current += text;
          }
        },
        onAudioStart: () => {
          setIsSpeaking(true);
          // Save user transcript when Maia starts responding
          if (userTranscriptBuffer.current.trim()) {
            addMessage(userTranscriptBuffer.current.trim(), true);
            userTranscriptBuffer.current = '';
          }
        },
        onAudioEnd: () => {
          setIsSpeaking(false);
          setIsListening(true);
          // Save assistant transcript
          if (assistantTranscriptBuffer.current.trim()) {
            addMessage(assistantTranscriptBuffer.current.trim(), false);
            assistantTranscriptBuffer.current = '';
          }
        },
        onError: (err: Error) => {
          setError(err.message);
          console.error('Maia voice error:', err);
        },
        onConnected: () => {
          setIsConnected(true);
          setIsListening(true);
          setError(null);
          console.log('✅ Connected to Maia');
        },
        onDisconnected: () => {
          setIsConnected(false);
          setIsSpeaking(false);
          setIsListening(false);
          console.log('❌ Disconnected from Maia');
        },
      };

      const client = new MaiaRealtimeWebRTC(config);
      await client.connect();
      clientRef.current = client;

    } catch (err) {
      setError((err as Error).message);
      console.error('Failed to connect:', err);
    }
  }, [options, addMessage]);

  const disconnect = useCallback(async () => {
    if (clientRef.current) {
      await clientRef.current.disconnect();
      clientRef.current = null;
    }
    setIsConnected(false);
    setIsSpeaking(false);
    setIsListening(false);
  }, []);

  const sendText = useCallback((text: string) => {
    if (!clientRef.current?.isConnected()) {
      setError('Not connected to Maia');
      return;
    }
    clientRef.current.sendText(text);
    addMessage(text, true);
  }, [addMessage]);

  const interrupt = useCallback(() => {
    if (clientRef.current?.isConnected()) {
      clientRef.current.cancelResponse();
      setIsSpeaking(false);
      setIsListening(true);
    }
  }, []);

  // Auto-connect on mount if specified
  useEffect(() => {
    if (options.autoConnect) {
      connect();
    }
    return () => {
      if (clientRef.current) {
        clientRef.current.disconnect();
      }
    };
  }, [options.autoConnect, connect]);

  return {
    // State
    isConnected,
    isSpeaking,
    isListening,
    messages,
    error,

    // Actions
    connect,
    disconnect,
    sendText,
    interrupt,
  };
}
