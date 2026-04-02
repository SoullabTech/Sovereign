'use client';

/**
 * ConversationInsightPanel — Visible edge of MAIA's cognition
 *
 * This is not navigation. This is the right panel showing what MAIA is noticing:
 *   - a pattern surfacing during conversation
 *   - a journal-worthy moment
 *   - a sacred text resonance
 *   - a relationship thread becoming visible
 *
 * The user should feel: "the system is listening and unfolding with me"
 * Not: "I need to manage another panel"
 *
 * Phase 6: structure only. No real data sources. Mock/static placeholders
 * to prove the rendering model. Real wiring comes when cognition events
 * flow from oracle response processing.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, BookOpen, Heart, Layers, ArrowRight } from 'lucide-react';
import type { ConversationInsight } from '@/lib/maia/cognitionEvents';
import type { LucideIcon } from 'lucide-react';

const INSIGHT_ICONS: Record<ConversationInsight['type'], LucideIcon> = {
  'pattern-match': Sparkles,
  'prior-thread': Layers,
  'sacred-resonance': BookOpen,
  'theme-emergence': Sparkles,
  'capability-offer': ArrowRight,
};

const INSIGHT_COLORS: Record<ConversationInsight['type'], string> = {
  'pattern-match': 'border-amber-500/20 bg-amber-500/5',
  'prior-thread': 'border-[#D4B896]/20 bg-[#D4B896]/5',
  'sacred-resonance': 'border-purple-500/20 bg-purple-500/5',
  'theme-emergence': 'border-teal-500/20 bg-teal-500/5',
  'capability-offer': 'border-blue-500/20 bg-blue-500/5',
};

const INSIGHT_ICON_COLORS: Record<ConversationInsight['type'], string> = {
  'pattern-match': 'text-amber-400/60',
  'prior-thread': 'text-[#D4B896]/60',
  'sacred-resonance': 'text-purple-400/60',
  'theme-emergence': 'text-teal-400/60',
  'capability-offer': 'text-blue-400/60',
};

const MAX_VISIBLE = 4;

interface ConversationInsightPanelProps {
  insights: ConversationInsight[];
  onInsightClick?: (insight: ConversationInsight) => void;
}

export function ConversationInsightPanel({ insights, onInsightClick }: ConversationInsightPanelProps) {
  // Show only the most recent insights, capped at MAX_VISIBLE
  const visible = insights.slice(-MAX_VISIBLE);

  if (visible.length === 0) {
    return (
      <div className="text-center py-8">
        <Sparkles className="w-4 h-4 text-stone-600 mx-auto mb-2" />
        <p className="text-xs text-stone-600 font-light">
          Insights will surface as conversation unfolds
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <AnimatePresence mode="popLayout">
        {visible.map((insight, index) => {
          const Icon = INSIGHT_ICONS[insight.type] || Sparkles;
          const colorClass = INSIGHT_COLORS[insight.type] || 'border-stone-500/20 bg-stone-500/5';
          const iconColor = INSIGHT_ICON_COLORS[insight.type] || 'text-stone-400/60';
          // Relevance controls opacity: low relevance = subtle, high = present
          const opacityStyle = insight.relevance < 0.3 ? 'opacity-40' : insight.relevance > 0.7 ? 'opacity-100' : 'opacity-70';

          return (
            <motion.button
              key={insight.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: index * 0.15, duration: 0.4, ease: 'easeOut' }}
              onClick={() => onInsightClick?.(insight)}
              className={`w-full flex items-start gap-3 p-3 rounded-xl border transition-all text-left ${colorClass} hover:border-[#D4B896]/30 ${opacityStyle}`}
            >
              <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${iconColor}`} />
              <div className="min-w-0">
                <p className="text-sm text-[#D4B896]/90 font-light truncate">{insight.title}</p>
                <p className="text-xs text-stone-500 mt-0.5 line-clamp-2">{insight.summary}</p>
              </div>
            </motion.button>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
