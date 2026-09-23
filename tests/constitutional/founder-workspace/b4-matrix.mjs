// @ts-check
/**
 * B4 execution matrix — programme-state.v1 projector.
 * Laws: PJ-0 determinism (same input → same content_hash) · PJ-1 standing verbatim (PS-1) · PJ-2 complete only by FD-3 arithmetic ·
 *       PJ-3 thread orients, never overrides · PJ-4 founder record outranks a newer plain record · PJ-5 same-day disagreement → UNVERIFIED / CONFLICT ·
 *       PJ-6 unassociable subjects stay UNCLASSIFIED and block complete · PJ-7 external (D-01) rows carry the boundary (PS-5) ·
 *       PJ-8 no authority (authority_effect none; nothing outside founder-workspace reads a projection) · PJ-9 F0's programme ids are a subset of the live projection ·
 *       PJ-10 the projection validates as programme_state inside a live view-model (VM-4).
 * Run: node tests/constitutional/founder-workspace/b4-matrix.mjs
 */
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createRequire } from 'node:module';
import { readTree, project, DECISIONS } from '../../../scripts/builder/founder-workspace/programme-state-projector.mjs';
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
const tree = readTree({ root });
const P = project(tree, { observed_against: 'sha-test', projected_at: 't0' });
const byId = (/** @type {any} */ p, /** @type {string} */ id) => p.programmes.find((/** @type {any} */ r) => r.id === id);

// PJ-0 determinism
{ const P2 = project(readTree({ root }), { observed_against: 'sha-test', projected_at: 't1' }); check(P.content_hash === P2.content_hash && P.projected_at !== P2.projected_at, 'PJ-0', `deterministic: identical content_hash across runs (${P.content_hash.slice(0, 12)}), projected_at excluded`); }
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
  const c = project(readTree({ root: r2 }), { observed_against: 'x', projected_at: 't' });
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
  // Known, recorded exception: the F0 fixture included an ops lane whose record lives in docs/ops and whose thread bullet
  // carries no backticked id — outside FD-3's population by the founder's own ruling (docket PD-3), so the projector must NOT emit it.
  const KNOWN_OUTSIDE_POPULATION = ['WORKSTATION-STORAGE-RELIEF'];
  const missing = fixtureIds.filter((/** @type {string} */ id) => !liveIds.has(id) && !KNOWN_OUTSIDE_POPULATION.includes(id));
  const wronglyPresent = KNOWN_OUTSIDE_POPULATION.filter((id) => liveIds.has(id));
  check(missing.length === 0 && wronglyPresent.length === 0, 'PJ-9', `F0 fixture programme ids ⊆ live projection (${fixtureIds.length} checked; missing: ${missing.join(', ') || 'none'}; known-outside honoured: ${KNOWN_OUTSIDE_POPULATION.join(',')})`);
  const vm = /** @type {any} */ (liveReference()); vm.programme_state = live; const r = validateViewModel(vm, { mode: 'live' });
  check(r.ok, 'PJ-10', `real projection validates live (${live.programmes.length} programmes · ${live.population.unclassified.length} unclassified · complete=${live.population.complete})`);
  check(live.population.complete === false, 'PJ-2', 'real repository is NOT complete (unclassified subjects exist) and says why');
}
// ── defeat candidates ──
for (const c of CANDIDATES) {
  const p = project(tree, { observed_against: 'sha-test', projected_at: 't0', decisions: c.decisions });
  let dead = false, why = '';
  switch (c.kills) {
    case 'PJ-3': dead = byId(p, 'ALPHA-01').thread.overrides === true; why = 'thread claims override'; break;
    case 'PJ-4': dead = byId(p, 'ALPHA-01').precedence.tier !== 1; why = `governing tier ${byId(p, 'ALPHA-01').precedence.tier}`; break;
    case 'PJ-5': dead = byId(p, 'BETA-02').evidence_state !== 'UNVERIFIED / CONFLICT'; why = `BETA-02 → ${byId(p, 'BETA-02').standing}`; break;
    case 'PJ-6': dead = !p.population.unclassified.some((u) => u.kind === 'file'); why = `unclassified files ${p.population.unclassified.filter((u) => u.kind === 'file').length}`; break;
    case 'PJ-1': dead = byId(p, 'ALPHA-01').standing !== byId(P, 'ALPHA-01').standing; why = `"${byId(p, 'ALPHA-01').standing}"`; break;
    case 'PJ-2': dead = p.population.complete === true; why = `complete=${p.population.complete} with ${p.population.unclassified.length} unclassified`; break;
  }
  check(dead, c.id, `→ ${c.kills} (${c.belief}) ${dead ? 'DIES' : 'SURVIVES'}: ${why}`);
}
rmSync(root, { recursive: true, force: true });
console.log(failures === 0 ? '\nB4 MATRIX: ALL LAWS HOLD · CANDIDATES DEAD (exit 0)' : `\nB4 MATRIX: ${failures} failure(s) (exit 1)`);
process.exit(failures === 0 ? 0 : 1);
