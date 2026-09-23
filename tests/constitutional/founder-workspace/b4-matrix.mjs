// @ts-check
/**
 * B4 execution matrix — programme-state.v1 projector.
 * Laws: PJ-0 determinism (same input → same content_hash) · PJ-1 standing verbatim (PS-1) · PJ-2 complete only by FD-3 arithmetic ·
 *       PJ-3 thread orients, never overrides · PJ-4 founder record outranks a newer plain record · PJ-5 same-day disagreement → UNVERIFIED / CONFLICT ·
 *       PJ-6 unassociable subjects stay UNCLASSIFIED and block complete · PJ-7 external (D-01) rows carry the boundary (PS-5) ·
 *       PJ-8 no authority (authority_effect none; nothing outside founder-workspace reads a projection) · PJ-9 F0's programme ids are a subset of the live projection ·
 *       PJ-10 the projection validates as programme_state inside a live view-model (VM-4).
 * B4R1 (identity + succession reconciliation): R-A0 a record's own **Programme:/Lane:** declaration governs over its filename prefix ·
 *       R-F1 a family member id resolves to the family canonical · R-O1 docs/ops enters by map-named lane only, never by directory ·
 *       R-A4 a map alias associates; R-A4s an aliased SUPPORTING record never supplies standing · RM-1 a map entry without evidence is refused ·
 *       RM-3 a classified subject is examined and never emitted as a programme · R-S1 an explicit Supersedes line resolves a same-day set ·
 *       R-S2 git first-add order resolves it next · R-S3 a same-commit set stays UNVERIFIED / CONFLICT · R-C1 complete is never forced (one leftover blocks it) ·
 *       R-A5n a path mention by a no-standing note or bullet is not a citation (a docket naming an unclassified file must not associate it).
 * Run: node tests/constitutional/founder-workspace/b4-matrix.mjs
 */
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createRequire } from 'node:module';
import { readTree, project, DECISIONS, loadMap } from '../../../scripts/builder/founder-workspace/programme-state-projector.mjs';
import { validateViewModel } from '../../../scripts/builder/founder-workspace/viewmodel-v1.mjs';
import { liveReference, fixtureReference } from './reference.mjs';
import { REPO_ROOT } from '../../../scripts/builder/founder-workspace/read-organs.mjs';
import { CANDIDATES } from './b4-candidates.mjs';

const SCRATCH = process.env.FOUNDER_WORKSPACE_SCRATCH || os.tmpdir();
let failures = 0;
/** @param {boolean} ok @param {string} law @param {string} text */
function check(ok, law, text) { console.log(`${ok ? 'PASS' : 'FAIL'}  ${law}  ${text}`); if (!ok) failures++; }

// ── synthetic repository (the same substrate for every candidate) ─────────────
function makeRepo() {
  const root = mkdtempSync(path.join(SCRATCH, 'fw-b4-'));
  const d = path.join(root, 'docs/programme'); mkdirSync(path.join(d, 'evidence/EV-01'), { recursive: true });
  const w = (/** @type {string} */ f, /** @type {string} */ t) => writeFileSync(path.join(d, f), t);
  // ALPHA-01: charter (tier 2, 09-01), plain record newer (tier 2, 09-10), founder adjudication older (tier 1, 09-05)
  w('ALPHA-01_CHARTER_2026-09-01.md', '# Alpha\n\n**Standing:** OPENED · nothing ratified\n');
  w('ALPHA-01_FOUNDER_ADJUDICATION_2026-09-05.md', '# Alpha adjudication\n\n**Disposition:** ⭐ **A0 PASS** · A1 OPEN · ⛔ nothing else\n');
  w('ALPHA-01_A1_RECORD_2026-09-10.md', '# Alpha A1\n\n**Standing:** A1 DELIVERED · awaiting adjudication\n');
  // BETA-02: two same-day tier-2 records with different standings → conflict
  w('BETA-02_X_2026-09-12.md', '**Status:** X DONE\n');
  w('BETA-02_Y_2026-09-12.md', '**Status:** Y DONE\n');
  // GAMMA-03: only a supporting note (no standing) → UNVERIFIED
  w('GAMMA-03_NOTES_2026-09-13.md', '# notes\nnothing declared\n');
  // evidence dir association
  w('evidence/EV-01/witness.md', '**Standing:** witnessed\n');
  // unassociable file
  w('LOOSE_FINDING_2026-09-14.md', '**Standing:** a finding with no programme id\n');
  // external via D-01 rule
  w('DELTA-04_FOUNDER_RULINGS_2026-09-15.md', '**Disposition:** RULED\n\n| **D-01** | **EXTERNAL PROTECTED DEPENDENCY.** `OMEGA-09 / M1` lives outside this repository. |\n');
  writeFileSync(path.join(root, 'CLAUDE.md'), '# anchor\n\n## Current priority thread\n\n- **LATEST — 2026-09-20 — ⭐ `ALPHA-01` A2 OPENED by founder direction.** thread text\n- **LATEST — 2026-09-11 — some bullet with no id.** text\n- **LATEST — 2026-09-16 — `GAMMA-03` mentioned.** text\n\n## Re-entry vow\n');
  return root;
}

