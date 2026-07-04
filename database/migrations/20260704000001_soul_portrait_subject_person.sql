-- Soul Portrait — Stage 1: subject_person_id (client linkage to the studio directory).
--
-- Adds a nullable FK from a portrait's SUBJECT to studio_people — the practitioner's
-- canonical per-practitioner relationship directory — so a portrait can be ABOUT a
-- client/friend who does NOT (yet) have a MAIA member account.
--
-- subject_member_id is PRESERVED and untouched: it links the subject to a member
-- ACCOUNT when one exists. The two are orthogonal dimensions of "who this is about":
--   * subject_person_id  → the practitioner directory record (relationship/identity)
--   * subject_member_id  → a MAIA member account (account status), when present
-- A subject may have either, both, or neither (a minor without an account).
--
-- ADDITIVE · nullable · idempotent · self-protecting. Zero runtime change on apply.
-- Stage 1 is INTERNAL-ONLY: no delivery/client surface consumes this column yet.
-- @see docs/architecture/SOUL_PORTRAIT_STUDIO_STAGE1_BOUNDARY.md

-- ── Prerequisite guard ──────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'soul_portraits') THEN
    RAISE EXCEPTION 'Stage 1: prerequisite table "soul_portraits" (Gate 2) missing; apply 20260702000004 first';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'studio_people') THEN
    RAISE EXCEPTION 'Stage 1: FK target "studio_people" missing; apply 20260627000001 first';
  END IF;
END $$;

-- ── The client link: nullable FK to the practitioner directory ──────────────
ALTER TABLE soul_portraits
  ADD COLUMN IF NOT EXISTS subject_person_id UUID REFERENCES studio_people(id);

CREATE INDEX IF NOT EXISTS idx_soul_portraits_subject_person
  ON soul_portraits (subject_person_id)
  WHERE subject_person_id IS NOT NULL;

COMMENT ON COLUMN soul_portraits.subject_person_id IS
  'Nullable FK -> studio_people: the practitioner-directory record this portrait is ABOUT (a client/friend who may have no member account). Orthogonal to subject_member_id. Stage 1: internal-only; no delivery surface reads it.';

-- ── Post-apply self-verification ────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'soul_portraits' AND column_name = 'subject_person_id') THEN
    RAISE EXCEPTION 'Stage 1: subject_person_id did not land';
  END IF;
  RAISE NOTICE 'Stage 1 ready: soul_portraits.subject_person_id (nullable, -> studio_people)';
END $$;
