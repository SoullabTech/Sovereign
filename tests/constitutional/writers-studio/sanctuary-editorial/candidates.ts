/**
 * E1 — conforming doubles + eleven defeat candidates. Each server candidate
 * replaces ONE decision on the conforming route set; each caller candidate
 * replaces one decision on the conforming caller. ⛔ Disposable. ⛔ Never a seed.
 */
import { NextResponse, type NextRequest } from 'next/server';
import { resolveCanonicalIdentity } from '@/lib/maia/canonical-turn';
import { openEditorialRelationship, openEditorialRelationshipAtSelection, readEditorialThread } from '@/lib/manuscript/editorialRuntime/thread';
import { persistMemberEditorialAct } from '@/lib/manuscript/editorialRuntime/memberAct';
import { runEditorialTurn } from '@/lib/manuscript/editorialRuntime/turn';
import { TurnPosture } from '@/lib/sanctuary/turnPosture';
import { readCurrentSanctuaryPosture, type CurrentPostureRead } from '@/lib/sanctuary/currentClientPosture';
import { FIX, type CallerFactory, type Posted, type RouteSet, type TestStorage, type Transport } from './harness';

type Body = Record<string, unknown>;
const json = (b: unknown, status = 200) => NextResponse.json(b, { status });
const postureRequired = () => json({ error: 'posture_required', persisted: false }, 400);
const sanctuaryUnavailable = () => json({ error: 'sanctuary_unavailable', persisted: false }, 409);
async function bodyOf(req: NextRequest): Promise<Body | null> { try { const b = await req.json(); return b && typeof b === 'object' && !Array.isArray(b) ? (b as Body) : null; } catch { return null; } }
async function identity(req: NextRequest) { const id = await resolveCanonicalIdentity(req); return id.status === 'verified' ? id : null; }

/** The posture decision, conforming: explicit boolean required; resolver minted from the body; refusal before any write. */
type PostureDecision = (b: Body) => Response | null;
const conformingPosture: PostureDecision = (b) => {
  if (typeof b['sanctuary'] !== 'boolean') return postureRequired();
  if (TurnPosture.resolve(b).sanctuary) return sanctuaryUnavailable();
  return null;
};

function passageOpenWith(decide: PostureDecision, order: 'before' | 'after' = 'before') {
  return async (req: NextRequest) => {
    const id = await identity(req); if (!id) return json({ error: 'Authentication required' }, 401);
    const b = await bodyOf(req); if (!b) return json({ error: 'a JSON object is required' }, 400);
    if (order === 'before') { const r = decide(b); if (r) return r; }
    const opened = await openEditorialRelationshipAtSelection({ identity: id, sectionId: b['sectionId'], revisionNumber: Number(b['revisionNumber']), range: b['range'] } as never);
    if (order === 'after') { const r = decide(b); if (r) return r; }
    return opened.ok ? json({ threadId: opened.threadId, chainId: opened.chainId }) : json({ error: opened.reason }, 400);
  };
}
function sectionOpenWith(decide: PostureDecision, order: 'before' | 'after' = 'before') {
  return async (req: NextRequest) => {
    const id = await identity(req); if (!id) return json({ error: 'Authentication required' }, 401);
    const b = await bodyOf(req); if (!b) return json({ error: 'a JSON object is required' }, 400);
    if (order === 'before') { const r = decide(b); if (r) return r; }
    const opened = await openEditorialRelationship({ identity: id, sectionId: b['sectionId'] } as never);
    if (order === 'after') { const r = decide(b); if (r) return r; }
    return opened.ok ? json({ threadId: opened.threadId, chainId: opened.chainId }) : json({ error: opened.reason }, 400);
  };
}
function turnWith(decide: PostureDecision, order: 'before' | 'after' = 'before') {
  return async (req: NextRequest) => {
    const id = await identity(req); if (!id) return json({ error: 'Authentication required' }, 401);
    const b = await bodyOf(req); if (!b) return json({ error: 'a JSON object is required' }, 400);
    if (order === 'before') { const r = decide(b); if (r) return r; }
    const act = await persistMemberEditorialAct({ memberId: id.memberId, threadId: b['threadId'], act: b['act'] } as never);
    if (!act.ok) return json({ error: 'refused' }, 400);
    if (order === 'after') { const r = decide(b); if (r) return r; }
    const turn = await runEditorialTurn({ identity: id, threadId: b['threadId'], currentTurnIndex: act.turnIndex, sanctuary: false } as never);
    if (!turn.ok) return json({ error: 'refused' }, 502);
    return json({ threadId: b['threadId'], memberTurnIndex: act.turnIndex, maiaTurnIndex: turn.persisted.turnIndex, response: turn.persisted.reply, direction: null, version: null, voice: null });
  };
}
async function sectionGet(req: NextRequest) {
  const id = await identity(req); if (!id) return json({ error: 'Authentication required' }, 401);
  const threadId = req.nextUrl.searchParams.get('threadId'); if (!threadId) return json({ error: 'threadId is required' }, 400);
  const read = await readEditorialThread(id, threadId);
  return read.ok ? json(read.view) : json({ error: read.reason }, 404);
}

