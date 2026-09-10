/**
 * S3 · Step 7 — witness fixture.
 *
 * Builds a real member, a real session credential, a real Work with a real
 * working draft, real structure, and a real frozen developmental reading, using
 * the repository's own producers. Nothing here is a stand-in for the behaviour
 * under test: the walks drive the Ask protocol over HTTP against the running
 * server, and this only puts a Work in front of it.
 *
 * CREDENTIAL: a real `auth_sessions` row with a token minted here and written
 * only to the scratchpad. No authentication bypass, no route-only test branch,
 * no committed secret, no real person's credential.
 *
 * Usage: DATABASE_URL=… WALK_BASE=http://127.0.0.1:3100 \
 *          npx tsx scripts/witness/s3-step7/seed.ts <out.json>
 */
import { randomUUID } from 'crypto';
import { writeFileSync } from 'fs';

/** Four sections. The FOURTH is deliberately untitled: the label walk needs one. */
const SECTIONS = [
  { heading: 'Arrival', body: 'The lantern is set down on the sill and left there.\n\nNobody moves to pick it up. The road outside keeps its own counsel.' },
  { heading: 'The Council', body: 'Eleven of them sat, and eleven of them said nothing, and the nothing was not the same nothing eleven times.' },
  { heading: 'The Water', body: 'She carried the lantern to the water and the water did not take it.\n\nIt floated, which was worse.' },
  { heading: null, body: 'Afterwards there was a road, and the road was the same road, and she had not moved at all.' },
  /* The FIFTH is placed in NO structure unit. Recognition draws its title from
     the structure lane, so this is the only section for which the generated
     "Section N" label is reachable at all. */
  { heading: null, body: 'A coda, belonging to no part of the book, set down after everything.' },
];

const BASE = process.env.WALK_BASE ?? 'http://127.0.0.1:3100';

