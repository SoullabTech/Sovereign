/**
 * Production Voice Service - Hybrid TTS System
 * Integrates Sesame API with OpenAI TTS fallback
 * Replaces mock VoiceService
 */

import { MAYA_VOICE_PROFILES, getVoiceProfile } from '@/lib/voice/VoiceProfiles';
import type { VoiceProfile } from '@/lib/voice/VoiceProfiles';

export interface SesameVoiceOptions {
  apiUrl?: string;
  apiKey?: string;
  defaultVoice?: string;
  enableCloning?: boolean;
  cacheEnabled?: boolean;
}

export interface EmotionalContext {
  mood?: string;
  intensity?: number;
  jungianPhase?: string;
}

export interface ProsodyHints {
  emphasis?: string[];
  pauses?: number[];
  intonation?: 'neutral' | 'questioning' | 'excited' | 'calm';
}

export interface SpeechGenerationOptions {
  text: string;
  voiceProfile: VoiceProfile;
  element?: string;
  emotionalContext?: EmotionalContext;
  prosodyHints?: ProsodyHints;
  format?: 'mp3' | 'wav' | 'opus';
}

export interface VoiceGenerationResult {
  success: boolean;
  audioUrl?: string;
  audioData?: Buffer;
  duration?: number;
  metadata?: any;
  error?: string;
}

export interface VoiceCloneOptions {
  sourceFile: Buffer;
  name: string;
  baseVoice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
}

/**
 * Production Sesame Voice Service
 */
export class SesameVoiceService {
  private apiUrl: string;
  private apiKey?: string;
  private defaultVoice: string;
  private enableCloning: boolean;
  private cacheEnabled: boolean;
  private cache: Map<string, Buffer> = new Map();

  constructor(options: SesameVoiceOptions = {}) {
    this.apiUrl = options.apiUrl || process.env.NORTHFLANK_SESAME_URL || 'http://localhost:8000';
    this.apiKey = options.apiKey || process.env.SESAME_API_KEY;
    this.defaultVoice = options.defaultVoice || 'nova';
    this.enableCloning = options.enableCloning ?? false;
    this.cacheEnabled = options.cacheEnabled ?? true;
  }

  getVoiceProfile(characterId: string): VoiceProfile | null {
    return getVoiceProfile(characterId);
  }

  getVoiceMenu(): VoiceProfile[] {
    return Object.values(MAYA_VOICE_PROFILES);
  }

  /**
   * Generate speech using Sesame API
   */
  async generateSpeech(options: SpeechGenerationOptions): Promise<VoiceGenerationResult> {
    const { text, voiceProfile, format = 'mp3' } = options;

    // Check cache first
    const cacheKey = this.getCacheKey(text, voiceProfile.id);
    if (this.cacheEnabled && this.cache.has(cacheKey)) {
      return {
        success: true,
        audioData: this.cache.get(cacheKey),
        duration: this.estimateDuration(text),
      };
    }

    try {
      // Try Sesame API first
      const result = await this.generateWithSesameAPI(options);

      if (result.success && result.audioData) {
        // Cache successful result
        if (this.cacheEnabled) {
          this.cache.set(cacheKey, result.audioData);
        }
        return result;
      }

      // Fallback to OpenAI TTS if Sesame fails
      return await this.generateWithOpenAI(text, voiceProfile, format);

    } catch (error: any) {
      console.error('Speech generation error:', error);
      return {
        success: false,
        error: error.message || 'Speech generation failed',
      };
    }
  }

  /**
   * Generate speech using Sesame API
   */
  private async generateWithSesameAPI(options: SpeechGenerationOptions): Promise<VoiceGenerationResult> {
    try {
      const { text, voiceProfile, emotionalContext, prosodyHints, format } = options;

      const response = await fetch(`${this.apiUrl}/api/voice/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` }),
        },
        body: JSON.stringify({
          text,
          voice: voiceProfile.baseVoice,
          speed: voiceProfile.parameters.speed,
          pitch: voiceProfile.parameters.pitch,
          emotionalContext,
          prosodyHints,
          format,
        }),
      });

      if (!response.ok) {
        throw new Error(`Sesame API error: ${response.status}`);
      }

      const audioBuffer = Buffer.from(await response.arrayBuffer());

      return {
        success: true,
        audioData: audioBuffer,
        duration: this.estimateDuration(text),
        metadata: {
          source: 'sesame',
          voiceProfile: voiceProfile.id,
        },
      };
    } catch (error: any) {
      console.warn('Sesame API unavailable, will try fallback:', error.message);
      throw error;
    }
  }

  /**
   * Generate speech using OpenAI TTS (fallback)
   */
  private async generateWithOpenAI(
    text: string,
    voiceProfile: VoiceProfile,
    format: string
  ): Promise<VoiceGenerationResult> {
    try {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('OpenAI API key not configured');
      }

      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'tts-1',
          input: text,
          voice: voiceProfile.baseVoice,
          response_format: format,
          speed: voiceProfile.parameters.speed,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI TTS error: ${response.status}`);
      }

      const audioBuffer = Buffer.from(await response.arrayBuffer());

      return {
        success: true,
        audioData: audioBuffer,
        duration: this.estimateDuration(text),
        metadata: {
          source: 'openai',
          voiceProfile: voiceProfile.id,
        },
      };
    } catch (error: any) {
      console.error('OpenAI TTS failed:', error);
      throw error;
    }
  }

  /**
   * Check if Sesame API is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/health`, {
        method: 'GET',
        headers: this.apiKey ? { 'Authorization': `Bearer ${this.apiKey}` } : {},
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Clone a voice from audio sample
   */
  async cloneVoice(options: VoiceCloneOptions): Promise<VoiceProfile> {
    if (!this.enableCloning) {
      throw new Error('Voice cloning not enabled');
    }

    try {
      const formData = new FormData();
      formData.append('audio', new Blob([options.sourceFile]));
      formData.append('name', options.name);
      formData.append('baseVoice', options.baseVoice);

      const response = await fetch(`${this.apiUrl}/api/voice/clone`, {
        method: 'POST',
        headers: this.apiKey ? { 'Authorization': `Bearer ${this.apiKey}` } : {},
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Voice cloning failed: ${response.status}`);
      }

      const result = await response.json();
      return result.profile;
    } catch (error: any) {
      console.error('Voice cloning error:', error);
      throw error;
    }
  }

  /**
   * Get available voices from API
   */
  async getAvailableVoices(): Promise<string[]> {
    try {
      const response = await fetch(`${this.apiUrl}/api/voice/list`, {
        headers: this.apiKey ? { 'Authorization': `Bearer ${this.apiKey}` } : {},
      });

      if (!response.ok) {
        return [this.defaultVoice];
      }

      const result = await response.json();
      return result.voices || [this.defaultVoice];
    } catch {
      return [this.defaultVoice];
    }
  }

  /**
   * Generate cache key
   */
  private getCacheKey(text: string, voiceId: string): string {
    return `${voiceId}:${text.substring(0, 50)}`;
  }

  /**
   * Estimate audio duration from text
   */
  private estimateDuration(text: string): number {
    // Average speaking rate: ~150 words per minute
    const words = text.split(/\s+/).length;
    return (words / 150) * 60; // seconds
  }

  /**
   * Clear voice cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  getCacheSize(): number {
    return this.cache.size;
  }
}