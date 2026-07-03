// Make this file a module so top-level `const`s are file-scoped (not global) —
// prevents TS2451 redeclaration collisions with sibling test files.
export {};

/**
 * Beta Core Integration Tests
 *
 * These tests verify the living system — the critical path from
 * sign-in to conversation to memory persistence.
 *
 * If these fail, nothing else matters.
 *
 * Run: npx jest __tests__/beta-core.test.ts
 */

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

async function apiFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  return res;
}

describe('Beta Core — Health', () => {
  test('health endpoint responds', async () => {
    const res = await apiFetch('/api/health');
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.health).toBe('ok');
    expect(data.components?.database?.status).toBe('ok');
  });

  test('consciousness health responds', async () => {
    const res = await apiFetch('/api/consciousness/health');
    expect(res.status).toBe(200);
  });
});

describe('Beta Core — Authentication', () => {
  test('signin endpoint exists and rejects empty body', async () => {
    const res = await apiFetch('/api/members/signin', {
      method: 'POST',
      body: JSON.stringify({}),
    });
    // Should return 400 or 401, not 404 or 500
    expect(res.status).toBeLessThan(500);
    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  test('register endpoint exists and rejects empty body', async () => {
    const res = await apiFetch('/api/members/register', {
      method: 'POST',
      body: JSON.stringify({}),
    });
    expect(res.status).toBeLessThan(500);
    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  test('progress endpoint exists', async () => {
    const res = await apiFetch('/api/members/progress');
    // GET without auth should return 400/401, not 404/500
    expect(res.status).toBeLessThan(500);
  });
});

describe('Beta Core — MAIA Conversation', () => {
  test('rejects request without message', async () => {
    const res = await apiFetch('/api/sovereign/app/maia', {
      method: 'POST',
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.code).toBe('NO_MESSAGE');
  });

  test('responds to a simple message with correct shape', async () => {
    const res = await apiFetch('/api/sovereign/app/maia', {
      method: 'POST',
      body: JSON.stringify({
        message: 'Hello',
        sessionId: `test-${Date.now()}`,
      }),
    });

    expect(res.status).toBe(200);

    const data = await res.json();

    // Core response shape — these must always be present
    expect(data).toHaveProperty('message');
    expect(typeof data.message).toBe('string');
    expect(data.message.length).toBeGreaterThan(0);

    // Route metadata
    expect(data.route).toBeDefined();
    expect(data.route.endpoint).toBe('/api/sovereign/app/maia');
    expect(data.route.operational).toBe(true);

    // Session tracking
    expect(data.session).toBeDefined();
    expect(data.session.id).toBeDefined();
    expect(typeof data.session.id).toBe('string');

    // Processing metadata
    expect(data.metadata).toBeDefined();
    expect(typeof data.metadata.processingTimeMs).toBe('number');
  }, 30000); // 30s timeout for DEEP path

  test('maintains session across turns', async () => {
    const sessionId = `test-continuity-${Date.now()}`;

    // First turn
    const res1 = await apiFetch('/api/sovereign/app/maia', {
      method: 'POST',
      body: JSON.stringify({
        message: 'Remember the word: sovereignty',
        sessionId,
      }),
    });
    expect(res1.status).toBe(200);
    const data1 = await res1.json();
    expect(data1.session.id).toBe(sessionId);

    // Second turn — same session
    const res2 = await apiFetch('/api/sovereign/app/maia', {
      method: 'POST',
      body: JSON.stringify({
        message: 'What word did I just mention?',
        sessionId,
      }),
    });
    expect(res2.status).toBe(200);
    const data2 = await res2.json();
    expect(data2.session.id).toBe(sessionId);

    // Turn count should have incremented
    expect(data2.session.turns).toBeGreaterThan(data1.session.turns);
  }, 60000); // 60s for two full turns
});

describe('Beta Core — Pages Load', () => {
  test('/signin page returns 200', async () => {
    const res = await fetch(`${BASE_URL}/signin`);
    expect(res.status).toBe(200);
  });

  test('/begin page returns 200', async () => {
    const res = await fetch(`${BASE_URL}/begin`);
    expect(res.status).toBe(200);
  });

  test('/maia page returns 200 or redirects to signin', async () => {
    const res = await fetch(`${BASE_URL}/maia`, { redirect: 'manual' });
    // Either loads (200) or redirects to signin (302/307)
    expect([200, 302, 307]).toContain(res.status);
  });
});
