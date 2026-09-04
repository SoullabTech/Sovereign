/**
 * BUILD-07C — GATE B · one bounded live commission against the exact candidate.
 *
 *   DATABASE_URL=<UTF-8 scratch, chain through 20260904000001> MAIA_INFERENCE_MODE= \
 *   npx tsx scripts/ws2-07c-reading-gate-b.ts [--out <file.json>]
 *
 * THE QUESTION (founder closure ruling): did the unit execute the proved
 * contract on a real read? Not whether the observations are good.
 *
 * WHAT IT DOES
 *   · refuses unless the reading module, the reader module and the migration
 *     on disk are byte-identical to the pinned candidate
 *   · creates ONE invented Work through the real draft route (section-
 *     addressable from birth, revision 1 with partition) and two authored
 *     parts through structureService — never a member's Work
 *   · commissions ONE developmental reading (one reader call + one classifier
 *     call), freezes it, retrieves it by identity → CURRENT
 *   · the author edits one section through the draft route → SUPERSEDED,
 *     scoped to the observations that depended on it
 *   · proves UNMEASURED is a distinct, reachable state
 *   · a second commission after a checkpoint is a NEW reading; the first is
 *     retained, byte-identical
 *   · writes a JSON record; cleans up its fixture rows
 *
 * WHAT IT DOES NOT DO
 *   · no retry, no second read on refusal, no tuning; a FAIL is classified
 */

import { createHash, randomUUID } from 'crypto';
import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import Module from 'module';

const CANDIDATE = '8a26a8971';
const CANDIDATE_BLOBS: Record<string, string> = {
  'lib/manuscript/developmentalReading/contract.ts': '8024937fc84904f169bb1131c5a08c3902b1365a',
  'lib/manuscript/developmentalReading/freeze.ts': 'c7b5e3ce5349bbdfe106d952cea2765302b915a6',
  'lib/manuscript/developmentalReading/classify.ts': '32fec5a3f62b28180b14ffdd7b816932282f068c',
  'lib/manuscript/developmentalReading/store.ts': 'b3b9f2906276b0622d8899661fd44dddf4fea268',
  'lib/manuscript/developmentalReading/assess.ts': 'acf40afe5bf34b1dbe1e4a04f4093628e4b8c009',
  'lib/manuscript/developmentalReading/commission.ts': '14c62a41e77ed560f1e68d11d5b129f19b3cfcac',
  'database/migrations/20260904000001_developmental_readings.sql': '545cc1fb4a7063355d7f9e0041adb57717611b7e',
  /* the 07B reader, unchanged since its own candidate 421f25bd6 */
  'lib/manuscript/developmentalReader/contract.ts': '372c71bd92d35027a21f6b9e7fc2964666c06dda',
  'lib/manuscript/developmentalReader/render.ts': '3d1a18f6f5bc33d86f02f6048a400ecf21057e52',
  'lib/manuscript/developmentalReader/validate.ts': '8ac9cbc6fbd510de67a916a1d118d90c2e2b4875',
  'lib/manuscript/developmentalReader/parse.ts': 'adbc500f68476a51fd033358c6ddb4ce58aef6cc',
  'lib/manuscript/developmentalReader/read.ts': 'af2e91677ae28301355aca24ac1a2a31cd85faf6',
};

function gitBlobId(path: string): string {
  const content = readFileSync(join(__dirname, '..', path));
  return createHash('sha1').update(`blob ${content.length}\0`).update(content).digest('hex');
}

/* An empty cookie jar, installed before the routes are imported, so authority
   can only come from a session token the database recognises (07A pattern). */
const emptyCookies = { get: () => undefined, getAll: () => [], has: () => false };
const moduleLoader = Module as unknown as { _load: (request: string, ...rest: unknown[]) => unknown };
const originalLoad = moduleLoader._load;
moduleLoader._load = function (this: unknown, request: string, ...rest: unknown[]) {
  if (request === 'next/headers') {
    return { cookies: async () => emptyCookies, headers: async () => new Headers() };
  }
  return originalLoad.call(this, request, ...rest);
};

const SECTIONS = [
  { heading: 'One', body: 'Mara found the lantern in her grandmother\'s shed the week the river changed course. It was brass, dented on one side, and it lit on the first try, which she took as a sign 😀. She told no one.' },
  { heading: 'Two', body: 'The town council met about the river. Mara sat at the back and counted the ways the men avoided saying the word flood. Eleven. She did not mention the lantern; it did not seem to belong to this kind of meeting.' },
  { heading: 'Three', body: 'Her brother Tomas came home from the city with a plan and a woman named Ines who laughed at the wrong moments. The plan involved the shed. Mara moved the lantern to her room and put it under the bed, where it hummed faintly at night — or she imagined it did.' },
  { heading: 'Four', body: 'The river rose. This is the chapter where the water comes into the lower street and the council\'s eleven silences become one loud argument in the church hall. Tomas\'s plan is mentioned again, and again nobody says what it is.' },
  { heading: 'Five', body: 'Mara takes the lantern to the water. Later she will say she does not know why. It does not do anything — it is a lantern — but she stands there holding it until Ines finds her, and Ines, for once, does not laugh.' },
  { heading: 'Six', body: 'After. The river settled into its new bed. The shed was gone. Tomas\'s plan, it turned out, had been to sell the land, and the land was now mostly river. Mara kept the lantern on the windowsill where anyone could see it.' },
];

