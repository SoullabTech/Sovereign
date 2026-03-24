'use client';

import Link from 'next/link';
import { SectionReveal } from './SectionReveal';

const PATHS = [
  { condition: 'Ongoing relationship', answer: 'MAIA', href: '/enter' },
  { condition: 'Build or integrate', answer: 'AIN', href: '#contact', scroll: true },
] as const;

export function StartHereSection() {
  return (
    <section className="py-16 sm:py-20 px-4 border-t border-white/[0.05]" style={{ background: '#0b0f1c' }}>
      <div className="max-w-3xl mx-auto">
        <SectionReveal>
          <p
            className="text-center text-white/25 text-xs tracking-widest uppercase mb-8"
          >
            Start here
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
            {PATHS.map((path) => (
              <div key={path.answer} className="flex items-center gap-2 text-sm">
                <span className="text-white/30">{path.condition}</span>
                <span className="text-white/15">&rarr;</span>
                {path.scroll ? (
                  <button
                    onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                    className="text-maia-spice-400 hover:text-maia-spice-300 font-medium transition-colors"
                  >
                    {path.answer}
                  </button>
                ) : (
                  <Link
                    href={path.href}
                    className="text-maia-spice-400 hover:text-maia-spice-300 font-medium transition-colors"
                  >
                    {path.answer}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
