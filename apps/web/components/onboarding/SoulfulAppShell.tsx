'use client';

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Copy } from '@/lib/copy/MaiaCopy';
import { Sparkles, ArrowRight, Heart } from 'lucide-react';

type OnboardingStep = 'welcome' | 'first-entry' | 'active' | 'timeline-unlocked' | 'search-unlocked';

interface SoulfulAppShellProps {
  userId: string;
  children: React.ReactNode;
}

export default function SoulfulAppShell({ userId, children }: SoulfulAppShellProps) {
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const onboardingComplete = localStorage.getItem(`onboarding_complete_${userId}`);
    const entryCount = parseInt(localStorage.getItem('journal_entry_count') || '0');

    // Auto-complete onboarding for development to access consciousness gateways directly
    if (!onboardingComplete) {
      localStorage.setItem(`onboarding_complete_${userId}`, 'true');
      setShowWelcome(false);
      setStep('first-entry');
    } else if (entryCount === 0) {
      setStep('first-entry');
    } else if (entryCount < 3) {
      setStep('active');
    } else if (entryCount < 5) {
      setStep('timeline-unlocked');
    } else {
      setStep('search-unlocked');
    }
  }, [userId]);

  const completeOnboarding = () => {
    localStorage.setItem(`onboarding_complete_${userId}`, 'true');
    setShowWelcome(false);
    setStep('first-entry');
  };

  const dismissWelcome = () => {
    localStorage.setItem(`onboarding_complete_${userId}`, 'true');
    setShowWelcome(false);
  };

  return (
    <>
      {children}

      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-md z-[100] flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 20 }}
              className="bg-gradient-to-br from-[#0A0E27] to-[#1A1F3A] rounded-3xl p-8 max-w-lg w-full text-center shadow-2xl border border-[#FFD700]/30"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', damping: 15 }}
                className="flex justify-center mb-6"
              >
                <div className="relative">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FFD700] via-amber-500 to-orange-500 flex items-center justify-center"
                  >
                    <Sparkles className="w-10 h-10 text-[#0A0E27]" />
                  </motion.div>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 rounded-full bg-[#FFD700]/20 blur-xl"
                  />
                </div>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-bold mb-4 text-white"
              >
                {Copy.welcome}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-neutral-300 mb-6 leading-relaxed"
              >
                {Copy.introPrompt}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-3"
              >
                <button
                  onClick={completeOnboarding}
                  className="w-full py-3 bg-gradient-to-r from-[#FFD700] to-amber-600 text-[#0A0E27] rounded-full font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-[#FFD700]/25 transition-all"
                >
                  <Sparkles className="w-5 h-5" />
                  {Copy.buttons.startJournaling}
                  <ArrowRight className="w-5 h-5" />
                </button>

                <button
                  onClick={dismissWelcome}
                  className="w-full py-3 border border-neutral-700 text-neutral-300 rounded-full font-medium hover:bg-neutral-800/50 transition-colors"
                >
                  {Copy.buttons.maybeLater}
                </button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-6 flex items-center justify-center gap-2 text-xs text-neutral-500"
              >
                <Heart className="w-3 h-3" />
                <span>Your journey is sacred. Your words are safe.</span>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function useOnboardingStep(userId: string): OnboardingStep {
  const [step, setStep] = useState<OnboardingStep>('welcome');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateStep = () => {
      const onboardingComplete = localStorage.getItem(`onboarding_complete_${userId}`);
      const entryCount = parseInt(localStorage.getItem('journal_entry_count') || '0');

      if (!onboardingComplete) {
        setStep('welcome');
      } else if (entryCount === 0) {
        setStep('first-entry');
      } else if (entryCount < 3) {
        setStep('active');
      } else if (entryCount < 5) {
        setStep('timeline-unlocked');
      } else {
        setStep('search-unlocked');
      }
    };

    updateStep();

    const interval = setInterval(updateStep, 2000);
    return () => clearInterval(interval);
  }, [userId]);

  return step;
}

export function shouldShowFeature(feature: 'timeline' | 'search' | 'voice', userId: string): boolean {
  if (typeof window === 'undefined') return false;

  const entryCount = parseInt(localStorage.getItem('journal_entry_count') || '0');
  const voiceUsed = localStorage.getItem('voice_used') === 'true';

  switch (feature) {
    case 'timeline':
      return entryCount >= 3;
    case 'search':
      return entryCount >= 5;
    case 'voice':
      return voiceUsed || entryCount >= 1;
    default:
      return false;
  }
}