'use client';

/**
 * DiscoverCard - Tool card for the Discover page
 *
 * Shows more detail than ToolCard, with Add/Remove toggle.
 * Designed to make discovery feel like browsing a curated collection.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Check, Lock } from 'lucide-react';
import { type LabTool, type Tier } from '@/config/toolRegistry';

interface DiscoverCardProps {
  tool: LabTool;
  isEnabled: boolean;
  memberTier: Tier;
  onToggle: (toolId: string, add: boolean) => void;
  isLoading?: boolean;
}

export function DiscoverCard({
  tool,
  isEnabled,
  memberTier,
  onToggle,
  isLoading = false,
}: DiscoverCardProps) {
  // Check if member has access
  const tierRank: Record<Tier, number> = { free: 0, personal: 1, pro: 2 };
  const hasAccess = tierRank[memberTier] >= tierRank[tool.minTier];
  const isLocked = !hasAccess;

  const handleToggle = () => {
    if (isLocked || isLoading || tool.comingSoon) return;
    onToggle(tool.id, !isEnabled);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`
        relative rounded-2xl overflow-hidden
        bg-white/[0.02] border border-white/[0.06]
        ${isLocked ? 'opacity-60' : ''}
        ${tool.comingSoon ? 'opacity-50' : ''}
      `}
    >
      {/* Gradient background based on category */}
      <div className={`absolute inset-0 bg-gradient-to-br ${tool.category === 'oracles' ? 'from-violet-500/5' : ''} ${tool.category === 'reflection' ? 'from-amber-500/5' : ''} ${tool.category === 'training' ? 'from-emerald-500/5' : ''} to-transparent pointer-events-none`} />

      <div className="relative p-5">
        {/* Header row */}
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-white/[0.05] flex items-center justify-center text-3xl">
            {tool.emoji}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-white/90">{tool.label}</h3>

              {/* Tier badge */}
              {tool.minTier !== 'free' && (
                <span
                  className={`
                    px-2 py-0.5 text-[10px] font-medium rounded-full uppercase tracking-wide
                    ${tool.minTier === 'personal'
                      ? 'bg-[#D4B896]/20 text-[#D4B896]'
                      : 'bg-violet-500/20 text-violet-400'
                    }
                  `}
                >
                  {tool.minTier}
                </span>
              )}

              {tool.isNew && (
                <span className="px-2 py-0.5 text-[10px] font-medium bg-emerald-500/20 text-emerald-400 rounded-full">
                  NEW
                </span>
              )}

              {tool.comingSoon && (
                <span className="px-2 py-0.5 text-[10px] font-medium bg-white/10 text-white/50 rounded-full">
                  COMING SOON
                </span>
              )}
            </div>

            <p className="text-sm text-white/60 mt-1">
              {tool.shortDescription}
            </p>
          </div>

          {/* Add/Remove button */}
          <button
            onClick={handleToggle}
            disabled={isLocked || isLoading || tool.comingSoon}
            className={`
              flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center
              transition-all duration-200
              ${isLocked || tool.comingSoon
                ? 'bg-white/5 text-white/20 cursor-not-allowed'
                : isEnabled
                  ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                  : 'bg-white/5 text-white/50 hover:bg-[#D4B896]/20 hover:text-[#D4B896]'
              }
              ${isLoading ? 'animate-pulse' : ''}
            `}
          >
            {isLocked ? (
              <Lock className="w-4 h-4" />
            ) : isEnabled ? (
              <Check className="w-5 h-5" />
            ) : (
              <Plus className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Long description (if available) */}
        {tool.longDescription && (
          <p className="text-xs text-white/40 mt-3 line-clamp-2">
            {tool.longDescription}
          </p>
        )}

        {/* Tags */}
        {tool.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {tool.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-[10px] text-white/30 bg-white/[0.03] rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
