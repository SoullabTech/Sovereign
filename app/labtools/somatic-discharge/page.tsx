'use client';

/**
 * Somatic Discharge — Shaking, movement, release
 *
 * Body-based discharge for completing the stress response.
 * Guided shaking, micro-movement, and settling.
 * When breath alone is not enough.
 *
 * Four phases: warm up → build → shake → settle
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCcw, Square } from 'lucide-react';
import { triggerHapticPulse } from '@/lib/haptics';
import { ToolBridge } from '@/components/labtools/ToolBridge';

// ─────────────────────────────────────────────────────
// PHASES & PROMPTS
// ─────────────────────────────────────────────────────

interface DischargePhase {
  id: string;
  label: string;
  /** Fraction of total duration (must sum to 1) */
  fraction: number;
  prompts: string[];
}

const DISCHARGE_PHASES: DischargePhase[] = [
  {
    id: 'warmup',
    label: 'Warm up',
    fraction: 0.2,
    prompts: [
      'Start with small movements.',
      'Shake your hands gently.',
      'Let your wrists be loose.',
      'Bounce lightly on your feet.',
    ],
  },
  {
    id: 'build',
    label: 'Build',
    fraction: 0.25,
    prompts: [
      'Let the movement spread.',
      'Shake your arms from the shoulders.',
      'Let your jaw drop open.',
      'Let your spine be soft.',
    ],
  },
  {
    id: 'shake',
    label: 'Shake',
    fraction: 0.35,
    prompts: [
      'Let the whole body shake.',
      'Whatever speed feels right.',
      'The body knows what to do.',
      'Let sound come if it wants to.',
      'Keep going.',
    ],
  },
  {
    id: 'settle',
    label: 'Settle',
    fraction: 0.2,
    prompts: [
      'Begin to slow.',
      'Let the shaking wind down.',
      'Stand or sit still.',
      'Notice what moves on its own.',
      'Just be here.',
    ],
  },
];

type Intensity = 'gentle' | 'medium' | 'vigorous';
type DurationSec = 120 | 300 | 600;
type SessionPhase = 'setup' | 'running' | 'complete';

const DURATIONS: DurationSec[] = [120, 300, 600];
const INTENSITIES: { key: Intensity; label: string }[] = [
  { key: 'gentle', label: 'Gentle' },
  { key: 'medium', label: 'Medium' },
  { key: 'vigorous', label: 'Vigorous' },
];

// ─────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────

