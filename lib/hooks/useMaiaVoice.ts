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
  autoReconnect?: boolean; // Auto-reconnect on disconnection (default: true)
  maxReconnectAttempts?: number; // Max reconnection attempts (default: 3)
  onTranscript?: (text: string, isUser: boolean) => void;
}

export function useMaiaVoice(options: UseMaiaVoiceOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isReconnecting, setIsReconnecting] = useState(false);

  const clientRef = useRef<MaiaRealtimeWebRTC | null>(null);
  const userTranscriptBuffer = useRef<string>('');
  const assistantTranscriptBuffer = useRef<string>('');
  const reconnectAttemptsRef = useRef(0);
  const wasConnectedRef = useRef(false); // Track if we were successfully connected
  const intentionalDisconnectRef = useRef(false); // Track if disconnect was intentional

  const autoReconnect = options.autoReconnect ?? true;
  const maxReconnectAttempts = options.maxReconnectAttempts ?? 3;

  const addMessage = useCallback((text: string, isUser: boolean) => {
    const message: VoiceMessage = {
      id: `${Date.now()}-${Math.random()}`,
      text,
      isUser,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, message]);
  }, []);

  const attemptReconnect = useCallback(async () => {
    if (!autoReconnect) return;
    if (intentionalDisconnectRef.current) return;
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      console.log(`❌ Max reconnection attempts (${maxReconnectAttempts}) reached`);
      setIsReconnecting(false);
      setError('Connection lost. Please tap to reconnect.');
      return;
    }

    reconnectAttemptsRef.current += 1;
    const attempt = reconnectAttemptsRef.current;
    const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // Exponential backoff, max 5s

    console.log(`🔄 Reconnecting (attempt ${attempt}/${maxReconnectAttempts}) in ${delay}ms...`);
    setIsReconnecting(true);

    await new Promise(resolve => setTimeout(resolve, delay));

    // Don't reconnect if user intentionally disconnected during wait
    if (intentionalDisconnectRef.current) {
      setIsReconnecting(false);
      return;
    }

    // Try to reconnect (this will call connect which handles the rest)
    try {
      await connectInternal();
    } catch (err) {
      console.error('Reconnection failed:', err);
      // attemptReconnect will be called again from onDisconnected if needed
    }
  }, [autoReconnect, maxReconnectAttempts]);

  const connectInternal = useCallback(async () => {
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
      intentionalDisconnectRef.current = false;

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
          // Call external callback if provided
          options.onTranscript?.(text, isUser);
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
          setIsReconnecting(false);
          setError(null);
          wasConnectedRef.current = true;
          reconnectAttemptsRef.current = 0; // Reset on successful connection
          console.log('✅ Connected to Maia');
        },
        onDisconnected: () => {
          setIsConnected(false);
          setIsSpeaking(false);
          setIsListening(false);
          console.log('❌ Disconnected from Maia');

          // Auto-reconnect if we were connected and disconnect wasn't intentional
          if (wasConnectedRef.current && !intentionalDisconnectRef.current && autoReconnect) {
            attemptReconnect();
          }
        },
      };

      const newClient = new MaiaRealtimeWebRTC(config);
      await newClient.connect();
      clientRef.current = newClient;

    } catch (err) {
      setError((err as Error).message);
      setIsReconnecting(false);
      console.error('Failed to connect:', err);
      throw err; // Re-throw for reconnection logic
    }
  }, [options, addMessage, autoReconnect, attemptReconnect]);

  const connect = useCallback(async () => {
    reconnectAttemptsRef.current = 0;
    intentionalDisconnectRef.current = false;
    await connectInternal();
  }, [connectInternal]);

  const disconnect = useCallback(async () => {
    intentionalDisconnectRef.current = true; // Mark as intentional to prevent auto-reconnect
    setIsReconnecting(false);
    if (clientRef.current) {
      await clientRef.current.disconnect();
      clientRef.current = null;
    }
    setIsConnected(false);
    setIsSpeaking(false);
    setIsListening(false);
    wasConnectedRef.current = false;
    reconnectAttemptsRef.current = 0;
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
      // Mark as intentional disconnect on cleanup to prevent reconnection attempts
      intentionalDisconnectRef.current = true;
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
    isReconnecting,
    messages,
    error,

    // Actions
    connect,
    disconnect,
    sendText,
    interrupt,
  };
}
