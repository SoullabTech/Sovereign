'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';

/**
 * EARLY-FIELD-01 — reflect the server's admission decision; never make one.
 *
 * Starts CLOSED and opens only on an explicit `admitted: true` from
 * /api/early-field/admission. Loading, a network failure, a non-200, a
 * malformed body — every one of those stays closed. Nothing is read from the
 * URL, localStorage or any client flag, and nothing is written anywhere:
 * admission is asked for on each visit, not remembered.
 */
export function useEarlyFieldAdmission(): boolean {
  const [admitted, setAdmitted] = useState(false);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const res = await apiFetch('/api/early-field/admission', { method: 'GET' });
        if (!res.ok) return;
        const body = (await res.json().catch(() => null)) as { admitted?: unknown } | null;
        if (live && body?.admitted === true) setAdmitted(true);
      } catch {
        /* closed */
      }
    })();
    return () => {
      live = false;
    };
  }, []);

  return admitted;
}
