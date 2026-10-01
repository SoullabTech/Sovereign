#!/usr/bin/env node
/**
 * O5-R3 runtime binding witness — READ-ONLY reader for the admission walk.
 *
 * Founder ruling (2026-10-01): the verdict has two tiers, never mixed.
 *
 *   CONSTITUTIONAL EVIDENCE (decides the verdict)
 *     C1  binding record LIVE, incarnation-correct (host + pid + process start time)
 *     C2  checkout identity: mode A, source root = bound root, record HEAD = HEAD now
 *     C3  required ancestor present (HEAD ⊇ --base, default ce061073)
 *     C4  checkout clean (in the record and now)
 *     C5  working-tree hashes of the four R3 stores = the recorded hashes
 *     C6A AUTHORIZED TRANSITION INTEGRITY (amendment RB-A2, 2026-10-01): from the saved pre-write
 *         baseline (--prewrite) to now, exactly one new lease generation held by this incarnation,
 *         lease history unchanged, grant ledgers append-only with prior bytes unchanged, at most one
 *         Work Unit ledger changed, no other governed artifact changed. Scope: the governed roots only.
 *     C6  lease HELD_BY_THIS_DESKTOP: (binding.pid, binding.processStartedAt) == (lease.pid, lease.process_start_time)
 *         --phase pre-write (amendment 2026-10-01): C6 asks instead that NO LIVE WRITER holds authority
 *         (NOT_YET_HELD or NOT_YET_HELD_AFTER_RELEASE). Lease history may exist; only the latest
 *         generation decides. A pre-write verdict is a baseline, never admission, and it may not
 *         carry --refusal / --before.
 *     C7  second writer refused GRANT_WRITER_LEASE_UNAVAILABLE by this same Desktop incarnation,
 *         at the current lease generation                                      (needs --refusal)
 *     C8  grant ledgers + lease byte-identical across the refused attempt     (needs --before)
 *
 *   SUPPORTING OPERATIONAL CENSUS (can raise an alarm; can neither grant nor defeat admission)
 *     S1  no other visible process names a grant-writer entry point (command-line heuristic)
 *
 * It writes nothing in the delegation home and confers nothing: the binding record grants no
 * authority, and neither does this verdict. `--snapshot <file>` writes a hash snapshot to a
 * file of the operator's choosing (keep it OUTSIDE the delegation home).
 *
 *   node scripts/witness/o5-r3-runtime-witness.mjs --phase pre-write     baseline before the first grant write
 *   node scripts/witness/o5-r3-runtime-witness.mjs                       C1–C6 post-write (C6 strict)
 *   node scripts/witness/o5-r3-runtime-witness.mjs --snapshot <file>     also write the ledger+lease hash snapshot
 *   node scripts/witness/o5-r3-runtime-witness.mjs --refusal <json> --before <snapshot>   the full C1–C8 verdict
 *   options: --support <appSupportDir>  --base <sha>  --await-current-ms <ms>  --json <file> (write the full evidence object)
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const require = createRequire(import.meta.url);
const RB = require(path.join(ROOT, 'jarvis-desktop/src/runtime-binding.js'));
const LEASE = await import(pathToFileURL(path.join(ROOT, 'scripts/builder/grant-writer-lease-v1.mjs')).href);
const STAND = await import(pathToFileURL(path.join(ROOT, 'scripts/witness/o5-r3-lease-standing.mjs')).href);
const TI = await import(pathToFileURL(path.join(ROOT, 'scripts/witness/o5-r3-transition-integrity.mjs')).href);
const READY = await import(pathToFileURL(path.join(ROOT, 'scripts/witness/o5-r3-binding-readiness.mjs')).href);

const args = process.argv.slice(2);
const val = (f) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : undefined; };
const support = val('--support') || path.join(os.homedir(), 'Library', 'Application Support');
const base = val('--base') || 'ce061073';
const phase = val('--phase') || 'post-write';
const awaitCurrentMs = Number(val('--await-current-ms') || 0);
if (!Number.isFinite(awaitCurrentMs) || awaitCurrentMs < 0) { process.stderr.write('invalid --await-current-ms\n'); process.exit(1); }
if (!['pre-write', 'post-write'].includes(phase)) { process.stderr.write(`unknown --phase ${phase}\n`); process.exit(1); }
if (phase === 'pre-write' && (val('--refusal') || val('--before') || val('--prewrite'))) {
  process.stderr.write('a pre-write baseline cannot carry admission evidence (--refusal / --before / --prewrite); run them post-write\n');
  process.exit(1);
}
const git = (root, ...a) => { try { return execFileSync('git', ['-C', root, ...a], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch { return null; } };
const sha = (buf) => 'sha256:' + crypto.createHash('sha256').update(buf).digest('hex');

const constitutional = [];
const C = (id, name, ok, detail, pending = false) => constitutional.push({ id, name, status: pending ? 'PENDING' : ok ? 'PASS' : 'FAIL', detail });

/** Every file in the grant authority domain + the lease, hashed. Read-only. */
function snapshotGrantState(home) {
  const roots = [path.join(home, 'work-units-v2', 'execution-grants'), path.join(home, 'execution-grants'), path.join(home, LEASE.LEASE_DIR)];
  const files = {};
  const walk = (dir) => { let ents = []; try { ents = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; } for (const e of ents) { const p = path.join(dir, e.name); if (e.isDirectory()) walk(p); else if (e.isFile()) files[path.relative(home, p)] = sha(fs.readFileSync(p)); } };
  for (const r of roots) walk(r);
  // `files` is C8's byte-identity view (unchanged); `governed` is C6A's size+hash view of the governed roots.
  return { home, taken_at: new Date().toISOString(), files: Object.fromEntries(Object.entries(files).sort()), governed: TI.captureGoverned(home) };
}

