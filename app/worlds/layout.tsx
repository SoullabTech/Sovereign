'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

// ─────────────────────────────────────────────────────────────────────────────
// Per-world cue text — same crossing ritual, different perceptual invitation
// ─────────────────────────────────────────────────────────────────────────────

const WORLD_CUES: Record<string, string> = {
  patterns: 'Notice what is already forming.',
  depth: 'Wait until something gathers.',
  journey: 'The path appears by entering it.',
};

function getWorldFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/worlds\/([^/]+)/);
  return match ? match[1] : null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Threshold Layout
//
// Three-phase crossing:
//   1. Suspension (0–350ms)  — dark field fills, attention narrows
//   2. Cue        (350–750ms) — one orienting line, per-world
//   3. Reveal     (750ms+)    — cue recedes, world content released
//
// The crossing plays once per navigation. It is not a loading screen.
// It changes the user's mode before arrival.
// ─────────────────────────────────────────────────────────────────────────────

export default function WorldsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() ?? '';
  const world = getWorldFromPath(pathname);
  const cue = (world && WORLD_CUES[world]) || '';

  const [phase, setPhase] = useState<'suspend' | 'cue' | 'reveal'>('suspend');

  useEffect(() => {
    // Reset to suspension on every route change (re-entry = re-crossing)
    setPhase('suspend');

    const cueTimer = setTimeout(() => setPhase('cue'), 350);
    const revealTimer = setTimeout(() => setPhase('reveal'), 900);

    return () => {
      clearTimeout(cueTimer);
      clearTimeout(revealTimer);
    };
  }, [pathname]);

  return (
    <div className="relative min-h-screen bg-[#03050a]">
      {/* World content — withheld then released */}
      <motion.div
        animate={{
          opacity: phase === 'reveal' ? 1 : 0,
        }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-0"
      >
        {children}
      </motion.div>

      {/* Threshold overlay — suspension + cue */}
      <AnimatePresence>
        {phase !== 'reveal' && (
          <motion.div
            key="threshold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              enter: { duration: 0.2 },
              exit: { duration: 0.45, ease: 'easeOut' },
            }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#03050a]"
          >
            {/* Soft central light — implied field, not drawn object */}
            <div
              className="pointer-events-none absolute h-[320px] w-[320px] rounded-full"
              style={{
                background:
                  'radial-gradient(circle, rgba(255,246,214,0.04) 0%, rgba(251,191,36,0.025) 20%, rgba(0,0,0,0) 55%)',
                filter: 'blur(8px)',
              }}
            />

            {/* Cue text — one line, per-world */}
            <AnimatePresence>
              {phase === 'cue' && cue && (
                <motion.p
                  key="cue-text"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -2 }}
                  transition={{ duration: 0.32, ease: 'easeOut' }}
                  className="relative z-10 max-w-md text-center text-sm italic leading-8 tracking-wide text-white/[0.42]"
                >
                  {cue}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
