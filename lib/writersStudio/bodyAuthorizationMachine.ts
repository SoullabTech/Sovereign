/**
 * S3 · P1 · step 6 — THE INTERACTION OWNER, as a pure machine.
 *
 *   ⭐⭐ ONE PHYSICAL PRESS → ONE `actId`.
 *       A transport retry is the same act. A conscious re-authorization is not.
 *
 * ⛔ WHY A MACHINE AND NOT A HOOK. `actId` must be minted by the writer's act,
 * never by a render — and a rule that lives inside `useState` can only be
 * asserted by mounting React. As a pure reducer with the minter INJECTED, a test
 * can count how many times an id was minted across an entire interaction,
 * including the double-click and the retry.
 *
 * ⛔ WHERE THIS LIVES. Beside the MAIA conversation, per the D9 ⇄ S3 census.
 * ⛔ NEVER inside `heldFocus`: attention must not acquire a memory of
 * authorization, and a re-selection or a rerender must never be able to mint an
 * act.
 *
 * ⛔ WHAT IT IS NOT. It holds no authority. `actId` is act identity — it permits
 * nothing, and the server re-derives the requirement and the required section
 * set regardless of anything held here.
 */

import type { BodyProtocolOutcome, DisclosureSection } from './bodyAuthorization';

export type Phase =
  /** No authorization is pending. */
  | 'idle'
  /** The server asked; the writer has not acted. */
  | 'awaiting_authority'
  /** ⭐ An act is in flight. A second press here is the SAME act. */
  | 'authorizing'
  /** The act reached the server and was answered. */
  | 'settled'
  /** ⚠️ The act left, and no outcome came back. Retry is lawful, and same-act. */
  | 'transport_unresolved';

export interface MachineState {
  readonly phase: Phase;
  readonly pendingAskRef: string | null;
  readonly required: readonly DisclosureSection[];
  readonly selectedSectionIds: readonly string[];
  /** ⭐ The identity of the act currently in play. Null when none is. */
  readonly actId: string | null;
  /** ⛔ Once true, this act can never be sent again — only a new one. */
  readonly actSpent: boolean;
  readonly outcome: BodyProtocolOutcome | null;
}

export const initial: MachineState = {
  phase: 'idle', pendingAskRef: null, required: [], selectedSectionIds: [],
  actId: null, actSpent: false, outcome: null,
};

export type MachineEvent =
  /** Any outcome arriving from the server, at any point. */
  | { type: 'served'; outcome: BodyProtocolOutcome }
  /** The writer changed which sections they are authorizing. */
  | { type: 'select'; sectionIds: readonly string[] }
  /** ⭐ THE PHYSICAL PRESS. The only event that may mint. */
  | { type: 'press' }
  /** The request never resolved — no server outcome is known. */
  | { type: 'transport_failed' }
  /** The writer declined. ⛔ Reaches no server. */
  | { type: 'decline' };

/** ⭐ What the caller must DO. The machine performs no effect itself. */
export type Effect =
  | { do: 'send'; pendingAskRef: string; actId: string; sectionIds: readonly string[] }
  | { do: 'nothing' };

export interface Step {
  readonly state: MachineState;
  readonly effect: Effect;
}

const stay = (state: MachineState): Step => ({ state, effect: { do: 'nothing' } });

/**
 * ⭐ The minter is injected so the ONE-PRESS-ONE-ID law is observable. In
 * production it is `crypto.randomUUID`; in a test it is a counter.
 */
export type MintActId = () => string;

