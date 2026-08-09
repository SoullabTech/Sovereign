# Durable corrigibility — design brief (Layer B)

**Date:** 2026-08-09 · **Status:** ⛔ **DESIGN ONLY — not implemented, not authorized to implement.**
**Founder mandate:** *"Return the minimal schema/runtime changes, member gesture required, authority transition model, tests, and migration implications before implementation."*
**Governing invariant:** **historical evidence may remain, but a member correction must be able to supersede its authority over future interpretation and routing.**

---

## 0. The question this answers

> By what member act may a system-held interpretation acquire, retain, lose, or regain authority over MAIA's future understanding of the member?

The March 2026 COGOS answer was: **it acquires authority by recurrence.** That answer is now foreclosed. The 2026-08-06 containment ruling states that *"visibility, acknowledgment, confidence, recurrence, and professional role never create authorship or permission"*, and `isPromotionEligible()` requires six gates of which **none** is a member act (verified: `member_confirmation` appears nowhere in the gate logic).

This brief proposes the smallest change that inverts that: **recurrence may establish evidence; only a member act may confer authority.**

---

## 1. What already exists and can be reused unchanged

| Existing | Role in the new design |
|---|---|
| `accumulating_hypotheses` + `cogos_evidence_events` (insert-only) | Evidence accumulation. **Unchanged.** Recurrence still strengthens *evidence*. |
| `gateEvaluator.runGateSequence()` | Still runs. Its verdict now means **"eligible to be offered"**, not "eligible to route". |
| `interpretive_ledger.routing_influence_weight` | The authority dial. Comment already reads *"Reduced by decay, contradictions, and member revocation. **Evidence is preserved regardless of this value.**"* — already correct. |
| `FalsifiabilityAnchor` (`contradiction_conditions`, `decay_conditions`) | Already mandatory on admission. Already models T4 release. |
| `ledger_member_annotations` + `POST /api/members/ledger/annotate` (`clear_influence`, `add_context`) | The member's existing revocation gesture. **Already built, already wired, zero rows.** |
| `cogos_surfacing_status` incl. `'cleared_by_member'` | Already models member-cleared state. |
| `CONTRADICTION_WEIGHTS.user_correction = 0.95` | Already ranks member corrections highest. |
| Sanctuary guard wrapping the pipeline | **Unchanged and non-negotiable.** |

**Nothing in this list needs amendment.** The March design was already built around "evidence persists, authority moves." Only the *acquisition* rule is wrong.

---

## 2. Minimal changes

### 2.1 Runtime (no schema)

**(a) Promotion becomes offering, not routing.** `promoteToLedger()` writes the entry with `routing_influence_weight = 0` and `surfacing_status = 'eligible'` instead of `0.70`/routing-active. The entry exists, is inspectable by the member, and **influences nothing**.

**(b) A new gate function, `isOfferable()`,** replaces `isPromotionEligible()` at the promotion call site. Same six structural checks — but its name and its downstream effect say what it actually establishes: *this is worth showing the member*, never *this is now true of them*.

**(c) `loadLedgerForRouting()` filters on `authority_source IS NOT NULL`** (§2.2). An entry with no member act never reaches a prompt. This one predicate is the constitutional boundary.

**(d) A `ledger` addendum** in `summarizePromptBlock()` and the live path, rendering only member-authorised entries, each carrying its provenance and its authority state — *"you told me in March that X; you have not revised it"* — never as an unattributed fact.

### 2.2 Schema — one column, one table

