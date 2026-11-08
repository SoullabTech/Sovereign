// node --test scripts/ops/check-r20-host-prerequisites.test.mjs
//
// Falsifiers for scripts/ops/check-r20-host-prerequisites.sh, the host preflight for the R20 deletion ledger (it changes nothing that persists; its one write is a probe file it creates and removes).
// Fictional data and temp directories only: every fixture lives under os.tmpdir() and is removed in `finally`. Nothing here
// touches a real host path, a docker daemon or the network.
//
// Lethality first (the repo's lane discipline). For EVERY required check there is
//   (1) a bad fixture on which the unmutated script reports that check `false`, and
//   (2) a MUTANT of the script in which exactly that one `check <id> ...` line is replaced by `check <id> true`, run against the
//       same fixture. The mutant must report the check `true`, and the set of non-true checks must shrink by exactly that id.
//       That proves the fixture is what discriminates and the check is what kills; a check that cannot be killed is not a check.
// Cases that need another uid's files (chown) or a uid drop need root and are skipped, by name, for an ordinary user; the suite
// passes as root and as an ordinary user. The expectations that differ between the two are written down, not loosened.
//
// Every run, whatever its outcome, is also held to the output discipline: stdout+stderr contain neither the fixture path, its
// base name (which is in every file name too), nor any 8+ character window of the key content; every stdout line has the
// `<id> <state>` shape; the fixture tree is byte-for-byte unchanged afterwards (the probe file is created and removed).
import { test as nodeTest, after } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

// The script is a Linux host tool: it needs bash 4+ and GNU coreutils and REFUSES (exit 2) without them. `npm run preflight` is
// also run on developer machines (macOS: BSD stat, bash 3.2), where this suite could only report the refusal. So off Linux, and
// only when those tools are really absent, every test is SKIPPED with that reason (a skip is visible, not a pass). On Linux
// there is no such escape: missing GNU tools there is a broken runner and the suite fails loudly instead of going quiet.
const PLATFORM_PROBE = spawnSync("bash", ["-c", 'stat --version 2>/dev/null | head -n 1; printf "bash=%s\\n" "${BASH_VERSINFO[0]}"'], { encoding: "utf8" });
const PLATFORM_HAS_TOOLS = !PLATFORM_PROBE.error && /GNU coreutils/.test(PLATFORM_PROBE.stdout) && Number((/bash=(\d+)/.exec(PLATFORM_PROBE.stdout) ?? [])[1]) >= 4;
const SKIP_PLATFORM = PLATFORM_HAS_TOOLS || process.platform === "linux" ? false : "needs bash 4+ and GNU coreutils (a Linux host tool; the script refuses without them)";
const test = (name, opts, fn) => {
  if (typeof opts === "function") [opts, fn] = [{}, opts];
  nodeTest(name, { ...opts, skip: opts.skip || SKIP_PLATFORM }, fn);
};

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT = path.join(HERE, "check-r20-host-prerequisites.sh");
const MODULE_SRC = path.resolve(HERE, "..", "..", "lib", "recovery", "r20DeletionLedger.ts");
const SCRIPT_TEXT = fs.readFileSync(SCRIPT, "utf8");

const UID = process.getuid();
const IS_ROOT = UID === 0;
const FOREIGN_UID = 40001; // fictional: no such user is needed to own a file
const DROP_UID = 40002; // fictional
const NEEDS_ROOT = IS_ROOT ? false : "needs root to create another uid's files or to drop to another uid";

const REQUIRED = [
  "ledger_dir_same_as_high_water_dir",
  "dir_exists",
  "dir_not_symlink",
  "dir_is_directory",
  "dir_owner_uid_ok",
  "dir_mode_ok",
  "dir_probe_write",
  "ledger_pair_state_ok",
  "ledger_files_owner_ok",
  "key_exists",
  "key_not_symlink",
  "key_is_regular",
  "key_owner_uid_ok",
  "key_mode_ok",
  "key_form_ok",
  "key_not_inside_authority_dir",
  "key_not_ledger_file",
];
const ADVISORY = ["authority_dir_under_docker_data_root", "key_under_docker_data_root"];
// The values of the two state lines. The parser, the usage text and the script's own assignments are held to this list.
const PAIR_STATES = ["both_absent", "both_present", "one_present", "wrong_kind", "UNKNOWN"];
const KEY_FORMS = ["hex64", "base64_43", "raw32", "invalid", "UNKNOWN"];

// ---------------------------------------------------------------- tool dir ---
// A world-readable copy of the script and of every mutant, so a process dropped to another uid can read them.
const TOOLS = fs.mkdtempSync(path.join(os.tmpdir(), "r20pf-tools-"));
fs.chmodSync(TOOLS, 0o755);
const writeTool = (name, text) => {
  const file = path.join(TOOLS, name);
  fs.writeFileSync(file, text, { mode: 0o755 });
  fs.chmodSync(file, 0o755);
  return file;
};
const ORIG_COPY = writeTool("original.sh", SCRIPT_TEXT);
const cleanTools = () => fs.rmSync(TOOLS, { recursive: true, force: true });
after(cleanTools);
process.on("exit", cleanTools);

// ---------------------------------------------------------------- fixtures ---
const forceRemove = (p) => {
  const open = (q) => {
    try {
      const st = fs.lstatSync(q);
      if (st.isDirectory()) {
        fs.chmodSync(q, 0o700);
        for (const n of fs.readdirSync(q)) open(path.join(q, n));
      }
    } catch {
      /* best effort: the rm below reports what is left */
    }
  };
  open(p);
  fs.rmSync(p, { recursive: true, force: true });
};

const hex32 = () => crypto.randomBytes(32).toString("hex");

function makeFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), `r20pf-${crypto.randomBytes(6).toString("hex")}-`));
  const token = path.basename(root); // unique; appears in every path below, so scanning for it covers file names too
  const dir = path.join(root, `auth-${token}`);
  const keyDir = path.join(root, `keys-${token}`);
  for (const d of [dir, keyDir]) {
    fs.mkdirSync(d, { mode: 0o700 });
    fs.chmodSync(d, 0o700);
  }
  const fx = {
    root,
    token,
    dir,
    keyDir,
    ledger: path.join(dir, `L-${token}.json`),
    hw: path.join(dir, `H-${token}.json`),
    key: path.join(keyDir, `K-${token}.key`),
    keyContent: Buffer.alloc(0),
    expectUid: String(UID),
  };
  setKey(fx, Buffer.from(`${hex32()}\n`, "latin1"));
  return fx;
}
function setKey(fx, buf, mode = 0o600) {
  fs.rmSync(fx.key, { recursive: true, force: true });
  fs.writeFileSync(fx.key, buf, { mode });
  fs.chmodSync(fx.key, mode);
  fx.keyContent = buf;
}
const writeFile = (file, text = "{}\n", mode = 0o600) => {
  fs.writeFileSync(file, text, { mode });
  fs.chmodSync(file, mode);
};
const writePair = (fx) => {
  writeFile(fx.ledger);
  writeFile(fx.hw);
};
function withFixture(fn) {
  const fx = makeFixture();
  try {
    return fn(fx);
  } finally {
    forceRemove(fx.root);
  }
}

/** Name, mode, owner, size and content digest of everything below `root` (directory mtimes deliberately excluded). */
function snapshot(root) {
  const out = [];
  const walk = (p) => {
    const st = fs.lstatSync(p);
    const rel = path.relative(root, p) || ".";
    const mode = (st.mode & 0o7777).toString(8);
    if (st.isSymbolicLink()) out.push(`l ${rel} ${fs.readlinkSync(p)}`);
    else if (st.isDirectory()) {
      out.push(`d ${rel} ${mode} ${st.uid}`);
      let names = [];
      try {
        names = fs.readdirSync(p).sort();
      } catch {
        out.push(`? ${rel}`);
      }
      for (const n of names) walk(path.join(p, n));
    } else if (!st.isFile()) {
      // a FIFO or a socket: never opened (opening a FIFO without a writer would block), only its kind, mode and owner
      out.push(`o ${rel} ${mode} ${st.uid} ${st.isFIFO() ? "fifo" : st.isSocket() ? "socket" : "other"}`);
    } else {
      let digest = "unreadable";
      try {
        digest = crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex");
      } catch {
        /* a mode-0200 file read by an ordinary user */
      }
      out.push(`f ${rel} ${mode} ${st.uid} ${st.size} ${digest}`);
    }
  };
  walk(root);
  return out.join("\n");
}

// -------------------------------------------------------------- the runner ---
const windows = (buf, n = 8) => {
  const s = buf.toString("latin1");
  const w = new Set();
  for (let i = 0; i + n <= s.length; i++) w.add(s.slice(i, i + n));
  return [...w];
};

const LINE_SHAPE = new RegExp(`^([a-z0-9_]+) (${[...new Set(["true", "false", ...PAIR_STATES, ...KEY_FORMS])].join("|")})$`);

function parse(raw) {
  const text = raw.stdout;
  const lines = text === "" ? [] : text.replace(/\n$/, "").split("\n");
  const states = {};
  const info = {};
  let result = null;
  lines.forEach((l, i) => {
    const r = /^r20_host_preflight result=(PASS|FAIL|UNKNOWN)$/.exec(l);
    if (r) {
      assert.equal(i, lines.length - 1, "the result line must be last");
      result = r[1];
      return;
    }
    const m = LINE_SHAPE.exec(l);
    assert.ok(m, `stdout line ${i} does not have the '<id> <state>' shape:\n${text}`);
    if (m[1] === "ledger_pair_state") {
      assert.ok(PAIR_STATES.includes(m[2]), `ledger_pair_state has a value outside the vocabulary: ${m[2]}`);
      assert.equal(info.pair, undefined, "duplicate ledger_pair_state line");
      info.pair = m[2];
    } else if (m[1] === "key_form") {
      assert.ok(KEY_FORMS.includes(m[2]), `key_form has a value outside the vocabulary: ${m[2]}`);
      assert.equal(info.keyForm, undefined, "duplicate key_form line");
      info.keyForm = m[2];
    } else {
      assert.ok(["true", "false", "UNKNOWN"].includes(m[2]), `a check or advisory line has a state outside true|false|UNKNOWN: ${l}`);
      assert.equal(states[m[1]], undefined, `duplicate line for ${m[1]}`);
      states[m[1]] = m[2];
    }
  });
  return { status: raw.status, stdout: raw.stdout, stderr: raw.stderr, states, info, result };
}
const dump = (p) => `exit ${p.status}\n${p.stdout}${p.stderr ? `[stderr]\n${p.stderr}` : ""}`;

function runRaw(args, { script = SCRIPT, uid, gid, cwd = os.tmpdir(), pathPrefix } = {}) {
  const r = spawnSync("bash", [script, ...args], {
    encoding: "latin1",
    env: { PATH: pathPrefix ? `${pathPrefix}:${process.env.PATH}` : process.env.PATH },
    uid,
    gid,
    cwd,
    timeout: 60_000,
    maxBuffer: 1 << 20,
  });
  assert.ifError(r.error);
  assert.equal(r.signal, null);
  return r;
}

