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
          <div className="w-12 h-12 mx-auto border-4 border-maia-navy-700 border-t-slate-300 rounded-full" />
        )}
        {status === 'success' && (
          <div className="w-12 h-12 mx-auto bg-emerald-500 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
        {status === 'error' && (
          <div className="w-12 h-12 mx-auto bg-amber-600 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        )}
      </motion.div>

      {/* Message */}
      <p className="text-xl font-light text-slate-200">{message}</p>

      {/* Debug info for errors */}
      {status === 'error' && errorCode && (
        <div className="mt-6 p-4 bg-amber-900/20 border border-amber-500/30 rounded-xl text-left max-w-md mx-auto">
          <p className="text-sm font-mono text-amber-300/90">
            <strong>Error Code:</strong> {errorCode}
          </p>
          {errorDetail && (
            <p className="text-sm font-mono text-amber-300/70 mt-1">
              <strong>Detail:</strong> {errorDetail}
            </p>
          )}
          <button
            onClick={() => router.push('/signin')}
            className="mt-4 px-4 py-2 bg-maia-navy-700 hover:bg-maia-navy-600 text-white rounded-xl text-sm transition-all"
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
        <div className="w-12 h-12 mx-auto border-4 border-maia-navy-700 border-t-slate-300 rounded-full animate-spin" />
      </div>
      <p className="text-xl font-light text-slate-200">Completing sign in...</p>
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
      <Suspense fallback={<LoadingFallback />}>
        <OAuthSuccessContent />
      </Suspense>
    </main>
  );
}
