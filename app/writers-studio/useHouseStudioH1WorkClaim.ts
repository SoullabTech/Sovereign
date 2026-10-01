'use client';

import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import { readStudioWorkParam, type StudioSearchParams } from './situatedWork';

type AdmissionState = {
  claim: string | null;
  checked: boolean;
  admitted: boolean;
};

/**
 * Reflects the server's H1 decision and returns a Work claim only when admitted.
 * No claim means no admission request is needed. Every failure stays closed.
 */
export function useHouseStudioH1WorkClaim(search: StudioSearchParams | null): {
  workId: string | null;
  checking: boolean;
} {
  const claim = useMemo(() => (search ? readStudioWorkParam(search) : null), [search]);
  const [state, setState] = useState<AdmissionState>({
    claim: null,
    checked: claim === null,
    admitted: false,
  });

  useEffect(() => {
    let live = true;
    if (!claim) {
      setState({ claim: null, checked: true, admitted: false });
      return () => { live = false; };
    }

    setState({ claim, checked: false, admitted: false });
    (async () => {
      let admitted = false;
      try {
        const res = await apiFetch('/api/house-studio/admission', { method: 'GET' });
        if (res.ok) {
          const body = (await res.json().catch(() => null)) as { admitted?: unknown } | null;
          admitted = body?.admitted === true;
        }
      } catch {
        /* closed */
      } finally {
        if (live) setState({ claim, checked: true, admitted });
      }
    })();

    return () => { live = false; };
  }, [claim]);

  const current = state.claim === claim ? state : { claim, checked: false, admitted: false };
  return {
    workId: current.admitted ? claim : null,
    checking: Boolean(claim) && !current.checked,
  };
}
