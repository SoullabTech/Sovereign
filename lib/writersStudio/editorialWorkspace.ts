/**
 * W3 — THE ASSEMBLY LAWS, AS PURE FUNCTIONS.
 *
 * ⭐⭐ W3 is where this stops being architecture you can describe and becomes
 * something the writer can experience: the manuscript, MAIA's authored
 * alternatives and the writer's own counter-wording in one continuous encounter.
 *
 * Two decisions carry that, and both live here so the room and the witness
 * consume the same law rather than each holding a copy — ⛔ the mistake that let
 * a mutant survive 01A.2.
 */

/* ══════════════════════════════════════════════════════════════════════════
   LAW 1 · ⭐⭐ THE SUBJECT IS RESOLVED BY THE SERVER, NEVER BY THE URL.
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * ⭐⭐ W5-Z0 · THE EDITORIAL SUBJECT IS THE CHAIN. THE VERSION IS A FOCUS.
 *
 * ── ⚠️ WHAT W3 GOT RIGHT, AND WHAT W5 FALSIFIED ───────────────────────────
 *
 * W3 derived this subject in the browser, from the resolved `ProposalWorkTarget`
 * (`workspaceSubject(engine?.target)`), and that half was right and stays right:
 * the room must never mount because `?proposalChain=C&proposalVersion=V` EXISTS.
 * It mounts because the server RESOLVED that identity — including the 01A.1
 * Work-namespace binding — against the manuscript in front of the writer.
 *
 * ⛔ WHAT W3 GOT WRONG WAS DERIVING IT FROM THE **TARGET**. A target is the
 * projection of a CANDIDATE FORMULATION into the present Work. Making the
 * editorial relationship a function of it means:
 *
 *     no candidate wording  →  no target  →  no editorial relationship
 *
 * which is R6 one more layer up: *"MAIA noticed this and recommends changing
 * nothing"* becomes unrepresentable, because the only door into the room is a
 * proposed edit. W5's ontology proved an Insight belongs to a CHAIN, not to a
 * version, so the subject had to move down to the chain with it.
 *
 * ⭐ THE SUBJECT NOW ARRIVES ALREADY RESOLVED, IN THE WRITE-STATE RESPONSE —
 * which is strictly further from the URL than W3's derivation was, not nearer.
 * The room asks ONE question, `what editorial subject did the server resolve
 * for this Work?`, rather than `do I have a proposal target, OR do I happen to
 * hold a chain parameter?`. ⛔ Chain-only was NOT to be bolted on beside W3 as
 * a second mounting rule (founder, 2026-09-14).
 *
 * ── ⭐ THE SEPARATION THIS BUYS ────────────────────────────────────────────
 *
 *     editorialSubject   the identity of the editorial RELATIONSHIP
 *     target             the exact candidate FORMULATION + its projection
 *
 * `target` keeps everything that genuinely requires candidate wording — the
 * mark, the replacement comparison, orientation, and proposal-work authority —
 * and nothing else. ⛔ NO TARGET MEANS THERE IS NO CANDIDATE FORMULATION. It
 * does not mean there is no editorial relationship.
 *
 * ⚠️ `located` is deliberately NOT carried here. W3's subject exposed it and
 * the room never read it — marking and orientation both go through
 * `markableRange`/`roomOrientation`, which read the target. A field on the
 * MOUNT identity describing the MARK invites exactly the inference W3-7 forbids
 * (*losing the exact locus does not erase the editorial relationship*), so the
 * mount identity no longer carries it at all. The W3-7 obligation survives at
 * the seam that now decides it: an unlocated target still yields a subject.
 */
export interface EditorialWorkspaceSubject {
  readonly kind: 'chain';
  readonly chainId: string;
  /** ⛔ `null` means NO VERSION IS FOCUSED. It never means "the head". */
  readonly focusedVersionId: string | null;
}

/* ══════════════════════════════════════════════════════════════════════════
   LAW 2 · ⭐⭐ THE SCREEN AGREES WITH STORAGE, NOT WITH THE REQUEST.
   ══════════════════════════════════════════════════════════════════════════ */

