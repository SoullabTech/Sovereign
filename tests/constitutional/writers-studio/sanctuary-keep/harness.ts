/**
 * SANCTUARY-MANUSCRIPT-KEEP-01 / S1 — harness.
 *
 * Adapts any route-shaped `{ POST, DELETE }` (the live route or a defeat
 * candidate) to the small surface the laws observe: a reply, and the exact SQL
 * statements the handler issued through the (mocked) `query`. The recorder is
 * the only database: it answers by statement shape, so a handler that issues a
 * SELECT it should not have issued is seen, not silently satisfied.
 */

import { NextRequest } from 'next/server';

export const FIX = {
  memberId: '11111111-1111-4111-8111-111111111111',
  manuscriptId: '22222222-2222-4222-8222-222222222222',
  sectionId: '33333333-3333-4333-8333-333333333333',
  keepId: '44444444-4444-4444-8444-444444444444',
  text: 'the exact kept passage',
  body: 'Before it. the exact kept passage. After it.',
} as const;

export interface Recorder {
  readonly statements: string[];
  /** every statement since the recorder was created — survives reset() */
  readonly all: string[];
  reset(): void;
}

export function makeRecorder(): Recorder {
  const statements: string[] = [];
  const all: string[] = [];
  return {
    statements,
    all,
    reset() {
      statements.length = 0;
    },
  };
}

/** The fake `query`: records, then answers by statement shape. */
export function makeRecorderQuery(rec: Recorder) {
  return async (sql: string, params: unknown[] = []) => {
    const s = sql.replace(/\s+/g, ' ').trim();
    rec.statements.push(s);
    rec.all.push(s);
    if (/SELECT s\.id, s\.body FROM manuscript_sections/.test(s)) {
      const ok = params[0] === FIX.sectionId && params[1] === FIX.manuscriptId && params[2] === FIX.memberId;
      return { rows: ok ? [{ id: FIX.sectionId, body: FIX.body }] : [], rowCount: ok ? 1 : 0 };
    }
    if (/INSERT INTO manuscript_keeps/.test(s)) {
      return { rows: [{ id: FIX.keepId, created_at: '2026-09-22T00:00:00.000Z' }], rowCount: 1 };
    }
    if (/DELETE FROM manuscript_keeps/.test(s)) {
      return { rows: [], rowCount: params[0] === FIX.keepId ? 1 : 0 };
    }
    if (/maia_sessions|auth_sessions|maia_settings|member_settings/.test(s)) {
      // A session row that says "ordinary" — exactly what a substitution
      // candidate would love to find.
      return { rows: [{ sanctuary: false, mode: 'continuity', member_id: FIX.memberId }], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  };
}

export interface RouteLike {
  POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }): Promise<Response>;
  DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }): Promise<Response>;
}

export interface Reply {
  readonly status: number;
  readonly json: Record<string, unknown>;
}

export interface KeepHarness {
  post(body: unknown, opts?: { auth?: boolean }): Promise<Reply>;
  del(keepId: string, opts?: { sanctuaryHint?: boolean }): Promise<Reply>;
  statements(): readonly string[];
  allStatements(): readonly string[];
  reset(): void;
}

const URL_BASE = `http://localhost/api/sovereign/manuscripts/${FIX.manuscriptId}/keeps`;

export function makeHarness(
  route: RouteLike,
  rec: Recorder,
  auth: { current: string | null },
): KeepHarness {
  const ctx = () => ({ params: Promise.resolve({ id: FIX.manuscriptId }) });
  const read = async (res: Response): Promise<Reply> => {
    let json: Record<string, unknown> = {};
    try {
      json = (await res.json()) as Record<string, unknown>;
    } catch {
      json = {};
    }
    return { status: res.status, json };
  };
  return {
    async post(body, opts) {
      auth.current = opts?.auth === false ? null : FIX.memberId;
      const req = new NextRequest(URL_BASE, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      return read(await route.POST(req, ctx()));
    },
    async del(keepId, opts) {
      auth.current = FIX.memberId;
      const hint = opts?.sanctuaryHint ? '&sanctuary=true' : '';
      const req = new NextRequest(`${URL_BASE}?keepId=${encodeURIComponent(keepId)}${hint}`, {
        method: 'DELETE',
        headers: opts?.sanctuaryHint ? { 'x-sanctuary': 'true' } : {},
      });
      return read(await route.DELETE(req, ctx()));
    },
    statements: () => rec.statements,
    allStatements: () => rec.all,
    reset: () => rec.reset(),
  };
}

/** In-memory storage for the caller laws. */
export function makeStorage(initial: Record<string, string> = {}) {
  const map = new Map(Object.entries(initial));
  let throwOnRead = false;
  return {
    getItem(key: string): string | null {
      if (throwOnRead) throw new Error('storage unavailable');
      return map.has(key) ? map.get(key)! : null;
    },
    set(key: string, value: string) {
      map.set(key, value);
    },
    remove(key: string) {
      map.delete(key);
    },
    failReads(on: boolean) {
      throwOnRead = on;
    },
  };
}
export type TestStorage = ReturnType<typeof makeStorage>;
