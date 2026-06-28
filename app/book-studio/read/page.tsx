import StudioMarkdown from '../_lib/StudioMarkdown';
import AnchorScrollHandler from './AnchorScrollHandler';

export const metadata = {
  title: 'Read Flow · The Book Studio',
};

/**
 * Read fresh from disk on every request.
 *
 * `/book-studio/read` is a living manuscript view, not a static marketing
 * page. It must always reflect the current source file, mirroring the
 * behavior of `/api/book-studio/manuscript/raw` (which is also dynamic).
 *
 * Without this, Next.js statically prerenders the page at build time and
 * serves it with `Cache-Control: s-maxage=31536000`, which causes the
 * Read Flow to drift from the canvas Page Proof if the manuscript is
 * updated outside of a full rebuild.
 */
export const dynamic = 'force-dynamic';

export default function ReadFlowPage() {
  return (
    <div>
      {/* Platform eyebrow — Soullab Press / Read Flow surface */}
      <header className="mb-10 text-center">
        <img
          src="/holoflower-amber.png"
          alt=""
          aria-hidden="true"
          draggable={false}
          className="mx-auto w-14 h-14 md:w-16 md:h-16 mb-3 opacity-75 select-none"
        />
        <p className="text-amber-200/40 text-[10px] md:text-[11px] tracking-[0.3em] uppercase">
          Soullab Press &middot; Read Flow
        </p>
      </header>

      {/* Cover threshold — entering the book object */}
      <div className="my-12 md:my-16 flex justify-center">
        <img
          src="/book-studio/elemental-alchemy-cover.jpg"
          alt="Elemental Alchemy — front cover"
          draggable={false}
          className="block w-full max-w-xs md:max-w-sm rounded-md shadow-2xl ring-1 ring-amber-200/15 select-none"
        />
      </div>

      {/* Book metadata — title, subtitle, author */}
      <div className="mb-16 md:mb-20 text-center space-y-2">
        <h1
          className="text-amber-100/95 text-3xl md:text-4xl font-light tracking-wide"
          style={{ fontFamily: "'Crimson Pro', serif" }}
        >
          Elemental Alchemy
        </h1>
        <p
          className="text-amber-200/55 text-sm md:text-base italic font-light tracking-wide"
          style={{ fontFamily: "'Crimson Pro', serif" }}
        >
          The Art of Living a Phenomenal Life
        </p>
        <p className="text-amber-200/45 text-xs md:text-sm tracking-[0.2em] uppercase pt-1">
          by Kelly W. Nezat
        </p>
      </div>

      {/* Cosmogram now lives inside the manuscript at the Preface threshold,
          so it does not compete with the cover and metadata at the top. */}
      <StudioMarkdown file="ELEMENTAL_ALCHEMY_FROM_ORIGINAL_FULL.md" />

      {/* Restores deep-link scroll on first paint and on hash changes — see
          component header for the two-cause rationale. Pure side effect. */}
      <AnchorScrollHandler />

      {/* Threshold into immersive reading — nearly invisible, no urgency */}
      <div className="mt-20 mb-16 flex justify-center">
        <a
          href="/book-studio/book"
          className="text-amber-200/15 hover:text-amber-200/45 transition-colors duration-300
                     text-[10px] tracking-[0.3em] uppercase font-light"
          style={{ fontFamily: "'Crimson Pro', serif" }}
        >
          Enter Book
        </a>
      </div>
    </div>
  );
}
