/**
 * Portal Notifications - Email notifications for booking and inquiries
 *
 * Sends:
 * - Booking confirmations to clients (when feature enabled)
 * - Inquiry notifications to practitioners
 * - Booking notifications to practitioners
 */

import { sendEmail } from '@/lib/email/sendEmail';


// ============================================================================
// Types
// ============================================================================

export interface BookingDetails {
  clientName: string;
  clientEmail: string;
  sessionType: string;
  dateTime: Date;
  duration: number; // minutes
  timezone: string;
  notes?: string;
  managementUrl?: string;
}

export interface PractitionerInfo {
  name: string;
  email: string;
  portalSlug: string;
  businessName?: string;
}

export interface InquiryDetails {
  name?: string;
  email?: string;
  phone?: string;
  topic?: string;
  message: string;
  source: 'portal_inquiry_form' | 'portal_chat';
}

// ============================================================================
// Booking Confirmation (Client)
// ============================================================================

/**
 * Send booking confirmation email to client
 */
export async function sendBookingConfirmation(
  booking: BookingDetails,
  practitioner: PractitionerInfo
): Promise<{ success: boolean; id?: string; error?: string }> {
  const formattedDate = formatDateTime(booking.dateTime, booking.timezone);
  const practitionerDisplay = practitioner.businessName || practitioner.name;

  try {
    const result = await sendEmail({
      purpose: 'portal:booking-confirmation',
      from: `${practitionerDisplay} <bookings@soullab.life>`,
      replyTo: practitioner.email,
      to: booking.clientEmail,
      subject: `Booking Confirmed: ${booking.sessionType} with ${practitioner.name}`,
      html: generateBookingConfirmationHtml(booking, practitioner, formattedDate),
      text: generateBookingConfirmationText(booking, practitioner, formattedDate),
      tags: [
        { name: 'type', value: 'booking-confirmation' },
        { name: 'portal', value: practitioner.portalSlug },
      ],

    });

    console.log(`[Portal Notifications] Booking confirmation sent to ${booking.clientEmail}`);
    if (!result.success) {
      // The provider REFUSES by resolving, so the try/catch around this call
      // never saw a refusal: every portal notification reported success.
      return { success: false, error: result.error };
    }
    return { success: true, id: result.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Portal Notifications] Failed to send booking confirmation:', message);
    return { success: false, error: message };
  }
}

