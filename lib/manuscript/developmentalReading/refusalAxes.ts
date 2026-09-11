/**
 * WS-DEVELOP-REFUSAL-TRUTH-OBS-01 · R3 — absence and unknown are different
 * statements, and both must survive the boundary.
 *
 *   cause ABSENT   no causal inquiry occurred. A capture or recover refusal
 *                  never reached a model response, so there is no completion
 *                  to report and no attribution to make.
 *   CAUSE_UNKNOWN  the question was live and went unanswered.
 *
 * The route defaulted the first into the second (`outcome.cause ?? CAUSE_UNKNOWN`),
 * which told a member "we do not know the cause" where the truth was "cause
 * determination never occurred" — and beneath a sentence that had already named
 * the cause, that read as a contradiction. Found in production 2026-09-11.
 *
 * ⛔ O-3 is untouched by this. It governs the EPISTEMIC unknown — assessed, or
 * assessable, and nothing learned — and still requires that such a cause be
 * named as unknown. It does not govern structural absence.
 *
 * Pure, and outside the route, so the boundary can be falsified without a
 * request, a database or a model.
 */
import type { RefusalCause } from '../developmentalReader/contract';

export interface WireAxes {
  completion?: RefusalCause['completion'];
  attribution?: RefusalCause['attribution'];
}

/**
 * What reaches the member's surface. Absent axes are OMITTED, never sent as
 * `unknown`: the client drops keys it did not receive, so absence arrives as
 * absence and the copy stays silent rather than inventing an unknown.
 */
export function axesForWire(cause: RefusalCause | null | undefined): WireAxes {
  if (!cause) return {};
  return { completion: cause.completion, attribution: cause.attribution };
}

export interface RecordAxes {
  completion: RefusalCause['completion'] | null;
  attribution: RefusalCause['attribution'] | null;
  stopReason: string | null;
  inputTokens: number | null;
  outputTokens: number | null;
  readerVersion: string | null;
  promptHash: string | null;
}

/**
 * What reaches the durable record. `null` here means the same as omission on
 * the wire — no inquiry — and is deliberately distinct from the string
 * `'unknown'`, so an operator reading a record months later can still tell
 * which question was never asked from which went unanswered (O-4).
 */
export function axesForRecord(cause: RefusalCause | null | undefined): RecordAxes {
  return {
    completion: cause?.completion ?? null,
    attribution: cause?.attribution ?? null,
    stopReason: cause?.stopReason ?? null,
    inputTokens: cause?.inputTokens ?? null,
    outputTokens: cause?.outputTokens ?? null,
    readerVersion: cause?.readerVersion ?? null,
    promptHash: cause?.promptHash ?? null,
  };
}
