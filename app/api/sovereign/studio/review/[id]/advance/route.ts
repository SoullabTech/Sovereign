/**
 * DE-01 — one pass of the reading.
 *
 * A whole-Work review of a 200-page book is many model calls. Doing them in
 * one request means a request that times out, a writer staring at a spinner,
 * and a half-read review with no record of what was read. So the review
 * advances ONE pass at a time — one lens over one segment — and the client
 * calls this until it reports done.
 *
 * Three properties follow, and they are the point:
 *   · COVERAGE IS A FACT. What MAIA has read is exactly the passes marked
 *     done. The room can say "6 of 11 parts read" without estimating.
 *   · AN INTERRUPTED REVIEW RESUMES. Closing the tab loses nothing.
 *   · A FAILED PASS IS RECORDED, not swallowed. A review that could only read
 *     part of the book says so.
 *
 * Findings are written only after passing the evidence gate in
 * lib/studio/developmental/lenses.ts. A finding whose quotes are not in the
 * text MAIA was given never reaches the database.
 */
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { generateWithClaude } from '@/lib/ai/claudeClient';
import {
  buildLensPrompt,
  buildOverviewPrompt,
  LENSES,
  parseJsonAnswer,
  validateFindings,
  type LensId,
  type PartRange,
} from '@/lib/studio/developmental/lenses';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ReviewRow {
  id: string;
  manuscript_id: string;
  living_work_id: string | null;
  declared_form: string | null;
  status: string;
  overview: string | null;
  snapshot_content: string;
}

/**
 * A pass claimed by a process that then died is stuck 'running' forever, and
 * the review can never finish. After this long it is fair game again — long
 * enough that a slow model call is never stolen mid-flight, short enough that
 * a crash does not strand a reading.
 */
const STALE_RUNNING_MINUTES = 10;

