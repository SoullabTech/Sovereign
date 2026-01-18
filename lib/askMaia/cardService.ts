/**
 * Ask MAIA Card Service
 * CRUD operations for knowledge cards
 */

import { query, insertOne, findOne, queryOne } from '@/lib/db/postgres';
import {
  AskMaiaCard,
  AskMaiaCardRow,
  AskMaiaQueryOptions,
  AskMaiaFeedResponse,
  CardType,
  AccessLevel,
  transformCardRow,
  transformCardToRow,
} from './types';

/**
 * Get all cards with optional filtering, sorting, and pagination
 */
export async function getCards(
  options: AskMaiaQueryOptions = {}
): Promise<AskMaiaFeedResponse> {
  const { filters, pagination, sort } = options;

  // Build WHERE clauses
  const whereClauses: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;

  // Filter by card types
  if (filters?.cardTypes && filters.cardTypes.length > 0) {
    whereClauses.push(`card_type = ANY($${paramIndex})`);
    params.push(filters.cardTypes);
    paramIndex++;
  }

  // Filter by access levels
  if (filters?.accessLevels && filters.accessLevels.length > 0) {
    whereClauses.push(`access_level = ANY($${paramIndex})`);
    params.push(filters.accessLevels);
    paramIndex++;
  }

  // Filter by tags
  if (filters?.tags && filters.tags.length > 0) {
    whereClauses.push(`tags && $${paramIndex}`);
    params.push(filters.tags);
    paramIndex++;
  }

  // Filter by featured
  if (filters?.isFeatured !== undefined) {
    whereClauses.push(`is_featured = $${paramIndex}`);
    params.push(filters.isFeatured);
    paramIndex++;
  }

  // Filter by daily
  if (filters?.isDaily !== undefined) {
    whereClauses.push(`is_daily = $${paramIndex}`);
    params.push(filters.isDaily);
    paramIndex++;
  }

  // Full-text search
  if (filters?.searchQuery && filters.searchQuery.trim()) {
    const searchTerms = filters.searchQuery.trim().split(/\s+/).join(' & ');
    whereClauses.push(
      `to_tsvector('english', coalesce(title, '') || ' ' || coalesce(subtitle, '') || ' ' || coalesce(content, '')) @@ to_tsquery('english', $${paramIndex})`
    );
    params.push(searchTerms);
    paramIndex++;
  }

  const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  // Sort
  const sortField = sort?.field || 'published_at';
  const sortDir = sort?.direction || 'desc';
  const orderClause = `ORDER BY ${sortField} ${sortDir}`;

  // Pagination
  const limit = pagination?.limit || 20;
  const offset = pagination?.offset || 0;

  // Get total count
  const countSql = `SELECT COUNT(*) as total FROM ask_maia_cards ${whereClause}`;
  const countResult = await query<{ total: string }>(countSql, params);
  const totalCount = parseInt(countResult.rows[0]?.total || '0', 10);

  // Get cards
  const sql = `
    SELECT * FROM ask_maia_cards
    ${whereClause}
    ${orderClause}
    LIMIT ${limit} OFFSET ${offset}
  `;

  const result = await query<AskMaiaCardRow>(sql, params);
  const cards = result.rows.map(transformCardRow);

  return {
    cards,
    totalCount,
    hasMore: offset + cards.length < totalCount,
  };
}

/**
 * Get a single card by ID
 */
export async function getCardById(id: string): Promise<AskMaiaCard | null> {
  const row = await findOne<AskMaiaCardRow>('ask_maia_cards', 'id', id);
  return row ? transformCardRow(row) : null;
}

/**
 * Get the current daily transmission
 */
export async function getDailyTransmission(): Promise<AskMaiaCard | null> {
  const sql = `
    SELECT * FROM ask_maia_cards
    WHERE is_daily = true
    ORDER BY published_at DESC
    LIMIT 1
  `;

  const result = await query<AskMaiaCardRow>(sql);
  return result.rows[0] ? transformCardRow(result.rows[0]) : null;
}

/**
 * Get featured cards
 */
export async function getFeaturedCards(limit: number = 3): Promise<AskMaiaCard[]> {
  const sql = `
    SELECT * FROM ask_maia_cards
    WHERE is_featured = true AND is_daily = false
    ORDER BY published_at DESC
    LIMIT $1
  `;

  const result = await query<AskMaiaCardRow>(sql, [limit]);
  return result.rows.map(transformCardRow);
}

/**
 * Get cards by type
 */
export async function getCardsByType(
  cardType: CardType,
  limit: number = 10
): Promise<AskMaiaCard[]> {
  const sql = `
    SELECT * FROM ask_maia_cards
    WHERE card_type = $1
    ORDER BY published_at DESC
    LIMIT $2
  `;

  const result = await query<AskMaiaCardRow>(sql, [cardType, limit]);
  return result.rows.map(transformCardRow);
}

/**
 * Get cards by access level
 */
export async function getCardsByAccessLevel(
  accessLevel: AccessLevel,
  limit: number = 10
): Promise<AskMaiaCard[]> {
  const sql = `
    SELECT * FROM ask_maia_cards
    WHERE access_level = $1
    ORDER BY published_at DESC
    LIMIT $2
  `;

  const result = await query<AskMaiaCardRow>(sql, [accessLevel, limit]);
  return result.rows.map(transformCardRow);
}

