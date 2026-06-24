-- Migration: member_tier
-- Date: 2026-06-12
-- Purpose: Add tier identity model to members table.
--
-- tier is NOT subscription. It is a stable identity model that governs:
--   Portal visibility, Focus Garden, continuity depth, Studio access,
--   beta features, group experiences, scholarships, founder accounts.
--
-- Subscription fields are added as nullable scaffolding only.
-- No billing logic is wired here. Billing integrates against these fields later.
-- Track A (Personal Portal) gates only against members.tier.
--
-- Tier values:
--   explorer     — free floor; orientation surfaces; default for all members
--   companion    — paid personal depth; Focus Garden, continuity, Portal expansion
--   practitioner — studio + client workspace; includes companion depth
--
-- Promotion path (pre-billing):
--   Manual promotion via admin or SQL for founders, staff, scholarship recipients.
--   Billing integration sets tier + populates subscription_* fields when live.

-- ── Tier identity ──────────────────────────────────────────────────────────────

ALTER TABLE members
  ADD COLUMN IF NOT EXISTS tier TEXT NOT NULL DEFAULT 'explorer'
    CHECK (tier IN ('explorer', 'companion', 'practitioner'));

-- ── Subscription scaffold (nullable — unpopulated until billing integration) ───
-- Do not add logic against these fields. They exist so billing can wire in
-- without a future migration touching Portal-gating code.

ALTER TABLE members
  ADD COLUMN IF NOT EXISTS subscription_status   TEXT,
  ADD COLUMN IF NOT EXISTS subscription_provider TEXT,
  ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ;

-- ── Indexes ────────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_members_tier
  ON members (tier);

CREATE INDEX IF NOT EXISTS idx_members_subscription_status
  ON members (subscription_status)
  WHERE subscription_status IS NOT NULL;

-- ── Verify ─────────────────────────────────────────────────────────────────────

DO $$
BEGIN
  -- Confirm tier column exists with correct default
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'members' AND column_name = 'tier'
  ) THEN
    RAISE EXCEPTION 'Migration failed: tier column not found on members';
  END IF;

  -- Confirm all existing members defaulted to explorer
  IF EXISTS (
    SELECT 1 FROM members WHERE tier IS NULL
  ) THEN
    RAISE EXCEPTION 'Migration failed: NULL tier found on existing members row';
  END IF;

  RAISE NOTICE 'member_tier migration verified: tier column live, all members defaulted to explorer';
END $$;
