'use client';

import Link from 'next/link';

/**
 * AuditFunnelSections — Homepage audit narrative
 *
 * Arc: Who (selective) → Why (undeniable) → What (concrete) → How (clear) → Recognition → CTA
 */

const WHO = [
  { label: 'Founders navigating complexity', sub: 'The system is growing but something structural isn\'t holding' },
  { label: 'Creators who feel underexpressed', sub: 'Vision is clear — translation keeps breaking down' },
  { label: 'Operators carrying misaligned structure', sub: 'The work functions. It doesn\'t feel like yours.' },
  { label: 'Guides working with others', sub: 'You help people see clearly. Something stays unnamed in yourself.' },
  { label: 'People at a transition point', sub: 'You know something isn\'t aligned. You can\'t yet see what.' },
];

const WHAT_YOU_RECEIVE = [
  { label: 'Core identity vs. presentation mapping', sub: 'Where you are vs. how you show up — and what fills the gap' },
  { label: '2–3 structural tensions', sub: 'The specific frictions currently shaping your decisions and behavior' },
  { label: 'Pattern distortions', sub: 'Where energy is looping, compensating, or misdirected' },
  { label: 'Elemental balance map', sub: 'What\'s overdeveloped, what\'s dormant, what that costs you across domains' },
  { label: '3 high-leverage structural shifts', sub: 'Not behavioral tweaks — changes at the level that actually holds' },
  { label: '30-day integration path', sub: 'Concrete starting points mapped to your specific configuration' },
];

const STEPS = [
  {
    n: '1',
    label: 'Complete a focused intake',
    sub: '10–15 minutes. Seven questions about how you work, what you\'re building, and where friction keeps appearing.',
  },
  {
    n: '2',
    label: 'MAIA analyzes your structure',
    sub: 'Pattern recognition, elemental mapping, distortion analysis. Not a personality type — a structural read of how your system is actually running.',
  },
  {
    n: '3',
    label: 'Your audit is generated and refined',
    sub: 'Eight structured sections. Specific and named. Not generic insight — your actual configuration, in language you\'ll recognize.',
  },
  {
    n: '4',
    label: 'You receive a clear report with next steps',
    sub: 'Immediately available. Yours to keep. You decide what to do with it — continue with MAIA, bring it to a partner field, or work with it independently.',
  },
];

export function AuditFunnelSections() {
  return (
    <>
      {/* Who it's for — selective */}
      <section className="py-24 px-6 bg-stone-950">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-amber-500/60 mb-6">Who this is for</p>
          <h2 className="text-2xl sm:text-3xl font-light text-stone-100 mb-5 leading-snug">
            People who already sense a deeper pattern
            <br />
            <span className="text-stone-400">shaping their decisions — but can't yet see it clearly.</span>
          </h2>
          <div className="space-y-3 mb-10">
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
          <p className="text-stone-600 text-sm border-l border-stone-800 pl-4">
            This is not for surface-level optimization or quick fixes.
          </p>
        </div>
      </section>

      {/* Why it helps — undeniable */}
      <section className="py-24 px-6 bg-stone-900/40">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-amber-500/60 mb-6">Why it helps</p>
          <h2 className="text-2xl sm:text-3xl font-light text-stone-100 mb-8 leading-snug">
            Most people try to change behavior without understanding
            <br />
            <span className="text-stone-400">the structure behind it.</span>
          </h2>
          <div className="space-y-5 text-stone-400 text-sm leading-relaxed">
            <p>
              That's why patterns return — even after insight, effort, or real progress.
              The behavior changes. The structure doesn't. Eventually the pattern reasserts itself.
            </p>
            <p>
              This audit shows the structure itself — the identity axis, the distortions under pressure,
              the elemental imbalances running across domains — so change can actually hold.
            </p>
          </div>
        </div>
      </section>

      {/* What you receive — concrete */}
      <section className="py-24 px-6 bg-stone-950">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-amber-500/60 mb-6">What you receive</p>
          <h2 className="text-2xl font-light text-stone-100 mb-10">
            A structured report. Eight sections. Specific to your configuration.
          </h2>
          <div className="space-y-5">
            {WHAT_YOU_RECEIVE.map(({ label, sub }) => (
              <div key={label} className="flex items-start gap-4">
                <span className="text-amber-500/40 mt-1 shrink-0 text-lg leading-none">·</span>
                <div>
                  <p className="text-stone-200 text-sm font-medium">{label}</p>
                  <p className="text-stone-500 text-sm mt-0.5 leading-relaxed">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The experience — reduce uncertainty */}
      <section className="py-24 px-6 bg-stone-900/40">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-amber-500/60 mb-6">The experience</p>
          <h2 className="text-2xl font-light text-stone-100 mb-3">
            Four steps. Start to audit in under fifteen minutes.
          </h2>
          <p className="text-stone-500 text-sm mb-12 leading-relaxed">
            No account required. Processed privately. The report is yours immediately.
          </p>
          <div className="space-y-10 mb-12">
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
          <p className="text-stone-600 text-sm border-l border-stone-800 pl-4">
            The more honestly you engage with the intake, the more precise the result will be.
          </p>
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

      {/* Recognition moment + CTA */}
      <section className="py-24 px-6 bg-stone-950 border-t border-stone-900">
        <div className="max-w-2xl mx-auto text-center space-y-5">
          <p className="text-stone-400 text-base font-light leading-relaxed max-w-sm mx-auto">
            Most people don't need more advice.
            <br />
            They need to see what's actually happening.
          </p>
          <div className="pt-4 space-y-3">
            <Link
              href="/audit"
              className="inline-flex items-center justify-center rounded-xl px-10 py-4 bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-sm tracking-wide transition-colors"
            >
              Request Your Identity Audit
            </Link>
            <p className="text-stone-600 text-xs">See your structure clearly.</p>
          </div>
        </div>
      </section>
    </>
  );
}
