/**
 * DE-01 — Developmental Review: open a review, or read the current one.
 *
 * POST creates a review by taking a SNAPSHOT of the draft: the exact text, its
 * hash, and the revision it came from. Every finding's evidence is an offset
 * into that snapshot, so a passage reference cannot drift when the writer keeps
 * writing. The reading itself happens one pass at a time — see ./[id]/advance.
 *
 * GET returns the current review with its findings and their evidence, plus
 * honest coverage: which passes are done, which are not, and whether the draft
 * has moved since MAIA read it.
 *
 * Nothing here writes to the draft. A review is a reading.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
/* A truncated UUID is still a fragment of the real identifier. memberRef
   is a one-way hash: correlation across log lines without the id itself. */
import { memberRef } from '@/lib/privacy/memberRef';
import { lensesFor, segment, type PartRange } from '@/lib/studio/developmental/lenses';
import { planPasses, type PriorPass } from '@/lib/studio/developmental/incremental';
import { checkpointsFor, READER_PHENOMENA } from '@/lib/studio/developmental/reader';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const MIN_REVIEWABLE_CHARS = 1200;

interface DraftRow {
  content: string;
  revision_count: number;
}

async function readDraft(manuscriptId: string, memberId: string): Promise<DraftRow | null> {
  const res = await query<DraftRow>(
    `SELECT content, revision_count FROM manuscript_working_drafts
      WHERE manuscript_id = $1 AND member_id = $2`,
    [manuscriptId, memberId],
  );
  return res.rows[0] ?? null;
}

/** The parts the member carried in, as ranges in the current draft text. */
async function readParts(manuscriptId: string, content: string): Promise<PartRange[]> {
  const res = await query<{ heading: string | null; position: number }>(
    `SELECT heading, position FROM manuscript_sections
      WHERE manuscript_id = $1 ORDER BY position ASC`,
    [manuscriptId],
  );
  const ranges: PartRange[] = [];
  let cursor = 0;
  for (const row of res.rows) {
    if (!row.heading) continue;
    const at = content.indexOf(row.heading, cursor);
    if (at === -1) continue; // the writer removed or rewrote this heading
    if (ranges.length > 0) ranges[ranges.length - 1].end = at;
    ranges.push({ label: row.heading, start: at, end: content.length });
    cursor = at + row.heading.length;
  }
  // Anything before the first heading is still part of the book.
  if (ranges.length > 0 && ranges[0].start > 0) {
    ranges.unshift({ label: 'Opening', start: 0, end: ranges[0].start });
  }
  return ranges;
}

