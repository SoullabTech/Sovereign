/**
 * SANCTUARY-EDITORIAL-PERSISTENCE-01 / E1 — harness.
 *
 * The three durable editorial POST boundaries, adapted to what the laws
 * observe: a reply, and the exact persistence-library calls each handler
 * made. The libraries ARE the persistence (they open chains/threads and
 * append turns), so "calls = 0" is the hermetic form of "zero rows".
 */
import { NextRequest } from 'next/server';
import type { StorageLike } from '@/lib/sanctuary/currentClientPosture';

export const IDENTITY = { status: 'verified' as const, memberId: '11111111-1111-4111-8111-111111111111' };
export const FIX = {
  sectionId: '33333333-3333-4333-8333-333333333333',
  threadId: 't-1', chainId: 'c-1', revision: 7,
  range: { start: 21, end: 29 },
  text: 'Why does this sentence turn here?',
} as const;

export interface Recorder {
  readonly calls: string[];
  reset(): void;
}
export function makeRecorder(): Recorder {
  const calls: string[] = [];
  return { calls, reset() { calls.length = 0; } };
}

/** Conforming fakes for the persistence libraries, recording every call. */
export function makeLibs(rec: Recorder) {
  return {
    openEditorialRelationshipAtSelection: async (input: unknown) => { rec.calls.push(`open-passage:${JSON.stringify(input)}`); return { ok: true, threadId: FIX.threadId, chainId: FIX.chainId }; },
    openEditorialRelationship: async (input: unknown) => { rec.calls.push(`open-section:${JSON.stringify(input)}`); return { ok: true, threadId: FIX.threadId, chainId: FIX.chainId }; },
    readEditorialThread: async (_identity: unknown, threadId: string) => { rec.calls.push(`read:${threadId}`); return { ok: true, view: { threadId, chainId: FIX.chainId, locusText: 'far bank', targetSectionId: FIX.sectionId, turns: [], versions: [], headVersionId: null } }; },
    persistMemberEditorialAct: async (input: unknown) => { rec.calls.push(`persist-act:${JSON.stringify(input)}`); return { ok: true, turnIndex: 1, direction: null }; },
    runEditorialTurn: async (input: unknown) => { rec.calls.push('run-turn'); void input; return { ok: true, invocation: {}, request: {}, persisted: { turnIndex: 2, reply: 'A reply.', direction: null, version: null }, voice: null }; },
  };
}
export type Libs = ReturnType<typeof makeLibs>;

export interface Reply { readonly status: number; readonly json: Record<string, unknown> }
export interface RouteSet {
  passageOpen: (req: NextRequest) => Promise<Response>;
  sectionOpen: (req: NextRequest) => Promise<Response>;
  sectionGet: (req: NextRequest) => Promise<Response>;
  turn: (req: NextRequest) => Promise<Response>;
}
export interface ServerHarness {
  passageOpen(body: unknown): Promise<Reply>;
  sectionOpen(body: unknown): Promise<Reply>;
  threadGet(opts?: { sanctuaryHint?: boolean }): Promise<Reply>;
  turn(body: unknown): Promise<Reply>;
  calls(): readonly string[];
  reset(): void;
}
const BASE = 'http://localhost/api/writers-studio';
const read = async (res: Response): Promise<Reply> => {
  let json: Record<string, unknown> = {};
  try { json = (await res.json()) as Record<string, unknown>; } catch { json = {}; }
  return { status: res.status, json };
};
const post = (url: string, body: unknown) => new NextRequest(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });

export function makeServerHarness(routes: RouteSet, rec: Recorder): ServerHarness {
  return {
    passageOpen: async (body) => read(await routes.passageOpen(post(`${BASE}/rebuild/editorial/thread`, body))),
    sectionOpen: async (body) => read(await routes.sectionOpen(post(`${BASE}/editorial/thread`, body))),
    threadGet: async (opts) => read(await routes.sectionGet(new NextRequest(`${BASE}/editorial/thread?threadId=${FIX.threadId}${opts?.sanctuaryHint ? '&sanctuary=true' : ''}`, { method: 'GET', headers: opts?.sanctuaryHint ? { 'x-sanctuary': 'true' } : {} }))),
    turn: async (body) => read(await routes.turn(post(`${BASE}/editorial/turn`, body))),
    calls: () => rec.calls,
    reset: () => rec.reset(),
  };
}

/** In-memory storage for the caller laws. */
export function makeStorage(initial: Record<string, string> = {}) {
  const map = new Map(Object.entries(initial)); let fail = false;
  return {
    getItem(key: string): string | null { if (fail) throw new Error('storage unavailable'); return map.has(key) ? map.get(key)! : null; },
    set(key: string, value: string) { map.set(key, value); },
    failReads(on: boolean) { fail = on; },
  } satisfies StorageLike & Record<string, unknown>;
}
export type TestStorage = ReturnType<typeof makeStorage>;

/** What a caller did at one gesture: posted a body, or refused to post. */
export type Posted = { readonly posted: true; readonly body: Record<string, unknown> } | { readonly posted: false; readonly reason: string };
export interface Caller {
  openPassage(): Promise<Posted>;
  openSection(): Promise<Posted>;
  sendTurn(): Promise<Posted>;
}
/** A caller factory receives storage and a transport capture; it must read posture AT THE GESTURE. */
export type CallerFactory = (storage: TestStorage, transport: Transport) => Caller;
export interface Transport {
  /** Records the next POST body and returns a canned reply; `null` when nothing was posted. */
  capture<T>(run: () => Promise<T>): Promise<{ body: Record<string, unknown> | null; result: T }>;
}
