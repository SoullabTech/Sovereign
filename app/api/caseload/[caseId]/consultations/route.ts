export const dynamic = 'force-static';

export function generateStaticParams() {
  return [{ caseId: 'default' }];
}

/**
 * CASE CONSULTATIONS API
 *
 * Generate and list MAIA consultations for a case.
 * GET /api/caseload/[caseId]/consultations - List consultations
 * POST /api/caseload/[caseId]/consultations - Generate new consultation
 */

import { NextRequest, NextResponse } from 'next/server';
import { CaseStore } from '@/lib/caseload/CaseStore';
import { CaseConsultationService, ConsultationType } from '@/lib/caseload/CaseConsultationService';

interface RouteParams {
  params: Promise<{ caseId: string }>;
}

const VALID_CONSULTATION_TYPES: ConsultationType[] = [
  'case_formulation',
  'intervention_planning',
  'pattern_analysis',
  'stuck_point',
  'supervision',
  'spiralogic_mapping',
];

/**
 * GET /api/caseload/[caseId]/consultations
 *
 * List consultations for a case.
 *
 * Query params:
 * - memberId (required): Practitioner's member ID
 * - limit: Max results (default 10)
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

    const limit = parseInt(searchParams.get('limit') || '10');
    const consultations = await CaseConsultationService.list({
      caseId,
      memberId,
      limit,
    });

    return NextResponse.json({
      ok: true,
      consultations,
      case_id: caseId,
      client_identifier: caseData.client_identifier,
    });
  } catch (error) {
    console.error('[CASELOAD] List consultations error:', error);
    return NextResponse.json(
      { error: 'Failed to list consultations' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/caseload/[caseId]/consultations
 *
 * Generate a new MAIA consultation.
 *
 * Body:
 * - memberId (required): Practitioner's member ID
 * - consultationType: Type of consultation (default: pattern_analysis)
 * - focus: Optional practitioner query/focus question
 */
export async function POST(request: NextRequest, context: RouteParams) {
  try {
    const { caseId } = await context.params;
    const body = await request.json();
    const { memberId, consultationType, focus } = body;

    if (!memberId) {
      return NextResponse.json(
        { error: 'memberId required' },
        { status: 400 }
      );
    }

    // Validate consultation type if provided
    if (consultationType && !VALID_CONSULTATION_TYPES.includes(consultationType)) {
      return NextResponse.json(
        { error: `Invalid consultationType. Must be one of: ${VALID_CONSULTATION_TYPES.join(', ')}` },
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

    const consultation = await CaseConsultationService.generate({
      caseId,
      memberId,
      consultationType: consultationType || 'pattern_analysis',
      focus,
    });

    return NextResponse.json({
      ok: true,
      consultation,
    });
  } catch (error) {
    console.error('[CASELOAD] Generate consultation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate consultation' },
      { status: 500 }
    );
  }
}
