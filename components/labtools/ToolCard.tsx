'use client';

/**
 * ToolCard - a single instrument in My Lab
 *
 * Design rules this card exists to hold:
 *  - The name is the loud element. Everything else is quiet.
 *  - The promise is never truncated mid-word. It wraps to two lines.
 *  - One accent colour for the whole surface. Domain is communicated by
 *    position and heading, not by a different tint per card.
 *  - A Lucide mark from the registry, not an emoji, so 40 cards read as one
 *    set rather than forty separate decisions.
 *  - NEW means "new to you, not yet opened". It decays on first use instead
 *    of sitting on every card forever.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { getToolById, type LabTool } from '@/config/toolRegistry';

export interface ToolCardTool extends LabTool {
  lastUsedAt?: string | null;
  useCount?: number;
}

interface ToolCardProps {
  tool: ToolCardTool;
  /** Called before navigation so the Lab can remember what was opened */
  onOpen?: (toolId: string) => void;
  /** Denser presentation for infrastructure rows */
  compact?: boolean;
}

/** "3d" / "2h" / "just now" — a quiet mark, not a timestamp. */
export function relativeUse(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return null;
  const mins = Math.floor((Date.now() - then) / 60000);
  if (mins < 2) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export function ToolCard({ tool, onOpen, compact = false }: ToolCardProps) {
  const router = useRouter();

  // The icon is a React component and cannot survive the JSON API payload,
  // so resolve it from the registry on the client.
  const Icon = getToolById(tool.id)?.icon;

  const neverOpened = !tool.lastUsedAt;
  const showNew = Boolean(tool.isNew) && neverOpened;

  const handleClick = () => {
    if (tool.comingSoon) return;
    onOpen?.(tool.id);
    router.push(tool.path);
  };

  return (
    <motion.button
      onClick={handleClick}
      disabled={tool.comingSoon}
      aria-label={`${tool.label} — ${tool.shortDescription}`}
      whileHover={tool.comingSoon ? undefined : { y: -2 }}
      whileTap={tool.comingSoon ? undefined : { scale: 0.99 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={`
        group relative w-full h-full text-left rounded-xl
        border transition-colors duration-200
        focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4B896]/60
        ${compact ? 'p-3' : 'p-4'}
        ${
          tool.comingSoon
            ? 'opacity-40 cursor-not-allowed bg-white/[0.02] border-white/[0.05]'
            : 'bg-white/[0.025] hover:bg-white/[0.05] border-white/[0.07] hover:border-[#D4B896]/35'
        }
      `}
    >
      <div className="flex items-start gap-3">
        {/* Mark */}
        <span
          className={`
            flex-shrink-0 flex items-center justify-center rounded-lg
            bg-[#D4B896]/[0.08] text-[#D4B896]/80
            group-hover:bg-[#D4B896]/[0.16] group-hover:text-[#D4B896]
            transition-colors duration-200
            ${compact ? 'w-8 h-8' : 'w-9 h-9'}
          `}
        >
          {Icon ? (
            <Icon className={compact ? 'w-4 h-4' : 'w-[18px] h-[18px]'} strokeWidth={1.75} />
          ) : (
            <span className="text-base">{tool.emoji}</span>
          )}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span
              className={`
                font-medium text-white/90 group-hover:text-white
                transition-colors leading-snug
                ${compact ? 'text-[13px]' : 'text-[15px]'}
              `}
            >
              {tool.label}
            </span>

            {showNew && (
              <span className="flex-shrink-0 text-[10px] font-medium uppercase tracking-wider text-[#D4B896]/60">
                New
              </span>
            )}
            {tool.isBeta && (
              <span className="flex-shrink-0 text-[10px] font-medium uppercase tracking-wider text-white/35">
                Beta
              </span>
            )}
            {tool.comingSoon && (
              <span className="flex-shrink-0 text-[10px] font-medium uppercase tracking-wider text-white/30">
                Soon
              </span>
            )}
          </div>

          {!compact && (
            <p className="mt-1 text-[13px] leading-[1.45] text-white/45 group-hover:text-white/60 transition-colors line-clamp-2">
              {tool.shortDescription}
            </p>
          )}
        </div>
      </div>
    </motion.button>
  );
}
