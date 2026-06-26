'use client';

/**
 * The Crossing Room — Field Lab.
 *
 * A recognition engine, not an interview engine. One conversation in which MAIA
 * helps a member recognize a thread that feels genuinely theirs, which the
 * member then authors (or chooses not to). The authored crossing — not the
 * conversation — is the product.
 *
 * Invariant (load-bearing — do not soften):
 *   - Recognition determines the ending, never the clock. There is no question
 *     counter and no progress bar toward an output.
 *   - The member is always free to leave with nothing. That exit is a SUCCESS,
 *     not an abandonment.
 *   - MAIA proposes, never declares. Proposing nothing is a faithful outcome.
 *   - Nothing here builds a model of the person — no categories, no elements,
 *     no scores. The conversation is ephemeral; only an authored thread crosses
 *     (persisted via /api/maia/field-lab/field-note, by an explicit member gesture).
 *
 * Spec: docs/specs/FIELD_LAB_CONVERSATIONAL_INTERVIEW_SPEC_2026-06-26.md
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '@/lib/http/apiBase';

type Role = 'user' | 'assistant';
interface Turn {
  role: Role;
  content: string;
}
interface ProposedThread {
  title: string;
  reflection: string;
  groundedIn: string;
}
type Decision = 'keep' | 'revise' | 'discard' | 'split';
interface AuthoredThread {
  title: string;
  origin: 'maia_proposed' | 'member_authored';
}
interface CarryPayload {
  proposals: { title: string; decision: Decision; revisedTitle?: string; children?: string[] }[];
  created: string[];
}

type Phase = 'arrival' | 'conversation' | 'proposal' | 'closed';

export function CrossingRoom() {
  const [phase, setPhase] = useState<Phase>('arrival');
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState('');
  const [working, setWorking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [proposed, setProposed] = useState<ProposedThread[]>([]);
  const [authored, setAuthored] = useState<AuthoredThread[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sessionRef = useRef<string>('');

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [turns, working]);

  async function callInterview(history: Turn[], mode: 'turn' | 'propose') {
    const res = await apiFetch('/api/maia/field-lab/interview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ history, mode }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json?.error || 'Something is not available right now.');
    return json;
  }

  async function sendTurn(text: string) {
    const content = text.trim();
    if (!content || working) return;
    setError(null);
    const next: Turn[] = [...turns, { role: 'user', content }];
    setTurns(next);
    setDraft('');
    setWorking(true);
    try {
      const json = await callInterview(next, 'turn');
      setTurns([...next, { role: 'assistant', content: String(json.reply || '') }]);
    } catch (e: any) {
      setError(e?.message || 'A connection hiccup. Try again in a moment.');
      setTurns(next); // keep the member's words; drop the failed reply
    } finally {
      setWorking(false);
    }
  }

  async function beginFromArrival() {
    if (!draft.trim()) return;
    sessionRef.current =
      (typeof crypto !== 'undefined' && crypto.randomUUID?.()) ||
      Math.random().toString(36).slice(2);
    setPhase('conversation');
    await sendTurn(draft);
  }

  async function askForReflection() {
    if (working || turns.length === 0) return;
    setError(null);
    setWorking(true);
    try {
      const json = await callInterview(turns, 'propose');
      setProposed(Array.isArray(json.threads) ? json.threads : []);
      setPhase('proposal');
    } catch (e: any) {
      setError(e?.message || 'A connection hiccup. Try again in a moment.');
    } finally {
      setWorking(false);
    }
  }

  // Leaving with nothing is a first-class, successful close. Nothing is saved.
  function leaveWithNothing() {
    setAuthored([]);
    setPhase('closed');
  }

  // The crossing: persist only what the member authored.
  async function carryForward(payload: CarryPayload) {
    if (saving) return;
    setError(null);
    setSaving(true);
    const finalAuthored: AuthoredThread[] = [
      ...payload.proposals
        .filter((p) => p.decision === 'keep' || p.decision === 'revise')
        .map((p) => ({
          title: p.decision === 'revise' ? (p.revisedTitle || p.title) : p.title,
          origin: 'maia_proposed' as const,
        })),
      // split: the original is not kept; the member-authored children are
      ...payload.proposals
        .filter((p) => p.decision === 'split')
        .flatMap((p) => (p.children ?? []).map((c) => ({ title: c, origin: 'member_authored' as const }))),
      ...payload.created.map((t) => ({ title: t, origin: 'member_authored' as const })),
    ];
    try {
      const res = await apiFetch('/api/maia/field-lab/field-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, sessionRef: sessionRef.current }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || 'Could not save right now.');
      setAuthored(finalAuthored);
      setPhase('closed');
    } catch (e: any) {
      setError(e?.message || 'Could not save. Your conversation is unaffected; try once more.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-[60vh] flex flex-col">
      <AnimatePresence mode="wait">
        {phase === 'arrival' && (
          <motion.div
            key="arrival"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="flex-1 flex flex-col items-center justify-center text-center px-2 py-16"
          >
            <p className="font-cormorant text-[26px] font-light text-amber-50/90 leading-snug max-w-md">
              What feels most alive for you today?
            </p>
            <p className="text-[13px] text-soullab-text-muted mt-3 mb-6 max-w-sm">
              No forms. Just talk. We&apos;ll stay with it as long as it&apos;s useful — and you&apos;re
              always free to leave with nothing.
            </p>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) beginFromArrival();
              }}
              rows={3}
              placeholder="Begin wherever you are…"
              className="w-full max-w-md rounded-2xl border border-amber-500/15 bg-stone-900/40 backdrop-blur-sm px-4 py-3 text-[15px] text-soullab-text-primary placeholder:text-soullab-text-muted focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400/30 transition-all resize-y leading-relaxed"
            />
            <button
              type="button"
              onClick={beginFromArrival}
              disabled={!draft.trim()}
              className="mt-4 rounded-xl px-6 py-2.5 text-[14.5px] font-medium tracking-wide border bg-stone-900/50 text-amber-50/90 border-amber-500/20 hover:bg-stone-900/70 hover:border-amber-400/30 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
            >
              Begin
            </button>
          </motion.div>
        )}

        {(phase === 'conversation' || phase === 'proposal') && (
          <motion.div
            key="conversation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col"
          >
            <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-5 pb-4 max-h-[52vh]">
              {turns.map((t, i) => (
                <div key={i} className={t.role === 'user' ? 'text-right' : 'text-left'}>
                  <span
                    className={[
                      'inline-block rounded-2xl px-4 py-2.5 text-[14.5px] leading-relaxed max-w-[85%] text-left',
                      t.role === 'user'
                        ? 'bg-stone-900/50 text-soullab-text-primary border border-amber-500/10'
                        : 'text-soullab-text-secondary',
                    ].join(' ')}
                  >
                    {t.content}
                  </span>
                </div>
              ))}
              {working && phase === 'conversation' && (
                <div className="text-left text-[13px] text-soullab-text-muted italic">listening…</div>
              )}
            </div>

            {error && (
              <div className="mb-3 rounded-xl border border-amber-400/30 bg-amber-900/15 p-3 text-[13px] text-amber-100/80">
                {error}
              </div>
            )}

            {phase === 'conversation' && (
              <div className="border-t border-amber-500/10 pt-4 space-y-3">
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) sendTurn(draft);
                  }}
                  rows={2}
                  placeholder="Say more…"
                  disabled={working}
                  className="w-full rounded-xl border border-amber-500/15 bg-stone-900/40 backdrop-blur-sm px-4 py-3 text-[15px] text-soullab-text-primary placeholder:text-soullab-text-muted focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400/30 transition-all resize-y leading-relaxed"
                />
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => sendTurn(draft)}
                    disabled={working || !draft.trim()}
                    className="rounded-xl px-5 py-2.5 text-[14px] font-medium border bg-stone-900/50 text-amber-50/90 border-amber-500/20 hover:bg-stone-900/70 hover:border-amber-400/30 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
                  >
                    {working ? '…' : 'Continue'}
                  </button>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={askForReflection}
                      disabled={working || turns.length < 2}
                      className="text-[13px] text-amber-300/80 hover:text-amber-200 disabled:opacity-40 disabled:cursor-not-allowed underline-offset-4 hover:underline transition-colors"
                    >
                      Reflect what you&apos;re hearing
                    </button>
                    <button
                      type="button"
                      onClick={leaveWithNothing}
                      className="text-[13px] text-soullab-text-muted hover:text-soullab-text-secondary underline-offset-4 hover:underline transition-colors"
                    >
                      I&apos;m complete for now
                    </button>
                  </div>
                </div>
              </div>
            )}

            {phase === 'proposal' && (
              <Crossing
                proposed={proposed}
                saving={saving}
                onCarry={carryForward}
                onLeave={leaveWithNothing}
              />
            )}
          </motion.div>
        )}

        {phase === 'closed' && (
          <motion.div
            key="closed"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-1 flex flex-col items-center justify-center text-center px-2 py-16"
          >
            {authored.length === 0 ? (
              <>
                <p className="font-cormorant text-[24px] font-light text-amber-50/90">
                  Nothing needed to be kept today.
                </p>
                <p className="text-[14px] text-soullab-text-secondary mt-3 max-w-sm">
                  That&apos;s a complete and good outcome. The conversation stays with you, and nothing
                  was remembered.
                </p>
              </>
            ) : (
              <>
                <p className="font-cormorant text-[24px] font-light text-amber-50/90">
                  These stay with you, because you chose them.
                </p>
                <ul className="mt-4 space-y-2">
                  {authored.map((t, i) => (
                    <li key={i} className="text-[15px] text-soullab-text-secondary italic">
                      &ldquo;{t.title}&rdquo;
                    </li>
                  ))}
                </ul>
                <p className="text-[12.5px] text-soullab-text-muted mt-5 max-w-sm">
                  Held only because you authored them — not because they were proposed.
                </p>
                <a
                  href="/maia/field-lab/your-threads"
                  className="mt-5 text-[13px] text-amber-300/80 hover:text-amber-200 underline-offset-4 hover:underline"
                >
                  Visit your threads — to return, revise, or release →
                </a>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Crossing({
  proposed,
  saving,
  onCarry,
  onLeave,
}: {
  proposed: ProposedThread[];
  saving: boolean;
  onCarry: (payload: CarryPayload) => void;
  onLeave: () => void;
}) {
  const [decided, setDecided] = useState<Record<number, Decision>>({});
  const [revised, setRevised] = useState<Record<number, string>>({});
  const [revising, setRevising] = useState<number | null>(null);
  const [revisionText, setRevisionText] = useState('');
  const [ownThread, setOwnThread] = useState('');
  const [created, setCreated] = useState<string[]>([]);
  // Split: per-proposal member-authored children + the in-progress draft per card.
  const [children, setChildren] = useState<Record<number, string[]>>({});
  const [splitDraft, setSplitDraft] = useState<Record<number, string>>({});

  function act(i: number, t: ProposedThread, d: Decision) {
    if (d === 'revise') {
      setRevising(i);
      setRevisionText(t.title);
      return;
    }
    setDecided((s) => ({ ...s, [i]: d }));
  }
  function commitRevision(i: number, t: ProposedThread) {
    const title = revisionText.trim() || t.title;
    setRevised((s) => ({ ...s, [i]: title }));
    setDecided((s) => ({ ...s, [i]: 'revise' }));
    setRevising(null);
  }
  function originate() {
    const t = ownThread.trim();
    if (!t) return;
    setCreated((c) => [...c, t]);
    setOwnThread('');
  }
  function addChild(i: number) {
    const c = (splitDraft[i] ?? '').trim();
    if (!c) return;
    setChildren((s) => ({ ...s, [i]: [...(s[i] ?? []), c] }));
    setSplitDraft((s) => ({ ...s, [i]: '' }));
  }
  function removeChild(i: number, ci: number) {
    setChildren((s) => ({ ...s, [i]: (s[i] ?? []).filter((_, k) => k !== ci) }));
  }

  // A split contributes the children the member authored, never the (unkept) original.
  const splitChildCount = Object.entries(children).reduce(
    (n, [i, arr]) => n + (decided[Number(i)] === 'split' ? arr.length : 0),
    0,
  );
  const authoredCount =
    Object.values(decided).filter((d) => d === 'keep' || d === 'revise').length +
    created.length +
    splitChildCount;

  function carry() {
    if (saving || authoredCount === 0) return;
    const proposals = proposed.map((t, i) => ({
      title: t.title,
      decision: (decided[i] ?? 'discard') as Decision,
      revisedTitle: revised[i],
      children: decided[i] === 'split' ? (children[i] ?? []) : undefined,
    }));
    onCarry({ proposals, created });
  }

  return (
    <div className="border-t border-amber-500/10 pt-5 space-y-4">
      <p className="text-[14px] text-soullab-text-secondary">
        Is there anything here that belongs in your understanding? You&apos;re the author — keep what
        is yours, reshape what isn&apos;t, and leave the rest.
      </p>

      {proposed.length === 0 ? (
        <p className="text-[14px] text-soullab-text-muted italic">
          Nothing clear enough surfaced to offer today — and that&apos;s honest, not a failure.
        </p>
      ) : (
        proposed.map((t, i) => {
          const d = decided[i];
          return (
            <div
              key={i}
              className={[
                'rounded-2xl border p-4 transition-all',
                d && d !== 'split'
                  ? 'border-amber-500/10 bg-stone-900/20 opacity-60'
                  : 'border-amber-500/15 bg-stone-900/40 backdrop-blur-sm',
              ].join(' ')}
            >
              <div className="font-cormorant text-[19px] text-amber-50/90 mb-1">
                {revised[i] || t.title}
              </div>
              {t.reflection && !d && (
                <p className="text-[13.5px] text-soullab-text-secondary leading-relaxed">{t.reflection}</p>
              )}
              {revising === i ? (
                <div className="mt-3 space-y-2">
                  <input
                    value={revisionText}
                    onChange={(e) => setRevisionText(e.target.value)}
                    className="w-full rounded-lg border border-amber-400/30 bg-stone-900/50 px-3 py-2 text-[14px] text-soullab-text-primary focus:outline-none"
                    placeholder="Name it in your own words…"
                  />
                  <button
                    type="button"
                    onClick={() => commitRevision(i, t)}
                    className="text-[13px] text-amber-300/80 hover:text-amber-200 underline-offset-4 hover:underline"
                  >
                    This is mine
                  </button>
                </div>
              ) : d === 'split' ? (
                <div className="mt-3 space-y-2">
                  <p className="text-[12px] text-soullab-text-muted uppercase tracking-wider">
                    separated into your own threads
                  </p>
                  {(children[i] ?? []).length > 0 && (
                    <ul className="space-y-1">
                      {(children[i] ?? []).map((c, ci) => (
                        <li key={ci} className="flex items-center gap-2 text-[13.5px] text-soullab-text-secondary italic">
                          &ldquo;{c}&rdquo;
                          <button
                            type="button"
                            onClick={() => removeChild(i, ci)}
                            className="not-italic text-[11px] text-soullab-text-muted hover:text-amber-200 underline-offset-2 hover:underline"
                          >
                            remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="flex gap-2">
                    <input
                      value={splitDraft[i] ?? ''}
                      onChange={(e) => setSplitDraft((s) => ({ ...s, [i]: e.target.value }))}
                      onKeyDown={(e) => { if (e.key === 'Enter') addChild(i); }}
                      placeholder="Name one of the threads in your own words…"
                      className="flex-1 rounded-lg border border-amber-400/30 bg-stone-900/50 px-3 py-2 text-[13.5px] text-soullab-text-primary placeholder:text-soullab-text-muted focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => addChild(i)}
                      disabled={!(splitDraft[i] ?? '').trim()}
                      className="rounded-lg px-3 py-2 text-[13px] text-amber-300/80 hover:text-amber-200 disabled:opacity-40 border border-amber-500/20"
                    >
                      Add
                    </button>
                  </div>
                </div>
              ) : d ? (
                <p className="mt-2 text-[12px] text-soullab-text-muted uppercase tracking-wider">
                  {d === 'revise' ? 'revised — yours' : d === 'keep' ? 'kept' : 'left'}
                </p>
              ) : (
                <div className="mt-3 flex flex-wrap gap-3 text-[13px]">
                  <button type="button" onClick={() => act(i, t, 'keep')} className="text-amber-300/80 hover:text-amber-200 underline-offset-4 hover:underline">Keep</button>
                  <button type="button" onClick={() => act(i, t, 'revise')} className="text-amber-300/80 hover:text-amber-200 underline-offset-4 hover:underline">Revise</button>
                  <button type="button" onClick={() => act(i, t, 'split')} className="text-amber-300/80 hover:text-amber-200 underline-offset-4 hover:underline">Split</button>
                  <button type="button" onClick={() => act(i, t, 'discard')} className="text-soullab-text-muted hover:text-soullab-text-secondary underline-offset-4 hover:underline">Discard</button>
                </div>
              )}
            </div>
          );
        })
      )}

      <div className="rounded-2xl border border-amber-500/10 bg-stone-900/20 p-4">
        <p className="text-[13px] text-soullab-text-muted mb-2">Something MAIA didn&apos;t name?</p>
        {created.length > 0 && (
          <ul className="mb-3 space-y-1">
            {created.map((c, i) => (
              <li key={i} className="text-[13.5px] text-soullab-text-secondary italic">
                &ldquo;{c}&rdquo;{' '}
                <span className="not-italic text-[11px] uppercase tracking-wider text-amber-300/60">yours</span>
              </li>
            ))}
          </ul>
        )}
        <div className="flex gap-2">
          <input
            value={ownThread}
            onChange={(e) => setOwnThread(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') originate();
            }}
            placeholder="Name your own thread…"
            className="flex-1 rounded-lg border border-amber-500/15 bg-stone-900/40 px-3 py-2 text-[14px] text-soullab-text-primary placeholder:text-soullab-text-muted focus:outline-none focus:border-amber-400/30"
          />
          <button
            type="button"
            onClick={originate}
            disabled={!ownThread.trim()}
            className="rounded-lg px-3 py-2 text-[13px] text-amber-300/80 hover:text-amber-200 disabled:opacity-40 border border-amber-500/20"
          >
            Add
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onLeave}
          disabled={saving}
          className="text-[13px] text-soullab-text-muted hover:text-soullab-text-secondary disabled:opacity-40 underline-offset-4 hover:underline"
        >
          Leave with nothing
        </button>
        <button
          type="button"
          onClick={carry}
          disabled={authoredCount === 0 || saving}
          className="rounded-xl px-5 py-2.5 text-[14px] font-medium border bg-amber-500/15 text-amber-50 border-amber-400/30 hover:bg-amber-500/25 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
        >
          {saving ? 'Carrying…' : `Carry ${authoredCount > 0 ? `${authoredCount} ` : ''}forward`}
        </button>
      </div>
    </div>
  );
}
