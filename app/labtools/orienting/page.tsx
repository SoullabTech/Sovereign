'use client';

/**
 * Orienting Tool - Ventral Vagal Entry Ramp
 *
 * A structured perceptual sequence that widens the sensory field
 * and confirms "here, now, safe enough" through simple orientation.
 *
 * No coaching. No interpretation. No "notice how you feel."
 * Just micro-prompts that alternate between:
 *   - External orientation (vision + sound)
 *   - Contact orientation (touch + weight)
 *
 * This is the front door to the Somatic lane:
 *   Orient -> Regulate -> Sense
 *
 * Uses existing infra:
 *   - triggerHapticPulse() from lib/haptics.ts
 *   - playSacredTone() from lib/audio/sacred-tones.ts (single tick)
 *   - ToolBridge for cross-domain doorway on completion
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCcw, Square } from 'lucide-react';
import { triggerHapticPulse, supportsHaptics } from '@/lib/haptics';
import { playSacredTone, sacredTones } from '@/lib/audio/sacred-tones';
import { ToolBridge } from '@/components/labtools/ToolBridge';

// ---------------------------------------------------------------------------
// PROMPT LIBRARY
// ---------------------------------------------------------------------------

type PromptCategory = 'look' | 'listen' | 'contact' | 'weight';

interface OrientingPrompt {
  category: PromptCategory;
  text: string;
  hint?: string;
}

const PROMPT_LIBRARY: Record<PromptCategory, OrientingPrompt[]> = {
  look: [
    { text: 'Find 3 edges.', hint: 'Let your eyes move.' },
    { text: 'Find one straight line.' },
    { text: 'Find something circular.' },
    { text: 'Find one color.' },
    { text: 'Find something still.' },
    { text: 'Find something far.', hint: 'Let your gaze soften.' },
  ],
  listen: [
    { text: 'Name 3 sounds.' },
    { text: 'Find the farthest sound.' },
    { text: 'Notice the quiet behind sounds.' },
  ],
  contact: [
    { text: 'Feel your feet.' },
    { text: 'Feel your seat.' },
    { text: 'Press fingertips together.' },
    { text: 'Feel your hands.' },
  ],
  weight: [
    { text: 'Let your weight drop 5%.', hint: 'Just 5%.' },
    { text: 'Exhale and settle.' },
  ],
};

// ---------------------------------------------------------------------------
// 8-STEP LOOP (environment -> contact -> environment -> contact)
// ---------------------------------------------------------------------------

type StepSlot = {
  category: PromptCategory;
  variant: string;
};

const LOOP_PATTERN: StepSlot[] = [
  { category: 'look', variant: 'near' },
  { category: 'look', variant: 'far' },
  { category: 'listen', variant: 'any' },
  { category: 'contact', variant: 'feet' },
  { category: 'look', variant: 'color' },
  { category: 'listen', variant: 'farthest' },
  { category: 'contact', variant: 'seat' },
  { category: 'weight', variant: 'settle' },
];

const VARIANT_KEYWORDS: Record<string, string[]> = {
  near: ['edges', 'straight', 'circular'],
  far: ['far'],
  color: ['color'],
  farthest: ['farthest'],
  feet: ['feet'],
  seat: ['seat', 'back'],
  settle: ['weight', 'settle', 'Exhale'],
  any: [],
};

/** Resolve a step slot to a concrete prompt, avoiding recent repeats. */
function resolvePrompt(
  slot: StepSlot,
  usedIndices: Map<PromptCategory, Set<number>>
): OrientingPrompt {
  const pool = PROMPT_LIBRARY[slot.category];
  const used = usedIndices.get(slot.category) ?? new Set();
  const keywords = VARIANT_KEYWORDS[slot.variant] ?? [];

  // Prefer keyword match not yet used
  for (const kw of keywords) {
    const idx = pool.findIndex(
      (p, i) => !used.has(i) && p.text.toLowerCase().includes(kw.toLowerCase())
    );
    if (idx >= 0) {
      used.add(idx);
      usedIndices.set(slot.category, used);
      return { ...pool[idx], category: slot.category };
    }
  }

  // Fallback: any unused
  for (let i = 0; i < pool.length; i++) {
    if (!used.has(i)) {
      used.add(i);
      usedIndices.set(slot.category, used);
      return { ...pool[i], category: slot.category };
    }
  }

  // All exhausted — reset
  const fresh = new Set<number>();
  usedIndices.set(slot.category, fresh);
  for (const kw of keywords) {
    const idx = pool.findIndex((p) =>
      p.text.toLowerCase().includes(kw.toLowerCase())
    );
    if (idx >= 0) {
      fresh.add(idx);
      return { ...pool[idx], category: slot.category };
    }
  }
  fresh.add(0);
  return { ...pool[0], category: slot.category };
}

