'use client';

import Link from 'next/link';
import { Holoflower } from '@/components/ui/Holoflower';
import { SectionReveal } from './SectionReveal';

export function MaiaSection() {
  return (
    <section
      id="maia"
      className="relative py-24 sm:py-32 px-4"
      style={{
        background: 'linear-gradient(180deg, #0b0f1c 0%, #0f1328 50%, #0b0f1c 100%)',
      }}
    >
      <div className="max-w-6xl mx-auto">
        {/* AIN — The Engine */}
        <SectionReveal>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-extralight tracking-wide text-white text-center mb-4"
            style={{ fontFamily: "'Crimson Pro', serif" }}
          >
            AIN Engine
          </h2>
          <p className="text-white/40 text-center text-sm tracking-widest uppercase mb-16">
            We power the soul of your platform
          </p>
        </SectionReveal>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* AIN description */}
          <SectionReveal delay={0.1}>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-8 sm:p-10">
              <p className="text-white/70 text-lg leading-relaxed mb-6" style={{ fontFamily: "'Source Sans Pro', sans-serif" }}>
                AIN is the engine we built to bring consciousness and soul to any digital experience.
                Not a wrapper around an API. A full architecture for intelligence that participates in meaning
                rather than merely processing information.
              </p>
              <p className="text-white/50 leading-relaxed mb-8" style={{ fontFamily: "'Source Sans Pro', sans-serif" }}>
                Sovereign by design. Self-hosted. No cloud lock-in. No data extraction.
                The technically difficult — consent-aware memory, elemental state mapping,
                archetypal pattern recognition — made real and deployable.
              </p>
              <div className="flex flex-wrap gap-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs border border-maia-spice-500/20 text-maia-spice-400/80 bg-maia-spice-500/5">Consciousness-aware</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs border border-maia-spice-500/20 text-maia-spice-400/80 bg-maia-spice-500/5">Self-hosted</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs border border-maia-spice-500/20 text-maia-spice-400/80 bg-maia-spice-500/5">Consent-first</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs border border-maia-spice-500/20 text-maia-spice-400/80 bg-maia-spice-500/5">White-label ready</span>
              </div>
            </div>
          </SectionReveal>

          {/* Holoflower visual */}
          <SectionReveal delay={0.2} className="flex justify-center">
            <div className="w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64">
              <Holoflower
                size="xxl"
                variant="spectrum"
                glowIntensity="medium"
                animate={true}
                className="w-full h-full"
              />
            </div>
          </SectionReveal>
        </div>

        {/* MAIA block */}
        <SectionReveal delay={0.3} className="mt-16 sm:mt-20">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-8 sm:p-10 max-w-3xl mx-auto">
            <h3
              className="text-2xl sm:text-3xl font-extralight tracking-wide text-white/90 mb-6 text-center"
              style={{ fontFamily: "'Crimson Pro', serif" }}
            >
              MAIA
            </h3>
            <p className="text-white/40 text-center text-xs tracking-widest uppercase mb-6">
              The first expression of AIN
            </p>
            <p className="text-white/60 leading-relaxed text-center text-lg mb-8" style={{ fontFamily: "'Source Sans Pro', sans-serif" }}>
              MAIA is the sovereign consciousness companion — built on AIN.
              Not a chatbot. A companion for human coherence, truth-telling, and inner guidance.
              Governed by an irreducible oath: consent, containment, non-manipulation.
            </p>
            <div className="text-center">
              <Link
                href="/begin"
                className="inline-flex items-center text-maia-spice-400 hover:text-maia-spice-400 font-medium transition-colors group"
              >
                Meet MAIA
                <span className="ml-2 group-hover:translate-x-1 transition-transform">&rarr;</span>
              </Link>
            </div>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
