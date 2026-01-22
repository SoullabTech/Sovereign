/**
 * Practitioner Features - Feature flag checks for portal gating
 *
 * Controls which features are available per practitioner/portal
 * based on their subscription plan (free, pro, studio)
 */

import db from '@/lib/db/postgres';

export type PractitionerPlan = 'free' | 'pro' | 'studio';

export interface PractitionerFeatures {
  plan: PractitionerPlan;
  portalChatEnabled: boolean;
  conversationalBookingEnabled: boolean;
  bookingConfirmationEmailsEnabled: boolean;
  inquiryFormEnabled: boolean;
  calendarSyncEnabled: boolean;
}

const DEFAULT_FEATURES: PractitionerFeatures = {
  plan: 'free',
  portalChatEnabled: true,
  conversationalBookingEnabled: false,
  bookingConfirmationEmailsEnabled: false,
  inquiryFormEnabled: true,
  calendarSyncEnabled: false,
};

/**
 * Get features for a portal by slug
 */
export async function getPractitionerFeaturesBySlug(
  portalSlug: string
): Promise<PractitionerFeatures> {
  try {
    const result = await db.query(
      `SELECT
        plan,
        portal_chat_enabled,
        conversational_booking_enabled,
        booking_confirmation_emails_enabled,
        inquiry_form_enabled,
        calendar_sync_enabled
      FROM practitioner_features
      WHERE portal_slug = $1
      LIMIT 1`,
      [portalSlug]
    );

    if (result.rows.length === 0) {
      return DEFAULT_FEATURES;
    }

    const row = result.rows[0];
    return {
      plan: row.plan as PractitionerPlan,
      portalChatEnabled: row.portal_chat_enabled,
      conversationalBookingEnabled: row.conversational_booking_enabled,
      bookingConfirmationEmailsEnabled: row.booking_confirmation_emails_enabled,
      inquiryFormEnabled: row.inquiry_form_enabled,
      calendarSyncEnabled: row.calendar_sync_enabled,
    };
  } catch (error) {
    console.error('[Features] Error fetching practitioner features:', error);
    return DEFAULT_FEATURES;
  }
}

/**
 * Get features for a practitioner by ID
 */
export async function getPractitionerFeaturesById(
  practitionerId: string
): Promise<PractitionerFeatures> {
  try {
    const result = await db.query(
      `SELECT
        plan,
        portal_chat_enabled,
        conversational_booking_enabled,
        booking_confirmation_emails_enabled,
        inquiry_form_enabled,
        calendar_sync_enabled
      FROM practitioner_features
      WHERE practitioner_id = $1
      LIMIT 1`,
      [practitionerId]
    );

    if (result.rows.length === 0) {
      return DEFAULT_FEATURES;
    }

    const row = result.rows[0];
    return {
      plan: row.plan as PractitionerPlan,
      portalChatEnabled: row.portal_chat_enabled,
      conversationalBookingEnabled: row.conversational_booking_enabled,
      bookingConfirmationEmailsEnabled: row.booking_confirmation_emails_enabled,
      inquiryFormEnabled: row.inquiry_form_enabled,
      calendarSyncEnabled: row.calendar_sync_enabled,
    };
  } catch (error) {
    console.error('[Features] Error fetching practitioner features:', error);
    return DEFAULT_FEATURES;
  }
}

/**
 * Create or update practitioner features
 */
export async function upsertPractitionerFeatures(
  practitionerId: string,
  portalSlug: string,
  features: Partial<PractitionerFeatures>
): Promise<void> {
  await db.query(
    `INSERT INTO practitioner_features (
      practitioner_id,
      portal_slug,
      plan,
      portal_chat_enabled,
      conversational_booking_enabled,
      booking_confirmation_emails_enabled,
      inquiry_form_enabled,
      calendar_sync_enabled
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    ON CONFLICT (practitioner_id)
    DO UPDATE SET
      plan = COALESCE($3, practitioner_features.plan),
      portal_chat_enabled = COALESCE($4, practitioner_features.portal_chat_enabled),
      conversational_booking_enabled = COALESCE($5, practitioner_features.conversational_booking_enabled),
      booking_confirmation_emails_enabled = COALESCE($6, practitioner_features.booking_confirmation_emails_enabled),
      inquiry_form_enabled = COALESCE($7, practitioner_features.inquiry_form_enabled),
      calendar_sync_enabled = COALESCE($8, practitioner_features.calendar_sync_enabled),
      updated_at = NOW()`,
    [
      practitionerId,
      portalSlug,
      features.plan ?? 'free',
      features.portalChatEnabled ?? true,
      features.conversationalBookingEnabled ?? false,
      features.bookingConfirmationEmailsEnabled ?? false,
      features.inquiryFormEnabled ?? true,
      features.calendarSyncEnabled ?? false,
    ]
  );
}

/**
 * Check if a specific feature is enabled
 */
export function isFeatureEnabled(
  features: PractitionerFeatures,
  feature: keyof Omit<PractitionerFeatures, 'plan'>
): boolean {
  return features[feature] === true;
}

/**
 * Get features that come with each plan
 */
export function getPlanFeatures(plan: PractitionerPlan): PractitionerFeatures {
  switch (plan) {
    case 'studio':
      return {
        plan: 'studio',
        portalChatEnabled: true,
        conversationalBookingEnabled: true,
        bookingConfirmationEmailsEnabled: true,
        inquiryFormEnabled: true,
        calendarSyncEnabled: true,
      };
    case 'pro':
      return {
        plan: 'pro',
        portalChatEnabled: true,
        conversationalBookingEnabled: true,
        bookingConfirmationEmailsEnabled: true,
        inquiryFormEnabled: true,
        calendarSyncEnabled: false,
      };
    case 'free':
    default:
      return DEFAULT_FEATURES;
  }
}