// ---------------------------------------------------------------------------
// TYPES & CONSTANTS
// ---------------------------------------------------------------------------

type DurationSec = 30 | 60 | 90;
type Pace = 'gentle' | 'standard' | 'brisk';
type SessionPhase = 'setup' | 'running' | 'complete';

const DURATIONS: DurationSec[] = [30, 60, 90];

const PACE_OPTIONS: { key: Pace; label: string; stepSec: number }[] = [
  { key: 'gentle', label: 'Gentle', stepSec: 5.5 },
  { key: 'standard', label: 'Standard', stepSec: 4.5 },
  { key: 'brisk', label: 'Brisk', stepSec: 3.5 },
];

const CATEGORY_LABELS: Record<PromptCategory, string> = {
  look: 'Look',
  listen: 'Listen',
  contact: 'Contact',
  weight: 'Weight',
};

const CATEGORY_EMOJIS: Record<PromptCategory, string> = {
  look: '\u{1F441}',
  listen: '\u{1F442}',
  contact: '\u{270B}',
  weight: '\u{1FAA8}',
};

// Subtle tick tone
const TICK_FREQ = sacredTones.earth; // 396 Hz
const TICK_DURATION = 0.15;
const TICK_VOLUME = 0.03;

/**
 * Completion record — structured for future "Track Patterns" integration.
 */
interface CompletionRecord {
  durationSec: DurationSec;
  pace: Pace;
  soundOn: boolean;
  promptsCompleted: number;
  completedAt: string;
}

// ---------------------------------------------------------------------------
// COMPONENT
// ---------------------------------------------------------------------------

