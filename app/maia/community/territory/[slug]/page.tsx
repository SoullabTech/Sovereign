'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  MessageSquare,
  Heart,
  Eye,
  Clock,
  Plus,
  Search,
  Filter,
  ChevronRight,
  User,
  Flame,
  Droplets,
  Mountain,
  Wind,
  Sparkles,
  Loader2,
  SlidersHorizontal
} from 'lucide-react';

/**
 * Territory Detail Page
 *
 * Shows all posts within a specific territory with filtering,
 * sorting, and pagination.
 */

interface Territory {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  element?: string;
  post_count: number;
  parent_slug?: string;
  parent_name?: string;
}

interface Post {
  id: string;
  title: string;
  excerpt: string;
  content_type: string;
  element?: string;
  tradition?: string;
  user_name: string;
  heart_count: number;
  comment_count: number;
  view_count: number;
  is_featured: boolean;
  is_pinned: boolean;
  created_at: string;
  territory_name?: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

const ELEMENT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  fire: Flame,
  water: Droplets,
  earth: Mountain,
  air: Wind,
  aether: Sparkles,
};

const ELEMENT_COLORS: Record<string, string> = {
  fire: 'text-orange-400 bg-orange-500/10',
  water: 'text-blue-400 bg-blue-500/10',
  earth: 'text-green-400 bg-green-500/10',
  air: 'text-sky-400 bg-sky-500/10',
  aether: 'text-purple-400 bg-purple-500/10',
};

