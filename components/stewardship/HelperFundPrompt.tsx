/**
 * Helper Fund Prompt
 *
 * Invitation for thriving practitioners to contribute to the Helper Fund.
 * Philosophy: Stewardship flows in both directions.
 */

'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, ArrowRight, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HelperFundPromptProps {
  isOpen: boolean;
  onClose: () => void;
  onContribute: () => void;
  onLearnMore: () => void;
  activeScholarships?: number;
}

export const HelperFundPrompt: React.FC<HelperFundPromptProps> = ({
  isOpen,
  onClose,
  onContribute,
  onLearnMore,
  activeScholarships = 0,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{
              type: 'spring',
              damping: 25,
              stiffness: 300,
            }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-[101] max-w-md mx-auto"
          >
            <div className="bg-gradient-to-b from-maia-navy-900 to-maia-navy-950 rounded-2xl shadow-2xl border border-rose-400/20 overflow-hidden">
              {/* Accent gradient */}
              <div className="h-1 bg-gradient-to-r from-rose-400/40 to-pink-400/40" />

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-all z-10"
                aria-label="Close"
              >
                <X className="w-4 h-4 text-maia-ink-60" />
              </button>

              {/* Content */}
              <div className="p-8">
                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-rose-400/10 flex items-center justify-center text-rose-400 mb-6">
                  <Heart className="w-6 h-6" />
                </div>

                {/* Headline */}
                <h2 className="text-xl font-medium text-maia-ink-100 mb-3">
                  Would you like to give back?
                </h2>

                {/* Body */}
                <p className="text-maia-ink-60 leading-relaxed mb-6">
                  The Helper Fund supports practitioners who are just starting out.
                  Your contribution helps someone build their practice while they find their footing.
                </p>

                {/* Stats */}
                {activeScholarships > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-rose-400/5 rounded-lg mb-6">
                    <Users className="w-5 h-5 text-rose-400/60" />
                    <span className="text-sm text-maia-ink-60">
                      Currently supporting <span className="text-rose-400">{activeScholarships}</span> emerging practitioners
                    </span>
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-3">
                  {/* Primary CTA */}
                  <Button
                    onClick={onContribute}
                    className="w-full bg-rose-500 hover:bg-rose-600 text-white py-3 rounded-xl font-medium transition-all group"
                  >
                    Contribute to the Fund
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>

                  {/* Secondary CTA */}
                  <Button
                    onClick={onClose}
                    variant="ghost"
                    className="w-full text-maia-ink-60 hover:text-maia-ink-80 hover:bg-white/5 py-3 rounded-xl transition-all"
                  >
                    Not right now
                  </Button>

                  {/* Learn more */}
                  <button
                    onClick={onLearnMore}
                    className="w-full text-sm text-rose-400/80 hover:text-rose-400 py-2 transition-all"
                  >
                    Learn how the Helper Fund works
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default HelperFundPrompt;
