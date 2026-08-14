'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FilePlus2, FolderInput, Loader2 } from 'lucide-react';
import { PRESS, SERIF } from './pressTheme';
import { CANVAS_HREF, IMPORT_HREF } from './studioMap';
import { canvasForManuscript } from './canvasIdentity';
import { arrivalFor, manuscriptIdOf } from './homeState';
import type { CurrentManuscript } from './useCurrentManuscript';
import type { LivingWork } from './useLivingWorks';

/**
 * Writer's Studio — Home, as a pure function of the writer's own facts.
 *
 * Rebuilt 2026-08-14 after the founder walk failed here, then corrected twice
 * on founder review. Governing rules:
 *
 *   A button named for an outcome must perform that outcome.
 *   Writer's Studio is where a writer re-enters a living work.
 *   When continuation is not genuinely known, do not manufacture it.
 *
 * ── Three arrival states, not two ─────────────────────────────────────────
 * continue · orient · begin — see homeState.ts. The middle state is not an
 * edge case; it is where the Studio either tells the truth or invents one.
 *
 * ── Honest limits kept visible ────────────────────────────────────────────
 * There is no last-LOCATION substrate: nothing records which room the writer
 * left or where the cursor was. So the action says "Continue writing" and
 * opens the Canvas — true — and never "you were last in Chapter 7".
 * Continuation is decided by `manuscript.lastWrittenAt` (working-draft
 * activity), never by `living_work.updatedAt`, which moves when a work is
 * merely renamed.
 *
 * ── Mobile is composed, not narrowed ──────────────────────────────────────
 * Same hierarchy, different rhythm: full-width primary, stacked placement
 * actions, >=44px touch targets, section gaps ~32px against the desktop's
 * ~56px. Whitespace is reduced; typography is not.
 */

const pageEstimate = (chars: number) => Math.max(1, Math.round(chars / 1800));
const pagesLabel = (chars: number) => {
  const n = pageEstimate(chars);
  return `${n} page${n === 1 ? '' : 's'}`;
};

/** Observable fact only. Never a judgement, never an inference. */
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

const FILLED = 'inline-flex items-center justify-center px-7 py-3 text-[15px] min-h-[44px] transition-opacity hover:opacity-90';
const OUTLINE = 'inline-flex items-center gap-2.5 border px-5 py-3 text-[14px] min-h-[44px] opacity-80 transition-opacity hover:opacity-100 disabled:opacity-40';

export interface HomeViewProps {
  loading: boolean;
  works: LivingWork[];
  manuscripts: CurrentManuscript[];
  onBegin: (title: string) => Promise<void>;
  onMakeWork: (manuscriptId: string, title: string | null) => Promise<void>;
  onAddToWork: (manuscriptId: string, workId: string) => Promise<void>;
}

