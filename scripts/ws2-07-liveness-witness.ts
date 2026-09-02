/**
 * WS2-07 prerequisite — the SECTION-ADDRESSABLE DRAFT LIVENESS witness.
 *
 * ONE QUESTION, asked of a live database through the REAL ROUTE HANDLERS:
 *
 *     Can a member start a draft, write into it, keep a version and restore
 *     one — on a draft whose sections are the writable truth — through the
 *     ordinary product path, without any script placing a row for them?
 *
 * WHY THE HANDLERS AND NOT THE SERVICES. B3 found that the entire structure
 * path operated only on drafts a WITNESS SCRIPT had converted: built, proven,
 * and unreachable by any member. A witness that calls services would repeat
 * exactly that mistake at one remove. So every draft row here is created by
 * POST, every save by PUT, every read by GET, every restore by the revisions
 * POST — the same functions a browser reaches.
 *
 * AUTHENTICATION IS REAL. The walk creates a genuine `auth_sessions` row and
 * presents its token in `x-session-token`, so `getMemberIdFromRequest` performs
 * its actual session lookup. `next/headers` is shimmed to an EMPTY cookie jar,
 * which is not a bypass — it is the Safari/iOS case the header path exists for.
 * The negative controls below prove the gate is closed, not merely satisfied.
 *
 * NO MEMBER PROSE IS PRINTED. Lengths, digests, counts and ids only.
 *
 * IT CREATES ITS OWN MEMBER AND MANUSCRIPT and deletes both at the end, by the
 * ids this run created — never by name or by pattern. It never reads, writes or
 * reports on anything it did not create.
 *
 *   DATABASE_URL=... npx tsx scripts/ws2-07-liveness-witness.ts
 *
 * KEEP_FIXTURE=1 leaves the fixture in place for inspection.
 */
import { createHash } from 'crypto';
import { randomUUID } from 'crypto';
import { memberRef } from '@/lib/privacy/memberRef';
import Module from 'module';

/* An empty cookie jar, standing in for a client whose cookies are blocked.
   Installed before the routes are imported so their `next/headers` binding is
   this one. It grants nothing: with no cookie present, authority can only come
   from a session token that the database actually recognises. */
const emptyCookies = { get: () => undefined, getAll: () => [], has: () => false };
const originalResolve = (Module as unknown as { _load: (...a: unknown[]) => unknown })._load;
(Module as unknown as { _load: (...a: unknown[]) => unknown })._load = function (
  this: unknown, request: string, ...rest: unknown[]
) {
  if (request === 'next/headers') {
    return { cookies: async () => emptyCookies, headers: async () => new Headers() };
  }
  return (originalResolve as (...a: unknown[]) => unknown).call(this, request, ...rest);
};

const digest = (s: string) => createHash('sha256').update(s, 'utf8').digest('hex').slice(0, 12);

