/**
 * Journal-Chart Integration API
 *
 * POST - Process a journal entry and link to chart elements
 * GET - Retrieve chart-linked entries and patterns
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import {
  processJournalEntry,
  getJournalChartLinks,
  getJournalPatterns,
  detectJournalPatterns,
  generateChartJournalInsights,
  saveJournalPattern,
  analyzePlanetaryThemes,
  analyzeHouseThemes,
  detectDominantElement,
  TransitAtTime,
} from '@/lib/journal/chartIntegrationService';

export const dynamic = 'force-dynamic';

/**
 * POST /api/journal/chart-integration
 *
 * Process a journal entry and create chart associations
 *
 * Body:
 * - entryId (required): Journal entry ID
 * - entryType (required): 'quick' | 'holoflower' | 'elemental'
 * - content (required): Journal entry text
 * - createdAt (optional): Entry timestamp
 * - activeTransits (optional): Current transits at time of writing
 */
export async function POST(req: NextRequest) {
  try {
    // BEFORE (2026-07-28): `userId` came from the request body with no session
    // resolution. AFTER: session-derived. A body `userId` is ignored.
    const userId = await getMemberIdFromRequest(req);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { entryId, entryType, content, createdAt, activeTransits } = body;

    if (!entryId || !entryType || !content) {
      return NextResponse.json(
        { success: false, error: 'entryId, entryType, and content are required' },
        { status: 400 }
      );
    }

    if (!['quick', 'holoflower', 'elemental'].includes(entryType)) {
      return NextResponse.json(
        { success: false, error: 'entryType must be quick, holoflower, or elemental' },
        { status: 400 }
      );
    }

    // Process the entry
    const link = await processJournalEntry(
      userId,
      entryId,
      entryType,
      content,
      createdAt ? new Date(createdAt) : new Date(),
      activeTransits as TransitAtTime[] | undefined
    );

    // Check for new patterns after processing
    const existingLinks = await getJournalChartLinks(userId, { limit: 50 });
    const patterns = await detectJournalPatterns(userId, existingLinks);

    // Save any new patterns
    for (const pattern of patterns) {
      if (pattern.confidence >= 0.5) {
        await saveJournalPattern(userId, pattern);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        link,
        newPatternsDetected: patterns.filter((p) => p.confidence >= 0.5).length,
      },
    });
  } catch (error) {
    console.error('[Journal Chart Integration] POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process journal entry' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/journal/chart-integration
 *
 * Query params:
 * - userId (required): User ID
 * - planet: Filter by planet
 * - house: Filter by house number
 * - element: Filter by element
 * - insights: If 'true', return comprehensive insights
 * - patterns: If 'true', return detected patterns
 * - analyze: If provided, analyze this content without storing
 * - limit: Max entries to return
 */
export async function GET(req: NextRequest) {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }
  try {
    const { searchParams } = new URL(req.url);

    // BEFORE (2026-07-28): `userId` came from the query string. AFTER: session-derived.
    const userId = await getMemberIdFromRequest(req);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Content analysis mode (no storage)
    const analyzeContent = searchParams.get('analyze');
    if (analyzeContent) {
      const planets = analyzePlanetaryThemes(analyzeContent);
      const houses = analyzeHouseThemes(analyzeContent);
      const dominantElement = detectDominantElement(analyzeContent);

      return NextResponse.json({
        success: true,
        data: {
          analysis: {
            planets,
            houses,
            dominantElement,
          },
        },
      });
    }

    // Insights mode
    const wantInsights = searchParams.get('insights') === 'true';
    if (wantInsights) {
      const insights = await generateChartJournalInsights(userId);
      return NextResponse.json({
        success: true,
        data: { insights },
      });
    }

    // Patterns mode
    const wantPatterns = searchParams.get('patterns') === 'true';
    if (wantPatterns) {
      const patterns = await getJournalPatterns(userId);
      return NextResponse.json({
        success: true,
        data: { patterns },
      });
    }

    // Default: return chart-linked entries
    const planet = searchParams.get('planet') || undefined;
    const houseStr = searchParams.get('house');
    const house = houseStr ? parseInt(houseStr) : undefined;
    const element = searchParams.get('element') || undefined;
    const limitStr = searchParams.get('limit');
    const limit = limitStr ? parseInt(limitStr) : 50;

    const links = await getJournalChartLinks(userId, {
      planet,
      house,
      element,
      limit,
    });

    return NextResponse.json({
      success: true,
      data: {
        entries: links,
        total: links.length,
      },
    });
  } catch (error) {
    console.error('[Journal Chart Integration] GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch journal chart data' },
      { status: 500 }
    );
  }
}
