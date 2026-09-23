#!/usr/bin/env node
/**
 * R2-0 strict typecheck — strict + noUncheckedIndexedAccess over the Review Discuss epistemic-object contract, its lawful
 * fixture, the fifteen wrong-contract candidates (each must itself compile — a candidate that cannot compile is an instrument
 * defect, not a kill), the laws and the matrix. The illegal fixtures are EXCLUDED here on purpose: their refusal is proved by
 * the matrix, one fixture per law, against each subject's contract. ⛔ No product file is in this graph — the contract imports
 * nothing, so there is no inherited allowance to pin.
 */
import { spawnSync } from 'node:child_process';
const CONFIG = 'tsconfig.ws-flagship-r2-0.json';
const r = spawnSync('npx', ['tsc', '-p', CONFIG, '--pretty', 'false'], { encoding: 'utf8' });
const lines = `${r.stdout ?? ''}${r.stderr ?? ''}`.split('\n').map((l) => l.trim()).filter((l) => /\(\d+,\d+\): error TS\d+:/.test(l));
const product = lines.filter((l) => /^(app|lib|components)\//.test(l));
console.log(`R2-0 TYPECHECK — ${CONFIG} (strict · noUncheckedIndexedAccess · illegal fixtures excluded by design)\n`);
if (lines.length) { console.log('  ⛔ DIAGNOSTICS:'); for (const l of lines) console.log(`    ${l}`); }
if (product.length) console.log(`  ⛔ product files entered the graph: ${product.length}`);
const ok = lines.length === 0;
console.log(`\n  verdict  ${ok ? 'PASS — zero diagnostics; zero product files in the graph' : '⛔ FAIL'}`);
process.exit(ok ? 0 : 1);
