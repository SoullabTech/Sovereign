# JARVIS-00 Binding Record — 2026-08-24

**Unit:** JARVIS-00C — close Gate Zero from existing JARVIS-00 evidence
**Scope:** B1, B2, B3 + repository-topology invariant. No JARVIS-01. No Deep
Agents / Semantica / TencentDB evaluation. No architectural redesign.

---

## 0. A correction, before anything else

The directive says *"update the existing
`JARVIS_00_BINDING_RECORD_2026-08-24.md`"*. **No such file existed.** It is not
in `SoullabTech/Sovereign` on any branch, and `git log --all --diff-filter=A`
finds no commit that ever added it. This document creates it.

Two further facts from the same check, because they bear directly on the
evidence this unit was asked to close from:

- **The cited SHAs are not in this repository.** `git cat-file -t` returns
  `Not a valid object name` for both `1bda3a023` (build) and `a2d9609ad`
  (operated). They exist only in unpushed local state on the Mac Studio, or in
  a different repository lineage. Either way **the JARVIS-00 build/operated
  divergence is not verifiable from the canonical remote.**
- **The named worktrees are not reachable from here.** `/Users/soullab/jarvis-runtime`
  and `/Users/soullab/jarvis-fix` do not exist in this environment.

This does not invalidate the finding. It means the finding is *founder-side
evidence* that this session cannot re-derive — and that distinction is itself an
instance of the invariant being established below. It is recorded rather than
worked around.

---

## 1. Session topology — the eight identities, uncollapsed

| Identity | Value |
|---|---|
| Repository | `/home/user/Sovereign/.git` (remote `github.com/SoullabTech/Sovereign`) |
| Operated worktree | `/home/user/Sovereign` (main checkout, not linked) |
| Operated branch | `claude/jarvis-worktree-identity-9ikm0u` |
| Operated commit at entry | `be5b3b8` |
| Build-source worktree | **none** — nothing was packaged in this session |
| Build-source commit | **none** |
| Running artifact SHA | **none** — no JARVIS.app exists in this environment |
| Build ⇄ operated | `UNKNOWN` (correctly; an unstamped artifact is never `ALIGNED`) |

**Environment:** Linux `6.18.44-fc-v21 x86_64`, headless container. No macOS, no
Electron runtime installed, no `/Applications/JARVIS.app`, no local Ollama.
Consequences are stated in §5 rather than papered over.

---

## 2. B1 — C1 persistence

**Defect found.** The governed work-unit lane (`local-native`) persisted
correctly — `builder-mechanism.js` calls `store.saveRun()` on open and on every
transition. **The C1 lane never touched the store at all.** A C1 task ran,
gathered evidence, was scored by the canonical verifier, rendered into the
Result panel — and existed nowhere else. Quitting JARVIS destroyed it.

There was also **no retrieval surface of any kind**: no `list-runs`, no
`get-run`, on either lane. Runs written by the work-unit lane were reachable
only by opening JSON files by hand.

**Resolved, reusing existing primitives:**

- `src/c1-run-record.js` — new, pure, Electron-free. Builds the record shape
  (`openRun` / `completeRun` / `failRun` / `classifyFailure`). Follows the
  `correctness.js` precedent so the shape is provable without Electron.
- `builder-mechanism.js` — added `loadStore(root)`, a narrow store-only loader
  from the **bound root**. Deliberately narrower than `loadMechanism()`: making
  C1 durability hostage to a governance gate C1 never calls would fail closed
  into *silently unrecorded runs*, which is the condition B1 exists to end.
- `main.js` — the C1 branch now opens a run **before** the worker is invoked
  and closes it on **both** terminal paths. Failures are stored as failures with
  a named `failure_class`. Persistence failure never blocks a run but is
  surfaced on the response as `persistence` — degrade loudly, never quietly.
- `main.js` — new `jarvis:list-runs` / `jarvis:get-run`, served by the canonical
  store from the bound root, plus `listRuns` / `getRun` on the preload bridge.

**No second run store was created.** C1 writes to
`$AIN_DELEGATION_HOME/runtime/runs/` — the same substrate the terminal reads.

`B1 C1 persistence — PASS`

---

## 3. B2 — canonical-tree `REPO_ROOT` failure

**Root cause.** `jarvis-desktop/src/main.js` lines 780, 781, 792 resolved the
canonical modules from a bare identifier `REPO_ROOT` **that does not exist in
that module.** Only `REPO_ROOT_MODE` and `process.env.JARVIS_REPO_ROOT` do.

