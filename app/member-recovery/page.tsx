'use client';

/**
 * Password selection for an administrator-issued recovery link.
 * The raw token is in the URL FRAGMENT (not HTTP GET query), held in
 * component state only, and removed from the address bar on first load.
 */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { KeyRound, Lock, ShieldCheck } from 'lucide-react';

export default function MemberRecoveryPage() {
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [status, setStatus] = useState<'loading' | 'ready' | 'submitting' | 'complete' | 'invalid'>('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    const fragment = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const supplied = fragment.get('token');
    // Never keep a bearer token in browser history or the URL after arrival.
    if (window.location.hash) window.history.replaceState(null, '', window.location.pathname);
    if (!supplied || !/^[a-f0-9]{64}$/.test(supplied)) {
      setStatus('invalid');
      return;
    }
    setToken(supplied);
    setStatus('ready');
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!token || status !== 'ready') return;
    if (password !== confirmation) { setError('Passwords do not match.'); return; }
    if (Array.from(password).length < 12 || new TextEncoder().encode(password).length > 72) {
      setError('Choose at least 12 characters, up to 72 UTF-8 bytes.'); return;
    }
    setStatus('submitting');
    setError('');
    try {
      const res = await fetch('/api/members/admin-recovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
        body: JSON.stringify({ token, newPassword: password }),
      });
      if (!res.ok) {
        const result = await res.json().catch(() => ({}));
        throw new Error(result.error || 'Recovery link invalid or expired.');
      }
      setToken(null);
      setPassword('');
      setConfirmation('');
      setStatus('complete');
    } catch (err) {
      setPassword('');
      setConfirmation('');
      setToken(null); // Do not preserve a bearer after a failed submission.
      setStatus('invalid');
      setError(err instanceof Error ? err.message : 'Could not complete recovery.');
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#102821] via-[#173B33] to-[#274B47] px-5 py-12 text-slate-100">
      <div className="mx-auto max-w-md space-y-7 rounded-2xl border border-emerald-200/15 bg-slate-950/50 p-7 shadow-2xl">
        <header className="space-y-3">
          <div className="inline-flex rounded-xl bg-emerald-500/15 p-3"><KeyRound className="h-7 w-7 text-emerald-300" /></div>
          <h1 className="text-2xl font-semibold">Recover your Soullab access</h1>
          <p className="text-sm leading-relaxed text-slate-300">
            Your new password is private. A Soullab administrator does not need to see or choose it.
          </p>
        </header>
        {status === 'loading' && <p className="text-sm text-slate-300">Preparing your secure form…</p>}
        {status === 'invalid' && <div className="space-y-4" role="alert">
          <p className="rounded-lg border border-amber-500/40 bg-amber-950/30 p-4 text-sm text-amber-200">{error || 'This link is missing, invalid, used or expired. Request a new one from Soullab support.'}</p>
          <Link href="/signin" className="inline-flex text-sm text-emerald-300 underline">Return to sign in</Link>
        </div>}
        {status === 'complete' && <div role="status" className="space-y-4">
          <div className="flex items-center gap-2 text-emerald-300"><ShieldCheck className="h-5 w-5" /> Password updated</div>
          <p className="text-sm text-slate-200">Your previous sessions were revoked. Sign in again with your new password.</p>
          <Link href="/signin" className="inline-flex rounded-lg bg-emerald-500 px-4 py-2 font-medium text-slate-950">Go to sign in</Link>
        </div>}
        {(status === 'ready' || status === 'submitting') && <form onSubmit={submit} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="password" className="flex items-center gap-2 text-sm font-semibold"><Lock className="h-4 w-4" /> New password</label>
            <input id="password" type="password" autoComplete="new-password" required
              value={password} onChange={e => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-500 bg-slate-900 p-3 text-white focus:border-emerald-400"
              aria-describedby="password-help" />
            <p id="password-help" className="text-xs text-slate-400">At least 12 characters, at most 72 UTF-8 bytes.</p>
          </div>
          <div className="space-y-2">
            <label htmlFor="confirmation" className="text-sm font-semibold">Confirm password</label>
            <input id="confirmation" type="password" autoComplete="new-password" required
              value={confirmation} onChange={e => setConfirmation(e.target.value)}
              className="w-full rounded-lg border border-slate-500 bg-slate-900 p-3 text-white focus:border-emerald-400" />
          </div>
          {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}
          <button type="submit" disabled={status === 'submitting'}
            className="w-full rounded-lg bg-emerald-500 px-4 py-3 font-semibold text-slate-950 disabled:opacity-50">
            {status === 'submitting' ? 'Securing your account…' : 'Set my new password'}
          </button>
          <p className="text-xs text-slate-400">Each recovery link works once and expires automatically.</p>
        </form>}
      </div>
    </main>
  );
}
