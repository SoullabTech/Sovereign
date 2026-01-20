export const dynamic = 'force-dynamic';

export function generateStaticParams() {
  return [{ caseId: 'default' }];
}

/**
 * CASE DETAIL API
 *
 * Get, update, and archive individual cases.
 * GET /api/caseload/[caseId] - Get case with stats
 * PATCH /api/caseload/[caseId] - Update case
 * DELETE /api/caseload/[caseId] - Archive case
 */

import { NextRequest, NextResponse } from 'next/server';
import { CaseStore } from '@/lib/caseload/CaseStore';
import type { UpdateCaseInput } from '@/lib/caseload/types';

interface RouteParams {
  params: Promise<{ caseId: string }>;
}

/**
 * GET /api/caseload/[caseId]
 *
 * Get a case with statistics and recent notes.
 *
 * Query params:
 * - memberId (required): Practitioner's member ID
 * - includeNotes: Include recent notes (default: true)
 * - notesLimit: Number of notes to include (default: 5)
 */
export async function GET(request: NextRequest, context: RouteParams) {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }
  try {
    const { caseId } = await context.params;
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');

    if (!memberId) {
      return NextResponse.json(
        { error: 'memberId required' },
        { status: 400 }
      );
    }

    const caseData = await CaseStore.getCaseWithStats(caseId, memberId);

    if (!caseData) {
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      );
    }

    // Optionally include recent notes
    const includeNotes = searchParams.get('includeNotes') !== 'false';
    const notesLimit = parseInt(searchParams.get('notesLimit') || '5');

    let recentNotes: any[] = [];
    if (includeNotes) {
      recentNotes = await CaseStore.listNotes(caseId, memberId, { limit: notesLimit });
    }

    // Get capture links
    const captureLinks = await CaseStore.getCaptureLinks(caseId);

    return NextResponse.json({
      case: caseData,
      recentNotes,
      captureLinks,
    });
  } catch (error) {
    console.error('[CASELOAD] Get case error:', error);
    return NextResponse.json(
      { error: 'Failed to get case' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/caseload/[caseId]
 *
 * Update a case.
 *
 * Body:
 * - memberId (required): Practitioner's member ID
 * - Any UpdateCaseInput fields to update
 */
export async function PATCH(request: NextRequest, context: RouteParams) {
  try {
    const { caseId } = await context.params;
    const body = await request.json();
    const { memberId, ...updates } = body;

    if (!memberId) {
      return NextResponse.json(
        { error: 'memberId required' },
        { status: 400 }
      );
    }

    // Validate status if provided
    if (updates.case_status) {
      const validStatuses = ['active', 'paused', 'completed', 'transferred', 'archived'];
      if (!validStatuses.includes(updates.case_status)) {
        return NextResponse.json(
          { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
          { status: 400 }
        );
      }
    }

    // Validate element if provided
    if (updates.primary_element) {
      const validElements = ['earth', 'water', 'fire', 'air', 'aether'];
      if (!validElements.includes(updates.primary_element)) {
        return NextResponse.json(
          { error: `Invalid element. Must be one of: ${validElements.join(', ')}` },
          { status: 400 }
        );
      }
    }

    // Validate privacy mode if provided
    if (updates.privacy_mode) {
      const validModes = ['private', 'transparent', 'consent_based'];
      if (!validModes.includes(updates.privacy_mode)) {
        return NextResponse.json(
          { error: `Invalid privacy mode. Must be one of: ${validModes.join(', ')}` },
          { status: 400 }
        );
      }
    }

    const updatedCase = await CaseStore.updateCase(caseId, memberId, updates as UpdateCaseInput);

    if (!updatedCase) {
      return NextResponse.json(
        { error: 'Case not found or not authorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      case: updatedCase,
    });
  } catch (error: any) {
    // Handle unique constraint violation
    if (error?.code === '23505') {
      return NextResponse.json(
        { error: 'A case with this client identifier already exists' },
        { status: 409 }
      );
    }

    console.error('[CASELOAD] Update case error:', error);
    return NextResponse.json(
      { error: 'Failed to update case' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/caseload/[caseId]
 *
 * Archive a case (soft delete).
 *
 * Body:
 * - memberId (required): Practitioner's member ID
 */
export async function DELETE(request: NextRequest, context: RouteParams) {
  try {
    const { caseId } = await context.params;
    const body = await request.json();
    const { memberId } = body;

    if (!memberId) {
      return NextResponse.json(
        { error: 'memberId required' },
        { status: 400 }
      );
    }

    const archivedCase = await CaseStore.archiveCase(caseId, memberId);

    if (!archivedCase) {
      return NextResponse.json(
        { error: 'Case not found or not authorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      case: archivedCase,
    });
  } catch (error) {
    console.error('[CASELOAD] Archive case error:', error);
    return NextResponse.json(
      { error: 'Failed to archive case' },
      { status: 500 }
    );
  }
}
