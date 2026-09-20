# RGR-07 — Materialization & Sealing Protocol

**Programme:** RELATIONAL-GEOMETRY-REASONING
**Benchmark:** `RGR-RT1-D2C-01 — Directed Two-Step Composition`
**Predecessor:** RGR-06 (FOUNDER-CLOSED, `cd28c1a87905a51ae0d9d1554ff50daace323565`)
**Standing:** `PROTOCOL RATIFIED · EXECUTION HALTED PENDING PHASE 1`
**Materialized pairs:** `0`

> This record is documentary. It authorizes no materialization, no execution,
> no merge and no deployment. It fixes the protocol under which a separately
> authorized materialization act may later run.

---

## 1 · Purpose

RGR-04 §19 (pre-materialization feasibility lock) is discharged by RGR-05
(feasibility) and RGR-06 (implementation conformance, independent verification,
runtime lock). RGR-04 §22's execution lock is therefore the only remaining
barrier before data exist.

This protocol governs how the frozen benchmark may be materialized without
converting the preregistration's no-rescue rule into a behavioural promise.

## 2 · The defect this protocol exists to prevent

RGR-04 publishes the split master seeds (`41041 / 41042 / 41043 / 41044`) and the
canonical substream derivation. Publication is **required** for third-party
reproducibility and is not reversed.

⛔ Consequently the TEST and REPLICATION splits **cannot be protected by secrecy.**
Encrypting or permission-gating the materialized files protects one copy of the
data and not the information: any context holding the generator reconstructs both
splits from public constants.

⭐ The enforceable property is therefore not concealment but **attribution**:
crossing the boundary must require a digest-breaking, attributable source change.

### Seed-bearing artifacts identified (this branch, verified 2026-09-20)

| Artifact | Evidence |
|---|---|
| `scripts/research/rgr/rgr05_feasibility.py:31-35` | `SPLIT_SEEDS` incl. `TEST: 41043`, `REPLICATION: 41044`; derivation at `:52-71` |
| `docs/programme/RGR-04_PREREGISTRATION_LOCK_2026-09-18.md:74-90` | seeds + canonical stream formula |

✅ `origin/clean-main-no-secrets` (`8cb64064`) carries **neither** — no RGR artifacts,
no seeds, no `RGR04|` derivation string. Canonical is clean.

✅ `scripts/research/rgr/rgr05_independent_verifier.py` is **seed-free** and imports
stdlib only. Independent verification does not structurally require seed material.

---

## 3 · The three-layer seal (RATIFIED)

| Layer | Mechanism | Function |
|---|---|---|
| **1 · Artifact custody** | TEST/REPLICATION generated directly to sealed path, digest-committed, absent from any tuning tree | tripwire |
| **2 · Generator custody** | crossing requires authoring new source → implementation digest breaks | **structural, load-bearing** |
| **3 · Runtime attestation** | tuning contexts emit a digest-bearing attestation that no TEST/REPLICATION codebook, artifact or derivation was present or invoked | falsification |

### 3.1 Layer 2 — lineage formulation (RATIFIED)

Forward relocation or deletion cannot enforce Layer 2: a stripped file remains
recoverable from history, and history rewrite is foreclosed because it would
invalidate the lane's own evidence.

> **Layer 2:** the execution context and branch ancestry of any tuning lane MUST NOT
> contain the seeds `41043 / 41044`, the codebook derivation, or the generator logic.
> Enforcement is at the git object store, not workspace file state.

### 3.2 Layer 2 — entry-point formulation (RATIFIED)

⛔ **CLI / config seed parameterization is REJECTED for builder binaries.** A generator
accepting `--seed 41043` needs no source change to cross, so no digest breaks and
nothing is attributable — Layer 2 would revert to a behavioural rule.

~~~text
core/            seed-FREE. enumeration · validators · directed 2-switch ·
                 codebook · surface assignment · row order · allocator.
                 Seeds are runtime parameters. NONE embedded.
                 ONE implementation → ONE digest → ONE conformance pass.

builder_07a.py   embeds { TRAIN: 41041, VALIDATION: 41042 } ONLY
builder_07b.py   embeds { TEST: 41043, REPLICATION: 41044 } ONLY
~~~

