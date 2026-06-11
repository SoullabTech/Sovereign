// Co-lab Web Push — subscription storage (local PostgreSQL only).
// A member may have many subscriptions (one per browser/device). Endpoint is the
// natural key (unique per push service registration).

import { query } from '@/lib/db/postgres';

export interface PushSubscriptionRecord {
  id: string;
  memberId: string;
  endpoint: string;
  p256dh: string;
  auth: string;
}

// The shape the browser's PushManager.subscribe() returns (after .toJSON()).
export interface BrowserPushSubscription {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

// Upsert on endpoint: re-subscribing the same browser refreshes keys/ownership
// rather than duplicating. Reassigns the row to the current member (handles a
// shared device where a different member signs in and subscribes).
export async function savePushSubscription(
  memberId: string,
  sub: BrowserPushSubscription,
  userAgent?: string | null
): Promise<void> {
  await query(
    `INSERT INTO member_push_subscriptions (member_id, endpoint, p256dh, auth, user_agent, last_used_at)
     VALUES ($1, $2, $3, $4, $5, NOW())
     ON CONFLICT (endpoint) DO UPDATE
       SET member_id = EXCLUDED.member_id,
           p256dh = EXCLUDED.p256dh,
           auth = EXCLUDED.auth,
           user_agent = EXCLUDED.user_agent,
           last_used_at = NOW()`,
    [memberId, sub.endpoint, sub.keys.p256dh, sub.keys.auth, userAgent ?? null]
  );
}

export async function listPushSubscriptions(memberId: string): Promise<PushSubscriptionRecord[]> {
  const res = await query<{
    id: string;
    member_id: string;
    endpoint: string;
    p256dh: string;
    auth: string;
  }>(
    `SELECT id, member_id, endpoint, p256dh, auth
       FROM member_push_subscriptions
      WHERE member_id = $1`,
    [memberId]
  );
  return res.rows.map(r => ({
    id: r.id,
    memberId: r.member_id,
    endpoint: r.endpoint,
    p256dh: r.p256dh,
    auth: r.auth,
  }));
}

export async function hasPushSubscription(memberId: string): Promise<boolean> {
  const res = await query(
    `SELECT 1 FROM member_push_subscriptions WHERE member_id = $1 LIMIT 1`,
    [memberId]
  );
  return res.rows.length > 0;
}

// Member-initiated removal (opt-out / device cleanup). Scoped to the member.
export async function deletePushSubscription(memberId: string, endpoint: string): Promise<void> {
  await query(
    `DELETE FROM member_push_subscriptions WHERE member_id = $1 AND endpoint = $2`,
    [memberId, endpoint]
  );
}

// System-initiated prune for a dead endpoint (push service returned 404/410).
export async function deletePushSubscriptionByEndpoint(endpoint: string): Promise<void> {
  await query(
    `DELETE FROM member_push_subscriptions WHERE endpoint = $1`,
    [endpoint]
  );
}
