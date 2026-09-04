# SELF-ADDRESSED-RETURN-01 — TIER 1 SPEC · "Remember for me"

**Date**: 2026-09-04
**Status**: SPEC, **amended 2026-09-04 by founder review (§6)**. Authorized to build per ruling §8.9 (Tier 1 only).
**Governing ruling**: `docs/programme/SELF-ADDRESSED-RETURN-01_CONSTITUTIONAL_RULING_2026-09-04.md`
**Canon**: `RIGHT_TO_REMAIN_UNPOSSESSED.md` §3 · `MAIA_CANON_v1.1.md` · Sanctuary invariants (CLAUDE.md)
**Scope discipline**: Gentle rhythm, Walk with my practice, Responsive companion, Human connection, and the absence trigger are **NOT in this spec**. Build this loop, witness it, then stop.

---

## Purpose

> A member may ask Soullab to return something they deliberately chose, at a time they
> deliberately chose. **Delivery is fulfillment of that authored act, not a judgement that
> contact is warranted.**

That sentence is the acceptance test for every design decision below. Any behavior that makes
delivery contingent on the system's assessment of the member — including a *kind* assessment —
is out of scope and out of canon.

## Naming

Table `member_reminders`. **Not** `support_rhythm`, not `nudges`, not `engagement_*`.

Per founder boundary: naming the first object after the larger architecture would model the
Coaching Platform while the Anti-Drift freeze is binding (`COACHING-TEMPLATE-EXTRACTION-01`
named, not opened). The object is literally about the act. When the Coaching Platform lane
legitimately opens, this becomes *one implementation beneath* My Support Rhythm rather than
today's MAIA-side code having predicted the generic architecture.

---

## 1. Schema

**Migration**: `database/migrations/20260904000002_member_reminders.sql`

```sql
CREATE TABLE member_reminders (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id          UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,

  -- What the member pointed at. member_note = they typed it fresh, no source object.
  source_type        TEXT NOT NULL
                       CHECK (source_type IN ('memory_atom','daily_anchor','member_note')),
  source_id          UUID,

  delivery_at        TIMESTAMPTZ NOT NULL,
  channel            TEXT NOT NULL DEFAULT 'email' CHECK (channel = 'email'),

  -- The exact member-approved words. Snapshot at creation, never reconstructed.
  delivery_text      TEXT NOT NULL CHECK (length(delivery_text) BETWEEN 1 AND 2000),

  cancel_token       TEXT NOT NULL UNIQUE,

  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  cancelled_at       TIMESTAMPTZ,
  delivered_at       TIMESTAMPTZ,

  delivery_attempts  INT NOT NULL DEFAULT 0,
  last_error         TEXT,

  CONSTRAINT source_id_present_unless_note
    CHECK ((source_type = 'member_note') = (source_id IS NULL))
);

-- The worker's only index. Deliberately shaped like the only query it may run.
CREATE INDEX idx_member_reminders_due
  ON member_reminders (delivery_at)
  WHERE cancelled_at IS NULL AND delivered_at IS NULL;

CREATE INDEX idx_member_reminders_member ON member_reminders (member_id, created_at DESC);
```

### What is deliberately absent

```text
last_seen · days_absent · engagement_score · return_status
opened_then_returned · inferred_need · priority · recipient_email
```

The absence is load-bearing and R32-enforced (§4). A column that does not exist cannot be
read by a future well-meaning patch.

### Three departures from the founder sketch — flagged, not smuggled

| Added | Why it is required, not convenience |
|---|---|
| `cancel_token` | Ruling §8.8: stop/change must be reachable **from inside the delivered message**. Email cannot authenticate inline, so a cancel-only capability token is the minimum mechanism. It is cancel-only: presenting it can **remove**, never read or reveal. A control that requires returning to the app to disable is a retention mechanism. |
| `delivery_attempts`, `last_error` | Canon §4 (sacred refusal vs system failure): *failure pathways must be detected and reported, not absorbed into "the system is being sacred."* Without these, a broken sender is indistinguishable from a system correctly staying quiet — the exact confusion the canon names as the load-bearing discrimination. |
| **No `recipient_email` column** *(removal)* | The recipient is resolved server-side from `members.id` at send time and is never stored on the reminder, never read from a request body. Mirrors `lib/notifications/sendAuthority.ts`: the caller may request a delivery; the server determines who it may reach. Makes "send my reminder to someone else" structurally unrepresentable. |

**`delivery_at` is an absolute instant** (`TIMESTAMPTZ`). The member picks a local time; the
route converts once, at authoring. The worker never computes a time relative to anything.

