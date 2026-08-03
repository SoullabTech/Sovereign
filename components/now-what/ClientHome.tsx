'use client';

/**
 * Now What? — My Work Field. The surface an executive arrives into.
 *
 * PHASE 1 of docs/specs/MY_WORK_FIELD_UX_SPEC_V1.md (governed by
 * MY_WORK_FIELD_GOVERNANCE_MODEL_V1.md R1–R7).
 *
 * WHAT CHANGED AND WHY. This room previously rendered six fixed sections —
 * My journey, Decisions, Commitments, Sessions, Reflections, Coach
 * connection — each with its own authored empty state. A member with nothing
 * kept yet met six empty paragraphs, which reads as a broken product rather
 * than a quiet one, and it asked them to learn our object model before they
 * could find their own work. The taxonomy was ours; the arrival was theirs.
 *
 * THE GOVERNING RULE (spec §1): this is a CONTEXTUAL STREAM, not five
 * modules. A layer with no content DOES NOT RENDER. There is no placeholder
 * card, no "nothing here yet" repeated down the page, no dead rooms. The
 * blocks below are the vocabulary of what can appear — not a template.
 *
 * The single exception is arrival (spec §6): when nothing is under way, the
 * member meets ONE welcome, not five absences.
 *
 * WHAT THIS SURFACE STILL REFUSES, structurally and not as taste:
 *   - No score, percentage, streak, ranking, completion count, progress bar,
 *     and no "week N of M" — progress framing converts development into
 *     completion tracking (spec §2.1 correction).
 *   - No system-voiced finding. Every line is either the member's own words
 *     or a plain fact about their own act, and every claim carries its
 *     author (R4 · spec §3).
 *   - No recency framing. Order follows the member's keeping gesture, never
 *     "recent" or "latest" — and never an inferred importance (Governance
 *     §6: the system may reveal momentum, it may not manufacture direction).
 *   - No silent coach visibility. Nothing reaches a coach except by an
 *     explicit per-thread gesture.
 *
 * WHAT PHASE 1 DELIBERATELY DOES NOT DO: no new tables, no new API, no
 * participation object (Gate 1 open), no practitioner pathways — Prepare,
 * Practice-as-offered, lessons, resources, messaging and groups all wait for
 * phases 2–3. The member's own distinctions are PRESERVED, not collapsed:
 * a decision is not a commitment is not a reflection. Only their placement
 * in the front door changed.
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
  return 'you kept this';
}

/**
 * A block of the stream. Unlike the Section it replaces, this is never
 * rendered empty — callers gate on content before mounting it, so the page
 * is composed of what exists rather than a skeleton with holes.
 */