async function main() {
  const { query } = await import('@/lib/db/postgres');
  const { NextRequest } = await import('next/server');
  const draft = await import('@/app/api/sovereign/manuscripts/[id]/draft/route');
  const revisions = await import('@/app/api/sovereign/manuscripts/[id]/draft/revisions/route');

  let failures = 0;
  const check = (name: string, pass: boolean, detail = '') => {
    console.log(`  ${pass ? 'ok  ' : 'FAIL'}  ${name}${detail ? `  ${detail}` : ''}`);
    if (!pass) failures += 1;
  };

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

  /* ── fixture: one member, one signed-in session, one manuscript ───────── */
  const tag = randomUUID().slice(0, 8);
  const member = await query<{ id: string }>(
    `INSERT INTO members (passkey, username, password_hash, name)
     VALUES ($1, $2, 'x', 'WS2-07 witness') RETURNING id`,
    [`WS207-${tag}`, `ws207-${tag}`]);
  const memberId = member.rows[0].id;
  const token = `ws207-${randomUUID().replace(/-/g, '')}`.slice(0, 64);
  await query(
    `INSERT INTO auth_sessions (member_id, session_token, expires_at)
     VALUES ($1, $2, NOW() + INTERVAL '1 hour')`, [memberId, token]);
  const ms = await query<{ id: string }>(
    `INSERT INTO member_manuscripts (member_id, title) VALUES ($1, 'WS2-07 witness fixture')
     RETURNING id`, [memberId]);
  const manuscriptId = ms.rows[0].id;
  await query(
    `INSERT INTO manuscript_sections (manuscript_id, position, heading, body) VALUES
       ($1, 0, 'The First Movement', 'Synthetic fixture prose, first section.'),
       ($1, 1, 'The Second Movement', 'Synthetic fixture prose, second section.'),
       ($1, 2, NULL, 'Synthetic fixture prose, an unheaded third section.')`,
    [manuscriptId]);

  const params = { params: Promise.resolve({ id: manuscriptId }) };
  const url = `http://localhost/api/sovereign/manuscripts/${manuscriptId}/draft`;
  const req = (method: string, body?: unknown, auth = true) =>
    new NextRequest(url, {
      method,
      headers: {
        'content-type': 'application/json',
        ...(auth ? { 'x-session-token': token } : {}),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
  const revUrl = `${url}/revisions`;
  const revReq = (method: string, body?: unknown) =>
    new NextRequest(revUrl, {
      method,
      headers: { 'content-type': 'application/json', 'x-session-token': token },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });

  try {
    /* ── 1 · the gate is closed ──────────────────────────────────────────── */
    console.log('\n1 · the gate, before anything else');
    const anon = await draft.POST(req('POST', undefined, false), params);
    check('an unauthenticated create is refused', anon.status === 401, `status ${anon.status}`);
    const wrongToken = await draft.GET(
      new NextRequest(url, { method: 'GET', headers: { 'x-session-token': 'not-a-session' } }),
      params);
    check('a token the database does not know is refused',
      wrongToken.status === 401, `status ${wrongToken.status}`);

    /* ── 2 · D — a new draft is BORN section-addressable ─────────────────── */
    console.log('\n2 · D · the member starts a draft (POST, the ordinary path)');
    const created = await draft.POST(req('POST'), params);
    const createdBody = await created.json();
    check('created', created.status === 201, `status ${created.status}`);
    check('section-addressable from birth', createdBody.sectionAddressable === true);
    check('the server minted an identity per source section',
      Array.isArray(createdBody.sections) && createdBody.sections.length === 3,
      `${createdBody.sections?.length} sections`);
    check('every identity is a real uuid the client did not invent',
      (createdBody.sections ?? []).every((s: { id: string }) =>
        /^[0-9a-f-]{36}$/.test(s.id)));

    const rows = await query<{ n: string }>(
      `SELECT count(*)::text AS n FROM manuscript_draft_sections s
         JOIN manuscript_working_drafts d ON d.id = s.draft_id
        WHERE d.manuscript_id = $1`, [manuscriptId]);
    check('the partition is in the database, not only in the response',
      rows.rows[0].n === '3', `${rows.rows[0].n} rows`);

    const firstRev = await query<{ partition: unknown; content: string }>(
      `SELECT r.section_partition AS partition, r.content FROM working_draft_revisions r
         JOIN manuscript_working_drafts d ON d.id = r.draft_id
        WHERE d.manuscript_id = $1 AND r.revision_number = 1`, [manuscriptId]);
    check('revision 1 froze its section partition',
      Array.isArray(firstRev.rows[0].partition)
      && (firstRev.rows[0].partition as unknown[]).length === 3);

    /* ── 3 · the round trip the triggers enforce ─────────────────────────── */
    console.log('\n3 · the round trip, as bytes');
    const flat = await query<{ same: boolean; len: number }>(
      `SELECT convert_to(COALESCE(string_agg(s.text, '' ORDER BY s.position), ''), 'UTF8')
              = convert_to(d.content, 'UTF8') AS same,
              length(d.content) AS len
         FROM manuscript_working_drafts d
         LEFT JOIN manuscript_draft_sections s ON s.draft_id = d.id
        WHERE d.manuscript_id = $1 GROUP BY d.content`, [manuscriptId]);
    check('sections flatten to content, byte for byte',
      flat.rows[0]?.same === true, `${flat.rows[0]?.len} chars`);

    /* ── 4 · B — the member writes, by section ───────────────────────────── */
    console.log('\n4 · B · the member writes (PUT, section-native)');
    let sections = createdBody.sections as { id: string; text: string }[];
    let revisionId = createdBody.revisionId as number;
    const edited = sections.map((s, i) =>
      i === 1 ? { ...s, text: `${s.text}A further sentence, added by the member.\n\n` } : s);
    const saved = await draft.PUT(
      req('PUT', { sections: edited, baseRevisionId: revisionId, idempotencyKey: randomUUID() }),
      params);
    const savedBody = await saved.json();
    check('the save is accepted', saved.status === 200, `status ${saved.status}`);
    check('the draft version advanced', savedBody.revisionId === revisionId + 1);
    revisionId = savedBody.revisionId;

    const after = await draft.GET(req('GET'), params);
    const afterBody = await after.json();
    check('the words came back through GET',
      afterBody.sections?.[1]?.text === edited[1].text);
    check('content is the flattening the server derived',
      afterBody.content === edited.map((s) => s.text).join(''),
      `digest ${digest(afterBody.content)}`);
    check('identities are unchanged by a write',
      JSON.stringify(afterBody.sections.map((s: { id: string }) => s.id))
      === JSON.stringify(edited.map((s) => s.id)));
    sections = afterBody.sections;

    /* ── 5 · the negative path: a content-only save ──────────────────────── */
    console.log('\n5 · the negative path · a content-only save against a converted draft');
    const before = await query<{ version: string; revision_count: number; revs: string }>(
      `SELECT d.version::text AS version, d.revision_count,
              (SELECT count(*)::text FROM working_draft_revisions r WHERE r.draft_id = d.id) AS revs
         FROM manuscript_working_drafts d WHERE d.manuscript_id = $1`, [manuscriptId]);
    const refused = await draft.PUT(
      req('PUT', { content: 'the whole draft, rewritten',
                   baseRevisionId: revisionId, idempotencyKey: randomUUID() }), params);
    const refusedBody = await refused.json();
    check('refused, typed', refused.status === 409 && refusedBody.refusal === 'section_state_required',
      `${refused.status} ${refusedBody.refusal ?? refusedBody.error}`);
    check('NOT a database exception dressed as a 500', refused.status !== 500);
    const afterRefusal = await query<{ version: string; revision_count: number; revs: string }>(
      `SELECT d.version::text AS version, d.revision_count,
              (SELECT count(*)::text FROM working_draft_revisions r WHERE r.draft_id = d.id) AS revs
         FROM manuscript_working_drafts d WHERE d.manuscript_id = $1`, [manuscriptId]);
    check('no version advance', afterRefusal.rows[0].version === before.rows[0].version);
    check('no checkpoint row', afterRefusal.rows[0].revs === before.rows[0].revs);
    check('no write of any kind',
      afterRefusal.rows[0].revision_count === before.rows[0].revision_count);

    /* ── 6 · the other refusals, each with zero writes ───────────────────── */
    console.log('\n6 · the rest of the typed refusals');
    const cases: [string, unknown, string][] = [
      ['content AND sections together',
        { content: 'x', sections, baseRevisionId: revisionId }, 'ambiguous_write_authority'],
      ['an id this draft does not own',
        { sections: [...sections.slice(0, 2), { id: randomUUID(), text: 'ghost' }],
          baseRevisionId: revisionId }, 'unknown_section_id'],
      ['a short list — omission is not a deletion',
        { sections: sections.slice(0, 2), baseRevisionId: revisionId },
        'topology_change_requires_explicit_command'],
      ['a reordered list',
        { sections: [sections[1], sections[0], sections[2]], baseRevisionId: revisionId },
        'topology_change_requires_explicit_command'],
      ['a duplicated id',
        { sections: [sections[0], sections[0], sections[1]], baseRevisionId: revisionId },
        'topology_change_requires_explicit_command'],
    ];
    for (const [name, body, expected] of cases) {
      const v0 = await query<{ v: string }>(
        `SELECT version::text AS v FROM manuscript_working_drafts WHERE manuscript_id = $1`,
        [manuscriptId]);
      const res = await draft.PUT(
        req('PUT', { ...(body as object), idempotencyKey: randomUUID() }), params);
      const b = await res.json();
      const v1 = await query<{ v: string }>(
        `SELECT version::text AS v FROM manuscript_working_drafts WHERE manuscript_id = $1`,
        [manuscriptId]);
      check(`${name} → ${expected}, zero writes`,
        res.status === 409 && b.refusal === expected && v0.rows[0].v === v1.rows[0].v,
        `${res.status} ${b.refusal ?? b.error}`);
    }

    /* ── 7 · D7 — a checkpoint, and its frozen partition ─────────────────── */
    console.log('\n7 · D7 · the member keeps a version');
    const kept = await draft.PUT(
      req('PUT', { sections, checkpoint: true, note: 'a kept version',
                   baseRevisionId: revisionId, idempotencyKey: randomUUID() }), params);
    const keptBody = await kept.json();
    check('checkpoint accepted', kept.status === 200 && keptBody.checkpointed === true,
      `status ${kept.status}`);
    revisionId = keptBody.revisionId;
    const keptRev = await query<{ n: number; partition: unknown }>(
      `SELECT r.revision_number AS n, r.section_partition AS partition
         FROM working_draft_revisions r JOIN manuscript_working_drafts d ON d.id = r.draft_id
        WHERE d.manuscript_id = $1 ORDER BY r.revision_number DESC LIMIT 1`, [manuscriptId]);
    check('the checkpoint froze its partition',
      Array.isArray(keptRev.rows[0].partition)
      && (keptRev.rows[0].partition as unknown[]).length === sections.length);
    const keptNumber = keptRev.rows[0].n;

    /* ── 8 · the member changes their mind, then restores ────────────────── */
    console.log('\n8 · the member writes on, then restores the kept version');
    const wandered = sections.map((s, i) => (i === 0 ? { ...s, text: 'A different opening.\n\n' } : s));
    const on = await draft.PUT(
      req('PUT', { sections: wandered, baseRevisionId: revisionId, idempotencyKey: randomUUID() }),
      params);
    revisionId = (await on.json()).revisionId;

    const listed = await revisions.GET(revReq('GET'), params);
    const listedBody = await listed.json();
    check('history says the draft is section-addressable', listedBody.sectionAddressable === true);
    check('every revision written since is marked restorable',
      listedBody.revisions.every((r: { restorable: boolean }) => r.restorable === true),
      `${listedBody.revisions.length} revisions`);

    const restored = await revisions.POST(
      revReq('POST', { revisionNumber: keptNumber, baseRevisionId: revisionId,
                       idempotencyKey: randomUUID() }), params);
    const restoredBody = await restored.json();
    check('restore accepted on a section-addressable draft',
      restored.status === 200, `status ${restored.status} ${restoredBody.refusal ?? ''}`);

    const back = await draft.GET(req('GET'), params);
    const backBody = await back.json();
    check('the kept words are back, section for section',
      JSON.stringify(backBody.sections) === JSON.stringify(sections),
      `digest ${digest(backBody.content)}`);
    check('restore did not reassign a single identity',
      JSON.stringify(backBody.sections.map((s: { id: string }) => s.id))
      === JSON.stringify(sections.map((s) => s.id)));

    const rt = await query<{ same: boolean }>(
      `SELECT convert_to(COALESCE(string_agg(s.text, '' ORDER BY s.position), ''), 'UTF8')
              = convert_to(d.content, 'UTF8') AS same
         FROM manuscript_working_drafts d
         LEFT JOIN manuscript_draft_sections s ON s.draft_id = d.id
        WHERE d.manuscript_id = $1 GROUP BY d.content`, [manuscriptId]);
    check('the round trip still holds after a restore', rt.rows[0]?.same === true);

    /* ── 9 · A · a pre-existing draft, converted ─────────────────────────── */
    console.log('\n9 · A · an EXISTING unconverted draft is converted, or refused');
    const ms2 = await query<{ id: string }>(
      `INSERT INTO member_manuscripts (member_id, title) VALUES ($1, 'WS2-07 legacy fixture')
       RETURNING id`, [memberId]);
    const legacyId = ms2.rows[0].id;
    await query(
      `INSERT INTO manuscript_sections (manuscript_id, position, heading, body) VALUES
         ($1, 0, 'Legacy One', 'Synthetic legacy prose.'),
         ($1, 1, 'Legacy Two', 'More synthetic legacy prose.')`, [legacyId]);
    /* Written the way a pre-conversion draft was: content only, no sections.
       This is the one row this walk places directly, because the product can no
       longer create an unconverted draft — which is the point of D. */
    const legacyContent = 'Legacy One\n\nSynthetic legacy prose.\n\nLegacy Two\n\nMore synthetic legacy prose.\n';
    const legacyDraft = await query<{ id: string }>(
      `INSERT INTO manuscript_working_drafts
         (manuscript_id, member_id, content, base_source_hash, revision_count)
       VALUES ($1, $2, $3, 'legacy', 1) RETURNING id`, [legacyId, memberId, legacyContent]);
    await query(
      `INSERT INTO working_draft_revisions (draft_id, revision_number, content, saved_by, note)
       VALUES ($1, 1, $2, $3, 'legacy')`, [legacyDraft.rows[0].id, legacyContent, memberId]);

    const legacyParams = { params: Promise.resolve({ id: legacyId }) };
    const legacyUrl = `http://localhost/api/sovereign/manuscripts/${legacyId}/draft`;
    const legacyReq = (method: string, body?: unknown) =>
      new NextRequest(legacyUrl, {
        method,
        headers: { 'content-type': 'application/json', 'x-session-token': token },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      });

    const stillWritable = await draft.PUT(
      legacyReq('PUT', { content: `${legacyContent}One more line.\n`,
                         baseRevisionId: 1, idempotencyKey: randomUUID() }), legacyParams);
    check('an unconverted draft is still written by content, unchanged',
      stillWritable.status === 200, `status ${stillWritable.status}`);

    const divergedConvert = await draft.POST(legacyReq('POST', { convert: true }), legacyParams);
    const divergedBody = await divergedConvert.json();
    check('a diverged draft REFUSES conversion rather than guessing boundaries',
      divergedConvert.status === 409
      && divergedBody.refusal === 'boundary_confirmation_required',
      `${divergedConvert.status} ${divergedBody.refusal ?? divergedBody.error}`);
    const stillNull = await query<{ n: string }>(
      `SELECT count(*)::text AS n FROM manuscript_draft_sections WHERE draft_id = $1`,
      [legacyDraft.rows[0].id]);
    check('the refused conversion wrote nothing', stillNull.rows[0].n === '0');

    /* Put it back to exactly the source partition, then convert. */
    await query(`UPDATE manuscript_working_drafts SET content = $2 WHERE id = $1`,
      [legacyDraft.rows[0].id, legacyContent]);
    const converted = await draft.POST(legacyReq('POST', { convert: true }), legacyParams);
    const convertedBody = await converted.json();
    check('a byte-identical draft converts', converted.status === 200
      && convertedBody.sectionAddressable === true, `status ${converted.status}`);
    check('conversion assigned one identity per source boundary',
      convertedBody.sections?.length === 2, `${convertedBody.sections?.length}`);
    check('conversion did not touch a single character',
      convertedBody.content === legacyContent, `digest ${digest(convertedBody.content)}`);

    /* ── 10 · the pre-conversion revision is honest about itself ─────────── */
    console.log('\n10 · a revision written before the conversion');
    const legacyRevs = await revisions.GET(
      new NextRequest(`${legacyUrl}/revisions`, {
        method: 'GET', headers: { 'x-session-token': token } }), legacyParams);
    const legacyRevsBody = await legacyRevs.json();
    check('it is marked NOT restorable, before the member chooses it',
      legacyRevsBody.revisions.some((r: { restorable: boolean }) => r.restorable === false));

    const legacyVersion = await query<{ v: string }>(
      `SELECT version::text AS v FROM manuscript_working_drafts WHERE id = $1`,
      [legacyDraft.rows[0].id]);
    const refusedRestore = await revisions.POST(
      new NextRequest(`${legacyUrl}/revisions`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-session-token': token },
        body: JSON.stringify({ revisionNumber: 1,
          baseRevisionId: Number(legacyVersion.rows[0].v), idempotencyKey: randomUUID() }),
      }), legacyParams);
    const refusedRestoreBody = await refusedRestore.json();
    check('restoring it REFUSES rather than re-partitioning older prose',
      refusedRestore.status === 409
      && refusedRestoreBody.refusal === 'partition_not_recorded',
      `${refusedRestore.status} ${refusedRestoreBody.refusal ?? refusedRestoreBody.error}`);
    const legacyVersionAfter = await query<{ v: string }>(
      `SELECT version::text AS v FROM manuscript_working_drafts WHERE id = $1`,
      [legacyDraft.rows[0].id]);
    check('the refused restore wrote nothing',
      legacyVersionAfter.rows[0].v === legacyVersion.rows[0].v);

    console.log(
      `\n${failures === 0 ? 'WITNESSED' : 'FAILED'} — ${failures} failing check(s)\n`);
    process.exitCode = failures === 0 ? 0 : 1;
  } finally {
    if (process.env.KEEP_FIXTURE === '1') {
      /* ⛔ NOT the member id. A raw identifier in a log is the pattern the
         member-identifier gate exists to stop, and CI logs are durable — the
         fact that THIS member is synthetic does not make the habit safe, and a
         truncation would still be a fragment of the real thing. The username
         this run invented is enough to find the fixture:
             SELECT id FROM members WHERE username = 'ws207-<tag>'
         and memberRef is the correlating handle if one is wanted. */
      console.log(`  fixture kept: username ws207-${tag} · ref ${memberRef(memberId)}`);
    } else {
      /* By the ids this run created. Never by name, never by pattern.
         Manuscripts first: member_manuscripts.member_id is ON DELETE RESTRICT,
         because a member row must never be removable while their book still
         exists. The witness respects that rather than working around it. */
      await query(`DELETE FROM member_manuscripts WHERE member_id = $1`, [memberId]);
      await query(`DELETE FROM members WHERE id = $1`, [memberId]);
      console.log('  fixture removed');
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
