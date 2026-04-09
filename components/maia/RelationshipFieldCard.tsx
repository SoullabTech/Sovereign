'use client';

// [Relational Layer — Phase 2 + Phase 4]
/**
 * RelationshipFieldCard — A quiet side-channel on /maia.
 *
 * Shows the most recent relational signal (auto-detected from conversation
 * or surfaced by a labtool save). Deliberately small, deliberately soft.
 * It is a reflection surface, not a dashboard.
 *
 * SOVEREIGNTY RULES (enforced by this component's copy):
 *   - framed as "possible", never as verdict
 *   - labels for counterparts are generic ("a partner", "a friend")
 *   - never outputs a name, even when relationshipId is present
 *   - "Drawn from" lineage is quiet, never a citation
 *   - never surfaces when there is no signal (the absence is honest)
 *
 * PHASE 4 ADDITIONS:
 *   - neutral counterpart phrases (person/group/situation/self/unnamed_field)
 *   - 4-button pathway footer: Stay / Work / Bring to MAIA / Hold in an Idea
 *   - continuity hint: "This has surfaced before." at priorMatches ≥ 1
 *     (the count is computed server-side by /api/maia/relational-signal?includeCount=1
 *     and EXCLUDES the current row, so it only lights up on real recurrence)
 *   - Ideas integration uses the new two-step API (no /capture compat path)
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, BookOpen, Lightbulb, MessageCircle, Pause, Waves,
} from 'lucide-react';
import type {
  CounterpartLabel,
  RelationshipSignal,
  RelationshipTone,
  RuptureState,
} from '@/lib/relationships/types';
import {
  RELATIONSHIP_PATTERNS,
  RELATIONSHIP_SOURCES,
} from '@/lib/relationships/relationshipResources';
import { seedFromSource } from '@/lib/maia/seedPrompt';
import { apiFetch } from '@/lib/http/apiBase';

// ─────────────────────────────────────────────────────────────────────────────
// DISPLAY HELPERS — all copy is descriptive, never diagnostic
// ─────────────────────────────────────────────────────────────────────────────

const TONE_COLORS: Record<RelationshipTone, string> = {
  // Phase 2 detector set
  open: 'bg-jade-jade/55',
  warm: 'bg-amber-400/55',
  active: 'bg-jade-malachite/55',
  quiet: 'bg-jade-sage/45',
  fragile: 'bg-amber-300/45',
  distant: 'bg-jade-mineral/45',
  contracted: 'bg-jade-forest/65',
  tense: 'bg-red-400/45',
  unresolved: 'bg-jade-copper/50',
  unclear: 'bg-white/20',
  // Phase 4 entry-flow additions
  tender: 'bg-amber-200/45',
  strained: 'bg-orange-400/45',
  conflicted: 'bg-orange-500/45',
  heavy: 'bg-stone-500/55',
  shut_down: 'bg-stone-600/55',
};

/**
 * Turn a counterpart label into a non-identifying phrase. Always generic:
 * "with a partner", not "with your partner", never "with J".
 *
 * Phase 4 additions cover the neutral entry-flow labels so the card can
 * echo any kind of field, not just named people.
 */
function counterpartPhrase(label: CounterpartLabel | null | undefined): string {
  switch (label) {
    // Phase 2 person-type labels
    case 'partner':      return 'with a partner';
    case 'mother':       return 'with a mother figure';
    case 'father':       return 'with a father figure';
    case 'child':        return 'with a child';
    case 'sibling':      return 'with a sibling';
    case 'family':       return 'in a family bond';
    case 'friend':       return 'with a friend';
    case 'professional': return 'in a professional bond';
    case 'ex':           return 'with a past partner';
    case 'inner':        return 'with an inner figure';
    // Phase 4 neutral entry labels
    case 'person':        return 'with someone important';
    case 'group':         return 'in a group';
    case 'situation':     return 'in a situation';
    case 'self':          return 'within you';
    case 'unnamed_field': return 'in the field';
    default:              return 'in a relational field';
  }
}

/**
 * Confidence shading — tonal weighting, not numeric disclosure.
 *
 * Low (0.40–0.55)    → "Something may be active…"
 * Medium (0.55–0.70) → "There may be something active…"
 * High (≥ 0.70)      → "Something seems active…"
 *
 * labtool_manual signals typically have null confidence — the member
 * explicitly offered them, so we treat them as high-confidence phrasing.
 */