function assertNoLeak(raw, forbid, ctx) {
  const all = raw.stdout + raw.stderr;
  for (const f of forbid) {
    if (f && all.includes(f)) assert.fail(`${ctx}: the output contains a forbidden string of length ${f.length}`);
  }
}

const std = (fx, over = {}) => [
  "--ledger", over.ledger ?? fx.ledger,
  "--high-water", over.hw ?? fx.hw,
  "--key-file", over.key ?? fx.key,
  "--expect-uid", over.expectUid ?? fx.expectUid,
];

// A pre-existing file (or dangling symlink) with the probe's EXACT name '.r20-preflight-probe.<pid>'. The pid is only known
// once the process exists, so the launcher plants it from inside the process that then `exec`s the script: exec keeps the pid,
// so the script's own `$$` is the number in the planted name.
const LAUNCH = [
  'p="$1/.r20-preflight-probe.$$"',
  'if [ "$2" = file ]; then printf %s "$3" > "$p"; else ln -s -- "$3" "$p"; fi',
  "shift 3",
  'exec bash "$@"',
].join("\n");
const PLANTED_CONTENT = "a leftover that is not the preflight's own\n";
const PROBE_NAME = /^\.r20-preflight-probe\.\d+$/;
const plantedTarget = (fx) => path.join(fx.root, `planted-target-${fx.token}`);

function runLaunched(fx, launch, args, { script = SCRIPT, cwd = os.tmpdir() } = {}) {
  const payload = launch.kind === "file" ? PLANTED_CONTENT : plantedTarget(fx);
  const r = spawnSync("bash", ["-c", LAUNCH, "r20pf-launch", fx.dir, launch.kind, payload, script, ...args], {
    encoding: "latin1",
    env: { PATH: process.env.PATH },
    cwd,
    timeout: 60_000,
    maxBuffer: 1 << 20,
  });
  assert.ifError(r.error);
  assert.equal(r.signal, null);
  return r;
}

/** After a launched run: is the planted artefact still exactly as planted? It is then removed, so the tree can be compared. */
function settlePlanted(fx, launch) {
  const names = fs.readdirSync(fx.dir).filter((n) => PROBE_NAME.test(n));
  if (names.length !== 1) return false; // gone (the probe removed it), or a second probe-named file was left behind
  const f = path.join(fx.dir, names[0]);
  const st = fs.lstatSync(f);
  const intact =
    launch.kind === "file"
      ? st.isFile() && fs.readFileSync(f, "latin1") === PLANTED_CONTENT
      : st.isSymbolicLink() && fs.readlinkSync(f) === plantedTarget(fx) && !fs.existsSync(plantedTarget(fx));
  fs.rmSync(f, { force: true });
  return intact;
}

/**
 * Run once and report, without judging the tree: the output discipline is still enforced, but a changed tree is returned as
 * `treeChanged` so that a mutant (which is allowed to misbehave) can be examined, while a real run is held to "unchanged".
 */
function observe(fx, args, opts = {}) {
  const { launch, ...runOpts } = opts;
  const before = snapshot(fx.root);
  const raw = launch ? runLaunched(fx, launch, args, runOpts) : runRaw(args, runOpts);
  const p = parse(raw);
  assertNoLeak(raw, [fx.root, fx.token, ...windows(fx.keyContent), ...args.filter((a) => a.length >= 8 && a.includes(fx.token))], "output discipline");
  const intact = launch ? settlePlanted(fx, launch) : true;
  return { p, treeChanged: !intact || snapshot(fx.root) !== before };
}

/** Run against a fixture: no leak, no change to the tree, every stdout line well formed. */
function runFx(fx, args, opts = {}) {
  const r = observe(fx, args, opts);
  assert.equal(r.treeChanged, false, "the run changed the fixture tree");
  return r.p;
}

const verdict = (nonTrue) => {
  const v = Object.values(nonTrue);
  if (v.includes("false")) return { result: "FAIL", status: 1 };
  if (v.includes("UNKNOWN")) return { result: "UNKNOWN", status: 3 };
  return { result: "PASS", status: 0 };
};

function assertCase(p, nonTrue, info = {}, what = "") {
  const want = {};
  for (const id of REQUIRED) want[id] = nonTrue[id] ?? "true";
  const got = {};
  for (const id of REQUIRED) got[id] = p.states[id];
  assert.deepEqual(got, want, `${what}\n${dump(p)}`);
  assert.deepEqual(Object.keys(p.states).sort(), [...REQUIRED, ...ADVISORY].sort(), `${what}: unexpected set of ids`);
  const v = verdict(nonTrue);
  assert.equal(p.result, v.result, `${what}\n${dump(p)}`);
  assert.equal(p.status, v.status, `${what}\n${dump(p)}`);
  assert.equal(p.stderr, "", `${what}: stderr must be empty on a run`);
  if (info.pair !== undefined) assert.equal(p.info.pair, info.pair, `${what}: ledger_pair_state`);
  if (info.keyForm !== undefined) assert.equal(p.info.keyForm, info.keyForm, `${what}: key_form`);
}

// ----------------------------------------------------------- the case table ---
const dirChecksUnknown = (extra = {}) => ({
  dir_not_symlink: "UNKNOWN",
  dir_is_directory: "UNKNOWN",
  dir_owner_uid_ok: "UNKNOWN",
  dir_mode_ok: "UNKNOWN",
  dir_probe_write: "UNKNOWN",
  ...extra,
});
const keyChecksUnknown = (extra = {}) => ({
  key_not_symlink: "UNKNOWN",
  key_is_regular: "UNKNOWN",
  key_owner_uid_ok: "UNKNOWN",
  key_mode_ok: "UNKNOWN",
  key_form_ok: "UNKNOWN",
  ...extra,
});
const ownerMismatch = String(UID + 1);

// Objects owned by uid X and gid Y with X != Y, so that "the owner's uid" and "the owner's gid" are different numbers. As root
// they are given away with chown. An ordinary user cannot chown, but files it creates carry its own uid and gid, which differ
// on most real accounts (a CI runner is typically uid 1001, gid 127); where they do not, the case is skipped, by name.
const SPLIT = IS_ROOT ? { uid: FOREIGN_UID, gid: DROP_UID, chown: true } : { uid: UID, gid: process.getegid(), chown: false };
const NEEDS_SPLIT = SPLIT.uid !== SPLIT.gid ? false : "needs root, or an invoking uid that differs from its own gid";
function giveSplitOwner(fx) {
  writePair(fx);
  for (const p of [fx.dir, fx.key, fx.ledger, fx.hw]) {
    if (SPLIT.chown) fs.chownSync(p, SPLIT.uid, SPLIT.gid);
    const st = fs.statSync(p);
    assert.equal(`${st.uid}:${st.gid}`, `${SPLIT.uid}:${SPLIT.gid}`, "SETUP: a fixture object does not carry the intended uid:gid");
  }
}

function makeFifo(file) {
  const r = spawnSync("mkfifo", ["-m", "600", "--", file], { encoding: "latin1" });
  assert.equal(r.status, 0, "SETUP: mkfifo failed");
  assert.ok(fs.lstatSync(file).isFIFO());
}
// A socket file is a bind() without a listener left running. The bind uses a RELATIVE name from inside the directory, because a
// unix socket path is capped near 108 bytes and a long temp directory would otherwise refuse the fixture.
function makeSocket(file) {
  const r = spawnSync(process.execPath, ["-e", "require('node:net').createServer().listen(process.argv[1], () => process.exit(0))", path.basename(file)], {
    cwd: path.dirname(file),
    encoding: "latin1",
    timeout: 20_000,
  });
  assert.equal(r.status, 0, "SETUP: creating the socket file failed");
  assert.ok(fs.lstatSync(file).isSocket());
}
const makeDir = (p) => {
  fs.mkdirSync(p, { mode: 0o700 });
  fs.chmodSync(p, 0o700);
};
const elsewhere = (fx, name) => path.join(fx.root, `${name}-${fx.token}.json`); // outside the authority directory

// As an ordinary owner a directory without the search bit hides its own contents, so the pair state is not determinable.
const noSearchDir = () =>
  IS_ROOT
    ? { nonTrue: { dir_mode_ok: "false" }, info: { pair: "both_absent" } }
    : {
        nonTrue: { dir_mode_ok: "false", dir_probe_write: "false", ledger_pair_state_ok: "UNKNOWN", ledger_files_owner_ok: "UNKNOWN" },
        info: { pair: "UNKNOWN" },
      };

/**
 * name      what the fixture is
 * setup     builds the bad fixture from the conforming one
 * nonTrue   every required check that is not `true`, with its state (all others must be `true`)
 * info      expected ledger_pair_state / key_form lines
 * rootOnly  skipped for an ordinary user
 * skip      a reason string that skips the case (for conditions other than root)
 * runOpts   { uid, gid, cwd, useCopy } for runs that must drop to another uid
 * launch    { kind: "file" | "dangling-symlink" }: run through the launcher that plants a probe-named leftover first
 */
