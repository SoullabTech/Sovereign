// components/oracle/ritual/OracleRitualParts.tsx
'use client';

/**
 * Shared Ritual Components for Oracle Experiences
 *
 * 3-Variant Theme Map:
 * - I Ching:  Indigo/Cyan  — crystalline, atmospheric, electric-still
 * - Tarot:   Amber/Rose   — candlelight, velvet, myth
 * - Runes:   Emerald/Teal — stone, moss, iron
 *
 * Each variant controls: accent, atmosphere, particleStyle, tone
 */

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export type LifeArea = 'Relationship' | 'Work' | 'Health' | 'Purpose' | 'Money' | 'Family';
export type OracleVariant = 'default' | 'iching' | 'tarot' | 'runes';

export const LIFE_AREAS: LifeArea[] = ['Relationship', 'Work', 'Health', 'Purpose', 'Money', 'Family'];

export const SPIRAL_QUESTIONS = [
  'What is the nature of this moment?',
  'What is completing?',
  'What is emerging?',
  'What posture is wise?',
] as const;

/**
 * Theme configuration for each oracle variant
 * - accent: primary color for interactive elements
 * - atmosphere: radial gradient backdrop
 * - particles: style and density of background particles
 * - overlay: gradient overlay intensity
 */
const ORACLE_THEMES = {
  default: {
    accent: 'teal',
    atmosphere: 'bg-[radial-gradient(1200px_800px_at_30%_20%,rgba(45,212,191,0.12),transparent_60%),radial-gradient(900px_700px_at_70%_30%,rgba(20,184,166,0.10),transparent_55%),radial-gradient(1100px_800px_at_50%_85%,rgba(94,234,212,0.08),transparent_60%)]',
    particles: {
      opacity: 0.18,
      size: 22,
      color: 'rgba(255,255,255,0.22)',
    },
    overlay: 'bg-[linear-gradient(to_bottom,rgba(0,0,0,0.45),rgba(0,0,0,0.85))]',
  },
  iching: {
    // Crystalline, atmospheric, electric-still — fewer effects, sharper geometry
    accent: 'indigo',
    atmosphere: 'bg-[radial-gradient(1400px_900px_at_50%_10%,rgba(99,102,241,0.14),transparent_55%),radial-gradient(800px_600px_at_20%_40%,rgba(129,140,248,0.08),transparent_50%),radial-gradient(1000px_700px_at_80%_70%,rgba(165,180,252,0.06),transparent_55%)]',
    particles: {
      opacity: 0.12,
      size: 28,
      color: 'rgba(165,180,252,0.18)',
    },
    overlay: 'bg-[linear-gradient(to_bottom,rgba(0,0,0,0.35),rgba(0,0,0,0.80))]',
  },
  tarot: {
    // Candlelight, velvet, myth — warmer gradients, soft motion, imaginal
    accent: 'amber',
    atmosphere: 'bg-[radial-gradient(1100px_750px_at_25%_25%,rgba(251,191,36,0.12),transparent_55%),radial-gradient(900px_650px_at_75%_35%,rgba(244,63,94,0.08),transparent_50%),radial-gradient(1200px_800px_at_50%_80%,rgba(245,158,11,0.10),transparent_60%)]',
    particles: {
      opacity: 0.14,
      size: 18,
      color: 'rgba(251,191,36,0.16)',
    },
    overlay: 'bg-[linear-gradient(to_bottom,rgba(0,0,0,0.40),rgba(0,0,0,0.88))]',
  },
  runes: {
    // Stone, moss, iron — heavier stillness, mineral palette, declarative
    accent: 'emerald',
    atmosphere: 'bg-[radial-gradient(1300px_850px_at_40%_15%,rgba(16,185,129,0.11),transparent_55%),radial-gradient(700px_550px_at_15%_60%,rgba(20,184,166,0.07),transparent_50%),radial-gradient(900px_700px_at_85%_75%,rgba(45,212,191,0.05),transparent_55%)]',
    particles: {
      opacity: 0.10,
      size: 32,
      color: 'rgba(52,211,153,0.12)',
    },
    overlay: 'bg-[linear-gradient(to_bottom,rgba(0,0,0,0.50),rgba(0,0,0,0.90))]',
  },
} as const;

export function RitualShell(props: {
  children: React.ReactNode;
  max?: '5xl' | '6xl';
  variant?: OracleVariant;
}) {
  const max = props.max ?? '5xl';
  const variant = props.variant ?? 'default';
  const theme = ORACLE_THEMES[variant];

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#06060A] text-white">
      <div className="pointer-events-none absolute inset-0">
        {/* Atmosphere: variant-specific radial gradients */}
        <div className={`absolute inset-0 ${theme.atmosphere}`} />
        {/* Overlay: depth gradient */}
        <div className={`absolute inset-0 ${theme.overlay}`} />
        {/* Particles: variant-tuned dot grid */}
        <div
          className="absolute inset-0"
          style={{
            opacity: theme.particles.opacity,
            backgroundImage: `radial-gradient(${theme.particles.color} 1px, transparent 1px)`,
            backgroundSize: `${theme.particles.size}px ${theme.particles.size}px`,
          }}
        />
      </div>

      <div className={`relative mx-auto max-w-${max} px-5 pt-10 pb-20`}>
        {props.children}
      </div>
    </div>
  );
}

