-- Add Spiralogic mapping columns to navigator_decisions
-- Migration: 20251208_add_spiralogic_columns.sql

ALTER TABLE navigator_decisions
    ADD COLUMN IF NOT EXISTS spiral_domain TEXT,   -- e.g. 'vocation', 'relationship', 'initiation'
    ADD COLUMN IF NOT EXISTS spiral_phase  TEXT,   -- e.g. 'call', 'descent', 'emergence'
    ADD COLUMN IF NOT EXISTS spiral_facet  TEXT;   -- e.g. 'Fire2', 'Water2', 'Earth1'

-- Add index for common queries
CREATE INDEX IF NOT EXISTS idx_navigator_decisions_spiral_facet ON navigator_decisions(spiral_facet);
CREATE INDEX IF NOT EXISTS idx_navigator_decisions_spiral_phase ON navigator_decisions(spiral_phase);

-- Add comments for clarity
COMMENT ON COLUMN navigator_decisions.spiral_domain IS 'Domain of spiral work: vocation, relationship, initiation, etc.';
COMMENT ON COLUMN navigator_decisions.spiral_phase IS 'Phase within spiral: call, descent, emergence';
COMMENT ON COLUMN navigator_decisions.spiral_facet IS 'Spiralogic facet signature: Fire1, Fire2, Water1, Water2, Earth1, Earth2, Air1, Air2, Air3, Aether1';