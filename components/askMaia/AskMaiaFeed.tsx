'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { AskMaiaCard, DailyTransmissionCard } from './AskMaiaCard';
import { AskMaiaCard as CardType, AskMaiaFilters, CardType as CardTypeEnum } from '@/lib/askMaia/types';

interface AskMaiaFeedProps {
  initialCards?: CardType[];
  dailyTransmission?: CardType | null;
  featuredCards?: CardType[];
  filters?: AskMaiaFilters;
  onCardClick?: (card: CardType) => void;
  onLoadMore?: (offset: number) => Promise<CardType[]>;
  hasMore?: boolean;
  isLoading?: boolean;
  error?: string | null;
  className?: string;
}

export function AskMaiaFeed({
  initialCards = [],
  dailyTransmission,
  featuredCards = [],
  filters,
  onCardClick,
  onLoadMore,
  hasMore = false,
  isLoading = false,
  error = null,
  className,
}: AskMaiaFeedProps) {
  const [cards, setCards] = useState<CardType[]>(initialCards);
  const [loadingMore, setLoadingMore] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreTriggerRef = useRef<HTMLDivElement>(null);

  // Update cards when initialCards change
  useEffect(() => {
    setCards(initialCards);
  }, [initialCards]);

  // Infinite scroll observer
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && hasMore && !loadingMore && onLoadMore) {
        setLoadingMore(true);
        onLoadMore(cards.length)
          .then((newCards) => {
            setCards((prev) => [...prev, ...newCards]);
          })
          .catch((err) => {
            console.error('Failed to load more cards:', err);
          })
          .finally(() => {
            setLoadingMore(false);
          });
      }
    },
    [hasMore, loadingMore, onLoadMore, cards.length]
  );

  // Setup intersection observer
  useEffect(() => {
    const option = {
      root: null,
      rootMargin: '100px',
      threshold: 0,
    };

    observerRef.current = new IntersectionObserver(handleObserver, option);

    if (loadMoreTriggerRef.current) {
      observerRef.current.observe(loadMoreTriggerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleObserver]);

  // Filter out daily transmission and featured cards from main feed
  const feedCards = cards.filter(
    (card) =>
      !card.isDaily &&
      !featuredCards.some((fc) => fc.id === card.id)
  );

  // Group cards by type for potential grouping UI
  const hasActiveFilters =
    filters?.cardTypes?.length ||
    filters?.accessLevels?.length ||
    filters?.tags?.length ||
    filters?.searchQuery;

  // Loading state
  if (isLoading && cards.length === 0) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-20', className)}>
        <Loader2 className="w-8 h-8 text-maia-spice-500 animate-spin mb-4" />
        <p className="text-maia-ink-60">Loading insights...</p>
      </div>
    );
  }

  // Error state
  if (error && cards.length === 0) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-20', className)}>
        <AlertCircle className="w-8 h-8 text-red-400 mb-4" />
        <p className="text-maia-ink-80 mb-2">Failed to load cards</p>
        <p className="text-sm text-maia-ink-40 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-maia-ink-80 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  // Empty state
  if (!isLoading && cards.length === 0 && !dailyTransmission) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-20', className)}>
        <p className="text-maia-ink-60 text-center">
          {hasActiveFilters
            ? 'No cards match your filters. Try adjusting your search.'
            : 'No insights available yet.'}
        </p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-8', className)}>
      {/* Daily Transmission Hero */}
      {dailyTransmission && !hasActiveFilters && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <DailyTransmissionCard
            card={dailyTransmission}
            onClick={() => onCardClick?.(dailyTransmission)}
          />
        </motion.section>
      )}

      {/* Featured Cards Grid */}
      {featuredCards.length > 0 && !hasActiveFilters && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h2 className="text-lg font-medium text-maia-ink-80 mb-4">Featured</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredCards.map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <AskMaiaCard
                  card={card}
                  variant="featured"
                  onClick={() => onCardClick?.(card)}
                />
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Main Feed */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {!hasActiveFilters && feedCards.length > 0 && (
          <h2 className="text-lg font-medium text-maia-ink-80 mb-4">All Insights</h2>
        )}

        {hasActiveFilters && cards.length > 0 && (
          <p className="text-sm text-maia-ink-60 mb-4">
            {cards.length} result{cards.length !== 1 ? 's' : ''} found
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {(hasActiveFilters ? cards : feedCards).map((card, index) => (
              <motion.div
                key={card.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: Math.min(index * 0.05, 0.3) }}
              >
                <AskMaiaCard
                  card={card}
                  onClick={() => onCardClick?.(card)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Load more trigger */}
        <div ref={loadMoreTriggerRef} className="h-px" />

        {/* Loading more indicator */}
        {loadingMore && (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 text-maia-spice-500 animate-spin" />
          </div>
        )}

        {/* End of feed message */}
        {!hasMore && cards.length > 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-maia-ink-40">
              You've reached the end of the feed
            </p>
          </div>
        )}
      </motion.section>
    </div>
  );
}

// Card Grid component for simpler layouts
export function AskMaiaCardGrid({
  cards,
  onCardClick,
  variant = 'default',
  columns = 2,
  className,
}: {
  cards: CardType[];
  onCardClick?: (card: CardType) => void;
  variant?: 'default' | 'compact' | 'featured';
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-4', gridCols[columns], className)}>
      {cards.map((card, index) => (
        <motion.div
          key={card.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <AskMaiaCard
            card={card}
            variant={variant}
            onClick={() => onCardClick?.(card)}
          />
        </motion.div>
      ))}
    </div>
  );
}

export default AskMaiaFeed;
