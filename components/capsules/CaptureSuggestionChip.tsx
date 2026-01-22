'use client';

/**
 * CaptureSuggestionChip - Suggestion chip for capturing the spirit of a conversation
 *
 * Appears when heuristic detection triggers, suggesting the user
 * might want to capture this moment.
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';

interface CaptureSuggestionChipProps {
  isVisible: boolean;
  onCapture: () => void;
  onDismiss: () => void;
}

export default function CaptureSuggestionChip({
  isVisible,
  onCapture,
  onDismiss,
}: CaptureSuggestionChipProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed top-24 left-1/2 transform -translate-x-1/2 z-40 max-w-sm"
        >
          <div className="bg-gradient-to-br from-[#D4B896]/20 to-[#D4B896]/10 backdrop-blur-xl rounded-2xl p-4 border border-[#D4B896]/30 shadow-2xl shadow-black/30">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-[#D4B896]/20 rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#D4B896]" />
              </div>
              <div className="flex-1">
                <h3 className="text-[#D4B896] font-medium mb-1">Something shifted here</h3>
                <p className="text-white/70 text-sm mb-3">
                  Would you like to capture the spirit of this conversation?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={onCapture}
                    className="px-4 py-2 bg-[#D4B896]/30 hover:bg-[#D4B896]/40 border border-[#D4B896]/50
                             rounded-lg text-[#D4B896] text-sm font-medium transition-all active:scale-95"
                  >
                    Capture the Spirit
                  </button>
                  <button
                    onClick={onDismiss}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/20
                             rounded-lg text-white/60 text-sm transition-all active:scale-95"
                  >
                    Not Now
                  </button>
                </div>
              </div>
              <button
                onClick={onDismiss}
                className="flex-shrink-0 p-1 text-white/40 hover:text-white/60 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
