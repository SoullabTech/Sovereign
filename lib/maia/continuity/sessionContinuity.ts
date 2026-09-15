/**
 * AIN-CONTEXT-01 · A6 — SESSION CONTINUITY FACTS
 *
 * Authority: founder ruling 2026-09-15, "AIN-CONTEXT-01 · A6 — Post-F1a Founder Ruling"
 * Evidence:  docs/programme/AIN-CONTEXT-01_A6_F1a_WITNESS_2026-09-15.md (F1a RED)
 *
 * PURPOSE (R7). A6 does not make MAIA remember more. It makes MAIA truthful about
 * where she stands, what she presently has, and what she knows is not presently
 * before her.
 *
 * ⛔ THIS MODULE ADDS NO MEMORY, NO RETRIEVAL AND NO INFERENCE. It is pure: it takes
 *    two counts and returns three, plus the sentence that states them.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * R2 · THE UNIT CONTRACT — pinned here, once, for all three quantities.
 *
 *   UNIT                 completed exchange — one member utterance together with
 *                        MAIA's reply to it.
 *
 *   CURRENT REQUEST      EXCLUDED from all three counts. At the moment cognition is
 *                        assembled the member's utterance is durable but MAIA has not
 *                        replied, so the current exchange is not complete. It is named
 *                        in the block as the turn being served, never counted.
 *
 *   PROVENANCE           depth and represented are produced by the SAME pairing
 *                        operation over the SAME read (sessionManager's
 *                        getSessionContinuityWindow). `absent` is their difference.
 *
 *                        ⭐ This is why no unlike-unit subtraction is possible here:
 *                        there is no conversion step to get wrong. `turn_count`
 *                        counts served REQUESTS and is deliberately NOT used — mixing
 *                        it with exchange counts is exactly the arithmetic R2 forbids.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * R1 · `represented` is the FINAL cognitive aperture, not the server read. Material
 * loaded and then discarded by a later narrowing stage is as absent from cognition as
 * material never loaded. Callers pass what actually survives into the prompt.
 *
 * R3 · Material the durable record proves exists but that is not represented is
 * ABSENT. ⛔ It is never UNCERTAIN — UNCERTAIN is reserved for cases where continuity
 * itself cannot be established, which is not this case: we counted it.
 *
 * R5 · This module widens nothing. It does not change what is read, selected, or
 * rendered. It states the consequence of the existing narrowing truthfully.
 */

export const CONTINUITY_UNIT = 'completed exchanges' as const;

export interface SessionContinuityFacts {
  /** R2: the pinned unit, carried with the numbers so it cannot drift. */
  readonly unit: typeof CONTINUITY_UNIT;
  /** R2: false — the in-flight exchange is incomplete and is never counted. */
  readonly currentRequestIncluded: false;
  /** Authoritative: completed exchanges durably recorded for THIS session. */
  readonly depth: number;
  /** R1: completed exchanges surviving every narrowing stage into cognition. */
  readonly represented: number;
  /** R3: depth − represented. Exists durably, not present in this aperture. */
  readonly absent: number;
}

export function deriveSessionContinuity(input: {
  durableCompletedExchanges: number;
  representedExchanges: number;
}): SessionContinuityFacts {
  const depth = Math.max(0, Math.trunc(input.durableCompletedExchanges));
  // A caller cannot represent more than exists; clamping keeps `absent` non-negative
  // without ever silently inflating `depth`.
  const represented = Math.min(depth, Math.max(0, Math.trunc(input.representedExchanges)));
  return {
    unit: CONTINUITY_UNIT,
    currentRequestIncluded: false,
    depth,
    represented,
    absent: depth - represented,
  };
}

/**
 * The prompt block.
 *
 * R6 · SHALLOW CASE: when nothing is omitted the block states that plainly and makes
 * NO absence claim. A session that fits inside the aperture must never be told that
 * history is missing.
 *
 * R6 · LONG CASE: the omitted count is stated, and stated as ABSENT FROM THIS
 * APERTURE rather than absent from the record. ⛔ Nothing here may imply the omitted
 * material never existed — that is the collapse of R1's first and second epistemic
 * conditions, and it is the whole reason A6 exists.
 *
 * Returns '' when there is no session history at all: with depth 0 there is no
 * continuity fact to state, and an empty block is not an absence claim.
 */
export function formatSessionContinuityForPrompt(facts: SessionContinuityFacts): string {
  if (facts.depth <= 0) return '';

  const head =
    `SESSION CONTINUITY (facts about this conversation, not inference about the member)\n` +
    `Unit: ${facts.unit} — one message from the member together with your reply to it. ` +
    `The message you are answering now is not counted; its exchange is not yet complete.\n` +
    `This conversation holds ${facts.depth} ${facts.unit} on record.`;

  if (facts.absent === 0) {
    return (
      `${head}\n` +
      `All ${facts.represented} of them are present in your working context below.\n` +
      `Nothing from this conversation is missing from your view right now.`
    );
  }

  // The FACTS and the GUIDANCE are separated, and the guidance line carries a stable
  // `Guidance:` prefix. Two reasons, both load-bearing:
  //   1. the block is titled "facts, not inference" — the imperative should be visibly
  //      distinct from the counts it accompanies;
  //   2. ⭐ the guidance sentence must NAME the inference it forbids ("did not happen"),
  //      and any instrument scanning this prompt for that claim would otherwise match
  //      the prohibition as though it were the claim. That is the C21 false positive
  //      already ratified in this repository: a prose ban must never read as the banned
  //      behaviour returning. The prefix lets a scanner exclude the ban structurally
  //      rather than by guessing at wording.
  return (
    `${head}\n` +
    `${facts.represented} of them are present in your working context below.\n` +
    `${facts.absent} ${facts.unit} of THIS SAME conversation are on record and are NOT present here.\n` +
    `They are absent from your present view, not absent from what happened.\n` +
    `Guidance: if the member refers to something from this conversation that you cannot ` +
    `find above, say plainly that you do not have that part in front of you and ask them ` +
    `to ground it — do not treat its absence as evidence that it did not happen, and do ` +
    `not reconstruct it.`
  );
}
