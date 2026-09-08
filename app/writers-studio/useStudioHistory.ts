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

export function useStudioHistory() {
  const [phase, setPhase] = useState<StudioHistoryPhase>('loading');
  const [acts, setActs] = useState<StudioAct[]>([]);

  const load = useCallback(async () => {
    try {
      const res = await apiFetch('/api/sovereign/studio/history', { method: 'GET' });
      if (res.status === 401) {
        setPhase('unauthorized');
        return;
      }
      if (!res.ok) {
        setPhase('error');
        return;
      }
      const data = await res.json();
      setActs(Array.isArray(data.acts) ? data.acts : []);
      setPhase('ready');
    } catch {
      setPhase('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { phase, acts, reload: load };
}
