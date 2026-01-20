/**
 * STELLIUM SETTINGS SERVICE
 *
 * Manage practitioner settings: profile, session defaults, notifications, practice
 */

import { query, transaction } from '@/lib/db/postgres';
import type {
  PractitionerSettings,
  PractitionerProfile,
  SessionDefaults,
  NotificationSettings,
  PracticeSettings,
  UpdatePractitionerProfileInput,
  UpdateSessionDefaultsInput,
  UpdateNotificationSettingsInput,
  UpdatePracticeSettingsInput,
  LocationType,
} from './types';

// ============================================
// GET SETTINGS
// ============================================

/**
 * Get all settings for a practitioner
 */
export async function getPractitionerSettings(
  practitionerId: string
): Promise<PractitionerSettings | null> {
  // Get profile from practitioners table
  const profileResult = await query<{
    id: string;
    slug: string;
    name: string;
    email: string;
    business_name: string | null;
    tagline: string | null;
    bio: string | null;
    status: string;
  }>(
    `SELECT id, slug, name, email, business_name, tagline, bio, status
     FROM practitioners WHERE id = $1`,
    [practitionerId]
  );

  if (profileResult.rows.length === 0) {
    return null;
  }

  const profile = profileResult.rows[0];

  // Get settings (create if not exists)
  let settingsResult = await query<{
    default_duration_minutes: number;
    default_location_type: string;
    default_session_type: string;
    default_fee: number | null;
    buffer_between_sessions: number;
    booking_advance_days: number;
    cancellation_policy: string | null;
    confirmation_template: string | null;
    follow_up_template: string | null;
    email_new_booking: boolean;
    email_booking_reminder: boolean;
    email_follow_up_reminder: boolean;
    email_payment_received: boolean;
    reminder_hours_before: number;
    follow_up_days_after: number;
    timezone: string;
    currency: string;
    working_hours: Record<string, { start: string; end: string } | null> | null;
    booking_enabled: boolean;
    payments_enabled: boolean;
  }>(
    `SELECT * FROM practitioner_settings WHERE practitioner_id = $1`,
    [practitionerId]
  );

  // Create default settings if they don't exist
  if (settingsResult.rows.length === 0) {
    await query(
      `INSERT INTO practitioner_settings (practitioner_id) VALUES ($1)
       ON CONFLICT (practitioner_id) DO NOTHING`,
      [practitionerId]
    );
    settingsResult = await query(
      `SELECT * FROM practitioner_settings WHERE practitioner_id = $1`,
      [practitionerId]
    );
  }

  const settings = settingsResult.rows[0];

  return {
    profile: {
      id: profile.id,
      slug: profile.slug,
      name: profile.name,
      email: profile.email,
      business_name: profile.business_name || undefined,
      tagline: profile.tagline || undefined,
      bio: profile.bio || undefined,
      status: profile.status as PractitionerProfile['status'],
    },
    sessionDefaults: {
      default_duration_minutes: settings.default_duration_minutes,
      default_location_type: settings.default_location_type as LocationType,
      default_session_type: settings.default_session_type,
      default_fee: settings.default_fee || undefined,
      buffer_between_sessions: settings.buffer_between_sessions,
      booking_advance_days: settings.booking_advance_days,
      cancellation_policy: settings.cancellation_policy || undefined,
      confirmation_template: settings.confirmation_template || undefined,
      follow_up_template: settings.follow_up_template || undefined,
    },
    notifications: {
      email_new_booking: settings.email_new_booking,
      email_booking_reminder: settings.email_booking_reminder,
      email_follow_up_reminder: settings.email_follow_up_reminder,
      email_payment_received: settings.email_payment_received,
      reminder_hours_before: settings.reminder_hours_before,
      follow_up_days_after: settings.follow_up_days_after,
    },
    practice: {
      timezone: settings.timezone,
      currency: settings.currency,
      working_hours: settings.working_hours || undefined,
      booking_enabled: settings.booking_enabled,
      payments_enabled: settings.payments_enabled,
    },
  };
}

// ============================================
// UPDATE PROFILE
// ============================================

/**
 * Update practitioner profile
 */
