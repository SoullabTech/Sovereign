/**
 * WS2-05B-8B-02c-2 — the Ask surface's client.
 *
 * THERE IS NO STRUCTURE CALL HERE. Not disabled, not commented out: absent.
 * This client can open a conversation and add a turn to one. It cannot preview a
 * gesture, apply one, or adopt anything — while the surface is being proven it
 * must be INCAPABLE of a write to the Work rather than choosing not to make one,
 * the same standing rule `reviewClient` states about adoption.
 *
 * ONLY IDENTITY AND WORDS GO UP THE WIRE. An anchor is ids and indices; the
 * question is what the author typed. No interpretation, no reviewed tree and no
 * manuscript prose is ever sent, so the server cannot be TOLD what the reading
 * says — only asked about the one it already holds.
 */

import { declaredSanctuaryPosture } from '@/lib/sanctuary/currentClientPosture';
import type { TeachingAnchor } from './teachingTurn';
import { apiFetch } from '@/lib/http/apiBase';
import type { AskAnchor } from '@/lib/manuscript/ask/anchor';
import type { StalenessState } from '@/lib/manuscript/ask/staleness';
import type { CurrentLocation } from '@/lib/manuscript/development/resolve';
import type { ThreadDiscovery, ThreadSummary } from './observationDialogueResume';
import { bodyOutcomeFrom } from './bodyProtocolResponse';
import { authorizeRequest, type BodyProtocolOutcome } from './bodyAuthorization';
import type { ExplanationDepth } from './workingStyle';

export interface AskTurnView {
  index: number;
  speaker: 'author' | 'maia';
  body: string;
  staleness: StalenessState;
}

export interface AskThreadView {
  id: string;
  anchor: AskAnchor;
  openedAt: string;
  turns: AskTurnView[];
}

export type AskOutcome =
  | {
      ok: true; threadId: string; thread: AskThreadView; staleness: StalenessState;
      /** Sanctuary: this exchange was answered for the moment and NOT kept (no thread row, no turn). Shown, never stored. */
      sanctuary?: { notKept: true; question: string; answer: string };
      /** Which saved sections MAIA was handed for this answer (ids + headings only, never text). Present on the Work conversation. */
      read?: readonly { sectionId: string; label: string | null }[];
      /**
       * BUILD-07E. Present only on a developmental thread, and never synthesised
       * client-side: it is the server's `observationLocation` answer, three-state.
       * A surface that computed it here would be claiming a measurement it never
       * made — the room has no evidence and no digests.
       */
      location?: CurrentLocation;
    }
  | { ok: false; refusal: string; detail?: string; threadId?: string; location?: CurrentLocation };

export interface AskResult {
  readonly outcome: BodyProtocolOutcome | null;
  readonly ask: AskOutcome;
}

const url = (manuscriptId: string) =>
  `/api/sovereign/manuscripts/${encodeURIComponent(manuscriptId)}/ask`;

/**
 * Ask one question. Opens the thread when `threadId` is absent.
 *
 * A RESUMED THREAD DOES NOT RESEND ITS ANCHOR. The server keeps the anchor and
 * reading the thread was opened on, so a second question cannot re-point a
 * conversation at a different reading.
 */
