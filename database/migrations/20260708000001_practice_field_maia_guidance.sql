-- Migration: practice_field_maia_guidance
-- Activates Layer 4 (Adaptive Guidance) of the Practice Field — the practitioner-
-- facing "MAIA Guidance" surface. The original practice_fields migration named this
-- layer explicitly: "Layer 4: Adaptive Guidance — practice preferences for MAIA
-- (deferred, not in beta)". This migration activates it.
--
-- CONSTITUTIONAL INVARIANT (narrow-only). A practitioner may configure the
-- CONDITIONS OF PARTICIPATION in their field: they may only NARROW or SPECIFY how
-- MAIA engages inside the field (tone, language, invitations, boundaries, forbidden
-- topics/engagements). They may NEVER relax constitutional safeguards or widen
-- MAIA's authority. Enforcement lives in code, not the schema:
--   - lib/practiceField/fieldGuidance.ts  (validateFieldGuidance: reject/neutralize widening)
--   - composition order (constitutional floor first, standing guardrails last;
--     guidance appended strictly between — see lib/sovereign/maiaVoice.ts).
--
-- LIVE, NOT SNAPSHOTTED. Unlike the formation-snapshotted Stable Field (Layers 1+2),
-- guidance behaves like the Active Field: changes push to all of a practitioner's
-- active Relationship Spaces immediately. It is therefore NOT copied into
-- practice_field_snapshots.

ALTER TABLE practice_fields
  ADD COLUMN IF NOT EXISTS maia_guidance JSONB NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN practice_fields.maia_guidance IS
  'Layer 4 Adaptive Guidance ("MAIA Guidance"): practitioner preferences that NARROW '
  'or SPECIFY how MAIA engages within this field — tone, preferred_language, '
  'invitations, boundaries, forbidden_topics, forbidden_engagements, custom_notes. '
  'Narrow-only: may never relax constitutional safeguards or widen authority '
  '(enforced by lib/practiceField/fieldGuidance.ts). Live, not snapshotted.';
