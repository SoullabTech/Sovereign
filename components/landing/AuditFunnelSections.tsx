'use client';

import Link from 'next/link';

/**
 * AuditFunnelSections — Homepage audit narrative
 *
 * Arc: Who → Why → What you get → How it works → CTA
 */

const WHO = [
  { label: 'Founders', sub: 'Building something that needs to hold your full weight' },
  { label: 'Creators', sub: 'Vision is clear but execution keeps fragmenting' },
  { label: 'Guides & coaches', sub: 'You serve others well but something stays unnamed in yourself' },
  { label: 'Operators', sub: 'The system works but you\'re not sure it\'s yours' },
  { label: 'Anyone sensing a gap', sub: 'Between who you are, how you show up, and how things actually go' },
];

const WHAT_YOU_GET = [
  { label: 'Your identity axis', sub: 'The structure holding your decisions, attention, and energy' },
  { label: 'Pattern distortions', sub: 'Where your strengths loop back on themselves' },
  { label: 'Elemental balance map', sub: 'What\'s overdeveloped, what\'s dormant, what that costs you' },
  { label: '3 high-leverage shifts', sub: 'Structural, not behavioral — changes that hold' },
  { label: '30-day integration path', sub: 'Concrete starting points, not abstract advice' },
];

const STEPS = [
  {
    n: '1',
    label: 'Complete a short intake',
    sub: '5–10 minutes. Seven questions about how you work, what you\'re building, where you feel friction.',
  },
  {
    n: '2',
    label: 'MAIA analyzes your structure',
    sub: 'Pattern recognition, elemental mapping, and distortion analysis — not a personality type, a structural read.',
  },
  {
    n: '3',
    label: 'You receive your audit immediately',
    sub: 'Eight structured sections. Specific, named, and usable. Not generic insight — your actual configuration.',
  },
  {
    n: '4',
    label: 'You decide what to do with it',
    sub: 'Continue inside MAIA. Bring it to a partner field. Use it on your own. The audit is yours.',
  },
];

export function AuditFunnelSections() {
  return (
    <>
      {/* Who it's for */}
      <section className="py-24 px-6 bg-stone-950">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-amber-500/60 mb-6">Who this is for</p>
          <h2 className="text-2xl sm:text-3xl font-light text-stone-100 mb-4 leading-snug">
            People who know something deeper is happening
            <br />
            <span className="text-stone-400">but can't fully see it yet.</span>
          </h2>
          <p className="text-stone-500 text-sm mb-10 leading-relaxed">
            The audit is not for everyone. It's for people who are ready to look at structure — not seek
            motivation, reassurance, or a framework to fit themselves into.
          </p>
          <div className="space-y-3">
            {WHO.map(({ label, sub }) => (
              <div key={label} className="flex items-start gap-4 py-4 px-5 border border-stone-800/60 rounded">
                <span className="text-amber-500/40 mt-0.5 shrink-0 text-lg leading-none">·</span>
                <div>
                  <p className="text-stone-200 text-sm font-medium">{label}</p>
                  <p className="text-stone-500 text-sm mt-0.5">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why it's helpful */}
      <section className="py-24 px-6 bg-stone-900/40">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-amber-500/60 mb-6">Why it helps</p>
          <h2 className="text-2xl sm:text-3xl font-light text-stone-100 mb-6 leading-snug">
            Most systems try to improve behavior.
            <br />
            <span className="text-stone-400">Behavior is downstream of structure.</span>
          </h2>
          <div className="space-y-5 text-stone-400 text-sm leading-relaxed">
            <p>
              If your patterns keep returning — if the same tension shows up in different contexts,
              with different people, in different projects — it's not a discipline problem.
              It's a structural one.
            </p>
            <p>
              The audit maps what's actually running: your identity axis, how it meets the world,
              where it distorts under pressure, and what that costs you across domains.
            </p>
            <p>
              Once you can see the structure clearly, the shifts that actually hold become obvious.
            </p>
          </div>
        </div>
      </section>

      {/* What you get */}
      <section className="py-24 px-6 bg-stone-950">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-amber-500/60 mb-6">What you receive</p>
          <h2 className="text-2xl font-light text-stone-100 mb-10">
            A high-resolution map of how your system actually works.
          </h2>
          <div className="space-y-4">
            {WHAT_YOU_GET.map(({ label, sub }) => (
              <div key={label} className="flex items-start gap-4">
                <span className="text-amber-500/40 mt-1 shrink-0 text-lg leading-none">·</span>
                <div>
                  <p className="text-stone-200 text-sm font-medium">{label}</p>
                  <p className="text-stone-500 text-sm mt-0.5">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works — the experience */}
      <section className="py-24 px-6 bg-stone-900/40">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-amber-500/60 mb-6">The experience</p>
          <h2 className="text-2xl font-light text-stone-100 mb-3">
            Four steps. Start to audit in under ten minutes.
          </h2>
          <p className="text-stone-500 text-sm mb-12">
            No account required. Your intake is processed privately. The report is yours to keep.
          </p>
          <div className="space-y-10">
            {STEPS.map(({ n, label, sub }) => (
              <div key={n} className="flex gap-6">
                <span className="text-3xl font-extralight text-stone-700 shrink-0 w-7 leading-tight">{n}</span>
                <div>
                  <p className="text-stone-200 text-sm font-medium">{label}</p>
                  <p className="text-stone-500 text-sm mt-1.5 leading-relaxed">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What people say */}
      <section className="py-20 px-6 bg-stone-950">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-amber-500/60 mb-10">What people say</p>
          <blockquote className="border-l-2 border-amber-500/30 pl-6">
            <p className="text-stone-300 text-lg font-light leading-relaxed italic">
              "This described something I've never been able to articulate."
            </p>
            <footer className="mt-4 text-xs text-stone-600">Early audit participant</footer>
          </blockquote>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-stone-950 border-t border-stone-900">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-2xl font-light text-stone-100">
            Ready to see your structure clearly?
          </h2>
          <p className="text-stone-500 text-sm max-w-sm mx-auto leading-relaxed">
            No account required. Takes 5–10 minutes. Your audit is generated immediately.
          </p>
          <Link
            href="/audit"
            className="inline-flex items-center justify-center rounded-xl px-10 py-4 bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-sm tracking-wide transition-colors"
          >
            Start Your Identity Audit
          </Link>
        </div>
      </section>
    </>
  );
}