export default function TerritoryPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  // State
  const [territory, setTerritory] = useState<Territory | null>(null);
  const [subTerritories, setSubTerritories] = useState<Territory[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(false);

  // Filters
  const [sortBy, setSortBy] = useState('created_at');
  const [filterElement, setFilterElement] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch territory and posts
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch territory info
        const territoryRes = await fetch(`/api/community/territories?children=true`);
        const territoryData = await territoryRes.json();

        if (territoryData.ok) {
          const found = territoryData.territories.find((t: Territory) => t.slug === slug);
          if (found) {
            setTerritory(found);
            // Find sub-territories
            const children = territoryData.territories.filter(
              (t: Territory) => t.parent_slug === slug
            );
            setSubTerritories(children);
          }
        }

        // Fetch posts
        await fetchPosts(1);
      } catch (err) {
        console.error('Failed to fetch territory:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [slug]);

  // Fetch posts with filters
  async function fetchPosts(page: number) {
    setLoadingPosts(true);
    try {
      const params = new URLSearchParams({
        territory: slug,
        page: page.toString(),
        limit: '20',
        sort: sortBy,
        order: 'desc',
      });

      if (filterElement) params.set('element', filterElement);
      if (filterType) params.set('type', filterType);

      const res = await fetch(`/api/community/posts?${params}`);
      const data = await res.json();

      if (data.ok) {
        setPosts(data.posts);
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    } finally {
      setLoadingPosts(false);
    }
  }

  // Re-fetch when filters change
  useEffect(() => {
    if (!loading) {
      fetchPosts(1);
    }
  }, [sortBy, filterElement, filterType]);

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${Math.floor(diffHours)}h ago`;
    if (diffHours < 48) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/20 flex items-center justify-center">
        <div className="flex items-center gap-3 text-amber-300">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading territory...</span>
        </div>
      </div>
    );
  }

  if (!territory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-amber-300/70 mb-4">Territory not found</p>
          <Link href="/maia/community" className="text-amber-400 hover:text-amber-300">
            Return to Community
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/20">
      {/* Header */}
      <header className="border-b border-amber-500/20 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/maia/community')}
                className="flex items-center gap-2 text-amber-300 hover:text-amber-200 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
              <div className="w-px h-6 bg-amber-500/30" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{territory.icon}</span>
                  <h1 className="text-xl font-bold text-amber-100">{territory.name}</h1>
                </div>
                <p className="text-amber-300/70 text-sm">{territory.description}</p>
              </div>
            </div>

            <Link
              href={`/maia/community/new-post?territory=${slug}`}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-amber-50 rounded-lg hover:bg-amber-700 transition-colors font-medium"
            >
              <Plus className="w-4 h-4" />
              <span>New Post</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Sub-territories */}
        {subTerritories.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-amber-300/80 uppercase tracking-wide mb-4">
              Paths within {territory.name}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {subTerritories.map((sub) => (
                <Link
                  key={sub.id}
                  href={`/maia/community/territory/${sub.slug}`}
                  className="p-4 bg-slate-900/50 border border-amber-500/20 rounded-lg hover:border-amber-500/40 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span>{sub.icon}</span>
                    <span className="text-amber-100 font-medium text-sm truncate">{sub.name}</span>
                  </div>
                  <span className="text-xs text-amber-300/50">{sub.post_count || 0} posts</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Filters & Sort */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                showFilters
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : 'bg-slate-800/50 border-amber-500/20 text-amber-300/70 hover:border-amber-500/30'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-slate-800/50 border border-amber-500/20 rounded-lg text-amber-300 text-sm focus:outline-none focus:border-amber-500/40"
            >
              <option value="created_at">Newest</option>
              <option value="heart_count">Most Hearts</option>
              <option value="comment_count">Most Comments</option>
              <option value="view_count">Most Viewed</option>
            </select>
          </div>

          <div className="text-sm text-amber-300/60">
            {pagination?.total || 0} posts
          </div>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6 p-4 bg-slate-900/50 border border-amber-500/20 rounded-lg"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-amber-300/70 uppercase tracking-wide mb-2 block">
                  Element
                </label>
                <select
                  value={filterElement}
                  onChange={(e) => setFilterElement(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-amber-500/20 rounded-lg text-amber-300 text-sm"
                >
                  <option value="">All Elements</option>
                  <option value="fire">Fire</option>
                  <option value="water">Water</option>
                  <option value="earth">Earth</option>
                  <option value="air">Air</option>
                  <option value="aether">Aether</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-amber-300/70 uppercase tracking-wide mb-2 block">
                  Content Type
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-amber-500/20 rounded-lg text-amber-300 text-sm"
                >
                  <option value="">All Types</option>
                  <option value="discussion">Discussion</option>
                  <option value="question">Question</option>
                  <option value="essay">Essay</option>
                  <option value="breakthrough">Breakthrough</option>
                  <option value="practice_report">Practice Report</option>
                  <option value="review">Review</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}

        {/* Posts List */}
        <div className="space-y-4">
          {loadingPosts ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
              <span className="ml-3 text-amber-300/70">Loading posts...</span>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-amber-300/30 mx-auto mb-4" />
              <p className="text-amber-300/70 mb-4">No posts in this territory yet</p>
              <Link
                href={`/maia/community/new-post?territory=${slug}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-amber-50 rounded-lg hover:bg-amber-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Be the first to post
              </Link>
            </div>
          ) : (
            posts.map((post) => {
              const ElementIcon = post.element ? ELEMENT_ICONS[post.element] : null;
              const elementColor = post.element ? ELEMENT_COLORS[post.element] : '';

              return (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`
                    bg-slate-900/50 border rounded-xl p-5 cursor-pointer
                    hover:bg-slate-800/50 transition-all
                    ${post.is_pinned ? 'border-amber-500/40 bg-amber-500/5' : 'border-amber-500/20'}
                  `}
                  onClick={() => router.push(`/maia/community/post/${post.id}`)}
                >
                  <div className="flex items-start gap-4">
                    {/* User Avatar */}
                    <div className="w-10 h-10 bg-amber-600/30 rounded-full flex items-center justify-center text-amber-300 font-medium">
                      {post.user_name?.charAt(0) || 'U'}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {post.is_pinned && (
                          <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-xs rounded">
                            Pinned
                          </span>
                        )}
                        {post.is_featured && (
                          <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-300 text-xs rounded">
                            Featured
                          </span>
                        )}
                        <h3 className="font-semibold text-amber-100 truncate">{post.title}</h3>
                      </div>

                      <p className="text-amber-300/70 text-sm line-clamp-2 mb-3">{post.excerpt}</p>

                      <div className="flex items-center gap-4 text-xs text-amber-300/50 flex-wrap">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {post.user_name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(post.created_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {post.heart_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {post.comment_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {post.view_count}
                        </span>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-col items-end gap-2">
                      {ElementIcon && (
                        <div className={`p-2 rounded-lg ${elementColor}`}>
                          <ElementIcon className="w-4 h-4" />
                        </div>
                      )}
                      <span className="text-xs px-2 py-1 bg-slate-800 rounded text-amber-300/60">
                        {post.content_type}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => fetchPosts(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-4 py-2 bg-slate-800/50 border border-amber-500/20 rounded-lg text-amber-300 disabled:opacity-50 disabled:cursor-not-allowed hover:border-amber-500/40 transition-colors"
            >
              Previous
            </button>
            <span className="text-amber-300/70 px-4">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => fetchPosts(pagination.page + 1)}
              disabled={!pagination.hasMore}
              className="px-4 py-2 bg-slate-800/50 border border-amber-500/20 rounded-lg text-amber-300 disabled:opacity-50 disabled:cursor-not-allowed hover:border-amber-500/40 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
