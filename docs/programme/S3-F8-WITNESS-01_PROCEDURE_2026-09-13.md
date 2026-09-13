# S3-F8-WITNESS-01 · PROCEDURE

**Lane** S3-DESIGN-01 · P1 sequence step 9
**Authority** design doc §14 Ruling 3 · §15 · founder ratification of the
Class A / Class B split, 2026-09-13
**Falsifier** `S3-F8` — the ONLY Class A falsifier
**Date** 2026-09-13 · ⛔ **UNSPENT**

⛔ **This procedure changes nothing.** No source repair, no migration, no
disclosure wiring. It exists to establish one fact, strictly, and to make
environmental failure incapable of impersonating that fact.

---

## 1 · THE CLAIM UNDER WITNESS

```text
authorized developmental invocation
        ↓
developmentalTurn()
        ↓
loadRevisionContent()
        ↓
NO valid disclosure authority established
        ↓
canonical NEVERTHELESS permits the read
        ↓
S3-F8 RED
```

⭐⭐ **The evidence is not "the test failed."** The RED must fail **for the
intended reason** — authored revision characters reached developmental cognition
with no disclosure authority anywhere in the causal chain.

---

## 2 · THE THREE OUTCOMES — ratified, and exhaustive

| observation | verdict |
|---|---|
| unauthorized revision content is reached and read | ⭐ **EXPECTED RED ESTABLISHED** |
| unauthorized content is blocked by an existing canonical mechanism | ⛔ **STOP — substrate understanding incomplete** |
| the run cannot reach the decisive boundary | ⚠️ **INSTRUMENT FAILURE — no architectural evidence** |

⛔ **A green is not a green.** If canonical already refuses the unauthorized
read, that **contradicts the census and design premise** and stops the lane for
reconciliation — it is not permission to proceed to Class B.

⛔ **An instrument failure is not a RED.** It produces no architectural evidence
at all and must never be reported as one.

---

## 3 · THE DECISIVE BOUNDARY, NAMED EXACTLY

```text
app/api/sovereign/manuscripts/[id]/ask/route.ts
  POST → developmentalTurn()
       → loadRevisionContent(readState.draftId, readState.revisionNumber)

lib/manuscript/development/capture.ts:164
  SELECT content FROM working_draft_revisions
   WHERE draft_id = $1 AND revision_number = $2
```

⭐ The read is **unconditional** in `developmentalTurn()`, and
`establishDisclosureBoundary` has exactly one non-test caller in the repository —
`lib/writers-studio/focusCrossing.ts`, which this route never reaches.

---

## 4 · FIXTURE — and the trap it must avoid

```text
disposable shadow database · schema from repository truth · destroyed after
one member · one Work owned by that member
one working draft with AT LEAST ONE committed revision whose content is NON-EMPTY
one frozen developmental reading over that revision
one observation whose evidence carries a BODY-SCOPED ref
   (section · passage · section-run — NOT a structure-only ref)
```

⛔⛔ **THE TRAP.** `revisionContent` may legitimately be `null`, and
`assembleDevelopmentalContext` tolerates that by design (§11.4). A fixture whose
revision row is missing or empty produces a run with no authored characters —
which looks like a refusal and is not one.

> ⭐ **A null read must never be scored as a block.** The fixture must guarantee
> the content exists, or the witness is invalid before it starts.

⛔ A structure-only observation is equally invalid: it never required body, so
its clean run proves nothing about body disclosure.

---

## 5 · INSTRUMENTS — two, independent

### 5.1 · PRIMARY — authored characters reached cognition

Assert on the assembled developmental context / response that evidence views are
**recovered**, i.e. carry authored characters derived from the revision. ⛔ Not
"the request returned 200" — a 200 with unrecoverable evidence is the null case
above wearing a success code.

### 5.2 · CORROBORATING — the read actually issued

On the shadow, with statement logging enabled, confirm the
`working_draft_revisions` SELECT for `(draftId, revisionNumber)` was executed
within the request.

⭐ Two instruments because either alone is ambiguous: the response could in
principle be assembled from a cache, and a logged statement does not prove its
result crossed into cognition. **Together they close the chain.**

### 5.3 · THE ABSENCE THAT MUST ALSO BE PROVED

```text
SELECT count(*) FROM context_disclosure_receipts;   -- expected: 0
```

⛔ **Zero receipts alone proves nothing** — a route that refused early also mints
none. It is meaningful ONLY alongside 5.1 + 5.2, which is precisely why all
three are required.

---

## 6 · STOP CONDITIONS — any one voids the run

```text
authentication failure
member does not own the Work          (memberOwnsWork → 404)
anchor rejected                       (checkObservationAnchor → refusal)
reading not loadable                  (loadFrozenDevelopmentalReading → null)
canonical unmeasurable                (→ 503)
missing database object / migration not applied
malformed invocation
unrelated exception anywhere in the request
route unreachable
environment or configuration failure
```

⭐ Every one of these produces a failing run **for a reason that is not S3**.
⛔ **None of them is a RED.** Each is §2 row three: instrument failure.

---

## 7 · EVIDENCE DISCIPLINE

```text
⛔ no runtime-generated content, refusal text or audit output is staged
   or committed as part of the result record
⛔ no authored manuscript prose in the record, in any form — not excerpt,
   not digest, not offset (the receipt law's refusal surface applies to
   the WITNESS RECORD as much as to the receipt)
⭐ the shadow database is destroyed after the run; what it held dies with it
```

⚠️ Any credential the fixture prints is scoped to the shadow, grants nothing
outside it, and dies with the database — the disposal this lane has applied
before.

---

## 8 · WHAT A RESULT RECORD MUST STATE

```text
the SHA witnessed
the three outcomes, and which one occurred
the fixture's guarantee that revision content was NON-NULL and body-scoped
both instruments, independently reported
the receipt count
⛔ and, on anything but the expected RED, NO claim about S3 whatsoever
```

---

## Standing

```text
S3-F8-WITNESS-01     SPECIFIED · ⛔ UNSPENT
CLASS A              this is the lane's only genuine known-bad reproduction
CLASS B              blocked behind it — S3-F1…F7, F9, F10 specified,
                     defeat candidates pinned, implementation NOT AUTHORIZED
STORAGE DESIGN       CLOSED · transition law before schema (§15 direction)
SOURCE               UNCHANGED
PRODUCTION           UNTOUCHED
```
