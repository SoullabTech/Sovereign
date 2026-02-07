/**
 * RETRY NOTIFICATIONS — shared idempotent dispatch
 *
 * Called by both Studio and Portal retry paths.
 * Canonical payload hash + atomic claim guard prevents duplicate sends.
 */

import db from '@/lib/db/postgres';
import { safeParseMeta, dispatchHash } from './safeMeta';
import {
  sendBookingConfirmation,
  sendBookingNotificationToPractitioner,
  sendCancellationNotification,
  sendCancellationNotificationToPractitioner,
  sendRescheduleNotification,
  sendRescheduleNotificationToPractitioner,
} from '@/lib/portal/notifications';
import type { BookingDetails, PractitionerInfo } from '@/lib/portal/notifications';

const TEMPLATE_VERSION = '1'; // bump when email templates change materially

export interface NotificationRetryResult {
  success: boolean;
  idempotent: boolean;
  results: { type: string; success: boolean; id?: string; error?: string }[];
  message?: string;
}

interface RetryNotificationsInput {
  requestId: string;
  bookingRequest: {
    status: string;
    session_id: string;
    error_message?: string | null;
    error_meta?: unknown;
  };
  session: {
    session_id: string;
    scheduled_start: string;
    scheduled_end: string;
    notes?: string | null;
    client_name: string | null;
    client_email: string | null;
    service_name: string | null;
    duration_minutes: number | null;
    practitioner_name: string | null;
    practitioner_email: string | null;
    practitioner_slug: string | null;
    business_name: string | null;
    management_token?: string | null;
  };
  timezone: string;
}

