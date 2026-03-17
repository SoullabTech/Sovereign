'use client';

/**
 * MentorStanceToggle
 *
 * Small visible badge for Care mode — shows when supervision stance is active.
 * Lets practitioners toggle mentor mode without touching the console.
 *
 * Activation: only renders when realtimeMode === 'counsel'.
 * State persisted via localStorage key 'maia.mentorStance.enabled'.
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MENTOR_STANCE_KEY = 'maia.mentorStance.enabled';
export const MENTOR_STANCE_CHANGED = 'maia-mentor-stance-changed';

function readEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(MENTOR_STANCE_KEY) === '1';
}

function writeEnabled(value: boolean) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(MENTOR_STANCE_KEY, value ? '1' : '0');
  window.dispatchEvent(new Event(MENTOR_STANCE_CHANGED));
}

interface MentorStanceToggleProps {
  isCareMode: boolean;
  className?: string;
}

export function MentorStanceToggle({ isCareMode, className = '' }: MentorStanceToggleProps) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(readEnabled());
    const handler = () => setEnabled(readEnabled());
    window.addEventListener(MENTOR_STANCE_CHANGED, handler);
    return () => window.removeEventListener(MENTOR_STANCE_CHANGED, handler);
  }, []);

  const toggle = useCallback(() => {
    const next = !enabled;
    writeEnabled(next);
    setEnabled(next);
  }, [enabled]);

  return (
    <AnimatePresence>
      {isCareMode && (
        <motion.button
          key="mentor-toggle"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          onClick={toggle}
          title={enabled ? 'Mentor stance active — click to disable' : 'Enable Mentor stance (supervision mode)'}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium
            transition-all duration-200 border
            ${enabled
              ? 'bg-teal-500/20 border-teal-400/50 text-teal-300 shadow-sm shadow-teal-500/20'
              : 'bg-white/5 border-white/10 text-white/40 hover:text-white/60 hover:bg-white/8'
            }
            ${className}`}
        >
          <span>{enabled ? '⚕' : '⚕'}</span>
          <span>{enabled ? 'Mentor' : 'Mentor off'}</span>
          {enabled && (
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
          )}
        </motion.button>
      )}
    </AnimatePresence>
  );
}

export default MentorStanceToggle;
