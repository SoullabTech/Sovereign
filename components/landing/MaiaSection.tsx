'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useId, useState } from 'react';
import { ChevronDown, MessageCircle } from 'lucide-react';
import { SectionReveal } from './SectionReveal';

export function MaiaSection() {
  const auraId = useId().replace(/:/g, '');
  const [ainOpen, setAinOpen] = useState(false);
  const [maiaOpen, setMaiaOpen] = useState(false);

  // Open the floating "Ask Soullab" widget pre-filled, and auto-ask.
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
        {/* Section header */}
        <SectionReveal>
          <div className="mx-auto mb-14 max-w-2xl text-center sm:mb-20">
            <p className="text-[11px] tracking-[0.35em] uppercase text-white/40">
              AIN &amp; MAIA
            </p>
            <h2
              className="mt-4 text-3xl sm:text-4xl font-extralight tracking-wide text-white"
              style={{ fontFamily: "'Crimson Pro', serif" }}
            >
              An ecosystem for human flourishing
            </h2>
            <p className="mt-4 text-base text-white/50 leading-relaxed" style={{ fontFamily: "'Source Sans Pro', sans-serif" }}>
              More than a technology platform — AIN brings personal reflection, learning, community,
              and developmental practice into one living environment that supports people throughout
              the journey of growth.
            </p>
          </div>
        </SectionReveal>

        <div className="grid lg:grid-cols-2 gap-10 items-start">
          {/* Left: AIN — the engine */}
          <SectionReveal>
            <div className="flex flex-col justify-center">
              <div className="inline-flex w-fit items-center rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-white/50 backdrop-blur">
                AIN &middot; The Engine
              </div>

              <button
                type="button"
                onClick={() => setAinOpen(v => !v)}
                aria-expanded={ainOpen}
                className="group mt-4 flex w-full items-start gap-3 text-left"
              >
                <h2
                  className="text-3xl sm:text-4xl font-extralight tracking-wide text-white"
                  style={{ fontFamily: "'Crimson Pro', serif" }}
                >
                  A relational intelligence platform
                </h2>
                <ChevronDown
                  className={`mt-2.5 h-5 w-5 shrink-0 text-white/40 transition-all duration-300 group-hover:text-white/70 ${ainOpen ? 'rotate-180 text-maia-spice-400 group-hover:text-maia-spice-400' : ''}`}
                />
              </button>

              <p className="mt-4 max-w-xl text-base text-white/50 leading-relaxed" style={{ fontFamily: "'Source Sans Pro', sans-serif" }}>
                AIN supports human growth, self-awareness, and meaningful connection. Built on the
                Spiralogic framework, it integrates the elemental forces to help people navigate
                thoughts, emotions, relationships, creativity, and life transitions in a natural,
                intuitive way.
              </p>

              {/* Elemental strip */}
              <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-white/55" style={{ fontFamily: "'Source Sans Pro', sans-serif" }}>
                {[
                  ['Fire', '#f0a35e'],
                  ['Water', '#7cc7f0'],
                  ['Earth', '#8fc08f'],
                  ['Air', '#cfd8e3'],
                  ['Aether', '#b79cf0'],
                ].map(([name, color]) => (
                  <span key={name} className="inline-flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
                    {name}
                  </span>
                ))}
              </div>

              <p className="mt-6 max-w-xl text-sm text-white/40 leading-relaxed" style={{ fontFamily: "'Source Sans Pro', sans-serif" }}>
                Informed by a vast body of human knowledge — psychology, philosophy, contemplative and
                wisdom traditions, mythology, leadership, and the study of consciousness — drawing on
                insights from thousands of books, manuscripts, and teachings across cultures and
                generations.
              </p>

              {/* Expandable — deeper on AIN */}
              <div
                className="grid transition-all duration-500 ease-out"
                style={{ gridTemplateRows: ainOpen ? '1fr' : '0fr' }}
              >
                <div className="overflow-hidden">
                  <div className="mt-6 space-y-3.5 border-l border-white/10 pl-5">
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
                      onClick={() => askMaia('What is AIN, and how does it work?')}
                      className="mt-1 inline-flex items-center gap-2 rounded-full border border-maia-spice-500/30 bg-maia-spice-500/10 px-4 py-2 text-sm font-medium text-maia-spice-400 hover:bg-maia-spice-500/20 transition-colors"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Ask MAIA about AIN
                    </button>
                  </div>
                </div>
              </div>
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
                {/* Single holoflower — slow rotation */}
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

                {/* Subtle glass ring */}
                <div className="absolute inset-0 rounded-2xl ring-1 ring-white/10" />
              </div>

              {/* Card footer */}
              <div className="mt-6">
                <div className="text-sm font-medium text-white">Soullab</div>
                <div className="mt-1 text-sm text-white/70">
                  A living environment for practice, community, and inner guidance.
                </div>
              </div>
            </div>
          </SectionReveal>
        </div>

        {/* MAIA block */}
        <SectionReveal delay={0.3} className="mt-16 sm:mt-20">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-8 sm:p-10 max-w-3xl mx-auto">
            <button
              type="button"
              onClick={() => setMaiaOpen(v => !v)}
              aria-expanded={maiaOpen}
              className="group mx-auto mb-6 flex w-full flex-col items-center"
            >
              <span className="text-white/40 text-center text-xs tracking-widest uppercase mb-3">
                MAIA &middot; The Guide
              </span>
              <span className="flex items-center gap-2">
                <span
                  className="text-2xl sm:text-3xl font-extralight tracking-wide text-white/90 text-center"
                  style={{ fontFamily: "'Crimson Pro', serif" }}
                >
                  At the heart of AIN
                </span>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-white/40 transition-all duration-300 group-hover:text-white/70 ${maiaOpen ? 'rotate-180 text-maia-spice-400 group-hover:text-maia-spice-400' : ''}`}
                />
              </span>
            </button>
            <p className="text-white/60 leading-relaxed text-center text-lg mb-6" style={{ fontFamily: "'Source Sans Pro', sans-serif" }}>
              MAIA is a relational intelligence companion that helps people explore their inner world,
              deepen self-understanding, and cultivate greater clarity, resilience, and purpose.
              Not a chatbot — a companion for coherence, truth-telling, and inner guidance, governed by
              an irreducible oath: consent, containment, non-manipulation, continuity.
            </p>

            {/* Expandable — deeper on MAIA */}
            <div
              className="grid transition-all duration-500 ease-out"
              style={{ gridTemplateRows: maiaOpen ? '1fr' : '0fr' }}
            >
              <div className="overflow-hidden">
                <div className="mx-auto mb-8 max-w-xl space-y-3.5 text-left">
                  {[
                    ['Speaks in modes', 'Talk for dialogue, Care for counsel, Note for capturing what matters — so the relationship fits the moment.'],
                    ['Memory with consent', 'Sanctuary Mode lets you speak freely with nothing retained. There is no stealth memory.'],
                    ['Held by a vow', 'Consent, containment, non-manipulation, continuity. MAIA offers reflection and choice — never command or diagnosis.'],
                    ['Oriented to your sovereignty', 'MAIA is not built to capture your attention or create dependence. It is built to return you, more fully, to your own life.'],
                  ].map(([title, body]) => (
                    <div key={title} className="border-l border-white/10 pl-5">
                      <p className="text-sm font-medium text-white/80" style={{ fontFamily: "'Source Sans Pro', sans-serif" }}>{title}</p>
                      <p className="mt-0.5 text-sm text-white/45 leading-relaxed" style={{ fontFamily: "'Source Sans Pro', sans-serif" }}>{body}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
              <Link
                href="/signin"
                className="inline-flex items-center text-maia-spice-400 hover:text-maia-spice-400 font-medium transition-colors group"
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

        {/* Closing — the through-line */}
        <SectionReveal delay={0.45} className="mt-16 sm:mt-20">
          <div className="mx-auto max-w-2xl text-center">
            <p
              className="text-2xl sm:text-3xl font-extralight leading-snug tracking-wide text-white/85"
              style={{ fontFamily: "'Crimson Pro', serif" }}
            >
              AIN is the engine. MAIA is the guide.
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
