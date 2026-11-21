#!/usr/bin/env node
/**
 * Journey ledger runner: node run.mjs --persona p1 --report <path.md>
 * Reads the stack's coordinates from the environment (set by run.sh). Exit 0 only if the ledger says the journey works.
 *   JL_BASE         http://localhost:<port>   (localhost, NOT 127.0.0.1: next dev blocks its dev resources from 127.0.0.1)
 *   JL_MODEL_LOG    path of the model stub's call log
 *   DATABASE_URL    the throwaway database (jl_*)
 *   JL_META_FILE    optional JSON: { key: value } lines to print in the report header (flags, schema fidelity, SHA)
 *   JL_MAX_TRIALS   cap on controls pressed (default 120); rows beyond it are NOT RUN, never silently dropped
 */
import fs from 'node:fs';
import path from 'node:path';
import { Ledger, runPersona } from './lib/ledger.mjs';

const args = process.argv.slice(2);
const flag = (name, dflt = null) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : dflt; };
const personaName = flag('--persona', 'p1');
const reportPath = flag('--report');
if (!reportPath) { console.error('REFUSED: --report <path.md> is required (the ledger is written there)'); process.exit(64); }
// The report is written into a directory that already exists. Nothing here creates one: a mistyped path must not scatter directories (or write at the filesystem root).
const reportDir = path.dirname(path.resolve(reportPath));
if (!fs.existsSync(reportDir) || !fs.statSync(reportDir).isDirectory() || (fs.existsSync(reportPath) && fs.statSync(reportPath).isDirectory())) {
  console.error(`REFUSED: the report's directory does not exist (${reportDir}); create it first, nothing was walked`); process.exit(64);
}

const PERSONAS = { p1: () => import('./personas/p1-first-timer.mjs') };
if (!PERSONAS[personaName]) { console.error(`unknown persona ${personaName}; known: ${Object.keys(PERSONAS).join(', ')}`); process.exit(64); }

for (const k of ['JL_BASE', 'JL_MODEL_LOG', 'DATABASE_URL']) {
  if (!process.env[k]) { console.error(`REFUSED: ${k} is not set (run through run.sh)`); process.exit(64); }
}
let meta = {};
if (process.env.JL_META_FILE) { try { meta = JSON.parse(fs.readFileSync(process.env.JL_META_FILE, 'utf8')); } catch (e) { console.error('could not read JL_META_FILE: ' + e.message); } }

const mod = await PERSONAS[personaName]();
const ledger = new Ledger({ journey: 'Writer’s Studio journey ledger (slice 1)', persona: mod.PERSONA, meta: { Date: new Date().toISOString(), ...meta } });
mod.plan(ledger);

const env = { base: process.env.JL_BASE, modelLog: process.env.JL_MODEL_LOG, databaseUrl: process.env.DATABASE_URL, maxTrials: Number(process.env.JL_MAX_TRIALS || 120) };
const rc = await runPersona(ledger, (L) => mod.walk(L, env), {
  writeReport: (md) => { fs.writeFileSync(reportPath, md); },
});
const v = ledger.verdict();
console.log(`\nLEDGER ${ledger.persona}: ${v.works ? 'works' : 'does NOT work'} (${v.reason}); report: ${reportPath}`);
for (const r of ledger.rows) console.log(`${r.status.padEnd(8)} ${r.id.padEnd(16)} ${r.title}`);
process.exit(rc);
