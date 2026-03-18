/**
 * Practitioner Loop — Domain Types
 *
 * These types support the Field → Inquiry → Council → Decisions → Changes → Follow-up
 * practitioner workflow. They are practitioner-facing instruments — not mirrors of
 * the Personal Portal experience layer.
 *
 * The conceptual split:
 *   Personal Portal Decisions = what the member is discerning in their life
 *   Practitioner Decisions    = what the practitioner is discerning from evidence
 *
 *   Personal Portal Changes   = how the member's life is shifting
 *   Practitioner Changes      = what intervention or experiment is being designed
 *
 * These types feed INTO the existing studio_decisions and studio_changes tables
 * as input layers. They do not replace those tables.
 */

// ─── Client Inquiry ──────────────────────────────────────────────

/**
 * A reusable prompt set for pre-council client inquiry.
 * Practitioner selects one and attaches it to a session or decision.
 */
export interface InquiryPromptSet {
  id: string;
  title: string;
  description: string;
  targetUseCase: string; // e.g. "conversational urgency", "grief beneath behavior"
  questions: InquiryQuestion[];
  createdAt?: string;
  isBuiltIn?: boolean; // true for shipped prompt sets, false for practitioner-created
}

export interface InquiryQuestion {
  id: string;
  text: string;
  placeholder?: string;   // UI hint for the client
  required?: boolean;
  maxLength?: number;      // character limit — keeps answers signal-dense, not narrative dumps
  answerMode?: 'text' | 'short' | 'bodymap'; // 'short' = single line, 'bodymap' = sensation chips
  bodySensations?: string[]; // offered as chips when answerMode = 'bodymap'
}

// ─── Relational Occupancy Index ───────────────────────────────────

/**
 * A structured 1–5 rating of relational occupancy within or after a session.
 *
 * 1 = reciprocal — genuine back-and-forth, pauses tolerated
 * 2 = mild — some over-talking, readily redirectable
 * 3 = occupied — frequent occupation, pauses difficult but possible
 * 4 = sustained — extended monologue, minimal reciprocal contact
 * 5 = total — no usable intervention channel, full occupation
 *
 * Tracked per session, queryable over time.
 * Shows progression data: is the channel opening?
 */
export interface OccupancyRating {
  id: string;
  decisionId?: string | null;
  changeId?: string | null;
  studioSessionId?: string | null;
  practitionerId: string;
  clientId: string | null;
  score: 1 | 2 | 3 | 4 | 5;
  notes?: string | null;
  warmInterruptionTolerated?: boolean | null;
  momentOfContact?: string | null; // brief note about any moment of genuine contact
  createdAt: string;
}

/**
 * A client's completed responses to a prompt set.
 * Linked to a decision or session. Feeds into council synthesis.
 */
export interface ClientInquiryResponse {
  id: string;
  decisionId?: string | null;
  changeId?: string | null;
  studioSessionId?: string | null;
  clientId: string | null;
  promptSetId: string;
  promptSetTitle: string;
  responses: InquiryAnswer[];
  completedAt: string;
  summaryText?: string | null; // practitioner or MAIA-generated digest
  tags?: string[];
  createdAt: string;
}

export interface InquiryAnswer {
  questionId: string;
  questionText: string;
  answer: string;
}

// ─── Field Signals ────────────────────────────────────────────────

/**
 * A discrete signal from the field — somatic, relational, behavioral, emotional, symbolic, cognitive.
 * Captured between sessions. Can come from client self-report, practitioner observation, or MAIA.
 *
 * Examples:
 *   "tight chest urgency before speaking"
 *   "interrupted spouse twice in 20 minutes"
 *   "dream of being in a room where no one could hear me"
 */
export type FieldSignalSource = 'client' | 'practitioner' | 'maia';

export type FieldSignalType =
  | 'somatic'
  | 'relational'
  | 'behavioral'
  | 'emotional'
  | 'symbolic'
  | 'cognitive';

