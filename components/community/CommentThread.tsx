'use client';

/**
 * COMMENT THREAD
 *
 * Nested comment display component for community posts.
 * Follows Soullab Design Canon - warm aesthetics, geometric symbols,
 * refined typography with proper nesting.
 */

import React, { useState } from 'react';
import {
  Avatar,
  getTierColor,
  getTierBgColor,
  getTierName,
  formatRelativeTime,
  type MemberTier
} from './CommunityPostCard';

// ============================================================================
// TYPES
// ============================================================================

export interface CommentAuthor {
  id: string;
  name: string;
  tier: MemberTier;
}

export interface Comment {
  id: string;
  author: CommentAuthor;
  content: string;
  createdAt: string;
  replies?: Comment[];
  reactionCount?: number;
}

export interface CommentThreadProps {
  comments: Comment[];
  onReply?: (parentId: string) => void;
  onReact?: (commentId: string) => void;
  maxDepth?: number;
  className?: string;
}

export interface SingleCommentProps {
  comment: Comment;
  depth?: number;
  maxDepth?: number;
  onReply?: (parentId: string) => void;
  onReact?: (commentId: string) => void;
}

// ============================================================================
// GEOMETRIC SYMBOLS
// ============================================================================

/** Reply indicator symbol */
const ReplySymbol = ({ className = '' }: { className?: string }) => (
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

/** Reaction symbol (concentric circles) */
const ReactionSymbol = ({ className = '' }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <circle cx="12" cy="12" r="8" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

/** Expand/collapse symbol */
const ChevronSymbol = ({ className = '', expanded = false }: { className?: string; expanded?: boolean }) => (
  <svg
    viewBox="0 0 24 24"
    className={`${className} transition-transform ${expanded ? 'rotate-90' : ''}`}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <path d="M9 6l6 6-6 6" />
  </svg>
);

// ============================================================================
// SINGLE COMMENT COMPONENT
// ============================================================================

function SingleComment({
  comment,
  depth = 0,
  maxDepth = 4,
  onReply,
  onReact
}: SingleCommentProps) {
  const [showReplies, setShowReplies] = useState(true);
  const hasReplies = comment.replies && comment.replies.length > 0;
  const canNest = depth < maxDepth;

  return (
    <div className={`${depth > 0 ? 'ml-6 pl-4 border-l border-stone-200/40' : ''}`}>
      {/* Comment card */}
      <div className="bg-white/40 border border-stone-200/60 rounded-xl p-4 mb-3">
        {/* Header: Author info */}
        <header className="flex items-center gap-3 mb-3">
          <Avatar author={comment.author} size="sm" />
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-medium tracking-wide text-stone-800">
              {comment.author.name}
            </span>
            <span
              className={`text-[9px] tracking-wide px-1.5 py-0.5 rounded-full ${getTierBgColor(comment.author.tier)} ${getTierColor(comment.author.tier)}`}
            >
              {getTierName(comment.author.tier)}
            </span>
            <span className="text-[11px] tracking-wide text-stone-500">
              {formatRelativeTime(comment.createdAt)}
            </span>
          </div>
        </header>

        {/* Content */}
        <p className="text-[14px] tracking-wide text-stone-600 leading-relaxed mb-3">
          {comment.content}
        </p>

        {/* Actions */}
        <footer className="flex items-center gap-4">
          {/* React button */}
          <button
            onClick={() => onReact?.(comment.id)}
            className="flex items-center gap-1.5 text-stone-500 hover:text-[#5a7a6f] transition-colors"
          >
            <ReactionSymbol className="w-3.5 h-3.5" />
            <span className="text-[12px] tracking-wide">
              {comment.reactionCount || 0}
            </span>
          </button>

          {/* Reply button */}
          {canNest && (
            <button
              onClick={() => onReply?.(comment.id)}
              className="flex items-center gap-1.5 text-stone-500 hover:text-[#6b5a98] transition-colors"
            >
              <ReplySymbol className="w-3.5 h-3.5" />
              <span className="text-[12px] tracking-wide">Reply</span>
            </button>
          )}

          {/* Expand/collapse replies */}
          {hasReplies && (
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="flex items-center gap-1 text-stone-500 hover:text-stone-600 transition-colors ml-auto"
            >
              <ChevronSymbol className="w-3.5 h-3.5" expanded={showReplies} />
              <span className="text-[11px] tracking-wide">
                {showReplies ? 'Hide' : 'Show'} {comment.replies!.length} {comment.replies!.length === 1 ? 'reply' : 'replies'}
              </span>
            </button>
          )}
        </footer>
      </div>

      {/* Nested replies */}
      {hasReplies && showReplies && canNest && (
        <div className="mt-2">
          {comment.replies!.map((reply) => (
            <SingleComment
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              maxDepth={maxDepth}
              onReply={onReply}
              onReact={onReact}
            />
          ))}
        </div>
      )}

      {/* Too deep - show flat link */}
      {hasReplies && showReplies && !canNest && (
        <div className="ml-6 p-3 bg-stone-100/50 rounded-lg border border-stone-200/40">
          <p className="text-[12px] tracking-wide text-stone-500">
            {comment.replies!.length} more {comment.replies!.length === 1 ? 'reply' : 'replies'} -
            <button className="ml-1 text-[#6b5a98] hover:underline">
              View full thread
            </button>
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function CommentThread({
  comments,
  onReply,
  onReact,
  maxDepth = 4,
  className = ''
}: CommentThreadProps) {
  if (comments.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <svg
          viewBox="0 0 24 24"
          className="w-8 h-8 mx-auto mb-3 text-stone-500"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
        <p className="text-[13px] tracking-wide text-stone-500">
          No comments yet. Be the first to share your thoughts.
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Comment count header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 h-px bg-stone-200/60" />
        <span className="text-[11px] uppercase tracking-[0.2em] text-stone-500">
          {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
        </span>
        <div className="flex-1 h-px bg-stone-200/60" />
      </div>

      {/* Comments list */}
      <div className="space-y-2">
        {comments.map((comment) => (
          <SingleComment
            key={comment.id}
            comment={comment}
            depth={0}
            maxDepth={maxDepth}
            onReply={onReply}
            onReact={onReact}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export { SingleComment, ReplySymbol, ReactionSymbol, ChevronSymbol };
