'use client';

import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

type MeaningThread = {
  id: string;
  phrase: string;
  reflection: string;
  x: number;
  y: number;
  intensity: 'low' | 'medium' | 'high';
  sacredLine?: string;
};

type DepthWellProps = {
  threads?: MeaningThread[];
};

const DEFAULT_THREADS: MeaningThread[] = [
  {
    id: 'being-seen',
    phrase: 'Something about being seen',
    reflection:
      'This has come forward more than once, each time from a different angle. It still has not asked to be named directly.',
    x: 47,
    y: 32,
    intensity: 'high',
    sacredLine:
      'There are lights too strong to be seen directly, and so they arrive by indirection.',
  },
  {
    id: 'same-door',
    phrase: 'The same door keeps appearing',
    reflection:
      'What looks like repetition may be a threshold returning until your way of meeting it changes.',
    x: 63,
    y: 47,
    intensity: 'medium',
  },
  {
    id: 'protecting',
    phrase: "What you're protecting isn't what you think",
    reflection:
      'The surface explanation shifts, but the protecting remains. Something beneath it is asking for a different kind of attention.',
    x: 36,
    y: 56,
    intensity: 'medium',
  },
];

function getThreadOpacity(
  thread: MeaningThread,
  activeId: string | null,
  relatedCount: number
) {
  if (!activeId) {
    if (thread.intensity === 'high') return 0.92;
    if (thread.intensity === 'medium') return 0.72;
    return 0.48;
  }

  if (thread.id === activeId) return 1;
  if (relatedCount > 1) return 0.32;
  return 0.4;
}

function getThreadGlow(intensity: MeaningThread['intensity'], active: boolean) {
  if (active) {
    return '0 0 22px rgba(255,243,199,0.18), 0 0 52px rgba(251,191,36,0.12)';
  }

  switch (intensity) {
    case 'high':
      return '0 0 16px rgba(255,243,199,0.12), 0 0 34px rgba(251,191,36,0.07)';
    case 'medium':
      return '0 0 12px rgba(255,255,255,0.08), 0 0 24px rgba(255,255,255,0.03)';
    default:
      return '0 0 8px rgba(255,255,255,0.05), 0 0 16px rgba(255,255,255,0.02)';
  }
}

export default function DepthWell({ threads = DEFAULT_THREADS }: DepthWellProps) {
  const [activeId, setActiveId] = useState<string | null>(
    threads.length > 0 ? threads[0].id : null
  );

  const activeThread = useMemo(
    () => threads.find((thread) => thread.id === activeId) ?? null,
    [threads, activeId]
  );

  const hasThreads = threads.length > 0;

  return (
    <div className="relative w-full">
      <div className="mb-8 text-center">
        <p className="text-sm italic tracking-wide text-white/[0.42]">
          Something wants to be understood.
        </p>
      </div>

      <div className="relative min-h-[620px] overflow-hidden rounded-[36px] border border-white/[0.04] bg-[#05070c]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,rgba(251,191,36,0.05),rgba(255,243,199,0.03)_14%,rgba(255,255,255,0.015)_20%,rgba(0,0,0,0)_38%),radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.015),rgba(0,0,0,0)_52%),linear-gradient(to_bottom,rgba(8,10,16,0.75),rgba(3,4,8,0.96))]" />

        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          animate={{
            opacity: [0.72, 0.9, 0.72],
            scale: [1, 1.035, 1],
          }}
          transition={{
            duration: 11,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            background:
              'radial-gradient(circle, rgba(255,246,214,0.08) 0%, rgba(251,191,36,0.05) 16%, rgba(255,255,255,0.018) 28%, rgba(0,0,0,0) 58%)',
            filter: 'blur(10px)',
          }}
        />

        {hasThreads ? (
          <>
            {threads.map((thread, index) => {
              const active = thread.id === activeId;

              return (
                <motion.button
                  key={thread.id}
                  type="button"
                  onMouseEnter={() => setActiveId(thread.id)}
                  onFocus={() => setActiveId(thread.id)}
                  onClick={() => setActiveId(thread.id)}
                  className="absolute max-w-[260px] -translate-x-1/2 -translate-y-1/2 text-left focus:outline-none"
                  style={{
                    left: `${thread.x}%`,
                    top: `${thread.y}%`,
                    opacity: getThreadOpacity(thread, activeId, threads.length),
                    textShadow: '0 0 10px rgba(255,255,255,0.05)',
                    boxShadow: getThreadGlow(thread.intensity, active),
                  }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{
                    opacity: getThreadOpacity(thread, activeId, threads.length),
                    y: [0, index % 2 === 0 ? -3 : 3, 0],
                    scale: active ? 1.03 : 1,
                  }}
                  transition={{
                    opacity: { duration: 0.28 },
                    scale: { duration: 0.24 },
                    y: {
                      duration: 13 + index * 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    },
                  }}
                >
                  <span
                    className={`block text-[15px] leading-7 transition-colors ${
                      active ? 'text-white/[0.86]' : 'text-white/[0.56]'
                    }`}
                  >
                    {thread.phrase}
                  </span>
                </motion.button>
              );
            })}

            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#04060b] to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center px-8 text-center">
            <p className="max-w-md text-sm italic leading-7 text-white/[0.34]">
              Nothing has gathered here yet. It will.
            </p>
          </div>
        )}
      </div>

      <div className="mt-10 min-h-[190px]">
        <AnimatePresence mode="wait">
          {hasThreads && activeThread ? (
            <motion.div
              key={activeThread.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.26 }}
              className="mx-auto max-w-2xl"
            >
              <p className="text-center text-sm leading-8 text-white/[0.72]">
                {activeThread.reflection}
              </p>

              <div className="mt-10 text-center">
                <p className="text-sm italic leading-8 text-white/[0.42]">
                  Some things don&apos;t resolve. They deepen.
                </p>
              </div>

              <div className="mt-6 text-center">
                <p className="mx-auto max-w-xl text-sm leading-8 text-white/[0.55]">
                  What you call uncertainty and what you call waiting may be
                  different surfaces of the same movement.
                </p>
              </div>

              {activeThread.sacredLine ? (
                <div className="mt-10 text-center">
                  <p className="mx-auto max-w-xl text-sm italic leading-8 text-amber-100/[0.42]">
                    {activeThread.sacredLine}
                  </p>
                </div>
              ) : null}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
