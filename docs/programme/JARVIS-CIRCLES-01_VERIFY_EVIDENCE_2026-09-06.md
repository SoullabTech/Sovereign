# CIRCLE-03 · VERIFY — implementation and evidence

**Implementation:** `scripts/verify-constitution-circles.ts` (22 assertions, 3 groups).
**Authorized by:** founder adjudication 2026-09-06 §11.

---

## ⛔ 1. RUN STATUS — NOT RUN

> **This verifier has NOT been executed. No run evidence exists.**

| | |
|---|---|
| `DATABASE_URL` | **not set** in this session |
| `node_modules` | **absent** — `pg` and `tsx` unavailable |
| Network path to production | none from this remote container |

What *was* done: the file **typechecks clean** (only a CLI flag-deprecation notice; all remaining
diagnostics are absent-dependency module resolution).

⛔ **Everything in §3 is a STATIC PREDICTION derived by hand from the source read during the
census. It is NOT a result.** Under `CLAIM_STATE_AUTHORITY.md` a prediction never occupies the
state that evidence licenses. The founder's requested `VERIFY PASS/FAIL with exact evidence`
**cannot be returned from this session** — it requires one command on a host with database access:

```bash
docker exec maia-sovereign sh -c \
  'DATABASE_URL="$DATABASE_URL" npx tsx scripts/verify-constitution-circles.ts'
```

## 2. Design note — where the boundary actually lives

This codebase has **no row-level security** (by design: plain self-hosted Postgres, never Supabase
RLS). **Circle scoping is enforced in TypeScript**, by `getCircleWithMembership()`.

Consequences that shaped the implementation, and that the founder should know:

- A **SQL-only** verifier would prove nothing about the real boundary — the SQL layer has no
  opinion about who may read a Circle.
- A **service-only** verifier cannot see rolled-back fixtures: the services hold their own pool, so
  uncommitted rows are invisible to them.

Hence three groups:

| Group | Method | Proves |
|---|---|---|
| **C** — 12 | source assertions, no DB | constitutional properties that live in code |
| **S** — 4 | real service calls against **existing** principals, pure read | the actual enforced boundary |
| **T** — 6 | SQL fixtures inside `BEGIN … ROLLBACK` | data invariants and cascade semantics |

**Consequence contract:** Group T's transaction is rolled back in a `finally`, including on throw.
Groups C and S write nothing. Exit is non-zero on any failure; the pass condition is **`0 failed`,
never the total.**

## 3. Predicted result — STATIC ANALYSIS, NOT A RUN

**Predicted: `17 passed · 5 failed · 0 warned`** → **exit 1**.

### Predicted PASS (17)

| | Assertion | Basis |
|---|---|---|
| C1 | every Circle read/write path is membership-gated | all seven functions call `getCircleWithMembership` |
| C2 | **FR-04** inquiry withholds responses until contribution | `getInquiryWithResponses` returns `[]` when `hasResponded === false` |
| C3 | **FR-04** ordinary witnessing requires no contribution | `listFeed` has no precondition — **the ratified behavior** |
| C4 | **FR-08.2** pulse reads no inferred signals | severed by the 2026-07-17 ruling |
| C5 | **FR-08.3** no ambient MAIA-content read path | no Circle service touches conversation/memory tables |
| C9 | **FR-06** no discovery surface exists to violate | 0% built |
| C10 | **FR-07** no collective release path exists | collective material does not cross |
| C11 | **FR-08.8** feed serves the stored representation | only `LEFT JOIN members` for a name |
| C12 | **FR-01** revocation sets `revoked_at`; source untouched | no `DELETE` outside `shared_artifacts` |
| S1–S3 | **FR-01** member A cannot read / read-feed / **write into** Circle B | service gate throws `FORBIDDEN` |
| T1, T2 | **FR-01** revoked material leaves the field; source reference intact | |
| T4 | **FR-05** removal cuts active membership | |
| T5 | **FR-08.5** a crossing creates no membership | |
| T6 | **FR-04** one response per member per inquiry | DB `UNIQUE` constraint |

### Predicted FAIL (5)

| | Assertion | Why it should fail | Ruling |
|---|---|---|---|
| **C7** | removal is unimplemented | **no code path writes `status='removed'`** | FR-05 |
| **C8** | no column records removal grounds or actor | migration has no `removed_by` / grounds column | FR-05 |
| **T3** | **removal leaves the removed member's material in the field** | nothing cascades revocation on removal — only `leaveCircle` and consent-withdrawal do | FR-05 |
| **S4** | sub-plural Circles exist | all 4 production Circles have **1** active member; nothing enforces plurality | FR-02/FR-03 |
| **C6** | `response_count` is returned to the client | `inquiryService.listInquiries` | FR-08.7 |

**Three of the five are one defect.** C7 + C8 + T3 are the single unimplemented ruling FR-05.

## 4. ⭐ S4 is a question for the founder, not only a defect

The verifier asserts FR-02/FR-03 literally: *a Circle is a field among three or more persons.*
Production has four Circles of one member each, so the assertion fails.

**But a Circle must be able to form.** It necessarily begins with its creator alone, then two.
Under a literal reading, **every Circle is unconstitutional for its first two joins** — which
cannot be the intent.

This is a **constitution-wording question the verifier surfaced**, and Jarvis will not resolve it:

> Does FR-03's "three or more persons" describe a Circle in **active life**, or a Circle at
> **every instant including formation**?

If active life: plurality is a **lifecycle-state** property (CA-04 territory), and the verifier
should assert it only for Circles past FORMATION — which requires a lifecycle state that does not
exist in the schema. **This is the first place the unratified lifecycle blocks a ratified rule.**

⛔ Jarvis has **not** softened the assertion to make it pass. It fails as written, honestly, and
the wording question goes to the founder.

## 5. Assertions the ratified minimum does not yet let the verifier make

| Ruling | Cannot be asserted yet | Because |
|---|---|---|
| **FR-05** | that removal is *facilitator-only* | removal does not exist to gate |
| **FR-05** | the review route for a removed member | CA-10 open |
| **FR-06** | that discovery reads declared interests only | no discovery substrate |
| **FR-07** | joint-authorship consent | CA-12 open; no collective release exists |
| **FR-08.4** | Circle-interior opacity to a Constellation | no Constellation |
| **FR-08.6** | identity non-disclosure across membranes | no cross-membrane surface |
| **FR-09** | anything | not built, and **not a VERIFY blocker** |

**Coverage rule, restated:** *a membrane with no assertion is not a membrane — it is a description.*
Each of these owes its assertion **at the moment its substrate is introduced**, never after.

## 6. Fixture caveat for the first real run

Group T inserts into `members` using `passkey · username · password_hash · name`. If that table
carries additional `NOT NULL` columns without defaults, the first run will report
**`GROUP T aborted`** rather than individual failures. That is a harness fault, not a boundary
finding — adjust the fixture and rerun. **The transaction still rolls back.**
