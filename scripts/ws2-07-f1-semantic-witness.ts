/**
 * WS2-07-F1 — LIVE SEMANTIC WITNESS · does the repair change what the models do?
 *
 *   ANTHROPIC_API_KEY in the shell env (never printed) ·
 *   DATABASE_URL=postgres://... npx tsx scripts/ws2-07-f1-semantic-witness.ts [--acts 3] [--out <file>]
 *
 * The structural half of this repair is proved without a model:
 * `lib/manuscript/__tests__/developmentalSemanticContract.test.ts` shows the
 * ratified definitions are rendered, the reader never receives the phenomenon
 * taxonomy, the classifier never receives the lens meanings, and
 * unclassifiable and refuse-whole are untouched. Founder instruction: the
 * regression must NOT rest on stochastic behaviour alone — so structure is
 * proved there, and this witness proves only what a model actually does.
 *
 * SAME FIXTURE AS THE FAILURE. The Lantern Road, whole draft, structure
 * supplied, lens `development` — exactly the commission that refused twice at
 * 07D Gate B and once in three acts at WS2-07C-F1. Comparability is the point;
 * a new fixture would prove nothing about the finding.
 *
 * WHAT IS ASSERTED, and what is only PRINTED. Asserted: the commission freezes;
 * the frozen reading carries the -02 provenance, so the repaired prompts are
 * the ones that ran; no claim carries the Lantern Road signature (a code-point
 * length band together with heading/numeral uniformity). Printed for founder
 * adjudication, never auto-judged: every claim and its phenomenon. Whether a
 * register-only claim went to `register-shift`, whether a trajectory went to
 * `movement`, and whether a genuine uneven distribution went to
 * `positional-asymmetry` are semantic judgements and belong to the founder.
 *
 * A refusal is still lawful and is still not retried around: each act is one
 * commission, recorded as it fell.
 */

import { createHash, randomUUID } from 'crypto';
import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import Module from 'module';
import { NextRequest } from 'next/server';

const REPAIRED_BLOBS = [
  'lib/manuscript/developmentalReader/contract.ts',
  'lib/manuscript/developmentalReader/render.ts',
  'lib/manuscript/developmentalReading/contract.ts',
  'lib/manuscript/developmentalReading/classify.ts',
];

function gitBlobId(path: string): string {
  const content = readFileSync(join(__dirname, '..', path));
  return createHash('sha1').update(`blob ${content.length}\0`).update(content).digest('hex');
}

const emptyCookies = { get: () => undefined, getAll: () => [], has: () => false };
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

/** The exact claim the founder ruled out: a length band together with heading/numeral uniformity. */
const LANTERN_ROAD_SIGNATURE = (text: string): boolean =>
  /code[- ]point/i.test(text) && /(heading|numeral|ordinal)/i.test(text);

function arg(name: string, fallback: string): string {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1]! : fallback;
}

let checks = 0; let failures = 0; const failed: string[] = [];
function row(id: string, ok: boolean, detail = ''): void {
  checks += 1;
  if (ok) console.log(`  ✓ ${id}${detail ? `  (${detail})` : ''}`);
  else { failures += 1; failed.push(id); console.log(`  ✗ ${id}${detail ? ` — ${detail}` : ''}`); }
}

