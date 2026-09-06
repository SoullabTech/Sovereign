# Class-B repair order — derived from VERIFY

⛔ **Nothing here is authorized. Nothing is repaired.**
⛔ **Provisional: derived from the STATIC PREDICTION in `…_VERIFY_EVIDENCE…` §3, not from a run.**
**Re-derive this order from the first real run before acting on it.**

---

## Order

### R1 · FR-05 removal — *the only ratified law with zero implementation*
**Fails:** C7 · C8 · T3. **Was:** B-03.

Three failures, one defect. FR-05 was ratified today and the substrate implements **none** of it:
no writer for `status='removed'`, no column for grounds or actor, no cascade.

Needs, in one change: a facilitator-gated removal path · `removed_by` + grounds columns
(migration) · **revocation cascade identical to `leaveCircle`** · source material untouched.
**Blocked on nothing.** CA-10 (the review institution) can follow — FR-05 requires only that a
route exist, and the founder placed the institution beyond VERIFY.

> **Why first:** it is the largest gap between ratified law and code, and it is the mechanism a
> Circle needs when it is least able to wait — a boundary or safety breach.

### R2 · FR-02/FR-03 plurality — **ruling needed before repair**
**Fails:** S4. **New** (was not in Class B).

⛔ **Do not repair by adding a `CHECK (members >= 3)`.** That would make every Circle
unconstitutional at creation. **This needs the §4 wording ruling first** — is plurality a property
of *active life* or of *every instant*? If active life, it depends on a lifecycle state the schema
does not have, and the repair is lifecycle work (CA-04), not a constraint.

### R3 · FR-08.7 `response_count` — smallest, cleanest
**Fails:** C6. **Was:** B-06.

Stop returning `response_count` from `listInquiries`, or rule that a count the system holds but
never renders is compliant. **A doctrine reading, then a one-line change.**

### R4 · B-01 founder gate — *not a verifier failure; recommended before any cohort*
The verifier does not test it, because it is an access-policy question, not a boundary. But
`/api/circles` is `minTier: 'free'`, `/commons/join` is public, and no API route imports
`requireFounder`. Membership scoping holds — this is **not** an inter-Circle leak — but
*"Circles is not open for v1"* describes the UI only.

⛔ **Do not close B-01 merely because the verifier exists** *(explicit founder instruction).*

### R5 · remaining, unchanged and unblocked-by-nothing-urgent
B-04 dangling containment-plan reference · B-05 non-withdrawable response *(blocked on CA-03)* ·
B-07 inert `visibility`/`invite_enabled` *(blocked on FR-06 discovery design — **do not build to
the inert columns**)* · B-08 pulse defence-in-depth · B-09 `integrating` one-way door ·
B-10 nav→refusal screens.

## What the predicted failures say about the substrate

**The enforced boundary is sound; the ratified authority model is unbuilt.**

Every isolation assertion is predicted to pass — cross-Circle reads, cross-Circle writes,
revocation, source integrity, membership non-transfer, one-response-per-member. Those were built
correctly and hold.

All five predicted failures concern **things the constitution decided and the code has never had
to have**: removal authority (3), plurality (1), and a count that leaks a participation signal (1).

> That is the expected shape when philosophy meets engineering for the first time — and it is the
> reason the verifier was written before the repairs.

---

## Return state

```text
CONSTITUTE     RATIFIED MINIMUM — FR-01 … FR-10 recorded; CA-01 … CA-13 open, none blocking
VERIFY         IMPLEMENTED, NOT RUN — no database access in this session.
               Predicted 17 passed · 5 failed. Prediction is not evidence.
CLASS-B        ordered repair docket above — PROVISIONAL until the first real run
COHORT         NOT AUTHORIZED
```

**One command returns the real evidence:**

```bash
docker exec maia-sovereign sh -c \
  'DATABASE_URL="$DATABASE_URL" npx tsx scripts/verify-constitution-circles.ts'
```