---

## 2. Gesture route

`app/api/reminders/route.ts` — `POST` (create), `GET` (list own).
`app/api/reminders/[id]/route.ts` — `DELETE` (cancel).

Follows the established gesture-route idiom (`app/api/anchor/[id]/surface-preference`):
named, ownership-scoped mutations — not a generic PATCH surface.

**POST body**
```ts
{ sourceType: 'memory_atom' | 'daily_anchor' | 'member_note',
  sourceId?: string,
  deliveryAt: string,   // ISO-8601, must be in the future
  deliveryText: string  // exactly what they will receive; shown before they confirm
}
```

**Creation preconditions — all fail closed:**

1. `getAuthenticatedMember()`; no session → 401. `member_id` comes from the session, never the body.
2. **Ownership**: when `sourceId` is present, it must resolve to a row owned by this member. A
   member cannot schedule a return of someone else's material.
3. **Sanctuary (F7, absolute)**: the source object must not be sanctuary-derived. Nothing
   authored in a Sanctuary session may become future contact — including at member request
   during that session (CLAUDE.md Sanctuary invariant 6). Verified against the source table's
   sanctuary flag; if the flag cannot be determined, **refuse** rather than assume.
4. `deliveryAt` in the future; reject past instants rather than firing immediately.
5. `deliveryText` is stored **verbatim** as supplied and confirmed. No model call, no
   normalization beyond trimming, no template wrapping of the member's own words.

**No silent creation.** There is exactly one way a row appears in this table: this route,
under an authenticated member session, from an explicit member gesture. Specifically not from:
MAIA judging something important · an unfinished conversation · detected distress · inactivity ·
a practitioner acting on the member's behalf.

**DELETE** is ownership-scoped, immediate, idempotent, and requires no reason. Cancellation is
ordinary. Also reachable unauthenticated via `cancel_token` (§3.3) — cancel-only.

---

## 3. Delivery worker

`scripts/run-member-reminders-worker.ts`. Runs on an interval (pattern:
`scripts/run-comms-analysis-worker.ts`). **Almost stupid by design.**

### 3.1 The only query it may run

```sql
SELECT id, member_id, delivery_text, cancel_token
  FROM member_reminders
 WHERE delivery_at <= now()
   AND cancelled_at IS NULL
   AND delivered_at IS NULL
 ORDER BY delivery_at
 LIMIT 100;
```

Three predicates. **No JOIN. No subquery. No second table.** If the member said Tuesday at 9,
Tuesday at 9 is sufficient authority. This query is R32's primary evidence.

### 3.2 Loop

```text
claim (UPDATE ... SET delivered_at = now() WHERE id = $1 AND delivered_at IS NULL RETURNING)
  → resolve recipient from members.email by member_id
  → sendEmail({ purpose: 'reminder:self-addressed', triggerType: 'worker', memberId })
  → on failure: clear delivered_at, delivery_attempts += 1, record last_error
```

Claim-before-send: the conditional UPDATE is the concurrency guard, so two worker instances
cannot double-send. After **3 failed attempts** the row stops being retried and is surfaced as
a **failure**, never as silence (canon §4).

**Body = the member's stored text, plus provenance and controls only.** No model call. No MAIA
reasoning at delivery. No generated framing, greeting, or warmth around their words.

Required in every message: *when they wrote it* (provenance — ruling §4 growth-obligation),
a one-click **cancel scheduled reminders** link (`cancel_token`), and a link to manage all
reminders. Forbidden in every message: elapsed time since their last visit, any expression of
having noticed or missed them, any concern affect, any variation by how long it has been.

### 3.3 Absence-blindness is what makes the worker correct, not lazy

The worker must not ask whether the member has returned recently, and must not suppress a send
because they were here yesterday. **Suppression-on-return is absence-reading wearing a kind
face** (ruling F3). The system cannot see it either way — that is the property.

---

## 4. R32 — the mechanical proof

`tests/constitutional/refusal-registry/refusal-32-self-addressed-return-absence-blind.ts`,
registered in `index.ts`. Conforms to the `RefusalCheck` contract in `harness.ts`.

**Refusal claimed**
> The reminder system may know that a member asked for a future delivery. It may not know
> whether the member has been absent.

**Jurisdiction fields**
- `enforcedBy`: absence of any absence-derived read across the Tier 1 unit — the migration, `lib/reminders/**`, `app/api/reminders/**`, `scripts/run-member-reminders-worker.ts`.
- `violationAttempted`: find any import, query, column, or derivation of member presence/recency within the unit.
- `passingAuthorizes`: "Tier 1 cannot read absence."
- `passingDoesNotAuthorize`: any claim about other MAIA surfaces, about Tiers 1.5/2, or that absence data does not exist elsewhere in the platform.
- `hostileForkMustChange`: add a session/activity read to the unit, or widen the worker's selection query beyond its three predicates.

