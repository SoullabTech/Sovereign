/**
 * WS2-ENCOUNTER-01 · E2-C — server-owned evidence binding.
 *
 * Founder amendment E2-C/A: **the model may point; it may not certify the
 * pointing.** This is the boundary that holds the Work, so this is the boundary
 * that computes the proof.
 *
 *   proposal (coordinates)  →  [ this file, with the captured text ]  →  anchor
 *
 * Two protections remain distinct downstream, and both matter:
 *
 *   binding        proves the proposed evidence ACTUALLY EXISTS in the Work
 *   anchorMatches  proves the resulting notice still names EXACTLY that evidence
 *
 * A span the model invented, mis-ranged, inverted or hallucinated past the end of
 * the Work does not bind, and its proposal is dropped rather than repaired.
 *
 * ── EXISTENCE IS NOT EXPOSURE (B2, founder review) ────────────────────────
 *
 * The first cut proved only that coordinates EXIST in the captured Work. That is
 * half the law. Each inference call sees ONE window, so a call answering window 2
 * could propose coordinates from window 1 — real bytes, genuinely in the Work,
 * that this cognition never saw — and a whole-manuscript binder would certify
 * them. The server would then be proving evidence for the WORK rather than
 * evidence for the CLAIM.
 *
 *   An anchor must prove both EXISTENCE and EXPOSURE.
 *
 * So binding takes the range actually shown to that call. Overlap is lawful
 * because overlap was genuinely shown; anything outside is not bindable by that
 * call, however real it is.
 */
import { createHash } from 'crypto';
import type { CandidateNotice, Anchor } from './contract';
import type { ModelNoticeProposal } from './parse';

const sha256 = (v: string) => createHash('sha256').update(v).digest('hex');

/**
 * Bind proposals against the exact captured text. Returns only what bound.
 *
 * `text` is the snapshot's own text — never re-read from the database, so a
 * draft that moved mid-Encounter cannot be silently bound against its new state.
 */
export interface VisibleRange {
  /** Inclusive start of what this inference call was actually shown. */
  readonly visibleStart: number;
  /** Exclusive end of what this inference call was actually shown. */
  readonly visibleEnd: number;
}

export function bindProposals(
  text: string,
  proposals: readonly ModelNoticeProposal[],
  visible: VisibleRange,
): CandidateNotice[] {
  const points = Array.from(text);
  const bound: CandidateNotice[] = [];

  for (const p of proposals) {
    const anchors: Anchor[] = [];
    let allBound = true;

    for (const s of p.spans) {
      if (!Number.isInteger(s.startCodePoint) || !Number.isInteger(s.endCodePoint)) { allBound = false; break; }
      if (s.startCodePoint < 0 || s.endCodePoint > points.length) { allBound = false; break; }
      if (s.endCodePoint <= s.startCodePoint) { allBound = false; break; }
      /* EXPOSURE: the model may point only within what it was actually shown. */
      if (s.startCodePoint < visible.visibleStart || s.endCodePoint > visible.visibleEnd) {
        allBound = false; break;
      }
      const slice = points.slice(s.startCodePoint, s.endCodePoint).join('');
      anchors.push({
        startCodePoint: s.startCodePoint,
        endCodePoint: s.endCodePoint,
        /* THE SERVER COMPUTES THIS. Nothing the model said reaches it. */
        spanDigest: sha256(slice),
      });
    }

    /* One unbindable span discards the whole proposal: an observation half of
       whose evidence does not exist is not a partially true observation. */
    if (!allBound || anchors.length === 0) continue;
    bound.push({ family: p.family, text: p.text, anchors });
  }

  return bound;
}
