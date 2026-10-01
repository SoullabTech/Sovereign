# JARVIS-ORCHESTRATION-OPERATOR-01 / O5-R3 — Runtime Binding Witness (R3-R11)

**Date:** 2026-10-01
**Base:** `ce061073` (O5-R3 implementation + freeze amendment 1). ⛔ **Kept frozen. No lease or ledger change.**
**Standing:** implementation complete · constitutional suite complete · ⭐ **Mac Studio integration witness complete** ·
⭐ rulings taken (§6): **launch mode A first · `runtime-binding.json` approved and built (§7), suite frozen** ·
⛔ **runtime-binding admission pending the live walk (§8)**

> *Source truth and runtime truth are not the same thing.* R3-R11: admission witnesses the exact checkout SHA
> the participating Desktop/JARVIS process runs.

## 1. Mac Studio integration witness: COMPLETE (founder-run)

From a detached worktree at `ce061073` on the Mac Studio's filesystem, exit 0:

| Check | Result |
|---|---|
| `npm run test:jarvis-o5-r3` | PASS. This covers the real two-process races, takeover, live-holder refusal, incarnation through `ps -o lstart=`, the R3-R12 durability order and torn UTF-8 recovery, on APFS |
| `npm run matrix:jarvis-o5-r3` | LETHAL + DISCRIMINATING · CLASS A AS PREDICTED. DC-C2 dies for *"the never-dispatched grant was acted on"* |
| `npm run verify:jarvis-o5-r3-freeze` | FREEZE INTACT |

## 2. Runtime situation observed (founder-run census, 2026-10-01)

- `/Applications/JARVIS.app/Contents/Resources/build-info.json`: `app_build_sha 652847596` = **`6528475966e5588a795ec44adc61f896eedbf90a`**
  (*fix(jarvis): render grounded claims from canonical source excerpts*), `built_at 2026-09-24T17:26:45.413Z`.
  It **predates `ce061073`**, so this installed build is **lease-unaware**.
- **JARVIS.app was not running.** The build stamp is installed-build evidence, ⛔ not runtime evidence.
- **No active process matched any grant-writer entry point** (`work-unit-control` · `o5-recovery-census` ·
  `o5-path-b-recovery` · `canonical-provider-execution-grant` · `human-provider-execution-grant` ·
  `grant-writer-lease`). Several Next.js dev processes in JARVIS worktrees are running; none is established as a grant writer.
- `~/MAIA-SOVEREIGN` is at `e8868884…` on an older branch. ⛔ That checkout's HEAD is not evidence of the Desktop runtime SHA.

⛔ **"JARVIS is closed" is not admission.** It shows there is no writer now. It does not show what writer will
run.

## 3. Step 3: how Desktop selects its runtime code (from source at `ce061073`)

### 3.1 Desktop's runtime identity is two things, and only one is a SHA

`jarvis-desktop/src/provenance.js` (F3 "dual provenance") already names both, and it refuses to present one as
the other:

| | What it is | Where it comes from |
|---|---|---|
| **ARTIFACT identity** | the Desktop's own code: `main.js`, `work-unit-control.js` (the R3 *callers*: `grantWriter`, `will-quit` release, surfaced returns) | **packaged:** the app bundle; `build-info.json` names its SHA. **unpackaged:** the source tree it was launched from; artifact identity is `UNKNOWN` by design |
| **SUBSTRATE identity** | the checkout whose files supply the R3 **stores** (`grant-writer-lease-v1`, `grant-ledger-core-v1`, both grant stores) | the bound root. `importBound(root, rel)` re-imports from that checkout's **working tree on every call** (`?t=Date.now()`) |

⭐ **The store version is the bytes on disk in the bound checkout at the moment of each call, not a commit.** A
dirty tree, or a branch switch in that checkout while Desktop runs, changes the code that writes grants. HEAD
alone therefore proves nothing about the stores; HEAD **plus a clean tree plus blob hashes** does.

### 3.2 Packaged-mode resolution order (`findRepoRootPackagedMode`)

1. `JARVIS_REPO_ROOT` from the launch environment. **It can be set at the launchd level and then is inherited
   invisibly** by Finder/Dock launches. It outranks a saved choice; F3 reports that as DEGRADED, not hidden.
