'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  MessageSquare,
  Plus,
  Search as SearchIcon,
  Clock,
  User,
  Heart,
  Eye,
  Pin,
  Sparkles,
  ChevronRight,
  Users,
  Flame,
  Globe,
  BookOpen,
  Lightbulb,
  Star,
  Crown,
  Zap,
  Mountain,
  Brain,
  Feather,
  Wrench,
  Loader2,
  AlertCircle
} from 'lucide-react';

import { apiFetch } from '@/lib/http/apiBase';

// Territory type from API
interface Territory {
  id: string;
  name: string;
  slug: string;
  description: string;
  is_technical: boolean;
  child_count?: number;
  post_count?: number;
  total_posts?: number;
}

// Icon mapping for dynamic rendering
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  crown: Crown,
  sparkles: Sparkles,
  zap: Zap,
  star: Star,
  mountain: Mountain,
  brain: Brain,
  feather: Feather,
  globe: Globe,
  'message-square': MessageSquare,
  flame: Flame,
  lightbulb: Lightbulb,
  'book-open': BookOpen,
  users: Users,
  wrench: Wrench
};

// Post type from API — matches community_posts columns
interface Post {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  user_name: string;
  user_id: string;
  territory_slug: string;
  content_type: string;
  created_at: string;
  comment_count: number;
  heart_count: number;
  view_count: number;
  is_pinned: boolean;
}

