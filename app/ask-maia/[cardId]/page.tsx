'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  Sparkles,
  Brain,
  Play,
  Moon,
  BookOpen,
  Scale,
  Clock,
  Tag,
  Crown,
  Diamond,
  ExternalLink,
  Share2,
  Bookmark,
  ChevronRight,
} from 'lucide-react';
import { AskMaiaCard } from '@/components/askMaia';
import { AskMaiaCard as CardType, CardType as CardTypeEnum, AccessLevel } from '@/lib/askMaia/types';

// Card type configuration
const cardTypeConfig: Record<CardTypeEnum, { icon: React.ComponentType<{ className?: string }>; label: string; gradient: string }> = {
  daily_transmission: {
    icon: Sparkles,
    label: 'Daily Transmission',
    gradient: 'from-purple-500 via-pink-500 to-orange-400',
  },
  concept: {
    icon: Brain,
    label: 'Concept',
    gradient: 'from-blue-500 to-cyan-400',
  },
  practice: {
    icon: Play,
    label: 'Practice',
    gradient: 'from-green-500 to-emerald-400',
  },
  archetype: {
    icon: Moon,
    label: 'Archetype',
    gradient: 'from-indigo-500 to-purple-400',
  },
  deep_dive: {
    icon: BookOpen,
    label: 'Deep Dive',
    gradient: 'from-amber-500 to-orange-400',
  },
  contrast: {
    icon: Scale,
    label: 'Contrast',
    gradient: 'from-rose-500 to-pink-400',
  },
};

// Access level icons
const accessLevelIcons: Record<AccessLevel, React.ComponentType<{ className?: string }> | null> = {
  personal: null,
  practitioner: Crown,
  pro: Diamond,
};