**Forbidden within the unit** (source-level, whitespace-tolerant): `last_seen` · `last_active`
· `last_activity` · `last_conversation` · `last_login` · `days_since` · `days_absent` ·
`session_recency` · `engagement` · `retention` · `returned_after`; and any reference to
`sessions` / `conversations` / `auth_sessions` / `agent_runs`.

**Positive assertions**: the worker's selection query contains exactly its three predicates and
no `JOIN`; the migration contains none of the absent-column names; the worker contains no model
/ LLM import (F2 mechanically enforced, not asserted).

### 4.1 Negative control (required)

`tests/constitutional/refusal-registry/fixtures/r32-negative-control.ts.txt` — a fixture that
deliberately performs a `last_seen` read. R32 **fails its own scan against the fixture** and
reports PASS only when the fixture is detected as a violation *and* the real unit is clean.

This is the difference between a gate and a claim. Without it, R32 could pass because its regex
silently stopped matching anything — a green light that proves only that the detector is
broken. **The negative control makes the refused organ structurally unavailable to this unit,
and proves the detector can still see it.**

---

## 5. Definition of done

1. Migration applied; `npm run typecheck` green (no-regression gate); `npm run preflight` clean.
2. `npx tsx tests/constitutional/refusal-registry/index.ts` — all prior refusals hold **and R32 PASSES with its negative control red.**
3. **One complete loop witnessed in production**, by a real member act: create → arrives at the chosen instant → text is exactly what was approved → cancel link works → cancelled reminder does not fire.
4. Witness record at `docs/programme/SELF-ADDRESSED-RETURN-01_TIER1_WITNESS_<date>.md`, naming what was verified and what was not.
5. **Then stop.** Gentle rhythm and Walk with my practice do not open on Tier 1 passing. They open by directive, on evidence from this loop.

### Not measured, by construction
Whether delivery brought the member back. There is no table, query, or dashboard for it, and
the schema cannot express it (ruling F4). If we ever learn it works, we will tune it.

### Stage language (per CLAUDE.md contact-fidelity progression)
Schema + route + worker existing = **reachable**. First member-authored reminder delivered
under real load = **verified**. Repeated use across members = **live**. Do not let the first
`delivered_at` row inflate into Live.

---

## 6. Founder review amendments (2026-09-04)

Five hardenings, all adopted. Two corrections to §1–§5 found while grounding them.

### 6.1 Cancel token — store a hash, and never cancel on GET

`cancel_token` → **`cancel_token_hash`** (`sha256` hex, UNIQUE). The opaque token exists in the
email and in the member's hands; the database holds only its hash. A database read cannot
reconstruct a working cancellation link.

**GET confirms, POST cancels.** Mail scanners, link previewers, and corporate security proxies
visit URLs automatically — a GET that cancels would let a scanner silently destroy the member's
instruction. `GET /api/reminders/cancel?t=<token>` renders a confirmation; `POST` performs it.
Lookup is by hash of the presented token, constant-time compared. Cancel-only: neither verb
ever discloses `delivery_text`, the schedule, or any other reminder.

### 6.2 Idempotent delivery — the largest gap in the original spec

Two workers racing, or the send succeeding while the claiming UPDATE fails, delivers the
member's own words to them twice. For a self-addressed message that is not a cosmetic bug: it
misrepresents what they authored.

Defence in depth, because neither layer alone is sufficient:

1. **DB claim** — `UPDATE … SET delivered_at = now() WHERE id = $1 AND delivered_at IS NULL RETURNING …`. Wins the race between workers.
2. **Provider idempotency key** — stable, derived, never random: `self-addressed-return/<reminder-id>`. Covers the case the claim cannot: vendor accepted, our write lost.

