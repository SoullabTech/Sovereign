/**
 * Portal Booking Tools - Claude Tool Implementations
 *
 * Tools for the portal chat to:
 * - List available services
 * - Check availability for dates
 * - Create bookings
 * - Submit inquiries
 *
 * These are called by Claude via tool_use when the conversationalBookingEnabled
 * feature flag is true for the practitioner.
 */

import db from '@/lib/db/postgres';
import crypto from 'crypto';
import { resolveSessionTeamId } from '@/lib/team/sessionTeamScope';
import { generateInviteCode, hashInviteCode } from '@/lib/portal/invites';
import { sendPortalClaimEmail } from '@/lib/portal/notifications';
import { getAvailableSlots } from '@/lib/scheduling/slotCalculator';

// ============================================================================
// Tool Definitions for Claude
// ============================================================================

export const BOOKING_TOOLS = [
  {
    name: 'list_services',
    description:
      'List the available services/session types that clients can book. Call this when someone asks about what sessions are available, pricing, or wants to know what they can book.',
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
  {
    name: 'check_availability',
    description:
      'Check available time slots for a specific date. Call this when someone wants to book a session and needs to see available times. Returns open time slots.',
    input_schema: {
      type: 'object' as const,
      properties: {
        date: {
          type: 'string',
          description: 'The date to check availability for (YYYY-MM-DD format)',
        },
        service_id: {
          type: 'string',
          description: 'Optional service ID to get duration-appropriate slots',
        },
      },
      required: ['date'],
    },
  },
  {
    name: 'create_booking',
    description:
      'Create a booking for a session. Call this when someone has selected a service, date, time, and provided their contact information. All fields must be confirmed with the user before calling.',
    input_schema: {
      type: 'object' as const,
      properties: {
        service_id: {
          type: 'string',
          description: 'The ID of the service to book',
        },
        date: {
          type: 'string',
          description: 'The date for the booking (YYYY-MM-DD format)',
        },
        time: {
          type: 'string',
          description: 'The time for the booking (HH:MM format, 24-hour)',
        },
        name: {
          type: 'string',
          description: "The client's full name",
        },
        email: {
          type: 'string',
          description: "The client's email address",
        },
        phone: {
          type: 'string',
          description: "The client's phone number (optional)",
        },
        notes: {
          type: 'string',
          description: 'Any notes or special requests from the client (optional)',
        },
      },
      required: ['service_id', 'date', 'time', 'name', 'email'],
    },
  },
  {
    name: 'submit_inquiry',
    description:
      'Submit an inquiry or contact message when someone has questions that need practitioner follow-up, wants to discuss services before booking, or needs more information. Use this for general questions, consultation requests, or when booking is not immediately appropriate.',
    input_schema: {
      type: 'object' as const,
      properties: {
        name: {
          type: 'string',
          description: "The person's name (optional if they prefer to remain anonymous)",
        },
        email: {
          type: 'string',
          description: "The person's email for follow-up (strongly encouraged)",
        },
        phone: {
          type: 'string',
          description: "The person's phone number (optional)",
        },
        timezone: {
          type: 'string',
          description: "The person's timezone (optional, e.g., 'America/New_York')",
        },
        topic: {
          type: 'string',
          description:
            'Brief topic or subject of the inquiry (e.g., "Pricing question", "First-time consultation")',
        },
        message: {
          type: 'string',
          description: 'The full message or question to send to the practitioner',
        },
      },
      required: ['message'],
    },
  },
];

// ============================================================================
// Tool Implementations
// ============================================================================

export interface ToolContext {
  portalSlug: string;
  practitionerId: string;
  memberId?: string; // member UUID — needed for client_invites FK (references members.id)
}

export interface ToolResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

/**
 * List available services for this practitioner
 */
export async function listServices(ctx: ToolContext): Promise<ToolResult> {
  try {
    const result = await db.query(
      `SELECT
        id,
        name,
        description,
        duration_minutes,
        price_cents,
        category
      FROM services
      WHERE practitioner_id = $1 AND is_active = true
      ORDER BY sort_order, name`,
      [ctx.practitionerId]
    );

    const services = result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      duration: row.duration_minutes,
      price: row.price_cents ? `$${(row.price_cents / 100).toFixed(2)}` : 'Contact for pricing',
      category: row.category,
    }));

    return {
      success: true,
      data: {
        services,
        count: services.length,
      },
    };
  } catch (error) {
    console.error('[BookingTools] listServices error:', error);
    return {
      success: false,
      error: 'Failed to load services',
    };
  }
}

