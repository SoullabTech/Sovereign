-- Add still_here_count to track the "Still here" witness gesture
--
-- Phase 1.5+ — first ship of the witness-as-gesture affordance.
--
-- Architectural reasoning:
--   "Still here" gives the keep its own grammar. The keep stops being
--   a passive state and becomes an active gesture — the member can
--   return-to-this without being asked to do more than return.
--
-- This counter is incremented by the existing 'touch' AtomGesture; it
-- adds no new gesture logic. It gives the touch gesture a countable
-- signal so we can watch which atoms invite witness vs which invite
-- translation (via member_lens_passes count per atom).
--
-- Universal deployment, asymmetric attention:
--   the affordance pair appears on every kept atom;
--   the data reveals what members reached for, by atom, over time.
--   The system never classifies which atoms are heavy or light —
--   the counters let the steward see what members differentiated.

ALTER TABLE member_memory_atoms
  ADD COLUMN IF NOT EXISTS still_here_count INTEGER NOT NULL DEFAULT 0
  CHECK (still_here_count >= 0);

COMMENT ON COLUMN member_memory_atoms.still_here_count IS
  'Count of touch gestures dispatched against this atom — the "Still here" affordance. Witness-as-gesture counter. Compare with COUNT(*) from member_lens_passes per atom to see member differentiation between witness and translation.';
