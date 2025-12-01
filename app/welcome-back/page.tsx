'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Crown, Sparkles, ArrowRight } from 'lucide-react';
import { Holoflower } from '@/components/ui/Holoflower';

export default function WelcomeBackPage() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>('Kelly');
  const [greeting, setGreeting] = useState('Good morning');

  useEffect(() => {
    // Get user name from localStorage
    const betaUser = localStorage.getItem('beta_user');
    if (betaUser) {
      try {
        const userData = JSON.parse(betaUser);
        setUserName(userData.name || userData.username || 'Kelly');
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
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
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#A0C4C7] to-[#7FB5B3] flex flex-col items-center justify-center px-4">

      {/* Sacred Holoflower */}
      <div className="mb-16">
        <div className="w-32 h-32 mx-auto">
          <Holoflower size="xl" glowIntensity="medium" animate={true} />
        </div>
      </div>

      {/* Welcome Card */}
      <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 max-w-md w-full text-center mb-16">
        <p className="text-sm text-teal-800/70 font-light mb-2">
          {greeting}
        </p>
        <h1 className="text-2xl font-light text-teal-900 mb-3">
          Welcome back, {userName}
        </h1>
        <p className="text-sm text-teal-800/60 font-light">
          Your elements await
        </p>
      </div>

      {/* Continue Button */}
      <button
        onClick={() => {
          // Set flag to prevent MAIA page from redirecting back to welcome-back
          sessionStorage.setItem('welcome_back_complete', 'true');
          router.push('/maia');
        }}
        className="text-teal-800/80 font-medium tracking-wider text-sm hover:text-teal-900 transition-colors duration-300"
      >
        CONTINUE
      </button>

    </div>
  );
}