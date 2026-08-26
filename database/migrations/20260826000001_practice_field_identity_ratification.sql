-- Practice Field — identity-layer ratification (NW-A02, 2026-08-26)
--
-- Founder ruling 2026-08-26 (NW-A01 → NW-A02, repair 5):
--   "about_practice and how_we_work_together should require practitioner
--    ratification before composing into a real field. They are identity/
--    self-description layers, not generic system configuration. Demo content
--    can exist, but it should not govern a real practitioner room as though
--    authored."
--
-- NW-A01 established that these two columns compose directly into MAIA's
-- system prompt with no gate at save time and none at compose time. This adds
-- the missing signal: an explicit, attributed act saying "this self-description
-- is mine and may govern my rooms."
--
-- Scope discipline: this is NOT a general authority framework. It is one
-- nullable timestamp and one actor, gating two named columns. Corpus keeps its
-- own hard gate (corpusIsComposable); maia_guidance keeps its own narrow-only
-- validation. Three different questions, three different mechanisms — see
-- NW-A01's closing table for why a single gate would be the wrong shape.
--
-- Absence is not permission: NULL means "not ratified", and unratified identity
-- text does not compose.

ALTER TABLE practice_fields
  ADD COLUMN IF NOT EXISTS identity_ratified_at TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS identity_ratified_by UUID NULL REFERENCES members(id);

COMMENT ON COLUMN practice_fields.identity_ratified_at IS
  'NW-A02: when the practitioner ratified about_practice + how_we_work_together as their own authored self-description. NULL = unratified; those columns do not compose into MAIA''s prompt. Absence is not permission.';

COMMENT ON COLUMN practice_fields.identity_ratified_by IS
  'NW-A02: which member performed the ratification act. Attribution, not authorship.';

-- Any content edit to either column must clear the ratification: a ratified
-- sentence that is then rewritten is no longer the sentence that was ratified.
CREATE OR REPLACE FUNCTION practice_fields_clear_identity_ratification()
RETURNS TRIGGER AS $$
BEGIN
  IF (NEW.about_practice IS DISTINCT FROM OLD.about_practice)
     OR (NEW.how_we_work_together IS DISTINCT FROM OLD.how_we_work_together) THEN
    -- Only clear when the caller did not ratify in this same statement.
    IF NEW.identity_ratified_at IS NOT DISTINCT FROM OLD.identity_ratified_at THEN
      NEW.identity_ratified_at := NULL;
      NEW.identity_ratified_by := NULL;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_practice_fields_clear_identity_ratification ON practice_fields;
CREATE TRIGGER trg_practice_fields_clear_identity_ratification
  BEFORE UPDATE ON practice_fields
  FOR EACH ROW
  EXECUTE FUNCTION practice_fields_clear_identity_ratification();
