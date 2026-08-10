'use client';

/**
 * RelationshipConversation — MAIA, present inside the relationship.
 *
 * WHY THIS EXISTS (founder direction 2026-08-10): the room previously offered a
 * "Take this to MAIA" button that seeded context and then `router.push('/maia')`.
 * That positions MAIA as ELSEWHERE — something you leave the relationship to go
 * find. In a room about one person, MAIA should already be here.
 *
 * ⚠️ HONESTY CONSTRAINT — this is in-turn context, NOT memory. MAIA can speak
 * about this person because the member brought them into THIS turn: the name,
 * bond, and the member's own note are passed explicitly with the message. MAIA
 * does not carry this relationship between sessions — the relational read path
 * is severed (see RELATIONAL_FIELD_FUNCTIONAL_SOVEREIGNTY_AUDIT_2026-08-10.md,
 * Classification D). So the copy here must never imply MAIA remembers, and this
 * component deliberately does NOT persist the exchange: writing it back would
 * create more provenance-blind relational rows, which is exactly what RU-1 has
 * to settle first. Conversation only. Nothing is stored.
 */

import { useState, useRef, useEffect } from 'react';
import { apiFetch } from '@/lib/http/apiBase';

interface Props {
  relationshipId: string;
  name: string;
  bondType?: string | null;
  note?: string | null;
}

interface Turn {
  role: 'member' | 'maia';
  text: string;
}

export default function RelationshipConversation({ relationshipId, name, bondType, note }: Props) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef<string>(`rel-${relationshipId}-${Date.now()}`);

  useEffect(() => {
    if (turns.length) endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [turns]);

  const send = async () => {
    const text = draft.trim();
    if (!text || sending) return;
    setDraft('');
    setFailed(false);
    setTurns((t) => [...t, { role: 'member', text }]);
    setSending(true);

    // The relationship is carried in THIS turn, explicitly. Only on the first
    // message — afterwards conversationHistory holds it, and repeating the frame
    // every turn would make MAIA keep re-introducing the person.
    const framed =
      turns.length === 0
        ? [
            `I want to talk about ${name}${bondType ? ` — ${bondType.replace(/_/g, ' ')}` : ''}.`,
            note ? `What I've said about this: "${note}"` : null,
            '',
            text,
          ]
            .filter((l) => l !== null)
            .join('\n')
        : text;

    try {
      const res = await apiFetch('/api/sovereign/app/maia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: framed,
          sessionId: sessionIdRef.current,
          conversationHistory: turns.map((t) => ({
            role: t.role === 'maia' ? 'assistant' : 'user',
            content: t.text,
          })),
          consciousnessContext: {
            source: 'relationships:room',
            relationshipId,
          },
        }),
      });
      const data = await res.json();
      const reply = typeof data?.message === 'string' ? data.message : '';
      if (!reply) throw new Error('no reply');
      setTurns((t) => [...t, { role: 'maia', text: reply }]);
    } catch {
      setFailed(true);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mt-8">
      {turns.length > 0 && (
        <div className="space-y-5 mb-5">
          {turns.map((t, i) =>
            t.role === 'member' ? (
              <p key={i} className="text-[15px] leading-relaxed text-jade-jade/90 font-light">
                {t.text}
              </p>
            ) : (
              <p
                key={i}
                className="text-[15px] leading-relaxed text-jade-mineral font-light pl-4 border-l border-jade-sage/20"
                style={{ fontFamily: 'Spectral, Georgia, serif' }}
              >
                {t.text}
              </p>
            ),
          )}
          <div ref={endRef} />
        </div>
      )}

      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) send();
        }}
        rows={turns.length ? 2 : 3}
        placeholder={turns.length ? 'Say more…' : `What's happening with ${name}?`}
        className="w-full px-4 py-3 rounded-xl bg-jade-shadow/40 border border-jade-sage/20 text-jade-jade placeholder:text-jade-mineral/45 focus:outline-none focus:border-jade-sage/45 text-[15px] font-light resize-none transition-colors"
      />

      <div className="flex items-center gap-3 mt-2">
        <button
          onClick={send}
          disabled={sending || !draft.trim()}
          className="px-4 py-1.5 rounded-lg bg-jade-forest/30 border border-jade-sage/25 text-jade-jade text-sm font-light hover:bg-jade-forest/45 transition-all disabled:opacity-30"
        >
          {sending ? 'MAIA is listening…' : turns.length ? 'Send' : 'Begin'}
        </button>
        {failed && (
          <span className="text-xs text-jade-copper font-light">
            That didn&apos;t reach MAIA. Try again.
          </span>
        )}
      </div>
    </div>
  );
}
