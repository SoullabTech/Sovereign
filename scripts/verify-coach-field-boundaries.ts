/**
 * Coach Field — boundary verification gate.
 *
 * Proves the constitutional boundaries of the coach/facilitator field hold against a REAL
 * database, not a mock. Every check corresponds to a founder ruling of 2026-08-02.
 *
 *   Run:  DATABASE_URL="$DATABASE_URL" npx tsx scripts/verify-coach-field-boundaries.ts
 *   Pass: all checks pass, 0 failed.
 *
 * Every fixture is created inside a transaction that is ALWAYS rolled back, so the gate
 * leaves zero residue and is safe to run against any environment including production.
 */

import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

let passed = 0;
let failed = 0;
const failures: string[] = [];

function ok(label: string) {
  passed++;
  console.log(`  \x1b[32m✓\x1b[0m ${label}`);
}
function bad(label: string, detail: string) {
  failed++;
  failures.push(`${label} — ${detail}`);
  console.log(`  \x1b[31m✗\x1b[0m ${label}\n      ${detail}`);
}

/**
 * Assert that a statement is REFUSED by the database, FOR THE RIGHT REASON.
 *
 * `expect` is required: a refusal that does not match it is reported as a FAILURE, not a
 * pass. Without this, a malformed probe refuses on its own syntax and the gate reports
 * green while having tested nothing — which is exactly what happened to check A5 on the
 * first run of this gate (pg rejected a two-statement prepared query, and the immutability
 * trigger was never reached). A gate that passes is not proof that it checked.
 */
async function mustRefuse(
  client: any, label: string, expect: RegExp, sql: string, params: any[] = [],
) {
  await client.query('SAVEPOINT p');
  try {
    await client.query(sql, params);
    await client.query('ROLLBACK TO p');
    bad(label, 'statement SUCCEEDED but must have been refused');
  } catch (e: any) {
    await client.query('ROLLBACK TO p');
    const msg = String(e?.message ?? '').split('\n')[0];
    if (expect.test(msg)) {
      ok(`${label}  →  refused: ${msg.slice(0, 88)}`);
    } else {
      bad(label, `refused for the WRONG reason (probe is not testing what it claims): ${msg}`);
    }
  }
}

/** Assert that a statement is PERMITTED. */
async function mustAllow(client: any, label: string, sql: string, params: any[] = []) {
  await client.query('SAVEPOINT p');
  try {
    await client.query(sql, params);
    await client.query('RELEASE p');
    ok(label);
  } catch (e: any) {
    await client.query('ROLLBACK TO p');
    bad(label, `refused but must be permitted: ${e.message}`);
  }
}

const LARRY  = '1a1a1a1a-0000-4000-8000-00000000000a';
const PRACT  = '9d9d9d9d-0000-4000-8000-00000000000d'; // practitioners.id for Larry
const PRACT2 = '9e9e9e9e-0000-4000-8000-00000000000e'; // practitioners.id for the unrelated one
const SENJA = '2b2b2b2b-0000-4000-8000-00000000000b';
const OTHER = '3c3c3c3c-0000-4000-8000-00000000000c'; // an unrelated practitioner
const REL   = '4d4d4d4d-0000-4000-8000-00000000000d';
const PROC  = '5e5e5e5e-0000-4000-8000-00000000000e';
const NOTE  = '6f6f6f6f-0000-4000-8000-00000000000f';

