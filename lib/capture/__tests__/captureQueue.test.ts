/**
 * @jest-environment jsdom
 */

/**
 * USC-04 — offline / idempotent capture path.
 *
 * These tests pin the transport guarantee the whole capture programme rests on:
 *
 *   tap → local save → haptic confirmation → queued sync → Session Room
 *
 * rather than:
 *
 *   tap → spin → network error → lost thought
 *
 * The server is idempotent on (memberId, clientCaptureId); these tests prove
 * the CLIENT half of that contract — that the id is minted once at capture time
 * and reused across every delivery attempt, so a replay can resolve to the same
 * row instead of duplicating the moment.
 *
 * Watch (USC-06) inherits these semantics, so a regression here is a regression
 * on the wrist as well as the phone.
 */

const mockApiFetch = jest.fn();
jest.mock('@/lib/http/apiBase', () => ({
  apiFetch: (...args: unknown[]) => mockApiFetch(...args),
}));

const QUEUE_KEY = 'maia_capture_queue_v1';

type QueueModule = typeof import('../captureQueue');

/** Fresh module instance so the internal `flushing` guard never leaks between tests. */
async function loadQueue(): Promise<QueueModule> {
  let mod: QueueModule;
  await jest.isolateModulesAsync(async () => {
    mod = await import('../captureQueue');
  });
  return mod!;
}

function setOnline(online: boolean): void {
  Object.defineProperty(window.navigator, 'onLine', {
    value: online,
    configurable: true,
  });
}

function readRawQueue(): any[] {
  return JSON.parse(window.localStorage.getItem(QUEUE_KEY) ?? '[]');
}

function ok(status = 201) {
  return { ok: true, status };
}
function fail(status: number) {
  return { ok: false, status };
}

beforeEach(() => {
  window.localStorage.clear();
  mockApiFetch.mockReset();
  setOnline(true);
});

describe('USC-04 capture queue — durability before delivery', () => {
  it('persists the capture locally before any network call is made', async () => {
    const q = await loadQueue();
    // Delivery hangs forever: the capture must still be durable.
    mockApiFetch.mockImplementation(() => new Promise(() => {}));

    q.capture({ source: 'iphone', modality: 'marker' });

    expect(readRawQueue()).toHaveLength(1);
    expect(readRawQueue()[0]).toMatchObject({ source: 'iphone', modality: 'marker' });
  });

  it('mints a distinct clientCaptureId per capture', async () => {
    const q = await loadQueue();
    mockApiFetch.mockImplementation(() => new Promise(() => {}));

    q.capture({ source: 'iphone', modality: 'marker' });
    q.capture({ source: 'iphone', modality: 'marker' });

    const ids = readRawQueue().map(i => i.clientCaptureId);
    expect(new Set(ids).size).toBe(2);
    expect(ids.every(Boolean)).toBe(true);
  });

  it('stamps capture time on the device, not at delivery', async () => {
    const q = await loadQueue();
    mockApiFetch.mockImplementation(() => new Promise(() => {}));

    const before = Date.now();
    const item = q.capture({ source: 'iphone', modality: 'marker' });

    expect(item.capturedAtMs).toBeGreaterThanOrEqual(before);
    expect(item.capturedAtMs).toBeLessThanOrEqual(Date.now());
  });
});

describe('USC-04 capture queue — offline behaviour', () => {
  it('sends nothing while offline and keeps the capture queued', async () => {
    const q = await loadQueue();
    setOnline(false);

    q.capture({ source: 'iphone', modality: 'marker' });
    const result = await q.flushQueue();

    expect(mockApiFetch).not.toHaveBeenCalled();
    expect(result.sent).toBe(0);
    expect(q.queueDepth()).toBe(1);
  });

  it('delivers the capture once connectivity returns — the offline MARK survives', async () => {
    const q = await loadQueue();
    setOnline(false);

    q.capture({ source: 'iphone', modality: 'marker' });
    expect(q.queueDepth()).toBe(1);

    setOnline(true);
    mockApiFetch.mockResolvedValue(ok(201));
    const result = await q.flushQueue();

    expect(result.sent).toBe(1);
    expect(q.queueDepth()).toBe(0);
  });

  it('reuses the SAME clientCaptureId across reconnect — this is what makes replay idempotent', async () => {
    const q = await loadQueue();
    setOnline(false);

    const item = q.capture({ source: 'iphone', modality: 'marker' });
    const mintedId = item.clientCaptureId;

    setOnline(true);
    mockApiFetch.mockResolvedValue(ok(201));
    await q.flushQueue();

    const sentBody = JSON.parse(mockApiFetch.mock.calls[0][1].body);
    expect(sentBody.clientCaptureId).toBe(mintedId);
  });
});

