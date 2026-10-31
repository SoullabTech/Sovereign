# HOUSE-ENTRANCE-01 — Professional access grant: design candidate

**Status:** DESIGN CANDIDATE for founder review. ⛔ No migration, table, route, webhook change or backfill is authorized or created by this document.
**Occasion:** founder ruling 2026-10-30 (design brief §9): full Pro Studio access may come through four canon paths — paid, scholarship, Practice Exchange, apprenticeship — and `members.tier = 'pro'` proves none of them.
**Governs:** `docs/canon/MAIA_SANCTUARY_ECONOMY.md` (practitioner paths, 20–30% supported-seat cap) · ADR-010 · Ganesha #1807 (independent authorization axes) · Pro Reflect #1816 hold.
**Style precedent:** write-once authority records with states derived from positive facts (S3 `ask_authorization_acts` / consumptions) — not the older mutable `revoked` flag (`auth_sessions`), because a flag is exactly the weakness being repaired.

## 1. What the record is — and is not

**Is:** the durable fact that *a specific human act or verified payment authorized this member to enter the Pro Studio professional workspace, by which path, for what term.*

**Is not:** a client-data permission, a Co-lab membership, a Relationship Space consent, a billing record, a role, or a price. Those are independent axes (#1807) and each keeps its own authority. ⛔ No permission columns: the table's *only* meaning is workspace entry. A future "while we're here, also grant X" must fail structurally, not by discipline.

**Exploration (learn-and-try) creates no row.** Absence of a grant *is* the exploration path — which is why it cannot count toward the supported-seat cap and cannot be mistaken for a fifth membership.

## 2. Shape (two write-once tables; no status column)

`professional_access_grants` — one row per authorizing fact, **never updated** (trigger refuses every UPDATE):

| Column | Meaning |
|---|---|
| `id` | opaque grant identity |
| `member_id` | who is authorized (FK `members`) |
| `path` | `paid` \| `scholarship` \| `exchange` \| `apprenticeship` (CHECK; the four canon paths, nothing else) |
| `effective_from` / `effective_until` | the term; `until` is **required** for every path (see §4) |
| `source_kind` + `source_ref` | provenance: paid → Stripe subscription id **and** Stripe period; others → a steward act reference |
| `granted_by` | `system:stripe-webhook` or the stewarding member's id; ⛔ never the grantee |
| `granted_at` | when the fact was recorded |

`UNIQUE (source_kind, source_ref, effective_from)` makes webhook redelivery and double-clicks **idempotent** (`INSERT … ON CONFLICT DO NOTHING`).

`professional_access_revocations` — write-once, `grant_id UNIQUE`: `revoked_at`, `revoked_by`, `reason_class` (`refund_or_dispute` \| `steward_decision` \| `member_request` \| `term_breach`). Revocation is a **separate fact**, so a grant's history is never rewritten.

**Current access = a derived predicate, never a stored state:** `effective_from <= now < effective_until` **and** no revocation row. Expiry is a predicate, not a delete — **no pruning job may touch these tables**, or a lapsed or revoked grant could vanish and be re-read as never having existed.

## 3. Where each path's grant comes from

| Path | Source of the fact | Term |
|---|---|---|
| Paid | Verified Stripe webhook; term from the **real Stripe period end** (retrieved from the subscription object), one row per billing period | per period; renewal = a new row |
| Scholarship | A steward act (named steward, recorded reference) | canon: 3–6 months, renewal not automatic |
| Practice Exchange | A steward act + reference to the agreement | canon: 2–3 months, renewable by mutual consent |
| Apprenticeship | A steward act + cohort reference | canon: 3–6 month cycle |

Cancellation at period end needs **no write** — no new row is created and access ends at `effective_until` (graceful, no cliff). Refund/dispute writes a revocation. This replaces today's *estimated* expiry (now + 1 month/year) with a Stripe-verified one.

## 4. Why `until` is mandatory

Every canon path is term-bound (scholarship 3–6 mo, exchange 2–3, apprenticeship 3–6, paid per period). An open-ended grant would be the silent-permanent-access defect: nobody decides to keep it and nobody can see it lapse. Renewal is always a new, attributable act.

## 5. The supported-seat cap becomes measurable

The 20–30% cap (scholarship + exchange + apprenticeship-scholarship seats over current professional seats) is a **derived query over current grants by `path`** — nothing stored, nothing editable. Paid grants and exploration never count. A steward act that would exceed the cap is refused at the act boundary (cap is a rule over the same derived set).

## 6. How it connects to the entrances

`resolveProStudioEntrance()` receives `proStudioEntitlement: 'verified'` **only** when the server-side reader `resolveProfessionalAccess(memberId, now)` finds a current grant. It reads the grant tables and **nothing else** — never `members.tier`, never a practitioner row, never `studioMode`. A grant opens the workspace door only; it confers no client or Co-lab permission, and Personal Portal's entrance never reads it.

## 7. Falsifiers (each paired with a defeat candidate)

| # | Law | Defeat candidate |
|---|---|---|
| G1 | `tier='pro'` with no grant → absent | reader that ORs `tier` in |
| G2 | expired grant → absent | reader without the upper bound |
| G3 | future `effective_from` → absent | reader without the lower bound |
| G4 | revoked grant → absent, history intact | revocation implemented as UPDATE/DELETE |
| G5 | redelivered webhook → exactly one row | insert without the unique key |
| G6 | grant row cannot be updated | missing trigger |
| G7 | no column can express a client/Co-lab permission | table gains `scope`/`can_*` |
| G8 | member A's grant never authorizes member B | reader keyed on session, not grant member |
| G9 | steward act refused when it would exceed the cap | cap checked only in UI |
| G10 | exploration and Personal Portal entrance create/read no grant | learn-and-try wired to write a row |
| G11 | `granted_by` ≠ grantee, and not client-suppliable | grantee-supplied attribution |
| G12 | no deletion path in ordinary code; expiry is a predicate | cleanup job pruning expired rows |

Disposable-shadow database witness required (as S3 W-A/W-B): concurrent webhook deliveries; grant+revoke race; expiry boundary at the instant.

## 8. Migration of existing `tier = 'pro'` members

⛔ **No automatic backfill.** Converting a hand-settable `tier` into a grant would launder an unverified claim into a record that *looks* verified — the exact failure being repaired. Read-only census first (how many members are `pro`; how many have a live Stripe subscription), then a steward adjudicates each into a path, one attributable act at a time.

## 9. Open decisions (founder/steward)

1. **Who may perform a steward act** — ✅ RULED 2026-10-30: **founder only, for now.** `granted_by` for non-paid paths must therefore be the founder's member id, checked server-side against the founder authority (`requireFounder()`), never supplied by the request. A delegated steward role is a later, separate ruling; the table's `granted_by` already records who acted, so widening needs no schema change. Founder acts remain attributable: each carries a source reference, and the 20–30% cap rule applies to the founder exactly as to anyone.
2. **How a granted member obtains a practitioner context.** Today entering the studio provisions a practitioner row via the legacy path held under Ganesha G2 (`getCurrentPractitioner` is `LIMIT 1`). A grant must not silently create or select a practitioner identity — this is a dependency on G2, not something this record can solve.
3. **Whether apprenticeship counts toward the cap** as a whole or only its scholarship seats (canon says the latter).
4. Stripe period retrieval at webhook time — ✅ APPROVED 2026-10-30 as a design direction: the webhook reads the real subscription period end from Stripe instead of estimating. ⛔ Approval of the direction only; no webhook change, migration or billing activation is authorized by it.
5. Naming (`professional_access_grant` vs "Pro Studio access").

## 10. Owed before any build

Founder review of §2/§9 · read-only census of existing `pro` members (§8) · G2 dependency resolved or explicitly deferred · Class B classification, rollback plan, disposable-shadow witness plan · ⛔ nothing here deploys, migrates or opens billing.
