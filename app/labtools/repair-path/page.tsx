'use client';

/**
 * Repair Path — Possible moves after rupture.
 *
 * When something has broken or stalled between you and someone, this tool
 * offers possible moves — not prescriptions. Surfaces only when rupture
 * is present (the user confirms it).
 *
 * Flow:
 *   0. Check — is there actually a rupture? (if not, redirect)
 *   1. Who + What — pick/type + brief description of what happened
 *   2. Readiness — where does this sit right now
 *   3. Moves — pick from a small library of possible moves (not required)
 *   4. Summary — show what you're considering, optionally save
 *
 * No AI generation. No prescribed script. Every move is a user choice,
 * and "let it end" is a legitimate move. The tool does not pretend to
 * know if repair is right or possible — the user knows.
 *
 * Draws from: The Gottman Method (repair attempts, the Four Horsemen),
 * NVC (observation-feeling-need-request), EFT (reaching from attachment),
 * Imago (mirrored dialogue), Esther Perel (the erotic/secure paradox),
 * John Welwood (intimacy as a path without bypass).
 */

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ChevronRight, RotateCcw, Save, Square, Wind,
  Clock, MessageCircle, Hand, Heart, Shield, DoorClosed,
} from 'lucide-react';
import { triggerHapticPulse } from '@/lib/haptics';
import { ToolBridge } from '@/components/labtools/ToolBridge';
import { RelationshipPicker, type PickedRelationship } from '@/components/labtools/RelationshipPicker';
import { SourcesFooter } from '@/components/labtools/SourcesFooter';
import { getSourcesForLabtool, LABTOOL_SOURCE_MAP } from '@/lib/relationships/relationshipResources';
import type { CounterpartLabel } from '@/lib/relationships/types';
import type { LucideIcon } from 'lucide-react';

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
// DATA — possible moves (ordered from least to most active)
// ─────────────────────────────────────────────────────

type Readiness =
  | 'cannot-yet'       // "I can't talk yet"
  | 'willing-unclear'  // "I want to but don't know how"
  | 'ready-they-not'   // "I'm ready, they're not"
  | 'ready-unclear';   // "I'm ready, just unclear what to say"

interface Move {
  key: string;
  label: string;
  body: string;
  lineage: string; // which tradition this move comes from
  icon: LucideIcon;
  readinessFit: Readiness[];
}

const MOVES: Move[] = [
  {
    key: 'let-it-settle',
    label: 'Let it settle',
    body: 'Time is sometimes the repair. Not avoidance — metabolism. The nervous system needs to come down before words can land.',
    lineage: 'Polyvagal Theory: you cannot repair from a dysregulated state.',
    icon: Clock,
    readinessFit: ['cannot-yet', 'ready-they-not'],
  },
  {
    key: 'signal-open',
    label: 'Signal you are open (no words)',
    body: 'A small gesture — a door left unlocked, a plate set, a message that just says "thinking of you" — without pressure to respond.',
    lineage: 'Gottman: small bids for connection often matter more than grand conversations.',
    icon: Hand,
    readinessFit: ['cannot-yet', 'willing-unclear', 'ready-they-not'],
  },
  {
    key: 'ask-one-question',
    label: 'Ask one question',
    body: 'Not a case. A single question that shows you want to understand, not argue. "What was it like for you when…?" is more than enough.',
    lineage: 'Imago: the mirrored dialogue begins with curiosity, not correction.',
    icon: MessageCircle,
    readinessFit: ['willing-unclear', 'ready-unclear'],
  },
  {
    key: 'speak-impact',
    label: 'Speak from impact',
    body: 'Name what happened (observation), what it stirred in you (feeling), what mattered (need), and what you are asking (request). Four clean pieces. No attack.',
    lineage: 'NVC (Rosenberg): observation → feeling → need → request.',
    icon: Heart,
    readinessFit: ['willing-unclear', 'ready-unclear'],
  },
  {
    key: 'set-boundary',
    label: 'Set a limit',
    body: 'Name what you can and cannot hold. A boundary is not a punishment. It is the shape you need for any future contact to be honest.',
    lineage: 'Bowen: differentiation is the ground of genuine connection.',
    icon: Shield,
    readinessFit: ['ready-they-not', 'ready-unclear'],
  },
  {
    key: 'let-it-end',
    label: 'Let it end',
    body: 'Not every rupture is a call to repair. Sometimes the rupture is the truth. Closure — honest, unblaming — is also a move.',
    lineage: 'Welwood: the path of conscious relationship includes conscious ending.',
    icon: DoorClosed,
    readinessFit: ['cannot-yet', 'ready-they-not', 'ready-unclear'],
  },
];

