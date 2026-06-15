/**
 * LiveKit room access-token minting — Session Room Phase 3 (PR3).
 *
 * Design: docs/specs/SESSION_ROOM_PHASE3_LIVEKIT_DESIGN_2026-06-15.md (§2 token model, §6.1).
 *
 * Mints the short-TTL LiveKit access token (HS256 JWT signed with the API secret) that the client
 * SDK presents to join the room. The grant is built SERVER-SIDE from an already-authorized
 * identity/room (see authorizeClientRoomJoin in ./ClientConsent) — never from client input. Under
 * Sanctuary, screen-share is excluded at the TOKEN level (§6.1 H1), not just the UI.
 *
 * Signed with Node's built-in `crypto` (HS256) — no external JWT dependency for minting, which
 * also keeps it unit-testable without ESM transforms.
 */
import crypto from 'crypto';

export interface RoomTokenInput {
  apiKey: string;
  apiSecret: string;
  room: string;       // LiveKit room name = session id (from authorizeClientRoomJoin)
  identity: string;   // server-derived participant identity (e.g. "client:<id>")
  sanctuary: boolean; // from the accepted agreement (mode === 'sanctuary')
  ttlSeconds?: number; // join window; default 900 (15 min). The live connection persists after join.
}

/**
 * Track sources a participant may publish. Sanctuary excludes screen-share at the grant level
 * (§6.1 H1) — a structural control the client cannot override.
 */
export function publishSources(sanctuary: boolean): string[] {
  return sanctuary ? ['camera', 'microphone'] : ['camera', 'microphone', 'screen_share'];
}

function b64url(s: string): string {
  return Buffer.from(s, 'utf8').toString('base64url');
}

/** Mint a LiveKit access token (HS256 JWT). Returns the signed token string. */
export async function mintRoomToken(input: RoomTokenInput): Promise<string> {
  const ttl = input.ttlSeconds ?? 900;
  const nowSec = Math.floor(Date.now() / 1000);
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    iss: input.apiKey,
    sub: input.identity,
    iat: nowSec,
    nbf: nowSec,
    exp: nowSec + ttl,
    video: {
      room: input.room,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
      canPublishSources: publishSources(input.sanctuary),
    },
  };
  const signingInput = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(payload))}`;
  const signature = crypto.createHmac('sha256', input.apiSecret).update(signingInput).digest('base64url');
  return `${signingInput}.${signature}`;
}
