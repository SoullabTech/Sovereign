export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

/**
 * PORTAL BOOKING API
 *
 * Handles session booking from the portal
 * Sends confirmation emails when enabled for the practitioner
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import crypto from 'crypto';
import { resolveSessionTeamId } from '@/lib/team/sessionTeamScope';
import { getPractitionerFeaturesById } from '@/lib/practitioner/features';
import {
  sendBookingConfirmation,
  sendBookingNotificationToPractitioner,
} from '@/lib/portal/notifications';
import { logAction } from '@/lib/focus/weightTracking';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { service_id, date, time, name, email, phone, notes } = body;

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

    // Get service details
    const serviceResult = await db.query(
      `SELECT id, name, duration_minutes, price_cents
       FROM services
       WHERE id = $1 AND practitioner_id = $2 AND is_active = true`,
      [service_id, practitionerId]
    );

    if (serviceResult.rows.length === 0) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    const service = serviceResult.rows[0];

    // Check if this client already exists
    let clientId: string;
    const existingClient = await db.query(
      `SELECT id FROM stellium_clients
       WHERE practitioner_id = $1 AND email = $2`,
      [practitionerId, email]
    );

    if (existingClient.rows.length > 0) {
      clientId = existingClient.rows[0].id;
      // Update client info
      await db.query(
        `UPDATE stellium_clients
         SET name = $1, phone = COALESCE($2, phone), updated_at = NOW()
         WHERE id = $3`,
        [name, phone, clientId]
      );
    } else {
      // Create new client
      clientId = crypto.randomUUID();
      await db.query(
        `INSERT INTO stellium_clients
         (id, practitioner_id, name, email, phone, status, created_at)
         VALUES ($1, $2, $3, $4, $5, 'active', NOW())`,
        [clientId, practitionerId, name, email, phone || null]
      );
    }

    // Calculate session times
    const [hours, minutes] = time.split(':').map(Number);
    const scheduledStart = new Date(`${date}T${time}`);
    const scheduledEnd = new Date(scheduledStart.getTime() + service.duration_minutes * 60 * 1000);

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
      [practitionerId, scheduledStart.toISOString(), scheduledEnd.toISOString()]
    );

    if (conflictResult.rows.length > 0) {
      return NextResponse.json(
        { error: 'This time slot is no longer available' },
        { status: 409 }
      );
    }

    // Create the session
    const sessionId = crypto.randomUUID();
    const teamId = await resolveSessionTeamId(practitionerId);
    await db.query(
      `INSERT INTO sessions
       (id, practitioner_id, client_id, service_id, scheduled_start, scheduled_end, status, notes, price_cents, created_at, team_id)
       VALUES ($1, $2, $3, $4, $5, $6, 'scheduled', $7, $8, NOW(), $9)`,
      [
        sessionId,
        practitionerId,
        clientId,
        service_id,
        scheduledStart.toISOString(),
        scheduledEnd.toISOString(),
        notes || null,
        service.price_cents,
        teamId,
      ]
    );

    // Also create/update marketing contact if one doesn't exist
    const existingContact = await db.query(
      `SELECT id FROM marketing_contacts WHERE practitioner_id = $1 AND email = $2`,
      [practitionerId, email]
    );

    if (existingContact.rows.length === 0) {
      await db.query(
        `INSERT INTO marketing_contacts
         (id, practitioner_id, email, name, status, source, lead_score, created_at)
         VALUES ($1, $2, $3, $4, 'converted', 'booking', 100, NOW())`,
        [crypto.randomUUID(), practitionerId, email, name]
      );
    } else {
      await db.query(
        `UPDATE marketing_contacts
         SET status = 'converted', lead_score = GREATEST(lead_score, 100), updated_at = NOW()
         WHERE id = $1`,
        [existingContact.rows[0].id]
      );
    }

    // Send confirmation emails if enabled for this practitioner
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
        timezone: body.timezone || 'America/Chicago', // Default if not provided
        notes: notes,
      };

      // Send emails asynchronously (don't block the response)
      Promise.all([
        sendBookingConfirmation(bookingDetails, practitionerInfo),
        sendBookingNotificationToPractitioner(bookingDetails, practitionerInfo),
      ]).then(async (results) => {
        // Log weight for practitioner (silent, Phase 1)
        // 2 emails sent = 2 x email_send (weight 3 each = 6 total)
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
      message: 'Booking confirmed successfully',
      details: {
        service_name: service.name,
        date: date,
        time: time,
        duration: service.duration_minutes,
        practitioner: practitioner.practitioner_name,
      },
      email_sent: features.bookingConfirmationEmailsEnabled,
    });
  } catch (error) {
    console.error('Portal booking error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