export async function ask(input: {
  manuscriptId: string;
  question: string;
  anchor?: AskAnchor;
  threadId?: string;
  /**
   * ⭐⭐ WHERE SHE PRESENTLY IS — ⛔ NEVER WHO THE CONVERSATION BELONGS TO.
   *
   * MAIA-CONVERGENCE-01 · D2. The server has read `body.sectionId` since
   * ASK-WORK-ANCHOR-01 B3 and no client could send it, so the law *"moving from
   * one passage to another changes this and nothing else"* was provable on the
   * route and unreachable from any surface. This field closes that, and closes
   * only that.
   *
   * ⛔ IT IS NOT PART OF THE ANCHOR. It is sent as a sibling of `anchor` /
   * `threadId`, never merged into the anchor object — a `work` anchor admits
   * exactly the key `on`, and the route refuses one carrying any other. Folding
   * a locus into the anchor would make scrolling a change of relationship, which
   * is the single thing B3's ruling forbade.
   *
   * ⛔ AND IT TRAVELS ON A RESUMED TURN TOO, deliberately: a thread continued
   * from Chapter 9 must be able to say so. The thread's identity is untouched by
   * it, because identity comes from `threadId`, and the server never re-reads
   * the anchor of a resumed thread.
   */
  sectionId?: string;
  /** The member's CURRENT Sanctuary posture. When omitted, the client declares it from saved settings (none saved ⇒ ordinary); unreadable ⇒ undeclared. */
  sanctuary?: boolean | 'no_live_settings';
  /** G-3: the writer's working-style preference (as the observation dialogue sends it). */
  responseStyle?: ExplanationDepth;
  /** G-3: the Teach me pressed. The server owns the teaching shape. */
  teachingAnchor?: TeachingAnchor;
  /** WS-WHOLE-BOOK-CONVERSATION: the writer's declared scope ("About: where I am · the whole book"). Omitted = where I am. */
  carryScope?: 'here' | 'whole_book';
  /** The conversation's room can carry out MAIA's acting offers (WorkConversation with `onStudioAct`). */
  roomActs?: boolean;
}): Promise<AskOutcome> {
  try {
    const res = await apiFetch(url(input.manuscriptId), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...(input.threadId
          ? { threadId: input.threadId }
          : { anchor: input.anchor }),
        question: input.question,
        ...(input.sectionId ? { sectionId: input.sectionId } : {}),
        ...(input.responseStyle ? { responseStyle: input.responseStyle } : {}),
        ...(input.teachingAnchor ? { teachingAnchor: input.teachingAnchor } : {}),
        ...(input.carryScope === 'whole_book' ? { carryScope: 'whole_book' } : {}),
        ...(input.roomActs ? { roomActs: true } : {}),
        // Every request to this route declares its Sanctuary posture when it can; the server keeps nothing for one that does not.
        ...(input.sanctuary !== undefined ? { sanctuary: input.sanctuary } : declaredSanctuaryPosture()),
      }),
    });
    const json = await res.json().catch(() => ({} as Record<string, unknown>));
    if (res.status >= 400) {
      return {
        ok: false,
        refusal: String((json as Record<string, unknown>).refusal ?? `http_${res.status}`),
        detail: (json as Record<string, unknown>).detail as string | undefined,
        threadId: (json as Record<string, unknown>).threadId as string | undefined,
        location: (json as Record<string, unknown>).location as CurrentLocation | undefined,
      };
    }
    const j = json as Record<string, unknown>;
    return {
      ok: true,
      threadId: j.threadId as string,
      thread: j.thread as AskThreadView,
      staleness: j.staleness as StalenessState,
      ...(Array.isArray(j.read) ? { read: j.read as { sectionId: string; label: string | null }[] } : {}),
      ...(j.sanctuary && typeof j.sanctuary === 'object' ? { sanctuary: j.sanctuary as { notKept: true; question: string; answer: string } } : {}),
      location: j.location as CurrentLocation | undefined,
    };
  } catch {
    /* A transport failure is not an answer from MAIA and is never shown as one. */
    return { ok: false, refusal: 'unreachable' };
  }
}


/** Developmental Ask with the body-authorization protocol surfaced explicitly. */
export async function askForBody(input: {
  manuscriptId: string;
  question: string;
  anchor?: AskAnchor;
  threadId?: string;
  sectionId?: string;
  responseStyle?: ExplanationDepth;
  /** The teaching button pressed (F1). The server owns the answer's shape. */
  teachingAnchor?: TeachingAnchor;
}): Promise<AskResult> {
  const raw = await rawPost(input.manuscriptId, {
    ...(input.threadId ? { threadId: input.threadId } : { anchor: input.anchor }),
    question: input.question,
    ...(input.sectionId ? { sectionId: input.sectionId } : {}),
    ...(input.responseStyle ? { responseStyle: input.responseStyle } : {}),
    ...(input.teachingAnchor ? { teachingAnchor: input.teachingAnchor } : {}),
  });
  return { outcome: raw.outcome, ask: raw.ask };
}

/** Resume one paused developmental Ask after the member's explicit authorization. */
export async function authorizeSections(input: {
  manuscriptId: string;
  pendingAskRef: string;
  actId: string;
  sectionIds: readonly string[];
  question: string;
  threadId?: string;
  responseStyle?: ExplanationDepth;
  teachingAnchor?: TeachingAnchor;
}): Promise<AskResult> {
  const raw = await rawPost(input.manuscriptId, {
    ...authorizeRequest({
      pendingAskRef: input.pendingAskRef,
      actId: input.actId,
      sectionIds: input.sectionIds,
      question: input.question,
      threadId: input.threadId,
    }),
    ...(input.responseStyle ? { responseStyle: input.responseStyle } : {}),
    ...(input.teachingAnchor ? { teachingAnchor: input.teachingAnchor } : {}),
  });
  return { outcome: raw.outcome, ask: raw.ask };
}

/** One POST, interpreted in both ordinary-Ask and body-protocol vocabularies. */
async function rawPost(
  manuscriptId: string,
  body: Record<string, unknown>,
): Promise<{ outcome: BodyProtocolOutcome | null; ask: AskOutcome }> {
  try {
    const res = await apiFetch(url(manuscriptId), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...declaredSanctuaryPosture(), ...body }),
    });
    const j = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    const outcome = bodyOutcomeFrom(res.status, j);

    if (res.status >= 400 || outcome) {
      return {
        outcome,
        ask: {
          ok: false,
          refusal: String(j.refusal ?? j.result ?? `http_${res.status}`),
          detail: j.detail as string | undefined,
          threadId: j.threadId as string | undefined,
          location: j.location as CurrentLocation | undefined,
        },
      };
    }

    if (!j.thread || typeof j.threadId !== 'string') {
      return {
        outcome: null,
        ask: {
          ok: false,
          refusal: String(j.result ?? 'empty_answer'),
          threadId: j.threadId as string | undefined,
          location: j.location as CurrentLocation | undefined,
        },
      };
    }

    return {
      outcome: null,
      ask: {
        ok: true,
        threadId: j.threadId as string,
        thread: j.thread as AskThreadView,
        staleness: j.staleness as StalenessState,
        location: j.location as CurrentLocation | undefined,
      },
    };
  } catch {
    return { outcome: null, ask: { ok: false, refusal: 'unreachable' } };
  }
}

