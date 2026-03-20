-- ============================================
-- WISDOM FIELDS — Pilot Triad Seed
-- Idempotent: safe to re-run on any deploy.
-- Conflict keys:
--   wisdom_fields            ON CONFLICT (slug)
--   wisdom_field_core_ideas  ON CONFLICT (field_id, concept)
--   wisdom_field_works       ON CONFLICT (field_id, title)
--
-- To apply:
--   docker exec -i maia-postgres psql -U soullab maia_consciousness \
--     < database/seeds/wisdom_fields_pilot.sql
-- ============================================

-- ── Seed author (first member by join date) ──────────────────────

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM members LIMIT 1) THEN
    RAISE EXCEPTION 'No members exist — create at least one member before seeding fields.';
  END IF;
END $$;


-- ════════════════════════════════════════════════════════════════
-- 1. CARL JUNG — wisdom_keeper / ai_posture: contextual
-- ════════════════════════════════════════════════════════════════

WITH field AS (
  INSERT INTO wisdom_fields (
    slug, field_type, ai_posture, master_name, master_dates, master_domain,
    orientation, ai_posture_note, voice_profile, visibility, created_by
  )
  SELECT
    'carl-jung',
    'wisdom_keeper',
    'contextual',
    'Carl Jung',
    '1875–1961',
    'Analytical Psychology · Alchemy · Myth · Symbol',
    'Jung opened a map of the psyche that took seriously what modernity had discarded — dream, symbol, shadow, and the deep patterns that move beneath conscious life. His work does not offer answers so much as a way of asking better questions. This field gathers people who are working with his ideas — not as an intellectual exercise, but as a living practice. The inner work axis: confronting what we have split off, and integrating it toward wholeness.',
    'MAIA can explore this work alongside you. She does not speak as Jung — she is a thinking companion in the presence of his ideas.',
    'symbolic_depth_psychology',
    'open',
    id
  FROM members ORDER BY created_at ASC LIMIT 1
  ON CONFLICT (slug) DO UPDATE SET
    master_name     = EXCLUDED.master_name,
    master_dates    = EXCLUDED.master_dates,
    master_domain   = EXCLUDED.master_domain,
    orientation     = EXCLUDED.orientation,
    ai_posture_note = EXCLUDED.ai_posture_note,
    voice_profile   = EXCLUDED.voice_profile,
    updated_at      = NOW()
  RETURNING id
),
steward AS (
  INSERT INTO wisdom_field_memberships (field_id, member_id, role, status)
  SELECT field.id, m.id, 'steward', 'active'
  FROM field, (SELECT id FROM members ORDER BY created_at ASC LIMIT 1) m
  ON CONFLICT (field_id, member_id) DO NOTHING
),
ideas AS (
  INSERT INTO wisdom_field_core_ideas
    (field_id, concept, one_line, body, related_concepts, sort_order, added_by)
  SELECT
    field.id,
    v.concept, v.one_line, v.body, v.related_concepts, v.sort_order,
    m.id
  FROM field,
       (SELECT id FROM members ORDER BY created_at ASC LIMIT 1) m,
       (VALUES
         ('Shadow',
          'The shadow is what the ego refuses to see — not evil, but unacknowledged.',
          'The shadow contains everything the persona rejects: weaknesses, contradictions, capacities that do not fit the self-image we present. It is not inherently dark — it is unlived. What we cannot see in ourselves, we project onto others. The shadow encountered within reduces what we condemn in the world outside.',
          ARRAY['Projection', 'Persona', 'Individuation']::TEXT[],
          10),
         ('Individuation',
          'Individuation is a lifelong integration of what has been split off from conscious life.',
          'Individuation is the movement toward wholeness — not by expanding the ego but by relating consciously to the larger totality of the psyche, including what has been repressed, projected, or undeveloped. It is not a destination but an orientation. It does not produce a better person in the conventional sense; it produces a more whole one.',
          ARRAY['Shadow', 'Self', 'Anima/Animus']::TEXT[],
          20),
         ('Symbol',
          'The psyche speaks in symbols, not concepts — image before interpretation.',
          'A symbol is not a sign that stands for a known thing. It points toward something not yet fully speakable in rational language. Dreams, myths, art, and symptoms all carry symbolic weight. Premature interpretation kills the symbol by reducing it to something the ego already understands. The first movement with any symbol is dwelling — allowing it to resonate before explaining it.',
          ARRAY['Dream', 'Image', 'Archetype']::TEXT[],
          30),
         ('Self',
          'The Self is not the ego — it is the totality the ego serves.',
          'The ego is the center of conscious awareness. The Self is the organizing principle of the whole psyche — conscious and unconscious together. Individuation is the ego coming into right relationship with the Self: not dissolved by it, not dominant over it, but in dialogue with it.',
          ARRAY['Ego', 'Individuation', 'Archetype']::TEXT[],
          40),
         ('Projection',
          'What we cannot see in ourselves, we encounter in others.',
          'Projection is the mechanism by which unconscious contents are experienced as belonging to the external world. The strongest emotional reactions — both attraction and repulsion — often contain projected material. Withdrawing projections is one of the central psychological tasks: reclaiming what belongs to us, and seeing others as they actually are.',
          ARRAY['Shadow', 'Anima/Animus', 'Relationship']::TEXT[],
          50)
       ) AS v(concept, one_line, body, related_concepts, sort_order)
  ON CONFLICT (field_id, concept) DO UPDATE SET
    one_line         = EXCLUDED.one_line,
    body             = EXCLUDED.body,
    related_concepts = EXCLUDED.related_concepts,
    sort_order       = EXCLUDED.sort_order,
    updated_at       = NOW()
)
INSERT INTO wisdom_field_works
  (field_id, title, year, work_type, description, external_url, entry_point, added_by)
