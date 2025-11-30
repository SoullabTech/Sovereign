// voiceRouter.ts - Enhanced voice routing system with improved error handling and typing

import { synthesizeVoice } from "./voiceService";
import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";
import { v4 as uuidv4 } from "uuid";
import {
  VoiceProfile,
  AGENT_VOICE_MAPPING,
  ROLE_VOICE_MAPPING,
  ELEVENLABS_VOICE_MAPPING,
  DEFAULT_VOICE_PROFILE,
  VOICE_SERVICE_CONFIG,
  getVoiceProfileKey,
  getElevenLabsConfig,
  isValidVoiceProfile,
} from "../config/voiceProfiles";

// Environment configuration
const USE_SESAME = process.env.USE_SESAME === "true";
const NODE_ENV = process.env.NODE_ENV || "development";

// Voice profiles cache
let voiceProfilesCache: Record<string, VoiceProfile> = {};
let profilesLastLoaded = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Logger utility
const logger = {
  info: (message: string, meta?: any) => {
    if (NODE_ENV === "development") {
      console.log(`[VoiceRouter] ${message}`, meta || "");
    }
  },
  warn: (message: string, meta?: any) => {
    console.warn(`[VoiceRouter] ${message}`, meta || "");
  },
  error: (message: string, error?: any) => {
    console.error(`[VoiceRouter] ${message}`, error || "");
  },
};

// Types for voice synthesis
export interface SpeakOptions {
  text: string;
  agentRole: string;
  agentType?: string;
  retries?: number;
}

export interface SpeakResult {
  audioUrl: string | null;
  voiceProfile: string;
  service: "sesame" | "elevenlabs" | "error";
  error?: string;
  duration?: number;
}

export interface VoiceMetadata {
  voice_synthesis: boolean;
  voice_profile: string;
  voice_name?: string;
  voice_service: "sesame" | "elevenlabs" | "error";
  archetypal_presence?: string;
  audioUrl: string | null;
  error?: string;
}

/**
 * Universal speak function - main entry point for all voice synthesis
 * Returns audioUrl or null on failure with comprehensive error handling
 */
export async function speak(
  text: string,
  agentRole: string,
  agentType?: string,
): Promise<string | null> {
  const startTime = Date.now();

  try {
    logger.info("Voice synthesis initiated", {
      agentRole,
      agentType,
      textLength: text.length,
      useSesame: USE_SESAME,
    });

    const result = await speakWithMetadata({ text, agentRole, agentType });

    const duration = Date.now() - startTime;
    logger.info("Voice synthesis completed", {
      service: result.service,
      audioUrl: result.audioUrl?.substring(0, 50) + "...",
      duration: `${duration}ms`,
      success: !!result.audioUrl,
    });

    return result.audioUrl;
  } catch (error: any) {
    const duration = Date.now() - startTime;
    logger.error("Voice synthesis failed", {
      agentRole,
      agentType,
      duration: `${duration}ms`,
      error: error.message,
    });
    return null;
  }
}

/**
 * Enhanced speak function that returns detailed metadata
 * Useful for production systems that need comprehensive voice information
 */