export const REFERENCE_SERVER: RouteSet = { passageOpen: passageOpenWith(conformingPosture), sectionOpen: sectionOpenWith(conformingPosture), sectionGet, turn: turnWith(conformingPosture) };

/* ── decisions that are wrong ─────────────────────────────────────────── */
const noGuard: PostureDecision = () => null;
const absenceIsOrdinary: PostureDecision = (b) => (TurnPosture.resolve(b).sanctuary ? sanctuaryUnavailable() : null);
const stringCoercion: PostureDecision = (b) => { const s = b['sanctuary']; const v = s === true || s === 'true' ? true : s === false || s === 'false' ? false : undefined; if (v === undefined) return postureRequired(); return v ? sanctuaryUnavailable() : null; };
/** the "session default": a lookup answering ordinary whenever the body carries nothing */
const sessionDefault: PostureDecision = (b) => { const v = typeof b['sanctuary'] === 'boolean' ? b['sanctuary'] : /* SELECT sanctuary FROM maia_sessions … */ false; return v ? sanctuaryUnavailable() : null; };

const S = (name: string, over: Partial<RouteSet>) => ({ name, routes: { ...REFERENCE_SERVER, ...over } });
export const SERVER_CANDIDATES = [
  S('E1-D1-client-only-guard', { passageOpen: passageOpenWith(noGuard), sectionOpen: sectionOpenWith(noGuard), turn: turnWith(noGuard) }),
  S('E1-D2-missing-posture-resolves-ordinary', { passageOpen: passageOpenWith(absenceIsOrdinary), sectionOpen: sectionOpenWith(absenceIsOrdinary), turn: turnWith(absenceIsOrdinary) }),
  S('E1-D3-passage-thread-opens-before-refusal', { passageOpen: passageOpenWith(conformingPosture, 'after') }),
  S('E1-D4-section-thread-opens-before-refusal', { sectionOpen: sectionOpenWith(conformingPosture, 'after') }),
  S('E1-D5-member-turn-persists-before-refusal', { turn: turnWith(conformingPosture, 'after') }),
  S('E1-D6-session-default-substituted', { passageOpen: passageOpenWith(sessionDefault), sectionOpen: sectionOpenWith(sessionDefault), turn: turnWith(sessionDefault) }),
  S('E1-D7-string-posture-coercion', { passageOpen: passageOpenWith(stringCoercion), sectionOpen: sectionOpenWith(stringCoercion), turn: turnWith(stringCoercion) }),
  S('E1-D8-turn-guarded-thread-open-writable', { passageOpen: passageOpenWith(noGuard), sectionOpen: sectionOpenWith(noGuard) }),
  S('E1-D9-passage-guarded-section-writable', { sectionOpen: sectionOpenWith(noGuard) }),
  S('E1-D11-thread-read-blocked', { sectionGet: async (req: NextRequest) => (req.nextUrl.searchParams.get('sanctuary') === 'true' || req.headers.get('x-sanctuary') === 'true') ? sanctuaryUnavailable() : sectionGet(req) }),
];
export const SERVER_NAMED_KILL: Record<string, string> = {
  'E1-D1-client-only-guard': 'E1-L1-passage-open-sanctuary-zero-write',
  'E1-D2-missing-posture-resolves-ordinary': 'E1-L2-passage-open-unresolved-fails-closed',
  'E1-D3-passage-thread-opens-before-refusal': 'E1-L1-passage-open-sanctuary-zero-write',
  'E1-D4-section-thread-opens-before-refusal': 'E1-L3-section-open-sanctuary-zero-write',
  'E1-D5-member-turn-persists-before-refusal': 'E1-L5-turn-sanctuary-zero-write',
  'E1-D6-session-default-substituted': 'E1-L2-passage-open-unresolved-fails-closed',
  'E1-D7-string-posture-coercion': 'E1-L2-passage-open-unresolved-fails-closed',
  'E1-D8-turn-guarded-thread-open-writable': 'E1-L1-passage-open-sanctuary-zero-write',
  'E1-D9-passage-guarded-section-writable': 'E1-L3-section-open-sanctuary-zero-write',
  'E1-D11-thread-read-blocked': 'E1-L8-thread-read-not-gated',
};
export const SERVER_CLASSIFIED: Record<string, string[]> = {
  // A route set that reads no posture fails every refusal law and cannot distinguish refusals it never makes.
  'E1-D1-client-only-guard': ['E1-L2-passage-open-unresolved-fails-closed', 'E1-L3-section-open-sanctuary-zero-write', 'E1-L4-section-open-unresolved-fails-closed', 'E1-L5-turn-sanctuary-zero-write', 'E1-L6-turn-unresolved-fails-closed', 'E1-L9-refusals-distinct-and-content-free'],
  // One wrong decision applied at all three boundaries fails the same law at all three.
  'E1-D2-missing-posture-resolves-ordinary': ['E1-L4-section-open-unresolved-fails-closed', 'E1-L6-turn-unresolved-fails-closed'],
  'E1-D6-session-default-substituted': ['E1-L4-section-open-unresolved-fails-closed', 'E1-L6-turn-unresolved-fails-closed'],
  'E1-D7-string-posture-coercion': ['E1-L4-section-open-unresolved-fails-closed', 'E1-L6-turn-unresolved-fails-closed'],
  // A guard placed after the write opens/persists for every posture outcome, unresolved included.
  'E1-D3-passage-thread-opens-before-refusal': ['E1-L2-passage-open-unresolved-fails-closed'],
  'E1-D4-section-thread-opens-before-refusal': ['E1-L4-section-open-unresolved-fails-closed'],
  'E1-D5-member-turn-persists-before-refusal': ['E1-L6-turn-unresolved-fails-closed'],
  // Both opens unguarded: every open law falls.
  'E1-D8-turn-guarded-thread-open-writable': ['E1-L2-passage-open-unresolved-fails-closed', 'E1-L3-section-open-sanctuary-zero-write', 'E1-L4-section-open-unresolved-fails-closed'],
  'E1-D9-passage-guarded-section-writable': ['E1-L4-section-open-unresolved-fails-closed'],
};

