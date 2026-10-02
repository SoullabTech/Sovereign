-- WRITERS-STUDIO-C14 — MAIA'S UNDERSTANDING OF THE WRITER
-- Member-authored, inspectable, correctable context attached to one Living Work.
-- MAIA may read this record. MAIA never writes it.

CREATE TABLE IF NOT EXISTS living_work_writer_understanding (
  living_work_id UUID PRIMARY KEY REFERENCES living_works(id) ON DELETE CASCADE,
  member_id UUID NOT NULL,
  becoming TEXT,
  preserve JSONB NOT NULL DEFAULT '[]'::jsonb,
  reader_relationship TEXT,
  central_ideas JSONB NOT NULL DEFAULT '[]'::jsonb,
  voice_cadence TEXT,
  intentional_ambiguity JSONB NOT NULL DEFAULT '[]'::jsonb,
  challenge_me_on JSONB NOT NULL DEFAULT '[]'::jsonb,
  non_negotiables JSONB NOT NULL DEFAULT '[]'::jsonb,
  unresolved_intentions JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (jsonb_typeof(preserve) = 'array'),
  CHECK (jsonb_typeof(central_ideas) = 'array'),
  CHECK (jsonb_typeof(intentional_ambiguity) = 'array'),
  CHECK (jsonb_typeof(challenge_me_on) = 'array'),
  CHECK (jsonb_typeof(non_negotiables) = 'array'),
  CHECK (jsonb_typeof(unresolved_intentions) = 'array')
);

CREATE INDEX IF NOT EXISTS living_work_writer_understanding_member_idx
  ON living_work_writer_understanding (member_id, updated_at DESC);

COMMENT ON TABLE living_work_writer_understanding IS
  'C14: member-authored, inspectable understanding of a writer’s governing intentions for one Living Work. Never inferred and never MAIA-authored.';
