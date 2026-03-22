'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useId } from 'react';
import { SectionReveal } from './SectionReveal';

export function MaiaSection() {
  const auraId = useId().replace(/:/g, '');

  return (
    <section
      id="maia"
      className="relative py-24 sm:py-32 px-4"
      style={{
        background: 'linear-gradient(180deg, #0b0f1c 0%, #0f1328 50%, #0b0f1c 100%)',
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-10 items-center">

          {/* Left: experience-first copy */}
          <SectionReveal>
            <div className="flex flex-col justify-center">
              <div className="inline-flex w-fit items-center rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-white/50 backdrop-blur">
                Sovereign companion
              </div>

              <h2
                className="mt-4 text-3xl sm:text-4xl font-extralight tracking-wide text-white"
                style={{ fontFamily: "'Crimson Pro', serif" }}
              >
                Explore MAIA
              </h2>

              <p className="mt-4 max-w-xl text-base text-white/50 leading-relaxed" style={{ fontFamily: "'Source Sans Pro', sans-serif" }}>
                An interactive intelligence field that reflects the structure behind your patterns, decisions, and behavior.
              </p>

              {/* What happens when you enter */}
              <div className="mt-8 space-y-3">
                {[
                  { label: 'You ask something real', sub: 'A question, situation, or pattern you keep running into.' },
                  { label: 'MAIA maps the underlying structure', sub: 'Not what it looks like on the surface — what\'s actually driving it.' },
                  { label: 'You receive a clear reflection', sub: 'Tensions named. Distortions located. Patterns you sensed but hadn\'t fully seen.' },
                  { label: 'You go deeper or move on', sub: 'MAIA becomes more precise as you engage. You decide the pace.' },
                ].map(({ label, sub }) => (
                  <div key={label} className="flex gap-4">
                    <span className="text-maia-spice-400/50 mt-0.5 shrink-0 text-sm">·</span>
                    <div>
                      <p className="text-white/70 text-sm font-medium">{label}</p>
                      <p className="text-white/30 text-sm mt-0.5">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Micro interaction hint */}
              <div className="mt-8 px-4 py-3 border border-white/5 rounded-lg bg-white/[0.02]">
                <p className="text-white/20 text-xs">Start with something simple —</p>
                <p className="text-white/40 text-sm mt-1 italic">
                  "Why do I keep repeating the same pattern in my work?"
                </p>
              </div>

              {/* AIN — secondary, one line */}
              <p className="mt-6 text-white/20 text-xs leading-relaxed max-w-sm">
                Powered by AIN — an intelligence layer that tracks patterns, integrates memory, and evolves with you over time.
              </p>
            </div>
          </SectionReveal>

          {/* Right: holoflower visual + CTA */}
          <SectionReveal delay={0.15}>
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              {/* Violet aura */}
              <div className="pointer-events-none absolute inset-0">
                <div
                  className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
                  style={{
                    background:
                      'radial-gradient(circle, rgba(139,92,246,0.55) 0%, rgba(139,92,246,0.20) 35%, rgba(139,92,246,0.00) 70%)',
                    filter: 'blur(38px)',
                    animation: `${auraId} 6.5s ease-in-out infinite`,
                  }}
                />
                <style>{`
                  @keyframes ${auraId} {
                    0% { transform: translate(-50%, -50%) scale(0.92); opacity: 0.70; }
                    50% { transform: translate(-50%, -50%) scale(1.03); opacity: 0.95; }
                    100% { transform: translate(-50%, -50%) scale(0.92); opacity: 0.70; }
                  }
                `}</style>
              </div>

              {/* Holoflower */}
              <div className="relative mx-auto mt-2 flex h-[340px] w-full max-w-[420px] items-center justify-center">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative h-[92%] w-[92%] animate-[spin_180s_linear_infinite] motion-reduce:animate-none opacity-75">
                    <Image
                      src="/holoflower-studio-transparent.png"
                      alt="Holoflower"
                      fill
                      sizes="(max-width: 1024px) 420px, 420px"
                      className="object-contain"
                      priority
                    />
                  </div>
                </div>
                <div className="absolute inset-0 rounded-2xl ring-1 ring-white/10" />
              </div>

              {/* Card footer — bridge + CTA */}
              <div className="mt-6 space-y-4">
                <p className="text-white/40 text-sm leading-relaxed">
                  Most people don't need more advice.
                  They need to see what's actually happening.
                </p>
                <Link
                  href="/enter"
                  className="inline-flex items-center text-maia-spice-400 hover:text-maia-spice-300 text-sm font-medium transition-colors group"
                >
                  Explore MAIA
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">&rarr;</span>
                </Link>
              </div>
            </div>
          </SectionReveal>
        </div>
      </div>
    </section>
  );
}
