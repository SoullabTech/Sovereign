'use client';

/**
 * Regulation Minute - Quick nervous system reset
 *
 * A 60-120 second guided downshift. Zero advice, just a guided sequence.
 * Three protocols: Downshift / Energize / Stabilize
 * Three durations: 60s / 90s / 120s
 *
 * This is the first real Shift tool in the Somatic domain.
 * It gives the Lab an embodied floor.
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCcw, Square } from 'lucide-react';
import { playSacredTone, sacredTones } from '@/lib/audio/sacred-tones';
import { triggerHapticPulse, HapticBreathSync, supportsHaptics } from '@/lib/haptics';
import { ToolBridge } from '@/components/labtools/ToolBridge';

// ─────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────

type Protocol = 'downshift' | 'energize' | 'stabilize';
type Duration = 60 | 90 | 120;
type SessionPhase = 'setup' | 'running' | 'complete';
type BreathPhase = 'inhale' | 'hold' | 'exhale' | 'rest';

interface BreathPattern {
  inhale: number;   // seconds
  hold: number;
  exhale: number;
  rest: number;
  tone: number;     // Hz - subtle audio cue
  label: string;
  description: string;
  emoji: string;
}

interface BreathStep {
  phase: BreathPhase;
  duration: number; // seconds
  label: string;
}

/**
 * Completion record — structured for future "Track Patterns" integration.
 * When optional session logging lands, this shape is ready to persist.
 */
interface CompletionRecord {
  protocolKey: Protocol;
  protocolLabel: string;
  durationSec: Duration;
  cyclesCompleted: number;
  soundOn: boolean;
  completedAt: string; // ISO 8601
}

// ─────────────────────────────────────────────────────
// PROTOCOLS
// ─────────────────────────────────────────────────────

const PROTOCOLS: Record<Protocol, BreathPattern> = {
  downshift: {
    inhale: 4,
    hold: 7,
    exhale: 8,
    rest: 2,
    tone: sacredTones.water,   // 417 Hz - release
    label: 'Downshift',
    description: 'Slow the nervous system',
    emoji: '\u{1F30A}',
  },
  energize: {
    inhale: 4,
    hold: 0,
    exhale: 4,
    rest: 0,
    tone: sacredTones.fire,    // 528 Hz - activation
    label: 'Energize',
    description: 'Wake up the body',
    emoji: '\u{1F525}',
  },
  stabilize: {
    inhale: 4,
    hold: 4,
    exhale: 4,
    rest: 4,
    tone: sacredTones.earth,   // 396 Hz - grounding
    label: 'Stabilize',
    description: 'Find center',
    emoji: '\u{1FAA8}',
  },
};

const DURATIONS: Duration[] = [60, 90, 120];

const PHASE_LABELS: Record<BreathPhase, string> = {
  inhale: 'Breathe in',
  hold: 'Hold',
  exhale: 'Breathe out',
  rest: 'Rest',
};

// ─────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────

/** Build the repeating breath step sequence for a protocol. */
function buildBreathSteps(pattern: BreathPattern): BreathStep[] {
  const steps: BreathStep[] = [];
  steps.push({ phase: 'inhale', duration: pattern.inhale, label: PHASE_LABELS.inhale });
  if (pattern.hold > 0)  steps.push({ phase: 'hold',   duration: pattern.hold,   label: PHASE_LABELS.hold });
  steps.push({ phase: 'exhale', duration: pattern.exhale, label: PHASE_LABELS.exhale });
  if (pattern.rest > 0)  steps.push({ phase: 'rest',   duration: pattern.rest,   label: PHASE_LABELS.rest });
  return steps;
}

/** Get cycle length in seconds for a pattern. */
function getCycleLength(pattern: BreathPattern): number {
  return pattern.inhale + pattern.hold + pattern.exhale + pattern.rest;
}

