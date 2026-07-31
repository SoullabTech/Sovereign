-- ================================================
-- PRACTITIONER CONTINUITY v1
-- Migration: 20260731000001_practitioner_client_notes_continuity.sql
--
-- Adds three governed continuity kinds alongside the chronological session note
-- already shipped in 20260730000001. One encrypted surface, four kinds.
--
-- SUPERSESSION NOTE (deliberate, do not read as drift):
--   Practitioner Notes v1 omitted a discriminator because the categories were not
--   yet governed. This migration introduces ONLY the three now-authorized
--   continuity categories. It does not authorize arbitrary note typing and does
--   not reopen inferred taxonomies. The earlier refusal is superseded for these
--   named categories, not invalidated in principle.
--
-- DELIBERATELY ABSENT:
--   * no `arrival` kind — Current Arrival is a per-session authoring prompt inside
--     the chronological note, NOT a durable object. Nothing accumulates; material
--     worth keeping must be deliberately promoted by the practitioner.
--   * no visibility column, no client-of-record change, no member-facing sharing.
--   * no completed_at / released_at — commitment history falls back to updated_at
--     in v1 (ruled). Adding them would exceed the authorized object.
--
-- ORDERING IS NOT IMPLIED BY THIS SCHEMA. Each kind has its own ruled ordering
-- (see the comparators in components/studio/ClientNotesPanel.tsx). An object may
-- contain timestamps without being temporal in meaning: `note_date` is meaningful
-- only for kind='note'.
-- ================================================

-- ---------- kind ----------
ALTER TABLE practitioner_client_notes
  ADD COLUMN IF NOT EXISTS kind TEXT NOT NULL DEFAULT 'note';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'practitioner_client_notes_kind_check'
  ) THEN
    ALTER TABLE practitioner_client_notes
      ADD CONSTRAINT practitioner_client_notes_kind_check
      CHECK (kind IN ('note', 'commitment', 'recognition', 'detail'));
  END IF;
END $$;

-- ---------- status (commitment lifecycle) ----------
ALTER TABLE practitioner_client_notes
  ADD COLUMN IF NOT EXISTS status TEXT;

-- status is meaningful ONLY for commitments: required there, forbidden elsewhere.
-- Both halves matter — a commitment with no status has no answer to "is this
-- still alive?", which is the whole question the object exists to hold.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'practitioner_client_notes_status_check'
  ) THEN
    ALTER TABLE practitioner_client_notes
      ADD CONSTRAINT practitioner_client_notes_status_check
      CHECK (
        (kind = 'commitment' AND status IN ('alive', 'completed', 'released'))
        OR (kind <> 'commitment' AND status IS NULL)
      );
  END IF;
END $$;

-- ---------- promoted_from (Carry Forward provenance) ----------
ALTER TABLE practitioner_client_notes
  ADD COLUMN IF NOT EXISTS promoted_from UUID;

-- Scope enforcement at the DB layer rather than the accessor alone.
-- A composite unique key on (id, client_id, practitioner_id) — trivially satisfied
-- because id is already the PK — lets the FK below require that a promotion source
-- belongs to the SAME client and the SAME practitioner. Without this, a note id
-- from another practitioner's client would be referentially valid.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'practitioner_client_notes_scope_key'
  ) THEN
    ALTER TABLE practitioner_client_notes
      ADD CONSTRAINT practitioner_client_notes_scope_key
      UNIQUE (id, client_id, practitioner_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'practitioner_client_notes_promoted_from_fkey'
  ) THEN
    ALTER TABLE practitioner_client_notes
      ADD CONSTRAINT practitioner_client_notes_promoted_from_fkey
      FOREIGN KEY (promoted_from, client_id, practitioner_id)
      REFERENCES practitioner_client_notes (id, client_id, practitioner_id)
      ON DELETE SET NULL;
  END IF;
END $$;

-- ---------- indexes, one per ruled ordering ----------
-- Live commitments: status first, then most-recently-tended. NOT note_date.
CREATE INDEX IF NOT EXISTS idx_pcn_commitments_live
  ON practitioner_client_notes (client_id, practitioner_id, status, updated_at DESC)
  WHERE kind = 'commitment';

-- Recognitions: insertion order, newest first (provisional — see comparator).
CREATE INDEX IF NOT EXISTS idx_pcn_recognitions
  ON practitioner_client_notes (client_id, practitioner_id, created_at DESC)
  WHERE kind = 'recognition';

-- Important details: stable insertion order, OLDEST first. Reference card, not a feed.
CREATE INDEX IF NOT EXISTS idx_pcn_details
  ON practitioner_client_notes (client_id, practitioner_id, created_at ASC)
  WHERE kind = 'detail';

COMMENT ON COLUMN practitioner_client_notes.kind IS
  'Governed continuity kind. note = chronological session note; commitment = something explicitly chosen to practice, carry, or revisit; recognition = a realization explicitly recorded by the practitioner; detail = relational context deliberately kept. No `arrival` kind by ruling — Current Arrival lives inside the session note.';

COMMENT ON COLUMN practitioner_client_notes.status IS
  'Commitment lifecycle only: alive | completed | released. Required when kind=commitment, NULL otherwise. Answers "is this still alive?" — the primary ordering key for live commitments.';

COMMENT ON COLUMN practitioner_client_notes.promoted_from IS
  'Carry Forward provenance: the session note a continuity item was promoted from. Human-directed only — the practitioner selects the text and chooses the destination kind. The source note is never modified. Composite FK enforces same client + same practitioner.';
