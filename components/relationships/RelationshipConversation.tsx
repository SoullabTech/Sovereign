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
  /**
   * Keep what the member wrote, WITHOUT sending it to MAIA.
   *
   * This belongs here, beside the composer, because the words a member wants
   * kept are the words already under their cursor. The gesture previously sat
   * OUTSIDE this component and merely opened a second, empty box — so someone
   * who typed a real memory and pressed it watched their words disappear with
   * no error and nothing saved. That is the worst failure this room can have,
   * and it made Article VIII false: without MAIA the room kept nothing.
   *
   * Resolves true only when the entry was actually written.
   */
  onWriteDown?: (text: string) => Promise<boolean>;
}

interface Turn {
  role: 'member' | 'maia';
  text: string;
}

export default function RelationshipConversation({ relationshipId, name, bondType, note, onWriteDown }: Props) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [keeping, setKeeping] = useState(false);
  const [kept, setKept] = useState(false);
  const [keepFailed, setKeepFailed] = useState(false);
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

    // ── The frame is CONTEXT, not the member's speech ────────────────────
    //
    // This handoff sentence used to be prepended INTO `message`. Since the
    // observer now files room turns correctly, that meant the scaffold — plus
    // the member's own note quoted back at them — got persisted as their
    // memory of this person. Their history then contained the software
    // narrating itself. Theo's entry was his actual words about a boundary and
    // a silence; Marguerite's was a template.
    //
    // `message` is now ONLY what the member typed, so only their words are
    // ever observed or stored. The frame rides in `conversationHistory`, which
    // MAIA reads for context and which nothing persists — sent on the first
    // turn alone, so she does not keep re-introducing the person.
    const frame =
      turns.length === 0
        ? [
            {
              role: 'user',
              content: [
                `[Context — I am writing from ${name}'s room${bondType ? `, ${bondType.replace(/_/g, ' ')}` : ''}.`,
                note ? ` What I have written about them: "${note}"` : '',
                ']',
              ].join(''),
            },
          ]
        : [];

    try {
      const res = await apiFetch('/api/sovereign/app/maia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          sessionId: sessionIdRef.current,
          conversationHistory: [
            ...frame,
            ...turns.map((t) => ({
              role: t.role === 'maia' ? 'assistant' : 'user',
              content: t.text,
            })),
          ],
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

  /**
   * Keep the words the member has already written — no MAIA turn, no network
   * round-trip through the conversation route, no interpretation. The draft is
   * cleared ONLY after the write is confirmed; a failure leaves their text
   * exactly where they left it and says so.
   */
  const writeDown = async () => {
    const text = draft.trim();
    if (!text || keeping || !onWriteDown) return;
    setKeeping(true);
    setKeepFailed(false);
    try {
      const ok = await onWriteDown(text);
      if (ok) {
        setDraft('');
        setKept(true);
        setTimeout(() => setKept(false), 4000);
      } else {
        setKeepFailed(true);
      }
    } catch {
      setKeepFailed(true);
    } finally {
      setKeeping(false);
    }
  };

  return (
    <div className="mt-8">
      {turns.length > 0 && (
        <div className="space-y-5 mb-5">
          {turns.map((t, i) =>
            t.role === 'member' ? (
              <p key={i} className="text-[15px] leading-relaxed text-stone-200 font-light">
                {t.text}
              </p>
            ) : (
              <p
                key={i}
                className="text-[15px] leading-relaxed text-stone-400 font-light pl-4 border-l border-amber-700/25"
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
        className="w-full px-4 py-3 rounded-xl bg-stone-900/40 border border-stone-700/50 text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-amber-700/45 text-[15px] font-light resize-none transition-colors"
      />

      {/* Two ways to use what you just wrote. Speaking to MAIA, and keeping it
          for yourself — the second reachable without her, in one press, acting
          on the very text under the cursor. `type="button"` on both: an
          untyped <button> defaults to submit, and a stray submit is exactly
          how a member's words got swallowed here before. */}
      <div className="flex items-center flex-wrap gap-x-4 gap-y-2 mt-2">
        <button
          type="button"
          onClick={send}
          disabled={sending || !draft.trim()}
          className="px-4 py-1.5 rounded-lg bg-amber-900/25 border border-amber-700/35 text-amber-100/90 text-sm font-light hover:bg-amber-900/40 transition-all disabled:opacity-30"
        >
          {sending ? 'MAIA is listening…' : turns.length ? 'Send' : 'Begin'}
        </button>

        {onWriteDown && (
          <button
            type="button"
            onClick={writeDown}
            disabled={keeping || !draft.trim()}
            className="text-xs text-stone-400 hover:text-amber-200/80 transition-colors font-light disabled:opacity-30 disabled:hover:text-stone-400"
          >
            {keeping ? 'Keeping…' : '…or just keep this, for yourself'}
          </button>
        )}

        {kept && (
          <span className="text-xs text-amber-200/70 font-light">Kept, in your words.</span>
        )}
        {keepFailed && (
          <span className="text-xs text-amber-400/80 font-light">
            That didn&apos;t save — your words are still here. Try again.
          </span>
        )}
        {failed && (
          <span className="text-xs text-amber-400/80 font-light">
            That didn&apos;t reach MAIA. Try again.
          </span>
        )}
      </div>
    </div>
  );
}
