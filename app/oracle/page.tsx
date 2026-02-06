/* frontend: app/oracle/page.tsx */
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Moon,
  Star,
  Compass,
  ChevronRight,
  BookOpen,
} from 'lucide-react';

type MemberTier = 'free' | 'personal' | 'stewardship' | 'pro';
type DivinationKey = 'iching' | 'tarot' | 'runes';

// Safe localStorage helpers
const safeGet = (key: string) => {
  try {
    return typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
  } catch {
    return null;
  }
};

const safeSet = (key: string, value: string) => {
  try {
    if (typeof window !== 'undefined') window.localStorage.setItem(key, value);
  } catch {
    // noop
  }
};

export default function OraclePage() {
  const router = useRouter();
  const [tier, setTier] = useState<MemberTier>('free');
  const [readingsThisWeek, setReadingsThisWeek] = useState(0);

  useEffect(() => {
    const storedTier = safeGet('member_tier') as MemberTier | null;
    const storedCount = safeGet('oracle_readings_this_week');
    if (storedTier) setTier(storedTier);
    if (storedCount) setReadingsThisWeek(Number(storedCount) || 0);
  }, []);

  const methods = useMemo(
    () =>
      [
        {
          key: 'iching',
          title: 'I Ching',
          subtitle: 'Change, timing, and the turning of the spiral',
          description:
            "A reflective mirror for life's transitions — revealing the shape of the moment and the next wise move.",
          icon: Compass,
          sigil: '☰',
          route: '/oracle/iching',
          ritual: 'Ask what wants to evolve, not what you want to control.',
        },
        {
          key: 'tarot',
          title: 'Tarot',
          subtitle: 'Archetypes, psyche, and soul-patterns',
          description:
            'Seventy-eight doors into the psyche — clarifying desire, shadow, and the deeper story underneath the story.',
          icon: Star,
          sigil: '✶',
          route: '/oracle/tarot',
          ritual: 'Hold the question gently. Let the image speak first.',
        },
        {
          key: 'runes',
          title: 'Runes',
          subtitle: 'Ancestral symbols and embodied truth',
          description:
            'A concise, earthy oracle — great for grounding decisions and naming the hidden contract of a situation.',
          icon: Moon,
          sigil: 'ᚠ',
          route: '/oracle/runes',
          ritual: 'Choose simplicity. Let the symbol land in the body.',
        },
      ] as const,
    []
  );

  const handleEnter = (route: string, key: DivinationKey) => {
    const next = readingsThisWeek + 1;
    setReadingsThisWeek(next);
    safeSet('oracle_readings_this_week', String(next));
    router.push(route);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#1a1f2e] to-[#16213e] text-white">
      <div className="mx-auto w-full max-w-5xl px-6 pb-20 pt-8">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/maia')}
            className="group inline-flex items-center gap-2 text-[#D4B896]/70 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Return to MAIA
          </button>

          <div className="text-xs text-[#D4B896]/50">
            FREE • {readingsThisWeek} this week
          </div>
        </div>

        {/* Header */}
        <div className="mt-12 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          <div>
            <h1 className="text-3xl font-medium text-white tracking-tight">
              Reflect your spiral.
            </h1>
            <p className="mt-2 text-xl text-[#D4B896]/70">
              Elements, states, and phases — made visible.
            </p>

            <p className="mt-6 text-[#D4B896]/70 leading-relaxed max-w-xl">
              Each oracle is a different lens for the same living truth: you are in motion.
              Use these portals as meditation — to clarify what's emerging, what's completing,
              and what wants your attention next.
            </p>
          </div>

          <div className="rounded-lg border border-[#D4B896]/15 bg-white/[0.03] p-5">
            <div className="text-sm font-medium text-white">A simple way to enter</div>
            <div className="mt-2 text-sm text-[#D4B896]/70">
              Name the life area (relationship, work, health, purpose). Then ask:
            </div>
            <div className="mt-4 space-y-2">
              {[
                '"What is the nature of this moment?"',
                '"What wants to evolve next?"',
                '"What is the wise posture to take?"',
              ].map((q, i) => (
                <div key={i} className="rounded-lg bg-[#D4B896]/10 px-4 py-3 text-sm text-white/80">
                  {q}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Oracle cards */}
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {methods.map((m) => {
            const Icon = m.icon;

            return (
              <div
                key={m.key}
                className="group rounded-lg border border-[#D4B896]/15 bg-white/[0.02] p-5 hover:bg-[#D4B896]/08 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-lg bg-[#D4B896]/15 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-amber-400" />
                  </div>
                  <span className="text-3xl text-[#D4B896]/30 font-light select-none">
                    {m.sigil}
                  </span>
                </div>

                <div className="mt-4">
                  <div className="text-lg font-medium text-white">{m.title}</div>
                  <div className="mt-1 text-sm text-[#D4B896]/70">{m.subtitle}</div>
                  <p className="mt-3 text-sm text-[#D4B896]/50 leading-relaxed">{m.description}</p>

                  <div className="mt-4 rounded-lg bg-[#D4B896]/08 px-4 py-3">
                    <div className="text-xs font-medium text-amber-400/80">Ritual cue</div>
                    <div className="mt-1 text-sm text-[#D4B896]/70">{m.ritual}</div>
                  </div>

                  <button
                    onClick={() => handleEnter(m.route, m.key)}
                    className="mt-4 w-full flex items-center justify-center gap-2 rounded-lg bg-[#D4B896]/15 hover:bg-[#D4B896]/25 px-4 py-3 text-sm font-medium text-white transition-colors"
                  >
                    <span>Enter</span>
                    <ChevronRight className="h-4 w-4 text-amber-400" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* View Saved Readings */}
        <div className="mt-10 flex justify-center">
          <button
            onClick={() => router.push('/oracle/reflections')}
            className="inline-flex items-center gap-2 text-[#D4B896]/50 hover:text-amber-400 transition-colors text-sm"
          >
            <BookOpen className="w-4 h-4" />
            View Saved Readings
          </button>
        </div>

        {/* Footer note */}
        <div className="mt-12 rounded-lg border border-[#D4B896]/15 bg-white/[0.02] p-5">
          <div className="text-sm font-medium text-white/80">A Soullab note</div>
          <p className="mt-2 text-sm text-[#D4B896]/50 leading-relaxed">
            These are not "fortune" tools — they're coherence tools. Let the reading become a mirror:
            notice what you feel, what you resist, what you already knew, and what you're now willing to admit.
          </p>
        </div>
      </div>
    </div>
  );
}
