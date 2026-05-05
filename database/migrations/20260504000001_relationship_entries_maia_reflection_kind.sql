-- Add 'maia_reflection' to relationship_entries kind constraint

ALTER TABLE relationship_entries
DROP CONSTRAINT IF EXISTS relationship_entries_kind_check;

ALTER TABLE relationship_entries
ADD CONSTRAINT relationship_entries_kind_check
CHECK (
  kind IN (
    'checkin',
    'note',
    'reflection',
    'threshold',
    'rupture',
    'repair',
    'maia_reflection'
  )
);
