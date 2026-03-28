'use client';

/**
 * Coherence — Measure and refine your state
 *
 * Heart-focused breathing with pre/post state check-in.
 * Three protocols: Quick Reset (2m), Guided Coherence (5m), Emotional Coherence (5m).
 *
 * Self-report check-in before and after, simple shift inference.
 * Physiological data captured via adapter when Apple Watch is connected.
 *
 * Uses shared breath engine from lib/somatic/.
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCcw, Square, ChevronRight } from 'lucide-react';
import { playSacredTone, sacredTones } from '@/lib/audio/sacred-tones';
import { triggerHapticPulse, HapticBreathSync, supportsHaptics } from '@/lib/haptics';
import { ToolBridge } from '@/components/labtools/ToolBridge';
import {
  getCycleLength,
  getPhaseAtSecond,
  getCompletedCycles,
  getPhasePrompt,
  getOrbScale,
  getOrbOpacity,
} from '@/lib/somatic/breathEngine';
import {
  getPhysiologySnapshot,
  formatSnapshotForDisplay,
  type PhysiologicalSnapshot,
} from '@/lib/somatic/physiologyAdapter';
import {
  type SomaticCheckIn,
  type Activation,
  type EnergyLevel,
  type BodyState,
  type CoherenceProtocolId,
  type InferredShift,
  inferShift,
  shiftLabel,
} from '@/lib/somatic/types';

// ─────────────────────────────────────────────────────
// PROTOCOL CONFIG
// ─────────────────────────────────────────────────────

interface CoherenceProtocol {
  id: CoherenceProtocolId;
  label: string;
  description: string;
  emoji: string;
  durationSec: number;
  /** Guidance prompts shown during the session */
  prompts: string[];
}

const COHERENCE_PROTOCOLS: CoherenceProtocol[] = [
  {
    id: 'quick_reset',
    label: 'Quick Reset',
    description: '2 minutes. Breath and heart center.',
    emoji: '\u{26A1}',
    durationSec: 120,
    prompts: [
      'Bring attention to your heart center.',
      'Breathe slowly through the heart.',
      'Let the breath find its own rhythm.',
      'Notice what settles.',
    ],
  },
  {
    id: 'guided_coherence',
    label: 'Guided Coherence',
    description: '5 minutes. Paced breath, heart focus, steadiness.',
    emoji: '\u{1F49A}',
    durationSec: 300,
    prompts: [
      'Bring attention to the area of your heart.',
      'Breathe slowly and steadily.',
      'Imagine breathing through your heart.',
      'Find a rhythm that feels natural.',
      'Let each breath deepen the contact.',
      'Notice what arises without following it.',
      'Stay with the breath.',
      'Let steadiness build on its own.',
    ],
  },
  {
    id: 'emotional_coherence',
    label: 'Emotional Coherence',
    description: '5 minutes. Heart breath + felt appreciation.',
    emoji: '\u{2728}',
    durationSec: 300,
    prompts: [
      'Breathe into the heart center.',
      'Bring to mind a person, place, or moment that naturally softens you.',
      'Let the feeling of appreciation arise.',
      'Breathe with that feeling.',
      'No need to force it. Just stay near it.',
      'Let the warmth radiate outward.',
      'Notice what shifts in your body.',
      'Stay with the quality of the feeling.',
    ],
  },
];

// All coherence protocols use 5-5 breathing (coherent rhythm)
const COHERENCE_BREATH = { inhale: 5, holdIn: 0, exhale: 5, holdOut: 0 };
const COHERENCE_TONE_HZ = sacredTones.aether; // 963 Hz

// ─────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────

type Phase = 'checkin-pre' | 'running' | 'checkin-post' | 'complete';

const ACTIVATIONS: { key: Activation; label: string }[] = [
  { key: 'calm', label: 'Calm' },
  { key: 'tense', label: 'Tense' },
  { key: 'overwhelmed', label: 'Overwhelmed' },
  { key: 'shutdown', label: 'Shut down' },
  { key: 'mixed', label: 'Mixed' },
];

