'use client';

/**
 * Now What? — Client Home: the orientation field (five-room ontology,
 * ratified + built 2026-08-05; NOW_WHAT_ROOM_ONTOLOGY_CONSOLIDATION doc).
 *
 * "Every doorway makes a promise; every promise deserves its own room."
 * Standing test: two rooms cannot exist merely because they use different
 * nouns if they invoke the same human gesture.
 *
 * The home is not where everything happens. It answers ONE question:
 * "What part of my life and development do I want to enter right now?"
 * Five doors — four noun-rooms that hold, one verb-room that works — plus
 * time as the quiet continuity line, the daily thought as ambient
 * orientation, and the trust boundary stated once.
 *
 * Doors and their rooms:
 *   My Question → /now-what/questions       (what you are wrestling with)
 *   My Work     → /now-what/work            (what you are living and cultivating)
 *   My Coaching → /now-what/coaching        (the human relationship; holds programs + calendar)
 *   My Story    → /now-what/field           (becoming over time)
 *   The Room    → /now-what/room?entry=think (think something through)
 *   upcoming line → /now-what/coaching      (the date serves the relationship)
 *
 * WHAT THIS SURFACE STILL REFUSES (structural, unchanged):
 *   - No score, streak, ranking, progress bar, completion count, metric.
 *   - No system-voiced finding; door lines are the member's words or plain
 *     facts about their own acts, attributed.
 *   - No computed suggestion; all invitations are static strings.
 *   - Kept, not "recent" (E-2). Bring-forward vocabulary only.
 *   - Honest absence: doors whose substrate is empty speak plainly; gated
 *     capabilities do not render at all.
 *
 * Data: ONE member-scoped composition call. Opening this surface writes
 * nothing.
 */

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import { NowWhatThreshold, useMemberSession } from '@/components/now-what/NowWhatShell';
import { RoomTrustCopy } from '@/components/now-what/RoomTrustCopy';

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
 * companion, never an engagement mechanic.
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

// ── The orientation field ────────────────────────────────────────────────

