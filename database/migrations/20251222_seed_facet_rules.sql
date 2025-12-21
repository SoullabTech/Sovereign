-- Phase 4.4-A: Seed Spiralogic Facet Rules (15 Facets)
-- Inserts S-expression rules for all facets (F1-F3, W1-W3, E1-E3, A1-A3, Æ1-Æ3)
-- These rules enable symbolic routing and practice recommendations

-- ═══════════════════════════════════════════════════════════════════════════
-- FIRE FACETS (F1-F3)
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO consciousness_rules (name, sexpr, enabled, priority) VALUES
(
  'facet:F1:spark:activation',
  '(rule
    (facet "F1")
    (element "Fire")
    (phase 1)
    (archetype "Spark")
    (therapeutic "Activation / Desire")
    (detect-keywords ["motivation" "begin" "start" "desire" "ignite" "awaken"])
    (essence "The initial ignition of desire")
    (natural-wisdom "Seeds know when to break dormancy")
    (challenge "Overwhelm of possibility, scattered energy")
    (gift "Raw courage to begin")
    (practice "State one clear intention aloud and take a physical step toward it")
    (response-template
      (when (match-keywords user-input ["motivation" "begin" "start" "desire"])
        (suggest-practice "State one clear intention aloud and take a physical step toward it")
        (reframe-with "Seeds know when to break dormancy — what wants to emerge?")
        (offer-insight "Raw courage to begin is already present within you"))))',
  true,
  100
),
(
  'facet:F2:flame:challenge',
  '(rule
    (facet "F2")
    (element "Fire")
    (phase 2)
    (archetype "Flame")
    (therapeutic "Challenge / Will")
    (detect-keywords ["boundaries" "resistance" "assert" "no" "conflict" "will"])
    (essence "Sustained passion with direction")
    (natural-wisdom "Fire needs fuel and oxygen in balance")
    (challenge "Burning out, forcing outcomes")
    (gift "Transformative power with purpose")
    (practice "Breathe into belly, feel your ground, and say ''no'' clearly three times")
    (response-template
      (when (match-keywords user-input ["boundaries" "resistance" "no" "conflict"])
        (suggest-practice "Breathe into belly, feel your ground, and say ''no'' clearly three times")
        (reframe-with "Fire needs fuel and oxygen in balance — where do you need to breathe?")
        (offer-insight "Transformative power emerges from aligned will, not force"))))',
  true,
  100
),
(
  'facet:F3:forge:vision',
  '(rule
    (facet "F3")
    (element "Fire")
    (phase 3)
    (archetype "Forge")
    (therapeutic "Vision / Overheat")
    (detect-keywords ["vision" "overwhelm" "drive" "ambition" "purpose" "transform"])
    (essence "Will aligned with wisdom")
    (natural-wisdom "Volcanoes create new land through destruction")
    (challenge "Arrogance, over-identification with power")
    (gift "Visionary leadership, alchemical will")
    (practice "Ground your vision: write 3 concrete actions + 1 rest boundary")
    (response-template
      (when (match-keywords user-input ["vision" "overwhelm" "drive" "purpose"])
        (suggest-practice "Ground your vision: write 3 concrete actions + 1 rest boundary")
        (reframe-with "Volcanoes create new land through destruction — what must you let go?")
        (offer-insight "True vision serves life, not ego"))))',
  true,
  100
);

