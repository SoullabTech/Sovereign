export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import {
  getCards,
  getFeaturedCards,
  getDailyTransmission,
  searchCards,
  seedCardsIfEmpty,
} from '@/lib/askMaia/cardService';
import type { AskMaiaFilters, AskMaiaSortField } from '@/lib/askMaia/types';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;

    // Parse query parameters
    const search = searchParams.get('search') || undefined;
    const cardTypes = searchParams.getAll('cardType');
    const accessLevels = searchParams.getAll('accessLevel');
    const tags = searchParams.getAll('tag');
    const featured = searchParams.get('featured') === 'true';
    const daily = searchParams.get('daily') === 'true';
    const sortBy = searchParams.get('sortBy') || 'published_at';
    const sortDir = searchParams.get('sortDir') || 'desc';
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Seed cards if database is empty (first request)
    await seedCardsIfEmpty();

    // Handle special cases
    if (daily) {
      const dailyCard = await getDailyTransmission();
      return NextResponse.json({
        success: true,
        card: dailyCard,
      });
    }

    if (featured) {
      const featuredCards = await getFeaturedCards(limit);
      return NextResponse.json({
        success: true,
        cards: featuredCards,
        total: featuredCards.length,
      });
    }

    // Handle search
    if (search) {
      const results = await searchCards(search, limit);

      return NextResponse.json({
        success: true,
        cards: results,
        total: results.length,
        search,
      });
    }

    // Build filters
    const filters: AskMaiaFilters = {};
    if (cardTypes.length > 0) {
      filters.cardTypes = cardTypes as any[];
    }
    if (accessLevels.length > 0) {
      filters.accessLevels = accessLevels as any[];
    }
    if (tags.length > 0) {
      filters.tags = tags;
    }

    // Get cards with pagination
    const { cards, totalCount, hasMore } = await getCards({
      filters: Object.keys(filters).length > 0 ? filters : undefined,
      pagination: { limit, offset },
      sort: {
        field: sortBy as AskMaiaSortField,
        direction: sortDir as 'asc' | 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      cards,
      total: totalCount,
      hasMore,
      offset,
      limit,
    });
  } catch (error: any) {
    console.error('Ask MAIA cards GET error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to fetch cards',
      },
      { status: 500 }
    );
  }
}
