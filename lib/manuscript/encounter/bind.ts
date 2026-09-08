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
export function bindProposals(
  text: string,
  proposals: readonly ModelNoticeProposal[],
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
