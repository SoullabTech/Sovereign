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

/* `Quiet` (the per-band empty-state paragraph) was removed with the empty
   bands themselves. A person with nothing here is not in an error state — but
   the answer to that is not six gentle paragraphs about absence, it is not
   rendering the band at all and saying it once. */

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

  /** Whether the member has authored anything at all. Drives the arrival case:
      with nothing here, the room says so ONCE rather than six times. */
  const hasAnything =
    (data?.journey?.length ?? 0) +
      (data?.decisions?.length ?? 0) +
      (data?.commitments?.length ?? 0) +
      (data?.questions?.length ?? 0) +
      (data?.reflections?.length ?? 0) +
      (data?.shared?.length ?? 0) +
      (data?.sessions?.length ?? 0) >
    0;

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

        {/* ② THE HEARTH — the centre of the room.
            Not a card among cards. It is unboxed on purpose: a bordered panel
            reads as one more category, and the thing a person returns FOR is
            not a category. Rules above and below give it the weight a border
            was doing badly.

            ⛔ It never invents a thread. With no sessions it says so plainly.
            An empty centre that implied a waiting conversation would be the
            false affordance CF-D2 prohibits. */}
        {data && (
          <section
            className="relative mt-12 mb-4 border-y border-white/10 py-10 sm:py-12"
            style={{ animation: 'nwhFadeUp 0.55s ease both', animationDelay: '40ms' }}
          >
            <p className="text-slate-100 text-2xl sm:text-3xl font-extralight leading-snug max-w-prose">
              {sessions.length === 0
                ? 'What is alive for you today?'
                : 'What is alive for you today?'}
            </p>
            <p className="mt-3 text-slate-400 text-base font-light leading-relaxed max-w-prose">
              {sessions.length === 0
                ? 'Nothing is waiting to be resumed yet. That is a real place to be standing — the work takes its shape from what you bring.'
                : `You last carried something forward on ${dayLabel(sessions[0].at)}. Picking it up again is where the work continues.`}
            </p>
            <div className="mt-7">
              <Door href={roomHref}>
                {sessions.length === 0 ? 'Begin with MAIA →' : 'Continue with MAIA →'}
              </Door>
            </div>
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
            {/* ⛔ EVERY BAND BELOW RENDERS ONLY WHEN IT HAS CONTENT.
                Before this, a member with an empty field scrolled six panels
                each announcing what they did not have — an inventory of
                absences. Absence is not an error state and does not need a
                card to live in. What replaces it is the single quiet line at
                the foot of this block: one sentence, once.

                The per-band explanatory leads were also removed. "Nothing here
                recommends, ranks or decides" was said in five places and again
                in RoomTrustCopy — the trust surface at the foot is where a
                person goes looking for it, and saying it six times reads as
                anxiety rather than assurance. The guarantees are enforced in
                the payload, not in the reassurance. */}

            {journey.length > 0 && (
              <Section eyebrow="Where the work is pointed" title="What is alive" delay={60}>
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
              </Section>
            )}

            {questions.length > 0 && (
              <Section eyebrow="Questions" title="What you are living with" delay={90}>
                <ThreadList items={questions} />
              </Section>
            )}

            {decisions.length > 0 && (
              <Section
                eyebrow="Leadership moments"
                title="What you are becoming clear about"
                delay={120}
              >
                <ThreadList items={decisions} />
              </Section>
            )}

            {commitments.length > 0 && (
              <Section eyebrow="Practice" title="How you are practising leadership" delay={180}>
                <ThreadList items={commitments} />
              </Section>
            )}

            {sessions.length > 0 && (
              <Section eyebrow="Conversations" title="The thread between them" delay={240}>
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
              </Section>
            )}

            {reflections.length > 0 && (
              <Section eyebrow="Reflections" title="What you kept" delay={300}>
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
              </Section>
            )}

            {/* Coach connection renders ONLY once something has been shared.
                Its empty state used to announce a boundary nobody had tested
                yet — a paragraph about what a coach cannot see, shown to a
                person who has shared nothing with anyone. The boundary is real
                and is stated in the trust surface below; it does not need a
                standing panel to prove itself. */}
            {shared.length > 0 && (
              <Section eyebrow="Coach connection" title="What you chose to share" delay={360}>
                <ThreadList items={shared} />
              </Section>
            )}

            {/* The arrival case — ONE line, where six empty panels used to be. */}
            {!hasAnything && (
              <p
                className="relative text-slate-500 text-sm font-light leading-relaxed max-w-prose pt-2"
                style={{ animation: 'nwhFadeUp 0.55s ease both', animationDelay: '120ms' }}
              >
                What you decide, practise and choose to keep will collect here, in
                your words, as you name it.
              </p>
            )}

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