function generateBookingConfirmationHtml(
  booking: BookingDetails,
  practitioner: PractitionerInfo,
  formattedDate: string
): string {
  const practitionerDisplay = practitioner.businessName || practitioner.name;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1A2F24 0%, #2C5530 100%); padding: 32px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">Booking Confirmed</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 24px; color: #333; font-size: 16px; line-height: 1.6;">
                Hi ${booking.clientName},
              </p>

              <p style="margin: 0 0 24px; color: #333; font-size: 16px; line-height: 1.6;">
                Your session with <strong>${practitioner.name}</strong> has been confirmed.
              </p>

              <!-- Booking Details Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8faf9; border-radius: 8px; border-left: 4px solid #2C5530; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 12px; color: #666; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Session Details</p>

                    <p style="margin: 0 0 8px; color: #333; font-size: 16px;">
                      <strong>Type:</strong> ${booking.sessionType}
                    </p>
                    <p style="margin: 0 0 8px; color: #333; font-size: 16px;">
                      <strong>Date & Time:</strong> ${formattedDate}
                    </p>
                    <p style="margin: 0 0 8px; color: #333; font-size: 16px;">
                      <strong>Duration:</strong> ${booking.duration} minutes
                    </p>
                    <p style="margin: 0; color: #333; font-size: 16px;">
                      <strong>Timezone:</strong> ${booking.timezone}
                    </p>
                  </td>
                </tr>
              </table>

              ${booking.notes ? `
              <p style="margin: 0 0 24px; color: #666; font-size: 14px; line-height: 1.6;">
                <strong>Notes:</strong> ${booking.notes}
              </p>
              ` : ''}

              <p style="margin: 0 0 16px; color: #333; font-size: 16px; line-height: 1.6;">
                If you need to reschedule or have any questions, please reply to this email or contact ${practitioner.name} directly.
              </p>

              <p style="margin: 0; color: #333; font-size: 16px; line-height: 1.6;">
                Looking forward to seeing you!
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #f8faf9; border-top: 1px solid #e5e5e5; text-align: center;">
              <p style="margin: 0; color: #666; font-size: 14px;">
                ${practitionerDisplay}
              </p>
              <p style="margin: 8px 0 0; color: #999; font-size: 12px;">
                Powered by Soullab
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

function generateBookingConfirmationText(
  booking: BookingDetails,
  practitioner: PractitionerInfo,
  formattedDate: string
): string {
  return `
BOOKING CONFIRMED

Hi ${booking.clientName},

Your session with ${practitioner.name} has been confirmed.

SESSION DETAILS
---------------
Type: ${booking.sessionType}
Date & Time: ${formattedDate}
Duration: ${booking.duration} minutes
Timezone: ${booking.timezone}
${booking.notes ? `Notes: ${booking.notes}` : ''}

If you need to reschedule or have any questions, please reply to this email or contact ${practitioner.name} directly.

Looking forward to seeing you!

--
${practitioner.businessName || practitioner.name}
Powered by Soullab
  `.trim();
}

// ============================================================================
// Booking Notification (Practitioner)
// ============================================================================

/**
 * Send new booking notification to practitioner
 */
export async function sendBookingNotificationToPractitioner(
  booking: BookingDetails,
  practitioner: PractitionerInfo
): Promise<{ success: boolean; id?: string; error?: string }> {
  const formattedDate = formatDateTime(booking.dateTime, booking.timezone);

  try {
    const result = await sendEmail({
      purpose: 'portal:booking-notification',
      from: 'Soullab Bookings <bookings@soullab.life>',
      to: practitioner.email,
      subject: `New Booking: ${booking.clientName} - ${booking.sessionType}`,
      html: generatePractitionerBookingHtml(booking, formattedDate),
      text: generatePractitionerBookingText(booking, formattedDate),
      tags: [
        { name: 'type', value: 'booking-notification' },
        { name: 'portal', value: practitioner.portalSlug },
      ],

    });

    console.log(`[Portal Notifications] Booking notification sent to practitioner ${practitioner.email}`);
    if (!result.success) {
      // The provider REFUSES by resolving, so the try/catch around this call
      // never saw a refusal: every portal notification reported success.
      return { success: false, error: result.error };
    }
    return { success: true, id: result.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Portal Notifications] Failed to send practitioner notification:', message);
    return { success: false, error: message };
  }
}

function generatePractitionerBookingHtml(booking: BookingDetails, formattedDate: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <h2 style="color: #1A2F24; margin: 0 0 16px;">New Booking</h2>

  <table style="background: #f8faf9; border-radius: 8px; padding: 16px; width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 8px 0; color: #666;">Client:</td>
      <td style="padding: 8px 0; color: #333; font-weight: 600;">${booking.clientName}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; color: #666;">Email:</td>
      <td style="padding: 8px 0;"><a href="mailto:${booking.clientEmail}" style="color: #2C5530;">${booking.clientEmail}</a></td>
    </tr>
    <tr>
      <td style="padding: 8px 0; color: #666;">Session:</td>
      <td style="padding: 8px 0; color: #333;">${booking.sessionType}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; color: #666;">Date & Time:</td>
      <td style="padding: 8px 0; color: #333; font-weight: 600;">${formattedDate}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; color: #666;">Duration:</td>
      <td style="padding: 8px 0; color: #333;">${booking.duration} minutes</td>
    </tr>
    ${booking.notes ? `
    <tr>
      <td style="padding: 8px 0; color: #666;">Notes:</td>
      <td style="padding: 8px 0; color: #333;">${booking.notes}</td>
    </tr>
    ` : ''}
  </table>

  <p style="margin: 24px 0 0; color: #666; font-size: 14px;">
    Reply to the client: <a href="mailto:${booking.clientEmail}" style="color: #2C5530;">${booking.clientEmail}</a>
  </p>
</body>
</html>
  `.trim();
}

function generatePractitionerBookingText(booking: BookingDetails, formattedDate: string): string {
  return `
NEW BOOKING

Client: ${booking.clientName}
Email: ${booking.clientEmail}
Session: ${booking.sessionType}
Date & Time: ${formattedDate}
Duration: ${booking.duration} minutes
${booking.notes ? `Notes: ${booking.notes}` : ''}

Reply to the client: ${booking.clientEmail}
  `.trim();
}

// ============================================================================
// Cancellation Notifications (Client + Practitioner)
// ============================================================================

/**
 * Send cancellation confirmation to client
 */
export async function sendCancellationNotification(
  booking: BookingDetails,
  practitioner: PractitionerInfo,
  reason?: string
): Promise<{ success: boolean; id?: string; error?: string }> {
  const formattedDate = formatDateTime(booking.dateTime, booking.timezone);
  const practitionerDisplay = practitioner.businessName || practitioner.name;

  try {
    const result = await sendEmail({
      purpose: 'portal:booking-cancellation',
      from: `${practitionerDisplay} <bookings@soullab.life>`,
      replyTo: practitioner.email,
      to: booking.clientEmail,
      subject: `Booking Cancelled: ${booking.sessionType} with ${practitioner.name}`,
      html: generateCancellationClientHtml(booking, practitioner, formattedDate, reason),
      text: generateCancellationClientText(booking, practitioner, formattedDate, reason),
      tags: [
        { name: 'type', value: 'booking-cancellation' },
        { name: 'portal', value: practitioner.portalSlug },
      ],

    });

    console.log(`[Portal Notifications] Cancellation notification sent to ${booking.clientEmail}`);
    if (!result.success) {
      // The provider REFUSES by resolving, so the try/catch around this call
      // never saw a refusal: every portal notification reported success.
      return { success: false, error: result.error };
    }
    return { success: true, id: result.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Portal Notifications] Failed to send cancellation notification:', message);
    return { success: false, error: message };
  }
}

/**
 * Send cancellation alert to practitioner
 */
export async function sendCancellationNotificationToPractitioner(
  booking: BookingDetails,
  practitioner: PractitionerInfo,
  reason?: string
): Promise<{ success: boolean; id?: string; error?: string }> {
  const formattedDate = formatDateTime(booking.dateTime, booking.timezone);

  try {
    const result = await sendEmail({
      purpose: 'portal:booking-cancellation-practitioner',
      from: 'Soullab Bookings <bookings@soullab.life>',
      to: practitioner.email,
      subject: `Booking Cancelled: ${booking.clientName} - ${booking.sessionType}`,
      html: generateCancellationPractitionerHtml(booking, formattedDate, reason),
      text: generateCancellationPractitionerText(booking, formattedDate, reason),
      tags: [
        { name: 'type', value: 'booking-cancellation-practitioner' },
        { name: 'portal', value: practitioner.portalSlug },
      ],

    });

    console.log(`[Portal Notifications] Cancellation alert sent to practitioner ${practitioner.email}`);
    if (!result.success) {
      // The provider REFUSES by resolving, so the try/catch around this call
      // never saw a refusal: every portal notification reported success.
      return { success: false, error: result.error };
    }
    return { success: true, id: result.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Portal Notifications] Failed to send practitioner cancellation alert:', message);
    return { success: false, error: message };
  }
}

function generateCancellationClientHtml(
  booking: BookingDetails,
  practitioner: PractitionerInfo,
  formattedDate: string,
  reason?: string
): string {
  const practitionerDisplay = practitioner.businessName || practitioner.name;
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <h2 style="color:#1A2F24;margin:0 0 16px;">Booking Cancelled</h2>
  <p style="color:#333;font-size:16px;">Hi ${booking.clientName},</p>
  <p style="color:#333;font-size:16px;">Your session with <strong>${practitioner.name}</strong> on <strong>${formattedDate}</strong> has been cancelled.</p>
  ${reason ? `<p style="color:#666;font-size:14px;"><strong>Reason:</strong> ${reason}</p>` : ''}
  <p style="color:#333;font-size:16px;">If you'd like to rebook, please visit the portal or reply to this email.</p>
  <p style="color:#666;font-size:14px;margin-top:24px;">${practitionerDisplay} · Powered by Soullab</p>
</body>
</html>
  `.trim();
}

function generateCancellationClientText(
  booking: BookingDetails,
  practitioner: PractitionerInfo,
  formattedDate: string,
  reason?: string
): string {
  return `
BOOKING CANCELLED

Hi ${booking.clientName},

Your session with ${practitioner.name} on ${formattedDate} has been cancelled.
${reason ? `Reason: ${reason}` : ''}

If you'd like to rebook, please reply to this email.

--
${practitioner.businessName || practitioner.name}
Powered by Soullab
  `.trim();
}

function generateCancellationPractitionerHtml(
  booking: BookingDetails,
  formattedDate: string,
  reason?: string
): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <h2 style="color:#1A2F24;margin:0 0 16px;">Booking Cancelled by Client</h2>
  <table style="background:#f8faf9;border-radius:8px;padding:16px;width:100%;border-collapse:collapse;">
    <tr><td style="padding:8px 0;color:#666;">Client:</td><td style="padding:8px 0;color:#333;font-weight:600;">${booking.clientName}</td></tr>
    <tr><td style="padding:8px 0;color:#666;">Session:</td><td style="padding:8px 0;color:#333;">${booking.sessionType}</td></tr>
    <tr><td style="padding:8px 0;color:#666;">Was scheduled:</td><td style="padding:8px 0;color:#333;">${formattedDate}</td></tr>
    ${reason ? `<tr><td style="padding:8px 0;color:#666;">Reason:</td><td style="padding:8px 0;color:#333;">${reason}</td></tr>` : ''}
  </table>
  <p style="margin:24px 0 0;color:#666;font-size:14px;">Reply to client: <a href="mailto:${booking.clientEmail}" style="color:#2C5530;">${booking.clientEmail}</a></p>
</body>
</html>
  `.trim();
}

function generateCancellationPractitionerText(
  booking: BookingDetails,
  formattedDate: string,
  reason?: string
): string {
  return `
BOOKING CANCELLED BY CLIENT

Client: ${booking.clientName}
Email: ${booking.clientEmail}
Session: ${booking.sessionType}
Was scheduled: ${formattedDate}
${reason ? `Reason: ${reason}` : ''}
  `.trim();
}

// ============================================================================
// Reschedule Notifications (Client + Practitioner)
// ============================================================================

/**
 * Send reschedule confirmation to client
 */
export async function sendRescheduleNotification(
  booking: BookingDetails,
  practitioner: PractitionerInfo,
  oldDateTime: Date,
  newDateTime: Date
): Promise<{ success: boolean; id?: string; error?: string }> {
  const oldFormatted = formatDateTime(oldDateTime, booking.timezone);
  const newFormatted = formatDateTime(newDateTime, booking.timezone);
  const practitionerDisplay = practitioner.businessName || practitioner.name;

  try {
    const result = await sendEmail({
      purpose: 'portal:booking-reschedule',
      from: `${practitionerDisplay} <bookings@soullab.life>`,
      replyTo: practitioner.email,
      to: booking.clientEmail,
      subject: `Booking Rescheduled: ${booking.sessionType} with ${practitioner.name}`,
      html: generateRescheduleClientHtml(booking, practitioner, oldFormatted, newFormatted),
      text: generateRescheduleClientText(booking, practitioner, oldFormatted, newFormatted),
      tags: [
        { name: 'type', value: 'booking-reschedule' },
        { name: 'portal', value: practitioner.portalSlug },
      ],

    });

    console.log(`[Portal Notifications] Reschedule notification sent to ${booking.clientEmail}`);
    if (!result.success) {
      // The provider REFUSES by resolving, so the try/catch around this call
      // never saw a refusal: every portal notification reported success.
      return { success: false, error: result.error };
    }
    return { success: true, id: result.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Portal Notifications] Failed to send reschedule notification:', message);
    return { success: false, error: message };
  }
}

/**
 * Send reschedule alert to practitioner
 */
export async function sendRescheduleNotificationToPractitioner(
  booking: BookingDetails,
  practitioner: PractitionerInfo,
  oldDateTime: Date,
  newDateTime: Date
): Promise<{ success: boolean; id?: string; error?: string }> {
  const oldFormatted = formatDateTime(oldDateTime, booking.timezone);
  const newFormatted = formatDateTime(newDateTime, booking.timezone);

  try {
    const result = await sendEmail({
      purpose: 'portal:booking-reschedule-practitioner',
      from: 'Soullab Bookings <bookings@soullab.life>',
      to: practitioner.email,
      subject: `Booking Rescheduled: ${booking.clientName} - ${booking.sessionType}`,
      html: generateReschedulePractitionerHtml(booking, oldFormatted, newFormatted),
      text: generateReschedulePractitionerText(booking, oldFormatted, newFormatted),
      tags: [
        { name: 'type', value: 'booking-reschedule-practitioner' },
        { name: 'portal', value: practitioner.portalSlug },
      ],

    });

    console.log(`[Portal Notifications] Reschedule alert sent to practitioner ${practitioner.email}`);
    if (!result.success) {
      // The provider REFUSES by resolving, so the try/catch around this call
      // never saw a refusal: every portal notification reported success.
      return { success: false, error: result.error };
    }
    return { success: true, id: result.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Portal Notifications] Failed to send practitioner reschedule alert:', message);
    return { success: false, error: message };
  }
}

function generateRescheduleClientHtml(
  booking: BookingDetails,
  practitioner: PractitionerInfo,
  oldFormatted: string,
  newFormatted: string
): string {
  const practitionerDisplay = practitioner.businessName || practitioner.name;
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <h2 style="color:#1A2F24;margin:0 0 16px;">Booking Rescheduled</h2>
  <p style="color:#333;font-size:16px;">Hi ${booking.clientName},</p>
  <p style="color:#333;font-size:16px;">Your session with <strong>${practitioner.name}</strong> has been rescheduled.</p>
  <table style="background:#f8faf9;border-radius:8px;padding:16px;width:100%;border-collapse:collapse;margin-bottom:16px;">
    <tr><td style="padding:8px 0;color:#666;">Session:</td><td style="padding:8px 0;color:#333;">${booking.sessionType}</td></tr>
    <tr><td style="padding:8px 0;color:#666;">Previous time:</td><td style="padding:8px 0;color:#999;text-decoration:line-through;">${oldFormatted}</td></tr>
    <tr><td style="padding:8px 0;color:#666;">New time:</td><td style="padding:8px 0;color:#1A2F24;font-weight:600;">${newFormatted}</td></tr>
    <tr><td style="padding:8px 0;color:#666;">Duration:</td><td style="padding:8px 0;color:#333;">${booking.duration} minutes</td></tr>
  </table>
  <p style="color:#333;font-size:16px;">If you have any questions, please reply to this email.</p>
  <p style="color:#666;font-size:14px;margin-top:24px;">${practitionerDisplay} · Powered by Soullab</p>
</body>
</html>
  `.trim();
}