function Block({
  eyebrow,
  title,
  lead,
  children,
  delay = 0,
}: {
  eyebrow: string;
  title?: string;
  lead?: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <section className={PANEL} style={{ animation: `nwhFadeUp 0.55s ease ${delay}ms both` }}>
      <p className="text-[11px] uppercase tracking-[0.3em] mb-2" style={{ color: ACCENT }}>
        {eyebrow}
      </p>
      {title && (
        <h2 className="text-slate-100 text-xl sm:text-2xl font-extralight tracking-wide">{title}</h2>
      )}
      {lead && (
        <p className="text-slate-400 text-sm font-light leading-relaxed mt-2 max-w-prose">{lead}</p>
      )}
      <div className="mt-5">{children}</div>
    </section>
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

/**
 * A named group of the member's own material INSIDE a block. This is how the
 * member's distinctions survive the front-door change: a decision is still a
 * decision, but it is no longer a room you must navigate to. Renders nothing
 * when the member has none of that kind.
 */
function Strand({ label, items }: { label: string; items: HomeThread[] }) {
  if (items.length === 0) return null;
  return (
    <div className="mt-6 first:mt-0">
      <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400 mb-4">{label}</p>
      <ul className="space-y-5">
        {items.map((t) => <ThreadCard key={t.id} t={t} />)}
      </ul>
    </div>
  );
}

/**
 * The single accented action of a block. Its label is always one of the four
 * member verbs — Continue · Practice · Explore · Keep (spec §4). The verbs
 * Create, Add, Complete, Submit and Track are banned from this surface.
 */
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

/** How the member's own focus was placed, in the placer's voice, always attributed. */
function statedByLine(j: JourneyRow): string {
  const when = j.confirmedAt ? ` · ${dayLabel(j.confirmedAt)}` : '';
  if (j.statedBy === 'practitioner_seeded') return 'placed by your coach — yours when you say so';
  if (j.statedBy === 'member_stated') return `in your own words${when}`;
  return `you confirmed this${when}`;
}

// ── The field ────────────────────────────────────────────────────────────

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
      /* a missing or unreadable name is not an error — the field greets plainly */
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
        if (!res.ok) throw new Error(json?.error || 'Could not open your work right now.');
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
        roomName="Your work"
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

  // What the member actually has. Each block below mounts only when its own
  // content exists — the page is composed, never scaffolded.
  const hasCurrentWork = journey.length > 0;
  const hasMaterial =
    decisions.length > 0 || questions.length > 0 || commitments.length > 0 || reflections.length > 0;
  const hasSessions = sessions.length > 0;
  const hasShared = shared.length > 0;
  const hasAnything = hasCurrentWork || hasMaterial || hasSessions || hasShared;

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

        {error && (
          <p role="alert" className={`${PANEL} text-red-300 text-sm font-light`}>
            {error}
          </p>
        )}

        {!data && !error && (
          <p className={`${PANEL} text-slate-500 text-sm font-light`}>Opening your work…</p>
        )}

        {/*
          ARRIVAL (spec §6). The most common first render, and the one the old
          surface got wrong. A person with nothing under way is not in an
          error state and is not looking at a gap — they are at the beginning.
          One welcome, stated warmly, never as an absence, and never five
          empty rooms listing capabilities they do not have.
        */}
        {data && !hasAnything && (
          <section
            className={`${PANEL} sm:p-9`}
            style={{ animation: 'nwhFadeUp 0.55s ease both' }}
          >
            <h1 className="text-slate-100 text-3xl sm:text-4xl font-extralight tracking-wide leading-tight">
              {name ? `${name}, your work field.` : 'Your work field.'}
            </h1>
            <p className="text-slate-300 text-base font-light leading-relaxed mt-4 max-w-prose">
              A place for the work you choose to carry forward.
            </p>
            <p className="text-slate-400 text-sm font-light leading-relaxed mt-4 max-w-prose">
              When your practitioner invites you into a programme, your current work
              will appear here. You can also begin by bringing something you want to
              explore.
            </p>
            <div className="mt-7">
              <Door href={roomHref}>Explore →</Door>
            </div>
          </section>
        )}

        {data && hasAnything && (
          <>
            {/*
              CURRENT WORK (spec §2.1) — the anchor. Opens with CONTEXT, never
              with objects: the member is the subject of the sentence and the
              programme is only its setting (R2). Renders nothing at all when
              no focus has been placed — there is no "no programme yet" line,
              because an absent programme is not a deficiency to announce.

              No progress, no counts, no "week N of M": focal_points[] orders
              the practitioner's sequence for assembly, and its ordinal is not
              a completion denominator.
            */}
            {hasCurrentWork && (
              <header className="relative pt-2 pb-1" style={{ animation: 'nwhFadeUp 0.55s ease both' }}>
                <p className="text-[11px] uppercase tracking-[0.3em] mb-3" style={{ color: ACCENT }}>
                  {name ? `${name}, you are working on` : 'You are working on'}
                </p>
                <ul className="space-y-5">
                  {journey.map((j) => (
                    <li key={`${j.programSlug}-${j.focalPoint}`} className="space-y-1.5">
                      <h1 className="text-slate-100 text-3xl sm:text-4xl font-extralight tracking-wide leading-tight">
                        {j.focalPoint}
                      </h1>
                      <p className="text-slate-500 text-sm font-light">
                        {j.programTitle ? `Within ${j.programTitle} · ` : ''}
                        {statedByLine(j)}
                      </p>
                    </li>
                  ))}
                </ul>
              </header>
            )}

            {/*
              WHAT YOU ARE WORKING WITH — the member's own material, in their
              words. The kinds are PRESERVED as strands rather than collapsed
              (Phase 1 rule: decision ≠ commitment ≠ reflection), but they are
              no longer six destinations the member must navigate. Each strand
              disappears entirely when the member has none of that kind.
            */}
            {hasMaterial && (
              <Block
                eyebrow="Your work"
                title={hasCurrentWork ? undefined : 'What you are working with'}
                lead="In your words, in the order you kept them. Nothing here is inferred, nothing ranks or summarises you, and nothing measures how you are doing."
                delay={60}
              >
                <Strand label="Decisions you are carrying" items={decisions} />
                <Strand label="Questions you are living" items={questions} />
                <Strand label="What you are practising" items={commitments} />
                <Strand label="What you kept" items={reflections.slice(0, 8)} />
                {reflections.length > 8 && (
                  <p className="mt-6">
                    <a
                      href={`/now-what/field${ctx}`}
                      className="text-slate-400 hover:text-slate-200 text-sm font-light underline underline-offset-4 transition-colors"
                    >
                      Open your full field →
                    </a>
                  </p>
                )}
              </Block>
            )}

            {/*
              CONTINUE — the thread between conversations. This is the single
              door of the surface. The old room had two doors pointing at the
              identical URL (defect D1); one door removes the contradiction
              without carrying intent, which is a later phase and a ruled
              question, not a query-param patch.
            */}
            <Block
              eyebrow="Continue"
              lead={
                hasSessions
                  ? 'What you carried out of your conversations, and the way back into the next one.'
                  : undefined
              }
              delay={120}
            >
              {hasSessions && (
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
              <div className="flex flex-wrap items-center gap-4">
                <Door href={roomHref}>{hasSessions ? 'Continue →' : 'Explore →'}</Door>
                <p className="text-slate-500 text-xs font-light">
                  What is most alive · what changed · what you want to bring.
                </p>
              </div>
            </Block>

            {/*
              SHARED WITH YOUR COACH — the boundary from the member's own side.
              Renders only when the member has actually shared something. The
              old surface stated the boundary as an empty state on every visit;
              a boundary nobody has crossed does not need announcing every time,
              and the same commitment is held durably in the trust copy below.
            */}
            {hasShared && (
              <Block
                eyebrow="Shared with your coach"
                lead="You chose to bring these into the work together. Nothing else from here reaches them, and anything shared can be withdrawn."
                delay={180}
              >
                <ul className="space-y-5">
                  {shared.map((t) => <ThreadCard key={t.id} t={t} />)}
                </ul>
              </Block>
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
