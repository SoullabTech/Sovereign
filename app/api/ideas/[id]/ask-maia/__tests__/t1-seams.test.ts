/**
 * T1 Fault Localization — Ask MAIA route seam tests.
 *
 * Every dependency is mocked, so each test can fail exactly one seam and
 * assert two things at once:
 *
 *   SEAM DISTINCTION   the emitted evidence names the seam that broke, and
 *                      names no other seam as broken.
 *   ZERO MEMBER DIFF   the HTTP status, the response body, and the response
 *                      headers are byte-identical to the pre-instrument
 *                      route on every path — success, refusal, and failure.
 *
 * The zero-diff assertion is the load-bearing one. T1 is authorized only as
 * an observational instrument; the moment it changes what a member receives,
 * it has exceeded its authorization.
 */
import { describe, it, expect, jest, beforeEach, afterAll } from '@jest/globals';
import { NextRequest } from 'next/server';
import { ATTEMPT_ID_HEADER, T1_MARKER } from '@/lib/ideas/faultLocalization';

const MEMBER = '11111111-1111-4111-8111-111111111111';
const IDEA = '22222222-2222-4222-8222-222222222222';
const BLOCK = '33333333-3333-4333-8333-333333333333';
const CREATED_AT = '2026-09-02T00:00:00.000Z';
const REFLECTION = 'You have already named the audience. From that, a first version could start with the onboarding path.';

// ── Mocks ──────────────────────────────────────────────────────────────────

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

const mockGenerate = jest.fn<() => Promise<string>>();
jest.mock('@/lib/team/maiaThreadReflection', () => ({
  generateThreadReflection: () => mockGenerate(),
}));

jest.mock('@/lib/maia/decisionChangeRecognition', () => ({
  runRecognition: () => null,
  getRecentRecognitionEvents: async () => [],
  storeRecognitionEvent: () => undefined,
}));

import { POST } from '../route';

// ── Harness ────────────────────────────────────────────────────────────────

type Event = {
  instrument: string;
  side: string;
  seam: string;
  phase: string;
  request_id: string | null;
  attempt_id: string | null;
  runtime_revision: string;
  detail: Record<string, unknown>;
};

let captured: string[] = [];
const realLog = console.log;
const realError = console.error;

function events(): Event[] {
  return captured
    .filter((l) => l.startsWith(T1_MARKER))
    .map((l) => JSON.parse(l.slice(T1_MARKER.length + 1)) as Event);
}

function failedSeams(): string[] {
  return events().filter((e) => e.phase === 'failed').map((e) => e.seam);
}

function req(headers: Record<string, string> = {}): NextRequest {
  return new NextRequest(`https://soullab.life/api/ideas/${IDEA}/ask-maia`, {
    method: 'POST',
    headers,
  });
}

const params = (id = IDEA) => ({ params: Promise.resolve({ id }) });

/** Default happy-path DB responses, dispatched by SQL shape. */
function happyQuery(sql: string): Promise<{ rows: unknown[] }> {
  if (sql.includes('FROM member_ideas')) {
    return Promise.resolve({ rows: [{ id: IDEA, title: 'A title', framing: 'A framing' }] });
  }
  if (sql.includes('INSERT INTO member_idea_blocks')) {
    return Promise.resolve({
      rows: [
        {
          id: BLOCK,
          block_type: 'maia_reflection',
          content: REFLECTION,
          metadata: { source: 'maia', invoked_from: 'idea_thread' },
          created_at: CREATED_AT,
        },
      ],
    });
  }
  if (sql.includes("block_type IN ('note'")) {
    return Promise.resolve({
      rows: [
        {
          id: 'b1',
          block_type: 'note',
          content: 'Something the member wrote in confidence.',
          metadata: {},
          created_at: CREATED_AT,
        },
      ],
    });
  }
  return Promise.resolve({ rows: [] });
}

beforeEach(() => {
  jest.clearAllMocks();
  captured = [];
  console.log = (...args: unknown[]) => {
    captured.push(args.map(String).join(' '));
  };
  console.error = () => undefined;
  process.env.GIT_COMMIT = 'deadbee';
  mockGetCurrentSession.mockResolvedValue({ memberId: MEMBER });
  mockQuery.mockImplementation((sql) => happyQuery(sql));
  mockGenerate.mockResolvedValue(REFLECTION);
});

afterAll(() => {
  console.log = realLog;
  console.error = realError;
});

/**
 * The exact response shape the route produced before T1 was wired in.
 * Any divergence here is a member-facing diff.
 */
const BASELINE_SUCCESS_BODY = {
  success: true,
  block: {
    id: BLOCK,
    block_type: 'maia_reflection',
    content: REFLECTION,
    metadata: { source: 'maia', invoked_from: 'idea_thread' },
    created_at: CREATED_AT,
  },
};

// ═══════════════════════════════════════════════════════════════
// Zero member-facing diff
// ═══════════════════════════════════════════════════════════════

