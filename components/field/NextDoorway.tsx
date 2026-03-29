'use client';

/**
 * NextDoorway — One grounded suggestion for where to step next.
 *
 * Not a menu. Not options. Just one clear invitation,
 * derived from existing field state.
 *
 * Logic (priority order):
 *   1. If open threads exist → "Continue this thread"
 *   2. If spiral motion = 'stuck' → "Check in with what's present"
 *   3. If spiral motion = 'breakthrough' → "Record what shifted"
 *   4. Default → "Begin where you are"
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface DoorwaySuggestion {
  text: string;
  action: 'voice' | 'journal' | 'checkin';
}

interface NextDoorwayProps {
  hasThreads: boolean;
  spiralMotion?: string | null;
  onActivate?: () => void;
}

function deriveDoorway(hasThreads: boolean, motion?: string | null): DoorwaySuggestion {
  if (hasThreads) {
    return { text: 'You can continue this', action: 'voice' };
  }

  switch (motion) {
    case 'stuck':
      return { text: 'You can check in with what\u2019s present', action: 'checkin' };
    case 'breakthrough':
      return { text: 'You can record what shifted', action: 'journal' };
    case 'ascending':
      return { text: 'You can stay with what\u2019s opening', action: 'voice' };
    default:
      return { text: 'You can begin where you are', action: 'voice' };
  }
}

export function NextDoorway({ hasThreads, spiralMotion, onActivate }: NextDoorwayProps) {
  const [visible, setVisible] = useState(false);
  const doorway = deriveDoorway(hasThreads, spiralMotion);

  useEffect(() => {
    // Delay appearance so it feels unhurried
    const timer = setTimeout(() => setVisible(true), 1400);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mt-8"
    >
      <button
        onClick={onActivate}
        className="group flex items-center gap-2 px-5 py-2.5 rounded-full
                   bg-white/[0.04] hover:bg-white/[0.08]
                   border border-white/[0.08] hover:border-[#D4B896]/30
                   transition-all duration-300"
      >
        <span className="text-sm text-white/40 group-hover:text-[#D4B896]/80 font-light transition-colors"
              style={{ fontFamily: 'Spectral, Georgia, serif' }}>
          {doorway.text}
        </span>
        <span className="text-white/20 group-hover:text-[#D4B896]/60 transition-colors text-xs">
          &rarr;
        </span>
      </button>
    </motion.div>
  );
}
