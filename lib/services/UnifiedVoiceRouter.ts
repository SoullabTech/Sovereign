/**
 * Unified Voice Router
 * OpenAI Primary + ElevenLabs Fallback
 * Maya → Alloy, Anthony → Onyx
 */

import OpenAI from 'openai';
import { ElevenLabsClient } from 'elevenlabs';
import { EventEmitter } from 'events';

export interface VoiceRequest {
  text: string;
  personality: 'maya' | 'anthony' | string;
  element?: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  priority?: 'quality' | 'speed' | 'cost';
  fallbackEnabled?: boolean;
}

export interface VoiceResponse {
  audioBuffer: Buffer;
  provider: 'openai' | 'elevenlabs' | 'cache';
  voiceUsed: string;
  cost: number;
  latency: number;
  fallbackUsed: boolean;
}

export class UnifiedVoiceRouter extends EventEmitter {
  private openai: OpenAI;
  private elevenLabs: ElevenLabsClient;
  private audioCache: Map<string, Buffer>;

  // Voice mappings
  private readonly voiceMap = {
    maya: {
      primary: { provider: 'openai', id: 'alloy' },
      fallback: { provider: 'elevenlabs', id: process.env.MAYA_ELEVENLABS_ID || '21m00Tcm4TlvDq8ikWAM' }
    },
    anthony: {
      primary: { provider: 'openai', id: 'onyx' },
      fallback: { provider: 'elevenlabs', id: process.env.ANTHONY_ELEVENLABS_ID || 'yoZ06aMxZJJ28mfd3POQ' }
    }
  };

