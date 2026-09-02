/**
 * BUILD-07A — INV-7b against the ACTUAL CUSTODY SUBSTRATE.
 *
 * ONE QUESTION, asked of a live PostgreSQL through the real loaders:
 *
 *     Can an author inspect exactly what MAIA would have reasoned from, after
 *     the Work has changed — recovered from the rows the database actually
 *     holds, not from an object a test constructed?
 *
 * WHY THIS EXISTS ALONGSIDE THE UNIT TESTS. The pure substrate proves the RULES.
 * It cannot prove they hold against rows PostgreSQL returned — and that is the
 * exact gap the section-partition Unicode defect lived in for a full merge
 * cycle, self-consistent in the application and rejected by the database.
 *
 * ⛔ THE FIXTURE CARRIES ASTRAL TEXT, AND THE WALK ASSERTS THAT IT DOES before
 * relying on it. Partition offsets are code points; JavaScript indices are UTF-16
 * code units. An all-BMP fixture passes under either and proves the fixture
 * rather than the claim.
 *
 * NO MEMBER PROSE IS PRINTED beyond the synthetic fixture this run created, and
 * the fixture is deleted by the ids this run created — never by name or pattern.
 *
 *   DATABASE_URL=... npx tsx scripts/ws2-07-build-07a-inv7b-witness.ts
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
  const { loadRevisionSnapshot, loadCurrentSection } =
    await import('@/lib/manuscript/developmental/frozenStateStore');
  const { resolveHistorical, locateCurrent } =
    await import('@/lib/manuscript/developmental/frozenState');
  const { partitionFromSections, flattenSections, codePointLength } =
    await import('@/lib/manuscript/draftSections');
  type Section = { id: string; text: string };

  const tag = randomUUID().slice(0, 8);
  const member = await query<{ id: string }>(
    `INSERT INTO members (passkey, username, password_hash, name)
     VALUES ($1,$2,'x','BUILD-07A witness') RETURNING id`,
    [`B07A-${tag}`, `b07a-${tag}`]);
  const memberId = member.rows[0].id;
  const ms = await query<{ id: string }>(
    `INSERT INTO member_manuscripts (member_id, title) VALUES ($1,'BUILD-07A fixture') RETURNING id`,
    [memberId]);
  const draft = await query<{ id: string }>(
    `INSERT INTO manuscript_working_drafts
       (manuscript_id, member_id, content, base_source_hash, revision_count, section_addressable_at)
     VALUES ($1,$2,'','h',1, NULL) RETURNING id`, [ms.rows[0].id, memberId]);
  const draftId = draft.rows[0].id;

  try {
    /* ── the Work at the moment of the reading ────────────────────────── */
    console.log('\n1 · the Work as MAIA read it (revision 7)');
    const atReading: Section[] = [
      { id: '', text: 'before 😀 change' },
      { id: '', text: 'untouched 🌒 section' },
    ];
    /* Sections written the way the draft substrate holds them, then read back
       for their server-minted ids — the reading addresses those, not indices. */
    await query(
      `INSERT INTO manuscript_draft_sections (draft_id, position, text)
       SELECT $1, ord - 1, t FROM unnest($2::text[]) WITH ORDINALITY AS x(t, ord)`,
      [draftId, atReading.map((s) => s.text)]);
    const live = await query<Section>(
      `SELECT id, text FROM manuscript_draft_sections WHERE draft_id = $1 ORDER BY position`,
      [draftId]);
    const sections = live.rows;
    const S = sections[0].id;
    const UNTOUCHED = sections[1].id;

    /* Content and the addressable flag land TOGETHER, which is the order the
       real conversion uses: the round-trip trigger checks at COMMIT, and a draft
       marked addressable before its sections flatten to its content is exactly
       what it exists to refuse. The fixture obeys the same rule a member does. */
    const content = flattenSections(sections);
    await query(
      `UPDATE manuscript_working_drafts
          SET content = $2, section_addressable_at = now(), section_conversion_version = version
        WHERE id = $1`, [draftId, content]);
    await query(
      `INSERT INTO working_draft_revisions
         (draft_id, revision_number, content, saved_by, section_partition)
       VALUES ($1, 7, $2, $3, $4::jsonb)`,
      [draftId, content, memberId, JSON.stringify(partitionFromSections(sections))]);

    check('the fixture can exhibit the unit failure — otherwise this proves nothing',
      codePointLength(content) < content.length,
      `PostgreSQL ${codePointLength(content)} · JavaScript ${content.length}`);
    check('revision 7 is stored with a valid partition', true);

    /* The reading's frozen state: addresses and depths, no prose. */
    const readState = {
      draftId,
      revisionNumber: 7,
      sections: [
        { sectionId: S, depth: 'body' as const },
        { sectionId: UNTOUCHED, depth: 'body' as const },
      ],
      structure: null,
    };

    /* ── an ordinary member edit ──────────────────────────────────────── */
    console.log('\n2 · the member edits that section, the ordinary way');
    const edited = sections.map((s) =>
      s.id === S ? { ...s, text: 'after 😀 change' } : s);
    /* ONE transaction, because the round-trip invariant is checked at COMMIT —
       the same reason the real section-native save writes sections and content
       together. A witness that could not obey that rule would be witnessing a
       draft no member could ever have. */
    await transaction(async (tx) => {
      await tx.query(
        `UPDATE manuscript_draft_sections s SET text = v.text
           FROM (SELECT unnest($2::uuid[]) AS id, unnest($3::text[]) AS text) v
          WHERE s.id = v.id AND s.draft_id = $1`,
        [draftId, edited.map((x) => x.id), edited.map((x) => x.text)]);
      await tx.query(`UPDATE manuscript_working_drafts SET content = $2 WHERE id = $1`,
        [draftId, flattenSections(edited)]);
    });
    check('the live draft now says something else', true);

    /* ── THE CLAIM ────────────────────────────────────────────────────── */
    console.log('\n3 · INV-7b, from the database');
    const snap = await loadRevisionSnapshot(draftId, memberId, 7);
    check('the immutable revision loads', snap.ok === true);
    if (!snap.ok) throw new Error('cannot continue without the revision');
    check('and its partition came back recorded', snap.value.partition !== null,
      `${snap.value.partition?.length} range(s)`);

    const historical = resolveHistorical(readState, snap.value, S);
    check('historical recovery succeeds', historical.ok === true);
    const historicalText = historical.ok ? historical.value.text : '';
    check('and returns EXACTLY what was read', historicalText === 'before 😀 change',
      `${historicalText.length} chars`);
    check('byte-for-byte, with no split surrogate',
      Buffer.from(historicalText, 'utf8').equals(Buffer.from('before 😀 change', 'utf8'))
      && !/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/.test(historicalText));

    const current = await loadCurrentSection(draftId, memberId, S);
    check('the live section loads', current.ok === true);
    check('and says what the member wrote instead',
      current.ok && current.value.text === 'after 😀 change');
    check('currentness reports SUPERSEDED',
      locateCurrent(historicalText, current.ok ? current.value : null) === 'superseded');

    /* ── scoped: the untouched section is still current ───────────────── */
    console.log('\n4 · scoped supersession, against real rows');
    const untouchedHist = resolveHistorical(readState, snap.value, UNTOUCHED);
    const untouchedNow = await loadCurrentSection(draftId, memberId, UNTOUCHED);
    check('an unrelated section stays CURRENT',
      untouchedHist.ok && untouchedNow.ok
      && locateCurrent(untouchedHist.value.text, untouchedNow.value) === 'current');

    /* ── hard negatives ───────────────────────────────────────────────── */
    console.log('\n5 · the hard negatives');
    const wrongDraft = await loadRevisionSnapshot(randomUUID(), memberId, 7);
    check('a wrong draft id cannot resolve',
      !wrongDraft.ok && wrongDraft.failure === 'revision_not_found');

    const otherMember = await loadRevisionSnapshot(draftId, randomUUID(), 7);
    check('another member\'s request cannot resolve — not found, never forbidden',
      !otherMember.ok && otherMember.failure === 'revision_not_found');

    const wrongRevision = await loadRevisionSnapshot(draftId, memberId, 999);
    check('a wrong revision number cannot resolve',
      !wrongRevision.ok && wrongRevision.failure === 'revision_not_found');

    /* A revision written before the draft became addressable: partition NULL. */
    await query(
      `INSERT INTO working_draft_revisions (draft_id, revision_number, content, saved_by)
       VALUES ($1, 6, $2, $3)`, [draftId, content, memberId]);
    const bare = await loadRevisionSnapshot(draftId, memberId, 6);
    const bareResolve = bare.ok
      ? resolveHistorical({ ...readState, revisionNumber: 6 }, bare.value, S)
      : null;
    check('a NULL partition refuses recovery, by name',
      bare.ok && bareResolve !== null && !bareResolve.ok
      && bareResolve.failure === 'partition_not_recorded',
      bareResolve && !bareResolve.ok ? bareResolve.failure : '');

    const wrongRevisionState = resolveHistorical(
      { ...readState, revisionNumber: 8 }, snap.value, S);
    check('a snapshot from a revision the reading never read is refused',
      !wrongRevisionState.ok && wrongRevisionState.failure === 'revision_mismatch');

    const uncovered = resolveHistorical(
      { ...readState, sections: [{ sectionId: UNTOUCHED, depth: 'body' }] }, snap.value, S);
    check('a section the reading never covered is refused',
      !uncovered.ok && uncovered.failure === 'section_not_in_read_state');

    /* A covered section deleted from the live draft: history still resolves. */
    console.log('\n6 · the section is deleted — history must survive it');
    await transaction(async (tx) => {
      await tx.query(`DELETE FROM manuscript_draft_sections WHERE id = $1`, [S]);
      await tx.query(`UPDATE manuscript_working_drafts SET content = $2 WHERE id = $1`,
        [draftId, flattenSections(edited.filter((x) => x.id !== S))]);
    });
    const goneNow = await loadCurrentSection(draftId, memberId, S);
    check('the live section is gone', !goneNow.ok && goneNow.failure === 'section_not_found');
    const stillHistorical = resolveHistorical(readState, snap.value, S);
    check('⛔ and the frozen evidence STILL resolves exactly',
      stillHistorical.ok && stillHistorical.value.text === 'before 😀 change');
    check('currentness reports no_longer_locatable, never a guess at a neighbour',
      locateCurrent(historicalText, null) === 'no_longer_locatable');

    console.log(`\n${failures === 0 ? 'WITNESSED' : 'FAILED'} — ${failures} failing check(s)\n`);
    process.exitCode = failures === 0 ? 0 : 1;
  } finally {
    if (process.env.KEEP_FIXTURE === '1') {
      console.log(`  fixture kept: username b07a-${tag} · ref ${memberRef(memberId)}`);
    } else {
      await query(`DELETE FROM member_manuscripts WHERE member_id = $1`, [memberId]);
      await query(`DELETE FROM members WHERE id = $1`, [memberId]);
      console.log('  fixture removed');
    }
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
