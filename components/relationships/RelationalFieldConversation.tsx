'use client';

/**
 * RelationalFieldConversation — a quiet way to bring something to MAIA from
 * the list page, before picking a specific relationship.
 *
 * WHY THIS EXISTS: individual relationship rooms already hold MAIA inline
 * (RelationshipConversation.tsx). The list page had none — its only MAIA
 * reference routed AWAY via `router.push('/maia')`. If something is live for
 * a member before they've picked who it's about, there was nowhere on this
 * surface to bring it.
 *
 * SAME ROUTE, SAME RULES — no parallel/weaker path. This posts to the exact
 * route the individual rooms use (`/api/sovereign/app/maia`), with the same
 * dual-shape `conversationHistory` convention RelationshipConversation.tsx
 * uses. Article III enforcement, the actionability floor, and
 * verdict-overreach detection all live inside that route — reusing it means
 * this surface gets them for free, not as a separate reimplementation.
 *
 * NO RELATIONSHIP IS ATTACHED HERE, ON PURPOSE. This component never sends
 * `consciousnessContext.relationshipId` — there is no specific relationship
 * in view to attach to. `resolveExplicitRelationshipId` (server-side)
 * therefore resolves to `{ status: 'none' }`, and any relational material the
 * member happens to mention accumulates in their system catch-all container
 * (`origin: 'system'`, surfaced below as "Not yet placed") rather than being
 * silently attributed to whichever person a name-match might guess. That is
 * the correct behavior here, not a fallback to route around — it is the same
 * provenance boundary the individual rooms rely on whenever nothing explicit
 * is offered (see `lib/consciousness/relationalObserver.ts`).
 *
 * Progressive disclosure per docs/design/INHABITABLE_ARCHITECTURE.md: closed
 * by default, a single quiet line of text — never an always-open chat widget
 * competing with the individual rooms.
 */

import { useState, useRef, useEffect } from 'react';
import { apiFetch } from '@/lib/http/apiBase';

interface Turn {
  role: 'member' | 'maia';
  text: string;
}

export default function RelationalFieldConversation() {
  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef<string>(`rel-field-${Date.now()}`);

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

    try {
      const res = await apiFetch('/api/sovereign/app/maia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          sessionId: sessionIdRef.current,
          // Same dual-shape convention as RelationshipConversation.tsx — see
          // that file's note on why both `role`/`content` and
          // `userMessage`/`maiaResponse` are sent.
          conversationHistory: turns.map((t) => ({
            role: t.role === 'maia' ? 'assistant' : 'user',
            content: t.text,
            userMessage: t.role === 'member' ? t.text : '',
            maiaResponse: t.role === 'maia' ? t.text : '',
          })),
          // Deliberately no `relationshipId` — see file header. This turn is
          // intentionally unattached; the observer files it in the system
          // catch-all rather than guessing a person.
          consciousnessContext: {
            source: 'relationships:list',
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

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs text-stone-400/70 hover:text-amber-200/80 transition-colors font-light mb-8"
      >
        Something on your mind, before you pick someone?
      </button>
    );
  }

  return (
    <div className="mb-10">
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
        placeholder="What's on your mind?"
        className="w-full px-4 py-3 rounded-xl bg-stone-900/40 border border-stone-700/50 text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-amber-700/45 text-[15px] font-light resize-none transition-colors"
        autoFocus
      />

      <div className="flex items-center flex-wrap gap-x-4 gap-y-2 mt-3">
        <button
          type="button"
          onClick={send}
          disabled={sending || !draft.trim()}
          className="px-5 py-2.5 rounded-lg bg-amber-800/35 border border-amber-600/45 text-amber-50 text-[15px] font-light hover:bg-amber-800/55 hover:border-amber-500/60 transition-all disabled:opacity-25"
        >
          {sending ? 'MAIA is listening…' : turns.length ? 'Say more' : 'Bring this to MAIA'}
        </button>

        {!turns.length && (
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-[13px] text-stone-400 hover:text-stone-300 transition-colors font-light"
          >
            Not now
          </button>
        )}

        {failed && (
          <span className="text-xs text-amber-400/80 font-light">
            That didn&apos;t reach MAIA. Try again.
          </span>
        )}
      </div>

      {turns.length > 0 && (
        <p className="mt-3 text-[11px] text-stone-500/70 font-light leading-relaxed">
          If this is about someone specific, open their room to speak with MAIA there —
          she&apos;ll already be holding who they are to you.
        </p>
      )}
    </div>
  );
}