2. `~/Library/Application Support/JARVIS/config.json` (Preferences selection), as `explicit-config`.
3. ⚠️ **The hard-coded default `/Users/soullab/MAIA-SOVEREIGN`**, as `implicit-default` (reported DEGRADED).
4. Otherwise nothing is bound.

The root can also be **re-bound while Desktop is running**, through Preferences (choose or clear).

### 3.3 ⭐ The finding: the default path lands on the legacy combination

`~/MAIA-SOVEREIGN` is at `e8868884…`, an older branch with **pre-R3 stores**. Suppose the installed
`652847596` launches with no `JARVIS_REPO_ROOT` and no `config.json` binding. It falls through to the hard-coded
default, and the result is:

> **pre-R3 app + pre-R3 stores = the legacy writer.** There is no lease. For human-provider grants there is no lock
> at all.

That is the exact configuration R3-R11 exists to exclude. It is a launch away, not hypothetical. The census
could not see it because nothing was running.

### 3.4 All four combinations

| App code | Bound stores | Behaviour |
|---|---|---|
| pre-R3 | R3 | grant writes refused `WRITER_LEASE_NOT_HELD`; safe, but Desktop cannot authorize |
| R3 | pre-R3 | `grantWriter` fails: "bound repository is missing scripts/builder/grant-writer-lease-v1.mjs"; safe, also broken |
| **pre-R3** | **pre-R3** | ⛔ **legacy writer** (§3.3) |
| R3 | R3 | conforming |

Only the last row is admissible, and only the third is dangerous. Every mismatch between the two fails closed.

### 3.5 What exists, and what is missing, for a witness from the live process

- **Exists:** F3 already computes `resolved_repo_root @ head, dirty, resolution` and the artifact identity, and
  shows them in Desktop's UI (`jarvis:repo-config`).
- **Missing:** a record an **external** witness can read that binds a **live process** (pid + incarnation) to
  those identities. Today they are in-process and UI-only. A screenshot is evidence of a rendering, not of the
  process.
  - `ps` gives pid, `lstart` and arguments, but not the bound root, unless `JARVIS_REPO_ROOT` happens to be in
    its environment.
  - `lsof` cannot show the stores, because they are imported and closed.
  - ⛔ Per the founder's direction, we do not hunt for a historical binding record that may not exist.

## 4. Options for steps 4–6 (for ruling)

**Launch mode:**

- **A. Unpackaged from a `ce061073`-containing worktree** (`npm start` in `jarvis-desktop/`). App code and stores
  come from **one** checkout, because dev mode walks up from its own source. This is the simplest lawful single
  identity, and it needs no packaging. Artifact identity reads `UNKNOWN` **by design**, so the witness is the
  substrate SHA, which then is the whole runtime.
- **B. Packaged build stamped at a `ce061073`-containing SHA**, bound by `config.json` to a **clean** checkout at a
  `ce061073`-containing SHA. This is the production shape, and it is two identities that must both be witnessed.

**Runtime record (the missing primitive, §3.5):** have Desktop write a small read-only **runtime binding record**
outside the delegation home. For example, `~/Library/Application Support/JARVIS/runtime-binding.json`, written at
launch and on every re-bind, containing: `pid` · incarnation (via the lease module's own probe, so it compares
directly with lease records) · artifact identity · substrate identity (root, HEAD, dirty, resolution) · blob hashes
of the four R3 store files.

- It touches no lease or ledger code and writes nothing in the delegation home, so CENSUS-9 holds.
- It needs a founder act, because it is new Desktop behaviour.
- Without it, the witness must stitch `ps` + `config.json` + the bound checkout's git state together by
  inference, which is entailment, not witness.

**Witness content (step 6), either way:** live pid + `lstart`; artifact identity; bound root + HEAD + `dirty=false`
+ the four blob hashes matching `ce061073`; delegation home; a process census showing **no other grant writer**,
including no script running from a pre-R3 checkout; the lease generation and holder.

Then **step 7**: while that runtime is alive, one real grant mutation (Desktop becomes holder), plus a second
process (`census --write`) refused `GRANT_WRITER_LEASE_UNAVAILABLE`.