/** Calculate the visual scale for the breathing orb. */
function getOrbScale(phase: BreathPhase, phaseProgress: number): number {
  switch (phase) {
    case 'inhale': return 0.6 + 0.4 * phaseProgress;       // 0.6 -> 1.0
    case 'hold':   return 1.0;                              // stay full
    case 'exhale': return 1.0 - 0.4 * phaseProgress;       // 1.0 -> 0.6
    case 'rest':   return 0.6;                              // stay small
    default:       return 0.6;
  }
}

/** Calculate orb opacity for visual breathing feedback. */
function getOrbOpacity(phase: BreathPhase, phaseProgress: number): number {
  switch (phase) {
    case 'inhale': return 0.3 + 0.4 * phaseProgress;       // 0.3 -> 0.7
    case 'hold':   return 0.7 + 0.1 * Math.sin(phaseProgress * Math.PI * 2);
    case 'exhale': return 0.7 - 0.4 * phaseProgress;       // 0.7 -> 0.3
    case 'rest':   return 0.3;
    default:       return 0.3;
  }
}

/** Try to play a tone, returning false if audio context fails. */
function tryPlayTone(freq: number, durationSec: number, volume: number): boolean {
  try {
    playSacredTone(freq, durationSec, volume);
    return true;
  } catch {
    return false;
  }
}

// ─────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────

