/**
 * ASK MAIA — the writer's act, at the seam where a click becomes a gesture.
 *
 * ⭐⭐ THE PRODUCT SENTENCE THIS FILE EXISTS TO MAKE TRUE:
 *
 *   Focus membership is visible independently from what MAIA is presently
 *   allowed to read.
 *
 * The writer sees five places and three bodies BEFORE spending the act. A
 * button that implied five would be read when three can cross would make the
 * sovereignty invisible at exactly the moment it matters — the moment the
 * writer decides.
 *
 * ── ⭐ ONE HUMAN GESTURE, ONE ACT ──────────────────────────────────────────
 *
 *   human gesture A          human gesture B
 *     act-123                  act-124
 *       retry
 *       retry
 *
 * ⛔ STRUCTURAL, NOT DISCIPLINARY. If a browser retry and a human repetition
 * were indistinguishable, the provenance record would say the writer asked
 * twice when they asked once — and a later RevisionProposal would inherit that
 * as fact. The reducer below is the only place an actId is minted, and it will
 * not mint one while an act is in flight: a double-click is one act.
 *
 * ── ⛔ THE CLIENT IS NOT A DISCLOSURE AUTHORITY, AND NO LONGER CLAIMS TO BE ──
 *
 * Everything here is PRESENTATION. This once sent `readable: boolean` and the
 * crossing honoured `false` absolutely — but honouring `true` as an ATTEMPT was
 * still enough to make the server read current characters at historical
 * offsets, which proves the characters exist and not that they are still the
 * passage that was focused.
 *
 * ⭐ So the field is gone, not validated. The server resolves currency against
 * the frozen digest, at Ask time, immediately before disclosure. What the panel
 * shows is a preflight; what the Ask resolves is the authority. That is also
 * what closes the gap between the two.
 */

import type { MemberCurrency } from '@/lib/writers-studio/focusCurrency';
import type { FocusMember, FocusSet } from './focusSet';

/* ── what the server says about each place ────────────────────────────────── */

/**
 * The preflight's answer, as the panel holds it.
 *
 * ⭐ `resolvedAgainstDraftVersion` is a FRESHNESS MARKER, not a comparison: it
 * says only which state of the Work these statuses were established against. If
 * the Canvas has moved past it, the result no longer describes the Work and the
 * panel returns to "checking" rather than keep advertising 2 of 5 as current.
 */
export interface FocusCurrencyView {
  readonly resolvedAgainstDraftVersion: number | null;
  readonly members: Readonly<Record<string, MemberCurrency>>;
}

/** ⛔ A result that does not describe the current draft authorizes nothing. */
export function currencyDescribes(
  currency: FocusCurrencyView | null, draftVersion: number | null,
): boolean {
  return currency !== null
    && currency.resolvedAgainstDraftVersion !== null
    && draftVersion !== null
    && currency.resolvedAgainstDraftVersion === draftVersion;
}

/**
 * ⭐⭐ ONE DEFINITION OF WHICH MEMBER IS WHICH, used by the preflight AND the
 * Ask. Two independent derivations of `f1…fN` would eventually disagree, and
 * the disagreement would look like a currency change rather than a bug — the
 * canvasIdentity lesson: *a link is not a binding.*
 */
export function focusMembersOf(set: FocusSet): {
  focusMemberId: string; sectionRef: string; range?: { start: number; end: number };
}[] {
  return set.members.map((m, i) => ({
    focusMemberId: `f${i + 1}`,
    sectionRef: m.anchor.sectionId,
    /* ⭐ The HISTORICAL coordinates, exactly as the observation declared them.
       ⛔ Never the panel's own re-resolution — the server compares them against
       the frozen reading, so a pre-resolved coordinate would be compared with
       itself. */
    ...(m.anchor.kind === 'passage'
      ? { range: { start: m.anchor.range.start, end: m.anchor.range.end } }
      : {}),
  }));
}

/* ── readiness, in the writer's language ──────────────────────────────────── */

