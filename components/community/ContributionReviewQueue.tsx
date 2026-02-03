'use client';

/**
 * Contribution Review Queue
 *
 * Curator interface for reviewing and approving member contributions.
 * Level 2 (Curator) access only.
 *
 * See /docs/COMMONS_CONTRIBUTION_SYSTEM.md for context.
 */

import { useState } from 'react';
import type { ContributionType, ContributionTag } from './ContributionForm';

interface ContributionForReview {
  id: string;
  type: ContributionType;
  status: 'submitted' | 'flagged';
  title: string;
  content: string;
  tags: ContributionTag[];
  attribution?: string;
  whenHelpful?: string;
  whenNot?: string;
  createdBy: {
    id: string;
    name: string;
    contributorLevel: number;
    acceptedCount: number;
  };
  submittedAt: string;
}

interface ReviewQueueProps {
  contributions: ContributionForReview[];
  onApprove: (id: string, safetyNotes?: string) => Promise<void>;
  onRequestRevision: (id: string, notes: string) => Promise<void>;
  onFlag: (id: string, reason: string) => Promise<void>;
  onArchive: (id: string, reason: string) => Promise<void>;
}

// Type labels
const TYPE_LABELS: Record<ContributionType, string> = {
  prompt: 'Reflection Prompt',
  practice: 'Micro-Practice',
  agreement: 'Agreement',
  resource: 'Resource',
  story: 'Story',
};

// Review criteria by type
const REVIEW_CRITERIA: Record<ContributionType, string[]> = {
  prompt: [
    'Clear and inviting language',
    'No prescriptive "you should" framing',
    'No promotional content',
  ],
  practice: [
    'Clear step-by-step instructions',
    'Attribution provided',
    '"When not helpful" section included',
    'No medical claims',
  ],
  agreement: [
    'Clear and actionable',
    'Inclusive language',
    'No hierarchy assumptions',
  ],
  resource: [
    'No affiliate links',
    'Bias disclosure if applicable',
    '"When not helpful" section included',
  ],
  story: [
    'First-person "I" language',
    'Experience-based, not advice',
    'No promotional content',
  ],
};

// Safety keywords that should be flagged
const SAFETY_KEYWORDS = [
  'cure', 'heal', 'guarantee', 'promise',
  'diagnosis', 'disorder', 'treatment',
  'medication', 'supplement', 'dosage',
];

