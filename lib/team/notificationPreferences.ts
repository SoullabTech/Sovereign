// SoulComms — Notification delivery preferences (event_type × delivery_channel).
//
// Defaults live in code (notificationTypes.ts), not the database. Only EXPLICIT
// overrides are persisted (member_notification_preferences). This keeps the table
// small, lets the product's consent posture change without a backfill, and lets
// new transports/events be added with no migration.
//
// Every read FAILS OPEN to the code default: a missing table or a transient DB
// error must never silently kill notifications nor block message delivery. The
// default itself encodes consent (channel_activity email defaults OFF), so a
// failed lookup is still consent-safe for opt-in events.

import { query } from '@/lib/db/postgres';
import {
  NOTIFICATION_EVENT_TYPES,
  NOTIFICATION_CHANNELS,
  defaultPreference,
  type NotificationEventType,
  type NotificationChannel,
  type ResolvedPreference,
} from '@/lib/team/notificationTypes';

// Re-export the client-safe shapes so existing server call sites can keep
// importing everything from this module.
export * from '@/lib/team/notificationTypes';

/**
 * Resolve ONE preference: the explicit override if one exists, else the code
 * default. Fails OPEN to the default on any error so the consent gate can never
 * silently disable notifications or block a send.
 */
export async function resolveNotificationPreference(
  memberId: string,
  event: NotificationEventType,
  channel: NotificationChannel
): Promise<boolean> {
  try {
    const res = await query<{ enabled: boolean }>(
      `SELECT enabled FROM member_notification_preferences
       WHERE member_id = $1 AND event_type = $2 AND channel = $3`,
      [memberId, event, channel]
    );
    if (res.rows.length > 0) {
      const val = res.rows[0].enabled;
      // Only trust a real boolean. A malformed row (non-boolean enabled) must NOT
      // suppress a notification — fall through to the code default instead. The
      // gate may never become a single point of message loss.
      if (typeof val === 'boolean') return val;
      console.warn('[notif-prefs] malformed row (non-boolean enabled), using default', event, channel);
    }
  } catch (err) {
    console.warn(
      '[notif-prefs] resolve failed, using default',
      event,
      channel,
      err instanceof Error ? err.message : err
    );
  }
  return defaultPreference(event, channel);
}

/**
 * Full resolved matrix for the settings panel: every event × channel with its
 * effective value and whether it is an explicit override or the default.
 */
export async function getResolvedPreferences(memberId: string): Promise<ResolvedPreference[]> {
  const overrides = new Map<string, boolean>();
  try {
    const res = await query<{ event_type: string; channel: string; enabled: boolean }>(
      `SELECT event_type, channel, enabled
       FROM member_notification_preferences
       WHERE member_id = $1`,
      [memberId]
    );
    // Ignore malformed rows (non-boolean enabled) — they fall back to the default.
    for (const r of res.rows) {
      if (typeof r.enabled === 'boolean') overrides.set(`${r.event_type}:${r.channel}`, r.enabled);
    }
  } catch (err) {
    console.warn(
      '[notif-prefs] getResolved failed, returning defaults',
      err instanceof Error ? err.message : err
    );
  }

  const out: ResolvedPreference[] = [];
  for (const event of NOTIFICATION_EVENT_TYPES) {
    for (const channel of NOTIFICATION_CHANNELS) {
      const key = `${event}:${channel}`;
      const has = overrides.has(key);
      out.push({
        event_type: event,
        channel,
        enabled: has ? overrides.get(key)! : defaultPreference(event, channel),
        isDefault: !has,
      });
    }
  }
  return out;
}

/**
 * Upsert one explicit override. Rejects unknown event/channel so the table stays
 * clean. Throwing is fine here — this is called from the settings API, not the
 * fire-and-forget send path.
 */
export async function setNotificationPreference(
  memberId: string,
  event: NotificationEventType,
  channel: NotificationChannel,
  enabled: boolean
): Promise<void> {
  if (!NOTIFICATION_EVENT_TYPES.includes(event)) throw new Error(`Unknown event_type: ${event}`);
  if (!NOTIFICATION_CHANNELS.includes(channel)) throw new Error(`Unknown channel: ${channel}`);
  await query(
    `INSERT INTO member_notification_preferences (member_id, event_type, channel, enabled)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (member_id, event_type, channel)
     DO UPDATE SET enabled = EXCLUDED.enabled, updated_at = NOW()`,
    [memberId, event, channel, enabled]
  );
}
