/** @jest-environment node */
/**
 * JARVIS-WRITERS-STUDIO-INSPIRATION-OPENING-01 · S1 falsifiers F7, F8, F10.
 * The opening reflection: pilot-gated, member-scoped, answered by the same MAIA, and never kept (founder Q1).
 */
import fs from 'fs';
import path from 'path';
import { NextRequest } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { writersStudioBetaAccess } from '@/lib/writersStudio/betaAccessServer';
import { askMaia } from '@/lib/manuscript/ask/askReader';
import { POST } from '../route';

jest.mock('@/lib/auth/getMemberFromRequest', () => ({ getMemberIdFromRequest: jest.fn() }));
jest.mock('@/lib/writersStudio/betaAccessServer', () => ({ writersStudioBetaAccess: jest.fn() }));
jest.mock('@/lib/manuscript/ask/askReader', () => ({ askMaia: jest.fn() }));

const auth = getMemberIdFromRequest as jest.Mock;
const access = writersStudioBetaAccess as jest.Mock;
const ask = askMaia as jest.Mock;
const ME = '11111111-1111-4111-8111-111111111111';
const URL_BASE = 'http://localhost/api/sovereign/writers-studio/arrival';
const post = (body: unknown) => new NextRequest(URL_BASE, {
  method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' },
} as never);

beforeEach(() => {
  jest.clearAllMocks();
  auth.mockResolvedValue(ME);
  access.mockResolvedValue({ eligible: true, basis: 'active_beta_tester' });
  ask.mockResolvedValue({
    ok: true, answer: 'I hear a garden. Am I hearing that right?', seen: 'x', seenForQuotes: 'x',
    provenance: { provider: 'anthropic', model: 'm', promptHash: 'h', askerVersion: 'v', answeredAt: 't' },
  });
});

describe('F10 · pilot-gated and member-scoped', () => {
  it('refuses an anonymous request without asking MAIA', async () => {
    auth.mockResolvedValue(null);
    expect((await POST(post({ answer: 'a garden' }))).status).toBe(401);
    expect(ask).not.toHaveBeenCalled();
  });
  it('refuses a member outside the Writer’s Studio pilot without asking MAIA', async () => {
    access.mockResolvedValue({ eligible: false, basis: 'not_in_pilot' });
    expect((await POST(post({ answer: 'a garden' }))).status).toBe(403);
    expect(ask).not.toHaveBeenCalled();
  });
});

describe('F8 · the same MAIA answers', () => {
  it('asks askMaia with the opt-in arrival context, the writer’s words as the question, and returns her reply', async () => {
    const res = await POST(post({ answer: 'a garden', sanctuary: true }));
    expect(res.status).toBe(200);
    expect(ask).toHaveBeenCalledTimes(1);
    const [ctx, history, question] = ask.mock.calls[0];
    expect(ctx).toEqual({ kind: 'arrival', sanctuary: true });
    expect(history).toEqual([]);
    expect(question).toBe('a garden');
    const body = await res.json();
    expect(body.reply).toBe('I hear a garden. Am I hearing that right?');
    expect(res.headers.get('cache-control')).toContain('no-store');
  });
  it('carries a short in-page history for "Keep talking", and refuses a malformed one', async () => {
    const history = [{ speaker: 'author', body: 'a garden' }, { speaker: 'maia', body: 'I hear a garden.' }];
    expect((await POST(post({ answer: 'and my grandmother', history }))).status).toBe(200);
    expect(ask.mock.calls[0][1]).toEqual(history);
    expect((await POST(post({ answer: 'x', history: [{ speaker: 'system', body: 'x' }] }))).status).toBe(400);
    expect((await POST(post({ answer: 'x', history: Array.from({ length: 21 }, () => ({ speaker: 'author', body: 'x' })) }))).status).toBe(400);
  });
  it('refuses unknown fields, empty answers and over-long answers', async () => {
    expect((await POST(post({ answer: 'x', workId: 'w' }))).status).toBe(400);
    expect((await POST(post({ answer: '   ' }))).status).toBe(400);
    expect((await POST(post({ answer: 'a'.repeat(2001) }))).status).toBe(413);
    expect(ask).not.toHaveBeenCalled();
  });
  it('reports an unfinished or failed answer as a failure, never as her words', async () => {
    ask.mockResolvedValue({ ok: false, refusal: 'unreachable' });
    const res = await POST(post({ answer: 'a garden' }));
    expect(res.status).toBe(502);
    expect((await res.json()).reply).toBeUndefined();
  });
});

describe('F7 · the opening conversation is never kept (founder Q1)', () => {
  it('the route cannot write: it imports no database, store, thread, or keep module', () => {
    const src = fs.readFileSync(path.join(__dirname, '..', 'route.ts'), 'utf8');
    const imports = [...src.matchAll(/from\s+'([^']+)'/g)].map((m) => m[1]);
    expect(imports.sort()).toEqual([
      '@/lib/auth/getMemberFromRequest',
      '@/lib/manuscript/ask/askReader',
      '@/lib/writersStudio/betaAccessServer',
      'next/server',
    ]);
    expect(src).not.toMatch(/\bquery\s*\(|INSERT|UPDATE|console\.(log|info)\([^)]*answer/);
  });
});
