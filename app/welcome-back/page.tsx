// @ts-nocheck
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Crown, Sparkles, ArrowRight } from 'lucide-react';
import { Holoflower } from '@/components/ui/Holoflower';
import { betaSession } from '@/lib/auth/betaSession';

function WelcomeBackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [userName, setUserName] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Partner context from URL
  const institution = searchParams.get('institution');
  const context = searchParams.get('context');
  const isPartnerEntry = institution === 'yale' && context;

  useEffect(() => {
    const sessionState = betaSession.restoreSession();

    if (sessionState.isAuthenticated && sessionState.user) {
      // User is already authenticated - redirect to /maia immediately
      router.push('/maia');
      return;
    }

    // Expected case: signed-out user needs to sign in
    setIsAuthenticated(false);

    // Ensure user identity markers are set (in case old code deleted them)
    const explorerId = localStorage.getItem('explorerId');
    const explorerName = localStorage.getItem('explorerName');

    if (!explorerId || !explorerName) {
      // No markers found - this user came from root page but has no identity
      // Set default markers so they don't loop back to onboarding
      localStorage.setItem('explorerId', 'returning_user');
      localStorage.setItem('explorerName', 'Returning User');
      localStorage.setItem('betaOnboardingComplete', 'true');
    }

    // Try to get stored name for personalization (privacy-safe)
    try {
      const betaUser = localStorage.getItem('beta_user');
      if (betaUser) {
        const userData = JSON.parse(betaUser);
        if (userData.name) {
          setUserName(userData.name);
        }
      } else if (explorerName) {
        setUserName(explorerName);
      }
    } catch (e) {
      // Ignore parsing errors
    }

    setIsLoading(false);
  }, [router]);

  const getWelcomeMessage = () => {
    if (isPartnerEntry) {
      const contextNames = {
        'tsai': 'Tsai Center',
        'staff': 'Staff Wellbeing',
        'clinical': 'Clinical Research',
        'community': 'Community Programs',
        'research': institution === 'qri' ? 'Research' : 'Research',
        'collaboration': 'Collaboration',
        'applied': 'Applied Research'
      };
      const contextName = contextNames[context as keyof typeof contextNames] || (institution === 'qri' ? 'QRI' : 'Partner Context');
      const institutionName = institution === 'qri' ? 'QRI' : 'Yale';

      const message = userName
        ? `Hi, ${userName}.\nYou're entering through the ${institutionName} / ${contextName} path this time.\nWhen you sign in, MAIA can reflect with you on your projects, research, and inner life.`
        : `You're entering through the ${institutionName} / ${contextName} path.\nWhen you sign in, MAIA can reflect with you on your projects, research, and inner life.`;

      return (
        <p className="text-base text-teal-800/80 font-light mb-8 leading-relaxed whitespace-pre-line">
          {message}
        </p>
      );
    } else {
      const message = userName
        ? `Hi, ${userName}.\nWhen you sign in, MAIA will remember where you left off and what you were here for.`
        : 'When you sign in, MAIA will remember where you left off and what you were here for.';

      return (
        <p className="text-base text-teal-800/80 font-light mb-8 leading-relaxed whitespace-pre-line">
          {message}
        </p>
      );
    }
  };

  const handleSignIn = () => {
    // Preserve partner context through sign-in
    const signInUrl = isPartnerEntry
      ? `/signin?institution=${institution}&context=${context}`
      : '/signin';
    router.push(signInUrl);
  };

  const handleStartFresh = () => {
    // Clear localStorage and start completely fresh
    localStorage.clear();
    router.push('/test-elemental');
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#A0C4C7] to-[#7FB5B3] flex flex-col items-center justify-center px-4">
        <div className="mb-16">
          <div className="w-32 h-32 mx-auto">
            <Holoflower size="xl" glowIntensity="medium" animate={true} />
          </div>
        </div>
        <div className="text-teal-900/60 font-light">
          Detecting consciousness state...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#A0C4C7] to-[#7FB5B3] flex flex-col items-center justify-center px-4">

      {/* Sacred Holoflower */}
      <div className="mb-16">
        <div className="w-32 h-32 mx-auto">
          <Holoflower size="xl" glowIntensity="medium" animate={true} />
        </div>
      </div>

      {/* Welcome Card - Privacy-safe messaging for signed-out users */}
      <div
        className="rounded-2xl p-8 shadow-2xl border text-center max-w-lg w-full mb-8"
        style={{
          background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.18), rgba(110, 231, 183, 0.05), rgba(255, 255, 255, 0.15))',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 35px 70px -12px rgba(14, 116, 144, 0.4), 0 10px 20px rgba(14, 116, 144, 0.2), inset 0 1px 2px rgba(255, 255, 255, 0.3)',
        }}
      >
        <h1 className="text-3xl font-extralight text-teal-900 mb-6 tracking-[0.2em]">
          Welcome back to Soullab
        </h1>

        {getWelcomeMessage()}

        {/* Sign In Button */}
        <motion.button
          onClick={handleSignIn}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full p-4 rounded-xl mb-4 transition-all duration-300"
          style={{
            background: 'linear-gradient(to right, rgba(110, 231, 183, 0.3), rgba(127, 181, 179, 0.4))',
            border: '1px solid rgba(110, 231, 183, 0.4)',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div className="text-teal-900 font-medium text-lg">
            Sign In
          </div>
        </motion.button>

        {/* Start Fresh Link */}
        <button
          onClick={handleStartFresh}
          className="text-teal-700/70 text-sm font-light hover:text-teal-600 transition-colors duration-300"
        >
          {userName ? `Not ${userName}? Start fresh` : 'Not you? Start fresh'}
        </button>
      </div>

    </div>
  );
}

export default function WelcomeBackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-[#A0C4C7] to-[#7FB5B3] flex items-center justify-center text-teal-900">Loading welcome page...</div>}>
      <WelcomeBackContent />
    </Suspense>
  );
}