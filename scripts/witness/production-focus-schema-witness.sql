-- FOCUS · LIVE SCHEMA WITNESS — read-only.
--
--   ⭐⭐ What schema actually exists in production today?
--
-- The repository can only show what the 2026-09-01 baseline SNAPSHOT contained.
-- That is a reading at a time, not a claim about now. This establishes the live
-- fact, so migration eligibility is decided on evidence rather than on inference
-- from a snapshot.
--
-- ⛔ READ-ONLY, STRUCTURALLY. Postgres itself enforces it: the whole witness runs
-- inside `SET TRANSACTION READ ONLY` and ends in ROLLBACK. A stray write would be
-- refused by the server, not merely absent from the script.
--
-- ⛔ It changes nothing and decides nothing. If the relations are missing, that is
-- a finding — production migration is a separate governed act, and the migration
-- must NOT be applied merely to manufacture the conditions for a witness.
--
--   ssh soullab@minisforum 'docker exec -i maia-postgres psql -U soullab \
--     maia_consciousness' < scripts/witness/production-focus-schema-witness.sql

\pset pager off
\set ON_ERROR_STOP on

BEGIN;
SET TRANSACTION READ ONLY;

\echo '── 1 · the four subject relations'
SELECT r.relation,
       (to_regclass('public.' || r.relation) IS NOT NULL) AS present
  FROM (VALUES ('member_manuscripts'), ('manuscript_sections'),
               ('manuscript_working_drafts'), ('manuscript_draft_sections')) AS r(relation);

\echo '── 2 · the addressability gate column'
SELECT 'manuscript_working_drafts.section_addressable_at' AS column,
       EXISTS (SELECT 1 FROM information_schema.columns
                WHERE table_schema = 'public'
                  AND table_name = 'manuscript_working_drafts'
                  AND column_name = 'section_addressable_at') AS present;

\echo '── 3 · the round-trip invariant the assembler relies on'
SELECT 'manuscript_working_drafts_round_trip()' AS trigger_fn,
       EXISTS (SELECT 1 FROM pg_proc
                WHERE proname = 'manuscript_working_drafts_round_trip') AS present;

\echo '── 4 · ledger: is the genesis migration recorded as applied?'
SELECT filename, applied_at
  FROM schema_migrations
 WHERE filename LIKE '%manuscript_draft_sections%'
    OR filename LIKE '20260830%'
 ORDER BY filename;

\echo '── 5 · ledger tip (how far ahead or behind production is)'
SELECT count(*) AS ledger_entries FROM schema_migrations;
SELECT filename, applied_at FROM schema_migrations ORDER BY applied_at DESC NULLS LAST LIMIT 5;

\echo '── 6 · is there a Work a witness could actually use? (counts only, no content)'
SELECT
  (SELECT count(*) FROM member_manuscripts) AS manuscripts,
  (SELECT count(*) FROM manuscript_working_drafts) AS drafts,
  (SELECT count(*) FROM manuscript_working_drafts
    WHERE section_addressable_at IS NOT NULL)      AS addressable_drafts,
  (SELECT count(*) FROM manuscript_draft_sections) AS draft_sections;

ROLLBACK;
\echo '── witness complete · nothing was written'
