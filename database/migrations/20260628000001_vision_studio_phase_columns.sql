-- Vision Studio: phase and field context columns on field note threads
-- Enables the Spiralogic Interview arc (Fire I/II/III etc.) to tag evidence
-- by phase and surface it to the facilitating practitioner.
-- can_be_shown_to_practitioner is set TRUE at insert time for Vision Studio
-- threads (explicit practitioner-facilitated context, not private journal).

ALTER TABLE member_field_note_threads
  ADD COLUMN IF NOT EXISTS spiralogic_phase TEXT,
  ADD COLUMN IF NOT EXISTS field_context TEXT;

CREATE INDEX IF NOT EXISTS idx_fnth_spiralogic_phase
  ON member_field_note_threads (spiralogic_phase)
  WHERE spiralogic_phase IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_fnth_field_context
  ON member_field_note_threads (field_context, member_id)
  WHERE field_context IS NOT NULL;
