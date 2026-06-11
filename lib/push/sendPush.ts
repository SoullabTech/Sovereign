// Co-lab Web Push — central alert sender.
//
// Contract mirrors the email/SMS senders: fire-and-forget, never throws,
// structural-log-only (purpose + endpoint tail + status — NEVER the alert body or
// message content). DORMANT until VAPID is configured (no-op). Prunes dead
// subscriptions (404/410) so the store self-heals.

import webpush from 'web-push';
import { getVapidConfig } from './config';
import { listPushSubscriptions, deletePushSubscriptionByEndpoint } from './subscriptions';

let vapidInitialized = false;

// Lazily wire VAPID into web-push the first time we have config. Returns false
// (dormant) when keys are absent.
function ensureVapid(): boolean {
  const v = getVapidConfig();
  if (!v) return false;
  if (!vapidInitialized) {
    webpush.setVapidDetails(v.subject, v.publicKey, v.privateKey);
    vapidInitialized = true;
  }
  return true;
}

export interface PushAlert {
  title: string;
  body: string; // content-free alert text — NEVER message content
  url: string;  // deep link back into Co-lab
}

/**
 * Send an alert-only push to every one of a member's subscriptions.
 * No-op until VAPID is configured. Never throws. Dead endpoints are pruned.
 */
export async function sendPushToMember(
  memberId: string,
  purpose: string,
  alert: PushAlert
): Promise<void> {
  try {
    if (!ensureVapid()) return; // dormant — no keys
    const subs = await listPushSubscriptions(memberId);
    if (subs.length === 0) return;

    const payload = JSON.stringify({ title: alert.title, body: alert.body, url: alert.url });

    await Promise.all(
      subs.map(async (s) => {
        try {
          const res = await webpush.sendNotification(
            { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
            payload
          );
          console.log(
            `[push/send] sent { purpose: '${purpose}', endpoint: '…${s.endpoint.slice(-10)}', status: ${res.statusCode} }`
          );
        } catch (err) {
          const code = (err as { statusCode?: number })?.statusCode;
          if (code === 404 || code === 410) {
            await deletePushSubscriptionByEndpoint(s.endpoint).catch(() => {});
            console.log(`[push/send] pruned dead subscription { purpose: '${purpose}', status: ${code} }`);
          } else {
            console.warn(`[push/send] failed (non-fatal) { purpose: '${purpose}', status: ${code ?? 'err'} }`);
          }
        }
      })
    );
  } catch (err) {
    console.warn('[push/send] skipped (non-fatal)', err);
  }
}
