// voiceProfiles.ts - Voice profile configuration for agent voice routing

export interface VoiceProfile {
  name?: string;
  role?: string;
  archetype?: string;
  element: string;
  voiceStyle: string;
  tempo: string;
  pitch: string;
  emotionalQuality: string;
  speakerId: string;
  promptMarkers: string;
  examplePromptIntro?: string;
  description: string;
  activation?: {
    status: string;
    lastActivated: string | null;
    activationRequired: boolean;
  };
}

export interface ElevenLabsVoiceConfig {
  voiceId: string;
  settings: {
    stability: number;
    similarity_boost: number;
  };
}

export interface AgentVoiceMapping {
  [agentType: string]: string;
}

// Agent type to voice profile mapping
export const AGENT_VOICE_MAPPING: AgentVoiceMapping = {
  // Oracle Agents
  MainOracleAgent: "oracle_matrix",
  PersonalOracleAgent: "oracle_matrix",
  EnhancedPersonalOracleAgent: "oracle_matrix",
  PersonalizedOracleAgent: "oracle_matrix",
  MayaActivation: "oracle_matrix",

  // Elemental Agents
  FireAgent: "fire_agent",
  WaterAgent: "water_agent",
  EarthAgent: "earth_agent",
  AirAgent: "air_agent",
  AetherAgent: "aether_agent",
  ShadowAgent: "shadow_agent",

  // Special Agents
  FacilitatorAgent: "aether_agent",
  AdjusterAgent: "earth_agent",
  NarratorAgent: "narrator",
};

// Role-based fallback mapping
export const ROLE_VOICE_MAPPING: Record<string, string> = {
  oracle: "oracle_matrix",
  elemental: "aether_agent",
  narrator: "narrator",
  fire: "fire_agent",
  water: "water_agent",
  earth: "earth_agent",
  air: "air_agent",
  aether: "aether_agent",
  shadow: "shadow_agent",
};

// ElevenLabs voice ID mapping for fallback
export const ELEVENLABS_VOICE_MAPPING: Record<string, ElevenLabsVoiceConfig> = {
  oracle: {
    voiceId: "LcfcDJNUP1GQjkzn1xUU", // Emily (Matrix Oracle feel)
    settings: {
      stability: 0.5,
      similarity_boost: 0.8,
    },
  },
  fire: {
    voiceId: "y2TOWGCXSYEgBanvKsYJ", // Oralia (energetic)
    settings: {
      stability: 0.6,
      similarity_boost: 0.7,
    },
  },
  water: {
    voiceId: "LcfcDJNUP1GQjkzn1xUU", // Emily (gentle)
    settings: {
      stability: 0.7,
      similarity_boost: 0.9,
    },
  },
  earth: {
    voiceId: "LcfcDJNUP1GQjkzn1xUU", // Emily (grounded)
    settings: {
      stability: 0.8,
      similarity_boost: 0.8,
    },
  },
  air: {
    voiceId: "LcfcDJNUP1GQjkzn1xUU", // Emily (clear)
    settings: {
      stability: 0.5,
      similarity_boost: 0.7,
    },
  },
  aether: {
    voiceId: "LcfcDJNUP1GQjkzn1xUU", // Emily (transcendent)
    settings: {
      stability: 0.6,
      similarity_boost: 0.8,
    },
  },
  shadow: {
    voiceId: "LcfcDJNUP1GQjkzn1xUU", // Emily (deep)
    settings: {
      stability: 0.7,
      similarity_boost: 0.9,
    },
  },
  narrator: {
    voiceId: "LcfcDJNUP1GQjkzn1xUU", // Emily (neutral)
    settings: {
      stability: 0.7,
      similarity_boost: 0.9,
    },
  },
};

// Default voice profile for fallback
export const DEFAULT_VOICE_PROFILE: VoiceProfile = {
  name: "Maya",
  role: "Oracle voice of the Spiralogic System",
  archetype: "Matrix Oracle - wise, warm, maternal, and knowing",
  element: "aether",
  voiceStyle: "warm-wise",
  tempo: "slow-medium",
  pitch: "medium-low",
  emotionalQuality: "grounded, serene, subtly amused, maternal presence",
  speakerId: "0",
  promptMarkers: "[pause][smile][soft]",
  examplePromptIntro: "You already know what I'm going to say, don't you?",
  description:
    "Maya embodies the Matrix Oracle archetype: wise, warm, maternal, and knowing. She carries sacred resonance, emotional nuance, and delivers Oracle responses with clarity and care.",
};

// Service configuration
export const VOICE_SERVICE_CONFIG = {
  SESAME_TIMEOUT: 30000, // 30 seconds
  ELEVENLABS_TIMEOUT: 15000, // 15 seconds
  MAX_RETRIES: 2,
  FALLBACK_TO_ELEVENLABS: true,
} as const;

// Voice profile validation
export function isValidVoiceProfile(profile: any): profile is VoiceProfile {
  return (
    profile &&
    typeof profile.element === "string" &&
    typeof profile.voiceStyle === "string" &&
    typeof profile.speakerId === "string" &&
    typeof profile.promptMarkers === "string" &&
    typeof profile.description === "string"
  );
}

// Get voice profile key from agent information
export function getVoiceProfileKey(
  agentRole: string,
  agentType?: string,
): string {
  // Try specific agent type first
  if (agentType && AGENT_VOICE_MAPPING[agentType]) {
    return AGENT_VOICE_MAPPING[agentType];
  }

  // Fall back to role-based mapping
  if (ROLE_VOICE_MAPPING[agentRole]) {
    return ROLE_VOICE_MAPPING[agentRole];
  }

  // Ultimate fallback
  return "oracle_matrix";
}

// Get ElevenLabs configuration for role
export function getElevenLabsConfig(agentRole: string): ElevenLabsVoiceConfig {
  return (
    ELEVENLABS_VOICE_MAPPING[agentRole] || ELEVENLABS_VOICE_MAPPING["oracle"]
  );
}
