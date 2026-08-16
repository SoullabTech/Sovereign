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
import PersonalThresholdInvitation from '@/components/tier/PersonalThresholdInvitation';
import TierDebugPill from '@/components/dev/TierDebugPill';
import type { MemberTier } from '@/lib/auth/tierAccess';

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

  // Tier state (from localStorage, default to free)
  const [tier, setTier] = useState<MemberTier>('free');

  // State
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [thresholdDismissed, setThresholdDismissed] = useState(false);

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

  // Real user from session
  const [currentUser, setCurrentUser] = useState({
    id: '',
    name: 'Sacred Explorer',
    avatar: 'SE',
    posts: 0,
    comments: 0,
    hearts: 0,
    breakthroughs: 0,
    conversations: 0,
    cohort: 1,
    joinedDate: ''
  });

  // Real community stats from API
  const [communityStats, setCommunityStats] = useState({
    totalMembers: 0,
    onlineNow: 0,
    totalPosts: 0,
    breakthroughs: 0
  });

  // Load real user and stats
  useEffect(() => {
    // Get user from session
    const storedUser = typeof window !== 'undefined' ? localStorage.getItem('beta_user') : null;
    let userId = '';

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        userId = user.id || '';
        setCurrentUser({
          id: userId,
          name: user.name || user.username || 'Sacred Explorer',
          avatar: (user.name || user.username || 'SE').substring(0, 2).toUpperCase(),
          posts: 0,
          comments: 0,
          hearts: 0,
          breakthroughs: 0,
          conversations: 0,
          cohort: 1,
          joinedDate: user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''
        });

        // Fetch user's personal stats
        if (userId) {
          fetch(`/api/community/user-stats?userId=${userId}`)
            .then(res => res.json())
            .then(data => {
              if (data.success && data.stats) {
                setCurrentUser(prev => ({
                  ...prev,
                  posts: data.stats.posts || 0,
                  comments: data.stats.comments || 0,
                  hearts: data.stats.hearts || 0,
                  breakthroughs: data.stats.breakthroughs || 0,
                  conversations: data.stats.conversations || 0
                }));
              }
            })
            .catch(err => console.error('Failed to fetch user stats:', err));
        }
      } catch (e) {
        console.error('Failed to parse user:', e);
      }
    }

    // Fetch real community stats from API
    fetch('/api/community/stats')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.stats?.community) {
          setCommunityStats({
            totalMembers: data.stats.community.totalMembers || 0,
            onlineNow: data.stats.community.onlineNow || 0,
            totalPosts: data.stats.community.totalPosts || 0,
            breakthroughs: data.stats.community.breakthroughs || 0
          });
        }
      })
      .catch(err => console.error('Failed to fetch community stats:', err));
  }, []);

  // Load tier from localStorage
  useEffect(() => {
    const storedUser = typeof window !== 'undefined' ? localStorage.getItem('beta_user') : null;
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        // Check for tier in user data, default to free
        setTier((user.tier as MemberTier) || 'free');
      } catch (e) {
        console.error('Failed to parse user tier:', e);
      }
    }
  }, []);

  // Check for threshold moment (community engagement)
  const shouldShowThreshold = tier === 'free' && (currentUser.posts >= 3 || currentUser.comments >= 5);
  const thresholdType = 'community_engagement';

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
    <div className="min-h-screen bg-[#1a1a1a]">
      {/* Header with Search */}
      <header className="border-b border-white/10 bg-[#1a1a1a] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/maia')}
                className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-amber-400" />
                <span>Return to MAIA</span>
              </button>
              <div className="w-px h-6 bg-white/10" />
              <div>
                <h1 className="text-2xl font-medium text-white">Library</h1>
                <p className="text-white/50 text-sm">Wisdom, practices &amp; shared knowledge</p>
              </div>
            </div>

            <Link
              href="/maia/community/new-post"
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
            >
              <Plus className="w-4 h-4" />
              <span>New Post</span>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-4 py-3">
              <Search className="w-5 h-5 text-orange-500" />
              <input
                type="text"
                placeholder="Search posts, library, Elemental Alchemy book..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-white placeholder-white/40 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setShowSearchResults(false);
                  }}
                  className="text-white/40 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              {searching && <Loader2 className="w-4 h-4 text-orange-500 animate-spin" />}
            </div>

            {/* Search Results Dropdown */}
            <AnimatePresence>
              {showSearchResults && searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-[#2a2a2a] border border-white/10 rounded-lg shadow-2xl max-h-96 overflow-y-auto z-50"
                >
                  <div className="p-2">
                    <div className="text-xs text-white/40 px-3 py-2 uppercase tracking-wide">
                      {searchResults.length} results found
                    </div>
                    {searchResults.map((result) => {
                      const Icon = getResultIcon(result.type);
                      return (
                        <Link
                          key={result.id}
                          href={result.url}
                          className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors group"
                          onClick={() => setShowSearchResults(false)}
                        >
                          <div className="p-2 bg-orange-500/10 rounded-lg">
                            <Icon className="w-4 h-4 text-orange-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-white font-medium truncate">{result.title}</span>
                              <span className={`text-xs px-2 py-0.5 rounded ${
                                result.type === 'post' ? 'bg-blue-500/20 text-blue-300' :
                                result.type === 'library' ? 'bg-green-500/20 text-green-300' :
                                'bg-purple-500/20 text-purple-300'
                              }`}>
                                {result.type === 'book_chapter' ? 'book' : result.type}
                              </span>
                            </div>
                            <p className="text-sm text-white/50 truncate mt-1">{result.excerpt}</p>
                            {result.territory && (
                              <span className="text-xs text-white/30 mt-1 block">{result.territory}</span>
                            )}
                          </div>
                          <ExternalLink className="w-4 h-4 text-white/20 group-hover:text-orange-500 transition-colors" />
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
            <div className="bg-[#2a2a2a] border border-white/10 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {currentUser.avatar}
                </div>
                <div>
                  <h3 className="font-medium text-white">{currentUser.name}</h3>
                  <p className="text-white/50 text-sm">Beta Cohort {currentUser.cohort}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-orange-500">{currentUser.posts}</div>
                  <div className="text-xs text-white/50">Posts</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-orange-500">{currentUser.conversations.toLocaleString()}</div>
                  <div className="text-xs text-white/50">Conversations</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-orange-500">{currentUser.hearts}</div>
                  <div className="text-xs text-white/50">Hearts</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-orange-400">{currentUser.breakthroughs}</div>
                  <div className="text-xs text-white/50">Breakthroughs</div>
                </div>
              </div>
            </div>

            {/* Threshold Invitation — shown when meaningful engagement detected */}
            {shouldShowThreshold && !thresholdDismissed && tier === 'free' && (
              <PersonalThresholdInvitation
                context={(thresholdType as 'community_engagement') || 'community_engagement'}
                variant="card"
                onLearnMore={() => router.push('/membership')}
                onDismiss={() => setThresholdDismissed(true)}
              />
            )}

            {/* Dev-only tier debug pill */}
            <TierDebugPill
              tier={tier}
              hasAccess={true}
              extra={{
                posts: currentUser.posts,
                comments: currentUser.comments,
                threshold: shouldShowThreshold ? thresholdType : 'none',
              }}
              hint={shouldShowThreshold ? 'threshold reached' : undefined}
              scheme="dark"
            />

            {/* Community Stats */}
            <div className="bg-[#2a2a2a] border border-white/10 rounded-xl p-6">
              <h3 className="font-medium text-white mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-orange-500" />
                Community Vitals
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-white/60">Total Members</span>
                  <span className="text-orange-500 font-medium">{communityStats.totalMembers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Online Now</span>
                  <span className="text-green-400 font-medium">{communityStats.onlineNow}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Total Posts</span>
                  <span className="text-orange-500 font-medium">{communityStats.totalPosts || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Breakthroughs</span>
                  <span className="text-orange-400 font-medium">{communityStats.breakthroughs}</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-[#2a2a2a] border border-white/10 rounded-xl p-6">
              <h3 className="font-medium text-white mb-4 flex items-center gap-2">
                <Star className="w-4 h-4 text-orange-500" />
                Quick Access
              </h3>
              <div className="space-y-2">
                <Link
                  href="/maia/community/elemental-alchemy"
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:border-orange-500/30 transition-colors"
                >
                  <Flame className="w-5 h-5 text-orange-500" />
                  <div>
                    <div className="text-white font-medium text-sm">Elemental Alchemy</div>
                    <div className="text-xs text-white/50">Kelly&apos;s foundational book</div>
                  </div>
                </Link>
                <Link
                  href="/library"
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:border-orange-500/30 transition-colors"
                >
                  <BookOpen className="w-5 h-5 text-orange-500" />
                  <div>
                    <div className="text-white font-medium text-sm">Wisdom Files</div>
                    <div className="text-xs text-white/50">189 searchable documents</div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Sustaining Transparency */}
            <SustainingTransparency />
          </div>

          {/* Main Content - Repository */}
          <div className="lg:col-span-3">
            <div className="space-y-6">

              {/* Welcome Message */}
              <div className="bg-[#2a2a2a] border border-white/10 rounded-xl p-6">
                <h2 className="text-xl font-medium text-white mb-2">Welcome to the Library</h2>
                <p className="text-white/60 leading-relaxed">
                  Navigate the universal wisdom journey—from crossing the Threshold to sharing your Offerings.
                  Each territory holds space for seekers at every stage of transformation, drawing from
                  traditions worldwide while honoring the uniqueness of your path.
                </p>
              </div>

              {/* Elemental Alchemy Book Feature */}
              <Link href="/maia/community/elemental-alchemy">
                <div className="bg-[#2a2a2a] border border-white/10 rounded-xl p-6 hover:border-orange-500/30 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-orange-500/10 rounded-xl">
                      <Flame className="w-8 h-8 text-orange-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-medium text-white">Elemental Alchemy</h3>
                        <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs rounded-full">Founder&apos;s Book</span>
                      </div>
                      <p className="text-white/50 text-sm">
                        The Ancient Art of Living a Phenomenal Life — Interactive exploration of Fire, Water, Earth, Air & Aether
                      </p>
                    </div>
                    <ChevronRight className="w-6 h-6 text-orange-500 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </Link>

              {/* Wisdom Files Library Link */}
              {commonsAccess.hasAccess ? (
                <Link href="/library">
                  <div className="bg-[#2a2a2a] border border-white/10 rounded-xl p-6 hover:border-orange-500/30 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="p-4 bg-orange-500/10 rounded-xl">
                        <BookOpen className="w-8 h-8 text-orange-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-medium text-white">Wisdom Files</h3>
                          <Sparkles className="w-4 h-4 text-orange-400" />
                        </div>
                        <p className="text-white/50 text-sm">
                          Searchable library of wisdom texts, practices, and resources — 189 documents
                        </p>
                      </div>
                      <ChevronRight className="w-6 h-6 text-orange-500 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </Link>
              ) : (
                <div
                  className="bg-[#2a2a2a] border border-white/10 rounded-xl p-6 cursor-pointer hover:border-white/20 transition-all group"
                  onClick={() => commonsAccess.require()}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-white/5 rounded-xl">
                      <Crown className="w-8 h-8 text-white/40" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-medium text-white/60">Wisdom Files</h3>
                        <span className="px-2 py-0.5 bg-white/10 text-white/50 text-xs rounded-full">Member Access</span>
                      </div>
                      <p className="text-white/40 text-sm">
                        Searchable library of wisdom texts, practices, and resources
                      </p>
                    </div>
                    <ChevronRight className="w-6 h-6 text-white/30" />
                  </div>
                </div>
              )}

              {/* Repository Grid - Wisdom Section */}
              <div className="space-y-4">
                <h2 className="text-lg font-medium text-white flex items-center gap-2">
                  <Compass className="w-5 h-5 text-orange-500" />
                  Wisdom Territories
                </h2>

                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                    <span className="ml-3 text-white/50">Loading territories...</span>
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
                            <div
                              key={territory.id}
                              className="bg-[#2a2a2a] border border-white/10 rounded-xl p-5 cursor-pointer hover:border-orange-500/30 transition-all group"
                              onClick={() => router.push(`/maia/community/territory/${territory.slug}`)}
                            >
                              <div className="flex items-start gap-4">
                                <div className="p-3 bg-orange-500/10 rounded-lg">
                                  <Icon className="w-6 h-6 text-orange-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-medium text-white">{territory.name}</h3>
                                    {territory.child_count && territory.child_count > 0 && (
                                      <span className="text-xs text-white/40">
                                        {territory.child_count} paths
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-white/50 text-sm line-clamp-2">{territory.description}</p>
                                  <div className="flex items-center gap-3 mt-2 text-xs text-white/40">
                                    <span className="flex items-center gap-1">
                                      <MessageSquare className="w-3 h-3" />
                                      {territory.total_posts || territory.post_count || 0} posts
                                    </span>
                                  </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-orange-500/50 group-hover:text-orange-500 group-hover:translate-x-0.5 transition-all" />
                              </div>
                            </div>
                          );
                        })}
                    </div>

                    {/* Separator */}
                    <div className="flex items-center gap-4 py-6">
                      <div className="flex-1 h-px bg-white/10" />
                      <span className="text-xs text-white/30 uppercase tracking-wider">Technical</span>
                      <div className="flex-1 h-px bg-white/10" />
                    </div>

                    {/* Soullab Lab (Technical) */}
                    {territories.filter((t) => t.slug === 'workshop').map((lab) => {
                      const Icon = getTerritoryIcon(lab.slug);
                      return (
                        <div
                          key={lab.id}
                          className="bg-[#252525] border border-white/10 rounded-xl p-5 cursor-pointer hover:border-white/20 transition-all group"
                          onClick={() => router.push(`/maia/community/territory/${lab.slug}`)}
                        >
                          <div className="flex items-start gap-4">
                            <div className="p-3 bg-white/5 rounded-lg">
                              <Wrench className="w-6 h-6 text-white/50" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-medium text-white/80">{lab.name}</h3>
                                <span className="text-xs px-2 py-0.5 bg-white/10 text-white/50 rounded">
                                  For developers & tech
                                </span>
                              </div>
                              <p className="text-white/40 text-sm">{lab.description}</p>
                              <div className="flex flex-wrap gap-2 mt-3">
                                <span className="text-xs px-2 py-1 bg-white/5 text-white/40 rounded">Platform Help</span>
                                <span className="text-xs px-2 py-1 bg-white/5 text-white/40 rounded">Dev Corner</span>
                                <span className="text-xs px-2 py-1 bg-white/5 text-white/40 rounded">Consciousness Tech</span>
                                <span className="text-xs px-2 py-1 bg-white/5 text-white/40 rounded">API & Integrations</span>
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-white/50 group-hover:translate-x-0.5 transition-all" />
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>

              {/* Content Tiers Info */}
              <div className="bg-[#252525] border border-white/10 rounded-xl p-6">
                <h3 className="text-sm font-medium text-white/60 mb-4 uppercase tracking-wide">Content Tiers</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <Crown className="w-5 h-5 text-orange-500 mx-auto mb-2" />
                    <div className="text-xs text-white font-medium">Founder Wisdom</div>
                    <div className="text-xs text-white/40">Core teachings</div>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <Star className="w-5 h-5 text-orange-500 mx-auto mb-2" />
                    <div className="text-xs text-white font-medium">Elder Contributions</div>
                    <div className="text-xs text-white/40">Approved essays</div>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <Heart className="w-5 h-5 text-orange-500 mx-auto mb-2" />
                    <div className="text-xs text-white font-medium">Community Wisdom</div>
                    <div className="text-xs text-white/40">Reviews & reports</div>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <MessageSquare className="w-5 h-5 text-orange-500 mx-auto mb-2" />
                    <div className="text-xs text-white font-medium">Discussions</div>
                    <div className="text-xs text-white/40">Open forum</div>
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
