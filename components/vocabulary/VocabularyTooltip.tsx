'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { findTermsInText, type VocabularyTerm } from '@/lib/vocabulary/soulVocabulary';

/**
 * VocabularyTooltip - Highlights soul vocabulary terms with hover tooltips
 */

interface VocabularyTooltipProps {
  term: VocabularyTerm;
  children: React.ReactNode;
}

export function VocabularyTooltip({ term, children }: VocabularyTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<'top' | 'bottom'>('top');
  const triggerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceAbove = rect.top;
      const spaceBelow = window.innerHeight - rect.bottom;

      setPosition(spaceAbove > 200 || spaceAbove > spaceBelow ? 'top' : 'bottom');
    }
  }, [isOpen]);

  const categoryColors = {
    alchemy: 'border-amber-500/30 bg-amber-500/10',
    psychology: 'border-violet-500/30 bg-violet-500/10',
    elemental: 'border-emerald-500/30 bg-emerald-500/10',
    archetype: 'border-blue-500/30 bg-blue-500/10',
    spiritual: 'border-purple-500/30 bg-purple-500/10',
    somatic: 'border-rose-500/30 bg-rose-500/10',
    spiralogic: 'border-cyan-500/30 bg-cyan-500/10',
  };

  const categoryLabels = {
    alchemy: 'Alchemical',
    psychology: 'Psychological',
    elemental: 'Elemental',
    archetype: 'Archetypal',
    spiritual: 'Spiritual',
    somatic: 'Somatic',
    spiralogic: 'Spiralogic',
  };

  return (
    <span className="relative inline" ref={triggerRef}>
      <span
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen(!isOpen)}
        className="border-b border-dotted border-amber-500/40 cursor-help hover:border-amber-400 transition-colors"
      >
        {children}
      </span>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: position === 'top' ? 10 : -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: position === 'top' ? 10 : -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`
              absolute z-50 w-72 p-4 rounded-xl
              bg-stone-900/95 backdrop-blur-xl border border-stone-700/50
              shadow-xl shadow-black/20
              ${position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'}
              left-1/2 -translate-x-1/2
            `}
          >
            {/* Arrow */}
            <div
              className={`
                absolute w-3 h-3 bg-stone-900 border-stone-700/50 rotate-45
                left-1/2 -translate-x-1/2
                ${position === 'top' ? 'bottom-[-6px] border-r border-b' : 'top-[-6px] border-l border-t'}
              `}
            />

            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                {term.emoji && <span className="text-lg">{term.emoji}</span>}
                <span className="font-medium text-amber-100 capitalize">{term.term}</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${categoryColors[term.category]}`}>
                {categoryLabels[term.category]}
              </span>
            </div>

            {/* Definition */}
            <p className="text-sm text-stone-300 leading-relaxed">
              {term.definition}
            </p>

            {/* Related terms */}
            {term.relatedTerms && term.relatedTerms.length > 0 && (
              <div className="mt-3 pt-2 border-t border-stone-700/50">
                <span className="text-xs text-stone-500">Related: </span>
                <span className="text-xs text-amber-400/70">
                  {term.relatedTerms.join(', ')}
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}

/**
 * Renders text with vocabulary terms highlighted
 */
interface HighlightedTextProps {
  text: string;
  className?: string;
  enableTooltips?: boolean;
}

export function HighlightedText({
  text,
  className = '',
  enableTooltips = true
}: HighlightedTextProps) {
  if (!enableTooltips) {
    return <span className={className}>{text}</span>;
  }

  const terms = findTermsInText(text);

  if (terms.length === 0) {
    return <span className={className}>{text}</span>;
  }

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  terms.forEach(({ term, start, end }, i) => {
    // Add text before this term
    if (start > lastIndex) {
      parts.push(
        <span key={`text-${i}`}>{text.slice(lastIndex, start)}</span>
      );
    }

    // Add the highlighted term
    parts.push(
      <VocabularyTooltip key={`term-${i}`} term={term}>
        {text.slice(start, end)}
      </VocabularyTooltip>
    );

    lastIndex = end;
  });

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(
      <span key="text-end">{text.slice(lastIndex)}</span>
    );
  }

  return <span className={className}>{parts}</span>;
}

export default VocabularyTooltip;
