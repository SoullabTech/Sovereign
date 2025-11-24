import { IVoice, VoiceJob } from '../../core/interfaces/IVoice';
import { randomUUID } from 'crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { AudioStorage } from '../storage/AudioStorage';
import { LocalAudioStorage } from '../storage/LocalAudioStorage';

interface ElevenLabsBody {
  text: string;
  model_id?: string;
  voice_settings?: { 
    stability?: number; 
    similarity_boost?: number; 
    style?: number; 
    use_speaker_boost?: boolean;
  };
}

interface VoiceOptions {
  voiceId?: string;
  stability?: number;
  similarityBoost?: number;
  style?: number;
  speakerBoost?: boolean;
}

export interface ElevenLabsConfig {
  apiKey: string;
  baseUrl?: string;
  defaultVoiceId?: string;
  model?: string;
  outputFormat?: string;
  outputDir?: string;
  storage?: AudioStorage;
}

export class ElevenLabsVoice implements IVoice {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly defaultVoiceId: string;
  private readonly model: string;
  private readonly outputFormat: string;
  private readonly storage: AudioStorage;

  constructor(config: ElevenLabsConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://api.elevenlabs.io/v1';
    this.defaultVoiceId = config.defaultVoiceId || process.env.ELEVENLABS_VOICE_ID_AUNT_ANNIE!;
    this.model = config.model || 'eleven_multilingual_v2';
    this.outputFormat = config.outputFormat || 'mp3_44100_128';
    
    // Use provided storage or default to local
    this.storage = config.storage || new LocalAudioStorage(
      config.outputDir || path.resolve(process.cwd(), 'public', 'voice')
    );
  }

  name(): string {
    return 'elevenlabs';
  }

  /**
   * Generate audio file and return a public URL.
   * Designed for async queue - writes to public directory for immediate serving.
   */
  async synthesize(job: VoiceJob): Promise<string> {
    if (!this.apiKey) {
      throw new Error('ELEVENLABS_API_KEY missing');
    }

    // Storage will handle directory creation

    const options = this.parseOptions(job);
    const voiceId = options.voiceId || this.defaultVoiceId;

    const body: ElevenLabsBody = {
      text: job.text,
      model_id: this.model,
      voice_settings: {
        stability: options.stability,
        similarity_boost: options.similarityBoost,
        style: options.style,
        use_speaker_boost: options.speakerBoost
      }
    };

    const url = `${this.baseUrl}/text-to-speech/${voiceId}/stream?optimize_streaming_latency=4&output_format=${this.outputFormat}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg'
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
      }

      // Get audio data
      const audioBuffer = await response.arrayBuffer();
      const bytes = new Uint8Array(audioBuffer);
      
      // Generate unique filename
      const id = randomUUID();
      const fileName = `${id}.mp3`;

      // Save using storage adapter
      const publicUrl = await this.storage.save(fileName, bytes, 'audio/mpeg');

      console.log(`🎤 ElevenLabs synthesis complete: ${job.text.substring(0, 50)}... → ${publicUrl}`);
      
      return publicUrl;

    } catch (error: any) {
      console.error('ElevenLabs synthesis failed:', error);
      throw new Error(`Voice synthesis failed: ${error.message}`);
    }
  }

  private parseOptions(job: VoiceJob): VoiceOptions {
    // Use voice presets if available
    if (job.preset) {
      const { getPresetSettings } = require('./voicePresets');
      const settings = getPresetSettings(job.preset);
      return {
        voiceId: job.voiceId,
        stability: settings.stability,
        similarityBoost: settings.similarity_boost,
        style: settings.style,
        speakerBoost: settings.use_speaker_boost
      };
    }
    
    // Default voice settings optimized for consciousness/spiritual content
    return {
      voiceId: job.voiceId,
      stability: 0.50,        // Balanced stability
      similarityBoost: 0.75,  // High similarity to trained voice
      style: 0.15,            // Slight style variation
      speakerBoost: true      // Enhanced clarity
    };
  }

  // Utility methods for monitoring and management
  async getQuota(): Promise<{ charactersRemaining: number; characterLimit: number }> {
    try {
      const response = await fetch(`${this.baseUrl}/user`, {
        headers: {
          'xi-api-key': this.apiKey,
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch quota: ${response.status}`);
      }

      const data = await response.json();
      return {
        charactersRemaining: data.subscription?.character_count || 0,
        characterLimit: data.subscription?.character_limit || 10000
      };
      
    } catch (error: any) {
      console.error('Failed to fetch ElevenLabs quota:', error);
      return { charactersRemaining: 0, characterLimit: 0 };
    }
  }

  async getVoices(): Promise<Array<{ id: string; name: string; category: string }>> {
    try {
      const response = await fetch(`${this.baseUrl}/voices`, {
        headers: {
          'xi-api-key': this.apiKey,
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch voices: ${response.status}`);
      }

      const data = await response.json();
      return data.voices.map((voice: any) => ({
        id: voice.voice_id,
        name: voice.name,
        category: voice.category
      }));
      
    } catch (error: any) {
      console.error('Failed to fetch ElevenLabs voices:', error);
      return [];
    }
  }

  // Get storage stats
  async getStorageStats() {
    if (this.storage.getStats) {
      return await this.storage.getStats();
    }
    return { files: 0, totalBytes: 0 };
  }
}