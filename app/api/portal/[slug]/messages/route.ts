/**
 * PORTAL MESSAGES API
 *
 * GET/POST /api/portal/[slug]/messages
 *
 * Client-facing between-session messaging.
 * Requires valid message token for authentication.
 *
 * AUTHORIZATION: Token-based. Client ID derived from token.
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import {
  validatePortalAccess,
  getPortalMessagingContext,
  sendClientMessage,
  getClientMessageHistory,
  type MessageType,
  type MessageUrgency,
} from '@/lib/portal/messages';
import { sendSafetyConcernNotification, logSafetyConcern } from '@/lib/notifications/safety';

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
 * GET /api/portal/[slug]/messages
 *
 * Get messaging context and history for client.
 * Query params:
 * - token: required - message access token
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const url = new URL(request.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token required' },
        { status: 401 }
      );
    }

    // Validate token
    const access = await validatePortalAccess(token);
    if (!access) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Verify slug matches the practitioner from token
    const practitionerId = await getPractitionerIdFromSlug(slug);
    if (!practitionerId || practitionerId !== access.practitionerId) {
      return NextResponse.json(
        { error: 'Portal not found' },
        { status: 404 }
      );
    }

    // Get messaging context
    const context = await getPortalMessagingContext(access.clientId, access.practitionerId);

    if (!context) {
      return NextResponse.json(
        { error: 'Messaging not available' },
        { status: 404 }
      );
    }

    return NextResponse.json({ context });
  } catch (error) {
    console.error('[Portal Messages API] GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/portal/[slug]/messages
 *
 * Send a between-session note to practitioner.
 * Body:
 * - token: required - message access token
 * - message_type: optional - reflection, question, win, struggle, logistics
 * - urgency: optional - not_urgent, time_sensitive, safety_concern
 * - body: required - message content
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const body = await request.json();

    const { token, message_type, urgency = 'not_urgent', body: messageBody } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'Token required' },
        { status: 401 }
      );
    }

    // Validate token
    const access = await validatePortalAccess(token);
    if (!access) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Verify slug matches
    const practitionerId = await getPractitionerIdFromSlug(slug);
    if (!practitionerId || practitionerId !== access.practitionerId) {
      return NextResponse.json(
        { error: 'Portal not found' },
        { status: 404 }
      );
    }

    // Validate message body
    if (!messageBody || typeof messageBody !== 'string' || messageBody.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message cannot be empty' },
        { status: 400 }
      );
    }

    // Validate message type if provided
    const validTypes: MessageType[] = ['reflection', 'question', 'win', 'struggle', 'logistics'];
    if (message_type && !validTypes.includes(message_type)) {
      return NextResponse.json(
        { error: `Invalid message type. Valid options: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate urgency
    const validUrgencies: MessageUrgency[] = ['not_urgent', 'time_sensitive', 'safety_concern'];
    if (!validUrgencies.includes(urgency)) {
      return NextResponse.json(
        { error: `Invalid urgency. Valid options: ${validUrgencies.join(', ')}` },
        { status: 400 }
      );
    }

    // Send message
    const result = await sendClientMessage(access.clientId, access.practitionerId, {
      message_type,
      urgency,
      body: messageBody.trim(),
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to send message' },
        { status: 400 }
      );
    }

    // Handle safety concern notifications (idempotent: log first, email only on new)
    if (urgency === 'safety_concern' && result.message) {
      // Step 1: Log safety concern SYNCHRONOUSLY (this is the idempotency gate)
      const logResult = await logSafetyConcern(
        access.practitionerId,
        access.clientId,
        result.message.id
      );

      // Step 2: Only send email if this is a NEW log entry (prevents duplicate emails)
      if (logResult.isNew && logResult.logId) {
        // Get client name for notification
        const clientResult = await db.query(
          `SELECT name, preferred_name FROM practitioner_clients WHERE id = $1`,
          [access.clientId]
        );
        const clientName = clientResult.rows[0]?.preferred_name || clientResult.rows[0]?.name || 'A client';

        // Send email (best-effort, don't block response)
        // Pass logId so email status gets tracked in the log
        sendSafetyConcernNotification(
          {
            practitionerId: access.practitionerId,
            clientId: access.clientId,
            messageId: result.message.id,
            messageBody: messageBody.trim(),
            clientName,
          },
          logResult.logId
        ).then(notifResult => {
          if (notifResult.success) {
            console.log(`[Portal Messages API] Safety notification sent for message ${result.message!.id}`);
          } else {
            console.error(`[Portal Messages API] Safety notification failed: ${notifResult.error}`);
          }
        }).catch(err => {
          console.error('[Portal Messages API] Safety notification error:', err);
        });
      } else if (!logResult.isNew) {
        // Duplicate request - log was already created, skip email
        console.log(`[Portal Messages API] Duplicate safety concern for message ${result.message.id} - skipping email`);
      }
    }

    // Get the effective policy for confirmation message
    const context = await getPortalMessagingContext(access.clientId, access.practitionerId);

    return NextResponse.json({
      success: true,
      message: result.message,
      confirmation: {
        policy_summary: context?.policy_summary || 'Your message has been sent.',
        crisis_copy: context?.crisis_copy,
        urgency,
        is_safety_concern: urgency === 'safety_concern',
      },
    }, { status: 201 });
  } catch (error) {
    console.error('[Portal Messages API] POST Error:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