/**
 * Check availability for a specific date
 */
export async function checkAvailability(
  ctx: ToolContext,
  params: { date: string; service_id?: string }
): Promise<ToolResult> {
  try {
    const { date, service_id } = params;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return { success: false, error: 'Invalid date format. Please use YYYY-MM-DD format.' };
    }

    const requestedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (requestedDate < today) {
      return { success: false, error: 'Cannot check availability for past dates.' };
    }

    // Use consolidated slot calculator
    const slots = await getAvailableSlots({
      practitionerId: ctx.practitionerId,
      date,
      serviceId: service_id,
    });

    if (slots.length === 0) {
      return {
        success: true,
        data: { date, slots: [], message: 'No availability for this day.' },
      };
    }

    // Get duration for response metadata
    let duration = 60;
    if (service_id) {
      const svc = await db.query(
        `SELECT duration_minutes FROM services WHERE id = $1 AND practitioner_id = $2`,
        [service_id, ctx.practitionerId]
      );
      if (svc.rows.length > 0) duration = svc.rows[0].duration_minutes;
    }

    return {
      success: true,
      data: {
        date,
        slots: slots.map((s) => ({ start: s.start, end: s.end })),
        count: slots.length,
        duration_minutes: duration,
      },
    };
  } catch (error) {
    console.error('[BookingTools] checkAvailability error:', error);
    return { success: false, error: 'Failed to check availability' };
  }
}

/**
 * Create a booking
 */