function generateRescheduleClientText(
  booking: BookingDetails,
  practitioner: PractitionerInfo,
  oldFormatted: string,
  newFormatted: string
): string {
  return `
BOOKING RESCHEDULED

Hi ${booking.clientName},

Your session with ${practitioner.name} has been rescheduled.

Session: ${booking.sessionType}
Previous time: ${oldFormatted}
New time: ${newFormatted}
Duration: ${booking.duration} minutes

If you have any questions, please reply to this email.

--
${practitioner.businessName || practitioner.name}
Powered by Soullab
  `.trim();
}

function generateReschedulePractitionerHtml(
  booking: BookingDetails,
  oldFormatted: string,
  newFormatted: string
): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <h2 style="color:#1A2F24;margin:0 0 16px;">Booking Rescheduled by Client</h2>
  <table style="background:#f8faf9;border-radius:8px;padding:16px;width:100%;border-collapse:collapse;">
    <tr><td style="padding:8px 0;color:#666;">Client:</td><td style="padding:8px 0;color:#333;font-weight:600;">${booking.clientName}</td></tr>
    <tr><td style="padding:8px 0;color:#666;">Email:</td><td style="padding:8px 0;"><a href="mailto:${booking.clientEmail}" style="color:#2C5530;">${booking.clientEmail}</a></td></tr>
    <tr><td style="padding:8px 0;color:#666;">Session:</td><td style="padding:8px 0;color:#333;">${booking.sessionType}</td></tr>
    <tr><td style="padding:8px 0;color:#666;">Previous time:</td><td style="padding:8px 0;color:#999;">${oldFormatted}</td></tr>
    <tr><td style="padding:8px 0;color:#666;">New time:</td><td style="padding:8px 0;color:#1A2F24;font-weight:600;">${newFormatted}</td></tr>
  </table>
  <p style="margin:24px 0 0;color:#666;font-size:14px;">Reply to client: <a href="mailto:${booking.clientEmail}" style="color:#2C5530;">${booking.clientEmail}</a></p>
