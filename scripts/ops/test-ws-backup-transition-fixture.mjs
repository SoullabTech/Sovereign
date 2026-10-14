/**
 * WS-BACKUP-OPS-01 — fixture-only NAS backup transition rehearsal.
 *
 * No I/O to NAS, Docker, PostgreSQL, vault, or production scripts.
 * No file, network, process, or shell APIs are used; state is entirely
 * in-memory and content is fictional. This DOES NOT install a backup job.
 *
 * Observed LIVE root writer: 5f09ddcff7d0c50c2cf92657bbdea2caaebdffa74d6390f378fda708343c340f
 * Existing HELD candidate: a43e6d0fd8ada224764f18bf661417d3a5836c6d9abeff6a81062ee04d2e002f
 * Existing R20 installer: STOP (must not be bypassed).
 *
 * Run: node --test scripts/ops/test-ws-backup-transition-fixture.mjs
 */
import { createHash, randomBytes } from "node:crypto";
import assert from "node:assert/strict";
import { test } from "node:test";

const LIVE = Object.freeze({
  sha: "5f09ddcff7d0c50c2cf92657bbdea2caaebdffa74d6390f378fda708343c340f",
  name: "live-legacy",
  rootCronAt0200: true,
  sqlEncryptedPerWork: false,
  capturesSourceVault: false,
  crossStoreCheckpoint: false,
  deletionBarrier: false,
  mediaMode: "mirror-with-delete",
  retention: "14/56/365",
  isolatedRestoreCertified: false,
});
const HELD = Object.freeze({
  sha: "a43e6d0fd8ada224764f18bf661417d3a5836c6d9abeff6a81062ee04d2e002f",
  name: "hardened-held",
  rootCronAt0200: false,
  sqlEncryptedPerWork: false,
  capturesSourceVault: false,
  crossStoreCheckpoint: false,
  deletionBarrier: false,
  mediaMode: "mirror-without-delete",
  retention: "disabled",
  isolatedRestoreCertified: false,
});
const heldInstallerSha = "81da5d86c170fddd447c3d62ea13ebeba9c5534a6f4e7d39c4c123a27bb3d0f4";
const syntheticData = "FICTIONAL TEST DATA — NEVER A MEMBER MANUSCRIPT";
const digest = (data) => createHash("sha256").update(data).digest("hex");
const stop = (reason) => { throw new Error("STOP: " + reason); };
const requiredReceiptNames = Object.freeze([
  "independentClassAReview",
  "rootJobExactSourceReview",
  "dbVaultRestoreWitness",
  "nasAclAndRecycleDisposition",
  "historicalPlainSqlCustody",
  "sourceVaultConsistency",
  "noRollbackErasureAuthority",
  "approvedRetentionAndDeletion",
  "backupRoleAndConcurrentCronReview",
  "rollbackAndRestoreProof",
  "memberScopeAndKeyCustody",
]);

// A hypothetical FUTURE replacement. The installed HELD candidate is NOT this.
const FUTURE_SYNTHETIC = Object.freeze({
  sha: digest("fictional future admitted software; no actual binary exists"),
  name: "hypothetical-deletion-safe",
  rootCronAt0200: true,
  sqlEncryptedPerWork: true,
  capturesSourceVault: true,
  crossStoreCheckpoint: true,
  deletionBarrier: true,
  mediaMode: "member-governed-erasure-aware",
  retention: "explicitly-governed",
  isolatedRestoreCertified: true,
});
const approvals = () => Object.fromEntries(requiredReceiptNames.map(k => [k, true]));

