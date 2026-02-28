'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * /field/enter — Canonical iOS native app entry point
 *
 * Single deterministic router. Never lands on marketing.
 * Three outcomes only:
 *   1. Active session → /maia (straight to app)
 *   2. Known returning user (no current session) → /welcome-back
 *   3. Brand new device / fresh install → /begin
 *
 * Design rules:
 * - No API calls on mount (auth is localStorage-only at entry)
 * - No background processes initiated here
 * - No mic/audio init here
 * - Redirect loop guard via sessionStorage (one-shot per app session)
 * - Signout latch respected: if user explicitly signed out → /signin
 */
export default function FieldEnterPage() {
  const router = useRouter();

  useEffect(() => {
    // LOOP GUARD: redirect fires exactly once per app session
    const onceKey = 'maia_field_entry_once';
    if (sessionStorage.getItem(onceKey) === '1') {
      // Guard already tripped — route to safe fallback
      const betaUser = localStorage.getItem('beta_user');
      router.replace(betaUser ? '/maia' : '/signin');
      return;
    }
    sessionStorage.setItem(onceKey, '1');

    // SIGNOUT LATCH: user explicitly signed out → always go to signin
    if (localStorage.getItem('maia_signed_out') === '1') {
      router.replace('/signin');
      return;
    }

    // CASE 1: Active session → straight to app
    const betaUser = localStorage.getItem('beta_user');
    if (betaUser) {
      router.replace('/maia');
      return;
    }

    // CASE 2: Any prior MAIA data → returning user who is currently signed out
    const hasAnyPriorData =
      localStorage.getItem('betaOnboardingComplete') ||
      localStorage.getItem('explorerId') ||
      localStorage.getItem('explorerName') ||
      localStorage.getItem('maiaPermanentUser') ||
      localStorage.getItem('betaUserId') ||
      Object.keys(localStorage).some(
        (k) => k.includes('maia') || k.includes('explorer') || k.includes('beta')
      );

    if (hasAnyPriorData) {
      router.replace('/welcome-back');
      return;
    }

    // CASE 3: Clean device → new user onboarding
    router.replace('/begin');
  }, [router]);

  // Minimal holding state — no animation, no network calls
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0b0f1c',
      }}
    />
  );
}
