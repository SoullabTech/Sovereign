'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { CaseWithStats, Element } from '@/lib/caseload/types';

// Category colors (professional labels)
const categoryConfig: Record<Element, { color: string; label: string; bg: string }> = {
  earth: { color: 'text-amber-400', label: 'Grounding', bg: 'bg-amber-500/10' },
  water: { color: 'text-blue-400', label: 'Emotional', bg: 'bg-blue-500/10' },
  fire: { color: 'text-orange-400', label: 'Motivation', bg: 'bg-orange-500/10' },
  air: { color: 'text-cyan-400', label: 'Cognitive', bg: 'bg-cyan-500/10' },
  aether: { color: 'text-purple-400', label: 'Existential', bg: 'bg-purple-500/10' },
};

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  active: { label: 'Active', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
  paused: { label: 'Paused', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
  completed: { label: 'Completed', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  transferred: { label: 'Transferred', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
  archived: { label: 'Archived', color: 'text-gray-400', bg: 'bg-gray-500/10 border-gray-500/20' },
};

// Activity state based on days since last session
type ActivityState = 'active' | 'quiet' | 'needs_attention';
const activityConfig: Record<ActivityState, { label: string; color: string; dot: string }> = {
  active: { label: 'Active', color: 'text-green-400', dot: 'bg-green-400' },
  quiet: { label: 'Quiet', color: 'text-gray-400', dot: 'bg-gray-400' },
  needs_attention: { label: 'Needs attention', color: 'text-amber-400', dot: 'bg-amber-400' },
};

function getActivityState(days: number | null): ActivityState {
  if (days === null) return 'needs_attention'; // No sessions yet
  if (days <= 7) return 'active';
  if (days <= 21) return 'quiet';
  return 'needs_attention';
}

interface CaseCardProps {
  caseData: CaseWithStats;
  onClick?: () => void;
  onAddNote?: () => void;
  onConsult?: () => void;
  className?: string;
}

export const CaseCard: React.FC<CaseCardProps> = ({
  caseData,
  onClick,
  onAddNote,
  onConsult,
  className,
}) => {
  const element = caseData.primary_element as Element | undefined;
  const category = element ? categoryConfig[element] : null;
  const status = statusConfig[caseData.case_status] || statusConfig.active;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const daysSinceLastSession = () => {
    if (!caseData.last_session_date) return null;
    const lastDate = new Date(caseData.last_session_date);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lastDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const days = daysSinceLastSession();
  const activityState = getActivityState(days);
  const activity = activityConfig[activityState];

  return (
    <div
      className={cn(
        'bg-[#111827] border border-gray-700 rounded-xl p-5 transition-all',
        onClick && 'cursor-pointer hover:border-gray-600 hover:bg-[#1a2234]',
        className
      )}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Category indicator */}
          {category && (
            <div className={cn(
              'px-2 py-1 rounded text-xs font-medium',
              category.bg,
              category.color
            )}>
              {category.label}
            </div>
          )}
        </div>

        {/* Status badge */}
        <span className={cn(
          'px-2 py-1 rounded text-xs font-medium border',
          status.bg,
          status.color
        )}>
          {status.label}
        </span>
      </div>

      {/* Client name */}
      <div className="mb-3">
        <h3 className="text-lg font-semibold text-white">
          {caseData.client_identifier}
        </h3>
        {caseData.spiral_stage && (
          <p className="text-sm text-gray-500">
            {caseData.spiral_stage}
          </p>
        )}
      </div>

      {/* Presenting concerns */}
      {caseData.presenting_concerns && caseData.presenting_concerns.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-1.5">
            {caseData.presenting_concerns.slice(0, 3).map((concern, i) => (
              <span
                key={i}
                className="px-2 py-0.5 bg-gray-800 border border-gray-700 rounded text-xs text-gray-400"
              >
                {concern}
              </span>
            ))}
            {caseData.presenting_concerns.length > 3 && (
              <span className="px-2 py-0.5 text-xs text-gray-500">
                +{caseData.presenting_concerns.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Stats row */}
      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>{caseData.note_count} notes</span>
        </div>

        <div className="flex items-center gap-1.5" title={activity.label}>
          <span className={cn('w-2 h-2 rounded-full', activity.dot)} />
          <span className={activity.color}>
            {days === null ? 'No sessions' : days === 0 ? 'Today' : days === 1 ? 'Yesterday' : `${days}d ago`}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{formatDate(caseData.intake_date)}</span>
        </div>
      </div>

      {/* Action buttons */}
      {(onAddNote || onConsult) && (
        <div className="flex gap-2 pt-4 border-t border-gray-700">
          {onAddNote && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddNote();
              }}
              className="flex-1 px-3 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-sm text-gray-300 hover:text-white transition-colors"
            >
              + Add Note
            </button>
          )}
          {onConsult && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onConsult();
              }}
              className="flex-1 px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg text-sm text-amber-400 transition-colors"
            >
              AI Consultation
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CaseCard;
