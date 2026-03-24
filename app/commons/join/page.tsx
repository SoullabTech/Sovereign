'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, KeyRound, LogIn } from 'lucide-react';
import Link from 'next/link';
import { apiFetch } from '@/lib/http/apiBase';
import { getLocalMemberId } from '@/lib/auth/getLocalMemberId';

function JoinCircleForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState(searchParams.get('token') ?? '');
  const [consentMode, setConsentMode] = useState<'manual' | 'not_now'>('manual');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Check if user is signed in
  useEffect(() => {
    const memberId = getLocalMemberId();
    setIsAuthenticated(!!memberId);
  }, []);

  // Build return URL preserving the token
  const returnUrl = typeof window !== 'undefined'
    ? `/commons/join${token ? `?token=${encodeURIComponent(token)}` : ''}`
    : '/commons/join';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token.trim()) return;

    // Re-check auth at submit time
    const memberId = getLocalMemberId();
    if (!memberId) {
      setIsAuthenticated(false);
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await apiFetch('/api/circles/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: token.trim(),
          consentMode,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        if (json.error === 'INVALID_INVITE') {
          setError('This invite link is invalid or has been revoked.');
        } else if (res.status === 401) {
          setIsAuthenticated(false);
        } else {
          setError(json.error || 'Failed to join circle');
        }
        return;
      }

      router.push(`/commons/circles/${json.circleId}`);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Link
        href="/commons/circles"
        className="mb-6 inline-flex items-center gap-2 text-sm text-maia-ink-40 transition-colors hover:text-maia-ink-60"
      >
        <ArrowLeft className="h-4 w-4" /> Back to circles
      </Link>

      <div className="mb-6 flex items-center gap-3">
        <KeyRound className="h-6 w-6 text-maia-spice-400" />
        <h1 className="text-2xl font-semibold text-maia-ink-100">Join a circle</h1>
      </div>
      <p className="text-sm text-maia-ink-60">
        Enter the invite token you received from a circle facilitator.
      </p>

      {/* Auth gate — show sign-in prompt for unauthenticated visitors */}
      {isAuthenticated === false && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 rounded-2xl border border-maia-spice-500/20 bg-maia-spice-500/5 p-6 text-center"
        >
          <LogIn className="mx-auto h-8 w-8 text-maia-spice-400 mb-3" />
          <h2 className="text-base font-semibold text-maia-ink-100 mb-2">
            Sign in to join this circle
          </h2>
          <p className="text-sm text-maia-ink-60 mb-5">
            You need a Soullab account to join a circle. Sign in or create one, then come back to this link.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href={`/signin?next=${encodeURIComponent(returnUrl)}`}
              className="w-full rounded-xl border border-maia-spice-500/30 bg-maia-spice-500/10 px-4 py-2.5 text-sm font-medium text-maia-spice-400 transition-colors hover:bg-maia-spice-500/20"
            >
              Sign in
            </Link>
            <Link
              href={`/begin?next=${encodeURIComponent(returnUrl)}`}
              className="w-full rounded-xl border border-maia-navy-700 px-4 py-2.5 text-sm font-medium text-maia-ink-60 transition-colors hover:border-maia-ink-40 hover:text-maia-ink-80"
            >
              New to Soullab? Begin your journey
            </Link>
          </div>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className={`mt-8 space-y-6 ${isAuthenticated === false ? 'opacity-40 pointer-events-none' : ''}`}>
        <div>
          <label htmlFor="token" className="block text-sm font-medium text-maia-ink-80">
            Invite token
          </label>
          <input
            id="token"
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Paste your invite token"
            className="mt-1.5 w-full rounded-xl border border-maia-navy-700 bg-maia-navy-850 px-4 py-2.5 text-sm text-maia-ink-100 placeholder:text-maia-ink-40 focus:border-maia-spice-500/50 focus:outline-none"
          />
        </div>

        <div className="rounded-2xl border border-maia-navy-700 bg-maia-navy-850 p-5">
          <h2 className="text-sm font-semibold text-maia-ink-100">Your privacy is the default</h2>
          <p className="mt-2 text-sm text-maia-ink-60">
            Circles don't grant anyone access to your inner work. Your Field, sessions, and MAIA
            conversations remain private unless you explicitly share something.
          </p>

          <div className="mt-4 space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="radio"
                name="consent"
                checked={consentMode === 'manual'}
                onChange={() => setConsentMode('manual')}
                className="mt-1 accent-maia-spice-400"
              />
              <div>
                <span className="text-sm font-medium text-maia-ink-100">
                  Manual sharing only (recommended)
                </span>
                <p className="mt-0.5 text-xs text-maia-ink-40">
                  You choose what to share, one item at a time. You can revoke anytime.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="radio"
                name="consent"
                checked={consentMode === 'not_now'}
                onChange={() => setConsentMode('not_now')}
                className="mt-1 accent-maia-spice-400"
              />
              <div>
                <span className="text-sm font-medium text-maia-ink-100">Not now</span>
                <p className="mt-0.5 text-xs text-maia-ink-40">
                  Join the circle without sharing anything. You can change this later.
                </p>
              </div>
            </label>
          </div>

          <p className="mt-4 text-xs text-maia-ink-40">
            Sanctuary is absolute. Nothing in Sanctuary can be shared or signaled.
          </p>
        </div>

        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}

        <button
          type="submit"
          disabled={saving || !token.trim()}
          className="w-full rounded-xl border border-maia-spice-500/30 bg-maia-spice-500/10 px-4 py-2.5 text-sm font-medium text-maia-spice-400 transition-colors hover:bg-maia-spice-500/20 disabled:opacity-50"
        >
          {saving ? 'Joining...' : 'Join circle'}
        </button>
      </form>
    </motion.div>
  );
}

export default function JoinCirclePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-maia-navy-950 via-maia-navy-900 to-maia-navy-950">
      <div className="mx-auto max-w-xl px-6 py-12">
        <Suspense fallback={
          <div className="py-20 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-maia-spice-400" />
          </div>
        }>
          <JoinCircleForm />
        </Suspense>
      </div>
    </div>
  );
}
