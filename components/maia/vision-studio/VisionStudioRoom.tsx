'use client';

/**
 * Vision Studio Room — Living Field genesis experience.
 *
 * A practitioner-facilitated Spiralogic Interview in which the participant
 * begins developing their Living Field before the formal in-person session.
 * Evidence accumulates by explicit authorship gesture; MAIA proposes, the
 * participant is always the author.
 *
 * Phases: arrival (Opening frame) → conversation → proposal → closed
 *
 * Governance invariants (inherited, load-bearing):
 *   - Nothing persists without explicit member gesture.
 *   - No sorting, typing, or identity modeling.
 *   - MAIA proposes; participant authors. Proposing nothing is faithful.
 *   - can_be_shown_to_practitioner defaults FALSE; set only by an explicit per-thread member gesture ("Share with your practitioner"). Carrying a thread is private to the member's field; sharing is a separate choice.
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '@/lib/http/apiBase';

type Role = 'user' | 'assistant';
interface Turn { role: Role; content: string; }
interface ProposedThread { title: string; reflection: string; groundedIn: string; }
type Decision = 'keep' | 'revise' | 'discard' | 'split';
interface AuthoredThread { title: string; origin: 'maia_proposed' | 'member_authored'; }
interface CarryPayload {
  proposals: { title: string; decision: Decision; revisedTitle?: string; children?: string[]; shareWithPractitioner?: boolean }[];
  created: { title: string; shareWithPractitioner: boolean }[];
}

type RoomPhase = 'arrival' | 'conversation' | 'proposal' | 'closed';

const OPENING_FRAME = `Before we begin, I'd like to frame what we're doing together.

This isn't an intake interview.

It isn't an assessment.

It isn't a process of gathering information about you.

Think of this as the beginning of a Living Field.

Everything we explore here becomes part of a shared developmental context that continues to support the work over time.

The field develops.

You participate in it.

That distinction matters.

We're not trying to build a profile of who you are.

We're creating a place where the work you're doing can continue to unfold.

Some ideas will become clearer.

Some questions will remain open.

Some practices may emerge.

Nothing needs to be finished today.

Our purpose isn't to reach conclusions.

It's to begin a field that can continue to hold what is becoming possible.

If something doesn't feel true, we'll leave it as an observation rather than forcing an interpretation.

The authority for meaning stays with you.

The field will remember the work.

You remain the author of its meaning.

One thing to name clearly: Kelly can accompany this field as your facilitating practitioner. What you author here is yours and enters your own Living Field — private by default. Sharing any thread with Kelly is a separate choice you make thread by thread; nothing is shared unless you choose it. Never the conversation, never a record of who you are — only what you explicitly choose to share.

This is an early beta, and part of what you are helping us learn is how this kind of field can support your own recognition without turning you into a profile.`;

const PHASE_LABELS: Record<string, string> = {
  fire_1: 'Fire I — Vision',
  fire_2: 'Fire II — Expression',
  fire_3: 'Fire III — Illumination',
  water_1: 'Water I — Feeling',
  water_2: 'Water II — Transformation',
  water_3: 'Water III — Inner Wisdom',
  earth_1: 'Earth I — Grounding',
  earth_2: 'Earth II — Building',
  earth_3: 'Earth III — Embodiment',
  air_1: 'Air I — Understanding',
  air_2: 'Air II — Dialogue',
  air_3: 'Air III — Contribution',
};

const PHASE_OPENING_QUESTIONS: Record<string, string> = {
  fire_1: "When you imagine the world your work is trying to call into being — not what you're doing to get there, but the world itself — what do you see?",
  fire_2: "Tell me about a specific moment — a conversation, an encounter, someone you worked with — when the vision actually landed. What happened?",
  fire_3: "After years of living inside this work, what does it keep teaching you that you couldn't have learned any other way?",
  water_1: "What is the original wound or beauty that gave birth to this work — not the idea, but the experience?",
  water_2: "What have you had to give up, let go of, or be changed by in order to keep doing this work?",
  water_3: "What do you know about this — about human beings, about change — that you couldn't teach someone else directly, that they'd have to live into?",
};

const CLOSURE_QUESTION = 'Before we pause — what surprised you in what you just said? Is there anything you want to name before we stop?';

interface Props {
  phase?: string;
  fieldContext?: string;
}

export function VisionStudioRoom({ phase = 'fire_1', fieldContext }: Props) {
  const [roomPhase, setRoomPhase] = useState<RoomPhase>('arrival');
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState('');
  const [working, setWorking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [proposed, setProposed] = useState<ProposedThread[]>([]);
  const [authored, setAuthored] = useState<AuthoredThread[]>([]);
  const [revising, setRevising] = useState<Record<string, string>>({});
  const [newThread, setNewThread] = useState('');
  const [guided, setGuided] = useState(true);
  const [showFrame, setShowFrame] = useState(false);
  // Per-thread sharing consent: keyed by thread title; absent = private (default).
  const [shared, setShared] = useState<Record<string, boolean>>({});
  const scrollRef = useRef<HTMLDivElement>(null);
  const sessionRef = useRef<string>(`vs-${Date.now()}`);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [turns, working]);

  async function callInterview(history: Turn[], mode: 'turn' | 'propose') {
    const res = await apiFetch('/api/maia/vision-studio/interview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ history, mode, phase }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json?.error || 'Not available right now.');
    return json;
  }

  async function sendTurn(text: string) {
    const content = text.trim();
    if (!content || working) return;
    setError(null);
    const newTurn: Turn = { role: 'user', content };
    const updated = [...turns, newTurn];
    setTurns(updated);
    setDraft('');
    setWorking(true);
    try {
      const json = await callInterview(updated, 'turn');
      setTurns(prev => [...prev, { role: 'assistant', content: json.reply }]);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setWorking(false);
    }
  }

  async function listenBack() {
    if (turns.length < 2 || working) return;
    setError(null);
    setWorking(true);
    try {
      const json = await callInterview(turns, 'propose');
      setProposed(json.threads ?? []);
      setRoomPhase('proposal');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setWorking(false);
    }
  }

  async function carry(payload: CarryPayload) {
    setSaving(true);
    try {
      const res = await apiFetch('/api/maia/vision-studio/field-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposals: payload.proposals,
          created: payload.created,
          sessionRef: sessionRef.current,
          spiralogicPhase: phase,
          fieldContext: fieldContext ?? null,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || 'Could not save.');
      setRoomPhase('closed');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  function handleDecision(thread: ProposedThread, decision: Decision, revisedTitle?: string) {
    if (decision === 'keep') {
      setAuthored(prev => [...prev, { title: thread.title, origin: 'maia_proposed' }]);
    } else if (decision === 'revise' && revisedTitle) {
      setAuthored(prev => [...prev, { title: revisedTitle, origin: 'member_authored' }]);
    }
  }

  function collectPayload(): CarryPayload {
    const proposals = proposed.map(t => {
      const rev = revising[t.title];
      if (rev !== undefined) {
        if (rev === '') return { title: t.title, decision: 'discard' as Decision, shareWithPractitioner: false };
        // For a revised thread, the sharing key is the revised title the member chose.
        return { title: t.title, decision: 'revise' as Decision, revisedTitle: rev, shareWithPractitioner: !!shared[rev] };
      }
      if (authored.some(a => a.title === t.title)) return { title: t.title, decision: 'keep' as Decision, shareWithPractitioner: !!shared[t.title] };
      return { title: t.title, decision: 'discard' as Decision, shareWithPractitioner: false };
    });
    const trimmed = newThread.trim();
    const created = trimmed ? [{ title: trimmed, shareWithPractitioner: !!shared[trimmed] }] : [];
    return { proposals, created };
  }

  const phaseLabel = PHASE_LABELS[phase] ?? phase;
  const openingQuestion = PHASE_OPENING_QUESTIONS[phase];

  // — Arrival: Ways to Begin —
  if (roomPhase === 'arrival') {
    return (
      <div className="max-w-prose mx-auto px-4 py-12 space-y-10">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-widest text-stone-400">Vision Studio</p>
          <h1 className="text-lg font-light text-stone-200">{phaseLabel}</h1>
        </div>

        <div className="space-y-1">
          <p className="text-stone-300 text-base font-light leading-relaxed">Every practitioner begins differently.</p>
          <p className="text-stone-500 text-sm font-light leading-relaxed">Choose whatever feels most natural today.</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => { setGuided(false); setRoomPhase('conversation'); }}
            className="w-full text-left border border-stone-800 rounded-lg px-5 py-4 hover:border-stone-600 hover:bg-stone-900/40 transition-colors"
          >
            <p className="text-stone-200 text-sm font-light">Begin in your own words</p>
            <p className="text-stone-500 text-xs font-light mt-1">Just start — no prompt, no structure.</p>
          </button>

          <button
            onClick={() => { setGuided(true); setRoomPhase('conversation'); }}
            className="w-full text-left border border-stone-800 rounded-lg px-5 py-4 hover:border-stone-600 hover:bg-stone-900/40 transition-colors"
          >
            <p className="text-stone-200 text-sm font-light">Begin with a question</p>
            <p className="text-stone-500 text-xs font-light mt-1">A place to start, at your own pace.</p>
          </button>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => setShowFrame(v => !v)}
            className="text-stone-500 hover:text-stone-300 text-xs underline underline-offset-4 transition-colors"
          >
            {showFrame ? 'Hide' : 'What is this space?'}
          </button>
          {showFrame && (
            <div className="text-stone-400 text-sm leading-relaxed whitespace-pre-line font-light italic border-l-2 border-stone-800 pl-4">
              {OPENING_FRAME}
            </div>
          )}
        </div>

        <div className="border-t border-stone-900 pt-4 text-stone-600 text-xs font-light leading-relaxed">
          The authority for meaning stays with you. What you carry stays private in your own field; sharing a thread with your practitioner is a separate, explicit choice — off by default. Never the conversation, never a record of who you are.
        </div>
      </div>
    );
  }

  // — Closed: session complete —
  if (roomPhase === 'closed') {
    return (
      <div className="max-w-prose mx-auto px-4 py-12 space-y-6">
        <p className="text-xs uppercase tracking-widest text-stone-400">Vision Studio</p>
        <p className="text-stone-300 font-light text-base leading-relaxed">
          {authored.length > 0
            ? `${authored.length} thread${authored.length === 1 ? '' : 's'} carried into your field.`
            : 'Nothing carried — that is a faithful outcome too.'}
        </p>
        {authored.length > 0 && (
          <ul className="space-y-2">
            {authored.map((t, i) => (
              <li key={i} className="text-stone-400 text-sm font-light border-l-2 border-stone-700 pl-3">
                {t.title}
              </li>
            ))}
          </ul>
        )}
        <p className="text-stone-500 text-sm font-light">
          The field holds what you authored. You may return to continue.
        </p>
      </div>
    );
  }

  // — Proposal: listen-back + authorship —
  if (roomPhase === 'proposal') {
    return (
      <div className="max-w-prose mx-auto px-4 py-12 space-y-8">
        <div>
          <p className="text-xs uppercase tracking-widest text-stone-400 mb-1">Vision Studio</p>
          <p className="text-stone-400 text-sm font-light">{phaseLabel} — What surfaced</p>
        </div>

        <div className="text-stone-400 text-sm font-light leading-relaxed border-l-2 border-stone-700 pl-4">
          {CLOSURE_QUESTION}
        </div>

        {proposed.length === 0 ? (
          <p className="text-stone-500 text-sm font-light italic">
            Nothing clear enough to propose — that is a faithful outcome. You may name something yourself below.
          </p>
        ) : (
          <div className="space-y-6">
            <p className="text-stone-500 text-xs uppercase tracking-widest">Threads MAIA heard returning</p>
            {proposed.map((t, i) => {
              const rev = revising[t.title];
              const kept = authored.some(a => a.title === t.title);
              return (
                <div key={i} className="space-y-2 border-l-2 border-stone-700 pl-4">
                  {rev !== undefined ? (
                    rev === '' ? (
                      <p className="text-stone-600 text-sm line-through">{t.title}</p>
                    ) : (
                      <input
                        className="bg-transparent border-b border-stone-600 text-stone-200 text-sm w-full focus:outline-none"
                        value={rev}
                        onChange={e => setRevising(r => ({ ...r, [t.title]: e.target.value }))}
                      />
                    )
                  ) : (
                    <p className={`text-sm font-light ${kept ? 'text-stone-200' : 'text-stone-400'}`}>
                      {t.title}
                    </p>
                  )}
                  <p className="text-stone-500 text-xs font-light leading-relaxed">{t.reflection}</p>
                  <div className="flex gap-3 text-xs">
                    {rev === undefined && !kept && (
                      <>
                        <button
                          onClick={() => { handleDecision(t, 'keep'); }}
                          className="text-stone-400 hover:text-stone-200 underline underline-offset-2"
                        >carry</button>
                        <button
                          onClick={() => setRevising(r => ({ ...r, [t.title]: t.title }))}
                          className="text-stone-500 hover:text-stone-300 underline underline-offset-2"
                        >revise</button>
                        <button
                          onClick={() => setRevising(r => ({ ...r, [t.title]: '' }))}
                          className="text-stone-600 hover:text-stone-400 underline underline-offset-2"
                        >leave</button>
                      </>
                    )}
                    {kept && <span className="text-stone-500 italic">carried</span>}
                    {rev === '' && (
                      <button
                        onClick={() => setRevising(r => { const n = { ...r }; delete n[t.title]; return n; })}
                        className="text-stone-600 hover:text-stone-400 underline underline-offset-2"
                      >undo</button>
                    )}
                    {rev !== undefined && rev !== '' && (
                      <button
                        onClick={() => { handleDecision(t, 'revise', rev); }}
                        className="text-stone-400 hover:text-stone-200 underline underline-offset-2"
                      >carry revised</button>
                    )}
                  </div>
                  {/* Share toggle — only shown when thread is carried (kept or carry-revised) */}
                  {(kept || (rev !== undefined && rev !== '' && authored.some(a => a.title === rev))) && (
                    <label className="flex items-center gap-2 cursor-pointer mt-1">
                      <input
                        type="checkbox"
                        checked={!!shared[rev !== undefined && rev !== '' ? rev : t.title]}
                        onChange={e => {
                          const key = rev !== undefined && rev !== '' ? rev : t.title;
                          setShared(s => ({ ...s, [key]: e.target.checked }));
                        }}
                        className="accent-stone-500 w-3 h-3"
                      />
                      <span className="text-stone-600 text-xs font-light">Share with your practitioner</span>
                    </label>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="space-y-2">
          <p className="text-stone-500 text-xs uppercase tracking-widest">Something of your own</p>
          <input
            className="bg-transparent border-b border-stone-700 text-stone-300 text-sm w-full focus:outline-none focus:border-stone-500 placeholder:text-stone-700 py-1"
            placeholder="Name a thread that is genuinely yours..."
            value={newThread}
            onChange={e => setNewThread(e.target.value)}
          />
          {newThread.trim() && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={!!shared[newThread.trim()]}
                onChange={e => setShared(s => ({ ...s, [newThread.trim()]: e.target.checked }))}
                className="accent-stone-500 w-3 h-3"
              />
              <span className="text-stone-600 text-xs font-light">Share with your practitioner</span>
            </label>
          )}
        </div>

        {error && <p className="text-red-400 text-xs">{error}</p>}

        <div className="border-t border-stone-900 pt-4 text-stone-600 text-xs font-light leading-relaxed space-y-1">
          <p>What you carry enters your own Living Field — private by default.</p>
          <p>Sharing a thread with your practitioner is a separate choice, per thread; nothing is shared unless you check it.</p>
          <p>Only what you authored or affirmed. Not a record of this conversation. Nothing the system concluded about you.</p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => carry(collectPayload())}
            disabled={saving}
            className="text-stone-300 hover:text-stone-100 text-sm underline underline-offset-4 transition-colors disabled:opacity-40"
          >
            {saving ? 'Saving…' : 'Carry what I chose'}
          </button>
          <button
            onClick={() => carry({ proposals: [], created: [] })}
            className="text-stone-600 hover:text-stone-400 text-sm underline underline-offset-4 transition-colors"
          >
            Leave without carrying
          </button>
        </div>
      </div>
    );
  }

  // — Conversation —
  return (
    <div className="flex flex-col h-full max-w-prose mx-auto">
      <div className="px-4 py-4 border-b border-stone-800 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-stone-500">Vision Studio</p>
          <p className="text-stone-400 text-sm font-light">{phaseLabel}</p>
        </div>
        {turns.length >= 4 && (
          <button
            onClick={listenBack}
            disabled={working}
            className="text-stone-500 hover:text-stone-300 text-xs underline underline-offset-2 transition-colors disabled:opacity-40"
          >
            Listen back
          </button>
        )}
      </div>

      {guided && openingQuestion && turns.length === 0 && (
        <div className="px-4 py-6 border-b border-stone-800">
          <p className="text-stone-300 text-base font-light leading-relaxed">{openingQuestion}</p>
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        <AnimatePresence initial={false}>
          {turns.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-sm leading-relaxed font-light ${t.role === 'user' ? 'text-stone-200' : 'text-stone-400'}`}
            >
              {t.content}
            </motion.div>
          ))}
          {working && (
            <motion.div
              key="working"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-stone-600 text-sm font-light"
            >
              …
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <div className="px-4 py-2 text-red-400 text-xs">{error}</div>
      )}

      <div className="px-4 py-4 border-t border-stone-800">
        <textarea
          className="w-full bg-transparent text-stone-200 text-sm font-light leading-relaxed resize-none focus:outline-none placeholder:text-stone-700"
          placeholder="Say something…"
          rows={3}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendTurn(draft);
            }
          }}
        />
        <div className="flex justify-between items-center mt-2">
          <span className="text-stone-700 text-xs">Enter to send · Shift+Enter for newline</span>
          <button
            onClick={() => sendTurn(draft)}
            disabled={working || !draft.trim()}
            className="text-stone-400 hover:text-stone-200 text-xs underline underline-offset-2 transition-colors disabled:opacity-30"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
