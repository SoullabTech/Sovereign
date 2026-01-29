-- Phase 2K-b: Redelivery tracking for "Returning" badge
-- Track how many times a message has been surfaced

ALTER TABLE selflet_messages
  ADD COLUMN IF NOT EXISTS delivery_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS first_delivered_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_delivered_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_snoozed_at timestamptz;
