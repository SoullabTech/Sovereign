'use client';

import { Hammer, Compass, Users } from 'lucide-react';
import { SectionReveal } from './SectionReveal';

const pathways = [
  {
    icon: <Hammer className="w-6 h-6" />,
    title: 'Build',
    description: 'Need a site, app, or digital presence? We build with soul. Clean design, strong systems, high trust.',
    items: ['Websites & web apps', 'Brand systems', 'API & AI integrations', 'Custom dashboards'],
    cta: 'Start a project',
  },
  {
    icon: <Compass className="w-6 h-6" />,
    title: 'Consult',
    description: 'Strategy, architecture, consciousness-aware technology. For founders, practitioners, and teams in transition.',
    items: ['Technical strategy', 'Architecture reviews', 'AI & emerging tech', 'Team advisory'],
    cta: 'Book a conversation',
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: 'Collaborate',
    description: 'Research partners, open-source contributors, fellow builders. If you\'re making something real, let\'s talk.',
    items: ['Research partnerships', 'Open-source projects', 'Co-creation & licensing', 'Fellowship programs'],
    cta: 'Reach out',
  },
];

export function ContactSection() {
  return (
    <section
      id="contact"
      className="relative py-24 sm:py-32 px-4"
      style={{
        background: 'linear-gradient(180deg, #0b0f1c 0%, #0f1328 100%)',
      }}
    >
      <div className="max-w-6xl mx-auto">
        <SectionReveal>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-extralight tracking-wide text-white text-center mb-4"
            style={{ fontFamily: "'Crimson Pro', serif" }}
          >
            Work with Soullab
          </h2>
          <p className="text-white/40 text-center text-sm tracking-widest uppercase mb-16">
            Three doors. One standard.
          </p>
        </SectionReveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-16">
          {pathways.map((pathway, i) => (
            <SectionReveal key={pathway.title} delay={0.1 * (i + 1)}>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 hover:border-maia-spice-500/20 hover:bg-white/[0.05] transition-all duration-300 h-full flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-maia-spice-500/10 flex items-center justify-center text-maia-spice-400 mb-6">
                  {pathway.icon}
                </div>
                <h3 className="text-xl font-medium text-white mb-3">
                  {pathway.title}
                </h3>
                <p className="text-white/50 leading-relaxed mb-4" style={{ fontFamily: "'Source Sans Pro', sans-serif" }}>
                  {pathway.description}
                </p>
                <ul className="space-y-1.5 mb-6 flex-1">
                  {pathway.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-white/40" style={{ fontFamily: "'Source Sans Pro', sans-serif" }}>
                      <span className="w-1 h-1 rounded-full bg-maia-spice-400/60 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <a
                  href="mailto:hello@soullab.life"
                  className="inline-flex items-center text-maia-spice-400 hover:text-maia-spice-400 font-medium transition-colors group text-sm"
                >
                  {pathway.cta}
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">&rarr;</span>
                </a>
              </div>
            </SectionReveal>
          ))}
        </div>

        {/* Closing line */}
        <SectionReveal delay={0.4}>
          <p className="text-center text-white/30 text-lg max-w-2xl mx-auto mb-4" style={{ fontFamily: "'Source Sans Pro', sans-serif" }}>
            Soullab is craft-first. Strategy without buzzwords. Design with an ethic.
            Technology that supports human work.
          </p>
        </SectionReveal>
      </div>

      {/* Footer */}
      <footer className="mt-24 pt-8 border-t border-white/10 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-white/30 text-sm">
          <div className="flex items-center gap-3">
            <img src="/soullab-logo.png" alt="Soullab" className="w-6 h-6 rounded-full" />
            <span className="tracking-wider uppercase text-xs">Soullab</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="/enter" className="hover:text-white/50 transition-colors">MAIA</a>
            <a href="/maia/privacy" className="hover:text-white/50 transition-colors">Privacy</a>
            <a href="/maia/stewardship" className="hover:text-white/50 transition-colors">Stewardship</a>
          </div>
          <span className="text-xs text-white/20">
            &copy; {new Date().getFullYear()} Soullab
          </span>
        </div>
      </footer>
    </section>
  );
}
