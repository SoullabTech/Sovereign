/**
 * KEEP A VERSION — the checkpoint falsifier.
 *
 *   DATABASE_URL=postgres://... npx tsx scripts/ws2-keep-a-version-gate.ts
 *
 * Written because a repair passed its unit tests and still altered a member's
 * Work. On the founder's walk of 2026-09-05, "Keep a version" rebuilt the
 * manuscript from a client-held snapshot: the flattened draft went 496 → 485
 * bytes, the section headings vanished and a leading space appeared. No
 * sentence was lost, and that is exactly why source-level assertions could not
 * catch it — the prose survived while the REPRESENTATION did not, and every
 * developmental observation then superseded against a change the writer never
 * made.
 *
 * So this gate does not ask whether the sentences are still there. It asks
 * whether the bytes are.
 *
 *     Keeping a version may add a revision. It may change nothing else.
 *
 * K1–K5 walk the representation boundary that actually failed: a draft whose
 * content carries headings and blank lines, edited section by section through
 * the autosave path, then checkpointed. K6 is the race — if the draft moves
 * between the checkpoint's read and its write, the checkpoint must refuse and
 * leave both the Work and the revision store untouched.
 *
 * The seam is REFUSED throughout: no model participates in keeping a version,
 * and if one ever did, this gate would be the wrong instrument.
 */

import { randomUUID } from 'crypto';
import { execSync } from 'child_process';
import Module from 'module';
import { NextRequest } from 'next/server';

process.env.MAIA_INFERENCE_MODE = 'sovereign';

const emptyCookies = { get: () => undefined, getAll: () => [], has: () => false };
const moduleLoader = Module as unknown as { _load: (r: string, ...rest: unknown[]) => unknown };
const originalLoad = moduleLoader._load;
moduleLoader._load = function (this: unknown, request: string, ...rest: unknown[]) {
  if (request === 'next/headers') return { cookies: async () => emptyCookies, headers: async () => new Headers() };
  return originalLoad.call(this, request, ...rest);
};

let checks = 0; let failures = 0; const failed: string[] = [];
function check(id: string, ok: boolean, detail = ''): void {
  checks += 1;
  if (!ok) { failures += 1; failed.push(id); }
  console.log(`  ${ok ? '✓' : '✗'} ${id}${detail ? `  (${detail})` : ''}`);
}

/* Headings and blank lines are the point: they are what the defect ate. */
const SECTIONS = [
  { heading: 'Arrival', body: 'Mara found the lantern in the shed the week the river changed course. It lit on the first try. She told no one.' },
  { heading: 'Council', body: 'The council met about the river. Mara counted the ways the men avoided the word flood. Eleven. She did not mention the lantern.' },
  { heading: 'Tomas',   body: 'Her brother came home with a plan and a woman who laughed at the wrong moments. Mara moved the lantern under her bed.' },
  { heading: 'Water',   body: 'The river rose into the lower street. The eleven silences became one loud argument in the church hall.' },
];

