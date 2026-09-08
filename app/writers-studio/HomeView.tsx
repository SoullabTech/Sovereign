'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FilePlus2, FolderInput, Loader2, Trash2 } from 'lucide-react';
import { PRESS, SERIF } from './pressTheme';
import { CANVAS_HREF, IMPORT_HREF } from './studioMap';
import { canvasForManuscript } from './canvasIdentity';
import { DELETE_WORK_COPY, REMOVE_WORK_COPY, type DeleteTarget } from '@/lib/writersStudio/deleteWork';
import { arrivalFor, manuscriptIdOf } from './homeState';
import type { CurrentManuscript } from './useCurrentManuscript';
import type { LivingWork } from './useLivingWorks';
import type { MarkedLine } from './useMarkedLines';
import { byDay, sentenceFor, beneath, type StudioAct } from './studioHistory';
import { WorkVisualChooser, CardVisual, HeroVisual } from './WorkVisual';
import { AppearanceMenu } from './atmosphere/AppearanceMenu';

/**
 * Writer's Studio — Home.
 *
 *   Truthfulness is the floor. Hospitality is the design.
 *
 * An earlier pass removed everything that could lie — invented progress,
 * manufactured continuation, doors that only scrolled — and removed the
 * room's warmth with them, leaving a correct listing nobody would want to
 * return to. A sovereign system should not merely be incapable of lying. It
 * should be capable of welcome.
 *
 * So both hold at once:
 *
 *   The photograph creates the room. The member's real work creates the meaning.
 *
 * ── What must never happen here ───────────────────────────────────────────
 * · A manuscript is NOT silently recast as a Work because it makes the page
 *   look populated. The member declares Works; the Studio does not.
 * · No progress bar, streak, quote, theme, or recommendation.
 * · No continuation is claimed that `lastWrittenAt` does not evidence.
 *
 * ── And what must always be possible ──────────────────────────────────────
 * · OPEN WRITING is immediate. A member is never made to classify old work
 *   under a newer ontology before being allowed to use it. The architecture
 *   catches up to the writer, not the reverse. "Make this a work" sits beside
 *   it as an offer, never as a toll.
 * · A member can REMOVE what is theirs. A room you can only add to is not a
 *   studio; it is an attic. Delete is quiet — it never competes with the
 *   writing — but it is always reachable, and it always confirms by name
 *   before it acts (WS-DELETE-01, founder ruling 2026-09-07).
 */

const pageEstimate = (chars: number) => Math.max(1, Math.round(chars / 1800));
/**
 * STUDIO-WRITING-PRESENCE-01 · S1, ratified 2026-09-08.
 *
 * ⛔ "No writing yet" may appear ONLY when no substantive writing exists in
 * either lifecycle layer. It used to be `sourceCharCount === 0`, and
 * `manuscript_sections` is written by exactly one route — import. So every
 * manuscript begun in the Studio said "No writing yet" forever, however much
 * the member wrote: a Source extent answering a presence question.
 *
 * The page estimate still reads Source extent, which is what it truthfully
 * means. Presence and extent are separate arguments precisely so neither can
 * silently answer for the other.
 */
const pagesLabel = (m: { charCount: number; hasWriting: boolean }) =>
  !m.hasWriting
    ? 'No writing yet'
    : `${pageEstimate(m.charCount)} page${pageEstimate(m.charCount) === 1 ? '' : 's'}`;

/**
 * WS-HOME-REDESIGN v0.2 — dates remember, durations judge.
 *
 * This returned "written 3 days ago", "written 2 weeks ago". Elapsed time is
 * the most common way software makes rest look like neglect: a resting Work
 * looked more neglected the longer it rested, and the card was quietly scoring
 * dormancy. The FIELD QUALITY ruling (UNHURRIED) forbids that — unfinished and
 * resting work may remain unfinished and resting.
 *
 * The fact is unchanged and still orienting. Only its shape changes: a fixed
 * point the writer can recognize, not a counter running against them.
 */
function whenWritten(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return null;
  const now = new Date();

  /* Today and yesterday are still FIXED points, not accumulating durations —
     a writer recognizes them as moments, not as distance travelled. */
  if (then.toDateString() === now.toDateString()) return 'written today';
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (then.toDateString() === yesterday.toDateString()) return 'written yesterday';

  const sameYear = then.getFullYear() === now.getFullYear();
  return `written ${then.toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    ...(sameYear ? {} : { year: 'numeric' }),
  })}`;
}

const DELETE_FAILED =
  'That work could not be deleted just now. Nothing was removed — please try again.';

const FILLED =
  'inline-flex items-center justify-center px-8 py-3.5 text-[15px] min-h-[48px] rounded-[2px] transition-opacity hover:opacity-90';
const QUIET =
  'inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-[14px] min-h-[48px] rounded-[2px] border transition-all opacity-75 hover:opacity-100';