const READINESS: { key: Readiness; label: string; hint: string }[] = [
  { key: 'cannot-yet',       label: "I can't talk yet",            hint: 'Too charged. Regulation comes before words.' },
  { key: 'willing-unclear',  label: "I want to, but don't know how", hint: 'Willing, reaching for a form.' },
  { key: 'ready-they-not',   label: "I'm ready. They're not.",      hint: 'Your side is settled. Theirs is not.' },
  { key: 'ready-unclear',    label: "I'm ready — just unclear what to say", hint: 'Clarity of direction, not of words.' },
];

// ─────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────

function RepairPathContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams?.get('relationshipId') ?? null;

  // Step -1 is the rupture gate; 0–4 are the main flow
  const [step, setStep] = useState<-1 | 0 | 1 | 2 | 3 | 4>(-1);
  const [ruptureConfirmed, setRuptureConfirmed] = useState(false);
  const [picked, setPicked] = useState<PickedRelationship | null>(null);
  const [whatHappened, setWhatHappened] = useState('');
  const [readiness, setReadiness] = useState<Readiness | null>(null);
  const [selectedMoves, setSelectedMoves] = useState<string[]>([]);
  const [savedEntryId, setSavedEntryId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const sources = useMemo(() => getSourcesForLabtool('repair-path'), []);

  useEffect(() => {
    triggerHapticPulse('soft');
  }, [step]);

  const toggleMove = (key: string) => {
    setSelectedMoves((prev) =>
      prev.includes(key) ? prev.filter((m) => m !== key) : [...prev, key],
    );
  };

  const canAdvanceFromPicker = !!picked?.name?.trim();
  const canAdvanceFromReadiness = !!readiness;

  const filteredMoves = useMemo(() => {
    if (!readiness) return MOVES;
    // Show moves that fit the readiness, plus always show let-it-end and let-it-settle
    const fit = MOVES.filter((m) => m.readinessFit.includes(readiness));
    return fit.length > 0 ? fit : MOVES;
  }, [readiness]);

  const selectedMoveObjects = useMemo(
    () => MOVES.filter((m) => selectedMoves.includes(m.key)),
    [selectedMoves],
  );

  const summary = useMemo(() => {
    if (!picked) return '';
    const lines: string[] = [`Repair path for ${picked.name}`];
    if (whatHappened.trim()) lines.push(`What happened: ${whatHappened.trim()}`);
    if (readiness) {
      lines.push(`Where I am: ${READINESS.find((r) => r.key === readiness)?.label ?? ''}`);
    }
    if (selectedMoveObjects.length > 0) {
      lines.push(
        `Moves I'm considering: ${selectedMoveObjects.map((m) => m.label).join(', ')}`,
      );
    }
    return lines.join('\n');
  }, [picked, whatHappened, readiness, selectedMoveObjects]);

  const onReset = () => {
    setStep(-1);
    setRuptureConfirmed(false);
    setPicked(null);
    setWhatHappened('');
    setReadiness(null);
    setSelectedMoves([]);
    setSavedEntryId(null);
  };

  const onSave = async () => {
    if (!picked?.id) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/relationships/${picked.id}/entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: 'repair',
          content: summary,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSavedEntryId(data.entry.id);
        triggerHapticPulse('medium');

        // Emit a labtool_manual signal so the /maia field card reflects it.
        // Repair Path is gated on rupture — we always emit strained at minimum.
        fetch('/api/maia/relational-signal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            relationshipId: picked.id,
            counterpartLabel: pickedToCounterpart(picked),
            tone: null,
            ruptureState: 'strained',
            dynamicTags: [],
            frameworksApplied: LABTOOL_SOURCE_MAP['repair-path'] ?? [],
          }),
        }).catch(() => {});
      }
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  };

  // For the step indicator, map -1 to first pip
  const indicatorStep = Math.max(step, 0);

  // Check if "speak from impact" is selected → surface Repair Script bridge
  const hasSpeakMove = selectedMoves.includes('speak-impact');

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

          {step !== -1 && step !== 0 && step !== 4 ? (
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70 hover:bg-white/10 transition"
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
          <Wind className="mt-1 h-5 w-5 text-[#D4B896]/70" />
          <div>
            <h1 className="text-2xl font-semibold">Repair Path</h1>
            <p className="mt-1 text-sm text-white/50">
              Possible moves after rupture. Not prescriptions.
            </p>
          </div>
        </div>

        {/* ── Step indicator (only during main flow) ── */}
        {step >= 0 && (
          <div className="mt-5 mb-6 flex gap-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-1.5 w-10 rounded-full transition-colors ${
                  i === indicatorStep ? 'bg-[#D4B896]/70' : 'bg-white/10'
                }`}
              />
            ))}
          </div>
        )}

        {/* ── Content ── */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <AnimatePresence mode="wait">
            {/* ══════════ -1: RUPTURE GATE ══════════ */}
            {step === -1 && (
              <motion.div
                key="gate"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-6"
              >
                <div>
                  <div className="text-sm font-medium">
                    Has something broken or stalled between you and someone?
                  </div>
                  <div className="mt-1 text-xs text-white/45">
                    This tool only makes sense when there is actual rupture — an argument,
                    a drift, a wound, a silence. If not, other tools may serve better.
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <button
                    type="button"
                    onClick={() => {
                      setRuptureConfirmed(true);
                      setStep(0);
                    }}
                    className="rounded-xl border border-[#D4B896]/25 bg-[#D4B896]/10 p-4 text-left hover:bg-[#D4B896]/15 transition"
                  >
                    <div className="text-sm font-medium text-[#D4B896]/85">Yes</div>
                    <div className="mt-1 text-xs text-white/50">
                      Something is off, hurt, or stalled.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRuptureConfirmed(true);
                      setStep(0);
                    }}
                    className="rounded-xl border border-white/10 bg-white/5 p-4 text-left hover:bg-white/10 transition"
                  >
                    <div className="text-sm font-medium text-white/85">Not sure</div>
                    <div className="mt-1 text-xs text-white/50">
                      Something feels off but I can't quite name it.
                    </div>
                  </button>

                  <Link
                    href="/labtools/relational-field"
                    className="rounded-xl border border-white/10 bg-white/5 p-4 text-left hover:bg-white/10 transition block"
                  >
                    <div className="text-sm font-medium text-white/85">No</div>
                    <div className="mt-1 text-xs text-white/50">
                      Try Relational Field for sensing the tone instead.
                    </div>
                  </Link>
                </div>
              </motion.div>
            )}

            {/* ══════════ 0: WHO + WHAT ══════════ */}
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
                  label="Who is this about?"
                  hint="Name the person the rupture is with."
                />

                {picked && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium">What happened?</div>
                    <div className="text-xs text-white/45">
                      A few sentences. No need to write a case — just enough to know what we're working with.
                    </div>
                    <textarea
                      value={whatHappened}
                      onChange={(e) => setWhatHappened(e.target.value)}
                      rows={4}
                      placeholder="Something broke. What was it?"
                      className="
                        w-full rounded-xl border border-white/10 bg-black/20
                        px-3 py-2 text-sm text-white/90 placeholder:text-white/25
                        focus:outline-none focus:ring-2 focus:ring-[#D4B896]/30
                      "
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(-1)}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70 hover:bg-white/10 transition"
                  >
                    Back
                  </button>
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
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ══════════ 1: READINESS ══════════ */}
            {step === 1 && (
              <motion.div
                key="readiness"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-6"
              >
                <div>
                  <div className="text-sm font-medium">Where are you with this right now?</div>
                  <div className="mt-1 text-xs text-white/45">
                    Honest beats idealized. There's no wrong answer.
                  </div>
                </div>

                <div className="space-y-2">
                  {READINESS.map((r) => {
                    const active = readiness === r.key;
                    return (
                      <button
                        key={r.key}
                        type="button"
                        onClick={() => setReadiness(r.key)}
                        className={`
                          w-full rounded-xl border px-4 py-3 text-left transition
                          ${active
                            ? 'border-[#D4B896]/40 bg-[#D4B896]/10'
                            : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'
                          }
                        `}
                      >
                        <div className="text-sm font-medium text-white/85">{r.label}</div>
                        <div className="mt-0.5 text-xs text-white/45">{r.hint}</div>
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
                    disabled={!canAdvanceFromReadiness}
                    onClick={() => setStep(2)}
                    className={`
                      inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs transition
                      ${canAdvanceFromReadiness
                        ? 'bg-[#D4B896]/20 text-[#D4B896] hover:bg-[#D4B896]/25'
                        : 'bg-white/5 text-white/25 cursor-not-allowed'
                      }
                    `}
                  >
                    See possible moves
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ══════════ 2: MOVES ══════════ */}
            {step === 2 && (
              <motion.div
                key="moves"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-6"
              >
                <div>
                  <div className="text-sm font-medium">What feels possible from here?</div>
                  <div className="mt-1 text-xs text-white/45">
                    These are possibilities — not a checklist. Mark any that resonate,
                    or none. You can take one, take several, or just look.
                  </div>
                </div>

                <div className="space-y-2">
                  {filteredMoves.map((m) => {
                    const active = selectedMoves.includes(m.key);
                    const Icon = m.icon;
                    return (
                      <button
                        key={m.key}
                        type="button"
                        onClick={() => toggleMove(m.key)}
                        className={`
                          w-full rounded-xl border p-4 text-left transition
                          ${active
                            ? 'border-[#D4B896]/40 bg-[#D4B896]/8'
                            : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'
                          }
                        `}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`
                              mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center
                              rounded-lg transition
                              ${active
                                ? 'bg-[#D4B896]/20 text-[#D4B896]/85'
                                : 'bg-white/5 text-white/45'
                              }
                            `}
                          >
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-white/85">{m.label}</div>
                            <div className="mt-1 text-xs leading-relaxed text-white/55">
                              {m.body}
                            </div>
                            <div className="mt-1.5 text-[10px] italic text-white/30">
                              {m.lineage}
                            </div>
                          </div>
                        </div>
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
                    onClick={() => setStep(3)}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#D4B896]/20 px-3 py-2 text-xs text-[#D4B896] hover:bg-[#D4B896]/25 transition"
                  >
                    {selectedMoves.length === 0 ? 'None for now — continue' : 'Next'}
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ══════════ 3: SUMMARY ══════════ */}
            {step === 3 && picked && (
              <motion.div
                key="summary-pre"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-5"
              >
                <div>
                  <div className="text-sm font-medium">Before you close this.</div>
                  <div className="mt-1 text-xs text-white/45">
                    Nothing has to happen today. Notice what you're considering — then let it be.
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-5 space-y-4">
                  {selectedMoveObjects.length > 0 ? (
                    <div className="space-y-2">
                      {selectedMoveObjects.map((m) => {
                        const Icon = m.icon;
                        return (
                          <div
                            key={m.key}
                            className="flex items-start gap-3 rounded-lg border border-[#D4B896]/20 bg-[#D4B896]/5 p-3"
                          >
                            <Icon className="mt-0.5 h-4 w-4 text-[#D4B896]/70" />
                            <div className="text-xs text-white/75">{m.label}</div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-xs italic text-white/45">
                      Nothing selected. That is also a complete answer — sometimes what a rupture
                      needs is simply to be noticed without being acted on.
                    </div>
                  )}
                </div>

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
                    Close
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ══════════ 4: SAVE / DONE ══════════ */}
            {step === 4 && picked && (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-5"
              >
                <div className="rounded-2xl border border-white/10 bg-black/20 p-5 space-y-4">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-white/30">
                      Repair path for
                    </div>
                    <div className="mt-0.5 text-lg font-medium text-white/90">
                      {picked.name}
                    </div>
                  </div>

                  {whatHappened.trim() && (
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-white/30">
                        What happened
                      </div>
                      <p className="mt-1 text-sm text-white/70">
                        {whatHappened.trim()}
                      </p>
                    </div>
                  )}

                  {readiness && (
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-white/30">
                        Where I am
                      </div>
                      <div className="mt-0.5 text-sm text-white/75">
                        {READINESS.find((r) => r.key === readiness)?.label}
                      </div>
                    </div>
                  )}

                  {selectedMoveObjects.length > 0 && (
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-white/30">
                        Moves I'm considering
                      </div>
                      <div className="mt-2 space-y-1.5">
                        {selectedMoveObjects.map((m) => (
                          <div
                            key={m.key}
                            className="text-xs text-white/70 before:mr-1.5 before:text-[#D4B896]/40 before:content-['·']"
                          >
                            {m.label}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {picked.id && !savedEntryId && (
                    <button
                      type="button"
                      onClick={onSave}
                      disabled={saving}
                      className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/75 hover:bg-white/10 transition disabled:opacity-40"
                    >
                      <Save className="h-3.5 w-3.5" />
                      {saving ? 'Saving…' : `Save to ${picked.name}'s timeline`}
                    </button>
                  )}
                  {savedEntryId && (
                    <div className="text-xs text-[#D4B896]/70">
                      ✓ Saved as a repair note
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

                {/* Bridge to Repair Script if "speak from impact" is chosen */}
                {hasSpeakMove && (
                  <ToolBridge
                    href="/labtools/repair-script"
                    text="If you're ready to write what you want to say, Repair Script gives it a clean shape."
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

export default function RepairPathPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0f14]" />}>
      <RepairPathContent />
    </Suspense>
  );
}