/** Get the accent color for a variant */
export function getVariantAccent(variant: OracleVariant): 'teal' | 'indigo' | 'amber' | 'emerald' {
  return ORACLE_THEMES[variant].accent;
}

/**
 * Tone presets - microcopy cadence for each oracle
 * Each oracle has its own linguistic rhythm and voice
 */
const ORACLE_TONES = {
  default: {
    thresholdLine: 'Take one breath. Name the life area. Ask what wants to evolve.',
    revealLine: 'Let the symbol land before meaning.',
    waitingLine: 'Receiving...',
    integrationLine: 'Carry this forward.',
    cadence: 'neutral' as const,
  },
  iching: {
    // Quieter language, more sparse, electric-still
    thresholdLine: 'Hold the question. Let the lines resolve.',
    revealLine: 'The hexagram forms.',
    waitingLine: 'Counting stalks...',
    integrationLine: 'The change moves through.',
    cadence: 'sparse' as const,
  },
  tarot: {
    // Imaginal, mythic, warmer
    thresholdLine: 'Take one breath. Let the image arrive before meaning.',
    revealLine: 'Hold the question gently. Notice what you feel before you interpret.',
    waitingLine: 'The cards speak...',
    integrationLine: 'What part of you does this card describe that you usually hide?',
    cadence: 'mythic' as const,
  },
  runes: {
    // Declarative, heavy, mineral
    thresholdLine: 'This rune names the current contract.',
    revealLine: 'Let the symbol land before meaning.',
    waitingLine: 'Drawing from the bag...',
    integrationLine: 'The rune binds.',
    cadence: 'declarative' as const,
  },
} as const;

export type OracleTone = typeof ORACLE_TONES[OracleVariant];

/** Get tone/microcopy presets for a variant (with fallback) */
export function getOracleTone(variant: OracleVariant): OracleTone {
  return ORACLE_TONES[variant] ?? ORACLE_TONES.default;
}

/**
 * Reveal motion presets - framer-motion configs for each oracle
 * Each oracle has its own reveal rhythm
 */
