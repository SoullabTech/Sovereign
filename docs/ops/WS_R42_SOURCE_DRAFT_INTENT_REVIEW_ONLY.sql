-- R42 REVIEW ONLY: never migrate the production database.
-- Fictional Source→initial Draft link with PRE-DRAFT immutable intent.
-- No manuscript text, sections, original filename, prompts, raw key or key token in SQL.
DO $r42$ BEGIN
 IF current_setting('server_version_num')::int / 10000 <> 16
 THEN RAISE EXCEPTION 'r42_exact_pg16_required'; END IF;
END $r42$;

CREATE TABLE writers_studio_r42_held_start_intents(
 work_id uuid PRIMARY KEY REFERENCES member_manuscripts(id) ON DELETE RESTRICT,
 member_id uuid NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
 arrival_id uuid NOT NULL UNIQUE,
 claim_id uuid NOT NULL UNIQUE,
 source_manifest_id uuid NOT NULL UNIQUE REFERENCES writers_studio_r32_held_originals(id) ON DELETE RESTRICT,
 source_pair_sha256 char(64) NOT NULL CHECK (source_pair_sha256 ~ '^[a-f0-9]{64}$'),
 draft_key_id uuid NOT NULL,
 draft_plan_hmac char(64) NOT NULL CHECK (draft_plan_hmac ~ '^[a-f0-9]{64}$'),
 state text NOT NULL DEFAULT 'held_pre_draft_intent' CHECK(state='held_pre_draft_intent'),
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(work_id,member_id,arrival_id,source_manifest_id,source_pair_sha256,draft_plan_hmac)
);
CREATE TABLE writers_studio_r42_held_start_links(
 work_id uuid PRIMARY KEY REFERENCES writers_studio_r42_held_start_intents(work_id) ON DELETE RESTRICT,
 member_id uuid NOT NULL,
 arrival_id uuid NOT NULL,
 source_manifest_id uuid NOT NULL,
 source_pair_sha256 char(64) NOT NULL,
 draft_plan_hmac char(64) NOT NULL,
 draft_generation bigint NOT NULL DEFAULT 1 CHECK(draft_generation=1),
 draft_cipher_sha256 char(64) NOT NULL CHECK(draft_cipher_sha256 ~ '^[a-f0-9]{64}$'),
 state text NOT NULL DEFAULT 'held_source_draft_bound' CHECK(state='held_source_draft_bound'),
 created_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(work_id,member_id,arrival_id,source_manifest_id,source_pair_sha256,draft_plan_hmac)
   REFERENCES writers_studio_r42_held_start_intents(
     work_id,member_id,arrival_id,source_manifest_id,source_pair_sha256,draft_plan_hmac
   ) ON DELETE RESTRICT,
 FOREIGN KEY(work_id,draft_generation)
   REFERENCES writers_studio_r35_draft_versions(work_id,generation) ON DELETE RESTRICT
);
CREATE FUNCTION r42_source_draft_intent_guard() RETURNS trigger
LANGUAGE plpgsql AS $guard$
BEGIN
 IF TG_OP<>'INSERT' THEN RAISE EXCEPTION 'r42_source_draft_intent_immutable'; END IF;
 IF NOT EXISTS(
   SELECT 1 FROM writers_studio_r35_held_observations o
   JOIN writers_studio_r35_held_intents i ON i.intent_id=o.intent_id
   JOIN writers_studio_r32_held_originals s ON s.id=o.work_manifest_id
   JOIN member_manuscripts w ON w.id=i.manuscript_id AND w.member_id=i.member_id
   WHERE i.claim_id=NEW.claim_id AND i.member_id=NEW.member_id
     AND i.manuscript_id=NEW.work_id AND i.arrival_id=NEW.arrival_id
     AND o.work_manifest_id=NEW.source_manifest_id
     AND o.pair_sha256=NEW.source_pair_sha256
     AND s.pair_sha256=NEW.source_pair_sha256
     AND s.key_id<>NEW.draft_key_id
 ) THEN RAISE EXCEPTION 'r42_source_intent_not_verified'; END IF;
 RETURN NEW;
END $guard$;
CREATE TRIGGER r42_immutable_draft_start_intent
 BEFORE INSERT OR UPDATE OR DELETE ON writers_studio_r42_held_start_intents
 FOR EACH ROW EXECUTE FUNCTION r42_source_draft_intent_guard();
CREATE FUNCTION r42_source_draft_link_guard() RETURNS trigger
LANGUAGE plpgsql AS $guard$
BEGIN
 IF TG_OP<>'INSERT' THEN RAISE EXCEPTION 'r42_source_draft_link_immutable'; END IF;
 IF NOT EXISTS(
  SELECT 1 FROM writers_studio_r35_draft_versions v
  JOIN writers_studio_r35_draft_heads h
   ON h.work_id=v.work_id AND h.member_id=v.member_id
  WHERE v.work_id=NEW.work_id AND v.member_id=NEW.member_id
    AND v.generation=1 AND v.action='start'
    AND v.cipher_sha256=NEW.draft_cipher_sha256
 ) THEN RAISE EXCEPTION 'r42_unverified_initial_draft_ciphertext'; END IF;
 RETURN NEW;
END $guard$;
CREATE TRIGGER r42_immutable_source_draft_link
 BEFORE INSERT OR UPDATE OR DELETE ON writers_studio_r42_held_start_links
 FOR EACH ROW EXECUTE FUNCTION r42_source_draft_link_guard();

REVOKE ALL ON writers_studio_r42_held_start_intents FROM PUBLIC;
REVOKE ALL ON writers_studio_r42_held_start_links FROM PUBLIC;
COMMENT ON TABLE writers_studio_r42_held_start_intents IS
 'R42 disposable test only. HMAC of exact section plan under fabricated Work draft key.';
COMMENT ON TABLE writers_studio_r42_held_start_links IS
 'R42 disposable test only. Immutable ciphertext Source-to-initial-Draft link, no author text.';
