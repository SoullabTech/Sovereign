'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Holoflower } from '@/components/ui/Holoflower';
import { betaSession } from '@/lib/auth/betaSession';

/**
 * OAuth Success Page
 *
 * Receives session data from OAuth callback, stores in localStorage,
 * and redirects to appropriate destination.
 */
export default function OAuthSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Completing sign in...');

  useEffect(() => {
    const memberId = searchParams.get('memberId');
    const username = searchParams.get('username');
    const name = searchParams.get('name');
    const onboarded = searchParams.get('onboarded') === 'true';
    const onboardingStep = searchParams.get('onboardingStep') || 'begin';
    const isNew = searchParams.get('isNew') === 'true';
    const provider = searchParams.get('provider') || 'oauth';

    if (!memberId) {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
      setTimeout(() => router.push('/signin?error=oauth_no_session'), 2000);
      return;
    }

    // Store session in localStorage
    try {
      const sessionData = {
        id: memberId,
        username: username || undefined,
        name: name || undefined,
        onboarded,
        onboardingStep,
        provider,
        isNew,
        createdAt: new Date().toISOString(),
      };

      // Use betaSession to store
      betaSession.createSession(sessionData);

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
            'begin': '/begin',
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
    <main className="relative min-h-screen overflow-hidden flex items-center justify-center">
      {/* Background gradient */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            'linear-gradient(145deg, #f0fdf4 0%, #dcfce7 30%, #d1fae5 50%, #ccfbf1 70%, #cffafe 100%)',
        }}
      />

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
            <div className="w-12 h-12 mx-auto border-4 border-emerald-300 border-t-emerald-600 rounded-full" />
          )}
          {status === 'success' && (
            <div className="w-12 h-12 mx-auto bg-emerald-500 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
          {status === 'error' && (
            <div className="w-12 h-12 mx-auto bg-red-500 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          )}
        </motion.div>

        {/* Message */}
        <p className="text-xl font-light text-teal-800">{message}</p>
      </motion.div>
    </main>
  );
}