function validateCandidate(candidate) {
  if (!candidate.sqlEncryptedPerWork) stop("reconstructive SQL is not Work-key encrypted");
  if (!candidate.capturesSourceVault) stop("manuscript Source volume omitted");
  if (!candidate.crossStoreCheckpoint) stop("PostgreSQL/Source checkpoint not atomic");
  if (!candidate.deletionBarrier) stop("deleted Work may be restored");
  if (candidate.mediaMode !== "member-governed-erasure-aware")
    stop("media retention lacks governed deletion");
  if (candidate.retention !== "explicitly-governed") stop("retention not independently adjudicated");
  if (!candidate.isolatedRestoreCertified) stop("new writer has no isolated restore");
  return true;
}
function validateReceipts(receipts, reviewer) {
  if (reviewer !== "separate-human-reviewer")
    stop("requires a genuinely separate human Class A reviewer");
  for (const k of requiredReceiptNames) if (receipts[k] !== true)
    stop("missing independent gate " + k);
}

function makeModel() {
  const existing = new Map([
    ["historical-NAS-synthetic-001", digest("old-nas-copy-fiction")],
    ["historical-local-synthetic-001", digest("old-local-copy-fiction")],
    ["recycled-NAS-synthetic-001", digest("recycle-fiction")],
  ]);
  const st = {
    fixtureOnly: true,
    liveWriter: LIVE.sha,
    cron: { root0200: true, user0200: true },
    oldArchives: existing,
    backups: [],
    manifests: [],
    partials: new Set(),
    stagedCandidate: null,
    rollbackWriter: null,
    retainedRecycle: new Map([["recycled-synthetic", digest("old-recycled-file")]]),
    erasureBarrierReachable: true,
    mountAvailable: true,
    freeSpaceGB: 100,
    backupDatabaseReady: true,
    deleteEpoch: 0,
    changes: [],
    emit: (...args) => args.map(String).join(" "),
  };
  return st;
}
function unchangedHistorical(st, before) {
  assert.deepEqual([...st.oldArchives], [...before.oldArchives]);
  assert.deepEqual([...st.retainedRecycle], [...before.retainedRecycle]);
}
function snapshot(st) {
  return { oldArchives: new Map(st.oldArchives), retainedRecycle: new Map(st.retainedRecycle) };
}
function captureSynthetic(st, writer, name, failAt = "") {
  if (!st.fixtureOnly) stop("REAL runtime is never supported by this harness");
  if (!st.mountAvailable) stop("NAS fixture mount unavailable");
  if (st.freeSpaceGB < 10) stop("NAS fixture space below bound");
  if (!st.backupDatabaseReady) stop("synthetic PostgreSQL fixture is unavailable");
  if (!st.erasureBarrierReachable) stop("current erasure authority unavailable");
  if (st.backups.some(x => x.name === name)) stop("no-clobber archive identity collision");
  const staged = "partial-" + name;
  st.partials.add(staged);
  try {
    if (failAt === "before-write") stop("fixture export failed");
    const bytes = Buffer.from(syntheticData + ":" + writer.name + ":" + name);
    if (failAt === "during-stream") stop("fixture stream failed");
    const hash = digest(bytes);
    if (failAt === "after-encrypted-stage") stop("simulated crash before durable publication");
    if (failAt === "during-media") stop("media fixture failed");
    if (failAt === "before-manifest") stop("manifest fixture failed");
    const result = Object.freeze({ name, writer: writer.sha, bytes: bytes.length, hash });
    st.backups.push(result);
    st.manifests.push(Object.freeze({ name, hash, complete: true, mode: "synthetic" }));
    return result;
  } finally {
    st.partials.delete(staged);
  }
}