export async function retryNotifications(input: RetryNotificationsInput): Promise<NotificationRetryResult> {
  const { requestId, bookingRequest, session, timezone } = input;

  // Build canonical dispatch payload
  const dispatchPayload: Record<string, unknown> = {
    requestId,
    status: bookingRequest.status,
    sessionId: bookingRequest.session_id,
    recipients: ['client', 'practitioner'],
    templateVersion: TEMPLATE_VERSION,
  };
  const dispatchKey = dispatchHash(dispatchPayload);
  const existingMeta = safeParseMeta(bookingRequest.error_meta);

  // Fast path: if last dispatch with same key succeeded, short-circuit
  if (existingMeta.notification_dispatch_key === dispatchKey
      && existingMeta.notification_dispatch_ok === true) {
    return {
      success: true,
      idempotent: true,
      results: (existingMeta.notification_retry_results as NotificationRetryResult['results']) || [],
      message: 'Notifications already sent for this state',
    };
  }

  // Atomic claim: write dispatch key before sending
  const claim = await db.query(
    `UPDATE booking_requests
     SET error_meta = jsonb_set(
       COALESCE(error_meta, '{}'::jsonb),
       '{notification_dispatch_key}',
       $1::jsonb
     ),
     updated_at = NOW()
     WHERE id = $2
       AND (COALESCE(error_meta->>'notification_dispatch_key', '') IS DISTINCT FROM $3)
     RETURNING error_meta`,
    [JSON.stringify(dispatchKey), requestId, dispatchKey]
  );

  if (claim.rowCount === 0) {
    return {
      success: true,
      idempotent: true,
      results: (existingMeta.notification_retry_results as NotificationRetryResult['results']) || [],
      message: 'Notifications dispatch already claimed',
    };
  }

  const claimedMeta = safeParseMeta(claim.rows[0]?.error_meta);

  // Build BookingDetails and PractitionerInfo
  const bookingDetails: BookingDetails = {
    clientName: session.client_name || 'Client',
    clientEmail: session.client_email || '',
    sessionType: session.service_name || 'Session',
    dateTime: new Date(session.scheduled_start),
    duration: session.duration_minutes || 60,
    timezone,
    notes: session.notes || undefined,
    managementUrl: session.management_token
      ? `${process.env.PUBLIC_BASE_URL ?? 'https://soullab.life'}/portal/manage/${session.management_token}`
      : undefined,
  };

  const practitionerInfo: PractitionerInfo = {
    name: session.practitioner_name || '',
    email: session.practitioner_email || '',
    portalSlug: session.practitioner_slug || '',
    businessName: session.business_name || undefined,
  };

  // Send notifications based on status
  let notificationResults: { type: string; success: boolean; id?: string; error?: string }[] = [];

  switch (bookingRequest.status) {
    case 'created_session': {
      const [clientResult, practitionerResult] = await Promise.all([
        sendBookingConfirmation(bookingDetails, practitionerInfo),
        sendBookingNotificationToPractitioner(bookingDetails, practitionerInfo),
      ]);
      notificationResults = [
        { type: 'client_confirmation', ...clientResult },
        { type: 'practitioner_notification', ...practitionerResult },
      ];
      break;
    }

    case 'cancelled_by_client': {
      const reason = bookingRequest.error_message || undefined;
      const [clientResult, practitionerResult] = await Promise.all([
        sendCancellationNotification(bookingDetails, practitionerInfo, reason),
        sendCancellationNotificationToPractitioner(bookingDetails, practitionerInfo, reason),
      ]);
      notificationResults = [
        { type: 'client_cancellation', ...clientResult },
        { type: 'practitioner_cancellation', ...practitionerResult },
      ];
      break;
    }

    case 'rescheduled_by_client': {
      const rescheduleMeta = safeParseMeta(bookingRequest.error_meta);
      const oldSlotStart = rescheduleMeta.old_slot_start;

      if (!oldSlotStart) {
        // Can't send reschedule notification without old time — send as confirmation instead
        const [clientResult, practitionerResult] = await Promise.all([
          sendBookingConfirmation(bookingDetails, practitionerInfo),
          sendBookingNotificationToPractitioner(bookingDetails, practitionerInfo),
        ]);
        notificationResults = [
          { type: 'client_confirmation_fallback', ...clientResult },
          { type: 'practitioner_notification_fallback', ...practitionerResult },
        ];
      } else {
        const oldDateTime = new Date(oldSlotStart as string);
        const newDateTime = new Date(session.scheduled_start);
        const [clientResult, practitionerResult] = await Promise.all([
          sendRescheduleNotification(bookingDetails, practitionerInfo, oldDateTime, newDateTime),
          sendRescheduleNotificationToPractitioner(bookingDetails, practitionerInfo, oldDateTime, newDateTime),
        ]);
        notificationResults = [
          { type: 'client_reschedule', ...clientResult },
          { type: 'practitioner_reschedule', ...practitionerResult },
        ];
      }
      break;
    }

    default: {
      return {
        success: false,
        idempotent: false,
        results: [],
        message: `Cannot retry notifications for status: ${bookingRequest.status}`,
      };
    }
  }

  // Record results in error_meta (merge against claimedMeta)
  const allSent = notificationResults.every(r => r.success);
  const history = Array.isArray(claimedMeta.notification_retry_history)
    ? (claimedMeta.notification_retry_history as unknown[])
    : [];

  const now = new Date().toISOString();
  const updatedMeta = {
    ...claimedMeta,
    last_notification_retry: now,
    notification_retry_results: notificationResults,
    notification_dispatch_key: dispatchKey,
    notification_dispatch_payload: dispatchPayload,
    notification_dispatch_ok: allSent,
    notification_retry_history: [
      ...history,
      { at: now, key: dispatchKey, results: notificationResults },
    ].slice(-10),
    last_action: 'retry_notifications',
    last_action_at: now,
    last_action_idempotent: false,
  };

  await db.query(
    `UPDATE booking_requests
     SET error_meta = $1::jsonb, updated_at = NOW()
     WHERE id = $2`,
    [updatedMeta, requestId]
  );

  return {
    success: allSent,
    idempotent: false,
    results: notificationResults,
  };
}