async function main() {
  if (!process.env.DATABASE_URL) { console.error('DATABASE_URL is required'); process.exit(2); }
  if (!process.env.ANTHROPIC_API_KEY) { console.error('ANTHROPIC_API_KEY must be in the environment (never printed)'); process.exit(2); }
  if (process.env.MAIA_INFERENCE_MODE && process.env.MAIA_INFERENCE_MODE !== 'primary') { console.error(`MAIA_INFERENCE_MODE=${process.env.MAIA_INFERENCE_MODE} — this needs the primary seam`); process.exit(2); }

  const acts = Math.max(1, Number(arg('acts', '3')));
  const out = arg('out', join(process.cwd(), 'ws2-07-f1-semantic-witness.json'));
  const head = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();

  const { query } = await import('@/lib/db/postgres');
  const draftRoute = await import('@/app/api/sovereign/manuscripts/[id]/draft/route');
  const { createUnit, placeSections } = await import('@/lib/manuscript/structure/structureService');
  const { commissionReading } = await import('@/lib/manuscript/developmentalReading/commission');
  const { READER_VERSION } = await import('@/lib/manuscript/developmentalReader/render');
  const { CLASSIFIER_VERSION } = await import('@/lib/manuscript/developmentalReading/classify');
  const { PHENOMENON_LABEL } = await import('@/lib/manuscript/developmentalReading/contract');

  console.log(`\nWS2-07-F1 · LIVE SEMANTIC WITNESS · checkout ${head}`);
  console.log(`  ${READER_VERSION} · ${CLASSIFIER_VERSION} · acts ${acts} · fixture: The Lantern Road, whole draft, lens development\n`);

  const blobs = Object.fromEntries(REPAIRED_BLOBS.map((p) => [p, gitBlobId(p)]));
  row('G0 the four repaired files are present and hashable (their ids are recorded for this run)', true,
    REPAIRED_BLOBS.map((p) => `${p.split('/').pop()}=${blobs[p]!.slice(0, 8)}`).join(' · '));

  const enc = await query<{ e: string }>(`SELECT current_setting('server_encoding') AS e`);
  if (enc.rows[0]!.e !== 'UTF8') { console.log(`✗ server_encoding ${enc.rows[0]!.e} — STOP`); process.exit(3); }

  const tag = randomUUID().slice(0, 8);
  const member = await query<{ id: string }>(`INSERT INTO members (passkey, username, password_hash, name) VALUES ($1, $2, 'x', 'WS2-07-F1 witness') RETURNING id`, [`WS207F1-${tag}`, `ws207f1-${tag}`]);
  const memberId = member.rows[0]!.id;
  const token = `ws207f1-${randomUUID().replace(/-/g, '')}`.slice(0, 64);
  await query(`INSERT INTO auth_sessions (member_id, session_token, expires_at) VALUES ($1, $2, NOW() + INTERVAL '1 hour')`, [memberId, token]);
  const ms = await query<{ id: string }>(`INSERT INTO member_manuscripts (member_id, title) VALUES ($1, 'The Lantern Road (WS2-07-F1 witness)') RETURNING id`, [memberId]);
  const manuscriptId = ms.rows[0]!.id;
  for (const [i, s] of SECTIONS.entries()) {
    await query(`INSERT INTO manuscript_sections (manuscript_id, position, heading, body) VALUES ($1, $2, $3, $4)`, [manuscriptId, i, s.heading, s.body]);
  }
  const P = { params: Promise.resolve({ id: manuscriptId }) };
  const req = (method: string) => new NextRequest(`http://localhost/api/sovereign/manuscripts/${manuscriptId}/draft`, {
    method, headers: { 'content-type': 'application/json', 'x-session-token': token },
  });

  const record: Record<string, unknown> = { lane: 'WS2-07-F1', kind: 'live-semantic-witness', checkoutHead: head,
    readerVersion: READER_VERSION, classifierVersion: CLASSIFIER_VERSION, blobs, acts, ranAt: new Date().toISOString() };
  const runs: Record<string, unknown>[] = [];

  try {
    const created = await draftRoute.POST(req('POST'), P);
    const createdBody = await created.json();
    if (created.status !== 201) { console.log(`✗ draft POST ${created.status}`, createdBody); process.exit(3); }
    const ids = (createdBody.sections as { id: string }[]).map((s) => s.id);
    const [w1, , , w4, , w6] = ids as [string, string, string, string, string, string];
    const u1 = await createUnit(manuscriptId, memberId, { kind: 'part', title: 'Before the water', parentId: null });
    const u2 = await createUnit(manuscriptId, memberId, { kind: 'part', title: 'After', parentId: null });
    if (u1.status !== 'ok' || u2.status !== 'ok') { console.log('✗ structure fixture failed'); process.exit(3); }
    await placeSections(manuscriptId, memberId, { unitId: u1.value.id, fromSectionId: w1, toSectionId: ids[2]! });
    await placeSections(manuscriptId, memberId, { unitId: u2.value.id, fromSectionId: w4, toSectionId: w6 });

    for (let act = 1; act <= acts; act += 1) {
      console.log(`\n── act ${act} of ${acts} ──────────────────────────────────────────`);
      const outcome = await commissionReading({ manuscriptId, memberId, lens: 'development', bodyScope: ids, withStructure: true });
      if (outcome.outcome === 'refused') {
        console.log(`  refused at ${outcome.stage}: ${outcome.refusal} — ${outcome.detail}`);
        runs.push({ act, outcome: 'refused', stage: outcome.stage, refusal: outcome.refusal, detail: outcome.detail });
        continue;
      }
      const r = outcome.reading;
      console.log(`  frozen ${r.id.slice(0, 8)} · ${r.outcome} · ${r.observations.length} observation(s)`
        + ` · reader ${r.provenance.reader.readerVersion} · classifier ${r.provenance.classifier?.classifierVersion ?? 'none'}`);
      for (const o of r.observations) {
        const sig = LANTERN_ROAD_SIGNATURE(o.observation);
        console.log(`\n  ${sig ? '✗' : '·'} ${o.key} [${PHENOMENON_LABEL[o.phenomenon]}]`);
        console.log(`      ${JSON.stringify(o.observation)}`);
        console.log(`      refs: ${o.evidenceRefs.map((x) => x.kind).join(', ')} · rests on structure: ${o.structureDependency.kind === 'authored-structure'}`);
      }
      runs.push({ act, outcome: 'frozen', readingId: r.id, readerVersion: r.provenance.reader.readerVersion,
        classifierVersion: r.provenance.classifier?.classifierVersion ?? null,
        observations: r.observations.map((o) => ({ key: o.key, phenomenon: o.phenomenon, text: o.observation,
          refs: o.evidenceRefs.map((x) => x.kind), signature: LANTERN_ROAD_SIGNATURE(o.observation) })) });
    }

    console.log('');
    const frozen = runs.filter((r) => r.outcome === 'frozen');
    row('G1 the commission freezes a reading through the repaired path', frozen.length > 0,
      `${frozen.length} of ${acts} act(s) froze`);
    row('G2 every frozen reading carries the repaired provenance — the -02 prompts are the ones that ran',
      frozen.length > 0 && frozen.every((r) => r.readerVersion === READER_VERSION && (r.classifierVersion === CLASSIFIER_VERSION || r.classifierVersion === null)),
      frozen.map((r) => `${r.readerVersion}/${r.classifierVersion}`).join(' · '));
    const signature = frozen.flatMap((r) => (r.observations as { key: string; text: string; signature: boolean }[]))
      .filter((o) => o.signature);
    row('G3 REGRESSION: no claim carries the Lantern Road signature (code-point band + heading/numeral uniformity)',
      signature.length === 0, signature.length === 0 ? 'none' : signature.map((o) => o.key).join(', '));
    const refused = runs.filter((r) => r.outcome === 'refused');
    row('G4 refusals, if any, are recorded rather than retried around', true,
      refused.length === 0 ? 'none this run' : refused.map((r) => `act ${r.act}: ${r.stage}/${r.refusal}`).join(' · '));
  } finally {
    record.runs = runs; record.checks = checks; record.failures = failures; record.failed = failed;
    writeFileSync(out, JSON.stringify(record, null, 2));
    await query(`DELETE FROM member_manuscripts WHERE id = $1`, [manuscriptId]);
    await query(`DELETE FROM auth_sessions WHERE member_id = $1`, [memberId]);
    await query(`DELETE FROM members WHERE id = $1`, [memberId]);
  }

  console.log(`\n${checks} checks · ${failures} failures${failures ? `\n  failed: ${failed.join('\n          ')}` : ''}\nrecord: ${out}`);
  console.log('\nPhenomenon placement is printed, not auto-judged. Whether register-only went to register-shift,');
  console.log('a trajectory to movement, and a genuine uneven distribution to positional-asymmetry is the founder\'s reading.\n');
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });
