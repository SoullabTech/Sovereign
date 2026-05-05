import StudioMarkdown from '../_lib/StudioMarkdown';

export const metadata = {
  title: 'Read Manuscript · The Book Studio',
};

export default function ReadManuscriptPage() {
  return (
    <div>
      <header className="mb-10">
        <p className="text-amber-200/40 text-[11px] tracking-[0.25em] uppercase mb-2">
          The Book Studio
        </p>
        <h1 className="text-amber-100/90 text-2xl md:text-3xl font-light tracking-wide">
          Read Manuscript
        </h1>
        <p className="text-amber-200/45 text-sm font-light italic mt-1">
          Elemental Alchemy — sealed source text.
        </p>
      </header>
      <StudioMarkdown file="ELEMENTAL_ALCHEMY_FROM_ORIGINAL_FULL.md" />
    </div>
  );
}
