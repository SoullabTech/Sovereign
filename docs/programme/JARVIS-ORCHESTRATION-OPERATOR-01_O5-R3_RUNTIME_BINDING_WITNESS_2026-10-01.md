# JARVIS-ORCHESTRATION-OPERATOR-01 / O5-R3 — Runtime Binding Witness (R3-R11)

**Date:** 2026-10-01
**Base:** `ce061073` (O5-R3 implementation + freeze amendment 1). ⛔ **Kept frozen. No lease or ledger change.**
**Standing:** implementation complete · constitutional suite complete · ⭐ **Mac Studio integration witness complete** ·
⭐ rulings taken (§6): **launch mode A first · `runtime-binding.json` approved and built (§7), suite frozen** ·
⭐ **O5-R3 ADMITTED by the successful 2026-10-02 live walk (§15); provider execution remained outside the witness**

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

### 7.3 Reader: `scripts/witness/o5-r3-runtime-witness.mjs`

It is read-only: it writes nothing in the delegation home, and its verdict confers nothing. Its structure is the one
ruled in §9.2. It was **moved out of `scripts/builder/`** before the walk; §9.4 gives the reason.

## 8. The admission walk (Mac Studio). zsh-safe: no comments in the commands

**The walk is boring by design.** If any expected result does not appear:
- stop;
- keep every output file;
- diagnose afterwards.

⛔ Do not modify the implementation, the checkout or the delegation home inside the walk. A modified tree also
fails C4 by construction.

**Step 4: a clean mode-A worktree at the branch tip, then launch it.**
```
cd ~/MAIA-SOVEREIGN && git fetch origin claude/modest-goldberg-c6avhc
git worktree add --detach ~/o5r3-witness-WALK origin/claude/modest-goldberg-c6avhc
cd ~/o5r3-witness-WALK && git rev-parse HEAD && git merge-base --is-ancestor ce061073 HEAD && echo CONTAINS-ce061073
launchctl getenv JARVIS_REPO_ROOT
cd jarvis-desktop && npm ci && cd .. && git status --porcelain
cd jarvis-desktop && npm start
```
Expected:
- `launchctl getenv` prints nothing;
- `git status --porcelain` prints nothing (`node_modules/` is ignored).

**Step 5: witness the live binding, before any grant write** (second terminal, Desktop running). *Amended by
§10 (RB-A1): this is a pre-write baseline, judged with `--phase pre-write`.*
```
cd ~/o5r3-witness-WALK && node scripts/witness/o5-r3-runtime-witness.mjs --phase pre-write --await-current-ms 60000 --snapshot ~/o5r3-prewrite.json > ~/o5r3-step5b.txt; tail -25 ~/o5r3-step5b.txt
```
Expect:
- readiness READY for this exact worktree before constitutional sampling;
- C1–C5 PASS;
- C6-pre PASS with `NOT_YET_HELD` (no history) **or** `NOT_YET_HELD_AFTER_RELEASE` (released history, e.g.
  `generation 2 released at …`);
- verdict `PRE-WRITE BASELINE PASS — C1–C5 + C6-pre (a baseline, not admission)`, exit 0.

Any other C6-pre standing (`HELD_BY_OTHER_LIVE`, `UNRELEASED_HOLDER_GONE`, `UNDETERMINABLE`, `MALFORMED`,
`HELD_BY_THIS_DESKTOP`) stops the walk. ⛔ Never clear or edit lease history to reach a pass.

**Step 6: one real grant write from Desktop.** Authorize once on a Work Unit in the Desktop UI. The ruling
authorizes this one write to the real delegation home. Then:
```
node scripts/witness/o5-r3-runtime-witness.mjs --prewrite ~/o5r3-prewrite.json > ~/o5r3-step6.txt; tail -25 ~/o5r3-step6.txt
```
Expect:
- C1–C5 + **C6A** + C6 PASS, verdict `CONSTITUTIONAL PARTIAL — C7, C8 pending` (exit 2); C6A names `generation 3 acquired` and the one changed ledger (§12);
- the two identity lines printing the **same** pid and process start time, with the lease generation shown.

**Step 7: snapshot, refuse a second writer, judge.** Same worktree, Desktop still alive, ⛔ no UI activity from here
until the verdict:
```
node scripts/witness/o5-r3-runtime-witness.mjs --snapshot ~/o5r3-before.json > /dev/null; ls -l ~/o5r3-before.json
node scripts/builder/o5-recovery-census.mjs --write --admit sha256-step7-refusal-probe > ~/o5r3-refusal.json; cat ~/o5r3-refusal.json
node scripts/witness/o5-r3-runtime-witness.mjs --prewrite ~/o5r3-prewrite.json --refusal ~/o5r3-refusal.json --before ~/o5r3-before.json --json ~/o5r3-evidence.json > ~/o5r3-step7.txt; cat ~/o5r3-step7.txt
```
The `--admit` value is irrelevant: `census --write` takes the lease **before** it reads the census, so the
refusal comes first and nothing is written. Expected:
- the refusal reads `"refused": "GRANT_WRITER_LEASE_UNAVAILABLE"` and `"lease_reason": "HOME_LEASE_HELD"`;
- the refusal carries `lease_generation` and `holder.{host, pid, process_start_time, generation}`;
- the final verdict is **`CONSTITUTIONAL PASS — C1–C8 + C6A witnessed`** (exit 0).

