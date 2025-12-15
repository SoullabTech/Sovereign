'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Star, Eye, MessageSquare, Sparkles, Brain } from 'lucide-react';

interface Post {
  id: string;
  title: string;
  content: string;
  tags: string[];
  user_id: string;
  created_at: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  is_featured: boolean;
  cognitive_level_at_post?: number;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function CommunityCommonsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    fetchPosts();
  }, [pagination.page, selectedTag, showFeaturedOnly]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (selectedTag) {
        params.set('tag', selectedTag);
      }

      if (showFeaturedOnly) {
        params.set('featured', 'true');
      }

      const response = await fetch(`/api/community/commons/posts?${params}`);
      const data = await response.json();

      if (data.ok) {
        setPosts(data.posts);
        setPagination(data.pagination);
      } else {
        setError(data.message || 'Failed to fetch posts');
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const extractPreview = (markdown: string, maxLength: number = 200): string => {
    // Remove markdown formatting for preview
    const plainText = markdown
      .replace(/^#+\s+/gm, '') // Headers
      .replace(/\*\*/g, '') // Bold
      .replace(/\*/g, '') // Italic
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Links
      .replace(/`([^`]+)`/g, '$1') // Inline code
      .trim();

    if (plainText.length <= maxLength) return plainText;
    return plainText.substring(0, maxLength) + '...';
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const allTags = Array.from(
    new Set(posts.flatMap((post) => post.tags))
  ).sort();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push('/community')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/10
                     border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Community
          </button>

          <Link
            href="/community/commons/new"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/20
                     border border-amber-500/30 text-amber-400 hover:bg-amber-500/30 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            Share Wisdom
          </Link>
        </div>

        {/* Title Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-amber-400 mb-3 tracking-wide">
            Community Commons
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Wisdom contributions from Level 4+ consciousness explorers.
            A stewarded space for pattern recognition and shared insight.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-wrap gap-4 items-center">
          <button
            onClick={() => setShowFeaturedOnly(!showFeaturedOnly)}
            className={`px-4 py-2 rounded-lg border transition-all ${
              showFeaturedOnly
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <Star className="w-4 h-4 inline mr-2" />
            {showFeaturedOnly ? 'Showing Featured' : 'Show Featured Only'}
          </button>

          {allTags.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-sm">Filter by tag:</span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedTag(null)}
                  className={`px-3 py-1 rounded-md text-sm transition-all ${
                    selectedTag === null
                      ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400'
                      : 'bg-slate-800/50 border border-slate-700 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  All
                </button>
                {allTags.slice(0, 6).map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`px-3 py-1 rounded-md text-sm transition-all ${
                      selectedTag === tag
                        ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400'
                        : 'bg-slate-800/50 border border-slate-700 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto"></div>
            <p className="text-slate-400 mt-4">Loading posts...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-20">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={fetchPosts}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && posts.length === 0 && (
          <div className="text-center py-20">
            <Brain className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 mb-4">
              No posts found{selectedTag ? ` with tag "${selectedTag}"` : ''}.
            </p>
            {selectedTag && (
              <button
                onClick={() => setSelectedTag(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700"
              >
                Clear Filter
              </button>
            )}
          </div>
        )}

        {/* Posts Grid */}
        {!loading && !error && posts.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/community/commons/${post.id}`}
                  className="block bg-slate-900/50 border border-slate-800 rounded-xl p-6
                           hover:bg-slate-900 hover:border-amber-500/30 transition-all group"
                >
                  {/* Post Header */}
                  <div className="flex items-start justify-between mb-3">
                    <h2 className="text-xl font-semibold text-slate-200 group-hover:text-amber-400 transition-colors flex-1">
                      {post.title}
                    </h2>
                    {post.is_featured && (
                      <Star className="w-5 h-5 text-amber-400 fill-amber-400 flex-shrink-0 ml-2" />
                    )}
                  </div>

                  {/* Preview Text */}
                  <p className="text-slate-400 text-sm mb-4 leading-relaxed">
                    {extractPreview(post.content)}
                  </p>

                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-slate-800/50 border border-slate-700
                                   text-slate-400 text-xs rounded-md"
                        >
                          {tag}
                        </span>
                      ))}
                      {post.tags.length > 3 && (
                        <span className="px-2 py-1 text-slate-500 text-xs">
                          +{post.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Meta Info */}
                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {post.view_count || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        {post.comment_count || 0}
                      </span>
                      {post.cognitive_level_at_post && (
                        <span className="flex items-center gap-1 text-amber-500/70">
                          <Brain className="w-4 h-4" />
                          L{post.cognitive_level_at_post.toFixed(1)}
                        </span>
                      )}
                    </div>
                    <span>{formatDate(post.created_at)}</span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700
                           disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-slate-400">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700
                           disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
