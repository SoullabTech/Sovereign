/**
 * ASK THE BOOK API ROUTE
 *
 * POST /api/elemental-alchemy/ask
 * Allows users to query Kelly's Elemental Alchemy book directly
 *
 * Request: { userId: string, question: string, context?: string, forceElement?: string }
 * Response: { chapters[], practices[], detected, confidence, citations? }
 */

import { NextRequest, NextResponse } from 'next/server';
import { askTheBook, BookQuery } from '@/lib/features/AskTheBookService';
import { query } from '@/lib/db/postgres';

// Valid element types for forcing chapter load
type ForceElement = 'fire' | 'water' | 'earth' | 'air' | 'aether' | 'spiralogic';

const VALID_ELEMENTS: ForceElement[] = ['fire', 'water', 'earth', 'air', 'aether', 'spiralogic'];

function isValidElement(x: unknown): x is ForceElement {
  return typeof x === 'string' && VALID_ELEMENTS.includes(x as ForceElement);
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { userId, question, context, forceElement } = body;

    // Validate required fields
    if (!userId || !question) {
      return NextResponse.json(
        { error: 'userId and question are required' },
        { status: 400 }
      );
    }

    // Validate question length
    if (question.length < 3) {
      return NextResponse.json(
        { error: 'Question must be at least 3 characters' },
        { status: 400 }
      );
    }

    if (question.length > 1000) {
      return NextResponse.json(
        { error: 'Question must be less than 1000 characters' },
        { status: 400 }
      );
    }

    // Build query object
    const bookQuery: BookQuery = {
      query: question,
      userId,
      timestamp: new Date().toISOString(),
      // If forceElement is provided and valid, use it to bypass semantic detection
      requestedElement: isValidElement(forceElement) ? forceElement : undefined
    };

    // Call the Ask the Book service
    const response = await askTheBook(bookQuery);

    // Save query to database
    try {
      await query(
        `
        INSERT INTO ea_book_queries (
          user_id,
          query_text,
          detected_element,
          detected_facet,
          detected_themes,
          confidence,
          result_json,
          chapters_loaded,
          created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
        `,
        [
          userId,
          question,
          response.loadedChapters[0]?.element || null,
          null, // We don't detect specific facet in Ask the Book yet
          JSON.stringify(response.detectedThemes),
          response.loadedChapters[0]?.relevance || null,
          JSON.stringify(response),
          response.loadedChapters.map(c => c.element),
        ]
      );
    } catch (dbError) {
      // Log but don't fail the request if DB insert fails
      console.error('❌ [ASK BOOK] Failed to save query to database:', dbError);
    }

    // Format response for client
    return NextResponse.json({
      success: true,
      data: {
        // Main response
        query: response.query,
        detectedThemes: response.detectedThemes,

        // Chapters (with full content for companion mode)
        chapters: response.loadedChapters.map(chapter => ({
          element: chapter.element,
          title: chapter.title,
          excerpt: chapter.excerpt,
          relevance: Math.round(chapter.relevance * 100), // Convert to percentage
          content: response.fullTeaching || chapter.excerpt, // Include full content
        })),

        // Full teaching (if available)
        fullTeaching: response.fullTeaching,

        // Guidance
        suggestedQuestions: response.suggestedQuestions,
        practices: response.relatedPractices,

        // Metadata
        timestamp: response.timestamp,
      },
    });

  } catch (error) {
    console.error('❌ [ASK BOOK API] Error:', error);

    return NextResponse.json(
      {
        error: 'Failed to process book query',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/elemental-alchemy/ask?userId=xxx
 * Get recent queries for a user
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Get recent queries from database
    const result = await query(
      `
      SELECT
        id,
        query_text,
        detected_element,
        detected_themes,
        confidence,
        chapters_loaded,
        was_helpful,
        created_at
      FROM ea_book_queries
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2
      `,
      [userId, limit]
    );

    return NextResponse.json({
      success: true,
      data: {
        queries: result.rows.map(row => ({
          id: row.id,
          question: row.query_text,
          detectedElement: row.detected_element,
          detectedThemes: row.detected_themes,
          confidence: row.confidence,
          chaptersLoaded: row.chapters_loaded,
          wasHelpful: row.was_helpful,
          createdAt: row.created_at,
        })),
        total: result.rows.length,
      },
    });

  } catch (error) {
    console.error('❌ [ASK BOOK API GET] Error:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch queries',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/elemental-alchemy/ask/:id
 * Update query feedback (was it helpful?)
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { queryId, wasHelpful, timeSpent } = body;

    if (!queryId) {
      return NextResponse.json(
        { error: 'queryId is required' },
        { status: 400 }
      );
    }

    // Update query feedback
    await query(
      `
      UPDATE ea_book_queries
      SET
        was_helpful = $2,
        time_spent_seconds = $3
      WHERE id = $1
      `,
      [queryId, wasHelpful, timeSpent]
    );

    return NextResponse.json({
      success: true,
      message: 'Feedback saved',
    });

  } catch (error) {
    console.error('❌ [ASK BOOK API PATCH] Error:', error);

    return NextResponse.json(
      {
        error: 'Failed to update feedback',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