const CASES = [
  { name: "conforming fixture", nonTrue: {}, info: { pair: "both_absent", keyForm: "hex64" } },
  {
    name: "missing directory",
    setup: (fx) => fs.rmSync(fx.dir, { recursive: true }),
    nonTrue: { dir_exists: "false", ...dirChecksUnknown() },
  },
  {
    name: "directory is a regular file",
    setup: (fx) => {
      fs.rmSync(fx.dir, { recursive: true });
      writeFile(fx.dir, "x", 0o700);
    },
    nonTrue: { dir_is_directory: "false", dir_probe_write: "UNKNOWN" },
  },
  {
    name: "directory is a symlink to a real directory",
    setup: (fx) => {
      const real = path.join(fx.root, `real-${fx.token}`);
      fs.mkdirSync(real, { mode: 0o700 });
      fs.chmodSync(real, 0o700);
      fs.rmSync(fx.dir, { recursive: true });
      fs.symlinkSync(real, fx.dir);
    },
    nonTrue: { dir_not_symlink: "false" },
  },
  { name: "directory group-writable (0770)", setup: (fx) => fs.chmodSync(fx.dir, 0o770), nonTrue: { dir_mode_ok: "false" } },
  { name: "directory other-writable (0702)", setup: (fx) => fs.chmodSync(fx.dir, 0o702), nonTrue: { dir_mode_ok: "false" } },
  {
    name: "directory without owner write (0500)",
    setup: (fx) => fs.chmodSync(fx.dir, 0o500),
    // root writes regardless of mode; an ordinary owner cannot, and the probe then says so
    nonTrue: IS_ROOT ? { dir_mode_ok: "false" } : { dir_mode_ok: "false", dir_probe_write: "false" },
  },
  {
    // The owner can read and write the directory but not search it: no entry in it can be reached, so it cannot be the
    // authority directory. Only the owner's search bit separates this from a conforming 0700.
    name: "directory mode 0600 (owner cannot search)",
    setup: (fx) => fs.chmodSync(fx.dir, 0o600),
    ...noSearchDir(),
  },
  { name: "directory mode 0000", setup: (fx) => fs.chmodSync(fx.dir, 0o000), ...noSearchDir() },
  {
    name: "expected uid is not the owner (uid + 1)",
    setup: () => {},
    expectUid: ownerMismatch,
    nonTrue: { dir_owner_uid_ok: "false", key_owner_uid_ok: "false", dir_probe_write: "UNKNOWN" },
  },
  {
    name: "expected uid is not the owner (uid + 1), both ledger files present",
    setup: (fx) => writePair(fx),
    expectUid: ownerMismatch,
    nonTrue: { dir_owner_uid_ok: "false", ledger_files_owner_ok: "false", key_owner_uid_ok: "false", dir_probe_write: "UNKNOWN" },
    info: { pair: "both_present" },
  },
  {
    name: "invoking uid differs from the expected uid, otherwise conforming",
    rootOnly: true,
    setup: (fx) => {
      for (const p of [fx.dir, fx.key]) fs.chownSync(p, FOREIGN_UID, FOREIGN_UID);
      fx.expectUid = String(FOREIGN_UID);
    },
    nonTrue: { dir_probe_write: "UNKNOWN" },
  },
  {
    name: "directory owned by another uid, expected uid is the invoker",
    rootOnly: true,
    setup: (fx) => fs.chownSync(fx.dir, FOREIGN_UID, FOREIGN_UID),
    nonTrue: { dir_owner_uid_ok: "false" },
  },
  {
    name: "ledger file owned by another uid",
    rootOnly: true,
    setup: (fx) => {
      writePair(fx);
      fs.chownSync(fx.ledger, FOREIGN_UID, FOREIGN_UID);
    },
    nonTrue: { ledger_files_owner_ok: "false" },
    info: { pair: "both_present" },
  },
  {
    name: "high-water file owned by another uid",
    rootOnly: true,
    setup: (fx) => {
      writePair(fx);
      fs.chownSync(fx.hw, FOREIGN_UID, FOREIGN_UID);
    },
    nonTrue: { ledger_files_owner_ok: "false" },
    info: { pair: "both_present" },
  },
  {
    name: "key owned by another uid",
    rootOnly: true,
    setup: (fx) => fs.chownSync(fx.key, FOREIGN_UID, FOREIGN_UID),
    nonTrue: { key_owner_uid_ok: "false" },
  },
  {
    // The invoker (a dropped uid) IS the expected uid, the directory is owned by someone else with a mode that passes the
    // mode check, so only a real write attempt can tell. This is the fixture that makes dir_probe_write lethal.
    name: "directory not writable by the expected uid (the probe really fails)",
    rootOnly: true,
    setup: (fx) => {
      for (const p of [fx.root, fx.keyDir, fx.dir]) fs.chmodSync(p, 0o755);
      fs.chownSync(fx.dir, FOREIGN_UID, FOREIGN_UID);
      fs.chownSync(fx.key, DROP_UID, DROP_UID);
      fx.expectUid = String(DROP_UID);
    },
    runOpts: (fx) => ({ uid: DROP_UID, gid: DROP_UID, cwd: fx.root, useCopy: true }),
    nonTrue: { dir_owner_uid_ok: "false", dir_probe_write: "false" },
  },
  {
    name: "only the ledger file present",
    setup: (fx) => writeFile(fx.ledger),
    nonTrue: { ledger_pair_state_ok: "false" },
    info: { pair: "one_present" },
  },
  {
    name: "only the high-water file present",
    setup: (fx) => writeFile(fx.hw),
    nonTrue: { ledger_pair_state_ok: "false" },
    info: { pair: "one_present" },
  },
  { name: "both ledger files present", setup: (fx) => writePair(fx), nonTrue: {}, info: { pair: "both_present" } },
  // ---- an existing pair member of the wrong KIND is never a clean pair (R5). Every one of these reads wrong_kind and fails
  // ledger_pair_state_ok; the owner check still follows the path (stat -L) and finds the fixture's own uid.
  {
    name: "ledger path is a directory, high-water is a regular file",
    setup: (fx) => {
      makeDir(fx.ledger);
      writeFile(fx.hw);
    },
    nonTrue: { ledger_pair_state_ok: "false" },
    info: { pair: "wrong_kind" },
  },
  {
    name: "high-water path is a directory, ledger is a regular file",
    setup: (fx) => {
      writeFile(fx.ledger);
      makeDir(fx.hw);
    },
    nonTrue: { ledger_pair_state_ok: "false" },
    info: { pair: "wrong_kind" },
  },
  {
    // wrong kind outranks one_present: the more specific finding is the one reported
    name: "ledger path is a directory, high-water is absent",
    setup: (fx) => makeDir(fx.ledger),
    nonTrue: { ledger_pair_state_ok: "false" },
    info: { pair: "wrong_kind" },
  },
  {
    name: "ledger and high-water paths are both directories",
    setup: (fx) => {
      makeDir(fx.ledger);
      makeDir(fx.hw);
    },
    nonTrue: { ledger_pair_state_ok: "false" },
    info: { pair: "wrong_kind" },
  },
  {
    name: "ledger is a symlink to a regular file elsewhere, high-water is a regular file",
    setup: (fx) => {
      const real = elsewhere(fx, "real-ledger");
      writeFile(real);
      fs.symlinkSync(real, fx.ledger);
      writeFile(fx.hw);
    },
    nonTrue: { ledger_pair_state_ok: "false" },
    info: { pair: "wrong_kind" },
  },
  {
    name: "high-water is a symlink to a regular file elsewhere, ledger is a regular file",
    setup: (fx) => {
      const real = elsewhere(fx, "real-high-water");
      writeFile(real);
      writeFile(fx.ledger);
      fs.symlinkSync(real, fx.hw);
    },
    nonTrue: { ledger_pair_state_ok: "false" },
    info: { pair: "wrong_kind" },
  },
  {
    name: "ledger is a FIFO, high-water is a regular file",
    setup: (fx) => {
      makeFifo(fx.ledger);
      writeFile(fx.hw);
    },
    nonTrue: { ledger_pair_state_ok: "false" },
    info: { pair: "wrong_kind" },
  },
  {
    name: "high-water is a socket, ledger is a regular file",
    setup: (fx) => {
      writeFile(fx.ledger);
      makeSocket(fx.hw);
    },
    nonTrue: { ledger_pair_state_ok: "false" },
    info: { pair: "wrong_kind" },
  },
  // A symlink that leads nowhere does not exist as far as existsSync() is concerned: it stays one_present, as before.
  {
    name: "ledger is a dangling symlink, high-water is a regular file",
    setup: (fx) => {
      fs.symlinkSync(elsewhere(fx, "nowhere"), fx.ledger);
      writeFile(fx.hw);
    },
    nonTrue: { ledger_pair_state_ok: "false" },
    info: { pair: "one_present" },
  },
  {
    name: "high-water is a dangling symlink, ledger is a regular file",
    setup: (fx) => {
      writeFile(fx.ledger);
      fs.symlinkSync(elsewhere(fx, "nowhere"), fx.hw);
    },
    nonTrue: { ledger_pair_state_ok: "false" },
    info: { pair: "one_present" },
  },
  // ---- owner checks read the owner's uid, not its gid. The same objects (uid X, gid Y, X != Y) are checked in both directions.
  {
    // wrong uid, right gid: the expected uid equals the objects' GID. A check that read the gid would call this right.
    name: "owner uid is wrong but owner gid equals the expected uid",
    skip: NEEDS_SPLIT,
    setup: (fx) => giveSplitOwner(fx),
    expectUid: String(SPLIT.gid),
    nonTrue: { dir_owner_uid_ok: "false", ledger_files_owner_ok: "false", key_owner_uid_ok: "false", dir_probe_write: "UNKNOWN" },
    info: { pair: "both_present" },
  },
  {
    // right uid, wrong gid: the expected uid equals the objects' UID. A check that read the gid would call this wrong.
    name: "owner uid is right but owner gid differs from the expected uid",
    skip: NEEDS_SPLIT,
    setup: (fx) => giveSplitOwner(fx),
    expectUid: String(SPLIT.uid),
    // the probe is only evaluated when the invoker is the expected uid: an ordinary user is, root is not
    nonTrue: IS_ROOT ? { dir_probe_write: "UNKNOWN" } : {},
    info: { pair: "both_present" },
  },
  // ---- the probe never touches what is already there (R4 d). The leftover has the probe's exact name.
  {
    name: "a file with the probe's exact name already exists",
    launch: { kind: "file" },
    nonTrue: { dir_probe_write: "UNKNOWN" },
  },
  {
    name: "a dangling symlink with the probe's exact name already exists",
    launch: { kind: "dangling-symlink" },
    nonTrue: { dir_probe_write: "UNKNOWN" },
  },
  {
    name: "key missing",
    setup: (fx) => fs.rmSync(fx.key),
    nonTrue: { key_exists: "false", ...keyChecksUnknown() },
    info: { keyForm: "UNKNOWN" },
  },
  {
    name: "key is a symlink to a good key",
    setup: (fx) => {
      const real = path.join(fx.keyDir, `real-${fx.token}.key`);
      fs.renameSync(fx.key, real);
      fs.symlinkSync(real, fx.key);
    },
    nonTrue: { key_not_symlink: "false" },
  },
  {
    name: "key is a dangling symlink",
    setup: (fx) => {
      fs.rmSync(fx.key);
      fs.symlinkSync(path.join(fx.keyDir, `nowhere-${fx.token}`), fx.key);
    },
    nonTrue: { key_exists: "false", ...keyChecksUnknown({ key_not_symlink: "false" }) },
    info: { keyForm: "UNKNOWN" },
  },
  {
    name: "key is a directory",
    setup: (fx) => {
      fs.rmSync(fx.key);
      fs.mkdirSync(fx.key, { mode: 0o700 });
      fs.chmodSync(fx.key, 0o700);
    },
    nonTrue: { key_is_regular: "false", key_form_ok: "UNKNOWN" },
    info: { keyForm: "UNKNOWN" },
  },
  { name: "key mode 0400 (read-only owner)", setup: (fx) => setKey(fx, fx.keyContent, 0o400), nonTrue: {} },
  { name: "key mode 0644", setup: (fx) => setKey(fx, fx.keyContent, 0o644), nonTrue: { key_mode_ok: "false" } },
  { name: "key mode 0660", setup: (fx) => setKey(fx, fx.keyContent, 0o660), nonTrue: { key_mode_ok: "false" } },
  // Each 'other' bit alone, with the owner able to read: the group bits are clear, so only the 'other' bits can fail these.
  { name: "key mode 0604 (readable by everyone)", setup: (fx) => setKey(fx, fx.keyContent, 0o604), nonTrue: { key_mode_ok: "false" } },
  { name: "key mode 0602 (writable by everyone)", setup: (fx) => setKey(fx, fx.keyContent, 0o602), nonTrue: { key_mode_ok: "false" } },
  { name: "key mode 0601 (executable by everyone)", setup: (fx) => setKey(fx, fx.keyContent, 0o601), nonTrue: { key_mode_ok: "false" } },
  {
    // owner cannot read: the module (running as that owner) could not either. An ordinary user running this cannot read it
    // either, so the form is not determinable; root can, and then only the mode check says no.
    name: "key mode 0200 (owner cannot read)",
    setup: (fx) => setKey(fx, fx.keyContent, 0o200),
    nonTrue: IS_ROOT ? { key_mode_ok: "false" } : { key_mode_ok: "false", key_form_ok: "UNKNOWN" },
    info: { keyForm: IS_ROOT ? "hex64" : "UNKNOWN" },
  },
  {
    name: "key hex 63 characters",
    setup: (fx) => setKey(fx, Buffer.from(`${hex32().slice(1)}\n`)),
    nonTrue: { key_form_ok: "false" },
    info: { keyForm: "invalid" },
  },
  {
    name: "key hex 65 characters",
    setup: (fx) => setKey(fx, Buffer.from(`${hex32()}a\n`)),
    nonTrue: { key_form_ok: "false" },
    info: { keyForm: "invalid" },
  },
  {
    name: "key 64 characters but not all hex",
    setup: (fx) => setKey(fx, Buffer.from(`${hex32().slice(1)}g\n`)),
    nonTrue: { key_form_ok: "false" },
    info: { keyForm: "invalid" },
  },
  {
    name: "key hex with uppercase and surrounding whitespace is accepted",
    setup: (fx) => setKey(fx, Buffer.from(`  \t${hex32().toUpperCase()} \r\n\n`)),
    nonTrue: {},
    info: { keyForm: "hex64" },
  },
  {
    name: "key valid padded base64 (openssl rand -base64 32)",
    setup: (fx) => setKey(fx, Buffer.from(`${crypto.randomBytes(32).toString("base64")}\n`)),
    nonTrue: {},
    info: { keyForm: "base64_43" },
  },
  {
    name: "key unpadded 44-character base64",
    setup: (fx) => setKey(fx, Buffer.from(`${crypto.randomBytes(33).toString("base64")}\n`)),
    nonTrue: { key_form_ok: "false" },
    info: { keyForm: "invalid" },
  },
  {
    // not text-form, exactly 32 bytes, leading space and trailing newline included: used untrimmed, so valid
    name: "key raw 32 bytes",
    setup: (fx) => setKey(fx, Buffer.concat([Buffer.from(" "), crypto.randomBytes(30), Buffer.from("\n")])),
    nonTrue: {},
    info: { keyForm: "raw32" },
  },
  {
    name: "key raw 32 bytes plus a trailing newline",
    setup: (fx) => setKey(fx, Buffer.concat([crypto.randomBytes(32), Buffer.from("\n")])),
    nonTrue: { key_form_ok: "false" },
    info: { keyForm: "invalid" },
  },
  { name: "key empty", setup: (fx) => setKey(fx, Buffer.alloc(0)), nonTrue: { key_form_ok: "false" }, info: { keyForm: "invalid" } },
  {
    name: "key inside the authority directory",
    setup: (fx) => {
      fs.rmSync(fx.key);
      fx.key = path.join(fx.dir, `K-${fx.token}.key`);
      setKey(fx, fx.keyContent);
    },
    nonTrue: { key_not_inside_authority_dir: "false" },
  },
  {
    name: "key file is the ledger file (same path)",
    setup: (fx) => {
      fs.rmSync(fx.key);
      writeFile(fx.ledger, `${hex32()}\n`);
      writeFile(fx.hw);
      fx.key = fx.ledger;
      fx.keyContent = fs.readFileSync(fx.ledger);
    },
    nonTrue: { key_not_inside_authority_dir: "false", key_not_ledger_file: "false" },
    info: { pair: "both_present" },
  },
  {
    name: "key file is the high-water file (same path)",
    setup: (fx) => {
      fs.rmSync(fx.key);
      writeFile(fx.ledger);
      writeFile(fx.hw, `${hex32()}\n`);
      fx.key = fx.hw;
      fx.keyContent = fs.readFileSync(fx.hw);
    },
    nonTrue: { key_not_inside_authority_dir: "false", key_not_ledger_file: "false" },
    info: { pair: "both_present" },
  },
  {
    // a different path outside the directory, the same inode: only the inode comparison can see it
    name: "key file is a hard link of the ledger file",
    setup: (fx) => {
      fs.rmSync(fx.key);
      writeFile(fx.ledger, `${hex32()}\n`);
      writeFile(fx.hw);
      fs.linkSync(fx.ledger, fx.key);
      fx.keyContent = fs.readFileSync(fx.key);
    },
    nonTrue: { key_not_ledger_file: "false" },
    info: { pair: "both_present" },
  },
  {
    // textually outside the directory, physically inside it: only symlink resolution can see it
    name: "key inside the authority directory, reached through a symlink alias of the directory",
    setup: (fx) => {
      const inner = path.join(fx.dir, `K-${fx.token}.key`);
      fs.rmSync(fx.key);
      fs.writeFileSync(inner, fx.keyContent, { mode: 0o600 });
      fs.chmodSync(inner, 0o600);
      const alias = path.join(fx.root, `alias-${fx.token}`);
      fs.symlinkSync(fx.dir, alias);
      fx.key = path.join(alias, `K-${fx.token}.key`);
    },
    nonTrue: { key_not_inside_authority_dir: "false" },
  },
  {
    // nothing exists to compare by inode, so only the path comparison can see that this is the ledger file
    name: "key path spells the ledger path differently, nothing created yet",
    setup: (fx) => {
      fs.rmSync(fx.key);
      fx.key = `${fx.dir}/./${path.basename(fx.ledger)}`;
    },
    nonTrue: { key_exists: "false", ...keyChecksUnknown(), key_not_inside_authority_dir: "false", key_not_ledger_file: "false" },
    info: { keyForm: "UNKNOWN" },
  },
  {
    // The directory exists but this uid cannot search it: every file in it would look absent, so the pair state must not be
    // reported as both_absent. UNKNOWN, never a pass.
    name: "authority directory not searchable by the invoker (pair state not determinable)",
    rootOnly: true,
    setup: (fx) => {
      for (const p of [fx.root, fx.keyDir]) fs.chmodSync(p, 0o755);
      fs.chownSync(fx.dir, FOREIGN_UID, FOREIGN_UID);
      fs.chownSync(fx.key, DROP_UID, DROP_UID);
      fx.expectUid = String(DROP_UID);
    },
    runOpts: (fx) => ({ uid: DROP_UID, gid: DROP_UID, cwd: fx.root, useCopy: true }),
    nonTrue: { dir_owner_uid_ok: "false", dir_probe_write: "false", ledger_pair_state_ok: "UNKNOWN", ledger_files_owner_ok: "UNKNOWN" },
    info: { pair: "UNKNOWN" },
  },
  {
    name: "ledger and high-water in different directories",
    setup: (fx) => {
      const dir2 = path.join(fx.root, `auth2-${fx.token}`);
      fs.mkdirSync(dir2, { mode: 0o700 });
      fs.chmodSync(dir2, 0o700);
      fx.hw = path.join(dir2, `H-${fx.token}.json`);
    },
    nonTrue: { ledger_dir_same_as_high_water_dir: "false" },
  },
  {
    // every distinct authority directory is held to the directory checks, not only the ledger's
    name: "high-water directory is a second directory and is group-writable",
    setup: (fx) => {
      const dir2 = path.join(fx.root, `auth2-${fx.token}`);
      fs.mkdirSync(dir2, { mode: 0o700 });
      fs.chmodSync(dir2, 0o770);
      fx.hw = path.join(dir2, `H-${fx.token}.json`);
    },
    nonTrue: { ledger_dir_same_as_high_water_dir: "false", dir_mode_ok: "false" },
  },
  {
    name: "high-water directory is a second directory that does not exist",
    setup: (fx) => {
      fx.hw = path.join(fx.root, `missing-${fx.token}`, `H-${fx.token}.json`);
    },
    nonTrue: { ledger_dir_same_as_high_water_dir: "false", dir_exists: "false", dir_not_symlink: "UNKNOWN", dir_is_directory: "UNKNOWN", dir_owner_uid_ok: "UNKNOWN", dir_mode_ok: "UNKNOWN", dir_probe_write: "UNKNOWN" },
  },
];
const CASE = Object.fromEntries(CASES.map((c) => [c.name, c]));