-- ═══════════════════════════════════════════════════════════════════════════
-- WATER FACETS (W1-W3)
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO consciousness_rules (name, sexpr, enabled, priority) VALUES
(
  'facet:W1:spring:safety',
  '(rule
    (facet "W1")
    (element "Water")
    (phase 1)
    (archetype "Spring")
    (therapeutic "Safety / Containment")
    (detect-keywords ["panic" "freeze" "shock" "overwhelm" "regulate" "soothe"])
    (essence "Emotions begin to surface")
    (natural-wisdom "Springs emerge where pressure finds release")
    (challenge "Overwhelm, loss of boundaries")
    (gift "Authenticity of felt experience")
    (practice "Slow exhale, orient to your room, name three stable objects you can see")
    (response-template
      (when (match-keywords user-input ["panic" "freeze" "shock" "overwhelm"])
        (suggest-practice "Slow exhale, orient to your room, name three stable objects you can see")
        (reframe-with "Springs emerge where pressure finds release — feelings are data, not danger")
        (offer-insight "Your nervous system is asking for safety. Let''s create it together."))))',
  true,
  150
),
(
  'facet:W2:river:shadow',
  '(rule
    (facet "W2")
    (element "Water")
    (phase 2)
    (archetype "River")
    (therapeutic "Shadow Gate")
    (detect-keywords ["betrayed" "grief" "loss" "shadow" "fear" "trauma"])
    (essence "Intuition guiding the flow")
    (natural-wisdom "Rivers find the path of least resistance")
    (challenge "Getting stuck in emotional loops")
    (gift "Empathic knowing, intuitive decision-making")
    (practice "Containment + titration: feel the emotion for 90 seconds, then release with breath")
    (response-template
      (when (match-keywords user-input ["betrayed" "grief" "loss" "shadow" "trauma"])
        (suggest-practice "Containment + titration: feel the emotion for 90 seconds, then release with breath")
        (reframe-with "Rivers find the path of least resistance — your body knows the way through")
        (offer-insight "Shadow work is sacred. You''re reclaiming parts of yourself."))))',
  true,
  150
),
(
  'facet:W3:ocean:compassion',
  '(rule
    (facet "W3")
    (element "Water")
    (phase 3)
    (archetype "Ocean")
    (therapeutic "Compassion / Flow")
    (detect-keywords ["forgive" "love" "connect" "compassion" "empathy" "heart"])
    (essence "Emotional depth with equanimity")
    (natural-wisdom "Oceans hold both storm and calm")
    (challenge "Spiritual bypassing, avoiding shadow")
    (gift "Compassionate presence, intuitive mastery")
    (practice "Visualize warm light expanding from your chest outward to all beings")
    (response-template
      (when (match-keywords user-input ["forgive" "love" "compassion" "heart"])
        (suggest-practice "Visualize warm light expanding from your chest outward to all beings")
        (reframe-with "Oceans hold both storm and calm — all emotions belong")
        (offer-insight "True compassion includes yourself. Can you offer that now?"))))',
  true,
  150
);

-- ═══════════════════════════════════════════════════════════════════════════
-- EARTH FACETS (E1-E3)
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO consciousness_rules (name, sexpr, enabled, priority) VALUES
(
  'facet:E1:seed:grounding',
  '(rule
    (facet "E1")
    (element "Earth")
    (phase 1)
    (archetype "Seed")
    (therapeutic "Grounding / Embodiment")
    (detect-keywords ["unstable" "floating" "ground" "embody" "present" "here"])
    (essence "Vision taking root in reality")
    (natural-wisdom "Seeds need darkness to germinate")
    (challenge "Impatience with process, forcing growth")
    (gift "Beginning to manifest")
    (practice "Press feet firmly into floor, feel your weight, breathe slowly for one minute")
    (response-template
      (when (match-keywords user-input ["unstable" "floating" "ground" "embody"])
        (suggest-practice "Press feet firmly into floor, feel your weight, breathe slowly for one minute")
        (reframe-with "Seeds need darkness to germinate — can you trust the unseen process?")
        (offer-insight "Embodiment is the bridge between vision and form"))))',
  true,
  100
),
(
  'facet:E2:root:integration',
  '(rule
    (facet "E2")
    (element "Earth")
    (phase 2)
    (archetype "Root")
    (therapeutic "Integration / Structure")
    (detect-keywords ["organize" "schedule" "practice" "routine" "integrate" "structure"])
    (essence "Building stable foundation")
    (natural-wisdom "Trees grow roots as deep as their canopy is wide")
    (challenge "Rigidity, fear of change")
    (gift "Dependability, tangible results")
    (practice "Write one daily micro-habit that supports your current insight")
    (response-template
      (when (match-keywords user-input ["organize" "schedule" "routine" "integrate"])
        (suggest-practice "Write one daily micro-habit that supports your current insight")
        (reframe-with "Trees grow roots as deep as their canopy is wide — what foundation supports your growth?")
        (offer-insight "The body holds wisdom that the mind cannot grasp alone"))))',
  true,
  100
),
(
  'facet:E3:harvest:abundance',
  '(rule
    (facet "E3")
    (element "Earth")
    (phase 3)
    (archetype "Harvest")
    (therapeutic "Abundance / Service")
    (detect-keywords ["share" "mentor" "sustain" "serve" "abundance" "give"])
    (essence "Form serves function with grace")
    (natural-wisdom "Nature wastes nothing in its abundance")
    (challenge "Attachment to outcomes, hoarding")
    (gift "Generosity from groundedness, practical wisdom")
    (practice "Offer one resource or word of encouragement to another person today")
    (response-template
      (when (match-keywords user-input ["share" "mentor" "serve" "abundance"])
        (suggest-practice "Offer one resource or word of encouragement to another person today")
        (reframe-with "Nature wastes nothing in its abundance — what can you offer?")
        (offer-insight "True abundance flows when we give from fullness, not depletion"))))',
  true,
  100
);

