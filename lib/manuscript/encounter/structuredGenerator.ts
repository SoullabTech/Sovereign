/**
 * WS2-ENCOUNTER-01 · E2-C — the cognition binding.
 *
 * Founder ruling 2026-09-08. Encounter reuses the AIN structured-inference seam
 * for TRANSPORT, PROVIDER EXECUTION, INFERENCE-MODE AUTHORITY and REFUSAL — and
 * inherits none of DEVELOP's epistemology, which lives above that seam in the
 * developmental renderer, not inside it.
 *
 *   window → renderWindowRequest → runStructured → parseNoticeBlocks
 *          → bindProposals (the SERVER locates the evidence and computes the
 *            digest; the model supplied only verbatim excerpts) → CandidateNotice[]
 *          → screenCandidate (E2, unchanged) → MaiaNotice
 *
 * ── SOVEREIGNTY OUTRANKS ENCOUNTER AVAILABILITY ───────────────────────────
 *
 * Under `sovereign` / `local_only` the seam refuses, and this reports that
 * refusal. There is no quiet exception and no plain-text substitute: a model
 * that cannot honour the structured contract would be a DIFFERENT COGNITIVE ACT,
 * and letting it answer would make the Encounter a record of something that did
 * not happen. A sovereign deployment gets an honest refusal until a local
 * structured provider exists.
 *
 * ── COGNITION FAILURE IS NOT SILENCE (C7) ─────────────────────────────────
 *
 *   considered the Work, nothing lawful to say → notices: []      (success)
 *   unavailable · timeout · malformed · partial → cognition_unavailable
 *
 * Infrastructure silence is not contemplative silence, so this throws a typed
 * failure rather than returning an empty array on any incomplete path.
 *
 * ── NO RETRY (C5, strengthened) ───────────────────────────────────────────
 *
 * The call plan is fixed before any inference runs: exactly one call per
 * traversal window. Rejection — by the parser, by binding, or by the vocabulary
 * screen downstream — never causes another attempt. Many calls because there are
 * many windows; never an extra call because MAIA failed to produce something
 * sayable. A retry loop would be intervention pressure arriving from inside
 * cognition.
 *
 * ── NO SYNTHESIS PASS ─────────────────────────────────────────────────────
 *
 * Window-local cognition may miss a distant recurrence. Missing a possible
 * notice is lawful; inventing an unconstituted synthesis stage to manufacture
 * cross-window observations is not.
 */
import { runStructured } from '@/lib/ai/structured/router';
import { bindProposals } from './bind';
import { parseNoticeBlocks } from './parse';
import { renderWindowRequest } from './render';
import type { NoticeGenerator } from './read';
import type { CandidateNotice } from './contract';

export class CognitionUnavailable extends Error {
  constructor(readonly detail: string) {
    super(`[encounter] cognition did not complete: ${detail}`);
    this.name = 'CognitionUnavailable';
  }
}

export interface CognitionCounters {
  /** Calls the plan authorized, fixed before any inference ran. */
  planned: number;
  /** Calls actually made. `actual > planned` is a retry, and a retry is unlawful. */
  actual: number;
}

/**
 * The production cognition path (B1). The text arrives from the act itself —
 * the same captured text the traversal was made from — so nothing here re-reads
 * the draft or takes a second snapshot.
 */
export function structuredGenerator(
  counters: CognitionCounters = { planned: 0, actual: 0 },
): NoticeGenerator {
  return async ({ snapshot, windows, text }) => {
    /* The plan is fixed here, before anything runs. */
    counters.planned = windows.length;
    counters.actual = 0;

    const candidates: CandidateNotice[] = [];

    for (const w of windows) {
      counters.actual += 1;
      const outcome = await runStructured(renderWindowRequest(snapshot, w));

      /* Every non-completion is a refusal, including a sovereign-mode refusal —
         which is a lawful platform decision, not an Encounter defect, and still
         must never be reported to the writer as MAIA having found nothing. */
      if (!outcome.ok) throw new CognitionUnavailable(`${outcome.refusal}: ${outcome.detail ?? ''}`);

      const parsed = parseNoticeBlocks(outcome.result.content);
      if (!parsed.ok) throw new CognitionUnavailable(parsed.reason);

      /* C6: this window is now accounted for by a COMPLETED call. A window that
         threw above never reaches here, so a partially processed Work cannot
         return the notices it managed to collect. */
      /* B2: bound against what THIS call was actually shown, not the whole Work.
         Overlap is lawful because overlap was genuinely shown. An excerpt that
         exists elsewhere in the Work but was not shown here is not found, and an
         excerpt that is not unique here does not bind at all — the server
         establishes an exact correspondence, never an intended one. */
      candidates.push(...bindProposals(text, parsed.proposals, {
        visibleStart: w.contextStartCodePoint,
        visibleEnd: w.endCodePoint,
      }));
    }

    return candidates;
  };
}
