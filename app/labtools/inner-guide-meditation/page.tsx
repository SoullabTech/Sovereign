'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Flame, Pause, Play, RotateCcw } from 'lucide-react';

/**
 * Inner Guide Meditation — Fire Phase 1: The Spark
 *
 * A structured encounter field based on Kelly Nezat's Elemental Alchemy
 * and Edward Steinbrecher's Inner Guide Meditation.
 *
 * Flow: Orient → Encounter → Journal → Integrate
 * Fire first. Experience before interpretation.
 */

type SessionPhase = 'orient' | 'encounter' | 'journal' | 'integrate';

// Meditation steps from docs/framework/facets/fire-phase-1.md
const MEDITATION_STEPS = [
  { text: 'Sit and notice where energy wants to move in your body.', duration: 8000 },
  { text: 'Do not try to calm it. Let it be alive.', duration: 6000 },
  { text: 'Imagine a small flame appearing before you — in a cave, a field, a forge, or open sky. Let the setting come naturally.', duration: 10000 },
  { text: 'Ask:', prompt: 'What in me wants to begin?', duration: 12000 },
  { text: 'Let the answer come quickly. Do not analyze it.', duration: 8000 },
  { text: 'If a being, guide, or presence appears near the flame, acknowledge it.', duration: 10000 },
  { text: 'Ask:', prompt: 'What is the first step?', duration: 12000 },
  { text: 'Take one step in imagination toward whatever appears.', duration: 10000 },
  { text: 'Before returning, ask:', prompt: 'What must I not extinguish?', duration: 12000 },
  { text: 'Carry the spark back.', duration: 6000 },
];

const JOURNAL_PROMPTS = [
  'What appeared?',
  'What is the first step?',
  'What must I not extinguish?',
];

