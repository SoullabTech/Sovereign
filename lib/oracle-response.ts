// Oracle Response Schema - Extended with motion states
import { MotionState, CoherenceShift } from '@/components/motion/MotionOrchestrator';

export interface OracleResponse {
  text: string; // Claude's main response
  primaryFacetId: string; // e.g. "fire-ignite", "water-flow"
  reflection: string;
  practice: string;
  
  // Synthesis insights
  synthesis?: {
    alignment: string;
    tension: string;
    integration: string;
  };
  
  // Motion state mapping
  motionState?: MotionState;
  coherenceLevel?: number; // 0.0 - 1.0
  coherenceShift?: CoherenceShift;
  
  // Shadow work indicators
  shadowPetals?: string[]; // facet IDs that are dimmed/shadowed
  
  // Aether dynamics
  aetherState?: {
    stage: 1 | 2 | 3; // Expansive | Contractive | Stillness
    intensity: number; // 0.0 - 1.0
  };
  
  // Voice modulation hints
  voiceModulation?: {
    pace: 'slow' | 'normal' | 'quick';
    tone: 'gentle' | 'firm' | 'playful' | 'solemn';
    emphasis: string[]; // key words to emphasize
  };
  
  // Breakthrough detection
  isBreakthrough?: boolean;
  breakthroughType?: 'clarity' | 'release' | 'integration' | 'transcendence';
}

export interface ConversationContext {
  sessionId: string;
  userId?: string;
  checkIns: Record<string, number>; // facetId -> intensity
  journalText?: string;
  voiceTranscript?: string;
  previousResponses: OracleResponse[];
  coherenceHistory: number[];
  currentMotionState: MotionState;
}