'use client';

/**
 * RecentStrip - "pick up where you left off"
 *
 * The single answer to the return test on this surface: when the member comes
 * back after time away, what do they naturally resume?
 *
 * Renders nothing at all when the member has opened nothing. An empty strip
 * is not padded with suggestions -- absence here is a true statement, and the
 * intent doors already carry the first visit.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { getToolById } from '@/config/toolRegistry';
import { relativeUse, type ToolCardTool } from './ToolCard';

interface RecentStripProps {
  tools: ToolCardTool[];
  onOpen?: (toolId: string) => void;
  /** How many to show (default 5) */
  limit?: number;
}

export function RecentStrip({ tools, onOpen, limit = 5 }: RecentStripProps) {
  const router = useRouter();
  const shown = tools.slice(0, limit);

  if (shown.length === 0) return null;

  return (
    <section aria-labelledby="lab-recent-heading">
      <h2 id="lab-recent-heading" className="text-[13px] text-white/40 mb-3">
        Pick up where you left off
      </h2>

      <div className="flex flex-wrap gap-2">
        {shown.map((tool, idx) => {
          const Icon = getToolById(tool.id)?.icon;
          const when = relativeUse(tool.lastUsedAt);

          return (
            <motion.button
              key={tool.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04, duration: 0.25 }}
              onClick={() => {
                onOpen?.(tool.id);
                router.push(tool.path);
              }}
              aria-label={`${tool.label}${when ? `, last opened ${when}` : ''}`}
              className="group inline-flex items-center gap-2.5 pl-2.5 pr-3.5 py-2
                         rounded-full bg-white/[0.035] hover:bg-white/[0.07]
                         border border-white/[0.07] hover:border-[#D4B896]/30
                         transition-colors duration-200
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4B896]/60"
            >
              <span className="flex items-center justify-center w-6 h-6 rounded-full
                             bg-[#D4B896]/[0.1] text-[#D4B896]/80
                             group-hover:bg-[#D4B896]/20 group-hover:text-[#D4B896]
                             transition-colors">
                {Icon ? (
                  <Icon className="w-3.5 h-3.5" strokeWidth={1.75} />
                ) : (
                  <span className="text-[11px]">{tool.emoji}</span>
                )}
              </span>

              <span className="text-[13px] font-medium text-white/80 group-hover:text-white transition-colors">
                {tool.label}
              </span>

              {when && (
                <span className="text-[11px] text-white/25 group-hover:text-white/40 transition-colors">
                  {when}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
