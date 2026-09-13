# JOP-04 — Effect-Bearing Capability Substrate Census

**Date:** 2026-09-13 · **Mode:** READ-ONLY · **Changes to executable code:** none
**Authority:** `docs/governance/JOP-04_CONTINUITY_RULING_2026-09-13.md`
**Checkout:** `claude/eloquent-clarke-fmz012` @ `e1c6f527`
**Question:** before authoring anything, what already represents authority, confirmation, effect
classification, reversibility, idempotency, execution identity, receipts, rollback, custody
crossing, and distribution eligibility?

⚠️ This is a census, not a design. Nothing here is ratified. Where a substrate is absent, that is
recorded as absent — not as an implied specification.

---

## 0. Headline

⭐ **The capability registry — the only layer that actually executes — is the one layer with no
authority vocabulary at all.**

Authority is asserted at the *packet* and *work-unit* layers and enforced by **refusing the entire
lane**, never by classifying the capability. `deterministic.mjs`'s `CAPABILITIES` entries carry
`args` and `handler` and nothing else: no effect class, no reversibility, no authority requirement.

That design is **correct and sufficient while every capability is read-class**, which is why it has
never failed. It has **no answer at all** the moment one capability is not.

⛔ **That, precisely, is the JOP-04 frontier** — not the gateway, not the sandbox, not the proofs.

## 1. Verification of inherited claims

| Claim | Verified | Evidence |
|---|---|---|
| Deterministic gateway merged and present | ✅ | `scripts/builder/deterministic.mjs`, 9,621 bytes |
| 13 typed capabilities | ✅ | `CAPABILITIES` @ `deterministic.mjs:6` — `git.rev_parse` `git.log` `git.show_stat` `git.diff_stat` `git.branch_contains` `git.file_history` `repo.grep` `repo.find_file` `repo.locate_symbol` `check.run` `inventory.migrations` `inventory.routes` `verify.file_exists` `verify.count_matches` |
| argv-only, no shell | ✅ | 13 `execFileSync` call sites, 0 `shell:true` — matches the 2026-08-11 proof exactly |
| **Registry is write-free** | ✅ | no `writeFile`/`mkdir`/`unlink`/`appendFile`/`git commit`/`git push` in any handler |
| Governance / guard / store / context merged | ✅ | `jarvis-governance-gate.mjs` 309 L · `jarvis-packet-guard.mjs` 158 L · `jarvis-runtime-store.mjs` 114 L · `jarvis-context.mjs` |
| Living Spiral jurisdiction ratified | ✅ | `docs/governance/JARVIS_LIVING_SPIRAL_JURISDICTION_2026-08-16.md` |

⭐ **The write-free finding is load-bearing**: the substrate has never carried a single mutating
act. Every safety property proven to date was proven against read-class work only.

---

## 2. The ten questions

### Q1 — Authority · **EXISTS · ⛔ THREE DISJOINT VOCABULARIES**

| Layer | Object | Site |
|---|---|---|
| Gate | `GATE_CLASSES` — 6 classes, each `{resolver, executable_after_resolution}` | `jarvis-governance-gate.mjs:45` |
| Work unit | `authorized_acts` / `not_authorized_acts` string acts | `work-unit.mjs:90-91` |
| Pipeline | `READ_ONLY_LANES` + `WRITE_REQUESTING_KEYS` | `jarvis-runtime-pipeline.mjs:91-97` |
| **Capability** | **⛔ none — no authority field exists on a capability** | `deterministic.mjs:6-207` |

```text
GATE_CLASSES                              resolver   executable_after_resolution
FOUNDER_DECISION_REQUIRED                 FOUNDER     true
OPERATOR_AUTHORIZATION_REQUIRED           OPERATOR    true
SCOPE_EXPANSION_REQUIRED                  OPERATOR    true
CONSTITUTIONAL_AMBIGUITY                  FOUNDER     true
WRITE_AUTHORITY_REQUIRED                  OPERATOR    false   ⭐
PRODUCTION_AUTHORIZATION_REQUIRED         FOUNDER     false   ⭐
```

⭐ **Existing ratified law, easily missed and directly binding on JOP-04:** the only two classes
with `executable_after_resolution: false` are exactly **WRITE** and **PRODUCTION**. The substrate
already holds that *resolving a write-authority gate does not itself license execution.*
JOP-04 inherits that and **must not weaken it**.