const root = makeRepo();
const tree = readTree({ root, map: null, git: null }); // B4 baseline laws: no map, no git — the bare FD-3 projector
const P = project(tree, { observed_against: 'sha-test', projected_at: 't0' });
const byId = (/** @type {any} */ p, /** @type {string} */ id) => p.programmes.find((/** @type {any} */ r) => r.id === id);

// PJ-0 determinism
{ const P2 = project(readTree({ root, map: null, git: null }), { observed_against: 'sha-test', projected_at: 't1' }); check(P.content_hash === P2.content_hash && P.projected_at !== P2.projected_at, 'PJ-0', `deterministic: identical content_hash across runs (${P.content_hash.slice(0, 12)}), projected_at excluded`); }
// PJ-1 verbatim
check(byId(P, 'ALPHA-01').standing === '⭐ **A0 PASS** · A1 OPEN · ⛔ nothing else', 'PJ-1', `standing verbatim: "${byId(P, 'ALPHA-01').standing}"`);
// PJ-4 founder record outranks newer plain record
check(byId(P, 'ALPHA-01').last_change.source.endsWith('FOUNDER_ADJUDICATION_2026-09-05.md') && byId(P, 'ALPHA-01').precedence.tier === 1, 'PJ-4', 'older founder adjudication governs over a newer plain record');
// PJ-3 thread orients
{ const a = byId(P, 'ALPHA-01'); check(a.thread && a.thread.newer_act_identified === true && a.thread.overrides === false && a.standing.includes('A0 PASS'), 'PJ-3', 'newer thread bullet is identified, standing untouched'); }
// PJ-5 conflict
{ const b = byId(P, 'BETA-02'); check(b.evidence_state === 'UNVERIFIED / CONFLICT' && b.precedence.conflict.length === 2 && b.standing === 'UNVERIFIED / CONFLICT', 'PJ-5', 'same-day disagreement → UNVERIFIED / CONFLICT, both cited'); }
// PJ-6 unclassified
check(P.population.unclassified.some((u) => u.path.endsWith('LOOSE_FINDING_2026-09-14.md')) && P.population.unclassified.some((u) => u.kind === 'thread-bullet') && P.population.complete === false, 'PJ-6', `unassociable file + id-less bullet stay UNCLASSIFIED (${P.population.unclassified.length}); complete=false`);
// R-A2 evidence dir
check(byId(P, 'EV-01') && byId(P, 'EV-01').standing === 'witnessed', 'R-A2', 'evidence/<ID>/ file associates to <ID>');
// GAMMA no standing
check(byId(P, 'GAMMA-03').evidence_state === 'UNVERIFIED' && byId(P, 'GAMMA-03').standing === null, 'PS-4', 'programme with no standing record emitted as UNVERIFIED, not omitted');
// PJ-7 external
{ const o = byId(P, 'OMEGA-09'); check(o && o.external === true && o.custody.branch === 'outside this repository' && o.evidence_state === 'OBSERVED', 'PJ-7', 'D-01 rule: OMEGA-09 emitted as external with the boundary'); }
// PJ-2 completeness arithmetic on a fully classified repo
{
  const r2 = mkdtempSync(path.join(SCRATCH, 'fw-b4-clean-')); mkdirSync(path.join(r2, 'docs/programme'), { recursive: true });
  writeFileSync(path.join(r2, 'docs/programme/ONLY-01_CHARTER_2026-09-01.md'), '**Standing:** OPEN\n');
  writeFileSync(path.join(r2, 'CLAUDE.md'), '## Current priority thread\n\n- **LATEST — 2026-09-02 — `ONLY-01` open.**\n\n## Re-entry vow\n');
  const c = project(readTree({ root: r2, map: null, git: null }), { observed_against: 'x', projected_at: 't' });
  check(c.population.complete === true && c.population.examined === 1 && c.population.emitted === 1, 'PJ-2', 'a fully associated population may be complete:true');
  rmSync(r2, { recursive: true, force: true });
}
// PJ-8 no authority: static guard — nothing outside founder-workspace reads a projection
{
  /** @type {string[]} */
  const hits = [];
  const scan = (/** @type {string} */ d) => { for (const f of readdirSync(d)) { const p = path.join(d, f); if (f === 'node_modules' || f === 'founder-workspace' || f === '.git') continue; const st = statSync(p); if (st.isDirectory()) scan(p); else if (/\.(m?js|ts)$/.test(f) && /programme-state\.v1|programme-state-projector|projections\/programme-state/.test(readFileSync(p, 'utf8'))) hits.push(path.relative(REPO_ROOT, p)); } };
  for (const d of ['jarvis-desktop/src', 'scripts/builder', 'lib']) if (statSync(path.join(REPO_ROOT, d), { throwIfNoEntry: false })) scan(path.join(REPO_ROOT, d));
  check(hits.length === 0 && P.authority_effect === 'none' && P.presentation_only === true, 'PJ-8', `no consumer outside founder-workspace reads a projection (hits: ${hits.length}); authority_effect none`);
}
// PJ-10 validates inside a live view-model
{ const vm = /** @type {any} */ (liveReference()); vm.programme_state = P; const r = validateViewModel(vm, { mode: 'live' }); check(r.ok, 'PJ-10', `projection validates as programme_state in a live view-model (${r.violations.length} violations)`); if (!r.ok) r.violations.slice(0, 5).forEach((v) => console.log(`        ${v.law} ${v.path}: ${v.detail}`)); }
// PJ-9 real repository: F0 fixture ids ⊆ live projection ids
{
  const live = project(readTree({ root: REPO_ROOT }), { observed_against: 'repo', projected_at: 't' });
  const fixtureIds = fixtureReference().programme_state.programmes.map((/** @type {any} */ r) => r.id).flatMap((/** @type {string} */ id) => id.split(/\s*[\/·]\s*/)).map((/** @type {string} */ s) => s.trim()).filter((/** @type {string} */ s) => /^[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)+$/.test(s));
  const liveIds = new Set(live.programmes.map((/** @type {any} */ r) => r.id));
  // B4R1: the F0 fixture's ops lane (record in docs/ops, thread bullet without a backticked id) now enters the population by
  // name through programme-projection-map.v1 `ops_lanes` (R-O1). The B4 KNOWN_OUTSIDE_POPULATION exception is retired; the id must be present.
  const missing = fixtureIds.filter((/** @type {string} */ id) => !liveIds.has(id));
  const opsLane = live.programmes.find((/** @type {any} */ r) => r.id === 'WORKSTATION-STORAGE-RELIEF');
  const viaMap = !!opsLane && opsLane.association.some((/** @type {any} */ a) => a.rule.startsWith('R-O1') && a.path.startsWith('docs/ops/'));
  check(missing.length === 0 && viaMap, 'PJ-9', `F0 fixture programme ids ⊆ live projection (${fixtureIds.length} checked; missing: ${missing.join(', ') || 'none'}; WORKSTATION-STORAGE-RELIEF via R-O1: ${viaMap})`);
  const opsSwallowed = live.programmes.flatMap((/** @type {any} */ r) => /** @type {string[]} */ (r.sources)).filter((/** @type {string} */ x) => x.startsWith('docs/ops/'));
  check(opsSwallowed.length === live.population.map.ops_lanes && opsSwallowed.length >= 1, 'R-O1', `docs/ops files in the population = map ops_lanes exactly (${opsSwallowed.length}); the directory is not swallowed`);
  const vm = /** @type {any} */ (liveReference()); vm.programme_state = live; const r = validateViewModel(vm, { mode: 'live' });
  check(r.ok, 'PJ-10', `real projection validates live (${live.programmes.length} programmes · ${live.population.unclassified.length} unclassified · complete=${live.population.complete})`);
  check(live.population.complete === false, 'PJ-2', 'real repository is NOT complete (unclassified subjects exist) and says why');
}
// ── B4R1 synthetic repository: declarations, families, ops lanes, aliases, classifications, succession ──
const FAKE_GIT_LOG = [
  // newest first, as git prints it: THETA-08_B added after THETA-08_A; IOTA-09 A and B in the SAME commit
  '300', 'docs/programme/IOTA-09_A_2026-09-08.md', 'docs/programme/IOTA-09_B_2026-09-08.md', '',
  '200', 'docs/programme/THETA-08_B_2026-09-07.md', '',
  '100', 'docs/programme/THETA-08_A_2026-09-07.md', '',
].join('\n');
const fakeGit = (/** @type {string[]} */ args) => { if (args[0] !== 'log') throw new Error('only log is modelled'); return FAKE_GIT_LOG; };
const MAP_R1 = {
  schema: 'programme-projection-map.v1', authored: 'matrix',
  families: [{ family: 'S9', canonical: 'S9-DESIGN-01', member_pattern: '^S9(?:[-_]|$)', thread_token: 'S9', evidence: ['synthetic'] }],
  ops_lanes: [{ path: 'docs/ops/OPS_LANE_2026-09-03.md', id: 'OPS-LANE-01', evidence: ['synthetic'] }],
  aliases: [{ match: '^docs/programme/MAP_ALIASED_', id: 'ALPHA-01', role: 'supporting', evidence: ['synthetic'] }],
  classifications: [{ match: '^docs/programme/PARKED_', category: 'parked-defect', evidence: ['synthetic'] }],
  succession: { rules: ['R-S1', 'R-S2', 'R-S3'] },
};
function makeRepoR1() {
  const root = mkdtempSync(path.join(SCRATCH, 'fw-b4r1-'));
  mkdirSync(path.join(root, 'docs/programme'), { recursive: true }); mkdirSync(path.join(root, 'docs/ops'), { recursive: true });
  const w = (/** @type {string} */ f, /** @type {string} */ t) => writeFileSync(path.join(root, f), t);
  w('docs/programme/ALPHA-01_CHARTER_2026-09-01.md', '**Standing:** charter standing\n');
  w('docs/programme/MAP_ALIASED_FOUNDER_ADJUDICATION_2026-09-20.md', '**Disposition:** aliased standing that must never govern\n');
  w('docs/programme/ZETA-06_NOTE_2026-09-01.md', '# note\n\n**Lane:** `EPSILON-05`\n\n**Standing:** declared into EPSILON-05\n');
  w('docs/programme/S9-O1_RECORD_2026-09-02.md', '**Standing:** S9 family record\n');
  w('docs/programme/PARKED_DEFECT_2026-09-05.md', '# parked\nno programme id here\n');
  w('docs/programme/ETA-07_A_2026-09-06.md', '**Standing:** ETA A\n');
  w('docs/programme/ETA-07_B_2026-09-06.md', '**Supersedes:** ETA-07_A_2026-09-06.md\n\n**Standing:** ETA B\n');
  w('docs/programme/THETA-08_A_2026-09-07.md', '**Standing:** THETA A\n');
  w('docs/programme/THETA-08_B_2026-09-07.md', '**Standing:** THETA B\n');
  w('docs/programme/IOTA-09_A_2026-09-08.md', '**Standing:** IOTA A\n');
  w('docs/programme/IOTA-09_B_2026-09-08.md', '**Standing:** IOTA B\n');
  w('docs/programme/LOOSE_ONE_2026-09-09.md', '**Standing:** the one leftover\n');
  // a no-standing evidence note of ALPHA-01 that MENTIONS the loose file's path (to say it is unclassified) — R-A5 must not credit it
  w('docs/programme/ALPHA-01_B4R1_NOTE_2026-09-21.md', '# note\n\nremaining unclassified: `docs/programme/LOOSE_ONE_2026-09-09.md` names no programme.\n');
  w('docs/ops/OPS_LANE_2026-09-03.md', '**Standing:** ops lane standing\n');
  w('docs/ops/OTHER_2026-09-03.md', '**Standing:** must never enter the population\n');
  w('CLAUDE.md', '## Current priority thread\n\n- **LATEST — 2026-09-10 — `S9` family token bullet.** text\n\n## Re-entry vow\n');
  return root;
}
const rootR1 = makeRepoR1();
const readR1 = (/** @type {any} */ extra = {}) => readTree({ root: rootR1, map: MAP_R1, git: fakeGit, ...extra });
const R = project(readR1(), { observed_against: 'sha-r1', projected_at: 't0' });
/** @returns {string[]} */ const opsSources = (/** @type {any} */ p) => p.programmes.flatMap((/** @type {any} */ r) => /** @type {string[]} */ (r.sources)).filter((/** @type {string} */ x) => x.startsWith('docs/ops/'));

