'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';

/**
 * The image a writer chose for a Work.
 *
 * ── Why an object URL and not an <img src> ────────────────────────────────
 * An <img> element cannot carry a header, so on iOS the request would arrive
 * with no credential — the Capacitor cookie trap, entered through a tag rather
 * than a fetch. The bytes are therefore read with apiFetch and rendered from an
 * object URL, which authenticates identically on web and in the WebView. One
 * request per image, in exchange for a surface that does not silently show
 * nothing on a phone.
 *
 * ⛔ Absence is a real state and stays visible as one: `visual` is null and
 * NOTHING stands in for it. No placeholder, no generated cover, no first line
 * of the manuscript rendered as art. A Work without a chosen image simply does
 * not have one yet.
 */

export type VisualKind = 'cover' | 'inspiration';

export interface WorkVisual {
  kind: VisualKind;
  mimeType: string;
  byteSize: number;
  chosenAt: string;
}

export type WorkVisualPhase = 'loading' | 'ready' | 'error';

export function useWorkVisual(workId: string | null) {
  const [phase, setPhase] = useState<WorkVisualPhase>('loading');
  const [visual, setVisual] = useState<WorkVisual | null>(null);
  const [src, setSrc] = useState<string | null>(null);
  /* Held so a replaced or removed image's URL is revoked rather than leaked —
     an object URL pins the bytes in memory until it is released. */
  const objectUrl = useRef<string | null>(null);

  const release = useCallback(() => {
    if (objectUrl.current) {
      URL.revokeObjectURL(objectUrl.current);
      objectUrl.current = null;
    }
    setSrc(null);
  }, []);

  const load = useCallback(async () => {
    if (!workId) {
      release();
      setVisual(null);
      setPhase('ready');
      return;
    }
    try {
      const meta = await apiFetch(`/api/sovereign/living-works/${workId}/visual`, { method: 'GET' });
      if (!meta.ok) {
        release();
        setVisual(null);
        setPhase(meta.status === 401 ? 'error' : 'ready');
        return;
      }
      const data = await meta.json();
      if (!data?.visual) {
        release();
        setVisual(null);
        setPhase('ready');
        return;
      }
      setVisual(data.visual as WorkVisual);

      const bytes = await apiFetch(`/api/sovereign/living-works/${workId}/visual/bytes`, {
        method: 'GET',
      });
      if (!bytes.ok) {
        /* Metadata without bytes: the Work has an image the Studio could not
           fetch. Reported as an error rather than as "no image chosen", which
           would be a different and false statement. */
        release();
        setPhase('error');
        return;
      }
      const blob = await bytes.blob();
      release();
      const url = URL.createObjectURL(blob);
      objectUrl.current = url;
      setSrc(url);
      setPhase('ready');
    } catch {
      release();
      setPhase('error');
    }
  }, [workId, release]);

  useEffect(() => {
    void load();
    return () => {
      if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
      objectUrl.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workId]);

  /** Choose or replace. `kind` is the writer's statement; there is no default. */
  const choose = useCallback(
    async (file: File, kind: VisualKind) => {
      if (!workId) throw new Error('No work');
      const body = new FormData();
      body.append('image', file);
      body.append('kind', kind);
      const res = await apiFetch(`/api/sovereign/living-works/${workId}/visual`, {
        method: 'POST',
        body,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        /* The server's own member-facing sentence, never a status code. */
        throw new Error(data?.error ?? 'Could not save that image.');
      }
      await load();
    },
    [workId, load],
  );

  const remove = useCallback(async () => {
    if (!workId) return;
    const res = await apiFetch(`/api/sovereign/living-works/${workId}/visual`, { method: 'DELETE' });
    if (!res.ok && res.status !== 404) {
      const data = await res.json().catch(() => null);
      throw new Error(data?.error ?? 'Could not remove that image.');
    }
    await load();
  }, [workId, load]);

  return { phase, visual, src, choose, remove, reload: load };
}
