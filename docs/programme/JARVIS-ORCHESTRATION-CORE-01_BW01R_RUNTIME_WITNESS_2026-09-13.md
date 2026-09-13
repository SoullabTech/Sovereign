# BW-01R — RUNTIME WITNESS · RESULT

**Founder-authorized 2026-09-13.** Suite: `lib/jarvis/__tests__/bw01r.witness.test.ts`
**Run**: `BW01R_DATABASE_URL=… npx jest lib/jarvis/__tests__/bw01r.witness.test.ts` → **8 passed · 0 failed**

## What made it a witness

Real PostgreSQL 16 (UTF8), with the **real DDL extracted verbatim from the migrations** for
`members` · `auth_sessions` · `member_manuscripts` · `manuscript_sections` ·
`runtime_consent_state` · `context_disclosure_receipts`. Real `resolveCanonicalIdentity` against a
real `auth_sessions` row · real `bindWorkScope` · real `assembleFocus` · real consent and receipt
writes.

⛔ **Stated limits.** `next/headers`' `cookies()` is shimmed (no Next request context in a test
process — the `x-session-token` branch runs the same `auth_sessions` lookup); `prepare`/`generate`
are stubbed, so **no model is called** and this witnesses *authority geometry*, not cognition. It is
the real code path against a real database — strictly more than a mocked unit test, strictly less
than a member using MAIA.

## Verbatim result

```
  W0 identity resolved from auth_sessions        verified · A≠B true
  W1 owned Work                                  scope minted · assembler reached CARRYING THE BOUND SCOPE
  W2 foreign Work                                refused · assembler never reached · reason=not_found_or_unauthorized
  W3 foreign vs nonexistent                      byte-identical presentation AND refusal — no existence oracle
  W4 forged / unauthenticated identity           identity_not_minted · identity_not_verified
  W5 serialization attempt                       threw — authority did not survive being written down
  W6 ownership handover mid-witness              prior author refused · new author admitted · no stale capability
  W7 PRE-EXISTING DEFECT                         assembleFocus joins `manuscripts`.`user_id` — table absent;
                                                 real shape is `member_manuscripts`.`member_id`
```

**W6 is the case that could not be simulated.** The Work changed hands mid-run. No cache was
invalidated and no event was emitted — the next execution simply asked again, and the prior author
was refused while the new one was admitted. ⭐ *There is no stored capability to go stale, which is
what `BW-AUTH-2` buys.*

---

## 🔴 W7 — what the witness found that no mocked test could

```sql
-- assembleFocus, both branches:
JOIN manuscripts m ON m.id = s.manuscript_id  WHERE … AND m.user_id = $2
```

**There is no `manuscripts` table and no `user_id` column** anywhere in `database/migrations/`.
`manuscript_sections.manuscript_id` references `member_manuscripts(id)`, whose owner column is
`member_id`. Confirmed against the live schema:

```
ERROR:  relation "manuscripts" does not exist
```

`assembleFocus` catches the throw, logs `[FOCUS] assembly failed`, and **returns null**. Therefore:

> ⛔ **The focus crossing has never been able to read a Work.** An authorized focus has always been
> reported to the member as unavailable.

⭐ **Why only a runtime witness could find this.** `focusCrossing.test.ts` mocks the database, so the
assembler returned whatever the fixture said. The code was green, the types were sound, the
architecture was praised in the census — and the query named a table that does not exist. *A mocked
database agrees with whatever you believe about the schema.*

⛔ **NOT REPAIRED.** Repair is not authorized by BW-01R. Pinned as W7 so the record is evidence, not
inference.

### ⭐ It is also an unplanned demonstration of `BW-LAW-1`

Before BW-01, authorization and materialization were the same act — so a broken retrieval was
indistinguishable from an unauthorized one, and this defect **could not have been isolated**. After
BW-01 they are separable, and the witness reports exactly that: **authorization succeeded, the
assembler was reached carrying the bound scope, and materialization failed for an unrelated
pre-existing reason.** W1 asserts only the first two, deliberately.

That is the law paying for itself within hours of being written down.

## Standing

**BW-01R COMPLETE · 8/8 · REAL DATABASE · NO MODEL CALLED · NOT PRODUCTION · W7 RECORDED AND NOT
REPAIRED.**
