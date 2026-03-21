'use client';

import { useEffect, useState, useCallback } from 'react';

interface ActivityEvent {
  id: string;
  field_slug: string;
  actor_id: string | null;
  actor_name: string | null;
  event_type: string;
  payload: Record<string, unknown>;
  created_at: string;
}

interface Palette {
  primary: string;
  background: string;
  text: string;
  accent: string;
}

interface Props {
  fieldSlug: string;
  palette: Palette;
}

function formatEventDescription(event: ActivityEvent): string {
  const actor = event.actor_name ?? 'Someone';
  const p = event.payload ?? {};
  switch (event.event_type) {
    case 'card_added':
      return `${actor} added "${p.title ?? 'card'}" to ${p.columnId ?? 'the board'}`;
    case 'card_moved':
      return `${actor} moved "${p.title ?? 'card'}" to ${p.toColumn ?? 'a column'}`;
    case 'card_deleted':
      return `${actor} removed a card`;
    case 'dm_sent':
      return 'Message sent';
    case 'decision_logged':
      return 'New decision logged';
    default:
      return event.event_type.replace(/_/g, ' ');
  }
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function actorInitial(name: string | null): string {
  if (!name) return '?';
  return name.charAt(0).toUpperCase();
}

export default function FieldActivityFeed({ fieldSlug, palette }: Props) {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch(`/api/fields/${fieldSlug}/activity?scope=partner`);
      if (!res.ok) return;
      const data = await res.json();
      setEvents((data.events ?? []).slice(0, 20));
    } catch {
      // silent — activity feed is non-critical
    } finally {
      setLoading(false);
    }
  }, [fieldSlug]);

  useEffect(() => {
    void fetchEvents();
    const interval = setInterval(() => void fetchEvents(), 30000);
    return () => clearInterval(interval);
  }, [fetchEvents]);

  return (
    <div>
      <h3 style={{
        margin: '0 0 0.75rem',
        fontSize: '0.65rem',
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        color: `${palette.text}40`,
        fontWeight: 400,
      }}>
        Activity
      </h3>

      {loading ? (
        <p style={{ fontSize: '0.8rem', color: `${palette.text}30`, margin: 0 }}>Loading...</p>
      ) : events.length === 0 ? (
        <p style={{ fontSize: '0.8rem', color: `${palette.text}30`, margin: 0 }}>No activity yet</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {events.map((ev) => (
            <div key={ev.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem' }}>
              {/* Actor initial badge */}
              <div style={{
                width: '1.5rem',
                height: '1.5rem',
                borderRadius: '50%',
                background: `${palette.primary}30`,
                border: `1px solid ${palette.primary}40`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.6rem',
                color: palette.primary,
                fontWeight: 500,
                flexShrink: 0,
                marginTop: '0.05rem',
              }}>
                {actorInitial(ev.actor_name)}
              </div>

              {/* Description + time */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  margin: 0,
                  fontSize: '0.78rem',
                  color: `${palette.text}80`,
                  lineHeight: 1.4,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {formatEventDescription(ev)}
                </p>
                <p style={{
                  margin: '0.1rem 0 0',
                  fontSize: '0.68rem',
                  color: `${palette.text}30`,
                }}>
                  {formatTime(ev.created_at)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
