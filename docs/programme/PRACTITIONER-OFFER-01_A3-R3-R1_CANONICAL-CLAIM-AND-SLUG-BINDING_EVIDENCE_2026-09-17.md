# PRACTITIONER-OFFER-01 · A3-R3-R1-RECONSTRUCTION
## Canonical Claim & Slug Binding — Closure Evidence

**Date:** 2026-09-17
**Base commit:** `087b7fa3` (`docs(security): freeze A3-R3 portal custody evidence`)
**Feature branch:** `feature/practitioner-offer-a3-r3-r1-canonical-claim-20260917`
**Checkpoint commit:** `ce5b9fd7` — published before any verification ran
**Authority:** bounded repair. No PR, merge, migration application, or deployment.
**Data status:** repository evidence and synthetic data only. No real client data. No production or shared-staging connection was opened.

---

## Verdict

**F1, F2 and F3 are closed on the portal claim surface at source and at statement level.
Route-level end-to-end falsification is OWED and is not claimed here.**

The repair was reconstructed from the frozen falsifiers in A3-R3, not from recollection:
every defect in §2 was read from the code at `087b7fa3` before anything was written.

F4, F5, F6 and F7 remain open. They belong to R3-R2, R3-R3 and R3-R4 and are not this
unit's to close.

---

## 1. Evidence classes

This record separates two kinds of claim and does not merge them.

- **WITNESSED** — a command was run and its output observed directly, in this session.
- **ENTAILED** — established by reading source, or by a property that provably follows
  from something demonstrably true.

Where an obligation is discharged by neither, it is listed in §8 as **OWED**.

---

## 2. Defect record (read from source at `087b7fa3`)

Cited by operation, never by line number.

| ID | Defect | Falsifier |
|---|---|---|
| D1 | `POST /api/portal/[slug]/claim` selects `p.slug` through correct A3-R2 joins and never compares it to the route slug; the session it mints carries the **request** slug | F1 |
| D2 | `POST /api/portal/[slug]/invites/claim` destructures `{ params }` and never reads `slug` — slug-blind by construction | F1 |
| D3 | `app/portal/[slug]/claim/page.tsx` called the duplicate, so the path users traversed was the one with no route awareness and no transaction | F1 |
| D4 | Both routes evaluate status and expiry in application logic, then issue an `UPDATE` with no `status = 'unused'` term, no expiry term, no row lock, and no affected-row check | F3 |
| D5 | The duplicate required the submitted email to equal the client's **booking email**; the canonical route accepted any well-formed address | — |
| D6 | `client-auth/signin` searches globally by `portal_email` through a `LEFT JOIN … ON c.practitioner_id = p.id OR c.practitioner_id = p.member_id`, selects the real slug, never compares it | F2 |

On D4: `/claim` wrapped its two updates in `transaction()`, which is a plain `BEGIN` at
READ COMMITTED **with no row lock** — the construction that defeated `093379e8d` in the
Circles lane. It bounded rollback correctly and contributed nothing to single consumption.

---

## 3. The repair as landed

1. **Slug bound as a query predicate, both routes.** The practice is the anchor:
   `FROM practitioners p … WHERE p.slug = $n`, joined forward to the invite and client
   through the A3-R2 bindings, which are preserved verbatim. A mismatched practice
   produces no row, so there is no later comparison to omit. Because the row is reached
   *through* the slug, the session minted at the end of each handler is correctly scoped
   by construction rather than by a subsequent check.
2. **Wrong slug is indistinguishable from an unknown code**, and a wrong-slug sign-in is
   indistinguishable from a wrong password. A refusal is not an occasion to disclose.
3. **D5 carried forward** per founder ruling: the normalized submitted email must equal
   the client's booking email. A different recovery address is an identity-change
   ceremony that does not exist and is not part of claim. See §7 for the null case.
4. **Consumption is the claim.** One conditional `UPDATE … RETURNING` carrying the
   identity tuple, `status = 'unused'`, and `expires_at > NOW()` evaluated by the
   database clock. `rowCount !== 1` raises a typed `InviteNotConsumed`, which aborts the
   transaction — a typed refusal rather than a boolean a caller can forget to read.
   Consumption runs before the credential write so the authority precedes the effect.
5. **Refusal paths no longer mutate.** The pre-repair expiry branch wrote
   `status = 'expired'` on a refusal; that write is removed.
6. **Status reads inform the message, never the authority.** The pre-flight branches that
   produce `already_claimed` / `expired` / `invalid` remain, explicitly marked
   non-authoritative. A lost race returns the same `already_claimed` a serial replay
   receives, without re-reading to establish why.
7. **One claim authority.** `/invites/claim` is reduced to a non-claiming 410 that reads
   no invite, hashes no code, writes no credential and mints no session. The UI now calls
   the canonical route, whose error codes match the form's existing handling.
