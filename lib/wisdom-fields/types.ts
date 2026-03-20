/**
 * Wisdom Fields — Types, Zod schemas, and AI posture logic
 *
 * Two field types:
 *   wisdom_keeper  — past masters, ai_posture: 'contextual'
 *   masters_field  — living thinkers, ai_posture: 'none'
 *
 * Design law: "The intelligence here arises through the
 * community's encounter with the work itself."
 */

import { z } from 'zod';

// ── Enum types ──────────────────────────────────────────────────

export type FieldType = 'wisdom_keeper' | 'masters_field';
export type AIPosture = 'contextual' | 'none';
export type FieldVisibility = 'open' | 'invite_only';
export type FieldStatus = 'active' | 'archived';
export type FieldRole = 'member' | 'steward';
export type MembershipStatus = 'active' | 'left';
export type WorkType = 'book' | 'essay' | 'lecture' | 'interview' | 'other';
export type ContributionType = 'reflection' | 'question' | 'integration' | 'application';
export type ContributionSource = 'direct' | 'evolution_thread';

// ── Row types (match DB columns, snake_case) ────────────────────

export interface WisdomFieldRow {
  id: string;
  slug: string;
  field_type: FieldType;
  ai_posture: AIPosture;
  master_name: string;
  master_dates: string | null;
  master_domain: string | null;
  orientation: string | null;
  ai_posture_note: string | null;
  visibility: FieldVisibility;
  status: FieldStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface WisdomFieldMembershipRow {
  id: string;
  field_id: string;
  member_id: string;
  role: FieldRole;
  status: MembershipStatus;
  joined_at: string;
  updated_at: string;
}

export interface WisdomFieldWorkRow {
  id: string;
  field_id: string;
  title: string;
  year: string | null;
  work_type: WorkType;
  description: string | null;
  external_url: string | null;
  entry_point: boolean;
  added_by: string;
  created_at: string;
}

export interface WisdomFieldCoreIdeaRow {
  id: string;
  field_id: string;
  concept: string;
  one_line: string;
  body: string | null;
  related_concepts: string[] | null;
  sort_order: number;
  added_by: string;
  created_at: string;
  updated_at: string;
}

export interface WisdomFieldContributionRow {
  id: string;
  field_id: string;
  member_id: string;
  contribution_type: ContributionType;
  work_id: string | null;
  source: ContributionSource | null;
  source_entry_id: string | null;
  title: string | null;
  body: string;
  revoked_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface WisdomFieldReplyRow {
  id: string;
  contribution_id: string;
  member_id: string;
  body: string;
  revoked_at: string | null;
  created_at: string;
}

export interface WisdomFieldEvolutionEntryRow {
  id: string;
  field_id: string;
  member_id: string;
  body: string;
  shared: boolean;
  created_at: string;
}

// ── Zod schemas (request validation) ────────────────────────────

export const joinFieldSchema = z.object({
  // open fields need no token; invite_only fields will extend this later
});

export const postContributionSchema = z.object({
  contributionType: z.enum(['reflection', 'question', 'integration', 'application']),
  title: z.string().max(120).optional().nullable(),
  body: z.string().min(1).max(8000),
  workId: z.string().uuid().optional().nullable(),
});

export const postEvolutionEntrySchema = z.object({
  body: z.string().min(1).max(8000),
  shared: z.boolean().default(false),
});

export const patchEvolutionShareSchema = z.object({
  shared: z.boolean(),
});

// ── AI posture enforcement ───────────────────────────────────────

/**
 * Whether MAIA may generate a response in this field's context.
 * Called by the oracle route before invoking the LLM.
 *
 * For ai_posture='none': MAIA must not respond — throw or return false.
 * This is architectural, not a soft preference.
 */
export function canMAIARespond(field: Pick<WisdomFieldRow, 'ai_posture'>): boolean {
  return field.ai_posture === 'contextual';
}

/**
 * System prompt prefix injected for Wisdom Keeper fields (ai_posture='contextual').
 * MAIA explores alongside the member — never speaks as or for the master.
 */
export function getFieldSystemPromptPrefix(
  field: Pick<WisdomFieldRow, 'ai_posture' | 'master_name'>
): string {
  if (field.ai_posture === 'none') {
    throw new Error(
      `[WisdomFields] MAIA must not generate responses in ai_posture:none fields (${field.master_name})`
    );
  }
  return [
    `You are exploring the work of ${field.master_name} alongside the member.`,
    `You are not ${field.master_name}. You do not speak as or for them.`,
    `Your role is to illuminate, reflect, and hold space for the member's encounter with this body of work.`,
    `Always return authority to the member and to the primary source — never to yourself.`,
  ].join(' ');
}
