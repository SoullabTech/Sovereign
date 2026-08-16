# Founder Ruling — `check:no-inline-names` Pre-Commit Gate Semantics

**Date:** 2026-08-16
**Ruler:** Kelly (founder)
**Instrument type:** Founder ruling — governed record
**Occasion:** commit `0f3362c5d` was blocked by six pre-existing `HEAD` violations while
introducing none, and was committed with a disclosed, reasoned gate exception.

> This document records a ruling. It does not interpret it. Where the summary block and the ruling
> text differ, **the ruling text governs.**

---

## §1 The distinction the ruling rests on

Two different questions were being asked by one instrument:

| Instrument | Question it answers |
|---|---|
| **pre-commit gate** | *Did **this change** violate the invariant?* |
| **repository audit** | *Does **the repository** contain violations?* |

Conflating them made every unrelated commit responsible for pre-existing repository debt.

> **A pre-commit sovereignty gate should govern the proposed change, not retroactively make every
> unrelated commit responsible for pre-existing repository debt.**

---

## §2 The ruling

`check:no-inline-names` at pre-commit becomes **delta-aware / no-regression**:

- a commit **fails** if it introduces a new prohibited inline-name condition;
- a commit **passes** this gate if it introduces none, **even when already-recorded violations
  remain elsewhere in `HEAD`**;
- **removing** existing violations is always permitted;
- pre-existing violations **remain visible as repository debt** and do **not** become "accepted"
  merely because the commit gate allows unrelated work;
- the complete repository-wide checker **remains available** as an audit / remediation instrument;
- whether a repository-wide **CI** gate blocks on historical debt is a **separate policy decision**
  unless already governed elsewhere. ⛔ Not decided here.

### 2.1 Why delta-aware, not "scan staged files"

Staged-whole-file scoping is directionally right and still wrong at the margin. Editing one comment
in a file that already contains an unrelated old `preferred_name || name` would force repair of that
old defect merely because the file was touched — **reproducing the same unwanted scope absorption
one level lower.**

> The semantic target is **new violation introduced by this change**, not "violation exists
> somewhere in a staged path." Implementation details may be chosen mechanically; that is the
> contract.

---

## §3 Disposition block (verbatim)

```text
FOUNDER RULING — NO-INLINE-NAMES PRE-COMMIT GATE

CURRENT FULL-REPO FAILURE      ACKNOWLEDGED
0f3362c5d EXCEPTION            ACCEPTED
SILENT BYPASS                  PROHIBITED
DISCLOSED REASONED EXCEPTION   PERMISSIBLE WHEN BOUNDED

PRE-COMMIT PURPOSE             GOVERN THE PROPOSED CHANGE
PRE-COMMIT SEMANTICS           NO-REGRESSION / DELTA-AWARE
NEW VIOLATION                  FAIL
NO NEW VIOLATION               PASS
HISTORICAL DEBT                REMAINS DEBT
FULL-REPO CHECK                RETAIN AS AUDIT INSTRUMENT

STAGED-WHOLE-FILE SCOPING      NOT REQUIRED
DELTA-AWARE SCOPING            PREFERRED

SIX EXISTING SITES             SEPARATE REMEDIATION UNIT
HOOK BEHAVIOR CHANGE           SEPARATE GOVERNED UNIT

LIVING SPIRAL PHASE 1          UNAFFECTED
```

### 3.1 Custody of `0f3362c5d`

Accepted with a reasoned exception. ⛔ It must **not** later be summarized as *"all gates passed."*
The recorded truth:

```text
COMMIT                 0f3362c5d
SCOPE                  1 governance document
CHECK:NO-SUPABASE      PASS
CHECK:NO-INLINE-NAMES  FAIL
FAILURE CAUSE          6 pre-existing HEAD violations
COMMIT INTRODUCED      0 of those violations
EXCEPTION              EXPLICIT / REASONED / CUSTODIED
ADJACENT REMEDIATION   NOT ABSORBED
```

---

## §4 Separate custody

The two repairs answer different questions and are **not** one unit:

| Unit | Repairs | Status |
|---|---|---|
| **Six existing sites** | repository **state** | `DISCOVERED → BOUNDED REMEDIATION AVAILABLE` |
| **Hook behavior change** | enforcement **semantics** | ruled here |

⛔ Do not bundle them unless a work-unit authority explicitly makes both parts of one governed
repair.

---

## §5 The general principle

> **Gates should prevent new epistemic or architectural debt without turning unrelated historical
> debt into compulsory scope expansion.**

Founder-stated as **broader than this one hook**. ⚠️ It is recorded here as a principle; it is
**not** self-executing. Extending it to any other gate — notably `check:phi-inventory`, which is
security-relevant and structurally an *inventory consistency* check rather than a per-line pattern
scan — is a **separate ruling**, not an inference from this one.

---

## §6 Implementation record

- `scripts/check-no-inline-names.ts` — two modes. Default = full-repo **audit** (unchanged
  behavior, still fails on the six). `GIT_PRE_COMMIT=1` = **ratchet**: multiset difference of
  violations between the staged blob and the same file in `HEAD`, keyed line-number-independently,
  rename-aware via `-M` (a rename's baseline is its old path).
- `.githooks/pre-commit` — invokes the check with `GIT_PRE_COMMIT=1`.

⚠️ **Referent note.** `.githooks/pre-commit` **is** the policy that executes. The chain is
`.git/hooks/pre-commit` (beads wrapper) → `pre-commit.old` (mechanism-only governance dispatcher)
→ `$top/.githooks/<hook>`. The header comment in `.githooks/pre-commit` claiming it is *"NOT the
hook that runs"* is **stale** — it describes the pre-2026-08-11 copying model that the dispatcher
replaced. Not corrected here (separate unit); recorded so it misleads no one else.

### 6.1 Verification performed

| Test | Expected | Result |
|---|---|---|
| Full-repo audit | still FAILS on 6 pre-existing | ✅ exit 1 |
| Ratchet, nothing staged | PASS | ✅ exit 0 |
| Ratchet, docs-only staged | PASS | ✅ exit 0 |
| New violation staged | FAIL | ✅ exit 1 |
| Touch file with existing violation, add none | PASS | ✅ "1 carried forward — still debt" |
| Remove an existing violation | PASS | ✅ "1 removed" |
| Rename file carrying a violation | PASS (not read as new) | ✅ carried forward |
| End-to-end `git commit` with new violation | BLOCKED | ✅ exit 1, no commit created |

⚠️ **What this does NOT establish.** A docs-only commit is **still blocked** — the policy now
passes the names gate and fails at `check:phi-inventory`, a second gate red on pre-existing debt.
The unblocking claim is therefore narrow: **`check:no-inline-names` no longer blocks unrelated
work.** It is not a claim that the pre-commit lane is clear. See §5 — that extension is unruled.