</body>
</html>
  `.trim();
}

function generateReschedulePractitionerText(
  booking: BookingDetails,
  oldFormatted: string,
  newFormatted: string
): string {
  return `
BOOKING RESCHEDULED BY CLIENT

Client: ${booking.clientName}
Email: ${booking.clientEmail}
Session: ${booking.sessionType}
Previous time: ${oldFormatted}
New time: ${newFormatted}
  `.trim();
}

// ============================================================================
// Inquiry Notification (Practitioner)
// ============================================================================

/**
 * Send inquiry notification to practitioner
 */
export async function sendInquiryNotification(
  inquiry: InquiryDetails,
  practitioner: PractitionerInfo
): Promise<{ success: boolean; id?: string; error?: string }> {
  const sourceLabel = inquiry.source === 'portal_chat' ? 'Chat Inquiry' : 'Contact Form';

  try {
    const result = await sendEmail({
      purpose: 'portal:inquiry-notification',
      from: 'Soullab Portal <portal@soullab.life>',
      to: practitioner.email,
      replyTo: inquiry.email || undefined,
      subject: `New ${sourceLabel}: ${inquiry.name || 'Anonymous'} - ${inquiry.topic || 'General'}`,
      html: generateInquiryNotificationHtml(inquiry, sourceLabel),
      text: generateInquiryNotificationText(inquiry, sourceLabel),
      tags: [
        { name: 'type', value: 'inquiry-notification' },
        { name: 'portal', value: practitioner.portalSlug },
        { name: 'source', value: inquiry.source },
      ],

    });

    console.log(`[Portal Notifications] Inquiry notification sent to ${practitioner.email}`);
    if (!result.success) {
      // The provider REFUSES by resolving, so the try/catch around this call
      // never saw a refusal: every portal notification reported success.
      return { success: false, error: result.error };
    }
    return { success: true, id: result.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Portal Notifications] Failed to send inquiry notification:', message);
    return { success: false, error: message };
  }
}

function generateInquiryNotificationHtml(inquiry: InquiryDetails, sourceLabel: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <h2 style="color: #1A2F24; margin: 0 0 8px;">New ${sourceLabel}</h2>
  <p style="color: #666; margin: 0 0 24px; font-size: 14px;">
    ${inquiry.topic ? `Topic: ${inquiry.topic}` : 'General inquiry'}
  </p>

  <table style="background: #f8faf9; border-radius: 8px; padding: 16px; width: 100%; border-collapse: collapse; margin-bottom: 24px;">
    ${inquiry.name ? `
    <tr>
      <td style="padding: 8px 0; color: #666; width: 100px;">Name:</td>
      <td style="padding: 8px 0; color: #333; font-weight: 600;">${inquiry.name}</td>
    </tr>
    ` : ''}
    ${inquiry.email ? `
    <tr>
      <td style="padding: 8px 0; color: #666;">Email:</td>
      <td style="padding: 8px 0;"><a href="mailto:${inquiry.email}" style="color: #2C5530;">${inquiry.email}</a></td>
    </tr>
    ` : ''}
    ${inquiry.phone ? `
    <tr>
      <td style="padding: 8px 0; color: #666;">Phone:</td>
      <td style="padding: 8px 0; color: #333;">${inquiry.phone}</td>
    </tr>
    ` : ''}
  </table>

  <div style="background: #ffffff; border: 1px solid #e5e5e5; border-radius: 8px; padding: 16px;">
    <p style="color: #666; font-size: 12px; text-transform: uppercase; margin: 0 0 8px;">Message</p>
    <p style="color: #333; margin: 0; line-height: 1.6; white-space: pre-wrap;">${inquiry.message}</p>
  </div>

  ${inquiry.email ? `
  <p style="margin: 24px 0 0;">
    <a href="mailto:${inquiry.email}" style="display: inline-block; background: #2C5530; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">Reply to ${inquiry.name || 'Inquiry'}</a>
  </p>
  ` : ''}
</body>
</html>
  `.trim();
}

