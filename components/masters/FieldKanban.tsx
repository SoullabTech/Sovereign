'use client';
import { useState, useEffect, useCallback } from 'react';

interface KanbanCard {
  id: string;
  column_id: string;
  title: string;
  body: string | null;
  tags: string[];
  created_at: string;
}

const COLUMNS = [
  { id: 'in-progress', label: 'In Progress' },
  { id: 'planned', label: 'Planned' },
  { id: 'shipped', label: 'Shipped' },
  { id: 'decision', label: 'Open Decisions' },
  { id: 'insight', label: 'Insights' },
];

interface Props {
  fieldSlug: string;
  palette: { primary: string; text: string; background: string; accent: string };
}

interface AddFormState {
  title: string;
  body: string;
  submitting: boolean;
}

function TagBadge({ tag, palette }: { tag: string; palette: Props['palette'] }) {
  return (
    <span
      style={{
        display: 'inline-block',
        fontSize: '10px',
        padding: '1px 7px',
        borderRadius: '10px',
        backgroundColor: `${palette.primary}20`,
        color: palette.primary,
        letterSpacing: '0.03em',
        marginRight: '4px',
        marginTop: '4px',
      }}
    >
      {tag}
    </span>
  );
}

function KanbanCardView({
  card,
  palette,
  otherColumns,
  onMove,
  onDelete,
}: {
  card: KanbanCard;
  palette: Props['palette'];
  otherColumns: { id: string; label: string }[];
  onMove: (id: string, column_id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [moving, setMoving] = useState(false);

  const handleMove = async (newCol: string) => {
    setMoving(true);
    await onMove(card.id, newCol);
    setMoving(false);
  };

  return (
    <div
      style={{
        backgroundColor: `${palette.text}07`,
        border: `1px solid ${palette.text}12`,
        borderRadius: '8px',
        padding: '12px 14px',
        marginBottom: '8px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
        <p
          style={{
            fontSize: '13px',
            fontWeight: 500,
            color: palette.text,
            margin: 0,
            lineHeight: '1.4',
            flex: 1,
          }}
        >
          {card.title}
        </p>
        <button
          onClick={() => onDelete(card.id)}
          title="Remove card"
          style={{
            background: 'none',
            border: 'none',
            color: palette.text,
            opacity: 0.25,
            cursor: 'pointer',
            fontSize: '14px',
            lineHeight: 1,
            padding: '0 2px',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.6')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.25')}
        >
          ×
        </button>
      </div>

      {card.body && (
        <div style={{ marginTop: '6px' }}>
          <p
            style={{
              fontSize: '12px',
              color: palette.text,
              opacity: 0.55,
              lineHeight: '1.5',
              margin: 0,
              display: expanded ? 'block' : '-webkit-box',
              WebkitLineClamp: expanded ? undefined : 2,
              WebkitBoxOrient: 'vertical' as const,
              overflow: expanded ? 'visible' : 'hidden',
            }}
          >
            {card.body}
          </p>
          {card.body.length > 100 && (
            <button
              onClick={() => setExpanded((v) => !v)}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                fontSize: '11px',
                color: palette.primary,
                opacity: 0.6,
                cursor: 'pointer',
                marginTop: '3px',
              }}
            >
              {expanded ? 'less' : 'more'}
            </button>
          )}
        </div>
      )}

      {card.tags && card.tags.length > 0 && (
        <div style={{ marginTop: '4px' }}>
          {card.tags.map((t) => (
            <TagBadge key={t} tag={t} palette={palette} />
          ))}
        </div>
      )}

      <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <select
          disabled={moving}
          onChange={(e) => { if (e.target.value) handleMove(e.target.value); }}
          defaultValue=""
          style={{
            fontSize: '11px',
            backgroundColor: `${palette.text}08`,
            border: `1px solid ${palette.text}15`,
            borderRadius: '4px',
            color: palette.text,
            padding: '2px 6px',
            opacity: moving ? 0.5 : 0.6,
            cursor: 'pointer',
          }}
        >
          <option value="" disabled>Move to...</option>
          {otherColumns.map((col) => (
            <option key={col.id} value={col.id}>{col.label}</option>
          ))}
        </select>
        {moving && (
          <span style={{ fontSize: '11px', opacity: 0.4, color: palette.text }}>moving...</span>
        )}
      </div>
    </div>
  );
}

function AddCardForm({
  palette,
  onAdd,
  onCancel,
}: {
  palette: Props['palette'];
  onAdd: (title: string, body: string) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<AddFormState>({ title: '', body: '', submitting: false });

  const submit = async () => {
    if (!form.title.trim() || form.submitting) return;
    setForm((f) => ({ ...f, submitting: true }));
    await onAdd(form.title.trim(), form.body.trim());
    setForm({ title: '', body: '', submitting: false });
  };

  return (
    <div
      style={{
        backgroundColor: `${palette.primary}10`,
        border: `1px solid ${palette.primary}25`,
        borderRadius: '8px',
        padding: '10px 12px',
        marginTop: '8px',
      }}
    >
      <input
        autoFocus
        type="text"
        placeholder="Card title"
        value={form.title}
        onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
        onKeyDown={(e) => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') onCancel(); }}
        style={{
          width: '100%',
          fontSize: '13px',
          backgroundColor: `${palette.text}08`,
          border: `1px solid ${palette.text}15`,
          borderRadius: '4px',
          color: palette.text,
          padding: '6px 8px',
          outline: 'none',
          marginBottom: '6px',
          boxSizing: 'border-box',
        }}
      />
      <textarea
        placeholder="Description (optional)"
        value={form.body}
        onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
        rows={2}
        style={{
          width: '100%',
          fontSize: '12px',
          backgroundColor: `${palette.text}08`,
          border: `1px solid ${palette.text}15`,
          borderRadius: '4px',
          color: palette.text,
          padding: '6px 8px',
          outline: 'none',
          resize: 'none',
          marginBottom: '8px',
          boxSizing: 'border-box',
        }}
      />
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        <button
          onClick={onCancel}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '12px',
            color: palette.text,
            opacity: 0.4,
            cursor: 'pointer',
            padding: '4px 8px',
          }}
        >
          Cancel
        </button>
        <button
          onClick={submit}
          disabled={!form.title.trim() || form.submitting}
          style={{
            fontSize: '12px',
            backgroundColor: palette.primary,
            color: palette.background,
            border: 'none',
            borderRadius: '4px',
            padding: '4px 14px',
            cursor: !form.title.trim() || form.submitting ? 'not-allowed' : 'pointer',
            opacity: !form.title.trim() || form.submitting ? 0.5 : 1,
          }}
        >
          {form.submitting ? '...' : 'Add'}
        </button>
      </div>
    </div>
  );
}

export default function FieldKanban({ fieldSlug, palette }: Props) {
  const [cards, setCards] = useState<KanbanCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingTo, setAddingTo] = useState<string | null>(null);

  const fetchCards = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/fields/${fieldSlug}/kanban`);
      if (!res.ok) throw new Error(`Failed to load board (${res.status})`);
      const data = await res.json();
      setCards(data.cards ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load board');
    } finally {
      setLoading(false);
    }
  }, [fieldSlug]);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  const addCard = async (columnId: string, title: string, body: string) => {
    const res = await fetch(`/api/fields/${fieldSlug}/kanban`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ column_id: columnId, title, text: body || undefined }),
    });
    if (res.ok) {
      const data = await res.json();
      setCards((prev) => [...prev, data.card]);
    }
    setAddingTo(null);
  };

  const moveCard = async (id: string, newColumnId: string) => {
    const res = await fetch(`/api/fields/${fieldSlug}/kanban/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ column_id: newColumnId }),
    });
    if (res.ok) {
      const data = await res.json();
      setCards((prev) => prev.map((c) => (c.id === id ? data.card : c)));
    }
  };

  const deleteCard = async (id: string) => {
    await fetch(`/api/fields/${fieldSlug}/kanban/${id}`, { method: 'DELETE' });
    setCards((prev) => prev.filter((c) => c.id !== id));
  };

  if (loading) {
    return (
      <div style={{ padding: '40px 0', textAlign: 'center', color: palette.text, opacity: 0.3, fontSize: '14px' }}>
        ...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', color: '#EB5757', fontSize: '13px', opacity: 0.7 }}>
        {error}
        <button
          onClick={fetchCards}
          style={{ marginLeft: '12px', textDecoration: 'underline', background: 'none', border: 'none', color: '#EB5757', cursor: 'pointer', fontSize: '13px' }}
        >
          Retry
        </button>
      </div>
    );
  }

  const columnWidth = 260;
  const gap = 16;

  return (
    <div>
      <div
        style={{
          overflowX: 'auto',
          paddingBottom: '16px',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: `${gap}px`,
            minWidth: `${COLUMNS.length * (columnWidth + gap)}px`,
            alignItems: 'flex-start',
          }}
        >
          {COLUMNS.map((col) => {
            const colCards = cards.filter((c) => c.column_id === col.id);
            const otherCols = COLUMNS.filter((c) => c.id !== col.id);

            return (
              <div
                key={col.id}
                style={{
                  width: `${columnWidth}px`,
                  flexShrink: 0,
                  backgroundColor: `${palette.text}05`,
                  border: `1px solid ${palette.text}0E`,
                  borderRadius: '10px',
                  padding: '14px 12px',
                }}
              >
                {/* Column header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '12px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: palette.primary,
                      opacity: 0.8,
                    }}
                  >
                    {col.label}
                  </span>
                  <span
                    style={{
                      fontSize: '11px',
                      color: palette.text,
                      opacity: 0.3,
                      backgroundColor: `${palette.text}10`,
                      borderRadius: '10px',
                      padding: '1px 8px',
                    }}
                  >
                    {colCards.length}
                  </span>
                </div>

                {/* Cards */}
                {colCards.length === 0 && addingTo !== col.id && (
                  <p style={{ fontSize: '12px', color: palette.text, opacity: 0.25, textAlign: 'center', padding: '16px 0', margin: 0 }}>
                    empty
                  </p>
                )}

                {colCards.map((card) => (
                  <KanbanCardView
                    key={card.id}
                    card={card}
                    palette={palette}
                    otherColumns={otherCols}
                    onMove={moveCard}
                    onDelete={deleteCard}
                  />
                ))}

                {/* Add card */}
                {addingTo === col.id ? (
                  <AddCardForm
                    palette={palette}
                    onAdd={(title, body) => addCard(col.id, title, body)}
                    onCancel={() => setAddingTo(null)}
                  />
                ) : (
                  <button
                    onClick={() => setAddingTo(col.id)}
                    style={{
                      width: '100%',
                      background: 'none',
                      border: `1px dashed ${palette.text}18`,
                      borderRadius: '6px',
                      padding: '7px',
                      fontSize: '12px',
                      color: palette.text,
                      opacity: 0.35,
                      cursor: 'pointer',
                      marginTop: colCards.length > 0 ? '4px' : '0',
                      transition: 'opacity 0.15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.65')}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.35')}
                  >
                    + Add card
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