const REVEAL_MOTIONS = {
  default: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.5, ease: 'easeOut' },
  },
  iching: {
    // Lines resolve - crisp opacity + scale pop
    initial: { opacity: 0, scale: 0.92, filter: 'blur(0px)' },
    animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
    transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  tarot: {
    // Curtain pull - y translate + blur → crisp, with subtle saturation lift
    initial: { opacity: 0, y: 30, filter: 'blur(8px) saturate(0.85)' },
    animate: { opacity: 1, y: 0, filter: 'blur(0px) saturate(1)' },
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
  runes: {
    // Stone-set - scale down + settle, almost no blur
    initial: { opacity: 0, scale: 1.08, y: -10 },
    animate: { opacity: 1, scale: 1, y: 0 },
    transition: { duration: 0.45, ease: [0.33, 1, 0.68, 1] },
  },
} as const;

export type RevealMotion = typeof REVEAL_MOTIONS[OracleVariant];

/** Get reveal motion presets for a variant (with fallback) */
export function getRevealMotion(variant: OracleVariant): RevealMotion {
  return REVEAL_MOTIONS[variant] ?? REVEAL_MOTIONS.default;
}

export function RitualBackButton(props: { to?: string; label?: string }) {
  const router = useRouter();
  const to = props.to ?? '/oracle';
  const label = props.label ?? 'Back to Oracle';

  return (
    <button
      onClick={() => router.push(to)}
      className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm backdrop-blur hover:bg-white/10"
    >
      <ArrowLeft className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );
}

export function RitualCard(props: {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mt-14 rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-8">
      <div className="flex items-center gap-3">
        {props.icon ? <div className="text-teal-400/80">{props.icon}</div> : null}
        <h1 className="text-3xl font-semibold tracking-tight text-white">{props.title}</h1>
      </div>

      {props.subtitle ? (
        <p className="mt-4 text-white/70 text-lg leading-relaxed max-w-2xl">{props.subtitle}</p>
      ) : null}

      {props.children}
    </div>
  );
}

export function LifeAreaChips(props: {
  value: LifeArea | null;
  onChange: (v: LifeArea) => void;
  className?: string;
  accentColor?: 'teal' | 'emerald' | 'amber' | 'indigo';
}) {
  const accent = props.accentColor ?? 'teal';
  const activeClass = {
    teal: 'border-teal-400/30 bg-teal-500/15 text-white',
    emerald: 'border-emerald-400/30 bg-emerald-500/15 text-white',
    amber: 'border-amber-400/30 bg-amber-500/15 text-white',
    indigo: 'border-indigo-400/30 bg-indigo-500/15 text-white',
  };

  return (
    <div className={props.className ?? 'mt-6 flex flex-wrap gap-2'}>
      {LIFE_AREAS.map((a) => (
        <button
          key={a}
          onClick={() => props.onChange(a)}
          className={`rounded-full px-4 py-2 text-sm border backdrop-blur transition
            ${props.value === a
              ? activeClass[accent]
              : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'}`}
        >
          {a}
        </button>
      ))}
    </div>
  );
}

export function SpiralQuestionChips(props: {
  question: string;
  setQuestion: (next: string) => void;
  lifeArea?: LifeArea | null;
  accentColor?: 'teal' | 'emerald' | 'amber' | 'indigo';
}) {
  const accent = props.accentColor ?? 'teal';
  const activeClass = {
    teal: 'bg-teal-500/10 border-teal-400/30 text-white',
    emerald: 'bg-emerald-500/10 border-emerald-400/30 text-white',
    amber: 'bg-amber-500/10 border-amber-400/30 text-white',
    indigo: 'bg-indigo-500/10 border-indigo-400/30 text-white',
  };

  return (
    <div className="mb-4">
      <div className="text-sm text-white/70">Spiral questions</div>
      <div className="mt-2 flex flex-wrap gap-2">
        {SPIRAL_QUESTIONS.map((q) => (
          <button
            key={q}
            onClick={() => props.setQuestion(q)}
            className={`rounded-full border px-4 py-2 text-sm transition
              ${props.question === q
                ? activeClass[accent]
                : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'}`}
          >
            {q}
          </button>
        ))}
      </div>

      {props.lifeArea ? (
        <div className="mt-2 text-xs text-white/55">
          Life area: <span className="text-white/75">{props.lifeArea}</span>
        </div>
      ) : null}
    </div>
  );
}

export function TwoPassRevealCard(props: {
  title: string;
  body: string;
  buttonLabel?: string;
  onProceed: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-8">
      <h2 className="text-2xl font-semibold tracking-tight text-white">{props.title}</h2>
      <p className="mt-2 text-white/70">{props.body}</p>

      {props.children ? <div className="mt-6">{props.children}</div> : null}

      <div className="mt-6">
        <button
          onClick={props.onProceed}
          className="w-full rounded-xl px-4 py-3 text-sm font-medium border border-white/10 bg-white/10 hover:bg-white/15 transition"
        >
          {props.buttonLabel ?? 'Proceed to Meaning'}
        </button>
      </div>
    </div>
  );
}

export function IntegrationGrid(props: {
  aTitle?: string;
  aBody?: string;
  bTitle?: string;
  bBody?: string;
  cTitle?: string;
  cBody?: string;
}) {
  return (
    <div className="mt-8 grid gap-4 md:grid-cols-3">
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6">
        <div className="text-sm font-medium text-white/85">{props.aTitle ?? 'One step (24 hours)'}</div>
        <div className="mt-2 text-sm text-white/70">
          {props.aBody ?? "Choose one small action that matches the symbol's posture. Keep it simple."}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6">
        <div className="text-sm font-medium text-white/85">{props.bTitle ?? 'Journal this'}</div>
        <div className="mt-2 text-sm text-white/70">
          {props.bBody ?? 'What part of me does this symbol describe that I usually hide?'}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6">
        <div className="text-sm font-medium text-white/85">{props.cTitle ?? 'One thing to stop'}</div>
        <div className="mt-2 text-sm text-white/70">
          {props.cBody ?? 'Stop rehearsing the old story. Notice where you tighten — and soften once.'}
        </div>
      </div>
    </div>
  );
}

export function SpiralReflection(props: {
  element: string;
  state: string;
  practice: string;
}) {
  return (
    <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6">
      <div className="text-sm font-medium text-white/85">Spiral Reflection</div>
      <div className="mt-2 grid gap-2 text-sm text-white/70 md:grid-cols-3">
        <div><span className="text-teal-400/80">Element:</span> {props.element}</div>
        <div><span className="text-teal-400/80">State:</span> {props.state}</div>
        <div><span className="text-teal-400/80">Practice:</span> {props.practice}</div>
      </div>
    </div>
  );
}

// Ritual progress bar for tracking flow through phases
export function RitualProgress(props: {
  current: number;
  steps: string[];
}) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between text-xs text-white/50 mb-2">
        {props.steps.map((step, i) => (
          <div
            key={step}
            className={`transition-colors ${i <= props.current ? 'text-teal-400/80' : ''}`}
          >
            {step}
          </div>
        ))}
      </div>
      <div className="h-1 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-teal-400/60 rounded-full transition-all duration-500"
          style={{ width: `${((props.current + 1) / props.steps.length) * 100}%` }}
        />
      </div>
    </div>
  );
}
