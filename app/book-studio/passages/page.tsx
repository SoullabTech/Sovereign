import StudioMarkdown from '../_lib/StudioMarkdown';

export const metadata = {
  title: 'Passage Blocks · The Book Studio',
};

export default function PassagesPage() {
  return (
    <div>
      <header className="mb-10">
        <p className="text-amber-200/40 text-[11px] tracking-[0.25em] uppercase mb-2">
          The Book Studio
        </p>
        <h1 className="text-amber-100/90 text-2xl md:text-3xl font-light tracking-wide">
          Passage Blocks
        </h1>
        <p className="text-amber-200/45 text-sm font-light italic mt-1">
          34 self-contained doorways extracted from Ch5–9.
        </p>
      </header>
      <StudioMarkdown file="PASSAGE_BLOCKS_INDEX.md" />
    </div>
  );
}
