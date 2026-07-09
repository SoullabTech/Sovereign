/**
 * Practice Field Service
 *
 * DB layer for practice_fields and practice_field_snapshots.
 * MAIA receives Practice Field content as context, not instructions.
 *
 * Spec: docs/specs/PRACTICE_FIELD_SPEC.md
 */

import { query } from '@/lib/db/postgres';
import {
  PracticeField,
  PracticeFieldUpdate,
  PracticeFieldSnapshot,
  PracticeFieldContext,
  FieldGuidance,
  checkPracticeFieldReadiness,
  type PracticeFieldStatus,
} from '@/lib/types/practiceField';
import { validateFieldGuidance, renderFieldGuidance } from '@/lib/practiceField/fieldGuidance';

// ─────────────────────────────────────────────────────────────────────────────
// READ
// ─────────────────────────────────────────────────────────────────────────────

export async function getPracticeField(
  practitionerMemberId: string
): Promise<PracticeField | null> {
  const result = await query(
    `SELECT * FROM practice_fields WHERE practitioner_member_id = $1`,
    [practitionerMemberId]
  );
  return result.rows[0] ?? null;
}

export async function getPracticeFieldById(id: string): Promise<PracticeField | null> {
  const result = await query(`SELECT * FROM practice_fields WHERE id = $1`, [id]);
  return result.rows[0] ?? null;
}

export async function getSnapshotForSpace(spaceId: string): Promise<PracticeFieldSnapshot | null> {
  const result = await query(
    `SELECT * FROM practice_field_snapshots WHERE space_id = $1`,
    [spaceId]
  );
  return result.rows[0] ?? null;
}

// ─────────────────────────────────────────────────────────────────────────────
// WRITE
// ─────────────────────────────────────────────────────────────────────────────

export async function upsertPracticeField(
  practitionerMemberId: string,
  update: PracticeFieldUpdate
): Promise<PracticeField> {
  const existing = await getPracticeField(practitionerMemberId);

  if (!existing) {
    const result = await query(
      `INSERT INTO practice_fields (
        practitioner_member_id, welcome_message, welcome_video_url, about_practice,
        how_we_work_together, how_maia_supports, professional_practice,
        orientation_style, resources, active_field_content
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *`,
      [
        practitionerMemberId,
        update.welcome_message ?? null,
        update.welcome_video_url ?? null,
        update.about_practice ?? null,
        update.how_we_work_together ?? null,
        update.how_maia_supports ?? null,
        update.professional_practice ?? null,
        update.orientation_style ?? 'guided',
        JSON.stringify(update.resources ?? []),
        update.active_field_content ?? null,
      ]
    );
    const field = result.rows[0] as PracticeField;
    await syncStatus(field.id, field);
    return getPracticeField(practitionerMemberId) as Promise<PracticeField>;
  }

  const merged = { ...existing, ...update };
  const result = await query(
    `UPDATE practice_fields SET
      welcome_message = $2, welcome_video_url = $3, about_practice = $4,
      how_we_work_together = $5, how_maia_supports = $6, professional_practice = $7,
      orientation_style = $8, resources = $9, active_field_content = $10,
      active_field_updated_at = CASE WHEN $10 IS DISTINCT FROM active_field_content
        THEN NOW() ELSE active_field_updated_at END
    WHERE practitioner_member_id = $1
    RETURNING *`,
    [
      practitionerMemberId,
      merged.welcome_message ?? null,
      merged.welcome_video_url ?? null,
      merged.about_practice ?? null,
      merged.how_we_work_together ?? null,
      merged.how_maia_supports ?? null,
      merged.professional_practice ?? null,
      merged.orientation_style ?? 'guided',
      JSON.stringify(merged.resources ?? []),
      merged.active_field_content ?? null,
    ]
  );
  const updated = result.rows[0] as PracticeField;
  await syncStatus(updated.id, updated);
  return getPracticeField(practitionerMemberId) as Promise<PracticeField>;
}

