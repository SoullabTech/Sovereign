'use client';

/**
 * Belief Lens — Surface the assumptions shaping your view
 *
 * Not correction. Inquiry. What must you believe for this to feel true?
 * Three steps: Situation -> Beliefs -> Inquiry.
 *
 * Cognitive domain. Reflect + Interpret modes.
 * Provisional implementation — opening copy and bridge targets
 * will be tuned after live surfacing observation.
 */

import React, { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCcw, ChevronRight, Plus, X } from 'lucide-react';
import { triggerHapticPulse } from '@/lib/haptics';
import { ToolBridge } from '@/components/labtools/ToolBridge';

// ─────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────

type Phase = 'situation' | 'beliefs' | 'inquiry' | 'complete';

interface BeliefRecord {
  situation: string;
  beliefs: string[];
  reflections: string[];
  completedAt: string;
}

// ─────────────────────────────────────────────────────
// CONFIGURABLE COPY (tune after live observation)
// ─────────────────────────────────────────────────────

const COPY = {
  situation: {
    prompt: 'What\'s happening right now?',
    hint: 'Describe the situation as you see it. Not what you think about it yet — just what\'s there.',
  },
  beliefs: {
    prompt: 'What must you believe for this to feel true?',
    hint: 'What assumptions are underneath your reaction? Add each one.',
  },
  inquiry: {
    prompt: 'Hold each belief gently.',
    hint: 'For each one — is this actually true? What opens if it isn\'t?',
  },
  complete: {
    summary: 'You looked at how you were seeing this.',
  },
  bridge: {
    text: 'If a decision is forming, you might want to see the landscape.',
    href: '/labtools/decision-field',
  },
};

// ─────────────────────────────────────────────────────
// INQUIRY PROMPTS (one per belief, rotated)
// ─────────────────────────────────────────────────────

const INQUIRY_PROMPTS = [
  'Is this actually true — or is this how it feels right now?',
  'What would change if this belief loosened, even slightly?',
  'When did you first start seeing things this way?',
  'What would someone who doesn\'t carry this belief notice instead?',
  'Is this a fact or a frame?',
];

// ─────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────

