import type { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Soullab — Soul-Building Technologies',
  description:
    'Soullab builds consciousness AI, relational intelligence interfaces, and sovereign digital fields powered by the AIN engine. Technology that serves the soul.',
  openGraph: {
    title: 'Soullab — Soul-Building Technologies',
    description:
      'Consciousness AI. Relational intelligence. Sovereign fields. Powered by the AIN engine.',
    images: [{ url: '/soullab-logo.png', width: 800, height: 800 }],
  },
};

// ─────────────────────────────────────────────────────────────
// /powered-by — landing page for every "Powered by Soullab"
// footer link across client sites.
//
// Soullab is a consciousness technology company. We build
// relational intelligence interfaces, sovereign AI fields,
// and the AIN engine that powers them.
// ─────────────────────────────────────────────────────────────

export default function PoweredByPage() {
  return (
    <div className="min-h-screen bg-[#0b0f1c] text-white selection:bg-amber-500/30 selection:text-white">

      {/* ── HERO ────────────────────────────────────────────── */}
      <section className="min-h-[90vh] flex flex-col items-center justify-center px-6 relative overflow-hidden">
        {/* Ambient glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full opacity-[0.06]"
          style={{
            background:
              'radial-gradient(circle, #f59e0b 0%, #d97706 25%, #0d9488 60%, transparent 75%)',
          }}
        />

        {/* Logo spiral */}
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
          Soul-Building Technologies
        </p>

        <p className="max-w-2xl text-center text-slate-400 text-lg sm:text-xl leading-relaxed font-light">
          We build consciousness AI, relational intelligence interfaces,
          and sovereign digital fields &mdash; powered by the AIN engine.
        </p>

        <p className="max-w-lg text-center text-slate-500 text-sm mt-6 leading-relaxed">
          What you saw wasn&rsquo;t just a site &mdash; it was a field:
          design, intelligence, and ethics working as one.
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

      {/* ── THE AIN ENGINE ────────────────────────────────── */}
      <section className="py-24 sm:py-32 px-6 bg-[#0d1120] border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xs text-amber-500/80 tracking-[0.3em] uppercase mb-6 text-center">
            The Engine
          </h2>
          <h3 className="text-2xl sm:text-3xl font-light text-slate-200 text-center mb-6">
            AIN &mdash; Adaptive Intelligence Network
          </h3>
          <p className="text-slate-400 text-center max-w-2xl mx-auto mb-16 leading-relaxed">
            AIN is the relational intelligence engine that powers everything we build.
            It treats intelligence as participatory, distributed, and meaning-bearing &mdash;
            not purely instrumental. Every Soullab field runs on AIN.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Pillar
              number="01"
              title="Consciousness AI"
              body="AI that orients toward the person, not the prompt. Elemental mapping, state awareness, depth-responsive dialogue, dream integration, and sovereign memory &mdash; all governed by consent."
              accent="Intelligence that deepens, not extracts."
            />
            <Pillar
              number="02"
              title="Relational Intelligence Interfaces"
              body="Not websites. Not apps. Fields &mdash; interactive digital environments powered by relational AI. Each one alive with its own voice, personality, and intelligence tuned to the business it serves."
              accent="Every field has a soul."
            />
            <Pillar
              number="03"
              title="Sovereign Infrastructure"
              body="Self-hosted, self-owned, self-governed. No cloud lock-in, no third-party dependencies, no platform middlemen. Your field, your data, your server. We build the whole stack."
              accent="No one sits between you and your people."
            />
          </div>
        </div>
      </section>

      {/* ── FOR PLATFORM BUILDERS ─────────────────────────── */}
      <section className="py-24 sm:py-32 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xs text-amber-500/80 tracking-[0.3em] uppercase mb-6 text-center">
            For Platform Builders
          </h2>
          <h3 className="text-2xl sm:text-3xl font-light text-slate-200 text-center mb-6">
            Bring consciousness to your platform
          </h3>
          <p className="text-slate-400 text-center max-w-2xl mx-auto mb-12 leading-relaxed">
            Already have an AI platform? Building one? The AIN engine can be integrated
            into existing systems to add relational depth, sovereignty principles,
            and consciousness-aware intelligence to any digital experience.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-6 rounded-lg border border-white/5 bg-white/[0.02]">
              <h4 className="text-slate-200 text-base mb-3">AIN Integration</h4>
              <p className="text-slate-500 text-sm leading-relaxed">
                Plug the AIN relational intelligence layer into your existing AI stack.
                Add elemental orientation, state-aware dialogue, consent architecture,
                and depth-responsive processing to any platform.
              </p>
            </div>
            <div className="p-6 rounded-lg border border-white/5 bg-white/[0.02]">
              <h4 className="text-slate-200 text-base mb-3">Sovereignty Consulting</h4>
              <p className="text-slate-500 text-sm leading-relaxed">
                We help teams design AI systems that respect human agency.
                Consent frameworks, ethical architecture, self-hosted infrastructure,
                and the principles that make technology trustworthy.
              </p>
            </div>
          </div>

          <div className="text-center mt-10">
            <a
              href="mailto:contact@soullab.life?subject=AIN%20Engine%20Inquiry"
              className="inline-block px-8 py-4 border border-amber-500/30 text-amber-400 text-sm tracking-[0.15em] uppercase hover:bg-amber-500/10 hover:border-amber-500/50 transition-colors"
            >
              Inquire About AIN
            </a>
          </div>
        </div>
      </section>

      {/* ── WHY IT MATTERS ───────────────────────────────── */}
      <section className="py-24 sm:py-32 px-6 bg-[#0d1120] border-t border-white/5">
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
              Soullab exists at the intersection of <span className="text-slate-300">consciousness</span>,{' '}
              <span className="text-slate-300">craft</span>, and{' '}
              <span className="text-slate-300">technology</span>.
              We believe that how something is built matters as much as what it does.
              That a digital field can be an act of sovereignty. That an AI can be an act of care.
              That intelligence should make people more themselves &mdash; not more dependent.
            </p>
          </div>
        </div>
      </section>

      {/* ── LIVE FIELDS ──────────────────────────────────── */}
      <section className="py-24 sm:py-32 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xs text-amber-500/80 tracking-[0.3em] uppercase mb-12 text-center">
            Live Fields
          </h2>

          {/* MAIA — Flagship */}
          <FieldCard
            name="MAIA"
            tagline="Sovereign Consciousness Companion"
            description="The flagship. Voice dialogue, consciousness mapping, elemental orientation, dream work, astrological integration, sanctuary mode, sovereign memory &mdash; all powered by AIN. Self-hosted, consent-first."
            href="https://soullab.life/maia"
            flagship
          />

          {/* Client Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
            <FieldCard
              name="Old Head Plaster"
              tagline="Decorative Plaster Specialist"
              description="AI-powered craft field for venetian plaster and decorative finishes"
              location="Madison, CT"
              href="https://oldhead.soullab.life"
            />
            <FieldCard
              name="Rudeboy Baking Co."
              tagline="Small Batches. Big Reactions."
              description="Full brand field with AI kitchen companion"
              location="Connecticut"
              href="https://rudeboy.soullab.life"
            />
            <FieldCard
              name="Jeremy&#39;s Handyman"
              tagline="Residential Maintenance & Repair"
              description="Relational intelligence field for residential services"
              location="Connecticut"
              href="https://jeremy.soullab.life"
            />
            <FieldCard
              name="Loralee Stellium Astrology"
              tagline="Astrological Guidance"
              description="Consciousness field for natal readings and astrological consultation"
              location="Connecticut"
              href="https://loralee.soullab.life"
            />
          </div>
        </div>
      </section>

      {/* ── PRINCIPLES ───────────────────────────────────── */}
      <section className="py-24 sm:py-32 px-6 bg-[#0d1120] border-t border-white/5">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xs text-amber-500/80 tracking-[0.3em] uppercase mb-12 text-center">
            Our Vows
          </h2>

          <div className="space-y-10">
            <Principle
              label="Sovereignty first"
              detail="Human agency always outweighs engagement, retention, or performance metrics. We build tools that make people more free, not more dependent."
            />
            <Principle
              label="Consent, not capture"
              detail="No stealth memory. No hidden tracking. No data harvesting. Every piece of information held is held with explicit permission and can be revoked."
            />
            <Principle
              label="Self-hosted by design"
              detail="No cloud lock-in. No third-party platforms between you and your people. Your field, your server, your data. We build the whole stack and you own all of it."
            />
            <Principle
              label="Intelligence that serves"
              detail="AI should support human coherence, not erode it. We don't optimize for engagement. We don't manufacture dependency. We build mirrors, not traps."
            />
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="py-24 sm:py-32 px-6 border-t border-white/5">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-light text-slate-200 mb-6 leading-snug">
            Ready to build something with a&nbsp;soul?
          </h2>
          <p className="text-slate-400 mb-10 leading-relaxed">
            Whether you need a sovereign digital field for your business,
            want to integrate the AIN engine into your platform,
            or just want to talk about what conscious technology looks like &mdash;
            we&apos;re here.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:contact@soullab.life"
              className="inline-block px-8 py-4 bg-amber-500 text-[#0b0f1c] text-sm font-medium tracking-[0.15em] uppercase hover:bg-amber-400 transition-colors"
            >
              Get in Touch
            </a>
            <a
              href="mailto:kelly@soullab.life"
              className="inline-block px-8 py-4 border border-white/10 text-slate-400 text-sm tracking-[0.15em] uppercase hover:border-white/20 hover:text-slate-300 transition-colors"
            >
              Talk to Kelly
            </a>
          </div>
          <p className="mt-6 text-slate-600 text-sm">
            contact@soullab.life
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
    <div className="p-8 rounded-lg border border-white/5 bg-white/[0.02] hover:border-amber-500/15 transition-colors">
      <span className="text-amber-500/30 text-xs tracking-widest font-mono">
        {number}
      </span>
      <h3 className="text-slate-200 text-lg mt-3 mb-4">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed mb-5">{body}</p>
      <p className="text-amber-500/60 text-xs tracking-wide italic">
        {accent}
      </p>
    </div>
  );
}

function FieldCard({
  name,
  tagline,
  description,
  location,
  href,
  flagship,
}: {
  name: string;
  tagline?: string;
  description: string;
  location?: string;
  href: string;
  flagship?: boolean;
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
        <p
          className="text-slate-400 text-sm leading-relaxed"
          dangerouslySetInnerHTML={{ __html: description }}
        />
      </a>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-6 rounded-lg border border-white/5 bg-white/[0.02] hover:border-amber-500/20 transition-colors"
    >
      <h3 className="text-slate-200 text-base mb-2">{name}</h3>
      {tagline && (
        <p className="text-amber-500/50 text-xs mb-2 italic">{tagline}</p>
      )}
      <p className="text-slate-500 text-sm mb-2">{description}</p>
      {location && <p className="text-slate-600 text-xs">{location}</p>}
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
