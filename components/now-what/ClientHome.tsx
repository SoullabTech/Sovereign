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
// Phase 2 bridge — additive only. Renders nothing when no practitioner has
// offered anything, so the Home's arrival state is unchanged for every member
// who has no invitation. Add the bridge; do not rebuild the house.
import MemberInvitations from '@/components/now-what/MemberInvitations';

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
function ThreadCard({ t }: { t: HomeThread }) {
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
      </p>
    </li>
  );
}

function ThreadList({ items }: { items: HomeThread[] }) {
  return <ul className="space-y-5">{items.map((t) => <ThreadCard key={t.id} t={t} />)}</ul>;
}

/** The single accented action of a band. At most one per band, always named. */
function Door({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="inline-flex rounded-full border px-6 py-2.5 text-sm transition-all hover:shadow-[0_0_30px_rgba(255,226,122,0.3)]"
      style={{ color: ACCENT, borderColor: 'rgba(255,226,122,0.45)' }}
    >
      {children}
    </a>
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
  }, [session, fieldContext]);

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

        {/* ① Arrival — S1a. What this place is FOR, before it lists what it holds.
            The prior copy described the contents ("the decisions you are weighing,
            what you are practising, what you chose to keep") — an inventory, which
            reads as storage. A person arriving does not ask what is filed here.
            They ask why they came back. */}
        <header className="relative pt-2 pb-2" style={{ animation: 'nwhFadeUp 0.55s ease both' }}>
          <h1 className="text-slate-100 text-3xl sm:text-4xl font-extralight tracking-wide leading-tight">
            {name ? `Welcome back, ${name}.` : 'Welcome back.'}
          </h1>
          <p className="text-slate-300 text-lg sm:text-xl font-extralight leading-relaxed mt-4 max-w-prose">
            Your leadership work continues here.
          </p>
          <p className="text-slate-400 text-base font-light leading-relaxed mt-3 max-w-prose">
            A place between conversations where what matters can become clearer.
            Everything here is yours, in your words. Sharing any of it is your
            choice, made one piece at a time.
          </p>
        </header>

        {/* ② CONTINUE — S1a/S1c. The centre the surface was missing.
            The page was structurally complete and experientially empty: categories
            with no centre, records with no thread. This answers "what brings me
            back?" before any category does.

            ⛔ It never invents a thread. With no sessions it says so plainly and
            offers the only real door — a conversation. An empty centre that
            pretended otherwise would be the false affordance CF-D2 prohibits. */}
        {data && (
          <section
            className="relative mt-8 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-6 sm:px-7 sm:py-7"
            style={{ animation: 'nwhFadeUp 0.55s ease both', animationDelay: '40ms' }}
          >
            <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Continue</p>
            {sessions.length === 0 ? (
              <>
                <p className="mt-3 text-slate-100 text-xl sm:text-2xl font-extralight leading-snug">
                  Your next thread begins with a conversation.
                </p>
                <p className="mt-2 text-slate-400 text-sm font-light max-w-prose">
                  Nothing is waiting to be resumed yet — which is a real place to be
                  standing, not a gap.
                </p>
                <div className="mt-5">
                  <Door href={roomHref}>Begin a conversation →</Door>
                </div>
              </>
            ) : (
              <>
                <p className="mt-3 text-slate-100 text-xl sm:text-2xl font-extralight leading-snug">
                  What is alive for you today?
                </p>
                <p className="mt-2 text-slate-400 text-sm font-light max-w-prose">
                  You last carried something forward on {dayLabel(sessions[0].at)}. Picking
                  it up again is where the work continues.
                </p>
                <div className="mt-5">
                  <Door href={roomHref}>Continue the conversation →</Door>
                </div>
              </>
            )}
          </section>
        )}

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
            {/* ② My Journey — where the work is pointed, as declared */}
            <Section
              eyebrow="Where the work is pointed"
              title="What is alive"
              lead="Your place in the work — as you or your coach stated it, each labelled with who said so. Nothing here is inferred, and nothing measures you."
              delay={60}
            >
              {journey.length === 0 ? (
                <Quiet>
                  No programme is named here yet. That is a real place to be standing,
                  not a gap — the work can begin in a conversation and take its shape
                  from what you actually bring.
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
                      <p className="text-slate-100 text-lg font-light">
                        Working through: {j.focalPoint}
                      </p>
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

              {questions.length > 0 && (
                <div className="mt-6 pt-5 border-t border-slate-700/50">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400 mb-4">
                    Questions you are exploring
                  </p>
                  <ThreadList items={questions} />
                </div>
              )}
            </Section>

            {/*
              INVITATIONS — what a practitioner has offered, and the member's
              gesture toward it. Sits BELOW the member's own material on
              purpose: the member's work is the anchor of this surface, and an
              offer is a guest in it. Self-hides when nothing is offered.
            */}
            {fieldContext &&
              journey.map((j) => (
                <MemberInvitations
                  key={j.programSlug}
                  fieldSlug={fieldContext}
                  programSlug={j.programSlug}
                />
              ))}

            {/* ③ Decisions — the highest-stakes executive surface.

                Rebase resolution 2026-08-04: this branch also carried a
                `Continue` block. It is DROPPED, not merged — trunk built the
                centre first (944c99749) and trunk's version is the current
                disposition. Keeping both would have restored the exact defect
                the branch comment describes: two doors on one surface. The
                invitation mount above is the only part of this hunk that
                trunk does not already have. */}
            <Section
              eyebrow="Leadership moments"
              title="What you are becoming clear about"
              lead="The decisions you are actually carrying, held open while they are still open. Nothing here recommends, ranks or decides — the judgement stays yours."
              delay={120}
            >
              {decisions.length === 0 ? (
                <>
                  <Quiet>
                    Nothing is held here yet. A decision belongs here once you have
                    named it — the context, who it touches, what you know and what
                    you are still assuming. Working one through in a session is how
                    it arrives.
                  </Quiet>
                  <div className="mt-5">
                    <Door href={roomHref}>Work a decision through →</Door>
                  </div>
                </>
              ) : (
                <ThreadList items={decisions} />
              )}
            </Section>

            {/* ④ Commitments — identity-level, never tasks */}
            <Section
              eyebrow="Practice"
              title="How you are practising leadership"
              lead="Not tasks. The way you said you would lead differently — kept in your own words, with nothing tracking whether you complied."
              delay={180}
            >
              {commitments.length === 0 ? (
                <Quiet>
                  Nothing is being practised here yet. A commitment lands here when
                  you name one at the close of a conversation — what you will
                  actually live, and why it matters to you.
                </Quiet>
              ) : (
                <ThreadList items={commitments} />
              )}
            </Section>

            {/* ⑤ Sessions — the thread between conversations */}
            <Section
              eyebrow="Conversations"
              title="The thread between conversations"
              lead="The conversations you carried something out of, and the door into the next one."
              delay={240}
            >
              {sessions.length === 0 ? (
                <Quiet>
                  No conversation has left anything here yet. What you choose to keep
                  at the end of a session collects here, so returning does not mean
                  starting again.
                </Quiet>
              ) : (
                <ul className="space-y-3">
                  {sessions.slice(0, 8).map((s) => (
                    <li
                      key={s.ref}
                      className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-slate-700/40 pb-3 last:border-0"
                    >
                      <span className="text-slate-200 text-sm font-light">{dayLabel(s.at)}</span>
                      <span className="text-slate-500 text-xs font-light">
                        {s.carried === 1 ? 'you carried one thing forward' : `you carried ${s.carried} things forward`}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-6 pt-5 border-t border-slate-700/50 flex flex-wrap items-center gap-4">
                <Door href={roomHref}>
                  {sessions.length === 0 ? 'Enter the session room →' : 'Prepare for the next conversation →'}
                </Door>
                <p className="text-slate-500 text-xs font-light">
                  What is most alive · what changed · what you want to bring.
                </p>
              </div>
            </Section>

            {/* ⑥ Reflections — private by construction */}
            <Section
              eyebrow="Reflections"
              title="What you kept"
              lead="Yours alone unless you say otherwise. Held in the order you kept them — not ranked, not summarised, not scored."
              delay={300}
            >
              {reflections.length === 0 ? (
                <Quiet>
                  Nothing is kept here yet. This fills only through your own
                  gestures — opening this room writes nothing.
                </Quiet>
              ) : (
                <>
                  <ThreadList items={reflections.slice(0, 8)} />
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
                </>
              )}
            </Section>

            {/* ⑦ Coach connection — the boundary, from the member's own side */}
            <Section
              eyebrow="Coach connection"
              title="What your coach can see"
              lead="Your coach sees the shape of the work you share — the relationship, the programme, and anything you explicitly chose to bring. Nothing else reaches them."
              delay={360}
            >
              {shared.length === 0 ? (
                <Quiet>
                  You have not shared anything from this space. Your coach can see
                  that you are working together and where the work is pointed — not
                  what you have written here. Sharing happens one piece at a time,
                  by your gesture, and can be withdrawn.
                </Quiet>
              ) : (
                <>
                  <p className="text-slate-400 text-sm font-light mb-4">
                    You chose to bring these into the work together:
                  </p>
                  <ThreadList items={shared} />
                </>
              )}
            </Section>

            <RoomTrustCopy
              holds="What you authored in this environment — the decisions you are working through, what you are practising, the questions you are living, and what you chose to keep."
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
