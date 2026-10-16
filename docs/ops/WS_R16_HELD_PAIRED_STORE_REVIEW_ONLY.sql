-- R16 REVIEW ONLY. NOT an executable migration in database/migrations.
-- Run exclusively in an independently created fictional PostgreSQL fixture.
-- No grant to the production application, no live key provider and NO real
-- writer Source is eligible for this provisional isolated table.
--
-- Pair records are INSERT-ONLY. All byte contents live as authenticated
-- ciphertext in the existing durable vault. Independent revocation and
-- historical offsite backup approval have NOT been established.
CREATE TABLE IF NOT EXISTS writers_studio_r16_held_pairs (
  claim_id uuid PRIMARY KEY,
  member_id uuid NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
  arrival_id uuid NOT NULL UNIQUE REFERENCES manuscript_source_arrivals(id) ON DELETE RESTRICT,
  manuscript_id uuid NOT NULL REFERENCES member_manuscripts(id) ON DELETE RESTRICT,
  pending_key_id uuid NOT NULL,
  work_key_id uuid NOT NULL,
  claim_epoch bigint NOT NULL CHECK (claim_epoch > 0),
  work_generation integer NOT NULL CHECK (work_generation > 0),
  work_ref text NOT NULL UNIQUE,
  provenance_ref text NOT NULL UNIQUE,
  work_digest text NOT NULL,
  provenance_digest text NOT NULL,
  pair_digest text NOT NULL,
  state text NOT NULL CHECK (state = 'held_encrypted_pair_only'),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT r16_distinct_keys CHECK (pending_key_id <> work_key_id),
  CONSTRAINT r16_distinct_files CHECK (work_ref <> provenance_ref),
  CONSTRAINT r16_digest_shapes CHECK (
    work_digest ~ '^[0-9a-f]{64}$' AND
    provenance_digest ~ '^[0-9a-f]{64}$' AND
    pair_digest ~ '^[0-9a-f]{64}$'
  ),
  CONSTRAINT r16_namespaced_refs CHECK (
    work_ref ~ '^ws-beta-r16-held-ciphertext/[0-9a-f-]{36}\.enc$' AND
    provenance_ref ~ '^ws-beta-r16-held-ciphertext/[0-9a-f-]{36}\.enc$'
  )
);

CREATE INDEX IF NOT EXISTS r16_pair_member_claim_idx
  ON writers_studio_r16_held_pairs(member_id, created_at DESC);

-- Even a direct SQL INSERT cannot attach a pair to a foreign Work. Reusing an
-- arrival already claimed by another manuscript is also forbidden. No trigger
-- returns error strings containing manuscript text or user-supplied filenames.
CREATE OR REPLACE FUNCTION ws_beta_r16_enforce_owner_and_immutability()
RETURNS trigger LANGUAGE plpgsql AS $function$
DECLARE matched boolean;
BEGIN
  IF TG_OP <> 'INSERT' THEN
    RAISE EXCEPTION 'r16_paired_record_immutable';
  END IF;
  SELECT true INTO matched
    FROM manuscript_source_arrivals a
    JOIN member_manuscripts m ON a.manuscript_id = m.id
                              AND a.member_id = m.member_id
   WHERE a.id = NEW.arrival_id
     AND a.member_id = NEW.member_id
     AND m.id = NEW.manuscript_id
   FOR KEY SHARE OF a,m;
  IF matched IS NOT TRUE THEN
    RAISE EXCEPTION 'r16_paired_owner_join_refused';
  END IF;
  RETURN NEW;
END
$function$;

DROP TRIGGER IF EXISTS ws_beta_r16_immutable_owner
  ON writers_studio_r16_held_pairs;
CREATE TRIGGER ws_beta_r16_immutable_owner
  BEFORE INSERT OR UPDATE OR DELETE ON writers_studio_r16_held_pairs
  FOR EACH ROW EXECUTE FUNCTION ws_beta_r16_enforce_owner_and_immutability();

COMMENT ON TABLE writers_studio_r16_held_pairs IS
  'R16 held encrypted-pair source-only qualification. INSERT-only, not admission or deletion proof. Never store plaintext original filename, text, or key bytes here.';

-- No public/anonymous privileges.
REVOKE ALL ON writers_studio_r16_held_pairs FROM PUBLIC;
