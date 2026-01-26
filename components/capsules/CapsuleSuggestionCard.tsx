'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Plus, X, Check, ChevronRight } from 'lucide-react';
import { saveCapsule, type Capsule } from '@/lib/capsules/CapsuleService';
import Link from 'next/link';

interface CapsuleSuggestion {
  title: string;
  insight: string;
  themes: string[];
  element?: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  confidence: number;
}

interface CapsuleSuggestionCardProps {
  suggestions: CapsuleSuggestion[];
  sessionId: string;
  memberId: string;
  onClose: () => void;
  onSaved?: (capsule: Capsule) => void;
}

export function CapsuleSuggestionCard({
  suggestions,
  sessionId,
  memberId,
  onClose,
  onSaved
}: CapsuleSuggestionCardProps) {
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || suggestions.length === 0) {
    return null;
  }

  const handleSave = (suggestion: CapsuleSuggestion, index: number) => {
    const capsule = saveCapsule({
      memberId,
      sessionId,
      title: suggestion.title,
      insight: suggestion.insight,
      themes: suggestion.themes,
      element: suggestion.element,
    });

    setSavedIds(prev => new Set([...prev, index]));
    onSaved?.(capsule);
  };

  const handleDismiss = () => {
    setDismissed(true);
    onClose();
  };

  const elementEmoji: Record<string, string> = {
    fire: '🔥',
    water: '💧',
    earth: '🌿',
    air: '💨',
    aether: '✨',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className="fixed bottom-20 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50"
    >
      <div className="bg-slate-900/95 backdrop-blur-xl border border-amber-500/20 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Sparkles className="text-amber-400" size={18} />
            <h3 className="text-white font-medium text-sm">Wisdom Capsules</h3>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-white/10 rounded-lg transition-all"
          >
            <X size={16} className="text-white/50" />
          </button>
        </div>

        {/* Suggestions */}
        <div className="p-4 space-y-3 max-h-72 overflow-y-auto">
          <p className="text-white/50 text-xs mb-3">
            Save these insights from your conversation
          </p>

          <AnimatePresence mode="popLayout">
            {suggestions.map((suggestion, index) => {
              const isSaved = savedIds.has(index);
              return (
                <motion.div
                  key={index}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={`p-3 rounded-xl border transition-all ${
                    isSaved
                      ? 'bg-teal-500/10 border-teal-500/30'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {suggestion.element && (
                          <span className="text-xs">
                            {elementEmoji[suggestion.element]}
                          </span>
                        )}
                        <h4 className="text-white text-sm font-medium truncate">
                          {suggestion.title}
                        </h4>
                      </div>
                      <p className="text-white/60 text-xs leading-relaxed line-clamp-2">
                        {suggestion.insight}
                      </p>
                      {suggestion.themes.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {suggestion.themes.slice(0, 2).map((theme) => (
                            <span
                              key={theme}
                              className="px-1.5 py-0.5 bg-white/10 text-white/40 text-[10px] rounded"
                            >
                              {theme}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleSave(suggestion, index)}
                      disabled={isSaved}
                      className={`p-2 rounded-lg transition-all flex-shrink-0 ${
                        isSaved
                          ? 'bg-teal-500/20 text-teal-400'
                          : 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                      }`}
                    >
                      {isSaved ? <Check size={16} /> : <Plus size={16} />}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-black/20">
          <Link
            href="/capsules"
            className="flex items-center justify-center gap-2 text-amber-400 text-sm hover:text-amber-300 transition-all"
          >
            View all capsules
            <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default CapsuleSuggestionCard;
