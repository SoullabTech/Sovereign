'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, Wind } from 'lucide-react';
import ChangeListView from './ChangeListView';
import NameYourChange from './NameYourChange';
import ChangeLandscapeVisual from './ChangeLandscapeVisual';
import ChangeJourney from './ChangeJourney';
import { apiFetch } from '@/lib/http/apiBase';

interface ChangesSheetProps {
  isOpen: boolean;
  onClose: () => void;
  memberId: string;
  memberName?: string;
}

type ViewState =
  | { type: 'list' }
  | { type: 'create'; step: 'name' | 'landscape' }
  | { type: 'journey'; changeId: string };

export function ChangesSheet({
  isOpen,
  onClose,
  memberId,
  memberName,
}: ChangesSheetProps) {
  const [view, setView] = useState<ViewState>({ type: 'list' });
  const [createData, setCreateData] = useState<{
    title: string;
    description: string;
  } | null>(null);

  // Reset to list view when sheet closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setView({ type: 'list' });
        setCreateData(null);
      }, 300);
    }
  }, [isOpen]);

  const handleStartCreate = () => {
    setView({ type: 'create', step: 'name' });
    setCreateData(null);
  };

  const handleNameNext = (title: string, description: string) => {
    setCreateData({ title, description });
    setView({ type: 'create', step: 'landscape' });
  };

  const handleLandscapeSelect = async (changeType: string) => {
    if (!createData) return;

    try {
      const response = await apiFetch('/api/changes', {
        method: 'POST',
        body: JSON.stringify({
          title: createData.title,
          description: createData.description,
          changeType,
          urgency: 'none',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create change');
      }

      const result = await response.json();
      setView({ type: 'journey', changeId: result.change.id });
    } catch (error) {
      console.error('[ChangesSheet] Failed to create change:', error);
      // TODO: Show error toast
    }
  };

  const handleSelectChange = (changeId: string) => {
    setView({ type: 'journey', changeId });
  };

  const handleBack = () => {
    if (view.type === 'create') {
      if (view.step === 'landscape') {
        setView({ type: 'create', step: 'name' });
      } else {
        setView({ type: 'list' });
        setCreateData(null);
      }
    } else if (view.type === 'journey') {
      setView({ type: 'list' });
    }
  };

  const getTitle = () => {
    if (view.type === 'list') return 'Changes';
    if (view.type === 'create') {
      return view.step === 'name' ? 'Name Your Change' : 'What Kind of Change?';
    }
    return 'Change Journey';
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
            <div className="flex items-center justify-between px-4 py-3 border-b border-stone-800/50">
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
                  <Wind className="w-5 h-5 text-cyan-400" />
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

            {/* Content Area */}
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
                    <ChangeListView
                      memberId={memberId}
                      onSelect={handleSelectChange}
                      onCreate={handleStartCreate}
                    />
                  </motion.div>
                )}

                {view.type === 'create' && view.step === 'name' && (
                  <motion.div
                    key="create-name"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <NameYourChange
                      onNext={handleNameNext}
                      onBack={handleBack}
                      initialTitle={createData?.title}
                      initialDescription={createData?.description}
                    />
                  </motion.div>
                )}

                {view.type === 'create' && view.step === 'landscape' && (
                  <motion.div
                    key="create-landscape"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChangeLandscapeVisual
                      onSelect={handleLandscapeSelect}
                      onBack={handleBack}
                    />
                  </motion.div>
                )}

                {view.type === 'journey' && (
                  <motion.div
                    key="journey"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChangeJourney
                      changeId={view.changeId}
                      memberId={memberId}
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
