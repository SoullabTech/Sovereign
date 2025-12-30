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

export interface VoiceSynthesisOptions {
  text: string;
  voiceId?: string;
  voiceSettings?: {
    stability?: number;
    similarity_boost?: number;
    style?: number;
    use_speaker_boost?: boolean;
  };
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
 * Standard voice synthesis (backward compatibility)
 */
export async function synthesizeVoice({
  text,
  voiceId,
  voiceSettings = {
    stability: 0.5,
    similarity_boost: 0.8,
  },
}: VoiceSynthesisOptions): Promise<string> {
  try {
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
    const filename = `${uuidv4()}.mp3`;
    const outputPath = path.resolve(__dirname, "../../public/audio", filename);

    // Ensure audio directory exists
    const audioDir = path.dirname(outputPath);
    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, buffer);
    return `/audio/${filename}`;
  } catch (err) {
    logger.error("[VoiceService] Synthesis error:", err);
    throw new Error("Failed to synthesize voice");
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
    const outputPath = path.resolve(__dirname, "../../public/audio", filename);

    // Ensure audio directory exists
    const audioDir = path.dirname(outputPath);
    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, buffer);

    const audioUrl = `/audio/${filename}`;

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