SELECT field.id, v.title, v.year, v.work_type, v.description, v.external_url, v.entry_point, m.id
FROM field,
     (SELECT id FROM members ORDER BY created_at ASC LIMIT 1) m,
     (VALUES
       ('Man and His Symbols', '1964', 'book',
        'The only book Jung wrote for a general audience, completed shortly before his death. A visually rich introduction to symbol and dream in psychological life. Ideal first contact — accessible without being superficial.',
        'https://www.amazon.com/Man-His-Symbols-Carl-Jung/dp/0440351839',
        TRUE),
       ('Modern Man in Search of a Soul', '1933', 'book',
        'Essays on psychotherapy, dreams, and the spiritual crisis of modern life. More direct than his technical works, and still surprisingly current. Good parallel reading alongside Man and His Symbols.',
        NULL,
        FALSE),
       ('Memories, Dreams, Reflections', '1962', 'book',
        'Jung''s autobiography — personal, mythic, and strange. Not a system but a life. Read this when the concepts feel abstract; it returns them to lived soil.',
        NULL,
        FALSE),
       ('The Archetypes and the Collective Unconscious', '1959', 'book',
        'Part of the Collected Works (Vol. 9i). The technical foundation for archetypes, anima/animus, shadow, and the Self. Dense but rewarding. Better approached after the introductory texts.',
        NULL,
        FALSE)
     ) AS v(title, year, work_type, description, external_url, entry_point)
ON CONFLICT (field_id, title) DO UPDATE SET
  year         = EXCLUDED.year,
  description  = EXCLUDED.description,
  external_url = EXCLUDED.external_url,
  entry_point  = EXCLUDED.entry_point;


-- ════════════════════════════════════════════════════════════════
-- 2. IAIN McGILCHRIST — masters_field / ai_posture: none
-- ════════════════════════════════════════════════════════════════

