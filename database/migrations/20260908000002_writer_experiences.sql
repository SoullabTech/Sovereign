-- Writer's Studio — Experiences, and Living Work Contributions.
--
-- AUTHORITY. Founder ruling, Writer's Studio, 2026-09-08 §XIII–XX. BUILD authorized; member-facing
-- deployment of facilitated Experiences remains held behind PT-3 production enforcement.
--
-- AN EXPERIENCE IS NOT A WORK (§XIII). It is a member-owned intentional container through which
-- exploration, learning, practice, development, creation or accompaniment may unfold. It may involve
-- zero, one or many Works; a Work may participate in zero, one or many Experiences; neither becomes
-- the other because they are related.
--
-- ⚠️ NAMING (§VI). `writer_*`, not `experiences`. Three different things in this repository already
-- answer to the word — `decision_experiences` / `change_experiences` mean *an experience someone
-- HAD*, and lib/experiences means Guided Experiences, *an experience someone is GIVEN*. No code may
-- rely on the naked word to determine ontology. `studio_*` was also refused: it already denotes the
-- Pro/Vision/Media Studios, which are not this one.
--
-- ⭐ TWO JURISDICTIONAL CORRECTIONS FROM THE RULING, both visible in the table names below:
--
--   §XV  A Contribution is a LIVING WORK provenance object, not an Experience object. An Experience
--        may be the context in which one arose; it must never be REQUIRED to preserve another
--        human's influence on a Work. Hence `living_work_contributions`, with `living_work_id` NOT
--        NULL and `experience_id` optional.
--
--   §XIII The DESIGN proposed reusing `living_work_materials` for the Experience↔Work relation.
--        Returned as a conflict instead: that table means *material that feeds the Work*, and an
--        Experience is not material — it is the field a Work arose within. Calling it material to
--        save one table would be exactly the semantic fiction the ruling forbids, and would make
--        relationship indistinguishable from adoption. Hence a small relation object of its own.
--
-- Idempotent per migration-ledger discipline.

-- ═══════════════════════════════════════════════════════════════════════════════
-- 1. The container (§XIII)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS writer_experiences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_member_id uuid NOT NULL REFERENCES members(id) ON DELETE RESTRICT,

  -- The member's own words. On the NEVER_AUTHORED_BY_THE_SYSTEM footing that governs
  -- living_works.title / purpose / form: MAIA may help a member find these; MAIA may not write them.
  title text NOT NULL CHECK (length(trim(title)) > 0),
  intention text,

  -- Declared, not derived. A facilitated Experience with no participants yet would otherwise read
  -- as self-directed, and the container must know what it is before anyone arrives. It is a
  -- property of one object, NOT a subclass: every table below is identical for both.
  orientation text NOT NULL CHECK (orientation IN ('for_myself', 'for_others')),

  state text NOT NULL DEFAULT 'active' CHECK (state IN ('active', 'archived')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_we_owner ON writer_experiences(owner_member_id, state);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 2. Versions, frozen by ENCOUNTER (§XI)
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- Revision changes what comes next; it does not rewrite what already happened. The law binds to
-- encounter, not to orientation: before anyone has entered a version its creator may keep shaping it
-- without manufacturing meaningless historical versions; from the first encounter it is history.
-- A creator participating in their own Experience is an encounter for this purpose.

CREATE TABLE IF NOT EXISTS writer_experience_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id uuid NOT NULL REFERENCES writer_experiences(id) ON DELETE CASCADE,
  version_number int NOT NULL CHECK (version_number >= 1),
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),

  -- NULL = still shapeable. Set at first encounter, by trigger, never by application code.
  frozen_at timestamptz,

  UNIQUE (experience_id, version_number)
);

CREATE INDEX IF NOT EXISTS idx_wev_experience ON writer_experience_versions(experience_id, version_number DESC);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 3. Movements — addressable, never ordinal-in-force (§X, §XIV)
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- ⭐ READ THIS BEFORE ADDING A COLUMN HERE. There is deliberately NO current_movement_id, no
-- completed state, no percentage, no ordinal progress record, and no participation↔movement table
-- anywhere in this migration. That ABSENCE is the design: a progress economy needs no column, only
-- somewhere to derive one from. A screenwriter entering at Whole Script Encounter is not "skipping
-- ahead" because the architecture cannot represent aheadness.
--
-- `position` orders the movements OF A VERSION. It is not a member's position, and nothing may
-- turn it into one. An Experience creator may make one movement depend on another where their
-- method requires it — that is method structure, not personal rank.