export async function updatePractitionerProfile(
  practitionerId: string,
  data: UpdatePractitionerProfileInput
): Promise<PractitionerProfile | null> {
  const updates: string[] = [];
  const values: (string | null)[] = [];
  let paramIndex = 1;

  if (data.name !== undefined) {
    updates.push(`name = $${paramIndex++}`);
    values.push(data.name);
  }
  if (data.email !== undefined) {
    updates.push(`email = $${paramIndex++}`);
    values.push(data.email);
  }
  if (data.business_name !== undefined) {
    updates.push(`business_name = $${paramIndex++}`);
    values.push(data.business_name || null);
  }
  if (data.tagline !== undefined) {
    updates.push(`tagline = $${paramIndex++}`);
    values.push(data.tagline || null);
  }
  if (data.bio !== undefined) {
    updates.push(`bio = $${paramIndex++}`);
    values.push(data.bio || null);
  }

  if (updates.length === 0) {
    // No changes, just return current profile
    const result = await query<{
      id: string;
      slug: string;
      name: string;
      email: string;
      business_name: string | null;
      tagline: string | null;
      bio: string | null;
      status: string;
    }>(
      `SELECT id, slug, name, email, business_name, tagline, bio, status
       FROM practitioners WHERE id = $1`,
      [practitionerId]
    );
    if (result.rows.length === 0) return null;
    const p = result.rows[0];
    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      email: p.email,
      business_name: p.business_name || undefined,
      tagline: p.tagline || undefined,
      bio: p.bio || undefined,
      status: p.status as PractitionerProfile['status'],
    };
  }

  values.push(practitionerId);
  const result = await query<{
    id: string;
    slug: string;
    name: string;
    email: string;
    business_name: string | null;
    tagline: string | null;
    bio: string | null;
    status: string;
  }>(
    `UPDATE practitioners SET ${updates.join(', ')}, updated_at = NOW()
     WHERE id = $${paramIndex}
     RETURNING id, slug, name, email, business_name, tagline, bio, status`,
    values
  );

  if (result.rows.length === 0) return null;
  const p = result.rows[0];
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    email: p.email,
    business_name: p.business_name || undefined,
    tagline: p.tagline || undefined,
    bio: p.bio || undefined,
    status: p.status as PractitionerProfile['status'],
  };
}

// ============================================
// UPDATE SESSION DEFAULTS
// ============================================

/**
 * Update session defaults
 */
export async function updateSessionDefaults(
  practitionerId: string,
  data: UpdateSessionDefaultsInput
): Promise<SessionDefaults | null> {
  const updates: string[] = [];
  const values: (string | number | null)[] = [];
  let paramIndex = 1;

  if (data.default_duration_minutes !== undefined) {
    updates.push(`default_duration_minutes = $${paramIndex++}`);
    values.push(data.default_duration_minutes);
  }
  if (data.default_location_type !== undefined) {
    updates.push(`default_location_type = $${paramIndex++}`);
    values.push(data.default_location_type);
  }
  if (data.default_session_type !== undefined) {
    updates.push(`default_session_type = $${paramIndex++}`);
    values.push(data.default_session_type);
  }
  if (data.default_fee !== undefined) {
    updates.push(`default_fee = $${paramIndex++}`);
    values.push(data.default_fee || null);
  }
  if (data.buffer_between_sessions !== undefined) {
    updates.push(`buffer_between_sessions = $${paramIndex++}`);
    values.push(data.buffer_between_sessions);
  }
  if (data.booking_advance_days !== undefined) {
    updates.push(`booking_advance_days = $${paramIndex++}`);
    values.push(data.booking_advance_days);
  }
  if (data.cancellation_policy !== undefined) {
    updates.push(`cancellation_policy = $${paramIndex++}`);
    values.push(data.cancellation_policy || null);
  }
  if (data.confirmation_template !== undefined) {
    updates.push(`confirmation_template = $${paramIndex++}`);
    values.push(data.confirmation_template || null);
  }
  if (data.follow_up_template !== undefined) {
    updates.push(`follow_up_template = $${paramIndex++}`);
    values.push(data.follow_up_template || null);
  }

  if (updates.length === 0) {
    // Return current defaults
    return getSessionDefaults(practitionerId);
  }

  values.push(practitionerId);
  await query(
    `UPDATE practitioner_settings SET ${updates.join(', ')}, updated_at = NOW()
     WHERE practitioner_id = $${paramIndex}`,
    values
  );

  return getSessionDefaults(practitionerId);
}

async function getSessionDefaults(practitionerId: string): Promise<SessionDefaults | null> {
  const result = await query<{
    default_duration_minutes: number;
    default_location_type: string;
    default_session_type: string;
    default_fee: number | null;
    buffer_between_sessions: number;
    booking_advance_days: number;
    cancellation_policy: string | null;
    confirmation_template: string | null;
    follow_up_template: string | null;
  }>(
    `SELECT default_duration_minutes, default_location_type, default_session_type,
            default_fee, buffer_between_sessions, booking_advance_days,
            cancellation_policy, confirmation_template, follow_up_template
     FROM practitioner_settings WHERE practitioner_id = $1`,
    [practitionerId]
  );

  if (result.rows.length === 0) return null;
  const s = result.rows[0];
  return {
    default_duration_minutes: s.default_duration_minutes,
    default_location_type: s.default_location_type as LocationType,
    default_session_type: s.default_session_type,
    default_fee: s.default_fee || undefined,
    buffer_between_sessions: s.buffer_between_sessions,
    booking_advance_days: s.booking_advance_days,
    cancellation_policy: s.cancellation_policy || undefined,
    confirmation_template: s.confirmation_template || undefined,
    follow_up_template: s.follow_up_template || undefined,
  };
}

// ============================================
// UPDATE NOTIFICATION SETTINGS
// ============================================

