import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import { VoiceConfig, VoiceSynthesisRequest, VoiceSynthesisResponse } from './VoiceService';

export class ElevenLabsVoiceService {
  private client: ElevenLabsClient;
  private defaultVoiceId: string;
  private auntAnnieVoiceId: string;
  
  constructor(apiKey?: string) {
    this.client = new ElevenLabsClient({
      apiKey: apiKey || process.env.ELEVENLABS_API_KEY!
    });
    
    this.defaultVoiceId = process.env.DEFAULT_VOICE_ID || 'LcfcDJNUP1GQjkzn1xUU';
    this.auntAnnieVoiceId = process.env.AUNT_ANNIE_VOICE_ID || 'y2TOWGCXSYEgBanvKsYJ';
  }

  async synthesize(request: VoiceSynthesisRequest): Promise<VoiceSynthesisResponse> {
    try {
      const startTime = Date.now();
      
      // Check if API key is available
      if (!process.env.ELEVENLABS_API_KEY || process.env.USE_STUB_VOICE === 'true') {
        return {
          success: false,
          error: 'ElevenLabs API key not configured or stub voice mode enabled'
        };
      }
      
      // Select voice based on element or default
      const voiceId = request.voiceConfig.voiceId || this.defaultVoiceId;
      
      // Generate audio using ElevenLabs
      const audio = await this.client.textToSpeech.convert({
        voice_id: voiceId,
        text: request.text,
        model_id: process.env.ELEVENLABS_MODEL_ID || 'eleven_multilingual_v2',
        voice_settings: {
          stability: request.voiceConfig.stability || 0.5,
          similarity_boost: request.voiceConfig.similarityBoost || 0.75
        }
      });
      
      // Convert ReadableStream to Buffer
      const chunks: Uint8Array[] = [];
      const reader = audio.getReader();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }
      
      const audioBuffer = Buffer.concat(chunks);
      
      return {
        success: true,
        audioBuffer,
        duration: Math.ceil(request.text.length / 20),
        metadata: {
          voiceId,
          characterCount: request.text.length,
          processingTime: Date.now() - startTime
        }
      };
    } catch (error) {
      console.error('ElevenLabs synthesis failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown ElevenLabs error'
      };
    }
  }

  async getVoices() {
    try {
      const voices = await this.client.voices.getAll();
      return voices.voices.map(voice => ({
        id: voice.voice_id,
        name: voice.name,
        category: voice.labels ? voice.labels.accent || 'default' : 'default'
      }));
    } catch (error) {
      console.error('Failed to fetch voices:', error);
      // Return default voices as fallback
      return [
        { id: this.defaultVoiceId, name: 'Emily (Default)', category: 'oracle' },
        { id: this.auntAnnieVoiceId, name: 'Aunt Annie', category: 'nurturing' }
      ];
    }
  }

  selectVoiceByElement(element: string): string {
    // Voice selection based on elemental alignment
    switch (element.toLowerCase()) {
      case 'water':
      case 'aether':
        return this.defaultVoiceId; // Emily voice for emotional/spiritual (was Aunt Annie)
      case 'fire':
      case 'air':
      case 'earth':
      default:
        return this.defaultVoiceId; // Clear voice for practical/mental
    }
  }
}

// Singleton instance
export const elevenLabsVoice = new ElevenLabsVoiceService();