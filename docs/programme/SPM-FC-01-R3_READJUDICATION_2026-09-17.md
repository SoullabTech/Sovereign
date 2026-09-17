# SPM-FC-01-R3 — CLOSING-SYNTHESIS RE-ADJUDICATION

**Canonical predecessor lane:** `claude/clever-einstein-mojiar` @ `8bba2f76d449ba969fe42208f698a94728e38d1d`

**R3 successor lane:** `chore/spm-fc-01-r3-closing-synthesis-20260917`

**Original base contract commit:** `99d6f918d7b88d4a7a674ad004261d0f2baa0c20`

**Original base contract blob:** `e6e78a58d2c7a93870fe33633b1f099b32a110a2`

**Corrected base contract blob:** `a4dabcecd7a43c57ca5432b50921421fba6ce129`

**First adjudication:** `7d89daa6619942ac60c2ac450d9e4ab35d5d15af`

**R2 overlay commit:** `f40d4134adc62fdbdd5e8be1199b685f5577973b`

**R2 overlay blob:** `f3af4e3de0613f3858a72a674b11e546ec32bd78`

**R2 re-adjudication commit:** `8bba2f76d449ba969fe42208f698a94728e38d1d`

**R2 re-adjudication blob:** `f1bdb3bec08aa856955e3f95ae812800ca1800d1`

**Date:** 2026-09-17

---

## 0 · CUSTODY AND COLLISION RULING

FC-01 already existed entirely on `origin/claude/clever-einstein-mojiar`; no FC-01 commit existed on
the parallel `claude/festive-sagan-apvfs5` lane. Before R3 mutation, the predecessor branch was not
checked out in any registered worktree, no active Claude process held a repository handle to it,
and no searched Claude session metadata named the branch. R3 therefore took single-writer custody
by binding a clean isolated worktree directly to the exact remote tip `8bba2f76d`.

The repository's installed sovereignty pre-commit gate then refused a commit on the `claude/*`
branch. It permits only `main`, `clean-main-no-secrets`, `feature/*`, `fix/*`, or `chore/*` lanes.
No commit was created by the refused attempt and no hook was bypassed. R3 therefore re-bound to
`chore/spm-fc-01-r3-closing-synthesis-20260917`, created directly from `8bba2f76d` with the exact
staged R3 object preserved. The predecessor branch remains unchanged and historical.

R1 and R2 remain historical records. R3 does not overwrite, renumber, or reinterpret them as though
they had not occurred.

---

## 1 · THE DEFECT R2 MISSED

R2's overlay states that every base clause not named by the overlay remains verbatim and unchanged.
Its bounded re-adjudication reopened standing/classification, ten named invariants, and three named
cross-contract collisions. It did **not** reopen or name the base contract's final synthesis.

The unchanged base therefore still ended with:

```text
Standing is earned and accumulates. Warrant is granted and is spent.
```

That sentence contains two constitutional overclaims.

### 1.1 · `Standing ... accumulates` conflicts with I-9

I-9 says explicitly:

```text
Standing is not asserted to be monotonic. A model requiring it is not this one.
```

The closing synthesis reintroduced a monotonic accumulation premise after the contract had already
withdrawn it. A closing summary cannot acquire authority to contradict an invariant it summarizes.

### 1.2 · `Warrant ... is spent` universalizes a subtype

D9-B distinguishes two materially different cases:

- **B3 collapsed:** a fresh byte-identical crossing is immediately available because the server
  mints a new disclosure identity. The record states: **"Nothing is scarce. Nothing is spent."**
  The mechanism is replay/idempotency protection, not a consumable warrant.
- **B4 survives:** one Ask authorization act is genuinely purpose-bound and consumable; the route
  spends that act even on a coordinate mismatch. This is evidence for a consumable warrant subtype,
  not for universal consumability.

D9-C then establishes a different warrant shape: `circle_memberships.consent_mode` lives on the
member × audience relationship, can govern multiple in-scope objects, and remains effective until
revoked. R2's own I-16 correction therefore expressly allows class-, relationship-, or
 audience-scoped warrants to cover multiple objects inside their declared scope.

