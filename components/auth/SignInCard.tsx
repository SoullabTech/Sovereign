/**
 * SignInCard
 *
 * Glassmorphic sign-in card with biometric-first auth.
 * Hierarchy: Password → Passkey → OAuth → Magic Link
 */
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { biometricAuth } from '@/lib/auth/biometricAuth';
import { deviceTrust } from '@/lib/auth/deviceTrust';

type AuthView = 'main' | 'password' | 'username-help' | 'magic-link';

type Props = {
  onSuccess?: (payload: unknown) => void;
  redirectTo?: string;
};

export function SignInCard({ onSuccess, redirectTo = '/maia' }: Props) {
  const router = useRouter();
  const [view, setView] = useState<AuthView>('main');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bioAvailable, setBioAvailable] = useState(false);

  // Form fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const biometricLabel = useMemo(() => biometricAuth.getBiometricName(), []);

  useEffect(() => {
    (async () => {
      const avail = await biometricAuth.getAvailability();
      setBioAvailable(avail.available);
    })();
  }, []);

  function handleSuccess(payload: unknown) {
    onSuccess?.(payload);
    router.push(redirectTo);
  }

  async function trustDevice() {
    try {
      await deviceTrust.trustDevice(undefined, 'standard');
    } catch {
      // non-blocking
    }
  }

  async function handlePasskeySignIn() {
    setError(null);
    setLoading(true);
    try {
      const res = await biometricAuth.authenticate(username || undefined);
      if (!res.success) {
        setError(res.error || 'Passkey sign-in failed');
        return;
      }
      await trustDevice();
      handleSuccess(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Passkey sign-in failed');
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordSignIn() {
    if (!username || !password) {
      setError('Username and password required');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const r = await fetch('/api/members/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        setError(data?.error || 'Invalid username or password');
        return;
      }
      await trustDevice();
      handleSuccess(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign in failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleMagicLink() {
    if (!email) {
      setError('Email required');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await fetch('/api/members/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      // Always show sent (security - no email enumeration)
      setMagicLinkSent(true);
    } catch {
      setMagicLinkSent(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-3xl bg-white/30 backdrop-blur-xl shadow-xl ring-1 ring-white/30">
      <div className="px-8 pt-8 pb-7">
        <h2 className="text-center text-2xl font-semibold text-slate-800">
          Welcome back
        </h2>

        {error && (
          <div className="mt-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-800 ring-1 ring-red-500/20">
            {error}
          </div>
        )}

        {view === 'main' && (
          <>
            {/* PRIMARY ACTION: password */}
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setView('password')}
                className="w-full rounded-2xl bg-white/55 px-5 py-4 text-base font-semibold text-slate-800 shadow-sm ring-1 ring-white/40 hover:bg-white/65 active:bg-white/70 transition"
              >
                Use password
              </button>
              <p className="mt-2 text-center text-xs text-slate-700/80">
                Prefer passkeys? Use {biometricLabel || 'biometrics'} below.
              </p>
            </div>

            {/* SECONDARY: passkey */}
            {bioAvailable && (
              <div className="mt-5">
                <button
                  type="button"
                  onClick={handlePasskeySignIn}
                  disabled={loading}
                  className="w-full rounded-2xl bg-white/25 px-5 py-4 text-sm font-semibold text-slate-800 ring-1 ring-white/35 hover:bg-white/30 transition disabled:opacity-50"
                >
                  {loading ? 'Authenticating...' : `Use ${biometricLabel || 'Face ID or Touch ID'}`}
                </button>
                <p className="mt-2 text-center text-xs text-slate-700/70">
                  Fastest and safest — one tap sign-in
                </p>
              </div>
            )}

            {/* COLLAPSIBLE HELP */}
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setView('username-help')}
                className="mx-auto flex items-center gap-2 text-sm font-medium text-teal-800/90 hover:text-teal-900 transition"
              >
                <span className="inline-block">▾</span>
                Having trouble? Enter username
              </button>
            </div>

            {/* DIVIDER */}
            <div className="mt-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-white/40" />
              <div className="text-xs font-medium text-slate-700/70">
                or continue with
              </div>
              <div className="h-px flex-1 bg-white/40" />
            </div>

            {/* SOCIALS */}
            <div className="mt-4 flex justify-center gap-3">
              <a
                href="/api/auth/signin/google"
                aria-label="Continue with Google"
                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/35 ring-1 ring-white/35 hover:bg-white/45 transition text-lg font-medium text-slate-700"
              >
                G
              </a>
              <a
                href="/api/auth/signin/apple"
                aria-label="Continue with Apple"
                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/35 ring-1 ring-white/35 hover:bg-white/45 transition text-lg"
              >

              </a>
            </div>

            {/* EMAIL LINK */}
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setView('magic-link')}
                className="w-full rounded-2xl bg-teal-700/15 px-5 py-4 text-sm font-semibold text-teal-900 ring-1 ring-teal-700/20 hover:bg-teal-700/20 transition"
              >
                ✧ Email me a sign-in link
              </button>
            </div>

            {/* FOOTER LINKS */}
            <div className="mt-6 text-center">
              <a
                href="/recover"
                className="text-sm font-medium text-slate-800/80 hover:text-slate-900 transition"
              >
                Forgot your passkey or password?
              </a>
            </div>
          </>
        )}

        {view === 'password' && (
          <div className="mt-6 space-y-4">
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              autoComplete="username"
              className="w-full rounded-2xl bg-white/40 px-5 py-4 text-slate-800 placeholder-slate-500 ring-1 ring-white/30 outline-none focus:ring-white/50 transition"
            />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              type="password"
              autoComplete="current-password"
              className="w-full rounded-2xl bg-white/40 px-5 py-4 text-slate-800 placeholder-slate-500 ring-1 ring-white/30 outline-none focus:ring-white/50 transition"
            />
            <button
              type="button"
              onClick={handlePasswordSignIn}
              disabled={loading}
              className="w-full rounded-2xl bg-white/55 px-5 py-4 text-base font-semibold text-slate-800 shadow-sm ring-1 ring-white/40 hover:bg-white/65 active:bg-white/70 transition disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
            <button
              type="button"
              onClick={() => setView('main')}
              className="w-full text-sm text-slate-700/80 hover:text-slate-900 transition"
            >
              ← Back to options
            </button>
          </div>
        )}

        {view === 'username-help' && (
          <div className="mt-6 space-y-4">
            <p className="text-sm text-slate-700/80">
              Enter your username to help locate your passkey:
            </p>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              autoComplete="username"
              className="w-full rounded-2xl bg-white/40 px-5 py-4 text-slate-800 placeholder-slate-500 ring-1 ring-white/30 outline-none focus:ring-white/50 transition"
            />
            <button
              type="button"
              onClick={handlePasskeySignIn}
              disabled={loading || !bioAvailable}
              className="w-full rounded-2xl bg-white/55 px-5 py-4 text-base font-semibold text-slate-800 shadow-sm ring-1 ring-white/40 hover:bg-white/65 active:bg-white/70 transition disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : `Sign in with ${biometricLabel || 'passkey'}`}
            </button>
            <button
              type="button"
              onClick={() => setView('main')}
              className="w-full text-sm text-slate-700/80 hover:text-slate-900 transition"
            >
              ← Back to options
            </button>
          </div>
        )}

        {view === 'magic-link' && (
          <div className="mt-6 space-y-4">
            {magicLinkSent ? (
              <div className="rounded-2xl bg-teal-700/10 px-5 py-4 text-sm text-teal-900">
                If that email exists, a sign-in link is on the way. Check your inbox.
              </div>
            ) : (
              <>
                <p className="text-sm text-slate-700/80">
                  We'll email you a secure link to sign in instantly.
                </p>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  type="email"
                  autoComplete="email"
                  className="w-full rounded-2xl bg-white/40 px-5 py-4 text-slate-800 placeholder-slate-500 ring-1 ring-white/30 outline-none focus:ring-white/50 transition"
                />
                <button
                  type="button"
                  onClick={handleMagicLink}
                  disabled={loading || !email}
                  className="w-full rounded-2xl bg-teal-700/15 px-5 py-4 text-sm font-semibold text-teal-900 ring-1 ring-teal-700/20 hover:bg-teal-700/20 transition disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send sign-in link'}
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => {
                setView('main');
                setMagicLinkSent(false);
              }}
              className="w-full text-sm text-slate-700/80 hover:text-slate-900 transition"
            >
              ← Back to options
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
