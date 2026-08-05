/**
 * Bring Forward — boundary verification.
 *
 * The claim under test is the whole sovereignty model in one sentence:
 *
 *     Larry sees what Maya chose to bring, and nothing else — including
 *     nothing about what she chose not to bring, or later took back.
 *
 * Every absence assertion runs while real private material exists, so a pass
 * means the boundary held, not that the fixture was empty.
 *
 * Run:  DATABASE_URL=... npx tsx scripts/verify-bring-forward.ts
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';
import { query, closePool } from '@/lib/db/postgres';
import { asMemberId, asRelationshipId } from '@/lib/coachField/identity';
import {
  bringForward,
  receiveOfferings,
  updateOffering,
  withdrawOffering,
  listMyOfferings,
} from '@/lib/coachField/bringForward';
import { getPractitionerClientProjection } from '@/lib/coachField/practitionerProjection';

const TAG = 'bfgate';
let passed = 0;
let failed = 0;

function expect(name: string, ok: boolean, detail = '') {
  if (ok) { passed++; console.log(`  ✅ ${name}`); }
  else { failed++; console.log(`  ❌ ${name}${detail ? ` — ${detail}` : ''}`); }
}

async function cleanup() {
  await query(
    `DELETE FROM coach_client_shared_items WHERE relationship_id IN
       (SELECT id FROM practitioner_clients WHERE email LIKE $1)`, [`${TAG}-%`]);
  await query(`DELETE FROM practitioner_clients WHERE email LIKE $1`, [`${TAG}-%`]);
  await query(`DELETE FROM practitioners WHERE slug LIKE $1`, [`${TAG}-%`]);
  await query(`DELETE FROM members WHERE username LIKE $1`, [`${TAG}-%`]);
}

async function main() {
  await cleanup();

  const mk = async (s: string, name: string) => {
    const { rows } = await query<{ id: string }>(
      `INSERT INTO members (passkey, username, password_hash, email, name)
       VALUES ($1,$1,'x',$2,$3) RETURNING id`,
      [`${TAG}-${s}`, `${TAG}-${s}@test.local`, name]);
    return rows[0].id;
  };
  const larry = await mk('larry', 'Larry');
  const maya = await mk('maya', 'Maya');
  const stranger = await mk('stranger', 'Stranger');

  const { rows: pr } = await query<{ id: string }>(
    `INSERT INTO practitioners (member_id, name, email, slug) VALUES ($1,$2,$3,$4) RETURNING id`,
    [larry, `${TAG} Practice`, `${TAG}-p@test.local`, `${TAG}-practice`]);
  const { rows: sp } = await query<{ id: string }>(
    `INSERT INTO practitioners (member_id, name, email, slug) VALUES ($1,$2,$3,$4) RETURNING id`,
    [stranger, `${TAG} Other`, `${TAG}-o@test.local`, `${TAG}-other`]);
  const { rows: rc } = await query<{ id: string }>(
    `INSERT INTO practitioner_clients
       (practitioner_id, name, email, member_id, relationship_status, linked_at)
     VALUES ($1,'Maya',$2,$3,'active',NOW()) RETURNING id`,
    [pr[0].id, `${TAG}-maya@test.local`, maya]);
  const rel = rc[0].id;
  const { rows: sc } = await query<{ id: string }>(
    `INSERT INTO practitioner_clients
       (practitioner_id, name, email, relationship_status)
     VALUES ($1,'Someone',$2,'active') RETURNING id`,
    [sp[0].id, `${TAG}-someone@test.local`]);
  const strangerRel = sc[0].id;

  const M = asMemberId(maya), L = asMemberId(larry), S = asMemberId(stranger);
  const R = asRelationshipId(rel);

  // ── 1  the member's gesture ──────────────────────────────────────────────
  console.log('\n1  Maya brings something forward');
  const kept = await bringForward(M, R, {
    kind: 'reflection',
    snapshot: { title: 'The Safety of Almost Finished', body: 'I keep stopping at 90%.' },
    origin: 'field_note_thread',
    sourceId: null as any,
  });
  expect('1a the offering is created', kept !== null);
  expect('1b it carries the member\'s own words', kept?.snapshot.title === 'The Safety of Almost Finished');
  expect('1c version starts at 1', kept?.snapshotVersion === 1);

  // ── 2  the practitioner receives ─────────────────────────────────────────
  console.log('\n2  Larry receives what she brought');
  const received = await receiveOfferings(L, R);
  expect('2a Larry receives exactly one offering', received?.length === 1);
  expect('2b he can read what she chose to bring',
    received?.[0].snapshot.body === 'I keep stopping at 90%.');

  // ── 3  what stays hers ───────────────────────────────────────────────────
  console.log('\n3  what remains Maya\'s');
  const { rows: raw } = await query<{ snapshot_enc: string }>(
    `SELECT snapshot_enc FROM coach_client_shared_items WHERE id = $1`, [kept!.id]);
  expect('3a the snapshot is ciphertext at rest, not prose',
    !raw[0].snapshot_enc.includes('90%') && raw[0].snapshot_enc.length > 0);
  const proj = await getPractitionerClientProjection(L, R);
  expect('3b the relationship projection still leaks no client-owned key',
    !JSON.stringify(proj).toLowerCase().includes('focus'));
  const asStranger = await receiveOfferings(S, R);
  expect('3c an unrelated practitioner receives nothing', asStranger === null);
  const strangerSees = await receiveOfferings(S, asRelationshipId(strangerRel));
  expect('3d and sees nothing in his own empty relationship', strangerSees?.length === 0);
  const larryAsClient = await listMyOfferings(L, R);
  expect('3e Larry cannot read the member-side view', larryAsClient === null);

  // ── 4  the member stays the actor ────────────────────────────────────────
  console.log('\n4  Maya remains the actor');
  const larryEdit = await updateOffering(L, kept!.id, { title: 'Edited by Larry', body: 'x' });
  expect('4a the practitioner cannot edit what he was given', larryEdit === false);
  const larryWithdraw = await withdrawOffering(L, kept!.id);
  expect('4b the practitioner cannot withdraw it either', larryWithdraw === false);

  const updated = await updateOffering(M, kept!.id, {
    title: 'The Safety of Almost Finished',
    body: 'I keep stopping at 90%. I think it is about being judged on a finished thing.',
  });
  expect('4c the member can update what he sees', updated === true);
  const afterUpdate = await receiveOfferings(L, R);
  expect('4d he now sees the newer declaration',
    afterUpdate?.[0].snapshot.body.includes('being judged'));
  expect('4e and it is legible that she spoke again', afterUpdate?.[0].snapshotVersion === 2);

  // ── 5  taking it back is silent ──────────────────────────────────────────
  console.log('\n5  withdrawal');
  const withdrew = await withdrawOffering(M, kept!.id);
  expect('5a the member can withdraw it', withdrew === true);
  const afterWithdraw = await receiveOfferings(L, R);
  expect('5b it is gone from what Larry receives', afterWithdraw?.length === 0);
  expect('5c no tombstone, no trace, nothing to notice was removed',
    JSON.stringify(afterWithdraw) === '[]');
  const { rows: stillThere } = await query<{ n: string }>(
    `SELECT count(*) n FROM coach_client_shared_items WHERE id=$1 AND status='withdrawn'`,
    [kept!.id]);
  expect('5d the member\'s own record of the act survives (withdrawn ≠ deleted)',
    Number(stillThere[0].n) === 1);

  // ── 6  authorship cannot be rewritten ────────────────────────────────────
  console.log('\n6  authorship');
  let refused = false;
  try {
    await query(`UPDATE coach_client_shared_items SET offered_by_member_id=$2 WHERE id=$1`,
      [kept!.id, larry]);
  } catch (e: any) { refused = /write-once|reattributed/i.test(e.message); }
  expect('6a an offering cannot be reattributed to another person', refused);

  let relRefused = false;
  try {
    await query(`UPDATE coach_client_shared_items SET relationship_id=$2 WHERE id=$1`,
      [kept!.id, strangerRel]);
  } catch (e: any) { relRefused = /write-once|different relationship/i.test(e.message); }
  expect('6b nor moved into a different relationship', relRefused);

  // ── 7  no source is reachable ────────────────────────────────────────────
  console.log('\n7  the source stays unreachable');
  const { rows: fks } = await query<{ n: string }>(
    `SELECT count(*) n
       FROM information_schema.table_constraints tc
       JOIN information_schema.key_column_usage kcu ON kcu.constraint_name = tc.constraint_name
      WHERE tc.table_name = 'coach_client_shared_items'
        AND tc.constraint_type = 'FOREIGN KEY'
        AND kcu.column_name = 'source_id'`);
  expect('7a source_id carries NO foreign key — there is nothing to join back through',
    Number(fks[0].n) === 0);

  // ── 8  a pending relationship has consented to nothing ───────────────────
  console.log('\n8  pending relationships');
  const pendingReceive = await receiveOfferings(S, asRelationshipId(strangerRel));
  expect('8a an unclaimed invitation yields no member material', pendingReceive?.length === 0);

  // ── 9  CONSTITUTIONAL TEST ───────────────────────────────────────────────
  //
  //   A Shared Offering is a declared relational artifact,
  //   not a live window into a member-owned Field Object.
  //
  //   Failure indicates the object model has changed.
  //
  // Read that literally. This section is not a regression test, and a failure
  // here must not be triaged like one:
  //
  //   normal regression   → test fails → implementation bug → fix the code
  //   constitutional      → test fails → architecture drift → question the design
  //
  // If 9c ever fails, the system has not broken a feature. It has become a
  // shared-document product with encryption on top, and the correct response is
  // to stop and re-open the design decision — not to make the assertion pass.
  //
  // Everything above tests the offering in isolation. This runs the whole
  // lineage against a REAL private field object, because the single claim that
  // separates this model from a shared-document system is that editing the
  // private source does not change what the practitioner was given.
  console.log('\n9  CONSTITUTIONAL — a declared artifact, not a live window');
  const { rows: thread } = await query<{ id: string }>(
    `INSERT INTO member_field_note_threads
       (member_id, title, content, authorship, member_decision, member_decision_at)
     VALUES ($1,'Almost Finished','I keep stopping at 90%.','member_authored','keep',NOW())
     RETURNING id`, [maya]);
  const sourceId = thread[0].id;

  const offering = await bringForward(M, R, {
    kind: 'reflection',
    snapshot: { title: 'Almost Finished', body: 'I keep stopping at 90%.' },
    origin: 'field_note_thread',
    sourceId,
  });
  expect('9a Maya brings her private field object forward', offering !== null);

  const larrySees1 = await receiveOfferings(L, R);
  expect('9b Larry sees the declaration', larrySees1?.[0].snapshot.body === 'I keep stopping at 90%.');

  // She keeps working in her own field. This is the moment the two models diverge.
  await query(
    `UPDATE member_field_note_threads
        SET content = 'Actually this is about being judged. I do not want this seen.'
      WHERE id = $1`, [sourceId]);

  const larrySees2 = await receiveOfferings(L, R);
  expect('9c editing the private source does NOT change what Larry was given',
    larrySees2?.[0].snapshot.body === 'I keep stopping at 90%.',
    `he now sees: ${larrySees2?.[0].snapshot.body}`);
  expect('9d and the offering did not silently gain a version',
    larrySees2?.[0].snapshotVersion === 1);

  // Only her explicit second declaration moves what he sees.
  await updateOffering(M, offering!.id, {
    title: 'Almost Finished',
    body: 'I think it is about being judged on a finished thing.',
  });
  const larrySees3 = await receiveOfferings(L, R);
  expect('9e only an explicit re-declaration changes his view',
    larrySees3?.[0].snapshot.body === 'I think it is about being judged on a finished thing.');
  expect('9f and that act is legible as a second declaration',
    larrySees3?.[0].snapshotVersion === 2);

  // Her private material is still hers, still holding the words she never offered.
  const { rows: sourceNow } = await query<{ content: string }>(
    `SELECT content FROM member_field_note_threads WHERE id = $1`, [sourceId]);
  expect('9g her private source still holds what she never brought forward',
    sourceNow[0].content.includes('do not want this seen'));

  await query(`DELETE FROM member_field_note_threads WHERE member_id = $1`, [maya]);

  // ── 10  the hydration guard ──────────────────────────────────────────────
  // The largest future risk is not this implementation. It is a developer six
  // months from now seeing `source_id`, thinking "I can hydrate the full
  // source", and writing one join that recreates practitioner access to the
  // private field. A comment asking them not to is a description, not a
  // control. This is the control.
  console.log('\n10 hydration guard — the join that must never be written');
  const MEMBER_OWNED_SOURCES = [
    'member_field_note_threads', 'member_field_note_events', 'member_memory_atoms',
    'member_reflections', 'member_daily_anchors', 'reflection_capsules',
    'encounter_reflections', 'breakthrough_moments', 'coach_client_personal_notes',
  ];
  const walk = (dir: string): string[] => {
    let out: string[] = [];
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
      const p = join(dir, e.name);
      if (e.isDirectory()) out = out.concat(walk(p));
      else if (/\.tsx?$/.test(e.name)) out.push(p);
    }
    return out;
  };
  const appFiles = ['lib', 'app', 'components']
    .map((d) => join(process.cwd(), d))
    .filter((d) => existsSync(d))
    .flatMap(walk);

  const hydrators = appFiles.filter((f) => {
    const src = readFileSync(f, 'utf8');
    if (!src.includes('coach_client_shared_items')) return false;
    // The module's own warning names the table it forbids; that is the warning,
    // not a join. Strip block comments before looking for co-occurrence.
    const code = src.replace(/\/\*[\s\S]*?\*\//g, '');
    return MEMBER_OWNED_SOURCES.some((t) => code.includes(t));
  }).map((f) => f.replace(process.cwd() + '/', ''));

  expect('10a no application file joins a shared offering to a member-owned source',
    hydrators.length === 0,
    `hydration join present in: ${hydrators.join(', ')}`);

  // And prove the guard can actually fire — an assertion that cannot fail is
  // decoration. Same shape, planted.
  const plantedHydration =
    `const rows = await query("SELECT s.*, t.content FROM coach_client_shared_items s ` +
    `JOIN member_field_note_threads t ON t.id = s.source_id");`;
  const wouldCatch =
    plantedHydration.includes('coach_client_shared_items') &&
    MEMBER_OWNED_SOURCES.some((t) => plantedHydration.includes(t));
  expect('10b the guard fires on a planted hydration join', wouldCatch);

  // Nothing above this layer can even see source_id.
  const offeringKeys = Object.keys(larrySees3?.[0] ?? {});
  expect('10c source_id is never returned to any caller',
    !offeringKeys.some((k) => /source/i.test(k)), offeringKeys.join(', '));

  await cleanup();
  const { rows: left } = await query<{ n: string }>(
    `SELECT count(*) n FROM members WHERE username LIKE $1`, [`${TAG}-%`]);
  expect('cleanup leaves no fixtures behind', Number(left[0].n) === 0);

  console.log(`\n${passed} passed · ${failed} failed`);
  console.log(failed === 0 ? '\nBRING FORWARD — ALL PASSED' : '\nBOUNDARY NOT ESTABLISHED');
  await closePool();
  process.exit(failed === 0 ? 0 : 1);
}

main().catch(async (e) => {
  console.error(e);
  await cleanup().catch(() => {});
  await closePool();
  process.exit(1);
});