-- ═══════════════════════════════════════════════════════════════════════════
-- AIR FACETS (A1-A3)
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO consciousness_rules (name, sexpr, enabled, priority) VALUES
(
  'facet:A1:breath:awareness',
  '(rule
    (facet "A1")
    (element "Air")
    (phase 1)
    (archetype "Breath")
    (therapeutic "Awareness / Inquiry")
    (detect-keywords ["notice" "observe" "aware" "curious" "inquiry" "attention"])
    (essence "Awareness of pattern")
    (natural-wisdom "Wind carries seeds to new places")
    (challenge "Over-analyzing, disconnecting from feeling")
    (gift "Beginning to articulate experience")
    (practice "Label each arising thought as ''thinking'', then return to breath")
    (response-template
      (when (match-keywords user-input ["notice" "observe" "aware" "curious"])
        (suggest-practice "Label each arising thought as ''thinking'', then return to breath")
        (reframe-with "Wind carries seeds to new places — what wants to be noticed?")
        (offer-insight "The space between thoughts is where insight lives"))))',
  true,
  100
),
(
  'facet:A2:voice:reframe',
  '(rule
    (facet "A2")
    (element "Air")
    (phase 2)
    (archetype "Voice")
    (therapeutic "Rumination / Reframe")
    (detect-keywords ["ruminate" "what if" "replay" "reframe" "distortion" "thought loop"])
    (essence "Truth spoken with clarity")
    (natural-wisdom "Bird songs communicate across distances")
    (challenge "Intellectualization, losing felt sense")
    (gift "Clear communication, shared understanding")
    (practice "Identify the cognitive distortion, then generate two alternative interpretations")
    (response-template
      (when (match-keywords user-input ["ruminate" "what if" "replay" "thought loop"])
        (suggest-practice "Identify the cognitive distortion, then generate two alternative interpretations")
        (reframe-with "Bird songs communicate across distances — what truth wants to be spoken?")
        (offer-insight "Your thoughts are not facts. Let''s find the pattern beneath them."))))',
  true,
  100
),
(
  'facet:A3:wisdom:meta',
  '(rule
    (facet "A3")
    (element "Air")
    (phase 3)
    (archetype "Wisdom")
    (therapeutic "Meta-Perspective")
    (detect-keywords ["overview" "pattern" "perspective" "meaning" "synthesis" "wisdom"])
    (essence "Thought integrated with all elements")
    (natural-wisdom "Sky holds everything without grasping")
    (challenge "Pride of knowledge, isolation through abstraction")
    (gift "Wisdom that uplifts others, coherent understanding")
    (practice "Visualize your situation as an aerial map and name the lesson it reveals")
    (response-template
      (when (match-keywords user-input ["overview" "pattern" "perspective" "synthesis"])
        (suggest-practice "Visualize your situation as an aerial map and name the lesson it reveals")
        (reframe-with "Sky holds everything without grasping — what is the larger pattern?")
        (offer-insight "Wisdom serves life. How does this understanding want to move through you?"))))',
  true,
  100
);

