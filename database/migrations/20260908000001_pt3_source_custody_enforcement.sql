-- PT-3 — Source custody enforcement.
--
-- AUTHORITY. Founder ruling, Writer's Studio, 2026-09-08 (§I–IX). PT-3 governs two tiers:
--
--   HISTORICAL SOURCE      manuscript_source_arrivals (+ its vault artifact)
--   SOURCE REPRESENTATION  manuscript_sections, grouped by manuscript_source_representations
--
-- WHY THIS EXISTS. The 2026-09-08 falsifier found PT-3 behaviourally respected and structurally
-- unenforced: the application role owned both tiers, so a direct UPDATE mutated 2 section rows, a
-- DELETE removed a live draft's origin, and an UPDATE rewrote an arrival's source text with a
-- matching hash. A refusal boundary controlled by the authority it constrains is not a boundary.
--
-- FOUR FUNCTIONS, NOT FOUR OPTIONS (§VI):
--   ROLE     the constitutional boundary — ordinary runtime cannot reach protected content
--   SEAM     the lawful lifecycle API — every exceptional act is named as the act it is
--   TRIGGER  defence in depth — installed by an authority the app cannot disable
--   CENSUS   detection — scripts/witness/pt3-source-custody-falsifier.ts, Leg 1
--
-- OWNERSHIP IS ALREADY CORRECT AND THE APP'S IDENTITY IS NOT. The protected tables are owned by
-- the migration authority (the POSTGRES_USER that ran every migration). What must change is that
-- ordinary runtime stops connecting AS that authority. This migration therefore creates a
-- non-superuser application role and grants it exactly what runtime needs. Ownership is untouched.
--
-- ⚠️ A SUPERUSER BYPASSES EVERY GRANT AND EVERY TRIGGER. This migration is inert until the
-- application's DATABASE_URL names maia_app. That credential change is deployment work and is
-- deliberately not performed here — see docs/programme/WS-LIFE-OF-A-WORK_PT3_ENFORCEMENT_*.
--
-- Idempotent per migration-ledger discipline.

-- ═══════════════════════════════════════════════════════════════════════════════
-- 1. The ordinary application role
-- ═══════════════════════════════════════════════════════════════════════════════

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'maia_app') THEN
    -- NOSUPERUSER is the whole point: a superuser is refused by nothing below.
    CREATE ROLE maia_app LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS;
  END IF;
END $$;

DO $$
BEGIN
  EXECUTE format('GRANT CONNECT ON DATABASE %I TO maia_app', current_database());
END $$;
GRANT USAGE ON SCHEMA public TO maia_app;

-- Broad by default, narrowed deliberately below. Ordinary runtime keeps ordinary authority over
-- everything that is not protected Source.
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO maia_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO maia_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO maia_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO maia_app;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 2. Source Representation identity
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- manuscript_sections rows had no group identity, so "a representation" could not be pointed at,
-- and re-extraction (§V) had nothing to create. This table gives a representation an identity AND
-- carries its custody relationship as a column — which is what lets §II's atomicity be structural:
-- a custodied representation cannot exist without the arrival it derives from.

CREATE TABLE IF NOT EXISTS manuscript_source_representations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  manuscript_id uuid NOT NULL REFERENCES member_manuscripts(id) ON DELETE CASCADE,

  -- NULL only for rows backfilled from history that never had an arrival.
  arrival_id uuid REFERENCES manuscript_source_arrivals(id) ON DELETE RESTRICT,

  custody text NOT NULL
    CHECK (custody IN ('source_custodied', 'legacy_interpreted_import')),

  created_at timestamptz NOT NULL DEFAULT now(),

  -- §II: a representation may not enter the lineage in an uncustodied or ambiguous default state.
  -- Custody is the presence of the arrival, not a word beside it.
  CONSTRAINT representation_custody_matches_arrival
    CHECK ((custody = 'source_custodied') = (arrival_id IS NOT NULL))
);

CREATE INDEX IF NOT EXISTS idx_msr_manuscript ON manuscript_source_representations(manuscript_id, created_at);

COMMENT ON TABLE manuscript_source_representations IS
  'Identity for one Source Representation — the cut of one arrival into sections. Several may exist '
  'for one Work (re-extraction, replacement); which is operative is NEVER stored here. Currency is '
  'derived from source_lifecycle_acts, so becoming operative never rewrites a representation.';

