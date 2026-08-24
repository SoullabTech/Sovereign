# Identity canonicalization — design (NOT executed)

**Date:** 2026-08-24 · **Status:** DESIGN. No write performed or authorized.
Supersedes nothing; extends `KELLY_IDENTITY_CONSOLIDATION_PLAN_2026-08-24.md` with the founder
rulings of 2026-08-24 and the located auto-provision defect.

```
canonical member        ce284751… / kelly@soullab.life
canonical practitioner  0776d427… / kelly-nezat
legacy member           49ae4717… / soullab1@gmail.com   → retired_alias, NOT deleted
legacy practitioner     fb0cb8b7… / kelly-nezat-old      → suspended, relinquishes unique strings
auto-provisioned        717da53c… / personal-49ae4717    → QUARANTINE, untouched
```

⭐ This is **canonicalization with preserved lineage**, not a destructive merge.

---

## §0 BLOCKER — the auto-provision defect (fix before any consolidation)

**Location:** `app/api/studio/personal/enter/route.ts:42`

```js
'SELECT id FROM practitioners WHERE member_id = $1 AND status = $2', [memberId, 'active']
```

The existence check is filtered to `status = 'active'`. `fb0cb8b7` is **suspended**, so the guard
reported "no practitioner" and the route minted `717da53c` — practitioner + default theme in one
transaction, which is why their `created_at` match to the millisecond.

**The rule this breaks:** *suspension is a state of an existing thing, not its absence.* Filtering
existence by status makes the system forget a row it is not allowed to forget.

**Required repair (own unit, own review):**
1. The existence check must ask **`WHERE member_id = $1`** — unfiltered — and then branch on status.
2. A **suspended** practitioner must produce a named refusal ("this account's Studio is suspended"),
   never a silent replacement.
3. The deterministic slug `personal-<id8>` means a second attempt raises a `practitioners_slug_key`
   violation and returns 500. That is a second defect: recover and report, do not throw.
4. Regression: *member with a suspended practitioner opens Personal Studio → zero rows created.*

⛔ Consolidation must not execute before this lands, or a resolver miss re-manufactures a duplicate.

---

## §1 The durable mapping — the actual architectural requirement

A one-off UPDATE solves Kelly and leaves every tester with the same problem. What is needed is a
**referent table** that says two historical member ids are one person, while every record keeps the
provenance it was written with.

```sql
-- DESIGN ONLY — not applied
CREATE TABLE member_identity_links (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  canonical_member_id uuid NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
  legacy_member_id    uuid NOT NULL REFERENCES members(id) ON DELETE RESTRICT UNIQUE,
  alias_email       text,
  status            text NOT NULL CHECK (status IN ('retired_alias','merged','under_review')),
  reason            text NOT NULL,
  linked_at         timestamptz NOT NULL DEFAULT now(),
  linked_by         uuid REFERENCES members(id),
  before_state      jsonb NOT NULL,   -- the reversal record
  CHECK (canonical_member_id <> legacy_member_id)
);
```

**Why each constraint:**
- `ON DELETE RESTRICT` on both sides — the link is what makes deletion unsafe, so it must block it.
- `legacy_member_id UNIQUE` — a legacy id may point to exactly one canonical person, ever.
- `before_state jsonb` — the reversal record travels **with** the link, not in a separate log that
  can drift from it.
- ⛔ No `ON DELETE CASCADE` anywhere. Erasing a link must never erase a person.

**What it buys:** MAIA can later retrieve legitimate legacy history *as legacy* — without pretending
it was written under `ce284751`. Retiring an identity is not erasing its referent.

---

## §2 The reversible transaction — ordered, not executed

Every step is expressed so that step *n* can be undone without touching step *n−1*.

| # | Step | Reversal |
|---|---|---|
| 1 | Record before-state + insert `member_identity_links` row (`under_review`) | delete the link row |
| 2 | `fb0cb8b7` releases unique strings → archival values (`kelly-nezat-old-archived`, `archived-fb0cb8b7@soullab.life`); previous values stored in `before_state` | restore from `before_state` |
| 3 | `0776d427` takes `kelly@soullab.life` + canonical slug | restore placeholder from `before_state` |
| 4 | Re-point the 37 practitioner-child rows `fb0cb8b7 → 0776d427`, **preserving row ids, timestamps, content** | re-point back by id list |
| 5 | Re-point the single `oauth_accounts.member_id → ce284751` | single-row revert |
| 6 | Set `members.has_oauth = true` on canonical — it is **false on both rows today and already wrong** | restore prior boolean |
| 7 | Reconcile `member_settings` by most-recent `updated_at`; canonical wins on a tie | restore both rows |
| 8 | `member_spiral_state`: canonical wins; legacy row **retained, not deleted** | none needed |
| 9 | `team_presence`: migrate nothing; re-establishes on next canonical session | none needed |
| 10 | Issue a **new** canonical role grant if required; old grants untouched | revoke the new grant |
| 11 | Stop new authentication into the legacy member | re-enable |
| 12 | Verify canonical: web · iOS · Studio · memory · portraits | — |
| 13 | Only then flip the link to `retired_alias` | flip to `under_review` |

**Steps 2 and 3 are ordered and cannot be swapped** — `practitioners_email_key` is UNIQUE, so the
suspended row must release `kelly@soullab.life` before the canonical row can take it. A single
transaction is required; a crash between them leaves neither owning it.

---

## §3 Explicitly out of scope

⛔ No member deletion · no practitioner deletion · no portrait change · no bulk memory reassignment ·
no rewriting of old role grants · no manuscript deletion or revision merge · `717da53c` untouched.

**Writer's Studio:** the copy under canonical Kelly is the surfaced one. The two byte-identical
legacy copies stay in place as archived duplicates.

**Thin history under `49ae4717` stays put.** That it happened under the mistaken identity is itself
the fact worth keeping.

---

## §4 Reusability

The same shape covers any tester with duplicate signups: locate canonical by **footprint depth**,
not by recency of use — the whole Kelly incident happened because the *actively used* identity was
the *thin* one.
