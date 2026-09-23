/**
 * FLAGSHIP-RUNTIME-CONVERGENCE-01 / C1C1 — THE DISCUSS ACT, AS DATA.
 *
 * One commissioning gesture → one passage-bound thread → one member discourse
 * turn → one MAIA reply. Nothing here renders, holds React state, reads the
 * environment, or touches the writing session's authority: the session is
 * handed in and driven only through the members it already exposes
 * (`flushPending` · `hasUnsavedWork` · `statusOf` · `currentRevisionId`).
 *
 * THE SUBMIT SEQUENCE (founder-fixed order, C1C1 §III)
 *   1 synchronous in-flight guard          `createInFlightGuard` · `commissionDiscuss`
 *   2 read the CURRENT Sanctuary posture   `ports.readPosture()` — once, at the gesture
 *   3 unresolved or Sanctuary → refuse     no POST of any kind
 *   4 settle the existing writing session  `settleWritingSession` — flush, then wait
 *   5 conflict / error / unconfirmed → refuse
 *   6 read the revision ONLY after settlement
 *   7 open the passage relationship at the exact held range
 *   8 send exactly one discourse turn carrying the member's exact text
 *
 * ⛔ Never manufactures an Ask. ⛔ Never retries. ⛔ Never calls
 * /editorial/version · /editorial/adoption · /editorial/undo · /focus.
 * ⛔ The scope sent is the one the server's discuss-first gate withholds
 * proposals under: latitude 1 · no paragraph removal · no immediate proposal.
 */

import type { CurrentPostureRead } from '@/lib/sanctuary/currentClientPosture';
import type { SectionWriting } from '@/lib/writersStudio/useSectionWriting';
import {
  locateUniquePassage,
  type BoundThreadOutcome,
  type EditorialTurnOutcome,
} from '@/lib/writersStudio/rebuild/editorialCollaboration';

/** The exact held address the host measured. Mirrors `HeldPassageAt` structurally. */
export interface DiscussHeld {
  readonly sectionId: string;
  readonly start: number;
  readonly end: number;
  readonly text: string;
}

/** ⭐ The one scope Discuss ever sends. On a fresh thread this is the sequence gate's own condition. */
export const DISCUSS_SCOPE = Object.freeze({
  latitude: 1 as const,
  mayRemoveParagraphs: false as const,
  mayProposeImmediately: false as const,
});

/** ⭐ Fixed copy. Every line names what did NOT happen to the Work. ⛔ None says "cancelled". */
export const DISCUSS_COPY = Object.freeze({
  failed: 'MAIA couldn’t finish that response. Your Work was not changed.',
  stale: 'This response belongs to the passage before your latest edit. Your writing has not been changed.',
  postureUnresolved: 'The Studio can’t tell whether this session is in Sanctuary, so nothing was sent and nothing was stored.',
  sanctuary: 'Sanctuary is on. MAIA doesn’t keep an editorial conversation in Sanctuary — nothing was sent and nothing was stored.',
  needsAttention: 'Your latest writing needs attention before MAIA reads this passage. Nothing was sent.',
  notSettled: 'Your latest writing isn’t safely settled yet. MAIA will wait rather than read an older copy. Nothing was sent.',
  busy: 'MAIA is still finishing an earlier request. Nothing new was sent.',
  waiting: 'Waiting for MAIA.',
});

/* ── 1 · the synchronous in-flight guard ─────────────────────────────────── */

export interface InFlightGuard {
  /** ⭐ Synchronous. The second call in the same tick returns false. */
  acquire(): boolean;
  release(): void;
  held(): boolean;
}
export function createInFlightGuard(): InFlightGuard {
  let busy = false;
  return {
    acquire: () => { if (busy) return false; busy = true; return true; },
    release: () => { busy = false; },
    held: () => busy,
  };
}

/* ── 4/5 · settlement through the existing session ───────────────────────── */

export type SettleSession = Pick<SectionWriting, 'sections' | 'statusOf' | 'flushPending' | 'hasUnsavedWork'>;
export type SettleOutcome = { ok: true } | { ok: false; reason: 'needs_attention' | 'not_settled' };

/**
 * ⭐ REUSES the session's own mechanisms and creates no second save path:
 * flush what is staged, then wait for the queue to report nothing unsaved,
 * refusing on conflict / error at any point. Bounded so a stuck lane refuses
 * rather than reads an older copy.
 */
export async function settleWritingSession(
  session: SettleSession,
  opts: { timeoutMs?: number; now?: () => number; sleep?: (ms: number) => Promise<void> } = {},
): Promise<SettleOutcome> {
  const now = opts.now ?? (() => Date.now());
  const sleep = opts.sleep ?? ((ms: number) => new Promise<void>((r) => setTimeout(r, ms)));
  const timeoutMs = opts.timeoutMs ?? 5000;
  const blocked = () => session.sections.some((s) => {
    const st = session.statusOf(s.id);
    return st === 'conflict' || st === 'error';
  });
  if (blocked()) return { ok: false, reason: 'needs_attention' };
  session.flushPending();
  const deadline = now() + timeoutMs;
  while (session.hasUnsavedWork()) {
    if (blocked()) return { ok: false, reason: 'needs_attention' };
    if (now() > deadline) return { ok: false, reason: 'not_settled' };
    await sleep(50);
  }
  return { ok: true };
}

