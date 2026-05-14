'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CoreIdea {
  id: string;
  concept: string;
  one_line: string;
  body?: string | null;
  related_concepts?: string[] | null;
}

interface CoreIdeasListProps {
  ideas: CoreIdea[];
}

export function CoreIdeasList({ ideas }: CoreIdeasListProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (ideas.length === 0) return null;

  return (
    <div className="space-y-2">
      {ideas.map((idea) => {
        const isOpen = expanded === idea.id;
        return (
          <div
            key={idea.id}
            className="rounded-xl border border-maia-navy-700 bg-maia-navy-850 overflow-hidden"
          >
            <button
              onClick={() => setExpanded(isOpen ? null : idea.id)}
              className="w-full px-5 py-4 text-left flex items-start justify-between gap-4 hover:bg-maia-navy-800 transition-colors"
            >
              <div>
                <span className="font-medium text-maia-ink-100">{idea.concept}</span>
                <p className="mt-1 text-sm text-maia-ink-60 leading-relaxed">{idea.one_line}</p>
              </div>
              <span className="shrink-0 mt-0.5 text-maia-ink-40 text-lg leading-none">
                {isOpen ? '−' : '+'}
              </span>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && idea.body && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="px-5 pb-5 border-t border-maia-navy-700">
                    <p className="pt-4 text-sm text-maia-ink-60 leading-relaxed">{idea.body}</p>
                    {idea.related_concepts && idea.related_concepts.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {idea.related_concepts.map((c) => (
                          <span
                            key={c}
                            className="rounded-full border border-maia-navy-600 px-2 py-0.5 text-xs text-maia-ink-40"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
