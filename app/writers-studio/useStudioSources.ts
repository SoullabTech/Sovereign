'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';

export type SourceStatus = 'extracting' | 'draft' | 'reviewed' | 'error';
export type SourceKind = 'typed_text' | 'typed_doc' | 'handwritten_image' | 'scanned_pdf';

export interface StudioSource {
  id: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  sourceKind: SourceKind;
  transcriptionStatus: SourceStatus;
  createdAt: string;
  updatedAt: string;
}

export type StudioSourcesPhase = 'loading' | 'ready' | 'unauthorized' | 'error';

export function useStudioSources() {
  const [phase, setPhase] = useState<StudioSourcesPhase>('loading');
  const [sources, setSources] = useState<StudioSource[]>([]);

  const load = useCallback(async () => {
    try {
      const res = await apiFetch('/api/writers-studio/sources', { method: 'GET' });
      if (res.status === 401) {
        setPhase('unauthorized');
        return;
      }
      if (!res.ok) {
        setPhase('error');
        return;
      }
      const body = await res.json();
      setSources(Array.isArray(body.sources) ? body.sources : []);
      setPhase('ready');
    } catch {
      setPhase('error');
    }
  }, []);

  useEffect(() => { void load(); }, [load]);
  return { phase, sources, reload: load };
}