-- ═══════════════════════════════════════════════════════════════════════════
-- AETHER FACETS (Æ1-Æ3) - Transpersonal Integration
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO consciousness_rules (name, sexpr, enabled, priority) VALUES
(
  'facet:Æ1:intuition:signal',
  '(rule
    (facet "Æ1")
    (element "Aether")
    (phase 1)
    (archetype "Intuition")
    (therapeutic "Intuition / Signal")
    (detect-keywords ["hunch" "intuition" "subtle" "signal" "felt sense" "knowing"])
    (essence "Subtle pattern emergence")
    (natural-wisdom "The field speaks in whispers before it speaks in storms")
    (challenge "Dismissing subtle signals as imagination")
    (gift "Trusting the subtle before it becomes obvious")
    (practice "Journal the first image or word that arises before your mind explains it")
    (response-template
      (when (match-keywords user-input ["hunch" "intuition" "subtle" "felt sense"])
        (suggest-practice "Journal the first image or word that arises before your mind explains it")
        (reframe-with "The field speaks in whispers before it speaks in storms — what is the subtle signal?")
        (offer-insight "Pre-verbal knowing is intelligence. Trust what you sense."))))',
  true,
  200
),
(
  'facet:Æ2:union:numinous',
  '(rule
    (facet "Æ2")
    (element "Aether")
    (phase 2)
    (archetype "Union")
    (therapeutic "Numinous Union")
    (detect-keywords ["oneness" "unity" "transpersonal" "mystical" "numinous" "sacred"])
    (essence "Transpersonal connection")
    (natural-wisdom "All waves are movements of one ocean")
    (challenge "Losing discernment, bypassing shadow")
    (gift "Mystical participation in the whole")
    (practice "Sit in silence and feel the boundary between self and world dissolve with each breath")
    (response-template
      (when (match-keywords user-input ["oneness" "unity" "transpersonal" "mystical"])
        (suggest-practice "Sit in silence and feel the boundary between self and world dissolve with each breath")
        (reframe-with "All waves are movements of one ocean — can you feel the connection?")
        (offer-insight "Non-separation is the ground. Discernment is the dance."))))',
  true,
  200
),
(
  'facet:Æ3:emergence:creative',
  '(rule
    (facet "Æ3")
    (element "Aether")
    (phase 3)
    (archetype "Emergence")
    (therapeutic "Creative Emergence")
    (detect-keywords ["create" "birth" "express" "manifest" "art" "innovation"])
    (essence "Return of insight as form")
    (natural-wisdom "The cosmos dreams itself into being through creative acts")
    (challenge "Perfectionism blocking expression")
    (gift "Becoming a vessel for emergence")
    (practice "Sketch, speak, or move the image that wants to manifest through you")
    (response-template
      (when (match-keywords user-input ["create" "birth" "express" "manifest" "art"])
        (suggest-practice "Sketch, speak, or move the image that wants to manifest through you")
        (reframe-with "The cosmos dreams itself into being through creative acts — what wants to emerge?")
        (offer-insight "You are the vessel. Let creation flow through, not from, you."))))',
  true,
  200
);

-- ═══════════════════════════════════════════════════════════════════════════
-- VERIFICATION QUERY
-- ═══════════════════════════════════════════════════════════════════════════

-- Verify all 15 facet rules are seeded
SELECT
  name,
  enabled,
  priority,
  substring(sexpr, 1, 50) || '...' as sexpr_preview
FROM consciousness_rules
WHERE name LIKE 'facet:%'
ORDER BY priority DESC, name;