const expectedHead = git(ROOT, 'rev-parse', 'HEAD');
let rec = null;
let live = 'UNREADABLE';
let readiness = { ready: false, reason: 'NOT_SAMPLED' };
const deadline = Date.now() + awaitCurrentMs;
do {
  rec = RB.readRecord(RB.bindingPath(support));
  live = rec ? RB.judgeLive(rec) : 'UNREADABLE';
  readiness = READY.classifyBindingReadiness({ record: rec, live, expectedRoot: ROOT, expectedHead });
  if (readiness.ready || awaitCurrentMs === 0 || Date.now() >= deadline) break;
  await READY.sleep(250);
} while (true);
C('C1', 'binding record LIVE and incarnation-correct', live === 'LIVE' && (awaitCurrentMs === 0 || readiness.ready),
  `${live} · pid ${rec?.pid} · start ${rec?.processStartedAt}${awaitCurrentMs > 0 ? ` · readiness ${readiness.reason}` : ''}`);

const root = rec?.binding?.repoRoot ?? null;
const headNow = root ? git(root, 'rev-parse', 'HEAD') : null;
const modeA = rec?.app?.mode === 'development' && rec?.app?.sourceRoot === root && rec?.binding?.selectionSource === 'dev-walk'
  && (!rec?.env?.JARVIS_REPO_ROOT || rec.env.JARVIS_REPO_ROOT === root);
C('C2', 'checkout identity: mode A (source = bound, dev-walk, no foreign override) and record HEAD = HEAD now',
  modeA && headNow && headNow === rec?.binding?.head, `${rec?.app?.mode} · ${rec?.binding?.selectionSource} · ${root} @ ${rec?.binding?.head} (now ${headNow})`);
C('C3', `required ancestor ${base} present`, !!root && git(root, 'merge-base', '--is-ancestor', base, 'HEAD') !== null, `${base} ⊆ ${headNow}`);
const porcelain = root ? git(root, 'status', '--porcelain') : null;
C('C4', 'checkout clean (record and now)', rec?.binding?.clean === true && porcelain === '', `record clean=${rec?.binding?.clean} · now ${porcelain === '' ? 'clean' : 'DIRTY'}`);
const storeNow = {};
for (const rel of RB.STORE_FILES) { try { storeNow[rel] = sha(fs.readFileSync(path.join(root, rel))); } catch { storeNow[rel] = null; } }
const storesOk = !!root && RB.STORE_FILES.every((rel) => storeNow[rel] && rec?.stores?.[rel] === storeNow[rel]);
C('C5', 'working-tree hashes of the four R3 stores = recorded hashes', storesOk, RB.STORE_FILES.map((r) => `${path.basename(r)} ${rec?.stores?.[r] === storeNow[r] && storeNow[r] ? '=' : '≠'}`).join(' · '));

