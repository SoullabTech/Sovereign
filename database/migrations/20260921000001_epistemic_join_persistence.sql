-- JARVIS-KP-01 / I3 — append-only epistemic join persistence candidate.
-- Governing law: NO SEMANTIC JOIN WITHOUT A WARRANT.
-- Custody only: no projection, prompt, memory, graph, routing, behavioural,
-- representation, or deployment authority is created by this schema.

BEGIN;

CREATE TABLE epistemic_join_records (
  join_id text PRIMARY KEY CHECK (length(join_id) > 0),
  member_id uuid NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
  envelope jsonb NOT NULL CHECK (jsonb_typeof(envelope) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (join_id, member_id),
  CONSTRAINT epistemic_join_envelope_identity
    CHECK (envelope ->> 'joinId' = join_id),
  CONSTRAINT epistemic_join_member_scope
    CHECK (envelope ->> 'memberScope' = member_id::text)
);

CREATE TABLE epistemic_warrant_records (
  join_id text NOT NULL,
  member_id uuid NOT NULL,
  warrant_id text NOT NULL CHECK (length(warrant_id) > 0),
  warrant jsonb NOT NULL CHECK (jsonb_typeof(warrant) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (join_id, warrant_id),
  FOREIGN KEY (join_id, member_id)
    REFERENCES epistemic_join_records(join_id, member_id) ON DELETE RESTRICT,
  CONSTRAINT epistemic_warrant_identity
    CHECK (warrant ->> 'warrantId' = warrant_id)
);

CREATE TABLE epistemic_join_dependencies (
  dependency_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  join_id text NOT NULL,
  member_id uuid NOT NULL,
  ref_id text NOT NULL CHECK (length(ref_id) > 0),
  dependence_mode text NOT NULL CHECK (dependence_mode IN ('reference', 'reliance')),
  ordinal integer NOT NULL CHECK (ordinal >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (join_id, member_id)
    REFERENCES epistemic_join_records(join_id, member_id) ON DELETE RESTRICT,
  UNIQUE (join_id, dependence_mode, ref_id)
);

CREATE TABLE epistemic_standing_acts (
  act_id text PRIMARY KEY CHECK (length(act_id) > 0),
  join_id text NOT NULL,
  member_id uuid NOT NULL,
  component_id text,
  claimed_standing text NOT NULL CHECK (
    claimed_standing IN (
      'NONE_UNASSERTED', 'CANDIDATE_UNESTABLISHED', 'PROVISIONAL',
      'WARRANTED', 'PROMOTED', 'DISCHARGED', 'SUPERSEDED'
    )
  ),
  basis text NOT NULL CHECK (
    basis IN (
      'initial_proposal', 'warrant_admission', 'new_evidence', 'adoption',
      'conflict_emerged', 'warrant_defeated',
      'superseded_by_later_proposition', 'authority_withdrawal'
    )
  ),
  warrant_ref text,
  authorship jsonb NOT NULL CHECK (jsonb_typeof(authorship) = 'object'),
  jurisdiction text NOT NULL,
  supersedes_act_id text REFERENCES epistemic_standing_acts(act_id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (join_id, member_id)
    REFERENCES epistemic_join_records(join_id, member_id) ON DELETE RESTRICT,
  FOREIGN KEY (join_id, warrant_ref)
    REFERENCES epistemic_warrant_records(join_id, warrant_id) ON DELETE RESTRICT,
  CONSTRAINT epistemic_standing_component_nonempty
    CHECK (component_id IS NULL OR length(component_id) > 0),
  CONSTRAINT epistemic_standing_not_self_superseding
    CHECK (supersedes_act_id IS NULL OR supersedes_act_id <> act_id)
);

CREATE UNIQUE INDEX epistemic_standing_one_root_per_subject
  ON epistemic_standing_acts (join_id, COALESCE(component_id, '<JOIN>'))
  WHERE supersedes_act_id IS NULL;

CREATE UNIQUE INDEX epistemic_standing_one_successor
  ON epistemic_standing_acts (supersedes_act_id)
  WHERE supersedes_act_id IS NOT NULL;
CREATE TABLE epistemic_adoption_acts (
  act_id text PRIMARY KEY CHECK (length(act_id) > 0),
  join_id text NOT NULL,
  member_id uuid NOT NULL,
  adopted_component_ids text[] NOT NULL CHECK (cardinality(adopted_component_ids) > 0),
  adopter jsonb NOT NULL CHECK (jsonb_typeof(adopter) = 'object'),
  adopter_jurisdiction text NOT NULL,
  proposition_as_put text NOT NULL,
  original_proposer jsonb NOT NULL CHECK (jsonb_typeof(original_proposer) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (join_id, member_id)
    REFERENCES epistemic_join_records(join_id, member_id) ON DELETE RESTRICT
);

CREATE TABLE epistemic_join_admissions (
  admission_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  join_id text NOT NULL,
  member_id uuid NOT NULL,
  previous_admission_id uuid
    REFERENCES epistemic_join_admissions(admission_id) ON DELETE RESTRICT,
  tip_act_id text REFERENCES epistemic_standing_acts(act_id) ON DELETE RESTRICT,
  requested_standing text NOT NULL,
  admitted_standing text NOT NULL CHECK (
    admitted_standing IN (
      'NONE_UNASSERTED', 'CANDIDATE_UNESTABLISHED', 'PROVISIONAL',
      'WARRANTED', 'PROMOTED', 'DISCHARGED', 'SUPERSEDED'
    )
  ),
  requested_jurisdiction text NOT NULL,
  admitted_jurisdiction text,
  evaluation_request jsonb NOT NULL CHECK (jsonb_typeof(evaluation_request) = 'object'),
  evaluation_result jsonb NOT NULL CHECK (jsonb_typeof(evaluation_result) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (join_id, member_id)
    REFERENCES epistemic_join_records(join_id, member_id) ON DELETE RESTRICT,
  CONSTRAINT epistemic_admission_representation_closed CHECK (
    evaluation_result ->> 'downstreamRepresentationAuthorized' = 'false'
    AND evaluation_result ->> 'representationAuthority' = 'closed'
  )
);

CREATE UNIQUE INDEX epistemic_admission_one_root
  ON epistemic_join_admissions (join_id)
  WHERE previous_admission_id IS NULL;

CREATE UNIQUE INDEX epistemic_admission_one_successor
  ON epistemic_join_admissions (previous_admission_id)
  WHERE previous_admission_id IS NOT NULL;

CREATE OR REPLACE FUNCTION epistemic_validate_standing_successor()
RETURNS trigger AS $$
DECLARE
  parent_join text;
  parent_member uuid;
  parent_component text;
BEGIN
  IF NEW.supersedes_act_id IS NULL THEN RETURN NEW; END IF;

  SELECT join_id, member_id, component_id
    INTO parent_join, parent_member, parent_component
    FROM epistemic_standing_acts
   WHERE act_id = NEW.supersedes_act_id;

  IF NOT FOUND THEN RETURN NEW; END IF;

  IF parent_join IS DISTINCT FROM NEW.join_id
     OR parent_member IS DISTINCT FROM NEW.member_id
     OR parent_component IS DISTINCT FROM NEW.component_id THEN
    RAISE EXCEPTION
      'epistemic standing succession must remain on the same member/join/subject';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER epistemic_standing_successor_guard
  BEFORE INSERT ON epistemic_standing_acts
  FOR EACH ROW EXECUTE FUNCTION epistemic_validate_standing_successor();

CREATE OR REPLACE FUNCTION epistemic_validate_admission_successor()
RETURNS trigger AS $$
DECLARE
  parent_join text;
  parent_member uuid;
BEGIN
  IF NEW.previous_admission_id IS NULL THEN RETURN NEW; END IF;

  SELECT join_id, member_id
    INTO parent_join, parent_member
    FROM epistemic_join_admissions
   WHERE admission_id = NEW.previous_admission_id;

  IF NOT FOUND THEN RETURN NEW; END IF;

  IF parent_join IS DISTINCT FROM NEW.join_id
     OR parent_member IS DISTINCT FROM NEW.member_id THEN
    RAISE EXCEPTION
      'epistemic admission succession must remain on the same member/join';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER epistemic_admission_successor_guard
  BEFORE INSERT ON epistemic_join_admissions
  FOR EACH ROW EXECUTE FUNCTION epistemic_validate_admission_successor();

CREATE OR REPLACE FUNCTION epistemic_append_only_guard()
RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION
    'epistemic join persistence is append-only: % on % is not permitted',
    TG_OP, TG_TABLE_NAME;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER epistemic_join_records_immutable
  BEFORE UPDATE OR DELETE ON epistemic_join_records
  FOR EACH ROW EXECUTE FUNCTION epistemic_append_only_guard();

CREATE TRIGGER epistemic_warrant_records_immutable
  BEFORE UPDATE OR DELETE ON epistemic_warrant_records
  FOR EACH ROW EXECUTE FUNCTION epistemic_append_only_guard();

CREATE TRIGGER epistemic_join_dependencies_immutable
  BEFORE UPDATE OR DELETE ON epistemic_join_dependencies
  FOR EACH ROW EXECUTE FUNCTION epistemic_append_only_guard();

CREATE TRIGGER epistemic_standing_acts_immutable
  BEFORE UPDATE OR DELETE ON epistemic_standing_acts
  FOR EACH ROW EXECUTE FUNCTION epistemic_append_only_guard();

CREATE TRIGGER epistemic_adoption_acts_immutable
  BEFORE UPDATE OR DELETE ON epistemic_adoption_acts
  FOR EACH ROW EXECUTE FUNCTION epistemic_append_only_guard();

CREATE TRIGGER epistemic_join_admissions_immutable
  BEFORE UPDATE OR DELETE ON epistemic_join_admissions
  FOR EACH ROW EXECUTE FUNCTION epistemic_append_only_guard();

CREATE VIEW epistemic_join_current_standing AS
SELECT a.join_id, a.member_id, a.admission_id, a.tip_act_id,
       a.admitted_standing, a.admitted_jurisdiction, a.created_at
FROM epistemic_join_admissions a
WHERE NOT EXISTS (
  SELECT 1
  FROM epistemic_join_admissions successor
  WHERE successor.previous_admission_id = a.admission_id
);

CREATE INDEX epistemic_join_records_member
  ON epistemic_join_records(member_id, created_at DESC);
CREATE INDEX epistemic_warrant_records_member_join
  ON epistemic_warrant_records(member_id, join_id);
CREATE INDEX epistemic_standing_acts_member_join
  ON epistemic_standing_acts(member_id, join_id);
CREATE INDEX epistemic_adoption_acts_member_join
  ON epistemic_adoption_acts(member_id, join_id);
CREATE INDEX epistemic_join_admissions_member_join
  ON epistemic_join_admissions(member_id, join_id, created_at DESC);

COMMIT;

-- ROLLBACK (manual, destructive; intended only before admitted production use):
-- DROP VIEW IF EXISTS epistemic_join_current_standing;
-- DROP TABLE IF EXISTS epistemic_join_admissions;
-- DROP TABLE IF EXISTS epistemic_adoption_acts;
-- DROP TABLE IF EXISTS epistemic_standing_acts;
-- DROP TABLE IF EXISTS epistemic_join_dependencies;
-- DROP TABLE IF EXISTS epistemic_warrant_records;
-- DROP TABLE IF EXISTS epistemic_join_records;
-- DROP FUNCTION IF EXISTS epistemic_append_only_guard();
-- DROP FUNCTION IF EXISTS epistemic_validate_admission_successor();
-- DROP FUNCTION IF EXISTS epistemic_validate_standing_successor();
