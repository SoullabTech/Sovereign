'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';

/**
 * WS2-03D — the passages the member kept from their own manuscript.
 *
 * A Keep is verbatim text the writer chose to set aside: their words, their
 * selection, already an act of attention. Nothing infers them and nothing
 * generates them.
 *
 * Read from the same endpoint the outline already calls: the manuscript GET
 * returns sections and keeps together.
 *
 * CORRECTED. An earlier draft of this line said "so this adds a use, not a
 * request". That was not true. `useManuscriptSections` issues its own GET of
 * this endpoint and so does this hook — there are two requests, not one. What
 * is genuinely shared is the CONTRACT: no new endpoint, no second data
 * authority, no separate notion of what a Keep is.
 *
 * The duplicate GET is left in place deliberately rather than fixed here. It
 * costs one extra read of an endpoint the room already calls, and deduping it
 * means introducing a shared manuscript-detail loader — which is WRITE's to do
 * when it next touches manuscript loading, not a refactor to smuggle into a
 * Keeps button. Recorded so it is a known cost rather than an unnoticed one.
 */

export interface ManuscriptKeep {
  id: string;
  verbatimText: string;
  sectionHeading: string | null;
  sectionPosition: number | null;
  createdAt: string;
}

export function useManuscriptKeeps(manuscriptId: string | null) {
  const [keeps, setKeeps] = useState<ManuscriptKeep[]>([]);
  const [phase, setPhase] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    if (!manuscriptId) {
      setKeeps([]);
      setPhase('ready');
      return;
    }
    let cancelled = false;
    setPhase('loading');
    (async () => {
      try {
        const res = await apiFetch(`/api/sovereign/manuscripts/${manuscriptId}`, {
          method: 'GET',
        });
        if (cancelled) return;
        if (!res.ok) return setPhase('error');
        const data = await res.json();
        if (cancelled) return;
        setKeeps(Array.isArray(data.keeps) ? data.keeps : []);
        setPhase('ready');
      } catch {
        if (!cancelled) setPhase('error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [manuscriptId]);

  return { phase, keeps };
}