**Step 8: quit Desktop.** The lease releases (a released generation appears), and `runtime-binding.json` gains
`terminatedAt`. Optional confirmation:
```
node scripts/witness/o5-r3-runtime-witness.mjs | grep -E "C1|C6"
```
This should report `TERMINATED` and `released at generation N`.

Keep `~/o5r3-step5.txt`, `~/o5r3-step6.txt`, `~/o5r3-before.json`, `~/o5r3-refusal.json`, `~/o5r3-step7.txt` and
`~/o5r3-evidence.json` local. They hold machine paths and are not committed; the record cites their verdict lines.

## 9. Founder rulings before the walk (2026-10-01)

### 9.1 Status

The status is **IMPLEMENTED + FROZEN TEST INSTRUMENT · ⛔ NOT ADMITTED**. The implementation boundary is judged
strong enough to hold, and the live walk proceeds.

`selectionSource: "dev-walk"` is kept. It is recorded as an **additive vocabulary amendment** to Ruling 2's
minimum schema: one new value naming launch mode A. It is not a semantic change, and no existing value changed
meaning.

### 9.2 Evidence hierarchy: two tiers, never mixed

**Constitutional evidence.** This tier alone decides the verdict:

| | Witnessed |
|---|---|
| C1 | binding record LIVE, incarnation-correct (host + pid + process start time, probed as the lease probes) |
| C2 | checkout identity: mode A (development, source root = bound root, `dev-walk`, no foreign `JARVIS_REPO_ROOT`), record HEAD = HEAD now |
| C3 | required ancestor `ce061073` contained in HEAD |
| C4 | checkout clean, in the record and now |
| C5 | working-tree hashes of the four R3 stores = recorded hashes |
| C6 | lease `HELD_BY_THIS_DESKTOP`: `(binding.pid, binding.processStartTime) == (lease.pid, lease.processStartTime)`, same host |
| C7 | the second writer was refused `GRANT_WRITER_LEASE_UNAVAILABLE` / `HOME_LEASE_HELD` by **this** incarnation, **at the current lease generation** |
| C8 | every file under both grant-ledger trees and the lease directory is byte-identical across the refused attempt |

**Supporting operational census (S1).** The command-line process census is a heuristic. It can raise an
**ALARM** that must be answered before admission, but it can neither grant admission nor defeat it.

Why it is excluded: a process census can only show the *absence of visible* writers. The lease is what makes a
second writer **structurally unable** to write, and C7 + C8 witness exactly that.

> ⛔ *"Desktop appears to be this process, on this checkout"* never becomes *"therefore this process may write
> grants."* The lease alone answers the latter. Neither `runtime-binding.json` nor this verdict confers anything.

### 9.3 The refusal payload is preserved whole

Both refusal sites now return the lease generation that defeated the writer and the holder's full incarnation:
- `census --write` returns `lease_generation`, `refused_at`, and
  `holder.{host, pid, process_start_time, generation, acquired_at}`;
- Desktop's `grantWriter` returns the same fields, apart from `refused_at`.

C7 binds the refusal to the live binding (holder = this incarnation) **and** to the lease generation that is still
current at judgment time. So a refusal from an earlier or different generation fails.

Exercised against a simulated live writer:
- C1–C3, C5–C8 PASS (C4 fails there only because that tree carried uncommitted work);
- a refusal edited to generation 2 fails C7;
- an extra file dropped in the lease directory fails C8, naming the file.

### 9.4 ⚠️ Defect found and repaired: the reader sat in authority territory

At `2cdd490e` the frozen wiring law **RB-W5** ("no authority path reads the record") was **red**: the reader lived
in `scripts/builder/` and loads `runtime-binding.js`. RB-W5 scans `scripts/builder/` and `jarvis-desktop/src/`
as the places where grant authority lives.

That commit was pushed with the RB matrix failing, and the run was not read before committing. It is recorded
here rather than smoothed over.

The repair moves the instrument, not the law:
- the reader moved to `scripts/witness/`, beside the repository's other read-only witness instruments, which is
  its honest home;
- the frozen matrix is untouched, and `verify:jarvis-o5-r3-rb-freeze` is INTACT;
- `matrix:jarvis-o5-r3-rb` is again LETHAL + DISCRIMINATING · WIRING INTACT.

⚠️ RB-W5 scans by directory, so its perimeter is a convention, not a proof. What actually keeps the record
authority-free is that no lease or store code reads it. RB-W5 pins that for the directories where those live.

### 9.5 Admission criterion and statement

Admission requires all of the following:
- the step 7 verdict `CONSTITUTIONAL PASS — C1–C8 + C6A witnessed` (amended by §12) from a clean mode-A worktree;
- S1 QUIET, or its ALARM answered;
- the founder's act.

On that, the statement is narrow and exact:

> *On the witnessed Mac Studio incarnation, JARVIS Desktop proved that its runtime application identity, bound
> checkout identity, loaded grant-store content, and exclusive grant-writer lease referred to the same live
> Desktop generation. A second writer was refused without mutating the grant state. `runtime-binding.json`
> remained evidentiary only and conferred no grant authority.*

It admits nothing beyond that incarnation and that launch mode. Package B (separate app and checkout
identities) remains a separate witness.

### 9.6 Named for after admission: O5-R4 — Silent Repository Fallback (⛔ not touched)

> *Desktop must never silently acquire a grant-store authority from `~/MAIA-SOVEREIGN` merely because explicit
> runtime binding is absent.*