export default function CardDetailPage() {
  const router = useRouter();
  const params = useParams();
  const cardId = params?.cardId as string;

  const [card, setCard] = useState<CardType | null>(null);
  const [relatedCards, setRelatedCards] = useState<CardType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    const fetchCard = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/ask-maia/cards/${cardId}`);
        if (!response.ok) {
          throw new Error('Card not found');
        }
        const data = await response.json();
        setCard(data.card);
        setRelatedCards(data.relatedCards || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load card');
      } finally {
        setIsLoading(false);
      }
    };

    if (cardId) {
      fetchCard();
    }
  }, [cardId]);

  const handleBack = () => {
    router.back();
  };

  const handleShare = async () => {
    if (card && navigator.share) {
      try {
        await navigator.share({
          title: card.title,
          text: card.subtitle || card.title,
          url: window.location.href,
        });
      } catch {
        // User cancelled or share failed
      }
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // TODO: Persist bookmark state
  };

  if (isLoading) {
    return <CardDetailSkeleton />;
  }

  if (error || !card) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Card Not Found</h2>
          <p className="text-white/60 mb-6">{error || 'This insight could not be located.'}</p>
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
          >
            Return to Feed
          </button>
        </motion.div>
      </div>
    );
  }

  const typeConfig = cardTypeConfig[card.cardType];
  const TypeIcon = typeConfig.icon;
  const AccessIcon = accessLevelIcons[card.accessLevel];

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10"
      >
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleBookmark}
              className={cn(
                'p-2 rounded-lg transition-colors',
                isBookmarked
                  ? 'bg-purple-500/20 text-purple-400'
                  : 'bg-white/10 text-white/60 hover:text-white'
              )}
            >
              <Bookmark className={cn('w-5 h-5', isBookmarked && 'fill-current')} />
            </button>
            <button
              onClick={handleShare}
              className="p-2 rounded-lg bg-white/10 text-white/60 hover:text-white transition-colors"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* Card Type Badge */}
          <div className="flex items-center gap-3 mb-6">
            <div
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-full',
                'bg-gradient-to-r',
                typeConfig.gradient,
                'text-white text-sm font-medium'
              )}
            >
              <TypeIcon className="w-4 h-4" />
              <span>{typeConfig.label}</span>
            </div>

            {AccessIcon && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-white/80 text-sm">
                <AccessIcon className="w-4 h-4" />
                <span className="capitalize">{card.accessLevel}</span>
              </div>
            )}

            <div className="flex items-center gap-1.5 text-white/50 text-sm">
              <Clock className="w-4 h-4" />
              <span>{card.readTimeMinutes} min read</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
            {card.title}
          </h1>

          {/* Subtitle */}
          {card.subtitle && (
            <p className="text-xl text-white/70 mb-8 leading-relaxed">{card.subtitle}</p>
          )}

          {/* Content */}
          <div className="prose prose-invert prose-lg max-w-none mb-8">
            <CardContent content={card.content} />
          </div>

          {/* Tags */}
          {card.tags && card.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {card.tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-white/70 text-sm hover:bg-white/20 transition-colors cursor-pointer"
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Source */}
          {card.source && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 mb-8">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="text-white/50 text-sm">Source</p>
                <p className="text-white font-medium">{card.source}</p>
              </div>
              {card.sourceUrl && (
                <a
                  href={card.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-white/10 text-white/60 hover:text-white transition-colors"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
              )}
            </div>
          )}
        </motion.article>

        {/* Related Cards */}
        {relatedCards.length > 0 && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-12"
          >
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <ChevronRight className="w-5 h-5 text-purple-400" />
              Related Insights
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {relatedCards.slice(0, 4).map((relatedCard) => (
                <AskMaiaCard
                  key={relatedCard.id}
                  card={relatedCard}
                  variant="compact"
                  onClick={() => router.push(`/ask-maia/${relatedCard.id}`)}
                />
              ))}
            </div>
          </motion.section>
        )}
      </main>
    </div>
  );
}

// Component to render card content with proper formatting
function CardContent({ content }: { content: string }) {
  // Split content into paragraphs and render
  const paragraphs = content.split('\n\n').filter(Boolean);

  return (
    <>
      {paragraphs.map((paragraph, index) => {
        // Check if it's a list item
        if (paragraph.startsWith('- ') || paragraph.startsWith('* ')) {
          const items = paragraph.split('\n').filter((item) => item.startsWith('- ') || item.startsWith('* '));
          return (
            <ul key={index} className="list-disc list-inside space-y-2 my-4">
              {items.map((item, i) => (
                <li key={i} className="text-white/80">
                  {item.replace(/^[-*]\s/, '')}
                </li>
              ))}
            </ul>
          );
        }

        // Check if it's a numbered list
        if (/^\d+\./.test(paragraph)) {
          const items = paragraph.split('\n').filter((item) => /^\d+\./.test(item));
          return (
            <ol key={index} className="list-decimal list-inside space-y-2 my-4">
              {items.map((item, i) => (
                <li key={i} className="text-white/80">
                  {item.replace(/^\d+\.\s/, '')}
                </li>
              ))}
            </ol>
          );
        }

        // Check if it's a heading (starts with #)
        if (paragraph.startsWith('## ')) {
          return (
            <h3 key={index} className="text-xl font-semibold text-white mt-8 mb-4">
              {paragraph.replace('## ', '')}
            </h3>
          );
        }
        if (paragraph.startsWith('### ')) {
          return (
            <h4 key={index} className="text-lg font-semibold text-white mt-6 mb-3">
              {paragraph.replace('### ', '')}
            </h4>
          );
        }

        // Check if it's a blockquote
        if (paragraph.startsWith('> ')) {
          return (
            <blockquote
              key={index}
              className="border-l-4 border-purple-500/50 pl-4 py-2 my-4 text-white/70 italic"
            >
              {paragraph.replace(/^>\s?/gm, '')}
            </blockquote>
          );
        }

        // Regular paragraph
        return (
          <p key={index} className="text-white/80 leading-relaxed my-4">
            {paragraph}
          </p>
        );
      })}
    </>
  );
}

// Loading skeleton
function CardDetailSkeleton() {
  return (
    <div className="min-h-screen bg-black">
      {/* Header skeleton */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="w-20 h-8 bg-white/10 rounded-lg animate-pulse" />
          <div className="flex gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-lg animate-pulse" />
            <div className="w-10 h-10 bg-white/10 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Badge skeleton */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-32 h-8 bg-white/10 rounded-full animate-pulse" />
          <div className="w-24 h-8 bg-white/10 rounded-full animate-pulse" />
        </div>

        {/* Title skeleton */}
        <div className="w-3/4 h-10 bg-white/10 rounded-lg animate-pulse mb-4" />

        {/* Subtitle skeleton */}
        <div className="w-full h-6 bg-white/10 rounded-lg animate-pulse mb-2" />
        <div className="w-2/3 h-6 bg-white/10 rounded-lg animate-pulse mb-8" />

        {/* Content skeleton */}
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="w-full h-4 bg-white/10 rounded animate-pulse" />
              <div className="w-full h-4 bg-white/10 rounded animate-pulse" />
              <div className="w-3/4 h-4 bg-white/10 rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Tags skeleton */}
        <div className="flex gap-2 mt-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="w-20 h-8 bg-white/10 rounded-full animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
