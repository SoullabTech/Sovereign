'use client';

/**
 * Now What? — Client Home: RETURNING HOME (NW-V1-CLIENT-01, phone-first).
 *
 * Recomposed from the frozen prototype `docs/design/now-what/v1/prototypes/
 * 01-returning-home.png` on the design branch. This is a RECOMPOSITION of acts
 * the member already made — not a new surface, not a new read, not a new
 * subsystem. The route, the API call and the substrate are unchanged.
 *
 * ── WHAT THE FIRST VIEWPORT HOLDS, IN ORDER ──────────────────────────────
 *   1. YOU WERE CARRYING   the member's own words, largest thing on screen
 *   2. YOU CHOSE           their explicit move, when one exists
 *   3. What happened since? the one invitation
 *   4. Tell MAIA…          the affordance that carries them into the Room
 *
 * Nothing above the fold but her words, her choice, and the invitation.
 *
 * ── WHAT HAD TO GIVE, AND WHY ────────────────────────────────────────────
 * The greeting ("Welcome back, ___"), the coach tagline, the subtitle stack
 * and the upcoming-conversation line all preceded continuity and pushed it
 * below the fold on a phone. They are gone from the first viewport. The
 * wordmark survives as chrome. The next conversation is not lost — it is
 * carried on the My Coaching line at the base, where it belongs to the
 * relationship rather than competing with the return.
 *
 * ── WHAT IS REFUSED HERE (structural, unchanged) ─────────────────────────
 *   - No score, streak, ranking, progress bar, completion count, metric.
 *   - No system-voiced finding; every line is the member's words or a plain
 *     fact about their own act, attributed.
 *   - No computed suggestion, no "you probably need this next". The selection
 *     rule is stated in full in lib/nowWhat/carriedThread.ts and reads nothing
 *     but the timestamp of the member's own keeping gesture.
 *   - Kept, not "recent" (E-2). Bring-forward vocabulary only.
 *   - Honest absence: with nothing kept, no hero is manufactured.
 *
 * ── PRESERVED BELOW THE FOLD (retire presentation ≠ retire capability) ────
 * The rooms, the daily thought and the trust boundary all remain, demoted to
 * base chrome. Every route that existed before this recomposition is still
 * one tap away.
 *
 * Data: ONE member-scoped composition call. Opening this surface writes
 * nothing.
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/http/apiBase';
import { NowWhatThreshold, useMemberSession } from '@/components/now-what/NowWhatShell';
import { RoomTrustCopy } from '@/components/now-what/RoomTrustCopy';
import { selectCarriedThread, selectChosenMove, selectPriorAct } from '@/lib/nowWhat/carriedThread';
import { LIVED_DRAFT_KEY } from '@/lib/nowWhat/livedDraft';

import { NW_PALETTE_CSS, NW_PALETTE_DARK_CSS } from '@/components/now-what/PaperRoom';

const SERIF = "'Iowan Old Style', 'Palatino Linotype', Palatino, Georgia, serif";
/* Shared register tokens — paper in light, designed charcoal in dark. */
const INK = 'var(--nw-ink)';
const INK_SOFT = 'var(--nw-ink-soft)';
const INK_FAINT = 'var(--nw-ink-faint)';
const BRONZE = 'var(--nw-bronze)';
const RULE = 'var(--nw-rule)';

interface HomeThread {
  id: string; title: string; content: string | null; authorship: string;
  keptAt: string; sharedWithCoach: boolean; sessionRef: string | null;
  respondsToThreadId?: string | null;
}
interface JourneyRow {
  programSlug: string; programTitle: string | null; focalPoint: string;
  statedBy: string; confirmedAt: string | null;
}
interface HomePayload {
  journey: JourneyRow[];
  coachName: string | null;
  decisions: HomeThread[];
  commitments: HomeThread[];
  questions: HomeThread[];
  reflections: HomeThread[];
  shared: HomeThread[];
  sessions: { ref: string; at: string; carried: number }[];
  upcoming?: { start: string; end: string; status: string; locationType: string | null }[];
}

function whenLabel(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })
    + ' · ' + d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

/*
 * A daily thought — ancient wisdom and modern depth, one voice per day.
 * Curated, attributed, rotated deterministically by date: a contemplative
 * companion, never an engagement mechanic. Base chrome in V1: it sits below
 * the rooms, well outside the first viewport, so it can never compete with
 * the member's own words for the serif register.
 */