check(!byId(R, 'ZETA-06') && byId(R, 'EPSILON-05') && byId(R, 'EPSILON-05').standing === 'declared into EPSILON-05' && byId(R, 'EPSILON-05').association[0].rule === 'R-A0 declaration', 'R-A0', 'a **Lane:** declaration governs over the filename prefix');
check(!byId(R, 'S9-O1') && byId(R, 'S9-DESIGN-01') && byId(R, 'S9-DESIGN-01').standing === 'S9 family record' && byId(R, 'S9-DESIGN-01').thread_sources.length === 1, 'R-F1', 'family member id → canonical; the family thread token orients the same programme');
check(byId(R, 'OPS-LANE-01') && byId(R, 'OPS-LANE-01').standing === 'ops lane standing' && opsSources(R).length === 1 && !opsSources(R).some((/** @type {string} */ x) => x.includes('OTHER')), 'R-O1', 'the map-named ops lane is emitted; the sibling ops file never enters the population');
check(byId(R, 'ALPHA-01').standing === 'charter standing' && byId(R, 'ALPHA-01').association.some((/** @type {any} */ a) => a.rule === 'R-A4 map alias' && a.role === 'supporting') && byId(R, 'ALPHA-01').precedence.tier === 2, 'R-A4s', 'the aliased supporting record is attached and never supplies standing (a tier-1 filename does not help it)');
check(!byId(R, 'PARKED-DEFECT') && R.population.classified.some((/** @type {any} */ c) => c.path.endsWith('PARKED_DEFECT_2026-09-05.md') && c.category === 'parked-defect') && !R.population.unclassified.some((/** @type {any} */ u) => u.path.includes('PARKED')), 'RM-3', 'a classified subject is examined and is not a programme');
check(byId(R, 'ETA-07').standing === 'ETA B' && byId(R, 'ETA-07').precedence.succession?.rule.startsWith('R-S1'), 'R-S1', 'an explicit Supersedes line resolves the same-day set');
check(byId(R, 'THETA-08').standing === 'THETA B' && byId(R, 'THETA-08').precedence.succession?.rule.startsWith('R-S2'), 'R-S2', 'git first-add order resolves the next same-day set');
check(byId(R, 'IOTA-09').evidence_state === 'UNVERIFIED / CONFLICT' && byId(R, 'IOTA-09').precedence.conflict.length === 2, 'R-S3', 'a same-commit set stays UNVERIFIED / CONFLICT');
check(R.population.unclassified.length === 1 && R.population.complete === false, 'R-C1', 'one leftover unclassified subject keeps complete=false');
check(R.population.unclassified[0]?.path.endsWith('LOOSE_ONE_2026-09-09.md') && !byId(R, 'ALPHA-01').sources.some((/** @type {string} */ x) => x.includes('LOOSE_ONE')), 'R-A5n', 'a path mention by a no-standing note is not a citation: the loose file stays unclassified, not attached to ALPHA-01');
{
  const bad = path.join(rootR1, 'bad-map.json');
  writeFileSync(bad, JSON.stringify({ ...MAP_R1, aliases: [{ match: '^docs/programme/MAP_ALIASED_', id: 'ALPHA-01', role: 'supporting' }] }));
  let refused = false; try { loadMap(bad); } catch (e) { refused = /RM-1/.test(String(e)); }
  check(refused, 'RM-1', 'a map entry without evidence is refused by the loader');
  check(loadMap().schema === 'programme-projection-map.v1', 'RM-1', 'the committed map loads (every entry carries evidence)');
}
{ const R2 = project(readR1(), { observed_against: 'sha-r1', projected_at: 't9' }); check(R2.content_hash === R.content_hash, 'PJ-0', 'B4R1 projection deterministic across runs'); }