describe('USC-04 capture queue — idempotent replay', () => {
  it('treats a 200 replay as delivered and does not resend', async () => {
    const q = await loadQueue();
    // 200 = server already knows this clientCaptureId (idempotent replay).
    mockApiFetch.mockResolvedValue(ok(200));

    q.capture({ source: 'iphone', modality: 'marker' });
    await q.flushQueue();

    expect(q.queueDepth()).toBe(0);

    await q.flushQueue();
    // Nothing left to send: exactly one delivery attempt total.
    expect(mockApiFetch).toHaveBeenCalledTimes(1);
  });

  it('a duplicated flush produces one capture, not two', async () => {
    const q = await loadQueue();
    mockApiFetch.mockResolvedValue(ok(201));

    q.capture({ source: 'iphone', modality: 'marker' });
    await Promise.all([q.flushQueue(), q.flushQueue()]);

    const distinctIds = new Set(
      mockApiFetch.mock.calls.map(c => JSON.parse(c[1].body).clientCaptureId)
    );
    expect(distinctIds.size).toBe(1);
    expect(q.queueDepth()).toBe(0);
  });
});

describe('USC-04 capture queue — failure handling', () => {
  it('keeps the capture queued on transport failure', async () => {
    const q = await loadQueue();
    mockApiFetch.mockRejectedValue(new Error('network down'));

    q.capture({ source: 'iphone', modality: 'text', content: 'grief when home came up' });
    await q.flushQueue();

    expect(q.queueDepth()).toBe(1);
  });

  it('keeps the capture queued on 401 — the member may sign back in', async () => {
    const q = await loadQueue();
    mockApiFetch.mockResolvedValue(fail(401));

    q.capture({ source: 'iphone', modality: 'marker' });
    await q.flushQueue();

    expect(q.queueDepth()).toBe(1);
  });

  it('drops a permanently rejected capture rather than retrying forever', async () => {
    const q = await loadQueue();
    mockApiFetch.mockResolvedValue(fail(400));

    q.capture({ source: 'iphone', modality: 'marker' });
    const result = await q.flushQueue();

    expect(q.queueDepth()).toBe(0);
    expect(result.sent).toBe(0); // dropped, never counted as delivered
  });

  it('a stuck queue stays visible so it can be surfaced, not hidden', async () => {
    const q = await loadQueue();
    mockApiFetch.mockRejectedValue(new Error('offline'));

    q.capture({ source: 'iphone', modality: 'marker' });
    q.capture({ source: 'iphone', modality: 'text', content: 'x' });
    await q.flushQueue();

    expect(q.queueDepth()).toBeGreaterThan(0);
  });
});

describe('USC-04 capture queue — foreground/reconnect triggers', () => {
  it('flushes when the app returns to the foreground (backgrounding must not lose a capture)', async () => {
    const q = await loadQueue();
    setOnline(false);
    q.capture({ source: 'iphone', modality: 'marker' });

    setOnline(true);
    mockApiFetch.mockResolvedValue(ok(201));

    const teardown = q.installFlushTriggers();
    document.dispatchEvent(new Event('visibilitychange'));
    await new Promise(r => setTimeout(r, 0));

    expect(mockApiFetch).toHaveBeenCalled();
    teardown();
  });

  it('flushes on the online event', async () => {
    const q = await loadQueue();
    setOnline(false);
    q.capture({ source: 'iphone', modality: 'marker' });

    const teardown = q.installFlushTriggers();
    setOnline(true);
    mockApiFetch.mockResolvedValue(ok(201));
    window.dispatchEvent(new Event('online'));
    await new Promise(r => setTimeout(r, 0));

    expect(mockApiFetch).toHaveBeenCalled();
    teardown();
  });
});
