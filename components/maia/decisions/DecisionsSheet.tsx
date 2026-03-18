'use client';

/**
 * DecisionsSheet — iOS bottom sheet for /maia ribbon
 *
 * Connects to the Studio Decision Council (/api/studio/decisions).
 * Three views: list → create → council detail
 * Includes MAIA Mentor for deeper reflection.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, Scale } from 'lucide-react';
import DecisionListView from './DecisionListView';
import DecisionCreate from './DecisionCreate';
import DecisionCouncilView from './DecisionCouncilView';

interface DecisionsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  memberId: string;
  memberName?: string;
}

type ViewState =
  | { type: 'list' }
  | { type: 'create' }
  | { type: 'detail'; decisionId: string };

export function DecisionsSheet({
  isOpen,
  onClose,
  memberId,
  memberName,
}: DecisionsSheetProps) {
  const [view, setView] = useState<ViewState>({ type: 'list' });

  // Reset to list when sheet closes
  useEffect(() => {
    if (!isOpen) {
      const t = setTimeout(() => setView({ type: 'list' }), 300);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  const handleBack = () => {
    if (view.type === 'create') setView({ type: 'list' });
    else if (view.type === 'detail') setView({ type: 'list' });
  };

  const getTitle = () => {
    if (view.type === 'list') return 'Decisions';
    if (view.type === 'create') return 'New Decision';
    return 'Decision';
  };

  const showBack = view.type !== 'list';

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
            className="fixed bottom-0 left-0 right-0 bg-gradient-to-b from-stone-900 to-black border-t border-amber-500/30 rounded-t-3xl z-[9999] max-h-[90vh] overflow-hidden flex flex-col"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            {/* Handle */}
            <div className="w-12 h-1 bg-amber-500/40 rounded-full mx-auto mt-3 mb-2" />

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-stone-800/50 flex-shrink-0">
              <div className="flex items-center gap-3">
                {showBack && (
                  <button
                    onClick={handleBack}
                    className="p-1.5 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5 text-stone-400" />
                  </button>
                )}
                <div className="flex items-center gap-2">
                  <Scale className="w-5 h-5 text-amber-400" />
                  <h2 className="text-lg font-medium text-white">{getTitle()}</h2>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-stone-400" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                {view.type === 'list' && (
                  <motion.div
                    key="list"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <DecisionListView
                      onSelect={(id) => setView({ type: 'detail', decisionId: id })}
                      onCreate={() => setView({ type: 'create' })}
                    />
                  </motion.div>
                )}

                {view.type === 'create' && (
                  <motion.div
                    key="create"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <DecisionCreate
                      onCreated={(id) => setView({ type: 'detail', decisionId: id })}
                      onBack={handleBack}
                    />
                  </motion.div>
                )}

                {view.type === 'detail' && (
                  <motion.div
                    key={`detail-${view.decisionId}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <DecisionCouncilView
                      decisionId={view.decisionId}
                      onBack={handleBack}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