export async function POST(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }
  const { id } = await ctx.params;
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const found = await query<ReviewRow>(
      `SELECT id, manuscript_id, living_work_id, declared_form, status, overview,
              snapshot_content
         FROM developmental_reviews
        WHERE id = $1 AND member_id = $2`,
      [id, memberId],
    );
    if (found.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const review = found.rows[0];
    if (review.status === 'complete') {
      return NextResponse.json({ done: true, remaining: 0 });
    }

    // THE SNAPSHOT — the frozen text this review was opened on. Never the live
    // draft. Reading the live draft here is what would let a review become a
    // mixture of draft states, with segment offsets planned against text that
    // has since been rewritten. The writer may keep working; this reading does
    // not notice, and it should not.
    const content = review.snapshot_content;

    // Claim the next pass in one statement, so two tabs advancing the same
    // review cannot read the same segment twice.
    //
    // The claim marks it RUNNING, not done. Claiming and reading are different
    // events, and a container that dies between them must not leave coverage
    // asserting MAIA read something she never saw. A pass becomes 'done' only
    // after its findings have been through the evidence gate.
    //
    // A pass left running by a dead process is reclaimable after
    // STALE_RUNNING_MINUTES, so a crash delays a reading rather than ending it.
    const claimed = await query<{
      id: string;
      lens: string;
      segment_index: number;
      segment_label: string;
      start_offset: number;
      end_offset: number;
    }>(
      `UPDATE developmental_review_passes
          SET status = 'running', started_at = now()
        WHERE id = (
          SELECT id FROM developmental_review_passes
           WHERE review_id = $1
             AND (status = 'pending'
                  OR (status = 'running'
                      AND started_at < now() - ($2 || ' minutes')::interval))
           ORDER BY segment_index ASC, lens ASC
           LIMIT 1
           FOR UPDATE SKIP LOCKED
        )
      RETURNING id, lens, segment_index, segment_label, start_offset, end_offset`,
      [review.id, String(STALE_RUNNING_MINUTES)],
    );

    if (claimed.rows.length === 0) {
      // Nothing claimable. That is not the same as finished: another tab may
      // be mid-pass. Only settle the review when every pass has actually
      // landed on done or failed.
      const open = await query<{ open: string }>(
        `SELECT count(*)::text AS open FROM developmental_review_passes
          WHERE review_id = $1 AND status NOT IN ('done', 'failed')`,
        [review.id],
      );
      if (Number(open.rows[0].open) > 0) {
        return NextResponse.json({ done: false, remaining: 0, waiting: true });
      }

      // Every pass is settled. The overview is the last act of the reading.
      if (!review.overview) {
        const overview = await writeOverview(review, content);
        await query(
          `UPDATE developmental_reviews
              SET overview = $2, status = 'complete', completed_at = now()
            WHERE id = $1`,
          [review.id, overview],
        );
        return NextResponse.json({ done: true, remaining: 0, overview });
      }
      await query(
        `UPDATE developmental_reviews SET status = 'complete', completed_at = now()
          WHERE id = $1`,
        [review.id],
      );
      return NextResponse.json({ done: true, remaining: 0 });
    }

    const pass = claimed.rows[0];
    const lens = pass.lens as LensId;
    const segmentText = content.slice(pass.start_offset, pass.end_offset);

    // Parts, for deriving evidence reach. Read once per pass; cheap.
    const parts = await readPartRanges(review.manuscript_id, content);

    let dropped = 0;
    try {
      const materials = review.living_work_id
        ? await readMaterials(review.living_work_id)
        : [];
      const workRow = review.living_work_id
        ? await query<{ title: string | null; purpose: string | null }>(
            `SELECT title, purpose FROM living_works WHERE id = $1`,
            [review.living_work_id],
          )
        : null;

      const systemPrompt = buildLensPrompt({
        lens,
        declaredForm: review.declared_form,
        workTitle: workRow?.rows[0]?.title ?? null,
        workPurpose: workRow?.rows[0]?.purpose ?? null,
        materials,
      });

      const result = await generateWithClaude({
        systemPrompt,
        userInput: `PART: ${pass.segment_label}\n\n${segmentText}`,
        meta: { originRoute: 'studio/review', mode: 'analysis' },
      });

      const parsed = parseJsonAnswer(result.text) as { findings?: unknown } | null;
      const gate = validateFindings(parsed?.findings ?? [], content, lens, parts);
      dropped = gate.dropped.length;

      for (const [index, finding] of gate.findings.entries()) {
        const row = await query<{ id: string }>(
          `INSERT INTO developmental_findings
             (review_id, member_id, lens, title, observation, why,
              confidence, reach, reach_basis, position)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
           RETURNING id`,
          [
            review.id,
            memberId,
            finding.lens,
            finding.title,
            finding.observation,
            finding.why,
            finding.confidence,
            finding.reach,
            finding.reachBasis,
            pass.segment_index * 100 + index,
          ],
        );
        const findingId = row.rows[0].id;
        for (const [i, ev] of finding.evidence.entries()) {
          const part = parts.find((p) => ev.start >= p.start && ev.start < p.end);
          await query(
            `INSERT INTO developmental_finding_evidence
               (finding_id, kind, start_offset, end_offset, quote, part_label, position)
             VALUES ($1,'manuscript_passage',$2,$3,$4,$5,$6)`,
            [findingId, ev.start, ev.end, ev.quote, part?.label ?? null, i],
          );
        }
      }

      // Read, gated, and written. NOW it is done.
      await query(
        `UPDATE developmental_review_passes
            SET status = 'done', dropped_count = $2, completed_at = now()
          WHERE id = $1`,
        [pass.id, dropped],
      );
    } catch (error) {
      // A failed pass is recorded as failed. The review continues — a book
      // read in nine parts out of eleven should say so, not pretend it read
      // the whole thing and not throw the other nine away.
      console.error('[studio/review] pass failed', { pass: pass.id, error });
      await query(
        `UPDATE developmental_review_passes
            SET status = 'failed', failure_reason = $2, completed_at = now()
          WHERE id = $1`,
        [pass.id, error instanceof Error ? error.message.slice(0, 300) : 'unknown'],
      );
    }

    // What is left to read: pending, plus anything a dead process abandoned.
    // A pass another tab is actively running is not this caller's to count.
    const left = await query<{ remaining: string }>(
      `SELECT count(*)::text AS remaining FROM developmental_review_passes
        WHERE review_id = $1
          AND (status = 'pending'
               OR (status = 'running' AND started_at < now() - ($2 || ' minutes')::interval))`,
      [review.id, String(STALE_RUNNING_MINUTES)],
    );
    const remaining = Number(left.rows[0].remaining);

    console.log('[MAIA/studio] review pass', {
      memberIdPrefix: memberId.slice(0, 8),
      reviewId: review.id,
      lens,
      segment: pass.segment_label,
      dropped,
      remaining,
    });

    return NextResponse.json({
      done: false,
      remaining,
      lens,
      lensLabel: LENSES.find((l) => l.id === lens)?.label ?? lens,
      segmentLabel: pass.segment_label,
    });
  } catch (error) {
    console.error('[studio/review] advance failed', error);
    return NextResponse.json({ error: 'The reading could not continue just now' }, { status: 500 });
  }
}