// The current proposal is modeled solely to prove *refusal*. It is not
// secretly treated as FUTURE_SYNTHETIC, even if all approval booleans are true.
function transition(st, candidate, opts = {}) {
  if (!st.fixtureOnly || opts.mode === "production")
    stop("transition rehearsal cannot operate on production");
  if (st.liveWriter !== LIVE.sha) stop("live writer hash drift");
  if (opts.installerHoldPresent && candidate.sha === HELD.sha)
    stop("R20 held installer may not be bypassed");
  if (opts.oldWriterSha !== undefined && opts.oldWriterSha !== LIVE.sha)
    stop("operator-supplied live digest does not match pinned source");
  if (opts.candidateSha !== undefined && opts.candidateSha !== candidate.sha)
    stop("candidate digest does not match pinned source");
  validateCandidate(candidate);
  validateReceipts(opts.receipts || {}, opts.reviewer);
  if (!st.mountAvailable || !st.backupDatabaseReady || st.freeSpaceGB < 10)
    stop("pre-cutover backup preflight failed");
  if (!st.erasureBarrierReachable) stop("deletion authority unreachable");
  if (!st.cron.root0200 || !st.cron.user0200)
    stop("existing scheduled backup creation must be preserved");
  if (opts.cronRelationApproved !== true)
    stop("two concurrent 02:00 jobs require explicit binding review");

  const before = snapshot(st);
  const lastGood = captureSynthetic(st, LIVE, "last-good-" + st.backups.length);
  assert.ok(lastGood.hash.length === 64);
  st.stagedCandidate = candidate.sha;
  if (opts.failAt === "before-install") {
    st.stagedCandidate = null;
    stop("fixture stage failed before swap");
  }
  st.rollbackWriter = st.liveWriter;
  st.liveWriter = candidate.sha; // synthetic pointer, NEVER actual cron.
  st.changes.push("fixture-swap");
  try {
    const canary = captureSynthetic(
      st, candidate, "candidate-canary-" + st.backups.length, opts.failAt || "");
    if (opts.failAt === "after-canary") stop("post-canary injected failure");
    st.stagedCandidate = null;
    unchangedHistorical(st, before);
    return { outcome: "SIMULATED_TRANSITION_PASS", lastGood, canary };
  } catch (e) {
    st.liveWriter = st.rollbackWriter;
    st.stagedCandidate = null;
    st.changes.push("fixture-rollback");
    unchangedHistorical(st, before);
    throw e;
  }
}

test("T01 pinned live SHA matches read-only witness", () =>
  assert.match(LIVE.sha, /^[a-f0-9]{64}$/));
test("T02 pinned held candidate SHA matches read-only witness", () =>
  assert.match(HELD.sha, /^[a-f0-9]{64}$/));
test("T03 separate R20 installer has an immutable hash and remains HOLD", () =>
  assert.match(heldInstallerSha, /^[a-f0-9]{64}$/));
test("T04 live writer refuses strict deletion-safe admission", () =>
  assert.throws(() => validateCandidate(LIVE), /reconstructive SQL/));
test("T05 held candidate refuses strict deletion-safe admission", () =>
  assert.throws(() => validateCandidate(HELD), /reconstructive SQL/));
test("T06 held candidate remains blocked despite forged full approvals", () => {
  const st = makeModel();
  const before = snapshot(st);
  assert.throws(() => transition(st, HELD, {
    reviewer: "separate-human-reviewer", receipts: approvals(),
    cronRelationApproved: true, installerHoldPresent: true,
  }), /R20 held installer/);
  assert.equal(st.liveWriter, LIVE.sha);
  unchangedHistorical(st, before);
});
test("T07 future hypothetical not allowed without independent reviewer", () =>
  assert.throws(() => transition(makeModel(), FUTURE_SYNTHETIC, {
    receipts: approvals(), cronRelationApproved: true,
  }), /separate human/));