export function step(state: MachineState, event: MachineEvent, mint: MintActId): Step {
  switch (event.type) {
    case 'served': {
      const o = event.outcome;
      if (o.kind === 'BODY_AUTHORITY_REQUIRED') {
        /* ⭐ A FRESH ASK RESETS THE ACT. The previous press, if any, belonged to
           a different question; carrying its id forward would let one act appear
           to authorize two encounters. */
        return stay({
          ...initial, phase: 'awaiting_authority',
          pendingAskRef: o.pendingAskRef, required: o.sections,
          selectedSectionIds: o.sections.map((s) => s.sectionId), outcome: o,
        });
      }
      if (o.kind === 'BODY_SCOPE_INCOMPLETE') {
        /* ⭐ NO CLAIM OCCURRED — the server refused before the claim, so nothing
           was consumed. The question stays open and the act is over: authorizing
           the rest is a different set of sections and therefore a NEW press.
           ⛔ Nothing is consumed or regenerated silently; only a press mints.
           ⭐ AND THE SERVER'S SCOPE WINS. Selection is reset to what the server
           now says is outstanding — obsolete client scope is never preserved as
           though it were authority. */
        return stay({
          ...state, phase: 'awaiting_authority', pendingAskRef: o.pendingAskRef,
          required: o.outstanding,
          selectedSectionIds: o.outstanding.map((x) => x.sectionId),
          actId: null, actSpent: false, outcome: o,
        });
      }

      /* ⭐⭐ WHICH OUTCOMES SPEND THE ACT.
       *
       *   DISCLOSURE_UNAVAILABLE   ALWAYS. The member authorized, the boundary
       *                            could not be established, nothing was read —
       *                            trying again is a NEW authorization.
       *
       *   ACT_ALREADY_PROCESSED    ⭐ THE SAME ACT REMAINS IDENTIFIED. Receiving
       *   ALREADY_CONSUMED         it mints nothing and clears nothing. Whether
       *                            a NEW act is required follows `completion`,
       *                            not the kind:
       *                              completed  → an answer exists; nothing more
       *                              incomplete → the resume is spent and did not
       *                                           finish, so a fresh member act
       *                                           is required
       *
       * ⛔ Marking the act spent on `completed` would ask the member to
       * authorize again for an answer they already have. */
      const spent = o.kind === 'DISCLOSURE_UNAVAILABLE'
        || ((o.kind === 'ACT_ALREADY_PROCESSED' || o.kind === 'ALREADY_CONSUMED')
            && o.completion === 'incomplete');
      return stay({ ...state, phase: 'settled', actSpent: spent || state.actSpent, outcome: o });
    }

    case 'select':
      /* ⛔ Selection while an act is in flight changes nothing: the act already
         named its sections, and the server re-derives them regardless. */
      if (state.phase === 'authorizing' || state.phase === 'transport_unresolved') return stay(state);
      return stay({ ...state, selectedSectionIds: [...event.sectionIds] });

    case 'press': {
      if (!state.pendingAskRef) return stay(state);

      /* ⭐⭐ A SECOND PRESS WHILE THIS ACT IS IN FLIGHT IS THE SAME ACT.
         ⛔ No new id, and no second request: a double-click is one human act
         arriving twice, and minting here would turn it into two. */
      if (state.phase === 'authorizing') return stay(state);

      /* ⭐ A RETRY AFTER AN UNRESOLVED TRANSPORT REUSES THE SAME id. The server
         never told us what happened, so this is still that press. */
      if (state.phase === 'transport_unresolved' && state.actId) {
        return {
          state: { ...state, phase: 'authorizing' },
          effect: { do: 'send', pendingAskRef: state.pendingAskRef, actId: state.actId, sectionIds: state.selectedSectionIds },
        };
      }

      /* ⛔ A SPENT ACT IS NEVER RESENT. The press that follows a spend is a new
         human authorization and gets a new identity. */
      const actId = state.actSpent || !state.actId ? mint() : state.actId;
      return {
        state: { ...state, phase: 'authorizing', actId, actSpent: false },
        effect: { do: 'send', pendingAskRef: state.pendingAskRef, actId, sectionIds: state.selectedSectionIds },
      };
    }

    case 'transport_failed':
      /* ⛔ NOT `settled`. No server outcome is known, so nothing may be claimed
         about whether the crossing happened. The act stays alive for a retry. */
      return stay({ ...state, phase: 'transport_unresolved' });

    case 'decline':
      /* ⭐ The writer's own act, and it reaches no server at all. */
      return stay({ ...initial, phase: 'settled', outcome: { kind: 'DECLINED' } });
  }
}
