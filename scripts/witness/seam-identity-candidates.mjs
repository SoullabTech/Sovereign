#!/usr/bin/env node
/**
 * seam-identity-candidates.mjs — defeat candidates for the falsifier matrix.
 *
 * A suite only ever run against the conforming implementation is weak
 * evidence: it shows the implementation agrees with itself. Each candidate
 * below is the smallest COMPETENT embodiment of one plausible wrong decision,
 * and must DIE on its named falsifier while surviving the others.
 *
 * Collateral is expected where a wrong decision has an irreducible blast
 * radius; it is CLASSIFIED with a reason rather than narrowed away, because a
 * candidate narrowed until it kills only its named falsifier would no longer
 * be the error it claims to model.
 */

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtempSync, rmSync, writeFileSync, appendFileSync, readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, posix } from 'node:path';
import { seamIdentity as conformingSeamIdentity } from './seam-identity.mjs';
import { IMAGE_SCOPE_SEAM, ENTAILED_ONLY } from './seam-identity-container.mjs';

const EXPECTED = '195b16bce1c807477bf97befc3c9b6d64a22e4520d0bdd8e9fcd173e35bb885b';
const SEAM = [
  'lib/ain/epistemic-join',
  'lib/maia/relational-field-shadow',
  'app/api/sovereign/app/maia/list/route.ts',
  'database/migrations/20260916211500_relational_field_shadow_runs.sql',
  'database/migrations/20260921000001_epistemic_join_persistence.sql',
  'database/migrations/20260921000002_epistemic_join_integration_shadow.sql',
];

