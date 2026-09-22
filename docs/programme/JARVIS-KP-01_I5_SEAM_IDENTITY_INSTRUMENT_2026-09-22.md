# JARVIS-KP-01 / I5 — SEAM IDENTITY INSTRUMENT (CANDIDATE)

**Date**: 2026-09-22
**Standing**: instrument landed as a **CANDIDATE** · ⛔ **UNWIRED** · confers no authority
**Occasioned by**: `I5-P0R1` anchor-drift disposition (§3a, the proposed binding)

> NO SEMANTIC JOIN WITHOUT A WARRANT.

---

## 0. What this act is

`I5-P0R1` failed on its binding form, not its architecture: a readiness act bound
to a point SHA, over a substrate an independent deployment lane may advance at
any moment, has a shorter lifetime than the act it authorizes. The disposition
record proposed a property-based binding instead. **Naming a binding is a
proposal, not an instrument** — so this act builds the instrument that would make
such a binding mechanically checkable, and proves it lethal before anything
relies on it.

⛔ This act performs **no production read**, enables **no flag**, launches **no
shadow**, writes **no row**, runs **no migration**, and changes **no runtime
code**. It touches three new files under `scripts/witness/` and two `package.json`
script entries.

⛔ **Building the instrument is a new act, not something `I5-P0R1` authorized.**
It is landed as a candidate for that reason.

---

## 1. Landed

- `scripts/witness/seam-identity.mjs` — `compute` · `verify` · `check`, `--scope full|image`
- `scripts/witness/seam-identity-container.mjs` — the **production-side half**
- `scripts/witness/seam-identity-falsifiers.mjs` — 12 falsifiers, F1…F12
- `scripts/witness/seam-identity-candidates.mjs` — 5 defeat candidates, DC-1/2/5/9/10
- `npm run witness:seam-identity` · `:container` · `:matrix`

Zero dependencies (the container has no `node_modules`); plain `node` + `git`.

### The seam, named

The path set is **declared literally in the instrument**, never globbed — a glob
silently admits new files and silently drops renamed ones, and the digest would
then move for reasons nobody named. Six declarations expanding to **37 files**:

```
lib/ain/epistemic-join
lib/maia/relational-field-shadow
app/api/sovereign/app/maia/list/route.ts
database/migrations/20260916211500_relational_field_shadow_runs.sql
database/migrations/20260921000001_epistemic_join_persistence.sql
database/migrations/20260921000002_epistemic_join_integration_shadow.sql
```

`seam_id` = SHA-256 over the sorted set of `(blob_hash, path)` pairs.
Current value at production-at-authorization, production-now and canonical:

```
full  scope · 37 files · 195b16bce1c807477bf97befc3c9b6d64a22e4520d0bdd8e9fcd173e35bb885b
image scope · 36 files · a63cf931fe80227004ba9d8730c628bb0c0d65deae6e53e8c29b6bc3b3fd3b51
```

### ⭐⭐ The production side is WITNESSABLE, not merely entailed

`Dockerfile.production` copies `/app/lib` and `/app/database` into the runner
stage **as source**. So **36 of the 37** declared seam files are physically
present in the running container, and
`scripts/witness/seam-identity-container.mjs` recomputes git blob hashes from the
filesystem — no `git` binary, no `.git` — and reproduces the git-side
`--scope image` digest **byte-for-byte** (falsifier **F9**).

That converts the production side of the binding from *reading the container's
asserted `GIT_COMMIT` label* into *hashing the container's actual bytes*:

```
docker exec maia-sovereign node /app/scripts/witness/seam-identity-container.mjs \
  --expect a63cf931fe80227004ba9d8730c628bb0c0d65deae6e53e8c29b6bc3b3fd3b51
```

⛔ **One path cannot be witnessed this way and is reported, never folded in.**
`app/api/sovereign/app/maia/list/route.ts` is compiled into `.next/standalone`
and its source is not copied to the runner, so it stays **ENTAILED** from
`GIT_COMMIT` plus the deploy provenance chain. The instrument prints it as
`entailed_only=…`, and **DC-9** exists precisely to kill an implementation that
claims it as covered.

---

## 2. Design laws, each with a falsifier

| Law | Statement |
|---|---|
| **L1** | The seam path set is declared, never discovered. |
| **L2** | A declared path **absent** at the rev is a named refusal (`SEAM_PATH_ABSENT`), never a skipped entry — absence and mutation must not be indistinguishable. |
| **L3** | A declared directory expanding to zero files is a refusal. |
| **L4** | An unresolvable rev is a refusal, never an empty digest. |
| **L5** | ⭐ Ancestry that cannot be **verified** is `ANCESTRY_UNVERIFIABLE` — ⛔ never reported as `NOT_ANCESTOR`. |
| **L6** | Fail-closed: any unrecognised condition exits non-zero. |

### ⭐⭐ L5 exists because the defect already happened

On 2026-09-21 a fetch of `clean-main-no-secrets` in a grafted clone reported
`+ 8cb64064...65bcb76b (forced update)` — the shape of a canonical history
rewrite, which would have invalidated every SHA-anchored record in this lane.
It was a **shallow-clone transport artifact**; after deepening, `8cb64064` is an
ordinary ancestor.

