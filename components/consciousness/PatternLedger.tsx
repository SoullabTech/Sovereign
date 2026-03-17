'use client';

import { useEffect, useState } from 'react';

type PatternStatus = 'offered' | 'confirmed' | 'rejected';
type PatternSource = 'practitioner' | 'maia';

interface MemberPattern {
  id: string;
  theme: string;
  description: string | null;
  status: PatternStatus;
  confidence: number | null;
  memberResponse: string | null;
  memberRespondedAt: string | null;
  createdAt: string;
  updatedAt: string;
  source?: PatternSource;
}

function PatternLedgerSkeleton() {
  return (
    <div className="space-y-4">
      {[0, 1].map((i) => (
        <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="h-5 w-40 animate-pulse rounded bg-white/10" />
          <div className="mt-3 h-4 w-3/4 animate-pulse rounded bg-white/10" />
          <div className="mt-4 flex gap-2">
            <div className="h-9 w-24 animate-pulse rounded-xl bg-white/10" />
            <div className="h-9 w-24 animate-pulse rounded-xl bg-white/10" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ConfidenceBar({ confidence }: { confidence: number | null }) {
  if (confidence == null) return null;
  const percent = Math.max(0, Math.min(100, Math.round(confidence * 100)));
  return (
    <div className="mt-3">
      <div className="mb-1 text-xs text-white/45">Confidence</div>
      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-white/40" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: PatternStatus }) {
  const label =
    status === 'confirmed' ? 'Confirmed' : status === 'rejected' ? 'Rejected' : 'Offered';
  return (
    <span className="shrink-0 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/75">
      {label}
    </span>
  );
}

export default function PatternLedger() {
  const [patterns, setPatterns] = useState<MemberPattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);

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

        if (!response.ok) {
          throw new Error(`Failed with status ${response.status}`);
        }

        const json = (await response.json()) as { patterns: MemberPattern[] };

        if (mounted) {
          setPatterns(json.patterns ?? []);
        }
      } catch (error) {
        console.error('Failed to load patterns:', error);
        if (mounted) setHasError(true);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadPatterns();
    return () => {
      mounted = false;
    };
  }, []);

  async function submitResponse(patternId: string, response: 'confirmed' | 'rejected') {
    try {
      setSubmittingId(patternId);

      const res = await fetch(`/api/members/patterns/${patternId}/response`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response }),
      });

      if (!res.ok) throw new Error(`Failed with status ${res.status}`);

      const json = (await res.json()) as { pattern: MemberPattern };

      setPatterns((current) =>
        current.map((p) => (p.id === patternId ? json.pattern : p))
      );
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

        return (
          <div key={pattern.id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                {isMaia ? (
                  <p className="mb-1 text-xs text-white/40">MAIA is noticing</p>
                ) : null}
                <h3 className="text-base font-medium text-white">{pattern.theme}</h3>

                {pattern.description ? (
                  <p className="mt-2 text-sm text-white/70">{pattern.description}</p>
                ) : null}

                <ConfidenceBar confidence={pattern.confidence} />
              </div>

              {!isOffered ? <StatusBadge status={pattern.status} /> : null}
            </div>

            {isOffered ? (
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => submitResponse(pattern.id, 'confirmed')}
                  disabled={isSubmitting}
                  className="rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Confirm
                </button>
                <button
                  type="button"
                  onClick={() => submitResponse(pattern.id, 'rejected')}
                  disabled={isSubmitting}
                  className="rounded-xl border border-white/15 bg-transparent px-4 py-2 text-sm text-white/80 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Not quite
                </button>
              </div>
            ) : null}

            {!isOffered && pattern.memberResponse ? (
              <p className="mt-4 text-sm italic text-white/55">{pattern.memberResponse}</p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
