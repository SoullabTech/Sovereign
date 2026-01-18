'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Holoflower } from '@/components/ui/Holoflower';

/**
 * Inner component that uses useSearchParams
 * Must be wrapped in Suspense for Next.js static rendering
 */
function MagicLinkSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Signing you in...');

  useEffect(() => {
    const memberId = searchParams.get('member_id');
    const username = searchParams.get('username');
    const name = searchParams.get('name');
    const onboarded = searchParams.get('onboarded') === 'true';
    const redirect = searchParams.get('redirect') || '/maia';

    if (!memberId) {
      setStatus('error');
      setMessage('Invalid sign-in link. Please try again.');
      setTimeout(() => router.push('/signin'), 3000);
      return;
    }

    try {
      // Set up localStorage session (matching signin page format)
      const displayName = name || username || 'Friend';

      const user = {
        id: memberId,
        username: username || '',
        name: displayName,
        preferredName: displayName,
        onboarded: onboarded,
      };

      localStorage.setItem('beta_user', JSON.stringify(user));
      localStorage.setItem('explorerId', memberId);
      localStorage.setItem('explorerName', displayName);
      localStorage.setItem('explorerPreferredName', displayName);
      localStorage.setItem('betaOnboardingComplete', onboarded ? 'true' : 'false');
      localStorage.setItem('maia_session_version', '2');
      localStorage.setItem('signup_completed', 'true');

      setStatus('success');
      setMessage(`Welcome back${name ? `, ${name}` : ''}!`);

      // Redirect after brief success message
      setTimeout(() => {
        router.push(redirect);
      }, 1500);
    } catch (err) {
      console.error('Magic link session setup error:', err);
      setStatus('error');
      setMessage('Something went wrong. Please try signing in again.');
      setTimeout(() => router.push('/signin'), 3000);
    }
  }, [searchParams, router]);

  return (
    <>
      {status === 'loading' && (
        <>
          <div className="animate-spin w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-teal-900 font-light tracking-wide">{message}</p>
        </>
      )}

      {status === 'success' && (
        <>
          <div className="w-12 h-12 bg-emerald-100/60 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-emerald-600 text-2xl">✓</span>
          </div>
          <p className="text-teal-900 font-light tracking-wide text-lg">{message}</p>
          <p className="text-teal-700/60 text-sm mt-2">Redirecting...</p>
        </>
      )}

      {status === 'error' && (
        <>
          <div className="w-12 h-12 bg-red-100/60 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">!</span>
          </div>
          <p className="text-red-800 font-light">{message}</p>
          <p className="text-teal-700/60 text-sm mt-2">Redirecting to sign in...</p>
        </>
      )}
    </>
  );
}

/**
 * Loading fallback for Suspense
 */
function LoadingFallback() {
  return (
    <>
      <div className="animate-spin w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full mx-auto mb-4" />
      <p className="text-teal-900 font-light tracking-wide">Signing you in...</p>
    </>
  );
}

/**
 * Magic Link Success Page
 *
 * This page is redirected to after a magic link is verified.
 * It sets up the localStorage session and redirects to the appropriate destination.
 */
export default function MagicLinkSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#A0C4C7] to-[#7FB5B3] flex flex-col items-center justify-center px-4">
      {/* Sacred Holoflower */}
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
          background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.18), rgba(110, 231, 183, 0.05), rgba(255, 255, 255, 0.15))',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 0 60px rgba(251, 191, 36, 0.3), 0 0 100px rgba(245, 158, 11, 0.2)',
        }}
      >
        <Suspense fallback={<LoadingFallback />}>
          <MagicLinkSuccessContent />
        </Suspense>
      </motion.div>
    </div>
  );
}
