'use client';

import { useState } from 'react';
import { INNOVATIONS } from '@/lib/data/portfolio';
import { SectionReveal } from './SectionReveal';

const categoryLabels: Record<string, string> = {
  'all': 'All',
  'core-intelligence': 'Core Intelligence',
  'relational-safety': 'Relational Safety',
  'developmental-continuity': 'Developmental Continuity',
  'knowledge-modality': 'Knowledge & Modality',
  'infrastructure': 'Infrastructure',
};

export function ResearchSection() {
  const [activeCategory, setActiveCategory] = useState('all');

  const filtered = activeCategory === 'all'
    ? INNOVATIONS
    : INNOVATIONS.filter(i => i.category === activeCategory);

  return (
    <section id="research" className="relative py-24 sm:py-32 px-4 bg-maia-navy-950">
      <div className="max-w-6xl mx-auto">
        <SectionReveal>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-extralight tracking-wide text-white text-center mb-4"
            style={{ fontFamily: "'Crimson Pro', serif" }}
          >
            Innovations
          </h2>
          <p className="text-white/40 text-center text-sm tracking-widest uppercase mb-6">
            {INNOVATIONS.length} working breakthroughs in consciousness computing
          </p>
          <p className="text-white/30 text-center text-sm max-w-2xl mx-auto mb-12" style={{ fontFamily: "'Source Sans Pro', sans-serif" }}>
            Not theoretical. Not coming soon. Built and running in production today.
          </p>
        </SectionReveal>

        {/* Category filter */}
        <SectionReveal delay={0.1}>
          <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
            {Object.entries(categoryLabels).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveCategory(key)}
                className={`px-4 py-1.5 rounded-full text-xs tracking-wide transition-all ${
                  activeCategory === key
                    ? 'bg-maia-spice-500/15 text-maia-spice-400 border border-maia-spice-500/30'
                    : 'text-white/30 border border-white/10 hover:text-white/50 hover:border-white/20'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </SectionReveal>

        {/* Innovation grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((innovation, i) => (
            <SectionReveal key={innovation.title} delay={0.05 * (i + 1)}>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-7 hover:border-white/20 hover:bg-white/[0.05] transition-all duration-300 h-full flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] tracking-wide uppercase text-white/25 border border-white/8">
                    {categoryLabels[innovation.category]}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-white mb-3 leading-tight">
                  {innovation.title}
                </h3>
                <p className="text-white/40 text-sm leading-relaxed flex-1" style={{ fontFamily: "'Source Sans Pro', sans-serif" }}>
                  {innovation.description}
                </p>
              </div>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