function prepare(c) {
  const fx = makeFixture();
  try {
    c.setup?.(fx);
    if (c.expectUid !== undefined) fx.expectUid = c.expectUid;
  } catch (e) {
    forceRemove(fx.root);
    throw e;
  }
  return fx;
}
/** Run a case's fixture once; the tree verdict is returned, not asserted (see observe). */
function execObserve(fx, c, script) {
  const opts = c.runOpts ? c.runOpts(fx) : {};
  const useCopy = opts.useCopy;
  delete opts.useCopy;
  return observe(fx, std(fx), { ...opts, script: script ?? (useCopy ? ORIG_COPY : SCRIPT), launch: c.launch });
}
function exec(fx, c, script) {
  const r = execObserve(fx, c, script);
  assert.equal(r.treeChanged, false, "the run changed the fixture tree");
  return r.p;
}
const infoOf = (c) => ({ pair: "both_absent", keyForm: "hex64", ...(c.info ?? {}) });
const skipOf = (c) => c.skip ?? (c.rootOnly ? NEEDS_ROOT : false);
/** The case's own expectations, applied to an observed run. Throws on any deviation, including a changed tree. */
function judge(r, c) {
  assert.equal(r.treeChanged, false, `${c.name}: the run changed the fixture tree`);
  assertCase(r.p, c.nonTrue, infoOf(c), c.name);
}

for (const c of CASES) {
  test(`case: ${c.name}`, { skip: skipOf(c) }, () => {
    const fx = prepare(c);
    try {
      assertCase(exec(fx, c), c.nonTrue, infoOf(c), c.name);
    } finally {
      forceRemove(fx.root);
    }
  });
}

test("the conforming run prints every required check once, two info lines, two advisory lines and the result, and passes", () =>
  withFixture((fx) => {
    const p = runFx(fx, std(fx));
    assert.deepEqual(Object.keys(p.states), [...REQUIRED, ...ADVISORY]);
    assert.equal(p.states.authority_dir_under_docker_data_root, "false");
    assert.equal(p.states.key_under_docker_data_root, "false");
    assert.equal(p.result, "PASS");
    assert.equal(p.status, 0);
    assert.equal(p.stderr, "");
  }));

