'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import {
  MAIA_WORK_PARAM,
  MAIA_RETURN_PARAM,
  MAIA_CONVERSATION_PARAM,
} from '@/app/writers-studio/workContext';

/**
 * WS2-03C — arriving at MAIA from the Writer's Studio, carrying one Work.
 *
 * The Studio hands off `?work=<id>&return=<studio url>`. This hook is the
 * receiving half, and its whole job is to refuse to take that URL's word for
 * anything.
 *
 * ── VERIFICATION, NOT TRUST ────────────────────────────────────────────────
 *
 * The handoff URL is member-visible and member-editable, so the id in it is a
 * claim. It is checked against the member's OWN declared works, read from the
 * member-scoped endpoint — the same read the Studio itself uses. An id that
 * does not appear there resolves to `unresolved`, and the room says so rather
 * than opening a conversation that quietly claims a context it does not have.
 *
 * That mirrors the Canvas: a named identity that cannot be resolved exactly
 * fails visibly. It never degrades into "some other work" and it never
 * degrades into pretending no Work was named.
 *
 * Note what this hook does NOT do: it does not send the Work's title or
 * purpose anywhere. Only the id travels on to the exchange, and the server
 * re-reads the member's row for every word that reaches the prompt. Two
 * independent verifications, because this one is only presentation.
 *
 * ── THE RETURN ADDRESS ─────────────────────────────────────────────────────
 *
 * Only a same-origin Studio path is accepted. A `return` parameter is an
 * open-redirect the moment it is rendered as a link without that check, and
 * "it came from our own Studio" is exactly the assumption an attacker
 * supplies. Anything else is dropped and the member simply gets no return
 * control — the conversation is unharmed.
 */

export type HandoffPhase = 'none' | 'loading' | 'situated' | 'unresolved' | 'error';

export interface StudioHandoff {
  phase: HandoffPhase;
  /** The member's own words, for display only. The prompt gets its own read. */
  work: { id: string; title: string | null; purpose: string | null } | null;
  /** Safe, same-origin Studio path, or null. */
  returnHref: string | null;
  /** The id that was asked for — shown when it cannot be resolved. */
  requestedWorkId: string | null;
  /**
   * WS2-03D — an exchange begun in the Studio, to be CONTINUED here.
   *
   * Full MAIA must not open a second conversation beside the one the member
   * is already having. Carried explicitly; never looked up.
   */
  conversationId: string | null;
}

/** A return address must be a Studio path on this origin. Nothing else. */
export function safeReturnHref(raw: string | null): string | null {
  if (!raw) return null;
  // Reject anything that could leave the origin: absolute URLs, scheme-
  // relative "//evil.com", and backslash variants browsers normalise.
  if (!raw.startsWith('/') || raw.startsWith('//') || raw.startsWith('/\\')) return null;
  const path = raw.split('?')[0];
  return path === '/writers-studio' || path.startsWith('/writers-studio/') ? raw : null;
}

export function useStudioHandoff(search: string | null | undefined): StudioHandoff {
  const params = new URLSearchParams(search ?? '');
  const requestedWorkId = params.get(MAIA_WORK_PARAM);
  const returnHref = safeReturnHref(params.get(MAIA_RETURN_PARAM));
  const conversationId = params.get(MAIA_CONVERSATION_PARAM);

  const [phase, setPhase] = useState<HandoffPhase>(requestedWorkId ? 'loading' : 'none');
  const [work, setWork] = useState<StudioHandoff['work']>(null);

  useEffect(() => {
    if (!requestedWorkId) {
      setPhase('none');
      setWork(null);
      return;
    }
    let cancelled = false;
    setPhase('loading');
    (async () => {
      try {
        const res = await apiFetch('/api/sovereign/living-works', { method: 'GET' });
        if (cancelled) return;
        if (!res.ok) return setPhase('error');
        const data = await res.json();
        const list = Array.isArray(data.works) ? data.works : [];
        const found = list.find((w: { id: string }) => w.id === requestedWorkId);
        if (cancelled) return;
        if (!found) {
          setWork(null);
          return setPhase('unresolved');
        }
        setWork({ id: found.id, title: found.title ?? null, purpose: found.purpose ?? null });
        setPhase('situated');
      } catch {
        if (!cancelled) setPhase('error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [requestedWorkId]);

  return { phase, work, returnHref, requestedWorkId, conversationId };
}
