'use client';

import { SectionReveal } from './SectionReveal';

/**
 * Client fields — current builds with practitioners, and the open-field
 * direction. Register: in-build cards are experiential and claim-disciplined;
 * the open-source paragraph is voiced as preparation, not released capability.
 */
export function PastSitesSection() {
  return (
    <section id="past-sites" className="relative py-20 sm:py-24 px-4 bg-maia-navy-950 border-t border-white/5">
      <div className="max-w-4xl mx-auto">
        <SectionReveal>
          <p className="text-white/35 text-center text-[11px] tracking-[0.3em] uppercase mb-3">
            Fields built with clients
          </p>
          <h2
            className="text-2xl sm:text-3xl font-extralight tracking-wide text-white/80 text-center mb-4"
            style={{ fontFamily: "'Crimson Pro', serif" }}
          >
            Every field begins with a person
          </h2>
          <p
            className="text-white/45 text-center text-sm sm:text-base leading-relaxed max-w-xl mx-auto mb-12 font-light italic"
            style={{ fontFamily: "'Crimson Pro', serif" }}
          >
            We build living fields with practitioners, teachers, and guides — each one authored
            around a real practice and the people it serves.
          </p>
        </SectionReveal>

        <SectionReveal>
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
              <div className="flex items-baseline justify-between gap-3 flex-wrap mb-3">
                <h3
                  className="text-white/90 text-xl sm:text-2xl font-extralight tracking-wide"
                  style={{ fontFamily: "'Crimson Pro', serif" }}
                >
                  Now What? — a flourishing platform
                </h3>
                <span className="text-white/25 text-[11px] tracking-widest uppercase">
                  With Larry Closs · In active build
                </span>
              </div>
              <p
                className="text-white/50 text-sm sm:text-base leading-relaxed font-light"
                style={{ fontFamily: "'Source Sans Pro', sans-serif" }}
              >
                Built with Larry Closs — a CEO transitioning to executive coach for those seeking
                to flourish, drawing on his study in Harvard&rsquo;s positive psychology certification
                program. Now What? is a developmental environment for people who have achieved much
                and are asking what comes next — with Larry&rsquo;s practice, presence, and
                accompaniment at its center.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
              <div className="flex items-baseline justify-between gap-3 flex-wrap mb-3">
                <h3
                  className="text-white/90 text-xl sm:text-2xl font-extralight tracking-wide"
                  style={{ fontFamily: "'Crimson Pro', serif" }}
                >
                  Wisdom Keeper — a living practice field
                </h3>
                <span className="text-white/25 text-[11px] tracking-widest uppercase">
                  With Jondi Whitis · In development
                </span>
              </div>
              <p
                className="text-white/50 text-sm sm:text-base leading-relaxed font-light"
                style={{ fontFamily: "'Source Sans Pro', sans-serif" }}
              >
                In development with Jondi Whitis — EFT master teacher with eighteen-plus years in
                energy medicine, known to her students as the People&rsquo;s Teacher. The Wisdom
                Keeper field gathers her method, discernment, and practitioner self-awareness into
                a living environment, so that what she has spent decades learning to see can keep
                teaching.
              </p>
            </div>
          </div>
          <p
            className="text-white/40 text-center text-sm sm:text-base font-light italic mt-8"
            style={{ fontFamily: "'Crimson Pro', serif" }}
          >
            And more fields are taking shape.
          </p>
        </SectionReveal>

        <SectionReveal>
          <div className="mt-20 text-center">
            <p className="text-white/35 text-[11px] tracking-[0.3em] uppercase mb-6">
              Where this is going
            </p>
            <h3
              className="text-2xl sm:text-3xl font-extralight tracking-wide text-white/90 mb-8"
              style={{ fontFamily: "'Crimson Pro', serif" }}
            >
              Becoming an open field
            </h3>
            <div
              className="space-y-5 text-lg sm:text-xl font-extralight leading-relaxed text-white/65 max-w-2xl mx-auto"
              style={{ fontFamily: "'Crimson Pro', serif" }}
            >
              <p>
                We are preparing this platform to become an open-source field — a commons where
                inspired work can find its way into the world and reach the people it was made
                to serve.
              </p>
              <p className="text-white/50">
                Practitioners, teachers, and guides will be able to author living fields of their
                own: sovereign, consent-governed, and fully theirs.
              </p>
              <p className="text-white/75 italic">
                We steward this architecture so that one day it can be given.
              </p>
            </div>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