export default function SomaticDischargePage() {
  const router = useRouter();

  const [duration, setDuration] = useState<DurationSec>(300);
  const [intensity, setIntensity] = useState<Intensity>('medium');
  const [sessionPhase, setSessionPhase] = useState<SessionPhase>('setup');

  const [elapsed, setElapsed] = useState(0);
  const [currentPhaseIdx, setCurrentPhaseIdx] = useState(0);
  const [currentPromptIdx, setCurrentPromptIdx] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);

  const remaining = Math.max(0, duration - elapsed);
  const progress = duration > 0 ? elapsed / duration : 0;

  // Determine which discharge phase we're in
  const getCurrentDischargePhase = useCallback((elapsedSec: number): { phaseIdx: number; promptIdx: number } => {
    let accumulated = 0;
    for (let i = 0; i < DISCHARGE_PHASES.length; i++) {
      const phaseDuration = DISCHARGE_PHASES[i].fraction * duration;
      if (elapsedSec < accumulated + phaseDuration) {
        const phaseElapsed = elapsedSec - accumulated;
        const prompts = DISCHARGE_PHASES[i].prompts;
        const promptDuration = phaseDuration / prompts.length;
        const promptIdx = Math.min(Math.floor(phaseElapsed / promptDuration), prompts.length - 1);
        return { phaseIdx: i, promptIdx };
      }
      accumulated += phaseDuration;
    }
    return { phaseIdx: DISCHARGE_PHASES.length - 1, promptIdx: DISCHARGE_PHASES[DISCHARGE_PHASES.length - 1].prompts.length - 1 };
  }, [duration]);

  const tick = useCallback(() => {
    const now = performance.now();
    const elapsedSec = (now - startTimeRef.current) / 1000;

    if (elapsedSec >= duration) {
      setElapsed(duration);
      setSessionPhase('complete');
      triggerHapticPulse('strong');
      return;
    }

    setElapsed(elapsedSec);
    const { phaseIdx, promptIdx } = getCurrentDischargePhase(elapsedSec);

    if (phaseIdx !== currentPhaseIdx) {
      triggerHapticPulse('medium');
    }

    setCurrentPhaseIdx(phaseIdx);
    setCurrentPromptIdx(promptIdx);
  }, [duration, getCurrentDischargePhase, currentPhaseIdx]);

  function stopAll() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }

  function start() {
    setElapsed(0);
    setCurrentPhaseIdx(0);
    setCurrentPromptIdx(0);
    startTimeRef.current = performance.now();
    setSessionPhase('running');
    triggerHapticPulse('medium');
  }

  function reset() {
    stopAll();
    setSessionPhase('setup');
    setElapsed(0);
  }

  useEffect(() => {
    if (sessionPhase === 'running') {
      timerRef.current = setInterval(tick, 100);
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
    } else {
      stopAll();
    }
  }, [sessionPhase, tick]);

  useEffect(() => { return () => stopAll(); }, []);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const dPhase = DISCHARGE_PHASES[currentPhaseIdx];

  return (
    <div className="min-h-screen bg-[#0a0f14] text-white flex flex-col">
      <header className="flex items-center gap-3 px-5 pt-5 pb-3">
        <button
          onClick={() => { if (sessionPhase === 'running') { stopAll(); setSessionPhase('complete'); } else { router.push('/labtools'); } }}
          className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-white/60" />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-lg">{'\u{26A1}'}</span>
          <h1 className="text-base font-medium text-white/80">Somatic Discharge</h1>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-5 pb-10">
        <AnimatePresence mode="wait">
          {/* ══════════ SETUP ══════════ */}
          {sessionPhase === 'setup' && (
            <motion.div key="setup" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-sm space-y-8">
              <p className="text-xs text-white/30 text-center leading-relaxed">
                Let the body complete what it needs to.
              </p>

              <section className="space-y-3">
                <p className="text-xs text-white/30 uppercase tracking-wider font-medium">Duration</p>
                <div className="flex gap-2">
                  {DURATIONS.map((d) => (
                    <button key={d} onClick={() => setDuration(d)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                        ${duration === d ? 'bg-white/10 text-white/90 border border-white/20' : 'bg-white/[0.02] text-white/40 border border-white/[0.06] hover:bg-white/[0.05]'}`}>
                      {d >= 60 ? `${d / 60}m` : `${d}s`}
                    </button>
                  ))}
                </div>
              </section>

              <section className="space-y-3">
                <p className="text-xs text-white/30 uppercase tracking-wider font-medium">Intensity</p>
                <div className="flex gap-2">
                  {INTENSITIES.map((i) => (
                    <button key={i.key} onClick={() => setIntensity(i.key)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                        ${intensity === i.key ? 'bg-white/10 text-white/90 border border-white/20' : 'bg-white/[0.02] text-white/40 border border-white/[0.06] hover:bg-white/[0.05]'}`}>
                      {i.label}
                    </button>
                  ))}
                </div>
              </section>

              <motion.button onClick={start} whileTap={{ scale: 0.96 }}
                className="w-full py-4 rounded-2xl font-medium text-base bg-gradient-to-r from-[#D4B896]/20 to-[#D4B896]/10 border border-[#D4B896]/20 text-[#D4B896] hover:from-[#D4B896]/30 hover:to-[#D4B896]/20 transition-all duration-200">
                Begin
              </motion.button>

              <p className="text-center text-[11px] text-white/20">
                4 phases: warm up &rarr; build &rarr; shake &rarr; settle
              </p>
            </motion.div>
          )}

          {/* ══════════ RUNNING ══════════ */}
          {sessionPhase === 'running' && (
            <motion.div key="running" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center justify-center gap-8 w-full max-w-sm">

              {/* Phase indicator */}
              <div className="flex gap-2 items-center">
                {DISCHARGE_PHASES.map((p, i) => (
                  <div key={p.id} className="flex items-center gap-2">
                    <div className={`text-[10px] font-medium transition-all duration-300
                      ${i === currentPhaseIdx ? 'text-white/60' : i < currentPhaseIdx ? 'text-white/20' : 'text-white/10'}`}>
                      {p.label}
                    </div>
                    {i < DISCHARGE_PHASES.length - 1 && <div className="w-3 h-px bg-white/10" />}
                  </div>
                ))}
              </div>

              {/* Prompt */}
              <div className="min-h-[100px] flex flex-col items-center justify-center px-4" aria-live="polite" aria-atomic="true">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={`${currentPhaseIdx}-${currentPromptIdx}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.5 }}
                    className="text-xl font-light text-white/80 leading-relaxed tracking-wide text-center"
                  >
                    {dPhase.prompts[currentPromptIdx]}
                  </motion.p>
                </AnimatePresence>
              </div>

              <div className="text-center space-y-2">
                <div className="text-2xl font-light text-white/40 font-mono tracking-wider">{formatTime(remaining)}</div>
                <div className="w-48 h-0.5 bg-white/5 rounded-full overflow-hidden mx-auto">
                  <div className="h-full bg-amber-500/30 rounded-full transition-all duration-500" style={{ width: `${progress * 100}%` }} />
                </div>
              </div>

              <button onClick={() => { stopAll(); setSessionPhase('complete'); }}
                className="flex items-center gap-1.5 text-xs text-white/20 hover:text-white/40 transition-colors">
                <Square className="w-3 h-3" /> Stop
              </button>
            </motion.div>
          )}

          {/* ══════════ COMPLETE ══════════ */}
          {sessionPhase === 'complete' && (
            <motion.div key="complete" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-8 w-full max-w-sm">
              <div className="text-center space-y-2">
                <p className="text-xs text-white/40 font-mono tracking-wide">
                  {formatTime(duration)} &middot; {intensity}
                </p>
              </div>

              <div className="flex gap-3 w-full">
                <motion.button onClick={reset} whileTap={{ scale: 0.96 }}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-medium text-sm bg-white/[0.03] border border-white/[0.08] text-white/50 hover:bg-white/[0.06] transition-all duration-200">
                  <RotateCcw className="w-3.5 h-3.5" /> Again
                </motion.button>
                <motion.button onClick={() => router.push('/labtools')} whileTap={{ scale: 0.96 }}
                  className="flex-1 py-3.5 rounded-xl font-medium text-sm bg-gradient-to-r from-[#D4B896]/15 to-[#D4B896]/08 border border-[#D4B896]/15 text-[#D4B896]/80 hover:from-[#D4B896]/25 hover:to-[#D4B896]/15 transition-all duration-200">
                  Done
                </motion.button>
              </div>

              <ToolBridge text="Come back to stillness." href="/labtools/orienting" className="mt-3" />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
