'use client';

/**
 * RelationshipFieldCard — A quiet side-channel on /maia.
 *
 * Shows the most recent relational signal (auto-detected from conversation or
 * surfaced by a labtool save). Deliberately small, deliberately soft. It is
 * a reflection surface, not a dashboard.
 *
 * SOVEREIGNTY RULES (enforced by this component's copy):
 *   - framed as "possible", never as verdict
 *   - labels for counterparts are generic ("a partner", "a friend")
 *   - never outputs a name, even when relationshipId is present
 *   - "Drawn from" lineage is quiet, never a citation
 *   - never surfaces when there is no signal (the absence is honest)
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, BookOpen, Waves, Wind } from 'lucide-react';
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

// ─────────────────────────────────────────────────────────────────────────────
// DISPLAY HELPERS — all copy is descriptive, never diagnostic
// ─────────────────────────────────────────────────────────────────────────────

const TONE_COLORS: Record<RelationshipTone, string> = {
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
};

/**
 * Turn a counterpart label into a non-identifying phrase. We intentionally
 * keep it generic: "with a partner", not "with your partner", not "with J".
 */
function counterpartPhrase(label: CounterpartLabel | null | undefined): string {
  switch (label) {
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
    default:             return 'in a relational field';
  }
}

/**
 * Confidence shading — tonal weighting, not numeric disclosure.
 *
 * Low (0.40–0.55)   → "Something may be active…"      (softest)
 * Medium (0.55–0.70) → "There may be something active…" (slightly more present)
 * High (≥ 0.70)      → "Something seems active…"       (most grounded)
 *
 * `labtool_manual` signals typically have null confidence — the member
 * explicitly offered them, so we treat them as high-confidence phrasing.
 * This prevents weak auto-detections from feeling assertive and prevents
 * strong signals from feeling vague.
 */
function leadPhraseFor(
  confidence: number | null | undefined,
  source: RelationshipSignal['source'],
): string {
  // Explicit labtool saves are "offered", not "guessed" → high phrasing.
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
    case 'none':     return 'nothing broken right now';
    case 'unclear':  return 'unclear whether something is broken';
    default:         return null;
  }
}

/** Look up the human name for a dynamic tag id. */
function dynamicLabel(id: string): string {
  return RELATIONSHIP_PATTERNS.find((p) => p.id === id)?.name ?? id;
}

/** Look up the human name for a framework id. */
function frameworkLabel(id: string): string {
  return RELATIONSHIP_SOURCES.find((s) => s.id === id)?.tradition ?? id;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export function RelationshipFieldCard() {
  const router = useRouter();
  const [signal, setSignal] = useState<RelationshipSignal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/maia/relational-signal');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled && data.success) {
          setSignal(data.signal);
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

  // Nothing to show — and that is the correct thing to render.
  if (loading || !signal) return null;

  const tone = signal.tone;
  const toneColor = tone ? TONE_COLORS[tone] : 'bg-white/15';
  const counterpart = counterpartPhrase(signal.counterpartLabel);
  const rupture = rupturePhrase(signal.ruptureState);
  const dynamics = (signal.dynamicTags ?? []).slice(0, 2);
  const frameworks = (signal.frameworksApplied ?? []).slice(0, 3);
  const leadPhrase = leadPhraseFor(signal.confidence, signal.source);

  const sourceHint =
    signal.source === 'labtool_manual'
      ? 'From your last labtool session'
      : 'Surfaced from your recent conversation';

  return (
    <AnimatePresence>
      <motion.div
        key="field-card"
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-xl border border-rose-500/15 bg-gradient-to-b from-rose-500/[0.04] to-transparent p-3.5"
      >
        {/* ── Header ── */}
        <div className="mb-2.5 flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${toneColor}`} />
          <p className="text-[11px] uppercase tracking-wider text-rose-300/60">
            Relational Field
          </p>
        </div>

        {/* ── One quiet sentence about what is possibly active ── */}
        <p className="text-xs leading-relaxed text-white/75">
          {leadPhrase}{' '}
          <span className="text-rose-200/85">{counterpart}</span>
          {tone && (
            <>
              {' '}— a <span className="text-rose-200/85">{tone}</span> tone
            </>
          )}
          {rupture && (
            <>
              , {rupture}
            </>
          )}
          .
        </p>

        {/* ── Dynamic tags (descriptive chips, never identity) ── */}
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

        {/* ── Tool bridges — quiet, not a call to action ── */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          <button
            onClick={() => router.push('/labtools/relational-field')}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-1 text-[10px] text-white/55 hover:bg-white/[0.05] hover:text-white/75 transition-colors"
          >
            <Waves className="h-3 w-3" />
            Sense
          </button>
          <button
            onClick={() => router.push('/labtools/dynamics-map')}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-1 text-[10px] text-white/55 hover:bg-white/[0.05] hover:text-white/75 transition-colors"
          >
            <Activity className="h-3 w-3" />
            Map
          </button>
          <button
            onClick={() => router.push('/labtools/repair-path')}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-1 text-[10px] text-white/55 hover:bg-white/[0.05] hover:text-white/75 transition-colors"
          >
            <Wind className="h-3 w-3" />
            Repair
          </button>
        </div>

        {/* ── "Drawn from" — the quiet authority signal ── */}
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

        {/* ── Source hint ── */}
        <p className="mt-2 text-[9px] italic text-white/20">{sourceHint}</p>
      </motion.div>
    </AnimatePresence>
  );
}
