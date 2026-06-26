/**
 * Field Lab governance — the declared baton-pass.
 *
 * Executable form of the law in docs/canon/THE_GOVERNING_UNCERTAINTY.md:
 *   "Every governed phase is defined by exactly ONE principal uncertainty.
 *    Completing a phase is not 'more confidence' — it is the resolution of that
 *    uncertainty AND the explicit declaration of its successor."
 *
 * This is NOT a generic status field. It governs the relay: a room may not change
 * phase without declaring the uncertainty it is LEAVING, the uncertainty it is
 * ENTERING, and what prior evidence is allowed to carry forward. That declaration
 * is the governance act — it lives in version control so a baton-pass is reviewed
 * in a PR, not inferred after the fact.
 *
 * The registry is hand-authored: `admittedAt` / `declaredAt` are author-set dates
 * (the moment a steward declares the pass), never runtime values.
 */

/** Where a room sits in the relay. There is no distinct "gap" state: a room that
 *  resolves its admission uncertainty with no successor blocker ships straight
 *  through (admitted → graduated). Dwell IS the occupancy of the gap, and only
 *  exists when a named blocker holds the room before /maia. */
export type ExperimentTransitionState =
  | 'admitted' // on the Field Lab shelf; a contact-reducible principal uncertainty (U1) governs
  | 'dwelling' // U1 resolved; held before /maia on a NAMED blocker (a successor uncertainty governs)
  | 'graduated' // shipped to /maia; operational authority assumed
  | 'stopped'; // removed from the ecology — "some may be removed"

export type DwellBlockerType =
  | 'governance' // authorization not yet granted
  | 'operational' // an operational obligation (consent surface, safety) not yet satisfied
  | 'architectural'; // a dependency (e.g. a persistence layer) not yet present

/**
 * One declared baton-pass. Cannot be constructed without naming both uncertainties
 * and both sides of the carry-forward — the key rule, encoded as a type.
 *
 * Ruling (2026-06-25): every change to `current` is, by default, an admission-level
 * act. A mid-residence revision can retroactively distort what prior observations
 * were answerable to, so it is not a light editorial change. A future
 * `revisionClass: 'clerical' | 'substantive'` may exempt pure wording fixes (no
 * change in evidentiary target) from re-authorization — but until the authority gate
 * exists, do NOT add that field: the default must stay admission-level. NOT YET ENCODED.
 */
export interface GoverningTransition {
  /** The uncertainty being closed. */
  leaving: string;
  /** The uncertainty now admitted as principal. */
  entering: string;
  /** The state this pass moves the room into (the room's `transitionState` after it). */
  enteringState: ExperimentTransitionState;
  /** What prior evidence may travel, and what must be established afresh under `entering`. */
  evidenceCarry: {
    /** Prior evidence that remains valid under the entering uncertainty. */
    carries: string;
    /** Prior evidence that does NOT transfer; `entering` must prove it anew. */
    mustBeNewlyProven: string;
  };
  /** Why `leaving` is declared resolved/closed now. */
  basis: string;
  /** ISO date the baton-pass was declared (author-set, not runtime). */
  declaredAt: string;
}

/** The governing uncertainty of a Field Lab room, with the audit trail of its passes.
 *  `current` / `transitionState` are always the `entering` / `enteringState` of the
 *  last declared transition (or the admission values when none has been declared) —
 *  enforced by validateGoverningUncertainty so they cannot drift silently. */
export interface GoverningUncertainty {
  /** The single principal uncertainty governing this room right now. */
  current: string;
  /** Position in the relay. */
  transitionState: ExperimentTransitionState;
  /** ISO date the room was admitted to Field Lab with its first principal uncertainty. */
  admittedAt: string;
  /** REQUIRED iff transitionState === 'dwelling'. A dwell must name its blocker. */
  dwellBlocker?: { type: DwellBlockerType; description: string };
  /** Append-only log of declared baton-passes. Empty while the room still holds its
   *  admission uncertainty. A revision (re-admission) is just a transition whose
   *  enteringState stays 'admitted' — revision and graduation share one mechanism. */
  transitions: GoverningTransition[];
}

const isNonEmpty = (s: unknown): s is string =>
  typeof s === 'string' && s.trim().length > 0;

