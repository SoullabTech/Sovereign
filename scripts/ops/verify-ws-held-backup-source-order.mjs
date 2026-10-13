#!/usr/bin/env node
/**
 * WS-BACKUP-OPS-02 — independent READER'S read-only phase-order guard.
 *
 * This tool NEVER runs the backup shell script, Docker, rsync, SQL, or network.
 * It reads three exact known shell files, verifies their SHA-256 bytes, and
 * prints only line numbers and boolean classifications.
 *
 * A PASS means the known dangerous order was recognized, NOT that the
 * proposed candidate is acceptable. NO installation authority is granted.
 *
 * Run only on the trusted Minisforum:
 *    node verify-ws-held-backup-source-order.mjs --read-only-source-check
 */
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import assert from "node:assert/strict";

if (process.argv.length !== 3 || process.argv[2] !== "--read-only-source-check") {
  console.error("REFUSED: use --read-only-source-check; never run backup scripts");
  process.exit(2);
}
const files = Object.freeze({
  installed: {
    path: "/usr/local/bin/maia-backup",
    sha: "5f09ddcff7d0c50c2cf92657bbdea2caaebdffa74d6390f378fda708343c340f",
  },
  held: {
    path: "/home/soullab/maia-backup-hardened-20261011.sh",
    sha: "a43e6d0fd8ada224764f18bf661417d3a5836c6d9abeff6a81062ee04d2e002f",
  },
  installer: {
    path: "/home/soullab/install-maia-backup-hardened-20261011.sh",
    sha: "81da5d86c170fddd447c3d62ea13ebeba9c5534a6f4e7d39c4c123a27bb3d0f4",
  },
});
function pin(spec) {
  const buffer = readFileSync(spec.path);
  const actual = createHash("sha256").update(buffer).digest("hex");
  assert.equal(actual, spec.sha, "STOP: source hash mismatch on " + spec.path);
  return buffer.toString("utf8");
}
const installed = pin(files.installed);
const held = pin(files.held);
const installer = pin(files.installer);
const heldLines = held.split(/\r?\n/);
function uniqueLine(name, regex) {
  const hits = heldLines.flatMap((line, index) => regex.test(line) ? [index + 1] : []);
  assert.equal(hits.length, 1, "STOP: expected unique " + name + " phase, got " + hits.length);
  return hits[0];
}
const pgPrepared = uniqueLine("PostgreSQL temporary stage", /TEMP_PG=.*mktemp.*PG_DIR/);
const pgGzip = uniqueLine("PostgreSQL tar-gzip stream", /\bpg_dump\b.*-U soullab/);
const integrity = uniqueLine("gzip validation", /\bgzip -t "\$TEMP_PG"/);
const pgPublished = uniqueLine("SQL archive publication", /mv -n -- "\$TEMP_PG" "\$PG_FINAL"/);
const media = uniqueLine("media rsync", /timeout.*\brsync -a --stats\b/);
const manifestPrepared = uniqueLine("manifest temporary stage", /TEMP_MANIFEST=.*mktemp.*MANIFEST_DIR/);
const manifestPublished = uniqueLine("final manifest publication", /mv -n -- "\$TEMP_MANIFEST" "\$MANIFEST_FINAL"/);
const cleanup = uniqueLine("cleanup temporary-only list", /for file in "\$\{TEMP_PG:-\}".*"\$\{TEMP_MANIFEST:-\}".*"\$\{TEMP_COPY:-\}"/);
const [p, z, v, pub, m, mstage, mpub] = [pgPrepared, pgGzip, integrity, pgPublished, media, manifestPrepared, manifestPublished];
assert.ok(p < z && z < v && v < pub && pub < m && m < mstage && mstage < mpub);
assert.ok(!heldLines[cleanup - 1].includes("PG_FINAL"), "unexpected final archive cleanup");
assert.match(installer, /STOP R20:/);
assert.match(installer, /exit 1/);
assert.match(held, /MODE="\$\{1:---run\}"/);
assert.match(held, /Retention pruning: DISABLED pending independent verification/);
assert.match(installed, /rsync -a --delete/);
assert.match(installed, /find "\$POSTGRES_DIR".*-mtime \+14 -delete/);
assert.ok(!held.includes("maia-sovereign_vault_data"), "unexpected new Source writer; re-review");
assert.ok(!/\bgpg\s+--encrypt\b/.test(held), "unexpected encryption change; re-review");
for (const [name, line] of Object.entries({
  pg_staged: pgPrepared, pg_stream: pgGzip, gzip_verified: integrity,
  pg_published: pgPublished, media_sync: media, manifest_staged: manifestPrepared,
  manifest_published: manifestPublished, temporary_cleanup: cleanup,
})) console.log("PINNED_SOURCE_PHASE", name, "line", line);
console.log("SOURCE_READ_ONLY_HASH_CHECK: 3/3 PASS");
console.log("CONFIRMED_RISK: SQL archive publicly published before media and final manifest");
console.log("CONFIRMED_RISK: failed media/manifest phase may leave finalized unpaired SQL archive");
console.log("CONFIRMED_RISK: proposed replacement still omits Work-aware Source custody and deletion");
console.log("R20_INSTALLER_HOLD: PRESENT");
console.log("CLASS_A_VERDICT: NOT GRANTED");
console.log("NO_SHELL_EXECUTION: PASS");
