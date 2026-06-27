-- The canonical facilitation Session — the lived encounter Studio actually conducts.
-- Artifact type: Implementation pattern. Additive; bridges, does NOT migrate/collapse legacy.
-- Ratified in docs/adr/006-canonical-session-anchor.md (Kelly, 2026-06-27).
--
-- Series → Instance → Session (per ADR-005/006):
--   Series    = rl_containers (repeating intent)
--   Instance  = the scheduled occurrence — sessions (booking) / rl_sessions (ledger,
--               carries meeting_provider) / group_sessions
--   Session   = THIS table — the lived facilitation record that owns Resources, references
--               the provider, and bridges to the recording (scribe_sessions) and history
--               (practitioner_sessions) facets.
--
-- GOVERNANCE RULE (Kelly, 2026-06-27): new facilitation capability attaches to
-- studio_sessions; legacy tables remain facets unless explicitly bridged. This table is
-- practitioner-owned (the facilitator) — distinct from scribe_sessions, which is the
-- member-owned *recording*. A facilitated session that is never recorded still lives here.
--
-- Resources belong to the Session (studio_session_resources), NOT to the meeting provider.
-- The provider is a swappable service UNDER the Session (Session Room setup concern).
-- Note: studio_sessions is created here for the first time — confirmed ABSENT in production
-- and undefined by any migration; a stray local-dev table of the same name is drift.

-- Reuse the existing meeting_provider enum (from 20260407000001_trust_layer_phase1); create
-- it only if a target env hasn't reached that migration yet. Self-contained + idempotent.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'meeting_provider') THEN
    CREATE TYPE meeting_provider AS ENUM
      ('none','livekit','jitsi','zoom','google_meet','proton_meet','microsoft_teams','custom');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS studio_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL,                 -- the facilitator (practitioner-owned)
  title           TEXT,
  status          TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','scheduled','live','completed','cancelled','archived')),
  scheduled_at    TIMESTAMPTZ,                   -- convenience; the bridged Instance is authoritative when present

  -- Provider: a swappable service under the Session (Session Room setup concern).
  meeting_provider meeting_provider NOT NULL DEFAULT 'none',
  meeting_url     TEXT,
  meeting_id      TEXT,

  notes           TEXT,                          -- facilitator notes (practitioner-only)

  -- Bridges to existing facets — additive, nullable. Legacy tables keep their jobs; this
  -- anchor unifies them without migrating or collapsing anything (ADR-006).
  booking_session_id      UUID REFERENCES sessions(id)              ON DELETE SET NULL,  -- Instance: public booking/calendar
  rl_session_id           UUID REFERENCES rl_sessions(id)           ON DELETE SET NULL,  -- Instance: relational-ledger slot (provider lives here too)
  group_session_id        UUID REFERENCES group_sessions(id)        ON DELETE SET NULL,  -- Instance: group meeting
  scribe_session_id       UUID REFERENCES scribe_sessions(id)       ON DELETE SET NULL,  -- Facet: the recording / transcript
  -- practitioner_sessions has NO primary key to FK against (and 0 inbound FKs anywhere), so
  -- this bridge is a soft typed reference, not a constraint. Hardens to a real FK if/when
  -- that table gains a PK.
  practitioner_session_id UUID,                                                          -- Facet: modality history / MAIA prep (soft ref → practitioner_sessions.id)

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_studio_sessions_practitioner ON studio_sessions (practitioner_id, scheduled_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_studio_sessions_status       ON studio_sessions (practitioner_id, status);
CREATE INDEX IF NOT EXISTS idx_studio_sessions_scribe       ON studio_sessions (scribe_session_id)       WHERE scribe_session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_studio_sessions_booking      ON studio_sessions (booking_session_id)      WHERE booking_session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_studio_sessions_rl           ON studio_sessions (rl_session_id)           WHERE rl_session_id IS NOT NULL;

COMMENT ON TABLE studio_sessions IS
  'Canonical facilitation Session (lived encounter). Practitioner-owned. Owns Resources (studio_session_resources), references a swappable meeting_provider, and bridges to Instance facets (sessions/rl_sessions/group_sessions) and to the recording (scribe_sessions) and history (practitioner_sessions) facets. New facilitation capability attaches HERE (ADR-006). Participants attach via encounter_participants (encounter_kind=''session'', encounter_id=studio_sessions.id).';
COMMENT ON COLUMN studio_sessions.meeting_provider IS
  'Swappable meeting service under the Session (Teams/Zoom/Meet/Jitsi/…). Resources belong to the Session, not the provider — switching providers never moves resources.';

-- Typed Session↔Resource edge. Replaces the loose, untyped media_projects.source_session_id
-- as the canonical way resources attach to a Session. Reuses Media Studio for storage.
CREATE TABLE IF NOT EXISTS studio_session_resources (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_session_id UUID NOT NULL REFERENCES studio_sessions(id) ON DELETE CASCADE,
  -- A resource is either a Media Studio asset (uploaded PowerPoint/PDF/image/video) or an
  -- external reference (a whiteboard URL, a link). The CHECK requires one of them.
  media_project_id  UUID REFERENCES media_projects(id) ON DELETE CASCADE,
  external_url      TEXT,
  resource_kind     TEXT NOT NULL DEFAULT 'document',  -- presentation|pdf|image|video|worksheet|whiteboard|link|document; app-validated, extensible
  title             TEXT,
  sort_order        INTEGER NOT NULL DEFAULT 0,
  -- shared = participants can access it through Studio; private = practitioner-only (e.g. speaker notes).
  visibility        TEXT NOT NULL DEFAULT 'shared'
    CHECK (visibility IN ('shared','private')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT studio_session_resource_has_target
    CHECK (media_project_id IS NOT NULL OR external_url IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_studio_session_resources_session ON studio_session_resources (studio_session_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_studio_session_resources_media   ON studio_session_resources (media_project_id) WHERE media_project_id IS NOT NULL;

COMMENT ON TABLE studio_session_resources IS
  'Resources attached to a facilitation Session (presentations, PDFs, images, videos, worksheets, whiteboards, links). Owned by the Session, provider-independent. Reuses Media Studio (media_projects) for stored files; external_url for non-file resources. visibility=shared exposes it to participants through Studio; private is practitioner-only.';

-- updated_at trigger (house pattern; function is idempotent and already used elsewhere).
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_studio_sessions_updated_at ON studio_sessions;
CREATE TRIGGER update_studio_sessions_updated_at
  BEFORE UPDATE ON studio_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_studio_session_resources_updated_at ON studio_session_resources;
CREATE TRIGGER update_studio_session_resources_updated_at
  BEFORE UPDATE ON studio_session_resources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
