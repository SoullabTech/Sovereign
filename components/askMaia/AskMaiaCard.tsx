'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Sparkles,
  Brain,
  Play,
  Moon,
  BookOpen,
  Scale,
  Crown,
  Diamond,
  Clock,
  ChevronRight,
  User,
} from 'lucide-react';
import { AskMaiaCard as CardType, CardType as CardTypeEnum, AccessLevel, CARD_TYPE_CONFIGS, ACCESS_LEVEL_CONFIGS } from '@/lib/askMaia/types';

interface AskMaiaCardProps {
  card: CardType;
  onClick?: () => void;
  variant?: 'default' | 'compact' | 'featured' | 'hero';
  className?: string;
}

// Icons for card types
const CardTypeIcons: Record<CardTypeEnum, React.ComponentType<{ className?: string }>> = {
  daily_transmission: Sparkles,
  concept: Brain,
  practice: Play,
  archetype: Moon,
  deep_dive: BookOpen,
  contrast: Scale,
};

// Icons for access levels
const AccessLevelIcons: Record<AccessLevel, React.ComponentType<{ className?: string }>> = {
  personal: User,
  practitioner: Crown,
  pro: Diamond,
};

// Card type-specific styling
const cardTypeStyles: Record<CardTypeEnum, { bg: string; border: string; iconBg: string; accent: string }> = {
  daily_transmission: {
    bg: 'bg-gradient-to-br from-amber-500/10 via-purple-500/5 to-indigo-500/10',
    border: 'border-amber-500/30 hover:border-amber-400/50',
    iconBg: 'bg-amber-500/20',
    accent: 'text-amber-400',
  },
  concept: {
    bg: 'bg-maia-navy-850',
    border: 'border-purple-500/20 hover:border-purple-400/40',
    iconBg: 'bg-purple-500/20',
    accent: 'text-purple-400',
  },
  practice: {
    bg: 'bg-maia-navy-850',
    border: 'border-emerald-500/20 hover:border-emerald-400/40',
    iconBg: 'bg-emerald-500/20',
    accent: 'text-emerald-400',
  },
  archetype: {
    bg: 'bg-gradient-to-br from-indigo-500/10 to-purple-500/10',
    border: 'border-indigo-500/20 hover:border-indigo-400/40',
    iconBg: 'bg-indigo-500/20',
    accent: 'text-indigo-400',
  },
  deep_dive: {
    bg: 'bg-maia-navy-850',
    border: 'border-blue-500/20 hover:border-blue-400/40',
    iconBg: 'bg-blue-500/20',
    accent: 'text-blue-400',
  },
  contrast: {
    bg: 'bg-gradient-to-r from-rose-500/5 via-maia-navy-850 to-blue-500/5',
    border: 'border-rose-500/20 hover:border-rose-400/40',
    iconBg: 'bg-rose-500/20',
    accent: 'text-rose-400',
  },
};

