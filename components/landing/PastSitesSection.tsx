'use client';

import { ExternalLink } from 'lucide-react';
import { PORTFOLIO_PROJECTS } from '@/lib/data/portfolio';
import { SectionReveal } from './SectionReveal';

export function PastSitesSection() {
  const sites = PORTFOLIO_PROJECTS.filter(p => p.group === 'sites');

  return (
    <section id="past-sites" className="relative py-20 sm:py-24 px-4 bg-maia-navy-950 border-t border-white/5">
      <div className="max-w-4xl mx-auto">
        <SectionReveal>
          <p className="text-white/35 text-center text-[11px] tracking-[0.3em] uppercase mb-3">
            Current build &amp; focus
          </p>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8 mb-16">
            <div className="flex items-baseline justify-between gap-3 flex-wrap mb-3">
              <h3
                className="text-white/90 text-xl sm:text-2xl font-extralight tracking-wide"
                style={{ fontFamily: "'Crimson Pro', serif" }}
              >
                Now What? — a flourishing platform
              </h3>
              <span className="text-white/25 text-[11px] tracking-widest uppercase">
                With Larry Closs · In active build
              </span>
            </div>
            <p
              className="text-white/50 text-sm sm:text-base leading-relaxed font-light"
              style={{ fontFamily: "'Source Sans Pro', sans-serif" }}
            >
              Built with Larry Closs — a CEO transitioning to executive coach for those seeking
              to flourish, drawing on his study in Harvard&rsquo;s positive psychology certification
              program. Now What? is a developmental environment for people who have achieved much
              and are asking what comes next — with Larry&rsquo;s practice, presence, and
              accompaniment at its center.
            </p>
          </div>
        </SectionReveal>
        <SectionReveal>
          <p className="text-white/35 text-center text-[11px] tracking-[0.3em] uppercase mb-3">
            Earlier work
          </p>
          <h2
            className="text-2xl sm:text-3xl font-extralight tracking-wide text-white/80 text-center mb-4"
            style={{ fontFamily: "'Crimson Pro', serif" }}
          >
            Sites we&rsquo;ve built for others
          </h2>
          <p
            className="text-white/45 text-center text-sm sm:text-base leading-relaxed max-w-xl mx-auto mb-12 font-light italic"
            style={{ fontFamily: "'Crimson Pro', serif" }}
          >
            Each one a doorway for bringing soulful consciousness into a craft, a practice, a calling. They belong to their owners now.
          </p>
        </SectionReveal>

        <ul className="divide-y divide-white/5 border-y border-white/5">
          {sites.map((site, i) => (
            <SectionReveal key={site.slug} delay={0.05 * (i + 1)}>
              <li>
                <a
                  href={site.domain}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-4 py-5 px-2 transition-colors hover:bg-white/[0.02]"
                >
                  <span
                    className="mt-2 w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: site.accent }}
                    aria-hidden="true"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-3 flex-wrap">
                      <h3 className="text-white/85 text-base sm:text-lg font-light tracking-wide group-hover:text-white transition-colors">
                        {site.name}
                      </h3>
                      <span className="text-white/25 text-[11px] tracking-widest uppercase">
                        {site.tags.slice(0, 2).join(' · ')}
                      </span>
                    </div>
                    <p
                      className="text-white/45 text-sm leading-relaxed mt-1.5 font-light"
                      style={{ fontFamily: "'Source Sans Pro', sans-serif" }}
                    >
                      {site.description}
                    </p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-white/20 mt-2 shrink-0 group-hover:text-white/50 transition-colors" />
                </a>
              </li>
            </SectionReveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
