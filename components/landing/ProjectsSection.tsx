'use client';

import { UPCOMING_PROJECTS } from '@/lib/data/portfolio';
import { SectionReveal } from './SectionReveal';

const statusStyles: Record<string, { label: string; color: string; dot: string }> = {
  'in-progress': { label: 'In Progress', color: 'text-maia-spice-400', dot: 'bg-maia-spice-400' },
  'coming-soon': { label: 'Coming Soon', color: 'text-white/40', dot: 'bg-white/30' },
  'idea': { label: 'Idea Stage', color: 'text-white/30', dot: 'bg-white/20' },
};

export function ProjectsSection() {
  return (
    <section
      id="projects"
      className="relative py-24 sm:py-32 px-4"
      style={{
        background: 'linear-gradient(180deg, #0b0f1c 0%, #0f1328 50%, #0b0f1c 100%)',
      }}
    >
      <div className="max-w-4xl mx-auto">
        <SectionReveal>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-extralight tracking-wide text-white text-center mb-4"
            style={{ fontFamily: "'Crimson Pro', serif" }}
          >
            What&rsquo;s Next
          </h2>
          <p className="text-white/40 text-center text-sm tracking-widest uppercase mb-16">
            The pipeline
          </p>
        </SectionReveal>

        <div className="space-y-4">
          {UPCOMING_PROJECTS.map((project, i) => {
            const style = statusStyles[project.status];
            return (
              <SectionReveal key={project.name} delay={0.1 * (i + 1)}>
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-4 hover:border-white/15 transition-colors">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-white mb-1">
                      {project.name}
                    </h3>
                    <p className="text-white/45 text-sm leading-relaxed" style={{ fontFamily: "'Source Sans Pro', sans-serif" }}>
                      {project.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                    <span className={`text-xs tracking-wide uppercase ${style.color}`}>
                      {style.label}
                    </span>
                  </div>
                </div>
              </SectionReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