CREATE TABLE IF NOT EXISTS writer_experience_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version_id uuid NOT NULL REFERENCES writer_experience_versions(id) ON DELETE CASCADE,
  position int NOT NULL CHECK (position >= 0),

  -- Open text, as manuscript_structure_units.kind is. Week, movement, threshold, encounter,
  -- gathering, session — the creator's word, never a platform vocabulary.
  kind text CHECK (kind IS NULL OR length(trim(kind)) > 0),
  title text NOT NULL CHECK (length(trim(title)) > 0),
  body text,

  -- Witness B's surviving condition: a method is a sequence and a voice, not a file. A movement
  -- must be able to say whose it is, and that attribution must survive its author's departure.
  authored_by_member_id uuid REFERENCES members(id) ON DELETE SET NULL,
  authorship text NOT NULL DEFAULT 'facilitator'
    CHECK (authorship IN ('facilitator', 'platform', 'maia_derived')),

  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (version_id, position)
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 4. Participation confers participation and nothing else (§XII)
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- Originates in a member gesture — the field_programs rule ("declared by arrival, not administered
-- by roster"), NOT the coach_* rule. There is deliberately no enrolled_by_facilitator column: a
-- participation that could be created ABOUT someone is the collapse §XII refuses.
--
-- ⛔ NOTHING MAY KEY ACCESS OFF THIS TABLE. It records that a person participates. It is not an
-- authorization surface, and a join from here to a member's Works, drafts, Reflections or MAIA
-- conversations is a constitutional violation, not a feature. That is asserted executably by
-- __tests__/experienceParticipationIsNonAuthorizing.test.ts.

CREATE TABLE IF NOT EXISTS writer_experience_participations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id uuid NOT NULL REFERENCES writer_experiences(id) ON DELETE CASCADE,

  -- The version encountered. This is what makes the §XI guarantee legible years later.
  version_id uuid NOT NULL REFERENCES writer_experience_versions(id) ON DELETE RESTRICT,

  member_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  began_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz
);

CREATE UNIQUE INDEX IF NOT EXISTS uniq_wep_active
  ON writer_experience_participations(experience_id, member_id) WHERE ended_at IS NULL;

-- Freezing is a database fact, not a code convention: the version becomes history the moment it is
-- encountered, whoever encounters it and by whatever route.
CREATE OR REPLACE FUNCTION writer_experience_freeze_on_encounter() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  UPDATE writer_experience_versions
     SET frozen_at = now()
   WHERE id = NEW.version_id AND frozen_at IS NULL;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS wep_freeze_on_encounter ON writer_experience_participations;
CREATE TRIGGER wep_freeze_on_encounter
  AFTER INSERT ON writer_experience_participations
  FOR EACH ROW EXECUTE FUNCTION writer_experience_freeze_on_encounter();

-- The temporal law, enforced rather than promised: an encountered version cannot be rewritten.
-- Same shape as PT-3 one scale up — revision creates a descendant; it never edits the past.
CREATE OR REPLACE FUNCTION writer_experience_refuse_frozen_edit() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE frozen timestamptz;
BEGIN
  SELECT v.frozen_at INTO frozen FROM writer_experience_versions v
   WHERE v.id = COALESCE(NEW.version_id, OLD.version_id);
  IF frozen IS NOT NULL THEN
    RAISE EXCEPTION
      'this Experience version was encountered on % and is history — revise by creating the next '
      'version; what a participant moved through may not be rewritten', frozen;
  END IF;
  RETURN COALESCE(NEW, OLD);
END $$;

DROP TRIGGER IF EXISTS wem_refuse_frozen_edit ON writer_experience_movements;
CREATE TRIGGER wem_refuse_frozen_edit
  BEFORE INSERT OR UPDATE OR DELETE ON writer_experience_movements
  FOR EACH ROW EXECUTE FUNCTION writer_experience_refuse_frozen_edit();

-- ═══════════════════════════════════════════════════════════════════════════════
-- 5. Experience ↔ Work — its own relation, not a fiction (§XIII)
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- The meaning is: this Work is related to / arose within / participated in this Experience.
-- It is NOT: this Experience has become content of the Work.
--
-- The author declares it, in their own sentence — the living_work_materials pattern, reused as a
-- PATTERN rather than as a table, so relationship never becomes indistinguishable from adoption.

