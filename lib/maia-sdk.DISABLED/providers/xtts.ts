/**
 * Local XTTS Provider
 *
 * Connects to your local XTTS server for FREE text-to-speech.
 * Uses your custom-trained Maya/Anthony voices.
 * No API costs, unlimited usage, YOU own the voices.
 */

import type { ProviderConfig } from '../index';

export class XTTSProvider {
  private endpoint: string;
  private voice: string;
  private language: string;

  constructor(config: ProviderConfig) {
    this.endpoint = config.endpoint || 'http://localhost:8000';
    this.voice = config.config?.voice || 'maya';
    this.language = config.config?.language || 'en';
  }

  /**
   * Synthesize text to speech using local XTTS
   */
  async synthesize(text: string, options?: {
    voice?: string;
    emotion?: 'neutral' | 'warm' | 'playful' | 'serious';
    speed?: number;
  }): Promise<Float32Array> {
    try {
      const voice = options?.voice || this.voice;
      const emotion = options?.emotion || 'warm';
      const speed = options?.speed || 1.0;

      // Call local XTTS server
      const response = await fetch(`${this.endpoint}/api/tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          speaker_wav: `/voices/${voice}.wav`, // Your trained voice file
          language: this.language,
          emotion, // Custom parameter if you implement emotion control
          speed
        }),
      });

      if (!response.ok) {
        throw new Error(`XTTS API error: ${response.status} ${response.statusText}`);
      }

      // Get audio as WAV
      const audioBlob = await response.blob();
      const audioSamples = await this.wavToSamples(audioBlob);

      return audioSamples;

    } catch (error) {
      console.error('XTTS synthesis error:', error);
      throw error;
    }
  }

  /**
   * Check if XTTS server is running
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.endpoint}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * List available voices on the server
   */
  async listVoices(): Promise<string[]> {
    try {
      const response = await fetch(`${this.endpoint}/api/voices`);
      if (!response.ok) return ['maya', 'anthony']; // Fallback

      const data = await response.json();
      return data.voices || ['maya', 'anthony'];
    } catch {
      return ['maya', 'anthony'];
    }
  }

  /**
   * Convert WAV blob to Float32Array samples
   */
  private async wavToSamples(blob: Blob): Promise<Float32Array> {
    const arrayBuffer = await blob.arrayBuffer();
    const audioContext = new AudioContext({ sampleRate: 24000 });

    try {
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      // Get first channel (mono or left channel)
      const channelData = audioBuffer.getChannelData(0);

      // Resample to 24kHz if needed
      if (audioBuffer.sampleRate !== 24000) {
        return this.resample(channelData, audioBuffer.sampleRate, 24000);
      }

      return channelData;

    } finally {
      await audioContext.close();
    }
  }

  /**
   * Resample audio to target sample rate
   */
  private resample(
    samples: Float32Array,
    fromRate: number,
    toRate: number
  ): Float32Array {
    if (fromRate === toRate) return samples;

    const ratio = fromRate / toRate;
    const newLength = Math.round(samples.length / ratio);
    const result = new Float32Array(newLength);

    for (let i = 0; i < newLength; i++) {
      const srcIndex = i * ratio;
      const srcIndexFloor = Math.floor(srcIndex);
      const srcIndexCeil = Math.min(srcIndexFloor + 1, samples.length - 1);
      const t = srcIndex - srcIndexFloor;

      // Linear interpolation
      result[i] = samples[srcIndexFloor] * (1 - t) + samples[srcIndexCeil] * t;
    }

    return result;
  }
}

export default XTTSProvider;
