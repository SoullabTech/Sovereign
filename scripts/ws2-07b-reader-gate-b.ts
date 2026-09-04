/**
 * BUILD-07B — GATE B · bounded live reader witness.
 *
 * ONE question (founder ruling, 2026-09-04): did the actual reader execute the
 * contract Gate A proved? Not whether its noticing is good — that is
 * downstream (07C and the eventual real-Work proof).
 *
 *   MAIA_INFERENCE_MODE= ANTHROPIC_API_KEY=... npx tsx scripts/ws2-07b-reader-gate-b.ts [--lens development] [--out <file.json>]
 *
 * WHAT THIS DOES
 *   · builds ONE invented manuscript fixture in memory — never a member's Work,
 *     never the database — and freezes it with BUILD-07A `freezeReadState`
 *   · recovers whole-section prose through `recoverEvidence` under that state
 *   · verifies the reader module on disk is byte-identical to the pinned
 *     candidate (blob ids below), so a later docs-only commit is still the
 *     same reader and a changed reader refuses to be witnessed as this one
 *   · makes exactly ONE `runStructured` call through `readDevelopmentally`
 *   · records: resolved model, reader version, prompt-contract hash, rendered
 *     request digest, outcome, and — for claims — that every ref bound and
 *     every claim carries a closed non-conclusion (the host already refused
 *     otherwise; this records the proof)
 *   · writes a JSON evidence record; no prose from the fixture is stored
 *     beyond the invented text itself, which is public
 *
 * WHAT THIS DOES NOT DO
 *   · no second read, no retry, no scope expansion, no model choice on failure
 *   · no tuning: a refusal or a FAIL is CLASSIFIED (reader defect → repair in
 *     the unit; contract defect → ruling), never patched around here
 */

import { createHash } from 'crypto';
import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