export default function RegulationMinutePage() {
  const router = useRouter();

  // ── Setup state ──
  const [protocol, setProtocol] = useState<Protocol>('downshift');
  const [duration, setDuration] = useState<Duration>(60);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [sessionPhase, setSessionPhase] = useState<SessionPhase>('setup');

  // ── Running state ──
  const [elapsed, setElapsed] = useState(0);
  const [currentBreathPhase, setCurrentBreathPhase] = useState<BreathPhase>('inhale');
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);

  // ── Completion record (structured for future tracking) ──
  const [completionRecord, setCompletionRecord] = useState<CompletionRecord | null>(null);

  // ── Audio availability (detected on first play attempt) ──
  const [soundAvailable, setSoundAvailable] = useState(true);

  // ── Refs ──
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);
  const hapticSyncRef = useRef<HapticBreathSync | null>(null);
  const lastToneTimeRef = useRef(0);

  // ── Derived ──
  const pattern = PROTOCOLS[protocol];
  const steps = buildBreathSteps(pattern);
  const cycleLengthSec = getCycleLength(pattern);
  const remaining = Math.max(0, duration - elapsed);
  const progress = duration > 0 ? elapsed / duration : 0;

  // ─────────────────────────────────────────────────
  // ENGINE
  // ─────────────────────────────────────────────────

  const tick = useCallback(() => {
    const now = performance.now();
    const elapsedMs = now - startTimeRef.current;
    const elapsedSec = elapsedMs / 1000;

    if (elapsedSec >= duration) {
      // Session complete
      setElapsed(duration);
      setSessionPhase('complete');
      triggerHapticPulse('strong');
      return;
    }

    setElapsed(elapsedSec);

    // Determine breath position within cycle
    const cyclePosition = elapsedSec % cycleLengthSec;
    let accumulated = 0;
    let currentPhase: BreathPhase = 'inhale';
    let currentPhaseProgress = 0;
    let stepIndex = 0;

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      if (cyclePosition < accumulated + step.duration) {
        currentPhase = step.phase;
        currentPhaseProgress = (cyclePosition - accumulated) / step.duration;
        stepIndex = i;
        break;
      }
      accumulated += step.duration;
    }

    setCurrentBreathPhase(currentPhase);
    setPhaseProgress(currentPhaseProgress);

    // Track cycle count
    const completedCycles = Math.floor(elapsedSec / cycleLengthSec);
    setCycleCount(completedCycles);

    // Haptic on phase transition (start of each inhale) — no-ops silently if unsupported
    if (stepIndex === 0 && currentPhaseProgress < 0.05) {
      const cycleStartTime = completedCycles * cycleLengthSec;
      if (elapsedSec - cycleStartTime < 0.1) {
        triggerHapticPulse('soft');
      }
    }
  }, [duration, cycleLengthSec, steps]);

  // ── Start ──
  const start = useCallback(() => {
    setSessionPhase('running');
    setElapsed(0);
    setCycleCount(0);
    setCurrentBreathPhase('inhale');
    setPhaseProgress(0);
    setCompletionRecord(null);
    startTimeRef.current = performance.now();

    // Start breath-synced haptics — silently no-ops if device lacks support
    if (supportsHaptics()) {
      hapticSyncRef.current = new HapticBreathSync();
      hapticSyncRef.current.start(
        pattern.inhale * 1000,
        pattern.hold * 1000,
        pattern.exhale * 1000
      );
    }

    // Play entry tone — detect if audio context is available
    if (soundEnabled) {
      const played = tryPlayTone(pattern.tone, 2, 0.04);
      if (!played) setSoundAvailable(false);
    }

    triggerHapticPulse('medium');
  }, [pattern, soundEnabled]);

  // ── Stop / cleanup ──
  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    hapticSyncRef.current?.stop();
    hapticSyncRef.current = null;
  }, []);

  // ── Reset (used by "Stop" during running and "Again" after completion) ──
  const reset = useCallback(() => {
    stop();
    setSessionPhase('setup');
    setElapsed(0);
    setCycleCount(0);
    setCompletionRecord(null);
  }, [stop]);

  // ── Interval management ──
  useEffect(() => {
    if (sessionPhase === 'running') {
      // Use setInterval at ~60fps for smooth orb animation
      intervalRef.current = setInterval(tick, 16);
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    } else {
      stop();
    }
  }, [sessionPhase, tick, stop]);

  // ── Play subtle tone at start of each cycle ──
  useEffect(() => {
    if (sessionPhase !== 'running' || !soundEnabled || !soundAvailable) return;
    const cycleStartTime = cycleCount * cycleLengthSec;
    const timeSinceCycleStart = elapsed - cycleStartTime;
    if (timeSinceCycleStart < 0.2 && elapsed > 0.5) {
      const now = performance.now();
      if (now - lastToneTimeRef.current > 2000) {
        lastToneTimeRef.current = now;
        tryPlayTone(pattern.tone, 1.5, 0.03);
      }
    }
  }, [cycleCount, elapsed, cycleLengthSec, sessionPhase, soundEnabled, soundAvailable, pattern.tone]);

  // ── Build completion record on session end ──
  useEffect(() => {
    if (sessionPhase === 'complete') {
      setCompletionRecord({
        protocolKey: protocol,
        protocolLabel: pattern.label,
        durationSec: duration,
        cyclesCompleted: cycleCount,
        soundOn: soundEnabled,
        completedAt: new Date().toISOString(),
      });

      // Completion tone
      if (soundEnabled && soundAvailable) {
        tryPlayTone(sacredTones.earth, 3, 0.05);
      }
    }
  }, [sessionPhase, protocol, pattern.label, duration, cycleCount, soundEnabled, soundAvailable]);

  // ── Cleanup on unmount ──
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  // ─────────────────────────────────────────────────
  // FORMAT HELPERS
  // ─────────────────────────────────────────────────

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // ─────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#0a0f14] text-white flex flex-col">
      {/* ── Header ── */}
      <header className="flex items-center gap-3 px-5 pt-5 pb-3">
        <button
          onClick={() => {
            if (sessionPhase === 'running') {
              reset();
            } else {
              router.push('/labtools');
            }
          }}
          className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-white/60" />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-lg">{'\u{1FAC1}'}</span>
          <h1 className="text-base font-medium text-white/80">Regulation Minute</h1>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="flex-1 flex flex-col items-center justify-center px-5 pb-10">
        <AnimatePresence mode="wait">
          {/* ══════════ SETUP PHASE ══════════ */}
          {sessionPhase === 'setup' && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-sm space-y-8"
            >
              {/* Protocol selection */}
              <section className="space-y-3">
                <p className="text-xs text-white/30 uppercase tracking-wider font-medium">
                  Protocol
                </p>
                <div className="space-y-2">
                  {(Object.keys(PROTOCOLS) as Protocol[]).map((key) => {
                    const p = PROTOCOLS[key];
                    const isSelected = protocol === key;
                    return (
                      <button
                        key={key}
                        onClick={() => setProtocol(key)}
                        className={`
                          w-full flex items-center gap-4 px-4 py-3.5 rounded-xl
                          transition-all duration-200 text-left
                          ${isSelected
                            ? 'bg-white/10 border border-white/20'
                            : 'bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.05]'
                          }
                        `}
                      >
                        <span className="text-2xl">{p.emoji}</span>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-white/90">{p.label}</div>
                          <div className="text-xs text-white/40 mt-0.5">{p.description}</div>
                        </div>
                        <div className="text-[10px] text-white/25 font-mono">
                          {p.inhale}-{p.hold}-{p.exhale}-{p.rest}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Duration selection */}
              <section className="space-y-3">
                <p className="text-xs text-white/30 uppercase tracking-wider font-medium">
                  Duration
                </p>
                <div className="flex gap-2">
                  {DURATIONS.map((d) => (
                    <button
                      key={d}
                      onClick={() => setDuration(d)}
                      className={`
                        flex-1 py-2.5 rounded-xl text-sm font-medium
                        transition-all duration-200
                        ${duration === d
                          ? 'bg-white/10 text-white/90 border border-white/20'
                          : 'bg-white/[0.02] text-white/40 border border-white/[0.06] hover:bg-white/[0.05]'
                        }
                      `}
                    >
                      {d}s
                    </button>
                  ))}
                </div>
              </section>

              {/* Sound toggle */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/30">Subtle tones</span>
                  {soundEnabled && !soundAvailable && (
                    <span className="text-[10px] text-white/20">
                      (requires tap to activate)
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`
                    w-10 h-6 rounded-full transition-all duration-200 relative
                    ${soundEnabled ? 'bg-white/20' : 'bg-white/5'}
                  `}
                >
                  <div
                    className={`
                      w-4 h-4 rounded-full bg-white/80 absolute top-1 transition-transform duration-200
                      ${soundEnabled ? 'translate-x-5' : 'translate-x-1'}
                    `}
                  />
                </button>
              </div>

              {/* Start button */}
              <motion.button
                onClick={start}
                whileTap={{ scale: 0.96 }}
                className="
                  w-full py-4 rounded-2xl font-medium text-base
                  bg-gradient-to-r from-[#D4B896]/20 to-[#D4B896]/10
                  border border-[#D4B896]/20 text-[#D4B896]
                  hover:from-[#D4B896]/30 hover:to-[#D4B896]/20
                  transition-all duration-200
                "
              >
                Begin
              </motion.button>

              {/* Info footer */}
              <p className="text-center text-[11px] text-white/20 leading-relaxed">
                {Math.floor(duration / cycleLengthSec)} breath cycles
                &nbsp;&middot;&nbsp; {formatTime(duration)} total
              </p>
            </motion.div>
          )}

          {/* ══════════ RUNNING PHASE ══════════ */}
          {sessionPhase === 'running' && (
            <motion.div
              key="running"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center justify-center gap-10 w-full max-w-sm"
            >
              {/* Breathing orb */}
              <div className="relative w-56 h-56 flex items-center justify-center">
                {/* Outer glow ring */}
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `radial-gradient(circle, transparent 40%, rgba(212,184,150,${getOrbOpacity(currentBreathPhase, phaseProgress) * 0.15}) 70%, transparent 100%)`,
                    transform: `scale(${getOrbScale(currentBreathPhase, phaseProgress) * 1.3})`,
                    transition: 'transform 0.3s ease-out',
                  }}
                />

                {/* Main orb */}
                <div
                  className="w-40 h-40 rounded-full relative"
                  style={{
                    background: `radial-gradient(circle at 40% 40%,
                      rgba(212,184,150,${getOrbOpacity(currentBreathPhase, phaseProgress) * 0.6}) 0%,
                      rgba(212,184,150,${getOrbOpacity(currentBreathPhase, phaseProgress) * 0.2}) 50%,
                      rgba(212,184,150,0.02) 100%)`,
                    transform: `scale(${getOrbScale(currentBreathPhase, phaseProgress)})`,
                    transition: 'transform 0.3s ease-out, background 0.3s ease-out',
                    boxShadow: `0 0 ${40 * getOrbOpacity(currentBreathPhase, phaseProgress)}px rgba(212,184,150,${getOrbOpacity(currentBreathPhase, phaseProgress) * 0.3})`,
                  }}
                />

                {/* Phase label in center — aria-live for screen readers */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span
                    aria-live="polite"
                    aria-atomic="true"
                    className="text-lg font-light text-white/70 tracking-wide"
                  >
                    {PHASE_LABELS[currentBreathPhase]}
                  </span>
                </div>
              </div>

              {/* Time remaining */}
              <div className="text-center space-y-2">
                <div className="text-3xl font-light text-white/60 font-mono tracking-wider">
                  {formatTime(remaining)}
                </div>

                {/* Progress bar */}
                <div className="w-48 h-0.5 bg-white/5 rounded-full overflow-hidden mx-auto">
                  <div
                    className="h-full bg-[#D4B896]/40 rounded-full transition-all duration-500"
                    style={{ width: `${progress * 100}%` }}
                  />
                </div>

                {/* Cycle indicator */}
                <div className="text-[10px] text-white/20 font-mono">
                  cycle {cycleCount + 1}
                </div>
              </div>

              {/* Stop button — not "cancel", an exit that isn't failure */}
              <button
                onClick={reset}
                className="flex items-center gap-1.5 text-xs text-white/20 hover:text-white/40 transition-colors"
              >
                <Square className="w-3 h-3" />
                Stop
              </button>
            </motion.div>
          )}

          {/* ══════════ COMPLETE PHASE ══════════ */}
          {sessionPhase === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-8 w-full max-w-sm"
            >
              {/* Completion orb */}
              <div className="relative w-32 h-32 flex items-center justify-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0.3 }}
                  animate={{ scale: 1, opacity: 0.5 }}
                  transition={{ duration: 2, ease: 'easeOut' }}
                  className="w-32 h-32 rounded-full"
                  style={{
                    background: 'radial-gradient(circle at 40% 40%, rgba(212,184,150,0.3) 0%, rgba(212,184,150,0.05) 70%, transparent 100%)',
                  }}
                />
                <span className="absolute text-3xl">{pattern.emoji}</span>
              </div>

              {/* Neutral completion record — no praise, no coaching, just a record */}
              <div className="text-center space-y-2">
                {completionRecord && (
                  <p className="text-xs text-white/40 font-mono tracking-wide">
                    {formatTime(completionRecord.durationSec)}
                    {' \u00B7 '}
                    {completionRecord.protocolLabel}
                    {' \u00B7 '}
                    {completionRecord.cyclesCompleted} cycles
                  </p>
                )}
                <p className="text-[10px] text-white/20">
                  {completionRecord?.completedAt
                    ? new Date(completionRecord.completedAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : ''}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 w-full">
                <motion.button
                  onClick={reset}
                  whileTap={{ scale: 0.96 }}
                  className="
                    flex-1 flex items-center justify-center gap-2
                    py-3.5 rounded-xl font-medium text-sm
                    bg-white/[0.03] border border-white/[0.08]
                    text-white/50 hover:bg-white/[0.06]
                    transition-all duration-200
                  "
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Again
                </motion.button>

                <motion.button
                  onClick={() => router.push('/labtools')}
                  whileTap={{ scale: 0.96 }}
                  className="
                    flex-1 py-3.5 rounded-xl font-medium text-sm
                    bg-gradient-to-r from-[#D4B896]/15 to-[#D4B896]/08
                    border border-[#D4B896]/15 text-[#D4B896]/80
                    hover:from-[#D4B896]/25 hover:to-[#D4B896]/15
                    transition-all duration-200
                  "
                >
                  Done
                </motion.button>
              </div>

              {/* Shift → Notice corridor */}
              <ToolBridge
                text="You may notice something more clearly now."
                href="/labtools/parts-check-in"
                className="mt-3"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
