'use client';

/**
 * Magic Link Success — Server-Authoritative Recovery Page
 *
 * Strategy:
 * 1. Immediately hydrate localStorage from URL params (iOS/native compat, no delay)
 * 2. Concurrently fetch fresh member state from the server (profile API)
 * 3. Use server's onboarding step to determine the final redirect destination
 *    (server truth beats URL params — handles cross-device and stale-param cases)
 * 4. If server fetch fails (no cookie, network issue), fall back to URL param redirect
 *
 * This page is the "always safe" handoff point after any magic link redemption.
 * It can recover state even when the user opened the link in a different browser.
 */

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Holoflower } from '@/components/ui/Holoflower';
import { getNextOnboardingStep } from '@/lib/onboarding/state';

// ─── Inner content ────────────────────────────────────────────────────────────

function MagicLinkSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [phase, setPhase] = useState<'hydrating' | 'verifying' | 'redirecting' | 'error'>('hydrating');
  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    if (!searchParams) return;

    const memberId = searchParams.get('member_id');
    const username  = searchParams.get('username') || '';
    const name      = searchParams.get('name') || '';
    const onboarded = searchParams.get('onboarded') === 'true';
    const fallbackRedirect = searchParams.get('redirect') || '/maia';

    if (!memberId) {
      setPhase('error');
      return;
    }

    const resolvedName = name || username || 'Friend';
    setDisplayName(resolvedName);

    // ── Step 1: Hydrate localStorage immediately (native/iOS compat) ──────────
    // This lets native clients (which can't read HttpOnly cookies) work correctly.
    // We use URL params here because this is the initial state — server verification
    // below will correct the routing if params are stale.
    try {
      const user = {
        id: memberId,
        memberId,
        username,
        name: resolvedName,
        preferredName: resolvedName,
        onboarded,
      };
      localStorage.setItem('beta_user', JSON.stringify(user));
      localStorage.setItem('memberId', memberId);
      localStorage.setItem('explorerId', memberId);
      localStorage.setItem('explorerName', resolvedName);
      localStorage.setItem('explorerPreferredName', resolvedName);
      localStorage.setItem('betaOnboardingComplete', onboarded ? 'true' : 'false');
      localStorage.setItem('signup_completed', 'true');
      localStorage.setItem('maia_session_version', '2');
    } catch {
      // localStorage blocked (private mode) — session cookies still work
    }

    // ── Step 2: Fetch authoritative state from server ──────────────────────────
    // The magic-link GET handler already set session cookies on this response.
    // The profile API reads those cookies → returns live onboarding state.
    // This is what handles cross-device: even if URL params are wrong, server wins.
    setPhase('verifying');

    fetch('/api/members/profile', { credentials: 'include' })
      .then(async (res) => {
        if (!res.ok) throw new Error(`profile ${res.status}`);
        const data = await res.json();
        const serverTarget = getNextOnboardingStep({
          onboarded: data.onboarded,
          onboarding_step: data.onboardingStep,
        });

        // Sync localStorage with authoritative server state
        try {
          const existing = JSON.parse(localStorage.getItem('beta_user') || '{}');
          localStorage.setItem('beta_user', JSON.stringify({
            ...existing,
            onboarded: data.onboarded,
            username: data.username || existing.username,
            name: data.name || existing.name,
          }));
          localStorage.setItem('betaOnboardingComplete', data.onboarded ? 'true' : 'false');
        } catch { /* ignore */ }

        setPhase('redirecting');
        setTimeout(() => router.push(serverTarget.path), 800);
      })
      .catch(() => {
        // Server fetch failed — fall back to URL param redirect (server already computed it)
        console.warn('[magic-link-success] Profile fetch failed, using URL param redirect');
        setPhase('redirecting');
        setTimeout(() => router.push(fallbackRedirect), 800);
      });
  }, [searchParams, router]);

  // ── Render ────────────────────────────────────────────────────────────────

  const greeting = displayName ? `Welcome${phase === 'redirecting' ? `, ${displayName}` : ''}` : 'Welcome';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center"
    >
      {phase === 'error' ? (
        <>
          <div className="w-12 h-12 bg-amber-100/60 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-amber-600 text-2xl">!</span>
          </div>
          <p className="text-teal-900 font-light mb-4">Something went wrong with that link.</p>
          <button
            onClick={() => router.push('/signin')}
            className="px-6 py-2 rounded-xl bg-teal-700 text-white text-sm font-medium hover:bg-teal-800 transition"
          >
            Try again
          </button>
        </>
      ) : phase === 'redirecting' ? (
        <>
          <div className="w-12 h-12 bg-emerald-100/60 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-emerald-600 text-2xl">✓</span>
          </div>
          <p className="text-teal-900 font-light tracking-wide text-lg">{greeting}</p>
          <p className="text-teal-700/60 text-sm mt-2">Taking you in…</p>
        </>
      ) : (
        <>
          <div className="animate-spin w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-teal-900 font-light tracking-wide">
            {phase === 'hydrating' ? 'Signing you in…' : 'Checking your progress…'}
          </p>
        </>
      )}
    </motion.div>
  );
}

// ─── Page shell ───────────────────────────────────────────────────────────────

export default function MagicLinkSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#A0C4C7] to-[#7FB5B3] flex flex-col items-center justify-center px-4">
      <div className="mb-8 z-10 relative">
        <div className="w-32 h-32 flex items-center justify-center">
          <Holoflower size="lg" glowIntensity="medium" animate={true} />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="rounded-2xl p-8 shadow-2xl border max-w-md w-full text-center"
        style={{
          background: 'linear-gradient(145deg, rgba(255,255,255,0.18), rgba(110,231,183,0.05), rgba(255,255,255,0.15))',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 0 60px rgba(251,191,36,0.3), 0 0 100px rgba(245,158,11,0.2)',
        }}
      >
        <Suspense fallback={
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-teal-900 font-light tracking-wide">Signing you in…</p>
          </div>
        }>
          <MagicLinkSuccessContent />
        </Suspense>
      </motion.div>
    </div>
  );
}
