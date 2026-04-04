'use client';

/**
 * Values Compass — Clarify what matters in a dilemma
 *
 * A structured self-reflection tool with MAIA synthesis.
 * Five steps: Situation -> Values -> Cost -> Synthesis -> Return.
 *
 * Not a chat tool. Not a scoring tool. A decision clarity tool.
 * MAIA names the real tension, surfaces what's hidden, offers a next step — not an answer.
 *
 * Philosophical domain. Reflect + Act modes.
 */

import React, { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronRight, RotateCcw, GripVertical } from 'lucide-react';
import { triggerHapticPulse } from '@/lib/haptics';
import { ToolBridge } from '@/components/labtools/ToolBridge';

// ─────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────

type Step = 'situation' | 'values' | 'cost' | 'synthesis' | 'return';

interface SynthesisSection {
  heading: string;
  body: string;
}

// ─────────────────────────────────────────────────────
// VALUES LIBRARY (starter set, not a taxonomy)
// ─────────────────────────────────────────────────────

const VALUE_CHIPS: { label: string; description: string }[] = [
  { label: 'Truth',          description: "Saying what's real, even when it's hard" },
  { label: 'Safety',         description: 'Protecting what matters from harm' },
  { label: 'Freedom',        description: 'The right to choose your own path' },
  { label: 'Loyalty',        description: "Staying with what you've given yourself to" },
  { label: 'Compassion',     description: 'Caring for suffering, including your own' },
  { label: 'Justice',        description: "What's right, not just what's convenient" },
  { label: 'Growth',         description: "Moving toward who you're becoming" },
  { label: 'Belonging',      description: 'Being part of something larger' },
  { label: 'Integrity',      description: 'Living in alignment with what you say matters' },
  { label: 'Peace',          description: 'Not every battle is yours to fight' },
  { label: 'Responsibility', description: 'What you owe, regardless of feeling' },
  { label: 'Expression',     description: "Making something that didn't exist before" },
];

// ─────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────

/** Parse MAIA response into 4 sections. Fallback: render raw if headings missing. */
function parseSynthesis(raw: string): SynthesisSection[] {
  const sectionPattern = /##\s+(.+)/g;
  const matches = [...raw.matchAll(sectionPattern)];

  if (matches.length < 2) {
    // Fallback: render entire response as one section
    return [{ heading: 'Reflection', body: raw.trim() }];
  }

  const sections: SynthesisSection[] = [];
  for (let i = 0; i < matches.length; i++) {
    const heading = matches[i][1].trim();
    const startIdx = matches[i].index! + matches[i][0].length;
    const endIdx = i + 1 < matches.length ? matches[i + 1].index! : raw.length;
    const body = raw.slice(startIdx, endIdx).trim();
    sections.push({ heading, body });
  }
  return sections;
}

/** Build the structured prompt for the oracle. */
function buildPrompt(
  situation: string,
  rankedValues: string[],
  costA: string,
  costB: string,
  fear: string,
): string {
  const fearLine = fear.trim()
    ? `\nWHAT THEY FEAR GETTING WRONG: ${fear.trim()}`
    : '';

  return `[VALUES COMPASS]

The member has described a decision they're facing, identified the values in play,
and named what each path would cost them. Your role: name the real tension clearly,
clarify what each value is actually asking, surface any hidden cost or blind spot,
and offer one possible next step — not an answer.

Do NOT prescribe. Do NOT moralize. Do not heighten the language or make the choice
sound more dramatic than it is. Be direct and grounded.

Format your response in exactly four sections:
## The Real Tension
## What Each Value Is Asking
## What You Might Not Be Seeing
## A Possible Next Step

Keep each section 2-4 sentences. Name what's real.

---
SITUATION: ${situation.trim()}

VALUES IN PLAY (ranked by felt importance):
${rankedValues.map((v, i) => `${i + 1}. ${v}`).join('\n')}

PATH A COST: ${costA.trim() || '(not specified)'}
PATH B COST: ${costB.trim() || '(not specified)'}${fearLine}`;
}

// ─────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────

