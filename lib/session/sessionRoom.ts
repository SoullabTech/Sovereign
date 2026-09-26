/**
 * Canonical LiveKit room-name derivation for a Session Room — Phase 3 (PR4a).
 *
 * THE single source of truth for "what is this session's LiveKit room called?" BOTH token-mint
 * paths — client (`authorizeClientRoomJoin`) and practitioner (the practitioner-room-token route) —
 * MUST derive the room name through THIS function, not by formatting the session id independently.
 *
 * Why a function and not "just use sessionId": it makes an entire class of silent failures
 * structurally impossible. If one path minted `"123"` and the other `"session:123"`, the two would
 * join *different* LiveKit rooms and silently never see or hear each other. One function ⇒ one room
 * ⇒ both participants always meet. It is deterministic and pure (the room IS the session id today);
 * centralizing it means any future format change stays in lock-step across both endpoints.
 */
export function getSessionRoomName(sessionId: string): string {
  return sessionId;
}
