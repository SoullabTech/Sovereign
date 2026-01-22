export const dynamic = 'force-dynamic';

/**
 * GET /api/capsules/:id - Get a single capsule
 * PATCH /api/capsules/:id - Update a capsule
 * DELETE /api/capsules/:id - Delete a capsule (hard delete)
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireMemberId } from '@/lib/auth/session';
import {
  getCapsuleById,
  updateCapsule,
  deleteCapsule,
  CapsuleUpdateSchema,
} from '@/lib/capsules';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/capsules/:id
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const memberId = await requireMemberId();
    const { id } = await params;

    const capsule = await getCapsuleById({
      userId: memberId,
      capsuleId: id,
    });

    if (!capsule) {
      return NextResponse.json(
        { error: 'Capsule not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ capsule });
  } catch (error) {
    if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.error('[API] GET /api/capsules/:id error:', error);
    return NextResponse.json(
      { error: 'Failed to get capsule' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/capsules/:id
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const memberId = await requireMemberId();
    const { id } = await params;

    // Parse and validate body
    const body = await request.json();
    const parseResult = CapsuleUpdateSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const capsule = await updateCapsule({
      userId: memberId,
      capsuleId: id,
      patch: parseResult.data,
    });

    if (!capsule) {
      return NextResponse.json(
        { error: 'Capsule not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ capsule });
  } catch (error) {
    if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.error('[API] PATCH /api/capsules/:id error:', error);
    return NextResponse.json(
      { error: 'Failed to update capsule' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/capsules/:id
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const memberId = await requireMemberId();
    const { id } = await params;

    const deleted = await deleteCapsule({
      userId: memberId,
      capsuleId: id,
    });

    if (!deleted) {
      return NextResponse.json(
        { error: 'Capsule not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.error('[API] DELETE /api/capsules/:id error:', error);
    return NextResponse.json(
      { error: 'Failed to delete capsule' },
      { status: 500 }
    );
  }
}
