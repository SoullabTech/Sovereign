// lib/voice/wakeWord.ts
// Wake word detection for voice activation

import { WakeWordResult } from './types';

export class WakeWordDetector {
  private keywords: string[];
  private audioBuffer: Float32Array[] = [];
  private maxBufferSize = 50; // ~1 second at 48kHz

  constructor(primaryWakeWord: string) {
    // Support multiple wake words
    this.keywords = [
      primaryWakeWord.toLowerCase(),
      'oracle',
      'maya',
      'anthony',
      'hello oracle',
      'hello maya',
      'hello anthony',
      'hey maya',
      'hey oracle'
    ];
  }

  async detect(audioChunk: Float32Array): Promise<WakeWordResult> {
    // Add to rolling buffer
    this.audioBuffer.push(audioChunk);
    if (this.audioBuffer.length > this.maxBufferSize) {
      this.audioBuffer.shift();
    }

    // For beta: Use simple energy + pattern detection
    // Production: Replace with Picovoice Porcupine or similar
    const result = await this.simpleDetection(audioChunk);

    return result;
  }

  private async simpleDetection(audioChunk: Float32Array): Promise<WakeWordResult> {
    // Calculate audio energy
    const energy = this.calculateEnergy(audioChunk);

    // Only process if there's sufficient energy (voice present)
    if (energy < 0.01) {
      return { detected: false, confidence: 0 };
    }

    // In production, this would use a proper keyword spotting model
    // For now, return positive if energy spike detected (user speaking)
    // Real implementation would use WebAssembly keyword spotter

    // Simulate wake word detection with energy threshold
    const isLikelyWakeWord = energy > 0.03 && this.hasVoicePattern(audioChunk);

    if (isLikelyWakeWord) {
      return {
        detected: true,
        confidence: Math.min(energy * 30, 0.95),
        keyword: this.keywords[0],
        timestamp: Date.now()
      };
    }

    return { detected: false, confidence: 0 };
  }

  private calculateEnergy(buffer: Float32Array): number {
    return buffer.reduce((sum, sample) => sum + sample * sample, 0) / buffer.length;
  }

  private hasVoicePattern(buffer: Float32Array): boolean {
    // Simple voice pattern detection
    // Check for alternating high/low energy (speech pattern)
    const windowSize = 128;
    const windows = Math.floor(buffer.length / windowSize);
    let transitions = 0;
    let lastEnergy = 0;

    for (let i = 0; i < windows; i++) {
      const start = i * windowSize;
      const window = buffer.slice(start, start + windowSize);
      const energy = this.calculateEnergy(window);

      if (i > 0) {
        if ((energy > 0.01 && lastEnergy < 0.01) ||
            (energy < 0.01 && lastEnergy > 0.01)) {
          transitions++;
        }
      }
      lastEnergy = energy;
    }

    // Voice typically has 2-6 transitions per chunk
    return transitions >= 2 && transitions <= 6;
  }

  reset() {
    this.audioBuffer = [];
  }
}

/**
 * Lightweight wake word gate for browser/edge
 * Returns audio only after wake word detected
 */
export async function gateByWakeWord(
  pcm: Float32Array,
  wakeWord: string,
  detector?: WakeWordDetector
): Promise<Float32Array | null> {
  const wakeDetector = detector || new WakeWordDetector(wakeWord);
  const result = await wakeDetector.detect(pcm);

  if (result.detected && result.confidence > 0.5) {
    console.log(`Wake word "${result.keyword}" detected with ${(result.confidence * 100).toFixed(1)}% confidence`);
    return pcm;
  }

  return null;
}