function leadPhraseFor(
  confidence: number | null | undefined,
  source: RelationshipSignal['source'],
): string {
  if (source === 'labtool_manual' || confidence == null) {
    return 'Something seems active';
  }
  if (confidence >= 0.7) return 'Something seems active';
  if (confidence >= 0.55) return 'There may be something active';
  return 'Something may be active';
}

/** Quiet phrasing for rupture state — never "you are ruptured". */
function rupturePhrase(state: RuptureState | null | undefined): string | null {
  switch (state) {
    case 'ruptured': return 'something broken here';
    case 'strained': return 'something strained here';
    default:         return null;
  }
}

function dynamicLabel(id: string): string {
  return RELATIONSHIP_PATTERNS.find((p) => p.id === id)?.name ?? id;
}

function frameworkLabel(id: string): string {
  return RELATIONSHIP_SOURCES.find((s) => s.id === id)?.tradition ?? id;
}

/**
 * Build the seeded prompt for "Bring to MAIA". Minimal — counterpart
 * phrase + tone + optional rupture. No history, no framework language.
 */
function buildAskMaiaPrompt(signal: RelationshipSignal): string {
  const counterpart = counterpartPhrase(signal.counterpartLabel);
  const toneWord = signal.tone ? signal.tone.replace(/_/g, ' ') : 'something';
  const rupture =
    signal.ruptureState === 'ruptured'
      ? ' Something is broken.'
      : signal.ruptureState === 'strained'
        ? ' Something is strained.'
        : '';
  return `I'm in a ${toneWord} field ${counterpart}.${rupture} Help me understand what is happening and what my next honest step might be.`;
}

