-- Sacred Learning Domain: Core Tables
-- Governed by docs/sacred-learning/SACRED_SOURCE_INTEGRITY_POLICY.md
--
-- Authority hierarchy (immutable):
--   1 = Revelation (Qur'an)
--   2 = Exegesis (Tafsir)
--   3 = Mystical (Ibn al-'Arabi etc.)
--   4 = Contemplative (Rumi etc.)
--   5 = Reflection (member)
--   6 = Synthesis (AI-generated)
--
-- Every content row carries authority_level + provenance. No exceptions.

-- ═══════════════════════════════════════════════════════════════
-- Source Registry: Works, authors, editions
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS sacred_sources (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  authority_level   INTEGER NOT NULL CHECK (authority_level BETWEEN 1 AND 6),
  author            TEXT,                          -- NULL for Qur'an (Level 1)
  work              TEXT NOT NULL,                 -- e.g. "Qur'an", "Tafsir al-Qur'an al-Azim", "Masnavi"
  translator        TEXT,                          -- NULL if original language
  translation_edition TEXT,                        -- e.g. "Oxford University Press, 2004"
  source_edition    TEXT,                          -- e.g. "Medina Mushaf (Uthmani script)"
  language          TEXT NOT NULL DEFAULT 'ar',     -- ISO 639-1
  description       TEXT,
  review_status     TEXT NOT NULL DEFAULT 'unreviewed'
                      CHECK (review_status IN ('unreviewed', 'reviewed', 'approved', 'flagged')),
  reviewed_by       TEXT,
  reviewed_at       TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sacred_sources_authority
  ON sacred_sources (authority_level);
CREATE INDEX IF NOT EXISTS idx_sacred_sources_status
  ON sacred_sources (review_status);

COMMENT ON TABLE sacred_sources IS
  'Source registry for sacred learning corpus. Every passage and commentary traces back here.';

-- ═══════════════════════════════════════════════════════════════
-- Passages: Individual text units with Arabic + translation
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS sacred_passages (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id         UUID NOT NULL REFERENCES sacred_sources(id) ON DELETE RESTRICT,
  authority_level   INTEGER NOT NULL CHECK (authority_level BETWEEN 1 AND 6),

  -- Qur'anic reference (Level 1 only, but optional for other levels)
  surah_name        TEXT,                          -- e.g. "Al-Baqarah"
  surah_number      INTEGER CHECK (surah_number IS NULL OR surah_number BETWEEN 1 AND 114),
  ayah_start        INTEGER,
  ayah_end          INTEGER,

  -- For non-Qur'anic sources
  section_ref       TEXT,                          -- e.g. "Book I, Story 3" or "Chapter on Dhikr"

  -- Content
  arabic_text       TEXT,                          -- UTF-8 Arabic. Required for Level 1
  translation_text  TEXT NOT NULL,                 -- Primary translation
  context_note      TEXT,                          -- Brief contextual note

  -- Provenance
  translator        TEXT,                          -- Translator of this specific passage
  translation_edition TEXT,

  -- State
  review_status     TEXT NOT NULL DEFAULT 'unreviewed'
                      CHECK (review_status IN ('unreviewed', 'reviewed', 'approved', 'flagged')),
  sensitivity_flags TEXT[] DEFAULT '{}',           -- e.g. {'SECTARIAN', 'CONTESTED', 'ESOTERIC'}
  day_number        INTEGER,                       -- Position in daily sequence (nullable)

  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Level 1 passages MUST have Arabic text and surah reference
  CONSTRAINT chk_level1_arabic CHECK (
    authority_level != 1 OR (arabic_text IS NOT NULL AND surah_number IS NOT NULL AND ayah_start IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_sacred_passages_authority
  ON sacred_passages (authority_level);
CREATE INDEX IF NOT EXISTS idx_sacred_passages_status
  ON sacred_passages (review_status);
CREATE INDEX IF NOT EXISTS idx_sacred_passages_day
  ON sacred_passages (day_number) WHERE day_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_sacred_passages_surah
  ON sacred_passages (surah_number, ayah_start) WHERE surah_number IS NOT NULL;

COMMENT ON TABLE sacred_passages IS
  'Individual text units. Level 1 = Qur''an (Arabic required). All levels carry provenance.';

-- ═══════════════════════════════════════════════════════════════
-- Commentary: Linked commentary entries per passage
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS sacred_commentary (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  passage_id        UUID NOT NULL REFERENCES sacred_passages(id) ON DELETE CASCADE,
  source_id         UUID NOT NULL REFERENCES sacred_sources(id) ON DELETE RESTRICT,
  authority_level   INTEGER NOT NULL CHECK (authority_level BETWEEN 2 AND 6),

  -- Content
  text              TEXT NOT NULL,
  section_ref       TEXT,                          -- Where in the source work

  -- Provenance
  author            TEXT NOT NULL,
  work              TEXT NOT NULL,
  translator        TEXT,

  -- State
  review_status     TEXT NOT NULL DEFAULT 'unreviewed'
                      CHECK (review_status IN ('unreviewed', 'reviewed', 'approved', 'flagged')),
  display_order     INTEGER NOT NULL DEFAULT 0,    -- Lower = shown first

  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sacred_commentary_passage
  ON sacred_commentary (passage_id, display_order);
CREATE INDEX IF NOT EXISTS idx_sacred_commentary_status
  ON sacred_commentary (review_status);

COMMENT ON TABLE sacred_commentary IS
  'Commentary linked to passages. authority_level 2-6 only (never 1). Always carries author+work.';

-- ═══════════════════════════════════════════════════════════════
-- Themes: Thematic groupings
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS sacred_themes (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug              TEXT NOT NULL UNIQUE,           -- e.g. "remembrance"
  name              TEXT NOT NULL,                  -- e.g. "Remembrance (Dhikr)"
  arabic_term       TEXT,                           -- e.g. "ذكر"
  description       TEXT,
  display_order     INTEGER NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- Passage-Theme Linking
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS sacred_passage_themes (
  passage_id        UUID NOT NULL REFERENCES sacred_passages(id) ON DELETE CASCADE,
  theme_id          UUID NOT NULL REFERENCES sacred_themes(id) ON DELETE CASCADE,
  PRIMARY KEY (passage_id, theme_id)
);

-- ═══════════════════════════════════════════════════════════════
-- Practices: Linked to passages or themes
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS sacred_practices (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  passage_id        UUID REFERENCES sacred_passages(id) ON DELETE SET NULL,
  theme_id          UUID REFERENCES sacred_themes(id) ON DELETE SET NULL,
  authority_level   INTEGER NOT NULL DEFAULT 6 CHECK (authority_level BETWEEN 1 AND 6),
  practice_type     TEXT NOT NULL DEFAULT 'contemplation'
                      CHECK (practice_type IN ('contemplation', 'embodied', 'ethical', 'recitation', 'dhikr')),
  text              TEXT NOT NULL,
  label             TEXT NOT NULL DEFAULT 'Practice Invitation (AI-composed)',
  review_status     TEXT NOT NULL DEFAULT 'unreviewed'
                      CHECK (review_status IN ('unreviewed', 'reviewed', 'approved', 'flagged')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sacred_practices_passage
  ON sacred_practices (passage_id) WHERE passage_id IS NOT NULL;

-- ═══════════════════════════════════════════════════════════════
-- Reflections: Member journal entries linked to passages
-- ═══════════════════════════════════════════════════════════════
-- Sanctuary Mode: if session is sanctuary, this row is NEVER created.

CREATE TABLE IF NOT EXISTS sacred_reflections (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id         UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  passage_id        UUID REFERENCES sacred_passages(id) ON DELETE SET NULL,
  theme_id          UUID REFERENCES sacred_themes(id) ON DELETE SET NULL,
  text              TEXT NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sacred_reflections_member
  ON sacred_reflections (member_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sacred_reflections_passage
  ON sacred_reflections (passage_id) WHERE passage_id IS NOT NULL;

COMMENT ON TABLE sacred_reflections IS
  'Member reflections on sacred passages. NEVER created during Sanctuary sessions.';

-- ═══════════════════════════════════════════════════════════════
-- Saved Passages: Member's personal collection
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS sacred_saved_passages (
  member_id         UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  passage_id        UUID NOT NULL REFERENCES sacred_passages(id) ON DELETE CASCADE,
  saved_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (member_id, passage_id)
);

-- ═══════════════════════════════════════════════════════════════
-- Formation State: Longitudinal learning position
-- ═══════════════════════════════════════════════════════════════
-- Parallel to member_spiral_state. Load early, upsert fire-and-forget.

CREATE TABLE IF NOT EXISTS member_sacred_formation (
  member_id           UUID PRIMARY KEY REFERENCES members(id) ON DELETE CASCADE,
  current_theme_id    UUID REFERENCES sacred_themes(id) ON DELETE SET NULL,
  current_day_number  INTEGER NOT NULL DEFAULT 1,
  passages_encountered INTEGER NOT NULL DEFAULT 0,
  reflections_written INTEGER NOT NULL DEFAULT 0,
  practices_engaged   INTEGER NOT NULL DEFAULT 0,
  last_encounter_at   TIMESTAMPTZ,
  formation_phase     TEXT NOT NULL DEFAULT 'beginning'
                        CHECK (formation_phase IN ('beginning', 'deepening', 'returning')),
  layer_visibility    TEXT NOT NULL DEFAULT 'full'
                        CHECK (layer_visibility IN ('text_only', 'text_meaning', 'full')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE member_sacred_formation IS
  'Longitudinal formation state. Load at encounter start, upsert fire-and-forget at end.';

-- ═══════════════════════════════════════════════════════════════
-- Auto-update timestamps
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_sacred_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sacred_sources_timestamp
  BEFORE UPDATE ON sacred_sources
  FOR EACH ROW EXECUTE FUNCTION update_sacred_timestamp();

CREATE TRIGGER trigger_sacred_passages_timestamp
  BEFORE UPDATE ON sacred_passages
  FOR EACH ROW EXECUTE FUNCTION update_sacred_timestamp();

CREATE TRIGGER trigger_sacred_commentary_timestamp
  BEFORE UPDATE ON sacred_commentary
  FOR EACH ROW EXECUTE FUNCTION update_sacred_timestamp();

CREATE TRIGGER trigger_sacred_formation_timestamp
  BEFORE UPDATE ON member_sacred_formation
  FOR EACH ROW EXECUTE FUNCTION update_sacred_timestamp();
