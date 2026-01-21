'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { SacredCard } from '@/components/ui/SacredCard';
import type { CaseWithStats, Element } from '@/lib/caseload/types';

// Element colors and icons
const elementConfig: Record<Element, { color: string; icon: string; bg: string }> = {
  earth: { color: 'text-amber-400', icon: '🜃', bg: 'bg-amber-900/30' },
  water: { color: 'text-blue-400', icon: '🜄', bg: 'bg-blue-900/30' },
  fire: { color: 'text-red-400', icon: '🜂', bg: 'bg-red-900/30' },
  air: { color: 'text-cyan-400', icon: '🜁', bg: 'bg-cyan-900/30' },
  aether: { color: 'text-purple-400', icon: '✦', bg: 'bg-purple-900/30' },
};

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  active: { label: 'Active', color: 'text-green-400', bg: 'bg-green-900/30' },
  paused: { label: 'Paused', color: 'text-yellow-400', bg: 'bg-yellow-900/30' },
  completed: { label: 'Completed', color: 'text-blue-400', bg: 'bg-blue-900/30' },
  transferred: { label: 'Transferred', color: 'text-purple-400', bg: 'bg-purple-900/30' },
  archived: { label: 'Archived', color: 'text-neutral-400', bg: 'bg-neutral-900/30' },
};

// Activity state based on days since last session
type ActivityState = 'active' | 'quiet' | 'needs_attention';
const activityConfig: Record<ActivityState, { label: string; color: string; dot: string }> = {
  active: { label: 'Active', color: 'text-green-400', dot: 'bg-green-400' },
  quiet: { label: 'Quiet', color: 'text-neutral-400', dot: 'bg-neutral-400' },
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
  const elementStyle = element ? elementConfig[element] : null;
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
    <SacredCard
      variant="elevated"
      size="md"
      hover={!!onClick}
      className={cn('relative', className)}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Element indicator */}
          {elementStyle && (
            <div className={cn(
              'w-10 h-10 rounded-lg flex items-center justify-center text-xl',
              elementStyle.bg,
              elementStyle.color
            )}>
              {elementStyle.icon}
            </div>
          )}

          <div>
            <h3 className="text-lg font-medium text-gold-divine">
              {caseData.client_identifier}
            </h3>
            {caseData.spiral_stage && (
              <p className="text-sm text-neutral-silver/70">
                {caseData.spiral_stage}
              </p>
            )}
          </div>
        </div>

        {/* Status badge */}
        <span className={cn(
          'px-2 py-1 rounded text-xs font-medium',
          status.bg,
          status.color
        )}>
          {status.label}
        </span>
      </div>

      {/* Presenting concerns */}
      {caseData.presenting_concerns && caseData.presenting_concerns.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-1.5">
            {caseData.presenting_concerns.slice(0, 3).map((concern, i) => (
              <span
                key={i}
                className="px-2 py-0.5 bg-sacred-navy/60 border border-gold-divine/10 rounded text-xs text-neutral-silver/80"
              >
                {concern}
              </span>
            ))}
            {caseData.presenting_concerns.length > 3 && (
              <span className="px-2 py-0.5 text-xs text-neutral-silver/50">
                +{caseData.presenting_concerns.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Stats row */}
      <div className="flex items-center gap-4 text-sm text-neutral-silver/70 mb-4">
        <div className="flex items-center gap-1">
          <span className="text-gold-divine/70">📝</span>
          <span>{caseData.note_count} notes</span>
        </div>

        <div className="flex items-center gap-1.5" title={activity.label}>
          <span className={cn('w-2 h-2 rounded-full', activity.dot)} />
          <span className={activity.color}>
            {days === null ? 'No sessions' : days === 0 ? 'Today' : days === 1 ? 'Yesterday' : `${days}d ago`}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-gold-divine/70">📅</span>
          <span>{formatDate(caseData.intake_date)}</span>
        </div>
      </div>

      {/* Action buttons */}
      {(onAddNote || onConsult) && (
        <div className="flex gap-2 pt-4 border-t border-gold-divine/20">
          {onAddNote && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddNote();
              }}
              className="flex-1 px-3 py-2 bg-sacred-navy/60 hover:bg-sacred-navy/80 border border-gold-divine/20 hover:border-gold-divine/40 rounded-lg text-sm text-neutral-silver hover:text-gold-divine transition-all"
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
              className="flex-1 px-3 py-2 bg-gold-divine/10 hover:bg-gold-divine/20 border border-gold-divine/30 hover:border-gold-divine/50 rounded-lg text-sm text-gold-divine transition-all"
            >
              Consult MAIA
            </button>
          )}
        </div>
      )}
    </SacredCard>
  );
};

export default CaseCard;
