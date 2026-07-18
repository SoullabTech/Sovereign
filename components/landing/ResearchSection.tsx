'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { INNOVATIONS, type Innovation, type PublicBucket } from '@/lib/data/portfolio';
import { SectionReveal } from './SectionReveal';

// ─── Principles ───────────────────────────────────────────────────────────────

const PRINCIPLES = [
  {
    title: 'Memory with consent',
    body: 'Your reflections are held only with your awareness and agreement. Sanctuary Mode means some conversations are never stored. There is no stealth memory.',
  },
  {
    title: 'Continuity without surveillance',
    body: 'MAIA remembers what matters across time — not everything. The goal is coherence, not capture.',
  },
  {
    title: 'Informed, not authoritative',
    body: 'Grounded in psychology, philosophy, and wisdom traditions from across cultures and generations — without claiming authority over your meaning.',
  },
  {
    title: 'Sovereignty over engagement',
    body: 'MAIA is not designed to capture attention or create dependence. It is designed to return you, more fully, to your own life.',
  },
  {
    title: 'Honest about what\'s built',
    body: 'We distinguish what is live in production from what is architected for release, and from what is still research. That distinction matters.',
  },
];

// ─── Bucket configuration ────────────────────────────────────────────────────

const BUCKETS: Array<{
  key: PublicBucket;
  heading: string;
  definition: string;
  intro: string | null;
}> = [
  {
    key: 'available_today',
    heading: 'Available Today',
    definition: 'Available and working in the platform today.',
    intro: null,
  },
  {
    key: 'architected_for_release',
    heading: 'Architected for Release',
    definition: 'Designed and partially implemented, but not yet a complete public experience.',
    intro: 'These capabilities have designs, substrates, and clear integration paths. They have not yet crossed the release gate. The distinction matters.',
  },
  {
    key: 'research',
    heading: 'Research',
    definition: 'An active field of inquiry rather than a released capability.',
    intro: 'These are active investigations. We believe they matter enough to explore publicly, but they have not yet earned the status of deployed capabilities. We distinguish research from production intentionally.',
  },
];

const categoryLabels: Record<string, string> = {
  'core-intelligence': 'Core Intelligence',
  'relational-safety': 'Relational Safety',
  'developmental-continuity': 'Developmental Continuity',
  'knowledge-modality': 'Knowledge & Modality',
  'infrastructure': 'Infrastructure',
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function InnovationCard({ innovation }: { innovation: Innovation }) {
  const title = innovation.statusLabel
    ? `${innovation.title} (${innovation.statusLabel})`
    : innovation.title;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-7 hover:border-white/20 hover:bg-white/[0.05] transition-all duration-300 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] tracking-wide uppercase text-white/25 border border-white/8">
          {categoryLabels[innovation.category]}
        </span>
      </div>
      <h3 className="text-base font-semibold text-white mb-3 leading-tight">
        {title}
      </h3>
      <p className="text-white/40 text-sm leading-relaxed flex-1" style={{ fontFamily: "'Source Sans Pro', sans-serif" }}>
        {innovation.description}
      </p>
    </div>
  );
}

// ─── Section ─────────────────────────────────────────────────────────────────

const liveCount = INNOVATIONS.filter(i => i.publicBucket === 'available_today').length;
const architectedCount = INNOVATIONS.filter(i => i.publicBucket === 'architected_for_release').length;
const researchCount = INNOVATIONS.filter(i => i.publicBucket === 'research').length;

export function ResearchSection() {
  const [capabilitiesOpen, setCapabilitiesOpen] = useState(false);
  const byBucket = (key: PublicBucket) => INNOVATIONS.filter(i => i.publicBucket === key);

  return (
    <section id="research" className="relative py-24 sm:py-32 px-4 bg-maia-navy-950">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <SectionReveal>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-extralight tracking-wide text-white text-center mb-4"
            style={{ fontFamily: "'Crimson Pro', serif" }}
          >
            Why MAIA feels different
          </h2>
          <p className="text-white/40 text-center text-sm max-w-xl mx-auto mb-16" style={{ fontFamily: "'Source Sans Pro', sans-serif" }}>
            These are not settings or preferences. They are the operating conditions built into MAIA by design.
          </p>
        </SectionReveal>

        {/* Principles grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
          {PRINCIPLES.map((p, i) => (
            <SectionReveal key={p.title} delay={0.06 * i}>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-7 h-full flex flex-col">
                <h3
                  className="text-base font-semibold text-white mb-3 leading-tight"
                  style={{ fontFamily: "'Source Sans Pro', sans-serif" }}
                >
                  {p.title}
                </h3>
                <p className="text-white/40 text-sm leading-relaxed flex-1" style={{ fontFamily: "'Source Sans Pro', sans-serif" }}>
                  {p.body}
                </p>
              </div>
            </SectionReveal>
          ))}
        </div>

        {/* Expandable capabilities */}
        <SectionReveal delay={0.1}>
          <div className="border-t border-white/8 pt-10">
            <button
              type="button"
              onClick={() => setCapabilitiesOpen(v => !v)}
              className="group flex items-center gap-3 mx-auto text-white/40 hover:text-white/70 transition-colors"
            >
              <span className="text-sm tracking-widest uppercase" style={{ fontFamily: "'Source Sans Pro', sans-serif" }}>
                Explore all capabilities
              </span>
              <span className="text-xs text-white/25">
                {liveCount} live · {architectedCount} architected · {researchCount} research
              </span>
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-300 ${capabilitiesOpen ? 'rotate-180' : ''}`}
              />
            </button>

            <div
              className="grid transition-all duration-500 ease-out"
              style={{ gridTemplateRows: capabilitiesOpen ? '1fr' : '0fr' }}
            >
              <div className="overflow-hidden">
                <div className="pt-12">
                  {BUCKETS.map((bucket, bucketIndex) => {
                    const items = byBucket(bucket.key);
                    if (items.length === 0) return null;

                    return (
                      <div key={bucket.key} className={bucketIndex > 0 ? 'mt-20' : ''}>
                        <div className="mb-8">
                          <h3
                            className="text-xl sm:text-2xl font-light tracking-wide text-white/80 mb-3"
                            style={{ fontFamily: "'Crimson Pro', serif" }}
                          >
                            {bucket.heading}
                          </h3>
                          <p
                            className="text-white/50 text-sm mb-2"
                            style={{ fontFamily: "'Source Sans Pro', sans-serif" }}
                          >
                            {bucket.definition}
                          </p>
                          {bucket.intro && (
                            <p
                              className="text-white/35 text-sm leading-relaxed max-w-2xl"
                              style={{ fontFamily: "'Source Sans Pro', sans-serif" }}
                            >
                              {bucket.intro}
                            </p>
                          )}
                          <div className="mt-4 h-px w-16 bg-white/10" />
                        </div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                          {items.map(innovation => (
                            <InnovationCard key={innovation.title} innovation={innovation} />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
