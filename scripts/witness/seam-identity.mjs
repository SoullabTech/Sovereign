#!/usr/bin/env node
/**
 * seam-identity.mjs — JARVIS-KP-01 / I5 readiness substrate instrument
 *
 * WHAT IT IS
 *   A read-only instrument that computes a stable identity digest over the
 *   NAMED runtime seam the I5 readiness act depends on, and evaluates the
 *   property-based binding proposed in
 *   docs/programme/JARVIS-KP-01_I5-P0R1_ANCHOR_DRIFT_DISPOSITION_2026-09-21.md §3a.
 *
 * WHAT IT IS NOT
 *   ⛔ It confers no authority. It does not enable a flag, launch a shadow,
 *      read production, write a row, or run a migration.
 *   ⛔ It does not establish that the seam is CORRECT — only whether it MOVED.
 *   ⛔ It gates nothing until a founder act names where it is REQUIRED.
 *
 * DESIGN LAWS (each has a falsifier in seam-identity-falsifiers.mjs)
 *   L1  The seam path set is DECLARED LITERALLY below. It is never globbed
 *       or discovered — a glob silently admits new files and silently drops
 *       renamed ones, and the digest would move for reasons nobody named.
 *   L2  A declared path that is ABSENT at the rev is a NAMED REFUSAL, never a
 *       skipped entry. Absence and mutation must not be indistinguishable.
 *   L3  A declared DIRECTORY that expands to zero files is a REFUSAL.
 *   L4  An unresolvable rev is a REFUSAL, never an empty digest.
 *   L5  ⭐ Ancestry that cannot be VERIFIED (grafted / shallow history) is
 *       ANCESTRY_UNVERIFIABLE — ⛔ never reported as "not an ancestor".
 *       A non-fast-forward report in a shallow clone carries zero information
 *       about rewriting. This law exists because that near-miss happened.
 *   L6  Fail-closed: any unrecognised condition exits non-zero.
 */

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';

/** L1 — the seam, named. Edit only by a governed act. */
const SEAM_PATHS = [
  'lib/ain/epistemic-join',
  'lib/maia/relational-field-shadow',
  'app/api/sovereign/app/maia/list/route.ts',
  'database/migrations/20260916211500_relational_field_shadow_runs.sql',
  'database/migrations/20260921000001_epistemic_join_persistence.sql',
  'database/migrations/20260921000002_epistemic_join_integration_shadow.sql',
];

class Refusal extends Error {
  constructor(code, detail) {
    super(detail ? `${code}: ${detail}` : code);
    this.code = code;
  }
}

