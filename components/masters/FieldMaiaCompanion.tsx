'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import type { MasterField } from '@/lib/masters/types';

interface Props {
  master: MasterField;
}

interface Turn {
  role: 'user' | 'maia';
  content: string;
}

export default function FieldMaiaCompanion({ master }: Props) {
  const { palette, shortName } = master;
  const [started, setStarted] = useState(false);

  return (
    <main
      className="relative flex min-h-screen flex-col items-center justify-center"
      style={{ backgroundColor: palette.background }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 50% 40% at 50% 60%, ${palette.primary}12 0%, transparent 70%)`,
        }}
      />

      <div
        className="relative z-10 flex w-full max-w-xl flex-col items-center text-center"
        style={{ padding: '3rem 2rem' }}
      >
        <Link
          href={`/fields/${master.slug}`}
          style={{
            fontFamily: 'var(--field-font-body)',
            fontSize: '0.7rem',
            color: `${palette.text}40`,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            marginBottom: '3rem',
            display: 'block',
          }}
        >
          ← {shortName}'s Field
        </Link>

        {!started ? (
          <FieldMaiaEntry master={master} onStart={() => setStarted(true)} />
        ) : (
          <FieldMaiaSession master={master} />
        )}
      </div>
    </main>
  );
}

function FieldMaiaEntry({
  master,
  onStart,
}: {
  master: MasterField;
  onStart: () => void;
}) {
  const { palette, shortName, maia } = master;
  const invitation =
    maia.tone === 'somatic-precise'
      ? 'Notice what is present in your body, right now.'
      : 'What is alive in you right now?';

  return (
    <>
      <p
        style={{
          fontFamily: 'var(--field-font-display)',
          fontSize: 'clamp(1.4rem, 3vw, 2rem)',
          fontWeight: 300,
          color: palette.text,
          lineHeight: 1.4,
          marginBottom: '1rem',
        }}
      >
        {invitation}
      </p>
      <p
        style={{
          fontFamily: 'var(--field-font-body)',
          fontSize: '0.85rem',
          color: `${palette.text}55`,
          lineHeight: 1.7,
          marginBottom: '3rem',
          maxWidth: '28rem',
        }}
      >
        MAIA is a companion here within {shortName}'s field — attuned to this work,
        not a generic assistant.
      </p>
      <button
        onClick={onStart}
        style={{
          fontFamily: 'var(--field-font-body)',
          fontSize: '0.8rem',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: palette.text,
          background: 'transparent',
          border: `1px solid ${palette.primary}40`,
          padding: '0.9rem 2.5rem',
          cursor: 'pointer',
          transition: 'border-color 0.3s, background 0.3s',
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLButtonElement;
          el.style.borderColor = palette.primary;
          el.style.background = `${palette.primary}10`;
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLButtonElement;
          el.style.borderColor = `${palette.primary}40`;
          el.style.background = 'transparent';
        }}
      >
        Enter
      </button>
      <p
        style={{
          fontFamily: 'var(--field-font-body)',
          fontSize: '0.7rem',
          color: `${palette.text}30`,
          marginTop: '2rem',
          letterSpacing: '0.05em',
        }}
      >
        Sanctuary mode available · Nothing held without your consent
      </p>
    </>
  );
}

function FieldMaiaSession({ master }: { master: MasterField }) {
  const { palette, slug } = master;
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Guest session IDs — no auth required for field companion
  const sessionId = useRef(`field-${slug}-${Date.now()}`);
  const userId = useRef(`visitor-${Math.random().toString(36).slice(2, 9)}`);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [turns, loading]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');

    const userTurn: Turn = { role: 'user', content: text };
    setTurns((prev) => [...prev, userTurn]);
    setLoading(true);

    try {
      const history = turns.map((t) => ({
        role: t.role === 'maia' ? 'assistant' : 'user',
        content: t.content,
      }));

      const res = await fetch(`/api/fields/${slug}/oracle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          conversationHistory: history,
        }),
      });

      const data = await res.json();
      const reply =
        data.message ||
        data.response ||
        "Something went wrong. Try again.";

      setTurns((prev) => [...prev, { role: 'maia', content: reply }]);
    } catch {
      setTurns((prev) => [
        ...prev,
        { role: 'maia', content: "I'm here. Take your time." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="flex w-full flex-col"
      style={{ minHeight: '60vh', textAlign: 'left' }}
    >
      {/* Conversation */}
      <div
        className="flex flex-col"
        style={{ flex: 1, gap: '2rem', marginBottom: '2rem', minHeight: '40vh' }}
      >
        {turns.length === 0 && (
          <p
            style={{
              fontFamily: 'var(--field-font-display)',
              fontSize: '1rem',
              fontWeight: 300,
              color: `${palette.text}40`,
              textAlign: 'center',
              paddingTop: '3rem',
            }}
          >
            …
          </p>
        )}

        {turns.map((turn, i) => (
          <div key={i} style={{ textAlign: turn.role === 'user' ? 'right' : 'left' }}>
            <p
              style={{
                display: 'inline-block',
                fontFamily:
                  turn.role === 'maia'
                    ? 'var(--field-font-display)'
                    : 'var(--field-font-body)',
                fontSize: turn.role === 'maia' ? '1.05rem' : '0.9rem',
                fontWeight: 300,
                color:
                  turn.role === 'maia' ? palette.text : `${palette.text}80`,
                lineHeight: 1.7,
                maxWidth: '90%',
              }}
            >
              {turn.content}
            </p>
          </div>
        ))}

        {loading && (
          <p
            style={{
              fontFamily: 'var(--field-font-display)',
              fontSize: '1rem',
              fontWeight: 300,
              color: `${palette.primary}60`,
              animation: 'field-breathe 2s ease-in-out infinite',
            }}
          >
            …
          </p>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        style={{
          borderTop: `1px solid ${palette.primary}20`,
          paddingTop: '1.25rem',
          display: 'flex',
          gap: '0.75rem',
          alignItems: 'flex-end',
        }}
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="What is present for you right now…"
          rows={2}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            resize: 'none',
            fontFamily: 'var(--field-font-body)',
            fontSize: '0.9rem',
            color: palette.text,
            lineHeight: 1.6,
            caretColor: palette.primary,
          }}
        />
        <button
          onClick={send}
          disabled={!input.trim() || loading}
          style={{
            fontFamily: 'var(--field-font-body)',
            fontSize: '0.7rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: input.trim() ? palette.primary : `${palette.text}25`,
            background: 'transparent',
            border: 'none',
            cursor: input.trim() ? 'pointer' : 'default',
            paddingBottom: '0.2rem',
            transition: 'color 0.2s',
          }}
        >
          Send
        </button>
      </div>

      <style>{`
        @keyframes field-breathe {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
