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

import { apiFetch } from '@/lib/http/apiBase';
import type { AskAnchor } from '@/lib/manuscript/ask/anchor';
import type { StalenessState } from '@/lib/manuscript/ask/staleness';
import type { CurrentLocation } from '@/lib/manuscript/development/resolve';

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
      /**
       * BUILD-07E. Present only on a developmental thread, and never synthesised
       * client-side: it is the server's `observationLocation` answer, three-state.
       * A surface that computed it here would be claiming a measurement it never
       * made — the room has no evidence and no digests.
       */
      location?: CurrentLocation;
    }
  | { ok: false; refusal: string; detail?: string; threadId?: string; location?: CurrentLocation };

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
}): Promise<AskOutcome> {
  try {
    const res = await apiFetch(url(input.manuscriptId), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(
        input.threadId
          ? { threadId: input.threadId, question: input.question }
          : { anchor: input.anchor, question: input.question }),
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
      location: j.location as CurrentLocation | undefined,
    };
  } catch {
    /* A transport failure is not an answer from MAIA and is never shown as one. */
    return { ok: false, refusal: 'unreachable' };
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

/** Threads already open on an anchor, so the surface may offer to resume one. */
export async function threadsOn(
  manuscriptId: string, anchor: AskAnchor,
): Promise<{ id: string; openedAt: string; turnCount: number }[]> {
  try {
    const res = await apiFetch(
      `${url(manuscriptId)}?anchor=${encodeURIComponent(JSON.stringify(anchor))}`,
      { method: 'GET' });
    if (res.status >= 400) return [];
    const j = await res.json();
    return (j.threads ?? []) as { id: string; openedAt: string; turnCount: number }[];
  } catch {
    return [];
  }
}
