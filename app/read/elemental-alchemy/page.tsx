import StudioMarkdown from '../../book-studio/_lib/StudioMarkdown';

export const metadata = {
  title: 'Elemental Alchemy — The Art of Living a Phenomenal Life',
};

/**
 * Read fresh from disk on every request — the manuscript is a living source file,
 * not a static page (same reason as `/book-studio/read`).
 */
export const dynamic = 'force-dynamic';

export default function ElementalAlchemyReader() {
  return (
    <div>
      {/* Cover threshold — the book's own face. No platform eyebrow. */}
      <div className="mt-2 mb-12 md:mb-16 flex justify-center">
        <img
          src="/book-studio/elemental-alchemy-cover.jpg"
          alt="Elemental Alchemy — front cover"
          draggable={false}
          className="block w-full max-w-xs md:max-w-sm rounded-md shadow-2xl ring-1 ring-amber-200/15 select-none"
        />
      </div>

      {/* Title threshold — rendered once. The manuscript's own title page and the
          publisher front matter (copyright, ISBN, disclaimer, contents) are lifted
          out of the reading stream via `startAtHeading`; they remain in the
          canonical manuscript and the print editions. */}
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

      {/* The book begins at its own threshold — the Preface, with the cosmogram
          plate as its doorway. */}
      <StudioMarkdown
        file="ELEMENTAL_ALCHEMY_FROM_ORIGINAL_FULL.md"
        startAtHeading="Preface"
      />
    </div>
  );
}
