#!/usr/bin/env node
/**
 * seam-preflight.mjs — repository-side pre-deployment evidence for I5-P0R3 §1
 * (as amended 2026-09-22: authority location + fresh property recovery).
 *
 * ⭐ ADDITIVE, AT ITS OWN ADDRESS. It imports the adjudicated
 * `seam-identity.mjs` UNCHANGED and edits none of the six blobs the founder
 * re-accepted. Additive law is lawful; editing accepted custody is not.
 *
 * It distinguishes the THREE repository-side objects the amendment names:
 *   A  governing authority — the R2R2 record + six-blob custody, on the LANE
 *      branch. Their absence from canonical is an expected branch-location
 *      fact, ⛔ never by itself a custody failure.
 *   B  current canonical — SHA read fresh at execution time, both seam digests
 *      computed fresh, each compared to the ADJUDICATED property.
 *   C  chosen deployment tree — identified explicitly, digests computed
 *      independently, compared to the same adjudicated property.
 *      ⛔ No SHA identity substitutes for digest equality.
 *
 * ⛔⛔ IT COMPUTES NOTHING ABOUT PRODUCTION.
 *   A git tree at production's asserted SHA is a LANE-SIDE COPY of what
 *   production claims to be. Under the amendment that may not be substituted
 *   for production. The production rows are printed as OWED and are never
 *   filled in here — they belong to host-side reads of the running filesystem
 *   and runtime state.
 *
 * ⛔ Adjudicated digests must be PASSED IN, never defaulted. A default would
 *   be inherited evidence, which is the one thing §1 B forbids.
 */

import { execFileSync } from 'node:child_process';
import { seamIdentity, ancestry } from './seam-identity.mjs';

/** The six blobs re-accepted by the I5-P0R2R2 adjudication. */
const ADJUDICATED_CUSTODY = {
  'i5-p0r2-remediation.sh': '1886e52108d5874c70153231c123c2028c5a5fa4',
  'i5-p0r2-ceiling-falsifiers.sh': '5345f87fdbe542f05b5efd70ee6cd722b88b5ead',
  'i5-p0r2-dryrun-boundary-falsifiers.sh': '53532264cc6d08b0d81a831304848d60eeb88d92',
  'i5-host-plane-probe.sh': 'a96de5c447c5f9aea14203768694ebaa057f2f31',
  'seam-identity.mjs': 'b86a7e3982a0bf809022c2fdfe2b7f28c203d223',
  'seam-identity-container.mjs': '85bdba16753cceb4d5991ca4c8c69b57f79f1585',
};
const AUTHORITY_RECORD = 'docs/programme/JARVIS-KP-01_I5-P0R2R2_ADJUDICATION_AND_STANDING_2026-09-22.md';

const git = (args) => execFileSync('git', args, { encoding: 'utf8' }).trim();
const arg = (n) => { const i = process.argv.indexOf(n); return i === -1 ? undefined : process.argv[i + 1]; };

let failures = 0;
const cmp = (label, got, want) => {
  const ok = got === want;
  if (!ok) failures += 1;
  console.log(`    ${ok ? 'EQUAL    ' : 'MISMATCH '} ${label}`);
  if (!ok) console.log(`      got  ${got}\n      want ${want}`);
  return ok;
};

