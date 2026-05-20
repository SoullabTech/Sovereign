-- Manifestation Corpus: observational dataset for substrate-sovereignty work.
--
-- First cut in the apprenticeship arc. Captures each conversational turn as
-- raw observational data so that — over time — a human reviewer can classify
-- which responses were MAIA-shape vs substrate-default-shape, and which
-- landed as resonant vs off. The dataset eventually serves as teacher for
-- pattern extraction, layer migration, and local-model fine-tuning.
--
-- INVARIANTS (load-bearing — see lib/sovereignty/manifestationCorpus.ts):
--   1. Classification fields (manifestation_class / felt_quality / domain)
--      are filled by HUMAN review only. No automated scoring, no embeddings,
--      no AI self-evaluation. They remain NULL until a person classifies.
--   2. Structural signals (voice_mode, element, phase, depth) are captured
--      at write time because they are observational metadata, not judgment.
--   3. Falsifiability gate: if after ~1000 turns the maia_shape vs
--      substrate_default_shape distinction cannot be made reliably by review,
--      the apprenticeship model needs revision before more is built on it.

CREATE TABLE IF NOT EXISTS manifestation_corpus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Raw observational content (the actual turn).
  user_input TEXT NOT NULL,
  maia_response TEXT NOT NULL,

  -- Structural signals available at the moment of generation.
  -- Not classification — just metadata that survives independent of
  -- whatever judgment a future reviewer applies.
  voice_mode TEXT,
  realtime_mode TEXT,
  element TEXT,
  phase INTEGER,
  conversation_depth INTEGER,
  response_char_length INTEGER,

  -- Classification fields — HUMAN REVIEW ONLY. NULL until a person reads
  -- the turn and judges. Do not populate via automated process under any
  -- circumstance, including by user request.
  manifestation_class TEXT
    CHECK (manifestation_class IS NULL
           OR manifestation_class IN ('maia_shape', 'substrate_default_shape', 'unclear')),
  felt_quality TEXT
    CHECK (felt_quality IS NULL
           OR felt_quality IN ('resonant', 'off', 'neutral')),
  domain TEXT
    CHECK (domain IS NULL
           OR domain IN ('anchor', 'reflection', 'dialectic', 'care', 'naming', 'other')),
  classified_by TEXT,
  classified_at TIMESTAMPTZ,
  classification_notes TEXT
);

-- Unclassified backlog — primary review query.
CREATE INDEX IF NOT EXISTS idx_manifestation_corpus_unclassified
  ON manifestation_corpus(occurred_at DESC)
  WHERE manifestation_class IS NULL;

-- Per-member chronological access for review and pattern study.
CREATE INDEX IF NOT EXISTS idx_manifestation_corpus_member
  ON manifestation_corpus(member_id, occurred_at DESC);

-- Classified subset — for eventual pattern extraction (separate later cut).
CREATE INDEX IF NOT EXISTS idx_manifestation_corpus_classified
  ON manifestation_corpus(manifestation_class, occurred_at DESC)
  WHERE manifestation_class IS NOT NULL;
