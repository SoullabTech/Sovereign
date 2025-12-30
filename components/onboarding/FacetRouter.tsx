'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { storeOnboardingContext, storeNeutralOnboardingContext } from '@/lib/services/onboardingMetadata';
import { ArrowRight, Heart, Compass, Briefcase, Users, HandHeart, Search, Brain, Droplets, Flame, Mountain, Wind, Sparkles as SparklesIcon } from 'lucide-react';
import { Holoflower } from '@/components/ui/Holoflower';

interface FacetRouterProps {
  partnerContext?: string;
  onComplete?: (profile: {
    reason: string;
    feeling: string;
    partnerContext?: string;
  }) => void;
}

export default function FacetRouter({ partnerContext = 'general', onComplete }: FacetRouterProps) {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [selectedFeeling, setSelectedFeeling] = useState<string>('');
  const [step, setStep] = useState<'reason' | 'feeling'>('reason');

  // Reason options (kept for reference - now used by MAIA)
  const reasonOptions = [
    {
      key: 'inner',
      icon: <Heart className="w-5 h-5" />,
      label: 'My inner life / feelings',
      description: 'Working with emotions, healing, personal growth'
    },
    {
      key: 'direction',
      icon: <Compass className="w-5 h-5" />,
      label: 'My direction / creativity',
      description: 'Finding purpose, creative expression, life direction'
    },
    {
      key: 'work',
      icon: <Briefcase className="w-5 h-5" />,
      label: 'My work or projects',
      description: 'Professional development, leadership, ventures'
    },
    {
      key: 'relationships',
      icon: <Users className="w-5 h-5" />,
      label: 'My relationships',
      description: 'Family dynamics, connection patterns, communication'
    },
    {
      key: 'support',
      icon: <HandHeart className="w-5 h-5" />,
      label: 'The people I support',
      description: 'Helping others, teaching, healing, caregiving'
    },
    {
      key: 'explore',
      icon: <Search className="w-5 h-5" />,
      label: 'Just exploring',
      description: 'Curious about consciousness, open to discovery'
    }
  ];

  // Feeling options (mapped to elements behind the scenes)
  const feelingOptions = [
    {
      key: 'air',
      element: 'air',
      icon: <Brain className="w-5 h-5" />,
      label: 'My head is busy.',
      description: 'Lots of thoughts, hard to slow down.'
    },
    {
      key: 'water',
      element: 'water',
      icon: <Droplets className="w-5 h-5" />,
      label: 'My feelings are strong.',
      description: 'A lot is moving in my heart.'
    },
    {
      key: 'fire',
      element: 'fire',
      icon: <Flame className="w-5 h-5" />,
      label: 'I feel wired and tired.',
      description: 'I have energy, but I\'m kind of worn out too.'
    },
    {
      key: 'earth',
      element: 'earth',
      icon: <Mountain className="w-5 h-5" />,
      label: 'I feel heavy or flat.',
      description: 'Low energy, hard to get going.'
    },
    {
      key: 'neutral',
      element: 'neutral',
      icon: <SparklesIcon className="w-5 h-5" />,
      label: 'It\'s hard to say.',
      description: 'I\'m not sure, or it keeps changing.'
    }
  ];

  const handleReasonSelect = (reason: string) => {
    setSelectedReason(reason);
    setStep('feeling');
  };

  const handleFeelingSelect = (feeling: string) => {
    setSelectedFeeling(feeling);

    // Store onboarding context for MAIA's first contact
    storeOnboardingContext(
      selectedReason as any,
      feeling as any,
      partnerContext
    );

    // Complete the facet selection
    if (onComplete) {
      onComplete({
        reason: selectedReason,
        feeling: feeling,
        partnerContext: partnerContext
      });
    }
  };

  const handleOptOut = () => {
    // Store neutral onboarding context for MAIA's first contact
    storeNeutralOnboardingContext(partnerContext);

    // Set neutral/general profile and skip to Sacred Soul Induction
    if (onComplete) {
      onComplete({
        reason: 'explore',
        feeling: 'neutral',
        partnerContext: 'general'
      });
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* DUNE aesthetic background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#A0C4C7] via-[#7FB5B3] to-[#6EE7B7]" />

      {/* Animated particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-gradient-to-br from-[#6B7280]/40 to-[#D97706]/30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${2 + Math.random() * 3}px`,
              height: `${2 + Math.random() * 3}px`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <div className="max-w-2xl w-full">

          <AnimatePresence mode="wait">

            {/* Step 1: Reason Selection */}
            {step === 'reason' && (
              <motion.div
                key="reason"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 1.2 }}
                className="space-y-8"
              >
                {/* Sacred Holoflower */}
                <div className="w-20 h-20 mx-auto mb-10">
                  <Holoflower size="xl" glowIntensity="medium" animate={true} />
                </div>

                {/* Question Card */}
                <div
                  className="rounded-2xl p-8 shadow-2xl border"
                  style={{
                    background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.18), rgba(110, 231, 183, 0.05), rgba(255, 255, 255, 0.15))',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 35px 70px -12px rgba(14, 116, 144, 0.4), 0 10px 20px rgba(14, 116, 144, 0.2), inset 0 1px 2px rgba(255, 255, 255, 0.3)',
                  }}
                >
                  <div className="text-center mb-8">
                    <h1 className="text-3xl font-extralight text-teal-900 mb-4 tracking-[0.2em]">
                      What are you here for today?
                    </h1>
                    <p className="text-base text-teal-800/70 font-light">
                      Pick the one that feels closest. You can always change direction later.
                    </p>
                  </div>

                  {/* Reason Options */}
                  <div className="space-y-3">
                    {reasonOptions.map((option) => (
                      <motion.button
                        key={option.key}
                        onClick={() => handleReasonSelect(option.key)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full p-4 rounded-xl text-left transition-all duration-300 group"
                        style={{
                          background: 'linear-gradient(to right, rgba(255, 255, 255, 0.1), rgba(110, 231, 183, 0.05))',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          backdropFilter: 'blur(4px)',
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-teal-700 group-hover:text-teal-600 transition-colors">
                            {option.icon}
                          </div>
                          <div>
                            <div className="text-teal-900 font-medium text-base">
                              {option.label}
                            </div>
                            <div className="text-teal-700/70 text-sm font-light">
                              {option.description}
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>

                  {/* Opt-out link */}
                  <div className="text-center mt-6">
                    <button
                      onClick={handleOptOut}
                      className="text-teal-700/70 text-sm font-light hover:text-teal-600 transition-colors duration-300 underline"
                    >
                      {partnerContext.includes('yale')
                        ? 'Use the standard Soullab experience instead'
                        : 'Skip this and take me to the main experience'
                      }
                    </button>
                  </div>
                </div>

                {/* Infinity Symbol */}
                <div className="flex justify-center">
                  <div className="text-white/70 text-4xl font-light">∞</div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Feeling Selection */}
            {step === 'feeling' && (
              <motion.div
                key="feeling"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 1.2 }}
                className="space-y-8"
              >
                {/* Sacred Holoflower */}
                <div className="w-20 h-20 mx-auto mb-10">
                  <Holoflower size="xl" glowIntensity="medium" animate={true} />
                </div>

                {/* Question Card */}
                <div
                  className="rounded-2xl p-8 shadow-2xl border"
                  style={{
                    background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.18), rgba(110, 231, 183, 0.05), rgba(255, 255, 255, 0.15))',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 35px 70px -12px rgba(14, 116, 144, 0.4), 0 10px 20px rgba(14, 116, 144, 0.2), inset 0 1px 2px rgba(255, 255, 255, 0.3)',
                  }}
                >
                  <div className="text-center mb-8">
                    <h1 className="text-3xl font-extralight text-teal-900 mb-4 tracking-[0.2em]">
                      How do you feel right now?
                    </h1>
                    <p className="text-base text-teal-800/70 font-light">
                      Just pick what's closest. There's no wrong answer.
                    </p>
                  </div>

                  {/* Feeling Options */}
                  <div className="space-y-3">
                    {feelingOptions.map((option) => (
                      <motion.button
                        key={option.key}
                        onClick={() => handleFeelingSelect(option.element)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full p-4 rounded-xl text-left transition-all duration-300 group"
                        style={{
                          background: 'linear-gradient(to right, rgba(255, 255, 255, 0.1), rgba(110, 231, 183, 0.05))',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          backdropFilter: 'blur(4px)',
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="text-teal-700 group-hover:text-teal-600 transition-colors mt-1">
                            {option.icon}
                          </div>
                          <div>
                            <div className="text-teal-900 font-medium text-base mb-1">
                              {option.label}
                            </div>
                            <div className="text-teal-700/70 text-sm font-light">
                              {option.description}
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>

                  {/* Opt-out link */}
                  <div className="text-center mt-6">
                    <button
                      onClick={handleOptOut}
                      className="text-teal-700/70 text-sm font-light hover:text-teal-600 transition-colors duration-300 underline"
                    >
                      {partnerContext.includes('yale')
                        ? 'Use the standard Soullab experience instead'
                        : 'Skip this and take me to the main experience'
                      }
                    </button>
                  </div>
                </div>

                {/* Infinity Symbol */}
                <div className="flex justify-center">
                  <div className="text-white/70 text-4xl font-light">∞</div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}