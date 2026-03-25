// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import AuthLayout from '@/components/auth/AuthLayout';
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
    // SIGNOUT LATCH: If user explicitly signed out, route to signin immediately
    // This prevents iOS WebView restore from bypassing explicit signout
    const signedOut = localStorage.getItem('maia_signed_out') === '1';
    if (signedOut) {
      console.log('[NAV] /welcome-back -> /signin (reason: signout latch active)');
      router.push('/signin');
      return;
    }

    const sessionState = betaSession.restoreSession();

    if (sessionState.isAuthenticated && sessionState.user) {
      router.push('/maia');
      return;
    }

    setIsAuthenticated(false);

    const explorerId = localStorage.getItem('explorerId');
    const explorerName = localStorage.getItem('explorerName');

    if (!explorerId || !explorerName) {
      localStorage.setItem('explorerId', 'returning_user');
      localStorage.setItem('explorerName', 'Returning User');
      localStorage.setItem('betaOnboardingComplete', 'true');
    }

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
        <p className="text-base text-maia-ink-60 font-light mb-8 leading-relaxed whitespace-pre-line">
          {message}
        </p>
      );
    } else {
      const message = userName
        ? `Hi, ${userName}.\nWhen you sign in, MAIA will remember where you left off and what you were here for.`
        : 'When you sign in, MAIA will remember where you left off and what you were here for.';

      return (
        <p className="text-base text-maia-ink-60 font-light mb-8 leading-relaxed whitespace-pre-line">
          {message}
        </p>
      );
    }
  };

  const handleSignIn = () => {
    const signInUrl = isPartnerEntry
      ? `/signin?institution=${institution}&context=${context}`
      : '/signin';
    router.push(signInUrl);
  };

  const handleStartFresh = () => {
    localStorage.clear();
    router.push('/test-elemental');
  };

  if (isLoading) {
    return null; // AuthLayout's Suspense fallback handles loading
  }

  return (
    <div className="text-center">
      <h1 className="text-3xl font-extralight text-maia-ink-100 mb-6 tracking-[0.2em]">
        Welcome back to Soullab
      </h1>

      {getWelcomeMessage()}

      <motion.button
        onClick={handleSignIn}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full rounded-xl bg-maia-spice-500 hover:bg-maia-spice-400 text-white p-4 mb-4 font-medium text-lg transition-all duration-300 shadow-lg"
      >
        Sign In
      </motion.button>

      <button
        onClick={handleStartFresh}
        className="text-maia-spice-400/60 text-sm font-light hover:text-maia-spice-400 transition-colors duration-300"
      >
        {userName ? `Not ${userName}? Start fresh` : 'Not you? Start fresh'}
      </button>
    </div>
  );
}

export default function WelcomeBackPage() {
  return (
    <AuthLayout
      holoflowerSize="xl"
      holoflowerGlow="medium"
      holoflowerAnimate
      cardWidth="lg"
      loadingText="Detecting consciousness state..."
    >
      <WelcomeBackContent />
    </AuthLayout>
  );
}
