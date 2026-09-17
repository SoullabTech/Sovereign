-- P6 — Doorway Consent Integrity: the column default may not confer return authority.
--
-- Spec: docs/specs/MIPA_PHASE_0_SOVEREIGNTY_PREREQUISITES_SPEC.md — P6
--
-- ── WHAT THIS FIXES ─────────────────────────────────────────────────────────
--
-- `return_preference` is a permission about FUTURE RESURFACING. Migration
-- 20260523000001 set the column DEFAULT to 'contextual_doorway' on the doctrine
-- "Keeping is the consent act. Return is the default meaning of keeping."
--
-- That doctrine is about a MEMBER KEEPING THEIR OWN MATERIAL, and it stands.
-- But a column default does not know who is writing. Any INSERT that omitted
-- the column inherited member-scale consent regardless of the actor — a
-- practitioner bridge, a system process, a future importer. A permissive
-- default is a consent decision made by whoever wrote the schema, applied to
-- everyone who ever writes a row.
--
-- ── WHAT CHANGES, AND WHAT DOES NOT ─────────────────────────────────────────
--
-- The default becomes 'member_pulled' — the schema's own most-restrictive
-- value, documented in 20260521000001 as "only when member asks directly".
--
-- The 2026-05-23 doctrine is NOT reversed. The member Keep path now states
-- 'contextual_doorway' EXPLICITLY at its write site, constructed from the
-- member's own identity (lib/psyche/returnAuthority.ts). Member keeps behave
-- exactly as before. What is removed is the ability to acquire that permission
-- by omission.
--
--   before: omit the column → contextual_doorway, whoever you are
--   after:  omit the column → member_pulled; the permission must be constructed
--
-- ── THE BACKFILL, AND WHY IT IS BOUNDED THE WAY IT IS ───────────────────────
--
-- Practitioner-observation atoms were written with a hardcoded
-- 'contextual_doorway' that no member conferred. Those rows carry a live
-- permission nobody was entitled to grant, and the ambient loader
-- (lib/maia/memoryAtomsLoader.ts) surfaces on exactly that value.
--
-- Could a row in this set instead reflect a genuine member act? The member's
-- affordance on /maia/keep-capture toggles between "Reseal" (→ member_pulled)
-- and "Allow return" (→ contextual_doorway). From the practitioner-written
-- state the only move available to the member is to RESEAL — and a resealed row
-- is not in this set, because it no longer reads 'contextual_doorway'. The one
-- indistinguishable case is a member who resealed and then re-allowed. No
-- source-derived discriminator separates that from the original write:
-- `last_touched_at` is NOT NULL DEFAULT now(), so it does not record whether a
-- gesture ever ran.
--
-- Faced with an unresolvable pair, the asymmetry decides it:
--
--   * leaving these rows keeps an unauthorized permission live and ambient;
--   * an over-broad reseal costs that member ONE CLICK on an affordance that
--     already exists — the same member-driven path migration 20260523000001
--     named for pre-existing material.
--
-- Reversible by the member, and it never fabricates authority. That is the
-- fail-closed direction, so the backfill runs.
--
-- Deliberately NOT backfilled: everything else. Member-kept atoms keep whatever
-- preference they carry. This touches only rows whose permission is
-- attributable to the practitioner bridge and to nothing else.
--
-- AUTHORSHIP IS UNTOUCHED. `source_type`, `facilitator_id`, `provenance`,
-- `epistemological_status` and `generated_by` are not modified. Return
-- authority and content authorship are independent properties, and this
-- migration changes exactly one of them.

BEGIN;

ALTER TABLE member_memory_atoms
  ALTER COLUMN return_preference SET DEFAULT 'member_pulled';

UPDATE member_memory_atoms
   SET return_preference = 'member_pulled'
 WHERE source_type = 'practitioner_observation'
   AND generated_by = 'practitioner-observation'
   AND return_preference = 'contextual_doorway';

COMMIT;
