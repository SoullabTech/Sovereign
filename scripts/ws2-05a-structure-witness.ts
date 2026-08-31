/**
 * WS2-05A — the structure witness.
 *
 * ONE QUESTION, asked of a live database through the real service:
 *
 *     Does the book become more intelligibly organised while the flattened
 *     manuscript stays byte-for-byte unchanged?
 *
 * The flattening is captured before any structure gesture and compared after
 * every one of them, as bytes rather than as text — the same discipline as the
 * 04A round trip, and for the same reason: '=' on text depends on collation,
 * and PostgreSQL permits nondeterministic collations under which different
 * byte sequences compare equal. This invariant claims byte identity, so it
 * must not be able to become true by accident.
 *
 * NO MEMBER PROSE IS PRINTED. The witness reports lengths, digests and counts.
 *
 * Runs against whatever DATABASE_URL points at, and creates its own manuscript
 * to work on. It never reads, writes, or reports on a manuscript it did not
 * create.
 *
 * IT NEEDS A MEMBER ROW, and `members` in the real schema requires a passkey,
 * username and password_hash. Pass MEMBER_ID to use an existing member instead
 * of creating one, which is what you want against a database that has real
 * people in it:
 *
 *   MEMBER_ID=<uuid> DATABASE_URL=... npx tsx scripts/ws2-05a-structure-witness.ts
 *
 * The fixture manuscript is still created and belongs to that member. It is
 * synthetic, obviously named, holds no prose of theirs, and is DELETED at the
 * end — by the id this run created, never by name or by pattern. Nothing the
 * member owns is read, listed, or reported on. Pass KEEP_FIXTURE=1 to leave it
 * in place for inspection.
 *
 *   DATABASE_URL=... npx tsx scripts/ws2-05a-structure-witness.ts
 */

import { createHash } from 'crypto';