WITH field AS (
  INSERT INTO wisdom_fields (
    slug, field_type, ai_posture, master_name, master_dates, master_domain,
    orientation, ai_posture_note, voice_profile, visibility, created_by
  )
  SELECT
    'iain-mcgilchrist',
    'masters_field',
    'none',
    'Iain McGilchrist',
    'b. 1953',
    'Hemispheric Mind · Attention · Meaning · Philosophy of Mind',
    'McGilchrist''s work is a sustained argument that how we attend to the world determines what world we inhabit. His insight — that the left hemisphere''s drive to represent and control has come to dominate at civilization scale — reframes almost every crisis we face: ecological, psychological, political, and spiritual. This is the epistemology axis: the study of attention itself as the ground of reality.',
    'MAIA is quiet here. This field belongs to the community and to McGilchrist''s work. The intelligence arises through your encounter with his ideas, not through AI mediation.',
    'hemispheric_philosophical_precision',
    'open',
    id
  FROM members ORDER BY created_at ASC LIMIT 1
  ON CONFLICT (slug) DO UPDATE SET
    master_name     = EXCLUDED.master_name,
    master_dates    = EXCLUDED.master_dates,
    master_domain   = EXCLUDED.master_domain,
    orientation     = EXCLUDED.orientation,
    ai_posture_note = EXCLUDED.ai_posture_note,
    voice_profile   = EXCLUDED.voice_profile,
    updated_at      = NOW()
  RETURNING id
),
steward AS (
  INSERT INTO wisdom_field_memberships (field_id, member_id, role, status)
  SELECT field.id, m.id, 'steward', 'active'
  FROM field, (SELECT id FROM members ORDER BY created_at ASC LIMIT 1) m
  ON CONFLICT (field_id, member_id) DO NOTHING
),
ideas AS (
  INSERT INTO wisdom_field_core_ideas
    (field_id, concept, one_line, body, related_concepts, sort_order, added_by)
  SELECT field.id, v.concept, v.one_line, v.body, v.related_concepts, v.sort_order, m.id
  FROM field,
       (SELECT id FROM members ORDER BY created_at ASC LIMIT 1) m,
       (VALUES
         ('The Divided Brain',
          'The left and right hemispheres attend to the world in fundamentally different ways — not different tasks, but different relationships with reality.',
          'The hemispheres are not specialized for language vs. spatial reasoning. They attend differently: the left narrows, isolates, represents, controls; the right holds the broader, more integrated, more alive picture. Both are necessary — but they are not equal. The right must be the master; the left the emissary. When this relationship inverts, reality itself is impoverished.',
          ARRAY['Attention', 'The Emissary and the Master']::TEXT[], 10),
         ('The Emissary and the Master',
          'The left hemisphere — precise but partial — has usurped the broader awareness of the right.',
          'The Master (right hemisphere) sends the Emissary (left) to handle tasks requiring focused, analytical attention. The Emissary grows confident, and eventually believes its map is the territory. In our civilization, the Emissary has taken over. The result is a world increasingly coherent by its own internal logic, and increasingly impoverished in everything that actually matters.',
          ARRAY['The Divided Brain', 'Attention as Ontology', 'Re-enchantment']::TEXT[], 20),
         ('Attention as Ontology',
          'How we attend to the world determines what world we inhabit.',
          'Attention is not passive reception — it is constitutive. What we attend to comes into being for us; what we withdraw attention from recedes. Narrow, instrumental attention produces a narrow, instrumental world. The quality of attention is not merely practical — it is metaphysical.',
          ARRAY['The Divided Brain', 'Participation', 'Metaphor']::TEXT[], 30),
         ('Participation',
          'The world is not a collection of objects to be grasped — it is a living whole we participate in.',
          'The primary relationship between self and world is not subject-object but participatory. We are embedded in reality, not standing over against it. The left hemisphere''s drive to represent and manipulate breaks this participation — it produces objects out of what was previously flowing, living, and relational.',
          ARRAY['Attention as Ontology', 'Re-enchantment']::TEXT[], 40),
         ('Re-enchantment',
          'Re-enchantment is not a retreat into superstition — it is accurate perception of what is actually there.',
          'McGilchrist is not arguing for irrationalism. He is arguing that the disenchanted world — pure mechanism, pure quantity, pure utility — is a product of pathologically narrow attention. Re-enchantment means attending fully enough to encounter the world as it actually presents: alive, meaningful, irreducibly particular, shot through with significance.',
          ARRAY['The Divided Brain', 'Participation', 'Attention as Ontology']::TEXT[], 50)
       ) AS v(concept, one_line, body, related_concepts, sort_order)
  ON CONFLICT (field_id, concept) DO UPDATE SET
    one_line         = EXCLUDED.one_line,
    body             = EXCLUDED.body,
    related_concepts = EXCLUDED.related_concepts,
    sort_order       = EXCLUDED.sort_order,
    updated_at       = NOW()
)
INSERT INTO wisdom_field_works
  (field_id, title, year, work_type, description, external_url, entry_point, added_by)
