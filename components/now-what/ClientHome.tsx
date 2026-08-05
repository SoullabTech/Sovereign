'use client';

/**
 * Now What? — Client Home. Larry's executive coaching platform, as the
 * member's arrival screen.
 *
 * NORTH STAR (founder, 2026-08-05): "Now What? is Larry Closs' executive
 * coaching platform that helps leaders continue their development between
 * coaching conversations." Hierarchy: coach's practice → program → the
 * member's work → conversation, with MAIA as SUPPORT — capability, never
 * identity. The member should understand the product before the technology.
 *
 * Built to the ratified floor plan + gesture architecture
 * (docs/design/now-what/NOW_WHAT_EXPERIENTIAL_FLOOR_PLAN.md,
 *  docs/design/now-what/NOW_WHAT_GESTURE_ARCHITECTURE.md) and the design
 * laws in docs/design/INHABITABLE_ARCHITECTURE.md:
 *   - Plain language at the doorway; meaningful experience inside. The
 *     product speaks plainly; the member's own words are the only poetry.
 *   - Design carries the meaning; words only orient. Brand → trust,
 *     structure → purpose, interaction → possibility, content → meaning.
 *   - One primary gesture: continue the work. Everything else recedes.
 *
 * PRODUCT TEST (pre-registered): Larry opens this → "this extends my
 * executive coaching between sessions." A CEO opens this → "this helps me
 * continue the work I am doing with my coach." If either says "this is an
 * AI app" or "an LMS", the hierarchy is wrong.
 *
 * WHAT THIS ROOM STILL REFUSES (structural, unchanged):
 *   - No score, streak, ranking, progress bar, completion count.
 *   - No system-voiced finding; every line is the member's words or a plain
 *     fact about their own act, with its author shown.
 *   - The invitation is a static string — never an inference from member
 *     material. Adaptation keys on authored facts only.
 *   - Kept, not "recent" (E-2): presence comes from the member's keeping
 *     gesture; no recency labels on their material.
 *   - No silent coach visibility; the boundary is stated in one sentence.
 *
 * Data: ONE member-scoped composition call (`/api/now-what/home`), which now
 * carries the narrow orientation slice (coach name · program · focus) and
 * nothing else practitioner-side. Opening this room writes nothing.
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
  coachName: string | null;
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
 * The member's work as ONE thread: what they kept, interleaved, ordered by
 * their own keeping gesture (`keptAt`). Interleaving is rendering, not
 * synthesis — every word stays the member's, typed and attributed.
 */