const QUOTES: { text: string; who: string }[] = [
  { text: 'Very little is needed to make a happy life; it is all within yourself, in your way of thinking.', who: 'Marcus Aurelius' },
  { text: 'It is not that we have a short time to live, but that we waste a lot of it.', who: 'Seneca' },
  { text: 'Wealth consists not in having great possessions, but in having few wants.', who: 'Epictetus' },
  { text: 'Happiness is the meaning and the purpose of life, the whole aim and end of human existence.', who: 'Aristotle' },
  { text: 'When you realize there is nothing lacking, the whole world belongs to you.', who: 'Lao Tzu' },
  { text: 'Let yourself be silently drawn by the strange pull of what you really love.', who: 'Rumi' },
  { text: 'The price of anything is the amount of life you exchange for it.', who: 'Henry David Thoreau' },
  { text: 'It is not the length of life, but the depth of life.', who: 'Ralph Waldo Emerson' },
  { text: 'Live the questions now. Perhaps you will then gradually, without noticing it, live along some distant day into the answer.', who: 'Rainer Maria Rilke' },
  { text: 'The great use of life is to spend it for something that will outlast it.', who: 'William James' },
  { text: 'The great and glorious masterpiece of man is to know how to live to purpose.', who: 'Michel de Montaigne' },
  { text: 'Who looks outside, dreams; who looks inside, awakes.', who: 'Carl Jung' },
];

function quoteOfTheDay(): { text: string; who: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const day = Math.floor((now.getTime() - start.getTime()) / 86400000);
  return QUOTES[day % QUOTES.length];
}

/**
 * One door — a sentence, not a card (UX-02). It states where it goes and what
 * the member will meet; it does not compete with its neighbours for the eye.
 * In V1 these are base chrome: the rooms stay one tap away without entering
 * the return's first viewport.
 */
function Door({
  href, name, meaning, line,
}: {
  href: string; name: string; meaning: string; line: string;
}) {
  return (
    <a className="nwh-door" href={href}>
      <span className="nwh-dhead">
        <span className="nwh-dname">{name}</span>
        <span className="nwh-dmean">{meaning}</span>
      </span>
      <span className="nwh-dline">{line}</span>
    </a>
  );
}

/** A plain fact about the member's own act — never a system judgement. */
function keptWhen(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const days = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (days <= 0) return ' today';
  if (days === 1) return ' yesterday';
  if (days < 7) return ` on ${d.toLocaleDateString(undefined, { weekday: 'long' })}`;
  return ` on ${d.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}`;
}

/**
 * WHAT SHE WAS CARRYING — her words, attributed to her own act. The largest
 * thing on the screen, and the first. Nothing here is authored by the system:
 * the title is what she wrote, and the line beneath states when she kept it.
 */
function Carried({ thread }: { thread: HomeThread }) {
  return (
    <>
      <p className="nwh-label">You were carrying</p>
      <p className="nwh-carry-line">&ldquo;{thread.title}&rdquo;</p>
      <p className="nwh-prov">You kept this{keptWhen(thread.keptAt)}.</p>
    </>
  );
}

// ── Returning home ───────────────────────────────────────────────────────

