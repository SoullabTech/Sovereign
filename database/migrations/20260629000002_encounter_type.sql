-- Add encounter_type to encounters table
-- Encounter is a platform primitive; type determines the Session Room lens and MAIA inquiry mode.
-- See docs/canon/ENCOUNTER_AS_PRIMITIVE.md

ALTER TABLE encounters
  ADD COLUMN IF NOT EXISTS encounter_type TEXT NOT NULL DEFAULT 'therapy_session'
    CHECK (encounter_type IN (
      'therapy_session',
      'coaching_session',
      'maia_conversation',
      'journal',
      'dream',
      'meeting',
      'workshop',
      'teaching_session',
      'voice_memo',
      'nature_reflection',
      'supervision',
      'group_session',
      'family_conversation',
      'other'
    ));

COMMENT ON COLUMN encounters.encounter_type IS
  'The kind of lived experience. Determines Session Room lens, MAIA inquiry mode, and developmental tracking. See docs/canon/ENCOUNTER_AS_PRIMITIVE.md';
