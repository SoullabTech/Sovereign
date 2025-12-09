'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CommunityPost, SystemMode, PostType, FeedFilters } from '@/lib/community/types';
import { useFeatureAccess } from '@/hooks/useSubscription';
import { PREMIUM_FEATURES } from '@/lib/subscription/types';
import { UpgradePrompt } from '@/components/subscription/UpgradePrompt';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  MessageSquare,
  Users,
  BookOpen,
  Lightbulb,
  Star,
  Clock,
  Eye,
  Plus,
  Search,
  Filter,
  Globe,
  Flame,
  TrendingUp,
  User,
  Heart,
  Pin,
  Award,
  Sparkles,
  ChevronRight,
  Home,
  Compass,
  Brain,
  Mountain,
  Crown,
  Feather,
  Zap
} from 'lucide-react';

/**
 * MAIA Community BBS - Elevated Sacred Platform
 *
 * Forum-style bulletin board system for multicultural wisdom exchange,
 * conscious discussions, breakthrough sharing, and collective evolution.
 *
 * Designed with Dune aesthetics - amber, gold, and deep space themes.
 */

// Forum categories with wisdom traditions
const forumCategories = [
  {
    id: 'announcements',
    name: 'Sacred Announcements',
    description: 'Community updates, system evolution, and elevated guidance',
    icon: Crown,
    color: 'amber-400',
    pinned: true,
    posts: 8,
    lastActivity: '2 hours ago'
  },
  {
    id: 'breakthroughs',
    name: 'Breakthrough Gallery',
    description: 'Share your profound MAIA moments and consciousness shifts',
    icon: Sparkles,
    color: 'yellow-400',
    posts: 143,
    lastActivity: '15 minutes ago'
  },
  {
    id: 'field-reports',
    name: 'Field System Reports',
    description: 'Experiences with PFI consciousness technology',
    icon: Zap,
    color: 'amber-300',
    posts: 89,
    lastActivity: '1 hour ago'
  },
  {
    id: 'wisdom-traditions',
    name: 'Wisdom Traditions',
    description: 'Indigenous, Eastern, Western, African, and Sufi knowledge integration',
    icon: Star,
    color: 'orange-400',
    posts: 234,
    lastActivity: '30 minutes ago',
    subcategories: [
      'Indigenous Wisdom', 'Eastern Traditions', 'Western Psychology',
      'African Spirituality', 'Sufi Mysticism', 'Multicultural Integration'
    ]
  },
  {
    id: 'spiralogic',
    name: 'Spiralogic Integration',
    description: 'Nigredo, Albedo, Citrinitas, Rubedo, and Integration discussions',
    icon: Mountain,
    color: 'amber-500',
    posts: 156,
    lastActivity: '45 minutes ago',
    subcategories: [
      'Nigredo - Shadow Work', 'Albedo - Purification', 'Citrinitas - Illumination',
      'Rubedo - Integration', 'Phase Transitions'
    ]
  },
  {
    id: 'sacred-psychology',
    name: 'Sacred Psychology',
    description: 'Depth psychology, archetypes, and consciousness exploration',
    icon: Brain,
    color: 'yellow-500',
    posts: 201,
    lastActivity: '20 minutes ago'
  },
  {
    id: 'meditation-practices',
    name: 'Meditation & Practices',
    description: 'Sacred practices, rituals, and contemplative techniques',
    icon: Feather,
    color: 'amber-400',
    posts: 178,
    lastActivity: '1 hour ago'
  },
  {
    id: 'technical-support',
    name: 'Technical Sanctuary',
    description: 'Platform support, feature requests, and technical wisdom',
    icon: Globe,
    color: 'orange-300',
    posts: 67,
    lastActivity: '3 hours ago'
  }
];

