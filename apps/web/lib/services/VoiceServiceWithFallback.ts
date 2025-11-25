// lib/services/VoiceServiceWithFallback.ts
import OpenAI from 'openai';
import { EventEmitter } from 'events';
import { VoiceProfile, getVoiceProfile } from '../config/voiceProfiles';
import { VoicePreprocessor } from '../voice/VoicePreprocessor';
import { TTSPreprocessor } from '../voice/TTSPreprocessor';

export interface VoiceGenerationOptions {
  text: string;
  voiceProfileId?: string;
  provider?: 'openai' | 'elevenlabs';
  format?: 'mp3' | 'opus' | 'aac' | 'flac' | 'wav';
  speed?: number;
  emotionalContext?: {
    mood?: string;
    intensity?: number;
  };
}

export class VoiceServiceWithFallback extends EventEmitter {
  private openai?: OpenAI;
  private elevenLabsKey?: string;
  private audioCache: Map<string, Buffer> = new Map();

  constructor() {
    super();

    // Initialize OpenAI if available
    const openAIKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    if (openAIKey) {
      this.openai = new OpenAI({ apiKey: openAIKey });
    }

    // Store ElevenLabs key
    this.elevenLabsKey = process.env.ELEVENLABS_API_KEY || process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
  }

  async generateSpeech(options: VoiceGenerationOptions): Promise<{
    audioData?: Buffer;
    audioUrl?: string;
    provider?: string;
    voiceUsed?: string;
  }> {
    const { voiceProfileId = 'maya', format = 'mp3', speed = 1.0 } = options;

    // Step 1: Remove stage directions and narrative elements
    let processedText = VoicePreprocessor.extractSpokenContent(options.text);

    // Step 2: Apply TTS-specific preprocessing to prevent OpenAI issues
    const provider = voiceProfile?.provider || 'openai';
    processedText = TTSPreprocessor.preprocessForTTS(processedText, {
      provider,
      removeNewlines: true,
      maxSentenceLength: 25,
      insertNaturalPauses: false
    }) as string;

    console.log(`Voice preprocessing: "${options.text.substring(0, 60)}..." -> "${processedText.substring(0, 60)}..."`);

    const text = processedText;

    // Get voice profile from config
    const voiceProfile = getVoiceProfile(voiceProfileId);
    if (!voiceProfile) {
      throw new Error(`Voice profile not found: ${voiceProfileId}`);
    }

    // Check cache first
    const cacheKey = `${voiceProfileId}:${text}:${format}`;
    if (this.audioCache.has(cacheKey)) {
      this.emit('cache:hit', cacheKey);
      return {
        audioData: this.audioCache.get(cacheKey),
        provider: 'cache',
        voiceUsed: voiceProfile.displayName
      };
    }

    // Try primary provider first
    try {
      if (voiceProfile.provider === 'openai') {
        return await this.generateWithOpenAI(text, voiceProfile, format, speed);
      } else if (voiceProfile.provider === 'elevenlabs') {
        return await this.generateWithElevenLabs(text, voiceProfile, format, speed);
      }
    } catch (error) {
      console.error(`Primary voice generation failed for ${voiceProfile.id}:`, error);

      // Try fallback if available
      if (voiceProfile.fallback) {
        console.log(`Attempting fallback to ${voiceProfile.fallback.provider}`);
        try {
          if (voiceProfile.fallback.provider === 'openai') {
            return await this.generateWithOpenAI(
              text,
              { ...voiceProfile, baseVoiceId: voiceProfile.fallback.baseVoiceId },
              format,
              speed
            );
          } else if (voiceProfile.fallback.provider === 'elevenlabs') {
            return await this.generateWithElevenLabs(
              text,
              { ...voiceProfile, baseVoiceId: voiceProfile.fallback.baseVoiceId },
              format,
              speed
            );
          }
        } catch (fallbackError) {
          console.error(`Fallback also failed:`, fallbackError);
        }
      }

      throw error;
    }

    throw new Error('No voice providers available');
  }

  private async generateWithOpenAI(
    text: string,
    voiceProfile: any,
    format: string,
    speed: number
  ): Promise<any> {
    if (!this.openai) {
      throw new Error('OpenAI client not initialized');
    }

    this.emit('generation:start', { provider: 'openai', voice: voiceProfile.baseVoiceId });

    try {
      const response = await this.openai.audio.speech.create({
        model: 'tts-1-hd', // High quality
        voice: voiceProfile.baseVoiceId as any,
        input: text,
        response_format: format as any,
        speed: Math.max(0.8, speed * 0.9) // Slightly slower for more natural, sensitive delivery
      });

      const audioData = Buffer.from(await response.arrayBuffer());

      // Cache the result
      const cacheKey = `${voiceProfile.id}:${text}:${format}`;
      this.audioCache.set(cacheKey, audioData);

      this.emit('generation:complete', {
        provider: 'openai',
        voice: voiceProfile.baseVoiceId,
        size: audioData.length
      });

      return {
        audioData,
        provider: 'openai',
        voiceUsed: voiceProfile.displayName || voiceProfile.baseVoiceId
      };
    } catch (error) {
      this.emit('generation:error', { provider: 'openai', error });
      throw error;
    }
  }

  private async generateWithElevenLabs(
    text: string,
    voiceProfile: any,
    format: string,
    speed: number
  ): Promise<any> {
    if (!this.elevenLabsKey) {
      throw new Error('ElevenLabs API key not configured');
    }

    this.emit('generation:start', { provider: 'elevenlabs', voice: voiceProfile.baseVoiceId });

    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceProfile.baseVoiceId}`,
        {
          method: 'POST',
          headers: {
            'xi-api-key': this.elevenLabsKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            text,
            model_id: 'eleven_monolingual_v1',
            voice_settings: {
              stability: voiceProfile.technicalParams?.stability || 0.85,
              similarity_boost: voiceProfile.technicalParams?.similarity || 0.9,
              style: 0.5,
              use_speaker_boost: true
            }
          })
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`ElevenLabs TTS failed: ${error}`);
      }

      const audioData = Buffer.from(await response.arrayBuffer());

      // Cache the result
      const cacheKey = `${voiceProfile.id}:${text}:${format}`;
      this.audioCache.set(cacheKey, audioData);

      this.emit('generation:complete', {
        provider: 'elevenlabs',
        voice: voiceProfile.baseVoiceId,
        size: audioData.length
      });

      return {
        audioData,
        provider: 'elevenlabs',
        voiceUsed: voiceProfile.displayName || voiceProfile.baseVoiceId
      };
    } catch (error) {
      this.emit('generation:error', { provider: 'elevenlabs', error });
      throw error;
    }
  }

  // Helper method to clear cache
  clearCache() {
    this.audioCache.clear();
    this.emit('cache:cleared');
  }

  // Get cache size
  getCacheSize(): number {
    return this.audioCache.size;
  }
}

// Singleton instance
let voiceService: VoiceServiceWithFallback | null = null;

export function getVoiceService(): VoiceServiceWithFallback {
  if (!voiceService) {
    voiceService = new VoiceServiceWithFallback();
  }
  return voiceService;
}