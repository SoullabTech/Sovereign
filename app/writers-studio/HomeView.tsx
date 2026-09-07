'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FilePlus2, FolderInput, Loader2, Trash2 } from 'lucide-react';
import { PRESS, SERIF } from './pressTheme';
import { CANVAS_HREF, IMPORT_HREF } from './studioMap';
import { canvasForManuscript } from './canvasIdentity';
import { DELETE_WORK_COPY, type DeleteTarget } from '@/lib/writersStudio/deleteWork';
import { arrivalFor, manuscriptIdOf } from './homeState';
import type { CurrentManuscript } from './useCurrentManuscript';
import type { LivingWork } from './useLivingWorks';

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
const pagesLabel = (chars: number) =>
  chars === 0 ? 'No writing yet' : `${pageEstimate(chars)} page${pageEstimate(chars) === 1 ? '' : 's'}`;

function whenWritten(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return null;
  const mins = Math.floor((Date.now() - then) / 60000);
  if (mins < 2) return 'written just now';
  if (mins < 60) return `written ${mins} minutes ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `written ${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'written yesterday';
  if (days < 7) return `written ${days} days ago`;
  return `written ${new Date(iso).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}`;
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
  onBegin: (title: string) => Promise<void>;
  onMakeWork: (manuscriptId: string, title: string | null) => Promise<void>;
  onAddToWork: (manuscriptId: string, workId: string) => Promise<void>;
  /** Ends custody of a work or a piece of writing. Rejects with member copy. */
  onDelete: (target: DeleteTarget) => Promise<void>;
}

export default function HomeView({
  loading,
  works,
  manuscripts,
  onBegin,
  onMakeWork,
  onAddToWork,
  onDelete,
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

  const byId = new Map(manuscripts.map((m) => [m.id, m]));
  const { kind, resume, shelf, feature, imported } = arrivalFor(works, manuscripts);

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
      <div>
        <p className="text-[16.5px] leading-[1.3] mb-2">{DELETE_WORK_COPY.question(title)}</p>
        <p className="text-[13px] opacity-55 leading-relaxed">{DELETE_WORK_COPY.body}</p>
      </div>
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
    </div>
  );

  const workMeta = (work: LivingWork): string => {
    const id = manuscriptIdOf(work);
    const m = id ? byId.get(id) : undefined;
    if (!m) return 'No writing yet';
    return [work.form ?? null, pagesLabel(m.charCount), whenWritten(m.lastWrittenAt)]
      .filter(Boolean)
      .join(' · ');
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
  }: {
    href: string;
    title: string;
    meta: string;
    untitled?: boolean;
    itemKey: string;
    target: DeleteTarget;
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
              written. Never decoration invented to make cards look different. */}
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

  const VISIBLE = 4;
  const shelfCards = showAll ? shelf : shelf.slice(0, VISIBLE);

  return (
    <main
      className="min-h-screen px-6 md:px-10 py-10 md:py-16"
      style={{ background: PRESS.bg, color: PRESS.text, fontFamily: SERIF }}
    >
      {!loading ? <Hero /> : null}

      <div className="max-w-4xl mx-auto">
        {loading ? (
          <p className="text-[15px] opacity-40">Opening your studio…</p>
        ) : kind === 'begin' ? (
          <div className="max-w-xl">
            <h1 className="text-[36px] md:text-[44px] leading-[1.1] mb-4">Begin your work.</h1>
            <p className="text-[16.5px] opacity-55 mb-10 leading-relaxed">
              Start something new, or bring in writing you already have.
            </p>
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
            {/* ── THE ARRIVAL ─────────────────────────────────────────── */}
            {kind === 'continue' && resume ? (
              <section className="mb-14 md:mb-20">
                <p className="text-[17px] opacity-55 mb-6">Your work is here.</p>
                <h1
                  className="leading-[1.08] mb-3 max-w-2xl"
                  style={{ fontSize: 'clamp(2.375rem, 4.6vw, 3.375rem)' }}
                >
                  {resume.title ?? 'Your untitled work'}
                </h1>
                <p className="text-[14.5px] opacity-50 mb-8">{workMeta(resume)}</p>
                <div className="flex items-center gap-3">
                  <Link
                    href={canvasForManuscript(CANVAS_HREF, manuscriptIdOf(resume))}
                    className={`${FILLED} w-full sm:w-auto`}
                    style={{ background: PRESS.accent, color: PRESS.ink }}
                  >
                    Continue writing
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
              </section>
            ) : feature ? (
              /* Writing exists that no Work has claimed. It is NOT recast as a
                 Work — it is opened, immediately, as itself. */
              <section className="mb-14 md:mb-20">
                <p className="text-[17px] opacity-55 mb-6">Your writing is here.</p>
                <h1
                  className="leading-[1.08] mb-3 max-w-2xl"
                  style={{ fontSize: 'clamp(2.375rem, 4.6vw, 3.375rem)' }}
                >
                  {feature.title ?? 'Untitled writing'}
                </h1>
                <p className="text-[14.5px] opacity-50 mb-8">{pagesLabel(feature.charCount)}</p>
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
                    />
                  ))}
                </Cards>
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
                      meta={pagesLabel(m.charCount)}
                    />
                  ))}
                </Cards>
              </section>
            ) : null}
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