ALTER TABLE manuscript_sections
  ADD COLUMN IF NOT EXISTS representation_id uuid
    REFERENCES manuscript_source_representations(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_sections_representation ON manuscript_sections(representation_id);

-- Backfill: every existing manuscript with sections gets one representation, carrying the custody
-- state the Work already asserts. This writes a new column on historical rows; it does not touch
-- heading, body, position, depth or signal. No content is rewritten.
DO $$
DECLARE m record; rep_id uuid; arr_id uuid; cust text;
BEGIN
  FOR m IN
    SELECT DISTINCT s.manuscript_id FROM manuscript_sections s WHERE s.representation_id IS NULL
  LOOP
    SELECT a.id INTO arr_id FROM manuscript_source_arrivals a
      WHERE a.manuscript_id = m.manuscript_id ORDER BY a.created_at ASC, a.id ASC LIMIT 1;
    cust := CASE WHEN arr_id IS NULL THEN 'legacy_interpreted_import' ELSE 'source_custodied' END;

    INSERT INTO manuscript_source_representations (manuscript_id, arrival_id, custody)
      VALUES (m.manuscript_id, arr_id, cust) RETURNING id INTO rep_id;

    UPDATE manuscript_sections SET representation_id = rep_id
      WHERE manuscript_id = m.manuscript_id AND representation_id IS NULL;
  END LOOP;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 3. Append-only Source lifecycle (§IV, §V)
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- §IV: currency is not Source content, and moving it must not modify the artifact whose
-- immutability is protected. So currency is not a column anywhere on a protected row — it is
-- DERIVED from the acts below. `is_current` was refused, not deferred.
--
-- §V: the distinctions must stay recoverable. `act` is therefore a named vocabulary and never one
-- generic 'inactive' state — withdrawal, replacement, re-extraction and erasure are different
-- things that a later reader must be able to tell apart.

CREATE TABLE IF NOT EXISTS source_lifecycle_acts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  manuscript_id uuid NOT NULL,

  act text NOT NULL CHECK (act IN
    ('arrival', 'extraction', 're_extraction', 'replacement', 'withdrawal', 'erasure')),

  -- Exactly one subject: a lineage (the arrival) or a representation.
  arrival_id uuid,
  representation_id uuid,
  CONSTRAINT lifecycle_act_has_one_subject
    CHECK ((arrival_id IS NOT NULL) <> (representation_id IS NOT NULL)),

  -- TRUE: this subject becomes operative. FALSE: it ceases to be operative.
  -- Ceasing is not destruction — that is what makes withdrawal expressible (§V).
  operative boolean NOT NULL,

  occurred_at timestamptz NOT NULL DEFAULT now(),
  actor_member_id uuid NOT NULL,

  -- Why, in the vocabulary of the act. Never content: an erasure act must not preserve what the
  -- erasure destroyed. The vault_erasure_queue precedent — errno only, never the path.
  reason text CHECK (reason IS NULL OR length(reason) <= 200)
);

