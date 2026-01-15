/**
 * AIN v2 Types
 *
 * Core types for MAIA-centered intelligence architecture.
 * "Capability, not choreography" — MAIA decides, councils advise.
 */

/**
 * Available councils that MAIA can consult
 */
export type Council =
  | 'deliberation'  // Multi-framing synthesis (AIN classic)
  | 'shadow'        // Depth psychology, projection
  | 'practical'     // Engineering, ops, reality
  | 'ethics'        // Values, governance, boundaries
  | 'dream';        // Symbol, archetype, myth

/**
 * Framing categories for progressive disclosure
 */
export type FramingDomain =
  | 'foundational'
  | 'human'
  | 'strategic'
  | 'theoretical'
  | 'domain';

/**
 * Individual framing metadata (from front-matter)
 */
export interface FramingMeta {
  name: string;
  domain: FramingDomain;
  tensionPairs?: string[];
  requiresContext?: string;
}

/**
 * Full framing with content
 */
export interface Framing extends FramingMeta {
  id: string;           // filename without extension
  content: string;      // full prompt content
  path: string;         // file path for loading
}

/**
 * Framing index entry (what MAIA always sees)
 */
export interface FramingIndexEntry {
  id: string;
  name: string;
  domain: FramingDomain;
  description: string;  // one-liner
}

/**
 * Request to consult a council
 */
export interface ConsultationRequest {
  council: Council;
  question: string;
  context?: {
    memberSpiral?: any;           // SpiralSnapshot
    conversationHistory?: any[];  // Message[]
    element?: string;
    urgency?: 'low' | 'medium' | 'high';
    topicHints?: string[];        // Hints for framing selection
  };
  constraints?: {
    maxFramings?: number;         // Default: 5
    excludeFramings?: string[];
    requireFramings?: string[];
    preferDomains?: FramingDomain[];
  };
}

/**
 * Result from council consultation
 */
export interface ConsultationResult {
  // What the council produced
  insights: string[];             // Key perspectives
  tensions: string[];             // Identified conflicts/polarities
  risks: string[];                // Potential dangers
  recommendation: string;         // Suggested path forward

  // Metadata
  framingsUsed: string[];         // Which framings contributed
  confidence: number;             // 0-1 how useful/confident
  emergenceRating?: EmergenceRating;

  // For MAIA's use
  rawResponses?: Record<string, string>;  // Per-framing responses if needed
  synthesisNotes?: string;        // Notes from synthesis process

  // Sinkhorn weights (when AIN_SINKHORN_ROUTING=1)
  framingWeights?: Record<string, number>;  // Per-framing normalized weights
}

/**
 * Emergence rating from Kauffman framework
 */
export type EmergenceRating =
  | 'recombination'  // Clever arrangement of existing elements
  | 'synthesis'      // Novel integration creating new properties
  | 'breakthrough';  // Genuinely unprestatable insight

/**
 * Soft gates for consultation decisions
 * These are hints, not rules. MAIA always has final say.
 */
export interface ConsultationGates {
  needGate: boolean;        // Would a second perspective help?
  riskGate: boolean;        // Is this high-stakes or fragile?
  complexityGate: boolean;  // Is this multi-domain?
  invitationGate: boolean;  // Did member ask for depth/analysis?
}

/**
 * MAIA's decision about consultation
 */
export interface ConsultationDecision {
  wantsCouncil: boolean;
  council?: Council;
  reason: string;
  framingHints?: string[];  // If she has preferences
}

/**
 * Post-turn learning record
 */
export interface TurnLearning {
  sessionId: string;
  turnNumber: number;
  timestamp: Date;

  // What happened
  question: string;
  councilConsulted: Council | null;
  framingsUsed: string[];
  maiaResponse: string;

  // What MAIA used
  insightsIncorporated: string[];
  insightsIgnored: string[];

  // Member signal
  memberReaction: 'positive' | 'neutral' | 'negative' | 'unknown';
  followUpTone: 'deepening' | 'shifting' | 'closing';

  // Learning artifact
  whatWorked?: string;
  whatMissed?: string;
}

/**
 * Librarian proposal for system improvement
 */
export interface LibrarianProposal {
  type: 'promote_framing' | 'create_framing' | 'deprecate_framing' | 'add_warning' | 'update_index';
  target: string;           // framing id or file path
  reason: string;
  confidence: number;
  suggestedContent?: string;
  evidence?: {
    sessionCount: number;
    successRate: number;
    examples: string[];
  };
}

/**
 * Agent response from a single framing
 */
export interface FramingResponse {
  framingId: string;
  framingName: string;
  response: string;
  confidence?: number;
}

/**
 * Full deliberation result (before synthesis)
 */
export interface DeliberationRaw {
  question: string;
  framingsUsed: Framing[];
  responses: FramingResponse[];
  elapsedMs: number;
}
