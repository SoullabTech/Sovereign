# MAIA-MAVEN-T1A — J5-1 CANONICAL PERSONAL KEEP SELECTOR WITNESS

**Status:** J5-1 COMPLETE · **J5-2 NOT OPENED** · ⛔ NO SCHEMA / DISCLOSURE / ROUTE / PROMPT / UI AUTHORIZATION  
**Date:** 2026-09-17  
**Authority act:** founder instruction “lets continue” after J5-0 closure named J5-1 as the next contained act  
**Base:** `5e00d9eb79d83d3493d0217af1f14a10d04157cb`  
**Specification:** `docs/programme/MAIA-MAVEN-T1A_J5_IMPLEMENTATION_SPEC_2026-09-17.md`

---

## 1. Authorized cut

J5-1 was authorized to do one thing:

> Move the already-earned Personal Keep selection law into one canonical domain selector, then make the existing Workbench Keep adapter consume that selector with zero behavioral change.

J5-1 did **not** authorize:

- a new Keep object;
- a new route;
- disclosure receipts;
- schema vocabulary;
- five-item MAIA pagination;
- deterministic tie-breaking not already present;
- source dereferencing;
- prompt injection;
- `/maia` wiring;
- continuation state.

The extraction therefore preserves the existing Workbench ancestor exactly rather than prematurely implementing later J5 cuts.

---

## 2. Red witness

Falsifiers were written before the selector existed.

Initial run:

```text
FAIL lib/psyche/__tests__/personalKeepsRead.test.ts
Cannot find module '../personalKeepsRead'
```

A second structural falsifier also failed because `lib/workbench/sources/keep.ts` still owned its SQL and did not import the canonical selector.

That is the expected RED state: the repository had truthful Keep law, but only inside a Book Workbench adapter rather than in a reusable Personal Keep domain seam.

---

## 3. Canonical selector added

New domain module:

```text
lib/psyche/personalKeepsRead.ts
```

It now exclusively owns the generic Personal Keep predicate:

```text
member_id = calling member
generated_by = 'member-gesture'
status IN ('active', 'still_alive')
memory_scope = 'personal'
posture_at_creation IS DISTINCT FROM 'sanctuary'
NOT (source_type = 'practitioner_observation' AND facilitator_id IS NULL)
```

The selector exposes only read operations:

```text
searchPersonalKeeps(...)
resolvePersonalKeep(...)
```

It does not authorize disclosure into MAIA cognition. It establishes only that a row qualifies as a Personal Field / Portfolio Keep.

---

## 4. Workbench now consumes the same law

`lib/workbench/sources/keep.ts` no longer imports the database layer and no longer defines a Keep predicate.

It now delegates selection to:

```text
@/lib/psyche/personalKeepsRead
```

and owns only Workbench presentation:

```text
qualifying Personal Keep row
        ↓
WorkbenchCardRef / ResolvedCard
```

This removes the risk that T1-A and Book Studio could later carry two nearly-identical but drifting definitions of “Personal Keep.”

---

## 5. Zero-behavior-change boundary

J5-1 deliberately does **not** introduce later J5 behavior.

The extracted selector preserves:

```text
same selected columns
same Personal Keep guards
same optional text filter
same from/to date filters
same bound parameters
same ORDER BY kept_at DESC
same LIMIT 200
same single-Keep member + id resolution
same return_preference absence
same read-only behavior
```

In particular, J5-1 does **not** add the later proposed `id DESC` tie-break or six-ref pagination needed for the five-item MAIA experience. Those would change the existing Workbench ancestor and belong to a separately authorized cut.

---

## 6. Mechanical SQL equivalence witness

The two SELECT templates from the parent Workbench adapter at `5e00d9eb7` were compared against the two templates in the new canonical selector.

Only the local guard-variable name was normalized:

```text
ATOM_GUARDS
PERSONAL_KEEP_GUARDS
        ↓
GUARDS
```

Result:

```text
QUERY_COUNT_EQUAL       true  2 / 2
QUERY_1_EQUIVALENT      true
QUERY_2_EQUIVALENT      true
ALL_SQL_EQUIVALENT      true
```

This proves the extraction did not silently alter the actual query predicates, ordering, selected columns or ceiling.

---

## 7. Green witness

Focused domain + Workbench suite:

```text
PASS lib/workbench/__tests__/keepSourceAdapter.test.ts
PASS lib/psyche/__tests__/personalKeepsRead.test.ts

2 suites passed
43 tests passed
0 failed
```

The new domain suite proves:

- every Personal Keep guard reaches emitted SQL;
- chronology remains `kept_at DESC`;
- Workbench ceiling remains `LIMIT 200`;
- `return_preference` is not consulted;
- free text and date filters remain bound parameters;
- resolve scopes by member and Keep id;
- missing qualified Keep resolves to null;
- selector issues SELECT only.

---

## 8. Neighboring regression witness

The selector was then exercised beside the J5-0 recognizer and the Workbench's access/non-mutation suites:

```text
PASS personalKeepsReadIntent.test.ts
PASS personalKeepsRead.test.ts
PASS keepSourceAdapter.test.ts
PASS workbenchAccessBoundary.test.ts
PASS arrangementLeavesSourceAlone.test.ts

5 suites passed
136 tests passed
0 failed
```

One pre-existing structural test initially expected the Workbench adapter itself to contain a `SELECT`. That assertion described the old file location, not the underlying invariant.

It was updated to preserve the same safety claim at the new boundary:

```text
Workbench adapter delegates
canonical Personal Keep selector contains SELECT
neither path contains source-row writes
```

The arrangement surface list now includes the canonical selector because it is part of the executable read path.

No safety assertion was removed; the proof followed the moved responsibility.

---

## 9. Type-health witness

Repository gate:

```text
npm run typecheck
```

Result:

```text
TypeScript no-regression gate — tsconfig.ship.json
program files : 4372 (baseline 3965)
errors        : 229 (baseline 239)
10 errors fixed since baseline
0 regressions
PASS
```

---

## 10. Containment

J5-1 changes only the selection seam and its evidence:

```text
NEW  lib/psyche/personalKeepsRead.ts
NEW  lib/psyche/__tests__/personalKeepsRead.test.ts
MOD  lib/workbench/sources/keep.ts
MOD  lib/workbench/__tests__/keepSourceAdapter.test.ts
MOD  lib/workbench/__tests__/arrangementLeavesSourceAlone.test.ts
NEW  this witness record
```

J5-1 does **not** change:

```text
/api/sovereign/app/maia/list
getMaiaResponse
context_disclosure_receipts
any migration
requireConsentState
Keep creation
KeepAffordance
/maia
/maia/keep-capture
prompt content
capability registry
production state
```

---

## 11. Standing

```text
J5-0 invocation contract + falsifiers     ✅ COMPLETE
J5-1 canonical Personal Keep selector     ✅ COMPLETE
J5-2 disclosure vocabulary                ⛔ NOT OPENED
J5-3 request authority + receipts         ⛔ NOT OPENED
J5-4 cognition crossing                   ⛔ NOT OPENED
J5-5 five-item experience                 ⛔ NOT OPENED
J5-6 continuation                         ⛔ NOT OPENED
```

The next legitimate act is **J5-2 only**: widen the existing `context_disclosure_receipts` vocabulary by the four already-specified Keep values, one governed axis at a time, with no route or cognition wiring.
