'use client';

/**
 * Now What? — Client Home. The room an executive arrives into.
 *
 * `/now-what` had no page: the environment had six rooms and no threshold, so
 * a person who followed their invitation link met a 404 or a sign-in door and
 * had to already know which room they wanted. This is the place that answers
 * "where am I, and what is mine here" before anything asks them to work.
 *
 * REGISTER (why this reads the way it does): the person arriving is carrying
 * live decisions, competing stakeholders and real accountability. They do not
 * need their information managed — they need the thread of their own becoming
 * to still be here when they come back. So the room shows what THEY authored,
 * in their words, and never tells them how they are doing.
 *
 * WHAT THIS ROOM REFUSES, structurally and not as a matter of taste:
 *   - No score, percentage, streak, ranking, completion count or progress bar.
 *   - No system-voiced finding. There is no "theme detected", no "pattern
 *     noticed for you", no third voice narrating the member to themselves.
 *     Every line is either the member's own words or a plain fact about their
 *     own act, and every claim carries its author.
 *   - No recency framing. Bands are ordered by the member's keeping gesture,
 *     never labelled "recent" or "latest" — recent is not important, and
 *     kept is not completed.
 *   - No silent coach visibility. Nothing reaches a coach except by an
 *     explicit per-thread gesture, and the member can see that boundary from
 *     their own side in the Coach connection band.
 *
 * Data comes from ONE member-scoped composition call (`/api/now-what/home`)
 * over material the member already authored. This room creates no storage.
 */

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import { NowWhatShell, NowWhatThreshold, useMemberSession } from '@/components/now-what/NowWhatShell';
import { RoomTrustCopy } from '@/components/now-what/RoomTrustCopy';

const ACCENT = '#ffe27a';

interface HomeThread {
  id: string;
  title: string;
  content: string | null;
  authorship: string;
  keptAt: string;
  sharedWithCoach: boolean;
  sessionRef: string | null;
}

interface JourneyRow {
  programSlug: string;
  programTitle: string | null;
  focalPoint: string;
  statedBy: string;
  confirmedAt: string | null;
}

interface SessionRow {
  ref: string;
  at: string;
  carried: number;
}

interface HomePayload {
  journey: JourneyRow[];
  decisions: HomeThread[];
  commitments: HomeThread[];
  questions: HomeThread[];
  reflections: HomeThread[];
  shared: HomeThread[];
  sessions: SessionRow[];
}

// ── Presentation primitives ──────────────────────────────────────────────
// One glass vocabulary shared with the map and the field, so learning one
// room is learning all of them. Atmosphere lives BETWEEN the panels.

const PANEL =
  'relative rounded-2xl border border-slate-600/50 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-6 sm:p-7';

function dayLabel(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
}

/** Whose act made this exist. Attribution is necessary, never decorative. */
function authorLine(authorship: string): string {
  if (authorship === 'member_authored') return 'in your words';
  if (authorship === 'member_confirmed') return 'you kept this';
  return 'you kept this';
}

function Section({
  eyebrow,
  title,
  lead,
  children,
  delay = 0,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <section className={PANEL} style={{ animation: `nwhFadeUp 0.55s ease ${delay}ms both` }}>
      <p className="text-[11px] uppercase tracking-[0.3em] mb-2" style={{ color: ACCENT }}>
        {eyebrow}
      </p>
      <h2 className="text-slate-100 text-xl sm:text-2xl font-extralight tracking-wide">{title}</h2>
      {lead && (
        <p className="text-slate-400 text-sm font-light leading-relaxed mt-2 max-w-prose">{lead}</p>
      )}
      <div className="mt-5">{children}</div>
    </section>
  );
}

/**
 * Empty states are first-class. A person with nothing here yet is not in an
 * error state and must never be shown one — they are at the beginning, which
 * is a valid place to be standing. No "no data", no zero counts.
 */
function Quiet({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-slate-400 text-sm font-light leading-relaxed max-w-prose">{children}</p>
  );
}

