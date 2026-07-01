-- Migration: relationship_space_content
-- Constitutional function: STRUCTURAL — can content scoped to a relationship space exist?
-- Spec: docs/specs/CLIENT_PRACTITIONER_SPACE_SPEC_2026-06-30.md
-- Depends on: 20260630000008_member_relationships.sql (relationship_spaces)
--
-- Three content tables, each scoped strictly to space_id.
-- No content row can exist without a parent relationship_space.
-- space_id is the scope key; it is never optional.

-- ─────────────────────────────────────────────────────────────────────────────
-- MESSAGES
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS relationship_space_messages (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id         UUID NOT NULL REFERENCES relationship_spaces(id) ON DELETE CASCADE,
  sender_member_id UUID NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
  body             TEXT NOT NULL,
  read_at          TIMESTAMPTZ NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT relationship_space_messages_body_nonempty
    CHECK (length(trim(body)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_rsm_space_created
  ON relationship_space_messages(space_id, created_at);

CREATE INDEX IF NOT EXISTS idx_rsm_sender
  ON relationship_space_messages(sender_member_id);

CREATE INDEX IF NOT EXISTS idx_rsm_unread
  ON relationship_space_messages(space_id, read_at)
  WHERE read_at IS NULL;

COMMENT ON TABLE relationship_space_messages IS
  'Async messages within a relationship_space. '
  'sender_member_id must be steward or participant of the space — enforced at service layer. '
  'Client-facing label: "Messages".';

-- ─────────────────────────────────────────────────────────────────────────────
-- NOTES
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS relationship_space_notes (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id         UUID NOT NULL REFERENCES relationship_spaces(id) ON DELETE CASCADE,
  author_member_id UUID NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
  note_type        TEXT NOT NULL DEFAULT 'session_note'
                     CHECK (note_type IN ('session_note', 'homework', 'resource', 'general')),
  title            TEXT NULL,
  body             TEXT NOT NULL,
  visible_to_participant BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT relationship_space_notes_body_nonempty
    CHECK (length(trim(body)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_rsn_space_created
  ON relationship_space_notes(space_id, created_at);

CREATE INDEX IF NOT EXISTS idx_rsn_visible
  ON relationship_space_notes(space_id, visible_to_participant);

DROP TRIGGER IF EXISTS update_relationship_space_notes_updated_at ON relationship_space_notes;
CREATE TRIGGER update_relationship_space_notes_updated_at
  BEFORE UPDATE ON relationship_space_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE relationship_space_notes IS
  'Notes, homework, and resources within a relationship_space. '
  'visible_to_participant=false allows steward private notes. '
  'Client-facing labels: "Session notes" / "Homework" / "From [Name]".';

-- ─────────────────────────────────────────────────────────────────────────────
-- ARTIFACTS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS relationship_space_artifacts (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id           UUID NOT NULL REFERENCES relationship_spaces(id) ON DELETE CASCADE,
  uploader_member_id UUID NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
  artifact_type      TEXT NOT NULL DEFAULT 'file'
                       CHECK (artifact_type IN ('file', 'link', 'recording', 'report')),
  label              TEXT NULL,
  url                TEXT NULL,
  metadata           JSONB NOT NULL DEFAULT '{}',
  visible_to_participant BOOLEAN NOT NULL DEFAULT TRUE,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rsa_space_created
  ON relationship_space_artifacts(space_id, created_at);

CREATE INDEX IF NOT EXISTS idx_rsa_visible
  ON relationship_space_artifacts(space_id, visible_to_participant);

COMMENT ON TABLE relationship_space_artifacts IS
  'Files, links, recordings, reports within a relationship_space. '
  'visible_to_participant=false allows steward-only artifacts.';

-- ─────────────────────────────────────────────────────────────────────────────
-- RESERVED — jurisdiction claimed; not yet implemented
-- ─────────────────────────────────────────────────────────────────────────────
-- space_participants: multi-steward support
-- space_shared_atoms: client-initiated memory sharing with steward