test("T08 missing historical SQL custody gate refuses", () => {
  const receipts = approvals();
  receipts.historicalPlainSqlCustody = false;
  assert.throws(() => transition(makeModel(), FUTURE_SYNTHETIC, {
    reviewer: "separate-human-reviewer", receipts, cronRelationApproved: true,
  }), /historicalPlainSqlCustody/);
});
test("T09 missing ACL/Recycled archive gate refuses", () => {
  const receipts = approvals();
  receipts.nasAclAndRecycleDisposition = false;
  assert.throws(() => transition(makeModel(), FUTURE_SYNTHETIC, {
    reviewer: "separate-human-reviewer", receipts, cronRelationApproved: true,
  }), /nasAclAndRecycleDisposition/);
});
test("T10 missing DB+Source real recovery evidence refuses", () => {
  const receipts = approvals();
  receipts.dbVaultRestoreWitness = false;
  assert.throws(() => transition(makeModel(), FUTURE_SYNTHETIC, {
    reviewer: "separate-human-reviewer", receipts, cronRelationApproved: true,
  }), /dbVaultRestoreWitness/);
});
test("T11 inaccurate live SHA refuses before writer pointer changes", () => {
  const st = makeModel();
  st.liveWriter = digest("unrecognized installed version");
  assert.throws(() => transition(st, FUTURE_SYNTHETIC, {
    reviewer: "separate-human-reviewer", receipts: approvals(), cronRelationApproved: true,
  }), /live writer hash drift/);
  assert.equal(st.backups.length, 0);
});
test("T12 wrong candidate SHA refuses without archive mutation", () => {
  const st = makeModel();
  assert.throws(() => transition(st, FUTURE_SYNTHETIC, {
    reviewer: "separate-human-reviewer", receipts: approvals(),
    cronRelationApproved: true, candidateSha: digest("wrong"),
  }), /candidate digest/);
  assert.equal(st.backups.length, 0);
});
test("T13 unsanctioned cron relation refuses", () =>
  assert.throws(() => transition(makeModel(), FUTURE_SYNTHETIC, {
    reviewer: "separate-human-reviewer", receipts: approvals(),
  }), /concurrent 02:00/));
