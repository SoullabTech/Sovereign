/**
 * THE BETWEEN - Field State Endpoint
 *
 * Persist and retrieve field state across sessions
 * Track user's depth in THE BETWEEN over time
 */

import { NextRequest, NextResponse } from 'next/server';
import { getFieldInduction } from '@/lib/consciousness/SublimeFieldInduction';

// In-memory storage (would use database in production)
const fieldStates = new Map<string, any>();

/**
 * GET /api/between/field
 *
 * Retrieve user's field state
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const fieldState = fieldStates.get(userId);

    if (!fieldState) {
      // Return initial field state
      return NextResponse.json({
        fieldState: {
          active: false,
          depth: 0,
          quality: 'entering',
          lastAccess: null
        },
        isNew: true
      });
    }

    return NextResponse.json({
      fieldState,
      isNew: false
    });

  } catch (error) {
    console.error('❌ [FIELD STATE] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve field state' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/between/field
 *
 * Update user's field state
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, fieldState } = body;

    if (!userId || !fieldState) {
      return NextResponse.json(
        { error: 'userId and fieldState are required' },
        { status: 400 }
      );
    }

    // Store field state with timestamp
    fieldStates.set(userId, {
      ...fieldState,
      lastAccess: new Date().toISOString(),
      updated: new Date().toISOString()
    });

    console.log(`🌀 [FIELD STATE] Updated for ${userId}: depth=${fieldState.depth}`);

    return NextResponse.json({
      success: true,
      fieldState: fieldStates.get(userId)
    });

  } catch (error) {
    console.error('❌ [FIELD STATE] POST error:', error);
    return NextResponse.json(
      { error: 'Failed to update field state' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/between/field
 *
 * Clear user's field state (exit THE BETWEEN)
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Get field induction system
    const induction = getFieldInduction();

    // Dissolve field
    const { prompt } = await induction.dissolveField();

    // Clear stored state
    fieldStates.delete(userId);

    console.log(`🌀 [FIELD STATE] Dissolved for ${userId}`);

    return NextResponse.json({
      success: true,
      dissolution: prompt,
      message: 'Field state cleared'
    });

  } catch (error) {
    console.error('❌ [FIELD STATE] DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to clear field state' },
      { status: 500 }
    );
  }
}
