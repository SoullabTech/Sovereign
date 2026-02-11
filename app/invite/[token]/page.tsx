'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiFetch } from '@/lib/http/apiBase';

type ResolveResponse =
  | { valid: true; targetType: string; targetId: string; role: string; expiresAt: string; full: boolean; requiresLogin: boolean }
  | { valid: false; reason: string };

export default function InviteLandingPage() {
  const router = useRouter();
  const params = useParams<{ token: string }>();
  const token = useMemo(() => String(params?.token || ''), [params]);

  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [resolve, setResolve] = useState<ResolveResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch(`/api/field-invites/resolve?token=${encodeURIComponent(token)}`);
        const json = (await res.json()) as ResolveResponse;
        if (cancelled) return;
        setResolve(json);
        setState('ready');
      } catch {
        if (cancelled) return;
        setErr('Could not load invite.');
        setState('error');
      }
    })();
    return () => { cancelled = true; };
  }, [token]);

  async function onAccept() {
    if (!token) return;
    setAccepting(true);
    setErr(null);
    try {
      const res = await apiFetch('/api/field-invites/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      if (res.status === 401) {
        setErr('Please sign in to enter.');
        setAccepting(false);
        return;
      }
      if (res.status === 409) {
        setErr('This space is full right now.');
        setAccepting(false);
        return;
      }
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setErr((j as Record<string, string>)?.error || 'Could not accept invite.');
        setAccepting(false);
        return;
      }

      const j = await res.json();
      router.push(j.redirectTo);
    } catch {
      setErr('Could not accept invite.');
      setAccepting(false);
    }
  }

  const roleLabel =
    resolve && 'valid' in resolve && resolve.valid
      ? resolve.role === 'participant' ? 'Participant' : resolve.role === 'quiet' ? 'Quiet' : 'Witness'
      : '';

  return (
    <div className="min-h-screen bg-[#1a1a2e] text-slate-100">
      <div className="mx-auto max-w-xl px-6 py-12">
        <div className="rounded-2xl border border-slate-700 bg-[#141428] p-6 shadow">
          <h1 className="text-xl font-semibold">You&apos;ve been invited into a private space.</h1>
          <p className="mt-3 text-slate-300">
            No replies required. No urgency. Speak if something is true.
          </p>

          {state === 'loading' && (
            <p className="mt-6 text-slate-400">Checking invite&hellip;</p>
          )}

          {state === 'error' && (
            <p className="mt-6 text-amber-200">{err || 'Invite unavailable.'}</p>
          )}

          {state === 'ready' && resolve && (
            <>
              {'valid' in resolve && resolve.valid ? (
                <>
                  <div className="mt-6 rounded-xl border border-slate-700 bg-[#101022] p-4">
                    <div className="text-sm text-slate-300">
                      Role: <span className="text-slate-100">{roleLabel}</span>
                    </div>
                    <div className="mt-1 text-xs text-slate-400">
                      Expires: {new Date(resolve.expiresAt).toLocaleString()}
                    </div>
                    {resolve.full && (
                      <div className="mt-3 text-sm text-amber-200">This space is full right now.</div>
                    )}
                  </div>

                  {err && <p className="mt-4 text-amber-200">{err}</p>}

                  <button
                    onClick={onAccept}
                    disabled={accepting || resolve.full}
                    className="mt-6 w-full rounded-xl bg-amber-500 px-4 py-3 font-medium text-black disabled:opacity-50"
                  >
                    {accepting ? 'Entering\u2026' : `Enter as ${roleLabel}`}
                  </button>
                </>
              ) : (
                <p className="mt-6 text-amber-200">
                  This invite is no longer available. ({(resolve as { reason?: string }).reason})
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
