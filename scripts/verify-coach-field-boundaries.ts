/**
 * Coach Field — integrated foundation boundary gate.
 *
 *   DATABASE_URL=... npx tsx scripts/verify-coach-field-boundaries.ts
 *
 * Runs against an ISOLATED database built from committed migrations only. It
 * exercises the services, not just the schema, and every refusal probe asserts the
 * REASON it was refused — a probe that fails for the wrong reason is reported as a
 * failure, because "it threw" is not evidence that the boundary held.
 *
 * Fixtures are tagged and deleted at the end; the run asserts none survive.
 *
 * Covers founder-required integration evidence 4-10 and 12.
 */

import { query, transaction, closePool } from '@/lib/db/postgres';
import {
  asMemberId,
  asRelationshipId,
  authorizePractitionerClientRelationship,
  resolvePractitionerMemberFromRecord,
  resolvePractitionerRecordFromMember,
} from '@/lib/coachField/identity';
import { acceptInvitation, createPendingRelationship } from '@/lib/coachField/invitation';

const TAG = 'cfgate';
let passed = 0;
const failures: string[] = [];

function ok(label: string) {
  passed++;
  console.log(`  ✅ ${label}`);
}
function bad(label: string, detail: string) {
  failures.push(`${label} — ${detail}`);
  console.log(`  ❌ ${label}\n       ${detail}`);
}
function expect(label: string, condition: boolean, detail = 'condition was false') {
  condition ? ok(label) : bad(label, detail);
}

/** A refusal probe: must throw, AND the message must match `reason`. */
async function mustRefuse(label: string, reason: RegExp, fn: () => Promise<unknown>) {
  try {
    await fn();
    bad(label, 'it was ALLOWED — the boundary did not hold');
  } catch (e: any) {
    const msg = String(e?.message ?? '').split('\n')[0];
    if (reason.test(msg)) ok(`${label}`);
    else bad(label, `refused for the WRONG reason: ${msg}`);
  }
}

/** Remove every tagged fixture. Run before AND after, so an aborted run cannot
 *  poison the next one — a gate that only passes on a pristine database is not a gate. */
async function clearFixtures() {
  await transaction(async (c) => {
    // Append-only history refuses DELETE — including a DELETE arriving via cascade.
    // That is the boundary working: a client's history is not removable, and ending a
    // relationship (never deleting it) is the supported path. A TEST HARNESS is the
    // one place that legitimately needs to undo its own fixtures, so it suspends the
    // triggers explicitly and locally. Nothing in the application may do this.
    await c.query(`ALTER TABLE coach_enrollment_stage_history DISABLE TRIGGER coach_stage_history_immutable`);
    await c.query(`ALTER TABLE coach_note_publications DISABLE TRIGGER coach_note_publication_append_only`);
    await c.query(`ALTER TABLE coach_position_shares DISABLE TRIGGER coach_position_shares_append_only`);
    await c.query(`DELETE FROM coach_client_processes WHERE relationship_id IN
      (SELECT id FROM practitioner_clients WHERE email LIKE $1)`, [`${TAG}-%`]);
    await c.query(`DELETE FROM client_invites WHERE code_hash LIKE $1`, [`${TAG}-%`]);
    await c.query(`DELETE FROM practitioner_clients WHERE email LIKE $1`, [`${TAG}-%`]);
    await c.query(`DELETE FROM coach_program_definitions WHERE owner_practitioner_id IN
      (SELECT id FROM practitioners WHERE slug LIKE $1)`, [`${TAG}-%`]);
    await c.query(`DELETE FROM practitioners WHERE slug LIKE $1`, [`${TAG}-%`]);
    await c.query(`DELETE FROM members WHERE username LIKE $1`, [`${TAG}-%`]);
    await c.query(`ALTER TABLE coach_enrollment_stage_history ENABLE TRIGGER coach_stage_history_immutable`);
    await c.query(`ALTER TABLE coach_note_publications ENABLE TRIGGER coach_note_publication_append_only`);
    await c.query(`ALTER TABLE coach_position_shares ENABLE TRIGGER coach_position_shares_append_only`);
  });
}

