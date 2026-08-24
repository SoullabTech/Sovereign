# JARVIS-01 — Canonical Capability Census (present state)

Read-only documentation unit. **Nothing was implemented.** The historical
"42 mechanisms" census was not recoverable and is deliberately **not** reconstructed;
this describes what exists now, organised by capability rather than by an arbitrary count.

## Binding

| | |
|---|---|
| Repository identity | `/Users/soullab/MAIA-SOVEREIGN/.git` (`github.com/SoullabTech/Sovereign.git`) |
| Worktree | `/Users/soullab/jarvis-reconcile` — **linked** worktree, not the main checkout |
| Branch | `fix/jarvis-00-reconciliation` |
| SHA | `85541bc8472eaad1facb1d58a38ec77ff2c6c168` (`85541bc84`) |
| State | **clean** (0 modified files) |
| Packaged artifact | `84f38f89d` — built + installed at `/Applications/JARVIS.app` |
| HEAD vs artifact | HEAD is **ahead by documentation commits only**; no code delta |

Substrate size: `scripts/builder/` 3,963 lines across 13 modules · `jarvis-desktop/src/` 5,164 lines across 18 modules.
Whole Desktop capability surface = **12 IPC handlers**.

---

## 1. Identity / repository binding

| Mechanism | Location | Writer | Reader | Persistence | Authority | Evidence | Aperture | Disp |
|---|---|---|---|---|---|---|---|---|
| Repo config | `repo-config.js` | `writeConfig` (Preferences) | `readConfig` | `~/Library/Application Support/JARVIS/config.json` | founder, via UI | Gate Zero witness | — | `PRESERVE` |
| Dev resolution ladder | `repo-resolution.js` | — | `main.js` | in-memory | — | JOP-04 | walk outranks config in dev mode; **packaged mode uses env→config** | `PRESERVE` |
| Packaged binding | `repo-candidates.js` | — | `main.js` | — | — | JOP-05 | — | `PRESERVE` |
| Repository topology | `repo-topology.js` | stamped onto run records | `main.js`, records | per-run | — | topology invariant 12/12 | — | `PRESERVE` |
| Build stamp | `scripts/stamp.mjs` | build time | `provenance.js` | `build/build-info.json` | — | artifact `84f38f89d` | — | `PRESERVE` |

Seven identities are carried separately and never collapsed into "the repo". This is the Gate Zero achievement.

## 2. Work / task model

| Mechanism | Location | Notes | Disp |
|---|---|---|---|
| Cost router | `router.mjs` (77 ln) | C0 / C1 / C3. Not an intent classifier: a task states its own capability or declares `bounded_for_local`. `C1_MAX_INPUT_CHARS = 4000`; oversize is **refused, never escalated**. | `PRESERVE` |
| Work-unit packet | `work-unit.mjs` (363 ln), `jarvis-packet-guard.mjs` (158 ln) | Packet validation + answer-leakage partition (worker sees only `work_unit_id` + `context_selectors`). | `PRESERVE` |
| Task Packet (master directive §6) | — | The full field set (objective, scope, budget, STOP conditions…) is **not** implemented as one object. | `BUILD` |

## 3. Authority

| Mechanism | Location | Notes | Disp |
|---|---|---|---|
| Lane authority | `jarvis-runtime-pipeline.mjs:91-104` | `READ_ONLY_LANES = ['local-native']`; refuses any packet carrying `allow_write`, `requested_write_authority`, `permission_mode`, `repo_write_scope`, `worker_authority`. | `PRESERVE` |
| C3 non-execution | `main.js` submit-task | C3 is routed and explained, never auto-invoked. Reasoning availability ≠ execution authority. | `PRESERVE` |
| Governance verbs | `governance.js` → `session.mjs` | Desktop admits 3 of 9 verbs (`recover`, `reconcile`, `close`); `--force` unreachable; reasons required (audited acts). | `PRESERVE` |
| Risk tiers R0–R5 | — | Not implemented. | `BUILD` |

## 4. Claims / custody

| Mechanism | Location | Persistence | Disp |
|---|---|---|---|
| Epistemic claims | `.ain/claims/` (1 claim) | **repository**, git-tracked | `PRESERVE` |
| Epistemic ledger | `.ain/epistemic-ledger.jsonl` (2 lines) | **repository**, git-tracked | `PRESERVE` |
| Claim admission CI | `epistemic-ci.mjs` (271 ln) | reads `BASE:` refs via git | `PRESERVE` |
| Worktree/branch custody | git + `repo-topology.js` | — | `PRESERVE` |

## 5. Execution

