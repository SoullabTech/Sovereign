'use client';

/**
 * Relational Field — Sense the tone and movement in a bond.
 *
 * Not analysis. Perception. A quick sensing flow for any relational
 * atmosphere — a named person, a group, a situation, yourself, or a
 * field that does not have a shape yet.
 *
 * Flow (6 steps — Phase 4 additive overlay over the Phase 2 backbone):
 *   0. Who         — entry counterpart branch:
 *                    person | group | situation | self | unnamed_field.
 *                    If person → existing RelationshipPicker. Else →
 *                    bypass picker, carry counterpart label through.
 *   1. Tone        — what does it feel like right now (10 entry tones)
 *   2. Movement    — what feels most active in the field (6 cues; optional)
 *   3. Signals     — what is alive between you (up to 5)
 *   4. Unresolved  — anything still open? (optional free text)
 *   5. Summary     — show the snapshot, save + pathways + continuity hint
 *
 * Phase 2 affordances preserved intact:
 *   • 15-signal multi-select vocabulary + MAX_SIGNALS cap
 *   • Unresolved free-text capture
 *   • hasRuptureSignal derivation (drives ToolBridge routing)
 *   • ToolBridge handoff to Dynamics Map or Repair Path
 *   • POST /api/relationships/[id]/entries save path
 *   • savedEntryId confirmation state
 *   • ephemeral (typed name) vs persistent (picked record) distinction
 *   • fire-and-forget labtool_manual signal emission
 *
 * Phase 4 additions (additive, not replacing):
 *   • Entry counterpart branch inside Step 0
 *   • Movement cue step (new Step 2)
 *   • 4 pathways on Summary alongside Save + ToolBridge:
 *       - Stay with it  (passive prompts, inline)
 *       - Work with it  (explicit bridge to Dynamics Map / Repair Path)
 *       - Bring to MAIA (seeded prompt, route)
 *       - Hold in an Idea (create idea + seed note + touch + navigate)
 *   • Continuity hint on Summary (priorMatches >= 1, excluding current row)
 *   • movementCue persisted on the labtool_manual signal
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
import {
  ArrowLeft,
  ChevronRight,
  Circle,
  HelpCircle,
  Lightbulb,
  MessageCircle,
  Orbit,
  Pause,
  RotateCcw,
  Save,
  Square,
  User,
  Users,
  Waves,
  Wind,
} from 'lucide-react';
import { triggerHapticPulse } from '@/lib/haptics';
import { ToolBridge } from '@/components/labtools/ToolBridge';
import { RelationshipPicker, type PickedRelationship } from '@/components/labtools/RelationshipPicker';
import { SourcesFooter } from '@/components/labtools/SourcesFooter';
import { getSourcesForLabtool, LABTOOL_SOURCE_MAP } from '@/lib/relationships/relationshipResources';
import type { CounterpartLabel, MovementCue } from '@/lib/relationships/types';
import { CANONICAL_MOVEMENT_CUES } from '@/lib/relationships/types';
import { apiFetch } from '@/lib/http/apiBase';
import { seedFromSource } from '@/lib/maia/seedPrompt';

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
// [Phase 4] Entry counterpart branch — neutral labels
// ─────────────────────────────────────────────────────

/**
 * EntryKind is the new Step 0 branch — "what are you in relation to?"
 * When `person` is chosen, the existing RelationshipPicker is shown.
 * Other kinds bypass the picker entirely and carry the neutral label
 * through to the signal emission and the pathway handlers.
 */
type EntryKind = 'person' | 'group' | 'situation' | 'self' | 'unnamed_field';

const ENTRY_OPTIONS: {
  key: EntryKind;
  label: string;
  hint: string;
  icon: typeof User;
}[] = [
  { key: 'person',        label: 'A person',                    hint: 'Someone in your life.',               icon: User       },
  { key: 'group',         label: 'A group',                     hint: 'Family, team, circle.',               icon: Users      },
  { key: 'situation',     label: 'A situation',                 hint: 'A living condition, not a person.',   icon: Orbit      },
  { key: 'self',          label: 'Myself',                      hint: 'Something active within you.',        icon: Circle     },
  { key: 'unnamed_field', label: "Something I can't name yet",  hint: 'A field without a shape.',            icon: HelpCircle },
];

