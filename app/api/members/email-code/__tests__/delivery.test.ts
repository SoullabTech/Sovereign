/**
 * EMAIL-CODE — delivery consequences, enumeration, and retry advice.
 *
 * The route's own gate suite (./route.test.ts) proves WHICH addresses reach the
 * send. This file proves what happens AT the send and after it:
 *
 *   1. A refused code is invalidated, not left live as a credential nobody has.
 *   2. What the member is told is governed by `retryable`, not by tone.
 *   3. A known and an unknown address are indistinguishable from the outside.
 *   4. Our internal failure taxonomy never leaks to the member.
 *
 * Every refusal is modelled as Resend's RESOLVED `{ data: null, error }` — the
 * shape that resolves rather than throws, and the reason this bug class
 * survived a green test suite.
 */
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

type QueryResult = { rows: Record<string, unknown>[]; rowCount?: number };
const mockQuery = jest.fn<(sql: string, params?: unknown[]) => Promise<QueryResult>>();
jest.mock('@/lib/db/postgres', () => ({
  query: (sql: string, params?: unknown[]) => mockQuery(sql, params),
}));

// Mocked at the provider boundary, so the real `{ data, error }` handling in
// lib/email/sendEmail stays under test rather than being stubbed out.
type ResendResult = { data: { id: string } | null; error: { name: string; message: string } | null };
const mockSend = jest.fn<(...args: unknown[]) => Promise<ResendResult>>();
jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: { send: (...args: unknown[]) => mockSend(...args) },
  })),
}));

jest.mock('@/lib/auth/rateLimiter', () => ({
  checkRateLimit: jest.fn(async () => ({ allowed: true })),
  getClientIP: jest.fn(() => '127.0.0.1'),
  buildRateLimitHeaders: jest.fn(() => ({})),
}));
jest.mock('@/lib/onboarding/telemetry', () => ({ trackOnboarding: jest.fn() }));

process.env.RESEND_API_KEY = 'test-key';

import { POST } from '../route';
import { NextRequest } from 'next/server';

const CODE_ROW_ID = 'code-row-1';
const EXISTING = { id: 'member-uuid-1', name: 'Nathan' };

function installDb({ member = null }: { member?: Record<string, unknown> | null } = {}) {
  mockQuery.mockImplementation(async (sql: string) => {
    if (/from\s+members\s+where\s+lower\(email\)/i.test(sql)) return { rows: member ? [member] : [] };
    if (/insert\s+into\s+magic_link_tokens/i.test(sql)) return { rows: [{ id: CODE_ROW_ID }] };
    return { rows: [] };
  });
}

const req = (email: string) =>
  new NextRequest('http://localhost/api/members/email-code', {
    method: 'POST',
    body: JSON.stringify({ email }),
    headers: { 'Content-Type': 'application/json' },
  });

const refuse = (name: string, message: string) =>
  mockSend.mockResolvedValue({ data: null, error: { name, message } });

/** Was the just-issued code invalidated because nobody received it? */
const codeInvalidated = () =>
  mockQuery.mock.calls.some(
    ([sql, params]) =>
      /update\s+magic_link_tokens\s+set\s+used\s*=\s*true\s+where\s+id\s*=\s*\$1/i.test(String(sql)) &&
      Array.isArray(params) && params[0] === CODE_ROW_ID
  );

/** Was the row DELETED? It must not be — it is the record that someone tried. */
const codeDeleted = () =>
  mockQuery.mock.calls.some(([sql]) => /delete\s+from\s+magic_link_tokens/i.test(String(sql)));

