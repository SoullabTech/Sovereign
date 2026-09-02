/**
 * BUILD-07A · SEAMS A AND B, against real PostgreSQL.
 *
 * THE CONSTITUTIONAL FLOOR UNDER TEST:
 *
 *     MAIA does not freeze the Work. The member freezes a version; MAIA is later
 *     allowed to read that frozen version.
 *
 * SEAM A   a reading is admissible only against an immutable revision the
 *          current Work EXACTLY equals — content byte-identical AND the same
 *          sections at the same code-point boundaries
 * SEAM B   the authored structure a reading reasoned from is RECOVERABLE, not
 *          merely comparable — which is the missing half of INV-7b
 *
 * Synthetic fixture with astral prose, deleted by this run's own ids.
 *
 *   DATABASE_URL=... npx tsx scripts/ws2-07-build-07a-seams-witness.ts
 */
import { randomUUID } from 'crypto';
import { memberRef } from '@/lib/privacy/memberRef';

let failures = 0;
const check = (name: string, pass: boolean, detail = '') => {
  console.log(`  ${pass ? 'ok  ' : 'FAIL'}  ${name}${detail ? `  ${detail}` : ''}`);
  if (!pass) failures += 1;
};

async function main() {
  const { query, transaction } = await import('@/lib/db/postgres');
  const { findExactReadRevision } =
    await import('@/lib/manuscript/developmental/frozenStateStore');
  const { captureStructureSnapshot, loadStructureSnapshot, unitFingerprints } =
    await import('@/lib/manuscript/developmental/structureSnapshot');
  const { locateCurrentStructure } =
    await import('@/lib/manuscript/developmental/frozenState');
  const { flattenSections, partitionFromSections } =
    await import('@/lib/manuscript/draftSections');
  type Section = { id: string; text: string };

  const tag = randomUUID().slice(0, 8);
  const member = await query<{ id: string }>(
    `INSERT INTO members (passkey, username, password_hash, name)
     VALUES ($1,$2,'x','seams witness') RETURNING id`, [`SEAM-${tag}`, `seam-${tag}`]);
  const memberId = member.rows[0].id;
  const ms = await query<{ id: string }>(
    `INSERT INTO member_manuscripts (member_id, title) VALUES ($1,'seams fixture') RETURNING id`,
    [memberId]);
  const manuscriptId = ms.rows[0].id;
  const draft = await query<{ id: string }>(
    `INSERT INTO manuscript_working_drafts
       (manuscript_id, member_id, content, base_source_hash, revision_count)
     VALUES ($1,$2,'','h',1) RETURNING id`, [manuscriptId, memberId]);
  const draftId = draft.rows[0].id;

  const freeze = async (sections: Section[], n: number) =>
    query(`INSERT INTO working_draft_revisions
             (draft_id, revision_number, content, saved_by, section_partition)
           VALUES ($1, $2, $3, $4, $5::jsonb)`,
      [draftId, n, flattenSections(sections), memberId,
       JSON.stringify(partitionFromSections(sections))]);

  const writeLive = async (sections: Section[]) =>
    transaction(async (tx) => {
      await tx.query(
        `UPDATE manuscript_draft_sections s SET text = v.text
           FROM (SELECT unnest($2::uuid[]) AS id, unnest($3::text[]) AS text) v
          WHERE s.id = v.id AND s.draft_id = $1`,
        [draftId, sections.map((x) => x.id), sections.map((x) => x.text)]);
      await tx.query(`UPDATE manuscript_working_drafts SET content = $2 WHERE id = $1`,
        [draftId, flattenSections(sections)]);
    });

  try {
    /* ── the Work ─────────────────────────────────────────────────────── */
    console.log('\n1 · a Work with astral prose, and a version the member froze');
    await query(
      `INSERT INTO manuscript_draft_sections (draft_id, position, text)
       SELECT $1, ord - 1, t FROM unnest($2::text[]) WITH ORDINALITY AS x(t, ord)`,
      [draftId, ['before 😀 change', 'untouched 🌒 section']]);
    const live = await query<Section>(
      `SELECT id, text FROM manuscript_draft_sections WHERE draft_id = $1 ORDER BY position`,
      [draftId]);
    let sections = live.rows;
    const S = sections[0].id;
    await transaction(async (tx) => {
      await tx.query(
        `UPDATE manuscript_working_drafts
            SET content = $2, section_addressable_at = now(), section_conversion_version = version
          WHERE id = $1`, [draftId, flattenSections(sections)]);
    });
    await freeze(sections, 7);
    check('the member has frozen revision 7', true);

    /* ── SEAM A ───────────────────────────────────────────────────────── */
    console.log('\n2 · SEAM A · admissibility against what the member froze');
    const admissible = await findExactReadRevision(draftId, memberId, sections);
    check('the Work exactly equals a frozen version → admissible',
      admissible.ok === true, admissible.ok ? `revision ${admissible.revisionNumber}` : '');

    console.log('\n3 · the member writes on');
    const edited = sections.map((s) => (s.id === S ? { ...s, text: 'after 😀 change' } : s));
    await writeLive(edited);
    const moved = await findExactReadRevision(draftId, memberId, edited);
    check('⛔ the Work has moved past every frozen version → checkpoint_required',
      !moved.ok && moved.refusal === 'checkpoint_required');
    check('and NOTHING was written to make it admissible',
      (await query<{ n: string }>(
        `SELECT count(*)::text AS n FROM working_draft_revisions WHERE draft_id = $1`,
        [draftId])).rows[0].n === '1', 'still 1 revision');

    console.log('\n4 · the member restores the exact earlier prose by hand');
    await writeLive(sections);
    const restored = await findExactReadRevision(draftId, memberId, sections);
    check('⛔ mechanically identical again → admissible, though version moved twice',
      restored.ok === true,
      restored.ok ? `revision ${restored.revisionNumber}` : '');

    console.log('\n5 · same prose, different boundaries');
    /* One section holding the whole text: identical characters, one boundary
       instead of two. Revision 7 already holds these exact characters, so it is
       the candidate the proof compares against. */
    const whole = flattenSections(sections);
    await transaction(async (tx) => {
      await tx.query(`DELETE FROM manuscript_draft_sections WHERE draft_id = $1`, [draftId]);
      await tx.query(
        `INSERT INTO manuscript_draft_sections (draft_id, position, text) VALUES ($1, 0, $2)`,
        [draftId, whole]);
    });
    const merged = await query<Section>(
      `SELECT id, text FROM manuscript_draft_sections WHERE draft_id = $1 ORDER BY position`,
      [draftId]);
    const mismatch = await findExactReadRevision(draftId, memberId, merged.rows);
    check('⛔ identical prose cut differently → partition_mismatch, not admissible',
      !mismatch.ok && mismatch.refusal === 'partition_mismatch',
      !mismatch.ok ? mismatch.refusal : '');

    console.log('\n6 · a revision with no recorded partition');
    await query(`INSERT INTO working_draft_revisions (draft_id, revision_number, content, saved_by)
                 VALUES ($1, 9, $2, $3)`, [draftId, whole, memberId]);
    const bare = await findExactReadRevision(draftId, memberId, merged.rows);
    /* Revision 9 is the most recent holder of this exact prose, so the frozen
       precedence reports ITS reason — deterministically, however many older
       revisions happen to share the same characters. */
    check('⛔ its boundaries were never observed → partition_not_recorded, exactly',
      !bare.ok && bare.refusal === 'partition_not_recorded',
      !bare.ok ? bare.refusal : '');

    /* ── SEAM B ───────────────────────────────────────────────────────── */
    console.log('\n7 · SEAM B · the authored structure, frozen');
    const unitA = await query<{ id: string }>(
      `INSERT INTO manuscript_structure_units (manuscript_id, position, kind, title, origin)
       VALUES ($1, 0, 'Part', 'The Opening', 'member') RETURNING id`, [manuscriptId]);
    const unitB = await query<{ id: string }>(
      `INSERT INTO manuscript_structure_units (manuscript_id, position, kind, title, origin)
       VALUES ($1, 1, 'Part', 'The Turn', 'member') RETURNING id`, [manuscriptId]);
    await query(
      `INSERT INTO manuscript_structure_members (unit_id, draft_section_id)
       VALUES ($1, $2)`, [unitA.rows[0].id, merged.rows[0].id]);

    /* A proposal, to prove the capture gate rather than assume it. */
    const proposal = await query<{ id: string }>(
      `INSERT INTO manuscript_structure_proposals
         (manuscript_id, evidence, interpretation, coverage,
          section_topology_hash, interpretation_input_hash, reviewed)
       VALUES ($1,'{}'::jsonb,'{}'::jsonb,'{}'::jsonb,'h1','h2','{}'::jsonb) RETURNING id`,
      [manuscriptId]);

    const captured = await captureStructureSnapshot(manuscriptId, memberId);
    check('the structure is captured, with a durable address',
      typeof captured.snapshotId === 'string' && captured.snapshotId.length === 36);
    check('it holds both authored divisions', captured.snapshot.units.length === 2);
    check('⛔ and NO manuscript prose — sections are named, never copied',
      !JSON.stringify(captured.snapshot).includes('before 😀 change')
      && !JSON.stringify(captured.snapshot).includes('untouched'));
    check('⛔ nor the proposal, whose id is a uuid like any unit\'s',
      !JSON.stringify(captured.snapshot).includes(proposal.rows[0].id));
    check('it freezes structural semantics, not schema trivia',
      Object.keys(captured.snapshot.units[0]).sort().join(',')
        === 'id,kind,parentId,position,title');

    const frozenUnits = unitFingerprints(captured.snapshot);

    console.log('\n8 · the member renames one division');
    await query(`UPDATE manuscript_structure_units SET title = 'The Opening, revised'
                  WHERE id = $1`, [unitA.rows[0].id]);
    const after = await captureStructureSnapshot(manuscriptId, memberId);
    const currentUnits = unitFingerprints(after.snapshot);

    console.log('\n9 · structural INV-7b — recovery, not merely comparison');
    const recovered = await loadStructureSnapshot(captured.snapshotId, memberId);
    check('the frozen structure LOADS from its durable address', recovered.ok === true);
    check('⛔ and shows the author the title as it stood, not as it is now',
      recovered.ok
      && recovered.snapshot.units.find((u) => u.id === unitA.rows[0].id)?.title === 'The Opening');
    check('while the Work now says something else',
      after.snapshot.units.find((u) => u.id === unitA.rows[0].id)?.title === 'The Opening, revised');
    check('the fingerprint moved, so currentness can see it',
      captured.fingerprint !== after.fingerprint);

    console.log('\n10 · scoped supersession, against real captures');
    const frozenStructure = {
      topologyFingerprint: captured.fingerprint, unitFingerprints: frozenUnits };
    const currentStructure = {
      topologyFingerprint: after.fingerprint, unitFingerprints: currentUnits };
    check('evidence about the renamed division → superseded',
      locateCurrentStructure(frozenStructure, currentStructure,
        { scope: 'unit', unitId: unitA.rows[0].id }) === 'superseded');
    check('⛔ evidence about the untouched division → still CURRENT',
      locateCurrentStructure(frozenStructure, currentStructure,
        { scope: 'unit', unitId: unitB.rows[0].id }) === 'current');
    check('a whole-topology claim → superseded',
      locateCurrentStructure(frozenStructure, currentStructure, { scope: 'topology' })
        === 'superseded');

    console.log('\n11 · the snapshot cannot be rewritten');
    let refusedUpdate = false;
    try {
      await query(`UPDATE manuscript_structure_snapshots SET fingerprint = 'tampered'
                    WHERE id = $1`, [captured.snapshotId]);
    } catch { refusedUpdate = true; }
    check('⛔ append-only — the structure an observation rested on cannot change after the fact',
      refusedUpdate);

    const foreign = await loadStructureSnapshot(captured.snapshotId, randomUUID());
    check('another member cannot load it — not found, never forbidden',
      !foreign.ok && foreign.failure === 'snapshot_not_found');

    console.log(`\n${failures === 0 ? 'WITNESSED' : 'FAILED'} — ${failures} failing check(s)\n`);
    process.exitCode = failures === 0 ? 0 : 1;
  } finally {
    if (process.env.KEEP_FIXTURE === '1') {
      console.log(`  fixture kept: username seam-${tag} · ref ${memberRef(memberId)}`);
    } else {
      await query(`DELETE FROM manuscript_structure_snapshots WHERE manuscript_id = $1`,
        [manuscriptId]);
      await query(`DELETE FROM member_manuscripts WHERE member_id = $1`, [memberId]);
      await query(`DELETE FROM members WHERE id = $1`, [memberId]);
      console.log('  fixture removed');
    }
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
