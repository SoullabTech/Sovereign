// A1-LS1 · mutant runner (packet §6 "deliberately broken repairs").
// For each mutant: restore the mutant tree to the candidate bytes, apply its
// exact-match edit(s) in order (each must match exactly once, else
// INSTRUMENT_FAILURE — a mutant is one wrong idea, sometimes needing more than
// one line to express), let the
// dev server serving the mutant tree recompile, run ONLY the targeted law, and
// record: KILLED (law not GREEN) · SURVIVED (law GREEN — the instrument failed
// to discriminate) · INCONCLUSIVE (the law could not be observed).
// Usage: node ls1-e1-mutants.mjs <cand_root> <mutant_root> <mutant_base_url> <identity.env> <mutants.json> <acceptance.mjs> <out_dir> [ids,...]
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const [CAND, MUT, BASE, IDENT, SPEC, ACC, OUT, IDS] = process.argv.slice(2);
const mutants = JSON.parse(fs.readFileSync(SPEC, 'utf8')).filter((m) => !IDS || IDS.split(',').includes(m.id));
fs.mkdirSync(OUT, { recursive: true });
const editsOf = (m) => m.edits ?? [{ file: m.file, find: m.find, replace: m.replace }];
const touched = [...new Set(JSON.parse(fs.readFileSync(SPEC, 'utf8')).flatMap((m) => editsOf(m).map((e) => e.file)))];
const restoreAll = () => { for (const f of touched) fs.copyFileSync(path.join(CAND, f), path.join(MUT, f)); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [];
for (const m of mutants) {
  restoreAll();
  let bad = null;
  for (const [i, e] of editsOf(m).entries()) {
    const target = path.join(MUT, e.file);
    const src = fs.readFileSync(target, 'utf8');
    const hits = src.split(e.find).length - 1;
    if (hits !== 1) { bad = `edit ${i} find matched ${hits} times`; break; }
    fs.writeFileSync(target, src.replace(e.find, e.replace));
  }
  if (bad) { restoreAll(); results.push({ id: m.id, law: m.law, verdict: 'INSTRUMENT_FAILURE', basis: bad }); process.stdout.write(`${m.id}: INSTRUMENT_FAILURE ${bad}\n`); continue; }
  await sleep(4000);
  const out = path.join(OUT, `${m.id}.json`);
  try {
    execFileSync('node', [ACC, MUT, BASE, IDENT, out, m.id, `only=${m.law}`], { stdio: 'pipe', timeout: 900_000 });
  } catch { /* the acceptance file records its own outcome */ }
  let law = null;
  try { law = JSON.parse(fs.readFileSync(out, 'utf8')).laws[m.law]; } catch { /* none */ }
  const verdict = !law ? 'INCONCLUSIVE' : law.outcome === 'GREEN' ? 'SURVIVED' : law.outcome === 'RED' ? 'KILLED' : 'INCONCLUSIVE';
  results.push({ id: m.id, law: m.law, wrong: m.wrong, verdict, failedChecks: law?.failedChecks ?? null, basis: law?.basis ?? null });
  process.stdout.write(`${m.id}: ${verdict}${law?.failedChecks?.length ? ' [' + law.failedChecks.join(',') + ']' : ''}\n`);
}
restoreAll();
fs.writeFileSync(path.join(OUT, 'mutants.json'), JSON.stringify(results, null, 2));