SELECT field.id, v.title, v.year, v.work_type, v.description, v.external_url, v.entry_point, m.id
FROM field,
     (SELECT id FROM members ORDER BY created_at ASC LIMIT 1) m,
     (VALUES
       ('The Divided Brain (RSA Animate lecture)', '2011', 'lecture',
        'The 11-minute RSA Animate adaptation of his thesis. Visually compelling, tightly argued, genuinely surprising. Watch this first — the best possible entry point to his work.',
        'https://www.youtube.com/watch?v=dFs9WO2B8uI',
        TRUE),
       ('The Master and His Emissary', '2009', 'book',
        'The foundational text. Part One grounds the hemispheric thesis in neuroscience; Part Two traces its consequences through Western cultural history from ancient Greece to modernity. Dense, rigorous, extraordinary.',
        NULL,
        FALSE),
       ('The Matter with Things', '2021', 'book',
        'Two volumes extending the hemispheric analysis into metaphysics, consciousness, and the nature of reality. McGilchrist''s most complete statement. Begin with The Master and His Emissary.',
        NULL,
        FALSE)
     ) AS v(title, year, work_type, description, external_url, entry_point)
ON CONFLICT (field_id, title) DO UPDATE SET
  year         = EXCLUDED.year,
  description  = EXCLUDED.description,
  external_url = EXCLUDED.external_url,
  entry_point  = EXCLUDED.entry_point;


-- ════════════════════════════════════════════════════════════════
-- 3. JAMES HILLMAN — wisdom_keeper / ai_posture: contextual
-- ════════════════════════════════════════════════════════════════

