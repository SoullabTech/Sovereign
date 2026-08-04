'use client';

/**
 * My Lab — the member's shelf of instruments
 *
 * Organising principle: the member's moment, not the builder's taxonomy.
 *
 * The way in is three intent doors ("Settle or shift how I feel"), sourced
 * from the SimpleMode layer already authored in config/toolRegistry.ts.
 * Domain (somatic / cognitive / …) is demoted to a secondary way to look.
 * Search reaches anything by name. Recency answers the return test.
 *
 * What this surface may do: present, filter, and remember what was opened.
 * What it must not do: decide for the member. No tool is recommended, ranked
 * by inferred need, or surfaced because the system thinks it knows better.
 * Ordering is the member's own use and the registry's declared order.
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Plus, Compass, Sparkles, SearchX } from 'lucide-react';
import { useMemberTools } from '@/hooks/useMemberTools';
import { IntentDoors } from '@/components/labtools/IntentDoors';
import { RecentStrip } from '@/components/labtools/RecentStrip';
import { LabToolbar, type LabView } from '@/components/labtools/LabToolbar';
import { ToolGroup } from '@/components/labtools/ToolGroup';
import {
  INTENT_ORDER,
  INTENT_PROMPT,
  SIMPLE_MODE_META,
  intentCounts,
  toolsForIntent,
  type SimpleMode,
} from '@/lib/labtools/intent';
import { type ToolCategory } from '@/config/toolRegistry';

/** Name + promise + tags, matched loosely. */
function matchesQuery(
  tool: { label: string; shortDescription: string; tags?: string[] },
  q: string
): boolean {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  return (
    tool.label.toLowerCase().includes(needle) ||
    tool.shortDescription.toLowerCase().includes(needle) ||
    (tool.tags ?? []).some((t) => t.toLowerCase().includes(needle))
  );
}

