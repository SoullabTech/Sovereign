'use client';

/**
 * Breathwork — Deeper breath practice space
 *
 * Expanded protocol library for working with your state.
 * Box breathing, coherent breathing, extended exhale, alternate nostril.
 * Longer sessions available (up to 5 minutes).
 *
 * Uses shared breath engine from lib/somatic/.
 * Same orb/haptic/audio system as Regulation Minute.
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCcw, Square } from 'lucide-react';
import { playSacredTone, sacredTones } from '@/lib/audio/sacred-tones';
import { triggerHapticPulse, HapticBreathSync, supportsHaptics } from '@/lib/haptics';
import { ToolBridge } from '@/components/labtools/ToolBridge';
import {
  BREATH_PROTOCOLS,
  BREATHWORK_PROTOCOLS,
  BREATHWORK_DURATIONS,
  type BreathProtocolId,
} from '@/lib/somatic/breathProtocols';
import {
  getCycleLength,
  getPhaseAtSecond,
  getCompletedCycles,
  getPhasePrompt,
  getOrbScale,
  getOrbOpacity,
  formatProtocolTiming,
} from '@/lib/somatic/breathEngine';

// ─────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────

type SessionPhase = 'setup' | 'running' | 'complete';

interface CompletionRecord {
  protocolKey: BreathProtocolId;
  protocolLabel: string;
  durationSec: number;
  cyclesCompleted: number;
  soundOn: boolean;
  completedAt: string;
}

// ─────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────

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

export default function BreathworkPage() {
  const router = useRouter();

  // ── Setup state ──
  const [protocolId, setProtocolId] = useState<BreathProtocolId>('box');
  const [duration, setDuration] = useState<number>(120);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [sessionPhase, setSessionPhase] = useState<SessionPhase>('setup');

  // ── Running state ──
  const [elapsed, setElapsed] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);

  // ── Completion ──
  const [completionRecord, setCompletionRecord] = useState<CompletionRecord | null>(null);
  const [soundAvailable, setSoundAvailable] = useState(true);

  // ── Refs ──
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);
  const hapticSyncRef = useRef<HapticBreathSync | null>(null);
  const lastToneTimeRef = useRef(0);

  // ── Derived ──
  const protocol = BREATH_PROTOCOLS[protocolId];
  const cycleConfig = {
    inhale: protocol.inhale,
    holdIn: protocol.holdIn,
    exhale: protocol.exhale,
    holdOut: protocol.holdOut,
  };
  const cycleLengthSec = getCycleLength(cycleConfig);
  const remaining = Math.max(0, duration - elapsed);
  const progress = duration > 0 ? elapsed / duration : 0;
  const phaseState = getPhaseAtSecond(cycleConfig, elapsed);

  // ─────────────────────────────────────────────────
  // ENGINE
  // ─────────────────────────────────────────────────

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
    setCycleCount(getCompletedCycles(cycleConfig, elapsedSec));

    const ps = getPhaseAtSecond(cycleConfig, elapsedSec);
    if (ps.phase === 'inhale' && ps.phaseProgress < 0.05) {
      const cycleStartTime = getCompletedCycles(cycleConfig, elapsedSec) * cycleLengthSec;
      if (elapsedSec - cycleStartTime < 0.1) {
        triggerHapticPulse('soft');
      }
    }
  }, [duration, cycleConfig, cycleLengthSec]);

  const start = useCallback(() => {
    setSessionPhase('running');
    setElapsed(0);
    setCycleCount(0);
    setCompletionRecord(null);
    startTimeRef.current = performance.now();

    if (supportsHaptics()) {
      hapticSyncRef.current = new HapticBreathSync();
      hapticSyncRef.current.start(
        protocol.inhale * 1000,
        protocol.holdIn * 1000,
        protocol.exhale * 1000
      );
    }

    if (soundEnabled) {
      const played = tryPlayTone(protocol.toneHz, 2, 0.04);
      if (!played) setSoundAvailable(false);
    }

    triggerHapticPulse('medium');
  }, [protocol, soundEnabled]);

  const stop = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    hapticSyncRef.current?.stop();
    hapticSyncRef.current = null;
  }, []);

  const reset = useCallback(() => {
    stop();
    setSessionPhase('setup');
    setElapsed(0);
    setCycleCount(0);
    setCompletionRecord(null);
  }, [stop]);

  useEffect(() => {
    if (sessionPhase === 'running') {
      intervalRef.current = setInterval(tick, 16);
      return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    } else {
      stop();
    }
  }, [sessionPhase, tick, stop]);

  // ── Cycle tone ──
  useEffect(() => {
    if (sessionPhase !== 'running' || !soundEnabled || !soundAvailable) return;
    const cycleStartTime = cycleCount * cycleLengthSec;
    const timeSinceCycleStart = elapsed - cycleStartTime;
    if (timeSinceCycleStart < 0.2 && elapsed > 0.5) {
      const now = performance.now();
      if (now - lastToneTimeRef.current > 2000) {
        lastToneTimeRef.current = now;
        tryPlayTone(protocol.toneHz, 1.5, 0.03);
      }
    }
  }, [cycleCount, elapsed, cycleLengthSec, sessionPhase, soundEnabled, soundAvailable, protocol.toneHz]);

  // ── Completion record ──
  useEffect(() => {
    if (sessionPhase === 'complete') {
      setCompletionRecord({
        protocolKey: protocolId,
        protocolLabel: protocol.label,
        durationSec: duration,
        cyclesCompleted: cycleCount,
        soundOn: soundEnabled,
        completedAt: new Date().toISOString(),
      });
      if (soundEnabled && soundAvailable) {
        tryPlayTone(sacredTones.earth, 3, 0.05);
      }
    }
  }, [sessionPhase, protocolId, protocol.label, duration, cycleCount, soundEnabled, soundAvailable]);

  useEffect(() => { return () => { stop(); }; }, [stop]);

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
          onClick={() => { if (sessionPhase === 'running') { reset(); } else { router.push('/labtools'); } }}
          className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-white/60" />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-lg">{'\u{1F32C}'}</span>
          <h1 className="text-base font-medium text-white/80">Breathwork</h1>
        </div>
      </header>

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
                Work with your state through breath.
              </p>

              {/* Protocol selection */}
              <section className="space-y-3">
                <p className="text-xs text-white/30 uppercase tracking-wider font-medium">Protocol</p>
                <div className="space-y-2">
                  {BREATHWORK_PROTOCOLS.map((id) => {
                    const p = BREATH_PROTOCOLS[id];
                    const isSelected = protocolId === id;
                    return (
                      <button
                        key={id}
                        onClick={() => setProtocolId(id)}
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
                          {formatProtocolTiming({ inhale: p.inhale, holdIn: p.holdIn, exhale: p.exhale, holdOut: p.holdOut })}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Duration */}
              <section className="space-y-3">
                <p className="text-xs text-white/30 uppercase tracking-wider font-medium">Duration</p>
                <div className="flex gap-2 flex-wrap">
                  {BREATHWORK_DURATIONS.map((d) => (
                    <button
                      key={d}
                      onClick={() => setDuration(d)}
                      className={`
                        flex-1 min-w-[60px] py-2.5 rounded-xl text-sm font-medium
                        transition-all duration-200
                        ${duration === d
                          ? 'bg-white/10 text-white/90 border border-white/20'
                          : 'bg-white/[0.02] text-white/40 border border-white/[0.06] hover:bg-white/[0.05]'
                        }
                      `}
                    >
                      {d >= 60 ? `${d / 60}m` : `${d}s`}
                    </button>
                  ))}
                </div>
              </section>

              {/* Sound toggle */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/30">Subtle tones</span>
                  {soundEnabled && !soundAvailable && (
                    <span className="text-[10px] text-white/20">(requires tap to activate)</span>
                  )}
                </div>
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`w-10 h-6 rounded-full transition-all duration-200 relative ${soundEnabled ? 'bg-white/20' : 'bg-white/5'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white/80 absolute top-1 transition-transform duration-200 ${soundEnabled ? 'translate-x-5' : 'translate-x-1'}`} />
                </button>
              </div>

              {/* Start */}
              <motion.button
                onClick={start}
                whileTap={{ scale: 0.96 }}
                className="w-full py-4 rounded-2xl font-medium text-base bg-gradient-to-r from-[#D4B896]/20 to-[#D4B896]/10 border border-[#D4B896]/20 text-[#D4B896] hover:from-[#D4B896]/30 hover:to-[#D4B896]/20 transition-all duration-200"
              >
                Begin
              </motion.button>

              <p className="text-center text-[11px] text-white/20 leading-relaxed">
                {cycleLengthSec > 0 ? Math.floor(duration / cycleLengthSec) : 0} breath cycles &middot; {formatTime(duration)} total
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
              className="flex flex-col items-center justify-center gap-10 w-full max-w-sm"
            >
              {/* Breathing orb */}
              <div className="relative w-56 h-56 flex items-center justify-center">
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `radial-gradient(circle, transparent 40%, rgba(212,184,150,${getOrbOpacity(phaseState.phase, phaseState.phaseProgress) * 0.15}) 70%, transparent 100%)`,
                    transform: `scale(${getOrbScale(phaseState.phase, phaseState.phaseProgress) * 1.3})`,
                    transition: 'transform 0.3s ease-out',
                  }}
                />
                <div
                  className="w-40 h-40 rounded-full relative"
                  style={{
                    background: `radial-gradient(circle at 40% 40%,
                      rgba(212,184,150,${getOrbOpacity(phaseState.phase, phaseState.phaseProgress) * 0.6}) 0%,
                      rgba(212,184,150,${getOrbOpacity(phaseState.phase, phaseState.phaseProgress) * 0.2}) 50%,
                      rgba(212,184,150,0.02) 100%)`,
                    transform: `scale(${getOrbScale(phaseState.phase, phaseState.phaseProgress)})`,
                    transition: 'transform 0.3s ease-out, background 0.3s ease-out',
                    boxShadow: `0 0 ${40 * getOrbOpacity(phaseState.phase, phaseState.phaseProgress)}px rgba(212,184,150,${getOrbOpacity(phaseState.phase, phaseState.phaseProgress) * 0.3})`,
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
                  <div className="h-full bg-[#D4B896]/40 rounded-full transition-all duration-500" style={{ width: `${progress * 100}%` }} />
                </div>
                <div className="text-[10px] text-white/20 font-mono">
                  {protocol.label} &middot; cycle {cycleCount + 1}
                </div>
              </div>

              <button onClick={reset} className="flex items-center gap-1.5 text-xs text-white/20 hover:text-white/40 transition-colors">
                <Square className="w-3 h-3" /> Stop
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
              <div className="relative w-32 h-32 flex items-center justify-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0.3 }}
                  animate={{ scale: 1, opacity: 0.5 }}
                  transition={{ duration: 2, ease: 'easeOut' }}
                  className="w-32 h-32 rounded-full"
                  style={{ background: 'radial-gradient(circle at 40% 40%, rgba(212,184,150,0.3) 0%, rgba(212,184,150,0.05) 70%, transparent 100%)' }}
                />
                <span className="absolute text-3xl">{protocol.emoji}</span>
              </div>

              <div className="text-center space-y-2">
                {completionRecord && (
                  <p className="text-xs text-white/40 font-mono tracking-wide">
                    {formatTime(completionRecord.durationSec)} &middot; {completionRecord.protocolLabel} &middot; {completionRecord.cyclesCompleted} cycles
                  </p>
                )}
                <p className="text-[10px] text-white/20">
                  {completionRecord?.completedAt
                    ? new Date(completionRecord.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : ''}
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

              <ToolBridge text="You might want to check in with yourself now." href="/labtools/coherence" className="mt-3" />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
