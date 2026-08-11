export const dynamic = 'force-dynamic';

/**
 * HOUSE-SOURCE ADMISSION — the founder gesture.
 *
 * The ONLY writer of library_source_admissions. Every admission, exclusion, or
 * reversal of a house/platform wisdom source passes through here.
 *
 * Why there is no script, job, or migration seed that writes this table:
 * migration 20260714000001 established the governing rule for compositional
 * state — "AI suggestions never advance state" — and the D4 founder ruling
 * carried it to the house corpus. Enforced three ways here:
 *   1. requireFounder() needs a real server session, so no script can authenticate;
 *   2. admitted_by is session-derived and a body-supplied value is REJECTED, not
 *      ignored, so an attempt to forge authorship fails loudly;
 *   3. source_checksum is read server-side from library_sources at write time —
 *      the caller cannot name which content version they are admitting.
 *
 * Spec:  docs/specs/HOUSE_SOURCE_ADMISSIBILITY_RECORD_PLAN_2026-08-11.md
 * Proof: docs/architecture/WISDOM_CORPUS_D4_RATIFICATION_PROOF_2026-08-11.md
 */

import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/database/postgres';
import { requireFounder } from '@/lib/founder/founderAuth';
import {
  isAdmissibilityState,
  isAdmissionScope,
  isUseConstraint,
  DEFAULT_ADMISSION_SCOPE,
  DEFAULT_USE_CONSTRAINT,
  type AdmissionRecord,
} from '@/lib/library/admissibility';

/**
 * GET — the founder review queue.
 *
 * One row per candidate source with its CURRENT judgment (highest version for
 * the scope) or `unreviewed` when no judgment exists. Absence is a real state,
 * not a null to be papered over.
 */
export async function GET(req: NextRequest) {
  const auth = await requireFounder();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }

  try {
    const url = new URL(req.url);
    const scope = url.searchParams.get('scope') || DEFAULT_ADMISSION_SCOPE;
    if (!isAdmissionScope(scope)) {
      return NextResponse.json({ error: `Unknown scope: ${scope}` }, { status: 400 });
    }
    const folder = url.searchParams.get('folder');
    const limit = Math.min(Number(url.searchParams.get('limit')) || 200, 1000);

    const rows = await query<any>(
      `SELECT
         s.id                AS source_id,
         s.title             AS extracted_title,
         s.author            AS extracted_author,
         s.checksum,
         s.meta->>'folder'   AS folder,
         s.ingestion_status,
         COALESCE(a.admissibility_state, 'unreviewed') AS admissibility_state,
         a.use_constraint,
         a.admitted_title,
         a.admitted_author,
         a.admitted_at,
         a.admission_basis,
         a.version,
         -- Whether the current judgment still binds THIS content version.
         -- A stale admission is visible in the queue rather than silently inert.
         (a.source_checksum IS NOT NULL AND a.source_checksum <> s.checksum) AS checksum_drifted
       FROM library_sources s
       LEFT JOIN LATERAL (
         SELECT * FROM library_source_admissions x
          WHERE x.source_id = s.id AND x.scope = $1
          ORDER BY x.version DESC LIMIT 1
       ) a ON TRUE
       WHERE s.practitioner_member_id IS NULL
         AND s.vault_file_id IS NULL
         AND s.field_slug IS NULL
         AND ($2::text IS NULL OR s.meta->>'folder' = $2)
       ORDER BY (a.admissibility_state IS NULL) DESC, s.title
       LIMIT ${limit}`,
      [scope, folder]
    );

    return NextResponse.json({ scope, count: rows.length, sources: rows });
  } catch (err) {
    console.error('[founder/library-admissions] GET error:', err);
    return NextResponse.json({ error: 'Failed to load admission queue' }, { status: 500 });
  }
}

/**
 * POST — record a judgment. Append-only: this never updates or deletes.
 *
 * Body: {
 *   source_id, admissibility_state, admission_basis,
 *   admitted_title?, admitted_author?, scope?, use_constraint?
 * }
 */