function ReviewCard({
  contribution,
  onApprove,
  onRequestRevision,
  onFlag,
  onArchive,
}: {
  contribution: ContributionForReview;
  onApprove: (safetyNotes?: string) => void;
  onRequestRevision: (notes: string) => void;
  onFlag: (reason: string) => void;
  onArchive: (reason: string) => void;
}) {
  const [action, setAction] = useState<'review' | 'revision' | 'flag' | 'archive' | 'approve'>('review');
  const [notes, setNotes] = useState('');
  const [safetyNotes, setSafetyNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const criteria = REVIEW_CRITERIA[contribution.type];
  const [checkedCriteria, setCheckedCriteria] = useState<boolean[]>(
    new Array(criteria.length).fill(false)
  );

  // Check for safety keywords
  const foundKeywords = SAFETY_KEYWORDS.filter(
    keyword =>
      contribution.content.toLowerCase().includes(keyword) ||
      contribution.title.toLowerCase().includes(keyword)
  );

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      switch (action) {
        case 'approve':
          await onApprove(safetyNotes || undefined);
          break;
        case 'revision':
          await onRequestRevision(notes);
          break;
        case 'flag':
          await onFlag(notes);
          break;
        case 'archive':
          await onArchive(notes);
          break;
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white/60 border border-stone-200/60 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-stone-200/60">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] tracking-wider uppercase px-2 py-1 rounded-md bg-[#6b5a98]/10 text-[#6b5a98]">
                {TYPE_LABELS[contribution.type]}
              </span>
              {contribution.status === 'flagged' && (
                <span className="text-[10px] tracking-wider uppercase px-2 py-1 rounded-md bg-rose-100 text-rose-600">
                  Flagged
                </span>
              )}
              {contribution.createdBy.contributorLevel >= 1 && (
                <span className="text-[10px] tracking-wider uppercase px-2 py-1 rounded-md bg-[#5a7a6f]/10 text-[#5a7a6f]">
                  Contributor
                </span>
              )}
            </div>
            <h3 className="text-lg font-medium tracking-wide text-stone-800">
              {contribution.title}
            </h3>
          </div>
          <div className="text-right">
            <p className="text-[13px] tracking-wide text-stone-600">
              {contribution.createdBy.name}
            </p>
            <p className="text-[11px] tracking-wide text-stone-500">
              {contribution.createdBy.acceptedCount} accepted
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 border-b border-stone-200/60">
        <div className="text-[14px] tracking-wide text-stone-600 leading-relaxed whitespace-pre-line">
          {contribution.content}
        </div>

        {/* Metadata */}
        <div className="mt-4 pt-4 border-t border-stone-200/40 grid gap-3">
          {contribution.whenHelpful && (
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-stone-500 mb-1">
                When helpful
              </p>
              <p className="text-[13px] tracking-wide text-stone-500">
                {contribution.whenHelpful}
              </p>
            </div>
          )}
          {contribution.whenNot && (
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-stone-500 mb-1">
                When not helpful
              </p>
              <p className="text-[13px] tracking-wide text-stone-500">
                {contribution.whenNot}
              </p>
            </div>
          )}
          {contribution.attribution && (
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-stone-500 mb-1">
                Attribution
              </p>
              <p className="text-[13px] tracking-wide text-stone-500 italic">
                {contribution.attribution}
              </p>
            </div>
          )}
        </div>

        {/* Tags */}
        {contribution.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {contribution.tags.map((tag, i) => (
              <span
                key={i}
                className="text-[10px] tracking-wider px-2 py-1 rounded-md bg-stone-100 text-stone-500"
              >
                {tag.element || tag.domain}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Safety Keywords Warning */}
      {foundKeywords.length > 0 && (
        <div className="px-6 py-4 bg-amber-50 border-b border-amber-200/60">
          <p className="text-[13px] tracking-wide text-amber-700">
            <strong>Keywords detected:</strong> {foundKeywords.join(', ')}
          </p>
          <p className="text-[12px] tracking-wide text-amber-600 mt-1">
            Review carefully for claims or medical language.
          </p>
        </div>
      )}

      {/* Review Checklist */}
      {action === 'review' && (
        <div className="p-6 border-b border-stone-200/60 bg-stone-50/50">
          <h4 className="text-[11px] uppercase tracking-[0.2em] text-stone-500 mb-3">
            Review Checklist
          </h4>
          <div className="space-y-2">
            {criteria.map((criterion, i) => (
              <label key={i} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checkedCriteria[i]}
                  onChange={(e) => {
                    const newChecked = [...checkedCriteria];
                    newChecked[i] = e.target.checked;
                    setCheckedCriteria(newChecked);
                  }}
                  className="w-4 h-4 rounded border-stone-300 text-[#5a7a6f] focus:ring-[#5a7a6f]/20"
                />
                <span className="text-[13px] tracking-wide text-stone-600">
                  {criterion}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Action Selection */}
      <div className="p-6">
        {action === 'review' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setAction('approve')}
                disabled={!checkedCriteria.every(Boolean)}
                className={`p-4 rounded-xl text-center transition-all ${
                  checkedCriteria.every(Boolean)
                    ? 'bg-[#5a7a6f]/10 border-2 border-[#5a7a6f]/30 text-[#5a7a6f] hover:bg-[#5a7a6f]/20'
                    : 'bg-stone-100 border border-stone-200 text-stone-500 cursor-not-allowed'
                }`}
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 mx-auto mb-1" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                <span className="text-[13px] tracking-wide">Approve</span>
              </button>
              <button
                onClick={() => setAction('revision')}
                className="p-4 rounded-xl bg-amber-50 border border-amber-200/60 text-amber-700 hover:bg-amber-100 transition-all"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 mx-auto mb-1" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                <span className="text-[13px] tracking-wide">Request Revision</span>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setAction('flag')}
                className="p-3 rounded-xl bg-stone-100 border border-stone-200 text-stone-600 hover:bg-stone-200 transition-all text-[13px] tracking-wide"
              >
                Flag for Safety
              </button>
              <button
                onClick={() => setAction('archive')}
                className="p-3 rounded-xl bg-stone-100 border border-stone-200 text-stone-600 hover:bg-stone-200 transition-all text-[13px] tracking-wide"
              >
                Archive
              </button>
            </div>
          </div>
        )}

        {action === 'approve' && (
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] uppercase tracking-[0.2em] text-stone-500 mb-2">
                Safety Notes (optional)
              </label>
              <textarea
                value={safetyNotes}
                onChange={(e) => setSafetyNotes(e.target.value)}
                placeholder="Add any curator notes or cautions that should appear with this content..."
                className="w-full h-24 px-4 py-3 bg-white/60 border border-stone-200/60 rounded-xl text-[14px] tracking-wide text-stone-700 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-[#5a7a6f]/20 resize-none"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setAction('review')}
                className="px-4 py-2.5 text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded-xl text-[13px] tracking-wide transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 px-5 py-2.5 bg-[#5a7a6f] hover:bg-[#4a6a5f] text-white rounded-xl text-[13px] tracking-wide transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Publishing...' : 'Publish to Commons'}
              </button>
            </div>
          </div>
        )}

        {action === 'revision' && (
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] uppercase tracking-[0.2em] text-stone-500 mb-2">
                Revision Notes <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What needs to be changed? Be specific and kind..."
                className="w-full h-24 px-4 py-3 bg-white/60 border border-stone-200/60 rounded-xl text-[14px] tracking-wide text-stone-700 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 resize-none"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => { setAction('review'); setNotes(''); }}
                className="px-4 py-2.5 text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded-xl text-[13px] tracking-wide transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={!notes.trim() || isSubmitting}
                className={`flex-1 px-5 py-2.5 rounded-xl text-[13px] tracking-wide transition-colors ${
                  notes.trim() && !isSubmitting
                    ? 'bg-amber-500 hover:bg-amber-600 text-white'
                    : 'bg-stone-200 text-stone-500 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? 'Sending...' : 'Request Revision'}
              </button>
            </div>
          </div>
        )}

        {action === 'flag' && (
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] uppercase tracking-[0.2em] text-stone-500 mb-2">
                Flag Reason <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What safety concern does this raise?"
                className="w-full h-24 px-4 py-3 bg-white/60 border border-stone-200/60 rounded-xl text-[14px] tracking-wide text-stone-700 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 resize-none"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => { setAction('review'); setNotes(''); }}
                className="px-4 py-2.5 text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded-xl text-[13px] tracking-wide transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={!notes.trim() || isSubmitting}
                className={`flex-1 px-5 py-2.5 rounded-xl text-[13px] tracking-wide transition-colors ${
                  notes.trim() && !isSubmitting
                    ? 'bg-rose-500 hover:bg-rose-600 text-white'
                    : 'bg-stone-200 text-stone-500 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? 'Flagging...' : 'Flag for Safety Review'}
              </button>
            </div>
          </div>
        )}

        {action === 'archive' && (
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] uppercase tracking-[0.2em] text-stone-500 mb-2">
                Archive Reason <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Why is this being archived? (duplicate, outdated, etc.)"
                className="w-full h-24 px-4 py-3 bg-white/60 border border-stone-200/60 rounded-xl text-[14px] tracking-wide text-stone-700 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-500/20 resize-none"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => { setAction('review'); setNotes(''); }}
                className="px-4 py-2.5 text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded-xl text-[13px] tracking-wide transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={!notes.trim() || isSubmitting}
                className={`flex-1 px-5 py-2.5 rounded-xl text-[13px] tracking-wide transition-colors ${
                  notes.trim() && !isSubmitting
                    ? 'bg-stone-600 hover:bg-stone-700 text-white'
                    : 'bg-stone-200 text-stone-500 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? 'Archiving...' : 'Archive'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ContributionReviewQueue({
  contributions,
  onApprove,
  onRequestRevision,
  onFlag,
  onArchive,
}: ReviewQueueProps) {
  const [filter, setFilter] = useState<'all' | 'submitted' | 'flagged'>('all');
  const [typeFilter, setTypeFilter] = useState<ContributionType | 'all'>('all');

  const filteredContributions = contributions.filter(c => {
    if (filter !== 'all' && c.status !== filter) return false;
    if (typeFilter !== 'all' && c.type !== typeFilter) return false;
    return true;
  });

  const submittedCount = contributions.filter(c => c.status === 'submitted').length;
  const flaggedCount = contributions.filter(c => c.status === 'flagged').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-light tracking-wide text-stone-800 mb-2">
          Review Queue
        </h1>
        <p className="text-[14px] tracking-wide text-stone-500">
          {submittedCount} awaiting review
          {flaggedCount > 0 && <span className="text-rose-500"> • {flaggedCount} flagged</span>}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-[11px] uppercase tracking-[0.2em] text-stone-500">Status</span>
          <div className="flex gap-1">
            {['all', 'submitted', 'flagged'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as typeof filter)}
                className={`px-3 py-1.5 rounded-lg text-[12px] tracking-wide transition-colors ${
                  filter === f
                    ? f === 'flagged'
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-[#6b5a98]/10 text-[#6b5a98]'
                    : 'text-stone-500 hover:bg-stone-100'
                }`}
              >
                {f === 'all' ? 'All' : f === 'submitted' ? 'Submitted' : 'Flagged'}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] uppercase tracking-[0.2em] text-stone-500">Type</span>
          <div className="flex gap-1">
            {['all', 'prompt', 'practice', 'agreement', 'resource', 'story'].map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t as typeof typeFilter)}
                className={`px-3 py-1.5 rounded-lg text-[12px] tracking-wide transition-colors ${
                  typeFilter === t
                    ? 'bg-[#6b5a98]/10 text-[#6b5a98]'
                    : 'text-stone-500 hover:bg-stone-100'
                }`}
              >
                {t === 'all' ? 'All' : TYPE_LABELS[t as ContributionType]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Queue */}
      {filteredContributions.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-stone-100 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-stone-500" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <p className="text-[14px] tracking-wide text-stone-500">
            {filter === 'flagged'
              ? 'No flagged contributions'
              : 'Queue is clear'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredContributions.map((contribution) => (
            <ReviewCard
              key={contribution.id}
              contribution={contribution}
              onApprove={(safetyNotes) => onApprove(contribution.id, safetyNotes)}
              onRequestRevision={(notes) => onRequestRevision(contribution.id, notes)}
              onFlag={(reason) => onFlag(contribution.id, reason)}
              onArchive={(reason) => onArchive(contribution.id, reason)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export type { ContributionForReview };