/** Compute and persist the correct status. Called after every update. */
async function syncStatus(fieldId: string, field: PracticeField): Promise<void> {
  const readiness = checkPracticeFieldReadiness(field);
  const status: PracticeFieldStatus = readiness.is_live ? 'live' : 'pending';
  const reason = readiness.is_live ? null : `Missing: ${readiness.missing.join(', ')}`;
  await query(
    `UPDATE practice_fields SET status = $2, status_reason = $3 WHERE id = $1`,
    [fieldId, status, reason]
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LAYER 4 — MAIA GUIDANCE (narrow-only field preferences; live, not snapshotted)
// ─────────────────────────────────────────────────────────────────────────────

export async function getFieldGuidance(
  practitionerMemberId: string
): Promise<FieldGuidance> {
  const result = await query(
    `SELECT maia_guidance FROM practice_fields WHERE practitioner_member_id = $1`,
    [practitionerMemberId]
  );
  return (result.rows[0]?.maia_guidance as FieldGuidance) ?? {};
}

/**
 * Set Layer 4 MAIA Guidance for a practitioner. NARROW-ONLY: any preference that
 * attempts to override safeguards or widen authority is rejected — when that
 * happens nothing is written and `violations` explains why. Creates a minimal
 * practice_fields row if the practitioner has none yet.
 */
export async function setFieldGuidance(
  practitionerMemberId: string,
  guidance: FieldGuidance
): Promise<{ ok: boolean; violations: string[]; saved: FieldGuidance | null }> {
  const { ok, violations, sanitized } = validateFieldGuidance(guidance);
  if (!ok) {
    return { ok: false, violations, saved: null };
  }
  await query(
    `INSERT INTO practice_fields (practitioner_member_id, maia_guidance)
     VALUES ($1, $2)
     ON CONFLICT (practitioner_member_id)
     DO UPDATE SET maia_guidance = EXCLUDED.maia_guidance`,
    [practitionerMemberId, JSON.stringify(sanitized)]
  );
  return { ok: true, violations: [], saved: sanitized };
}

// ─────────────────────────────────────────────────────────────────────────────
// SNAPSHOT
// Created when a Relationship Space is formed.
// Per FORMATION_AS_RECORD: immutable; existing spaces keep their formation version.
// ─────────────────────────────────────────────────────────────────────────────

export async function createSnapshot(
  practiceFieldId: string,
  spaceId: string
): Promise<PracticeFieldSnapshot> {
  const field = await getPracticeFieldById(practiceFieldId);
  if (!field) throw new Error('Practice field not found');

  const result = await query(
    `INSERT INTO practice_field_snapshots (
      practice_field_id, space_id,
      welcome_message, about_practice, how_we_work_together, how_maia_supports,
      professional_practice, orientation_style, resources, field_status
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    ON CONFLICT (space_id) DO NOTHING
    RETURNING *`,
    [
      practiceFieldId,
      spaceId,
      field.welcome_message,
      field.about_practice,
      field.how_we_work_together,
      field.how_maia_supports,
      field.professional_practice,
      field.orientation_style,
      JSON.stringify(field.resources),
      field.status,
    ]
  );
  return result.rows[0] as PracticeFieldSnapshot;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIA CONTEXT
// Returns Practice Field as context for MAIA prompt — not instructions.
// ─────────────────────────────────────────────────────────────────────────────

export async function buildPracticeFieldContext(
  spaceId: string,
  practitionerName: string
): Promise<PracticeFieldContext | null> {
  // Prefer snapshot (formation record) for existing spaces
  const snapshot = await getSnapshotForSpace(spaceId);
  if (!snapshot) return null;

  // Active Field + Layer 4 Guidance are always current (never snapshotted) — pull live
  const liveResult = await query(
    `SELECT pf.active_field_content, pf.maia_guidance
     FROM practice_field_snapshots pfs
     JOIN practice_fields pf ON pf.id = pfs.practice_field_id
     WHERE pfs.space_id = $1`,
    [spaceId]
  );
  const activeContent = liveResult.rows[0]?.active_field_content ?? null;
  const guidance = (liveResult.rows[0]?.maia_guidance as FieldGuidance) ?? null;

  return {
    practitioner_name: practitionerName,
    how_we_work_together: snapshot.how_we_work_together,
    how_maia_supports: snapshot.how_maia_supports,
    about_practice: snapshot.about_practice,
    active_field_content: activeContent,
    resources_available: snapshot.resources?.length > 0,
    orientation_style: (snapshot.orientation_style as any) ?? 'guided',
    maia_guidance: guidance,
  };
}

export function formatPracticeFieldContextForPrompt(ctx: PracticeFieldContext): string {
  const lines: string[] = [
    `[Practice Field — ${ctx.practitioner_name}]`,
  ];
  if (ctx.about_practice) {
    lines.push(`Practitioner approach: ${ctx.about_practice}`);
  }
  if (ctx.how_we_work_together) {
    lines.push(`How we work together: ${ctx.how_we_work_together}`);
  }
  if (ctx.how_maia_supports) {
    lines.push(`How MAIA supports this work: ${ctx.how_maia_supports}`);
  }
  if (ctx.active_field_content) {
    lines.push(`Current practitioner emphasis: ${ctx.active_field_content}`);
  }
  if (ctx.resources_available) {
    lines.push(`Practice resources are available for contextual surfacing.`);
  }
  // Layer 4 — narrow-only MAIA Guidance, rendered under a framing header that
  // subordinates it to the constitution. renderFieldGuidance sanitizes at compose
  // (defense in depth) so no override text can reach the prompt.
  const guidanceBlock = renderFieldGuidance(ctx.maia_guidance);
  if (guidanceBlock) {
    lines.push('', guidanceBlock);
  }
  return lines.join('\n');
}