/**
 * Get related cards (by tags)
 */
export async function getRelatedCards(
  cardId: string,
  limit: number = 4
): Promise<AskMaiaCard[]> {
  const sql = `
    WITH target_card AS (
      SELECT tags FROM ask_maia_cards WHERE id = $1
    )
    SELECT c.* FROM ask_maia_cards c, target_card t
    WHERE c.id != $1
      AND c.tags && t.tags
    ORDER BY
      array_length(ARRAY(SELECT UNNEST(c.tags) INTERSECT SELECT UNNEST(t.tags)), 1) DESC NULLS LAST,
      c.published_at DESC
    LIMIT $2
  `;

  const result = await query<AskMaiaCardRow>(sql, [cardId, limit]);
  return result.rows.map(transformCardRow);
}

/**
 * Search cards by query
 */
export async function searchCards(
  searchQuery: string,
  limit: number = 20
): Promise<AskMaiaCard[]> {
  const searchTerms = searchQuery.trim().split(/\s+/).join(' & ');

  const sql = `
    SELECT *,
      ts_rank(
        to_tsvector('english', coalesce(title, '') || ' ' || coalesce(subtitle, '') || ' ' || coalesce(content, '')),
        to_tsquery('english', $1)
      ) as rank
    FROM ask_maia_cards
    WHERE to_tsvector('english', coalesce(title, '') || ' ' || coalesce(subtitle, '') || ' ' || coalesce(content, ''))
          @@ to_tsquery('english', $1)
    ORDER BY rank DESC, published_at DESC
    LIMIT $2
  `;

  const result = await query<AskMaiaCardRow & { rank: number }>(sql, [searchTerms, limit]);
  return result.rows.map(transformCardRow);
}

/**
 * Get all unique tags
 */
export async function getAllTags(): Promise<string[]> {
  const sql = `
    SELECT DISTINCT UNNEST(tags) as tag
    FROM ask_maia_cards
    WHERE tags IS NOT NULL
    ORDER BY tag
  `;

  const result = await query<{ tag: string }>(sql);
  return result.rows.map((r) => r.tag);
}

/**
 * Create a new card
 */
export async function createCard(
  card: Omit<AskMaiaCard, 'id' | 'createdAt' | 'updatedAt'>
): Promise<AskMaiaCard> {
  const row = transformCardToRow(card);

  const inserted = await insertOne<AskMaiaCardRow>('ask_maia_cards', row);
  return transformCardRow(inserted);
}

/**
 * Update a card
 */
export async function updateCard(
  id: string,
  updates: Partial<Omit<AskMaiaCard, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<AskMaiaCard | null> {
  const setClauses: string[] = [];
  const params: any[] = [id];
  let paramIndex = 2;

  // Map camelCase to snake_case for each field
  const fieldMap: Record<string, string> = {
    cardType: 'card_type',
    accessLevel: 'access_level',
    title: 'title',
    subtitle: 'subtitle',
    content: 'content',
    source: 'source',
    sourceUrl: 'source_url',
    tags: 'tags',
    readTimeMinutes: 'read_time_minutes',
    isFeatured: 'is_featured',
    isDaily: 'is_daily',
    publishedAt: 'published_at',
  };

  for (const [key, value] of Object.entries(updates)) {
    const dbField = fieldMap[key];
    if (dbField && value !== undefined) {
      setClauses.push(`${dbField} = $${paramIndex}`);
      params.push(key === 'publishedAt' ? (value as Date).toISOString() : value);
      paramIndex++;
    }
  }

  if (setClauses.length === 0) {
    return getCardById(id);
  }

  const sql = `
    UPDATE ask_maia_cards
    SET ${setClauses.join(', ')}, updated_at = NOW()
    WHERE id = $1
    RETURNING *
  `;

  const result = await query<AskMaiaCardRow>(sql, params);
  return result.rows[0] ? transformCardRow(result.rows[0]) : null;
}

/**
 * Delete a card
 */
export async function deleteCard(id: string): Promise<boolean> {
  const sql = `DELETE FROM ask_maia_cards WHERE id = $1`;
  const result = await query(sql, [id]);
  return (result.rowCount ?? 0) > 0;
}

/**
 * Seed the database with initial cards
 */
export async function seedCards(
  cards: Omit<AskMaiaCard, 'id' | 'createdAt' | 'updatedAt'>[]
): Promise<number> {
  let inserted = 0;

  for (const card of cards) {
    try {
      await createCard(card);
      inserted++;
    } catch (error) {
      console.error('Failed to insert card:', card.title, error);
    }
  }

  return inserted;
}

/**
 * Check if cards table has any data
 */
export async function hasCards(): Promise<boolean> {
  const result = await queryOne<{ count: string }>(
    'SELECT COUNT(*) as count FROM ask_maia_cards'
  );
  return parseInt(result?.count || '0', 10) > 0;
}

/**
 * Seed cards if the database is empty
 */
export async function seedCardsIfEmpty(): Promise<boolean> {
  const hasExisting = await hasCards();
  if (hasExisting) {
    return false;
  }

  // Import seed cards dynamically to avoid circular dependencies
  const { seedCardsData } = await import('./seedCards');
  await seedCards(seedCardsData);
  return true;
}
