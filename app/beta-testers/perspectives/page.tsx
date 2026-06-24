import { getPerspectives } from '@/lib/beta-testers/docs';
import { ELEMENT_META, type ElementKey } from '@/lib/beta-testers/constants';

// Server component — lens structure comes from the markdown frontmatter,
// styling (accent + glyph) from the shared client-safe constants.
export default function PerspectivesPage() {
  const { title, intro, closing, lenses } = getPerspectives();

  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <h2 className="text-xl font-light text-zinc-100">{title}</h2>
        <div className="space-y-1.5 text-[15px] leading-relaxed text-zinc-400">
          {intro.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {lenses.map((lens) => {
          const meta = ELEMENT_META[lens.element as ElementKey] ?? { label: lens.element, accent: '#C8A96A', glyph: '◦' };
          return (
            <section
              key={lens.element}
              className="rounded-2xl border bg-white/[0.02] p-6"
              style={{ borderColor: `${meta.accent}33` }}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg" style={{ color: meta.accent }} aria-hidden>
                  {meta.glyph}
                </span>
                <h3 className="text-base font-medium" style={{ color: meta.accent }}>
                  {meta.label}
                </h3>
              </div>
              <p className="mt-3 text-[15px] text-zinc-200">{lens.question}</p>
              <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5">
                {lens.facets.map((f) => (
                  <li key={f} className="text-sm text-zinc-500">
                    {f}
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      <div className="space-y-1.5 text-[15px] text-zinc-400">
        {closing.map((line, i) => (
          <p key={i} className={i === closing.length - 1 ? 'text-zinc-200' : undefined}>
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}