function asWork(data: HomePayload): FieldItem[] {
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

/* Register ruling 2026-08-05: native executive words, short nouns. */
const KIND_LABEL: Record<FieldItem['kind'], string> = {
  decision: 'Decision',
  commitment: 'Commitment',
  question: 'Question',
  reflection: 'Reflection',
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
  const workHref = `/now-what/field${ctx}`;

  if (session === 'unknown') return null;
  if (session === 'out') {
    return (
      <NowWhatThreshold
        roomName="Your space"
        line="Continue your leadership development between coaching conversations."
        fieldContext={fieldContext}
      />
    );
  }

  const coachName = data?.coachName ?? null;
  const coachFirst = coachName ? coachName.split(' ')[0] : null;
  const sessions = data?.sessions ?? [];
  const shared = data?.shared ?? [];
  const work = data ? asWork(data) : [];
  const lastSession = sessions[0] ?? null;
  const focal = data?.journey?.[0] ?? null;

  /* One arrival sentence — program first, coach as fallback, plain always. */
  const continuesLine = focal?.programTitle
    ? `Your ${focal.programTitle} work continues.`
    : coachName
      ? `Your coaching work with ${coachFirst} continues here.`
      : 'Your coaching work continues here.';

  return (
    <>
      <NowWhatShell current="Home" fieldContext={fieldContext} variant="quiet" />

      <div className="relative max-w-2xl mx-auto px-5 sm:px-6 pt-10 sm:pt-14 pb-16">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_40%_at_50%_0%,rgba(125,175,255,0.10),transparent_70%)]"
        />

        {error && (
          <p role="alert" className="relative text-red-300 text-sm font-light mb-10">
            {error}
          </p>
        )}

        {/* Brand — who owns this. Trust before anything else. */}
        {coachName && (
          <p
            className="relative text-center text-[11px] uppercase tracking-[0.35em] text-slate-500"
            style={{ animation: 'nwhFadeUp 0.6s ease both' }}
          >
            {coachName} Coaching
          </p>
        )}

        {/* Arrival — where am I, what am I working on */}
        <header
          className="relative text-center mt-6"
          style={{ animation: 'nwhFadeUp 0.6s ease 60ms both' }}
        >
          <h1 className="text-slate-100 text-3xl sm:text-4xl font-extralight tracking-wide leading-tight">
            {name ? `Welcome back, ${name}.` : 'Welcome back.'}
          </h1>
          <p className="text-slate-400 text-base font-light leading-relaxed mt-4">
            {continuesLine}
          </p>
          {focal && (
            <p className="text-slate-300 text-base sm:text-lg font-light leading-relaxed mt-3">
              You are working on:{' '}
              <span className="text-slate-100">&ldquo;{focal.focalPoint}&rdquo;</span>
              <span className="text-slate-500 text-sm block mt-1.5">
                {focal.statedBy === 'practitioner_seeded'
                  ? 'placed by your coach — yours when you say so'
                  : 'in your own words'}
              </span>
            </p>
          )}
        </header>

        {/* Next action — one door. MAIA is support, not identity. */}
        <section
          className="relative flex flex-col items-center text-center mt-10 sm:mt-12"
          style={{ animation: 'nwhFadeUp 0.6s ease 140ms both' }}
        >
          <div className="opacity-60">
            <RoomHoloflower
              coolTint
              mono
              motionState="idle"
              proposedElement={null}
              confirmedElements={[]}
              size={64}
            />
          </div>
          <h2 className="text-slate-100 text-xl sm:text-2xl font-extralight tracking-wide mt-5">
            What are you working through today?
          </h2>
          <a
            href={roomHref}
            className="mt-6 rounded-full border px-9 py-3 text-base transition-all hover:shadow-[0_0_40px_rgba(255,226,122,0.35)]"
            style={{ color: ACCENT, borderColor: 'rgba(255,226,122,0.5)', background: 'rgba(255,226,122,0.05)' }}
          >
            Continue your work
          </a>
          <p className="text-slate-500 text-xs font-light mt-3">
            Supported by MAIA between coaching conversations.
          </p>
          {lastSession && (
            <p className="text-slate-500 text-sm font-light mt-3">
              Last conversation, {dayLabel(lastSession.at)} — you carried{' '}
              {lastSession.carried === 1 ? 'one thing' : `${lastSession.carried} things`} forward.
            </p>
          )}
        </section>

        {/* The member's work — their words are the meaningful layer. */}
        <section className="relative mt-12 sm:mt-14" style={{ animation: 'nwhFadeUp 0.6s ease 220ms both' }}>
          <p className="text-[11px] uppercase tracking-[0.35em] mb-6" style={{ color: ACCENT }}>
            Your work
          </p>
          {work.length === 0 ? (
            <p className="text-slate-400 text-[15px] font-light leading-relaxed max-w-prose">
              What you choose to keep in your conversations gathers here — in
              your words, yours alone.
            </p>
          ) : (
            <>
              <ul className="space-y-7">
                {work.slice(0, 4).map((t) => (
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
                      {/* The member's ACT, not a visibility claim — "brought
                          into your coaching" (ratified bring-forward
                          vocabulary), never "Larry can see this". */}
                      {t.sharedWithCoach && (
                        <span className="ml-2" style={{ color: 'rgba(255,226,122,0.7)' }}>
                          brought into your coaching
                        </span>
                      )}
                    </p>
                  </li>
                ))}
              </ul>
              <p className="mt-8">
                <a
                  href={workHref}
                  className="text-slate-400 hover:text-slate-200 text-sm font-light underline underline-offset-4 transition-colors"
                >
                  View all your work →
                </a>
              </p>
            </>
          )}
        </section>

        {/* Coaching relationship — one sentence; persists because it is a
            relationship, not a capability. */}
        <section className="relative mt-12 sm:mt-14 space-y-5" style={{ animation: 'nwhFadeUp 0.6s ease 300ms both' }}>
          <p className="text-slate-400 text-sm font-light leading-relaxed max-w-prose">
            {shared.length > 0
              ? `You have brought ${
                  shared.length === 1 ? 'one piece' : `${shared.length} pieces`
                } of your work into your coaching — nothing else reaches ${coachFirst ?? 'your coach'}.`
              : `Nothing you keep here reaches ${coachFirst ?? 'your coach'} unless you choose to bring it, one piece at a time.`}
          </p>

          <RoomTrustCopy
            holds="What you authored in this environment — the decisions you are working through, your commitments, your questions, and what you chose to keep."
            doesNotHold="No scores, rankings, progress measures, assessments or summaries of you. No record of how often you come here, and no interpretation of your material by anyone but you."
            whoSees="You. Your coach receives a piece only if you explicitly brought it into your coaching, one piece at a time — never automatically, and never because you were active here."
            control="Everything here exists because of a gesture you made. Opening this room writes nothing. Anything brought into your coaching can be withdrawn, and withdrawing it tells no one."
          />
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
