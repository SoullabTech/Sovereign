'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileCode,
  GitBranch,
  Eye,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Clock,
  Package,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

interface ReviewItem {
  id: string;
  taskId: string;
  title: string;
  agentType: string;
  gateType: 'taste' | 'risk' | 'strategy';
  summary: string;
  changes: { file: string; additions: number; deletions: number }[];
  completedAt: string;
  reviewStatus: 'pending' | 'approved' | 'rejected' | 'needs_changes';
}

const mockReviews: ReviewItem[] = [
  {
    id: '1',
    taskId: 't1',
    title: 'Fix iOS redirect after signin',
    agentType: 'maia-dev',
    gateType: 'taste',
    summary: 'Created navigateToApp() helper function. Fixed 6 redirect paths to use .html extension on native iOS. Build passes, typecheck passes.',
    changes: [
      { file: 'app/signin/page.tsx', additions: 12, deletions: 6 },
    ],
    completedAt: '10 minutes ago',
    reviewStatus: 'pending',
  },
  {
    id: '2',
    taskId: 't2',
    title: 'Add voice mode to capture',
    agentType: 'maia-dev',
    gateType: 'taste',
    summary: 'Added VoiceToggle component. Integrated with existing CaptureSheet. Uses native speech recognition on iOS, Web Speech API on web.',
    changes: [
      { file: 'components/capture/CaptureSheet.tsx', additions: 45, deletions: 3 },
      { file: 'components/capture/VoiceToggle.tsx', additions: 87, deletions: 0 },
      { file: 'lib/voice/captureVoice.ts', additions: 42, deletions: 0 },
    ],
    completedAt: '25 minutes ago',
    reviewStatus: 'pending',
  },
  {
    id: '3',
    taskId: 't3',
    title: 'Update API rate limiting',
    agentType: 'maia-ops',
    gateType: 'risk',
    summary: 'Increased rate limit from 100/min to 200/min for authenticated users. Added per-endpoint limits for /api/sovereign routes.',
    changes: [
      { file: 'middleware.ts', additions: 18, deletions: 5 },
      { file: 'lib/rateLimit.ts', additions: 32, deletions: 12 },
    ],
    completedAt: '1 hour ago',
    reviewStatus: 'pending',
  },
];

const gateConfig = {
  taste: { label: 'Taste Gate', description: 'Does this solution feel right?', color: 'teal' },
  risk: { label: 'Risk Gate', description: 'Could this break something?', color: 'amber' },
  strategy: { label: 'Strategy Gate', description: 'Is this the right direction?', color: 'purple' },
};

