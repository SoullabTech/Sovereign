-- R20 REVIEW ONLY. Run on a disposable fictional PostgreSQL 16 fixture.
-- Not a production migration; this file is intentionally outside
-- database/migrations.  An inactive, NOLOGIN role is a refusal/negative-control
-- proof, NOT a real writer service or independently trusted custody authority.
DO $r20$
BEGIN
  IF current_setting('server_version_num')::int / 10000 <> 16 THEN
    RAISE EXCEPTION 'r20_pg16_required';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'ws_beta_r20_held_restricted') THEN
    RAISE EXCEPTION 'r20_role_already_exists_refuse_reuse';
  END IF;
  CREATE ROLE ws_beta_r20_held_restricted
    NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOINHERIT;
END
$r20$;

-- No right to read member content, original file metadata, drafts, revisions,
-- or even raw held ciphertext references. There is no trusted service to call.
-- An eventual approved service must use an independent, exact-member scoped
-- server authority with a separate audited migration.
REVOKE ALL PRIVILEGES ON TABLE manuscript_source_arrivals,
  member_manuscripts, manuscript_sections, manuscript_working_drafts,
  manuscript_draft_sections, manuscript_revision_offers,
  manuscript_revision_authorizations,
  writers_studio_r16_held_pairs
  FROM ws_beta_r20_held_restricted;
REVOKE CREATE ON SCHEMA public FROM ws_beta_r20_held_restricted;

COMMENT ON ROLE ws_beta_r20_held_restricted IS
  'R20 fixture-only NOLOGIN deny-all writer storage proof. Not member admission authority. No live members, Source or keys.';
