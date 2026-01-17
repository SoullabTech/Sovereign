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
          className="relative w-full max-w-md p-6 bg-[#0d1025] border border-indigo-900/50 rounded-2xl shadow-2xl shadow-black/60"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X size={20} className="text-white/50" />
          </button>

          {/* Icon */}
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-violet-600/30 to-purple-700/20 border border-violet-500/30 flex items-center justify-center">
            <Trash2 size={28} className="text-violet-400" />
          </div>

          {/* Content */}
          <h3 className="text-xl font-semibold text-white text-center mb-3">Data Deletion</h3>
          <p className="text-white/50 text-center mb-6">
            This feature is coming soon. Contact support to request data deletion.
          </p>

          {/* Button */}
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl text-white font-medium transition-all"
          >
            Close
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