```sql
-- MINIMAL. Not written. Not applied.

-- (1) Authority may exist only by a member act. NULL = no authority, ever.
ALTER TABLE interpretive_ledger
  ADD COLUMN authority_source TEXT
    CHECK (authority_source IN ('member_confirmed','member_authored','member_qualified')),
  ADD COLUMN authority_granted_at TIMESTAMPTZ,
  ADD COLUMN superseded_by UUID REFERENCES member_corrections(id),
  ADD CONSTRAINT ledger_authority_requires_member_act CHECK (
    (authority_source IS NULL     AND routing_influence_weight = 0)
    OR
    (authority_source IS NOT NULL AND authority_granted_at IS NOT NULL)
  );

-- (2) The correction itself is a first-class, member-authored object —
--     not an annotation on a system claim. It outlives what it corrects.
CREATE TABLE member_corrections (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id      UUID NOT NULL,
  corrects       UUID REFERENCES interpretive_ledger(id),  -- nullable: may correct nothing
  verbatim_text  TEXT NOT NULL CHECK (length(btrim(verbatim_text)) > 0),
  source_turn_id UUID,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

⭐ The `CHECK` on `ledger_authority_requires_member_act` is the whole design in one line: **a row with no member act cannot carry routing weight, enforced by the database, not by application discipline.** It is deliberately the same instrument as `episodic_member_marked_requires_verbatim` — the strongest thing this architecture already does.

⭐ `member_corrections.verbatim_text NOT NULL` mirrors the episodic rule: **the correction is the member's own words.** The system never writes a correction on the member's behalf.

### 2.3 What is explicitly NOT changed

- **No deletion, ever.** Superseding sets `routing_influence_weight = 0` and `superseded_by`. The evidence row, its `cogos_evidence_events`, and the hypothesis remain readable forever.
- **`isPromotionEligible()` is not "fixed."** Repairing it in place would design constitutional machinery through a bug fix. It is *replaced at the call site* and left as a structural-evidence predicate.
- **Recurrence keeps its job.** It still accumulates evidence and still gates offering. It simply never crosses into authority.

---

## 3. The member gesture

Three acts, one surface. All are explicit; none is inferred from behaviour, engagement, or silence.

| Act | Effect on authority | Effect on evidence |
|---|---|---|
| **Confirm** — *"yes, that's true of me"* | `authority_source = 'member_confirmed'`, weight → 0.70 | unchanged |
| **Qualify** — *"partly — but it's more like…"* | `'member_qualified'`, weight → 0.70, **the member's words become the governing text** | original preserved, marked superseded |
| **Correct / clear** — *"no"*, *"that was true once"*, *"that's not important to me anymore"* | `authority_source → NULL`, weight → 0, `superseded_by = <correction>` | **fully preserved** |

**Silence is not consent.** An unanswered offer stays at weight 0 forever. This is the inverse of the March model, where silence plus recurrence produced authority.

**Where the gesture lives.** `POST /api/members/ledger/annotate` already implements `clear_influence` and `add_context`. It needs `confirm` and `qualify`, and — the piece never built (`cogos-status.md` remaining-work item 3, open since 2026-03-12) — **a UI**. Today the member's revocation power is reachable only by authenticated `curl`.

**How the offer reaches the member** is the one genuinely unresolved design question (`cogos-status.md` item 4, deferred in March, still deferred): does MAIA raise it in conversation, or does it wait silently in a room the member visits? Raising it in conversation risks the system steering the member toward confirming its own interpretations — a sovereignty problem the containment ruling would likely refuse. **A room the member chooses to enter is the safer default and is recommended, but this is a founder ruling, not an engineering choice.**

---

## 4. Authority transition model

```
        system observation ──► accumulating_hypotheses ──► cogos_evidence_events
                                        │                     (insert-only, immutable)
                                   runGateSequence
                                        │  isOfferable()  ← recurrence CAN reach here
                                        ▼
                            interpretive_ledger entry
                            authority_source = NULL
                            routing_influence_weight = 0     ◄── CANNOT influence MAIA
                                        │
                                        │  ⛔ recurrence CANNOT cross this line
                                        │  ⭐ only a member act crosses it
                                        ▼
                   ┌──────── member offered the interpretation ────────┐
                   │                    │                              │
              CONFIRM               QUALIFY                     CORRECT / CLEAR
                   │                    │                              │
       authority_source=          authority_source=            authority_source=NULL
        member_confirmed           member_qualified             weight=0
        weight=0.70                weight=0.70                  superseded_by=<correction>
                   │                member's words                     │
                   │                govern the text                    │
                   ▼                    ▼                              ▼
            reaches the prompt as a member-authorised            never reaches the
            statement, with provenance and date                  prompt again
                   │                                                   │
                   └──────────► a later correction always ◄────────────┘
                                 returns it to weight 0
                                 (evidence still preserved)

   REGAIN: only by a new member act on a new offer. The system may never
           re-promote a corrected interpretation on fresh recurrence alone.
   DECAY:  applyDecay() reduces weight over time toward 0. Decay may lower
           authority; it may never raise it.
