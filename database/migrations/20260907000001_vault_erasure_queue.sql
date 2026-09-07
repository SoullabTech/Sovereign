-- WS-DELETE-01 — the erasure-in-progress state.
--
-- Founder ruling 2026-09-07: "Delete Work" means Soullab relinquishes custody.
-- It must not mean hidden, archived, DETACHED, or unreferenced but retained.
--
-- Two of those are failure states of the ACT, not of its intent, and they sit on
-- opposite sides of the same seam: relational rows commit atomically, vault bytes
-- do not, and no transaction spans both. Whichever half goes first, a crash in
-- between leaves a forbidden state:
--
--   bytes first  → a live Work pointing at material already destroyed  (DETACHED)
--   rows first   → bytes on disk that nothing names and nothing can find
--                                                    (UNREFERENCED BUT RETAINED)
--
-- The first implementation chose rows-first and answered the second failure with
-- "the member can press Delete again." The founder refused that: retryability is
-- not invariance, and a forbidden state does not become permitted because another
-- click can repair it.
--
-- This table removes the choice. The paths to destroy are written down INSIDE the
-- transaction that deletes the rows, so the intermediate state is never a Work and
-- never a nameless blob — it is a named, non-live erasure still in progress, and
-- the row that names it is the instruction for finishing it.
--
--   commit succeeds, sweep succeeds  → nothing survives, queue row deleted
--   commit succeeds, sweep fails     → queue row stands, and an INDEPENDENT
--                                      consumer finishes it later:
--                                      scripts/ops/sweep-vault-erasure-queue.ts
--
-- That second consumer is what makes "self-completing" true rather than hopeful
-- (founder ruling, 2026-09-07). A row revisited only by the request that created
-- it is a permanent obligation wearing an honest label.
--   commit fails                     → nothing was destroyed; the Work is intact
--
-- The member's Work is therefore gone the moment the transaction commits, in the
-- only sense the member can observe, and the bytes are guaranteed to be REACHABLE
-- for destruction until they are actually destroyed.
--
-- ── What this table may hold ──────────────────────────────────────────────
-- A vault path and nothing else. It is an instruction to destroy, not a record of
-- what was destroyed: no member id, no manuscript id, no title, no source text,
-- no hash. The founder's qualification on standing events applies here with more
-- force, because this row OUTLIVES the erasure it serves — it must never be
-- capable of reconstructing, identifying, or attributing the writing it came from.
-- On success it is deleted; it is not an audit log.
--
-- NOT a general lifecycle system. It has exactly one producer (the manuscript
-- DELETE act) and one consumer (the sweep). Anything wanting a broader deletion
-- lifecycle needs its own ruling.

BEGIN;

CREATE TABLE IF NOT EXISTS vault_erasure_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Vault-relative path. Deliberately NOT unique: the same path arriving twice is
  -- two instructions to destroy it, and destroying an absent path succeeds.
  artifact_ref text NOT NULL CHECK (length(artifact_ref) > 0),

  queued_at timestamptz NOT NULL DEFAULT now(),
  attempts int NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  last_attempt_at timestamptz,

  -- Why the last sweep failed, as an ERRNO ONLY (EACCES, EPERM, EROFS…) and never
  -- the error message. A filesystem message embeds the full path, which would put
  -- the vault path into a second column and give this row more provenance than the
  -- single field it is allowed. The errno is also the half an operator can act on.
  last_error text CHECK (last_error IS NULL OR length(last_error) <= 32)
);

-- The sweep's only query: oldest unfinished first.
CREATE INDEX IF NOT EXISTS idx_vault_erasure_queue_pending
  ON vault_erasure_queue(queued_at ASC);

COMMENT ON TABLE vault_erasure_queue IS
  'WS-DELETE-01. Vault paths whose bytes are owed destruction because the relational rows naming them have already been deleted. A row here means an erasure is in progress, not that one occurred: rows are removed on success and this table is not an audit log. Holds no member, manuscript, or content reference.';

COMMIT;

-- ROLLBACK (manual):
--   DROP TABLE IF EXISTS vault_erasure_queue;
