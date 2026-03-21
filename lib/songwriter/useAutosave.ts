'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface AutosaveOptions {
  memberId: string | null;
  type: 'song' | 'poem';
  title: string;
  inputEcho: string;
  seed: object;
  draft: string;
  debounceMs?: number;
}

interface AutosaveState {
  creationId: string | null;
  status: SaveStatus;
}

/**
 * Debounced autosave for songwriter and poetry canvases.
 *
 * On first call with a new draft, creates a row and stores the returned id.
 * On subsequent calls, updates that row.
 * Fire-and-forget style — never blocks the writing surface.
 */
export function useAutosave(options: AutosaveOptions) {
  const { memberId, type, title, inputEcho, seed, draft, debounceMs = 2000 } = options;

  const [state, setState] = useState<AutosaveState>({ creationId: null, status: 'idle' });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Keep a ref to the current creationId so the save closure always sees the latest value
  const creationIdRef = useRef<string | null>(null);

  const save = useCallback(async () => {
    if (!memberId || !draft.trim()) return;

    setState(prev => ({ ...prev, status: 'saving' }));

    try {
      const res = await fetch('/api/songwriter/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: creationIdRef.current ?? undefined,
          memberId,
          type,
          title,
          inputEcho,
          seed,
          draft,
        }),
      });

      if (!res.ok) {
        setState(prev => ({ ...prev, status: 'error' }));
        return;
      }

      const data = await res.json();
      creationIdRef.current = data.id;
      setState({ creationId: data.id, status: 'saved' });

      // Reset to idle after 3s so the indicator fades
      setTimeout(() => setState(prev => ({ ...prev, status: 'idle' })), 3000);
    } catch {
      setState(prev => ({ ...prev, status: 'error' }));
    }
  }, [memberId, type, title, inputEcho, seed, draft]);

  // Debounce: reset timer on every change
  useEffect(() => {
    if (!draft.trim() || !memberId) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(save, debounceMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [draft, title, memberId, debounceMs, save]);

  return { creationId: state.creationId, saveStatus: state.status };
}