async function readPartRanges(manuscriptId: string, content: string): Promise<PartRange[]> {
  const res = await query<{ heading: string | null }>(
    `SELECT heading FROM manuscript_sections WHERE manuscript_id = $1 ORDER BY position ASC`,
    [manuscriptId],
  );
  const ranges: PartRange[] = [];
  let cursor = 0;
  for (const row of res.rows) {
    if (!row.heading) continue;
    const at = content.indexOf(row.heading, cursor);
    if (at === -1) continue;
    if (ranges.length > 0) ranges[ranges.length - 1].end = at;
    ranges.push({ label: row.heading, start: at, end: content.length });
    cursor = at + row.heading.length;
  }
  if (ranges.length > 0 && ranges[0].start > 0) {
    ranges.unshift({ label: 'Opening', start: 0, end: ranges[0].start });
  }
  return ranges;
}

async function readMaterials(workId: string) {
  const res = await query<{
    material_type: string;
    relationship_sentence: string | null;
    label: string | null;
  }>(
    `SELECT lwm.material_type, lwm.relationship_sentence, mm.title AS label
       FROM living_work_materials lwm
       LEFT JOIN member_manuscripts mm
              ON lwm.material_type = 'manuscript' AND mm.id::text = lwm.material_id
      WHERE lwm.living_work_id = $1
      ORDER BY lwm.declared_at DESC`,
    [workId],
  );
  return res.rows.map((r) => ({
    kind: r.material_type,
    label: r.label ?? 'an unnamed material',
    sentence: r.relationship_sentence,
  }));
}

/**
 * The overview: what the writer reads first.
 *
 * Written from the findings that SURVIVED the evidence gate, never from the
 * raw text again — so the overview cannot say something the findings do not
 * support, and cannot reintroduce a claim the gate already refused.
 */
async function writeOverview(review: ReviewRow, content: string): Promise<string | null> {
  const findings = await query<{ lens: string; title: string; observation: string }>(
    `SELECT lens, title, observation FROM developmental_findings
      WHERE review_id = $1
      ORDER BY CASE reach WHEN 'wide' THEN 0 WHEN 'moderate' THEN 1 ELSE 2 END
      LIMIT 40`,
    [review.id],
  );
  if (findings.rows.length === 0) {
    return 'This reading did not surface anything I could evidence in the text. That is a real answer, not an empty one — it may mean the Work is holding together, or it may mean I read it in a way that did not meet it. Ask me directly and we can look together.';
  }
  try {
    const listed = findings.rows
      .map((f) => `[${f.lens}] ${f.title} — ${f.observation}`)
      .join('\n');
    const result = await generateWithClaude({
      systemPrompt: buildOverviewPrompt(review.declared_form),
      userInput: `The Work is ${content.length} characters long. These are the findings you evidenced:\n\n${listed}`,
      meta: { originRoute: 'studio/review', mode: 'analysis' },
    });
    return result.text.trim() || null;
  } catch (error) {
    console.error('[studio/review] overview failed', error);
    return null;
  }
}
