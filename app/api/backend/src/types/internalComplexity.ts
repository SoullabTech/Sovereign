/**
 * Internal Complexity Types - Safe Alternative to Daimonic Language
 * 
 * This system recognizes internal psychological complexity while maintaining
 * clear boundaries about what is internal versus external reality.
 */

export interface InternalComplexityDetected {
  userIdHash: string;
  ts: string;
  
  // Psychological state indicators (no external attribution)
  threshold: { 
    intensity: number; 
    label: 'transition' | 'growth' | 'exploration' | 'integration' | 'stable'
  };
  
  // Internal tension patterns
  innerTension: { 
    direction: 'growth-oriented' | 'integration-seeking' | 'exploring'; 
    notes?: string 
  };
  
  // Complexity navigation assessment
  complexityReadiness: { 
    level: number; 
    indicators: string[] // 'curiosity', 'stability', 'support', 'openness'
  };
  
  // Internal harmony/conflict patterns
  internalAlignment: { 
    coherence: boolean; 
    guidance: string 
  };
  
  // Elemental qualities (as internal energetic patterns, not entities)
  elementalQualities: Partial<Record<'passion' | 'flow' | 'stability' | 'clarity' | 'integration', number>>;
  
  // Current phase in personal development
  developmentPhase?: string;
  
  // Experience level with complexity work
  experienceLevel?: boolean;
}

export interface SharedHumanExperiences {
  timestamp: string;
  commonThemes: string[];              // Human themes like "seeking balance", "navigating change"
  supportNeeded: string;               // "grounding", "encouragement", "reflection space"  
  activeQualities: Array<'passion' | 'flow' | 'stability' | 'clarity' | 'integration'>;
  sharedChallenges: string[];          // Common human challenges
  collectiveWisdom: string;            // Supportive human insights
}

export interface InternalComplexityNarrative {
  opening?: string;                    // Always internally attributed
  perspectives?: string[];             // Multiple viewpoints offered
  realityAnchor?: string;             // Grounding in reality
  connectionPrompt?: string;           // Encourage human connection
  practiceOffers?: string[];          // Concrete grounding practices
}

export interface ComplexityNavigationChip {
  type: 'growth' | 'integration' | 'exploration' | 'support';
  label: string;
  color: 'amber' | 'blue' | 'purple' | 'green';
  action?: string;
}

export interface VoicePreset {
  name: string;
  pace: 'normal' | 'measured' | 'soft' | 'spacious';
  tone: 'supportive' | 'grounded' | 'thoughtful' | 'warm';
  pauses: boolean;
  approach?: 'gentle' | 'direct';
}

// Safe event types - no external attribution
export type InternalComplexityEvent = 
  | { type: 'complexity.experience.recognized'; payload: InternalComplexityDetected }
  | { type: 'shared.human.themes'; payload: SharedHumanExperiences };

// Replace dangerous "otherness" concepts with safe internal complexity
export interface InternalAspect {
  // What the person is experiencing (internal attribution)
  experiencePattern: string;           // "You seem to be experiencing..."
  internalTension: string;             // "Part of you wants X while another part wants Y"
  multipleViewpoints: string[];        // Different ways to understand this
  practicalGrounding: string;          // One concrete step
  humanConnection: string;             // Encourage sharing with others
}

export interface ElementalQualities {
  passion: {
    quality: "passionate, transformative energy";
    when_strong: "You might feel driven, creative, restless";
    when_blocked: "You might feel frustrated, stuck, or angry";
    practice: "Channel this energy into one meaningful action";
    reality_check: "This is your internal energy, not an external force";
  };
  flow: {
    quality: "flowing, adaptive, emotional energy";
    when_strong: "You might feel intuitive, connected, emotional";
    when_blocked: "You might feel overwhelmed, disconnected, or numb";
    practice: "Find one way to honor your emotional truth today";
    reality_check: "These are your feelings and intuitions";
  };
  stability: {
    quality: "grounding, practical, embodied energy";
    when_strong: "You might feel centered, practical, reliable";
    when_blocked: "You might feel scattered, impractical, or ungrounded";
    practice: "Take three deep breaths and feel your feet on the ground";
    reality_check: "This is your capacity for groundedness";
  };
  clarity: {
    quality: "clear-thinking, analytical, communicative energy";
    when_strong: "You might feel articulate, logical, communicative";
    when_blocked: "You might feel confused, scattered, or inarticulate";
    practice: "Write down three clear thoughts about your situation";
    reality_check: "This is your thinking and communication ability";
  };
  integration: {
    quality: "synthesizing, wisdom-holding, transformative energy";
    when_strong: "You might feel wise, balanced, transformative";
    when_blocked: "You might feel fragmented, unintegrated, or lost";
    practice: "Ask yourself: what would integration look like here?";
    reality_check: "This is your capacity for wisdom and integration";
  };
}