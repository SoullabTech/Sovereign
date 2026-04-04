-- Inner Guide Field: facet state columns on member_spiral_state
-- Tracks which facet a member is currently in and their movement direction.
-- Extends Bridge D rather than creating a new table.

ALTER TABLE member_spiral_state
  ADD COLUMN IF NOT EXISTS facet_id TEXT,
  ADD COLUMN IF NOT EXISTS facet_movement TEXT;

COMMENT ON COLUMN member_spiral_state.facet_id IS 'Current Inner Guide Field facet (e.g. fire_1, water_2)';
COMMENT ON COLUMN member_spiral_state.facet_movement IS 'Movement direction within facet (ascending, descending, stuck, transitioning, integrating)';
