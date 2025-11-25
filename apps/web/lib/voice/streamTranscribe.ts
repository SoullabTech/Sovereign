// lib/voice/streamTranscribe.ts
// Stream transcription adapter for real-time STT

import { LatencyTracker } from './guardrails';

interface TranscriptionResult {
  text: string;
  confidence: number;
  isFinal: boolean;
  timestamp: number;
}

export class StreamTranscriber {
  private apiKey: string;
  private latencyTracker = new LatencyTracker();
  private partialBuffer = '';
  private useWhisper = true; // Default to OpenAI Whisper

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';

    // Check for alternative STT providers
    if (process.env.DEEPGRAM_API_KEY) {
      this.useWhisper = false; // Use Deepgram for lower latency
    }
  }

  /**
   * Transcribe audio buffer to text
   * Optimized for <250ms latency
   */
  async transcribe(audioBuffer: Float32Array): Promise<string> {
    this.latencyTracker.mark('transcript-start');

    try {
      if (this.useWhisper) {
        return await this.transcribeWithWhisper(audioBuffer);
      } else {
        return await this.transcribeWithDeepgram(audioBuffer);
      }
    } finally {
      this.latencyTracker.mark('transcript-ready');
      const latency = this.latencyTracker.measure('transcript-start', 'transcript-ready');

      if (latency > 250) {
        console.warn(`STT latency ${latency}ms exceeds 250ms target`);
      }
    }
  }

  /**
   * Stream partial transcriptions for real-time feedback
   */
  async *streamTranscribe(
    audioStream: ReadableStream<Float32Array>
  ): AsyncGenerator<TranscriptionResult> {
    const reader = audioStream.getReader();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Process chunk
        const partial = await this.processChunk(value);

        if (partial.text.length > 0) {
          yield partial;
        }

        // Update partial buffer for context
        if (!partial.isFinal) {
          this.partialBuffer = partial.text;
        } else {
          this.partialBuffer = '';
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Process audio chunk for partial transcription
   */
  private async processChunk(audioChunk: Float32Array): Promise<TranscriptionResult> {
    // For beta, return simulated partials
    // In production, use WebSocket to STT service

    const energy = this.calculateEnergy(audioChunk);
    const hasVoice = energy > 0.01;

    if (!hasVoice) {
      return {
        text: this.partialBuffer,
        confidence: 0.5,
        isFinal: false,
        timestamp: Date.now()
      };
    }

    // Simulate partial transcription
    // Real implementation would send to STT WebSocket
    const mockPartial = this.mockPartialTranscription(audioChunk);

    return {
      text: this.partialBuffer + ' ' + mockPartial,
      confidence: 0.7 + energy * 0.3,
      isFinal: false,
      timestamp: Date.now()
    };
  }

  /**
   * Transcribe using OpenAI Whisper API
   */
  private async transcribeWithWhisper(audioBuffer: Float32Array): Promise<string> {
    // Convert Float32Array to WAV format
    const wavBuffer = this.float32ToWav(audioBuffer);

    // Create form data
    const formData = new FormData();
    formData.append('file', new Blob([wavBuffer], { type: 'audio/wav' }), 'audio.wav');
    formData.append('model', 'whisper-1');
    formData.append('language', 'en');
    formData.append('response_format', 'json');

    try {
      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Whisper API error: ${response.status}`);
      }

      const result = await response.json();
      return result.text || '';
    } catch (error) {
      console.error('Whisper transcription error:', error);

      // Fallback to browser Web Speech API if available
      if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
        return await this.fallbackToBrowserSTT(audioBuffer);
      }

      return '';
    }
  }

  /**
   * Transcribe using Deepgram for lower latency
   */
  private async transcribeWithDeepgram(audioBuffer: Float32Array): Promise<string> {
    const apiKey = process.env.DEEPGRAM_API_KEY;
    if (!apiKey) {
      return this.transcribeWithWhisper(audioBuffer);
    }

    // Convert to linear16 PCM
    const pcmBuffer = this.float32ToPCM16(audioBuffer);

    try {
      const response = await fetch('https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${apiKey}`,
          'Content-Type': 'audio/raw'
        },
        body: pcmBuffer
      });

      const result = await response.json();
      return result.results?.channels[0]?.alternatives[0]?.transcript || '';
    } catch (error) {
      console.error('Deepgram transcription error:', error);
      return this.transcribeWithWhisper(audioBuffer);
    }
  }

  /**
   * Fallback to browser's Web Speech API
   */
  private async fallbackToBrowserSTT(audioBuffer: Float32Array): Promise<string> {
    return new Promise((resolve) => {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        resolve(transcript);
      };

      recognition.onerror = () => {
        resolve('');
      };

      // Note: Browser API needs audio stream, not buffer
      // This is simplified - real implementation would need stream conversion
      recognition.start();

      setTimeout(() => {
        recognition.stop();
        resolve(''); // Timeout fallback
      }, 5000);
    });
  }

  /**
   * Convert Float32Array to WAV format
   */
  private float32ToWav(buffer: Float32Array): ArrayBuffer {
    const length = buffer.length;
    const arrayBuffer = new ArrayBuffer(44 + length * 2);
    const view = new DataView(arrayBuffer);

    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true); // fmt chunk size
    view.setUint16(20, 1, true); // PCM format
    view.setUint16(22, 1, true); // Mono
    view.setUint32(24, 16000, true); // Sample rate
    view.setUint32(28, 16000 * 2, true); // Byte rate
    view.setUint16(32, 2, true); // Block align
    view.setUint16(34, 16, true); // Bits per sample
    writeString(36, 'data');
    view.setUint32(40, length * 2, true);

    // Convert float32 to int16
    let offset = 44;
    for (let i = 0; i < length; i++) {
      const sample = Math.max(-1, Math.min(1, buffer[i]));
      view.setInt16(offset, sample * 0x7FFF, true);
      offset += 2;
    }

    return arrayBuffer;
  }

  /**
   * Convert Float32Array to PCM16 for Deepgram
   */
  private float32ToPCM16(buffer: Float32Array): ArrayBuffer {
    const pcm16 = new Int16Array(buffer.length);

    for (let i = 0; i < buffer.length; i++) {
      const sample = Math.max(-1, Math.min(1, buffer[i]));
      pcm16[i] = sample * 0x7FFF;
    }

    return pcm16.buffer;
  }

  /**
   * Calculate audio energy
   */
  private calculateEnergy(buffer: Float32Array): number {
    return buffer.reduce((sum, sample) => sum + sample * sample, 0) / buffer.length;
  }

  /**
   * Mock partial transcription for testing
   */
  private mockPartialTranscription(audioChunk: Float32Array): string {
    // In production, this would be actual STT
    const phrases = [
      'hello', 'maya', 'I feel', 'today', 'help me',
      'transform', 'question', 'wondering', 'grateful'
    ];

    const energy = this.calculateEnergy(audioChunk);
    if (energy > 0.02) {
      return phrases[Math.floor(Math.random() * phrases.length)];
    }

    return '';
  }

  /**
   * Reset transcriber state
   */
  reset() {
    this.partialBuffer = '';
    this.latencyTracker.reset();
  }
}

// Singleton instance
export const streamTranscriber = new StreamTranscriber();