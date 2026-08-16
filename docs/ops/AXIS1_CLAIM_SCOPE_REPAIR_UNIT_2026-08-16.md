# Axis-1 follow-up unit — repair claim-scope semantics

**Founder ruling · 2026-08-16 · handed to the epistemic-guard / Axis-1 owning lane**
**Status:** `PROPOSED` — bounded follow-up. Not opened by this document.
**Raised from:** the #1056 lane, which hit the block and does **not** own the mechanism.

---

## Trunk state

**All ordinary admissions to `clean-main-no-secrets` are currently blocked.** Any PR that does not
append a ledger row for `JARVIS-ADMISSION-001` fails `Axis 1 — authoritative adjudication`. First
observed on PR #1056, which touches **zero** `.ain/` paths.

```
base 0863838cb · canonical rows 2 · claims 1 · appended 0
  ✓ JARVIS-ADMISSION-001 → PERMITTED
⛔ BLOCKED — [LEDGER-DELTA-MISMATCH] adjudicated but no corresponding appended ledger row
```

## The defect

`scripts/builder/epistemic-ci.mjs` reads **canonical prior history from `BASE`** (correctly — see its
own comment, *"read from the BASE, never from the PR"*) but enumerates **submissions from `HEAD`**
via `readdirSync(CLAIMS_DIR)`. Every JSON file visible at HEAD is treated as submitted by the current
PR.

Once #1054 merged, `001-guard-proof-at-admission.json` became canonical. From that moment every later
PR re-adjudicates a **prior canonical claim** and is asked for a fresh transition it has no business
producing. The asymmetry is the whole bug: prior history is base-relative, submissions are not.

⚠️ Its own CI could not have caught this. #1054 was judged against `a059264ea`, where `.ain/claims/`
held zero files — `claims=0`, no delta, green. The condition is only reachable **after** merge.

## ⛔ Explicitly not the repair

- **Do not append another `JARVIS-ADMISSION-001` transition.** Canonical row 1 already carries
  `claim_id=JARVIS-ADMISSION-001, verdict=PERMITTED`. A second row would corrupt append-only history
  to silence a scoping bug.
- Do not edit #1056's ledger to make its own gate green.
- Do not bypass Axis 1. Do not weaken branch protection.

> **Correction to the raising lane's first diagnosis.** It reported the claim file as having
> `claim_id: None, title: None` and inferred the schema was malformed. Wrong: the claim identifies
> itself with `"id": "JARVIS-ADMISSION-001"` — `claim_id` is the **ledger's** field name, not the
> claim file's. Reading one artifact's field names against another is the eighth instance in this
> programme of an observation promoted past the population it actually inspected. Recorded for the
> Negative Evidence Admissibility successor.

## Repair

1. Derive the current submission set **relative to canonical BASE** (`git diff --name-status BASE..HEAD -- .ain/claims/`).
2. Distinguish prior canonical claims from newly submitted ones.
3. Preserve append-only canonical history.
4. Fail closed on malformed, mutated, or deleted prior claims.

## Executable acceptance

| Scenario | Required outcome |
|---|---|
| canonical old claim + no new claim | `CLAIM-MISSING` |
| canonical old claim alone | does **not** require another transition |
| one genuinely new claim + matching derived transition | **PASS** |
| duplicate row for an old canonical claim | **BLOCK** |
| mutation / deletion of an existing canonical claim | **BLOCK**, or an explicitly governed disposition |
| restore *"all HEAD claims are submissions"* | **sabotage test RED** |

## Sequence

```
Axis-1 repair PR  →  repaired Axis-1 judges its own new head  →  merge to canonical
   →  #1056 updates from canonical again
   →  #1056 supplies its OWN Axis-1 claim + proposed adjudicated row
   →  fresh Axis-1 judgment  →  green  →  merge  →  fresh 39 + 188  →  JOP-01 closure
```

## Precision on what worked and what did not

⛔ **Do not summarize this as "the gate worked correctly."** That shorthand hides the distinction
that matters.

```
INTERLOCK / FAIL-CLOSED BEHAVIOR     WORKED
AXIS-1 CLAIM-SCOPE SEMANTICS         DEFECTIVE
#1056                                CORRECTLY WITHHELD
#1056 ITSELF                         NOT SHOWN DEFECTIVE BY AXIS-1
```

Branch protection correctly refused an unproven admission. But the **reason** for the refusal was
produced by a bug in Axis-1's submission aperture, not by anything wrong with #1056. Both statements
are true simultaneously, and collapsing them would misattribute a mechanism defect to the change it
happened to block.

## Recommended design for the open question — NOT YET ADOPTED SEMANTICS

The repair lane must decide whether a presentation-only PR is expected to author an Axis-1 claim.
⛔ This must not be settled accidentally by whatever #1056 happens to do. Founder recommendation:

> **Every PR must receive an Axis-1 disposition; not every PR must manufacture an Axis-1 claim.**

This avoids two bad extremes: *"no claim means pass"*, which is a bypass; and *"every cosmetic PR
must invent a claim"*, which is meaningless epistemic paperwork and ledger inflation.

```
PR has new epistemic claim(s)
  → submit claim records
  → independently adjudicate
  → append matching transition rows

PR has no new epistemic claim
  → CI independently ESTABLISHES that fact under a governed rule
  → explicit NO_NEW_CLAIMS / OUT_OF_AXIS1_SCOPE disposition
  → no fabricated transition row
```

⭐ **Silence must never mean claim-free.** Claim-free has to be an explicit, machine-derived
disposition — never the mere absence of a file. An absent claim and a proven-absent claim are
different facts, and only the second may pass. *(This is the same discipline the Negative Evidence
Admissibility successor exists to generalize: an absence must be established, not inferred.)*

**Status: recommended design, not adopted.** It stands until the Axis-1 owning lane resolves it and
proves the negative controls.
