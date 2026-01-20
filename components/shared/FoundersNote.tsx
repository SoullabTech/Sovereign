'use client';

/**
 * Founders' Note
 *
 * A standalone component explaining why Soullab works the way it does.
 * Can be used as a modal, page section, or standalone page.
 *
 * This is the philosophical framing that explains:
 * - Why memory requires support
 * - Why exploration is free
 * - Why we don't use paywalls
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';

interface FoundersNoteProps {
  /** Display mode */
  variant?: 'inline' | 'modal' | 'expandable';
  /** Day/light mode styling */
  isDayMode?: boolean;
  /** For modal variant: whether modal is open */
  isOpen?: boolean;
  /** For modal variant: close handler */
  onClose?: () => void;
  /** Additional class names */
  className?: string;
}

export default function FoundersNote({
  variant = 'inline',
  isDayMode = false,
  isOpen = false,
  onClose,
  className = '',
}: FoundersNoteProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const content = (
    <div className={`space-y-6 ${isDayMode ? 'text-stone-700' : 'text-stone-300'}`}>
      {/* Opening */}
      <div>
        <h3 className={`text-lg font-medium mb-3 ${isDayMode ? 'text-stone-800' : 'text-white'}`}>
          Why Soullab Works This Way
        </h3>
        <p className="text-sm leading-relaxed">
          Most technology treats you as a user to extract from.
          Soullab was built on a different premise: that real transformation requires real relationship,
          and real relationship requires trust.
        </p>
      </div>

      {/* Core insight */}
      <div className={`p-4 rounded-xl ${
        isDayMode ? 'bg-violet-50 border border-violet-200/50' : 'bg-violet-900/20 border border-violet-500/20'
      }`}>
        <p className={`text-sm font-medium ${isDayMode ? 'text-violet-700' : 'text-violet-300'}`}>
          Memory isn&apos;t a feature. It&apos;s a relationship.
        </p>
        <p className={`text-sm mt-2 ${isDayMode ? 'text-violet-600' : 'text-violet-400'}`}>
          And relationships have real costs to hold well.
        </p>
      </div>

      {/* The approach */}
      <div>
        <h4 className={`text-sm font-medium mb-2 ${isDayMode ? 'text-stone-800' : 'text-white'}`}>
          Our Approach
        </h4>
        <ul className="space-y-3 text-sm">
          <li className="flex items-start gap-2">
            <span className={`mt-1 ${isDayMode ? 'text-violet-600' : 'text-violet-400'}`}>•</span>
            <span>
              <strong>Exploration is always free.</strong> You can meet MAIA, ask questions,
              journal, and discover your elemental nature without paying anything.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className={`mt-1 ${isDayMode ? 'text-violet-600' : 'text-violet-400'}`}>•</span>
            <span>
              <strong>Continuity requires support.</strong> When something meaningful begins to form—
              patterns across time, memories that weave together, insights that build on each other—
              that takes real infrastructure, compute, and care to sustain.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className={`mt-1 ${isDayMode ? 'text-violet-600' : 'text-violet-400'}`}>•</span>
            <span>
              <strong>Nothing is taken away.</strong> If you don&apos;t support, you can still explore.
              MAIA simply won&apos;t carry long-term memory forward in the same way.
            </span>
          </li>
        </ul>
      </div>

      {/* What this avoids */}
      <div>
        <h4 className={`text-sm font-medium mb-2 ${isDayMode ? 'text-stone-800' : 'text-white'}`}>
          What This Avoids
        </h4>
        <p className="text-sm leading-relaxed">
          No guilt. No artificial limits. No &quot;upgrade to continue.&quot; No implied punishment.
          No dark patterns. Instead, we invite adult choice: if something meaningful is forming
          and you want it held, you can help sustain that.
        </p>
      </div>

      {/* The philosophy */}
      <div className={`p-4 rounded-xl ${
        isDayMode ? 'bg-amber-50 border border-amber-200/50' : 'bg-amber-900/20 border border-amber-500/20'
      }`}>
        <p className="text-sm leading-relaxed">
          We believe consciousness work shouldn&apos;t be paywalled.
          We also believe that sustainable work requires sustainable support.
          This tension—honoring both—is the edge we&apos;re walking.
        </p>
      </div>

      {/* Closing */}
      <div>
        <p className={`text-sm italic ${isDayMode ? 'text-stone-500' : 'text-stone-500'}`}>
          Support keeps memory alive. Exploration is always free.
        </p>
        <p className={`text-xs mt-2 ${isDayMode ? 'text-stone-400' : 'text-stone-600'}`}>
          — The Soullab Team
        </p>
      </div>
    </div>
  );

  // Modal variant
  if (variant === 'modal') {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={onClose}
            />
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-xl md:w-full max-h-[90vh] overflow-y-auto rounded-2xl z-50 ${
                isDayMode ? 'bg-white' : 'bg-stone-900'
              } ${className}`}
            >
              <div className="sticky top-0 flex items-center justify-between p-4 border-b border-stone-200/20">
                <div className="flex items-center gap-2">
                  <Heart className={`w-5 h-5 ${isDayMode ? 'text-violet-600' : 'text-violet-400'}`} />
                  <span className={`font-medium ${isDayMode ? 'text-stone-800' : 'text-white'}`}>
                    A Note from Soullab
                  </span>
                </div>
                <button
                  onClick={onClose}
                  className={`p-2 rounded-lg transition-colors ${
                    isDayMode ? 'hover:bg-stone-100' : 'hover:bg-stone-800'
                  }`}
                >
                  <X className={`w-5 h-5 ${isDayMode ? 'text-stone-600' : 'text-stone-400'}`} />
                </button>
              </div>
              <div className="p-6">
                {content}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  // Expandable variant
  if (variant === 'expandable') {
    return (
      <div className={`rounded-2xl overflow-hidden ${
        isDayMode ? 'bg-white/60 border border-stone-200/50' : 'bg-stone-800/50 border border-stone-700/50'
      } ${className}`}>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`w-full p-4 flex items-center justify-between transition-colors ${
            isDayMode ? 'hover:bg-stone-50' : 'hover:bg-stone-800'
          }`}
        >
          <div className="flex items-center gap-3">
            <Heart className={`w-5 h-5 ${isDayMode ? 'text-violet-600' : 'text-violet-400'}`} />
            <span className={`font-medium ${isDayMode ? 'text-stone-800' : 'text-white'}`}>
              Why Soullab Works This Way
            </span>
          </div>
          {isExpanded ? (
            <ChevronUp className={`w-5 h-5 ${isDayMode ? 'text-stone-600' : 'text-stone-400'}`} />
          ) : (
            <ChevronDown className={`w-5 h-5 ${isDayMode ? 'text-stone-600' : 'text-stone-400'}`} />
          )}
        </button>
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-6 pt-2 border-t border-stone-200/20">
                {content}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Inline variant (default)
  return (
    <div className={`p-6 rounded-2xl ${
      isDayMode ? 'bg-white/60 border border-stone-200/50' : 'bg-stone-800/50 border border-stone-700/50'
    } ${className}`}>
      {content}
    </div>
  );
}

/**
 * Hook to manage FoundersNote modal state
 */
export function useFoundersNoteModal() {
  const [isOpen, setIsOpen] = useState(false);
  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((prev) => !prev),
  };
}
