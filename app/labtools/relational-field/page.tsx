'use client';

/**
 * Relational Field — Sense the tone and movement in a bond.
 *
 * Not analysis. Perception. A quick sensing flow for one specific relationship.
 *
 * Flow:
 *   0. Who — pick from existing relationships OR type a name
 *   1. Tone — what does it feel like right now (canonical tones)
 *   2. Signals — what is alive between you (up to 5)
 *   3. Unresolved — anything still open? (optional free text)
 *   4. Summary — show the snapshot, optionally save to field
 *
 * No AI. No diagnosis. Just your own perception, held cleanly.
 *
 * Draws from: Polyvagal Theory (nervous system states in connection),
 * Attachment (the pull toward and away), IFS (what part is noticing),
 * Welwood (relationship as a path of awakening).
 */

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronRight, RotateCcw, Save, Square, Waves } from 'lucide-react';
import { triggerHapticPulse } from '@/lib/haptics';
import { ToolBridge } from '@/components/labtools/ToolBridge';
import { RelationshipPicker, type PickedRelationship } from '@/components/labtools/RelationshipPicker';
import { SourcesFooter } from '@/components/labtools/SourcesFooter';
import { getSourcesForLabtool, LABTOOL_SOURCE_MAP } from '@/lib/relationships/relationshipResources';
import type { CounterpartLabel } from '@/lib/relationships/types';

const BOND_TO_COUNTERPART: Record<string, CounterpartLabel> = {
  partner: 'partner',
  family: 'family',
  friend: 'friend',
  professional: 'professional',
};
function pickedToCounterpart(p: PickedRelationship | null): CounterpartLabel {
  if (p?.bondType && BOND_TO_COUNTERPART[p.bondType]) return BOND_TO_COUNTERPART[p.bondType];
  return 'unspecified';
}

// ─────────────────────────────────────────────────────
// DATA — canonical tones & signals (match relationship_field_state)
// ─────────────────────────────────────────────────────

type Tone =
  | 'open' | 'contracted' | 'unclear' | 'tense' | 'warm'
  | 'distant' | 'fragile' | 'active' | 'quiet' | 'unresolved';

const TONES: { key: Tone; label: string; hint: string }[] = [
  { key: 'open',       label: 'Open',       hint: 'Space between you feels receptive.' },
  { key: 'warm',       label: 'Warm',       hint: 'Affection is close to the surface.' },
  { key: 'active',     label: 'Active',     hint: 'Something is moving — not settled, not stuck.' },
  { key: 'quiet',      label: 'Quiet',      hint: 'Low signal, neither pressured nor distant.' },
  { key: 'fragile',    label: 'Fragile',    hint: 'Tender, easily bruised right now.' },
  { key: 'distant',    label: 'Distant',    hint: 'Real space between you, for good or ill.' },
  { key: 'contracted', label: 'Contracted', hint: 'Something in the field has pulled inward.' },
  { key: 'tense',      label: 'Tense',      hint: 'Pressure, edge, braced.' },
  { key: 'unresolved', label: 'Unresolved', hint: 'Something is unfinished and knows it.' },
  { key: 'unclear',    label: 'Unclear',    hint: 'You cannot quite read it, and that is the data.' },
];

const SIGNALS = [
  'tension', 'closeness', 'distance', 'confusion', 'longing',
  'repair', 'avoidance', 'openness', 'grief', 'warmth',
  'pressure', 'gratitude', 'resentment', 'curiosity', 'stillness',
];

const MAX_SIGNALS = 5;

// ─────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────

function RelationalFieldContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialId = searchParams?.get('relationshipId') ?? null;

  const [step, setStep] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [picked, setPicked] = useState<PickedRelationship | null>(null);
  const [tone, setTone] = useState<Tone | null>(null);
  const [signals, setSignals] = useState<string[]>([]);
  const [unresolved, setUnresolved] = useState('');
  const [savedEntryId, setSavedEntryId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const sources = useMemo(() => getSourcesForLabtool('relational-field'), []);

  useEffect(() => {
    triggerHapticPulse('soft');
  }, [step]);

  const toggleSignal = (sig: string) => {
    setSignals((prev) => {
      if (prev.includes(sig)) return prev.filter((s) => s !== sig);
      if (prev.length >= MAX_SIGNALS) return prev;
      return [...prev, sig];
    });
  };

  const canAdvanceFromPicker = !!picked?.name?.trim();
  const canAdvanceFromTone = !!tone;
  const canAdvanceFromSignals = signals.length > 0;

  const summary = useMemo(() => {
    if (!picked || !tone) return '';
    const lines: string[] = [];
    lines.push(`Field with ${picked.name}: ${tone}`);
    if (signals.length > 0) lines.push(`Alive: ${signals.join(', ')}`);
    if (unresolved.trim()) lines.push(`Unresolved: ${unresolved.trim()}`);
    return lines.join('\n');
  }, [picked, tone, signals, unresolved]);

  const onReset = () => {
    setStep(0);
    setPicked(null);
    setTone(null);
    setSignals([]);
    setUnresolved('');
    setSavedEntryId(null);
  };

  const onSave = async () => {
    if (!picked?.id) return; // only save to existing relationships
    setSaving(true);
    try {
      const res = await fetch(`/api/relationships/${picked.id}/entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: 'reflection',
          content: summary,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSavedEntryId(data.entry.id);
        triggerHapticPulse('medium');

        // Emit a labtool_manual signal so the /maia field card reflects it.
        // Fire-and-forget — if it fails, the labtool save is still valid.
        fetch('/api/maia/relational-signal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            relationshipId: picked.id,
            counterpartLabel: pickedToCounterpart(picked),
            tone,
            ruptureState: hasRuptureSignal ? 'strained' : 'none',
            dynamicTags: [],
            frameworksApplied: LABTOOL_SOURCE_MAP['relational-field'] ?? [],
          }),
        }).catch(() => {});
      }
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  };

  const hasRuptureSignal =
    signals.includes('tension') ||
    signals.includes('grief') ||
    signals.includes('resentment') ||
    tone === 'unresolved' ||
    tone === 'tense';

  // ─────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#0a0f14] text-white">
      <div className="mx-auto max-w-3xl px-4 py-10">
        {/* ── Header ── */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/labtools"
            className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white/80 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Lab
          </Link>

          {step !== 0 && step !== 4 ? (
            <button
              type="button"
              className="
                inline-flex items-center gap-2
                rounded-xl border border-white/10 bg-white/5
                px-3 py-2 text-xs text-white/70
                hover:bg-white/10 transition
              "
              onClick={() => setStep(0)}
            >
              <Square className="h-4 w-4" />
              Stop
            </button>
          ) : (
            <div />
          )}
        </div>

        {/* ── Title ── */}
        <div className="mb-2 flex items-start gap-3">
          <Waves className="mt-1 h-5 w-5 text-[#D4B896]/70" />
          <div>
            <h1 className="text-2xl font-semibold">Relational Field</h1>
            <p className="mt-1 text-sm text-white/50">
              Sense the tone and movement in a bond. Not analysis. Perception.
            </p>
          </div>
        </div>

        {/* ── Step indicator ── */}
        <div className="mt-5 mb-6 flex gap-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-1.5 w-10 rounded-full transition-colors ${
                i === step ? 'bg-[#D4B896]/70' : 'bg-white/10'
              }`}
            />
          ))}
        </div>

        {/* ── Content ── */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <AnimatePresence mode="wait">
            {/* ══════════ 0: WHO ══════════ */}
            {step === 0 && (
              <motion.div
                key="who"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-6"
              >
                <RelationshipPicker
                  value={picked}
                  onChange={setPicked}
                  initialId={initialId}
                  label="Who is the field between?"
                  hint="Pick someone from your field, or just type a name. Both work."
                />

                <div className="flex justify-end">
                  <button
                    type="button"
                    disabled={!canAdvanceFromPicker}
                    onClick={() => setStep(1)}
                    className={`
                      inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs transition
                      ${canAdvanceFromPicker
                        ? 'bg-[#D4B896]/20 text-[#D4B896] hover:bg-[#D4B896]/25'
                        : 'bg-white/5 text-white/25 cursor-not-allowed'
                      }
                    `}
                  >
                    Sense the field
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ══════════ 1: TONE ══════════ */}
            {step === 1 && (
              <motion.div
                key="tone"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-6"
              >
                <div>
                  <div className="text-sm font-medium">
                    What does the field with {picked?.name} feel like right now?
                  </div>
                  <div className="mt-1 text-xs text-white/45">
                    Don't think about it too long. Which of these is closest?
                  </div>
                </div>

                <div className="grid gap-2 md:grid-cols-2">
                  {TONES.map((t) => {
                    const active = tone === t.key;
                    return (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() => setTone(t.key)}
                        className={`
                          rounded-xl border px-3 py-3 text-left transition
                          ${active
                            ? 'border-[#D4B896]/40 bg-[#D4B896]/10'
                            : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'
                          }
                        `}
                      >
                        <div className="text-sm font-medium text-white/85">{t.label}</div>
                        <div className="mt-0.5 text-xs text-white/40">{t.hint}</div>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(0)}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70 hover:bg-white/10 transition"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={!canAdvanceFromTone}
                    onClick={() => setStep(2)}
                    className={`
                      inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs transition
                      ${canAdvanceFromTone
                        ? 'bg-[#D4B896]/20 text-[#D4B896] hover:bg-[#D4B896]/25'
                        : 'bg-white/5 text-white/25 cursor-not-allowed'
                      }
                    `}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ══════════ 2: SIGNALS ══════════ */}
            {step === 2 && (
              <motion.div
                key="signals"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-6"
              >
                <div>
                  <div className="text-sm font-medium">What is alive between you?</div>
                  <div className="mt-1 text-xs text-white/45">
                    Pick up to {MAX_SIGNALS}. Some will be opposites — that's fine.
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {SIGNALS.map((s) => {
                    const active = signals.includes(s);
                    const disabled = !active && signals.length >= MAX_SIGNALS;
                    return (
                      <button
                        key={s}
                        type="button"
                        disabled={disabled}
                        onClick={() => toggleSignal(s)}
                        className={`
                          rounded-xl border px-3 py-1.5 text-xs transition
                          ${active
                            ? 'border-[#D4B896]/40 bg-[#D4B896]/15 text-[#D4B896]'
                            : disabled
                              ? 'border-white/5 bg-white/[0.02] text-white/20 cursor-not-allowed'
                              : 'border-white/10 bg-white/[0.03] text-white/65 hover:bg-white/[0.06]'
                          }
                        `}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70 hover:bg-white/10 transition"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={!canAdvanceFromSignals}
                    onClick={() => setStep(3)}
                    className={`
                      inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs transition
                      ${canAdvanceFromSignals
                        ? 'bg-[#D4B896]/20 text-[#D4B896] hover:bg-[#D4B896]/25'
                        : 'bg-white/5 text-white/25 cursor-not-allowed'
                      }
                    `}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ══════════ 3: UNRESOLVED (optional) ══════════ */}
            {step === 3 && (
              <motion.div
                key="unresolved"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-6"
              >
                <div>
                  <div className="text-sm font-medium">Anything still open between you?</div>
                  <div className="mt-1 text-xs text-white/45">
                    Optional. A sentence or two if something is unfinished.
                  </div>
                </div>

                <textarea
                  value={unresolved}
                  onChange={(e) => setUnresolved(e.target.value)}
                  rows={4}
                  placeholder="Something I haven't said… / A thread that hasn't closed…"
                  className="
                    w-full rounded-xl border border-white/10 bg-black/20
                    px-3 py-2 text-sm text-white/90 placeholder:text-white/25
                    focus:outline-none focus:ring-2 focus:ring-[#D4B896]/30
                  "
                />

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70 hover:bg-white/10 transition"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStep(4);
                      triggerHapticPulse('medium');
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#D4B896]/20 px-3 py-2 text-xs text-[#D4B896] hover:bg-[#D4B896]/25 transition"
                  >
                    See the field
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ══════════ 4: SUMMARY ══════════ */}
            {step === 4 && picked && tone && (
              <motion.div
                key="summary"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-5"
              >
                <div className="rounded-2xl border border-white/10 bg-black/20 p-5 space-y-4">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-white/30">
                      Field with
                    </div>
                    <div className="mt-0.5 text-lg font-medium text-white/90">
                      {picked.name}
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-white/30">
                      Tone
                    </div>
                    <div className="mt-0.5 text-sm text-[#D4B896]/80 capitalize">
                      {tone}
                    </div>
                  </div>

                  {signals.length > 0 && (
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-white/30">
                        Alive
                      </div>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {signals.map((s) => (
                          <span
                            key={s}
                            className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-white/65"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {unresolved.trim() && (
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-white/30">
                        Unresolved
                      </div>
                      <p className="mt-1 text-sm text-white/70 italic">
                        {unresolved.trim()}
                      </p>
                    </div>
                  )}
                </div>

                {/* Save / Skip */}
                <div className="flex flex-wrap items-center gap-2">
                  {picked.id && !savedEntryId && (
                    <button
                      type="button"
                      onClick={onSave}
                      disabled={saving}
                      className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/75 hover:bg-white/10 transition disabled:opacity-40"
                    >
                      <Save className="h-3.5 w-3.5" />
                      {saving ? 'Saving…' : `Save to ${picked.name}'s field`}
                    </button>
                  )}
                  {savedEntryId && (
                    <div className="text-xs text-[#D4B896]/70">
                      ✓ Saved to the timeline
                    </div>
                  )}
                  {!picked.id && (
                    <div className="text-[11px] text-white/35 italic">
                      Nothing is being stored — you typed a name instead of picking one from your field.
                    </div>
                  )}

                  <div className="ml-auto flex gap-2">
                    <button
                      type="button"
                      onClick={onReset}
                      className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70 hover:bg-white/10 transition"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Again
                    </button>
                    <Link
                      href="/labtools"
                      className="rounded-xl bg-white/10 px-3 py-2 text-xs text-white/80 hover:bg-white/15 transition"
                    >
                      Done
                    </Link>
                  </div>
                </div>

                {/* Bridges */}
                {hasRuptureSignal ? (
                  <ToolBridge
                    href={
                      picked.id
                        ? `/labtools/repair-path?relationshipId=${picked.id}`
                        : '/labtools/repair-path'
                    }
                    text="If something feels broken, there are possible moves to consider."
                    className="mt-3"
                  />
                ) : (
                  <ToolBridge
                    href={
                      picked.id
                        ? `/labtools/dynamics-map?relationshipId=${picked.id}`
                        : '/labtools/dynamics-map'
                    }
                    text="If the same thing keeps showing up, you can map the pattern."
                    className="mt-3"
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Sources ── */}
        <SourcesFooter sources={sources} />
      </div>
    </div>
  );
}

export default function RelationalFieldPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0f14]" />}>
      <RelationalFieldContent />
    </Suspense>
  );
}