## 5. Not done, not claimed

- ⛔ No code changed by this record. ⛔ R3 is **not** admitted.
- ⛔ Clean worktree hygiene is outside this act. Pre-R3 store code stays on disk in older worktrees, so the
  no-legacy-writer property is **point-in-time**, witnessed at the moment of step 6, not permanent.

**Standing: MAC STUDIO INTEGRATION WITNESS ✅ · RUNTIME BINDING ⛔ PENDING · installed build `6528475` pre-R3 and
not running · ⚠️ DEFAULT ROOT `~/MAIA-SOVEREIGN` IS PRE-R3, so a bare relaunch would be the legacy writer ·
founder rulings owed: launch mode A/B · runtime binding record yes/no.**

---

## 6. Founder rulings (2026-10-01)

**Ruling 1: launch mode A first.** Run unpackaged Desktop from a clean worktree whose HEAD contains `ce061073`.
Mode A collapses app-code identity and store-code identity into one checkout. *We are trying to prove the lease
law, not package distribution yet.*

Required for the witness:
- the worktree is clean;
- HEAD ⊇ `ce061073`;
- Desktop is launched from that worktree with `npm start`;
- no `JARVIS_REPO_ROOT` points elsewhere;
- the bound checkout is witnessed to be that same worktree;
- Desktop stays alive for the whole two-process test.

The packaged build identity reading "unknown" is acceptable **for this development witness only**. **B**
(packaged) becomes the production-binding witness, not a prerequisite for proving R3.

**Ruling 2: `runtime-binding.json` approved.**
> *A live writer must leave a contemporaneous, externally inspectable witness of the code and checkout authority
> under which it is operating.*
>
> **The record describes the current binding; possession of the record grants no authority whatsoever.**

Lifecycle:
- write atomically at startup, after binding resolution;
- rewrite atomically whenever the bound checkout changes;
- on quit the record may be marked terminated, but **truth never relies on cleanup**: pid + process start time
  separate a stale witness from the living process.

**Named next boundary, ⛔ not repaired here.** *No writable production Desktop may silently fall through to an
unverified checkout.* The hard-coded `/Users/soullab/MAIA-SOVEREIGN` fallback is now an identified unsafe path.
The direction is to fail closed when neither the environment nor Preferences supplies an admissible binding. It
needs its own falsifier and ruling, so it is not smuggled into this witness.

## 7. Built (`c9285aae`, frozen; reader added after)

### 7.1 `jarvis-desktop/src/runtime-binding.js` writes `~/Library/Application Support/JARVIS/runtime-binding.json`

Fields:
- **Founder's minimum:** `pid` · `processStartedAt` · `writtenAt` · `app {mode, build, sourceRoot}` ·
  `binding {repoRoot, selectionSource, head, clean}` · `stores {4 × sha256}`.
- **Added, all descriptive:** `version` · `law` (the no-authority sentence, carried in the record itself) · `host`
  (a local probe can judge only a local pid) · `delegationHome` (step 6 needs it) · `env.JARVIS_REPO_ROOT` (shows
  that no override is in force) · `terminatedAt`.

