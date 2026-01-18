-- ============================================
-- STELLIUM DEMO: Loralee's Astrology Practice
-- "See what's possible when MAIA knows your work"
-- ============================================

-- First, get or create Loralee's member ID
-- (In production, this would be her actual member ID)
DO $$
DECLARE
  loralee_id UUID;
BEGIN
  -- Check if demo practitioner exists
  SELECT id INTO loralee_id FROM members WHERE username = 'loralee';

  -- If not, create a demo record (you'd replace this with actual member lookup)
  IF loralee_id IS NULL THEN
    INSERT INTO members (id, username, name, email, passkey, onboarded)
    VALUES (
      'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      'loralee',
      'Loralee Starweaver',
      'loralee@stellium.demo',
      'STELLIUM-LORALEE',
      true
    )
    RETURNING id INTO loralee_id;
  END IF;

  -- ============================================
  -- LORALEE'S MAIA PERSONA
  -- ============================================
  INSERT INTO practitioner_personas (
    practitioner_id,
    persona_name,
    modality,
    voice_patterns,
    framework,
    boundaries,
    materials_indexed,
    books_referenced,
    training_transcripts,
    is_active
  ) VALUES (
    loralee_id,
    'Stellium',
    'astrology',
    '{
      "tone": "warm, poetic, grounded",
      "style": "archetypal language with practical grounding",
      "warmth_level": "warm",
      "formality": "balanced",
      "phrases": [
        "Let''s look at what the sky is holding for you",
        "This transit is inviting you to...",
        "The energy here is asking...",
        "I see a pattern emerging...",
        "Your chart is speaking to...",
        "There''s medicine in this placement"
      ],
      "avoids": [
        "will happen",
        "definitely",
        "must",
        "should",
        "you have to",
        "bad placement",
        "unfortunate"
      ]
    }'::jsonb,
    '{
      "primary": "evolutionary",
      "secondary": "archetypal",
      "authors": ["Steven Forrest", "Liz Greene", "Richard Tarnas", "Dane Rudhyar"],
      "traditions": ["Western tropical", "Placidus houses"],
      "specialties": ["natal interpretation", "transits", "synastry", "solar returns"],
      "approach": "Soul-centered astrology focused on growth and integration rather than prediction"
    }'::jsonb,
    '{
      "no_predictions": true,
      "no_diagnosis": true,
      "no_medical_advice": true,
      "escalate_crisis": true,
      "refer_to_professional": true,
      "custom_rules": [
        "Never claim to predict specific events or timing",
        "Frame all insights as potential energy, not fate",
        "Encourage client agency and choice always",
        "Honor the mystery - don''t over-explain",
        "Acknowledge when a topic is outside my scope",
        "Refer to therapist for trauma processing",
        "Integration is as important as insight"
      ]
    }'::jsonb,
    ARRAY['Loralee Voice Samples 2024', 'Session Transcripts Collection', 'Newsletter Archive'],
    ARRAY['The Inner Sky - Steven Forrest', 'Saturn: A New Look at an Old Devil - Liz Greene', 'Cosmos and Psyche - Richard Tarnas'],
    12,
    true
  )
  ON CONFLICT DO NOTHING;

  -- ============================================
  -- SAMPLE CLIENTS
  -- ============================================

  -- Client 1: Maya Chen - Long-term client, deep work
  INSERT INTO practitioner_clients (
    id,
    practitioner_id,
    name,
    preferred_name,
    email,
    pronouns,
    birth_date,
    birth_time,
    birth_location,
    birth_latitude,
    birth_longitude,
    birth_timezone,
    has_chart,
    intake_data,
    private_notes,
    themes,
    status,
    tags,
    first_session,
    last_session,
    total_sessions
  ) VALUES (
    'c1111111-1111-1111-1111-111111111111',
    loralee_id,
    'Maya Chen',
    'Maya',
    'maya.chen@example.com',
    'she/her',
    '1988-03-15',
    '14:30:00',
    'San Francisco, CA',
    37.7749,
    -122.4194,
    'America/Los_Angeles',
    true,
    '{
      "referral": "Friend recommendation",
      "goals": "Understand career transition, relationship patterns",
      "previous_astrology": "Some familiarity with sun/moon/rising",
      "therapy": "Currently working with a therapist"
    }'::jsonb,
    'Pisces Sun, Scorpio Moon, Cancer Rising. Deep water chart - very intuitive but can get overwhelmed. Saturn return completed 2018. Currently in Pluto square natal Sun - major transformation period. Has done a lot of inner work. Ready for next level.',
    ARRAY['career transition', 'relationship patterns', 'Saturn themes', 'creative expression', 'boundaries'],
    'active',
    ARRAY['long-term', 'deep-work', 'water-dominant'],
    '2022-06-15',
    '2026-01-10',
    18
  ),

  -- Client 2: James Rodriguez - New client, initial exploration
  (
    'c2222222-2222-2222-2222-222222222222',
    loralee_id,
    'James Rodriguez',
    'James',
    'j.rodriguez@example.com',
    'he/him',
    '1995-11-22',
    '08:15:00',
    'Austin, TX',
    30.2672,
    -97.7431,
    'America/Chicago',
    true,
    '{
      "referral": "Instagram",
      "goals": "New to astrology, curious about life direction",
      "previous_astrology": "Just knows sun sign",
      "therapy": "No"
    }'::jsonb,
    'Sagittarius Sun, Aries Moon, Capricorn Rising. Fire/earth blend - ambitious with wanderlust. Jupiter return coming up. Lots of energy but needs grounding. First reading - keep it accessible.',
    ARRAY['life direction', 'career', 'travel'],
    'active',
    ARRAY['new-client', 'fire-dominant'],
    '2025-12-01',
    '2025-12-01',
    1
  ),

  -- Client 3: Sarah Mitchell - Relationship focus
  (
    'c3333333-3333-3333-3333-333333333333',
    loralee_id,
    'Sarah Mitchell',
    'Sarah',
    'sarah.m@example.com',
    'she/her',
    '1990-07-04',
    '22:45:00',
    'Chicago, IL',
    41.8781,
    -87.6298,
    'America/Chicago',
    true,
    '{
      "referral": "Podcast interview",
      "goals": "Understand relationship patterns, preparing for marriage",
      "previous_astrology": "Regular readings for 5 years",
      "therapy": "Couples counseling"
    }'::jsonb,
    'Cancer Sun, Libra Moon, Scorpio Rising. Partnership-oriented but protective. Venus-Pluto aspect creates intensity in relationships. Getting married next year - did synastry with partner. Beautiful composite chart.',
    ARRAY['relationships', 'partnership', 'family', 'Venus themes', 'commitment'],
    'active',
    ARRAY['relationship-focus', 'engaged'],
    '2024-03-20',
    '2026-01-05',
    8
  ),

  -- Client 4: Alex Thompson - Business astrology
  (
    'c4444444-4444-4444-4444-444444444444',
    loralee_id,
    'Alex Thompson',
    'Alex',
    'alex@thompsonventures.com',
    'they/them',
    '1982-09-28',
    '06:00:00',
    'New York, NY',
    40.7128,
    -74.0060,
    'America/New_York',
    true,
    '{
      "referral": "Business colleague",
      "goals": "Electional astrology for business decisions, understand cycles",
      "previous_astrology": "Extensive - has worked with other astrologers",
      "therapy": "Executive coaching"
    }'::jsonb,
    'Libra Sun, Capricorn Moon, Virgo Rising. Earth-air blend - strategic and diplomatic. Very business-focused readings. Uses astrology practically for timing. MC conjunct Pluto - powerful career placement.',
    ARRAY['business timing', 'electional', 'career strategy', 'leadership'],
    'active',
    ARRAY['business', 'electional', 'executive'],
    '2023-08-10',
    '2025-12-15',
    12
  ),

  -- Client 5: River Jones - Spiritual focus, on waitlist
  (
    'c5555555-5555-5555-5555-555555555555',
    loralee_id,
    'River Jones',
    'River',
    'river.starseeker@example.com',
    'they/them',
    '1998-02-14',
    NULL,  -- Birth time unknown
    'Portland, OR',
    45.5152,
    -122.6784,
    'America/Los_Angeles',
    false,  -- No chart yet - needs birth time
    '{
      "referral": "Workshop attendee",
      "goals": "Deep spiritual understanding, past life themes",
      "previous_astrology": "Some, but wants to go deeper",
      "therapy": "Somatic therapy"
    }'::jsonb,
    'Aquarius Sun, birth time unknown - need to do rectification or work with solar chart. Very spiritually oriented. Met at the Evolutionary Astrology workshop. Waiting for them to confirm birth time with family.',
    ARRAY['spiritual development', 'past life', 'purpose'],
    'waitlist',
    ARRAY['needs-birth-time', 'spiritual'],
    NULL,
    NULL,
    0
  )
  ON CONFLICT DO NOTHING;

  -- ============================================
  -- SAMPLE SESSIONS
  -- ============================================

  -- Maya's recent session (completed)
  INSERT INTO practitioner_sessions (
    id,
    practitioner_id,
    client_id,
    session_type,
    modality,
    scheduled_at,
    duration_minutes,
    status,
    location_type,
    maia_prep,
    prep_notes,
    session_notes,
    themes,
    insights,
    fee,
    paid,
    completed_at
  ) VALUES (
    'a1111111-1111-1111-1111-111111111111',
    loralee_id,
    'c1111111-1111-1111-1111-111111111111',
    'Transit Reading',
    'astrology',
    '2026-01-10 10:00:00-08',
    90,
    'completed',
    'video',
    '{
      "summary": "Maya is in a significant Pluto transit period, with Pluto now exactly square her natal Sun. This is the peak of a transformation that began in 2024. Her recent sessions have focused on career transition and creative expression. The last session ended with her exploring what ''authentic success'' means to her.",
      "themes_to_watch": ["Pluto square Sun", "career transformation", "creative identity", "power reclamation"],
      "suggested_questions": [
        "How has your relationship to ambition shifted since we last spoke?",
        "What is dying that needs to die?",
        "Where are you feeling the call to be more visible?"
      ],
      "client_context": {
        "total_sessions": 17,
        "recent_themes": ["career transition", "creative expression", "boundaries"],
        "last_session_date": "2025-12-05"
      },
      "generated_at": "2026-01-09T15:30:00Z"
    }'::jsonb,
    'Review Pluto transit progress. She mentioned considering a big career move in our last session.',
    'Beautiful session. Maya came in with news that she''s been offered a leadership position at a new organization - exactly the kind of role we''ve been discussing as aligned with her chart. We looked at the timing and Saturn will be trining her MC when she''d start. Discussed the Pluto square Sun completion coming in March - good timing to step into new authority. She''s ready. Cried at the end - good tears, release tears.',
    ARRAY['Pluto transit', 'career decision', 'leadership', 'timing'],
    ARRAY['Ready to step into authority', 'Saturn trine MC supports new role', 'Pluto work nearing completion'],
    225.00,
    true,
    '2026-01-10 11:35:00-08'
  ),

  -- Sarah's session (completed, needs follow-up)
  (
    'a2222222-2222-2222-2222-222222222222',
    loralee_id,
    'c3333333-3333-3333-3333-333333333333',
    'Synastry Review',
    'astrology',
    '2026-01-05 14:00:00-08',
    75,
    'completed',
    'video',
    '{
      "summary": "Sarah and her partner Michael are preparing for their wedding in June. Previous synastry showed strong Venus-Mars connections and a beautiful composite Moon. This session is to review timing and discuss the composite chart more deeply.",
      "themes_to_watch": ["wedding timing", "composite chart", "partnership evolution"],
      "suggested_questions": [
        "How are you both navigating the wedding planning stress?",
        "What does the composite Moon in Taurus ask of you?",
        "Where do you feel most ''home'' with each other?"
      ],
      "client_context": {
        "total_sessions": 7,
        "recent_themes": ["relationships", "partnership", "commitment"],
        "last_session_date": "2025-10-15"
      },
      "generated_at": "2026-01-04T18:00:00Z"
    }'::jsonb,
    'Wedding timing review. She sent Michael''s updated birth time - re-run synastry.',
    'Reviewed wedding timing - June 21st looks excellent, Venus in Cancer, Moon in Libra that evening. Discussed the composite chart''s 7th house stellium - this is truly a partnership-focused union. She asked about children timing - looked at 5th house transits, 2027-2028 looks fertile. Send her the timing summary PDF.',
    ARRAY['wedding timing', 'synastry', 'composite chart', 'family planning'],
    ARRAY['June wedding timing excellent', '2027-2028 favorable for children', 'Strong partnership indicators confirmed'],
    200.00,
    true,
    '2026-01-05 15:20:00-08'
  ),

  -- James's upcoming session (scheduled)
  (
    'a3333333-3333-3333-3333-333333333333',
    loralee_id,
    'c2222222-2222-2222-2222-222222222222',
    'Follow-up Reading',
    'astrology',
    '2026-01-25 11:00:00-08',
    60,
    'scheduled',
    'video',
    NULL,  -- MAIA prep not generated yet
    'Second session - he had a lot of questions after the first reading. Focus on Jupiter return timing.',
    NULL,
    NULL,
    NULL,
    175.00,
    false,
    NULL
  ),

  -- Alex's upcoming session (confirmed)
  (
    'a4444444-4444-4444-4444-444444444444',
    loralee_id,
    'c4444444-4444-4444-4444-444444444444',
    'Electional Consultation',
    'astrology',
    '2026-01-20 09:00:00-08',
    60,
    'confirmed',
    'video',
    '{
      "summary": "Alex is considering a major business acquisition and wants to review timing options for the announcement and signing. Previous sessions have focused on their natural business cycles and optimal timing windows.",
      "themes_to_watch": ["electional timing", "business acquisition", "Mercury considerations"],
      "suggested_questions": [
        "What specific dates are you considering?",
        "Are there any non-negotiable constraints on timing?",
        "What does success look like for this acquisition?"
      ],
      "client_context": {
        "total_sessions": 11,
        "recent_themes": ["business timing", "electional", "career strategy"],
        "last_session_date": "2025-12-15"
      },
      "generated_at": "2026-01-18T10:00:00Z"
    }'::jsonb,
    'Electional for business acquisition. They mentioned Q1 target. Need to look at Mercury Rx periods.',
    NULL,
    NULL,
    NULL,
    250.00,
    false,
    NULL
  ),

  -- Maya's past session (for history)
  (
    'a5555555-5555-5555-5555-555555555555',
    loralee_id,
    'c1111111-1111-1111-1111-111111111111',
    'Transit Reading',
    'astrology',
    '2025-12-05 10:00:00-08',
    90,
    'completed',
    'video',
    NULL,
    'Monthly transit check-in. Pluto work continues.',
    'Discussed the ongoing Pluto square Sun transit. She''s in the thick of transformation - old career identity is dying. We explored what "success" means to her beyond external validation. She mentioned possibly leaving her current company. Homework: journal on "What would I do if I wasn''t afraid of being seen?"',
    ARRAY['Pluto transit', 'career identity', 'transformation', 'visibility'],
    ARRAY['Old identity dissolving', 'New definition of success emerging', 'Ready to be more visible'],
    225.00,
    true,
    '2025-12-05 11:35:00-08'
  )
  ON CONFLICT DO NOTHING;

  -- Mark Sarah's session as needing follow-up
  UPDATE practitioner_sessions
  SET follow_up_sent = false
  WHERE id = 'a2222222-2222-2222-2222-222222222222';

