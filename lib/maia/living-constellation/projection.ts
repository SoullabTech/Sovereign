/**
 * LC-02 — read-only source adapters for the Living Constellation.
 *
 * Each adapter reads one existing constitutional center and projects selected
 * source objects into a shared display shape. Nothing here writes, promotes,
 * copies, or creates semantic relationships.
 */
import { query } from '@/lib/db/postgres';
import { CANONICAL_FIELD_KEYS } from '@/lib/maia/living-field/canonicalFieldKeys';
import type {
  ConstellationProjectionNode,
  LivingConstellationProjection,
} from './types';

const FIELD_LABELS = new Map(CANONICAL_FIELD_KEYS.map(({ key, label }) => [key, label]));

const excerpt = (value: string | null | undefined, max = 220): string | null => {
  const text = value?.trim();
  if (!text) return null;
  return text.length <= max ? text : `${text.slice(0, max - 1)}…`;
};

export interface LivingFieldProjectionRow {
  id: string;
  field_key: string;
  current_expression: string;
  status: string;
  created_at: string;
  updated_at: string;
  latest_authored_by: string | null;
}
export function projectLivingFieldRow(row: LivingFieldProjectionRow): ConstellationProjectionNode {
  const authorship =
    row.latest_authored_by === 'maia_candidate' ? 'maia_candidate' : 'member_authored';

  return {
    projectionId: `living_field:expression:${row.id}`,
    domain: 'living_field',
    sourceType: 'living_field_expression',
    sourceId: row.id,
    label: FIELD_LABELS.get(row.field_key) ?? row.field_key,
    excerpt: excerpt(row.current_expression),
    authorship,
    standing: row.status,
    privacy: 'member_private',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    source: {
      table: 'personal_living_fields',
      sourceSurface: '/maia/living-field',
    },
    details: {
      fieldKey: row.field_key,
    },
  };
}

export interface VisionThreadProjectionRow {
  id: string;
  title: string;
  authorship: string;
  member_decision: string | null;
  can_be_shown_to_practitioner: boolean;
  center: string | null;
  spiralogic_phase: string | null;
  field_context: string | null;
  created_at: string;
  updated_at: string;
}

export function projectVisionThreadRow(row: VisionThreadProjectionRow): ConstellationProjectionNode {
  const authorship =
    row.authorship === 'member_authored' ? 'member_authored' : 'member_confirmed';

  return {
    projectionId: `vision_studio:thread:${row.id}`,
    domain: 'vision_studio',
    sourceType: 'vision_thread',
    sourceId: row.id,
    label: row.title,
    excerpt: null,
    authorship,
    standing: row.member_decision ? `carried:${row.member_decision}` : 'carried',
    privacy: row.can_be_shown_to_practitioner
      ? 'member_shared_with_practitioner'
      : 'member_private',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    source: {
      table: 'member_field_note_threads',
      sourceSurface: '/maia/vision-studio',
      // LC-01A: report the stored value honestly; do not treat it as trusted
      // Vision provenance until the separate center-conformance lane is repaired.
      persistedCenter: row.center,
    },
    details: {
      spiralogicPhase: row.spiralogic_phase,
      fieldContext: row.field_context,
    },
  };
}
export interface PracticeFieldProjectionRow {
  id: string;
  status: string;
  about_practice: string | null;
  active_field_content: string | null;
  containment_status: string | null;
  identity_ratified_at: string | null;
  created_at: string;
  updated_at: string;
}

export function projectPracticeFieldRow(row: PracticeFieldProjectionRow): ConstellationProjectionNode {
  const contained = row.containment_status === 'contained';

  return {
    projectionId: `practice_field:field:${row.id}`,
    domain: 'practice_field',
    sourceType: 'practice_field',
    sourceId: row.id,
    label: 'My Practice Field',
    excerpt: excerpt(row.active_field_content) ?? excerpt(row.about_practice),
    authorship: 'practitioner_authored',
    standing: contained ? 'contained' : row.status,
    privacy: 'practitioner_private',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    source: {
      table: 'practice_fields',
      sourceSurface: '/maia/vision-studio?tab=practice',
    },
    details: {
      readiness: row.status,
      contained,
      identityRatified: Boolean(row.identity_ratified_at),
    },
  };
}
export async function loadLivingFieldProjection(memberId: string): Promise<ConstellationProjectionNode[]> {
  const result = await query<LivingFieldProjectionRow>(
    `SELECT
       f.id, f.field_key, f.current_expression, f.status, f.created_at, f.updated_at,
       v.authored_by AS latest_authored_by
     FROM personal_living_fields f
     LEFT JOIN LATERAL (
       SELECT authored_by
       FROM personal_living_field_versions
       WHERE field_id = f.id
       ORDER BY created_at DESC
       LIMIT 1
     ) v ON TRUE
     WHERE f.member_id = $1
       AND NULLIF(BTRIM(f.current_expression), '') IS NOT NULL
     ORDER BY f.updated_at DESC
     LIMIT 12`,
    [memberId],
  );
  return result.rows.map(projectLivingFieldRow);
}

export async function loadVisionStudioProjection(memberId: string): Promise<ConstellationProjectionNode[]> {
  const result = await query<VisionThreadProjectionRow>(
    `SELECT id, title, authorship, member_decision, can_be_shown_to_practitioner,
            center, spiralogic_phase, field_context, created_at, updated_at
     FROM member_field_note_threads
     WHERE member_id = $1
       AND released_at IS NULL
       AND member_confirmed = TRUE
       AND source_session_ref LIKE 'vs-%'
     ORDER BY updated_at DESC
     LIMIT 12`,
    [memberId],
  );
  return result.rows.map(projectVisionThreadRow);
}
export async function loadPracticeFieldProjection(memberId: string): Promise<ConstellationProjectionNode[]> {
  const result = await query<PracticeFieldProjectionRow>(
    `SELECT id, status, about_practice, active_field_content, containment_status,
            identity_ratified_at, created_at, updated_at
     FROM practice_fields
     WHERE practitioner_member_id = $1
     LIMIT 1`,
    [memberId],
  );
  return result.rows.map(projectPracticeFieldRow);
}

const domainWarning = (domain: string) => `${domain} is temporarily unavailable`;

export async function buildLivingConstellationProjection(
  memberId: string,
): Promise<LivingConstellationProjection> {
  const settled = await Promise.allSettled([
    loadLivingFieldProjection(memberId),
    loadVisionStudioProjection(memberId),
    loadPracticeFieldProjection(memberId),
  ]);

  const warnings: string[] = [];
  const nodes: ConstellationProjectionNode[] = [];

  const domains = ['Living Field', 'Vision Studio', 'Practice Field'] as const;
  settled.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      nodes.push(...result.value);
    } else {
      warnings.push(domainWarning(domains[index]));
    }
  });
  return {
    memberCenter: {
      projectionId: 'member:center',
      label: 'You',
      kind: 'orientation_only',
    },
    nodes,
    partial: warnings.length > 0,
    warnings,
    generatedAt: new Date().toISOString(),
  };
}
