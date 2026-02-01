/* frontend: app/oracle/page.tsx */
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Sparkles,
  Moon,
  Star,
  Compass,
  ChevronRight,
  Shield,
} from 'lucide-react';

type MemberTier = 'free' | 'personal' | 'stewardship' | 'pro';
type DivinationKey = 'iching' | 'tarot' | 'runes';

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

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
          accent: 'from-indigo-500/20 via-cyan-500/10 to-transparent',
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
          accent: 'from-amber-500/20 via-rose-500/10 to-transparent',
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
          accent: 'from-emerald-500/20 via-teal-500/10 to-transparent',
          route: '/oracle/runes',
          ritual: 'Choose simplicity. Let the symbol land in the body.',
        },
      ] as const,
    []
  );

  const canAccess = (k: DivinationKey) => {
    // All users can access all oracles
    return true;
  };

  const handleEnter = (route: string, key: DivinationKey) => {
    const next = readingsThisWeek + 1;
    setReadingsThisWeek(next);
    safeSet('oracle_readings_this_week', String(next));
    router.push(route);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#06060A] text-white">
      {/* atmospheric backdrop */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(1200px_800px_at_30%_20%,rgba(120,120,255,0.14),transparent_60%),radial-gradient(900px_700px_at_70%_30%,rgba(255,180,120,0.10),transparent_55%),radial-gradient(1100px_800px_at_50%_85%,rgba(120,255,200,0.08),transparent_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.45),rgba(0,0,0,0.85))]" />
        <div className="absolute inset-0 opacity-[0.18] [background-image:radial-gradient(rgba(255,255,255,0.22)_1px,transparent_1px)] [background-size:22px_22px]" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-5 pb-20 pt-10">
        {/* top bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/maia')}
            className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 backdrop-blur transition hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 opacity-80 transition group-hover:opacity-100" />
            Return to MAIA
          </button>

          <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/70 backdrop-blur md:flex">
            <Shield className="h-4 w-4" />
            {tier.toUpperCase()} • {readingsThisWeek} this week
          </div>
        </div>

        {/* header */}
        <div className="mt-10 grid gap-10 md:grid-cols-[1.2fr_0.8fr] md:items-end">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: 'easeOut' }}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/70 backdrop-blur"
            >
              <Sparkles className="h-4 w-4" />
              Oracle Consultation
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05, ease: 'easeOut' }}
              className="mt-5 text-3xl font-semibold tracking-tight text-white md:text-5xl"
            >
              Reflect your spiral.
              <span className="block text-white/70">
                Elements, states, and phases — made visible.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
              className="mt-5 max-w-2xl text-base leading-relaxed text-white/70"
            >
              Each oracle is a different lens for the same living truth: you are in motion.
              Use these portals as meditation — to clarify what's emerging, what's completing,
              and what wants your attention next.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12, ease: 'easeOut' }}
            className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur"
          >
            <div className="text-sm font-medium text-white/90">A simple way to enter</div>
            <div className="mt-2 text-sm text-white/70">
              Name the life area (relationship, work, health, purpose). Then ask:
            </div>
            <div className="mt-4 space-y-2 text-sm text-white/75">
              <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3">
                "What is the nature of this moment?"
              </div>
              <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3">
                "What wants to evolve next?"
              </div>
              <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3">
                "What is the wise posture to take?"
              </div>
            </div>
          </motion.div>
        </div>

        {/* method grid */}
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {methods.map((m, idx) => {
            const Icon = m.icon;
            const allowed = canAccess(m.key);

            return (
              <motion.div
                key={m.key}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.08 + idx * 0.06, ease: 'easeOut' }}
                className={cx(
                  'relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur',
                  'hover:bg-white/[0.07] transition'
                )}
              >
                {/* subtle accent wash */}
                <div className={cx('pointer-events-none absolute inset-0 bg-gradient-to-br', m.accent)} />

                {/* subtle sigil (NOT huge, NOT opaque) */}
                <div className="pointer-events-none absolute right-4 top-4 select-none text-5xl font-semibold text-white/10">
                  {m.sigil}
                </div>

                <div className="relative flex items-start justify-between gap-3">
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-black/20">
                    <Icon className="h-5 w-5 text-white/80" />
                  </div>
                  {!allowed && (
                    <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-white/70">
                      Locked
                    </span>
                  )}
                </div>

                <div className="relative mt-4">
                  <div className="text-xl font-semibold tracking-tight text-white">{m.title}</div>
                  <div className="mt-1 text-sm text-white/70">{m.subtitle}</div>
                  <p className="mt-4 text-sm leading-relaxed text-white/70">{m.description}</p>

                  <div className="mt-5 rounded-xl border border-white/10 bg-black/20 px-4 py-3">
                    <div className="text-xs font-medium text-white/80">Ritual cue</div>
                    <div className="mt-1 text-sm text-white/70">{m.ritual}</div>
                  </div>

                  <div className="mt-6">
                    <button
                      disabled={!allowed}
                      onClick={() => allowed && handleEnter(m.route, m.key)}
                      className={cx(
                        'group inline-flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition',
                        allowed
                          ? 'bg-white/10 hover:bg-white/15 border border-white/10'
                          : 'bg-white/5 border border-white/10 text-white/40 cursor-not-allowed'
                      )}
                    >
                      <span>Enter</span>
                      <ChevronRight className="h-4 w-4 opacity-70 transition group-hover:translate-x-0.5 group-hover:opacity-90" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* footer note */}
        <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/70 backdrop-blur">
          <div className="text-white/85 font-medium">A Soullab note</div>
          <p className="mt-2 leading-relaxed">
            These are not "fortune" tools — they're coherence tools. Let the reading become a mirror:
            notice what you feel, what you resist, what you already knew, and what you're now willing to admit.
          </p>
        </div>
      </div>
    </div>
  );
}
