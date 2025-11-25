'use client';

import { RealtimeAgent, RealtimeSession, OpenAIRealtimeWebRTC } from '@openai/agents-realtime';

/**
 * Maia Realtime Voice Client
 * Uses OpenAI Agents Realtime SDK for low-latency, full-duplex voice conversations
 *
 * Architecture:
 * - WebRTC connection to OpenAI Realtime API (recommended by OpenAI)
 * - Streaming audio input from microphone
 * - Streaming audio output with automatic playback
 * - Built-in VAD (Voice Activity Detection)
 * - Turn detection and interruption handling
 */

export interface MaiaRealtimeConfig {
  apiKey?: string; // Optional - will use session token from API route
  model?: string;
  voice?: 'alloy' | 'echo' | 'shimmer' | 'ash' | 'ballad' | 'coral' | 'sage' | 'verse';
  systemPrompt?: string;
  userId?: string;
  element?: string;
  conversationStyle?: string;
  onTranscript?: (text: string, isUser: boolean) => void;
  onAudioStart?: () => void;
  onAudioEnd?: () => void;
  onError?: (error: Error) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
}

export class MaiaRealtimeClient {
  private session: RealtimeSession | null = null;
  private agent: RealtimeAgent | null = null;
  private config: Required<MaiaRealtimeConfig>;

  constructor(config: MaiaRealtimeConfig) {
    this.config = {
      apiKey: config.apiKey || '',
      model: config.model || 'gpt-4o-realtime-preview-2024-12-17',
      voice: config.voice || 'shimmer',
      systemPrompt: config.systemPrompt || '',
      userId: config.userId || 'anonymous',
      element: config.element || 'aether',
      conversationStyle: config.conversationStyle || 'natural',
      onTranscript: config.onTranscript || (() => {}),
      onAudioStart: config.onAudioStart || (() => {}),
      onAudioEnd: config.onAudioEnd || (() => {}),
      onError: config.onError || ((err) => console.error('Maia Realtime Error:', err)),
      onConnected: config.onConnected || (() => {}),
      onDisconnected: config.onDisconnected || (() => {}),
    };
  }

  async connect(): Promise<void> {
    try {
      // Check if we're in browser environment
      if (typeof window === 'undefined') {
        throw new Error('MaiaRealtimeClient can only be used in browser environment');
      }

      console.log('🔌 Connecting to OpenAI Realtime API with Agents SDK...');

      // Get API key from our secure endpoint
      const tokenResponse = await fetch('/api/voice/realtime-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: this.config.userId,
          element: this.config.element,
          conversationStyle: this.config.conversationStyle,
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to get API key');
      }

      const { token } = await tokenResponse.json();
      console.log('🔑 Got API key');

      // Create the agent with Maia's configuration
      this.agent = new RealtimeAgent({
        name: 'Maia',
        instructions: this.config.systemPrompt,
        voice: this.config.voice,
        model: this.config.model,
      });

      // Create the session with WebRTC transport (default for browser)
      this.session = new RealtimeSession(this.agent);

      // Set up event listeners
      this.setupEventListeners();

      // Connect with WebRTC (automatically handles microphone and speakers)
      console.log('🎙️ Connecting to Realtime API...');
      await this.session.connect({
        apiKey: token,
        model: this.config.model,
      });

      console.log('✅ Connected to Maia Realtime API');
      this.config.onConnected();

    } catch (error) {
      console.error('❌ Connection error:', error);
      this.config.onError(error as Error);
      throw error;
    }
  }

  private setupEventListeners(): void {
    if (!this.session) return;

    // Listen for transport events (low-level WebRTC events)
    this.session.on('transport_event', (event) => {
      console.log('📡 Transport event:', event.type);
    });

    // Listen for conversation events
    this.session.on('conversation.item.created', (event: any) => {
      console.log('💬 Conversation item created:', event);
    });

    // Listen for audio transcripts
    this.session.on('conversation.item.input_audio_transcription.completed', (event: any) => {
      if (event.transcript) {
        console.log('🎤 User said:', event.transcript);
        this.config.onTranscript(event.transcript, true);
      }
    });

    this.session.on('response.audio_transcript.delta', (event: any) => {
      if (event.delta) {
        this.config.onTranscript(event.delta, false);
      }
    });

    // Listen for audio playback events
    this.session.on('response.audio.delta', () => {
      if (!this.config.onAudioStart) return;
      this.config.onAudioStart();
    });

    this.session.on('response.audio.done', () => {
      this.config.onAudioEnd();
    });

    // Listen for speech detection
    this.session.on('input_audio_buffer.speech_started', () => {
      console.log('🎤 User started speaking');
    });

    this.session.on('input_audio_buffer.speech_stopped', () => {
      console.log('🎤 User stopped speaking');
    });

    // Listen for errors
    this.session.on('error', (event: any) => {
      console.error('❌ Realtime API error:', event);
      this.config.onError(new Error(event.error?.message || 'Unknown error'));
    });

    // Listen for disconnection
    this.session.on('close', () => {
      console.log('🔌 Disconnected from Realtime API');
      this.config.onDisconnected();
    });
  }

  async disconnect(): Promise<void> {
    if (this.session) {
      await this.session.disconnect();
      this.session = null;
    }
    this.agent = null;
    console.log('🛑 Maia Realtime disconnected');
  }

  isConnected(): boolean {
    return this.session?.isConnected() || false;
  }

  // Send a text message (hybrid mode)
  sendText(text: string): void {
    if (!this.session) {
      console.error('Cannot send text: not connected');
      return;
    }

    // The Agents SDK handles this internally
    console.log('💬 Sending text:', text);
    // Note: Agents SDK may have different API for sending text
    // Check documentation for exact method
  }
}
