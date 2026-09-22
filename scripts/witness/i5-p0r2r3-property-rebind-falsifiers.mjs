#!/usr/bin/env node
/**
 * I5-P0R2R3 property-rebind falsifiers.
 * READ ONLY: builds throwaway git fixtures and compares the remediation
 * executable remainder against the pre-R3 content authority.
 */
import { execFileSync } from 'node:child_process';
import {
  mkdtempSync, mkdirSync, writeFileSync, appendFileSync, readFileSync, rmSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { seamIdentity, checkBinding } from './seam-identity.mjs';

const PROJECT = process.cwd();
const BASELINE = process.env.I5_R3_BASELINE || 'a89994b9aa6173edb7aea705a7106494b3f5fabd';
const REMEDIATION = 'scripts/witness/i5-p0r2-remediation.sh';
const results = [];

function sh(args, cwd = PROJECT) {
  return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}
function record(id, intent, fn) {
  try {
    const note = fn();
    results.push({ id, pass: true, intent, note: String(note || 'PASS') });
  } catch (err) {
    results.push({ id, pass: false, intent, note: err.message });
  }
}
function requireThat(ok, note) {
  if (!ok) throw new Error(note);
  return note;
}
function put(root, path, text) {
  const full = join(root, path);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, text);
}
function populate(root, suffix) {
  put(root, 'lib/ain/epistemic-join/a.ts', 'ain-' + suffix + '\n');
  put(root, 'lib/maia/relational-field-shadow/a.ts', 'shadow-' + suffix + '\n');
  put(root, 'app/api/sovereign/app/maia/list/route.ts', 'route-production\n');
  put(root, 'database/migrations/20260916211500_relational_field_shadow_runs.sql', 'r\n');
  put(root, 'database/migrations/20260921000001_epistemic_join_persistence.sql', 'p\n');
  put(root, 'database/migrations/20260921000002_epistemic_join_integration_shadow.sql', 'i\n');
}
function commit(root, message) {
  sh(['add', '.'], root);
  sh(['commit', '-qm', message], root);
  return sh(['rev-parse', 'HEAD'], root);
}
function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'i5-r3-'));
  sh(['init', '-q', '-b', 'main'], root);
  sh(['config', 'user.email', 'fixture@example.invalid'], root);
  sh(['config', 'user.name', 'fixture'], root);
  populate(root, 'v1');
  const production = commit(root, 'production');
  appendFileSync(join(root, 'app/api/sovereign/app/maia/list/route.ts'), 'serving-identity-f2-iq\n');
  const canonical = commit(root, 'canonical-only route advance');
  return { root, production, canonical };
}
function codes(r) {
  return r.findings.map((x) => x.code);
}
function normalizedExecutable(text) {
  return text.split('\n').map((line) => line.trim()).filter((line) => {
    if (!line || line.startsWith('#')) return false;
    if (/^GIT_WITNESS_BLOB=/.test(line)) return false;
    if (/^EXPECT_(FULL|PRODUCTION_FULL|CANONICAL_FULL)=/.test(line)) return false;
    if (line.startsWith('--expect-production ')) return false;
    if (line.startsWith('--expect-canonical ')) return false;
    if (line.startsWith('--expect "$EXPECT_FULL"')) return false;
    return true;
  }).join('\n');
}

