'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Heart,
  Eye,
  MessageSquare,
  Clock,
  User,
  Pin,
  Sparkles,
  Send,
  Loader2,
  AlertCircle,
  Tag
} from 'lucide-react';

interface PostDetail {
  id: string;
  title: string;
  content: string;
  user_id: string;
  user_name: string;
  territory_slug: string | null;
  territory_name: string | null;
  content_type: string;
  element: string | null;
  tags: string[] | null;
  status: string;
  is_pinned: boolean;
  is_featured: boolean;
  view_count: number;
  heart_count: number;
  comment_count: number;
  created_at: string;
  updated_at: string;
}

interface Comment {
  id: string;
  post_id: string;
  parent_id: string | null;
  user_id: string;
  user_name: string;
  content: string;
  heart_count: number;
  created_at: string;
}

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Content-type-aware continuation prompts — only shown when no responses yet
function continuationPrompt(contentType: string): string {
  switch (contentType) {
    case 'question':
      return 'What comes to mind? Even a partial thought can open something.';
    case 'breakthrough':
      return 'Does this resonate with something in your own experience?';
    case 'practice_report':
      return 'Have you tried something similar? What did you notice?';
    case 'essay':
      return 'Where does this land for you? What does it open?';
    case 'review':
      return 'Have you encountered this? What was your experience?';
    default:
      return 'What does this open for you?';
  }
}