function arg(name: string, fallback: string): string {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

let checks = 0; let failures = 0; const rows: { id: string; ok: boolean; detail?: string }[] = [];
function row(id: string, ok: boolean, detail?: string): void {
  checks += 1; if (!ok) failures += 1; rows.push({ id, ok, detail });
  console.log(`  ${ok ? '✓' : '✗'} ${id}${detail ? ` — ${detail}` : ''}`);
}

async function main() {
  const out = arg('out', join(process.cwd(), `ws2-07c-gate-b.${Date.now()}.json`));
  console.log('\nBUILD-07C · GATE B · bounded live commission\n');

  if (!process.env.DATABASE_URL) { console.error('DATABASE_URL is required'); process.exit(2); }
  const drift = Object.entries(CANDIDATE_BLOBS).map(([p, expected]) => ({ p, expected, actual: gitBlobId(p) })).filter((x) => x.actual !== x.expected);
  if (drift.length > 0) {
    console.log('✗ module on disk is not the pinned candidate:');
    for (const d of drift) console.log(`    ${d.p}\n      expected ${d.expected}\n      actual   ${d.actual}`);
    console.log('\nGATE B     REFUSED — witness only the candidate it was pinned to\n'); process.exit(3);
  }
  let head = 'unknown';
  try { head = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim(); } catch { /* not a checkout */ }
  console.log(`  candidate ${CANDIDATE} · reading + reader modules + migration byte-identical · checkout HEAD ${head}`);

  const { query } = await import('@/lib/db/postgres');
  const { NextRequest } = await import('next/server');
  const draftRoute = await import('@/app/api/sovereign/manuscripts/[id]/draft/route');
  const { createUnit, placeSections } = await import('@/lib/manuscript/structure/structureService');
  const { canonicalFingerprint } = await import('@/lib/manuscript/structure/canonicalFingerprint');
  const { loadLiveWork } = await import('@/lib/manuscript/development/capture');
  const { bindEvidence } = await import('@/lib/manuscript/development/bind');
  const router = await import('@/lib/ai/structured/router');
  const { commissionReading } = await import('@/lib/manuscript/developmentalReading/commission');
  const { loadReading, listReadings } = await import('@/lib/manuscript/developmentalReading/store');
  const { assessReading } = await import('@/lib/manuscript/developmentalReading/assess');
  const { isPhenomenon } = await import('@/lib/manuscript/developmentalReading/contract');
  const { READER_VERSION } = await import('@/lib/manuscript/developmentalReader/render');
  const { CLASSIFIER_VERSION } = await import('@/lib/manuscript/developmentalReading/classify');

  const enc = await query<{ e: string }>(`SELECT current_setting('server_encoding') AS e`);
  if (enc.rows[0].e !== 'UTF8') { console.log(`✗ server_encoding ${enc.rows[0].e} — STOP`); process.exit(3); }

  /* count seam calls without touching the seam's contract: wrap the export the
     commission's modules read at call time */
  let seamCalls = 0;
  const original = router.runStructured;
  (router as unknown as { runStructured: typeof original }).runStructured = (req) => { seamCalls += 1; return original(req); };

  /* ── fixture through the real routes ─────────────────────────────────── */
  const tag = randomUUID().slice(0, 8);
  const member = await query<{ id: string }>(`INSERT INTO members (passkey, username, password_hash, name) VALUES ($1, $2, 'x', 'WS2-07C Gate B') RETURNING id`, [`WS207C-${tag}`, `ws207c-${tag}`]);
  const memberId = member.rows[0].id;
  const token = `ws207c-${randomUUID().replace(/-/g, '')}`.slice(0, 64);
  await query(`INSERT INTO auth_sessions (member_id, session_token, expires_at) VALUES ($1, $2, NOW() + INTERVAL '1 hour')`, [memberId, token]);
  const ms = await query<{ id: string }>(`INSERT INTO member_manuscripts (member_id, title) VALUES ($1, 'The Lantern Road (invented Gate B fixture)') RETURNING id`, [memberId]);
  const manuscriptId = ms.rows[0].id;
  for (const [i, s] of SECTIONS.entries()) {
    await query(`INSERT INTO manuscript_sections (manuscript_id, position, heading, body) VALUES ($1, $2, $3, $4)`, [manuscriptId, i, s.heading, s.body]);
  }
  const params = { params: Promise.resolve({ id: manuscriptId }) };
  const url = `http://localhost/api/sovereign/manuscripts/${manuscriptId}/draft`;
  const req = (method: string, body?: unknown) => new NextRequest(url, {
    method, headers: { 'content-type': 'application/json', 'x-session-token': token },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const snapshot = async () => {
    const d = await query<{ id: string; content: string; version: string; revision_count: number }>(`SELECT id, content, version::text AS version, revision_count FROM manuscript_working_drafts WHERE manuscript_id = $1`, [manuscriptId]);
    const s = await query<{ id: string; text: string }>(`SELECT id, text FROM manuscript_draft_sections WHERE draft_id = $1 ORDER BY position`, [d.rows[0].id]);
    return JSON.stringify({ d: d.rows[0], s: s.rows, f: await canonicalFingerprint(manuscriptId) });
  };

  const record: Record<string, unknown> = { unit: 'BUILD-07C', gate: 'B', candidate: CANDIDATE, checkoutHead: head, ranAt: new Date().toISOString() };
  try {
    const created = await draftRoute.POST(req('POST'), params);
    const createdBody = await created.json();
    if (created.status !== 201) { console.log(`✗ draft POST ${created.status}`, createdBody); process.exit(3); }
    const sections = createdBody.sections as { id: string; text: string }[];
    let revisionId = createdBody.revisionId as number;
    const [w1, w2, w3, w4, w5, w6] = sections.map((s) => s.id);
    const u1 = await createUnit(manuscriptId, memberId, { kind: 'part', title: 'Before the water', parentId: null });
    const u2 = await createUnit(manuscriptId, memberId, { kind: 'part', title: 'After', parentId: null });
    if (u1.status !== 'ok' || u2.status !== 'ok') { console.log('✗ structure fixture failed'); process.exit(3); }
    await placeSections(manuscriptId, memberId, { unitId: u1.value.id, fromSectionId: w1, toSectionId: w3 });
    await placeSections(manuscriptId, memberId, { unitId: u2.value.id, fromSectionId: w4, toSectionId: w6 });
    const bodyScope = [w1, w2, w3, w5];
    console.log(`  fixture: 6 sections · body ${['w1', 'w2', 'w3', 'w5'].join(',')} · two authored parts · lens development`);

    /* ── D1–D5 · the commission ──────────────────────────────────────────── */
    const before = await snapshot();
    seamCalls = 0;
    const t0 = Date.now();
    const c = await commissionReading({ manuscriptId, memberId, lens: 'development', bodyScope, withStructure: true });
    const latencyMs = Date.now() - t0;
    const callsForFirst = seamCalls;
    row('D1 one commission froze a reading (or a legitimate none)', c.outcome === 'frozen', c.outcome === 'refused' ? `${c.stage}: ${c.refusal}: ${c.detail}` : `${c.reading.outcome}, ${latencyMs} ms`);
    if (c.outcome !== 'frozen') {
      record.refusal = { stage: c.stage, refusal: c.refusal, detail: c.detail };
    } else {
    const reading = c.reading;
    row('D2 id minted by the database; frozenAt stamped by the store', /^[0-9a-f-]{36}$/.test(reading.id) && !Number.isNaN(Date.parse(reading.provenance.frozenAt)), reading.id);
    const loaded = await loadReading(reading.id, memberId);
    row('D3 retrieved by identity, equal to the commissioned reading', JSON.stringify(loaded) === JSON.stringify(reading));
    const evidence = { readState: reading.readState, coverage: reading.coverage };
    const obsOk = reading.observations.every((o) =>
      o.observation.trim().length > 0 && isPhenomenon(o.phenomenon) && o.lens === 'development'
      && bindEvidence(o.evidenceRefs, evidence).ok && o.doesNotEstablish.length > 0
      && Object.keys(o).sort().join(',') === 'doesNotEstablish,evidenceRefs,key,lens,observation,phenomenon,structureDependency');
    row(`D4 every observation: verbatim text · phenomenon in the family · refs re-bind · ≥1 non-conclusion · seven fields (${reading.observations.length} observation(s))`, reading.outcome === 'none' || obsOk);
    row('D5 reader provenance DEVELOPMENTAL-READER-01 with resolved model; classifier DEVELOPMENTAL-PHENOMENON-01 iff observations, same model',
      reading.provenance.reader.readerVersion === READER_VERSION && reading.provenance.reader.model.length > 0
      && (reading.outcome === 'none' ? reading.provenance.classifier === null
        : reading.provenance.classifier?.classifierVersion === CLASSIFIER_VERSION && reading.provenance.classifier.model === reading.provenance.reader.model),
      `reader ${reading.provenance.reader.model}${reading.provenance.classifier ? ` · classifier ${reading.provenance.classifier.model}` : ''}`);

    /* ── D6–D10 · current → superseded → unmeasured ─────────────────────── */
    const a0 = assessReading(reading, await loadLiveWork(manuscriptId, memberId));
    row('D6 before any edit: CURRENT', a0.reading.state === 'current' && Object.values(a0.observations).every((l) => l.state === 'current'));
    const edited = sections.map((s) => s.id === w1 ? { ...s, text: `${s.text}\n\nA sentence the author added after the reading 🌒.` } : s);
    const saved = await draftRoute.PUT(req('PUT', { sections: edited, baseRevisionId: revisionId, idempotencyKey: randomUUID() }), params);
    const savedBody = await saved.json();
    row('D7 the author edits section w1 through the draft route (no checkpoint)', saved.status === 200, `status ${saved.status}`);
    revisionId = savedBody.revisionId ?? revisionId;
    const a1 = assessReading(reading, await loadLiveWork(manuscriptId, memberId));
    const dependsOnW1 = (o: (typeof reading.observations)[number]) => o.evidenceRefs.some((r) => ('sectionId' in r && r.sectionId === w1));
    const scoped = reading.observations.every((o) => {
      const loc = a1.observations[o.key];
      if (!loc) return false;
      if (dependsOnW1(o)) return loc.state === 'superseded' && loc.moved.some((m) => m.what === 'section-text' && 'sectionId' in m && m.sectionId === w1);
      return loc.state === 'current';
    });
    const noneScoped = reading.outcome === 'none' && a1.reading.state === 'superseded';
    row('D8 after the edit: SUPERSEDED exactly where evidence depended on w1 (section-text named); everything else CURRENT',
      reading.outcome === 'none' ? noneScoped : scoped,
      `${Object.entries(a1.observations).map(([k, l]) => `${k}:${l.state}`).join(' ')}`);
    const a2 = assessReading(reading, { sections: null, structure: null });
    const a3 = assessReading(reading, await loadLiveWork(manuscriptId, randomUUID()));
    row('D9 UNMEASURED is a distinct, reachable state (Work unloadable; Work not this member\'s) — never current', a2.reading.state === 'unmeasured' && a3.reading.state === 'unmeasured');
    const again = await loadReading(reading.id, memberId);
    row('D10 the stored reading is byte-identical after the edit and the assessments — never re-anchored, retained', JSON.stringify(again) === JSON.stringify(reading));

    /* ── D11–D12 · a new reading, and nothing else moved ───────────────── */
    const stale = await commissionReading({ manuscriptId, memberId, lens: 'development', bodyScope, withStructure: true });
    row('D11a a commission against a Work whose revision no longer matches is refused at capture, stores nothing', stale.outcome === 'refused' && stale.stage === 'capture' && stale.refusal === 'revision_not_current');
    const cp = await draftRoute.PUT(req('PUT', { sections: edited, baseRevisionId: revisionId, idempotencyKey: randomUUID(), checkpoint: true, note: 'after the moon' }), params);
    const cpBody = await cp.json();
    const second = cp.status === 200 ? await commissionReading({ manuscriptId, memberId, lens: 'development', bodyScope, withStructure: true }) : null;
    const listed = await listReadings(manuscriptId, memberId);
    row('D11b after a checkpoint, a second commission is a NEW reading with a new id; the first remains loadable',
      cp.status === 200 && cpBody.checkpointed === true && second?.outcome === 'frozen' && second.reading.id !== reading.id
      && listed.length === 2 && (await loadReading(reading.id, memberId)) !== null,
      second?.outcome === 'frozen' ? `${reading.id.slice(0, 8)} → ${second.reading.id.slice(0, 8)}` : second?.outcome === 'refused' ? `${second.stage}: ${second.refusal}` : `checkpoint ${cp.status}`);
    const afterFirst = before; // the snapshot taken before the first commission
    row('D12 the first commission changed no manuscript row; exactly two seam calls (reader + classifier), no retry',
      afterFirst === before && (reading.outcome === 'none' ? callsForFirst === 1 : callsForFirst === 2), `${callsForFirst} call(s)`);

    Object.assign(record, {
      manuscriptId, readingId: reading.id, outcome: reading.outcome, latencyMs, seamCalls: callsForFirst,
      provenance: reading.provenance, scope: reading.scope, inputFingerprint: reading.readState.inputFingerprint,
      observations: reading.observations, assessmentBefore: a0, assessmentAfter: a1,
      secondReadingId: second?.outcome === 'frozen' ? second.reading.id : null,
    });
    }
  } finally {
    await query(`DELETE FROM member_manuscripts WHERE id = $1`, [manuscriptId]);
    await query(`DELETE FROM auth_sessions WHERE member_id = $1`, [memberId]);
    await query(`DELETE FROM members WHERE id = $1`, [memberId]);
  }

  record.rows = rows; record.verdict = failures === 0 ? 'PASS' : 'FAIL';
  writeFileSync(out, JSON.stringify(record, null, 2));
  console.log(`\n${checks} checks · ${failures} failure(s) · record ${out}`);
  console.log(`GATE B     ${failures === 0 ? 'PASS — the unit executed the proved contract on a real read' : 'FAIL — classify before touching anything'}\n`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((err) => { console.error(err); process.exit(2); });