// Mock recent activity data
const recentActivity = [
  { type: 'post', user: 'SacredSeeker', action: 'shared a breakthrough in', category: 'Field System Reports', time: '5 min' },
  { type: 'comment', user: 'WisdomKeeper', action: 'replied to', category: 'Wisdom Traditions', time: '12 min' },
  { type: 'post', user: 'FieldExplorer', action: 'started discussion in', category: 'Spiralogic Integration', time: '23 min' },
  { type: 'comment', user: 'ConsciousOne', action: 'commented on', category: 'Sacred Psychology', time: '35 min' },
  { type: 'post', user: 'MysticTraveler', action: 'shared wisdom in', category: 'Meditation & Practices', time: '1 hour' }
];

// Community stats
const communityStats = {
  totalMembers: 347,
  onlineNow: 23,
  totalPosts: 1156,
  totalComments: 3482,
  breakthroughs: 143
};

export default function CommunityBBSPage() {
  const router = useRouter();
  const commonsAccess = useFeatureAccess(PREMIUM_FEATURES.COMMUNITY_COMMONS);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/20">
      {/* Sacred Header */}
      <header className="border-b border-amber-500/20 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
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
                <h1 className="text-2xl font-bold text-amber-100">MAIA Community BBS</h1>
                <p className="text-amber-300/70 text-sm">Sacred platform for elevated discourse</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-lg hover:bg-amber-500/20 transition-colors"
              >
                <Search className="w-4 h-4" />
                <span>Search</span>
              </button>
              <Link
                href="/community/new-post"
                className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-amber-50 rounded-lg hover:bg-amber-700 transition-colors font-medium"
              >
                <Plus className="w-4 h-4" />
                <span>New Post</span>
              </Link>
            </div>
          </div>

          {/* Search Bar */}
          <AnimatePresence>
            {showSearch && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 overflow-hidden"
              >
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Search wisdom, breakthroughs, discussions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 px-4 py-2 bg-slate-800 border border-amber-500/30 text-amber-100 rounded-lg focus:outline-none focus:border-amber-500"
                  />
                  <button className="px-4 py-2 bg-amber-600 text-amber-50 rounded-lg hover:bg-amber-700 transition-colors">
                    Search
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Sidebar - Community Stats & User Info */}
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
                  <span className="text-amber-300 font-medium">{communityStats.totalPosts}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-300/70">Breakthroughs</span>
                  <span className="text-yellow-400 font-medium">{communityStats.breakthroughs}</span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-slate-900/50 border border-amber-500/20 rounded-xl p-6">
              <h3 className="font-semibold text-amber-100 mb-4 flex items-center gap-2">
                <Flame className="w-4 h-4" />
                Sacred Flow
              </h3>
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="text-sm">
                    <span className="text-amber-300 font-medium">{activity.user}</span>
                    <span className="text-amber-300/70"> {activity.action} </span>
                    <span className="text-amber-400">{activity.category}</span>
                    <div className="text-xs text-amber-300/50 mt-1">{activity.time} ago</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content - Forum Categories */}
          <div className="lg:col-span-3">
            <div className="space-y-6">

              {/* Welcome Message */}
              <div className="bg-gradient-to-r from-amber-600/10 to-yellow-600/10 border border-amber-500/30 rounded-xl p-6">
                <h2 className="text-xl font-bold text-amber-100 mb-2">Welcome to the Sacred Commons</h2>
                <p className="text-amber-300/80 leading-relaxed">
                  This elevated bulletin board serves as a multicultural sanctuary where wisdom traditions converge.
                  Share breakthroughs, explore Spiralogic integration, and engage in consciousness-expanding discourse
                  with fellow travelers on the path of transformation.
                </p>
              </div>

              {/* Forum Categories Grid */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-amber-100 mb-6 flex items-center gap-2">
                  <Compass className="w-5 h-5" />
                  Sacred Territories
                </h2>

                {/* Community Commons Special Link */}
                {commonsAccess.hasAccess ? (
                  <Link href="/maia/community/commons">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-gradient-to-r from-amber-600/20 to-yellow-600/20 border border-amber-500/40 rounded-xl p-6 cursor-pointer
                               hover:border-amber-500/60 hover:bg-gradient-to-r hover:from-amber-600/30 hover:to-yellow-600/30 transition-all
                               ring-2 ring-amber-500/30"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-amber-400/20 border border-amber-400/40 rounded-lg">
                            <BookOpen className="w-6 h-6 text-amber-300" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-amber-100">Community Commons</h3>
                              <Sparkles className="w-4 h-4 text-amber-400" />
                            </div>
                            <p className="text-amber-300/80 text-sm mb-3">
                              Sacred repository for consciousness exploration - wisdom texts, practices, voices, and resources
                            </p>
                            <div className="flex flex-wrap gap-2">
                              <span className="px-2 py-1 bg-amber-500/10 text-amber-300 text-xs rounded-md">
                                Core Concepts
                              </span>
                              <span className="px-2 py-1 bg-amber-500/10 text-amber-300 text-xs rounded-md">
                                Sacred Practices
                              </span>
                              <span className="px-2 py-1 bg-amber-500/10 text-amber-300 text-xs rounded-md">
                                Wisdom Voices
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <ChevronRight className="w-5 h-5 text-amber-400 mb-2" />
                          <div className="text-sm text-amber-300/70">
                            <div>Library</div>
                            <div className="text-xs">Knowledge Base</div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                ) : (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-gradient-to-r from-slate-600/20 to-slate-700/20 border border-amber-500/40 rounded-xl p-6 cursor-pointer
                             hover:border-amber-500/60 transition-all ring-2 ring-amber-500/30"
                    onClick={() => commonsAccess.require()}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-amber-400/10 border border-amber-400/20 rounded-lg">
                          <Crown className="w-6 h-6 text-amber-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-amber-100">Community Commons</h3>
                            <span className="px-2 py-1 bg-amber-600/20 text-amber-300 text-xs rounded-md font-medium">
                              SACRED ACCESS
                            </span>
                          </div>
                          <p className="text-amber-300/60 text-sm mb-3">
                            Sacred repository for consciousness exploration - wisdom texts, practices, voices, and resources
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <span className="px-2 py-1 bg-amber-500/5 text-amber-300/50 text-xs rounded-md">
                              Core Concepts
                            </span>
                            <span className="px-2 py-1 bg-amber-500/5 text-amber-300/50 text-xs rounded-md">
                              Sacred Practices
                            </span>
                            <span className="px-2 py-1 bg-amber-500/5 text-amber-300/50 text-xs rounded-md">
                              Wisdom Voices
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Crown className="w-5 h-5 text-amber-400 mb-2" />
                        <div className="text-sm text-amber-300/70">
                          <div>Upgrade</div>
                          <div className="text-xs">Required</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {forumCategories.map((category) => (
                  <motion.div
                    key={category.id}
                    whileHover={{ scale: 1.02 }}
                    className={`
                      bg-slate-900/50 border border-amber-500/20 rounded-xl p-6 cursor-pointer
                      hover:border-amber-500/40 hover:bg-slate-800/50 transition-all
                      ${category.pinned ? 'ring-1 ring-amber-500/30' : ''}
                    `}
                    onClick={() => router.push(`/community/category/${category.id}`)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 bg-${category.color}/10 border border-${category.color}/30 rounded-lg`}>
                          <category.icon className={`w-6 h-6 text-${category.color}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-amber-100">{category.name}</h3>
                            {category.pinned && (
                              <Pin className="w-4 h-4 text-amber-400" />
                            )}
                          </div>
                          <p className="text-amber-300/70 text-sm mb-3">{category.description}</p>
                          {category.subcategories && (
                            <div className="flex flex-wrap gap-1">
                              {category.subcategories.map((sub, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 bg-amber-500/10 text-amber-300 text-xs rounded-md"
                                >
                                  {sub}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <ChevronRight className="w-5 h-5 text-amber-400 mb-2" />
                        <div className="text-sm text-amber-300/70">
                          <div>{category.posts} posts</div>
                          <div className="text-xs">{category.lastActivity}</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}