/** Build the auto-suggested Idea title for "Hold in an Idea". */
function buildIdeaTitle(signal: RelationshipSignal): string {
  const counterpart = counterpartPhrase(signal.counterpartLabel);
  const toneWord = signal.tone ? signal.tone.replace(/_/g, ' ') : 'something';
  return `Working with ${toneWord} ${counterpart}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

interface CardResponse {
  success: boolean;
  signal: RelationshipSignal | null;
  /** Phase 4: prior matches for (member + counterpart + tone), excluding this row */
  priorMatches?: number;
}

export function RelationshipFieldCard() {
  const router = useRouter();
  const [signal, setSignal] = useState<RelationshipSignal | null>(null);
  const [priorMatches, setPriorMatches] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [ideaSaving, setIdeaSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch('/api/maia/relational-signal?includeCount=1');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as CardResponse;
        if (!cancelled && data.success) {
          setSignal(data.signal);
          setPriorMatches(data.priorMatches ?? 0);
        }
      } catch {
        // silent — the absence is honest
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading || !signal) return null;

  const tone = signal.tone;
  const toneColor = tone ? TONE_COLORS[tone] : 'bg-white/15';
  const counterpart = counterpartPhrase(signal.counterpartLabel);
  const rupture = rupturePhrase(signal.ruptureState);
  const dynamics = (signal.dynamicTags ?? []).slice(0, 2);
  const frameworks = (signal.frameworksApplied ?? []).slice(0, 3);
  const leadPhrase = leadPhraseFor(signal.confidence, signal.source);
  const showContinuity = priorMatches >= 1;

  const sourceHint =
    signal.source === 'labtool_manual'
      ? 'From your last labtool session'
      : 'Surfaced from your recent conversation';

  // ── Pathway handlers ──

  const onStay = () => {
    router.push('/labtools/relational-field');
  };

  const onWork = () => {
    const params = new URLSearchParams();
    if (signal.relationshipId) params.set('relationshipId', signal.relationshipId);
    if (signal.tone) params.set('tone', signal.tone);
    if (signal.movementCue) params.set('movement', signal.movementCue);
    if (signal.counterpartLabel) params.set('counterpart', signal.counterpartLabel);
    router.push(`/labtools/dynamics-map?${params.toString()}`);
  };

  const onAskMaia = () => {
    const prompt = buildAskMaiaPrompt(signal);
    seedFromSource('relationships:thread', prompt, {
      returnTo: '/maia',
    });
    router.push('/maia');
    router.refresh();
  };

  /**
   * onHoldInIdea — Ideas v1 integration.
   * Same contract as the labtool: create → block → touch → route.
   */
  const onHoldInIdea = async () => {
    if (ideaSaving) return;
    setIdeaSaving(true);
    try {
      // 1. Create idea
      const createRes = await apiFetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: buildIdeaTitle(signal),
          framing: 'A recurring relational field I want to understand, work with, and track over time.',
        }),
      });
      const createData = await createRes.json();
      if (!createRes.ok || !createData.idea?.id) {
        throw new Error(createData?.error || 'Could not create idea');
      }
      const ideaId: string = createData.idea.id;

      // 2. Add first block — the card's lead sentence as content
      const content = `${leadPhrase} ${counterpart}${tone ? ` — a ${tone.replace(/_/g, ' ')} tone` : ''}${rupture ? `, ${rupture}` : ''}.`;
      await apiFetch(`/api/ideas/${ideaId}/blocks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          block_type: 'note',
          content,
          metadata: {
            source: 'relational_field_card',
            counterpart_label: signal.counterpartLabel ?? null,
            tone: signal.tone ?? null,
            movement_cue: signal.movementCue ?? null,
            signal_id: signal.id ?? null,
          },
        }),
      });

      // 3. Touch
      void apiFetch(`/api/ideas/${ideaId}/touch`, { method: 'POST' }).catch(() => {});

      // 4. Route immediately — no confirmation
      router.push(`/maia/ideas/${ideaId}`);
    } catch {
      setIdeaSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        key="field-card"
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-xl border border-rose-500/15 bg-gradient-to-b from-rose-500/[0.04] to-transparent p-3.5"
      >
        {/* Header */}
        <div className="mb-2.5 flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${toneColor}`} />
          <p className="text-[11px] uppercase tracking-wider text-rose-300/60">
            Relational Field
          </p>
        </div>

        {/* One quiet sentence about what is possibly active */}
        <p className="text-xs leading-relaxed text-white/75">
          {leadPhrase}{' '}
          <span className="text-rose-200/85">{counterpart}</span>
          {tone && (
            <>
              {' '}— a <span className="text-rose-200/85">{tone.replace(/_/g, ' ')}</span> tone
            </>
          )}
          {rupture && (
            <>
              , {rupture}
            </>
          )}
          .
        </p>

        {/* Continuity hint — only when priorMatches ≥ 1 (excludes current row) */}
        {showContinuity && (
          <p className="mt-1.5 text-[10px] italic text-rose-200/50">
            This has surfaced before.
          </p>
        )}

        {/* Dynamic tags (descriptive chips, never identity) */}
        {dynamics.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {dynamics.map((id) => (
              <span
                key={id}
                className="rounded-full border border-rose-500/15 bg-rose-500/[0.06] px-2 py-0.5 text-[10px] text-rose-200/70"
              >
                {dynamicLabel(id)}
              </span>
            ))}
          </div>
        )}

        {/* Four pathways — Stay / Work / Bring to MAIA / Hold in an Idea */}
        <div className="mt-3 grid grid-cols-2 gap-1.5">
          <button
            onClick={onStay}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-1.5 text-[11px] text-white/60 hover:bg-white/[0.05] hover:text-white/85 transition-colors"
          >
            <Pause className="h-3 w-3" />
            Stay with it
          </button>
          <button
            onClick={onWork}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-1.5 text-[11px] text-white/60 hover:bg-white/[0.05] hover:text-white/85 transition-colors"
          >
            <Activity className="h-3 w-3" />
            Work with it
          </button>
          <button
            onClick={onAskMaia}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-1.5 text-[11px] text-white/60 hover:bg-white/[0.05] hover:text-white/85 transition-colors"
          >
            <MessageCircle className="h-3 w-3" />
            Bring to MAIA
          </button>
          <button
            onClick={onHoldInIdea}
            disabled={ideaSaving}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-1.5 text-[11px] text-white/60 hover:bg-white/[0.05] hover:text-white/85 transition-colors disabled:opacity-40"
          >
            <Lightbulb className="h-3 w-3" />
            {ideaSaving ? 'Holding…' : 'Hold in an Idea'}
          </button>
        </div>

        {/* "Drawn from" — the quiet authority signal */}
        {frameworks.length > 0 && (
          <div className="mt-3 flex items-start gap-1.5 border-t border-white/[0.04] pt-2.5">
            <BookOpen className="mt-0.5 h-3 w-3 flex-shrink-0 text-white/25" />
            <div className="min-w-0">
              <p className="text-[10px] text-white/35">
                Drawn from:{' '}
                {frameworks.map((id, i) => (
                  <span key={id}>
                    {i > 0 && <span className="text-white/20"> · </span>}
                    <span className="text-white/50">{frameworkLabel(id)}</span>
                  </span>
                ))}
              </p>
            </div>
          </div>
        )}

        {/* Source hint */}
        <p className="mt-2 text-[9px] italic text-white/20">{sourceHint}</p>
      </motion.div>
    </AnimatePresence>
  );
}