WITH field AS (
  INSERT INTO wisdom_fields (
    slug, field_type, ai_posture, master_name, master_dates, master_domain,
    orientation, ai_posture_note, voice_profile, visibility, created_by
  )
  SELECT
    'james-hillman',
    'wisdom_keeper',
    'contextual',
    'James Hillman',
    '1926–2011',
    'Archetypal Psychology · Soul · Image · Myth · Aesthetic Response',
    'Hillman broke with the Jungian tradition not to abandon it but to radicalize it — pushing psychological thinking further into the imaginal, the polytheistic, the aesthetic. Where Jung sought individuation through integration, Hillman sought soul through multiplicity. His work refuses to reduce: symptoms are not problems, images are not symbols of something else, the psyche is not on its way to anywhere. This is the imaginal axis: learning to think in images rather than concepts.',
    'MAIA can explore this work alongside you. She does not speak as Hillman — she attempts the imaginal movement alongside you rather than explaining it from outside.',
    'archetypal_imaginal_poetic',
    'open',
    id
  FROM members ORDER BY created_at ASC LIMIT 1
  ON CONFLICT (slug) DO UPDATE SET
    master_name     = EXCLUDED.master_name,
    master_dates    = EXCLUDED.master_dates,
    master_domain   = EXCLUDED.master_domain,
    orientation     = EXCLUDED.orientation,
    ai_posture_note = EXCLUDED.ai_posture_note,
    voice_profile   = EXCLUDED.voice_profile,
    updated_at      = NOW()
  RETURNING id
),
steward AS (
  INSERT INTO wisdom_field_memberships (field_id, member_id, role, status)
  SELECT field.id, m.id, 'steward', 'active'
  FROM field, (SELECT id FROM members ORDER BY created_at ASC LIMIT 1) m
  ON CONFLICT (field_id, member_id) DO NOTHING
),
ideas AS (
  INSERT INTO wisdom_field_core_ideas
    (field_id, concept, one_line, body, related_concepts, sort_order, added_by)
  SELECT field.id, v.concept, v.one_line, v.body, v.related_concepts, v.sort_order, m.id
  FROM field,
       (SELECT id FROM members ORDER BY created_at ASC LIMIT 1) m,
       (VALUES
         ('Soul',
          'Soul is not a substance or a destination — it is a quality of depth in experience.',
          'Hillman uses "soul" not theologically but psychologically and poetically: as the capacity for interiority, reflection, metaphor, and meaning. Soul is what makes experience resonate rather than merely occur. It is found not by seeking it directly but by attending to images, to what moves us, to what we cannot explain away.',
          ARRAY['Image', 'Depth', 'Pathologizing']::TEXT[], 10),
         ('Image',
          'Every image is autonomous — it comes to us, not from us.',
          'Image is primary: not a representation of something real, but itself real. Dreams, fantasies, symptoms, and artworks present images that carry their own authority. The mistake is to immediately interpret — to convert the image into a concept the ego already understands. The prior movement is to let the image be, to follow it, to allow it to deepen.',
          ARRAY['Soul', 'Archetypal Psychology', 'Dream']::TEXT[], 20),
         ('Pathologizing',
          'Symptoms are not failures of the psyche — they are the psyche speaking in its necessity.',
          'Hillman coined "pathologizing" to describe the psyche''s drive to produce suffering, limitation, and disorder. This is not a problem to be fixed — it is the soul''s way of forcing depth. The question is not "how do I get rid of this?" but "what is this asking of me?" Suffering that is heard transforms differently than suffering that is merely treated.',
          ARRAY['Soul', 'Image', 'Depth Psychology']::TEXT[], 30),
         ('Archetypal Psychology',
          'The psyche is inherently polytheistic — many centers, many voices, not one integrating Self.',
          'Hillman diverged from Jung: where Jung posited the Self as the central archetype, Hillman argued for a polytheistic psychology that honors multiplicity without forcing hierarchy. Apollo and Dionysus, Aphrodite and Ares — each carries a distinct mode of being, and the soul requires all of them in their tension and incompatibility.',
          ARRAY['Soul', 'Image', 'Myth']::TEXT[], 40),
         ('The Aesthetic Response',
          'Beauty is not decoration — it is the soul''s recognition of its own nature.',
          'The aesthetic response — the shiver, the arrest, the sense of rightness — is not a luxury or subjective preference. It is the soul''s primary mode of knowing: recognizing what is real, alive, and kin to it. The loss of aesthetic response in modern life is a psychological symptom — a sign of soul''s withdrawal from the field of attention.',
          ARRAY['Soul', 'Image', 'Anima Mundi']::TEXT[], 50)
       ) AS v(concept, one_line, body, related_concepts, sort_order)
  ON CONFLICT (field_id, concept) DO UPDATE SET
    one_line         = EXCLUDED.one_line,
    body             = EXCLUDED.body,
    related_concepts = EXCLUDED.related_concepts,
    sort_order       = EXCLUDED.sort_order,
    updated_at       = NOW()
)
INSERT INTO wisdom_field_works
  (field_id, title, year, work_type, description, external_url, entry_point, added_by)
SELECT field.id, v.title, v.year, v.work_type, v.description, v.external_url, v.entry_point, m.id
FROM field,
     (SELECT id FROM members ORDER BY created_at ASC LIMIT 1) m,
     (VALUES
       ('A Blue Fire', '1989', 'book',
        'Edited by Thomas Moore — the best introduction to Hillman''s thought. Selections from across his career, organized thematically, with Moore''s contextualizing commentary. Essential first contact.',
        NULL,
        TRUE),
       ('The Soul''s Code: In Search of Character and Calling', '1996', 'book',
        'Hillman''s most accessible book — built around the "acorn theory" that each person carries an image of their destiny from birth. Lyrical, generous, and genuinely useful.',
        NULL,
        FALSE),
       ('Re-Visioning Psychology', '1975', 'book',
        'The foundational statement of archetypal psychology — Hillman''s Gifford Lectures. Dense and poetic. Argues psychology needs to be re-rooted in soul and image. Read after A Blue Fire.',
        NULL,
        FALSE)
     ) AS v(title, year, work_type, description, external_url, entry_point)