END $$;

-- ============================================
-- SAMPLE RESOURCES
-- ============================================
INSERT INTO practitioner_resources (
  practitioner_id,
  name,
  description,
  resource_type,
  url,
  visibility,
  tags
)
SELECT
  m.id,
  r.name,
  r.description,
  r.resource_type,
  r.url,
  r.visibility,
  r.tags
FROM members m
CROSS JOIN (VALUES
  ('Understanding Your Birth Chart', 'A beginner''s guide to reading your natal chart', 'pdf', '/resources/birth-chart-guide.pdf', 'all_clients', ARRAY['beginner', 'natal']),
  ('Transit Tracking Template', 'Journaling template for tracking major transits', 'pdf', '/resources/transit-journal.pdf', 'all_clients', ARRAY['transits', 'journaling']),
  ('Recommended Reading List', 'My favorite astrology books for deeper study', 'document', '/resources/reading-list.pdf', 'all_clients', ARRAY['books', 'study']),
  ('Session Recording: Evolutionary Astrology Intro', 'Recording from my intro workshop', 'video', 'https://vimeo.com/example', 'all_clients', ARRAY['workshop', 'evolutionary'])
) AS r(name, description, resource_type, url, visibility, tags)
WHERE m.username = 'loralee'
ON CONFLICT DO NOTHING;