const home = rec?.delegationHome ?? null;
const lease = home ? LEASE.readLeaseState(home) : { generation: 0, record: null };
const lr = lease.record;
const bindingPair = { pid: rec?.pid ?? null, processStartTime: rec?.processStartedAt ?? null, host: rec?.host ?? null };
const leasePair = lr && !lr.released ? { pid: lr.pid, processStartTime: lr.process_start_time, host: lr.host, generation: lease.generation } : null;
const pairEqual = !!leasePair && leasePair.host === bindingPair.host && leasePair.pid === bindingPair.pid && leasePair.processStartTime === bindingPair.processStartTime;
let transition = null;
const standing = home ? STAND.classifyLeaseStanding(STAND.readLeaseHistory(home), bindingPair) : { standing: 'MALFORMED', generation: 0, detail: 'no delegation home in the record' };
if (phase === 'pre-write') {
  C('C6-pre', 'no live writer holds grant authority before the first write (history may exist; latest generation decides)',
    STAND.PRE_WRITE_ACCEPTABLE.includes(standing.standing), `${standing.standing} · ${standing.detail}`);
} else {
  // C6A: the authorized transition itself, judged against the saved pre-write baseline.
  const prewriteFile = val('--prewrite');
  let prewrite = null;
  if (prewriteFile) { try { prewrite = JSON.parse(fs.readFileSync(prewriteFile, 'utf8')); } catch { prewrite = null; } }
  const ti = prewrite?.governed && home ? TI.judgeTransition(prewrite.governed, home, bindingPair) : null;
  transition = ti;
  C('C6A', 'authorized transition integrity: pre-write baseline → now, one lawful acquisition and one append-only ledger change, nothing else governed',
    !!ti && ti.ok,
    !prewriteFile ? 'needs --prewrite <pre-write snapshot>'
      : !prewrite ? 'pre-write snapshot unreadable'
      : !prewrite.governed ? 'pre-write snapshot has no governed capture (taken by an older checker)'
      : ti.ok ? `generation ${ti.summary.new_generation} acquired · ledgers changed: ${ti.summary.changed_ledgers.join(', ') || 'none'}`
      : ti.violations.map((x) => `${x.rule} ${x.detail}`).join(' · '),
    !prewriteFile);
  // Strict: the standing AND the field-for-field pair must both name this Desktop.
  C('C6', 'lease HELD_BY_THIS_DESKTOP: (binding.pid, binding.processStartTime) == (lease.pid, lease.processStartTime)',
    pairEqual && STAND.POST_WRITE_ACCEPTABLE.includes(standing.standing),
    lease.unreadable ? 'LEASE RECORD UNREADABLE' : `${standing.standing} · ${standing.detail}`);
}

const refusalFile = val('--refusal');
let refusal = null;
if (refusalFile) { try { refusal = JSON.parse(fs.readFileSync(refusalFile, 'utf8')); } catch { refusal = { unreadable: true }; } }
const refusalOk = !!refusal && refusal.ok === false && refusal.refused === 'GRANT_WRITER_LEASE_UNAVAILABLE' && refusal.lease_reason === 'HOME_LEASE_HELD'
  && refusal.holder?.pid === bindingPair.pid && refusal.holder?.process_start_time === bindingPair.processStartTime && refusal.holder?.host === bindingPair.host
  && refusal.lease_generation === lease.generation;
if (phase === 'post-write') C('C7', 'second writer refused by THIS Desktop incarnation at the current lease generation', refusalOk,
  refusal ? `${refusal.refused ?? refusal.status ?? '?'} · ${refusal.lease_reason ?? '?'} · holder ${refusal.holder?.pid}/${refusal.holder?.process_start_time} · generation ${refusal.lease_generation} (lease now ${lease.generation})` : 'needs --refusal <file>', !refusalFile);