export default function HomeView({
  loading,
  works,
  manuscripts,
  onBegin,
  onMakeWork,
  onAddToWork,
}: HomeViewProps) {
  const [beginning, setBeginning] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placing, setPlacing] = useState<string | null>(null);

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

  /** Only member-authored or observable facts. "No writing yet" is a fact. */
  const metaLine = (work: LivingWork): string => {
    const id = manuscriptIdOf(work);
    const m = id ? byId.get(id) : undefined;
    if (!m) return 'No writing yet';
    return [work.form ?? null, pagesLabel(m.charCount), whenWritten(m.lastWrittenAt)]
      .filter(Boolean)
      .join(' · ');
  };

  const eyebrow = (text: string) => (
    <h2 className="text-[11px] tracking-[0.25em] uppercase opacity-35 mb-4">{text}</h2>
  );

  const workRow = (w: LivingWork) => (
    <li key={w.id} className="border-b" style={{ borderColor: PRESS.ruleSoft }}>
      <Link
        href={canvasForManuscript(CANVAS_HREF, manuscriptIdOf(w))}
        className="block py-4 min-h-[44px] opacity-85 transition-opacity hover:opacity-100"
      >
        <span className="block text-[19px] leading-snug">{w.title ?? 'Untitled work'}</span>
        <span className="block text-[13px] opacity-45 mt-0.5">{metaLine(w)}</span>
      </Link>
    </li>
  );

  /** The two placement gestures. Stack on phone; >=44px either way. */
  const placement = (m: CurrentManuscript, primary: boolean) => (
    <div className="flex flex-col sm:flex-row gap-3 mt-4">
      <button
        onClick={() =>
          void run(
            () => onMakeWork(m.id, m.title),
            'Could not make this a work just now. Nothing was changed.',
          )
        }
        disabled={busy}
        className={primary ? `${FILLED} w-full sm:w-auto` : `${OUTLINE} w-full sm:w-auto`}
        style={primary ? { background: PRESS.accent, color: PRESS.ink } : { borderColor: PRESS.rule }}
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
              if (workId) {
                void run(
                  () => onAddToWork(m.id, workId),
                  'Could not add this to that work just now. Nothing was changed.',
                );
              }
              setPlacing(null);
            }}
            className="bg-transparent border px-4 py-3 text-[14px] min-h-[44px] w-full sm:w-auto"
            style={{ borderColor: PRESS.rule, color: PRESS.text, fontFamily: SERIF }}
          >
            <option value="" disabled>
              Choose a work…
            </option>
            {[...works].map((w) => (
              <option key={w.id} value={w.id} style={{ color: PRESS.ink }}>
                {w.title ?? 'Untitled work'}
              </option>
            ))}
          </select>
        ) : (
          <button
            onClick={() => setPlacing(m.id)}
            disabled={busy}
            className={`${OUTLINE} w-full sm:w-auto`}
            style={{ borderColor: PRESS.rule }}
          >
            Add to a work
          </button>
        )
      ) : null}
    </div>
  );

  const importedRow = (m: CurrentManuscript) => (
    <li key={m.id} className="border-b py-4" style={{ borderColor: PRESS.ruleSoft }}>
      {/* Equal semantic weight deserves comparable physical presence — but a
          work carrying title + state legitimately needs more room than a
          single fact. This row is loosened toward the page's reading cadence
          rather than normalised to the work rows' height. */}
      <Link
        href={canvasForManuscript(CANVAS_HREF, m.id)}
        className="block min-h-[62px] py-1 opacity-85 transition-opacity hover:opacity-100"
      >
        <span className="block text-[19px] leading-snug">{m.title ?? 'Untitled writing'}</span>
        <span className="block text-[13px] opacity-45 mt-1.5">{pagesLabel(m.charCount)}</span>
      </Link>
      {placement(m, false)}
    </li>
  );

  return (
    <main
      className="min-h-screen px-6 md:px-10 py-10 md:py-14"
      style={{ background: PRESS.bg, color: PRESS.text, fontFamily: SERIF }}
    >
      <div className="max-w-3xl mx-auto">
        <p className="text-[11px] tracking-[0.3em] uppercase opacity-40 mb-8 md:mb-10">
          Writer&rsquo;s Studio
        </p>

        {loading ? (
          <p className="text-[15px] opacity-40">Opening your studio…</p>
        ) : kind === 'begin' ? (
          /* ── BEGIN: nothing exists. Sparse on purpose; one clear first act.
                The block sits into the upper third rather than pinned up. ── */
          <div className="pt-10 md:pt-16">
            <h1 className="text-[28px] md:text-[32px] leading-tight mb-3">Begin your work</h1>
            <p className="text-[15px] opacity-55 mb-10 max-w-md">
              Start something new, or bring in writing you already have.
            </p>
            {/* No "or" between them: the lede already says it, and filled vs
                outlined carries the hierarchy. A conjunction here would be
                visual furniture that adds no meaning. */}
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
                className={`${OUTLINE} w-full sm:w-auto justify-center sm:justify-start`}
                style={{ borderColor: PRESS.rule }}
              >
                Import a manuscript
              </Link>
            </div>
          </div>
        ) : kind === 'continue' && resume ? (
          /* ── CONTINUE: the work IS the arrival ───────────────────────── */
          <>
            <h1 className="text-[15px] tracking-[0.2em] uppercase opacity-45 mb-5">Welcome back</h1>
            <section className="mb-9 md:mb-14">
              <h2 className="text-[30px] md:text-[34px] leading-tight mb-2">
                {resume.title ?? 'Your untitled work'}
              </h2>
              <p className="text-[14px] opacity-50 mb-6">{metaLine(resume)}</p>
              <Link
                href={canvasForManuscript(CANVAS_HREF, manuscriptIdOf(resume))}
                className={`${FILLED} w-full sm:w-auto`}
                style={{ background: PRESS.accent, color: PRESS.ink }}
              >
                Continue writing
              </Link>
            </section>

            {shelf.length > 0 ? (
              <section className="mb-9 md:mb-14">
                {eyebrow('Your works')}
                <ul className="border-t" style={{ borderColor: PRESS.ruleSoft }}>
                  {shelf.map(workRow)}
                </ul>
              </section>
            ) : null}

            {feature || imported.length > 0 ? (
              <section className="mb-9 md:mb-14">
                {eyebrow('Imported writing')}
                <p className="text-[13px] opacity-40 mb-4 max-w-md">
                  Writing that hasn&rsquo;t found its home yet.
                </p>
                <ul className="border-t" style={{ borderColor: PRESS.ruleSoft }}>
                  {[...(feature ? [feature] : []), ...imported].map(importedRow)}
                </ul>
              </section>
            ) : null}
          </>
        ) : (
          /* ── ORIENT: nothing is continuable. Real writing outranks an
                empty work, so the writing becomes the arrival — and no
                continuation is invented. ─────────────────────────────── */
          <>
            {feature ? (
              <>
                <h1 className="text-[15px] tracking-[0.2em] uppercase opacity-45 mb-5">
                  Your writing is here
                </h1>
                <section className="mb-9 md:mb-14">
                  <h2 className="text-[30px] md:text-[34px] leading-tight mb-2">
                    {feature.title ?? 'Untitled writing'}
                  </h2>
                  <p className="text-[14px] opacity-50">{pagesLabel(feature.charCount)}</p>
                  {placement(feature, true)}
                </section>
              </>
            ) : (
              <h1 className="text-[15px] tracking-[0.2em] uppercase opacity-45 mb-6">Your works</h1>
            )}

            {shelf.length > 0 ? (
              <section className="mb-9 md:mb-14">
                {feature ? eyebrow('Your works') : null}
                <ul className="border-t" style={{ borderColor: PRESS.ruleSoft }}>
                  {shelf.map(workRow)}
                </ul>
              </section>
            ) : null}

            {imported.length > 0 ? (
              <section className="mb-9 md:mb-14">
                {eyebrow('Imported writing')}
                <ul className="border-t" style={{ borderColor: PRESS.ruleSoft }}>
                  {imported.map(importedRow)}
                </ul>
              </section>
            ) : null}
          </>
        )}

        {error ? (
          <p className="text-[13px] mb-6" style={{ color: '#E0A0A0' }}>
            {error}
          </p>
        ) : null}

        {/* ── Secondary acts, in every state except 'begin' (which owns
              them as its primary pair). Plainly subordinate. ─────────── */}
        {kind !== 'begin' && !loading ? (
          <section className="flex flex-col sm:flex-row gap-3">
            {beginning ? (
              <div className="flex-1">
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
                    className="flex-1 bg-transparent border px-3 py-2.5 text-[15px] min-h-[44px] outline-none"
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
                    className="px-5 min-h-[44px] text-[14px] disabled:opacity-40"
                    style={{ background: PRESS.accent, color: PRESS.ink }}
                  >
                    {busy ? <Loader2 size={16} className="animate-spin" /> : 'Begin'}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setBeginning(true)}
                className={`${OUTLINE} w-full sm:w-auto`}
                style={{ borderColor: PRESS.rule }}
              >
                <FilePlus2 size={17} style={{ color: PRESS.accent }} aria-hidden="true" />
                Begin a new work
              </button>
            )}

            <Link
              href={IMPORT_HREF}
              className={`${OUTLINE} w-full sm:w-auto`}
              style={{ borderColor: PRESS.rule }}
            >
              <FolderInput size={17} style={{ color: PRESS.accent }} aria-hidden="true" />
              Import a manuscript
            </Link>
          </section>
        ) : null}
      </div>
    </main>
  );
}
