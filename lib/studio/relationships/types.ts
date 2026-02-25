/**
 * Relationship Flow — Types
 *
 * Shared types for the Parent Flow MVP and future relationship modes.
 */

// ─── Relationship (person profile) ──────────────────────────

export type RelationshipRole = 'child' | 'partner' | 'parent' | 'friend' | 'cofounder' | 'sibling' | 'other';

export interface RelationshipRecord {
  id: string;
  practitionerId: string;
  personName: string;
  role: RelationshipRole;
  birthDate: string | null;
  birthTime: string | null;
  birthLocationName: string | null;
  ageYears: number | null;
  notes: string | null;
  status: 'active' | 'archived';
  checkinCount: number;
  lastCheckinAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Check-in ───────────────────────────────────────────────

export type ChildState = 'calm' | 'sensitive' | 'anxious' | 'angry' | 'withdrawn' | 'big_questions' | 'social_pain';
export type ParentNeed = 'what_to_say' | 'how_serious' | 'regulate' | 'is_normal' | 'pattern';

export interface CheckinRecord {
  id: string;
  relationshipId: string;
  practitionerId: string;
  whatHappened: string;
  childState: ChildState | null;
  parentNeed: ParentNeed | null;
  maiaResponse: MAIAParentResponse | null;
  mentorReflection: MentorReflection | null;
  contextTag: string | null;
  elementState: string | null;
  outcome: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── MAIA Parent Response ───────────────────────────────────

export interface MAIAParentResponse {
  framing: string;        // What this likely is (developmental / emotional / situational)
  script: string;         // What to say to the child
  action: string;         // 1-2 concrete actions for the next 30 minutes
  threshold: string;      // When to seek outside support
  model: string;
  generatedAt: string;
  packIdsUsed?: string[]; // Knowledge packs that informed this response
}

// ─── Mentor Reflection ──────────────────────────────────────

export interface MentorReflection {
  questions: string[];
  sovereigntyCheck: string;
  nextExperiment: string;
  generatedAt: string;
  model?: string;
}

// ─── Display helpers ────────────────────────────────────────

export const ROLE_LABELS: Record<RelationshipRole, string> = {
  child: 'Child',
  partner: 'Partner',
  parent: 'Parent',
  friend: 'Friend',
  cofounder: 'Cofounder',
  sibling: 'Sibling',
  other: 'Other',
};

export const CHILD_STATE_LABELS: Record<ChildState, string> = {
  calm: 'Calm',
  sensitive: 'Sensitive',
  anxious: 'Anxious',
  angry: 'Angry',
  withdrawn: 'Withdrawn',
  big_questions: 'Big Questions',
  social_pain: 'Social Pain',
};

export const PARENT_NEED_LABELS: Record<ParentNeed, string> = {
  what_to_say: 'What should I say?',
  how_serious: 'How serious is this?',
  regulate: 'How do I help regulate?',
  is_normal: 'Is this normal?',
  pattern: 'What pattern might be happening?',
};