function main() {
  const authorityBranch = arg('--authority-branch');
  const canonicalRev = arg('--canonical-rev') ?? 'origin/clean-main-no-secrets';
  const deployTree = arg('--deploy-tree') ?? canonicalRev;
  const adjFull = arg('--adjudicated-full');
  const adjImage = arg('--adjudicated-image');

  for (const [flag, v] of [['--authority-branch', authorityBranch],
    ['--adjudicated-full', adjFull], ['--adjudicated-image', adjImage]]) {
    if (!v) {
      console.error(`REFUSED MISSING_ARGUMENT: ${flag}`);
      console.error('  The adjudicated digests are NOT defaulted: a default would be');
      console.error('  inherited evidence, which §1 B forbids. Pass them explicitly.');
      process.exit(2);
    }
  }

  console.log('══ A · GOVERNING AUTHORITY (lane branch; absence from canonical is expected) ══');
  console.log(`  source branch                ${authorityBranch}`);
  console.log(`  branch head                  ${git(['rev-parse', authorityBranch])}`);
  let recordBlob;
  try {
    recordBlob = git(['rev-parse', `${authorityBranch}:${AUTHORITY_RECORD}`]);
    console.log(`  R2R2 record blob             ${recordBlob}`);
  } catch {
    console.log(`  R2R2 record blob             ABSENT on ${authorityBranch}`);
    failures += 1;
  }
  console.log('  six-blob instrument custody:');
  for (const [file, want] of Object.entries(ADJUDICATED_CUSTODY)) {
    let got;
    try { got = git(['rev-parse', `${authorityBranch}:scripts/witness/${file}`]); }
    catch { got = 'ABSENT'; }
    cmp(file.padEnd(38), got, want);
  }

  console.log('\n══ B · CURRENT CANONICAL (read fresh; ⛔ nothing inherited) ══');
  const canon = seamIdentity(canonicalRev);
  const canonImage = seamIdentity(canonicalRev, undefined, 'image');
  console.log(`  exact SHA                    ${canon.commit}`);
  console.log(`  fresh full-scope  (${String(canon.pathCount).padStart(2)} paths) ${canon.digest}`);
  console.log(`  fresh image-scope (${String(canonImage.pathCount).padStart(2)} paths) ${canonImage.digest}`);
  console.log('  equality to adjudicated property:');
  cmp('full-scope ', canon.digest, adjFull);
  cmp('image-scope', canonImage.digest, adjImage);

  console.log('\n══ C · CHOSEN DEPLOYMENT TREE (digest equality, ⛔ never SHA identity) ══');
  const tree = seamIdentity(deployTree);
  const treeImage = seamIdentity(deployTree, undefined, 'image');
  console.log(`  exact SHA                    ${tree.commit}`);
  let rel;
  if (tree.commit === canon.commit) rel = 'IS current canonical';
  else {
    const a = ancestry(tree.commit, canon.commit).verdict;
    const b = ancestry(canon.commit, tree.commit).verdict;
    rel = a === 'ANCESTOR' ? 'ancestor of current canonical'
      : b === 'ANCESTOR' ? 'descendant of current canonical'
      : a === 'ANCESTRY_UNVERIFIABLE' || b === 'ANCESTRY_UNVERIFIABLE'
        ? 'UNVERIFIABLE (grafted history — ⛔ not a negative)'
        : 'unrelated to current canonical';
  }
  console.log(`  relationship to canonical    ${rel}`);
  console.log(`  fresh full-scope  (${String(tree.pathCount).padStart(2)} paths) ${tree.digest}`);
  console.log(`  fresh image-scope (${String(treeImage.pathCount).padStart(2)} paths) ${treeImage.digest}`);
  console.log('  equality to adjudicated property:');
  cmp('full-scope ', tree.digest, adjFull);
  cmp('image-scope', treeImage.digest, adjImage);

  console.log('\n══ PRODUCTION · OWED TO HOST-SIDE READS ══');
  console.log('  ⛔ This tool computes NOTHING about production. A git tree at');
  console.log('     production\'s asserted SHA is a lane-side COPY of what production');
  console.log('     CLAIMS to be, and the amendment forbids substituting it for');
  console.log('     production. These rows are filled only by reads of the running');
  console.log('     filesystem and runtime state:');
  for (const row of ['serving identity before deployment', 'flags', 'apply state',
    'shadow state', 'existing I5 rows']) {
    console.log(`     ${row.padEnd(36)} OWED · not computable here`);
  }
  console.log('\n  ⭐ Admissible: a lane-side INSTRUMENT measuring production (streamed in).');
  console.log('  ⛔ Inadmissible: a lane-side COPY of production source standing in for it.');
  console.log('  ⛔ /app/scripts/witness/seam-identity* is NOT expected in the deployed');
  console.log('     image — the canonical application tree predates those lane-only files.');

  console.log(`\n══ REPOSITORY-SIDE RESULT ══\n  ${failures === 0
    ? 'GREEN — A/B/C satisfy the adjudicated property. Production rows still OWED.'
    : `${failures} comparison(s) failed — STOP · NO DEPLOYMENT.`}`);
  return failures === 0 ? 0 : 1;
}

try { process.exit(main()); }
catch (err) {
  console.error(`INSTRUMENT ERROR: ${err.message}`);
  process.exit(3);
}
