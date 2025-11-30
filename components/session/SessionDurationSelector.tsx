'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock } from 'lucide-react';

interface SessionDurationSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (duration: number) => void;
  defaultDuration?: number;
}

export function SessionDurationSelector({
  isOpen,
  onClose,
  onSelect,
  defaultDuration = 50
}: SessionDurationSelectorProps) {
  const durations = [15, 30, 45, 60, 90, 120];

  const handleSelect = (duration: number) => {
    onSelect(duration);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-[36%] left-4 right-4
                       bg-stone-900/95 backdrop-blur-xl border border-amber-500/20
                       rounded-2xl p-6 w-auto max-w-none z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-amber-400" />
                <div>
                  <h3 className="text-lg font-medium text-white">Start Session</h3>
                  <p className="text-sm text-stone-400">Choose your session duration</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-stone-400" />
              </button>
            </div>

            {/* Duration Options */}
            <div className="space-y-3">
              {durations.map((duration) => (
                <motion.button
                  key={duration}
                  onClick={() => handleSelect(duration)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full p-4 rounded-xl text-left transition-all ${
                    defaultDuration === duration
                      ? 'bg-amber-500/20 border border-amber-500/40 text-amber-200'
                      : 'bg-stone-800/50 border border-stone-700/50 text-stone-300 hover:bg-stone-700/50 hover:border-stone-600/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{duration} minutes</div>
                      <div className="text-sm opacity-70">
                        {duration <= 30 ? 'Quick session' :
                         duration <= 60 ? 'Standard session' :
                         duration <= 90 ? 'Extended session' :
                         'Deep session'}
                      </div>
                    </div>
                    <div className="text-2xl opacity-50">
                      {duration <= 30 ? '🌱' :
                       duration <= 60 ? '🌳' :
                       duration <= 90 ? '🌲' : '🧘'}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Cancel */}
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full mt-4 p-3 rounded-xl bg-stone-800/50 border border-stone-700/50
                         text-stone-400 hover:bg-stone-700/50 hover:border-stone-600/50
                         transition-all"
            >
              Cancel
            </motion.button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}