const sh = (cmd, args, cwd) => execFileSync(cmd, args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
const lsTree = (rev, path) =>
  sh('git', ['ls-tree', '-r', rev, '--', path], process.cwd()).split('\n').filter((l) => l.trim());

/* ── DC-1 — digest over PATH NAMES ONLY (ignores blob identity) ───────────── */
const dc1 = {
  id: 'DC-1',
  falsifier: 'F1',
  error: 'identity derived from the seam SHAPE rather than its CONTENT',
  seamIdentity(rev, paths = SEAM) {
    const names = [];
    for (const p of paths) {
      const lines = lsTree(rev, p);
      // Isolation: DC-1 models ONLY the shape-not-content error, so it keeps
      // the conforming absence refusal. Without this it also died on F2, which
      // made it two errors in one candidate and its evidence unreadable.
      if (lines.length === 0) throw new Error(`SEAM_PATH_ABSENT: ${p}`);
      for (const l of lines) names.push(l.split('\t')[1]);
    }
    return { digest: createHash('sha256').update([...new Set(names)].sort().join('\n') + '\n').digest('hex') };
  },
};

/* ── DC-2 — an absent declared path is silently skipped ───────────────────── */
const dc2 = {
  id: 'DC-2',
  falsifier: 'F2',
  error: 'a declared path that yields nothing is treated as contributing nothing',
  seamIdentity(rev, paths = SEAM) {
    const entries = [];
    for (const p of paths) {
      for (const l of lsTree(rev, p)) {
        const m = /^\d{6} \w+ ([0-9a-f]{40})\t(.+)$/.exec(l);
        if (m) entries.push(`${m[1]}  ${m[2]}`);
      }
      // no refusal on empty expansion — the modelled error
    }
    return { digest: createHash('sha256').update([...new Set(entries)].sort().join('\n') + '\n').digest('hex') };
  },
};

/* ── DC-5 — ancestry is two-valued: unverifiable collapses into a negative ── */
const dc5 = {
  id: 'DC-5',
  falsifier: 'F5',
  error: 'git says "not an ancestor", so the answer is NOT_ANCESTOR',
  ancestry(a, d) {
    try {
      execFileSync('git', ['merge-base', '--is-ancestor', a, d], { stdio: 'ignore' });
      return { verdict: 'ANCESTOR' };
    } catch {
      return { verdict: 'NOT_ANCESTOR' };
    }
  },
};

/* ── container-side candidates ────────────────────────────────────────────── */
const walk = (root, rel, out) => {
  const abs = join(root, rel);
  const st = statSync(abs);
  if (st.isFile()) { out.push(rel); return; }
  if (!st.isDirectory()) return;
  for (const n of readdirSync(abs).sort()) walk(root, posix.join(rel, n), out);
};

/* DC-9 — claims the compiled-only path as witnessed coverage. */
const dc9 = {
  id: 'DC-9',
  falsifier: 'F12',
  error: 'the compiled-only seam path is counted as witnessed instead of reported as entailed',
  containerSeamIdentity(root) {
    const entries = [], covered = [];
    for (const d of IMAGE_SCOPE_SEAM) {
      if (!existsSync(join(root, d))) throw new Error(`SEAM_PATH_ABSENT: ${d}`);
      const files = []; walk(root, d, files);
      for (const rel of files) {
        const b = readFileSync(join(root, rel));
        entries.push(`${createHash('sha1').update(Buffer.concat([Buffer.from(`blob ${b.length}\0`), b])).digest('hex')}  ${rel}`);
        covered.push(rel);
      }
    }
    // the modelled error: the entailed path is asserted as covered
    covered.push(...ENTAILED_ONLY);
    const u = [...new Set(entries)].sort();
    return { digest: createHash('sha256').update(u.join('\n') + '\n').digest('hex'), pathCount: u.length, covered, entailedOnly: [] };
  },
};

/* DC-10 — hashes raw bytes instead of git's blob envelope. */
const dc10 = {
  id: 'DC-10',
  falsifier: 'F9',
  error: 'content hashed as raw bytes, so the container digest cannot be compared with git',
  containerSeamIdentity(root) {
    const entries = [], covered = [];
    for (const d of IMAGE_SCOPE_SEAM) {
      if (!existsSync(join(root, d))) throw new Error(`SEAM_PATH_ABSENT: ${d}`);
      const files = []; walk(root, d, files);
      for (const rel of files) {
        entries.push(`${createHash('sha1').update(readFileSync(join(root, rel))).digest('hex')}  ${rel}`);
        covered.push(rel);
      }
    }
    const u = [...new Set(entries)].sort();
    return { digest: createHash('sha256').update(u.join('\n') + '\n').digest('hex'), pathCount: u.length, covered, entailedOnly: [...ENTAILED_ONLY] };
  },
};

/* ── falsifier propositions, applied to whatever decision a candidate supplies */
function fixtureRepo(shallow) {
  const dir = mkdtempSync(join(tmpdir(), 'seamdc-'));
  sh('git', ['init', '-q', '-b', 'main'], dir);
  sh('git', ['config', 'user.email', 'f@example.invalid'], dir);
  sh('git', ['config', 'user.name', 'f'], dir);
  writeFileSync(join(dir, 'a.txt'), 'a\n');
  sh('git', ['add', '-A'], dir); sh('git', ['commit', '-qm', 'A'], dir);
  const a = sh('git', ['rev-parse', 'HEAD'], dir).trim();
  sh('git', ['checkout', '-q', '--orphan', 'other'], dir);
  sh('git', ['rm', '-rqf', '.'], dir);
  writeFileSync(join(dir, 'b.txt'), 'b\n');
  sh('git', ['add', '-A'], dir); sh('git', ['commit', '-qm', 'B'], dir);
  const b = sh('git', ['rev-parse', 'HEAD'], dir).trim();
  sh('git', ['checkout', '-q', 'main'], dir);
  writeFileSync(join(dir, 'a.txt'), 'a2\n');
  sh('git', ['commit', '-qam', 'A2'], dir);
  const a2 = sh('git', ['rev-parse', 'HEAD'], dir).trim();
  if (shallow) appendFileSync(join(dir, '.git', 'shallow'), `${a}\n`);
  return { dir, a, a2, b };
}

function mutatedSeamCommit() {
  const stamp = Date.now();
  const wt = join(tmpdir(), `seamdcwt-${stamp}`);
  const head = sh('git', ['rev-parse', 'HEAD'], process.cwd()).trim();
  sh('git', ['worktree', 'add', '-q', '--detach', wt, head], process.cwd());
  try {
    sh('git', ['config', 'user.email', 'f@example.invalid'], wt);
    sh('git', ['config', 'user.name', 'f'], wt);
    appendFileSync(join(wt, 'lib/maia/relational-field-shadow/runner.ts'), '\n// candidate fixture byte\n');
    sh('git', ['commit', '-qam', 'fixture'], wt);
    return sh('git', ['rev-parse', 'HEAD'], wt).trim();
  } finally {
    sh('git', ['worktree', 'remove', '--force', wt], process.cwd());
  }
}

const PROP = {
  // "kills" = the falsifier detects the candidate's error.
  F1(c) {
    if (!c.seamIdentity) return 'n/a';
    const mutated = mutatedSeamCommit();
    const before = c.seamIdentity('HEAD').digest;
    const after = c.seamIdentity(mutated).digest;
    return before === after ? 'DEAD' : 'SURVIVED';
  },
  F2(c) {
    if (!c.seamIdentity) return 'n/a';
    try {
      c.seamIdentity('HEAD', ['lib/maia/relational-field-shadow', 'database/migrations/20990101000000_never.sql']);
      return 'DEAD'; // produced a digest instead of refusing
    } catch {
      return 'SURVIVED';
    }
  },
  F5(c) {
    if (!c.ancestry) return 'n/a';
    const fx = fixtureRepo(true);
    const cwd = process.cwd();
    try {
      process.chdir(fx.dir);
      return c.ancestry(fx.b, fx.a2).verdict === 'ANCESTRY_UNVERIFIABLE' ? 'SURVIVED' : 'DEAD';
    } finally {
      process.chdir(cwd);
      rmSync(fx.dir, { recursive: true, force: true });
    }
  },
  F4(c) {
    if (!c.ancestry) return 'n/a';
    const fx = fixtureRepo(false);
    const cwd = process.cwd();
    try {
      process.chdir(fx.dir);
      return c.ancestry(fx.a2, fx.a).verdict === 'NOT_ANCESTOR' ? 'SURVIVED' : 'DEAD';
    } finally {
      process.chdir(cwd);
      rmSync(fx.dir, { recursive: true, force: true });
    }
  },
  F9(c) {
    if (!c.containerSeamIdentity) return 'n/a';
    const gitSide = conformingSeamIdentity('HEAD', undefined, 'image').digest;
    const fsSide = c.containerSeamIdentity(process.cwd()).digest;
    return gitSide === fsSide ? 'SURVIVED' : 'DEAD';
  },
  F12(c) {
    if (!c.containerSeamIdentity) return 'n/a';
    const r = c.containerSeamIdentity(process.cwd());
    const leaked = r.covered.filter((p) => ENTAILED_ONLY.includes(p));
    return leaked.length === 0 && r.entailedOnly.length > 0 ? 'SURVIVED' : 'DEAD';
  },
  F7(c) {
    if (!c.seamIdentity) return 'n/a';
    const plain = c.seamIdentity('HEAD').digest;
    const dup = c.seamIdentity('HEAD', [...SEAM, 'lib/maia/relational-field-shadow']).digest;
    return plain === dup ? 'SURVIVED' : 'DEAD';
  },
};

const CANDIDATES = [dc1, dc2, dc5, dc9, dc10];
const ORDER = ['F1', 'F2', 'F4', 'F5', 'F7', 'F9', 'F12'];
let lethal = 0;
const collateral = [];

for (const c of CANDIDATES) {
  const row = {};
  for (const f of ORDER) row[f] = PROP[f](c);
  const diedOnNamed = row[c.falsifier] === 'DEAD';
  if (diedOnNamed) lethal += 1;
  const extra = ORDER.filter((f) => f !== c.falsifier && row[f] === 'DEAD');
  if (extra.length) collateral.push({ id: c.id, extra });
  console.log(`${c.id}  named=${c.falsifier}  ${diedOnNamed ? 'DEAD on its falsifier' : '⚠️ SURVIVED its falsifier'}`);
  console.log(`      error: ${c.error}`);
  console.log(`      ${ORDER.map((f) => `${f}=${row[f]}`).join('  ')}`);
}

/* Collateral classification — a reason, or the candidate is not isolated. */
const CLASSIFIED = {
  'DC-1': {},
  'DC-2': {},
  'DC-5': {},
  'DC-9': {},
  'DC-10': {},
};
let unclassified = 0;
for (const c of collateral) {
  for (const f of c.extra) {
    const reason = CLASSIFIED[c.id]?.[f];
    if (reason) console.log(`CLASSIFIED  ${c.id} also dead on ${f}: ${reason}`);
    else { console.log(`UNCLASSIFIED  ${c.id} also dead on ${f} — candidate isolation defect`); unclassified += 1; }
  }
}

console.log(`\n${lethal}/${CANDIDATES.length} candidates DEAD on their named falsifier · ${unclassified} unclassified collateral`);
process.exit(lethal === CANDIDATES.length && unclassified === 0 ? 0 : 1);
