'use client';

import Link from 'next/link';
import { SectionReveal } from './SectionReveal';

const OFFERINGS = [
  {
    name: 'MAIA',
    what: 'An ongoing relationship with an attending intelligence.',
    bullets: [
      'Continuous interaction over time',
      'Tracks patterns, shifts, and development',
      'Responds to you — on your terms',
    ],
    cta: 'Enter MAIA',
    href: '/enter',
    accent: 'maia-spice',
  },
  {
    name: 'Identity Audit',
    what: 'A one-time, high-resolution map of your structure.',
    bullets: [
      'Reveals core tensions and blind spots',
      'Clarifies patterns across domains',
      'Gives concrete next moves',
    ],
    cta: 'Run Identity Audit',
    href: '/audit',
    accent: 'amber',
  },
  {
    name: 'AIN',
    what: 'An intelligence layer you can deploy in your work or platform.',
    bullets: [
      'Adds relational intelligence to systems',
      'Tracks patterns across users and time',
      'For practitioners, creators, founders, and platforms',
    ],
    cta: 'Explore AIN',
    href: '#contact',
    scroll: true,
    accent: 'white',
  },
] as const;

export function OfferingsSection() {
  return (
    <section
      id="offerings"
      className="py-24 sm:py-32 px-4"
      style={{
        background: 'linear-gradient(180deg, #0b0f1c 0%, #0f1328 50%, #0b0f1c 100%)',
      }}
    >
      <div className="max-w-5xl mx-auto">
        <SectionReveal>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-extralight tracking-wide text-white text-center mb-4"
            style={{ fontFamily: "'Crimson Pro', serif" }}
          >
            Three ways to work with Soullab
          </h2>
          <p className="text-white/30 text-center text-sm max-w-lg mx-auto mb-16" style={{ fontFamily: "'Source Sans Pro', sans-serif" }}>
            Each built on the same engine. Each designed to serve the person, not the platform.
          </p>
        </SectionReveal>

        <div className="grid lg:grid-cols-3 gap-6">
          {OFFERINGS.map((offering, i) => (
            <SectionReveal key={offering.name} delay={0.1 * (i + 1)}>
              <div className="flex flex-col h-full rounded-2xl border border-white/10 bg-white/[0.03] p-8 hover:border-white/20 hover:bg-white/[0.05] transition-all duration-300">
                {/* Name */}
                <h3
                  className="text-2xl sm:text-3xl font-extralight text-white leading-tight"
                  style={{ fontFamily: "'Crimson Pro', serif" }}
                >
                  {offering.name}
                </h3>

                {/* What it is */}
                <p className="mt-3 text-white/50 text-sm leading-relaxed" style={{ fontFamily: "'Source Sans Pro', sans-serif" }}>
                  {offering.what}
                </p>

                {/* Bullets */}
                <ul className="mt-6 space-y-3 flex-1">
                  {offering.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-3">
                      <span className="text-maia-spice-400/40 mt-0.5 shrink-0 text-sm leading-none">&middot;</span>
                      <span className="text-white/35 text-sm leading-relaxed">{bullet}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <div className="mt-8">
                  {offering.scroll ? (
                    <button
                      onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                      className="inline-flex items-center text-maia-spice-400 hover:text-maia-spice-300 text-sm font-medium transition-colors group"
                    >
                      {offering.cta}
                      <span className="ml-2 group-hover:translate-x-1 transition-transform">&rarr;</span>
                    </button>
                  ) : (
                    <Link
                      href={offering.href}
                      className="inline-flex items-center text-maia-spice-400 hover:text-maia-spice-300 text-sm font-medium transition-colors group"
                    >
                      {offering.cta}
                      <span className="ml-2 group-hover:translate-x-1 transition-transform">&rarr;</span>
                    </Link>
                  )}
                </div>
              </div>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