function generateInquiryNotificationText(inquiry: InquiryDetails, sourceLabel: string): string {
  return `
NEW ${sourceLabel.toUpperCase()}

${inquiry.topic ? `Topic: ${inquiry.topic}` : 'General inquiry'}

${inquiry.name ? `Name: ${inquiry.name}` : ''}
${inquiry.email ? `Email: ${inquiry.email}` : ''}
${inquiry.phone ? `Phone: ${inquiry.phone}` : ''}

MESSAGE:
${inquiry.message}

${inquiry.email ? `Reply to: ${inquiry.email}` : ''}
  `.trim();
}

// ============================================================================
// Portal Claim Invite (Client)
// ============================================================================

export interface ClaimInviteDetails {
  clientName: string;
  clientEmail: string;
  claimUrl: string; // /portal/[slug]/claim?code=...
}

/**
 * Send portal claim link to a new client after booking
 */
export async function sendPortalClaimEmail(
  invite: ClaimInviteDetails,
  practitioner: PractitionerInfo
): Promise<{ success: boolean; id?: string; error?: string }> {
  const practitionerDisplay = practitioner.businessName || practitioner.name;

  try {
    const result = await sendEmail({
      purpose: 'portal:portal-claim-invite',
      from: `${practitionerDisplay} <bookings@soullab.life>`,
      replyTo: practitioner.email,
      to: invite.clientEmail,
      subject: `Set up your client portal access — ${practitionerDisplay}`,
      html: generateClaimInviteHtml(invite, practitioner),
      text: generateClaimInviteText(invite, practitioner),
      tags: [
        { name: 'type', value: 'portal-claim-invite' },
        { name: 'portal', value: practitioner.portalSlug },
      ],

    });

    console.log(`[Portal Notifications] Claim invite sent to ${invite.clientEmail}`);
    if (!result.success) {
      // The provider REFUSES by resolving, so the try/catch around this call
      // never saw a refusal: every portal notification reported success.
      return { success: false, error: result.error };
    }
    return { success: true, id: result.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Portal Notifications] Failed to send claim invite:', message);
    return { success: false, error: message };
  }
}

