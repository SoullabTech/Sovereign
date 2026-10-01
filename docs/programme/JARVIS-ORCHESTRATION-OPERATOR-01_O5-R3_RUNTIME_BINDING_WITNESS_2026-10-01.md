# JARVIS-ORCHESTRATION-OPERATOR-01 / O5-R3 — Runtime Binding Witness (R3-R11)

**Date:** 2026-10-01
**Base:** `ce061073` (O5-R3 implementation + freeze amendment 1). ⛔ **Kept frozen. No lease or ledger change.**
**Standing:** implementation complete · constitutional suite complete · ⭐ **Mac Studio integration witness complete** ·
⛔ **runtime-binding admission pending**

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

## 6. Mode A live runtime witness (2026-10-01)

Founder direction to continue was carried out with **Option A** from §4. The installed pre-R3 app was not used for admission. An unpackaged Electron runtime was launched from the clean detached O5-R3 witness checkout.

| Fact | Witness |
|---|---|
| live Electron PID | `24766` |
| incarnation | `Wed Sep 30 21:47:32 2026` via `ps -o lstart=` |
| command | Electron from `~/.claude/worktrees/o5r3-witness/jarvis-desktop/node_modules/electron` |
| cwd / app source | `~/.claude/worktrees/o5r3-witness/jarvis-desktop` |
| checkout HEAD | `ce061073ea911270fed5dde59099b2b843079664` |
| checkout dirty | **no** (dependency install is ignored; governed tree remains clean) |
| delegation home | `~/.claude/ain-delegation` |
| env override | none: no `AIN_DELEGATION_HOME` or `JARVIS_REPO_ROOT` in the live process |
| grant-writer process census | no separate writer entry point observed |
| lease generations before mutation | none |

R3 store blobs in that live checkout: lease `d02a5cba192042be4bc89093e9f7072ad2ae2505`; ledger core `35c3d44f35e8d9ed3eba8981ab1f70f5d3bb12aa`; canonical store `fdb99a51146d1a2bd9db8e383cf63bef7cf2b980`; human store `5b2d3d884b83f8361e2f55313022be9a3acfb953`.

The running renderer itself read the real delegation home through `window.jarvis.workUnitAction`. It found a canonical unit `v2-determine-from-the-authorized-cano-mublc1n2` in lifecycle **ROUTED** with no grants; its primary Qwen binding is READY, and `canonical-execution-auth-preview` returned **HELD_FOR_HUMAN_AUTHORIZATION**.

⭐ **R3-R11 runtime binding is therefore witnessed:** live process + incarnation + exact clean source checkout + exact R3 store blobs + actual delegation home + no competing writer are all observed together.

⛔ The final §4 step-7 authorization handshake was **not synthesized remotely**. The remote command layer refused the actual one-shot grant-issuance call. That safeguard was not bypassed. Consequently the stronger live proof "Desktop holds the lease while a second `census --write` is refused" remains owed as a founder-authorized human act.

**Standing: MAC/APFS ✅ · R3-R11 RUNTIME BINDING ✅ · NO LEGACY WRITER OBSERVED ✅ · FINAL LIVE GRANT-MUTATION / SECOND-WRITER REFUSAL ⛔ PENDING · NOT MERGED.**

## 7. Final live grant-writer witness — PASS

The founder clicked **Authorize this execution once** for PRIMARY · QWEN on canonical Work Unit `v2-determine-from-the-authorized-cano-mublc1n2`. **Confirm Execute was not clicked.**

- The live Desktop created lease generation 1 at `2026-10-01T02:03:42.939Z`, naming host `Kellys-Mac-Studio.local`, pid `24766`, and incarnation `ps-lstart:Wed Sep 30 21:47:32 2026`. This exactly matches the live Mode A Electron process witnessed in §6.
- The canonical grant ledger was created with exactly one `ISSUED` event: grant `e1-5264ecdcd9a23450aa632ee64a26c9f0`, participant `primary`, transport `e1-ready-primary-d6ec13103f4a`, one-shot + non-transferable, actor `human:jarvis-desktop:soullab`.
- The grant's authorized-core snapshot names source/canonical SHA `b40558cdac92258472053cdfdf11f4846431bb1d`. This is **Work Unit evidence identity**, distinct from the live runtime checkout `ce061073ea911270fed5dde59099b2b843079664`. Both identities are therefore recorded explicitly; neither is substituted for the other.
- The UI simultaneously showed badge **ROUTED** and inner lifecycle **DRAFT · Next lawful gesture: none**. That presentation disagreement is recorded as an observation. It did **not** weaken the execution membrane: the explicit E1 authorization review succeeded, while execution remained separate.
- Immediately after authorization, a read-only O5 census returned admissible with digest `sha256:92bee29c6f2440e6c6706b5e36e8588878469238c84becf4b1c2f0ba46ddd652`.
- A separate process then attempted `o5-recovery-census.mjs --write --admit <that digest>` and was refused exactly:
  `GRANT_WRITER_LEASE_UNAVAILABLE` / `HOME_LEASE_HELD`, holder host `Kellys-Mac-Studio.local`, pid `24766`, acquired_at `2026-10-01T02:03:42.939Z`.
- The target Work Unit still had **0 provider attempts**; the grant ledger still contained only the `ISSUED` event. Therefore Authorize Once did not execute Qwen.
- After the witness, PID `24766` was terminated normally. Generation 2 was created with `released:true`, the same owner nonce, and `released_at: 2026-10-01T02:04:36.639Z`. Release therefore preserved the immutable-generation protocol.

### Admission conclusion

**O5-R3 ADMITTED on the Mac Studio witness.** The constitutional matrix and freeze are intact; the APFS integration proof is green; a live conforming Desktop runtime at `ce061073` acquired the canonical grant-writer lease on first mutation; the exact lease identity matched its live pid/incarnation; a competing write process was refused by the held-home lease; no provider execution occurred; and release created the next immutable generation.

The two UI/source-identity observations above remain follow-up items, not R3 admission failures. Grant Writer Lease Recovery remains named and unbuilt. Lease-generation pruning remains out of scope.

**Standing: O5-R3 ✅ ADMITTED · NOT YET MERGED · production untouched by this witness.**
