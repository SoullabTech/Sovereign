/**
 * Session Room door — consent opens the room. (Threshold → Room wiring.)
 *
 * Constitutional role: "Consent is the threshold, not a gate" (NATIVE_SESSION_ROOM_PHASE1_SPEC §3)
 * extended to transport: no signaling — therefore no P2P, no audio — before the participant's own
 * `join` consent row exists. The authority is the CONSENT ROW (the write event), never the token:
 * the threshold token only identifies which participant is at the door. Entry is re-checked on
 * every signaling request — it is never pre-minted and never cached into a second credential.
 *
 * The room name is the encounter id; a token minted for another encounter does not open this door
 * (wrong_room), so two encounters can never be joined into one room by link reuse.
 */

import db from '@/lib/db/postgres';
import { verifyThresholdToken } from './threshold';

export type RoomEntry =
  | { ok: true; encounterId: string; participantId: string; role: string; displayName: string }
  | { ok: false; status: 403 | 404; reason: 'invalid_token' | 'wrong_room' | 'unknown_participant' | 'no_consent' };

export async function authorizeRoomEntry(token: string, roomId: string): Promise<RoomEntry> {
  const claims = verifyThresholdToken(token);
  if (!claims) return { ok: false, status: 404, reason: 'invalid_token' };
  if (claims.encounterId !== roomId) return { ok: false, status: 403, reason: 'wrong_room' };

  const result = await db.query(
    `SELECT ep.id, ep.role, ep.display_name,
            EXISTS (
              SELECT 1 FROM encounter_consent_events ce
              WHERE ce.encounter_id = ep.encounter_id
                AND ce.participant_id = ep.id
                AND ce.kind = 'join'
            ) AS joined
     FROM encounter_participants ep
     WHERE ep.encounter_id = $1 AND ep.id = $2`,
    [claims.encounterId, claims.participantId]
  );
  const row = result.rows[0];
  if (!row) return { ok: false, status: 404, reason: 'unknown_participant' };
  if (!row.joined) return { ok: false, status: 403, reason: 'no_consent' };

  return {
    ok: true,
    encounterId: claims.encounterId,
    participantId: claims.participantId,
    role: row.role as string,
    displayName: row.display_name as string,
  };
}