In the 07a workspace `builder_07b.py` is **absent, not disabled**. Producing
TEST/REPLICATION there requires authoring a new entry point.

---

## 4 · Three-lineage separation (RATIFIED)

| Lineage | Holds | Produces | Base |
|---|---|---|---|
| **07a builder** | `core/` + `builder_07a.py` | 15,000 TRAIN+VAL pairs | `8cb64064` |
| **07b builder** | `core/` + `builder_07b.py` | 12,000 TEST+REP pairs → sealed custody | `8cb64064` |
| **07a tuning lane** | base code + materialized TRAIN/VAL artifacts only | tuning / validation runs | `8cb64064` |

The builder → tuning-lane boundary is a **one-way artifact handoff, never a checkout.**
No builder may be cut from lineage containing `rgr05_feasibility.py` or any historical
seed reference.

---

## 5 · Artifact admission check (RATIFIED, MANDATORY)

The lineage rule governs ancestry; it does not stop a seed-bearing file from being
copied into a clean workspace. Before any artifact enters a seed-free workspace:

~~~bash
# must return NOTHING before the artifact is admitted
grep -E '41041|41042|41043|41044|RGR04\|' <artifact>
~~~

If the RGR-06 conformance contract carries TEST/REPLICATION seed or split definitions
it **may not enter the 07a workspace**. A seed-free extract covering TRAIN/VAL
properties only is authored, digest-committed, and admitted through this check.

---

## 6 · Sync-branch quarantine (RATIFIED)

RGR-06's accepted implementation embeds all four split seeds. Syncing
`cd28c1a87` for durability therefore creates a new seed-bearing remote lineage.

1. **Quarantine** — the sync branch is never a base or ancestor for any 07a/07b
   builder, tuning, or evaluation branch.
2. **Merge hold** — held unmerged to `origin/clean-main-no-secrets` until primary
   disposition freeze, at parity with the hold on `claude/intelligent-bell-6raooy`.

⚠️ Rationale: merge-to-canonical is latent authorization (cf. the 2026-09-07 finding).
Merging RGR-04/05/06 would write the seeds into every future checkout, making all
subsequent branch cuts seed-aware and Layer 2 unsatisfiable.

---

## 7 · Ratified sequence

~~~text
[Phase 1 — Host sync, quarantine, seed-free base]
 1. Host sync cd28c1a87 to an isolated quarantine branch
    (NO MERGE TO CANONICAL · NEVER A BASE FOR 07a/07b)
 2. Cut seed-free workspaces strictly from 8cb64064
 3. Extract and digest-commit a seed-free RGR-06 conformance contract extract
    GATE: artifact admission check returns 0

[Phase 2 — RGR-07a materializer authoring]
 1. Implement seed-free core/
 2. Implement builder_07a.py (41041 / 41042 embedded ONLY)
 3. Verify against the seed-free contract extract; compute implementation digest

[Phase 3 — Materialization and independent verification]
 1. Materialize 15,000 TRAIN+VAL pairs into active working custody
 2. Run the seed-free independent verifier (ccedc6ec… or a seed-free port)
~~~

Host sync is **Step 1**: authoring against an unreadable contract produces an artifact
that either fails conformance or passes by coincidence. Neither is evidence.

---

## 8 · Authorization boundary

~~~text
RGR-07a materialization authorized in principle:   YES, gated on Phases 1-2
RGR-07b materialization:                           SEALED BUILD ACT ONLY
CLI seed parameterization of builders:             REJECTED
merge of RGR-04/05/06 to canonical:                NOT AUTHORIZED
TEST execution:                                    NOT AUTHORIZED
REPLICATION execution:                             NOT AUTHORIZED
model training / performance inspection:           NOT AUTHORIZED
deployment / production action / MAIA modification: NOT AUTHORIZED
~~~

Unseal of TEST/REPLICATION requires a named founder act following primary
disposition freeze. RGR-04 §20's stopping lock is unchanged: no retune on test,
no retune on replication, no model-class change.

---

## 9 · Session state at authoring

~~~text
pairs materialized:        0
runs executed:             0
builder source authored:   0 files
pushes to canonical:       0
merges to canonical:       0
cd28c1a87 present locally: NO (isolated worktree, unsynced)
~~~