const beforeFile = val('--before');
const now = home ? snapshotGrantState(home) : null;
let before = null;
if (beforeFile) { try { before = JSON.parse(fs.readFileSync(beforeFile, 'utf8')); } catch { before = null; } }
const identical = !!before && !!now && JSON.stringify(before.files) === JSON.stringify(now.files);
const changed = before && now ? [...new Set([...Object.keys(before.files), ...Object.keys(now.files)])].filter((k) => before.files[k] !== now.files[k]) : [];
if (phase === 'post-write') C('C8', 'grant ledgers + lease byte-identical across the refused attempt', identical,
  before ? (identical ? `${Object.keys(now.files).length} files unchanged` : `CHANGED: ${changed.join(', ')}`) : 'needs --before <snapshot>', !beforeFile);

const snapshotOut = val('--snapshot');
if (snapshotOut && now) fs.writeFileSync(snapshotOut, JSON.stringify(now, null, 2) + '\n');

// ── Supporting operational census (heuristic; outside the verdict) ─────────────
const patterns = /(work-unit-control|o5-recovery-census|o5-path-b-recovery|canonical-provider-execution-grant|human-provider-execution-grant|grant-writer-lease|grant-ledger-core)/;
let others = [];
try {
  others = execFileSync('ps', ['-axo', 'pid=,lstart=,command='], { encoding: 'utf8' }).split('\n')
    .filter((l) => patterns.test(l) && !/o5-r3-runtime-witness\.mjs/.test(l)).map((l) => l.trim().slice(0, 200))
    .filter((l) => { const pid = Number(l.split(/\s+/)[0]); return pid !== process.pid && pid !== rec?.pid; });
} catch { others = ['<ps unavailable>']; }
const census = { id: 'S1', name: 'no other visible process names a grant-writer entry point (heuristic)', status: others.length ? 'ALARM' : 'QUIET', detail: others };

const evidence = {
  witnessed_at: new Date().toISOString(), phase, base, readiness, record: rec, lease_standing: standing, transition,
  identities: { binding: { ...bindingPair, repoRoot: root, head: rec?.binding?.head ?? null }, lease: leasePair },
  refusal, snapshot_before: before, snapshot_now: now, constitutional, supporting: [census],
};
const jsonOut = val('--json');
if (jsonOut) fs.writeFileSync(jsonOut, JSON.stringify(evidence, null, 2) + '\n');

const out = (s) => process.stdout.write(s + '\n');
out('O5-R3 runtime binding witness · the record grants no authority; this verdict grants none either\n');
if (awaitCurrentMs > 0) out(`readiness         ${readiness.ready ? 'READY' : 'TIMEOUT'} · ${readiness.reason} · waited up to ${awaitCurrentMs}ms`);
out(`binding identity  pid ${bindingPair.pid} · start ${bindingPair.processStartTime} · ${root} @ ${rec?.binding?.head}`);
out(`lease identity    ${leasePair ? `pid ${leasePair.pid} · start ${leasePair.processStartTime} · generation ${leasePair.generation}` : '(none held)'}\n`);
out('CONSTITUTIONAL EVIDENCE');
for (const c of constitutional) out(`  ${c.status.padEnd(7)} ${c.id} ${c.name}\n          ${c.detail}`);
out('\nSUPPORTING OPERATIONAL CENSUS (cannot grant or defeat admission)');
out(`  ${census.status.padEnd(7)} ${census.id} ${census.name}${others.length ? '\n          ' + others.join('\n          ') : ''}`);
const failed = constitutional.filter((c) => c.status === 'FAIL');
const pending = constitutional.filter((c) => c.status === 'PENDING');
const verdict = failed.length ? `${phase === 'pre-write' ? 'PRE-WRITE BASELINE' : 'CONSTITUTIONAL'} FAIL (${failed.map((c) => c.id).join(', ')})`
  : phase === 'pre-write' ? 'PRE-WRITE BASELINE PASS — C1–C5 + C6-pre (a baseline, not admission)'
  : pending.length ? `CONSTITUTIONAL PARTIAL — ${pending.map((c) => c.id).join(', ')} pending`
  : 'CONSTITUTIONAL PASS — C1–C8 + C6A witnessed';
out(`\n${verdict}${census.status === 'ALARM' ? ' · ⚠ census ALARM: answer it before admission, but it is not the verdict' : ''}`);
process.exit(failed.length ? 1 : pending.length ? 2 : 0);
