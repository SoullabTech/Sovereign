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

---

## 8. Third founder review (2026-09-04) — retention, retry bound, pre-delivery cancellation, local Sanctuary proof

### 8.1 Cancel-key RETENTION, not merely "previous"

`current + previous` holds across exactly one rotation; a reminder scheduled far enough ahead
outlives two. Adopted the first option — **retain every version while a live reminder references
it**:

> **A cancel key may be retired only when no live reminder depends on that version.**

Member cancellation authority decides when a key may disappear, not infrastructure hygiene.

- Keyring is now `SELF_ADDRESSED_RETURN_CANCEL_KEYS` (JSON `{version: secret}`) +
  `..._CURRENT_VERSION`; the single-key form remains for simple deployments.
- **`scripts/check-cancel-key-retention.ts`** answers which versions live reminders still depend
  on, which are safe to retire, and exits non-zero if a retirement already stranded someone. Run
  before retiring a key and in the deploy gate after a rotation.
- A version no longer in the keyring fails **closed** (`cancel_secret_unavailable`) — the worker
  refuses to send rather than deliver a message the member has no way to stop.

### 8.2 Retries bounded by the provider's idempotency window

The dangerous sequence named in review: *send succeeds → process dies before the write commits →
a much later retry finds the vendor no longer remembers the key → the member receives their own
words twice.*

- `first_attempt_at` records when we first tried. The retry bound is measured from it, not from
  `delivery_at`, because the risk being bounded is duplication at the vendor.
- `PROVIDER_IDEMPOTENCY_WINDOW_HOURS = 24` (a property of Resend, recorded rather than chosen);
  `RETRY_HORIZON_HOURS = 12` — **half** the window, so clock skew, queue lag and a slow batch
  cannot erode the margin.
- Past the horizon: terminal **`delivery_uncertain`**. The outcome is genuinely unknown, and the
  code says so rather than gambling on a duplicate of the member's own words.

The 6h `delivery_deadline` and the 12h retry horizon are **different invariants** and both stand:
the deadline protects the member's authored time, the horizon protects against duplication.

### 8.3 Pre-delivery cancellation — the real gap

Correct catch, and a functional defect rather than a documentation one. Tier 1 is one-shot, so a
cancel link appearing **only** in the reminder email arrives at the same moment as the act it
would cancel — it cannot evidence that the member could stop it beforehand.

Two pre-delivery surfaces now exist:

1. **Authenticated**: `GET /api/reminders` (their own list) → `DELETE /api/reminders/[id]`.
2. **`lib/reminders/confirmation.ts`** — a scheduling confirmation sent at CREATION carrying the
   tokenised cancel link. It states what was scheduled and when, and nothing else: no
   encouragement, no reassurance, no comment on the choice.

Best-effort by design: a failed confirmation must not void a reminder the member successfully
authored, and DELETE remains available regardless — but the failure is logged, never swallowed.
It carries a **distinct** idempotency key from the delivery, so confirming can never suppress
delivering at the vendor.

### 8.4 Sanctuary — proven locally, no longer citing R21

Adopted the second option: **prove Tier 1's source eligibility locally**, so the broken global
detector is a separately queued defect rather than a hole in this unit's evidence chain.

The proposition, now pinned as **R32-D**:

> Every source class Tier 1 admits is written **only by an explicit member gesture**, never by
> the conversation-turn persistence path that Sanctuary posture governs.

| Source class | Local proof |
|---|---|
| `member_note` | The member types it in the gesture itself. No stored source object exists, so no Sanctuary path can reach it. |
| `memory_atom` | `member_memory_atoms` is written only by `app/api/studio/with-me/sessions/[sessionId]/route.ts` and `lib/psyche/portfolio.ts` — member-keep gestures. |
| `daily_anchor` | `member_daily_anchors` is written only by `app/api/anchor/today/route.ts` — the member's own anchor gesture. |

Sanctuary posture governs turn stores (TurnsStore, corpus callosum, `conversation_history`).
Neither source table is written by that path. R32-D enumerates the permitted writers, so **adding
a turn-path writer to either table turns it red** and the local proof must be re-established
before Tier 1 may rely on it. Tier 1 no longer cites R21 as evidence.

