'use client';

/**
 * Soullab Guides - Member Video Library
 *
 * Browse explainer videos about MAIA, the Lab, Studio, and more.
 * Videos are produced via HeyGen from admin-generated scripts.
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Play,
  Star,
  Clock,
  X,
  Loader2,
  Video,
  ExternalLink,
} from 'lucide-react';

interface MemberVideo {
  id: string;
  title: string;
  description: string | null;
  heygen_url: string;
  thumbnail_url: string | null;
  tags: string[];
  is_featured: boolean;
  duration_seconds: number | null;
  created_at: string;
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return '';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function GuidesPage() {
  const router = useRouter();
  const [videos, setVideos] = useState<MemberVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<MemberVideo | null>(null);

  useEffect(() => {
    async function fetchVideos() {
      try {
        const res = await fetch('/api/library/videos');
        if (!res.ok) {
          if (res.status === 401) {
            throw new Error('Please sign in to view guides');
          }
          throw new Error('Failed to load videos');
        }
        const data = await res.json();
        setVideos(data.videos || []);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchVideos();
  }, []);

  const featured = videos.filter((v) => v.is_featured);
  const regular = videos.filter((v) => !v.is_featured);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#1a1f2e] to-[#16213e] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#D4B896] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#1a1f2e] to-[#16213e]">
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <button
          onClick={() => router.push('/labtools')}
          className="flex items-center gap-2 text-sm text-white/50 hover:text-white/80 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Lab
        </button>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-2xl bg-gradient-to-br from-[#D4B896]/20 to-[#D4B896]/5 border border-[#D4B896]/20">
            <Video className="w-8 h-8 text-[#D4B896]" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Soullab Guides</h1>
          <p className="text-white/50 text-sm max-w-md mx-auto">
            Short videos to help you get the most from MAIA, the Lab, and Studio.
          </p>
        </motion.div>

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!error && videos.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <Video className="w-8 h-8 text-white/30" />
            </div>
            <h2 className="text-lg font-medium text-white/80 mb-2">Coming Soon</h2>
            <p className="text-white/50 text-sm">
              We're preparing guides to help you explore Soullab.
            </p>
          </div>
        )}

        {/* Featured Section */}
        {featured.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12"
          >
            <div className="flex items-center gap-2 mb-6">
              <Star className="w-4 h-4 text-[#D4B896]" />
              <h2 className="text-sm font-medium text-[#D4B896] uppercase tracking-wider">
                Featured
              </h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {featured.map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  featured
                  onClick={() => setSelectedVideo(video)}
                />
              ))}
            </div>
          </motion.section>
        )}

        {/* Regular Videos */}
        {regular.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {featured.length > 0 && (
              <h2 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-6">
                All Guides
              </h2>
            )}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {regular.map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  onClick={() => setSelectedVideo(video)}
                />
              ))}
            </div>
          </motion.section>
        )}
      </div>

      {/* Video Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <VideoModal
            video={selectedVideo}
            onClose={() => setSelectedVideo(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function VideoCard({
  video,
  featured = false,
  onClick,
}: {
  video: MemberVideo;
  featured?: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        w-full text-left rounded-2xl border border-white/10 bg-white/[0.02]
        hover:bg-white/[0.04] hover:border-white/20 transition-all
        overflow-hidden group
        ${featured ? 'p-6' : 'p-4'}
      `}
    >
      {/* Thumbnail or Placeholder */}
      <div
        className={`
          relative rounded-xl bg-gradient-to-br from-[#D4B896]/10 to-[#D4B896]/5
          flex items-center justify-center mb-4 overflow-hidden
          ${featured ? 'h-40' : 'h-32'}
        `}
      >
        {video.thumbnail_url ? (
          <img
            src={video.thumbnail_url}
            alt={video.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <Video className="w-10 h-10 text-[#D4B896]/40" />
        )}

        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-12 h-12 rounded-full bg-[#D4B896]/90 flex items-center justify-center">
            <Play className="w-5 h-5 text-[#0a0f1a] ml-0.5" />
          </div>
        </div>

        {/* Duration badge */}
        {video.duration_seconds && (
          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/60 text-white text-xs flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDuration(video.duration_seconds)}
          </div>
        )}
      </div>

      {/* Content */}
      <h3 className={`font-medium text-white mb-1 ${featured ? 'text-lg' : 'text-sm'}`}>
        {video.title}
      </h3>
      {video.description && (
        <p className="text-white/50 text-xs line-clamp-2">{video.description}</p>
      )}

      {/* Tags */}
      {video.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {video.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded bg-white/5 text-white/40 text-[10px] uppercase tracking-wider"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </motion.button>
  );
}

function VideoModal({
  video,
  onClose,
}: {
  video: MemberVideo;
  onClose: () => void;
}) {
  // Check if HeyGen URL is embeddable or needs external link
  const isEmbeddable = video.heygen_url.includes('embed') ||
    video.heygen_url.includes('youtube') ||
    video.heygen_url.includes('vimeo');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl
                   bg-gradient-to-br from-[#1a1f2e] to-[#0f1419]
                   border border-white/10 shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-white truncate">
              {video.title}
            </h2>
            {video.description && (
              <p className="text-white/50 text-sm mt-1 line-clamp-2">
                {video.description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Content */}
        <div className="flex-1 p-6">
          {isEmbeddable ? (
            <div className="aspect-video rounded-xl overflow-hidden bg-black">
              <iframe
                src={video.heygen_url}
                className="w-full h-full"
                allow="autoplay; fullscreen"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="aspect-video rounded-xl bg-gradient-to-br from-[#D4B896]/10 to-[#D4B896]/5 flex flex-col items-center justify-center gap-4">
              <Video className="w-16 h-16 text-[#D4B896]/40" />
              <p className="text-white/50 text-sm text-center max-w-xs">
                This video opens in a new tab for the best viewing experience.
              </p>
              <a
                href={video.heygen_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-xl bg-[#D4B896]/20 border border-[#D4B896]/30
                         text-[#D4B896] text-sm font-medium
                         hover:bg-[#D4B896]/30 transition-all
                         flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                Watch Video
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>

        {/* Tags */}
        {video.tags.length > 0 && (
          <div className="px-6 py-4 border-t border-white/10">
            <div className="flex flex-wrap gap-2">
              {video.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full bg-white/5 text-white/50 text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
