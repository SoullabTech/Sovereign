/**
 * WS2-02 — what MAIA may hand the writer, and what she may never hand them.
 *
 * ── The distinction this file exists to hold ───────────────────────────────
 *
 * MAIA is not another content owner in the Studio. She does not hold a region
 * of the member's material; she speaks about material the member holds. The
 * failure mode is not that she says something wrong — it is that she says
 * something evaluative in a shape that reads as measurement.
 *
 * A number carries authority a sentence does not. "Your pacing drags in the
 * middle" is a reading the writer can disagree with. "Pacing: 62/100" is a
 * verdict wearing the clothes of a fact, and a writer who sees it enough times
 * starts writing for the number. That is the displacement this Studio exists
 * to refuse: the member's judgement about their own work must stay the
 * authority, and MAIA's reading must stay legible AS a reading.
 *
 * ── The rule, stated exactly ───────────────────────────────────────────────
 *
 *   Writer-declared goal progress MAY be quantified.
 *     The writer said "90,000 words". Counting toward a target the writer set
 *     is arithmetic on the writer's own declaration. It measures the work
 *     against the writer's intent, and the writer owns both ends.
 *
 *   MAIA-generated evaluative judgement MUST NOT be quantified.
 *     No score, no rating, no percentage, no grade, no index, no "strength"
 *     out of anything — as something the writer is shown.
 *
 *     This is a rule about what CROSSES to the member, not about what the
 *     system may compute. MAIA may hold an internal sense of how sure a
 *     reading is and may use it to decide what is worth surfacing at all;
 *     that is how a system avoids reporting everything it notices. What it
 *     may not do is hand the writer that figure, or any figure, as a
 *     measurement of their work. An earlier draft of this file forbade even
 *     an internal sorter, which contradicted the rule below and would have
 *     outlawed epistemic metadata that already exists and already means
 *     something else.
 *
 * An insight may carry its TYPE (what kind of noticing this is), its EVIDENCE
 * COUNT (how many places in the work prompted it), and LINKS to the passages
 * and suggestions it refers to. Evidence count is not a score: it is a count
 * of citations the member can open and check, and it says nothing about
 * whether the work is good. The moment it is used to rank quality rather than
 * to show reach, it has become the thing this file forbids.
 *
 * ── Why executable ─────────────────────────────────────────────────────────
 *
 * A rule that lives only in a document is kept by whoever remembers it. This
 * one is easy to break by accident and invisible once broken — a `confidence`
 * field added for internal sorting is one render away from being shown. So the
 * type refuses the shape, and assertNoMemberFacingScore refuses it again at
 * runtime for anything crossing a boundary the types do not cover. Both act at
 * the member-facing boundary; neither is a repository-wide lint.
 */

/** What kind of noticing an insight is. Never a grade. */
export type MaiaInsightType =
  | 'pattern'
  | 'repetition'
  | 'absence'
  | 'tension'
  | 'connection';

/**
 * A passage the insight actually points at. An insight with no reachable
 * evidence is an opinion presented as a finding, so the link is not optional.
 */
export interface MaiaEvidenceLink {
  /** The expression/manuscript this passage lives in. */
  expressionId: string;
  /** Where in it. Opaque to this module — the room that owns the text resolves it. */
  anchor: string;
  /** The writer's own words, quoted back so the member can check the reading. */
  excerpt: string;
}

/**
 * Something MAIA offers the writer about their work.
 *
 * Note what is absent and must stay absent: score, rating, confidence,
 * strength, severity, priority, quality, grade, percentile. If a future slice
 * needs to order insights, order them by recency or by the member's own
 * attention — never by a number MAIA assigned to the work's merit.
 */
export interface MaiaInsight {
  id: string;
  type: MaiaInsightType;
  /** The reading itself, in language, where the writer can disagree with it. */
  reading: string;
  /**
   * The passages that prompted this. `evidence.length` is the evidence count —
   * derived, never stored as a standalone figure, so it cannot drift away from
   * the citations it claims to summarise and become a bare number.
   */
  evidence: MaiaEvidenceLink[];
  /** Suggestions this insight leads to, if any. Suggestions remain suggestions. */
  suggestionIds?: string[];
}

