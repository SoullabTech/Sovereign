/**
 * /maia/orientation
 *
 * Spiral Orientation — member-facing read-only surface. Cut 2.
 *
 * Governed by:
 *   - docs/canon/THE_CLEARING.md
 *   - docs/canon/SPIRAL_CONTINUITY_ENGINE.md
 *
 * Design discipline (same as /maia/keep-capture):
 *   Practice first. Explanation later.
 *   The member sees what they placed. The system does not explain itself.
 *
 *   The member sees:
 *     - which life domains have material placed
 *     - what they placed (mission titles, themes) — their own words
 *     - honest acknowledgment of what is quiet / unplaced
 *
 *   The member does NOT see:
 *     - system-generated insights or summaries
 *     - inferred patterns or stage assessments
 *     - suggested questions (those are for MAIA to ask in conversation)
 *     - any explanation of how the orientation system works
 *
 * All evidence is member-placed. The system records, not interprets.
 */
'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';

// ════════════════════════════════════════════════════════════════════════════
// Types (client-side subset — suggestedQuestions intentionally absent)
// ════════════════════════════════════════════════════════════════════════════

type LifeDomain =
  | 'identity'
  | 'body'
  | 'relationship'
  | 'work'
  | 'creativity'
  | 'spirituality';

interface EvidenceItem {
  source: string;
  source_id: string;
  member_excerpt?: string;
  placed_at: string;
  meta?: Record<string, unknown>;
}

interface ThemeObservation {
  label: string;
  appearances: Array<{ source: string; source_id: string; member_excerpt?: string }>;
}

interface UncertaintyItem {
  kind: string;
  description: string;
}

interface DomainSlice {
  domain: LifeDomain;
  evidence: EvidenceItem[];
  themeObservations: ThemeObservation[];
  uncertainty: UncertaintyItem[];
}

// ════════════════════════════════════════════════════════════════════════════
// Domain display helpers
// ════════════════════════════════════════════════════════════════════════════

const DOMAIN_LABELS: Record<LifeDomain, string> = {
  identity:     'Identity',
  body:         'Body',
  relationship: 'Relationship',
  work:         'Work',
  creativity:   'Creativity',
  spirituality: 'Spirituality',
};

// ════════════════════════════════════════════════════════════════════════════
// Page
// ════════════════════════════════════════════════════════════════════════════

export default function OrientationPage() {
  const [domains, setDomains] = useState<DomainSlice[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const r = await apiFetch('/api/psyche/orientation');
        if (!r.ok) {
          setError('Could not load right now.');
          return;
        }
        const data = await r.json();
        setDomains(data.domains);
      } catch {
        setError('Could not load right now.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const activeDomains = domains?.filter((d) => d.evidence.length > 0) ?? [];
  const quietDomains  = domains?.filter((d) => d.evidence.length === 0) ?? [];

  return (
    <main className="min-h-screen bg-stone-50">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <header className="mb-12">
          <h1 className="text-2xl font-light text-stone-800">
            Where you&apos;ve placed things.
          </h1>
          <p className="text-stone-500 mt-2">
            This is what the system sees — only what you&apos;ve explicitly placed.
          </p>
        </header>

        {loading && <p className="text-stone-400 text-sm">…</p>}

        {error && !loading && (
          <p className="text-stone-500 text-sm">{error}</p>
        )}

        {!loading && !error && domains && (
          <>
            {/* Active domains — have evidence */}
            {activeDomains.length > 0 && (
              <section className="mb-12 space-y-6">
                {activeDomains.map((d) => (
                  <DomainCard key={d.domain} slice={d} />
                ))}
              </section>
            )}

            {/* Quiet domains — no evidence */}
            {quietDomains.length > 0 && (
              <section>
                <h2 className="text-xs uppercase tracking-widest text-stone-400 mb-4">
                  Quiet
                </h2>
                <div className="flex flex-wrap gap-2">
                  {quietDomains.map((d) => (
                    <span
                      key={d.domain}
                      className="text-sm text-stone-400 bg-stone-100 rounded px-3 py-1"
                    >
                      {DOMAIN_LABELS[d.domain]}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-stone-400 mt-3">
                  Quiet means nothing has been placed here yet — not that nothing
                  is happening.
                </p>
              </section>
            )}

            {/* All domains quiet — graceful empty state */}
            {activeDomains.length === 0 && quietDomains.length > 0 && (
              <p className="text-stone-500 mt-8">
                Nothing has been placed across domains yet. As you work with MAIA
                — keeping material, naming missions — the picture will build.
              </p>
            )}
          </>
        )}
      </div>
    </main>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Domain card
// ════════════════════════════════════════════════════════════════════════════

function DomainCard({ slice }: { slice: DomainSlice }) {
  return (
    <div className="bg-white rounded-lg p-5 border border-stone-200">
      <h2 className="text-xs uppercase tracking-widest text-stone-400 mb-3">
        {DOMAIN_LABELS[slice.domain]}
      </h2>

      {/* Evidence — member's own words */}
      {slice.evidence.length > 0 && (
        <ul className="space-y-2 mb-4">
          {slice.evidence.map((e) => (
            <li key={e.source_id} className="text-stone-800 text-sm leading-snug">
              {e.member_excerpt ?? '—'}
            </li>
          ))}
        </ul>
      )}

      {/* Named themes */}
      {slice.themeObservations.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-stone-400 mb-1">Named threads</p>
          <div className="flex flex-wrap gap-2">
            {slice.themeObservations.map((t) => (
              <span
                key={t.label}
                className="text-xs text-stone-600 bg-stone-100 rounded px-2 py-1"
              >
                {t.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Uncertainty — honest gaps */}
      {slice.uncertainty.length > 0 && (
        <div className="mt-3 pt-3 border-t border-stone-100">
          {slice.uncertainty.map((u, i) => (
            <p key={i} className="text-xs text-stone-400 italic">
              {u.description}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
