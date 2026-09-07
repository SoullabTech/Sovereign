'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';

/**
 * The member's own sentences, back in the room with them.
 *
 * Reads the passages this member KEPT — an explicit recognition gesture made
 * inside their own manuscript, re-verified verbatim against their own section
 * before it was ever stored. So every line here is theirs twice over: they
 * wrote it, and then they marked it.
 *
 * ⛔ This is not "quotes from your writing". The Studio does not read a book
 * and choose what is worth showing back — that would be the system deciding
 * what is beautiful in someone else's work, with no gesture underneath it.
 * Only marked lines appear. If a member has marked nothing, the field stays
 * quiet, and that silence is correct.
 *
 * ⛔ Reflection Gold Lines are a different custody object and do NOT flow here
 * (founder, 2026-09-07): borrow the grammar, never assume a capsule belongs
 * to a Work.
 *
 * Same shape as useCurrentManuscript and useLivingWorks on purpose, including
 * 'unauthorized' as a distinct phase: a signed-out member has not "marked
 * nothing".
 */

export interface MarkedLine {
  id: string;
  /** The member's characters, verbatim and un-trimmed. Never edited here. */
  text: string;
  markedAt: string;
  manuscriptId: string;
  /** Where it came from — provenance travels WITH the line, never separately. */
  manuscriptTitle: string | null;
  heading: string | null;
}

export type MarkedLinesPhase = 'loading' | 'ready' | 'unauthorized' | 'error';

export function useMarkedLines() {
  const [phase, setPhase] = useState<MarkedLinesPhase>('loading');
  const [lines, setLines] = useState<MarkedLine[]>([]);

  const load = useCallback(async () => {
    try {
      const res = await apiFetch('/api/sovereign/keeps', { method: 'GET' });
      if (res.status === 401) {
        setPhase('unauthorized');
        return;
      }
      if (!res.ok) {
        setPhase('error');
        return;
      }
      const data = await res.json();
      setLines(Array.isArray(data.keeps) ? data.keeps : []);
      setPhase('ready');
    } catch {
      /* A network failure is not an unmarked book. The field renders nothing
         rather than implying the member has kept nothing. */
      setPhase('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { phase, lines, reload: load };
}
