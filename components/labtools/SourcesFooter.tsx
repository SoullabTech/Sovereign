'use client';

/**
 * SourcesFooter — Displays the traditions a labtool draws from.
 *
 * MAIA is not a black box. Members should know what stands behind the
 * distinctions a tool is offering. This component exposes those sources
 * quietly at the foot of each relational labtool — collapsed by default,
 * expandable for anyone who wants to go deeper.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ChevronDown } from 'lucide-react';
import type { RelationshipSource } from '@/lib/relationships/relationshipResources';

interface SourcesFooterProps {
  sources: RelationshipSource[];
  /** Short contextual intro, e.g. "This tool draws from…" */
  intro?: string;
}

export function SourcesFooter({
  sources,
  intro = 'This tool draws from',
}: SourcesFooterProps) {
  const [open, setOpen] = useState(false);

  if (sources.length === 0) return null;

  return (
    <div className="mt-10 border-t border-white/[0.06] pt-6">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="
          inline-flex items-center gap-2 text-[11px] uppercase tracking-wider
          text-white/30 hover:text-white/55 transition-colors
        "
      >
        <BookOpen className="h-3 w-3" />
        {intro}
        <span className="normal-case tracking-normal text-white/40">
          {sources.length} {sources.length === 1 ? 'tradition' : 'traditions'}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="inline-flex"
        >
          <ChevronDown className="h-3 w-3" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="mt-4 space-y-5">
              {sources.map((s) => (
                <div key={s.id} className="space-y-1.5">
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <span className="text-sm font-medium text-white/80">
                      {s.tradition}
                    </span>
                    <span className="text-xs text-white/35">
                      {s.people.join(', ')}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-white/55">
                    {s.summary}
                  </p>
                  {s.lineage && (
                    <p className="text-[11px] italic text-white/30">
                      {s.lineage}
                    </p>
                  )}
                  {s.keyTexts && s.keyTexts.length > 0 && (
                    <div className="pt-1">
                      <div className="text-[10px] uppercase tracking-wider text-white/25">
                        Start here
                      </div>
                      <ul className="mt-1 space-y-0.5">
                        {s.keyTexts.map((t) => (
                          <li
                            key={t}
                            className="text-[11px] text-white/45 before:mr-1.5 before:text-white/20 before:content-['·']"
                          >
                            {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}

              <p className="pt-2 text-[10px] italic text-white/25">
                These are resources for further exploration — not diagnostic
                tools. Nothing here replaces direct work with a practitioner
                who knows you.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