Decisions behind the fields:
- **`processStartedAt` is the lease's own probe, in the lease's own format.** `/proc` starttime + boot id on
  Linux, `ps -o lstart=` otherwise. So the record and a lease generation record compare **field for field**
  (R3-R7's *same probe, same unit*).
- **`stores` hashes the bound checkout's WORKING-TREE bytes**, because those are what `importBound` loads, not
  git's committed blobs. An absent file is `null`, never omitted. So a pre-R3 checkout **shows** as pre-R3.
- **`selectionSource`** maps provenance resolution to your vocabulary: `JARVIS_REPO_ROOT` · `config.json` ·
  `fallback`. Plus `dev-walk`, ⚠️ **a fourth value your schema didn't list**. It is mode A's truthful source
  (launched from inside the checkout), and I recorded it rather than mislabel it.
- **Atomic write:** temp file → fsync → rename → directory fsync.
- **Liveness:** `judgeLive()` returns LIVE / STALE (pid gone **or reused with another incarnation**) /
  UNDETERMINABLE (another host) / TERMINATED / UNREADABLE.

**Wiring** (`main.js`):
- `writeRuntimeBinding('startup')` is the first act after `app.whenReady`;
- `writeRuntimeBinding('rebind')` opens `broadcastRepoChange`, which every runtime re-assignment of `RESOLVED`
  already calls;
- `will-quit` marks our own record terminated, and never another process's.

A write failure is logged, not fatal: no record simply means no admission evidence. It writes outside the
delegation home, so CENSUS-9 (read-only startup) holds.

### 7.2 Falsifiers: `npm run matrix:jarvis-o5-r3-rb` → **LETHAL + DISCRIMINATING · WIRING INTACT**

The subject is the **real** module, with real git repositories and real processes. 12 candidates die on their
named falsifier, with 2 classified collateral deaths.

| Falsifier | Law | Killed candidates (recorded reason) |
|---|---|---|
| RB-1 | startup produces a complete record, atomically, with the lease's own incarnation | DC-RB1a written in place · DC-RB1b wall-clock incarnation, *"is not the lease's own probe"* (collateral RB-5: such a record can never read LIVE) |
| RB-2 | a re-bind rewrites every field | DC-RB2 captured once and reused |
| RB-3 | a stale pid or incarnation never reads as live, including **(g) a real exited writer** | DC-RB3a pid alone · DC-RB3b file exists = live · DC-RB3c host ignored |
| RB-4 | hashes are the bound checkout's working tree; absent = `null`; dirty ≠ clean | DC-RB4a committed blobs · DC-RB4b app source tree (collateral RB-2) · DC-RB4c absent omitted · DC-RB4d clean = HEAD resolves |
| RB-5 | **no authority**: a convincing LIVE record without the lease → `WRITER_LEASE_NOT_HELD` (real store); the lease holder writes with the record corrupt or absent | DC-RB5a record trusted as authority · DC-RB5b authority made to depend on the record |

**Wiring checks** run against the real `main.js` and codebase, with comments stripped before scanning:
- RB-W1 startup write first;
- RB-W2 re-bind write first;
- RB-W3 every runtime `RESOLVED =` is followed by `broadcastRepoChange()`;
- RB-W4 terminated on quit;
- RB-W5 **no file in `scripts/builder/` or `jarvis-desktop/src/` other than `main.js` and the module itself
  references the record**, and `main.js` never reads or judges it.

**Mutation checks on the shipped code**, all killed:
- delete the startup write → RB-W1;
- delete the re-bind write → RB-W2;
- delete terminate-on-quit → RB-W4;
- make `work-unit-control.js` require the module → RB-W5;
- copy instead of atomic rename → RB-1;
- liveness by pid alone → RB-3;
- clean = HEAD resolves → RB-4.

**Regressions:**
- Desktop failure set **identical by name** to baseline;
- O5-R2 Desktop tests 22/0;
- `test:jarvis-o5-r3` 17/0.

**Freeze:** `tests/constitutional/jarvis-o5-r3-runtime-binding/FREEZE.json` pins `falsifiers.mjs`,
`candidates.mjs` **and `matrix.mjs`** (it carries the RB-W wiring law, and this suite has no Class A flip) at
`c9285aae`. `npm run verify:jarvis-o5-r3-rb-freeze` is proven lethal both ways. The module and `main.js` stay
unfrozen. They are bound by the suite.

### 7.3 Reader: `scripts/builder/o5-r3-runtime-witness.mjs`

Read-only. It writes nothing, and its verdict confers nothing. It checks:
- the record is LIVE;
- mode A holds: development, source root = bound root, `dev-walk`, no foreign `JARVIS_REPO_ROOT`;
- record HEAD = HEAD now, and HEAD contains `ce061073`;
- the tree is clean in the record and now;
- all four store hashes are present and equal to the bytes on disk now;
- the lease generation, and whether its holder **is this Desktop** (host + pid + incarnation equal);
- a process census of other grant-writer entry points.

⚠️ The census matches **command lines**, so it is a heuristic. A process importing a store through a
differently named script won't show, and a shell whose text merely mentions one will. A hit is a question to
answer, and a clean census is point-in-time evidence. Exercised here against a simulated live writer: every
binding check passes. As expected in this container, `clean` fails (uncommitted tree), and the census flags this
session's own shell.

## 8. The admission walk (Mac Studio, steps 4–9). zsh-safe: no comments in the commands

**Step 4: a clean mode-A worktree at the branch tip, then launch it.**
```
cd ~/MAIA-SOVEREIGN && git fetch origin claude/modest-goldberg-c6avhc
git worktree add --detach ~/.claude/worktrees/o5r3-admit origin/claude/modest-goldberg-c6avhc
cd ~/.claude/worktrees/o5r3-admit && git rev-parse HEAD && git merge-base --is-ancestor ce061073 HEAD && echo CONTAINS-ce061073
launchctl getenv JARVIS_REPO_ROOT
cd jarvis-desktop && npm ci && cd .. && git status --porcelain
cd jarvis-desktop && npm start
```
`git status --porcelain` must print nothing; `node_modules/` is ignored.

**Step 5: witness the live binding** (second terminal, Desktop running).
```
cd ~/.claude/worktrees/o5r3-admit && node scripts/builder/o5-r3-runtime-witness.mjs > ~/o5r3-witness-step5.txt; tail -20 ~/o5r3-witness-step5.txt
```
Expect every check PASS **except** "lease holder is this Desktop", which is expected only after step 6.

**Step 6: one real grant write from Desktop.** Authorize once on a Work Unit in the Desktop UI. This mutates the
real delegation home; the ruling authorizes one write. Then:
```
node scripts/builder/o5-r3-runtime-witness.mjs > ~/o5r3-witness-step6.txt; tail -20 ~/o5r3-witness-step6.txt
```
Expect **RUNTIME BINDING WITNESSED**, including `HELD_BY_THIS_DESKTOP`. That means the lease generation names the
same host, pid and incarnation as `runtime-binding.json`.

**Step 7 + 9: a second writer is refused, and nothing changes.** Same worktree, Desktop still alive. Snapshot the
ledgers and the lease, run the second writer, snapshot again:
```
find ~/.claude/ain-delegation/work-units-v2/execution-grants ~/.claude/ain-delegation/execution-grants ~/.claude/ain-delegation/grant-writer-lease -type f -exec shasum -a 256 {} + | sort > ~/o5r3-before.txt
node scripts/builder/o5-recovery-census.mjs --write --admit sha256:step7-refusal-probe > ~/o5r3-step7.json; cat ~/o5r3-step7.json
find ~/.claude/ain-delegation/work-units-v2/execution-grants ~/.claude/ain-delegation/execution-grants ~/.claude/ain-delegation/grant-writer-lease -type f -exec shasum -a 256 {} + | sort > ~/o5r3-after.txt
diff ~/o5r3-before.txt ~/o5r3-after.txt && echo NOTHING-CHANGED
node scripts/builder/o5-r3-runtime-witness.mjs | tail -3
```

Requirements:
- step 7 returns `"refused": "GRANT_WRITER_LEASE_UNAVAILABLE"`, `"lease_reason": "HOME_LEASE_HELD"`, and a
  `holder.pid` equal to the record's `pid`;
- `NOTHING-CHANGED`: the ledgers and lease are byte-identical, so no second write occurred;
- the reader still reports the Desktop as LIVE holder.

The `--admit` value is irrelevant, because `census --write` takes the lease **before** reading the census. So
the refusal comes first and writes nothing.

**Then:** quit Desktop. The lease releases (a released generation appears), and `runtime-binding.json` gains
`terminatedAt`. Keep the four `~/o5r3-*` evidence files local; they hold machine paths.

Step 10 is a founder act: O5-R3 is admitted only on the complete walk. Then package B and repeat with separate
app and checkout identities.

**Standing: RULINGS RECORDED · RUNTIME BINDING WITNESS BUILT · SUITE FROZEN @ `c9285aae` (RB-1…RB-5, 12/12, wiring
5/5) · READER READY · ⛔ ADMISSION WALK OWED (Mac Studio, mode A) · ⛔ FALLBACK FAIL-CLOSED: NAMED, NOT REPAIRED ·
⛔ NOT MERGED · PRODUCTION UNTOUCHED.**
