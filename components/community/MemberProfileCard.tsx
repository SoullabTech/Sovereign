'use client';

/**
 * MEMBER PROFILE CARD
 *
 * Compact member profile display for the community.
 * Follows Soullab Design Canon - geometric tier symbols as avatars,
 * warm off-white cards, refined typography.
 */

import React from 'react';
import {
  TouchSymbol,
  ContinuitySymbol,
  StewardshipSymbol,
  getTierColor,
  getTierBgColor,
  type MemberTier
} from './CommunityPostCard';

// ============================================================================
// TYPES
// ============================================================================

export interface MemberProfile {
  id: string;
  displayName: string;
  tier: MemberTier;
  joinDate: string; // ISO date string
  bio?: string;
  stats?: {
    posts?: number;
    comments?: number;
    reactions?: number;
  };
}

export interface MemberProfileCardProps {
  member: MemberProfile;
  onClick?: (member: MemberProfile) => void;
  variant?: 'compact' | 'expanded';
  className?: string;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/** Get tier-specific SVG symbol component */
function getTierSymbol(tier: MemberTier) {
  switch (tier) {
    case 'touch':
      return TouchSymbol;
    case 'continuity':
      return ContinuitySymbol;
    case 'stewardship':
      return StewardshipSymbol;
  }
}

/** Get tier description */
function getTierDescription(tier: MemberTier): string {
  switch (tier) {
    case 'touch':
      return 'Beginning the journey';
    case 'continuity':
      return 'Walking with presence';
    case 'stewardship':
      return 'Guiding the community';
  }
}

/** Format join date */
function formatJoinDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });
}

// ============================================================================
// LARGE AVATAR COMPONENT
// ============================================================================

interface ProfileAvatarProps {
  tier: MemberTier;
  size?: 'md' | 'lg' | 'xl';
}

function ProfileAvatar({ tier, size = 'lg' }: ProfileAvatarProps) {
  const TierSymbol = getTierSymbol(tier);

  const sizeClasses = {
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  };

  const symbolSizeClasses = {
    md: 'w-7 h-7',
    lg: 'w-9 h-9',
    xl: 'w-11 h-11'
  };

  return (
    <div
      className={`
        ${sizeClasses[size]} rounded-full flex items-center justify-center
        ${getTierBgColor(tier)} border border-stone-200/40
      `}
    >
      <TierSymbol className={`${symbolSizeClasses[size]} ${getTierColor(tier)}`} />
    </div>
  );
}

// ============================================================================
// TIER BADGE COMPONENT
// ============================================================================

interface TierBadgeProps {
  tier: MemberTier;
  showLabel?: boolean;
}

function TierBadge({ tier, showLabel = true }: TierBadgeProps) {
  const TierSymbol = getTierSymbol(tier);
  const tierName = {
    touch: 'Touch',
    continuity: 'Continuity',
    stewardship: 'Stewardship'
  }[tier];

  return (
    <div
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
        ${getTierBgColor(tier)} border border-stone-200/30
      `}
    >
      <TierSymbol className={`w-4 h-4 ${getTierColor(tier)}`} />
      {showLabel && (
        <span className={`text-[11px] tracking-wider font-medium ${getTierColor(tier)}`}>
          {tierName}
        </span>
      )}
    </div>
  );
}

// ============================================================================
// COMPACT VARIANT
// ============================================================================

function CompactProfileCard({
  member,
  onClick,
  className = ''
}: MemberProfileCardProps) {
  return (
    <div
      onClick={() => onClick?.(member)}
      className={`
        flex items-center gap-3 p-3 bg-white/40 border border-stone-200/60 rounded-xl
        hover:bg-white/60 transition-colors cursor-pointer
        ${className}
      `}
    >
      <ProfileAvatar tier={member.tier} size="md" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-medium tracking-wide text-stone-800 truncate">
            {member.displayName}
          </span>
          <TierBadge tier={member.tier} showLabel={false} />
        </div>
        <span className="text-[12px] tracking-wide text-stone-500">
          Joined {formatJoinDate(member.joinDate)}
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// EXPANDED VARIANT
// ============================================================================

function ExpandedProfileCard({
  member,
  onClick,
  className = ''
}: MemberProfileCardProps) {
  return (
    <div
      onClick={() => onClick?.(member)}
      className={`
        bg-white/40 border border-stone-200/60 rounded-xl p-6
        hover:bg-white/60 transition-colors cursor-pointer
        ${className}
      `}
    >
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <ProfileAvatar tier={member.tier} size="lg" />
        <div className="flex-1">
          <h3 className="text-lg font-medium tracking-wide text-stone-800 mb-1">
            {member.displayName}
          </h3>
          <TierBadge tier={member.tier} showLabel={true} />
        </div>
      </div>

      {/* Tier description */}
      <p className="text-[12px] tracking-wide text-stone-500 italic mb-3">
        {getTierDescription(member.tier)}
      </p>

      {/* Bio preview */}
      {member.bio && (
        <p className="text-[14px] tracking-wide text-stone-500 leading-relaxed mb-4 line-clamp-2">
          {member.bio}
        </p>
      )}

      {/* Stats */}
      {member.stats && (
        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-stone-200/40">
          <div className="text-center">
            <div className="text-[16px] font-medium text-stone-800">
              {member.stats.posts || 0}
            </div>
            <div className="text-[11px] tracking-wider uppercase text-stone-500">
              Posts
            </div>
          </div>
          <div className="text-center">
            <div className="text-[16px] font-medium text-stone-800">
              {member.stats.comments || 0}
            </div>
            <div className="text-[11px] tracking-wider uppercase text-stone-500">
              Comments
            </div>
          </div>
          <div className="text-center">
            <div className="text-[16px] font-medium text-stone-800">
              {member.stats.reactions || 0}
            </div>
            <div className="text-[11px] tracking-wider uppercase text-stone-500">
              Reactions
            </div>
          </div>
        </div>
      )}

      {/* Join date */}
      <div className="mt-4 pt-3 border-t border-stone-200/40">
        <div className="flex items-center gap-2 text-stone-500">
          <svg
            viewBox="0 0 24 24"
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span className="text-[12px] tracking-wide">
            Member since {formatJoinDate(member.joinDate)}
          </span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function MemberProfileCard({
  member,
  onClick,
  variant = 'compact',
  className = ''
}: MemberProfileCardProps) {
  if (variant === 'expanded') {
    return (
      <ExpandedProfileCard
        member={member}
        onClick={onClick}
        className={className}
      />
    );
  }

  return (
    <CompactProfileCard
      member={member}
      onClick={onClick}
      className={className}
    />
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export { ProfileAvatar, TierBadge, CompactProfileCard, ExpandedProfileCard };
export { getTierSymbol, getTierDescription, formatJoinDate };