export type AppendOutcome =
  | { readonly status: 'appended'; readonly versionId: string }
  | { readonly status: 'refused'; readonly reason: string };

/**
 * ⭐⭐ W3.1 · THESE ARE THE READS TO LAUNCH **DIRECTLY**, AND ON SUCCESS THERE
 * ARE NONE.
 *
 * ⚠️ FOUNDER REVIEW OF d08535278 — A REAL SUCCESS-PATH RACE. The first cut
 * launched both rereads itself and then refocused, in that order:
 *
 *     setLineageToken()   restarts lineage work for the OLD subject V3
 *     onWorkChanged()     refreshWriteState() — request A, OLD selector V3
 *     onFocusVersion(V4)  selector changes — request B, new subject V4
 *
 * The selector-driven effect cancels; `refreshWriteState()` does not. So B could
 * return first and correctly seat V4, and A could return later and call
 * `setWriteState(V3)` — the room silently falling back to V3 while the URL said
 * V4. Two valid reads from two valid moments, and no authority over which one
 * commits last. That is the defect class this programme keeps finding, and it
 * violates the W3 law directly: the new version identity becomes the new
 * editorial subject, and the screen agrees with durable storage.
 *
 * ⭐ THE REPAIR IS TO MAKE THE SUBJECT TRANSITION THE ONLY SUCCESS-PATH TRIGGER.
 * Refocusing to V4 changes the selector, and the existing governed effects then
 * re-read the Work and the lineage for V4 — with the cancellation semantics they
 * already have. One authoritative path, rather than a second ungoverned read
 * racing it.
 *
 *     201 → onFocusVersion(V4) → selector V4 → write-state reread → versionId
 *           prop V4 → lineage reread
 */
export interface AfterAppend {
  /** ⭐ The new SUBJECT identity on success; `null` leaves focus exactly where it was. */
  readonly refocusTo: string | null;
  /**
   * ⛔ A DIRECT write-state read. FALSE on success: the refocus causes it
   * through the governed path. Launching one here would be the race.
   */
  readonly rereadWriteState: boolean;
  /**
   * A direct lineage read. ⛔ FALSE on success — changing `versionId` already
   * causes the chain read. ⭐ TRUE on refusal, where the subject does NOT change
   * but the surrounding history may have, so the writer can SEE that the
   * exchange really moved. ⛔ Seeing new history is not consenting to a new
   * succession relationship.
   */
  readonly rereadLineage: boolean;
  /** ⛔ On refusal the composer keeps the predecessor the writer acted against. */
  readonly keepComposerTarget: boolean;
}

/**
 * ⛔⛔ THERE IS NO `insertVersion`, NO OPTIMISTIC PATCH, AND THERE MUST NEVER BE
 * ONE. The POST's 201 carries the new version, and only its IDENTITY is used —
 * as the next focus. The visible thread is then RE-READ from the durable record.
 *
 * Splicing the response into the thread would put on screen what the request
 * said should have happened, which is the one thing a record of authorship may
 * never be. The same discipline as `reread Work from Work`.
 *
 * ⛔ AND A REFUSAL RETARGETS NOTHING. `not_successor_of_head` means the writer's
 * predecessor is stale; answering it by moving them to the new head would make
 * MACHINE TIMING author the relationship — the exact defect the store's
 * `supersedes` contract exists to prevent, reappearing in the UI.
 */
export function afterAppend(outcome: AppendOutcome): AfterAppend {
  if (outcome.status === 'appended') {
    return {
      refocusTo: outcome.versionId,
      /* ⛔ NEITHER read is launched here. The subject transition is the only
         success-path trigger, and it is the one with cancellation. */
      rereadWriteState: false,
      rereadLineage: false,
      keepComposerTarget: false,
    };
  }
  return {
    refocusTo: null,
    rereadWriteState: false,
    rereadLineage: true,
    keepComposerTarget: true,
  };
}
