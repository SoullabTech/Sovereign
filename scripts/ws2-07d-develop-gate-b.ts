/**
 * BUILD-07D — GATE B · live witness through the surface's own routes.
 *
 *   ANTHROPIC_API_KEY in the shell env (never printed) ·
 *   DATABASE_URL=postgres://... npx tsx scripts/ws2-07d-develop-gate-b.ts [--out <file.json>]
 *
 * What Gate A could not prove: that the writer's gesture on the surface
 * reaches MAIA and comes back as a durable reading the surface then
 * encounters, supersedes and keeps. The model is REAL here (MAIA reads the
 * invented Lantern Road fixture); everything else is exactly the candidate's
 * code, pinned by blob id, called in-process through the real route handlers
 * with a real session token. Alongside this headless run the founder walks
 * the room in a browser (record §3); the two together close the unit.
 *
 * FLOW  F1 POST /readings (development) → 201 · F2 listed · F3 loaded by
 *       identity, CURRENT, presented verbatim · F4 the writer edits Section 1
 *       through the draft route · F5 SUPERSEDED scoped to what rests on it,
 *       reading byte-identical · F6 POST /readings (voice) → a NEW reading;
 *       the first retained · F7 provider calls counted where they leave the
 *       process (≤ 2 per commission), no manuscript row moved by the surface.
 *
 * LAWFUL REFUSALS. A commission may be refused by the reader or the
 * classifier under their own contracts (07B/07C). That is a refusal state
 * the surface must carry, not a defect: it is recorded, and EXACTLY ONE
 * further commissioned act is permitted for that slot (07C Gate B ruling,
 * D11b). Two refusals leave the live path UNPROVED — recorded as such, never
 * tuned around. Nothing is retried silently.
 */

import { createHash, randomUUID } from 'crypto';
import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import http from 'http';
import https from 'https';
import Module from 'module';
import { NextRequest } from 'next/server';

/**
 * PIN RECONCILIATION — 2026-09-04, founder-authorized, pin declaration ONLY.
 *
 * The reading contract was corrected after 07C's acceptance (v2: `phenomenon`
 * may be ABSENT — the taxonomy may no longer veto an observation). That
 * correction changed four pinned files and added one migration, so this
 * harness would have refused at P0 before F1 ever ran. The refusal was
 * CORRECT: the pin was doing its job. What follows re-pins it to the runtime
 * actually under acceptance.
 *
 * CANDIDATE is the RUNTIME under acceptance, not the checkout Gate B runs
 * from. `d884ee606` is the runtime candidate; `082ae1a74`, its child, adds
 * only the Gate A witness record and changes no runtime file. Gate B may
 * therefore run from a later evidence checkout and still attest that the
 * surface it exercised was byte-identical to the accepted candidate — which
 * is exactly what P0 below verifies, since the blob map, not this label, is
 * the real protection.
 *
 * Changed under the correction, re-pinned here:
 *   developPresentation.ts  2b726813… → a6e777e9…  (no badge when absent)
 *   contract.ts             8024937f… → b07ff694…  (phenomenon optional; v2 stamp)
 *   freeze.ts               c7b5e3ce… → 7f2fde44…  (omit the key on decline)
 *   classify.ts             32fec5a3… → c11985ed…  (per-claim decline survives)
 * Unchanged, deliberately left on their existing pins: store.ts, assess.ts,
 * commission.ts, developClient.ts, both reading routes, both Develop pages,
 * and migration 20260904000001 — which is NOT replaced by 00002.
 *
 * Nothing else in this harness moves: F1–F7, the fixture, the refusal and
 * retry rules, the provider-call limit and the success criteria are untouched.
 */
