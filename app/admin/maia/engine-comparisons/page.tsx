'use client';

import { useCallback, useEffect, useState } from 'react';
import { adminFetch } from '@/lib/admin/adminFetch';

type Filter = 'unreviewed' | 'reviewed' | 'all';

type ReviewerLabel = 'better' | 'worse' | 'neutral' | 'interesting';

interface Row {
  comparison_id: number;
  turn_id: number;
  shadow_engine: string;
  is_primary: boolean;
  shadow_response: string;
  shadow_response_time_ms: number | null;
  mode: 'FAST' | 'CORE' | 'DEEP' | null;
  confidence_score: number | null;
  reviewer_label: ReviewerLabel | null;
  attunement_score: number | null;
  reviewer_note: string | null;
  reviewed_at: string | null;
  created_at: string;
  member_input: string | null;
  primary_response: string | null;
  primary_engine: string | null;
  session_id: string | null;
}

interface Totals {
  total: number;
  reviewed: number;
  unreviewed: number;
}

interface Payload {
  generatedAt: string;
  filter: { status: Filter; limit: number };
  totals: Totals;
  rows: Row[];
}

type ReviewPatch = Partial<
  Pick<Row, 'reviewer_label' | 'attunement_score' | 'reviewer_note'>
>;

export default function EngineComparisonsPage() {
  const [filter, setFilter] = useState<Filter>('unreviewed');
  const [payload, setPayload] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminFetch(
        `/api/admin/maia/engine-comparisons?status=${filter}&limit=50`,
      );
      if (!res.ok) {
        setError(`Request failed: ${res.status}`);
        return;
      }
      const json = (await res.json()) as Payload;
      setPayload(json);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const review = useCallback(
    async (id: number, patch: ReviewPatch) => {
      setSavingId(id);
      try {
        const res = await adminFetch(`/api/admin/maia/engine-comparisons/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(patch),
        });
        if (!res.ok) {
          const j = (await res.json().catch(() => ({}))) as { error?: string };
          setError(j.error ?? `Save failed: ${res.status}`);
        } else {
          await load();
        }
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setSavingId(null);
      }
    },
    [load],
  );

  return (
    <div className="min-h-screen bg-maia-navy-950 text-maia-ink-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-light tracking-wide text-maia-ink-100">
              Engine Comparison Review
            </h1>
            <p className="text-maia-ink-60 text-sm mt-1 max-w-2xl">
              Primary response (from <code>maia_turns.maia_text</code>) joined
              to shadow response (from{' '}
              <code>maia_engine_comparisons.response_text</code>) on{' '}
              <code>turn_id</code>. Reviewer labels feed Loop C learning
              analytics.
            </p>
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="text-xs px-3 py-1.5 rounded border border-maia-ink-40/30 text-maia-ink-60 hover:text-maia-ink-100 hover:border-maia-ink-40/60 disabled:opacity-50"
          >
            {loading ? 'Loading…' : 'Refresh'}
          </button>
        </header>

        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex gap-1">
            {(['unreviewed', 'reviewed', 'all'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded border ${
                  filter === f
                    ? 'bg-maia-ink-100 text-maia-navy-950 border-maia-ink-100'
                    : 'border-maia-ink-40/30 text-maia-ink-60 hover:text-maia-ink-100'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          {payload && (
            <div className="text-maia-ink-40 text-xs ml-auto">
              {payload.totals.unreviewed} unreviewed ·{' '}
              {payload.totals.reviewed} reviewed · {payload.totals.total} total
            </div>
          )}
        </div>

        {error && (
          <div className="rounded border border-rose-400/40 bg-rose-950/30 text-rose-200 p-3 text-sm">
            {error}
          </div>
        )}

        {payload && payload.rows.length === 0 && !loading && (
          <div className="text-maia-ink-40 text-sm italic">
            No rows for this filter.
          </div>
        )}

        {payload?.rows.map((row) => (
          <ComparisonCard
            key={row.comparison_id}
            row={row}
            saving={savingId === row.comparison_id}
            onReview={(patch) => review(row.comparison_id, patch)}
          />
        ))}
      </div>
    </div>
  );
}

function ComparisonCard({
  row,
  saving,
  onReview,
}: {
  row: Row;
  saving: boolean;
  onReview: (patch: ReviewPatch) => void;
}) {
  const [scoreInput, setScoreInput] = useState<string>(
    row.attunement_score != null ? String(row.attunement_score) : '',
  );
  const [noteInput, setNoteInput] = useState<string>(row.reviewer_note ?? '');

  const labels: ReviewerLabel[] = ['better', 'worse', 'neutral', 'interesting'];

  return (
    <div className="rounded border border-maia-ink-40/20 bg-maia-navy-900 p-4 space-y-3">
      <div className="text-xs text-maia-ink-40 flex flex-wrap gap-3">
        <span>Turn {row.turn_id}</span>
        <span>Comparison {row.comparison_id}</span>
        <span>Mode {row.mode ?? '—'}</span>
        <span>{new Date(row.created_at).toLocaleString()}</span>
        {row.session_id && (
          <span className="opacity-60">
            session {row.session_id.slice(0, 8)}
          </span>
        )}
      </div>

      <div>
        <div className="text-xs uppercase tracking-wide text-maia-ink-40 mb-1">
          Member input
        </div>
        <div className="bg-maia-navy-950 border border-maia-ink-40/10 p-2 rounded text-sm whitespace-pre-wrap">
          {row.member_input ?? (
            <span className="italic opacity-60">
              (missing — turn may have been deleted)
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <div className="text-xs uppercase tracking-wide text-maia-ink-40 mb-1">
            Primary —{' '}
            <span className="text-maia-ink-100">
              {row.primary_engine ?? '—'}
            </span>
          </div>
          <div className="bg-sky-950/30 border border-sky-400/20 p-2 rounded text-sm whitespace-pre-wrap">
            {row.primary_response ?? (
              <span className="italic opacity-60">(missing)</span>
            )}
          </div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wide text-maia-ink-40 mb-1">
            Shadow —{' '}
            <span className="text-maia-ink-100">{row.shadow_engine}</span>
            {row.shadow_response_time_ms != null && (
              <span className="ml-2 opacity-60">
                {row.shadow_response_time_ms}ms
              </span>
            )}
          </div>
          <div className="bg-amber-950/30 border border-amber-400/20 p-2 rounded text-sm whitespace-pre-wrap">
            {row.shadow_response}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-maia-ink-40/10">
        <span className="text-xs text-maia-ink-40 mr-2">
          Shadow vs Primary:
        </span>
        {labels.map((label) => (
          <button
            key={label}
            disabled={saving}
            onClick={() => onReview({ reviewer_label: label })}
            className={`text-xs px-2 py-1 rounded border ${
              row.reviewer_label === label
                ? 'bg-maia-ink-100 text-maia-navy-950 border-maia-ink-100'
                : 'border-maia-ink-40/30 text-maia-ink-60 hover:text-maia-ink-100 hover:border-maia-ink-40/60'
            } disabled:opacity-50`}
          >
            {label}
          </button>
        ))}

        <div className="flex items-center gap-1 ml-3">
          <label className="text-xs text-maia-ink-40">Attunement</label>
          <input
            type="number"
            min={1}
            max={10}
            value={scoreInput}
            onChange={(e) => setScoreInput(e.target.value)}
            onBlur={() => {
              const v = parseInt(scoreInput, 10);
              if (
                !Number.isNaN(v) &&
                v >= 1 &&
                v <= 10 &&
                v !== row.attunement_score
              ) {
                onReview({ attunement_score: v });
              }
            }}
            disabled={saving}
            className="w-12 bg-maia-navy-950 border border-maia-ink-40/30 rounded px-1 py-0.5 text-xs text-maia-ink-100"
          />
        </div>

        {row.reviewed_at && (
          <span className="text-xs text-emerald-400/80 ml-auto">
            reviewed {new Date(row.reviewed_at).toLocaleString()}
          </span>
        )}
      </div>

      <textarea
        rows={2}
        placeholder="reviewer note (optional)"
        value={noteInput}
        onChange={(e) => setNoteInput(e.target.value)}
        onBlur={() => {
          const next = noteInput || null;
          const prev = row.reviewer_note || null;
          if (next !== prev) {
            onReview({ reviewer_note: next });
          }
        }}
        disabled={saving}
        className="w-full bg-maia-navy-950 border border-maia-ink-40/20 rounded p-2 text-sm text-maia-ink-100 placeholder:text-maia-ink-40"
      />
    </div>
  );
}