**L5 makes that near-miss structurally impossible to repeat**: the instrument
returns a third value rather than a negative when the connecting history is
absent. *In a grafted clone, a non-fast-forward report carries zero information
about rewriting — absence of the connecting link is not evidence that the link
is absent.*

---

## 3. Results

### Falsifier matrix — **12/12 PASS** (`exit 0`)

| ID | Law | Proposition |
|---|---|---|
| F1 | L1 | one changed seam byte moves the digest |
| F2 | L2 | absent declared path refuses **by name** |
| F3 | L4 | unresolvable rev refuses |
| F4 | L5 | complete history + genuine non-ancestor → `NOT_ANCESTOR` |
| **F5** | **L5** | grafted history → `ANCESTRY_UNVERIFIABLE`, **not** a negative |
| F6 | L6 | missing argument refuses |
| F7 | L1 | duplicate declaration does not move the digest |
| **F8** | L6 | ⭐ a **conforming** binding is **admitted** |
| **F9** | L1 | ⭐⭐ container-side filesystem digest **equals** the git-side image scope |
| F10 | L1 | one changed byte on the filesystem moves the container digest |
| F11 | L2 | container side refuses an absent declared path by name |
| **F12** | L2 | ⭐ the compiled-only path is **reported entailed**, not counted as witnessed |

⭐ **F8 is the lethality in the other direction.** Without it, an instrument that
refuses everything would score 7/7. F1+F5 prove it is not blind; F8 proves it is
not merely paranoid.

### Defeat candidates — **5/5 DEAD on their named falsifier · 0 unclassified collateral** (`exit 0`)

| Candidate | Named | Modelled error |
|---|---|---|
| **DC-1** | F1 | identity derived from the seam's **shape** rather than its **content** |
| **DC-2** | F2 | a declared path yielding nothing contributes nothing |
| **DC-5** | F5 | *git says "not an ancestor", so the answer is `NOT_ANCESTOR`* |
| **DC-9** | F12 | the compiled-only path is counted as **witnessed** coverage |
| **DC-10** | F9 | content hashed as **raw bytes**, so the container digest cannot be compared with git |

⭐ **DC-5 is the whole reason for the matrix.** It is the obvious, competent,
plausible implementation — the one most people would write — and it passes every
other case. It dies only on F5.

### ⚠️ The matrix found a defect in a candidate, not in the instrument

DC-1's first construction also died on **F2**, because a path-names-only digest
naturally omits the absence refusal too — **two errors in one candidate, whose
evidence is therefore unreadable**. Repaired by *narrowing* DC-1: it now keeps the
conforming absence refusal, so it models shape-not-content and nothing else.

⛔ That narrowing is lawful precisely because it does **not** make the candidate
cease to embody its named error. Where narrowing *would* destroy the model, the
collateral is **CLASSIFIED with a reason** instead — the instrument prints
`UNCLASSIFIED` and exits non-zero rather than letting an isolation defect pass
as evidence.

Residue zero: no worktrees, temp fixtures or branches left behind.

---

## 4. ⛔ What the instrument does NOT establish

- ⛔ It does **not** establish the seam is **correct** — only whether it **moved**.
- ⛔ This act performed **no production read**. The container-side half is
  *built and proven equivalent against the working tree*; running it inside
  `maia-sovereign` is a **production act still owed to a host with access**.
- ⛔ It **gates nothing.** No act requires it until a founder act names where a
  passing `check` is REQUIRED.
- ⛔ It does not discharge **B1** (Founder allowlist mismatch) or **B2** (empty
  shadow model set). It addresses **B3** — the binding form — and only that.
- ⛔ A passing `check` is **necessary and not sufficient** for readiness: image
  stability across the witness window is a runtime property the digest cannot
  see.
- ⚠️ 16 of the 36 image-scope files are `__tests__`. They are **deliberately**
  in the seam — a change to the shadow contract tests is a change to the seam's
  law — but that is a **judgment recorded, not a neutral fact**: it makes the
  digest move on test-only edits, which is stricter than a runtime-only reading
  would be. Narrowing it is a founder call, ⛔ not taken here.

---

## 5. Owed before it gates anything

1. **A founder act** naming where a passing `check` is required, and with which
   expected digest.
2. **A freeze** of the instrument and its matrix by blob hash, on the
   `REVIEW-CUSTODY-01` precedent — additive law is lawful, **editing is not**.
   ⛔ Not taken here: a freeze is a founder act.
3. **The container-side run itself** — `docker exec` of
   `seam-identity-container.mjs --expect a63cf931…` inside `maia-sovereign`.
   The instrument exists; ⛔ it has not been run against production.

---

## 6. Standing

Instrument **CANDIDATE** · falsifiers **12/12** · candidates **5/5 DEAD, 0
unclassified** · container-side half **BUILT + EQUIVALENCE PROVEN, ⛔ NOT RUN IN
PRODUCTION** · ⛔ **UNWIRED** · ⛔ NOT FROZEN · ⛔ GATES NOTHING · ⛔ B1 and B2
UNREPAIRED · ⛔ no production read · ⛔ no flag enabled · ⛔ no shadow executed ·
⛔ no row written · ⛔ no migration · ⛔ no deploy · ⛔ I5-P1 NOT OPENED ·
**PRODUCTION UNTOUCHED.**

⭐ *The readiness act kept failing on the age of its warrant. This measures the
one thing the warrant actually cared about — whether the seam moved — and refuses
rather than guesses when it cannot tell.*