export default function MyLabPage() {
  const router = useRouter();
  const {
    domainCategories,
    utilityCategories,
    allTools,
    recentTools,
    recordUse,
    isLoading,
    error,
    toggleCategory,
  } = useMemberTools();

  const [intent, setIntent] = useState<SimpleMode | null>(null);
  const [query, setQuery] = useState('');
  const [view, setView] = useState<LabView>('intent');
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Only consciousness-domain tools live on the main shelf. Infrastructure
  // (library, settings, developer) is a drawer at the bottom, not an equal.
  const shelfTools = useMemo(
    () => domainCategories.flatMap((c) => c.tools),
    [domainCategories]
  );

  const counts = useMemo(() => intentCounts(shelfTools), [shelfTools]);

  const searching = query.trim().length > 0;

  const visible = useMemo(() => {
    let tools = shelfTools;
    if (intent) tools = toolsForIntent(tools, intent);
    if (searching) tools = tools.filter((t) => matchesQuery(t, query));
    return tools;
  }, [shelfTools, intent, searching, query]);

  const handleOpen = (toolId: string) => recordUse(toolId);

  const hasAnything = domainCategories.length + utilityCategories.length > 0;

  // ---------------------------------------------------------------- states

  if (isLoading && !mounted) {
    return (
      <Shell>
        <div className="flex flex-col items-center justify-center py-24">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <Compass className="w-7 h-7 text-[#D4B896]/40" strokeWidth={1.5} />
          </motion.div>
          <p className="text-white/35 mt-4 text-[13px]">Opening your lab…</p>
        </div>
      </Shell>
    );
  }

  if (error) {
    return (
      <Shell>
        <div className="text-center py-24">
          <p className="text-white/60 text-[14px]">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08]
                       text-[13px] text-white/70 hover:text-white hover:bg-white/[0.08]
                       transition-colors"
          >
            Try again
          </button>
        </div>
      </Shell>
    );
  }

  if (!hasAnything) {
    return (
      <Shell>
        <div className="text-center py-24">
          <div className="inline-flex items-center justify-center w-14 h-14 mb-5
                          rounded-2xl bg-white/[0.03] border border-white/[0.06]">
            <Sparkles className="w-6 h-6 text-white/25" strokeWidth={1.5} />
          </div>
          <h2 className="text-[17px] font-medium text-white/85 mb-2">
            Your lab is empty
          </h2>
          <p className="text-white/45 text-[14px] mb-6 max-w-sm mx-auto leading-relaxed">
            Choose the instruments you want within reach. You can add and
            remove them at any time.
          </p>
          <button
            onClick={() => router.push('/labtools/discover')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl
                       bg-[#D4B896]/[0.12] border border-[#D4B896]/30
                       text-[#D4B896] hover:bg-[#D4B896]/20
                       transition-colors text-[14px] font-medium"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            Find instruments
          </button>
        </div>
      </Shell>
    );
  }

  // ---------------------------------------------------------------- content

  return (
    <Shell>
      <div className="space-y-10">
        <RecentStrip tools={recentTools} onOpen={handleOpen} />

        <IntentDoors counts={counts} active={intent} onSelect={setIntent} />

        <div className="space-y-6">
          <LabToolbar
            query={query}
            onQueryChange={setQuery}
            view={view}
            onViewChange={setView}
            total={shelfTools.length}
            showViewSwitch={!intent && !searching}
          />

          {/* Active narrowing — always say what is being shown and how to undo it */}
          {(intent || searching) && (
            <div className="flex items-center gap-2 flex-wrap text-[13px]">
              <span className="text-white/40">
                {visible.length} {visible.length === 1 ? 'instrument' : 'instruments'}
              </span>
              {intent && (
                <button
                  onClick={() => setIntent(null)}
                  className="px-2.5 py-1 rounded-full bg-[#D4B896]/[0.12] border border-[#D4B896]/25
                             text-[#D4B896]/90 hover:bg-[#D4B896]/20 transition-colors"
                >
                  {INTENT_PROMPT[intent]} ✕
                </button>
              )}
              {searching && (
                <button
                  onClick={() => setQuery('')}
                  className="px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/[0.08]
                             text-white/60 hover:text-white/90 transition-colors"
                >
                  “{query.trim()}” ✕
                </button>
              )}
            </div>
          )}

          {visible.length === 0 ? (
            <div className="text-center py-14">
              <SearchX
                className="w-6 h-6 text-white/20 mx-auto mb-3"
                strokeWidth={1.5}
              />
              <p className="text-white/45 text-[14px]">
                Nothing here matches that.
              </p>
              <p className="text-white/30 text-[13px] mt-1">
                It may exist but not be in your lab yet —{' '}
                <button
                  onClick={() => router.push('/labtools/discover')}
                  className="text-[#D4B896]/80 hover:text-[#D4B896] underline underline-offset-2"
                >
                  look through everything
                </button>
                .
              </p>
            </div>
          ) : intent || searching ? (
            /* Narrowed: one flat shelf. Grouping a short list adds noise. */
            <ToolGroup
              title={
                intent ? SIMPLE_MODE_META[intent].description : 'Matches'
              }
              tools={visible}
              onOpen={handleOpen}
            />
          ) : view === 'intent' ? (
            <div className="space-y-8">
              {INTENT_ORDER.map((i) => (
                <ToolGroup
                  key={i}
                  title={INTENT_PROMPT[i]}
                  subtitle={SIMPLE_MODE_META[i].description}
                  tools={toolsForIntent(shelfTools, i)}
                  onOpen={handleOpen}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-8">
              {domainCategories.map((cat) => (
                <ToolGroup
                  key={cat.category}
                  title={cat.label}
                  subtitle={cat.description}
                  tools={cat.tools}
                  onOpen={handleOpen}
                />
              ))}
            </div>
          )}
        </div>

        {/* Infrastructure — present, but never competing with the instruments */}
        {utilityCategories.length > 0 && !intent && !searching && (
          <div className="pt-8 border-t border-white/[0.05] space-y-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/25">
              Lab infrastructure
            </p>
            {utilityCategories.map((cat) => (
              <ToolGroup
                key={cat.category}
                title={cat.label}
                tools={cat.tools}
                onOpen={handleOpen}
                collapsible
                collapsed={cat.collapsed}
                onToggle={() => toggleCategory(cat.category as ToolCategory)}
                compact
              />
            ))}
          </div>
        )}

        <div className="pt-4 pb-10 text-center">
          <button
            onClick={() => router.push('/labtools/discover')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl
                       text-[13px] text-white/40 hover:text-white/70
                       border border-white/[0.06] hover:border-white/[0.12]
                       transition-colors"
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={2} />
            Add instruments to your lab
          </button>
        </div>
      </div>
    </Shell>
  );
}

/** Page chrome: background, width, and the header. */
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen font-sans bg-gradient-to-br from-[#0f1419] via-[#1a1f2e] to-[#16213e]">
      <div className="max-w-5xl mx-auto px-5 sm:px-6 pt-10 pb-6">
        <header className="mb-10">
          <h1 className="text-[26px] sm:text-[30px] font-semibold text-white tracking-tight">
            My Lab
          </h1>
          <p className="mt-1.5 text-[14px] text-white/40 leading-relaxed max-w-lg">
            Instruments for what you are working with. Nothing here decides
            anything for you.
          </p>
        </header>

        {children}
      </div>
    </div>
  );
}
