/**
 * EMERGENCY KIT API
 *
 * GET/POST/DELETE /api/practitioner/clients/[clientId]/emergency
 *
 * Per-client safety information management.
 * Always one click away when you need it.
 *
 * AUTHORIZATION: Session-based. Practitioner can only access their own clients.
 * PHI NOTICE: This data may contain sensitive health information.
 */

export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

import { NextRequest, NextResponse } from 'next/server';
import { requireMemberId } from '@/lib/auth/session';
import {
  getEmergencyInfo,
  upsertEmergencyInfo,
  deleteEmergencyInfo,
  getDefaultCrisisResources,
} from '@/lib/practitioner/sessionPrep';

interface RouteParams {
  params: Promise<{ clientId: string }>;
}

/**
 * GET /api/practitioner/clients/[clientId]/emergency
 *
 * Get emergency info for a client.
 * If no info exists, returns default crisis resources template.
 *
 * Auth: Requires valid session. Practitioner ID derived from session.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }

  try {
    // Auth: Get practitioner ID from verified session
    const practitionerId = await requireMemberId();

    const { clientId } = await params;

    const info = await getEmergencyInfo(practitionerId, clientId);

    // getEmergencyInfo returns null if client doesn't exist OR doesn't belong to practitioner
    // We intentionally don't distinguish these cases (prevents enumeration)
    if (info === null) {
      // Check if it's genuinely "no emergency info" vs "no access"
      // The library function returns null for both, so we return template for valid clients
      // This is safe because the library verified ownership
      return NextResponse.json({
        emergency_info: null,
        template: {
          emergency_contacts: [],
          safety_plan: '',
          medications: '',
          medical_conditions: '',
          risk_notes: '',
          crisis_resources: getDefaultCrisisResources(),
        },
      });
    }

    return NextResponse.json({ emergency_info: info });
  } catch (error) {
    // Handle auth errors specifically
    if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.error('[Emergency Kit API] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch emergency info' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/practitioner/clients/[clientId]/emergency
 *
 * Create or update emergency info for a client.
 *
 * Auth: Requires valid session. Practitioner ID derived from session.
 *
 * Body:
 * - emergency_contacts: array of {name, relationship, phone, is_primary}
 * - safety_plan: string
 * - medications: string
 * - medical_conditions: string
 * - risk_notes: string
 * - crisis_resources: array of {name, phone, type}
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    // Auth: Get practitioner ID from verified session
    const practitionerId = await requireMemberId();

    const { clientId } = await params;
    const body = await request.json();

    // Remove any practitionerId from body (don't trust client-provided identity)
    const { practitionerId: _ignored, ...input } = body;

    const info = await upsertEmergencyInfo(practitionerId, clientId, input);

    return NextResponse.json({
      success: true,
      emergency_info: info,
    });
  } catch (error) {
    // Handle auth errors specifically
    if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Handle ownership/not-found errors
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    console.error('[Emergency Kit API] POST error:', error);
    return NextResponse.json(
      { error: 'Failed to save emergency info' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/practitioner/clients/[clientId]/emergency
 *
 * Delete emergency info for a client.
 *
 * Auth: Requires valid session. Practitioner ID derived from session.
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Auth: Get practitioner ID from verified session
    const practitionerId = await requireMemberId();

    const { clientId } = await params;

    const success = await deleteEmergencyInfo(practitionerId, clientId);

    if (!success) {
      // Could be "not found" or "not owned" - return 403 for both
      return NextResponse.json(
        { error: 'Access denied or not found' },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    // Handle auth errors specifically
    if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.error('[Emergency Kit API] DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete emergency info' },
      { status: 500 }
    );
  }
}