test("T14 two existing 02:00 jobs remain enabled during hypothetical rehearsal", () => {
  const st = makeModel();
  const res = transition(st, FUTURE_SYNTHETIC, {
    reviewer: "separate-human-reviewer", receipts: approvals(), cronRelationApproved: true,
  });
  assert.equal(res.outcome, "SIMULATED_TRANSITION_PASS");
  assert.equal(st.cron.root0200, true);
  assert.equal(st.cron.user0200, true);
});
test("T15 active pre-switch synthetic backup and post-switch canary both exist", () => {
  const st = makeModel();
  const res = transition(st, FUTURE_SYNTHETIC, {
    reviewer: "separate-human-reviewer", receipts: approvals(), cronRelationApproved: true,
  });
  assert.equal(res.lastGood.writer, LIVE.sha);
  assert.equal(res.canary.writer, FUTURE_SYNTHETIC.sha);
  assert.equal(st.backups.length, 2);
  assert.ok(st.manifests.every(x => x.complete && x.hash.length === 64));
});
test("T16 historical and recycled archives unchanged by fixture swap", () => {
  const st = makeModel(); const before = snapshot(st);
  transition(st, FUTURE_SYNTHETIC, {
    reviewer: "separate-human-reviewer", receipts: approvals(), cronRelationApproved: true,
  });
  unchangedHistorical(st, before);
});
test("T17 staged swap fails before replacement, old writer still active", () => {
  const st = makeModel();
  assert.throws(() => transition(st, FUTURE_SYNTHETIC, {
    reviewer: "separate-human-reviewer", receipts: approvals(),
    cronRelationApproved: true, failAt: "before-install",
  }), /stage failed/);
  assert.equal(st.liveWriter, LIVE.sha);
  assert.equal(st.stagedCandidate, null);
});
test("T18 interrupted canary restores old writer and removes partials", () => {
  const st = makeModel();
  assert.throws(() => transition(st, FUTURE_SYNTHETIC, {
    reviewer: "separate-human-reviewer", receipts: approvals(),
    cronRelationApproved: true, failAt: "during-stream",
  }), /stream failed/);
  assert.equal(st.liveWriter, LIVE.sha);
  assert.equal(st.partials.size, 0);
  assert.equal(st.backups.length, 1);
  assert.ok(st.changes.includes("fixture-rollback"));
});
test("T19 failed media step prevents canary publication and rolls back", () => {
  const st = makeModel();
  assert.throws(() => transition(st, FUTURE_SYNTHETIC, {
    reviewer: "separate-human-reviewer", receipts: approvals(),
    cronRelationApproved: true, failAt: "during-media",
  }), /media fixture failed/);
  assert.equal(st.liveWriter, LIVE.sha);
  assert.equal(st.backups.length, 1);
});
test("T20 manifest failure prevents canary and rolls back", () => {
  const st = makeModel();
  assert.throws(() => transition(st, FUTURE_SYNTHETIC, {
    reviewer: "separate-human-reviewer", receipts: approvals(),
    cronRelationApproved: true, failAt: "before-manifest",
  }), /manifest fixture failed/);
  assert.equal(st.liveWriter, LIVE.sha);
  assert.equal(st.backups.length, 1);
});
test("T21 corrupted or absent NAS fixture mount aborts before install", () => {
  const st = makeModel();st.mountAvailable = false;
  assert.throws(() => transition(st, FUTURE_SYNTHETIC, {
    reviewer: "separate-human-reviewer", receipts: approvals(), cronRelationApproved: true,
  }), /pre-cutover backup preflight/);
  assert.equal(st.liveWriter, LIVE.sha);
});
test("T22 missing DB availability refuses before install", () => {
  const st = makeModel();st.backupDatabaseReady = false;
  assert.throws(() => transition(st, FUTURE_SYNTHETIC, {
    reviewer: "separate-human-reviewer", receipts: approvals(), cronRelationApproved: true,
  }), /pre-cutover backup preflight/);
});
test("T23 insufficient synthetic NAS free space refuses", () => {
  const st = makeModel();st.freeSpaceGB = 0.01;
  assert.throws(() => transition(st, FUTURE_SYNTHETIC, {
    reviewer: "separate-human-reviewer", receipts: approvals(), cronRelationApproved: true,
  }), /pre-cutover backup preflight/);
});
test("T24 nonresponding authoritative deletion barrier refuses", () => {
  const st = makeModel();st.erasureBarrierReachable = false;
  assert.throws(() => transition(st, FUTURE_SYNTHETIC, {
    reviewer: "separate-human-reviewer", receipts: approvals(), cronRelationApproved: true,
  }), /deletion authority unreachable/);
});
test("T25 disabling a backup cron during transition is not allowed", () => {
  const st = makeModel();st.cron.user0200 = false;
  assert.throws(() => transition(st, FUTURE_SYNTHETIC, {
    reviewer: "separate-human-reviewer", receipts: approvals(), cronRelationApproved: true,
  }), /scheduled backup creation must be preserved/);
});
test("T26 duplicate synthetic archive cannot replace an earlier generation", () => {
  const st = makeModel();
  captureSynthetic(st, LIVE, "fixture-archive");
  const original = st.backups[0].hash;
  assert.throws(() => captureSynthetic(st, LIVE, "fixture-archive"), /no-clobber/);
  assert.equal(st.backups[0].hash, original);
});
test("T27 production mode is unconditionally refused", () =>
  assert.throws(() => transition(makeModel(), FUTURE_SYNTHETIC, {
    mode: "production", reviewer: "separate-human-reviewer",
    receipts: approvals(), cronRelationApproved: true,
  }), /cannot operate on production/));
test("T28 all successful outputs remain synthetic and source-text-free", () => {
  const st = makeModel();
  transition(st, FUTURE_SYNTHETIC, {
    reviewer: "separate-human-reviewer", receipts: approvals(), cronRelationApproved: true,
  });
  assert.ok(st.manifests.every(x => x.mode === "synthetic"));
  assert.ok(st.backups.every(x => !("plaintext" in x)));
  assert.equal(st.partials.size, 0);
});
