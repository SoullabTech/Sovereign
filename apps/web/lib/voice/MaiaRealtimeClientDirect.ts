'use client';

/**
 * Maia Realtime Voice Client - Direct WebSocket Implementation
 *
 * Uses native WebSocket instead of OpenAI Agents SDK for better control
 * and debugging capabilities.
 */

export interface MaiaRealtimeConfig {
  apiKey?: string;
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

export class MaiaRealtimeClientDirect {
  private ws: WebSocket | null = null;
  private config: Required<MaiaRealtimeConfig>;
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private audioWorkletNode: AudioWorkletNode | null = null;

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
      onError: config.onError || ((err) => console.error('Maia error:', err)),
      onConnected: config.onConnected || (() => {}),
      onDisconnected: config.onDisconnected || (() => {}),
    };
  }

  async connect(): Promise<void> {
    try {
      if (typeof window === 'undefined') {
        throw new Error('Can only be used in browser');
      }

      console.log('🔌 Connecting to OpenAI Realtime API...');

      // Get ephemeral token
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
        throw new Error('Failed to get token');
      }

      const { token } = await tokenResponse.json();
      console.log('🔑 Got ephemeral token:', token.substring(0, 10) + '...');

      // Connect WebSocket with token in URL (browser-compatible)
      const wsUrl = `wss://api.openai.com/v1/realtime?model=${encodeURIComponent(this.config.model)}`;
      console.log('🔌 Connecting to:', wsUrl);

      this.ws = new WebSocket(wsUrl, [`realtime`, `openai-insecure-api-key.${token}`, `openai-beta.realtime-v1`]);

      // Set up event listeners
      this.ws.onopen = () => this.handleOpen();
      this.ws.onmessage = (event) => this.handleMessage(event);
      this.ws.onerror = (error) => this.handleError(error);
      this.ws.onclose = (event) => this.handleClose(event);

    } catch (error) {
      console.error('❌ Connection error:', error);
      this.config.onError(error as Error);
      throw error;
    }
  }

  private handleOpen(): void {
    console.log('✅ WebSocket connected');

    // Send session configuration
    this.send({
      type: 'session.update',
      session: {
        modalities: ['text', 'audio'],
        instructions: this.config.systemPrompt,
        voice: this.config.voice,
        input_audio_format: 'pcm16',
        output_audio_format: 'pcm16',
        input_audio_transcription: {
          model: 'whisper-1',
        },
        turn_detection: {
          type: 'server_vad',
          threshold: 0.6,           // Higher = less sensitive (0.5 → 0.6)
          prefix_padding_ms: 300,   // Audio included before speech
          silence_duration_ms: 1200, // Wait 1.2s of silence before responding (was 500ms)
        },
      },
    });

    // Start capturing audio
    this.startAudioCapture();

    this.config.onConnected();
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data);
      console.log('📥 Received:', data.type, data);

      switch (data.type) {
        case 'session.created':
        case 'session.updated':
          console.log('✅ Session ready');
          break;

        case 'conversation.item.input_audio_transcription.completed':
          if (data.transcript) {
            console.log('🎤 User:', data.transcript);
            this.config.onTranscript(data.transcript, true);
          }
          break;

        case 'response.audio_transcript.delta':
          if (data.delta) {
            this.config.onTranscript(data.delta, false);
          }
          break;

        case 'response.audio.delta':
          this.config.onAudioStart();
          // Handle audio playback
          if (data.delta) {
            this.playAudioChunk(data.delta);
          }
          break;

        case 'response.audio.done':
          this.config.onAudioEnd();
          break;

        case 'input_audio_buffer.speech_started':
          console.log('🎤 Speech started');
          break;

        case 'input_audio_buffer.speech_stopped':
          console.log('🎤 Speech stopped');
          break;

        case 'error':
          console.error('❌ API Error:', data.error);
          this.config.onError(new Error(data.error.message || 'Unknown error'));
          break;
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  }

  private handleError(error: Event): void {
    console.error('❌ WebSocket error:', error);
    // @ts-ignore - access error details
    const errorDetails = error.error || error.message || 'Unknown error';
    console.error('Error details:', errorDetails);
    this.config.onError(new Error(`WebSocket error: ${errorDetails}`));
  }

  private handleClose(event?: CloseEvent): void {
    const code = event?.code || 'unknown';
    const reason = event?.reason || 'none';
    const wasClean = event?.wasClean ?? false;

    console.log(`🔌 WebSocket closed: code=${code}, reason=${reason}, clean=${wasClean}`);

    if (code === 1006) {
      console.error('💡 Code 1006 = abnormal closure (server dropped connection)');
      console.error('Possible causes: auth expired, protocol mismatch, or server crash');
    }

    this.stopAudioCapture();
    this.config.onDisconnected();
  }

  private async startAudioCapture(): Promise<void> {
    try {
      // Get microphone access with echo cancellation
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 24000,
        },
      });
      console.log('🎤 Microphone access granted (with echo cancellation)');

      // Create audio context
      this.audioContext = new AudioContext({ sampleRate: 24000 });
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);

      // Use ScriptProcessorNode (AudioWorklet requires separate file)
      this.startAudioCaptureWithScriptProcessor(source);

    } catch (error) {
      console.error('❌ Microphone access denied:', error);
      this.config.onError(new Error('Microphone access denied'));
    }
  }

  private startAudioCaptureWithScriptProcessor(source: MediaStreamAudioSourceNode): void {
    if (!this.audioContext) return;

    const processor = this.audioContext.createScriptProcessor(4096, 1, 1);

    processor.onaudioprocess = (e) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

      const inputData = e.inputBuffer.getChannelData(0);
      const pcm16 = this.floatTo16BitPCM(inputData);
      const base64Audio = this.arrayBufferToBase64(pcm16);

      this.send({
        type: 'input_audio_buffer.append',
        audio: base64Audio,
      });
    };

    source.connect(processor);
    const silentGain = this.audioContext.createGain();
    silentGain.gain.value = 0;
    processor.connect(silentGain);
    silentGain.connect(this.audioContext.destination);

    console.log('🔊 ScriptProcessor pipeline connected (fallback)');
  }

  private stopAudioCapture(): void {
    if (this.audioWorkletNode) {
      this.audioWorkletNode.disconnect();
      this.audioWorkletNode.port.close();
      this.audioWorkletNode = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }

  private floatTo16BitPCM(float32Array: Float32Array): Int16Array {
    const int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return int16Array;
  }

  private arrayBufferToBase64(buffer: Int16Array): string {
    const bytes = new Uint8Array(buffer.buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private playAudioChunk(base64Audio: string): void {
    // TODO: Implement audio playback
    // This would decode base64 and play through Web Audio API
  }

  private send(data: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('📤 Sending:', data.type);
      this.ws.send(JSON.stringify(data));
    }
  }

  async disconnect(): Promise<void> {
    this.stopAudioCapture();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    console.log('🛑 Disconnected');
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  sendText(text: string): void {
    this.send({
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: text,
          },
        ],
      },
    });

    this.send({
      type: 'response.create',
    });
  }

  cancelResponse(): void {
    this.send({
      type: 'response.cancel',
    });
  }
}