export async function createBooking(
  ctx: ToolContext,
  params: {
    service_id: string;
    date: string;
    time: string;
    name: string;
    email: string;
    phone?: string;
    notes?: string;
  }
): Promise<ToolResult> {
  try {
    const { service_id, date, time, name, email, phone, notes } = params;

    // Validate required fields
    if (!service_id || !date || !time || !name || !email) {
      return {
        success: false,
        error: 'Missing required booking information.',
      };
    }

    // Get service details
    const serviceResult = await db.query(
      `SELECT id, name, duration_minutes, price_cents
       FROM services
       WHERE id = $1 AND practitioner_id = $2 AND is_active = true`,
      [service_id, ctx.practitionerId]
    );

    if (serviceResult.rows.length === 0) {
      return {
        success: false,
        error: 'Service not found or no longer available.',
      };
    }

    const service = serviceResult.rows[0];

    // Calculate session times
    const scheduledStart = new Date(`${date}T${time}`);
    const scheduledEnd = new Date(
      scheduledStart.getTime() + service.duration_minutes * 60 * 1000
    );

    // Check for conflicts
    const conflictResult = await db.query(
      `SELECT id FROM sessions
       WHERE practitioner_id = $1
       AND status NOT IN ('cancelled', 'no_show')
       AND (
         (scheduled_start <= $2 AND scheduled_end > $2)
         OR (scheduled_start < $3 AND scheduled_end >= $3)
         OR (scheduled_start >= $2 AND scheduled_end <= $3)
       )`,
      [ctx.practitionerId, scheduledStart.toISOString(), scheduledEnd.toISOString()]
    );

    if (conflictResult.rows.length > 0) {
      return {
        success: false,
        error: 'This time slot is no longer available. Please choose another time.',
      };
    }

    // Get or create client
    let clientId: string;
    const existingClient = await db.query(
      `SELECT id FROM stellium_clients WHERE practitioner_id = $1 AND email = $2`,
      [ctx.practitionerId, email]
    );

    if (existingClient.rows.length > 0) {
      clientId = existingClient.rows[0].id;
      await db.query(
        `UPDATE stellium_clients
         SET name = $1, phone = COALESCE($2, phone), updated_at = NOW()
         WHERE id = $3`,
        [name, phone, clientId]
      );
    } else {
      clientId = crypto.randomUUID();
      await db.query(
        `INSERT INTO stellium_clients
         (id, practitioner_id, name, email, phone, status, created_at)
         VALUES ($1, $2, $3, $4, $5, 'active', NOW())`,
        [clientId, ctx.practitionerId, name, email, phone || null]
      );
    }

    // Create the session
    const sessionId = crypto.randomUUID();
    const teamId = await resolveSessionTeamId(ctx.practitionerId);
    await db.query(
      `INSERT INTO sessions
       (id, practitioner_id, client_id, service_id, scheduled_start, scheduled_end, status, notes, price_cents, created_at, team_id)
       VALUES ($1, $2, $3, $4, $5, $6, 'scheduled', $7, $8, NOW(), $9)`,
      [
        sessionId,
        ctx.practitionerId,
        clientId,
        service_id,
        scheduledStart.toISOString(),
        scheduledEnd.toISOString(),
        notes || null,
        service.price_cents,
        teamId,
      ]
    );

    // Bridge to calendar_events + booking_metadata (fire-and-forget)
    bridgeBookingToCalendar({
      sessionId,
      practitionerId: ctx.practitionerId,
      serviceName: service.name,
      clientName: name,
      scheduledStart,
      scheduledEnd,
      source: 'chat',
    }).catch((err) => {
      console.error('[BookingTools] Calendar bridge failed (non-blocking):', err);
    });

    // Update marketing contact
    const existingContact = await db.query(
      `SELECT id FROM marketing_contacts WHERE practitioner_id = $1 AND email = $2`,
      [ctx.practitionerId, email]
    );

    if (existingContact.rows.length === 0) {
      await db.query(
        `INSERT INTO marketing_contacts
         (id, practitioner_id, email, name, status, source, lead_score, created_at)
         VALUES ($1, $2, $3, $4, 'converted', 'chat_booking', 100, NOW())`,
        [crypto.randomUUID(), ctx.practitionerId, email, name]
      );
    } else {
      await db.query(
        `UPDATE marketing_contacts
         SET status = 'converted', lead_score = GREATEST(lead_score, 100), updated_at = NOW()
         WHERE id = $1`,
        [existingContact.rows[0].id]
      );
    }

    // Auto-invite: send claim link if client hasn't claimed portal access yet
    // Fire-and-forget — never blocks the booking confirmation
    sendPortalInviteIfNeeded(ctx, clientId, name, email).catch((err) => {
      console.error('[BookingTools] Auto-invite failed (non-blocking):', err);
    });

    return {
      success: true,
      data: {
        session_id: sessionId,
        service_name: service.name,
        date,
        time,
        duration_minutes: service.duration_minutes,
        client_name: name,
        client_email: email,
        confirmation_message: `Your ${service.name} session has been booked for ${formatDateForDisplay(date)} at ${formatTimeForDisplay(time)}. You will receive a confirmation email shortly.`,
      },
    };
  } catch (error) {
    console.error('[BookingTools] createBooking error:', error);
    return {
      success: false,
      error: 'Failed to create booking. Please try again.',
    };
  }
}

/**
 * Auto-invite helper: generates (or reuses) a portal claim invite for unclaimed clients.
 *
 * Rules:
 * - If already claimed → do nothing
 * - If active unexpired invite exists → revoke it, generate fresh (plaintext not stored)
 * - Always sends one invite per booking flow; never piles up duplicates
 */
