'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Holoflower } from '@/components/ui/Holoflower';
import { betaSession } from '@/lib/auth/betaSession';

/**
 * OAuth Success Content - inner component that uses useSearchParams
 */
function OAuthSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Completing sign in...');
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);

  useEffect(() => {
    if (!searchParams) return;

    // Check for error state first (ok=0 means OAuth failed)
    const ok = searchParams.get('ok');
    const code = searchParams.get('code');
    const detail = searchParams.get('detail');

    if (ok === '0') {
      setStatus('error');
      setErrorCode(code);
      setErrorDetail(detail);
      setMessage(`OAuth failed: ${code || 'Unknown error'}`);
      // Don't auto-redirect - let user see the error
      return;
    }

    const memberId = searchParams.get('memberId');
    const username = searchParams.get('username');
    const name = searchParams.get('name');
    const onboarded = searchParams.get('onboarded') === 'true';
    const onboardingStep = searchParams.get('onboardingStep') || 'begin';
    const isNew = searchParams.get('isNew') === 'true';
    const provider = searchParams.get('provider') || 'oauth';

    if (!memberId) {
      setStatus('error');
      setErrorCode('NO_MEMBER_ID');
      setMessage('Something went wrong. Please try again.');
      setTimeout(() => router.push('/signin?error=oauth_no_session'), 2000);
      return;
    }

    // Store session in localStorage
    try {
      const displayName = name || username || 'Friend';
      const sessionData = {
        id: memberId,
        username: username || '',
        name: displayName,
        preferredName: displayName,
        onboarded,
        onboardingStep,
        provider,
        isNew,
        createdAt: new Date().toISOString(),
        tier: 'free' as const,
      };

      // Store session using betaSession.setUser and additional localStorage keys
      betaSession.setUser(sessionData);

      // Also set the keys that other parts of the app check
      localStorage.setItem('explorerId', memberId);
      localStorage.setItem('explorerName', displayName);
      localStorage.setItem('explorerPreferredName', displayName);
      localStorage.setItem('betaOnboardingComplete', onboarded ? 'true' : 'false');
      localStorage.setItem('maia_session_version', '2');
      localStorage.setItem('signup_completed', 'true');

      // Clear signout latch - user has consciously signed in again
      localStorage.removeItem('maia_signed_out');
      localStorage.removeItem('maia_signed_out_at');

      setStatus('success');

      if (isNew) {
        setMessage('Welcome! Setting up your space...');
        // New users go through onboarding
        setTimeout(() => {
          const nextStep = onboardingStep === 'complete' ? '/maia' : `/${onboardingStep}`;
          router.push(nextStep);
        }, 1500);
      } else if (!onboarded) {
        setMessage('Welcome back! Resuming your journey...');
        // Returning user who hasn't finished onboarding
        setTimeout(() => {
          const stepMap: Record<string, string> = {
            'begin': '/signin',
            'test-elemental': '/test-elemental',
            'faq': '/faq',
            'onboarding': '/onboarding',
            'complete': '/maia',
          };
          router.push(stepMap[onboardingStep] || '/maia');
        }, 1500);
      } else {
        setMessage('Welcome back!');
        // Returning user who has completed onboarding
        setTimeout(() => router.push('/maia'), 1500);
      }
    } catch (error) {
      console.error('Failed to store session:', error);
      setStatus('error');
      setMessage('Failed to complete sign in. Please try again.');
      setTimeout(() => router.push('/signin?error=session_failed'), 2000);
    }
  }, [searchParams, router]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative z-10 text-center px-4"
    >
      {/* Holoflower */}
      <div className="mb-8 flex justify-center">
        <div className="w-24 h-24">
          <Holoflower variant="responsive" animate={true} />
        </div>
      </div>

      {/* Status icon */}
      <motion.div
        animate={
          status === 'processing'
            ? { rotate: 360 }
            : status === 'success'
            ? { scale: [1, 1.2, 1] }
            : {}
        }
        transition={
          status === 'processing'
            ? { duration: 2, repeat: Infinity, ease: 'linear' }
            : { duration: 0.5 }
        }
        className="mb-6"
      >
        {status === 'processing' && (
          <div className="w-10 h-10 mx-auto border-2 border-white/15 border-t-amber-300/80 rounded-full" />
        )}
        {status === 'success' && (
          <div className="w-10 h-10 mx-auto rounded-full border border-amber-300/40 bg-amber-300/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
        {status === 'error' && (
          <div className="w-10 h-10 mx-auto rounded-full border border-red-400/40 bg-red-400/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        )}
      </motion.div>

      {/* Message */}
      <p className="text-lg font-light text-slate-300">{message}</p>

      {/* Debug info for errors */}
      {status === 'error' && errorCode && (
        <div className="mt-6 p-4 bg-white/5 border border-red-400/25 rounded-lg text-left max-w-md mx-auto">
          <p className="text-sm font-mono text-red-300">
            <strong>Error Code:</strong> {errorCode}
          </p>
          {errorDetail && (
            <p className="text-sm font-mono text-red-300/80 mt-1">
              <strong>Detail:</strong> {errorDetail}
            </p>
          )}
          <button
            onClick={() => router.push('/signin')}
            className="mt-4 px-4 py-2 bg-white/10 border border-white/15 text-slate-200 rounded-lg text-sm hover:bg-white/15"
          >
            Return to Sign In
          </button>
        </div>
      )}
    </motion.div>
  );
}

/**
 * Loading fallback for Suspense
 */
function LoadingFallback() {
  return (
    <div className="relative z-10 text-center px-4">
      <div className="mb-8 flex justify-center">
        <div className="w-24 h-24">
          <Holoflower variant="responsive" animate={true} />
        </div>
      </div>
      <div className="mb-6">
        <div className="w-10 h-10 mx-auto border-2 border-white/15 border-t-amber-300/80 rounded-full animate-spin" />
      </div>
      <p className="text-lg font-light text-slate-300">Completing sign in...</p>
    </div>
  );
}

/**
 * OAuth Success Page
 *
 * Receives session data from OAuth callback, stores in localStorage,
 * and redirects to appropriate destination.
 */
export default function OAuthSuccessPage() {
  return (
    <main className="relative min-h-[100dvh] overflow-hidden flex items-center justify-center bg-soullab-core">
      {/* Field — same navy canvas as /signin and /maia, so the handoff between
          them reads as one continuous place rather than a flash of another app.
          The former teal/emerald gradient here was legacy and jarring. */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(58% 40% at 50% 12%, rgba(124,94,170,0.16), rgba(90,70,150,0.05) 40%, transparent 60%)',
        }}
      />
      <Suspense fallback={<LoadingFallback />}>
        <OAuthSuccessContent />
      </Suspense>
    </main>
  );
}
