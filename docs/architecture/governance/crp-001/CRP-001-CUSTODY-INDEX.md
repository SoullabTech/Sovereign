# CRP-001 — CUSTODY INDEX

**Created:** 2026-08-12 under the Step 3 canonical custody ruling.
**Canonical base:** `origin/clean-main-no-secrets` @
`969841012d7e1353ff73e570f00f53c0f7792a2b`

> **This index is navigation, not authority.** Where it and a governing
> artifact disagree, the artifact governs. Nothing here creates, modifies, or
> summarizes a ruling.

---

## 1. Artifacts

| Artifact | Role | Status | Version | Frozen? |
| --- | --- | --- | --- | --- |
| `JARVIS-CRP-001-CONTINUITY-RECOVERY-PROGRAM-MANDATE.md` | Program mandate §§1–20 + design appendix | AUTHORED / **NOT AUTHORIZED** | §20.1 amendment 2026-08-12 | mutable (amend by logged §) |
| `CRP-001-UNIT-RETURN-SCHEMA-v1.md` | Binding unit-return schema | **FROZEN** candidate house schema | v1 | **FROZEN** — no in-place edit |
| `CRP-001-SCHEMA-FREEZE-RECORD.md` | Freeze evidence + §2.6 ruling annotation | current | — | mutable (append-only log) |
| `CRP-001-STEP2-RULINGS.md` | **Authority** — C1–C4 as ruled | **CLOSED** 2026-08-12 | — | mutable only by superseding ruling |
| `CRP-001-C3-BINDING-RECORD.md` | Evidence — MIR-001-A v2 binding + permanent non-claim | current | — | mutable (append-only log) |
| `CRP-001-PROCESS-CLOSURE-SEQUENCE.md` | Six-step closure plan + state | steps 1–3 done, 4–6 open | — | mutable (state tracker) |
| `CRP-001-FOUNDER-RULING-SHEET.md` | Questions as posed; Step 2 answered elsewhere | superseded for C1–C4 | — | mutable |
| `CRP-001-GOVERNANCE-COLLISION-REGISTER.md` | **FOUNDER-FACING** — see §4 | current | — | mutable |
| `CRP-001-CUSTODY-INDEX.md` | This file | current | — | mutable |

Referenced, not held here:

| Artifact | Path | Relationship |
| --- | --- | --- |
| MIR-001-A v2 health map | `docs/architecture/audits/MIR-001_MAIA_HEALTH_MAP_2026-08-12.md` | Diagnostic evidence CRP-001 §1 depends on. **Referenced, not absorbed** — it is an audit artifact and stays in its semantic location. |
| MRC-001 mandate | off-canon, `/Users/soullab/JARVIS-MRC-001-…` | Separate program (C1 = D2). HELD / INCOMPLETE. |
| MDR-001 mandate + R1–R5 | off-canon + `artifacts/` | Untouched by C2. |

## 2. Governing relationships

```text
STEP2-RULINGS ──authority over──> everything in this directory
      │
      ├── C1=D2 ──> CRP owns HOW; MRC-001 owns WHAT. Neither substitutes.
      ├── C2=N/A ──> MDR-001 R3 unchanged.
      ├── C3=F1  ──> C3-BINDING-RECORD (prospective; non-claim permanent)
      └── C4=G2  ──> scopes the witness, i.e. the first product unit

MANDATE §20 ──binds──> SCHEMA-v1 (frozen)
                            │
SCHEMA-FREEZE-RECORD ──status-of──┘   ⚠ see §3
```

## 3. Split normative status — read both

`CRP-001-UNIT-RETURN-SCHEMA-v1.md` is frozen at
`fac499a66964a30b023caea3e91eb985254ffd83b46ec0f788a3d4d56d9e3aee`.

Its §2.6 numeric evidence-window minima are **PROVISIONAL, not ratified** —
principle accepted, numbers not. That status lives in
`CRP-001-SCHEMA-FREEZE-RECORD.md` §5.1, *not* in the schema, because
annotating a frozen object in place is the edit the freeze forbids.

**Consequence: reading the schema alone will read provisional thresholds as
ratified.** Read the freeze record with it. This split closes when the founder
rules the minima and v2 folds the ruling inline.

## 4. Founder-facing artifact — executor exclusion

`CRP-001-GOVERNANCE-COLLISION-REGISTER.md` is **founder-facing**. The mandate
(§0) instructs executors not to read it, per the MDR-001 convention.

It is committed here so the record is complete and the rulings' provenance is
recoverable. **Custody in the repository is not placement in an executor's
context** — but a cold executor with repository access can reach it, which the
off-canon location previously made unlikely by accident rather than by rule.

**Recorded as OQ-1 in `CRP-001-OPEN-QUESTIONS.md`.** Not decided here, and
deliberately not solved opportunistically inside this PR — it is an
access/context-governance problem, not a custody problem.

## 5. What this commit does and does not establish

**Establishes:** these exact bytes are durably preserved on a **remote
branch** from this commit onward, with a ref, commit SHA and blob identity —
so a later reader on another machine can verify them.

**Does not yet establish canonical custody.** Until PR #1039 merges into
`clean-main-no-secrets`, these objects are **preserved and proposed, not
canonical**:

```text
STEP 3 EXECUTION              COMPLETE
remote durable custody        PROVEN
byte preservation             PROVEN
governance path               PROPOSED via PR #1039
canonical-trunk custody       PENDING MERGE
STEP 4                        BLOCKED until #1039 merges
```

Calling them canonical before the merge would reproduce the
preserved ≠ published ≠ canonical inflation this program exists to prevent.

**Does not establish:**

- a hash for MIR-001-A **v1**;
- that MIR-001-A v1 was ever historically committed;
- an unbroken original seal on the health map;
- provenance that was previously unavailable.

**The C3 non-claim is permanent.** The MIR v2 hash binds forward from
2026-08-12; it does not prove the file is what the cold run produced. Gaining
Git custody now does not retroactively create the missing history, and no
later document may cite this commit as if it did.

## 6. Program state at this commit

```text
STEP 1  schema freeze                   DONE
STEP 2  C1–C4                           CLOSED
STEP 3  custody execution               COMPLETE
        canonicalization                PENDING MERGE (#1039)
STEP 4  chain registry                  BLOCKED on merge
STEP 5  validator / enforcement         OPEN
STEP 6  adversarial conformance suite   OPEN
        first MAIA repair unit          BLOCKED

MAIA product code                       UNTOUCHED
CRP-001 authorization                   NONE
```

Step 4's open questions are recorded in `CRP-001-FOUNDER-RULING-SHEET.md`
(chain registry §) and are **not** designed here.