beforeEach(() => {
  mockQuery.mockReset();
  mockSend.mockReset();
  mockSend.mockResolvedValue({ data: { id: 'msg_abc123' }, error: null });
  installDb();
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

describe('a code nobody received is not left as a usable credential', () => {
  it('invalidates the code when the provider refuses', async () => {
    refuse('monthly_quota_exceeded', 'You have reached your monthly email sending quota.');
    await POST(req('someone@example.com'));
    expect(codeInvalidated()).toBe(true);
  });

  it('invalidates rather than DELETES — the attempt stays on the record', async () => {
    // The row is how the 2026-08-24 incident was reconstructed at all. Marking
    // it used satisfies both: no live credential, no lost evidence.
    refuse('monthly_quota_exceeded', 'Monthly quota reached.');
    await POST(req('someone@example.com'));
    expect(codeDeleted()).toBe(false);
  });

  it('CONTROL: a delivered code is left live', async () => {
    await POST(req('someone@example.com'));
    expect(codeInvalidated()).toBe(false);
  });
});

describe('retry advice — governed by `retryable`, not by tone', () => {
  it('a quota refusal does not tell the person to try again', async () => {
    refuse('monthly_quota_exceeded', 'You have reached your monthly email sending quota.');
    const res = await POST(req('someone@example.com'));
    const body = await res.json();

    expect(res.status).toBe(502);
    expect(body.success).toBeFalsy();
    expect(body.retryable).toBe(false);
    expect(body.error).not.toMatch(/try again/i);
    expect(body.error).toMatch(/hello@soullab\.life/);
  });

  it('an unverified sender is ours and is not retryable', async () => {
    refuse('validation_error', 'The from address is not verified.');
    const res = await POST(req('someone@example.com'));
    const body = await res.json();

    expect(res.status).toBe(502);
    expect(body.reason).toBe('email_provider_refused');
    expect(body.retryable).toBe(false);
    // It must not tell them to check an address that is perfectly fine.
    expect(body.error).not.toMatch(/check it/i);
  });

  it('CONTROL: a genuine throttle DOES advise a retry', async () => {
    refuse('rate_limit_exceeded', 'Too many requests.');
    const res = await POST(req('someone@example.com'));
    const body = await res.json();

    expect(body.retryable).toBe(true);
    expect(body.error).toMatch(/try again in a few minutes/i);
  });

  it('a refusal naming the recipient is a 400 about the address', async () => {
    refuse('validation_error', 'Invalid `to` field.');
    const res = await POST(req('someone@example.com'));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.reason).toBe('email_address_rejected');
    expect(body.error).toMatch(/check it/i);
  });

  it('a THROWN transport fault is still a failure, and is retryable', async () => {
    mockSend.mockRejectedValue(new Error('socket hang up'));
    const res = await POST(req('someone@example.com'));
    const body = await res.json();

    expect(res.status).toBe(502);
    expect(body.retryable).toBe(true);
  });

  it('our internal failure taxonomy never reaches the member', async () => {
    refuse('monthly_quota_exceeded', 'You have reached your monthly email sending quota.');
    const res = await POST(req('someone@example.com'));
    const body = await res.json();
    const serialized = JSON.stringify(body);

    // `reason` is the stable field for the UI; the provider's wording and our
    // failureKind are for logs and telemetry only.
    expect(serialized).not.toMatch(/quota_exceeded|monthly_quota|failureKind|providerCode|resend/i);
    expect(body.reason).toBe('email_provider_refused');
  });
});

describe('no account enumeration', () => {
  it('never returns isExistingMember — an unproved caller learns nothing', async () => {
    installDb({ member: EXISTING });
    const res = await POST(req('nathan@example.com'));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).not.toHaveProperty('isExistingMember');
  });

  it('a known and an unknown address get identical responses', async () => {
    installDb({ member: EXISTING });
    const known = await POST(req('nathan@example.com'));
    const knownBody = await known.json();

    installDb({ member: null });
    const unknown = await POST(req('nobody@example.com'));
    const unknownBody = await unknown.json();

    expect(known.status).toBe(unknown.status);
    expect(knownBody).toEqual(unknownBody);
  });
});

describe('email lookup is case-insensitive', () => {
  // Regression guard migrated from __tests__/email-normalization.test.ts, which
  // asserted it through the leaked `isExistingMember` field. The field is gone;
  // the guard is not. A leak is not a test fixture. A case-sensitive lookup
  // would misclassify a member stored as `Nathan.Kane@thermofisher.com` as a
  // brand-new person and route them to /begin instead of /maia.
  beforeEach(() => installDb({ member: EXISTING }));

  it('looks members up by LOWER(email) with a lowercased parameter', async () => {
    await POST(req('Nathan.Kane@ThermoFisher.com'));
    const lookup = mockQuery.mock.calls.find(([sql]) =>
      /from\s+members\s+where\s+lower\(email\)/i.test(String(sql))
    );
    expect(lookup).toBeDefined();
    expect(lookup?.[1]).toEqual(['nathan.kane@thermofisher.com']);
  });

  it('links the issued code to the member found under a different case', async () => {
    await POST(req('Nathan.Kane@ThermoFisher.com'));
    const insert = mockQuery.mock.calls.find(([sql]) =>
      /insert\s+into\s+magic_link_tokens/i.test(String(sql))
    );
    // params: [email, memberId, token, code, expiresAt]
    expect(insert?.[1]?.[1]).toBe(EXISTING.id);
  });
});
