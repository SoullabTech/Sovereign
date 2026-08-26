/**
 * DE-02 — reading again without reading everything again.
 *
 * A whole-Work review of a 200-page book is dozens of model passes. Re-running
 * all of them because one paragraph changed is both wasteful and, worse,
 * unstable: the same unchanged chapter re-read produces slightly different
 * words every time, so findings churn and a writer cannot tell what actually
 * moved. Incremental re-analysis exists as much for STABILITY as for cost.
 *
 * Pure. Every decision about what to re-read, what to carry forward, and how
 * one reading relates to the last is made here and tested here.
 *
 * -- The two rules that matter --------------------------------------------
 *
 *   1. REUSE IS MATCHED BY CONTENT, NEVER BY POSITION. Adding a paragraph to
 *      chapter 2 shifts every later segment's offsets and index. Matching on
 *      index would invalidate the whole book; matching on the segment's own
 *      text hash invalidates exactly chapter 2.
 *
 *   2. "NO LONGER OBSERVED" IS NOT "RESOLVED". A finding that does not
 *      reappear may have been addressed, may have moved, or may simply not
 *      have been noticed this time. Only the writer resolves a finding. This
 *      module never produces a disposition — it produces lineage, which is a
 *      fact about readings, not a judgement about the work.
 */

import { createHash } from 'crypto';
import { locateQuote, type LocatedQuote } from './lenses';

/** Identity of a stretch of text, independent of where it sits. */
export function segmentHash(text: string): string {
  // Whitespace-normalised: re-wrapping a paragraph is not a change worth
  // re-reading a chapter for, and would otherwise invalidate the whole book
  // every time an editor reflows.
  return createHash('sha256').update(text.replace(/\s+/g, ' ').trim(), 'utf8').digest('hex');
}

export interface PriorPass {
  /** Identity. Reuse binds to THIS, so findings never cross a segment. */
  id: string;
  lens: string;
  segmentLabel: string;
  segmentHash: string;
  status: string;
}

export interface PlannedSegment {
  label: string;
  start: number;
  end: number;
  text: string;
}

export interface PassPlan {
  lens: string;
  segmentIndex: number;
  segmentLabel: string;
  segmentHash: string;
  start: number;
  end: number;
  /** 'read' — send it to MAIA. 'reuse' — carry the prior pass's findings. */
  action: 'read' | 'reuse';
  /**
   * The exact prior pass this one continues, or null.
   *
   * Structural identity, not a query. Deriving "which prior pass covered
   * similar text" at carry time is how a Threads finding from chapter 9 ends
   * up attached to chapter 2: its quote still exists somewhere in the book, so
   * it re-locates and looks legitimate.
   *
   * Set for BOTH actions. On 'reuse' it is what gets carried; on 'read' it is
   * what the new findings are given lineage against — an edited chapter whose
   * prior pass was not named would report every finding as newly observed.
   */
  supersedesPassId: string | null;
}

export interface Plan {
  passes: PassPlan[];
  toRead: number;
  reused: number;
}

/**
 * What this reading actually has to do.
 *
 * A pass is REUSABLE when the same lens already read text with the same hash
 * and that pass finished — the text did not move, so re-reading would only
 * produce different words for the same observation. Everything else is read.
 *
 * Either way the prior pass over the same part is NAMED, because that link is
 * what lineage is computed against. A first review has no prior passes and
 * reads everything, which is the same code path.
 */
export function planPasses(
  lenses: readonly string[],
  segments: PlannedSegment[],
  prior: PriorPass[],
): Plan {
  // Each completed prior pass may be consumed by AT MOST ONE current pass.
  // A book that repeats a section verbatim has two segments with the same
  // hash; matching on "a pass with this hash exists" would carry the same
  // findings into both, and the duplicate would read as corroboration.
  const available = new Map<string, PriorPass[]>();
  for (const p of prior) {
    if (p.status !== 'done') continue;
    const list = available.get(p.lens) ?? [];
    list.push(p);
    available.set(p.lens, list);
  }

  const passes: PassPlan[] = [];
  for (const lens of lenses) {
    segments.forEach((segment, index) => {
      const hash = segmentHash(segment.text);
      const candidates = available.get(lens) ?? [];

      // Content is the principal match. An exact hash means the text did not
      // move, so the prior pass can be CARRIED rather than re-read.
      let at = candidates.findIndex(
        (c) => c.segmentHash === hash && c.segmentLabel === segment.label,
      );
      if (at === -1) at = candidates.findIndex((c) => c.segmentHash === hash);
      const reusable = at !== -1;

      // No hash match: the text changed. The prior pass over the SAME part is
      // still what this one continues — that link is what gives a re-read
      // finding its lineage. Without it every finding in an edited chapter
      // would read as newly observed, and a writer could not tell an old
      // observation restated from something MAIA had just noticed.
      if (at === -1) at = candidates.findIndex((c) => c.segmentLabel === segment.label);

      const matched = at === -1 ? null : candidates.splice(at, 1)[0];

      passes.push({
        lens,
        segmentIndex: index,
        segmentLabel: segment.label,
        segmentHash: hash,
        start: segment.start,
        end: segment.end,
        action: reusable ? 'reuse' : 'read',
        supersedesPassId: matched?.id ?? null,
      });
    });
  }

  return {
    passes,
    toRead: passes.filter((p) => p.action === 'read').length,
    reused: passes.filter((p) => p.action === 'reuse').length,
  };
}

