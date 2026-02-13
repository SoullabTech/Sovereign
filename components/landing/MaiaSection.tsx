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
          {/* Left: copy */}
          <SectionReveal>
            <div className="flex flex-col justify-center">
              <div className="inline-flex w-fit items-center rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-white/50 backdrop-blur">
                AIN Engine
              </div>

              <h2
                className="mt-4 text-3xl sm:text-4xl font-extralight tracking-wide text-white"
                style={{ fontFamily: "'Crimson Pro', serif" }}
              >
                The engine beneath MAIA
              </h2>

              <p className="mt-4 max-w-xl text-base text-white/50 leading-relaxed" style={{ fontFamily: "'Source Sans Pro', sans-serif" }}>
                A sovereignty-first intelligence layer for reflection, coherence, and inner navigation — built to feel like
                weather, not surveillance.
              </p>
            </div>
          </SectionReveal>

          {/* Right: Soullab card with luminous holoflower */}
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

              {/* Holoflower stage */}
              <div className="relative mx-auto mt-2 flex h-[340px] w-full max-w-[420px] items-center justify-center">
                {/* Outer layer */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative h-[88%] w-[88%] animate-[spin_36s_linear_infinite] motion-reduce:animate-none opacity-40">
                    {/* NOTE: requires public/holoflower.png */}
                    <Image
                      src="/holoflower.png"
                      alt="Holoflower"
                      fill
                      sizes="(max-width: 1024px) 420px, 420px"
                      className="object-contain"
                      priority
                    />
                  </div>
                </div>

                {/* Inner layer (golden ratio ~ 0.618 of outer; 55.6% to match /maia) */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative h-[55.6%] w-[55.6%] animate-[spin_44s_linear_infinite_reverse] motion-reduce:animate-none opacity-70">
                    <Image
                      src="/holoflower.png"
                      alt="Holoflower inner"
                      fill
                      sizes="(max-width: 1024px) 260px, 260px"
                      className="object-contain"
                      priority
                    />
                  </div>
                </div>

                {/* Center light point */}
                <div
                  className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{
                    background:
                      'radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.30) 45%, rgba(255,255,255,0.00) 70%)',
                  }}
                />

                {/* Subtle glass ring */}
                <div className="absolute inset-0 rounded-2xl ring-1 ring-white/10" />
              </div>

              {/* Card footer */}
              <div className="mt-6">
                <div className="text-sm font-medium text-white">Soullab</div>
                <div className="mt-1 text-sm text-white/70">
                  A living interface for practice, community, and inner guidance.
                </div>
              </div>
            </div>
          </SectionReveal>
        </div>

        {/* MAIA block */}
        <SectionReveal delay={0.3} className="mt-16 sm:mt-20">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-8 sm:p-10 max-w-3xl mx-auto">
            <h3
              className="text-2xl sm:text-3xl font-extralight tracking-wide text-white/90 mb-6 text-center"
              style={{ fontFamily: "'Crimson Pro', serif" }}
            >
              MAIA
            </h3>
            <p className="text-white/40 text-center text-xs tracking-widest uppercase mb-6">
              The first expression of AIN
            </p>
            <p className="text-white/60 leading-relaxed text-center text-lg mb-8" style={{ fontFamily: "'Source Sans Pro', sans-serif" }}>
              MAIA is the sovereign consciousness companion — built on AIN.
              Not a chatbot. A companion for human coherence, truth-telling, and inner guidance.
              Governed by an irreducible oath: consent, containment, non-manipulation.
            </p>
            <div className="text-center">
              <Link
                href="/begin"
                className="inline-flex items-center text-maia-spice-400 hover:text-maia-spice-400 font-medium transition-colors group"
              >
                Meet MAIA
                <span className="ml-2 group-hover:translate-x-1 transition-transform">&rarr;</span>
              </Link>
            </div>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
