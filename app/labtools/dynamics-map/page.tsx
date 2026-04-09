'use client';

/**
 * Dynamics Map — Notice the patterns between you and another.
 *
 * Recurring relational patterns — pursue/withdraw, over-function/under-function,
 * projection loops, triangulation. Emerges from observed recurrence, not labels.
 *
 * Flow:
 *   0. Who — pick/type
 *   1. Recurrence — "What keeps happening?" (free text)
 *   2. Library — show common patterns, user marks any that resonate (or none)
 *   3. Your side — "What role do you notice yourself playing?"
 *   4. Summary — show the map, optionally save
 *
 * No scoring. No typology. No verdict. Patterns are presented as things
 * some people notice in themselves, grounded in the traditions that named them.
 *
 * Draws from: Bowen (differentiation, triangulation), IFS (parts polarization),
 * Gottman (observational research), EFT (pursue/withdraw), Satir
 * (communication stances), Attachment Theory.
 */

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronRight, RotateCcw, Save, Square, Activity } from 'lucide-react';
import { triggerHapticPulse } from '@/lib/haptics';
import { ToolBridge } from '@/components/labtools/ToolBridge';
import { RelationshipPicker, type PickedRelationship } from '@/components/labtools/RelationshipPicker';
import { SourcesFooter } from '@/components/labtools/SourcesFooter';
import {
  getSourcesForLabtool,
  LABTOOL_SOURCE_MAP,
  RELATIONSHIP_PATTERNS,
  getPatternSources,
} from '@/lib/relationships/relationshipResources';
import type { CounterpartLabel, DynamicTag } from '@/lib/relationships/types';
import { CANONICAL_DYNAMIC_TAGS } from '@/lib/relationships/types';

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
function toDynamicTags(ids: string[]): DynamicTag[] {
  return ids.filter((id): id is DynamicTag =>
    (CANONICAL_DYNAMIC_TAGS as readonly string[]).includes(id),
  );
}

// ─────────────────────────────────────────────────────
// DATA — common "sides" of recurring patterns
// (descriptive, not identity labels)
// ─────────────────────────────────────────────────────

const ROLES: { key: string; label: string; hint: string }[] = [
  { key: 'pursuer',       label: 'The one who reaches',    hint: 'You tend to close the gap when things feel off.' },
  { key: 'withdrawer',    label: 'The one who steps back', hint: 'You tend to take space when things heat up.' },
  { key: 'over-functioner', label: 'The one who holds it', hint: 'You tend to take responsibility for both sides.' },
  { key: 'under-functioner', label: 'The one who lets go', hint: 'You tend to relax into being managed.' },
  { key: 'peacekeeper',   label: 'The peacekeeper',        hint: 'You smooth edges, even at cost to yourself.' },
  { key: 'challenger',    label: 'The challenger',         hint: 'You tend to name what others avoid.' },
  { key: 'caretaker',     label: 'The caretaker',          hint: 'You tune into their needs before your own.' },
  { key: 'avoider',       label: 'The avoider',            hint: 'You tend to move away from the topic.' },
  { key: 'mixed',         label: 'Both, depending',        hint: 'You switch roles as the dynamic shifts.' },
];

// ─────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────

function DynamicsMapContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams?.get('relationshipId') ?? null;

  const [step, setStep] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [picked, setPicked] = useState<PickedRelationship | null>(null);
  const [recurrence, setRecurrence] = useState('');
  const [selectedPatterns, setSelectedPatterns] = useState<string[]>([]);
  const [myRole, setMyRole] = useState<string | null>(null);
  const [expandedPattern, setExpandedPattern] = useState<string | null>(null);
  const [savedEntryId, setSavedEntryId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const sources = useMemo(() => getSourcesForLabtool('dynamics-map'), []);

  useEffect(() => {
    triggerHapticPulse('soft');
  }, [step]);

  const togglePattern = (id: string) => {
    setSelectedPatterns((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  const canAdvanceFromPicker = !!picked?.name?.trim();

  const selectedPatternObjects = useMemo(
    () => RELATIONSHIP_PATTERNS.filter((p) => selectedPatterns.includes(p.id)),
    [selectedPatterns],
  );

  const summary = useMemo(() => {
    if (!picked) return '';
    const lines: string[] = [`Dynamics with ${picked.name}`];
    if (recurrence.trim()) lines.push(`What keeps happening: ${recurrence.trim()}`);
    if (selectedPatternObjects.length > 0) {
      lines.push(
        `Patterns I recognize: ${selectedPatternObjects.map((p) => p.name).join(', ')}`,
      );
    }
    if (myRole) {
      const role = ROLES.find((r) => r.key === myRole);
      if (role) lines.push(`My side of it: ${role.label}`);
    }
    return lines.join('\n');
  }, [picked, recurrence, selectedPatternObjects, myRole]);

  const onReset = () => {
    setStep(0);
    setPicked(null);
    setRecurrence('');
    setSelectedPatterns([]);
    setMyRole(null);
    setExpandedPattern(null);
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
          kind: 'reflection',
          content: summary,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSavedEntryId(data.entry.id);
        triggerHapticPulse('medium');

        // Emit a labtool_manual signal so the /maia field card reflects it.
        fetch('/api/maia/relational-signal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            relationshipId: picked.id,
            counterpartLabel: pickedToCounterpart(picked),
            tone: null,
            ruptureState: null,
            dynamicTags: toDynamicTags(selectedPatterns),
            frameworksApplied: LABTOOL_SOURCE_MAP['dynamics-map'] ?? [],
          }),
        }).catch(() => {});
      }
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  };

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
          <Activity className="mt-1 h-5 w-5 text-[#D4B896]/70" />
          <div>
            <h1 className="text-2xl font-semibold">Dynamics Map</h1>
            <p className="mt-1 text-sm text-white/50">
              Notice the patterns between you and another. Patterns, not identities.
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
                  label="Who is this between?"
                  hint="Dynamics emerge between two people. Name who you want to look at."
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
                    Map it
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ══════════ 1: RECURRENCE ══════════ */}
            {step === 1 && (
              <motion.div
                key="recurrence"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-6"
              >
                <div>
                  <div className="text-sm font-medium">
                    What keeps happening with {picked?.name}?
                  </div>
                  <div className="mt-1 text-xs text-white/45">
                    A few sentences about the thing that repeats. You can be rough.
                  </div>
                </div>

                <textarea
                  value={recurrence}
                  onChange={(e) => setRecurrence(e.target.value)}
                  rows={5}
                  placeholder="When X happens, they do Y, and I do Z. Then…"
                  className="
                    w-full rounded-xl border border-white/10 bg-black/20
                    px-3 py-2 text-sm text-white/90 placeholder:text-white/25
                    focus:outline-none focus:ring-2 focus:ring-[#D4B896]/30
                  "
                />

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
                    onClick={() => setStep(2)}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#D4B896]/20 px-3 py-2 text-xs text-[#D4B896] hover:bg-[#D4B896]/25 transition"
                  >
                    See patterns
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ══════════ 2: PATTERN LIBRARY ══════════ */}
            {step === 2 && (
              <motion.div
                key="patterns"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-6"
              >
                <div>
                  <div className="text-sm font-medium">Does any of this ring a bell?</div>
                  <div className="mt-1 text-xs text-white/45">
                    These are patterns people sometimes notice in themselves — each comes
                    from a tradition that studied it. Mark any that resonate. It's also
                    fine if none do.
                  </div>
                </div>

                <div className="space-y-2">
                  {RELATIONSHIP_PATTERNS.map((p) => {
                    const active = selectedPatterns.includes(p.id);
                    const expanded = expandedPattern === p.id;
                    const patternSources = getPatternSources(p);
                    return (
                      <div
                        key={p.id}
                        className={`
                          rounded-xl border transition
                          ${active
                            ? 'border-[#D4B896]/40 bg-[#D4B896]/8'
                            : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'
                          }
                        `}
                      >
                        <button
                          type="button"
                          onClick={() => togglePattern(p.id)}
                          className="w-full text-left p-3.5"
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`mt-0.5 h-3.5 w-3.5 flex-shrink-0 rounded-full border transition ${
                                active
                                  ? 'border-[#D4B896]/60 bg-[#D4B896]/50'
                                  : 'border-white/25'
                              }`}
                            />
                            <div className="flex-1">
                              <div className="text-sm font-medium text-white/85">
                                {p.name}
                              </div>
                              <div className="mt-0.5 text-xs text-white/50">
                                {p.shortDescription}
                              </div>
                            </div>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setExpandedPattern(expanded ? null : p.id)
                          }
                          className="mx-3.5 mb-2 text-[10px] uppercase tracking-wider text-white/30 hover:text-white/55 transition"
                        >
                          {expanded ? 'Less' : 'More on this'}
                        </button>

                        <AnimatePresence initial={false}>
                          {expanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="border-t border-white/[0.06] px-3.5 py-3 space-y-2">
                                <p className="text-xs leading-relaxed text-white/65">
                                  {p.description}
                                </p>
                                {p.reframe && (
                                  <p className="text-xs leading-relaxed text-[#D4B896]/60 italic">
                                    {p.reframe}
                                  </p>
                                )}
                                {patternSources.length > 0 && (
                                  <div className="pt-1 text-[10px] text-white/35">
                                    Comes from:{' '}
                                    {patternSources
                                      .map((s) => s.tradition)
                                      .join(' · ')}
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
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
                    {selectedPatterns.length === 0 ? 'None resonate — continue' : 'Next'}
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ══════════ 3: MY ROLE ══════════ */}
            {step === 3 && (
              <motion.div
                key="role"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-6"
              >
                <div>
                  <div className="text-sm font-medium">
                    What role do you notice yourself playing?
                  </div>
                  <div className="mt-1 text-xs text-white/45">
                    Not a type. Just what you do under pressure with this person.
                  </div>
                </div>

                <div className="space-y-2">
                  {ROLES.map((r) => {
                    const active = myRole === r.key;
                    return (
                      <button
                        key={r.key}
                        type="button"
                        onClick={() => setMyRole(r.key)}
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
                    See the map
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ══════════ 4: SUMMARY ══════════ */}
            {step === 4 && picked && (
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
                      Dynamics with
                    </div>
                    <div className="mt-0.5 text-lg font-medium text-white/90">
                      {picked.name}
                    </div>
                  </div>

                  {recurrence.trim() && (
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-white/30">
                        What keeps happening
                      </div>
                      <p className="mt-1 text-sm text-white/70">
                        {recurrence.trim()}
                      </p>
                    </div>
                  )}

                  {selectedPatternObjects.length > 0 ? (
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-white/30">
                        Patterns you recognized
                      </div>
                      <div className="mt-2 space-y-2">
                        {selectedPatternObjects.map((p) => {
                          const s = getPatternSources(p);
                          return (
                            <div
                              key={p.id}
                              className="rounded-lg border border-[#D4B896]/20 bg-[#D4B896]/5 p-3"
                            >
                              <div className="text-xs font-medium text-[#D4B896]/85">
                                {p.name}
                              </div>
                              {s.length > 0 && (
                                <div className="mt-0.5 text-[10px] text-white/35">
                                  {s.map((x) => x.tradition).join(' · ')}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs italic text-white/40">
                      No patterns marked — sometimes the freshest thing is refusing the box.
                    </div>
                  )}

                  {myRole && (
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-white/30">
                        Your side of it
                      </div>
                      <div className="mt-0.5 text-sm text-white/75">
                        {ROLES.find((r) => r.key === myRole)?.label}
                      </div>
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
                      {saving ? 'Saving…' : `Save to ${picked.name}'s timeline`}
                    </button>
                  )}
                  {savedEntryId && (
                    <div className="text-xs text-[#D4B896]/70">
                      ✓ Saved as reflection
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

                <ToolBridge
                  href={
                    picked.id
                      ? `/labtools/repair-path?relationshipId=${picked.id}`
                      : '/labtools/repair-path'
                  }
                  text="If something here is ready to be addressed, there are possible moves."
                  className="mt-3"
                />
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

export default function DynamicsMapPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0f14]" />}>
      <DynamicsMapContent />
    </Suspense>
  );
}
