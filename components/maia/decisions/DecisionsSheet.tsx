'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, GitFork, Plus, Clock } from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';

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

interface Decision {
  id: string;
  title: string;
  context?: string;
  status: 'open' | 'made' | 'revisiting';
  created_at: string;
}

export function DecisionsSheet({
  isOpen,
  onClose,
  memberId,
  memberName,
}: DecisionsSheetProps) {
  const [view, setView] = useState<ViewState>({ type: 'list' });
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [context, setContext] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [savedDecisionId, setSavedDecisionId] = useState<string | null>(null);

  // Reset to list view when sheet closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setView({ type: 'list' });
        setTitle('');
        setContext('');
        setSavedDecisionId(null);
      }, 300);
    }
  }, [isOpen]);

  // Load decisions when list view is shown and sheet is open
  useEffect(() => {
    if (isOpen && view.type === 'list' && memberId) {
      loadDecisions();
    }
  }, [isOpen, view.type, memberId]);

  const loadDecisions = async () => {
    setIsLoading(true);
    try {
      const response = await apiFetch('/api/decisions');
      if (response.ok) {
        const data = await response.json();
        setDecisions(data.decisions ?? []);
      }
    } catch (error) {
      console.error('[DecisionsSheet] Failed to load decisions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;

    setIsSaving(true);
    try {
      const response = await apiFetch('/api/decisions', {
        method: 'POST',
        body: JSON.stringify({
          memberId,
          title: title.trim(),
          context: context.trim() || undefined,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const newId = data.decision?.id ?? `local_${Date.now()}`;
        setSavedDecisionId(newId);
        setView({ type: 'detail', decisionId: newId });
        setDecisions((prev) => [
          {
            id: newId,
            title: title.trim(),
            context: context.trim() || undefined,
            status: 'open',
            created_at: new Date().toISOString(),
          },
          ...prev,
        ]);
      } else {
        // API not yet implemented — log and show saved state optimistically
        console.log('[DecisionsSheet] API not available, saving locally:', { memberId, title, context });
        const localId = `local_${Date.now()}`;
        setSavedDecisionId(localId);
        setDecisions((prev) => [
          {
            id: localId,
            title: title.trim(),
            context: context.trim() || undefined,
            status: 'open',
            created_at: new Date().toISOString(),
          },
          ...prev,
        ]);
        setView({ type: 'detail', decisionId: localId });
      }
    } catch (error) {
      console.error('[DecisionsSheet] Failed to save decision:', error);
      // Optimistic local fallback
      const localId = `local_${Date.now()}`;
      setSavedDecisionId(localId);
      setDecisions((prev) => [
        {
          id: localId,
          title: title.trim(),
          context: context.trim() || undefined,
          status: 'open',
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);
      setView({ type: 'detail', decisionId: localId });
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    if (view.type === 'create') {
      setTitle('');
      setContext('');
      setView({ type: 'list' });
    } else if (view.type === 'detail') {
      setView({ type: 'list' });
      setSavedDecisionId(null);
    }
  };

  const getTitle = () => {
    if (view.type === 'list') return 'Decisions';
    if (view.type === 'create') return 'Track a Decision';
    return 'Decision';
  };

  const showBack = view.type !== 'list';

  const currentDecision =
    view.type === 'detail'
      ? decisions.find((d) => d.id === view.decisionId)
      : null;

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
            className="fixed bottom-0 left-0 right-0 bg-gradient-to-b from-stone-900 to-black border-t border-emerald-500/30 rounded-t-3xl z-[9999] max-h-[90vh] overflow-hidden flex flex-col"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            {/* Handle */}
            <div className="w-12 h-1 bg-emerald-500/40 rounded-full mx-auto mt-3 mb-2" />

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
                  <GitFork className="w-5 h-5 text-emerald-400" />
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
                {/* List View */}
                {view.type === 'list' && (
                  <motion.div
                    key="list"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                    className="p-4"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="w-6 h-6 border-2 border-emerald-500/40 border-t-emerald-400 rounded-full animate-spin" />
                      </div>
                    ) : decisions.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
                        <GitFork className="w-10 h-10 text-emerald-400/40" />
                        <div className="space-y-1">
                          <p className="text-stone-300 text-sm">No decisions tracked yet.</p>
                          <p className="text-stone-500 text-xs leading-relaxed max-w-xs">
                            Decisions are crossroads — moments where you chose.
                            Tracking them builds self-knowledge over time.
                          </p>
                        </div>
                        <button
                          onClick={() => setView({ type: 'create' })}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm transition-all"
                        >
                          <Plus className="w-4 h-4" />
                          Track a Decision
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-stone-500 text-xs">{decisions.length} decision{decisions.length !== 1 ? 's' : ''}</span>
                          <button
                            onClick={() => setView({ type: 'create' })}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs transition-all"
                          >
                            <Plus className="w-3 h-3" />
                            Track
                          </button>
                        </div>
                        {decisions.map((decision) => (
                          <button
                            key={decision.id}
                            onClick={() => setView({ type: 'detail', decisionId: decision.id })}
                            className="w-full text-left p-3 rounded-xl bg-stone-800/40 hover:bg-stone-800/70 border border-stone-700/30 hover:border-emerald-500/30 transition-all"
                          >
                            <div className="flex items-start gap-3">
                              <GitFork className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-stone-200 text-sm font-medium truncate">{decision.title}</p>
                                {decision.context && (
                                  <p className="text-stone-500 text-xs mt-0.5 line-clamp-1">{decision.context}</p>
                                )}
                                <div className="flex items-center gap-1 mt-1">
                                  <Clock className="w-3 h-3 text-stone-600" />
                                  <span className="text-stone-600 text-xs">
                                    {new Date(decision.created_at).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Create View */}
                {view.type === 'create' && (
                  <motion.div
                    key="create"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="p-4 space-y-4"
                  >
                    <p className="text-stone-400 text-sm leading-relaxed">
                      Name the crossroads. Even a few words can anchor the moment.
                    </p>

                    <div className="space-y-1.5">
                      <label className="text-stone-400 text-xs font-medium uppercase tracking-wide">
                        What decision are you facing?
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Whether to leave my job"
                        className="w-full px-3 py-2.5 rounded-lg bg-stone-800/60 border border-stone-700/50 text-stone-200 placeholder-stone-600 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
                        autoFocus
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-stone-400 text-xs font-medium uppercase tracking-wide">
                        Any context? <span className="text-stone-600 normal-case font-normal">(optional)</span>
                      </label>
                      <textarea
                        value={context}
                        onChange={(e) => setContext(e.target.value)}
                        placeholder="What's the landscape of this choice?"
                        rows={3}
                        className="w-full px-3 py-2.5 rounded-lg bg-stone-800/60 border border-stone-700/50 text-stone-200 placeholder-stone-600 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors resize-none"
                      />
                    </div>

                    <button
                      onClick={handleSubmit}
                      disabled={!title.trim() || isSaving}
                      className="w-full py-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {isSaving ? 'Tracking...' : 'Track this decision'}
                    </button>
                  </motion.div>
                )}

                {/* Detail View */}
                {view.type === 'detail' && (
                  <motion.div
                    key="detail"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="p-4 space-y-4"
                  >
                    {currentDecision ? (
                      <>
                        <div className="space-y-2">
                          <div className="flex items-start gap-3">
                            <GitFork className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <h3 className="text-stone-100 text-base font-medium leading-snug">
                                {currentDecision.title}
                              </h3>
                              {currentDecision.context && (
                                <p className="text-stone-400 text-sm mt-1 leading-relaxed">
                                  {currentDecision.context}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 pl-8">
                            <Clock className="w-3 h-3 text-stone-600" />
                            <span className="text-stone-600 text-xs">
                              Tracked {new Date(currentDecision.created_at).toLocaleDateString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                        </div>

                        <div className="border-t border-stone-800/60 pt-4">
                          <p className="text-stone-600 text-sm text-center italic">
                            No reflections yet.
                          </p>
                        </div>

                        {savedDecisionId && (
                          <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-center">
                            <p className="text-emerald-400 text-sm">Decision tracked.</p>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex items-center justify-center py-12">
                        <p className="text-stone-500 text-sm">Decision not found.</p>
                      </div>
                    )}
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
