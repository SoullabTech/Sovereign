'use client';

import { SectionReveal } from './SectionReveal';

const PRINCIPLES = [
  {
    label: 'Attending intelligence',
    description: 'Built to attend, not optimize. Every interaction begins with a relational read — not a prediction of what you\'ll click.',
  },
  {
    label: 'Sovereign by design',
    description: 'Self-hosted. Consent-first memory. No cloud lock-in, no data extraction, no engagement loops. Your data never leaves your hands.',
  },
  {
    label: 'Pattern recognition across time',
    description: 'Detects structural signals beneath surface behavior — across language, decisions, and domains. Not what changed, but what keeps recurring.',
  },
  {
    label: 'No engagement loops',
    description: 'No behavioral shaping, no dependency capture, no simulated certainty. Governed by an irreducible oath — intelligence that serves the person, not the model.',
  },
  {
    label: 'Optimized for coherence',
    description: 'Not optimized for engagement — optimized for coherence. Every design decision serves truth-telling, human agency, and structural clarity.',
  },
];

export function DifferentSection() {
  return (
    <section
      id="different"
      className="py-24 sm:py-32 px-4 border-t border-white/[0.05]"
      style={{
        background: 'linear-gradient(180deg, #0b0f1c 0%, #080c18 100%)',
      }}
    >
      <div className="max-w-4xl mx-auto">
        <SectionReveal>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-extralight tracking-wide text-white text-center mb-4"
            style={{ fontFamily: "'Crimson Pro', serif" }}
          >
            What makes this different
          </h2>
          <p className="text-white/40 text-center text-base max-w-lg mx-auto mb-4" style={{ fontFamily: "'Source Sans Pro', sans-serif" }}>
            Most AI systems optimize for attention. This one is built for alignment.
          </p>
          <p className="text-white/20 text-center text-sm max-w-md mx-auto mb-16" style={{ fontFamily: "'Source Sans Pro', sans-serif" }}>
            Not theoretical. Built and running in production.
          </p>
        </SectionReveal>

        <div className="space-y-6">
          {PRINCIPLES.map((principle, i) => (
            <SectionReveal key={principle.label} delay={0.08 * (i + 1)}>
              <div className="flex gap-6 py-5 border-b border-white/[0.05] last:border-b-0">
                <p className="text-white/70 text-sm font-medium w-48 shrink-0">{principle.label}</p>
                <p className="text-white/30 text-sm leading-relaxed" style={{ fontFamily: "'Source Sans Pro', sans-serif" }}>
                  {principle.description}
                </p>
              </div>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
