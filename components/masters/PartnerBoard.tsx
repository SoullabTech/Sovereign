'use client';

import { useEffect, useState } from 'react';

interface KanbanCard {
  id: string;
  field_slug: string;
  column_id: string;
  title: string;
  body: string | null;
  tags: string[];
  author_id: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  shared: boolean;
}

interface Palette {
  primary: string;
  background: string;
  text: string;
  accent?: string;
}

interface Props {
  viewerSlug: string;
  partnerSlug: string;
  palette: Palette;
}

const COLUMN_LABELS: Record<string, string> = {
  'in-progress': 'In Progress',
  'planned': 'Planned',
  'shipped': 'Shipped',
  'decision': 'Open Decisions',
};

const COLUMN_ORDER = ['in-progress', 'decision', 'planned', 'shipped'];

export default function PartnerBoard({ viewerSlug, partnerSlug, palette }: Props) {
  const [cards, setCards] = useState<KanbanCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // Add card state
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/fields/${partnerSlug}/kanban?shared=1`)
      .then((r) => r.json())
      .then((data) => {
        setCards(data.cards ?? []);
        setLastUpdated(new Date().toLocaleTimeString());
        setLoading(false);
      })
      .catch(() => {
        setError('Could not load board');
        setLoading(false);
      });
  }, [partnerSlug]);

  const cardsByColumn = COLUMN_ORDER.reduce<Record<string, KanbanCard[]>>((acc, col) => {
    acc[col] = cards.filter((c) => c.column_id === col);
    return acc;
  }, {});

  async function addCard(columnId: string) {
    if (!newTitle.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/fields/${partnerSlug}/kanban`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ column_id: columnId, title: newTitle, text: newBody || null }),
      });
      if (res.ok) {
        const { card } = await res.json();
        setCards((prev) => [...prev, card]);
        setNewTitle('');
        setNewBody('');
        setAddingTo(null);
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div style={{ color: `${palette.text}60`, fontFamily: 'sans-serif', fontSize: '0.85rem', padding: '2rem' }}>
        Loading board...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ color: '#e06060', fontFamily: 'sans-serif', fontSize: '0.85rem', padding: '2rem' }}>
        {error}
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 500, color: palette.text, letterSpacing: '0.04em' }}>
            Platform Work · Nathan&apos;s Board
          </h2>
          {lastUpdated && (
            <span style={{ fontSize: '0.7rem', color: `${palette.text}40`, marginTop: '0.2rem', display: 'block' }}>
              Updated {lastUpdated}
            </span>
          )}
        </div>
        <a
          href="https://nathan.soullab.life/operator"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: '0.7rem',
            color: palette.primary,
            textDecoration: 'none',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          Full View →
        </a>
      </div>

      {/* Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {COLUMN_ORDER.map((col) => (
          <div key={col} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {/* Column header */}
            <div style={{
              fontSize: '0.65rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: `${palette.text}50`,
              paddingBottom: '0.5rem',
              borderBottom: `1px solid ${palette.primary}25`,
            }}>
              {COLUMN_LABELS[col] ?? col}
              <span style={{ marginLeft: '0.4rem', opacity: 0.5 }}>({cardsByColumn[col].length})</span>
            </div>

            {/* Cards */}
            {cardsByColumn[col].map((card) => (
              <div
                key={card.id}
                style={{
                  padding: '0.75rem',
                  background: `${palette.primary}08`,
                  border: `1px solid ${palette.primary}20`,
                  borderRadius: '2px',
                }}
              >
                <p style={{ margin: 0, fontSize: '0.82rem', color: palette.text, fontWeight: 400, lineHeight: 1.4 }}>
                  {card.title}
                </p>
                {card.body && (
                  <p style={{ margin: '0.4rem 0 0', fontSize: '0.72rem', color: `${palette.text}55`, lineHeight: 1.5 }}>
                    {card.body}
                  </p>
                )}
                {card.tags?.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
                    {card.tags.map((tag, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: '0.6rem',
                          color: palette.primary,
                          background: `${palette.primary}15`,
                          padding: '0.1rem 0.4rem',
                          borderRadius: '2px',
                          letterSpacing: '0.05em',
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Add card — Kelly is founder, can add to partner board */}
            {viewerSlug === 'kelly' && (
              addingTo === col ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <input
                    autoFocus
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Card title"
                    style={{
                      background: `${palette.primary}10`,
                      border: `1px solid ${palette.primary}35`,
                      color: palette.text,
                      padding: '0.4rem 0.5rem',
                      fontSize: '0.78rem',
                      borderRadius: '2px',
                      outline: 'none',
                    }}
                  />
                  <textarea
                    value={newBody}
                    onChange={(e) => setNewBody(e.target.value)}
                    placeholder="Notes (optional)"
                    rows={2}
                    style={{
                      background: `${palette.primary}08`,
                      border: `1px solid ${palette.primary}25`,
                      color: palette.text,
                      padding: '0.4rem 0.5rem',
                      fontSize: '0.72rem',
                      borderRadius: '2px',
                      resize: 'none',
                      outline: 'none',
                    }}
                  />
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button
                      onClick={() => addCard(col)}
                      disabled={submitting || !newTitle.trim()}
                      style={{
                        flex: 1,
                        background: palette.primary,
                        color: palette.background,
                        border: 'none',
                        padding: '0.35rem',
                        fontSize: '0.72rem',
                        cursor: submitting ? 'wait' : 'pointer',
                        borderRadius: '2px',
                      }}
                    >
                      {submitting ? '...' : 'Add'}
                    </button>
                    <button
                      onClick={() => { setAddingTo(null); setNewTitle(''); setNewBody(''); }}
                      style={{
                        background: 'transparent',
                        color: `${palette.text}50`,
                        border: `1px solid ${palette.primary}20`,
                        padding: '0.35rem 0.5rem',
                        fontSize: '0.72rem',
                        cursor: 'pointer',
                        borderRadius: '2px',
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setAddingTo(col)}
                  style={{
                    background: 'transparent',
                    border: `1px dashed ${palette.primary}25`,
                    color: `${palette.text}35`,
                    padding: '0.4rem',
                    fontSize: '0.72rem',
                    cursor: 'pointer',
                    borderRadius: '2px',
                    textAlign: 'left',
                  }}
                >
                  + Add card
                </button>
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