/**
 * Update notification settings
 */
export async function updateNotificationSettings(
  practitionerId: string,
  data: UpdateNotificationSettingsInput
): Promise<NotificationSettings | null> {
  const updates: string[] = [];
  const values: (boolean | number | string)[] = [];
  let paramIndex = 1;

  if (data.email_new_booking !== undefined) {
    updates.push(`email_new_booking = $${paramIndex++}`);
    values.push(data.email_new_booking);
  }
  if (data.email_booking_reminder !== undefined) {
    updates.push(`email_booking_reminder = $${paramIndex++}`);
    values.push(data.email_booking_reminder);
  }
  if (data.email_follow_up_reminder !== undefined) {
    updates.push(`email_follow_up_reminder = $${paramIndex++}`);
    values.push(data.email_follow_up_reminder);
  }
  if (data.email_payment_received !== undefined) {
    updates.push(`email_payment_received = $${paramIndex++}`);
    values.push(data.email_payment_received);
  }
  if (data.reminder_hours_before !== undefined) {
    updates.push(`reminder_hours_before = $${paramIndex++}`);
    values.push(data.reminder_hours_before);
  }
  if (data.follow_up_days_after !== undefined) {
    updates.push(`follow_up_days_after = $${paramIndex++}`);
    values.push(data.follow_up_days_after);
  }

  if (updates.length === 0) {
    return getNotificationSettings(practitionerId);
  }

  values.push(practitionerId);
  await query(
    `UPDATE practitioner_settings SET ${updates.join(', ')}, updated_at = NOW()
     WHERE practitioner_id = $${paramIndex}`,
    values
  );

  return getNotificationSettings(practitionerId);
}

async function getNotificationSettings(practitionerId: string): Promise<NotificationSettings | null> {
  const result = await query<{
    email_new_booking: boolean;
    email_booking_reminder: boolean;
    email_follow_up_reminder: boolean;
    email_payment_received: boolean;
    reminder_hours_before: number;
    follow_up_days_after: number;
  }>(
    `SELECT email_new_booking, email_booking_reminder, email_follow_up_reminder,
            email_payment_received, reminder_hours_before, follow_up_days_after
     FROM practitioner_settings WHERE practitioner_id = $1`,
    [practitionerId]
  );

  if (result.rows.length === 0) return null;
  return result.rows[0];
}

// ============================================
// UPDATE PRACTICE SETTINGS
// ============================================

/**
 * Update practice settings
 */
export async function updatePracticeSettings(
  practitionerId: string,
  data: UpdatePracticeSettingsInput
): Promise<PracticeSettings | null> {
  const updates: string[] = [];
  const values: (string | boolean | Record<string, unknown>)[] = [];
  let paramIndex = 1;

  if (data.timezone !== undefined) {
    updates.push(`timezone = $${paramIndex++}`);
    values.push(data.timezone);
  }
  if (data.currency !== undefined) {
    updates.push(`currency = $${paramIndex++}`);
    values.push(data.currency);
  }
  if (data.working_hours !== undefined) {
    updates.push(`working_hours = $${paramIndex++}`);
    values.push(JSON.stringify(data.working_hours));
  }
  if (data.booking_enabled !== undefined) {
    updates.push(`booking_enabled = $${paramIndex++}`);
    values.push(data.booking_enabled);
  }
  if (data.payments_enabled !== undefined) {
    updates.push(`payments_enabled = $${paramIndex++}`);
    values.push(data.payments_enabled);
  }

  if (updates.length === 0) {
    return getPracticeSettings(practitionerId);
  }

  values.push(practitionerId);
  await query(
    `UPDATE practitioner_settings SET ${updates.join(', ')}, updated_at = NOW()
     WHERE practitioner_id = $${paramIndex}`,
    values
  );

  return getPracticeSettings(practitionerId);
}

async function getPracticeSettings(practitionerId: string): Promise<PracticeSettings | null> {
  const result = await query<{
    timezone: string;
    currency: string;
    working_hours: Record<string, { start: string; end: string } | null> | null;
    booking_enabled: boolean;
    payments_enabled: boolean;
  }>(
    `SELECT timezone, currency, working_hours, booking_enabled, payments_enabled
     FROM practitioner_settings WHERE practitioner_id = $1`,
    [practitionerId]
  );

  if (result.rows.length === 0) return null;
  const s = result.rows[0];
  return {
    timezone: s.timezone,
    currency: s.currency,
    working_hours: s.working_hours || undefined,
    booking_enabled: s.booking_enabled,
    payments_enabled: s.payments_enabled,
  };
}

// ============================================
// INITIALIZE SETTINGS
// ============================================

/**
 * Initialize default settings for a new practitioner
 */
export async function initializePractitionerSettings(
  practitionerId: string
): Promise<void> {
  await query(
    `INSERT INTO practitioner_settings (practitioner_id)
     VALUES ($1)
     ON CONFLICT (practitioner_id) DO NOTHING`,
    [practitionerId]
  );
}
