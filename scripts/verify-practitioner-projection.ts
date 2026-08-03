/**
 * Practitioner projection — boundary verification.
 *
 * The governing question, made executable:
 *
 *     What can Larry see about a client, and what is structurally impossible
 *     for him to see?
 *
 * The proof here is not the presence of data. It is the ABSENCE of client-owned
 * material from a projection built while that material demonstrably exists in
 * the database. Every forbidden assertion plants real sovereign data first —
 * an absence test over an empty table proves nothing about the boundary, only
 * that the fixture was empty.
 *
 * Run:  DATABASE_URL=... npx tsx scripts/verify-practitioner-projection.ts
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { query, closePool } from '@/lib/db/postgres';
import { asMemberId, asRelationshipId } from '@/lib/coachField/identity';
import {
  getPractitionerClientProjection,
  listPractitionerRelationships,
} from '@/lib/coachField/practitionerProjection';

/**
 * CLIENT SOVEREIGN FIELD — the roster lives HERE, not in the module under test.
 *
 * The subject of a boundary test must not carry the list of things it may not
 * touch: naming them is itself a reference, and the repository's member-owned
 * boundary harness flags it as a reader — rightly. Holding the roster in the
 * verifier keeps the module clean enough to pass that harness while still being
 * checked against the full list.
 */
const CLIENT_SOVEREIGN_UNREACHABLE = [
  'coach_client_selected_focus',
  'coach_client_personal_notes',
  'coach_current_focus',
  'member_field_note_threads',
  'member_field_note_events',
  'member_memory_atoms',
  'member_reflections',
  'member_daily_anchors',
  'reflection_capsules',
  'encounter_reflections',
  'breakthrough_moments',
] as const;

const TAG = 'projgate';
let passed = 0;
let failed = 0;

