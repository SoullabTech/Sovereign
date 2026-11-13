'use client';

/**
 * A Studio's own front door: invitation sign-up (STUDIO-A-LA-CARTE-01 Phase 3).
 *
 * Founder rulings: R1/R2 2026-11-12; invitation-gated 2026-11-13; carries Soullab branding (endorsed, "by Soullab")
 * 2026-11-13. MAIA is not offered here: at a Studio door MAIA stays off until the person connects to Soullab.
 *
 * Ordering invariant (Now What? arrival, Kelly ruling 2026-07-29): no account-creating field is shown until the
 * invitation has been checked. An existing member always has a path to sign in.
 *
 * Copy states facts only (MARKETING_CLAIM_DISCIPLINE): it promises no access the Studio's own gate has not granted.
 */
import { useState } from 'react';
import type { DoorwayId } from '@/lib/studios/doorways';

type Step = 'code' | 'account';

export function DoorwayJoin({ studio, studioName, studioPath }: { studio: DoorwayId; studioName: string; studioPath: string }) {
  const [step, setStep] = useState<Step>('code');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [signIn, setSignIn] = useState(false);
  const [busy, setBusy] = useState(false);
  const [createdNotSignedIn, setCreatedNotSignedIn] = useState(false);
  const signInHref = `/signin?next=${encodeURIComponent(studioPath)}`;

  async function checkCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch('/api/doorway/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studio, code }),
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok && body.valid === true) setStep('account');
      else if (res.ok) setError('That code doesn’t open this door. Check it with the person who invited you.');
      else setError('Something went wrong on our side. Please try again.');
    } catch {
      setError('Something went wrong on our side. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  async function register(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSignIn(false);
    setBusy(true);
    try {
      const res = await fetch('/api/doorway/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studio, code, name, email, password }),
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok && body.success && body.signedIn === false) {
        // The account exists but no session was made: say so, and offer sign-in, rather than bouncing them.
        setCreatedNotSignedIn(true);
        return;
      }
      if (res.ok && body.success) {
        try {
          localStorage.setItem('beta_user', JSON.stringify({ ...body.member, onboarded: true }));
        } catch { /* storage unavailable: the server session still holds */ }
        window.location.assign(body.next || studioPath);
        return;
      }
      setSignIn(!!body.signIn);
      setError(typeof body.error === 'string' ? body.error : 'Something went wrong on our side. Please try again.');
    } catch {
      setError('Something went wrong on our side. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  const field = 'w-full rounded-lg border border-slate-700/60 bg-black/20 px-4 py-3 text-slate-100 text-sm font-light placeholder:text-slate-600 focus:outline-none focus:border-amber-300/50';
  const button = 'w-full rounded-full border border-amber-300/40 px-4 py-3 text-sm font-light text-amber-100 transition-colors hover:bg-amber-300/10 disabled:opacity-50';

  return (
    <main className="relative min-h-screen bg-[#1A1513]">
      <div className="relative max-w-md mx-auto px-4 py-14">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_10%,rgba(196,164,110,0.10),transparent_70%)]" />
        <header className="relative flex flex-col items-center text-center space-y-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/Soullablogo.png" alt="Soullab" className="h-10 w-auto opacity-90" />
          <h1 className="text-slate-100 text-2xl font-extralight tracking-wide">{studioName}</h1>
          <p className="text-xs uppercase tracking-[0.45em] text-amber-200/60">by Soullab</p>
          <p className="text-slate-400 text-sm font-light leading-relaxed max-w-sm">
            {step === 'code'
              ? 'This door opens with an invitation code.'
              : 'Create your Soullab account to use with ' + studioName + '.'}
          </p>
        </header>

        {createdNotSignedIn ? (
          <div className="relative mt-10 space-y-4 text-center" role="status">
            <p className="text-slate-300 text-sm font-light leading-relaxed">
              Your account was created, but we couldn&rsquo;t sign you in just now. Please sign in with your email and
              password &mdash; here or at soullab.life.
            </p>
            <a className={button + ' inline-block'} href={signInHref}>Sign in</a>
          </div>
        ) : step === 'code' ? (
          <form onSubmit={checkCode} className="relative mt-10 space-y-4">
            <label className="block text-slate-400 text-xs font-light" htmlFor="doorway-code">Invitation code</label>
            <input id="doorway-code" className={field} value={code} onChange={(e) => setCode(e.target.value)}
              autoComplete="off" autoCapitalize="characters" spellCheck={false} required />
            {error && <p className="text-red-400 text-sm font-light" role="alert">{error}</p>}
            <button type="submit" className={button} disabled={busy || code.trim().length < 6}>
              {busy ? 'Checking…' : 'Continue'}
            </button>
          </form>
        ) : (
          <form onSubmit={register} className="relative mt-10 space-y-4">
            <input className={field} placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)}
              autoComplete="name" required />
            <input className={field} placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              autoComplete="email" required />
            <input className={field} placeholder="Password (8+ characters)" type="password" value={password}
              onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" minLength={8} required />
            {error && (
              <p className="text-red-400 text-sm font-light" role="alert">
                {error}{' '}
                {signIn && <a className="underline text-amber-200/80" href={signInHref}>Sign in</a>}
              </p>
            )}
            <button type="submit" className={button} disabled={busy}>
              {busy ? 'Creating your account…' : 'Create account'}
            </button>
            <p className="text-slate-500 text-xs font-light leading-relaxed text-center">
              This is your Soullab account. The same email and password also open {studioName} from soullab.life.
            </p>
          </form>
        )}

        <p className="relative mt-8 text-center text-slate-500 text-xs font-light">
          Already have a Soullab account? <a className="underline text-slate-300" href={signInHref}>Sign in</a>
        </p>
      </div>
    </main>
  );
}
