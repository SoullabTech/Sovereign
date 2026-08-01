'use client';

import Link from 'next/link';
import { PRESS, SERIF } from './pressTheme';
import StudioShell from './StudioShell';
import { IMPORT_HREF, SOURCE_HREF, WRITE_HREF } from './studioMap';
import { useCurrentManuscript } from './useCurrentManuscript';
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
 */

const pageEstimate = (chars: number) => Math.max(1, Math.round(chars / 1800));

export default function AuthorStudioHome() {
  const { phase, manuscript, count } = useCurrentManuscript();

  const hasManuscript = phase === 'ready' && manuscript !== null;

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
    <StudioShell hasManuscript={hasManuscript} manuscriptTitle={manuscript?.title}>
      <div className="max-w-2xl px-6 md:px-12 py-12 md:py-16">
        {/* ── First arrival. Restrained: name the place, then get out of the way. ── */}
        <header className="mb-14">
          <h1 className="text-[28px] md:text-[32px] mb-3">Author Studio</h1>
          <p className="text-[16px] leading-relaxed opacity-65 max-w-md">
            A place to gather, shape, write, and bring your book into form.
          </p>
        </header>

        {/* Slice 2 — the declaration act. Reachable and legible here; it does
            NOT re-found arrival around the work. That is the next slice, and the
            manuscript sections below are deliberately untouched. */}
        <YourWork />

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

        {/* ── No book yet. One real door, described honestly. ── */}
        {phase === 'none' && (
          <section>
            <h2 className="text-[13px] tracking-[0.2em] uppercase opacity-40 mb-4">Begin</h2>
            <p className="text-[16px] leading-relaxed opacity-75 mb-8 max-w-md">
              Bring in a manuscript you have already written, and it becomes the ground you work
              from.
            </p>
            <Link
              href={IMPORT_HREF}
              className="inline-block px-7 py-3 text-[14px] tracking-wide"
              style={{ background: PRESS.accent, color: PRESS.ink }}
            >
              Import Manuscript
            </Link>
            <p className="text-[13px] leading-relaxed opacity-45 mt-6 max-w-md">
              What you bring in is kept as your Source and never altered. A Working Draft is made
              alongside it — that is the copy you write in.
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
              <p className="text-[22px] md:text-[24px] mb-2 leading-snug">{manuscript.title}</p>
              <p className="text-[13px] opacity-45 mb-8">
                {pageEstimate(manuscript.charCount)} pages · {manuscript.sectionCount} section
                {manuscript.sectionCount === 1 ? '' : 's'}
                {manuscript.keepCount > 0 && ` · ${manuscript.keepCount} kept`}
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href={WRITE_HREF}
                  className="inline-block px-7 py-3 text-[14px] tracking-wide"
                  style={{ background: PRESS.accent, color: PRESS.ink }}
                >
                  Continue Writing
                </Link>
                <Link
                  href={SOURCE_HREF}
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
