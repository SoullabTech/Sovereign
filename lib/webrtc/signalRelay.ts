/**
 * WebRTC signaling relay — Phase A (transport smoke test).
 *
 * In-memory, per-room pub/sub for exchanging SDP offers/answers + ICE candidates
 * between two peers. NO persistence, NO DB, NO Encounter/scribe/transcript writes.
 *
 * Single-instance only (fine for a smoke test / single dev or prod container).
 * A multi-instance deploy would need a shared bus (Redis/pg LISTEN); out of scope for Phase A.
 *
 * INSTRUMENTED (2026-07-05): logs room membership at every subscribe/unsubscribe/publish so a
 * failed two-peer rendezvous is diagnosable from the server log. `[signal]` prefix.
 */

// Module-load marker + identity. If this line prints more than once, or MODULE_ID differs
// between two peers' subscribe logs, the in-memory Map is NOT shared (module was instantiated
// more than once) — which is the root cause of "peers never see each other".
const MODULE_ID = Math.floor(Math.random() * 1e6).toString(36);
// eslint-disable-next-line no-console
console.log(`[signal] relay module loaded — MODULE_ID=${MODULE_ID}`);

export type SignalMessage = {
  type: 'offer' | 'answer' | 'ice' | 'peer-join' | 'peer-present' | 'peer-leave' | 'connected' | 'ping';
  from: string;
  to?: string;
  payload?: unknown;
};

type Send = (msg: SignalMessage) => void;

// Next.js dev (and some prod bundling) evaluates this module MORE THAN ONCE per process — the
// MODULE_ID logs proved it. Module-scoped state would then split, so two peers on different
// instances never rendezvous. Pin the room map to a per-process globalThis singleton so every
// instance shares ONE map. (Single-container prod: same. MULTI-instance prod needs a real bus —
// pg LISTEN/NOTIFY or Redis — a named Phase-A hardening item; globalThis is per-process only.)
const globalForRelay = globalThis as unknown as { __signalRooms?: Map<string, Map<string, Send>> };
const rooms: Map<string, Map<string, Send>> = (globalForRelay.__signalRooms ??= new Map());

const members = (roomId: string) => [...(rooms.get(roomId)?.keys() ?? [])].join(',');

export function subscribe(roomId: string, peerId: string, send: Send): void {
  let room = rooms.get(roomId);
  if (!room) {
    room = new Map();
    rooms.set(roomId, room);
  }
  const isReconnect = room.has(peerId);
  room.set(peerId, send);
  // eslint-disable-next-line no-console
  console.log(`[signal] ${isReconnect ? 'RE-SUBSCRIBE' : 'SUBSCRIBE'} ${peerId} room=${roomId} MODULE_ID=${MODULE_ID} members=[${members(roomId)}]`);

  // Tell the newcomer who is already here, and tell the incumbents someone joined.
  for (const [pid, incumbentSend] of room) {
    if (pid === peerId) continue;
    send({ type: 'peer-present', from: pid });
    incumbentSend({ type: 'peer-join', from: peerId });
    // eslint-disable-next-line no-console
    console.log(`[signal] announce peer-present(${pid})->${peerId} + peer-join(${peerId})->${pid}`);
  }
}

/**
 * Remove a peer. `send` (when provided) guards a reconnect race: the OLD connection's
 * abort may fire AFTER the new one re-subscribed with the same peerId — deleting by
 * peerId alone would evict the NEW connection and broadcast a spurious peer-leave.
 * Only delete if the current entry belongs to the departing connection.
 */
export function unsubscribe(roomId: string, peerId: string, send?: Send): void {
  const room = rooms.get(roomId);
  if (!room) return;
  if (send && room.get(peerId) !== send) {
    // eslint-disable-next-line no-console
    console.log(`[signal] stale UNSUBSCRIBE ignored for ${peerId} room=${roomId} (reconnected already)`);
    return;
  }
  room.delete(peerId);
  // eslint-disable-next-line no-console
  console.log(`[signal] UNSUBSCRIBE ${peerId} room=${roomId} remaining=[${members(roomId)}]`);
  for (const [, send] of room) send({ type: 'peer-leave', from: peerId });
  if (room.size === 0) rooms.delete(roomId);
}

/** Relay a message to the other peer(s) in the room. Never echoes to the sender. */
export function publish(roomId: string, msg: SignalMessage): void {
  const room = rooms.get(roomId);
  if (!room) {
    // eslint-disable-next-line no-console
    console.log(`[signal] PUBLISH from=${msg.from} type=${msg.type} room=${roomId} — NO ROOM (empty relay)`);
    return;
  }
  const recipients: string[] = [];
  for (const [pid, send] of room) {
    if (pid === msg.from) continue;
    if (msg.to && pid !== msg.to) continue;
    send(msg);
    recipients.push(pid);
  }
  // eslint-disable-next-line no-console
  console.log(`[signal] PUBLISH from=${msg.from} type=${msg.type} room=${roomId} members=[${members(roomId)}] -> [${recipients.join(',')}]`);
}

export function roomSize(roomId: string): number {
  return rooms.get(roomId)?.size ?? 0;
}