function expect(name: string, ok: boolean, detail = '') {
  if (ok) {
    passed++;
    console.log(`  ✅ ${name}`);
  } else {
    failed++;
    console.log(`  ❌ ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

/** Every string key appearing anywhere in a nested object. */
function deepKeys(v: unknown, acc = new Set<string>()): Set<string> {
  if (Array.isArray(v)) v.forEach((x) => deepKeys(x, acc));
  else if (v && typeof v === 'object') {
    for (const [k, val] of Object.entries(v)) {
      acc.add(k.toLowerCase());
      deepKeys(val, acc);
    }
  }
  return acc;
}

async function cleanup() {
  await query(
    `DELETE FROM coach_client_processes WHERE relationship_id IN
       (SELECT id FROM practitioner_clients WHERE email LIKE $1)`, [`${TAG}-%`]);
  await query(
    `DELETE FROM coach_program_definitions WHERE owner_practitioner_id IN
       (SELECT id FROM practitioners WHERE slug LIKE $1)`, [`${TAG}-%`]);
  await query(`DELETE FROM practitioner_clients WHERE email LIKE $1`, [`${TAG}-%`]);
  await query(`DELETE FROM practitioners WHERE slug LIKE $1`, [`${TAG}-%`]);
  await query(`DELETE FROM members WHERE username LIKE $1`, [`${TAG}-%`]);
}

async function main() {
  await cleanup();

  // ── fixtures: Larry, Maya, and one shared piece of work ──────────────────
  const mkMember = async (suffix: string, name: string) => {
    const { rows } = await query<{ id: string }>(
      `INSERT INTO members (passkey, username, password_hash, email, name)
       VALUES ($1,$1,'x',$2,$3) RETURNING id`,
      [`${TAG}-${suffix}`, `${TAG}-${suffix}@test.local`, name]
    );
    return rows[0].id;
  };

  const larryMember = await mkMember('larry', 'Larry');
  const mayaMember = await mkMember('maya', 'Maya');
  const otherMember = await mkMember('other', 'Unrelated Practitioner');

  const { rows: pr } = await query<{ id: string }>(
    `INSERT INTO practitioners (member_id, name, email, slug)
     VALUES ($1,$2,$3,$4) RETURNING id`,
    [larryMember, `${TAG} Practice`, `${TAG}-prac@test.local`, `${TAG}-practice`]
  );
  const larryRecord = pr[0].id;

  const { rows: op } = await query<{ id: string }>(
    `INSERT INTO practitioners (member_id, name, email, slug)
     VALUES ($1,$2,$3,$4) RETURNING id`,
    [otherMember, `${TAG} Other`, `${TAG}-other@test.local`, `${TAG}-other`]
  );
  const otherRecord = op[0].id;

  const { rows: rc } = await query<{ id: string }>(
    `INSERT INTO practitioner_clients
       (practitioner_id, name, email, member_id, relationship_status, linked_at)
     VALUES ($1,'Maya',$2,$3,'active',NOW()) RETURNING id`,
    [larryRecord, `${TAG}-maya@test.local`, mayaMember]
  );
  const relId = rc[0].id;

  const { rows: prog } = await query<{ id: string }>(
    `INSERT INTO coach_program_definitions (owner_practitioner_id, title, description, kind)
     VALUES ($1,'Leadership transition','A programme about stepping into a larger role','coaching')
     RETURNING id`, [larryRecord]);
  const { rows: stage } = await query<{ id: string }>(
    `INSERT INTO coach_program_stages (program_definition_id, label, position)
     VALUES ($1,'Exploring',1) RETURNING id`, [prog[0].id]);
  const { rows: proc } = await query<{ id: string }>(
    `INSERT INTO coach_client_processes (relationship_id, program_definition_id)
     VALUES ($1,$2) RETURNING id`, [relId, prog[0].id]);
  await query(
    `INSERT INTO coach_program_enrollments
       (process_id, program_definition_id, current_stage_id, enrolled_by_practitioner_id)
     VALUES ($1,$2,$3,$4)`, [proc[0].id, prog[0].id, stage[0].id, larryRecord]);

  // ── plant REAL client-sovereign material ─────────────────────────────────
  // Maya declares her attention. This row exists for every forbidden assertion
  // below; without it, "focus did not appear" would be a vacuous pass.
  await query(
    `INSERT INTO coach_client_selected_focus (client_member_id, process_id)
     VALUES ($1,$2)`, [mayaMember, proc[0].id]);
  const { rows: focusCheck } = await query<{ n: string }>(
    `SELECT count(*) n FROM coach_client_selected_focus WHERE client_member_id = $1`,
    [mayaMember]);

  console.log('\n0  the instrument can see the object it is about to assert is absent');
  expect('0a Maya HAS a selected focus in the database',
    Number(focusCheck[0].n) === 1, `found ${focusCheck[0].n}`);

  // ── 1  allowed path ──────────────────────────────────────────────────────
  console.log('\n1  allowed path — what Larry CAN see');
  const proj = await getPractitionerClientProjection(asMemberId(larryMember), asRelationshipId(relId));
  expect('1a a projection is returned', proj !== null);
  expect('1b the relationship is visible', proj?.relationship.status === 'active');
  expect('1c the client is identified once linked', proj?.client?.memberId === mayaMember);
  expect('1d shared work is visible', (proj?.sharedWork.length ?? 0) === 1);
  expect('1e the programme title is visible',
    proj?.sharedWork[0]?.program.title === 'Leadership transition',
    JSON.stringify(proj?.sharedWork[0]?.program));
  expect('1f the stage Larry placed is visible',
    proj?.sharedWork[0]?.stage?.label === 'Exploring');
  const rels = await listPractitionerRelationships(asMemberId(larryMember));
  expect('1g Larry finds his caseload without naming a practitioner_id',
    rels.length === 1 && rels[0].relationshipId === relId);

  // ── 2  forbidden path ────────────────────────────────────────────────────
  console.log('\n2  forbidden path — what is structurally impossible');
  const keys = deepKeys(proj);
  const FORBIDDEN_KEY_FRAGMENTS = [
    'focus', 'reflection', 'atom', 'anchor', 'journal', 'capsule',
    'note', 'moment', 'private', 'inner', 'maia', 'conversation',
  ];
  const leaked = FORBIDDEN_KEY_FRAGMENTS.filter((f) =>
    [...keys].some((k) => k.includes(f)));
  expect('2a no client-owned key appears anywhere in the projection',
    leaked.length === 0, `leaked: ${leaked.join(', ')}`);
  expect('2b Maya\'s focus exists but is absent from the projection',
    !JSON.stringify(proj).toLowerCase().includes('focus'));

  // Source-level: the module cannot reach what it never names.
  const src = readFileSync(
    join(process.cwd(), 'lib/coachField/practitionerProjection.ts'), 'utf8');
  // Strip the declared boundary manifest and comments — naming a table in order
  // to forbid it is not a reference to it.
  // No comment-stripping: the module must not mention these ANYWHERE, including
  // in prose. That is the same rule the member-owned boundary harness applies.
  const named = CLIENT_SOVEREIGN_UNREACHABLE.filter((t) => src.includes(t));
  expect('2c the module names no client-sovereign table, in code or in comment',
    named.length === 0, `names: ${named.join(', ')}`);

  // ── 3  authorization boundary ────────────────────────────────────────────
  console.log('\n3  authorization boundary');
  const asOther = await getPractitionerClientProjection(
    asMemberId(otherMember), asRelationshipId(relId));
  expect('3a an unrelated practitioner gets null, not a partial view', asOther === null);
  const otherRels = await listPractitionerRelationships(asMemberId(otherMember));
  expect('3b an unrelated practitioner sees no caseload', otherRels.length === 0);
  const asClient = await getPractitionerClientProjection(
    asMemberId(mayaMember), asRelationshipId(relId));
  expect('3c the client does not receive the practitioner\'s projection', asClient === null);

  await query(
    `UPDATE practitioner_clients
        SET relationship_status='ended', relationship_ended_at=NOW() WHERE id=$1`, [relId]);
  const ended = await getPractitionerClientProjection(
    asMemberId(larryMember), asRelationshipId(relId));
  expect('3d ending the relationship revokes the projection', ended === null);
  const endedRels = await listPractitionerRelationships(asMemberId(larryMember));
  expect('3e an ended relationship leaves the caseload', endedRels.length === 0);
  await query(
    `UPDATE practitioner_clients
        SET relationship_status='active', relationship_ended_at=NULL WHERE id=$1`, [relId]);

  // ── 4  negative self-test — is the instrument alive? ─────────────────────
  // A harness that cannot fail is not evidence. Plant a forbidden reference in
  // the same shape the 2c check inspects and confirm 2c would catch it.
  console.log('\n4  negative self-test (BROKEN/REPAIRED A/B)');
  const planted = src + '\nconst leak = await query("SELECT * FROM coach_client_selected_focus");';
  const caught = CLIENT_SOVEREIGN_UNREACHABLE.filter((t) => planted.includes(t));
  expect('4a a planted forbidden reference IS caught by the 2c check',
    caught.length > 0, 'the source check is dead — it cannot fail');
  expect('4b the clean source and the planted source give DIFFERENT results',
    named.length === 0 && caught.length > 0);

  // ── 5  reversibility ─────────────────────────────────────────────────────
  console.log('\n5  reversibility');
  const { rows: mig } = await query<{ n: string }>(
    `SELECT count(*) n FROM information_schema.tables
      WHERE table_schema='public' AND table_name LIKE 'coach\\_%'`);
  expect('5a this lane added no table — removing the module restores prior state',
    Number(mig[0].n) === 10, `${mig[0].n} coach_ tables (expected 10)`);

  await cleanup();
  const { rows: leftover } = await query<{ n: string }>(
    `SELECT count(*) n FROM members WHERE username LIKE $1`, [`${TAG}-%`]);
  expect('cleanup leaves no fixtures behind', Number(leftover[0].n) === 0);

  console.log(`\n${passed} passed · ${failed} failed`);
  console.log(failed === 0
    ? '\nPRACTITIONER PROJECTION BOUNDARY — ALL PASSED'
    : '\nBOUNDARY NOT ESTABLISHED');
  await closePool();
  process.exit(failed === 0 ? 0 : 1);
}

main().catch(async (e) => {
  console.error(e);
  await cleanup().catch(() => {});
  await closePool();
  process.exit(1);
});
