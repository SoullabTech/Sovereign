-- Practice Worlds Registry
-- Pluggable interpretive lenses for multi-world practitioner support
-- Each "world" = a modality/framework that produces its own insights + experiments

-- Core worlds registry
CREATE TABLE IF NOT EXISTS practice_worlds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE,           -- 'somatic', 'parts_ifs', 'jungian', etc.
  display_name TEXT NOT NULL,                 -- 'Somatic/Body-Based'
  description TEXT,                           -- What this world offers

  -- World categorization
  domain VARCHAR(30) CHECK (domain IN (
    'body', 'mind', 'relational', 'creative', 'spiritual', 'integrative'
  )),

  -- World capabilities
  insight_types TEXT[] DEFAULT '{}',          -- Which insight types this world generates
  experiment_types TEXT[] DEFAULT '{}',       -- Types of micro-practices it suggests
  vocabulary TEXT[] DEFAULT '{}',             -- Key terms/markers for this world

  -- Activation
  is_system BOOLEAN DEFAULT FALSE,            -- Built-in vs user-created
  is_active BOOLEAN DEFAULT TRUE,             -- Can be disabled globally
  requires_training BOOLEAN DEFAULT FALSE,    -- Needs practitioner certification?

  -- Metadata
  icon_name VARCHAR(50),                      -- Lucide icon name for UI
  color_theme VARCHAR(20),                    -- emerald, blue, purple, etc.
  sort_order INTEGER DEFAULT 100,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Practitioner's enabled worlds
CREATE TABLE IF NOT EXISTS practitioner_worlds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL,
  world_id UUID NOT NULL REFERENCES practice_worlds(id) ON DELETE CASCADE,

  -- Proficiency tracking
  proficiency_level VARCHAR(20) DEFAULT 'exploring' CHECK (proficiency_level IN (
    'exploring',    -- Just learning this world
    'practicing',   -- Actively using, building skill
    'proficient',   -- Confident, regular use
    'mastery'       -- Signature strength
  )),

  -- Activation
  is_enabled BOOLEAN DEFAULT TRUE,            -- Practitioner can toggle worlds
  auto_suggest BOOLEAN DEFAULT TRUE,          -- MAIA suggests this world when relevant

  -- Learning tracking
  sessions_using_world INTEGER DEFAULT 0,     -- How many sessions they've used it
  last_used_at TIMESTAMPTZ,
  first_enabled_at TIMESTAMPTZ DEFAULT NOW(),

  -- Practitioner notes
  learning_notes TEXT,                        -- Their reflections on this world

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(practitioner_id, world_id)
);

-- World-specific insight definitions
CREATE TABLE IF NOT EXISTS world_insight_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  world_id UUID NOT NULL REFERENCES practice_worlds(id) ON DELETE CASCADE,

  code VARCHAR(50) NOT NULL,                  -- 'somatic_cue', 'part_identified', etc.
  display_name TEXT NOT NULL,                 -- 'Somatic Cue Noticed'
  description TEXT,                           -- What this insight captures

  -- For MAIA's analysis
  detection_markers TEXT[] DEFAULT '{}',      -- Words/phrases that trigger this insight
  prompt_template TEXT,                       -- Prompt for generating this insight

  -- UI
  icon_name VARCHAR(50),
  significance_default NUMERIC(3,2) DEFAULT 0.5,

  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 100,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(world_id, code)
);

-- World-specific micro-practice experiments
CREATE TABLE IF NOT EXISTS world_experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  world_id UUID NOT NULL REFERENCES practice_worlds(id) ON DELETE CASCADE,

  code VARCHAR(50) NOT NULL,                  -- 'body_scan_invitation', 'parts_dialogue'
  title TEXT NOT NULL,                        -- 'Body Scan Invitation'
  description TEXT NOT NULL,                  -- What to try

  -- When to suggest
  trigger_conditions TEXT,                    -- When MAIA might suggest this
  difficulty_level VARCHAR(20) DEFAULT 'accessible' CHECK (difficulty_level IN (
    'accessible',   -- Any practitioner can try
    'intermediate', -- Needs some world familiarity
    'advanced'      -- Requires proficiency
  )),

  -- For the practitioner
  instructions TEXT,                          -- How to do it
  what_to_notice TEXT,                        -- What to observe
  reflection_prompts TEXT[],                  -- Questions to sit with after

  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 100,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(world_id, code)
);

