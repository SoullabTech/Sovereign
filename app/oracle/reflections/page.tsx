'use client';

/**
 * Divination Reflections Page
 *
 * A sacred archive of saved divination readings
 * Allows members to review, reflect on, and favorite their readings
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Star,
  Hexagon,
  Moon,
  Calendar,
  Heart,
  Trash2,
  MessageSquare,
  Filter,
  Loader2,
  BookOpen,
  Sparkles
} from 'lucide-react';

type DivinationType = 'all' | 'iching' | 'tarot' | 'runes';

interface BaseReading {
  id: string;
  type: 'iching' | 'tarot' | 'runes';
  question?: string;
  interpretation_text?: string;
  guidance_text?: string;
  is_favorite: boolean;
  created_at: string;
}

interface IChingReading extends BaseReading {
  type: 'iching';
  primary_hex: number;
  primary_hex_name: string;
  lower_trigram: string;
  upper_trigram: string;
  relating_hex?: number;
  relating_hex_name?: string;
}

interface TarotReading extends BaseReading {
  type: 'tarot';
  spread_type: string;
  cards_json: Array<{
    position: string;
    card: string;
    reversed: boolean;
  }>;
}

interface RunesReading extends BaseReading {
  type: 'runes';
  cast_type: string;
  runes_json: Array<{
    position: string;
    rune: string;
    reversed: boolean;
  }>;
  wyrd_message?: string;
}

type DivinationReading = IChingReading | TarotReading | RunesReading;

export default function DivinationReflectionsPage() {
  const router = useRouter();
  const [readings, setReadings] = useState<DivinationReading[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<DivinationType>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [expandedReading, setExpandedReading] = useState<string | null>(null);

  useEffect(() => {
    fetchReadings();
  }, [filter, showFavoritesOnly]);

  const fetchReadings = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') {
        params.append('type', filter);
      }
      if (showFavoritesOnly) {
        params.append('favorites', 'true');
      }

      const response = await fetch(`/api/divination/list?${params}`);
      const data = await response.json();

      if (data.success) {
        setReadings(data.readings);
      }
    } catch (error) {
      console.error('Failed to fetch readings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = async (reading: DivinationReading) => {
    try {
      const response = await fetch('/api/divination/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: reading.type,
          readingId: reading.id,
          action: 'favorite',
          value: !reading.is_favorite
        })
      });

      const data = await response.json();
      if (data.success) {
        setReadings(prev =>
          prev.map(r =>
            r.id === reading.id ? { ...r, is_favorite: !r.is_favorite } : r
          )
        );
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const archiveReading = async (reading: DivinationReading) => {
    try {
      const response = await fetch('/api/divination/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: reading.type,
          readingId: reading.id,
          action: 'archive'
        })
      });

      const data = await response.json();
      if (data.success) {
        setReadings(prev => prev.filter(r => r.id !== reading.id));
      }
    } catch (error) {
      console.error('Failed to archive reading:', error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'iching':
        return <Hexagon className="w-5 h-5 text-amber-400" />;
      case 'tarot':
        return <Star className="w-5 h-5 text-purple-400" />;
      case 'runes':
        return <Moon className="w-5 h-5 text-slate-400" />;
      default:
        return <BookOpen className="w-5 h-5 text-gray-400" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'iching':
        return 'I Ching';
      case 'tarot':
        return 'Tarot';
      case 'runes':
        return 'Runes';
      default:
        return type;
    }
  };

  const getReadingSummary = (reading: DivinationReading) => {
    switch (reading.type) {
      case 'iching':
        return `Hexagram ${reading.primary_hex}: ${reading.primary_hex_name}`;
      case 'tarot':
        const cardNames = reading.cards_json.slice(0, 3).map(c => c.card).join(', ');
        return cardNames + (reading.cards_json.length > 3 ? '...' : '');
      case 'runes':
        const runeNames = reading.runes_json.slice(0, 3).map(r => r.rune).join(', ');
        return runeNames + (reading.runes_json.length > 3 ? '...' : '');
      default:
        return 'Reading';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const consultWithMaia = (reading: DivinationReading) => {
    let context = '';

    if (reading.type === 'iching') {
      const r = reading as IChingReading;
      context = `I'd like to revisit my I Ching reading from ${formatDate(r.created_at)}.\n\n` +
        `Question: ${r.question || 'No specific question'}\n\n` +
        `Hexagram ${r.primary_hex}: ${r.primary_hex_name}\n` +
        `Trigrams: ${r.upper_trigram} over ${r.lower_trigram}\n\n` +
        (r.interpretation_text ? `Interpretation: ${r.interpretation_text}\n\n` : '') +
        `Help me understand how this reading has unfolded in my life.`;
    } else if (reading.type === 'tarot') {
      const r = reading as TarotReading;
      const cardsSummary = r.cards_json.map(c =>
        `${c.card}${c.reversed ? ' (R)' : ''} - ${c.position}`
      ).join('\n');
      context = `I'd like to revisit my Tarot reading from ${formatDate(r.created_at)}.\n\n` +
        `Question: ${r.question || 'No specific question'}\n\n` +
        `Cards:\n${cardsSummary}\n\n` +
        (r.interpretation_text ? `Interpretation: ${r.interpretation_text}\n\n` : '') +
        `Help me understand how this reading has unfolded in my life.`;
    } else if (reading.type === 'runes') {
      const r = reading as RunesReading;
      const runesSummary = r.runes_json.map(rn =>
        `${rn.rune}${rn.reversed ? ' (Merkstave)' : ''} - ${rn.position}`
      ).join('\n');
      context = `I'd like to revisit my Rune reading from ${formatDate(r.created_at)}.\n\n` +
        `Question: ${r.question || 'No specific question'}\n\n` +
        `Runes:\n${runesSummary}\n\n` +
        (r.wyrd_message ? `Message from Wyrd: ${r.wyrd_message}\n\n` : '') +
        (r.interpretation_text ? `Interpretation: ${r.interpretation_text}\n\n` : '') +
        `Help me understand how this reading has unfolded in my life.`;
    }

    router.push(`/maia?context=${encodeURIComponent(context)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-950 via-indigo-950 to-slate-950 relative overflow-hidden">
      {/* Atmospheric background */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-violet-400/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.1, 0.4, 0.1],
            }}
            transition={{
              duration: 5 + Math.random() * 5,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center px-4 py-12">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <button
              onClick={() => router.push('/oracle')}
              className="flex items-center gap-2 text-violet-400/70 hover:text-violet-300 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm">Back to Oracle</span>
            </button>

            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-violet-400" />
              <h1 className="text-2xl font-light text-violet-200 tracking-wide">Divination Reflections</h1>
            </div>

            <div className="w-24" />
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap gap-3 mb-8"
          >
            <div className="flex gap-2">
              {(['all', 'iching', 'tarot', 'runes'] as DivinationType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filter === type
                      ? 'bg-violet-600 text-white'
                      : 'bg-violet-900/30 text-violet-300/70 hover:bg-violet-800/40'
                  }`}
                >
                  {type === 'all' ? 'All' : getTypeLabel(type)}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                showFavoritesOnly
                  ? 'bg-pink-600 text-white'
                  : 'bg-violet-900/30 text-violet-300/70 hover:bg-violet-800/40'
              }`}
            >
              <Heart className={`w-4 h-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
              Favorites
            </button>
          </motion.div>

          {/* Readings List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
            </div>
          ) : readings.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <BookOpen className="w-16 h-16 text-violet-400/30 mx-auto mb-4" />
              <h3 className="text-xl text-violet-200 mb-2">No readings saved yet</h3>
              <p className="text-violet-400/60 mb-6">
                Visit the Oracle to receive a reading and save it for reflection
              </p>
              <button
                onClick={() => router.push('/oracle')}
                className="px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-lg transition-colors"
              >
                Consult the Oracle
              </button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <AnimatePresence>
                {readings.map((reading, index) => (
                  <motion.div
                    key={reading.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-gradient-to-br from-violet-900/30 via-indigo-900/20 to-slate-900/30 backdrop-blur-xl border border-violet-500/20 rounded-xl overflow-hidden"
                  >
                    {/* Reading Header */}
                    <div
                      className="p-6 cursor-pointer"
                      onClick={() => setExpandedReading(
                        expandedReading === reading.id ? null : reading.id
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="mt-1">
                            {getTypeIcon(reading.type)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs text-violet-400/60 uppercase tracking-wider">
                                {getTypeLabel(reading.type)}
                              </span>
                              {reading.is_favorite && (
                                <Heart className="w-3 h-3 text-pink-400 fill-current" />
                              )}
                            </div>
                            <h3 className="text-lg font-semibold text-violet-100 mb-1">
                              {getReadingSummary(reading)}
                            </h3>
                            {reading.question && (
                              <p className="text-violet-300/60 text-sm line-clamp-1">
                                Q: {reading.question}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-violet-400/50 text-sm">
                          <Calendar className="w-4 h-4" />
                          {formatDate(reading.created_at)}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    <AnimatePresence>
                      {expandedReading === reading.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 pb-6 border-t border-violet-500/20 pt-4">
                            {/* Interpretation */}
                            {reading.interpretation_text && (
                              <div className="mb-4">
                                <h4 className="text-violet-300/80 font-medium mb-2">Interpretation:</h4>
                                <p className="text-violet-200/60 text-sm leading-relaxed">
                                  {reading.interpretation_text}
                                </p>
                              </div>
                            )}

                            {/* Guidance */}
                            {reading.guidance_text && (
                              <div className="mb-4">
                                <h4 className="text-violet-300/80 font-medium mb-2">Guidance:</h4>
                                <p className="text-violet-200/60 text-sm leading-relaxed">
                                  {reading.guidance_text}
                                </p>
                              </div>
                            )}

                            {/* Type-specific details */}
                            {reading.type === 'tarot' && (
                              <div className="mb-4">
                                <h4 className="text-violet-300/80 font-medium mb-2">Cards:</h4>
                                <div className="flex flex-wrap gap-2">
                                  {(reading as TarotReading).cards_json.map((card, i) => (
                                    <span
                                      key={i}
                                      className="px-3 py-1 bg-violet-800/30 rounded text-xs text-violet-200"
                                    >
                                      {card.card}{card.reversed ? ' (R)' : ''} - {card.position}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {reading.type === 'runes' && (
                              <>
                                <div className="mb-4">
                                  <h4 className="text-violet-300/80 font-medium mb-2">Runes:</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {(reading as RunesReading).runes_json.map((rune, i) => (
                                      <span
                                        key={i}
                                        className="px-3 py-1 bg-slate-800/30 rounded text-xs text-slate-200"
                                      >
                                        {rune.rune}{rune.reversed ? ' (M)' : ''} - {rune.position}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                {(reading as RunesReading).wyrd_message && (
                                  <div className="mb-4">
                                    <h4 className="text-violet-300/80 font-medium mb-2">Message from Wyrd:</h4>
                                    <p className="text-violet-200/60 text-sm italic">
                                      {(reading as RunesReading).wyrd_message}
                                    </p>
                                  </div>
                                )}
                              </>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3 mt-6">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  consultWithMaia(reading);
                                }}
                                className="flex-1 px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2"
                              >
                                <MessageSquare className="w-4 h-4" />
                                Explore with MAIA
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavorite(reading);
                                }}
                                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                                  reading.is_favorite
                                    ? 'bg-pink-600/20 text-pink-300 hover:bg-pink-600/30'
                                    : 'bg-violet-900/30 text-violet-300 hover:bg-violet-800/40'
                                }`}
                              >
                                <Heart className={`w-4 h-4 ${reading.is_favorite ? 'fill-current' : ''}`} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm('Archive this reading? It will be hidden from view.')) {
                                    archiveReading(reading);
                                  }
                                }}
                                className="px-4 py-2 bg-red-900/20 text-red-300 hover:bg-red-900/30 rounded-lg transition-all flex items-center gap-2"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
