# Focus assembler gate — enforcement reconciliation

```text
LANE        5A follow-up · ENFORCEMENT RECONCILIATION ONLY
SUBJECT     scripts/witness/focus-assembler-contract.ts   THE INSTRUMENT
BASE        4abc86d3d4f2e4a2e7b9cb6e23406fcafb197fa8      the candidate line
DATABASE    disposable PostgreSQL 16.13, built by the gate itself from
            repository truth (`db:bootstrap` + `db:migrate`)
RESULT      REAL 14/14 PASS · BROKEN 11 failures · exit 0
```

⛔ **THE INSTRUMENT WAS REPAIRED, NOT THE ARCHITECTURE.** No compatibility shim was
added to `assembleFocus`. The candidate's capability-bound interface is unchanged.

---

## What 5A found, and what this closes

The gate was byte-identical to its `2de1b421` original while the code it gates
moved to `{ authority, memberId, workRef, locus }`. `tsx` transpiles without
typechecking, so it **ran**, `locus` was `undefined`, and it died on
`locus.scopeKind` — failing closed, and **incapable of passing**. The ratified law
therefore had no functioning instrument:

> *A database-dependent disclosure boundary cannot be licensed solely by a mocked
> database.*

---

## The run, verbatim

```text
── schema from repository truth
── real assembler SQL against that schema
schema input   : 530 ledger entries · draft-section genesis: 20260830000001_manuscript_draft_sections.sql
PASS  REAL      E1
PASS  REAL      E6.a
PASS  REAL      E6.b
PASS  REAL      O1
PASS  REAL      O2
PASS  REAL      O3
PASS  REAL      E1.section
PASS  REAL      E6.c
PASS  REAL      E2
PASS  REAL      E3
PASS  REAL      E4
PASS  REAL      E5.work
PASS  REAL      E5.locus
PASS  REAL      E1.passage
FAIL  BROKEN    E1 — got "SOURCE ONE: the keeper counted ships he could not save.\n\nSOU"
FAIL  BROKEN    E6.a — manuscript_sections became the payload
FAIL  BROKEN    E6.b — draft order not preserved
FAIL  BROKEN    O1 — whole Work !== the canonical flattening
FAIL  BROKEN    O2 — whole Work !== working-draft content
FAIL  BROKEN    O3 — a character was manufactured at a section boundary
FAIL  BROKEN    E1.section — got "SOURCE ONE: the keeper counted ships he could not save.\n\nSOURCE TWO: the lamp failed in November."
FAIL  BROKEN    E6.c — a SOURCE section id was accepted as a locator
FAIL  BROKEN    E2 — another member's Work was disclosed
FAIL  BROKEN    E3 — an un-addressable draft was disclosed
PASS  BROKEN    E4
PASS  BROKEN    E5.work
PASS  BROKEN    E5.locus
FAIL  BROKEN    E1.passage — got "SOURCE ONE: the keeper counted ships he could not save.\n\nSOURCE TWO: the lamp failed in November."
REAL   : all obligations PASS
BROKEN : 11 failure(s) — the instrument discriminates
✅ gate PASSED
✅ focus assembler contract gate PASSED
```

---

## ⭐ Authority is minted by the real boundary

`mintDisclosureAuthority` has exactly one lawful non-test caller. The witness
does not call it. It goes through `establishDisclosureBoundary` — consent
precondition, receipt mint, capability — so the gate witnesses **the real path**
rather than a hand-made token. That is why `runtime_consent_state` and
`context_disclosure_receipts` are now part of `requireSchema()`: they are subject,
not scaffolding.

---

## ⭐⭐ The broken variant had to be strengthened before it was evidence

The first `brokenCustody` bypassed `discloseUnder` entirely. It went red — on
`readDisclosed` refusing unsealed content. **That proves the seal works and says
nothing about whether the custody obligations can catch a custody defect.**

It now goes through `discloseUnder` correctly and reads the SOURCE ingest
relation as payload, with no member predicate and no addressability gate — the
exact defect `2de1b421` repaired. It fails **eleven** obligations by substance,
including the four that name the defect:

```text
E6.a  manuscript_sections became the payload
E6.c  a SOURCE section id was accepted as a locator
E2    another member's Work was disclosed
E3    an un-addressable draft was disclosed
```

⭐ **And E4 / E5 PASS for the broken variant — correctly.** `discloseUnder` bounds
*whether* a load runs, not *what* it reads. A forged capability is still refused
and a mismatched locus still refuses, even while the loader inside the capability
is wrong. **The capability layer and the custody SQL are separate guarantees, and
this run shows each holding independently.** An instrument that reported the
broken variant as failing everything would have hidden that.

---

## ⛔ The receipts this gate mints are not cleaned up

`context_disclosure_receipt_governed_delete()` refuses a DELETE that names no
deletion manifest. An earlier draft attempted the delete and swallowed the
refusal, which would have taught a reader that the refusal is noise. **A receipt
is evidence of a crossing, not a fixture.** The rows die with the disposable
database, which is the lawful disposal.

⭐ This is the second time in two days that an instrument tried to tidy away
governed evidence — the migration witness did it first. Same lesson, recorded
rather than smoothed over.

---

## Standing

```text
ENFORCEMENT GATE          RESTORED · REAL 14/14 · BROKEN discriminates on custody
runtime Focus redesign    ⛔ NOT TOUCHED
compat shim               ⛔ NOT ADDED
f1mn-disclosure-acceptance retained · proves a DIFFERENT boundary · not a substitute

5A DISPOSITION            unchanged as recorded: ABSENT → STOP
                          this act repairs the enforcement the 5A census found
                          absent in effect; it does not re-classify 5A

FORMAL FOCUS WITNESS      ⛔ UNSPENT
CANDIDATE NOMINATION      ⛔ NOT MADE — 4abc86d3d is fetchable by SHA and owned
                          by no fetched branch ref; that stays on the record
OLD WITNESS DB            preserved · untouched
PRODUCTION                5f65038d2 · Focus OFF · untouched
Phase 4 UI                PAUSED · 4be90954e preserved, not built on
```
