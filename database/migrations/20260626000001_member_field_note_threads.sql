-- Member Field Note Threads — the member-side output of the MAIA-guided
-- conversational interview (Field Lab). A "thread" is a reflective pattern MAIA
-- PROPOSES and the member AUTHORS (keep / revise / split / discard / create).
-- Nothing persists here without an explicit member gesture (active acceptance).
--
-- Scope: single-session Crossing 3 (conversation -> proposal -> authored thread).
-- Cross-session living field (Model B) and practitioner visibility (the triadic-
-- consent frontier) are DEFERRED: can_be_shown_to_practitioner exists but is held
-- FALSE and no path surfaces it.
--
-- Distinct from the existing practitioner-scoped `field_notes` table.
-- Spec: docs/specs/FIELD_LAB_CONVERSATIONAL_INTERVIEW_SPEC_2026-06-26.md

CREATE TABLE IF NOT EXISTS member_field_note_threads (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id           UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  source_session_ref  TEXT,            -- opaque ref to the interview session (no FK)

  title               TEXT NOT NULL,
  content             TEXT NOT NULL,

  -- Provenance (mirrors case_memories: who authored it, how it arose)
  authorship          TEXT NOT NULL DEFAULT 'member_confirmed'
    CHECK (authorship IN ('maia_proposed','member_authored','member_confirmed')),
  is_directly_stated  BOOLEAN NOT NULL DEFAULT false,  -- member-stated vs MAIA-inferred
  member_confirmed    BOOLEAN NOT NULL DEFAULT false,

  -- The member's authorship gesture at the crossing
  member_decision     TEXT CHECK (member_decision IN ('keep','revise','split','discard','create')),
  member_decision_at  TIMESTAMPTZ,
  revision_notes      TEXT,

  -- Consent / memory gating (lifecycle: session-note -> ... -> member-confirmed-memory)
  consent_state       TEXT NOT NULL DEFAULT 'session-note'
    CHECK (consent_state IN (
      'session-note','temporary-reflection','member-confirmed-memory',
      'private-to-member','practitioner-visible'
    )),
  can_be_remembered            BOOLEAN NOT NULL DEFAULT false,  -- nothing remembered by default
  can_be_shown_to_practitioner BOOLEAN NOT NULL DEFAULT false,  -- DEFERRED: held FALSE, no path
  practitioner_visibility_basis TEXT,

  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed_at        TIMESTAMPTZ,
  -- Release is NOT deletion: a released thread drops from the member's active
  -- threads and is never used as current self-understanding, but its authorship
  -- history is honored ("deletion must not become erasure of authorship").
  released_at         TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_mfnt_member   ON member_field_note_threads(member_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mfnt_consent  ON member_field_note_threads(member_id, consent_state);
CREATE INDEX IF NOT EXISTS idx_mfnt_decision ON member_field_note_threads(member_id, member_confirmed, member_decision);

-- Append-only ledger: every authorship / consent act on a thread. This is the
-- source of edit-rate (kept|revised|discarded vs proposed) and origination-rate
-- (created) for the first experiment.
CREATE TABLE IF NOT EXISTS member_field_note_events (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id           UUID REFERENCES member_field_note_threads(id) ON DELETE CASCADE,
  member_id           UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,

  event_type          TEXT NOT NULL
    CHECK (event_type IN ('proposed','kept','revised','split','discarded','created','released','consent_changed')),
  member_decision     TEXT,
  consent_state_old   TEXT,
  consent_state_new   TEXT,
  surface             TEXT,            -- e.g. 'api/field-lab/field-note'
  reason              TEXT,

  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mfne_thread ON member_field_note_events(thread_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mfne_member ON member_field_note_events(member_id, created_at DESC);

-- updated_at maintenance
CREATE OR REPLACE FUNCTION set_member_field_note_threads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_mfnt_updated_at ON member_field_note_threads;
CREATE TRIGGER trg_mfnt_updated_at
  BEFORE UPDATE ON member_field_note_threads
  FOR EACH ROW EXECUTE FUNCTION set_member_field_note_threads_updated_at();

COMMENT ON TABLE member_field_note_threads IS
  'Member-authored reflective threads from the MAIA-guided Field Lab interview (Crossing 3). Nothing persists without an explicit member gesture. Cross-session field + practitioner visibility deferred.';
COMMENT ON COLUMN member_field_note_threads.authorship IS
  'Provenance: maia_proposed (MAIA offered) | member_authored (member originated) | member_confirmed (member kept/revised a proposal).';
COMMENT ON COLUMN member_field_note_threads.can_be_shown_to_practitioner IS
  'DEFERRED triadic-consent frontier — held FALSE; no path surfaces it yet.';
COMMENT ON TABLE member_field_note_events IS
  'Append-only ledger of authorship/consent acts; source of edit-rate and origination-rate.';