/**
 * Resolve the counterpart label that goes on the persisted signal.
 * Picker-derived bond types still win when entryKind === 'person'
 * (partner/family/friend/professional — Phase 2 behavior preserved),
 * otherwise we fall back to the neutral Phase 4 label.
 */
function resolveCounterpartLabel(
  entryKind: EntryKind | null,
  picked: PickedRelationship | null,
): CounterpartLabel {
  if (entryKind === 'person') return pickedToCounterpart(picked);
  // After the early return above, entryKind is narrowed to the non-person
  // union (group | situation | self | unnamed_field) or null.
  if (entryKind) return entryKind as CounterpartLabel;
  return 'unspecified';
}

/** Human phrase for the mirrored sentence on the Summary screen. */
function counterpartPhrase(
  entryKind: EntryKind | null,
  picked: PickedRelationship | null,
): string {
  if (entryKind === 'person') {
    return picked?.name ? `with ${picked.name}` : 'with someone important';
  }
  switch (entryKind) {
    case 'group':         return 'in a group';
    case 'situation':     return 'in this situation';
    case 'self':          return 'within you';
    case 'unnamed_field': return 'in this field';
    default:              return 'in the field';
  }
}

// ─────────────────────────────────────────────────────
// [Phase 4] Movement cue step (between Tone and Signals)
// ─────────────────────────────────────────────────────

