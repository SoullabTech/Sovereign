'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useFeatureAccess } from '@/hooks/useSubscription';
import { PREMIUM_FEATURES } from '@/lib/subscription/types';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  MessageSquare,
  Users,
  BookOpen,
  Star,
  Plus,
  Search,
  Flame,
  Heart,
  Sparkles,
  ChevronRight,
  Compass,
  Crown,
  DoorOpen,
  Eye,
  Lightbulb,
  Gift,
  Circle,
  Building2,
  Wrench,
  X,
  FileText,
  Book,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { SustainingTransparency } from '@/components/community/SustainingTransparency';

/**
 * MAIA Community BBS - Sacred Territories
 *
 * Forum-style bulletin board system with organic territory structure
 * following the universal wisdom journey. Includes unified search
 * across posts, library content, and Elemental Alchemy book.
 */

// Territory icons mapping
const TERRITORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  threshold: DoorOpen,
  seeking: Search,
  practice: Compass,
  breakthrough: Sparkles,
  offering: Gift,
  circle: Circle,
  foundation: Building2,
  workshop: Wrench,
};

interface Territory {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  element?: string;
  sort_order: number;
  parent_id?: string;
  post_count?: number;
  child_count?: number;
  total_posts?: number;
  is_technical?: boolean;
  section?: string;
}

interface SearchResult {
  id: string;
  type: 'post' | 'library' | 'book_chapter';
  title: string;
  excerpt: string;
  url: string;
  territory?: string;
  element?: string;
  relevance: number;
  metadata?: Record<string, unknown>;
}

