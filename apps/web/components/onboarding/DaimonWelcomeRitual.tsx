"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Flame, Droplets, Mountain, Wind, Sparkles } from "lucide-react";
import { MAIADaimonIntroduction } from "./MAIADaimonIntroduction";

interface DaimonWelcomeRitualProps {
  userId?: string;
  userName?: string;
  onComplete?: () => void;
}

interface ElementalPrompt {
  element: string;
  icon: React.ReactNode;
  prompt: string;
  color: string;
}

const elementalPrompts: ElementalPrompt[] = [
  {
    element: 'fire',
    icon: <Flame className="w-4 h-4" />,
    prompt: "What lights you up?",
    color: 'text-orange-300'
  },
  {
    element: 'water',
    icon: <Droplets className="w-4 h-4" />,
    prompt: "What moves you emotionally?",
    color: 'text-blue-300'
  },
  {
    element: 'earth',
    icon: <Mountain className="w-4 h-4" />,
    prompt: "What grounds you?",
    color: 'text-emerald-300'
  },
  {
    element: 'air',
    icon: <Wind className="w-4 h-4" />,
    prompt: "What thoughts keep returning?",
    color: 'text-slate-300'
  },
  {
    element: 'aether',
    icon: <Sparkles className="w-4 h-4" />,
    prompt: "What feels magical or connected?",
    color: 'text-amber-300'
  }
];

