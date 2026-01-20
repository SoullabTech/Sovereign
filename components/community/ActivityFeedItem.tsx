'use client';

/**
 * ACTIVITY FEED ITEM
 *
 * Activity feed entry for displaying community actions.
 * Follows Soullab Design Canon - warm aesthetics, geometric symbols,
 * refined typography with tracking-wide.
 */

import React from 'react';
import {
  Avatar,
  getTierColor,
  formatRelativeTime,
  type MemberTier
} from './CommunityPostCard';

// ============================================================================
// TYPES
// ============================================================================

export type ActivityType = 'posted' | 'commented' | 'reacted' | 'joined' | 'breakthrough' | 'replied';

export interface ActivityActor {
  id: string;
  name: string;
  tier: MemberTier;
}

export interface ActivityTarget {
  id: string;
  type: 'post' | 'comment' | 'member';
  title?: string;
  preview?: string;
}

export interface Activity {
  id: string;
  type: ActivityType;
  actor: ActivityActor;
  target?: ActivityTarget;
  createdAt: string;
  metadata?: {
    reactionType?: string;
    channelName?: string;
  };
}

export interface ActivityFeedItemProps {
  activity: Activity;
  onClick?: (activity: Activity) => void;
  variant?: 'compact' | 'detailed';
  className?: string;
}

// ============================================================================
// ACTIVITY TYPE SYMBOLS
// ============================================================================

/** Posted symbol - Open book */
const PostedSymbol = ({ className = '' }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <path d="M4 5 Q12 4 12 10 Q12 16 4 15" />
    <path d="M20 5 Q12 4 12 10 Q12 16 20 15" />
    <line x1="12" y1="4" x2="12" y2="16" />
  </svg>
);

