/**
 * Ideas Fault-Localization Instrument — T1 proof obligations.
 *
 * Specification: docs/specs/IDEAS_CUT02_FAULT_LOCALIZATION_INSTRUMENT.md §6
 * Base:          2c7f7e329a9bd8df3f50f5a83c410e683dcb4744
 *
 * Failures are induced by mocking the dependency at its module boundary, per
 * §6 — the spec forbids a runtime fault-injection flag, and none exists.
 *
 * P11 and P13 are T2 obligations (durable tier) and are NOT claimed here.
 */
import { describe, it, expect, jest, beforeEach, afterAll } from '@jest/globals';
import { NextRequest } from 'next/server';
import {
  ATTEMPT_ID_HEADER, ATTEMPT_MARKER, SEAM_STAGES, TAXONOMY_VERSION,
} from '@/lib/ideas/attemptInstrument';

const MEMBER = '11111111-1111-4111-8111-111111111111';
const IDEA = '22222222-2222-4222-8222-222222222222';
const BLOCK = '33333333-3333-4333-8333-333333333333';
const ATTEMPT = '44444444-4444-4444-8444-444444444444';
const CREATED_AT = '2026-09-02T00:00:00.000Z';

/** Distinctive strings that must never appear in any record. */
const MEMBER_TEXT = 'MEMBERTEXT-the-thing-I-am-working-through';
const IDEA_TITLE = 'IDEATITLE-my-private-project';
const IDEA_FRAMING = 'IDEAFRAMING-why-this-matters-to-me';
const MODEL_OUTPUT = 'MODELOUTPUT-you-have-already-named-the-audience';
const SECRET = 'sk-ant-SECRETKEYVALUE-must-never-be-logged';

const mockGetCurrentSession = jest.fn<() => Promise<{ memberId: string } | null>>();
jest.mock('@/lib/auth/serverSessions', () => ({
  getCurrentSession: () => mockGetCurrentSession(),
}));

const mockQuery = jest.fn<(sql: string, params?: unknown[]) => Promise<{ rows: unknown[] }>>();
jest.mock('@/lib/db/postgres', () => ({
  __esModule: true,
  default: { query: (s: string, p?: unknown[]) => mockQuery(s, p) },
  query: (s: string, p?: unknown[]) => mockQuery(s, p),
}));

/** The SDK is mocked at its module boundary so C1/C2/C3 can each be failed alone. */
const mockCreate = jest.fn<() => Promise<unknown>>();
const mockClientCtor = jest.fn();
jest.mock('@anthropic-ai/sdk', () => ({
  __esModule: true,
  default: class {
    messages = { create: () => mockCreate() };
    constructor(opts: unknown) { mockClientCtor(opts); }
  },
}));

const mockRunRecognition = jest.fn<() => unknown>();
jest.mock('@/lib/maia/decisionChangeRecognition', () => ({
  runRecognition: () => mockRunRecognition(),
  getRecentRecognitionEvents: async () => [],
  storeRecognitionEvent: () => undefined,
}));

import { POST } from '../route';

interface Rec {
  attempt_id: string; attempt_id_source: string; request_id: string | null;
  member_id: string | null; idea_id: string | null;
  stage: string; event: string; error_class: string | null;
  upstream_status: number | null; upstream_request_id: string | null;
  upstream_error_type: string | null; retryable: boolean | null;
  stack_fingerprint: string | null; source_frames: string[] | null;
  runtime_revision: Record<string, unknown>; taxonomy_version: number;
  duration_ms: number | null; stance: string | null; prompt_chars: number | null;
  occurred_at: string;
}

let captured: string[] = [];
const realLog = console.log;
const realError = console.error;

const records = (): Rec[] => captured
  .filter((l) => l.startsWith(ATTEMPT_MARKER))
  .map((l) => JSON.parse(l.slice(ATTEMPT_MARKER.length + 1)) as Rec);

const at = (stage: string) => records().filter((r) => r.stage === stage);
const failures = () => records().filter((r) => r.event === 'failed');

