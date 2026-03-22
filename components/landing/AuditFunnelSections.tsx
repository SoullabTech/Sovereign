'use client';

import Link from 'next/link';

/**
 * AuditFunnelSections — Homepage sections 2–6
 *
 * What this is → What you get → Proof → How it works → CTA repeat
 */

export function AuditFunnelSections() {
  return (
    <>
      {/* Section 2 — What this is */}
      <section className="py-24 px-6 bg-stone-950">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-amber-500/60 mb-6">What this is</p>
          <h2 className="text-2xl sm:text-3xl font-light text-stone-100 mb-6 leading-snug">
            Most systems try to improve behavior.
            <br />
            <span className="text-stone-400">We analyze structure.</span>
          </h2>
          <div className="grid grid-cols-2 gap-4 mt-10">
            {[
              'Identity vs. expression',
              'Pattern distortions',
              'Elemental imbalances',
              'Strategic realignment',
            ].map((item) => (
              <div
                key={item}
                className="py-4 px-5 border border-stone-800 rounded text-sm text-stone-400"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3 — What you get */}
      <section className="py-24 px-6 bg-stone-900/40">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-amber-500/60 mb-6">What you get</p>
          <h2 className="text-2xl font-light text-stone-100 mb-10">
            A high-resolution map of how your system actually works.
          </h2>
          <ul className="space-y-4">
            {[
              'Clear diagnosis of your current structure',
              'Where you\'re misaligned or split',
              'What\'s overdeveloped or underused',
              '3 high-leverage shifts',
              'A 30-day integration path',
            ].map((item) => (
              <li key={item} className="flex gap-4 text-sm text-stone-300">
                <span className="text-amber-500/50 mt-0.5 shrink-0">·</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Section 4 — Proof */}
      <section className="py-24 px-6 bg-stone-950">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-amber-500/60 mb-10">
            What people say
          </p>
          <blockquote className="border-l-2 border-amber-500/30 pl-6">
            <p className="text-stone-300 text-lg font-light leading-relaxed italic">
              "This described something I've never been able to articulate."
            </p>
            <footer className="mt-4 text-xs text-stone-600">
              Early audit participant
            </footer>
          </blockquote>
        </div>
      </section>

      {/* Section 5 — How it works */}
      <section className="py-24 px-6 bg-stone-900/40">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-amber-500/60 mb-6">How it works</p>
          <h2 className="text-2xl font-light text-stone-100 mb-12">Four steps.</h2>
          <div className="space-y-8">
            {[
              { n: '1', label: 'Submit a short intake', sub: '5–10 minutes. Answer as honestly as you can.' },
              { n: '2', label: 'MAIA analyzes your structure', sub: 'Pattern recognition, elemental mapping, distortion analysis.' },
              { n: '3', label: 'You receive a high-resolution audit', sub: 'Structured, specific, and immediately usable.' },
              { n: '4', label: 'Continue inside your field', sub: 'Deepen the work with MAIA or in a partner field.' },
            ].map(({ n, label, sub }) => (
              <div key={n} className="flex gap-6">
                <span className="text-2xl font-light text-stone-700 shrink-0 w-6">{n}</span>
                <div>
                  <p className="text-stone-200 text-sm font-medium">{label}</p>
                  <p className="text-stone-500 text-sm mt-1">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 6 — CTA repeat */}
      <section className="py-24 px-6 bg-stone-950 border-t border-stone-900">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-2xl font-light text-stone-100">
            Start with the Identity Audit.
          </h2>
          <p className="text-stone-500 text-sm">
            No account required. Takes 5–10 minutes.
          </p>
          <Link
            href="/audit"
            className="inline-flex items-center justify-center rounded-xl px-10 py-4 bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-sm tracking-wide transition-colors"
          >
            Request Audit
          </Link>
        </div>
      </section>
    </>
  );
}