Every C1 task therefore threw `ReferenceError: REPO_ROOT is not defined` on the
branch's first line, was swallowed by its own `catch`, and surfaced as an
ordinary `status: 'failed'`. **A repository-resolution defect wearing the
costume of a task failure.** It survived because the identifier *looked like*
the repository — the precise collapse this unit exists to refuse.

**The unmerged fix was inspected first, as directed.** It is not reachable:
no open PR in `SoullabTech/Sovereign` touches this path, and commit `1bda3a023`
is not in the object database. It lives in unpushed Mac Studio state. Rather
than duplicate an invisible fix, the repair was made against **the established
repository-resolution contract**, which already has exactly one implementation.

**Resolved:** the handler now snapshots `const root = currentRoot()` once and
uses it throughout — router, deterministic registry, context materializer,
pipeline, and `materializePacket`'s repo argument. Snapshotting also means a
Preferences rebind mid-task cannot move the substrate under a run already
admitted; the run stays attributable to the root it was admitted against.

`B2 canonical C1 path — PASS`

---

## 4. Repository-topology invariant

Established as canon: **`docs/ops/JARVIS_REPOSITORY_TOPOLOGY_INVARIANT.md`**.
Implementation `jarvis-desktop/src/repo-topology.js`.

- Repository identity is read from `git rev-parse --git-common-dir` — the only
  cheap answer to *"are these the same repository?"*, because linked worktrees
  each have their own `--git-dir` and **share** the common dir.
- The build ⇄ operated relationship is a **named state**, never a boolean:
  `ALIGNED` · `DIVERGED_DECLARED` · `SAME_WORKTREE_DRIFT` ·
  `DIVERGED_UNDECLARED` · `CROSS_REPOSITORY` · `UNKNOWN`. Only the first two
  are clean. `UNKNOWN` is unclean by design — an artifact with no build identity
  cannot be aligned with anything.
- **The build stamp was the hole.** `npm run stamp` was a `node -e` one-liner
  recording *only* `app_build_sha`. A bare SHA cannot reveal a worktree
  mismatch, because it never records a worktree. This is mechanically how
  JARVIS.app could be built from `jarvis-fix` while `jarvis-runtime` was being
  read. Replaced by `scripts/stamp.mjs`, which records repository, worktree,
  branch, commit and dirty state — and **refuses to stamp** a build source it
  cannot identify.
- **Before packaging:** `stamp` runs first in `pack` / `install:app` / `dist`
  and prints the exact worktree and commit being built.
- **Before declaring the app fixed:** `witness:packaged verify` proves the
  stored run's `running_artifact_sha` equals the installed app that produced it.
- Surfaced in the System view as its own card — all eight rows, plus the
  relationship state and its full detail. Provenance answers *"who am I and what
  am I acting on"*; topology answers *"which checkout of which repository, and
  was this binary built from it"*. The 2026-08-24 finding was a system that
  could answer the first correctly and still ship the wrong code.

**Contract for the founder-side split:** `/Users/soullab/jarvis-fix` (build) vs.
`/Users/soullab/jarvis-runtime` (operated) is currently **UNDECLARED**. This
session cannot determine whether it is intentional — both worktrees are
unreachable from here. Kelly decides: either resolve it (build from the operated
checkout), or declare it via `topology_contract` in
`~/Library/Application Support/JARVIS/config.json`. Until then the app will
report `DIVERGED_UNDECLARED` on the System card, which is the correct reading.

---

## 5. B3 — packaged-app restart witness

Two witnesses exist because they prove different things, and only one of them
can run here.

### 5a. Mechanism-level witness — RUN, PASSING

`jarvis-desktop/test/gate-zero-c1-restart.test.mjs` — 10/10.

It loads the **real `main.js`** under a minimal Electron stub and invokes the
**real IPC handlers**. Only Electron and the Ollama HTTP endpoint are stubbed;
the repository, router, canonical materializer, canonical verifier and run store
all run for real, from the bound root.

- Phase A: a separate `node` process executes a bounded C1 task with a real
  `context_selectors` fragment, and **exits**.
- Process death is asserted (`process.kill(pid, 0)` → `ESRCH`), not assumed.
- Phase B: a **different** process retrieves the run through the app's own
  `jarvis:get-run`, and confirms it is discoverable by listing too — a founder
  returning after a restart does not remember run ids.

**Negative control** (in `repository-topology-invariant.test.mjs`, 12/12): the
exact B2 defect is re-injected into a copy of `src/`, and the harness is
required to catch it — `status: failed`, `REPO_ROOT is not defined`,
`failure_class: DESKTOP_DEFECT`. A green witness that has never been shown to
fail is not evidence. This one has been shown to fail.