const req = (headers: Record<string, string> = {}) =>
  new NextRequest(`https://soullab.life/api/ideas/${IDEA}/ask-maia`, {
    method: 'POST', headers, body: JSON.stringify({}),
  });
const params = (id = IDEA) => ({ params: Promise.resolve({ id }) });

function happyQuery(sql: string): Promise<{ rows: unknown[] }> {
  if (sql.includes('FROM member_ideas')) {
    return Promise.resolve({ rows: [{ id: IDEA, title: IDEA_TITLE, framing: IDEA_FRAMING }] });
  }
  if (sql.includes('INSERT INTO member_idea_blocks')) {
    return Promise.resolve({ rows: [{
      id: BLOCK, block_type: 'maia_reflection', content: MODEL_OUTPUT,
      metadata: { source: 'maia', invoked_from: 'idea_thread' }, created_at: CREATED_AT,
    }] });
  }
  if (sql.includes('COUNT(*)')) return Promise.resolve({ rows: [{ count: '2' }] });
  if (sql.includes("block_type IN ('note'")) {
    return Promise.resolve({ rows: [{
      id: 'b1', block_type: 'note', content: MEMBER_TEXT, metadata: {}, created_at: CREATED_AT,
    }] });
  }
  return Promise.resolve({ rows: [] });
}

beforeEach(() => {
  jest.clearAllMocks();
  captured = [];
  console.log = (...a: unknown[]) => { captured.push(a.map(String).join(' ')); };
  console.error = () => undefined;
  process.env.GIT_COMMIT = 'deadbee';
  process.env.ANTHROPIC_API_KEY = SECRET;
  delete process.env.IDEAS_ATTEMPT_LOG_DISABLED;
  mockGetCurrentSession.mockResolvedValue({ memberId: MEMBER });
  mockQuery.mockImplementation((sql) => happyQuery(sql));
  mockCreate.mockResolvedValue({ content: [{ type: 'text', text: MODEL_OUTPUT }] });
  mockRunRecognition.mockReturnValue(null);
});
afterAll(() => { console.log = realLog; console.error = realError; });

const BASELINE_BODY = {
  success: true,
  block: {
    id: BLOCK, block_type: 'maia_reflection', content: MODEL_OUTPUT,
    metadata: { source: 'maia', invoked_from: 'idea_thread' }, created_at: CREATED_AT,
  },
};

// ═══════════════════════════════════════════════════════════════
// P1 · lifecycle
// ═══════════════════════════════════════════════════════════════

