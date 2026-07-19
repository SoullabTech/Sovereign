'use client';

import { SectionReveal } from './SectionReveal';

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
            className="text-3xl sm:text-4xl font-extralight tracking-wide text-white text-center mb-6"
            style={{ fontFamily: "'Crimson Pro', serif" }}
          >
            Work with Soullab
          </h2>
          <p className="text-white/50 text-center text-base max-w-xl mx-auto mb-8" style={{ fontFamily: "'Source Sans Pro', sans-serif" }}>
            Build &middot; Consult &middot; Collaborate — if you&rsquo;re making something real, let&rsquo;s talk.
          </p>
          <p className="text-center mb-4">
            <a
              href="mailto:hello@soullab.life"
              className="inline-flex items-center text-maia-spice-400 font-medium transition-colors group"
            >
              hello@soullab.life
              <span className="ml-2 group-hover:translate-x-1 transition-transform">&rarr;</span>
            </a>
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