  constructor() {
    super();

    // Initialize providers
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    this.elevenLabs = new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY
    });

    this.audioCache = new Map();
  }

  /**
   * Main routing method
   */
  async generateVoice(request: VoiceRequest): Promise<VoiceResponse> {
    const startTime = Date.now();
    const cacheKey = this.getCacheKey(request);

    // Check cache first
    if (this.audioCache.has(cacheKey)) {
      this.emit('cache:hit', cacheKey);
      return {
        audioBuffer: this.audioCache.get(cacheKey)!,
        provider: 'cache',
        voiceUsed: request.personality,
        cost: 0,
        latency: Date.now() - startTime,
        fallbackUsed: false
      };
    }

    // Get voice configuration
    const voiceConfig = this.voiceMap[request.personality] || this.voiceMap.maya;

    try {
      // Try primary provider (OpenAI)
      const audioBuffer = await this.generateWithOpenAI(
        request.text,
        voiceConfig.primary.id,
        request.element
      );

      // Cache successful generation
      this.audioCache.set(cacheKey, audioBuffer);

      // Apply elemental modulation if needed
      const modulatedBuffer = await this.applyElementalModulation(
        audioBuffer,
        request.element
      );

      return {
        audioBuffer: modulatedBuffer,
        provider: 'openai',
        voiceUsed: `${request.personality} (${voiceConfig.primary.id})`,
        cost: this.calculateCost('openai', request.text),
        latency: Date.now() - startTime,
        fallbackUsed: false
      };

    } catch (primaryError) {
      console.warn('Primary voice generation failed:', primaryError);

      if (!request.fallbackEnabled) {
        throw primaryError;
      }

      // Try fallback provider (ElevenLabs)
      try {
        const audioBuffer = await this.generateWithElevenLabs(
          request.text,
          voiceConfig.fallback.id,
          request.element
        );

        // Cache successful fallback
        this.audioCache.set(cacheKey, audioBuffer);

        // Apply elemental modulation
        const modulatedBuffer = await this.applyElementalModulation(
          audioBuffer,
          request.element
        );

        return {
          audioBuffer: modulatedBuffer,
          provider: 'elevenlabs',
          voiceUsed: `${request.personality} (${voiceConfig.fallback.id})`,
          cost: this.calculateCost('elevenlabs', request.text),
          latency: Date.now() - startTime,
          fallbackUsed: true
        };

      } catch (fallbackError) {
        console.error('Fallback voice generation failed:', fallbackError);

        // Ultimate fallback: return emergency recording
        return this.getEmergencyResponse(request.personality);
      }
    }
  }

  /**
   * Generate with OpenAI TTS
   */
  private async generateWithOpenAI(
    text: string,
    voice: string,
    element?: string
  ): Promise<Buffer> {
    this.emit('openai:start', { text, voice });

    // Adjust speed based on element
    const speed = this.getElementalSpeed(element);

    const response = await this.openai.audio.speech.create({
      model: 'tts-1',  // or 'tts-1-hd' for higher quality
      voice: voice as any,
      input: text,
      speed
    });

    const audioBuffer = Buffer.from(await response.arrayBuffer());

    this.emit('openai:success', {
      voice,
      size: audioBuffer.length,
      cost: this.calculateCost('openai', text)
    });

    return audioBuffer;
  }

  /**
   * Generate with ElevenLabs
   */
  private async generateWithElevenLabs(
    text: string,
    voiceId: string,
    element?: string
  ): Promise<Buffer> {
    this.emit('elevenlabs:start', { text, voiceId });

    // Get elemental voice settings
    const voiceSettings = this.getElementalVoiceSettings(element);

    const audioStream = await this.elevenLabs.textToSpeech.convert(
      voiceId,
      {
        text,
        model_id: 'eleven_turbo_v2_5',
        voice_settings: voiceSettings
      }
    );

    // Convert stream to buffer
    const chunks: Buffer[] = [];
    for await (const chunk of audioStream) {
      chunks.push(Buffer.from(chunk));
    }
    const audioBuffer = Buffer.concat(chunks);

    this.emit('elevenlabs:success', {
      voiceId,
      size: audioBuffer.length,
      cost: this.calculateCost('elevenlabs', text)
    });

    return audioBuffer;
  }

  /**
   * Apply elemental modulation to audio
   */
  private async applyElementalModulation(
    audioBuffer: Buffer,
    element?: string
  ): Promise<Buffer> {
    if (!element || element === 'aether') {
      return audioBuffer; // No modulation for aether
    }

    // Note: Actual DSP implementation would go here
    // For now, return unmodified buffer
    // In production, use web-audio-api or sox for processing

    this.emit('modulation:applied', { element });
    return audioBuffer;
  }

  /**
   * Get speed adjustment for elements (OpenAI)
   */
  private getElementalSpeed(element?: string): number {
    const speeds = {
      fire: 1.1,    // 10% faster
      water: 0.95,  // 5% slower
      earth: 0.9,   // 10% slower
      air: 1.05,    // 5% faster
      aether: 1.0   // Normal
    };

    return speeds[element as keyof typeof speeds] || 1.0;
  }

  /**
   * Get voice settings for elements (ElevenLabs)
   */
  private getElementalVoiceSettings(element?: string) {
    const baseSettings = {
      stability: 0.85,
      similarity_boost: 0.9,
      style: 0.7,
      use_speaker_boost: true
    };

    const elementalAdjustments = {
      fire: { stability: 0.7, style: 0.9 },      // More dynamic
      water: { stability: 0.9, style: 0.8 },     // Flowing
      earth: { stability: 0.95, style: 0.6 },    // Grounded
      air: { stability: 0.8, style: 0.85 },      // Light
      aether: {}                                   // No adjustment
    };

    const adjustments = elementalAdjustments[element as keyof typeof elementalAdjustments] || {};

    return { ...baseSettings, ...adjustments };
  }

  /**
   * Calculate cost per provider
   */
  private calculateCost(provider: 'openai' | 'elevenlabs', text: string): number {
    const charCount = text.length;

    if (provider === 'openai') {
      // OpenAI: $0.015 per 1000 characters
      return (charCount / 1000) * 0.015;
    } else {
      // ElevenLabs: ~$0.30 per 1000 characters
      return (charCount / 1000) * 0.30;
    }
  }

  /**
   * Get cache key for request
   */
  private getCacheKey(request: VoiceRequest): string {
    return `${request.personality}:${request.element}:${request.text.slice(0, 100)}`;
  }

  /**
   * Emergency fallback response
   */
  private async getEmergencyResponse(personality: string): Promise<VoiceResponse> {
    // Pre-recorded emergency phrases
    const emergencyPhrases = {
      maya: 'emergency_maya_connection_issue.wav',
      anthony: 'emergency_anthony_connection_issue.wav'
    };

    // In production, load actual pre-recorded file
    const emergencyBuffer = Buffer.from('emergency audio data');

    return {
      audioBuffer: emergencyBuffer,
      provider: 'cache',
      voiceUsed: `${personality} (emergency)`,
      cost: 0,
      latency: 0,
      fallbackUsed: true
    };
  }

  /**
   * Clear cache (for memory management)
   */
  clearCache(): void {
    const oldSize = this.audioCache.size;
    this.audioCache.clear();
    this.emit('cache:cleared', { entriesRemoved: oldSize });
  }

  /**
   * Get provider status
   */
  async getStatus(): Promise<{
    openai: boolean;
    elevenlabs: boolean;
    cacheSize: number;
  }> {
    let openaiStatus = false;
    let elevenLabsStatus = false;

    // Test OpenAI
    try {
      await this.openai.models.list();
      openaiStatus = true;
    } catch (e) {
      openaiStatus = false;
    }

    // Test ElevenLabs
    try {
      await this.elevenLabs.voices.getAll();
      elevenLabsStatus = true;
    } catch (e) {
      elevenLabsStatus = false;
    }

    return {
      openai: openaiStatus,
      elevenlabs: elevenLabsStatus,
      cacheSize: this.audioCache.size
    };
  }
}

// Export singleton instance
export const voiceRouter = new UnifiedVoiceRouter();

// Usage example
export async function generateMayaVoice(text: string, element?: string) {
  return voiceRouter.generateVoice({
    text,
    personality: 'maya',
    element,
    fallbackEnabled: true,
    priority: 'cost'  // Prioritize cost-effective OpenAI
  });
}

export async function generateAnthonyVoice(text: string, element?: string) {
  return voiceRouter.generateVoice({
    text,
    personality: 'anthony',
    element,
    fallbackEnabled: true,
    priority: 'cost'
  });
}