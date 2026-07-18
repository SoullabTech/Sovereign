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
            <p>MAIA will never ask you to surrender your judgment.</p>

            <p>She won&apos;t pretend certainty where none exists.</p>

            <p>She won&apos;t manufacture intimacy or authority.</p>

            <p>
              She will always make clear what she knows, what she infers,
              and what belongs to you.
            </p>

            <p className="text-white/40">
              Her purpose is to help you remember, reflect, create, and grow —
              while your life remains your own.
            </p>
          </div>

          <div className="mt-10 h-px w-12 bg-white/10 mx-auto" />

          <div className="mt-10 text-center space-y-6">
            <p className="text-white/35 text-base font-light leading-relaxed" style={{ fontFamily: "'Source Sans Pro', sans-serif" }}>
              If this feels like the kind of relationship with technology you&apos;ve been looking for,
              we&apos;d be honored to welcome you.
            </p>
            <a
              href="/enter"
              className="inline-flex items-center justify-center rounded-xl px-8 py-3.5 bg-maia-spice-500 hover:bg-maia-spice-400 text-black font-semibold text-base transition-colors shadow-lg shadow-maia-spice-500/20"
            >
              Begin a conversation
            </a>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