export interface AskReadiness {
  /** Places the writer declared. */
  total: number;
  /** Places MAIA will be able to read. */
  ready: number;
  /** Anchors the writer needs to confirm before they can be read. */
  needConfirmation: number;
  /** Places that are no longer in the Work, or cannot be shown. */
  absent: number;
  /** ⛔ Places the server has not answered for yet. Never counted as either. */
  checking: number;
  /** Whether Ask MAIA may be pressed at all. */
  lawful: boolean;
  /**
   * Why not, in ordinary words. ⛔ A member never has to understand disclosure
   * receipts, currency state or act provenance to know what MAIA can see.
   */
  refusal: string | null;
}

/**
 * ⭐⭐ READINESS IS THE SERVER'S ANSWER, NOT THE PANEL'S INFERENCE.
 *
 * This read `m.state === 'current'` — the panel's own comparison of the
 * reading's kept-revision number against the latest kept revision. That signal
 * is insufficient and we proved it: a writer can edit a section fifty times
 * without keeping a version, and the comparison still says `current`. The panel
 * could therefore mark a passage `✓ ready for MAIA` whose text they rewrote
 * that morning.
 *
 * ⛔ So the panel no longer decides. It asks, and renders what it is told.
 */
export const isReady = (currency: MemberCurrency | undefined): boolean => currency === 'ready';

export function askReadiness(
  set: FocusSet | null,
  currency: FocusCurrencyView | null,
): AskReadiness {
  if (!set || set.members.length === 0) {
    return {
      total: 0, ready: 0, needConfirmation: 0, absent: 0, checking: 0, lawful: false,
      refusal: 'There is nothing in focus yet.',
    };
  }

  const ids = focusMembersOf(set).map((m) => m.focusMemberId);
  const at = (i: number): MemberCurrency | undefined => currency?.members[ids[i]];

  /* ⛔ NO ANSWER YET IS NOT AN ANSWER. Before the preflight returns, the panel
     claims nothing — not ready, and not gone. */
  if (!currency) {
    return {
      total: set.members.length, ready: 0, needConfirmation: 0, absent: 0,
      checking: set.members.length, lawful: false,
      refusal: 'Checking which of these MAIA can read…',
    };
  }

  const all = set.members.map((_, i) => at(i));
  const ready = all.filter((c) => c === 'ready').length;
  const needConfirmation = all.filter((c) => c === 'needs_confirmation').length;
  const absent = all.filter((c) => c === 'unavailable').length;
  const checking = all.filter((c) => c === undefined || c === 'not_yet_known').length;
  const base = { total: set.members.length, ready, needConfirmation, absent, checking };

  /* ⛔ P5 · nothing readable means no cognition call. */
  if (ready === 0) {
    return {
      ...base, lawful: false,
      refusal: needConfirmation > 0
        ? 'None of these places can be read yet. Confirm an anchor first, and MAIA can look at it.'
        : checking > 0
          ? 'MAIA could not check these places just now.'
          : 'None of these places are in the work as it is now.',
    };
  }

  /* ⛔ P4 · an unreadable active target does not cross, and NOTHING is
     substituted for it. Quietly asking about a different place than the one the
     writer said they were working on is the system deciding what they meant. */
  if (set.activeIndex !== null && !isReady(at(set.activeIndex))) {
    return {
      ...base, lawful: false,
      refusal: 'The place you are working on cannot be read yet. Confirm it, or choose another.',
    };
  }

  /* ⭐ P3 · no active target is LAWFUL. Declared attention exists before the
     writer chooses what to edit (U4). */
  return { ...base, lawful: true, refusal: null };
}

/** The line the panel shows above the button. Plain words, no vocabulary. */
export function readinessLine(r: AskReadiness): string {
  const parts = [`${r.total} ${r.total === 1 ? 'place' : 'places'} in focus`];
  if (r.ready > 0) parts.push(`${r.ready} ready for MAIA`);
  if (r.needConfirmation > 0) parts.push(`${r.needConfirmation} need${r.needConfirmation === 1 ? 's' : ''} confirmation`);
  if (r.absent > 0) parts.push(`${r.absent} no longer here`);
  /* ⛔ An unanswered place is named as unanswered — never folded into a number
     that would read as a finding. */
  if (r.checking > 0) parts.push(`${r.checking} still being checked`);
  return parts.join(' · ');
}