// Map slug to icon - matches actual territory slugs from database
function getTerritoryIcon(slug: string): React.ComponentType<{ className?: string }> {
  const map: Record<string, React.ComponentType<{ className?: string }>> = {
    'threshold': Globe,       // 🚪 Where every journey begins
    'seeking': SearchIcon,    // 🔍 Questions and curiosity
    'practice': Mountain,     // 🧘 Where wisdom becomes embodied
    'breakthrough': Zap,      // ✨ Moments of shift and insight
    'offering': Heart,        // 🎁 Give back what you've learned
    'circle': Users,          // ⭕ Support and connection
    'foundation': Crown,      // 🏛️ Core teachings
    'workshop': Wrench        // ⚗️ Technical discussions
  };
  return map[slug] || MessageSquare;
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

// Territory-specific empty states — each room has its own voice
const TERRITORY_EMPTY: Record<string, { heading: string; body: string; cta: string }> = {
  threshold: {
    heading: 'This is where journeys begin',
    body: 'Introduce yourself. Share what brought you here. Name what you are seeking.',
    cta: 'Open the Threshold',
  },
  seeking: {
    heading: 'Questions welcome here',
    body: 'What is alive in you right now? What are you curious about? What refuses to resolve?',
    cta: 'Ask Something Real',
  },
  practice: {
    heading: 'A quiet room for practitioners',
    body: 'Share what you are doing — a ritual, a discipline, an experiment in living. What works. What doesn\'t.',
    cta: 'Share a Practice',
  },
  breakthrough: {
    heading: 'Something shifted',
    body: 'Breakthroughs deserve witness. If something moved in you — an insight, a release, a sudden clarity — name it here.',
    cta: 'Name What Shifted',
  },
  offering: {
    heading: 'Give back what you\'ve learned',
    body: 'Essays, guides, reviews, teachings. What do you know now that you wish someone had told you?',
    cta: 'Make an Offering',
  },
  circle: {
    heading: 'We journey alone, but not in isolation',
    body: 'Support, connection, and mutual recognition. What do you need? What can you hold for someone else?',
    cta: 'Gather Here',
  },
  foundation: {
    heading: 'Core teachings live here',
    body: 'The foundational wisdom this community is built on. Engage with it, question it, deepen it.',
    cta: 'Engage the Foundation',
  },
  workshop: {
    heading: 'The lab is open',
    body: 'Technical discussions, platform development, and consciousness technology. Build something.',
    cta: 'Start Building',
  },
};

function EmptyTerritory({ slug, icon, onPost }: { slug: string; icon: React.ReactNode; onPost: () => void }) {
  const voice = TERRITORY_EMPTY[slug] || {
    heading: 'This territory is open',
    body: 'No conversations have gathered here yet. Be the first to share something.',
    cta: 'Start a Conversation',
  };

  return (
    <div className="bg-slate-900/30 border border-amber-500/10 rounded-xl p-12 text-center">
      <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-amber-500/5 border border-amber-500/20 flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-lg font-light text-amber-100/80 mb-2">
        {voice.heading}
      </h3>
      <p className="text-amber-300/40 text-sm max-w-md mx-auto leading-relaxed mb-6">
        {voice.body}
      </p>
      <button
        onClick={onPost}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 text-amber-50 rounded-lg hover:bg-amber-700 transition-colors text-sm"
      >
        <Plus className="w-4 h-4" />
        {voice.cta}
      </button>
    </div>
  );
}

export default function TerritoryPageWrapper() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  // State for real territory data
  const [territory, setTerritory] = useState<Territory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);

  // Load territory data + posts
  useEffect(() => {
    loadTerritoryData();
    loadPosts();
  }, [slug]);

  const loadTerritoryData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiFetch('/api/community/territories');
      const data = await response.json();

      if ((data.ok || data.success) && data.territories) {
        const foundTerritory = data.territories.find((t: Territory) => t.slug === slug);
        if (foundTerritory) {
          setTerritory(foundTerritory);
        } else {
          setError(`Territory "${slug}" not found`);
        }
      } else {
        setError('Failed to load territory data');
      }
    } catch (err) {
      console.error('Error loading territory:', err);
      setError('Failed to load territory');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPosts = async () => {
    try {
      setPostsLoading(true);
      const response = await apiFetch(`/api/community/posts?territory=${slug}&limit=20`);
      const data = await response.json();
      if (data.ok && data.posts) {
        setPosts(data.posts);
      }
    } catch (err) {
      console.error('Error loading posts:', err);
    } finally {
      setPostsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-amber-950/20">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-amber-400 mx-auto mb-4" />
            <p className="text-amber-300">Loading territory...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !territory) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-amber-950/20">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-red-300 mb-2">Territory Not Found</h1>
            <p className="text-red-300/70 mb-4">{error}</p>
            <button
              onClick={() => router.push('/maia/community')}
              className="px-4 py-2 bg-amber-600 text-amber-50 rounded-lg hover:bg-amber-700 transition-colors"
            >
              Return to Community
            </button>
          </div>
        </div>
      </div>
    );
  }

  const IconComponent = getTerritoryIcon(territory.slug);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-amber-950/20">
      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/maia/community')}
              className="flex items-center gap-2 text-amber-300 hover:text-amber-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Return to Community
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-lg hover:bg-amber-500/20 transition-colors">
              <SearchIcon className="w-4 h-4" />
              Search
            </button>
            <button
              onClick={() => router.push(`/maia/community/new-post?territory=${slug}`)}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-amber-50 rounded-lg hover:bg-amber-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Post
            </button>
          </div>
        </div>

        {/* Territory Header */}
        <div className={`border rounded-xl p-8 mb-8 ${territory.is_technical ? 'bg-slate-800/30 border-slate-600/30' : 'bg-slate-900/50 border-amber-500/20'}`}>
          <div className="flex items-start gap-6">
            <div className={`p-4 rounded-xl ${territory.is_technical ? 'bg-slate-700/30 border border-slate-600/30' : 'bg-amber-500/10 border border-amber-500/30'}`}>
              <IconComponent className={`w-8 h-8 ${territory.is_technical ? 'text-slate-400' : 'text-amber-400'}`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h1 className={`text-2xl font-light ${territory.is_technical ? 'text-slate-200' : 'text-amber-100'}`}>
                  {territory.name}
                </h1>
                {territory.is_technical && (
                  <span className="text-xs px-2 py-0.5 bg-slate-700/50 text-slate-400 rounded">
                    Technical
                  </span>
                )}
              </div>
              <p className={`mb-4 leading-relaxed ${territory.is_technical ? 'text-slate-400' : 'text-amber-300/70'}`}>
                {territory.description}
              </p>
              <div className={`flex items-center gap-6 text-sm ${territory.is_technical ? 'text-slate-500' : 'text-amber-300/60'}`}>
                <span>{territory.total_posts || territory.post_count || 0} posts</span>
                {territory.child_count && territory.child_count > 0 && (
                  <span>{territory.child_count} sub-territories</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Posts List */}
        <div className="space-y-4">
          {postsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
              <span className="ml-3 text-amber-300/60 text-sm">Loading posts...</span>
            </div>
          ) : posts.length === 0 ? (
            /* Honest empty state — each territory has its own voice */
            <EmptyTerritory slug={slug} icon={<IconComponent className="w-8 h-8 text-amber-400/40" />} onPost={() => router.push(`/maia/community/new-post?territory=${slug}`)} />
          ) : (
            posts.map((post) => {
              const timeAgo = formatTimeAgo(post.created_at);
              const isBreakthrough = post.content_type === 'breakthrough';
              return (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`
                    bg-slate-900/30 border border-amber-500/20 rounded-xl p-6
                    hover:border-amber-500/40 hover:bg-slate-800/30 transition-all cursor-pointer
                    ${post.is_pinned ? 'ring-1 ring-amber-500/30' : ''}
                    ${isBreakthrough ? 'border-yellow-500/30' : ''}
                  `}
                  onClick={() => router.push(`/maia/community/post/${post.id}`)}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center text-amber-50 font-bold text-sm">
                      {(post.user_name || '??').substring(0, 2).toUpperCase()}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {post.is_pinned && <Pin className="w-4 h-4 text-amber-400" />}
                        {isBreakthrough && <Sparkles className="w-4 h-4 text-yellow-400" />}
                        <h3 className="font-medium text-amber-100 hover:text-amber-50 transition-colors">
                          {post.title}
                        </h3>
                      </div>

                      <p className="text-amber-300/70 text-sm mb-3 leading-relaxed line-clamp-2">
                        {post.excerpt || post.content}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-amber-300/60">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {post.user_name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {timeAgo}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {post.comment_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {post.heart_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {post.view_count}
                        </span>
                      </div>
                    </div>

                    <ChevronRight className="w-5 h-5 text-amber-400/60" />
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Load More — only show when there are posts */}
        {posts.length >= 20 && (
          <div className="mt-8 text-center">
            <button className="px-6 py-3 bg-slate-800/50 border border-amber-500/30 text-amber-300 rounded-lg hover:bg-slate-700/50 transition-colors">
              Load More Posts
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
