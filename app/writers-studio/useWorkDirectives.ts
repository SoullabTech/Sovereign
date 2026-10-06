'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import type {
  WorkDirective,
  WorkDirectiveEvent,
  WorkDirectiveKind,
} from '@/lib/writersStudio/workDirectives';

export type WorkDirectivesPhase = 'loading' | 'ready' | 'unauthorized' | 'error';

export function useWorkDirectives(workId: string | null) {
  const [phase, setPhase] = useState<WorkDirectivesPhase>('loading');
  const [directives, setDirectives] = useState<WorkDirective[]>([]);

  const load = useCallback(async () => {
    if (!workId) {
      setDirectives([]);
      setPhase('ready');
      return;
    }
    try {
      const response = await apiFetch(
        '/api/sovereign/living-works/' + encodeURIComponent(workId) + '/directives',
        { method: 'GET', cache: 'no-store' },
      );
      if (response.status === 401) {
        setPhase('unauthorized');
        return;
      }
      if (!response.ok) {
        setPhase('error');
        return;
      }
      const body = await response.json().catch(() => ({})) as {
        directives?: WorkDirective[];
      };
      setDirectives(Array.isArray(body.directives) ? body.directives : []);
      setPhase('ready');
    } catch {
      setPhase('error');
    }
  }, [workId]);

  useEffect(() => { void load(); }, [load]);

  const add = useCallback(async (kind: WorkDirectiveKind, text: string) => {
    if (!workId) return false;
    const response = await apiFetch(
      '/api/sovereign/living-works/' + encodeURIComponent(workId) + '/directives',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ kind, text }),
      },
    );
    if (!response.ok) return false;
    await load();
    return true;
  }, [load, workId]);

  const act = useCallback(async (
    directiveId: string,
    event: WorkDirectiveEvent,
    text?: string,
  ) => {
    if (!workId) return false;
    const response = await apiFetch(
      '/api/sovereign/living-works/' + encodeURIComponent(workId)
        + '/directives/' + encodeURIComponent(directiveId),
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ event, ...(text === undefined ? {} : { text }) }),
      },
    );
    if (!response.ok) return false;
    await load();
    return true;
  }, [load, workId]);

  return { phase, directives, add, act, reload: load };
}
