-- Allow members to hide DM threads from their sidebar without deleting them.
ALTER TABLE team_dm_members ADD COLUMN IF NOT EXISTS hidden_at TIMESTAMPTZ;