export async function speakWithMetadata(
  options: SpeakOptions,
): Promise<SpeakResult> {
  const { text, agentRole, agentType, retries = 0 } = options;
  const maxRetries = VOICE_SERVICE_CONFIG.MAX_RETRIES;

  try {
    // Get voice profile and configuration
    const profile = await getVoiceProfile(agentRole, agentType);
    const profileKey = getVoiceProfileKey(agentRole, agentType);

    logger.info("Voice profile selected", {
      profileKey,
      profileName: profile.name || "Unknown",
      agentRole,
      agentType,
    });

    // Apply voice styling
    const styledText = applyVoiceStyle(text, profile);

    // Determine service to use
    const shouldUseSesame =
      USE_SESAME && (agentRole === "oracle" || agentRole === "elemental");

    let audioUrl: string | null = null;
    let service: "sesame" | "elevenlabs" | "error" = "error";

    if (shouldUseSesame) {
      try {
        audioUrl = await synthesizeWithSesameCSM(styledText, profile);
        service = "sesame";
        logger.info("Sesame CSM synthesis successful", { profileKey });
      } catch (sesameError: any) {
        logger.warn("Sesame CSM failed, trying ElevenLabs fallback", {
          error: sesameError.message,
        });

        if (VOICE_SERVICE_CONFIG.FALLBACK_TO_ELEVENLABS) {
          audioUrl = await synthesizeWithElevenLabs(styledText, agentRole);
          service = "elevenlabs";
        }
      }
    } else {
      audioUrl = await synthesizeWithElevenLabs(styledText, agentRole);
      service = "elevenlabs";
      logger.info("ElevenLabs synthesis used", { profileKey });
    }

    return {
      audioUrl,
      voiceProfile: profileKey,
      service,
      duration: Date.now(),
    };
  } catch (error: any) {
    logger.error("Voice synthesis completely failed", {
      agentRole,
      agentType,
      retries,
      error: error.message,
    });

    // Retry logic
    if (retries < maxRetries) {
      logger.info("Retrying voice synthesis", { attempt: retries + 1 });
      return speakWithMetadata({ ...options, retries: retries + 1 });
    }

    return {
      audioUrl: null,
      voiceProfile: getVoiceProfileKey(agentRole, agentType),
      service: "error",
      error: error.message,
    };
  }
}

/**
 * Generate voice metadata for API responses
 */
export function generateVoiceMetadata(result: SpeakResult): VoiceMetadata {
  const profile =
    voiceProfilesCache[result.voiceProfile] || DEFAULT_VOICE_PROFILE;

  return {
    voice_synthesis: !!result.audioUrl,
    voice_profile: result.voiceProfile,
    voice_name: profile.name,
    voice_service: result.service,
    archetypal_presence: profile.archetype,
    audioUrl: result.audioUrl,
    error: result.error,
  };
}

/**
 * Load voice profiles with caching
 */
async function getVoiceProfile(
  agentRole: string,
  agentType?: string,
): Promise<VoiceProfile> {
  // Refresh cache if needed
  if (Date.now() - profilesLastLoaded > CACHE_TTL) {
    await loadVoiceProfiles();
  }

  const profileKey = getVoiceProfileKey(agentRole, agentType);
  const profile = voiceProfilesCache[profileKey];

  if (!profile || !isValidVoiceProfile(profile)) {
    logger.warn("Voice profile not found or invalid, using default", {
      profileKey,
      agentRole,
      agentType,
    });
    return DEFAULT_VOICE_PROFILE;
  }

  return profile;
}

/**
 * Load voice profiles from JSON file
 */
async function loadVoiceProfiles(): Promise<void> {
  try {
    const voiceProfilesPath = path.join(
      __dirname,
      "../config/voiceProfiles.json",
    );

    if (fs.existsSync(voiceProfilesPath)) {
      const profilesData = fs.readFileSync(voiceProfilesPath, "utf8");
      const profiles = JSON.parse(profilesData);

      // Validate profiles
      const validProfiles: Record<string, VoiceProfile> = {};
      for (const [key, profile] of Object.entries(profiles)) {
        if (isValidVoiceProfile(profile)) {
          validProfiles[key] = profile as VoiceProfile;
        } else {
          logger.warn("Invalid voice profile found", { key, profile });
        }
      }

      voiceProfilesCache = validProfiles;
      profilesLastLoaded = Date.now();

      logger.info("Voice profiles loaded successfully", {
        count: Object.keys(validProfiles).length,
        profiles: Object.keys(validProfiles),
      });
    } else {
      logger.warn("Voice profiles file not found, using defaults");
      voiceProfilesCache = { oracle_matrix: DEFAULT_VOICE_PROFILE };
      profilesLastLoaded = Date.now();
    }
  } catch (error: any) {
    logger.error("Failed to load voice profiles", error);
    voiceProfilesCache = { oracle_matrix: DEFAULT_VOICE_PROFILE };
    profilesLastLoaded = Date.now();
  }
}

