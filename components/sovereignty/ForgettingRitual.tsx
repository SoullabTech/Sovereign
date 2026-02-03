'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X, Trash2 } from 'lucide-react';

// Stub: Forgetting Ritual component
// TODO: Implement full data deletion ceremony

interface ForgettingRitualProps {
  isOpen?: boolean;
  onClose?: () => void;
  onComplete?: () => void;
}

export default function ForgettingRitual({
  isOpen = false,
  onClose,
  onComplete
}: ForgettingRitualProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md p-6 bg-maia-navy-850 border border-maia-navy-700/50 rounded-2xl shadow-maia-panel-hover"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-maia-navy-800 transition-colors"
          >
            <X size={20} className="text-maia-ink-40" />
          </button>

          {/* Icon */}
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-maia-danger/30 to-maia-danger/10 border border-maia-danger/30 flex items-center justify-center">
            <Trash2 size={28} className="text-maia-danger" />
          </div>

          {/* Content */}
          <h3 className="text-xl font-semibold text-maia-ink-100 text-center mb-3">Data Deletion</h3>
          <p className="text-maia-ink-60 text-center mb-6">
            This feature is coming soon. Contact support to request data deletion.
          </p>

          {/* Button */}
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-maia-navy-800 hover:bg-maia-navy-700 border border-maia-navy-700/50 rounded-xl text-maia-ink-100 font-medium transition-all"
          >
            Close
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
