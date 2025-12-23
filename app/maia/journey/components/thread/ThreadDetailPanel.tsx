/**
 * ThreadDetailPanel Component - Journey Page Phase 4
 *
 * Expands a thread node into a full narrative view with reflections,
 * motifs, insights, and biofield data integration.
 *
 * Phase: 4.4-C Phase 4 (Interaction & Narrative Integration)
 * Created: December 23, 2024
 */

'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThreadDetail } from '../../hooks/useThreadDetail';
import { getElementColor } from '../../lib/spiralLayout';
import type { Thread } from '../../types';

export interface ThreadDetailPanelProps {
  /** Whether panel is visible */
  visible: boolean;

  /** Thread ID to display */
  threadId: number | null;

  /** Thread data from spiral (for immediate display) */
  threadPreview?: Thread;

  /** Close handler */
  onClose: () => void;

  /** Navigate to related thread */
  onNavigateToThread?: (threadId: number) => void;
}

/**
 * ThreadDetailPanel Component
 *
 * Opens when user clicks a thread node, displaying:
 * - Full narrative text
 * - Reflection content
 * - Related motifs and patterns
 * - Biofield correlation data
 * - Element/facet information
 *
 * @example
 * ```tsx
 * <ThreadDetailPanel
 *   visible={detailPanelVisible}
 *   threadId={activeThreadId}
 *   threadPreview={activeThread}
 *   onClose={() => setDetailPanelVisible(false)}
 * />
 * ```
 */
export function ThreadDetailPanel({
  visible,
  threadId,
  threadPreview,
  onClose,
  onNavigateToThread,
}: ThreadDetailPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Fetch detailed thread data
  const { threadDetail, isLoading, error } = useThreadDetail(threadId);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (visible) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [visible, onClose]);

  // Auto-scroll to top when opening
  useEffect(() => {
    if (visible && panelRef.current) {
      panelRef.current.scrollTop = 0;
    }
  }, [visible, threadId]);

  const thread = threadDetail || threadPreview;
  if (!thread) return null;

  const elementColor = getElementColor(thread.elementType);

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full md:w-2/3 lg:w-1/2
                       bg-white shadow-2xl z-50 overflow-y-auto"
          >
            {/* Header */}
            <div
              className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4"
              style={{
                borderTopColor: elementColor,
                borderTopWidth: '4px',
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 pr-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: elementColor }}
                    />
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      {thread.elementType} • Week {thread.weekNumber}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {thread.title}
                  </h2>
                </div>

                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2"
                  aria-label="Close panel"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Coherence Bar */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span>Coherence</span>
                  <span className="font-semibold">{Math.round(thread.coherence * 100)}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${thread.coherence * 100}%` }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: elementColor }}
                  />
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-6 space-y-8">
              {isLoading ? (
                <LoadingState />
              ) : error ? (
                <ErrorState error={error} />
              ) : (
                <>
                  {/* Summary Section */}
                  <section>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                      Summary
                    </h3>
                    <p className="text-base text-gray-700 leading-relaxed">
                      {thread.summary}
                    </p>
                  </section>

                  {/* Narrative Section */}
                  {threadDetail?.narrative && (
                    <section>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                        Narrative
                      </h3>
                      <div className="prose prose-sm max-w-none text-gray-700">
                        {threadDetail.narrative}
                      </div>
                    </section>
                  )}

                  {/* Reflection Section */}
                  {threadDetail?.reflection && (
                    <section className="bg-gray-50 -mx-6 px-6 py-6">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                        Reflection
                      </h3>
                      <blockquote className="border-l-4 pl-4 italic text-gray-600 leading-relaxed"
                        style={{ borderColor: elementColor }}
                      >
                        {threadDetail.reflection}
                      </blockquote>
                    </section>
                  )}

                  {/* Motifs Section */}
                  {threadDetail?.motifs && threadDetail.motifs.length > 0 && (
                    <section>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                        Emerging Patterns
                      </h3>
                      <div className="space-y-3">
                        {threadDetail.motifs.map((motif) => (
                          <div
                            key={motif.id}
                            className="p-4 bg-white border border-gray-200 rounded-lg"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <span className="font-medium text-gray-900">{motif.pattern}</span>
                              <span className="text-xs text-gray-500">
                                {Math.round(motif.significance * 100)}%
                              </span>
                            </div>
                            {motif.description && (
                              <p className="text-sm text-gray-600">{motif.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Related Insights */}
                  {threadDetail?.relatedInsights && threadDetail.relatedInsights.length > 0 && (
                    <section>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                        Related Insights
                      </h3>
                      <div className="space-y-2">
                        {threadDetail.relatedInsights.map((insight) => (
                          <div
                            key={insight.id}
                            className="p-3 bg-air-bg border border-air-border rounded-lg"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium text-air-text uppercase">
                                {insight.type}
                              </span>
                              <span className="text-xs text-gray-400">
                                {Math.round(insight.confidence * 100)}% confidence
                              </span>
                            </div>
                            <p className="text-sm text-gray-700">{insight.text}</p>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Biofield Correlation (if available) */}
                  {threadDetail?.biofieldData && (
                    <section className="bg-green-50 -mx-6 px-6 py-6">
                      <h3 className="text-sm font-semibold text-green-800 mb-3 uppercase tracking-wide">
                        🫀 Biofield Correlation
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-3 rounded-lg">
                          <div className="text-xs text-gray-500 mb-1">HRV Coherence</div>
                          <div className="text-lg font-semibold text-green-700">
                            {Math.round(threadDetail.biofieldData.hrvCoherence * 100)}%
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded-lg">
                          <div className="text-xs text-gray-500 mb-1">Voice Affect</div>
                          <div className="text-lg font-semibold text-green-700">
                            {threadDetail.biofieldData.voiceAffect.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </section>
                  )}

                  {/* Related Threads */}
                  {threadDetail?.relatedThreadIds && threadDetail.relatedThreadIds.length > 0 && (
                    <section>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                        Connected Threads
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {threadDetail.relatedThreadIds.map((relatedId) => (
                          <button
                            key={relatedId}
                            onClick={() => onNavigateToThread?.(relatedId)}
                            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-sm
                                       text-gray-700 rounded-full transition-colors"
                          >
                            Thread {relatedId}
                          </button>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Metadata Footer */}
                  <section className="pt-6 border-t border-gray-200 text-xs text-gray-500">
                    <div className="flex items-center justify-between">
                      <span>
                        Created: {new Date(thread.timestamp).toLocaleDateString()}
                      </span>
                      {thread.facetCode && (
                        <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                          {thread.facetCode}
                        </span>
                      )}
                    </div>
                  </section>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// Loading & Error States
// ============================================================================

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <div className="w-12 h-12 border-4 border-gray-200 border-t-purple-500 rounded-full animate-spin" />
      <p className="text-sm text-gray-500">Loading thread details...</p>
    </div>
  );
}

function ErrorState({ error }: { error: Error }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <div className="text-6xl">⚠️</div>
      <p className="text-sm text-gray-600">Failed to load thread details</p>
      <p className="text-xs text-gray-400">{error.message}</p>
    </div>
  );
}
