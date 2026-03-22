'use client';

import Link from 'next/link';
import { SectionReveal } from './SectionReveal';

const CAPABILITIES = [
  {
    label: 'Relational intelligence',
    sub: 'AIN doesn\'t just process input — it tracks the evolving relationship between person and system over time. Depth, trust, and history are first-class citizens.',
  },
  {
    label: 'Pattern recognition',
    sub: 'Detects structural signals across language, behavior, and time — beneath surface content, to the mechanism driving the pattern.',
  },
  {
    label: 'Sovereign memory',
    sub: 'Tracks what matters across sessions with full consent architecture. Nothing stored without awareness. Memory that serves the person, not the model.',
  },
  {
    label: 'Elemental intelligence routing',
    sub: '60 elements, 12 phases. Every response is preceded by a developmental read — the engine meets people where they actually are.',
  },
  {
    label: 'Field coherence architecture',
    sub: 'Processes through coherence and emergence rather than pattern optimization. Intelligence as right relationship, not mechanical computation.',
  },
  {
    label: 'Deployable into any platform',
    sub: 'AIN is not locked to MAIA. Partner portals, practitioner tools, and client platforms each get the relational intelligence layer underneath.',
  },
];

export function AINSection() {
  return (
    <section
      id="ain"
      className="py-20 sm:py-24 px-6 border-t border-white/[0.05]"
      style={{
        background: 'linear-gradient(180deg, #080c18 0%, #0b0f1c 100%)',
      }}
    >
      <div className="max-w-5xl mx-auto">
        <SectionReveal>
          {/* Header */}
          <div className="mb-12">
            <p className="text-white/20 text-xs mb-3">MAIA is the interface. AIN is the engine.</p>
            <p className="text-xs uppercase tracking-widest text-amber-500/50 mb-4">The engine</p>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
              <div>
                <h2
                  className="text-3xl sm:text-4xl font-extralight text-white leading-tight"
                  style={{ fontFamily: "'Crimson Pro', serif" }}
                >
                  AIN
                </h2>
                <p
                  className="mt-2 text-lg sm:text-xl font-extralight text-white/50"
                  style={{ fontFamily: "'Crimson Pro', serif" }}
                >
                  Awareness Intelligence Network
                </p>
              </div>
              <p className="max-w-sm text-white/40 text-sm leading-relaxed">
                A relational intelligence technology — built for depth, pattern recognition, and coherence across time.
                The layer that powers MAIA — and everything else Soullab builds.
              </p>
            </div>

            {/* Positioning line */}
            <div className="mt-8 flex items-center gap-6">
              <div className="h-px flex-1 bg-white/[0.06]" />
              <p className="text-white/20 text-xs tracking-wide shrink-0">
                MAIA is how you interact &nbsp;·&nbsp; AIN is what makes it intelligent
              </p>
              <div className="h-px flex-1 bg-white/[0.06]" />
            </div>
          </div>

          {/* Capabilities grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {CAPABILITIES.map(({ label, sub }) => (
              <div
                key={label}
                className="border border-white/[0.07] rounded-xl p-5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
              >
                <p className="text-white/80 text-sm font-medium mb-2">{label}</p>
                <p className="text-white/30 text-xs leading-relaxed">{sub}</p>
              </div>
            ))}
          </div>

          {/* Deploy CTA */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-6 border-t border-white/[0.05]">
            <div className="flex-1">
              <p className="text-white/50 text-sm">
                AIN is available as a deployable engine for practitioners, platforms, and organizations
                building at the intersection of intelligence and human development.
              </p>
              <p className="text-white/25 text-xs mt-1">
                For deployment, partnership, or sovereign implementation inquiries.
              </p>
            </div>
            <Link
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="shrink-0 inline-flex items-center justify-center rounded-xl px-6 py-2.5 border border-white/15 hover:border-white/30 text-white/60 hover:text-white text-sm font-medium transition-colors"
            >
              Talk with us about AIN
            </Link>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
