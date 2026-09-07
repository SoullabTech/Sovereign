'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';

/**
 * The image a writer chose for a Work.
 *
 * ── Why an object URL and not an <img src> ────────────────────────────────
 * An <img> element cannot carry a header, so on iOS the request would arrive
 * with no credential — the Capacitor cookie trap, entered through a tag rather
 * than a fetch. The bytes are read with apiFetch and rendered from an object
 * URL, which authenticates identically on web and in the WebView.
 *
 * ── ⚠️ Why there is a module-level cache ──────────────────────────────────
 * Not an optimization. Studio Home defines `Card` inside its own render body,
 * so every HomeView render produces a NEW component type and React unmounts
 * and remounts the whole card subtree. Tied to mount, this hook refetched every
 * Work's metadata AND bytes on every keystroke in the search field — the room
 * flickering under the writer's own typing.
 *
 * Hoisting the visual components out was necessary and not sufficient: a
 * remounted parent remounts its children whatever scope they were declared in.
 * The fix that actually holds is to stop tying the fetch to mount. The cache
 * also collapses the duplicate request when one Work appears in two places at
 * once, which the hero and the shelf genuinely do.
 *
 * Lifetime: an entry lives until the writer changes that Work's image, when
 * `invalidate` revokes the URL and drops it. Nothing else revokes — a hook
 * unmounting must NOT revoke a URL other mounted components are still showing,
 * which is the bug this shape is easy to write by accident.
 *
 * ⛔ Absence is a real state: `visual` is null and NOTHING stands in for it. No
 * placeholder, no generated cover, no first page rendered as art.
 */

export type VisualKind = 'cover' | 'inspiration';

export interface WorkVisual {
  kind: VisualKind;
  mimeType: string;
  byteSize: number;
  chosenAt: string;
}

export type WorkVisualPhase = 'loading' | 'ready' | 'error';

interface Entry {
  visual: WorkVisual | null;
  src: string | null;
  phase: WorkVisualPhase;
}

const cache = new Map<string, Entry>();
/** In-flight reads, so two mounts of one Work make one request, not two. */
const inflight = new Map<string, Promise<Entry>>();

function invalidate(workId: string) {
  const entry = cache.get(workId);
  if (entry?.src) URL.revokeObjectURL(entry.src);
  cache.delete(workId);
  inflight.delete(workId);
}

async function read(workId: string): Promise<Entry> {
  const meta = await apiFetch(`/api/sovereign/living-works/${workId}/visual`, { method: 'GET' });
  if (!meta.ok) {
    /* 401 is an error; anything else here means the Studio could not read a
       visual, which is not the same as the writer not having chosen one. */
    return { visual: null, src: null, phase: meta.status === 401 ? 'error' : 'ready' };
  }
  const data = await meta.json();
  if (!data?.visual) return { visual: null, src: null, phase: 'ready' };

  const bytes = await apiFetch(`/api/sovereign/living-works/${workId}/visual/bytes`, {
    method: 'GET',
  });
  if (!bytes.ok) {
    /* Metadata without bytes: the Work HAS an image the Studio could not fetch.
       Reported as an error rather than as "no image chosen", which would be a
       different and false statement. */
    return { visual: data.visual as WorkVisual, src: null, phase: 'error' };
  }
  const blob = await bytes.blob();
  return { visual: data.visual as WorkVisual, src: URL.createObjectURL(blob), phase: 'ready' };
}

function load(workId: string): Promise<Entry> {
  const cached = cache.get(workId);
  if (cached) return Promise.resolve(cached);

  const existing = inflight.get(workId);
  if (existing) return existing;

  const pending = read(workId)
    .catch<Entry>(() => ({ visual: null, src: null, phase: 'error' }))
    .then((entry) => {
      cache.set(workId, entry);
      inflight.delete(workId);
      return entry;
    });
  inflight.set(workId, pending);
  return pending;
}

export function useWorkVisual(workId: string | null) {
  const [entry, setEntry] = useState<Entry>(
    () => (workId ? cache.get(workId) : undefined) ?? { visual: null, src: null, phase: 'loading' },
  );

  const refresh = useCallback(async () => {
    if (!workId) {
      setEntry({ visual: null, src: null, phase: 'ready' });
      return;
    }
    setEntry(await load(workId));
  }, [workId]);

  useEffect(() => {
    let live = true;
    if (!workId) {
      setEntry({ visual: null, src: null, phase: 'ready' });
      return;
    }
    const cached = cache.get(workId);
    if (cached) {
      setEntry(cached);
      return;
    }
    void load(workId).then((next) => {
      if (live) setEntry(next);
    });
    return () => {
      live = false;
    };
    /* ⛔ No revoke on unmount. The URL belongs to the cache, and revoking it
       here would blank the image in every other place the same Work appears. */
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
      invalidate(workId);
      await refresh();
    },
    [workId, refresh],
  );

  const remove = useCallback(async () => {
    if (!workId) return;
    const res = await apiFetch(`/api/sovereign/living-works/${workId}/visual`, { method: 'DELETE' });
    if (!res.ok && res.status !== 404) {
      const data = await res.json().catch(() => null);
      throw new Error(data?.error ?? 'Could not remove that image.');
    }
    invalidate(workId);
    await refresh();
  }, [workId, refresh]);

  return {
    phase: entry.phase,
    visual: entry.visual,
    src: entry.src,
    choose,
    remove,
    reload: refresh,
  };
}
