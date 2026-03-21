'use client';

import { useEffect, useRef, useState } from 'react';

interface DMMessage {
  id: string;
  dm_thread_id: string;
  sender_id: string;
  body: string;
  created_at: string;
}

interface Palette {
  primary: string;
  background: string;
  text: string;
  accent?: string;
}

interface Props {
  threadId: string;
  viewerMemberId: string;
  partnerName: string;
  palette: Palette;
}

export default function PartnerCommsPanel({ threadId, viewerMemberId, partnerName, palette }: Props) {
  const [messages, setMessages] = useState<DMMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [compose, setCompose] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/team/dm/${threadId}/messages?limit=20`)
      .then((r) => r.json())
      .then((data) => {
        // API returns messages newest-first; reverse for display
        const msgs: DMMessage[] = (data.messages ?? []).slice().reverse();
        setMessages(msgs);
        setLoading(false);
      })
      .catch(() => {
        setError('Could not load messages');
        setLoading(false);
      });
  }, [threadId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage() {
    const trimmed = compose.trim();
    if (!trimmed || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/team/dm/${threadId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: trimmed }),
      });
      if (res.ok) {
        const { message } = await res.json();
        setMessages((prev) => [...prev, message]);
        setCompose('');
      } else {
        setError('Send failed');
      }
    } finally {
      setSending(false);
    }
  }

  function formatTime(iso: string) {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function formatDate(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: '400px',
      border: `1px solid ${palette.primary}20`,
      background: `${palette.primary}05`,
      borderRadius: '2px',
    }}>
      {/* Panel header */}
      <div style={{
        padding: '0.75rem 1rem',
        borderBottom: `1px solid ${palette.primary}20`,
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}>
        <div style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: palette.primary,
          opacity: 0.6,
        }} />
        <span style={{
          fontSize: '0.72rem',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: `${palette.text}60`,
        }}>
          {partnerName}
        </span>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '0.75rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
      }}>
        {loading && (
          <p style={{ color: `${palette.text}40`, fontSize: '0.8rem', textAlign: 'center', margin: 'auto' }}>
            Loading...
          </p>
        )}
        {error && (
          <p style={{ color: '#e06060', fontSize: '0.8rem', textAlign: 'center', margin: 'auto' }}>
            {error}
          </p>
        )}
        {!loading && messages.length === 0 && (
          <p style={{ color: `${palette.text}30`, fontSize: '0.78rem', textAlign: 'center', margin: 'auto' }}>
            No messages yet. Start the thread.
          </p>
        )}
        {messages.map((msg, i) => {
          const isViewer = msg.sender_id === viewerMemberId;
          const prevMsg = messages[i - 1];
          const showDate = !prevMsg || formatDate(prevMsg.created_at) !== formatDate(msg.created_at);
          return (
            <div key={msg.id}>
              {showDate && (
                <div style={{
                  textAlign: 'center',
                  fontSize: '0.62rem',
                  color: `${palette.text}30`,
                  letterSpacing: '0.1em',
                  margin: '0.5rem 0',
                }}>
                  {formatDate(msg.created_at)}
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: isViewer ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '78%',
                  padding: '0.5rem 0.75rem',
                  background: isViewer ? `${palette.primary}25` : `${palette.primary}10`,
                  border: `1px solid ${palette.primary}${isViewer ? '40' : '20'}`,
                  borderRadius: '2px',
                }}>
                  <p style={{
                    margin: 0,
                    fontSize: '0.82rem',
                    color: palette.text,
                    lineHeight: 1.5,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}>
                    {msg.body}
                  </p>
                  <p style={{
                    margin: '0.25rem 0 0',
                    fontSize: '0.6rem',
                    color: `${palette.text}30`,
                    textAlign: isViewer ? 'right' : 'left',
                  }}>
                    {formatTime(msg.created_at)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Compose */}
      <div style={{
        padding: '0.75rem 1rem',
        borderTop: `1px solid ${palette.primary}20`,
        display: 'flex',
        gap: '0.5rem',
        alignItems: 'flex-end',
      }}>
        <textarea
          value={compose}
          onChange={(e) => setCompose(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder={`Message ${partnerName}...`}
          rows={2}
          style={{
            flex: 1,
            background: `${palette.primary}08`,
            border: `1px solid ${palette.primary}25`,
            color: palette.text,
            padding: '0.5rem 0.6rem',
            fontSize: '0.82rem',
            borderRadius: '2px',
            resize: 'none',
            outline: 'none',
            fontFamily: 'inherit',
          }}
        />
        <button
          onClick={sendMessage}
          disabled={sending || !compose.trim()}
          style={{
            background: palette.primary,
            color: palette.background,
            border: 'none',
            padding: '0.5rem 0.9rem',
            fontSize: '0.75rem',
            cursor: sending || !compose.trim() ? 'default' : 'pointer',
            opacity: sending || !compose.trim() ? 0.5 : 1,
            borderRadius: '2px',
            letterSpacing: '0.05em',
            whiteSpace: 'nowrap',
          }}
        >
          {sending ? '...' : 'Send'}
        </button>
      </div>
    </div>
  );
}
