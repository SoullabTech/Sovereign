/**
 * WS2-ENCOUNTER-01 · G10 — the behavioral half.
 *
 * Founder review 2026-09-08: the structural G10 checks (no default generator,
 * the route names `structuredGenerator()`, the generator takes the captured
 * text) are useful, but they inspect SOURCE. The required control is stronger
 * and behavioral:
 *
 *   a handler-level Encounter whose structured cognition refuses must return
 *   HTTP 503 `cognition_unavailable`, never HTTP 200 `notices: []`.
 *
 * So this suite mocks ONLY the structured seam and the database, and leaves the
 * whole path intact underneath the route:
 *
 *   POST → structuredGenerator → encounter → capture → traverse → cognition
 *
 * If the route ever stopped crossing cognition, or a silent default returned,
 * these would pass a 200 with an empty list — which is the exact substitution
 * C7 forbids, and the exact defect B1 repaired.
 */
import { NextRequest } from 'next/server';

const mockMember = jest.fn<Promise<string | null>, []>();
jest.mock('@/lib/auth/getMemberFromRequest', () => ({
  getMemberIdFromRequest: () => mockMember(),
}));

const mockRun = jest.fn();
jest.mock('@/lib/ai/structured/router', () => ({ runStructured: (...a: unknown[]) => mockRun(...a) }));

const mockQuery = jest.fn();
jest.mock('@/lib/db/postgres', () => ({ query: (...a: unknown[]) => mockQuery(...a) }));

import { POST } from '../route';
import { RESULT_TOOL_NAME } from '@/lib/manuscript/encounter/render';

const DRAFT = 'The house stood at the edge of the water. Every threshold in the book is wet.';
const req = (body?: string) =>
  new NextRequest('http://localhost/api/sovereign/manuscripts/m-1/encounter', {
    method: 'POST',
    ...(body === undefined ? {} : { body }),
  });
const ctx = { params: Promise.resolve({ id: 'm-1' }) };

const seamOk = (input: unknown) => ({
  ok: true,
  result: {
    content: [{ type: 'tool_use', id: 't', name: RESULT_TOOL_NAME, input }],
    stopReason: 'tool_use',
    usage: { inputTokens: 1, outputTokens: 1 },
    provenance: { provider: 'anthropic', model: 'pinned', latencyMs: 5 },
  },
});

beforeEach(() => {
  mockMember.mockReset().mockResolvedValue('mem-1');
  mockRun.mockReset();
  mockQuery.mockReset().mockResolvedValue({ rows: [{ id: 'd', content: DRAFT, version: '2' }] });
});

describe('G10 · the member gesture actually crosses cognition', () => {
  it('the route reaches the structured seam — cognition is not skipped', async () => {
    mockRun.mockResolvedValue(seamOk({ outcome: 'none' }));
    const res = await POST(req(), ctx);
    expect(res.status).toBe(200);
    /* The proof that B1 holds end to end: a real inference call was attempted. */
    expect(mockRun).toHaveBeenCalledTimes(1);
  });

  it('⛔ structured cognition refusal → HTTP 503 cognition_unavailable, NEVER 200 notices: []', async () => {
    mockRun.mockResolvedValue({ ok: false, refusal: 'provider_unavailable', detail: 'down' });
    const res = await POST(req('{}'), ctx);
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ refusal: 'cognition_unavailable' });
  });

  it('⛔ a sovereign-mode refusal is also 503 — sovereignty outranks Encounter availability', async () => {
    mockRun.mockResolvedValue({
      ok: false, refusal: 'structured_inference_unavailable', detail: 'mode=sovereign',
    });
    const res = await POST(req(), ctx);
    expect(res.status).toBe(503);
    expect((await res.json()).refusal).toBe('cognition_unavailable');
  });

  it('⛔ a prose-only answer is 503, not a quiet 200 — contract failure is not silence', async () => {
    mockRun.mockResolvedValue({
      ok: true,
      result: {
        content: [{ type: 'text', text: 'I notice the ending wants resolution.' }],
        stopReason: 'end_turn',
        usage: { inputTokens: 1, outputTokens: 1 },
        provenance: { provider: 'anthropic', model: 'pinned', latencyMs: 5 },
      },
    });
    const res = await POST(req(), ctx);
    expect(res.status).toBe(503);
    expect((await res.json()).refusal).toBe('cognition_unavailable');
  });

  it('declared silence is a 200 with an empty list, and no message', async () => {
    mockRun.mockResolvedValue(seamOk({ outcome: 'none' }));
    const res = await POST(req(), ctx);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.notices).toEqual([]);
    expect(JSON.stringify(body)).not.toMatch(/nothing|no observations|didn.t/i);
  });

  it('a lawful notice reaches the writer, anchored and screened', async () => {
    mockRun.mockResolvedValue(seamOk({
      outcome: 'notices',
      notices: [{
        family: 'recurrence',
        text: 'Water appears at every threshold.',
        spans: [{ startCodePoint: 41, endCodePoint: 76 }],
      }],
    }));
    const res = await POST(req(), ctx);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.notices).toHaveLength(1);
    expect(body.notices[0].authoredBy).toBe('maia');
    expect(body.notices[0].anchors[0].spanDigest).toEqual(expect.any(String));
  });

  it('⛔ and a developmental notice does NOT reach the writer', async () => {
    mockRun.mockResolvedValue(seamOk({
      outcome: 'notices',
      notices: [{
        family: 'openness',
        text: 'The ending is underdeveloped and should be expanded.',
        spans: [{ startCodePoint: 0, endCodePoint: 40 }],
      }],
    }));
    const res = await POST(req(), ctx);
    /* Screened out downstream → silence, not an error, and not a message about
       having withheld something. */
    expect(res.status).toBe(200);
    expect((await res.json()).notices).toEqual([]);
  });
});