8. **Legacy sign-in linkage preserved deliberately.** The `p.id OR p.member_id` join is
   retained so the repair narrows reachability and never widens it; no client who can
   sign in today loses access. Resolving that ambiguity belongs to a later unit.

**No migration. No schema change.** `client_invites` already carried `status`,
`expires_at`, `claimed_at` and A3-R2-R1's `practitioner_record_id`. Nothing in this unit
wanted one.

---

## 4. Guards — WITNESSED

`scripts/guards/a3-r3-r1-canonical-claim.mjs`, run with `node` (no toolchain dependency).
Comments are stripped before scanning: a file documenting its own compliance, or naming
the defect it closes, must not fail for saying so.

| Result | Run |
|---|---|
| **FAIL — 14 findings, exit 1** | against the pre-repair tree materialized from `087b7fa3` |
| **PASS — exit 0** | against the repaired tree |

The fourteen pre-repair failures, each naming a real defect:

- G-R1-1 ×2 — claim and sign-in mint a session without binding the slug as a predicate
- G-R1-1 ×1 — sign-in resolves the client before the practice via `LEFT JOIN`
- G-R1-2 ×5 — predicate omits `status = 'unused'`; omits expiry; no `RETURNING`; no
  exactly-one-row assertion; mutates invite state on a refusal path
- G-R1-3 ×4 — retired route still reads `client_invites`, hashes an invite code, writes
  portal credentials; UI still calls the retired endpoint
- G-R1-4 ×2 — canonical route does not resolve the booking email at all, and therefore
  cannot fail closed when none is on record

**G-R1-4 was added after the 2026-09-17 ruling** so that the booking-email binding cannot
quietly become optional again. It rejects the `invite.booking_email && …` shape anywhere
on the portal surface — the construction the retired duplicate used, which skips the
comparison exactly when there is nothing to compare. It is red against `087b7fa3` for the
reason above and green against the repaired tree.

**Each guard was red before it was trusted.** A guard that has never failed is an
assertion, not an instrument.

---

## 5. Statement-level falsification — WITNESSED, and deliberately not called the witness

A disposable PostgreSQL 16.13 cluster was initialized in an ephemeral scratch directory,
used, stopped, and destroyed. A minimal `client_invites` fixture carried only the columns
the consumption statement touches. Both the repaired and the pre-repair statements were
run against it, because **a test that passes for both implementations proves nothing.**

### Forced interleave — session B attempts while A holds the row lock uncommitted

| Statement | A won | B won | Total |
|---|---|---|---|
| **Repaired** | 1 | 0 | **1** |
| **Pre-repair** | 1 | 1 | **2 — double consumption** |

### Free race, eight independent connections on one invite

| Statement | Winners |
|---|---|
| **Repaired** | **1 of 8** |
| **Pre-repair** | **8 of 8** |

### Predicate terms

| Case | Rows affected | Expected |
|---|---|---|
| Expired invite | 0 | 0 |
| Already claimed | 0 | 0 |

**⚠ Scope of this result, stated so it cannot later be quoted as more than it is.**

This is **supporting evidence at statement level. It is NOT the database witness.** It
exercised the SQL, not the route handler; a synthetic fixture, not the production schema;
and an ephemeral cluster, not `maia_consciousness_test` owned by `maia_test_user`. The
Next.js handler could not be executed here at all — this environment has no
`node_modules`.

The founder ruling stands unchanged: **concurrency is proved through two independent
PostgreSQL connections against the route when the integration witness becomes available.**
What the table above establishes is narrower and still worth having: the predicate this
repair relies on admits exactly one winner where the pre-repair predicate admitted all
eight, and the discrimination is not a matter of opinion.

---

## 6. Type checking — partial, and not reported as a gate pass

`npm run typecheck` could not be run: this environment has no `node_modules`, so the
project's no-regression gate did not execute. **That is a statement about the
environment, not a pass.**

An isolated `tsc --strict --noEmit` over the three changed route files, with TypeScript
resolved into a scratch directory, produced:

- 9 × `TS2307` unresolved module — expected with no `node_modules`; not diagnostic
- 1 × `TS7006` `Parameter 'client' implicitly has an 'any' type`

The same `TS7006` appears at the same construct in the **pre-repair** file at `087b7fa3`,
verified by running the identical check against it. It is an artifact of the unresolved
`@/lib/db/postgres` import in an isolated check, not a regression.

**Zero new diagnostics. The project gate is OWED.**

---

## 7. Booking email absent — RAISED AS AN OPEN QUESTION, RULED 2026-09-17

Founder ruling: canonical `/claim` must require the normalized submitted email to equal
the client's existing booking email.

When `practitioner_clients.email` is null or empty there is nothing to equal. The repair
**fails closed** and refuses, because skipping the comparison would make the binding
optional for exactly the rows least able to prove identity — and an optional control is
the defect class this lane exists to refuse.