export default function ClientHome({ fieldContext }: { fieldContext?: string }) {
  const session = useMemberSession();
  const router = useRouter();
  const [data, setData] = useState<HomePayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [opening, setOpening] = useState('');

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
  const amp = ctx ? '&' : '?';

  if (session === 'unknown') return null;
  if (session === 'out') {
    return (
      <NowWhatThreshold
        roomName="Home"
        line="Your own private thoughts and insights, between conversations with your coach."
        fieldContext={fieldContext}
      />
    );
  }

  const coachName = data?.coachName ?? null;
  const shared = data?.shared ?? [];
  const daily = quoteOfTheDay();
  const nextConversation = data?.upcoming?.[0] ?? null;

  /*
   * Where she left things. The whole rule lives in lib/nowWhat/carriedThread.ts
   * and is stated there in full: the last thing she kept, and the last thing
   * she chose. Recency of HER OWN gesture — never a relevance model, never
   * inference over content, never activity or calendar signal.
   */
  const livingQuestion = selectCarriedThread<HomeThread>(data);
  const livingCommitment = selectChosenMove<HomeThread>(data);
  /* The act a lived return answers — carried into the Room so it knows what
     it is returning to, and so what she keeps stays related to it. */
  const priorAct = selectPriorAct<HomeThread>(data);

  /*
   * Into the Room through the existing lived doorway. No new route, no new
   * room. Her opening words travel in sessionStorage, never in the URL; the
   * prior act travels as an opaque id the Room re-resolves member-scoped.
   */
  function enterLived() {
    const draft = opening.trim();
    if (draft) {
      try { sessionStorage.setItem(LIVED_DRAFT_KEY, draft); } catch { /* a lost draft is not an error */ }
    }
    const thread = priorAct ? `&thread=${encodeURIComponent(priorAct.id)}` : '';
    router.push(`${roomHref}${amp}entry=lived${thread}`);
  }

  /* The chosen move now has its own place in the first viewport, so this door
     no longer repeats it back a second time further down the same screen —
     found by rendering, where the duplication read as two claims about one
     act rather than one act stated once. */
  const livingLine = 'What you choose to live — created by you, never assigned.';
  const coachingLine = coachName
    ? `${coachName}${shared.length > 0 ? ` — ${shared.length === 1 ? 'one piece' : `${shared.length} pieces`} brought forward` : ''}${nextConversation ? `, next conversation ${whenLabel(nextConversation.start)}` : ''}.`
    : 'The human relationship this environment extends.';

  return (
    <div className="nwh-root">
      <div className="nwh-frame">
        {/* ── THE FIRST VIEWPORT ─────────────────────────────────────────
              Found by rendering at 390×844, not by reading the CSS: with a
              short carried thread the base chrome rode up into the fold and
              the screen read as a menu with a quote on top. Margins would fix
              that for ONE length of her words and break for the next, so the
              rule is structural instead — this block occupies the viewport,
              and everything after it is genuinely below the fold at any
              content length. ── */}
        <div className="nwh-first">
        {/* Chrome only. The wordmark names the place; on Home it is not a link
            to anywhere, because this is already where it would go. */}
        <div className="nwh-top">
          <span className="nwh-wordmark">
            Now What<span className="nwh-wordmark-q">?</span>
          </span>
          <span aria-hidden className="nwh-mark" />
        </div>

        {error && (
          <p role="alert" className="nwh-error">{error}</p>
        )}

        {/* ── 1 + 2. Her words, then her choice. The compositional centre and
              the first thing in the viewport. A hairline rail, not a box —
              the eye lands on what she wrote, not on a container. ── */}
        <section className="nwh-carry" aria-label="Where you left things">
          {livingQuestion ? (
            <Carried thread={livingQuestion} />
          ) : (
            <>
              <p className="nwh-label">Where to begin</p>
              <p className="nwh-carry-line nwh-carry-plain">
                Nothing is waiting for you yet. That is a fine place to start.
              </p>
              <a className="nwh-primary" href={`${roomHref}${amp}entry=think`}>
                Think something through &rarr;
              </a>
            </>
          )}

          {livingCommitment && (
            <div className="nwh-chose">
              <p className="nwh-label">You chose</p>
              <p className="nwh-chose-line">{livingCommitment.title}</p>
            </div>
          )}
        </section>

        {/* ── 3 + 4. One invitation, one affordance. This is the only primary
              gesture on the screen. It enters the EXISTING room through the
              existing lived doorway — nothing new is created here. ── */}
        {(livingQuestion || livingCommitment) && (
          <section className="nwh-return" aria-label="What happened since">
            <h1 className="nwh-ask">What happened since?</h1>
            <form
              className="nwh-tell"
              onSubmit={(e) => { e.preventDefault(); enterLived(); }}
            >
              <input
                className="nwh-tell-input"
                type="text"
                value={opening}
                onChange={(e) => setOpening(e.target.value)}
                placeholder="Tell MAIA…"
                aria-label="Tell MAIA what happened since"
                autoComplete="off"
              />
              <button
                type="button"
                className="nwh-tell-voice"
                onClick={enterLived}
                aria-label="Speak instead — opens the room, where you can dictate"
                title="Speak instead"
              >
                <svg width="15" height="20" viewBox="0 0 15 20" aria-hidden focusable="false">
                  <rect x="5" y="1" width="5" height="10" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M1.6 9.2a5.9 5.9 0 0 0 11.8 0M7.5 15.1V19" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
              </button>
            </form>
          </section>
        )}

        </div>

        {/* ── Base chrome. Everything below this rule is out of the first
              viewport by design: the rooms stay reachable, demoted, never
              competing with the return. Retire presentation, not capability. ── */}
        <nav className="nwh-doors" aria-label="Your rooms">
          <Door href={`/now-what/questions${ctx}`} name="My Question"
                meaning="What you are wrestling with" line="Continue thinking about what you named — in your own words." />
          <Door href={`/now-what/work${ctx}`} name="My Work"
                meaning="What you are living and cultivating" line={livingLine} />
          <Door href={`/now-what/coaching${ctx}`} name="My Coaching"
                meaning="The human relationship" line={coachingLine} />
          <Door href={`/now-what/field${ctx}`} name="My Story"
                meaning="Becoming over time" line="Turning points, realizations, chapters — in your own words." />
          <Door href={`${roomHref}${amp}entry=think`} name="The Room"
                meaning="A place to think" line="Clarify a decision, explore a tension, listen to yourself think." />
        </nav>

        {/* ── A daily thought — ambient orientation, in its author's voice ── */}
        <div className="nwh-quote" aria-label="A thought for today">
          <p className="nwh-quote-text">&ldquo;{daily.text}&rdquo;</p>
          <p className="nwh-quote-who">— {daily.who}</p>
        </div>

        {/* ── The boundary, stated once ── */}
        <div className="nwh-trust">
          <RoomTrustCopy
            holds="What you authored in this environment — the decisions you are working through, your commitments, your questions, and what you chose to keep."
            doesNotHold="No scores, rankings, progress measures, assessments or summaries of you. No record of how often you come here, and no interpretation of your material by anyone but you."
            whoSees="You. Your coach receives a piece only if you explicitly brought it into your coaching, one piece at a time — never automatically, and never because you were active here."
            control="Everything here exists because of a gesture you made. Opening this room writes nothing. Anything brought into your coaching can be withdrawn, and withdrawing it tells no one."
          />
        </div>
      </div>

      <style>{`
        .nwh-root { ${NW_PALETTE_CSS} }
        @media (prefers-color-scheme: dark) {
          .nwh-root { ${NW_PALETTE_DARK_CSS} }
        }
        .nwh-root {
          min-height: 100vh;
          font-family: -apple-system, 'Helvetica Neue', 'Segoe UI', sans-serif;
          color: ${INK};
          background:
            radial-gradient(ellipse 90% 45% at 50% -5%, var(--nw-wash-a), transparent 60%),
            linear-gradient(var(--nw-bg-1), var(--nw-bg-2));
          -webkit-font-smoothing: antialiased;
        }
        /* Phone first: 20px gutters, and the frame only widens on larger
           screens. Desktop expands the same composition; it never becomes a
           different one. */
        .nwh-frame { max-width: 46rem; margin: 0 auto; padding: 18px 20px 72px; }
        /* The return owns the first screen. svh so mobile browser chrome
           cannot push the rooms up into it; vh is the fallback. */
        .nwh-first {
          min-height: calc(100vh - 90px);
          min-height: calc(100svh - 90px);
          display: flex; flex-direction: column;
        }
        .nwh-top { display: flex; justify-content: space-between; align-items: center; }
        /* Direction B wordmark (brand pass 2026-08-05): words in ink, the
           question mark in bronze — a question, not a label. Reduced to 9px
           chrome so continuity, not branding, owns the first viewport. */
        .nwh-wordmark {
          font-size: 9px; letter-spacing: 0.42em; text-transform: uppercase;
          color: ${INK_SOFT}; text-decoration: none;
        }
        .nwh-wordmark-q { color: ${BRONZE}; }
        .nwh-mark {
          width: 22px; height: 22px; border-radius: 50%;
          border: 1px solid ${BRONZE}; opacity: 0.5; flex: none;
        }
        .nwh-error { margin-top: 20px; color: #8c2f22; font-size: 14px; font-weight: 300; }

        /* ── What she was carrying: her words, largest on the screen. ── */
        .nwh-carry {
          margin-top: 30px; padding-left: 18px;
          border-left: 2px solid ${BRONZE};
        }
        .nwh-label {
          font-size: 10px; letter-spacing: 0.28em; text-transform: uppercase;
          color: ${INK_FAINT}; margin: 0;
        }
        .nwh-carry-line {
          font-family: ${SERIF}; font-style: italic;
          font-size: clamp(23px, 6.4vw, 30px); line-height: 1.36;
          color: ${INK}; margin: 12px 0 0; max-width: 34rem;
        }
        .nwh-carry-plain { font-style: normal; font-size: clamp(19px, 5vw, 23px); color: ${INK_SOFT}; }
        .nwh-prov { font-size: 13px; font-weight: 300; color: ${INK_FAINT}; margin: 10px 0 0; }
        .nwh-primary {
          display: inline-block; margin-top: 18px; font-size: 15px;
          color: ${BRONZE}; text-decoration: none;
          border-bottom: 1px solid transparent; padding-bottom: 2px;
          transition: border-color .18s ease;
        }
        .nwh-primary:hover, .nwh-primary:focus-visible { border-bottom-color: ${BRONZE}; }

        /* Her explicit move — stated plainly, never styled as an achievement. */
        .nwh-chose { margin-top: 26px; }
        .nwh-chose-line {
          font-family: ${SERIF}; font-size: clamp(18px, 4.8vw, 21px); line-height: 1.45;
          color: ${INK_SOFT}; margin: 10px 0 0; max-width: 34rem;
        }

        /* ── The one invitation, and the one affordance. ── */
        .nwh-return { margin-top: 30px; padding-left: 20px; }
        .nwh-ask {
          font-family: ${SERIF}; font-weight: 400;
          font-size: clamp(19px, 5vw, 22px); line-height: 1.4;
          color: ${INK}; margin: 0;
        }
        .nwh-tell {
          display: flex; align-items: center; gap: 12px;
          margin-top: 20px; border-bottom: 1px solid ${RULE};
        }
        .nwh-tell-input {
          flex: 1 1 auto; min-width: 0; background: transparent; border: 0;
          font-family: ${SERIF}; font-size: 17px; color: ${INK};
          padding: 10px 0 12px;
        }
        .nwh-tell-input::placeholder { color: ${INK_FAINT}; }
        .nwh-tell-input:focus { outline: none; }
        .nwh-tell:focus-within { border-bottom-color: ${BRONZE}; }
        /* 44px touch target — thumb reach is a requirement, not a nicety. */
        .nwh-tell-voice {
          flex: none; display: inline-flex; align-items: center; justify-content: center;
          width: 44px; height: 44px; margin-right: -10px;
          background: transparent; border: 0; cursor: pointer;
          color: ${INK_FAINT}; transition: color .18s ease;
        }
        .nwh-tell-voice:hover, .nwh-tell-voice:focus-visible { color: ${BRONZE}; }

        /* ── Doors as sentences: stacked, hairline-separated. Two doors never sit
              side by side competing. Motion is settling, not attracting. In V1
              they are base chrome, below the fold. ── */
        .nwh-doors { margin-top: 40px; display: flex; flex-direction: column; }
        .nwh-door {
          display: block; text-decoration: none; color: ${INK_SOFT};
          padding: 14px 0; border-top: 1px solid ${RULE};
          transition: color .18s ease;
        }
        .nwh-doors .nwh-door:last-child { border-bottom: 1px solid ${RULE}; }
        .nwh-dhead { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; }
        .nwh-dname { font-family: ${SERIF}; font-size: 15px; }
        .nwh-dmean {
          font-size: 9.5px; letter-spacing: 0.22em; text-transform: uppercase;
          color: ${INK_FAINT};
        }
        .nwh-dline {
          display: block; font-size: 12.5px; font-weight: 300; color: ${INK_FAINT};
          line-height: 1.55; margin-top: 4px; max-width: 44rem;
        }
        .nwh-door:hover .nwh-dname, .nwh-door:focus-visible .nwh-dname { color: ${BRONZE}; }
        .nwh-door:focus-visible { outline: 2px solid ${BRONZE}; outline-offset: 4px; }

        .nwh-quote { margin-top: 40px; text-align: center; padding: 0 8px; }
        .nwh-quote-text {
          font-family: ${SERIF}; font-size: 15.5px; font-style: italic;
          color: ${INK_FAINT}; line-height: 1.6; max-width: 44rem; margin: 0 auto;
        }
        .nwh-quote-who { font-size: 11.5px; font-weight: 300; color: ${INK_FAINT}; margin-top: 8px; }

        .nwh-trust {
          margin-top: 36px; border: 1px dashed ${RULE}; border-radius: 16px; padding: 20px 22px;
        }
        .nwh-trust, .nwh-trust * { color: ${INK_SOFT} !important; border-color: rgba(90,76,58,0.25); }
        .nwh-trust [class*="bg-"] { background: rgba(90,76,58,0.05) !important; }

        @media (min-width: 640px) {
          .nwh-frame { padding: 26px 40px 80px; }
          .nwh-carry { padding-left: 22px; }
          .nwh-return { padding-left: 24px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .nwh-primary, .nwh-door, .nwh-tell-voice { transition: none; }
        }
      `}</style>
    </div>
  );
}
