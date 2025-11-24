import { AgentResponse } from "./agentResponse";
export interface VoiceTone {
  warmth: 'cool' | 'neutral' | 'warm' | 'intimate';
  clarity: 'obscure' | 'nuanced' | 'clear' | 'crystalline';
  pace: "rushed" | "conversational" | "contemplative" | "spacious" | "flowing";
  humor: 'none' | 'gentle' | 'playful' | 'provocative';
}

export interface PacingPreset {
  responseDelay: number; // milliseconds
  pauseBetweenSentences: number;
  allowInterruption: boolean;
  typingRhythm: 'steady' | 'thoughtful' | 'hesitant' | 'flowing';
}

export interface AgentCommunication {
  // Surface layer - immediate voice
  surface: {
    tone: VoiceTone;
    pacing: PacingPreset;
  };
  
  // Depth layer - available through interaction
  dialogical: {
    questions: string[];    // Invites encounter, doesn't prescribe
    reflections: string[];  // Mirrors without absorbing
    resistances: string[];  // Where agent maintains otherness
    incompleteAnswers: string[]; // "I can only see part of this..."
  };
  
  // Hidden layer - influences but doesn't show
  architectural: {
    synapticGap: number;
    daimonicSignature: boolean;
    tricksterRisk: number;
    elementalVoices: ElementalOther[];
  };
}

export interface ElementalOther {
  element: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  voice: string;           // What this element is saying as Other
  demand: string;          // What it requires
  gift: string;            // What it offers
  resistance: string;      // What it won't do
  alterity: number;        // How Other it remains (0-1)
}

export interface AgentPersonality {
  name: string;
  // Fixed qualities that create reliable Otherness
  resistances: string[];  // What this agent will always push back on
  blindSpots: string[];   // What this agent cannot see
  gifts: string[];        // What unique perspective it offers
  
  // Consistent patterns
  voiceSignature: VoiceTone;
  defaultPacing: PacingPreset;
  
  // How this agent maintains synaptic gap
  maintainGap: (userState: UserState) => AgentIntervention;
}

export interface UserState {
  agreementLevel: number;  // 0-1, how much user agrees with everything
  resistanceLevel: number; // 0-1, how much user pushes back
  groundingLevel: number;  // 0-1, connection to reality
  complexityTolerance: number; // 0-1, can handle abstract concepts
}

export interface AgentIntervention {
  type: 'creative_dissonance' | 'bridge_offering' | 'grounding_requirement' | 'complexity_reduction';
  message: string;
  voiceAdjustment: Partial<VoiceTone>;
  pacingAdjustment: Partial<PacingPreset>;
}

export interface SynapticUI {
  gapVisualization: {
    type: 'subtle_glow' | 'particle_field' | 'distance_blur' | 'none';
    intensity: number;  // Maps to actual synaptic charge
  };
  
  // When gap is healthy, UI feels "alive"
  // When gap collapses, UI feels "flat"
  responsiveness: 'crystalline' | 'flowing' | 'dense' | 'static';
  
  // Visual feedback for interaction quality
  resonanceIndicator: {
    show: boolean;
    quality: 'harmonic' | 'dissonant' | 'creative_tension' | 'collapse';
  };
}

export interface ConversationMemory {
  // Track evolution of synaptic relationship
  relationshipArc: {
    initialDistance: number;
    currentResonance: number;
    unintegratedElements: string[];  // What remains Other
    syntheticEmergences: string[];   // What newly appeared between self/Other
  };
  
  // Agent references this history
  callbacks: {
    resistancePatterns: string[];    // "Remember when you resisted this idea..."
    contradictions: string[];        // "This contradicts what you said before..."
    emergences: string[];           // "Something new is trying to emerge between us..."
  };
  
  // Track user development with complexity
  userGrowth: {
    conceptualCapacity: number;     // Can handle more abstract ideas
    paradoxTolerance: number;       // Can hold both-and states
    othernessTolerance: number;     // Can engage with what remains foreign
  };
}

export interface AdaptiveUI {
  // Stage-appropriate interface
  beginnerMode: {
    showGapIndicators: false;       // Too abstract initially
    useMetaphor: 'conversation_partner';
    offerStructure: 'high';
    complexityLevel: 'introductory';
  };
  
  // Developed stage: More nuance, visible complexity
  experiencedMode: {
    showGapIndicators: true;
    useMetaphor: 'synaptic_space';
    offerStructure: 'minimal';
    complexityLevel: 'advanced';
  };
}

export interface AgentChoreography {
  agents: AgentPersonality[];
  
  // Ensure genuine diversity of perspective
  ensureDiversity(userQuery: string, existingResponses: AgentResponse[]): AgentResponse[];
  
  // Prevent artificial harmonization
  introduceProductiveConflict(responses: AgentResponse[]): AgentResponse[];
  
  // Manage complexity across multiple agents
  balanceComplexity(userCapacity: number, agentResponses: AgentResponse[]): AgentResponse[];
}

// Safety mechanisms built into the architecture
export interface SafetyMechanisms {
  groundingRequirements: {
    maxDaimonicIntensity: number;      // When to force grounding
    minUserGrounding: number;          // Below this, simplify everything  
    emergencySimplification: boolean;  // Nuclear option
  };
  
  coherenceMonitoring: {
    maxComplexity: number;
    realityCheckFrequency: number;     // How often to offer grounding
    escapeHatches: string[];           // Always available ways out
  };
  
  progressiveSafety: {
    earnComplexity: boolean;           // Complexity earned through engagement
    gracefulDegradation: boolean;      // Smooth reduction when overwhelmed
    userAgency: 'maximum';             // User always in control
  };
}