/* ── the act, and the difference between a retry and a repetition ─────────── */

export type AskPhase =
  | { phase: 'idle' }
  /** In flight. ⭐ A further press is the SAME act, never a second one. */
  | { phase: 'asking'; actId: string; attempt: number }
  | { phase: 'answered'; actId: string }
  | { phase: 'refused'; actId: string; why: string };

export type AskEvent =
  /** A deliberate human Ask. ⭐ The ONLY event that may mint an act identity. */
  | { kind: 'gesture'; actId: string }
  /** Transport failed and is being repeated. ⛔ Never a new act. */
  | { kind: 'retry' }
  | { kind: 'answered' }
  | { kind: 'refused'; why: string };

export const IDLE: AskPhase = { phase: 'idle' };

/**
 * ⛔ THE ONLY PLACE AN ACT IDENTITY ENTERS. Minting is the caller's, so this
 * stays pure and testable; what this reducer decides is WHETHER a new identity
 * is allowed to take effect. While an act is in flight, it is not.
 */
export function askReducer(state: AskPhase, event: AskEvent): AskPhase {
  switch (event.kind) {
    case 'gesture':
      /* ⛔ P9 · a double-click, or an impatient second press, is ONE writer act.
         The new identity the caller minted is discarded — the act in flight is
         the act the human performed. */
      if (state.phase === 'asking') return state;
      /* ⭐ P6/P8 · a first Ask and a later deliberate Ask each get their own
         identity, even when the Focus Set has not changed. Asking again is a
         real second act; only transport repetition is not. */
      return { phase: 'asking', actId: event.actId, attempt: 1 };

    case 'retry':
      /* ⭐ P7 · the same act, transported again. */
      return state.phase === 'asking'
        ? { phase: 'asking', actId: state.actId, attempt: state.attempt + 1 }
        : state;

    case 'answered':
      return state.phase === 'asking' ? { phase: 'answered', actId: state.actId } : state;

    case 'refused':
      return state.phase === 'asking'
        ? { phase: 'refused', actId: state.actId, why: event.why }
        : state;
  }
}

/* ── the request ──────────────────────────────────────────────────────────── */

export interface AskRequestBody {
  actId: string;
  sessionId: string;
  workRef: string;
  /** ⭐ The origin reading — how the SERVER reaches the frozen digests. */
  readingId: string;
  observationKey: string;
  members: {
    focusMemberId: string;
    sectionRef: string;
    range?: { start: number; end: number };
  }[];
  activeMemberId: string | null;
  gesture: 'ask_maia';
  ask: string;
}

/**
 * Exactly the fields the gesture may send. ⛔ No prose from the Work, no
 * offsets the server did not ask for, no currency claim that could grant.
 */
export function askRequestBody(input: {
  actId: string;
  sessionId: string;
  workRef: string;
  readingId: string;
  observationKey: string;
  set: FocusSet;
  ask: string;
}): AskRequestBody {
  const { set } = input;
  return {
    actId: input.actId,
    sessionId: input.sessionId,
    workRef: input.workRef,
    readingId: input.readingId,
    observationKey: input.observationKey,
    members: focusMembersOf(set),
    activeMemberId: set.activeIndex === null ? null : `f${set.activeIndex + 1}`,
    gesture: 'ask_maia',
    ask: input.ask,
  };
}

/** What the server said MAIA was actually given. */
export interface AskAnswer {
  response: string | null;
  message: string | null;
  focus: {
    total: number;
    readable: number;
    activeMemberId: string | null;
    members: { focusMemberId: string; ordinal: number; status: string; bodyAvailable: boolean; active: boolean }[];
  } | null;
}

/**
 * ⭐ P12 · What the writer is told afterwards. The server's own count, never
 * the panel's — so a member who asked about five places and got an answer about
 * three learns it from the side that knows.
 */
export function sawLine(answer: AskAnswer): string | null {
  const f = answer.focus;
  if (!f) return null;
  if (f.readable === f.total) {
    return `MAIA read all ${f.total} ${f.total === 1 ? 'place' : 'places'} in focus.`;
  }
  return `MAIA read ${f.readable} of the ${f.total} places in focus.`;
}