-- Track which worlds were active in each session
CREATE TABLE IF NOT EXISTS session_worlds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES practice_sessions(id) ON DELETE CASCADE,
  world_id UUID NOT NULL REFERENCES practice_worlds(id) ON DELETE CASCADE,

  -- How was this world used?
  usage_type VARCHAR(20) DEFAULT 'detected' CHECK (usage_type IN (
    'detected',     -- MAIA detected world markers
    'explicit',     -- Practitioner intentionally used it
    'suggested',    -- MAIA suggested, practitioner tried
    'missed'        -- Opening was there but not taken
  )),

  -- Metrics
  segment_refs UUID[],                        -- Which transcript segments
  marker_count INTEGER DEFAULT 0,             -- How many markers detected

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(session_id, world_id)
);

-- Seed core worlds
INSERT INTO practice_worlds (code, display_name, description, domain, insight_types, experiment_types, vocabulary, is_system, icon_name, color_theme, sort_order) VALUES
  -- Body domain
  ('somatic', 'Somatic/Body-Based',
   'Working with body sensations, felt sense, and embodied experience. Helps clients access wisdom held in the body.',
   'body',
   ARRAY['somatic_cue', 'body_response', 'grounding_moment', 'energy_shift', 'nervous_system_state'],
   ARRAY['body_scan', 'breath_invitation', 'movement_impulse', 'grounding_practice'],
   ARRAY['body', 'sensation', 'felt sense', 'grounding', 'breath', 'tension', 'relaxation', 'embodied', 'somatic', 'nervous system'],
   TRUE, 'activity', 'emerald', 10),

  ('breathwork', 'Breathwork',
   'Conscious breathing practices for regulation, release, and expanded states.',
   'body',
   ARRAY['breath_pattern', 'regulation_shift', 'release_moment'],
   ARRAY['coherent_breathing', 'extended_exhale', 'breath_hold', 'connected_breathing'],
   ARRAY['breath', 'breathing', 'inhale', 'exhale', 'respiratory', 'ventilation'],
   TRUE, 'wind', 'cyan', 15),

  -- Mind domain
  ('parts_ifs', 'Parts Work / IFS',
   'Internal Family Systems and parts-based approaches. Working with inner parts, protectors, exiles, and Self.',
   'mind',
   ARRAY['part_identified', 'protector_spotted', 'exile_touched', 'self_energy', 'polarization', 'blending'],
   ARRAY['parts_mapping', 'protector_appreciation', 'unblending_practice', 'self_to_part'],
   ARRAY['part', 'parts', 'protector', 'exile', 'manager', 'firefighter', 'Self', 'blending', 'unblend'],
   TRUE, 'users', 'violet', 20),

  ('cognitive', 'Cognitive/CBT',
   'Working with thoughts, beliefs, and cognitive patterns. Reframing, challenging assumptions.',
   'mind',
   ARRAY['thought_pattern', 'belief_identified', 'reframe_offered', 'cognitive_distortion'],
   ARRAY['thought_record', 'belief_examination', 'evidence_review', 'alternative_thought'],
   ARRAY['thought', 'belief', 'assume', 'interpret', 'reframe', 'perspective', 'cognitive'],
   TRUE, 'brain', 'blue', 25),

  ('narrative', 'Narrative Therapy',
   'Working with stories, identity, and meaning-making. Externalizing problems, re-authoring.',
   'mind',
   ARRAY['story_identified', 'dominant_narrative', 'alternative_story', 'unique_outcome'],
   ARRAY['externalization', 'reauthoring', 'witness_practice', 'letter_writing'],
   ARRAY['story', 'narrative', 'meaning', 'identity', 'externalize', 'author', 'chapter'],
   TRUE, 'book-open', 'amber', 30),

  -- Relational domain
  ('attachment', 'Attachment-Based',
   'Working with attachment patterns, relational templates, and earned security.',
   'relational',
   ARRAY['attachment_pattern', 'relational_template', 'rupture_spotted', 'repair_attempt', 'here_and_now'],
   ARRAY['relational_inquiry', 'attachment_mapping', 'repair_practice'],
   ARRAY['attachment', 'relationship', 'trust', 'safety', 'connection', 'rupture', 'repair', 'secure'],
   TRUE, 'heart-handshake', 'rose', 35),

  ('gestalt', 'Gestalt / Here-and-Now',
   'Present-moment awareness, contact, and experiments. What''s happening right now between us?',
   'relational',
   ARRAY['contact_moment', 'awareness_now', 'unfinished_business', 'figure_ground'],
   ARRAY['empty_chair', 'two_chair', 'awareness_continuum', 'contact_experiment'],
   ARRAY['here and now', 'contact', 'awareness', 'figure', 'ground', 'unfinished', 'experiment'],
   TRUE, 'eye', 'orange', 40),

  -- Creative domain
  ('imaginal', 'Imaginal / Visualization',
   'Working with images, symbols, and the imaginal realm. Active imagination, guided imagery.',
   'creative',
   ARRAY['image_emerged', 'symbol_appeared', 'imaginal_dialogue', 'transformation_image'],
   ARRAY['guided_imagery', 'active_imagination', 'symbol_dialogue', 'image_transformation'],
   ARRAY['image', 'imagine', 'visualize', 'symbol', 'picture', 'see', 'vision'],
   TRUE, 'image', 'fuchsia', 45),

  ('dreamwork', 'Dreamwork',
   'Working with dreams as messages from the unconscious. Amplification, association, embodiment.',
   'creative',
   ARRAY['dream_shared', 'dream_element', 'amplification', 'dream_ego'],
   ARRAY['dream_journal', 'dream_dialogue', 'dream_embodiment', 'dream_drawing'],
   ARRAY['dream', 'dreamed', 'nightmare', 'sleep', 'unconscious', 'symbol'],
   TRUE, 'moon', 'indigo', 50),

  ('expressive', 'Expressive Arts',
   'Art, movement, music, drama as therapeutic modalities. Creative expression as healing.',
   'creative',
   ARRAY['creative_expression', 'art_emerged', 'movement_impulse', 'metaphor_created'],
   ARRAY['free_drawing', 'movement_exploration', 'sound_making', 'collage'],
   ARRAY['draw', 'paint', 'create', 'art', 'move', 'dance', 'express', 'music'],
   TRUE, 'palette', 'pink', 55),

  -- Spiritual domain
  ('jungian', 'Jungian / Depth Psychology',
   'Working with archetypes, shadow, anima/animus, individuation. The collective unconscious.',
   'spiritual',
   ARRAY['archetype_active', 'shadow_material', 'anima_animus', 'individuation_moment', 'synchronicity'],
   ARRAY['shadow_dialogue', 'archetype_exploration', 'dream_amplification', 'active_imagination'],
   ARRAY['archetype', 'shadow', 'anima', 'animus', 'unconscious', 'collective', 'individuation', 'Self'],
   TRUE, 'sun', 'yellow', 60),

  ('transpersonal', 'Transpersonal / Spiritual',
   'Working with soul, spirit, meaning, purpose. Expanded states, spiritual emergence.',
   'spiritual',
   ARRAY['soul_moment', 'meaning_emerged', 'transcendent_experience', 'spiritual_resource'],
   ARRAY['meditation', 'contemplation', 'prayer_practice', 'meaning_inquiry'],
   ARRAY['soul', 'spirit', 'meaning', 'purpose', 'sacred', 'divine', 'transcend', 'mystical'],
   TRUE, 'sparkles', 'purple', 65),

  ('energy', 'Energy Work',
   'Working with subtle energy, chakras, meridians, biofield. Energy awareness and clearing.',
   'spiritual',
   ARRAY['energy_shift', 'chakra_activation', 'field_clearing', 'energy_block'],
   ARRAY['energy_scan', 'grounding_cord', 'chakra_meditation', 'boundary_practice'],
   ARRAY['energy', 'chakra', 'aura', 'field', 'vibration', 'frequency', 'clearing'],
   TRUE, 'zap', 'teal', 70),

  -- Integrative
  ('mindfulness', 'Mindfulness / Presence',
   'Present-moment awareness without judgment. MBSR, MBCT, and contemplative practices.',
   'integrative',
   ARRAY['mindful_moment', 'present_awareness', 'non_judgment', 'acceptance'],
   ARRAY['body_scan', 'breath_awareness', 'loving_kindness', 'RAIN_practice'],
   ARRAY['mindful', 'present', 'aware', 'notice', 'observe', 'accept', 'non-judgment'],
   TRUE, 'focus', 'stone', 75),

  ('polyvagal', 'Polyvagal / Nervous System',
   'Working with the autonomic nervous system. Ventral vagal, sympathetic, dorsal states.',
   'integrative',
   ARRAY['state_shift', 'ventral_access', 'sympathetic_activation', 'dorsal_collapse', 'coregulation'],
   ARRAY['glimmers_practice', 'vagal_toning', 'state_mapping', 'coregulation_moment'],
   ARRAY['vagal', 'nervous system', 'regulation', 'dysregulation', 'window of tolerance', 'fight', 'flight', 'freeze'],
   TRUE, 'activity', 'lime', 80)
