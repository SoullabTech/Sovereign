'use client';

/**
 * Divination Reflections Page
 *
 * A sacred archive of saved divination readings
 * Clean matte dark design
 */

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiFetch } from '@/lib/http/apiBase';
import { readability } from '@/lib/house/readability';
import {
  ArrowLeft,
  Star,
  Hexagon,
  Moon,
  Calendar,
  Heart,
  Trash2,
  MessageSquare,
  Loader2,
  BookOpen,
  ChevronDown,
  ChevronUp,
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

function parseReadingTarget(value: string | null): { type: Exclude<DivinationType, 'all'>; id: string } | null {
  if (!value) return null;
  const split = value.indexOf(':');
  if (split <= 0) return null;
  const type = value.slice(0, split);
  const id = value.slice(split + 1);
  if ((type !== 'iching' && type !== 'tarot' && type !== 'runes') || !id) return null;
  return { type, id };
}

export default function DivinationReflectionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTarget = parseReadingTarget(searchParams?.get('reading') || null);
  const openedReturnTarget = useRef(false);
  const [readings, setReadings] = useState<DivinationReading[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<DivinationType>(returnTarget?.type || 'all');
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
        if (returnTarget && !openedReturnTarget.current) {
          const target = (data.readings as DivinationReading[]).find(
            (item) => item.type === returnTarget.type && item.id === returnTarget.id,
          );
          if (target) {
            openedReturnTarget.current = true;
            setExpandedReading(target.id);
            setTimeout(() => {
              document.getElementById(`reading-${target.type}-${target.id}`)?.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
              });
            }, 80);
          }
        }
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
        return <Star className="w-5 h-5 text-amber-400" />;
      case 'runes':
        return <Moon className="w-5 h-5 text-amber-400" />;
      default:
        return <BookOpen className="w-5 h-5 text-amber-400" />;
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
    <div className="min-h-screen bg-[#1a1a1a] text-white">
      <div className="mx-auto w-full max-w-5xl px-6 sm:px-8 pb-24 pt-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <button
            onClick={() => router.push('/oracle')}
            className={`${readability.action} flex items-center gap-2.5 text-stone-300 hover:text-white transition-colors min-h-11`}
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Oracle
          </button>

          <h1 className={`${readability.roomTitle} font-medium text-white`}>Saved Readings</h1>

          <div className="w-24" />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {(['all', 'iching', 'tarot', 'runes'] as DivinationType[]).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`${readability.action} px-4 py-2 rounded-lg transition-colors min-h-11 ${
                filter === type
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'bg-stone-800/50 text-stone-400 hover:bg-stone-800'
              }`}
            >
              {type === 'all' ? 'All' : getTypeLabel(type)}
            </button>
          ))}

          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`${readability.action} flex items-center gap-2 px-4 py-2 rounded-lg transition-colors min-h-11 ${
              showFavoritesOnly
                ? 'bg-pink-500/20 text-pink-400'
                : 'bg-stone-800/50 text-stone-400 hover:bg-stone-800'
            }`}
          >
            <Heart className={`w-4.5 h-4.5 ${showFavoritesOnly ? 'fill-current' : ''}`} />
            Favorites
          </button>
        </div>

        {/* Readings List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
          </div>
        ) : readings.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-12 h-12 text-stone-600 mx-auto mb-4" />
            <h3 className={`${readability.sectionTitle} text-stone-300 mb-3`}>No readings saved yet</h3>
            <p className={`${readability.body} text-stone-400 mb-7`}>
              Visit the Oracle to receive a reading and save it for reflection
            </p>
            <button
              onClick={() => router.push('/oracle')}
              className={`${readability.action} px-6 py-3 bg-stone-800 hover:bg-stone-700 text-white rounded-lg transition-colors min-h-12`}
            >
              Consult the Oracle
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {readings.map((reading) => (
              <div
                key={reading.id}
                id={`reading-${reading.type}-${reading.id}`}
                className="rounded-xl border border-stone-800 bg-stone-900/30 overflow-hidden"
              >
                {/* Reading Header */}
                <div
                  className="p-5 sm:p-6 cursor-pointer hover:bg-stone-800/30 transition-colors"
                  onClick={() => setExpandedReading(
                    expandedReading === reading.id ? null : reading.id
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 min-w-0">
                      <div className="mt-0.5">
                        {getTypeIcon(reading.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`${readability.marker} text-stone-400`}>
                            {getTypeLabel(reading.type)}
                          </span>
                          {reading.is_favorite && (
                            <Heart className="w-4 h-4 text-pink-400 fill-current" />
                          )}
                        </div>
                        <h3 className={`${readability.itemTitle} font-medium text-white`}>
                          {getReadingSummary(reading)}
                        </h3>
                        {reading.question && (
                          <p className={`${readability.reading} text-stone-300 mt-2 line-clamp-2`}>
                            Q: {reading.question}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`${readability.metadata} text-stone-400 text-right`}>
                        {formatDate(reading.created_at)}
                      </div>
                      {expandedReading === reading.id ? (
                        <ChevronUp className="w-5 h-5 text-stone-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-stone-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedReading === reading.id && (
                  <div className="px-5 sm:px-6 pb-6 border-t border-stone-800 pt-6">
                    {/* Interpretation */}
                    {reading.interpretation_text && (
                      <div className="mb-6">
                        <h4 className={`${readability.metadata} text-stone-300 font-medium mb-2.5`}>Interpretation</h4>
                        <p className={`${readability.reading} text-stone-200`}>
                          {reading.interpretation_text}
                        </p>
                      </div>
                    )}

                    {/* Guidance */}
                    {reading.guidance_text && (
                      <div className="mb-6">
                        <h4 className={`${readability.metadata} text-stone-300 font-medium mb-2.5`}>Guidance</h4>
                        <p className={`${readability.reading} text-stone-200`}>
                          {reading.guidance_text}
                        </p>
                      </div>
                    )}

                    {/* Type-specific details */}
                    {reading.type === 'tarot' && (
                      <div className="mb-4">
                        <h4 className={`${readability.metadata} text-stone-300 font-medium mb-2.5`}>Cards</h4>
                        <div className="flex flex-wrap gap-2">
                          {(reading as TarotReading).cards_json.map((card, i) => (
                            <span
                              key={i}
                              className={`${readability.metadata} px-3 py-1.5 bg-stone-800/60 rounded-md text-stone-200`}
                            >
                              {card.card}{card.reversed ? ' (R)' : ''} — {card.position}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {reading.type === 'runes' && (
                      <>
                        <div className="mb-4">
                          <h4 className={`${readability.metadata} text-stone-300 font-medium mb-2.5`}>Runes</h4>
                          <div className="flex flex-wrap gap-2">
                            {(reading as RunesReading).runes_json.map((rune, i) => (
                              <span
                                key={i}
                                className={`${readability.metadata} px-3 py-1.5 bg-stone-800/60 rounded-md text-stone-200`}
                              >
                                {rune.rune}{rune.reversed ? ' (M)' : ''} — {rune.position}
                              </span>
                            ))}
                          </div>
                        </div>
                        {(reading as RunesReading).wyrd_message && (
                          <div className="mb-4">
                            <h4 className={`${readability.metadata} text-stone-300 font-medium mb-2.5`}>Message from Wyrd</h4>
                            <p className={`${readability.reading} text-stone-200 italic`}>
                              {(reading as RunesReading).wyrd_message}
                            </p>
                          </div>
                        )}
                      </>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const sourceRefId = `${reading.type}:${reading.id}`;
                          router.push(`/journal?sourceFacet=divination&sourceRefId=${encodeURIComponent(sourceRefId)}&crossingId=divination-write-journal`);
                        }}
                        className={`${readability.action} flex-1 min-w-[13rem] min-h-12 px-4 py-3 bg-stone-800 hover:bg-stone-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2.5`}
                      >
                        <BookOpen className="w-5 h-5 text-amber-400" />
                        Write with this in Journal
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          consultWithMaia(reading);
                        }}
                        className={`${readability.action} flex-1 min-w-[12rem] min-h-12 px-4 py-3 bg-stone-800 hover:bg-stone-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2.5`}
                      >
                        <MessageSquare className="w-5 h-5 text-amber-400" />
                        Explore with MAIA
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(reading);
                        }}
                        className={`min-w-12 min-h-12 px-3 py-2 rounded-lg transition-colors flex items-center justify-center ${
                          reading.is_favorite
                            ? 'bg-pink-500/20 text-pink-400'
                            : 'bg-stone-800 text-stone-400 hover:bg-stone-700'
                        }`}
                      >
                        <Heart className={`w-5 h-5 ${reading.is_favorite ? 'fill-current' : ''}`} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Archive this reading? It will be hidden from view.')) {
                            archiveReading(reading);
                          }
                        }}
                        className="min-w-12 min-h-12 px-3 py-2 bg-stone-800 text-red-400 hover:bg-red-900/30 rounded-lg transition-colors flex items-center justify-center"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
