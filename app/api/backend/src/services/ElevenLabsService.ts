/**
 * Eleven Labs Voice Synthesis Service
 * Handles archetypal voice generation for consciousness responses
 */

import axios from "axios";
import FormData from "form-data";
import { logger } from "../utils/logger";
import { VoicePreprocessor } from "../../../../../lib/voice/VoicePreprocessor";

export class ElevenLabsService {
  private apiKey: string | undefined;
  private baseUrl: string = "https://api.elevenlabs.io/v1";
  private isAvailable: boolean = false;

  constructor() {
    this.apiKey = process.env.ELEVENLABS_API_KEY;
    
    if (!this.apiKey) {
      const errorMessage = "WARNING: ELEVENLABS_API_KEY not configured. Voice synthesis will not be available.";
      logger.warn(errorMessage);
      
      if (process.env.NODE_ENV === 'production' && process.env.VOICE_REQUIRED === 'true') {
        // Only fail if voice is explicitly required in production
        throw new Error(errorMessage);
      } else {
        // Log warning but continue - voice is optional
        logger.info("Voice service running in text-only mode");
        logger.info("Set ELEVENLABS_API_KEY in .env to enable voice features");
      }
      this.isAvailable = false;
    } else {
      this.isAvailable = true;
      logger.info("ElevenLabs voice service initialized");
    }
  }

  /**
   * Synthesize speech with specified voice and settings
   */
  async synthesizeSpeech(
    text: string,
    voiceId: string,
    voiceSettings: any,
  ): Promise<Buffer> {
    // Check if service is available
    if (!this.isAvailable || !this.apiKey) {
      logger.warn("ElevenLabs voice synthesis requested but service unavailable");
      throw new Error("Voice synthesis unavailable - API key not configured");
    }
    
    try {
      // Preprocess text to remove stage directions before synthesis
      const cleanText = VoicePreprocessor.extractSpokenContent(text);

      logger.info(`Voice synthesis: "${text.substring(0, 50)}..." -> "${cleanText.substring(0, 50)}..."`);

      const response = await axios.post(
        `${this.baseUrl}/text-to-speech/${voiceId}`,
        {
          text: cleanText,
          model_id: "eleven_multilingual_v2",
          voice_settings: voiceSettings,
        },
        {
          headers: {
            Accept: "audio/mpeg",
            "xi-api-key": this.apiKey,
            "Content-Type": "application/json",
          },
          responseType: "arraybuffer",
        },
      );

      return Buffer.from(response.data);
    } catch (error: any) {
      logger.error(
        "Eleven Labs synthesis error:",
        error.response?.data || error.message,
      );
      throw new Error("Failed to synthesize speech");
    }
  }

  /**
   * Get available voices
   */
  async getVoices(): Promise<any[]> {
    if (!this.isAvailable || !this.apiKey) {
      logger.warn("Cannot fetch voices - ElevenLabs not configured");
      return [];
    }
    
    try {
      const response = await axios.get(`${this.baseUrl}/voices`, {
        headers: {
          "xi-api-key": this.apiKey,
        },
      });

      return response.data.voices;
    } catch (error) {
      logger.error("Failed to fetch voices:", error);
      return [];
    }
  }

  /**
   * Verify voice exists
   */
  async verifyVoice(voiceId: string): Promise<boolean> {
    if (!this.isAvailable || !this.apiKey) {
      logger.warn("Cannot verify voice - ElevenLabs not configured");
      return false;
    }
    
    try {
      const response = await axios.get(`${this.baseUrl}/voices/${voiceId}`, {
        headers: {
          "xi-api-key": this.apiKey,
        },
      });

      return response.status === 200;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Check if voice service is available
   */
  isServiceAvailable(): boolean {
    return this.isAvailable;
  }

  /**
   * Test all archetypal voices
   */
  async testArchetypalVoices(): Promise<void> {
    const { ARCHETYPAL_VOICE_PROFILES } = await import(
      "../config/archetypalVoiceProfiles.js"
    );

    console.log("🎤 Testing Archetypal Voices...\n");

    for (const [archetype, profile] of Object.entries(
      ARCHETYPAL_VOICE_PROFILES,
    )) {
      const exists = await this.verifyVoice(profile.voiceId);
      console.log(
        `${exists ? "✅" : "❌"} ${archetype}: ${profile.voiceId} - ${profile.personality}`,
      );
    }
  }
}

export default ElevenLabsService;
