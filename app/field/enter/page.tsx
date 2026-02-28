'use client';

/**
 * /field/enter — Field entry router
 *
 * Smart routing entry point for iOS/Capacitor Field mode.
 * Reads localStorage session state and routes accordingly:
 *
 *   - Onboarded + active session  → /field/talk
 *   - Onboarded, no session       → /field/talk (create session there)
 *   - Not onboarded               → /begin
 *   - No session data at all      → /begin
 *
 * Loop-guard: if this page is hit more than once in 10s, bail to /field/talk.
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function FieldEnterPage() {
  const router = useRouter();

  useEffect(() => {
    // STEP 1: Auth check always runs first — loop guard never overrides it
    const betaUser = localStorage.getItem('beta_user');
    const explorerId = localStorage.getItem('explorerId');
    const signupCompleted = localStorage.getItem('signup_completed');

    const hasAnySessionData =
      betaUser ||
      explorerId ||
      signupCompleted ||
      Object.keys(localStorage).some(
        (k) => k.startsWith('maia_') || k.startsWith('explorer') || k.startsWith('beta')
      );

    // Fresh install — no auth data at all → onboarding
    if (!hasAnySessionData) {
      console.log('[Field/enter] Fresh install — routing to /begin');
      router.replace('/begin');
      return;
    }

    // STEP 2: Onboarding state check
    let onboarded = false;
    if (betaUser) {
      try {
        const userData = JSON.parse(betaUser);
        onboarded = !!userData.onboarded;
      } catch {
        // ignore parse error
      }
    }
    // Legacy check
    if (!onboarded) {
      onboarded = localStorage.getItem('betaOnboardingComplete') === 'true';
    }

    if (!onboarded) {
      console.log('[Field/enter] Not onboarded — routing to /begin');
      router.replace('/begin');
      return;
    }

    // STEP 3: Onboarded — route to /field/talk
    // Loop guard only applies here (auth is confirmed; guard prevents redirect storms
    // between /field/enter and /field/talk if something breaks in talk's mount)
    const LOOP_KEY = 'field_enter_last_visit';
    const LOOP_GUARD_MS = 10_000;
    const now = Date.now();
    const lastVisit = Number(localStorage.getItem(LOOP_KEY) || '0');
    localStorage.setItem(LOOP_KEY, String(now));

    if (now - lastVisit < LOOP_GUARD_MS) {
      // Already routed here recently — still go to /field/talk (auth is confirmed above)
      console.log('[Field/enter] Loop guard — re-routing confirmed-authed user to /field/talk');
    } else {
      console.log('[Field/enter] Onboarded member — routing to /field/talk');
    }
    router.replace('/field/talk');
  }, [router]);

  // Render nothing while routing
  return (
    <div
      className="h-screen w-screen flex items-center justify-center bg-stone-950"
      aria-label="Loading"
    >
      <div className="w-2 h-2 rounded-full bg-amber-600/60 animate-pulse" />
    </div>
  );
}
