/**
 * Slice 0 — trust-boundary demonstration.
 *
 * Authorized 2026-08-03 as a TRUST-BOUNDARY DEMONSTRATION ONLY. This is not
 * Practice Workspace v1, not a Client Home slice, not a UI, and not a schema
 * change. It uses existing substrate only.
 *
 * It demonstrates the NEGATIVE CAPABILITY:
 *   1. A practitioner CAN support the relationship.
 *   2. A practitioner CANNOT reach client-owned reflective material.
 *   3. That absence is STRUCTURAL — there is no code path — not a UI that
 *      declines to render.
 *
 * (3) is the load-bearing claim, and it is why this file contains a static
 * pass as well as a runtime one. A runtime test can only show that the paths
 * it happened to call returned nothing. Structural absence is a claim about
 * paths that do not exist, so it must be checked against the source.
 *
 * Run:  npx tsx scripts/verify-slice0-trust-boundary.ts
 *       TEST_PG_ADMIN_URL=postgresql://user@host:5432/postgres npx tsx ...
 */

import { execSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { Client } from 'pg';

const ADMIN_URL = process.env.TEST_PG_ADMIN_URL ?? 'postgresql://soullab@localhost:5432/postgres';
const TEST_DB = `maia_slice0_trust_${process.pid}`;
const TEST_URL = `${ADMIN_URL.slice(0, ADMIN_URL.lastIndexOf('/'))}/${TEST_DB}`;
const REPO = join(__dirname, '..');

let pass = 0;
let fail = 0;
const ok = (m: string) => { pass++; console.log(`  ✓ ${m}`); };
const bad = (m: string) => { fail++; console.log(`  ✗ ${m}`); };
const check = (m: string, expected: unknown, actual: unknown) =>
  expected === actual ? ok(m) : bad(`${m} — expected [${String(expected)}], got [${String(actual)}]`);

/** Client-owned reflective material. Nothing practitioner-scoped may reach these. */
const CLIENT_OWNED_REFLECTIVE = ['member_daily_anchors', 'memory_atoms', 'journal_entries'];

/** Modules a practitioner credential can reach. */
const PRACTITIONER_SURFACE = ['lib/coachField', 'lib/practitioner'];

// ────────────────────────────────────────────────────────────────────────────
// STATIC PASS — structural absence
// ────────────────────────────────────────────────────────────────────────────
// Absence of access cannot be proven by calling functions and getting nothing
// back; that only shows the paths you called. This asserts the stronger claim:
// no practitioner-reachable module mentions a client-owned reflective table at
// all, so there is no path to harden, disable, or accidentally re-enable.
function staticPass() {
  console.log('\nS — structural: no practitioner-reachable module references client-owned reflective tables');
  const files: string[] = [];
  const walk = (dir: string) => {
    let entries;
    try { entries = readdirSync(join(REPO, dir), { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      const rel = `${dir}/${e.name}`;
      if (e.isDirectory()) walk(rel);
      else if (e.name.endsWith('.ts') && !e.name.endsWith('.test.ts')) files.push(rel);
    }
  };
  PRACTITIONER_SURFACE.forEach(walk);
  check('practitioner surface modules found', true, files.length > 0);

  for (const table of CLIENT_OWNED_REFLECTIVE) {
    const offenders = files.filter((f) => readFileSync(join(REPO, f), 'utf8').includes(table));
    if (offenders.length === 0) ok(`no practitioner-reachable module references \`${table}\``);
    else bad(`\`${table}\` referenced by: ${offenders.join(', ')}`);
  }
}

// ────────────────────────────────────────────────────────────────────────────
// RUNTIME PASS — the seam's own leak properties
// ────────────────────────────────────────────────────────────────────────────
async function runtimePass() {
  const admin = new Client({ connectionString: ADMIN_URL });
  await admin.connect();
  await admin.query(`DROP DATABASE IF EXISTS ${TEST_DB}`);
  await admin.query(`CREATE DATABASE ${TEST_DB}`);
  await admin.end();

  const db = new Client({ connectionString: TEST_URL });
  await db.connect();
  try {
    // Minimum real shape — only what the seam joins. No new schema is defined here.
    await db.query(`
      CREATE TABLE members (id UUID PRIMARY KEY DEFAULT gen_random_uuid());
      CREATE TABLE practitioners (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), member_id UUID REFERENCES members(id));
      CREATE TABLE practitioner_clients (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        practitioner_id UUID NOT NULL REFERENCES practitioners(id),
        member_id UUID REFERENCES members(id),
        relationship_status TEXT NOT NULL DEFAULT 'pending'
      );
      CREATE TABLE member_daily_anchors (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        member_id UUID NOT NULL REFERENCES members(id),
        body TEXT NOT NULL,
        surface_preference TEXT NOT NULL DEFAULT 'member_pulled'
      );
    `);

    const larry = (await db.query(`INSERT INTO members DEFAULT VALUES RETURNING id`)).rows[0].id;
    const client = (await db.query(`INSERT INTO members DEFAULT VALUES RETURNING id`)).rows[0].id;
    const stranger = (await db.query(`INSERT INTO members DEFAULT VALUES RETURNING id`)).rows[0].id;
    const prac = (await db.query(`INSERT INTO practitioners (member_id) VALUES ($1) RETURNING id`, [larry])).rows[0].id;
    const rel = (await db.query(
      `INSERT INTO practitioner_clients (practitioner_id, member_id, relationship_status)
       VALUES ($1,$2,'active') RETURNING id`, [prac, client])).rows[0].id;
    // Client-owned reflective material, at its default (private) preference.
    await db.query(`INSERT INTO member_daily_anchors (member_id, body) VALUES ($1,'private reflection')`, [client]);

    // The seam, inlined verbatim from lib/coachField/identity.ts so this script
    // has no import-graph dependency on Next.js runtime config.
    const authorize = async (actorMemberId: string, relationshipId: string) => {
      const { rows } = await db.query(
        `SELECT pc.id, pc.practitioner_id, pc.member_id, pc.relationship_status,
                p.member_id AS practitioner_member_id
           FROM practitioner_clients pc JOIN practitioners p ON p.id = pc.practitioner_id
          WHERE pc.id = $1`, [relationshipId]);
      if (rows.length === 0) return null;
      const r = rows[0];
      let role: string;
      if (r.practitioner_member_id && r.practitioner_member_id === actorMemberId) role = 'practitioner';
      else if (r.member_id && r.member_id === actorMemberId) role = 'client';
      else return null;
      const live = r.relationship_status === 'active' || r.relationship_status === 'paused';
      return {
        role,
        status: r.relationship_status,
        canWrite: r.relationship_status === 'active',
        canReadMemberShared: live && r.member_id !== null,
      };
    };

    console.log('\nR1 — the practitioner CAN support the relationship');
    const asLarry = await authorize(larry, rel);
    check('Larry is recognised as practitioner', 'practitioner', asLarry?.role);
    check('Larry may write practice records', true, asLarry?.canWrite);

    console.log('\nR2 — the client holds their own side');
    const asClient = await authorize(client, rel);
    check('client is recognised as client', 'client', asClient?.role);

    console.log('\nR3 — a stranger gets NULL, not an error (no existence leak)');
    const asStranger = await authorize(stranger, rel);
    check('stranger receives null', null, asStranger);
    const asMissing = await authorize(larry, '00000000-0000-0000-0000-000000000000');
    check('non-existent relationship ALSO receives null', null, asMissing);
    // The two are indistinguishable, so a caller cannot probe for existence.
    check('"not yours" and "does not exist" are indistinguishable', asStranger, asMissing);

    console.log('\nR4 — a pending relationship is not a peephole');
    const pend = (await db.query(
      `INSERT INTO practitioner_clients (practitioner_id, member_id, relationship_status)
       VALUES ($1,NULL,'pending') RETURNING id`, [prac])).rows[0].id;
    const asPending = await authorize(larry, pend);
    check('pending grants no member-shared read', false, asPending?.canReadMemberShared);

    console.log('\nR5 — ending revokes present access without deleting history');
    await db.query(`UPDATE practitioner_clients SET relationship_status='ended' WHERE id=$1`, [rel]);
    const asEnded = await authorize(larry, rel);
    check('ended grants no member-shared read', false, asEnded?.canReadMemberShared);
    check('ended grants no write', false, asEnded?.canWrite);
    const survived = (await db.query(`SELECT count(*)::int c FROM member_daily_anchors WHERE member_id=$1`, [client])).rows[0].c;
    check('client material still exists (revoked ≠ deleted)', 1, survived);
    await db.query(`UPDATE practitioner_clients SET relationship_status='active' WHERE id=$1`, [rel]);

    console.log('\nR6 — ABSENCE: the authorization carries no channel to client reflection');
    const auth = await authorize(larry, rel);
    const surface = JSON.stringify(auth);
    // Absence is tested directly, per the named leak channels: an authorization
    // object must not carry counts, timestamps, ordering, or existence signals
    // about material the practitioner may not read.
    for (const leak of ['anchor', 'reflection', 'count', 'last', 'updated', 'body'])
      check(`authorization carries no \`${leak}\` signal`, false, surface.toLowerCase().includes(leak));
    check('authorization exposes exactly 4 fields', 4, Object.keys(auth ?? {}).length);
  } finally {
    await db.end();
    const cleanup = new Client({ connectionString: ADMIN_URL });
    await cleanup.connect();
    await cleanup.query(`DROP DATABASE IF EXISTS ${TEST_DB}`);
    await cleanup.end();
  }
}

(async () => {
  console.log('=== Slice 0 — trust-boundary demonstration ===');
  console.log(`database: ${TEST_DB}`);
  staticPass();
  await runtimePass();
  console.log(`\n=== ${pass} passed · ${fail} failed ===`);
  if (fail > 0) process.exit(1);
})().catch((e) => { console.error(e); process.exit(1); });
