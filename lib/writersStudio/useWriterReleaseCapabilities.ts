'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import type { WriterReleaseAuthority } from './releaseAuthority';

const HELD: WriterReleaseAuthority = Object.freeze({
  manifestId: 'writer-release-authority-unavailable',
  sourceIntakeReleased: false,
  importFormats: Object.freeze(['docx', 'pdf', 'epub', 'text'] as const),
  exportsCertified: Object.freeze({ pdf: false, epub: false }),
  permanentErasureCertified: false,
});

export interface WriterReleaseCapabilityState {
  readonly settled: boolean;
  readonly eligible: boolean;
  readonly authority: WriterReleaseAuthority;
}

function isAuthority(value: unknown): value is WriterReleaseAuthority {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const candidate = value as Partial<WriterReleaseAuthority>;
  return typeof candidate.manifestId === 'string' &&
    typeof candidate.sourceIntakeReleased === 'boolean' &&
    Array.isArray(candidate.importFormats) &&
    Boolean(candidate.exportsCertified) &&
    typeof candidate.exportsCertified?.pdf === 'boolean' &&
    typeof candidate.exportsCertified?.epub === 'boolean' &&
    typeof candidate.permanentErasureCertified === 'boolean';
}

export function useWriterReleaseCapabilities(): WriterReleaseCapabilityState {
  const [state, setState] = useState<WriterReleaseCapabilityState>({
    settled: false,
    eligible: false,
    authority: HELD,
  });

  useEffect(() => {
    let live = true;
    void apiFetch('/api/sovereign/writers-studio/beta-access', { method: 'GET' })
      .then(async (response) => {
        const body = await response.json().catch(() => ({})) as Record<string, unknown>;
        if (!live) return;
        const eligible = response.ok && body.eligible === true;
        setState({
          settled: true,
          eligible,
          authority: eligible && isAuthority(body.capabilities) ? body.capabilities : HELD,
        });
      })
      .catch(() => {
        if (live) setState({ settled: true, eligible: false, authority: HELD });
      });
    return () => { live = false; };
  }, []);

  return state;
}
