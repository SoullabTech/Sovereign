'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';

export type LivingFieldR2AdmissionState = {
  admitted: boolean;
  resolved: boolean;
};

/**
 * Reflect the verified server decision. Client state never creates admission.
 * Resolution is explicit so the dashboard does not mount the canonical Three
 * surface and immediately replace it with R2 when the server answer arrives.
 */
export function useLivingFieldR2Admission(): LivingFieldR2AdmissionState {
  const [state, setState] = useState<LivingFieldR2AdmissionState>({ admitted: false, resolved: false });

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const res = await apiFetch('/api/living-field-r2/admission', { method: 'GET' });
        if (!res.ok) {
          if (live) setState({ admitted: false, resolved: true });
          return;
        }
        const body = (await res.json().catch(() => null)) as { admitted?: unknown } | null;
        if (live) setState({ admitted: body?.admitted === true, resolved: true });
      } catch {
        if (live) setState({ admitted: false, resolved: true });
      }
    })();
    return () => { live = false; };
  }, []);

  return state;
}
