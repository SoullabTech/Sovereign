export const dynamic = 'error';

/**
 * CASE NOTES API
 *
 * List and create session notes for a case.
 * GET /api/caseload/[caseId]/notes - List notes
 * POST /api/caseload/[caseId]/notes - Create note
 */

import { NextRequest, NextResponse } from 'next/server';
import { CaseStore } from '@/lib/caseload/CaseStore';
import type { CreateNoteInput, NoteListFilters } from '@/lib/caseload/types';

interface RouteParams {
  params: Promise<{ caseId: string }>;
}

/**
 * GET /api/caseload/[caseId]/notes
 *
 * List notes for a case with optional filters.
 *
 * Query params:
 * - memberId (required): Practitioner's member ID
 * - type: Filter by note type (session, observation, etc.)
 * - element: Filter by element focus
 * - from_date: Filter by session date (from)
 * - to_date: Filter by session date (to)
 * - limit: Max results (default 50)
 * - offset: Pagination offset
 */
export async function GET(request: NextRequest, context: RouteParams) {
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

    // Verify case exists and belongs to practitioner
    const caseData = await CaseStore.getCase(caseId, memberId);
    if (!caseData) {
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      );
    }

    const filters: NoteListFilters = {
      type: searchParams.get('type') as any || undefined,
      element: searchParams.get('element') as any || undefined,
      from_date: searchParams.get('from_date') || undefined,
      to_date: searchParams.get('to_date') || undefined,
      limit: parseInt(searchParams.get('limit') || '50'),
      offset: parseInt(searchParams.get('offset') || '0'),
    };

    const notes = await CaseStore.listNotes(caseId, memberId, filters);

    return NextResponse.json({
      notes,
      case_id: caseId,
      client_identifier: caseData.client_identifier,
      filters,
    });
  } catch (error) {
    console.error('[CASELOAD] List notes error:', error);
    return NextResponse.json(
      { error: 'Failed to list notes' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/caseload/[caseId]/notes
 *
 * Create a new case note.
 *
 * Body:
 * - memberId (required): Practitioner's member ID
 * - note_type (required): session, observation, consultation, progress, intake, discharge, supervision
 * - content (required): Note content
 * - session_date: Date of session (defaults to today)
 * - session_duration_minutes: Duration in minutes
 * - interventions_used: Array of interventions
 * - themes_observed: Array of themes
 * - element_focus: Primary element in session
 * - spiral_movement: Any spiral transitions observed
 * - linked_capture_session_id: Link to capture session
 */
export async function POST(request: NextRequest, context: RouteParams) {
  try {
    const { caseId } = await context.params;
    const body = await request.json();
    const { memberId, ...noteInput } = body;

    if (!memberId) {
      return NextResponse.json(
        { error: 'memberId required' },
        { status: 400 }
      );
    }

    if (!noteInput.note_type) {
      return NextResponse.json(
        { error: 'note_type required' },
        { status: 400 }
      );
    }

    if (!noteInput.content) {
      return NextResponse.json(
        { error: 'content required' },
        { status: 400 }
      );
    }

    // Validate note type
    const validTypes = ['session', 'observation', 'consultation', 'progress', 'intake', 'discharge', 'supervision'];
    if (!validTypes.includes(noteInput.note_type)) {
      return NextResponse.json(
        { error: `Invalid note_type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Verify case exists and belongs to practitioner
    const caseData = await CaseStore.getCase(caseId, memberId);
    if (!caseData) {
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      );
    }

    // Validate element if provided
    if (noteInput.element_focus) {
      const validElements = ['earth', 'water', 'fire', 'air', 'aether'];
      if (!validElements.includes(noteInput.element_focus)) {
        return NextResponse.json(
          { error: `Invalid element_focus. Must be one of: ${validElements.join(', ')}` },
          { status: 400 }
        );
      }
    }

    const newNote = await CaseStore.createNote(caseId, memberId, noteInput as CreateNoteInput);

    return NextResponse.json({
      success: true,
      note: newNote,
    });
  } catch (error) {
    console.error('[CASELOAD] Create note error:', error);
    return NextResponse.json(
      { error: 'Failed to create note' },
      { status: 500 }
    );
  }
}