So `warrant ... is spent` is not licensed as a universal closing law. The evidence supports
**some consumable warrants**, not **all warrants are consumable**.

---

## 2 · R3 REPAIR — MINIMAL AND OBJECT-LEVEL

R3 changes the governed contract object itself.

Exactly one four-line closing-synthesis paragraph was deleted from
`SPM-FC-01_COMBINED_D9_F5_FALSIFICATION_CONTRACT_2026-09-17.md`.

```text
old blob  e6e78a58d2c7a93870fe33633b1f099b32a110a2
new blob  a4dabcecd7a43c57ca5432b50921421fba6ce129
```

No replacement doctrine was inserted. The deletion removes the unsupported synthesis without
manufacturing a new one.

The R2 overlay is byte-identical to its adjudicated object:

```text
f3af4e3de0613f3858a72a674b11e546ec32bd78
```

The R2 re-adjudication is likewise unchanged:

```text
f1bdb3bec08aa856955e3f95ae812800ca1800d1
```

---

## 3 · OBJECT COMPOSITION UNDER R3

The candidate constitutional object is now:

```text
corrected base contract blob a4dabcecd7a43c57ca5432b50921421fba6ce129
+
R2 replacement overlay blob f3af4e3de0613f3858a72a674b11e546ec32bd78
```

The overlay continues to govern only its already-adjudicated named loci:

```text
standing / classification
I-1 · I-3 · I-4 · I-7 · I-10 · I-16 · I-20 · I-25 · I-26 · I-32
I-19 classification
I-33 classification
```

Every other invariant clause in the corrected base is byte-identical to the object adjudicated in
R1. The only base-file delta is deletion of the defective closing synthesis.

---

## 4 · FULL CONSTITUTIONAL SCOPE RE-CHECK

### 4.1 · Provenance and anti-laundering — PASS

No evidence source changed. No new proof was introduced. D9 and F5 source bindings remain exactly
those bound by the original contract and R2. R3's only substantive act is removal of a synthesis
that exceeded those sources.

### 4.2 · Classification / count — PASS

R2's corrected accounting remains intact:

```text
31  locally earned D9/F5 invariant laws
 1  declared GAP clause — I-19, Law: none stated
 1  imported prior ratified law — I-33, temporal-memory lane
---
33  numbered clauses across 13 domains
```

R3 introduces no new invariant and promotes neither I-19 nor I-33.

### 4.3 · Twenty-one unchanged locally earned laws — PASS

Their text is unchanged from the R1-adjudicated base. Deleting a contradictory non-numbered closing
summary changes no six-field law, evidence binding, prohibited move, adversarial case, PASS case, or
FAIL case.

### 4.4 · Ten R2 scope corrections — PASS

The R2 overlay is byte-identical to the object adjudicated at `8bba2f76d`:

```text
I-1   member-initiated destructive subject authority
I-3   intentional authority scope vs accidental adjacency
I-4   trusted provenance vs declared attribution
I-7   non-disclosing refusal with governed truth
I-10  explicit executable participation scope
I-16  object-bound vs class/relationship/audience-scoped warrants
I-20  multi-sovereign governed record or stake
I-25  storage-sufficient erasure-completion evidence
I-26  governed lineage and governed de-linking
I-32  manifestability with governed verification
```

None depends on the removed closing synthesis. The removal instead eliminates an overgeneralization
that was in tension with I-9 and the corrected I-16.

### 4.5 · I-19 gap treatment — PASS

I-19 remains a declared gap with no law stated. R3 does not infer a general law of MAIA-as-speaker
representation from D9-C's single Circles specimen.

### 4.6 · I-33 imported-prior-law treatment — PASS

I-33 remains an imported temporal-memory law and does not acquire D9/F5 provenance.

---

## 5 · THREE PRIOR CROSS-CONTRACT COLLISIONS — RE-RUN

### C1 · I-7 × I-29 — PASS

R2's entitlement distinction is unchanged: protected facts remain non-disclosing to an unauthorized
caller while an entitled member receives the truthful governed reason and change-state for their
own act.

### C2 · I-16 × I-18 — PASS