const fx = fixture();
const cwd = process.cwd();
try {
  process.chdir(fx.root);
  const prodDigest = seamIdentity(fx.production).digest;
  const canonDigest = seamIdentity(fx.canonical).digest;

  record('F1', 'old production + rebound canonical is admitted', () => {
    const r = checkBinding({
      productionSha: fx.production,
      canonicalRev: fx.canonical,
      expectedProductionDigest: prodDigest,
      expectedCanonicalDigest: canonDigest,
    });
    return requireThat(r.ok, JSON.stringify(r.findings));
  });

  record('F2', 'wrong production digest is refused', () => {
    const r = checkBinding({
      productionSha: fx.production,
      canonicalRev: fx.canonical,
      expectedProductionDigest: '0'.repeat(64),
      expectedCanonicalDigest: canonDigest,
    });
    return requireThat(codes(r).includes('SEAM_MOVED_AT_PRODUCTION'), JSON.stringify(r.findings));
  });

  record('F3', 'wrong canonical digest is refused', () => {
    const r = checkBinding({
      productionSha: fx.production,
      canonicalRev: fx.canonical,
      expectedProductionDigest: prodDigest,
      expectedCanonicalDigest: '0'.repeat(64),
    });
    return requireThat(codes(r).includes('SEAM_MOVED_AT_CANONICAL'), JSON.stringify(r.findings));
  });

  record('F4', 'later canonical seam movement is refused', () => {
    appendFileSync(join(fx.root, 'app/api/sovereign/app/maia/list/route.ts'), 'unexpected-move\n');
    const moved = commit(fx.root, 'unexpected canonical move');
    const r = checkBinding({
      productionSha: fx.production,
      canonicalRev: moved,
      expectedProductionDigest: prodDigest,
      expectedCanonicalDigest: canonDigest,
    });
    return requireThat(codes(r).includes('SEAM_MOVED_AT_CANONICAL'), JSON.stringify(r.findings));
  });

  record('F5', 'production that is not an ancestor is refused', () => {
    sh(['checkout', '-q', '--orphan', 'unrelated'], fx.root);
    sh(['rm', '-rqf', '.'], fx.root);
    populate(fx.root, 'unrelated');
    const unrelated = commit(fx.root, 'unrelated');
    const unrelatedDigest = seamIdentity(unrelated).digest;
    const r = checkBinding({
      productionSha: fx.production,
      canonicalRev: unrelated,
      expectedProductionDigest: prodDigest,
      expectedCanonicalDigest: unrelatedDigest,
    });
    return requireThat(codes(r).includes('NOT_ANCESTOR'), JSON.stringify(r.findings));
  });

  record('F6', 'unverifiable ancestry is refused as ANCESTRY_UNVERIFIABLE', () => {
    const unrelated = sh(['rev-parse', 'HEAD'], fx.root);
    const unrelatedDigest = seamIdentity(unrelated).digest;
    writeFileSync(join(fx.root, '.git', 'shallow'), fx.production + '\n');
    const r = checkBinding({
      productionSha: fx.production,
      canonicalRev: unrelated,
      expectedProductionDigest: prodDigest,
      expectedCanonicalDigest: unrelatedDigest,
    });
    rmSync(join(fx.root, '.git', 'shallow'));
    return requireThat(codes(r).includes('ANCESTRY_UNVERIFIABLE'), JSON.stringify(r.findings));
  });

  record('F7', 'image scope stays unchanged and remains separately enforced', () => {
    const prodImage = seamIdentity(fx.production, undefined, 'image').digest;
    const canonImage = seamIdentity(fx.canonical, undefined, 'image').digest;
    process.chdir(PROJECT);
    const remediation = readFileSync(REMEDIATION, 'utf8');
    const witnessCalls = remediation.split('\n').filter(
      (line) => line.includes('node --input-type=module - --expect "$EXPECT_IMAGE"')
    ).length;
    process.chdir(fx.root);
    return requireThat(
      prodImage === canonImage && witnessCalls === 2,
      'image digest equality=' + (prodImage === canonImage) + '; witness calls=' + witnessCalls
    );
  });
} finally {
  process.chdir(cwd);
  rmSync(fx.root, { recursive: true, force: true });
}

record('F8', 'non-binding remediation executable remainder is byte-identical', () => {
  const baseline = sh(['show', BASELINE + ':' + REMEDIATION]);
  const candidate = readFileSync(REMEDIATION, 'utf8');
  return requireThat(
    normalizedExecutable(baseline) === normalizedExecutable(candidate),
    'unexpected executable change outside the authorized binding loci'
  );
});

const passed = results.filter((r) => r.pass).length;
for (const r of results) {
  console.log((r.pass ? 'PASS' : 'FAIL') + '  ' + r.id + '  ' + r.intent);
  console.log('        ' + r.note);
}
console.log('\n' + passed + '/' + results.length + ' falsifiers passed');
process.exit(passed === results.length ? 0 : 1);
