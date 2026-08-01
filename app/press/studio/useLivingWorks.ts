'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';

/**
 * The Studio's answer to "what work am I returning to?"
 *
 * Lifted out of YourWork.tsx in Slice 5, when arrival was re-founded around
 * the Living Work and a second consumer appeared: Studio Home now needs to
 * know whether a work is declared *before* it decides what to say. Two
 * independent fetches would have meant two answers to the same question, and
 * a header that could disagree with the section beneath it.
 *
 * Extracted on an observed second consumer, not an imagined one. Sibling of
 * useCurrentManuscript, and deliberately the same shape.
 *
 * Reads the member's own works — member-scoped by credential server-side; no
 * parameter here can name another member. 'unauthorized' stays a distinct
 * phase: a signed-out member has not "declared no work".
 */

export interface LivingWork {
  id: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
}

export type LivingWorksPhase = 'loading' | 'ready' | 'unauthorized' | 'error';

export function useLivingWorks() {
  const [phase, setPhase] = useState<LivingWorksPhase>('loading');
  const [works, setWorks] = useState<LivingWork[]>([]);

  const load = useCallback(async () => {
    try {
      const res = await apiFetch('/api/sovereign/living-works', { method: 'GET' });
      if (res.status === 401) {
        setPhase('unauthorized');
        return;
      }
      if (!res.ok) {
        setPhase('error');
        return;
      }
      const data = await res.json();
      setWorks(Array.isArray(data.works) ? data.works : []);
      setPhase('ready');
    } catch {
      // A failure to read is not an absence of works. Say only what is true.
      setPhase('error');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { phase, works, reload: load };
}

/**
 * The work the arrival is founded on, or null.
 *
 * Exactly one declared work re-founds the page. With two or more it does not:
 * "which of your works did you come back to?" is a real question, and this
 * slice is not authorized to answer it by guessing (most-recent, first-made,
 * or any other silent pick). Until switching is built, several works keep the
 * arrival they already had.
 */
export function arrivalWork(phase: LivingWorksPhase, works: LivingWork[]): LivingWork | null {
  return phase === 'ready' && works.length === 1 ? works[0] : null;
}
