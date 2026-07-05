-- Living Field Wave 2, Move 1 — conversation-first entry.
-- Canonical object: the Living Encounter (Encounter primitive extended to field dimensions).
-- Append-only event stream. No UPDATE/DELETE paths on living_encounter_events, ever.
-- Proposals (phase_proposal, state_proposal) carry zero authority until member-confirmed
-- via a corresponding *_confirmed event. MAIA surfaces/suggests/organizes — never concludes identity.
--
-- Interruption ledger addendum: 'friction' / 'interruption' / 'novelty' / 'recovery' are an
-- OBSERVATION instrument, not an interpretation layer. Payload carries
-- { source: 'member_marked' | 'structural', note?, signal? }. 'novelty' and 'recovery' are
-- member-markable only — no semantic/sentiment inference ever produces them. 'friction' and
-- 'interruption' may also be appended structurally, but ONLY for facts that need no
-- interpretation (a failed turn; an encounter left open and abandoned).

CREATE TABLE living_encounters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  field_key TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','closed')),
  opened_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at TIMESTAMPTZ
);

CREATE TABLE living_encounter_events (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  encounter_id UUID NOT NULL REFERENCES living_encounters(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'utterance','maia_utterance','element_shift','phase_proposal','phase_confirmed',
    'state_proposal','state_confirmed','recognition','doorway_opened','expression_drafted',
    'friction','interruption','novelty','recovery'
  )),
  payload JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_lee_encounter ON living_encounter_events(encounter_id, id);
CREATE INDEX idx_lee_member_time ON living_encounter_events(member_id, created_at);
CREATE INDEX idx_le_member_field ON living_encounters(member_id, field_key, opened_at DESC);