const CANDIDATE = 'd884ee606';
const CANDIDATE_BLOBS: Record<string, string> = {
  'app/api/sovereign/manuscripts/[id]/readings/route.ts': 'e0a85ed8bf0fd5e4e9f6f4534e73cfb2b66be3ca',
  'app/api/sovereign/manuscripts/[id]/readings/[readingId]/route.ts': '40bc3eacf3813153a6716953ab6c9cd3b5b4f682',
  'lib/writersStudio/developClient.ts': '42fa20def30b79acd27f0f97499ab98092eb1a7f',
  'lib/writersStudio/developPresentation.ts': 'a6e777e933c8afcc632889e4ca428805cbfab61b',
  'app/writers-studio/develop/DevelopRoom.tsx': '3bbc718e3058cf5fc421a4f6125ff28fc3509f68',
  'app/writers-studio/develop/page.tsx': '4292be949f66a21ee109d5fb6b63d5a1f5e9d668',
  /* the 07C reading unit — contract/freeze/classify carry the v2 correction;
     store/assess/commission stand unchanged since candidate 8a26a8971 (canonical 376daae06) */
  'lib/manuscript/developmentalReading/contract.ts': 'b07ff694ee14d2b64308d768eeb9abf29966b6b5',
  'lib/manuscript/developmentalReading/freeze.ts': '7f2fde44198e8394086b5e474a1fa9d7636d27d3',
  'lib/manuscript/developmentalReading/classify.ts': 'c11985edbe64544f2de4d8b6e7a67f5516e8e712',
  'lib/manuscript/developmentalReading/store.ts': 'b3b9f2906276b0622d8899661fd44dddf4fea268',
  'lib/manuscript/developmentalReading/assess.ts': 'acf40afe5bf34b1dbe1e4a04f4093628e4b8c009',
  'lib/manuscript/developmentalReading/commission.ts': '14c62a41e77ed560f1e68d11d5b129f19b3cfcac',
  'database/migrations/20260904000001_developmental_readings.sql': '545cc1fb4a7063355d7f9e0041adb57717611b7e',
  /* v2 — the post-acceptance contract correction, added to the pin set */
  'database/migrations/20260904000002_developmental_reading_contract_v2.sql': '5e64805af7218b792ee886011a36f16bfa791a88',
};

function gitBlobId(path: string): string {
  const content = readFileSync(join(__dirname, '..', path));
  return createHash('sha1').update(`blob ${content.length}\0`).update(content).digest('hex');
}

const emptyCookies = { get: () => undefined, getAll: () => [], has: () => false };
let providerCalls = 0;
for (const mod of [http, https]) {
  const orig = mod.request.bind(mod);
  (mod as { request: typeof mod.request }).request = ((...args: unknown[]) => {
    const a0 = args[0] as string | URL | { path?: string; host?: string; hostname?: string };
    const target = typeof a0 === 'string' ? a0 : a0 instanceof URL ? a0.href
      : `${a0.hostname ?? a0.host ?? ''}${a0.path ?? ''}`;
    if (/\/v1\/messages/.test(target)) providerCalls += 1;
    return (orig as (...a: unknown[]) => http.ClientRequest)(...args);
  }) as typeof mod.request;
}
const moduleLoader = Module as unknown as { _load: (request: string, ...rest: unknown[]) => unknown };
const originalLoad = moduleLoader._load;
moduleLoader._load = function (this: unknown, request: string, ...rest: unknown[]) {
  if (request === 'next/headers') return { cookies: async () => emptyCookies, headers: async () => new Headers() };
  return originalLoad.call(this, request, ...rest);
};

