# Founder Ruling — `check:phi-inventory` Pre-Commit Gate Semantics

**Date:** 2026-08-16
**Ruler:** Kelly (founder)
**Instrument type:** Founder ruling — governed record
**Relation:** extends the *principle* of
[`FOUNDER_RULING_NO_INLINE_NAMES_GATE_2026-08-16.md`](./FOUNDER_RULING_NO_INLINE_NAMES_GATE_2026-08-16.md) §5.
⛔ It does **not** inherit that ruling's mechanism.

> This document records a ruling. It does not interpret it.

---

## §1 What generalizes, and what does not

> **The no-regression principle generalizes; the line-delta implementation does not.**

`check:phi-inventory` governs a **whole-repository consistency relation** between the authoritative
PHI inventory and the schema it describes. Its unit of governance is not a line of code, so its
ratchet must compare whole-state discrepancies:

```text
CONSISTENCY(HEAD)
        ↓
CONSISTENCY(PROPOSED COMMIT)
```

---

## §2 The ruling

```text
FOUNDER RULING — PHI INVENTORY PRE-COMMIT GATE

SECURITY JURISDICTION          PRESERVED

PRE-COMMIT PURPOSE             PREVENT NEW PHI-INVENTORY DEBT
SEMANTICS                      WHOLE-STATE NO-REGRESSION

NEW DISCREPANCY                FAIL
UNCHANGED DISCREPANCY          PASS PRE-COMMIT; REMAINS DEBT
REMOVED DISCREPANCY            PASS
ALL DISCREPANCIES REMOVED      PASS / CLEAN

COMPARISON UNIT                STABLE DISCREPANCY IDENTITY
                               NOT SIMPLE ERROR COUNT
                               NOT BOOLEAN PASS/FAIL ALONE

ONE OLD REMOVED +
ONE NEW INTRODUCED             FAIL
                               new debt may not hide behind
                               unchanged aggregate count

HISTORICAL PHI DEBT            REMAINS EXPLICIT / UNRESOLVED
FULL-REPO AUDIT                RETAIN
SECURITY MEANING               NOT WEAKENED

INLINE-NAME DELTA MECHANISM    NOT INHERITED
PHI MECHANISM                  INDEPENDENT IMPLEMENTATION

AUTOMATIC MOVE TO CI           NOT AUTHORIZED
SECURITY-GATE RELOCATION       SEPARATE GOVERNANCE DECISION

IF SAFE COMPARISON CANNOT
BE ESTABLISHED                 STOP / ESCALATE
                               DO NOT WEAKEN THE GATE

CURRENT PHI REMEDIATION        SEPARATE WORK UNIT
LIVING SPIRAL                  UNAFFECTED
```

### 2.1 "Less consistent" means set difference, never count difference

```text
HEAD      = { A, B, C }        HEAD      = { A, B, C }
PROPOSED  = { A, B, C, D }     PROPOSED  = { A, B }

new       = { D }   → FAIL     new       = {}    → PASS
resolved  = {}                 resolved  = { C }
carried   = { A,B,C }          carried   = { A,B }
```

A commit that resolves `members.date_of_birth` while introducing
`sessions.client_diagnosis` leaves the **count** unchanged at 1 and **must still FAIL**.

Stable identities come from the semantic object that is inconsistent — table / column / file —
never from line numbers or output ordering.

### 2.2 The rejected fallback

⛔ The recommendation *"if no clean delta can be computed, move it to CI"* was **NOT authorized.**
That silently changes *when* a security invariant is enforced. Relocating a sovereignty/security
gate is a governance decision, not an implementation fallback. If a trustworthy comparison cannot
be established the correct result is:

> **BLOCKED — safe no-regression mechanism not yet established.**

Then either repair the historical PHI debt until the full-repo gate is green, or design a
trustworthy comparator under separate bounded work.

---

## §3 The generalized doctrine

> **A change gate prevents the proposed change from increasing governed debt.
> A repository audit establishes whether governed debt exists at all.
> A repository freeze requires explicit authority.**

Three different powers, kept separate. **A red repository-wide checker does not by itself grant
every historical violation the authority to annex every future work unit.** Security relevance does
not disappear: PHI debt remains visible, auditable, and separately remediable; the system simply
stops falsely attributing old debt to an unrelated proposed commit.

---

## §4 Feasibility determination (established 2026-08-16)

A trustworthy `HEAD → proposed` comparison **is** establishable for this checker:

- **Every input is a tracked file.** `docs/security/phi-columns.md`; the accessor sources; and the
  `ACCESSOR_SPECS` / `REQUIRED_ENCRYPTED_TABLES` constants, which live **inside the checker
  itself**. No database, no generated state, no environment dependence.
- **Discrepancies already carry stable semantic identity** — e.g.
  `No accessor configured for encrypted table 'practitioner_client_notes'` — keyed to the object,
  not to line numbers or ordering.
- **Each tree must be measured with its own copy of the checker**, since `ACCESSOR_SPECS` is an
  input that a commit may change. A commit is judged by the version it actually ships.

⚠️ Current live discrepancy set (HEAD, 2026-08-16), carried forward as **unresolved PHI debt**:

```text
{ "No accessor configured for encrypted table 'practitioner_client_notes'" }
```

Remediating it is a **separate work unit** and is not authorized here.

---

## §4b Canonical custody — and a duplicate claimant

**Founder ruling 2026-08-16.** This file is the **canonical** record of the PHI inventory gate
ruling, by virtue of committed custody (`4a9b3915d`).

A second document exists in the working tree recording the same ruling:

```text
DUPLICATE RULING RECORD
path              docs/governance/FOUNDER_RULING_PHI_INVENTORY_PRE_COMMIT_GATE_2026-08-16.md
content overlap   established (same disposition keys)
canonical custody absent (untracked)
owner             concurrent lane / unresolved
disposition       DO NOT CITE AS CANONICAL
```

> The reason is **structural, not chronological or qualitative**: canonical custody outranks later
> prose, file size, and apparent completeness. **A second untracked document cannot silently create
> a second home for an already-custodied ruling.**

⛔ Not to be deleted, merged, renamed, or adopted by any lane other than its owner. If it carries
materially unique reasoning, that may later be reconciled **into this record under explicit
custody**. ⛔ Its existence does **not** reopen the ruling.

---

## §5 Implementation record

- `scripts/check-phi-columns-inventory.ts` — adds `--emit-discrepancies`, a **reporting** mode
  that prints the discrepancy set as JSON and exits 0. It decides nothing. The default full-repo
  audit path is unchanged and still fails on existing debt.
- `scripts/check-phi-inventory-ratchet.sh` — the comparator. Materializes HEAD and the **staged
  tree** (via `write-tree` / `commit-tree`, so unstaged edits cannot leak in), measures each with
  its own checker, and compares as sets.

### 5.1 ⚠️ Fail-open defect found during verification — recorded, not hidden

The comparator's first implementation called its `blocked()` helper from inside a **pipeline**.
`exit` there terminates only the subshell, so when both trees failed to emit a parsable set the
script continued with two **empty** sets, computed `new = {}`, and reported **PASS**.

That is a fail-**open** security defect, and it was produced by the instrument built to enforce a
fail-closed ruling. It was caught because the bootstrap case — a `HEAD` whose checker predates
`--emit-discrepancies` — was exercised rather than assumed. Fixed by removing the pipeline and
checking status explicitly; `R0` now BLOCKS on exactly that condition.

⭐ Standing lesson: **a comparator that cannot measure a tree must block, never treat
"unmeasurable" as "clean."** An empty result set and an unknown result set are not the same value.

### 5.2 ⛔ The comparator is NOT adopted — standing as ruled 2026-08-16

```text
PHI comparator
class: PROVISIONAL
direct-policy proof: PASS for tested discrepancy class
real commit-path proof: FAIL
gate wiring: ABSENT / restored to HEAD
runtime authority: NONE
custody: AWAITING_LANE_CUSTODY
```

The comparator subsequently **failed under a real `git commit`** — `git` exports `GIT_DIR` /
`GIT_WORK_TREE` into hooks and `git worktree add` inherits them. It failed **closed**; no commit
was created. `.githooks/pre-commit` was restored to `HEAD` and the ratchet is **unwired**.

⚠️ Therefore **§5's implementation description states what was built, not what governs.** The
ruling in §2 is canonical and live; the mechanism in §5 has **no runtime authority**.

Preserved evidence, hashes, the verbatim failure witness, and the preserve-before-repair
inheritance: [`docs/ops/PHI_INVENTORY_COMPARATOR_PRESERVATION_WITNESS_2026-08-16.md`](../ops/PHI_INVENTORY_COMPARATOR_PRESERVATION_WITNESS_2026-08-16.md).

⭐ Acceptance for any successor **must include the actual `git commit` invocation path**:
`DIRECT POLICY TEST PASSED ≠ PRE-COMMIT INTEGRATION PASSED`.