const isIsoDate = (s: unknown): boolean =>
  typeof s === 'string' && /^\d{4}-\d{2}-\d{2}/.test(s) && !Number.isNaN(Date.parse(s));

/**
 * Returns a list of governance violations for one room's governing uncertainty.
 * Empty array === valid. Each string is human-readable and slug-tagged.
 *
 * The invariants ARE the law:
 *   I1 singularity        — exactly one non-empty `current` uncertainty
 *   I2 declared-not-inferred — current/state equal the last declared pass (or admission)
 *   I3 typed dwell        — dwelling iff a named blocker; blocker illegal otherwise
 *   I4 carry-forward      — every pass declares leaving, entering, basis, carries, mustBeNewlyProven
 *   I5 real dates         — admittedAt / declaredAt are ISO dates
 *   I6 chronology         — declarations are non-decreasing and not before admission
 */
export function validateGoverningUncertainty(
  slug: string,
  gu: GoverningUncertainty,
): string[] {
  const v: string[] = [];
  const tag = (m: string) => `[${slug}] ${m}`;

  // I1 — singularity.
  if (!isNonEmpty(gu.current)) {
    v.push(tag('current principal uncertainty is empty — a governed room declares exactly one.'));
  }

  // I5 — admittedAt.
  if (!isIsoDate(gu.admittedAt)) {
    v.push(tag(`admittedAt is not an ISO date: ${JSON.stringify(gu.admittedAt)}`));
  }

  // I3 — typed dwell.
  if (gu.transitionState === 'dwelling') {
    if (!gu.dwellBlocker || !isNonEmpty(gu.dwellBlocker.description)) {
      v.push(tag('transitionState "dwelling" requires a dwellBlocker with a non-empty description — a dwell must name its blocker.'));
    }
  } else if (gu.dwellBlocker) {
    v.push(tag(`dwellBlocker is only legal while dwelling; transitionState is "${gu.transitionState}".`));
  }

  // I4 — every pass declares leaving, entering, basis, and BOTH sides of carry-forward.
  gu.transitions.forEach((t, i) => {
    const at = (m: string) => tag(`transitions[${i}] ${m}`);
    if (!isNonEmpty(t.leaving)) v.push(at('does not declare the uncertainty it is LEAVING.'));
    if (!isNonEmpty(t.entering)) v.push(at('does not declare the uncertainty it is ENTERING.'));
    if (!isNonEmpty(t.basis)) v.push(at('does not declare the BASIS for closing `leaving`.'));
    if (!t.evidenceCarry || !isNonEmpty(t.evidenceCarry.carries)) {
      v.push(at('does not declare what evidence CARRIES forward.'));
    }
    if (!t.evidenceCarry || !isNonEmpty(t.evidenceCarry.mustBeNewlyProven)) {
      v.push(at('does not declare what evidence MUST BE NEWLY PROVEN (cannot carry).'));
    }
    if (!isIsoDate(t.declaredAt)) v.push(at(`declaredAt is not an ISO date: ${JSON.stringify(t.declaredAt)}`));
  });

  // I2 — declared, not inferred: current/state must match the last declared pass.
  const last = gu.transitions[gu.transitions.length - 1];
  if (!last) {
    if (gu.transitionState !== 'admitted') {
      v.push(tag(`transitionState is "${gu.transitionState}" but no transition has been declared — a room with no baton-pass is still "admitted".`));
    }
  } else {
    if (gu.current !== last.entering) {
      v.push(tag('current uncertainty does not match the last declared transition\'s `entering` — current changed without a declared baton-pass.'));
    }
    if (gu.transitionState !== last.enteringState) {
      v.push(tag(`transitionState "${gu.transitionState}" does not match the last declared transition's enteringState "${last.enteringState}".`));
    }
  }

  // I6 — chronology.
  let prev = isIsoDate(gu.admittedAt) ? Date.parse(gu.admittedAt) : -Infinity;
  gu.transitions.forEach((t, i) => {
    if (isIsoDate(t.declaredAt)) {
      const cur = Date.parse(t.declaredAt);
      if (cur < prev) v.push(tag(`transitions[${i}] declaredAt is before a prior declaration or admittedAt.`));
      prev = cur;
    }
  });

  return v;
}
