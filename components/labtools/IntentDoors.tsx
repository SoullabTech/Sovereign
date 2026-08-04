'use client';

/**
 * IntentDoors - the way in to My Lab
 *
 * Three doors framed as the member's moment, not the builder's taxonomy.
 * A door is a filter, not a destination: pressing one narrows the shelf
 * below it in place. Nothing navigates away, nothing is hidden behind a
 * second page, and pressing the active door again returns everything.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Waves, Eye, Zap, type LucideIcon } from 'lucide-react';
import {
  INTENT_ORDER,
  INTENT_PROMPT,
  SIMPLE_MODE_META,
  type SimpleMode,
} from '@/lib/labtools/intent';

const INTENT_ICON: Record<SimpleMode, LucideIcon> = {
  shift: Waves,
  notice: Eye,
  'act-group': Zap,
};

interface IntentDoorsProps {
  counts: Record<SimpleMode, number>;
  active: SimpleMode | null;
  onSelect: (intent: SimpleMode | null) => void;
}

export function IntentDoors({ counts, active, onSelect }: IntentDoorsProps) {
  return (
    <section aria-labelledby="lab-intent-heading">
      <h2
        id="lab-intent-heading"
        className="text-[13px] text-white/40 mb-3"
      >
        What do you need right now?
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {INTENT_ORDER.map((intent, idx) => {
          const meta = SIMPLE_MODE_META[intent];
          const Icon = INTENT_ICON[intent];
          const isActive = active === intent;
          const count = counts[intent] ?? 0;

          return (
            <motion.button
              key={intent}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06, duration: 0.3 }}
              onClick={() => onSelect(isActive ? null : intent)}
              aria-pressed={isActive}
              aria-label={`${INTENT_PROMPT[intent]} — ${count} ${
                count === 1 ? 'instrument' : 'instruments'
              }`}
              className={`
                group relative text-left rounded-2xl border
                px-3.5 py-3 sm:p-4
                transition-colors duration-200
                focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4B896]/60
                ${
                  isActive
                    ? 'bg-[#D4B896]/[0.12] border-[#D4B896]/45'
                    : 'bg-white/[0.03] border-white/[0.07] hover:bg-white/[0.055] hover:border-[#D4B896]/25'
                }
              `}
            >
              {/* Compact row on phones, stacked block from sm up -- three tall
                  doors would otherwise consume the entire first screen. */}
              <div className="flex flex-row sm:flex-col items-center sm:items-start gap-3 sm:gap-0">
                <span
                  className={`
                    flex-shrink-0 inline-flex items-center justify-center
                    w-9 h-9 rounded-lg sm:mb-3
                    transition-colors duration-200
                    ${
                      isActive
                        ? 'bg-[#D4B896]/20 text-[#D4B896]'
                        : 'bg-[#D4B896]/[0.08] text-[#D4B896]/70 group-hover:bg-[#D4B896]/[0.16] group-hover:text-[#D4B896]'
                    }
                  `}
                >
                  <Icon className="w-[18px] h-[18px]" strokeWidth={1.75} />
                </span>

                <div className="min-w-0">
                  <div
                    className={`text-[15px] font-medium leading-snug transition-colors ${
                      isActive ? 'text-white' : 'text-white/85 group-hover:text-white'
                    }`}
                  >
                    {INTENT_PROMPT[intent]}
                  </div>

                  <div className="mt-0.5 sm:mt-1 flex items-baseline gap-2">
                    <span className="text-[12px] text-white/35">{meta.label}</span>
                    <span className="text-[12px] text-white/25">
                      {count} {count === 1 ? 'instrument' : 'instruments'}
                    </span>
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
