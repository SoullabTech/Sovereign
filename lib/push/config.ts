// Co-lab Web Push — configuration + dormancy gate.
//
// Push is an ALERT-ONLY notification channel (no message content, no inbound
// replies). It is DORMANT by default: nothing sends and the prefs API rejects
// 'push' writes until the VAPID keys are present.
//
// Note vs SMS: the SMS module reaches Twilio over plain REST and avoids the SDK.
// Web Push payload encryption (RFC 8291: ECDH + HKDF + AES-GCM) is non-trivial, so
// the send path (lib/push/sendPush.ts) uses the audited `web-push` library rather
// than hand-rolling crypto — correctness/auditability beats a smaller dep here.

export interface VapidConfig {
  publicKey: string;
  privateKey: string;
  subject: string; // 'mailto:...' or an https URL identifying the sender
}

// Full VAPID config (server-side). Null until all three are set.
export function getVapidConfig(): VapidConfig | null {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;
  if (!publicKey || !privateKey || !subject) return null;
  return { publicKey, privateKey, subject };
}

// The member-facing "push is available" gate. Drives the prefs API + settings UI
// (so there are never dead toggles) and the runtime VAPID-public-key endpoint.
export function isPushConfigured(): boolean {
  return getVapidConfig() !== null;
}

// Public key only — safe to expose to the browser. Served at RUNTIME via an API
// endpoint (not inlined via NEXT_PUBLIC), so activation stays env + restart with
// no rebuild.
export function getVapidPublicKey(): string | null {
  return process.env.VAPID_PUBLIC_KEY || null;
}
