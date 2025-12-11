/**
 * Shared types for faith integration systems
 */

// ═══════════════════════════════════════════════════════════════════════════
// CORE FAITH CONTEXT
// ═══════════════════════════════════════════════════════════════════════════

export interface ChristianFaithContext {
  denomination: string;
  denominationalBackground: string; // For backward compatibility
  spiritualMaturity: 'new' | 'growing' | 'mature' | 'wrestling';
  currentStruggles: string[];
  openness: {
    expandedWisdom: boolean;
    mysticInclusion: boolean;
  };
}

export interface ChristianWisdomResponse {
  guidance: string;
  scripturalGrounding?: string;
  practicePrayer?: string;
  denominationalRespect?: string;
}

export interface ChristianWisdomSource {
  tradition: string;
  author?: string;
  text: string;
  context: string;
}

export interface PastoralCareResponse {
  response: string;
  scripturalGrounding?: string;
  scriptureForComfort?: string;
  scriptureComfort?: string; // For backward compatibility
  emergencyResources?: string[];
  followUpGuidance?: string;
}

export interface ScriptureContext {
  spiritualNeed: string;
  denomination: string;
}

export interface ScriptureEngagement {
  passage: string;
  reference: string;
  contextualReflection: string;
  contemplativePrompts: string[];
}