| Lane | Mechanism | Authority | Disp |
|---|---|---|---|
| C0 | `deterministic.mjs` — 15 registered capabilities | read-only | `PRESERVE` |
| C1 | `main.js` submit-task → local worker `qwen2.5:7b` @ `127.0.0.1:11434` | read-only | `PRESERVE` |
| local-native | `builder-mechanism.js` → `executeRun` | `checkAuthority` | `PRESERVE` |
| C3 | routed, **not executed** | — | `PRESERVE` |

## 6. Evidence

| Mechanism | Location | Notes | Disp |
|---|---|---|---|
| Materialization | `jarvis-context.mjs` | Selector schema `{ref, selector:{file\|lines\|symbol\|anchor}, why}`. Fails closed on any invalid selector. | `PRESERVE` |
| Evidence aperture | `evidence-aperture.js` (324 ln) | Deterministic derivation over `repo.grep`/`repo.find_file`. No embeddings, no vector search, no LLM selection. Declines weak signal. | `PRESERVE` |
| Context budget | `jarvis-context.mjs budget()` | 65536 × 0.5 safety ratio; `CONTEXT_BUDGET_EXCEEDED`. | `PRESERVE` |

## 7. Verification

| Mechanism | Location | Proves | Does NOT prove | Disp |
|---|---|---|---|---|
| `verifyEvidence` | `jarvis-runtime-pipeline.mjs:167` | citation ∈ materialized fragment | relevance; **answerfulness (EP-01)** | `REPAIR` |
| `decideCorrectness` | `correctness.js` | maps verifier → verdict; never lets execution imply truth | — | `PRESERVE` |
| Execution vs result | `main.js` | kept as two separate facts on screen and in the record | — | `PRESERVE` |
| `validateResult` | pipeline | result contract | — | `PRESERVE` |

## 8. Epistemic governance

`epistemic-guard.mjs` (599 ln) — status lattice `HYPOTHESIS < OBSERVATION < PROVEN < INVARIANT`;
authority kinds `founder_ruling`, `ratified_canon`; seven guards (canonical-path, edge-proof,
index-liveness, liveness-scope, status-evidence, correction-anatomy, evidence standing).
Invoked as a **subprocess** by `epistemic-ci.mjs`, which never modifies it.
Correction → doctrine promotion is **candidate-only, by directive**. `PRESERVE`.

## 9. Run persistence

| Mechanism | Location | Store | Disp |
|---|---|---|---|
| Run store | `jarvis-runtime-store.mjs` (114 ln) | `$AIN_DELEGATION_HOME/runtime/` — atomic temp+rename; `run_id` fail-closed on `r-[0-9a-f]{10}` | `PRESERVE` |
| C1 record | `c1-run-record.js` (178 ln) | RUNNING → COMPLETED/FAILED; `state` separate from `disposition`; topology carried | `PRESERVE` |
| Work-unit records | `builder-mechanism.js` | same store | `PRESERVE` |
| Orphan reconciliation | `reconcileOrphanedRuns` | in-flight → FAILED on restart | `PRESERVE` |

## 10. Run recall — **corrected finding**

| Layer | Present? |
|---|---|
| `ipcMain.handle('jarvis:list-runs')`, `('jarvis:get-run')` | **yes** (`main.js:1119`, `:1135`) |
| `preload.js` exposure (`listRuns`, `getRun`) | **yes** (2 bindings) |
| **Renderer / UI consumption** | **NO — 0 calls in `renderer.js`; no `index.html` surface** |

**Correction to the 2026-08-24 Delta Map:** it stated recall was wired "end to end". It is not.
Recall exists at the IPC and preload layers and stops there. Nothing in the Desktop surfaces prior
runs to the founder.

Previous observation (superseded, retained as history): *"JARVIS remembers but does not recall."*
Accepted-base observation: **JARVIS remembers, and can be asked to recall, but nothing asks.**

**Disposition: `RECONNECT`** — the capability exists; the last hop is missing.

## 11. Repository-scoped memory (`.ain/`)

Git-capable epistemic state, versioned with the code it describes: `epistemic-ledger.jsonl` (2 lines),
`claims/` (1). Written and read by `epistemic-ci.mjs`. **Not hypothetical — tracked in git.** `PRESERVE`.

## 12. Machine-local operational history (`AIN_HOME`)

`~/.claude/ain-delegation/` — machine-scoped, **not** in git:

```
runtime/runs        77 records        runtime/events.jsonl   93,318 lines
packets             43                episodes.jsonl            360 lines
results             37                sessions.jsonl            261 lines
delegations         26                sessions/                 119
authority-channels · authority-gates · authority-instructions · authority-resolutions
locks · logs · preserved · plans (0)
```

Substantial operational history already exists. **`PRESERVE`.**

