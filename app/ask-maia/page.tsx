'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AskMaiaFeed,
  AskMaiaHeader,
  AskMaiaAskBox,
  AskMaiaPageLoading,
} from '@/components/askMaia';
import {
  AskMaiaCard,
  AskMaiaFilters,
  AskMaiaFeedResponse,
} from '@/lib/askMaia/types';

export default function AskMaiaPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cards, setCards] = useState<AskMaiaCard[]>([]);
  const [dailyTransmission, setDailyTransmission] = useState<AskMaiaCard | null>(null);
  const [featuredCards, setFeaturedCards] = useState<AskMaiaCard[]>([]);
  const [filters, setFilters] = useState<AskMaiaFilters>({});
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch cards
  const fetchCards = useCallback(async (currentFilters: AskMaiaFilters, offset = 0) => {
    try {
      const params = new URLSearchParams();

      if (currentFilters.cardTypes?.length) {
        params.set('types', currentFilters.cardTypes.join(','));
      }
      if (currentFilters.accessLevels?.length) {
        params.set('levels', currentFilters.accessLevels.join(','));
      }
      if (currentFilters.searchQuery) {
        params.set('q', currentFilters.searchQuery);
      }
      params.set('offset', offset.toString());
      params.set('limit', '20');

      const response = await fetch(`/api/ask-maia/cards/list?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch cards');
      }

      const data: AskMaiaFeedResponse = await response.json();
      return data;
    } catch (err) {
      throw err;
    }
  }, []);

  // Initial load
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch daily transmission
        const dailyResponse = await fetch('/api/ask-maia/daily');
        if (dailyResponse.ok) {
          const dailyData = await dailyResponse.json();
          setDailyTransmission(dailyData.card || null);
        }

        // Fetch featured cards
        const featuredResponse = await fetch('/api/ask-maia/featured');
        if (featuredResponse.ok) {
          const featuredData = await featuredResponse.json();
          setFeaturedCards(featuredData.cards || []);
        }

        // Fetch main feed
        const feedData = await fetchCards({});
        setCards(feedData.cards);
        setHasMore(feedData.hasMore);
        setTotalCount(feedData.totalCount);
      } catch (err) {
        console.error('Failed to load Ask MAIA data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [fetchCards]);

  // Handle filter changes
  const handleFiltersChange = useCallback(async (newFilters: AskMaiaFilters) => {
    setFilters(newFilters);
    setIsLoading(true);

    try {
      const data = await fetchCards(newFilters, 0);
      setCards(data.cards);
      setHasMore(data.hasMore);
      setTotalCount(data.totalCount);
    } catch (err) {
      console.error('Failed to apply filters:', err);
    } finally {
      setIsLoading(false);
    }
  }, [fetchCards]);

  // Handle load more (infinite scroll)
  const handleLoadMore = useCallback(async (offset: number): Promise<AskMaiaCard[]> => {
    try {
      const data = await fetchCards(filters, offset);
      setHasMore(data.hasMore);
      setTotalCount(data.totalCount);
      return data.cards;
    } catch (err) {
      console.error('Failed to load more cards:', err);
      return [];
    }
  }, [fetchCards, filters]);

  // Handle card click
  const handleCardClick = useCallback((card: AskMaiaCard) => {
    router.push(`/ask-maia/${card.id}`);
  }, [router]);

  // Handle asking MAIA
  const handleAsk = useCallback(async (question: string) => {
    const response = await fetch('/api/ask-maia/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    });

    if (!response.ok) {
      throw new Error('Failed to get answer');
    }

    return response.json();
  }, []);

  if (isLoading && cards.length === 0) {
    return <AskMaiaPageLoading />;
  }

  return (
    <div className="min-h-screen bg-maia-navy-900">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-maia-navy-900/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-lg hover:bg-white/5 text-maia-ink-60 hover:text-maia-ink-80 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-maia-spice-500/20">
                  <Sparkles className="w-5 h-5 text-maia-spice-500" />
                </div>
                <div>
                  <h1 className="text-xl font-medium text-maia-ink-100">Ask MAIA</h1>
                  <p className="text-xs text-maia-ink-40">
                    Consciousness · Psychology · Metaphysics
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <AskMaiaHeader
            filters={filters}
            onFiltersChange={handleFiltersChange}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Ask Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <AskMaiaAskBox
              onAsk={handleAsk}
              onCardClick={handleCardClick}
            />
          </motion.div>

          {/* Feed */}
          <AskMaiaFeed
            initialCards={cards}
            dailyTransmission={dailyTransmission}
            featuredCards={featuredCards}
            filters={filters}
            onCardClick={handleCardClick}
            onLoadMore={handleLoadMore}
            hasMore={hasMore}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </main>
    </div>
  );
}