⭐ **Self-grant is structurally refused.** `SELF_GRANT_KEYS` (`jarvis-governance-gate.mjs:98-101`)
rejects a worker gate carrying `granted`, `authority_granted`, `approved`, `authorized`,
`delegation_id`, `resolution_id`. The file's own statement of law: *"A WORKER GATE IS A CLAIM, NOT
AN AUTHORITY. The worker may IDENTIFY the missing authority. It may not SUPPLY it."*

⛔ **Reconciliation debt:** three vocabularies, never reconciled, describing one concept. A capability
is authorized by lane, by act-string, and by gate class — with no mapping between them. JOP-04 must
either reconcile them or rule explicitly that they are separate concerns.

### Q2 — Confirmation · **⛔ ABSENT AS A RUNTIME OBJECT**

The **refusal** side is fully built (gate classes, resolvers, `GATE_STATUS.OPEN/RESOLVED/REFUSED/
SUPERSEDED`, self-grant prohibition). The **granting** side is not: resolution is out-of-band. There
is no in-band confirmation primitive — no ask-then-act round trip, no representation of a pending
confirmation a run is waiting on, no expiry of a granted confirmation.

⛔ There is nothing today that could carry *"this act needs a human yes before it executes."*

### Q3 — Effect classification · **PARTIAL · BINARY**

The only distinction that exists anywhere is **read vs write**, expressed three incompatible ways:
`READ_ONLY_LANES = ['local-native']`; the `WRITE_AUTHORITY_REQUIRED` / `PRODUCTION_AUTHORIZATION_REQUIRED`
gate classes; and `repo.write:worktree` vs `production.write` act strings.

`derivePermissionEnvelope()` (`work-unit.mjs:230`) is the nearest thing to an effect model:
`repo_read` · `repo_write_scope` · `execute_checks` · `integration_actor` · `production_read` ·
`production_write` · `deploy` · `authority_change`.

⭐ That envelope already separates **destination** (`repo` vs `production`) from **scope**
(`worktree` vs none) and isolates **who may integrate** from who may execute — evidence the
founder's suspicion is correct: the substrate has *already started* splitting axes rather than using
one enum. ⛔ It has no axis for reversibility, externality, or consequence.

### Q4 — Reversibility · **⛔ ABSENT**

Zero occurrences of `reversib*`, `undo`, `restore`, `compensat*` across `scripts/builder/*.mjs` and
`lib/mcp/*.ts`. Nothing anywhere represents whether an act can be taken back.

### Q5 — Idempotency · **⛔ ABSENT**

Zero occurrences of `idempot*`. The closest analogue is `writeAtomic()`
(`jarvis-runtime-store.mjs:41`) — that is **atomicity of a local file write**, not idempotency of
an effect. No act carries a key, a dedupe token, or a repeat-safety property.

### Q6 — Execution identity · **✅ STRONGEST INHERITED OBJECT**

| Object | Site |
|---|---|
| `newRunId()` → `r-<10 hex>` | `jarvis-runtime-store.mjs:37` |
| `WORK_UNIT_ID_RE` — slug, because it becomes a filename, branch name and argv entry | `jarvis-runtime-pipeline.mjs:116` |
| Session leases, `DEFAULT_MAX = 1`, staleness 4 h, `leaseHeld()`, `recordUnauthenticatedTouch()` | `session.mjs:79-87, 341, 351` |
| `RUN_STATES` · `TERMINAL_STATES` · `LEGAL_TRANSITIONS` · `isLegalTransition()` | `jarvis-runtime-pipeline.mjs:43-85` |
| `starting_sha` required on every result | `jarvis-runtime-pipeline.mjs:201` |
| `bindSelector()` / `headOf()` — selectors bound to execution head | `jarvis-packet-guard.mjs:84-118` |
| `LIFECYCLE_VOCABULARY` — 17 states | `work-unit.mjs:96` |

⭐ **Single-writer / lease semantics already exist.** An earlier framing listed them as to-build;
they are merged. JOP-04 inherits, does not author.

### Q7 — Receipts · **SUBSTANTIAL · ⛔ READ-SHAPED**

Present: `RUNS_DIR` per-run records, append-only `EVENTS_LOG` (`events.jsonl`), `saveRun` /
`loadRun` / `listRuns` / `appendEvent`, `reconcileOrphanedRuns()`, `validateResult()` requiring
`work_unit_id` · `lane` · `model` · `starting_sha` · `files_changed`, and `verifyEvidence()` with a
citation regex binding claims to `file:line`.