**Ground truth correction**: `sendEmail` already accepts `idempotencyKey`, but its own comment
is explicit that it is *"NOT yet a suppression key"* — today it becomes a provider **tag** and a
log field only, and is never sent to Resend. So this spec must **extend the provider boundary**:
add `idempotencyKey` to `ProviderEmailMessage` and have `ResendProvider` map it to Resend's
`Idempotency-Key` header (protection retained ~24h, per founder's citation). Vendor-neutral at
the boundary, vendor-specific in the adapter — the rule `lib/email/providers/types.ts` states.
The stale comment in `sendEmail.ts` gets corrected in the same change; leaving it would be a
worse defect than the gap, since a future caller would trust a guarantee that had silently
become real for one path only.

### 6.3 Retry window — a late message violates the authored act

> A reminder for Tuesday 9am must not arrive Thursday because the sender recovered.

New column **`delivery_deadline TIMESTAMPTZ NOT NULL`**, defaulting to `delivery_at + 6 hours`
in v1. The worker's due query gains no predicate for it — the deadline is evaluated at claim
time: past deadline → terminal `expired`, **never sent**. Silence is the correct outcome of a
missed window. Delivering late would substitute the system's judgement ("better late than
never") for the member's ("Tuesday at 9").

### 6.4 The identity seam — R32's precise boundary

§3 said "no second table" while §3.2 resolved the address from `members`. That contradiction is
exactly where an absence-read gets rationalised in later. Named precisely:

> **Due-selection** reads `member_reminders` alone: three predicates, one table, no JOIN.
> **Delivery** performs exactly one further lookup — `SELECT email FROM members WHERE id = $1` —
> the *delivery address for a member already determined to be due*.

The seam is **identity and delivery address only**. Session recency, activity, last-seen, return
state, engagement: refused, and refused whatever table they live in. R32 asserts the shape of
the permitted lookup (single column, single table, `WHERE id = $1`), not merely the absence of
forbidden names — otherwise the seam is a hole shaped like whatever a future patch selects.

### 6.5 Typed failure telemetry — `last_error` is not narrative

`last_error TEXT` → **`failure_code TEXT`** + **`failed_at TIMESTAMPTZ`**, from a closed set:

```text
no_recipient · provider_unconfigured · provider_rejected · quota_exceeded · expired · unknown
```

No provider prose, no member email, no reminder text — provider messages can echo the payload,
and free-text columns accrete content. Vendor detail belongs in logs (which already classify it),
not in a row beside the member's words.

**`delivery_attempts` is operational evidence and must never become an engagement signal.** R32
asserts it is read only by the worker's own retry logic, and never joined to member behaviour.

### 6.6 Correction — Sanctuary needs no flag check, and there is a real gate the spec missed

§2 precondition 3 said to verify a "sanctuary flag" on the source table. **No such flag exists**,
and its absence is correct: Sanctuary is enforced at the *write* boundary
(`lib/sanctuary/turnPosture.ts` `contentWritable()`, refusal **R21**) — sanctuary content never
becomes an atom or an anchor at all. So a row in `member_memory_atoms` is *already* proof of
non-sanctuary origin. Tier 1 inherits that boundary; inventing a redundant flag check would have
implied a guarantee this unit does not itself provide.

For `member_note`, the member types their own words. That is an authored act, not an extraction,
and detecting whether they had chosen to re-type something from a sanctuary session would require
reading sanctuary — which is itself the violation. **No check. Stated, not silently omitted.**

The real gate, which §2 missed: **`sacred_protected` atoms may not become reminders.** An atom
carrying the `sacred_protected` register is excluded from ambient recall by R04; scheduling one
into the member's inbox would route around that exclusion through a different door. Creation is
refused, fail-closed, with the same SQL-level predicate idiom R04 uses.

### 6.7 Amended schema delta

```sql
cancel_token       TEXT NOT NULL UNIQUE   →  cancel_token_hash  TEXT NOT NULL UNIQUE
last_error         TEXT                   →  failure_code       TEXT CHECK (failure_code IN (...))
                                          +  failed_at          TIMESTAMPTZ
                                          +  delivery_deadline  TIMESTAMPTZ NOT NULL
```

Everything else in §1–§5 stands: text frozen at creation · source provenance retained · Sanctuary
fails closed (now by inheritance, correctly named) · no suppression on return · no model call at
delivery · R32 passes only when the negative control is caught · production witness ends the unit
· Gentle Rhythm unopened.

---

## 7. Second founder review (2026-09-04) — cancel-secret lifecycle, R32-A/B/C

### 7.1 Cancel-secret lifecycle — decided

The rotation question was real: `HMAC(secret, reminderId)` means a rotation invalidates links
already sitting in members' inboxes. **Both** proposed remedies are adopted, because they solve
different halves:

- **A dedicated secret**, `SELF_ADDRESSED_RETURN_CANCEL_SECRET` — never the general app secret,
  whose rotation cadence is driven by unrelated concerns and would silently revoke members'
  cancellation authority as a side effect of routine hygiene.
- **A versioned keyring**: `cancel_token_version SMALLINT NOT NULL DEFAULT 1` on the row, with
  `..._PREVIOUS` / `..._PREVIOUS_VERSION` env vars. Current signs new reminders; previous stays
  derivable for already-issued links.

Verification needs no secret at all — lookup is by stored hash — so rotation affects only
*deriving* a token for an outbound email. A reminder whose version matches neither key fails
**closed** with typed code `cancel_secret_unavailable` and is never sent: a message the member
cannot cancel is not one we may deliver. Re-signing under the current key is explicitly refused,
because it would mint a token that does not match the stored hash — the member's link would fail
at the moment they tried to use it.

**Rotation procedure**: move the live value to `..._PREVIOUS` with its version → set the new
value and bump `..._VERSION` → retire the previous key only once no undelivered reminder still
carries its version.

### 7.2 R32 proves three separate propositions

| | Proposition | Enforced as |
|---|---|---|
| **R32-A** | due selection is absence-blind | ratified predicates present · one table · no JOIN · no absence identifier anywhere in the unit |
| **R32-B** | the identity seam is narrow | **exactly one** read of `members`, pinned by SELECTED COLUMN: `SELECT email FROM members WHERE id = $1`. `SELECT *` fails, and a second read of `members` fails |
| **R32-C** | delivery result cannot become engagement evidence | no `opened` / `clicked` / `visited_after` / `returned_after` / `response_to_reminder` / `conversion*` / `engagement_delta` in unit or schema |

R32-B pins the column because table-name-only matching would let `SELECT * FROM members` stay
cosmetically green while exposing `last_login`, session timestamps, and every state field.

**Detector correction**: the original identifier set was snake_case only. The tempting
implementation is written in application code, not SQL — `member.lastActiveAt > reminder.createdAt`
— and would have passed straight through. camelCase forms are now first-class patterns.

### 7.3 Negative control — the considerate-suppression shape

The fixture now sabotages all three propositions, written as the *tempting considerate
implementation* rather than an obvious violation:

```ts
if (member.lastActiveAt > reminder.createdAt) {
  return { skipped: 'member_already_returned' };
}
```

That is the exact future rationalization the refusal must survive: *"we're not monitoring them,
we're just avoiding bothering them."* It still requires the observing organ. R32 reports PASS
only when all three sabotages are caught, including this one by its camelCase name.

### 7.4 Verification performed this session

| Check | Result |
|---|---|
| Refusal registry | **108 passed · 5 failed · 24 refusals** — R32 green on all 7 assertions. Baseline before this work: 101 passed · 5 failed · 23 refusals. **Zero new failures.** |
| R32 live sabotage — considerate suppression in the real worker | **RED** (`last_seen, lastActiveAt`) |
| R32 live sabotage — `SELECT *` identity seam | **RED** (`identity lookup selects *`) |
| R32 live sabotage — engagement telemetry | **RED** (`opened =, engagement_delta`) |
| Idempotency propagation to the vendor request | **5/5 pass**; with propagation removed, **3 fail** — the test catches the defect it exists for |
| Cancel-token rotation lifecycle | **12/12 pass** |
| Existing email suite (regression) | **48/48 pass** |
| `npm run typecheck` (no-regression gate) | **clean** — 230 errors vs 239 baseline, no regressions |

### 7.5 Finding outside this unit — R19 and R21 are currently RED

The 5 pre-existing registry failures are **R19** (legacy oracle lane) and **R21** (Sanctuary store
boundary). Every one reports `@NaN` line numbers, which points at broken locating logic in those
checks rather than a demonstrated breach — but *that distinction is exactly what is not currently
provable.*

This matters to this spec specifically. **§6.6 grounds Tier 1's sanctuary safety on inheritance
from R21**: sanctuary content never becomes an atom, so a row in `member_memory_atoms` is proof of
non-sanctuary origin. While R21 is red, that inheritance rests on an *unproven* refusal.

It does not block Tier 1 — this unit adds no sanctuary write path and no new exposure — but the
stated basis for §6.6 is weaker than the spec claims until R21 is green. **Named, not absorbed.**
Repairing R19/R21 is separate work and must not be folded into this unit.

### 7.6 Remaining before the production witness

- **Integration tests against a real database** — creation ownership, the `sacred_protected`
  refusal, cancel idempotence, claim-before-send under concurrency. Not runnable in this session
  (no database), and **not simulated**: a mocked integration test would assert the mock.
- Worker service registration in `docker-compose.production.yml`.
- `SELF_ADDRESSED_RETURN_CANCEL_SECRET` provisioned in production.
- A member-facing surface for the gesture (API is complete; UI is not in this unit).
- **Then** the production witness, then STOP.