/**
 * Apply voice styling to text based on profile
 */
function applyVoiceStyle(text: string, profile: VoiceProfile): string {
  const { promptMarkers, emotionalQuality } = profile;

  // Add emotional quality context
  let styledText = text;
  if (emotionalQuality) {
    styledText = `[${emotionalQuality}] ${styledText}`;
  }

  // Add prompt markers
  if (promptMarkers) {
    styledText = `${promptMarkers} ${styledText}`;
  }

  return styledText;
}

/**
 * Synthesize voice using Sesame CSM
 */
async function synthesizeWithSesameCSM(
  text: string,
  profile: VoiceProfile,
): Promise<string> {
  const filename = `sesame_${uuidv4()}.wav`;
  const outputPath = path.resolve(__dirname, "../../public/audio", filename);

  // Ensure audio directory exists
  const audioDir = path.dirname(outputPath);
  if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir, { recursive: true });
  }

  const promptData = {
    text: text,
    speakerId: profile.speakerId,
    output_path: outputPath,
  };

  const wrapperPath = path.join(
    __dirname,
    "../../external/csm/voiceWrapper.py",
  );

  if (!fs.existsSync(wrapperPath)) {
    throw new Error("Sesame CSM wrapper not found. Please run voice setup.");
  }

  // Use virtual environment python if available
  const venvPython = path.join(__dirname, "../../.venv/bin/python");
  const pythonCmd = fs.existsSync(venvPython) ? venvPython : "python3";

  try {
    const input = JSON.stringify(promptData).replace(/'/g, "'\"'\"'");

    execSync(`"${pythonCmd}" "${wrapperPath}" '${input}'`, {
      encoding: "utf8",
      timeout: VOICE_SERVICE_CONFIG.SESAME_TIMEOUT,
    });

    // Verify file creation
    if (fs.existsSync(outputPath)) {
      // Return absolute URL for cross-port access
      const backendPort = process.env.PORT || process.env.APP_PORT || 3002;
      const backendUrl = process.env.BACKEND_URL || `http://localhost:${backendPort}`;
      return `${backendUrl}/audio/${filename}`;
    } else {
      throw new Error("Audio file was not created by Sesame CSM");
    }
  } catch (error: any) {
    // Clean up failed file
    if (fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath);
    }
    throw new Error(`Sesame CSM synthesis failed: ${error.message}`);
  }
}

/**
 * Synthesize voice using ElevenLabs
 */
async function synthesizeWithElevenLabs(
  text: string,
  agentRole: string,
): Promise<string> {
  try {
    const config = getElevenLabsConfig(agentRole);
    const result = await synthesizeVoice({
      text: text,
      voiceId: config.voiceId,
    });

    return result;
  } catch (error: any) {
    throw new Error(`ElevenLabs synthesis failed: ${error.message}`);
  }
}

/**
 * Test function for voice synthesis with comprehensive logging
 */
export async function testVoiceSynthesis(
  agentRole: string = "oracle",
  agentType: string = "MainOracleAgent",
): Promise<SpeakResult> {
  const testText =
    "You already know what I'm going to say, don't you? This is a test of the voice synthesis system.";

  logger.info("Starting voice synthesis test", { agentRole, agentType });

  const result = await speakWithMetadata({
    text: testText,
    agentRole,
    agentType,
  });

  logger.info("Voice synthesis test completed", {
    success: !!result.audioUrl,
    service: result.service,
    profile: result.voiceProfile,
    error: result.error,
  });

  return result;
}

/**
 * Legacy compatibility function
 */
export async function routeVoice(params: {
  text: string;
  voiceId: string;
  agentRole: string;
  agentType?: string;
}): Promise<string> {
  const result = await speak(params.text, params.agentRole, params.agentType);
  return result || "";
}

// Initialize voice profiles on module load
loadVoiceProfiles().catch((error) => {
  logger.error("Failed to initialize voice profiles", error);
});
