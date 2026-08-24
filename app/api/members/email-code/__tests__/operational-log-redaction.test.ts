/**
 * OPERATIONAL LOG REDACTION — the email-code send path.
 *
 * THE DEFECT. The REFUSAL path in this route was redacted (it logs
 * `memberRef(memberId)`), while the SUCCESS path — the path almost every send
 * actually takes — interpolated the member's real email address into container
 * stdout. `docker logs` makes that readable to anyone with host access. A
 * redacted failure log beside a raw success log is not a privacy boundary; it
 * is a privacy boundary that only holds when things go wrong.
 *
 * WHY THIS TEST EXISTS NOW. The next step in this lane is a POSITIVE
 * production witness: send a real code to a real address and watch it arrive.
 * Running that witness before this redaction would knowingly write a real
 * member's address into production stdout in order to produce evidence. So the
 * redaction lands first.
 *
 * THE INVARIANT. No member-supplied address reaches container stdout on any
 * path through this route. What may be emitted is `memberRef()` — pseudonymous
 * and correlatable, NOT anonymous (lib/privacy/memberRef.ts) — or nothing at
 * all when correlation is not needed. The provider's message id is KEPT: it is
 * provider-issued, not member-derived, and it is the only way to tell "accepted
 * with an id" apart from "accepted and returned nothing".
 *
 * FALSIFICATION. Restore `${normalizedEmail}` to either console.log in
 * ../route.ts and the matching case here fails.
 */
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

type QueryResult = { rows: Record<string, unknown>[]; rowCount?: number };
const mockQuery = jest.fn<(sql: string, params?: unknown[]) => Promise<QueryResult>>();
jest.mock('@/lib/db/postgres', () => ({
  query: (sql: string, params?: unknown[]) => mockQuery(sql, params),
}));

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
// Telemetry writes to the `onboarding_events` TABLE, not to stdout. An
// identified record in a table is a different disclosure surface from an
// identified line in `docker logs`, and is deliberately out of scope here.
jest.mock('@/lib/onboarding/telemetry', () => ({ trackOnboarding: jest.fn() }));

process.env.RESEND_API_KEY = 'test-key';

import { POST } from '../route';
import { NextRequest } from 'next/server';
import { memberRef } from '@/lib/privacy/memberRef';

const EMAIL = 'a.real.person@example.com';
const LOCAL_PART = 'a.real.person';
const MEMBER_ID = 'member-uuid-1';
const MESSAGE_ID = 'msg_abc123';

const logs: string[] = [];

/** Everything this route wrote to stdout/stderr during the request, joined. */
const emitted = () => logs.join('\n');

function installDb({ member = null, admitted = true }: { member?: Record<string, unknown> | null; admitted?: boolean } = {}) {
  mockQuery.mockImplementation(async (sql: string) => {
    if (/from\s+members\s+where\s+lower\(email\)/i.test(sql)) return { rows: member ? [member] : [] };
    if (/beta_allowlist/i.test(sql)) return { rows: admitted ? [{ email: EMAIL }] : [] };
    if (/insert\s+into\s+magic_link_tokens/i.test(sql)) return { rows: [{ id: 'code-row-1' }] };
    return { rows: [] };
  });
}

const req = () =>
  new NextRequest('http://localhost/api/members/email-code', {
    method: 'POST',
    body: JSON.stringify({ email: EMAIL }),
    headers: { 'Content-Type': 'application/json' },
  });

beforeEach(() => {
  logs.length = 0;
  mockQuery.mockReset();
  mockSend.mockReset();
  mockSend.mockResolvedValue({ data: { id: MESSAGE_ID }, error: null });
  installDb();
  // Objects are SERIALISED, not `String()`-ed. A `console.log('...', obj)`
  // stringifies to `[object Object]` under String(), which would hide a raw
  // address logged as an object field — which is precisely how the transport
  // layer (lib/email/sendEmail.ts logSend) was leaking it.
  const capture = (...args: unknown[]) => {
    logs.push(args.map((a) => (typeof a === 'string' ? a : JSON.stringify(a))).join(' '));
  };
  jest.spyOn(console, 'log').mockImplementation(capture);
  jest.spyOn(console, 'error').mockImplementation(capture);
  jest.spyOn(console, 'warn').mockImplementation(capture);
});

describe('no member address reaches container stdout', () => {
  it('does not log the address on the SUCCESS path', async () => {
    installDb({ member: { id: MEMBER_ID, name: 'Nathan' } });
    const res = await POST(req());

    expect(res.status).toBe(200);
    expect(emitted()).not.toContain(EMAIL);
    expect(emitted()).not.toContain(LOCAL_PART);
  });

  it('does not log the address on the REFUSAL path', async () => {
    installDb({ member: { id: MEMBER_ID, name: 'Nathan' } });
    mockSend.mockResolvedValue({
      data: null,
      error: { name: 'monthly_quota_exceeded', message: 'You have reached your monthly email sending quota.' },
    });

    await POST(req());

    expect(emitted()).not.toContain(EMAIL);
    expect(emitted()).not.toContain(LOCAL_PART);
  });

  // The waitlist branch is env-gated (BETA_ALLOWLIST_ENABLED=1) and OFF by
  // default. Without the flag this test ran straight down the SUCCESS path and
  // asserted nothing about the waitlist log — it passed while the raw address
  // was still there. Caught by falsification: reverting the waitlist line alone
  // did not turn it red. The response assertion below is what keeps it honest.
  it('does not log the address on the WAITLIST path', async () => {
    const prev = process.env.BETA_ALLOWLIST_ENABLED;
    process.env.BETA_ALLOWLIST_ENABLED = '1';
    try {
      installDb({ admitted: false });

      const res = await POST(req());

      // Proves the waitlist branch was actually taken, not the send path.
      expect(await res.json()).toEqual({ status: 'waitlist' });
      expect(emitted()).toContain('Not admitted');
      expect(emitted()).not.toContain(EMAIL);
      expect(emitted()).not.toContain(LOCAL_PART);
    } finally {
      if (prev === undefined) delete process.env.BETA_ALLOWLIST_ENABLED;
      else process.env.BETA_ALLOWLIST_ENABLED = prev;
    }
  });
});

describe('what the success log keeps', () => {
  it('keeps the provider message id, so an id-less acceptance stays visible', async () => {
    installDb({ member: { id: MEMBER_ID, name: 'Nathan' } });

    await POST(req());

    expect(emitted()).toContain(MESSAGE_ID);
  });

  // Written expecting the success log to render `id: none`. It does not, and
  // the reason is better than the expectation: lib/email/sendEmail already
  // classifies "accepted, no message id" as a FAILURE, so it never reaches the
  // success path at all. Recorded as the real behaviour rather than deleted —
  // it is the fact the positive witness depends on.
  it('never reports success for an acceptance that returned no message id', async () => {
    installDb({ member: { id: MEMBER_ID, name: 'Nathan' } });
    mockSend.mockResolvedValue({ data: null as unknown as { id: string }, error: null });

    const res = await POST(req());

    expect(res.status).toBe(502);
    expect(emitted()).toContain('Provider REFUSED the send');
    expect(emitted()).not.toContain('Code sent');
  });

  it('emits the same correlatable member token the refusal path emits', async () => {
    installDb({ member: { id: MEMBER_ID, name: 'Nathan' } });

    await POST(req());

    // Pseudonymous and correlatable — NOT anonymous. Asserted so the token is
    // a stable derivation, not a truncated slice of the raw id.
    expect(emitted()).toContain(memberRef(MEMBER_ID));
    expect(emitted()).not.toContain(MEMBER_ID);
  });
});
