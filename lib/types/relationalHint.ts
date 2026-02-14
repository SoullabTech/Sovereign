/**
 * RelationalHint — the dance policy object.
 *
 * Decides how MAIA holds space: how much containment, how much agency return,
 * how terse, and what structural guidance tags downstream layers should obey.
 *
 * This is structure, not content. It tells the system HOW to relate,
 * not WHAT to say. Content remains the oracle's domain.
 *
 * Sovereignty Invariant alignment:
 *   - Invariant 2 (Spiral of Risk): holdLevel tracks containment
 *   - Invariant 4 (Sacred Mirror): returnPowerLevel enforces agency return
 *   - Invariant 6 (Diminishing Centrality): brevityLevel + RELEASE stance
 */

export type RelationalStance =
  | 'HOLD'
  | 'MIRROR'
  | 'CHALLENGE'
  | 'RELEASE'
  | 'SEASONAL_RETURN';

export type RelationalHint = {
  stance: RelationalStance;

  // 0..1 — how much "holding / containment" to apply (not emotion, just structure)
  holdLevel: number;

  // 0..1 — how strongly to "return authorship" explicitly
  returnPowerLevel: number;

  // 0..1 — how terse MAIA should be (higher = shorter)
  brevityLevel: number;

  // used for logging + future audits, not for "profiling"
  signals: {
    dysregulation?: boolean;
    dependencyPull?: boolean;
    boundaryNeeded?: boolean;
    competence?: boolean;
    seasonalReturn?: boolean;
  };

  // short tags the downstream layers can use without changing meaning
  guidanceTags: Array<
    | 'co_regulate'
    | 'reflect_back'
    | 'return_authorship'
    | 'offer_next_step'
    | 'set_boundary'
    | 'invite_support_network'
    | 'diminish_centrality'
    | 'welcome_back'
  >;
};