**As raised, this was reported and not resolved.** If practices legitimately issue invites
to clients with no email on record, fail-closed refusal is a behaviour change affecting
them, and a founder ruling was required on whether those invites need a different
ceremony. The alternative — skipping the check when the field is empty — reintroduces the
bypass and should not be adopted silently.

The paragraph above is kept as it stood when the question was raised. It is not edited to
read as though the answer had always been settled.

### Founder ruling, 2026-09-17 — FAIL CLOSED

> **Fail closed when no booking email exists.** The booking email is the identity anchor
> for this claim ceremony. If it is absent, the client must not be allowed to claim merely
> by supplying a new email. The practitioner must first establish or verify the client's
> email through a separate governed workflow, then issue a new invitation. That preserves
> D5 as a real control rather than an optional one.

**The ruling confirms the behaviour already landed at `ce5b9fd7`. No code change follows
from it.** The canonical route refuses when `practitioner_clients.email` is null or empty,
and the refusal is the same `email_mismatch` a wrong address receives — a refusal is not
an occasion to disclose which of the two conditions applied.

Two consequences are now settled rather than open:

1. **A claim may never establish the address of record.** Where no booking email exists,
   the missing step is upstream — the practitioner establishes or verifies the email
   through its own governed workflow and issues a fresh invitation. Claim consumes an
   identity; it does not create one.
2. **The absence of a governed email-establishment workflow is not a reason to weaken
   this control.** If that workflow does not yet exist, it is a gap in the practitioner
   surface to be opened as its own unit — never an argument for making D5 conditional.

⛔ This ruling does not authorize building that workflow, and it is not R3-R1's to build.

---

## 8. Owed before A3-I1 can witness this unit

Founder ruling, 2026-09-17: **closure is PROVISIONAL, not fully accepted, until the
environment-capable gates below run on the Mac Studio against published commit
`2bf7ba9b`** — without migrations, PR, merge, or deployment.

| # | Gate | State |
|---|---|---|
| 1 | `npm run typecheck` comparison against the exact parent, with dependencies installed | **OWED** — no `node_modules` in the authoring environment |
| 2 | `check-private-routes` · `check-member-owned-boundary` · `check-internal-imports` · `check:no-supabase` | **OWED** — none could run here |
| 3 | Route-level T1–T10 against `maia_consciousness_test` owned by `maia_test_user`, including the T3 database witness through two independent connections **against the route**, and T6 rollback under an induced mid-transaction failure | **OWED** |
| 4 | Closure record incorporates the no-booking-email ruling | **DISCHARGED** — §7, this commit |

⛔ **R3-R2 does not open until gates 1–3 return.** A provisional closure is not a closed
one, and the next unit may not inherit an unverified base.

---

## 9. Routed out — found, not repaired

`lib/coachField/invitation.ts` also transitions an invite to `status = 'claimed'`, and
its predicate carries no `status = 'unused'` term — the same defect class as F3. It
belongs to the coach-field lane. Repairing it here would widen this unit past F1/F2/F3,
and the lane that finds a defect does not thereby own it.

It is **declared** in the guard rather than excluded from it, so it stays visible. The
inventory may shrink by repair; a new consumer appearing there fails the guard.

---

## 10. Residue — WITNESSED

- Disposable cluster stopped and its data directory removed; no `postgres` process remains.
- Scratch pre-repair checkout and scratch TypeScript toolchain removed.
- Scratch directory permissions restored to their original mode.
- Repository working tree clean: no untracked or modified file remains.
- No secret value was printed, logged, committed, or written to any artifact. This unit
  read no secret; `PORTAL_INVITE_HMAC_KEY` belongs to R3-R4 and was neither invented nor
  installed.
- No production or shared-staging connection was opened. No migration was applied. No
  deploy, PR, or merge occurred.

---

## 11. Custody

The checkpoint `ce5b9fd7` was committed and **published to origin before any verification
ran**, per founder authorization, explicitly claiming no pass. A3-I1 was lost because it
was never pushed; this unit could not be lost the same way from the moment it existed.

**A3-R3-R1-RECONSTRUCTION STATUS: CLOSURE PROVISIONAL, NOT FULLY ACCEPTED · REPAIR LANDED ·
GUARDS LETHAL AND GREEN · STATEMENT-LEVEL FALSIFICATION WITNESSED · ROUTE-LEVEL WITNESS
OWED · TYPECHECK AND REPOSITORY GUARDS OWED · §7 RULED, FAIL CLOSED, NO CODE CHANGE ·
R3-R2 NOT OPENED · `lib/coachField/invitation.ts` ROUTED OUT AS SEPARATE SECURITY DEBT,
⛔ NEVER ABSORBED HERE · NO MIGRATION · NO PR · NO MERGE · NO DEPLOY · PRODUCTION
UNTOUCHED.**