test("an internal error is reported as UNKNOWN with exit 3, never as a pass and never as a bare crash", () =>
  withFixture((fx) => {
    // A `dirname` that fails after the tool check has passed: errexit aborts the script mid-run. It also writes an error
    // message that NAMES the path it was given, which is what a real failing command does; none of it may reach the operator.
    const shim = fs.mkdtempSync(path.join(os.tmpdir(), "r20pf-shim-"));
    try {
      fs.writeFileSync(path.join(shim, "dirname"), "#!/bin/sh\nprintf 'dirname: cannot process %s\\n' \"$*\" >&2\nexit 1\n", { mode: 0o755 });
      const before = snapshot(fx.root);
      const raw = runRaw(std(fx), { pathPrefix: shim });
      assert.equal(raw.stdout, "r20_host_preflight result=UNKNOWN\n");
      assert.equal(raw.stderr, "");
      assert.equal(raw.status, 3);
      assertNoLeak(raw, [fx.root, fx.token], "internal error");
      assert.equal(snapshot(fx.root), before);
    } finally {
      fs.rmSync(shim, { recursive: true, force: true });
    }
  }));

// As root the files can be given to uid 1000, so the default is observed directly: owner checks true, the probe UNKNOWN
// (the invoker is not 1000). As an ordinary uid-1000 user the same fixture simply passes. Any other ordinary user cannot make
// a fixture that 1000 owns, and the test says so rather than pretending.
test("the default expected uid is exactly 1000 (observed through ownership, not through the text of the script)", { skip: IS_ROOT || UID === 1000 ? false : "needs root, or to be uid 1000" }, () =>
  withFixture((fx) => {
    if (IS_ROOT) for (const p of [fx.dir, fx.key]) fs.chownSync(p, 1000, 1000);
    const p = runFx(fx, ["--ledger", fx.ledger, "--high-water", fx.hw, "--key-file", fx.key]);
    assertCase(p, IS_ROOT ? { dir_probe_write: "UNKNOWN" } : {}, { pair: "both_absent", keyForm: "hex64" }, "default expected uid");
    const other = runFx(fx, std(fx, { expectUid: "1001" }));
    assert.equal(other.states.dir_owner_uid_ok, "false", "1001 must not be accepted for a directory that uid 1000 owns");
  }));

test("--expect-uid defaults to 1000, and a leading-zero spelling is the same number", () =>
  withFixture((fx) => {
    const dflt = runFx(fx, ["--ledger", fx.ledger, "--high-water", fx.hw, "--key-file", fx.key]);
    const explicit = runFx(fx, std(fx, { expectUid: "1000" }));
    const padded = runFx(fx, std(fx, { expectUid: "0001000" }));
    assert.equal(dflt.stdout, explicit.stdout);
    assert.equal(padded.stdout, explicit.stdout);
    assert.equal(dflt.status, explicit.status);
    assert.equal(dflt.status, UID === 1000 ? 0 : 1, dump(dflt));
  }));

// ------------------------------------------------------------------ misuse ---
const MISUSE = [
  ["relative ledger path", (fx) => std(fx, { ledger: `relative/${fx.token}/ledger.json` })],
  ["relative high-water path", (fx) => std(fx, { hw: `relative/${fx.token}/high-water.json` })],
  ["relative key path", (fx) => std(fx, { key: `./${fx.token}.key` })],
  ["missing --ledger", (fx) => std(fx).filter((_, i) => i !== 0 && i !== 1)],
  ["missing --high-water", (fx) => std(fx).filter((_, i) => i !== 2 && i !== 3)],
  ["missing --key-file", (fx) => std(fx).filter((_, i) => i !== 4 && i !== 5)],
  ["no arguments", () => []],
  ["unknown flag", (fx) => [...std(fx), `--zz-${fx.token}`]],
  ["unknown flag in a --flag=value spelling", (fx) => ["--ledger=" + fx.ledger, "--high-water", fx.hw, "--key-file", fx.key]],
  ["a positional argument", (fx) => [...std(fx), `positional-${fx.token}`]],
  ["repeated --ledger", (fx) => [...std(fx), "--ledger", fx.ledger]],
  ["repeated --high-water", (fx) => [...std(fx), "--high-water", fx.hw]],
  ["repeated --key-file", (fx) => [...std(fx), "--key-file", fx.key]],
  ["repeated --expect-uid", (fx) => [...std(fx), "--expect-uid", "1000"]],
  ["path containing a newline", (fx) => std(fx, { ledger: `${fx.ledger}\n${fx.token}` })],
  ["key path containing a newline", (fx) => std(fx, { key: `${fx.key}\n` })],
  ["empty --ledger", (fx) => std(fx, { ledger: "" })],
  ["empty --key-file", (fx) => std(fx, { key: "" })],
  ["path ending in a slash", (fx) => std(fx, { ledger: `${fx.ledger}/` })],
  ["ledger and high-water the same path", (fx) => std(fx, { hw: fx.ledger })],
  ["ledger and high-water the same file under different spellings", (fx) => std(fx, { hw: `${fx.dir}/../${path.basename(fx.dir)}/${path.basename(fx.ledger)}` })],
  ["a flag with no value at the end", (fx) => std(fx).slice(0, 5)],
  ["a flag used as another flag's value", (fx) => ["--ledger", "--high-water", fx.hw, "--key-file", fx.key]],
  ["non-numeric --expect-uid", (fx) => std(fx, { expectUid: `12ab` })],
  ["negative --expect-uid", (fx) => std(fx, { expectUid: `-5` })],
  ["empty --expect-uid", (fx) => std(fx, { expectUid: `` })],
  ["--expect-uid with 11 digits", (fx) => std(fx, { expectUid: `12345678901` })],
  ["--expect-uid with a space", (fx) => std(fx, { expectUid: ` 1000` })],
];
for (const [name, build] of MISUSE) {
  test(`misuse: ${name} exits 2 with a message that names no path`, () =>
    withFixture((fx) => {
      const args = build(fx);
      const before = snapshot(fx.root);
      const raw = runRaw(args);
      assert.equal(raw.status, 2, `${name}\n${raw.stdout}${raw.stderr}`);
      assert.equal(raw.stdout, "", "a refusal prints nothing on stdout");
      assert.match(raw.stderr, /^r20_host_preflight: refused: [a-z0-9 -]+\n$/, "one fixed sentence on stderr");
      assertNoLeak(raw, [fx.root, fx.token, ...args.filter((a) => a.length >= 8)], name);
      assert.equal(snapshot(fx.root), before);
    }));
}

test("--help and -h print placeholder usage and exit 0, without a result line, even after other arguments", () =>
  withFixture((fx) => {
    for (const args of [["--help"], ["-h"], ["--ledger", fx.ledger, "--help"]]) {
      const raw = runRaw(args);
      assert.equal(raw.status, 0);
      assert.equal(raw.stderr, "");
      assert.match(raw.stdout, /^Usage: check-r20-host-prerequisites\.sh --ledger <abs-path-to-ledger-file>/);
      for (const ph of ["<abs-path-to-high-water-file>", "<abs-path-to-key-file>", "[--expect-uid N]", "default 1000"]) {
        assert.ok(raw.stdout.includes(ph), `usage lacks ${ph}`);
      }
      // the usage text documents the format inside a sentence; it must not itself be a verdict line
      assert.ok(!raw.stdout.split("\n").some((l) => /^r20_host_preflight result=/.test(l)), "help prints no verdict");
      assertNoLeak(raw, [fx.root, fx.token], "--help");
    }
  }));

