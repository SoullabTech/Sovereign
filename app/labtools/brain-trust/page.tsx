'use client';

/**
 * Brain Trust — Multi-perspective exploration
 *
 * When a question needs more than one angle. Engages the oracle
 * to generate distinct perspectives, then invites the member
 * to synthesize what stands out.
 *
 * Cognitive domain. Create + Connect modes.
 * Provisional implementation — copy, perspective prompts, and
 * bridge targets tunable after live observation.
 */

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCcw, ChevronRight, Loader2 } from 'lucide-react';
import { triggerHapticPulse } from '@/lib/haptics';
import { ToolBridge } from '@/components/labtools/ToolBridge';

// ─────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────

type Phase = 'question' | 'loading' | 'perspectives' | 'synthesis' | 'complete';

interface Perspective {
  lens: string;
  emoji: string;
  response: string;
}

interface TrustRecord {
  question: string;
  perspectives: Perspective[];
  synthesis: string;
  completedAt: string;
}

// ─────────────────────────────────────────────────────
// CONFIGURABLE COPY (tune after live observation)
// ─────────────────────────────────────────────────────

const COPY = {
  question: {
    prompt: 'What question needs more than one angle?',
    hint: 'A real question you\'re sitting with. Not a test — something alive.',
  },
  loading: {
    message: 'Gathering perspectives...',
  },
  perspectives: {
    prompt: 'Three angles on your question.',
    hint: 'Read each one. Notice which lands, which resists, which surprises.',
  },
  synthesis: {
    prompt: 'What stands out across these perspectives?',
    hint: 'Not what\'s "right." What moved. What you didn\'t expect.',
  },
  complete: {
    summary: 'You looked at this from more than one place.',
  },
  bridge: {
    text: 'If a belief is surfacing, you might want to look at what\'s underneath it.',
    href: '/labtools/belief-lens',
  },
};

// ─────────────────────────────────────────────────────
// PERSPECTIVE LENSES
// ─────────────────────────────────────────────────────

const LENSES = [
  { name: 'The Pragmatist', emoji: '\u{1F527}', instruction: 'Answer from pure practical consequence. What happens if you do this? What happens if you don\'t? No feeling, no story — just outcomes.' },
  { name: 'The Depth Voice', emoji: '\u{1F30A}', instruction: 'Answer from the deeper layer. What is this question really about? What need, wound, or longing is beneath the surface question? Speak to what\'s underneath.' },
  { name: 'The Witness', emoji: '\u{2728}', instruction: 'Answer from spacious awareness. Step back from the urgency. What does this look like from 10 years away? From the perspective of someone who loves this person deeply? Offer the long view.' },
];

// ─────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────

