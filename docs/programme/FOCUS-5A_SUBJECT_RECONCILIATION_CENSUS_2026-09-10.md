# 5A · subject-line reconciliation census

```text
QUESTION    Does the custody invariant that 2de1b421 embodied survive on the
            candidate line 4abc86d3d…?
MODE        READ-ONLY
RESULT      ABSENT → STOP
```

⚠️ **Recorded after the fact.** This census was performed and reported in the
operating session but never written to a file; the reconciliation that follows it
was. A finding that exists only in a transcript is not a record, so it is written
here — dated as what it is.

---

## ⚠️ The candidate was not in the clone

`git cat-file` failed on `4abc86d3d4f2e4a2e7b9cb6e23406fcafb197fa8`; a direct
fetch **by SHA** succeeded. It is owned by **no fetched branch ref**.

⛔ An earlier `git rev-parse --short` echoed the abbreviation back, which was
mistaken for existence evidence. **`rev-parse` abbreviates any well-formed
40-character hex without verifying that the object exists.** That is not
provenance.

---

## 5A-1 · What the repair at `2de1b421` actually was

⭐ Four constituents, not one — reading it as a repair rather than as a SHA:

```text
1  assembleFocus.ts        custody SQL — the member's addressable WORKING DRAFT,
                           member-gated ⛔ never manuscript_sections as payload
2  focusCrossing.ts        the ephemeral-locator partition: sectionRef reaches
                           the receipt and the label ONLY under section scope
3  focus-assembler-contract.ts + gate-focus-assembler.sh + package.json
                           ⭐ THE ENFORCEMENT — a disposable database built from
                           repository truth, running the REAL assembler SQL
4  three contract records
```

Its ratified invariant, in its own words:

> *A database-dependent disclosure boundary cannot be licensed solely by a mocked
> database.*

⭐ That is the merge-to-deploy hole: mocked unit tests could license a
broken-custody assembler all the way to deploy.

---

## 5A-2 / 5A-3 · Each constituent on the candidate

```text
custody SQL              PRESENT · STRENGTHENED — same tables, same
                         addressability gate, now inside discloseUnder(authority,…)
                         so the queries cannot run without a matching capability
locator partition        PRESENT · RELOCATED — the same predicate now lives in
                         disclosureBoundary.ts, generalized to unit/range loci
gate script + package    PRESENT · byte-identical
contract witness         PRESENT · byte-identical ⛔ AND INOPERATIVE
```

---

## 5A-4 · The interaction — the finding

The witness was byte-identical to its original and called
`assembleFocus({ memberId, workRef, scopeKind, sectionRef, range })`. The
candidate's assembler takes `{ authority, memberId, workRef, locus }`, with **no
compatibility shim**.

⭐ `tsx` transpiles without typechecking, so the gate **ran**, `locus` was
`undefined`, and it died on `locus.scopeKind` — **failing closed, and incapable
of passing.**

`f1mn-disclosure-acceptance.ts` is a real-database instrument but never imports
the assembler. **Nothing on the candidate line executed the real assembler SQL.**

---

## 5A-5 · Classification

```text
5A HISTORICAL RESULT     ABSENT → STOP
```

⭐ The single required classification compresses a compound truth, and the
constituents are preserved so it cannot later be read as a flat verdict:

```text
custody behaviour        SUPERSEDED_LAWFULLY
locator partition        SUPERSEDED_LAWFULLY
deploy-facing enforcement ABSENT IN EFFECT
```

⛔ **The overall disposition was NOT promoted to `SUPERSEDED_LAWFULLY`**, because
the ratified repair was not only a runtime implementation: **its enforcement was
part of the thing being preserved**, and that law had no functioning instrument.

---

## What happened next

```text
enforcement reconciliation   FOCUS-GATE-ENFORCEMENT-RECONCILIATION_2026-09-10.md
                             instrument repaired, ⛔ architecture untouched
5A ACTIVE STOP               CLEARED (founder) — the historical result stands
candidate                    cbbb53dc6… — the reconciliation tip, NOT 4abc86d3d
witness                      FOCUS-WITNESS-01_RESULT_2026-09-10.md
```

⛔ `4abc86d3d` was **not** nominated as the witness subject, and the record keeps
why: fetchable by SHA, owned by no branch ref, enforcement incomplete.