### 8.5 R32 is now four propositions

**R32-B was widened** to scan the whole unit rather than only the worker, because the scheduling
confirmation resolves an address at creation time too — a seam narrow in one file and wide in
another is not narrow. Both reads are pinned to `SELECT email FROM members WHERE id = $1`.

### 8.6 Verification performed

| Check | Result |
|---|---|
| Refusal registry | **109 passed · 5 failed · 24 refusals** — R32 green on all 9 assertions; the 5 remain the pre-existing R19/R21 defects |
| R32-B sabotage via the *confirmation* path (`SELECT *`) | **RED** — the widened scope catches it in the route, not just the worker |
| R32-D sabotage (turn-path writer added to a source table) | **RED** |
| Keyring across two rotations, retention, fail-closed, malformed input | **19/19 pass** |
| `lib/reminders/` + `lib/email/` suites | **92/92 pass, 9 suites** |
| `npm run typecheck` | **clean, no regressions** |

### 8.7 Remaining sequence to closure

```text
real DB integration tests
→ concurrent-worker / idempotency proof (two workers, same reminder)
→ cancel-key retention proof
→ pre-delivery cancellation surface exercised end to end
→ worker registration in docker-compose.production.yml
→ production secret provisioning
→ member-facing gesture UI
→ R32 A/B/C/D green + sabotage red
→ one real member production loop
→ witness record
→ STOP
```

**The production witness must positively prove**: created by member → exact approved snapshot
persisted → due without reading absence → delivered **once** at the authorized time → current
member email resolved through the narrow identity seam → **pre-delivery** cancellation works →
cancelled reminder never sends.

No return measurement. No "helpful" suppression. No next support tier.

---

## 9. Fourth founder review — atomic dispatch authority (settled, proven)

The operational contract settled before worker registration. Provider idempotency prevents a
duplicate *email*; it says nothing about two workers both believing they own a reminder, and
nothing about the race pre-delivery cancellation introduced — the member clicking Cancel at the
moment a worker begins sending.

### 9.1 The state machine

```text
PENDING
   ↓  claimDue()        atomic lease (FOR UPDATE SKIP LOCKED). Member may STILL cancel.
CLAIMED
   ↓  beginDispatch()   ← THE LINEARIZATION POINT
DISPATCHING             cancellation is now genuinely too late
   ↓  markDelivered()
DELIVERED
```

`lib/reminders/dispatch.ts` owns it. Columns added: `claimed_at`, `claim_token`,
`claim_expires_at`, `dispatch_started_at`.

**`beginDispatch` re-checks every condition inside one atomic UPDATE** — same claim, not
cancelled, not delivered, not already dispatching, deadline valid, retry horizon valid. Notably
`cancelled_at IS NULL` is re-checked *there*, not merely at claim time: that is what makes a
cancellation racing a send resolve one way or the other, never both.

**The lease expires** (5 min), so a worker that dies between claiming and dispatching cannot hold
a member's reminder hostage. Throughout the lease the reminder remains cancellable, because
CLAIMED is internal bookkeeping and carries no authority over the member.

**Cancellation is conditional and TRUTHFUL.** `cancelIfNotDispatching` returns `cancelled` |
`already_sending` | `not_found`. `already_sending` is not an error — it is the honest report that
the send began and an email cannot be recalled. Both the authenticated route (409 + plain
language) and the emailed token link say so. *We do not sell a cancellation that did not happen.*

Four **database** CHECK constraints make the ordering structural rather than a worker convention:
dispatch requires a claim · delivery requires a dispatch · a claim is all-or-none · **cancelled
XOR dispatched** (a row can never be both).

### 9.2 R32-A followed the query rather than passing vacuously

Moving due-selection into `dispatch.ts` turned R32-A **red** — "due-selection query not found" —
rather than green-by-absence. Repointed at the new home, and **strengthened**: a second assertion
now proves the *entire* dispatch contract (claim, dispatch, deliver, release, fail, cancel)
touches only `member_reminders`. The reminder's lifecycle never consults the person.

One detector bug found and fixed while doing it: `FOR UPDATE SKIP LOCKED` matched the
table-name pattern and reported "skip" as a table. Fixed in the detector, not waived by an
allowlist.

