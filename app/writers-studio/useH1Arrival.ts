'use client';

/**
 * H1-COHORT-GATE-01 · the Studio's view of H1 admission.
 *
 * Starts UNRESOLVED (no H1 authority) and settles once from
 * GET /api/writers-studio/h1-arrival/admission. Loading, 401, any non-2xx,
 * a malformed body, a network error and a timeout all settle closed. Nothing in
 * the URL, storage, or a client-side member id is consulted.
 */
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import { H1_UNRESOLVED, settleH1Admission, type H1Admission } from './h1Arrival';

export const H1_ADMISSION_PATH = '/api/writers-studio/h1-arrival/admission';
const TIMEOUT_MS = 5000;

export function useH1Arrival(): H1Admission {
  const [admission, setAdmission] = useState<H1Admission>(H1_UNRESOLVED);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    (async () => {
      let next: H1Admission;
      try {
        const res = await apiFetch(H1_ADMISSION_PATH, { cache: 'no-store', signal: controller.signal });
        let body: unknown = null;
        try { body = await res.json(); } catch { body = null; }
        next = settleH1Admission({ kind: 'response', ok: res.ok, body });
      } catch {
        next = settleH1Admission({ kind: 'failed' });
      } finally {
        clearTimeout(timer);
      }
      if (!cancelled) setAdmission(next);
    })();
    return () => { cancelled = true; clearTimeout(timer); controller.abort(); };
  }, []);

  return admission;
}