CREATE TABLE IF NOT EXISTS writer_experience_work_relations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id uuid NOT NULL REFERENCES writer_experiences(id) ON DELETE CASCADE,
  living_work_id uuid NOT NULL REFERENCES living_works(id) ON DELETE CASCADE,

  relationship_sentence text,
  declared_by uuid NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
  declared_at timestamptz NOT NULL DEFAULT now(),

  UNIQUE (experience_id, living_work_id)
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 6. Contribution — a Living Work provenance primitive (§XV, §XVI)
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- A Contribution is what another human brought. It exists in relationship to a Work WITHOUT being
-- part of it. That distinction is the whole object: attaching it to living_work_materials would make
-- attachment synonymous with adoption, filing it as a Reflection would erase the contributor, and
-- absorbing it into MAIA's memory would fold a human into the AI/author binary.
--
-- ⭐ contributor_name is NOT NULL and free text ON PURPOSE (§XVI). An actor, a director, an
-- interview subject or an elder need not have an account here to be named as the origin of what
-- they gave. Requiring a member id would erase every contributor who is not a user — which is most
-- of them. A platform identity, where one exists, is ADDITIVE and may never replace the label:
-- "Maria Alvarez, actor playing Ruth" must not silently become member_id 8472.
--
-- ⛔ This settles no rights (§XVIII): not co-authorship, joint authorship, contract, performer
-- rights, releases, work-for-hire or adaptation. It records that a human brought something.

CREATE TABLE IF NOT EXISTS living_work_contributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- §XV: the core relation is Contributor → Contribution → Living Work. An Experience must never be
  -- REQUIRED to preserve another human's influence on a Work.
  living_work_id uuid NOT NULL REFERENCES living_works(id) ON DELETE CASCADE,

  -- Optional context: where it arose, when it arose inside one.
  experience_id uuid REFERENCES writer_experiences(id) ON DELETE SET NULL,

  recorded_by_member_id uuid NOT NULL REFERENCES members(id) ON DELETE RESTRICT,

  contributor_name text NOT NULL CHECK (length(trim(contributor_name)) > 0),
  contributor_member_id uuid REFERENCES members(id) ON DELETE SET NULL,

  kind text CHECK (kind IS NULL OR length(trim(kind)) > 0),
  context text,
  body text NOT NULL CHECK (length(trim(body)) > 0),

  occurred_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lwc_work ON living_work_contributions(living_work_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lwc_experience ON living_work_contributions(experience_id)
  WHERE experience_id IS NOT NULL;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 7. Adoption — a separate authorial act (§XVII)
-- ═══════════════════════════════════════════════════════════════════════════════
--
--   Contribution records what another human brought.
--   Adoption records what the author decided to carry forward.
--
-- ⭐ TWO KINDS, and the second is why this is a table rather than a column:
--
--   material   contributed material is incorporated; a living_work_materials row exists
--   influence  the contribution changed the author's understanding or a subsequent creative act,
--              and NO contributed artifact became manuscript material
--
-- THE SUITCASE WITNESS IS CANONICAL. An actor discovers Ruth's line lands differently while she is
-- already holding the suitcase; the playwright later rewrites the scene personally. The truth is
-- neither "the playwright independently thought of the staging" nor "the actor authored the
-- rewritten scene". It is: the actor's discovery influenced a subsequent authorial act. A schema
-- that could only record material adoption would lose the commonest case in theatre and quietly
-- convert it into the first of those two falsehoods.

CREATE TABLE IF NOT EXISTS living_work_contribution_adoptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contribution_id uuid NOT NULL REFERENCES living_work_contributions(id) ON DELETE RESTRICT,
  living_work_id uuid NOT NULL REFERENCES living_works(id) ON DELETE CASCADE,

  adopted_by_member_id uuid NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
  adopted_at timestamptz NOT NULL DEFAULT now(),

  adoption_kind text NOT NULL CHECK (adoption_kind IN ('material', 'influence')),

  -- Set for material adoption only. ON DELETE RESTRICT on the contribution above is deliberate:
  -- provenance must survive as long as anything adopted from it survives.
  living_work_material_id uuid REFERENCES living_work_materials(id) ON DELETE SET NULL,

  -- The author's own words about what they took. Never generated.
  note text,

  CONSTRAINT material_adoption_names_its_material
    CHECK ((adoption_kind = 'material') = (living_work_material_id IS NOT NULL))
);

CREATE INDEX IF NOT EXISTS idx_lwca_contribution ON living_work_contribution_adoptions(contribution_id);
CREATE INDEX IF NOT EXISTS idx_lwca_work ON living_work_contribution_adoptions(living_work_id, adopted_at DESC);

COMMENT ON TABLE living_work_contribution_adoptions IS
  'What the author decided to carry forward from what another human brought. Influence adoption '
  'records causation without possession: the contribution changed the Work and neither the '
  'contributor nor the author is credited with the other''s act.';
