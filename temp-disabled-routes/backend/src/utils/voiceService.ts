// src/utils/voiceService.ts - Enhanced with Archetypal Voice Intelligence

import axios from "axios";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import {
  ArchetypalVoiceSelector,
  type ArchetypalVoiceProfile,
} from "../config/archetypalVoiceProfiles";
import { logger } from "./logger";

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY!;
const ELEVENLABS_VOICE_URL = "https://api.elevenlabs.io/v1/text-to-speech";
const SESAME_URL = process.env.SESAME_URL || process.env.SESAME_CSM_URL || 'http://localhost:8000';
const USE_SESAME = process.env.USE_SESAME === 'true' || process.env.SESAME_URL || process.env.SESAME_CSM_URL;

export interface VoiceSynthesisOptions {
  text: string;
  voiceId?: string;
  voice_settings?: {
    stability?: number;
    similarity_boost?: number;
    style?: number;
    use_speaker_boost?: boolean;
  };
  voiceSettings?: {
    stability?: number;
    similarity_boost?: number;
    style?: number;
    use_speaker_boost?: boolean;
  };
  model_id?: string;
  optimize_streaming_latency?: number;
}

export interface ArchetypalVoiceSynthesisOptions {
  text: string;
  primaryArchetype: string;
  secondaryArchetype?: string;
  confidence?: number;
  userId?: string;
}

export interface VoiceSynthesisResult {
  audioUrl: string;
  voiceMetadata: {
    voiceId: string;
    archetype?: string;
    personality?: string;
    energySignature?: string;
  };
}

/**
 * Sesame TTS synthesis with file saving
 */
