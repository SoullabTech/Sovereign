# SPM-FC-01-R5 — DISCOVERABILITY REPAIR

```text
DATE        2026-09-17
TYPE        DOCUMENTARY AUTHORITY-ROUTING REPAIR
BASIS       independent provenance sweep 40f1d821c · Finding 1
SUBJECT     SPM-FC-01 historical base contract

⛔ NOT       a new constitutional law
⛔ NOT       re-adjudication of any clause
⛔ NOT       implementation authority
⛔ NOT       a rewrite of historical clause bodies
```

## 1 · Finding closed

The independent sweep established that the file named as the contract remained historical base text
while its governing corrections lived elsewhere. A reader opening that file alone could encounter
superseded wording without any route to the governing replacement.

This act repairs **discoverability only**. It does not make any clause more true.

## 2 · Exact documentary additions

The historical contract now carries:

1. one **SUPERSEDED IN PART** header naming the governing correction lineage;
2. inline supersession markers at **I-8 · I-12 · I-14 · I-15 · I-17**;
3. one I-33 disposition marker recording **KEEP as imported binding dependency**;
4. one marker over the historical `§5 STANDING` block;
5. the header explicitly enumerates all ten R2 replacement loci:
   `I-1 · I-3 · I-4 · I-7 · I-10 · I-16 · I-20 · I-25 · I-26 · I-32`.

The governing records named by those markers are:

```text
R2  f40d4134a    ten scope replacements
R3  9d0539b3f    deliberate deletion of the defective closing synthesis
R4  ea422fa4d    I-12 · I-14 · I-15 · I-17 replacements
R5  a2626c915    I-8 replacement · I-33 KEEP disposition
    8dafd0bfe    corrected 16 + 10 + 4 + 1 accounting
```

The independent verification at `40f1d821c` is named in the header as the external check of the
D9-A provenance class.

## 3 · Historical-text preservation proof

Before this act, the contract on the R5 line was the R3 historical base with only its four-line
closing synthesis removed.

A mechanical verifier removed **only** the documentary insertions authorized above from the new
file, then compared the remainder byte-for-byte with the contract at `fe16036a9`.

```text
historical_text_exact    TRUE

pre-repair historical text SHA-256
  9490cd246f67163cab5a4326bfd10374d58d0632ac5b2e056b9264e4bd77fa6c

post-repair text with routing annotations stripped SHA-256
  9490cd246f67163cab5a4326bfd10374d58d0632ac5b2e056b9264e4bd77fa6c

hashes equal             PASS
```

Current documentary contract blob before commit:

```text
c47f90478ea0bfe0ab888a23be96039360ff0396
```

⭐ The old words remain old words. Authority is made findable around them.

## 4 · Finding 2 — deliberate disposition

The independent sweep also noted that R3 **deleted** the defective closing synthesis rather than
marking it superseded.

That deletion is **preserved deliberately** and is not reversed here. The deleted text was a
rhetorical synthesis, not a witness record, and it contradicted both I-9 and D9-A §8.2's own
provenance-accrues / present-standing-non-monotonic distinction.

This record makes the departure from the programme's usual supersession-marking practice explicit;
it does not manufacture the deleted slogan back into the historical object.

## 5 · Structural check

```text
header routing                 PRESENT
R2 loci named                  10 / 10
inline corrected-clause marks   5 / 5
I-33 disposition mark           1 / 1
historical standing mark        1 / 1
independent sweep named         YES
historical clause text changed  NO
non-doc files changed           0
```

## 6 · Standing

```text
INDEPENDENT D9-A SWEEP          PASS @ 40f1d821c
FINDING 1                       ✅ CLOSED by this act
FINDING 2                       ✅ RECORDED AS DELIBERATE · NO REVERSAL
CONSTITUTIONAL MERITS           PASS · unchanged
FINAL RATIFICATION              NEXT · founder act
IMPLEMENTATION                  ⛔ CLOSED
F5 ERASURE CONFORMANCE          ⛔ FAIL / STOP
PRODUCTION                      ⛔ UNTOUCHED
```

**STOP.**