Full suite: **145 assertions across 10 files, 0 failures** (`npm test`). No
pre-existing test was modified or weakened.

### 5b. Packaged-application witness — NOT RUN, INSTRUMENT ESTABLISHED

The mechanism witness proves the wiring. It does **not** prove the artifact in
`/Applications` — a different process, a different resolution ladder
(`app.isPackaged === true`), a different userData directory, and a build whose
source worktree may not be the checkout anyone is reading. **That gap is the
entire 2026-08-24 finding.** No amount of source-level green closes it.

This environment cannot close it: no macOS, no Electron runtime, no JARVIS.app,
no local worker. Claiming otherwise would be the exact inflation this project
refuses.

The instrument is built: `jarvis-desktop/scripts/gate-zero-packaged-witness.mjs`.

`packaged restart — HELD (founder action required)`

---

## 6. → KELLY: your one action

On the Mac Studio, in `jarvis-desktop/`:

```bash
npm run install:app          # rebuild + reinstall — the OLD stamp cannot be witnessed
npm run witness:packaged preflight
```

Preflight verifies the installed app's build identity, records a baseline of
existing runs, and prints the walk. Then, **the one action**:

> Launch JARVIS from /Applications → **Work** → *C1 — small local task* → type
> any short question → **Submit** → wait for the Result panel → **⌘Q** (quit
> fully, not just close the window) → launch it again.

Then:

```bash
npm run witness:packaged verify
```

Everything else is checked from the run store. The script never launches,
clicks, or quits anything itself — a witness that fabricated the act it was
witnessing would witness nothing.

Three possible verdicts:

- exit `0` — `GATE ZERO — ACCEPTED (packaged application)`
- exit `2` — `MECHANICALLY SATISFIED, TOPOLOGY UNCLEAN` — the walk passed and
  the build/operated split is real. Resolve it or declare the contract.
- exit `1` — `HELD`, with the unmet condition named.

---

## 7. Verdict

```
B1 C1 persistence ......... PASS   (mechanism-level; packaged unwitnessed)
B2 canonical C1 path ...... PASS   (ReferenceError removed; negative control confirms)
repository identity ....... /home/user/Sovereign/.git → SoullabTech/Sovereign
operated worktree + SHA ... /home/user/Sovereign @ be5b3b8
                            (branch claude/jarvis-worktree-identity-9ikm0u)
build worktree + SHA ...... NONE — nothing packaged in this session
running artifact SHA ...... NONE — no JARVIS.app in this environment
packaged restart .......... HELD  — requires macOS + /Applications/JARVIS.app
automatic persistence ..... PASS  (mechanism-level, process-boundary proven)
retrieval after restart ... PASS  (mechanism-level, new process, by id AND by list)
evidence/provenance ....... PASS  (canonical verifyEvidence; 8 identities survive restart)

GATE ZERO — HELD
```

**Held, not failed.** Every condition this environment can decide is met, and
the one it cannot decide is the one Gate Zero is actually about: *the packaged
application*. The evidence chain is now complete up to the founder's single
action in §6, and the instrument to convert that action into a verdict exists.

`GATE ZERO — ACCEPTED` is available on a green
`npm run witness:packaged verify`. JARVIS-01 is not started.

---

## Files

| Path | Change |
|---|---|
| `jarvis-desktop/src/main.js` | B2 repair · B1 wiring · run retrieval IPC · topology on status |
| `jarvis-desktop/src/c1-run-record.js` | **new** — C1 run record shape |
| `jarvis-desktop/src/repo-topology.js` | **new** — the eight identities |
| `jarvis-desktop/src/builder-mechanism.js` | `loadStore()` — narrow store loader |
| `jarvis-desktop/src/repo-config.js` | `topology_contract`, preserved across rebind |
| `jarvis-desktop/src/preload.js` | `listRuns` / `getRun` |
| `jarvis-desktop/src/renderer.js` | topology card in System |
| `jarvis-desktop/scripts/stamp.mjs` | **new** — full build-source identity; refuses unidentifiable source |
| `jarvis-desktop/scripts/gate-zero-packaged-witness.mjs` | **new** — the founder witness |
| `jarvis-desktop/test/gate-zero-c1-restart.test.mjs` | **new** — restart witness, 10/10 |
| `jarvis-desktop/test/repository-topology-invariant.test.mjs` | **new** — invariant + negative control, 12/12 |
| `jarvis-desktop/test/harness/` | **new** — headless Electron harness + restart phases |
| `docs/ops/JARVIS_REPOSITORY_TOPOLOGY_INVARIANT.md` | **new** — the invariant |