```

**Falsifiable property this creates** (the founder's formulation): *if the member corrects MAIA and MAIA continues carrying the old interpretation as authoritative, the system has failed.* That is now testable, because "authoritative" has a column.

---

## 5. Tests required before implementation is accepted

| # | Property | Shape |
|---|---|---|
| 1 | Recurrence alone never confers authority | 50 recurrences, cross-context, max confidence → `authority_source IS NULL`, weight 0, absent from `loadLedgerForRouting()` |
| 2 | The DB refuses ungoverned authority | direct `UPDATE … SET routing_influence_weight = 0.7` with `authority_source IS NULL` → **constraint violation** |
| 3 | A correction removes authority and preserves evidence | after correct: weight 0, `superseded_by` set, **and** the hypothesis + every `cogos_evidence_event` still readable |
| 4 | A corrected interpretation never re-routes | correct, then feed 20 more confirming observations → still weight 0; re-promotion requires a new member act |
| 5 | Superseded entries never reach a prompt | assert the rendered `ledger` addendum contains no superseded text — the T2/T3 regression pin |
| 6 | Context pressure cannot invert it | fill the window with high-significance older material; the member's correction still governs (the audit's Failure 3) |
| 7 | Silence confers nothing | offer, no response, 90 days → weight 0 |
| 8 | Sanctuary produces nothing | a Sanctuary turn writes zero observations, hypotheses, ledger rows, corrections |
| 9 | Provenance survives rendering | the addendum attributes every statement to the member act that authorised it; a system inference can never render unattributed |
| 10 | The correction is the member's words | `member_corrections.verbatim_text` is member-authored; no code path writes it on their behalf |

Tests 2, 5 and 6 are the ones that make this more than good intentions. Test 6 is the one the current architecture would fail today.

---

## 6. Migration implications

- **Additive and reversible.** Two nullable columns + one CHECK + one new table. No backfill: `interpretive_ledger` and `accumulating_hypotheses` hold **0 production rows**, so there is nothing to migrate and the constraint cannot break existing data. **This is the cheapest moment this change will ever have.**
- **Idempotency** per the #559 pattern (`ADD COLUMN IF NOT EXISTS`, `DROP CONSTRAINT IF EXISTS` before `ADD`).
- **Co-Lab release gate** applies — the new table is member relational material; `verify-colab-boundaries.ts` must gain a scope check before any tester wave.
- **Deploy path**: schema change ⇒ full `scripts/deploy-production.sh deploy <SHA>`, not the quick `deploy-maia` lane.
- **Rollback**: dropping the columns restores March behaviour exactly; no data is lost because nothing is ever deleted by design.

---

## 7. What still requires a founder ruling before any of this is built

1. **Is "offer → member act" the right acquisition rule at all?** The alternative is stricter: system interpretation *never* acquires routing authority, and the ledger stays a purely member-inspectable record. This brief assumes the first; the second is defensible and simpler.
2. **How is an interpretation offered?** In-conversation vs. a room the member enters. (`cogos-status.md` item 4, open since 2026-03-12. Recommendation: the room.)
3. **Does a *qualified* interpretation become member-authored content** — i.e. does the member's qualifying text become an atom, subject to the atoms consent model?
4. **May a practitioner ever see a member-confirmed ledger entry?** Under the 2026-08-06 containment ruling the default is no, absent a member-declared crossing. This brief assumes no and does not touch practitioner surfaces.

---

## 8. Recommended sequence (not authorized)

1. Founder rulings §7.1 and §7.2 — **nothing is built before these.**
2. Migration + constraint (test 2 first — prove the DB refuses ungoverned authority before writing any runtime code).
3. `isOfferable()` + `promoteToLedger` at weight 0 + `loadLedgerForRouting` authority filter.
4. Annotation UI (the gesture must be reachable before any offer exists).
5. The offering surface, per ruling §7.2.
6. The `ledger` addendum + tests 5, 6, 9.
7. Re-run the corrigibility trace T0–T4 against the live runtime as acceptance.

---

*Design only. Nothing here has been implemented, no migration has been written, and no production table has been altered.*
