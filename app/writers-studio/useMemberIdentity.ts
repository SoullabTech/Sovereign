'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';

/**
 * WS2-03D — who the member is, from the server, for the embedded conversation.
 *
 * ── WHY THE STUDIO NEEDED THIS AT ALL ──────────────────────────────────────
 *
 * Until now it did not. Every Studio read goes through `apiFetch`, which sends
 * the session token, and the server resolves identity itself — so the Studio
 * has never held a member id and has been better for it. Embedding the
 * canonical conversation component changes that: `OracleConversation` takes a
 * `userId`, so the Studio has to be able to say who is writing.
 *
 * ── WHY NOT localStorage, WHICH IS RIGHT THERE ─────────────────────────────
 *
 * `/maia` reads `explorerId` out of `localStorage`, and copying that would
 * have been one line. It is refused here, and the rule is narrow enough to be
 * honest about what it does and does not cover:
 *
 *   Writer's Studio may never derive MEMBER identity, WORK identity, or
 *   CONVERSATION placement from browser storage.
 *
 *   MAIA's own local preferences are not in scope. OracleConversation carries
 *   many of them internally and that is its business — they are preferences,
 *   not authority.
 *
 * The distinction matters because browser storage is member-editable. An
 * identity read from it is a claim, and this lane has spent its whole length
 * refusing to let claims stand in for facts — a manuscript that could not be
 * resolved, a Work that was not declared, a work id that was not owned. A
 * member id read from `localStorage` would be the same mistake at the root of
 * the tree, where it would silently scope somebody else's conversation.
 *
 * So identity comes from `/api/members/me`, which resolves it from a verified
 * credential server-side and returns the canonical member row.
 *
 * ── FAILS CLOSED ───────────────────────────────────────────────────────────
 *
 * No identity means no embedded conversation. The panel says so plainly rather
 * than opening a conversation that cannot name who is in it.
 */

export type IdentityPhase = 'loading' | 'ready' | 'unauthorized' | 'error';

export interface MemberIdentity {
  phase: IdentityPhase;
  memberId: string | null;
  /** What to call them. Their own preferred name when they set one. */
  name: string | null;
}

export function useMemberIdentity(): MemberIdentity {
  const [phase, setPhase] = useState<IdentityPhase>('loading');
  const [memberId, setMemberId] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch('/api/members/me', { method: 'GET' });
        if (cancelled) return;
        if (res.status === 401) return setPhase('unauthorized');
        if (!res.ok) return setPhase('error');
        const data = await res.json();
        const member = data?.member;
        if (cancelled) return;
        if (!member?.id) return setPhase('error');
        setMemberId(member.id);
        setName(member.preferredName ?? member.name ?? null);
        setPhase('ready');
      } catch {
        if (!cancelled) setPhase('error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { phase, memberId, name };
}
