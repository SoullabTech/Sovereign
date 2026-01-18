/**
 * Ask MAIA Search Service
 * Search and filter logic for the knowledge feed
 */

import {
  AskMaiaCard,
  AskMaiaFilters,
  AskMaiaQueryOptions,
  AskMaiaFeedResponse,
  CardType,
  AccessLevel,
} from './types';
import { getCards, searchCards as dbSearchCards, getAllTags } from './cardService';

/**
 * Build query options from URL search params
 */
export function buildQueryFromParams(params: URLSearchParams): AskMaiaQueryOptions {
  const options: AskMaiaQueryOptions = {
    filters: {},
    pagination: {
      limit: parseInt(params.get('limit') || '20', 10),
      offset: parseInt(params.get('offset') || '0', 10),
    },
    sort: {
      field: (params.get('sortBy') as any) || 'published_at',
      direction: (params.get('sortDir') as any) || 'desc',
    },
  };

  // Parse card types
  const types = params.get('types');
  if (types) {
    options.filters!.cardTypes = types.split(',') as CardType[];
  }

  // Parse access levels
  const levels = params.get('levels');
  if (levels) {
    options.filters!.accessLevels = levels.split(',') as AccessLevel[];
  }

  // Parse tags
  const tags = params.get('tags');
  if (tags) {
    options.filters!.tags = tags.split(',');
  }

  // Parse search query
  const q = params.get('q');
  if (q) {
    options.filters!.searchQuery = q;
  }

  // Parse featured filter
  const featured = params.get('featured');
  if (featured === 'true') {
    options.filters!.isFeatured = true;
  }

  return options;
}

/**
 * Build URL search params from query options
 */
export function buildParamsFromQuery(options: AskMaiaQueryOptions): URLSearchParams {
  const params = new URLSearchParams();

  if (options.filters?.cardTypes?.length) {
    params.set('types', options.filters.cardTypes.join(','));
  }

  if (options.filters?.accessLevels?.length) {
    params.set('levels', options.filters.accessLevels.join(','));
  }

  if (options.filters?.tags?.length) {
    params.set('tags', options.filters.tags.join(','));
  }

  if (options.filters?.searchQuery) {
    params.set('q', options.filters.searchQuery);
  }

  if (options.filters?.isFeatured) {
    params.set('featured', 'true');
  }

  if (options.pagination) {
    if (options.pagination.limit !== 20) {
      params.set('limit', options.pagination.limit.toString());
    }
    if (options.pagination.offset !== 0) {
      params.set('offset', options.pagination.offset.toString());
    }
  }

  if (options.sort) {
    if (options.sort.field !== 'published_at') {
      params.set('sortBy', options.sort.field);
    }
    if (options.sort.direction !== 'desc') {
      params.set('sortDir', options.sort.direction);
    }
  }

  return params;
}

/**
 * Client-side filter for cards (for local filtering without API call)
 */
export function filterCardsClient(
  cards: AskMaiaCard[],
  filters: AskMaiaFilters
): AskMaiaCard[] {
  let filtered = [...cards];

  // Filter by card types
  if (filters.cardTypes?.length) {
    filtered = filtered.filter((c) => filters.cardTypes!.includes(c.cardType));
  }

  // Filter by access levels
  if (filters.accessLevels?.length) {
    filtered = filtered.filter((c) => filters.accessLevels!.includes(c.accessLevel));
  }

  // Filter by tags
  if (filters.tags?.length) {
    filtered = filtered.filter((c) =>
      filters.tags!.some((tag) => c.tags.includes(tag))
    );
  }

  // Filter by search query (simple client-side search)
  if (filters.searchQuery?.trim()) {
    const query = filters.searchQuery.toLowerCase().trim();
    filtered = filtered.filter(
      (c) =>
        c.title.toLowerCase().includes(query) ||
        c.subtitle?.toLowerCase().includes(query) ||
        c.content.toLowerCase().includes(query) ||
        c.tags.some((t) => t.toLowerCase().includes(query))
    );
  }

  // Filter by featured
  if (filters.isFeatured !== undefined) {
    filtered = filtered.filter((c) => c.isFeatured === filters.isFeatured);
  }

  // Filter by daily
  if (filters.isDaily !== undefined) {
    filtered = filtered.filter((c) => c.isDaily === filters.isDaily);
  }

  return filtered;
}