/** The pinned BUILD-07B candidate and the git blob ids of its reader module. */
const CANDIDATE = '421f25bd6';
const CANDIDATE_BLOBS: Record<string, string> = {
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

/* ── the invented fixture ────────────────────────────────────────────────── */

const FIXTURE_TITLE = 'The Lantern Road (invented witness manuscript)';
const SECTIONS: { id: string; text: string }[] = [
  { id: 'w1', text: 'One\n\nMara found the lantern in her grandmother\'s shed the week the river changed course. It was brass, dented on one side, and it lit on the first try, which she took as a sign 😀. She told no one.\n\n' },
  { id: 'w2', text: 'Two\n\nThe town council met about the river. Mara sat at the back and counted the ways the men avoided saying the word flood. Eleven. She did not mention the lantern; it did not seem to belong to this kind of meeting.\n\n' },
  { id: 'w3', text: 'Three\n\nHer brother Tomas came home from the city with a plan and a woman named Ines who laughed at the wrong moments. The plan involved the shed. Mara moved the lantern to her room and put it under the bed, where it hummed faintly at night — or she imagined it did.\n\n' },
  { id: 'w4', text: 'Four\n\nThe river rose. This is the chapter where the water comes into the lower street and the council\'s eleven silences become one loud argument in the church hall. Tomas\'s plan is mentioned again, and again nobody says what it is.\n\n' },
  { id: 'w5', text: 'Five\n\nMara takes the lantern to the water. Later she will say she does not know why. It does not do anything — it is a lantern — but she stands there holding it until Ines finds her, and Ines, for once, does not laugh.\n\n' },
  { id: 'w6', text: 'Six\n\nAfter. The river settled into its new bed. The shed was gone. Tomas\'s plan, it turned out, had been to sell the land, and the land was now mostly river. Mara kept the lantern on the windowsill where anyone could see it.\n' },
];

type Lens = 'structure' | 'development' | 'continuity' | 'arc' | 'voice' | 'coherence' | 'reader';

function arg(name: string, fallback: string): string {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

async function main() {
  const lens = arg('lens', 'development') as Lens;
  const out = arg('out', join(process.cwd(), `ws2-07b-gate-b.${Date.now()}.json`));

  console.log('\nBUILD-07B · GATE B · bounded live reader witness\n');

  /* 0 · candidate identity — the reader on disk must BE the pinned candidate */
  const drift = Object.entries(CANDIDATE_BLOBS)
    .map(([p, expected]) => ({ p, expected, actual: gitBlobId(p) }))
    .filter((x) => x.actual !== x.expected);
  if (drift.length > 0) {
    console.log('✗ reader module on disk is not the pinned candidate:');
    for (const d of drift) console.log(`    ${d.p}\n      expected ${d.expected}\n      actual   ${d.actual}`);
    console.log('\nGATE B     REFUSED — witness only the candidate it was pinned to\n');
    process.exit(3);
  }
  let head = 'unknown';
  try { head = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim(); } catch { /* not a checkout */ }
  console.log(`  candidate ${CANDIDATE} · reader module byte-identical · checkout HEAD ${head}`);

  const { partitionFromSections } = await import('@/lib/manuscript/draftSections');
  const { freezeReadState } = await import('@/lib/manuscript/development/readState');
  const { recoverEvidence } = await import('@/lib/manuscript/development/resolve');
  const { bindEvidence } = await import('@/lib/manuscript/development/bind');
  const { isNonConclusion, DEVELOPMENTAL_READ_CEILING_CODE_POINTS } = await import('@/lib/manuscript/developmentalReader/contract');
  const { promptContractHash, READER_VERSION, renderRequest, renderedRequestDigest } = await import('@/lib/manuscript/developmentalReader/render');
  const { validateRequest } = await import('@/lib/manuscript/developmentalReader/validate');
  const { readDevelopmentally } = await import('@/lib/manuscript/developmentalReader/read');

  /* 1 · freeze the invented Work (07A, in memory) */
  const draft = { draftId: 'witness-draft', content: SECTIONS.map((s) => s.text).join(''), sections: SECTIONS };
  const revision = { revisionNumber: 1, content: draft.content, sectionPartition: partitionFromSections(SECTIONS) };
  const bodyScope = ['w1', 'w2', 'w3', 'w5'];   // w4 and w6 at position depth — coverage is partial ON PURPOSE
  const structure = {
    units: [
      { id: 'part-before', parent_id: null, position: 0, kind: 'part', title: 'Before the water', origin: 'member', adopted_from_id: null },
      { id: 'part-after', parent_id: null, position: 1, kind: 'part', title: 'After', origin: 'member', adopted_from_id: null },
    ],
    members: [
      { unit_id: 'part-before', draft_section_id: 'w1' }, { unit_id: 'part-before', draft_section_id: 'w2' },
      { unit_id: 'part-before', draft_section_id: 'w3' }, { unit_id: 'part-after', draft_section_id: 'w4' },
      { unit_id: 'part-after', draft_section_id: 'w5' }, { unit_id: 'part-after', draft_section_id: 'w6' },
    ],
  };
  const frozen = freezeReadState({ draft, revision, bodyScope, structure });
  if (!frozen.ok) { console.log(`✗ freeze refused: ${frozen.refusal} ${frozen.detail}`); process.exit(3); }
  const evidence = frozen.value;

  /* 2 · recover prose under the frozen state — the only prose path */
  const recovered = bodyScope.map((sectionId) => {
    const r = recoverEvidence({ kind: 'section', sectionId }, evidence.readState, revision.content);
    if (!r.ok || r.value.kind !== 'text') throw new Error(`recover refused for ${sectionId}: ${JSON.stringify(r)}`);
    return r.value;
  });
  const request = { commissionedLens: lens, evidence, recovered };
  const valid = validateRequest(request);
  if (!valid.ok) { console.log(`✗ request invalid: ${valid.refusal} ${valid.detail}`); process.exit(3); }
  const rendered = renderRequest(request);
  const requestDigest = renderedRequestDigest(rendered);
  console.log(`  fixture "${FIXTURE_TITLE}" · ${SECTIONS.length} sections · body ${bodyScope.join(',')} · ${valid.bodyCodePoints} / ${DEVELOPMENTAL_READ_CEILING_CODE_POINTS} code points · structure supplied`);
  console.log(`  lens ${lens} · reader ${READER_VERSION} · prompt ${promptContractHash().slice(0, 16)}… · request ${requestDigest.slice(0, 16)}…`);

  /* 3 · exactly one live read */
  const t0 = Date.now();
  const result = await readDevelopmentally(request);
  const latencyMs = Date.now() - t0;

  /* 4 · adjudicate the contract, not the prose */
  const rows: { id: string; ok: boolean; detail?: string }[] = [];
  const row = (id: string, ok: boolean, detail?: string) => rows.push({ id, ok, detail });

  row('B1 one real seam call completed (no refusal from policy or provider)',
    result.outcome !== 'refused' || !['structured_inference_unavailable', 'provider_unavailable', 'invalid_inference_mode', 'not_configured'].includes(result.refusal),
    result.outcome === 'refused' ? `${result.refusal}: ${result.detail}` : undefined);
  row('B2 outcome is claims or a legitimate none (not a model-output refusal)',
    result.outcome === 'claims' || result.outcome === 'none',
    result.outcome === 'refused' ? `${result.refusal}: ${result.detail}` : undefined);
  if (result.outcome !== 'refused') {
    row('B3 resolved model recorded from the seam', typeof result.reader.model === 'string' && result.reader.model.length > 0, result.reader.model);
    row('B4 reader identity is DEVELOPMENTAL-READER-01 with the prompt-contract hash',
      result.reader.readerVersion === READER_VERSION && result.reader.promptHash === promptContractHash());
  }
  if (result.outcome === 'claims') {
    const rebind = result.claims.map((c) => bindEvidence(c.refs, evidence));
    row('B5 every returned ref re-binds against the frozen evidence', rebind.every((b) => b.ok));
    row('B6 every claim carries ≥1 closed non-conclusion', result.claims.every((c) => c.doesNotEstablish.length > 0 && c.doesNotEstablish.every(isNonConclusion)));
    row('B7 no claim carries a foreign / 07C-shaped field', result.claims.every((c) => Object.keys(c).sort().join(',') === 'doesNotEstablish,refs,text'));
    row('B8 no claim cites prose from a position-depth section', result.claims.every((c) => c.refs.every((r) => !('sectionId' in r) || evidence.coverage.sections[r.sectionId] === 'body')));
    row('B9 claim text is non-empty', result.claims.every((c) => c.text.trim().length > 0));
  }
  row('B10 exactly one read; no second capture, no scope expansion', true, 'by construction — the host loop has no read-request path');

  const failures = rows.filter((r) => !r.ok);
  for (const r of rows) console.log(`  ${r.ok ? '✓' : '✗'} ${r.id}${r.detail ? ` — ${r.detail}` : ''}`);

  const record = {
    unit: 'BUILD-07B', gate: 'B', candidate: CANDIDATE, checkoutHead: head, ranAt: new Date().toISOString(),
    fixture: { title: FIXTURE_TITLE, sections: SECTIONS.map((s) => s.id), bodyScope, bodyCodePoints: valid.bodyCodePoints,
      structureSupplied: true, inputFingerprint: evidence.readState.inputFingerprint },
    lens, reader: result.outcome === 'refused' ? null : result.reader,
    promptContractHash: promptContractHash(), renderedRequestDigest: requestDigest, latencyMs,
    outcome: result.outcome,
    refusal: result.outcome === 'refused' ? { refusal: result.refusal, detail: result.detail, index: result.index } : null,
    claims: result.outcome === 'claims' ? result.claims : [],
    rows, verdict: failures.length === 0 ? 'PASS' : 'FAIL',
  };
  writeFileSync(out, JSON.stringify(record, null, 2));

  console.log(`\n${rows.length} checks · ${failures.length} failure(s) · ${latencyMs} ms · record ${out}`);
  console.log(`GATE B     ${failures.length === 0 ? 'PASS — the reader executed the proved contract' : 'FAIL — classify before touching anything'}\n`);
  process.exit(failures.length === 0 ? 0 : 1);
}

main().catch((err) => { console.error(err); process.exit(2); });
