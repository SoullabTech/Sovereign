# SPM-01 — BOUNDARY SPECIFICATION — **v0.2**

**Date:** 2026-09-13 · **Programme:** `SPM-00` · **Authorized by:** founder ruling 2026-09-13
(conceptual refinement only).
**Supersedes:** `SPM-01_BOUNDARY_SPECIFICATION_2026-09-13.md` (v0.1), preserved unedited.
**Status:** ⛔ **SUPERSEDED BY v0.3** (`SPM-01_BOUNDARY_SPECIFICATION_v0.3_2026-09-13.md`) —
preserved unedited. **v0.3 adds a PRE-CLAIM FORMATION BOUNDARY**: canon rules on what may be
*formed*, and v0.2's object began at the claim. ⛔ v0.2's origin set, status set, rights matrix and
standing rules are **unchanged** by v0.3 and remain current here.

**Original status line:** ⛔ **SPECIFICATION ONLY — NOT STABLE.** No schema · no storage · no migration · no
implementation · no D9 governance ruling.

---

## 1 · ⚠️ What v0.1 got wrong

**v0.1's nine claim kinds were one flat taxonomy mixing two different dimensions.**

```text
ORIGIN-LIKE                       STATUS-LIKE
member stated                     member confirmed
member authored                   member disputed
recovered from member material    superseded
observed in interaction
system inferred
unknown provenance
```

**The failure is concrete and load-bearing:**

```text
system inferred  →  member confirmed     v0.1 loses that it began as an inference
member authored  →  later disputed       the dispute would erase its provenance
```

A flat taxonomy makes every status change **overwrite an origin**. ⛔ That is the same defect the
census found in `interpretiveLedger` — mutating the record rather than carrying the change forward —
reappearing at the conceptual layer before any storage exists to make it real.

## 2 · The decomposition

```text
CLAIM
 ├─ ORIGIN    where it came from        ⭐ IMMUTABLE
 ├─ BASIS     what supports it
 └─ STATUS    where it stands now       ⭐ MUTABLE
```

> ⭐ **A claim's origin never changes. Only its standing does.**

**ORIGIN** (one, fixed at creation):

| Origin | Meaning |
| --- | --- |
| **member stated** | The member said it. |
| **member authored** | The member wrote it, as a Work or document. |
| **recovered from member material** | Extracted from material the member supplied but did not assert about themselves. |
| **observed in interaction** | A behavioural regularity the system recorded. |
| **system inferred** | Derived; the member never said or wrote it. |
| **unknown provenance** | Present with no recoverable origin. ⛔ **A legitimate origin condition, not a placeholder.** |

