#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
const CONFIG = 'tsconfig.ws-flagship-r2-1.json';
const r = spawnSync('npx', ['tsc', '-p', CONFIG, '--pretty', 'false'], { encoding: 'utf8' });
const raw = String(r.stdout || '') + String(r.stderr || '');
const lines = raw.split('\n').map((l) => l.trim()).filter((l) => /\(\d+,\d+\): error TS\d+:/.test(l));
const globalErrors = raw.split('\n').filter((l) => /^error TS\d+:/.test(l.trim()));
const product = lines.filter((l) => /^(app|lib|components)\//.test(l));
console.log('R2-1 TYPECHECK — ' + CONFIG + ' (strict · noUncheckedIndexedAccess · illegal fixtures excluded by design)\n');
if (globalErrors.length) { console.log('  ⛔ GLOBAL DIAGNOSTICS:'); for (const l of globalErrors) console.log('    ' + l); }
if (lines.length) { console.log('  ⛔ DIAGNOSTICS:'); for (const l of lines) console.log('    ' + l); }
if (product.length) console.log('  ⛔ product files entered the graph: ' + product.length);
const ok = globalErrors.length === 0 && lines.length === 0 && product.length === 0;
console.log('\n  verdict  ' + (ok ? 'PASS — zero diagnostics; zero product files in the graph' : '⛔ FAIL'));
process.exit(ok ? 0 : 1);