⛔ **But the record describes a run, not an effect.** It captures what the run *claimed* and which
files changed. It has no field for what changed **in the world**, nor for whether the effect was
independently verified to have occurred.

⭐ The four states an effect-bearing operator must distinguish —

```text
I intended to do it
I attempted it
the tool reported success
the world actually changed
```

— are **not representable** in the current schema. Today they collapse into one.

### Q8 — Rollback · **⛔ ABSENT FROM THE OPERATOR SUBSTRATE**

Rollback exists in the repository, but in a **different lane under different custody**:
`scripts/deploy-tag.sh`, image tags `maia-sovereign:current` / `:previous` / `:<sha>`, and
`deploy-production.sh rollback`. Nothing in the operator substrate can reach it, and no capability
declares a rollback counterpart.

### Q9 — Custody crossing · **PARTIAL · ⛔ INVERTED**

`jarvis-packet-guard.mjs` partitions `WORKER_VISIBLE_FIELDS` from `VERIFIER_ONLY_FIELDS` and lints
leakage (`partitionPacket` :41, `lintLeakage` :55).

⚠️ That governs information crossing **inward** — what a worker is permitted to see. It is a
containment boundary, not an externalization boundary.

⛔ **Nothing governs information or effect crossing outward.** The candidate `EXTERNALIZE` class has
no existing counterpart anywhere in the substrate.

### Q10 — Distribution eligibility · **EXISTS AS PROGRAMME STATE · ⛔ NOT MACHINE-READABLE**

| Record | State |
|---|---|
| `JOP-01_CLOSURE_LEDGER_2026-08-16.md` | SOURCE CLOSURE ESTABLISHED · **DISTRIBUTION CLOSURE OWED** |
| `JOP-02_INSTALLED_ACCEPTANCE_6d3c0cbc4_2026-08-16.md` | installed artifact accepted @ `6d3c0cbc4` |
| `JOP-03_PACKAGING_DISTRIBUTION_WITNESS_MANDATE.md` | mandate standing |

⛔ **No code anywhere reads distribution state.** The distribution boundary ruled in JOP-04 is today
enforceable only by document and discipline — there is no predicate a capability could consult.

---

## 3. Summary — inherit vs author

```text
INHERIT (built, proven, do not re-author)
  typed capability registry + arg validation
  argv-only execution · path confinement
  governance gate classes + self-grant refusal
  packet guard (inward containment)
  run store · append-only event log
  execution identity · single-writer leases · legal state transitions
  zero-LLM deterministic execution

AUTHOR (absent — the actual JOP-04 subject)
  effect classification on the CAPABILITY (not only the packet)
  confirmation as a runtime object
  reversibility as a declared property
  idempotency / repeat-safety
  effect receipts distinguishing intent · attempt · report · world
  rollback reachable from a capability
  outward custody-crossing boundary
  machine-readable distribution eligibility

RECONCILE (exists three times, never unified)
  authority: gate class ⇄ act string ⇄ lane
```

## 4. Open questions for founder adjudication — ⛔ not decided here

1. **Authority reconciliation** — unify the three vocabularies, or rule them separate concerns?
2. **Where does effect class live** — on the capability, on the packet, or on the pairing? The
   census shows authority currently lives everywhere *except* the executing layer.
3. **Does `executable_after_resolution: false` generalize** to every mutating class, or only to
   WRITE and PRODUCTION as today?
4. **Is a confirmation a first-class persisted object** with identity and expiry, or a property of
   a gate resolution?
5. **Receipt schema** — is "the world actually changed" a *required* field for mutating acts, and
   what counts as its independent witness?
6. **Distribution predicate** — should JOP-01 closure become machine-readable, or remain a
   document gate?

## 5. Standing

```text
CENSUS                               COMPLETE (read-only)
EXECUTABLE CODE CHANGED              none
EFFECT TAXONOMY                      CANDIDATE — not ruled
MUTATING CAPABILITY AUTHORIZED       ⛔ NONE
FIRST WRITE SPECIMEN                 named (git/GitHub), ⛔ not built
DISTRIBUTION OF MUTATING AUTHORITY   ⛔ BLOCKED on JOP-01 distribution closure
MAIA RUNTIME                         ⛔ UNTOUCHED
NEXT ACT                             founder adjudication of §4
```
