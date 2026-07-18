'use client';

import Link from 'next/link';
import { SectionReveal } from './SectionReveal';

export function BookAnnouncement() {
  return (
    <section id="book" className="relative py-24 sm:py-32 px-4 bg-maia-navy-950">
      <div className="max-w-5xl mx-auto">
        <SectionReveal>
          <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-10 lg:gap-16 items-center">
            <div className="flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[320px] sm:max-w-[360px]">
                <div
                  aria-hidden="true"
                  className="absolute -inset-6 rounded-2xl blur-2xl opacity-40"
                  style={{
                    background:
                      'radial-gradient(closest-side, rgba(240,185,92,0.35), rgba(240,185,92,0))',
                  }}
                />
                <img
                  src="/book-studio/elemental-alchemy-cover.jpg"
                  alt="Elemental Alchemy book cover by Kelly W. Nezat"
                  className="relative block w-full rounded-md shadow-2xl ring-1 ring-amber-200/15"
                />
              </div>
            </div>

            <div className="text-center lg:text-left">
              <p className="text-amber-200/55 text-[11px] tracking-[0.3em] uppercase mb-5">
                From Soullab Press
              </p>
              <h2
                className="text-4xl sm:text-5xl font-extralight tracking-wide text-amber-50 mb-3"
                style={{ fontFamily: "'Crimson Pro', serif" }}
              >
                Elemental Alchemy
              </h2>
              <p className="text-amber-200/65 text-sm sm:text-base font-light italic mb-7">
                by Kelly Nezat &middot; available now in Kindle, paperback, and hardcover
              </p>
              <div
                className="text-white/75 text-lg sm:text-xl leading-relaxed font-light max-w-xl mx-auto lg:mx-0 mb-8 space-y-4"
                style={{ fontFamily: "'Crimson Pro', serif" }}
              >
                <p>
                  <em>Elemental Alchemy</em> is initiatory philosophy and symbolic phenomenology — a field guide to consciousness, transformation, and elemental becoming.
                </p>
                <p className="text-white/65 text-base sm:text-lg">
                  Written over years of lived practice, research, and refinement, the book forms part of the philosophical ground beneath MAIA, Pro Studio, and Book Studio.
                </p>
              </div>
              <Link
                href="/book-studio/read"
                className="inline-flex items-center gap-2 rounded-full border border-amber-200/30 bg-amber-200/[0.04] px-6 py-3 text-sm tracking-wide text-amber-100/90 transition-all duration-300 hover:bg-amber-200/[0.08] hover:border-amber-200/50"
              >
                Read free preview
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
