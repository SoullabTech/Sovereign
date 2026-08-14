'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';

/**
 * The Studio's answer to "what book am I working on?"
 *
 * Reads the member's own manuscripts (member-scoped by credential server-side;
 * no parameter here can name another member). The most recent is the current
 * book — the same selection the Manuscript Room already makes, lifted to the
 * shell so Layer 2 can name the book without re-deriving it.
 *
 * Deliberately reports 'unauthorized' as a distinct phase rather than folding
 * it into 'none'. A signed-out member has not "got no manuscript" — telling
 * them their Studio is empty would be false.
 */

export interface CurrentManuscript {
  id: string;
  title: string | null;
  createdAt: string;
  sectionCount: number;
  charCount: number;
  keepCount: number;
  /**
   * When the member last WROTE here — a member act, never a row mutation.
   * NULL when the draft has only ever been created (seeded import or blank
   * page), which the API distinguishes by `updated_at > created_at`.
   */
  lastWrittenAt: string | null;
}

export type ManuscriptPhase = 'loading' | 'none' | 'ready' | 'unauthorized' | 'error';

export function useCurrentManuscript() {
  const [phase, setPhase] = useState<ManuscriptPhase>('loading');
  const [manuscript, setManuscript] = useState<CurrentManuscript | null>(null);
  const [manuscripts, setManuscripts] = useState<CurrentManuscript[]>([]);
  const [count, setCount] = useState(0);

  const load = useCallback(async () => {
    try {
      const res = await apiFetch('/api/sovereign/manuscripts', { method: 'GET' });
      if (res.status === 401) {
        setPhase('unauthorized');
        return;
      }
      if (!res.ok) {
        setPhase('error');
        return;
      }
      const data = await res.json();
      const list: CurrentManuscript[] = Array.isArray(data.manuscripts) ? data.manuscripts : [];
      setCount(list.length);
      setManuscript(list[0] ?? null);
      // Work Home (Slice 6) shows every manuscript — placed ones inside their
      // work, the rest as themselves — so the whole read is kept, not just [0].
      setManuscripts(list);
      setPhase(list.length > 0 ? 'ready' : 'none');
    } catch {
      // A network failure is not an empty Studio. Say so.
      setPhase('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { phase, manuscript, manuscripts, count, reload: load };
}
