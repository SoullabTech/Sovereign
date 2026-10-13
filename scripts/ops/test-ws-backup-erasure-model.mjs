/**
 * WS-BACKUP-ERASURE-02 — FICTIONAL TEST MODEL ONLY; NOT PRODUCTION CODE.
 *
 * Models per-Work AES-256-GCM encryption and a separate non-rollback
 * erasure/key authority. Every input is synthetic. No Docker, DB, vault,
 * NAS, member data, credentials, external services, or third-party packages.
 *
 * CAUTION: Current production DOES NOT satisfy the assumptions modeled here.
 * The assumed key authority is outside all historical DB and NAS snapshots.
 * Its secrets cannot be restored, escrowed or replayed after a deletion.
 * ALL durable source/derived/WAL bytes must have been encrypted before write.
 * Old plaintext .sql.gz archives are blocking, not magically erased.
 *
 * Run: node --test scripts/ops/test-ws-backup-erasure-model.mjs
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

const marker = "SYNTHETIC_FICTIONAL_WORK_ONLY";
const sha = bytes => createHash("sha256").update(bytes).digest("hex");
function refuse(message) { throw Error("REFUSED: " + message); }

function seal(key, bytes, scope) {
  const nonce = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, nonce);
  cipher.setAAD(Buffer.from(scope));
  const ciphertext = Buffer.concat([cipher.update(bytes), cipher.final()]);
  return {
    nonce: nonce.toString("base64"),
    ciphertext: ciphertext.toString("base64"),
    tag: cipher.getAuthTag().toString("base64"),
  };
}
function open(key, blob, scope) {
  const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(blob.nonce, "base64"));
  decipher.setAAD(Buffer.from(scope));
  decipher.setAuthTag(Buffer.from(blob.tag, "base64"));
  return Buffer.concat([
    decipher.update(Buffer.from(blob.ciphertext, "base64")),
    decipher.final(),
  ]);
}

// SIMULATED authority: cannot be rolled back and is not embedded in backups.
// Production must PROVE both properties across all replicas and snapshots.
class Authority {
  constructor() {
    this.keys = new Map();
    this.erased = new Set();
    this.pending = new Set();
    this.epoch = 0;
    this.online = true;
  }
  create(id) {
    if (this.keys.has(id) || this.erased.has(id)) refuse("key re-creation forbidden");
    this.keys.set(id, randomBytes(32));
  }
  isErased(id) {
    if (!this.online) refuse("erasure authority unavailable");
    return this.erased.has(id);
  }
  get(id) {
    if (!this.online) refuse("erasure authority unavailable");
    if (this.erased.has(id)) refuse("work has been erased");
    const key = this.keys.get(id);
    if (!key) refuse("no active Work key");
    return key;
  }
  delete(id, replicaOnline = true) {
    if (!this.keys.has(id)) refuse("no governed Work key");
    this.keys.delete(id);
    this.erased.add(id);
    this.epoch += 1;
    if (!replicaOnline) this.pending.add(id);
    return replicaOnline ? "SIMULATED_COMPLETE" : "PENDING";
  }
  status(id) {
    if (this.pending.has(id)) return "PENDING";
    return this.erased.has(id) ? "SIMULATED_COMPLETE" : "ACTIVE";
  }
  replicaAck(id) { this.pending.delete(id); }
}

class BackupFixture {
  constructor(authority) {
    this.authority = authority;
    this.globalTransportKey = randomBytes(32);
    this.durable = new Map();
    this.archives = [];
    this.nasOnline = true;
    this.plainHistoricalSQL = false;
    this.escrowedOldWorkKeys = false;
    this.unknownSourceFiles = 0;
  }
  write(id, words) {
    const key = this.authority.get(id);
    const file = Buffer.from(marker + ":SOURCE:" + id + ":" + words);
    const db = Buffer.from(JSON.stringify({
      source_text: words, draft: "draft:" + words,
      section: "Section " + id,
      artifact_hash: sha(file),
    }));
    // Assumption: ciphertext enters EACH durable store; plaintext never does.
    this.durable.set(id, {
      sql: seal(key, db, "sql:" + id),
      source: seal(key, file, "source:" + id),
    });
  }
  preflight() {
    if (this.plainHistoricalSQL) refuse("historical plaintext SQL still exists");
    if (this.escrowedOldWorkKeys) refuse("recoverable individual key copy survives");
    if (this.unknownSourceFiles) refuse("unknown source files have no custody ruling");
    if (!this.nasOnline) refuse("backup storage unavailable");
    if (!this.authority.online) refuse("current erasure barrier unavailable");
  }
  capture({ beforeCommit, crashBeforePublish } = {}) {
    this.preflight();
    const initialEpoch = this.authority.epoch;
    const entries = [...this.durable].filter(([id]) => !this.authority.isErased(id));
    const body = Buffer.from(JSON.stringify({ captureEpoch: initialEpoch, entries }));
    const outer = seal(this.globalTransportKey, body, "backup:v1");
    beforeCommit?.();
    this.preflight();
    if (this.authority.epoch !== initialEpoch) refuse("deletion raced publication");
    if (crashBeforePublish) refuse("crash before publication");
    this.archives.push(outer);
    return outer;
  }
  unpack(archive) {
    return JSON.parse(open(this.globalTransportKey, archive, "backup:v1").toString("utf8"));
  }
  restore(archive) {
    if (!this.authority.online) refuse("live erasure authority required");
    const { entries } = this.unpack(archive);
    const recovered = new Map();
    for (const [id, bytes] of entries) {
      if (this.authority.isErased(id)) continue;
      const key = this.authority.get(id);
      const db = JSON.parse(open(key, bytes.sql, "sql:" + id).toString("utf8"));
      const file = open(key, bytes.source, "source:" + id);
      if (db.artifact_hash !== sha(file)) refuse("source and DB hashes diverged");
      recovered.set(id, { text: db.source_text, sourceHash: sha(file) });
    }
    return recovered;
  }
}
function scenario() {
  const a = new Authority();
  a.create("alpha");
  a.create("beta");
  const b = new BackupFixture(a);
  b.write("alpha", marker + ":ALPHA");
  b.write("beta", marker + ":BETA");
  return { a, b };
}

test("01 active SQL and Source jointly recover", () => {
  const { b } = scenario();
  const result = b.restore(b.capture());
  assert.equal(result.size, 2);
  assert.match(result.get("alpha").text, /ALPHA/);
});

test("02 deletion after snapshot leaves surviving Work recoverable", () => {
  const { a, b } = scenario();
  const old = b.capture();
  assert.equal(a.delete("alpha"), "SIMULATED_COMPLETE");
  assert.equal(b.restore(old).has("alpha"), false);
  assert.equal(b.restore(old).has("beta"), true);
  // Global decryption of the outer archive reveals no original prose.
  assert.equal(JSON.stringify(b.unpack(old)).includes(marker + ":ALPHA"), false);
  assert.throws(() => a.get("alpha"), /REFUSED/);
});

test("03 delete during capture prevents backup publication", () => {
  const { a, b } = scenario();
  assert.throws(() => b.capture({ beforeCommit: () => a.delete("alpha") }),
    /deletion raced publication/);
  assert.equal(b.archives.length, 0);
});

test("04 old snapshot cannot roll back deletion barrier", () => {
  const { a, b } = scenario();
  const old = b.capture();
  a.delete("alpha");
  assert.equal(b.unpack(old).entries.length, 2);
  assert.deepEqual([...b.restore(old).keys()], ["beta"]);
});

test("05 unreachable replica keeps deletion pending, never falsely done", () => {
  const { a, b } = scenario();
  const old = b.capture();
  assert.equal(a.delete("alpha", false), "PENDING");
  assert.equal(a.status("alpha"), "PENDING");
  assert.equal(b.restore(old).has("alpha"), false);
  a.replicaAck("alpha");
  assert.equal(a.status("alpha"), "SIMULATED_COMPLETE");
});

test("06 legacy plaintext PostgreSQL backup blocks certification", () => {
  const { b } = scenario();
  b.plainHistoricalSQL = true;
  assert.throws(() => b.capture(), /historical plaintext SQL/);
});

test("07 historical escrow of Work keys blocks certification", () => {
  const { b } = scenario();
  b.escrowedOldWorkKeys = true;
  assert.throws(() => b.capture(), /recoverable individual key copy/);
});

test("08 unclaimed or orphan Source bytes block ordinary backup", () => {
  const { b } = scenario();
  b.unknownSourceFiles = 2;
  assert.throws(() => b.capture(), /unknown source files/);
});

test("09 authenticated ciphertext tampering is refused", () => {
  const { b } = scenario();
  const archive = b.capture();
  assert.throws(() => b.restore({ ...archive, tag: Buffer.alloc(16, 1).toString("base64") }));
});

test("10 cross-store Source/SQL hash mismatch fails closed", () => {
  const { a, b } = scenario();
  const archive = b.capture();
  const decoded = b.unpack(archive);
  const pair = decoded.entries.find(([id]) => id === "alpha")[1];
  pair.source = seal(a.get("alpha"), Buffer.from("WRONG SYNTHETIC FILE"), "source:alpha");
  const forged = seal(b.globalTransportKey, Buffer.from(JSON.stringify(decoded)), "backup:v1");
  assert.throws(() => b.restore(forged), /source and DB hashes diverged/);
});

test("11 crash before publish does not create recovery point", () => {
  const { b } = scenario();
  assert.throws(() => b.capture({ crashBeforePublish: true }), /crash before publication/);
  assert.equal(b.archives.length, 0);
});

test("12 unavailable non-rollback authority forbids stale restore", () => {
  const { a, b } = scenario();
  const archive = b.capture();
  a.online = false;
  assert.throws(() => b.restore(archive), /live erasure authority required/);
});

test("13 NAS/backup destination outage refuses capture", () => {
  const { b } = scenario();
  b.nasOnline = false;
  assert.throws(() => b.capture(), /backup storage unavailable/);
  assert.equal(b.archives.length, 0);
});

test("14 wrong global transport key cannot decrypt archive", () => {
  const { b } = scenario();
  const archive = b.capture();
  b.globalTransportKey = randomBytes(32);
  assert.throws(() => b.restore(archive));
});
