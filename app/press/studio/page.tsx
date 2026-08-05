'use client';

import { useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/http/apiBase';
import { PRESS, SERIF } from './pressTheme';
import StudioShell from './StudioShell';
import { IMPORT_HREF, SOURCE_HREF, WRITE_HREF } from './studioMap';
import { useCurrentManuscript } from './useCurrentManuscript';
import { UNTITLED_EXPRESSION } from './shellIdentity';
import { arrivalWork, useLivingWorks } from './useLivingWorks';
import YourWork from './YourWork';

/**
 * Author Studio — Home. The Layer 2 environment.
 *
 * RULED 2026-07-30 (Kelly): the House enters HERE, never a working surface and
 * never the import form. Before this page existed the House opened straight
 * onto the Manuscript Room's upload textarea, and the founder's first three
 * questions on reaching production were "So, I upload the manuscript?",
 * "Where is the rest of the Studio?", and "How do I access it?".
 *
 * This page answers, in order and without being asked:
 *   What is this place?  ·  What book am I working on?
 *   What can I do now?   ·  Where do I go next?
 *
 * The destination is always the work. MAIA is not mentioned: she is one
 * resident of the Studio, not the Studio itself, and she has no residence in
 * the authorized first slice at all. This is not an AI writing tool and the
 * copy must never let it read as one.
 *
 * What it will NOT do: claim capability that is absent. Gatherings, Shape and
 * Release appear in the rail as not yet available, and nowhere else.
 *
 * ── SLICE 5 (2026-08-01): arrival re-founded around the Living Work ─────────
 *
 * The 07-30 ruling answered "what is this place?" with the place's own name.
 * That answer was right for a Studio whose only object was a manuscript. Once
 * a member can declare a work, the manuscript stops being the thing they
 * return to and becomes one of the forms their work is taking.
 *
 * So the headline is now the work, and "Author Studio" becomes the eyebrow
 * above it — the place is still named, it just stops being the subject. The
 * manuscript sections below are UNCHANGED, in copy and in order: same "Current
 * Book" heading, same Continue Writing, same Import. They are simply beneath
 * the work now instead of standing in for it.
 *
 * What this deliberately does NOT do, because none of it exists yet:
 *   · assert that the manuscript belongs to the work. Nothing writes
 *     living_work_expressions; a containment the data does not hold must not
 *     be drawn. The hierarchy here is arrangement, not a claimed link.
 *   · choose between several works (see arrivalWork's note)
 *   · attachment · expression management · switching · summaries · dashboards
 *
 * With no work declared, arrival is exactly what it was.
 */

const pageEstimate = (chars: number) => Math.max(1, Math.round(chars / 1800));

/**
 * Name the manuscript a link is about, rather than trusting the destination to
 * pick the right one.
 *
 * `/press/manuscript?tab=draft` opens "the most recent manuscript". Returning
 * that way is returning by POSITION: it lands on whatever sorts first, which is
 * the manuscript the member was reading only for as long as they have exactly
 * one. The card these links sit on is already about a specific manuscript and
 * already holds its id — the ambiguity is gratuitous, and it stops being
 * harmless the first time a member has two expressions.
 *
 * `Start writing` already navigates this way. This is the same rule applied to
 * the return journey.
 */
const byIdentity = (href: string, manuscriptId: string) =>
  `${href}&m=${encodeURIComponent(manuscriptId)}`;

export default function AuthorStudioHome() {
  const { phase, manuscript, count } = useCurrentManuscript();
  const { phase: worksPhase, works, reload: reloadWorks } = useLivingWorks();

  const hasManuscript = phase === 'ready' && manuscript !== null;
  const work = arrivalWork(worksPhase, works);

  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  /**
   * Start writing — the explicit gesture that creates the place to write.
   *
   * Nothing is created before this click. Declaring a work creates nothing;
   * arriving at the Studio creates nothing. The blank manuscript comes into
   * existence because the member asked for it, and it arrives unnamed: the
   * route stores `title = NULL` rather than borrowing the work's name or
   * inventing "Untitled". Naming the expression is a second declaration the
   * member has not made yet.
   *
   * Nothing is attached either — `living_work_expressions` is untouched. The
   * member began writing; they did not say this belongs to that work.
   */
  const startWriting = async () => {
    setStarting(true);
    setStartError(null);
    try {
      const res = await apiFetch('/api/sovereign/manuscripts/blank', { method: 'POST' });
      if (res.status === 401) {
        setStartError('Your Studio opens only to you. Please sign in again.');
        return;
      }
      if (!res.ok) {
        setStartError('Could not make a page just now. Nothing was lost — please try again.');
        return;
      }
      const data = await res.json().catch(() => ({}));
      /* Straight into the writing surface, and into THIS page by identity.
         Navigating to the bare draft URL would open "the most recent
         manuscript", which happens to be the same row today and stops being so
         the moment a member has several projects. The route already returns the
         id; using it costs one query parameter and closes the seam instead of
         deepening it. Falls back to the positional URL only if the response
         somehow carries no id, so a missing field degrades rather than strands. */
      window.location.href = data?.id
        ? `${WRITE_HREF}&m=${encodeURIComponent(data.id)}`
        : WRITE_HREF;
    } catch {
      setStartError('Could not reach the Studio just now. Please try again in a moment.');
    } finally {
      setStarting(false);
    }
  };

  // ---- Signed out --------------------------------------------------------
  // Not "your Studio is empty" — they have not been seen yet.
  if (phase === 'unauthorized') {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-6 text-center"
        style={{ background: PRESS.bg, color: PRESS.text, fontFamily: SERIF }}
      >
        <div className="max-w-sm">
          <img
            src="/holoflower-studio-transparent.png"
            alt=""
            aria-hidden="true"
            className="w-12 h-12 mx-auto mb-5 opacity-90"
          />
          <p className="text-[13px] tracking-[0.25em] uppercase opacity-50 mb-3">Author Studio</p>
          <p className="text-[15px] leading-relaxed opacity-70">
            The Studio holds your own words, so it opens only to you.{' '}
            <a href="/signin" className="underline underline-offset-4">
              Sign in
            </a>{' '}
            to enter.
          </p>
        </div>
      </div>
    );
  }

  return (
    <StudioShell
      hasManuscript={hasManuscript}
      manuscriptTitle={manuscript?.title}
      // The same read the header below is founded on. Passed down so the room
      // has one answer to "what did I come back to?" instead of two.
      worksPhase={worksPhase}
      works={works}
    >
      <div className="max-w-2xl px-6 md:px-12 py-12 md:py-16">
        {/* ── Arrival. Restrained: name what they came back to, then get out of
            the way. A declared work is the subject; otherwise the place is. ── */}
        {/* Held until the works read settles. Rendering the place's name first
            and then replacing it with the member's work would stage a small
            act of forgetting-then-remembering on every single arrival — the
            opposite of what returning to your work should feel like. The
            reserved height keeps nothing below it from jumping. */}
        <header className={work ? 'mb-8' : 'mb-14'} style={{ minHeight: '5.5rem' }}>
          {worksPhase === 'loading' ? null : work ? (
            <>
              <p className="text-[13px] tracking-[0.25em] uppercase opacity-40 mb-4">
                Author Studio
              </p>
              {/* An unnamed work keeps its absence: "Your work" is orientation,
                  not a name, and nothing by that name is stored. */}
              <h1
                className="text-[28px] md:text-[32px] leading-snug"
                style={{ fontFamily: SERIF, opacity: work.title ? 1 : 0.75 }}
              >
                {work.title ?? 'Your work'}
              </h1>
            </>
          ) : (
            <>
              <h1 className="text-[28px] md:text-[32px] mb-3">Author Studio</h1>
              <p className="text-[16px] leading-relaxed opacity-65 max-w-md">
                A place to gather, shape, write, and bring your book into form.
              </p>
            </>
          )}
        </header>

        {/* The declaration act (Slice 2). When arrival is founded on the work,
            this renders only its quiet controls — the headline above is the
            work's name, and it is not repeated. */}
        <YourWork
          phase={worksPhase}
          works={works}
          reload={reloadWorks}
          arrivalWorkId={work?.id ?? null}
        />

        {/* A rule, not a container. It separates the work from what sits under
            it without asserting that the manuscript is held by it. */}
        {work && (
          <hr className="border-0 border-t mb-14" style={{ borderColor: PRESS.rule }} />
        )}

        {phase === 'loading' && <p className="text-[14px] opacity-40">opening…</p>}

        {phase === 'error' && (
          <div>
            <p className="text-[15px] opacity-70 mb-2">
              The Studio could not be reached just now.
            </p>
            <p className="text-[14px] opacity-45">
              Your work is not affected. Please try again in a moment.
            </p>
          </div>
        )}

        {/* ── Nothing written yet. ──────────────────────────────────────────
            SLICE 2 (2026-08-02) added a "Start writing" door to this state,
            but gated it on `work` — and `arrivalWork()` returns a work ONLY
            when the member has EXACTLY ONE declared. So the door stood open
            in one narrow state and was shut in every other:

              · nothing declared, nothing written  → "Import Manuscript" only
              · exactly one work declared          → Start writing
              · two or more works declared         → "Import Manuscript" only

            A writer who had declared nothing, and a writer who had declared
            two things, were both told — in a room called a Studio — that to
            begin writing they must already have written. That is the exact
            defect Slice 2 was created to remove; it removed it for one state
            and left it standing in the others. Found 2026-08-05 by the
            founder, who could not start writing in his own Studio.

            Writing is the primary act in ALL of these states, so it is the
            primary action in all of them. Import stays as the other way to
            begin — never as the entrance.

            ⛔ Do not re-gate this on `work`. Naming WHICH work a member
            returned to is a real question `arrivalWork` is right to decline
            to guess — but declining to name the work may never withhold the
            page. Arrival framing and the writing action are different
            questions; only the first is ambiguous when several works exist. */}
        {phase === 'none' && (
          <section>
            <h2 className="text-[13px] tracking-[0.2em] uppercase opacity-40 mb-4">Begin</h2>
            <p className="text-[16px] leading-relaxed opacity-75 mb-8 max-w-md">
              {work
                ? 'Begin where the work is alive.'
                : 'Begin with a blank page. Nothing has to exist first.'}
            </p>
            <div className="flex flex-wrap items-center gap-5">
              <button
                onClick={() => void startWriting()}
                disabled={starting}
                className="inline-block px-7 py-3 text-[14px] tracking-wide disabled:opacity-40"
                style={{ background: PRESS.accent, color: PRESS.ink }}
              >
                {starting ? 'making a page…' : 'Start writing'}
              </button>
              <Link
                href={IMPORT_HREF}
                className="text-[15px] opacity-60 hover:opacity-90 underline underline-offset-4"
              >
                Bring in existing writing
              </Link>
            </div>
            {startError && (
              <p role="alert" className="text-[13px] opacity-70 mt-6 max-w-md">
                {startError}
              </p>
            )}
            <p className="text-[13px] leading-relaxed opacity-45 mt-6 max-w-md">
              A blank page, kept for you. You can name it whenever you want to — or not at all.
              Anything you bring in instead is kept as your Source and never altered.
            </p>
          </section>
        )}

        {/* ── A book exists. Do not send them back through import. ── */}
        {hasManuscript && manuscript && (
          <>
            <section className="mb-14">
              <h2 className="text-[13px] tracking-[0.2em] uppercase opacity-40 mb-4">
                Current Book
              </h2>
              <p
                className="text-[22px] md:text-[24px] mb-2 leading-snug"
                /* An expression the member has not named reads as orientation,
                   not as a title. Nothing by this name is stored. */
                style={manuscript.title ? undefined : { opacity: 0.7 }}
              >
                {manuscript.title ?? UNTITLED_EXPRESSION}
              </p>
              <p className="text-[13px] opacity-45 mb-8">
                {pageEstimate(manuscript.charCount)} pages · {manuscript.sectionCount} section
                {manuscript.sectionCount === 1 ? '' : 's'}
                {manuscript.keepCount > 0 && ` · ${manuscript.keepCount} kept`}
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href={byIdentity(WRITE_HREF, manuscript.id)}
                  className="inline-block px-7 py-3 text-[14px] tracking-wide"
                  style={{ background: PRESS.accent, color: PRESS.ink }}
                >
                  Continue Writing
                </Link>
                <Link
                  href={byIdentity(SOURCE_HREF, manuscript.id)}
                  className="text-[14px] opacity-55 hover:opacity-85 underline underline-offset-4"
                >
                  Read the Source
                </Link>
              </div>
            </section>

            <section>
              <h2 className="text-[13px] tracking-[0.2em] uppercase opacity-40 mb-4">
                Bring in another
              </h2>
              <Link
                href={IMPORT_HREF}
                className="text-[15px] opacity-60 hover:opacity-90 underline underline-offset-4"
              >
                Import Manuscript
              </Link>
              {count > 1 && (
                <p className="text-[13px] opacity-40 mt-3">
                  {count} manuscripts imported. The most recent is open.
                </p>
              )}
            </section>
          </>
        )}
      </div>
    </StudioShell>
  );
}
