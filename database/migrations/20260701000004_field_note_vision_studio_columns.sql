-- Vision Studio field-note: add spiralogic_phase + field_context to member_field_note_threads.
--
-- Additive, idempotent, schema-only, not user-facing. Required before the
-- /api/maia/vision-studio/field-note route can be deployed — that route reads and writes
-- both columns (the field-lab sibling does not). Applying this does NOT deploy the route
-- and does NOT un-gate Vision Studio from nav; it only makes the schema ready.
ALTER TABLE member_field_note_threads
  ADD COLUMN IF NOT EXISTS spiralogic_phase TEXT,
  ADD COLUMN IF NOT EXISTS field_context TEXT;