R2's warrant-shape distinction is unchanged: exact-object authorization cannot silently travel,
while a relationship/audience warrant may govern multiple objects only inside its declared scope.

R3 improves internal coherence here because the deleted sentence no longer falsely implies that
every such warrant has a single-use spend lifecycle.

### C3 · I-26 × Standing Constraint 1.2 — PASS

R2's governed de-linking distinction is unchanged. Source-dependent derivatives require sufficient
lineage; an explicit anonymization/de-linking disposition may deliberately destroy that link while
remaining truthful about the resulting non-traceability.

---

## 6 · CLOSING-SYNTHESIS CONSISTENCY TEST — PASS

This is the locus R2 omitted.

Adversarial checks:

```text
I-9  vs "standing accumulates"                 PASS — contradictory synthesis removed
B3   vs universal scarcity / spend             PASS — no universal spend claim remains
B4   consumable purpose-bound act              PASS — retained at its exact evidence size
D9-C relationship/audience warrant             PASS — no forced single-use semantics
R2 I-16 class/relationship/audience scope      PASS — no closing sentence narrows it falsely
```

The corrected object now permits the evidence to retain its actual plurality:

- standing is not asserted to be monotonic;
- standing and warrant remain independent axes;
- some authorization acts are consumable;
- some crossings are replay/idempotency controlled rather than warrant-controlled;
- at least one relationship/audience representation warrant is separable and revocable and can
  govern multiple objects inside its declared scope;
- no universal warrant lifecycle is constitutionalized beyond the evidence.

No new synthesis sentence is needed to make those laws coherent.

---

## 7 · DRIFT CHECK — PASS

Relative to the original base blob, the corrected base contains exactly one semantic edit: deletion
of the four-line final synthesis paragraph. There are no additions.

Relative to R2:

- overlay content: unchanged;
- ten replacement loci: unchanged;
- standing/classification correction: unchanged;
- I-19 / I-33 treatment: unchanged;
- three collision resolutions: unchanged;
- implementation boundary: unchanged.

R1 and R2 records themselves are not edited.

---

## 8 · RULING

```text
CUSTODY / SINGLE-WRITER BINDING     PASS
CORRECTED BASE OBJECT BINDING       PASS
PROVENANCE / ANTI-LAUNDERING        PASS
CLASSIFICATION / COUNT              PASS
21 UNCHANGED LOCAL LAWS              PASS
10 R2 SCOPE CORRECTIONS              PASS
I-19 GAP TREATMENT                   PASS
I-33 IMPORTED-LAW TREATMENT          PASS
I-7 × I-29                           PASS
I-16 × I-18                          PASS
I-26 × Standing Constraint 1.2      PASS
CLOSING-SYNTHESIS CONSISTENCY       PASS
DRIFT                               PASS

SPM-FC-01-R3                         PASS
R3                                   RATIFIABLE
RATIFICATION                         ⛔ NOT TAKEN HERE
IMPLEMENTATION                       CLOSED
SCHEMA / ROUTE / UI / MIGRATION      NOT AUTHORIZED
```

R2's `RATIFIABLE` judgment was incomplete because it did not include the surviving base closing
synthesis in its adjudication surface. R3 cures that defect by changing the governed object and
re-running constitutional coherence over the corrected base + unchanged R2 overlay.

R3 does **not** ratify the contract. Ratification remains a founder act.

---

## 9 · FINAL STANDING

```text
BASE 99d6f918 / blob e6e78a58       HISTORICAL — closing synthesis defective
FIRST ADJUDICATION 7d89daa6          CLOSED — RETURN FOR R2
R2 OVERLAY f40d4134                  HISTORICAL — corrections remain governing
R2 RE-ADJUDICATION 8bba2f76          HISTORICAL — PASS incomplete at closing synthesis
CORRECTED BASE blob a4dabcec         R3 candidate object component
R3 CONSTITUTIONAL COHERENCE          PASS
R3                                   RATIFIABLE
RATIFICATION                         ⛔ NOT TAKEN
IMPLEMENTATION                       CLOSED
```

**NEXT EXACT ACT: founder ratification, rejection, or return of R3.**

No consolidation and no implementation is authorized by this record.

**STOP.**
