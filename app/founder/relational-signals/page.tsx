'use client';

/**
 * /founder/relational-signals
 *
 * Founder-only review surface for the Phase 2 observation window.
 *
 * Read-order (per the spec):
 *   timeline-first, scan-fast, context-on-demand, annotation-light.
 *
 * Hard rules (see migration 20260409000002):
 *   - Turn text may be joined for display, NEVER copied into the signals store.
 *   - Founder verdicts are stored separately and are NEVER fed back into the
 *     detector automatically.
 *   - No export, no charts, no tuning controls in v1.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Activity, AlertCircle, CheckCircle2, Filter, HelpCircle, Loader2, RefreshCw, X } from 'lucide-react';
import { RELATIONSHIP_PATTERNS } from '@/lib/relationships/relationshipResources';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

type Window = '24h' | '7d' | '30d';
type SourceFilter = '' | 'maia_conversation' | 'labtool_manual';
type ConfidenceFilter = '' | 'low' | 'medium' | 'high';
type ReviewFilter = '' | 'unreviewed' | 'looks_right' | 'unclear' | 'looks_off';
type Verdict = 'looks_right' | 'unclear' | 'looks_off';

interface SignalRow {
  id: string;
  memberId: string;
  relationshipId: string | null;
  counterpartLabel: string | null;
  tone: string | null;
  ruptureState: string | null;
  dynamicTags: string[];
  frameworksApplied: string[];
  source: string;
  confidence: number | null;
  sourceTurnId: string | null;
  createdAt: string;
  turnUserText: string | null;
  turnSessionId: string | null;
  review: {
    verdict: string;
    note: string | null;
    reviewedAt: string | null;
  } | null;
}

interface ListResponse {
  success: boolean;
  count: number;
  window: Window;
  rows: SignalRow[];
  error?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function confidenceBucket(c: number | null, source: string): 'low' | 'medium' | 'high' | 'manual' {
  if (c == null) return source === 'labtool_manual' ? 'manual' : 'low';
  if (c < 0.55) return 'low';
  if (c < 0.75) return 'medium';
  return 'high';
}

const BUCKET_STYLE: Record<string, string> = {
  low: 'text-white/45 bg-white/[0.03] border-white/10',
  medium: 'text-amber-200/75 bg-amber-500/[0.08] border-amber-500/20',
  high: 'text-rose-200/85 bg-rose-500/[0.08] border-rose-500/20',
  manual: 'text-emerald-200/75 bg-emerald-500/[0.08] border-emerald-500/20',
};

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - then);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function absoluteTime(iso: string): string {
  return new Date(iso).toLocaleString();
}

function shortId(id: string, chars = 8): string {
  return id?.slice(0, chars) ?? '—';
}

function signalSummary(row: SignalRow): string {
  const parts: string[] = [];
  if (row.counterpartLabel) parts.push(row.counterpartLabel);
  if (row.tone) parts.push(row.tone);
  if (row.ruptureState) parts.push(row.ruptureState);
  return parts.length > 0 ? parts.join(' · ') : 'no dimensions';
}

function patternLabel(id: string): string {
  return RELATIONSHIP_PATTERNS.find((p) => p.id === id)?.name ?? id;
}

function truncate(s: string, n: number): string {
  if (s.length <= n) return s;
  return s.slice(0, n).trimEnd() + '…';
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────

export default function FounderRelationalSignalsPage() {
  const [rows, setRows] = useState<SignalRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [windowKey, setWindowKey] = useState<Window>('7d');
  const [source, setSource] = useState<SourceFilter>('');
  const [confidence, setConfidence] = useState<ConfidenceFilter>('');
  const [pattern, setPattern] = useState<string>('');
  const [review, setReview] = useState<ReviewFilter>('');

  // Drawer
  const [selected, setSelected] = useState<SignalRow | null>(null);

  const fetchRows = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams();
      qs.set('window', windowKey);
      if (source) qs.set('source', source);
      if (confidence) qs.set('confidence', confidence);
      if (pattern) qs.set('pattern', pattern);
      if (review) qs.set('review', review);

      const res = await fetch(`/api/founder/relational-signals?${qs.toString()}`);
      const data = (await res.json()) as ListResponse;
      if (!data.success) throw new Error(data.error || 'Could not load signals');
      setRows(data.rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [windowKey, source, confidence, pattern, review]);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  const counts = useMemo(() => {
    const total = rows.length;
    const reviewed = rows.filter((r) => r.review != null).length;
    const linked = rows.filter((r) => r.turnUserText != null).length;
    return { total, reviewed, linked };
  }, [rows]);

  return (
    <div className="text-[var(--sl-text-primary)]">
      {/* ── Header ── */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Relational Signals Review</h1>
        <p className="mt-1 text-sm text-[var(--sl-text-muted)]">
          Observation-only review of detected relational signals. No tuning is applied here.
        </p>
      </div>

      {/* ── Filter bar ── */}
      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-[var(--sl-border-subtle)] bg-[var(--sl-bg-surface)] px-3 py-2.5">
        <Filter className="h-3.5 w-3.5 text-[var(--sl-text-muted)]" />

        <select
          value={windowKey}
          onChange={(e) => setWindowKey(e.target.value as Window)}
          className="rounded-md border border-[var(--sl-border-subtle)] bg-[var(--sl-bg-elevated)] px-2 py-1 text-xs text-[var(--sl-text-secondary)]"
        >
          <option value="24h">Last 24h</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
        </select>

        <select
          value={source}
          onChange={(e) => setSource(e.target.value as SourceFilter)}
          className="rounded-md border border-[var(--sl-border-subtle)] bg-[var(--sl-bg-elevated)] px-2 py-1 text-xs text-[var(--sl-text-secondary)]"
        >
          <option value="">All sources</option>
          <option value="maia_conversation">MAIA conversation</option>
          <option value="labtool_manual">Labtool manual</option>
        </select>

        <select
          value={confidence}
          onChange={(e) => setConfidence(e.target.value as ConfidenceFilter)}
          className="rounded-md border border-[var(--sl-border-subtle)] bg-[var(--sl-bg-elevated)] px-2 py-1 text-xs text-[var(--sl-text-secondary)]"
        >
          <option value="">All confidence</option>
          <option value="low">Low (&lt;0.55)</option>
          <option value="medium">Medium (0.55–0.75)</option>
          <option value="high">High (≥0.75)</option>
        </select>

        <select
          value={pattern}
          onChange={(e) => setPattern(e.target.value)}
          className="rounded-md border border-[var(--sl-border-subtle)] bg-[var(--sl-bg-elevated)] px-2 py-1 text-xs text-[var(--sl-text-secondary)]"
        >
          <option value="">All patterns</option>
          {RELATIONSHIP_PATTERNS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <select
          value={review}
          onChange={(e) => setReview(e.target.value as ReviewFilter)}
          className="rounded-md border border-[var(--sl-border-subtle)] bg-[var(--sl-bg-elevated)] px-2 py-1 text-xs text-[var(--sl-text-secondary)]"
        >
          <option value="">All review states</option>
          <option value="unreviewed">Unreviewed</option>
          <option value="looks_right">Looks right</option>
          <option value="unclear">Unclear</option>
          <option value="looks_off">Looks off</option>
        </select>

        <div className="ml-auto flex items-center gap-2 text-[11px] text-[var(--sl-text-muted)]">
          <span>{counts.total} rows</span>
          <span>·</span>
          <span>{counts.linked} linked</span>
          <span>·</span>
          <span>{counts.reviewed} reviewed</span>
          <button
            onClick={fetchRows}
            className="ml-2 inline-flex items-center gap-1 rounded border border-[var(--sl-border-subtle)] bg-[var(--sl-bg-elevated)] px-2 py-1 text-[var(--sl-text-secondary)] hover:text-[var(--sl-text-primary)]"
          >
            <RefreshCw className="h-3 w-3" />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="overflow-hidden rounded-xl border border-[var(--sl-border-subtle)] bg-[var(--sl-bg-surface)]">
        {loading && (
          <div className="flex items-center justify-center gap-2 py-12 text-sm text-[var(--sl-text-muted)]">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading signals…
          </div>
        )}

        {!loading && error && (
          <div className="flex items-center gap-2 px-4 py-6 text-sm text-red-400">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {!loading && !error && rows.length === 0 && (
          <div className="px-4 py-12 text-center">
            <Activity className="mx-auto mb-3 h-6 w-6 text-[var(--sl-text-muted)]" />
            <p className="text-sm text-[var(--sl-text-secondary)]">No signals in this window.</p>
            <p className="mt-1 text-xs text-[var(--sl-text-muted)]">
              The detector is silent until real conversations exercise relational language.
            </p>
          </div>
        )}

        {!loading && !error && rows.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-[12px]">
              <thead className="border-b border-[var(--sl-border-subtle)] bg-[var(--sl-bg-elevated)]">
                <tr className="text-left text-[10px] uppercase tracking-wider text-[var(--sl-text-muted)]">
                  <th className="px-3 py-2 font-medium">Detected</th>
                  <th className="px-3 py-2 font-medium">Member</th>
                  <th className="px-3 py-2 font-medium">Source</th>
                  <th className="px-3 py-2 font-medium">Signal</th>
                  <th className="px-3 py-2 font-medium">Pattern hits</th>
                  <th className="px-3 py-2 font-medium">Confidence</th>
                  <th className="px-3 py-2 font-medium">Turn excerpt</th>
                  <th className="px-3 py-2 font-medium">Review</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const bucket = confidenceBucket(row.confidence, row.source);
                  return (
                    <tr
                      key={row.id}
                      onClick={() => setSelected(row)}
                      className="cursor-pointer border-b border-[var(--sl-border-subtle)]/50 hover:bg-[var(--sl-bg-elevated)]/60 transition-colors"
                    >
                      {/* Detected */}
                      <td className="whitespace-nowrap px-3 py-2.5 text-[var(--sl-text-secondary)]" title={absoluteTime(row.createdAt)}>
                        {relativeTime(row.createdAt)}
                      </td>

                      {/* Member */}
                      <td className="px-3 py-2.5 font-mono text-[11px] text-[var(--sl-text-muted)]">
                        {shortId(row.memberId)}
                      </td>

                      {/* Source */}
                      <td className="px-3 py-2.5">
                        <span
                          className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] ${
                            row.source === 'labtool_manual'
                              ? 'border-emerald-500/20 bg-emerald-500/[0.05] text-emerald-200/75'
                              : 'border-rose-500/15 bg-rose-500/[0.04] text-rose-200/75'
                          }`}
                        >
                          {row.source === 'labtool_manual' ? 'labtool' : 'maia'}
                        </span>
                      </td>

                      {/* Signal summary */}
                      <td className="px-3 py-2.5 text-[var(--sl-text-secondary)]">
                        {signalSummary(row)}
                      </td>

                      {/* Pattern hits (dynamic_tags) */}
                      <td className="px-3 py-2.5">
                        {row.dynamicTags.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {row.dynamicTags.slice(0, 2).map((id) => (
                              <span
                                key={id}
                                className="rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[10px] text-white/65"
                              >
                                {patternLabel(id)}
                              </span>
                            ))}
                            {row.dynamicTags.length > 2 && (
                              <span className="text-[10px] text-white/30">+{row.dynamicTags.length - 2}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-white/25">—</span>
                        )}
                      </td>

                      {/* Confidence */}
                      <td className="px-3 py-2.5">
                        <span
                          className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] ${BUCKET_STYLE[bucket]}`}
                        >
                          {row.confidence != null ? row.confidence.toFixed(2) : bucket === 'manual' ? 'manual' : '—'}
                        </span>
                      </td>

                      {/* Turn excerpt */}
                      <td className="max-w-[280px] px-3 py-2.5">
                        {row.turnUserText ? (
                          <span className="block truncate text-[var(--sl-text-secondary)]" title={row.turnUserText}>
                            {truncate(row.turnUserText, 120)}
                          </span>
                        ) : (
                          <span className="text-[10px] italic text-white/30">No linked turn</span>
                        )}
                      </td>

                      {/* Review */}
                      <td className="px-3 py-2.5">
                        {row.review ? (
                          <span
                            className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] ${
                              row.review.verdict === 'looks_right'
                                ? 'border-emerald-500/25 bg-emerald-500/[0.08] text-emerald-200/75'
                                : row.review.verdict === 'unclear'
                                  ? 'border-amber-500/25 bg-amber-500/[0.08] text-amber-200/75'
                                  : 'border-red-500/25 bg-red-500/[0.08] text-red-200/75'
                            }`}
                          >
                            {row.review.verdict === 'looks_right' && <CheckCircle2 className="h-3 w-3" />}
                            {row.review.verdict === 'unclear' && <HelpCircle className="h-3 w-3" />}
                            {row.review.verdict === 'looks_off' && <AlertCircle className="h-3 w-3" />}
                            {row.review.verdict.replace(/_/g, ' ')}
                          </span>
                        ) : (
                          <span className="text-[10px] italic text-white/30">unreviewed</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Drawer ── */}
      {selected && (
        <SignalDrawer
          row={selected}
          onClose={() => setSelected(null)}
          onReviewSaved={(updatedReview) => {
            // Optimistic: patch row in list + close drawer
            setRows((prev) =>
              prev.map((r) =>
                r.id === selected.id
                  ? { ...r, review: updatedReview }
                  : r,
              ),
            );
            setSelected(null);
          }}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DRAWER
// ─────────────────────────────────────────────────────────────────────────────

function SignalDrawer({
  row,
  onClose,
  onReviewSaved,
}: {
  row: SignalRow;
  onClose: () => void;
  onReviewSaved: (review: { verdict: string; note: string | null; reviewedAt: string | null }) => void;
}) {
  const [verdict, setVerdict] = useState<Verdict | null>(
    (row.review?.verdict as Verdict) ?? null,
  );
  const [note, setNote] = useState(row.review?.note ?? '');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const save = async () => {
    if (!verdict) return;
    setSaving(true);
    setErr(null);
    try {
      const res = await fetch('/api/founder/relational-signals/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signalId: row.id,
          verdict,
          note: note.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Could not save review');
      onReviewSaved({
        verdict: data.review.verdict,
        note: data.review.note ?? null,
        reviewedAt: data.review.reviewedAt ?? null,
      });
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
      />

      {/* Drawer panel */}
      <aside className="fixed right-0 top-0 z-50 h-screen w-full max-w-md overflow-y-auto border-l border-[var(--sl-border-subtle)] bg-[var(--sl-bg-canvas-deep)] p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--sl-text-primary)]">Signal detail</h2>
          <button
            onClick={onClose}
            className="rounded p-1 text-[var(--sl-text-muted)] hover:bg-[var(--sl-bg-elevated)] hover:text-[var(--sl-text-primary)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── Signal fields ── */}
        <section className="mb-5 space-y-2 rounded-lg border border-[var(--sl-border-subtle)] bg-[var(--sl-bg-surface)] p-3">
          <div className="text-[10px] uppercase tracking-wider text-[var(--sl-text-muted)]">Signal</div>
          <DrawerRow label="Detected" value={absoluteTime(row.createdAt)} />
          <DrawerRow label="Member" value={row.memberId} mono />
          <DrawerRow label="Source" value={row.source} />
          <DrawerRow label="Counterpart" value={row.counterpartLabel ?? '—'} />
          <DrawerRow label="Tone" value={row.tone ?? '—'} />
          <DrawerRow label="Rupture" value={row.ruptureState ?? '—'} />
          <DrawerRow label="Confidence" value={row.confidence != null ? row.confidence.toFixed(3) : '—'} />
          {row.dynamicTags.length > 0 && (
            <DrawerRow label="Patterns" value={row.dynamicTags.map(patternLabel).join(', ')} />
          )}
          {row.frameworksApplied.length > 0 && (
            <DrawerRow label="Frameworks" value={row.frameworksApplied.join(', ')} />
          )}
        </section>

        {/* ── Turn context ── */}
        <section className="mb-5 rounded-lg border border-[var(--sl-border-subtle)] bg-[var(--sl-bg-surface)] p-3">
          <div className="mb-2 text-[10px] uppercase tracking-wider text-[var(--sl-text-muted)]">
            Turn context
          </div>
          {row.turnUserText ? (
            <>
              <div className="mb-1 text-[10px] text-[var(--sl-text-muted)]">User said:</div>
              <p className="whitespace-pre-wrap rounded bg-black/30 p-2 text-[11px] leading-relaxed text-[var(--sl-text-secondary)]">
                {row.turnUserText}
              </p>
              {row.turnSessionId && (
                <div className="mt-2 font-mono text-[9px] text-[var(--sl-text-muted)]">
                  session: {shortId(row.turnSessionId, 16)}
                </div>
              )}
            </>
          ) : (
            <p className="text-[11px] italic text-[var(--sl-text-muted)]">
              No linked turn. This signal was recorded before the source_turn_id column
              was added, or came from a labtool (which has no conversation turn).
            </p>
          )}
        </section>

        {/* ── Founder review ── */}
        <section className="rounded-lg border border-[var(--sl-border-subtle)] bg-[var(--sl-bg-surface)] p-3">
          <div className="mb-2 text-[10px] uppercase tracking-wider text-[var(--sl-text-muted)]">
            Review (annotation only — never fed back into detector)
          </div>

          <div className="mb-3 flex gap-2">
            {(['looks_right', 'unclear', 'looks_off'] as Verdict[]).map((v) => {
              const active = verdict === v;
              return (
                <button
                  key={v}
                  onClick={() => setVerdict(v)}
                  className={`
                    flex-1 rounded border px-2 py-1.5 text-[11px] transition
                    ${active
                      ? v === 'looks_right'
                        ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-200'
                        : v === 'unclear'
                          ? 'border-amber-500/40 bg-amber-500/15 text-amber-200'
                          : 'border-red-500/40 bg-red-500/15 text-red-200'
                      : 'border-[var(--sl-border-subtle)] bg-[var(--sl-bg-elevated)] text-[var(--sl-text-muted)] hover:text-[var(--sl-text-primary)]'
                    }
                  `}
                >
                  {v.replace(/_/g, ' ')}
                </button>
              );
            })}
          </div>

          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="Optional note (why this looks right/unclear/off)"
            maxLength={1000}
            className="w-full rounded border border-[var(--sl-border-subtle)] bg-[var(--sl-bg-elevated)] px-2 py-1.5 text-[11px] text-[var(--sl-text-primary)] placeholder:text-[var(--sl-text-muted)]/60 focus:outline-none focus:border-[var(--sl-border-hover)]"
          />

          {err && <p className="mt-2 text-[11px] text-red-400">{err}</p>}

          <button
            onClick={save}
            disabled={!verdict || saving}
            className="mt-3 w-full rounded border border-[var(--sl-border-subtle)] bg-[var(--sl-bg-elevated)] px-3 py-2 text-[11px] text-[var(--sl-text-primary)] hover:bg-[var(--sl-bg-elevated)]/80 disabled:opacity-40"
          >
            {saving ? 'Saving…' : row.review ? 'Update review' : 'Save review'}
          </button>
        </section>
      </aside>
    </>
  );
}

function DrawerRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3 text-[11px]">
      <span className="flex-shrink-0 text-[var(--sl-text-muted)]">{label}</span>
      <span
        className={`text-right text-[var(--sl-text-secondary)] ${mono ? 'font-mono text-[10px]' : ''}`}
      >
        {value}
      </span>
    </div>
  );
}
