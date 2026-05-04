import StudioMarkdown from '../_lib/StudioMarkdown';

export const metadata = {
  title: 'Design System · The Book Studio',
};

export default function DesignSystemPage() {
  return (
    <div>
      <header className="mb-10">
        <p className="text-amber-200/40 text-[11px] tracking-[0.25em] uppercase mb-2">
          The Book Studio
        </p>
        <h1 className="text-amber-100/90 text-2xl md:text-3xl font-light tracking-wide">
          Design System
        </h1>
        <p className="text-amber-200/45 text-sm font-light italic mt-1">
          Soullab Press v1 — typography, page rhythm, principles.
        </p>
      </header>
      <StudioMarkdown file="ELEMENTAL_ALCHEMY_DESIGN_SYSTEM_v1.md" />
    </div>
  );
}