describe('zero member-facing diff', () => {
  it('returns the unchanged success body and status', async () => {
    const res = await POST(req(), params());
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual(BASELINE_SUCCESS_BODY);
  });

  it('adds no response header — no request_id, no attempt_id, nothing', async () => {
    const res = await POST(req({ [ATTEMPT_ID_HEADER]: 'att-0123456789ab' }), params());
    const names = [...res.headers.keys()].map((n) => n.toLowerCase());
    expect(names.filter((n) => n.includes('request') || n.includes('attempt') || n.includes('ideas') || n.includes('t1'))).toEqual([]);
    expect(JSON.stringify(await res.json())).not.toContain('att-0123456789ab');
  });

  it('returns identical bytes with and without a client attempt_id', async () => {
    const without = await (await POST(req(), params())).text();
    const with_ = await (
      await POST(req({ [ATTEMPT_ID_HEADER]: 'att-0123456789ab' }), params())
    ).text();
    expect(with_).toBe(without);
  });

  it('preserves the unauthorized refusal exactly', async () => {
    mockGetCurrentSession.mockResolvedValue(null);
    const res = await POST(req(), params());
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: 'Unauthorized' });
  });

  it('preserves the invalid-id refusal exactly', async () => {
    const res = await POST(req(), params('not-a-uuid'));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'Invalid idea id' });
  });

  it('preserves the not-found refusal exactly', async () => {
    mockQuery.mockImplementation((sql) =>
      sql.includes('FROM member_ideas') && !sql.includes('UPDATE')
        ? Promise.resolve({ rows: [] })
        : happyQuery(sql)
    );
    const res = await POST(req(), params());
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: 'Idea not found' });
  });

  it('preserves the generic 500 — the instrument never leaks a cause to the member', async () => {
    mockGenerate.mockRejectedValue(new Error('anthropic 529 overloaded'));
    const res = await POST(req(), params());
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'Failed to generate reflection' });
  });

  it('behaves identically when the instrument is disabled', async () => {
    process.env.IDEAS_T1_DISABLED = '1';
    try {
      const res = await POST(req(), params());
      expect(res.status).toBe(201);
      expect(await res.json()).toEqual(BASELINE_SUCCESS_BODY);
      expect(events()).toHaveLength(0);
    } finally {
      delete process.env.IDEAS_T1_DISABLED;
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// Seam distinction — the point of the instrument
// ═══════════════════════════════════════════════════════════════

describe('seam distinction', () => {
  it('localizes an auth refusal to server.auth and nothing else', async () => {
    mockGetCurrentSession.mockResolvedValue(null);
    await POST(req(), params());
    expect(failedSeams()).toEqual(['server.auth']);
  });

  it('localizes a thrown session lookup to server.auth, not to a later seam', async () => {
    mockGetCurrentSession.mockRejectedValue(new Error('auth_sessions unreachable'));
    const res = await POST(req(), params());
    expect(res.status).toBe(500);
    expect(failedSeams()).toEqual(['server.auth']);
  });

  it('localizes a bad idea id to server.validate', async () => {
    await POST(req(), params('not-a-uuid'));
    expect(failedSeams()).toEqual(['server.validate']);
    expect(events().some((e) => e.seam === 'server.idea_fetch')).toBe(false);
  });

  it('localizes a missing idea to server.idea_fetch', async () => {
    mockQuery.mockImplementation((sql) =>
      sql.includes('FROM member_ideas') && !sql.includes('UPDATE')
        ? Promise.resolve({ rows: [] })
        : happyQuery(sql)
    );
    await POST(req(), params());
    expect(failedSeams()).toEqual(['server.idea_fetch']);
  });

  it('distinguishes a context-assembly read failure from an idea fetch failure', async () => {
    mockQuery.mockImplementation((sql) => {
      if (sql.includes("block_type IN ('note'")) {
        return Promise.reject(new Error('member_idea_blocks read failed'));
      }
      return happyQuery(sql);
    });
    const res = await POST(req(), params());
    expect(res.status).toBe(500);
    expect(failedSeams()).toEqual(['server.context_assemble']);
  });

  it('distinguishes a model failure from a persistence failure', async () => {
    mockGenerate.mockRejectedValue(new Error('anthropic timeout'));
    await POST(req(), params());
    expect(failedSeams()).toEqual(['server.model_call']);
  });

  it('distinguishes a persistence failure from a model failure', async () => {
    mockQuery.mockImplementation((sql) =>
      sql.includes('INSERT INTO member_idea_blocks')
        ? Promise.reject(new Error('insert rejected'))
        : happyQuery(sql)
    );
    await POST(req(), params());
    expect(failedSeams()).toEqual(['server.persist']);
    // The reflection was generated. Without seam distinction these two
    // failures are the same opaque 500.
    expect(events().some((e) => e.seam === 'server.model_call' && e.phase === 'completed')).toBe(true);
  });

  it('distinguishes the post-write touch failure — the member got a reflection, the ordering did not update', async () => {
    mockQuery.mockImplementation((sql) =>
      sql.includes('UPDATE member_ideas')
        ? Promise.reject(new Error('touch failed'))
        : happyQuery(sql)
    );
    await POST(req(), params());
    expect(failedSeams()).toEqual(['server.touch']);
    expect(events().some((e) => e.seam === 'server.persist' && e.phase === 'completed')).toBe(true);
  });

  it('brackets every reached seam with entered before completed', async () => {
    await POST(req(), params());
    const byOrder = events().map((e) => `${e.seam}:${e.phase}`);
    for (const seam of ['server.auth', 'server.validate', 'server.idea_fetch', 'server.context_assemble', 'server.model_call', 'server.persist', 'server.touch']) {
      expect(byOrder.indexOf(`${seam}:entered`)).toBeGreaterThanOrEqual(0);
      expect(byOrder.indexOf(`${seam}:completed`)).toBeGreaterThan(byOrder.indexOf(`${seam}:entered`));
    }
  });

  it('emits no failed event on the happy path', async () => {
    await POST(req(), params());
    expect(failedSeams()).toEqual([]);
  });
});

// ═══════════════════════════════════════════════════════════════
// Authority separation, observed at the route
// ═══════════════════════════════════════════════════════════════

describe('authority separation at the route', () => {
  it('mints a request_id the client never supplied, on every event', async () => {
    await POST(req({ 'x-request-id': 'req-forged', [ATTEMPT_ID_HEADER]: 'att-0123456789ab' }), params());
    const ids = new Set(events().map((e) => e.request_id));
    expect(ids.size).toBe(1);
    const [only] = [...ids];
    expect(only).toMatch(/^req-/);
    expect(only).not.toBe('req-forged');
  });

  it('uses one request_id for the whole request', async () => {
    await POST(req(), params());
    const evs = events();
    expect(evs.length).toBeGreaterThan(1);
    expect(new Set(evs.map((e) => e.request_id)).size).toBe(1);
  });

  it('carries the client attempt_id as the join key without promoting it', async () => {
    await POST(req({ [ATTEMPT_ID_HEADER]: 'att-0123456789ab' }), params());
    for (const e of events()) {
      expect(e.attempt_id).toBe('att-0123456789ab');
      expect(e.request_id).not.toBe('att-0123456789ab');
    }
  });

  it('refuses a malformed attempt_id and records the refusal', async () => {
    await POST(req({ [ATTEMPT_ID_HEADER]: 'bad id; DROP TABLE member_ideas' }), params());
    const first = events()[0];
    expect(first.seam).toBe('server.auth');
    expect(first.phase).toBe('entered');
    expect(first.detail.attempt_id_rejected).toBe(true);
    expect(events().every((e) => e.attempt_id === null)).toBe(true);
  });

  it('distinguishes a rejected attempt_id from an absent one', async () => {
    await POST(req(), params());
    expect(events()[0].detail.attempt_id_rejected).toBe(false);
  });

  it('marks server events as server-side', async () => {
    await POST(req(), params());
    expect(events().every((e) => e.side === 'server')).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════
// Sanitization, observed on real traffic
// ═══════════════════════════════════════════════════════════════

describe('sanitization on the live path', () => {
  it('never writes member block content, idea title, framing, or the reflection into the log', async () => {
    await POST(req(), params());
    const all = captured.filter((l) => l.startsWith(T1_MARKER)).join('\n');
    expect(all).not.toContain('Something the member wrote in confidence.');
    expect(all).not.toContain('A title');
    expect(all).not.toContain('A framing');
    expect(all).not.toContain(REFLECTION);
  });

  it('records the reflection length but not the reflection', async () => {
    await POST(req(), params());
    const modelCall = events().find((e) => e.seam === 'server.model_call' && e.phase === 'completed');
    expect(modelCall?.detail.reflection_len).toBe(REFLECTION.length);
  });

  it('records context shape as counts and presence flags only', async () => {
    await POST(req(), params());
    const assemble = events().find(
      (e) => e.seam === 'server.context_assemble' && e.phase === 'completed'
    );
    expect(assemble?.detail).toMatchObject({
      block_count: 1,
      prior_reflection_count: 0,
      last_decision_present: false,
      framing_present: true,
    });
    for (const value of Object.values(assemble!.detail)) {
      expect(['number', 'boolean']).toContain(typeof value);
    }
  });

  it('never writes the member id or idea id into the log', async () => {
    await POST(req(), params());
    const all = captured.filter((l) => l.startsWith(T1_MARKER)).join('\n');
    expect(all).not.toContain(MEMBER);
    expect(all).not.toContain(IDEA);
  });

  it('stamps every event with the runtime revision', async () => {
    await POST(req(), params());
    expect(events().every((e) => e.runtime_revision === 'deadbee')).toBe(true);
  });

  it('reports an unstamped runtime as unknown rather than fabricating one', async () => {
    delete process.env.GIT_COMMIT;
    await POST(req(), params());
    expect(events().every((e) => e.runtime_revision === 'unknown')).toBe(true);
  });
});
