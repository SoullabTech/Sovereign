// backend: lib/sovereign/sessionManager.ts
import { query } from '@/lib/db';
import { randomUUID } from 'crypto';

export type MaiaSession = {
  id: string;
  created_at: string;
  updated_at: string;
  turn_count: number;
};

export async function ensureSession(sessionId?: string): Promise<MaiaSession> {
  const id = sessionId ?? randomUUID();

  // Single upsert instead of SELECT + UPDATE/INSERT
  const result = await query<MaiaSession>(
    `
    INSERT INTO maia_sessions (id)
    VALUES ($1)
    ON CONFLICT (id) DO UPDATE
      SET updated_at = NOW()
    RETURNING id, created_at, updated_at, turn_count
    `,
    [id]
  );

  return result.rows[0];
}

export async function incrementTurnCount(sessionId: string): Promise<void> {
  await query(
    `UPDATE maia_sessions
     SET turn_count = turn_count + 1, updated_at = NOW()
     WHERE id = $1`,
    [sessionId]
  );
}

// Initialize the session table (create if not exists)
export async function initializeSessionTable(): Promise<void> {
  await query(`
    CREATE TABLE IF NOT EXISTS maia_sessions (
      id TEXT PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      turn_count INTEGER NOT NULL DEFAULT 0
    )
  `);
}