**STATUS** (current; changes over the claim's life):

| Status | Meaning |
| --- | --- |
| **unreviewed** | Never put to the member. |
| **confirmed** | The member affirmed it. |
| **disputed** | The member rejected it. ⛔ The claim does not vanish. |
| **superseded** | A later claim carries current standing. |

⛔ **The status list is not asserted as complete.** v0.1's ellipsis is preserved as an open question
(§6), not filled in by guesswork.

**BASIS** — what supports the claim: an utterance, a document range, a prior claim, or a derivation.
⛔ **Still the field the census says does not exist for human-model claims.**

## 3 · ⭐ The decomposition resolves a census finding

Census **D5** recorded a divergence it could not adjudicate: `interpretiveLedger` mutates the parent
to `superseded`, while `TEMPORAL_MEMORY_DIRECTION` specifies succession carried by the *successor*,
with `superseded_by` **derived, never stored.**

Under two axes the disagreement becomes a **modelling question with a nameable shape:**

> **Is `superseded` a status held on the predecessor, or a fact derived from the successor's lineage?**

⛔ **SPM does not adjudicate it here** — D5 is routed to memory architecture. But it is no longer two
implementations disagreeing; it is one unanswered question about the object, which is the form in
which the memory programme can actually settle it.

## 4 · Rights and standing

**Legend** — ● determined (basis cited) · ○ proposed, needs a ruling · **?** open.

**Member rights — six, unchanged from v0.1**, now read against `ORIGIN` (what can be traced) and
`STATUS` (what can be changed):

| Right | Governed by | v0.2 |
| --- | --- | --- |
| **see** | both | ● for every origin and status — *derived stays visibly derived* makes this determined even for `system inferred`. |
| **trace source** | ORIGIN | ● member-originated · ○ `recovered` · **?** `observed in interaction` (§6.3) · ○ `system inferred` → to its BASIS · — `unknown provenance` (by definition). |
| **correct** | STATUS | ● where the member originated it; ● `system inferred` (*MAIA impression asks*). |
| **supersede** | STATUS | ● the general mechanism; the predecessor is not erased. |
| **export** | both | ○ — and §6.4 must be answered first: the assertion alone, or with BASIS and history? |
| **erase** | both | ● member-originated; **?** `superseded`, **?** whether erasing an inference requires erasing its BASIS (§6.1). |

### 4.1 · ⭐ The SPM-owned standing question

> **MAY THIS CLAIM CURRENTLY FUNCTION AS MODEL BELIEF?**

**This is SPM's**, because it is about what the claim *means inside the model* — not about who may use
it.

| | May function as current model belief |
| --- | --- |
| **unreviewed** | ○ yes — and, where ORIGIN is `system inferred`, **only as visibly derived** (● *derived stays visibly derived*). |
| **confirmed** | ● yes. |
| **disputed** | ● **NO.** May remain visible, in history, and exportable — ⛔ **must not silently function as current settled belief.** |
| **superseded** | ● **NO.** Retained as provenance and history; **the successor carries current standing.** |
| **ORIGIN `unknown provenance`** | ○ may remain represented **as unknown-origin material**; ⛔ **cannot silently acquire stronger epistemic standing.** |

⭐ **Structural result:** standing is determined almost entirely by **STATUS**, with exactly one
**ORIGIN**-level constraint — the one on `unknown provenance`. ⛔ That constraint is the reason
`unknown provenance` had to be an origin rather than a status: a status could be resolved away, and
then unknown-origin material would quietly become ordinary belief.

### 4.2 · ⛔ Left to governance

> **WHO OR WHAT IS AUTHORIZED TO USE THIS CLAIM, AND FOR WHAT PURPOSE?**

⛔ **Not answered here, for any origin or status.** Nothing in §4.1 says whether MAIA, JARVIS,
Practitioner Studio or anyone else may use a claim — only what the claim *means*. The two questions
sit side by side and are answered by different authorities:

```text
SPM          may this be treated as current model belief?
GOVERNANCE   who may consume it, for what purpose, and when may it
             affect representation or action?
```

## 5 · The governing separation, restated

```text
SPM OWNS                          GOVERNANCE OWNS
what the claim is                 who may use it
where it came from                for what purpose
what supports it                  when it may affect representation or action
what status it has
whether it is current / disputed / superseded
what the member can see, trace,
  correct, export, erase
```

*SPM can make the personal model intelligible and sovereign without deciding what MAIA is allowed to
do with it.*

## 6 · Open questions — carried from v0.1, plus one

1. Does erasing an inference require erasing its **BASIS**? ⛔ *Erasure that reconstitutes is not
   erasure.*
2. Can a member erase a `superseded` claim? Tombstone tension.
3. Is `observed in interaction` traceable at all — and if not, can it honestly be corrected?
4. What does **export** mean for a claim: the assertion, its BASIS, its status history, or all three?
   ⛔ *Exporting claims without their provenance would export the model's conclusions while
   withholding its reasoning.*
5. Does `disputed` **suppress** or **annotate**? §4.1 settles its *standing*; it does not settle
   whether the member still sees it everywhere they saw it before.
6. ⭐ **NEW — is the STATUS list complete?** A `stale` status is the obvious candidate and is
   immediately contentious: the Temporal Memory direction holds that the system **never** sets a
   validity bound from a timer — staleness is *detect → ask → record*. ⛔ A system-set status would
   contradict that, so `stale` is **not added**; the question is recorded.

## 7 · Prohibitions

```text
⛔ no schema · no storage design · no migration · no implementation
⛔ no new canon · no MAIA behaviour rules
⛔ no answer to the governance consume question
⛔ no representation / impersonation / speaking-for / acting-for rules — D9
```

## 8 · ⚠️ One procedural question for the founder

This lane's practice is **preserve, never erase** — built for frozen instruments and dated witnesses.
Applied to a *living specification under iteration* it produces a new file per revision. v0.1 is
preserved and v0.2 is a separate document; at v0.5 that is five files for one object.

⛔ **Not decided here.** The question: **does a working specification supersede in place with a
version history, or keep one file per revision?** *A withdrawal that matters — like v0.1's flat
taxonomy — should stay visible either way.*
