'use client';

/**
 * Now What? — the simple conversation (Lane B).
 *
 * One branded MAIA conversation and nothing else. This is the whole visible
 * product for a field whose members want to talk, not to navigate: no rooms,
 * no Home, no coaching chrome, no starters, no taxonomy, no explanation of the
 * architecture underneath.
 *
 * WHY A NEW ROUTE RATHER THAN A FLAG ON THE ROOM.
 * `components/now-what/NowWhatRoom.tsx` is 2,109 lines and already takes five
 * query params (phase, fieldContext, program, entry, thread), each shaping how
 * an arrival is framed. A presentation flag would add a sixth axis to that,
 * and every later change to the room would have to reason about this mode. The
 * intelligence is reusable; the presentation is not. So this route reuses the
 * former and writes only the latter — it calls the same
 * `POST /api/now-what/interview`, which carries the response grammar
 * (`lib/nowWhat/roomGrammar.ts`), field composition, and every server-side
 * boundary. No conversation logic is duplicated here.
 *
 * ⚠️ ROUTING CONTEXT IS NOT MEMBERSHIP AUTHORITY.
 * `fieldContext` arrives on the invitation link, exactly as the rest of Now
 * What? already operates. It is TRANSITIONAL ROUTING CONTEXT, NOT
 * PRACTITIONER-MEMBERSHIP AUTHORITY. Three separate facts:
 *
 *     authentication  establishes WHO the member is
 *     the invitation  establishes WHICH experience was requested
 *     neither         proves durable membership in a practitioner's field
 *
 * Durable membership belongs to the later tenancy seam (a
 * `practice_field_members` relation, since a member may participate in more
 * than one field over time). Until that exists, the public `/now-what/welcome`
 * sign-in cannot know a member belongs here, and this route must not be
 * described as solving that. The honest path today is:
 *
 *     invitation → existing auth → this conversation
 *
 * Do not promote this parameter to identity. Do not read it as entitlement.
 */

import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiFetch } from '@/lib/http/apiBase';

type Turn = { role: 'user' | 'assistant'; content: string };

const GOLD = '#c9a35e';
const INK = '#e9e2d4';
const DIM = '#b6ac9a';
const FAINT = '#857c6c';
const RULE = 'rgba(233,226,212,0.13)';

function Conversation() {
  const params = useSearchParams();
  const fieldContext = params?.get('fieldContext') ?? undefined;

  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [turns, busy]);

  async function send() {
    const content = draft.trim();
    if (!content || busy) return;
    const history: Turn[] = [...turns, { role: 'user', content }];
    setTurns(history);
    setDraft('');
    setError(null);
    setBusy(true);
    try {
      const res = await apiFetch('/api/now-what/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history,
          mode: 'turn',
          phase: 'fire_1',
          ...(fieldContext ? { fieldContext } : {}),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || 'Not available right now.');
      setTurns(prev => [...prev, { role: 'assistant', content: json.reply }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Not available right now.');
    } finally {
      setBusy(false);
    }
  }

  const serif = { fontFamily: 'Georgia, "Times New Roman", serif' } as const;

  return (
    <div className="min-h-screen flex flex-col" style={{ color: INK }}>
      <header className="flex items-center justify-between px-6 py-4" style={{ borderBottom: `1px solid ${RULE}` }}>
        <span className="font-light" style={{ ...serif, fontSize: 19 }}>Now What?</span>
        <span className="uppercase" style={{ color: GOLD, fontSize: 9, letterSpacing: '0.28em' }}>
          with Larry Closs
        </span>
      </header>

      <main className="flex-1 overflow-y-auto px-6">
        <div className="mx-auto w-full" style={{ maxWidth: 620, paddingTop: 56, paddingBottom: 20 }}>
          {turns.length === 0 && (
            <div className="text-center" style={{ marginBottom: 40 }}>
              <p className="font-light" style={{ ...serif, fontSize: 22, color: DIM, margin: 0 }}>
                Good to see you.
              </p>
              <p className="font-light" style={{ ...serif, fontSize: 27, marginTop: 8 }}>
                What&rsquo;s going on?
              </p>
            </div>
          )}

          {turns.map((t, i) =>
            t.role === 'user' ? (
              <div key={i} className="text-right" style={{ marginBottom: 22 }}>
                <span
                  className="inline-block text-left"
                  style={{
                    background: 'rgba(196,164,110,0.09)', border: `1px solid ${RULE}`,
                    borderRadius: '15px 15px 3px 15px', padding: '11px 16px',
                    maxWidth: '84%', fontSize: 15, whiteSpace: 'pre-wrap',
                  }}
                >
                  {t.content}
                </span>
              </div>
            ) : (
              <p key={i} style={{ color: DIM, fontSize: 15.5, lineHeight: 1.75, maxWidth: '94%',
                                  whiteSpace: 'pre-wrap', margin: '0 0 22px' }}>
                {t.content}
              </p>
            ),
          )}

          {busy && <p style={{ color: FAINT, fontSize: 14, fontStyle: 'italic' }}>…</p>}
          {error && <p style={{ color: '#c98b6b', fontSize: 13.5 }}>{error}</p>}
          <div ref={endRef} />
        </div>
      </main>

      <div className="px-6 pb-6 pt-3" style={{ borderTop: `1px solid ${RULE}` }}>
        <div
          className="mx-auto flex items-end gap-3"
          style={{ maxWidth: 620, border: `1px solid ${RULE}`, borderRadius: 24,
                   padding: '11px 16px', background: 'rgba(255,255,255,0.02)' }}
        >
          <textarea
            rows={1}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Type what&rsquo;s on your mind…"
            aria-label="Message"
            className="flex-1 bg-transparent outline-none resize-none"
            style={{ color: INK, fontSize: 16, lineHeight: 1.5, maxHeight: 130 }}
          />
          <button
            onClick={send}
            disabled={busy || !draft.trim()}
            aria-label="Send"
            className="disabled:opacity-40"
            style={{ background: 'none', border: 0, color: GOLD, fontSize: 17, cursor: 'pointer' }}
          >
            &uarr;
          </button>
        </div>
      </div>
    </div>
  );
}

export default function NowWhatConversationPage() {
  return (
    <div className="min-h-screen" style={{
      background: 'radial-gradient(ellipse 90% 42% at 50% 0%, rgba(196,164,110,0.08), transparent 62%),'
                + ' linear-gradient(#211d18, #1b1815)' }}>
      <Suspense fallback={null}>
        <Conversation />
      </Suspense>
    </div>
  );
}
