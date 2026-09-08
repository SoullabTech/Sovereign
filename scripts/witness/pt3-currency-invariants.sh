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
#   WITHDRAWN        governed history records the member-directed withdrawal that ended currency
#
# Anything else is an unexplained loss of Source authority.

# A Work whose ambiguity the migration recorded and did not resolve.
PT3_OPEN_AMBIGUITY="EXISTS (SELECT 1 FROM source_lifecycle_reconciliation c
                             WHERE c.manuscript_id = w.m
                               AND c.kind = 'multiple_legacy_arrivals'
                               AND c.resolved_at IS NULL)"

# A Work whose currency ended by an explicit member act. Read from the LATEST act of each
# representation — the same derivation source_operative_representation() uses — so an old
# withdrawal followed by a lawful re-extraction does not qualify (that Work is OPERATIVE anyway).
PT3_WITHDRAWN="EXISTS (
  SELECT 1 FROM (
    SELECT DISTINCT ON (representation_id) representation_id, act
      FROM source_lifecycle_acts
     WHERE manuscript_id = w.m AND representation_id IS NOT NULL
     ORDER BY representation_id, occurred_at DESC, id DESC
  ) latest WHERE latest.act = 'withdrawal')"

# ── I4 (replacement) — UNEXPLAINED ABSENCE OF SOURCE CURRENCY ──────────────────────────────────
# Every absence of operative Source currency must be governed or explicitly reconciliatory.
PT3_INV_UNEXPLAINED_ABSENCE="
SELECT count(*) FROM (SELECT DISTINCT manuscript_id AS m FROM manuscript_sections) w
 WHERE source_operative_representation(w.m) IS NULL
   AND NOT $PT3_OPEN_AMBIGUITY
   AND NOT $PT3_WITHDRAWN"

# ── I6 (replacement) — UNRECORDED REPRESENTATION ───────────────────────────────────────────────
# A representation with no lifecycle act is permissible ONLY where the system recorded why it
# refused to infer one.
PT3_INV_UNRECORDED_REPRESENTATION="
SELECT count(*) FROM manuscript_source_representations r
 WHERE NOT EXISTS (SELECT 1 FROM source_lifecycle_acts a WHERE a.representation_id = r.id)
   AND NOT EXISTS (SELECT 1 FROM source_lifecycle_reconciliation c
                    WHERE c.manuscript_id = r.manuscript_id
                      AND c.kind = 'multiple_legacy_arrivals'
                      AND c.resolved_at IS NULL)"

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
