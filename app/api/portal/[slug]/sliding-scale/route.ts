/**
 * PORTAL SLIDING SCALE API
 *
 * GET /api/portal/[slug]/sliding-scale - Get public policy
 * POST /api/portal/[slug]/sliding-scale - Submit a request
 *
 * Client-facing sliding scale request form.
 * No token required for GET (public info).
 * POST requires contact info or token.
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import {
  getPublicPolicy,
  createRequest,
} from '@/lib/practitioner/slidingScale';
import { validatePortalAccess } from '@/lib/portal/messages';
import { resolveClientDisplayName } from '@/lib/stellium/clients';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

/**
 * Helper to get practitioner ID from slug
 */
async function getPractitionerIdFromSlug(slug: string): Promise<string | null> {
  const result = await db.query(
    `SELECT id FROM practitioners WHERE slug = $1 AND status = 'active'`,
    [slug]
  );
  return result.rows[0]?.id || null;
}

/**
 * GET /api/portal/[slug]/sliding-scale
 *
 * Get public sliding scale policy info.
 * No authentication required.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;

    const practitionerId = await getPractitionerIdFromSlug(slug);
    if (!practitionerId) {
      return NextResponse.json(
        { error: 'Portal not found' },
        { status: 404 }
      );
    }

    const policy = await getPublicPolicy(practitionerId);

    if (!policy || !policy.is_enabled) {
      return NextResponse.json({
        available: false,
        message: 'Sliding scale is not currently available.',
      });
    }

    return NextResponse.json({
      available: true,
      policy: {
        public_label: policy.public_label,
        public_description: policy.public_description,
        min_rate_cents: policy.min_rate_cents,
        max_rate_cents: policy.max_rate_cents,
        currency: policy.currency,
        spots_available: policy.spots_available,
        intake_prompt: policy.intake_prompt,
        request_form_enabled: policy.request_form_enabled,
      },
    });
  } catch (error) {
    console.error('[Portal SlidingScale] GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sliding scale info' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/portal/[slug]/sliding-scale
 *
 * Submit a sliding scale request.
 *
 * Body:
 * - token: optional - if client has a portal token
 * - client_name: required if no token
 * - client_email: optional but recommended
 * - requested_rate_cents: optional - specific rate request
 * - message: optional - brief context
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const body = await request.json();

    const practitionerId = await getPractitionerIdFromSlug(slug);
    if (!practitionerId) {
      return NextResponse.json(
        { error: 'Portal not found' },
        { status: 404 }
      );
    }

    // Check if policy is enabled and accepting requests
    const policy = await getPublicPolicy(practitionerId);
    if (!policy || !policy.is_enabled) {
      return NextResponse.json(
        { error: 'Sliding scale is not currently available' },
        { status: 403 }
      );
    }

    if (!policy.request_form_enabled) {
      return NextResponse.json(
        { error: 'Request form is not currently accepting submissions' },
        { status: 403 }
      );
    }

    // Check capacity
    if (policy.spots_available === 0) {
      return NextResponse.json(
        {
          error: 'No sliding scale spots are currently available',
          message: 'All sliding scale spots are currently filled. Please check back later.',
        },
        { status: 409 }
      );
    }

    // Determine client identity
    let clientId: string | undefined;
    let portalTokenId: string | undefined;
    let clientName: string | undefined;
    let clientEmail: string | undefined;

    if (body.token) {
      // Validate token and get client info
      const access = await validatePortalAccess(body.token);
      if (access && access.practitionerId === practitionerId) {
        clientId = access.clientId;
        // portalTokenId comes from the token itself (not returned from validatePortalAccess)

        // Get client name from database
        const clientResult = await db.query(
          `SELECT name, preferred_name, email FROM practitioner_clients WHERE id = $1`,
          [clientId]
        );
        if (clientResult.rows[0]) {
          clientName = resolveClientDisplayName(clientResult.rows[0], null);
          clientEmail = clientResult.rows[0].email;
        }
      }
    }

    // If no token, require at least a name
    if (!clientId) {
      if (!body.client_name || typeof body.client_name !== 'string' || body.client_name.trim().length === 0) {
        return NextResponse.json(
          { error: 'Please provide your name' },
          { status: 400 }
        );
      }
      clientName = body.client_name.trim();
      clientEmail = body.client_email?.trim() || undefined;
    }

    // Validate email format if provided
    if (body.client_email && typeof body.client_email === 'string') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.client_email.trim())) {
        return NextResponse.json(
          { error: 'Please provide a valid email address' },
          { status: 400 }
        );
      }
      clientEmail = body.client_email.trim();
    }

    // Validate requested rate if provided
    let requestedRateCents: number | undefined;
    if (body.requested_rate_cents !== undefined) {
      const rate = parseInt(body.requested_rate_cents, 10);
      if (!isNaN(rate) && rate >= 0) {
        requestedRateCents = rate;
      }
    }

    // Validate message length
    let message: string | undefined;
    if (body.message && typeof body.message === 'string') {
      if (body.message.length > 1000) {
        return NextResponse.json(
          { error: 'Message must be under 1000 characters' },
          { status: 400 }
        );
      }
      message = body.message.trim() || undefined;
    }

    // Create the request
    const slidingRequest = await createRequest(practitionerId, {
      client_id: clientId,
      portal_token_id: portalTokenId,
      client_name: clientName,
      client_email: clientEmail,
      requested_rate_cents: requestedRateCents,
      message,
    });

    // Return success with confirmation
    return NextResponse.json({
      success: true,
      request_id: slidingRequest.id,
      confirmation: {
        message: 'Your request has been received. You will be contacted with a response.',
        // Could add practitioner-specific response time expectations here
      },
    }, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      switch (error.message) {
        case 'POLICY_DISABLED':
          return NextResponse.json(
            { error: 'Sliding scale is not currently available' },
            { status: 403 }
          );

        case 'FORM_DISABLED':
          return NextResponse.json(
            { error: 'Request form is not currently accepting submissions' },
            { status: 403 }
          );

        case 'CAPACITY_FULL':
          return NextResponse.json(
            {
              error: 'No sliding scale spots are currently available',
              message: 'All sliding scale spots are currently filled. Please check back later.',
            },
            { status: 409 }
          );
      }
    }

    console.error('[Portal SlidingScale] POST Error:', error);
    return NextResponse.json(
      { error: 'Failed to submit request' },
      { status: 500 }
    );
  }
}
