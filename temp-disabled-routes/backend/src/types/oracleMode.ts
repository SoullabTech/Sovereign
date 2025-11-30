// ===============================================
// ORACLE MODE TYPE DEFINITIONS
// Sacred Agency Through Wisdom Choice
// ===============================================

export type OracleModeType =
  | "alchemist"
  | "buddha"
  | "sage"
  | "mystic"
  | "guardian"
  | "tao";

export interface OracleMode {
  id: OracleModeType;
  name: string;
  icon: string;
  tagline: string;
  description: string;
  longDescription: string;
  systemPromptAddition: string;
  responseFilters: string[];
  specialCapabilities: string[];
  color: string;
  glow: string;
  hueShift: number;
  preferredContext: string[];
  avoidedPatterns: string[];
}

export interface ModeSwitchMemory {
  userId: string;
  previousMode: OracleModeType;
  newMode: OracleModeType;
  reason?: string;
  timestamp: Date;
  triggeredBy:
    | "user_choice"
    | "context_suggestion"
    | "crisis_response"
    | "pattern_detection";
}

export interface ModePreference {
  userId: string;
  preferredModes: {
    default: OracleModeType;
    shadow_work: OracleModeType;
    crisis: OracleModeType;
    creative: OracleModeType;
    retreat: OracleModeType;
    integration: OracleModeType;
  };
  modeHistory: ModeSwitchMemory[];
  adaptivePreferences: {
    autoSuggestModes: boolean;
    contextSensitive: boolean;
    rememberLastMode: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ModeAnalytics {
  userId: string;
  modeUsage: Record<
    OracleModeType,
    {
      totalTime: number;
      sessionCount: number;
      lastUsed: Date;
      averageSessionLength: number;
      userSatisfaction: number;
    }
  >;
  modeTransitions: {
    from: OracleModeType;
    to: OracleModeType;
    frequency: number;
    reasons: string[];
  }[];
  contextualEffectiveness: Record<
    string,
    {
      mostEffectiveMode: OracleModeType;
      successRate: number;
    }
  >;
}

export interface ContextualModeRecommendation {
  suggestedMode: OracleModeType;
  confidence: number;
  reason: string;
  contextualFactors: string[];
  urgency: "low" | "medium" | "high" | "crisis";
}

export interface ModeCapability {
  name: string;
  description: string;
  triggers: string[];
  responseModifiers: {
    tone: string;
    depth: string;
    pacing: string;
    metaphors: string[];
  };
}

// Mode-specific response templates
export interface ModeResponseTemplate {
  greeting: string;
  challenge: string;
  support: string;
  integration: string;
  resistance: string;
  breakthrough: string;
  closing: string;
}

// Context detection types
export interface ConversationContext {
  emotionalTone: string;
  shadowContent: boolean;
  crisisMarkers: string[];
  spiritualBypass: boolean;
  integrationNeeded: boolean;
  creativityBlocked: boolean;
  traumaActivated: boolean;
  depthLevel: number;
  vulnerabilityLevel: number;
  attachmentPatterns: string[];
  transformationReadiness: number;
  forcingOutcomes?: boolean;
  excessiveEffort?: boolean;
  innerConflict?: boolean;
  seekingBalance?: boolean;
}

// Mode effectiveness tracking
export interface ModeEffectiveness {
  mode: OracleModeType;
  context: string;
  userResponse: "helpful" | "neutral" | "unhelpful";
  transformationMarker: boolean;
  sessionOutcome: "breakthrough" | "integration" | "resistance" | "neutral";
  timestamp: Date;
}

// Export types as values for runtime use if needed
export const OracleModeTypes = {
  OracleModeType: "OracleModeType",
  OracleMode: "OracleMode",
  ModeSwitchMemory: "ModeSwitchMemory",
  ModePreference: "ModePreference",
  ModeAnalytics: "ModeAnalytics",
  ContextualModeRecommendation: "ContextualModeRecommendation",
  ModeCapability: "ModeCapability",
  ModeResponseTemplate: "ModeResponseTemplate",
  ConversationContext: "ConversationContext",
  ModeEffectiveness: "ModeEffectiveness",
} as const;