export default function ReviewPage() {
  const [reviews, setReviews] = useState(mockReviews);
  const [expandedReview, setExpandedReview] = useState<string | null>('1');
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});

  const pendingCount = reviews.filter(r => r.reviewStatus === 'pending').length;

  const handleApprove = (id: string) => {
    setReviews(reviews.map(r =>
      r.id === id ? { ...r, reviewStatus: 'approved' as const } : r
    ));
    // In real implementation, this would trigger shipping
    alert('Approved! Moving to ship queue.');
  };

  const handleReject = (id: string) => {
    setReviews(reviews.map(r =>
      r.id === id ? { ...r, reviewStatus: 'rejected' as const } : r
    ));
  };

  const handleRequestChanges = (id: string) => {
    const notes = reviewNotes[id];
    if (!notes) {
      alert('Please add notes explaining what changes are needed.');
      return;
    }
    setReviews(reviews.map(r =>
      r.id === id ? { ...r, reviewStatus: 'needs_changes' as const } : r
    ));
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <CheckCircle2 className="w-7 h-7 text-teal-400" />
            Review Queue
          </h1>
          <p className="text-slate-400 mt-1">
            Operator Gate 2: Your judgment is the product
          </p>
        </div>

        {pendingCount > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-teal-500/20 text-teal-400 rounded-lg">
            <Eye className="w-4 h-4" />
            {pendingCount} awaiting your decision
          </div>
        )}
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        <AnimatePresence>
          {reviews.filter(r => r.reviewStatus === 'pending').map((review) => {
            const gate = gateConfig[review.gateType];
            const isExpanded = expandedReview === review.id;

            return (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 100 }}
                className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden"
              >
                {/* Header */}
                <button
                  onClick={() => setExpandedReview(isExpanded ? null : review.id)}
                  className="w-full p-4 flex items-center gap-4 hover:bg-slate-800/50 transition-colors"
                >
                  {/* Gate Indicator */}
                  <div className={`
                    w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                    ${review.gateType === 'taste' ? 'bg-teal-500/20' : ''}
                    ${review.gateType === 'risk' ? 'bg-amber-500/20' : ''}
                    ${review.gateType === 'strategy' ? 'bg-purple-500/20' : ''}
                  `}>
                    {review.gateType === 'taste' && <ThumbsUp className="w-5 h-5 text-teal-400" />}
                    {review.gateType === 'risk' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
                    {review.gateType === 'strategy' && <GitBranch className="w-5 h-5 text-purple-400" />}
                  </div>

                  {/* Content */}
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-medium">{review.title}</h3>
                      <span className={`
                        px-2 py-0.5 text-xs rounded
                        ${review.gateType === 'taste' ? 'bg-teal-500/20 text-teal-400' : ''}
                        ${review.gateType === 'risk' ? 'bg-amber-500/20 text-amber-400' : ''}
                        ${review.gateType === 'strategy' ? 'bg-purple-500/20 text-purple-400' : ''}
                      `}>
                        {gate.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span>{review.agentType}</span>
                      <span>•</span>
                      <span>{review.changes.length} file{review.changes.length !== 1 ? 's' : ''} changed</span>
                      <span>•</span>
                      <span>{review.completedAt}</span>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => handleApprove(review.id)}
                      className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                      title="Approve"
                    >
                      <ThumbsUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleReject(review.id)}
                      className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                      title="Reject"
                    >
                      <ThumbsDown className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Expand Icon */}
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  )}
                </button>

                {/* Expanded Content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-slate-800"
                    >
                      <div className="p-4 space-y-4">
                        {/* Gate Question */}
                        <div className={`
                          p-3 rounded-lg border
                          ${review.gateType === 'taste' ? 'bg-teal-500/10 border-teal-500/30' : ''}
                          ${review.gateType === 'risk' ? 'bg-amber-500/10 border-amber-500/30' : ''}
                          ${review.gateType === 'strategy' ? 'bg-purple-500/10 border-purple-500/30' : ''}
                        `}>
                          <div className="text-sm font-medium text-white mb-1">{gate.label}</div>
                          <div className="text-sm text-slate-400">{gate.description}</div>
                        </div>

                        {/* Summary */}
                        <div>
                          <div className="text-xs text-slate-500 uppercase mb-2">Agent Summary</div>
                          <div className="bg-slate-800 rounded-lg p-3 text-sm text-slate-300">
                            {review.summary}
                          </div>
                        </div>

                        {/* Changes */}
                        <div>
                          <div className="text-xs text-slate-500 uppercase mb-2">Changes</div>
                          <div className="space-y-2">
                            {review.changes.map((change, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between p-2 bg-slate-800 rounded-lg"
                              >
                                <div className="flex items-center gap-2 text-sm">
                                  <FileCode className="w-4 h-4 text-slate-400" />
                                  <span className="font-mono text-slate-300">{change.file}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs">
                                  <span className="text-emerald-400">+{change.additions}</span>
                                  <span className="text-red-400">-{change.deletions}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Review Notes */}
                        <div>
                          <div className="text-xs text-slate-500 uppercase mb-2">Review Notes (optional)</div>
                          <textarea
                            value={reviewNotes[review.id] || ''}
                            onChange={(e) => setReviewNotes({ ...reviewNotes, [review.id]: e.target.value })}
                            placeholder="Add notes if requesting changes..."
                            className="w-full h-20 bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm text-white placeholder-slate-500 resize-none focus:outline-none focus:border-teal-500/50"
                          />
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3 pt-2">
                          <button
                            onClick={() => handleApprove(review.id)}
                            className="flex-1 py-2.5 bg-maia-navy-700 text-white rounded-lg hover:bg-maia-navy-600 transition-colors font-medium flex items-center justify-center gap-2"
                          >
                            <Package className="w-4 h-4" />
                            Approve & Ship
                          </button>
                          <button
                            onClick={() => handleRequestChanges(review.id)}
                            className="px-4 py-2.5 bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500/30 transition-colors flex items-center gap-2"
                          >
                            <MessageSquare className="w-4 h-4" />
                            Request Changes
                          </button>
                          <button
                            onClick={() => handleReject(review.id)}
                            className="px-4 py-2.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors flex items-center gap-2"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {reviews.filter(r => r.reviewStatus === 'pending').length === 0 && (
        <div className="text-center py-12 text-slate-500">
          <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <div className="text-lg">Review queue is clear</div>
          <div className="text-sm mt-1">All agent work has been reviewed</div>
        </div>
      )}

      {/* Completed Reviews */}
      {reviews.filter(r => r.reviewStatus !== 'pending').length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-slate-400 mb-4">Recently Reviewed</h2>
          <div className="space-y-2">
            {reviews.filter(r => r.reviewStatus !== 'pending').map((review) => (
              <div
                key={review.id}
                className="flex items-center gap-3 p-3 bg-slate-900/50 border border-slate-800/50 rounded-lg"
              >
                {review.reviewStatus === 'approved' && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                )}
                {review.reviewStatus === 'rejected' && (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
                {review.reviewStatus === 'needs_changes' && (
                  <MessageSquare className="w-5 h-5 text-amber-400" />
                )}
                <span className="text-slate-300">{review.title}</span>
                <span className="text-xs text-slate-500 ml-auto">
                  {review.reviewStatus === 'approved' && 'Shipped'}
                  {review.reviewStatus === 'rejected' && 'Rejected'}
                  {review.reviewStatus === 'needs_changes' && 'Changes requested'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