async function sendPortalInviteIfNeeded(
  ctx: ToolContext,
  clientId: string,
  clientName: string,
  clientEmail: string
): Promise<void> {
  // Check claimed status directly on practitioner_clients (view omits this column)
  const claimedResult = await db.query(
    `SELECT portal_claimed_at FROM practitioner_clients WHERE id = $1`,
    [clientId]
  );

  const claimed = claimedResult.rows[0]?.portal_claimed_at;
  if (claimed) {
    // Already has portal access — booking confirmation only
    return;
  }

  // Revoke any existing active invites to avoid sprawl
  await db.query(
    `UPDATE client_invites
     SET status = 'revoked'
     WHERE client_id = $1 AND status = 'unused' AND expires_at > NOW()`,
    [clientId]
  );

  // Generate new invite
  const code = generateInviteCode();
  const codeHash = hashInviteCode(code);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 90); // 90 days

  // client_invites.practitioner_id references members(id), not practitioners(id)
  const inviteOwnerId = ctx.memberId || ctx.practitionerId;
  await db.query(
    `INSERT INTO client_invites (practitioner_id, client_id, code_hash, status, expires_at)
     VALUES ($1, $2, $3, 'unused', $4)`,
    [inviteOwnerId, clientId, codeHash, expiresAt]
  );

  // Fetch practitioner info for the email
  const practitionerResult = await db.query(
    `SELECT name, email, business_name, slug
     FROM practitioners
     WHERE id = $1 OR member_id = $1
     LIMIT 1`,
    [ctx.practitionerId]
  );

  const p = practitionerResult.rows[0];
  if (!p) {
    console.warn('[BookingTools] Auto-invite: practitioner not found, skipping email');
    return;
  }

  const claimUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://soullab.life'}/portal/${ctx.portalSlug}/claim?code=${encodeURIComponent(code)}&email=${encodeURIComponent(clientEmail)}`;

  await sendPortalClaimEmail(
    { clientName, clientEmail, claimUrl },
    {
      name: p.name,
      email: p.email,
      portalSlug: ctx.portalSlug,
      businessName: p.business_name ?? undefined,
    }
  );

  console.log(`[BookingTools] Auto-invite sent to ${clientEmail} for portal/${ctx.portalSlug}`);
}

/**
 * Submit an inquiry
 */
export async function submitInquiry(
  ctx: ToolContext,
  params: {
    name?: string;
    email?: string;
    phone?: string;
    timezone?: string;
    topic?: string;
    message: string;
  }
): Promise<ToolResult> {
  try {
    const { name, email, phone, timezone, topic, message } = params;

    if (!message || message.trim().length === 0) {
      return {
        success: false,
        error: 'A message is required for the inquiry.',
      };
    }

    // Create the inquiry
    const inquiryId = crypto.randomUUID();
    await db.query(
      `INSERT INTO portal_inquiries
       (id, portal_slug, practitioner_id, name, email, phone, timezone, topic, message, source, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'portal_chat', 'new', NOW())`,
      [
        inquiryId,
        ctx.portalSlug,
        ctx.practitionerId,
        name || null,
        email || null,
        phone || null,
        timezone || null,
        topic || null,
        message,
      ]
    );

    // Also create/update marketing contact if email provided
    if (email) {
      const existingContact = await db.query(
        `SELECT id FROM marketing_contacts WHERE practitioner_id = $1 AND email = $2`,
        [ctx.practitionerId, email]
      );

      if (existingContact.rows.length === 0) {
        await db.query(
          `INSERT INTO marketing_contacts
           (id, practitioner_id, email, name, status, source, lead_score, created_at)
           VALUES ($1, $2, $3, $4, 'inquiry', 'chat_inquiry', 50, NOW())`,
          [crypto.randomUUID(), ctx.practitionerId, email, name || 'Unknown']
        );
      } else {
        await db.query(
          `UPDATE marketing_contacts
           SET lead_score = GREATEST(lead_score, 50), updated_at = NOW()
           WHERE id = $1`,
          [existingContact.rows[0].id]
        );
      }
    }

    return {
      success: true,
      data: {
        inquiry_id: inquiryId,
        confirmation_message: email
          ? `Your message has been sent. ${name ? name + ', you' : 'You'} should receive a response at ${email} within 24-48 hours.`
          : `Your message has been sent. Since no email was provided, please check back here or reach out again if you haven't heard back.`,
      },
    };
  } catch (error) {
    console.error('[BookingTools] submitInquiry error:', error);
    return {
      success: false,
      error: 'Failed to submit inquiry. Please try again.',
    };
  }
}

