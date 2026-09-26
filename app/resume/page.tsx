'use client';

/**
 * /resume — Universal Onboarding Recovery Route
 *
 * The "you can't get lost here" escape hatch.
 *
 * Use this link in:
 *   - Support emails ("click here to continue")
 *   - Welcome-back banners
 *   - Magic link emails as a fallback ("if the button didn't work, try /resume")
 *   - Any error state that says "try again"
 *
 * What it does:
 *   1. Tries to fetch the member's live profile (via session cookie)
 *   2. Runs getNextOnboardingStep() on the result
 *   3. Redirects to the correct next step
 *   4. If not authenticated → /begin (new user) or /signin (returning user prompt)
 *
 * Never shows a broken state. Always has a next action.
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Holoflower } from '@/components/ui/Holoflower';
import { getNextOnboardingStep } from '@/lib/onboarding/state';
import { trackOnboarding } from '@/lib/onboarding/telemetry';

type Phase = 'checking' | 'redirecting' | 'unauthenticated';

export default function ResumePage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('checking');
  const [label, setLabel] = useState('Finding your place…');

  useEffect(() => {
    trackOnboarding({ event: 'onboarding_resumed', path: '/resume' });

    fetch('/api/members/profile', { credentials: 'include' })
      .then(async (res) => {
        if (res.status === 401) {
          // Not authenticated — check localStorage for a hint
          try {
            const stored = localStorage.getItem('beta_user');
            if (stored) {
              const u = JSON.parse(stored);
              if (u.id && !u.id.startsWith('local_')) {
                // Has a stale session — send to signin to re-authenticate
                setPhase('unauthenticated');
                setTimeout(() => router.push('/signin?reason=session_expired&next=/resume'), 1200);
                return;
              }
            }
          } catch { /* ignore */ }
          // No local session hint — new user
          setPhase('unauthenticated');
          setTimeout(() => router.push('/signin'), 1200);
          return;
        }

        if (!res.ok) throw new Error(`profile ${res.status}`);

        const data = await res.json();
        const target = getNextOnboardingStep({
          onboarded: data.onboarded,
          onboarding_step: data.onboardingStep,
        });

        trackOnboarding({
          event: 'onboarding_resumed',
          memberId: data.id,
          path: target.path,
          metadata: { phase: target.phase },
        });

        setLabel(target.label);
        setPhase('redirecting');
        setTimeout(() => router.push(target.path), 900);
      })
      .catch(() => {
        // Network error — fall back to begin
        setPhase('unauthenticated');
        setTimeout(() => router.push('/signin'), 1000);
      });
  }, [router]);

  return (
    <div className="min-h-[100dvh] bg-soullab-core flex flex-col items-center justify-center px-6">

      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
        className="mb-10"
      >
        <div className="w-28 h-28 mx-auto">
          <Holoflower size="xl" glowIntensity="medium" animate={true} />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3 }}
        className="text-center"
      >
        {phase === 'unauthenticated' ? (
          <>
            <p className="text-white text-lg font-light mb-2">Taking you to sign in…</p>
            <p className="text-slate-400 text-sm font-light">We'll bring you right back.</p>
          </>
        ) : phase === 'redirecting' ? (
          <>
            <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white text-lg font-light mb-1">{label}</p>
            <p className="text-slate-400 text-sm font-light">Taking you there now…</p>
          </>
        ) : (
          <>
            <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white text-base font-light">Finding your place…</p>
          </>
        )}
      </motion.div>
    </div>
  );
}