### 9.3 Real-database proof — `scripts/verify-reminders-dispatch.ts`

Run against a live Postgres 16 (UTF8). **Nothing mocked** — a mocked concurrency test asserts
the mock.

| # | Case | Result |
|---|---|---|
| 1 | Two workers claim one due reminder | exactly one leases · exactly one dispatch transition · attempts incremented once |
| 2 | Crash before dispatch | held lease blocks re-claim · **member can still cancel** · expired lease becomes claimable |
| 3 | Crash after provider success, before `delivered_at` | `first_attempt_at` survives · retry permitted inside the horizon under the same idempotency key |
| 4 | Retry crosses the 12h horizon | dispatch refused · `delivery_uncertain` · never sent |
| 5 | Cancel races a claim | cancellation wins · worker cannot dispatch |
| 6 | Cancel after dispatch began | `already_sending` on both surfaces · row **not** falsely marked cancelled |
| 7 | Authored-time deadline passed | dispatch refused · never delivered late · `expired` |
| — | Invariant sweep | no row both cancelled and dispatched · no delivery without dispatch · live table carries no absence or engagement column |

**28 passed · 0 failed.**

### 9.4 Full verification state

| Check | Result |
|---|---|
| Dispatch integration proof (real DB) | **28/28** |
| Refusal registry | **110 passed · 5 failed · 24 refusals** — R32 green on 10 assertions; the 5 remain the pre-existing R19/R21 defects, explicitly outside this unit |
| `lib/reminders/` + `lib/email/` | **92/92**, 9 suites |
| `npm run typecheck` | clean, no regressions |

### 9.5 Remaining to closure

```text
worker / service registration in docker-compose.production.yml
→ production secret + keyring provisioning
→ member-facing "Remind me of this" gesture
→ PR / sovereignty gates
→ deploy exact accepted SHA
→ one founder-visible production act
→ witness record
→ STOP
```

**The witness must prove PRESENCE, not merely absence of errors**: member authors reminder →
approved snapshot frozen → confirmation arrives → cancellation works before dispatch →
uncancelled reminder becomes due without any absence read → current address resolved through the
narrow identity seam → **exactly one** email at the authorized time with **exactly** the approved
words → no return or engagement observation exists.

**Gentle Rhythm stays closed.** This loop stands on its own before anything is generalized from it.

---

## 10. Time contract, registration, provisioning, gesture (2026-09-04)

### 10.1 The delivery contract — what we can actually keep

> **A reminder is never sent before the member's chosen time. After that time, it is
> dispatched within the published delivery window.**

Email cannot guarantee arrival at an exact second, so *"arrives at the chosen instant"* is
explicitly **not** an acceptance criterion. Worker cadence is 60s, stated to the member as
**"sent shortly after the time you chose."** Promising a precise instant would be a claim we
cannot keep, which is a claim-discipline failure before it is an engineering one.

The floor is enforced twice: `delivery_at <= now()` in the claim query, and **re-asserted at the
linearization point**, so the guarantee does not rest on the claim query alone. Proven by case 8:
a forged valid claim on a future reminder is still refused (`not_yet_due`).

### 10.2 Time meaning — an authored act, not a scheduling system

| | |
|---|---|
| Member chooses | a local date and time |
| Creation resolves it | **once**, to an absolute `delivery_at` |
| `delivery_timezone` retains | the IANA zone authored in (`America/New_York`) |
| Later travel or DST | does **not** move this one-shot reminder |

The confirmation renders in the authored zone — *"Tuesday, September 8 at 9:00 AM EDT"* — so it
states what was authorized rather than re-deriving a local time from wherever the member happens
to be when they read it. An unknown zone is **refused at creation**, never silently replaced with
UTC, because a substituted zone misreports what the member authorized.

### 10.3 Worker registration

`maia-reminders-worker` in `docker-compose.production.yml`: same image, different entrypoint,
`.env.production`, DB healthcheck, `maia-internal` network. **No member or activity source is
configured, and none may be added.** Multiple replicas are safe — the lease plus single
linearization point handle concurrency (proven, case 1). The service comment carries the
constitutional note and links the ruling, so the next person to touch it reads why before how.

