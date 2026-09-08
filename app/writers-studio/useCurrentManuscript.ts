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
   * ⛔ MEMBER DRAFT ACTIVITY, NOT WRITING TIME. Advances on save, checkpoint,
   * restore or edit — a checkpoint moves it without changing a character (see
   * the API comment). Kept under its legacy wire name; it may not be used as
   * authority for continuability and may not render as "written <when>".
   */
  lastWrittenAt: string | null;

  /* STUDIO-WRITING-PRESENCE-01 — Source, writing presence and authorship are
     three different truths; none may stand in for another. `charCount` above is
     SOURCE extent and is unchanged. */

  /** Raw extent of the current Working Draft. NULL when no draft row exists. */
  draftCharCount: number | null;
  /** Substantive draft presence — whitespace is not writing. */
  hasDraftWriting: boolean;
  /** Substantive writing exists in EITHER layer. An OR, never the extent's CASE. */
  hasWriting: boolean;
  /**
   * The current draft diverges from the revision-1 baseline: the member has
   * authored here. FALSE when the baseline is missing — fail closed.
   */
  hasCurrentMemberContribution: boolean;
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
