'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import type { StudioAct } from './studioHistory';

/**
 * The member's recorded acts. Same shape as the Studio's other readers,
 * including 'unauthorized' as a distinct phase — a signed-out member has not
 * "done nothing".
 *
 * ⛔ Nothing here is derived from current state. Every act read by this hook
 * was written once, at the moment it happened, and cannot move afterwards.
 */

export type StudioHistoryPhase = 'loading' | 'ready' | 'unauthorized' | 'error';

/** `limit` is the route's existing query parameter (default 60, max 300); omitted, the request is unchanged. */
export function useStudioHistory(limit?: number) {
  const [phase, setPhase] = useState<StudioHistoryPhase>('loading');
  const [acts, setActs] = useState<StudioAct[]>([]);

  /** Resolves true only when the list was read (see useLivingWorks.load). */
  const load = useCallback(async (): Promise<boolean> => {
    try {
      const res = await apiFetch(
        limit ? `/api/sovereign/studio/history?limit=${limit}` : '/api/sovereign/studio/history',
        { method: 'GET' },
      );
      if (res.status === 401) {
        setPhase('unauthorized');
        return false;
      }
      if (!res.ok) {
        setPhase('error');
        return false;
      }
      const data = await res.json();
      setActs(Array.isArray(data.acts) ? data.acts : []);
      setPhase('ready');
      return true;
    } catch {
      setPhase('error');
      return false;
    }
  }, [limit]);

  useEffect(() => {
    load();
  }, [load]);

  return { phase, acts, reload: load };
}
