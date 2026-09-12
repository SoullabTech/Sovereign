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

import type { FocusMember, FocusSet } from './focusSet';

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
  /** Whether Ask MAIA may be pressed at all. */
  lawful: boolean;
  /**
   * Why not, in ordinary words. ⛔ A member never has to understand disclosure
   * receipts, currency state or act provenance to know what MAIA can see.
   */
  refusal: string | null;
}

/** A member MAIA will be able to read. ⛔ Only `current` qualifies. */
export const isReady = (m: FocusMember): boolean => m.state === 'current' && m.focus !== null;

export function askReadiness(set: FocusSet | null): AskReadiness {
  if (!set || set.members.length === 0) {
    return {
      total: 0, ready: 0, needConfirmation: 0, absent: 0, lawful: false,
      refusal: 'There is nothing in focus yet.',
    };
  }
  const ready = set.members.filter(isReady).length;
  const needConfirmation = set.members.filter((m) => m.state === 'unverified').length;
  const absent = set.members.filter((m) => m.state === 'stale' || m.state === 'gone').length;

  /* ⛔ P5 · nothing readable means no cognition call. MAIA cannot be asked
     about places she cannot be given. */
  if (ready === 0) {
    return {
      total: set.members.length, ready, needConfirmation, absent, lawful: false,
      refusal: needConfirmation > 0
        ? 'None of these places can be read yet. Confirm an anchor first, and MAIA can look at it.'
        : 'None of these places are in the work as it is now.',
    };
  }

  /* ⛔ P4 · an unreadable active target does not cross, and NOTHING is
     substituted for it. Quietly asking about a different place than the one the
     writer said they were working on is the system deciding what they meant. */
  const active = set.activeIndex === null ? null : set.members[set.activeIndex] ?? null;
  if (active && !isReady(active)) {
    return {
      total: set.members.length, ready, needConfirmation, absent, lawful: false,
      refusal: 'The place you are working on cannot be read yet. Confirm it, or choose another.',
    };
  }

  /* ⭐ P3 · no active target is LAWFUL. Declared attention exists before the
     writer chooses what to edit (U4), and asking about all of it is an ordinary
     thing to want. */
  return {
    total: set.members.length, ready, needConfirmation, absent, lawful: true, refusal: null,
  };
}

/** The line the panel shows above the button. Plain words, no vocabulary. */
export function readinessLine(r: AskReadiness): string {
  const parts = [`${r.total} ${r.total === 1 ? 'place' : 'places'} in focus`];
  if (r.ready > 0) parts.push(`${r.ready} ready for MAIA`);
  if (r.needConfirmation > 0) parts.push(`${r.needConfirmation} need${r.needConfirmation === 1 ? 's' : ''} confirmation`);
  if (r.absent > 0) parts.push(`${r.absent} no longer here`);
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
    members: set.members.map((m, i) => ({
      focusMemberId: `f${i + 1}`,
      sectionRef: m.anchor.sectionId,
      /* ⭐ The HISTORICAL coordinates, exactly as the observation declared them.
         ⛔ Not a claim that they are still current — the server resolves that
         against the frozen digest, and only `ready` is ever given a body. */
      ...(m.anchor.kind === 'passage'
        ? { range: { start: m.anchor.range.start, end: m.anchor.range.end } }
        : {}),
    })),
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
