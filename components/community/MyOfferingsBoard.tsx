'use client';

/**
 * My Offerings Board
 *
 * Member dashboard showing their contributions to the commons.
 * Shows status, impact signals, and steward feedback.
 *
 * See /docs/COMMONS_CONTRIBUTION_SYSTEM.md for context.
 */

import { useState } from 'react';
import Link from 'next/link';
import type { ContributionType, ContributionStatus, ContributionTag } from './ContributionForm';

interface MemberContribution {
  id: string;
  type: ContributionType;
  status: ContributionStatus;
  title: string;
  content: string;
  tags: ContributionTag[];
  attribution?: string;
  whenHelpful?: string;
  whenNot?: string;
  createdAt: string;
  submittedAt?: string;
  publishedAt?: string;
  reviewNotes?: string;
  usageCount: number;
  saveCount: number;
}

interface ContributorStats {
  level: number;
  acceptedCount: number;
  orientationCompleted: boolean;
  endorsedBy?: string;
}

interface MyOfferingsBoardProps {
  contributions: MemberContribution[];
  stats: ContributorStats;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

// Type labels
const TYPE_LABELS: Record<ContributionType, string> = {
  prompt: 'Prompt',
  practice: 'Practice',
  agreement: 'Agreement',
  resource: 'Resource',
  story: 'Story',
};

// Status styling
const STATUS_STYLES: Record<ContributionStatus, { label: string; bg: string; text: string }> = {
  draft: { label: 'Draft', bg: 'bg-stone-100', text: 'text-stone-500' },
  submitted: { label: 'In Review', bg: 'bg-[#6b5a98]/10', text: 'text-[#6b5a98]' },
  needs_revision: { label: 'Needs Revision', bg: 'bg-amber-100', text: 'text-amber-700' },
  published: { label: 'Published', bg: 'bg-[#5a7a6f]/10', text: 'text-[#5a7a6f]' },
  archived: { label: 'Archived', bg: 'bg-stone-200', text: 'text-stone-500' },
  flagged: { label: 'Under Review', bg: 'bg-rose-100', text: 'text-rose-600' },
};

// Level labels
const LEVEL_LABELS: Record<number, { label: string; description: string }> = {
  0: { label: 'Submitter', description: 'Can submit contributions for review' },
  1: { label: 'Contributor', description: 'Lighter review, can suggest edits' },
  2: { label: 'Curator', description: 'Can review and publish contributions' },
};

// Offering symbol
function OfferingSymbol({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="20" cy="20" r="14" />
      <path d="M20 12v16M12 20h16" />
    </svg>
  );
}

function ContributionCard({
  contribution,
  onEdit,
  onDelete,
}: {
  contribution: MemberContribution;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const statusStyle = STATUS_STYLES[contribution.status];
  const canEdit = ['draft', 'needs_revision'].includes(contribution.status);
  const canDelete = contribution.status === 'draft';

  return (
    <div className="bg-white/40 border border-stone-200/60 rounded-xl p-5 hover:bg-white/60 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-md bg-stone-100 text-stone-500">
            {TYPE_LABELS[contribution.type]}
          </span>
          <span className={`text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-md ${statusStyle.bg} ${statusStyle.text}`}>
            {statusStyle.label}
          </span>
        </div>
        {contribution.status === 'published' && (
          <div className="flex items-center gap-3 text-[11px] tracking-wide text-stone-500">
            {contribution.usageCount > 0 && (
              <span>Used in {contribution.usageCount} circles</span>
            )}
            {contribution.saveCount > 0 && (
              <span>Saved by {contribution.saveCount}</span>
            )}
          </div>
        )}
      </div>

      <h3 className="text-[15px] font-medium tracking-wide text-stone-700 mb-2">
        {contribution.title}
      </h3>

      <p className="text-[13px] tracking-wide text-stone-500 leading-relaxed line-clamp-2">
        {contribution.content}
      </p>

      {/* Revision feedback */}
      {contribution.status === 'needs_revision' && contribution.reviewNotes && (
        <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200/60">
          <p className="text-[11px] uppercase tracking-[0.2em] text-amber-600 mb-1">
            Curator Feedback
          </p>
          <p className="text-[13px] tracking-wide text-amber-700 leading-relaxed">
            {contribution.reviewNotes}
          </p>
        </div>
      )}

      {/* Tags */}
      {contribution.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {contribution.tags.map((tag, i) => (
            <span
              key={i}
              className="text-[10px] tracking-wider px-2 py-0.5 rounded-md bg-stone-100 text-stone-500"
            >
              {tag.element || tag.domain}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 pt-3 border-t border-stone-200/40 flex items-center justify-between">
        <span className="text-[11px] tracking-wide text-stone-500">
          {contribution.status === 'published' && contribution.publishedAt
            ? `Published ${new Date(contribution.publishedAt).toLocaleDateString()}`
            : contribution.submittedAt
            ? `Submitted ${new Date(contribution.submittedAt).toLocaleDateString()}`
            : `Created ${new Date(contribution.createdAt).toLocaleDateString()}`}
        </span>
        <div className="flex items-center gap-2">
          {canEdit && onEdit && (
            <button
              onClick={onEdit}
              className="px-3 py-1.5 text-[12px] tracking-wide text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
            >
              Edit
            </button>
          )}
          {canDelete && onDelete && (
            <button
              onClick={onDelete}
              className="px-3 py-1.5 text-[12px] tracking-wide text-stone-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            >
              Delete
            </button>
          )}
          {contribution.status === 'published' && (
            <Link
              href={`/maia/community/commons/${contribution.type}s/${contribution.id}`}
              className="px-3 py-1.5 text-[12px] tracking-wide text-[#6b5a98] hover:bg-[#6b5a98]/10 rounded-lg transition-colors"
            >
              View
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MyOfferingsBoard({
  contributions,
  stats,
  onEdit,
  onDelete,
}: MyOfferingsBoardProps) {
  const [filter, setFilter] = useState<ContributionStatus | 'all'>('all');

  const filteredContributions = filter === 'all'
    ? contributions
    : contributions.filter(c => c.status === filter);

  const draftCount = contributions.filter(c => c.status === 'draft').length;
  const pendingCount = contributions.filter(c => ['submitted', 'needs_revision'].includes(c.status)).length;
  const publishedCount = contributions.filter(c => c.status === 'published').length;

  const levelInfo = LEVEL_LABELS[stats.level];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-light tracking-wide text-stone-800 mb-2">
            Your Offerings
          </h1>
          <p className="text-[14px] tracking-wide text-stone-500">
            {publishedCount} published • {pendingCount} pending • {draftCount} drafts
          </p>
        </div>
        <Link
          href="/maia/community/commons/contribute"
          className="px-5 py-2.5 bg-[#6b5a98] hover:bg-[#5b4a88] text-white rounded-xl text-[13px] tracking-wide transition-colors flex items-center gap-2"
        >
          <OfferingSymbol className="w-4 h-4" />
          New Offering
        </Link>
      </div>

      {/* Contributor Level Card */}
      <div className="bg-white/40 border border-stone-200/60 rounded-xl p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] uppercase tracking-[0.2em] text-stone-500">
                Contribution Level
              </span>
              <span className={`text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-md ${
                stats.level >= 2
                  ? 'bg-[#8a7a5a]/10 text-[#8a7a5a]'
                  : stats.level >= 1
                  ? 'bg-[#5a7a6f]/10 text-[#5a7a6f]'
                  : 'bg-stone-100 text-stone-500'
              }`}>
                Level {stats.level}: {levelInfo.label}
              </span>
            </div>
            <p className="text-[13px] tracking-wide text-stone-600">
              {levelInfo.description}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[24px] font-light tracking-wide text-stone-700">
              {stats.acceptedCount}
            </p>
            <p className="text-[11px] tracking-wide text-stone-500">
              accepted
            </p>
          </div>
        </div>

        {/* Level progress (for Level 0) */}
        {stats.level === 0 && (
          <div className="mt-4 pt-4 border-t border-stone-200/40">
            <p className="text-[12px] tracking-wide text-stone-500 mb-2">
              To reach Contributor level:
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                  stats.orientationCompleted ? 'bg-[#5a7a6f]' : 'bg-stone-200'
                }`}>
                  {stats.orientationCompleted && (
                    <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  )}
                </div>
                <span className={`text-[12px] tracking-wide ${
                  stats.orientationCompleted ? 'text-stone-600' : 'text-stone-500'
                }`}>
                  Complete Safety & Boundaries orientation
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                  stats.acceptedCount >= 2 ? 'bg-[#5a7a6f]' : 'bg-stone-200'
                }`}>
                  {stats.acceptedCount >= 2 && (
                    <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  )}
                </div>
                <span className={`text-[12px] tracking-wide ${
                  stats.acceptedCount >= 2 ? 'text-stone-600' : 'text-stone-500'
                }`}>
                  {stats.acceptedCount}/2 accepted contributions
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2">
        {[
          { value: 'all', label: 'All' },
          { value: 'draft', label: 'Drafts' },
          { value: 'submitted', label: 'In Review' },
          { value: 'needs_revision', label: 'Needs Revision' },
          { value: 'published', label: 'Published' },
        ].map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setFilter(value as typeof filter)}
            className={`px-4 py-2 rounded-lg text-[13px] tracking-wide transition-colors ${
              filter === value
                ? 'bg-[#6b5a98]/10 text-[#6b5a98]'
                : 'text-stone-500 hover:bg-stone-100'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Contributions list */}
      {filteredContributions.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-stone-100 flex items-center justify-center">
            <OfferingSymbol className="w-8 h-8 text-stone-500" />
          </div>
          <p className="text-[14px] tracking-wide text-stone-500 mb-4">
            {filter === 'all'
              ? 'You haven\'t created any offerings yet'
              : `No ${filter.replace('_', ' ')} offerings`}
          </p>
          {filter === 'all' && (
            <Link
              href="/maia/community/commons/contribute"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#6b5a98] hover:bg-[#5b4a88] text-white rounded-xl text-[13px] tracking-wide transition-colors"
            >
              Create Your First Offering
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredContributions.map((contribution) => (
            <ContributionCard
              key={contribution.id}
              contribution={contribution}
              onEdit={onEdit ? () => onEdit(contribution.id) : undefined}
              onDelete={onDelete ? () => onDelete(contribution.id) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export type { MemberContribution, ContributorStats };