// ============================================================================
// Tool Dispatcher
// ============================================================================

/**
 * Execute a tool by name with given parameters
 */
export async function executeTool(
  toolName: string,
  params: Record<string, unknown>,
  ctx: ToolContext
): Promise<ToolResult> {
  switch (toolName) {
    case 'list_services':
      return listServices(ctx);
    case 'check_availability':
      return checkAvailability(ctx, params as { date: string; service_id?: string });
    case 'create_booking':
      return createBooking(
        ctx,
        params as {
          service_id: string;
          date: string;
          time: string;
          name: string;
          email: string;
          phone?: string;
          notes?: string;
        }
      );
    case 'submit_inquiry':
      return submitInquiry(
        ctx,
        params as {
          name?: string;
          email?: string;
          phone?: string;
          timezone?: string;
          topic?: string;
          message: string;
        }
      );
    default:
      return {
        success: false,
        error: `Unknown tool: ${toolName}`,
      };
  }
}

// ============================================================================
// Calendar Bridge
// ============================================================================

/**
 * Bridge a session into calendar_events + booking_metadata.
 * Fire-and-forget — never blocks the booking confirmation.
 */
async function bridgeBookingToCalendar(opts: {
  sessionId: string;
  practitionerId: string;
  serviceName: string;
  clientName: string;
  scheduledStart: Date;
  scheduledEnd: Date;
  source: 'chat' | 'portal' | 'studio';
  bookerTimezone?: string;
  intakeResponses?: Record<string, unknown>;
}): Promise<void> {
  // Get practitioner's member_id for calendar_events ownership
  const practitionerResult = await db.query(
    `SELECT member_id FROM practitioners WHERE id = $1`,
    [opts.practitionerId]
  );
  const memberId = practitionerResult.rows[0]?.member_id;
  if (!memberId) {
    console.warn('[BookingTools] No member_id for practitioner, skipping calendar bridge');
    return;
  }

  // Insert calendar_event with calendar_provider = 'booking'
  const calendarEventId = crypto.randomUUID();
  await db.query(
    `INSERT INTO calendar_events
     (id, member_id, title, description, start_time, end_time, calendar_provider, calendar_disclosure)
     VALUES ($1, $2, $3, $4, $5, $6, 'booking', 'generic')`,
    [
      calendarEventId,
      memberId,
      `${opts.serviceName} — ${opts.clientName}`,
      `Booked via ${opts.source}`,
      opts.scheduledStart.toISOString(),
      opts.scheduledEnd.toISOString(),
    ]
  );

  // Insert booking_metadata linking session → calendar_event
  await db.query(
    `INSERT INTO booking_metadata
     (session_id, calendar_event_id, booker_timezone, intake_responses, source)
     VALUES ($1, $2, $3, $4, $5)`,
    [
      opts.sessionId,
      calendarEventId,
      opts.bookerTimezone || null,
      JSON.stringify(opts.intakeResponses || {}),
      opts.source,
    ]
  );

  console.log(`[BookingTools] Calendar bridge: session=${opts.sessionId} → calendar_event=${calendarEventId}`);
}

/**
 * Bridge a booking to calendar_events from an external caller (e.g. public booking API).
 * Re-exports the internal function for use outside bookingTools.
 */
export { bridgeBookingToCalendar };

// ============================================================================
// Utilities
// ============================================================================

function formatDateForDisplay(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatTimeForDisplay(timeStr: string): string {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${String(minutes).padStart(2, '0')} ${ampm}`;
}
