/**
 * SITUATED-WORK-DEEP-01 — temporary execution containment.
 *
 * ── THE TRUTHFULNESS FAILURE THIS CLOSES ───────────────────────────────────
 *
 * A Writer's Studio conversation can visibly claim, in the member's sight:
 *
 *     In relation to <Work>
 *
 * while the router selects DEEP — whose prompt builder composes no addendum of
 * any kind. `buildComprehensiveVoicePrompt` has zero occurrences of "Addendum"
 * (ADDENDA_CHANNEL_DIVERGENCE_2026-05-24.md §II.B), so the very context the
 * interface says is present is silently dropped on exactly those turns.
 *
 * This is not a rare edge. The router (`lib/consciousness/processingProfiles`)
 * has no awareness of surface or Work — grep it for `surface|workContext|studio`
 * and nothing matches — and it reaches DEEP three independent ways:
 *
 *   · explicit invitation ("take me deeper", "shadow work"), from turn one;
 *   · >700 chars + process language + turn ≥ 5;
 *   · UP-REGULATION: fieldWorkSafe && textLength > 400 && CORE → DEEP.
 *
 * The third makes DEEP *likely* for precisely the intended member: a writer who
 * came from their Studio to talk about their book and wrote one substantial
 * paragraph. The feature's best case was its least truthful case.
 *
 * ── WHY CONTAINMENT AND NOT A FIX ──────────────────────────────────────────
 *
 * This is NOT the permanent solution and must not be mistaken for one. The
 * permanent solution is the addenda-channel divergence work: DEEP composing the
 * supported contextual addenda, which repairs studio, astrology and
 * conversational recall in the same stroke. That is a cross-system unit and it
 * is carried forward as its own platform finding — deliberately NOT smuggled
 * into a Writer's Studio cut.
 *
 * Until then the rule is narrow: a situated exchange may not enter a tier that
 * silently drops the context the interface says is present.
 *
 * ── WHAT THIS DELIBERATELY DOES NOT DO ─────────────────────────────────────
 *
 * It does not touch the router's heuristics, cap DEEP globally, or alter
 * cognitive-profile routing. Unsituated MAIA is bit-for-bit unchanged. And it
 * does not reuse `processingProfileOverride`: that field is observational — the
 * execution dispatch switches on the computed profile and the override is only
 * read later when the Corpus Callosum trace is written — so borrowing it as an
 * execution lever would break what it currently reports.
 *
 * ── AND IT NEVER PRETENDS THE ROUTER CHOSE CORE ────────────────────────────
 *
 * Both facts survive. A containment that overwrote the computed profile would
 * become invisible debt within a week, and telemetry would quietly start lying
 * about what the router actually wanted — which is the same class of failure
 * this whole unit exists to close, one layer down.
 */

export type ExecutionProfile = 'FAST' | 'CORE' | 'DEEP' | string;

/** The single machine-readable reason. Never a free-text string at a call site. */
export const SITUATED_DEEP_CONTAINMENT_REASON =
  'situated_work_addenda_not_composed_in_deep' as const;

export interface ProfileContainment {
  /** What the router actually chose. Never overwritten. */
  computed: ExecutionProfile;
  /** What will run. Differs from `computed` only under containment. */
  executed: ExecutionProfile;
  contained: boolean;
  reason?: typeof SITUATED_DEEP_CONTAINMENT_REASON;
}

/**
 * Decide what executes.
 *
 * `hasVerifiedSituatedWork` must be derived from the SERVER-BUILT addendum,
 * never from anything the client asserted. In the route, `workSituationAddendum`
 * is assigned after the `...meta` spread, so a client-supplied value is always
 * overwritten — and it is `undefined` whenever the Work failed to resolve
 * against the member's own row. A forged or foreign work id therefore cannot
 * reach this function as `true`, and cannot trigger containment.
 *
 * Only an exact DEEP is contained. Anything else — FAST, CORE, or a profile
 * this module does not know about (RCN, BETWEEN) — passes through untouched,
 * because silently reshaping an unfamiliar tier is how a narrow containment
 * becomes a broad one.
 */
export function containSituatedProfile(
  computed: ExecutionProfile,
  hasVerifiedSituatedWork: boolean,
): ProfileContainment {
  if (!hasVerifiedSituatedWork || computed !== 'DEEP') {
    return { computed, executed: computed, contained: false };
  }
  return {
    computed,
    executed: 'CORE',
    contained: true,
    reason: SITUATED_DEEP_CONTAINMENT_REASON,
  };
}

/** The observability shape. Both facts, always, plus why they differ. */
export function summarizeContainmentForLog(c: ProfileContainment): {
  computedProfile: ExecutionProfile;
  executedProfile: ExecutionProfile;
  contained: boolean;
  reason?: string;
} {
  return {
    computedProfile: c.computed,
    executedProfile: c.executed,
    contained: c.contained,
    ...(c.reason ? { reason: c.reason } : {}),
  };
}