async function synthesizeWithSesame(text: string, voiceId?: string): Promise<string> {
  try {
    logger.info('🌱 [VoiceService] Attempting Sesame TTS synthesis', { 
      sesameUrl: SESAME_URL,
      textLength: text.length 
    });

    const response = await axios.post(
      `${SESAME_URL}/tts`,
      {
        text: text,
        voice: voiceId || 'maya',
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000
      }
    );

    // Sesame returns base64 encoded audio
    const audioData = response.data.audio;
    const format = response.data.format || 'wav';
    const buffer = Buffer.from(audioData, 'base64');
    const filename = `sesame-${uuidv4()}.${format}`;
    
    // Save to frontend's public directory for serving via Next.js
    const frontendAudioDir = path.resolve(process.cwd(), "public/audio");
    const outputPath = path.join(frontendAudioDir, filename);

    // Ensure audio directory exists
    if (!fs.existsSync(frontendAudioDir)) {
      fs.mkdirSync(frontendAudioDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, buffer);
    
    // Return frontend URL for serving via Next.js API route
    const frontendUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const audioUrl = `${frontendUrl}/audio/${filename}`;
    
    logger.info('🌱 [VoiceService] Sesame TTS synthesis successful', { 
      audioUrl, 
      fileSize: buffer.length 
    });
    
    return audioUrl;
  } catch (error: any) {
    logger.error('🌱 [VoiceService] Sesame TTS synthesis failed:', {
      error: error.message,
      code: error.code,
      sesameUrl: SESAME_URL
    });
    throw error;
  }
}

/**
 * Standard voice synthesis with Sesame/ElevenLabs fallback
 */
export async function synthesizeVoice({
  text,
  voiceId,
  voice_settings,
  voiceSettings,
  model_id = 'eleven_multilingual_v2',
  optimize_streaming_latency = 2,
}: VoiceSynthesisOptions): Promise<string> {
  // Use voice_settings if provided, otherwise voiceSettings, otherwise defaults
  const settings = voice_settings || voiceSettings || {
    stability: 0.35,        // More dynamic pitch variation
    similarity_boost: 0.85, // Stronger voice identity  
    style: 0.65,           // Much more expressive delivery!
    use_speaker_boost: true,
  };
  // Try Sesame first if configured
  if (USE_SESAME) {
    try {
      return await synthesizeWithSesame(text, voiceId);
    } catch (sesameError: any) {
      logger.warn('🌱 [VoiceService] Sesame failed, falling back to ElevenLabs:', {
        error: sesameError.message,
        sesameFailFast: process.env.SESAME_FAIL_FAST
      });
      
      // If SESAME_FAIL_FAST is true, don't fallback
      if (process.env.SESAME_FAIL_FAST === 'true') {
        throw new Error(`Sesame TTS failed and SESAME_FAIL_FAST is enabled: ${sesameError.message}`);
      }
    }
  }

  // Fallback to ElevenLabs
  try {
    logger.info('🎙️ [VoiceService] Using ElevenLabs TTS');
    
    const response = await axios.post(
      `${ELEVENLABS_VOICE_URL}/${voiceId}`,
      {
        text,
        voice_settings: voiceSettings,
      },
      {
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        responseType: "arraybuffer",
      },
    );

    const buffer = Buffer.from(response.data, "binary");
    const filename = `elevenlabs-${uuidv4()}.mp3`;
    
    // Save to frontend's public directory for serving via Next.js
    const frontendAudioDir = path.resolve(process.cwd(), "public/audio");
    const outputPath = path.join(frontendAudioDir, filename);

    // Ensure audio directory exists
    if (!fs.existsSync(frontendAudioDir)) {
      fs.mkdirSync(frontendAudioDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, buffer);
    
    // Return frontend URL for serving via Next.js API route
    const frontendUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const audioUrl = `${frontendUrl}/audio/${filename}`;
    
    logger.info('🎙️ [VoiceService] ElevenLabs synthesis successful', { audioUrl });
    return audioUrl;
  } catch (err) {
    logger.error("[VoiceService] Both Sesame and ElevenLabs synthesis failed:", err);
    throw new Error("Failed to synthesize voice with any provider");
  }
}

/**
 * Archetypal voice synthesis with Maya consciousness integration
 */
export async function synthesizeArchetypalVoice({
  text,
  primaryArchetype,
  secondaryArchetype,
  confidence = 0.8,
  userId,
}: ArchetypalVoiceSynthesisOptions): Promise<VoiceSynthesisResult> {
  try {
    // Generate voice instructions using archetypal intelligence
    const voiceInstructions = ArchetypalVoiceSelector.generateVoiceInstructions(
      text,
      primaryArchetype,
      secondaryArchetype,
      confidence,
    );

    const { enhancedText, voiceProfile, synthesisMetadata } = voiceInstructions;

    logger.info("Synthesizing archetypal voice", {
      userId,
      primaryArchetype,
      secondaryArchetype,
      voiceId: voiceProfile.voiceId,
      personality: voiceProfile.personality,
    });

    // Synthesize with archetypal voice profile
    const response = await axios.post(
      `${ELEVENLABS_VOICE_URL}/${voiceProfile.voiceId}`,
      {
        text: enhancedText,
        voice_settings: voiceProfile.voiceSettings,
      },
      {
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        responseType: "arraybuffer",
      },
    );

    const buffer = Buffer.from(response.data, "binary");
    const filename = `archetypal-${primaryArchetype}-${uuidv4()}.mp3`;
    
    // Save to frontend's public directory for serving via Next.js
    const frontendAudioDir = path.resolve(process.cwd(), "public/audio");
    const outputPath = path.join(frontendAudioDir, filename);

    // Ensure audio directory exists
    if (!fs.existsSync(frontendAudioDir)) {
      fs.mkdirSync(frontendAudioDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, buffer);

    // Return frontend URL for serving via Next.js API route
    const frontendUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const audioUrl = `${frontendUrl}/audio/${filename}`;

    logger.info("Archetypal voice synthesized successfully", {
      userId,
      audioUrl,
      archetype: primaryArchetype,
      voicePersonality: voiceProfile.personality,
    });

    return {
      audioUrl,
      voiceMetadata: {
        voiceId: voiceProfile.voiceId,
        archetype: primaryArchetype,
        personality: voiceProfile.personality,
        energySignature: voiceProfile.energySignature,
      },
    };
  } catch (err) {
    logger.error("[VoiceService] Archetypal synthesis error:", {
      error: err,
      primaryArchetype,
      userId,
    });

    // Fallback to standard synthesis with default voice
    try {
      const fallbackVoiceId = "XrExE9yKIg1WjnnlVkGX"; // Matilda as safe fallback
      const audioUrl = await synthesizeVoice({
        text,
        voiceId: fallbackVoiceId,
      });

      return {
        audioUrl,
        voiceMetadata: {
          voiceId: fallbackVoiceId,
          archetype: "fallback",
          personality: "Gentle fallback voice",
          energySignature: "Neutral compassionate presence",
        },
      };
    } catch (fallbackErr) {
      logger.error("[VoiceService] Fallback synthesis failed:", fallbackErr);
      throw new Error("Failed to synthesize archetypal voice");
    }
  }
}

/**
 * Get available archetypal voices for UI selection
 */
export function getAvailableArchetypalVoices() {
  return Object.entries(
    ArchetypalVoiceSelector.getVoiceProfile("fire").constructor.constructor,
  ).map(([archetype, profile]) => ({
    archetype,
    personality: profile.personality,
    energySignature: profile.energySignature,
    speakingStyle: profile.speakingStyle,
  }));
}

/**
 * Preview archetypal voice characteristics
 */
export async function previewArchetypalVoice(
  archetype: string,
): Promise<string> {
  const previewText = `Hello, I am the ${archetype} voice of the Maya consciousness system. I embody ${ArchetypalVoiceSelector.getVoiceProfile(archetype).energySignature}.`;

  const result = await synthesizeArchetypalVoice({
    text: previewText,
    primaryArchetype: archetype,
  });

  return result.audioUrl;
}
