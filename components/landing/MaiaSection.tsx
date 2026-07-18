'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useId, useState } from 'react';
import { ChevronDown, MessageCircle } from 'lucide-react';
import { SectionReveal } from './SectionReveal';

const SITUATIONS = [
  { label: 'When you\'re overwhelmed', desc: 'And need to find the thread back to yourself.' },
  { label: 'When you\'re trying to write something that matters', desc: 'And the words won\'t come, or they\'re coming but not yet true.' },
  { label: 'When your life is changing', desc: 'And you don\'t know yet who you\'re becoming.' },
  { label: 'When you\'re caring for someone', desc: 'And carrying more than you can easily say.' },
  { label: 'When you\'re trying to understand yourself', desc: 'Patterns, reactions, what you actually want.' },
  { label: 'When you\'re building something important', desc: 'And need to think with greater clarity and depth.' },
];

export function MaiaSection() {
  const auraId = useId().replace(/:/g, '');
  const [ainOpen, setAinOpen] = useState(false);

  const askMaia = (question: string) =>
    window.dispatchEvent(
      new CustomEvent('soullab:ask', { detail: { question, autosubmit: true } }),
    );

  return (
    <section
      id="maia"
      className="relative py-24 sm:py-32 px-4"
      style={{
        background: 'linear-gradient(180deg, #0b0f1c 0%, #0f1328 50%, #0b0f1c 100%)',
      }}
    >
      <div className="max-w-6xl mx-auto">

        {/* MAIA — lead, experiential */}
        <SectionReveal>
          <div className="mx-auto mb-14 max-w-2xl text-center sm:mb-20">
            <p className="text-[11px] tracking-[0.35em] uppercase text-white/40">
              MAIA
            </p>
            <h2
              className="mt-4 text-3xl sm:text-4xl font-extralight tracking-wide text-white"
              style={{ fontFamily: "'Crimson Pro', serif" }}
            >
              A companion for your whole life
            </h2>
            <p className="mt-4 text-base text-white/50 leading-relaxed" style={{ fontFamily: "'Source Sans Pro', sans-serif" }}>
              MAIA helps you think more clearly, relate more deeply, and cultivate your own wisdom — not replace it.
              Not a chatbot. A companion for reflection, guidance, and continuity.
            </p>
          </div>
        </SectionReveal>

        {/* Two-column: MAIA description + holoflower */}
        <div className="grid lg:grid-cols-2 gap-10 items-start">
          {/* Left: MAIA experiential */}
          <SectionReveal>
            <div className="flex flex-col justify-center">
              <p className="text-base text-white/50 leading-relaxed mb-8" style={{ fontFamily: "'Source Sans Pro', sans-serif" }}>
                Governed by an irreducible oath — consent, containment, non-manipulation, continuity.
                MAIA offers reflection and choice, never command or diagnosis. It is built to return you,
                more fully, to your own life.
              </p>

              <div className="space-y-3.5 border-l border-white/10 pl-5 mb-8">
                {[
                  ['Speaks in modes', 'Talk for dialogue, Care for counsel, Note for capturing what matters — so the relationship fits the moment.'],
                  ['Memory with consent', 'Sanctuary Mode lets you speak freely with nothing retained. There is no stealth memory.'],
                  ['Oriented to your sovereignty', 'Not built to capture attention or create dependence. Built to amplify what is already yours.'],
                ].map(([title, body]) => (
                  <div key={title}>
                    <p className="text-sm font-medium text-white/80" style={{ fontFamily: "'Source Sans Pro', sans-serif" }}>{title}</p>
                    <p className="mt-0.5 text-sm text-white/45 leading-relaxed" style={{ fontFamily: "'Source Sans Pro', sans-serif" }}>{body}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                <Link
                  href="/signin"
                  className="inline-flex items-center text-maia-spice-400 font-medium transition-colors group"
                >
                  Meet MAIA
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">&rarr;</span>
                </Link>
                <button
                  type="button"
                  onClick={() => askMaia('What is MAIA, and how is it different from a chatbot?')}
                  className="inline-flex items-center gap-2 rounded-full border border-maia-spice-500/30 bg-maia-spice-500/10 px-4 py-2 text-sm font-medium text-maia-spice-400 hover:bg-maia-spice-500/20 transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  Ask MAIA about MAIA
                </button>
              </div>
            </div>
          </SectionReveal>

          {/* Right: Holoflower card */}
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

              <div className="relative mx-auto mt-2 flex h-[340px] w-full max-w-[420px] items-center justify-center">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative h-[92%] w-[92%] animate-[spin_180s_linear_infinite] motion-reduce:animate-none opacity-75">
                    <Image
                      src="/holoflower-studio-transparent.png"
                      alt="The Holoflower — Soullab's elemental mandala, slowly turning"
                      fill
                      sizes="(max-width: 1024px) 420px, 420px"
                      className="object-contain"
                      priority
                    />
                  </div>
                </div>
                <div className="absolute inset-0 rounded-2xl ring-1 ring-white/10" />
              </div>

              <div className="mt-6">
                <div className="text-sm font-medium text-white">Soullab</div>
                <div className="mt-1 text-sm text-white/70">
                  A living environment for practice, community, and inner guidance.
                </div>
              </div>
            </div>
          </SectionReveal>
        </div>

        {/* Human situations */}
        <SectionReveal delay={0.2} className="mt-16 sm:mt-20">
          <div className="mx-auto max-w-3xl">
            <p className="text-center text-white/30 text-xs tracking-widest uppercase mb-8">
              What people bring to MAIA
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {SITUATIONS.map(({ label, desc }) => (
                <div key={label} className="rounded-xl border border-white/8 bg-white/[0.02] px-5 py-4">
                  <p className="text-sm font-medium text-white/80 mb-1" style={{ fontFamily: "'Source Sans Pro', sans-serif" }}>{label}</p>
                  <p className="text-xs text-white/35 leading-relaxed" style={{ fontFamily: "'Source Sans Pro', sans-serif" }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </SectionReveal>

        {/* AIN OS — constitutional foundation, revealed after MAIA */}
        <SectionReveal delay={0.3} className="mt-16 sm:mt-20">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-8 sm:p-10 max-w-3xl mx-auto">
            <button
              type="button"
              onClick={() => setAinOpen(v => !v)}
              aria-expanded={ainOpen}
              className="group mx-auto mb-6 flex w-full flex-col items-center"
            >
              <span className="text-white/40 text-center text-xs tracking-widest uppercase mb-3">
                AIN OS &middot; The Foundation
              </span>
              <span className="flex items-center gap-2">
                <span
                  className="text-2xl sm:text-3xl font-extralight tracking-wide text-white/90 text-center"
                  style={{ fontFamily: "'Crimson Pro', serif" }}
                >
                  Built on different principles
                </span>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-white/40 transition-all duration-300 group-hover:text-white/70 ${ainOpen ? 'rotate-180 text-maia-spice-400 group-hover:text-maia-spice-400' : ''}`}
                />
              </span>
            </button>

            <p className="text-white/60 leading-relaxed text-center text-base mb-6" style={{ fontFamily: "'Source Sans Pro', sans-serif" }}>
              MAIA is built on AIN OS, our underlying architecture for trustworthy human-AI
              relationships. It provides shared commitments around consent, continuity, provenance,
              and stewardship so these principles do not have to be rebuilt each time.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mb-6">
              {['Stewardship', 'Consent', 'Recognition', 'Provenance', 'Continuity'].map(c => (
                <span key={c} className="inline-flex items-center gap-1.5 text-sm text-white/55" style={{ fontFamily: "'Source Sans Pro', sans-serif" }}>
                  <span className="h-1.5 w-1.5 rounded-full bg-maia-spice-400/60" />
                  {c}
                </span>
              ))}
            </div>

            <div
              className="grid transition-all duration-500 ease-out"
              style={{ gridTemplateRows: ainOpen ? '1fr' : '0fr' }}
            >
              <div className="overflow-hidden">
                <div className="mt-6 space-y-3.5 border-l border-white/10 pl-5 max-w-xl mx-auto">
                  {[
                    ['Spiralogic at the core', 'AIN maps experience through the elemental forces — helping you see where you are and what is asking for attention.'],
                    ['Sovereign by design', 'Self-hosted and private. Your reflections are yours; nothing is sold, mined, or used to train outside models.'],
                    ['Moves at the pace of the moment', 'A quick reflection or a slower, deeper exploration — AIN meets the tempo the moment needs.'],
                    ['Informed, not imitative', 'Drawing on psychology, contemplative and wisdom traditions, and the study of consciousness — without claiming authority over your meaning.'],
                  ].map(([title, body]) => (
                    <div key={title}>
                      <p className="text-sm font-medium text-white/80" style={{ fontFamily: "'Source Sans Pro', sans-serif" }}>{title}</p>
                      <p className="mt-0.5 text-sm text-white/45 leading-relaxed" style={{ fontFamily: "'Source Sans Pro', sans-serif" }}>{body}</p>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => askMaia('What is AIN OS, and how does it work?')}
                    className="mt-1 inline-flex items-center gap-2 rounded-full border border-maia-spice-500/30 bg-maia-spice-500/10 px-4 py-2 text-sm font-medium text-maia-spice-400 hover:bg-maia-spice-500/20 transition-colors"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Ask MAIA about AIN OS
                  </button>
                </div>
              </div>
            </div>
          </div>
        </SectionReveal>

        {/* Closing */}
        <SectionReveal delay={0.45} className="mt-16 sm:mt-20">
          <div className="mx-auto max-w-2xl text-center">
            <p
              className="text-2xl sm:text-3xl font-extralight leading-snug tracking-wide text-white/85"
              style={{ fontFamily: "'Crimson Pro', serif" }}
            >
              AIN OS is the foundation. MAIA is the companion.
              <br className="hidden sm:block" />{' '}
              <span className="text-maia-spice-400">You are the intelligence that emerges.</span>
            </p>
            <p className="mt-5 text-base text-white/45 leading-relaxed" style={{ fontFamily: "'Source Sans Pro', sans-serif" }}>
              Together they help people know themselves, grow consciously, and live more connected lives.
            </p>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
