'use client';

import { useState, useEffect, useCallback } from 'react';

interface Decision {
  id: string;
  field_slug: string;
  title: string;
  context: string | null;
  recommendation: string | null;
  owner: string | null;
  status: 'open' | 'decided' | 'deferred' | 'superseded';
  deadline: string | null;
  decided_at: string | null;
  decided_by: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

interface Palette {
  primary: string;
  text: string;
  background: string;
  accent: string;
}

interface Props {
  fieldSlug: string;
  palette: Palette;
}

type StatusFilter = 'all' | 'open' | 'decided' | 'deferred';

const STATUS_COLORS: Record<Decision['status'], string> = {
  open: '#D97706',
  decided: '#16A34A',
  deferred: '#6B7280',
  superseded: '#4B5563',
};

const STATUS_LABELS: Record<Decision['status'], string> = {
  open: 'Open',
  decided: 'Decided',
  deferred: 'Deferred',
  superseded: 'Superseded',
};

function StatusBadge({ status, palette }: { status: Decision['status']; palette: Palette }) {
  const color = STATUS_COLORS[status];
  const isSuperseded = status === 'superseded';
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        fontSize: '11px',
        fontWeight: 500,
        color: isSuperseded ? `${palette.text}50` : color,
        textDecoration: isSuperseded ? 'line-through' : 'none',
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
      }}
    >
      {!isSuperseded && (
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: color,
            display: 'inline-block',
            flexShrink: 0,
          }}
        />
      )}
      {STATUS_LABELS[status]}
    </span>
  );
}

const EMPTY_FORM = {
  title: '',
  owner: '',
  context: '',
  recommendation: '',
  deadline: '',
  status: 'open' as Decision['status'],
};

