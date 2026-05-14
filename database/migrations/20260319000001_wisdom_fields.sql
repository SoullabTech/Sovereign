-- ============================================
-- WISDOM FIELDS — Phase 1
-- Adds Wisdom Keepers Fields (past masters) and
-- Master's Fields (living thinkers) as community
-- gathering spaces organized around a body of work.
--
-- Design law: "The intelligence here arises through
-- the community's encounter with the work itself."
--
-- Two AI postures:
--   contextual — MAIA explores alongside members (past masters)
--   none       — MAIA is architecturally silent (living masters)
-- ============================================

-- ── 1) wisdom_fields ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS wisdom_fields (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          VARCHAR(80) NOT NULL UNIQUE,
  field_type    TEXT        NOT NULL
                  CHECK (field_type IN ('wisdom_keeper', 'masters_field')),
  ai_posture    TEXT        NOT NULL
                  CHECK (ai_posture IN ('contextual', 'none')),
  master_name   TEXT        NOT NULL,
  master_dates  TEXT,                        -- e.g. "1875–1961" or "b. 1953"
  master_domain TEXT,                        -- e.g. "Analytical psychology, alchemy"
  orientation   TEXT,                        -- human-written, steward-maintained
  ai_posture_note TEXT,                      -- shown to members: why AI is present/absent
  visibility    TEXT        NOT NULL DEFAULT 'open'
                  CHECK (visibility IN ('open', 'invite_only')),
  status        TEXT        NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active', 'archived')),
  created_by    UUID        NOT NULL REFERENCES members(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wisdom_fields_type
  ON wisdom_fields(field_type, status);

COMMENT ON TABLE wisdom_fields IS
  'Wisdom Keepers Fields (past masters) and Master''s Fields (living thinkers) — community spaces around a body of work';
COMMENT ON COLUMN wisdom_fields.field_type IS
  'wisdom_keeper=past masters whose work entered shared inheritance; masters_field=living thinkers, ethical precision required';
COMMENT ON COLUMN wisdom_fields.ai_posture IS
  'contextual=MAIA explores alongside members; none=MAIA architecturally silent, community only';
COMMENT ON COLUMN wisdom_fields.ai_posture_note IS
  'Shown to members — why MAIA is present or absent in this field';

-- ── 2) wisdom_field_memberships ─────────────────────────────────

CREATE TABLE IF NOT EXISTS wisdom_field_memberships (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  field_id   UUID        NOT NULL REFERENCES wisdom_fields(id) ON DELETE CASCADE,
  member_id  UUID        NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  role       TEXT        NOT NULL DEFAULT 'member'
               CHECK (role IN ('member', 'steward')),
  status     TEXT        NOT NULL DEFAULT 'active'
               CHECK (status IN ('active', 'left')),
  joined_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (field_id, member_id)
);

CREATE INDEX IF NOT EXISTS idx_wfm_member
  ON wisdom_field_memberships(member_id, status);
CREATE INDEX IF NOT EXISTS idx_wfm_field
  ON wisdom_field_memberships(field_id, status);

COMMENT ON TABLE wisdom_field_memberships IS
  'Field membership — members (participants) and stewards (curators who hold the tone)';
COMMENT ON COLUMN wisdom_field_memberships.role IS
  'member=contributor/reader; steward=curates Core Ideas, Key Works, holds tone — not interpretive authority';

-- ── 3) wisdom_field_works ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS wisdom_field_works (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  field_id     UUID        NOT NULL REFERENCES wisdom_fields(id) ON DELETE CASCADE,
  title        TEXT        NOT NULL,
  year         VARCHAR(10),
  work_type    TEXT        NOT NULL DEFAULT 'book'
                 CHECK (work_type IN ('book', 'essay', 'lecture', 'interview', 'other')),
  description  TEXT,                           -- 2–3 sentences, human-written
  external_url TEXT,                           -- publisher / archive / official site
  entry_point  BOOLEAN     NOT NULL DEFAULT false, -- steward flags newcomer-accessible works
  added_by     UUID        NOT NULL REFERENCES members(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wfw_field
  ON wisdom_field_works(field_id, work_type);
CREATE INDEX IF NOT EXISTS idx_wfw_entry_point
  ON wisdom_field_works(field_id) WHERE entry_point = true;

COMMENT ON TABLE wisdom_field_works IS
  'Key Works catalog — a map to primary sources, not a content library. Points toward works; does not replace them.';
COMMENT ON COLUMN wisdom_field_works.entry_point IS
  'Steward flags works accessible to newcomers. Shown first in "New to [Master]? Start here."';

-- ── 4) wisdom_field_core_ideas ───────────────────────────────────

CREATE TABLE IF NOT EXISTS wisdom_field_core_ideas (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  field_id      UUID        NOT NULL REFERENCES wisdom_fields(id) ON DELETE CASCADE,
  concept       TEXT        NOT NULL,              -- e.g. "Shadow", "Individuation"
  one_line      TEXT        NOT NULL,              -- one-sentence orientation
  body          TEXT,                              -- 3–5 sentences, steward-maintained
  related_concepts TEXT[],                         -- e.g. ARRAY['Self', 'Persona']
  sort_order    INTEGER     NOT NULL DEFAULT 0,    -- display ordering within field
  added_by      UUID        NOT NULL REFERENCES members(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wfci_field
  ON wisdom_field_core_ideas(field_id, sort_order);

COMMENT ON TABLE wisdom_field_core_ideas IS
  'Curated concept map maintained by stewards. A living orientation — not a glossary, not a Wikipedia mirror.';

-- ── 5) wisdom_field_contributions ───────────────────────────────

CREATE TABLE IF NOT EXISTS wisdom_field_contributions (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  field_id            UUID        NOT NULL REFERENCES wisdom_fields(id) ON DELETE CASCADE,
  member_id           UUID        NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  contribution_type   TEXT        NOT NULL
                        CHECK (contribution_type IN ('reflection', 'question', 'integration', 'application')),
  work_id             UUID        REFERENCES wisdom_field_works(id) ON DELETE SET NULL,
  -- lineage: when this contribution originated from an evolution thread entry
  source              TEXT        CHECK (source IN ('direct', 'evolution_thread')),
  source_entry_id     UUID,                        -- FK to wisdom_field_evolution_entries.id (set after that table exists)
  title               TEXT,
  body                TEXT        NOT NULL,
  revoked_at          TIMESTAMPTZ,                 -- member retraction; nullifies display, preserves row
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wfc_field
  ON wisdom_field_contributions(field_id, created_at DESC) WHERE revoked_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_wfc_member
  ON wisdom_field_contributions(member_id);
CREATE INDEX IF NOT EXISTS idx_wfc_type
  ON wisdom_field_contributions(field_id, contribution_type) WHERE revoked_at IS NULL;

COMMENT ON TABLE wisdom_field_contributions IS
  'Member contributions — all must be human-authored. AI-generated content is prohibited.';
COMMENT ON COLUMN wisdom_field_contributions.contribution_type IS
  'reflection=personal encounter; question=held inquiry; integration=lived experience; application=in practice';
COMMENT ON COLUMN wisdom_field_contributions.source IS
  'direct=written in the feed; evolution_thread=shared from private evolution log';
COMMENT ON COLUMN wisdom_field_contributions.revoked_at IS
  'Member retraction. Row preserved for integrity; display suppressed. Source private entry unaffected.';

-- ── 6) wisdom_field_replies ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS wisdom_field_replies (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  contribution_id   UUID        NOT NULL REFERENCES wisdom_field_contributions(id) ON DELETE CASCADE,
  member_id         UUID        NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  body              TEXT        NOT NULL,
  revoked_at        TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wfr_contribution
  ON wisdom_field_replies(contribution_id, created_at ASC) WHERE revoked_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_wfr_member
  ON wisdom_field_replies(member_id);

COMMENT ON TABLE wisdom_field_replies IS
  'Community replies — member-to-member. No voting, no ranking. Threaded, chronological.';

-- ── 7) wisdom_field_circles ──────────────────────────────────────
-- Links existing Circles to a parent field.
-- Circles retain their own consent, role, and lifecycle architecture.

CREATE TABLE IF NOT EXISTS wisdom_field_circles (
  field_id    UUID        NOT NULL REFERENCES wisdom_fields(id) ON DELETE CASCADE,
  circle_id   UUID        NOT NULL REFERENCES circles(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (field_id, circle_id)
);

CREATE INDEX IF NOT EXISTS idx_wfcircles_field
  ON wisdom_field_circles(field_id);

COMMENT ON TABLE wisdom_field_circles IS
  'Sub-circles nested inside a field. Additive link only — circles retain sovereign consent architecture.';

-- ── 8) wisdom_field_evolution_entries ───────────────────────────
-- The longitudinal private thread: one log per member per field.
-- Core primitive for developmental engagement (not just consumption).

CREATE TABLE IF NOT EXISTS wisdom_field_evolution_entries (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  field_id    UUID        NOT NULL REFERENCES wisdom_fields(id) ON DELETE CASCADE,
  member_id   UUID        NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  body        TEXT        NOT NULL,
  shared      BOOLEAN     NOT NULL DEFAULT false,
  -- When shared=true, a wisdom_field_contributions row is created
  -- with source='evolution_thread' and source_entry_id=this.id
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Composite constraint enables FK reference from contributions table
  -- and supports future lineage tracing across fields
  CONSTRAINT uq_evolution_entry_identity
    UNIQUE (id, field_id, member_id)
);

CREATE INDEX IF NOT EXISTS idx_wfee_member
  ON wisdom_field_evolution_entries(member_id);
CREATE INDEX IF NOT EXISTS idx_wfee_field
  ON wisdom_field_evolution_entries(field_id);
CREATE INDEX IF NOT EXISTS idx_wfee_shared
  ON wisdom_field_evolution_entries(shared) WHERE shared = true;

COMMENT ON TABLE wisdom_field_evolution_entries IS
  'Private per-member per-field evolution log. Longitudinal. Optionally permeable: shared=true surfaces in contributions feed.';
COMMENT ON COLUMN wisdom_field_evolution_entries.shared IS
  'false=private only; true=creates a contributions row (type=integration, source=evolution_thread)';

-- ── Now that evolution_entries exists, FK on contributions ───────

ALTER TABLE wisdom_field_contributions
  ADD CONSTRAINT fk_wfc_source_entry
    FOREIGN KEY (source_entry_id)
    REFERENCES wisdom_field_evolution_entries(id)
    ON DELETE SET NULL;

-- ── updated_at triggers ──────────────────────────────────────────

CREATE OR REPLACE FUNCTION wisdom_fields_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS wisdom_fields_updated_at ON wisdom_fields;
CREATE TRIGGER wisdom_fields_updated_at
  BEFORE UPDATE ON wisdom_fields
  FOR EACH ROW EXECUTE FUNCTION wisdom_fields_set_updated_at();

DROP TRIGGER IF EXISTS wisdom_field_memberships_updated_at ON wisdom_field_memberships;
CREATE TRIGGER wisdom_field_memberships_updated_at
  BEFORE UPDATE ON wisdom_field_memberships
  FOR EACH ROW EXECUTE FUNCTION wisdom_fields_set_updated_at();

DROP TRIGGER IF EXISTS wisdom_field_core_ideas_updated_at ON wisdom_field_core_ideas;
CREATE TRIGGER wisdom_field_core_ideas_updated_at
  BEFORE UPDATE ON wisdom_field_core_ideas
  FOR EACH ROW EXECUTE FUNCTION wisdom_fields_set_updated_at();

DROP TRIGGER IF EXISTS wisdom_field_contributions_updated_at ON wisdom_field_contributions;
CREATE TRIGGER wisdom_field_contributions_updated_at
  BEFORE UPDATE ON wisdom_field_contributions
  FOR EACH ROW EXECUTE FUNCTION wisdom_fields_set_updated_at();

-- ── Pilot field seeds ────────────────────────────────────────────
-- Seeds require a system/admin member to exist as created_by.
-- Replace :system_member_id with the actual admin UUID at apply time,
-- or run the seed block separately after member creation.
--
-- DO $seed$
-- DECLARE sys_id UUID := '<admin-member-uuid>';
-- BEGIN
--
-- INSERT INTO wisdom_fields
--   (slug, field_type, ai_posture, master_name, master_dates, master_domain,
--    orientation, ai_posture_note, created_by)
-- VALUES
-- (
--   'carl-jung',
--   'wisdom_keeper',
--   'contextual',
--   'Carl Jung',
--   '1875–1961',
--   'Analytical Psychology, Alchemy, Myth',
--   'Jung opened a map of the psyche that took seriously what modernity had discarded — dream, symbol, shadow, and the deep patterns that move beneath conscious life. His work does not offer answers so much as a way of asking better questions. This field gathers people who are working with his ideas — not as an intellectual exercise, but as a living practice.',
--   'MAIA can explore this work alongside you. She does not speak as Jung.',
--   sys_id
-- ),
-- (
--   'iain-mcgilchrist',
--   'masters_field',
--   'none',
--   'Iain McGilchrist',
--   'b. 1953',
--   'Hemispheric Mind, Attention, Meaning, Re-enchantment',
--   'McGilchrist''s work is a sustained argument that how we attend to the world determines what world we inhabit. His insight — that the left hemisphere''s drive to control has come to dominate at civilization scale — reframes almost every crisis we face. This field is a space to study, metabolize, and bring his contribution into lived practice.',
--   'MAIA is quiet here. This field belongs to the community and to McGilchrist''s work.',
--   sys_id
-- ),
-- (
--   'marie-louise-von-franz',
--   'wisdom_keeper',
--   'contextual',
--   'Marie-Louise von Franz',
--   '1915–1998',
--   'Jungian Alchemy, Fairy Tales, Dreams, the Feminine',
--   'Von Franz was Jung''s closest collaborator and, many argue, his most precise interpreter. Her work on fairy tales, alchemy, and the individuation process in the feminine carries the Jungian tradition into symbolic territory that few have mapped as carefully. This field is for those drawn into the deeper layers of the psyche through image and myth.',
--   'MAIA can explore this work alongside you. She does not speak as von Franz.',
--   sys_id
-- );
--
-- END $seed$;
-- ── End of seed block (uncomment and set sys_id to apply) ────────
