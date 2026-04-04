'use client';

/**
 * Parts & Shadow — Meet the parts that are active and what they carry
 *
 * When more than one voice is speaking. Inner conflict, contradiction,
 * projection, disowned motive. Not therapy — recognition.
 *
 * Psychological domain. Reflect + Connect modes.
 * Provisional implementation — copy and bridge targets tunable.
 */

import React, { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCcw, ChevronRight } from 'lucide-react';
import { triggerHapticPulse } from '@/lib/haptics';
import { ToolBridge } from '@/components/labtools/ToolBridge';

// ─────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────

type Phase = 'notice' | 'meet' | 'explore' | 'complete';

type PartEnergy =
  | 'protective'
  | 'reactive'
  | 'young'
  | 'critical'
  | 'shadow'
  | 'wise'
  | 'other';

interface EnergyOption {
  key: PartEnergy;
  label: string;
  description: string;
  emoji: string;
}

interface ShadowRecord {
  energy: PartEnergy;
  energyLabel: string;
  voice: string;
  carries: string;
  completedAt: string;
}

// ─────────────────────────────────────────────────────
// CONFIGURABLE COPY (tune after live observation)
// ─────────────────────────────────────────────────────

const COPY = {
  notice: {
    prompt: 'Something in you is active right now.',
    hint: 'What kind of energy is showing up? Not what you think about it — what it feels like.',
  },
  meet: {
    prompt: 'If this part could speak, what would it say?',
    hint: 'Let it have a voice. No editing, no judging.',
  },
  explore: {
    prompt: 'What does this part carry or protect?',
    hint: 'Behind every protector is something being guarded. Behind every critic is something vulnerable.',
  },
  complete: {
    summary: 'You met what was active.',
  },
  bridge: {
    text: 'If there\'s something to feel in the body, you can follow it.',
    href: '/labtools/emotion-body-meaning',
  },
};

// ─────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────

const ENERGIES: EnergyOption[] = [
  { key: 'protective', label: 'Protective',    description: 'Guarding, managing, controlling',       emoji: '\u{1F6E1}\u{FE0F}' },
  { key: 'reactive',   label: 'Reactive',      description: 'Angry, urgent, fighting',               emoji: '\u{26A1}' },
  { key: 'young',      label: 'Young / Hurt',  description: 'Small, scared, sad, needing',           emoji: '\u{1F331}' },
  { key: 'critical',   label: 'Critical',      description: 'Judging, shaming, comparing',           emoji: '\u{1F5E1}\u{FE0F}' },
  { key: 'shadow',     label: 'Shadow',        description: 'Disowned, denied, projected outward',   emoji: '\u{1F311}' },
  { key: 'wise',       label: 'Witness',       description: 'The one noticing all of this',          emoji: '\u{2728}' },
  { key: 'other',      label: 'Other',         description: 'Something not listed here',             emoji: '\u{2754}' },
];

// ─────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────

