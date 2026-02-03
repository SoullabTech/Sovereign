/**
 * Ask MAIA Types
 * Knowledge/Insight Feed for Consciousness, Psychology, Metaphysics, and Spirituality
 */

/**
 * Card types represent different content formats in the Ask MAIA feed
 */
export type CardType =
  | 'daily_transmission'  // Daily channeled insight - mystical, inspirational
  | 'concept'             // Psychology/philosophy concepts - educational
  | 'practice'            // Actionable exercises - practical
  | 'archetype'           // Myth, symbol, archetype exploration - deep
  | 'deep_dive'           // Long-form articles - comprehensive
  | 'contrast';           // Compare opposing ideas - analytical

/**
 * Access levels determine who can view content
 */
export type AccessLevel = 'personal' | 'practitioner' | 'pro';

/**
 * Core card interface representing a knowledge card in the feed
 */
export interface AskMaiaCard {
  id: string;
  cardType: CardType;
  accessLevel: AccessLevel;
  title: string;
  subtitle?: string;
  content: string;
  source?: string;
  sourceUrl?: string;
  tags: string[];
  readTimeMinutes: number;
  isFeatured: boolean;
  isDaily: boolean;
  publishedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Database row interface (snake_case from PostgreSQL)
 */
export interface AskMaiaCardRow {
  id: string;
  card_type: CardType;
  access_level: AccessLevel;
  title: string;
  subtitle: string | null;
  content: string;
  source: string | null;
  source_url: string | null;
  tags: string[] | null;
  read_time_minutes: number;
  is_featured: boolean;
  is_daily: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
}

/**
 * Filter options for the feed
 */
export interface AskMaiaFilters {
  cardTypes?: CardType[];
  accessLevels?: AccessLevel[];
  tags?: string[];
  searchQuery?: string;
  isFeatured?: boolean;
  isDaily?: boolean;
}

/**
 * Pagination options
 */
export interface AskMaiaPagination {
  limit: number;
  offset: number;
}

/**
 * Sort options
 */
export type AskMaiaSortField = 'published_at' | 'title' | 'read_time_minutes';
export type AskMaiaSortDirection = 'asc' | 'desc';

export interface AskMaiaSort {
  field: AskMaiaSortField;
  direction: AskMaiaSortDirection;
}

/**
 * Query options combining filters, pagination, and sorting
 */
export interface AskMaiaQueryOptions {
  filters?: AskMaiaFilters;
  pagination?: AskMaiaPagination;
  sort?: AskMaiaSort;
}

/**
 * Response wrapper for paginated results
 */
export interface AskMaiaFeedResponse {
  cards: AskMaiaCard[];
  totalCount: number;
  hasMore: boolean;
}

/**
 * Card type display configuration
 */
export interface CardTypeConfig {
  type: CardType;
  label: string;
  icon: string;  // Lucide icon name
  color: string; // Tailwind color class
  description: string;
}

/**
 * Card type configurations for UI
 */
export const CARD_TYPE_CONFIGS: Record<CardType, CardTypeConfig> = {
  daily_transmission: {
    type: 'daily_transmission',
    label: 'Daily Transmission',
    icon: 'Sparkles',
    color: 'text-amber-400',
    description: 'Channeled insight for today',
  },
  concept: {
    type: 'concept',
    label: 'Concept',
    icon: 'Brain',
    color: 'text-purple-400',
    description: 'Psychology & philosophy fundamentals',
  },
  practice: {
    type: 'practice',
    label: 'Practice',
    icon: 'Play',
    color: 'text-emerald-400',
    description: 'Actionable exercises & meditations',
  },
  archetype: {
    type: 'archetype',
    label: 'Archetype',
    icon: 'Moon',
    color: 'text-indigo-400',
    description: 'Myths, symbols & archetypes',
  },
  deep_dive: {
    type: 'deep_dive',
    label: 'Deep Dive',
    icon: 'BookOpen',
    color: 'text-blue-400',
    description: 'Long-form explorations',
  },
  contrast: {
    type: 'contrast',
    label: 'Contrast',
    icon: 'Scale',
    color: 'text-rose-400',
    description: 'Comparing opposing perspectives',
  },
};

/**
 * Access level display configuration
 */
export interface AccessLevelConfig {
  level: AccessLevel;
  label: string;
  icon: string;
  color: string;
  description: string;
}

export const ACCESS_LEVEL_CONFIGS: Record<AccessLevel, AccessLevelConfig> = {
  personal: {
    level: 'personal',
    label: 'Personal',
    icon: 'User',
    color: 'text-maia-ink-60',
    description: 'Available to all members',
  },
  practitioner: {
    level: 'practitioner',
    label: 'Practitioner',
    icon: 'Crown',
    color: 'text-amber-500',
    description: 'For coaching professionals',
  },
  pro: {
    level: 'pro',
    label: 'Pro',
    icon: 'Diamond',
    color: 'text-purple-400',
    description: 'Advanced therapeutic insights',
  },
};

/**
 * Transform database row to card interface
 */
export function transformCardRow(row: AskMaiaCardRow): AskMaiaCard {
  return {
    id: row.id,
    cardType: row.card_type,
    accessLevel: row.access_level,
    title: row.title,
    subtitle: row.subtitle ?? undefined,
    content: row.content,
    source: row.source ?? undefined,
    sourceUrl: row.source_url ?? undefined,
    tags: row.tags ?? [],
    readTimeMinutes: row.read_time_minutes,
    isFeatured: row.is_featured,
    isDaily: row.is_daily,
    publishedAt: new Date(row.published_at),
    createdAt: row.created_at ? new Date(row.created_at) : undefined,
    updatedAt: row.updated_at ? new Date(row.updated_at) : undefined,
  };
}

/**
 * Transform card interface to database row for inserts
 */
export function transformCardToRow(card: Omit<AskMaiaCard, 'id' | 'createdAt' | 'updatedAt'>): Omit<AskMaiaCardRow, 'id' | 'created_at' | 'updated_at'> {
  return {
    card_type: card.cardType,
    access_level: card.accessLevel,
    title: card.title,
    subtitle: card.subtitle ?? null,
    content: card.content,
    source: card.source ?? null,
    source_url: card.sourceUrl ?? null,
    tags: card.tags,
    read_time_minutes: card.readTimeMinutes,
    is_featured: card.isFeatured,
    is_daily: card.isDaily,
    published_at: card.publishedAt.toISOString(),
  };
}