export default function BeliefLensPage() {
  const router = useRouter();

  const [phase, setPhase] = useState<Phase>('situation');
  const [situation, setSituation] = useState('');
  const [beliefs, setBeliefs] = useState<string[]>([]);
  const [currentBelief, setCurrentBelief] = useState('');
  const [reflections, setReflections] = useState<string[]>([]);
  const [record, setRecord] = useState<BeliefRecord | null>(null);
  const beliefInputRef = useRef<HTMLInputElement>(null);

  // ── Navigation ──

  const goToBeliefs = useCallback(() => {
    if (!situation.trim()) return;
    setPhase('beliefs');
    triggerHapticPulse('soft');
    setTimeout(() => beliefInputRef.current?.focus(), 400);
  }, [situation]);

  const addBelief = useCallback(() => {
    const trimmed = currentBelief.trim();
    if (!trimmed || beliefs.length >= 6) return;
    setBeliefs(prev => [...prev, trimmed]);
    setCurrentBelief('');
    triggerHapticPulse('soft');
    beliefInputRef.current?.focus();
  }, [currentBelief, beliefs]);

  const removeBelief = useCallback((index: number) => {
    setBeliefs(prev => prev.filter((_, i) => i !== index));
  }, []);

  const goToInquiry = useCallback(() => {
    if (beliefs.length === 0) return;
    setReflections(beliefs.map(() => ''));
    setPhase('inquiry');
    triggerHapticPulse('soft');
  }, [beliefs]);

  const updateReflection = useCallback((index: number, value: string) => {
    setReflections(prev => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }, []);

  const complete = useCallback(() => {
    setRecord({
      situation: situation.trim(),
      beliefs,
      reflections,
      completedAt: new Date().toISOString(),
    });
    setPhase('complete');
    triggerHapticPulse('medium');
  }, [situation, beliefs, reflections]);

  const reset = useCallback(() => {
    setPhase('situation');
    setSituation('');
    setBeliefs([]);
    setCurrentBelief('');
    setReflections([]);
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
          <span className="text-lg">{'\u{1F50D}'}</span>
          <h1 className="text-base font-medium text-white/80">Belief Lens</h1>
        </div>
        {phase !== 'complete' && (
          <div className="ml-auto flex items-center gap-1.5">
            {(['situation', 'beliefs', 'inquiry'] as const).map((step, i) => (
              <div
                key={step}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  step === phase
                    ? 'bg-[#D4B896]/60 w-4'
                    : i < ['situation', 'beliefs', 'inquiry'].indexOf(phase)
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

          {/* ══════════ STEP 1: SITUATION ══════════ */}
          {phase === 'situation' && (
            <motion.div
              key="situation"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-sm space-y-8"
            >
              <div className="text-center space-y-2">
                <p className="text-white/50 text-sm leading-relaxed">{COPY.situation.prompt}</p>
                <p className="text-white/30 text-xs">{COPY.situation.hint}</p>
              </div>

              <textarea
                value={situation}
                onChange={(e) => setSituation(e.target.value)}
                placeholder="What's happening..."
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
                onClick={goToBeliefs}
                disabled={!situation.trim()}
                whileTap={{ scale: 0.96 }}
                className={`
                  w-full flex items-center justify-center gap-2
                  py-3.5 rounded-xl font-medium text-sm
                  transition-all duration-200
                  ${situation.trim()
                    ? 'bg-gradient-to-r from-[#D4B896]/15 to-[#D4B896]/08 border border-[#D4B896]/15 text-[#D4B896]/70 hover:from-[#D4B896]/25'
                    : 'bg-white/[0.02] border border-white/[0.04] text-white/20 cursor-not-allowed'
                  }
                `}
              >
                Continue <ChevronRight className="w-4 h-4" />
              </motion.button>
            </motion.div>
          )}

          {/* ══════════ STEP 2: BELIEFS ══════════ */}
          {phase === 'beliefs' && (
            <motion.div
              key="beliefs"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-sm space-y-6"
            >
              <div className="text-center space-y-2">
                <p className="text-white/50 text-sm leading-relaxed">{COPY.beliefs.prompt}</p>
                <p className="text-white/30 text-xs">{COPY.beliefs.hint}</p>
              </div>

              {/* Belief list */}
              <div className="space-y-2">
                {beliefs.map((belief, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08]"
                  >
                    <span className="text-xs text-white/50 flex-1">{belief}</span>
                    <button
                      onClick={() => removeBelief(i)}
                      className="text-white/20 hover:text-white/40 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add belief input */}
              {beliefs.length < 6 && (
                <div className="flex gap-2">
                  <input
                    ref={beliefInputRef}
                    type="text"
                    value={currentBelief}
                    onChange={(e) => setCurrentBelief(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addBelief()}
                    placeholder="I believe that..."
                    maxLength={120}
                    className="
                      flex-1 px-4 py-3 rounded-xl text-sm
                      bg-white/[0.03] border border-white/[0.08]
                      text-white/70 placeholder:text-white/20
                      focus:outline-none focus:border-white/15
                      transition-colors
                    "
                  />
                  <button
                    onClick={addBelief}
                    disabled={!currentBelief.trim()}
                    className={`
                      w-11 h-11 rounded-xl flex items-center justify-center
                      transition-all duration-200
                      ${currentBelief.trim()
                        ? 'bg-[#D4B896]/15 text-[#D4B896]/70 hover:bg-[#D4B896]/25'
                        : 'bg-white/[0.03] text-white/15'
                      }
                    `}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              )}

              <motion.button
                onClick={goToInquiry}
                disabled={beliefs.length === 0}
                whileTap={{ scale: 0.96 }}
                className={`
                  w-full flex items-center justify-center gap-2
                  py-3.5 rounded-xl font-medium text-sm
                  transition-all duration-200
                  ${beliefs.length > 0
                    ? 'bg-gradient-to-r from-[#D4B896]/15 to-[#D4B896]/08 border border-[#D4B896]/15 text-[#D4B896]/70 hover:from-[#D4B896]/25'
                    : 'bg-white/[0.02] border border-white/[0.04] text-white/20 cursor-not-allowed'
                  }
                `}
              >
                Continue <ChevronRight className="w-4 h-4" />
              </motion.button>
            </motion.div>
          )}

          {/* ══════════ STEP 3: INQUIRY ══════════ */}
          {phase === 'inquiry' && (
            <motion.div
              key="inquiry"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-sm space-y-6"
            >
              <div className="text-center space-y-2">
                <p className="text-white/50 text-sm leading-relaxed">{COPY.inquiry.prompt}</p>
                <p className="text-white/30 text-xs">{COPY.inquiry.hint}</p>
              </div>

              <div className="space-y-5">
                {beliefs.map((belief, i) => (
                  <div key={i} className="space-y-2">
                    <div className="px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                      <p className="text-xs text-white/40">{belief}</p>
                    </div>
                    <p className="text-[11px] text-white/25 italic pl-1">
                      {INQUIRY_PROMPTS[i % INQUIRY_PROMPTS.length]}
                    </p>
                    <textarea
                      value={reflections[i] || ''}
                      onChange={(e) => updateReflection(i, e.target.value)}
                      placeholder="What comes up..."
                      maxLength={300}
                      rows={2}
                      className="
                        w-full px-3 py-2 rounded-xl text-xs resize-none
                        bg-white/[0.02] border border-white/[0.06]
                        text-white/60 placeholder:text-white/15
                        focus:outline-none focus:border-white/12
                        transition-colors
                      "
                    />
                  </div>
                ))}
              </div>

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
                Reflections are optional. The noticing is the practice.
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

                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] text-white/20 uppercase tracking-wider">Situation</span>
                    <p className="text-xs text-white/40 mt-1">{record.situation}</p>
                  </div>

                  <div>
                    <span className="text-[10px] text-white/20 uppercase tracking-wider">Beliefs examined</span>
                    <div className="mt-1 space-y-1">
                      {record.beliefs.map((b, i) => (
                        <p key={i} className="text-xs text-white/35">{b}</p>
                      ))}
                    </div>
                  </div>
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