export default function CommunityBBSPage() {
  const router = useRouter();
  const commonsAccess = useFeatureAccess(PREMIUM_FEATURES.COMMUNITY_COMMONS);

  // State
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Fetch territories from API
  useEffect(() => {
    async function fetchTerritories() {
      try {
        const res = await fetch('/api/community/territories');
        const data = await res.json();
        if (data.ok) {
          setTerritories(data.territories);
        }
      } catch (err) {
        console.error('Failed to fetch territories:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchTerritories();
  }, []);

  // Debounced search
  const performSearch = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setSearching(true);
    setShowSearchResults(true);

    try {
      const res = await fetch(`/api/community/search?q=${encodeURIComponent(query)}&limit=15`);
      const data = await res.json();
      if (data.ok) {
        setSearchResults(data.results);
      }
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setSearching(false);
    }
  }, []);

  // Search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, performSearch]);

  // Mock user (replace with real auth)
  const currentUser = {
    id: 'beta-user-1',
    name: 'Sacred Explorer',
    avatar: 'SE',
    posts: 23,
    comments: 67,
    hearts: 156,
    breakthroughs: 3,
    cohort: 1,
    joinedDate: 'Oct 2024'
  };

  // Community stats
  const communityStats = {
    totalMembers: 347,
    onlineNow: 23,
    totalPosts: territories.reduce((sum, t) => sum + (t.total_posts || t.post_count || 0), 0),
    breakthroughs: 143
  };

  // Get icon for territory
  const getTerritoryIcon = (slug: string): React.ComponentType<{ className?: string }> => {
    return TERRITORY_ICONS[slug] || Compass;
  };

  // Get result type icon
  const getResultIcon = (type: string) => {
    switch (type) {
      case 'post': return MessageSquare;
      case 'library': return FileText;
      case 'book_chapter': return Book;
      default: return FileText;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/20">
      {/* Sacred Header with Search */}
      <header className="border-b border-amber-500/20 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/maia')}
                className="flex items-center gap-2 text-amber-300 hover:text-amber-200 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Return to MAIA</span>
              </button>
              <div className="w-px h-6 bg-amber-500/30" />
              <div>
                <h1 className="text-2xl font-bold text-amber-100">Sacred Territories</h1>
                <p className="text-amber-300/70 text-sm">Community wisdom exchange</p>
              </div>
            </div>

            <Link
              href="/maia/community/new-post"
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-amber-50 rounded-lg hover:bg-amber-700 transition-colors font-medium"
            >
              <Plus className="w-4 h-4" />
              <span>New Post</span>
            </Link>
          </div>

          {/* Unified Search Bar */}
          <div className="relative">
            <div className="flex items-center gap-2 bg-slate-800/80 border border-amber-500/30 rounded-lg px-4 py-3">
              <Search className="w-5 h-5 text-amber-400" />
              <input
                type="text"
                placeholder="Search posts, library, Elemental Alchemy book..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-amber-100 placeholder-amber-300/50 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setShowSearchResults(false);
                  }}
                  className="text-amber-300/50 hover:text-amber-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              {searching && <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />}
            </div>

            {/* Search Results Dropdown */}
            <AnimatePresence>
              {showSearchResults && searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-amber-500/30 rounded-lg shadow-2xl max-h-96 overflow-y-auto z-50"
                >
                  <div className="p-2">
                    <div className="text-xs text-amber-300/50 px-3 py-2 uppercase tracking-wide">
                      {searchResults.length} results found
                    </div>
                    {searchResults.map((result) => {
                      const Icon = getResultIcon(result.type);
                      return (
                        <Link
                          key={result.id}
                          href={result.url}
                          className="flex items-start gap-3 p-3 rounded-lg hover:bg-amber-500/10 transition-colors group"
                          onClick={() => setShowSearchResults(false)}
                        >
                          <div className="p-2 bg-amber-500/10 rounded-lg group-hover:bg-amber-500/20 transition-colors">
                            <Icon className="w-4 h-4 text-amber-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-amber-100 font-medium truncate">{result.title}</span>
                              <span className={`text-xs px-2 py-0.5 rounded ${
                                result.type === 'post' ? 'bg-blue-500/20 text-blue-300' :
                                result.type === 'library' ? 'bg-green-500/20 text-green-300' :
                                'bg-purple-500/20 text-purple-300'
                              }`}>
                                {result.type === 'book_chapter' ? 'book' : result.type}
                              </span>
                            </div>
                            <p className="text-sm text-amber-300/60 truncate mt-1">{result.excerpt}</p>
                            {result.territory && (
                              <span className="text-xs text-amber-300/40 mt-1 block">{result.territory}</span>
                            )}
                          </div>
                          <ExternalLink className="w-4 h-4 text-amber-300/30 group-hover:text-amber-300/60 transition-colors" />
                        </Link>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">

            {/* User Profile Card */}
            <div className="bg-slate-900/50 border border-amber-500/20 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-amber-600 rounded-full flex items-center justify-center text-amber-50 font-bold text-lg">
                  {currentUser.avatar}
                </div>
                <div>
                  <h3 className="font-semibold text-amber-100">{currentUser.name}</h3>
                  <p className="text-amber-300/70 text-sm">Beta Cohort {currentUser.cohort}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-amber-300">{currentUser.posts}</div>
                  <div className="text-xs text-amber-300/70">Posts</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-amber-300">{currentUser.comments}</div>
                  <div className="text-xs text-amber-300/70">Comments</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-amber-300">{currentUser.hearts}</div>
                  <div className="text-xs text-amber-300/70">Hearts</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-yellow-400">{currentUser.breakthroughs}</div>
                  <div className="text-xs text-amber-300/70">Breakthroughs</div>
                </div>
              </div>
            </div>

            {/* Community Stats */}
            <div className="bg-slate-900/50 border border-amber-500/20 rounded-xl p-6">
              <h3 className="font-semibold text-amber-100 mb-4 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Community Vitals
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-amber-300/70">Total Members</span>
                  <span className="text-amber-300 font-medium">{communityStats.totalMembers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-300/70">Online Now</span>
                  <span className="text-emerald-400 font-medium">{communityStats.onlineNow}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-300/70">Total Posts</span>
                  <span className="text-amber-300 font-medium">{communityStats.totalPosts || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-300/70">Breakthroughs</span>
                  <span className="text-yellow-400 font-medium">{communityStats.breakthroughs}</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-slate-900/50 border border-amber-500/20 rounded-xl p-6">
              <h3 className="font-semibold text-amber-100 mb-4 flex items-center gap-2">
                <Star className="w-4 h-4" />
                Quick Access
              </h3>
              <div className="space-y-2">
                <Link
                  href="/maia/community/elemental-alchemy"
                  className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-amber-500/20 hover:border-amber-500/40 transition-colors"
                >
                  <Flame className="w-5 h-5 text-orange-400" />
                  <div>
                    <div className="text-amber-100 font-medium text-sm">Elemental Alchemy</div>
                    <div className="text-xs text-amber-300/60">Kelly&apos;s foundational book</div>
                  </div>
                </Link>
                <Link
                  href="/library"
                  className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/10 hover:border-amber-500/30 transition-colors"
                >
                  <BookOpen className="w-5 h-5 text-amber-400" />
                  <div>
                    <div className="text-amber-100 font-medium text-sm">Wisdom Files</div>
                    <div className="text-xs text-amber-300/60">189 searchable documents</div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Sustaining Transparency */}
            <SustainingTransparency />
          </div>

          {/* Main Content - Sacred Territories */}
          <div className="lg:col-span-3">
            <div className="space-y-6">

              {/* Welcome Message */}
              <div className="bg-gradient-to-r from-amber-600/10 to-yellow-600/10 border border-amber-500/30 rounded-xl p-6">
                <h2 className="text-xl font-bold text-amber-100 mb-2">Welcome to the Sacred Territories</h2>
                <p className="text-amber-300/80 leading-relaxed">
                  Navigate the universal wisdom journey—from crossing the Threshold to sharing your Offerings.
                  Each territory holds space for seekers at every stage of transformation, drawing from
                  traditions worldwide while honoring the uniqueness of your path.
                </p>
              </div>

              {/* Elemental Alchemy Book Feature */}
              <Link href="/maia/community/elemental-alchemy">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-r from-orange-600/20 via-red-600/10 to-amber-600/20 border border-orange-500/40 rounded-xl p-6 cursor-pointer hover:border-orange-500/60 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl border border-orange-500/30">
                      <Flame className="w-8 h-8 text-orange-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-amber-100">Elemental Alchemy</h3>
                        <span className="px-2 py-0.5 bg-orange-500/20 text-orange-300 text-xs rounded-full">Founder&apos;s Book</span>
                      </div>
                      <p className="text-amber-300/70 text-sm">
                        The Ancient Art of Living a Phenomenal Life — Interactive exploration of Fire, Water, Earth, Air & Aether
                      </p>
                    </div>
                    <ChevronRight className="w-6 h-6 text-orange-400" />
                  </div>
                </motion.div>
              </Link>

              {/* Wisdom Files Library Link */}
              {commonsAccess.hasAccess ? (
                <Link href="/library">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-gradient-to-r from-teal-600/10 to-emerald-600/10 border border-teal-500/30 rounded-xl p-6 cursor-pointer hover:border-teal-500/50 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-4 bg-teal-500/10 rounded-xl border border-teal-500/20">
                        <BookOpen className="w-8 h-8 text-teal-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-amber-100">Wisdom Files</h3>
                          <Sparkles className="w-4 h-4 text-teal-400" />
                        </div>
                        <p className="text-amber-300/70 text-sm">
                          Searchable library of wisdom texts, practices, and resources — 189 documents
                        </p>
                      </div>
                      <ChevronRight className="w-6 h-6 text-teal-400" />
                    </div>
                  </motion.div>
                </Link>
              ) : (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-slate-800/50 border border-teal-500/20 rounded-xl p-6 cursor-pointer hover:border-teal-500/40 transition-all"
                  onClick={() => commonsAccess.require()}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-teal-500/5 rounded-xl border border-teal-500/10">
                      <Crown className="w-8 h-8 text-teal-400/60" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-amber-100/70">Wisdom Files</h3>
                        <span className="px-2 py-0.5 bg-teal-500/10 text-teal-300/70 text-xs rounded-full">Member Access</span>
                      </div>
                      <p className="text-amber-300/50 text-sm">
                        Searchable library of wisdom texts, practices, and resources
                      </p>
                    </div>
                    <ChevronRight className="w-6 h-6 text-teal-400/40" />
                  </div>
                </motion.div>
              )}

              {/* Sacred Territories Grid - Wisdom Section */}
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-amber-100 flex items-center gap-2">
                  <Compass className="w-5 h-5 text-amber-400" />
                  Wisdom Territories
                </h2>

                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                    <span className="ml-3 text-amber-300/70">Loading territories...</span>
                  </div>
                ) : (
                  <>
                    {/* Wisdom territories (non-technical) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {territories
                        .filter((t) => !t.is_technical && t.slug !== 'workshop')
                        .map((territory) => {
                          const Icon = getTerritoryIcon(territory.slug);
                          return (
                            <motion.div
                              key={territory.id}
                              whileHover={{ scale: 1.02 }}
                              className="bg-slate-900/50 border border-amber-500/20 rounded-xl p-5 cursor-pointer hover:border-amber-500/40 hover:bg-slate-800/50 transition-all"
                              onClick={() => router.push(`/maia/community/territory/${territory.slug}`)}
                            >
                              <div className="flex items-start gap-4">
                                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                                  <Icon className="w-6 h-6 text-amber-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-semibold text-amber-100">{territory.name}</h3>
                                    {territory.child_count && territory.child_count > 0 && (
                                      <span className="text-xs text-amber-300/50">
                                        {territory.child_count} paths
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-amber-300/70 text-sm line-clamp-2">{territory.description}</p>
                                  <div className="flex items-center gap-3 mt-2 text-xs text-amber-300/50">
                                    <span className="flex items-center gap-1">
                                      <MessageSquare className="w-3 h-3" />
                                      {territory.total_posts || territory.post_count || 0} posts
                                    </span>
                                  </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-amber-400/50" />
                              </div>
                            </motion.div>
                          );
                        })}
                    </div>

                    {/* Separator */}
                    <div className="flex items-center gap-4 py-6">
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-600/50 to-transparent" />
                      <span className="text-xs text-slate-500 uppercase tracking-wider">Technical</span>
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-600/50 to-transparent" />
                    </div>

                    {/* Soullab Lab (Technical) */}
                    {territories.filter((t) => t.slug === 'workshop').map((lab) => {
                      const Icon = getTerritoryIcon(lab.slug);
                      return (
                        <motion.div
                          key={lab.id}
                          whileHover={{ scale: 1.01 }}
                          className="bg-slate-800/30 border border-slate-600/30 rounded-xl p-5 cursor-pointer hover:border-slate-500/40 hover:bg-slate-800/50 transition-all"
                          onClick={() => router.push(`/maia/community/territory/${lab.slug}`)}
                        >
                          <div className="flex items-start gap-4">
                            <div className="p-3 bg-slate-700/30 border border-slate-600/30 rounded-lg">
                              <Wrench className="w-6 h-6 text-slate-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-slate-200">{lab.name}</h3>
                                <span className="text-xs px-2 py-0.5 bg-slate-700/50 text-slate-400 rounded">
                                  For developers & tech
                                </span>
                              </div>
                              <p className="text-slate-400 text-sm">{lab.description}</p>
                              <div className="flex flex-wrap gap-2 mt-3">
                                <span className="text-xs px-2 py-1 bg-slate-700/30 text-slate-400 rounded">Platform Help</span>
                                <span className="text-xs px-2 py-1 bg-slate-700/30 text-slate-400 rounded">Dev Corner</span>
                                <span className="text-xs px-2 py-1 bg-slate-700/30 text-slate-400 rounded">Consciousness Tech</span>
                                <span className="text-xs px-2 py-1 bg-slate-700/30 text-slate-400 rounded">API & Integrations</span>
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-500" />
                          </div>
                        </motion.div>
                      );
                    })}
                  </>
                )}
              </div>

              {/* Content Tiers Info */}
              <div className="bg-slate-900/30 border border-amber-500/10 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-amber-300/80 mb-4 uppercase tracking-wide">Content Tiers</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-amber-500/5 rounded-lg">
                    <Crown className="w-5 h-5 text-amber-400 mx-auto mb-2" />
                    <div className="text-xs text-amber-100 font-medium">Founder Wisdom</div>
                    <div className="text-xs text-amber-300/50">Core teachings</div>
                  </div>
                  <div className="text-center p-3 bg-amber-500/5 rounded-lg">
                    <Star className="w-5 h-5 text-amber-400 mx-auto mb-2" />
                    <div className="text-xs text-amber-100 font-medium">Elder Contributions</div>
                    <div className="text-xs text-amber-300/50">Approved essays</div>
                  </div>
                  <div className="text-center p-3 bg-amber-500/5 rounded-lg">
                    <Heart className="w-5 h-5 text-amber-400 mx-auto mb-2" />
                    <div className="text-xs text-amber-100 font-medium">Community Wisdom</div>
                    <div className="text-xs text-amber-300/50">Reviews & reports</div>
                  </div>
                  <div className="text-center p-3 bg-amber-500/5 rounded-lg">
                    <MessageSquare className="w-5 h-5 text-amber-400 mx-auto mb-2" />
                    <div className="text-xs text-amber-100 font-medium">Discussions</div>
                    <div className="text-xs text-amber-300/50">Open forum</div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
