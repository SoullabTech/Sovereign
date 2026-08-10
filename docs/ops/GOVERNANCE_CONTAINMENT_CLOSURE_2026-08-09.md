# Governance Containment — Unit B Closure Record

**Status: RECORD — 2026-08-09.** ⛔ Authorizes nothing. ⛔ Releases nothing. States what was
reconciled, what was verified in production, and — precisely — what was **not** proven.

**Trunk:** `origin/clean-main-no-secrets @ d2db55d7b` · **Production:** `d2db55d7b` (container created
2026-08-10T00:02:39Z) · **Migration:** `20260809000001_practice_field_governance_containment.sql`, applied
**Rulings preserved:** R-GC1 · R-GC2 · R-GC2a · GC-4 · [`GOVERNANCE_CONTAINMENT_2026-08-09.md`](../design/practitioner-portal/GOVERNANCE_CONTAINMENT_2026-08-09.md)

---

## 1. ⭐⭐⭐ The reconciliation gate — answered, but not as posed

Unit B was gated on: *reconcile `origin/feature/governance-containment` against trunk; do not assume
its three commits are still based on canonical trunk.* ⭐ The reconciliation was performed and is
**moot**, for a reason worth recording rather than skipping past:

| Measured | Result |
|---|---|
| `merge-base(GC, trunk)` | `11d2e147d` — ⭐ **the branch tip itself** |
| Branch commits ahead of merge-base | **0** |
| Contested files (touched by both) | **0** |
| `git merge-tree` conflict probe | ⭐ **clean** |
| Ancestry | ⭐ **GC is already an ancestor of trunk** |

⭐ The branch was merged via **PR #997** at 2026-08-09 19:54:56, producing trunk `d2db55d7b`. All
three commits (`60eaa4aaa` · `4e0efaf53` · `11d2e147d`) are on trunk. ⛔ **There was no drift to
reconcile because there was no interval in which to drift** — the merge followed the last branch
commit by 15 minutes.

⚠️ **Correction to an in-session claim.** Mid-verification this record's author read production as
`46cdd47dd` (from a deploy log) and concluded production did **not** contain the containment work.
⭐ Direct measurement of the running container returned `d2db55d7b`. A later deploy had landed it.
⛔ The deploy log was a stale referent; the container is the authority.

---

## 2. ✅ Migration verification — the §4 pre-conditions, measured in production

| Required | Result |
|---|---|
| Migration matches **exactly** the intended legacy field | ✅ **1 of 2** rows classified — `8be895ad` |
| ⛔ No unrelated production row receives classification | ✅ `87c28398` → `containment_status='none'`, no `contained_at`, **no event** |
| Historical reason and date survive | ✅ `contained_at = 2026-08-03`, reason preserved from the surviving `status_reason` |
| ⛔ No historical actor is invented | ✅ `contained_by` **NULL** · `actor_member_id` **NULL** · `actor_admin_role` **NULL** — the event's own basis states *"imposing actor unrecoverable and deliberately not invented"* |
| Legacy field becomes `governance_hold` | ✅ `containment_kind = 'governance_hold'` |
| Transition event records the governed basis | ✅ `event='classified'` · `authority_basis='governed_migration'` · `classification_basis` cites **R-GC2**, and marks the act **one-time, not a precedent** |
| `voluntary_hold` / `governance_hold` stay separate | ✅ enforced **at the database**, not merely in code (below) |

### Database-level guarantees (not code-level promises)

```
practice_fields_containment_has_provenance
  CHECK (containment_status = 'none' OR (containment_reason IS NOT NULL
         AND contained_at IS NOT NULL AND containment_kind IS NOT NULL))
practice_fields_containment_kind_check
  CHECK (containment_kind IS NULL OR containment_kind IN ('voluntary_hold','governance_hold'))
practice_field_containment_events_authority_basis_check
  CHECK (authority_basis IN ('field_holder','platform_governance','governed_migration'))
```

