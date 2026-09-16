const mockQuery = jest.fn();
const mockObservedRead = jest.fn();
const mockExtractPayload = jest.fn();
const mockRecordTrace = jest.fn();

class MockCut1TraceIdempotencyConflict extends Error {}

jest.mock('@/lib/db/postgres', () => ({
  query: mockQuery,
}));

jest.mock('@/lib/memory/cut1Trace', () => ({
  CUT1_BASELINE_NONVECTOR_SQL: 'BASELINE_CUT1_SQL',
  Cut1TraceIdempotencyConflict: MockCut1TraceIdempotencyConflict,
  extractCut1TracePayload: mockExtractPayload,
  recordCut1Trace: mockRecordTrace,
  runObservedCut1Read: mockObservedRead,
}));

import { MemoryBundleService } from '@/lib/memory/MemoryBundle';

const row = (id: string, score: number) => ({
  id,
  memory_type: 'pattern',
  facet_code: null,
  entity_tags: [],
  content_text: `body-${id}`,
  significance: '0.8',
  formed_at: '2026-09-01T00:00:00.000Z',
  last_confirmed_at: null,
  confirmed_by_user: false,
  recall_count: 0,
  score,
});

const payload = {
  eligibleCount: 13,
  liveTop: [{ memory_id: 'a', rank: 1, live_score: 0.9, neutral_score: 0.8 }],
  neutralTop: [{ memory_id: 'b', rank: 1, live_score: 0.7, neutral_score: 0.95 }],
  capturedAt: '2026-09-16T02:00:00.000Z',
};

const binding = {
  retrievalId: '10000000-0000-4000-8000-000000000001',
  sessionId: 'session-1',
  traceId: 'turn-1',
};

describe('Cut-1 observer is fail-soft and non-authoritative', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    mockQuery.mockReset();
    mockObservedRead.mockReset();
    mockExtractPayload.mockReset();
    mockRecordTrace.mockReset();
  });

  it('returns the already-decided LIVE candidates when trace persistence fails', async () => {
    mockObservedRead.mockResolvedValue({ rows: [row('a', 0.9), row('b', 0.8)] });
    mockExtractPayload.mockReturnValue(payload);
    mockRecordTrace.mockRejectedValue(new Error('storage unavailable'));
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

    const out = await MemoryBundleService.getSemanticMemories('user-1', 'current words', undefined, binding);

    expect(out.map((c: any) => [c.id, c.compositeScore])).toEqual([['a', 0.9], ['b', 0.8]]);
    expect(mockRecordTrace).toHaveBeenCalledTimes(1);
    expect(mockQuery).not.toHaveBeenCalledWith('BASELINE_CUT1_SQL', ['user-1']);
    expect(warn).toHaveBeenCalledWith('[cut1_trace_write_failed]');
  });

  it('falls back to the preserved baseline query when the observer read fails', async () => {
    mockObservedRead.mockRejectedValue(new Error('observer-only failure'));
    mockQuery.mockResolvedValueOnce({ rows: [row('a', 0.9), row('b', 0.8)] });
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

    const out = await MemoryBundleService.getSemanticMemories('user-1', 'current words', undefined, binding);

    expect(out.map((c: any) => [c.id, c.compositeScore])).toEqual([['a', 0.9], ['b', 0.8]]);
    expect(mockQuery).toHaveBeenCalledWith('BASELINE_CUT1_SQL', ['user-1']);
    expect(mockRecordTrace).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledWith('[cut1_trace_read_failed]');
    expect(JSON.stringify(warn.mock.calls)).not.toContain('user-1');
  });

  it('uses the baseline path when there is no turn binding rather than fabricating a trace', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [row('a', 0.9)] });

    const out = await MemoryBundleService.getSemanticMemories('user-1', 'current words');

    expect(out.map((c: any) => c.id)).toEqual(['a']);
    expect(mockObservedRead).not.toHaveBeenCalled();
    expect(mockRecordTrace).not.toHaveBeenCalled();
  });

  it('preserves distinct retrieval identities for two builds under the same member turn', async () => {
    const retrievalIds: string[] = [];
    jest.spyOn(MemoryBundleService, 'getRecentTurns').mockResolvedValue([]);
    jest.spyOn(MemoryBundleService, 'getSemanticMemories').mockImplementation(async (_u, _q, _f, trace) => {
      retrievalIds.push(trace!.retrievalId);
      return [];
    });
    jest.spyOn(MemoryBundleService, 'getBreakthroughs').mockResolvedValue([]);
    jest.spyOn(MemoryBundleService, 'getRelationshipData').mockResolvedValue({
      encounterCount: 0,
      firstSeen: null,
      lastSeen: null,
      sessionCount: 0,
    });

    const input = {
      userId: 'user-1',
      currentInput: 'hello',
      sessionId: 'session-1',
      traceId: 'same-turn',
      recordRetrievedCandidates: false,
    } as const;

    await MemoryBundleService.build(input);
    await MemoryBundleService.build(input);

    expect(retrievalIds).toHaveLength(2);
    expect(retrievalIds[0]).not.toBe(retrievalIds[1]);
  });
});