/** A member-authored item. Title is their words; content is their words. */
function ThreadCard({ t, onWithdraw }: { t: HomeThread; onWithdraw?: () => void }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Withdrawal changes only WHO MAY SEE this thread. It does not release,
  // delete or reorder it — the thread stays exactly where the member put it.
  async function withdraw() {
    if (busy) return;
    setBusy(true);
    setErr(null);
    try {
      const res = await apiFetch(`/api/now-what/field-note/${t.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'withdraw_practitioner_visibility' }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || 'Could not complete that just now.');
      onWithdraw?.();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className="relative border-l pl-5 py-1" style={{ borderColor: 'rgba(255,226,122,0.25)' }}>
      <span
        aria-hidden
        className="absolute -left-[3.5px] top-3 w-1.5 h-1.5 rounded-full"
        style={{ background: 'rgba(255,226,122,0.8)', boxShadow: '0 0 10px rgba(255,226,122,0.55)' }}
      />
      <p className="text-slate-100 text-[15px] font-light leading-relaxed">{t.title}</p>
      {t.content && t.content !== t.title && (
        <p className="text-slate-400 text-sm font-light leading-relaxed mt-1.5 whitespace-pre-line">
          {t.content}
        </p>
      )}
      <p className="text-slate-600 text-xs font-light mt-2">
        {authorLine(t.authorship)} · {dayLabel(t.keptAt)}
        {t.sharedWithCoach && (
          <span className="ml-2" style={{ color: 'rgba(255,226,122,0.7)' }}>
            shared with your coach
          </span>
        )}
        {t.sharedWithCoach && onWithdraw && (
          <>
            <span className="mx-2 text-slate-700" aria-hidden>
              ·
            </span>
            <button
              type="button"
              onClick={withdraw}
              disabled={busy}
              className="text-slate-500 hover:text-slate-300 underline underline-offset-2 transition-colors disabled:opacity-50 min-h-[24px]"
            >
              {busy ? 'Withdrawing…' : 'Stop sharing this'}
            </button>
          </>
        )}
      </p>
      {err && (
        <p role="alert" className="text-red-300 text-xs font-light mt-1">
          {err}
        </p>
      )}
    </li>
  );
}

function ThreadList({ items, onWithdraw }: { items: HomeThread[]; onWithdraw?: () => void }) {
  return (
    <ul className="space-y-5">
      {items.map((t) => (
        <ThreadCard key={t.id} t={t} onWithdraw={onWithdraw} />
      ))}
    </ul>
  );
}

const DOOR_CLASS =
  'inline-flex rounded-full border px-6 py-2.5 text-sm transition-all hover:shadow-[0_0_30px_rgba(255,226,122,0.3)] disabled:opacity-50';
const DOOR_STYLE = { color: ACCENT, borderColor: 'rgba(255,226,122,0.45)' } as const;

/** The single accented action of a band. At most one per band, always named. */
function Door({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} className={DOOR_CLASS} style={DOOR_STYLE}>
      {children}
    </a>
  );
}

/**
 * A member-held door.
 *
 * Every band except Sessions has its own object and its own existing write
 * path; before this, none of them had a handle, so the only way in was the
 * session room and the whole environment collapsed back into chat. This is
 * the handle — it opens the room the member is already standing in, and it
 * never routes to a conversation.
 *
 * The member's words go to the substrate verbatim. Nothing classifies what
 * they wrote: the band they opened is the tag, because they chose the band.
 */
function Compose({
  label,
  placeholder,
  phase,
  fieldContext,
  onSaved,
}: {
  label: string;
  placeholder: string;
  phase: 'decision' | 'practice' | 'question' | 'unsolicited';
  fieldContext?: string;
  onSaved: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [share, setShare] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  if (!open) {
    return (
      <div className="mt-5">
        <button type="button" className={DOOR_CLASS} style={DOOR_STYLE} onClick={() => setOpen(true)}>
          {label}
        </button>
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const title = text.trim();
    if (!title || busy) return;
    setBusy(true);
    setErr(null);
    try {
      const res = await apiFetch('/api/now-what/field-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          created: [{ title, shareWithPractitioner: share }],
          spiralogicPhase: phase,
          ...(fieldContext ? { fieldContext } : {}),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || 'Could not save that just now.');
      setText('');
      setShare(false);
      setOpen(false);
      onSaved();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-5 space-y-3">
      <textarea
        autoFocus
        rows={3}
        maxLength={400}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        aria-label={label}
        className="w-full rounded-xl border border-slate-600/60 bg-slate-900/50 px-4 py-3 text-[15px] font-light text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-slate-400/70 resize-y"
      />
      {/* Sharing is per-thread, chosen at the moment of authoring, default off. */}
      <label className="flex items-center gap-2.5 text-slate-500 text-xs font-light cursor-pointer">
        <input
          type="checkbox"
          checked={share}
          onChange={(e) => setShare(e.target.checked)}
          className="accent-[#ffe27a] w-3.5 h-3.5"
        />
        Share this one with your coach
      </label>
      {err && (
        <p role="alert" className="text-red-300 text-xs font-light">
          {err}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={busy || !text.trim()} className={DOOR_CLASS} style={DOOR_STYLE}>
          {busy ? 'Saving…' : 'Save'}
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setErr(null);
          }}
          className="text-slate-500 hover:text-slate-300 text-sm font-light transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

/**
 * My Journey's door. A separate substrate (`field_program_positions`) and a
 * separate act: this is a position the member declares, not a thread they
 * keep. Their words are stored verbatim as `member_stated` — which is why a
 * coach-placed focus and a self-stated one stay distinguishable forever.
 *
 * The endpoint resolves a real field and a real program, so the door is only
 * offered when we are inside a field. A door that cannot open is not shown.
 */
function JourneyCompose({
  fieldContext,
  hasPosition,
  onSaved,
}: {
  fieldContext: string;
  hasPosition: boolean;
  onSaved: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const label = hasPosition ? 'Update your direction →' : 'Add your focus →';

  if (!open) {
    return (
      <div className="mt-5">
        <button type="button" className={DOOR_CLASS} style={DOOR_STYLE} onClick={() => setOpen(true)}>
          {label}
        </button>
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const focalPoint = text.trim();
    if (!focalPoint || busy) return;
    setBusy(true);
    setErr(null);
    try {
      const res = await apiFetch('/api/now-what/program-position', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fieldContext, focalPoint }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || 'Could not save that just now.');
      setText('');
      setOpen(false);
      onSaved();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-5 space-y-3">
      <textarea
        autoFocus
        rows={2}
        maxLength={300}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What you are working on, in your own words."
        aria-label={label}
        className="w-full rounded-xl border border-slate-600/60 bg-slate-900/50 px-4 py-3 text-[15px] font-light text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-slate-400/70 resize-y"
      />
      {err && (
        <p role="alert" className="text-red-300 text-xs font-light">
          {err}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={busy || !text.trim()} className={DOOR_CLASS} style={DOOR_STYLE}>
          {busy ? 'Saving…' : 'Save'}
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setErr(null);
          }}
          className="text-slate-500 hover:text-slate-300 text-sm font-light transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// ── The room ─────────────────────────────────────────────────────────────

export default function ClientHome({ fieldContext }: { fieldContext?: string }) {
  const session = useMemberSession();
  const [data, setData] = useState<HomePayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);

  // Session fact only, like the rest of the environment: the member's own
  // stored session, never an inference about who they are.
  useEffect(() => {
    try {
      const raw = localStorage.getItem('beta_user');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.name && typeof parsed.name === 'string') setName(parsed.name.split(' ')[0]);
      }
    } catch {
      /* a missing or unreadable name is not an error — the room greets plainly */
    }
  }, []);

  // Bumped by every member gesture, so the room re-reads its own composition
  // from the substrate rather than patching a local copy. The Home shows what
  // was actually written — never an optimistic guess at it.
  const [tick, setTick] = useState(0);
  const reload = () => setTick((n) => n + 1);

  useEffect(() => {
    if (session !== 'in') return;
    let cancelled = false;
    (async () => {
      try {
        const qs = fieldContext ? `?fieldContext=${encodeURIComponent(fieldContext)}` : '';
        const res = await apiFetch(`/api/now-what/home${qs}`);
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json?.error || 'Could not open your space right now.');
        if (!cancelled) setData(json);
      } catch (e: any) {
        if (!cancelled) setError(e.message);
      }
    })();
    return () => { cancelled = true; };
  }, [session, fieldContext, tick]);

  const ctx = fieldContext ? `?fieldContext=${encodeURIComponent(fieldContext)}` : '';
  const roomHref = `/now-what/room${ctx}`;

  if (session === 'unknown') return null;
  if (session === 'out') {
    return (
      <NowWhatThreshold
        roomName="Your space"
        line="Where your leadership work continues between conversations."
        fieldContext={fieldContext}
      />
    );
  }

  const journey = data?.journey ?? [];
  const decisions = data?.decisions ?? [];
  const commitments = data?.commitments ?? [];
  const questions = data?.questions ?? [];
  const reflections = data?.reflections ?? [];
  const shared = data?.shared ?? [];
  const sessions = data?.sessions ?? [];

  return (
    <>
      <NowWhatShell current="Home" fieldContext={fieldContext} />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-5 sm:space-y-6">
        {/* The environment's weather — between the panels, never inside them */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_35%_at_50%_0%,rgba(125,175,255,0.09),transparent_70%)]"
        />
        <img
          src="/holoflower.svg"
          alt=""
          aria-hidden
          className="pointer-events-none absolute right-0 top-4 w-48 sm:w-64 opacity-[0.05]"
        />

        {/* ① Arrival — what this place is, before it asks anything */}
        <header className="relative pt-2 pb-2" style={{ animation: 'nwhFadeUp 0.55s ease both' }}>
          <h1 className="text-slate-100 text-3xl sm:text-4xl font-extralight tracking-wide leading-tight">
            {name ? `${name}, this is your space.` : 'This is your space.'}
          </h1>
          <p className="text-slate-400 text-base font-light leading-relaxed mt-3 max-w-prose">
            What you are working on, what you are practising, and what you are
            carrying — in your own words. Everything here is yours. Sharing
            happens only by your choice, one piece at a time.
          </p>
        </header>

        {error && (
          <p role="alert" className={`${PANEL} text-red-300 text-sm font-light`}>
            {error}
          </p>
        )}

        {!data && !error && (
          <p className={`${PANEL} text-slate-500 text-sm font-light`}>Opening your space…</p>
        )}

        {data && (
          <>
            {/* ① CURRENT WORK — what am I working on */}
            <Section
              eyebrow="Current work"
              title="What you are working on"
              lead="Your work, in your own words — or your coach's, each labelled with who said so. Nothing here is inferred, measured or evaluated."
              delay={60}
            >
              {journey.length === 0 ? (
                <Quiet>
                  Nothing here yet. Your work takes its shape from what you bring.
                </Quiet>
              ) : (
                <ul className="space-y-4">
                  {journey.map((j) => (
                    <li key={`${j.programSlug}-${j.focalPoint}`} className="space-y-1">
                      {j.programTitle && (
                        <p className="text-slate-500 text-xs uppercase tracking-[0.2em]">
                          {j.programTitle}
                        </p>
                      )}
                      <p className="text-slate-100 text-lg font-light">{j.focalPoint}</p>
                      <p className="text-slate-600 text-xs font-light">
                        {j.statedBy === 'practitioner_seeded'
                          ? 'placed by your coach — yours when you say so'
                          : j.statedBy === 'member_stated'
                            ? `in your own words${j.confirmedAt ? ` · ${dayLabel(j.confirmedAt)}` : ''}`
                            : `you confirmed this${j.confirmedAt ? ` · ${dayLabel(j.confirmedAt)}` : ''}`}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
              {/* The endpoint resolves a real field and programme, so this door
                  is only offered inside a field — never shown unable to open. */}
              {fieldContext && (
                <JourneyCompose
                  fieldContext={fieldContext}
                  hasPosition={journey.length > 0}
                  onSaved={reload}
                />
              )}
            </Section>

            {/* ② PREPARE — what do I do next.
                The only zone with no live substrate: preparation hangs off
                programme stages, which hang off an enrolment that nothing can
                yet write. It says so rather than rendering an empty shell. */}
            <Section
              eyebrow="Prepare"
              title="Before your next conversation"
              lead="What is worth bringing — yours to decide, never a list of tasks set for you."
              delay={120}
            >
              <Quiet>
                Nothing is set out here. When you are working inside a programme
                with your coach, what they have laid out for the next stretch
                appears here. Until then, what you bring is entirely your call.
              </Quiet>
              <div className="mt-5">
                <Door href={roomHref}>Prepare for your next conversation →</Door>
              </div>
              <p className="mt-4 text-slate-500 text-xs font-light">
                What is most alive · what changed · what you want to bring.
              </p>
            </Section>

            {/* ③ MY PRACTICE — between sessions. Never "homework". */}
            <Section
              eyebrow="My practice"
              title="What you are practising"
              lead="The ways you chose to lead and live differently. Kept in your words. Not tracked. Not measured."
              delay={180}
            >
              {commitments.length === 0 ? (
                <Quiet>
                  Nothing here yet. A practice begins when you name what you will
                  try, and why it matters to you.
                </Quiet>
              ) : (
                <ThreadList items={commitments} onWithdraw={reload} />
              )}
              <Compose
                label="Name what you want to practise →"
                placeholder="What you will actually live, and why it matters to you."
                phase="practice"
                fieldContext={fieldContext}
                onSaved={reload}
              />
            </Section>

            {/* ④ EXPLORE — after sessions. Decisions and questions have doors;
                reflections do not (Model B): they appear here because they were
                kept elsewhere, not because this room asks for them. */}
            <Section
              eyebrow="Explore"
              title="What you are working through"
              lead="What you are carrying and still living with. Nothing here recommends, ranks or decides — the judgement remains yours."
              delay={240}
            >
              {decisions.length === 0 && questions.length === 0 && reflections.length === 0 && (
                <Quiet>
                  Nothing here yet. Something enters when you name it: a choice you
                  are weighing, or a question you are living with.
                </Quiet>
              )}

              {decisions.length > 0 && (
                <div className="mb-6">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400 mb-4">
                    What you are carrying
                  </p>
                  <ThreadList items={decisions} onWithdraw={reload} />
                </div>
              )}

              {questions.length > 0 && (
                <div className="mb-6">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400 mb-4">
                    Questions you are living
                  </p>
                  <ThreadList items={questions} onWithdraw={reload} />
                </div>
              )}

              {reflections.length > 0 && (
                <div className="mb-6">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400 mb-4">
                    What you kept
                  </p>
                  <ThreadList items={reflections.slice(0, 8)} onWithdraw={reload} />
                  {reflections.length > 8 && (
                    <p className="mt-5">
                      <a
                        href={`/now-what/field${ctx}`}
                        className="text-slate-400 hover:text-slate-200 text-sm font-light underline underline-offset-4 transition-colors"
                      >
                        Open your full field →
                      </a>
                    </p>
                  )}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-x-6">
                <Compose
                  label="Carry a decision →"
                  placeholder="The choice you are weighing, in your own words."
                  phase="decision"
                  fieldContext={fieldContext}
                  onSaved={reload}
                />
                <Compose
                  label="Name a question →"
                  placeholder="The question you are living with, in your own words."
                  phase="question"
                  fieldContext={fieldContext}
                  onSaved={reload}
                />
              </div>
            </Section>

            {/* ⑤ CONNECTION — who am I with. The ONLY zone that routes to a
                conversation; every other zone's action makes its own object. */}
            <Section
              eyebrow="Connection"
              title="You and your coach"
              lead="Your coach sees what you choose to share — the work you are doing together, and anything you deliberately brought forward. Nothing else reaches them."
              delay={300}
            >
              {sessions.length > 0 && (
                <ul className="space-y-3 mb-6">
                  {sessions.slice(0, 8).map((s) => (
                    <li
                      key={s.ref}
                      className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-slate-700/40 pb-3 last:border-0"
                    >
                      <span className="text-slate-200 text-sm font-light">{dayLabel(s.at)}</span>
                      <span className="text-slate-500 text-xs font-light">
                        {s.carried === 1
                          ? 'you carried one thing forward'
                          : `you carried ${s.carried} things forward`}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              {shared.length === 0 ? (
                <Quiet>
                  Nothing shared yet. Your coach can see that you are working
                  together and where the work is pointed — not what you have
                  written here. You choose to share a piece as you write it, and
                  it appears here where you can take it back.
                </Quiet>
              ) : (
                <>
                  <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400 mb-4">
                    Shared with your coach
                  </p>
                  <ThreadList items={shared} onWithdraw={reload} />
                </>
              )}

              <div className="mt-6 pt-5 border-t border-slate-700/50">
                <Door href={roomHref}>
                  {sessions.length === 0
                    ? 'Enter the session room →'
                    : 'Continue the conversation →'}
                </Door>
              </div>
            </Section>

            <RoomTrustCopy
              holds="What you authored in this environment — what you are working on, what you are practising, what you are carrying and living with, and what you chose to keep."
              doesNotHold="No scores, rankings, progress measures, assessments or summaries of you. No record of how often you come here, and no interpretation of your material by anyone but you."
              whoSees="You. Your coach sees a piece only if you explicitly shared it, one piece at a time — never automatically, and never because you were active here."
              control="Everything here exists because of a gesture you made. Opening this room writes nothing. Anything shared can be withdrawn, and withdrawing it tells no one."
            />

            <p className="relative text-slate-600 text-sm font-light italic pt-2">
              Nothing here rushes you.
            </p>
          </>
        )}

        <style>{`
          @keyframes nwhFadeUp {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: none; }
          }
          @media (prefers-reduced-motion: reduce) {
            [style*="nwhFadeUp"] { animation: none !important; }
          }
        `}</style>
      </div>
    </>
  );
}
