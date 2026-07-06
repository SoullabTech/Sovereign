-- Offerings v0 — the smallest truthful member-offering experiment.
-- Member-gated (any member may create an offering), not practitioner-gated.
-- No categories, ratings, endorsements, search, directory, or ranking.
-- "open_to_conversation" is a first-class exchange option and the default.
-- Default visibility is 'private' — consistent with the platform's
-- member-pulled consent model (nothing is visible to others until the
-- member chooses).

CREATE TABLE IF NOT EXISTS offerings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,  -- the member's answer to the prompt, in their own words
  availability TEXT NOT NULL DEFAULT 'active',
    -- active | seasonal | paused
  visibility TEXT NOT NULL DEFAULT 'private',
    -- private | relationships | community | public
  exchange TEXT NOT NULL DEFAULT 'open_to_conversation',
    -- gift | reciprocity | paid | open_to_conversation
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT offerings_availability_check CHECK (availability IN ('active','seasonal','paused')),
  CONSTRAINT offerings_visibility_check CHECK (visibility IN ('private','relationships','community','public')),
  CONSTRAINT offerings_exchange_check CHECK (exchange IN ('gift','reciprocity','paid','open_to_conversation'))
);

CREATE INDEX IF NOT EXISTS offerings_member_idx ON offerings(member_id);
