'use client';

/**
 * Now What? — Client Home: the orientation field (six-door constellation,
 * founder-directed 2026-08-05).
 *
 * "Every doorway makes a promise; every promise deserves its own room.
 *  Do not make the home richer — make the rooms deeper."
 *
 * The home is not where everything happens. It answers ONE question:
 * "What part of my life and development do I want to enter right now?"
 * Six doors — inquiry · embodiment · flourishing · relationship ·
 * becoming · thinking — plus time as the quiet continuity line, the daily
 * thought as ambient orientation, and the trust boundary stated once.
 *
 * Doors and their rooms (NOW_WHAT_HOME_DOOR_MAP_2026-08-05.md):
 *   question    → /now-what/room?entry=question&thread=<id>  (Reflection Room)
 *   living      → /now-what/room?entry=lived                 (Living Practice)
 *   cultivating → /now-what/cultivate                        (Flourishing Field)
 *   coaching    → /now-what/coaching                         (Coaching Room)
 *   story       → /now-what/field                            (Life Story / archive)
 *   think       → /now-what/room?entry=think                 (MAIA)
 *   programs    → /now-what/position                         (Where you are)
 *   calendar    → /now-what/calendar                         (Calendar Room)
 *   upcoming    → /now-what/calendar                         (Calendar Room)
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

/** One door in the orientation field: name · meaning · living line · verb. */
function Door({
  href, name, meaning, line, verb, warm, italicLine,
}: {
  href: string; name: string; meaning: string; line: string; verb: string;
  warm?: boolean; italicLine?: boolean;
}) {
  return (
    <a className={`nwh-door${warm ? ' nwh-door-warm' : ''}`} href={href}>
      <p className="nwh-dname">{name}</p>
      <p className="nwh-dmean">{meaning}</p>
      <p className={`nwh-dline${italicLine ? ' nwh-dline-italic' : ''}`}>{line}</p>
      <span className="nwh-dverb">{verb} &rarr;</span>
    </a>
  );
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
        roomName="Your space"
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

  /* Programs — the member's declared place in a program, or honest absence.
     Membership only: no curriculum, no materials, no stages-as-progress. */
  const programCount = data?.journey?.length ?? 0;
  const programsLine = focal
    ? `${focal.programTitle ?? focal.programSlug} — “${focal.focalPoint}”${programCount > 1 ? ` · and ${programCount - 1} more` : ''}`
    : coachFirst
      ? `When ${coachFirst} places a program with you, it appears here — with where you are, in your own words.`
      : 'When a program is placed with you, it appears here — with where you are, in your own words.';

  /* Calendar — when the relationship continues. Scheduled facts only. */
  const pastCount = data?.sessions?.length ?? 0;
  const calendarLine = nextConversation
    ? `Next conversation${coachFirst ? ` with ${coachFirst}` : ''} — ${whenLabel(nextConversation.start)}.`
    : pastCount > 0
      ? `${pastCount === 1 ? 'One previous conversation' : `${pastCount} previous conversations`} · nothing scheduled yet.`
      : 'When your next conversation is scheduled, it appears here.';

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
            <a className="nwh-upcomingline" href={`/now-what/calendar${ctx}`}>
              Next conversation{coachFirst ? ` with ${coachFirst}` : ''} —{' '}
              <b>{whenLabel(nextConversation.start)}</b>
            </a>
          )}
        </div>

        {/* ── The six doors ── */}
        <div className="nwh-doors">
          <Door
            warm
            italicLine={Boolean(livingQuestion)}
            href={livingQuestion ? `${roomHref}${amp}entry=question&thread=${livingQuestion.id}` : roomHref}
            name="The question you are carrying"
            meaning="Inquiry"
            line={questionLine}
            verb="Continue exploring"
          />
          <Door
            href={`${roomHref}${amp}entry=lived`}
            name="What you are living"
            meaning="Embodiment"
            line={livingLine}
            verb="Reflect on your practice"
          />
          <Door
            href={`/now-what/cultivate${ctx}`}
            name="What you are cultivating"
            meaning="Flourishing"
            line="Relationships · Meaning · Presence · Health · Contribution · Time"
            verb="Explore your flourishing"
          />
          <Door
            href={`/now-what/coaching${ctx}`}
            name="Your coaching relationship"
            meaning="Human relationship"
            line={coachingLine}
            verb={coachFirst ? `Continue with ${coachFirst}` : 'Continue your coaching'}
          />
          <Door
            italicLine={Boolean(focal)}
            href={`/now-what/position${ctx}`}
            name="Your programs"
            meaning="Placed with your coach"
            line={programsLine}
            verb="See where you are"
          />
          <Door
            href={`/now-what/calendar${ctx}`}
            name="Your calendar"
            meaning="When this continues"
            line={calendarLine}
            verb="View your calendar"
          />
          <Door
            href={`/now-what/field${ctx}`}
            name="Your story"
            meaning="Becoming over time"
            line="Turning points, realizations, chapters — in your own words."
            verb="View your story"
          />
          <Door
            href={`${roomHref}${amp}entry=think`}
            name="A place to think"
            meaning="Reflection companion"
            line="Clarify a decision, explore a tension, listen to yourself think."
            verb="Think something through"
          />
        </div>

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
        .nwh-frame { max-width: 74rem; margin: 0 auto; padding: 26px 40px 80px; }
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

        .nwh-doors {
          margin-top: 40px; display: grid;
          grid-template-columns: repeat(3, 1fr); gap: 18px;
        }
        .nwh-door {
          display: block; text-decoration: none; color: ${INK};
          border: 1px solid ${RULE}; background: var(--nw-box);
          border-radius: 16px; padding: 26px 28px; min-height: 150px;
          transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease;
        }
        .nwh-door:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 34px rgba(0,0,0,0.14);
          border-color: var(--nw-bronze);
        }
        .nwh-door-warm { background: var(--nw-box-warm); }
        .nwh-dname { font-family: ${SERIF}; font-size: 20px; }
        .nwh-dmean {
          font-size: 11px; letter-spacing: 0.25em; text-transform: uppercase;
          color: ${INK_FAINT}; margin-top: 6px;
        }
        .nwh-dline { font-size: 13.5px; font-weight: 300; color: ${INK_SOFT}; line-height: 1.6; margin-top: 10px; }
        .nwh-dline-italic { font-family: ${SERIF}; font-style: italic; }
        .nwh-dverb { display: inline-block; margin-top: 14px; font-size: 13.5px; color: ${BRONZE}; }

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
          .nwh-doors { grid-template-columns: 1fr; }
          .nwh-door { min-height: unset; }
        }
      `}</style>
    </div>
  );
}
