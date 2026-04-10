'use client';

/**
 * Founder Relational Patterns Review
 *
 * Read surface for the pattern detection observation layer
 * (relationship_entry_patterns, shipped 2026-04-09).
 *
 * Founder-only — protected at the API layer by requireFounder().
 * The page itself relies on the founder layout's feature-flag gate
 * for client-side scoping; the API layer is the actual auth boundary.
 *
 * v1 scope:
 *   • List non-expired patterns, newest first, LIMIT 200
 *   • Client-side verdict filter (no query params)
 *   • Drawer for full row + verdict form
 *   • No pagination, no charts, no exports, no aggregation
 *   • No turn-text join (Oracle turnId is null)
 */

import { useEffect, useMemo, useState } from 'react';
import { Eye, X, Loader2, Check } from 'lucide-react';

const VERDICTS = ['valid', 'false_positive', 'unclear', 'needs_followup'] as const;
type Verdict = typeof VERDICTS[number];

const VERDICT_LABELS: Record<Verdict, string> = {
  valid: 'Valid',
  false_positive: 'False positive',
  unclear: 'Unclear',
  needs_followup: 'Needs follow-up',
};

const VERDICT_BADGE: Record<Verdict, string> = {
  valid: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  false_positive: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  unclear: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  needs_followup: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
};

type FilterValue = 'all' | 'unreviewed' | Verdict;

interface RelationalPatternRow {
  patternRowId: string;
  patternType: string;
  confidence: number;
  evidence: string | null;
  detectedAt: string;
  expiresAt: string | null;
  memberId: string;
  entryId: string;
  entryKind: string;
  entrySummary: string | null;
  fieldToneSnapshot: string | null;
  relationshipId: string;
  counterpartLabel: string;
  realm: 'outer' | 'inner' | 'transpersonal';
  bondType: string | null;
  reviewVerdict: Verdict | null;
  reviewNote: string | null;
  reviewAt: string | null;
}

function formatDateTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function formatPatternType(id: string): string {
  return id.replace(/_/g, ' ');
}

