-- Encounter participation — the third enduring concept in Studio's people model.
-- Artifact type: Implementation pattern. Additive + reversible.
--
-- Three concepts, three sources of authority, three lifecycles:
--   Person        — a human identity                              (practitioner_clients today; → practitioner_people)
--   Relationship  — how THIS practitioner knows that person       (relationship_roles; → its own entity later)
--   Participation — how a person took part in a specific encounter (THIS table)
--
-- Everyone participates, not only guests. A single encounter (a session, group, event,
-- workshop, or circle) has participants who may be a client, the practitioner, a
-- co-facilitator, an observer, an interpreter, a family member — or a one-time guest.
-- Participation is contextual and per-encounter: someone may be a mentor in life, an
-- observer today, a co-facilitator tomorrow. So the role here is the role IN THIS
-- ENCOUNTER, distinct from the standing relationship (relationship_roles on the person).
--
-- Each participant references EITHER a saved Person (person_id) OR an anonymous identity
-- (display_name / email with person_id NULL). A pure guest who is never saved has
-- person_id NULL and member_id NULL and creates nothing permanent.
--
-- BOUNDARY (structural, not just policy). Adding a participant writes ONLY this table.
-- It never creates a MAIA member, never adds a permanent contact, never makes a client,
-- never exposes practitioner notes to the participant, never moves data into a sovereign
-- space. Promotion to a saved Contact is an explicit practitioner act (sets person_id),
-- and even then touches only practitioner_clients — never members / member_memory_atoms /
-- case_memories. The crossing guarantees hold by construction.
--
-- Reversible: DROP TABLE encounter_participants restores prior state.

CREATE TABLE IF NOT EXISTS encounter_participants (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL,

  -- The encounter this participation belongs to. Polymorphic, app-validated vocabulary
  -- (session | group | event | workshop | circle) — NOT a hard CHECK, so new encounter
  -- kinds need no migration. Typed per-kind FKs are a deferred hardening.
  encounter_kind  TEXT NOT NULL,
  encounter_id    UUID NOT NULL,

  -- Identity — may be a saved Person (person_id) or anonymous (name/email only). May be
  -- name-only OR email-only (an email invite has no name yet). The CHECK requires at least
  -- one identifier so a participant is never anonymous-and-nameless.
  display_name    TEXT,
  email           TEXT,
  phone           TEXT,

  -- Role IN THIS ENCOUNTER (not the standing relationship). App-validated vocabulary
  -- (guest, client, practitioner, co-facilitator, observer, interpreter, family-member,
  -- attendee, speaker, ...) — extensible, no DB CHECK, default 'guest'.
  participant_role TEXT NOT NULL DEFAULT 'guest',

  role_detail     TEXT,             -- optional freeform refinement ("guest speaker", "sitting in")

  -- Optional, practitioner-recorded consent for this participation (e.g. to be recorded).
  consent_status  TEXT
    CHECK (consent_status IS NULL OR consent_status IN ('not_requested', 'requested', 'given', 'declined')),

  notes_private   TEXT,             -- practitioner-only; NEVER exposed to the participant

  -- References a saved Person, or NULL for an anonymous/unsaved participant. Set ONLY by
  -- explicit "save as contact" — never auto-populated when a participant is added.
  person_id       UUID REFERENCES practitioner_clients(id) ON DELETE SET NULL,
  -- The sovereign MAIA account, if the participant already has one. Adding a participant
  -- NEVER creates one; no practitioner data crosses into that account here.
  member_id       UUID REFERENCES members(id) ON DELETE SET NULL,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT encounter_participants_has_identifier
    CHECK (display_name IS NOT NULL OR email IS NOT NULL OR person_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_encounter_participants_practitioner
  ON encounter_participants (practitioner_id);
CREATE INDEX IF NOT EXISTS idx_encounter_participants_encounter
  ON encounter_participants (encounter_kind, encounter_id);
CREATE INDEX IF NOT EXISTS idx_encounter_participants_person
  ON encounter_participants (person_id) WHERE person_id IS NOT NULL;

COMMENT ON TABLE encounter_participants IS
  'Participation: how a person took part in a specific encounter (session/group/event/workshop/circle). The third enduring concept beside Person and Relationship, with its own per-encounter lifecycle. Each row references a saved Person (person_id) or an anonymous identity (name/email). A pure guest has person_id and member_id both NULL and creates nothing permanent. Promotion to a saved Contact is an explicit practitioner act. notes_private is practitioner-only.';
COMMENT ON COLUMN encounter_participants.participant_role IS
  'Role IN THIS ENCOUNTER (guest, client, practitioner, co-facilitator, observer, interpreter, family-member, ...). Distinct from the standing relationship_roles on the person. App-validated, extensible.';
COMMENT ON COLUMN encounter_participants.person_id IS
  'The saved Person this participant is (→ practitioner_clients / practitioner_people), or NULL for an anonymous/unsaved participant. Set ONLY on explicit save-as-contact.';
COMMENT ON COLUMN encounter_participants.member_id IS
  'Set only if the participant already has a sovereign MAIA account. Participation NEVER creates one, and no practitioner data crosses into that account here.';

-- Keep updated_at fresh (house pattern; function is idempotent and already used elsewhere).
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_encounter_participants_updated_at ON encounter_participants;
CREATE TRIGGER update_encounter_participants_updated_at
  BEFORE UPDATE ON encounter_participants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
