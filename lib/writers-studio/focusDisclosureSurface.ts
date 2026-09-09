/**
 * §3a — THE FOCUS DISCLOSURE SURFACE CONTRACT.
 *
 *   ⭐⭐ A scoped request may fail visibly. It may not succeed under a different
 *       scope without the writer knowing.
 *   ⭐⭐ Scope failure does not authorize scope substitution.
 *
 * Pure presentation logic: it maps a `BoundaryOutcome` (and, after a crossing,
 * the confirmation result) onto what the writer is told and what they may do.
 * ⛔ It calls nothing, sends nothing, and knows nothing about cognition.
 *
 * ⭐ THE RULE THAT ORGANIZES ALL OF IT:
 *
 *   **The surface may state only what the receipt outcome proves about THIS
 *   invocation and any prior one.**
 *
 * Not merely "pre-boundary vs post-boundary". Three of these states are failures
 * that look superficially identical and are epistemically different, and the one
 * that matters most — a prior attempt left unresolved — is the one where the
 * obvious copy ("nothing was sent") would be a lie.
 *
 * ⛔ Database vocabulary never reaches the writer: no `identity_mismatch`, no
 * `receipt_refused`, no ids, no refs, no mismatch values.
 */

import type { BoundaryOutcome } from '@/lib/disclosure/disclosureBoundary';

/** What the writer may do next. A closed vocabulary — each is a MEMBER ACT. */
export type FocusAction =
  /** Retry the same disclosure identity. Lawful only where nothing may have crossed. */
  | 'try_again'
  /** ⭐ Mint a NEW disclosure_id. The only lawful retry once a prior attempt is unresolved. */
  | 'start_new_focus_request'
  /** ⛔ Authorizes an ordinary-scope request. Never performed by the system. */
  | 'continue_without_focus';

/**
 * The epistemic ladder. Each rung is a different truth about what crossed.
 *
 *   DID NOT CROSS                      did_not_cross
 *   CURRENT DID NOT / PRIOR UNKNOWN    prior_unresolved
 *   CURRENT DID NOT / PRIOR CROSSED    prior_crossed
 *   CROSSED + CONFIRMED                crossed_accounted
 *   CROSSED + CONFIRMATION FAILED      crossed_unaccounted
 */
export type FocusDisclosureState =
  | 'did_not_cross'
  | 'prior_unresolved'
  | 'prior_crossed'
  | 'crossed_accounted'
  | 'crossed_unaccounted';

/** Internal only. ⛔ Never rendered — the writer is not shown our severity. */
export type DisclosureSeverity = 'none' | 'infrastructure' | 'governance_anomaly' | 'integrity_anomaly';

export interface FocusDisclosurePresentation {
  readonly state: FocusDisclosureState;
  /** Writer-facing copy. Contains no ids, no refs, no internal vocabulary. */
  readonly message: string | null;
  readonly actions: readonly FocusAction[];
  /** ⛔ Internal routing for logs and anomaly queries. Not for display. */
  readonly severity: DisclosureSeverity;
  /**
   * ⭐ Whether this state may truthfully say nothing from this Focus was sent.
   * The single predicate the copy is checked against, so a future edit that
   * introduces the lie is caught by a falsifier rather than by review.
   */
  readonly mayClaimNothingSent: boolean;
}

const COPY = {
  did_not_cross:
    "I couldn't bring this Focus into MAIA just now. Nothing from this Focus was sent.",
  did_not_cross_unsafe:
    "I couldn't safely bring this Focus into MAIA. Nothing from this Focus was sent in this attempt.",
  prior_unresolved:
    "I can't safely retry this Focus because the previous attempt is unresolved. I haven't sent it again.",
  prior_crossed:
    "This Focus was already sent to MAIA in the earlier request. I haven't sent it again.",
  crossed_unaccounted:
    "MAIA received this Focus, but I couldn't complete the disclosure record for this request.",
} as const;

/**
 * Before the crossing: what the boundary outcome permits the surface to say.
 *
 * ⛔ NO BRANCH HERE INVOKES ANYTHING. Every failure returns a presentation, and
 * `continue_without_focus` is offered as an ACTION the writer must take — the
 * system never performs it. *Scope failure does not authorize scope substitution.*
 */
