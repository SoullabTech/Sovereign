'use client';

/**
 * CategorySection - Collapsible category container for My Lab
 *
 * Each section feels like a drawer you can open or close.
 * Collapsed state persists to member preferences.
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { ToolCard } from './ToolCard';
import { type HydratedCategory } from '@/lib/services/memberToolsService';

interface CategorySectionProps {
  category: HydratedCategory;
  onToggleCollapsed: (category: string) => void;
  /** Use compact tool cards */
  compact?: boolean;
}

export function CategorySection({
  category,
  onToggleCollapsed,
  compact = false,
}: CategorySectionProps) {
  const handleToggle = () => {
    onToggleCollapsed(category.category);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      {/* Section Header */}
      <button
        onClick={handleToggle}
        className="w-full flex items-center gap-3 py-2 group"
      >
        {/* Collapse indicator */}
        <motion.div
          animate={{ rotate: category.collapsed ? 0 : 90 }}
          transition={{ duration: 0.2 }}
          className="text-white/30 group-hover:text-white/50 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </motion.div>

        {/* Category icon */}
        <span className="text-xl">{category.emoji}</span>

        {/* Category label */}
        <h2 className="text-sm font-medium tracking-wide text-white/70 group-hover:text-white/90 transition-colors uppercase">
          {category.label}
        </h2>

        {/* Tool count badge */}
        <span className="text-xs text-white/30 group-hover:text-white/50 transition-colors">
          {category.tools.length}
        </span>

        {/* Spacer line */}
        <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
      </button>

      {/* Tools Grid */}
      <AnimatePresence mode="wait">
        {!category.collapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div
              className={`
                grid gap-2
                ${compact
                  ? 'grid-cols-1 sm:grid-cols-2'
                  : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                }
              `}
            >
              {category.tools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} compact={compact} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
