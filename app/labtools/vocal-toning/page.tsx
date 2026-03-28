'use client';

/**
 * Vocal Toning — Humming and vagal stimulation
 *
 * Direct vagal nerve activation through vocalization.
 * Guided humming, "om" toning, or free vocalization.
 * Optional reference tone via playSacredTone().
 *
 * Pattern: paced inhale → exhale on tone → repeat
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCcw, Square } from 'lucide-react';
import { playSacredTone, sacredTones } from '@/lib/audio/sacred-tones';
import { triggerHapticPulse } from '@/lib/haptics';
import { ToolBridge } from '@/components/labtools/ToolBridge';
import {
  getCycleLength,
  getPhaseAtSecond,
  getCompletedCycles,
  getOrbScale,
  getOrbOpacity,
} from '@/lib/somatic/breathEngine';

// ─────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────

type ToningMode = 'humming' | 'om' | 'free';
type DurationSec = 120 | 300;
type SessionPhase = 'setup' | 'running' | 'complete';

interface ToningConfig {
  id: ToningMode;
  label: string;
  description: string;
  emoji: string;
  /** Reference tone frequency */
  toneHz: number;
  /** Guidance during exhale phase */
  exhalePrompt: string;
}

const TONING_MODES: ToningConfig[] = [
  {
    id: 'humming',
    label: 'Humming',
    description: 'Gentle hum on exhale',
    emoji: '\u{1F41D}',
    toneHz: sacredTones.earth, // 396 Hz — grounding
    exhalePrompt: 'Hum gently',
  },
  {
    id: 'om',
    label: 'Om',
    description: 'Traditional toning on exhale',
    emoji: '\u{1F549}',
    toneHz: sacredTones.aether, // 963 Hz — integration
    exhalePrompt: 'Om',
  },
  {
    id: 'free',
    label: 'Free tone',
    description: 'Whatever sound wants to come',
    emoji: '\u{1F3B6}',
    toneHz: sacredTones.water, // 417 Hz — release
    exhalePrompt: 'Let sound come',
  },
];

const DURATIONS: DurationSec[] = [120, 300];

// Breath pattern: 4s inhale, 8s exhale (long exhale for vocalization)
const TONING_BREATH = { inhale: 4, holdIn: 0, exhale: 8, holdOut: 2 };

// ─────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────

