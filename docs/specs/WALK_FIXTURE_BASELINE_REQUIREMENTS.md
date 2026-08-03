# Walk Fixture Baseline Requirements

**Purpose:** make executable, inside the repository, the baseline requirements that
`docs/specs/CORRECTION_3_FEATURE_WALK_PROTOCOL.md` (**FROZEN**, `30cb54868`) cites as
`[reference-walk-fixture-baseline-protocol]`.

⛔ **This document does not amend, supersede, or reinterpret the frozen protocol.** The protocol
governs. This supplies only what the protocol already requires, in a form an executor can reach
without depending on session memory.

> **The repository contains the thing required to execute. Memory retains why it exists.**
> The rationale, discovery history, and the incident this was learned from stay in the memory
> record and are deliberately **not** reproduced here.

---

## 1. Fixture

- **Create a NEW disposable member.** ⛔ Do not reuse a member from a previous walk.
- ⛔ **`walk.878` is contaminated and inadmissible** for acceptance walks. Its content state was
  restored; its credential baseline was not, and is unrecoverable. ⛔ Do not mutate it again
  attempting reconstruction, and ⛔ do not set `must_reset_password` on it — that creates a third
  state rather than restoring the second.

## 2. Baseline capture — **before any mutation**

The mutation is one `UPDATE`. The baseline is one `SELECT` that must **precede** it.

| Field | Note |
|---|---|
| member id | |
| username / email | |
| **password-hash presence + digest** | ⛔ **the digest, never the password** — this proves restoration without the record becoming a secret |
| reset flags | `must_reset_password`, and any other flag on `members` |
| counts | works · manuscripts · drafts · atoms · capsules · tables |
| database version | `SELECT version()` |

⭐ Capturing this is what makes cleanup **exact**: data created during the walk is deletable, and
data that was overwritten can be put back because its prior value is on record.

## 3. Evidence packet — provenance fields

An evidence packet is inadmissible without these. They answer *what environment and actor produced
this observation?*

```
walk target SHA          named BEFORE execution
executor                 named BEFORE execution
role overlap             declared, or explicitly "none"
member fixture identity  from §2
baseline snapshot        from §2
walk timestamp
observations             per criterion, in the protocol's own numbering
disposition              exactly one of the protocol's three
```

### Naming the target SHA

⛔ **The target SHA is named before execution, never determined afterwards from whatever was
checked out.** Where two commits both contain the implementation but differ on the member path,
**they are two different instruments** — the question is *which artifact is authorized to be
measured*, not which is easier to test. That choice is an authority decision, not the executor's.

### Declaring role overlap

The four roles — **builder · specification author · executor · acceptor** — may overlap. ⭐⭐⭐ **The
overlap does not invalidate a walk. A hidden overlap does.** When present, record it:

```
Executor:       <name>
Role overlap:   builder/evaluator overlap exists
Mitigation:     criteria pre-frozen · evidence packet immutable ·
                founder acceptance remains a separate act
```

## 4. Cleanup

Exact restoration against §2, recorded. Anything that cannot be restored is stated as such rather
than described as clean.

---

## What this document is not

- ⛔ Not an acceptance instrument. The frozen protocol holds the criteria and their admissibility
  rules; ⛔ do not restate them here, or the two will drift.
- ⛔ Not authorization to run a walk, name an executor, or select a SHA.
- ⛔ Not a Phase 1 release-walk artifact. Feature-level and release-level instruments are distinct.