-- ============================================
-- VERIFICATION
-- ============================================
DO $$
DECLARE
  client_count INT;
  session_count INT;
  persona_count INT;
BEGIN
  SELECT COUNT(*) INTO client_count FROM practitioner_clients
  WHERE practitioner_id = (SELECT id FROM members WHERE username = 'loralee');

  SELECT COUNT(*) INTO session_count FROM practitioner_sessions
  WHERE practitioner_id = (SELECT id FROM members WHERE username = 'loralee');

  SELECT COUNT(*) INTO persona_count FROM practitioner_personas
  WHERE practitioner_id = (SELECT id FROM members WHERE username = 'loralee');

  RAISE NOTICE '';
  RAISE NOTICE '══════════════════════════════════════════';
  RAISE NOTICE 'STELLIUM DEMO SEEDED: Loralee''s Practice';
  RAISE NOTICE '══════════════════════════════════════════';
  RAISE NOTICE 'Clients: %', client_count;
  RAISE NOTICE 'Sessions: %', session_count;
  RAISE NOTICE 'Persona configured: %', CASE WHEN persona_count > 0 THEN 'Yes' ELSE 'No' END;
  RAISE NOTICE '';
  RAISE NOTICE '"Not software. A sanctuary."';
  RAISE NOTICE '══════════════════════════════════════════';
END $$;
