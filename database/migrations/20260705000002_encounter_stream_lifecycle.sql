-- Encounter Stewardship — Phase B step 2: stream lifecycle + evidence immutability.
-- Extends 20260705000001. Two additions the Evidence layer requires:
--
--   1. Explicit lifecycle: pending → recording → stopped | canceled.
--      'canceled' is a terminal state whose media is discarded — a participant changing
--      their mind mid-recording must leave no evidence behind.
--   2. Evidence immutability (structural): once a stream reaches a terminal state
--      ('stopped' or 'canceled'), NO further UPDATE is permitted on the row. Raw media
--      is immutable once committed. Corrections happen downstream (transcript_turns
--      correction_status), never on evidence.
--
-- sha256/byte_size are recorded at commit so file-level tampering is detectable even
-- though the filesystem itself is outside the database's jurisdiction (Grade B there;
-- the row is Grade A).

-- ── Lifecycle: add 'canceled' terminal state ────────────────────────────────
ALTER TABLE encounter_media_streams
  DROP CONSTRAINT IF EXISTS encounter_media_streams_status_check;
ALTER TABLE encounter_media_streams
  ADD CONSTRAINT encounter_media_streams_status_check
  CHECK (status IN ('pending','recording','stopped','canceled'));

-- ── Evidence integrity columns ──────────────────────────────────────────────
ALTER TABLE encounter_media_streams
  ADD COLUMN IF NOT EXISTS sha256 TEXT NULL,
  ADD COLUMN IF NOT EXISTS byte_size BIGINT NULL;

-- ── Immutability + legal-transition guard ───────────────────────────────────
CREATE OR REPLACE FUNCTION enforce_stream_lifecycle()
RETURNS TRIGGER AS $$
BEGIN
  -- Terminal states are immutable: no field of a committed or canceled stream may change.
  IF OLD.status IN ('stopped','canceled') THEN
    RAISE EXCEPTION 'evidence-immutability: stream % is % and cannot be modified', OLD.id, OLD.status;
  END IF;
  -- Only legal transitions may occur.
  IF NEW.status <> OLD.status THEN
    IF NOT (
      (OLD.status = 'pending'   AND NEW.status = 'recording') OR
      (OLD.status = 'recording' AND NEW.status IN ('stopped','canceled'))
    ) THEN
      RAISE EXCEPTION 'stream-lifecycle: illegal transition % -> %', OLD.status, NEW.status;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_enforce_stream_lifecycle ON encounter_media_streams;
CREATE TRIGGER trg_enforce_stream_lifecycle
  BEFORE UPDATE ON encounter_media_streams
  FOR EACH ROW EXECUTE FUNCTION enforce_stream_lifecycle();
