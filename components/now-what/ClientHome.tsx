'use client';

/**
 * Now What? — Client Home. The room a person enters to continue their work.
 *
 * EXPERIENCE RESET (founder directive 2026-08-04 — see
 * docs/design/now-what/NOW_WHAT_EXPERIENCE_GAP.md), built to the RATIFIED
 * floor plan (docs/design/now-what/NOW_WHAT_EXPERIENTIAL_FLOOR_PLAN.md,
 * approved with refinements 2026-08-05). Rooms below are BUILDER vocabulary —
 * architecture, not navigation; members never see these names.
 *
 *   THRESHOLD — recognition, no choices. Known WITHOUT being interpreted:
 *      name, relationship, what they chose to carry — never state, needs,
 *      or readiness.
 *   HEARTH — relationship continuity through conversation (the medium, not
 *      the purpose). MAIA opens the door; Larry gives the room meaning.
 *      THE INVITATION NEVER ADAPTS ("What is alive for you today?"); the one
 *      door beneath it does (Begin with MAIA / Continue with MAIA).
 *      Continuity is offered AFTER the invitation, never imposed before it:
 *      present self → conversation → continuity.
 *   LIVING ROOM — within the Hearth, not a destination: what is currently on
 *      the table, in the member's words, typed and attributed. A dining
 *      table is not a warehouse shelf — few things, and a door to the rest.
 *   ARCHIVE — "the past never furnishes the entryway": one quiet door.
 *   COACH RELATIONSHIP — persists on the arrival floor because it is a
 *      relationship, not a capability. One sentence; never a "room".
 *
 * WHAT THIS ROOM STILL REFUSES (unchanged, structural, not taste):
 *   - No score, percentage, streak, ranking, completion count, progress bar.
 *   - No system-voiced finding. "What is alive for you today?" is a standing
 *     invitation string — never an inference from member material.
 *   - Every line is the member's own words or a plain fact about their own
 *     act, and every claim carries its author.
 *   - No silent coach visibility: nothing reaches a coach except by an
 *     explicit per-thread gesture, and that boundary is stated in the room.
 *
 * Data comes from ONE member-scoped composition call (`/api/now-what/home`)
 * over material the member already authored. Opening this room writes
 * nothing.
 */

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import { NowWhatShell, NowWhatThreshold, useMemberSession } from '@/components/now-what/NowWhatShell';
import { RoomTrustCopy } from '@/components/now-what/RoomTrustCopy';
import { RoomHoloflower } from '@/components/maia/vision-studio/RoomHoloflower';

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

/** A kept thing, carrying which act of keeping made it exist. */
type FieldItem = HomeThread & { kind: 'decision' | 'commitment' | 'question' | 'reflection' };

function dayLabel(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleDateString(undefined, { month: 'long', day: 'numeric' });
}

/** Whose act made this exist. Attribution is necessary, never decorative. */
function authorLine(authorship: string): string {
  if (authorship === 'member_authored') return 'in your words';
  return 'you kept this';
}

/**
 * The member's field as ONE thread: what they kept, interleaved, ordered by
 * their own keeping gesture (`keptAt`). Interleaving is rendering, not
 * synthesis — every word stays the member's, typed and attributed.
 */
function asField(data: HomePayload): FieldItem[] {
  const tag = (items: HomeThread[], kind: FieldItem['kind']): FieldItem[] =>
    items.map((t) => ({ ...t, kind }));
  const merged = [
    ...tag(data.decisions, 'decision'),
    ...tag(data.commitments, 'commitment'),
    ...tag(data.questions, 'question'),
    ...tag(data.reflections, 'reflection'),
  ];
  const seen = new Set<string>();
  return merged
    .filter((t) => (seen.has(t.id) ? false : (seen.add(t.id), true)))
    .sort((a, b) => (b.keptAt || '').localeCompare(a.keptAt || ''));
}

const KIND_LABEL: Record<FieldItem['kind'], string> = {
  decision: 'a decision you are working through',
  commitment: 'a commitment you are practising',
  question: 'a question you are living',
  reflection: 'something you kept',
};

// ── The room ─────────────────────────────────────────────────────────────