async function main() {
  const { query, transaction } = await import('@/lib/db/postgres');
  const {
    loadStructure, createUnit, renameUnit, moveUnit, deleteUnit, placeSections,
    flattenedBytes,
  } = await import('@/lib/manuscript/structure/structureService');

  let failures = 0;
  const check = (name: string, pass: boolean, detail = '') => {
    console.log(`  ${pass ? 'ok  ' : 'FAIL'}  ${name}${detail ? `  ${detail}` : ''}`);
    if (!pass) failures++;
  };

  /* ── 1 · schema, or stop ────────────────────────────────────────────── */
  console.log('\n1 · schema');
  const cols = await query<{ table_name: string }>(
    `SELECT table_name FROM information_schema.tables
      WHERE table_name IN ('manuscript_structure_units','manuscript_structure_members')`);
  if (cols.rows.length < 2) {
    console.error('\n  The 05A migration has not been applied to this database.\n');
    console.error('      psql "$DATABASE_URL" \\');
    console.error('        -f database/migrations/20260830000002_manuscript_structure.sql\n');
    process.exit(2);
  }
  check('structure tables present', true);

  /* ── 2 · a manuscript of our own ───────────────────────────────────── */
  console.log('\n2 · fixture');
  const N = 12;
  const fixture = await transaction(async (tx) => {
    let memberId = process.env.MEMBER_ID ?? '';
    if (!memberId) {
      /* Supplies the NOT NULL credential columns rather than relying on
         DEFAULT VALUES, which threw on the real schema. Nobody saw it: the
         witness is always run with MEMBER_ID set, and a fallback nobody
         exercises is not a fallback. The password hash is a literal, not a
         credential - this member exists for the length of one run. */
      const mem = await tx.query<{ id: string }>(
        `INSERT INTO members (passkey, username, password_hash, name)
         VALUES ($1, $1, 'not-a-credential', 'WS2 witness') RETURNING id`,
        [`ws2-witness-${Date.now()}`]);
      memberId = mem.rows[0].id;
    }
    const man = await tx.query<{ id: string }>(
      `INSERT INTO member_manuscripts (member_id, title) VALUES ($1, $2) RETURNING id`,
      [memberId, `ws2-05a-witness-${Date.now()}`]);
    const manuscriptId = man.rows[0].id;

    /* Deterministic, obviously synthetic text. Never a member's words. */
    const bodies = Array.from({ length: N }, (_, i) => `SECTION-${i} filler line.\n\n`);
    const content = bodies.join('');

    const draft = await tx.query<{ id: string }>(
      `INSERT INTO manuscript_working_drafts
         (manuscript_id, member_id, content, base_source_hash, version)
       VALUES ($1, $2, $3, $4, 1) RETURNING id`,
      [manuscriptId, memberId, content,
       createHash('sha256').update(content, 'utf8').digest('hex')]);
    const draftId = draft.rows[0].id;

    for (let i = 0; i < N; i++) {
      /* Source sections as well as draft sections. Without them the Work has
         no headings and, more to the point, the Canvas never opens its
         manuscript column - `ws2-witness-browser.ts` could therefore only ever
         be run against a real book, which is the cost this harness exists to
         remove. */
      const src = await tx.query<{ id: string }>(
        `INSERT INTO manuscript_sections (manuscript_id, position, heading, body)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [manuscriptId, i, `HEADING ${i}`, bodies[i]]);
      await tx.query(
        `INSERT INTO manuscript_draft_sections (draft_id, position, text, source_section_id)
         VALUES ($1, $2, $3, $4)`,
        [draftId, i, bodies[i], src.rows[0].id]);
    }
    await tx.query(
      `UPDATE manuscript_working_drafts
          SET section_addressable_at = now(), section_conversion_version = 1
        WHERE id = $1`, [draftId]);
    return { memberId, manuscriptId, draftId };
  });
  check(`section-addressable draft created`, true, `${N} sections`);

  const digest = (s: string) => createHash('sha256').update(s, 'utf8').digest('hex').slice(0, 16);
  const before = await flattenedBytes(fixture.draftId);
  console.log(`  flattening: ${Buffer.byteLength(before, 'utf8')} bytes  sha256:${digest(before)}`);

  const sections = await query<{ id: string; position: number }>(
    `SELECT id, position FROM manuscript_draft_sections WHERE draft_id = $1 ORDER BY position`,
    [fixture.draftId]);
  const sid = (i: number) => sections.rows[i].id;

  /* Re-read from the database every time. Comparing a cached value would
     prove only that this process remembered it. */
  const stillIntact = async () => {
    const now = await flattenedBytes(fixture.draftId);
    return Buffer.compare(Buffer.from(now, 'utf8'), Buffer.from(before, 'utf8')) === 0;
  };

  /* ── 3 · authoring structure ───────────────────────────────────────── */
  console.log('\n3 · authoring');
  const partA = await createUnit(fixture.manuscriptId, fixture.memberId,
    { kind: 'Part', title: 'The First Movement', parentId: null });
  check('create a top-level unit', partA.status === 'ok');
  if (partA.status !== 'ok') process.exit(1);

  const ch1 = await createUnit(fixture.manuscriptId, fixture.memberId,
    { kind: 'Chapter', title: 'Opening', parentId: partA.value.id });
  const ch2 = await createUnit(fixture.manuscriptId, fixture.memberId,
    { kind: 'Chapter', title: 'Turning', parentId: partA.value.id });
  check('nest two chapters under it', ch1.status === 'ok' && ch2.status === 'ok');
  if (ch1.status !== 'ok' || ch2.status !== 'ok') process.exit(1);

  const empty = await createUnit(fixture.manuscriptId, fixture.memberId,
    { kind: '  ', title: null, parentId: null });
  check('refuse a unit with no name at all',
    empty.status === 'refused' && empty.refusal === 'empty_name');

  const placed1 = await placeSections(fixture.manuscriptId, fixture.memberId,
    { unitId: ch1.value.id, fromSectionId: sid(0), toSectionId: sid(3) });
  const placed2 = await placeSections(fixture.manuscriptId, fixture.memberId,
    { unitId: ch2.value.id, fromSectionId: sid(4), toSectionId: sid(6) });
  check('place two runs of sections',
    placed1.status === 'ok' && placed2.status === 'ok',
    placed1.status === 'ok' && placed2.status === 'ok'
      ? `${placed1.value.placed} + ${placed2.value.placed}` : '');

  const t1 = await loadStructure(fixture.manuscriptId, fixture.memberId);
  if (t1.status !== 'ok') { check('load structure', false, t1.refusal); process.exit(1); }
  const part = t1.value.roots[0];
  check('the Part derives its chapters\' sections without a second join',
    part.sectionIds.length === 0 && part.derivedSectionIds.length === 7,
    `direct ${part.sectionIds.length}, derived ${part.derivedSectionIds.length}`);
  check('each chapter is a contiguous run',
    part.children.every((c) => c.contiguous));
  check('unplaced sections are shown, not hidden',
    t1.value.unplacedSectionIds.length === N - 7,
    `${t1.value.unplacedSectionIds.length} unplaced`);
  check('flattening unchanged after authoring', await stillIntact());

  /* ── 4 · the refusals ──────────────────────────────────────────────── */
  console.log('\n4 · refusals');
  const cycle = await moveUnit(fixture.manuscriptId, fixture.memberId, partA.value.id,
    { parentId: ch1.value.id, index: 0 });
  check('refuse a move that would make a cycle',
    cycle.status === 'refused' && cycle.refusal === 'would_cycle');

  const ghost = await placeSections(fixture.manuscriptId, fixture.memberId,
    { unitId: ch1.value.id, fromSectionId: sid(0), toSectionId: '00000000-0000-0000-0000-000000000000' });
  check('refuse a run naming a section not in this draft',
    ghost.status === 'refused' && ghost.refusal === 'unknown_section');

  const stranger = await loadStructure(fixture.manuscriptId, '00000000-0000-0000-0000-000000000000');
  check('another member sees not_found, never a shape',
    stranger.status === 'refused' && stranger.refusal === 'not_found');

  /* ── 5 · moving, renaming, deleting ────────────────────────────────── */
  console.log('\n5 · reorganising');
  const promoted = await moveUnit(fixture.manuscriptId, fixture.memberId, ch2.value.id,
    { parentId: null, index: 0 });
  check('promote a chapter to top level', promoted.status === 'ok');

  const renamed = await renameUnit(fixture.manuscriptId, fixture.memberId, ch2.value.id,
    { kind: 'Interlude', title: 'Turning' });
  check('rename it in the Work\'s own vocabulary', renamed.status === 'ok');

  const t2 = await loadStructure(fixture.manuscriptId, fixture.memberId);
  if (t2.status !== 'ok') { check('reload', false); process.exit(1); }
  check('sibling positions are 0..n-1 with no gap',
    t2.value.roots.every((r, i) => r.position === i),
    t2.value.roots.map((r) => `${r.kind}:${r.position}`).join(' '));
  check('a promoted unit keeps its sections',
    (t2.value.roots.find((r) => r.id === ch2.value.id)?.derivedSectionIds.length ?? 0) === 3);
  check('flattening unchanged after reorganising', await stillIntact());

  const removed = await deleteUnit(fixture.manuscriptId, fixture.memberId, ch2.value.id);
  check('delete a unit', removed.status === 'ok');
  const t3 = await loadStructure(fixture.manuscriptId, fixture.memberId);
  if (t3.status !== 'ok') { check('reload', false); process.exit(1); }
  check('deleting a grouping returns its sections to unplaced, losing no words',
    t3.value.unplacedSectionIds.length === N - 4,
    `${t3.value.unplacedSectionIds.length} unplaced`);
  check('flattening unchanged after deleting', await stillIntact());

  /* ── 6 · the defining property, stated once at the end ─────────────── */
  console.log('\n6 · the defining property');
  const after = await flattenedBytes(fixture.draftId);
  const identical = Buffer.compare(Buffer.from(after, 'utf8'), Buffer.from(before, 'utf8')) === 0;
  console.log(`  before  ${Buffer.byteLength(before, 'utf8')} bytes  sha256:${digest(before)}`);
  console.log(`  after   ${Buffer.byteLength(after, 'utf8')} bytes  sha256:${digest(after)}`);
  check('the book was organised and not one character of it changed', identical);

  /* ── 7 · the correction gate (A-G) ─────────────────────────────────── */
  console.log('\n7 · correction gate');

  /* A · two concurrent creates must not land on the same sibling position.
         The manuscript row lock is what makes this true; without it both
         transactions read the same sibling list and renumber into it. */
  const before7 = await loadStructure(fixture.manuscriptId, fixture.memberId);
  const rootsBefore = before7.status === 'ok' ? before7.value.roots.length : -1;
  /* BOTH must succeed, not merely avoid duplicates. Without the lock the two
     transactions cannot see each other's uncommitted insert, compute the same
     renumbering, and one dies on the deferred sibling-order constraint at
     COMMIT. Asserting only "no duplicates" would pass in that world too, and
     prove nothing about the lock. */
  const raced = await Promise.all([
    createUnit(fixture.manuscriptId, fixture.memberId, { kind: 'Part', title: 'Race A', parentId: null })
      .catch((e) => ({ status: 'threw' as const, refusal: String(e?.message ?? e) })),
    createUnit(fixture.manuscriptId, fixture.memberId, { kind: 'Part', title: 'Race B', parentId: null })
      .catch((e) => ({ status: 'threw' as const, refusal: String(e?.message ?? e) })),
  ]);
  check('A · both concurrent creates succeed',
    raced.every((r) => r.status === 'ok'),
    raced.map((r) => r.status).join(' + '));
  const dupes = await query<{ n: string }>(
    `SELECT count(*) AS n FROM (
       SELECT parent_id, position FROM manuscript_structure_units
        WHERE manuscript_id = $1
        GROUP BY parent_id, position HAVING count(*) > 1) d`,
    [fixture.manuscriptId]);
  check('A · two concurrent creates leave no duplicate sibling position',
    Number(dupes.rows[0].n) === 0);

  /* B · and the surviving order is 0..n-1 under a NULL parent. */
  const t7 = await loadStructure(fixture.manuscriptId, fixture.memberId);
  if (t7.status !== 'ok') { check('B · reload', false); process.exit(1); }
  check('B · top-level siblings are 0..n-1',
    t7.value.roots.every((r, i) => r.position === i)
      && t7.value.roots.length === rootsBefore + 2,
    t7.value.roots.map((r) => r.position).join(','));

  /* C · taking a run out of the MIDDLE of a division would split the source. */
  const wide = await createUnit(fixture.manuscriptId, fixture.memberId,
    { kind: 'Part', title: 'Wide', parentId: null });
  const narrow = await createUnit(fixture.manuscriptId, fixture.memberId,
    { kind: 'Part', title: 'Narrow', parentId: null });
  if (wide.status !== 'ok' || narrow.status !== 'ok') { check('C · fixture', false); process.exit(1); }
  const filled = await placeSections(fixture.manuscriptId, fixture.memberId,
    { unitId: wide.value.id, fromSectionId: sid(7), toSectionId: sid(11) });
  check('C · a five-section division is placed', filled.status === 'ok');

  const splitSource = await placeSections(fixture.manuscriptId, fixture.memberId,
    { unitId: narrow.value.id, fromSectionId: sid(9), toSectionId: sid(9) });
  check('C · refuse a move that would leave the SOURCE in two places',
    splitSource.status === 'refused' && splitSource.refusal === 'would_split_division',
    splitSource.status === 'refused' ? splitSource.refusal : 'permitted');

  /* D · appending a separated run would split the TARGET. */
  const edge = await placeSections(fixture.manuscriptId, fixture.memberId,
    { unitId: wide.value.id, fromSectionId: sid(7), toSectionId: sid(7) });
  void edge;
  const splitTarget = await placeSections(fixture.manuscriptId, fixture.memberId,
    { unitId: narrow.value.id, fromSectionId: sid(0), toSectionId: sid(0) });
  const splitTarget2 = splitTarget.status === 'ok'
    ? await placeSections(fixture.manuscriptId, fixture.memberId,
        { unitId: narrow.value.id, fromSectionId: sid(4), toSectionId: sid(4) })
    : splitTarget;
  check('D · refuse appending a run separated from what the division holds',
    splitTarget2.status === 'refused' && splitTarget2.refusal === 'would_split_division',
    splitTarget2.status === 'refused' ? splitTarget2.refusal : 'permitted');

  /* E · deleting a parent must not destroy the divisions inside it. */
  const parentU = await createUnit(fixture.manuscriptId, fixture.memberId,
    { kind: 'Part', title: 'Holds one', parentId: null });
  if (parentU.status !== 'ok') { check('E · fixture', false); process.exit(1); }
  const childU = await createUnit(fixture.manuscriptId, fixture.memberId,
    { kind: 'Chapter', title: 'Held', parentId: parentU.value.id });
  if (childU.status !== 'ok') { check('E · fixture', false); process.exit(1); }
  await placeSections(fixture.manuscriptId, fixture.memberId,
    { unitId: childU.value.id, fromSectionId: sid(2), toSectionId: sid(3) });

  const killParent = await deleteUnit(fixture.manuscriptId, fixture.memberId, parentU.value.id);
  check('E · refuse deleting a division that holds others',
    killParent.status === 'refused' && killParent.refusal === 'unit_has_children',
    killParent.status === 'refused' ? killParent.refusal : 'permitted');

  const survived = await query<{ n: string }>(
    `SELECT count(*) AS n FROM manuscript_structure_members WHERE unit_id = $1`,
    [childU.value.id]);
  check('E · the child and its memberships are intact',
    Number(survived.rows[0].n) === 2, `${survived.rows[0].n} placements`);

  /* F · promotion is an explicit gesture and it succeeds. */
  const promotedOut = await moveUnit(fixture.manuscriptId, fixture.memberId, childU.value.id,
    { parentId: null, index: 0 });
  check('F · promote the child out one level', promotedOut.status === 'ok',
    promotedOut.status === 'refused' ? promotedOut.refusal : '');
  const nowLeaf = await deleteUnit(fixture.manuscriptId, fixture.memberId, parentU.value.id);
  check('F · the emptied parent can then be removed', nowLeaf.status === 'ok');

  /* G · through all of it, not one character moved. */
  check('G · flattening unchanged through the whole gate', await stillIntact());

  /* ── 8 · leave nothing behind ──────────────────────────────────────── */
  if (process.env.KEEP_FIXTURE === '1') {
    console.log(`\n8 · fixture KEPT at manuscript ${fixture.manuscriptId}`);
  } else {
    console.log('\n8 · cleanup');
    /* By the id this run created. Never by title, never by pattern: a witness
       that deletes by name could one day match something a member wrote. */
    const gone = await query(
      `DELETE FROM member_manuscripts WHERE id = $1`, [fixture.manuscriptId]);
    check('the fixture manuscript is removed', (gone.rowCount ?? 0) === 1);
    const left = await query(
      `SELECT 1 FROM manuscript_structure_units WHERE manuscript_id = $1`,
      [fixture.manuscriptId]);
    check('its structure went with it', left.rows.length === 0);
  }

  console.log(`\n${failures === 0 ? 'PASS' : 'FAIL'} — ${failures} failed\n`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });
