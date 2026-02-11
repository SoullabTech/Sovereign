/**
 * Decision Council Domain Layer — Types
 *
 * Shared types for practitioner decision support within Studio.
 * These extend the existing client and session models
 * without replacing them.
 */

import type { ConsultationResult } from '@/lib/ain/types';

// ─── Leadership Client Profile ───────────────────────────────────

export interface LeadershipProfile {
  role: string;
  orgName?: string;
  orgSize?: 'startup' | '10-50' | '50-200' | '200-500' | '500-1000' | '1000+';
  industry?: string;
  decisionDomain?: string; // e.g. "Strategy, M&A, People"
  authorityScope?: string; // e.g. "Full P&L", "Division", "Function"
  stakeholderComplexity?: 'low' | 'medium' | 'high';
  pressureLevel?: 'low' | 'medium' | 'high';
  directReports?: number;
  boardExposure?: boolean;
}

// ─── Decision Council ────────────────────────────────────────────

export type TimePressure = 'none' | 'low' | 'medium' | 'high' | 'urgent';
export type DecisionStatus = 'draft' | 'consulting' | 'active' | 'complete' | 'archived';

export interface DecisionContext {
  title: string;
  context: string;
  stakes?: string;
  timePressure?: TimePressure;
  emotionalState?: string;
  clientId?: string;
  clientName?: string;
  leadershipProfile?: LeadershipProfile;
  situationType?: string;
}

export interface DecisionRecord {
  id: string;
  practitionerId: string;
  clientId: string | null;
  clientName?: string;
  teamId: string | null;
  title: string;
  context: string;
  stakes: string | null;
  timePressure: TimePressure | null;
  emotionalState: string | null;
  councilResult: ConsultationResult | null;
  consultantNotes: string | null;
  questionsForLeader: string[];
  situationType: string | null;
  status: DecisionStatus;
  iterationCount: number;
  consultedAt: string | null;
  createdAt: string;
  updatedAt: string;
  iterations?: DecisionIteration[];
  // Spiral path — decision chain
  parentDecisionId: string | null;
  rootDecisionId: string | null;
  parentDecision?: DecisionChainNode | null;
  childDecisions?: DecisionChainNode[];
  // Mentor
  mentorReflection: MentorReflection | null;
  followUpIntention: string | null;
  // Experiences
  experiences?: DecisionExperience[];
}

// ─── Iteration Support ──────────────────────────────────────────

export interface DecisionIteration {
  id: string;
  iterationNumber: number;
  sessionNotes: string | null;
  updatedContext: string | null;
  emotionalState: string | null;
  councilResult: ConsultationResult;
  consultantNotes: string | null;
  questions: string[];
  consultedAt: string;
}

export interface IterationContext {
  iterationNumber: number;
  priorTensions: string[];
  priorRecommendation: string;
  priorInsights: string[];
  sessionNotes?: string;
}

// ─── Decision Chain ──────────────────────────────────────────────

export interface DecisionChainNode {
  id: string;
  title: string;
  status: DecisionStatus;
  iterationCount: number;
  createdAt: string;
}

// ─── Experience Entries ─────────────────────────────────────────

export type ExperienceType = 'field_event' | 'reflection' | 'breakthrough' | 'setback';

export interface DecisionExperience {
  id: string;
  decisionId: string;
  occurredAt: string;
  experienceType: ExperienceType;
  content: string;
  element?: string;
  tags: string[];
  createdAt: string;
}

// ─── Mentor Reflection ──────────────────────────────────────────

export interface MentorReflection {
  questions: string[];
  sovereigntyCheck: string;
  nextExperiment: string;
  generatedAt: string;
  model?: string;            // e.g. 'claude-haiku-4-5-20251001'
  templateVersion?: number;  // tracks which template engine version produced this
}

// ─── Decision Posture (inferred from council result) ────────────

export type DecisionPosture =
  | 'stuck'
  | 'polarized'
  | 'high_stakes'
  | 'avoidant'
  | 'overresponsible'
  | 'clear_but_afraid'
  | 'emerging';

export interface MentorTemplate {
  posture: DecisionPosture;
  reflections: string[];
  microPractice: string;
  sovereigntyCheck: string;
}

// ─── Leadership Briefing ─────────────────────────────────────────

export interface LeadershipBriefingContext {
  recentDecisions: Array<{
    id: string;
    title: string;
    date: string;
    status: DecisionStatus;
    iterationCount?: number;
    keyTensions?: string[];
  }>;
  pressureSignals: string[];
  recurringThemes: string[];
}