export interface FieldSignal {
  id: string;
  decisionId?: string | null;
  changeId?: string | null;
  studioSessionId?: string | null;
  clientId: string | null;
  practitionerId: string;
  source: FieldSignalSource;
  type: FieldSignalType;
  title: string;
  content: string;
  timestamp: string;
  intensity?: number | null; // 0–1, how strong / salient
  tags: string[];
  createdAt: string;
}

// ─── Practitioner Observations ────────────────────────────────────

/**
 * A structured second-person observation from the practitioner.
 * Distinct from general notes — these are specific, named relational and somatic events.
 *
 * Examples:
 *   "client interrupted twice during emotionally charged material"
 *   "visible chest tightening before speaking about mother"
 *   "became more regulated after naming the urge"
 */
export type ObservationType =
  | 'in_session'
  | 'relational_field'
  | 'somatic_shift'
  | 'pattern_notice'
  | 'interruption'
  | 'repair'
  | 'moment_of_contact'  // a moment where reciprocal contact briefly occurred
  | 'occupancy'          // relational occupancy rating — see OccupancyRating
  | 'other';

export interface PractitionerObservation {
  id: string;
  decisionId?: string | null;
  changeId?: string | null;
  studioSessionId?: string | null;
  practitionerId: string;
  clientId: string | null;
  observationType: ObservationType;
  content: string;
  tags: string[];
  createdAt: string;
}

// ─── Decision Input Bundle ─────────────────────────────────────────

/**
 * The structured evidence bundle assembled before running council consultation.
 * Each source is kept separate to reduce projection and prompt blur.
 * If a source is absent, the council proceeds with what is available.
 */
export interface DecisionInputBundle {
  clientInquiry?: ClientInquiryResponse | null;
  fieldSignals?: FieldSignal[];
  practitionerObservations?: PractitionerObservation[];
  existingNotes?: string | null;
  councilContext?: string | null; // prior council recommendation if iterating
}

// ─── Change Experiments (Intervention Design) ──────────────────────

/**
 * An intervention hypothesis and practice design attached to a Change record.
 * This replaces the generic "changes" concept in the Personal Portal with
 * a practitioner-facing experiment planning layer.
 *
 * Answers: what are we testing next, with what modality, and how will we know it worked?
 */
export type InterventionModality =
  | 'hypnosis'
  | 'nlp'
  | 'somatic'
  | 'relational'
  | 'journaling'
  | 'maia_practice'
  | 'mixed'
  | 'other';

export interface ChangeExperiment {
  id: string;
  changeId: string;
  practitionerId: string;
  title: string;
  hypothesis: string; // what we believe is happening and what we're testing
  interventionType: InterventionModality;
  instructions: string; // step-by-step practice or protocol
  observationWindow: string; // "next 2 sessions", "1 week", etc.
  successSignals: string[]; // observable markers that the experiment is working
  riskNotes: string | null; // cautions, contraindications, what to watch for
  followUpIntention: string | null;
  status: 'draft' | 'active' | 'completed' | 'abandoned';
  createdAt: string;
  updatedAt: string;
}

// ─── Intervention Templates (built-in protocols) ──────────────────

/**
 * A built-in template for a specific intervention type.
 * Practitioner selects one when designing a ChangeExperiment.
 * Not presented to the client directly — practitioner adapts it.
 */
export interface InterventionTemplate {
  id: string;
  title: string;
  modality: InterventionModality;
  purpose: string;
  whenToUse: string;
  cautions: string[];
  suggestedSteps: string[];
  signsWorking: string[];
}

// ─── Occupancy Rating History (for tracking over time) ───────────

export interface OccupancyTrend {
  ratings: OccupancyRating[];
  current: OccupancyRating | null;
  trajectory: 'improving' | 'stable' | 'worsening' | 'unknown';
}

// ─── Practitioner Loop Summary (for UI) ──────────────────────────

/**
 * A snapshot of the practitioner loop state for a given decision or change.
 * Used to render the visual workflow tracker.
 */
export interface PractitionerLoopState {
  fieldSignalCount: number;
  inquiryCount: number;
  observationCount: number;
  councilIterationCount: number;
  experimentCount: number;
  hasMentorReflection: boolean;
  hasFollowUp: boolean;
  currentOccupancyScore?: number | null;
}
