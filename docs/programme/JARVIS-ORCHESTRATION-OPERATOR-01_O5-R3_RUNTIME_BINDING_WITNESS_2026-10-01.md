# JARVIS-ORCHESTRATION-OPERATOR-01 / O5-R3 — Runtime Binding Witness (R3-R11)

**Date:** 2026-10-01
**Base:** `ce061073` (O5-R3 implementation + freeze amendment 1). ⛔ **Kept frozen. No lease or ledger change.**
**Standing:** implementation complete · constitutional suite complete · ⭐ **Mac Studio integration witness complete** ·
⭐ **R3-R11 runtime-binding witness complete · O5-R3 admission evidence complete** · ⛔ merge still pending

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

## 6. Founder ruling carried out: Mode A is sufficient for this admission

For **this R3-R11 admission witness**, Mode A is accepted: an unpackaged Desktop launched from one clean detached
checkout is a single execution identity. A new persistent runtime-binding file is **not an admission prerequisite**
when the external witness can establish the same facts directly from the live process and filesystem. A durable
runtime-binding record remains useful later operational hardening, especially for packaged launches and re-binding,
but it is not retroactively made part of R3.

### 6.1 Live Desktop identity witnessed

A real Electron Desktop was launched from the detached witness checkout with an explicit substrate binding. While it
was alive, the Mac Studio reported:

- main PID: **13427**;
- process incarnation: **Wed Sep 30 21:38:36 2026**;
- executable: `.../o5r3-witness-chatgpt/jarvis-desktop/node_modules/electron/dist/Electron.app/Contents/MacOS/Electron .`;
- cwd: `/Users/soullab/.claude/worktrees/o5r3-witness-chatgpt/jarvis-desktop`;
- `JARVIS_REPO_ROOT=/Users/soullab/.claude/worktrees/o5r3-witness-chatgpt`;
- `AIN_DELEGATION_HOME=/Users/soullab/.claude/ain-delegation`;
- bound checkout: **`ce061073ea911270fed5dde59099b2b843079664`**;
- worktree: **clean**.

This is stronger than reading the installed app stamp: it identifies the checkout the participating live process was
actually running from and the substrate root it was explicitly told to execute through.

### 6.2 Execution-critical blobs matched `ce061073` byte-for-byte

| File | Git blob, working tree = `ce061073` |
|---|---|
| `scripts/builder/grant-writer-lease-v1.mjs` | `d02a5cba192042be4bc89093e9f7072ad2ae2505` |
| `scripts/builder/grant-ledger-core-v1.mjs` | `35c3d44f35e8d9ed3eba8981ab1f70f5d3bb12aa` |
| `scripts/builder/canonical-provider-execution-grant-store-v1.mjs` | `fdb99a51146d1a2bd9db8e383cf63bef7cf2b980` |
| `scripts/builder/human-provider-execution-grant-store.mjs` | `5b2d3d884b83f8361e2f55313022be9a3acfb953` |
| `jarvis-desktop/src/work-unit-control.js` | `9eb0762331a0364d1871060accb6bb493537b833` |

The live-process census found **no other grant-writer entry point active**. In particular there was no active
`work-unit-control`, `o5-recovery-census`, `o5-path-b-recovery`, canonical grant-store writer, human-provider
grant-store writer or grant-writer-lease process from another checkout.

### 6.3 Real Mac Studio holder/refusal boundary

Against an isolated temporary delegation home, the actual exported Desktop `grantWriter()` path from this same clean
`ce061073` checkout acquired generation 1 and stamped:

- host `Kellys-Mac-Studio.local`;
- PID `15533`;
- incarnation `ps-lstart:Wed Sep 30 21:39:31 2026`;
- owner nonce `f9fe34b9e9d4590abf0d58898e2d5c82`.

A second process calling the same Desktop path was refused:

`GRANT_WRITER_LEASE_UNAVAILABLE` → `HOME_LEASE_HELD`.

The durable lease record's start time matched `ps -o lstart=` for PID 15533 exactly. The temporary witness home and
processes were then removed. This is **not described as an Electron grant mutation**: it is a real-host proof of the
Desktop acquisition path from the identical witnessed checkout, while the live Electron runtime established the
R3-R11 binding separately. No production grant ledger was touched.

## 7. Operational consequence

The installed `/Applications/JARVIS.app` remains build `652847596...`, which predates R3, and the persisted Preferences
binding still names the September 24 worktree `kellys-world-b6r1r1-grounded-response-20260924`. Those facts do not
revoke this admission witness; they mean the **installed app is not yet an admitted R3 runtime** and must not be treated
as one merely because the R3 branch is admitted. Packaging/rebinding the installed Desktop is a separate deployment act.

