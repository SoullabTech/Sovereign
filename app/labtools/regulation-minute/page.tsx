'use client';

/**
 * Regulation Minute - Nervous System Downshift Tool
 *
 * A 60-120s guided regulation using breath patterns, sacred tones,
 * and haptic feedback. Reuses existing infrastructure:
 *   - BREATH_PATTERNS from hooks/useFieldBreathing.ts
 *   - HapticBreathSync from lib/haptics.ts
 *   - playSacredTone / cleanupAudio from lib/audio/sacred-tones.ts
 *
 * This is containment technology for the body: reduce activation,
 * increase coherence, return to baseline.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Wind, Pause, Play, RotateCcw } from 'lucide-react';
import {
  BREATH_PATTERNS,
  type BreathPattern,
} from '@/hooks/useFieldBreathing';
import { HapticBreathSync, supportsHaptics } from '@/lib/haptics';
import {
  playSacredTone,
  sacredTones,
  cleanupAudio,
} from '@/lib/audio/sacred-tones';

// ---------------------------------------------------------------------------
// CONSTANTS
// ---------------------------------------------------------------------------

type DurationSec = 60 | 90 | 120;
const DURATIONS: DurationSec[] = [60, 90, 120];

/** Subset of breath patterns that make sense for short regulation */
const REGULATION_PATTERNS: Record<string, BreathPattern> = {
  box: BREATH_PATTERNS.box,
  deep_calm: BREATH_PATTERNS.deep_calm,
  natural: BREATH_PATTERNS.natural,
};

/** Tones offered for regulation (grounding subset) */
const TONE_OPTIONS = [
  { key: 'off', label: 'Off', freq: 0 },
  { key: 'earth', label: 'Earth (396 Hz)', freq: sacredTones.earth },
  { key: 'water', label: 'Water (417 Hz)', freq: sacredTones.water },
  { key: 'time', label: 'Harmony (432 Hz)', freq: sacredTones.time },
] as const;

type ToneKey = (typeof TONE_OPTIONS)[number]['key'];

// ---------------------------------------------------------------------------
// PHASE DISPLAY
// ---------------------------------------------------------------------------

type BreathPhaseLabel = 'Inhale' | 'Hold' | 'Exhale' | 'Pause';

function getBreathPhase(
  elapsedInCycle: number,
  pattern: BreathPattern
): { phase: BreathPhaseLabel; progress: number } {
  const { inhale, hold, exhale, pause } = pattern;
  const total = inhale + hold + exhale + pause;
  const t = elapsedInCycle % total;

  if (t < inhale) return { phase: 'Inhale', progress: t / inhale };
  if (t < inhale + hold) return { phase: 'Hold', progress: (t - inhale) / hold };
  if (t < inhale + hold + exhale) return { phase: 'Exhale', progress: (t - inhale - hold) / exhale };
  return { phase: 'Pause', progress: (t - inhale - hold - exhale) / pause };
}

// ---------------------------------------------------------------------------
// COMPONENT
// ---------------------------------------------------------------------------