/**
 * Progress against a target the WRITER declared. Quantified, legitimately.
 *
 * `declaredBy` and `declaredAt` are required for the same reason they are
 * required on a living-work expression: the number is only permitted because a
 * member authored the intent behind it. A goal with no declarer is a goal the
 * system set, and the system may not set goals for a writer.
 */
export interface WriterDeclaredGoal {
  id: string;
  label: string;
  target: number;
  current: number;
  unit: 'words' | 'chapters' | 'scenes' | 'sessions';
  declaredBy: string;
  declaredAt: string;
}

/**
 * ── WHERE THIS GUARD APPLIES, AND WHERE IT MUST NOT ───────────────────────
 *
 * At the **member-facing offering boundary** only: the moment something MAIA
 * produced is about to be presented to the writer as a statement about their
 * work.
 *
 * It is NOT a repository-wide ban on the word `confidence`. The substrate
 * already carries legitimate internal epistemic metadata under that name —
 * `lib/journal/chartIntegrationService.ts` persists a `confidence` column on
 * pattern findings, and `lib/consciousness/*` reasons over
 * `insight.confidence` to decide what is worth surfacing at all. That number
 * means *how sure this reading is*, which is a claim about the reading. It is
 * not a claim about the quality of the writing, and it has every right to
 * exist internally. A system that cannot represent its own uncertainty is
 * worse, not better — and outlawing it would have pushed the same reasoning
 * into an unnamed field where nothing could see it.
 *
 * The rule is about **authority presented to the writer**, not about what the
 * system may know. So: reason with confidence internally; do not hand the
 * writer a number that rates their work — including a bare confidence figure,
 * which at the boundary reads as measurement whatever it meant upstream.
 *
 * Practically: call this on what is crossing to the member. Do not call it on
 * a service's internal finding, and do not import it as a lint.
 */

/** Field names that turn a reading into a verdict at the member boundary. */
const SCORE_SHAPED_KEYS = [
  'score',
  'rating',
  'confidence',
  'strength',
  'severity',
  'priority',
  'quality',
  'grade',
  'percentile',
  'rank',
  'weight',
] as const;

/**
 * Refuse a numeric evaluative field on something about to be shown to the writer.
 *
 * Applied at boundaries the compiler cannot see — an API response body, a row
 * widened by a migration, an object mapped from a service that grew a field.
 * The types above state the rule for code that is typed; this catches what
 * arrives as `unknown`.
 *
 * Named for its boundary on purpose. The former name, `assertNoMachineScore`,
 * read like a global prohibition and invited exactly the over-application the
 * doc above refuses.
 *
 * Non-numeric values are left alone: a `priority` of 'later' is a member's
 * ordering of their own work, not a machine-authored measurement of it.
 */
export function assertNoMemberFacingScore(
  offering: unknown,
  context = 'MAIA offering',
): void {
  if (offering === null || typeof offering !== 'object') return;

  for (const [key, value] of Object.entries(offering as Record<string, unknown>)) {
    const looksScored = SCORE_SHAPED_KEYS.some((k) => key.toLowerCase().includes(k));
    if (looksScored && typeof value === 'number') {
      throw new Error(
        `${context}: "${key}" is a machine-authored score crossing to the writer. ` +
          `MAIA may offer a reading with its type, evidence and links — never a number ` +
          `rating the member's work. Only writer-declared goal progress may be ` +
          `quantified. Internal epistemic metadata is legitimate; it just may not be ` +
          `presented as a figure to the member.`,
      );
    }
  }
}

/**
 * The evidence count, derived at the point of use.
 *
 * Exported so no caller invents its own — and so the one honest number an
 * insight carries always means "citations you can open", never "how strong
 * this finding is".
 */
export function evidenceCount(insight: MaiaInsight): number {
  return insight.evidence.length;
}

/**
 * Goal progress as a fraction. Permitted: both ends are the writer's.
 *
 * Clamped at 1 so passing a target reads as done rather than as 130% of a
 * quota — the goal was the writer's marker, not a productivity ceiling.
 */
export function goalProgress(goal: WriterDeclaredGoal): number {
  if (goal.target <= 0) return 0;
  return Math.min(1, goal.current / goal.target);
}