/* ── callers ──────────────────────────────────────────────────────────── */
function bodiesFor(posture: CurrentPostureRead) {
  const s = posture.resolved ? { sanctuary: posture.sanctuary } : null;
  return {
    passage: s ? { sectionId: FIX.sectionId, range: FIX.range, revisionNumber: FIX.revision, ...s } : null,
    section: s ? { sectionId: FIX.sectionId, ...s } : null,
    turn: s ? { threadId: FIX.threadId, act: { act: 'discourse', text: FIX.text, refersTo: null }, ...s } : null,
  };
}
const postOr = (b: Body | null): Posted => (b ? { posted: true, body: b } : { posted: false, reason: 'posture_unresolved' });

/** Conforming caller double: posture read at each gesture from the live key, body carries the boolean, unresolved never posts. */
export const REFERENCE_CALLER: CallerFactory = (storage: TestStorage) => ({
  openPassage: async () => postOr(bodiesFor(readCurrentSanctuaryPosture(storage)).passage),
  openSection: async () => postOr(bodiesFor(readCurrentSanctuaryPosture(storage)).section),
  sendTurn: async () => postOr(bodiesFor(readCurrentSanctuaryPosture(storage)).turn),
});
export const CALLER_CANDIDATES: Record<string, CallerFactory> = {
  /** D10 · posture read once when the caller mounts */
  'E1-D10-posture-snapshotted-at-mount': (storage: TestStorage) => { const snap = readCurrentSanctuaryPosture(storage); return { openPassage: async () => postOr(bodiesFor(snap).passage), openSection: async () => postOr(bodiesFor(snap).section), sendTurn: async () => postOr(bodiesFor(snap).turn) }; },
  /** D6 (client half) · account default fills an unresolved live posture */
  'E1-D6c-account-default-fallback': (storage: TestStorage) => {
    const read = (): CurrentPostureRead => { const live = readCurrentSanctuaryPosture(storage); if (live.resolved) return live; try { const mode = JSON.parse(storage.getItem('maia_account_settings') ?? 'null')?.defaultMemoryMode; if (mode === 'sanctuary' || mode === 'continuity') return { resolved: true, sanctuary: mode === 'sanctuary' }; } catch { /* fall through */ } return live; };
    return { openPassage: async () => postOr(bodiesFor(read()).passage), openSection: async () => postOr(bodiesFor(read()).section), sendTurn: async () => postOr(bodiesFor(read()).turn) };
  },
  /** D7 (client half) · 'true' string counts, anything else is ordinary */
  'E1-D7c-string-coercion': (storage: TestStorage) => {
    const read = (): CurrentPostureRead => { try { const raw = storage.getItem('maia_settings'); if (raw === null) return { resolved: false, reason: 'no_live_settings' }; const v = JSON.parse(raw)?.sanctuary; return { resolved: true, sanctuary: v === true || v === 'true' }; } catch { return { resolved: false, reason: 'unreadable' }; } };
    return { openPassage: async () => postOr(bodiesFor(read()).passage), openSection: async () => postOr(bodiesFor(read()).section), sendTurn: async () => postOr(bodiesFor(read()).turn) };
  },
  /** D1 (client half) · today's bodies — no posture at all */
  'E1-D1c-omits-posture': () => ({
    openPassage: async () => ({ posted: true, body: { sectionId: FIX.sectionId, range: FIX.range, revisionNumber: FIX.revision } }),
    openSection: async () => ({ posted: true, body: { sectionId: FIX.sectionId } }),
    sendTurn: async () => ({ posted: true, body: { threadId: FIX.threadId, act: { act: 'discourse', text: FIX.text, refersTo: null } } }),
  }),
};
export const CALLER_NAMED_KILL: Record<string, string> = {
  'E1-D10-posture-snapshotted-at-mount': 'E1-C1-reads-posture-at-gesture',
  'E1-D6c-account-default-fallback': 'E1-C3-unresolved-never-posts',
  'E1-D7c-string-coercion': 'E1-C4-malformed-or-unavailable-never-posts',
  'E1-D1c-omits-posture': 'E1-C2-explicit-boolean-on-every-body',
};
export const CALLER_CLASSIFIED: Record<string, string[]> = {
  // A caller that never reads posture cannot track a change and cannot be unresolved.
  'E1-D1c-omits-posture': ['E1-C1-reads-posture-at-gesture', 'E1-C3-unresolved-never-posts', 'E1-C4-malformed-or-unavailable-never-posts'],
};
export type { Transport };
