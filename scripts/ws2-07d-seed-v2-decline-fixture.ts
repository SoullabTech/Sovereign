/**
 * BUILD-07D — seed ONE constructed v2 reading whose second observation carries
 * NO phenomenon, so the browser walk can witness how the room renders a
 * developmental observation the taxonomy declined to name.
 *
 *   DATABASE_URL=postgres://... npx tsx scripts/ws2-07d-seed-v2-decline-fixture.ts
 *
 * WHAT THIS IS, AND IS NOT. This is CONSTRUCTED rendering evidence. The
 * decline here is authored by this script, not produced by MAIA: neither live
 * Gate B reading declined a phenomenon (8 of 8 and 5 of 5 carried one), so no
 * live artefact exists to walk. Anything recorded from this fixture attests
 * how the surface RENDERS an absent phenomenon and attests NOTHING about how
 * often, or whether, a classifier declines in practice. Do not let a
 * screenshot taken here migrate into a claim about live behaviour.
 *
 * The reading is nonetheless a REAL one by every other measure: a real capture
 * of a real draft, frozen through the 07C freeze under the v2 contract and
 * written through the 07C store, so it passes the same database trigger and
 * arrives at the surface by the same path as any other. Only the reader and
 * classifier identities are fixture identities, and the surface shows them as
 * such.
 *
 * It does NOT clean up after itself — that is the point. Every existing
 * harness deletes its fixture in `finally`, which is why the two live Gate B
 * readings no longer exist. Run this against the scratch database, walk it,
 * then drop the database when the walk is recorded.
 */

import { randomUUID } from 'crypto';
import Module from 'module';

const emptyCookies = { get: () => undefined, getAll: () => [], has: () => false };
const moduleLoader = Module as unknown as { _load: (request: string, ...rest: unknown[]) => unknown };
const originalLoad = moduleLoader._load;
moduleLoader._load = function (this: unknown, request: string, ...rest: unknown[]) {
  if (request === 'next/headers') return { cookies: async () => emptyCookies, headers: async () => new Headers() };
  return originalLoad.call(this, request, ...rest);
};

const SECTIONS = [
  { heading: 'Arrival', body: 'Mara found the lantern in the shed the week the river changed course. It lit on the first try. She told no one.' },
  { heading: 'Council', body: 'The council met about the river. Mara counted the ways the men avoided the word flood. Eleven. She did not mention the lantern.' },
  { heading: 'Tomas', body: 'Her brother came home with a plan and a woman who laughed at the wrong moments. Mara moved the lantern under her bed.' },
  { heading: 'Water', body: 'The river rose into the lower street. The eleven silences became one loud argument in the church hall.' },
];

