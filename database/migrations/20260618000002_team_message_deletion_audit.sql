-- Team messaging — message deletion audit metadata
--
-- Messages are soft-deleted: deleted_at is set, the row is retained, and every
-- read path (getMessages / getReplies / getMessagesSince) excludes it. This adds
-- WHO performed the deletion so there is an accountable trail for moderation,
-- independent of whether any UI surfaces it. Governance data lives in the data
-- layer regardless of the interface.
--
--   deleted_by     — member who soft-deleted the message (the sender, or a
--                    channel/team moderator). Set together with deleted_at.
--   deleted_reason — optional moderator-supplied reason. No capture UI yet; the
--                    column is reserved so a future moderation flow needs no migration.
--
-- IP is deliberately NOT recorded: a sovereignty/Sanctuary-first system does not
-- accumulate speculative surveillance data with no current consumer. Revisit only
-- if a concrete forensic requirement is established.

ALTER TABLE team_messages
  ADD COLUMN IF NOT EXISTS deleted_by     UUID REFERENCES members(id),
  ADD COLUMN IF NOT EXISTS deleted_reason TEXT;

COMMENT ON COLUMN team_messages.deleted_by IS
  'Member who soft-deleted this message (sender or moderator). Set together with deleted_at.';
COMMENT ON COLUMN team_messages.deleted_reason IS
  'Optional moderator-supplied reason for deletion. No capture UI yet; reserved for moderation.';