export default function OrientingPage() {
  const router = useRouter();

  // ── Config ──
  const [duration, setDuration] = useState<DurationSec>(60);
  const [pace, setPace] = useState<Pace>('standard');
  const [soundOn, setSoundOn] = useState(false);
  const [hapticsOn, setHapticsOn] = useState(true);

  // ── State ──
  const [sessionPhase, setSessionPhase] = useState<SessionPhase>('setup');
  const [remaining, setRemaining] = useState<number>(duration);
  const [currentPrompt, setCurrentPrompt] = useState<OrientingPrompt | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [promptsCompleted, setPromptsCompleted] = useState(0);
  const [completionRecord, setCompletionRecord] = useState<CompletionRecord | null>(null);
  const [soundAvailable, setSoundAvailable] = useState(true);

  // ── Refs ──
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stepTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const usedIndicesRef = useRef<Map<PromptCategory, Set<number>>>(new Map());

  const deviceSupportsHaptics = typeof window !== 'undefined' && supportsHaptics();
  const paceConfig = PACE_OPTIONS.find((p) => p.key === pace) ?? PACE_OPTIONS[1];

  // Sync remaining when duration changes (setup only)
  useEffect(() => {
    if (sessionPhase === 'setup') setRemaining(duration);
  }, [duration, sessionPhase]);

  // ---------------------------------------------------------------------------
  // STEP ENGINE
  // ---------------------------------------------------------------------------

  const advanceStep = useCallback(() => {
    const loopIdx = stepIndex % LOOP_PATTERN.length;
    const slot = LOOP_PATTERN[loopIdx];
    const prompt = resolvePrompt(slot, usedIndicesRef.current);

    setCurrentPrompt(prompt);
    setStepIndex((prev) => prev + 1);
    setPromptsCompleted((prev) => prev + 1);

    // Haptic tick
    if (hapticsOn && deviceSupportsHaptics) {
      try { triggerHapticPulse('soft'); } catch { /* ignore */ }
    }

    // Sound tick
    if (soundOn && soundAvailable) {
      try {
        playSacredTone(TICK_FREQ, TICK_DURATION, TICK_VOLUME);
      } catch {
        setSoundAvailable(false);
      }
    }
  }, [stepIndex, hapticsOn, deviceSupportsHaptics, soundOn, soundAvailable]);

  // ---------------------------------------------------------------------------
  // START / STOP / RESET
  // ---------------------------------------------------------------------------

  function stopAll() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (stepTimerRef.current) { clearInterval(stepTimerRef.current); stepTimerRef.current = null; }
  }

  function start() {
    setRemaining(duration);
    setStepIndex(0);
    setPromptsCompleted(0);
    setCompletionRecord(null);
    usedIndicesRef.current = new Map();

    // First prompt immediately
    const slot = LOOP_PATTERN[0];
    const prompt = resolvePrompt(slot, usedIndicesRef.current);
    setCurrentPrompt(prompt);
    setStepIndex(1);
    setPromptsCompleted(1);

    if (hapticsOn && deviceSupportsHaptics) {
      try { triggerHapticPulse('soft'); } catch { /* ignore */ }
    }
    if (soundOn) {
      try {
        playSacredTone(TICK_FREQ, TICK_DURATION, TICK_VOLUME);
      } catch {
        setSoundAvailable(false);
      }
    }

    setSessionPhase('running');
  }

  function reset() {
    stopAll();
    setSessionPhase('setup');
    setCurrentPrompt(null);
    setRemaining(duration);
    setCompletionRecord(null);
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => stopAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------------------------------------------------------
  // COUNTDOWN (1s)
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (sessionPhase !== 'running') return;

    timerRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    };
  }, [sessionPhase]);

  // ---------------------------------------------------------------------------
  // STEP TIMER (pace-based)
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (sessionPhase !== 'running') return;

    stepTimerRef.current = setInterval(() => {
      advanceStep();
    }, paceConfig.stepSec * 1000);

    return () => {
      if (stepTimerRef.current) { clearInterval(stepTimerRef.current); stepTimerRef.current = null; }
    };
  }, [sessionPhase, paceConfig.stepSec, advanceStep]);

  // ---------------------------------------------------------------------------
  // AUTO-COMPLETE + RECORD
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (sessionPhase === 'running' && remaining === 0) {
      stopAll();
      setSessionPhase('complete');
      triggerHapticPulse('medium');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, sessionPhase]);

  useEffect(() => {
    if (sessionPhase === 'complete') {
      setCompletionRecord({
        durationSec: duration,
        pace,
        soundOn,
        promptsCompleted,
        completedAt: new Date().toISOString(),
      });
    }
  }, [sessionPhase, duration, pace, soundOn, promptsCompleted]);

  // ---------------------------------------------------------------------------
  // DERIVED
  // ---------------------------------------------------------------------------

  const progress = duration > 0 ? (duration - remaining) / duration : 0;

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-[#0a0f14] text-white flex flex-col">
      {/* ── Header ── */}
      <header className="flex items-center gap-3 px-5 pt-5 pb-3">
        <button
          onClick={() => {
            if (sessionPhase === 'running') {
              stopAll();
              setSessionPhase('complete');
            } else {
              router.push('/labtools');
            }
          }}
          className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-white/60" />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-lg">{'\u{1F441}'}</span>
          <h1 className="text-base font-medium text-white/80">Orienting</h1>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="flex-1 flex flex-col items-center justify-center px-5 pb-10">
        <AnimatePresence mode="wait">
          {/* ══════════ SETUP ══════════ */}
          {sessionPhase === 'setup' && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-sm space-y-8"
            >
              <p className="text-xs text-white/30 text-center leading-relaxed">
                Expand your field. Return to the room.
              </p>

              {/* Duration */}
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

              {/* Pace */}
              <section className="space-y-3">
                <p className="text-xs text-white/30 uppercase tracking-wider font-medium">
                  Pace
                </p>
                <div className="flex gap-2">
                  {PACE_OPTIONS.map((p) => (
                    <button
                      key={p.key}
                      onClick={() => setPace(p.key)}
                      className={`
                        flex-1 py-2.5 rounded-xl text-sm font-medium
                        transition-all duration-200
                        ${pace === p.key
                          ? 'bg-white/10 text-white/90 border border-white/20'
                          : 'bg-white/[0.02] text-white/40 border border-white/[0.06] hover:bg-white/[0.05]'
                        }
                      `}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-white/20 text-center">
                  {paceConfig.stepSec}s per prompt
                </p>
              </section>

              {/* Sound toggle */}
              <div className="flex items-center justify-between px-1">
                <span className="text-xs text-white/30">Subtle tick at each step</span>
                <button
                  onClick={() => setSoundOn(!soundOn)}
                  className={`
                    w-10 h-6 rounded-full transition-all duration-200 relative
                    ${soundOn ? 'bg-white/20' : 'bg-white/5'}
                  `}
                >
                  <div
                    className={`
                      w-4 h-4 rounded-full bg-white/80 absolute top-1 transition-transform duration-200
                      ${soundOn ? 'translate-x-5' : 'translate-x-1'}
                    `}
                  />
                </button>
              </div>

              {/* Haptics toggle */}
              {deviceSupportsHaptics && (
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs text-white/30">Soft pulse at each step</span>
                  <button
                    onClick={() => setHapticsOn(!hapticsOn)}
                    className={`
                      w-10 h-6 rounded-full transition-all duration-200 relative
                      ${hapticsOn ? 'bg-white/20' : 'bg-white/5'}
                    `}
                  >
                    <div
                      className={`
                        w-4 h-4 rounded-full bg-white/80 absolute top-1 transition-transform duration-200
                        ${hapticsOn ? 'translate-x-5' : 'translate-x-1'}
                      `}
                    />
                  </button>
                </div>
              )}

              {/* Begin */}
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
                ~{Math.round(duration / paceConfig.stepSec)} prompts
                &nbsp;&middot;&nbsp; {formatTime(duration)} total
              </p>
            </motion.div>
          )}

          {/* ══════════ RUNNING ══════════ */}
          {sessionPhase === 'running' && (
            <motion.div
              key="running"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center justify-center gap-8 w-full max-w-sm"
            >
              {/* Category emoji */}
              {currentPrompt && (
                <motion.span
                  key={currentPrompt.category + stepIndex}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 0.4, scale: 1 }}
                  className="text-4xl"
                >
                  {CATEGORY_EMOJIS[currentPrompt.category]}
                </motion.span>
              )}

              {/* Prompt */}
              <div
                className="min-h-[100px] flex flex-col items-center justify-center px-4"
                aria-live="polite"
                aria-atomic="true"
              >
                <AnimatePresence mode="wait">
                  {currentPrompt && (
                    <motion.div
                      key={`${stepIndex}-${currentPrompt.text}`}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.35 }}
                      className="text-center"
                    >
                      <p className="text-xl font-light text-white/80 leading-relaxed tracking-wide">
                        {currentPrompt.text}
                      </p>
                      {currentPrompt.hint && (
                        <p className="mt-3 text-xs text-white/20">
                          {currentPrompt.hint}
                        </p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Timer + progress */}
              <div className="text-center space-y-2">
                <div className="text-2xl font-light text-white/40 font-mono tracking-wider">
                  {formatTime(remaining)}
                </div>
                <div className="w-48 h-0.5 bg-white/5 rounded-full overflow-hidden mx-auto">
                  <div
                    className="h-full bg-white/15 rounded-full transition-all duration-500"
                    style={{ width: `${progress * 100}%` }}
                  />
                </div>
                <div className="text-[10px] text-white/15 font-mono">
                  {CATEGORY_LABELS[currentPrompt?.category ?? 'look']}
                </div>
              </div>

              {/* Stop */}
              <button
                onClick={() => {
                  stopAll();
                  setSessionPhase('complete');
                }}
                className="flex items-center gap-1.5 text-xs text-white/20 hover:text-white/40 transition-colors"
              >
                <Square className="w-3 h-3" />
                Stop
              </button>
            </motion.div>
          )}

          {/* ══════════ COMPLETE ══════════ */}
          {sessionPhase === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-8 w-full max-w-sm"
            >
              {/* Completion record */}
              <div className="text-center space-y-2">
                {completionRecord && (
                  <p className="text-xs text-white/40 font-mono tracking-wide">
                    {formatTime(completionRecord.durationSec)}
                    {' \u00B7 '}
                    {paceConfig.label}
                    {' \u00B7 '}
                    {completionRecord.promptsCompleted} prompts
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

              {/* Orient -> Regulate corridor */}
              <ToolBridge
                text="If you want, try a minute of breath now."
                href="/labtools/regulation-minute"
                className="mt-3"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
