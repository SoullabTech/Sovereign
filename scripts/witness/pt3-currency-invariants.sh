#!/bin/sh
# PT-3 §V–§VII — SOURCE-CURRENCY INVARIANTS. Definitions only; this file runs nothing.
#
# AUTHORITY. Founder ruling, Writer's Studio, 2026-09-08 §IV–§VIII (disposable rehearsal).
#
# ⭐ WHY THIS FILE EXISTS, AND WHY IT IS SHARED.
#
# The disposable rehearsal of 744c8012 found two witness invariants that were simply WRONG:
#
#   I4  "every Work with sections has an operative representation"
#   I6  "every representation is recorded in the lifecycle"
#
# Both convicted a state the migration produces ON PURPOSE. For a Work with several Historical
# Arrivals, 20260908000001 guards its currency-act inserts with `count(arrivals) <= 1` and instead
# writes a `multiple_legacy_arrivals` reconciliation row — the table's own comment says the Work
# then "has no governed currency and is running on transitional compatibility". Currency is derived
# only from lifecycle acts, so no act means no operative representation, by design.
#
# The invariants therefore called the system's refusal to manufacture authority a §X abort
# condition — the exact failure PT-3 exists to prevent, committed by the instrument meant to prove
# it. An instrument that reports a truthful refusal as a defect pressures someone to make the
# system decide what it has no authority to decide.
#
#   ⭐ NO CURRENCY IS NOT THE SAME THING AS MISSING CURRENCY.
#      The witness must distinguish an AUTHORED or REFUSED absence from an ACCIDENTAL one.
#
# ⛔ AND THE EXCEPTION IS NOT AN ESCAPE HATCH. Excluding reconciliation rows from I4/I6 would let
# any absence be excused by writing a reconciliation row. So the exception is itself tested: an open
# ambiguity record must be TRUTHFUL about the Work it excuses (§VII), and a representation with no
# act must HAVE that record. Unresolved ambiguity is a valid state; unrecorded ambiguity is a defect.
#
# The definitions live here, in one place, because the post-cutover witness and the disposable
# regression must ask the SAME question. A re-typed invariant drifts — this lane has corrected that
# defect three times, and would have introduced it a fourth by writing these queries twice.

# ── The three lawful shapes for a Work that carries Source sections ────────────────────────────
#
#   OPERATIVE        source_operative_representation() resolves a representation
#   AMBIGUOUS LEGACY an OPEN multiple_legacy_arrivals record says the migration refused to decide
#   WITHDRAWN        the Work's LATEST representation-level act is a governed member withdrawal
#
# Anything else is an unexplained loss of Source authority.

# A Work whose ambiguity the migration recorded and did not resolve.
PT3_OPEN_AMBIGUITY="EXISTS (SELECT 1 FROM source_lifecycle_reconciliation c
                             WHERE c.manuscript_id = w.m
                               AND c.kind = 'multiple_legacy_arrivals'
                               AND c.resolved_at IS NULL)"

# A Work whose currency ended by an explicit member act.
#
# ⭐ B42 — THE LATEST ACT, NOT ANY ACT. This first read "some representation of the Work has a
# latest act of kind withdrawal", which proves too little. Consider:
#
#   representation A   extraction(true) → withdrawal(false)      ← lawful, and OLD
#   representation B   later replacement(false), nothing after   ← the real, unexplained loss
#
# Currency is NULL because of B, but the permissive predicate found A's historical withdrawal and
# pronounced the absence explained. A STALE LAWFUL WITHDRAWAL WOULD MASK A NEWER UNEXPLAINED LOSS —
# and the original four fixtures could not catch it, because none of them contained a withdrawal
# followed by anything.
#
# The invariant answers a temporal question — *why is there no currency NOW* — so the explaining act
# must be the Work's most recent representation-level act, under the lifecycle's own global ordering
# (occurred_at DESC, id DESC), and must be a governed member withdrawal: member_act, with an actor,
# leaving the representation non-operative. COALESCE because a Work with sections and no acts at all
# has no explanation, and NULL must not silently drop it from the defect count.
#
# ⭐ B43 — AND THE WITHDRAWAL MUST HAVE CAUSED THE ABSENCE. Latest-act was still not enough. The
# seam permits source_withdraw_representation() on ANY representation of the Work: it checks
# ownership and belonging, then appends withdrawal · operative=false. It does not require the
# subject to have been operative first. So this manufactures an explanation after the fact:
#
#   representation A   extraction(true) → replacement(false)   already inactive
#   representation B   replacement(false)                      the real, unexplained loss
#   later              withdrawal(A, false)                    a lawful seam call that caused nothing
#
# The latest act is now a governed withdrawal, and the Work would read EXPLAINED — by an act that
# ended nothing. So the predicate also asks what the withdrawn representation's state WAS: look past
# any trailing withdrawal rows for that representation (repeated withdrawal calls must not break the
# explanation) to its latest preceding NON-withdrawal act, and require `operative = true`.
#
#   extraction(true)  → withdrawal(false)   explains the absence
#   replacement(false) → withdrawal(false)  explains nothing; it was already inactive
#
#   ⭐ AN EXPLANATION CANNOT MERELY BE NEARBY IN HISTORY. It must bind to the state it explains.
PT3_WITHDRAWN="COALESCE((
  SELECT l.act = 'withdrawal'
     AND NOT l.operative
     AND l.provenance = 'member_act'
     AND l.actor_member_id IS NOT NULL
     AND COALESCE((SELECT p.operative
                     FROM source_lifecycle_acts p
                    WHERE p.manuscript_id   = l.manuscript_id
                      AND p.representation_id = l.representation_id
                      AND p.act <> 'withdrawal'
                    ORDER BY p.occurred_at DESC, p.id DESC
                    LIMIT 1), false)
    FROM source_lifecycle_acts l
   WHERE l.manuscript_id = w.m AND l.representation_id IS NOT NULL
   ORDER BY l.occurred_at DESC, l.id DESC
   LIMIT 1), false)"