export default function VocalToningPage() {
  const router = useRouter();

  const [mode, setMode] = useState<ToningConfig>(TONING_MODES[0]);
  const [duration, setDuration] = useState<DurationSec>(120);
  const [referenceTone, setReferenceTone] = useState(false);
  const [sessionPhase, setSessionPhase] = useState<SessionPhase>('setup');

  const [elapsed, setElapsed] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);
  const lastToneTimeRef = useRef(0);

  const cycleLengthSec = getCycleLength(TONING_BREATH);
  const remaining = Math.max(0, duration - elapsed);
  const progress = duration > 0 ? elapsed / duration : 0;
  const phaseState = getPhaseAtSecond(TONING_BREATH, elapsed);

  const isExhaling = phaseState.phase === 'exhale';

  function tryPlayTone(freq: number, dur: number, vol: number) {
    try { playSacredTone(freq, dur, vol); } catch { /* ignore */ }
  }

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
    setCycleCount(getCompletedCycles(TONING_BREATH, elapsedSec));

    // Haptic pulse on inhale start
    const ps = getPhaseAtSecond(TONING_BREATH, elapsedSec);
    if (ps.phase === 'inhale' && ps.phaseProgress < 0.05) {
      const cycleStartTime = getCompletedCycles(TONING_BREATH, elapsedSec) * cycleLengthSec;
      if (elapsedSec - cycleStartTime < 0.1) {
        triggerHapticPulse('soft');
      }
    }
  }, [duration, cycleLengthSec]);

  function stopAll() {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  }

  function start() {
    setElapsed(0);
    setCycleCount(0);
    startTimeRef.current = performance.now();
    setSessionPhase('running');
    triggerHapticPulse('medium');
  }

  function reset() {
    stopAll();
    setSessionPhase('setup');
    setElapsed(0);
    setCycleCount(0);
  }

  useEffect(() => {
    if (sessionPhase === 'running') {
      intervalRef.current = setInterval(tick, 16);
      return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    } else {
      stopAll();
    }
  }, [sessionPhase, tick]);

  // Reference tone on each exhale start
  useEffect(() => {
    if (sessionPhase !== 'running' || !referenceTone) return;
    if (phaseState.phase === 'exhale' && phaseState.phaseProgress < 0.03) {
      const now = performance.now();
      if (now - lastToneTimeRef.current > 3000) {
        lastToneTimeRef.current = now;
        tryPlayTone(mode.toneHz, TONING_BREATH.exhale * 0.8, 0.03);
      }
    }
  }, [sessionPhase, referenceTone, phaseState.phase, phaseState.phaseProgress, mode.toneHz]);

  useEffect(() => { return () => stopAll(); }, []);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

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
          <span className="text-lg">{'\u{1F514}'}</span>
          <h1 className="text-base font-medium text-white/80">Vocal Toning</h1>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-5 pb-10">
        <AnimatePresence mode="wait">
          {/* ══════════ SETUP ══════════ */}
          {sessionPhase === 'setup' && (
            <motion.div key="setup" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-sm space-y-8">
              <p className="text-xs text-white/30 text-center leading-relaxed">
                Sound vibrates the vagus nerve directly.
              </p>

              <section className="space-y-3">
                <p className="text-xs text-white/30 uppercase tracking-wider font-medium">Mode</p>
                <div className="space-y-2">
                  {TONING_MODES.map((m) => {
                    const isSelected = mode.id === m.id;
                    return (
                      <button key={m.id} onClick={() => setMode(m)}
                        className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 text-left
                          ${isSelected ? 'bg-white/10 border border-white/20' : 'bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.05]'}`}>
                        <span className="text-2xl">{m.emoji}</span>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-white/90">{m.label}</div>
                          <div className="text-xs text-white/40 mt-0.5">{m.description}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="space-y-3">
                <p className="text-xs text-white/30 uppercase tracking-wider font-medium">Duration</p>
                <div className="flex gap-2">
                  {DURATIONS.map((d) => (
                    <button key={d} onClick={() => setDuration(d)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                        ${duration === d ? 'bg-white/10 text-white/90 border border-white/20' : 'bg-white/[0.02] text-white/40 border border-white/[0.06] hover:bg-white/[0.05]'}`}>
                      {d / 60}m
                    </button>
                  ))}
                </div>
              </section>

              {/* Reference tone toggle */}
              <div className="flex items-center justify-between px-1">
                <span className="text-xs text-white/30">Reference tone on exhale</span>
                <button
                  onClick={() => setReferenceTone(!referenceTone)}
                  className={`w-10 h-6 rounded-full transition-all duration-200 relative ${referenceTone ? 'bg-white/20' : 'bg-white/5'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white/80 absolute top-1 transition-transform duration-200 ${referenceTone ? 'translate-x-5' : 'translate-x-1'}`} />
                </button>
              </div>

              <motion.button onClick={start} whileTap={{ scale: 0.96 }}
                className="w-full py-4 rounded-2xl font-medium text-base bg-gradient-to-r from-[#D4B896]/20 to-[#D4B896]/10 border border-[#D4B896]/20 text-[#D4B896] hover:from-[#D4B896]/30 hover:to-[#D4B896]/20 transition-all duration-200">
                Begin
              </motion.button>

              <p className="text-center text-[11px] text-white/20">
                {cycleLengthSec > 0 ? Math.floor(duration / cycleLengthSec) : 0} cycles &middot; {formatTime(duration)} total
              </p>
            </motion.div>
          )}

          {/* ══════════ RUNNING ══════════ */}
          {sessionPhase === 'running' && (
            <motion.div key="running" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center justify-center gap-10 w-full max-w-sm">

              {/* Orb — pulses on exhale (vocal phase) */}
              <div className="relative w-48 h-48 flex items-center justify-center">
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `radial-gradient(circle, transparent 40%, rgba(200,170,220,${getOrbOpacity(phaseState.phase, phaseState.phaseProgress) * 0.12}) 70%, transparent 100%)`,
                    transform: `scale(${getOrbScale(phaseState.phase, phaseState.phaseProgress) * 1.3})`,
                    transition: 'transform 0.3s ease-out',
                  }}
                />
                <div
                  className="w-36 h-36 rounded-full relative"
                  style={{
                    background: `radial-gradient(circle at 40% 40%,
                      rgba(200,170,220,${getOrbOpacity(phaseState.phase, phaseState.phaseProgress) * 0.5}) 0%,
                      rgba(200,170,220,${getOrbOpacity(phaseState.phase, phaseState.phaseProgress) * 0.15}) 50%,
                      rgba(200,170,220,0.02) 100%)`,
                    transform: `scale(${getOrbScale(phaseState.phase, phaseState.phaseProgress)})`,
                    transition: 'transform 0.3s ease-out, background 0.3s ease-out',
                    boxShadow: `0 0 ${30 * getOrbOpacity(phaseState.phase, phaseState.phaseProgress)}px rgba(200,170,220,${getOrbOpacity(phaseState.phase, phaseState.phaseProgress) * 0.25})`,
                  }}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span aria-live="polite" aria-atomic="true" className="text-lg font-light text-white/70 tracking-wide">
                    {isExhaling ? mode.exhalePrompt : phaseState.phase === 'inhale' ? 'Breathe in' : 'Pause'}
                  </span>
                </div>
              </div>

              <div className="text-center space-y-2">
                <div className="text-2xl font-light text-white/50 font-mono tracking-wider">{formatTime(remaining)}</div>
                <div className="w-48 h-0.5 bg-white/5 rounded-full overflow-hidden mx-auto">
                  <div className="h-full bg-purple-400/30 rounded-full transition-all duration-500" style={{ width: `${progress * 100}%` }} />
                </div>
                <div className="text-[10px] text-white/20 font-mono">{mode.label} &middot; cycle {cycleCount + 1}</div>
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
                  {formatTime(duration)} &middot; {mode.label} &middot; {cycleCount} cycles
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

              <ToolBridge text="You might scan through the body now." href="/labtools/body-scan" className="mt-3" />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
