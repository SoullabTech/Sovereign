'use client';

/**
 * ShadowWorkSheet
 * Bottom sheet wrapper for ShadowWorkGuide
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Moon } from 'lucide-react';
import ShadowWorkGuide from './ShadowWorkGuide';

interface ShadowWorkSheetProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onComplete?: (responses: Record<string, string>) => void;
}

export function ShadowWorkSheet({
  isOpen,
  onClose,
  userId,
  onComplete,
}: ShadowWorkSheetProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
            onClick={onClose}
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-stone-900 border-t border-violet-500/30 rounded-t-3xl z-[9999] max-h-[90vh] overflow-hidden"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            {/* Handle */}
            <div className="w-12 h-1 bg-violet-500/40 rounded-full mx-auto mt-3" />

            {/* Content - scrollable area */}
            <div className="overflow-y-auto max-h-[85vh]">
              <ShadowWorkGuide
                userId={userId}
                onClose={onClose}
                onComplete={onComplete}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
