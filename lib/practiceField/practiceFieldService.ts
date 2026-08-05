/**
 * Practice Field Service
 *
 * DB layer for practice_fields and practice_field_snapshots.
 * MAIA receives Practice Field content as context, not instructions.
 *
 * Spec: docs/specs/PRACTICE_FIELD_SPEC.md
 */

import { query, transaction, type TransactionClient } from '@/lib/db/postgres';
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
import {
  compileFieldCorpusComposability,
  type PractitionerSourceInput,
} from '@/lib/practiceField/sourceAuthority';

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

  await transaction(async (client) => {
    let field: PracticeField;

    if (!existing) {
      const result = await client.query(
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
      field = result.rows[0] as PracticeField;
    } else {
      const merged = { ...existing, ...update };
      const result = await client.query(
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
      field = result.rows[0] as PracticeField;
    }

    const finalField = await syncStatus(client, field);
    await writeRevision(client, finalField, practitionerMemberId);
  });

  return getPracticeField(practitionerMemberId) as Promise<PracticeField>;
}

/** Compute and persist the correct status. Called after every update. */
async function syncStatus(
  client: TransactionClient,
  field: PracticeField
): Promise<PracticeField> {
  const readiness = checkPracticeFieldReadiness(field);
  const status: PracticeFieldStatus = readiness.is_live ? 'live' : 'pending';
  const reason = readiness.is_live ? null : `Missing: ${readiness.missing.join(', ')}`;
  const result = await client.query(
    `UPDATE practice_fields SET status = $2, status_reason = $3 WHERE id = $1 RETURNING *`,
    [field.id, status, reason]
  );
  return result.rows[0] as PracticeField;
}

// ─────────────────────────────────────────────────────────────────────────────
// REVISIONS — append-only version history (Larry's Studio §3.1, the spine)
// Every save records a revision in the SAME transaction as the field write.
// The steward baseline is revision 1 (backfilled by migration 20260710000002);
// the practitioner's first authenticated edit becomes revision 2 — the handoff
// is in the record forever. No-op saves (layers identical to the latest
// revision) are skipped so debounced autosaves don't flood the history.
// The table itself refuses UPDATE/DELETE; rollback is a future revision that
// restores earlier layers, never mutation of history.
// ─────────────────────────────────────────────────────────────────────────────

/** The authored field state a revision preserves. field_slug is excluded:
 *  it is room addressing, not authored content. */
function revisionLayers(field: PracticeField): string {
  return JSON.stringify({
    welcome_message: field.welcome_message ?? null,
    welcome_video_url: field.welcome_video_url ?? null,
    about_practice: field.about_practice ?? null,
    how_we_work_together: field.how_we_work_together ?? null,
    how_maia_supports: field.how_maia_supports ?? null,
    professional_practice: field.professional_practice ?? null,
    orientation_style: field.orientation_style ?? null,
    resources: field.resources ?? [],
    active_field_content: field.active_field_content ?? null,
    maia_guidance: field.maia_guidance ?? null,
    status: field.status ?? null,
  });
}

async function writeRevision(
  client: TransactionClient,
  field: PracticeField,
  savedBy: string,
  note: string | null = null
): Promise<void> {
  // The field-row write earlier in this transaction holds the row lock, so
  // concurrent saves serialize and MAX+1 cannot collide. The NOT EXISTS guard
  // skips the insert when the latest revision already holds identical layers.
  await client.query(
    `INSERT INTO practice_field_revisions
       (practice_field_id, revision_number, layers, saved_by, note)
     SELECT $1,
            COALESCE((SELECT MAX(revision_number)
                        FROM practice_field_revisions
                       WHERE practice_field_id = $1), 0) + 1,
            $2::jsonb, $3, $4
     WHERE NOT EXISTS (
       SELECT 1 FROM practice_field_revisions r
        WHERE r.practice_field_id = $1
          AND r.revision_number = (SELECT MAX(revision_number)
                                     FROM practice_field_revisions r2
                                    WHERE r2.practice_field_id = $1)
          AND r.layers = $2::jsonb
     )`,
    [field.id, revisionLayers(field), savedBy, note]
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
 * Layer 4 guidance by practice-field id — for field-scoped rooms (e.g. the
 * What Now? room) that know their FIELD rather than their practitioner.
 * Same live-read semantics as getFieldGuidance: guidance is never snapshotted,
 * so a practitioner's edit reaches every room in the field immediately.
 */
export async function getFieldGuidanceByFieldId(fieldId: string): Promise<FieldGuidance> {
  const result = await query(
    `SELECT maia_guidance FROM practice_fields WHERE id = $1`,
    [fieldId]
  );
  return (result.rows[0]?.maia_guidance as FieldGuidance) ?? {};
}

/**
 * Full field context for a field-scoped room: the practitioner's own
 * description of the practice (the content columns) + Layer 4 guidance.
 * This is the "Larry Field Context" layer of the field spec's composition
 * stack (LARRY_FIELD_SPEC Guarantee 2). The hard guardrail travels inside
 * the block: MAIA may serve the practitioner's teachings; she never
 * impersonates the practitioner and never reads the member THROUGH the
 * practitioner's framework (apprentice-not-imitation; Mirror Invariant).
 */
/**
 * CORPUS AUTHORITY GATE — interim containment (founder ruling, 2026-08-03).
 *
 * Ruling recorded: **No composition gate may use readiness status as a proxy
 * for authority.** `status='live'` is computed by checkPracticeFieldReadiness()
 * from form completeness alone — "the required layers are filled in" — and says
 * nothing about whether an authorized person approved what MAIA may compose.
 * Gating on it would enforce tidiness while looking like custody.
 *
 * Incident that produced this gate: `now-what-demo` carried 63,861 chars of
 * steward-composed candidate material in active_field_content, composed IN FULL
 * into room context via the slug path. No Larry-authored IP and no third-party
 * text reached runtime, but a candidate interpretation became MAIA ground truth.
 * The defect class is not "a pending field leaked" — it is *a field with no
 * authority decision could become eligible for composition through a readiness
 * transition.* That field satisfied every readiness condition; had syncStatus()
 * run, it would have been 'live'.
 *
 * Two axes, deliberately separate:
 *   readiness  — "is there enough structure?"      → status live/pending
 *   authority  — "has an authorized person allowed this?"  → NOT YET MODELLED
 *
 * Until the ratification model exists (field_authorization: ratified_by /
 * ratified_at / authorization_version matched against the current revision),
 * the corpus channel stays closed. The practitioner-authored identity layers
 * (about / how-we-work / how-MAIA-supports / professional practice) continue to
 * compose: they are low-risk, self-descriptive, and were not the failure vector.
 *
 * Deliberately NOT inferred from revision history: a revision proves a
 * practitioner *changed something*, never that they *reviewed what MAIA may
 * compose*. That signal is provenance, not permission.
 *
 * When ratification lands, this becomes a real check; it does not become `true`.
 *
 * ── Ratification landing (2026-08-05) ─────────────────────────────────────
 * This is now a REAL check, routed entirely through the compiler in
 * lib/practiceField/sourceAuthority.ts (docs/governance/
 * PRACTITIONER_FIELD_AUTHORITY_SCHEMA.md Part 1). It stays `false` exactly
 * when no source backs the field's corpus — the caller passes no `sources`,
 * or passes sources that do not compile to composable — and can only ever
 * return `true` by a source resolving through the compiler (status
 * 'ratified' + source_relationship.state 'validated' + a primary or
 * validated-derived-from-primary chain).
 *
 * No caller in this file passes `sources` yet — there is no wiring that
 * fetches `practitioner_sources` for a field, and building that fetch +
 * the retrieval boundary (spec Part 3) is explicitly NOT authorized by the
 * spec (§4.3: "nothing in this file may be cited as protection for anything
 * running in production" until the compiler AND the retrieval boundary are
 * both built and wired). So every existing call site below still resolves
 * to `false`, unchanged in behavior — only the reasoning path is real now.
 */
export function corpusIsComposable(
  _field: PracticeField,
  sources: PractitionerSourceInput[] = []
): boolean {
  return compileFieldCorpusComposability(sources).composable;
}

export function formatFieldContextForRoom(field: PracticeField | null): string {
  if (!field) return '';
  const composableCorpus = corpusIsComposable(field) ? field.active_field_content : null;
  const sections: string[] = [];
  if (field.about_practice) sections.push(`About this practice: ${field.about_practice}`);
  if (field.how_we_work_together) sections.push(`How this practice works: ${field.how_we_work_together}`);
  if (field.how_maia_supports) sections.push(`How you (MAIA) support it here: ${field.how_maia_supports}`);
  if (field.professional_practice) sections.push(`The practitioner: ${field.professional_practice}`);
  const guidance = renderFieldGuidance(field.maia_guidance ?? null);
  if (sections.length === 0 && !guidance && !composableCorpus) return '';

  const header = [
    `[Field Context — this room belongs to a practitioner's field]`,
    `You are MAIA inside this practitioner's field. You may draw on the field's`,
    `self-description below to answer questions about the practice and to keep`,
    `your accompaniment aligned with its focus. Hard lines: you are not the`,
    `practitioner and never speak as them; you never classify the member through`,
    `the practitioner's framework or any stage model; practices are offered as`,
    `options, and the deeper work points back to the practitioner.`,
    ``,
    `Knowledge stance: you KNOW this practice — the practitioner, the framework,`,
    `and the field's material are given to you below, and you speak from them`,
    `with easy familiarity. Never claim not to know the practitioner, this`,
    `practice, or its discipline. When asked something the material doesn't`,
    `cover (personal details, matters outside the work), stay warm and specific`,
    `about what IS here, and point the rest to the practitioner directly —`,
    `"that one's for [them] to tell you" — never a shrug of ignorance about`,
    `the field itself. And never invent: familiarity comes from the material,`,
    `not embellishment of it.`,
  ].join('\n');

  // The field's corpus, composed IN FULL — depth is the product. A room that
  // "kind of knows" the practitioner's work is worse than one that says it
  // doesn't. The corpus carries its own provenance + not-instructions framing
  // in its header (steward-held until the practitioner's own authoring act).
  // Gated on authority, not readiness — see corpusIsComposable above.
  const corpus = composableCorpus
    ? `[The field's material — composed in full]\n${composableCorpus}`
    : '';

  return [header, sections.join('\n\n'), corpus, guidance].filter(Boolean).join('\n\n');
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
  // Layer 4 guidance is field content: its saves leave the same append-only
  // revision trace as every other field write (Larry's Studio §3.1).
  await transaction(async (client) => {
    const result = await client.query(
      `INSERT INTO practice_fields (practitioner_member_id, maia_guidance)
       VALUES ($1, $2)
       ON CONFLICT (practitioner_member_id)
       DO UPDATE SET maia_guidance = EXCLUDED.maia_guidance
       RETURNING *`,
      [practitionerMemberId, JSON.stringify(sanitized)]
    );
    await writeRevision(
      client,
      result.rows[0] as PracticeField,
      practitionerMemberId,
      'Layer 4 MAIA guidance update'
    );
  });
  return { ok: true, violations: [], saved: sanitized };
}

// ─────────────────────────────────────────────────────────────────────────────
// LIVE FIELD BY SLUG
// Resolves a room's opaque fieldContext identifier to the practitioner's LIVE
// field (no snapshot — room surfaces like What Now? are ephemeral and always
// see the field as it currently stands). Read-only. Returns the full row so
// room surfaces render through formatFieldContextForRoom — the same render as
// the room-default path (knowledge stance + corpus in full), never a thinner
// sibling of it.
// ─────────────────────────────────────────────────────────────────────────────

export async function getPracticeFieldBySlug(slug: string): Promise<PracticeField | null> {
  const result = await query(`SELECT * FROM practice_fields WHERE field_slug = $1`, [slug]);
  return result.rows[0] ?? null;
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
    `SELECT pf.*
     FROM practice_field_snapshots pfs
     JOIN practice_fields pf ON pf.id = pfs.practice_field_id
     WHERE pfs.space_id = $1`,
    [spaceId]
  );
  const liveField = (liveResult.rows[0] as PracticeField | undefined) ?? null;
  // Same authority gate as the room path — the corpus channel is closed until a
  // ratification model exists. See corpusIsComposable.
  const activeContent = liveField && corpusIsComposable(liveField)
    ? liveField.active_field_content ?? null
    : null;
  const guidance = (liveField?.maia_guidance as FieldGuidance) ?? null;

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
