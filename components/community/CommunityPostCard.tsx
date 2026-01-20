'use client';

/**
 * COMMUNITY POST CARD
 *
 * Card component for displaying community posts in the Commons.
 * Follows Soullab Design Canon - warm off-white cards, geometric symbols,
 * refined typography with tracking-wide.
 */

import React from 'react';

// ============================================================================
// TYPES
// ============================================================================

export type PostType = 'concept' | 'essay' | 'practice' | 'voice' | 'image' | 'resource';

export type MemberTier = 'touch' | 'continuity' | 'stewardship';

export interface PostAuthor {
  id: string;
  name: string;
  tier: MemberTier;
  avatarSymbol?: string; // Optional custom symbol
}

export interface PostEngagement {
  reactions: number;
  comments: number;
}

export interface CommunityPost {
  id: string;
  author: PostAuthor;
  title: string;
  contentPreview: string;
  type: PostType;
  createdAt: string; // ISO date string
  engagement: PostEngagement;
  isPinned?: boolean;
}

export interface CommunityPostCardProps {
  post: CommunityPost;
  onClick?: (post: CommunityPost) => void;
  className?: string;
}

// ============================================================================
// GEOMETRIC SYMBOLS
// ============================================================================

/** Circle - Touch tier symbol (presence, wholeness) */
const TouchSymbol = ({ className = '' }: { className?: string }) => (
  <svg
    viewBox="0 0 40 40"
    className={`w-8 h-8 ${className}`}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <circle cx="20" cy="20" r="12" />
  </svg>
);

/** Vesica Piscis - Continuity tier symbol (connection, duality) */
const ContinuitySymbol = ({ className = '' }: { className?: string }) => (
  <svg
    viewBox="0 0 40 40"
    className={`w-8 h-8 ${className}`}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <circle cx="15" cy="20" r="10" />
    <circle cx="25" cy="20" r="10" />
  </svg>
);

/** Three Circles - Stewardship tier symbol (community, integration) */
const StewardshipSymbol = ({ className = '' }: { className?: string }) => (
  <svg
    viewBox="0 0 40 40"
    className={`w-8 h-8 ${className}`}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <circle cx="20" cy="14" r="8" />
    <circle cx="14" cy="24" r="8" />
    <circle cx="26" cy="24" r="8" />
  </svg>
);

// Post type symbols
const PostTypeSymbols: Record<PostType, React.FC<{ className?: string }>> = {
  concept: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  essay: ({ className }) => (
    <svg viewBox="0 0 40 40" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M8 10 Q20 8 20 20 Q20 32 8 30" />
      <path d="M32 10 Q20 8 20 20 Q20 32 32 30" />
      <line x1="20" y1="8" x2="20" y2="32" />
    </svg>
  ),
  practice: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M8 12h8" />
      <path d="M12 8v8" />
    </svg>
  ),
  voice: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 3v18" />
      <path d="M8 8v8" />
      <path d="M16 6v12" />
      <path d="M4 11v2" />
      <path d="M20 10v4" />
    </svg>
  ),
  image: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="8" cy="10" r="2" />
      <path d="M21 15l-5-5L5 19" />
    </svg>
  ),
  resource: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 4h16v16H4z" />
      <path d="M4 9h16" />
      <path d="M9 4v16" />
    </svg>
  ),
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/** Get tier-specific color classes */
function getTierColor(tier: MemberTier): string {
  switch (tier) {
    case 'touch':
      return 'text-[#5a7a6f]'; // sage
    case 'continuity':
      return 'text-[#6b5a98]'; // violet
    case 'stewardship':
      return 'text-[#8a7a5a]'; // gold
  }
}

/** Get tier badge background */
function getTierBgColor(tier: MemberTier): string {
  switch (tier) {
    case 'touch':
      return 'bg-[#5a7a6f]/10';
    case 'continuity':
      return 'bg-[#6b5a98]/10';
    case 'stewardship':
      return 'bg-[#8a7a5a]/10';
  }
}

/** Get tier display name */
function getTierName(tier: MemberTier): string {
  switch (tier) {
    case 'touch':
      return 'Touch';
    case 'continuity':
      return 'Continuity';
    case 'stewardship':
      return 'Stewardship';
  }
}

/** Get post type color */
function getPostTypeColor(type: PostType): string {
  switch (type) {
    case 'concept':
      return 'bg-[#6b5a98]/10 text-[#6b5a98]';
    case 'essay':
      return 'bg-[#5a7a6f]/10 text-[#5a7a6f]';
    case 'practice':
      return 'bg-[#8a7a5a]/10 text-[#8a7a5a]';
    case 'voice':
      return 'bg-[#6b5a98]/10 text-[#6b5a98]';
    case 'image':
      return 'bg-[#5a7a6f]/10 text-[#5a7a6f]';
    case 'resource':
      return 'bg-[#8a7a5a]/10 text-[#8a7a5a]';
  }
}

/** Format timestamp to relative time */
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ============================================================================
// AVATAR COMPONENT
// ============================================================================

interface AvatarProps {
  author: PostAuthor;
  size?: 'sm' | 'md' | 'lg';
}

function Avatar({ author, size = 'md' }: AvatarProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const TierSymbol = {
    touch: TouchSymbol,
    continuity: ContinuitySymbol,
    stewardship: StewardshipSymbol,
  }[author.tier];

  return (
    <div
      className={`${sizeClasses[size]} ${getTierBgColor(author.tier)} rounded-full flex items-center justify-center`}
    >
      <TierSymbol className={`${getTierColor(author.tier)} ${size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : 'w-6 h-6'}`} />
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function CommunityPostCard({
  post,
  onClick,
  className = ''
}: CommunityPostCardProps) {
  const PostTypeIcon = PostTypeSymbols[post.type];

  return (
    <article
      onClick={() => onClick?.(post)}
      className={`
        bg-white/40 border border-stone-200/60 rounded-xl p-6
        hover:bg-white/60 transition-colors cursor-pointer
        ${className}
      `}
    >
      {/* Header: Author info and timestamp */}
      <header className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Avatar author={post.author} size="md" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-medium tracking-wide text-stone-800">
                {post.author.name}
              </span>
              <span
                className={`text-[10px] tracking-wide px-2 py-0.5 rounded-full ${getTierBgColor(post.author.tier)} ${getTierColor(post.author.tier)}`}
              >
                {getTierName(post.author.tier)}
              </span>
            </div>
            <span className="text-[13px] tracking-wide text-stone-400">
              {formatRelativeTime(post.createdAt)}
            </span>
          </div>
        </div>

        {/* Post type tag */}
        <span
          className={`text-[11px] tracking-wider uppercase px-2 py-1 rounded-md flex items-center gap-1.5 ${getPostTypeColor(post.type)}`}
        >
          <PostTypeIcon className="w-3.5 h-3.5" />
          {post.type}
        </span>
      </header>

      {/* Title */}
      <h3 className="text-lg font-medium tracking-wide text-stone-800 mb-2 leading-normal">
        {post.title}
      </h3>

      {/* Content preview */}
      <p className="text-[14px] tracking-wide text-stone-500 leading-relaxed mb-4 line-clamp-3">
        {post.contentPreview}
      </p>

      {/* Footer: Engagement stats */}
      <footer className="flex items-center gap-4 pt-4 border-t border-stone-200/40">
        {/* Reactions */}
        <div className="flex items-center gap-1.5 text-stone-400">
          <svg
            viewBox="0 0 24 24"
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <circle cx="12" cy="12" r="8" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <span className="text-[13px] tracking-wide">{post.engagement.reactions}</span>
        </div>

        {/* Comments */}
        <div className="flex items-center gap-1.5 text-stone-400">
          <svg
            viewBox="0 0 24 24"
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
          <span className="text-[13px] tracking-wide">{post.engagement.comments}</span>
        </div>

        {/* Pinned indicator */}
        {post.isPinned && (
          <div className="flex items-center gap-1.5 text-[#8a7a5a] ml-auto">
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M12 2L12 22" />
              <circle cx="12" cy="6" r="4" />
            </svg>
            <span className="text-[11px] tracking-wider uppercase">Pinned</span>
          </div>
        )}
      </footer>
    </article>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export { Avatar, TouchSymbol, ContinuitySymbol, StewardshipSymbol };
export { getTierColor, getTierBgColor, getTierName, formatRelativeTime };
