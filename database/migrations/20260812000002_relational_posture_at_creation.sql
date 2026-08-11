-- ============================================================================
-- Relational observation posture at creation
--
-- Founder ruling 2026-08-11 (Person Continuity, Step 1 of 6):
--   "Add posture_at_creation to future relational observation writes, persist it
--    explicitly from the already-required RelationalObservationPosture, and fail
--    closed if posture cannot be determined."
--
-- WHY THIS EXISTS
--   `observeRelationalContent` already receives the turn's consent posture as a
--   REQUIRED argument (RU-0, 2026-08-10) and already refuses outright under
--   Sanctuary. But the rows it writes record nothing about that posture — the
--   writer knows, and the store throws the knowledge away.
--
--   Consequence, measured in production 2026-08-11: relationship_entries holds
--   1,165 rows and member_relationships 44, and NOT ONE can state the posture it
--   was created under. Their eligibility for retrieval is therefore not
--   determinable. That is why the named-person reader
--   (getMemberActiveRelationalContext) has never been wired to the live
--   conversational route — see docs/ops/PERSON_CONTINUITY_FAILURE_MAP_2026-08-11.md
--   and the retirement note at app/api/oracle/conversation/route.ts:449
--   ("pending Sanctuary-governed persistence").
--
-- WHAT THIS DOES *NOT* DO — founder boundaries, 2026-08-11, verbatim scope
--   - no historical backfill
--   - no inference of posture for the existing 1,165 entries
--   - no named-person extraction
--   - no change to catch-all behaviour ('Unresolved Relational Field')
--   - no live-reader wiring
--   - no reclassification of existing rows
--   - no automatic relationship creation
--   - no Sanctuary weakening
--
-- ON 'unknown-historical'
--   Existing rows receive 'unknown-historical'. This is NOT a backfill and NOT
--   an inference — it is the honest name for "this row cannot state its posture."
--   It is deliberately a value a reader must exclude, never one it may trust.
--   The governing invariant (founder, 2026-08-11):
--
--     "Person continuity may become stronger only for relational material whose
--      retrieval eligibility is durably knowable. Unknown historical posture is
--      not authorization to surface."
--
--   Mirrors the S5 provenance substrate precedent
--   (20260718000001_s5_provenance_substrate.sql) on conversation_turns, whose
--   comment states the same principle: a real answer, never a silently
--   backfilled "normal".
--
-- Idempotent: safe to re-run.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Columns. DEFAULT exists only to label the historical corpus honestly, then
--    is dropped so new rows MUST state their posture explicitly.
-- ----------------------------------------------------------------------------
ALTER TABLE member_relationships
  ADD COLUMN IF NOT EXISTS posture_at_creation TEXT NOT NULL DEFAULT 'unknown-historical';
ALTER TABLE member_relationships ALTER COLUMN posture_at_creation DROP DEFAULT;

ALTER TABLE relationship_entries
  ADD COLUMN IF NOT EXISTS posture_at_creation TEXT NOT NULL DEFAULT 'unknown-historical';
ALTER TABLE relationship_entries ALTER COLUMN posture_at_creation DROP DEFAULT;

ALTER TABLE relationship_entry_patterns
  ADD COLUMN IF NOT EXISTS posture_at_creation TEXT NOT NULL DEFAULT 'unknown-historical';
ALTER TABLE relationship_entry_patterns ALTER COLUMN posture_at_creation DROP DEFAULT;

-- ----------------------------------------------------------------------------
-- 2. Vocabulary constraint — the same three values as conversation_turns.
-- ----------------------------------------------------------------------------
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['member_relationships','relationship_entries','relationship_entry_patterns']
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = t || '_posture_valid'
    ) THEN
      EXECUTE format(
        'ALTER TABLE %I ADD CONSTRAINT %I CHECK (posture_at_creation IN (''normal'', ''sanctuary'', ''unknown-historical''))',
        t, t || '_posture_valid'
      );
    END IF;
  END LOOP;
END $$;

-- ----------------------------------------------------------------------------
-- 3. Mint gate. The application fails closed; this is the structural backstop so
--    that even raw SQL cannot write an unattested relational row.
--
--    Two refusals, both fail-closed:
--      - 'sanctuary'          — canon: nothing from a sanctuary session may be
--                               saved, extracted or inferred into long-term
--                               memory. Sanctuary rows must never persist here.
--      - 'unknown-historical' — may never be MINTED anew. It is a label for
--                               rows that predate this migration, not a value a
--                               new write may choose. This is what stops a
--                               future caller from quietly re-opening the
--                               indeterminacy this migration closes.
--
--    UPDATE is deliberately not gated: this migration does not govern
--    correction/lifecycle, only creation.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION relational_require_known_posture() RETURNS trigger AS $$
BEGIN
  IF NEW.posture_at_creation IS NULL OR NEW.posture_at_creation <> 'normal' THEN
    RAISE EXCEPTION
      'REFUSED: % may only be created under a known posture of ''normal'' (got %). Sanctuary content must not persist; ''unknown-historical'' may not be minted anew.',
      TG_TABLE_NAME, COALESCE(NEW.posture_at_creation, 'NULL')
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END $$ LANGUAGE plpgsql;

DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['member_relationships','relationship_entries','relationship_entry_patterns']
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON %I', t || '_posture_mint_gate', t);
    EXECUTE format(
      'CREATE TRIGGER %I BEFORE INSERT ON %I FOR EACH ROW EXECUTE FUNCTION relational_require_known_posture()',
      t || '_posture_mint_gate', t
    );
  END LOOP;
END $$;

-- ----------------------------------------------------------------------------
-- 4. Documentation on the columns themselves, so the constraint is legible to
--    anyone reading the schema without this file.
-- ----------------------------------------------------------------------------
COMMENT ON COLUMN member_relationships.posture_at_creation IS
  'Consent posture of the turn/gesture that created this row. ''normal'' only for new rows (mint gate); ''unknown-historical'' marks pre-2026-08-12 rows whose posture is not determinable and which readers must exclude.';
COMMENT ON COLUMN relationship_entries.posture_at_creation IS
  'Consent posture of the turn/gesture that created this row. ''normal'' only for new rows (mint gate); ''unknown-historical'' marks pre-2026-08-12 rows whose posture is not determinable and which readers must exclude.';
COMMENT ON COLUMN relationship_entry_patterns.posture_at_creation IS
  'Consent posture of the turn that created this row. ''normal'' only for new rows (mint gate); ''unknown-historical'' marks pre-2026-08-12 rows whose posture is not determinable and which readers must exclude.';
