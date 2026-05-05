import StudioMarkdown from '../_lib/StudioMarkdown';

export const metadata = {
  title: 'Illustration List · The Book Studio',
};

export default function IllustrationsPage() {
  return (
    <div>
      <header className="mb-10">
        <p className="text-amber-200/40 text-[11px] tracking-[0.25em] uppercase mb-2">
          The Book Studio
        </p>
        <h1 className="text-amber-100/90 text-2xl md:text-3xl font-light tracking-wide">
          Illustration List
        </h1>
        <p className="text-amber-200/45 text-sm font-light italic mt-1">
          Structural longlist with anchors, role, and tone-notes.
        </p>
      </header>
      <StudioMarkdown file="ILLUSTRATION_LIST_v1.md" />
    </div>
  );
}
