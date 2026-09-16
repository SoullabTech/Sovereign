/**
 * @jest-environment node
 *
 * SOURCE-CUSTODY-PII-01 · ACT 2A — abuse control on the admission oracle.
 *
 * `POST /api/onboarding/recognize-key` answers only "does this credential
 * admit". That is still a guessing oracle unless it is throttled, so this
 * suite witnesses the throttle rather than asserting it.
 *
 * ⭐ W4 IS THE LOAD-BEARING TEST. It reruns W3's proposition against a limiter
 * stubbed to always allow, and REQUIRES that proposition to fail. Without it,
 * W3 passing would be compatible with a limiter that never runs — the test
 * would be measuring its own mock. A guard that cannot fail is not a guard.
 *
 * ⛔ THE 48 LEGACY PASSCODES ARE NOT SECRETS AND ARE NOT USED HERE. Per the
 * founder ruling, a value that was admitted to a client-authorizing surface
 * does not regain secrecy because the decision later moved server-side. These
 * tests use synthetic credentials only; no value from the corpus appears.
 */
import { NextRequest } from 'next/server';

/* The route declares `server-only`, which throws under a client resolution
   condition — jest uses one. Neutralising it here is a test-harness concession,
   NOT a weakening: the boundary itself is witnessed by
   `__tests__/onboarding-human-record-boundary.test.ts`, which walks the real
   import graph. (That this mock is needed at all is incidental evidence the
   boundary is live.) */
jest.mock('server-only', () => ({}));

/* ── Controllable limiter double ──────────────────────────────────────────── */
let limiterMode: 'real-window' | 'always-allow' = 'real-window';
let attempts = 0;
const MAX = 5;

jest.mock('@/lib/auth/rateLimiter', () => ({
  checkRateLimit: jest.fn(async () => {
    if (limiterMode === 'always-allow') {
      return { allowed: true, remainingAttempts: 99, blockedUntil: null, retryAfterSeconds: null };
    }
    attempts += 1;
    const allowed = attempts <= MAX;
    return {
      allowed,
      remainingAttempts: Math.max(0, MAX - attempts),
      blockedUntil: allowed ? null : new Date(Date.now() + 900_000),
      retryAfterSeconds: allowed ? null : 900,
    };
  }),
  getClientIP: jest.fn(() => '203.0.113.7'),
  buildRateLimitHeaders: jest.fn(() => ({ 'Retry-After': '900' })),
}));

/* Synthetic record corpus — never the real one. */
const SYNTHETIC_PASSCODE = 'SYNTHETIC-ADMIT-KEY-0001';
jest.mock('@/lib/ganesha/contacts', () => ({
  ganeshaContacts: [
    {
      id: 'synthetic-1',
      name: 'Synthetic Person',
      email: 'synthetic@example.com',
      joinDate: '2026-01-01',
      status: 'active',
      groups: [],
      tags: [],
      metadata: { passcode: 'SYNTHETIC-ADMIT-KEY-0001' },
    },
  ],
}));

const resolveAdmission = jest.fn(async () => ({ kind: 'refused', reason: 'no_invite' as const }));
jest.mock('@/lib/auth/passkeyAdmission', () => ({
  resolveAdmission: (...args: unknown[]) => resolveAdmission(...(args as [])),
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { POST } = require('@/app/api/onboarding/recognize-key/route');

const post = (key: unknown) =>
  POST(
    new NextRequest('https://example.test/api/onboarding/recognize-key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key }),
    }),
  );

beforeEach(() => {
  attempts = 0;
  limiterMode = 'real-window';
});

/** W3's proposition, extracted so W4 can rerun it and require failure. */
async function throttleHoldsAfterRepeatedFailures(): Promise<void> {
  const statuses: number[] = [];
  for (let i = 0; i < 8; i += 1) {
    const res = await post(`WRONG-GUESS-${i}`);
    statuses.push(res.status);
  }
  if (!statuses.includes(429)) {
    throw new Error(`no throttle observed across 8 attempts: ${statuses.join(',')}`);
  }
}

describe('ACT 2A · admission oracle abuse control', () => {
  test('W1 — ordinary authorized admission still functions', async () => {
    const res = await post(SYNTHETIC_PASSCODE);
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ recognized: true, name: null });
    expect(res.headers.get('Cache-Control')).toMatch(/no-store/);
  });

  test('W1b — both legacy shared onboarding keys remain admitted until R12 retirement', async () => {
    for (const key of ['BETA-TESTER-2025', 'SOUL-PIONEER-2025']) {
      const res = await post(key);
      expect(res.status).toBe(200);
      await expect(res.json()).resolves.toEqual({ recognized: true, name: null });
    }
  });

  test('W2 — invalid admission fails, and every failure looks identical', async () => {
    const bodies: string[] = [];
    for (const candidate of ['NOPE-1', '', 'SOULLAB-LOOKS-RIGHT', 12345, null]) {
      const res = await post(candidate);
      bodies.push(JSON.stringify(await res.json()));
      expect(res.headers.get('Cache-Control')).toMatch(/no-store/);
    }
    // One refusal shape, no varieties.
    expect(new Set(bodies).size).toBe(1);
    expect(JSON.parse(bodies[0])).toEqual({ recognized: false, name: null });
  });

  test('W3 — repeated invalid attempts are throttled', async () => {
    await expect(throttleHoldsAfterRepeatedFailures()).resolves.toBeUndefined();
  });

  test('W4 — MUTANT: disabling the limiter breaks the abuse-control witness', async () => {
    limiterMode = 'always-allow';
    await expect(throttleHoldsAfterRepeatedFailures()).rejects.toThrow(/no throttle observed/);
  });

  test('W5 — a throttled response is indistinguishable in body from a refusal', async () => {
    for (let i = 0; i < MAX; i += 1) await post(`BURN-${i}`);
    const throttled = await post('ANOTHER-GUESS');
    expect(throttled.status).toBe(429);
    await expect(throttled.json()).resolves.toEqual({ recognized: false, name: null });
    expect(throttled.headers.get('Cache-Control')).toMatch(/no-store/);
  });

  test('W6 — no submitted credential is emitted to console by this route', async () => {
    const seen: string[] = [];
    const spies = (['log', 'warn', 'error', 'info', 'debug'] as const).map((m) =>
      jest.spyOn(console, m).mockImplementation((...a: unknown[]) => {
        seen.push(a.map(String).join(' '));
      }),
    );
    resolveAdmission.mockRejectedValueOnce(new Error('invite lookup exploded'));
    try {
      await post(SYNTHETIC_PASSCODE);
      await post('SECRET-GUESS-VALUE-XYZ');
      await post('SOULLAB-TRIGGERS-THE-THROW');
    } finally {
      spies.forEach((s) => s.mockRestore());
    }
    const blob = seen.join('\n');
    expect(blob).not.toContain('SECRET-GUESS-VALUE-XYZ');
    expect(blob).not.toContain(SYNTHETIC_PASSCODE);
    expect(blob).not.toContain('SOULLAB-TRIGGERS-THE-THROW');
  });
});
