'use client';

/**
 * Body Scan — Guided body awareness
 *
 * Sequential awareness scan through body regions.
 * Feet to crown or crown to feet. Simple prompts, no interpretation.
 * Just contact with what is.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCcw, Square } from 'lucide-react';
import { triggerHapticPulse } from '@/lib/haptics';
import { ToolBridge } from '@/components/labtools/ToolBridge';

// ─────────────────────────────────────────────────────
// REGIONS & PROMPTS
// ─────────────────────────────────────────────────────

interface BodyRegion {
  name: string;
  prompt: string;
  hint?: string;
}

const REGIONS_ASCENDING: BodyRegion[] = [
  { name: 'Feet',      prompt: 'Notice your feet.',        hint: 'Contact with the ground.' },
  { name: 'Legs',      prompt: 'Notice your legs.',        hint: 'Weight, warmth, sensation.' },
  { name: 'Pelvis',    prompt: 'Notice your pelvis.',      hint: 'The basin of the body.' },
  { name: 'Belly',     prompt: 'Notice your belly.',       hint: 'Breath moves here.' },
  { name: 'Chest',     prompt: 'Notice your chest.',       hint: 'Space, pressure, rhythm.' },
  { name: 'Hands',     prompt: 'Notice your hands.',       hint: 'Temperature, tingling, weight.' },
  { name: 'Arms',      prompt: 'Notice your arms.',        hint: 'From fingertips to shoulders.' },
  { name: 'Shoulders', prompt: 'Notice your shoulders.',   hint: 'What are they carrying?' },
  { name: 'Neck',      prompt: 'Notice your neck.',        hint: 'The bridge.' },
  { name: 'Face',      prompt: 'Notice your face.',        hint: 'Eyes, jaw, forehead.' },
  { name: 'Crown',     prompt: 'Notice the top of your head.', hint: 'Where sky meets body.' },
];

type Direction = 'ascending' | 'descending';
type DurationSec = 180 | 300 | 600;
type SessionPhase = 'setup' | 'running' | 'complete';

const DURATIONS: DurationSec[] = [180, 300, 600];

interface CompletionRecord {
  durationSec: DurationSec;
  direction: Direction;
  regionsCompleted: number;
  completedAt: string;
}

// ─────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────

export default function BodyScanPage() {
  const router = useRouter();

  const [duration, setDuration] = useState<DurationSec>(300);
  const [direction, setDirection] = useState<Direction>('ascending');
  const [sessionPhase, setSessionPhase] = useState<SessionPhase>('setup');

  const [elapsed, setElapsed] = useState(0);
  const [currentRegionIdx, setCurrentRegionIdx] = useState(0);
  const [completionRecord, setCompletionRecord] = useState<CompletionRecord | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);

  const regions = direction === 'ascending'
    ? REGIONS_ASCENDING
    : [...REGIONS_ASCENDING].reverse();

  const remaining = Math.max(0, duration - elapsed);
  const progress = duration > 0 ? elapsed / duration : 0;
  const regionDuration = duration / regions.length;
  const currentRegion = regions[currentRegionIdx] || regions[regions.length - 1];

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

    const newIdx = Math.min(
      Math.floor(elapsedSec / regionDuration),
      regions.length - 1
    );
    setCurrentRegionIdx((prev) => {
      if (newIdx !== prev) {
        triggerHapticPulse('soft');
      }
      return newIdx;
    });
  }, [duration, regionDuration, regions.length]);

  function stopAll() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }

  function start() {
    setElapsed(0);
    setCurrentRegionIdx(0);
    setCompletionRecord(null);
    startTimeRef.current = performance.now();
    setSessionPhase('running');
    triggerHapticPulse('medium');
  }

  function reset() {
    stopAll();
    setSessionPhase('setup');
    setElapsed(0);
    setCurrentRegionIdx(0);
    setCompletionRecord(null);
  }

  useEffect(() => {
    if (sessionPhase === 'running') {
      timerRef.current = setInterval(tick, 100);
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
    } else {
      stopAll();
    }
  }, [sessionPhase, tick]);

  useEffect(() => {
    if (sessionPhase === 'complete') {
      setCompletionRecord({
        durationSec: duration,
        direction,
        regionsCompleted: currentRegionIdx + 1,
        completedAt: new Date().toISOString(),
      });
    }
  }, [sessionPhase, duration, direction, currentRegionIdx]);

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
          <span className="text-lg">{'\u{1FAC2}'}</span>
          <h1 className="text-base font-medium text-white/80">Body Scan</h1>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-5 pb-10">
        <AnimatePresence mode="wait">
          {/* ══════════ SETUP ══════════ */}
          {sessionPhase === 'setup' && (
            <motion.div key="setup" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-sm space-y-8">
              <p className="text-xs text-white/30 text-center leading-relaxed">
                Move through your body. Just notice.
              </p>

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

              <section className="space-y-3">
                <p className="text-xs text-white/30 uppercase tracking-wider font-medium">Direction</p>
                <div className="flex gap-2">
                  {([['ascending', 'Feet up'] as const, ['descending', 'Head down'] as const]).map(([key, label]) => (
                    <button key={key} onClick={() => setDirection(key)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                        ${direction === key ? 'bg-white/10 text-white/90 border border-white/20' : 'bg-white/[0.02] text-white/40 border border-white/[0.06] hover:bg-white/[0.05]'}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </section>

              <motion.button onClick={start} whileTap={{ scale: 0.96 }}
                className="w-full py-4 rounded-2xl font-medium text-base bg-gradient-to-r from-[#D4B896]/20 to-[#D4B896]/10 border border-[#D4B896]/20 text-[#D4B896] hover:from-[#D4B896]/30 hover:to-[#D4B896]/20 transition-all duration-200">
                Begin
              </motion.button>

              <p className="text-center text-[11px] text-white/20">
                {regions.length} regions &middot; ~{Math.round(regionDuration)}s each
              </p>
            </motion.div>
          )}

          {/* ══════════ RUNNING ══════════ */}
          {sessionPhase === 'running' && (
            <motion.div key="running" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center justify-center gap-8 w-full max-w-sm">

              {/* Region indicator */}
              <div className="flex gap-1">
                {regions.map((_, i) => (
                  <div key={i} className={`w-2 h-2 rounded-full transition-all duration-500 ${i <= currentRegionIdx ? 'bg-[#D4B896]/50' : 'bg-white/5'}`} />
                ))}
              </div>

              {/* Prompt */}
              <div className="min-h-[120px] flex flex-col items-center justify-center px-4" aria-live="polite" aria-atomic="true">
                <AnimatePresence mode="wait">
                  <motion.div key={currentRegionIdx} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.5 }} className="text-center">
                    <p className="text-xl font-light text-white/80 leading-relaxed tracking-wide">{currentRegion.prompt}</p>
                    {currentRegion.hint && <p className="mt-3 text-xs text-white/20">{currentRegion.hint}</p>}
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="text-center space-y-2">
                <div className="text-2xl font-light text-white/40 font-mono tracking-wider">{formatTime(remaining)}</div>
                <div className="w-48 h-0.5 bg-white/5 rounded-full overflow-hidden mx-auto">
                  <div className="h-full bg-[#D4B896]/30 rounded-full transition-all duration-500" style={{ width: `${progress * 100}%` }} />
                </div>
                <div className="text-[10px] text-white/15 font-mono">{currentRegion.name}</div>
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
                {completionRecord && (
                  <p className="text-xs text-white/40 font-mono tracking-wide">
                    {formatTime(completionRecord.durationSec)} &middot; {completionRecord.direction === 'ascending' ? 'feet up' : 'head down'} &middot; {completionRecord.regionsCompleted} regions
                  </p>
                )}
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

              <ToolBridge text="Now you might work with your breath." href="/labtools/breathwork" className="mt-3" />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