async function main() {
  console.log('\nCoach Field — integrated foundation boundary gate\n');
  await clearFixtures();

  const mk = async (suffix: string, email: string, verified = true) => {
    const { rows } = await query(
      `INSERT INTO members (passkey, username, password_hash, email, email_verified)
       VALUES ($1,$1,'x',$2,$3) RETURNING id`,
      [`${TAG}-${suffix}`, email, verified]
    );
    return rows[0].id as string;
  };

  const practMember = await mk('prac', `${TAG}-prac@test.local`);
  const client1 = await mk('c1', `${TAG}-c1@test.local`);
  const client2 = await mk('c2', `${TAG}-c2@test.local`);
  const stranger = await mk('str', `${TAG}-str@test.local`);

  const { rows: pr } = await query(
    `INSERT INTO practitioners (member_id, name, email, slug)
     VALUES ($1,$2,$3,$4) RETURNING id`,
    [practMember, `${TAG} Practice`, `${TAG}-prac@test.local`, `${TAG}-practice`]
  );
  const practRecord = pr[0].id as string;

  // ── 8  identity translation is explicit ───────────────────────────────────
  console.log('\n8  practitioner identity translation');
  const resolvedRecord = await resolvePractitionerRecordFromMember(asMemberId(practMember));
  expect('8a member -> practitioner record resolves', resolvedRecord === practRecord,
    `got ${resolvedRecord}, expected ${practRecord}`);
  const backToMember = await resolvePractitionerMemberFromRecord(resolvedRecord!);
  expect('8b practitioner record -> member round-trips', backToMember === practMember,
    `got ${backToMember}`);
  const notAPractitioner = await resolvePractitionerRecordFromMember(asMemberId(client1));
  expect('8c an ordinary member resolves to no practice record', notAPractitioner === null,
    `got ${notAPractitioner}`);
  expect('8d the practice id and the person id are different values',
    practRecord !== practMember, 'they were equal — the fixture cannot prove the distinction');

  // ── 4  a pending invitation works with no member_id ───────────────────────
  console.log('\n4  pending relationship without a member');
  const pending = await createPendingRelationship({
    practitionerRecordId: practRecord,
    invitationEmail: `${TAG}-c1@test.local`,
    displayName: 'Invited One',
    intendedScope: 'program-alpha',
  });
  expect('4a pending relationship created', pending.created, 'expected a new row');
  const { rows: pendRows } = await query(
    `SELECT member_id, relationship_status, normalized_invitation_email
       FROM practitioner_clients WHERE id = $1`, [pending.relationshipId]);
  expect('4b it carries no member_id', pendRows[0].member_id === null, `got ${pendRows[0].member_id}`);
  expect('4c it is pending', pendRows[0].relationship_status === 'pending', pendRows[0].relationship_status);
  expect('4d the invitation email is normalized for matching',
    pendRows[0].normalized_invitation_email === `${TAG}-c1@test.local`.toLowerCase(),
    String(pendRows[0].normalized_invitation_email));

  const again = await createPendingRelationship({
    practitionerRecordId: practRecord,
    invitationEmail: `  ${TAG.toUpperCase()}-C1@TEST.LOCAL `,
    displayName: 'Invited One',
    intendedScope: 'program-alpha',
  });
  expect('4e re-inviting the same person to the same thing finds the SAME pending row',
    !again.created && again.relationshipId === pending.relationshipId,
    `created=${again.created} id=${again.relationshipId}`);

  const pendingAuth = await authorizePractitionerClientRelationship(
    asMemberId(practMember), asRelationshipId(pending.relationshipId));
  expect('4f the practitioner holds the pending relationship', pendingAuth?.role === 'practitioner',
    String(pendingAuth?.role));
  expect('4g a pending relationship grants NO member-shared read',
    pendingAuth?.canReadMemberShared === false, `canReadMemberShared=${pendingAuth?.canReadMemberShared}`);

  // ── 5  claiming an invitation binds the correct member ────────────────────
  console.log('\n5  invitation acceptance');
  await query(
    `INSERT INTO client_invites (practitioner_id, client_id, code_hash, status)
     VALUES ($1,$2,$3,'unused')`,
    [practMember, pending.relationshipId, `${TAG}-code-1`]
  );

  const accepted = await acceptInvitation({
    codeHash: `${TAG}-code-1`,
    acceptingMemberId: asMemberId(client1),
  });
  expect('5a acceptance links the accepting member', accepted.memberId === client1, accepted.memberId);

  const { rows: afterAccept } = await query(
    `SELECT member_id, linked_at, relationship_status FROM practitioner_clients WHERE id=$1`,
    [pending.relationshipId]);
  expect('5b member_id is now bound', afterAccept[0].member_id === client1, String(afterAccept[0].member_id));
  expect('5c linked_at is stamped', afterAccept[0].linked_at !== null, 'linked_at was null');
  expect('5d the relationship activated', afterAccept[0].relationship_status === 'active',
    afterAccept[0].relationship_status);

  const { rows: inviteAfter } = await query(
    `SELECT claimed_by_member_id, status FROM client_invites WHERE code_hash=$1`, [`${TAG}-code-1`]);
  expect('5e invitation provenance is preserved',
    inviteAfter[0].claimed_by_member_id === client1 && inviteAfter[0].status === 'claimed',
    JSON.stringify(inviteAfter[0]));

  await mustRefuse('5f a different member cannot claim a claimed invitation', /already been claimed/,
    () => acceptInvitation({ codeHash: `${TAG}-code-1`, acceptingMemberId: asMemberId(client2) }));

  const reAccept = await acceptInvitation({
    codeHash: `${TAG}-code-1`, acceptingMemberId: asMemberId(client1) });
  expect('5g the same member re-accepting is idempotent', reAccept.alreadyLinked, 'expected alreadyLinked');

  // ── 6  a linked relationship cannot be re-pointed or unlinked ─────────────
  console.log('\n6  the link is permanent');
  await mustRefuse('6a re-pointing at another member is refused', /write-once|cannot be re-pointed/,
    () => query(`UPDATE practitioner_clients SET member_id=$2 WHERE id=$1`,
      [pending.relationshipId, client2]));
  await mustRefuse('6b silent unlinking is refused', /write-once|cannot be re-pointed/,
    () => query(`UPDATE practitioner_clients SET member_id=NULL WHERE id=$1`, [pending.relationshipId]));

  // ── 7  ambiguity is queued, never guessed ────────────────────────────────
  console.log('\n7  ambiguous legacy rows are queued');
  const { rows: amb } = await query(
    `INSERT INTO practitioner_clients (practitioner_id, name, email, invitation_email, relationship_status)
     VALUES ($1,'Ambiguous',$2::varchar,$2::text,'pending') RETURNING id`,
    [practRecord, `${TAG}-dupe@test.local`]);
  await mk('d1', `${TAG}-dupe@test.local`);
  await mk('d2', `${TAG}-dupe@test.local`);
  await query(`SELECT * FROM practitioner_client_reconcile()`);
  const { rows: q } = await query(
    `SELECT r.match_basis, r.auto_linkable, pc.member_id
       FROM practitioner_client_reconciliation r
       JOIN practitioner_clients pc ON pc.id = r.relationship_id
      WHERE r.relationship_id = $1`, [amb[0].id]);
  expect('7a an email matching two members is classified ambiguous',
    q[0]?.match_basis === 'ambiguous_multiple_members', String(q[0]?.match_basis));
  expect('7b it is NOT auto-linkable', q[0]?.auto_linkable === false, String(q[0]?.auto_linkable));
  expect('7c it was left unlinked for a human', q[0]?.member_id === null, String(q[0]?.member_id));

  // ── 9  note publication boundaries ───────────────────────────────────────
  console.log('\n9  private note / publication boundary');
  const { rows: proc } = await query(
    `INSERT INTO coach_client_processes (relationship_id, title) VALUES ($1,'Process') RETURNING id`,
    [pending.relationshipId]);
  const { rows: note } = await query(
    `INSERT INTO coach_authored_notes (relationship_id, process_id, author_practitioner_id, body, purpose)
     VALUES ($1,$2,$3,'private thinking','private_observation') RETURNING id`,
    [pending.relationshipId, proc[0].id, practRecord]);

  const { rows: noteCols } = await query(
    `SELECT column_name FROM information_schema.columns
      WHERE table_name='coach_authored_notes' AND column_name IN ('visibility','published_at')`);
  expect('9a the source note has NO visibility or published flag to toggle',
    noteCols.length === 0, `found ${noteCols.map((c: any) => c.column_name).join(',')}`);

  const { rows: pub } = await query(
    `INSERT INTO coach_note_publications
       (source_note_id, relationship_id, published_by_practitioner_id, published_body_snapshot)
     VALUES ($1,$2,$3,'what the client received') RETURNING id`,
    [note[0].id, pending.relationshipId, practRecord]);

  await query(`UPDATE coach_authored_notes SET body='the practitioner kept thinking' WHERE id=$1`,
    [note[0].id]);
  const { rows: snap } = await query(
    `SELECT published_body_snapshot FROM coach_note_publications WHERE id=$1`, [pub[0].id]);
  expect('9b editing the private source does NOT alter what was published',
    snap[0].published_body_snapshot === 'what the client received', snap[0].published_body_snapshot);

  await mustRefuse('9c the published snapshot cannot be rewritten', /append-only/,
    () => query(`UPDATE coach_note_publications SET published_body_snapshot='rewritten' WHERE id=$1`,
      [pub[0].id]));
  await mustRefuse('9d a publication cannot be deleted', /append-only/,
    () => query(`DELETE FROM coach_note_publications WHERE id=$1`, [pub[0].id]));

  await query(`UPDATE coach_note_publications SET withdrawn_at=NOW() WHERE id=$1`, [pub[0].id]);
  const { rows: withdrawn } = await query(
    `SELECT withdrawn_at, published_at FROM coach_note_publications WHERE id=$1`, [pub[0].id]);
  expect('9e withdrawal preserves the fact that publication happened',
    withdrawn[0].withdrawn_at !== null && withdrawn[0].published_at !== null, JSON.stringify(withdrawn[0]));

  // ── 10  client-declared position sharing ─────────────────────────────────
  console.log('\n10 client position sharing');
  const { rows: consent } = await query(
    `INSERT INTO coach_position_share_consents (relationship_id, client_member_id)
     VALUES ($1,$2) RETURNING mode`, [pending.relationshipId, client1]);
  expect('10a consent defaults to OFF', consent[0].mode === 'off', consent[0].mode);

  const { rows: share } = await query(
    `INSERT INTO coach_position_shares
       (relationship_id, client_member_id, declared_position, stated_by, share_origin)
     VALUES ($1,$2,'I am in the middle of it','member_confirmed','item') RETURNING id`,
    [pending.relationshipId, client1]);

  await mustRefuse('10b a shared declaration cannot be rewritten', /append-only/,
    () => query(`UPDATE coach_position_shares SET declared_position='reworded' WHERE id=$1`,
      [share[0].id]));
  await mustRefuse('10c a shared declaration cannot be deleted', /append-only/,
    () => query(`DELETE FROM coach_position_shares WHERE id=$1`, [share[0].id]));
  await mustRefuse('10d the practitioner cannot author a "declared" position',
    /violates check constraint/,
    () => query(
      `INSERT INTO coach_position_shares
         (relationship_id, client_member_id, declared_position, stated_by, share_origin)
       VALUES ($1,$2,'what I think they feel','practitioner_seeded','item')`,
      [pending.relationshipId, client1]));

  await query(`UPDATE coach_position_shares SET withdrawn_at=NOW() WHERE id=$1`, [share[0].id]);
  const { rows: stillThere } = await query(
    `SELECT withdrawn_at FROM coach_position_shares WHERE id=$1`, [share[0].id]);
  expect('10e withdrawing stops display without deleting the record',
    stillThere.length === 1 && stillThere[0].withdrawn_at !== null, JSON.stringify(stillThere));

  // ── 12  further refusal probes, each for its own reason ──────────────────
  console.log('\n12 refusal probes');
  const strangerAuth = await authorizePractitionerClientRelationship(
    asMemberId(stranger), asRelationshipId(pending.relationshipId));
  expect('12a an unrelated member gets no grant at all', strangerAuth === null, JSON.stringify(strangerAuth));

  await mustRefuse('12b a commitment cannot exist without member assent', /violates check constraint/,
    () => query(
      `INSERT INTO coach_work_items
         (relationship_id, kind, title, originated_by_role, originated_by_practitioner_id,
          recorded_by_practitioner_id)
       VALUES ($1,'commitment','I decided they committed','practitioner',$2,$2)`,
      [pending.relationshipId, practRecord]));

  const { rows: affirmed } = await query(
    `INSERT INTO coach_work_items
       (relationship_id, kind, title, originated_by_role, originated_by_member_id,
        recorded_by_practitioner_id, member_affirmed_at)
     VALUES ($1,'commitment','I will walk each morning','member',$2,$3,NOW()) RETURNING originated_by_role`,
    [pending.relationshipId, client1, practRecord]);
  expect('12c a member-originated, member-affirmed commitment IS accepted',
    affirmed[0].originated_by_role === 'member', affirmed[0].originated_by_role);

  await mustRefuse('12d a practice cannot carry a deadline', /violates check constraint/,
    () => query(
      `INSERT INTO coach_work_items
         (relationship_id, kind, title, originated_by_role, originated_by_practitioner_id,
          recorded_by_practitioner_id, due_on)
       VALUES ($1,'practice','Sit daily','practitioner',$2,$2,NOW())`,
      [pending.relationshipId, practRecord]));

  await mustRefuse('12e stage history cannot be rewritten', /append-only/, async () => {
    const { rows: pd } = await query(
      `INSERT INTO coach_program_definitions (owner_practitioner_id, title)
       VALUES ($1,'P') RETURNING id`, [practRecord]);
    const { rows: en } = await query(
      `INSERT INTO coach_program_enrollments (process_id, program_definition_id, enrolled_by_practitioner_id)
       VALUES ($1,$2,$3) RETURNING id`, [proc[0].id, pd[0].id, practRecord]);
    const { rows: sh } = await query(
      `INSERT INTO coach_enrollment_stage_history (program_enrollment_id, changed_by_practitioner_id)
       VALUES ($1,$2) RETURNING id`, [en[0].id, practRecord]);
    return query(`UPDATE coach_enrollment_stage_history SET change_reason='rewritten' WHERE id=$1`,
      [sh[0].id]);
  });

  await mustRefuse('12f a client-private note has no relationship column to reach it by',
    /relationship_id.*does not exist/,
    () => query(`SELECT relationship_id FROM coach_client_personal_notes LIMIT 1`));

  // ── cleanup ──────────────────────────────────────────────────────────────
  await clearFixtures();
  const { rows: leftover } = await query(
    `SELECT (SELECT count(*) FROM practitioner_clients WHERE email LIKE $1)
          + (SELECT count(*) FROM members WHERE username LIKE $1) AS n`, [`${TAG}-%`]);
  expect('cleanup leaves no fixtures behind', Number(leftover[0].n) === 0, `${leftover[0].n} rows remain`);

  console.log(`\n${passed} passed · ${failures.length} failed`);
  if (failures.length) {
    console.log('\nFailures:');
    failures.forEach((f) => console.log(`  · ${f}`));
    process.exit(1);
  }
  console.log('\nCOACH FIELD BOUNDARY GATE — ALL PASSED\n');
}

main()
  .catch((e) => { console.error('\nGATE ERRORED:', e); process.exit(1); })
  .finally(() => closePool());
