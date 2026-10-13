import type { PoolClient } from 'pg';
import { pool } from '../db/postgres';
import { buildLearningReport, learningWindow, type LearningReport } from './learningReport';

/** Only grouped categorical counts leave PostgreSQL; no authored content is selected. */
export const FEEDBACK_AGGREGATE_SQL = `
  SELECT signal,
         COUNT(*)::int AS submissions,
         COUNT(DISTINCT member_id)::int AS contributors
  FROM writer_studio_beta_feedback
  WHERE created_at >= $1::timestamptz AND created_at < $2::timestamptz
  GROUP BY signal
`;

/** Server-only source adapter. The page/API must authorize the founder before calling. */
export async function loadLearningReport(now: Date = new Date()): Promise<LearningReport> {
  const window = learningWindow(now);
  const unavailable = () => buildLearningReport({ kind: 'unavailable' }, now);
  if (!pool) return unavailable();

  let client: PoolClient;
  try {
    client = await pool.connect();
  } catch {
    return unavailable();
  }

  let discardConnection = false;
  try {
    await client.query('BEGIN READ ONLY');
    await client.query("SET LOCAL statement_timeout = '2500ms'");
    const result = await client.query(FEEDBACK_AGGREGATE_SQL, [window.start, window.endExclusive]);
    await client.query('COMMIT');
    return buildLearningReport({ kind: 'read', groups: result.rows }, now);
  } catch {
    // A failed source is not an empty sample. Do not log row data or driver error text.
    try { await client.query('ROLLBACK'); } catch { discardConnection = true; }
    return unavailable();
  } finally {
    client.release(discardConnection);
  }
}
