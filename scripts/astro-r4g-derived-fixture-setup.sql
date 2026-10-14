-- R4G networkless fictitious PostgreSQL derived-memory adversarial fixture.
-- Prerequisite R4F seed + R4F migration; no real charts, identities, or keys.
\set ON_ERROR_STOP on
ALTER TABLE conversation_turns ADD COLUMN exchange_id uuid;

CREATE TABLE developmental_memories (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL,
  source_exchange_id uuid,
  content_text text
);
CREATE TABLE semantic_memory_vectors (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL,
  chunk_text text
);
CREATE TABLE breakthrough_moments (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL,
  insight text
);
-- Apply the proposed R4G migration separately after these tables exist.
