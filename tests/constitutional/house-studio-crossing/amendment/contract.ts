/**
 * WS2-03B AMENDMENT — Explicit Work Choice Precedes Inference (founder ruling C, 2026-09-30).
 *
 * "A member's explicit Work selection is a first-class act of intent. It may
 *  resolve manuscript ambiguity only within the declared Work's actual
 *  associations. Explicit selection outranks inference. No selection is
 *  persisted merely because navigation occurred."
 *
 * Observable contract of "which Work is this manuscript?", now with an
 * optional explicit choice. Precedence, as built:
 *
 *   1. explicit choice   — only if that Work actually declares the manuscript
 *   2. declarations      — exactly one declaring Work
 *   3. inference         — ⛔ EMPTY BY LAW: WS2-03B never infers, and this
 *                          amendment does not open a place for it
 *   4. ask               — ambiguous; the member answers
 */

export interface CtxWork {
  readonly id: string;
  readonly expressions: readonly { readonly expressionType: string; readonly expressionId: string }[];
}

export type CtxPhase = 'loading' | 'ready' | 'unauthorized' | 'error';

export type CtxOutcome =
  | { readonly kind: 'unknown' }
  | { readonly kind: 'none' }
  | { readonly kind: 'work'; readonly work: CtxWork }
  | { readonly kind: 'ambiguous'; readonly works: readonly CtxWork[] };

export type CtxResolver = (
  phase: CtxPhase,
  works: readonly CtxWork[],
  manuscriptId: string | null,
  explicitWorkId?: string | null,
) => CtxOutcome;
