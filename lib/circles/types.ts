import { z } from 'zod';

// ── Enum types ──────────────────────────────────────────────

export type CircleRole = 'helper' | 'facilitator' | 'member';
export type CircleStatus = 'active' | 'left' | 'removed';
export type ConsentMode = 'manual' | 'not_now';
export type ContentMode = 'summary_only' | 'full_text';

// ── Row types (match DB columns, snake_case) ────────────────

export interface CircleRow {
  id: string;
  created_by: string;
  name: string;
  description: string | null;
  visibility: 'invite_only' | 'open';
  invite_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface CircleMembershipRow {
  id: string;
  circle_id: string;
  member_id: string;
  role: CircleRole;
  status: CircleStatus;
  consent_mode: ConsentMode;
  consented_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SharedArtifactRow {
  id: string;
  circle_id: string;
  shared_by: string;
  artifact_type: string;
  artifact_ref: string;
  content_mode: ContentMode;
  shared_title: string | null;
  shared_summary: string | null;
  shared_text: string | null;
  revoked_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CircleInviteRow {
  id: string;
  circle_id: string;
  created_by: string;
  token: string;
  revoked_at: string | null;
  created_at: string;
  updated_at: string;
}

// ── Zod schemas (request validation) ────────────────────────

export const createCircleSchema = z.object({
  name: z.string().min(1).max(80),
  description: z.string().max(600).optional().nullable(),
});

export const joinCircleSchema = z.object({
  token: z.string().min(8).max(128),
  consentMode: z.enum(['manual', 'not_now']).default('manual'),
});

export const setConsentSchema = z.object({
  consentMode: z.enum(['manual', 'not_now']),
});

export const shareArtifactSchema = z.object({
  circleId: z.string().uuid(),
  artifactType: z.string().min(1).max(64),
  artifactRef: z.string().min(1).max(128),
  contentMode: z.enum(['summary_only', 'full_text']).default('summary_only'),
  sharedTitle: z.string().max(120).optional().nullable(),
  sharedSummary: z.string().max(1200).optional().nullable(),
  sharedText: z.string().max(12000).optional().nullable(),
});
