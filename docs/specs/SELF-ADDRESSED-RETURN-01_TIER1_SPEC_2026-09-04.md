# SELF-ADDRESSED-RETURN-01 — TIER 1 SPEC · "Remember for me"

**Date**: 2026-09-04
**Status**: SPEC. Authorized to build per ruling §8.9 (Tier 1 only).
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