function git(args) {
  try {
    return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (err) {
    const e = new Error(String(err.stderr || err.message).trim());
    e.gitFailed = true;
    throw e;
  }
}

function resolveRev(rev) {
  try {
    return git(['rev-parse', '--verify', `${rev}^{commit}`]).trim();
  } catch {
    throw new Refusal('REV_UNRESOLVABLE', rev); // L4
  }
}

/** Compute the seam identity digest at a commit. */
export function seamIdentity(rev, seamPaths = SEAM_PATHS) {
  const commit = resolveRev(rev);
  const entries = [];

  for (const path of seamPaths) {
    let out;
    try {
      out = git(['ls-tree', '-r', commit, '--', path]);
    } catch (err) {
      throw new Refusal('SEAM_PATH_UNREADABLE', `${path} (${err.message})`);
    }
    const lines = out.split('\n').filter((l) => l.trim() !== '');
    if (lines.length === 0) {
      // L2 / L3 — a named path that yields nothing is a refusal, not a gap.
      throw new Refusal('SEAM_PATH_ABSENT', `${path} @ ${commit.slice(0, 9)}`);
    }
    for (const line of lines) {
      const m = /^(\d{6}) (blob|tree|commit) ([0-9a-f]{40})\t(.+)$/.exec(line);
      if (!m) throw new Refusal('SEAM_ENTRY_UNPARSEABLE', line); // L6
      entries.push(`${m[3]}  ${m[4]}`);
    }
  }

  // Deduplicate: declared paths may legitimately overlap; the digest is over
  // the SET of (blob, path) pairs, so an overlap must not double-count.
  const unique = [...new Set(entries)].sort();
  const digest = createHash('sha256').update(unique.join('\n') + '\n').digest('hex');
  return { commit, digest, pathCount: unique.length };
}

/**
 * L5 — three-valued ancestry. Never collapses UNVERIFIABLE into false.
 */
export function ancestry(ancestorRev, descendantRev) {
  const a = resolveRev(ancestorRev);
  const d = resolveRev(descendantRev);
  let isAncestor;
  try {
    execFileSync('git', ['merge-base', '--is-ancestor', a, d], { stdio: 'ignore' });
    isAncestor = true;
  } catch {
    isAncestor = false;
  }
  if (isAncestor) return { verdict: 'ANCESTOR', ancestor: a, descendant: d };

  // Not reported as an ancestor. Before calling that a negative, establish
  // that the connecting history is actually PRESENT.
  let grafted = false;
  try {
    grafted = git(['rev-parse', '--is-shallow-repository']).trim() === 'true';
  } catch {
    grafted = true; // cannot establish completeness -> fail closed
  }
  let hasMergeBase = false;
  try {
    hasMergeBase = git(['merge-base', a, d]).trim().length === 40;
  } catch {
    hasMergeBase = false;
  }
  if (grafted && !hasMergeBase) {
    return { verdict: 'ANCESTRY_UNVERIFIABLE', ancestor: a, descendant: d, reason: 'shallow/grafted history, no common ancestor present' };
  }
  return { verdict: 'NOT_ANCESTOR', ancestor: a, descendant: d };
}

/** The §3a property predicate. */
export function checkBinding({ productionSha, canonicalRev, expectedDigest }) {
  const findings = [];
  const anc = ancestry(productionSha, canonicalRev);
  if (anc.verdict !== 'ANCESTOR') findings.push({ code: anc.verdict, detail: anc.reason ?? 'production SHA is not contained in canonical' });

  const prod = seamIdentity(productionSha);
  const canon = seamIdentity(canonicalRev);
  if (prod.digest !== expectedDigest) findings.push({ code: 'SEAM_MOVED_AT_PRODUCTION', detail: prod.digest });
  if (canon.digest !== expectedDigest) findings.push({ code: 'SEAM_MOVED_AT_CANONICAL', detail: canon.digest });

  return { ok: findings.length === 0, ancestry: anc, production: prod, canonical: canon, expectedDigest, findings };
}

function usage() {
  return [
    'usage:',
    '  seam-identity.mjs compute <rev>',
    '  seam-identity.mjs verify <rev> --expect <sha256>',
    '  seam-identity.mjs check --production-sha <sha> --canonical-rev <rev> --expect <sha256>',
  ].join('\n');
}

function arg(argv, name) {
  const i = argv.indexOf(name);
  return i === -1 ? undefined : argv[i + 1];
}

function main(argv) {
  const cmd = argv[0];
  if (cmd === 'compute') {
    if (!argv[1]) throw new Refusal('MISSING_ARGUMENT', '<rev>');
    const r = seamIdentity(argv[1]);
    console.log(`commit=${r.commit}`);
    console.log(`paths=${r.pathCount}`);
    console.log(`seam_id=${r.digest}`);
    return 0;
  }
  if (cmd === 'verify') {
    const rev = argv[1];
    const expect = arg(argv, '--expect');
    if (!rev || !expect) throw new Refusal('MISSING_ARGUMENT', '<rev> --expect <sha256>');
    const r = seamIdentity(rev);
    const ok = r.digest === expect;
    console.log(`commit=${r.commit}`);
    console.log(`paths=${r.pathCount}`);
    console.log(`seam_id=${r.digest}`);
    console.log(ok ? 'SEAM INTACT' : `SEAM MOVED (expected ${expect})`);
    return ok ? 0 : 1;
  }
  if (cmd === 'check') {
    const productionSha = arg(argv, '--production-sha');
    const canonicalRev = arg(argv, '--canonical-rev');
    const expectedDigest = arg(argv, '--expect');
    if (!productionSha || !canonicalRev || !expectedDigest) {
      throw new Refusal('MISSING_ARGUMENT', '--production-sha --canonical-rev --expect');
    }
    const r = checkBinding({ productionSha, canonicalRev, expectedDigest });
    console.log(`ancestry=${r.ancestry.verdict}`);
    console.log(`production=${r.production.commit.slice(0, 9)} seam_id=${r.production.digest}`);
    console.log(`canonical=${r.canonical.commit.slice(0, 9)} seam_id=${r.canonical.digest}`);
    console.log(`expected=${expectedDigest}`);
    if (r.ok) {
      console.log('BINDING SATISFIED — seam frozen across production and canonical');
      return 0;
    }
    for (const f of r.findings) console.log(`REFUSED ${f.code}${f.detail ? ` (${f.detail})` : ''}`);
    return 1;
  }
  throw new Refusal('UNKNOWN_COMMAND', `${cmd ?? '(none)'}\n${usage()}`);
}

const invokedDirectly = process.argv[1] && process.argv[1].endsWith('seam-identity.mjs');
if (invokedDirectly) {
  try {
    process.exit(main(process.argv.slice(2)));
  } catch (err) {
    if (err instanceof Refusal) {
      console.error(`REFUSED ${err.message}`);
      process.exit(2);
    }
    console.error(`INSTRUMENT ERROR: ${err.message}`);
    process.exit(3); // L6 — fail closed
  }
}

export { SEAM_PATHS, Refusal };