ON CONFLICT (field_id, title) DO UPDATE SET
  year         = EXCLUDED.year,
  description  = EXCLUDED.description,
  external_url = EXCLUDED.external_url,
  entry_point  = EXCLUDED.entry_point;


-- ════════════════════════════════════════════════════════════════
-- 4. ROBERT KANE — wisdom_keeper / ai_posture: contextual
-- ════════════════════════════════════════════════════════════════

WITH field AS (
  INSERT INTO wisdom_fields (
    slug, field_type, ai_posture, master_name, master_dates, master_domain,
    orientation, ai_posture_note, voice_profile, visibility, created_by
  )
  SELECT
    'robert-kane',
    'wisdom_keeper',
    'contextual',
    'Robert Kane',
    '1938–2023',
    'Free Will · Agency · Moral Responsibility · Philosophy of Action',
    'Kane spent his career on one of philosophy''s most consequential questions: is there a kind of freedom worth wanting that is both genuinely real and genuinely ours? His answer — built around Ultimate Responsibility and Self-Forming Actions — refused the compromise positions. He did not want a free will that survived only by redefining the terms. He wanted to show that indeterminism, far from undermining agency, might be what makes genuine authorship of our lives possible. This is the agency axis: the deep question of whether you are the ultimate source of your own becoming, and what that requires.',
    'MAIA can think alongside you in this field. The free will question touches how you understand your own choices — she will hold the philosophical complexity without collapsing it into easy reassurance.',
    'analytical_agency_philosophy',
    'open',
    id
  FROM members ORDER BY created_at ASC LIMIT 1
  ON CONFLICT (slug) DO UPDATE SET
    master_name     = EXCLUDED.master_name,
    master_dates    = EXCLUDED.master_dates,
    master_domain   = EXCLUDED.master_domain,
    orientation     = EXCLUDED.orientation,
    ai_posture_note = EXCLUDED.ai_posture_note,
    voice_profile   = EXCLUDED.voice_profile,
    updated_at      = NOW()
  RETURNING id
),
steward AS (
  INSERT INTO wisdom_field_memberships (field_id, member_id, role, status)
  SELECT field.id, m.id, 'steward', 'active'
  FROM field, (SELECT id FROM members ORDER BY created_at ASC LIMIT 1) m
  ON CONFLICT (field_id, member_id) DO NOTHING
),
ideas AS (
  INSERT INTO wisdom_field_core_ideas
    (field_id, concept, one_line, body, related_concepts, sort_order, added_by)
  SELECT field.id, v.concept, v.one_line, v.body, v.related_concepts, v.sort_order, m.id
  FROM field,
       (SELECT id FROM members ORDER BY created_at ASC LIMIT 1) m,
       (VALUES
         ('Ultimate Responsibility',
          'To be truly free, you must be the ultimate source of your will — not merely its proximate cause.',
          'Ultimate Responsibility (UR) is Kane''s foundational condition for the kind of free will that matters morally. It is not enough that your actions flow from your desires and character — you must also be, in some sense, the author of those desires and that character. If every choice traces back to causes entirely outside you, something important is missing, however "free" the choice feels. UR is the demand that the buck stop with you.',
          ARRAY['Self-Forming Actions', 'Moral Responsibility', 'Sourcehood']::TEXT[],
          10),
         ('Self-Forming Actions',
          'The moments where we genuinely shape who we are — not just act from who we already are.',
          'Self-Forming Actions (SFAs) are Kane''s answer to the charge that indeterminism merely introduces randomness into agency. SFAs occur at genuine turning points — moments of inner conflict where multiple possible futures are live and the outcome is not determined. These are not arbitrary: both the effort and the outcome express the agent. In choosing, the agent does not merely reveal pre-existing character; she creates it. The struggle itself is the freedom.',
          ARRAY['Ultimate Responsibility', 'Indeterminism', 'Character Formation']::TEXT[],
          20),
         ('The Intelligibility Question',
          'How can indeterminism make us more free rather than less? This is the central puzzle.',
          'The standard objection to libertarian free will: if indeterminism is just randomness, it does not give us control — it removes it. Kane''s answer is that this misframes what indeterminism is doing. In SFAs, the indeterminism is not noise added to an otherwise determined process. It is located within the agent''s own effort — within the clash of competing motivations. Whatever happens, it happens because of what the agent is reaching toward. The indeterminism does not undercut authorship; it is where authorship is forged.',
          ARRAY['Self-Forming Actions', 'Ultimate Responsibility', 'Compatibilism']::TEXT[],
          30),
         ('Compatibilism and Its Limits',
          'Kane respected compatibilism — and thought it was answering a different question than the one that matters.',
          'Compatibilists argue that free will is compatible with determinism because what matters is whether actions flow from the agent''s own reasons, values, and deliberation — not whether the causal chain goes back to them all the way down. Kane found this partially right but incomplete. It describes a real and valuable kind of freedom — but not the kind that grounds ultimate moral responsibility. The compatibilist free will does not ask whether you are the ultimate source; only whether you are the proximate one. Kane thought both questions deserve an answer.',
          ARRAY['Ultimate Responsibility', 'Moral Responsibility', 'Determinism']::TEXT[],
          40),
         ('Moral Responsibility',
          'Free will matters because moral responsibility — genuine desert — depends on it.',
          'Kane''s interest in free will was never merely metaphysical. He cared because the questions of praise, blame, punishment, and desert hang on it. If no one is ever the ultimate source of their actions, the practice of holding people responsible — really responsible, not just as a useful social fiction — becomes hard to justify. His work is an attempt to show that the kind of freedom genuine responsibility requires is not incoherent, not refuted by physics, and not merely a folk illusion.',
          ARRAY['Ultimate Responsibility', 'Agency', 'Desert']::TEXT[],
          50)
       ) AS v(concept, one_line, body, related_concepts, sort_order)
  ON CONFLICT (field_id, concept) DO UPDATE SET
    one_line         = EXCLUDED.one_line,
    body             = EXCLUDED.body,
    related_concepts = EXCLUDED.related_concepts,
    sort_order       = EXCLUDED.sort_order,
    updated_at       = NOW()
)
INSERT INTO wisdom_field_works
  (field_id, title, year, work_type, description, external_url, entry_point, added_by)