test("output vocabulary: the usage text, the script's own assignments and this suite's parser name exactly the same state values", () => {
  const help = runRaw(["--help"]);
  assert.equal(help.status, 0);
  const documented = (name) => {
    const m = new RegExp(`^  ${name} +(.+)$`, "m").exec(help.stdout);
    assert.ok(m, `the usage text has no '${name}' vocabulary line`);
    return m[1].split("|").map((s) => s.trim());
  };
  const code = SCRIPT_TEXT.split("\n").filter((l) => !/^\s*#/.test(l)).join("\n");
  const assigned = (variable) => [...code.matchAll(new RegExp(`\\b${variable}=([A-Za-z0-9_]+)`, "g"))].map((m) => m[1]);
  const set = (a) => [...new Set(a)].sort();
  assert.deepEqual(set(documented("ledger_pair_state")), set(PAIR_STATES), "usage text vs the pair-state vocabulary");
  assert.deepEqual(set(documented("key_form")), set(KEY_FORMS), "usage text vs the key-form vocabulary");
  assert.deepEqual(set(assigned("PAIR")), set(PAIR_STATES), "the script's PAIR assignments vs the pair-state vocabulary");
  assert.deepEqual(set(assigned("KEY_FORM")), set(KEY_FORMS), "the script's KEY_FORM assignments vs the key-form vocabulary");
  // the header documents the same words
  const header = SCRIPT_TEXT.split("\n").filter((l) => /^#/.test(l)).join("\n");
  for (const v of [...PAIR_STATES, ...KEY_FORMS]) assert.ok(header.includes(v), `the script header does not mention ${v}`);
  assert.ok(/wrong_kind/.test(help.stdout) && /FIFO/.test(help.stdout) && /socket/.test(help.stdout), "usage explains wrong_kind");
});

// --------------------------------------------------------------- lethality ---
function mutantFor(id) {
  const re = new RegExp(`^check ${id} .*$`, "gm");
  const hits = SCRIPT_TEXT.match(re) ?? [];
  assert.equal(hits.length, 1, `SETUP: expected exactly one 'check ${id} ...' line in the script, found ${hits.length}`);
  const text = SCRIPT_TEXT.replace(re, () => `check ${id} true`);
  assert.notEqual(text, SCRIPT_TEXT);
  return writeTool(`mutant-${id}.sh`, text);
}

/** required check -> the case whose fixture must make it `false` */
const LETHAL = {
  ledger_dir_same_as_high_water_dir: "ledger and high-water in different directories",
  dir_exists: "missing directory",
  dir_not_symlink: "directory is a symlink to a real directory",
  dir_is_directory: "directory is a regular file",
  dir_owner_uid_ok: "expected uid is not the owner (uid + 1), both ledger files present",
  dir_mode_ok: "directory group-writable (0770)",
  dir_probe_write: "directory not writable by the expected uid (the probe really fails)",
  ledger_pair_state_ok: "only the ledger file present",
  ledger_files_owner_ok: "expected uid is not the owner (uid + 1), both ledger files present",
  key_exists: "key missing",
  key_not_symlink: "key is a symlink to a good key",
  key_is_regular: "key is a directory",
  key_owner_uid_ok: "expected uid is not the owner (uid + 1), both ledger files present",
  key_mode_ok: "key mode 0644",
  key_form_ok: "key hex 63 characters",
  key_not_inside_authority_dir: "key inside the authority directory",
  key_not_ledger_file: "key file is a hard link of the ledger file",
};

test("every required check is a single, listed `check <id> ...` line, and nothing else is a check", () => {
  const ids = [...SCRIPT_TEXT.matchAll(/^check ([a-z0-9_]+) /gm)].map((m) => m[1]);
  assert.deepEqual(ids, REQUIRED);
  assert.deepEqual(Object.keys(LETHAL).sort(), [...REQUIRED].sort(), "every required check needs a discriminating fixture");
  for (const name of Object.values(LETHAL)) assert.ok(CASE[name], `no such case: ${name}`);
});

/**
 * Further fixtures on which a check is false, each run against the same neutralising mutant. They are the fixtures that
 * the first-listed one cannot be (or is not) discriminating for: the owner-search bit, the 'other' key bits, the gid/uid
 * split, and every wrong-kind pair member.
 */
const EXTRA_LETHAL = [
  ["dir_mode_ok", "directory mode 0600 (owner cannot search)"],
  ["dir_mode_ok", "directory mode 0000"],
  ["key_mode_ok", "key mode 0604 (readable by everyone)"],
  ["key_mode_ok", "key mode 0602 (writable by everyone)"],
  ["key_mode_ok", "key mode 0601 (executable by everyone)"],
  ["dir_owner_uid_ok", "owner uid is wrong but owner gid equals the expected uid"],
  ["ledger_files_owner_ok", "owner uid is wrong but owner gid equals the expected uid"],
  ["key_owner_uid_ok", "owner uid is wrong but owner gid equals the expected uid"],
  ["ledger_pair_state_ok", "ledger path is a directory, high-water is a regular file"],
  ["ledger_pair_state_ok", "high-water path is a directory, ledger is a regular file"],
  ["ledger_pair_state_ok", "ledger path is a directory, high-water is absent"],
  ["ledger_pair_state_ok", "ledger and high-water paths are both directories"],
  ["ledger_pair_state_ok", "ledger is a symlink to a regular file elsewhere, high-water is a regular file"],
  ["ledger_pair_state_ok", "high-water is a symlink to a regular file elsewhere, ledger is a regular file"],
  ["ledger_pair_state_ok", "ledger is a FIFO, high-water is a regular file"],
  ["ledger_pair_state_ok", "high-water is a socket, ledger is a regular file"],
  // as root the probe succeeds whatever the mode, so only an ordinary user sees the 0500 directory refuse a write: this is the
  // non-root coverage of dir_probe_write (its first-listed fixture needs root)
  ["dir_probe_write", "directory without owner write (0500)", IS_ROOT ? "as root a write to a 0500 directory succeeds, so the probe is not false" : false],
];

const LETHAL_PAIRS = [...REQUIRED.map((id) => [id, LETHAL[id], undefined]), ...EXTRA_LETHAL];

test("every extra lethality pair names a required check and an existing case that declares that check false", () => {
  for (const [id, name, skipReason] of EXTRA_LETHAL) {
    assert.ok(REQUIRED.includes(id), `not a required check: ${id}`);
    assert.ok(CASE[name], `no such case: ${name}`);
    if (!skipReason && !skipOf(CASE[name])) assert.equal(CASE[name].nonTrue[id], "false", `"${name}" must declare ${id} false`);
  }
});

LETHAL_PAIRS.forEach(([id, caseName, extraSkip], index) => {
  const c = CASE[caseName];
  const extra = index >= REQUIRED.length;
  const title = extra
    ? `lethality (also): ${id} is false on "${caseName}" and the mutant that neutralises it reports true`
    : `lethality: ${id} is false on its fixture and the mutant that neutralises it reports true`;
  test(title, { skip: extraSkip || skipOf(c) }, () => {
    const fx = prepare(c);
    try {
      const original = exec(fx, c);
      assert.equal(original.states[id], "false", `unmutated script on "${c.name}"\n${dump(original)}`);
      assertCase(original, c.nonTrue, infoOf(c), c.name);

      const mutant = exec(fx, c, mutantFor(id));
      assert.equal(mutant.states[id], "true", `the mutant must report ${id} true\n${dump(mutant)}`);
      const remaining = { ...c.nonTrue };
      delete remaining[id];
      assertCase(mutant, remaining, infoOf(c), `mutant of ${id} on "${c.name}"`);
      if (Object.keys(c.nonTrue).length === 1) {
        assert.equal(mutant.result, "PASS", "with the only failing check neutralised, the fixture passes: that check alone was what stopped it");
        assert.equal(mutant.status, 0);
      }
    } finally {
      forceRemove(fx.root);
    }
  });
});

test("lethality: UNKNOWN is not a pass, and neutralising dir_probe_write is what would let it through", { skip: NEEDS_ROOT }, () => {
  const c = CASE["invoking uid differs from the expected uid, otherwise conforming"];
  const fx = prepare(c);
  try {
    const original = exec(fx, c);
    assertCase(original, c.nonTrue, infoOf(c), c.name);
    assert.equal(original.result, "UNKNOWN");
    assert.equal(original.status, 3);
    const mutant = exec(fx, c, mutantFor("dir_probe_write"));
    assert.equal(mutant.states.dir_probe_write, "true");
    assert.equal(mutant.result, "PASS");
    assert.equal(mutant.status, 0);
  } finally {
    forceRemove(fx.root);
  }
});

test("lethality: a mutant that leaves a check false does not hide it (control: mutating a different check changes nothing here)", () => {
  const c = CASE["directory group-writable (0770)"];
  const fx = prepare(c);
  try {
    const mutant = exec(fx, c, mutantFor("key_mode_ok"));
    assert.equal(mutant.states.dir_mode_ok, "false");
    assert.equal(mutant.result, "FAIL");
    assert.equal(mutant.status, 1);
  } finally {
    forceRemove(fx.root);
  }
});

// ------------------------------------------------------ line-level mutants -----
// The per-check mutants above neutralise a whole `check` line. These replace ONE fragment INSIDE a probe, so they can only die
// on a fixture that exercises exactly the decision that fragment makes (a mode bit, which id a stat reads, the O_EXCL-style
// create of the probe file, the kind test on a pair member). Each is a small, plausible wrong edit; none is equivalent:
//   from   a fragment of the script that must occur EXACTLY ONCE (an edit that moves or rewrites it fails loudly here instead
//          of turning the mutant into a silent no-op);
//   to     what it becomes;
//   kills  for every listed case: the mutated script must still run to the end, must misreport in exactly the predicted way
//          (`mutantNonTrue`, `info`, `treeChanged`), and the case's OWN expectations must reject that report. The control run
//          of the unmutated script on the same fixture must satisfy them, so the fixture is what discriminates.
const omit = (o, ids) => Object.fromEntries(Object.entries(o).filter(([k]) => !ids.includes(k)));
const without = (...ids) => (nonTrue) => omit(nonTrue, ids);
const flipped = (id) => (nonTrue) => ({ ...nonTrue, [id]: "false" });
const same = (nonTrue) => nonTrue;
const modeKill = (name) => ({ case: name, mutantNonTrue: without("key_mode_ok") });
const dirModeKill = (name) => ({ case: name, mutantNonTrue: without("dir_mode_ok") });
const OWNER_A = "owner uid is wrong but owner gid equals the expected uid"; // the correct answer is false for all three owner checks
const OWNER_B = "owner uid is right but owner gid differs from the expected uid"; // the correct answer is true for all three
const ownerKills = (id) => [
  { case: OWNER_A, mutantNonTrue: without(id) },
  { case: OWNER_B, mutantNonTrue: flipped(id) },
];
// What a mutant that cannot see the wrong kind reports: the existing members count as present, so the pair is both_present
// when both exist and one_present when only one does.
const unseenKind = (name, bothExist) => ({
  case: name,
  mutantNonTrue: () => (bothExist ? {} : { ledger_pair_state_ok: "false" }),
  info: { pair: bothExist ? "both_present" : "one_present" },
});
const K_LEDGER_DIR = "ledger path is a directory, high-water is a regular file";
const K_HW_DIR = "high-water path is a directory, ledger is a regular file";
const K_LEDGER_DIR_ALONE = "ledger path is a directory, high-water is absent";
const K_BOTH_DIRS = "ledger and high-water paths are both directories";
const K_LEDGER_LINK = "ledger is a symlink to a regular file elsewhere, high-water is a regular file";
const K_HW_LINK = "high-water is a symlink to a regular file elsewhere, ledger is a regular file";
const K_LEDGER_FIFO = "ledger is a FIFO, high-water is a regular file";
const K_HW_SOCKET = "high-water is a socket, ledger is a regular file";
const WRONG_KIND_CASES = [K_LEDGER_DIR, K_HW_DIR, K_LEDGER_DIR_ALONE, K_BOTH_DIRS, K_LEDGER_LINK, K_HW_LINK, K_LEDGER_FIFO, K_HW_SOCKET];
const P_FILE = "a file with the probe's exact name already exists";
const P_LINK = "a dangling symlink with the probe's exact name already exists";
const DIR_0600 = "directory mode 0600 (owner cannot search)";
const DIR_0000 = "directory mode 0000";
const DIR_0500 = "directory without owner write (0500)";

const LINE_MUTANTS = [
  // ---- R4 (a): dir_mode_ok needs the owner's search bit
  {
    id: "dir-mode-owner-search-bit-dropped",
    from: "[ $((m & 0700)) -eq $((0700)) ] && [ $((m & 022)) -eq 0 ]",
    to: "[ $((m & 0600)) -eq $((0600)) ] && [ $((m & 022)) -eq 0 ]",
    kills: [dirModeKill(DIR_0600)],
  },
  {
    id: "dir-mode-owner-bits-not-required",
    from: "[ $((m & 0700)) -eq $((0700)) ] && [ $((m & 022)) -eq 0 ]",
    to: "[ $((m & 022)) -eq 0 ]",
    kills: [dirModeKill(DIR_0600), dirModeKill(DIR_0000), dirModeKill(DIR_0500)],
  },
  // ---- R4 (b): key_mode_ok looks at every 'other' bit (and the group bits)
  { id: "key-mode-group-bits-ignored", from: "[ $((m & 077)) -eq 0 ] && [ $((m & 0400)) -ne 0 ]", to: "[ $((m & 07)) -eq 0 ] && [ $((m & 0400)) -ne 0 ]", kills: [modeKill("key mode 0660")] },
  {
    id: "key-mode-other-bits-ignored",
    from: "[ $((m & 077)) -eq 0 ] && [ $((m & 0400)) -ne 0 ]",
    to: "[ $((m & 070)) -eq 0 ] && [ $((m & 0400)) -ne 0 ]",
    kills: [modeKill("key mode 0604 (readable by everyone)"), modeKill("key mode 0602 (writable by everyone)"), modeKill("key mode 0601 (executable by everyone)")],
  },
  {
    id: "key-mode-other-read-only-examined",
    from: "[ $((m & 077)) -eq 0 ] && [ $((m & 0400)) -ne 0 ]",
    to: "[ $((m & 074)) -eq 0 ] && [ $((m & 0400)) -ne 0 ]",
    kills: [modeKill("key mode 0602 (writable by everyone)"), modeKill("key mode 0601 (executable by everyone)")],
  },
  {
    id: "key-mode-other-execute-not-examined",
    from: "[ $((m & 077)) -eq 0 ] && [ $((m & 0400)) -ne 0 ]",
    to: "[ $((m & 076)) -eq 0 ] && [ $((m & 0400)) -ne 0 ]",
    kills: [modeKill("key mode 0601 (executable by everyone)")],
  },
  {
    id: "key-mode-other-write-not-examined",
    from: "[ $((m & 077)) -eq 0 ] && [ $((m & 0400)) -ne 0 ]",
    to: "[ $((m & 075)) -eq 0 ] && [ $((m & 0400)) -ne 0 ]",
    kills: [modeKill("key mode 0602 (writable by everyone)")],
  },
  // ---- R4 (c): the owner checks read the owner's UID, not its GID (each direction, three separate lines)
  { id: "dir-owner-reads-gid", from: 'stat_num %u "$1" || return 3', to: 'stat_num %g "$1" || return 3', kills: ownerKills("dir_owner_uid_ok") },
  { id: "ledger-files-owner-reads-gid", from: 'stat_num %u "$f" || return 3', to: 'stat_num %g "$f" || return 3', kills: ownerKills("ledger_files_owner_ok") },
  { id: "key-owner-reads-gid", from: 'stat_num %u "$KEY" || return 3', to: 'stat_num %g "$KEY" || return 3', kills: ownerKills("key_owner_uid_ok") },
  // ---- R4 (d): the probe file is created exclusively and never touches what is already there
  {
    id: "probe-created-without-noclobber",
    from: 'if ( set -C; : > "$f" ) 2>/dev/null; then',
    to: 'if ( : > "$f" ) 2>/dev/null; then',
    kills: [
      { case: P_FILE, mutantNonTrue: without("dir_probe_write"), treeChanged: true },
      { case: P_LINK, mutantNonTrue: without("dir_probe_write"), treeChanged: true },
    ],
  },
  {
    id: "probe-leftover-reported-as-unwritable",
    from: 'if [ -e "$f" ] || [ -L "$f" ]; then return 3; fi',
    to: 'if false; then return 3; fi',
    kills: [
      { case: P_FILE, mutantNonTrue: flipped("dir_probe_write") },
      { case: P_LINK, mutantNonTrue: flipped("dir_probe_write") },
    ],
  },
  {
    id: "probe-leftover-symlink-not-recognised",
    from: 'if [ -e "$f" ] || [ -L "$f" ]; then return 3; fi',
    to: 'if [ -e "$f" ]; then return 3; fi',
    kills: [{ case: P_LINK, mutantNonTrue: flipped("dir_probe_write") }],
  },
  // ---- R5: a pair member that exists must be a non-symlink regular file
  {
    id: "pair-kind-regular-file-not-required",
    from: '[ -L "$p" ] || [ ! -f "$p" ]',
    to: '[ -L "$p" ] || false',
    kills: [unseenKind(K_LEDGER_DIR, true), unseenKind(K_HW_DIR, true), unseenKind(K_LEDGER_DIR_ALONE, false), unseenKind(K_BOTH_DIRS, true), unseenKind(K_LEDGER_FIFO, true), unseenKind(K_HW_SOCKET, true)],
  },
  {
    id: "pair-kind-symlink-not-refused",
    from: '[ -L "$p" ] || [ ! -f "$p" ]',
    to: 'false || [ ! -f "$p" ]',
    kills: [unseenKind(K_LEDGER_LINK, true), unseenKind(K_HW_LINK, true)],
  },
  {
    id: "pair-kind-ledger-only-examined",
    from: 'if [ -e "$p" ] && { [ -L "$p" ] || [ ! -f "$p" ]; }; then bad=1; fi',
    to: 'if [ "$p" = "$LEDGER" ] && [ -e "$p" ] && { [ -L "$p" ] || [ ! -f "$p" ]; }; then bad=1; fi',
    kills: [unseenKind(K_HW_DIR, true), unseenKind(K_HW_LINK, true), unseenKind(K_HW_SOCKET, true)],
  },
  {
    id: "pair-kind-high-water-only-examined",
    from: 'if [ -e "$p" ] && { [ -L "$p" ] || [ ! -f "$p" ]; }; then bad=1; fi',
    to: 'if [ "$p" = "$HW" ] && [ -e "$p" ] && { [ -L "$p" ] || [ ! -f "$p" ]; }; then bad=1; fi',
    kills: [unseenKind(K_LEDGER_DIR, true), unseenKind(K_LEDGER_DIR_ALONE, false), unseenKind(K_LEDGER_LINK, true), unseenKind(K_LEDGER_FIFO, true)],
  },
  {
    id: "pair-wrong-kind-never-reported",
    from: 'if [ "$bad" -eq 1 ]; then PAIR=wrong_kind',
    to: 'if false; then PAIR=wrong_kind',
    kills: [
      unseenKind(K_LEDGER_DIR, true),
      unseenKind(K_HW_DIR, true),
      unseenKind(K_LEDGER_DIR_ALONE, false),
      unseenKind(K_BOTH_DIRS, true),
      unseenKind(K_LEDGER_LINK, true),
      unseenKind(K_HW_LINK, true),
      unseenKind(K_LEDGER_FIFO, true),
      unseenKind(K_HW_SOCKET, true),
    ],
  },
  {
    // the specific finding must outrank the count of members present
    id: "pair-wrong-kind-loses-to-one-present",
    from: 'if [ "$bad" -eq 1 ]; then PAIR=wrong_kind',
    to: 'if [ "$bad" -eq 1 ] && [ "$le" -eq 1 ] && [ "$he" -eq 1 ]; then PAIR=wrong_kind',
    kills: [unseenKind(K_LEDGER_DIR_ALONE, false)],
  },
  {
    id: "pair-wrong-kind-accepted-as-clean",
    from: "both_absent|both_present) return 0 ;;",
    to: "both_absent|both_present|wrong_kind) return 0 ;;",
    kills: WRONG_KIND_CASES.map((name) => ({ case: name, mutantNonTrue: () => ({}) })),
  },
  {
    id: "pair-wrong-kind-left-to-the-catch-all",
    from: "one_present|wrong_kind) return 1 ;;",
    to: "one_present) return 1 ;;",
    kills: WRONG_KIND_CASES.map((name) => ({ case: name, mutantNonTrue: () => ({ ledger_pair_state_ok: "UNKNOWN" }) })),
  },
];

function lineMutantScript(m) {
  const n = SCRIPT_TEXT.split(m.from).length - 1;
  assert.equal(n, 1, `SETUP: the fragment of line mutant ${m.id} must occur exactly once in the script, found ${n}`);
  assert.notEqual(m.to, m.from, `SETUP: line mutant ${m.id} changes nothing`);
  const text = SCRIPT_TEXT.replace(m.from, () => m.to);
  assert.notEqual(text, SCRIPT_TEXT);
  return writeTool(`line-mutant-${m.id}.sh`, text);
}

test("line mutants: ids are unique, every fragment occurs exactly once, and every kill names a real case", () => {
  assert.equal(new Set(LINE_MUTANTS.map((m) => m.id)).size, LINE_MUTANTS.length, "duplicate line mutant id");
  for (const m of LINE_MUTANTS) {
    assert.ok(m.kills.length > 0, `${m.id}: a mutant with no fixture is not a test`);
    lineMutantScript(m); // asserts the anchor count and that the replacement differs
    for (const k of m.kills) assert.ok(CASE[k.case], `${m.id}: no such case: ${k.case}`);
  }
});

test("line mutants: each of the four survivors the review found, and each wrong-kind guard, has at least one mutant", () => {
  const ids = LINE_MUTANTS.map((m) => m.id);
  for (const needle of ["dir-mode-owner-search-bit-dropped", "key-mode-other-bits-ignored", "dir-owner-reads-gid", "ledger-files-owner-reads-gid", "key-owner-reads-gid", "probe-created-without-noclobber", "pair-wrong-kind-never-reported", "pair-wrong-kind-accepted-as-clean"]) {
    assert.ok(ids.includes(needle), `missing line mutant ${needle}`);
  }
});

for (const m of LINE_MUTANTS) {
  for (const k of m.kills) {
    const c = CASE[k.case];
    if (!c) throw new Error(`line mutant ${m.id}: no such case: ${k.case}`);
    test(`line mutant ${m.id} dies on "${k.case}"`, { skip: skipOf(c) }, () => {
      const fx = prepare(c);
      try {
        // control: the unmutated script satisfies the case, so the fixture (not the harness) is what discriminates
        judge(execObserve(fx, c), c);

        const r = execObserve(fx, c, lineMutantScript(m));
        assert.deepEqual(Object.keys(r.p.states).sort(), [...REQUIRED, ...ADVISORY].sort(), `${m.id}: the mutant must still run to the end\n${dump(r.p)}`);
        // it misreports in exactly the predicted way ...
        assert.equal(r.treeChanged, Boolean(k.treeChanged), `${m.id}: tree change on "${c.name}"`);
        assertCase(r.p, k.mutantNonTrue(c.nonTrue), { ...infoOf(c), ...(k.info ?? {}) }, `mutant ${m.id} on "${c.name}"`);
        // ... and the case's own expectations reject that report
        assert.throws(() => judge(r, c), assert.AssertionError, `${m.id} survived "${c.name}"`);
      } finally {
        forceRemove(fx.root);
      }
    });
  }
}

// -------------------------------------------------------- advisory lines -----
test("advisory lines follow a docker-data-root-shaped location (textually and after symlink resolution) and never change the result", () => {
  const pin = /^readonly DOCKER_DATA_ROOT_PREFIX=(.*)$/m.exec(SCRIPT_TEXT);
  assert.ok(pin, "the prefix constant is a single readonly line");
  assert.equal(pin[1], "/var/lib/docker/", "the advisory prefix is the Docker data root");
  withFixture((fx) => {
    // The constant is substituted with a temp directory, so the real data root is never touched by the test.
    const fakeRoot = path.join(fx.root, `dockerroot-${fx.token}`);
    fs.mkdirSync(fakeRoot, { mode: 0o700 });
    const script = writeTool("docker-prefix.sh", SCRIPT_TEXT.replace(/^readonly DOCKER_DATA_ROOT_PREFIX=.*$/m, () => `readonly DOCKER_DATA_ROOT_PREFIX=${fakeRoot}/`));
    const advisory = (p) => [p.states.authority_dir_under_docker_data_root, p.states.key_under_docker_data_root];
    const ok = (p) => {
      assert.equal(p.result, "PASS", dump(p));
      assert.equal(p.status, 0);
    };

    ok(runFx(fx, std(fx), { script })); // conforming, outside the fake root
    assert.deepEqual(advisory(runFx(fx, std(fx), { script })), ["false", "false"]);

    const inner = path.join(fakeRoot, `auth-${fx.token}`);
    fs.mkdirSync(inner, { mode: 0o700 });
    fs.chmodSync(inner, 0o700);
    const inside = runFx(fx, std(fx, { ledger: path.join(inner, "L"), hw: path.join(inner, "H") }), { script });
    ok(inside);
    assert.deepEqual(advisory(inside), ["true", "false"]);

    const innerKeys = path.join(fakeRoot, `keys-${fx.token}`);
    fs.mkdirSync(innerKeys, { mode: 0o700 });
    fs.chmodSync(innerKeys, 0o700);
    const k = path.join(innerKeys, "K");
    fs.writeFileSync(k, fx.keyContent, { mode: 0o600 });
    fs.chmodSync(k, 0o600);
    const keyInside = runFx(fx, std(fx, { key: k }), { script });
    ok(keyInside);
    assert.deepEqual(advisory(keyInside), ["false", "true"]);

    const alias = path.join(fx.root, `alias-${fx.token}`);
    fs.symlinkSync(innerKeys, alias); // a spelling outside the prefix that resolves into it
    const viaAlias = runFx(fx, std(fx, { key: path.join(alias, "K") }), { script });
    ok(viaAlias);
    assert.deepEqual(advisory(viaAlias), ["false", "true"]);
  });
});

// ------------------------------------- key classifier vs the module's own ----
// A transcription of keyBytes() in lib/recovery/r20DeletionLedger.ts, from `raw` onwards. The drift guard below pins the
// transcribed lines to the module source, so a change to the accepted forms fails this suite until the script is updated.
const moduleKey = (raw) => {
  const text = raw.toString("utf8").trim();
  let key;
  if (/^[a-f0-9]{64}$/i.test(text)) key = Buffer.from(text, "hex");
  else if (/^[A-Za-z0-9+/]{43}=$/.test(text) || /^[A-Za-z0-9+/]{44}$/.test(text)) key = Buffer.from(text, "base64");
  else key = raw;
  return key;
};
const moduleForm = (raw) => {
  const text = raw.toString("utf8").trim();
  if (moduleKey(raw).length !== 32) return "invalid"; // R20_LEDGER_KEY_INVALID
  if (/^[a-f0-9]{64}$/i.test(text)) return "hex64";
  if (/^[A-Za-z0-9+/]{43}=$/.test(text)) return "base64_43";
  return "raw32";
};

test("drift guard: the module still has exactly the key and file handling this preflight mirrors", () => {
  const src = fs.readFileSync(MODULE_SRC, "latin1"); // the file contains a NUL byte; read it as bytes
  for (const line of [
    "const text = raw.toString('utf8').trim();",
    "if (/^[a-f0-9]{64}$/i.test(text)) key = Buffer.from(text, 'hex');",
    "else if (/^[A-Za-z0-9+/]{43}=$/.test(text) || /^[A-Za-z0-9+/]{44}$/.test(text)) key = Buffer.from(text, 'base64');",
    "else key = raw;",
    "if (key.length !== 32) throw new R20LedgerError('R20_LEDGER_KEY_INVALID');",
    "const allowInitialize = process.env.R20_LEDGER_ALLOW_INITIALIZE === 'true';",
    "const ledgerExists = fs.existsSync(paths.ledgerFile);",
    "const highExists = fs.existsSync(paths.highWaterFile);",
    "if (ledgerExists !== highExists) {",
    "fs.mkdirSync(dir, { recursive: true, mode: 0o700 });",
    "const temp = path.join(dir, `.${path.basename(file)}.${process.pid}.${crypto.randomUUID()}.tmp`);",
    "const fd = fs.openSync(temp, 'wx', 0o600);",
    "fs.renameSync(temp, file);",
    "const dirFd = fs.openSync(dir, 'r');",
    "ledgerFile: requiredPath(process.env.R20_LEDGER_FILE, 'R20_LEDGER_FILE_MISSING'),",
    "highWaterFile: requiredPath(process.env.R20_HIGH_WATER_FILE, 'R20_HIGH_WATER_FILE_MISSING'),",
    "keyFile: requiredPath(process.env.R20_LEDGER_KEY_FILE, 'R20_LEDGER_KEY_FILE_MISSING'),",
  ]) {
    assert.ok(src.includes(line), `the module no longer contains: ${line}\n(update scripts/ops/check-r20-host-prerequisites.sh and this transcription together)`);
  }
});

test("the transcription agrees with the stated rules (so the fuzz below compares against what the task describes)", () => {
  const k = crypto.randomBytes(32);
  assert.equal(moduleForm(Buffer.from(`${k.toString("hex")}\n`)), "hex64");
  assert.equal(moduleForm(Buffer.from(`${k.toString("base64")}\n`)), "base64_43");
  assert.equal(moduleForm(Buffer.from(crypto.randomBytes(33).toString("base64"))), "invalid"); // unpadded 44
  assert.equal(moduleForm(Buffer.concat([k, Buffer.from("\n")])), "invalid"); // raw 32 + newline
  assert.equal(moduleForm(Buffer.concat([Buffer.from(" "), k.subarray(0, 30), Buffer.from("\n")])), "raw32");
});

function prng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function corpus() {
  const rnd = prng(20261108);
  const int = (lo, hi) => lo + Math.floor(rnd() * (hi - lo + 1));
  const pick = (a) => a[Math.floor(rnd() * a.length)];
  const chars = (alphabet, n) => Array.from({ length: n }, () => pick(alphabet)).join("");
  const HEX = [..."0123456789abcdefABCDEF"];
  const B64 = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"];
  const WS = [" ", "\t", "\n", "\r", "\v", "\f"]; // the ASCII subset of what JS trim() strips
  const ws = () => chars(WS, int(0, 3));
  const out = [];
  const add = (s) => out.push(Buffer.from(s, "latin1"));
  for (let i = 0; i < 24; i++) add(ws() + chars(HEX, pick([62, 63, 64, 64, 64, 65, 66])) + ws());
  for (let i = 0; i < 8; i++) {
    const body = chars(HEX, 64).split("");
    body[int(0, 63)] = pick([" ", "g", "G", "-", "\t", "\n", "\0", "\x7f"]); // interior damage
    add(ws() + body.join("") + ws());
  }
  for (let i = 0; i < 12; i++) add(ws() + chars(B64, 43) + "=" + ws());
  for (let i = 0; i < 6; i++) add(ws() + chars(B64, 43) + "==" + ws());
  for (let i = 0; i < 6; i++) add(ws() + chars(B64, 42) + "==" + ws());
  for (let i = 0; i < 8; i++) add(ws() + chars(B64, 44) + ws());
  for (let i = 0; i < 4; i++) add(ws() + chars(B64, pick([43, 45, 46])) + ws());
  for (let i = 0; i < 4; i++) add(chars(B64, 21) + pick(["-", "_", " "]) + chars(B64, 21) + "=");
  for (let i = 0; i < 14; i++) out.push(crypto.createHash("sha256").update(`raw${i}`).digest().subarray(0, pick([31, 32, 32, 32, 33])));
  for (let i = 0; i < 6; i++) out.push(Buffer.concat([Buffer.from(ws() || " ", "latin1"), Buffer.alloc(30, i + 1), Buffer.from(ws() || "\n", "latin1")]));
  for (const edge of ["\x1f", "\x1c", "\0", "\x7f"]) add(edge + chars(HEX, 64) + edge); // not trimmed by JS
  for (const s of ["", " ", "\n\n", " \t \r\n"]) add(s);
  out.push(Buffer.concat([Buffer.alloc(16, 0), Buffer.alloc(16, 0xff)])); // 32 bytes with NUL
  out.push(Buffer.from(`${chars(HEX, 32)}\0${chars(HEX, 31)}`, "latin1")); // interior NUL, 64 bytes
  return out;
}

test("key_form agrees with the module's keyBytes() on a deterministic corpus of edge cases", () =>
  withFixture((fx) => {
    const items = corpus();
    assert.ok(items.length >= 100);
    const seen = new Set();
    for (const buf of items) {
      setKey(fx, buf);
      const p = runFx(fx, std(fx));
      const want = moduleForm(buf);
      seen.add(want);
      assert.equal(p.info.keyForm, want, `key_form disagrees with the module for a ${buf.length}-byte file (hex of the first 40 bytes: ${buf.subarray(0, 40).toString("hex")})`);
      assert.equal(p.states.key_form_ok, want === "invalid" ? "false" : "true");
    }
    assert.deepEqual([...seen].sort(), ["base64_43", "hex64", "invalid", "raw32"], "the corpus must exercise every class");
  }));

test("documented emulation differences fail closed: the script says invalid where the module would accept", () =>
  withFixture((fx) => {
    const hex = hex32();
    const accepted = {
      "UTF-8 BOM around a hex key": Buffer.from(`﻿${hex}\n`, "utf8"),
      "no-break space around a hex key": Buffer.from(` ${hex} `, "utf8"),
      "U+2028 after a hex key": Buffer.from(`${hex} `, "utf8"),
      "hex key followed by more than 4096 bytes of spaces": Buffer.from(hex + " ".repeat(5000), "latin1"),
    };
    for (const [name, buf] of Object.entries(accepted)) {
      assert.equal(moduleForm(buf), "hex64", `${name}: the module accepts it`);
      setKey(fx, buf);
      const p = runFx(fx, std(fx));
      assert.equal(p.info.keyForm, "invalid", `${name}: the script must be the stricter one`);
      assert.equal(p.states.key_form_ok, "false");
    }
  }));

// ------------------------------------------------------------ static guards ---
test("script discipline: strict mode, umask, C locale, no eval, no tracing, no real host path or machine name", () => {
  assert.match(SCRIPT_TEXT, /^set -Eeuo pipefail$/m);
  assert.match(SCRIPT_TEXT, /^umask 077$/m);
  assert.match(SCRIPT_TEXT, /^export LC_ALL=C$/m);
  const code = SCRIPT_TEXT.split("\n").filter((l) => !/^\s*#/.test(l)).join("\n");
  assert.ok(!/\beval\b/.test(code), "no eval");
  assert.ok(!/set\s+-[a-zA-Z]*x/.test(code), "no set -x");
  // (the Docker data root prefix is a string literal for the advisory lines, not a command)
  assert.ok(!/\bcurl\b|\bwget\b|\bdocker\b|\bssh\b/.test(code.replaceAll("/var/lib/docker/", "")), "no network or container tooling is invoked");
  // The only absolute path literal in the executable lines is the Docker data root prefix used for the advisory lines.
  const literals = [...code.matchAll(/(?<![\w$.}])\/[A-Za-z][\w.-]*(?:\/[\w.-]+)*\/?/g)].map((m) => m[0]);
  const allowed = new Set(["/var/lib/docker/", "/dev/null"]);
  for (const l of literals) {
    // pattern fragments such as `"$d"/*` and the /*|/ case patterns are not literals of the form matched above
    assert.ok(allowed.has(l), `unexpected absolute path literal in the script: ${l}`);
  }
  for (const needle of [["/home", "/"].join(""), ["/Users", "/"].join(""), ["soul", "lab"].join(""), ["mini", "sforum"].join(""), ["192", "168"].join(".")]) {
    assert.ok(!SCRIPT_TEXT.toLowerCase().includes(needle.toLowerCase()), `the script must not mention ${needle}`);
  }
});
