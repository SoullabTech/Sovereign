# Claude Code adapter — adoption ruling

**Classification:** the Claude Code **adapter** for JARVIS. Not a JARVIS core, not a
replacement for JARVIS authority. Claude Code becomes a worker inside JARVIS's operating
discipline; JARVIS does not become a Claude configuration.

```
JARVIS CORE          authority · evidence · memory · governance
      |
CLAUDE CODE ADAPTER  SessionStart · PreToolUse · Stop · Skills · references
      |
CLAUDE CODE          the worker
```

---

## Ruling — issued 2026-08-24

```
SessionStart              HOLD  - pending §4 differential
Image isolation           HOLD  - pending §4 differential
Trap guard                HOLD  - pending §4 differential
Stop hook                 HOLD  - pending §4 differential
Skills                    HOLD  - pending §4 differential
Measured context delta    NOT MEASURED
Measured image delta      NOT MEASURED
Correctness regression    NOT MEASURED
False-denial rate         NOT MEASURED
CLAUDE CODE ADAPTER       HOLD
```

**Why every line is HOLD and not ADOPT.** The adapter has not been installed in any Claude
Code session, so no arm-A/arm-B pair exists. The mechanism is proven at unit level; the
*effect* is unmeasured. Issuing ADOPT on proof-harness evidence would rule `verified` from
`built` — one rung skipped, the exact promotion `epistemic-guard.mjs` G5 refuses.

**Why no line is REJECT or REVISE.** Nothing has failed. 26 of 26 guard assertions and 17 of
17 instrument assertions pass. There is no defect to revise and no basis to reject.

---

## What IS established (steps 1, 2, 5)

### 1 — hot-context false path, corrected

`scripts/verify-colab-boundaries.ts` **does not exist** and never has in this history. The
canonical executable is `scripts/verify-constitution-colab.ts`, which is what
`scripts/pre-deploy-gate.sh:116` actually invokes.

Discriminating evidence, both run in this container:

```
$ npx tsx scripts/verify-colab-boundaries.ts
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '.../scripts/verify-colab-boundaries.ts'
        -> the entrypoint does not exist; nothing executes

$ NODE_PATH=<scratch>/node_modules npx tsx scripts/verify-constitution-colab.ts
+--------------------------------------------------------------+
|        Co-Lab Boundary Verification Matrix                   |
+--------------------------------------------------------------+
  Database: postgresql:***@localhost:5432/maia_consciousness
Verification error: Error: connect ECONNREFUSED 127.0.0.1:5432
    at async main (/home/user/Sovereign/scripts/verify-constitution-colab.ts:437:17)
        -> resolves, executes, reaches main() and the DB boundary
```

⚠️ **What this proves and does not.** It proves the corrected entrypoint exists and runs. It
does **not** prove the gate passes — this container has no database. `31/31` remains a
production claim requiring a production run.

Corrected (7 lines, 3 files — executable commands only):

| File | Lines |
|---|---|
| `CLAUDE.md` | 386 (gate condition), 390 (the `docker exec` command) |
| `scripts/verify-constitution-colab.ts` | 9, 10 (docblock Usage — it named a file that is not itself) |
| `docs/ops/COLAB_RELEASE_GATE.md` | 14 (the command), 73 (checklist), 90 (how to add checks) |

`COLAB_RELEASE_GATE.md` is one hop beyond the literal authorization: `CLAUDE.md` routes
workers to it for "the full gate specification", and its line 14 carries the identical
executable falsehood. Revert that file alone if the extension is unwanted.

**Deliberately not touched** — narration and historical record, not executable instructions:
`tests/constitutional/refusal-registry/{README.md,harness.ts}` (cites it as project idiom),
`docs/specs/NATIVE_SESSION_ROOM_PHASE1_SPEC_2026-07-05.md`,
`docs/design/relational-field/inquiry/JRF-06`, `JRF-08`,
`docs/reviews/JONDI_COMPANION_PASS2_REVIEW_2026-07-21.md`,
`docs/architecture/JONDI_COMPANION_INCREMENT_1_BUILD_PLAN_2026-07-21.md`.
The line held: **correct executable commands, never rewrite a record of a finding.**

**Datum worth keeping.** JRF-08 recorded *"`scripts/verify-colab-boundaries.ts` does not
exist; renamed to `verify-constitution-colab.ts`"* — and the Jondi build plan repeated it in
bold. The discovery existed for roughly a month. The correction to the hot instruction did
not. Discovery without propagation left a mandatory gate command executably false in the file
every worker loads first.

### 2 — security boundary, recorded

Recorded in `README.md` (*Security boundary*), `STATUS.md`, the guard's own module docstring,
and the `bounded-job` skill:

> Claude Code hooks are **workflow enforcement, not the security boundary.** Image isolation
> may fail open. High-consequence prohibitions must remain enforced by JARVIS authority /
> tool / repository controls even when the hook is unavailable.

Where the real control sits for each prohibition:

| Prohibition | Real control |
|---|---|
| `.deploy.lock` deletion | `flock` — a kernel object, not a file convention |
| bare production compose | Dockerfile deploy-lane tripwire (fails the build in <1s) |
| `@supabase` install | `check:no-supabase` in pre-commit and CI |
| protected-branch force-push | **remote branch protection — verify this separately; the hook is not a substitute** |

No new security infrastructure was built in this unit, as directed.

### 5 — negative controls

`./plugins/soullab-jarvis/verify-guards.sh` → **26 passed · 0 failed**

| Control | Result |
|---|---|
| image tool in main loop | denied |
| same tool inside subagent | allowed |
| `Read` / `Grep` / legitimate non-image commands | unaffected |
| `.deploy.lock` deletion | denied |
| `fuser -v` inspection of the same lock | allowed |
| bare production compose | denied |
| sanctioned deploy lane (`pre-deploy-gate.sh`) | allowed |
| `@supabase` install | denied |
| protected-branch force-push | denied |
| ordinary feature-branch push, `rm -rf node_modules` | allowed |
| **guard implementation error** | degrades to allow; never emits deny, never exits 2 |
| missing `image-tools.txt` | allow |
| malformed / empty hook stdin | allow |
| **crashed Stop hook** | cannot block termination; emits no block decision |
| healthy Stop hook | never blocks |

`python3 plugins/soullab-jarvis/benchmark/verify-instrument.py` → **17 passed · 0 failed**

The instrument's own first bug was caught by that harness: image blocks were counted as
**zero tokens**, which would have reported every screenshot as free and made the benchmark
meaningless. Fixed before any measurement was taken.

---

## What is NOT established (steps 3, 4)

**Step 3 — install in an isolated Claude Code environment: NOT DONE.** `/plugin marketplace
add` is an interactive command in a Claude Code client. This work ran in a non-interactive
remote container that cannot install a plugin into its own running session.

**Step 4 — differential benchmark: NOT RUN. Attempted 2026-08-24; blocked by environment.**
Measured constraints of the container this lane ran in:

```
uname -srm            Linux 6.18.44-fc-v21 x86_64      -> not the Mac Studio
command -v xcrun      absent                            -> no iOS simulator
command -v ssh        No such file or directory         -> minisforum unreachable
~/.claude/projects    1 transcript (this session's own) -> no A/B corpus exists
```

The protocol requires a task that "naturally requires orientation **plus at least one
visual/image-producing verification step**". That step is the entire bucket under test, and
it cannot be exercised here: there is no simulator, and a headless screenshot written to a
file never enters the main context the way an MCP image result does.

⛔ **A degraded run was deliberately not substituted.** Benchmarking the adapter without the
image bucket would produce a real number about the least important part, which would then be
generalized. Reporting a measurement whose provenance does not match the claim is the exact
failure this whole lane is disciplined against — the same shape as the `~121k` bucket
standing in for a measured effect.

### Static input to the benchmark (NOT a result)

One thing IS measurable without a session: what the adapter **costs**. Measured on this
commit — the cost side of the ledger the differential must beat.

| | Bytes | ~tok | Resident |
|---|---:|---:|---|
| `SessionStart` hook output | 904 | **226** | every session |
| 4 skill descriptions (frontmatter) | 1,597 | **399** | every session |
| **Always-resident total** | **2,501** | **~625** | every session |
| Skill bodies + references | 20,699 | ~5,175 | **only on trigger** |

So the adapter must recover more than **~625 tokens/session** to be worth its own weight —
before any argument about correctness. This is arithmetic on file sizes, not a session
measurement, and it says nothing about whether the recovery happens.

The protocol and the verified instrument are ready: `benchmark/PROTOCOL.md` +
`benchmark/measure-session.py`.

**Claims that remain forbidden until the differential runs:**

- ⛔ "Image isolation recovers ~121k tokens/session." Measured bucket ≠ measured effect.
- ⛔ "Context cost dropped ~54%." A projection from measured inputs, not a result.
- ⛔ "Governance is enforced." A committed hook is a file. Enforcement starts at install.

## Open items — separate units, deliberately not built here

1. **Protected-branch force-push has no control underneath the hook.** The other three
   prohibitions each sit on a real boundary (`flock`, the Dockerfile tripwire,
   `check:no-supabase` in pre-commit + CI). This one does not, unless GitHub branch
   protection / rulesets are configured on `SoullabTech/Sovereign`. **Do not describe that
   prohibition as mechanically secure.** The correct proof is a GitHub-side ruleset, not
   another Claude hook. Unverified as of 2026-08-24.

2. **Correction-dependency propagation.** Recorded as a learning episode at
   `docs/ops/JARVIS_LEARNING_EPISODE_CORRECTION_PROPAGATION_2026-08-24.md`. A verified
   correction could not identify the operational instructions depending on the corrected
   fact, so a mandatory gate stayed executably false for ~a month while four documents
   recorded the right answer. **Evidence for a future capability; not authorized here.**

## To close this ruling

On a machine with the real toolchain: run `verify-guards.sh` and `verify-instrument.py`,
install per `benchmark/PROTOCOL.md`, run ≥3 order-counterbalanced task pairs including at
least one image-producing verification, then fill the ruling block above from measured values
and hand-judged correctness. **Report evidence and stop.**