/* ── 2–8 · the act ───────────────────────────────────────────────────────── */

export interface DiscussPorts {
  /** Read AT THE GESTURE. ⛔ Never an account default, never a session row. */
  readonly readPosture: () => CurrentPostureRead;
  readonly session: SettleSession & Pick<SectionWriting, 'currentRevisionId'>;
  readonly openPassage: (
    sectionId: string, range: { start: number; end: number }, revisionNumber: number, posture: CurrentPostureRead,
  ) => Promise<BoundThreadOutcome & { refusal?: string }>;
  readonly sendTurn: (
    threadId: string, sectionId: string, text: string, posture: CurrentPostureRead, scope: typeof DISCUSS_SCOPE,
  ) => Promise<EditorialTurnOutcome>;
  /** Injectable for the laws; the host leaves it to `settleWritingSession`. */
  readonly settle?: (session: SettleSession) => Promise<SettleOutcome>;
}

export type DiscussOutcome =
  | { ok: true; threadId: string; locusText: string; reply: string }
  | { ok: false; stage: 'in_flight' | 'posture' | 'sanctuary' | 'settle' | 'open' | 'turn' | 'reply'; copy: string };

export function lastMaiaTurn(turns: readonly { speaker: 'author' | 'maia'; body: string }[]): string | null {
  for (let i = turns.length - 1; i >= 0; i -= 1) {
    const t = turns[i];
    if (t && t.speaker === 'maia') return t.body;
  }
  return null;
}

export async function runDiscussAct(held: DiscussHeld, ask: string, ports: DiscussPorts): Promise<DiscussOutcome> {
  /* 2 · the member's posture NOW, once, and carried unchanged to both calls */
  const posture = ports.readPosture();
  /* 3 */
  if (!posture.resolved) return { ok: false, stage: 'posture', copy: DISCUSS_COPY.postureUnresolved };
  if (posture.sanctuary) return { ok: false, stage: 'sanctuary', copy: DISCUSS_COPY.sanctuary };
  /* 4/5 */
  const settled = await (ports.settle ?? settleWritingSession)(ports.session);
  if (!settled.ok) {
    return { ok: false, stage: 'settle', copy: settled.reason === 'needs_attention' ? DISCUSS_COPY.needsAttention : DISCUSS_COPY.notSettled };
  }
  /* 6 · only now is the revision the one the passage lives in */
  const revisionNumber = ports.session.currentRevisionId();
  /* 7 */
  const opened = await ports.openPassage(held.sectionId, { start: held.start, end: held.end }, revisionNumber, posture);
  if (!opened.ok) {
    return { ok: false, stage: 'open', copy: opened.reason === 'sanctuary_unavailable' ? DISCUSS_COPY.sanctuary : DISCUSS_COPY.failed };
  }
  /* 8 · exactly one turn, the member's exact words, the withholding scope */
  const sent = await ports.sendTurn(opened.thread.threadId, held.sectionId, ask, posture, DISCUSS_SCOPE);
  if (!sent.ok) {
    return { ok: false, stage: 'turn', copy: sent.reason === 'sanctuary_unavailable' ? DISCUSS_COPY.sanctuary : DISCUSS_COPY.failed };
  }
  const reply = lastMaiaTurn(sent.thread.turns);
  if (reply === null) return { ok: false, stage: 'reply', copy: DISCUSS_COPY.failed };
  return { ok: true, threadId: sent.thread.threadId, locusText: sent.thread.locusText, reply };
}

/**
 * ⭐ 1 + 2–8. The guard is taken SYNCHRONOUSLY before the first await, so two
 * submits in one tick cannot both pass; it is released only when the act has
 * finished, however it finished.
 */
export async function commissionDiscuss(
  guard: InFlightGuard, held: DiscussHeld, ask: string, ports: DiscussPorts,
): Promise<DiscussOutcome> {
  const text = ask.trim();
  if (!text) return { ok: false, stage: 'reply', copy: DISCUSS_COPY.failed };
  if (!guard.acquire()) return { ok: false, stage: 'in_flight', copy: DISCUSS_COPY.busy };
  try {
    return await runDiscussAct(held, text, ports);
  } finally {
    guard.release();
  }
}

/* ── late-result and changed-passage laws ────────────────────────────────── */

/**
 * ⭐ A response attaches ONLY to the gesture that commissioned it: same
 * generation (no Release, no new gesture, no section move since) AND the
 * commissioning section still in focus. ⛔ "It completed while a passage was
 * visible" is not a reason.
 */
export function resultAttaches(
  pending: { readonly gen: number; readonly held: Pick<DiscussHeld, 'sectionId'> },
  current: { readonly gen: number; readonly focusSectionId: string | null },
): boolean {
  return pending.gen === current.gen && current.focusSectionId === pending.held.sectionId;
}

export type Attachment = { kind: 'attached'; start: number; end: number } | { kind: 'stale' };

/**
 * ⭐ Before a response renders as attached, the thread's own locus must occur
 * EXACTLY ONCE in the live body. Anything else is stale: no highlight, no
 * re-anchor, no re-read. The existing exact-location primitive decides.
 */
export function resolveAttachment(liveBody: string, locusText: string): Attachment {
  const at = locateUniquePassage(liveBody, locusText);
  return at ? { kind: 'attached', start: at.start, end: at.end } : { kind: 'stale' };
}
