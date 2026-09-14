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

import type { ProposalWorkTarget } from './writeStateClient';

/* ══════════════════════════════════════════════════════════════════════════
   LAW 1 · ⭐⭐ THE SUBJECT COMES FROM THE RESOLVED TARGET, NEVER FROM THE URL.
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * ⛔ THE WORKSPACE DOES NOT MOUNT BECAUSE `?proposalChain=C&proposalVersion=V`
 * EXISTS. It mounts because the write-state server RESOLVED that identity into
 * the current Work — which is the whole of what three cutover acts bought:
 *
 *     URL selector → write-state resolution → engine.target → workspace
 *
 * ⛔ A workspace that read the raw query parameters would let the wrong-Work
 * namespace defect reappear one layer above the mount, where 01A.1's binding
 * cannot see it.
 */
export type WorkspaceSubject =
  | {
      readonly kind: 'chain';
      readonly chainId: string;
      readonly versionId: string;
      /**
       * ⭐ Whether the exact place is provable in the Work AS IT IS NOW.
       * ⛔ It gates the MARK, never the mount:
       *     losing the exact locus does not erase the editorial relationship.
       */
      readonly located: boolean;
    }
  /** The staged old path, unchanged, until W7 retires it. */
  | { readonly kind: 'legacy' }
  | null;

export function workspaceSubject(
  target: ProposalWorkTarget | null | undefined,
): WorkspaceSubject {
  if (!target) return null;
  /* The chain target is the one carrying a `location`; the legacy target is
     the one carrying a bare `range`. ⛔ No translation between them. */
  if (!('location' in target)) return { kind: 'legacy' };
  return {
    kind: 'chain',
    chainId: target.chainId,
    versionId: target.versionId,
    located: target.location.located,
  };
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
