#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SF_FALSIFIERS, runScenario, R } from './falsifiers.mjs';
import { SF_CANDIDATES } from './candidates.mjs';

let bad = 0;
const out = (s) => process.stdout.write(s + '\n');

function matches(got, expect) {
  if (got.root !== expect.root) return false;
  if (got.resolution !== expect.resolution) return false;
  if ('suggested' in expect && (got.suggestedRepoRoot ?? null) !== expect.suggested) return false;
  if (expect.problem && !expect.problem.test(String(got.configProblem || ''))) return false;
  return true;
}

out('O5-R3A9 · Silent Repository Fallback · matrix');
out('implicit candidate may be suggested; it may never become authority-bearing currentRoot()');

for (const [id, f] of Object.entries(SF_FALSIFIERS)) {
  const got = runScenario(f);
  const ok = matches(got, f.expect);
  out(`  ${id} ${f.name} real ${ok ? 'PASS' : 'FAIL'}`);
  if (!ok) {
    out('        got ' + JSON.stringify(got));
    bad += 1;
  }
}

for (const [id, c] of Object.entries(SF_CANDIDATES)) {
  const f = SF_FALSIFIERS[c.kills];
  const got = c.run(f);
  const survives = matches(got, f.expect);
  out(`  ${id} → ${survives ? 'SURVIVED' : 'KILLED'} on ${c.kills} ${f.name}`);
  out('        ' + c.name);
  if (survives) bad += 1;
}

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const main = fs.readFileSync(path.join(ROOT, 'jarvis-desktop/src/main.js'), 'utf8');
const resolution = fs.readFileSync(path.join(ROOT, 'jarvis-desktop/src/repo-resolution.js'), 'utf8');
const preferences = fs.readFileSync(path.join(ROOT, 'jarvis-desktop/src/preferences.js'), 'utf8');

out('\nSF-W · Desktop wiring');
const checks = [
  ['SF-W1 packaged resolver delegates to pure no-fallback resolver',
    main.includes('return resolvePackagedMode({')],
  ['SF-W2 historical default appears only as defaultCandidate, not returned root',
    main.includes("defaultCandidate: '/Users/soullab/MAIA-SOVEREIGN'")
      && !main.includes("return { root: '/Users/soullab/MAIA-SOVEREIGN'")],
  ['SF-W3 unbound state carries suggestion separately',
    main.includes('suggested_repo_root: RESOLVED.suggestedRepoRoot || null')],
  ['SF-W4 first-run refusal keeps JARVIS unbound',
    main.includes("buttons: ['Choose Repository…', 'Continue Unbound']")
      && main.includes('if (currentRoot()) return;')],
  ['SF-W5 chooser can start at suggestion but binding still passes bindRepoRoot',
    main.includes("defaultPath: currentRoot() || RESOLVED.suggestedRepoRoot || app.getPath('home')")
      && main.includes("const out = bindRepoRoot(res.filePaths[0], 'preferences')")],
  ['SF-W6 dev resolver uses same explicit ladder after walk failure',
    main.includes('ladder: findRepoRootPackagedMode')],
  ['SF-W7 canonical Work Unit authority path refuses when currentRoot is null',
    main.includes("status: 'NO_SUBSTRATE'") && main.includes("reason: 'No execution substrate is bound.'")],
  ['SF-W8 governed run-work-unit path also refuses when currentRoot is null',
    main.includes("outcome: 'MECHANISM_UNAVAILABLE'")
      && main.includes("reason: 'no execution substrate is bound — bind a repository before submitting work units'")],
  ['SF-W9 Preferences renders suggestion separately from active repository',
    preferences.includes("row('Suggested repository', state.suggested_repo_root)")
      && preferences.includes('Suggestion only — JARVIS remains unbound until you choose a repository explicitly.')],
  ['SF-W10 pure resolver exports packaged and dev decisions',
    resolution.includes('module.exports = { resolvePackagedMode, resolveDevMode }')],
];

for (const [name, ok] of checks) {
  out(`  ${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) bad += 1;
}

if (bad) {
  out(`\nMATRIX FAILED · ${bad} defect(s)`);
  process.exit(1);
}
out('\nMATRIX LETHAL + DISCRIMINATING · WIRING INTACT');