export default function ValuesCompassPage() {
  const router = useRouter();

  // ── Step state ──
  const [step, setStep] = useState<Step>('situation');

  // ── Step 1: Situation ──
  const [situation, setSituation] = useState('');

  // ── Step 2: Values ──
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [customValue, setCustomValue] = useState('');
  const customInputRef = useRef<HTMLInputElement>(null);

  // ── Step 3: Cost ──
  const [costA, setCostA] = useState('');
  const [costB, setCostB] = useState('');
  const [fear, setFear] = useState('');

  // ── Step 4: Synthesis ──
  const [loading, setLoading] = useState(false);
  const [sections, setSections] = useState<SynthesisSection[]>([]);
  const [synthesisError, setSynthesisError] = useState<string | null>(null);
  const [rawResponse, setRawResponse] = useState('');

  // ── Step 5: Return ──
  const [reflection, setReflection] = useState('');

  // ── Ranked values (order matters) ──
  const [rankedValues, setRankedValues] = useState<string[]>([]);

  // ─────────────────────────────────────────────────
  // VALIDATION
  // ─────────────────────────────────────────────────

  const canProceedFromSituation = situation.trim().length >= 10;
  const canProceedFromValues = selectedValues.length >= 2;
  const canProceedFromCost = costA.trim().length > 0 || costB.trim().length > 0;

  // ─────────────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────────────

  const toggleValue = useCallback((label: string) => {
    setSelectedValues((prev) => {
      if (prev.includes(label)) return prev.filter((v) => v !== label);
      if (prev.length >= 4) return prev; // max 4
      return [...prev, label];
    });
  }, []);

  const addCustomValue = useCallback(() => {
    const trimmed = customValue.trim();
    if (!trimmed || selectedValues.includes(trimmed) || selectedValues.length >= 4) return;
    setSelectedValues((prev) => [...prev, trimmed]);
    setCustomValue('');
  }, [customValue, selectedValues]);

  const goToValues = useCallback(() => {
    setStep('values');
    triggerHapticPulse('soft');
  }, []);

  const goToCost = useCallback(() => {
    // Set ranked values in selection order (user can reorder by tapping)
    setRankedValues([...selectedValues]);
    setStep('cost');
    triggerHapticPulse('soft');
  }, [selectedValues]);

  const moveValueUp = useCallback((idx: number) => {
    if (idx === 0) return;
    setRankedValues((prev) => {
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next;
    });
  }, []);

  const submitForSynthesis = useCallback(async () => {
    setStep('synthesis');
    setLoading(true);
    setSynthesisError(null);
    triggerHapticPulse('medium');

    try {
      const prompt = buildPrompt(situation, rankedValues, costA, costB, fear);

      const res = await fetch('/api/oracle/conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: prompt,
          conversationHistory: [],
          element: 'earth',
        }),
      });

      if (!res.ok) {
        throw new Error(`Oracle returned ${res.status}`);
      }

      const data = await res.json();
      const responseText: string = data.response || data.message || '';
      setRawResponse(responseText);
      setSections(parseSynthesis(responseText));
    } catch (err) {
      setSynthesisError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [situation, rankedValues, costA, costB, fear]);

  const goToReturn = useCallback(() => {
    setStep('return');
    triggerHapticPulse('soft');
  }, []);

  const reset = useCallback(() => {
    setStep('situation');
    setSituation('');
    setSelectedValues([]);
    setCustomValue('');
    setCostA('');
    setCostB('');
    setFear('');
    setRankedValues([]);
    setSections([]);
    setSynthesisError(null);
    setRawResponse('');
    setReflection('');
    setLoading(false);
  }, []);

  // ─────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#0a0f14] text-white flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-3 px-5 pt-5 pb-3">
        <button
          onClick={() => router.push('/labtools')}
          className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-white/60" />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-lg">{'\u{1F9ED}'}</span>
          <h1 className="text-base font-medium text-white/80">Values Compass</h1>
        </div>
      </header>

      {/* Progress dots */}
      <div className="flex justify-center gap-2 px-5 pb-4">
        {(['situation', 'values', 'cost', 'synthesis', 'return'] as Step[]).map((s) => (
          <div
            key={s}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              s === step ? 'bg-[#D4B896] scale-125' : 'bg-white/10'
            }`}
          />
        ))}
      </div>

      <main className="flex-1 flex flex-col items-center justify-center px-5 pb-10">
        <AnimatePresence mode="wait">
          {/* ══════════ STEP 1: SITUATION ══════════ */}
          {step === 'situation' && (
            <motion.div
              key="situation"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-sm space-y-6"
            >
              <div className="text-center space-y-2">
                <p className="text-sm text-white/50">What decision or tension are you facing?</p>
                <p className="text-[11px] text-white/20">Describe it in a few sentences.</p>
              </div>

              <textarea
                value={situation}
                onChange={(e) => setSituation(e.target.value)}
                placeholder="I'm facing a situation where..."
                rows={5}
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:border-[#D4B896]/30 resize-none leading-relaxed"
                autoFocus
              />

              <motion.button
                onClick={goToValues}
                disabled={!canProceedFromSituation}
                whileTap={{ scale: 0.96 }}
                className={`w-full py-4 rounded-2xl font-medium text-base flex items-center justify-center gap-2 transition-all duration-200 ${
                  canProceedFromSituation
                    ? 'bg-gradient-to-r from-[#D4B896]/20 to-[#D4B896]/10 border border-[#D4B896]/20 text-[#D4B896] hover:from-[#D4B896]/30 hover:to-[#D4B896]/20'
                    : 'bg-white/[0.02] border border-white/[0.06] text-white/20 cursor-not-allowed'
                }`}
              >
                Continue <ChevronRight className="w-4 h-4" />
              </motion.button>
            </motion.div>
          )}

          {/* ══════════ STEP 2: VALUES ══════════ */}
          {step === 'values' && (
            <motion.div
              key="values"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-sm space-y-6"
            >
              <div className="text-center space-y-2">
                <p className="text-sm text-white/50">What feels like it matters here?</p>
                <p className="text-[11px] text-white/20">Choose 2-4 values in play.</p>
              </div>

              {/* Value chips */}
              <div className="flex flex-wrap gap-2 justify-center">
                {VALUE_CHIPS.map((v) => {
                  const isSelected = selectedValues.includes(v.label);
                  const isDisabled = !isSelected && selectedValues.length >= 4;
                  return (
                    <button
                      key={v.label}
                      onClick={() => toggleValue(v.label)}
                      disabled={isDisabled}
                      title={v.description}
                      className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                        isSelected
                          ? 'bg-[#D4B896]/15 text-[#D4B896] border border-[#D4B896]/25'
                          : isDisabled
                            ? 'bg-white/[0.01] text-white/15 border border-white/[0.04] cursor-not-allowed'
                            : 'bg-white/[0.02] text-white/40 border border-white/[0.06] hover:bg-white/[0.05]'
                      }`}
                    >
                      {v.label}
                    </button>
                  );
                })}
              </div>

              {/* Custom value */}
              <div className="flex gap-2">
                <input
                  ref={customInputRef}
                  value={customValue}
                  onChange={(e) => setCustomValue(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') addCustomValue(); }}
                  placeholder="Something else..."
                  disabled={selectedValues.length >= 4}
                  className="flex-1 px-3 py-2 bg-white/[0.03] border border-white/[0.08] rounded-lg text-xs text-white/70 placeholder:text-white/20 focus:outline-none focus:border-[#D4B896]/30 disabled:opacity-30"
                />
                <button
                  onClick={addCustomValue}
                  disabled={!customValue.trim() || selectedValues.length >= 4}
                  className="px-3 py-2 rounded-lg text-xs font-medium bg-white/[0.05] text-white/40 border border-white/[0.08] hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  Add
                </button>
              </div>

              {/* Selected count */}
              <p className="text-center text-[11px] text-white/20">
                {selectedValues.length} of 4 selected
              </p>

              <motion.button
                onClick={goToCost}
                disabled={!canProceedFromValues}
                whileTap={{ scale: 0.96 }}
                className={`w-full py-4 rounded-2xl font-medium text-base flex items-center justify-center gap-2 transition-all duration-200 ${
                  canProceedFromValues
                    ? 'bg-gradient-to-r from-[#D4B896]/20 to-[#D4B896]/10 border border-[#D4B896]/20 text-[#D4B896] hover:from-[#D4B896]/30 hover:to-[#D4B896]/20'
                    : 'bg-white/[0.02] border border-white/[0.06] text-white/20 cursor-not-allowed'
                }`}
              >
                Continue <ChevronRight className="w-4 h-4" />
              </motion.button>
            </motion.div>
          )}

          {/* ══════════ STEP 3: COST ══════════ */}
          {step === 'cost' && (
            <motion.div
              key="cost"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-sm space-y-6"
            >
              {/* Rank values */}
              <div className="space-y-3">
                <div className="text-center space-y-1">
                  <p className="text-xs text-white/30 uppercase tracking-wider font-medium">Order by importance</p>
                  <p className="text-[11px] text-white/15">Tap to move up</p>
                </div>
                <div className="space-y-1.5">
                  {rankedValues.map((v, idx) => (
                    <button
                      key={v}
                      onClick={() => moveValueUp(idx)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] transition-all text-left"
                    >
                      <span className="text-[10px] text-white/20 font-mono w-4">{idx + 1}</span>
                      <GripVertical className="w-3 h-3 text-white/15" />
                      <span className="text-sm text-white/60">{v}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Costs */}
              <div className="space-y-3">
                <p className="text-sm text-white/50 text-center">If you follow one path, what does it cost you?</p>

                <div className="space-y-2">
                  <div className="space-y-1">
                    <label className="text-[11px] text-white/25 uppercase tracking-wider">Path A cost</label>
                    <input
                      value={costA}
                      onChange={(e) => setCostA(e.target.value)}
                      placeholder="If I choose this direction..."
                      className="w-full px-3 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white/70 placeholder:text-white/20 focus:outline-none focus:border-[#D4B896]/30"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-white/25 uppercase tracking-wider">Path B cost</label>
                    <input
                      value={costB}
                      onChange={(e) => setCostB(e.target.value)}
                      placeholder="If I choose the other..."
                      className="w-full px-3 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white/70 placeholder:text-white/20 focus:outline-none focus:border-[#D4B896]/30"
                    />
                  </div>
                </div>
              </div>

              {/* Fear field (optional) */}
              <div className="space-y-1">
                <label className="text-[11px] text-white/20 uppercase tracking-wider">
                  What are you most afraid of getting wrong? <span className="text-white/10">(optional)</span>
                </label>
                <input
                  value={fear}
                  onChange={(e) => setFear(e.target.value)}
                  placeholder=""
                  className="w-full px-3 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white/70 placeholder:text-white/20 focus:outline-none focus:border-[#D4B896]/30"
                />
              </div>

              <motion.button
                onClick={submitForSynthesis}
                disabled={!canProceedFromCost}
                whileTap={{ scale: 0.96 }}
                className={`w-full py-4 rounded-2xl font-medium text-base flex items-center justify-center gap-2 transition-all duration-200 ${
                  canProceedFromCost
                    ? 'bg-gradient-to-r from-[#D4B896]/20 to-[#D4B896]/10 border border-[#D4B896]/20 text-[#D4B896] hover:from-[#D4B896]/30 hover:to-[#D4B896]/20'
                    : 'bg-white/[0.02] border border-white/[0.06] text-white/20 cursor-not-allowed'
                }`}
              >
                Ask MAIA <ChevronRight className="w-4 h-4" />
              </motion.button>
            </motion.div>
          )}

          {/* ══════════ STEP 4: SYNTHESIS ══════════ */}
          {step === 'synthesis' && (
            <motion.div
              key="synthesis"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-sm space-y-6"
            >
              {loading ? (
                <div className="flex flex-col items-center gap-6 py-12">
                  <div className="w-12 h-12 rounded-full border-2 border-[#D4B896]/20 border-t-[#D4B896]/60 animate-spin" />
                  <p className="text-sm text-white/30 animate-pulse">Sitting with this...</p>
                </div>
              ) : synthesisError ? (
                <div className="text-center space-y-4 py-8">
                  <p className="text-sm text-red-400/70">{synthesisError}</p>
                  <button
                    onClick={submitForSynthesis}
                    className="text-xs text-white/30 hover:text-white/50 underline transition-colors"
                  >
                    Try again
                  </button>
                </div>
              ) : (
                <>
                  {/* Synthesis sections */}
                  <div className="space-y-4">
                    {sections.map((section, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.15 }}
                        className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]"
                      >
                        <h3 className="text-xs text-[#D4B896]/70 uppercase tracking-wider font-medium mb-2">
                          {section.heading}
                        </h3>
                        <p className="text-sm text-white/60 leading-relaxed whitespace-pre-wrap">
                          {section.body}
                        </p>
                      </motion.div>
                    ))}
                  </div>

                  <motion.button
                    onClick={goToReturn}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: sections.length * 0.15 + 0.3 }}
                    whileTap={{ scale: 0.96 }}
                    className="w-full py-4 rounded-2xl font-medium text-base bg-gradient-to-r from-[#D4B896]/20 to-[#D4B896]/10 border border-[#D4B896]/20 text-[#D4B896] hover:from-[#D4B896]/30 hover:to-[#D4B896]/20 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    Continue <ChevronRight className="w-4 h-4" />
                  </motion.button>
                </>
              )}
            </motion.div>
          )}

          {/* ══════════ STEP 5: RETURN ══════════ */}
          {step === 'return' && (
            <motion.div
              key="return"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-sm space-y-6"
            >
              <div className="text-center space-y-2">
                <p className="text-sm text-white/50">What feels most true now?</p>
                <p className="text-[11px] text-white/15">Optional. Just for you.</p>
              </div>

              <textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder=""
                rows={4}
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:border-[#D4B896]/30 resize-none leading-relaxed"
                autoFocus
              />

              <div className="flex gap-3 w-full">
                <motion.button
                  onClick={reset}
                  whileTap={{ scale: 0.96 }}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-medium text-sm bg-white/[0.03] border border-white/[0.08] text-white/50 hover:bg-white/[0.06] transition-all duration-200"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Start again
                </motion.button>
                <motion.button
                  onClick={() => router.push('/labtools')}
                  whileTap={{ scale: 0.96 }}
                  className="flex-1 py-3.5 rounded-xl font-medium text-sm bg-gradient-to-r from-[#D4B896]/15 to-[#D4B896]/08 border border-[#D4B896]/15 text-[#D4B896]/80 hover:from-[#D4B896]/25 hover:to-[#D4B896]/15 transition-all duration-200"
                >
                  Done
                </motion.button>
              </div>

              <ToolBridge
                text="You might want to capture this."
                href="/labtools/journal"
                className="mt-3"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
