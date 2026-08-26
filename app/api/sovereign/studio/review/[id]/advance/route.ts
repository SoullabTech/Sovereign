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
  deriveReach,
  lensById,
  materialExcerpt,
  parseJsonAnswer,
  validateFindings,
  type LensId,
  type MaterialContext,
  type PartRange,
} from '@/lib/studio/developmental/lenses';
import {
  carryFindings,
  lineageOf,
  noLongerObserved,
  type PriorFinding,
} from '@/lib/studio/developmental/incremental';

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
  supersedes_review_id: string | null;
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
              snapshot_content, supersedes_review_id
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
      segment_hash: string | null;
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
      RETURNING id, lens, segment_index, segment_label, start_offset, end_offset,
                segment_hash`,
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

    // DE-02 — the findings the previous reading made with this exact lens over
    // this exact text. Used to carry a reusable pass, and to give lineage to a
    // re-read one.
    const prior = review.supersedes_review_id
      ? await readPriorFindings(review.supersedes_review_id, lens, pass.segment_hash)
      : [];

    let dropped = 0;
    try {
      let produced: {
        lens: LensId;
        title: string;
        observation: string;
        why: string | null;
        confidence: 'high' | 'medium' | 'low';
        reach: 'wide' | 'moderate' | 'narrow';
        reachBasis: string;
        evidence: { start: number; end: number; quote: string }[];
        carried: boolean;
      }[] = [];

      const reusable = prior.length > 0 && (await isReusable(review.id, pass.id));

      if (reusable) {
        // Nothing in this text changed since MAIA read it, so re-reading would
        // only produce slightly different words for the same observation —
        // churn a writer cannot distinguish from real movement. Carry the
        // findings, but RE-LOCATE their evidence: text inserted earlier moves
        // every later passage, so offsets are never carried.
        const carry = carryFindings(prior, content);
        produced = carry.carried.map((c) => ({
          lens,
          title: c.title,
          observation: c.observation,
          why: null,
          confidence: 'medium' as const,
          ...deriveReach(c.evidence, parts),
          evidence: c.evidence,
          carried: true,
        }));
        if (carry.lost.length > 0) {
          console.log('[MAIA/studio] carried findings lost their passages', {
            reviewId: review.id,
            lens,
            lost: carry.lost.length,
          });
        }
      } else {
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
        produced = gate.findings.map((f) => ({ ...f, carried: false }));
      }

      for (const [index, finding] of produced.entries()) {
        // How this relates to the last reading. A fact about readings, never a
        // judgement about the Work, and never a disposition.
        const { lineage, ancestorId } = lineageOf(
          { lens, title: finding.title, observation: finding.observation },
          prior,
        );
        const row = await query<{ id: string }>(
          `INSERT INTO developmental_findings
             (review_id, member_id, lens, title, observation, why,
              confidence, reach, reach_basis, position, lineage,
              ancestor_finding_id, carried)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::uuid,$13)
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
            lineage,
            ancestorId,
            finding.carried,
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

      // ⛔ What the previous reading saw here and this one did not.
      //
      // Recorded as NO LONGER OBSERVED and nothing else. It is not resolution:
      // the finding may have been addressed, the passage may have moved, or
      // this reading may simply not have noticed. Only the writer resolves a
      // finding, and `disposition` is deliberately untouched by this statement.
      const gone = noLongerObserved(
        prior,
        produced.map((f) => ({ lens, title: f.title, observation: f.observation })),
      );
      if (gone.length > 0) {
        await query(
          `UPDATE developmental_findings
              SET no_longer_observed_at = now(), no_longer_observed_in_review_id = $2
            WHERE id = ANY($1::uuid[]) AND no_longer_observed_at IS NULL`,
          [gone.map((g) => g.id), review.id],
        );
      }

      // Read (or carried), gated, and written. NOW it is done.
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
      lensLabel: lensById(lens)?.label ?? lens,
      segment: pass.segment_label,
      dropped,
      remaining,
    });

    return NextResponse.json({
      done: false,
      remaining,
      lens,
      lensLabel: lensById(lens)?.label ?? lens,
      segmentLabel: pass.segment_label,
    });
  } catch (error) {
    console.error('[studio/review] advance failed', error);
    return NextResponse.json({ error: 'The reading could not continue just now' }, { status: 500 });
  }
}

