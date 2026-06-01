-- Episodic Memory — Member-Marked Provenance (Option 1)
--
-- DOCTRINE (load-bearing):
--   "Episodic memory preserves member-marked significance.
--    It does not manufacture significance."
--
-- WHY THIS MIGRATION EXISTS
--   The original table (20260115000010_episodic_memories.sql) was built for the
--   dangerous version. It does not merely PERMIT system-authored meaning — it
--   DEFAULTS to it:
--       significance         INTEGER       NOT NULL DEFAULT 5
--       emotional_intensity  NUMERIC(3,2)  NOT NULL DEFAULT 0.5
--       breakthrough_level   INTEGER       NOT NULL DEFAULT 0
--       experience_title     TEXT          NOT NULL
--       experience_description TEXT        NOT NULL
--   A write that omits significance does not leave it empty; Postgres INVENTS 5.
--   That is the manufacture-significance move encoded as a column default — the
--   schema authoring meaning the member never supplied.
--
-- WHAT THIS MIGRATION DOES
--   1. Strips the manufacturing DEFAULTs and NOT NULLs from the interpretive
--      columns so NULL becomes expressible. After this, a NULL in significance /
--      emotional_intensity / breakthrough_level / experience_title means exactly
--      one thing: "the system did not author this." A column that CAN be null is
--      a column the system is FORBIDDEN from inventing.
--   2. Adds the provenance-safe subset as first-class columns. A member-marked
--      episode is stored with ONLY:
--        user_id (the member id), episode_id, verbatim_text, source_turn_id,
--        source_session_id, marked_by_member = TRUE, created_at
--      Every interpretive column stays NULL unless a human explicitly authored it.
--   3. Adds members.episodic_recall_enabled (opt-out consent gate, default TRUE),
--      mirroring members.conversational_recall_enabled.
--
-- WHAT THIS MIGRATION DOES NOT DO
--   - It does NOT wire any write path. storeEpisode (the legacy dangerous-version
--     method) stays untouched and uncalled. The member-mark gesture is a later,
--     deliberately-gated diff.
--   - It does NOT backfill or reinterpret existing rows. Legacy system-authored
--     rows (if any; there are ~0 callers) keep their values and remain
--     marked_by_member = FALSE.
--
-- ACCEPTANCE TEST (must pass after the write path opens):
--   SELECT experience_title, significance, emotional_intensity,
--          breakthrough_level, archetypal_resonances
--     FROM episodic_memories
--    WHERE marked_by_member = TRUE
--    ORDER BY created_at DESC LIMIT 5;
--   Expected: title/significance/intensity/breakthrough all NULL,
--             archetypal_resonances = [] — unless explicitly member-provided.

BEGIN;

-- 1. Refuse the schema's temptation.
--    DROP NOT NULL on already-nullable columns and DROP DEFAULT where none
--    exists are both no-ops in Postgres, so this migration is re-runnable.
ALTER TABLE episodic_memories
  ALTER COLUMN experience_title        DROP NOT NULL,
  ALTER COLUMN experience_description  DROP NOT NULL,
  ALTER COLUMN significance            DROP NOT NULL,
  ALTER COLUMN significance            DROP DEFAULT,
  ALTER COLUMN emotional_intensity     DROP NOT NULL,
  ALTER COLUMN emotional_intensity     DROP DEFAULT,
  ALTER COLUMN breakthrough_level      DROP NOT NULL,
  ALTER COLUMN breakthrough_level      DROP DEFAULT;

-- 2. Provenance-safe subset (member-marked verbatim). The verbatim_text column
--    is the ONLY authored content in a member-marked episode; the system never
--    writes here on the member's behalf.
ALTER TABLE episodic_memories
  ADD COLUMN IF NOT EXISTS verbatim_text      TEXT,
  ADD COLUMN IF NOT EXISTS marked_by_member   BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS source_turn_id     TEXT,
  ADD COLUMN IF NOT EXISTS source_session_id  TEXT;

-- 3. Integrity guard: a member-marked episode MUST carry verbatim text, and any
--    row carrying verbatim text MUST be member-marked. Prevents a future caller
--    from quietly routing system-authored text through the verbatim channel.
--    Existing rows (marked_by_member = FALSE) satisfy this and are not touched.
ALTER TABLE episodic_memories
  DROP CONSTRAINT IF EXISTS episodic_member_marked_requires_verbatim;
ALTER TABLE episodic_memories
  ADD CONSTRAINT episodic_member_marked_requires_verbatim
  CHECK (
    -- verbatim_text is non-empty IF AND ONLY IF marked_by_member is TRUE.
    --   member-marked      => MUST carry non-empty verbatim (no empty marks)
    --   not member-marked  => verbatim channel stays NULL (no system text smuggled in)
    (marked_by_member = TRUE  AND verbatim_text IS NOT NULL AND length(btrim(verbatim_text)) > 0)
    OR
    (marked_by_member = FALSE AND verbatim_text IS NULL)
  );

-- 4. Read-path index: surface a member's marked moments by recency, cheaply.
CREATE INDEX IF NOT EXISTS idx_episodic_member_marked
  ON episodic_memories (user_id, created_at DESC)
  WHERE marked_by_member = TRUE;

COMMENT ON COLUMN episodic_memories.verbatim_text IS
  'Member-marked verbatim words. The ONLY authored content in a member-marked episode. The system never writes here on the member''s behalf.';
COMMENT ON COLUMN episodic_memories.marked_by_member IS
  'TRUE only when the member explicitly marked this moment. Legacy/system-authored rows remain FALSE.';
COMMENT ON COLUMN episodic_memories.source_turn_id IS
  'The conversation turn the member marked (provenance pointer). Nullable.';
COMMENT ON COLUMN episodic_memories.source_session_id IS
  'The session in which the member marked the moment (provenance pointer). Nullable.';

-- 5. Consent gate (opt-out), mirroring members.conversational_recall_enabled.
ALTER TABLE members
  ADD COLUMN IF NOT EXISTS episodic_recall_enabled BOOLEAN NOT NULL DEFAULT TRUE;

COMMENT ON COLUMN members.episodic_recall_enabled IS
  'Member opt-out for episodic recall (member-marked moments resurfacing in the prompt). Default TRUE; the member can disable it.';

COMMIT;
