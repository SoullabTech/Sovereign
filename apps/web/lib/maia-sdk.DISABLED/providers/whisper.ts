/**
 * Local Whisper Provider
 *
 * Connects to your local faster-whisper server for FREE speech-to-text.
 * No API costs, unlimited usage, same quality as OpenAI.
 */

import type { ProviderConfig } from '../index';

export class WhisperProvider {
  private endpoint: string;
  private model: string;

  constructor(config: ProviderConfig) {
    this.endpoint = config.endpoint || 'http://localhost:8001';
    this.model = config.config?.model || 'base.en'; // or 'small', 'medium', 'large-v3'
  }

  /**
   * Transcribe audio to text using local Whisper
   */
  async transcribe(audioSamples: Float32Array): Promise<string> {
    try {
      // Convert Float32Array to WAV format
      const wavBlob = this.samplesToWav(audioSamples, 24000);

      // Create form data
      const formData = new FormData();
      formData.append('audio_file', wavBlob, 'audio.wav');
      formData.append('model', this.model);
      formData.append('language', 'en');
      formData.append('response_format', 'json');

      // Send to local Whisper server
      const response = await fetch(`${this.endpoint}/v1/audio/transcriptions`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Whisper API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return result.text || '';

    } catch (error) {
      console.error('Whisper transcription error:', error);
      throw error;
    }
  }

  /**
   * Check if Whisper server is running
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.endpoint}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Convert Float32Array audio samples to WAV blob
   */
  private samplesToWav(samples: Float32Array, sampleRate: number): Blob {
    const numChannels = 1; // Mono
    const bitsPerSample = 16;
    const bytesPerSample = bitsPerSample / 8;
    const blockAlign = numChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = samples.length * bytesPerSample;
    const bufferSize = 44 + dataSize; // 44 bytes for WAV header

    const buffer = new ArrayBuffer(bufferSize);
    const view = new DataView(buffer);

    // WAV header
    this.writeString(view, 0, 'RIFF');
    view.setUint32(4, bufferSize - 8, true);
    this.writeString(view, 8, 'WAVE');
    this.writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // Subchunk size
    view.setUint16(20, 1, true); // Audio format (1 = PCM)
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    this.writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);

    // Convert Float32 samples to Int16 PCM
    let offset = 44;
    for (let i = 0; i < samples.length; i++) {
      const sample = Math.max(-1, Math.min(1, samples[i]));
      const int16 = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      view.setInt16(offset, int16, true);
      offset += 2;
    }

    return new Blob([buffer], { type: 'audio/wav' });
  }

  private writeString(view: DataView, offset: number, string: string): void {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }
}

export default WhisperProvider;