const MOVEMENT_OPTIONS: { key: MovementCue; label: string; hint: string }[] = [
  { key: 'moving_toward',       label: 'Moving toward',       hint: 'You are reaching across the field.' },
  { key: 'pulling_away',        label: 'Pulling away',        hint: 'You are taking space, or something is.' },
  { key: 'trying_to_fix',       label: 'Trying to fix',       hint: 'The shape is asking to be solved.' },
  { key: 'feeling_blamed',      label: 'Feeling blamed',      hint: 'Something is being placed on you.' },
  { key: 'repeating_something', label: 'Repeating something', hint: 'This is familiar. It has come back.' },
  { key: 'not_sure',            label: 'Not sure',            hint: 'You do not need to name it yet.' },
];

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

  // [Phase 4] step union extended: Movement inserted at position 2.
  //   0=Who  1=Tone  2=Movement  3=Signals  4=Unresolved  5=Summary
  const [step, setStep] = useState<0 | 1 | 2 | 3 | 4 | 5>(0);
  const [entryKind, setEntryKind] = useState<EntryKind | null>(null);
  const [picked, setPicked] = useState<PickedRelationship | null>(null);
  const [tone, setTone] = useState<Tone | null>(null);
  const [movement, setMovement] = useState<MovementCue | null>(null);
  const [signals, setSignals] = useState<string[]>([]);
  const [unresolved, setUnresolved] = useState('');
  const [savedEntryId, setSavedEntryId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // [Phase 4] Continuity hint state — count of prior signals matching
  // (tone + counterpart), excluding the row just written by onSave.
  // We fetch this pre-save (from the Summary step) so the hint can
  // render without depending on save having succeeded.
  const [priorMatches, setPriorMatches] = useState<number>(0);
  // [Phase 4] Ideas handoff state — small, local to this tool.
  const [ideaSaving, setIdeaSaving] = useState(false);
  const [ideaErr, setIdeaErr] = useState<string | null>(null);

  const sources = useMemo(() => getSourcesForLabtool('relational-field'), []);

  useEffect(() => {
    triggerHapticPulse('soft');
  }, [step]);

  // [Phase 4] Continuity fetch — on arrival at Summary, count prior
  // signals that match (tone + counterpart). Fire-and-forget; if the
  // call fails, priorMatches stays at 0 and the hint simply does not
  // render. Count is best-effort, not load-bearing.
  useEffect(() => {
    if (step !== 5 || !tone) return;
    let cancelled = false;

    (async () => {
      try {
        const counterpart = resolveCounterpartLabel(entryKind, picked);
        const params = new URLSearchParams({ tone });
        if (counterpart && counterpart !== 'unspecified') {
          params.set('counterpart', counterpart);
        }
        const res = await apiFetch(`/api/maia/relational-signal/count?${params.toString()}`);
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        if (typeof data?.count === 'number') {
          setPriorMatches(data.count);
        }
      } catch {
        // silent — hint just won't render
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [step, tone, entryKind, picked]);

  // [Phase 4] Ephemeral / non-person signal emission — the Phase 2
  // onSave path only fires when picked?.id exists (persistent save).
  // For non-person flows, we still want the /maia field card + the
  // founder surface to reflect the moment, so we emit a labtool_manual
  // signal once when the member reaches Summary. Fire-and-forget.
  // Person paths skip this — they emit their signal via onSave when
  // the member explicitly chooses to save.
  useEffect(() => {
    if (step !== 5 || !tone) return;
    if (entryKind === 'person') return; // person path handled by onSave
    if (!entryKind) return;

    // Compute rupture locally to avoid a forward reference to the
    // hasRuptureSignal const that is declared lower in the component.
    const rupture =
      signals.includes('tension') ||
      signals.includes('grief') ||
      signals.includes('resentment') ||
      tone === 'unresolved' ||
      tone === 'tense';

    void apiFetch('/api/maia/relational-signal', {
      method: 'POST',
      body: JSON.stringify({
        relationshipId: null,
        counterpartLabel: resolveCounterpartLabel(entryKind, picked),
        tone,
        movementCue: movement,
        ruptureState: rupture ? 'strained' : 'none',
        dynamicTags: [],
        frameworksApplied: LABTOOL_SOURCE_MAP['relational-field'] ?? [],
      }),
    }).catch(() => {});
    // Eslint-disable: we intentionally only depend on step reaching 5 so
    // this fires exactly once per Summary arrival. Re-running it on every
    // movement/signals/unresolved change would spam the endpoint.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const toggleSignal = (sig: string) => {
    setSignals((prev) => {
      if (prev.includes(sig)) return prev.filter((s) => s !== sig);
      if (prev.length >= MAX_SIGNALS) return prev;
      return [...prev, sig];
    });
  };

  // [Phase 4] Entry gate:
  //   - person → must have a picked name (existing behavior)
  //   - non-person entry → advance as soon as an entryKind is chosen
  const canAdvanceFromEntry =
    entryKind !== null && (entryKind !== 'person' || !!picked?.name?.trim());
  const canAdvanceFromTone = !!tone;
  // [Phase 4] Movement is optional — null is an acceptable advance.
  const canAdvanceFromMovement = true;
  const canAdvanceFromSignals = signals.length > 0;

  const summary = useMemo(() => {
    if (!tone) return '';
    // [Phase 4] Summary now renders for any entryKind — not just picked.
    // Person path keeps the existing "Field with <name>: <tone>" phrasing
    // so downstream consumers and the saved entry body are unchanged.
    const lines: string[] = [];
    if (entryKind === 'person') {
      if (!picked) return '';
      lines.push(`Field with ${picked.name}: ${tone}`);
    } else {
      const where = counterpartPhrase(entryKind, picked).replace(/^in (a |this |the )?/, '');
      lines.push(`Field ${where ? 'in ' + where : ''}: ${tone}`.trim());
    }
    if (movement) lines.push(`Movement: ${movement.replace(/_/g, ' ')}`);
    if (signals.length > 0) lines.push(`Alive: ${signals.join(', ')}`);
    if (unresolved.trim()) lines.push(`Unresolved: ${unresolved.trim()}`);
    return lines.join('\n');
  }, [entryKind, picked, tone, movement, signals, unresolved]);

  const onReset = () => {
    setStep(0);
    setEntryKind(null);
    setPicked(null);
    setTone(null);
    setMovement(null);
    setSignals([]);
    setUnresolved('');
    setSavedEntryId(null);
    setPriorMatches(0);
    setIdeaErr(null);
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
        // [Phase 4] movementCue is optional — null is an acceptable value.
        fetch('/api/maia/relational-signal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            relationshipId: picked.id,
            counterpartLabel: resolveCounterpartLabel(entryKind, picked),
            tone,
            movementCue: movement,
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
  // [Phase 4] Pathway handlers
  //
  // These are ADDITIONAL affordances on the Summary screen, not
  // replacements for the existing Save + ToolBridge routing.
  // ─────────────────────────────────────────────────

  /**
   * Bring to MAIA — seed a bounded prompt and navigate to /maia.
   * The prompt carries counterpart + tone + movement but NEVER the
   * full signals/unresolved content — those remain private to the
   * labtool surface and the relationship entry (when saved).
   */
  const onBringToMaia = () => {
    if (!entryKind || !tone) return;
    const toneWord = tone.replace(/_/g, ' ');
    const where = counterpartPhrase(entryKind, picked);
    const moveWord = movement && movement !== 'not_sure'
      ? movement.replace(/_/g, ' ')
      : null;

    const parts: string[] = [];
    parts.push(`I'm noticing a ${toneWord} field ${where}.`);
    if (moveWord) {
      parts.push(`It feels like ${moveWord}.`);
    }
    parts.push(`Help me stay with this honestly. I'm not looking for advice — just clearer contact.`);

    seedFromSource('relationships:thread', parts.join('\n\n'), {
      returnTo: '/labtools/relational-field',
      tone: 'exploratory',
    });
    router.push('/maia');
  };

  /**
   * Work with it — bridge to Dynamics Map with the current (tone,
   * movement) pair as query params. The Dynamics Map page reads
   * these for its seed banner. Relationship id is passed through
   * if present so the Dynamics Map stays anchored to the same
   * persistent record.
   */
  const onWorkWithIt = () => {
    const params = new URLSearchParams();
    if (picked?.id) params.set('relationshipId', picked.id);
    if (tone) params.set('tone', tone);
    if (movement) params.set('movement', movement);
    router.push(`/labtools/dynamics-map?${params.toString()}`);
  };

  /**
   * Hold in an Idea — create a member_idea, seed an initial note
   * block from the relational snapshot, touch last_entered_at, and
   * navigate into the idea workspace.
   *
   * Uses the new Ideas v1 two-step API (NOT /api/ideas/capture).
   * Metadata rides on the BLOCK, never on the idea row. The Ideas
   * page infers nothing from block metadata — it's provenance, not
   * substrate.
   */
  const onHoldInIdea = async () => {
    if (ideaSaving || !tone) return;
    setIdeaErr(null);
    setIdeaSaving(true);
    try {
      // 1. Create the idea
      const toneWord = tone.replace(/_/g, ' ');
      const where = counterpartPhrase(entryKind, picked).replace(/^(in|with) /, '');
      const title = `Working with ${toneWord} in ${where || 'this field'}`;
      const framing =
        'A recurring relational field I want to understand, work with, and track over time.';

      const createRes = await apiFetch('/api/ideas', {
        method: 'POST',
        body: JSON.stringify({ title, framing }),
      });
      if (!createRes.ok) {
        throw new Error('Could not create idea');
      }
      const createData = await createRes.json();
      const ideaId = createData?.idea?.id;
      if (!ideaId) {
        throw new Error('Idea created without id');
      }

      // 2. Seed first note block from the snapshot + optional unresolved
      const noteLines: string[] = [];
      noteLines.push(summary || `${toneWord} ${where}`);
      if (unresolved.trim() && !summary.includes(unresolved.trim())) {
        noteLines.push(unresolved.trim());
      }
      const content = noteLines.join('\n\n');

      await apiFetch(`/api/ideas/${ideaId}/blocks`, {
        method: 'POST',
        body: JSON.stringify({
          block_type: 'note',
          content,
          metadata: {
            source: 'relational_field_labtool',
            counterpart_label: resolveCounterpartLabel(entryKind, picked),
            relationship_id: picked?.id ?? null,
            tone,
            movement_cue: movement,
            signals,
          },
        }),
      });

      // 3. Touch last_entered_at (idempotent, fire-and-forget is fine)
      void apiFetch(`/api/ideas/${ideaId}/touch`, { method: 'POST' }).catch(() => {});

      // 4. Navigate immediately — no confirmation screen
      router.push(`/maia/ideas/${ideaId}`);
    } catch (e) {
      setIdeaErr(e instanceof Error ? e.message : 'Could not hold in an idea');
      setIdeaSaving(false);
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

          {step !== 0 && step !== 5 ? (
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

        {/* ── Step indicator (6 dots — Phase 4) ── */}
        <div className="mt-5 mb-6 flex gap-2">
          {[0, 1, 2, 3, 4, 5].map((i) => (
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
            {/* ══════════ 0: WHO — entry counterpart branch + picker ══════════ */}
            {step === 0 && (
              <motion.div
                key="who"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-6"
              >
                {/* [Phase 4] Counterpart branch — shown ABOVE the picker.
                    When a non-person kind is chosen, the picker is hidden
                    and the flow advances with the neutral label only. */}
                <div>
                  <div className="text-sm font-medium">
                    What are you in relation to right now?
                  </div>
                  <div className="mt-1 text-xs text-white/45">
                    Any relational atmosphere counts. It does not have to be a person.
                  </div>
                </div>

                <div className="grid gap-2 md:grid-cols-2">
                  {ENTRY_OPTIONS.map((opt) => {
                    const active = entryKind === opt.key;
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => {
                          setEntryKind(opt.key);
                          // Clear any picker selection when switching to a non-person kind
                          if (opt.key !== 'person') setPicked(null);
                        }}
                        className={`
                          flex items-start gap-3 rounded-xl border px-4 py-3 text-left transition
                          ${active
                            ? 'border-[#D4B896]/40 bg-[#D4B896]/10'
                            : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'
                          }
                        `}
                      >
                        <Icon
                          className={`mt-0.5 h-4 w-4 flex-shrink-0 ${
                            active ? 'text-[#D4B896]/85' : 'text-white/40'
                          }`}
                        />
                        <div>
                          <div className="text-sm font-medium text-white/85">{opt.label}</div>
                          <div className="mt-0.5 text-xs text-white/45">{opt.hint}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Person path — show the existing picker unchanged */}
                {entryKind === 'person' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4">
                      <RelationshipPicker
                        value={picked}
                        onChange={setPicked}
                        initialId={initialId}
                        label="Who is the field between?"
                        hint="Pick someone from your field, or just type a name. Both work."
                      />
                    </div>
                  </motion.div>
                )}

                <div className="flex justify-end">
                  <button
                    type="button"
                    disabled={!canAdvanceFromEntry}
                    onClick={() => setStep(1)}
                    className={`
                      inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs transition
                      ${canAdvanceFromEntry
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

            {/* ══════════ 2: MOVEMENT (Phase 4 — optional) ══════════ */}
            {step === 2 && (
              <motion.div
                key="movement"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-6"
              >
                <div>
                  <div className="text-sm font-medium">What feels most active?</div>
                  <div className="mt-1 text-xs text-white/45">
                    The movement in the field, not the content. Optional — you can skip.
                  </div>
                </div>

                <div className="space-y-2">
                  {MOVEMENT_OPTIONS.map((m) => {
                    const active = movement === m.key;
                    return (
                      <button
                        key={m.key}
                        type="button"
                        onClick={() => setMovement(active ? null : m.key)}
                        className={`
                          w-full rounded-xl border px-4 py-3 text-left transition
                          ${active
                            ? 'border-[#D4B896]/40 bg-[#D4B896]/10'
                            : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'
                          }
                        `}
                      >
                        <div className="text-sm font-medium text-white/85">{m.label}</div>
                        <div className="mt-0.5 text-xs text-white/45">{m.hint}</div>
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
                    {movement ? 'Next' : 'Skip'}
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ══════════ 3: SIGNALS ══════════ */}
            {step === 3 && (
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
                    onClick={() => setStep(2)}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70 hover:bg-white/10 transition"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={!canAdvanceFromSignals}
                    onClick={() => setStep(4)}
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

            {/* ══════════ 4: UNRESOLVED (optional) ══════════ */}
            {step === 4 && (
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
                    onClick={() => setStep(3)}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70 hover:bg-white/10 transition"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStep(5);
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

            {/* ══════════ 5: SUMMARY ══════════ */}
            {step === 5 && tone && (
              <motion.div
                key="summary"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-5"
              >
                <div className="rounded-2xl border border-white/10 bg-black/20 p-5 space-y-4">
                  {/* [Phase 4] Header adapts to entryKind — person shows name,
                      non-person shows a neutral "Field" label with the entry
                      kind's description. */}
                  {entryKind === 'person' && picked ? (
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-white/30">
                        Field with
                      </div>
                      <div className="mt-0.5 text-lg font-medium text-white/90">
                        {picked.name}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-white/30">
                        Field
                      </div>
                      <div className="mt-0.5 text-lg font-medium text-white/90 capitalize">
                        {entryKind === 'self'
                          ? 'Within you'
                          : entryKind === 'group'
                            ? 'In a group'
                            : entryKind === 'situation'
                              ? 'In a situation'
                              : 'Unnamed'}
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-white/30">
                      Tone
                    </div>
                    <div className="mt-0.5 text-sm text-[#D4B896]/80 capitalize">
                      {tone.replace(/_/g, ' ')}
                    </div>
                  </div>

                  {/* [Phase 4] Movement — shows only when member picked one */}
                  {movement && (
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-white/30">
                        Movement
                      </div>
                      <div className="mt-0.5 text-sm text-[#D4B896]/80 capitalize">
                        {movement.replace(/_/g, ' ')}
                      </div>
                    </div>
                  )}

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

                {/* Save / Skip
                    [Phase 4] Save path is person-only and requires a picked
                    relationship record (picked.id). Non-person flows and
                    ephemeral typed-name flows fall through to the neutral
                    "not stored" reassurance, preserving Phase 2 behavior. */}
                <div className="flex flex-wrap items-center gap-2">
                  {entryKind === 'person' && picked?.id && !savedEntryId && (
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
                  {entryKind === 'person' && !picked?.id && (
                    <div className="text-[11px] text-white/35 italic">
                      Nothing is being stored — you typed a name instead of picking one from your field.
                    </div>
                  )}
                  {entryKind !== 'person' && entryKind !== null && (
                    <div className="text-[11px] text-white/35 italic">
                      Nothing is being stored — this is a field reading, not a record.
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

                {/* Bridges — Phase 2 behavior preserved.
                    Uses picked?.id (safe null access) now that non-person
                    flows can reach Summary. Routing logic is unchanged:
                    rupture → repair-path, otherwise → dynamics-map. */}
                {hasRuptureSignal ? (
                  <ToolBridge
                    href={
                      picked?.id
                        ? `/labtools/repair-path?relationshipId=${picked.id}`
                        : '/labtools/repair-path'
                    }
                    text="If something feels broken, there are possible moves to consider."
                    className="mt-3"
                  />
                ) : (
                  <ToolBridge
                    href={
                      picked?.id
                        ? `/labtools/dynamics-map?relationshipId=${picked.id}`
                        : '/labtools/dynamics-map'
                    }
                    text="If the same thing keeps showing up, you can map the pattern."
                    className="mt-3"
                  />
                )}

                {/* [Phase 4] Continuity hint — quiet, only surfaces if
                    prior_matches >= 1 for this (tone + counterpart) pair.
                    Excluded from the count is the signal this session
                    just emitted (onSave + non-person effect) via the
                    service-layer excludeSignalId parameter. */}
                {priorMatches >= 1 && (
                  <p className="mt-4 text-[11px] text-white/40 italic">
                    This has surfaced before.
                  </p>
                )}

                {/* [Phase 4] Pathways — additional affordances, NOT
                    replacements for Save or ToolBridge above. Placed
                    visually below the existing controls and styled
                    quietly so they do not overpower the primary path. */}
                <div className="mt-6 pt-5 border-t border-white/[0.06]">
                  <div className="mb-2 text-[10px] uppercase tracking-wider text-white/30">
                    What next?
                  </div>
                  <div className="grid gap-2 md:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => { /* Stay — passive no-op, member already read the summary */ }}
                      className="flex items-start gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-left hover:bg-white/[0.04] transition cursor-default"
                    >
                      <Pause className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-white/40" />
                      <div>
                        <div className="text-xs font-medium text-white/70">Stay with it</div>
                        <div className="mt-0.5 text-[10px] text-white/35">No next step. This is enough.</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={onWorkWithIt}
                      className="flex items-start gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-left hover:bg-white/[0.04] transition"
                    >
                      <Wind className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-white/40" />
                      <div>
                        <div className="text-xs font-medium text-white/70">Work with it</div>
                        <div className="mt-0.5 text-[10px] text-white/35">Carry this into Dynamics Map.</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={onBringToMaia}
                      className="flex items-start gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-left hover:bg-white/[0.04] transition"
                    >
                      <MessageCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-white/40" />
                      <div>
                        <div className="text-xs font-medium text-white/70">Bring to MAIA</div>
                        <div className="mt-0.5 text-[10px] text-white/35">Talk it through in the field.</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={onHoldInIdea}
                      disabled={ideaSaving}
                      className="flex items-start gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-left hover:bg-white/[0.04] transition disabled:opacity-40"
                    >
                      <Lightbulb className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-white/40" />
                      <div>
                        <div className="text-xs font-medium text-white/70">
                          {ideaSaving ? 'Holding…' : 'Hold in an Idea'}
                        </div>
                        <div className="mt-0.5 text-[10px] text-white/35">Keep the thread across time.</div>
                      </div>
                    </button>
                  </div>
                  {ideaErr && (
                    <p className="mt-2 text-[10px] text-red-400/70">{ideaErr}</p>
                  )}
                </div>
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
