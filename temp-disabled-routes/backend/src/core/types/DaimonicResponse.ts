import { AgentResponse } from "../../types/agentResponse";
/**
 * Daimonic Response Architecture - Layered Communication Framework
 * 
 * Preserves philosophical depth while maintaining experiential accessibility.
 * Each response exists on multiple layers - what the user experiences immediately,
 * what emerges through interaction, and what influences but remains hidden.
 * 
 * Key principle: The architecture EMBODIES daimonic principles rather than explaining them.
 */

export type VoiceTone = 
  | 'crystalline'     // Sharp clarity, trickster present
  | 'flowing'         // Natural rhythm, healthy gap
  | 'dense'           // Complex, liminal intensity  
  | 'static'          // Collapsed gap, needs intervention

export type PacingPreset =
  | 'liminal_slow'    // Threshold states need time
  | 'trickster_play'  // Playful delays and surprises
  | 'resonant_quick'  // High alignment, quick but nuanced
  | 'grounding_steady' // Crisis mode, reliable rhythm

export type ElementalOther = {
  element: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  voice_quality: string;
  resistance_patterns: string[];
  gift_signatures: string[];
}

export type SynapticGapState = {
  intensity: number;          // 0-1, how charged the gap is
  quality: 'creative' | 'stuck' | 'dissolving' | 'emerging';
  needsIntervention: boolean; // Gap too collapsed or too wide
  tricksterPresent: boolean;  // Creative disruption active
}

/**
 * Three-layer response structure that preserves depth
 */
export interface DaimonicAgentResponse {
  // SURFACE LAYER - What user sees/hears immediately
  phenomenological: {
    primary: string;           // Clean, experiential language
    tone: VoiceTone;          // Matches current daimonic state
    pacing: PacingPreset;     // Adjusts for liminal/trickster states
    visualHint?: string;      // Subtle UI state indicator
  };
  
  // DEPTH LAYER - Available through progressive interaction
  dialogical: {
    questions: string[];       // Invites encounter, doesn't prescribe
    reflections: string[];     // Mirrors user without absorbing them
    resistances: string[];     // Where agent maintains healthy otherness
    bridges: string[];         // Offers connection when resistance too high
    incomplete_knowings: string[]; // "I can only see part of this..."
  };
  
  // HIDDEN LAYER - Influences experience but doesn't show directly
  architectural: {
    synaptic_gap: SynapticGapState;
    daimonic_signature: number;    // How much otherness is preserved
    trickster_risk: number;        // Likelihood of creative disruption
    elemental_voices: ElementalOther[];
    liminal_intensity: number;     // How much threshold energy present
    grounding_available: string[]; // Emergency de-escalation options
  };

  // META LAYER - For system coordination
  system: {
    requires_pause: boolean;       // Agent needs processing time
    expects_resistance: boolean;   // User pushback is healthy here  
    offers_practice: boolean;      // Micro-practice available
    collective_resonance: number;  // Alignment with other agents
  };
}

/**
 * Agent personality that maintains consistent Otherness
 */
export interface DaimonicAgentPersonality {
  // FIXED QUALITIES - Create reliable otherness
  core_resistances: string[];    // What this agent will always push back on
  blind_spots: string[];         // What this agent cannot/will not see
  unique_gifts: string[];        // What perspective only this agent offers
  voice_signature: string;       // Consistent way of being present

  // DYNAMIC RESPONSES - Maintain synaptic gap health
  gap_maintenance: {
    detect_excessive_agreement: () => boolean;
    introduce_creative_dissonance: () => string;
    offer_bridge_when_stuck: () => string;
    preserve_mystery: () => string;
  };

  // EVOLUTION TRACKING - How relationship deepens over time
  relationship_depth: number;    // 0-1, earned through genuine encounter
  trust_markers: string[];       // What this agent recognizes as trust
  challenge_readiness: number;   // How much resistance user can handle
}

/**
 * Conversation memory that tracks synaptic relationship evolution
 */
