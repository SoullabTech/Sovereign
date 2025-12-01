'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Crown, Sparkles, ArrowRight } from 'lucide-react';
import { Holoflower } from '@/components/ui/Holoflower';

interface WelcomeBackPageProps {
  userName?: string;
  onContinue: () => void;
}

export default function WelcomeBackPage({ userName = "Kelly", onContinue }: WelcomeBackPageProps) {
  const [greeting, setGreeting] = useState('Good morning');

  useEffect(() => {
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
        onClick={onContinue}
        className="text-teal-800/80 font-medium tracking-wider text-sm hover:text-teal-900 transition-colors duration-300"
      >
        CONTINUE
      </button>

    </div>
  );
}