**Standing: MAC STUDIO INTEGRATION WITNESS ✅ · R3-R11 LIVE RUNTIME BINDING ✅ · O5-R3 ADMISSION EVIDENCE COMPLETE ✅ ·
installed packaged Desktop still pre-R3 / stale-bound and therefore not yet an admitted deployment · merge pending.**

## 8. Real delegation-home live grant witness — stronger closing evidence

A second Mode A walk used the **real** delegation home `~/.claude/ain-delegation`, not an isolated temporary home. The unpackaged Electron runtime was launched from clean checkout `ce061073ea911270fed5dde59099b2b843079664`.

- live Electron PID **24766**, incarnation **Wed Sep 30 21:47:32 2026**;
- cwd `~/.claude/worktrees/o5r3-witness/jarvis-desktop`;
- no `JARVIS_REPO_ROOT` or `AIN_DELEGATION_HOME` environment override in that process;
- real delegation home `/Users/soullab/.claude/ain-delegation`;
- execution-critical R3 blobs matched the hashes already recorded in §6.2.

The live renderer selected canonical Work Unit `v2-determine-from-the-authorized-cano-mublc1n2`. Its page showed PRIMARY · QWEN transport `e1-ready-primary-d6ec13103f4a` READY with provider/model/adapter `qwen-local · qwen3-coder:30b · opencode`. Human authority remained bounded: no external network, spend or disclosure; write/merge/deploy/production denied.

The founder clicked **Authorize this execution once** for PRIMARY only. **Confirm Execute was not clicked.** The Desktop then created immutable lease generation 1:

- host `Kellys-Mac-Studio.local`;
- pid **24766**;
- `process_start_time: ps-lstart:Wed Sep 30 21:47:32 2026`;
- acquired_at `2026-10-01T02:03:42.939Z`.

The real canonical grant ledger was created with one and only one event, `ISSUED`, grant `e1-5264ecdcd9a23450aa632ee64a26c9f0`, one-shot and non-transferable. The Work Unit's authorized-core snapshot names evidence/source SHA `b40558cdac92258472053cdfdf11f4846431bb1d`; that is deliberately recorded separately from runtime SHA `ce061073...` so evidence identity is never conflated with execution identity.

A read-only census returned admissible with digest `sha256:92bee29c6f2440e6c6706b5e36e8588878469238c84becf4b1c2f0ba46ddd652`. A separate process then attempted the admitted write pass with that exact digest and was refused:

`GRANT_WRITER_LEASE_UNAVAILABLE` → `HOME_LEASE_HELD`, holder host `Kellys-Mac-Studio.local`, pid **24766**, acquired_at `2026-10-01T02:03:42.939Z`.

The Work Unit still had **0 provider attempts** and the grant ledger still contained only `ISSUED`: Authorize Once did not execute Qwen. On termination, generation 2 was created with `released:true`, the same owner nonce, and `released_at: 2026-10-01T02:04:36.639Z`.

Two observations are preserved rather than normalized away: the UI simultaneously displayed outer badge **ROUTED** and inner **Lifecycle: DRAFT · Next lawful gesture: none**; and the Work Unit source SHA `b40558cd...` differs from runtime SHA `ce061073...`. Neither weakened the E1 membrane in this walk, but both remain follow-up presentation/provenance items.

**Admission conclusion: O5-R3 ✅ ADMITTED on the Mac Studio.** The live runtime acquired the real grant-writer lease on first mutation; the durable lease matched its exact pid/incarnation; a competing real write pass was refused by that lease; no provider execution occurred; and release advanced the immutable generation sequence. Merge remains a separate repository act.

## 9. Canonical post-admission hardening lineage

Later the same day, a parallel O5-R3 branch continued hardening runtime-binding and grant-transition evidence beyond the admission criterion used above. Canonical reconciliation preserves the admission in §§6–8 exactly and carries those stronger mechanisms as post-admission amendments rather than retroactively changing the admission rule.

The reconciled lineage, crash incident, recovery acts, stronger C6A/C6B witness, and relationship to canonical O5-R4/O5-R5 are recorded in:

`docs/programme/JARVIS-ORCHESTRATION-OPERATOR-01_O5-R3_POST_ADMISSION_HARDENING_RECONCILIATION_2026-10-01.md`

The complete parallel source record remains available at Git commit `b19004cd5c1babbc20e83681bb8dad944c22f9bf`.

For any future post-admission runtime-binding witness, RB-A3 keeps the bounded readiness barrier in the Step-5 procedure:

`node scripts/witness/o5-r3-runtime-witness.mjs --phase pre-write --await-current-ms 60000 --snapshot ~/o5r3-prewrite.json`

This procedure note does not alter the earlier §§6–8 admission criterion; it governs later strengthened witnesses.
