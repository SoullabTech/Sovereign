'use client';

/**
 * H1 — the admission FACT for a Studio Work claim. Transport and state only.
 *
 * H1-COHORT-GATE-01 · R2 (founder ruling 2026-10-01). This hook may fetch
 * admission and expose `{ admitted, resolved }`. It does NOT read `work=`, does
 * NOT decide whether a claim is exposed, and does NOT resolve a Work: that is
 * app/writers-studio/h1Arrival.ts alone (falsifier F11 — the hook must never
 * become a second semantic authority). The name is historical (#1551): it
 * supplies the fact a Work claim is decided by; it never holds the claim.
 *
 *   needed   whether the request carries a claim at all — computed by the seam
 *            (h1AdmissionNeeded). No claim → no request, as in #1551.
 *
 * Starts unresolved (no H1 authority). 401, any non-2xx, a malformed body, a
 * network error and a timeout all settle closed. Nothing in the URL, storage,
 * or a client-side member id is consulted.
 */
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import { H1_UNRESOLVED, settleH1Admission, type H1Admission } from './h1Arrival';

const TIMEOUT_MS = 5000;

export function useHouseStudioH1WorkClaim(needed: boolean): H1Admission {
  const [state, setState] = useState<{ needed: boolean; admission: H1Admission }>({
    needed: false,
    admission: H1_UNRESOLVED,
  });

  useEffect(() => {
    if (!needed) return;
    let live = true;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    setState({ needed: true, admission: H1_UNRESOLVED });
    (async () => {
      let next: H1Admission;
      try {
        const res = await apiFetch('/api/house-studio/admission', {
          method: 'GET', cache: 'no-store', signal: controller.signal,
        });
        const body = await res.json().catch(() => null);
        next = settleH1Admission({ kind: 'response', ok: res.ok, body });
      } catch {
        next = settleH1Admission({ kind: 'failed' });
      } finally {
        clearTimeout(timer);
      }
      if (live) setState({ needed: true, admission: next });
    })();
    return () => { live = false; clearTimeout(timer); controller.abort(); };
  }, [needed]);

  // No claim → no admission question → unresolved (no H1 authority). Admission is a
  // member-level fact, so a verdict for this member stays true across claims.
  return needed && state.needed ? state.admission : H1_UNRESOLVED;
}