const ENERGY_LEVELS: { key: EnergyLevel; label: string }[] = [
  { key: 'low', label: 'Low' },
  { key: 'medium', label: 'Medium' },
  { key: 'high', label: 'High' },
];

const BODY_STATES: { key: BodyState; label: string }[] = [
  { key: 'grounded', label: 'Grounded' },
  { key: 'scattered', label: 'Scattered' },
  { key: 'heavy', label: 'Heavy' },
  { key: 'agitated', label: 'Agitated' },
  { key: 'numb', label: 'Numb' },
];

// ─────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────

function tryPlayTone(freq: number, dur: number, vol: number): boolean {
  try { playSacredTone(freq, dur, vol); return true; } catch { return false; }
}

// ─────────────────────────────────────────────────────
// CHECK-IN COMPONENT (reused for pre and post)
// ─────────────────────────────────────────────────────

function CheckInForm({
  title,
  onSubmit,
}: {
  title: string;
  onSubmit: (checkIn: SomaticCheckIn) => void;
}) {
  const [activation, setActivation] = useState<Activation>('calm');
  const [energy, setEnergy] = useState<EnergyLevel>('medium');
  const [bodyState, setBodyState] = useState<BodyState | undefined>(undefined);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-sm space-y-6"
    >
      <p className="text-xs text-white/40 text-center">{title}</p>

      {/* Activation */}
      <section className="space-y-2">
        <p className="text-xs text-white/30 uppercase tracking-wider font-medium">Activation</p>
        <div className="flex flex-wrap gap-2">
          {ACTIVATIONS.map((a) => (
            <button
              key={a.key}
              onClick={() => setActivation(a.key)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all
                ${activation === a.key
                  ? 'bg-white/10 text-white/90 border border-white/20'
                  : 'bg-white/[0.02] text-white/40 border border-white/[0.06] hover:bg-white/[0.05]'
                }`}
            >
              {a.label}
            </button>
          ))}
        </div>
      </section>

      {/* Energy */}
      <section className="space-y-2">
        <p className="text-xs text-white/30 uppercase tracking-wider font-medium">Energy</p>
        <div className="flex gap-2">
          {ENERGY_LEVELS.map((e) => (
            <button
              key={e.key}
              onClick={() => setEnergy(e.key)}
              className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all
                ${energy === e.key
                  ? 'bg-white/10 text-white/90 border border-white/20'
                  : 'bg-white/[0.02] text-white/40 border border-white/[0.06] hover:bg-white/[0.05]'
                }`}
            >
              {e.label}
            </button>
          ))}
        </div>
      </section>

      {/* Body State (optional) */}
      <section className="space-y-2">
        <p className="text-xs text-white/30 uppercase tracking-wider font-medium">Body State <span className="text-white/15">(optional)</span></p>
        <div className="flex flex-wrap gap-2">
          {BODY_STATES.map((b) => (
            <button
              key={b.key}
              onClick={() => setBodyState(bodyState === b.key ? undefined : b.key)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all
                ${bodyState === b.key
                  ? 'bg-white/10 text-white/90 border border-white/20'
                  : 'bg-white/[0.02] text-white/40 border border-white/[0.06] hover:bg-white/[0.05]'
                }`}
            >
              {b.label}
            </button>
          ))}
        </div>
      </section>

      {/* Continue */}
      <motion.button
        onClick={() => onSubmit({ activation, energy, bodyState })}
        whileTap={{ scale: 0.96 }}
        className="w-full py-4 rounded-2xl font-medium text-base bg-gradient-to-r from-[#D4B896]/20 to-[#D4B896]/10 border border-[#D4B896]/20 text-[#D4B896] hover:from-[#D4B896]/30 hover:to-[#D4B896]/20 transition-all duration-200 flex items-center justify-center gap-2"
      >
        Continue <ChevronRight className="w-4 h-4" />
      </motion.button>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────

export default function CoherencePage() {
  const router = useRouter();

  // ── State ──
  const [selectedProtocol, setSelectedProtocol] = useState<CoherenceProtocol>(COHERENCE_PROTOCOLS[0]);
  const [phase, setPhase] = useState<Phase>('checkin-pre');
  const [preState, setPreState] = useState<SomaticCheckIn | null>(null);
  const [postState, setPostState] = useState<SomaticCheckIn | null>(null);
  const [shift, setShift] = useState<InferredShift>('no_change');

  // ── Physiology (from Apple Watch when connected) ──
  const [prePhysiology, setPrePhysiology] = useState<PhysiologicalSnapshot | null>(null);
  const [postPhysiology, setPostPhysiology] = useState<PhysiologicalSnapshot | null>(null);

  // ── Running state ──
  const [elapsed, setElapsed] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const [currentPromptIdx, setCurrentPromptIdx] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [soundAvailable, setSoundAvailable] = useState(true);

  // ── Refs ──
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);
  const hapticSyncRef = useRef<HapticBreathSync | null>(null);
  const lastToneTimeRef = useRef(0);

  // ── Derived ──
  const duration = selectedProtocol.durationSec;
  const cycleLengthSec = getCycleLength(COHERENCE_BREATH);
  const remaining = Math.max(0, duration - elapsed);
  const progress = duration > 0 ? elapsed / duration : 0;
  const phaseState = getPhaseAtSecond(COHERENCE_BREATH, elapsed);

  // ── Prompt rotation ──
  const promptInterval = duration / selectedProtocol.prompts.length;

  // ─────────────────────────────────────────────────
  // PROTOCOL SELECTION (shown before check-in)
  // ─────────────────────────────────────────────────

  const [showProtocolSelect, setShowProtocolSelect] = useState(true);

  // ─────────────────────────────────────────────────
  // ENGINE
  // ─────────────────────────────────────────────────

  const tick = useCallback(() => {
    const now = performance.now();
    const elapsedSec = (now - startTimeRef.current) / 1000;

    if (elapsedSec >= duration) {
      setElapsed(duration);
      setPhase('checkin-post');
      triggerHapticPulse('strong');
      return;
    }

    setElapsed(elapsedSec);
    setCycleCount(getCompletedCycles(COHERENCE_BREATH, elapsedSec));

    // Rotate guidance prompts
    const promptIdx = Math.min(
      Math.floor(elapsedSec / promptInterval),
      selectedProtocol.prompts.length - 1
    );
    setCurrentPromptIdx(promptIdx);

    // Haptic on inhale start
    const ps = getPhaseAtSecond(COHERENCE_BREATH, elapsedSec);
    if (ps.phase === 'inhale' && ps.phaseProgress < 0.05) {
      const cycleStartTime = getCompletedCycles(COHERENCE_BREATH, elapsedSec) * cycleLengthSec;
      if (elapsedSec - cycleStartTime < 0.1) {
        triggerHapticPulse('soft');
      }
    }
  }, [duration, cycleLengthSec, promptInterval, selectedProtocol.prompts.length]);

  const startSession = useCallback(() => {
    setPhase('running');
    setElapsed(0);
    setCycleCount(0);
    setCurrentPromptIdx(0);
    startTimeRef.current = performance.now();

    if (supportsHaptics()) {
      hapticSyncRef.current = new HapticBreathSync();
      hapticSyncRef.current.start(
        COHERENCE_BREATH.inhale * 1000,
        COHERENCE_BREATH.holdIn * 1000,
        COHERENCE_BREATH.exhale * 1000
      );
    }

    if (soundEnabled) {
      const played = tryPlayTone(COHERENCE_TONE_HZ, 2, 0.04);
      if (!played) setSoundAvailable(false);
    }

    triggerHapticPulse('medium');
  }, [soundEnabled]);

  const stop = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    hapticSyncRef.current?.stop();
    hapticSyncRef.current = null;
  }, []);

  const reset = useCallback(() => {
    stop();
    setPhase('checkin-pre');
    setShowProtocolSelect(true);
    setElapsed(0);
    setCycleCount(0);
    setPreState(null);
    setPostState(null);
    setPrePhysiology(null);
    setPostPhysiology(null);
    setShift('no_change');
  }, [stop]);

  useEffect(() => {
    if (phase === 'running') {
      intervalRef.current = setInterval(tick, 16);
      return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    } else {
      stop();
    }
  }, [phase, tick, stop]);

  // ── Cycle tone ──
  useEffect(() => {
    if (phase !== 'running' || !soundEnabled || !soundAvailable) return;
    const cycleStartTime = cycleCount * cycleLengthSec;
    const timeSinceCycleStart = elapsed - cycleStartTime;
    if (timeSinceCycleStart < 0.2 && elapsed > 0.5) {
      const now = performance.now();
      if (now - lastToneTimeRef.current > 3000) {
        lastToneTimeRef.current = now;
        tryPlayTone(COHERENCE_TONE_HZ, 2, 0.025);
      }
    }
  }, [cycleCount, elapsed, cycleLengthSec, phase, soundEnabled, soundAvailable]);

  useEffect(() => { return () => { stop(); }; }, [stop]);

  // ─────────────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────────────

  const handlePreCheckIn = (checkIn: SomaticCheckIn) => {
    setPreState(checkIn);
    // Capture physiology before session (silent — null if no device)
    setPrePhysiology(getPhysiologySnapshot());
    startSession();
  };

  const handlePostCheckIn = (checkIn: SomaticCheckIn) => {
    setPostState(checkIn);
    // Capture physiology after session
    setPostPhysiology(getPhysiologySnapshot());
    const inferredShift = inferShift(preState ?? undefined, checkIn);
    setShift(inferredShift);
    setPhase('complete');
    if (soundEnabled && soundAvailable) {
      tryPlayTone(sacredTones.earth, 3, 0.05);
    }
  };

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
      <header className="flex items-center gap-3 px-5 pt-5 pb-3">
        <button
          onClick={() => {
            if (phase === 'running') { stop(); setPhase('checkin-post'); }
            else { router.push('/labtools'); }
          }}
          className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-white/60" />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-lg">{'\u{1F49A}'}</span>
          <h1 className="text-base font-medium text-white/80">Coherence</h1>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-5 pb-10">
        <AnimatePresence mode="wait">
          {/* ══════════ PROTOCOL SELECT + PRE CHECK-IN ══════════ */}
          {phase === 'checkin-pre' && showProtocolSelect && (
            <motion.div
              key="protocol-select"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-sm space-y-6"
            >
              <p className="text-xs text-white/30 text-center leading-relaxed">
                Use breath, attention, and awareness to restore coherence.
              </p>

              <section className="space-y-3">
                <p className="text-xs text-white/30 uppercase tracking-wider font-medium">Protocol</p>
                <div className="space-y-2">
                  {COHERENCE_PROTOCOLS.map((p) => {
                    const isSelected = selectedProtocol.id === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => setSelectedProtocol(p)}
                        className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 text-left
                          ${isSelected ? 'bg-white/10 border border-white/20' : 'bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.05]'}`}
                      >
                        <span className="text-2xl">{p.emoji}</span>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-white/90">{p.label}</div>
                          <div className="text-xs text-white/40 mt-0.5">{p.description}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Sound toggle */}
              <div className="flex items-center justify-between px-1">
                <span className="text-xs text-white/30">Subtle tones</span>
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`w-10 h-6 rounded-full transition-all duration-200 relative ${soundEnabled ? 'bg-white/20' : 'bg-white/5'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white/80 absolute top-1 transition-transform duration-200 ${soundEnabled ? 'translate-x-5' : 'translate-x-1'}`} />
                </button>
              </div>

              <motion.button
                onClick={() => setShowProtocolSelect(false)}
                whileTap={{ scale: 0.96 }}
                className="w-full py-4 rounded-2xl font-medium text-base bg-gradient-to-r from-[#D4B896]/20 to-[#D4B896]/10 border border-[#D4B896]/20 text-[#D4B896] hover:from-[#D4B896]/30 hover:to-[#D4B896]/20 transition-all duration-200 flex items-center justify-center gap-2"
              >
                Check In <ChevronRight className="w-4 h-4" />
              </motion.button>

              <p className="text-center text-[11px] text-white/20">{formatTime(selectedProtocol.durationSec)} session</p>
            </motion.div>
          )}

          {phase === 'checkin-pre' && !showProtocolSelect && (
            <CheckInForm
              key="pre-checkin"
              title="How are you right now?"
              onSubmit={handlePreCheckIn}
            />
          )}

          {/* ══════════ RUNNING ══════════ */}
          {phase === 'running' && (
            <motion.div
              key="running"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center justify-center gap-8 w-full max-w-sm"
            >
              {/* Guidance prompt */}
              <AnimatePresence mode="wait">
                <motion.p
                  key={currentPromptIdx}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 0.5, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.6 }}
                  className="text-sm text-white/40 text-center max-w-xs leading-relaxed min-h-[40px]"
                >
                  {selectedProtocol.prompts[currentPromptIdx]}
                </motion.p>
              </AnimatePresence>

              {/* Breathing orb */}
              <div className="relative w-56 h-56 flex items-center justify-center">
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `radial-gradient(circle, transparent 40%, rgba(100,200,150,${getOrbOpacity(phaseState.phase, phaseState.phaseProgress) * 0.12}) 70%, transparent 100%)`,
                    transform: `scale(${getOrbScale(phaseState.phase, phaseState.phaseProgress) * 1.3})`,
                    transition: 'transform 0.3s ease-out',
                  }}
                />
                <div
                  className="w-40 h-40 rounded-full relative"
                  style={{
                    background: `radial-gradient(circle at 40% 40%,
                      rgba(100,200,150,${getOrbOpacity(phaseState.phase, phaseState.phaseProgress) * 0.5}) 0%,
                      rgba(100,200,150,${getOrbOpacity(phaseState.phase, phaseState.phaseProgress) * 0.15}) 50%,
                      rgba(100,200,150,0.02) 100%)`,
                    transform: `scale(${getOrbScale(phaseState.phase, phaseState.phaseProgress)})`,
                    transition: 'transform 0.3s ease-out, background 0.3s ease-out',
                    boxShadow: `0 0 ${40 * getOrbOpacity(phaseState.phase, phaseState.phaseProgress)}px rgba(100,200,150,${getOrbOpacity(phaseState.phase, phaseState.phaseProgress) * 0.25})`,
                  }}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span aria-live="polite" aria-atomic="true" className="text-lg font-light text-white/70 tracking-wide">
                    {getPhasePrompt(phaseState.phase)}
                  </span>
                </div>
              </div>

              {/* Timer */}
              <div className="text-center space-y-2">
                <div className="text-3xl font-light text-white/60 font-mono tracking-wider">{formatTime(remaining)}</div>
                <div className="w-48 h-0.5 bg-white/5 rounded-full overflow-hidden mx-auto">
                  <div className="h-full bg-emerald-500/30 rounded-full transition-all duration-500" style={{ width: `${progress * 100}%` }} />
                </div>
                <div className="text-[10px] text-white/20 font-mono">{selectedProtocol.label} &middot; cycle {cycleCount + 1}</div>
              </div>

              <button
                onClick={() => { stop(); setPhase('checkin-post'); }}
                className="flex items-center gap-1.5 text-xs text-white/20 hover:text-white/40 transition-colors"
              >
                <Square className="w-3 h-3" /> End early
              </button>
            </motion.div>
          )}

          {/* ══════════ POST CHECK-IN ══════════ */}
          {phase === 'checkin-post' && (
            <CheckInForm
              key="post-checkin"
              title="How are you now?"
              onSubmit={handlePostCheckIn}
            />
          )}

          {/* ══════════ COMPLETE ══════════ */}
          {phase === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-8 w-full max-w-sm"
            >
              {/* Shift result */}
              <div className="relative w-32 h-32 flex items-center justify-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0.3 }}
                  animate={{ scale: 1, opacity: 0.5 }}
                  transition={{ duration: 2, ease: 'easeOut' }}
                  className="w-32 h-32 rounded-full"
                  style={{ background: 'radial-gradient(circle at 40% 40%, rgba(100,200,150,0.3) 0%, rgba(100,200,150,0.05) 70%, transparent 100%)' }}
                />
                <span className="absolute text-3xl">{selectedProtocol.emoji}</span>
              </div>

              <div className="text-center space-y-3">
                {/* Shift label */}
                <p className="text-sm text-white/60 font-light">{shiftLabel(shift)}</p>

                {/* Session record */}
                <p className="text-xs text-white/30 font-mono">
                  {formatTime(duration)} &middot; {selectedProtocol.label}
                </p>

                {/* Pre/post comparison — self-report */}
                {preState && postState && (
                  <div className="flex gap-6 justify-center text-[10px] text-white/25 font-mono">
                    <div className="text-center">
                      <p className="text-white/15 mb-1">before</p>
                      <p>{preState.activation} &middot; {preState.energy}</p>
                    </div>
                    <div className="text-white/10">&rarr;</div>
                    <div className="text-center">
                      <p className="text-white/15 mb-1">after</p>
                      <p>{postState.activation} &middot; {postState.energy}</p>
                    </div>
                  </div>
                )}

                {/* Physiological delta — shown only when device data exists */}
                {(() => {
                  const preFmt = formatSnapshotForDisplay(prePhysiology);
                  const postFmt = formatSnapshotForDisplay(postPhysiology);
                  if (!preFmt && !postFmt) return null;
                  return (
                    <div className="mt-3 pt-3 border-t border-white/[0.04]">
                      <div className="flex gap-6 justify-center text-[10px] text-white/25 font-mono">
                        {preFmt && (
                          <div className="text-center">
                            <p className="text-white/15 mb-1">before</p>
                            {preFmt.heartRate && <p>{preFmt.heartRate}</p>}
                            {preFmt.hrv && <p>HRV {preFmt.hrv}</p>}
                          </div>
                        )}
                        {preFmt && postFmt && <div className="text-white/10">&rarr;</div>}
                        {postFmt && (
                          <div className="text-center">
                            <p className="text-white/15 mb-1">after</p>
                            {postFmt.heartRate && <p>{postFmt.heartRate}</p>}
                            {postFmt.hrv && <p>HRV {postFmt.hrv}</p>}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="flex gap-3 w-full">
                <motion.button onClick={reset} whileTap={{ scale: 0.96 }}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-medium text-sm bg-white/[0.03] border border-white/[0.08] text-white/50 hover:bg-white/[0.06] transition-all duration-200">
                  <RotateCcw className="w-3.5 h-3.5" /> Again
                </motion.button>
                <motion.button onClick={() => router.push('/labtools')} whileTap={{ scale: 0.96 }}
                  className="flex-1 py-3.5 rounded-xl font-medium text-sm bg-gradient-to-r from-emerald-500/15 to-emerald-500/08 border border-emerald-500/15 text-emerald-400/80 hover:from-emerald-500/25 hover:to-emerald-500/15 transition-all duration-200">
                  Done
                </motion.button>
              </div>

              <ToolBridge text="You might want to capture what you noticed." href="/labtools/journal" className="mt-3" />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
