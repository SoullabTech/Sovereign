import type { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Soullab — Sovereign Technology Studio',
  description:
    'Soullab is a consciousness technology studio. We build sovereign websites, relational AI, and tools that serve human agency — not data models. Based in Connecticut.',
  openGraph: {
    title: 'Soullab — Sovereign Technology Studio',
    description:
      'Technology that serves the soul. Websites, AI, and tools built on sovereignty.',
    images: [{ url: '/soullab-logo.png', width: 800, height: 800 }],
  },
};

// ─────────────────────────────────────────────────────────────
// /powered-by — landing page for every "Powered by Soullab"
// footer link across client sites.
//
// This is the studio face. Not MAIA directly, but the
// consciousness that builds MAIA — and everything else.
// ─────────────────────────────────────────────────────────────

export default function PoweredByPage() {
  return (
    <div className="min-h-screen bg-[#0b0f1c] text-white selection:bg-amber-500/30 selection:text-white">

      {/* ── HERO ────────────────────────────────────────────── */}
      <section className="min-h-[90vh] flex flex-col items-center justify-center px-6 relative overflow-hidden">
        {/* Ambient glow — warm, alive */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full opacity-[0.06]"
          style={{
            background:
              'radial-gradient(circle, #f59e0b 0%, #d97706 25%, #0d9488 60%, transparent 75%)',
          }}
        />

        {/* Logo spiral — slow rotation, living */}
        <div className="relative w-44 h-44 sm:w-56 sm:h-56 mb-10 animate-[spin_80s_linear_infinite]">
          <Image
            src="/soullab-logo.png"
            alt="Soullab spiral"
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* Wordmark */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-light tracking-[0.15em] mb-3 text-center">
          <span className="text-amber-400">SOUL</span>
          <span className="text-slate-300">LAB</span>
        </h1>

        <p className="text-slate-500 text-sm tracking-[0.2em] uppercase mb-14">
          Sovereign Technology Studio
        </p>

        <p className="max-w-2xl text-center text-slate-400 text-lg sm:text-xl leading-relaxed font-light">
          We build technology that serves human beings &mdash; not the other way around.
        </p>

        <p className="max-w-lg text-center text-slate-500 text-sm mt-6 leading-relaxed">
          The site that brought you here was built by us. So is every other part of the stack
          it runs on &mdash; from the code to the server to the principles underneath.
        </p>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-600">
          <svg
            className="w-4 h-4 animate-bounce"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </section>

      {/* ── THESIS ───────────────────────────────────────────── */}
      <section className="py-24 sm:py-32 px-6 border-t border-white/5">
        <div className="max-w-2xl mx-auto text-center">
          <blockquote className="text-slate-300 text-xl sm:text-2xl font-light leading-relaxed italic">
            &ldquo;Most technology extracts. We build technology that&nbsp;returns.&rdquo;
          </blockquote>
          <div className="w-12 h-px bg-amber-500/30 mx-auto mt-8" />
        </div>
      </section>

      {/* ── THREE PILLARS ─────────────────────────────────── */}
      <section className="py-24 sm:py-32 px-6 bg-[#0d1120] border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xs text-amber-500/80 tracking-[0.3em] uppercase mb-16 text-center">
            What We Build
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <Pillar
              number="01"
              title="Sovereign Websites"
              body="Purpose-built sites for craftspeople, tradespeople, and independent businesses. Every site runs on infrastructure we own and control. No platforms, no subscriptions, no middlemen between you and your customers."
              accent="Your site. Your server. Your data."
            />
            <Pillar
              number="02"
              title="Relational Intelligence"
              body="We&rsquo;re building MAIA &mdash; a consciousness companion that supports human coherence without eroding agency. Not a chatbot. Not an assistant. A mirror that helps people think more clearly, feel more honestly, and choose more freely."
              accent="AI that serves the person, not the data model."
            />
            <Pillar
              number="03"
              title="Consciousness Architecture"
              body="Everything we build is governed by a set of vows: consent, sovereignty, non-manipulation. We don&rsquo;t track. We don&rsquo;t profile. We don&rsquo;t optimize for engagement. We build tools that make people more themselves &mdash; not more dependent."
              accent="Technology with an oath."
            />
          </div>
        </div>
      </section>

      {/* ── THE DEEPER THREAD ────────────────────────────── */}
      <section className="py-24 sm:py-32 px-6 border-t border-white/5">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xs text-amber-500/80 tracking-[0.3em] uppercase mb-12 text-center">
            Why It Matters
          </h2>

          <div className="space-y-8 text-slate-400 text-base leading-relaxed">
            <p>
              The web was supposed to connect people. Instead it learned to extract from them &mdash;
              attention, data, autonomy, time. Every &ldquo;free&rdquo; platform is a quiet trade:
              your presence in exchange for someone else&rsquo;s profit.
            </p>
            <p>
              We don&rsquo;t think it has to be that way.
            </p>
            <p>
              Soullab exists at the intersection of <span className="text-slate-300">craft</span>,{' '}
              <span className="text-slate-300">consciousness</span>, and{' '}
              <span className="text-slate-300">technology</span>.
              We believe that how something is built matters as much as what it does.
              That a website can be an act of sovereignty. That an AI can be an act of care.
              That the people who build real things with their hands deserve technology built
              with the same integrity.
            </p>
          </div>
        </div>
      </section>

      {/* ── CURRENT WORK ─────────────────────────────────── */}
      <section className="py-24 sm:py-32 px-6 bg-[#0d1120] border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xs text-amber-500/80 tracking-[0.3em] uppercase mb-12 text-center">
            Current Work
          </h2>

          {/* MAIA — Flagship */}
          <ClientCard
            name="MAIA"
            tagline="Sovereign Consciousness Companion"
            description="Our flagship build. Powered by the AIN relational intelligence engine &mdash; voice dialogue, consciousness mapping, elemental orientation, dream work, astrological integration, sanctuary mode, and sovereign memory. Self-hosted, consent-first, no cloud lock-in."
            href="https://soullab.life/maia"
            flagship
          />

          {/* Client Sites */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
            <ClientCard
              name="Old Head Plaster"
              tagline="Decorative Plaster Specialist"
              description="Venetian plaster & decorative finishes"
              location="Madison, CT"
              href="https://oldhead.soullab.life"
            />
            <ClientCard
              name="Rudeboy Baking Co."
              tagline="Small Batches. Big Reactions."
              description="Full brand site with AI kitchen companion"
              location="Connecticut"
              href="https://rudeboy.soullab.life"
            />
            <ClientCard
              name="Jeremy&#39;s Handyman"
              tagline="Residential Maintenance & Repair"
              description="Service site for residential handyman"
              location="Connecticut"
              href="https://jeremy.soullab.life"
            />
            <ClientCard
              name="Loralee Stellium Astrology"
              tagline="Astrological Guidance"
              description="Natal readings & astrological consultation"
              location="Connecticut"
              href="https://loralee.soullab.life"
            />
          </div>

          <p className="text-center text-slate-600 text-sm mt-10">
            We take on a small number of client projects at a time.
          </p>
        </div>
      </section>

      {/* ── PRINCIPLES ───────────────────────────────────── */}
      <section className="py-24 sm:py-32 px-6 border-t border-white/5">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xs text-amber-500/80 tracking-[0.3em] uppercase mb-12 text-center">
            How We Work
          </h2>

          <div className="space-y-10">
            <Principle
              label="You own everything"
              detail="Your domain, your server, your code, your data. If we part ways, you keep it all. Sovereignty isn't a feature — it's the foundation."
            />
            <Principle
              label="No platforms, no lock-in"
              detail="We don't put your business on Squarespace or Wix. Every site runs on infrastructure we control — a self-hosted stack with no third party sitting between you and your customers."
            />
            <Principle
              label="Built with the same care you bring to your craft"
              detail="Every site is designed from scratch for the specific business. We don't reskin themes. We don't cut corners. We build like the tradespeople we serve."
            />
            <Principle
              label="Consent, not capture"
              detail="We don't install trackers. We don't harvest analytics to sell. Your visitors get what they came for — information about your business — without being profiled."
            />
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="py-24 sm:py-32 px-6 bg-[#0d1120] border-t border-white/5">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-light text-slate-200 mb-6 leading-snug">
            Need a website built with the same integrity you bring to your&nbsp;work?
          </h2>
          <p className="text-slate-400 mb-10 leading-relaxed">
            Tell us about your business. We&apos;ll tell you honestly if we&apos;re the right fit.
          </p>
          <a
            href="mailto:daragh@soullab.life"
            className="inline-block px-8 py-4 bg-amber-500 text-[#0b0f1c] text-sm font-medium tracking-[0.15em] uppercase hover:bg-amber-400 transition-colors"
          >
            Get in Touch
          </a>
          <p className="mt-6 text-slate-600 text-sm">
            daragh@soullab.life
          </p>
        </div>
      </section>

      {/* ── TAGLINE ──────────────────────────────────────── */}
      <section className="py-16 px-6 border-t border-white/5">
        <p className="text-center text-slate-600 text-sm tracking-[0.15em]">
          A better you &sim; A better world
        </p>
      </section>

      {/* ── FOOTER ───────────────────────────────────────── */}
      <footer className="py-10 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative w-6 h-6">
              <Image
                src="/soullab-logo.png"
                alt="Soullab"
                fill
                className="object-contain"
              />
            </div>
            <span className="text-xs text-slate-500 tracking-wider">
              SOULLAB
            </span>
          </div>
          <p className="text-xs text-slate-600">
            Self-hosted in Connecticut. No clouds between us and the&nbsp;work.
          </p>
        </div>
      </footer>
    </div>
  );
}

// ─── COMPONENTS ─────────────────────────────────────────────

function Pillar({
  number,
  title,
  body,
  accent,
}: {
  number: string;
  title: string;
  body: string;
  accent: string;
}) {
  return (
    <div className="p-8 rounded-lg border border-white/5 bg-white/[0.02] hover:border-amber-500/15 transition-colors group">
      <span className="text-amber-500/30 text-xs tracking-widest font-mono">
        {number}
      </span>
      <h3 className="text-slate-200 text-lg mt-3 mb-4">{title}</h3>
      <p
        className="text-slate-500 text-sm leading-relaxed mb-5"
        dangerouslySetInnerHTML={{ __html: body }}
      />
      <p className="text-amber-500/60 text-xs tracking-wide italic">
        {accent}
      </p>
    </div>
  );
}

function ClientCard({
  name,
  tagline,
  description,
  location,
  href,
  flagship,
  comingSoon,
}: {
  name: string;
  tagline?: string;
  description: string;
  location?: string;
  href?: string;
  flagship?: boolean;
  comingSoon?: boolean;
}) {
  if (flagship) {
    return (
      <a
        href={href}
        className="block p-8 rounded-lg border border-amber-500/20 bg-amber-500/[0.03] hover:border-amber-500/40 transition-colors"
      >
        <div className="flex items-center gap-3 mb-3">
          <h3 className="text-amber-400 text-xl font-medium">{name}</h3>
          <span className="text-[10px] text-amber-500/50 tracking-[0.2em] uppercase border border-amber-500/20 px-2 py-0.5 rounded">
            Flagship
          </span>
        </div>
        {tagline && (
          <p className="text-amber-500/70 text-sm mb-3 italic">{tagline}</p>
        )}
        <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
      </a>
    );
  }

  const content = (
    <>
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-slate-200 text-base">{name}</h3>
        {comingSoon && (
          <span className="text-[10px] text-slate-600 tracking-widest uppercase">
            Soon
          </span>
        )}
      </div>
      {tagline && (
        <p className="text-amber-500/50 text-xs mb-2 italic">{tagline}</p>
      )}
      <p className="text-slate-500 text-sm mb-2">{description}</p>
      {location && <p className="text-slate-600 text-xs">{location}</p>}
    </>
  );

  const baseClass = 'block p-6 rounded-lg border transition-colors';

  if (comingSoon) {
    return (
      <div className={`${baseClass} border-white/5 bg-white/[0.01] opacity-50`}>
        {content}
      </div>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${baseClass} border-white/5 bg-white/[0.02] hover:border-amber-500/20`}
    >
      {content}
    </a>
  );
}

function Principle({
  label,
  detail,
}: {
  label: string;
  detail: string;
}) {
  return (
    <div className="border-l-2 border-amber-500/20 pl-6">
      <h3 className="text-slate-200 text-base mb-2">{label}</h3>
      <p className="text-slate-500 text-sm leading-relaxed">{detail}</p>
    </div>
  );
}