/**
 * One thread, with its turns — the persisted conversation, not a summary.
 *
 * BUILD-07E. `threadsOn` answers "how many"; this answers "what was said". A
 * room that reopened on summaries alone would show that a conversation existed
 * and not what it was, which is not resuming.
 */
export async function loadThread(
  manuscriptId: string, threadId: string,
): Promise<AskThreadView | null> {
  try {
    const res = await apiFetch(
      `${url(manuscriptId)}?thread=${encodeURIComponent(threadId)}`, { method: 'GET' });
    if (res.status >= 400) return null;
    const j = await res.json();
    return (j.thread ?? null) as AskThreadView | null;
  } catch {
    return null;
  }
}

/**
 * Threads already open on an anchor, so the surface may offer to resume one.
 *
 * ⛔ FAILURE IS NOT AN EMPTY LIST. This returned `[]` on every error, which made
 * "the server did not answer" indistinguishable from "there are none" — and the
 * caller's next move on "there are none" is to POST an anchor and OPEN a thread.
 * A transient GET failure could therefore author a duplicate conversation beside
 * an existing one. The result is discriminated so that outcome is unreachable.
 */
export async function threadsOn(
  manuscriptId: string, anchor: AskAnchor,
): Promise<ThreadDiscovery> {
  try {
    const res = await apiFetch(
      `${url(manuscriptId)}?anchor=${encodeURIComponent(JSON.stringify(anchor))}`,
      { method: 'GET' });
    if (res.status >= 400) {
      return { kind: 'unavailable', reason: `http_${res.status}` };
    }
    const j = await res.json();
    const threads = j.threads;
    if (!Array.isArray(threads)) {
      /* A malformed body is not "none" either. */
      return { kind: 'unavailable', reason: 'malformed' };
    }
    return { kind: 'threads', threads: threads as ThreadSummary[] };
  } catch {
    return { kind: 'unavailable', reason: 'unreachable' };
  }
}


/* WORK-FIRST-DEVELOP-01 — same Ask surface before manuscript. */
const livingWorkAskUrl = (workId: string) =>
  `/api/sovereign/living-works/${encodeURIComponent(workId)}/ask`;

export async function askLivingWork(input: {
  workId: string;
  question: string;
  threadId?: string;
}): Promise<AskOutcome> {
  try {
    const res = await apiFetch(livingWorkAskUrl(input.workId), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: input.question,
        ...(input.threadId ? { threadId: input.threadId } : {}),
        ...declaredSanctuaryPosture(),
      }),
    });
    const json = await res.json().catch(() => ({} as Record<string, unknown>));
    if (res.status >= 400) {
      return {
        ok: false,
        refusal: String((json as Record<string, unknown>).refusal ?? `http_${res.status}`),
        detail: (json as Record<string, unknown>).detail as string | undefined,
        threadId: (json as Record<string, unknown>).threadId as string | undefined,
      };
    }
    const j = json as Record<string, unknown>;
    return {
      ok: true,
      threadId: j.threadId as string,
      thread: j.thread as AskThreadView,
      staleness: j.staleness as StalenessState,
      ...(j.sanctuary && typeof j.sanctuary === 'object' ? { sanctuary: j.sanctuary as { notKept: true; question: string; answer: string } } : {}),
    };
  } catch {
    return { ok: false, refusal: 'unreachable' };
  }
}

export async function loadLivingWorkAskThread(
  workId: string,
  threadId: string,
): Promise<AskThreadView | null> {
  try {
    const res = await apiFetch(
      `${livingWorkAskUrl(workId)}?thread=${encodeURIComponent(threadId)}`,
      { method: 'GET' },
    );
    if (!res.ok) return null;
    const body = await res.json();
    return (body.thread ?? null) as AskThreadView | null;
  } catch {
    return null;
  }
}

export async function threadsOnLivingWorkAsk(
  workId: string,
): Promise<ThreadDiscovery> {
  try {
    const res = await apiFetch(livingWorkAskUrl(workId), { method: 'GET' });
    if (!res.ok) return { kind: 'unavailable', reason: `http_${res.status}` };
    const body = await res.json();
    const threads = Array.isArray(body.threads) ? body.threads : [];
    return {
      kind: 'threads',
      threads: threads.map((thread: any): ThreadSummary => ({
        id: String(thread.id),
        openedAt: String(thread.openedAt),
        turnCount: Number(thread.turnCount),
      })),
    };
  } catch {
    return { kind: 'unavailable', reason: 'unreachable' };
  }
}