**Jurisdiction (observed, not invented):** `.ain/` = repository-scoped epistemic state, travels with
the code, git-capable. `AIN_HOME` = machine-scoped operational history, does not travel, not in git.
**Promotion semantics between them are deliberately NOT defined here.** `CONSOLIDATE` the documentation only.

## 13. Context retrieval

15 registered C0 capabilities: `git.rev_parse|log|show_stat|diff_stat|branch_contains|file_history`,
`repo.grep|find_file|locate_symbol`, `check.run`, `inventory.migrations|routes`,
`verify.file_exists|sha256|count_matches`. This is the **only** retrieval truth system; the aperture
composes it rather than duplicating it. `PRESERVE`.

Progressive retrieval / Context Packet (master directive §25–26): **not implemented** → `BUILD`.

## 14. Skills / procedures

No JARVIS skill mechanism exists. Repo `.claude/skills/` contains one MAIA skill (`field-study`),
unrelated to JARVIS operation. **`BUILD`** (not now).

## 15. Code intelligence

**Genuinely absent.** Sole repo-wide mention is an aspirational comment,
`lib/sovereign/decisionGovernor.ts:43` — *"You can swap this later to use your facet detection /
symbol index."* No code graph, symbol index, or call graph.

**`BUILD` — but not urgent.** Absence alone does not create need; build it when real
repository-impact questions demonstrably require it, not because another framework ships one.

## 16. Provenance

`provenance.js` (178 ln) + `stamp.mjs` + `repo-topology.js` + per-fragment
`{source_file, start_line, end_line, source_sha, extraction_method, content_hash}`.
Carries the full chain onto every persisted record. **`REPAIR`** — see PROV-01.

## 17. Learning

**No mechanism exists.** Every `promote`/`candidate`/`learning` match in the substrate is a comment
or an unrelated identifier (`epistemic-guard.mjs` header, `legibility.js` "promoted from status",
`child-env.js` node candidates). There is no OBSERVED→CANDIDATE→VERIFIED→PROMOTED→ACTIVE pipeline.

**`BUILD` — and gated behind the two repairs below.**

## 18. Desktop / Control Room

`main.js` (1,190) · `renderer.js` (875) · `legibility.js` (397, promotes facts from `jarvis:status`,
never invents, cannot promote a refusal) · `spiral.js` (354) · `capability-form.js` (219) ·
`preferences.js` · `provenance.js`. Twelve IPC handlers. **`PRESERVE`**, with the `RECONNECT` at §10.

---

## Required apertures

### EP-01 — answer adequacy · `REPAIR BEFORE SELF-LEARNING`

Gate Zero run `r-473d9742ed` was classified `verified` while the complete worker response was
`scripts/builder/router.mjs:23`. The requested value (`4000`) never appeared.

> **citation containment ≠ answerfulness ≠ semantic correctness**

A response consisting solely of a valid reference passes containment **vacuously**. Harmless for
Gate Zero, whose purpose was runtime/persistence binding. **Not harmless for learning**: such a
record would be promoted as successful experience. A deterministic first cut is available — require
an asserted proposition/value, not only citations. No LLM judge required to start.

### PROV-01 — worktree/SHA divergence · `REPAIR BEFORE SELF-LEARNING`

`jarvis-context.mjs:77` reads fragment content from the **working tree** (`readFileSync`), while
`headOf()` supplies `source_sha` from `git rev-parse HEAD`. On a dirty worktree the pair is a
**false provenance claim that looks rigorous**, and every persisted record inherits it.

Latent today (tree clean; the accepted witness carries `operated_dirty: false`). Dangerous once
memory derives later claims from earlier records.

---

## Disposition summary

| Disposition | Items |
|---|---|
| `PRESERVE` | binding · topology · router · packet guard · lane authority · governance verbs · claims + ledger · C0/C1/local-native execution · materialization · aperture · budget · `decideCorrectness` · epistemic guard · run store · C1 record · orphan reconciliation · `.ain/` · `AIN_HOME` · Desktop |
| `RECONNECT` | **run recall — IPC + preload exist, no UI consumes them** |
| `REPAIR` | `verifyEvidence` answer adequacy (EP-01) · provenance SHA/worktree pairing (PROV-01) |
| `CONSOLIDATE` | `.ain/` vs `AIN_HOME` jurisdiction — documentation only |
| `BUILD` | Task Packet object · risk tiers · progressive retrieval / Context Packet · skills · code intelligence · learning pipeline |
| `HOLD` | promotion semantics between the two stores |
| `DEPRECATE` | none identified |

**Most of JARVIS already exists.** The remaining work is not bulk construction: it is ensuring only
admissible experience enters, that provenance is true, that `VERIFIED` means something, and only then
that prior experience can influence the next piece of work.
