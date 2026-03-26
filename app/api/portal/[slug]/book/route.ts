export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

/**
 * PORTAL BOOKING API
 *
 * Handles session booking from the portal.
 * Transaction-safe to prevent double bookings.
 * Creates service snapshot, sets booking_source, syncs to Google Calendar.
 */

import { NextRequest, NextResponse } from 'next/server';
import db, { transaction } from '@/lib/db/postgres';
import crypto from 'crypto';
import { getPractitionerFeaturesById } from '@/lib/practitioner/features';
import {
  sendBookingConfirmation,
  sendBookingNotificationToPractitioner,
} from '@/lib/portal/notifications';
import { logAction } from '@/lib/focus/weightTracking';
import { createEvent as createGoogleCalendarEvent } from '@/lib/calendar/GoogleCalendarService';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { service_id, date, time, name, email, phone, notes, timezone } = body;

    // Validate required fields
    if (!service_id || !date || !time || !name || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get practitioner
    const practitionerResult = await db.query(
      `SELECT id, member_id, name as practitioner_name, email, business_name, settings
       FROM practitioners
       WHERE slug = $1 AND status = 'active'`,
      [slug]
    );

    if (practitionerResult.rows.length === 0) {
      return NextResponse.json({ error: 'Portal not found' }, { status: 404 });
    }

    const practitioner = practitionerResult.rows[0];
    const practitionerId = practitioner.id;

    // Get full service details (including new booking fields)
    const serviceResult = await db.query(
      `SELECT id, name, duration_minutes, price_cents, description, category,
              slug as service_slug, confirmation_instructions
       FROM services
       WHERE id = $1 AND practitioner_id = $2 AND is_active = true`,
      [service_id, practitionerId]
    );

    if (serviceResult.rows.length === 0) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    const service = serviceResult.rows[0];

    // Build service snapshot (frozen record of what was booked)
    const serviceSnapshot = {
      id: service.id,
      name: service.name,
      duration_minutes: service.duration_minutes,
      price_cents: service.price_cents,
      description: service.description,
      category: service.category,
      slug: service.service_slug,
    };

    // Calculate session times
    const scheduledStart = new Date(`${date}T${time}`);
    const scheduledEnd = new Date(scheduledStart.getTime() + service.duration_minutes * 60 * 1000);

    // Transaction-safe booking: client upsert + conflict check + session insert
    const sessionId = crypto.randomUUID();
    const manageToken = crypto.randomUUID().replace(/-/g, '');

    await transaction(async (client) => {
      // Upsert client
      let clientId: string;
      const existingClient = await client.query(
        `SELECT id FROM stellium_clients
         WHERE practitioner_id = $1 AND email = $2`,
        [practitionerId, email]
      );

      if (existingClient.rows.length > 0) {
        clientId = existingClient.rows[0].id;
        await client.query(
          `UPDATE stellium_clients
           SET name = $1, phone = COALESCE($2, phone), updated_at = NOW()
           WHERE id = $3`,
          [name, phone, clientId]
        );
      } else {
        clientId = crypto.randomUUID();
        await client.query(
          `INSERT INTO stellium_clients
           (id, practitioner_id, name, email, phone, status, created_at)
           VALUES ($1, $2, $3, $4, $5, 'active', NOW())`,
          [clientId, practitionerId, name, email, phone || null]
        );
      }

      // Lock + check for conflicts (SELECT FOR UPDATE prevents race conditions)
      const conflictResult = await client.query(
        `SELECT id FROM sessions
         WHERE practitioner_id = $1
         AND status NOT IN ('cancelled', 'no_show')
         AND (
           (scheduled_start <= $2 AND scheduled_end > $2)
           OR (scheduled_start < $3 AND scheduled_end >= $3)
           OR (scheduled_start >= $2 AND scheduled_end <= $3)
         )
         FOR UPDATE`,
        [practitionerId, scheduledStart.toISOString(), scheduledEnd.toISOString()]
      );

      if (conflictResult.rows.length > 0) {
        throw new Error('SLOT_TAKEN');
      }

      // Create the session with booking_source, service_snapshot, and manage_token

      await client.query(
        `INSERT INTO sessions
         (id, practitioner_id, client_id, service_id, scheduled_start, scheduled_end,
          status, notes, price_cents, booking_source, service_snapshot, manage_token, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, 'scheduled', $7, $8, 'portal', $9, $10, NOW())`,
        [
          sessionId,
          practitionerId,
          clientId,
          service_id,
          scheduledStart.toISOString(),
          scheduledEnd.toISOString(),
          notes || null,
          service.price_cents,
          JSON.stringify(serviceSnapshot),
          manageToken,
        ]
      );
    });

    // Marketing contact upsert (fire-and-forget, outside transaction)
    const nameParts = name.trim().split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    db.query(
      `INSERT INTO marketing_contacts
       (id, practitioner_id, email, first_name, last_name, status, source, lead_score, created_at)
       VALUES ($1, $2, $3, $4, $5, 'converted', 'booking', 100, NOW())
       ON CONFLICT (practitioner_id, email) DO UPDATE SET
         status = 'converted',
         lead_score = GREATEST(marketing_contacts.lead_score, 100),
         updated_at = NOW()`,
      [crypto.randomUUID(), practitionerId, email, firstName, lastName]
    ).catch(err => console.warn('[Portal Booking] Marketing contact upsert skipped:', err));

    // Google Calendar sync (fire-and-forget)
    if (practitioner.member_id) {
      (async () => {
        try {
          const eventId = await createGoogleCalendarEvent(practitioner.member_id, {
            summary: `${service.name} — ${name}`,
            description: `Booked via portal\nClient: ${name} (${email})\n${notes ? `Notes: ${notes}` : ''}`,
            start: scheduledStart,
            end: scheduledEnd,
          });

          if (eventId) {
            await db.query(
              `UPDATE sessions SET google_event_id = $1, calendar_sync_status = 'synced' WHERE id = $2`,
              [eventId, sessionId]
            );
          }
        } catch (err) {
          console.warn('[Portal Booking] Google Calendar sync skipped:', err);
          db.query(
            `UPDATE sessions SET calendar_sync_status = 'failed', calendar_sync_error = $1 WHERE id = $2`,
            [String(err), sessionId]
          ).catch(() => {});
        }
      })();
    }

    // Send confirmation emails if enabled (fire-and-forget)
    const features = await getPractitionerFeaturesById(practitionerId);

    if (features.bookingConfirmationEmailsEnabled && practitioner.email) {
      const practitionerInfo = {
        name: practitioner.practitioner_name,
        email: practitioner.email,
        portalSlug: slug,
        businessName: practitioner.business_name,
      };

      const bookingDetails = {
        clientName: name,
        clientEmail: email,
        sessionType: service.name,
        dateTime: scheduledStart,
        duration: service.duration_minutes,
        timezone: timezone || 'America/Chicago',
        notes: notes,
        confirmationInstructions: service.confirmation_instructions || undefined,
        sessionId: sessionId,
      };

      Promise.all([
        sendBookingConfirmation(bookingDetails, practitionerInfo),
        sendBookingNotificationToPractitioner(bookingDetails, practitionerInfo),
      ]).then(async (results) => {
        if (practitioner.member_id) {
          const successCount = results.filter(r => r.success).length;
          for (let i = 0; i < successCount; i++) {
            try {
              await logAction(practitioner.member_id, 'email_send', {
                source: 'portal-booking',
                metadata: { portalSlug: slug, target: i === 0 ? 'client' : 'practitioner' }
              });
            } catch (e) {
              console.warn('[Portal Booking] Weight logging skipped:', e);
            }
          }
        }
      }).catch((err) => {
        console.error('[Portal Booking] Email notification error:', err);
      });
    }

    return NextResponse.json({
      success: true,
      session_id: sessionId,
      manage_token: manageToken,
      message: 'Booking confirmed successfully',
      details: {
        service_name: service.name,
        date: date,
        time: time,
        duration: service.duration_minutes,
        practitioner: practitioner.practitioner_name,
        confirmation_instructions: service.confirmation_instructions,
      },
      email_sent: features.bookingConfirmationEmailsEnabled,
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'SLOT_TAKEN') {
      return NextResponse.json(
        { error: 'This time slot is no longer available' },
        { status: 409 }
      );
    }

    console.error('Portal booking error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
