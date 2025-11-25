'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export function SacredLabDrawer({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex"
        >
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 130, damping: 18 }}
            className="ml-auto w-full max-w-md h-full bg-[#1A1512] border-l border-[#3A2F28] shadow-xl p-6 overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[#D4B896] text-xl font-semibold tracking-wide">
                Sacred Lab Tools
              </h2>
              <button
                onClick={onClose}
                className="text-[#D4B896] hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6 text-[#E5D6C5]">
              <div>
                <h3 className="font-semibold mb-2">Symbolic Analysis</h3>
                <p className="text-sm opacity-80">
                  Review the symbolic layers MAIA is tracking in real time.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Elemental Mapping</h3>
                <p className="text-sm opacity-80">
                  See which elemental forces are activated in the dialogue.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Archetypal Tracking</h3>
                <p className="text-sm opacity-80">
                  View archetypes currently engaged within the spiral.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Field Diagnostics</h3>
                <p className="text-sm opacity-80">
                  Monitor the auric, somatic, and cognitive resonance fields.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Lab Notes</h3>
                <p className="text-sm opacity-80">
                  Handwritten insights from facilitators or MAIA's inner guides.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}