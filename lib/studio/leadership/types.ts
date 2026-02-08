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
