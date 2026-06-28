-- First-arrival orientation layer.
--
-- orientation_seen       — redirect gate; false → /orient before /maia
-- orientation_arrival_energy — the member's own words when asked "what brought you here?"
--                              stored verbatim; this is the signal MAIA uses, not a category
-- primary_orientation_need   — lightweight derived hint (retained for future use / analytics)
--
-- Existing members: considered oriented, no arrival energy stored (they arrived before this existed).

ALTER TABLE members
  ADD COLUMN IF NOT EXISTS orientation_seen BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE members
  ADD COLUMN IF NOT EXISTS orientation_arrival_energy TEXT;

ALTER TABLE members
  ADD COLUMN IF NOT EXISTS primary_orientation_need VARCHAR(50);

UPDATE members SET orientation_seen = true WHERE onboarded = true;