export default function DecisionLedger({ fieldSlug, palette }: Props) {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [expandedContext, setExpandedContext] = useState<Set<string>>(new Set());
  const [editingRec, setEditingRec] = useState<Record<string, string>>({});

  const fetchDecisions = useCallback(async () => {
    setLoading(true);
    const qs = statusFilter === 'all' ? '' : `?status=${statusFilter}`;
    const res = await fetch(`/api/fields/${fieldSlug}/decisions${qs}`);
    if (res.ok) {
      const data = await res.json();
      setDecisions(data.decisions ?? []);
    }
    setLoading(false);
  }, [fieldSlug, statusFilter]);

  useEffect(() => {
    void fetchDecisions();
  }, [fetchDecisions]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSubmitting(true);
    const res = await fetch(`/api/fields/${fieldSlug}/decisions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: form.title,
        owner: form.owner || null,
        context: form.context || null,
        recommendation: form.recommendation || null,
        deadline: form.deadline || null,
        status: form.status,
      }),
    });
    if (res.ok) {
      setForm(EMPTY_FORM);
      setShowForm(false);
      void fetchDecisions();
    }
    setSubmitting(false);
  }

  async function patchDecision(id: string, patch: Partial<Decision>) {
    const res = await fetch(`/api/fields/${fieldSlug}/decisions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    if (res.ok) {
      void fetchDecisions();
    }
  }

  async function deleteDecision(id: string) {
    await fetch(`/api/fields/${fieldSlug}/decisions/${id}`, { method: 'DELETE' });
    void fetchDecisions();
  }

  function toggleContext(id: string) {
    setExpandedContext((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function startEditRec(d: Decision) {
    setEditingRec((prev) => ({ ...prev, [d.id]: d.recommendation ?? '' }));
  }

  async function saveRec(id: string) {
    await patchDecision(id, { recommendation: editingRec[id] });
    setEditingRec((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  const border = `1px solid ${palette.primary}20`;
  const mutedText = `${palette.text}55`;
  const sectionBg = `${palette.primary}08`;

  const filterTabs: { id: StatusFilter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'open', label: 'Open' },
    { id: 'decided', label: 'Decided' },
    { id: 'deferred', label: 'Deferred' },
  ];

  return (
    <div style={{ fontFamily: 'sans-serif', color: palette.text }}>
      {/* Header row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: 400,
              color: palette.text,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            Decision Ledger
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: mutedText }}>
            Structured tracking — open questions, resolutions, deferred items
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Filter tabs */}
          <div
            style={{
              display: 'flex',
              background: `${palette.primary}10`,
              borderRadius: '4px',
              padding: '2px',
              gap: '2px',
            }}
          >
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                style={{
                  background: statusFilter === tab.id ? palette.primary : 'transparent',
                  border: 'none',
                  borderRadius: '3px',
                  padding: '4px 10px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  color: statusFilter === tab.id ? palette.background : palette.text,
                  fontWeight: statusFilter === tab.id ? 600 : 400,
                  opacity: statusFilter === tab.id ? 1 : 0.6,
                  transition: 'all 0.12s',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Add Decision */}
          <button
            onClick={() => setShowForm((v) => !v)}
            style={{
              background: showForm ? `${palette.accent}30` : `${palette.primary}15`,
              border: `1px solid ${palette.primary}30`,
              borderRadius: '4px',
              padding: '5px 12px',
              fontSize: '12px',
              cursor: 'pointer',
              color: palette.text,
              fontWeight: 500,
              transition: 'all 0.12s',
            }}
          >
            {showForm ? 'Cancel' : '+ Add Decision'}
          </button>
        </div>
      </div>

      {/* Inline form */}
      {showForm && (
        <form
          onSubmit={(e) => void handleCreate(e)}
          style={{
            background: sectionBg,
            border,
            borderRadius: '3px',
            padding: '16px',
            marginBottom: '20px',
            display: 'grid',
            gap: '12px',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '11px', color: mutedText, display: 'block', marginBottom: '4px' }}>
                Title *
              </label>
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
                placeholder="Decision question or title"
                style={inputStyle(palette)}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: mutedText, display: 'block', marginBottom: '4px' }}>
                Owner
              </label>
              <input
                value={form.owner}
                onChange={(e) => setForm((f) => ({ ...f, owner: e.target.value }))}
                placeholder="e.g. Nathan, Kelly, Kelly + Nathan"
                style={inputStyle(palette)}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '11px', color: mutedText, display: 'block', marginBottom: '4px' }}>
              Context
            </label>
            <textarea
              value={form.context}
              onChange={(e) => setForm((f) => ({ ...f, context: e.target.value }))}
              rows={3}
              placeholder="What is the decision space? What constraints apply?"
              style={{ ...inputStyle(palette), resize: 'vertical', lineHeight: 1.5 }}
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', color: mutedText, display: 'block', marginBottom: '4px' }}>
              Recommendation
            </label>
            <textarea
              value={form.recommendation}
              onChange={(e) => setForm((f) => ({ ...f, recommendation: e.target.value }))}
              rows={2}
              placeholder="Optional — proposed path forward"
              style={{ ...inputStyle(palette), resize: 'vertical', lineHeight: 1.5 }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '11px', color: mutedText, display: 'block', marginBottom: '4px' }}>
                Deadline
              </label>
              <input
                type="date"
                value={form.deadline}
                onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
                style={inputStyle(palette)}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: mutedText, display: 'block', marginBottom: '4px' }}>
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm((f) => ({ ...f, status: e.target.value as Decision['status'] }))
                }
                style={inputStyle(palette)}
              >
                <option value="open">Open</option>
                <option value="deferred">Deferred</option>
                <option value="decided">Decided</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button
                type="submit"
                disabled={submitting || !form.title.trim()}
                style={{
                  width: '100%',
                  background: palette.primary,
                  border: 'none',
                  borderRadius: '3px',
                  padding: '7px 14px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  color: palette.background,
                  fontWeight: 600,
                  opacity: submitting || !form.title.trim() ? 0.5 : 1,
                }}
              >
                {submitting ? 'Adding...' : 'Add Decision'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Decision cards */}
      {loading ? (
        <p style={{ fontSize: '13px', color: mutedText, padding: '16px 0' }}>Loading...</p>
      ) : decisions.length === 0 ? (
        <p style={{ fontSize: '13px', color: mutedText, padding: '16px 0' }}>
          No decisions {statusFilter !== 'all' ? `with status "${statusFilter}"` : ''} yet.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {decisions.map((d) => (
            <div
              key={d.id}
              style={{
                background: sectionBg,
                border,
                borderRadius: '3px',
                padding: '16px',
                opacity: d.status === 'superseded' ? 0.55 : 1,
              }}
            >
              {/* Card header row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '12px',
                  marginBottom: '10px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <StatusBadge status={d.status} palette={palette} />
                  {d.owner && (
                    <span style={{ fontSize: '11px', color: mutedText }}>
                      {d.owner}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  {d.deadline && (
                    <span
                      style={{
                        fontSize: '11px',
                        color: isOverdue(d.deadline) && d.status === 'open' ? '#EF4444' : mutedText,
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {formatDate(d.deadline)}
                    </span>
                  )}
                  {/* Delete */}
                  <button
                    onClick={() => void deleteDecision(d.id)}
                    title="Remove"
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: mutedText,
                      fontSize: '14px',
                      lineHeight: 1,
                      padding: '0 2px',
                    }}
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Title */}
              <h3
                style={{
                  margin: '0 0 10px',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: palette.text,
                  lineHeight: 1.4,
                  textDecoration: d.status === 'superseded' ? 'line-through' : 'none',
                }}
              >
                {d.title}
              </h3>

              {/* Context — collapsed by default */}
              {d.context && (
                <div style={{ marginBottom: '10px' }}>
                  <button
                    onClick={() => toggleContext(d.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: mutedText,
                      fontSize: '11px',
                      padding: 0,
                      marginBottom: '6px',
                      letterSpacing: '0.03em',
                    }}
                  >
                    {expandedContext.has(d.id) ? '▾ Context' : '▸ Context'}
                  </button>
                  {expandedContext.has(d.id) && (
                    <p
                      style={{
                        margin: 0,
                        fontSize: '13px',
                        color: `${palette.text}80`,
                        lineHeight: 1.6,
                        borderLeft: `2px solid ${palette.primary}30`,
                        paddingLeft: '10px',
                      }}
                    >
                      {d.context}
                    </p>
                  )}
                </div>
              )}

              {/* Recommendation */}
              <div style={{ marginBottom: '12px' }}>
                <span style={{ fontSize: '11px', color: mutedText, display: 'block', marginBottom: '4px' }}>
                  Recommendation
                </span>
                {d.id in editingRec ? (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <textarea
                      value={editingRec[d.id]}
                      onChange={(e) =>
                        setEditingRec((prev) => ({ ...prev, [d.id]: e.target.value }))
                      }
                      rows={2}
                      style={{ ...inputStyle(palette), flex: 1, resize: 'vertical', lineHeight: 1.5 }}
                    />
                    <button
                      onClick={() => void saveRec(d.id)}
                      style={smallActionStyle(palette.primary, palette.background)}
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <p
                    style={{
                      margin: 0,
                      fontSize: '13px',
                      color: d.recommendation ? palette.text : mutedText,
                      fontStyle: d.recommendation ? 'normal' : 'italic',
                      lineHeight: 1.5,
                    }}
                  >
                    {d.recommendation ?? '— not yet set'}
                  </p>
                )}
              </div>

              {/* Action row */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {d.status === 'open' && (
                  <button
                    onClick={() => void patchDecision(d.id, { status: 'decided' })}
                    style={smallActionStyle('#16A34A', '#fff')}
                  >
                    Mark Decided
                  </button>
                )}
                {d.status === 'open' && (
                  <button
                    onClick={() => void patchDecision(d.id, { status: 'deferred' })}
                    style={smallActionStyle('#4B5563', '#fff')}
                  >
                    Defer
                  </button>
                )}
                {d.status === 'deferred' && (
                  <button
                    onClick={() => void patchDecision(d.id, { status: 'open' })}
                    style={smallActionStyle(palette.accent, '#fff')}
                  >
                    Reopen
                  </button>
                )}
                {d.status !== 'superseded' && (
                  <button
                    onClick={() => startEditRec(d)}
                    style={smallActionStyle(`${palette.primary}40`, palette.text)}
                  >
                    {d.id in editingRec ? 'Editing...' : 'Edit Rec'}
                  </button>
                )}
                {d.status === 'decided' && (
                  <button
                    onClick={() => void patchDecision(d.id, { status: 'superseded' })}
                    style={smallActionStyle(`${palette.text}20`, mutedText)}
                  >
                    Supersede
                  </button>
                )}
              </div>

              {/* decided_at timestamp */}
              {d.decided_at && (
                <p style={{ margin: '10px 0 0', fontSize: '11px', color: mutedText }}>
                  Decided {new Date(d.decided_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- helpers ----------

function inputStyle(palette: Palette): React.CSSProperties {
  return {
    width: '100%',
    background: `${palette.primary}10`,
    border: `1px solid ${palette.primary}25`,
    borderRadius: '3px',
    padding: '6px 8px',
    fontSize: '13px',
    color: palette.text,
    outline: 'none',
    boxSizing: 'border-box',
  };
}

function smallActionStyle(bg: string, color: string): React.CSSProperties {
  return {
    background: bg,
    border: 'none',
    borderRadius: '3px',
    padding: '4px 10px',
    fontSize: '11px',
    cursor: 'pointer',
    color,
    fontWeight: 500,
    transition: 'opacity 0.1s',
  };
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function isOverdue(dateStr: string): boolean {
  return new Date(dateStr + 'T00:00:00') < new Date();
}
