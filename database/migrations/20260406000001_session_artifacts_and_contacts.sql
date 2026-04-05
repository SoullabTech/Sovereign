-- Session Artifacts & Client Contacts
-- Part of the care orchestration layer: Session -> Translation -> Coordination -> Continuity
--
-- session_artifacts: captures the draft-edit-send lifecycle for practitioner-generated
-- follow-up communications (parent updates, home support notes, etc.)
--
-- client_contacts: parent/caregiver/teacher contacts for a practitioner's client.
-- Separate table because one client can have multiple caregivers.

-- ---------------------------------------------------------------------------
-- session_artifacts
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS session_artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES scribe_sessions(id) ON DELETE CASCADE,
  client_id UUID REFERENCES practitioner_clients(id) ON DELETE SET NULL,
  practitioner_id UUID NOT NULL,

  -- Type (only parent_update for v1)
  artifact_type TEXT NOT NULL DEFAULT 'parent_update'
    CHECK (artifact_type IN ('parent_update', 'client_summary', 'integration_note')),

  -- Content lifecycle
  draft_content JSONB NOT NULL,       -- structured blocks from AI generation
  final_content JSONB,                -- what was actually sent (after edits)
  edit_count INTEGER NOT NULL DEFAULT 0,

  -- Delivery
  recipients JSONB,                   -- [{name, email, role, contact_id}]
  sent_at TIMESTAMPTZ,
  sent_via TEXT CHECK (sent_via IS NULL OR sent_via IN ('in_app', 'email', 'both')),
  thread_id UUID,                     -- links to comms_threads if sent in-app

  -- Consent enforcement
  consent_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
  human_edited BOOLEAN NOT NULL DEFAULT FALSE,

  -- Invariant: final_content must exist when sent
  CONSTRAINT chk_sent_has_final CHECK (
    sent_at IS NULL OR final_content IS NOT NULL
  ),

  -- Audit
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_session_artifacts_session ON session_artifacts(session_id);
CREATE INDEX idx_session_artifacts_client ON session_artifacts(client_id) WHERE client_id IS NOT NULL;
CREATE INDEX idx_session_artifacts_practitioner ON session_artifacts(practitioner_id, created_at DESC);

-- ---------------------------------------------------------------------------
-- client_contacts
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS client_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES practitioner_clients(id) ON DELETE CASCADE,
  practitioner_id UUID NOT NULL,

  -- Contact details
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  role TEXT NOT NULL DEFAULT 'parent' CHECK (role IN ('parent', 'caregiver', 'teacher', 'other')),
  role_label VARCHAR(100),           -- freeform: "Mum", "Nanna", "Aide"

  -- Consent
  consent_given BOOLEAN NOT NULL DEFAULT FALSE,
  consent_given_at TIMESTAMPTZ,
  consent_source TEXT CHECK (consent_source IS NULL OR consent_source IN ('verbal', 'written', 'digital')),

  -- Status
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(client_id, email)
);

CREATE INDEX idx_client_contacts_client ON client_contacts(client_id);
CREATE INDEX idx_client_contacts_practitioner ON client_contacts(practitioner_id);