export function AskMaiaCard({ card, onClick, variant = 'default', className }: AskMaiaCardProps) {
  const TypeIcon = CardTypeIcons[card.cardType];
  const AccessIcon = AccessLevelIcons[card.accessLevel];
  const typeConfig = CARD_TYPE_CONFIGS[card.cardType];
  const accessConfig = ACCESS_LEVEL_CONFIGS[card.accessLevel];
  const styles = cardTypeStyles[card.cardType];

  // Hero variant for daily transmission
  if (variant === 'hero' || card.isDaily) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        onClick={onClick}
        className={cn(
          'relative overflow-hidden rounded-2xl cursor-pointer',
          'bg-gradient-to-br from-amber-500/20 via-purple-500/10 to-indigo-500/20',
          'border border-amber-500/30',
          'p-8',
          'transition-all duration-300',
          'hover:border-amber-400/50 hover:shadow-lg hover:shadow-amber-500/10',
          'group',
          className
        )}
      >
        {/* Aurora effect */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-1/2 h-32 bg-gradient-to-b from-amber-400/30 via-purple-500/20 to-transparent blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-1/2 h-32 bg-gradient-to-t from-indigo-500/20 to-transparent blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative z-10">
          {/* Badge */}
          <div className="flex items-center gap-2 mb-4">
            <div className={cn('p-2 rounded-lg', styles.iconBg)}>
              <TypeIcon className={cn('w-5 h-5', styles.accent)} />
            </div>
            <span className={cn('text-sm font-medium', styles.accent)}>
              {typeConfig.label}
            </span>
            <span className="text-maia-ink-40 text-sm">
              Today's Insight
            </span>
          </div>

          {/* Title */}
          <h2 className="text-2xl md:text-3xl font-light text-maia-ink-100 mb-3 group-hover:text-amber-100 transition-colors">
            {card.title}
          </h2>

          {/* Subtitle */}
          {card.subtitle && (
            <p className="text-maia-ink-60 text-lg mb-6">
              {card.subtitle}
            </p>
          )}

          {/* Preview of content */}
          <p className="text-maia-ink-60 line-clamp-3 mb-6 leading-relaxed">
            {card.content.slice(0, 200)}...
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-maia-ink-40">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{card.readTimeMinutes} min read</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-amber-400 group-hover:translate-x-1 transition-transform">
              <span className="text-sm font-medium">Read more</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Featured variant
  if (variant === 'featured') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        onClick={onClick}
        className={cn(
          'relative overflow-hidden rounded-xl cursor-pointer',
          styles.bg,
          'border',
          styles.border,
          'p-6',
          'transition-all duration-300',
          'hover:scale-[1.02] hover:shadow-lg',
          'group',
          className
        )}
      >
        {/* Content */}
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className={cn('p-2 rounded-lg', styles.iconBg)}>
              <TypeIcon className={cn('w-5 h-5', styles.accent)} />
            </div>
            {card.accessLevel !== 'personal' && (
              <div className={cn('flex items-center gap-1', accessConfig.color)}>
                <AccessIcon className="w-4 h-4" />
              </div>
            )}
          </div>

          {/* Title */}
          <h3 className="text-lg font-medium text-maia-ink-100 mb-2 group-hover:text-white transition-colors line-clamp-2">
            {card.title}
          </h3>

          {/* Subtitle */}
          {card.subtitle && (
            <p className="text-maia-ink-60 text-sm mb-4 line-clamp-2">
              {card.subtitle}
            </p>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-auto">
            {card.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-1 rounded-full bg-white/5 text-maia-ink-60"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
            <span className="text-xs text-maia-ink-40 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {card.readTimeMinutes} min
            </span>
            <ChevronRight className={cn('w-4 h-4 group-hover:translate-x-1 transition-transform', styles.accent)} />
          </div>
        </div>
      </motion.div>
    );
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <motion.div
        whileHover={{ x: 4 }}
        onClick={onClick}
        className={cn(
          'flex items-center gap-4 p-4 rounded-xl cursor-pointer',
          'bg-maia-navy-850/50',
          'border border-white/5 hover:border-white/10',
          'transition-all duration-200',
          'group',
          className
        )}
      >
        <div className={cn('p-2 rounded-lg flex-shrink-0', styles.iconBg)}>
          <TypeIcon className={cn('w-4 h-4', styles.accent)} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-maia-ink-100 truncate group-hover:text-white">
            {card.title}
          </h4>
          <p className="text-xs text-maia-ink-40">
            {typeConfig.label} · {card.readTimeMinutes} min
          </p>
        </div>
        {card.accessLevel !== 'personal' && (
          <AccessIcon className={cn('w-4 h-4 flex-shrink-0', accessConfig.color)} />
        )}
      </motion.div>
    );
  }

  // Default variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      onClick={onClick}
      className={cn(
        'relative overflow-hidden rounded-xl cursor-pointer',
        styles.bg,
        'border',
        styles.border,
        'p-5',
        'transition-all duration-300',
        'hover:shadow-lg',
        'group',
        className
      )}
    >
      {/* Content */}
      <div className="flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={cn('p-1.5 rounded-md', styles.iconBg)}>
              <TypeIcon className={cn('w-4 h-4', styles.accent)} />
            </div>
            <span className={cn('text-xs font-medium uppercase tracking-wide', styles.accent)}>
              {typeConfig.label}
            </span>
          </div>
          {card.accessLevel !== 'personal' && (
            <div className={cn('flex items-center gap-1 text-xs', accessConfig.color)}>
              <AccessIcon className="w-3 h-3" />
              <span>{accessConfig.label}</span>
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="text-base font-medium text-maia-ink-100 mb-1 group-hover:text-white transition-colors line-clamp-2">
          {card.title}
        </h3>

        {/* Subtitle */}
        {card.subtitle && (
          <p className="text-sm text-maia-ink-60 mb-3 line-clamp-2">
            {card.subtitle}
          </p>
        )}

        {/* Preview */}
        <p className="text-sm text-maia-ink-40 line-clamp-2 mb-3">
          {card.content.slice(0, 120)}...
        </p>

        {/* Tags */}
        {card.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {card.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-maia-ink-60"
              >
                {tag}
              </span>
            ))}
            {card.tags.length > 3 && (
              <span className="text-xs text-maia-ink-40">
                +{card.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-white/5">
          <div className="flex items-center gap-2 text-xs text-maia-ink-40">
            <Clock className="w-3 h-3" />
            <span>{card.readTimeMinutes} min read</span>
          </div>
          <div className={cn('flex items-center gap-1 text-xs group-hover:translate-x-1 transition-transform', styles.accent)}>
            <span>Read</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Daily Transmission Hero Card (special export)
export function DailyTransmissionCard({ card, onClick }: { card: CardType; onClick?: () => void }) {
  return <AskMaiaCard card={card} onClick={onClick} variant="hero" />;
}

export default AskMaiaCard;
