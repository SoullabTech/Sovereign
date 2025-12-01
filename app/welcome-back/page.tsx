'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Crown, Sparkles, ArrowRight } from 'lucide-react';
import { Holoflower } from '@/components/ui/Holoflower';
import { betaSession } from '@/lib/auth/betaSession';

export default function WelcomeBackPage() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>('Sacred Practitioner');
  const [greeting, setGreeting] = useState('Good morning');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check authentication status using betaSession
    const sessionState = betaSession.restoreSession();

    if (sessionState.isAuthenticated && sessionState.user) {
      // User is already authenticated - set up for brief welcome then auto-continue
      setIsAuthenticated(true);
      setUserName(sessionState.user.name || sessionState.user.username || 'Sacred Practitioner');

      // Auto-continue to MAIA after brief welcome (2 seconds)
      const timer = setTimeout(() => {
        sessionStorage.setItem('welcome_back_complete', 'true');
        router.push('/maia');
      }, 2000);

      // Cleanup timer on unmount
      return () => clearTimeout(timer);
    } else {
      // User is not authenticated - show sign in option
      setIsAuthenticated(false);
    }

    // Set greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good morning');
    } else if (hour < 18) {
      setGreeting('Good afternoon');
    } else {
      setGreeting('Good evening');
    }

    setIsLoading(false);
  }, [router]);

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

      {/* Welcome Card - Different content based on authentication */}
      <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 max-w-md w-full text-center mb-16">
        <p className="text-sm text-teal-800/70 font-light mb-2">
          {greeting}
        </p>

        {isAuthenticated ? (
          // Authenticated user - show brief welcome then auto-continue
          <>
            <h1 className="text-2xl font-light text-teal-900 mb-3">
              Welcome back, {userName}
            </h1>
            <p className="text-sm text-teal-800/60 font-light mb-4">
              Your elements await
            </p>
            <div className="text-xs text-teal-700/50 italic">
              Continuing to your sacred space...
            </div>
          </>
        ) : (
          // Non-authenticated user - show sign in option
          <>
            <h1 className="text-2xl font-light text-teal-900 mb-3">
              Welcome to Soullab
            </h1>
            <p className="text-sm text-teal-800/60 font-light">
              Your consciousness journey awaits
            </p>
          </>
        )}
      </div>

      {/* Action Button - Different behavior based on authentication */}
      {isAuthenticated ? (
        // For authenticated users, show that auto-continue is happening
        <div className="text-teal-800/60 font-light text-sm flex items-center gap-2">
          <motion.div
            className="w-1 h-1 bg-teal-700 rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1,
              repeat: Infinity
            }}
          />
          Preparing sacred space...
        </div>
      ) : (
        // For non-authenticated users, show sign in button
        <button
          onClick={() => router.push('/signin')}
          className="bg-transparent border border-teal-700/40 text-teal-800 py-3 px-8 rounded-full font-light tracking-wider text-sm hover:bg-teal-700/10 transition-all duration-300 flex items-center gap-2 group"
        >
          <span>Enter Sacred Space</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
        </button>
      )}

    </div>
  );
}