export default function InnerGuideMeditationPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<SessionPhase>('orient');
  const [currentStep, setCurrentStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [journalEntries, setJournalEntries] = useState<string[]>(['', '', '']);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-advance meditation steps
  useEffect(() => {
    if (phase !== 'encounter' || isPaused) return;
    if (currentStep >= MEDITATION_STEPS.length) {
      // Meditation complete — move to journal
      const timeout = setTimeout(() => setPhase('journal'), 2000);
      return () => clearTimeout(timeout);
    }

    timerRef.current = setTimeout(() => {
      setCurrentStep(prev => prev + 1);
    }, MEDITATION_STEPS[currentStep].duration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [phase, currentStep, isPaused]);

  const handleEnterField = useCallback(() => {
    setPhase('encounter');
    setCurrentStep(0);
    setIsPaused(false);
  }, []);

  const handleTogglePause = useCallback(() => {
    setIsPaused(prev => !prev);
  }, []);

  const handleJournalChange = useCallback((index: number, value: string) => {
    setJournalEntries(prev => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }, []);

  const handleRestart = useCallback(() => {
    setPhase('orient');
    setCurrentStep(0);
    setIsPaused(false);
    setJournalEntries(['', '', '']);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0f14] text-white flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <button
          onClick={() => router.push('/labtools')}
          className="flex items-center gap-2 text-white/50 hover:text-white/80 transition-colors"
        >
          <ArrowLeft size={18} />
          <span className="text-sm">Labtools</span>
        </button>
        <div className="flex items-center gap-2 text-amber-400/80">
          <Flame size={16} />
          <span className="text-sm font-medium">Inner Guide Meditation</span>
        </div>
        <div className="w-16" />
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-6 py-8">
        <AnimatePresence mode="wait">
          {/* ═══ ORIENT ═══ */}
          {phase === 'orient' && (
            <motion.div
              key="orient"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.6 }}
              className="max-w-lg text-center space-y-8"
            >
              <div className="space-y-2">
                <div className="text-amber-400/60 text-sm tracking-widest uppercase">
                  Fire Phase 1
                </div>
                <h1 className="text-3xl md:text-4xl font-light text-amber-100">
                  The Spark
                </h1>
              </div>

              <p className="text-white/50 text-lg leading-relaxed">
                You may be here when something in you wants to begin.
                Restlessness, curiosity, a call you haven&apos;t named yet.
              </p>

              <div className="py-4">
                <p className="text-amber-300/80 text-xl italic">
                  &ldquo;What in me wants to begin?&rdquo;
                </p>
              </div>

              <motion.button
                onClick={handleEnterField}
                className="px-8 py-4 bg-amber-600/20 border border-amber-500/30 rounded-xl text-amber-200 text-lg hover:bg-amber-600/30 transition-colors"
                whileTap={{ scale: 0.96 }}
              >
                Enter the Field
              </motion.button>

              <p className="text-white/20 text-xs">
                Created by Kelly Nezat
                <br />
                In honor of Edward Steinbrecher&apos;s Inner Guide Meditation
                <br />
                For all who aspire to work with their Guides
              </p>
            </motion.div>
          )}

          {/* ═══ ENCOUNTER ═══ */}
          {phase === 'encounter' && (
            <motion.div
              key="encounter"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.0 }}
              className="max-w-xl text-center space-y-12 relative"
            >
              {/* Ambient flame indicator */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-8 w-2 h-2 rounded-full bg-amber-500/40 animate-pulse" />

              {currentStep < MEDITATION_STEPS.length ? (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 1.2 }}
                    className="space-y-4"
                  >
                    <p className="text-white/70 text-xl md:text-2xl leading-relaxed font-light">
                      {MEDITATION_STEPS[currentStep].text}
                    </p>
                    {MEDITATION_STEPS[currentStep].prompt && (
                      <p className="text-amber-300 text-2xl md:text-3xl italic font-light pt-2">
                        {MEDITATION_STEPS[currentStep].prompt}
                      </p>
                    )}
                  </motion.div>
                </AnimatePresence>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1.5 }}
                >
                  <p className="text-white/40 text-lg">
                    Take a moment before continuing...
                  </p>
                </motion.div>
              )}

              {/* Pause/resume */}
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleTogglePause}
                  className="text-white/30 hover:text-white/60 transition-colors p-2"
                  title={isPaused ? 'Resume' : 'Pause'}
                >
                  {isPaused ? <Play size={20} /> : <Pause size={20} />}
                </button>
              </div>

              {/* Progress dots */}
              <div className="flex justify-center gap-1.5">
                {MEDITATION_STEPS.map((_, i) => (
                  <div
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full transition-colors duration-500 ${
                      i < currentStep
                        ? 'bg-amber-500/60'
                        : i === currentStep
                          ? 'bg-amber-400'
                          : 'bg-white/10'
                    }`}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* ═══ JOURNAL ═══ */}
          {phase === 'journal' && (
            <motion.div
              key="journal"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.6 }}
              className="max-w-lg w-full space-y-8"
            >
              <div className="text-center space-y-2">
                <p className="text-amber-400/60 text-sm tracking-widest uppercase">
                  Write before it cools
                </p>
                <h2 className="text-2xl text-amber-100 font-light">
                  What did the fire show you?
                </h2>
              </div>

              <div className="space-y-6">
                {JOURNAL_PROMPTS.map((prompt, i) => (
                  <div key={i} className="space-y-2">
                    <label className="text-white/50 text-sm">{prompt}</label>
                    <textarea
                      value={journalEntries[i]}
                      onChange={(e) => handleJournalChange(i, e.target.value)}
                      placeholder="..."
                      rows={3}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white/80 placeholder:text-white/20 focus:outline-none focus:border-amber-500/30 resize-none"
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-center pt-4">
                <motion.button
                  onClick={() => setPhase('integrate')}
                  className="px-8 py-3 bg-amber-600/20 border border-amber-500/30 rounded-xl text-amber-200 hover:bg-amber-600/30 transition-colors"
                  whileTap={{ scale: 0.96 }}
                >
                  Continue
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ═══ INTEGRATE ═══ */}
          {phase === 'integrate' && (
            <motion.div
              key="integrate"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.6 }}
              className="max-w-lg text-center space-y-8"
            >
              <div className="space-y-2">
                <p className="text-amber-400/60 text-sm tracking-widest uppercase">
                  Integration
                </p>
                <h2 className="text-2xl text-amber-100 font-light">
                  Carry the spark into your day
                </h2>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4 text-left">
                <p className="text-white/70 leading-relaxed">
                  Take one small step toward this within the hour. Do not overplan.
                </p>
                <div className="border-t border-white/5 pt-4">
                  <p className="text-white/40 text-sm font-medium uppercase tracking-wide mb-2">
                    Grounding Practice
                  </p>
                  <ul className="text-white/50 text-sm space-y-1">
                    <li>Stand up, feet planted, arms open</li>
                    <li>Three sharp exhales</li>
                    <li>Write the impulse in one sentence</li>
                    <li>Do one thing toward it within the hour</li>
                  </ul>
                </div>
              </div>

              {/* Show journal entries back */}
              {journalEntries.some(e => e.trim()) && (
                <div className="bg-white/3 border border-white/5 rounded-xl p-5 space-y-3 text-left">
                  <p className="text-white/30 text-xs uppercase tracking-wide">Your encounter</p>
                  {JOURNAL_PROMPTS.map((prompt, i) => (
                    journalEntries[i]?.trim() ? (
                      <div key={i}>
                        <p className="text-white/30 text-xs">{prompt}</p>
                        <p className="text-white/60 text-sm italic">{journalEntries[i]}</p>
                      </div>
                    ) : null
                  ))}
                </div>
              )}

              <div className="flex flex-col items-center gap-3 pt-4">
                <motion.button
                  onClick={() => router.push('/labtools')}
                  className="px-8 py-3 bg-amber-600/20 border border-amber-500/30 rounded-xl text-amber-200 hover:bg-amber-600/30 transition-colors"
                  whileTap={{ scale: 0.96 }}
                >
                  Complete
                </motion.button>
                <motion.button
                  onClick={() => {
                    // Store encounter context for /journey handoff
                    try {
                      sessionStorage.setItem('innerGuideContext', JSON.stringify({
                        element: 'fire',
                        phase: 1,
                        journalEntries: journalEntries.filter(e => e.trim()),
                        source: 'meditation',
                        timestamp: Date.now(),
                      }));
                    } catch { /* non-fatal */ }
                    router.push('/journey');
                  }}
                  className="px-8 py-3 border border-white/10 rounded-xl text-white/50 hover:text-white/70 hover:border-white/20 transition-colors"
                  whileTap={{ scale: 0.96 }}
                >
                  Continue to Journey
                </motion.button>
                <button
                  onClick={handleRestart}
                  className="flex items-center gap-2 text-white/30 hover:text-white/50 transition-colors text-sm"
                >
                  <RotateCcw size={14} />
                  Begin again
                </button>
              </div>

              <p className="text-white/15 text-xs pt-4">
                Elemental Alchemy: The Inner Guide Field
                <br />
                Fire Phase 1 — The Spark
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
