/**
 * Tool Suggestions API
 *
 * POST - Create a new tool suggestion
 * GET  - Get member's own suggestions
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import {
  createSuggestion,
  getMemberSuggestions,
  validateSuggestion,
} from '@/lib/services/toolSuggestionsService';

export async function GET(request: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const suggestions = await getMemberSuggestions(memberId);

    return NextResponse.json({
      success: true,
      suggestions,
    });
  } catch (error) {
    console.error('[tool-suggestions] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to load suggestions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate input
    const validation = validateSuggestion(body);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Create suggestion
    const suggestion = await createSuggestion(memberId, validation.data);

    return NextResponse.json({
      success: true,
      suggestion,
    });
  } catch (error) {
    console.error('[tool-suggestions] POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create suggestion' },
      { status: 500 }
    );
  }
}
