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

// ─── Shares ─────────────────────────────────────────────────

export type ShareType = 'link' | 'user';
export type PermissionLevel = 'summary_only' | 'selected_entries' | 'read_stream' | 'co_author';

export interface ShareRecord {
  id: string;
  relationshipId: string;
  createdBy: string;
  shareType: ShareType;
  sharedWithUserId: string | null;
  permissionLevel: PermissionLevel;
  expiresAt: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  /** Only present on link shares at creation time (plaintext token, not stored) */
  token?: string;
}

// ─── Weekly Summary ─────────────────────────────────────────

export interface WeeklySummary {
  weekOf: string;                 // ISO date of the Monday
  checkinCount: number;
  topStates: string[];            // Most frequent child states
  whatHappenedMost: string;
  whatHelped: string;
  whatDidntHelp: string;
  patternsEmerging: string;
  nextExperiment: string;
  watchForThreshold: string;
  scriptToTry: string;
  model: string;
  generatedAt: string;
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

export const PERMISSION_LABELS: Record<PermissionLevel, string> = {
  summary_only: 'Weekly Summary Only',
  selected_entries: 'Selected Check-ins',
  read_stream: 'Full Timeline (Read Only)',
  co_author: 'Co-Author',
};

// ─── Astrology Snapshot ──────────────────────────────────────

export interface NatalSummary {
  sun: { sign: string; house: number };
  moon: { sign: string; house: number };
  rising: string;  // ascendant sign
  keyHouses: { house: number; planets: string[] }[];  // houses 2,4,7,8 if occupied
  attachmentSignature: string;  // 1-2 sentence MAIA-generated read
}

export interface ActiveTransit {
  planet: string;
  aspect: string;       // e.g. "conjunct", "square"
  natalPoint: string;   // e.g. "Moon", "Sun", "Ascendant"
  theme: string;        // 1 sentence
  watchFor: string;     // 1 sentence
  supportMove: string;  // 1 sentence
  intensity: 'low' | 'medium' | 'high';
}

export interface AstrologySnapshot {
  id: string;
  relationshipId: string;
  natalSummary: NatalSummary | null;
  activeTransits: ActiveTransit[];
  synastryNarrative: string | null;  // 2-3 sentence relational signature
  computedAt: string;
  expiresAt: string;
  hasBirthData: boolean;
}

// ─── Divination ──────────────────────────────────────────────

export type DivinationType = 'iching' | 'council';

export interface IChingResult {
  hexagramNumber: number;
  hexagramName: string;
  hexagramEnglish: string;
  hexagramCharacter: string;
  changingLines: number[];
  relatingHexagramNumber: number | null;
  relatingHexagramName: string | null;
  castingMethod: 'yarrow' | 'coin';
  judgment: string;
  image: string;
  element: string;
  changeType: string;
  maiaInterpretation: string;  // MAIA's 3-4 sentence reading scoped to this relationship
}

export interface CouncilResult {
  insights: string[];
  tensions: string[];
  risks: string[];
  recommendation: string;
  framingsUsed: string[];
  confidence: number;
}

export interface RelationshipDivination {
  id: string;
  relationshipId: string;
  divinationType: DivinationType;
  question: string | null;
  ichingResult: IChingResult | null;
  councilResult: CouncilResult | null;
  createdAt: string;
}
