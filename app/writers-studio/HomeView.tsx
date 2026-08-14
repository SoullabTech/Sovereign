'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FilePlus2, FolderInput, Loader2 } from 'lucide-react';
import { PRESS, SERIF } from './pressTheme';
import { CANVAS_HREF, IMPORT_HREF } from './studioMap';
import type { CurrentManuscript } from './useCurrentManuscript';
import type { LivingWork } from './useLivingWorks';

/**
 * Writer's Studio — Home.
 *
 * ── REBUILT 2026-08-14, under founder ruling after the walk FAILED ─────────
 *
 * The prior home was three visually identical tiles with three unrelated
 * behaviours — two of which only called scrollIntoView against sections
 * already on the page. Founder verdict: "false action language", and beneath
 * it a surface organised around what the system can ingest rather than what
 * the writer is making. The member's actual works appeared under "Bring
 * Something In" while "Your Work" held only a New project tile: the hierarchy
 * was inverted.
 *
 * The governing rule this file implements:
 *
 *   A button named for an outcome must perform that outcome.
 *
 * Every visible action here navigates or mutates. Nothing scrolls in place
 * while wearing a door's language.
 *
 * And the organising principle:
 *
 *   Writer's Studio is the place where a writer re-enters a living work.
 *   The Work is primary; everything else is an instrument in relation to it.
 *
 * So the room opens on the writer's most recently touched work with one
 * dominant action, their shelf beneath it, and beginning/importing as plainly
 * secondary. First-time arrival is a different state with exactly two paths.
 *
 * ⚠️ HONEST LIMIT — there is no last-location substrate. Nothing in
 * living_works or member_manuscripts records which room the writer left from
 * or where the cursor was. (songwriter has last_opened_at; the Studio does
 * not.) So the resume action says "Continue writing" and opens the Canvas —
 * which is true — and the supporting line states only observable facts: the
 * form the member declared, the page count, and when it was last edited. It
 * does NOT say "you were last in Chapter 7". Naming a room or a location we
 * cannot source would be the same invented authority the walk just failed.
 * When a last-location substrate exists, this action becomes "Return to
 * manuscript" / "Continue shaping" as the founder's default requires.
 */

const pageEstimate = (chars: number) => Math.max(1, Math.round(chars / 1800));
const pagesLabel = (chars: number) => {
  const n = pageEstimate(chars);
  return `${n} page${n === 1 ? '' : 's'}`;
};

