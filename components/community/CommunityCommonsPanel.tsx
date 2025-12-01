'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  BookOpen,
  MessageSquare,
  Lightbulb,
  Star,
  Clock,
  Plus,
  Search,
  Crown,
  Sparkles,
  Zap,
  Mountain,
  Brain,
  Feather,
  Globe,
  Flame,
  ChevronRight,
  Pin,
  User,
  Home,
  Compass,
  Loader2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { communityApi, type CommunityChannel, type CommunityStats } from '@/lib/community/api-service';
import { betaSession } from '@/lib/auth/betaSession';

interface CommunityCommonsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

// Icon mapping for dynamic rendering
const iconMap = {
  crown: Crown,
  sparkles: Sparkles,
  zap: Zap,
  star: Star,
  mountain: Mountain,
  brain: Brain,
  feather: Feather,
  globe: Globe,
  'message-square': MessageSquare
};

export default function CommunityCommonsPanel({ isOpen, onClose, className }: CommunityCommonsPanelProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  // Real data state
  const [channels, setChannels] = useState<CommunityChannel[]>([]);
  const [communityStats, setCommunityStats] = useState<CommunityStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  // Get real user from session
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Load data on mount and when panel opens
  useEffect(() => {
    if (isOpen) {
      loadCommunityData();
    }
  }, [isOpen]);

  // Get current user from beta session
  useEffect(() => {
    const sessionState = betaSession.restoreSession();
    if (sessionState.isAuthenticated && sessionState.user) {
      setCurrentUser({
        id: sessionState.user.id,
        name: sessionState.user.name || sessionState.user.username || 'Sacred Explorer',
        avatar: (sessionState.user.name || sessionState.user.username || 'SE').substring(0, 2).toUpperCase(),
        posts: 0, // Will be populated from API
        comments: 0,
        hearts: 0,
        breakthroughs: 0
      });
    } else {
      setCurrentUser({
        id: 'guest',
        name: 'Sacred Explorer',
        avatar: 'SE',
        posts: 0,
        comments: 0,
        hearts: 0,
        breakthroughs: 0
      });
    }
  }, []);

  const loadCommunityData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('🔄 [Community Panel] Loading community data');

      // Load channels and stats in parallel
      const [channelsResponse, statsResponse] = await Promise.all([
        communityApi.getChannels(),
        communityApi.getStats()
      ]);

      // Handle channels
      if (channelsResponse.success && channelsResponse.data) {
        setChannels(channelsResponse.data);
        console.log(`✅ [Community Panel] Loaded ${channelsResponse.data.length} channels`);
      } else {
        console.warn('⚠️ [Community Panel] Using fallback channels:', channelsResponse.error);
        setChannels(communityApi.getFallbackChannels());
      }

      // Handle stats
      if (statsResponse.success && statsResponse.data) {
        setCommunityStats(statsResponse.data);
        console.log('✅ [Community Panel] Loaded community stats');
      } else {
        console.warn('⚠️ [Community Panel] Using fallback stats:', statsResponse.error);
        setCommunityStats(communityApi.getFallbackStats());
      }

      setLastRefresh(new Date());

    } catch (err) {
      console.error('❌ [Community Panel] Error loading data:', err);
      setError('Failed to load community data');

      // Use fallback data
      setChannels(communityApi.getFallbackChannels());
      setCommunityStats(communityApi.getFallbackStats());
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    loadCommunityData();
  };

  const handleNavigate = (path: string) => {
    router.push(path);
    onClose();
  };

  const handleCategoryClick = (categorySlug: string) => {
    router.push(`/community/category/${categorySlug}`);
    onClose();
  };

  // Get icon component from mapping
  const getIconComponent = (iconName: string) => {
    return iconMap[iconName as keyof typeof iconMap] || MessageSquare;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]"
            onClick={onClose}
          />

          {/* Full Page Panel */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{
              type: 'spring',
              damping: 30,
              stiffness: 300
            }}
            className="fixed bottom-0 left-0 right-0 z-[100] max-h-[90vh] overflow-y-auto"
            style={{
              paddingBottom: 'env(safe-area-inset-bottom)',
            }}
          >
            <div className="bg-gradient-to-b from-slate-950 via-slate-900 to-amber-950/20 rounded-t-3xl shadow-2xl border-t border-amber-500/20">

              {/* Handle bar */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-12 h-1.5 bg-amber-400/30 rounded-full" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-amber-500/10">
                <div>
                  <h2 className="text-xl font-light text-amber-100 tracking-wide">
                    MAIA Community BBS
                  </h2>
                  <p className="text-xs text-amber-300/70 mt-0.5">
                    Sacred platform for elevated discourse
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full bg-amber-500/10 hover:bg-amber-500/20 transition-all text-amber-300"
                >
                  ×
                </button>
              </div>

              {/* Quick Actions */}
              <div className="flex justify-between items-center px-6 py-3 bg-amber-500/5">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSearchQuery('')}
                    className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-md hover:bg-amber-500/20 transition-colors text-xs"
                    disabled={isLoading}
                  >
                    <Search className="w-3 h-3" />
                    Search
                  </button>
                  <button
                    onClick={() => handleNavigate('/community/new-post')}
                    className="flex items-center gap-2 px-3 py-1.5 bg-amber-600 text-amber-50 rounded-md hover:bg-amber-700 transition-colors text-xs disabled:opacity-50"
                    disabled={isLoading}
                  >
                    <Plus className="w-3 h-3" />
                    New Post
                  </button>
                  <button
                    onClick={handleRefresh}
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 border border-amber-500/20 text-amber-300 rounded-md hover:bg-slate-700 transition-colors text-xs disabled:opacity-50"
                    disabled={isLoading}
                    title="Refresh community data"
                  >
                    <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  {lastRefresh && (
                    <span className="text-xs text-amber-400/60">
                      Updated {lastRefresh.toLocaleTimeString()}
                    </span>
                  )}
                  <button
                    onClick={() => handleNavigate('/community')}
                    className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    Open Full BBS →
                  </button>
                </div>
              </div>

              {/* Main Content - BBS Layout */}
              <div className="px-6 py-4 space-y-4">

                {/* Community Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-900/50 border border-amber-500/20 rounded-lg p-3">
                    <h3 className="text-sm font-semibold text-amber-100 mb-2 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Community Vitals
                    </h3>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-amber-300/70">Members</span>
                        <span className="text-amber-300 font-medium">{communityStats?.community.totalMembers || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-amber-300/70">Online</span>
                        <span className="text-emerald-400 font-medium">{communityStats?.community.onlineNow || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-amber-300/70">Posts</span>
                        <span className="text-amber-300 font-medium">{communityStats?.community.totalPosts || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-amber-300/70">Breakthroughs</span>
                        <span className="text-yellow-400 font-medium">{communityStats?.community.breakthroughs || 0}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900/50 border border-amber-500/20 rounded-lg p-3">
                    <h3 className="text-sm font-semibold text-amber-100 mb-2 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Your Profile
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center text-amber-50 font-bold text-xs">
                        {currentUser.avatar}
                      </div>
                      <div>
                        <div className="text-xs font-medium text-amber-100">{currentUser.name}</div>
                        <div className="text-xs text-amber-300/70">Beta Explorer</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-center">
                      <div>
                        <div className="text-amber-300 font-bold">{currentUser.posts}</div>
                        <div className="text-amber-300/70">Posts</div>
                      </div>
                      <div>
                        <div className="text-yellow-400 font-bold">{currentUser.breakthroughs}</div>
                        <div className="text-amber-300/70">Breakthroughs</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Forum Categories */}
                <div>
                  <h3 className="text-sm font-semibold text-amber-100 mb-3 flex items-center gap-2">
                    <Compass className="w-4 h-4" />
                    Sacred Territories
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {isLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
                        <span className="ml-2 text-amber-300 text-sm">Loading channels...</span>
                      </div>
                    ) : error ? (
                      <div className="flex items-center justify-center py-8 text-center">
                        <div>
                          <AlertCircle className="w-6 h-6 text-red-400 mx-auto mb-2" />
                          <p className="text-red-300 text-sm mb-3">{error}</p>
                          <button
                            onClick={handleRefresh}
                            className="text-xs text-amber-400 hover:text-amber-300"
                          >
                            Try again
                          </button>
                        </div>
                      </div>
                    ) : channels.length === 0 ? (
                      <div className="text-center py-8 text-amber-300/70 text-sm">
                        No channels available
                      </div>
                    ) : (
                      channels.map((channel) => {
                        const IconComponent = getIconComponent(channel.icon);
                        return (
                          <motion.button
                            key={channel.id}
                            onClick={() => handleCategoryClick(channel.slug)}
                            className="w-full p-3 bg-slate-900/50 border border-amber-500/20 rounded-lg hover:border-amber-500/40 hover:bg-slate-800/50 transition-all text-left"
                            whileHover={{ scale: 1.01 }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                                  <IconComponent className="w-4 h-4 text-amber-400" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <h4 className="text-xs font-semibold text-amber-100">{channel.name}</h4>
                                    {channel.pinned && <Pin className="w-3 h-3 text-amber-400" />}
                                  </div>
                                  <p className="text-xs text-amber-300/70 mt-0.5">{channel.description}</p>
                                </div>
                              </div>
                              <div className="text-right text-xs">
                                <ChevronRight className="w-4 h-4 text-amber-400 mb-1" />
                                <div className="text-amber-300/70">
                                  <div>{channel.posts} posts</div>
                                  <div className="text-xs">{channel.lastActivity}</div>
                                </div>
                              </div>
                            </div>
                          </motion.button>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Sacred Activity */}
                <div>
                  <h3 className="text-sm font-semibold text-amber-100 mb-3 flex items-center gap-2">
                    <Flame className="w-4 h-4" />
                    Sacred Flow
                  </h3>
                  <div className="space-y-2">
                    {isLoading ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                        <span className="ml-2 text-amber-300 text-xs">Loading activity...</span>
                      </div>
                    ) : communityStats?.recentActivity && communityStats.recentActivity.length > 0 ? (
                      communityStats.recentActivity.map((activity, index) => (
                        <div key={index} className="text-xs bg-slate-900/30 border border-amber-500/10 rounded-lg p-2">
                          <span className="text-amber-300 font-medium">{activity.user}</span>
                          <span className="text-amber-300/70"> {activity.action} </span>
                          <span className="text-amber-400">{activity.category}</span>
                          <div className="text-xs text-amber-300/50 mt-1">{activity.time} ago</div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-amber-300/70 text-xs">
                        No recent activity
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}