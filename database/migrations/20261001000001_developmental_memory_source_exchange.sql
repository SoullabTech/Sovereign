-- MAIA-DEVELOPMENTAL-ANCESTRY-01 · I0 schema act
--
-- Forward-only provenance carrier for developmental memories derived from
-- a durable member↔MAIA conversation exchange.
--
-- Historical rows remain NULL. No backfill is authorized.
-- No FK is added: conversation_turns.exchange_id identifies a two-row pair,
-- not one unique row, so a row-level FK would encode the wrong source object.

BEGIN;
SET LOCAL lock_timeout = '5s';

ALTER TABLE developmental_memories
  ADD COLUMN IF NOT EXISTS source_exchange_id UUID;

CREATE INDEX IF NOT EXISTS idx_developmental_memories_source_exchange
  ON developmental_memories (source_exchange_id)
  WHERE source_exchange_id IS NOT NULL;

COMMENT ON COLUMN developmental_memories.source_exchange_id IS
  'Forward-only provenance pointer to conversation_turns.exchange_id for the exact member-MAIA exchange from which this derived memory was formed. NULL means exact exchange ancestry was not durably recorded; it must not be heuristically backfilled.';

COMMIT;
