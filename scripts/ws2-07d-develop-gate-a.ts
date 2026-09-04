/**
 * BUILD-07D — GATE A · structural witness for the Develop surface.
 *
 *   DATABASE_URL=postgres://... npx tsx scripts/ws2-07d-develop-gate-a.ts
 *
 * Falsifiers E1–E14, derived from the 07D opening act (2026-09-04): the
 * surface encounters an ALREADY DURABLE reading by identity; it lists, loads,
 * labels evidence through the frozen readState, shows limits, shows
 * CURRENT / SUPERSEDED / UNMEASURED, lets the writer ask for a NEW reading,
 * and can neither reinterpret, rewrite, mutate, re-anchor nor silently
 * refresh anything. The inference seam REFUSES throughout (sovereign mode):
 * no model participates. The durable reading the surface encounters is
 * frozen through the 07C store from a REAL capture of a real draft, with a
 * fixture reader result standing in for the reader — Gate A proves the
 * surface; the founder's live walk (Gate B) proves it with MAIA reading.
 *
 * Everything the surface does goes through the real route handlers, called
 * in-process with a real session token. The witness inserts one fixture
 * member, session and manuscript and removes them after itself.
 */

import { randomUUID } from 'crypto';
import { execSync } from 'child_process';
import Module from 'module';
import { NextRequest } from 'next/server';

process.env.MAIA_INFERENCE_MODE = 'sovereign';

let adapterLoaded = false;
const emptyCookies = { get: () => undefined, getAll: () => [], has: () => false };
const moduleLoader = Module as unknown as { _load: (request: string, ...rest: unknown[]) => unknown };
const originalLoad = moduleLoader._load;
moduleLoader._load = function (this: unknown, request: string, ...rest: unknown[]) {
  if (/anthropicStructuredAdapter|@anthropic-ai\/sdk/.test(request)) adapterLoaded = true;
  if (request === 'next/headers') return { cookies: async () => emptyCookies, headers: async () => new Headers() };
  return originalLoad.call(this, request, ...rest);
};

let checks = 0; let failures = 0; const failed: string[] = [];
function check(id: string, ok: boolean, detail = ''): void {
  checks += 1;
  if (ok) console.log(`  ✓ ${id}`);
  else { failures += 1; failed.push(id); console.log(`  ✗ ${id}${detail ? ` — ${detail}` : ''}`); }
}

const SECTIONS = [
  { heading: 'Arrival', body: 'Mara found the lantern in the shed the week the river changed course. It lit on the first try. She told no one.' },
  { heading: 'Council', body: 'The council met about the river. Mara counted the ways the men avoided the word flood. Eleven. She did not mention the lantern.' },
  { heading: 'Tomas', body: 'Her brother came home with a plan and a woman who laughed at the wrong moments. Mara moved the lantern under her bed.' },
  { heading: 'Water', body: 'The river rose into the lower street. The eleven silences became one loud argument in the church hall.' },
];

