import StudioMarkdown from '../_lib/StudioMarkdown';
import Frontispiece from '../_lib/Frontispiece';

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
      <header className="mb-10">
        <div className="flex items-center gap-2 mb-2">
          <img
            src="/holoflower-amber.png"
            alt=""
            aria-hidden="true"
            className="w-4 h-4 block opacity-70"
          />
          <p className="text-amber-200/40 text-[11px] tracking-[0.25em] uppercase">
            The Book Studio
          </p>
        </div>
        <h1 className="text-amber-100/90 text-2xl md:text-3xl font-light tracking-wide">
          Read Flow
        </h1>
        <p className="text-amber-200/45 text-sm font-light italic mt-1">
          Elemental Alchemy — continuous prose, sealed source.
        </p>
      </header>
      <Frontispiece />
      <StudioMarkdown file="ELEMENTAL_ALCHEMY_FROM_ORIGINAL_FULL.md" />
    </div>
  );
}
