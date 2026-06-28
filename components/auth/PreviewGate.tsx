'use client';

/**
 * PreviewGate — generalizes the Field Lab "honest invitation" preview pattern.
 *
 * Branches client-side on a single entitlement:
 *   - loading      → `loading` (a quiet placeholder by default)
 *   - signed out   → `signedOut`
 *   - not entitled → `preview`  (an honest invitation — never a tease, never an upsell)
 *   - entitled     → `children`
 *
 * This is a CLIENT render gate, NOT a security boundary. Surfaces that need real
 * enforcement also add a server `requireEntitlement()` check (lib/auth/entitlements).
 * Field Lab is — and stays — client-gated, exactly as before this extraction.
 *
 * It reads the session's entitlement set from /api/members/entitlements, whose
 * 401-when-signed-out semantics mirror the prior /api/members/tester check.
 */

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';

type GateState = 'loading' | 'signed-out' | 'preview' | 'granted';

interface PreviewGateProps {
  /** The entitlement key required to see `children`, e.g. "labs.fieldLab". */
  entitlement: string;
  /** Shown when the member lacks the entitlement — an honest invitation. */
  preview: React.ReactNode;
  /** Shown when there is no session. Defaults to nothing. */
  signedOut?: React.ReactNode;
  /** Shown while resolving. Defaults to the quiet Field-Lab placeholder. */
  loading?: React.ReactNode;
  children: React.ReactNode;
}

export function PreviewGate({
  entitlement,
  preview,
  signedOut = null,
  loading = <div className="text-[14px] text-stone-500">…</div>,
  children,
}: PreviewGateProps) {
  const [state, setState] = useState<GateState>('loading');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch('/api/members/entitlements', { method: 'GET' });
        if (res.status === 401) {
          if (!cancelled) setState('signed-out');
          return;
        }
        const json = await res.json().catch(() => ({}));
        if (cancelled) return;
        const set: string[] = Array.isArray(json.entitlements) ? json.entitlements : [];
        setState(set.includes(entitlement) ? 'granted' : 'preview');
      } catch {
        if (!cancelled) setState('preview');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [entitlement]);

  if (state === 'loading') return <>{loading}</>;
  if (state === 'signed-out') return <>{signedOut}</>;
  if (state === 'preview') return <>{preview}</>;
  return <>{children}</>;
}
