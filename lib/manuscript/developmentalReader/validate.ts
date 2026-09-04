/**
 * BUILD-07B — DEVELOPMENTAL READER · the request validator.
 *
 * EVERYTHING HERE HAPPENS BEFORE THE SEAM. A request that fails is refused
 * with a typed reason and no model is called (contract F4, F5, F6, F1).
 *
 * THE INTEGRITY RULE (F1, F6). The only prose that may reach the model is
 * whole-section text recovered under the request's own frozen state. That is
 * proven here, not trusted: each recovered body must name a section the
 * frozen state holds, at BODY depth in the request's coverage, and must digest
 * — as the whole section — to the digest the state froze. One altered code
 * point is `recovered_integrity_failure`. And the set of recovered bodies must
 * be EXACTLY the set of body-depth sections: fewer would show the model less
 * than coverage claims; more would make coverage a lie.
 *
 * THE CEILING (F5). Summed in Unicode code points over the recovered text, and
 * refused WHOLE — nothing is trimmed, nothing is dropped to fit, no section is
 * quietly demoted to position depth.
 */

import { sha256 } from '../development/readState';
import {
  DEVELOPMENTAL_READ_CEILING_CODE_POINTS,
  isDevelopmentalLens,
  type DevelopmentalReaderRefusal,
  type DevelopmentalReaderRequest,
} from './contract';
import { codePointLength } from './render';

export type ValidationResult =
  | { ok: true; bodyCodePoints: number }
  | { ok: false; refusal: DevelopmentalReaderRefusal; detail: string; index: number | null };

const refuse = (
  refusal: DevelopmentalReaderRefusal, detail: string, index: number | null = null,
): ValidationResult => ({ ok: false, refusal, detail, index });

export function validateRequest(request: DevelopmentalReaderRequest): ValidationResult {
  if (!isDevelopmentalLens(request.commissionedLens)) {
    return refuse('invalid_lens',
      `commissionedLens must be exactly one canonical lens; got ${JSON.stringify(request.commissionedLens)}`);
  }
  const { readState, coverage } = request.evidence;

  const seen = new Set<string>();
  let total = 0;
  for (const [i, r] of request.recovered.entries()) {
    if (!r || r.kind !== 'text' || typeof r.text !== 'string' || typeof r.sectionId !== 'string') {
      return refuse('recovered_integrity_failure', `recovered[${i}] is not a Recovered text value`, i);
    }
    const state = readState.sections[r.sectionId];
    if (!state) {
      return refuse('recovered_not_in_read_state',
        `recovered[${i}] names section ${r.sectionId}, which the frozen state does not hold`, i);
    }
    if (coverage.sections[r.sectionId] !== 'body') {
      return refuse('recovered_not_body_coverage',
        `recovered[${i}] names section ${r.sectionId}, which this reading covers at position depth only`, i);
    }
    if (seen.has(r.sectionId)) {
      return refuse('recovered_integrity_failure', `recovered[${i}] repeats section ${r.sectionId}`, i);
    }
    seen.add(r.sectionId);
    const sectionLength = state.range.end - state.range.start;
    if (r.range.start !== 0 || r.range.end !== sectionLength) {
      return refuse('recovered_integrity_failure',
        `recovered[${i}] is a passage ${r.range.start}–${r.range.end} of section ${r.sectionId}; `
        + `only whole sections (0–${sectionLength}) may be supplied`, i);
    }
    if (sha256(r.text) !== state.digest) {
      return refuse('recovered_integrity_failure',
        `recovered[${i}] text for section ${r.sectionId} does not digest to what the frozen state recorded`, i);
    }
    total += codePointLength(r.text);
  }

  for (const [sid, depth] of Object.entries(coverage.sections)) {
    if (depth === 'body' && !seen.has(sid)) {
      return refuse('recovered_integrity_failure',
        `coverage records section ${sid} at body depth, but no recovered text for it was supplied`);
    }
  }

  if (total > DEVELOPMENTAL_READ_CEILING_CODE_POINTS) {
    return refuse('ceiling_exceeded',
      `${total} code points of recovered prose exceeds the ${DEVELOPMENTAL_READ_CEILING_CODE_POINTS} `
      + 'code-point ceiling; refused whole, nothing trimmed');
  }
  return { ok: true, bodyCodePoints: total };
}
