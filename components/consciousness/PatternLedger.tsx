'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { seedMaiaPrompt, setReturnPath } from '@/lib/maia/seedPrompt';

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
  firstSeenAt?: string | null;
  lastEvidenceAt?: string | null;
  memberLabel?: string | null;
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

function relativeTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? '1 month ago' : `${months} months ago`;
}

const FALLBACK_QUESTIONS = [
  'Where does this still feel familiar?',
  'What does this pattern ask you to notice?',
  'When does this arise most clearly?',
];

function getLivingQuestion(pattern: MemberPattern): string {
  if (pattern.integrationPrompt) return pattern.integrationPrompt;
  // Deterministic fallback based on pattern id so it's stable across renders
  const idx = pattern.id.charCodeAt(0) % FALLBACK_QUESTIONS.length;
  return FALLBACK_QUESTIONS[idx];
}

function PatternTimeline({ firstSeenAt, lastEvidenceAt }: { firstSeenAt?: string | null; lastEvidenceAt?: string | null }) {
  if (!firstSeenAt) return null;
  const first = relativeTime(firstSeenAt);
  // Show "Returned" only if last evidence is meaningfully later (> 1 hour)
  const showReturn = lastEvidenceAt &&
    (new Date(lastEvidenceAt).getTime() - new Date(firstSeenAt).getTime()) > 3600000;
  return (
    <p className="mt-2 text-[11px] text-white/35 tracking-wide">
      First noticed {first}
      {showReturn ? <> &middot; Returned {relativeTime(lastEvidenceAt)}</> : null}
    </p>
  );
}

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

function EditablePatternTitle({
  pattern,
  onSave,
}: {
  pattern: MemberPattern;
  onSave: (id: string, label: string, sourceType: string) => void;
}) {
  const displayName = pattern.memberLabel || pattern.theme;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(displayName);

  function commit() {
    const trimmed = draft.trim();
    setEditing(false);
    // Only save if actually changed
    if (trimmed !== displayName) {
      onSave(pattern.id, trimmed, pattern.source || 'maia');
    }
  }

  if (editing) {
    return (
      <input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit();
          if (e.key === 'Escape') { setDraft(displayName); setEditing(false); }
        }}
        className="w-full bg-transparent text-sm font-medium text-white/90 border-b border-amber-400/40 outline-none py-0.5"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => { setDraft(displayName); setEditing(true); }}
      className="text-left text-sm font-medium text-white/90 transition-colors duration-200 cursor-text flex items-center gap-2"
    >
      <span className="border-b border-dashed border-white/30">
        {displayName}
      </span>
      <svg className="w-3.5 h-3.5 text-white/30 shrink-0" viewBox="0 0 16 16" fill="currentColor">
        <path d="M12.1 3.9a1.5 1.5 0 0 0-2.12 0L4.5 9.38l-.88 3.5 3.5-.88 5.48-5.48a1.5 1.5 0 0 0 0-2.12L12.1 3.9zM6.5 11.5l-1.5.38.38-1.5L10 5.75l1.12 1.13L6.5 11.5z"/>
      </svg>
    </button>
  );
}

export default function PatternLedger() {
  const router = useRouter();
  const [patterns, setPatterns] = useState<MemberPattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);

  function returnToPattern(displayName: string) {
    seedMaiaPrompt({
      prompt: `Let's return to this pattern: ${displayName}. Help me see how it is showing up now.`,
      source: 'patterns:return',
      returnTo: '/worlds/patterns',
      tone: 'exploratory',
    });
    setReturnPath('/worlds/patterns', 'Patterns');
    sessionStorage.setItem('maia_nav_teardown', 'true');
    router.push('/maia');
  }

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

      // No auto-expand needed — living question is always visible for settled patterns
    } catch (error) {
      console.error('Failed to respond to pattern:', error);
    } finally {
      setSubmittingId(null);
    }
  }

  async function saveLabel(patternId: string, label: string, sourceType: string) {
    // Optimistic update
    setPatterns((current) =>
      current.map((p) => (p.id === patternId ? { ...p, memberLabel: label || null } : p))
    );
    try {
      const res = await fetch(`/api/members/patterns/${patternId}/label`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label, sourceType }),
      });
      if (!res.ok) {
        // Revert on failure — reload patterns
        console.error('Failed to save label, reverting');
        const reload = await fetch('/api/members/patterns', { credentials: 'include', cache: 'no-store' });
        if (reload.ok) {
          const json = await reload.json();
          setPatterns(json.patterns ?? []);
        }
      }
    } catch (error) {
      console.error('Failed to save pattern label:', error);
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
      <p className="text-[13px] text-white/35 leading-relaxed mb-2">
        What keeps returning. Touch a name to make it yours.
      </p>
      {patterns.map((pattern) => {
        const isOffered = pattern.status === 'offered';
        const isSubmitting = submittingId === pattern.id;
        const isMaia = pattern.source === 'maia';

        return (
          <div key={pattern.id} className="rounded-2xl border border-white/15 bg-white/[0.07] p-5">

            {/* Air layer — recognition */}
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                {isMaia ? (
                  <p className="mb-1.5 text-xs uppercase tracking-wider text-white/35">
                    MAIA is noticing
                  </p>
                ) : null}

                {/* Pattern name — editable for settled patterns */}
                {!isOffered ? (
                  <EditablePatternTitle pattern={pattern} onSave={saveLabel} />
                ) : (
                  <p className="text-sm text-white/80">
                    {pattern.description || pattern.theme}
                  </p>
                )}

                {/* Description shown separately when there's a custom label */}
                {!isOffered && pattern.description && (pattern.memberLabel || pattern.description !== pattern.theme) ? (
                  <p className="mt-1 text-[13px] leading-relaxed text-white/55">{pattern.description}</p>
                ) : null}
              </div>

              {!isOffered ? (
                <StatusBadge status={pattern.status} resonance={pattern.memberResponse} />
              ) : null}
            </div>

            {/* Timeline — when this pattern was noticed */}
            <PatternTimeline firstSeenAt={pattern.firstSeenAt} lastEvidenceAt={pattern.lastEvidenceAt} />

            {/* Living question — shown directly for settled patterns */}
            {!isOffered ? (
              <p className="mt-3 text-[13px] leading-relaxed text-white/50 italic pl-3 border-l-2 border-amber-400/20">
                {getLivingQuestion(pattern)}
              </p>
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

            {/* Return to this — bridge back into MAIA */}
            {!isOffered ? (
              <div className="mt-5 pt-4 border-t border-white/8">
                <button
                  type="button"
                  onClick={() => returnToPattern(pattern.memberLabel || pattern.theme)}
                  className="rounded-lg border border-amber-400/20 bg-amber-400/5 px-4 py-2 text-[13px] text-amber-200/70 hover:bg-amber-400/10 hover:text-amber-200/90 transition-all duration-300"
                >
                  Return to this &rarr;
                </button>
              </div>
            ) : null}

          </div>
        );
      })}
    </div>
  );
}