ON CONFLICT (code) DO NOTHING;

-- Seed insight types for each world
INSERT INTO world_insight_types (world_id, code, display_name, description, detection_markers)
SELECT w.id, 'somatic_cue', 'Somatic Cue Noticed',
  'Body sensation or signal that emerged during session',
  ARRAY['sensation', 'felt', 'body', 'stomach', 'chest', 'throat', 'tension']
FROM practice_worlds w WHERE w.code = 'somatic'
ON CONFLICT (world_id, code) DO NOTHING;

INSERT INTO world_insight_types (world_id, code, display_name, description, detection_markers)
SELECT w.id, 'part_identified', 'Part Identified',
  'An inner part was named or recognized',
  ARRAY['part of me', 'a part', 'this part', 'protector', 'inner critic', 'young part']
FROM practice_worlds w WHERE w.code = 'parts_ifs'
ON CONFLICT (world_id, code) DO NOTHING;

INSERT INTO world_insight_types (world_id, code, display_name, description, detection_markers)
SELECT w.id, 'archetype_active', 'Archetype Active',
  'An archetypal pattern or energy was present',
  ARRAY['hero', 'shadow', 'mother', 'father', 'child', 'wise', 'trickster', 'archetype']
FROM practice_worlds w WHERE w.code = 'jungian'
ON CONFLICT (world_id, code) DO NOTHING;

