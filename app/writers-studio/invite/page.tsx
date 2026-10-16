'use client';

import { Suspense, useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

type State = 'checking' | 'ready' | 'submitting' | 'complete' | 'invalid';

function InvitationForm() {
  const params = useSearchParams();
  const token = params?.get('token') || '';
  const [state, setState] = useState<State>('checking');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    if (!/^[0-9a-f]{64}$/.test(token)) { setState('invalid'); return; }
    fetch('/api/writers-studio/invite/setup?token=' + encodeURIComponent(token), {
      credentials: 'same-origin', cache: 'no-store',
    }).then(r => {
      if (active) setState(r.ok ? 'ready' : 'invalid');
    }).catch(() => { if (active) setState('invalid'); });
    return () => { active = false; };
  }, [token]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    if (password.length < 12 || password.length > 128) {
      setError('Choose a password between 12 and 128 characters.');
      return;
    }
    if (password !== confirm) { setError('The two passwords do not match.'); return; }
    setState('submitting');
    try {
      const res = await fetch('/api/writers-studio/invite/setup', {
        method: 'PUT', credentials: 'same-origin', cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      if (res.ok) { setPassword(''); setConfirm(''); setState('complete'); return; }
      if (res.status === 404) { setState('invalid'); return; }
      setError(res.status === 429 ? 'Too many attempts. Please contact your beta guide.'
        : 'Access setup could not be completed. Please contact your beta guide.');
      setState('ready');
    } catch {
      setError('Connection unavailable. Please try again.');
      setState('ready');
    }
  }

  return (
    <main className="min-h-[100dvh] bg-[#122925] text-[#f1f2e9] flex justify-center items-center px-5 py-12">
      <section className="w-full max-w-md rounded-2xl border border-[#87a69b]/30 bg-[#1c3831] p-7 sm:p-9 shadow-2xl">
        <p className="text-xs uppercase tracking-[.18em] text-[#b4cfb8]">Soullab · Writer's Studio</p>
        <h1 className="mt-4 text-3xl font-serif leading-tight">Your invitation</h1>
        {state === 'checking' && <p className="mt-5 text-[#dae4d9]">Checking your invitation…</p>}
        {state === 'invalid' && (
          <div className="mt-5">
            <p className="text-[#dae4d9]">This invitation is unavailable or has expired.</p>
            <p className="mt-3 text-sm text-[#b4cfb8]">Please contact the person who invited you for a new link.</p>
          </div>
        )}
        {state === 'complete' && (
          <div className="mt-5">
            <p className="text-[#dae4d9]">Your password is set. Sign in to review the beta participation terms before entering your writing room.</p>
            <Link className="mt-6 inline-block rounded-xl bg-[#b4cfb8] px-5 py-3 font-medium text-[#143128] hover:bg-[#d1e3d2]" href="/signin">Go to sign in</Link>
          </div>
        )}
        {(state === 'ready' || state === 'submitting') && (
          <>
            <p className="mt-4 text-[#dae4d9]">Create a password for your private beta account. After signing in, you can review the participation terms and decide whether to enter Writer’s Studio.</p>
            <form onSubmit={submit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="beta-pass" className="mb-2 block text-sm">Create password</label>
                <input id="beta-pass" type="password" autoComplete="new-password" minLength={12}
                  maxLength={128} required value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-[#acc8bc]/50 bg-[#0f2923] p-3 text-white outline-none focus:border-[#d1e3d2]" />
                <p className="mt-2 text-xs text-[#b4cfb8]">12 characters or more.</p>
              </div>
              <div>
                <label htmlFor="beta-confirm" className="mb-2 block text-sm">Confirm password</label>
                <input id="beta-confirm" type="password" autoComplete="new-password"
                  required value={confirm} onChange={e => setConfirm(e.target.value)}
                  className="w-full rounded-lg border border-[#acc8bc]/50 bg-[#0f2923] p-3 text-white outline-none focus:border-[#d1e3d2]" />
              </div>
              {error && <p role="alert" className="text-sm text-[#ffe2c2]">{error}</p>}
              <button type="submit" disabled={state === 'submitting'}
                className="w-full rounded-xl bg-[#b4cfb8] px-5 py-3 font-medium text-[#143128] hover:bg-[#d1e3d2] disabled:opacity-50">
                {state === 'submitting' ? 'Setting up…' : 'Set password and continue'}
              </button>
            </form>
          </>
        )}
      </section>
    </main>
  );
}

export default function WriterInvitationPage() {
  return <Suspense fallback={null}><InvitationForm /></Suspense>;
}