⭐ **A contained field cannot exist without its provenance.** ⛔ The 2026-08-03 failure mode —
containment living in `status_reason` where a readiness recompute could erase it — is now
structurally impossible, not merely discouraged.

---

## 3. ✅ Authority boundary — the ruling, carried forward and checked

> ⭐⭐⭐ **Governance containment may be imposed or released through platform governance authority,
> including where the contained artifact sits in a Practice Field, but that authority governs the
> containment state ONLY.** ⛔ It confers no authority over the artifact's relational meaning,
> authorship, adoption, publication, or member relationship.

⭐ Checked during reconciliation, ⛔ not reconstructed afterward. **32/32** tests pass against
`d2db55d7b`. The boundary is carried by **named** tests, not inferred:

| Boundary | Test |
|---|---|
| ⭐ Route writes containment columns **only**, never content | **K5 — JURISDICTION** |
| ⛔ Release does **not** claim the field is now live | **K5b** |
| ⛔ Platform governance does **not** lift a holder's own voluntary hold | **K6** |
| ⛔ Holder cannot release a governance hold | **R3** · **R4** (legacy `contained_by=NULL` case) |
| ⛔ Unclassifiable containment **fails CLOSED**, treated as governance | **R4b** |
| ⛔ Holder route can only ever mint `voluntary_hold` | **K2** · **R4d** |
| ⛔ Prose is not authority — no code decides by reading reason text | **K3** |
| ⛔ Readiness recompute leaves every containment column untouched | **6** · **R5** |
| ⭐ Invite gate is a **conjunction**; the two refusals stay distinguishable | **4** · **4b** |

⭐ *Prohibition is not incompleteness* — the invite route returns **409 contained** distinctly from
**422 pending**. ⛔ Rendering them identically is how a hold becomes invisible.

---

## 4. ✅ Post-deploy proof — live state

| Field | `status` | `containment_status` | Effectively live |
|---|---|---|---|
| `87c28398` (unrelated) | pending | `none` | **f** |
| `8be895ad` (legacy) | pending | **`contained`** / `governance_hold` | **f** |

✅ Legacy field remains effectively non-live · ✅ unrelated field unchanged · ✅ exactly one
containment event exists.

---

## 5. ⛔⛔ What was NOT proven — and why, deliberately

⛔ **The mutation-requiring live proofs were not run against production.** The directive states:
*do not release or use the contained legacy field for testing.* ⭐ Running them would have required
either releasing the hold or mutating the contained row — the one thing forbidden.

| Rung | Status |
|---|---|
| Ordinary holder route **cannot** release it | ⛔ **Not live-proven.** Proven by R3/R4/R4b against the deployed code |
| Readiness recomputation **cannot** clear it | ⛔ **Not live-proven.** Proven by tests 6/R5 + the DB provenance CHECK |
| No invitation path becomes armed | ⛔ **Not live-proven.** Proven by the 409 gate + test 4 |

⭐ **Proof ladder, stated honestly:** `Exists ✓ · Correct ✓ · Secure ✓ · Connected ✓ · Reachable ✓ ·
Exercised ⚠️ (by migration and tests, ⛔ not by a governance act under load) · Observable ✓
(the events table is the ledger) · Sustained ⛔ (no recurring check yet).`

⛔ **Nothing here is a release recommendation.** The legacy field stays contained. Its release is a
separate governance act requiring founder authority under R-GC2a.

---

## 6. Scope held

⛔ No expansion into Unit A, Dual Authority, `relationship_spaces`, Ruling 2, the 7 open §E
questions, or the 23 uncommitted `requireSelfScopedMember` call-sites. ⭐ Those remain their own
units — see [`NOW_WHAT_REHABILITATION_HANDOFF_UNIT_A_2026-08-09.md`](NOW_WHAT_REHABILITATION_HANDOFF_UNIT_A_2026-08-09.md).

**Next bounded unit: C — relationship ceremony.** ⛔ Gated on §8.4; ⛔ do not begin without it.