export async function POST(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const manuscriptId = typeof body.manuscriptId === 'string' ? body.manuscriptId : null;
  const workId = typeof body.workId === 'string' ? body.workId : null;
  // Two modes of reading, one machine. 'developmental' asks what is happening
  // in the Work; 'reader' asks what the Work has made available by a point.
  const mode = body.mode === 'reader' ? 'reader' : 'developmental';
  if (!manuscriptId) {
    return NextResponse.json({ error: 'manuscriptId is required' }, { status: 400 });
  }

  try {
    // Member-scoped: a manuscript that is not theirs does not exist here.
    const owns = await query<{ id: string }>(
      `SELECT id FROM member_manuscripts WHERE id = $1 AND member_id = $2`,
      [manuscriptId, memberId],
    );
    if (owns.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const draft = await readDraft(manuscriptId, memberId);
    if (!draft) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const content = draft.content;
    if (content.trim().length < MIN_REVIEWABLE_CHARS) {
      // Honest refusal: a developmental reading of two paragraphs would be
      // invention dressed as insight.
      return NextResponse.json(
        {
          error: 'too_little_writing',
          message:
            'There is not enough written yet for a developmental reading. Keep going — this becomes useful once the Work has some length to it.',
        },
        { status: 409 },
      );
    }

    // The writer's own word for the form, when they declared one. Never guessed.
    let declaredForm: string | null = null;
    if (workId) {
      const work = await query<{ form: string | null }>(
        `SELECT form FROM living_works WHERE id = $1 AND member_id = $2`,
        [workId, memberId],
      );
      if (work.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      declaredForm = work.rows[0].form;
    }

    const contentHash = createHash('sha256').update(content, 'utf8').digest('hex');

    // The reading this one continues, if there is one. Only a completed
    // reading may be built on: carrying forward from a half-read review would
    // present its gaps as coverage.
    const priorRow = await query<{ id: string }>(
      `SELECT id FROM developmental_reviews
        WHERE member_id = $1 AND manuscript_id = $2 AND status = 'complete'
          AND mode = $3
        ORDER BY created_at DESC
        LIMIT 1`,
      [memberId, manuscriptId, mode],
    );
    const prior = priorRow.rows[0] ?? null;

    // The snapshot is STORED, not referenced. Every pass reads from this row;
    // the live draft is consulted afterwards only to tell the writer their
    // draft has moved. Without this, a writer who kept working while MAIA read
    // would get a review stitched from several draft states, with offsets
    // planned against a text that no longer existed.
    const review = await query<{ id: string }>(
      `INSERT INTO developmental_reviews
         (member_id, living_work_id, manuscript_id, draft_revision_id,
          snapshot_content, content_hash, content_chars, declared_form, status, mode)
       VALUES ($1,$2::uuid,$3,$4,$5,$6,$7,$8,'reading',$9)
       RETURNING id`,
      [
        memberId,
        workId,
        manuscriptId,
        draft.revision_count,
        content,
        contentHash,
        content.length,
        declaredForm,
        mode,
      ],
    );
    const reviewId = review.rows[0].id;

    // The plan, written down before any reading happens, so coverage is a
    // fact about rows rather than a claim.
    const parts = await readParts(manuscriptId, content);

    // ── Reader mode: phenomena over checkpoints, each pass reading only the
    // Work up to that point. Cumulative and position-bound (Law 2). ────────
    if (mode === 'reader') {
      const checkpoints = checkpointsFor(content.length, parts);
      const values: string[] = [];
      const params: unknown[] = [reviewId];
      let n = 1;
      for (const phenomenon of READER_PHENOMENA) {
        for (const checkpoint of checkpoints) {
          values.push(`($1,$${++n},$${++n},$${++n},$${++n},$${++n},$${++n})`);
          params.push(
            phenomenon.id,
            checkpoint.index,
            checkpoint.label,
            // The range IS the prefix. A reader at chapter one has the Work
            // from its first character to here, and nothing beyond.
            0,
            checkpoint.offset,
            'pending',
          );
        }
      }
      await query(
        `INSERT INTO developmental_review_passes
           (review_id, lens, segment_index, segment_label, start_offset, end_offset, status)
         VALUES ${values.join(',')}`,
        params,
      );

      console.log('[MAIA/studio] reader reading opened', {
        member: memberRef(memberId),
        reviewId,
        chars: content.length,
        checkpoints: checkpoints.length,
        passes: values.length,
      });

      return NextResponse.json({
        reviewId,
        mode,
        chars: content.length,
        checkpoints: checkpoints.length,
        passes: values.length,
        toRead: values.length,
        reused: 0,
        continues: null,
        lenses: READER_PHENOMENA.map((p) => ({ id: p.id, label: p.label, blurb: p.blurb })),
      });
    }

    const segments = segment(content, parts);
    // The lenses this Work's declared form calls for. Universal five always;
    // a form's own lenses only where the writer declared one.
    const lenses = lensesFor(declaredForm);

    // DE-02 — what actually has to be re-read. A pass is reusable when the
    // same lens already read text with the same hash. Matching is on CONTENT,
    // never on position: inserting a paragraph in chapter 2 shifts every later
    // index, and matching on index would re-read the whole book.
    const priorPasses: PriorPass[] = prior
      ? (
          await query<{
            id: string;
            lens: string;
            segment_label: string;
            segment_hash: string;
            status: string;
          }>(
            `SELECT id, lens, segment_label, segment_hash, status
               FROM developmental_review_passes
              WHERE review_id = $1 AND segment_hash IS NOT NULL`,
            [prior.id],
          )
        ).rows.map((r) => ({
          id: r.id,
          lens: r.lens,
          segmentLabel: r.segment_label,
          segmentHash: r.segment_hash,
          status: r.status,
        }))
      : [];

    const plan = planPasses(
      lenses.map((l) => l.id),
      segments.map((seg) => ({ label: seg.label, start: seg.start, end: seg.end, text: seg.text })),
      priorPasses,
    );

    const values: string[] = [];
    const params: unknown[] = [reviewId];
    let n = 1;
    for (const pass of plan.passes) {
      values.push(`($1,$${++n},$${++n},$${++n},$${++n},$${++n},$${++n},$${++n},$${++n}::uuid)`);
      params.push(
        pass.lens,
        pass.segmentIndex,
        pass.segmentLabel,
        pass.start,
        pass.end,
        pass.segmentHash,
        // A reusable pass still runs through /advance — it simply carries the
        // prior findings instead of calling the model. Marking it 'pending'
        // keeps one code path and one place where a pass becomes 'done'.
        'pending',
        // DE-02A: the EXACT prior pass this continues, decided by the planner
        // one-to-one. Carrying reads that pass's findings and nothing else, so
        // a finding can never cross a segment boundary.
        pass.supersedesPassId,
      );
    }
    await query(
      `INSERT INTO developmental_review_passes
         (review_id, lens, segment_index, segment_label, start_offset, end_offset,
          segment_hash, status, supersedes_pass_id)
       VALUES ${values.join(',')}`,
      params,
    );

    if (prior) {
      await query(
        `UPDATE developmental_reviews
            SET supersedes_review_id = $2, reused_pass_count = $3
          WHERE id = $1`,
        [reviewId, prior.id, plan.reused],
      );
    }

    console.log('[MAIA/studio] developmental review opened', {
      member: memberRef(memberId),
      reviewId,
      chars: content.length,
      segments: segments.length,
      passes: plan.passes.length,
      toRead: plan.toRead,
      reused: plan.reused,
      lenses: lenses.length,
      declaredForm,
    });

    return NextResponse.json({
      reviewId,
      chars: content.length,
      segments: segments.length,
      passes: plan.passes.length,
      toRead: plan.toRead,
      reused: plan.reused,
      continues: prior?.id ?? null,
      lenses: lenses.map((l) => ({ id: l.id, label: l.label, blurb: l.blurb })),
    });
  } catch (error) {
    console.error('[studio/review] open failed', error);
    return NextResponse.json({ error: 'Could not open a review just now' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const manuscriptId = request.nextUrl.searchParams.get('manuscriptId');
  if (!manuscriptId) {
    return NextResponse.json({ error: 'manuscriptId is required' }, { status: 400 });
  }
  const mode = request.nextUrl.searchParams.get('mode') === 'reader' ? 'reader' : 'developmental';

  try {
    const review = await query<{
      id: string;
      status: string;
      overview: string | null;
      content_hash: string;
      content_chars: number;
      declared_form: string | null;
      created_at: string;
      completed_at: string | null;
      supersedes_review_id: string | null;
      reused_pass_count: number;
      mode: string;
    }>(
      `SELECT id, status, overview, content_hash, content_chars, declared_form,
              created_at, completed_at, supersedes_review_id, reused_pass_count, mode
         FROM developmental_reviews
        WHERE member_id = $1 AND manuscript_id = $2 AND mode = $3
        ORDER BY created_at DESC
        LIMIT 1`,
      [memberId, manuscriptId, mode],
    );
    if (review.rows.length === 0) return NextResponse.json({ review: null });
    const r = review.rows[0];

    const [findings, evidence, passes, draft] = await Promise.all([
      query<{
        id: string;
        lens: string;
        title: string;
        observation: string;
        why: string | null;
        confidence: string;
        reach: string;
        reach_basis: string | null;
        disposition: string;
        lineage: string;
        carried: boolean;
        only_in_material: boolean;
        checkpoint_label: string | null;
      }>(
        `SELECT id, lens, title, observation, why, confidence, reach, reach_basis,
                disposition, lineage, carried, only_in_material, checkpoint_label
           FROM developmental_findings
          WHERE review_id = $1
          ORDER BY CASE reach WHEN 'wide' THEN 0 WHEN 'moderate' THEN 1 ELSE 2 END,
                   position ASC`,
        [r.id],
      ),
      query<{
        finding_id: string;
        kind: string;
        start_offset: number | null;
        end_offset: number | null;
        quote: string | null;
        part_label: string | null;
      }>(
        `SELECT e.finding_id, e.kind, e.start_offset, e.end_offset, e.quote, e.part_label
           FROM developmental_finding_evidence e
           JOIN developmental_findings f ON f.id = e.finding_id
          WHERE f.review_id = $1
          ORDER BY e.position ASC`,
        [r.id],
      ),
      query<{ lens: string; status: string; total: string }>(
        `SELECT lens, status, count(*)::text AS total
           FROM developmental_review_passes
          WHERE review_id = $1
          GROUP BY lens, status`,
        [r.id],
      ),
      readDraft(manuscriptId, memberId),
    ]);

    const byFinding = new Map<string, unknown[]>();
    for (const e of evidence.rows) {
      const list = byFinding.get(e.finding_id) ?? [];
      list.push({
        kind: e.kind,
        start: e.start_offset,
        end: e.end_offset,
        quote: e.quote,
        partLabel: e.part_label,
      });
      byFinding.set(e.finding_id, list);
    }

    // Only 'done' counts as read. A pass that is running, pending, or failed
    // has not been read, and coverage must not round any of them up.
    let done = 0;
    let failed = 0;
    let total = 0;
    const byLens: Record<string, { done: number; total: number }> = {};
    for (const p of passes.rows) {
      const count = Number(p.total);
      total += count;
      byLens[p.lens] = byLens[p.lens] ?? { done: 0, total: 0 };
      byLens[p.lens].total += count;
      if (p.status === 'done') {
        done += count;
        byLens[p.lens].done += count;
      }
      if (p.status === 'failed') failed += count;
    }

    // Has the Work moved since MAIA read it? The findings stay valid — they
    // are anchored to the stored snapshot — but a passage may no longer be
    // where it was in the live draft, and the room says so rather than
    // scrolling the writer somewhere wrong.
    const currentHash = draft
      ? createHash('sha256').update(draft.content, 'utf8').digest('hex')
      : null;

    return NextResponse.json({
      review: {
        id: r.id,
        status: r.status,
        overview: r.overview,
        // The lens set this Work's declared form calls for — the room must not
        // render a fixed five when a dissertation was read through eight.
        mode: r.mode,
        // In reader mode the "lenses" are the five phenomena.
        lenses: (r.mode === 'reader'
          ? READER_PHENOMENA
          : lensesFor(r.declared_form)
        ).map((l) => ({
          id: l.id,
          label: l.label,
          blurb: l.blurb,
        })),
        chars: r.content_chars,
        declaredForm: r.declared_form,
        continuesReviewId: r.supersedes_review_id,
        reusedPassCount: r.reused_pass_count,
        createdAt: r.created_at,
        completedAt: r.completed_at,
        draftMovedSince: currentHash !== null && currentHash !== r.content_hash,
        coverage: { done, failed, total, byLens },
        findings: findings.rows.map((f) => ({
          id: f.id,
          lens: f.lens,
          title: f.title,
          observation: f.observation,
          why: f.why,
          confidence: f.confidence,
          reach: f.reach,
          reachBasis: f.reach_basis,
          disposition: f.disposition,
          lineage: f.lineage,
          carried: f.carried,
          onlyInMaterial: f.only_in_material,
          checkpointLabel: f.checkpoint_label,
          evidence: byFinding.get(f.id) ?? [],
        })),
      },
    });
  } catch (error) {
    console.error('[studio/review] read failed', error);
    return NextResponse.json({ error: 'Could not read the review just now' }, { status: 500 });
  }
}
