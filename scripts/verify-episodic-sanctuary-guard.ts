/**
 * Verify — episodic mark Sanctuary guard SQL semantics (R17) against a REAL
 * database.
 *
 *   npx tsx scripts/verify-episodic-sanctuary-guard.ts
 *   (DATABASE_URL respected; defaults to the local sovereign PostgreSQL)
 *
 * Companion to:
 *   - tests/constitutional/refusal-registry/refusal-17-*.ts  (source-level)
 *   - app/api/sovereign/episodes/mark/__tests__/sanctuaryGuard.test.ts
 *     (route runtime with mocked db)
 * This script closes the remaining gap: it proves the resolution SQL —
 * extracted VERBATIM from the route source, so drift is impossible — computes
 * both verdicts (owned allowlist + is_sanctuary) correctly against the real
 * schema (maia_sessions TEXT member_id nullable; member_sessions UUID
 * member_id NOT NULL). The route writes only on (owned=true, sanctuary=false).
 *
 * Everything runs inside one transaction that is ALWAYS rolled back: no row
 * seeded here survives, in any database this is pointed at.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { Client } from 'pg';

const ROUTE = 'app/api/sovereign/episodes/mark/route.ts';

const src = readFileSync(join(process.cwd(), ROUTE), 'utf8');
const match = src.match(/SELECT\s+EXISTS[\s\S]*?AS is_sanctuary/);
if (!match) {
  console.error(`❌ guard SQL not found in ${ROUTE} — route changed shape; update this script`);
  process.exit(1);
}
const GUARD_SQL = match[0];

const MEMBER = randomUUID();
const OTHER = randomUUID();
const S = (name: string) => `r17-verify-${name}-${MEMBER.slice(0, 8)}`;

interface Case {
  label: string;
  sessionId: string;
  memberId: string;
  /** expected (owned, is_sanctuary) — write proceeds only on (true, false) */
  expect: { owned: boolean; sanctuary: boolean };
}

const CASES: Case[] = [
  { label: "own maia_sessions.mode='sanctuary' → owned, sanctuary → refuse", sessionId: S('live-mode'), memberId: MEMBER, expect: { owned: true, sanctuary: true } },
  { label: "own maia_sessions.privacy_mode='sanctuary' → owned, sanctuary → refuse", sessionId: S('live-privacy'), memberId: MEMBER, expect: { owned: true, sanctuary: true } },
  { label: "own member_sessions.mode='sanctuary' (finalized) → owned, sanctuary → refuse", sessionId: S('finalized'), memberId: MEMBER, expect: { owned: true, sanctuary: true } },
  { label: 'NULL-owner (anonymous) sanctuary session → owned, sanctuary → refuse (errs toward refusal)', sessionId: S('anon'), memberId: MEMBER, expect: { owned: true, sanctuary: true } },
  { label: 'own ordinary session → owned, not sanctuary → PERMIT (the only writing shape)', sessionId: S('ordinary'), memberId: MEMBER, expect: { owned: true, sanctuary: false } },
  { label: 'NULL-owner ordinary session → owned, not sanctuary → permit (anonymous-start stays markable)', sessionId: S('anon-ordinary'), memberId: MEMBER, expect: { owned: true, sanctuary: false } },
  { label: "ANOTHER member's sanctuary session → NOT owned → governed denial (no cross-member oracle)", sessionId: S('cross-sanctuary'), memberId: MEMBER, expect: { owned: false, sanctuary: false } },
  { label: "ANOTHER member's ordinary session → NOT owned → same denial as nonexistent", sessionId: S('cross-ordinary'), memberId: MEMBER, expect: { owned: false, sanctuary: false } },
  { label: 'nonexistent session → NOT owned → same denial as cross-member', sessionId: S('ghost'), memberId: MEMBER, expect: { owned: false, sanctuary: false } },
];

async function main() {
  const client = new Client({
    connectionString:
      process.env.DATABASE_URL || 'postgresql://soullab@localhost:5432/maia_consciousness',
  });
  await client.connect();
  let failed = 0;

  try {
    await client.query('BEGIN');

    // Temp members (member_sessions.member_id is a NOT NULL FK). Rolled back.
    await client.query(
      `INSERT INTO members (id, passkey, username, password_hash, name)
       VALUES ($1, $3 || '-a', $3 || '-a', 'x', 'R17 Verify A'),
              ($2, $3 || '-b', $3 || '-b', 'x', 'R17 Verify B')`,
      [MEMBER, OTHER, `r17-verify-${MEMBER.slice(0, 8)}`],
    );

    await client.query(
      `INSERT INTO maia_sessions (id, member_id, mode, privacy_mode)
       VALUES ($1, $6, 'sanctuary',  'standard'),
              ($2, $6, 'continuity', 'sanctuary'),
              ($3, NULL, 'sanctuary', 'sanctuary'),
              ($4, $6, 'continuity', 'standard'),
              ($5, $7, 'sanctuary',  'sanctuary')`,
      [S('live-mode'), S('live-privacy'), S('anon'), S('ordinary'), S('cross-sanctuary'), MEMBER, OTHER],
    );
    await client.query(
      `INSERT INTO maia_sessions (id, member_id, mode, privacy_mode)
       VALUES ($1, $2, 'continuity', 'standard'),
              ($3, NULL, 'continuity', 'standard')`,
      [S('cross-ordinary'), OTHER, S('anon-ordinary')],
    );
    await client.query(
      `INSERT INTO member_sessions (member_id, session_id, mode)
       VALUES ($1::uuid, $3, 'sanctuary'),
              ($2::uuid, $4, 'sanctuary')`,
      [MEMBER, OTHER, S('finalized'), S('cross-sanctuary')],
    );

    for (const c of CASES) {
      const r = await client.query(GUARD_SQL, [c.sessionId, c.memberId]);
      const got = {
        owned: r.rows[0]?.owned === true,
        sanctuary: r.rows[0]?.is_sanctuary === true,
      };
      if (got.owned === c.expect.owned && got.sanctuary === c.expect.sanctuary) {
        console.log(`✅ PASS  ${c.label}`);
      } else {
        console.log(
          `❌ FAIL  ${c.label}  (expected owned=${c.expect.owned}/sanctuary=${c.expect.sanctuary}, ` +
            `got owned=${got.owned}/sanctuary=${got.sanctuary})`,
        );
        failed++;
      }
    }
  } finally {
    // ALWAYS roll back — this script must leave zero residue.
    await client.query('ROLLBACK').catch(() => {});
    await client.end();
  }

  console.log(
    failed === 0
      ? `\n✅ ${CASES.length} passed · guard SQL semantics verified against real schema (rolled back)`
      : `\n❌ ${failed} of ${CASES.length} failed`,
  );
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error('❌ verify script error:', e instanceof Error ? e.message : e);
  process.exit(1);
});
