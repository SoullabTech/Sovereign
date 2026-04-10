'use client';

/**
 * OpenThreads — The continuity surface for the MAIA field.
 *
 * Shows 1-3 soft indicators of what is still unfolding.
 * No analysis. No certainty. Just threads still in motion.
 *
 * Data: /api/maia/field-state (spiral state, themes, sessions)
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '@/lib/http/apiBase';

interface Thread {
  type: 'spiral' | 'theme' | 'session';
  text: string;
  detail?: string;
}

interface FieldState {
  threads: Thread[];
  spiralState: {
    element: string;
    phase: number;
    motion: string;
    relationalPhase: number;
  } | null;
  hasHistory: boolean;
}

interface OpenThreadsProps {
  memberId: string;
}

const ELEMENT_COLORS: Record<string, string> = {
  fire: 'text-orange-400/80',
  water: 'text-blue-300/80',
  earth: 'text-emerald-400/80',
  air: 'text-sky-300/80',
  aether: 'text-violet-300/80',
};

export function OpenThreads({ memberId }: OpenThreadsProps) {
  const [fieldState, setFieldState] = useState<FieldState | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!memberId || memberId === 'guest') {
      setLoaded(true);
      return;
    }

    apiFetch(`/api/maia/field-state?memberId=${memberId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          setFieldState(data);
          // Cache field state for greeting + doorway (available on next visit)
          try {
            if (data.spiralState?.relationalPhase) {
              localStorage.setItem(
                'maia_relational_phase',
                String(data.spiralState.relationalPhase)
              );
            }
            if (data.spiralState?.motion) {
              localStorage.setItem(
                'maia_spiral_motion',
                data.spiralState.motion
              );
            }
          } catch { /* localStorage unavailable */ }
        }
      })
      .catch(() => {
        // Graceful — show nothing rather than error
      })
      .finally(() => setLoaded(true));
  }, [memberId]);

  // Don't render until loaded
  if (!loaded) return null;

  // Only render when there are specific, real threads — no placeholders
  if (!fieldState || fieldState.threads.length === 0) {
    return null;
  }

  const elementColor = fieldState.spiralState?.element
    ? ELEMENT_COLORS[fieldState.spiralState.element] || 'text-[#D4B896]/70'
    : 'text-[#D4B896]/70';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.8 }}
      className="w-full max-w-md mx-auto px-6 mt-8"
    >
      {/* Threads — no header, they speak for themselves */}
      <div className="space-y-3">
        <AnimatePresence>
          {fieldState.threads.map((thread, i) => (
            <motion.div
              key={`${thread.type}-${i}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + i * 0.15, duration: 0.6 }}
              className="flex items-start gap-3"
            >
              {/* Indicator dot */}
              <div className="mt-1.5 flex-shrink-0">
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    thread.type === 'spiral'
                      ? 'bg-[#D4B896]/50'
                      : thread.type === 'theme'
                      ? 'bg-white/20'
                      : 'bg-white/15'
                  }`}
                />
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-light leading-relaxed ${elementColor}`}>
                  {thread.text}
                </p>
                {thread.detail && (
                  <p className="text-xs text-white/30 font-light mt-0.5 leading-relaxed">
                    {thread.detail}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