async function main() {
  const out = process.argv[2];
  if (!out) throw new Error('usage: seed.ts <out.json>');

  const { query } = await import('@/lib/db/postgres');
  const { createUnit, placeSections } = await import('@/lib/manuscript/structure/structureService');
  const { captureEvidence, loadRevisionContent } = await import('@/lib/manuscript/development/capture');
  const { recoverEvidence } = await import('@/lib/manuscript/development/resolve');
  const { readerIdentity } = await import('@/lib/manuscript/developmentalReader/read');
  const { freezeReading } = await import('@/lib/manuscript/developmentalReading/freeze');
  const { CLASSIFIER_VERSION, classifierPromptHash } = await import('@/lib/manuscript/developmentalReading/classify');
  const { freezeAndStore } = await import('@/lib/manuscript/developmentalReading/store');

  const enc = await query<{ e: string }>(`SELECT current_setting('server_encoding') AS e`);
  if (enc.rows[0].e !== 'UTF8') throw new Error(`server_encoding ${enc.rows[0].e} — STOP`);

  const tag = randomUUID().slice(0, 8);
  const mk = async (name: string) => {
    const m = await query<{ id: string }>(
      `INSERT INTO members (passkey, username, password_hash, name)
       VALUES ($1, $2, 'x', $3) RETURNING id`,
      [`S3STEP7-${name}-${tag}`, `s3step7-${name}-${tag}`, `S3 Step 7 ${name}`]);
    const token = `s3step7-${randomUUID().replace(/-/g, '')}`.slice(0, 64);
    await query(
      `INSERT INTO auth_sessions (member_id, session_token, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '4 hours')`, [m.rows[0].id, token]);
    return { id: m.rows[0].id, token };
  };

  const owner = await mk('owner');
  const other = await mk('other');

  const ms = await query<{ id: string }>(
    `INSERT INTO member_manuscripts (member_id, title) VALUES ($1, $2) RETURNING id`,
    [owner.id, `The Lantern Road (S3 Step 7 · ${tag})`]);
  const manuscriptId = ms.rows[0].id;
  for (const [i, s] of SECTIONS.entries()) {
    await query(
      `INSERT INTO manuscript_sections (manuscript_id, position, heading, body) VALUES ($1,$2,$3,$4)`,
      [manuscriptId, i, s.heading, s.body]);
  }

  /* Over HTTP, against the running server — the draft route resolves identity
     through `cookies()`, which exists only inside a real request scope. Calling
     the module directly would have required a shim around the very identity
     resolution the walks must not bypass. */
  const created = await fetch(`${BASE}/api/sovereign/manuscripts/${manuscriptId}/draft`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-session-token': owner.token },
  });
  const cb = await created.json();
  if (created.status !== 201) throw new Error(`draft POST ${created.status}: ${JSON.stringify(cb)}`);
  const w = (cb.sections as { id: string }[]).map((s) => s.id);
  const [w1, w2, w3, w4, w5] = w as [string, string, string, string, string];

  const u1 = await createUnit(manuscriptId, owner.id, { kind: 'part', title: 'Before the water', parentId: null });
  const u2 = await createUnit(manuscriptId, owner.id, { kind: 'part', title: 'After', parentId: null });
  if (u1.status !== 'ok' || u2.status !== 'ok') throw new Error('fixture structure');
  await placeSections(manuscriptId, owner.id, { unitId: u1.value.id, fromSectionId: w1, toSectionId: w2 });
  await placeSections(manuscriptId, owner.id, { unitId: u2.value.id, fromSectionId: w3, toSectionId: w4 });

  /* w5 is deliberately unplaced — see SECTIONS. */
  const cap = await captureEvidence(manuscriptId, owner.id, { bodyScope: [w1, w2, w3, w4, w5], withStructure: true });
  if (!cap.ok) throw new Error(`capture ${cap.refusal}: ${cap.detail}`);
  const content = await loadRevisionContent(cap.value.readState.draftId, cap.value.readState.revisionNumber);
  if (content === null) throw new Error('no revision content');
  const recovered = [w1, w2, w3, w4, w5].map((sectionId) => {
    const r = recoverEvidence({ kind: 'section', sectionId }, cap.value.readState, content);
    if (!r.ok || r.value.kind !== 'text') throw new Error('recover');
    return r.value;
  });

  const READER = readerIdentity('witness-model');
  const CLASSIFIER = {
    provider: 'anthropic' as const, model: 'witness-model',
    promptHash: classifierPromptHash(), classifierVersion: CLASSIFIER_VERSION,
  };

  /* o1 body / one section · o2 body / two sections, one of them untitled ·
     o3 position + structure only, so no body authority is ever required. */
  const result = {
    outcome: 'claims' as const, reader: READER,
    claims: [
      { text: 'The lantern is set down and not picked up.',
        refs: [{ kind: 'section', sectionId: w1 }],
        doesNotEstablish: ['author-intent'] },
      { text: 'The silence of the council returns at the end as a road.',
        refs: [{ kind: 'section', sectionId: w2 }, { kind: 'passage', sectionId: w4, range: { start: 0, end: 30 } }],
        doesNotEstablish: ['chronology'] },
      /* TWO SECTIONS INSIDE ONE STRUCTURE UNIT. Recognition titles a section by
         the unit that contains it, so this is the case that asks whether two
         distinct sections can be told apart in an authorization request. */
      { text: 'The lantern and the council share a single movement.',
        refs: [{ kind: 'section', sectionId: w1 }, { kind: 'section', sectionId: w2 }],
        doesNotEstablish: ['author-intent'] },
      /* A SECTION IN NO UNIT — the only path to a generated positional label. */
      { text: 'The coda stands outside the book\'s divisions.',
        refs: [{ kind: 'section', sectionId: w5 }],
        doesNotEstablish: ['author-intent'] },
      { text: 'The two parts split the sequence before the water.',
        refs: [{ kind: 'section-run', sectionIds: [w1, w2, w3] },
               { kind: 'structure-units', unitIds: [u1.value.id, u2.value.id] }],
        doesNotEstablish: ['authored-structure-relation'] },
    ] as never,
  };
  const fz = freezeReading({
    manuscriptId, request: { commissionedLens: 'development' as const, evidence: cap.value, recovered },
    result, phenomena: ['recurrence', 'recurrence', 'recurrence', 'positional-asymmetry', 'positional-asymmetry'],
    reader: READER, classifier: CLASSIFIER,
  });
  if (!fz.ok) throw new Error(`freeze ${fz.refusal}: ${fz.detail}`);
  const stored = await freezeAndStore(owner.id, fz.value);
  if (!stored.ok) throw new Error(`store ${stored.refusal}`);

  const { loadReading } = await import('@/lib/manuscript/developmentalReading/store');
  const reading = await loadReading(stored.id, owner.id);
  if (!reading || reading.outcome !== 'reading') throw new Error('reading did not survive the round trip');

  const fixture = {
    tag,
    manuscriptId,
    draftId: cap.value.readState.draftId,
    revisionNumber: cap.value.readState.revisionNumber,
    owner, other,
    sections: { w1, w2, w3, w4, w5 },
    units: { u1: u1.value.id, u2: u2.value.id },
    readingId: stored.id,
    observations: reading.observations.map((o) => ({
      key: o.key,
      refs: o.evidenceRefs.map((r) => r.kind),
    })),
    /* Named by what each observation asks of the reader, so the walks address
       roles rather than ordinals — an observation added later cannot silently
       re-point a walk at a different case. */
    roles: {
      /** one section, body required */
      singleSection: reading.observations[0]!.key,
      /** two sections in DIFFERENT structure units, body required */
      twoSectionsTwoUnits: reading.observations[1]!.key,
      /** two sections inside ONE structure unit, body required */
      twoSectionsOneUnit: reading.observations[2]!.key,
      /** one section belonging to NO structure unit, body required */
      unplacedSection: reading.observations[3]!.key,
      /** position and structure only — no body authority is ever required */
      structureOnly: reading.observations[4]!.key,
    },
  };
  writeFileSync(out, JSON.stringify(fixture, null, 2));
  console.log(JSON.stringify(fixture, null, 2));
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