// Contextual placeholder for the comment form
function commentPlaceholder(contentType: string): string {
  switch (contentType) {
    case 'question':
      return 'Offer what you know, or what you wonder...';
    case 'breakthrough':
      return 'Witness this, or share what it stirs...';
    case 'practice_report':
      return 'Share your experience, or ask about theirs...';
    default:
      return 'Share a thought, question, or reflection...';
  }
}

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params?.id as string;

  const [post, setPost] = useState<PostDetail | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Comment form
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [commentError, setCommentError] = useState('');

  useEffect(() => {
    loadPost();
  }, [postId]);

  const loadPost = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/community/posts/${postId}`);
      const data = await res.json();

      if (data.ok) {
        setPost(data.post);
        setComments(data.comments || []);
      } else {
        setError(data.error || 'Post not found');
      }
    } catch (err) {
      console.error('Error loading post:', err);
      setError('Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setCommentError('');
    setSubmitting(true);

    try {
      const storedUser = localStorage.getItem('beta_user');
      const user = storedUser ? JSON.parse(storedUser) : null;
      if (!user?.id) {
        setCommentError('You must be signed in to comment.');
        setSubmitting(false);
        return;
      }

      const res = await fetch(`/api/community/posts/${postId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
          'x-user-name': user.name || user.username || 'Anonymous',
        },
        body: JSON.stringify({ content: newComment.trim() }),
      });

      const data = await res.json();
      if (data.ok) {
        setComments(prev => [...prev, data.comment]);
        setNewComment('');
      } else {
        setCommentError(data.error || 'Failed to post comment');
      }
    } catch {
      setCommentError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-amber-950/20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-amber-950/20 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-red-300 mb-2">Post Not Found</h1>
          <p className="text-red-300/70 mb-4">{error}</p>
          <button
            onClick={() => router.push('/maia/community')}
            className="px-4 py-2 bg-amber-600 text-amber-50 rounded-lg hover:bg-amber-700 transition-colors"
          >
            Return to Community
          </button>
        </div>
      </div>
    );
  }

  // Build threaded comments
  const topComments = comments.filter(c => !c.parent_id);
  const childComments = comments.filter(c => c.parent_id);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-amber-950/20">
      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => {
              if (post.territory_slug) {
                router.push(`/maia/community/territory/${post.territory_slug}`);
              } else {
                router.push('/maia/community');
              }
            }}
            className="flex items-center gap-2 text-amber-300 hover:text-amber-200 transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            {post.territory_name ? `Back to ${post.territory_name}` : 'Back to Community'}
          </button>
        </div>

        {/* Post */}
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/50 border border-amber-500/20 rounded-xl p-8 mb-8"
        >
          {/* Post header */}
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-amber-600 rounded-full flex items-center justify-center text-amber-50 font-bold">
              {post.user_name?.substring(0, 2).toUpperCase() || '??'}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                {post.is_pinned && <Pin className="w-4 h-4 text-amber-400" />}
                {post.content_type === 'breakthrough' && <Sparkles className="w-4 h-4 text-yellow-400" />}
                <h1 className="text-2xl font-light text-amber-100">{post.title}</h1>
              </div>
              <div className="flex items-center gap-4 mt-2 text-sm text-amber-300/60">
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  {post.user_name}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {formatTimeAgo(post.created_at)}
                </span>
                {post.territory_name && (
                  <button
                    onClick={() => router.push(`/maia/community/territory/${post.territory_slug}`)}
                    className="text-amber-400/70 hover:text-amber-400 transition-colors"
                  >
                    {post.territory_name}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Post content */}
          <div className="prose prose-invert prose-amber max-w-none mb-6">
            <div className="text-amber-100/90 leading-relaxed whitespace-pre-wrap">
              {post.content}
            </div>
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map(tag => (
                <span
                  key={tag}
                  className="flex items-center gap-1 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-300 text-xs"
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Engagement stats */}
          <div className="flex items-center gap-6 pt-4 border-t border-amber-500/10 text-sm text-amber-300/60">
            <span className="flex items-center gap-1.5">
              <Eye className="w-4 h-4" />
              {post.view_count} views
            </span>
            <span className="flex items-center gap-1.5">
              <Heart className="w-4 h-4" />
              {post.heart_count} hearts
            </span>
            <span className="flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4" />
              {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
            </span>
          </div>
        </motion.article>

        {/* Comments Section */}
        <div className="space-y-6">
          <h2 className="text-lg font-light text-amber-100/80 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-amber-400/60" />
            {comments.length > 0 ? `${comments.length} ${comments.length === 1 ? 'Response' : 'Responses'}` : 'Responses'}
          </h2>

          {/* Continuation invitation — only when the field is sparse */}
          {comments.length === 0 && (
            <div className="text-center py-4">
              <p className="text-amber-300/25 text-sm italic">
                {continuationPrompt(post.content_type)}
              </p>
            </div>
          )}

          {/* Comment form */}
          <form onSubmit={handleComment} className="bg-slate-900/30 border border-amber-500/15 rounded-xl p-6">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={commentPlaceholder(post.content_type)}
              rows={3}
              className="w-full bg-transparent text-amber-100 placeholder-amber-300/30 resize-none focus:outline-none leading-relaxed"
            />
            {commentError && (
              <p className="text-red-400 text-sm mt-2">{commentError}</p>
            )}
            <div className="flex justify-end mt-3 pt-3 border-t border-amber-500/10">
              <button
                type="submit"
                disabled={submitting || !newComment.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-amber-50 rounded-lg hover:bg-amber-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Respond
              </button>
            </div>
          </form>

          {/* Comments list */}
          {comments.length > 0 && (
            <div className="space-y-4">
              {topComments.map(comment => (
                <div key={comment.id}>
                  <CommentCard comment={comment} />
                  {/* Replies */}
                  {childComments
                    .filter(c => c.parent_id === comment.id)
                    .map(reply => (
                      <div key={reply.id} className="ml-10 mt-3">
                        <CommentCard comment={reply} />
                      </div>
                    ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CommentCard({ comment }: { comment: Comment }) {
  return (
    <div className="bg-slate-900/20 border border-amber-500/10 rounded-lg p-5">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-amber-600/80 rounded-full flex items-center justify-center text-amber-50 font-bold text-xs">
          {comment.user_name?.substring(0, 2).toUpperCase() || '??'}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-amber-200 text-sm font-medium">{comment.user_name}</span>
            <span className="text-amber-300/40 text-xs">{formatTimeAgo(comment.created_at)}</span>
          </div>
          <p className="text-amber-100/80 text-sm leading-relaxed whitespace-pre-wrap">
            {comment.content}
          </p>
          {comment.heart_count > 0 && (
            <div className="flex items-center gap-1 mt-2 text-xs text-amber-300/40">
              <Heart className="w-3 h-3" />
              {comment.heart_count}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
