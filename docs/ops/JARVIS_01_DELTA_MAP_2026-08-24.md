# JARVIS-01 — Delta Map (validation pass)

**Base:** `/Users/soullab/jarvis-reconcile` @ `84f38f89d`+ (`fix/jarvis-00-reconciliation`), the
Gate-Zero-accepted state. Every claim below was re-bound to that base by direct inspection.

**Mandate was to VALIDATE the existing 42-mechanism census, not repeat it.**

---

## BLOCKER — the census is not recoverable as an artifact

The census could not be validated because it could not be read. Custody was checked, not assumed:

| Where a census would live | Result |
|---|---|
| Any branch (`7b1c21db4`, `84f38f89d`, `23c2f4501`, `origin/clean-main-no-secrets`) | no census document |
| `jarvis-runtime` working tree | **clean — 0 uncommitted files** |
| Session transcripts under `~/.claude/projects` | the phrase *"remembers but does not recall"* appears in **exactly one** file: this session's own transcript, because the founder typed it |
| Transcript that authored `66f55a453` | **none on this machine** — only this session's transcript even mentions that SHA, and only because git printed it |

Sessions that do mention "census" (`0cbc8118`, `b793e436`, `da037464`) carry **zero** references to
`JARVIS-00C` or `repo-topology` — different work, not this census.

So the 42-mechanism census exists only in a conversation, which is the precise thing the
constitution forbids acting from when custody can establish the referent. Here custody
establishes that the referent **does not exist as an artifact**.

**Classification: `BUILD`.** It must be re-authored as a durable, committed artifact — but from
the accepted base, and *not* by this session on its own authority.

Items 1 ("mechanisms still exist") and 2 ("classifications remain accurate") cannot be validated
without that text. Everything else the founder enumerated was checkable, and was checked.

---

## Validated claims

### 1. "JARVIS remembers but does not recall" — **SUPERSEDED. No longer true.**

Recall exists at the accepted base and is wired end to end:

```
main.js:1119   ipcMain.handle('jarvis:list-runs', …)   -> store.listRuns()
main.js:1135   ipcMain.handle('jarvis:get-run',  …)   -> store.loadRun()
preload.js:29  listRuns / getRun exposed to the renderer
```

Introduced by `d21522aa3` — the reconciliation's adoption of the parallel line's work. The census
conclusion predates it. **This is exactly why re-binding to the accepted base was required rather
than inheriting the conclusion.**

**`PRESERVE`** — and correct the census conclusion when it is re-authored.

### 2. `epistemic-guard.mjs` — capabilities confirmed, **as reported**

Present at the base (33,692 bytes). Provides a real status lattice
(`HYPOTHESIS < OBSERVATION < PROVEN < INVARIANT`), authority kinds (`founder_ruling`,
`ratified_canon`), weak/known evidence kinds, and seven guards: canonical-path, edge-proof,
index-liveness, liveness-scope, status-evidence, correction-anatomy, plus evidence standing.
Invoked as a subprocess by `epistemic-ci.mjs`, which never modifies it.

**`PRESERVE`.**

### 3. Write-only ledgers — **CORRECTED. Runs are no longer write-only.**

Writers: `builder-mechanism.js` (work-unit lane) and `main.js` (C1 lane).
Readers: `listRuns` / `loadRun` via the two IPC handlers above.

The store was write-only *before* B1 and the recall handlers landed. At the accepted base it is
read/write. **`PRESERVE`.**

### 4. `.ain/` vs `AIN_HOME` — **NOT a hypothesis. Both are live, with distinct jurisdictions.**

| Store | Path | Scope | Owner |
|---|---|---|---|
| Epistemic ledger | `.ain/epistemic-ledger.jsonl`, `.ain/claims/` | **repository** | `epistemic-ci.mjs` |
| Runtime runs | `$AIN_DELEGATION_HOME` → `~/.claude/ain-delegation/runtime/` | **machine** | `jarvis-runtime-store.mjs` |

`.ain/` exists on disk **and 2 files are git-tracked** (`.ain/claims/001-guard-proof-at-admission.json`,
`.ain/epistemic-ledger.jsonl`). These are two different stores answering two different questions —
not one mechanism with an unresolved location.

**`PRESERVE` both; `CONSOLIDATE` the *documentation* so the jurisdictions are stated once.** The
census's "hypothesis, not canon" framing is superseded by tracked files.

### 5. CodeGraph — **genuinely ABSENT. Confirmed.**

One grep hit repo-wide, and it is a comment in `lib/sovereign/decisionGovernor.ts:43`:
*"You can swap this later to use your facet detection / symbol index."* An aspiration, not an
implementation. No code graph, symbol index, or call graph exists.

**`BUILD`** — if and when it is authorized. Not now.

### 6. `headOf()` divergence — **CONFIRMED, real, currently latent**

```
jarvis-context.mjs  headOf(repo)      -> git rev-parse --short HEAD
jarvis-context.mjs:77  materializeOne -> readFileSync(abs)   // the WORKING TREE
```

Fragment content is read from the working tree; `source_sha` is taken from git HEAD. If the
operated worktree is **dirty**, a fragment carries a commit SHA that its content does not match —
a provenance claim that is false while looking rigorous. Every persisted C1 record inherits it.

Operated worktree is currently clean, so the aperture is **latent, not active**. The accepted
Gate Zero witness is unaffected (`operated_dirty: false` on the record).

**`REPAIR`** — the honest fixes are to read content at the named SHA (`git show`), or to record
`dirty` on the fragment and refuse `VERIFIED` when it is set. Not repaired here; out of scope.

### 7. EP-01 — semantic answerfulness gap — **added to the delta map**

The accepted witness answered *"What is the value of C1_MAX_INPUT_CHARS?"* with the complete
response `scripts/builder/router.mjs:23` and scored **VERIFIED, 1/1 contained**. The value `4000`
never appears. Containment is not answerfulness — a response consisting only of a valid reference
passes containment vacuously.

**`HOLD`** — recorded as `DISCOVERED — ACTIVE APERTURE` in the JARVIS-00 record. Belongs to the
epistemic/correctness work, alongside `decideCorrectness` and `verifyEvidence`.

---

## Summary

| Item | Classification |
|---|---|
| 42-mechanism census as an artifact | `BUILD` |
| Runtime recall (`list-runs` / `get-run`) | `PRESERVE` (census claim superseded) |
| `epistemic-guard.mjs` | `PRESERVE` |
| Run store read/write | `PRESERVE` |
| `.ain/` + `AIN_HOME` | `PRESERVE` both · `CONSOLIDATE` the docs |
| CodeGraph | `BUILD` |
| `headOf()` divergence | `REPAIR` |
| EP-01 answerfulness | `HOLD` |

**Two census conclusions did not survive re-binding** — "remembers but does not recall", and
"`.ain/` is a hypothesis". Both were true when written and are false at the accepted base. That is
the value of the validation pass, and the reason the census must be re-authored rather than
inherited.

Nothing was redesigned or implemented.
