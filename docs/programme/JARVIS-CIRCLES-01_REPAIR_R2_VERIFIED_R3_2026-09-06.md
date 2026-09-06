# CIRCLE-04 · R2 verified · R3 implemented

## 1. R2 — verification of record

**Candidate:** `8f31abc8`
**Method:** founder-run against a **disposable shadow database** built from production schema and
data. The R2 migration was applied **only there**. Shadow deleted after verification.
**Production was never migrated and never deployed.**

```text
28 passed · 2 failed · 0 warned · 0 skipped   →   exit 1

remaining:  C6  response_count            → R4
            S4  FORMING/ACTIVE boundary   → R3
```

**Every R2 assertion passed** — C7, C8, and T3a–T3i: ordinary-member refusal · self-removal refusal
· required grounds · authorized facilitator removal · actor and grounds recorded · access cut ·
share revocation · source preserved · other-Circle isolation.

**Containment:** shadow held `0` removal records after the rolled-back run, then was deleted.
Production unchanged — `4 circles · 4 memberships · 0 shares · 0 inquiries · 0 responses`, and
`circle_membership_removals` **remains absent from production.**

```text
R2 = VERIFIED ON CANDIDATE / PRODUCTION CLOSURE PENDING eventual deploy
```

### Correction absorbed — the immutability claim was overstated

The record and the migration now say what is true and no more: **append-only by application
contract.** No code path updates or deletes those rows, which is what FR-05 needs — **ordinary
product actions, rejoining included, cannot overwrite removal history.** It is **not** cryptographic
immutability and **not** protection from a database administrator.

### Facilitator ruling absorbed (FR-12)

Authority **not** widened to `helper`; creators **not** auto-promoted; the route **kept**. The
absent facilitator-assignment pathway is an **INVOKE gap (CA-15)**, not a reason to corrupt R2.

---

## 2. R3 — constitution state

**Status:** IMPLEMENTED · ⛔ **NOT VERIFIED — no database or dependencies in a remote session.**
**No migration. No schema change. Nothing stored.**

### `lib/circles/constitutionState.ts`

```text
CircleConstitutionState = 'forming' | 'active'

deriveConstitutionState(activeMemberCount)      pure, the whole rule
getCircleConstitutionState(circleId, client?)   the canonical derivation
CIRCLE_PLURALITY_THRESHOLD = 3                  the threshold, in exactly one place
```

Derives transactionally from `circle_memberships WHERE status = 'active'`. The optional client
means a caller inside a transaction sees its own uncommitted membership changes — which is what
makes the transitions *facts* rather than eventually-consistent guesses.

**Nothing is stored**, so the drift the ruling names — *stored = ACTIVE while membership count = 2*
— is not representable. There is no timer, no administrator act, no inference.

### ⚠️ The collision is worse than "same words"

`FieldPhase` is `'forming' | 'active' | 'integrating' | 'quiet'`. Two of its four values are the
**same strings** as constitution state, in the **same module**, meaning something else entirely —
`derivePhase()` calls a Circle `'active'` when an inquiry is open.

**So `CircleConstitutionState` is structurally assignable to `FieldPhase`, and TypeScript cannot
catch a mix-up.** The separation is a discipline, not a compiler guarantee.

Recorded as **CA-14**. FieldPhase is **not** repaired or renamed (founder ruling). But a discipline
with no falsifier drifts, so **C14** was added: the constitution-state module must not depend on
FieldPhase, and the field pulse must not depend on constitution state. ⚠️ **That assertion is
Jarvis's addition, not instructed — say the word and it comes out.**

### Verifier — S4 replaced

The old S4 tested for a **stored lifecycle column**. Under FR-13 that would assert the wrong thing,
so it is **removed entirely**, not adapted. S4a–S4e replace it in Group T, walking **one dedicated
fixture Circle** through the transitions:

| | |
|---|---|
| **S4a** | 1 active member → FORMING — intention, not yet plurality |
| **S4b** | 2 → FORMING — relationship, but dyadic geometry (FR-03) |
| **S4c** | 3 → ACTIVE — the field is constituted |
| **S4d** | falls to 2 → FORMING — re-formation, **not failure** |
| **S4e** | returns to 3 → ACTIVE — no administrator act, no timer |

⛔ **The four historical production Circles are not read.** They could only manufacture a pass; the
**derivation itself** is what is under test. Fixtures roll back.

**C6 untouched** — it remains the R4 failure.

## 3. Expected direction — an expectation, not evidence

```text
S4 family   PASS        C6   FAIL        every R1/R2 assertion   still green
```

⛔ No target pass count is manufactured. R3 adds no migration, so the shadow-database step is only
needed to carry R2's.

## 4. What R3 does not do

No stored lifecycle column · no `CHECK(member_count >= 3)` · no cached member count · FieldPhase
untouched · no facilitator assignment · `response_count` untouched · no deploy · no migration
applied to production · founder gate untouched · no cohort · **R4 not started.**