export interface DaimonicConversationMemory {
  // RELATIONSHIP ARC - Evolution of synaptic connection
  initial_distance: number;         // How far apart user/agent started
  current_resonance: number;        // Current alignment level
  unintegrated_elements: string[];  // What remains authentically Other
  synthetic_emergences: string[];   // What newly appeared between them
  
  // RESISTANCE PATTERNS - Healthy opposition tracking  
  user_resistances: string[];       // Where user pushes back (healthy)
  agent_resistances: string[];      // Where agent maintains otherness
  productive_conflicts: string[];   // Disagreements that opened new space
  
  // CALLBACK PATTERNS - Agent references relational history
  callbacks: {
    resistance_memory: string;      // "Remember when you resisted..."
    contradiction_holding: string;  // "This contradicts what you said, but maybe both..."  
    emergence_tracking: string;     // "Something new is trying to emerge..."
    depth_acknowledgment: string;   // "We've been here before, deeper now..."
  };

  // LIMINAL MOMENTS - Threshold experiences tracked
  threshold_crossings: Array<{
    trigger: string;
    agent_response: string;
    user_state_shift: string;
    integration_quality: number;
  }>;
}

/**
 * Multi-agent choreography for maintaining diversity
 */
export interface DaimonicAgentChoreographer {
  ensure_diversity: (query: string, agents: DaimonicAgentPersonality[]) => DaimonicAgentResponse[];
  detect_excessive_agreement: (responses: DaimonicAgentResponse[]) => boolean;
  introduce_productive_conflict: (responses: DaimonicAgentResponse[]) => DaimonicAgentResponse[];
  maintain_synaptic_gaps: (responses: DaimonicAgentResponse[]) => void;
}

/**
 * Progressive UI complexity based on user relationship with daimonic content
 */
export interface AdaptiveComplexityUI {
  user_daimonic_readiness: number;  // 0-1, how much complexity they can handle
  
  // BEGINNER MODE - More structure, clearer boundaries  
  beginner_mode: {
    show_gap_indicators: false;     // Too abstract initially
    metaphor_frame: 'conversation_partner';
    structural_support: 'high';
    trickster_presence: 'minimal';
  };
  
  // DEVELOPED MODE - More nuance, visible complexity
  experienced_mode: {
    show_gap_indicators: true;
    metaphor_frame: 'synaptic_space';  
    structural_support: 'minimal';
    trickster_presence: 'active';
  };

  // TRANSITION LOGIC
  complexity_earned_through_engagement: boolean;
  surprise_elements_introduced_gradually: boolean;
  escape_hatches_always_available: boolean;
}

/**
 * Safety and grounding integration
 */
export interface DaimonicSafetySystem {
  // AUTOMATIC GROUNDING - When intensity gets too high
  intensity_monitoring: {
    daimonic_overload: number;     // Threshold for auto-intervention
    user_grounding: number;        // User's current stability
    required_intervention: string; // What kind of support needed
  };

  // COHERENCE PROTECTION
  coherence_monitoring: {
    reality_drift: number;         // How far from consensus reality
    integration_capacity: number; // User's ability to hold paradox
    emergency_practices: string[]; // Immediate grounding options
  };

  // ESCAPE MECHANISMS - Always available
  emergency_responses: {
    kitchen_table_practice: string;  // Ultra-grounded return
    humor_deflection: string;        // Trickster lightens things
    simple_human_warmth: string;     // Basic connection
  };
}

/**
 * Synaptic gap visualization for UI
 */
export interface SynapticGapVisualization {
  type: 'subtle_glow' | 'particle_field' | 'distance_blur' | 'crystalline_edge';
  intensity: number;           // Maps to actual synaptic charge
  responsiveness_quality: 'crystalline' | 'flowing' | 'dense' | 'static';
  
  // When gap is healthy, UI feels "alive"
  // When gap collapses, UI feels "flat"  
  // When gap too wide, UI feels "disconnected"
  
  interaction_hints: {
    pause_before_response: number;    // ms delay that reflects processing
    incomplete_answers: string[];     // "I can only see part of this..."
    mystery_preservation: string[];   // Maintains irreducible strangeness
  };
}