export function DaimonWelcomeRitual({ userId, userName = "Kelly", onComplete }: DaimonWelcomeRitualProps) {
  const [phase, setPhase] = useState<'intro' | 'daimon' | 'transitioning'>('intro');
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);

  // Cycle through elemental prompts
  useEffect(() => {
    if (phase === 'intro') {
      const interval = setInterval(() => {
        setCurrentPromptIndex((prev) => (prev + 1) % elementalPrompts.length);
      }, 3000); // Change every 3 seconds
      return () => clearInterval(interval);
    }
  }, [phase]);

  const handleWelcomeComplete = () => {
    setPhase('daimon');
  };

  const handleDaimonComplete = async () => {
    setPhase('transitioning');

    try {
      await fetch('/api/auth/complete-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, daimonIntroComplete: true })
      });
    } catch (error) {
      console.warn('Failed to mark intro complete:', error);
    }

    setTimeout(() => {
      if (onComplete) {
        onComplete();
      } else {
        window.location.href = '/maia';
      }
    }, 800);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Rich Teal Sacred Background - Deeper and more luxurious */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#A7D8D1] via-[#80CBC4] to-[#4DB6AC]" />

      {/* Sacred temple sunbeams filtering through */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-[2px] h-full bg-gradient-to-b from-[#fef3c7]/60 via-[#fef3c7]/20 to-transparent rotate-12 blur-sm" />
        <div className="absolute top-0 left-1/3 w-[3px] h-full bg-gradient-to-b from-[#f59e0b]/50 via-[#f59e0b]/15 to-transparent rotate-6 blur-sm" />
        <div className="absolute top-0 right-1/3 w-[2px] h-full bg-gradient-to-b from-[#fef3c7]/50 via-[#fef3c7]/15 to-transparent -rotate-6 blur-sm" />
        <div className="absolute top-0 right-1/4 w-[3px] h-full bg-gradient-to-b from-[#d97706]/40 via-[#d97706]/10 to-transparent -rotate-12 blur-sm" />
      </div>

      {/* Flowing spice particles - smaller and more amber */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-sm bg-gradient-to-br from-[#d97706]/60 to-[#92400e]/40"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${2 + Math.random() * 3}px`,
              height: `${2 + Math.random() * 3}px`,
            }}
            animate={{
              y: [-20, 20],
              x: [-10, 10],
              opacity: [0.3, 0.8, 0.3],
              rotate: [0, 360],
            }}
            transition={{
              duration: 8 + Math.random() * 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      {/* Gentle, slow pulsing light field with amber warmth */}
      <motion.div
        animate={{
          opacity: [0.15, 0.4, 0.15],
          scale: [0.8, 1.2, 0.8]
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-amber-50/40 via-[#fef3c7]/25 to-[#E0F7FA]/15 to-transparent rounded-full blur-3xl"
      />

      {/* Ambient temple glow */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-[#fef3c7] rounded-full blur-[150px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-[#f59e0b] rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <div className="max-w-xl w-full">
          <AnimatePresence mode="wait">

            {phase === 'intro' && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.6 }}
                className="space-y-8"
              >
                {/* Pulsing holoflower with enhanced glow */}
                <motion.div
                  className="w-20 h-20 mx-auto mb-8 opacity-90"
                  animate={{
                    scale: [1, 1.05, 1],
                    opacity: [0.8, 1, 0.8]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <img src="/elementalHoloflower.svg" alt="MAIA" className="w-full h-full object-contain drop-shadow-lg" />
                </motion.div>

                {/* Sacred minimalist content container */}
                <div className="bg-gradient-to-b from-[#fef3c7]/15 to-[#f59e0b]/8 backdrop-blur-sm rounded-xl p-12 border border-[#d97706]/25 shadow-lg hover:border-[#92400e]/40 hover:shadow-xl transition-all duration-500 text-center">
                  <div
                    className="text-slate-700 text-xl leading-relaxed font-light tracking-wider space-y-8"
                    style={{
                      fontFamily: '"Cormorant Garamond", "EB Garamond", "Crimson Text", Georgia, serif',
                      letterSpacing: '0.1em'
                    }}
                  >
                    <p className="text-lg font-extralight text-slate-600 mb-2">Welcome {userName}</p>
                    <p className="text-2xl font-light">You create worlds</p>
                    <p>We've created this space for you</p>

                    {/* Scrolling elemental prompts */}
                    <div className="py-6 min-h-[80px] flex items-center justify-center">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={currentPromptIndex}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.8 }}
                          className="flex items-center gap-3"
                        >
                          <span className={`${elementalPrompts[currentPromptIndex].color} opacity-80`}>
                            {elementalPrompts[currentPromptIndex].icon}
                          </span>
                          <p
                            className="text-slate-600 text-base font-extralight italic"
                            style={{
                              fontFamily: '"Cormorant Garamond", "EB Garamond", "Crimson Text", Georgia, serif',
                              letterSpacing: '0.05em'
                            }}
                          >
                            {elementalPrompts[currentPromptIndex].prompt}
                          </p>
                        </motion.div>
                      </AnimatePresence>
                    </div>

                    <p
                      className="text-slate-600 text-sm mt-8 font-extralight"
                      style={{
                        letterSpacing: '0.12em'
                      }}
                    >
                      I am MAIA, here to collaborate
                    </p>
                    <p
                      className="text-slate-500 text-xs mt-4 font-extralight"
                      style={{
                        letterSpacing: '0.15em'
                      }}
                    >
                      This is Soullab
                    </p>
                  </div>
                </div>

                {/* Elegant raised amber button */}
                <div className="text-center">
                  <button
                    onClick={handleWelcomeComplete}
                    className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-b from-[#fef3c7]/20 to-[#f59e0b]/15 border border-[#d97706]/30 text-[#0f172a]/80 rounded-full font-light text-sm hover:border-[#92400e]/50 hover:bg-gradient-to-b hover:from-[#fef3c7]/30 hover:to-[#f59e0b]/20 hover:shadow-lg transition-all duration-300 backdrop-blur-sm"
                  >
                    Let's begin
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-center mt-8">
                  <p
                    className="text-white/60 text-2xl font-light tracking-widest"
                    style={{
                      fontFamily: '"Cormorant Garamond", "EB Garamond", "Crimson Text", Georgia, serif',
                      textShadow: '0 0 12px rgba(255,255,255,0.3)',
                      letterSpacing: '0.3em'
                    }}
                  >
                    ∞
                  </p>

                  {/* Anamnesis - Plato's wisdom on soul's eternal knowledge */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2, duration: 0.8 }}
                    className="mt-8 max-w-md mx-auto"
                  >
                    <p
                      className="text-white/40 text-xs leading-relaxed italic font-light"
                      style={{
                        fontFamily: '"Cormorant Garamond", "EB Garamond", "Crimson Text", Georgia, serif',
                        letterSpacing: '0.02em',
                        lineHeight: '1.6'
                      }}
                    >
                      "The soul is immortal and has seen all things, in this world and the world below. To learn is simply to remember."
                    </p>
                    <p
                      className="text-white/30 text-xs mt-2 font-light"
                      style={{
                        fontFamily: '"Cormorant Garamond", "EB Garamond", "Crimson Text", Georgia, serif',
                        letterSpacing: '0.1em'
                      }}
                    >
                      — Plato, Phaedo
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {phase === 'daimon' && (
              <motion.div
                key="daimon"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0"
              >
                <MAIADaimonIntroduction
                  userId={userId}
                  userName={userName}
                  onComplete={handleDaimonComplete}
                />
              </motion.div>
            )}

            {phase === 'transitioning' && (
              <motion.div
                key="transitioning"
                initial={{ opacity: 1, scale: 1 }}
                animate={{ opacity: 0, scale: 1.1 }}
                transition={{ duration: 0.8 }}
                className="text-center"
              >
                <motion.div
                  className="w-20 h-20 mx-auto mb-4"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [1, 0.7, 0.3]
                  }}
                  transition={{
                    duration: 0.8,
                    ease: "easeInOut"
                  }}
                >
                  <img src="/elementalHoloflower.svg" alt="MAIA" className="w-full h-full object-contain drop-shadow-lg" />
                </motion.div>
                <p
                  className="text-white/80 text-sm font-light tracking-wider"
                  style={{
                    fontFamily: '"Cormorant Garamond", "EB Garamond", "Crimson Text", Georgia, serif',
                    textShadow: '0 0 15px rgba(255,255,255,0.2)',
                    letterSpacing: '0.15em'
                  }}
                >
                  Opening...
                </p>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}