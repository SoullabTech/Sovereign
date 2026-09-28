'use client';

import { SectionReveal } from './SectionReveal';

export function CovenantSection() {
  return (
    <section
      id="covenant"
      className="relative py-24 sm:py-32 px-4"
      style={{
        background: 'linear-gradient(180deg, #0b0f1c 0%, #080c18 100%)',
      }}
    >
      <div className="max-w-xl mx-auto">
        <SectionReveal>
          <p className="text-[11px] tracking-[0.35em] uppercase text-white/25 text-center mb-12">
            Before you begin
          </p>

          <div className="space-y-5 text-base sm:text-lg font-light leading-relaxed text-white/60" style={{ fontFamily: "'Crimson Pro', serif" }}>
            <p>Soullab will not ask you to surrender your judgment in exchange for intelligence.</p>

            <p>MAIA will not pretend certainty where none exists or manufacture intimacy or authority.</p>

            <p>Your writing remains your writing. Your relationships remain human relationships. Your symbols remain open to your own meaning.</p>

            <p>
              Sources, memories, interpretations, and inferences should remain distinguishable enough for you to question them.
            </p>

            <p className="text-white/40">
              The purpose of the field is not to keep you inside it. It is to help you return to your life with more presence, choice, and continuity.
            </p>
          </div>

          <div className="mt-10 h-px w-12 bg-white/10 mx-auto" />

          <div className="mt-10 text-center space-y-6">
            <p className="text-white/35 text-base font-light leading-relaxed" style={{ fontFamily: "'Source Sans Pro', sans-serif" }}>
              If this feels like the kind of relationship with technology you&apos;ve been looking for,
              enter Soullab and make the field your own.
            </p>
            <a
              href="/home"
              className="inline-flex items-center justify-center rounded-xl px-8 py-3.5 bg-maia-spice-500 hover:bg-maia-spice-400 text-black font-semibold text-base transition-colors shadow-lg shadow-maia-spice-500/20"
            >
              Enter Soullab
            </a>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
