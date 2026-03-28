'use client';

import { useState, useEffect, useCallback } from 'react';

// ---------- types ----------

interface Idea {
  id: string;
  field_slug: string;
  title: string;
  summary: string | null;
  status: IdeaStatus;
  warmth: 'low' | 'medium' | 'high';
  origin: string | null;
  tags: string[];
  promoted_to_decision_id: string | null;
  promoted_to_kanban_id: string | null;
  promotion_reason: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // joined fields
  latest_content: string | null;
  latest_version: number | null;
  latest_iteration_at: string | null;
  latest_author_id: string | null;
  iteration_count: number;
}

interface Iteration {
  id: string;
  idea_id: string;
  version_number: number;
  content: string;
  author_id: string | null;
  created_at: string;
}

type IdeaStatus = 'spark' | 'developing' | 'intensifying' | 'ripe' | 'adopted' | 'parked' | 'composted';
type StatusFilter = 'all' | 'spark' | 'developing' | 'intensifying' | 'ripe';
type ViewMode = 'stream' | 'board';

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

// ---------- constants ----------

const STATUS_COLORS: Record<IdeaStatus, string> = {
  spark: '#F59E0B',
  developing: '#3B82F6',
  intensifying: '#EF4444',
  ripe: '#10B981',
  adopted: '#8B5CF6',
  parked: '#6B7280',
  composted: '#4B5563',
};

const STATUS_LABELS: Record<IdeaStatus, string> = {
  spark: 'Spark',
  developing: 'Developing',
  intensifying: 'Intensifying',
  ripe: 'Ripe',
  adopted: 'Adopted',
  parked: 'Parked',
  composted: 'Composted',
};

const WARMTH_DOTS: Record<string, string> = {
  low: '\u2022',
  medium: '\u2022\u2022',
  high: '\u2022\u2022\u2022',
};

const ORIGIN_OPTIONS = ['meeting', 'maia', 'personal', 'conversation'];

const ACTIVE_STATUSES: IdeaStatus[] = ['spark', 'developing', 'intensifying', 'ripe'];

const NEXT_STATUS: Partial<Record<IdeaStatus, IdeaStatus>> = {
  spark: 'developing',
  developing: 'intensifying',
  intensifying: 'ripe',
};

const EMPTY_FORM = {
  title: '',
  content: '',
  origin: 'meeting',
  warmth: 'low' as 'low' | 'medium' | 'high',
};

// ---------- helpers ----------

function isRecentlyShifted(updatedAt: string): boolean {
  const diff = Date.now() - new Date(updatedAt).getTime();
  return diff < 24 * 60 * 60 * 1000; // 24h
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatRelative(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

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

// ---------- sub-components ----------

function StatusBadge({ status }: { status: IdeaStatus }) {
  const color = STATUS_COLORS[status];
  const terminal = status === 'adopted' || status === 'parked' || status === 'composted';
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        fontSize: '11px',
        fontWeight: 500,
        color: terminal ? `${color}90` : color,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
      }}
    >
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
      {STATUS_LABELS[status]}
    </span>
  );
}

function WarmthIndicator({ warmth, palette }: { warmth: string; palette: Palette }) {
  const dots = WARMTH_DOTS[warmth] || WARMTH_DOTS.low;
  const color = warmth === 'high' ? '#F59E0B' : warmth === 'medium' ? '#D97706' : `${palette.text}30`;
  return (
    <span
      style={{
        fontSize: '14px',
        color,
        letterSpacing: '2px',
        fontWeight: 700,
      }}
      title={`Warmth: ${warmth}`}
    >
      {dots}
    </span>
  );
}

// ---------- IdeaCard ----------