/** Commented symbol - Speech bubble */
const CommentedSymbol = ({ className = '' }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

/** Reacted symbol - Concentric circles */
const ReactedSymbol = ({ className = '' }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <circle cx="12" cy="12" r="8" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="12" cy="12" r="1" />
  </svg>
);

/** Joined symbol - Circle with plus */
const JoinedSymbol = ({ className = '' }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <circle cx="12" cy="12" r="9" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

/** Breakthrough symbol - Starburst */
const BreakthroughSymbol = ({ className = '' }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <path d="M12 2l2 6 6-2-4 5 4 5-6-2-2 6-2-6-6 2 4-5-4-5 6 2z" />
  </svg>
);

/** Replied symbol - Reply arrow */
const RepliedSymbol = ({ className = '' }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <path d="M9 17l-5-5 5-5" />
    <path d="M4 12h12a4 4 0 0 1 4 4v1" />
  </svg>
);

// ============================================================================
// ACTIVITY CONFIG
// ============================================================================

interface ActivityConfig {
  symbol: React.FC<{ className?: string }>;
  verb: string;
  color: string;
  bgColor: string;
}

const ACTIVITY_CONFIG: Record<ActivityType, ActivityConfig> = {
  posted: {
    symbol: PostedSymbol,
    verb: 'shared',
    color: 'text-[#5a7a6f]',
    bgColor: 'bg-[#5a7a6f]/10'
  },
  commented: {
    symbol: CommentedSymbol,
    verb: 'commented on',
    color: 'text-[#6b5a98]',
    bgColor: 'bg-[#6b5a98]/10'
  },
  reacted: {
    symbol: ReactedSymbol,
    verb: 'reacted to',
    color: 'text-[#8a7a5a]',
    bgColor: 'bg-[#8a7a5a]/10'
  },
  joined: {
    symbol: JoinedSymbol,
    verb: 'joined the community',
    color: 'text-[#5a7a6f]',
    bgColor: 'bg-[#5a7a6f]/10'
  },
  breakthrough: {
    symbol: BreakthroughSymbol,
    verb: 'had a breakthrough',
    color: 'text-[#8a7a5a]',
    bgColor: 'bg-[#8a7a5a]/15'
  },
  replied: {
    symbol: RepliedSymbol,
    verb: 'replied to',
    color: 'text-[#6b5a98]',
    bgColor: 'bg-[#6b5a98]/10'
  }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/** Build activity description based on type */
function buildActivityDescription(activity: Activity): React.ReactNode {
  const config = ACTIVITY_CONFIG[activity.type];

  switch (activity.type) {
    case 'posted':
      return (
        <>
          <span className={`font-medium ${getTierColor(activity.actor.tier)}`}>
            {activity.actor.name}
          </span>
          <span className="text-stone-500"> {config.verb} </span>
          {activity.target?.title && (
            <span className="font-medium text-stone-700">
              "{activity.target.title}"
            </span>
          )}
          {activity.metadata?.channelName && (
            <span className="text-stone-400"> in {activity.metadata.channelName}</span>
          )}
        </>
      );

    case 'commented':
    case 'replied':
      return (
        <>
          <span className={`font-medium ${getTierColor(activity.actor.tier)}`}>
            {activity.actor.name}
          </span>
          <span className="text-stone-500"> {config.verb} </span>
          {activity.target?.title && (
            <span className="font-medium text-stone-700">
              "{activity.target.title}"
            </span>
          )}
        </>
      );

    case 'reacted':
      return (
        <>
          <span className={`font-medium ${getTierColor(activity.actor.tier)}`}>
            {activity.actor.name}
          </span>
          <span className="text-stone-500"> {config.verb} </span>
          {activity.target?.title && (
            <span className="font-medium text-stone-700">
              "{activity.target.title}"
            </span>
          )}
          {activity.metadata?.reactionType && (
            <span className="text-stone-400"> ({activity.metadata.reactionType})</span>
          )}
        </>
      );

    case 'joined':
      return (
        <>
          <span className={`font-medium ${getTierColor(activity.actor.tier)}`}>
            {activity.actor.name}
          </span>
          <span className="text-stone-500"> {config.verb}</span>
        </>
      );

    case 'breakthrough':
      return (
        <>
          <span className={`font-medium ${getTierColor(activity.actor.tier)}`}>
            {activity.actor.name}
          </span>
          <span className="text-stone-500"> {config.verb}</span>
          {activity.target?.title && (
            <>
              <span className="text-stone-500"> in </span>
              <span className="font-medium text-stone-700">
                "{activity.target.title}"
              </span>
            </>
          )}
        </>
      );

    default:
      return (
        <>
          <span className={`font-medium ${getTierColor(activity.actor.tier)}`}>
            {activity.actor.name}
          </span>
          <span className="text-stone-500"> performed an action</span>
        </>
      );
  }
}

// ============================================================================
// COMPACT VARIANT
// ============================================================================

function CompactActivityItem({
  activity,
  onClick,
  className = ''
}: ActivityFeedItemProps) {
  const config = ACTIVITY_CONFIG[activity.type];
  const Symbol = config.symbol;

  return (
    <div
      onClick={() => onClick?.(activity)}
      className={`
        flex items-center gap-3 p-3
        hover:bg-white/40 transition-colors cursor-pointer rounded-lg
        ${className}
      `}
    >
      {/* Activity icon */}
      <div className={`p-1.5 rounded-lg ${config.bgColor}`}>
        <Symbol className={`w-4 h-4 ${config.color}`} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] tracking-wide leading-snug truncate">
          {buildActivityDescription(activity)}
        </p>
      </div>

      {/* Timestamp */}
      <span className="text-[11px] tracking-wide text-stone-400 flex-shrink-0">
        {formatRelativeTime(activity.createdAt)}
      </span>
    </div>
  );
}

// ============================================================================
// DETAILED VARIANT
// ============================================================================

function DetailedActivityItem({
  activity,
  onClick,
  className = ''
}: ActivityFeedItemProps) {
  const config = ACTIVITY_CONFIG[activity.type];
  const Symbol = config.symbol;

  return (
    <div
      onClick={() => onClick?.(activity)}
      className={`
        bg-white/40 border border-stone-200/60 rounded-xl p-4
        hover:bg-white/60 transition-colors cursor-pointer
        ${className}
      `}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        {/* Avatar */}
        <Avatar author={activity.actor} size="sm" />

        {/* Activity icon */}
        <div className={`p-1.5 rounded-lg ${config.bgColor} mt-0.5`}>
          <Symbol className={`w-4 h-4 ${config.color}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-[14px] tracking-wide text-stone-600 leading-relaxed">
            {buildActivityDescription(activity)}
          </p>
          <span className="text-[12px] tracking-wide text-stone-400 mt-1 block">
            {formatRelativeTime(activity.createdAt)}
          </span>
        </div>
      </div>

      {/* Preview (if target has preview) */}
      {activity.target?.preview && (
        <div className="ml-14 p-3 bg-stone-50/50 border border-stone-200/40 rounded-lg">
          <p className="text-[13px] tracking-wide text-stone-500 leading-relaxed line-clamp-2">
            {activity.target.preview}
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ActivityFeedItem({
  activity,
  onClick,
  variant = 'compact',
  className = ''
}: ActivityFeedItemProps) {
  if (variant === 'detailed') {
    return (
      <DetailedActivityItem
        activity={activity}
        onClick={onClick}
        className={className}
      />
    );
  }

  return (
    <CompactActivityItem
      activity={activity}
      onClick={onClick}
      className={className}
    />
  );
}

// ============================================================================
// ACTIVITY FEED LIST COMPONENT
// ============================================================================

export interface ActivityFeedProps {
  activities: Activity[];
  onActivityClick?: (activity: Activity) => void;
  variant?: 'compact' | 'detailed';
  emptyMessage?: string;
  className?: string;
}

export function ActivityFeed({
  activities,
  onActivityClick,
  variant = 'compact',
  emptyMessage = 'No recent activity',
  className = ''
}: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <svg
          viewBox="0 0 24 24"
          className="w-8 h-8 mx-auto mb-3 text-stone-300"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 6v6l4 2" />
        </svg>
        <p className="text-[13px] tracking-wide text-stone-400">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {activities.map((activity) => (
        <ActivityFeedItem
          key={activity.id}
          activity={activity}
          onClick={onActivityClick}
          variant={variant}
        />
      ))}
    </div>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  PostedSymbol,
  CommentedSymbol,
  ReactedSymbol,
  JoinedSymbol,
  BreakthroughSymbol,
  RepliedSymbol,
  CompactActivityItem,
  DetailedActivityItem,
  ACTIVITY_CONFIG,
  buildActivityDescription
};