const SECTIONS = [
  { heading: 'One', body: 'Mara found the lantern in her grandmother\'s shed the week the river changed course. It was brass, dented on one side, and it lit on the first try, which she took as a sign. She told no one.' },
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

let checks = 0; let failures = 0; const failed: string[] = [];
const rows: { id: string; ok: boolean; detail: string }[] = [];
function row(id: string, ok: boolean, detail = ''): void {
  checks += 1; rows.push({ id, ok, detail });
  if (ok) console.log(`  ✓ ${id}${detail ? `  (${detail})` : ''}`);
  else { failures += 1; failed.push(id); console.log(`  ✗ ${id}${detail ? ` — ${detail}` : ''}`); }
}

async function main() {
  if (!process.env.DATABASE_URL) { console.error('DATABASE_URL is required'); process.exit(2); }
  if (!process.env.ANTHROPIC_API_KEY) { console.error('ANTHROPIC_API_KEY must be in the environment (never printed)'); process.exit(2); }
  if (process.env.MAIA_INFERENCE_MODE && process.env.MAIA_INFERENCE_MODE !== 'primary') { console.error(`MAIA_INFERENCE_MODE=${process.env.MAIA_INFERENCE_MODE} — Gate B needs the primary seam`); process.exit(2); }
  const head = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
  const out = arg('out', join(process.cwd(), 'ws2-07d-gate-b.json'));

  console.log(`\nBUILD-07D · GATE B · live witness through the surface routes · candidate ${CANDIDATE} · checkout ${head}\n`);
  const drift = Object.entries(CANDIDATE_BLOBS).filter(([p, id]) => gitBlobId(p) !== id).map(([p]) => p);
  row('P0 the surface, the reading unit and the migration are byte-identical to the candidate', drift.length === 0, drift.join(', '));
  if (drift.length > 0) process.exit(3);

  const { query } = await import('@/lib/db/postgres');
  const draftRoute = await import('@/app/api/sovereign/manuscripts/[id]/draft/route');
  const listRoute = await import('@/app/api/sovereign/manuscripts/[id]/readings/route');
  const oneRoute = await import('@/app/api/sovereign/manuscripts/[id]/readings/[readingId]/route');
  const { createUnit, placeSections } = await import('@/lib/manuscript/structure/structureService');
  const { canonicalFingerprint } = await import('@/lib/manuscript/structure/canonicalFingerprint');
  const { loadReading } = await import('@/lib/manuscript/developmentalReading/store');
  const { readingView } = await import('@/lib/writersStudio/developPresentation');

  const enc = await query<{ e: string }>(`SELECT current_setting('server_encoding') AS e`);
  if (enc.rows[0]!.e !== 'UTF8') { console.log(`✗ server_encoding ${enc.rows[0]!.e} — STOP`); process.exit(3); }

  const tag = randomUUID().slice(0, 8);
  const member = await query<{ id: string }>(`INSERT INTO members (passkey, username, password_hash, name) VALUES ($1, $2, 'x', 'WS2-07D Gate B') RETURNING id`, [`WS207D-${tag}`, `ws207d-${tag}`]);
  const memberId = member.rows[0]!.id;
  const token = `ws207d-${randomUUID().replace(/-/g, '')}`.slice(0, 64);
  await query(`INSERT INTO auth_sessions (member_id, session_token, expires_at) VALUES ($1, $2, NOW() + INTERVAL '1 hour')`, [memberId, token]);
  const ms = await query<{ id: string }>(`INSERT INTO member_manuscripts (member_id, title) VALUES ($1, 'The Lantern Road (invented Gate B fixture)') RETURNING id`, [memberId]);
  const manuscriptId = ms.rows[0]!.id;
  for (const [i, s] of SECTIONS.entries()) {
    await query(`INSERT INTO manuscript_sections (manuscript_id, position, heading, body) VALUES ($1, $2, $3, $4)`, [manuscriptId, i, s.heading, s.body]);
  }
  const base = `http://localhost/api/sovereign/manuscripts/${manuscriptId}`;
  const req = (method: string, path: string, body?: unknown) => new NextRequest(`${base}${path}`, {
    method, headers: { 'content-type': 'application/json', 'x-session-token': token },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const P = { params: Promise.resolve({ id: manuscriptId }) };
  const P1 = (readingId: string) => ({ params: Promise.resolve({ id: manuscriptId, readingId }) });
  const snapshot = async () => {
    const d = await query<{ id: string; content: string; version: string; revision_count: number }>(`SELECT id, content, version::text AS version, revision_count FROM manuscript_working_drafts WHERE manuscript_id = $1`, [manuscriptId]);
    const s = await query<{ id: string; text: string }>(`SELECT id, text FROM manuscript_draft_sections WHERE draft_id = $1 ORDER BY position`, [d.rows[0]!.id]);
    return JSON.stringify({ d: d.rows[0], s: s.rows, f: await canonicalFingerprint(manuscriptId) });
  };

  const record: Record<string, unknown> = { unit: 'BUILD-07D', gate: 'B', candidate: CANDIDATE, checkoutHead: head, ranAt: new Date().toISOString() };
  const history: { slot: string; act: number; status: number; body: unknown }[] = [];
  /* One slot, at most two commissioned acts (D11b). Returns the first 201 or the last refusal. */
  const commission = async (slot: string, lens: string) => {
    let last: { status: number; body: Record<string, unknown> } | null = null;
    for (let act = 1; act <= 2; act += 1) {
      const res = await listRoute.POST(req('POST', '/readings', { lens }), P);
      const body = (await res.json()) as Record<string, unknown>;
      history.push({ slot, act, status: res.status, body });
      last = { status: res.status, body };
      if (res.status === 201) break;
      const lawful = res.status === 422 && (body.stage === 'read' || body.stage === 'classify');
      console.log(`    ${slot} act ${act}: ${res.status} ${body.refusal ?? ''}${body.stage ? ` at ${body.stage}` : ''}${lawful ? ' (lawful refusal — one further act permitted)' : ''}`);
      if (!lawful) break;
    }
    return last!;
  };

  try {
    const created = await draftRoute.POST(req('POST', '/draft'), P);
    const createdBody = await created.json();
    if (created.status !== 201) { console.log(`✗ draft POST ${created.status}`, createdBody); process.exit(3); }
    const sections = createdBody.sections as { id: string; text: string }[];
    const revisionId = createdBody.revisionId as number;
    const [w1, w2, w3, w4, w5, w6] = sections.map((s) => s.id) as [string, string, string, string, string, string];
    const u1 = await createUnit(manuscriptId, memberId, { kind: 'part', title: 'Before the water', parentId: null });
    const u2 = await createUnit(manuscriptId, memberId, { kind: 'part', title: 'After', parentId: null });
    if (u1.status !== 'ok' || u2.status !== 'ok') { console.log('✗ structure fixture failed'); process.exit(3); }
    await placeSections(manuscriptId, memberId, { unitId: u1.value.id, fromSectionId: w1, toSectionId: w3 });
    await placeSections(manuscriptId, memberId, { unitId: u2.value.id, fromSectionId: w4, toSectionId: w6 });
    const before = await snapshot();
    const callsBefore = providerCalls;

    /* ── F1 · the writer asks, through the surface's route ── */
    const first = await commission('F1', 'development');
    const firstId = first.body.readingId as string | undefined;
    row('F1 the gesture reaches MAIA: POST /readings (development) → 201 with the id the store minted', first.status === 201 && typeof firstId === 'string',
      first.status === 201 ? `reading ${firstId!.slice(0, 8)} · ${first.body.outcome} · ${first.body.observationCount} observations` : `UNPROVED — ${history.map((h) => `act ${h.act}: ${h.status} ${(h.body as { refusal?: string }).refusal ?? ''}`).join('; ')}`);
    row('F1 the surface\'s own commission moved no manuscript row', (await snapshot()) === before);
    if (first.status !== 201 || !firstId) throw new Error('F1 unproved');
    const f1Calls = providerCalls - callsBefore;
    row('F1 provider calls for the commission: reader + classifier at most (≤ 2 per act)', f1Calls <= 2 * history.filter((h) => h.slot === 'F1').length, `${f1Calls} calls over ${history.filter((h) => h.slot === 'F1').length} act(s)`);

    /* ── F2–F3 · encounter ── */
    const listed = await (await listRoute.GET(req('GET', '/readings'), P)).json();
    row('F2 the ledger lists it, newest first, as a summary', listed.readings?.[0]?.id === firstId && listed.readings.length === 1);
    const one = await oneRoute.GET(req('GET', `/readings/${firstId}`), P1(firstId));
    const oneBody = await one.json();
    const asStored = JSON.stringify(await loadReading(firstId, memberId));
    row('F3 loaded by identity: AS STORED, every observation CURRENT, section labels present', one.status === 200 && JSON.stringify(oneBody.reading) === asStored && oneBody.assessment.reading.state === 'current' && oneBody.sections.length === 6);
    const view = readingView(oneBody.reading, oneBody.assessment, oneBody.sections);
    const obs = oneBody.reading.observations as { key: string; phenomenon: string; observation: string; evidenceRefs: { kind: string; sectionId?: string; sectionIds?: string[] }[] }[];
    row('F3 presented: keys o1…oN in order; each observation VERBATIM; every evidence ref named; every limit given a meaning; lens = development',
      view.observations.map((o) => o.key).join(',') === obs.map((o) => o.key).join(',') && view.observations.every((o, i) => o.observation === obs[i]!.observation && o.evidence.length === obs[i]!.evidenceRefs.length && o.limits.every((l) => l.meaning.length > 0)) && view.lens === 'development',
      `${view.observations.length} observation(s): ${view.observations.map((o) => `${o.key}=${o.phenomenon}`).join(' ')}`);
    record.first = { id: firstId, outcome: oneBody.reading.outcome, observations: obs.map((o) => ({ key: o.key, phenomenon: o.phenomenon, refs: o.evidenceRefs })), reader: oneBody.reading.provenance.reader.model, classifier: oneBody.reading.provenance.classifier?.model ?? null };
    console.log(`\n    MAIA noticed (${oneBody.reading.outcome}):`);
    for (const o of view.observations) console.log(`      ${o.key} [${o.phenomenonLabel}] ${JSON.stringify(o.observation)}\n         rests on: ${o.evidence.join(' · ')}\n         does not establish: ${o.limits.map((l) => l.name).join(', ')}`);
    console.log('');

    /* ── F4–F5 · the work moves; the reading does not ── */
    const edited = sections.map((s) => (s.id === w1 ? { ...s, text: `${s.text} The moon was down.` } : s));
    const saved = await draftRoute.PUT(req('PUT', '/draft', { sections: edited, baseRevisionId: revisionId, idempotencyKey: randomUUID() }), P);
    row('F4 the writer edits Section 1 through the draft route (no such control on the surface)', saved.status === 200, `status ${saved.status}`);
    const again = await oneRoute.GET(req('GET', `/readings/${firstId}`), P1(firstId));
    const againBody = await again.json();
    /* An observation rests on Section 1 if a TEXTUAL ref names it. A text edit
       moves no structural ref — the unit that places w1 is unchanged — so only
       textual refs decide what is superseded here (INV-21). */
    const textualOnW1 = (o: (typeof obs)[number]) => o.evidenceRefs.some((r) => (r.kind === 'section' || r.kind === 'passage') && r.sectionId === w1 || (r.kind === 'section-run' && r.sectionIds?.includes(w1)));
    const states = Object.fromEntries(obs.map((o) => [o.key, againBody.assessment.observations[o.key]?.state]));
    const scoped = obs.every((o) => (textualOnW1(o) ? states[o.key] === 'superseded' : states[o.key] === 'current'));
    row('F5 SUPERSEDED scoped per observation: exactly those with a textual ref on Section 1; the rest CURRENT (INV-21)', scoped && (obs.some(textualOnW1) ? againBody.assessment.reading.state === 'superseded' : againBody.assessment.reading.state === 'current'), JSON.stringify(states));
    const view2 = readingView(againBody.reading, againBody.assessment, againBody.sections);
    row('F5 presented in place: every observation still at its key with its VERBATIM text; superseded ones marked with what moved', view2.observations.map((o) => o.key).join(',') === obs.map((o) => o.key).join(',') && view2.observations.every((o, i) => o.observation === obs[i]!.observation && (o.state !== 'superseded' || o.moved.length > 0)));
    row('F5 the reading is retained byte-identical (INV-4, INV-19, INV-22)', JSON.stringify(againBody.reading) === asStored && JSON.stringify(await loadReading(firstId, memberId)) === asStored);
    record.afterEdit = states;

    /* ── F6 · a new reading is a NEW reading ── */
    const callsBefore2 = providerCalls;
    const second = await commission('F6', 'voice');
    const secondId = second.body.readingId as string | undefined;
    row('F6 a later commission under another lens is a NEW reading with a new id; the first is retained and listed', second.status === 201 && typeof secondId === 'string' && secondId !== firstId && ((await (await listRoute.GET(req('GET', '/readings'), P)).json()).readings as { id: string }[]).map((r) => r.id).sort().join() === [firstId, secondId ?? ''].sort().join(),
      second.status === 201 ? `reading ${secondId!.slice(0, 8)} · ${second.body.outcome} · ${second.body.observationCount} observations` : `UNPROVED — ${history.filter((h) => h.slot === 'F6').map((h) => `act ${h.act}: ${h.status} ${(h.body as { refusal?: string }).refusal ?? ''}`).join('; ')}`);
    const f6Calls = providerCalls - callsBefore2;
    row('F7 provider calls counted where they leave the process: ≤ 2 per commissioned act; nothing else called out', f6Calls <= 2 * history.filter((h) => h.slot === 'F6').length && providerCalls === f1Calls + f6Calls, `${providerCalls} total over ${history.length} act(s)`);
    const n = await query<{ n: string }>(`SELECT count(*)::text AS n FROM developmental_readings WHERE manuscript_id = $1`, [manuscriptId]);
    row('F7 rows in developmental_readings = readings frozen (a refused act stored nothing)', Number(n.rows[0]!.n) === history.filter((h) => h.status === 201).length, `${n.rows[0]!.n} row(s)`);
    record.second = secondId ? { id: secondId, outcome: second.body.outcome, observationCount: second.body.observationCount } : null;
  } catch (e) {
    console.log(`  stopped: ${(e as Error).message}`);
  } finally {
    record.history = history;
    record.providerCalls = providerCalls;
    record.checks = checks; record.failures = failures; record.failed = failed;
    writeFileSync(out, JSON.stringify(record, null, 2));
    await query(`DELETE FROM member_manuscripts WHERE id = $1`, [manuscriptId]);
    await query(`DELETE FROM auth_sessions WHERE member_id = $1`, [memberId]);
    await query(`DELETE FROM members WHERE id = $1`, [memberId]);
  }

  console.log(`\n${checks} checks · ${failures} failures${failures ? `\n  failed: ${failed.join('\n          ')}` : ''}\nrecord: ${out}\n`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });
