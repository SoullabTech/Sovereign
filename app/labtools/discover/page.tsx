'use client';

/**
 * Discover Tools - The Catalog
 *
 * This is browsing, not shopping. Exploring, not selecting.
 * Each tool is presented with enough context to spark curiosity.
 *
 * The vibe: wandering through a cabinet of curiosities.
 * Serious instruments, presented playfully.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search, X, Sparkles, Check, Lightbulb } from 'lucide-react';
import { useMemberTools } from '@/hooks/useMemberTools';
import { DiscoverCard } from '@/components/labtools/DiscoverCard';
import { CategoryChips } from '@/components/labtools/CategoryChips';
import {
  TOOL_REGISTRY,
  CATEGORY_META,
  searchTools,
  getToolsByCategory,
  type ToolCategory,
  type Tier,
} from '@/config/toolRegistry';

export default function DiscoverPage() {
  const router = useRouter();
  const { isToolEnabled, addTool, removeTool, refresh } = useMemberTools();

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory | 'all'>('all');
  const [loadingToolId, setLoadingToolId] = useState<string | null>(null);
  const [justAdded, setJustAdded] = useState<string | null>(null);

  // TODO: Get actual member tier from auth context
  const memberTier: Tier = 'personal';

  // Filtered tools
  const filteredTools = useMemo(() => {
    let tools = searchQuery
      ? searchTools(searchQuery)
      : selectedCategory === 'all'
        ? TOOL_REGISTRY
        : getToolsByCategory(selectedCategory);

    // Sort: enabled first, then by popularity
    return tools.sort((a, b) => {
      const aEnabled = isToolEnabled(a.id);
      const bEnabled = isToolEnabled(b.id);
      if (aEnabled !== bEnabled) return aEnabled ? -1 : 1;
      return (a.popularityRank ?? 99) - (b.popularityRank ?? 99);
    });
  }, [searchQuery, selectedCategory, isToolEnabled]);

  // Group tools by category for display
  const toolsByCategory = useMemo(() => {
    if (selectedCategory !== 'all' || searchQuery) {
      // Show flat list when filtering
      return null;
    }

    // Group by category
    const groups = new Map<ToolCategory, typeof filteredTools>();
    for (const tool of filteredTools) {
      const list = groups.get(tool.category) || [];
      list.push(tool);
      groups.set(tool.category, list);
    }

    // Sort categories by default order
    return Array.from(groups.entries()).sort(
      (a, b) => CATEGORY_META[a[0]].defaultOrder - CATEGORY_META[b[0]].defaultOrder
    );
  }, [filteredTools, selectedCategory, searchQuery]);

  // Handle tool toggle
  const handleToggle = useCallback(
    async (toolId: string, add: boolean) => {
      setLoadingToolId(toolId);
      try {
        if (add) {
          await addTool(toolId);
          setJustAdded(toolId);
          setTimeout(() => setJustAdded(null), 2000);
        } else {
          await removeTool(toolId);
        }
      } catch (err) {
        console.error('Failed to toggle tool:', err);
      } finally {
        setLoadingToolId(null);
      }
    },
    [addTool, removeTool]
  );

  const handleBack = () => {
    router.push('/labtools');
  };

  // Count enabled tools
  const enabledCount = TOOL_REGISTRY.filter((t) => isToolEnabled(t.id)).length;

  // Categories that have tools (for chips)
  const categoriesWithTools = useMemo(() => {
    const cats = new Set<ToolCategory>();
    for (const tool of TOOL_REGISTRY) {
      cats.add(tool.category);
    }
    return Array.from(cats).sort(
      (a, b) => CATEGORY_META[a].defaultOrder - CATEGORY_META[b].defaultOrder
    );
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#1a1f2e] to-[#16213e]">
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2 rounded-xl
                     bg-white/[0.03] border border-white/[0.06]
                     text-white/70 hover:text-white hover:bg-white/[0.06]
                     transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">My Lab</span>
          </button>

          {/* Counter */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03]">
            <Check className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-white/70">
              {enabledCount} in your lab
            </span>
          </div>
        </div>

        {/* Main Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-14 h-14 mb-3
                     rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/5
                     border border-amber-500/20"
          >
            <Sparkles className="w-6 h-6 text-amber-400" />
          </motion.div>

          <h1 className="text-2xl font-bold text-white mb-1">
            Discover Tools
          </h1>
          <p className="text-white/50 text-sm">
            Instruments for exploration, reflection, and transformation
          </p>
        </motion.div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tools..."
            className="w-full pl-12 pr-10 py-3 rounded-xl
                     bg-white/[0.03] border border-white/[0.06]
                     text-white placeholder-white/30
                     focus:outline-none focus:border-[#D4B896]/30
                     transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Chips */}
        <div className="mb-8">
          <CategoryChips
            selected={selectedCategory}
            onSelect={setSelectedCategory}
            categories={categoriesWithTools}
          />
        </div>

        {/* Toast for added tool */}
        <AnimatePresence>
          {justAdded && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-6 left-1/2 -translate-x-1/2 z-50
                       flex items-center gap-2 px-4 py-2 rounded-xl
                       bg-emerald-500/20 border border-emerald-500/30
                       text-emerald-400 text-sm backdrop-blur-sm"
            >
              <Check className="w-4 h-4" />
              Added to your lab
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tools Grid */}
        <LayoutGroup>
          {toolsByCategory ? (
            // Grouped by category
            <div className="space-y-10">
              {toolsByCategory.map(([category, tools]) => (
                <motion.section
                  key={category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {/* Category header */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-xl">{CATEGORY_META[category].emoji}</span>
                    <h2 className="text-sm font-medium text-white/70 uppercase tracking-wide">
                      {CATEGORY_META[category].label}
                    </h2>
                    <span className="text-xs text-white/30">{tools.length}</span>
                    <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
                  </div>

                  {/* Tools */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    {tools.map((tool) => (
                      <DiscoverCard
                        key={tool.id}
                        tool={tool}
                        isEnabled={isToolEnabled(tool.id)}
                        memberTier={memberTier}
                        onToggle={handleToggle}
                        isLoading={loadingToolId === tool.id}
                      />
                    ))}
                  </div>
                </motion.section>
              ))}
            </div>
          ) : (
            // Flat list (filtered)
            <div className="grid gap-4 sm:grid-cols-2">
              <AnimatePresence mode="popLayout">
                {filteredTools.map((tool) => (
                  <DiscoverCard
                    key={tool.id}
                    tool={tool}
                    isEnabled={isToolEnabled(tool.id)}
                    memberTier={memberTier}
                    onToggle={handleToggle}
                    isLoading={loadingToolId === tool.id}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </LayoutGroup>

        {/* Empty state */}
        {filteredTools.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/[0.03] flex items-center justify-center">
              <Search className="w-6 h-6 text-white/20" />
            </div>
            <p className="text-white/50">No tools match your search</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="mt-4 text-sm text-[#D4B896]/70 hover:text-[#D4B896]"
            >
              Clear filters
            </button>
          </motion.div>
        )}

        {/* Suggest a Tool CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-12"
        >
          <button
            onClick={() => router.push('/labtools/suggest')}
            className="w-full flex items-center gap-4 p-5 rounded-2xl
                     bg-gradient-to-r from-amber-500/5 to-amber-600/5
                     border border-amber-500/10 hover:border-amber-500/20
                     transition-all group"
          >
            <div className="flex-shrink-0 w-12 h-12 rounded-xl
                         bg-amber-500/10 group-hover:bg-amber-500/20
                         flex items-center justify-center transition-all">
              <Lightbulb className="w-6 h-6 text-amber-400" />
            </div>
            <div className="flex-1 text-left">
              <div className="text-sm font-medium text-white/80 group-hover:text-white">
                Not seeing what you need?
              </div>
              <div className="text-xs text-white/40">
                Suggest a tool and help shape the Lab
              </div>
            </div>
            <div className="text-amber-400/50 group-hover:text-amber-400 transition-colors">
              →
            </div>
          </button>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-center pb-8"
        >
          <p className="text-xs text-white/30 max-w-md mx-auto">
            {TOOL_REGISTRY.length} tools available.
            Add what serves you. Remove what doesn't.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
