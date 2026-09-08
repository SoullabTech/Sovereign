# SEL-0 Step 4 — fixture ⇄ product-contract compatibility · **MISMATCH**

**Contract**: `ebcb46d0d` §2.3–§2.5 · **Instrument**: `af155f4149a76d01ab83139bde2c45c0bb2f57ba`
**Method**: structural projection of Manifest C only — field names, JSON types, cardinalities,
presence booleans. No string values, no IDs, no observation text, no characterisation.
Nothing implemented, no provider called, Manifest B and the source snapshot not opened.

---

## Outcome

```text
MISMATCH
```

Not repairable by adding a field, and **not** repairable by supplying defaults — which were
not created.

## Input provenance map

```text
CONTRACT INPUT (§2.4)              BENCHMARK SOURCE            STATUS
lawful candidate observations      Manifest C items[19]        PRESENT
writer present turn / intention    runtime                     RUNTIME — lawful
commissioned lens                  C.global_ranking_context    PRESENT
reading scope / withStructure      C.global_ranking_context    PRESENT
frozen read_state                  C.global_ranking_context    PRESENT
coverage                           C.global_ranking_context    PRESENT
evidentiary strength               C items[].native_payload    PRESENT
member-authored standings          — not in C                  ABSENT
open ask_threads                   — not in C                  ABSENT

CONTRACT BOUNDARY (§2.3)           BENCHMARK SOURCE            STATUS
F-7 eligible                       applied at Step 0           PRESENT
standing != 'dismiss'              — not in C                  ABSENT
not superseded                     — not in C                  ABSENT
```

Manifest C's `native_field_allowlist` carries 11 entries, all `observation.*` and
`reading.*`. **No member-state field appears in it.** `native_payload` keys are uniform
across all 19 but for one optional classifier field present on 18.

## The finding, stated precisely

Two different problems sit behind the three absences, and only one of them blocks.

**§2.4 inputs 5 and 6 — standings, open threads — are PERMITTED, not required.** A selector
that never consults them is still contract-compliant. Their absence narrows what the
selector may use; it does not invalidate the fixture. **Not blocking.**

**§2.3's boundary is MANDATORY, and the fixture cannot express it.** The lawful candidate
set is defined as F-7 eligible **and** not dismissed **and** not superseded. Manifest C
carries no standing and no supersession marker, so neither condition can be evaluated from
the fixture.

### Why this is structural rather than a missing column

⚠️ **The corpus was frozen to a definition of "lawful" that predates the contract defining
it.** At Step 0, lawful meant *F-7 eligible*. The contract ratified afterwards at
`ebcb46d0d` defines lawful as *F-7 eligible AND not dismissed AND not superseded*. The
fixture therefore encodes an **older, broader** eligibility rule than the one it is meant to
test against.

Whether any of the 19 is in fact dismissed or superseded is **unknown and was not
investigated** — determining it requires reading production, which this step is not
authorised to do. The finding is not that the corpus is wrong. It is that **the fixture
cannot demonstrate it is right.**

⛔ **No defaults were invented.** Assuming "all standings unset, nothing superseded" would
very likely be true given how little member interaction production carries — and that is
exactly why it is dangerous. It would convert an unverified assumption into a frozen digest,
and every downstream result would inherit it silently. Assuming is not verifying.

## Missing categories, as required

```text
MISSING   per-observation member standing        (keep | dismiss | unresolved | unset)
MISSING   per-observation supersession state
MISSING   per-observation open-thread presence   (permitted input, non-blocking)
EXTRA     none — no field in C is outside the contract's permitted inputs
```

No stimulus values, IDs, or content of any kind were read or reported.

## STOP

Step 5 (lock), Step 6 (implement) not entered. Resolution is a founder act: it turns on
whether the fixture is re-derived under the ratified boundary, whether the boundary is read
as applying at selection time rather than freeze time, or whether the corpus is re-frozen —
and each has different consequences for the founder blind, which is still INTACT.

```text
product contract       FROZEN   ebcb46d0d
acceptance instrument  FROZEN   af155f414
fixture                MISMATCH — Step 4 not passed
selector               NOT IMPLEMENTED
Manifest B             NOT OPENED
founder blind          INTACT
MERGE / DEPLOY         NOT AUTHORIZED
```
