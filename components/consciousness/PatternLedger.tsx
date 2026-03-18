'use client';

import { useEffect, useState } from 'react';

type PatternStatus = 'offered' | 'confirmed' | 'rejected';
type PatternSource = 'practitioner' | 'maia';
type ResonanceResponse = 'fits' | 'partly' | 'not_now' | 'no' | 'explore';

interface MemberPattern {
  id: string;
  theme: string;
  description: string | null;
  integrationPrompt?: string | null;
  status: PatternStatus;
  confidence: number | null;
  memberResponse: string | null;
  memberRespondedAt: string | null;
  createdAt: string;
  updatedAt: string;
  source?: PatternSource;
}

const RESONANCE_BUTTONS: { value: ResonanceResponse; label: string; primary?: boolean }[] = [
  { value: 'fits',     label: 'Yes, this fits',      primary: true },
  { value: 'partly',   label: 'Partly' },
  { value: 'explore',  label: 'I want to explore this' },
  { value: 'not_now',  label: 'Not now' },
  { value: 'no',       label: 'No' },
];

// Maps resonance response to pattern_ledger status
const RESONANCE_TO_STATUS: Record<ResonanceResponse, 'confirmed' | 'rejected' | null> = {
  fits:     'confirmed',
  partly:   null,   // keeps status, records resonance_response
  explore:  null,
  not_now:  null,
  no:       'rejected',
};

function PatternLedgerSkeleton() {
  return (
    <div className="space-y-4">
      {[0, 1].map((i) => (
        <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="h-4 w-28 animate-pulse rounded bg-white/10" />
          <div className="mt-3 h-4 w-full animate-pulse rounded bg-white/10" />
          <div className="mt-2 h-4 w-4/5 animate-pulse rounded bg-white/10" />
          <div className="mt-5 h-3 w-3/4 animate-pulse rounded bg-white/10" />
          <div className="mt-4 flex gap-2">
            <div className="h-8 w-28 animate-pulse rounded-xl bg-white/10" />
            <div className="h-8 w-20 animate-pulse rounded-xl bg-white/10" />
          </div>
        </div>
      ))}
    </div>
  );
}

function StatusBadge({ status, resonance }: { status: PatternStatus; resonance?: string | null }) {
  const label =
    resonance === 'partly'   ? 'Partly resonant' :
    resonance === 'explore'  ? 'Exploring' :
    resonance === 'not_now'  ? 'Not now' :
    status === 'confirmed'   ? 'Confirmed' :
    status === 'rejected'    ? 'Dismissed' :
    'Noticed';
  return (
    <span className="shrink-0 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/60">
      {label}
    </span>
  );
}

export default function PatternLedger() {
  const [patterns, setPatterns] = useState<MemberPattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  const [expandedInvite, setExpandedInvite] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadPatterns() {
      try {
        setLoading(true);
        setHasError(false);

        const response = await fetch('/api/members/patterns', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
        });

        if (!response.ok) throw new Error(`Failed with status ${response.status}`);

        const json = (await response.json()) as { patterns: MemberPattern[] };
        if (mounted) setPatterns(json.patterns ?? []);
      } catch (error) {
        console.error('Failed to load patterns:', error);
        if (mounted) setHasError(true);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadPatterns();
    return () => { mounted = false; };
  }, []);

  async function submitResonance(patternId: string, resonance: ResonanceResponse) {
    try {
      setSubmittingId(patternId);

      // Map to backend response value
      const backendResponse = RESONANCE_TO_STATUS[resonance] ?? 'confirmed';
      const res = await fetch(`/api/members/patterns/${patternId}/response`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response: backendResponse, resonanceResponse: resonance }),
      });

      if (!res.ok) throw new Error(`Failed with status ${res.status}`);

      const json = (await res.json()) as { pattern: MemberPattern };
      setPatterns((current) =>
        current.map((p) => (p.id === patternId ? { ...json.pattern, integrationPrompt: p.integrationPrompt } : p))
      );

      // Auto-expand the invite when user wants to explore
      if (resonance === 'explore' || resonance === 'fits') {
        setExpandedInvite(patternId);
      }
    } catch (error) {
      console.error('Failed to respond to pattern:', error);
    } finally {
      setSubmittingId(null);
    }
  }

  if (loading) return <PatternLedgerSkeleton />;

  if (hasError) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
        Unable to load patterns right now.
      </div>
    );
  }

  if (patterns.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <p className="text-sm text-white/70">
          No patterns noticed yet. Patterns emerge through conversation over time.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {patterns.map((pattern) => {
        const isOffered = pattern.status === 'offered';
        const isSubmitting = submittingId === pattern.id;
        const isMaia = pattern.source === 'maia';
        const showInvite = expandedInvite === pattern.id && !!pattern.integrationPrompt;

        return (
          <div key={pattern.id} className="rounded-2xl border border-white/10 bg-white/5 p-5">

            {/* Air layer — recognition */}
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                {isMaia ? (
                  <p className="mb-1.5 text-xs uppercase tracking-wider text-white/35">
                    MAIA is noticing
                  </p>
                ) : null}

                {/* Theme name — shown when no description yet */}
                {!pattern.description ? (
                  <p className="text-sm text-white/80">{pattern.theme}</p>
                ) : null}

                {/* Description (Air) */}
                {pattern.description ? (
                  <p className="text-sm leading-relaxed text-white/85">{pattern.description}</p>
                ) : null}
              </div>

              {!isOffered ? (
                <StatusBadge status={pattern.status} resonance={pattern.memberResponse} />
              ) : null}
            </div>

            {/* Earth layer — integration prompt, shown when expanded */}
            {showInvite ? (
              <div className="mt-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-xs uppercase tracking-wider text-white/35 mb-2">Sit with this</p>
                <p className="text-sm leading-relaxed text-white/75 italic">
                  {pattern.integrationPrompt}
                </p>
              </div>
            ) : null}

            {/* Resonance responses */}
            {isOffered ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {RESONANCE_BUTTONS.map((btn) => (
                  <button
                    key={btn.value}
                    type="button"
                    onClick={() => submitResonance(pattern.id, btn.value)}
                    disabled={isSubmitting}
                    className={
                      btn.primary
                        ? 'rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50'
                        : 'rounded-xl border border-white/10 bg-transparent px-3 py-2 text-sm text-white/65 transition hover:bg-white/5 hover:text-white/85 disabled:cursor-not-allowed disabled:opacity-50'
                    }
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            ) : null}

            {/* Show invite toggle for confirmed/exploring patterns */}
            {!isOffered && pattern.integrationPrompt && !showInvite ? (
              <button
                type="button"
                onClick={() => setExpandedInvite(expandedInvite === pattern.id ? null : pattern.id)}
                className="mt-3 text-xs text-white/40 hover:text-white/65 transition"
              >
                {expandedInvite === pattern.id ? 'Close' : 'Sit with the question →'}
              </button>
            ) : null}

            {/* Member's own note, if any */}
            {!isOffered && pattern.memberResponse && pattern.memberResponse !== 'confirmed' && pattern.memberResponse !== 'rejected' ? (
              <p className="mt-3 text-xs italic text-white/45">{pattern.memberResponse}</p>
            ) : null}

          </div>
        );
      })}
    </div>
  );
}
