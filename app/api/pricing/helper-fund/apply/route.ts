/**
 * Helper Fund Application API
 *
 * POST /api/pricing/helper-fund/apply
 *
 * Submit a Helper Fund scholarship application.
 */

import { NextRequest, NextResponse } from 'next/server';
import { submitHelperFundApplication, getApplicationStatus } from '@/lib/pricing';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { unauthenticatedResponse } from '@/lib/auth/authFailure';

export async function POST(request: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return unauthenticatedResponse();
    }

    // Check for existing pending application
    const existing = await getApplicationStatus(memberId);
    if (existing && existing.status === 'pending') {
      return NextResponse.json(
        { error: 'You already have a pending application' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { situation, durationRequested, supportType } = body;

    // Validate
    if (!situation || situation.length < 50) {
      return NextResponse.json(
        { error: 'Please provide more detail about your situation (minimum 50 characters)' },
        { status: 400 }
      );
    }

    if (!['3_months', '6_months', 'ongoing'].includes(durationRequested)) {
      return NextResponse.json(
        { error: 'Invalid duration requested' },
        { status: 400 }
      );
    }

    if (!['waived', 'reduced', 'full_scholarship'].includes(supportType)) {
      return NextResponse.json(
        { error: 'Invalid support type' },
        { status: 400 }
      );
    }

    // Submit application
    const applicationId = await submitHelperFundApplication(
      memberId,
      situation,
      durationRequested,
      supportType
    );

    return NextResponse.json({
      success: true,
      applicationId,
      message: 'Your application has been submitted. We will review it within 3-5 days.',
    });
  } catch (error) {
    console.error('[helper-fund/apply] Error:', error);
    return NextResponse.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return unauthenticatedResponse();
    }

    const application = await getApplicationStatus(memberId);

    if (!application) {
      return NextResponse.json({ application: null });
    }

    return NextResponse.json({
      application: {
        id: application.id,
        status: application.status,
        durationRequested: application.durationRequested,
        supportType: application.supportType,
        submittedAt: application.submittedAt,
        reviewedAt: application.reviewedAt,
        scholarshipStart: application.scholarshipStart,
        scholarshipEnd: application.scholarshipEnd,
      },
    });
  } catch (error) {
    console.error('[helper-fund/apply GET] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch application status' },
      { status: 500 }
    );
  }
}