### 10.4 Keyring provisioning — `scripts/verify-reminders-config.ts`

Verifies the deployment can honour cancellation authority **before** any reminder is scheduled
against it: keyring configured, active version explicitly resolved and present in the ring,
Resend key present, app URL set. Fails closed with *"do NOT deploy the reminders worker."*

**Secrets are never printed — not even truncated**, since a partial secret in a deploy log is
still a disclosed secret. Two tests pin that failure messages name the *version* and never the
key material.

### 10.5 Member gesture

`components/reminders/RemindMeOfThis.tsx` — before committing, the member sees the exact text
that will be sent, the date, the time, the timezone, and the channel. **No MAIA-generated
embellishment**: no suggested wording, no warmth composed around their words, no encouragement.
After creation: *"Scheduled for Tuesday, September 8 at 9:00 AM EDT · You can cancel it anytime
before sending."*

`app/maia/reminders/page.tsx` — the authenticated pre-delivery cancellation surface. It states
what is scheduled and lets them stop it. Nothing on it counts anything. An `already_sending`
result is reported truthfully rather than as a cancellation that did not happen.

### 10.6 Gate state at this head

| Gate | Result |
|---|---|
| R32 A–D | **green, 7 assertions** · negative control caught on all three propositions · 14 files scanned |
| Real-DB dispatch proof | **32/32** (9 cases + invariant sweep) — ⚠️ **superseded, see correction below** |
| Reminders + email suites | **94/94**, 9 suites |
| Provider idempotency propagation | included above; fails 3/5 when propagation removed |
| Key retention / rotation | included above |
| `npm run typecheck` | clean, no regressions |
| `npm run check:no-supabase` | clean |
| Refusal registry overall | **110 passed · 5 failed · 24 refusals** — the 5 are the pre-existing R19/R21 detector defects |

#### Correction (2026-09-04) — the 32/32 above was not reproducible when written

The `32/32` row is **left standing as the record of what was claimed**, and is superseded rather
than erased.

`scripts/verify-reminders-dispatch.ts` could not reach its first assertion against a database
carrying the canonical schema. Its fixture ran `INSERT INTO members (email) …`, but
`members.passkey` is `NOT NULL` in `20260103000001_members.sql` and **no later migration relaxes
it** — `maia_consciousness` reports `is_nullable = NO` as well. Every run therefore aborted at
`23502` before case 1. The count was asserted; the run behind it was not reproducible.

The fixture now supplies the full required tuple (`passkey`, `username`, `password_hash`), and the
suite passes **32/32 against real PostgreSQL 17.7 / UTF8**. The verifier additionally refuses to
execute unless `current_database()` names a disposable database — it issues unqualified
`DELETE FROM members`, and previously carried no guard on its target.

**§7.6 is now proved rather than written**: 34/34 integration · 32/32 dispatch · 115/115 registry,
all from one fresh database built from the three-migration chain. Full provenance:
`docs/programme/SELF-ADDRESSED-RETURN-01_SECTION_7_6_INTEGRATION_WITNESS_2026-09-04.md`.

### 10.7 Remaining — in order

1. **R19/R21 detector repair lands first, as a separate PR.** SAR's base must contain the repaired
   harness before final acceptance, so this feature PR does not carry known false constitutional
   reds. Queued as its own task; **not** folded into this unit.
2. PR + sovereignty gates for the member-facing surface.
3. Deploy the exact accepted SHA.
4. **One founder-visible production witness**, proving PRESENCE:

```text
member explicitly selects a source
→ sees and approves the exact snapshot
→ schedules a future time
→ confirmation arrives
→ pre-delivery cancellation demonstrably works
→ second uncancelled reminder becomes due
→ no absence/activity read occurs
→ only one worker obtains dispatch authority
→ current email resolved through the narrow seam
→ email is NOT sent before delivery_at
→ exactly one copy is sent
→ exact approved words arrive
→ no return/engagement observation is written
```

5. Witness record → **close SELF-ADDRESSED-RETURN-01**.

**STOP there.** No Gentle Rhythm, no adaptive support, no generalized Coaching Platform work.
