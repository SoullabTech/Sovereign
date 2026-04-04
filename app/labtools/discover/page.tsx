'use client';

/**
 * Discover Tools - The Consciousness Map
 *
 * Tools organized by 8 domains of conscious experience,
 * grouped into three tiers: Foundation, Meaning, Vertical.
 *
 * The vibe: a map of lived experience, not a feature catalog.
 * Empty domains are inviting spaces, not missing features.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search, X, Sparkles, Check, Lightbulb } from 'lucide-react';
import { useMemberTools } from '@/hooks/useMemberTools';
import { DiscoverCard } from '@/components/labtools/DiscoverCard';
import { useSession } from '@/lib/hooks/useSession';
import { CategoryChips } from '@/components/labtools/CategoryChips';
import { ModeChips, resolveModeFilter, type ModeFilterValue } from '@/components/labtools/ModeChips';
import {
  TOOL_REGISTRY,
  CATEGORY_META,
  DOMAIN_META,
  UTILITY_META,
  searchTools,
  getToolsByCategory,
  getDomainsInOrder,
  getUtilityCategoriesInOrder,
  getDomainsByTier,
  isConsciousnessDomain,
  type ToolCategory,
  type ToolMode,
  type ConsciousnessDomain,
  type Tier,
} from '@/config/toolRegistry';

const TIER_LABELS: Record<string, { label: string; description: string }> = {
  foundation: { label: 'Foundation', description: 'The ground of horizontal life' },
  meaning: { label: 'Meaning', description: 'Where coherence forms' },
  vertical: { label: 'Vertical', description: 'The transpersonal dimension' },
};

export default function DiscoverPage() {
  const router = useRouter();
  const { isToolEnabled, addTool, removeTool } = useMemberTools();

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory | 'all'>('all');
  const [selectedMode, setSelectedMode] = useState<ModeFilterValue>('all');
  const [loadingToolId, setLoadingToolId] = useState<string | null>(null);
  const [justAdded, setJustAdded] = useState<string | null>(null);

  // Get tier and roles from auth session
  const { tier, roles } = useSession();
  const memberTier: Tier = (tier as Tier) || 'free';
  const memberRole = roles?.includes('admin') ? 'admin'
    : roles?.includes('practitioner') ? 'practitioner'
    : roles?.includes('curator') ? 'curator'
    : undefined;

  // When a domain is selected, auto-activate its default mode
  const handleCategorySelect = useCallback((cat: ToolCategory | 'all') => {
    setSelectedCategory(cat);
    if (cat !== 'all' && isConsciousnessDomain(cat)) {
      const domain = cat as ConsciousnessDomain;
      setSelectedMode(DOMAIN_META[domain].defaultMode);
    } else {
      setSelectedMode('all');
    }
  }, []);

  // Resolve mode filter into concrete ToolMode[] (or null for 'all')
  const resolvedModes = useMemo(() => resolveModeFilter(selectedMode), [selectedMode]);

  // Filtered tools
  const filteredTools = useMemo(() => {
    let tools = searchQuery
      ? searchTools(searchQuery)
      : selectedCategory === 'all'
        ? TOOL_REGISTRY
        : getToolsByCategory(selectedCategory);

    // Filter by mode(s) if selected
    if (resolvedModes) {
      tools = tools.filter((t) => t.modes?.some((m) => resolvedModes.includes(m)));
    }

    // Sort: enabled first, then by popularity
    return tools.sort((a, b) => {
      const aEnabled = isToolEnabled(a.id);
      const bEnabled = isToolEnabled(b.id);
      if (aEnabled !== bEnabled) return aEnabled ? -1 : 1;
      return (a.popularityRank ?? 99) - (b.popularityRank ?? 99);
    });
  }, [searchQuery, selectedCategory, resolvedModes, isToolEnabled]);

  // Group tools by domain (for "all" view, no search/filter)
  const showGroupedView = selectedCategory === 'all' && !searchQuery;

  // Domain groups organized by tier
  const domainGroups = useMemo(() => {
    if (!showGroupedView) return null;

    const tiers = ['foundation', 'meaning', 'vertical'] as const;
    return tiers.map((tier) => {
      const domains = getDomainsByTier(tier);
      return {
        tier,
        ...TIER_LABELS[tier],
        domains: domains.map((domain) => {
          let tools = TOOL_REGISTRY.filter((t) => t.domain === domain);
          if (resolvedModes) {
            tools = tools.filter((t) => t.modes?.some((m) => resolvedModes.includes(m)));
          }
          return {
            domain,
            meta: DOMAIN_META[domain],
            tools: tools.sort((a, b) => {
              const aEnabled = isToolEnabled(a.id);
              const bEnabled = isToolEnabled(b.id);
              if (aEnabled !== bEnabled) return aEnabled ? -1 : 1;
              return (a.popularityRank ?? 99) - (b.popularityRank ?? 99);
            }),
          };
        }),
      };
    });
  }, [showGroupedView, resolvedModes, isToolEnabled]);

  // Utility tools (for the bottom section)
  const utilityGroups = useMemo(() => {
    if (!showGroupedView) return null;

    return getUtilityCategoriesInOrder().map((cat) => {
      const tools = TOOL_REGISTRY.filter((t) => t.category === cat);
      return {
        category: cat,
        meta: UTILITY_META[cat],
        tools: tools.sort((a, b) => (a.popularityRank ?? 99) - (b.popularityRank ?? 99)),
      };
    }).filter((g) => g.tools.length > 0);
  }, [showGroupedView]);

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

  // Domain categories for chips (only domains, not utilities)
  const domainCategories = useMemo(() => getDomainsInOrder(), []);

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
            Instruments for the 8 domains of conscious experience
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

        {/* Domain Chips (primary filter) */}
        <div className="mb-3">
          <CategoryChips
            selected={selectedCategory}
            onSelect={handleCategorySelect}
            categories={domainCategories}
          />
        </div>

        {/* Mode Chips (cross-cutting filter) */}
        <div className="mb-8">
          <ModeChips
            selected={selectedMode}
            onSelect={setSelectedMode}
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

        {/* Tools Display */}
        <LayoutGroup>
          {showGroupedView && domainGroups ? (
            // Grouped by domain tiers
            <div className="space-y-12">
              {domainGroups.map(({ tier, label, description, domains }) => (
                <div key={tier}>
                  {/* Tier header */}
                  <div className="mb-6">
                    <h2 className="text-xs font-medium text-white/40 uppercase tracking-widest mb-1">
                      {label}
                    </h2>
                    <p className="text-xs text-white/25">{description}</p>
                  </div>

                  {/* Domains in this tier */}
                  <div className="space-y-10">
                    {domains.map(({ domain, meta, tools }) => (
                      <motion.section
                        key={domain}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        {/* Domain header */}
                        <div className="flex items-start gap-3 mb-2">
                          <span className="text-2xl">{meta.emoji}</span>
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <h3 className="text-sm font-medium text-white/80 uppercase tracking-wide">
                                {meta.alias}
                              </h3>
                              <span className="text-xs text-white/30">
                                {meta.label}
                              </span>
                              {tools.length > 0 && (
                                <span className="text-xs text-white/20">{tools.length}</span>
                              )}
                              <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
                            </div>
                            <p className="text-xs text-white/25 mt-1 max-w-lg leading-relaxed">
                              {meta.longDescription}
                            </p>
                          </div>
                        </div>

                        {/* Tools or empty state */}
                        {tools.length > 0 ? (
                          <div className="grid gap-4 sm:grid-cols-2 ml-9">
                            {tools.map((tool) => (
                              <DiscoverCard
                                key={tool.id}
                                tool={tool}
                                isEnabled={isToolEnabled(tool.id)}
                                memberTier={memberTier}
                                memberRole={memberRole}
                                onToggle={handleToggle}
                                isLoading={loadingToolId === tool.id}
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="ml-9 py-6 px-4 rounded-xl bg-white/[0.01] border border-dashed border-white/[0.06] text-center">
                            <p className="text-xs text-white/25">
                              No tools here yet.
                            </p>
                            <button
                              onClick={() => router.push('/labtools/suggest')}
                              className="mt-2 text-xs text-[#D4B896]/50 hover:text-[#D4B896]/80 transition-colors"
                            >
                              Suggest one
                            </button>
                          </div>
                        )}
                      </motion.section>
                    ))}
                  </div>
                </div>
              ))}

              {/* Utility section */}
              {utilityGroups && utilityGroups.length > 0 && (
                <div>
                  {/* Utility header */}
                  <div className="mb-6 pt-4 border-t border-white/[0.04]">
                    <h2 className="text-xs font-medium text-white/30 uppercase tracking-widest mb-1">
                      Lab Infrastructure
                    </h2>
                    <p className="text-xs text-white/20">Settings, collections, and system tools</p>
                  </div>

                  <div className="space-y-8">
                    {utilityGroups.map(({ category, meta, tools }) => (
                      <motion.section
                        key={category}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        {/* Category header */}
                        <div className="flex items-center gap-3 mb-4">
                          <span className="text-xl">{meta.emoji}</span>
                          <h3 className="text-sm font-medium text-white/50 uppercase tracking-wide">
                            {meta.label}
                          </h3>
                          <span className="text-xs text-white/20">{tools.length}</span>
                          <div className="flex-1 h-px bg-gradient-to-r from-white/[0.06] to-transparent" />
                        </div>

                        {/* Tools */}
                        <div className="grid gap-4 sm:grid-cols-2">
                          {tools.map((tool) => (
                            <DiscoverCard
                              key={tool.id}
                              tool={tool}
                              isEnabled={isToolEnabled(tool.id)}
                              memberTier={memberTier}
                              memberRole={memberRole}
                              onToggle={handleToggle}
                              isLoading={loadingToolId === tool.id}
                            />
                          ))}
                        </div>
                      </motion.section>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Flat list (filtered by search, category, or mode)
            <div className="grid gap-4 sm:grid-cols-2">
              <AnimatePresence mode="popLayout">
                {filteredTools.map((tool) => (
                  <DiscoverCard
                    key={tool.id}
                    tool={tool}
                    isEnabled={isToolEnabled(tool.id)}
                    memberTier={memberTier}
                    memberRole={memberRole}
                    onToggle={handleToggle}
                    isLoading={loadingToolId === tool.id}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </LayoutGroup>

        {/* Empty state */}
        {filteredTools.length === 0 && !showGroupedView && (
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
                setSelectedMode('all');
              }}
              className="mt-4 text-sm text-[#D4B896]/70 hover:text-[#D4B896]"
            >
              Clear all filters
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
              &rarr;
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
            {TOOL_REGISTRY.length} tools across 8 domains of consciousness.
            Add what serves you. Remove what doesn't.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