export default function PartsShadowPage() {
  const router = useRouter();

  const [phase, setPhase] = useState<Phase>('notice');
  const [selectedEnergy, setSelectedEnergy] = useState<PartEnergy | null>(null);
  const [voice, setVoice] = useState('');
  const [carries, setCarries] = useState('');
  const [record, setRecord] = useState<ShadowRecord | null>(null);
  const voiceRef = useRef<HTMLTextAreaElement>(null);

  // ── Navigation ──

  const goToMeet = useCallback(() => {
    if (!selectedEnergy) return;
    setPhase('meet');
    triggerHapticPulse('soft');
    setTimeout(() => voiceRef.current?.focus(), 400);
  }, [selectedEnergy]);

  const goToExplore = useCallback(() => {
    if (!voice.trim()) return;
    setPhase('explore');
    triggerHapticPulse('soft');
  }, [voice]);

  const complete = useCallback(() => {
    const energyOption = ENERGIES.find(e => e.key === selectedEnergy);
    setRecord({
      energy: selectedEnergy || 'other',
      energyLabel: energyOption?.label || 'Other',
      voice: voice.trim(),
      carries: carries.trim(),
      completedAt: new Date().toISOString(),
    });
    setPhase('complete');
    triggerHapticPulse('medium');
  }, [selectedEnergy, voice, carries]);

  const reset = useCallback(() => {
    setPhase('notice');
    setSelectedEnergy(null);
    setVoice('');
    setCarries('');
    setRecord(null);
  }, []);

  // ── Render ──

  return (
    <div className="min-h-screen bg-[#0a0f14] text-white flex flex-col">
      <header className="flex items-center gap-3 px-5 pt-5 pb-3">
        <button
          onClick={() => router.push('/labtools')}
          className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-white/60" />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-lg">{'\u{1FA9E}'}</span>
          <h1 className="text-base font-medium text-white/80">Parts & Shadow</h1>
        </div>
        {phase !== 'complete' && (
          <div className="ml-auto flex items-center gap-1.5">
            {(['notice', 'meet', 'explore'] as const).map((step, i) => (
              <div
                key={step}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  step === phase
                    ? 'bg-[#D4B896]/60 w-4'
                    : i < ['notice', 'meet', 'explore'].indexOf(phase)
                      ? 'bg-[#D4B896]/30'
                      : 'bg-white/10'
                }`}
              />
            ))}
          </div>
        )}
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-5 pb-10">
        <AnimatePresence mode="wait">

          {/* ══════════ STEP 1: NOTICE ══════════ */}
          {phase === 'notice' && (
            <motion.div
              key="notice"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-sm space-y-8"
            >
              <div className="text-center space-y-2">
                <p className="text-white/50 text-sm leading-relaxed">{COPY.notice.prompt}</p>
                <p className="text-white/30 text-xs">{COPY.notice.hint}</p>
              </div>

              <div className="space-y-2">
                {ENERGIES.map((e) => (
                  <button
                    key={e.key}
                    onClick={() => setSelectedEnergy(e.key)}
                    className={`
                      w-full flex items-center gap-3.5 px-4 py-3 rounded-xl
                      transition-all duration-200 text-left
                      ${selectedEnergy === e.key
                        ? 'bg-white/10 border border-white/20'
                        : 'bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.05]'
                      }
                    `}
                  >
                    <span className="text-xl flex-shrink-0">{e.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white/80">{e.label}</div>
                      <div className="text-[11px] text-white/35 mt-0.5">{e.description}</div>
                    </div>
                  </button>
                ))}
              </div>

              <motion.button
                onClick={goToMeet}
                disabled={!selectedEnergy}
                whileTap={{ scale: 0.96 }}
                className={`
                  w-full flex items-center justify-center gap-2
                  py-3.5 rounded-xl font-medium text-sm
                  transition-all duration-200
                  ${selectedEnergy
                    ? 'bg-gradient-to-r from-[#D4B896]/15 to-[#D4B896]/08 border border-[#D4B896]/15 text-[#D4B896]/70 hover:from-[#D4B896]/25'
                    : 'bg-white/[0.02] border border-white/[0.04] text-white/20 cursor-not-allowed'
                  }
                `}
              >
                Continue <ChevronRight className="w-4 h-4" />
              </motion.button>
            </motion.div>
          )}

          {/* ══════════ STEP 2: MEET ══════════ */}
          {phase === 'meet' && (
            <motion.div
              key="meet"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-sm space-y-8"
            >
              <div className="text-center space-y-2">
                <p className="text-white/50 text-sm leading-relaxed">{COPY.meet.prompt}</p>
                <p className="text-white/30 text-xs">{COPY.meet.hint}</p>
              </div>

              <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                <span className="text-xl">{ENERGIES.find(e => e.key === selectedEnergy)?.emoji}</span>
                <span className="text-xs text-white/40">
                  {ENERGIES.find(e => e.key === selectedEnergy)?.label} energy
                </span>
              </div>

              <textarea
                ref={voiceRef}
                value={voice}
                onChange={(e) => setVoice(e.target.value)}
                placeholder="It would say..."
                maxLength={500}
                rows={5}
                className="
                  w-full px-4 py-3 rounded-xl text-sm resize-none
                  bg-white/[0.03] border border-white/[0.08]
                  text-white/70 placeholder:text-white/20
                  focus:outline-none focus:border-white/15
                  transition-colors
                "
              />

              <motion.button
                onClick={goToExplore}
                disabled={!voice.trim()}
                whileTap={{ scale: 0.96 }}
                className={`
                  w-full flex items-center justify-center gap-2
                  py-3.5 rounded-xl font-medium text-sm
                  transition-all duration-200
                  ${voice.trim()
                    ? 'bg-gradient-to-r from-[#D4B896]/15 to-[#D4B896]/08 border border-[#D4B896]/15 text-[#D4B896]/70 hover:from-[#D4B896]/25'
                    : 'bg-white/[0.02] border border-white/[0.04] text-white/20 cursor-not-allowed'
                  }
                `}
              >
                Continue <ChevronRight className="w-4 h-4" />
              </motion.button>
            </motion.div>
          )}

          {/* ══════════ STEP 3: EXPLORE ══════════ */}
          {phase === 'explore' && (
            <motion.div
              key="explore"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-sm space-y-8"
            >
              <div className="text-center space-y-2">
                <p className="text-white/50 text-sm leading-relaxed">{COPY.explore.prompt}</p>
                <p className="text-white/30 text-xs">{COPY.explore.hint}</p>
              </div>

              {/* Echo of what the part said */}
              <div className="px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <p className="text-[11px] text-white/25 italic">"{voice.trim()}"</p>
              </div>

              <textarea
                value={carries}
                onChange={(e) => setCarries(e.target.value)}
                placeholder="It carries... it protects..."
                maxLength={500}
                rows={4}
                className="
                  w-full px-4 py-3 rounded-xl text-sm resize-none
                  bg-white/[0.03] border border-white/[0.08]
                  text-white/70 placeholder:text-white/20
                  focus:outline-none focus:border-white/15
                  transition-colors
                "
              />

              <motion.button
                onClick={complete}
                whileTap={{ scale: 0.96 }}
                className="
                  w-full flex items-center justify-center gap-2
                  py-3.5 rounded-xl font-medium text-sm
                  bg-gradient-to-r from-[#D4B896]/15 to-[#D4B896]/08
                  border border-[#D4B896]/15 text-[#D4B896]/70
                  hover:from-[#D4B896]/25 hover:to-[#D4B896]/15
                  transition-all duration-200
                "
              >
                Finish
              </motion.button>

              <p className="text-center text-[10px] text-white/15">
                You can finish without answering. The meeting was the practice.
              </p>
            </motion.div>
          )}

          {/* ══════════ COMPLETE ══════════ */}
          {phase === 'complete' && record && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-8 w-full max-w-sm"
            >
              <div className="w-full rounded-2xl bg-white/[0.03] border border-white/[0.08] p-5 space-y-4">
                <p className="text-sm text-white/40 text-center">{COPY.complete.summary}</p>

                <div className="flex items-start gap-3">
                  <span className="text-2xl">
                    {ENERGIES.find(e => e.key === record.energy)?.emoji || '\u{1FA9E}'}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white/70">{record.energyLabel}</p>
                  </div>
                </div>

                <div className="space-y-3 pl-9">
                  {record.voice && (
                    <div>
                      <span className="text-[10px] text-white/20 uppercase tracking-wider">It said</span>
                      <p className="text-xs text-white/40 mt-1 italic">"{record.voice}"</p>
                    </div>
                  )}
                  {record.carries && (
                    <div>
                      <span className="text-[10px] text-white/20 uppercase tracking-wider">It carries</span>
                      <p className="text-xs text-white/40 mt-1">{record.carries}</p>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-white/[0.05]">
                  <p className="text-[10px] text-white/15 font-mono">
                    {new Date(record.completedAt).toLocaleTimeString([], {
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 w-full">
                <motion.button
                  onClick={reset}
                  whileTap={{ scale: 0.96 }}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-medium text-sm bg-white/[0.03] border border-white/[0.08] text-white/50 hover:bg-white/[0.06] transition-all duration-200"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Again
                </motion.button>
                <motion.button
                  onClick={() => router.push('/labtools')}
                  whileTap={{ scale: 0.96 }}
                  className="flex-1 py-3.5 rounded-xl font-medium text-sm bg-gradient-to-r from-[#D4B896]/15 to-[#D4B896]/08 border border-[#D4B896]/15 text-[#D4B896]/80 hover:from-[#D4B896]/25 transition-all duration-200"
                >
                  Done
                </motion.button>
              </div>

              <ToolBridge
                text={COPY.bridge.text}
                href={COPY.bridge.href}
                className="mt-3"
              />
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}
