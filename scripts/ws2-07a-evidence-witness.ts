/**
 * BUILD-07A — DEVELOPMENTAL EVIDENCE · the witness.
 *
 * ONE QUESTION, asked of a live database:
 *
 *     After the author changes the Work, can an evidence reference still be
 *     shown to resolve to EXACTLY what was read — and does the capture that
 *     made it refuse every shortcut that would make that untrue?
 *
 * That is INV-7b, run against real rows: a draft created through the real
 * POST handler, saved through the real PUT handler, structure authored through
 * the real structure service, and a capture that reads through the real
 * loaders. The Work is synthetic; the runtime is not.
 *
 * TEN FALSIFIERS, SIX OUTCOMES. The unit's falsifier set was stated in the
 * session that opened BUILD-07A and never reached canonical; this witness
 * carries the reconstruction recorded in
 * docs/programme/WS2-07-BUILD-07A_EVIDENCE_WITNESS_2026-09-03.md and names each
 * check by its number so the mapping can be disputed line by line.
 *
 * ⛔ THE FIXTURE CARRIES ASTRAL TEXT ON PURPOSE. An all-BMP fixture proves the
 * fixture and not the claim (prerequisite closure §8). The first check on the
 * prose asserts that JavaScript and PostgreSQL genuinely disagree on it.
 *
 * NO MEMBER PROSE IS PRINTED. Lengths, digests, counts and refusal names only.
 *
 * IT CREATES ITS OWN MEMBER AND MANUSCRIPT and deletes both at the end, by the
 * ids this run created — never by name or by pattern.
 *
 *   DATABASE_URL=... npx tsx scripts/ws2-07a-evidence-witness.ts
 *
 * KEEP_FIXTURE=1 leaves the fixture in place for inspection.
 */
import { createHash, randomUUID } from 'crypto';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import Module from 'module';
import { memberRef } from '@/lib/privacy/memberRef';

/* An empty cookie jar, installed before the routes are imported, so authority
   can only come from a session token the database recognises. */
const emptyCookies = { get: () => undefined, getAll: () => [], has: () => false };
const moduleLoader = Module as unknown as { _load: (request: string, ...rest: unknown[]) => unknown };
const originalLoad = moduleLoader._load;
moduleLoader._load = function (this: unknown, request: string, ...rest: unknown[]) {
  if (request === 'next/headers') {
    return { cookies: async () => emptyCookies, headers: async () => new Headers() };
  }
  return originalLoad.call(this, request, ...rest);
};

const digest = (s: string) => createHash('sha256').update(s, 'utf8').digest('hex').slice(0, 12);
const bytesEqual = (a: string, b: string) => Buffer.from(a, 'utf8').equals(Buffer.from(b, 'utf8'));

