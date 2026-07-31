-- Working draft concurrency and idempotency (Phase A)
--
-- Fixes a real integrity defect: PUT /draft did a bare UPDATE, so the same
-- member writing from two tabs or two devices could silently overwrite the
-- other. Saves now compare-and-advance against a version the client last saw.
--
-- version advances on EVERY write (autosave, checkpoint, restore).
-- revision_count is left alone: it still counts append-only revisions, which
-- is a different question from "has this draft changed since you loaded it".
--
-- Idempotency is recorded on the draft row rather than in a new table. It
-- covers the retry that actually happens — a client re-sending its most recent
-- request. An older key replayed after newer writes is not recognised; it is
-- then judged on its base version and correctly refused as stale_base, which
-- is safe. Scope of the record is (member, draft, operation, payload hash);
-- member and draft are implied by the row it lives on.
--
-- Additive only. No data movement. No retention change.

ALTER TABLE manuscript_working_drafts
  ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 1;

ALTER TABLE manuscript_working_drafts
  ADD COLUMN IF NOT EXISTS last_idempotency_key TEXT;

ALTER TABLE manuscript_working_drafts
  ADD COLUMN IF NOT EXISTS last_idempotency_op TEXT;

ALTER TABLE manuscript_working_drafts
  ADD COLUMN IF NOT EXISTS last_idempotency_payload_hash TEXT;

ALTER TABLE manuscript_working_drafts
  ADD COLUMN IF NOT EXISTS last_idempotency_response JSONB;

COMMENT ON COLUMN manuscript_working_drafts.version IS
  'Advances on every write. Clients send it as baseRevisionId; a mismatch is 409 stale_base.';
COMMENT ON COLUMN manuscript_working_drafts.last_idempotency_key IS
  'Most recent client-supplied idempotency key. Same key + same payload replays; same key + different payload is 409 idempotency_key_reuse.';