describe('P1 — one entered and one resolution per seam, none silent, none doubled', () => {
  const REACHED = [
    'session_resolve', 'idea_fetch', 'context_read_blocks', 'context_read_decision',
    'context_read_reflections', 'context_read_count', 'model_client_init',
    'model_call', 'model_parse', 'persist_reflection', 'touch_idea',
  ];

  it('emits exactly one entered and one resolution for every seam reached', async () => {
    await POST(req(), params());
    for (const stage of REACHED) {
      const rs = at(stage);
      expect(rs.filter((r) => r.event === 'entered')).toHaveLength(1);
      expect(rs.filter((r) => r.event === 'completed' || r.event === 'failed')).toHaveLength(1);
    }
  });

  it('emits entered before its resolution at every seam', async () => {
    await POST(req(), params());
    const seq = records().map((r) => `${r.stage}:${r.event}`);
    for (const stage of REACHED) {
      expect(seq.indexOf(`${stage}:completed`)).toBeGreaterThan(seq.indexOf(`${stage}:entered`));
    }
  });

  it('closes the attempt exactly once', async () => {
    await POST(req(), params());
    expect(at('attempt_close')).toHaveLength(1);
    expect(at('attempt_close')[0].event).toBe('completed');
  });

  it('uses only the closed stage vocabulary', async () => {
    await POST(req(), params());
    const known = new Set<string>([...SEAM_STAGES, 'attempt_open', 'attempt_close']);
    for (const r of records()) expect(known.has(r.stage)).toBe(true);
  });

  it('never dates an entered event with a duration', async () => {
    await POST(req(), params());
    for (const r of records().filter((x) => x.event === 'entered')) {
      expect(r.duration_ms).toBeNull();
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// P2 · error classes do not collapse
// ═══════════════════════════════════════════════════════════════

describe('P2 — each induced failure yields the correct, distinct error_class', () => {
  it('an unauthenticated request classifies auth at session_resolve', async () => {
    mockGetCurrentSession.mockResolvedValue(null);
    const res = await POST(req(), params());
    expect(res.status).toBe(401);
    expect(at('session_resolve').find((r) => r.event === 'failed')?.error_class).toBe('auth');
  });

  it('a bad idea id classifies validation and never reaches a read', async () => {
    await POST(req(), params('not-a-uuid'));
    expect(at('attempt_close')[0].error_class).toBe('validation');
    expect(at('idea_fetch')).toHaveLength(0);
  });

  it('a missing idea classifies not_found, distinct from db_read', async () => {
    mockQuery.mockImplementation((sql) =>
      sql.includes('FROM member_ideas') && !sql.includes('UPDATE')
        ? Promise.resolve({ rows: [] }) : happyQuery(sql));
    await POST(req(), params());
    expect(at('idea_fetch').find((r) => r.event === 'failed')?.error_class).toBe('not_found');
  });

  it('a failing read classifies db_read; a failing write classifies db_write', async () => {
    mockQuery.mockImplementation((sql) =>
      sql.includes("block_type IN ('note'")
        ? Promise.reject(new Error('read failed')) : happyQuery(sql));
    await POST(req(), params());
    expect(at('context_read_blocks').find((r) => r.event === 'failed')?.error_class).toBe('db_read');

    captured = [];
    mockQuery.mockImplementation((sql) =>
      sql.includes('INSERT INTO member_idea_blocks')
        ? Promise.reject(new Error('write failed')) : happyQuery(sql));
    await POST(req(), params());
    expect(at('persist_reflection').find((r) => r.event === 'failed')?.error_class).toBe('db_write');
  });

  it('distinguishes the four context reads from one another', async () => {
    const cases: [string, string][] = [
      ["block_type IN ('note'", 'context_read_blocks'],
      ["block_type = 'decision'", 'context_read_decision'],
      ["block_type = 'maia_reflection'\n        ORDER BY", 'context_read_reflections'],
      ['COUNT(*)', 'context_read_count'],
    ];
    for (const [needle, stage] of cases) {
      captured = [];
      mockQuery.mockImplementation((sql) =>
        sql.includes(needle) ? Promise.reject(new Error('boom')) : happyQuery(sql));
      await POST(req(), params());
      expect(failures().map((f) => f.stage)).toContain(stage);
      /* The load-bearing half: no OTHER context read is blamed. */
      const blamedReads = failures()
        .map((f) => f.stage).filter((s) => s.startsWith('context_read_'));
      expect(blamedReads).toEqual([stage]);
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// P3 / P4 · C1 · C2 · C3 — the discrimination that motivates the lane
// ═══════════════════════════════════════════════════════════════

describe('P3 — model_client_init, model_call and model_parse are mutually distinguishable', () => {
  it('a client-construction failure is model_client_init / model_config alone', async () => {
    mockClientCtor.mockImplementation(() => { throw new Error('bad config'); });
    await POST(req(), params());
    const f = failures().filter((r) => r.stage.startsWith('model_'));
    expect(f.map((r) => r.stage)).toEqual(['model_client_init']);
    expect(f[0].error_class).toBe('model_config');
    expect(at('model_call')).toHaveLength(0);
    mockClientCtor.mockReset();
  });

  it('a provider failure is model_call / model_upstream alone', async () => {
    mockCreate.mockRejectedValue(Object.assign(new Error('overloaded'), { status: 529 }));
    await POST(req(), params());
    const f = failures().filter((r) => r.stage.startsWith('model_'));
    expect(f.map((r) => r.stage)).toEqual(['model_call']);
    expect(f[0].error_class).toBe('model_upstream');
    /* The client was constructed successfully — C1 is ruled out, not implicated. */
    expect(at('model_client_init').find((r) => r.event === 'completed')).toBeDefined();
    expect(at('model_parse')).toHaveLength(0);
  });

  it('a response-shape failure is model_parse / model_parse alone', async () => {
    mockCreate.mockResolvedValue({ content: [{ type: 'tool_use' }] });
    await POST(req(), params());
    const f = failures().filter((r) => r.stage.startsWith('model_'));
    expect(f.map((r) => r.stage)).toEqual(['model_parse']);
    expect(f[0].error_class).toBe('model_parse');
    /* C2 succeeded — the provider answered. That is the discrimination. */
    expect(at('model_call').find((r) => r.event === 'completed')).toBeDefined();
  });
});

describe('P4 — an empty content array is classified model_parse WITHOUT repairing C3', () => {
  it('classifies the empty-array fault at model_parse', async () => {
    mockCreate.mockResolvedValue({ content: [] });
    const res = await POST(req(), params());
    const f = failures().filter((r) => r.stage.startsWith('model_'));
    expect(f.map((r) => r.stage)).toEqual(['model_parse']);
    expect(f[0].error_class).toBe('model_parse');
    /* NOT REPAIRED: the request still fails exactly as it did, with the same
       member-facing body. An instrument that fixed C3 would hide it. */
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'Failed to generate reflection' });
  });

  it('leaves the underlying defect standing — no reflection is persisted', async () => {
    mockCreate.mockResolvedValue({ content: [] });
    await POST(req(), params());
    expect(at('persist_reflection')).toHaveLength(0);
  });
});

// ═══════════════════════════════════════════════════════════════
// P5 · upstream fields — what makes C2 decidable
// ═══════════════════════════════════════════════════════════════

describe('P5 — a provider error records the structured upstream fields', () => {
  it('records status, request id, error type and retryability', async () => {
    mockCreate.mockRejectedValue(Object.assign(new Error('overloaded'), {
      status: 529,
      request_id: 'req_upstream_abc123',
      error: { error: { type: 'overloaded_error' } },
    }));
    await POST(req(), params());
    const f = at('model_call').find((r) => r.event === 'failed')!;
    expect(f.upstream_status).toBe(529);
    expect(f.upstream_request_id).toBe('req_upstream_abc123');
    expect(f.upstream_error_type).toBe('overloaded_error');
    expect(f.retryable).toBe(true);
  });

  it('marks a non-retried class as not retryable, which is what ranks C2', async () => {
    mockCreate.mockRejectedValue(Object.assign(new Error('bad request'), { status: 400 }));
    await POST(req(), params());
    const f = at('model_call').find((r) => r.event === 'failed')!;
    expect(f.retryable).toBe(false);
  });

  it('leaves the fields null when the SDK exposes none', async () => {
    mockCreate.mockRejectedValue(new Error('socket hang up'));
    await POST(req(), params());
    const f = at('model_call').find((r) => r.event === 'failed')!;
    expect(f.upstream_status).toBeNull();
    expect(f.retryable).toBeNull();
  });
});

// ═══════════════════════════════════════════════════════════════
// P6 / P7 / P15 · the two identifiers
// ═══════════════════════════════════════════════════════════════

describe('P6 — attempt_id correlates records across the two requests', () => {
  it('carries the client attempt id on every record of this request', async () => {
    await POST(req({ [ATTEMPT_ID_HEADER]: ATTEMPT }), params());
    const rs = records();
    expect(rs.length).toBeGreaterThan(1);
    expect(rs.every((r) => r.attempt_id === ATTEMPT)).toBe(true);
    expect(rs.every((r) => r.attempt_id_source === 'client')).toBe(true);
  });

  it('uses one server-minted request_id for the whole request', async () => {
    await POST(req({ [ATTEMPT_ID_HEADER]: ATTEMPT }), params());
    const ids = new Set(records().map((r) => r.request_id));
    expect(ids.size).toBe(1);
    expect([...ids][0]).not.toBe(ATTEMPT);
  });
});

describe('P7 — a malformed or absent attempt id never fails the request', () => {
  it('mints a server id and marks it, on a malformed header', async () => {
    const res = await POST(req({ [ATTEMPT_ID_HEADER]: 'not-a-uuid; DROP TABLE' }), params());
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual(BASELINE_BODY);
    expect(records().every((r) => r.attempt_id_source === 'server')).toBe(true);
    expect(records().every((r) => /^[0-9a-f-]{36}$/i.test(r.attempt_id))).toBe(true);
  });

  it('mints a server id when the header is absent', async () => {
    const res = await POST(req(), params());
    expect(res.status).toBe(201);
    expect(records().every((r) => r.attempt_id_source === 'server')).toBe(true);
  });

  it('rejects silently — the rejection reaches no response body or header', async () => {
    const res = await POST(req({ [ATTEMPT_ID_HEADER]: 'bad' }), params());
    expect(JSON.stringify(await res.json())).not.toContain('attempt');
    expect([...res.headers.keys()].join(',').toLowerCase()).not.toContain('attempt');
  });
});

describe('P15 — neither identifier authorizes, selects, or mutates anything', () => {
  it('takes member_id from the session only, never from the header', async () => {
    await POST(req({ [ATTEMPT_ID_HEADER]: ATTEMPT }), params());
    expect(records().every((r) => r.member_id === MEMBER || r.member_id === null)).toBe(true);
    /* Every SQL parameter list carries the SESSION's member id. A forged
       attempt id reached no query. */
    const params_ = mockQuery.mock.calls.flatMap((c) => (c[1] ?? []) as unknown[]);
    expect(params_).not.toContain(ATTEMPT);
  });

  it('a foreign attempt_id selects nothing — the same rows are read either way', async () => {
    await POST(req({ [ATTEMPT_ID_HEADER]: ATTEMPT }), params());
    const withId = mockQuery.mock.calls.map((c) => [c[0], JSON.stringify(c[1])]);
    jest.clearAllMocks();
    mockGetCurrentSession.mockResolvedValue({ memberId: MEMBER });
    mockQuery.mockImplementation((sql) => happyQuery(sql));
    mockCreate.mockResolvedValue({ content: [{ type: 'text', text: MODEL_OUTPUT }] });
    mockRunRecognition.mockReturnValue(null);
    await POST(req({ [ATTEMPT_ID_HEADER]: '99999999-9999-4999-8999-999999999999' }), params());
    const withOther = mockQuery.mock.calls.map((c) => [c[0], JSON.stringify(c[1])]);
    expect(withOther).toEqual(withId);
  });

  it('records the idea id only after ownership was established', async () => {
    mockQuery.mockImplementation((sql) =>
      sql.includes('FROM member_ideas') && !sql.includes('UPDATE')
        ? Promise.resolve({ rows: [] }) : happyQuery(sql));
    await POST(req(), params());
    /* Ownership failed, so no record may claim the idea. */
    expect(records().every((r) => r.idea_id === null)).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════
// P8 / P10 · the member-facing surface
// ═══════════════════════════════════════════════════════════════

describe('P8 — the response is byte-identical to today\'s', () => {
  it('returns the unchanged success body and status', async () => {
    const res = await POST(req(), params());
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual(BASELINE_BODY);
  });

  it('returns the unchanged 500 body — no stage, class, or id leaks', async () => {
    mockCreate.mockRejectedValue(Object.assign(new Error('overloaded'), {
      status: 529, request_id: 'req_upstream_abc123',
    }));
    const res = await POST(req({ [ATTEMPT_ID_HEADER]: ATTEMPT }), params());
    expect(res.status).toBe(500);
    const body = await res.text();
    expect(body).toBe(JSON.stringify({ error: 'Failed to generate reflection' }));
    for (const leak of [ATTEMPT, 'model_call', 'model_upstream', 'req_upstream_abc123', '529']) {
      expect(body).not.toContain(leak);
    }
  });

  it('adds no response header on any path', async () => {
    for (const setup of [
      () => {},
      () => { mockCreate.mockRejectedValue(new Error('boom')); },
      () => { mockGetCurrentSession.mockResolvedValue(null); },
    ]) {
      setup();
      const res = await POST(req({ [ATTEMPT_ID_HEADER]: ATTEMPT }), params());
      const names = [...res.headers.keys()].map((n) => n.toLowerCase()).join(',');
      expect(names).not.toContain('attempt');
      expect(names).not.toContain('stage');
      expect(names).not.toContain('request-id');
      mockCreate.mockResolvedValue({ content: [{ type: 'text', text: MODEL_OUTPUT }] });
      mockGetCurrentSession.mockResolvedValue({ memberId: MEMBER });
    }
  });

  it('preserves the 401, 400 and 404 refusals exactly', async () => {
    mockGetCurrentSession.mockResolvedValue(null);
    expect(await (await POST(req(), params())).json()).toEqual({ error: 'Unauthorized' });
    mockGetCurrentSession.mockResolvedValue({ memberId: MEMBER });
    expect(await (await POST(req(), params('nope'))).json()).toEqual({ error: 'Invalid idea id' });
    mockQuery.mockImplementation((sql) =>
      sql.includes('FROM member_ideas') && !sql.includes('UPDATE')
        ? Promise.resolve({ rows: [] }) : happyQuery(sql));
    expect(await (await POST(req(), params())).json()).toEqual({ error: 'Idea not found' });
  });
});

describe('P10 — the autosave-then-abort ordering is unchanged', () => {
  it('writes no partial maia_reflection when the model fails', async () => {
    mockCreate.mockRejectedValue(new Error('boom'));
    await POST(req(), params());
    const inserts = mockQuery.mock.calls.filter(
      (c) => String(c[0]).includes('INSERT INTO member_idea_blocks'));
    expect(inserts).toHaveLength(0);
  });

  it('does not touch the idea when the reflection never persisted', async () => {
    mockCreate.mockRejectedValue(new Error('boom'));
    await POST(req(), params());
    const touches = mockQuery.mock.calls.filter(
      (c) => String(c[0]).includes('UPDATE member_ideas'));
    expect(touches).toHaveLength(0);
  });
});

// ═══════════════════════════════════════════════════════════════
// P9 / P17 · sanitization, asserted over the serialized record
// ═══════════════════════════════════════════════════════════════

describe('P9 — no record contains member text, prompt, output, or a secret', () => {
  const forbidden = [MEMBER_TEXT, IDEA_TITLE, IDEA_FRAMING, MODEL_OUTPUT, SECRET];

  it('holds on the success path', async () => {
    await POST(req(), params());
    const serialized = captured.filter((l) => l.startsWith(ATTEMPT_MARKER)).join('\n');
    for (const f of forbidden) expect(serialized).not.toContain(f);
  });

  it('holds on every failure path, including a provider error carrying a message', async () => {
    for (const fail of [
      () => mockCreate.mockRejectedValue(new Error(`upstream said: ${MEMBER_TEXT}`)),
      () => mockCreate.mockResolvedValue({ content: [] }),
      () => mockQuery.mockImplementation((sql) => sql.includes('INSERT')
        ? Promise.reject(new Error(`db said: ${SECRET}`)) : happyQuery(sql)),
    ]) {
      captured = []; fail();
      await POST(req(), params());
      const serialized = captured.filter((l) => l.startsWith(ATTEMPT_MARKER)).join('\n');
      for (const f of forbidden) expect(serialized).not.toContain(f);
      expect(serialized).not.toContain('upstream said');
      expect(serialized).not.toContain('db said');
    }
  });

  it('records prompt size on model_call and nothing of its substance', async () => {
    await POST(req(), params());
    const c = at('model_call').find((r) => r.event === 'completed')!;
    expect(typeof c.prompt_chars).toBe('number');
    expect(c.prompt_chars! > 0).toBe(true);
    const serialized = JSON.stringify(c);
    expect(serialized).not.toContain(IDEA_TITLE);
    expect(serialized).not.toContain(MEMBER_TEXT);
  });

  it('never emits a field outside the §3 record shape', async () => {
    await POST(req(), params());
    const allowed = new Set([
      'attempt_id', 'attempt_id_source', 'request_id', 'member_id', 'idea_id',
      'stage', 'event', 'error_class', 'upstream_status', 'upstream_request_id',
      'upstream_error_type', 'retryable', 'stack_fingerprint', 'source_frames',
      'runtime_revision', 'taxonomy_version', 'duration_ms', 'stance',
      'prompt_chars', 'occurred_at',
    ]);
    for (const r of records()) {
      for (const k of Object.keys(r)) expect(allowed.has(k)).toBe(true);
    }
  });
});

describe('P17 — no serialized Error, body, prompt, raw stack, or absolute path', () => {
  it('records a stack fingerprint and repo-relative frames, never a stack', async () => {
    mockCreate.mockRejectedValue(new Error('boom'));
    await POST(req(), params());
    const f = at('model_call').find((r) => r.event === 'failed')!;
    expect(f.stack_fingerprint).toMatch(/^[0-9a-f]{32}$/);
    for (const frame of f.source_frames ?? []) {
      expect(frame).toMatch(/^[^/\\][^:]*:\d+$/);
      expect(frame.startsWith('/')).toBe(false);
      expect(frame).not.toContain('node_modules');
    }
  });

  it('the fingerprint is stable across occurrences and carries no message', async () => {
    const thrower = () => { throw new Error('first message'); };
    mockCreate.mockImplementation(async () => thrower());
    await POST(req(), params());
    const a = at('model_call').find((r) => r.event === 'failed')!.stack_fingerprint;
    captured = [];
    const thrower2 = () => { throw new Error('a completely different message'); };
    mockCreate.mockImplementation(async () => thrower2());
    await POST(req(), params());
    const b = at('model_call').find((r) => r.event === 'failed')!.stack_fingerprint;
    expect(a).not.toBeNull();
    expect(typeof a).toBe('string');
    expect(a).not.toContain('first message');
    expect(b).not.toContain('completely different');
  });

  it('yields null rather than a partial dump when there is no usable stack', async () => {
    mockCreate.mockRejectedValue({ status: 500 });
    await POST(req(), params());
    const f = at('model_call').find((r) => r.event === 'failed')!;
    expect(f.stack_fingerprint).toBeNull();
    expect(f.source_frames).toBeNull();
  });
});

// ═══════════════════════════════════════════════════════════════
// P14 · instrument failure changes nothing
// ═══════════════════════════════════════════════════════════════

describe('P14 — a telemetry path that throws leaves the member outcome unchanged', () => {
  it('a throwing sink does not change status or body', async () => {
    console.log = () => { throw new Error('log transport down'); };
    const res = await POST(req(), params());
    console.log = (...a: unknown[]) => { captured.push(a.map(String).join(' ')); };
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual(BASELINE_BODY);
  });

  it('a disabled instrument leaves status, body and side effects identical', async () => {
    process.env.IDEAS_ATTEMPT_LOG_DISABLED = '1';
    const res = await POST(req(), params());
    delete process.env.IDEAS_ATTEMPT_LOG_DISABLED;
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual(BASELINE_BODY);
    expect(records()).toHaveLength(0);
    expect(mockQuery.mock.calls.some(
      (c) => String(c[0]).includes('INSERT INTO member_idea_blocks'))).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════
// P16 · runtime provenance on every event
// ═══════════════════════════════════════════════════════════════

describe('P16 — every event carries a complete runtime_revision and taxonomy_version', () => {
  it('stamps the composite and the taxonomy version on every record', async () => {
    await POST(req(), params());
    for (const r of records()) {
      expect(r.taxonomy_version).toBe(TAXONOMY_VERSION);
      expect(Object.keys(r.runtime_revision).sort()).toEqual([
        'build_digest', 'digest_alg', 'digest_scope', 'digest_subject',
        'git_commit', 'source_digest', 'source_state',
      ]);
    }
  });

  it('reports an unstamped runtime as unknown rather than fabricating one', async () => {
    delete process.env.GIT_COMMIT;
    await POST(req(), params());
    expect(records().every((r) => r.runtime_revision.git_commit === 'unknown')).toBe(true);
    process.env.GIT_COMMIT = 'deadbee';
  });

  it('reports source_state as unknown when it was never established', async () => {
    await POST(req(), params());
    expect(records().every((r) => r.runtime_revision.source_state === 'unknown')).toBe(true);
  });
});
