'use client';

import { useEffect, useRef, useState } from 'react';

type MessageType = 'build' | 'decision' | 'insight' | 'question';

const MESSAGE_TYPES: { type: MessageType; label: string; icon: string }[] = [
  { type: 'build', label: 'Build', icon: '\u{1F527}' },
  { type: 'decision', label: 'Decision', icon: '\u25C6' },
  { type: 'insight', label: 'Insight', icon: '\u25CB' },
  { type: 'question', label: 'Question', icon: '?' },
];

interface DMMessage {
  id: string;
  dm_thread_id: string;
  sender_id: string;
  body: string;
  message_type?: MessageType;
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
  const [selectedType, setSelectedType] = useState<MessageType>('build');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [threadResolved, setThreadResolved] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/team/dm/${threadId}/messages?limit=20`, {
      headers: { 'x-member-id': viewerMemberId },
    })
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
  }, [threadId, viewerMemberId]);

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
        headers: {
          'Content-Type': 'application/json',
          'x-member-id': viewerMemberId,
        },
        body: JSON.stringify({ body: trimmed, message_type: selectedType }),
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
          background: threadResolved ? '#059669' : palette.primary,
          opacity: 0.7,
        }} />
        <span style={{
          fontSize: '0.72rem',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: `${palette.text}60`,
          flex: 1,
        }}>
          {partnerName}
          {threadResolved && <span style={{ marginLeft: '0.5rem', color: '#059669', fontSize: '0.65rem' }}>· resolved</span>}
        </span>
        <button
          onClick={() => setThreadResolved((v) => !v)}
          title={threadResolved ? 'Reopen thread' : 'Mark thread resolved'}
          style={{
            fontSize: '0.65rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: threadResolved ? '#059669' : `${palette.text}35`,
            background: 'transparent',
            border: `1px solid ${threadResolved ? '#05966940' : `${palette.text}15`}`,
            padding: '2px 8px',
            borderRadius: '2px',
            cursor: 'pointer',
          }}
        >
          {threadResolved ? '↩ Reopen' : '✓ Resolve'}
        </button>
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
                  <div style={{
                    display: 'flex',
                    justifyContent: isViewer ? 'flex-end' : 'flex-start',
                    alignItems: 'center',
                    gap: '0.4rem',
                    marginTop: '0.25rem',
                  }}>
                    {msg.message_type && msg.message_type !== 'build' && (
                      <span style={{
                        fontSize: '0.58rem',
                        color: `${palette.primary}80`,
                        letterSpacing: '0.05em',
                      }}>
                        [{msg.message_type}]
                      </span>
                    )}
                    <span style={{
                      fontSize: '0.6rem',
                      color: `${palette.text}30`,
                    }}>
                      {formatTime(msg.created_at)}
                    </span>
                  </div>
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
        flexDirection: 'column',
        gap: '0.5rem',
      }}>
        {/* Type selector */}
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          {MESSAGE_TYPES.map(({ type, label, icon }) => {
            const isSelected = selectedType === type;
            return (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                style={{
                  background: isSelected ? `${palette.primary}20` : 'none',
                  border: `1px solid ${isSelected ? palette.primary : `${palette.primary}25`}`,
                  color: isSelected ? palette.primary : `${palette.text}40`,
                  padding: '0.2rem 0.55rem',
                  fontSize: '0.65rem',
                  borderRadius: '2px',
                  cursor: 'pointer',
                  letterSpacing: '0.04em',
                  transition: 'all 0.1s',
                }}
              >
                {icon} {label}
              </button>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
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
    </div>
  );
}