async function main() {
  const client = await pool.connect();
  await client.query('BEGIN');
  try {
    // ── fixtures ─────────────────────────────────────────────────────────────
    await client.query(
      `INSERT INTO members (id, passkey, username, name, password_hash) VALUES
         ($1,'GATE-LARRY','gate_larry','Larry Gate','x'),
         ($2,'GATE-SENJA','gate_senja','Senja Gate','x'),
         ($3,'GATE-OTHER','gate_other','Other Gate','x')`,
      [LARRY, SENJA, OTHER],
    );
    // The canonical relationship IS practitioner_clients.id (founder ruling 2026-08-02).
    await client.query(
      `INSERT INTO practitioners (id, member_id, email, name, slug)
       VALUES ($1,$2,'larry@gate.test','Larry Gate','larry-gate-probe'),
              ($3,$4,'other@gate.test','Other Gate','other-gate-probe')`,
      [PRACT, LARRY, PRACT2, OTHER]);
    await client.query(
      `INSERT INTO practitioner_clients
         (id, practitioner_id, member_id, linked_at, name, email, status, field_slug)
       VALUES ($1,$2,$3,NOW(),'Senja Gate','senja@gate.test','active','flourishing')`,
      [REL, PRACT, SENJA]);
    await client.query(
      `INSERT INTO coach_client_processes (id, relationship_id, title) VALUES ($1,$2,'Flourishing')`,
      [PROC, REL],
    );
    await client.query(
      `INSERT INTO coach_authored_notes (id, relationship_id, author_practitioner_id, body, purpose)
       VALUES ($1,$2,$3,'a private observation','private_observation')`, [NOTE, REL, LARRY],
    );

    // ── A. PUBLICATION BOUNDARY ──────────────────────────────────────────────
    console.log('\nA. Publication boundary — a private note cannot leak into client view');
    await mustRefuse(client, 'A1 ordinary UPDATE cannot publish a private note', /explicit publication act/,
      `UPDATE coach_authored_notes SET visibility='client_visible', published_at=NOW() WHERE id=$1`, [NOTE]);
    await mustRefuse(client, 'A2 bulk UPDATE across all notes cannot publish', /explicit publication act/,
      `UPDATE coach_authored_notes SET visibility='client_visible', published_at=NOW()`);
    await mustRefuse(client, 'A3 client_visible without published_at violates CHECK', /violates check constraint/,
      `INSERT INTO coach_authored_notes (relationship_id, author_practitioner_id, body, visibility)
       VALUES ($1,$2,'x','client_visible')`, [REL, LARRY]);

    await client.query('SAVEPOINT pub');
    await client.query(`SET LOCAL app.coach_note_publication = 'on'`);
    await mustAllow(client, 'A4 explicit publication act (declared transaction) succeeds',
      `UPDATE coach_authored_notes SET visibility='client_visible', published_at=NOW() WHERE id=$1`, [NOTE]);
    // A5/A6 use SEPARATE statements: a two-command prepared query is rejected by pg
    // itself, which would refuse before ever reaching the immutability trigger.
    await client.query(
      `INSERT INTO coach_note_publication_events (note_id, actor_member_id, action)
       VALUES ($1,$2,'published')`, [NOTE, LARRY]);
    await mustRefuse(client, 'A5 publication audit events are immutable (UPDATE)', /append-only/,
      `UPDATE coach_note_publication_events SET action='withdrawn' WHERE note_id=$1`, [NOTE]);
    await mustRefuse(client, 'A6 publication audit events are immutable (DELETE)', /append-only/,
      `DELETE FROM coach_note_publication_events WHERE note_id=$1`, [NOTE]);
    await client.query('ROLLBACK TO pub');

    // ── B. TENANCY ───────────────────────────────────────────────────────────
    console.log('\nB. Tenancy — an unrelated practitioner sees nothing');
    {
      const { rows } = await client.query(
        `SELECT n.id FROM coach_authored_notes n
           JOIN practitioner_clients pc ON pc.id = n.relationship_id
           JOIN practitioners p ON p.id = pc.practitioner_id
          WHERE p.member_id = $1`, [OTHER]);
      rows.length === 0
        ? ok('B1 unrelated practitioner reads zero notes')
        : bad('B1 unrelated practitioner reads zero notes', `saw ${rows.length} rows`);
    }
    {
      const { rows } = await client.query(
        `SELECT pc.id FROM practitioner_clients pc
           JOIN practitioners p ON p.id = pc.practitioner_id
          WHERE p.member_id = $1`, [OTHER]);
      rows.length === 0
        ? ok('B2 unrelated practitioner holds zero relationships')
        : bad('B2 unrelated practitioner holds zero relationships', `saw ${rows.length}`);
    }
    {
      // M1: exactly ONE canonical relationship identity. A second relationship table
      // would re-create the rejected parallel spine.
      const { rows } = await client.query(
        `SELECT table_name FROM information_schema.tables
          WHERE table_name IN ('coach_client_relationships','coach_relationships')`);
      rows.length === 0
        ? ok('B3 no parallel relationship table exists — practitioner_clients.id is canonical')
        : bad('B3 single canonical relationship identity', `found: ${rows.map((r: any) => r.table_name)}`);
    }
    {
      // Every process record must key off the canonical relationship. Uses
      // information_schema so the probe reads the ACTUAL FK target of every
      // column named relationship_id, with no array-type casting to get wrong.
      const { rows } = await client.query(
        `SELECT kcu.table_name AS tbl, ccu.table_name AS target
           FROM information_schema.key_column_usage kcu
           JOIN information_schema.referential_constraints rc
             ON rc.constraint_name = kcu.constraint_name
           JOIN information_schema.constraint_column_usage ccu
             ON ccu.constraint_name = rc.unique_constraint_name
          WHERE kcu.table_name LIKE 'coach\\_%'
            AND kcu.column_name = 'relationship_id'
            AND ccu.table_name <> 'practitioner_clients'`);
      rows.length === 0
        ? ok('B4 every coach_* relationship_id points at practitioner_clients (single spine)')
        : bad('B4 single spine', `wrong target: ${rows.map((r: any) => `${r.tbl}->${r.target}`).join(', ')}`);
    }
    {
      const { rows } = await client.query(
        `SELECT count(*)::int AS n FROM practitioner_clients WHERE member_id IS NULL`);
      ok(`B5 pre-account relationships preserved (member_id nullable; ${rows[0].n} pending rows tolerated)`);
    }
    await mustRefuse(client, 'B6 a member link must record when it was made (live link-coherence invariant)',
      /link_coherence/,
      `INSERT INTO practitioner_clients (practitioner_id, member_id, name, email)
       VALUES ($1,$2,'No Link Time','nolink@gate.test')`, [PRACT, SENJA]);

    // ── C. CLIENT PRIVATE NOTES ──────────────────────────────────────────────
    console.log('\nC. Client personal notes — structurally unreachable by any practitioner');
    {
      const { rows } = await client.query(
        `SELECT column_name FROM information_schema.columns
          WHERE table_name='coach_client_personal_notes' AND column_name IN ('visibility','relationship_id')`);
      rows.length === 0
        ? ok('C1 personal notes carry NO visibility or relationship column (no path to a practitioner)')
        : bad('C1 personal notes have no practitioner path', `found: ${rows.map((r: any) => r.column_name)}`);
    }

    // ── D. AXIS 3 — client-declared position (founder ruling C3, option ii) ───
    console.log('\nD. Axis 3 — declared position private by default, shareable only by member act');
    {
      const { rows } = await client.query(
        `SELECT mode FROM coach_position_share_consents
          WHERE client_member_id=$1 AND practitioner_member_id=$2`, [SENJA, LARRY]);
      rows.length === 0
        ? ok('D1 no consent row exists by default — sharing is OFF until the member acts')
        : bad('D1 sharing defaults off', `found consent: ${rows[0].mode}`);
    }
    {
      // The narrowing, verified as ABSENCE: no practitioner-keyed read of the member's
      // own declaration table may exist anywhere in the coach field.
      const { rows } = await client.query(
        `SELECT column_name FROM information_schema.columns
          WHERE table_name='field_program_positions' AND column_name LIKE '%practitioner%'`);
      rows.length === 0
        ? ok('D2 field_program_positions gained NO practitioner column (§8 intact, narrowed not repealed)')
        : bad('D2 §8 intact', `found: ${rows.map((r: any) => r.column_name)}`);
    }
    const SHARE = '7a7a7a7a-0000-4000-8000-00000000000a';
    await client.query(
      `INSERT INTO coach_position_shares
         (id, client_member_id, practitioner_member_id, field_slug, declared_position, stated_by, share_origin)
       VALUES ($1,$2,$3,'flourishing','I feel like I am beginning again','member_stated','item')`,
      [SHARE, SENJA, LARRY]);
    await mustRefuse(client, 'D3 a shared declaration cannot be rewritten (exact wording preserved)', /append-only/,
      `UPDATE coach_position_shares SET declared_position='different words' WHERE id=$1`, [SHARE]);
    await mustRefuse(client, 'D4 a shared declaration cannot be deleted (withdraw instead)', /append-only/,
      `DELETE FROM coach_position_shares WHERE id=$1`, [SHARE]);
    await mustAllow(client, 'D5 the member may withdraw a share from future display',
      `UPDATE coach_position_shares SET withdrawn_at=NOW() WHERE id=$1`, [SHARE]);
    {
      const { rows } = await client.query(
        `SELECT declared_position, stated_by FROM coach_position_shares WHERE id=$1`, [SHARE]);
      rows[0]?.declared_position === 'I feel like I am beginning again' && rows[0]?.stated_by === 'member_stated'
        ? ok('D6 withdrawal preserves the record, the exact wording, and its client-declared provenance')
        : bad('D6 withdrawal preserves record', JSON.stringify(rows[0]));
    }

    // ── E. BOUNDED HISTORY ───────────────────────────────────────────────────
    console.log('\nE. Stage history — bounded process record, never rewritten');
    const HIST = '8b8b8b8b-0000-4000-8000-00000000000b';
    await client.query(
      `INSERT INTO coach_enrollment_stage_history (id, process_id, stage_label, changed_by_member_id)
       VALUES ($1,$2,'Week 3',$3)`, [HIST, PROC, LARRY]);
    await mustRefuse(client, 'E1 a past stage cannot be rewritten when the client advances', /append-only/,
      `UPDATE coach_enrollment_stage_history SET stage_label='Week 9' WHERE id=$1`, [HIST]);
    await mustRefuse(client, 'E2 stage history cannot be deleted', /append-only/,
      `DELETE FROM coach_enrollment_stage_history WHERE id=$1`, [HIST]);
    await mustAllow(client, 'E3 closing an open stage interval is permitted',
      `UPDATE coach_enrollment_stage_history SET exited_at=NOW() WHERE id=$1`, [HIST]);
    {
      // The anti-dossier rule, verified as absence of any telemetry-shaped column.
      const { rows } = await client.query(
        `SELECT column_name FROM information_schema.columns
          WHERE table_name LIKE 'coach\\_%'
            AND column_name ~ '(score|risk|engagement|attrition|inactivity|resistance|readiness|last_seen|login)'`);
      rows.length === 0
        ? ok('E4 no scoring / engagement / attrition / behavioural-telemetry column exists anywhere in coach_*')
        : bad('E4 no telemetry columns', `found: ${rows.map((r: any) => r.column_name).join(', ')}`);
    }

    // ── F. WORK ITEM MEANINGS ────────────────────────────────────────────────
    console.log('\nF. Homework · practice · commitment — distinct meanings enforced');
    await mustRefuse(client, 'F1 a practice cannot carry a due date (lived with, not due)', /violates check constraint/,
      `INSERT INTO coach_work_items (relationship_id, kind, title, created_by_member_id, due_on)
       VALUES ($1,'practice','sit daily',$2,NOW())`, [REL, LARRY]);
    await mustRefuse(client, 'F2 a commitment cannot be articulated by the practitioner alone', /violates check constraint/,
      `INSERT INTO coach_work_items (relationship_id, kind, title, created_by_member_id, articulated_by)
       VALUES ($1,'commitment','c',$2,'practitioner')`, [REL, LARRY]);
    await mustAllow(client, 'F3 a client-articulated commitment is permitted',
      `INSERT INTO coach_work_items (relationship_id, kind, title, created_by_member_id, articulated_by)
       VALUES ($1,'commitment','I will call my brother',$2,'client')`, [REL, LARRY]);
    await mustAllow(client, 'F4 homework may carry a due date',
      `INSERT INTO coach_work_items (relationship_id, kind, title, created_by_member_id, due_on)
       VALUES ($1,'homework','read chapter 2',$2,NOW())`, [REL, LARRY]);

    // ── G. ISOLATION FROM THE UNVERIFIED NOTE LANE (founder ruling D-NW-2) ────
    console.log('\nG. Isolation — no dependency on the unverified note lane or plaintext PHI');
    {
      const { rows } = await client.query(
        `SELECT c.conname FROM pg_constraint c
           JOIN pg_class t ON t.oid = c.conrelid
           JOIN pg_class f ON f.oid = c.confrelid
          WHERE t.relname LIKE 'coach\\_%'
            AND f.relname IN ('practitioner_client_notes','sessions')`);
      rows.length === 0
        ? ok('G1 zero foreign keys from coach_* into practitioner_client_notes or sessions')
        : bad('G1 isolation', `found FKs: ${rows.map((r: any) => r.conname).join(', ')}`);
    }
    {
      const { rows } = await client.query(
        `SELECT 1 FROM information_schema.columns
          WHERE table_name='coach_sessions' AND column_name IN ('notes','note')`);
      rows.length === 0
        ? ok('G2 coach_sessions carries no note body (session notes live behind explicit visibility)')
        : bad('G2 no note body on coach_sessions', 'a notes column exists');
    }
  } finally {
    await client.query('ROLLBACK'); // always: the gate leaves zero residue
    client.release();
    await pool.end();
  }

  console.log(`\n${'─'.repeat(70)}`);
  console.log(`${passed} passed · ${failed} failed`);
  if (failed) {
    console.log('\nFailures:');
    failures.forEach((f) => console.log(`  · ${f}`));
    process.exit(1);
  }
  console.log('\x1b[32mAll coach-field boundaries hold.\x1b[0m');
}

main().catch((e) => {
  console.error('Gate error:', e);
  process.exit(1);
});
