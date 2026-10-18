/**
 * Fictional Member Access browser-only server gate fixture.
 * Refuses anything except the exact isolated CI PostgreSQL connection.
 * No production host, member, password, email or reset data can be used.
 */
import pg from 'pg';

const EXPECTED = 'postgresql://postgres:postgres@127.0.0.1:5432/postgres';
if (process.env.CI !== 'true' || process.env.DATABASE_URL !== EXPECTED
    || process.env.MEMBER_ACCESS_RECOVERY_ENABLED === '1') {
  throw new Error('REFUSED: Member Access browser seed requires default-OFF, exact CI-only PostgreSQL');
}
const db = new pg.Pool({ connectionString: EXPECTED });
try {
  await db.query(`
    CREATE TABLE IF NOT EXISTS members (
      id uuid PRIMARY KEY,
      name text, username text, email text,
      tier text NOT NULL DEFAULT 'free',
      roles text[] NOT NULL DEFAULT ARRAY['member']::text[],
      admin_role text NULL,
      email_verified boolean NOT NULL DEFAULT false,
      recovery_email_verification_id uuid
    );
    CREATE TABLE IF NOT EXISTS auth_sessions (
      member_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
      session_token text PRIMARY KEY,
      revoked boolean NOT NULL DEFAULT FALSE,
      expires_at timestamptz NOT NULL
    );
    CREATE TABLE IF NOT EXISTS admin_access_log (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      via text NOT NULL,
      member_id uuid REFERENCES members(id) ON DELETE SET NULL,
      admin_role text,
      route text NOT NULL,
      ip text NOT NULL,
      created_at timestamptz DEFAULT NOW()
    );
    INSERT INTO members(id,name,username,email,tier,roles,admin_role)
    VALUES (
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      'Fictional Founder', 'fixture_founder', 'founder@example.invalid',
      'pro', ARRAY['member','admin']::text[], 'founder'
    );
    INSERT INTO auth_sessions(member_id,session_token,revoked,expires_at)
    VALUES (
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      'fictional-founder-session', false, now()+interval '1 day'
    );
  `);
  const { rows } = await db.query(
    "SELECT count(*)::int AS n FROM members WHERE email LIKE '%@example.invalid' AND admin_role='founder'",
  );
  if (rows[0].n !== 1) throw new Error('Fictional founder fixture not unique');
  console.log('Member Access browser gate fixture ready: 1 fictional founder; no real data');
} finally {
  await db.end();
}
