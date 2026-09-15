/**
 * WS-EDITORIAL-RUNTIME-01 · THE SEAM THE FALSIFIERS BIND TO.
 *
 * ⭐⭐ THE ONE LAW THIS LANE EXISTS TO PRESERVE:
 *
 *     A semantic editorial act is DECLARED. It is never DERIVED FROM TEXT.
 *
 * Both halves, and they are the same law from two sides:
 *
 *   member   "Could you make this quieter?"  →  ⛔ NO Direction
 *            unless the member's act DECLARED `direction` at the time of the turn.
 *
 *   MAIA     "I might tighten this paragraph…" → ⛔ NO ProposalVersion
 *            unless the structured outcome DECLARED `reply_with_proposal`.
 *
 * ⛔ This file types OBSERVABLE OUTCOMES, never internal representation — the
 * same discipline the S3 transition contract was ruled under. No member of any
 * union here may be read as naming a column.
 */

export type MemberActKind = 'discourse' | 'direction';

export interface MemberAct {
  /** ⭐ DECLARED BY THE MEMBER, at the time of the turn. Never classified. */
  readonly act: MemberActKind;
  /** The member's own words, exactly as typed. */
  readonly text: string;
  /** ⛔ Absence stays null. The writer's silence is not a reference. */
  readonly refersTo: string | null;
}

export type MaiaOutcomeKind = 'reply_only' | 'reply_with_direction' | 'reply_with_proposal';

export interface MaiaOutcome {
  /** ⭐ DECLARED BY THE MODEL through the forced tool. Never scraped from prose. */
  readonly kind: MaiaOutcomeKind;
  readonly reply: string;
  readonly direction?: { readonly instruction: string; readonly refersTo: string | null };
  readonly proposal?: { readonly formulation: string; readonly rationale: string | null };
}

/**
 * ⭐⭐ THE PREDECESSOR MAIA WAS INVOKED AGAINST, captured BEFORE cognition.
 * ⛔ A runtime that reads the chain head AFTER cognition can rebase a
 * suggestion onto a formulation MAIA never saw. The invocation carries it so
 * that is unrepresentable rather than merely discouraged.
 */
export interface Invocation {
  readonly chainId: string;
  readonly threadId: string;
  readonly nextTurnIndex: number;
  readonly invokedAgainstVersionId: string | null;
}

export type DurableFact =
  | { readonly fact: 'member_turn'; readonly turnIndex: number; readonly body: string }
  | { readonly fact: 'member_direction'; readonly instruction: string; readonly refersTo: string | null }
  | { readonly fact: 'maia_turn'; readonly turnIndex: number; readonly body: string }
  | { readonly fact: 'maia_direction'; readonly instruction: string; readonly refersTo: string | null }
  | { readonly fact: 'proposal_version'; readonly formulation: string; readonly supersedes: string | null }
  | { readonly fact: 'binding'; readonly turnIndex: number; readonly to: 'direction' | 'version' };

/** ⛔ ALL OR NONE. A refusal lands nothing. */
export type ActResult =
  | { readonly ok: true; readonly durable: readonly DurableFact[] }
  | { readonly ok: false; readonly refusal: string };

export interface EditorialRuntime {
  readonly name: string;
  /** The member speaks. Their turn persists before cognition, atomically with any declared adjunct. */
  memberAct(act: MemberAct, inv: Invocation): ActResult;
  /** MAIA answers through the forced structured tool. */
  maiaAct(outcome: MaiaOutcome, inv: Invocation): ActResult;
  /**
   * ⭐ OBSERVATION. A later pass over what is already stored.
   * ⛔ It must mint nothing. A runtime that extracts Directions after the fact
   * decides that an utterance WAS a steering act — which is the system, not the
   * member, authoring it.
   */
  observe(stored: readonly DurableFact[]): readonly DurableFact[];
}