# ── I4 (replacement) — UNEXPLAINED ABSENCE OF SOURCE CURRENCY ──────────────────────────────────
# Every absence of operative Source currency must be governed or explicitly reconciliatory.
PT3_INV_UNEXPLAINED_ABSENCE="
SELECT count(*) FROM (SELECT DISTINCT manuscript_id AS m FROM manuscript_sections) w
 WHERE source_operative_representation(w.m) IS NULL
   AND NOT $PT3_OPEN_AMBIGUITY
   AND NOT $PT3_WITHDRAWN"

# ── I6 (replacement) — UNRECORDED REPRESENTATION ───────────────────────────────────────────────
# A representation with no lifecycle act is permissible ONLY where the system recorded why it
# refused to infer one — AND where that record is about THIS representation.
#
# ⭐ B44. The first version excused any unacted representation whose WORK carried an open ambiguity
# record. That is broader than the fact recorded: the migration refuses to infer currency for ONE
# backfilled representation built from ONE selected arrival. Under the Work-scoped rule, a second,
# later, unacted representation on the same Work inherited the old excuse merely by sharing a
# manuscript_id — turning the reconciliation row into the generic "ignore this" marker §VII exists
# to prevent. A record explains a historical subject, not every future defect on the Work.
PT3_INV_UNRECORDED_REPRESENTATION="
SELECT count(*) FROM manuscript_source_representations r
 WHERE NOT EXISTS (SELECT 1 FROM source_lifecycle_acts a WHERE a.representation_id = r.id)
   AND NOT EXISTS (
     SELECT 1 FROM source_lifecycle_reconciliation c
      WHERE c.manuscript_id = r.manuscript_id
        AND c.kind = 'multiple_legacy_arrivals'
        AND c.resolved_at IS NULL
        -- ⭐ B44 — SUBJECT-BOUND, NOT WORK-SCOPED. The record must have been able to be ABOUT this
        -- representation: it existed no later than the moment the ambiguity was noticed. (Equality
        -- is required, not strict inequality — the migration creates both in one transaction, so
        -- created_at and noticed_at are the same now().)
        AND r.created_at <= c.noticed_at
        -- And where the migration named the arrival it selected, the representation must be the
        -- one built from it. The migration records earliest_arrival_id precisely so the subject of
        -- its refusal is identifiable; a representation on some other arrival is not that subject.
        AND (c.detail->>'earliest_arrival_id' IS NULL
             OR r.arrival_id IS NOT DISTINCT FROM (c.detail->>'earliest_arrival_id')::uuid))"

# ── §VII — THE EXCEPTION MUST BE TRUTHFUL ──────────────────────────────────────────────────────
# An open ambiguity record may only excuse a Work that really is ambiguous …
PT3_INV_AMBIGUITY_IS_REAL="
SELECT count(*) FROM source_lifecycle_reconciliation c
 WHERE c.kind = 'multiple_legacy_arrivals' AND c.resolved_at IS NULL
   AND (SELECT count(*) FROM manuscript_source_arrivals a
         WHERE a.manuscript_id = c.manuscript_id) <= 1"

# … and that really has no governed currency. A Work whose currency has since been established
# through the seam is no longer running on transitional compatibility: its record must be resolved.
PT3_INV_AMBIGUITY_HAS_NO_CURRENCY="
SELECT count(*) FROM source_lifecycle_reconciliation c
 WHERE c.kind = 'multiple_legacy_arrivals' AND c.resolved_at IS NULL
   AND source_operative_representation(c.manuscript_id) IS NOT NULL"