/**
 * Is this pass one the plan marked reusable?
 *
 * The plan is written down at open time as rows; this asks whether a completed
 * pass in the superseded reading covered the same lens over text with the same
 * hash. Deriving it here rather than trusting a flag means a pass cannot be
 * carried because of a stale column.
 */
async function isReusable(reviewId: string, passId: string): Promise<boolean> {
  const res = await query<{ reusable: boolean }>(
    `SELECT EXISTS (
       SELECT 1
         FROM developmental_review_passes p
         JOIN developmental_reviews r ON r.id = p.review_id
         JOIN developmental_reviews cur ON cur.supersedes_review_id = r.id
         JOIN developmental_review_passes me ON me.id = $2
        WHERE cur.id = $1
          AND p.status = 'done'
          AND p.lens = me.lens
          AND p.segment_hash IS NOT NULL
          AND p.segment_hash = me.segment_hash
     ) AS reusable`,
    [reviewId, passId],
  );
  return res.rows[0]?.reusable === true;
}

/** What the previous reading found with this lens over text with this hash. */
async function readPriorFindings(
  priorReviewId: string,
  lens: string,
  segmentHash: string | null,
): Promise<PriorFinding[]> {
  if (!segmentHash) return [];
  const res = await query<{
    id: string;
    lens: string;
    title: string;
    observation: string;
    quotes: string[] | null;
  }>(
    `SELECT f.id, f.lens, f.title, f.observation,
            array_remove(array_agg(e.quote ORDER BY e.position), NULL) AS quotes
       FROM developmental_findings f
       LEFT JOIN developmental_finding_evidence e ON e.finding_id = f.id
      WHERE f.review_id = $1 AND f.lens = $2
      GROUP BY f.id, f.lens, f.title, f.observation`,
    [priorReviewId, lens],
  );
  return res.rows.map((r) => ({
    id: r.id,
    lens: r.lens,
    title: r.title,
    observation: r.observation,
    quotes: r.quotes ?? [],
  }));
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

/**
 * DE-02 — material MAIA is allowed to read.
 *
 * The join IS the permission. Only materials the writer DECLARED belong to
 * this Work appear here, because only living_work_materials rows are selected.
 * Gathering something into the Studio is not permission to treat it as context
 * for a Work — a writer's private notes sitting in Materials are not read by a
 * review of a book they never attached them to.
 *
 * Excerpts are bounded: this is context, not a corpus, and a lens given ten
 * transcripts in full would read them instead of the manuscript.
 */
async function readMaterials(workId: string): Promise<MaterialContext[]> {
  const res = await query<{
    material_type: string;
    relationship_sentence: string | null;
    label: string | null;
    kind: string | null;
    extracted_text: string | null;
  }>(
    `SELECT lwm.material_type, lwm.relationship_sentence,
            COALESCE(mm.title, sm.title) AS label,
            sm.kind,
            sm.extracted_text
       FROM living_work_materials lwm
       LEFT JOIN member_manuscripts mm
              ON lwm.material_type = 'manuscript' AND mm.id::text = lwm.material_id
       LEFT JOIN studio_materials sm
              ON lwm.material_type = 'studio_material' AND sm.id::text = lwm.material_id
      WHERE lwm.living_work_id = $1
      ORDER BY lwm.declared_at DESC`,
    [workId],
  );
  return res.rows.map((r) => ({
    kind: r.kind ?? r.material_type,
    label: r.label ?? 'an unnamed material',
    sentence: r.relationship_sentence,
    excerpt: materialExcerpt(r.extracted_text),
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