SELECT field.id, v.title, v.year, v.work_type, v.description, v.external_url, v.entry_point, m.id
FROM field,
     (SELECT id FROM members ORDER BY created_at ASC LIMIT 1) m,
     (VALUES
       ('A Contemporary Introduction to Free Will', '2005', 'book',
        'The clearest single entry into Kane''s thought and the broader free will debate. Surveys compatibilism, hard determinism, and libertarianism with unusual fairness before making the case for what genuinely matters. Ideal first contact — philosophically serious without requiring prior background.',
        NULL,
        TRUE),
       ('The Significance of Free Will', '1996', 'book',
        'Kane''s major work. Develops Ultimate Responsibility and Self-Forming Actions in full technical detail. This is where the real argument lives. Read after the introduction — it rewards the effort.',
        NULL,
        FALSE),
       ('The Oxford Handbook of Free Will', '2002', 'book',
        'Edited by Kane — the comprehensive survey of the field. Essays from compatibilists, hard determinists, and libertarians. Useful for understanding where Kane''s position sits relative to the full landscape.',
        NULL,
        FALSE)
     ) AS v(title, year, work_type, description, external_url, entry_point)
ON CONFLICT (field_id, title) DO UPDATE SET
  year         = EXCLUDED.year,
  description  = EXCLUDED.description,
  external_url = EXCLUDED.external_url,
  entry_point  = EXCLUDED.entry_point;
