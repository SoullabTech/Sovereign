-- The Beta Learning Field
--
-- Backing tables for /beta-testers — an invite-only learning field where testers
-- participate as co-investigators, not bug reporters. Hybrid content model: the
-- doctrine (Welcome, How to Participate, Elemental Perspectives, tester
-- philosophy) lives in-repo as markdown (content/beta-testers/*.md); the
-- changing surfaces below live here so the team can evolve them without a deploy.
--
-- THREE SEALED LAYERS — do not collapse them:
--   Member Memory   ≠  Beta Observation  ≠  Platform Learning
-- A beta observation is what a tester notices ABOUT MAIA. It is NOT the member's
-- personal memory and must NEVER be ingested as atoms / recall / conversation
-- context. beta_observations is read only by the admin review surface and by
-- cohort-facing Shared Learnings (only once an observation is explicitly approved).

-- Cohort gating — invite-only. Only status='active' may enter the field.
CREATE TABLE IF NOT EXISTS beta_cohort_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL,
  cohort_name TEXT NOT NULL DEFAULT 'beta',
  status TEXT NOT NULL DEFAULT 'invited' CHECK (status IN ('invited','active','paused','removed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (member_id, cohort_name)
);
CREATE INDEX IF NOT EXISTS idx_beta_cohort_member ON beta_cohort_memberships (member_id, status);

-- What We Are Learning — the live inquiry (current questions), not a roadmap.
CREATE TABLE IF NOT EXISTS beta_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  detail TEXT NOT NULL DEFAULT '',
  active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_beta_questions_active ON beta_questions (active, sort_order);

-- Experiments — investigations (structured protocols), distinct from Challenge
-- invitations. A powerful source of developmental signal.
CREATE TABLE IF NOT EXISTS beta_experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT,
  title TEXT NOT NULL,
  protocol TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_beta_experiments_active ON beta_experiments (active, sort_order);

-- News — admin-authored updates for the cohort.
CREATE TABLE IF NOT EXISTS beta_news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  author_member_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_beta_news_published ON beta_news (published, published_at DESC);

-- Challenges — invitations to bring a real question. NOT gamification.
CREATE TABLE IF NOT EXISTS beta_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  prompt TEXT NOT NULL,
  element TEXT CHECK (element IN ('fire','water','earth','air','aether')),
  active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_beta_challenges_active ON beta_challenges (active, sort_order);

-- Roadmap — honest liveness ladder, never marketing promises.
CREATE TABLE IF NOT EXISTS beta_roadmap_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'considering'
    CHECK (status IN ('considering','building','wired','surfacing','verified','shipped')),
  category TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_beta_roadmap_sort ON beta_roadmap_items (sort_order);

-- Observation Stream — SEALED (see header). Visibility governs the curation flow:
--   private        — only the tester (their own return-later record)
--   admin_review   — submitted for review (the default)
--   shared_approved— admin approved; appears in cohort Shared Learnings
CREATE TABLE IF NOT EXISTS beta_observations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL,
  prompt_type TEXT NOT NULL
    CHECK (prompt_type IN ('helped_notice','missed','clearer_later','confused_when','returned_later')),
  observation_text TEXT NOT NULL,
  elemental_lens TEXT CHECK (elemental_lens IN ('fire','water','earth','air','aether')),
  related_challenge_id UUID REFERENCES beta_challenges(id) ON DELETE SET NULL,
  related_experiment_id UUID REFERENCES beta_experiments(id) ON DELETE SET NULL,
  visibility TEXT NOT NULL DEFAULT 'admin_review'
    CHECK (visibility IN ('private','admin_review','shared_approved')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_beta_observations_created ON beta_observations (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_beta_observations_member ON beta_observations (member_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_beta_observations_visibility ON beta_observations (visibility, created_at DESC);
COMMENT ON TABLE beta_observations IS
  'SEALED tester observation stream. What testers notice ABOUT MAIA. Never ingested as member memory / atoms / recall / conversation context. Member Memory != Beta Observation != Platform Learning.';

-- Shared Learnings — admin-authored / synthesized entries (distinct from approved
-- observations). The cohort Shared Learnings view unions these with approved
-- observations. Default admin_only; cohort-visible only when published.
CREATE TABLE IF NOT EXISTS beta_shared_learnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  source_observation_id UUID REFERENCES beta_observations(id) ON DELETE SET NULL,
  curated_by_member_id UUID,
  visibility TEXT NOT NULL DEFAULT 'admin_only' CHECK (visibility IN ('admin_only','cohort')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_beta_learnings_visibility ON beta_shared_learnings (visibility, published_at DESC);

-- Field Pulse — the CURATED half of "What is alive right now". The measured half
-- (counts, most-active lens, who returned) is computed live from beta_observations
-- and is never stored. This table holds only a steward's *reading* of the field —
-- shown to the cohort as a human reflection, never as an auto-detected claim.
-- Honors metaphor-after-measurement: numbers are measured, meaning is named by a person.
CREATE TABLE IF NOT EXISTS beta_field_pulse (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sensing_theme TEXT NOT NULL DEFAULT '',
  returning_questions TEXT NOT NULL DEFAULT '',
  sensing_note TEXT NOT NULL DEFAULT '',
  updated_by UUID,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_beta_field_pulse_updated ON beta_field_pulse (updated_at DESC);

-- ---------------------------------------------------------------------------
-- Idempotent seeds — only when each table is still empty. Honest starting
-- points; edit freely via the admin surface.
-- ---------------------------------------------------------------------------

INSERT INTO beta_news (title, body, published, published_at)
SELECT 'The field is open',
  'Welcome. This is where the beta lives now — the inquiry, the experiments, the invitations, the roadmap, and a place to leave what you notice.' || chr(10) || chr(10) ||
  'MAIA is not being tested as a chatbot. You are helping us investigate questions. Start anywhere, and return later.',
  true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM beta_news);

INSERT INTO beta_questions (question, detail, sort_order)
SELECT v.q, v.d, v.s FROM (VALUES
  ('What happens when people return to the same question over time?', 'Continuity is the part of MAIA we understand least. Returning is where we expect to learn the most.', 1),
  ('Can elemental lenses help people see a situation differently?', 'Fire, Water, Earth, Air, Aether are attentional lenses, not types. We want to know if shifting lens shifts seeing.', 2),
  ('Do people discover insights later that were not obvious initially?', 'Some things only become clear with time. We are listening for the delayed signal.', 3),
  ('What forms of continuity actually matter?', 'Not all memory is meaningful. We want to learn which threads are worth holding.', 4)
) AS v(q, d, s)
WHERE NOT EXISTS (SELECT 1 FROM beta_questions);

INSERT INTO beta_experiments (code, title, protocol, sort_order)
SELECT v.c, v.t, v.p, v.s FROM (VALUES
  ('Experiment 01', 'The Return Experiment', 'Ask one question. Return three days later, then ten days later. Notice what changed — in the question, and in you.', 1),
  ('Experiment 02', 'Elemental Shift', 'Bring the same question to MAIA through Fire, then Water, then Earth, then Air. Compare what each lens surfaces.', 2),
  ('Experiment 03', 'Future Self Dialogue', 'Leave a message for your future self. Return to it in thirty days and notice what has shifted.', 3),
  ('Experiment 04', 'Synchronicity Hunt', 'Notice three meaningful coincidences this week. Record them here, and see what pattern emerges.', 4)
) AS v(c, t, p, s)
WHERE NOT EXISTS (SELECT 1 FROM beta_experiments);

INSERT INTO beta_challenges (title, prompt, element, sort_order)
SELECT v.title, v.prompt, v.element, v.sort_order FROM (VALUES
  ('A decision you are facing', 'Bring a real decision you are sitting with. Notice what each attentional lens surfaces that you had not yet put words to.', 'fire', 1),
  ('A recurring pattern', 'Name a pattern in your life that keeps returning. Bring it as a question rather than a complaint, and notice what gets reflected back.', 'water', 2),
  ('Something you cannot quite make sense of', 'Bring something genuinely unresolved. Let it stay unresolved. Notice whether the holding helps, or gets in the way.', 'aether', 3)
) AS v(title, prompt, element, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM beta_challenges);

INSERT INTO beta_roadmap_items (title, description, status, category, sort_order)
SELECT v.title, v.description, v.status, v.category, v.sort_order FROM (VALUES
  ('The learning field', 'A single home for the inquiry, experiments, invitations, roadmap, and observations.', 'shipped', 'Field', 1),
  ('Tester observation stream', 'A dedicated, sealed place to leave what you notice — kept separate from MAIA''s memory.', 'shipped', 'Field', 2),
  ('Shared learnings', 'Approved observations and synthesized patterns, reflected back to the cohort.', 'building', 'Field', 3),
  ('Deeper continuity across sessions', 'Whether MAIA can hold the thread of a life unfolding without overclaiming. Active, unproven.', 'considering', 'Memory', 4)
) AS v(title, description, status, category, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM beta_roadmap_items);
