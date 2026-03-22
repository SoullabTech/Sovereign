-- SoulComms: Private channel membership roles
-- Adds role, invited_by columns to team_channel_members
-- Ensures creator is recorded as owner when channels are created

ALTER TABLE team_channel_members
  ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'member'
    CHECK (role IN ('owner', 'admin', 'member'));

ALTER TABLE team_channel_members
  ADD COLUMN IF NOT EXISTS invited_by UUID REFERENCES members(id);