async function main() {
  if (!process.env.DATABASE_URL) { console.error('DATABASE_URL is required (a UTF-8 scratch database with the canonical chain applied)'); process.exit(2); }

  const { query } = await import('@/lib/db/postgres');
  const { NextRequest } = await import('next/server');
  const draftRoute = await import('@/app/api/sovereign/manuscripts/[id]/draft/route');
  const { createUnit, placeSections } = await import('@/lib/manuscript/structure/structureService');
  const { captureEvidence, loadRevisionContent } = await import('@/lib/manuscript/development/capture');
  const { recoverEvidence } = await import('@/lib/manuscript/development/resolve');
  const { readerIdentity } = await import('@/lib/manuscript/developmentalReader/read');
  const { freezeReading } = await import('@/lib/manuscript/developmentalReading/freeze');
  const { CLASSIFIER_VERSION, classifierPromptHash } = await import('@/lib/manuscript/developmentalReading/classify');
  const { freezeAndStore, loadReading } = await import('@/lib/manuscript/developmentalReading/store');
  const { hashPassword } = await import('@/lib/auth/passwordUtils');

  const enc = await query<{ e: string }>(`SELECT current_setting('server_encoding') AS e`);
  if (enc.rows[0]!.e !== 'UTF8') { console.error(`server_encoding is ${enc.rows[0]!.e}, not UTF8 — STOP`); process.exit(1); }

  /* A member the founder can actually sign in as. Every gate harness uses
     password_hash 'x', which no sign-in accepts; this walk needs a real one. */
  const tag = randomUUID().slice(0, 6);
  const username = `ws207d-walk-${tag}`;
  const password = `walk-${randomUUID().slice(0, 12)}`;
  const m = await query<{ id: string }>(
    `INSERT INTO members (passkey, username, password_hash, name, onboarded, onboarding_step)
     VALUES ($1, $2, $3, $4, true, 'complete') RETURNING id`,
    [`WS207D-WALK-${tag}`, username, await hashPassword(password), 'WS2-07D browser walk']);
  const memberId = m.rows[0]!.id;

  const ms = await query<{ id: string }>(
    `INSERT INTO member_manuscripts (member_id, title) VALUES ($1, $2) RETURNING id`,
    [memberId, 'The Lantern Road (v2 decline fixture)']);
  const manuscriptId = ms.rows[0]!.id;
  for (const [i, s] of SECTIONS.entries()) {
    await query(`INSERT INTO manuscript_sections (manuscript_id, position, heading, body) VALUES ($1, $2, $3, $4)`,
      [manuscriptId, i, s.heading, s.body]);
  }

  const token = `ws207d-${randomUUID().replace(/-/g, '')}`.slice(0, 64);
  await query(`INSERT INTO auth_sessions (member_id, session_token, expires_at) VALUES ($1, $2, NOW() + INTERVAL '30 days')`, [memberId, token]);

  const base = `http://localhost/api/sovereign/manuscripts/${manuscriptId}`;
  const P = { params: Promise.resolve({ id: manuscriptId }) };
  const created = await draftRoute.POST(new NextRequest(`${base}/draft`, {
    method: 'POST', headers: { 'content-type': 'application/json', 'x-session-token': token },
  }), P);
  const createdBody = await created.json();
  if (created.status !== 201) { console.error(`draft POST ${created.status}`, createdBody); process.exit(3); }
  const sections = createdBody.sections as { id: string; text: string }[];
  const [w1, w2, w3, w4] = sections.map((s) => s.id) as [string, string, string, string];

  const u1 = await createUnit(manuscriptId, memberId, { kind: 'part', title: 'Before the water', parentId: null });
  const u2 = await createUnit(manuscriptId, memberId, { kind: 'part', title: 'After', parentId: null });
  if (u1.status !== 'ok' || u2.status !== 'ok') { console.error('structure fixture failed'); process.exit(3); }
  await placeSections(manuscriptId, memberId, { unitId: u1.value.id, fromSectionId: w1, toSectionId: w2 });
  await placeSections(manuscriptId, memberId, { unitId: u2.value.id, fromSectionId: w3, toSectionId: w4 });

  const cap = await captureEvidence(manuscriptId, memberId, { bodyScope: [w1, w2, w3, w4], withStructure: true });
  if (!cap.ok) { console.error(`capture ${cap.refusal}: ${cap.detail}`); process.exit(3); }
  const content = await loadRevisionContent(cap.value.readState.draftId, cap.value.readState.revisionNumber);
  if (content === null) { console.error('no revision content'); process.exit(3); }
  const recovered = [w1, w2, w3, w4].map((sectionId) => {
    const r = recoverEvidence({ kind: 'section', sectionId }, cap.value.readState, content);
    if (!r.ok || r.value.kind !== 'text') { console.error('recover failed'); process.exit(3); }
    return r.value;
  });

  const READER = readerIdentity('walk-fixture-model');
  const CLASSIFIER = { provider: 'anthropic' as const, model: 'walk-fixture-model', promptHash: classifierPromptHash(), classifierVersion: CLASSIFIER_VERSION };
  const result = {
    outcome: 'claims' as const, reader: READER,
    claims: [
      { text: 'The lantern is set down in the first section and not picked up until the third.',
        refs: [{ kind: 'section', sectionId: w1 }, { kind: 'passage', sectionId: w3, range: { start: 0, end: 30 } }],
        doesNotEstablish: ['across-unread-span'] },
      /* o2 — the DECLINED observation. Whole, evidenced, limited, and unnamed
         by the taxonomy. This is the one the walk exists to look at. */
      { text: 'The council\'s eleven silences return as one argument, and the number is carried rather than restated.',
        refs: [{ kind: 'section-run', sectionIds: [w2, w3, w4] }],
        doesNotEstablish: ['chronology', 'author-intent'] },
      { text: 'The two parts split the sequence before the water.',
        refs: [{ kind: 'structure-units', unitIds: [u1.value.id, u2.value.id] }],
        doesNotEstablish: ['authored-structure-relation'] },
    ] as never,
  };
  const request = { commissionedLens: 'development' as const, evidence: cap.value, recovered };
  const fz = freezeReading({ manuscriptId, request, result, phenomena: ['recurrence', undefined, 'positional-asymmetry'], reader: READER, classifier: CLASSIFIER });
  if (!fz.ok) { console.error(`freeze ${fz.refusal}: ${fz.detail}`); process.exit(3); }
  const stored = await freezeAndStore(memberId, fz.value);
  if (!stored.ok) { console.error(`store ${stored.refusal}`); process.exit(3); }

  /* Prove from the database, not from this script's intention, that o2 has no
     phenomenon KEY — absent, never null — and that its siblings kept theirs. */
  const row = await query<{ n: string; declined: string; labels: string }>(
    `SELECT jsonb_array_length(observations)::text AS n,
            (SELECT count(*) FROM jsonb_array_elements(observations) o WHERE NOT (o ? 'phenomenon'))::text AS declined,
            (SELECT string_agg(coalesce(o->>'phenomenon', '(none)'), ' · ' ORDER BY ord)
               FROM jsonb_array_elements(observations) WITH ORDINALITY t(o, ord)) AS labels
       FROM developmental_readings WHERE id = $1`, [stored.id]);
  const r = row.rows[0]!;
  const back = await loadReading(stored.id, memberId);
  const o2 = (back as unknown as { observations: Record<string, unknown>[] }).observations[1]!;

  console.log(`
BUILD-07D · constructed v2 decline fixture — seeded, NOT cleaned up

  observations        ${r.n}
  declined            ${r.declined}   (expected 1)
  as stored           ${r.labels}
  o2 phenomenon key   ${'phenomenon' in o2 ? 'PRESENT — WRONG, stop and report' : 'ABSENT — correct'}

  sign in as
    username          ${username}
    password          ${password}

  walk to
    /writers-studio/develop?m=${manuscriptId}&r=${stored.id}

  What to witness on o2: its text, its evidence and its limits are all shown,
  it sits in ordinary position between o1 and o3, and NOTHING stands where a
  phenomenon would be — no placeholder, no "unclassified", no "unknown", no
  empty chip, no degraded or error styling. o1 and o3 keep their labels.

  This is CONSTRUCTED rendering evidence. It attests how the room renders an
  absent phenomenon. It attests nothing about how live MAIA classifies.
`);
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
