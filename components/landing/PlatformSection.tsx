'use client';

import { SectionReveal } from './SectionReveal';

const FACETS = [
  {
    name: 'Home',
    status: 'Live',
    body: 'Your orienting field — what is alive now, where you have been, and where you may want to go next.',
  },
  {
    name: 'Journal + Dream',
    status: 'Living field',
    body: 'Day life and night life held as related forms of reflection, memory, symbol, and return.',
  },
  {
    name: "Writer's Studio",
    status: 'In active build',
    body: 'A manuscript-first environment where MAIA can help with development, structure, continuity, voice, and revision without taking authorship.',
  },
  {
    name: 'Relationships',
    status: 'In active build',
    body: 'A relational field for seeing patterns, carrying continuity, and attending to the people and bonds that shape a life.',
  },
  {
    name: 'Astrology + Divination',
    status: 'Evolving',
    body: 'Symbolic systems used as interpretive lenses — integrated with context, dialogue, and member-authored meaning rather than treated as deterministic answers.',
  },
  {
    name: 'Becoming',
    status: 'Research + design',
    body: 'A future-facing field connecting what has been, what is being, and what may be becoming without collapsing possibility into prediction.',
  },
];

export function PlatformSection() {
  return (
    <section id="platform" className="relative py-24 sm:py-32 px-4 bg-maia-navy-950">
      <div className="max-w-6xl mx-auto">
        <SectionReveal>
          <p className="text-[11px] tracking-[0.35em] uppercase text-white/30 text-center mb-5">
            Inside Soullab
          </p>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-extralight tracking-wide text-white text-center mb-5"
            style={{ fontFamily: "'Crimson Pro', serif" }}
          >
            One field. Many places to work with your life.
          </h2>
          <p
            className="text-white/45 text-center text-base sm:text-lg leading-relaxed max-w-2xl mx-auto mb-16"
            style={{ fontFamily: "'Source Sans Pro', sans-serif" }}
          >
            Soullab is the member-facing platform. AIN OS is the sovereign architecture beneath it.
            MAIA is the relational intelligence that can accompany you across the field.
          </p>
        </SectionReveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FACETS.map((facet, index) => (
            <SectionReveal key={facet.name} delay={0.05 * index}>
              <div className="h-full rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-7">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <h3 className="text-lg font-medium text-white">{facet.name}</h3>
                  <span className="shrink-0 text-[10px] tracking-wider uppercase text-maia-spice-400/80">
                    {facet.status}
                  </span>
                </div>
                <p
                  className="text-white/45 text-sm leading-relaxed"
                  style={{ fontFamily: "'Source Sans Pro', sans-serif" }}
                >
                  {facet.body}
                </p>
              </div>
            </SectionReveal>
          ))}
        </div>

        <SectionReveal delay={0.35}>
          <div className="mt-12 text-center">
            <a
              href="/home"
              className="inline-flex items-center justify-center rounded-xl px-8 py-3.5 bg-maia-spice-500 hover:bg-maia-spice-400 text-black font-semibold text-base transition-colors shadow-lg shadow-maia-spice-500/20"
            >
              Enter Soullab
            </a>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
