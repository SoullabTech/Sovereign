'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface Segment {
  id: string;
  speaker: string;
  startMs: number;
  endMs: number;
  text: string;
  confidence?: number;
}

interface Insight {
  id: string;
  insightType: string;
  content: string;
  significance?: number;
}

interface SessionSummary {
  id: string;
  title?: string;
  sessionType: string;
  startedAt: string;
  endedAt?: string;
  processingStatus: string;
}

interface Palette {
  primary: string;
  accent: string;
  background: string;
  text: string;
}

type Status = 'idle' | 'connecting' | 'live' | 'ended' | 'error';

export default function FieldSessionListener({ palette }: { palette: Palette }) {
  const [memberId, setMemberId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [selected, setSelected] = useState<SessionSummary | null>(null);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [status, setStatus] = useState<Status>('idle');
  const [connectedTitle, setConnectedTitle] = useState('');
  const esRef = useRef<EventSource | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const seenSegIds = useRef(new Set<string>());
  const seenInsightIds = useRef(new Set<string>());

  // Resolve member ID from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('beta_user');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.id) setMemberId(parsed.id);
      }
    } catch {}
  }, []);

  // Load sessions when member ID is known
  useEffect(() => {
    if (!memberId) return;
    setLoadingSessions(true);
    fetch(`/api/supervision/sessions?practitionerId=${memberId}&limit=20`)
      .then(r => r.json())
      .then(data => setSessions(data.sessions ?? []))
      .catch(() => {})
      .finally(() => setLoadingSessions(false));
  }, [memberId]);

  // Auto-scroll on new segments
  useEffect(() => {
    if (segments.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [segments.length]);

  const disconnect = useCallback(() => {
    esRef.current?.close();
    esRef.current = null;
  }, []);

  const connect = useCallback((session: SessionSummary) => {
    disconnect();
    setSelected(session);
    setSegments([]);
    setInsights([]);
    seenSegIds.current.clear();
    seenInsightIds.current.clear();
    setStatus('connecting');
    setConnectedTitle(session.title || session.sessionType);

    const es = new EventSource(`/api/supervision/scribe?sessionId=${session.id}`);
    esRef.current = es;

    es.addEventListener('connected', (e: MessageEvent) => {
      const data = JSON.parse(e.data);
      setConnectedTitle(data.sessionTitle || session.title || session.sessionType);
      setStatus(data.isLive ? 'live' : 'ended');
    });

    es.addEventListener('transcript', (e: MessageEvent) => {
      const data = JSON.parse(e.data);
      const newSegs = (data.segments as Segment[]).filter(s => {
        if (seenSegIds.current.has(s.id)) return false;
        seenSegIds.current.add(s.id);
        return true;
      });
      if (newSegs.length) setSegments(prev => [...prev, ...newSegs]);
    });

    es.addEventListener('insights', (e: MessageEvent) => {
      const data = JSON.parse(e.data);
      const newInsights = (data.insights as Insight[]).filter(i => {
        if (seenInsightIds.current.has(i.id)) return false;
        seenInsightIds.current.add(i.id);
        return true;
      });
      if (newInsights.length) setInsights(prev => [...prev, ...newInsights]);
    });

    es.addEventListener('session_ended', () => {
      setStatus('ended');
    });

    es.onerror = () => {
      setStatus('error');
      es.close();
    };
  }, [disconnect]);

  useEffect(() => () => disconnect(), [disconnect]);

  const p = palette;
  const activeSessions = sessions.filter(s => !s.endedAt);
  const recentSessions = sessions.filter(s => !!s.endedAt);

  const statusDot = (s: Status) => {
    if (s === 'live') return { color: '#4CAF50', label: '● Live' };
    if (s === 'connecting') return { color: p.primary, label: '○ Connecting' };
    if (s === 'ended') return { color: '#888', label: 'Session ended' };
    if (s === 'error') return { color: '#cc4444', label: 'Connection lost' };
    return null;
  };

  const dot = statusDot(status);

  return (
    <div style={{
      minHeight: '100vh',
      background: p.background,
      color: p.text,
      fontFamily: 'Georgia, serif',
    }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '3rem 2rem' }}>

        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <p style={{ fontSize: '0.6rem', letterSpacing: '0.35em', textTransform: 'uppercase', opacity: 0.35, marginBottom: '0.5rem' }}>
            Field Observer
          </p>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 400, margin: 0 }}>Session Stream</h1>
        </div>

        {/* Session list — no session selected */}
        {!selected && (
          <div>
            {!memberId && (
              <p style={{ opacity: 0.4, fontSize: '0.9rem' }}>Sign in to see your sessions.</p>
            )}

            {memberId && loadingSessions && (
              <p style={{ opacity: 0.3, fontSize: '0.85rem' }}>Loading sessions…</p>
            )}

            {memberId && !loadingSessions && sessions.length === 0 && (
              <p style={{ opacity: 0.4, fontSize: '0.9rem' }}>No sessions found.</p>
            )}

            {activeSessions.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <SectionLabel>Active Now</SectionLabel>
                {activeSessions.map(s => (
                  <SessionCard
                    key={s.id}
                    session={s}
                    active
                    palette={p}
                    onConnect={connect}
                  />
                ))}
              </div>
            )}

            {recentSessions.length > 0 && (
              <div>
                <SectionLabel>Recent</SectionLabel>
                {recentSessions.slice(0, 8).map(s => (
                  <SessionCard
                    key={s.id}
                    session={s}
                    active={false}
                    palette={p}
                    onConnect={connect}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Live view — session selected */}
        {selected && (
          <div>
            {/* Nav + status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2rem' }}>
              <button
                onClick={() => {
                  disconnect();
                  setSelected(null);
                  setStatus('idle');
                }}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: p.text, opacity: 0.45, fontSize: '0.8rem', padding: 0,
                }}
              >
                ← Sessions
              </button>
              {dot && (
                <span style={{ fontSize: '0.7rem', color: dot.color, letterSpacing: '0.05em' }}>
                  {dot.label}
                </span>
              )}
              <span style={{ fontSize: '0.8rem', opacity: 0.6, marginLeft: 'auto' }}>
                {connectedTitle}
              </span>
            </div>

            {/* Transcript */}
            <div style={{ marginBottom: '2rem' }}>
              {segments.length === 0 && (status === 'live' || status === 'connecting') && (
                <p style={{ opacity: 0.3, fontSize: '0.85rem' }}>Waiting for transcript…</p>
              )}
              {segments.map(seg => (
                <div key={seg.id} style={{ marginBottom: '1rem', lineHeight: 1.65 }}>
                  <span style={{
                    fontSize: '0.6rem', letterSpacing: '0.15em',
                    textTransform: 'uppercase', opacity: 0.4, marginRight: '0.6rem',
                    display: 'inline-block', minWidth: '4rem',
                  }}>
                    {seg.speaker}
                  </span>
                  <span style={{ fontSize: '0.95rem' }}>{seg.text}</span>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* MAIA insights */}
            {insights.length > 0 && (
              <div style={{ borderTop: `1px solid ${p.primary}20`, paddingTop: '1.5rem' }}>
                <SectionLabel>MAIA Patterns</SectionLabel>
                {insights.map(i => (
                  <div key={i.id} style={{
                    padding: '0.75rem 1rem', marginBottom: '0.6rem',
                    border: `1px solid ${p.primary}22`,
                    borderRadius: 6,
                    background: `${p.primary}06`,
                  }}>
                    <span style={{
                      display: 'block', fontSize: '0.6rem',
                      letterSpacing: '0.15em', textTransform: 'uppercase',
                      opacity: 0.4, marginBottom: '0.3rem',
                    }}>
                      {i.insightType}
                    </span>
                    <span style={{ fontSize: '0.88rem', lineHeight: 1.55 }}>{i.content}</span>
                  </div>
                ))}
              </div>
            )}

            {status === 'ended' && segments.length === 0 && (
              <p style={{ opacity: 0.4, fontSize: '0.85rem' }}>Session ended — no transcript was captured.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: '0.6rem', letterSpacing: '0.25em',
      textTransform: 'uppercase', opacity: 0.35,
      marginBottom: '0.75rem',
    }}>
      {children}
    </p>
  );
}

function SessionCard({
  session,
  active,
  palette: p,
  onConnect,
}: {
  session: SessionSummary;
  active: boolean;
  palette: Palette;
  onConnect: (s: SessionSummary) => void;
}) {
  const label = session.title || session.sessionType;
  const when = active
    ? `Started ${new Date(session.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    : new Date(session.startedAt).toLocaleDateString([], { month: 'short', day: 'numeric' });

  return (
    <button
      onClick={() => onConnect(session)}
      style={{
        display: 'block', width: '100%', textAlign: 'left',
        padding: '0.85rem 1rem', marginBottom: '0.5rem',
        border: `1px solid ${active ? p.primary + '40' : p.text + '12'}`,
        borderRadius: 8,
        background: active ? `${p.primary}08` : 'transparent',
        color: p.text, cursor: 'pointer',
        opacity: active ? 1 : 0.65,
        fontFamily: 'inherit',
      }}
    >
      <span style={{ display: 'block', fontSize: '0.9rem', fontWeight: active ? 500 : 400 }}>{label}</span>
      <span style={{ display: 'block', fontSize: '0.7rem', opacity: 0.5, marginTop: '0.2rem' }}>{when}</span>
    </button>
  );
}