/** Observable fact only — when the row was last written to. Never a judgement. */
function lastEdited(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return null;
  const mins = Math.floor((Date.now() - then) / 60000);
  if (mins < 2) return 'edited just now';
  if (mins < 60) return `edited ${mins} minutes ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `edited ${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'edited yesterday';
  if (days < 7) return `edited ${days} days ago`;
  return `edited ${new Date(iso).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}`;
}

/** The manuscript a work has declared, if it has declared one. */
function manuscriptIdOf(work: LivingWork): string | null {
  return work.expressions.find((e) => e.expressionType === 'manuscript')?.expressionId ?? null;
}

/** Canvas, opened on a specific manuscript when we have one. */
function canvasHref(manuscriptId: string | null): string {
  return manuscriptId ? `${CANVAS_HREF}?id=${encodeURIComponent(manuscriptId)}` : CANVAS_HREF;
}

export interface HomeViewProps {
  loading: boolean;
  works: LivingWork[];
  manuscripts: CurrentManuscript[];
  /** Creates the work and lands the writer inside the Canvas. */
  onBegin: (title: string) => Promise<void>;
}

/**
 * The Home experience, as a pure function of the writer's own facts.
 * No fetching, no auth, no routing decisions — so the same component that
 * members see can be rendered against fixtures for design evidence.
 */
export default function HomeView({ loading, works, manuscripts, onBegin }: HomeViewProps) {
  const [beginning, setBeginning] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const byId = new Map(manuscripts.map((m) => [m.id, m]));
  const placed = new Set(works.flatMap((w) => (manuscriptIdOf(w) ? [manuscriptIdOf(w)!] : [])));
  const unplaced = manuscripts.filter((m) => !placed.has(m.id));

  /* Recency from the work's own updated_at — an observable fact, not a guess
     about what the writer was doing. Most-recent-first is the shelf order. */
  const shelf = [...works].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
  const resume = shelf[0] ?? null;

  const begin = async () => {
    setBusy(true);
    setError(null);
    try {
      await onBegin(draftName.trim());
    } catch {
      setError('Could not begin your work just now. Nothing was changed.');
      setBusy(false);
    }
  };

  const metaLine = (work: LivingWork): string => {
    const ms = manuscriptIdOf(work);
    const m = ms ? byId.get(ms) : undefined;
    const bits = [
      work.form ?? null,
      m ? pagesLabel(m.charCount) : null,
      lastEdited(work.updatedAt),
    ].filter(Boolean) as string[];
    return bits.join(' · ');
  };

  return (
    <main
      className="min-h-screen px-6 md:px-10 py-10 md:py-14"
      style={{ background: PRESS.bg, color: PRESS.text, fontFamily: SERIF }}
    >
      <div className="max-w-3xl mx-auto">
        <p className="text-[11px] tracking-[0.3em] uppercase opacity-40 mb-10">
          Writer&rsquo;s Studio
        </p>

        {loading ? (
          <p className="text-[15px] opacity-40">Opening your studio…</p>
        ) : resume ? (
          /* ── RETURNING: the work is the arrival ─────────────────────────── */
          <>
            <h1 className="text-[15px] tracking-[0.2em] uppercase opacity-45 mb-6">Welcome back</h1>

            <section className="mb-14">
              <h2 className="text-[30px] md:text-[34px] leading-tight mb-2">
                {resume.title ?? 'Your untitled work'}
              </h2>
              <p className="text-[14px] opacity-50 mb-7">{metaLine(resume)}</p>
              <Link
                href={canvasHref(manuscriptIdOf(resume))}
                className="inline-block px-7 py-3 text-[15px] transition-opacity hover:opacity-90"
                style={{ background: PRESS.accent, color: PRESS.ink }}
              >
                Continue writing
              </Link>
            </section>

            {shelf.length > 1 || unplaced.length > 0 ? (
              <section className="mb-14">
                <h2 className="text-[11px] tracking-[0.25em] uppercase opacity-35 mb-5">
                  Your works
                </h2>
                <ul className="border-t" style={{ borderColor: PRESS.ruleSoft }}>
                  {shelf.slice(1).map((w) => (
                    <li key={w.id} className="border-b" style={{ borderColor: PRESS.ruleSoft }}>
                      <Link
                        href={canvasHref(manuscriptIdOf(w))}
                        className="block py-4 group transition-opacity hover:opacity-100 opacity-85"
                      >
                        <span className="block text-[19px] leading-snug">
                          {w.title ?? 'Untitled work'}
                        </span>
                        <span className="block text-[13px] opacity-45 mt-0.5">{metaLine(w)}</span>
                      </Link>
                    </li>
                  ))}

                  {/* Writing that exists but no work has claimed. Shown inside Your
                      works — never filed under an import heading.
                      Founder correction 2026-08-14: "not yet part of a work" was
                      DATABASE truth, not writer truth. This surface must not teach
                      members the Studio's ontology — that was the failure it was
                      rebuilt to end. "Ready to become a work" says the same fact
                      as an invitation the writer can act on. */}
                  {unplaced.map((m: CurrentManuscript) => (
                    <li key={m.id} className="border-b" style={{ borderColor: PRESS.ruleSoft }}>
                      <Link
                        href={canvasHref(m.id)}
                        className="block py-4 transition-opacity hover:opacity-100 opacity-85"
                      >
                        <span className="block text-[19px] leading-snug">
                          {m.title ?? 'Untitled writing'}
                        </span>
                        <span className="block text-[13px] opacity-45 mt-0.5">
                          {pagesLabel(m.charCount)} · ready to become a work
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </>
        ) : (
          /* ── FIRST TIME: two paths, and only two ────────────────────────── */
          <>
            <h1 className="text-[28px] md:text-[32px] leading-tight mb-3">Begin your work</h1>
            <p className="text-[15px] opacity-55 mb-12 max-w-lg">
              Start something new, or bring in writing you already have.
            </p>
          </>
        )}

        {/* ── Secondary acts. Present in both states, plainly subordinate. ── */}
        <section className="flex flex-col sm:flex-row gap-4">
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
                    if (e.key === 'Enter' && !busy) void begin();
                    if (e.key === 'Escape') setBeginning(false);
                  }}
                  className="flex-1 bg-transparent border px-3 py-2.5 text-[15px] outline-none"
                  style={{ borderColor: PRESS.rule, color: PRESS.text, fontFamily: SERIF }}
                />
                <button
                  onClick={() => void begin()}
                  disabled={busy}
                  className="px-5 py-2.5 text-[14px] disabled:opacity-40"
                  style={{ background: PRESS.accent, color: PRESS.ink }}
                >
                  {busy ? <Loader2 size={16} className="animate-spin" /> : 'Begin'}
                </button>
              </div>
              {error && (
                <p className="text-[13px] mt-2.5" style={{ color: '#E0A0A0' }}>
                  {error}
                </p>
              )}
            </div>
          ) : (
            <button
              onClick={() => setBeginning(true)}
              className="flex items-center gap-2.5 border px-5 py-3.5 text-[14px] text-left transition-opacity opacity-80 hover:opacity-100"
              style={{ borderColor: PRESS.rule }}
            >
              <FilePlus2 size={17} style={{ color: PRESS.accent }} aria-hidden="true" />
              Begin a new work
            </button>
          )}

          <Link
            href={IMPORT_HREF}
            className="flex items-center gap-2.5 border px-5 py-3.5 text-[14px] transition-opacity opacity-80 hover:opacity-100"
            style={{ borderColor: PRESS.rule }}
          >
            <FolderInput size={17} style={{ color: PRESS.accent }} aria-hidden="true" />
            Import a manuscript
          </Link>
        </section>
      </div>
    </main>
  );
}
