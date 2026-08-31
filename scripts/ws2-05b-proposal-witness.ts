/**
 * WS2-05B step 3 - the proposal store, witnessed against live PostgreSQL.
 *
 * THE CENTRAL PROPERTY, and the reason both copies exist:
 *
 *     Create proposal A, edit the reviewed copy to B, and what the system
 *     PROPOSED must still be byte-identical to A.
 *
 * The first time a member says "that is not what MAIA suggested", the answer
 * has to be a row rather than a recollection.
 *
 * Creates its own synthetic manuscript and deletes it by the id this run
 * created. Never reads or reports on a manuscript it did not make.
 *
 *   MEMBER_ID=<uuid> DATABASE_URL=... npx tsx scripts/ws2-05b-proposal-witness.ts
 */

import { createHash } from 'crypto';

async function main() {
  const { query, transaction } = await import('@/lib/db/postgres');
  const {
    createProposal, loadProposal, listProposals, updateReviewed, assertNoProse,
  } = await import('@/lib/manuscript/structure/proposalStore');
  const { gatherEvidence } = await import('@/lib/manuscript/structure/evidence');
  const { assignUnitIds } = await import('@/lib/manuscript/structure/interpret');

  let failures = 0;
  const check = (name: string, pass: boolean, detail = '') => {
    console.log(`  ${pass ? 'ok  ' : 'FAIL'}  ${name}${detail ? `  ${detail}` : ''}`);
    if (!pass) failures++;
  };

  console.log('\n1 · schema');
  const t = await query<{ table_name: string }>(
    `SELECT table_name FROM information_schema.tables
      WHERE table_name = 'manuscript_structure_proposals'`);
  if (t.rows.length === 0) {
    console.error('\n  The 05B step-3 migration has not been applied.\n');
    console.error('      psql "$DATABASE_URL" \\');
    console.error('        -f database/migrations/20260830000005_manuscript_structure_proposals.sql\n');
    process.exit(2);
  }
  check('the proposals table is present', true);

  console.log('\n2 · fixture');
  const N = 10;
  const fixture = await transaction(async (tx) => {
    let memberId = process.env.MEMBER_ID ?? '';
    if (!memberId) {
      const m = await tx.query<{ id: string }>(`INSERT INTO members DEFAULT VALUES RETURNING id`);
      memberId = m.rows[0].id;
    }
    const man = await tx.query<{ id: string }>(
      `INSERT INTO member_manuscripts (member_id, title) VALUES ($1, $2) RETURNING id`,
      [memberId, `ws2-05b-witness-${Date.now()}`]);
    const manuscriptId = man.rows[0].id;

    const bodies = Array.from({ length: N }, (_, i) => `SECTION-${i} filler.\n\n`);
    const content = bodies.join('');
    const draft = await tx.query<{ id: string }>(
      `INSERT INTO manuscript_working_drafts
         (manuscript_id, member_id, content, base_source_hash, version)
       VALUES ($1, $2, $3, $4, 1) RETURNING id`,
      [manuscriptId, memberId, content,
       createHash('sha256').update(content, 'utf8').digest('hex')]);
    for (let i = 0; i < N; i++) {
      await tx.query(
        `INSERT INTO manuscript_draft_sections (draft_id, position, text) VALUES ($1, $2, $3)`,
        [draft.rows[0].id, i, bodies[i]]);
    }
    await tx.query(
      `UPDATE manuscript_working_drafts SET section_addressable_at = now(),
              section_conversion_version = 1 WHERE id = $1`, [draft.rows[0].id]);
    return { memberId, manuscriptId, draftId: draft.rows[0].id };
  });
  check('a manuscript to propose about', true, `${N} sections`);

  const rows = await query<{ id: string; position: number }>(
    `SELECT id, position FROM manuscript_draft_sections WHERE draft_id = $1 ORDER BY position`,
    [fixture.draftId]);
  const sections = rows.rows.map((r) => ({
    id: r.id, position: r.position, heading: `HEADING ${r.position}`,
  }));
  const sid = (i: number) => sections[i].id;

  console.log('\n3 · persisting a reading');
  const evidence = gatherEvidence(fixture.manuscriptId, sections);
  const interpretation = {
    form: 'stable' as const,
    account: 'Two movements, each holding several sections.',
    coverage: evidence.coverage,
    unaccountedSectionIds: [],
    uncertainRegions: [],
    /* Ids are MINTED BY THE HOST, never written by hand. This script predated
       that rule and carried literals without ids: it ran green because tsx does
       not typecheck, so the drift was invisible until the witnesses were put
       under the compiler. */
    units: assignUnitIds([
      { title: 'Opening', kind: null, fromSectionId: sid(0), toSectionId: sid(4),
        children: [], rationale: 'the first five hold together', evidenceRefs: [],
        uncertainty: [] },
      { title: 'Return', kind: null, fromSectionId: sid(5), toSectionId: sid(9),
        children: [], rationale: 'the remainder turn', evidenceRefs: [], uncertainty: [] },
    ]),
  };

  const created = await createProposal(fixture.manuscriptId, fixture.memberId, {
    evidence, interpretation, coverage: evidence.coverage,
    sectionTopologyHash: evidence.sectionTopologyHash,
    interpretationInputHash: 'input-hash-A',
  });
  check('the proposal is stored', created.status === 'ok');
  if (created.status !== 'ok') process.exit(1);
  const pid = created.value.id;

  const loadedA = await loadProposal(pid, fixture.memberId);
  check('reviewed begins as a copy of what was proposed',
    loadedA.status === 'ok' && loadedA.value.reviewed.units.length === 2
      && loadedA.value.reviewRevision === 0);

  const structureRows = await query(
    `SELECT 1 FROM manuscript_structure_units WHERE manuscript_id = $1`,
    [fixture.manuscriptId]);
  check('a stored proposal creates NO canonical structure',
    structureRows.rows.length === 0, `${structureRows.rows.length} units`);

  console.log('\n4 · the audit distinction');
  const originalJson = JSON.stringify(
    loadedA.status === 'ok' ? loadedA.value.interpretation : null);

  /* A ReviewedUnit carries no rationale, no evidenceRefs and no uncertainty:
     the member's copy holds the member's structure, and MAIA's reasoning stays
     in the frozen interpretation where it can still be read beside it. */
  const edited = await updateReviewed(pid, fixture.memberId, 0, {
    units: [
      { id: 'm1', title: 'Opening', kind: 'Movement',
        fromSectionId: sid(0), toSectionId: sid(2), children: [] },
      { id: 'm2', title: 'Middle', kind: 'Movement',
        fromSectionId: sid(3), toSectionId: sid(6), children: [] },
      { id: 'm3', title: 'Return', kind: 'Movement',
        fromSectionId: sid(7), toSectionId: sid(9), children: [] },
    ],
  });
  check('the member may reshape the reviewed copy',
    edited.status === 'ok' && edited.value.reviewRevision === 1);

  const loadedB = await loadProposal(pid, fixture.memberId);
  check('B differs from A, which is the member\'s authorship',
    loadedB.status === 'ok' && loadedB.value.reviewed.units.length === 3);
  check('and what the system PROPOSED is byte-identical to A',
    loadedB.status === 'ok'
      && JSON.stringify(loadedB.value.interpretation) === originalJson,
    'A preserved');

  console.log('\n5 · the frozen half is frozen by the database');
  let raw: string | null = null;
  try {
    await query(
      `UPDATE manuscript_structure_proposals SET interpretation = '{"form":"none"}'::jsonb
        WHERE id = $1`, [pid]);
  } catch (e) {
    raw = e instanceof Error ? e.message : String(e);
  }
  check('raw SQL cannot rewrite what was proposed',
    Boolean(raw && /immutable/i.test(raw)),
    raw ? raw.split('\n')[0].slice(0, 78) : 'THE UPDATE SUCCEEDED');

  console.log('\n6 · refusals');
  const stale = await updateReviewed(pid, fixture.memberId, 0, { units: [] });
  check('a stale revision is refused, not overwritten',
    stale.status === 'refused' && stale.refusal === 'stale_revision',
    stale.status === 'refused' ? (stale.detail ?? '') : 'permitted');

  const stranger = await loadProposal(pid, '00000000-0000-0000-0000-000000000000');
  check('another member sees not_found, never a shape',
    stranger.status === 'refused' && stranger.refusal === 'not_found');

  const withProse = await createProposal(fixture.manuscriptId, fixture.memberId, {
    evidence: { ...evidence, observations: [
      /* The shape a future caller would produce by attaching the excerpts a
         reading was made from. */
      { ...(evidence.observations[0] ?? {}), body: 'the member wrote this' } as never,
    ] },
    interpretation, coverage: evidence.coverage,
    sectionTopologyHash: evidence.sectionTopologyHash,
    interpretationInputHash: 'input-hash-B',
  });
  check('a payload carrying the Work is refused',
    withProse.status === 'refused' && withProse.refusal === 'prose_in_payload',
    withProse.status === 'refused' ? (withProse.detail ?? '') : 'STORED');

  check('assertNoProse finds a nested body field',
    assertNoProse({ a: [{ b: { excerpt: 'x' } }] }) === '$.a[0].b.excerpt');
  check('and passes a reading that only describes',
    assertNoProse({ account: 'a reading', units: [{ rationale: 'because' }] }) === null);

  console.log('\n7 · listing');
  const all = await listProposals(fixture.manuscriptId, fixture.memberId);
  check('one proposal is stored, the refused one is not',
    all.status === 'ok' && all.value.length === 1, `${all.status === 'ok' ? all.value.length : '?'}`);

  console.log('\n8 · cleanup');
  if (process.env.KEEP_FIXTURE === '1') {
    console.log(`  fixture KEPT at manuscript ${fixture.manuscriptId}`);
  } else {
    const gone = await query(`DELETE FROM member_manuscripts WHERE id = $1`,
      [fixture.manuscriptId]);
    check('the fixture manuscript is removed', (gone.rowCount ?? 0) === 1);
    const left = await query(
      `SELECT 1 FROM manuscript_structure_proposals WHERE manuscript_id = $1`,
      [fixture.manuscriptId]);
    check('its proposals went with it', left.rows.length === 0);
  }

  console.log(`\n${failures === 0 ? 'PASS' : 'FAIL'} — ${failures} failed\n`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });
