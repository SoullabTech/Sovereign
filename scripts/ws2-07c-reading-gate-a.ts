/**
 * BUILD-07C — GATE A · structural witness for the developmental reading.
 *
 *   DATABASE_URL=postgres://... npx tsx scripts/ws2-07c-reading-gate-a.ts
 *
 * Falsifiers C1–C22, derived from DECIDE INV-0 … INV-25 and the founder's
 * 07C opening rulings (observation-only v1, verbatim text, closed phenomenon
 * family, one bounded classifier call, no rewriting, immutability, three-state
 * supersession). The inference seam REFUSES throughout (sovereign mode) — no
 * model participates. Gate A proves the architecture; Gate B (one live
 * commission on an invented fixture, then an edit, then the assessment) is a
 * separate act and closes the unit.
 *
 * The store half needs a UTF-8 database with the canonical chain applied
 * (baseline + migrations through 20260904000001). The witness inserts one
 * fixture member and manuscript, writes readings through the store, and
 * cleans up after itself; it touches no other row.
 */

import { createHash } from 'crypto';
import { execSync } from 'child_process';
import { randomUUID } from 'crypto';
import Module from 'module';

process.env.MAIA_INFERENCE_MODE = 'sovereign';

let adapterLoaded = false;
const moduleLoader = Module as unknown as { _load: (request: string, ...rest: unknown[]) => unknown };
const originalLoad = moduleLoader._load;
moduleLoader._load = function (this: unknown, request: string, ...rest: unknown[]) {
  if (/anthropicStructuredAdapter|@anthropic-ai\/sdk/.test(request)) adapterLoaded = true;
  return originalLoad.call(this, request, ...rest);
};

let checks = 0; let failures = 0; const failed: string[] = [];
function check(id: string, ok: boolean, detail = ''): void {
  checks += 1;
  if (ok) console.log(`  ✓ ${id}`);
  else { failures += 1; failed.push(id); console.log(`  ✗ ${id}${detail ? ` — ${detail}` : ''}`); }
}

async function main() {
  if (!process.env.DATABASE_URL) { console.error('DATABASE_URL is required (a UTF-8 scratch database with the canonical chain applied)'); process.exit(2); }
  const { query } = await import('@/lib/db/postgres');
  const { evidenceAtRev1, liveDraft, revisionOf, STRUCTURE } = await import('@/lib/manuscript/development/__tests__/fixture');
  const { freezeReadState } = await import('@/lib/manuscript/development/readState');
  const { recoverEvidence } = await import('@/lib/manuscript/development/resolve');
  const { readerIdentity } = await import('@/lib/manuscript/developmentalReader/read');
  const { DEVELOPMENTAL_PHENOMENA, observationKey } = await import('@/lib/manuscript/developmentalReading/contract');
  const { freezeReading } = await import('@/lib/manuscript/developmentalReading/freeze');
  const { assessReading } = await import('@/lib/manuscript/developmentalReading/assess');
  const { CLASSIFIER_VERSION, classifierPromptHash, classifierTool, classifyClaims, parseClassifierBlocks, renderClassificationRequest, CLASSIFIER_SYSTEM } = await import('@/lib/manuscript/developmentalReading/classify');
  const { assertNoProseKeys, freezeAndStore, listReadings, loadReading } = await import('@/lib/manuscript/developmentalReading/store');
  const { promptContractHash, READER_VERSION } = await import('@/lib/manuscript/developmentalReader/render');

  console.log('\nBUILD-07C · GATE A · structural witness (seam refusing)\n');

  const enc = await query<{ e: string }>(`SELECT current_setting('server_encoding') AS e`);
  check('C0 database server_encoding = UTF8 (else STOP)', enc.rows[0].e === 'UTF8', enc.rows[0].e);
  if (enc.rows[0].e !== 'UTF8') process.exit(1);
  const ledger = await query<{ n: string }>(`SELECT count(*)::text AS n FROM schema_migrations WHERE filename = '20260904000001_developmental_readings.sql'`);
  check('C0 migration 20260904000001_developmental_readings applied', ledger.rows[0].n === '1');

  /* ── fixture: 07A evidence in memory + a reader result with fixture blocks ── */
  /* Real drafts have uuid ids and the store column is uuid; the shared 07A
     fixture names its draft 'draft-1', so the witness freezes its own. */
  const draft = { ...liveDraft(), draftId: randomUUID() };
  const revision = revisionOf(draft);
  const frozenFx = freezeReadState({ draft, revision, bodyScope: ['s0', 's1'], structure: STRUCTURE });
  if (!frozenFx.ok) throw new Error(`fixture freeze refused: ${frozenFx.refusal}`);
  const evidence = frozenFx.value;
  const recovered = ['s0', 's1'].map((sectionId) => {
    const r = recoverEvidence({ kind: 'section' as const, sectionId }, evidence.readState, revision.content);
    if (!r.ok || r.value.kind !== 'text') throw new Error('fixture recover failed');
    return r.value;
  });
  const request = { commissionedLens: 'development' as const, evidence, recovered };
  const READER = readerIdentity('witness-model');
  const CLASSIFIER = { provider: 'anthropic' as const, model: 'witness-model', promptHash: classifierPromptHash(), classifierVersion: CLASSIFIER_VERSION };
  const claimsResult = {
    outcome: 'claims' as const, reader: READER,
    claims: [
      { text: '  The lantern is introduced in s0 and not mentioned in s1.  ', refs: [{ kind: 'section', sectionId: 's0' }, { kind: 'section', sectionId: 's1' }], doesNotEstablish: ['across-unread-span'] },
      { text: 'The two authored chapters split the sequence at s2.', refs: [{ kind: 'section-run', sectionIds: ['s1', 's2', 's3'] }, { kind: 'structure-units', unitIds: ['u1', 'u2'] }], doesNotEstablish: ['authored-structure-relation', 'chronology'] },
    ] as never,
  };

  /* ── C1–C8 · the freeze (INV-0, 2, 5/8, 10, 12, 16, 23/24; verbatim; observation-only) ── */
  const fz = freezeReading({ manuscriptId: randomUUID(), request, result: claimsResult, phenomena: ['recurrence', 'positional-asymmetry'], reader: READER, classifier: CLASSIFIER });
  check('C1 an accepted reader result freezes into observations, one per claim', fz.ok && fz.value.outcome === 'reading' && fz.value.observations.length === 2);
  if (!fz.ok) { console.log(fz); process.exit(1); }
  const obs = fz.value.observations;
  const o1 = obs[0] as (typeof obs)[number]; const o2 = obs[1] as (typeof obs)[number];
  check('C2 observation text is the claim text VERBATIM (not even trimmed)', o1.observation === '  The lantern is introduced in s0 and not mentioned in s1.  ');
  check('C3 keys are o1…oN by position (INV-2)', obs.map((o) => o.key).join(',') === 'o1,o2' && observationKey(6) === 'o7');
  check('C4 lens copied from the commission onto every observation; phenomenon from the classifier (INV-10, INV-12)', obs.every((o) => o.lens === 'development') && o2.phenomenon === 'positional-asymmetry');
  check('C5 structureDependency derived from refs (INV-16): independent · authored-structure', o1.structureDependency.kind === 'independent' && o2.structureDependency.kind === 'authored-structure');
  check('C6 observation-only v1: exactly key · lens · phenomenon · evidenceRefs · observation · doesNotEstablish · structureDependency', Object.keys(o1).sort().join(',') === 'doesNotEstablish,evidenceRefs,key,lens,observation,phenomenon,structureDependency');
  const none = freezeReading({ manuscriptId: randomUUID(), request, result: { outcome: 'none', reader: READER }, phenomena: [], reader: READER, classifier: null });
  check('C7 a none result freezes as a complete none reading with state, coverage, provenance (INV-23/24)', none.ok && none.value.outcome === 'none' && none.value.observations.length === 0 && none.value.coverage === evidence.coverage ? true : false);
  const refusedIn = freezeReading({ manuscriptId: randomUUID(), request, result: { outcome: 'refused', refusal: 'ceiling_exceeded', detail: '', index: null }, phenomena: [], reader: READER, classifier: null });
  const unbind = freezeReading({ manuscriptId: randomUUID(), request: { ...request, evidence: evidenceAtRev1({ withStructure: false }).evidence }, result: claimsResult, phenomena: ['recurrence', 'movement'], reader: READER, classifier: CLASSIFIER });
  const badPh = freezeReading({ manuscriptId: randomUUID(), request, result: claimsResult, phenomena: ['recurrence', 'irony' as never], reader: READER, classifier: CLASSIFIER });
  check('C8 refusals are typed: reader_refused · claim_unbindable (whole freeze) · unknown_phenomenon', !refusedIn.ok && refusedIn.refusal === 'reader_refused' && !unbind.ok && unbind.refusal === 'claim_unbindable' && unbind.index === 1 && !badPh.ok && badPh.refusal === 'unknown_phenomenon');

  /* ── C9–C12 · the classifier (founder ruling) ── */
  const schema = JSON.stringify(classifierTool().input_schema);
  check('C9 phenomenon family = UNDERSTAND §4, eight values, in the tool schema verbatim', DEVELOPMENTAL_PHENOMENA.length === 8 && DEVELOPMENTAL_PHENOMENA.every((p) => schema.includes(`"${p}"`)));
  const rendered = renderClassificationRequest([{ text: 'claim', doesNotEstablish: ['author-intent'] }], 'voice');
  check('C10 the classifier request carries claim text · lens · non-conclusions and NO section text', rendered.includes('COMMISSIONED LENS: voice') && !/=== SECTION|SECTION TEXT/.test(rendered) && !/rewrite|interpret/.test(schema));
  const uncl = parseClassifierBlocks([{ type: 'tool_use', id: 't', name: 'classify_phenomena', input: { classifications: [{ index: 0, phenomenon: 'unclassifiable' }] } }], 1);
  check('C11 unclassifiable → refusal (never an invented category)', !uncl.ok && uncl.refusal === 'classifier_unclassifiable');
  const seam = await classifyClaims([{ text: 'x', doesNotEstablish: ['author-intent'] }], 'voice', 'witness-model');
  check('C12 under sovereign mode the classifier seam refuses; adapter never loaded', !seam.ok && seam.refusal === 'structured_inference_unavailable' && adapterLoaded === false);
  check('C12 classifier provenance: version + hash over system ⧺ NUL ⧺ tool', CLASSIFIER_VERSION === 'DEVELOPMENTAL-PHENOMENON-CLASSIFIER-01' && classifierPromptHash() === createHash('sha256').update(CLASSIFIER_SYSTEM, 'utf8').update('\u0000').update(JSON.stringify(classifierTool()), 'utf8').digest('hex'));

  /* ── C13–C19 · the store (INV-1, 3, 4, 22, 25; no prose) ── */
  const tag = randomUUID().slice(0, 8);
  const member = await query<{ id: string }>(`INSERT INTO members (passkey, username, password_hash, name) VALUES ($1, $2, 'x', 'WS2-07C witness') RETURNING id`, [`WS207C-${tag}`, `ws207c-${tag}`]);
  const memberId = member.rows[0].id;
  const ms = await query<{ id: string }>(`INSERT INTO member_manuscripts (member_id, title) VALUES ($1, 'WS2-07C reading fixture') RETURNING id`, [memberId]);
  const manuscriptId = ms.rows[0].id;
  try {
    const toStore = { ...fz.value, manuscriptId };
    const stored = await freezeAndStore(memberId, toStore);
    check('C13 the store mints the id and stamps frozenAt at the write (INV-1, INV-25)', stored.ok && /^[0-9a-f-]{36}$/.test(stored.id) && !Number.isNaN(Date.parse(stored.frozenAt)));
    if (!stored.ok) throw new Error(stored.refusal);
    const loaded = await loadReading(stored.id, memberId);
    check('C14 loaded by identity: outcome, observations by key, text verbatim, refs, non-conclusions, provenance', !!loaded && loaded.outcome === 'reading' && loaded.observations.length === 2
      && loaded.observations[0]?.key === 'o1' && loaded.observations[0]?.observation === o1.observation
      && JSON.stringify(loaded.observations[1]?.evidenceRefs) === JSON.stringify(o2.evidenceRefs)
      && loaded.provenance.reader.readerVersion === READER_VERSION && loaded.provenance.classifier?.classifierVersion === CLASSIFIER_VERSION
      && loaded.provenance.frozenAt === stored.frozenAt && loaded.readState.inputFingerprint === evidence.readState.inputFingerprint);
    const other = await loadReading(stored.id, randomUUID());
    check('C15 another member cannot load it (scoped by member)', other === null);
    let updateRefused = false;
    try { await query(`UPDATE developmental_readings SET outcome = 'none' WHERE id = $1`, [stored.id]); } catch (e) { updateRefused = /immutable/.test(String(e)); }
    let obsUpdateRefused = false;
    try { await query(`UPDATE developmental_observations SET observation = 'rewritten' WHERE reading_id = $1`, [stored.id]); } catch (e) { obsUpdateRefused = /immutable/.test(String(e)); }
    check('C16 a frozen reading and its observations refuse UPDATE at the database (INV-4)', updateRefused && obsUpdateRefused);
    const noneStored = await freezeAndStore(memberId, { ...(none.ok ? none.value : (() => { throw new Error('none'); })()), manuscriptId });
    check('C17 a none reading persists as a complete reading', noneStored.ok);
    let noneObsRefused = false;
    if (noneStored.ok) {
      try { await query(`INSERT INTO developmental_observations (reading_id, observation_key, position, lens, phenomenon, evidence_refs, observation, does_not_establish, structure_dependency) VALUES ($1, 'o1', 0, 'development', 'movement', '[]', 'x', '[]', 'independent')`, [noneStored.id]); }
      catch (e) { noneObsRefused = /outcome none/.test(String(e)); }
    }
    check('C18 a none reading cannot carry observations — trigger refuses (INV-0)', noneObsRefused);
    const listed = await listReadings(manuscriptId, memberId);
    check('C19 listing is newest-first summaries with observation counts', listed.length === 2 && listed.every((r) => typeof r.frozenAt === 'string') && listed.some((r) => r.outcome === 'none' && r.observationCount === 0) && listed.some((r) => r.outcome === 'reading' && r.observationCount === 2));
    const prose = assertNoProseKeys({ readState: { ...evidence.readState, sections: { s0: { text: 'leaked prose' } } } });
    const proseStore = await freezeAndStore(memberId, { ...toStore, readState: { ...toStore.readState, extra: { text: 'leak' } } as never });
    check('C20 a state payload carrying prose is refused before any write', prose !== null && !proseStore.ok && proseStore.refusal === 'prose_in_state');
    const rows = await query<{ n: string }>(`SELECT count(*)::text AS n FROM developmental_readings WHERE manuscript_id = $1`, [manuscriptId]);
    check('C20 nothing was written by the refused store call', rows.rows[0].n === '2');

    /* ── C21–C22 · supersession (INV-19–22) ── */
    if (loaded) {
      const now = { sections: liveDraft().sections, structure: STRUCTURE };
      const a0 = assessReading(loaded, now);
      const a1 = assessReading(loaded, { sections: liveDraft({ s0: 'The First Movement 😀 — edited.\n\n' }).sections, structure: STRUCTURE });
      const a2 = assessReading(loaded, { sections: null, structure: null });
      check('C21 three-state, scoped per observation: unchanged → current; s0 edited → o1 superseded (section-text s0), o2 current; unloadable → unmeasured',
        a0.reading.state === 'current' && a1.observations.o1?.state === 'superseded' && a1.observations.o2?.state === 'current' && a1.reading.state === 'superseded' && a2.reading.state === 'unmeasured');
      const before = JSON.stringify(loaded);
      assessReading(loaded, { sections: liveDraft({ s1: 'x' }).sections, structure: STRUCTURE });
      const still = await loadReading(stored.id, memberId);
      check('C22 assessment re-anchors nothing and the stored reading is retained unchanged (INV-19, INV-22)', JSON.stringify(loaded) === before && JSON.stringify(still) === JSON.stringify(loaded));
    }
  } finally {
    await query(`DELETE FROM member_manuscripts WHERE id = $1`, [manuscriptId]);
    await query(`DELETE FROM members WHERE id = $1`, [memberId]);
  }

  let head = 'unknown';
  try { head = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim(); } catch { /* not a checkout */ }
  console.log(`\n${checks} checks · ${failures} failure(s)`);
  if (failures > 0) console.log(`failed: ${failed.join(' | ')}`);
  console.log(`\nCANDIDATE  git HEAD ${head}`);
  console.log(`READER     ${READER_VERSION} · ${promptContractHash().slice(0, 16)}…`);
  console.log(`CLASSIFIER ${CLASSIFIER_VERSION} · ${classifierPromptHash().slice(0, 16)}…`);
  console.log(`GATE A     ${failures === 0 ? 'PASS — STRUCTURALLY PROVED · NOT CLOSED (Gate B pending)' : 'FAIL'}\n`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((err) => { console.error(err); process.exit(2); });
