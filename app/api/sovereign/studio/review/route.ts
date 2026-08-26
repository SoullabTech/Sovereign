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
import { LENSES, segment, type PartRange } from '@/lib/studio/developmental/lenses';

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

    const review = await query<{ id: string }>(
      `INSERT INTO developmental_reviews
         (member_id, living_work_id, manuscript_id, draft_revision_id,
          content_hash, content_chars, declared_form, status)
       VALUES ($1,$2::uuid,$3,$4,$5,$6,$7,'reading')
       RETURNING id`,
      [
        memberId,
        workId,
        manuscriptId,
        draft.revision_count,
        contentHash,
        content.length,
        declaredForm,
      ],
    );
    const reviewId = review.rows[0].id;

    // The plan, written down before any reading happens, so coverage is a
    // fact about rows rather than a claim.
    const parts = await readParts(manuscriptId, content);
    const segments = segment(content, parts);
    const values: string[] = [];
    const params: unknown[] = [reviewId];
    let n = 1;
    for (const lens of LENSES) {
      segments.forEach((seg, i) => {
        values.push(`($1,$${++n},$${++n},$${++n},$${++n},$${++n})`);
        params.push(lens.id, i, seg.label, seg.start, seg.end);
      });
    }
    await query(
      `INSERT INTO developmental_review_passes
         (review_id, lens, segment_index, segment_label, start_offset, end_offset)
       VALUES ${values.join(',')}`,
      params,
    );

    console.log('[MAIA/studio] developmental review opened', {
      memberIdPrefix: memberId.slice(0, 8),
      reviewId,
      chars: content.length,
      segments: segments.length,
      passes: values.length,
      declaredForm,
    });

    return NextResponse.json({
      reviewId,
      chars: content.length,
      segments: segments.length,
      passes: values.length,
      lenses: LENSES.map((l) => ({ id: l.id, label: l.label, blurb: l.blurb })),
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
    }>(
      `SELECT id, status, overview, content_hash, content_chars, declared_form,
              created_at, completed_at
         FROM developmental_reviews
        WHERE member_id = $1 AND manuscript_id = $2
        ORDER BY created_at DESC
        LIMIT 1`,
      [memberId, manuscriptId],
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
        priority: string;
        disposition: string;
      }>(
        `SELECT id, lens, title, observation, why, confidence, priority, disposition
           FROM developmental_findings
          WHERE review_id = $1
          ORDER BY CASE priority WHEN 'high' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END,
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

    let done = 0;
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
    }

    // Has the Work moved since MAIA read it? A yes does not invalidate the
    // findings; it means a passage may no longer be where she saw it, and the
    // room says so rather than scrolling the writer somewhere wrong.
    const currentHash = draft
      ? createHash('sha256').update(draft.content, 'utf8').digest('hex')
      : null;

    return NextResponse.json({
      review: {
        id: r.id,
        status: r.status,
        overview: r.overview,
        chars: r.content_chars,
        declaredForm: r.declared_form,
        createdAt: r.created_at,
        completedAt: r.completed_at,
        draftMovedSince: currentHash !== null && currentHash !== r.content_hash,
        coverage: { done, total, byLens },
        findings: findings.rows.map((f) => ({
          id: f.id,
          lens: f.lens,
          title: f.title,
          observation: f.observation,
          why: f.why,
          confidence: f.confidence,
          priority: f.priority,
          disposition: f.disposition,
          evidence: byFinding.get(f.id) ?? [],
        })),
      },
    });
  } catch (error) {
    console.error('[studio/review] read failed', error);
    return NextResponse.json({ error: 'Could not read the review just now' }, { status: 500 });
  }
}
