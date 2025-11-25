/**
 * OpenAI Realtime API Adapter
 *
 * Provider adapter for OpenAI's Realtime API (WebRTC-based voice conversation).
 * Handles both transcription (STT) and synthesis (TTS) in a single connection.
 */

import { BaseProvider } from '../base-provider';
import {
  ProviderMetadata,
  ProviderConfig,
  ConversationContext,
  Connection
} from '../../core/types';

export class OpenAIRealtimeAdapter extends BaseProvider {
  metadata: ProviderMetadata = {
    id: 'openai-realtime',
    name: 'OpenAI Realtime API',
    capabilities: ['realtime', 'tts', 'stt'],
    costPer1kTokens: 0.06,
    latencyMs: 300,
    reliability: 0.98,
    maxConcurrent: 10
  };

  private ws: WebSocket | null = null;
  private config: ProviderConfig = {};
  private connection: Connection | null = null;
  private currentAudioBuffer: ArrayBuffer[] = [];

  async initialize(config: ProviderConfig): Promise<void> {
    if (!config.apiKey) {
      throw new Error('OpenAI API key is required');
    }

    this.config = config;
    this.isInitialized = true;

    console.log(' [OpenAI] Realtime adapter initialized');
  }

  async connect(context: ConversationContext): Promise<Connection> {
    if (!this.isInitialized) {
      throw new Error('Provider not initialized. Call initialize() first.');
    }

    const model = this.config.model || 'gpt-4o-realtime-preview-2024-10-01';
    const url = `wss://api.openai.com/v1/realtime?model=${model}`;

    this.ws = new WebSocket(url, {
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'OpenAI-Beta': 'realtime=v1'
      }
    } as any);

    this.connection = {
      id: context.sessionId,
      status: 'connecting',
      provider: this.metadata.id,
      metadata: { model }
    };

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Connection timeout after 10s'));
      }, 10000);

      this.ws!.onopen = () => {
        clearTimeout(timeout);
        console.log(' [OpenAI] Connected to Realtime API');
        this.connection!.status = 'connected';
        this.connection!.connectedAt = new Date();
        this.emit('status', 'connected');

        // Configure session
        this.sendSessionUpdate(context);

        resolve(this.connection!);
      };

      this.ws!.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('L [OpenAI] Failed to parse message:', error);
        }
      };

      this.ws!.onerror = (error) => {
        clearTimeout(timeout);
        console.error('L [OpenAI] WebSocket error:', error);
        this.connection!.status = 'error';
        this.emit('error', error);
        reject(error);
      };

      this.ws!.onclose = (event) => {
        console.log(`= [OpenAI] Disconnected (code: ${event.code})`);
        this.connection!.status = 'disconnected';
        this.emit('status', 'disconnected');
      };
    });
  }

  private sendSessionUpdate(context: ConversationContext): void {
    if (!this.ws) return;

    const sessionConfig = {
      type: 'session.update',
      session: {
        modalities: ['text', 'audio'],
        instructions: 'You are MAIA, a wise and compassionate guide for personal growth and healing.',
        voice: context.userPreferences.voice || 'shimmer',
        input_audio_format: 'pcm16',
        output_audio_format: 'pcm16',
        input_audio_transcription: {
          model: 'whisper-1'
        },
        turn_detection: {
          type: 'server_vad',
          threshold: 0.5,
          prefix_padding_ms: 300,
          silence_duration_ms: 500
        },
        temperature: this.config.temperature || 0.8
      }
    };

    this.ws.send(JSON.stringify(sessionConfig));
    console.log('=ä [OpenAI] Session configured');
  }

  private handleMessage(message: any): void {
    switch (message.type) {
      case 'session.created':
        console.log('<‰ [OpenAI] Session created:', message.session.id);
        break;

      case 'session.updated':
        console.log('= [OpenAI] Session updated');
        break;

      case 'conversation.item.input_audio_transcription.completed':
        // User's speech was transcribed
        const userText = message.transcript;
        console.log('=Ý [OpenAI] Transcription:', userText);
        this.emit('transcription', userText, new Date());
        break;

      case 'response.audio.delta':
        // MAIA's audio response chunk
        const audioData = this.base64ToArrayBuffer(message.delta);
        this.currentAudioBuffer.push(audioData);
        this.emit('audio_delta', audioData);
        break;

      case 'response.text.delta':
        // MAIA's text response chunk
        this.emit('text_delta', message.delta);
        break;

      case 'response.text.done':
        // Full text response available
        const fullText = message.text;
        console.log('=¬ [OpenAI] Response text:', fullText);
        break;

      case 'response.audio_transcript.done':
        // Audio transcription complete
        console.log('<¤ [OpenAI] Audio transcript:', message.transcript);
        break;

      case 'response.done':
        // Complete response received
        const completeAudio = this.mergeAudioBuffers(this.currentAudioBuffer);
        const responseText = message.response.output?.[0]?.content?.[0]?.transcript || '';

        console.log(' [OpenAI] Response complete');
        this.emit('response', responseText, completeAudio, new Date());

        // Clear buffer for next response
        this.currentAudioBuffer = [];
        break;

      case 'error':
        const error = new Error(message.error.message || 'Unknown OpenAI error');
        console.error('L [OpenAI] Error:', message.error);
        this.emit('error', error);
        break;

      case 'input_audio_buffer.speech_started':
        console.log('<¤ [OpenAI] Speech started');
        break;

      case 'input_audio_buffer.speech_stopped':
        console.log('> [OpenAI] Speech stopped');
        break;

      default:
        // Uncomment for debugging:
        // console.log('[OpenAI] Unhandled message type:', message.type);
        break;
    }
  }

  async sendAudio(audioData: ArrayBuffer): Promise<void> {
    if (!this.ws || this.connection?.status !== 'connected') {
      throw new Error('Not connected to OpenAI Realtime API');
    }

    const base64Audio = this.arrayBufferToBase64(audioData);

    this.ws.send(JSON.stringify({
      type: 'input_audio_buffer.append',
      audio: base64Audio
    }));
  }

  async sendText(text: string): Promise<void> {
    if (!this.ws || this.connection?.status !== 'connected') {
      throw new Error('Not connected to OpenAI Realtime API');
    }

    // Create conversation item
    this.ws.send(JSON.stringify({
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [{ type: 'input_text', text }]
      }
    }));

    // Trigger response
    this.ws.send(JSON.stringify({
      type: 'response.create'
    }));

    console.log('=ä [OpenAI] Sent text:', text);
  }

  async disconnect(): Promise<void> {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connection = null;
    this.currentAudioBuffer = [];
    console.log('=K [OpenAI] Disconnected');
  }

  // ============================================
  // Utility Methods
  // ============================================

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private mergeAudioBuffers(buffers: ArrayBuffer[]): ArrayBuffer {
    if (buffers.length === 0) return new ArrayBuffer(0);
    if (buffers.length === 1) return buffers[0];

    // Calculate total length
    const totalLength = buffers.reduce((sum, buf) => sum + buf.byteLength, 0);

    // Create merged buffer
    const merged = new Uint8Array(totalLength);
    let offset = 0;

    for (const buffer of buffers) {
      merged.set(new Uint8Array(buffer), offset);
      offset += buffer.byteLength;
    }

    return merged.buffer;
  }
}