// ---- carrying a finding across a reading -------------------------------

export interface PriorFinding {
  id: string;
  lens: string;
  title: string;
  observation: string;
  /** What MAIA said made her notice, when she did. Carried, never re-made. */
  why?: string | null;
  confidence?: 'high' | 'medium' | 'low';
  /** Its evidence as it was quoted in the earlier snapshot. */
  quotes: string[];
}

export type Lineage = 'newly_observed' | 'persists' | 'changed';

export interface CarriedFinding {
  priorId: string;
  lens: string;
  title: string;
  observation: string;
  /**
   * Carried verbatim. No model ran, so MAIA did not newly arrive at a
   * confidence or a reason — manufacturing either would be new metadata on an
   * unchanged observation.
   */
  why: string | null;
  confidence: 'high' | 'medium' | 'low';
  /** Re-located against the NEW snapshot. Never the old offsets. */
  evidence: LocatedQuote[];
}

export interface CarryResult {
  carried: CarriedFinding[];
  /**
   * Findings whose evidence could not be found in the new snapshot. NOT
   * resolved, NOT dismissed — only unlocatable. The writer's disposition on
   * them is untouched.
   */
  lost: { priorId: string; title: string; reason: string }[];
}

/**
 * Carry a reused pass's findings into the new reading.
 *
 * Offsets are never carried: text inserted earlier moves every later passage,
 * so each quote is re-located in the new snapshot. A finding whose quotes have
 * all vanished is not carried — but it is reported as lost rather than
 * silently dropped, because a finding that quietly disappears reads to a
 * writer like a finding that was addressed.
 */
export function carryFindings(prior: PriorFinding[], newContent: string): CarryResult {
  const carried: CarriedFinding[] = [];
  const lost: { priorId: string; title: string; reason: string }[] = [];

  for (const finding of prior) {
    const located: LocatedQuote[] = [];
    const seen = new Set<number>();
    for (const quote of finding.quotes) {
      const hit = locateQuote(newContent, quote);
      if (hit && !seen.has(hit.start)) {
        seen.add(hit.start);
        located.push(hit);
      }
    }
    if (located.length === 0) {
      lost.push({
        priorId: finding.id,
        title: finding.title,
        reason: 'its passages are no longer in the draft',
      });
      continue;
    }
    carried.push({
      priorId: finding.id,
      lens: finding.lens,
      title: finding.title,
      observation: finding.observation,
      why: finding.why ?? null,
      confidence: finding.confidence ?? 'medium',
      evidence: located.sort((a, b) => a.start - b.start),
    });
  }

  return { carried, lost };
}

// ---- lineage ------------------------------------------------------------

/** Same observation, said again? Compared on substance, not on punctuation. */
function normalizeClaim(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export interface LineageInput {
  lens: string;
  title: string;
  observation: string;
}

export interface LineageVerdict {
  lineage: Lineage;
  ancestorId: string | null;
}

/**
 * How this finding relates to the last reading.
 *
 * Matched within a lens by title, because a lens naming the same thing twice
 * is the same finding restated — and matching on evidence overlap alone would
 * merge two genuinely different observations that happen to quote the same
 * paragraph.
 *
 *   persists        the same thing said the same way
 *   changed         the same thing, said differently — the observation moved
 *   newly_observed  nothing in the last reading matches it
 *
 * None of these is a judgement about the Work. They are facts about readings.
 */
export function lineageOf(finding: LineageInput, prior: PriorFinding[]): LineageVerdict {
  const title = normalizeClaim(finding.title);
  const match = prior.find((p) => p.lens === finding.lens && normalizeClaim(p.title) === title);
  if (!match) return { lineage: 'newly_observed', ancestorId: null };
  return {
    lineage:
      normalizeClaim(match.observation) === normalizeClaim(finding.observation)
        ? 'persists'
        : 'changed',
    ancestorId: match.id,
  };
}

/**
 * Which of the previous reading's findings were not seen again.
 *
 * The caller must record these as NO LONGER OBSERVED and nothing else.
 * Turning this into "resolved" would have the system close the writer's open
 * questions on their behalf, which is exactly the authority MAIA does not
 * hold. A finding may vanish because it was addressed, because the passage
 * moved, or because this reading simply did not notice it.
 */
export function noLongerObserved(
  prior: PriorFinding[],
  observedNow: LineageInput[],
): PriorFinding[] {
  const seen = new Set(observedNow.map((f) => `${f.lens} ${normalizeClaim(f.title)}`));
  return prior.filter((p) => !seen.has(`${p.lens} ${normalizeClaim(p.title)}`));
}