// ── defeat candidates ──
for (const c of CANDIDATES) {
  let dead = false, why = '';
  if (c.loadMap) {
    const bad = path.join(rootR1, 'bad-map.json');
    let strictRefused = false; try { loadMap(bad); } catch { strictRefused = true; }
    let lenientAccepted = false; try { c.loadMap(bad); lenientAccepted = true; } catch { /* refused */ }
    dead = strictRefused && lenientAccepted; why = `candidate loader accepted an evidence-less entry (${lenientAccepted})`;
    check(dead, c.id, `→ ${c.kills} (${c.belief}) ${dead ? 'DIES' : 'SURVIVES'}: ${why}`); continue;
  }
  const isR1 = /^(R-|RM-)/.test(c.kills);
  const p = isR1
    ? project(readR1(c.readOpts || {}), { observed_against: 'sha-r1', projected_at: 't0', decisions: /** @type {any} */ (c.decisions) })
    : project(tree, { observed_against: 'sha-test', projected_at: 't0', decisions: /** @type {any} */ (c.decisions) });
  switch (c.kills) {
    case 'PJ-3': dead = byId(p, 'ALPHA-01').thread.overrides === true; why = 'thread claims override'; break;
    case 'PJ-4': dead = byId(p, 'ALPHA-01').precedence.tier !== 1; why = `governing tier ${byId(p, 'ALPHA-01').precedence.tier}`; break;
    case 'PJ-5': dead = byId(p, 'BETA-02').evidence_state !== 'UNVERIFIED / CONFLICT'; why = `BETA-02 → ${byId(p, 'BETA-02').standing}`; break;
    case 'PJ-6': dead = !p.population.unclassified.some((u) => u.kind === 'file'); why = `unclassified files ${p.population.unclassified.filter((u) => u.kind === 'file').length}`; break;
    case 'PJ-1': dead = byId(p, 'ALPHA-01').standing !== byId(P, 'ALPHA-01').standing; why = `"${byId(p, 'ALPHA-01').standing}"`; break;
    case 'PJ-2': dead = p.population.complete === true; why = `complete=${p.population.complete} with ${p.population.unclassified.length} unclassified`; break;
    case 'R-A0': dead = !!byId(p, 'ZETA-06') || !byId(p, 'EPSILON-05'); why = `ZETA-06 emitted=${!!byId(p, 'ZETA-06')} EPSILON-05 emitted=${!!byId(p, 'EPSILON-05')}`; break;
    case 'R-S1': dead = byId(p, 'ETA-07').standing !== 'ETA B'; why = `ETA-07 → ${byId(p, 'ETA-07').standing}`; break;
    case 'R-S2': dead = byId(p, 'THETA-08').standing !== 'THETA B'; why = `THETA-08 → ${byId(p, 'THETA-08').standing}`; break;
    case 'R-S3': dead = byId(p, 'IOTA-09').evidence_state !== 'UNVERIFIED / CONFLICT'; why = `IOTA-09 → ${byId(p, 'IOTA-09').standing}`; break;
    case 'R-O1': dead = opsSources(p).some((/** @type {string} */ x) => x.includes('OTHER')); why = `ops files in population: ${opsSources(p).length}`; break;
    case 'RM-3': dead = !!byId(p, 'PARKED-DEFECT'); why = `PARKED-DEFECT emitted=${!!byId(p, 'PARKED-DEFECT')}`; break;
    case 'R-A4s': dead = byId(p, 'ALPHA-01').standing !== 'charter standing'; why = `ALPHA-01 → "${byId(p, 'ALPHA-01').standing}" tier ${byId(p, 'ALPHA-01').precedence.tier}`; break;
    case 'R-C1': dead = p.population.complete === true; why = `complete=${p.population.complete} with ${p.population.unclassified.length} unclassified`; break;
    case 'R-A5n': dead = byId(p, 'ALPHA-01').sources.some((/** @type {string} */ x) => x.includes('LOOSE_ONE')) || p.population.complete === true; why = `LOOSE_ONE attached=${byId(p, 'ALPHA-01').sources.some((/** @type {string} */ x) => x.includes('LOOSE_ONE'))} complete=${p.population.complete}`; break;
  }
  check(dead, c.id, `→ ${c.kills} (${c.belief}) ${dead ? 'DIES' : 'SURVIVES'}: ${why}`);
}
rmSync(root, { recursive: true, force: true });
rmSync(rootR1, { recursive: true, force: true });
console.log(failures === 0 ? '\nB4 MATRIX: ALL LAWS HOLD · CANDIDATES DEAD (exit 0)' : `\nB4 MATRIX: ${failures} failure(s) (exit 1)`);
process.exit(failures === 0 ? 0 : 1);