export function presentBoundaryOutcome(outcome: BoundaryOutcome): FocusDisclosurePresentation {
  if (outcome.kind === 'may_cross') {
    // Nothing to say yet: the crossing has not happened. The surface speaks
    // again only after confirmation, via presentCrossing().
    return {
      state: 'crossed_accounted', message: null, actions: [],
      severity: 'none', mayClaimNothingSent: false,
    };
  }

  if (outcome.kind === 'consent_unavailable') {
    // The precondition failed before any Work context was assembled. This is the
    // one case where the surface holds a structural fact the database cannot:
    // cognition was never called, so nothing from this Focus was sent.
    return {
      state: 'did_not_cross', message: COPY.did_not_cross,
      actions: ['try_again', 'continue_without_focus'],
      severity: 'infrastructure', mayClaimNothingSent: true,
    };
  }

  const mint = outcome.outcome;
  switch (mint.kind) {
    case 'unavailable':
      return {
        state: 'did_not_cross', message: COPY.did_not_cross_unsafe,
        actions: ['try_again', 'continue_without_focus'],
        severity: 'infrastructure', mayClaimNothingSent: true,
      };

    case 'identity_mismatch':
      // Same writer-facing truth, materially different internally: an id in use
      // describing a different disclosure is a governance anomaly, not weather.
      // ⛔ The differing FIELDS are logged by the store; nothing reaches the copy.
      return {
        state: 'did_not_cross', message: COPY.did_not_cross_unsafe,
        actions: ['try_again', 'continue_without_focus'],
        severity: 'governance_anomaly', mayClaimNothingSent: true,
      };

    case 'existing':
      if (mint.state === 'attempted') {
        // ⭐⭐ THE SUBTLE ONE. The current invocation sent nothing — but a prior
        // one MAY HAVE CROSSED and was never confirmed. "Nothing was sent" would
        // be a claim about the prior attempt that no evidence supports.
        // ⛔ `try_again` is withheld deliberately: replaying the same disclosure
        // identity is exactly what the substrate refuses to treat as fresh
        // authority. *An unresolved prior crossing may be retried as a NEW act;
        // it may not be replayed as though nothing happened.*
        return {
          state: 'prior_unresolved', message: COPY.prior_unresolved,
          actions: ['start_new_focus_request', 'continue_without_focus'],
          severity: 'governance_anomaly', mayClaimNothingSent: false,
        };
      }
      // The earlier disclosure definitely happened. The surface says so and
      // ⛔ infers nothing further: the receipt proves the context crossed, never
      // which answer the writer is looking at or whether a response completed.
      return {
        state: 'prior_crossed', message: COPY.prior_crossed,
        actions: ['start_new_focus_request', 'continue_without_focus'],
        severity: 'none', mayClaimNothingSent: false,
      };
  }
}

/**
 * After the crossing: the two post-boundary truths.
 *
 * ⛔ Neither may say nothing was sent — it was. A confirmation failure is OUR
 * integrity problem, not the writer's mistake, and the answer must not
 * masquerade as fully accounted for.
 */
export function presentCrossing(confirmed: boolean): FocusDisclosurePresentation {
  return confirmed
    ? { state: 'crossed_accounted', message: null, actions: [], severity: 'none', mayClaimNothingSent: false }
    : {
        state: 'crossed_unaccounted', message: COPY.crossed_unaccounted, actions: [],
        severity: 'integrity_anomaly', mayClaimNothingSent: false,
      };
}

/** ⭐ The only outcome that permits the eventual cognition call. */
export const permitsCognition = (o: BoundaryOutcome): boolean => o.kind === 'may_cross';

/**
 * ⛔ An ordinary-scope request is authorized ONLY by an explicit member act.
 *
 * The system may never derive it from a failed Focus request. Carrying the
 * writer's original message forward is their choice, not an inference.
 */
export function authorizeOrdinaryScope(act: FocusAction | null): boolean {
  return act === 'continue_without_focus';
}

/** Exposed so falsifiers can scan every string the writer can ever see. */
export const WRITER_FACING_COPY = Object.values(COPY);
