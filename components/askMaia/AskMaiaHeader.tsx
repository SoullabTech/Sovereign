'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Search,
  X,
  Sparkles,
  Brain,
  Play,
  Moon,
  BookOpen,
  Scale,
  ChevronDown,
  SlidersHorizontal,
  Crown,
  Diamond,
} from 'lucide-react';
import {
  CardType,
  AccessLevel,
  AskMaiaFilters,
  CARD_TYPE_CONFIGS,
  ACCESS_LEVEL_CONFIGS,
} from '@/lib/askMaia/types';

interface AskMaiaHeaderProps {
  filters: AskMaiaFilters;
  onFiltersChange: (filters: AskMaiaFilters) => void;
  onSearch?: (query: string) => void;
  className?: string;
}

// Icons for card types
const CardTypeIcons: Record<CardType, React.ComponentType<{ className?: string }>> = {
  daily_transmission: Sparkles,
  concept: Brain,
  practice: Play,
  archetype: Moon,
  deep_dive: BookOpen,
  contrast: Scale,
};

// Icons for access levels
const AccessLevelIcons: Record<AccessLevel, React.ComponentType<{ className?: string }>> = {
  personal: () => null, // No icon for personal
  practitioner: Crown,
  pro: Diamond,
};

export function AskMaiaHeader({
  filters,
  onFiltersChange,
  onSearch,
  className,
}: AskMaiaHeaderProps) {
  const [searchValue, setSearchValue] = useState(filters.searchQuery || '');
  const [showFilters, setShowFilters] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchValue(value);

      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      searchTimeoutRef.current = setTimeout(() => {
        onFiltersChange({ ...filters, searchQuery: value || undefined });
        onSearch?.(value);
      }, 300);
    },
    [filters, onFiltersChange, onSearch]
  );

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchValue('');
    onFiltersChange({ ...filters, searchQuery: undefined });
    onSearch?.('');
    searchInputRef.current?.focus();
  }, [filters, onFiltersChange, onSearch]);

  // Toggle card type filter
  const toggleCardType = useCallback(
    (type: CardType) => {
      const current = filters.cardTypes || [];
      const newTypes = current.includes(type)
        ? current.filter((t) => t !== type)
        : [...current, type];

      onFiltersChange({
        ...filters,
        cardTypes: newTypes.length > 0 ? newTypes : undefined,
      });
    },
    [filters, onFiltersChange]
  );

  // Toggle access level filter
  const toggleAccessLevel = useCallback(
    (level: AccessLevel) => {
      const current = filters.accessLevels || [];
      const newLevels = current.includes(level)
        ? current.filter((l) => l !== level)
        : [...current, level];

      onFiltersChange({
        ...filters,
        accessLevels: newLevels.length > 0 ? newLevels : undefined,
      });
    },
    [filters, onFiltersChange]
  );

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchValue('');
    onFiltersChange({});
    onSearch?.('');
  }, [onFiltersChange, onSearch]);

  // Check if any filters are active
  const hasActiveFilters =
    (filters.cardTypes?.length ?? 0) > 0 ||
    (filters.accessLevels?.length ?? 0) > 0 ||
    !!filters.searchQuery;

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search Bar */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-5 h-5 text-maia-ink-40 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search insights, concepts, practices..."
            className={cn(
              'w-full pl-12 pr-12 py-3 rounded-xl',
              'bg-maia-navy-850 border border-white/10',
              'text-maia-ink-100 placeholder:text-maia-ink-40',
              'focus:outline-none focus:border-maia-spice-500/50 focus:ring-1 focus:ring-maia-spice-500/20',
              'transition-all duration-200'
            )}
          />
          {searchValue && (
            <button
              onClick={clearSearch}
              className="absolute right-4 p-1 rounded-full hover:bg-white/10 text-maia-ink-40 hover:text-maia-ink-80 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm',
            'transition-colors duration-200',
            showFilters || hasActiveFilters
              ? 'bg-maia-spice-500/20 text-maia-spice-500'
              : 'bg-white/5 text-maia-ink-60 hover:bg-white/10 hover:text-maia-ink-80'
          )}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="px-1.5 py-0.5 text-xs rounded-full bg-maia-spice-500/30">
              {(filters.cardTypes?.length || 0) + (filters.accessLevels?.length || 0)}
            </span>
          )}
          <ChevronDown
            className={cn(
              'w-4 h-4 transition-transform duration-200',
              showFilters && 'rotate-180'
            )}
          />
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-maia-ink-40 hover:text-maia-ink-80 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Expanded Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-4 pt-2">
              {/* Card Type Filters */}
              <div>
                <h3 className="text-xs font-medium text-maia-ink-40 uppercase tracking-wide mb-2">
                  Content Type
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(CARD_TYPE_CONFIGS) as CardType[]).map((type) => {
                    const config = CARD_TYPE_CONFIGS[type];
                    const Icon = CardTypeIcons[type];
                    const isActive = filters.cardTypes?.includes(type);

                    return (
                      <button
                        key={type}
                        onClick={() => toggleCardType(type)}
                        className={cn(
                          'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm',
                          'border transition-all duration-200',
                          isActive
                            ? 'bg-white/10 border-white/20 text-maia-ink-100'
                            : 'bg-transparent border-white/5 text-maia-ink-60 hover:bg-white/5 hover:border-white/10'
                        )}
                      >
                        <Icon className={cn('w-3.5 h-3.5', config.color)} />
                        <span>{config.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Access Level Filters */}
              <div>
                <h3 className="text-xs font-medium text-maia-ink-40 uppercase tracking-wide mb-2">
                  Access Level
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(ACCESS_LEVEL_CONFIGS) as AccessLevel[]).map((level) => {
                    const config = ACCESS_LEVEL_CONFIGS[level];
                    const Icon = AccessLevelIcons[level];
                    const isActive = filters.accessLevels?.includes(level);

                    return (
                      <button
                        key={level}
                        onClick={() => toggleAccessLevel(level)}
                        className={cn(
                          'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm',
                          'border transition-all duration-200',
                          isActive
                            ? 'bg-white/10 border-white/20 text-maia-ink-100'
                            : 'bg-transparent border-white/5 text-maia-ink-60 hover:bg-white/5 hover:border-white/10'
                        )}
                      >
                        {Icon && <Icon className={cn('w-3.5 h-3.5', config.color)} />}
                        <span>{config.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filter Pills (always visible) */}
      {hasActiveFilters && !showFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.cardTypes?.map((type) => {
            const config = CARD_TYPE_CONFIGS[type];
            const Icon = CardTypeIcons[type];

            return (
              <span
                key={type}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 text-sm"
              >
                <Icon className={cn('w-3.5 h-3.5', config.color)} />
                <span className="text-maia-ink-80">{config.label}</span>
                <button
                  onClick={() => toggleCardType(type)}
                  className="ml-1 text-maia-ink-40 hover:text-maia-ink-80"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })}

          {filters.accessLevels?.map((level) => {
            const config = ACCESS_LEVEL_CONFIGS[level];
            const Icon = AccessLevelIcons[level];

            return (
              <span
                key={level}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 text-sm"
              >
                {Icon && <Icon className={cn('w-3.5 h-3.5', config.color)} />}
                <span className="text-maia-ink-80">{config.label}</span>
                <button
                  onClick={() => toggleAccessLevel(level)}
                  className="ml-1 text-maia-ink-40 hover:text-maia-ink-80"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })}

          {filters.searchQuery && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 text-sm">
              <Search className="w-3.5 h-3.5 text-maia-ink-40" />
              <span className="text-maia-ink-80 max-w-[150px] truncate">
                "{filters.searchQuery}"
              </span>
              <button
                onClick={clearSearch}
                className="ml-1 text-maia-ink-40 hover:text-maia-ink-80"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// Quick filter chips (alternative simpler UI)
export function AskMaiaQuickFilters({
  activeTypes,
  onTypeToggle,
  className,
}: {
  activeTypes: CardType[];
  onTypeToggle: (type: CardType) => void;
  className?: string;
}) {
  return (
    <div className={cn('flex gap-2 overflow-x-auto pb-2 scrollbar-hide', className)}>
      {(Object.keys(CARD_TYPE_CONFIGS) as CardType[]).map((type) => {
        const config = CARD_TYPE_CONFIGS[type];
        const Icon = CardTypeIcons[type];
        const isActive = activeTypes.includes(type);

        return (
          <button
            key={type}
            onClick={() => onTypeToggle(type)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm whitespace-nowrap',
              'border transition-all duration-200',
              isActive
                ? 'bg-white/10 border-white/20 text-maia-ink-100'
                : 'bg-transparent border-white/5 text-maia-ink-60 hover:bg-white/5'
            )}
          >
            <Icon className={cn('w-3.5 h-3.5', config.color)} />
            <span>{config.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default AskMaiaHeader;
