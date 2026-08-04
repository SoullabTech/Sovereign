'use client';

/**
 * ToolGroup - one labelled shelf of instruments
 *
 * Used for both ways of looking (by need, by domain) and for the
 * infrastructure drawer, so every grouping on the page reads identically.
 * The heading is a quiet label, not a coloured banner -- with eight groups
 * on one page, competing section styling is what made the old shelf feel
 * like a warehouse.
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { ToolCard, type ToolCardTool } from './ToolCard';

interface ToolGroupProps {
  title: string;
  /** Optional one-line orientation under the title */
  subtitle?: string;
  tools: ToolCardTool[];
  onOpen?: (toolId: string) => void;
  /** Render as a collapsible drawer */
  collapsible?: boolean;
  collapsed?: boolean;
  onToggle?: () => void;
  compact?: boolean;
}

export function ToolGroup({
  title,
  subtitle,
  tools,
  onOpen,
  collapsible = false,
  collapsed = false,
  onToggle,
  compact = false,
}: ToolGroupProps) {
  if (tools.length === 0) return null;

  const isOpen = !collapsible || !collapsed;

  const heading = (
    <div className="flex items-baseline gap-2.5 min-w-0">
      <h3 className="text-[13px] font-medium text-white/55">{title}</h3>
      <span className="text-[12px] text-white/25 tabular-nums">{tools.length}</span>
      {subtitle && (
        <span className="text-[12px] text-white/30 truncate hidden sm:inline">
          {subtitle}
        </span>
      )}
    </div>
  );

  const grid = (
    <div
      className={`grid gap-2.5 ${
        compact
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
          : 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'
      }`}
    >
      {tools.map((tool) => (
        <ToolCard key={tool.id} tool={tool} onOpen={onOpen} compact={compact} />
      ))}
    </div>
  );

  return (
    <section className="space-y-3">
      {collapsible ? (
        <button
          onClick={onToggle}
          aria-expanded={isOpen}
          className="w-full flex items-center gap-2 py-1 group
                     focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4B896]/60 rounded-lg"
        >
          <motion.span
            animate={{ rotate: isOpen ? 90 : 0 }}
            transition={{ duration: 0.18 }}
            className="text-white/30 group-hover:text-white/60 transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" strokeWidth={2} />
          </motion.span>
          {heading}
        </button>
      ) : (
        <div className="py-1">{heading}</div>
      )}

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={collapsible ? { opacity: 0, height: 0 } : false}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            {grid}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