The default direction is no silent authority-bearing fallback (§3.3). The founder ruled: not now.

**Standing at §9 (superseded by §10):**
- rulings recorded;
- checker restructured (C1–C8 constitutional, S1 supporting);
- refusal payload preserved;
- RB-W5 defect repaired by relocation, freeze intact;
- regressions green: `test:jarvis-o5-r3` 17/0, `test:jarvis-o5-r2` green, `matrix:jarvis-o5-r3` lethal, both
  freezes intact;
- ⛔ admission walk owed (Mac Studio, mode A);
- ⛔ O5-R4 named, not opened;
- ⛔ not merged;
- production untouched.

## 10. Live walk, first attempt: stopped at Step 5 · instrument amendment RB-A1 (2026-10-01)

### 10.1 What the walk established before it stopped (founder-run, Mac Studio)

- `JARVIS_REPO_ROOT` unset.
- Worktree `/Users/soullab/o5r3-witness-b86079dc` at exactly `b86079dc14002980fdb02d337af6f489d4cd70d4`; contains
  `ce061073`; clean.
- `npm ci` completed, and Desktop launched from that checkout.
- Binding record: `development` · `dev-walk` · source = bound root · correct HEAD · `clean=true` · pid `42439` ·
  start `ps-lstart:Wed Sep 30 22:08:04 2026`.
- **C1–C5 PASS.**

**The stop.** Step 5 expected `C6 FAIL — no lease yet`; the checker reported `C6 FAIL — released at generation 2`.
The walk stopped as the procedure requires. ⛔ No grant write, census write, code change, checkout change or
delegation-home mutation was made. The failed witness is preserved, uncommitted, at `~/o5r3-step5.txt` on the Mac
Studio. It is not re-run and not overwritten; the re-run writes `~/o5r3-step5b.txt`.

### 10.2 What the real home carried

| Generation | Record |
|---|---|
| 1, held | `Kellys-Mac-Studio.local` · pid `24766` · `ps-lstart:Wed Sep 30 21:47:32 2026` · acquired `2026-10-01T02:03:42.939Z` |
| 2, release | `released: true` · `released_at 2026-10-01T02:04:36.639Z` |

The walked Desktop (pid `42439`, started 22:08:04) is a different incarnation. So there is **no live holder**, only
prior history that was correctly released.

### 10.3 Classification: an instrument defect, not a runtime-binding failure

The walk's real precondition is *"no live writer holds authority, and this Desktop does not hold the lease yet."*
The checker collapsed that into *"no lease history exists"*, so the witness depended on whether the home had ever
been used legitimately. On a persistent delegation home that is too strong.

A released generation is evidence of **absence** of current authority. ⛔ Lease history was **not** cleared to make
the walk pass, because that would destroy exactly the persistent-history condition the witness must observe.

> **Law (founder):** *Historical lease state may exist. What matters before the first write is that no live
> writer holds authority. After Desktop writes, the live lease must belong to this exact Desktop incarnation.*

### 10.4 The amendment (RB-A1), additive: no frozen byte edited

**Standing module.** `scripts/witness/o5-r3-lease-standing.mjs` (read-only, outside authority territory) judges
the lease **relative to one Desktop incarnation**. It uses the lease's own `judgeHolder`, so the checker and the
writer cannot disagree.

| Standing | Meaning | Pre-write | Post-write |
|---|---|---|---|
| `NOT_YET_HELD` | no generation exists | ✅ | ⛔ |
| `NOT_YET_HELD_AFTER_RELEASE` | latest generation is a well-formed release of the one before it | ✅ | ⛔ |
| `HELD_BY_THIS_DESKTOP` | latest generation held by this host + pid + incarnation | ⛔ (a write already happened) | ✅ |
| `HELD_BY_OTHER_LIVE` | latest generation held by a different live incarnation | ⛔ | ⛔ |
| `UNRELEASED_HOLDER_GONE` | never released; holder dead or its pid reused | ⛔ (the first write would be a takeover, a different witness) | ⛔ |
| `UNDETERMINABLE` | holder cannot be judged from this host | ⛔ | ⛔ |
| `MALFORMED` | latest generation unreadable, or the release chain broken | ⛔ | ⛔ |

**Two rules carry the safety:**
- **Only the latest generation decides.** A release earlier in history never vouches for the present.
- **A release is well-formed only as the release OF the generation immediately before it.** That generation must
  be a readable held record, with the same `owner_nonce`, a matching generation field and a valid `released_at`.

**Checker.** `--phase pre-write` evaluates **C6-pre** (pre-write standings only) and prints
`PRE-WRITE BASELINE PASS … (a baseline, not admission)`.
- It refuses `--refusal` / `--before`, so a baseline can never carry admission evidence.
- The default post-write C6 is **not weakened**: it requires the strict standing **and** the field-for-field pair
  `(binding.pid, processStartTime) == (lease.pid, processStartTime)`.

**Falsifiers.** `tests/constitutional/jarvis-o5-r3-runtime-binding/prewrite/`, run as
`npm run matrix:jarvis-o5-r3-rb-prewrite`, gives **LETHAL + DISCRIMINATING · WIRING INTACT**. PW-1…PW-9 run
against the real module:

| Falsifier | Law | Killer |
|---|---|---|
| PW-1 | empty home is a baseline | DC-PW10 (absence read as unknown) |
| PW-2 | released history is a baseline, even if the former holder still runs; this is the walked shape | DC-PW1 (the walked checker's semantics) |
| PW-3 | a live foreign holder blocks, even after an earlier release | DC-PW2 (any release vouches) |
| PW-4 | a dead unreleased holder is not a baseline | DC-PW4 |
| PW-5 | pid reuse is judged by incarnation, including this Desktop's pid in an older incarnation | DC-PW3 (pid-only liveness) |
| PW-6 | eight malformed shapes are never a baseline | DC-PW5 (lenient release) · DC-PW6 (unreadable = vacant) |
| PW-7 | post-write is strict and disjoint from pre-write | DC-PW7 |
| PW-8 | a foreign-host holder is undeterminable | DC-PW8 (host ignored) |
| PW-9 | the real reader on a real acquire + release + torn file | DC-PW9 (reader drops torn files) |

Collateral is classified as irreducible in three places:
- DC-PW2 hides every later generation;
- DC-PW6 must read PW-9's torn file as vacant;
- DC-PW7 grants exactly what PW-1/PW-2 forbid.

Wiring PW-W1…W5 includes a **live** run proving `--phase pre-write --refusal` exits 1.

**Mutations of the shipped module: 7/7 killed by a named falsifier.** M7 (predecessor shape unchecked) first
"died" only by a crash on the unreadable-predecessor case. That is a vacuous kill, so the suite gained the case
*release of a release*, and M7 now dies on PW-6 for its stated reason.

**Freeze.** The three prewrite files are added to the runtime-binding `FREEZE.json` with lineage entry **RB-A1**.
- The original `falsifiers.mjs` / `candidates.mjs` / `matrix.mjs` blobs are unchanged (`143b2957` / `cba31748` /
  `5bbd566d`).
- The guard was proven lethal both ways on a new entry.
- The original RB matrix is still LETHAL + DISCRIMINATING · WIRING INTACT.

### 10.5 ⚠️ Owed before admission: attribute generation 1

Lease acquisition happens only on a **writing** path:
- a Desktop grant mutation (issue, revoke, claim, confirm);
- a writing recovery pass;
- `census --write`.

Desktop startup recovery runs `write:false` and never takes the lease.

Generation 1 was held for 54 s and then **released**, and release happens on Desktop `will-quit` or at the end of a
census or recovery write. The shape fits a Desktop (started 21:47:32 local) that performed a grant mutation at
22:03:42 local and quit at 22:04:36.

⚠️ **That would be a real-home grant write before the walk, outside the walk's one authorized write.** It is not
assumed to be one. It is a question whose answer belongs in the admission record. Two read-only probes, in zsh:
```
find ~/.claude/ain-delegation/work-units-v2/execution-grants ~/.claude/ain-delegation/execution-grants -type f -newermt "2026-09-30 22:03:00" ! -newermt "2026-09-30 22:05:00" -print
ls -lT ~/.claude/ain-delegation/grant-writer-lease
```
If a ledger changed in that window, the record names which unit and which event, and who launched pid `24766`.
Then C8's "nothing changed across the refusal" is read against that known prior state. It does not block the
re-walk.

### 10.6 Re-walk

1. Quit Desktop pid `42439`, which releases nothing because it never held.
2. Run §8 Step 4 with the new tip in a **fresh** worktree (`~/o5r3-witness-WALK`; name it after the new short
   SHA).
3. Run §8 Step 5 with `--phase pre-write`. Expected: `NOT_YET_HELD_AFTER_RELEASE · generation 2 released at
   2026-10-01T02:04:36.639Z`.
4. Run Steps 6–8 unchanged. The first grant write takes **generation 3**, so C7 requires a refusal at generation 3.

⛔ Do not reuse `/Users/soullab/o5r3-witness-b86079dc`: it lacks the amended checker, and editing it would fail C4.

**Standing:**
- **IMPLEMENTED + FROZEN TEST INSTRUMENT · ⛔ NOT ADMITTED**;
- first live walk stopped at Step 5 on an instrument defect (C1–C5 PASS live), with its witness preserved;
- RB-A1 additive amendment built, lethal and frozen with lineage;
- generation 1 attribution owed;
- re-walk next;
- ⛔ O5-R4 untouched;
- ⛔ not merged;
- production untouched.

## 11. Founder ruling: close R3, do not expand it (2026-10-01)

### 11.1 Generation 1: three admissible attribution states

The §10.5 probes run exactly as recorded. The ruling then takes one of three states:

| State | Meaning | Effect on the walk |
|---|---|---|
| **ATTRIBUTED** | a concrete grant-writing artifact ties generation 1 to a specific writing act, authorized or not | none: a historical note |
| **BOUNDED BUT UNATTRIBUTED** | evidence shows a real prior write, but not which invocation caused it | none: a historical note, ⛔ not a constitutional defect |
| **CONTRADICTORY** | generation 1 could not have arisen through any currently understood write path | ⛔ **stops the walk** |

Attribution is evidentiary, not open-ended archaeology. It does not contaminate the fresh witness.

### 11.2 The fresh walk is a new specimen

It runs from a fresh worktree at `9028e47d` or later. There is no repair in place, and the failed `b86079dc`
worktree is not reused. Admission is decided from this walk alone.

### 11.3 Phrasing discipline

⛔ The pre-write state is never phrased as *"the lease is free"*. `NOT_YET_HELD` and `NOT_YET_HELD_AFTER_RELEASE`
are different evidence. The second says the home has history, that the history terminates coherently, and that
this incarnation has not yet entered it.

The distinction is kept because a later safety layer (multiple incarnations, crashes, recoveries, governed
executors) must not decay into *file exists / file doesn't exist*.

> *Past ownership is history. Present ownership is standing. A release only terminates the immediately preceding
> generation it actually belongs to.*

### 11.4 Admission rule

The fresh walk must produce:
- `C6-pre PASS — NOT_YET_HELD_AFTER_RELEASE · generation 2`;
- exactly one authorized write;
- C6 PASS (generation 3 held by this pid + incarnation);
- C7 PASS at generation 3;
- C8 PASS;
- `CONSTITUTIONAL PASS — C1–C8`.

On that result the record closes as follows:

> **O5-R3 — ADMITTED.** Runtime binding and execution-lease standing have been witnessed across historical
> incarnation turnover, with pre-write baseline discrimination, a single authorized acquisition,
> incarnation-bound current-holder proof, and post-write constitutional closure.

The §9.5 narrow statement still holds within it. Only after admission may O5-R4 be opened by its own explicit
act, against an admitted substrate.

### 11.5 ⚠️ A gap between the ruling's C8 and the instrument's C8, surfaced before the walk

The ruling describes C8 as *"compares against the pre-write baseline → only the authorized state transition
observed"*. The frozen instrument's C8 is narrower: grant ledgers and lease are byte-identical **across the
refused second-writer attempt** (snapshot taken after the write, before the refusal). As built, it says nothing
about the shape of the one write itself.

So a C8 PASS today does **not** witness *"only the authorized transition happened between baseline and post-write"*.

**Not changed inside the walk.** Two lawful options, and the choice is a founder act:
- **(a)** Keep C8 as defined and read the admission statement's *"a single authorized acquisition"* as carried by
  C6 + C7 plus the operator's own record of the one UI action.
- **(b)** Add, additively and frozen as its own lineage, a pre-write → post-write delta law. It would require:
  - the lease directory gains exactly the next generation, held by this incarnation;
  - grant-ledger changes are append-only (old bytes a prefix);
  - nothing else changes;
  - at most one Work Unit's ledger is touched.

**Evidence is preserved either way.** Step 5 now also writes `~/o5r3-prewrite.json`, a pre-write hash snapshot
taken under `--phase pre-write`, which carries no admission evidence. So option (b) can be judged against this
walk's actual baseline without re-walking.

## 12. Amendment RB-A2: C6A Authorized Transition Integrity (founder ruling: option b, 2026-10-01)

### 12.1 Why

The admission statement claims *"a single authorized acquisition"*. Frozen C8 proves only byte-identity **across
the refused second writer**. Without this amendment the record would be semantically ahead of its evidence:
*"single authorized acquisition"* would be reconstructed from the operator's recollection instead of proven.

**C8 is untouched.** It is not renamed, not broadened and not edited; it keeps its own snapshot view. The witness
now asks four distinct questions:

```
pre-write standing (C6-pre)
        ↓
authorized transition integrity (C6A)      ← new
        ↓
post-write current-holder proof (C6)
        ↓
second-writer refusal integrity (C7, C8)
```

### 12.2 The law

From the saved pre-write baseline (`--prewrite`) to the post-write state:

| | Rule |
|---|---|
| T1 | exactly one new lease generation exists, and it is the next one (max + 1) |
| T2 | that generation is held by this Desktop incarnation: host + pid + process start time, a well-formed held record with an owner nonce, never a release |
| T3 | prior lease history is unchanged: every earlier generation byte-identical, none removed |
| T4 | grant ledgers are append-only: none removed, none shortened |
| T5 | prior ledger bytes are unchanged: the old bytes are an exact prefix |
| T6 | no more than one Work Unit ledger changed; a newly created ledger counts |
| T7 | no other governed artifact changed |

**Scope (founder refinement): governed state only.** Four roots are covered:
- `grant-writer-lease/`
- `work-units-v2/execution-grants/`
- `execution-grants/`
- `grant-ledger-quarantine/`

Unit records, notes and everything else in the home are out of scope, so ordinary activity cannot make C6A
noisy. The legacy `<wu>.lock` is transient (exclusive create, unlinked after the append), so a lock that
survives a clean write **is** a governed change. A torn-tail recovery during the walk would show as T4
(shortened ledger) plus T7 (quarantine record). That is a stop to diagnose, never an authorized transition.

### 12.3 Built

**Judge.** `scripts/witness/o5-r3-transition-integrity.mjs` is read-only and outside authority territory. It
never reads the binding record. Snapshots now carry a `governed` size + hash view beside C8's unchanged `files`
view.

**Checker.**
- C6A is computed post-write only, from `--prewrite`, and placed before C6.
- A pre-write run refuses `--prewrite`, so a baseline cannot carry admission evidence.
- The verdict now reads `CONSTITUTIONAL PASS — C1–C8 + C6A witnessed`.

**Falsifiers.** `npm run matrix:jarvis-o5-r3-rb-transition` reports **LETHAL + DISCRIMINATING · WIRING INTACT**.
TI-1…TI-11 run on real homes on disk:

| Falsifier | Founder's defeat case | Killer |
|---|---|---|
| TI-2 two lease generations added | ✅ | DC-TI1 (count-insensitive) |
| TI-3 historical lease bytes rewritten / removed | ✅ | DC-TI2 (history by name) |
| TI-4 two Work Unit ledgers touched | ✅ | DC-TI3 (per-store limit) · DC-TI9 (new ledgers uncounted) |
| TI-5 existing grant entry mutated rather than appended | ✅ | DC-TI4 (size-only) |
| TI-6 foreign-incarnation holder (pid reuse, other host, release record, no nonce) | ✅ | DC-TI5 (pid-only identity) |
| TI-7 unrelated governed artifact (lock, quarantine, lease temp) | ✅ | DC-TI6 (ledgers-and-lease only) |
| TI-8 ledger shortened / removed | | DC-TI8 (shrink tolerated) |
| TI-9 no acquisition inside the transition | | DC-TI10 |
| TI-10 skipped generation number | | DC-TI11 |
| TI-11 non-governed state out of scope | | DC-TI7 (whole-home scope) |
| TI-1 lawful transition passes | | DC-TI12 (*"nothing else changed"* read as forbidding the authorized append) |

Two collaterals are classified as irreducible: DC-TI1 also kills TI-10, and DC-TI12 also kills TI-11.

**Wiring TI-W1…W6:**
- C6A uses the shipped judge;
- C6A is post-write only and precedes C6;
- **C8 is byte-for-byte the same check**;
- snapshots carry the governed view;
- a live run proves `--phase pre-write --prewrite` exits 1;
- the judge never reads the binding record.

### 12.4 What the instrument caught in itself before freeze

- **DC-TI10 first died for the wrong reason** (T2, not T1). TI-9 was reshaped so a baseline already holding the
  lease is falsifiable on its own.
- **TI-1 had no killer**, so DC-TI12 was added.
- **A "new generation is the latest" check was removed** as an equivalent mutant: T1 already guarantees it, so it
  could never be honestly claimed as tested.
- **Mutations of the shipped judge: 12 of 13 killed by a named falsifier.**
  - M13 (owner nonce unchecked) first survived, and TI-6 gained a *no owner nonce* case.
  - M1 (zero generations accepted by the count test) is **equivalent**: zero additions still fail the next-number
    test. It is recorded, not claimed.
- **End-to-end simulation of the walked shape** (released history → pre-write baseline + snapshot → one write →
  C6A → refusal) gave C6A, C6, C7 and C8 all PASS. A lingering `.lock` alone turned C6A FAIL.

**Freeze.** The three transition files are added to the runtime-binding `FREEZE.json` as lineage **RB-A2**.
- No earlier frozen blob changed.
- The guard was proven lethal both ways on a new entry.

**Standing:**
- **IMPLEMENTED + FROZEN TEST INSTRUMENT · ⛔ NOT ADMITTED**;
- RB-A1 + RB-A2 frozen;
- generation-1 attribution owed (§11.1);
- **the fresh walk starts only from a worktree at the commit containing this amendment, after the full frozen
  matrix is green**;
- ⛔ O5-R4 untouched;
- ⛔ not merged;
- production untouched.


## 13. Fresh walk #2 stopped at Step 5 · amendment RB-A3 Runtime Binding Readiness (2026-10-01)

### 13.1 Generation 1 attribution resolved

The §10.5 probes found one concrete grant-ledger artifact in the 22:03–22:05 window:
`work-units-v2/execution-grants/v2-determine-from-the-authorized-cano-mublc1n2.jsonl`.
Its `ISSUED` event is timestamped `2026-10-01T02:03:42.947Z`, 8 ms after generation 1 was acquired,
and carries `authorization_act: JARVIS_DESKTOP_E1_AUTHORIZE_ONCE` and
`actor_id: human:jarvis-desktop:soullab`.

**Classification: ATTRIBUTED.** This is a historical note only. It does not block or strengthen the fresh walk.

### 13.2 What the second fresh specimen established

A new detached worktree was created at exactly
`bd9df7db83735dd55919630501b7189eddd041f8`; it contains `ce061073`, `JARVIS_REPO_ROOT` was unset,
`npm ci` completed, and the worktree was clean. Desktop launched from that checkout.
Step 5 ran at 16:51:34 local, before the new Electron process had written its app-ready binding record.
The reader therefore still saw the preserved predecessor record:
`/Users/soullab/o5r3-witness-b86079dc`, pid `42439`, now STALE.

The checker correctly produced:
- C6-pre PASS — `NOT_YET_HELD_AFTER_RELEASE · generation 2`;
- C1 FAIL — stale predecessor binding;
- `PRE-WRITE BASELINE FAIL (C1)`.

The walk stopped. No grant write occurred.

At `2026-10-01T20:51:42.709Z`, after Step 5 had already stopped, the new Desktop wrote the exact
`bd9df7db` binding for pid `25720`, start `ps-lstart:Thu Oct 1 16:51:25 2026`.
That record carried `clean: null`, so it would not have satisfied C4 either.

The delegation home remained unchanged: only lease generations 1 and 2 existed. No Step 6/7 artifact was created.
The stopped files `~/o5r3-prewrite.json` and `~/o5r3-step5b.txt` are preserved.
### 13.3 Diagnosis

Two distinct readiness facts were being collapsed into timing:

1. **App-ready race.** `npm start` returning control/output did not mean the O5-R3 binding record for that
   Electron incarnation had been written. Sampling before `app.whenReady()` could therefore read a truthful
   but stale predecessor record.
2. **Cold repository probe.** `runtime-binding.js` gave each git probe a single 10 s timeout and collapsed
   a failure to `null`. The later `clean:null` is consistent with that timeout boundary. The exact child-process
   error was not retained, so the record does not claim more than that. Subsequent read-only calls to the same
   `gitState()` on the same worktree returned `clean:true` in roughly 0.1–0.5 s.

The safety behavior was correct—both shapes fail admission—but the walk depended on timing and could stop
needlessly before the actual specimen became observable.

### 13.4 RB-A3 law and repair

> **Runtime Binding Readiness.** Before constitutional sampling, the binding record must be LIVE for this exact
> walk worktree and exact HEAD, in dev-walk mode, with `clean=true`. A stale predecessor, another worktree,
> another HEAD, `clean=false`, or `clean=null` is never ready.
The repair is additive and does not alter RB, RB-A1, RB-A2, C6A or C8:

- `runtime-binding.gitState()` gives each repository identity fact one bounded retry: 10 s, then 30 s.
  A permanent failure remains `null`; it is never converted into clean or dirty certainty.
- `scripts/witness/o5-r3-binding-readiness.mjs` is a read-only classifier outside authority territory.
- the runtime witness accepts `--await-current-ms`; during that bounded wait it samples only the binding record.
  The wait grants nothing. On timeout, readiness remains false and C1 fails.
- Step 5 now uses `--await-current-ms 60000` before taking the pre-write snapshot.

The readiness matrix carries eight falsifiers and eight deliberately wrong versions:
transient probe not retried; permanent failure collapsed to false; stale liveness ignored; wrong worktree accepted;
wrong HEAD accepted; `clean:null` accepted; dirty accepted; and a barrier that can never open.
All are killed on their named rule.

**Standing:** RB-A3 is frozen as additive lineage; earlier frozen blobs remain unchanged. A new fresh walk is
required from the commit containing RB-A3. O5-R4 remains closed and production remains untouched.

## 14. Fresh walk #3 stopped after the authorized write · execution-boundary incident and recovery (2026-10-01)

### 14.1 Step 5 passed on RB-A3

A fresh detached specimen at `2a6bd1a6e8bc50ac8cdd5627eba7898ee61340df` passed the amended Step 5:
- readiness `READY`;
- C1–C5 PASS;
- C6-pre PASS — `NOT_YET_HELD_AFTER_RELEASE · generation 2`;
- `PRE-WRITE BASELINE PASS — C1–C5 + C6-pre`.

The saved files are `~/o5r3-w3-prewrite.json` and `~/o5r3-w3-step5.txt`.

### 14.2 The intended grant was issued, then the execution boundary was crossed

The prepared Work Unit was
`v2-witness-the-o5-r3-single-authorize-muq1l3w5`, primary participant QWEN,
transport `e1-ready-primary-0990055d798c`.

The real grant ledger records:
- `ISSUED` at `2026-10-01T21:47:22.074Z`, grant `e1-c5e48bd04800c6b9c2009077a0ff3df0`;
- `CLAIMED` at `2026-10-01T21:47:25.242Z`.

Lease generation 3 was acquired by the same Desktop incarnation, pid `85599`,
start `ps-lstart:Thu Oct 1 17:09:38 2026`.

That is a material divergence from the witness stop condition. The Work Unit moved to `EXECUTING`.
No durable result file was produced and no W4 execution attempt was recorded.
The founder reported that this path had crashed the system previously. Unified macOS logging around the incident
shows a burst of many Node processes beginning around 17:47:24, between ISSUED and CLAIMED. No matching
DiagnosticReports crash file was found. The record therefore does **not** claim that the Node burst caused the
whole-system crash; it records temporal correlation only.

### 14.3 UI safety defect and interlock

Source review established that Authorize Once and Confirm Execute are separate renderer handlers and separate IPC
actions. Authorize Once does not itself call Confirm Execute. The unsafe interaction shape was that an ACTIVE grant
immediately re-rendered the same participant row with a primary **Confirm Execute** button.

Repair commit `11f10ec0dbe550607a64d8f2af211cd43bae15e8` adds a separate, non-executing interaction epoch:

`Authorize this execution once → Review authorized execution → Confirm Execute`

The confirm handler refuses unless the exact grant has first been armed by the review gesture. E1 tests are 11/11
green. This repair does not change C6A, C8, the grant store or the provider execution mechanism.

### 14.4 Stranded authority classification and retirement

The first post-incident recovery census classified the grant
`DISPATCHED_WITHOUT_WITNESS_NO_PROBE / BLOCKED_BY_EVIDENCE / no_durable_result`.
That is outcome **UNKNOWN**: recovery may not replay the provider and may not manufacture a success/failure result.

A dedicated operator-retirement mechanism was built and tested at
`952748010acc8317642b7e0281237f70b7fb16c2`. Its isolated proof is 4/4:
- exact census digest required;
- exact Work Unit + grant required;
- dead or pid-reused lease holder must be proven;
- retirement is append-only `CLAIMED → INVALIDATED`;
- no `CONSUMED`, no W4 result, no provider replay;
- takeover lease is released afterward.

Before that new command was run on the real home, another concurrent governed lane had already retired the real
grant. The append-only ledger now carries:
`INVALIDATED · 2026-10-01T23:30:06.465Z · OPERATOR_RECOVERY_UNKNOWN_EXECUTION_OUTCOME`.
The new command therefore failed closed at preflight by observing that the census had changed.
### 14.5 Lease history after recovery

The recovery history is preserved, not normalized away:
- generation 3: prior Desktop holder, later proven dead;
- generations 4–6: subsequent proven-dead takeovers by short-lived recovery processes;
- generation 7: clean release after the operator invalidation;
- generations 8–12: later real grant-writer activity from other concurrent lanes;
- generation 13: clean release.

The latest observed standing is therefore
`NOT_YET_HELD_AFTER_RELEASE · generation 13`.

The admission walk must never hard-code a generation number again. The rule is:
**saved pre-write latest generation = N; the one authorized acquisition must be exactly N+1**.
At the time of this record N=13, so the next acquisition would be 14 only if no governed writer changes the home
before the new Step 5 baseline.

### 14.6 Regression standing and next boundary

On the candidate containing the execution interlock and retirement tooling:
- RB matrix: LETHAL + DISCRIMINATING · WIRING INTACT;
- RB-A1 pre-write matrix: LETHAL + DISCRIMINATING · WIRING INTACT;
- RB-A2 transition matrix: LETHAL + DISCRIMINATING · WIRING INTACT;
- RB-A3 readiness matrix: LETHAL + DISCRIMINATING · WIRING INTACT;
- O5-R3 writer proof: 17/17;
- stranded-retirement proof: 4/4;
- canonical E1 suite: 11/11.

**Standing:**
- **IMPLEMENTED + SAFETY-REPAIRED · ⛔ NOT ADMITTED**;
- generations 1–13 preserved as real history;
- stranded generation-3 grant retired append-only with outcome UNKNOWN;
- latest observed lease generation 13 released;
- a completely fresh witness specimen is required from a commit containing RB-A3 + the execution interlock;
- Step 5 establishes N; Step 6 must prove exactly N+1 and exactly one grant-ledger append;
- after authorization the UI must stop at **Review authorized execution**. Confirm Execute is outside this witness;
- ⛔ O5-R4 remains closed;
- production untouched.


## 15. Fresh walk #4 — successful constitutional admission (2026-10-02)

A fresh live witness was completed on the Mac Studio from repaired successor specimen
`711668e81b646d40ef638d7119c12f852e07ea54` (direct child of `37750a92f`).
The only successor change isolates explicit development witness instances; the O5-R3 authority stores and
constitutional witness logic remained the governed substrate.

### 15.1 Pre-write baseline

Step 5 ran against the live development-mode specimen with:
- checkout `/Users/soullab/o5r3-witness-711668e81`, clean;
- selection source `dev-walk`;
- runtime binding readiness `READY`;
- C1–C5 PASS;
- C6-pre PASS: `NOT_YET_HELD_AFTER_RELEASE · generation 62`;
- verdict `PRE-WRITE BASELINE PASS — C1–C5 + C6-pre`, exit 0.

The pre-write snapshot was preserved as `~/o5r3-w711-step5-prewrite.json`.
No grant authority was held by the witness Desktop at that baseline.

### 15.2 One authorized acquisition

The founder performed only the required Desktop gesture on Work Unit
`v2-witness-one-o5-r3-authorized-e1-gr-muq7hdkz`, PRIMARY · QWEN:
`Review exact execution → Authorize this execution once`, then stopped at
`Review authorized execution`.

The post-write witness recorded:
- Desktop incarnation pid `17775`, process start `ps-lstart:Fri Oct 2 11:32:16 2026`;
- lease generation `63`, held by that exact incarnation;
- C6A PASS: exactly one lawful acquisition and exactly one append-only ledger change;
- changed ledger:
  `work-units-v2/execution-grants/v2-witness-one-o5-r3-authorized-e1-gr-muq7hdkz.jsonl`;
- C6 PASS: `HELD_BY_THIS_DESKTOP`;
- verdict `CONSTITUTIONAL PARTIAL — C7, C8 pending`.

No provider execution was confirmed. `Review authorized execution` / `Confirm Execute` was not crossed,
and GPT_OSS was not authorized.

### 15.3 Second-writer refusal and closure

With the witness Desktop still holding generation 63, the governed refusal probe returned:
- `GRANT_WRITER_LEASE_UNAVAILABLE`;
- `HOME_LEASE_HELD`;
- holder pid `17775`, matching process start and generation `63`.

C7 PASS therefore witnessed structural refusal by the current holder.
C8 PASS witnessed all 88 governed files byte-identical across the refused attempt.

Final verdict:
`CONSTITUTIONAL PASS — C1–C8 + C6A witnessed`, exit 0.

The Desktop then terminated orderly at `2026-10-02T15:39:57.746Z`.
The lease history advanced to generation 64 released at `2026-10-02T15:39:57.759Z`.
Thus the final sequence is preserved as: 62 released baseline → 63 single authorized acquisition →
63 current-holder refusal proof → 64 clean release.

### 15.4 Admission standing

> **O5-R3 — ADMITTED.** Runtime binding and execution-lease standing have been witnessed across historical
> incarnation turnover, with pre-write baseline discrimination, a single authorized acquisition,
> incarnation-bound current-holder proof, second-writer refusal, byte-identical refusal closure,
> and orderly post-witness release.

This admission does not authorize provider execution, does not adjudicate model output, and does not itself
open O5-R4. O5-R4 requires its own explicit opening act against this now-admitted substrate.
Production remains untouched.
