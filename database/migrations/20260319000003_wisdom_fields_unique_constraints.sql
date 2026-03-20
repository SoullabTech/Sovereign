-- ============================================
-- WISDOM FIELDS — unique constraints
-- Enables idempotent seed upserts on core ideas and works.
-- ============================================

ALTER TABLE wisdom_field_core_ideas
  ADD CONSTRAINT uq_wfci_field_concept UNIQUE (field_id, concept);

ALTER TABLE wisdom_field_works
  ADD CONSTRAINT uq_wfw_field_title UNIQUE (field_id, title);
