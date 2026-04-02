/**
 * Sacred Learning Domain — Type Definitions
 *
 * Governed by docs/sacred-learning/SACRED_SOURCE_INTEGRITY_POLICY.md
 *
 * Authority hierarchy (immutable):
 *   1 = Revelation (Qur'an)
 *   2 = Exegesis (Tafsir)
 *   3 = Mystical (Ibn al-'Arabi etc.)
 *   4 = Contemplative (Rumi etc.)
 *   5 = Reflection (member)
 *   6 = Synthesis (AI-generated)
 */

// ─── Authority Hierarchy ────────────────────────────────────

export type AuthorityLevel = 1 | 2 | 3 | 4 | 5 | 6;

export const AUTHORITY_LABELS: Record<AuthorityLevel, string> = {
  1: 'Qur\'an',
  2: 'Tafsir',
  3: 'Mystical Commentary',
  4: 'Contemplative',
  5: 'Your Reflection',
  6: 'Study Aid (AI-composed)',
};

export const AUTHORITY_LABEL_FORMATS: Record<AuthorityLevel, (meta?: SourceMeta) => string> = {
  1: (meta) => `Qur'an — ${meta?.surahName || ''} ${meta?.surahNumber || ''}:${meta?.ayahStart || ''}${meta?.ayahEnd && meta.ayahEnd !== meta.ayahStart ? '-' + meta.ayahEnd : ''}`,
  2: (meta) => `Tafsir — ${meta?.author || 'Unknown'}`,
  3: (meta) => `Mystical Commentary — ${meta?.author || 'Unknown'}`,
  4: (meta) => `Contemplative — ${meta?.author || 'Unknown'}${meta?.translator ? ` (tr. ${meta.translator})` : ''}`,
  5: () => 'Your Reflection',
  6: () => 'Study Aid (AI-composed)',
};

export const AUTHORITY_COLORS: Record<AuthorityLevel, { bg: string; text: string; border: string }> = {
  1: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-300' },
  2: { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-300' },
  3: { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-300' },
  4: { bg: 'bg-teal-50', text: 'text-teal-800', border: 'border-teal-300' },
  5: { bg: 'bg-stone-50', text: 'text-stone-600', border: 'border-stone-300' },
  6: { bg: 'bg-gray-50', text: 'text-gray-500', border: 'border-gray-300' },
};

// ─── Source Meta ─────────────────────────────────────────────

export interface SourceMeta {
  author?: string;
  work?: string;
  surahName?: string;
  surahNumber?: number;
  ayahStart?: number;
  ayahEnd?: number;
  sectionRef?: string;
  translator?: string;
  translationEdition?: string;
  sourceEdition?: string;
}

// ─── Review Status ──────────────────────────────────────────

export type ReviewStatus = 'unreviewed' | 'reviewed' | 'approved' | 'flagged';

export type SensitivityFlag = 'SECTARIAN' | 'CONTESTED' | 'GENDER' | 'VIOLENCE' | 'ESOTERIC' | 'AUTHORITY';

// ─── Encounter Mode ─────────────────────────────────────────

export type EncounterMode = 'study' | 'contemplation' | 'practice';

// ─── Layer Visibility ───────────────────────────────────────

export type LayerVisibility = 'text_only' | 'text_meaning' | 'full';

// ─── Source ─────────────────────────────────────────────────

export interface SacredSource {
  id: string;
  authorityLevel: AuthorityLevel;
  author?: string;
  work: string;
  translator?: string;
  translationEdition?: string;
  sourceEdition?: string;
  language: string;
  description?: string;
  reviewStatus: ReviewStatus;
}

// ─── Passage ────────────────────────────────────────────────

export interface SacredPassage {
  id: string;
  sourceId: string;
  authorityLevel: AuthorityLevel;
  surahName?: string;
  surahNumber?: number;
  ayahStart?: number;
  ayahEnd?: number;
  sectionRef?: string;
  arabicText?: string;
  translationText: string;
  contextNote?: string;
  translator?: string;
  translationEdition?: string;
  reviewStatus: ReviewStatus;
  sensitivityFlags: SensitivityFlag[];
  dayNumber?: number;
  arabicInsight?: string;
}

// ─── Commentary ─────────────────────────────────────────────

export interface SacredCommentary {
  id: string;
  passageId: string;
  sourceId: string;
  authorityLevel: AuthorityLevel;
  text: string;
  sectionRef?: string;
  author: string;
  work: string;
  translator?: string;
  reviewStatus: ReviewStatus;
  displayOrder: number;
}

// ─── Theme ──────────────────────────────────────────────────

export interface SacredTheme {
  id: string;
  slug: string;
  name: string;
  arabicTerm?: string;
  description?: string;
  displayOrder: number;
}

// ─── Practice ───────────────────────────────────────────────

export type PracticeType = 'contemplation' | 'embodied' | 'ethical' | 'recitation' | 'dhikr';

export interface SacredPractice {
  id: string;
  passageId?: string;
  themeId?: string;
  authorityLevel: AuthorityLevel;
  practiceType: PracticeType;
  text: string;
  label: string;
  reviewStatus: ReviewStatus;
}

// ─── Reflection ─────────────────────────────────────────────

export interface SacredReflection {
  id: string;
  memberId: string;
  passageId?: string;
  themeId?: string;
  text: string;
  createdAt: string;
}

// ─── Formation State ────────────────────────────────────────

export interface MemberSacredFormation {
  memberId: string;
  currentThemeId?: string;
  currentDayNumber: number;
  passagesEncountered: number;
  reflectionsWritten: number;
  practicesEngaged: number;
  lastEncounterAt?: string;
  formationPhase: 'beginning' | 'deepening' | 'returning';
  layerVisibility: LayerVisibility;
}

// ─── Daily Encounter (composed response) ────────────────────

export interface DailyEncounter {
  passage: SacredPassage;
  commentary: SacredCommentary[];
  practices: SacredPractice[];
  reflectionPrompt: string;
  theme?: SacredTheme;
  previousReflection?: SacredReflection;
  formation: MemberSacredFormation | null;
}

// ─── Reflection Prompts (Level 6, AI-composed) ──────────────

export interface ReflectionPrompt {
  text: string;
  authorityLevel: 6;
  label: 'Reflection Prompt (AI-composed)';
  passageId: string;
}
