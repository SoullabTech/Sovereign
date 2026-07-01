-- Migration: relationship_spaces
-- Constitutional function: STRUCTURAL — can this shared space exist?
-- Spec: docs/specs/CLIENT_PRACTITIONER_SPACE_SPEC_2026-06-30.md
--
-- Vocabulary audit finding (2026-06-30):
--   member_relationships = member's personal relationship journal (outer/inner/transpersonal).
--   That table is constitutionally occupied. This table must not overload it.
--
-- relationship_spaces = the bounded, consent-governed collaborative space
--   created by a relationship between two members.
--
-- practitioner_clients = practitioner-side CRM/billing/roster record.
-- relationship_spaces = consent-gated MAIA relational space.
-- They may be linked; neither owns the other.
--
-- Migration is the first act of translation.
-- Every subsequent layer inherits from it rather than recreating it.

CREATE TABLE IF NOT EXISTS relationship_spaces (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationship type — describes the nature of the relationship, not the profession
  relationship_type         TEXT NOT NULL CHECK (relationship_type IN (
                              'practitioner_client',
                              'teacher_student',
                              'coach_client',
                              'supervisor_supervisee'
                            )),

  -- The member who holds stewardship of the space
  steward_member_id         UUID NOT NULL REFERENCES members(id) ON DELETE RESTRICT,

  -- The member who participates; NULL until they accept via MAIA account
  participant_member_id     UUID NULL REFERENCES members(id) ON DELETE SET NULL,

  -- Email held until participant_member_id is linked; cleared once linked
  client_email              TEXT NULL,

  -- Optional link to practitioner-side CRM record
  -- practitioner_clients owns billing/roster; relationship_spaces owns consent/relational scope
  -- Nullable, non-authorizing, non-cascading
  practitioner_client_id    UUID NULL REFERENCES practitioner_clients(id) ON DELETE SET NULL,

  -- Invitation mechanics
  invite_token              TEXT NULL UNIQUE,
  invite_expires_at         TIMESTAMPTZ NULL,
  invitation_mode           TEXT NOT NULL DEFAULT 'manual'
                              CHECK (invitation_mode IN ('automatic', 'practitioner_approval', 'manual')),

  -- Optional Co-Lab organizational context; space exists independently of team
  team_id                   UUID NULL REFERENCES studio_teams(id) ON DELETE SET NULL,

  -- Lifecycle: 'archived' = no longer active in interface
  -- 'archived' preferred over 'ended' — preserves constitutional neutrality
  status                    TEXT NOT NULL DEFAULT 'invited'
                              CHECK (status IN ('invited', 'active', 'paused', 'archived')),

  -- Consent: space is not active until participant explicitly accepts
  consent_status            TEXT NOT NULL DEFAULT 'pending'
                              CHECK (consent_status IN ('pending', 'accepted', 'declined', 'withdrawn')),
  consent_accepted_at       TIMESTAMPTZ NULL,
  -- What participant acknowledged at acceptance; jurisdiction-neutral; additive
  consent_items             JSONB NOT NULL DEFAULT '[]',

  -- Display identity: owned by this space, not by the member profile
  -- Practitioner's MAIA members.name is never exposed to participant without explicit setting
  practitioner_display_name TEXT NULL,   -- person name shown to participant (e.g. "Kelly Nezat")
  practice_display_name     TEXT NULL,   -- practice/org name shown (e.g. "Soullab")

  -- Provenance
  created_from              TEXT NOT NULL DEFAULT 'manual'
                              CHECK (created_from IN ('booking', 'invite', 'manual')),

  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- A member cannot be both steward and participant in the same space
  CONSTRAINT relationship_spaces_no_self CHECK (steward_member_id != participant_member_id)
);

CREATE INDEX IF NOT EXISTS idx_relationship_spaces_steward
  ON relationship_spaces(steward_member_id);

CREATE INDEX IF NOT EXISTS idx_relationship_spaces_participant
  ON relationship_spaces(participant_member_id)
  WHERE participant_member_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_relationship_spaces_token
  ON relationship_spaces(invite_token)
  WHERE invite_token IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_relationship_spaces_status
  ON relationship_spaces(steward_member_id, status);

CREATE INDEX IF NOT EXISTS idx_relationship_spaces_practitioner_client
  ON relationship_spaces(practitioner_client_id)
  WHERE practitioner_client_id IS NOT NULL;

DROP TRIGGER IF EXISTS update_relationship_spaces_updated_at ON relationship_spaces;
CREATE TRIGGER update_relationship_spaces_updated_at
  BEFORE UPDATE ON relationship_spaces
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE relationship_spaces IS
  'The bounded, consent-governed collaborative space created by a relationship between two members. '
  'Distinct from member_relationships (personal relationship journal). '
  'Distinct from practitioner_clients (CRM/billing). '
  'relationship_type describes the nature; it does not restrict to one profession.';

COMMENT ON COLUMN relationship_spaces.practitioner_client_id IS
  'Optional link to practitioner_clients CRM record. Nullable, non-authorizing, non-cascading. '
  'practitioner_clients owns billing. relationship_spaces owns consent and relational scope.';

COMMENT ON COLUMN relationship_spaces.consent_items IS
  'JSONB array of what participant acknowledged at acceptance. Additive — '
  'future consent types (recording, AI assistance, supervision) append here.';

COMMENT ON COLUMN relationship_spaces.practice_display_name IS
  'Practice or organization name shown to participant. '
  'Owned by this space, not by members.name. Prevents personal identity leaking into professional identity.';

-- ─────────────────────────────────────────────────────────────────────────────
-- RESERVED — jurisdiction claimed; not yet implemented
-- ─────────────────────────────────────────────────────────────────────────────
-- space_participants: multi-steward support (co-facilitator, supervisor, intern).
--   Primary steward remains steward_member_id. Additional authorized participants
--   extend via a future join table without changing this schema.
--
-- space_shared_atoms: client-initiated MAIA memory sharing with steward.
--   Default: private. Sharing is an intentional act by participant_member_id only.
