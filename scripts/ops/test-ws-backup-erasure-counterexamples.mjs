/**
 * WS-BACKUP-ERASURE-02 — DELIBERATELY VULNERABLE FICTIONAL CONFIGURATIONS.
 *
 * These tests PASS when a counterexample to deletion safety is demonstrated.
 * They do NOT mean the real service implements the required protections.
 * No member bytes, credentials, I/O, Docker or network access.
 *
 * Run: node --test scripts/ops/test-ws-backup-erasure-counterexamples.mjs
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const SYN = "FICTIONAL_MEMBER_WRITING_NEVER_REAL_CONTENT";
function encrypt(key, value, aad) {
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", key, iv);
  c.setAAD(Buffer.from(aad));
  const payload = Buffer.concat([c.update(value, "utf8"), c.final()]);
  return { iv, payload, tag: c.getAuthTag() };
}
function decrypt(key, blob, aad) {
  const d = createDecipheriv("aes-256-gcm", key, blob.iv);
  d.setAAD(Buffer.from(aad));
  d.setAuthTag(blob.tag);
  return Buffer.concat([d.update(blob.payload), d.final()]).toString("utf8");
}
function fictional() {
  const workId = "fictional-work-A";
  const key = randomBytes(32);
  const content = SYN + ":" + workId + ":chapter-one";
  const archived = encrypt(key, content, "work:" + workId);
  return { workId, key, content, archived };
}

test("C1 DANGER: old plaintext SQL remains reconstructive after key deletion", () => {
  const f = fictional();
  // Model today's historical plain SQL dump, not a real disk read.
  const legacyDump = Buffer.from("COPY manuscript_source_arrivals (source_text)\n" + f.content + "\n");
  const authority = new Map([[f.workId, f.key]]);
  authority.delete(f.workId);
  assert.equal(authority.has(f.workId), false);
  assert.equal(legacyDump.includes(Buffer.from(f.content)), true);
});

test("C2 DANGER: retained old per-Work key defeats crypto-erasure", () => {
  const f = fictional();
  // The old key is copied into a hypothetical snapshot, outside the live authority.
  const escrowSnapshot = Buffer.from(f.key);
  const authority = new Map([[f.workId, f.key]]);
  authority.delete(f.workId);
  assert.equal(authority.has(f.workId), false);
  assert.equal(decrypt(escrowSnapshot, f.archived, "work:" + f.workId), f.content);
});

test("C3 DANGER: restore checked before publish can race a deletion", () => {
  const f = fictional();
  const authority = { erased: false, key: f.key };
  if (authority.erased) throw Error("Unexpected fixture state");
  const staged = decrypt(authority.key, f.archived, "work:" + f.workId);
  // Before a delayed public publication, deletion occurs elsewhere.
  authority.erased = true;
  authority.key = null;
  assert.equal(authority.erased, true);
  assert.equal(staged, f.content);
  // The test demonstrates unsafe results if a real restore publishes staged
  // bytes without an atomic final authority fence.
});

test("C4 DANGER: common transport key can restore a monolithic backup", () => {
  const f = fictional();
  const transportKey = randomBytes(32);
  const whole = encrypt(
    transportKey,
    JSON.stringify({ db: f.content, source: f.content }),
    "monolithic-database-and-vault",
  );
  const authority = new Map([[f.workId, f.key]]);
  authority.delete(f.workId);
  const historic = decrypt(transportKey, whole, "monolithic-database-and-vault");
  assert.equal(JSON.parse(historic).db, f.content);
});

test("C5 DANGER: restoring the key-and-erasure registry rolls back tombstones", () => {
  const f = fictional();
  const oldAuthoritySnapshot = { keys: [[f.workId, Buffer.from(f.key)]], erased: [] };
  const live = { keys: new Map([[f.workId, f.key]]), erased: new Set() };
  live.keys.delete(f.workId);
  live.erased.add(f.workId);
  assert.equal(live.erased.has(f.workId), true);
  // A disaster-restored pre-deletion registry can include the old key
  // while lacking the tombstone.
  const restored = {
    keys: new Map(oldAuthoritySnapshot.keys),
    erased: new Set(oldAuthoritySnapshot.erased),
  };
  assert.equal(restored.erased.has(f.workId), false);
  assert.equal(decrypt(restored.keys.get(f.workId), f.archived, "work:" + f.workId), f.content);
});
