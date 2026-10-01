'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';

/** Reflect the verified server decision. Client state never creates admission. */
export function useLivingFieldR2Admission(): boolean {
  const [admitted, setAdmitted] = useState(false);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const res = await apiFetch('/api/living-field-r2/admission', { method: 'GET' });
        if (!res.ok) return;
        const body = (await res.json().catch(() => null)) as { admitted?: unknown } | null;
        if (live && body?.admitted === true) setAdmitted(true);
      } catch {
        /* fail closed */
      }
    })();
    return () => { live = false; };
  }, []);

  return admitted;
}
