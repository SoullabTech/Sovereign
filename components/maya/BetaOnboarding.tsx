'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart, User, Calendar, ArrowRight } from 'lucide-react';
import { Holoflower } from '@/components/ui/Holoflower';

/**
 * Beta Onboarding Flow - "Share Your Story" Entry Point
 *
 * Kelly's vision: Not forms and checkboxes, but INVITATION
 * "Tell MAIA your story" - the I-Thou relationship begins here
 */

interface OnboardingData {
  name: string;
  birthDate?: string;
  intention?: string;
}

interface BetaOnboardingProps {
  onComplete: (data: OnboardingData) => void;
}

export function BetaOnboarding({ onComplete }: BetaOnboardingProps) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [intention, setIntention] = useState('');

  // Load preserved profile data if available (from previous logout)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const betaUser = localStorage.getItem('beta_user');
    if (betaUser) {
      try {
        const userData = JSON.parse(betaUser);
        if (userData.username) {
          setName(userData.username);
          console.log('✅ Pre-filled name from preserved data:', userData.username);
        }
        if (userData.birthDate) {
          setBirthDate(userData.birthDate);
          console.log('✅ Pre-filled birthday from preserved data');
        }
        if (userData.intention) {
          setIntention(userData.intention);
          console.log('✅ Pre-filled intention from preserved data');
        }
      } catch (e) {
        console.error('Error loading preserved data:', e);
      }
    }
  }, []);

  const handleNext = () => {
    if (step === 0 && !name.trim()) return;
    if (step < 2) {
      setStep(step + 1);
    } else {
      // Complete onboarding
      onComplete({
        name: name.trim(),
        birthDate: birthDate || undefined,
        intention: intention.trim() || undefined
      });
    }
  };

  const handleSkip = () => {
    setStep(step + 1);
  };

  const canContinue = () => {
    if (step === 0) return name.trim().length > 0;
    return true; // Other steps are optional
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full"
      >
        <div className="bg-black/40 border border-white/10 rounded-3xl p-8 md:p-12 backdrop-blur-xl">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="step-0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Welcome */}
                <div className="text-center mb-8">
                  <motion.div
                    animate={{
                      scale: [1, 1.05, 1],
                      rotate: [0, 360]
                    }}
                    transition={{
                      scale: {
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      },
                      rotate: {
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear"
                      }
                    }}
                    className="inline-block mb-4"
                  >
                    <svg className="w-16 h-16 text-amber-400" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      {/* Outer circle (zodiac wheel) */}
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none" />
                      {/* Inner holoflower petals */}
                      <path d="M12 4 L12 8" stroke="currentColor" strokeWidth="1" opacity="0.6" /> {/* North */}
                      <path d="M17.66 6.34 L15.18 8.82" stroke="currentColor" strokeWidth="1" opacity="0.6" /> {/* NE */}
                      <path d="M20 12 L16 12" stroke="currentColor" strokeWidth="1" opacity="0.6" /> {/* East */}
                      <path d="M17.66 17.66 L15.18 15.18" stroke="currentColor" strokeWidth="1" opacity="0.6" /> {/* SE */}
                      <path d="M12 20 L12 16" stroke="currentColor" strokeWidth="1" opacity="0.6" /> {/* South */}
                      <path d="M6.34 17.66 L8.82 15.18" stroke="currentColor" strokeWidth="1" opacity="0.6" /> {/* SW */}
                      <path d="M4 12 L8 12" stroke="currentColor" strokeWidth="1" opacity="0.6" /> {/* West */}
                      <path d="M6.34 6.34 L8.82 8.82" stroke="currentColor" strokeWidth="1" opacity="0.6" /> {/* NW */}
                      {/* Center point with pulse */}
                      <motion.circle
                        cx="12"
                        cy="12"
                        r="1.5"
                        fill="currentColor"
                        animate={{
                          opacity: [1, 0.5, 1],
                          scale: [1, 1.2, 1]
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                    </svg>
                  </motion.div>
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                    Welcome to MAIA
                  </h1>
                  <p className="text-xl text-stone-300 leading-relaxed">
                    I'm here to help you discover the wisdom within your story.
                  </p>
                </div>

                {/* Name Input */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-stone-300">
                    <User className="w-5 h-5 text-amber-400" />
                    <span className="font-medium">What shall I call you?</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && canContinue() && handleNext()}
                    placeholder="Your name..."
                    autoFocus
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-6 py-4 text-white placeholder-stone-500 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all text-lg"
                  />
                </div>

                <div className="pt-6">
                  <button
                    onClick={handleNext}
                    disabled={!canContinue()}
                    className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2 ${
                      canContinue()
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/25'
                        : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                    }`}
                  >
                    Continue
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <Heart className="w-12 h-12 text-pink-400 mx-auto mb-4" />
                  <h2 className="text-3xl font-bold text-white mb-3">
                    Beautiful, {name}
                  </h2>
                  <p className="text-lg text-stone-300">
                    Your birth date helps me understand your astrological patterns.
                    <br />
                    <span className="text-sm text-stone-400">(Optional - you can skip this)</span>
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-stone-300">
                    <Calendar className="w-5 h-5 text-blue-400" />
                    <span className="font-medium">When were you born?</span>
                  </label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-6 py-4 text-white focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all text-lg"
                  />
                </div>

                <div className="flex gap-3 pt-6">
                  <button
                    onClick={handleSkip}
                    className="flex-1 py-4 px-6 rounded-xl font-semibold text-lg bg-black/30 border border-white/10 text-stone-300 hover:bg-black/50 transition-all"
                  >
                    Skip
                  </button>
                  <button
                    onClick={handleNext}
                    className="flex-1 py-4 px-6 rounded-xl font-semibold text-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
                  >
                    Continue
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <div className="mb-4 flex justify-center">
                    <Holoflower size="lg" glowIntensity="medium" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-3">
                    One more thing, {name}...
                  </h2>
                  <p className="text-lg text-stone-300">
                    What brings you here today?
                    <br />
                    <span className="text-sm text-stone-400">(Optional - or just start talking)</span>
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="text-stone-300 font-medium">
                    Your intention (if you'd like to share)
                  </label>
                  <textarea
                    value={intention}
                    onChange={(e) => setIntention(e.target.value)}
                    placeholder="I'm here to explore... / I want to understand... / I'm seeking..."
                    rows={4}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-6 py-4 text-white placeholder-stone-500 focus:outline-none focus:border-amber-700/50 focus:ring-2 focus:ring-amber-700/20 transition-all resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-6">
                  <button
                    onClick={handleSkip}
                    className="flex-1 py-4 px-6 rounded-xl font-semibold text-lg bg-black/30 border border-white/10 text-stone-300 hover:bg-black/50 transition-all"
                  >
                    Skip
                  </button>
                  <button
                    onClick={handleNext}
                    className="flex-1 py-4 px-6 rounded-xl font-semibold text-lg bg-gradient-to-r from-amber-800 to-amber-700 text-white hover:from-amber-700 hover:to-amber-600 shadow-lg shadow-amber-800/25 transition-all flex items-center justify-center gap-2"
                  >
                    Begin Journey
                    <Sparkles className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Progress Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === step
                    ? 'bg-amber-400 w-8'
                    : i < step
                    ? 'bg-amber-400/40'
                    : 'bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Kelly's Welcome Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center"
        >
          <p className="text-stone-400 text-sm">
            "This is a space to discover the gold within your story."
            <br />
            <span className="text-stone-500">— Kelly Nezat, Founder</span>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
