'use client';

import { ExternalLink } from 'lucide-react';
import { PORTFOLIO_PROJECTS } from '@/lib/data/portfolio';
import { SectionReveal } from './SectionReveal';

const statusBadge: Record<string, { label: string; className: string }> = {
  live: { label: 'Live', className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
  development: { label: 'In Dev', className: 'bg-maia-spice-500/15 text-maia-spice-400 border-maia-spice-500/20' },
  idea: { label: 'Idea', className: 'bg-white/10 text-white/40 border-white/10' },
};

export function PortfolioSection() {
  return (
    <section id="portfolio" className="relative py-24 sm:py-32 px-4 bg-maia-navy-950">
      <div className="max-w-6xl mx-auto">
        <SectionReveal>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-extralight tracking-wide text-white text-center mb-4"
            style={{ fontFamily: "'Crimson Pro', serif" }}
          >
            Powered by Soullab
          </h2>
          <p className="text-white/40 text-center text-sm tracking-widest uppercase mb-16">
            Sites and systems we&rsquo;ve built
          </p>
        </SectionReveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {PORTFOLIO_PROJECTS.map((project, i) => {
            const badge = statusBadge[project.status];
            return (
              <SectionReveal key={project.slug} delay={0.08 * (i + 1)}>
                <a
                  href={project.domain}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8 hover:border-white/20 hover:bg-white/[0.05] transition-all duration-300 h-full"
                >
                  {/* Header row */}
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-3 h-3 rounded-full shrink-0 mt-1"
                      style={{ backgroundColor: project.accent }}
                    />
                    <ExternalLink className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors" />
                  </div>

                  {/* Name */}
                  <h3 className="text-lg font-medium text-white mb-2 group-hover:text-maia-spice-400 transition-colors">
                    {project.name}
                  </h3>

                  {/* Description */}
                  <p className="text-white/45 text-sm leading-relaxed mb-4" style={{ fontFamily: "'Source Sans Pro', sans-serif" }}>
                    {project.description}
                  </p>

                  {/* Tags + Status */}
                  <div className="flex items-center flex-wrap gap-2 mt-auto">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] border ${badge.className}`}>
                      {badge.label}
                    </span>
                    {project.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] text-white/30 border border-white/8 bg-white/[0.02]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </a>
              </SectionReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