function generateClaimInviteHtml(
  invite: ClaimInviteDetails,
  practitioner: PractitionerInfo
): string {
  const practitionerDisplay = practitioner.businessName || practitioner.name;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1A2F24 0%, #2C5530 100%); padding: 32px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">Your Client Portal</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 16px; color: #333; font-size: 16px; line-height: 1.6;">
                Hi ${invite.clientName},
              </p>

              <p style="margin: 0 0 24px; color: #333; font-size: 16px; line-height: 1.6;">
                ${practitioner.name} has set up a private portal for you. You can use it to access session materials, intake forms, and more.
              </p>

              <p style="margin: 0 0 32px; color: #333; font-size: 16px; line-height: 1.6;">
                Click the button below to create your password and access your portal. This link expires in 90 days.
              </p>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
                <tr>
                  <td align="center">
                    <a href="${invite.claimUrl}" style="display: inline-block; background: #2C5530; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600;">
                      Set Up Portal Access
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 8px; color: #999; font-size: 13px; line-height: 1.5;">
                If the button doesn't work, copy and paste this link:
              </p>
              <p style="margin: 0; color: #666; font-size: 12px; word-break: break-all;">
                ${invite.claimUrl}
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #f8faf9; border-top: 1px solid #e5e5e5; text-align: center;">
              <p style="margin: 0; color: #666; font-size: 14px;">
                ${practitionerDisplay}
              </p>
              <p style="margin: 8px 0 0; color: #999; font-size: 12px;">
                Powered by Soullab
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

function generateClaimInviteText(
  invite: ClaimInviteDetails,
  practitioner: PractitionerInfo
): string {
  return `
Hi ${invite.clientName},

${practitioner.name} has set up a private client portal for you.

Click the link below to create your password and access your portal.
This link expires in 90 days.

${invite.claimUrl}

--
${practitioner.businessName || practitioner.name}
Powered by Soullab
  `.trim();
}

// ============================================================================
// Utilities
// ============================================================================

function formatDateTime(date: Date, timezone: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZone: timezone,
      timeZoneName: 'short',
    }).format(date);
  } catch {
    // Fallback if timezone is invalid
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  }
}