/**
 * Sort cards client-side
 */
export function sortCardsClient(
  cards: AskMaiaCard[],
  field: 'published_at' | 'title' | 'read_time_minutes' = 'published_at',
  direction: 'asc' | 'desc' = 'desc'
): AskMaiaCard[] {
  const sorted = [...cards];

  sorted.sort((a, b) => {
    let comparison = 0;

    switch (field) {
      case 'published_at':
        comparison = new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
        break;
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'read_time_minutes':
        comparison = a.readTimeMinutes - b.readTimeMinutes;
        break;
    }

    return direction === 'desc' ? -comparison : comparison;
  });

  return sorted;
}

/**
 * Group cards by type
 */
export function groupCardsByType(
  cards: AskMaiaCard[]
): Record<CardType, AskMaiaCard[]> {
  const groups: Record<CardType, AskMaiaCard[]> = {
    daily_transmission: [],
    concept: [],
    practice: [],
    archetype: [],
    deep_dive: [],
    contrast: [],
  };

  for (const card of cards) {
    groups[card.cardType].push(card);
  }

  return groups;
}

/**
 * Group cards by access level
 */
export function groupCardsByAccessLevel(
  cards: AskMaiaCard[]
): Record<AccessLevel, AskMaiaCard[]> {
  const groups: Record<AccessLevel, AskMaiaCard[]> = {
    personal: [],
    practitioner: [],
    pro: [],
  };

  for (const card of cards) {
    groups[card.accessLevel].push(card);
  }

  return groups;
}

/**
 * Extract unique tags from cards
 */
export function extractTags(cards: AskMaiaCard[]): string[] {
  const tagSet = new Set<string>();
  for (const card of cards) {
    for (const tag of card.tags) {
      tagSet.add(tag);
    }
  }
  return Array.from(tagSet).sort();
}

/**
 * Get tag frequency (for tag cloud visualization)
 */
export function getTagFrequency(cards: AskMaiaCard[]): Map<string, number> {
  const frequency = new Map<string, number>();
  for (const card of cards) {
    for (const tag of card.tags) {
      frequency.set(tag, (frequency.get(tag) || 0) + 1);
    }
  }
  return frequency;
}

/**
 * Highlight search terms in text
 */
export function highlightSearchTerms(text: string, searchQuery: string): string {
  if (!searchQuery.trim()) return text;

  const terms = searchQuery.trim().split(/\s+/);
  let highlighted = text;

  for (const term of terms) {
    const regex = new RegExp(`(${escapeRegex(term)})`, 'gi');
    highlighted = highlighted.replace(regex, '<mark>$1</mark>');
  }

  return highlighted;
}

/**
 * Escape special regex characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Get suggested search terms based on existing content
 */
export function getSuggestedSearchTerms(cards: AskMaiaCard[]): string[] {
  const suggestions = new Set<string>();

  // Add all tags
  for (const card of cards) {
    for (const tag of card.tags) {
      suggestions.add(tag);
    }
  }

  // Add card type labels
  suggestions.add('practice');
  suggestions.add('concept');
  suggestions.add('archetype');
  suggestions.add('deep dive');
  suggestions.add('contrast');

  // Add some key terms from titles
  const keyTerms = [
    'shadow',
    'jung',
    'trauma',
    'meditation',
    'nervous system',
    'attachment',
    'archetype',
    'hero',
    'psychedelics',
    'consciousness',
  ];
  for (const term of keyTerms) {
    suggestions.add(term);
  }

  return Array.from(suggestions).sort();
}

/**
 * Determine if user has access to a card based on their subscription level
 */
export function hasAccessToCard(
  card: AskMaiaCard,
  userLevel: AccessLevel
): boolean {
  const levelHierarchy: Record<AccessLevel, number> = {
    personal: 0,
    practitioner: 1,
    pro: 2,
  };

  return levelHierarchy[userLevel] >= levelHierarchy[card.accessLevel];
}

/**
 * Filter cards user has access to
 */
export function filterByUserAccess(
  cards: AskMaiaCard[],
  userLevel: AccessLevel
): AskMaiaCard[] {
  return cards.filter((card) => hasAccessToCard(card, userLevel));
}
