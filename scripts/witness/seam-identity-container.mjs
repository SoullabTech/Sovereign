#!/usr/bin/env node
/**
 * seam-identity-container.mjs — the production-side half of the seam witness.
 *
 * WHY IT EXISTS
 *   seam-identity.mjs reads a git object database, so it can only ever state
 *   repository truth. Whether the RUNNING container presents the named seam is a
 *   production fact, and reading the container's asserted GIT_COMMIT is
 *   ENTAILMENT, not witness — it trusts a label.
 *
 *   This script closes that gap for the 36 of 37 declared seam files that
 *   Dockerfile.production copies into the runner stage as SOURCE (`/app/lib`,
 *   `/app/database`). It recomputes git blob hashes from the filesystem, with no
 *   git binary and no .git directory, so the digest can be compared byte-for-byte
 *   against `seam-identity.mjs compute <sha> --scope image`.
 *
 * ⛔ WHAT IT STILL CANNOT WITNESS
 *   `app/api/sovereign/app/maia/list/route.ts` is compiled into
 *   `.next/standalone` and its source is not copied into the runner. That one
 *   path remains ENTAILED from GIT_COMMIT and the deploy provenance chain, and
 *   must be reported as entailed — ⛔ never folded into the witnessed set.
 *
 * ⛔ It reads files. It writes nothing, touches no database, and calls no network.
 *
 * Usage (inside the container):
 *   docker exec maia-sovereign node /app/scripts/witness/seam-identity-container.mjs
 *   docker exec maia-sovereign node /app/scripts/witness/seam-identity-container.mjs --expect <sha256>
 */

import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, posix } from 'node:path';

/** The image-scope seam, declared. Must mirror seam-identity.mjs. */
const IMAGE_SCOPE_SEAM = [
  'lib/ain/epistemic-join',
  'lib/maia/relational-field-shadow',
  'database/migrations/20260916211500_relational_field_shadow_runs.sql',
  'database/migrations/20260921000001_epistemic_join_persistence.sql',
  'database/migrations/20260921000002_epistemic_join_integration_shadow.sql',
];

/** Declared but NOT witnessable here. Reported, never silently omitted. */
const ENTAILED_ONLY = ['app/api/sovereign/app/maia/list/route.ts'];

/**
 * A refusal THROWS rather than exiting. The CLI wrapper turns it into exit 2.
 * ⭐ This is deliberate: an in-core `process.exit` cannot be modelled by a
 * defeat candidate, so the refusal would be enforced by the plumbing instead of
 * by the decision, and a wrong candidate would die for the wrong reason.
 */
export class ContainerRefusal extends Error {
  constructor(code, detail) {
    super(detail ? `${code}: ${detail}` : code);
    this.code = code;
  }
}

function refuse(code, detail) {
  throw new ContainerRefusal(code, detail);
}

/** git's blob hash: sha1("blob " + byteLength + "\0" + bytes). */
function blobHash(bytes) {
  return createHash('sha1')
    .update(Buffer.concat([Buffer.from(`blob ${bytes.length}\0`, 'utf8'), bytes]))
    .digest('hex');
}

function walk(root, rel, out) {
  const abs = join(root, rel);
  const st = statSync(abs);
  if (st.isFile()) {
    out.push(rel);
    return;
  }
  if (!st.isDirectory()) return; // symlinks/devices are not seam content
  for (const name of readdirSync(abs).sort()) walk(root, posix.join(rel, name), out);
}

export function containerSeamIdentity(root = '/app', seam = IMAGE_SCOPE_SEAM) {
  const entries = [];
  const covered = [];
  for (const declared of seam) {
    if (!existsSync(join(root, declared))) {
      // Same law as the git-side instrument: an absent declared path is a named
      // refusal, never a skipped entry.
      refuse('SEAM_PATH_ABSENT', `${declared} under ${root}`);
    }
    const files = [];
    walk(root, declared, files);
    if (files.length === 0) refuse('SEAM_PATH_EMPTY', declared);
    for (const rel of files) {
      entries.push(`${blobHash(readFileSync(join(root, rel)))}  ${rel}`);
      covered.push(rel);
    }
  }
  const unique = [...new Set(entries)].sort();
  const digest = createHash('sha256').update(unique.join('\n') + '\n').digest('hex');
  return { digest, pathCount: unique.length, covered, entailedOnly: ENTAILED_ONLY };
}

const invokedDirectly = process.argv[1] && process.argv[1].endsWith('seam-identity-container.mjs');
if (invokedDirectly) {
  const argv = process.argv.slice(2);
  const at = (n) => { const i = argv.indexOf(n); return i === -1 ? undefined : argv[i + 1]; };
  const root = at('--root') ?? '/app';
  const expect = at('--expect');
  let r;
  try {
    r = containerSeamIdentity(root);
  } catch (err) {
    if (err instanceof ContainerRefusal) {
      console.error(`REFUSED ${err.message}`);
      process.exit(2);
    }
    console.error(`INSTRUMENT ERROR: ${err.message}`);
    process.exit(3); // fail closed
  }
  console.log(`root=${root}`);
  console.log(`scope=image`);
  console.log(`paths=${r.pathCount}`);
  console.log(`seam_id=${r.digest}`);
  for (const p of r.entailedOnly) console.log(`entailed_only=${p}`);
  if (expect) {
    const ok = r.digest === expect;
    console.log(ok ? 'SEAM INTACT IN RUNNING IMAGE' : `SEAM MOVED IN RUNNING IMAGE (expected ${expect})`);
    process.exit(ok ? 0 : 1);
  }
  process.exit(0);
}

export { IMAGE_SCOPE_SEAM, ENTAILED_ONLY };