async function main() {
  const { query } = await import('@/lib/db/postgres');
  const { NextRequest } = await import('next/server');
  const draftRoute = await import('@/app/api/sovereign/manuscripts/[id]/draft/route');
  const { createUnit, placeSections, renameUnit } = await import('@/lib/manuscript/structure/structureService');
  const { canonicalFingerprint } = await import('@/lib/manuscript/structure/canonicalFingerprint');
  const { captureEvidence, loadRevisionContent, loadLiveWork } = await import('@/lib/manuscript/development/capture');
  const { freezeReadState } = await import('@/lib/manuscript/development/readState');
  const { bindEvidence, unreadSpan } = await import('@/lib/manuscript/development/bind');
  const { recoverEvidence, locateCurrent, observationLocation } = await import('@/lib/manuscript/development/resolve');
  const { codePointLength } = await import('@/lib/manuscript/draftSections');

  let failures = 0;
  let checks = 0;
  const check = (name: string, pass: boolean, detail = '') => {
    checks += 1;
    console.log(`  ${pass ? 'ok  ' : 'FAIL'}  ${name}${detail ? `  ${detail}` : ''}`);
    if (!pass) failures += 1;
  };
  const fail = (name: string, e: unknown) => check(name, false, e instanceof Error ? e.message : String(e));

  /* ── 0 · schema, or stop ─────────────────────────────────────────────── */
  console.log('\n0 · schema');
  const cols = await query<{ column_name: string }>(
    `SELECT column_name FROM information_schema.columns
      WHERE table_name = 'working_draft_revisions' AND column_name = 'section_partition'`);
  if (cols.rows.length === 0) {
    console.error('\n  20260902000002_working_draft_revision_partition.sql is not applied here.\n');
    process.exit(1);
  }
  check('working_draft_revisions.section_partition exists', true);
  const tablesBefore = await query<{ n: string }>(
    `SELECT count(*)::text AS n FROM pg_tables WHERE schemaname = 'public'`);

  /* ── fixture ─────────────────────────────────────────────────────────── */
  const tag = randomUUID().slice(0, 8);
  const member = await query<{ id: string }>(
    `INSERT INTO members (passkey, username, password_hash, name)
     VALUES ($1, $2, 'x', 'WS2-07A witness') RETURNING id`,
    [`WS207A-${tag}`, `ws207a-${tag}`]);
  const memberId = member.rows[0].id;
  const token = `ws207a-${randomUUID().replace(/-/g, '')}`.slice(0, 64);
  await query(
    `INSERT INTO auth_sessions (member_id, session_token, expires_at)
     VALUES ($1, $2, NOW() + INTERVAL '1 hour')`, [memberId, token]);
  const ms = await query<{ id: string }>(
    `INSERT INTO member_manuscripts (member_id, title) VALUES ($1, 'WS2-07A evidence fixture')
     RETURNING id`, [memberId]);
  const manuscriptId = ms.rows[0].id;
  await query(
    `INSERT INTO manuscript_sections (manuscript_id, position, heading, body) VALUES
       ($1, 0, 'The First Movement 😀', 'A thread is introduced here, and it carries a lantern 🏮 through the first movement.'),
       ($1, 1, 'The Second Movement', 'The thread continues — café and an astral pair 𝔘𝔫 sit mid-sentence, and the lantern is not mentioned.'),
       ($1, 2, NULL, '😀 An unheaded third movement that BEGINS with an emoji and says nothing of the thread at all.'),
       ($1, 3, 'The Fourth Movement', 'The lantern 🏮 returns, at last, and the thread is picked up again.')`,
    [manuscriptId]);

  const params = { params: Promise.resolve({ id: manuscriptId }) };
  const url = `http://localhost/api/sovereign/manuscripts/${manuscriptId}/draft`;
  const req = (method: string, body?: unknown) =>
    new NextRequest(url, {
      method,
      headers: { 'content-type': 'application/json', 'x-session-token': token },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });

  /* A byte-level snapshot of everything the capture must not touch. */
  const snapshotWork = async () => {
    const d = await query<{ id: string; content: string; version: string; revision_count: number }>(
      `SELECT id, content, version::text AS version, revision_count
         FROM manuscript_working_drafts WHERE manuscript_id = $1`, [manuscriptId]);
    const s = await query<{ id: string; position: number; text: string }>(
      `SELECT id, position, text FROM manuscript_draft_sections WHERE draft_id = $1 ORDER BY position`,
      [d.rows[0].id]);
    const r = await query<{ n: string; last: number }>(
      `SELECT count(*)::text AS n, max(revision_number) AS last FROM working_draft_revisions WHERE draft_id = $1`,
      [d.rows[0].id]);
    return {
      draftId: d.rows[0].id,
      content: d.rows[0].content,
      version: d.rows[0].version,
      revisionCount: d.rows[0].revision_count,
      sections: s.rows,
      revisions: r.rows[0].n,
      lastRevision: r.rows[0].last,
      structure: await canonicalFingerprint(manuscriptId),
    };
  };
  const sameWork = (a: Awaited<ReturnType<typeof snapshotWork>>, b: Awaited<ReturnType<typeof snapshotWork>>) =>
    bytesEqual(a.content, b.content) && a.version === b.version && a.revisionCount === b.revisionCount
    && a.revisions === b.revisions && a.structure === b.structure
    && a.sections.length === b.sections.length
    && a.sections.every((s, i) => s.id === b.sections[i].id && bytesEqual(s.text, b.sections[i].text));

  try {
    /* ── 1 · the Work, born addressable, with astral prose ──────────────── */
    console.log('\n1 · the Work (POST — the ordinary member path)');
    const created = await draftRoute.POST(req('POST'), params);
    const createdBody = await created.json();
    check('draft created, section-addressable from birth',
      created.status === 201 && createdBody.sectionAddressable === true, `status ${created.status}`);
    let sections = createdBody.sections as { id: string; text: string }[];
    let revisionId = createdBody.revisionId as number;
    const [s0, s1, s2, s3] = sections.map((s) => s.id);
    const originalS1 = sections[1].text;

    const rev1 = await query<{ pg_len: number; content: string }>(
      `SELECT length(content) AS pg_len, content FROM working_draft_revisions
        WHERE draft_id = (SELECT id FROM manuscript_working_drafts WHERE manuscript_id = $1)
          AND revision_number = 1`, [manuscriptId]);
    check('the fixture actually contains astral characters — otherwise this proves nothing',
      rev1.rows[0].content.length > Number(rev1.rows[0].pg_len),
      `${rev1.rows[0].content.length - Number(rev1.rows[0].pg_len)} astral char(s)`);

    /* ── 2 · authored structure, through the real service ───────────────── */
    console.log('\n2 · authored structure (structureService — the member\'s act)');
    const u1 = await createUnit(manuscriptId, memberId, { kind: 'chapter', title: 'Opening', parentId: null });
    const u2 = await createUnit(manuscriptId, memberId, { kind: 'chapter', title: 'Return', parentId: null });
    check('two units authored', u1.status === 'ok' && u2.status === 'ok');
    const u1Id = u1.status === 'ok' ? u1.value.id : '';
    const u2Id = u2.status === 'ok' ? u2.value.id : '';
    const p1 = await placeSections(manuscriptId, memberId, { unitId: u1Id, fromSectionId: s0, toSectionId: s1 });
    const p2 = await placeSections(manuscriptId, memberId, { unitId: u2Id, fromSectionId: s2, toSectionId: s3 });
    check('sections placed: Opening = s0..s1, Return = s2..s3', p1.status === 'ok' && p2.status === 'ok');

    /* ── 3 · the capture (OUTCOME 3, 4, 6 · FALSIFIER 5, 10) ────────────── */
    console.log('\n3 · the capture');
    const before = await snapshotWork();
    const cap = await captureEvidence(manuscriptId, memberId, { bodyScope: [s0, s1], withStructure: true });
    check('capture succeeds against the revision that exactly matches the Work', cap.ok,
      cap.ok ? `revision ${cap.value.readState.revisionNumber}` : `${cap.refusal}: ${cap.detail}`);
    if (!cap.ok) throw new Error('capture failed; nothing further can be witnessed');
    const evidence = cap.value;
    const rs = evidence.readState;
    check('the read state names ONE immutable revision — revision 1', rs.revisionNumber === 1);
    check('every section is frozen as (revision, code-point range, digest)',
      rs.sectionTopology.length === 4 && rs.sectionTopology.every((id) => rs.sections[id]?.revisionNumber === 1));
    check('ranges are in PostgreSQL\'s unit, not JavaScript\'s',
      rs.sections[s3].range.end === Number(rev1.rows[0].pg_len)
      && rs.sections[s3].range.end === codePointLength(rev1.rows[0].content),
      `ends at ${rs.sections[s3].range.end}`);
    check('coverage: body for s0, s1; position for s2, s3',
      evidence.coverage.sections[s0] === 'body' && evidence.coverage.sections[s1] === 'body'
      && evidence.coverage.sections[s2] === 'position' && evidence.coverage.sections[s3] === 'position');
    check('structure context frozen inline: two authored units, placements by id',
      rs.structureContext?.units.length === 2
      && rs.structureContext.units.find((u) => u.id === u1Id)?.sectionIds.join(',') === `${s0},${s1}`);
    check('structureFingerprint equals canonicalFingerprint() — one algorithm',
      rs.structureFingerprint === before.structure);

    const json = JSON.stringify(evidence);
    check('FALSIFIER 5 · the evidence object carries no manuscript prose',
      !json.includes('lantern') && !json.includes('thread') && !json.includes('🏮') && !json.includes('movement'),
      `${json.length} bytes of ids, offsets and digests`);
    const tablesAfter = await query<{ n: string }>(
      `SELECT count(*)::text AS n FROM pg_tables WHERE schemaname = 'public'`);
    check('FALSIFIER 5 · no new table — the evidence object needs no second store',
      tablesAfter.rows[0].n === tablesBefore.rows[0].n);
    const after = await snapshotWork();
    check('FALSIFIER 10 · the capture changed nothing: content, sections, version, revisions, structure',
      sameWork(before, after));

    const cap2 = await captureEvidence(manuscriptId, memberId, { bodyScope: [s0, s1], withStructure: true });
    check('OUTCOME 6 · the input fingerprint is deterministic across captures',
      cap2.ok && cap2.value.readState.inputFingerprint === rs.inputFingerprint);
    const capNoStructure = await captureEvidence(manuscriptId, memberId, { bodyScope: [s0, s1], withStructure: false });
    check('a capture without structure carries no structure context and a different fingerprint',
      capNoStructure.ok && capNoStructure.value.readState.structureContext === undefined
      && capNoStructure.value.readState.inputFingerprint !== rs.inputFingerprint);

    /* ── 4 · binding (OUTCOME 1, 2, 5 · FALSIFIER 6, 7, 8) ──────────────── */
    console.log('\n4 · binding references to the evidence');
    const passageStart = Array.from(originalS1).indexOf('𝔘');
    const refs = [
      { kind: 'section', sectionId: s1 },
      { kind: 'passage', sectionId: s1, range: { start: passageStart - 4, end: passageStart + 2 } },
      { kind: 'section-run', sectionIds: [s0, s1, s2] },
      { kind: 'structure-unit', unitId: u1Id },
      { kind: 'structure-topology' },
    ] as const;
    const bound = bindEvidence(refs, evidence);
    check('OUTCOME 1 · textual AND structural refs bind against one evidence object', bound.ok,
      bound.ok ? '' : `${bound.refusal}: ${bound.detail}`);
    check('FALSIFIER 7 · no ref carries a version, a quote or a heading',
      refs.every((r) => !('revision' in r) && !('version' in r) && !('quote' in r) && !('text' in r) && !('heading' in r)));
    const unread = bindEvidence([{ kind: 'section', sectionId: s3 }], evidence);
    check('FALSIFIER 6 · prose-derived evidence on an unread body is refused',
      !unread.ok && unread.refusal === 'body_not_read');
    const orderOnly = bindEvidence([{ kind: 'section-run', sectionIds: [s2, s3] }], evidence);
    check('FALSIFIER 6 · order-derived evidence over the same sections binds', orderOnly.ok);
    const proposalStyle = bindEvidence([{ kind: 'structure-unit', unitId: 'p1' }], evidence);
    const foreignUnit = bindEvidence([{ kind: 'structure-unit', unitId: randomUUID() }], evidence);
    check('FALSIFIER 8 · a proposal-style key or a foreign unit id is refused',
      !proposalStyle.ok && proposalStyle.refusal === 'unknown_structure_unit'
      && !foreignUnit.ok && foreignUnit.refusal === 'unknown_structure_unit');
    if (capNoStructure.ok) {
      const absent = bindEvidence([{ kind: 'structure-unit', unitId: u1Id }], capNoStructure.value);
      check('FALSIFIER 8 · structural evidence without supplied structure is ABSENT, not degraded',
        !absent.ok && absent.refusal === 'structure_not_supplied');
    }
    if (bound.ok) {
      /* The relation carries a whole-topology ref, so the observation spans
         the whole Work: s0..s3. Of those, s2 and s3 were read at position
         depth only. Derived from coverage plus the refs, never stored. */
      const span = unreadSpan(bound.value, evidence);
      check('OUTCOME 5 · the unread span is derivable: s2 and s3, at position depth inside the span',
        span.join(',') === `${s2},${s3}`, `${span.length} unread of 4`);
      const local = bindEvidence([{ kind: 'section', sectionId: s0 }, { kind: 'section-run', sectionIds: [s0, s1, s2] }], evidence);
      check('OUTCOME 5 · a local relation spans only what it names: s2 alone',
        local.ok && unreadSpan(local.value, evidence).join(',') === s2);
    }

    /* ── 5 · the author writes WITHOUT a checkpoint (FALSIFIER 3) ───────── */
    console.log('\n5 · the author writes, no checkpoint (PUT)');
    const edited = sections.map((s, i) =>
      i === 1 ? { ...s, text: `${s.text}A sentence added later, with a moon 🌒.\n\n` } : s);
    const saved = await draftRoute.PUT(
      req('PUT', { sections: edited, baseRevisionId: revisionId, idempotencyKey: randomUUID() }), params);
    const savedBody = await saved.json();
    check('the save is accepted', saved.status === 200, `status ${saved.status}`);
    revisionId = savedBody.revisionId;
    sections = edited;
    const stale = await captureEvidence(manuscriptId, memberId, { bodyScope: [s0, s1], withStructure: true });
    check('FALSIFIER 3 · a capture against a revision that no longer matches the Work is REFUSED, typed',
      !stale.ok && stale.refusal === 'revision_not_current', stale.ok ? 'captured!' : stale.refusal);
    const afterStale = await snapshotWork();
    check('FALSIFIER 3 · the refusal did not checkpoint on the author\'s behalf',
      afterStale.revisions === after.revisions && afterStale.lastRevision === 1);

    /* ── 6 · the author checkpoints; the old reading must still recover ─── */
    console.log('\n6 · the author checkpoints (PUT checkpoint: true) → revision 2');
    const cp = await draftRoute.PUT(
      req('PUT', { sections, baseRevisionId: revisionId, idempotencyKey: randomUUID(), checkpoint: true, note: 'after the moon' }),
      params);
    const cpBody = await cp.json();
    check('checkpoint accepted → revision 2', cp.status === 200 && cpBody.checkpointed === true && cpBody.revisionCount === 2,
      `status ${cp.status}`);
    revisionId = cpBody.revisionId;

    /* ── 7 · INV-7b (FALSIFIER 1) ───────────────────────────────────────── */
    console.log('\n7 · INV-7b — historical display after the Work changed');
    const rev1Content = await loadRevisionContent(rs.draftId, rs.revisionNumber);
    const recS1 = recoverEvidence({ kind: 'section', sectionId: s1 }, rs, rev1Content);
    check('FALSIFIER 1 · the section ref recovers the text AS READ, byte for byte',
      recS1.ok && recS1.value.kind === 'text' && bytesEqual(recS1.value.text, originalS1),
      recS1.ok ? `digest ${digest((recS1.value as { text: string }).text)}` : recS1.refusal);
    check('FALSIFIER 1 · and NOT the text the Work holds now',
      recS1.ok && recS1.value.kind === 'text' && !bytesEqual(recS1.value.text, sections[1].text));
    const recPassage = recoverEvidence(refs[1], rs, rev1Content);
    check('FALSIFIER 1 · a passage across an astral pair recovers whole characters',
      recPassage.ok && recPassage.value.kind === 'text'
      && recPassage.value.text === Array.from(originalS1).slice(passageStart - 4, passageStart + 2).join('')
      && codePointLength(recPassage.value.text) === 6);
    const rev2Content = await loadRevisionContent(rs.draftId, 2);
    const wrongRev = recoverEvidence({ kind: 'section', sectionId: s1 }, rs, rev2Content);
    check('FALSIFIER 1 · recovery refuses content that is not the frozen revision',
      !wrongRev.ok && wrongRev.refusal === 'revision_integrity_failure');
    const recRun = recoverEvidence(refs[2], rs, null);
    check('the run recovers as the frozen sequence with positions',
      recRun.ok && recRun.value.kind === 'sequence' && recRun.value.positions.join(',') === '0,1,2');

    /* ── 8 · never re-anchored; scoped supersession (FALSIFIER 9) ───────── */
    console.log('\n8 · current location — three-state, scoped to what moved');
    const now = await loadLiveWork(manuscriptId, memberId);
    const locS1 = locateCurrent({ kind: 'section', sectionId: s1 }, rs, now);
    check('FALSIFIER 9 · the edited section is SUPERSEDED (section-text), not re-anchored',
      locS1.state === 'superseded' && locS1.moved[0].what === 'section-text');
    check('FALSIFIER 9 · the untouched section stays CURRENT',
      locateCurrent({ kind: 'section', sectionId: s0 }, rs, now).state === 'current');
    check('FALSIFIER 9 · the run stays CURRENT — order did not move',
      locateCurrent(refs[2], rs, now).state === 'current');
    check('FALSIFIER 9 · the structure refs stay CURRENT — structure did not move',
      locateCurrent(refs[3], rs, now).state === 'current' && locateCurrent(refs[4], rs, now).state === 'current');
    check('FALSIFIER 9 · with the Work unmeasurable the answer is UNMEASURED, never current',
      locateCurrent({ kind: 'section', sectionId: s0 }, rs, { sections: null, structure: null }).state === 'unmeasured');

    /* ── 9 · authored structure changes (FALSIFIER 2) ───────────────────── */
    console.log('\n9 · the author renames a division');
    const rn = await renameUnit(manuscriptId, memberId, u1Id, { kind: 'chapter', title: 'Opening, revised' });
    check('rename accepted', rn.status === 'ok');
    const nowRenamed = await loadLiveWork(manuscriptId, memberId);
    const recU1 = recoverEvidence(refs[3], rs, null);
    check('FALSIFIER 2 · the structure ref recovers the unit AS READ — the old title',
      recU1.ok && recU1.value.kind === 'structure' && recU1.value.units[0].title === 'Opening');
    const locU1 = locateCurrent(refs[3], rs, nowRenamed);
    check('FALSIFIER 2 · the renamed unit is SUPERSEDED (structure-unit)',
      locU1.state === 'superseded' && locU1.moved[0].what === 'structure-unit');
    check('FALSIFIER 2 · the whole topology is SUPERSEDED',
      locateCurrent(refs[4], rs, nowRenamed).state === 'superseded');
    check('FALSIFIER 9 · the sibling unit and the untouched section stay CURRENT (INV-21 scoping)',
      locateCurrent({ kind: 'structure-unit', unitId: u2Id }, rs, nowRenamed).state === 'current'
      && locateCurrent({ kind: 'section', sectionId: s0 }, rs, nowRenamed).state === 'current');
    const obs = observationLocation([{ kind: 'section', sectionId: s0 }, refs[3]], rs, nowRenamed);
    check('an observation resting on both is superseded by the structure alone',
      obs.state === 'superseded' && obs.moved.length === 1 && obs.moved[0].what === 'structure-unit');

    /* ── 10 · no re-partition (FALSIFIER 4) ─────────────────────────────── */
    console.log('\n10 · a revision whose boundaries were never observed');
    const cur = await snapshotWork();
    /* A revision row shaped as the pre-conversion era wrote them: content, no
       partition. Inserted directly because no production path writes one any
       more — that is the point. It is the newest revision, so a capture must
       meet it and refuse. */
    await query(
      `INSERT INTO working_draft_revisions (draft_id, revision_number, content, saved_by, note, section_partition)
       VALUES ($1, 99, $2, $3, 'legacy-shaped witness row', NULL)`,
      [cur.draftId, cur.content, memberId]);
    const legacy = await captureEvidence(manuscriptId, memberId, { bodyScope: [s0], withStructure: false });
    check('FALSIFIER 4 · a capture meeting a partition-less revision REFUSES — it never re-partitions',
      !legacy.ok && legacy.refusal === 'partition_not_recorded', legacy.ok ? 'captured!' : legacy.refusal);
    const pure = freezeReadState({
      draft: { draftId: cur.draftId, content: cur.content, sections: cur.sections.map((s) => ({ id: s.id, text: s.text })) },
      revision: { revisionNumber: 99, content: cur.content, sectionPartition: null },
      bodyScope: [s0],
    });
    check('FALSIFIER 4 · the pure freeze refuses the same way', !pure.ok && pure.refusal === 'partition_not_recorded');

    /* ── 11 · the substrate cannot act (FALSIFIER 10, static half) ──────── */
    console.log('\n11 · the substrate, statically');
    const dir = join(process.cwd(), 'lib', 'manuscript', 'development');
    const files = readdirSync(dir).filter((f) => f.endsWith('.ts'));
    const src = files.map((f) => readFileSync(join(dir, f), 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, ''));
    check('FALSIFIER 10 · no module imports a model client, a reader or a prompt',
      src.every((s) => !/from\s+'[^']*(anthropic|maiaReader|askReader|lib\/ai|lib\/maia)[^']*'/.test(s)));
    check('FALSIFIER 10 · no module writes to any table',
      src.every((s) => !/\b(INSERT\s+INTO|UPDATE\s+[a-z_]+\s+SET|DELETE\s+FROM)\b/i.test(s)));
    const finalWork = await snapshotWork();
    check('FALSIFIER 10 · after every capture and recovery the Work is what the AUTHOR made it',
      sameWork(cur, { ...finalWork, revisions: cur.revisions, lastRevision: cur.lastRevision }),
      'only the witness\'s own legacy-shaped row was added, by the witness');
  } catch (e) {
    fail('witness aborted', e);
  } finally {
    if (process.env.KEEP_FIXTURE === '1') {
      console.log(`  fixture kept: username ws207a-${tag} · ref ${memberRef(memberId)}`);
    } else {
      /* By the ids this run created. Manuscripts first: revisions RESTRICT
         member deletion through saved_by. */
      await query(`DELETE FROM member_manuscripts WHERE id = $1`, [manuscriptId]);
      await query(`DELETE FROM auth_sessions WHERE member_id = $1`, [memberId]);
      await query(`DELETE FROM members WHERE id = $1`, [memberId]);
    }
  }

  console.log(`\n${checks} checks · ${failures} failure(s)\n`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