export default function RelationalPatternsPage() {
  const [rows, setRows] = useState<RelationalPatternRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterValue>('all');
  const [selected, setSelected] = useState<RelationalPatternRow | null>(null);

  async function loadRows() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/founder/relational-patterns');
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      const data = await res.json();
      setRows(data.rows ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRows();
  }, []);

  const filteredRows = useMemo(() => {
    if (filter === 'all') return rows;
    if (filter === 'unreviewed') return rows.filter((r) => r.reviewVerdict === null);
    return rows.filter((r) => r.reviewVerdict === filter);
  }, [rows, filter]);

  const counts = useMemo(() => {
    return {
      total: rows.length,
      unreviewed: rows.filter((r) => r.reviewVerdict === null).length,
    };
  }, [rows]);

  function handleSaved(updated: RelationalPatternRow) {
    setRows((prev) =>
      prev.map((r) => (r.patternRowId === updated.patternRowId ? updated : r))
    );
    setSelected(updated);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[var(--sl-text-primary)] flex items-center gap-2">
            <Eye className="w-6 h-6" />
            Relational Patterns Review
          </h1>
          <p className="text-sm text-[var(--sl-text-muted)]">
            {counts.total} total · {counts.unreviewed} unreviewed
          </p>
        </div>
        <FilterBar value={filter} onChange={setFilter} counts={counts} />
      </div>

      {loading ? (
        <div className="rounded-lg border border-[var(--sl-border-subtle)] bg-[var(--sl-bg-surface)] p-8 text-center">
          <Loader2 className="w-5 h-5 mx-auto text-[var(--sl-text-muted)] animate-spin" />
          <p className="text-sm text-[var(--sl-text-muted)] mt-2">Loading patterns…</p>
        </div>
      ) : error ? (
        <div className="rounded-lg border border-rose-500/50 bg-rose-500/5 p-4">
          <p className="text-sm text-rose-300">Failed to load: {error}</p>
        </div>
      ) : filteredRows.length === 0 ? (
        <div className="rounded-lg border border-[var(--sl-border-subtle)] bg-[var(--sl-bg-surface)] p-8 text-center">
          <Eye className="w-8 h-8 mx-auto text-[var(--sl-text-muted)] mb-2" />
          <p className="text-sm text-[var(--sl-text-muted)]">
            {filter === 'all'
              ? 'No pattern observations yet. Data accumulates as the relational observer fires on real conversations.'
              : 'No patterns match this filter.'}
          </p>
        </div>
      ) : (
        <PatternsTable rows={filteredRows} onSelect={setSelected} />
      )}

      {selected && (
        <ReviewDrawer
          row={selected}
          onClose={() => setSelected(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}

// ─── Filter bar ────────────────────────────────────────────────────────────

function FilterBar({
  value,
  onChange,
  counts,
}: {
  value: FilterValue;
  onChange: (v: FilterValue) => void;
  counts: { total: number; unreviewed: number };
}) {
  const options: Array<{ id: FilterValue; label: string }> = [
    { id: 'all', label: `All (${counts.total})` },
    { id: 'unreviewed', label: `Unreviewed (${counts.unreviewed})` },
    { id: 'valid', label: 'Valid' },
    { id: 'false_positive', label: 'False positive' },
    { id: 'unclear', label: 'Unclear' },
    { id: 'needs_followup', label: 'Follow-up' },
  ];

  return (
    <div className="flex flex-wrap gap-1 rounded-lg border border-[var(--sl-border-subtle)] bg-[var(--sl-bg-surface)] p-1">
      {options.map((opt) => {
        const active = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              active
                ? 'bg-[var(--sl-bg-elevated)] text-[var(--sl-text-primary)]'
                : 'text-[var(--sl-text-muted)] hover:text-[var(--sl-text-secondary)]'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Table ─────────────────────────────────────────────────────────────────

function PatternsTable({
  rows,
  onSelect,
}: {
  rows: RelationalPatternRow[];
  onSelect: (row: RelationalPatternRow) => void;
}) {
  return (
    <div className="rounded-lg border border-[var(--sl-border-subtle)] bg-[var(--sl-bg-surface)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--sl-border-subtle)] text-left text-xs uppercase tracking-wider text-[var(--sl-text-muted)]">
              <th className="px-3 py-2 font-medium">Detected</th>
              <th className="px-3 py-2 font-medium">Counterpart</th>
              <th className="px-3 py-2 font-medium">Pattern</th>
              <th className="px-3 py-2 font-medium">Conf</th>
              <th className="px-3 py-2 font-medium">Tone</th>
              <th className="px-3 py-2 font-medium">Kind</th>
              <th className="px-3 py-2 font-medium">Verdict</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.patternRowId}
                onClick={() => onSelect(r)}
                className="border-b border-[var(--sl-border-subtle)]/50 last:border-b-0 hover:bg-[var(--sl-bg-elevated)]/50 cursor-pointer transition-colors"
              >
                <td className="px-3 py-2 text-[var(--sl-text-secondary)] whitespace-nowrap">
                  {formatDateTime(r.detectedAt)}
                </td>
                <td className="px-3 py-2 text-[var(--sl-text-primary)]">
                  {r.counterpartLabel}
                </td>
                <td className="px-3 py-2 text-[var(--sl-text-primary)]">
                  {formatPatternType(r.patternType)}
                </td>
                <td className="px-3 py-2 text-[var(--sl-text-secondary)] tabular-nums">
                  {r.confidence.toFixed(2)}
                </td>
                <td className="px-3 py-2 text-[var(--sl-text-muted)]">
                  {r.fieldToneSnapshot ?? '—'}
                </td>
                <td className="px-3 py-2 text-[var(--sl-text-muted)]">
                  {r.entryKind}
                </td>
                <td className="px-3 py-2">
                  {r.reviewVerdict ? (
                    <span
                      className={`inline-block px-2 py-0.5 rounded border text-xs ${VERDICT_BADGE[r.reviewVerdict]}`}
                    >
                      {VERDICT_LABELS[r.reviewVerdict]}
                    </span>
                  ) : (
                    <span className="text-[var(--sl-text-muted)] text-xs">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Drawer ────────────────────────────────────────────────────────────────

function ReviewDrawer({
  row,
  onClose,
  onSaved,
}: {
  row: RelationalPatternRow;
  onClose: () => void;
  onSaved: (updated: RelationalPatternRow) => void;
}) {
  const [verdict, setVerdict] = useState<Verdict | ''>(row.reviewVerdict ?? '');
  const [note, setNote] = useState<string>(row.reviewNote ?? '');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Reset form state when a different row is selected
  useEffect(() => {
    setVerdict(row.reviewVerdict ?? '');
    setNote(row.reviewNote ?? '');
    setSaveError(null);
  }, [row.patternRowId, row.reviewVerdict, row.reviewNote]);

  async function handleSave() {
    if (!verdict) {
      setSaveError('Pick a verdict before saving');
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch('/api/founder/relational-patterns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pattern_id: row.patternRowId,
          verdict,
          note: note.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      const data = await res.json();
      onSaved({
        ...row,
        reviewVerdict: data.review.verdict,
        reviewNote: data.review.note,
        reviewAt: data.review.reviewedAt,
      });
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/40"
      />
      {/* Drawer */}
      <aside className="fixed top-0 right-0 z-50 h-screen w-full sm:w-[420px] bg-[var(--sl-bg-canvas-deep)] border-l border-[var(--sl-border-subtle)] shadow-xl overflow-y-auto">
        <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-[var(--sl-bg-canvas-deep)] border-b border-[var(--sl-border-subtle)]">
          <h2 className="text-sm font-semibold text-[var(--sl-text-primary)]">
            Pattern review
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded text-[var(--sl-text-muted)] hover:bg-[var(--sl-bg-elevated)]"
            aria-label="Close drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-4 py-4 space-y-5">
          {/* Pattern row */}
          <Section title="Pattern">
            <Field label="Type">{formatPatternType(row.patternType)}</Field>
            <Field label="Confidence">{row.confidence.toFixed(2)}</Field>
            <Field label="Detected">{formatDateTime(row.detectedAt)}</Field>
            <Field label="Expires">
              {row.expiresAt ? formatDateTime(row.expiresAt) : 'never'}
            </Field>
            {row.evidence && (
              <Field label="Evidence">
                <span className="font-mono text-xs">{row.evidence}</span>
              </Field>
            )}
          </Section>

          {/* Entry context */}
          <Section title="Entry context">
            <Field label="Kind">{row.entryKind}</Field>
            {row.fieldToneSnapshot && (
              <Field label="Tone">{row.fieldToneSnapshot}</Field>
            )}
            {row.entrySummary && (
              <Field label="Content">
                <span className="whitespace-pre-wrap">{row.entrySummary}</span>
              </Field>
            )}
          </Section>

          {/* Relationship context */}
          <Section title="Relationship">
            <Field label="Counterpart">{row.counterpartLabel}</Field>
            <Field label="Realm">{row.realm}</Field>
            {row.bondType && <Field label="Bond">{row.bondType}</Field>}
          </Section>

          {/* Review form */}
          <Section title="Review">
            <div className="space-y-2">
              {VERDICTS.map((v) => (
                <label key={v} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="verdict"
                    value={v}
                    checked={verdict === v}
                    onChange={() => setVerdict(v)}
                    className="accent-[var(--sl-accent-admin)]"
                  />
                  <span className="text-[var(--sl-text-primary)]">{VERDICT_LABELS[v]}</span>
                </label>
              ))}
            </div>
            <div className="mt-3">
              <label className="block text-xs uppercase tracking-wider text-[var(--sl-text-muted)] mb-1">
                Note
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="Optional context for this verdict"
                className="w-full rounded border border-[var(--sl-border-subtle)] bg-[var(--sl-bg-surface)] text-sm text-[var(--sl-text-primary)] px-2 py-1.5 focus:outline-none focus:border-[var(--sl-accent-admin)]"
              />
            </div>
            {saveError && (
              <p className="mt-2 text-xs text-rose-300">{saveError}</p>
            )}
            <button
              onClick={handleSave}
              disabled={saving || !verdict}
              className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 rounded bg-[var(--sl-accent-admin)] text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {row.reviewVerdict ? 'Update verdict' : 'Save verdict'}
            </button>
            {row.reviewAt && (
              <p className="mt-2 text-xs text-[var(--sl-text-muted)]">
                Last reviewed {formatDateTime(row.reviewAt)}
              </p>
            )}
          </Section>
        </div>
      </aside>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs uppercase tracking-wider text-[var(--sl-text-muted)] mb-2">
        {title}
      </h3>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[80px_1fr] gap-2 text-sm">
      <span className="text-[var(--sl-text-muted)] text-xs pt-0.5">{label}</span>
      <span className="text-[var(--sl-text-primary)] break-words">{children}</span>
    </div>
  );
}