CREATE INDEX IF NOT EXISTS idx_sla_manuscript ON source_lifecycle_acts(manuscript_id, occurred_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS idx_sla_representation ON source_lifecycle_acts(representation_id, occurred_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS idx_sla_arrival ON source_lifecycle_acts(arrival_id, occurred_at DESC, id DESC);

COMMENT ON TABLE source_lifecycle_acts IS
  'Append-only. The authoritative account of Source currency and lifecycle. Historical content stays '
  'historical: an act says what became or ceased to be operative WITHOUT writing to the tier it '
  'names. Any convenience pointer elsewhere is a derived cache, reconstructible from these rows, '
  'and never a second authority.';

-- Append-only, structurally.
CREATE OR REPLACE FUNCTION source_lifecycle_acts_append_only() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'source_lifecycle_acts is append-only: a lifecycle act, once recorded, is history';
END $$;

DROP TRIGGER IF EXISTS source_lifecycle_acts_no_rewrite ON source_lifecycle_acts;
CREATE TRIGGER source_lifecycle_acts_no_rewrite
  BEFORE UPDATE OR DELETE ON source_lifecycle_acts
  FOR EACH ROW EXECUTE FUNCTION source_lifecycle_acts_append_only();

-- ═══════════════════════════════════════════════════════════════════════════════
-- 4. Defence in depth (§VI) — refusal the application role cannot disable
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- These triggers are owned by the migration authority. maia_app is not the owner, so it cannot
-- ALTER TABLE ... DISABLE TRIGGER them — the exact bypass demonstrated on 2026-09-08.
--
-- The seam opens a transaction-local window by name. A window that must be opened by naming the
-- act is why erasure "may never be implemented as an incidental side effect" (§II): a cascade
-- delete with no act named is refused.

CREATE OR REPLACE FUNCTION pt3_refuse_source_mutation() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE permitted text;
BEGIN
  permitted := current_setting('maia.source_lifecycle_act', true);

  IF TG_OP = 'DELETE' THEN
    -- Destruction is lawful only when erasure was explicitly commissioned by the seam.
    IF permitted = 'erasure' THEN RETURN OLD; END IF;
    RAISE EXCEPTION
      'PT-3: destruction of protected Source (%) refused — erasure must be commissioned as erasure '
      'through the governed lifecycle seam, never as a side effect', TG_TABLE_NAME;
  END IF;

  -- UPDATE. There is no lawful content-working update of either tier: re-extraction and
  -- replacement CREATE, they never rewrite.
  RAISE EXCEPTION
    'PT-3: content-working mutation of protected Source (%) refused — work occurs only in a '
    'descendant representation', TG_TABLE_NAME;
END $$;

DROP TRIGGER IF EXISTS pt3_sections_refuse ON manuscript_sections;
CREATE TRIGGER pt3_sections_refuse
  BEFORE UPDATE OF heading, body, position, heading_depth, heading_signal, manuscript_id
      OR DELETE ON manuscript_sections
  FOR EACH ROW EXECUTE FUNCTION pt3_refuse_source_mutation();

DROP TRIGGER IF EXISTS pt3_arrivals_refuse ON manuscript_source_arrivals;
CREATE TRIGGER pt3_arrivals_refuse
  BEFORE UPDATE OF source_text, source_text_hash, artifact_ref, artifact_hash, artifact_size,
                   source_kind, extraction_method, extractor_version, original_filename, mime_type
      OR DELETE ON manuscript_source_arrivals
  FOR EACH ROW EXECUTE FUNCTION pt3_refuse_source_mutation();

-- ═══════════════════════════════════════════════════════════════════════════════
-- 5. Privilege reduction (§VI) — the boundary itself
-- ═══════════════════════════════════════════════════════════════════════════════

-- HISTORICAL SOURCE: arrival creation may remain with ordinary import authority (§II) — an arrival
-- is self-witnessing, carrying its own bytes, hashes and extractor. It may never be altered or
-- destroyed except through the seam.
REVOKE UPDATE, DELETE ON manuscript_source_arrivals FROM maia_app;
GRANT SELECT, INSERT ON manuscript_source_arrivals TO maia_app;
-- Claim bookkeeping only. A column grant also refuses a statement that MIXES this column with a
-- forbidden one, so bookkeeping cannot carry content (§VI).
GRANT UPDATE (manuscript_id) ON manuscript_source_arrivals TO maia_app;

-- SOURCE REPRESENTATION: creation moves behind the seam (§II), because only the seam can establish
-- representation and custody as one act.
REVOKE INSERT, UPDATE, DELETE ON manuscript_sections FROM maia_app;
GRANT SELECT ON manuscript_sections TO maia_app;

REVOKE INSERT, UPDATE, DELETE ON manuscript_source_representations FROM maia_app;
GRANT SELECT ON manuscript_source_representations TO maia_app;

-- Currency is authored by acts, and acts are authored by the seam. An application that could insert
-- acts directly could declare currency without performing the act.
REVOKE INSERT, UPDATE, DELETE ON source_lifecycle_acts FROM maia_app;
GRANT SELECT ON source_lifecycle_acts TO maia_app;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 6. The governed seam (§II, §V, §VI)
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- SECURITY DEFINER, owned by the migration authority, EXECUTE granted to maia_app. Every function
-- pins search_path — a SECURITY DEFINER function that resolves names through the caller's path is
-- a privilege escalation, not a seam.
--
-- Each function is named for the act it performs. That is the mechanism behind §II's requirement
-- that erasure be "unmistakably commissioned as erasure": an act that had to be named in order to
-- happen cannot be mistaken for a different act afterwards.

CREATE OR REPLACE FUNCTION source_assert_owner(p_manuscript_id uuid, p_member_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM member_manuscripts WHERE id = p_manuscript_id AND member_id = p_member_id
  ) THEN
    RAISE EXCEPTION 'PT-3 seam: manuscript % is not this member''s', p_manuscript_id;
  END IF;
END $$;

-- Writes one representation and its sections. Private: every public entry point below routes
-- through it, so "representation + custody, or neither" has ONE implementation to be true in.
CREATE OR REPLACE FUNCTION source_write_representation(
  p_manuscript_id uuid, p_member_id uuid, p_arrival_id uuid, p_sections jsonb)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE rep_id uuid; claimed int; sec jsonb; idx int := 0;
BEGIN
  PERFORM source_assert_owner(p_manuscript_id, p_member_id);

  IF p_arrival_id IS NULL THEN
    RAISE EXCEPTION 'PT-3 seam: a representation may not be created without a Historical Source';
  END IF;
  IF p_sections IS NULL OR jsonb_array_length(p_sections) = 0 THEN
    RAISE EXCEPTION 'PT-3 seam: a representation must contain at least one section';
  END IF;

  -- Custody FIRST, and the claim is authoritative rather than advisory: zero rows means the arrival
  -- is not this member's or is already claimed, and nothing is created. This is the repair of the
  -- representation-before-claim ordering defect (import route, line 232 before 257).
  UPDATE manuscript_source_arrivals
     SET manuscript_id = p_manuscript_id
   WHERE id = p_arrival_id AND member_id = p_member_id
     AND (manuscript_id IS NULL OR manuscript_id = p_manuscript_id);
  GET DIAGNOSTICS claimed = ROW_COUNT;
  IF claimed = 0 THEN
    RAISE EXCEPTION 'PT-3 seam: custody could not be established for arrival % — nothing created',
      p_arrival_id;
  END IF;

  INSERT INTO manuscript_source_representations (manuscript_id, arrival_id, custody)
  VALUES (p_manuscript_id, p_arrival_id, 'source_custodied')
  RETURNING id INTO rep_id;

  FOR sec IN SELECT * FROM jsonb_array_elements(p_sections) LOOP
    INSERT INTO manuscript_sections
      (manuscript_id, representation_id, position, heading, body, heading_depth, heading_signal)
    VALUES (
      p_manuscript_id, rep_id, idx,
      NULLIF(sec->>'heading',''), sec->>'body',
      (sec->>'heading_depth')::int, NULLIF(sec->>'heading_signal',''));
    idx := idx + 1;
  END LOOP;

  UPDATE member_manuscripts SET source_custody = 'source_custodied'
   WHERE id = p_manuscript_id AND member_id = p_member_id;

  RETURN rep_id;
END $$;

-- EXTRACTION — the first representation of an arrival (§V).
CREATE OR REPLACE FUNCTION source_extract(
  p_manuscript_id uuid, p_member_id uuid, p_arrival_id uuid, p_sections jsonb)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE rep_id uuid;
BEGIN
  rep_id := source_write_representation(p_manuscript_id, p_member_id, p_arrival_id, p_sections);
  INSERT INTO source_lifecycle_acts (manuscript_id, act, arrival_id, operative, actor_member_id)
    VALUES (p_manuscript_id, 'arrival', p_arrival_id, true, p_member_id);
  INSERT INTO source_lifecycle_acts (manuscript_id, act, representation_id, operative, actor_member_id)
    VALUES (p_manuscript_id, 'extraction', rep_id, true, p_member_id);
  RETURN rep_id;
END $$;

-- RE-EXTRACTION — a new representation from the SAME Historical Source. §V: it becomes operative
-- "without altering the previous representation", so the previous is left byte-identical and merely
-- ceases to be operative.
CREATE OR REPLACE FUNCTION source_re_extract(
  p_manuscript_id uuid, p_member_id uuid, p_arrival_id uuid, p_sections jsonb, p_reason text DEFAULT NULL)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE rep_id uuid; prior uuid;
BEGIN
  prior := source_operative_representation(p_manuscript_id);
  rep_id := source_write_representation(p_manuscript_id, p_member_id, p_arrival_id, p_sections);

  IF prior IS NOT NULL THEN
    INSERT INTO source_lifecycle_acts
      (manuscript_id, act, representation_id, operative, actor_member_id, reason)
      VALUES (p_manuscript_id, 're_extraction', prior, false, p_member_id, p_reason);
  END IF;
  INSERT INTO source_lifecycle_acts
    (manuscript_id, act, representation_id, operative, actor_member_id, reason)
    VALUES (p_manuscript_id, 're_extraction', rep_id, true, p_member_id, p_reason);
  RETURN rep_id;
END $$;

-- REPLACEMENT — a NEW Historical Source lineage becomes operative. §V: the former lineage remains
-- historical unless separately erased, so nothing about it is rewritten here.
CREATE OR REPLACE FUNCTION source_replace_lineage(
  p_manuscript_id uuid, p_member_id uuid, p_new_arrival_id uuid, p_sections jsonb,
  p_reason text DEFAULT NULL)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE rep_id uuid; prior_rep uuid; prior_arr uuid;
BEGIN
  prior_rep := source_operative_representation(p_manuscript_id);
  prior_arr := source_operative_arrival(p_manuscript_id);
  rep_id := source_write_representation(p_manuscript_id, p_member_id, p_new_arrival_id, p_sections);

  IF prior_arr IS NOT NULL AND prior_arr <> p_new_arrival_id THEN
    INSERT INTO source_lifecycle_acts
      (manuscript_id, act, arrival_id, operative, actor_member_id, reason)
      VALUES (p_manuscript_id, 'replacement', prior_arr, false, p_member_id, p_reason);
  END IF;
  IF prior_rep IS NOT NULL THEN
    INSERT INTO source_lifecycle_acts
      (manuscript_id, act, representation_id, operative, actor_member_id, reason)
      VALUES (p_manuscript_id, 'replacement', prior_rep, false, p_member_id, p_reason);
  END IF;
  INSERT INTO source_lifecycle_acts
    (manuscript_id, act, arrival_id, operative, actor_member_id, reason)
    VALUES (p_manuscript_id, 'replacement', p_new_arrival_id, true, p_member_id, p_reason);
  INSERT INTO source_lifecycle_acts
    (manuscript_id, act, representation_id, operative, actor_member_id, reason)
    VALUES (p_manuscript_id, 'replacement', rep_id, true, p_member_id, p_reason);
  RETURN rep_id;
END $$;

-- WITHDRAWAL — ceases to be operative WITHOUT being destroyed (§V). One row; no content touched.
CREATE OR REPLACE FUNCTION source_withdraw_representation(
  p_manuscript_id uuid, p_member_id uuid, p_representation_id uuid, p_reason text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN
  PERFORM source_assert_owner(p_manuscript_id, p_member_id);
  IF NOT EXISTS (SELECT 1 FROM manuscript_source_representations
                  WHERE id = p_representation_id AND manuscript_id = p_manuscript_id) THEN
    RAISE EXCEPTION 'PT-3 seam: representation % does not belong to this Work', p_representation_id;
  END IF;
  INSERT INTO source_lifecycle_acts
    (manuscript_id, act, representation_id, operative, actor_member_id, reason)
    VALUES (p_manuscript_id, 'withdrawal', p_representation_id, false, p_member_id, p_reason);
END $$;

-- ERASURE — explicitly commissioned destruction (§V). Records the act, then opens a
-- TRANSACTION-LOCAL window the refusal trigger honours. The window closes with the transaction,
-- so nothing later in the request inherits erasure authority, and a cascade with no act named is
-- still refused.
CREATE OR REPLACE FUNCTION source_commission_erasure(
  p_manuscript_id uuid, p_member_id uuid, p_reason text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE r record;
BEGIN
  PERFORM source_assert_owner(p_manuscript_id, p_member_id);

  FOR r IN SELECT id FROM manuscript_source_representations WHERE manuscript_id = p_manuscript_id LOOP
    INSERT INTO source_lifecycle_acts
      (manuscript_id, act, representation_id, operative, actor_member_id, reason)
      VALUES (p_manuscript_id, 'erasure', r.id, false, p_member_id, p_reason);
  END LOOP;
  FOR r IN SELECT id FROM manuscript_source_arrivals WHERE manuscript_id = p_manuscript_id LOOP
    INSERT INTO source_lifecycle_acts
      (manuscript_id, act, arrival_id, operative, actor_member_id, reason)
      VALUES (p_manuscript_id, 'erasure', r.id, false, p_member_id, p_reason);
  END LOOP;

  PERFORM set_config('maia.source_lifecycle_act', 'erasure', true);
END $$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 7. Derived currency (§IV) — replaces query-order-as-currency
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- Before this, "which arrival is operative" was decided by verifyCustody's ORDER BY created_at ASC:
-- an implementation contingency standing in for a law. Currency is now the answer the lifecycle
-- history gives. A subject's state is whatever its OWN latest act says; the operative subject is
-- the most recent one whose latest act left it operative.

CREATE OR REPLACE FUNCTION source_operative_representation(p_manuscript_id uuid)
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
  SELECT representation_id FROM (
    SELECT DISTINCT ON (representation_id) representation_id, operative, occurred_at, id
      FROM source_lifecycle_acts
     WHERE manuscript_id = p_manuscript_id AND representation_id IS NOT NULL
     ORDER BY representation_id, occurred_at DESC, id DESC
  ) latest
  WHERE operative
  ORDER BY occurred_at DESC, id DESC
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION source_operative_arrival(p_manuscript_id uuid)
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
  SELECT arrival_id FROM (
    SELECT DISTINCT ON (arrival_id) arrival_id, operative, occurred_at, id
      FROM source_lifecycle_acts
     WHERE manuscript_id = p_manuscript_id AND arrival_id IS NOT NULL
     ORDER BY arrival_id, occurred_at DESC, id DESC
  ) latest
  WHERE operative
  ORDER BY occurred_at DESC, id DESC
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION source_extract(uuid, uuid, uuid, jsonb) TO maia_app;
GRANT EXECUTE ON FUNCTION source_re_extract(uuid, uuid, uuid, jsonb, text) TO maia_app;
GRANT EXECUTE ON FUNCTION source_replace_lineage(uuid, uuid, uuid, jsonb, text) TO maia_app;
GRANT EXECUTE ON FUNCTION source_withdraw_representation(uuid, uuid, uuid, text) TO maia_app;
GRANT EXECUTE ON FUNCTION source_commission_erasure(uuid, uuid, text) TO maia_app;
GRANT EXECUTE ON FUNCTION source_operative_representation(uuid) TO maia_app;
GRANT EXECUTE ON FUNCTION source_operative_arrival(uuid) TO maia_app;

-- Not granted to maia_app: source_write_representation and source_assert_owner are internals.
REVOKE ALL ON FUNCTION source_write_representation(uuid, uuid, uuid, jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION source_assert_owner(uuid, uuid) FROM PUBLIC;

-- Backfill lifecycle history for representations created by the §2 backfill, so currency is
-- derivable for existing Works from the moment this migration lands. Custody-bearing rows only:
-- a legacy representation with no arrival gets an extraction act naming it operative, because it
-- IS what those Works are working from — the honest record, not a manufactured custody claim.
INSERT INTO source_lifecycle_acts (manuscript_id, act, representation_id, operative, actor_member_id, reason)
SELECT r.manuscript_id, 'extraction', r.id, true, m.member_id, 'backfilled at PT-3 enforcement'
  FROM manuscript_source_representations r
  JOIN member_manuscripts m ON m.id = r.manuscript_id
 WHERE NOT EXISTS (
   SELECT 1 FROM source_lifecycle_acts a WHERE a.representation_id = r.id);

INSERT INTO source_lifecycle_acts (manuscript_id, act, arrival_id, operative, actor_member_id, reason)
SELECT r.manuscript_id, 'arrival', r.arrival_id, true, m.member_id, 'backfilled at PT-3 enforcement'
  FROM manuscript_source_representations r
  JOIN member_manuscripts m ON m.id = r.manuscript_id
 WHERE r.arrival_id IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM source_lifecycle_acts a WHERE a.arrival_id = r.arrival_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 8. Position uniqueness belongs to the representation, not the Work
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- FOUND WHILE BUILDING, and it is the reason re-extraction could not previously exist at all:
-- manuscript_sections was UNIQUE (manuscript_id, position). That constraint silently encoded
-- "one representation per Work" — a second representation's positions collided with the first's,
-- so §V's re-extraction and replacement were unrepresentable, not merely unimplemented.
--
-- Position is meaningful WITHIN a cut. Two representations of the same arrival each legitimately
-- have a section at position 0. The constraint moves to where the meaning is.
--
-- Reads scoped by manuscript_id are correspondingly scoped to the operative representation, with
-- COALESCE falling back to prior behaviour where no lifecycle act is known — a Work is never
-- hidden from its author by an absent record.

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint
              WHERE conname = 'manuscript_sections_manuscript_id_position_key') THEN
    ALTER TABLE manuscript_sections DROP CONSTRAINT manuscript_sections_manuscript_id_position_key;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS manuscript_sections_representation_position_key
  ON manuscript_sections (representation_id, position);