-- Seed a few experiments
INSERT INTO world_experiments (world_id, code, title, description, instructions, what_to_notice, reflection_prompts, difficulty_level)
SELECT w.id, 'body_scan_invitation', 'Body Scan Invitation',
  'Invite the client to scan their body and notice what''s present',
  'Say something like: "Let''s pause for a moment. If you''re willing, close your eyes or soften your gaze, and just notice what''s happening in your body right now. Start at the top of your head and slowly scan down... What do you notice?"',
  'Watch for: changes in breathing, shifts in posture, facial expressions, moments of stillness or movement',
  ARRAY['What did you learn about what your client holds in their body?', 'How did slowing down change the session?', 'What might you explore further next time?'],
  'accessible'
FROM practice_worlds w WHERE w.code = 'somatic'
ON CONFLICT (world_id, code) DO NOTHING;

INSERT INTO world_experiments (world_id, code, title, description, instructions, what_to_notice, reflection_prompts, difficulty_level)
SELECT w.id, 'parts_mapping', 'Parts Mapping',
  'Help client identify and name the different parts involved in a dilemma',
  'When client describes inner conflict, ask: "It sounds like there might be different parts of you with different feelings about this. Can we slow down and name them? What does one part say? And what does another part say?"',
  'Watch for: client''s relationship to parts (curiosity vs criticism), how parts interact, which parts are loudest',
  ARRAY['Which parts seemed most prominent?', 'How did naming parts change the client''s relationship to their experience?', 'What might Self-leadership look like for this client?'],
  'intermediate'
FROM practice_worlds w WHERE w.code = 'parts_ifs'
ON CONFLICT (world_id, code) DO NOTHING;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_practitioner_worlds_practitioner ON practitioner_worlds(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_practitioner_worlds_enabled ON practitioner_worlds(practitioner_id) WHERE is_enabled = TRUE;
CREATE INDEX IF NOT EXISTS idx_session_worlds_session ON session_worlds(session_id);
CREATE INDEX IF NOT EXISTS idx_world_insight_types_world ON world_insight_types(world_id);
CREATE INDEX IF NOT EXISTS idx_world_experiments_world ON world_experiments(world_id);

-- Update timestamp triggers
DROP TRIGGER IF EXISTS practice_worlds_updated_at ON practice_worlds;
CREATE TRIGGER practice_worlds_updated_at
  BEFORE UPDATE ON practice_worlds
  FOR EACH ROW
  EXECUTE FUNCTION update_practice_session_timestamp();

DROP TRIGGER IF EXISTS practitioner_worlds_updated_at ON practitioner_worlds;
CREATE TRIGGER practitioner_worlds_updated_at
  BEFORE UPDATE ON practitioner_worlds
  FOR EACH ROW
  EXECUTE FUNCTION update_practice_session_timestamp();

-- Comments
COMMENT ON TABLE practice_worlds IS 'Pluggable interpretive lenses (modalities/frameworks) for multi-world practitioner support';
COMMENT ON TABLE practitioner_worlds IS 'Which worlds each practitioner has enabled and their proficiency';
COMMENT ON TABLE world_insight_types IS 'World-specific insight definitions with detection markers';
COMMENT ON TABLE world_experiments IS 'Micro-practice experiments suggested by each world';
COMMENT ON TABLE session_worlds IS 'Which worlds were active/detected in each session';