async function main() {
  if (!process.env.DATABASE_URL) { console.error('DATABASE_URL is required'); process.exit(2); }
  const head = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
  const { query } = await import('@/lib/db/postgres');
  const draftRoute = await import('@/app/api/sovereign/manuscripts/[id]/draft/route');
  const sectionRoute = await import('@/app/api/sovereign/manuscripts/[id]/sections/[sectionId]/route');

  console.log(`\nKEEP A VERSION · checkpoint falsifier · checkout ${head}\n`);
  const enc = await query<{ e: string }>(`SELECT current_setting('server_encoding') AS e`);
  check('K0 database server_encoding = UTF8 (else STOP)', enc.rows[0]!.e === 'UTF8', enc.rows[0]!.e);
  if (enc.rows[0]!.e !== 'UTF8') process.exit(1);

  const tag = randomUUID().slice(0, 8);
  const m = await query<{ id: string }>(
    `INSERT INTO members (passkey, username, password_hash, name) VALUES ($1, $2, 'x', $3) RETURNING id`,
    [`WS2KAV-${tag}`, `ws2kav-${tag}`, 'WS2 Keep a version gate']);
  const memberId = m.rows[0]!.id;
  const token = `ws2kav-${randomUUID().replace(/-/g, '')}`.slice(0, 64);
  await query(`INSERT INTO auth_sessions (member_id, session_token, expires_at) VALUES ($1, $2, NOW() + INTERVAL '1 hour')`, [memberId, token]);
  const ms = await query<{ id: string }>(
    `INSERT INTO member_manuscripts (member_id, title) VALUES ($1, 'Keep a version fixture') RETURNING id`, [memberId]);
  const manuscriptId = ms.rows[0]!.id;
  for (const [i, s] of SECTIONS.entries()) {
    await query(`INSERT INTO manuscript_sections (manuscript_id, position, heading, body) VALUES ($1, $2, $3, $4)`,
      [manuscriptId, i, s.heading, s.body]);
  }

  const base = `http://localhost/api/sovereign/manuscripts/${manuscriptId}`;
  const req = (method: string, path: string, body?: unknown) => new NextRequest(`${base}${path}`, {
    method, headers: { 'content-type': 'application/json', 'x-session-token': token },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const P = { params: Promise.resolve({ id: manuscriptId }) };
  const PS = (sectionId: string) => ({ params: Promise.resolve({ id: manuscriptId, sectionId }) });

  const getDraft = async () => (await (await draftRoute.GET(req('GET', '/draft'), P)).json()) as {
    sectionAddressable: boolean; sections?: { id: string; text: string }[]; content: string; revisionId: number; revisionCount: number;
  };
  const revisions = async () => (await query<{ n: string; last: string | null }>(
    `SELECT count(*)::text AS n, max(r.content) FILTER (WHERE r.revision_number = (SELECT max(revision_number) FROM working_draft_revisions r2 WHERE r2.draft_id = r.draft_id)) AS last
       FROM working_draft_revisions r JOIN manuscript_working_drafts d ON d.id = r.draft_id
      WHERE d.manuscript_id = $1`, [manuscriptId])).rows[0]!;

  try {
    const created = await draftRoute.POST(req('POST', '/draft'), P);
    if (created.status !== 201) { console.log(`✗ draft POST ${created.status}`); process.exit(3); }
    const opened = await getDraft();
    check('K1 the draft is section-addressable, and its content carries the headings',
      opened.sectionAddressable && Array.isArray(opened.sections)
      && SECTIONS.every((s) => opened.content.includes(s.heading)),
      `${opened.content.length} bytes`);

    /* ── K2 · every section edited through the AUTOSAVE path, one at a time,
       which is the state the defect arose from: several sections changed
       since the surface mounted. ── */
    for (const s of opened.sections!) {
      const before = await getDraft();
      const live = before.sections!.find((x) => x.id === s.id)!;
      const res = await sectionRoute.PUT(
        req('PUT', `/sections/${s.id}`, { body: `${live.text} Edited.`, baseVersion: before.revisionId }), PS(s.id));
      if (res.status !== 200) { console.log(`✗ section PUT ${res.status}`); process.exit(3); }
    }
    const edited = await getDraft();
    check('K2 all four sections were edited and persisted, one by one',
      edited.sections!.every((s) => s.text.includes('Edited.')), `${edited.sections!.length} sections`);

    /* ── K3–K5 · the checkpoint. Hand the server back EXACTLY the sections it
       just returned, and prove it changed nothing but the revision store. ── */
    const before = await getDraft();
    const revsBefore = await revisions();
    const kept = await draftRoute.PUT(req('PUT', '/draft', {
      sections: before.sections,
      baseRevisionId: before.revisionId,
      idempotencyKey: randomUUID(),
      checkpoint: true,
    }), P);
    check('K3 the checkpoint is accepted', kept.status === 200, `status ${kept.status}`);

    const after = await getDraft();
    check('K4 the Work is BYTE-IDENTICAL after keeping a version — headings, blank lines and every space',
      after.content === before.content,
      after.content === before.content ? `${after.content.length} bytes, unchanged`
        : `${before.content.length} → ${after.content.length} bytes — THE DEFECT`);
    check('K4 every section is byte-identical, in the same order, under the same ids',
      JSON.stringify(after.sections) === JSON.stringify(before.sections));

    const revsAfter = await revisions();
    check('K5 exactly one revision was added, and it holds the Work as it stood',
      Number(revsAfter.n) === Number(revsBefore.n) + 1 && revsAfter.last === before.content,
      `${revsBefore.n} → ${revsAfter.n} revisions`);

    /* ── K6 · the race. The draft moves between the checkpoint's read and its
       write; the checkpoint must refuse and touch nothing. ── */
    const raceRead = await getDraft();
    const moved = raceRead.sections![0]!;
    await sectionRoute.PUT(req('PUT', `/sections/${moved.id}`,
      { body: `${moved.text} Moved elsewhere.`, baseVersion: raceRead.revisionId }), PS(moved.id));
    const beforeRace = await getDraft();
    const revsBeforeRace = await revisions();
    const raced = await draftRoute.PUT(req('PUT', '/draft', {
      sections: raceRead.sections,
      baseRevisionId: raceRead.revisionId,
      idempotencyKey: randomUUID(),
      checkpoint: true,
    }), P);
    const afterRace = await getDraft();
    const revsAfterRace = await revisions();
    check('K6 a checkpoint whose base moved is REFUSED', raced.status === 409, `status ${raced.status}`);
    check('K6 the refusal overwrote nothing — the newer text stands',
      afterRace.content === beforeRace.content && afterRace.content.includes('Moved elsewhere.'));
    check('K6 the refusal kept no version', Number(revsAfterRace.n) === Number(revsBeforeRace.n),
      `${revsBeforeRace.n} → ${revsAfterRace.n} revisions`);
  } catch (e) {
    console.log(`  stopped: ${(e as Error).message}`);
    failures += 1; failed.push('threw');
  } finally {
    await query(`DELETE FROM member_manuscripts WHERE id = $1`, [manuscriptId]);
    await query(`DELETE FROM auth_sessions WHERE member_id = $1`, [memberId]);
    await query(`DELETE FROM members WHERE id = $1`, [memberId]);
  }

  console.log(`\n${checks} checks · ${failures} failures${failures ? `\n  failed: ${failed.join('\n          ')}` : ''}\n`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });
