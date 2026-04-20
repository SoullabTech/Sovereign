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
    // SIGNOUT LATCH: If user explicitly signed out, route to signin immediately
    // This prevents iOS WebView restore from bypassing explicit signout
    const signedOut = localStorage.getItem('maia_signed_out') === '1';
    if (signedOut) {
      console.log('[NAV] /welcome-back -> /signin (reason: signout latch active)');
      // Use router.push (client-side) — window.location.replace causes full reload
      // → index.html → /enter → loop on Capacitor iOS.
      router.push('/signin');
      return;
    }

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
        <p className="text-base text-slate-300/80 font-light mb-8 leading-relaxed whitespace-pre-line">
          {message}
        </p>
      );
    } else {
      const message = userName
        ? `Hi, ${userName}.\nWhen you sign in, MAIA will remember where you left off and what you were here for.`
        : 'When you sign in, MAIA will remember where you left off and what you were here for.';

      return (
        <p className="text-base text-slate-300/80 font-light mb-8 leading-relaxed whitespace-pre-line">
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
      <div className="min-h-[100dvh] bg-soullab-core flex flex-col items-center justify-center px-4">
        <div className="mb-16">
          <div className="w-32 h-32 mx-auto">
            <Holoflower size="xl" glowIntensity="medium" animate={true} theme="dark" />
          </div>
        </div>
        <div className="text-slate-400/70 font-light">
          Detecting consciousness state...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-soullab-core flex flex-col items-center justify-center px-4">

      {/* Sacred Holoflower */}
      <div className="mb-16">
        <div className="w-32 h-32 mx-auto">
          <Holoflower size="xl" glowIntensity="medium" animate={true} theme="dark" />
        </div>
      </div>

      {/* Welcome Card - Privacy-safe messaging for signed-out users */}
      <div
        className="rounded-3xl p-8 text-center max-w-lg w-full mb-8"
        style={{
          background: 'linear-gradient(165deg, rgba(15, 29, 50, 0.8), rgba(10, 22, 40, 0.6))',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(30, 58, 95, 0.5)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(30, 58, 95, 0.3)',
        }}
      >
        <h1 className="text-3xl font-extralight text-white/80 mb-6 tracking-[0.2em]">
          Welcome back to Soullab
        </h1>

        {getWelcomeMessage()}

        {/* Sign In Button */}
        <motion.button
          onClick={handleSignIn}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full p-4 rounded-xl mb-4 bg-maia-navy-700 hover:bg-maia-navy-600 text-white transition-all duration-300 shadow-lg"
        >
          <div className="font-medium text-lg">
            Sign In
          </div>
        </motion.button>

        {/* Start Fresh Link */}
        <button
          onClick={handleStartFresh}
          className="text-slate-400/70 text-sm font-light hover:text-slate-300 transition-colors duration-300"
        >
          {userName ? `Not ${userName}? Start fresh` : 'Not you? Start fresh'}
        </button>
      </div>

    </div>
  );
}

export default function WelcomeBackPage() {
  return (
    <Suspense fallback={<div className="min-h-[100dvh] bg-soullab-core flex items-center justify-center text-slate-400/70">Loading welcome page...</div>}>
      <WelcomeBackContent />
    </Suspense>
  );
}