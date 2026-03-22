'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Clock, ArrowLeft, PenLine } from 'lucide-react';

interface Song {
  id: string;
  title: string;
  seed_prompt: string | null;
  updated_at: string;
  last_opened_at: string | null;
  created_at: string;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function SongsPage() {
  const router = useRouter();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/songwriter/songs?limit=50')
      .then(r => r.ok ? r.json() : { songs: [] })
      .then(data => setSongs(data.songs ?? []))
      .catch(() => setSongs([]))
      .finally(() => setLoading(false));
  }, []);

  function openSong(id: string) {
    router.push(`/maia/songwriter?resume=${id}`);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0D0F12] via-[#1A1D26] to-[#0D0F12]">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="max-w-2xl mx-auto px-4 pt-12 pb-24"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <button
            onClick={() => router.push('/maia/songwriter')}
            className="flex items-center gap-1.5 text-xs text-white/25 hover:text-white/50 transition-colors"
            style={{ fontFamily: 'Spectral, Georgia, serif' }}
          >
            <ArrowLeft size={12} />
            Back
          </button>
          <h1
            className="text-sm uppercase tracking-widest text-white/30 font-light"
            style={{ fontFamily: 'Spectral, Georgia, serif' }}
          >
            Your Songs
          </h1>
          <button
            onClick={() => router.push('/maia/songwriter')}
            className="flex items-center gap-1.5 text-xs text-amber-400/50 hover:text-amber-400/80 transition-colors"
            style={{ fontFamily: 'Spectral, Georgia, serif' }}
          >
            <PenLine size={12} />
            New
          </button>
        </div>

        {/* List */}
        {loading ? (
          <div className="text-white/20 text-sm text-center pt-16" style={{ fontFamily: 'Spectral, Georgia, serif' }}>
            Loading...
          </div>
        ) : songs.length === 0 ? (
          <div className="text-center pt-16 space-y-3">
            <p className="text-white/25 text-sm" style={{ fontFamily: 'Spectral, Georgia, serif' }}>
              No songs yet.
            </p>
            <button
              onClick={() => router.push('/maia/songwriter')}
              className="text-xs text-amber-400/50 hover:text-amber-400/80 transition-colors"
              style={{ fontFamily: 'Spectral, Georgia, serif' }}
            >
              Start your first one
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {songs.map((song, i) => (
              <motion.button
                key={song.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.25 }}
                onClick={() => openSong(song.id)}
                className="w-full flex items-center justify-between px-4 py-3
                           bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06]
                           hover:border-white/10 rounded-xl transition-all duration-150 text-left group"
              >
                <div className="min-w-0 flex-1">
                  <div
                    className="text-white/65 group-hover:text-white/85 text-sm truncate transition-colors"
                    style={{ fontFamily: 'Spectral, Georgia, serif' }}
                  >
                    {song.title}
                  </div>
                  {song.seed_prompt && (
                    <div
                      className="text-white/20 text-xs truncate mt-0.5"
                      style={{ fontFamily: 'Spectral, Georgia, serif' }}
                    >
                      {song.seed_prompt}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 text-white/20 text-xs ml-4 shrink-0">
                  <Clock size={10} />
                  {timeAgo(song.last_opened_at ?? song.updated_at)}
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
