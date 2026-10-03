/** @jest-environment node */
import { pool } from '../../db/postgres';
import { FEEDBACK_AGGREGATE_SQL, loadLearningReport } from '../learningReportServer';

jest.mock('../../db/postgres', () => ({ pool: { connect: jest.fn() } }));
const connect = pool!.connect as jest.Mock;
const query = jest.fn();
const release = jest.fn();
const now = new Date('2026-10-03T20:00:00Z');

beforeEach(() => {
  jest.clearAllMocks();
  query.mockReset();
  query.mockResolvedValue({ rows: [] });
  connect.mockReset();
  connect.mockResolvedValue({ query, release });
});

describe('C7A read-only feedback source', () => {
  it('uses a read-only transaction, fixed timeout, and one bounded aggregate', async () => {
    const report = await loadLearningReport(now);
    expect(query.mock.calls).toEqual([
      ['BEGIN READ ONLY'],
      ["SET LOCAL statement_timeout = '2500ms'"],
      [FEEDBACK_AGGREGATE_SQL, ['2026-09-05T00:00:00.000Z', '2026-10-03T00:00:00.000Z']],
      ['COMMIT'],
    ]);
    expect(release).toHaveBeenCalledWith(false);
    expect(report.source.state).toBe('observed');
  });
  it('selects only signal-level aggregates and has no identity join or authored text', () => {
    const sql = FEEDBACK_AGGREGATE_SQL.replace(/\s+/g, ' ').trim();
    expect(sql).toMatch(/^SELECT signal, COUNT\(\*\)::int AS submissions, COUNT\(DISTINCT member_id\)::int AS contributors FROM writer_studio_beta_feedback WHERE created_at >= \$1::timestamptz AND created_at < \$2::timestamptz GROUP BY signal$/);
    expect(sql).not.toMatch(/\b(JOIN|INSERT|UPDATE|DELETE|note|orientation_context|manuscript_id)\b/i);
  });
  it('applies the display floor before returning data to a caller', async () => {
    query.mockImplementation(async (sql: string) => ({ rows: sql === FEEDBACK_AGGREGATE_SQL
      ? [{ signal: 'felt_like_my_voice', submissions: 100, contributors: 1 }] : [] }));
    const report = await loadLearningReport(now);
    expect(report.feedback.find(s => s.id === 'felt_like_my_voice'))
      .toMatchObject({ state: 'withheld', submissions: null });
    expect(JSON.stringify(report)).not.toContain('100');
  });
  it('reports a missing table as unavailable, not no activity', async () => {
    query.mockImplementation(async (sql: string) => {
      if (sql === FEEDBACK_AGGREGATE_SQL) throw { code: '42P01', detail: 'PRIVATE ERROR DETAIL' };
      return { rows: [] };
    });
    const report = await loadLearningReport(now);
    expect(report.source.state).toBe('unavailable');
    expect(query).toHaveBeenCalledWith('ROLLBACK');
    expect(release).toHaveBeenCalledWith(false);
    expect(JSON.stringify(report)).not.toContain('PRIVATE');
  });
  it('does not reuse a connection after rollback failure', async () => {
    query.mockRejectedValue(new Error('connection lost'));
    expect((await loadLearningReport(now)).source.state).toBe('unavailable');
    expect(release).toHaveBeenCalledWith(true);
  });
  it('does not present a result when the read transaction cannot complete', async () => {
    query.mockImplementation(async (sql: string) => {
      if (sql === 'COMMIT') throw new Error('connection lost');
      return { rows: [] };
    });
    expect((await loadLearningReport(now)).source.state).toBe('unavailable');
    expect(query).toHaveBeenCalledWith('ROLLBACK');
  });
  it('fails without reading when no connection can be obtained', async () => {
    connect.mockRejectedValue(new Error('unavailable'));
    expect((await loadLearningReport(now)).source.state).toBe('unavailable');
    expect(query).not.toHaveBeenCalled();
    expect(release).not.toHaveBeenCalled();
  });
});