export async function POST(req: NextRequest) {
  const auth = await requireFounder();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }

  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
    }

    // Reject rather than ignore: a caller trying to name the admitting human, the
    // content version, or the judgment time is attempting to forge the parts of
    // this record that carry its authority. Silent stripping would let that
    // attempt look successful.
    for (const forbidden of ['admitted_by', 'admitted_at', 'source_checksum', 'version']) {
      if (forbidden in body) {
        return NextResponse.json(
          { error: `${forbidden} is derived server-side and may not be supplied` },
          { status: 400 }
        );
      }
    }

    const sourceId = String(body.source_id || '').trim();
    if (!sourceId) {
      return NextResponse.json({ error: 'source_id is required' }, { status: 400 });
    }

    const state = body.admissibility_state;
    if (!isAdmissibilityState(state)) {
      return NextResponse.json({ error: 'admissibility_state is invalid' }, { status: 400 });
    }

    const basis = String(body.admission_basis || '').trim();
    if (!basis) {
      // Required in EVERY state, including 'excluded'. A judgment without a
      // stated reason is not a judgment.
      return NextResponse.json({ error: 'admission_basis is required' }, { status: 400 });
    }

    const scope = body.scope ?? DEFAULT_ADMISSION_SCOPE;
    if (!isAdmissionScope(scope)) {
      return NextResponse.json({ error: `Unknown scope: ${scope}` }, { status: 400 });
    }

    const useConstraint = body.use_constraint ?? DEFAULT_USE_CONSTRAINT;
    if (!isUseConstraint(useConstraint)) {
      return NextResponse.json({ error: `Unknown use_constraint: ${useConstraint}` }, { status: 400 });
    }

    const admittedTitle = body.admitted_title ? String(body.admitted_title).trim() : null;
    const admittedAuthor = body.admitted_author ? String(body.admitted_author).trim() : null;

    // ADMISSION IDENTITY beats SOURCE METADATA. An admission must carry the
    // admitting human's naming — we deliberately do NOT fall back to
    // library_sources.title, which D3 measured as H1-derived and unreliable.
    if (state === 'admitted' && !admittedTitle) {
      return NextResponse.json(
        { error: 'admitted_title is required when admitting — it must be your naming of the artifact, not the extractor\'s' },
        { status: 400 }
      );
    }

    // Single statement: reads the checksum server-side, computes the next
    // version for (source_id, scope), and writes. The UNIQUE(source_id, scope,
    // version) constraint turns a concurrent double-submit into an error rather
    // than two judgments claiming the same revision.
    const inserted = await queryOne<AdmissionRecord>(
      `INSERT INTO library_source_admissions
         (source_id, source_checksum, admissibility_state, admitted_by, admitted_at,
          admission_basis, admitted_title, admitted_author, scope, use_constraint, version)
       SELECT
         s.id,
         s.checksum,
         $2,
         CASE WHEN $2 = 'admitted' THEN $3::uuid ELSE NULL END,
         CASE WHEN $2 = 'admitted' THEN NOW() ELSE NULL END,
         $4, $5, $6, $7, $8,
         COALESCE((SELECT MAX(x.version) FROM library_source_admissions x
                    WHERE x.source_id = s.id AND x.scope = $7), 0) + 1
       FROM library_sources s
       WHERE s.id = $1::uuid
       RETURNING *`,
      [sourceId, state, auth.memberId, basis, admittedTitle, admittedAuthor, scope, useConstraint]
    );

    if (!inserted) {
      return NextResponse.json({ error: 'Source not found' }, { status: 404 });
    }

    console.log(
      `[founder/library-admissions] ${state} source=${sourceId} scope=${scope} ` +
      `use=${useConstraint} v${inserted.version} checksum=${String(inserted.source_checksum).slice(0, 12)}…`
    );

    // The checksum is echoed back so the founder can see exactly which content
    // version this judgment bound to.
    return NextResponse.json({ admission: inserted }, { status: 201 });
  } catch (err: any) {
    if (err?.code === '23505') {
      return NextResponse.json({ error: 'A concurrent judgment was recorded; retry' }, { status: 409 });
    }
    if (err?.code === '23514') {
      return NextResponse.json({ error: 'Judgment violates a schema constraint' }, { status: 400 });
    }
    console.error('[founder/library-admissions] POST error:', err);
    return NextResponse.json({ error: 'Failed to record judgment' }, { status: 500 });
  }
}