export interface HomeViewProps {
  loading: boolean;
  works: LivingWork[];
  manuscripts: CurrentManuscript[];
  /** Passages the member marked in their own writing. May be empty; empty is quiet. */
  markedLines: MarkedLine[];
  /** Recorded acts, newest first. Never derived from current state. */
  historyActs: StudioAct[];
  onBegin: (title: string) => Promise<void>;
  onMakeWork: (manuscriptId: string, title: string | null) => Promise<void>;
  onAddToWork: (manuscriptId: string, workId: string) => Promise<void>;
  /** Ends custody of a work or a piece of writing. Rejects with member copy. */
  onDelete: (target: DeleteTarget) => Promise<void>;
  /** WRITERS-STUDIO-WORK-SHELF-01 — container only; the writing survives. */
  onRemove: (workId: string) => Promise<void>;
}

export default function HomeView({
  loading,
  works,
  manuscripts,
  markedLines,
  historyActs,
  onBegin,
  onMakeWork,
  onAddToWork,
  onDelete,
  onRemove,
}: HomeViewProps) {
  const [beginning, setBeginning] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placing, setPlacing] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  /* Which card is asking. Never more than one: a confirmation the member has
     lost track of is a confirmation that has stopped confirming anything. */
  const [confirming, setConfirming] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const [query, setQuery] = useState('');
  /* Changing a Work's image must be visible everywhere it appears at once. */
  const [visualEpoch, setVisualEpoch] = useState(0);

  const byId = new Map(manuscripts.map((m) => [m.id, m]));
  const { kind, resume, alsoWritten, shelf, feature, imported } = arrivalFor(works, manuscripts);

  /* ── FINDING WHAT IS ALREADY YOURS ──────────────────────────────────────
     Not a feature; a condition of the room staying usable. A writer with
     forty works should not have to scroll a shelf to reach the one they have
     in mind, and "View all 40 →" is not selection, it is a longer list.

     What it searches is exactly what the Home HAS: titles. There is no body
     text on this surface — `CurrentManuscript` carries id · title · counts ·
     lastWrittenAt and no words — so the field says "by title" rather than
     letting the writer believe their sentences were searched and came back
     empty. An honest small search beats a search that silently under-reads.

     It searches EVERYTHING the member has, not just what is on screen: the
     hero, the shelf beyond its cap, and unclaimed writing alike. */
  const q = query.trim().toLowerCase();
  const titled = (t: string | null) => (t ?? '').toLowerCase();
  const unclaimedWriting = feature ? [feature, ...imported] : imported;
  const foundWorks = q ? works.filter((w) => titled(w.title).includes(q)) : [];
  const foundWriting = q ? unclaimedWriting.filter((m) => titled(m.title).includes(q)) : [];
  /* Offered only once the room is large enough for finding to be a real
     problem. A search box above two works is furniture, not help. */
  const searchable = works.length + manuscripts.length > 5;

  const run = async (fn: () => Promise<void>, whenItFails: string) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch {
      setError(whenItFails);
      setBusy(false);
    }
  };

  /* The delete act. The message on failure is the server's own member-facing
     copy — never a status code, and never a cheerful recovery that hides a
     custody failure the member should know about. */
  const runDelete = async (key: string, target: DeleteTarget) => {
    setDeleting(key);
    setError(null);
    try {
      await onDelete(target);
      setConfirming(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : DELETE_FAILED);
    } finally {
      setDeleting(null);
    }
  };

  const runRemove = async (key: string, workId: string) => {
    setDeleting(key);
    setError(null);
    try {
      await onRemove(workId);
      setConfirming(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : DELETE_FAILED);
    } finally {
      setDeleting(null);
    }
  };

  /* Quiet, and always reachable. Faint by default so it never competes with the
     member's title, brighter under a pointer — but never hidden behind hover,
     which would put the only exit from this room out of reach on a phone. */
  const DeleteButton = ({
    itemKey,
    label,
  }: {
    itemKey: string;
    label: string;
  }) => (
    <button
      type="button"
      onClick={() => {
        setError(null);
        setConfirming(itemKey);
      }}
      disabled={busy || deleting !== null}
      aria-label={label}
      className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] rounded-[2px] opacity-30 hover:opacity-90 focus-visible:opacity-90 transition-opacity disabled:opacity-20"
    >
      <Trash2 size={15} aria-hidden="true" />
    </button>
  );

  /* Confirmation names the work, and names what deletion reaches — the original
     file included. It replaces the card rather than floating over it, so the
     member cannot open the thing they are being asked about. */
  const ConfirmPanel = ({
    itemKey,
    title,
    target,
  }: {
    itemKey: string;
    title: string;
    target: DeleteTarget;
  }) => (
    <div
      className="rounded-[3px] border p-6 min-h-[136px] flex flex-col justify-between"
      style={{ borderColor: PRESS.rule, background: 'rgba(0,0,0,0.22)' }}
    >
      {/* WRITERS-STUDIO-WORK-SHELF-01 · two acts, and they are NOT peers.
          Taking something off the desk is ordinary; destroying the pages is
          not. Equal buttons side by side would make them look like a choice of
          flavour. So removal leads and reads plainly, and deletion sits below a
          rule, quieter, in the consequential colour — deeper in the hierarchy,
          still always reachable.

          A Work with no writing has only ONE act available: there is nothing
          to keep, and offering "keeps your writing" would be a promise about
          something that does not exist. */}
      <div>
        <p className="text-[16.5px] leading-[1.3] mb-2">
          {target.manuscriptId ? REMOVE_WORK_COPY.question(title) : DELETE_WORK_COPY.question(title)}
        </p>
        <p className="text-[13px] opacity-55 leading-relaxed">
          {target.manuscriptId ? REMOVE_WORK_COPY.body : DELETE_WORK_COPY.body}
        </p>
      </div>
      {target.manuscriptId && target.workId ? (
        <div className="mt-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => void runRemove(itemKey, target.workId as string)}
              disabled={deleting !== null}
              className="px-4 min-h-[44px] text-[13.5px] rounded-[2px] border transition-opacity disabled:opacity-40"
              style={{ borderColor: PRESS.rule }}
            >
              {deleting === itemKey ? REMOVE_WORK_COPY.working : REMOVE_WORK_COPY.confirm}
            </button>
            <button
              type="button"
              onClick={() => setConfirming(null)}
              disabled={deleting !== null}
              className="px-4 min-h-[44px] text-[13.5px] opacity-60 hover:opacity-100 transition-opacity"
            >
              {REMOVE_WORK_COPY.cancel}
            </button>
          </div>
          <div className="mt-4 pt-3 border-t" style={{ borderColor: PRESS.ruleSoft }}>
            <button
              type="button"
              onClick={() => void runDelete(itemKey, target)}
              disabled={deleting !== null}
              data-work-delete-everything
              className="text-[12.5px] underline underline-offset-4 opacity-55 hover:opacity-100 transition-opacity disabled:opacity-30"
              style={{ color: '#E0A0A0' }}
            >
              {DELETE_WORK_COPY.action}
            </button>
            <p className="text-[12px] opacity-40 leading-relaxed mt-1">{DELETE_WORK_COPY.hint}</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 mt-4">
          <button
            type="button"
            onClick={() => void runDelete(itemKey, target)}
            disabled={deleting !== null}
            className="px-4 min-h-[44px] text-[13.5px] rounded-[2px] border transition-opacity disabled:opacity-40"
            style={{ borderColor: '#8C4A4A', color: '#E0A0A0' }}
          >
            {deleting === itemKey ? DELETE_WORK_COPY.working : DELETE_WORK_COPY.confirm}
          </button>
          <button
            type="button"
            onClick={() => setConfirming(null)}
            disabled={deleting !== null}
            className="px-4 min-h-[44px] text-[13.5px] opacity-60 hover:opacity-100 transition-opacity"
          >
            {DELETE_WORK_COPY.cancel}
          </button>
        </div>
      )}
    </div>
  );

  const workMeta = (work: LivingWork): string => {
    const id = manuscriptIdOf(work);
    const m = id ? byId.get(id) : undefined;
    /* FOREGROUNDING LAW — truth grants a line permission to appear, not
       importance. Page counts are true and are the system's accounting of the
       Work, not the Work. They belong inside it, not on the shelf.
       Absent values VANISH: no dash, no "Untyped", no placeholder asserting an
       absence the writer never declared. */
    if (!m) return work.form ?? '';
    /**
     * STUDIO-WRITING-PRESENCE-01 · S4 — the clause is GONE, ratified 2026-09-08.
     *
     * ⛔ "written <when>" IS NOT PRESENTLY ESTABLISHABLE. The only timestamp
     * available is the draft row's `updated_at`, and the checkpoint route
     * advances it without changing a character — so the card could say a member
     * wrote on a day they pressed "Keep a version" over verbatim imported text.
     *
     * The earlier guard here (`charCount > 0` AND a timestamp) was aimed at a
     * real production defect — "No writing yet · written August 14" — but its
     * first half was SOURCE extent, so it suppressed the clause for everything
     * begun in the Studio while still admitting the checkpoint case it could
     * not see.
     *
     * ⛔ Not renamed to "worked <when>" either. That is a separate product
     * decision about how to speak of draft activity, and this lane has no
     * ruling on it. A fact that cannot be told is not told.
     */
    return work.form ?? '';
  };

  /* ── The room ─────────────────────────────────────────────────────────
     A photographed desk at the head of the page: warm lamp, open book, cup.
     It is atmosphere, never information — it carries no project data, no
     numbers, no words. It says "you have entered a place for writing"
     before the interface asks the intellect to parse anything. */
  const Hero = () => (
    <div className="relative -mx-6 md:-mx-10 -mt-10 md:-mt-16 mb-10 md:mb-14">
      {/* A window into the room, not a banner. Short enough on phone that the
          member's own title and Open writing are reached almost immediately —
          the eye should move from warmth to their writing within a beat. */}
      <div className="relative h-[132px] md:h-[224px] overflow-hidden">
        {/* Explicit intrinsic dimensions + a fixed-height container: the
            band can never reflow the writer's title beneath it. Decorative,
            so alt="" and aria-hidden — it carries no information. A phone
            takes the 960px file, not the 1920px one. */}
        <img
          src="/writers-studio-hero.jpg"
          srcSet="/writers-studio-hero-960.jpg 960w, /writers-studio-hero.jpg 1920w"
          sizes="(max-width: 767px) 100vw, 100vw"
          width={1920}
          height={1071}
          alt=""
          aria-hidden="true"
          decoding="async"
          fetchPriority="high"
          className="w-full h-full object-cover"
          style={{ objectPosition: '60% 45%' }}
        />
        {/* The field reclaims the image at its edges so type sits on paper,
            not on a photograph. */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, rgba(26,21,19,0.62) 0%, rgba(26,21,19,0.44) 30%, rgba(26,21,19,0.94) 86%, #1A1513 100%)',
          }}
        />
        <div className="absolute inset-x-0 bottom-0 px-6 md:px-10">
          <div className="max-w-4xl mx-auto pb-7">
            <div className="flex items-center gap-3">
              <img
                src="/holoflower-studio-transparent.png"
                alt=""
                aria-hidden="true"
                className="w-6 h-6 opacity-80"
              />
              <p className="text-[10.5px] tracking-[0.34em] uppercase opacity-70">
                Writer&rsquo;s Studio
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const Eyebrow = ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-[10.5px] tracking-[0.3em] uppercase opacity-40">{children}</h2>
  );

  /* A card with weight: paper catching the lamp from above-left, a hairline
     that warms on hover, and the title at reading size. Not a table row. */
  const Card = ({
    href,
    title,
    meta,
    untitled,
    itemKey,
    target,
    visualWorkId,
  }: {
    href: string;
    title: string;
    meta: string;
    untitled?: boolean;
    itemKey: string;
    target: DeleteTarget;
    /** Set only for a declared Work — unclaimed writing has no visual custody. */
    visualWorkId?: string;
  }) => {
    /* The confirmation REPLACES the card. A destructive question floating over a
       still-clickable card is a question the member can walk past by accident. */
    if (confirming === itemKey) {
      return <ConfirmPanel itemKey={itemKey} title={title} target={target} />;
    }
    return (
      <div className="group relative">
        <Link
          href={href}
          className="block rounded-[3px] border p-6 min-h-[136px] overflow-hidden transition-all duration-200 [@media(hover:hover)]:hover:-translate-y-[2px]"
          style={{
            borderColor: PRESS.ruleSoft,
            background:
              'linear-gradient(158deg, rgba(255,243,222,0.062) 0%, rgba(255,243,222,0.022) 46%, rgba(0,0,0,0.16) 100%)',
            boxShadow: '0 1px 0 rgba(255,240,214,0.05) inset, 0 12px 26px -18px rgba(0,0,0,0.9)',
          }}
        >
          {/* Always faintly lit, brighter under a pointer — a touch device is
              never shown less than a mouse. */}
          <span
            aria-hidden="true"
            className="absolute left-0 top-0 h-full w-[2px] opacity-25 group-hover:opacity-100 transition-opacity"
            style={{ background: PRESS.accent }}
          />
          {/* Identity comes from the writing's own facts — how long the title
              runs, what form it took, how much of it there is, when it was last
              written — and, when the writer chose one, their own image. Never
              decoration invented to make cards look different, and never an
              image the Studio picked. */}
          <span className="flex items-start gap-4">
            {visualWorkId ? (
              <CardVisual key={visualEpoch} workId={visualWorkId} title={title} />
            ) : null}
            <span className="block min-w-0">
              <span
                className="block leading-[1.24] mb-2.5 pr-10"
                style={{
                  fontSize: title.length > 34 ? '18.5px' : title.length > 22 ? '20px' : '22px',
                  opacity: untitled ? 0.72 : 1,
                }}
              >
                {title}
              </span>
              <span className="block text-[13px] opacity-50">{meta}</span>
            </span>
          </span>
        </Link>
        {/* A sibling of the Link, never a child of it — a button inside an
            anchor is invalid, and would make Delete a way to open the work. */}
        <div className="absolute top-2 right-2">
          <DeleteButton itemKey={itemKey} label={`Delete ${title}`} />
        </div>
      </div>
    );
  };

  const Cards = ({ children }: { children: React.ReactNode }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">{children}</div>
  );

  /* Offered beside the writing, never in front of it. */
  const makeWork = (m: CurrentManuscript) => (
    <>
      <button
        onClick={() =>
          void run(
            () => onMakeWork(m.id, m.title),
            'Could not make this a work just now. Nothing was changed.',
          )
        }
        disabled={busy}
        className={`${QUIET} w-full sm:w-auto`}
        style={{ borderColor: PRESS.rule }}
      >
        Make this a work
      </button>
      {works.length > 0 ? (
        placing === m.id ? (
          <select
            autoFocus
            defaultValue=""
            onChange={(e) => {
              const workId = e.target.value;
              if (workId)
                void run(
                  () => onAddToWork(m.id, workId),
                  'Could not add this to that work just now. Nothing was changed.',
                );
              setPlacing(null);
            }}
            className="bg-transparent border px-4 py-3.5 text-[14px] min-h-[48px] rounded-[2px] w-full sm:w-auto"
            style={{ borderColor: PRESS.rule, color: PRESS.text, fontFamily: SERIF }}
          >
            <option value="" disabled>
              Choose a work…
            </option>
            {works.map((w) => (
              <option key={w.id} value={w.id} style={{ color: PRESS.ink }}>
                {w.title ?? 'Untitled work'}
              </option>
            ))}
          </select>
        ) : (
          <button
            onClick={() => setPlacing(m.id)}
            disabled={busy}
            className={`${QUIET} w-full sm:w-auto`}
            style={{ borderColor: PRESS.rule }}
          >
            Add to a work
          </button>
        )
      ) : null}
    </>
  );

  /* A bound, not a summary: the room shows recent acts and the rest live with
     the Work. Raising this number cannot make the section interpret more. */
  const HISTORY_ACTS = 14;

  const VISIBLE = 4;
  const shelfCards = showAll ? shelf : shelf.slice(0, VISIBLE);

  return (
    <main
      className="min-h-screen px-6 md:px-10 py-10 md:py-16"
      style={{ background: PRESS.bg, color: PRESS.text, fontFamily: SERIF }}
    >
      {!loading ? <Hero /> : null}

      <div className="max-w-4xl mx-auto">
        {/* The same control the Canvas carries, not a second one: one component,
            one preference, two doors. A writer changes the room from wherever
            they happen to be standing. Available in the empty Studio too —
            someone arriving with nothing written should still get to decide
            what room they are arriving into. */}
        {!loading ? (
          <div className="flex justify-end -mt-4 mb-6">
            <AppearanceMenu />
          </div>
        ) : null}

        {loading ? (
          <p className="text-[15px] opacity-40">Opening your studio…</p>
        ) : kind === 'begin' ? (
          /* WS-HOME-REDESIGN v0.2 — the empty Home reads as POTENTIAL, not
             vacancy, and the room RECEIVES rather than explains.

             No lesson, no permission language, no description of what a Work
             can be. FIELD is not LESSONS: the room should not explain itself
             while you are trying to inhabit it. MAIA is present without
             announcing what she does — presence that announces nothing
             presupposes nothing. */
          <div className="max-w-xl">
            <h1 className="text-[36px] md:text-[44px] leading-[1.1] mb-10">
              Welcome, writer. You are home.
            </h1>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <button
                onClick={() => setBeginning(true)}
                className={`${FILLED} w-full sm:w-auto`}
                style={{ background: PRESS.accent, color: PRESS.ink }}
              >
                Begin a new work
              </button>
              <Link
                href={IMPORT_HREF}
                className={`${QUIET} w-full sm:w-auto`}
                style={{ borderColor: PRESS.rule }}
              >
                Import writing
              </Link>
            </div>
          </div>
        ) : (
          <>
            {searchable ? (
              <div className="mb-10 md:mb-12 max-w-sm">
                <label htmlFor="find-work" className="sr-only">
                  Find your work by title
                </label>
                <input
                  id="find-work"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') setQuery('');
                  }}
                  /* The placeholder names the SCOPE, not the promise. A writer
                     who searches a remembered sentence and gets nothing would
                     otherwise conclude the sentence is gone. */
                  placeholder="Find by title…"
                  className="w-full bg-transparent border-b px-0 py-2.5 text-[15px] min-h-[44px] outline-none placeholder:opacity-35 focus:opacity-100"
                  style={{ borderColor: PRESS.ruleSoft, color: PRESS.text, fontFamily: SERIF }}
                />
              </div>
            ) : null}

            {q ? (
              /* Selection, not a filtered view of the shelf: everything the
                 member has is reachable here — the work in the hero, the works
                 past "View all", and unclaimed writing — with the same cards
                 and the same delete they have everywhere else. */
              <section className="mb-14 md:mb-20">
                <Eyebrow>Found</Eyebrow>
                <div className="mt-5">
                  {foundWorks.length + foundWriting.length === 0 ? (
                    <p className="text-[15px] opacity-50">
                      Nothing here by that name. Only titles are searched.
                    </p>
                  ) : (
                    <Cards>
                      {foundWorks.map((w) => (
                        <Card
                          key={`w-${w.id}`}
                          itemKey={`work:${w.id}`}
                          target={{ workId: w.id, manuscriptId: manuscriptIdOf(w) }}
                          href={canvasForManuscript(CANVAS_HREF, manuscriptIdOf(w))}
                          title={w.title ?? 'Untitled work'}
                          untitled={!w.title}
                          meta={workMeta(w)}
                          visualWorkId={w.id}
                        />
                      ))}
                      {foundWriting.map((m) => (
                        <Card
                          key={`m-${m.id}`}
                          itemKey={`writing:${m.id}`}
                          target={{ workId: null, manuscriptId: m.id }}
                          href={canvasForManuscript(CANVAS_HREF, m.id)}
                          title={m.title ?? 'Untitled'}
                          untitled={!m.title}
                          meta={pagesLabel(m)}
                        />
                      ))}
                    </Cards>
                  )}
                </div>
              </section>
            ) : (
              <>
            {/* ── RETURN ──────────────────────────────────────────────────
                WS-HOME-REDESIGN v0.2. This said "Continue writing", which is
                an instruction: keep going. RETURN says something else — this
                is here when you are ready. The writer's process is plural and
                they cycle among Works by inspiration, so recency must not
                quietly masquerade as priority. The shelf below carries the
                rest, one keystroke away, and this Work holds the foreground
                only because it is where they last were.

                RETURN is also already a stage in the Larger Arc. ─────────── */}
            {kind === 'continue' && resume ? (
              <section className="mb-14 md:mb-20">
                <Eyebrow>Return</Eyebrow>
                {/* The Work's own image and its name, together. This is where
                    recognition happens — a writer knows their book by its face
                    before they read its title. When they have chosen no image
                    the row simply has one column and nothing pretends to be
                    the Work's visual identity. */}
                <div className="flex items-start gap-6 md:gap-8 mt-5">
                  <HeroVisual
                    key={visualEpoch}
                    workId={resume.id}
                    title={resume.title}
                  />
                  <div className="min-w-0">
                    <h1
                      className="leading-[1.08] mb-3 max-w-2xl"
                      style={{ fontSize: 'clamp(2.375rem, 4.6vw, 3.375rem)' }}
                    >
                      {resume.title ?? 'Your untitled work'}
                    </h1>
                    <p className="text-[14.5px] opacity-50 mb-8">{workMeta(resume)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    href={canvasForManuscript(CANVAS_HREF, manuscriptIdOf(resume))}
                    className={`${FILLED} w-full sm:w-auto`}
                    style={{ background: PRESS.accent, color: PRESS.ink }}
                  >
                    Return to this work
                  </Link>
                  {/* The work in the hero is excluded from the shelf below, so
                      without this the most prominent thing in the room — often
                      the very test import that prompted all this — would be the
                      one thing a member could not remove. */}
                  <DeleteButton
                    itemKey={`work:${resume.id}`}
                    label={`Delete ${resume.title ?? 'this work'}`}
                  />
                </div>
                {confirming === `work:${resume.id}` ? (
                  <div className="mt-5 max-w-lg">
                    <ConfirmPanel
                      itemKey={`work:${resume.id}`}
                      title={resume.title ?? 'Your untitled work'}
                      target={{ workId: resume.id, manuscriptId: manuscriptIdOf(resume) }}
                    />
                  </div>
                ) : null}

                {/* Offered beside the Work, never demanded of it. A Work with
                    no image is complete; this is an invitation, not a gap the
                    room is asking the writer to fill. */}
                <div className="mt-6">
                  <WorkVisualChooser
                    workId={resume.id}
                    workTitle={resume.title ?? 'this work'}
                    onChanged={() => setVisualEpoch((n) => n + 1)}
                  />
                </div>

                {/* The other live work, offered in the SAME breath as the hero.
                    The hero leads because it is where the writer last was —
                    not because the Studio has decided it matters most. These
                    stand beside it so returning stays a choice.

                    They are Cards, not a text list, for a reason beyond looks:
                    a Card carries its own delete. A work promoted out of the
                    shelf and rendered as bare text would become the one thing
                    in the room a member could not remove — the same trap the
                    hero's own DeleteButton exists to close. */}
                {alsoWritten.length > 0 ? (
                  <div className="mt-12">
                    <h3 className="text-[10.5px] tracking-[0.3em] uppercase opacity-30 mb-5">
                      Also recently written
                    </h3>
                    <Cards>
                      {alsoWritten.map((w) => (
                        <Card
                          key={w.id}
                          itemKey={`work:${w.id}`}
                          target={{ workId: w.id, manuscriptId: manuscriptIdOf(w) }}
                          href={canvasForManuscript(CANVAS_HREF, manuscriptIdOf(w))}
                          title={w.title ?? 'Untitled work'}
                          untitled={!w.title}
                          meta={workMeta(w)}
                          visualWorkId={w.id}
                        />
                      ))}
                    </Cards>
                  </div>
                ) : null}
              </section>
            ) : feature ? (
              /* Writing exists that no Work has claimed. It is NOT recast as a
                 Work — it is opened, immediately, as itself. */
              <section className="mb-14 md:mb-20">
                <p className="text-[17px] opacity-55 mb-6">Your writing is here.</p>
                <h1
                  className="leading-[1.08] mb-3 mt-5 max-w-2xl"
                  style={{ fontSize: 'clamp(2.375rem, 4.6vw, 3.375rem)' }}
                >
                  {feature.title ?? 'Untitled writing'}
                </h1>
                <p className="text-[14.5px] opacity-50 mb-8">{pagesLabel(feature)}</p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <Link
                    href={canvasForManuscript(CANVAS_HREF, feature.id)}
                    className={`${FILLED} w-full sm:w-auto`}
                    style={{ background: PRESS.accent, color: PRESS.ink }}
                  >
                    Open writing
                  </Link>
                  {makeWork(feature)}
                  <DeleteButton
                    itemKey={`writing:${feature.id}`}
                    label={`Delete ${feature.title ?? 'this writing'}`}
                  />
                </div>
                {confirming === `writing:${feature.id}` ? (
                  <div className="mt-5 max-w-lg">
                    <ConfirmPanel
                      itemKey={`writing:${feature.id}`}
                      title={feature.title ?? 'Untitled writing'}
                      target={{ workId: null, manuscriptId: feature.id }}
                    />
                  </div>
                ) : null}
              </section>
            ) : null}

            {/* ── FROM YOUR WORK ───────────────────────────────────────
                The writer's own sentences, back in the room with them.

                Every line here was written by the member AND marked by the
                member — a keep is re-verified verbatim against their own
                section before it is ever stored, so the Studio cannot have
                authored, altered, or chosen one. That is the whole license
                for this section. Without a gesture underneath each line, a
                surface like this becomes the system deciding what is
                beautiful in someone else's book.

                ⛔ No line is selected for quality, relevance, or mood. The
                order is when the member marked it, which is the same
                non-judgmental ordering the rest of this Home uses. Rotating
                through them belongs with the motion preference, not here.

                ⛔ Empty is CORRECT and stays silent. A member who has marked
                nothing is not shown an invitation to mark something; the
                gesture lives in the Manuscript Room, where the words are. */}
            {markedLines.length > 0 ? (
              <section className="mb-14 md:mb-20">
                {/* The line that carries the room. Set as the writing it is,
                    not as a pull-quote about the writing. */}
                <blockquote className="max-w-2xl mb-10">
                  <p
                    className="text-[22px] md:text-[27px] leading-[1.45] italic opacity-90"
                    /* Clamped, never truncated: a member's own sentence is not
                       the Studio's to cut with an ellipsis. Long passages are
                       bounded visually and remain whole in the Work. */
                    style={{
                      display: '-webkit-box',
                      WebkitBoxOrient: 'vertical',
                      WebkitLineClamp: 4,
                      overflow: 'hidden',
                    }}
                  >
                    {markedLines[0].verbatimText}
                  </p>
                  <footer className="text-[12.5px] opacity-40 mt-4">
                    {[markedLines[0].manuscriptTitle, markedLines[0].sectionHeading]
                      .filter(Boolean)
                      .join(' · ')}
                  </footer>
                </blockquote>

                {markedLines.length > 1 ? (
                  <>
                    <Eyebrow>From your work</Eyebrow>
                    <ul className="mt-5 space-y-6 max-w-2xl">
                      {markedLines.slice(1, 5).map((line) => (
                        <li key={line.id}>
                          <p
                            className="text-[16px] leading-[1.55] opacity-75"
                            style={{
                              display: '-webkit-box',
                              WebkitBoxOrient: 'vertical',
                              WebkitLineClamp: 3,
                              overflow: 'hidden',
                            }}
                          >
                            {line.verbatimText}
                          </p>
                          {/* Provenance travels WITH the line. A member's own
                              sentence read back without its source is
                              indistinguishable from something written for
                              them. */}
                          <p className="text-[12px] opacity-35 mt-1.5">
                            {[line.manuscriptTitle, line.sectionHeading].filter(Boolean).join(' · ')}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : null}
              </section>
            ) : null}

            {/* ── HISTORY ──────────────────────────────────────────────
                What the writer actually did, when they did it.

                Every entry is an immutable record: a declaration, an arrival,
                a checkpoint, a mark. Nothing here is derived from current
                state — ⛔ notably NOT `updated_at`, which would give one
                "returned to" per manuscript that silently RELOCATES to a new
                date every time the member writes. A history entry that moves
                is not a history.

                ⛔ A date gathers acts. It never explains them. There is no
                daily headline, no count, no "a productive day revising Fire",
                and no field in `HistoryDay` one could be added to without
                editing the type — which is where the argument would have to
                happen, in the open. Grouping is presentation. Summarizing is
                interpretation. (Founder ruling 2026-09-07.) */}
            {historyActs.length > 0 ? (
              <section className="mb-14 md:mb-20">
                <Eyebrow>History</Eyebrow>
                <div className="mt-6 space-y-9 max-w-2xl">
                  {byDay(historyActs.slice(0, HISTORY_ACTS)).map((day) => (
                    <div key={day.key}>
                      <h3 className="text-[10.5px] tracking-[0.28em] uppercase opacity-35 mb-4">
                        {day.label}
                      </h3>
                      <ul className="space-y-4">
                        {day.acts.map((act) => {
                          const said = sentenceFor(act);
                          /* An act the Studio cannot state without guessing is
                             omitted rather than approximated. */
                          if (!said) return null;
                          const under = beneath(act);
                          return (
                            <li key={`${act.kind}-${act.id}`}>
                              <p className="text-[15.5px] leading-[1.45] opacity-80">{said}</p>
                              {under ? (
                                <p className="text-[13px] opacity-45 mt-1">{under}</p>
                              ) : null}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {/* ── WORKS the member has declared ───────────────────────── */}
            {shelf.length > 0 ? (
              <section className="mb-14 md:mb-20">
                <div className="flex items-baseline justify-between mb-5">
                  <Eyebrow>Your works</Eyebrow>
                  {shelf.length > VISIBLE ? (
                    <button
                      onClick={() => setShowAll(!showAll)}
                      className="text-[12.5px] opacity-50 hover:opacity-90 transition-opacity"
                    >
                      {showAll ? 'Show fewer' : `View all ${shelf.length} →`}
                    </button>
                  ) : null}
                </div>
                <Cards>
                  {shelfCards.map((w) => (
                    <Card
                      key={w.id}
                      itemKey={`work:${w.id}`}
                      target={{ workId: w.id, manuscriptId: manuscriptIdOf(w) }}
                      href={canvasForManuscript(CANVAS_HREF, manuscriptIdOf(w))}
                      title={w.title ?? 'Untitled work'}
                      untitled={!w.title}
                      meta={workMeta(w)}
                      visualWorkId={w.id}
                    />
                  ))}
                </Cards>

                {/* ⛔ WITNESSED DEFECT, 2026-09-07. The chooser lived ONLY on
                    the RETURN hero, so a member whose Home is in the ORIENT
                    state — writing exists but no Work has continuable activity
                    — had no way to give any Work an image. The capability was
                    built and unreachable: the seventh instance in this room of
                    "the command exists, the door doesn't."

                    The image belongs to the WORK, so its door belongs wherever
                    the Work is, not wherever the room happens to have put a
                    hero. Rendered as a direct child here rather than inside
                    `Card`: Card is declared in this component's body, so its
                    subtree remounts on every render, and a remount would wipe
                    the half-finished "what is this image to you?" choice out
                    from under the writer's hand. */}
                <div className="mt-8 space-y-5">
                  {shelfCards.map((w) => (
                    <div key={`visual:${w.id}`}>
                      <p className="text-[12.5px] opacity-35 mb-2">{w.title ?? 'Untitled work'}</p>
                      <WorkVisualChooser
                        workId={w.id}
                        workTitle={w.title ?? 'this work'}
                        onChanged={() => setVisualEpoch((n) => n + 1)}
                      />
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {/* ── WRITING that is simply the member's, unclassified ───── */}
            {imported.length > 0 ? (
              <section className="mb-14 md:mb-20">
                <div className="mb-5">
                  <Eyebrow>Your writing</Eyebrow>
                </div>
                <Cards>
                  {imported.map((m) => (
                    <Card
                      key={m.id}
                      itemKey={`writing:${m.id}`}
                      target={{ workId: null, manuscriptId: m.id }}
                      href={canvasForManuscript(CANVAS_HREF, m.id)}
                      title={m.title ?? 'Untitled'}
                      untitled={!m.title}
                      meta={pagesLabel(m)}
                    />
                  ))}
                </Cards>
              </section>
            ) : null}
              </>
            )}
          </>
        )}

        {error ? (
          <p className="text-[13px] mb-6" style={{ color: '#E0A0A0' }}>
            {error}
          </p>
        ) : null}

        {kind !== 'begin' && !loading ? (
          <section
            className="flex flex-col sm:flex-row gap-3 pt-10 border-t"
            style={{ borderColor: PRESS.ruleSoft }}
          >
            {beginning ? (
              <div className="flex-1 max-w-lg">
                <label htmlFor="work-name" className="block text-[13px] opacity-55 mb-2">
                  Give it a name, or leave it blank for now.
                </label>
                <div className="flex gap-3">
                  <input
                    id="work-name"
                    autoFocus
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !busy)
                        void run(
                          () => onBegin(draftName.trim()),
                          'Could not begin your work just now. Nothing was changed.',
                        );
                      if (e.key === 'Escape') setBeginning(false);
                    }}
                    className="flex-1 bg-transparent border px-3.5 py-2.5 text-[15px] min-h-[48px] rounded-[2px] outline-none"
                    style={{ borderColor: PRESS.rule, color: PRESS.text, fontFamily: SERIF }}
                  />
                  <button
                    onClick={() =>
                      void run(
                        () => onBegin(draftName.trim()),
                        'Could not begin your work just now. Nothing was changed.',
                      )
                    }
                    disabled={busy}
                    className="px-6 min-h-[48px] text-[14px] rounded-[2px] disabled:opacity-40"
                    style={{ background: PRESS.accent, color: PRESS.ink }}
                  >
                    {busy ? <Loader2 size={16} className="animate-spin" /> : 'Begin'}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setBeginning(true)}
                className={`${QUIET} w-full sm:w-auto`}
                style={{ borderColor: PRESS.rule }}
              >
                <FilePlus2 size={16} style={{ color: PRESS.accent }} aria-hidden="true" />
                Begin a new work
              </button>
            )}

            <Link
              href={IMPORT_HREF}
              className={`${QUIET} w-full sm:w-auto`}
              style={{ borderColor: PRESS.rule }}
            >
              <FolderInput size={16} style={{ color: PRESS.accent }} aria-hidden="true" />
              Import writing
            </Link>
          </section>
        ) : null}
      </div>
    </main>
  );
}