export default function RegulationMinutePage() {
  const router = useRouter();

  // --- Config state (locked while running) ---
  const [duration, setDuration] = useState<DurationSec>(60);
  const [patternKey, setPatternKey] = useState<string>('box');
  const [toneKey, setToneKey] = useState<ToneKey>('off');
  const [hapticsOn, setHapticsOn] = useState(false);

  // --- Timer state ---
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState<number>(duration);
  const [elapsed, setElapsed] = useState(0);

  // --- Refs for cleanup ---
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hapticRef = useRef<HapticBreathSync | null>(null);
  const toneIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const pattern = useMemo(() => REGULATION_PATTERNS[patternKey] ?? BREATH_PATTERNS.box, [patternKey]);
  const cycleLen = pattern.inhale + pattern.hold + pattern.exhale + pattern.pause;

  const deviceSupportsHaptics = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return supportsHaptics();
  }, []);

  // Sync remaining when duration changes (only when stopped)
  useEffect(() => {
    if (!running) {
      setRemaining(duration);
      setElapsed(0);
    }
  }, [duration, running]);

  // ---------------------------------------------------------------------------
  // TIMER TICK
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!running) return;

    timerRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
      setRemaining((prev) => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [running]);

  // Auto-stop at zero
  useEffect(() => {
    if (running && remaining === 0) {
      stopAll();
      setRunning(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, running]);

  // ---------------------------------------------------------------------------
  // START / STOP
  // ---------------------------------------------------------------------------

  function stopAll() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (toneIntervalRef.current) {
      clearInterval(toneIntervalRef.current);
      toneIntervalRef.current = null;
    }
    try { cleanupAudio(); } catch { /* ignore */ }
    try { hapticRef.current?.stop(); } catch { /* ignore */ }
    hapticRef.current = null;
  }

  function onStart() {
    if (remaining <= 0) {
      setRemaining(duration);
      setElapsed(0);
    }

    // --- Tone: play on a loop matching breath cycle duration ---
    const toneOption = TONE_OPTIONS.find((t) => t.key === toneKey);
    if (toneOption && toneOption.freq > 0) {
      // Play once immediately, then repeat each cycle
      playSacredTone(toneOption.freq, cycleLen, 0.04);
      toneIntervalRef.current = setInterval(() => {
        playSacredTone(toneOption.freq, cycleLen, 0.04);
      }, cycleLen * 1000);
    }

    // --- Haptics ---
    if (hapticsOn && deviceSupportsHaptics) {
      hapticRef.current = new HapticBreathSync();
      hapticRef.current.start(
        pattern.inhale * 1000,
        pattern.hold * 1000,
        pattern.exhale * 1000
      );
    }

    setRunning(true);
  }

  function onPause() {
    setRunning(false);
    stopAll();
  }

  function onReset() {
    setRunning(false);
    stopAll();
    setRemaining(duration);
    setElapsed(0);
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => stopAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------------------------------------------------------
  // DERIVED DISPLAY VALUES
  // ---------------------------------------------------------------------------

  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');
  const progressPct = duration > 0 ? ((duration - remaining) / duration) * 100 : 0;
  const breathPhase = running ? getBreathPhase(elapsed, pattern) : null;

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white">
      <div className="mx-auto max-w-2xl px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </button>
          <div className="flex items-center gap-2">
            <Wind className="w-5 h-5 text-teal-400" />
            <h1 className="text-xl font-semibold">Regulation Minute</h1>
          </div>
        </div>

        <p className="text-sm text-slate-400 mb-8">
          A 60-120s nervous-system downshift using breath, sound, and rhythm.
        </p>

        {/* Timer display */}
        <motion.div
          className="relative flex flex-col items-center justify-center py-12 mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Progress ring (background) */}
          <svg className="absolute w-56 h-56" viewBox="0 0 200 200">
            <circle
              cx="100" cy="100" r="90"
              fill="none"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="4"
            />
            <circle
              cx="100" cy="100" r="90"
              fill="none"
              stroke={running ? 'rgba(94,234,212,0.4)' : 'rgba(148,163,184,0.2)'}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 90}
              strokeDashoffset={2 * Math.PI * 90 * (1 - progressPct / 100)}
              transform="rotate(-90 100 100)"
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>

          {/* Time */}
          <div className="text-6xl font-light tabular-nums tracking-wider">
            {mm}:{ss}
          </div>

          {/* Breath phase indicator */}
          {breathPhase && (
            <motion.div
              key={breathPhase.phase}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3 text-sm text-teal-300 font-medium"
            >
              {breathPhase.phase}
            </motion.div>
          )}
        </motion.div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mb-10">
          {!running ? (
            <button
              onClick={onStart}
              className="flex items-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-500 px-6 py-3 text-sm font-medium transition-colors"
            >
              <Play className="w-4 h-4" />
              {remaining < duration ? 'Resume' : 'Start'}
            </button>
          ) : (
            <button
              onClick={onPause}
              className="flex items-center gap-2 rounded-xl border border-slate-700 hover:bg-white/5 px-6 py-3 text-sm font-medium transition-colors"
            >
              <Pause className="w-4 h-4" />
              Pause
            </button>
          )}
          <button
            onClick={onReset}
            className="flex items-center gap-2 rounded-xl border border-slate-700 hover:bg-white/5 px-4 py-3 text-sm transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>

        {/* Config panel (disabled while running) */}
        <div
          className={`rounded-2xl border border-slate-800/60 bg-[#12162a] p-6 space-y-6 ${
            running ? 'opacity-50 pointer-events-none' : ''
          }`}
        >
          {/* Duration */}
          <div>
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
              Duration
            </div>
            <div className="flex gap-2">
              {DURATIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`rounded-lg border px-4 py-2 text-sm transition-colors ${
                    duration === d
                      ? 'border-teal-500/50 bg-teal-500/10 text-teal-300'
                      : 'border-slate-700 hover:bg-white/5 text-slate-300'
                  }`}
                >
                  {d}s
                </button>
              ))}
            </div>
          </div>

          {/* Breath pattern */}
          <div>
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
              Breath Pattern
            </div>
            <div className="flex gap-2 flex-wrap">
              {Object.entries(REGULATION_PATTERNS).map(([key, p]) => (
                <button
                  key={key}
                  onClick={() => setPatternKey(key)}
                  className={`rounded-lg border px-4 py-2 text-sm transition-colors ${
                    patternKey === key
                      ? 'border-teal-500/50 bg-teal-500/10 text-teal-300'
                      : 'border-slate-700 hover:bg-white/5 text-slate-300'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
            <div className="mt-2 text-xs text-slate-500">
              {pattern.inhale}s in &middot; {pattern.hold}s hold &middot; {pattern.exhale}s out
              {pattern.pause > 0 && <> &middot; {pattern.pause}s pause</>}
            </div>
          </div>

          {/* Sacred tone */}
          <div>
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
              Sacred Tone
            </div>
            <div className="flex gap-2 flex-wrap">
              {TONE_OPTIONS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setToneKey(t.key)}
                  className={`rounded-lg border px-4 py-2 text-sm transition-colors ${
                    toneKey === t.key
                      ? 'border-teal-500/50 bg-teal-500/10 text-teal-300'
                      : 'border-slate-700 hover:bg-white/5 text-slate-300'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Haptics */}
          <div>
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
              Haptics
            </div>
            {deviceSupportsHaptics ? (
              <label className="flex items-center gap-3 text-sm text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hapticsOn}
                  onChange={(e) => setHapticsOn(e.target.checked)}
                  className="rounded border-slate-600 bg-slate-800 text-teal-500 focus:ring-teal-500/30"
                />
                Breath-synced haptic feedback
              </label>
            ) : (
              <div className="text-xs text-slate-500">
                Not available on this device
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
