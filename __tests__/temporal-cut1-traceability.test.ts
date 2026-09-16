import { readFileSync } from 'fs';
import { join } from 'path';

const poolQuery = jest.fn();

jest.mock('@/lib/db/postgres', () => ({
  pool: { query: poolQuery },
}));

import {
  CUT1_BASELINE_NONVECTOR_SQL,
  CUT1_OBSERVED_NONVECTOR_SQL,
  CUT1_TRACE_CUTOFF,
  CUT1_TRACE_POLICY_KEY,
  Cut1TraceIdempotencyConflict,
  deriveDecayExcludedIds,
  recordCut1Trace,
  type RecordCut1TraceInput,
} from '@/lib/memory/cut1Trace';

const ROOT = join(__dirname, '..');

function entry(id: string, rank: number, live: number, neutral: number) {
  return { memory_id: id, rank, live_score: live, neutral_score: neutral };
}

function trace(over: Partial<RecordCut1TraceInput> = {}): RecordCut1TraceInput {
  return {
    retrievalId: '10000000-0000-4000-8000-000000000001',
    userId: '20000000-0000-4000-8000-000000000002',
    sessionId: 'session-1',
    messageId: 'turn-1',
    eligibleCount: 13,
    liveTop: [entry('a', 1, 0.9, 0.8)],
    neutralTop: [entry('b', 1, 0.7, 0.95)],
    capturedAt: '2026-09-16T02:00:00.000Z',
    ...over,
  };
}

describe('Cut-1 SQL contract', () => {
  it('keeps the live cutoff and does not introduce a tiebreaker', () => {
    expect(CUT1_BASELINE_NONVECTOR_SQL).toContain('ORDER BY score DESC');
    expect(CUT1_BASELINE_NONVECTOR_SQL).toContain('LIMIT 12');
    expect(CUT1_OBSERVED_NONVECTOR_SQL).toContain('ORDER BY score DESC');
    expect(CUT1_OBSERVED_NONVECTOR_SQL).toContain('LIMIT 12');
    expect(CUT1_OBSERVED_NONVECTOR_SQL).not.toMatch(/ORDER BY score DESC\s*,/);
    expect(CUT1_OBSERVED_NONVECTOR_SQL).not.toMatch(/ORDER BY neutral_score DESC\s*,/);
  });

  it('neutralizes only the confidence-decay factor while preserving its 0.40 term', () => {
    expect(CUT1_OBSERVED_NONVECTOR_SQL).toContain('0.40 * significance +');
    expect(CUT1_OBSERVED_NONVECTOR_SQL).toContain('0.35 * EXP(-EXTRACT(EPOCH FROM (NOW() - formed_at))');
    expect(CUT1_OBSERVED_NONVECTOR_SQL).toContain('0.15 * CASE WHEN confirmed_by_user THEN 0.15 ELSE 0 END');
    expect(CUT1_OBSERVED_NONVECTOR_SQL).toContain('0.10 * LEAST(recall_count / 10.0, 1.0)');
  });

  it('never selects from the neutral set into the member-facing rows', () => {
    const finalSelect = CUT1_OBSERVED_NONVECTOR_SQL.slice(CUT1_OBSERVED_NONVECTOR_SQL.lastIndexOf('SELECT'));
    expect(finalSelect).toContain('FROM live_top l');
    expect(finalSelect).not.toContain('FROM neutral_top');
  });
});

describe('bounded historical evidence', () => {
  it('derives zero without requiring an exclusion child row', () => {
    const top = Array.from({ length: 12 }, (_, i) => entry(`m${i}`, i + 1, 1 - i / 100, 1 - i / 100));
    expect(deriveDecayExcludedIds({ liveTop: top, neutralTop: top })).toEqual([]);
  });

  it('can derive the maximum causal difference while both observations remain bounded to 12', () => {
    const liveTop = Array.from({ length: 12 }, (_, i) => entry(`live${i}`, i + 1, 1 - i / 100, 0.1));
    const neutralTop = Array.from({ length: 12 }, (_, i) => entry(`neutral${i}`, i + 1, 0.1, 1 - i / 100));
    expect(deriveDecayExcludedIds({ liveTop, neutralTop })).toHaveLength(12);
    expect(liveTop).toHaveLength(CUT1_TRACE_CUTOFF);
    expect(neutralTop).toHaveLength(CUT1_TRACE_CUTOFF);
  });

  it('migration closes the policy vocabulary and bounds both JSON arrays', () => {
    const migration = readFileSync(
      join(ROOT, 'database/migrations/20260916023700_memory_cut1_trace_runs.sql'),
      'utf8',
    );
    expect(migration).toContain(`CHECK (policy_key = '${CUT1_TRACE_POLICY_KEY}')`);
    expect(migration).toContain('CHECK (cutoff = 12)');
    expect(migration).toContain('jsonb_array_length(live_top) BETWEEN 1 AND 12');
    expect(migration).toContain('jsonb_array_length(neutral_top) BETWEEN 1 AND 12');
    expect(migration).not.toContain('content_text');
  });
});

describe('append-only idempotence', () => {
  beforeEach(() => poolQuery.mockReset());

  it('inserts one bounded trace row without memory prose', async () => {
    poolQuery.mockResolvedValueOnce({ rowCount: 1, rows: [{ retrieval_id: trace().retrievalId }] });
    await expect(recordCut1Trace(trace())).resolves.toBe('inserted');
    const [, params] = poolQuery.mock.calls[0];
    expect(params[4]).toBe(CUT1_TRACE_POLICY_KEY);
    expect(params[5]).toBe(12);
    expect(params[7]).not.toContain('content_text');
    expect(params[8]).not.toContain('content_text');
  });

  it('accepts an exact retry as the same historical act', async () => {
    const input = trace();
    poolQuery
      .mockResolvedValueOnce({ rowCount: 0, rows: [] })
      .mockResolvedValueOnce({
        rowCount: 1,
        rows: [{
          user_id: input.userId,
          session_id: input.sessionId,
          message_id: input.messageId,
          policy_key: CUT1_TRACE_POLICY_KEY,
          cutoff: 12,
          eligible_count: input.eligibleCount,
          live_top: input.liveTop,
          neutral_top: input.neutralTop,
          captured_at: input.capturedAt,
        }],
      });
    await expect(recordCut1Trace(input)).resolves.toBe('existing');
  });

  it('refuses to overwrite a conflicting payload under the same retrieval id', async () => {
    const input = trace();
    poolQuery
      .mockResolvedValueOnce({ rowCount: 0, rows: [] })
      .mockResolvedValueOnce({
        rowCount: 1,
        rows: [{
          user_id: input.userId,
          session_id: input.sessionId,
          message_id: input.messageId,
          policy_key: CUT1_TRACE_POLICY_KEY,
          cutoff: 12,
          eligible_count: input.eligibleCount,
          live_top: [entry('different', 1, 0.9, 0.8)],
          neutral_top: input.neutralTop,
          captured_at: input.capturedAt,
        }],
      });
    await expect(recordCut1Trace(input)).rejects.toBeInstanceOf(Cut1TraceIdempotencyConflict);
    expect(poolQuery).toHaveBeenCalledTimes(2);
  });
});