export default function ClientHome({ fieldContext }: { fieldContext?: string }) {
  const session = useMemberSession();
  const [data, setData] = useState<HomePayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);

  // Session fact only: the member's own stored session, never an inference.
  useEffect(() => {
    try {
      const raw = localStorage.getItem('beta_user');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.name && typeof parsed.name === 'string') setName(parsed.name.split(' ')[0]);
      }
    } catch {
      /* a missing name is not an error — the field greets plainly */
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
  const coachFirst = coachName ? coachName.split(' ')[0] : null;
  const shared = data?.shared ?? [];
  const daily = quoteOfTheDay();
  const nextConversation = data?.upcoming?.[0] ?? null;
  const livingQuestion = data?.questions?.[0] ?? null;
  const livingCommitment = data?.commitments?.[0] ?? null;
  const focal = data?.journey?.[0] ?? null;

  /* Door lines: the member's own words when they exist; plain invitations
     when they don't. Never manufactured content. */
  const questionLine = livingQuestion
    ? `“${livingQuestion.title}”`
    : focal
      ? focal.focalPoint
      : 'What are you working through today? What you name gathers here, in your words.';
  const livingLine = livingCommitment
    ? livingCommitment.title
    : 'What you choose to live — created by you, never assigned.';
  const coachingLine = coachName
    ? `${coachName}${shared.length > 0 ? ` — ${shared.length === 1 ? 'one piece' : `${shared.length} pieces`} brought forward` : ''}${nextConversation ? `, next conversation ${whenLabel(nextConversation.start).split(' · ')[0]}` : ''}.`
    : 'The human relationship this environment extends.';

  return (
    <div className="nwh-root">
      <div className="nwh-frame">
        {/* Quiet header — wordmark is the place's name; Home is the location. */}
        <div className="nwh-top">
          <a className="nwh-wordmark" href={`/now-what/map${ctx}`}>
            Now What<span className="nwh-wordmark-q">?</span>
          </a>
          <span className="nwh-loc">Home</span>
        </div>

        {error && (
          <p role="alert" className="nwh-error">{error}</p>
        )}

        {/* ── Arrival — whose environment, then the person, then time ── */}
        <div className="nwh-arrive">
          {coachName && <p className="nwh-brand">{coachName} · Executive Coaching</p>}
          <h1 className="nwh-h1">{name ? `Welcome back, ${name}.` : 'Welcome back.'}</h1>
          <p className="nwh-subtitle">
            A private space for what comes next — your life, your meaning,
            your flourishing as a human being.
          </p>
          {nextConversation && (
            <a className="nwh-upcomingline" href={`/now-what/coaching${ctx}`}>
              Next conversation{coachFirst ? ` with ${coachFirst}` : ''} —{' '}
              <b>{whenLabel(nextConversation.start)}</b>
            </a>
          )}
        </div>

        {/* ── UX-02: what you were carrying → where you are now → what might be next.
              The environment's own gesture architecture rules "one primary gesture
              per screen" and "doors are sentences, not buttons-in-grids"; five
              equal cards were a regression against it.

              The primary is NOT hard-coded prominence. It is derived from the
              member's own carried thread — so this screen and the Return screen
              become coherent through continuity rather than through styling. When
              nothing is carried yet, no hero is manufactured: The Room takes the
              primary, because that is the only gesture available to someone with
              nothing kept. Every other room stays one click away. ── */}
        {livingQuestion ? (
          <section className="nwh-carry" aria-label="What you are carrying">
            <p className="nwh-label">What you are carrying</p>
            <p className="nwh-carry-line">&ldquo;{livingQuestion.title}&rdquo;</p>
            <p className="nwh-prov">You kept this{keptWhen(livingQuestion.keptAt)}.</p>
            <a className="nwh-primary" href={`/now-what/questions${ctx}`}>
              Continue thinking &rarr;
            </a>
          </section>
        ) : (
          <section className="nwh-carry" aria-label="Where to begin">
            <p className="nwh-label">Where to begin</p>
            <p className="nwh-carry-line nwh-carry-plain">
              Nothing is waiting for you yet. That is a fine place to start.
            </p>
            <a className="nwh-primary" href={`${roomHref}${amp}entry=think`}>
              Think something through &rarr;
            </a>
          </section>
        )}

        {/* Doors as sentences — stacked, hairline-separated, never competing
            side by side. Each states where it goes in the member's terms. */}
        <nav className="nwh-doors" aria-label="Your rooms">
          {livingQuestion && (
            <Door href={`${roomHref}${amp}entry=think`} name="The Room"
                  meaning="A place to think" line="Clarify a decision, explore a tension, listen to yourself think." />
          )}
          <Door href={`/now-what/work${ctx}`} name="My Work"
                meaning="What you are living and cultivating" line={livingLine} />
          <Door href={`/now-what/coaching${ctx}`} name="My Coaching"
                meaning="The human relationship" line={coachingLine} />
          <Door href={`/now-what/field${ctx}`} name="My Story"
                meaning="Becoming over time" line="Turning points, realizations, chapters — in your own words." />
          {!livingQuestion && (
            <Door href={`/now-what/questions${ctx}`} name="My Question"
                  meaning="What you are wrestling with" line={questionLine} />
          )}
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
        .nwh-frame { max-width: 46rem; margin: 0 auto; padding: 26px 40px 80px; }
        .nwh-top { display: flex; justify-content: space-between; align-items: baseline; }
        /* Direction B wordmark (brand pass 2026-08-05): words in ink, the
           question mark in bronze — a question, not a label. */
        .nwh-wordmark {
          font-size: 13px; letter-spacing: 0.35em; text-transform: uppercase;
          color: ${INK}; text-decoration: none;
        }
        .nwh-wordmark-q { color: ${BRONZE}; }
        .nwh-loc { font-size: 12px; color: ${INK_FAINT}; font-weight: 300; }
        .nwh-error { margin-top: 24px; color: #8c2f22; font-size: 14px; font-weight: 300; }

        .nwh-arrive { margin-top: 40px; text-align: center; }
        .nwh-brand { font-size: 11px; letter-spacing: 0.4em; text-transform: uppercase; color: ${INK_FAINT}; }
        .nwh-h1 {
          font-family: ${SERIF};
          font-size: clamp(30px, 4vw, 38px); font-weight: 400; margin-top: 14px;
        }
        .nwh-subtitle { font-size: 16px; font-weight: 300; color: ${INK_SOFT}; margin-top: 8px; }
        .nwh-upcomingline {
          display: inline-block; margin-top: 18px; font-size: 13.5px; font-weight: 300;
          color: ${INK_FAINT}; text-decoration: none;
        }
        .nwh-upcomingline b { font-family: ${SERIF}; font-weight: 400; color: ${INK_SOFT}; }
        .nwh-upcomingline:hover b { color: ${BRONZE}; }

        /* ── What you are carrying: the compositional centre. A hairline rail,
              not a box — the eye lands on her words, not on a container. ── */
        .nwh-carry {
          margin-top: 44px; padding-left: 22px;
          border-left: 2px solid ${BRONZE};
        }
        .nwh-label {
          font-size: 10.5px; letter-spacing: 0.28em; text-transform: uppercase;
          color: ${INK_FAINT}; margin: 0;
        }
        .nwh-carry-line {
          font-family: ${SERIF}; font-style: italic;
          font-size: clamp(21px, 3.1vw, 27px); line-height: 1.42;
          color: ${INK}; margin: 12px 0 0; max-width: 34rem;
        }
        .nwh-carry-plain { font-style: normal; font-size: clamp(19px, 2.6vw, 23px); color: ${INK_SOFT}; }
        .nwh-prov { font-size: 12.5px; font-weight: 300; color: ${INK_FAINT}; margin: 10px 0 0; }
        .nwh-primary {
          display: inline-block; margin-top: 18px; font-size: 15px;
          color: ${BRONZE}; text-decoration: none;
          border-bottom: 1px solid transparent; padding-bottom: 2px;
          transition: border-color .18s ease;
        }
        .nwh-primary:hover, .nwh-primary:focus-visible { border-bottom-color: ${BRONZE}; }

        /* ── Doors as sentences: stacked, hairline-separated. Two doors never sit
              side by side competing. Motion is settling, not attracting. ── */
        .nwh-doors { margin-top: 40px; display: flex; flex-direction: column; }
        .nwh-door {
          display: block; text-decoration: none; color: ${INK};
          padding: 17px 0; border-top: 1px solid ${RULE};
          transition: color .18s ease;
        }
        .nwh-doors .nwh-door:last-child { border-bottom: 1px solid ${RULE}; }
        .nwh-dhead { display: flex; align-items: baseline; gap: 12px; flex-wrap: wrap; }
        .nwh-dname { font-family: ${SERIF}; font-size: 17.5px; }
        .nwh-dmean {
          font-size: 10.5px; letter-spacing: 0.22em; text-transform: uppercase;
          color: ${INK_FAINT};
        }
        .nwh-dline {
          display: block; font-size: 13.5px; font-weight: 300; color: ${INK_SOFT};
          line-height: 1.6; margin-top: 6px; max-width: 44rem;
        }
        .nwh-door:hover .nwh-dname, .nwh-door:focus-visible .nwh-dname { color: ${BRONZE}; }
        .nwh-door:focus-visible { outline: 2px solid ${BRONZE}; outline-offset: 4px; }

        .nwh-quote { margin-top: 44px; text-align: center; padding: 0 26px; }
        .nwh-quote-text {
          font-family: ${SERIF}; font-size: 18px; font-style: italic;
          color: ${INK_SOFT}; line-height: 1.6; max-width: 44rem; margin: 0 auto;
        }
        .nwh-quote-who { font-size: 12.5px; font-weight: 300; color: ${INK_FAINT}; margin-top: 10px; }

        .nwh-trust {
          margin-top: 40px; border: 1px dashed ${RULE}; border-radius: 16px; padding: 22px 28px;
        }
        .nwh-trust, .nwh-trust * { color: ${INK_SOFT} !important; border-color: rgba(90,76,58,0.25); }
        .nwh-trust [class*="bg-"] { background: rgba(90,76,58,0.05) !important; }

        @media (max-width: 920px) {
          .nwh-frame { padding: 22px 22px 72px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .nwh-primary, .nwh-door { transition: none; }
        }
      `}</style>
    </div>
  );
}