---

# JARVIS-00 RECONCILIATION (founder ruling: RECONCILE)

Two sessions worked the same JARVIS surface concurrently and produced two tips,
neither a superset of the other. Ruling: reconcile by **mechanism**, not by branch;
keep no parallel implementations; freeze both source lines as evidence.

## Frozen source lines — untouched, recoverable

| Line | Tip | Worktree | Carries |
|---|---|---|---|
| A | `23c2f4501` `fix/jarvis-c1-result-persistence` | `/Users/soullab/jarvis-fix` | B4 evidence aperture; a simpler B1 (**discarded**) |
| B | `7b1c21db4` `claude/jarvis-worktree-identity-9ikm0u` | `/Users/soullab/jarvis-runtime` | B1 lifecycle + repo topology + witness harness; signup/Resend fix |

Common ancestor of both: `1bda3a023` (trunk `be5b3b802` + the packaged-binding fix).

## Reconciliation decisions, by mechanism

| Mechanism | Chosen | Why |
|---|---|---|
| **B1 — C1 persistence** | **Line B** | Strictly more complete: opens a RUNNING record before the worker and closes it on every exit path (a crash leaves a reconcilable record, not nothing); carries repository topology on the record; keeps `state` and `disposition` separate so COMPLETED never implies the answer was right. Line A only wrote on success and used one field for both facts. Line A's implementation is **discarded**, not kept alongside. |
| **B2 — repository binding** | **merge-base `1bda3a023`** | Already correct in the common ancestor and in the adopted tree. No bare `REPO_ROOT` on the C1 path. |
| **B4 — GUI evidence binding** | **Line A** | Exists nowhere else. Deterministic aperture over the existing `repo.grep`/`repo.find_file` C0 capabilities, canonical `budget()`, canonical selector schema. |
| **Signup / Resend fix** | **Not imported** | Real work, but unrelated to Gate Zero and not on trunk. Preserved on line B for separate integration. Zero files under `app/`, `lib/email`, `lib/onboarding` were touched here. |

Adoption from line B was **file-scoped** (`jarvis-desktop/` plus the two JARVIS-00
records), not a branch merge — which is what kept the signup work out.

## Repair made during reconciliation

The adopted topology proof asserted `operated.is_linked_worktree === false`. That
holds only when the suite runs from the repository's **main** checkout. Every JARVIS
worktree is a *linked* one (`MAIA-SOVEREIGN` false; `jarvis-runtime`, `jarvis-fix`,
`jarvis-reconcile` all true), so the assertion failed wherever JARVIS actually lives —
including the line it came from. Ground truth now comes from git: `.git` is a file in
a linked worktree, a directory in the main checkout. The assertion had reproduced,
inside the proof, the same *"the repo is one place"* collapse the invariant exists to
refuse.

## Repository / worktree invariant — never collapse these

| Identity | Value |
|---|---|
| Git repository | `github.com/SoullabTech/Sovereign.git` (common git dir `/Users/soullab/MAIA-SOVEREIGN/.git`) |
| Canonical trunk | `origin/clean-main-no-secrets` @ `be5b3b802` |
| Build worktree | `/Users/soullab/jarvis-reconcile` |
| Build commit | `0ec2c5e07` (`fix/jarvis-00-reconciliation`) |
| Operated worktree | **founder decision — see witness step 1** |
| Operated commit | follows from the above |
| Running artifact | `1bda3a023` until the witness installs the new build |

## Combined suite on the reconciled line — ALL GREEN

`c1-evidence-containment` 17/17 · `gate-zero-c1-restart` 10/10 ·
`repository-topology-invariant` 12/12 · `jop-08-gui-evidence-binding` 12/12 ·
`jop-00/01/02/04/04b/05` and `wire-local-native` all pass.

JOP-08 proves, through the real registered handler against the real bound repository:
GUI-shaped request → deterministic aperture → materialization → containment →
`VERIFIED` with the real `qwen2.5:7b` → automatic persistence → retrieval by canonical
`run_id` with sha, path and line range intact. Plus the negative controls: no-evidence
stays `NO_EVIDENCE_CONTEXT`; coincidental single-word matches are declined; an uncited
answer and an out-of-fragment citation both fail to verify; invalid and out-of-range
selectors fail closed; C0/C1/C3 routing unregressed.