export default function ClientHome({ fieldContext }: { fieldContext?: string }) {
  const session = useMemberSession();
  const [data, setData] = useState<HomePayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);

  // Session fact only: the member's own stored session, never an inference
  // about who they are.
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
  const fieldHref = `/now-what/field${ctx}`;

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
  const sessions = data?.sessions ?? [];
  const shared = data?.shared ?? [];
  const field = data ? asField(data) : [];
  const lastSession = sessions[0] ?? null;
  const focal = journey[0] ?? null;

  return (
    <>
      {/* Quiet shell: wordmark + location only. The room's own doors carry
          wayfinding — no pill bar between the person and their work. */}
      <NowWhatShell current="Home" fieldContext={fieldContext} variant="quiet" />

      <div className="relative max-w-2xl mx-auto px-5 sm:px-6 pt-12 sm:pt-16 pb-16">
        {/* The environment's weather — between the movements, never inside them */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_40%_at_50%_0%,rgba(125,175,255,0.10),transparent_70%)]"
        />

        {error && (
          <p role="alert" className="relative text-red-300 text-sm font-light mb-10">
            {error}
          </p>
        )}

        {/* ① Arrival — the person, and where their work is pointed */}
        <header className="relative text-center" style={{ animation: 'nwhFadeUp 0.6s ease both' }}>
          <h1 className="text-slate-100 text-3xl sm:text-4xl font-extralight tracking-wide leading-tight">
            {name ? `Welcome back, ${name}.` : 'Welcome back.'}
          </h1>
          {focal ? (
            <p className="text-slate-300 text-base sm:text-lg font-light leading-relaxed mt-4">
              You are working through{' '}
              <span className="text-slate-100">{focal.focalPoint}</span>
              <span className="text-slate-500 text-sm block mt-1.5">
                {focal.statedBy === 'practitioner_seeded'
                  ? 'placed by your coach — yours when you say so'
                  : 'in your own words'}
              </span>
            </p>
          ) : (
            <p className="text-slate-400 text-base font-light leading-relaxed mt-4">
              Your work is here, and it continues here.
            </p>
          )}
        </header>

        {/* ② Doorway — the conversation is the center of the room */}
        <section
          className="relative flex flex-col items-center text-center mt-12 sm:mt-14"
          style={{ animation: 'nwhFadeUp 0.6s ease 120ms both' }}
        >
          <RoomHoloflower
            coolTint
            mono
            motionState="idle"
            proposedElement={null}
            confirmedElements={[]}
            size={130}
          />
          <h2 className="text-slate-100 text-xl sm:text-2xl font-extralight tracking-wide mt-6">
            What is alive for you today?
          </h2>
          <a
            href={roomHref}
            className="mt-6 rounded-full border px-9 py-3 text-base transition-all hover:shadow-[0_0_40px_rgba(255,226,122,0.35)]"
            style={{ color: ACCENT, borderColor: 'rgba(255,226,122,0.5)', background: 'rgba(255,226,122,0.05)' }}
          >
            {lastSession ? 'Continue with MAIA' : 'Begin with MAIA'}
          </a>
          {lastSession && (
            <p className="text-slate-500 text-sm font-light mt-4">
              Last conversation, {dayLabel(lastSession.at)} — you carried{' '}
              {lastSession.carried === 1 ? 'one thing' : `${lastSession.carried} things`} forward.
            </p>
          )}
        </section>

        {/* LIVING ROOM — within the Hearth, not a destination (ratified
            amendment): what is currently on the table. The thread is why the
            conversation matters, so it sits close beneath the door. */}
        <section className="relative mt-10 sm:mt-12" style={{ animation: 'nwhFadeUp 0.6s ease 240ms both' }}>
          <p className="text-[11px] uppercase tracking-[0.35em] mb-6" style={{ color: ACCENT }}>
            What you are carrying
          </p>
          {field.length === 0 ? (
            <p className="text-slate-400 text-[15px] font-light leading-relaxed max-w-prose">
              What you choose to keep in your conversations gathers here — in
              your words, yours alone.
            </p>
          ) : (
            <>
              <ul className="space-y-7">
                {field.slice(0, 4).map((t) => (
                  <li key={t.id} className="relative border-l pl-5" style={{ borderColor: 'rgba(255,226,122,0.25)' }}>
                    <span
                      aria-hidden
                      className="absolute -left-[3.5px] top-2 w-1.5 h-1.5 rounded-full"
                      style={{ background: 'rgba(255,226,122,0.8)', boxShadow: '0 0 10px rgba(255,226,122,0.55)' }}
                    />
                    <p className="text-slate-600 text-[11px] uppercase tracking-[0.2em] mb-1.5">
                      {KIND_LABEL[t.kind]}
                    </p>
                    <p className="text-slate-100 text-[16px] font-light leading-relaxed">{t.title}</p>
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
                ))}
              </ul>
              {/* ARCHIVE — a quiet door, never the first encounter. */}
              <p className="mt-8">
                <a
                  href={fieldHref}
                  className="text-slate-400 hover:text-slate-200 text-sm font-light underline underline-offset-4 transition-colors"
                >
                  Everything you&rsquo;ve carried →
                </a>
              </p>
            </>
          )}
        </section>

        {/* COACH RELATIONSHIP — persists because it is a relationship, not a
            capability. Relationship first, boundary second; never a "room". */}
        <section className="relative mt-14 sm:mt-16 space-y-5" style={{ animation: 'nwhFadeUp 0.6s ease 360ms both' }}>
          <p className="text-slate-400 text-sm font-light leading-relaxed max-w-prose">
            {shared.length > 0
              ? `Your coaching work continues here. You have brought ${
                  shared.length === 1 ? 'one piece' : `${shared.length} pieces`
                } of what you are carrying into the work together — nothing else reaches your coach.`
              : 'Your coaching work continues here. Nothing you keep reaches your coach unless you choose to bring it, one piece at a time.'}
          </p>

          <RoomTrustCopy
            holds="What you authored in this environment — the decisions you are working through, what you are practising, the questions you are living, and what you chose to keep."
            doesNotHold="No scores, rankings, progress measures, assessments or summaries of you. No record of how often you come here, and no interpretation of your material by anyone but you."
            whoSees="You. Your coach sees a piece only if you explicitly shared it, one piece at a time — never automatically, and never because you were active here."
            control="Everything here exists because of a gesture you made. Opening this room writes nothing. Anything shared can be withdrawn, and withdrawing it tells no one."
          />

          <p className="text-slate-600 text-sm font-light italic">Nothing here rushes you.</p>
        </section>

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