function IdeaCard({
  idea,
  palette,
  onPatch,
  onDelete,
  onRefine,
  onPromote,
}: {
  idea: Idea;
  palette: Palette;
  onPatch: (id: string, patch: Partial<Idea>) => void;
  onDelete: (id: string) => void;
  onRefine: (id: string) => void;
  onPromote: (id: string) => void;
}) {
  const [showIterations, setShowIterations] = useState(false);
  const [iterations, setIterations] = useState<Iteration[]>([]);
  const [loadingIter, setLoadingIter] = useState(false);
  const [refineText, setRefineText] = useState('');
  const [refining, setRefining] = useState(false);
  const [submittingRefine, setSubmittingRefine] = useState(false);

  const border = `1px solid ${palette.primary}20`;
  const mutedText = `${palette.text}55`;
  const sectionBg = `${palette.primary}08`;
  const recentAccent = isRecentlyShifted(idea.updated_at) ? `3px solid ${palette.accent}60` : `3px solid transparent`;
  const isTerminal = idea.status === 'adopted' || idea.status === 'parked' || idea.status === 'composted';

  async function loadIterations() {
    if (iterations.length > 0) {
      setShowIterations((v) => !v);
      return;
    }
    setLoadingIter(true);
    const res = await fetch(`/api/fields/${idea.field_slug}/ideas/${idea.id}/iterations`);
    if (res.ok) {
      const data = await res.json();
      setIterations(data.iterations ?? []);
    }
    setLoadingIter(false);
    setShowIterations(true);
  }

  async function submitRefine() {
    if (!refineText.trim()) return;
    setSubmittingRefine(true);
    const res = await fetch(`/api/fields/${idea.field_slug}/ideas/${idea.id}/iterations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: refineText }),
    });
    if (res.ok) {
      setRefineText('');
      setRefining(false);
      // Reload iterations and parent
      setIterations([]);
      setShowIterations(false);
      onRefine(idea.id);
    }
    setSubmittingRefine(false);
  }

  const nextStatus = NEXT_STATUS[idea.status as keyof typeof NEXT_STATUS];

  return (
    <div
      style={{
        background: sectionBg,
        border,
        borderLeft: recentAccent,
        borderRadius: '3px',
        padding: '16px',
        opacity: isTerminal ? 0.6 : 1,
      }}
    >
      {/* Header row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
          marginBottom: '8px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <StatusBadge status={idea.status} />
          <WarmthIndicator warmth={idea.warmth} palette={palette} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {idea.origin && (
            <span style={{ fontSize: '10px', color: mutedText, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {idea.origin}
            </span>
          )}
          <span style={{ fontSize: '10px', color: mutedText }}>
            {formatRelative(idea.updated_at)}
          </span>
          {!isTerminal && (
            <button
              onClick={() => onDelete(idea.id)}
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
              x
            </button>
          )}
        </div>
      </div>

      {/* Title */}
      <h3
        style={{
          margin: '0 0 6px',
          fontSize: '14px',
          fontWeight: 500,
          color: palette.text,
          lineHeight: 1.4,
        }}
      >
        {idea.title}
      </h3>

      {/* Latest iteration preview */}
      {idea.latest_content && (
        <p
          style={{
            margin: '0 0 10px',
            fontSize: '13px',
            color: `${palette.text}80`,
            lineHeight: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {idea.latest_content}
        </p>
      )}

      {/* Metadata line */}
      <div style={{ marginBottom: '10px' }}>
        <button
          onClick={() => void loadIterations()}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: mutedText,
            fontSize: '11px',
            padding: 0,
            letterSpacing: '0.03em',
          }}
        >
          {showIterations ? '\u25BE' : '\u25B8'}{' '}
          {idea.iteration_count} iteration{idea.iteration_count !== 1 ? 's' : ''}
          {idea.origin ? ` \u00B7 origin: ${idea.origin}` : ''}
          {idea.latest_version ? ` \u00B7 v${idea.latest_version}` : ''}
        </button>

        {/* Iteration trail */}
        {showIterations && (
          <div style={{ marginTop: '8px', paddingLeft: '10px', borderLeft: `2px solid ${palette.primary}30` }}>
            {loadingIter ? (
              <p style={{ fontSize: '12px', color: mutedText }}>Loading...</p>
            ) : (
              iterations.map((iter) => (
                <div
                  key={iter.id}
                  style={{
                    marginBottom: '8px',
                    paddingBottom: '8px',
                    borderBottom: `1px solid ${palette.primary}10`,
                  }}
                >
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: palette.accent }}>
                      v{iter.version_number}
                    </span>
                    <span style={{ fontSize: '10px', color: mutedText }}>
                      {formatDate(iter.created_at)}
                    </span>
                  </div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '12px',
                      color: `${palette.text}80`,
                      lineHeight: 1.5,
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {iter.content}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Refine inline */}
      {refining && !isTerminal && (
        <div style={{ marginBottom: '10px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
          <textarea
            value={refineText}
            onChange={(e) => setRefineText(e.target.value)}
            rows={3}
            placeholder="What has shifted or clarified?"
            style={{ ...inputStyle(palette), flex: 1, resize: 'vertical', lineHeight: 1.5 }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <button
              onClick={() => void submitRefine()}
              disabled={submittingRefine || !refineText.trim()}
              style={{
                ...smallActionStyle(palette.primary, palette.background),
                opacity: submittingRefine || !refineText.trim() ? 0.5 : 1,
              }}
            >
              {submittingRefine ? '...' : 'Save'}
            </button>
            <button
              onClick={() => { setRefining(false); setRefineText(''); }}
              style={smallActionStyle(`${palette.text}15`, mutedText)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Action row */}
      {!isTerminal && (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setRefining(true)}
            style={smallActionStyle(`${palette.primary}25`, palette.text)}
          >
            Refine
          </button>
          {nextStatus && (
            <button
              onClick={() => onPatch(idea.id, { status: nextStatus })}
              style={smallActionStyle(`${STATUS_COLORS[nextStatus]}30`, STATUS_COLORS[nextStatus])}
            >
              Advance Stage
            </button>
          )}
          {/* Warmth toggle */}
          <button
            onClick={() => {
              const cycle = { low: 'medium', medium: 'high', high: 'low' } as const;
              onPatch(idea.id, { warmth: cycle[idea.warmth] });
            }}
            style={smallActionStyle(`${palette.text}15`, mutedText)}
          >
            Warmth: {idea.warmth}
          </button>
          {idea.status === 'ripe' && (
            <button
              onClick={() => onPromote(idea.id)}
              style={smallActionStyle('#8B5CF6', '#fff')}
            >
              Forge into Decision
            </button>
          )}
          <button
            onClick={() => onPatch(idea.id, { status: 'parked' })}
            style={smallActionStyle(`${palette.text}15`, mutedText)}
          >
            Park
          </button>
        </div>
      )}

      {/* Adopted link */}
      {idea.status === 'adopted' && idea.promoted_to_decision_id && (
        <p style={{ margin: '8px 0 0', fontSize: '11px', color: '#8B5CF6' }}>
          Forged into decision
        </p>
      )}
    </div>
  );
}

// ---------- main component ----------

export default function IdeaField({ fieldSlug, palette }: Props) {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('stream');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [promoteId, setPromoteId] = useState<string | null>(null);
  const [promoteReason, setPromoteReason] = useState('');
  const [promoting, setPromoting] = useState(false);

  const mutedText = `${palette.text}55`;
  const border = `1px solid ${palette.primary}20`;
  const sectionBg = `${palette.primary}08`;

  const fetchIdeas = useCallback(async () => {
    setLoading(true);
    const qs = statusFilter === 'all' ? '' : `?status=${statusFilter}`;
    const res = await fetch(`/api/fields/${fieldSlug}/ideas${qs}`);
    if (res.ok) {
      const data = await res.json();
      setIdeas(data.ideas ?? []);
    }
    setLoading(false);
  }, [fieldSlug, statusFilter]);

  useEffect(() => {
    void fetchIdeas();
  }, [fetchIdeas]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;
    setSubmitting(true);
    const res = await fetch(`/api/fields/${fieldSlug}/ideas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: form.title,
        content: form.content,
        origin: form.origin,
        warmth: form.warmth,
      }),
    });
    if (res.ok) {
      setForm(EMPTY_FORM);
      setShowForm(false);
      void fetchIdeas();
    }
    setSubmitting(false);
  }

  async function patchIdea(id: string, patch: Partial<Idea>) {
    const res = await fetch(`/api/fields/${fieldSlug}/ideas/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    if (res.ok) void fetchIdeas();
  }

  async function deleteIdea(id: string) {
    await fetch(`/api/fields/${fieldSlug}/ideas/${id}`, { method: 'DELETE' });
    void fetchIdeas();
  }

  async function handlePromote() {
    if (!promoteId || !promoteReason.trim()) return;
    setPromoting(true);
    const res = await fetch(`/api/fields/${fieldSlug}/ideas/${promoteId}/promote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target: 'decision', reason: promoteReason }),
    });
    if (res.ok) {
      setPromoteId(null);
      setPromoteReason('');
      void fetchIdeas();
    }
    setPromoting(false);
  }

  const filterTabs: { id: StatusFilter; label: string; tooltip: string }[] = [
    { id: 'all', label: 'All', tooltip: 'All ideas across every stage' },
    { id: 'spark', label: 'Spark', tooltip: 'Raw, fragile, just emerging — the first glimmer of something' },
    { id: 'developing', label: 'Developing', tooltip: 'Taking shape — adding context, early iterations, finding form' },
    { id: 'intensifying', label: 'Intensifying', tooltip: 'Gaining energy — keeps recurring, attracting attention' },
    { id: 'ripe', label: 'Ripe', tooltip: 'Ready to harvest — mature enough to forge into a decision' },
  ];

  // Board grouping
  const boardColumns: { status: IdeaStatus; label: string }[] = [
    { status: 'spark', label: 'Spark' },
    { status: 'developing', label: 'Developing' },
    { status: 'intensifying', label: 'Intensifying' },
    { status: 'ripe', label: 'Ripe' },
  ];

  return (
    <div style={{ fontFamily: 'sans-serif', color: palette.text }}>
      {/* Header */}
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
            Idea Field
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: mutedText, fontStyle: 'italic' }}>
            What is trying to emerge here?
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* View toggle */}
          <button
            onClick={() => setViewMode(viewMode === 'stream' ? 'board' : 'stream')}
            style={{
              background: `${palette.primary}10`,
              border: `1px solid ${palette.primary}20`,
              borderRadius: '3px',
              padding: '4px 8px',
              fontSize: '11px',
              cursor: 'pointer',
              color: mutedText,
            }}
            title={viewMode === 'stream' ? 'Board view — ideas arranged by lifecycle stage' : 'Stream view — ideas ordered by aliveness and recency'}
          >
            {viewMode === 'stream' ? '\u2630' : '\u2261'}
          </button>

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
                title={tab.tooltip}
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

          {/* Seed Idea */}
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
            {showForm ? 'Cancel' : '+ Seed Idea'}
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
          <div>
            <label style={{ fontSize: '11px', color: mutedText, display: 'block', marginBottom: '4px' }}>
              What is the idea? *
            </label>
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              required
              placeholder="Name or question for this idea"
              style={inputStyle(palette)}
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', color: mutedText, display: 'block', marginBottom: '4px' }}>
              First thought *
            </label>
            <textarea
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              required
              rows={3}
              placeholder="The initial seed — what are you noticing?"
              style={{ ...inputStyle(palette), resize: 'vertical', lineHeight: 1.5 }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '11px', color: mutedText, display: 'block', marginBottom: '4px' }}>
                Origin
              </label>
              <select
                value={form.origin}
                onChange={(e) => setForm((f) => ({ ...f, origin: e.target.value }))}
                style={inputStyle(palette)}
              >
                {ORIGIN_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '11px', color: mutedText, display: 'block', marginBottom: '4px' }}>
                Warmth
              </label>
              <select
                value={form.warmth}
                onChange={(e) => setForm((f) => ({ ...f, warmth: e.target.value as 'low' | 'medium' | 'high' }))}
                style={inputStyle(palette)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button
                type="submit"
                disabled={submitting || !form.title.trim() || !form.content.trim()}
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
                  opacity: submitting || !form.title.trim() || !form.content.trim() ? 0.5 : 1,
                }}
              >
                {submitting ? 'Seeding...' : 'Seed Idea'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Promotion prompt */}
      {promoteId && (
        <div
          style={{
            background: '#8B5CF610',
            border: '1px solid #8B5CF630',
            borderRadius: '3px',
            padding: '16px',
            marginBottom: '20px',
          }}
        >
          <p style={{ margin: '0 0 8px', fontSize: '13px', color: palette.text, fontWeight: 500 }}>
            What makes this idea ready for decision?
          </p>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
            <textarea
              value={promoteReason}
              onChange={(e) => setPromoteReason(e.target.value)}
              rows={2}
              placeholder="The reason this is ready to be forged into a decision..."
              style={{ ...inputStyle(palette), flex: 1, resize: 'vertical', lineHeight: 1.5 }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <button
                onClick={() => void handlePromote()}
                disabled={promoting || !promoteReason.trim()}
                style={{
                  ...smallActionStyle('#8B5CF6', '#fff'),
                  opacity: promoting || !promoteReason.trim() ? 0.5 : 1,
                }}
              >
                {promoting ? '...' : 'Forge'}
              </button>
              <button
                onClick={() => { setPromoteId(null); setPromoteReason(''); }}
                style={smallActionStyle(`${palette.text}15`, mutedText)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <p style={{ fontSize: '13px', color: mutedText, padding: '16px 0' }}>Loading...</p>
      ) : ideas.length === 0 ? (
        <p style={{ fontSize: '13px', color: mutedText, padding: '16px 0' }}>
          No ideas {statusFilter !== 'all' ? `with status "${statusFilter}"` : ''} yet. Seed one to begin.
        </p>
      ) : viewMode === 'stream' ? (
        /* Stream view */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {ideas.map((idea) => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              palette={palette}
              onPatch={(id, patch) => void patchIdea(id, patch)}
              onDelete={(id) => void deleteIdea(id)}
              onRefine={() => void fetchIdeas()}
              onPromote={(id) => setPromoteId(id)}
            />
          ))}
        </div>
      ) : (
        /* Board view */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '12px',
            alignItems: 'start',
          }}
        >
          {boardColumns.map((col) => {
            const colIdeas = ideas.filter((i) => i.status === col.status);
            return (
              <div key={col.status}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '10px',
                    paddingBottom: '6px',
                    borderBottom: `2px solid ${STATUS_COLORS[col.status]}40`,
                  }}
                >
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: STATUS_COLORS[col.status],
                    }}
                  />
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      color: palette.text,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {col.label}
                  </span>
                  <span style={{ fontSize: '11px', color: mutedText }}>
                    {colIdeas.length}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {colIdeas.length === 0 ? (
                    <p style={{ fontSize: '11px', color: `${palette.text}25`, textAlign: 'center', padding: '16px 0' }}>
                      --
                    </p>
                  ) : (
                    colIdeas.map((idea) => (
                      <IdeaCard
                        key={idea.id}
                        idea={idea}
                        palette={palette}
                        onPatch={(id, patch) => void patchIdea(id, patch)}
                        onDelete={(id) => void deleteIdea(id)}
                        onRefine={() => void fetchIdeas()}
                        onPromote={(id) => setPromoteId(id)}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
