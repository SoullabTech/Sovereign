export const dynamic = 'force-static';
export async function generateStaticParams() { return [{ id: 'default' }]; }

/**
 * Practitioner API - Individual Practitioner Routes
 *
 * GET /api/practitioner/[id] - Get practitioner by ID
 * PATCH /api/practitioner/[id] - Update practitioner
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getPractitionerById,
  updatePractitioner,
} from '@/lib/practitioner/practitionerService';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// Get a practitioner by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const practitioner = await getPractitionerById(id);

    if (!practitioner) {
      return NextResponse.json(
        { error: 'Practitioner not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ practitioner });
  } catch (error) {
    console.error('[PRACTITIONER] Get error:', error);
    return NextResponse.json(
      { error: 'Failed to get practitioner' },
      { status: 500 }
    );
  }
}

// Update a practitioner
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Extract allowed fields for update
    const {
      name,
      email,
      businessName,
      tagline,
      bio,
      status,
      stripeAccountId,
      revenueSharePercent,
    } = body;

    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (businessName !== undefined) updateData.businessName = businessName;
    if (tagline !== undefined) updateData.tagline = tagline;
    if (bio !== undefined) updateData.bio = bio;
    if (status !== undefined) updateData.status = status;
    if (stripeAccountId !== undefined) updateData.stripeAccountId = stripeAccountId;
    if (revenueSharePercent !== undefined) updateData.revenueSharePercent = revenueSharePercent;

    const practitioner = await updatePractitioner(id, updateData);

    if (!practitioner) {
      return NextResponse.json(
        { error: 'Practitioner not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      practitioner,
    });
  } catch (error) {
    console.error('[PRACTITIONER] Update error:', error);
    return NextResponse.json(
      { error: 'Failed to update practitioner' },
      { status: 500 }
    );
  }
}
