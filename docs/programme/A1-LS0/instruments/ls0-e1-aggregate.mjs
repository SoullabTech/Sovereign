// A1-LS0 · flag-matrix aggregation.
// For every scenario: the outcome under each configuration; which flags GOVERN
// it (a single-flag-ON configuration, or all-ON, whose outcome differs from
// all-OFF); and, separately, observation-level variance (volatile ids
// normalised). Observation variance is reported, never promoted to governance.
// The scenario's reported outcome is the all-OFF outcome when every
// configuration agrees; if configurations disagree the scenario is reported as
// FLAG-DEPENDENT with every per-configuration outcome.
// Usage: node ls0-e1-aggregate.mjs <matrix_dir> <out.json>
import fs from 'node:fs';
import path from 'node:path';

const [DIR, OUT] = process.argv.slice(2);
const configs = fs.readdirSync(DIR).filter((d) => /^C\d-/.test(d)).sort();
const load = (c) => JSON.parse(fs.readFileSync(path.join(DIR, c, 'results.json'), 'utf8'));
const runs = Object.fromEntries(configs.map((c) => [c, load(c)]));
const manifests = Object.fromEntries(configs.map((c) => [c, JSON.parse(fs.readFileSync(path.join(DIR, c, 'schema-manifest.json'), 'utf8'))]));
const norm = (o) => JSON.stringify(o ?? null).replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g, '<id>');
const scenarios = Object.keys(runs[configs[0]].scenarios);
const base = configs[0];
const out = { configs, scenarios: {}, migrationSufficiency: {} };
for (const s of scenarios) {
  const per = Object.fromEntries(configs.map((c) => [c, runs[c].scenarios[s]?.outcome ?? 'MISSING']));
  const governing = configs.filter((c) => c !== base && per[c] !== per[base]);
  const variance = configs.filter((c) => c !== base && norm(runs[c].scenarios[s]?.obs) !== norm(runs[base].scenarios[s]?.obs));
  const agree = governing.length === 0;
  out.scenarios[s] = {
    outcome: agree ? per[base] : 'FLAG-DEPENDENT',
    perConfig: per,
    flagsGoverningOutcome: governing,
    observationVarianceVsAllOff: variance,
    basisAllOff: runs[base].scenarios[s]?.basis ?? null,
    obsAllOff: runs[base].scenarios[s]?.obs ?? null,
  };
}
for (const c of configs) {
  const m = manifests[c];
  out.migrationSufficiency[c] = { applied: m.appliedCount, refused: m.refusedCount, verdict: m.verdict, runtimeDependent: m.runtimeDependentRefusedMigrations };
  const errs = fs.readFileSync(path.join(DIR, c, 'pg-errors-during-run.txt'), 'utf8').trim();
  out.migrationSufficiency[c].pgErrorsDuringRun = errs ? errs.split('\n').length : 0;
}
fs.writeFileSync(OUT, JSON.stringify(out, null, 2));
for (const s of scenarios) console.log(`${s}: ${out.scenarios[s].outcome}  governing=[${out.scenarios[s].flagsGoverningOutcome}]  obsVariance=[${out.scenarios[s].observationVarianceVsAllOff}]`);
for (const c of configs) console.log(`${c}: migrations ${out.migrationSufficiency[c].verdict} · pgErrors=${out.migrationSufficiency[c].pgErrorsDuringRun}`);