export default function BrainTrustPage() {
  const router = useRouter();

  const [phase, setPhase] = useState<Phase>('question');
  const [question, setQuestion] = useState('');
  const [perspectives, setPerspectives] = useState<Perspective[]>([]);
  const [synthesis, setSynthesis] = useState('');
  const [record, setRecord] = useState<TrustRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ── Fetch perspectives from oracle ──

  const fetchPerspectives = useCallback(async () => {
    if (!question.trim()) return;
    setPhase('loading');
    setError(null);
    triggerHapticPulse('soft');

    try {
      const prompt = [
        `A person is sitting with this question: "${question.trim()}"`,
        '',
        'Respond with exactly three perspectives, clearly separated. For each one:',
        '',
        ...LENSES.map((lens, i) => [
          `--- ${lens.name} ---`,
          lens.instruction,
          '',
        ]).flat(),
        'Keep each perspective to 2-4 sentences. Direct, honest, no filler.',
        'Separate each perspective with "---" on its own line.',
      ].join('\n');

      const res = await fetch('/api/oracle/conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: prompt,
          conversationHistory: [],
          element: 'air',
        }),
      });

      if (!res.ok) throw new Error(`Oracle returned ${res.status}`);
      const data = await res.json();
      const text: string = data.response || '';

      // Parse perspectives from response
      const sections = text.split(/\n---\s*\n|^---\s*$/m).filter((s: string) => s.trim());
      const parsed: Perspective[] = LENSES.map((lens, i) => ({
        lens: lens.name,
        emoji: lens.emoji,
        response: (sections[i] || '').replace(/^---.*\n?/, '').trim() || 'No response for this perspective.',
      }));

      setPerspectives(parsed);
      setPhase('perspectives');
      triggerHapticPulse('medium');
    } catch (err) {
      console.error('[Brain Trust] Oracle fetch failed:', err);
      setError('Could not reach MAIA right now. Try again in a moment.');
      setPhase('question');
    }
  }, [question]);

  const goToSynthesis = useCallback(() => {
    setPhase('synthesis');
    triggerHapticPulse('soft');
  }, []);

  const complete = useCallback(() => {
    setRecord({
      question: question.trim(),
      perspectives,
      synthesis: synthesis.trim(),
      completedAt: new Date().toISOString(),
    });
    setPhase('complete');
    triggerHapticPulse('medium');
  }, [question, perspectives, synthesis]);

  const reset = useCallback(() => {
    setPhase('question');
    setQuestion('');
    setPerspectives([]);
    setSynthesis('');
    setRecord(null);
    setError(null);
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
          <span className="text-lg">{'\u{1F9E0}'}</span>
          <h1 className="text-base font-medium text-white/80">Brain Trust</h1>
        </div>
        {!['loading', 'complete'].includes(phase) && (
          <div className="ml-auto flex items-center gap-1.5">
            {(['question', 'perspectives', 'synthesis'] as const).map((step, i) => (
              <div
                key={step}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  step === phase
                    ? 'bg-[#D4B896]/60 w-4'
                    : i < ['question', 'perspectives', 'synthesis'].indexOf(phase)
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

          {/* ══════════ STEP 1: QUESTION ══════════ */}
          {phase === 'question' && (
            <motion.div
              key="question"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-sm space-y-8"
            >
              <div className="text-center space-y-2">
                <p className="text-white/50 text-sm leading-relaxed">{COPY.question.prompt}</p>
                <p className="text-white/30 text-xs">{COPY.question.hint}</p>
              </div>

              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="The question I'm sitting with..."
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

              {error && (
                <p className="text-xs text-red-400/60 text-center">{error}</p>
              )}

              <motion.button
                onClick={fetchPerspectives}
                disabled={!question.trim()}
                whileTap={{ scale: 0.96 }}
                className={`
                  w-full flex items-center justify-center gap-2
                  py-3.5 rounded-xl font-medium text-sm
                  transition-all duration-200
                  ${question.trim()
                    ? 'bg-gradient-to-r from-[#D4B896]/15 to-[#D4B896]/08 border border-[#D4B896]/15 text-[#D4B896]/70 hover:from-[#D4B896]/25'
                    : 'bg-white/[0.02] border border-white/[0.04] text-white/20 cursor-not-allowed'
                  }
                `}
              >
                Ask the Trust <ChevronRight className="w-4 h-4" />
              </motion.button>
            </motion.div>
          )}

          {/* ══════════ LOADING ══════════ */}
          {phase === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-6"
            >
              <Loader2 className="w-8 h-8 text-[#D4B896]/40 animate-spin" />
              <p className="text-sm text-white/30">{COPY.loading.message}</p>
            </motion.div>
          )}

          {/* ══════════ STEP 2: PERSPECTIVES ══════════ */}
          {phase === 'perspectives' && (
            <motion.div
              key="perspectives"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-sm space-y-6"
            >
              <div className="text-center space-y-2">
                <p className="text-white/50 text-sm leading-relaxed">{COPY.perspectives.prompt}</p>
                <p className="text-white/30 text-xs">{COPY.perspectives.hint}</p>
              </div>

              <div className="space-y-4">
                {perspectives.map((p, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.3 }}
                    className="rounded-xl bg-white/[0.03] border border-white/[0.08] p-4 space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{p.emoji}</span>
                      <span className="text-xs font-medium text-white/50">{p.lens}</span>
                    </div>
                    <p className="text-xs text-white/45 leading-relaxed">{p.response}</p>
                  </motion.div>
                ))}
              </div>

              <motion.button
                onClick={goToSynthesis}
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
                Continue <ChevronRight className="w-4 h-4" />
              </motion.button>
            </motion.div>
          )}

          {/* ══════════ STEP 3: SYNTHESIS ══════════ */}
          {phase === 'synthesis' && (
            <motion.div
              key="synthesis"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-sm space-y-8"
            >
              <div className="text-center space-y-2">
                <p className="text-white/50 text-sm leading-relaxed">{COPY.synthesis.prompt}</p>
                <p className="text-white/30 text-xs">{COPY.synthesis.hint}</p>
              </div>

              <textarea
                value={synthesis}
                onChange={(e) => setSynthesis(e.target.value)}
                placeholder="What stood out..."
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
                You can finish without synthesizing. The hearing was the practice.
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

                <div>
                  <span className="text-[10px] text-white/20 uppercase tracking-wider">Question</span>
                  <p className="text-xs text-white/40 mt-1">{record.question}</p>
                </div>

                {record.synthesis && (
                  <div>
                    <span className="text-[10px] text-white/20 uppercase tracking-wider">What stood out</span>
                    <p className="text-xs text-white/40 mt-1">{record.synthesis}</p>
                  </div>
                )}

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
