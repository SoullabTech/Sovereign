-- 20260625000001_coherence_captures_optional_classification.sql
-- MAIA Coherence Engine — make `classification` OPTIONAL.
-- Doctrine: docs/canon/MAIA_COHERENCE_ENGINE_v0.md (Doctrine 6 — "Capture is not
-- commitment"): a held item may carry no classification at all; classification is
-- an optional, later, consented act, never required or inferred at capture.
--
-- Before: classification NOT NULL DEFAULT 'today' (forced a disposition at capture).
-- After:  classification nullable, no default — NULL means "held, unsorted".
-- The CHECK constraint already permits NULL (NULL passes a CHECK), so it is unchanged.
-- Existing rows keep whatever value they already have; only new captures may be NULL.
--
-- Idempotent: DROP DEFAULT / DROP NOT NULL are no-ops if already applied.

ALTER TABLE coherence_captures ALTER COLUMN classification DROP DEFAULT;
ALTER TABLE coherence_captures ALTER COLUMN classification DROP NOT NULL;

COMMENT ON COLUMN coherence_captures.classification IS
  'Optional member-chosen disposition: today | later | time_sensitive | ongoing, or NULL (held, unsorted). Never required or AI-inferred at capture (Doctrine 6).';
