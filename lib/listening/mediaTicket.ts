// LISTEN-01 · short-lived media tickets (iOS gated audio path, founder direction 2026-11-09).
//
// The iOS app is a static shell: its <audio> element cannot send the session header and its capacitor:// origin
// does not send the session cookie. A ticket lets that element stream one gated file for a few minutes.
//
// A ticket is AES-256-GCM over { m: memberId, p: url path, e: expiry seconds, v: 1 } with a server secret
// (SOULLAB_MEDIA_TICKET_SECRET). It is opaque: no member id or path is readable in the URL, and any change to
// a byte fails authentication. It is bound to ONE file and expires. It is not authority on its own: the audio
// route re-checks the flag, the member's current beta membership and the file's release on every request.
// No secret configured → no tickets are issued and none are accepted (fail closed; sessions still work).
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';

export const MEDIA_TICKET_TTL_SECONDS = 15 * 60;
const VERSION = 1;
const MIN_SECRET_LENGTH = 32;

function keyFrom(secret: string | undefined): Buffer | null {
  if (typeof secret !== 'string' || secret.length < MIN_SECRET_LENGTH) return null;
  return createHash('sha256').update(`soullab-media-ticket-v1:${secret}`).digest();
}

function b64url(buf: Buffer): string {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromB64url(text: string): Buffer | null {
  if (!/^[A-Za-z0-9_-]{40,600}$/.test(text)) return null;
  return Buffer.from(text.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
}

/** Issue a ticket for one member and one URL path. Returns null when no usable secret is configured. */
export function issueMediaTicket(
  memberId: string, urlPath: string, nowMs: number, secret: string | undefined,
  ttlSeconds: number = MEDIA_TICKET_TTL_SECONDS,
): { ticket: string; expiresAt: number } | null {
  const key = keyFrom(secret);
  if (!key || !memberId || !urlPath) return null;
  const expiresAt = Math.floor(nowMs / 1000) + ttlSeconds;
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const body = Buffer.concat([
    cipher.update(JSON.stringify({ v: VERSION, m: memberId, p: urlPath, e: expiresAt }), 'utf8'),
    cipher.final(),
  ]);
  return { ticket: b64url(Buffer.concat([iv, body, cipher.getAuthTag()])), expiresAt };
}

/**
 * Verify a ticket for the URL path actually requested. Returns the member id, or null if the ticket is
 * missing, malformed, tampered, expired, for another file, or no secret is configured.
 */
export function verifyMediaTicket(
  ticket: string | null | undefined, urlPath: string, nowMs: number, secret: string | undefined,
): string | null {
  const key = keyFrom(secret);
  if (!key || !ticket) return null;
  const raw = fromB64url(ticket);
  if (!raw || raw.length < 12 + 16 + 1) return null;
  try {
    const decipher = createDecipheriv('aes-256-gcm', key, raw.subarray(0, 12));
    decipher.setAuthTag(raw.subarray(raw.length - 16));
    const json = Buffer.concat([decipher.update(raw.subarray(12, raw.length - 16)), decipher.final()]).toString('utf8');
    const claim = JSON.parse(json) as { v?: unknown; m?: unknown; p?: unknown; e?: unknown };
    if (claim.v !== VERSION || typeof claim.m !== 'string' || !claim.m) return null;
    if (claim.p !== urlPath) return null;
    if (typeof claim.e !== 'number' || claim.e * 1000 <= nowMs) return null;
    return claim.m;
  } catch {
    return null;
  }
}
