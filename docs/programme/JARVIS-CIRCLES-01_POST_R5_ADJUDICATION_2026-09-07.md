# Post-R5 founder adjudication — A … G

**Candidate in:** `6bc74a476` · **Status:** A–F IMPLEMENTED · ⛔ **G NOT RUN** (no database or
dependencies in a remote session).

## The preserved failing run

```text
42 passed · 3 failed · 0 warned · 0 skipped
42/44 required obligations discharged   →   exit 1
```

**INSTRUMENT failure, not a product-boundary failure.** T7a–T7f all passed. T7f provokes a UNIQUE
violation, catches it in TypeScript — and leaves the shared Group-T transaction **aborted**, so T5
and T6 never execute. **FR-14 caught it.** A founder probe with savepoints, no product change,
reached `44/44 · 0 failed`.

> The coverage law earned itself here. Under the old rule this would have read as a smaller suite
> that happened to be green.

---

## A · Instrument correction

`expectViolation(tx, savepoint, sqlstate, sql, params)` — SAVEPOINT → attempt → on success **FAIL**
→ on error require the **exact SQLSTATE** → ROLLBACK TO → RELEASE. Applied to **both** T7f and T6.

⛔ **An arbitrary SQL error is not proof that an invariant held.** A typo, a missing column or an
already-poisoned transaction would all have "passed" the old catch-anything probe. `23505` for the
uniqueness probes; `23514` for the new CHECK probes.

## B · Withdrawal tombstones the payload (FR-15)

Migration **amended in place** — it had reached no durable database, so there is no window in which
payloads were retained. `response_text` and `response_type` become nullable, the type CHECK re-states
to admit NULL, and a **schema invariant** makes the two states non-drifting:

```text
LIVE       withdrawn_at NULL      payload NOT NULL
WITHDRAWN  withdrawn_at NOT NULL  payload NULL
```

⛔ No hash, digest or length retained. `response_type` nulled too — *reflection/witness/offering* is
authored semantic information about what the person contributed.

## C · Boundary cascade (FR-16)

`leaveCircle()` and `removeMemberWithClient()` now tombstone the member's live responses **inside
their existing atomic transactions**, before membership standing changes.

**The gap was real and unfixable by the member:** a response stayed visible after leaving, and
`withdrawResponse()` requires an active membership — so **nobody** could remove it.

⛔ Not proxy withdrawal. **AUTHOR WITHDRAWAL** is continuing consent exercised; **BOUNDARY CASCADE**
is the representation losing field eligibility because the relationship ended. Scoped to one Circle.

## D · P2 accepted

`B-04 = RESOLVED AS PROVENANCE.` Surviving authority: the 2026-07-17 code record, the contained
runtime, verifier **C4**. The preservation-audit inconsistency is **transferred out** as **CA-16**
— falsify the full 281-entry inventory against the actual branch before any deletion is authorized.
⛔ That audit is not edited from this lane, and CA-16 does not block it.

## E · `integrating` retired (FR-17)

`InquiryStatus = 'open' | 'closed'`; `closeInquiry()` always closes; synthesis is an optional
property, displayed from `field_synthesis != null`. Migration converts existing rows and tightens
the CHECK. `FieldMemory.tsx` now fetches once and derives the label.

⛔ **Scope boundary held — verified at all four sites:** `FieldPhase` · `derivePhase()` ·
`FieldPresence` · Circles-page labels are **byte-identical**. Asserted by **C18**, so a future edit
cannot quietly sweep them in.

## F · Coverage floor: 54

New: **C17** (retired status gone from type and writer) · **C18** (FieldPhase untouched) ·
**C19** (leave cascade wired) · **T7g** (tombstone: fact survives, payload does not) ·
**T7h** (a withdrawn response cannot regain a payload) · **T8a/T8b** (leave and removal cascades) ·
**T8c** (cascade never reaches another Circle) · **T9a** (database rejects the retired status) ·
**T9b** (closed + synthesis is representable).

**Floor and emitted set cross-checked: 54 = 54, no orphans in either direction.**

## G · Gate — NOT RUN

Requires, on a disposable shadow, migrations applied **in order**:

```text
20260906000003_circle_membership_removals.sql
20260907000001_circle_inquiry_response_withdrawal.sql          (amended — tombstone)
20260907000002_circle_inquiry_status_retire_integrating.sql
```

Then: **every required obligation PASS · 0 failed · 0 required WARN/SKIP/MISSING** · fixture
rollback · shadow and worktree deleted · production unmigrated, undeployed, founder-gated.

## Return state

```text
P1–P5        A–F implemented on candidate; NOT VERIFIED from this session
VERIFY       not run here — last founder run 42/44, instrument-corrected since
PRODUCTION   unchanged — no migration, no deploy, founder-gated
INVOKE       NOT STARTED (readiness is not Jarvis's to declare)
DEPLOY       NOT AUTHORIZED
COHORT       NOT AUTHORIZED
```