async function main() {
  if (!process.env.DATABASE_URL) { console.error('DATABASE_URL is required (a UTF-8 scratch database with the canonical chain applied)'); process.exit(2); }
  const head = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
  const { query } = await import('@/lib/db/postgres');
  const draftRoute = await import('@/app/api/sovereign/manuscripts/[id]/draft/route');
  const listRoute = await import('@/app/api/sovereign/manuscripts/[id]/readings/route');
  const oneRoute = await import('@/app/api/sovereign/manuscripts/[id]/readings/[readingId]/route');
  const { createUnit, placeSections } = await import('@/lib/manuscript/structure/structureService');
  const { captureEvidence, loadRevisionContent } = await import('@/lib/manuscript/development/capture');
  const { recoverEvidence } = await import('@/lib/manuscript/development/resolve');
  const { readerIdentity } = await import('@/lib/manuscript/developmentalReader/read');
  const { freezeReading } = await import('@/lib/manuscript/developmentalReading/freeze');
  const { CLASSIFIER_VERSION, classifierPromptHash } = await import('@/lib/manuscript/developmentalReading/classify');
  const { freezeAndStore, loadReading } = await import('@/lib/manuscript/developmentalReading/store');
  const { readingView, STATE_SENTENCE } = await import('@/lib/writersStudio/developPresentation');

  console.log(`\nBUILD-07D · GATE A · structural witness (seam refusing) · checkout ${head}\n`);

  const enc = await query<{ e: string }>(`SELECT current_setting('server_encoding') AS e`);
  check('E0 database server_encoding = UTF8 (else STOP)', enc.rows[0].e === 'UTF8', enc.rows[0].e);
  if (enc.rows[0].e !== 'UTF8') process.exit(1);

  /* ── fixture through the real routes ─────────────────────────────────── */
  const tag = randomUUID().slice(0, 8);
  const mk = async (name: string) => {
    const m = await query<{ id: string }>(`INSERT INTO members (passkey, username, password_hash, name) VALUES ($1, $2, 'x', $3) RETURNING id`, [`WS207D-${name}-${tag}`, `ws207d-${name}-${tag}`, `WS2-07D Gate A ${name}`]);
    const token = `ws207d-${randomUUID().replace(/-/g, '')}`.slice(0, 64);
    await query(`INSERT INTO auth_sessions (member_id, session_token, expires_at) VALUES ($1, $2, NOW() + INTERVAL '1 hour')`, [m.rows[0].id, token]);
    return { id: m.rows[0].id, token };
  };
  const owner = await mk('owner');
  const other = await mk('other');
  const ms = await query<{ id: string }>(`INSERT INTO member_manuscripts (member_id, title) VALUES ($1, 'The Lantern Road (Gate A fixture)') RETURNING id`, [owner.id]);
  const manuscriptId = ms.rows[0].id;
  for (const [i, s] of SECTIONS.entries()) {
    await query(`INSERT INTO manuscript_sections (manuscript_id, position, heading, body) VALUES ($1, $2, $3, $4)`, [manuscriptId, i, s.heading, s.body]);
  }
  const base = `http://localhost/api/sovereign/manuscripts/${manuscriptId}`;
  const req = (method: string, path: string, token: string | null, body?: unknown) => new NextRequest(`${base}${path}`, {
    method, headers: { 'content-type': 'application/json', ...(token ? { 'x-session-token': token } : {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const P = { params: Promise.resolve({ id: manuscriptId }) };
  const P1 = (readingId: string, id = manuscriptId) => ({ params: Promise.resolve({ id, readingId }) });
  const snapshot = async () => {
    const d = await query<{ id: string; content: string; version: string; revision_count: number }>(`SELECT id, content, version::text AS version, revision_count FROM manuscript_working_drafts WHERE manuscript_id = $1`, [manuscriptId]);
    const s = await query<{ id: string; text: string }>(`SELECT id, text FROM manuscript_draft_sections WHERE draft_id = $1 ORDER BY position`, [d.rows[0]!.id]);
    return JSON.stringify({ d: d.rows[0], s: s.rows });
  };
  const readingRows = async () => Number((await query<{ n: string }>(`SELECT count(*)::text AS n FROM developmental_readings WHERE manuscript_id = $1`, [manuscriptId])).rows[0]!.n);

  try {
    const created = await draftRoute.POST(req('POST', '/draft', owner.token), P);
    const createdBody = await created.json();
    if (created.status !== 201) { console.log(`✗ draft POST ${created.status}`, createdBody); process.exit(3); }
    const sections = createdBody.sections as { id: string; text: string }[];
    const revisionId = createdBody.revisionId as number;
    const [w1, w2, w3, w4] = sections.map((s) => s.id) as [string, string, string, string];
    const u1 = await createUnit(manuscriptId, owner.id, { kind: 'part', title: 'Before the water', parentId: null });
    const u2 = await createUnit(manuscriptId, owner.id, { kind: 'part', title: 'After', parentId: null });
    if (u1.status !== 'ok' || u2.status !== 'ok') throw new Error('fixture structure');
    await placeSections(manuscriptId, owner.id, { unitId: u1.value.id, fromSectionId: w1, toSectionId: w2 });
    await placeSections(manuscriptId, owner.id, { unitId: u2.value.id, fromSectionId: w3, toSectionId: w4 });

    /* ── E1–E4 · the boundary before any reading exists ── */
    const noAuth = await listRoute.GET(req('GET', '/readings', null), P);
    check('E1 the ledger opens only to a verified member (401)', noAuth.status === 401);
    const foreign = await listRoute.GET(req('GET', '/readings', other.token), P);
    check('E2 another member sees this Work\'s readings as not found (404) — no existence leak', foreign.status === 404);
    const empty = await listRoute.GET(req('GET', '/readings', owner.token), P);
    const emptyBody = await empty.json();
    check('E3 the owner\'s ledger is empty before any reading — "none yet", not an error', empty.status === 200 && Array.isArray(emptyBody.readings) && emptyBody.readings.length === 0);
    const badLens = await listRoute.POST(req('POST', '/readings', owner.token, { lens: 'irony' }), P);
    const foreignField = await listRoute.POST(req('POST', '/readings', owner.token, { lens: 'voice', bodyScope: [w1] }), P);
    const foreignText = await listRoute.POST(req('POST', '/readings', owner.token, { lens: 'voice', observation: 'MAIA said' }), P);
    check('E4 a commission carries the lens and nothing else: foreign lens 400 · client scope 400 · client observation 400', badLens.status === 400 && foreignField.status === 400 && foreignText.status === 400);

    /* ── E5 · the writer asks; the seam refuses; nothing is stored, nothing moves ── */
    const before = await snapshot();
    const asked = await listRoute.POST(req('POST', '/readings', owner.token, { lens: 'development' }), P);
    const askedBody = await asked.json();
    check('E5 with the seam refusing, the commission is refused at read (503 structured_inference_unavailable) — typed, with its stage', asked.status === 503 && askedBody.refusal === 'structured_inference_unavailable' && askedBody.stage === 'read', `${asked.status} ${JSON.stringify(askedBody)}`);
    check('E5 a refused commission stores nothing and moves no manuscript row; the adapter was never loaded', (await readingRows()) === 0 && (await snapshot()) === before && adapterLoaded === false);
    const otherAsks = await listRoute.POST(req('POST', '/readings', other.token, { lens: 'development' }), P);
    check('E5 another member cannot commission a reading of this Work (404 not_readable)', otherAsks.status === 404 && (await otherAsks.json()).refusal === 'not_readable');

    /* ── the durable reading the surface will encounter: frozen through 07C from a REAL capture ── */
    const cap = await captureEvidence(manuscriptId, owner.id, { bodyScope: [w1, w2, w3, w4], withStructure: true });
    if (!cap.ok) throw new Error(`capture ${cap.refusal}: ${cap.detail}`);
    const content = await loadRevisionContent(cap.value.readState.draftId, cap.value.readState.revisionNumber);
    if (content === null) throw new Error('no revision content');
    const recovered = [w1, w2, w3, w4].map((sectionId) => {
      const r = recoverEvidence({ kind: 'section', sectionId }, cap.value.readState, content);
      if (!r.ok || r.value.kind !== 'text') throw new Error('recover');
      return r.value;
    });
    const request = { commissionedLens: 'development' as const, evidence: cap.value, recovered };
    const READER = readerIdentity('witness-model');
    const CLASSIFIER = { provider: 'anthropic' as const, model: 'witness-model', promptHash: classifierPromptHash(), classifierVersion: CLASSIFIER_VERSION };
    const VERBATIM = '  The lantern is set down in the first section and not picked up until the third.  ';
    const result = {
      outcome: 'claims' as const, reader: READER,
      claims: [
        { text: VERBATIM, refs: [{ kind: 'section', sectionId: w1 }, { kind: 'passage', sectionId: w3, range: { start: 0, end: 30 } }], doesNotEstablish: ['across-unread-span'] },
        { text: 'The council\'s eleven silences return as one argument.', refs: [{ kind: 'section-run', sectionIds: [w2, w3, w4] }], doesNotEstablish: ['chronology', 'author-intent'] },
        { text: 'The two parts split the sequence before the water.', refs: [{ kind: 'structure-units', unitIds: [u1.value.id, u2.value.id] }], doesNotEstablish: ['authored-structure-relation'] },
      ] as never,
    };
    const fz = freezeReading({ manuscriptId, request, result, phenomena: ['recurrence', 'recurrence', 'positional-asymmetry'], reader: READER, classifier: CLASSIFIER });
    if (!fz.ok) throw new Error(`freeze ${fz.refusal}: ${fz.detail}`);
    const stored = await freezeAndStore(owner.id, fz.value);
    if (!stored.ok) throw new Error(`store ${stored.refusal}`);
    const asStored = JSON.stringify(await loadReading(stored.id, owner.id));

    /* ── E6–E9 · encounter by identity ── */
    const listed = await listRoute.GET(req('GET', '/readings', owner.token), P);
    const listedBody = await listed.json();
    check('E6 the ledger lists the durable reading by the id the store minted — a summary, no observations, no state', listed.status === 200 && listedBody.readings.length === 1 && listedBody.readings[0].id === stored.id && listedBody.readings[0].observationCount === 3 && !('observations' in listedBody.readings[0]));

    const one = await oneRoute.GET(req('GET', `/readings/${stored.id}`, owner.token), P1(stored.id));
    const oneBody = await one.json();
    check('E7 the reading arrives AS STORED — byte-identical to the store\'s own load; the surface receives, it does not assemble', one.status === 200 && JSON.stringify(oneBody.reading) === asStored);
    check('E7 with it: a three-state assessment per observation and the current section labels', oneBody.assessment?.reading?.state === 'current' && ['o1', 'o2', 'o3'].every((k) => oneBody.assessment.observations[k]?.state === 'current') && Array.isArray(oneBody.sections) && oneBody.sections.length === 4 && oneBody.sections[0].heading === 'Arrival');

    const view = readingView(oneBody.reading, oneBody.assessment, oneBody.sections);
    const v1 = view.observations[0]!;
    check('E8 presented: the observation text is VERBATIM (leading and trailing spaces kept); key o1; lens + phenomenon shown', v1.observation === VERBATIM && v1.key === 'o1' && v1.lens === 'development' && v1.phenomenonLabel === 'recurrence');
    check('E8 presented: evidence is named through the FROZEN readState with the member\'s headings; limits carry the ratified meaning', v1.evidence[0] === 'Section 1 · “Arrival”, the whole section as read' && v1.evidence[1] === 'Section 3 · “Tomas”, characters 0–30 as read'
      && view.observations[1]!.evidence[0] === 'Sections 2–4, in the order they were read' && view.observations[2]!.evidence[0] === 'The part “Before the water” and the part “After”, as they stood in your structure'
      && v1.limits[0]!.name === 'across unread span' && v1.limits[0]!.meaning.length > 0 && view.observations[2]!.dependsOnStructure === true, JSON.stringify(view.observations.map((o) => o.evidence)));
    /* WS2-07-F1 · acceptance-harness maintenance, authorized as pin reconciliation.
       The fixture builds provenance from the LIVE constants (readerIdentity,
       CLASSIFIER_VERSION, lines above) but this assertion compared against
       hardcoded -01 literals, so it silently became false when the reader moved
       to -02 and the classifier to -04. It is now asserted against the same
       identities that were frozen — which is what the check claims to prove and
       cannot go stale on a future version bump — plus, made explicit, the
       "apart" the description already asserted: the two versions are carried as
       DIFFERENT values, not one provenance blurred into both. Not weakened: the
       surface must still surface reader and classifier provenance separately. */
    check('E8 presented: coverage from the frozen coverage; provenance names reader and classifier apart', view.coverage.sentence === 'MAIA read 4 of 4 sections in full.' && view.readerVersion === READER.readerVersion && view.classifierVersion === CLASSIFIER.classifierVersion && view.readerVersion !== view.classifierVersion && view.withStructure === true);

    const notYours = await oneRoute.GET(req('GET', `/readings/${stored.id}`, other.token), P1(stored.id));
    const wrongWork = await oneRoute.GET(req('GET', `/readings/${stored.id}`, owner.token), P1(stored.id, randomUUID()));
    const noSuch = await oneRoute.GET(req('GET', `/readings/${randomUUID()}`, owner.token), P1(randomUUID()));
    check('E9 by identity means by the member\'s identity: another member 404 · another Work\'s path 404 · absent 404', notYours.status === 404 && wrongWork.status === 404 && noSuch.status === 404);

    /* ── E10–E12 · the work moves; the reading does not ── */
    const edited = sections.map((s) => (s.id === w1 ? { ...s, text: `${s.text} She kept the shed key.` } : s));
    const saved = await draftRoute.PUT(req('PUT', '/draft', owner.token, { sections: edited, baseRevisionId: revisionId, idempotencyKey: randomUUID() }), P);
    check('E10 the writer edits Section 1 through the draft route (the surface has no such control)', saved.status === 200, `status ${saved.status}`);
    const again = await oneRoute.GET(req('GET', `/readings/${stored.id}`, owner.token), P1(stored.id));
    const againBody = await again.json();
    const st = (k: string) => againBody.assessment.observations[k]?.state;
    check('E11 SUPERSEDED, scoped per observation: o1 (rests on Section 1) superseded · o2 (Sections 2–4) current · o3 (structure) current; reading superseded', st('o1') === 'superseded' && st('o2') === 'current' && st('o3') === 'current' && againBody.assessment.reading.state === 'superseded', `${st('o1')} ${st('o2')} ${st('o3')}`);
    const view2 = readingView(againBody.reading, againBody.assessment, againBody.sections);
    check('E11 presented in place: o1 keeps its position and its VERBATIM text, marked Superseded with what moved; nothing filtered', view2.observations.map((o) => o.key).join(',') === 'o1,o2,o3' && view2.observations[0]!.observation === VERBATIM && view2.observations[0]!.stateLabel === 'Superseded' && view2.observations[0]!.moved[0] === 'the text of Section 1 · “Arrival” has changed' && view2.observations[1]!.stateLabel === 'Current', JSON.stringify(view2.observations[0]!.moved));
    check('E12 the reading is retained byte-identical after the edit (INV-4, INV-19, INV-22) — nothing re-anchored, nothing rewritten', JSON.stringify(againBody.reading) === asStored && JSON.stringify(await loadReading(stored.id, owner.id)) === asStored);
    const unmeasured = readingView(againBody.reading, { reading: { state: 'unmeasured' }, observations: {} }, againBody.sections);
    check('E12 UNMEASURED is reachable and is its own state — never shown as current', unmeasured.state === 'unmeasured' && unmeasured.observations.every((o) => o.stateLabel === 'Unmeasured') && /not a no/.test(STATE_SENTENCE.unmeasured));

    /* ── E13–E14 · identity outlives the surface; the surface wrote nothing ── */
    const third = await oneRoute.GET(req('GET', `/readings/${stored.id}`, owner.token), P1(stored.id));
    const thirdBody = await third.json();
    const relisted = await (await listRoute.GET(req('GET', '/readings', owner.token), P)).json();
    check('E13 identity is stable across encounters: same reading id and observation keys on every load and in the ledger (INV-1, INV-3)', thirdBody.reading.id === stored.id && thirdBody.reading.observations.map((o: { key: string }) => o.key).join(',') === 'o1,o2,o3' && relisted.readings[0].id === stored.id);
    const rowNow = await query<{ observations: unknown; frozen_at: Date }>(`SELECT observations, frozen_at FROM developmental_readings WHERE id = $1`, [stored.id]);
    check('E14 exactly one reading row exists and it is unchanged: the surface issued no INSERT, UPDATE or DELETE', (await readingRows()) === 1 && rowNow.rows[0]!.frozen_at.toISOString() === stored.frozenAt && JSON.stringify(rowNow.rows[0]!.observations) === JSON.stringify(JSON.parse(asStored).observations),
      `rows ${await readingRows()} · frozenAt ${rowNow.rows[0]!.frozen_at.toISOString()} vs ${stored.frozenAt}`);
  } finally {
    await query(`DELETE FROM member_manuscripts WHERE id = $1`, [manuscriptId]);
    for (const m of [owner, other]) {
      await query(`DELETE FROM auth_sessions WHERE member_id = $1`, [m.id]);
      await query(`DELETE FROM members WHERE id = $1`, [m.id]);
    }
  }

  console.log(`\n${checks} checks · ${failures} failures${failures ? `\n  failed: ${failed.join('\n          ')}` : ''}\n`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });
