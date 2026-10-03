/**
 * FIELD-MONITOR-ALARM-01 — a writer that has never succeeded must say so.
 *
 * The FIELD-MONITOR-UUID-01 defect survived the table's entire lifetime because
 * every failure was reported identically, at `warn`, labelled "non-critical".
 * A 100% failure rate and a single transient fault produced the same line, so
 * the rate — the only thing that distinguished a broken contract from noise —
 * was never visible. These tests pin the distinction, not the wording.
 */

const mockQuery = jest.fn();
jest.mock('@/lib/db/postgres', () => ({ query: (...a: unknown[]) => mockQuery(...a) }));

// Analysis helpers are not under test here; the writer's health signal is.
jest.mock('@/lib/consciousness/therapeuticFrameworkTracker', () => ({
  analyzeTherapeuticFrameworks: () => null,
}));
jest.mock('@/lib/ai/quality/ainResponseShape', () => ({ assessAINResponseShape: () => null }));
jest.mock('@/lib/maia/talkModeFieldIntelligence', () => ({ analyzeFieldIntelligence: () => null }));
jest.mock('@/lib/maia/wisdomFieldMoves', () => ({ selectWisdomField: () => null }));
jest.mock('@/lib/maia/response-quality-metrics', () => ({ getQualityMonitor: () => null }));

const MEMBER = 'ce284751-e457-42f6-89b6-bc07d0876682';

/** The exact production shape: a `voice-` prefixed key against a uuid column. */
const UUID_CAST_ERROR = new Error(
  'invalid input syntax for type uuid: "voice-790d8300-816a-4b6a-ae47-14d9785b0900"',
);

function params(overrides: Record<string, unknown> = {}) {
  return {
    memberId: MEMBER,
    sessionId: 'voice-790d8300-816a-4b6a-ae47-14d9785b0900',
    route: 'stream' as const,
    responseText: 'A response long enough to clear the analysis threshold.',
    userMessage: 'hello',
    ...overrides,
  };
}

/** Drain the fire-and-forget continuation without awaiting the public API. */
const settle = () => new Promise((r) => setImmediate(r));

async function loadFresh() {
  let mod!: typeof import('@/lib/consciousness/fieldMonitorTelemetry');
  await jest.isolateModulesAsync(async () => {
    mod = await import('@/lib/consciousness/fieldMonitorTelemetry');
  });
  return mod;
}

describe('FIELD-MONITOR-ALARM-01 — writer health', () => {
  let errorSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    mockQuery.mockReset();
    jest.spyOn(console, 'info').mockImplementation(() => {});
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => jest.restoreAllMocks());

  it('ALARMS LOUDLY on the very first failure — the defect had ~0 turns of grace', async () => {
    const { fireAndForgetFieldMonitor } = await loadFresh();
    mockQuery.mockRejectedValue(UUID_CAST_ERROR);

    fireAndForgetFieldMonitor(params());
    await settle();

    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(String(errorSpy.mock.calls[0][0])).toMatch(/NEVER SUCCEEDED/);
  });

  it('NAMES the broken contract apart from an outage', async () => {
    const { fireAndForgetFieldMonitor } = await loadFresh();

    // A writer that has never worked.
    mockQuery.mockRejectedValue(UUID_CAST_ERROR);
    fireAndForgetFieldMonitor(params());
    await settle();
    expect(String(errorSpy.mock.calls[0][0])).toMatch(/NEVER SUCCEEDED/);

    // A writer that worked, then stopped, must NOT reuse that wording.
    const { fireAndForgetFieldMonitor: writer2 } = await loadFresh();
    errorSpy.mockClear();
    mockQuery.mockResolvedValueOnce({ rows: [] });
    writer2(params());
    await settle();
    mockQuery.mockRejectedValue(UUID_CAST_ERROR);
    writer2(params());
    await settle();

    const outage = String(errorSpy.mock.calls.at(-1)?.[0]);
    expect(outage).toMatch(/FAILING/);
    expect(outage).not.toMatch(/NEVER SUCCEEDED/);
  });

  it('does NOT alarm per-turn — a sustained failure stays legible, not a flood', async () => {
    const { fireAndForgetFieldMonitor } = await loadFresh();
    mockQuery.mockRejectedValue(UUID_CAST_ERROR);

    // The 10 observed production turns (556-565) would have produced 10 warns
    // and, at the boundaries, exactly two loud alarms — never ten.
    for (let i = 0; i < 10; i++) {
      fireAndForgetFieldMonitor(params());
      await settle();
    }

    expect(errorSpy).toHaveBeenCalledTimes(2); // failure #1 and failure #10

    // Counted by marker, not by total console.warn calls: other stages in
    // _processAndInsert warn on their own and would make this assertion pass
    // or fail for reasons unrelated to the writer's health signal.
    const quiet = warnSpy.mock.calls.filter((c) => String(c[0]).includes('Telemetry failed'));
    expect(quiet).toHaveLength(8); // the 8 non-boundary failures stay quiet
  });

  it('CLEARS on recovery and reports what it recovered from', async () => {
    const { fireAndForgetFieldMonitor } = await loadFresh();
    mockQuery.mockRejectedValue(UUID_CAST_ERROR);
    fireAndForgetFieldMonitor(params());
    await settle();
    errorSpy.mockClear();

    mockQuery.mockReset();
    mockQuery.mockResolvedValue({ rows: [] });
    fireAndForgetFieldMonitor(params());
    await settle();

    expect(String(errorSpy.mock.calls[0][0])).toMatch(/RECOVERED after 1 consecutive/);
  });

  it('a SKIPPED turn never counts as health — short responses cannot clear the alarm', async () => {
    const { fireAndForgetFieldMonitor } = await loadFresh();
    mockQuery.mockRejectedValue(UUID_CAST_ERROR);
    fireAndForgetFieldMonitor(params());
    await settle();
    errorSpy.mockClear();

    // Below the analysis threshold: returns 'skipped', never reaches the INSERT.
    fireAndForgetFieldMonitor(params({ responseText: 'hi' }));
    await settle();
    expect(errorSpy).not.toHaveBeenCalled(); // no false "RECOVERED"

    // The next real failure must still count as #2, not restart at #1.
    for (let i = 0; i < 9; i++) {
      fireAndForgetFieldMonitor(params());
      await settle();
    }
    expect(String(errorSpy.mock.calls.at(-1)?.[0])).toMatch(/10 consecutive/);
  });

  it('PRESERVES fire-and-forget: the alarm never throws into the response path', async () => {
    const { fireAndForgetFieldMonitor } = await loadFresh();
    mockQuery.mockRejectedValue(UUID_CAST_ERROR);

    expect(() => fireAndForgetFieldMonitor(params())).not.toThrow();
    expect(fireAndForgetFieldMonitor(params())).toBeUndefined();
    await settle();
  });
});
