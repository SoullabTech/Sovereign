/**
 * Changes Domain Layer — Types
 *
 * Shared types for change navigation within Studio and MAIA.
 * Parallels the Decision types but oriented toward
 * navigating life transitions rather than making choices.
 *
 * The I Ching (Book of Changes) enriches the consultation
 * with oracular wisdom. The member owns the chain — MAIA
 * enriches when invited but the thread never depends on MAIA.
 */

import type { ConsultationResult } from '@/lib/ain/types';

// ─── Change Types ──────────────────────────────────────────────

export type ChangeType =
  | 'dissolution'
  | 'emergence'
  | 'threshold'
  | 'integration'
  | 'upheaval'
  | 'ripening';

export type ChangeStatus =
  | 'naming'        // member has named the change
  | 'casting'       // I Ching cast in progress (transient)
  | 'consulting'    // council deliberating (transient)
  | 'active'        // change is being tracked
  | 'integrating'   // change is resolving
  | 'complete'
  | 'archived';

export type ChangeUrgency = 'none' | 'low' | 'medium' | 'high' | 'acute';

// ─── Change Posture (inferred for mentor routing) ──────────────

export type ChangePosture =
  | 'frozen'          // paralyzed by the change
  | 'resisting'       // fighting what is happening
  | 'overwhelmed'     // flooded, can't orient
  | 'grieving'        // in the loss phase
  | 'grasping'        // trying to control outcomes
  | 'surrendered'     // released control but unclear
  | 'emerging';       // something new is forming

// ─── Change Context ────────────────────────────────────────────

export interface ChangeContext {
  title: string;
  description: string;
  changeType: ChangeType;
  urgency?: ChangeUrgency;
  emotionalState?: string;
  hexagramNumber?: number;
  relatingHexagramNumber?: number;
  changingLines?: number[];
  clientId?: string;
  clientName?: string;
}

// ─── Change Record ─────────────────────────────────────────────

export interface ChangeRecord {
  id: string;
  practitionerId: string | null;
  memberId: string | null;
  clientId: string | null;
  clientName?: string;
  teamId: string | null;

  // Change context
  title: string;
  description: string;
  changeType: ChangeType;
  emotionalState: string | null;
  urgency: ChangeUrgency | null;

  // I Ching
  hexagramNumber: number | null;
  hexagramName: string | null;
  relatingHexagramNumber: number | null;
  changingLines: number[];
  castingMethod: 'yarrow' | 'coin' | 'browsed' | null;
  castAt: string | null;

  // AIN council
  councilResult: ConsultationResult | null;
  hexagramInterpretation: HexagramInterpretation | null;

  // Notes
  notes: string | null;
  questions: string[];

  // Mentor
  mentorReflection: ChangeMentorReflection | null;
  followUpIntention: string | null;

  // Status
  status: ChangeStatus;
  iterationCount: number;
  consultedAt: string | null;
  createdAt: string;
  updatedAt: string;

  // Change chain (spiral path)
  parentChangeId: string | null;
  rootChangeId: string | null;
  parentChange?: ChangeChainNode | null;
  childChanges?: ChangeChainNode[];

  // Related data
  iterations?: ChangeIteration[];
  experiences?: ChangeExperience[];
}

// ─── I Ching Interpretation ────────────────────────────────────

export interface HexagramInterpretation {
  reading: string;                    // MAIA's interpretation of the hexagram
  guidance: string;                   // what the hexagram suggests for this change
  warnings: string[];                 // what to watch for
  timing: string;                     // what the hexagram says about timing
  changingLinesReading?: string;      // interpretation of specific changing lines
  relatingReading?: string;           // interpretation of the relating hexagram
  generatedAt: string;
  model?: string;
}

// ─── Iteration Support ────────────────────────────────────────

export interface ChangeIteration {
  id: string;
  iterationNumber: number;
  sessionNotes: string | null;
  updatedDescription: string | null;
  emotionalState: string | null;
  hexagramNumber: number | null;
  relatingHexagramNumber: number | null;
  changingLines: number[];
  councilResult: ConsultationResult;
  notes: string | null;
  questions: string[];
  consultedAt: string;
}

export interface ChangeIterationContext {
  iterationNumber: number;
  priorTensions: string[];
  priorRecommendation: string;
  priorInsights: string[];
  priorHexagramNumber?: number;
  sessionNotes?: string;
}

// ─── Change Chain ──────────────────────────────────────────────

export interface ChangeChainNode {
  id: string;
  title: string;
  changeType: ChangeType;
  status: ChangeStatus;
  hexagramNumber: number | null;
  iterationCount: number;
  createdAt: string;
}

// ─── Experience Entries ────────────────────────────────────────

export type ChangeExperienceType =
  | 'field_event'
  | 'reflection'
  | 'breakthrough'
  | 'setback'
  | 'dream'
  | 'synchronicity';

export interface ChangeExperience {
  id: string;
  changeId: string;
  occurredAt: string;
  experienceType: ChangeExperienceType;
  content: string;
  element?: string;
  hexagramResonance?: number;         // if this experience resonates with a hexagram
  tags: string[];
  createdAt: string;
}

// ─── Mentor Reflection ─────────────────────────────────────────

export interface ChangeMentorReflection {
  questions: string[];
  sovereigntyCheck: string;
  nextExperiment: string;
  hexagramWisdom: string;             // specific guidance from the hexagram
  generatedAt: string;
  model?: string;
  templateVersion?: number;
}

export interface ChangeMentorTemplate {
  posture: ChangePosture;
  reflections: string[];
  microPractice: string;
  sovereigntyCheck: string;
}
