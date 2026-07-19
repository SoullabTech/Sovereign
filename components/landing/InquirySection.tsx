'use client';

import { SectionReveal } from './SectionReveal';

/**
 * The question beneath the work — the inquiry Soullab is actually living:
 * how extraordinary experiences become enduring transformations.
 * Register: inquiry, not capability claim. Copy is red-line-gated (Kelly).
 */
export function InquirySection() {
  return (
    <section
      id="inquiry"
      className="relative py-24 sm:py-32 px-4"
      style={{
        background: 'linear-gradient(180deg, #0b0f1c 0%, #0d1020 50%, #0b0f1c 100%)',
      }}
    >
      <div className="max-w-2xl mx-auto">
        <SectionReveal>
          <p className="text-[11px] tracking-[0.35em] uppercase text-white/30 text-center mb-12">
            The question beneath the work
          </p>

          <h2 className="text-3xl sm:text-4xl font-extralight tracking-wide text-white text-center mb-12">
            What carries transformation forward?
          </h2>

          <div className="space-y-6 text-lg sm:text-xl font-extralight leading-relaxed text-white/70" style={{ fontFamily: "'Crimson Pro', serif" }}>
            <p>
              Extraordinary experiences change people. A retreat, a book, a birth,
              a conversation that rearranges how you see — for a while, everything
              is different.
            </p>

            <p className="text-white/55">
              Then ordinary life resumes. What was found tends to fade on re-entry —
              because what changed was real, but nothing was there to carry it.
            </p>

            <p className="text-white/55">
              Everything we build serves that threshold. Continuity with consent.
              Memory that serves coherence, never capture. Accompaniment that
              strengthens your own authority instead of replacing it.
            </p>

            <p className="text-white/80 italic">
              Extraordinary experiences may change people. The deeper question is
              what allows those changes to become a life.
            </p>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
