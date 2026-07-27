-- Real-Postgres proof of the increment-1 governance schema + authorization
-- predicate. Runs entirely inside a transaction and ROLLS BACK — zero persistent
-- mutation to the database (transactional DDL: the ALTERs are undone too).
--
-- Run:  psql "postgresql://soullab@localhost:5432/maia_consciousness" \
--          -f scripts/repro/governed_retrieval_sql_proof.sql
--
-- Proves: (a) the additive migration applies; (b) a member item with no
-- usage_authority defaults to only_when_i_ask (acceptance test 1); (c) the
-- authorization predicate — identical to authorizationPredicateSql() in
-- lib/library/governedRetrieval.ts — admits exactly the right rows for each
-- retrieval purpose (acceptance tests 2–6).

\set ON_ERROR_STOP on
BEGIN;

-- (a) apply the additive migration inside the transaction
\i database/migrations/20260627000001_wisdom_governance_axes.sql

-- a viewer that satisfies the owner_id FK (any existing member)
SELECT id AS viewer FROM members ORDER BY created_at LIMIT 1 \gset

-- seed: one platform source + member sources at each authority + one with the
-- usage_authority column OMITTED (to prove the default)
INSERT INTO library_sources (type, title, file_path, checksum, ingestion_status, scope, owner_type)
  VALUES ('book', 'PLATFORM_CANON', 'p0', 'sqlproof_platform', 'completed', 'platform', 'platform');

INSERT INTO library_sources (type, title, file_path, checksum, ingestion_status, scope, owner_type, owner_id, visibility, usage_authority) VALUES
  ('teaching', 'M_store_only',      'm1', 'sqlproof_store',   'completed', 'member', 'member', :'viewer', 'private', 'store_only'),
  ('teaching', 'M_only_when_i_ask', 'm2', 'sqlproof_ask',     'completed', 'member', 'member', :'viewer', 'private', 'only_when_i_ask'),
  ('teaching', 'M_reflect',         'm3', 'sqlproof_reflect', 'completed', 'member', 'member', :'viewer', 'private', 'reflect_with_me'),
  ('teaching', 'M_use_in_guidance', 'm4', 'sqlproof_guide',   'completed', 'member', 'member', :'viewer', 'private', 'use_in_guidance');

-- usage_authority OMITTED → must default to only_when_i_ask (acceptance test 1)
INSERT INTO library_sources (type, title, file_path, checksum, ingestion_status, scope, owner_type, owner_id, visibility)
  VALUES ('teaching', 'M_DEFAULTED', 'm5', 'sqlproof_default', 'completed', 'member', 'member', :'viewer', 'private');

\echo '--- TEST 1: a kept member item with no usage_authority defaults to only_when_i_ask ---'
SELECT title, usage_authority FROM library_sources WHERE checksum = 'sqlproof_default';

-- The authorization predicate, parameterized by purpose minimum rank.
-- :minrank = 3 guidance | 2 reflection | 1 explicit_recall
\echo '--- GUIDANCE (min rank 3): expect PLATFORM_CANON + M_use_in_guidance only ---'
\set minrank 3
SELECT title, usage_authority FROM library_sources s
 WHERE s.checksum LIKE 'sqlproof_%'
   AND s.ingestion_status = 'completed'
   AND ( s.scope = 'platform'
         OR ( s.scope = 'member' AND s.owner_id = :'viewer'
              AND (CASE s.usage_authority WHEN 'use_in_guidance' THEN 3 WHEN 'reflect_with_me' THEN 2 WHEN 'only_when_i_ask' THEN 1 ELSE 0 END) >= :minrank ) )
 ORDER BY title;

\echo '--- REFLECTION (min rank 2): expect PLATFORM_CANON + M_reflect + M_use_in_guidance ---'
\set minrank 2
SELECT title, usage_authority FROM library_sources s
 WHERE s.checksum LIKE 'sqlproof_%'
   AND s.ingestion_status = 'completed'
   AND ( s.scope = 'platform'
         OR ( s.scope = 'member' AND s.owner_id = :'viewer'
              AND (CASE s.usage_authority WHEN 'use_in_guidance' THEN 3 WHEN 'reflect_with_me' THEN 2 WHEN 'only_when_i_ask' THEN 1 ELSE 0 END) >= :minrank ) )
 ORDER BY title;

\echo '--- EXPLICIT_RECALL (min rank 1): expect everything but M_store_only (incl. M_DEFAULTED) ---'
\set minrank 1
SELECT title, usage_authority FROM library_sources s
 WHERE s.checksum LIKE 'sqlproof_%'
   AND s.ingestion_status = 'completed'
   AND ( s.scope = 'platform'
         OR ( s.scope = 'member' AND s.owner_id = :'viewer'
              AND (CASE s.usage_authority WHEN 'use_in_guidance' THEN 3 WHEN 'reflect_with_me' THEN 2 WHEN 'only_when_i_ask' THEN 1 ELSE 0 END) >= :minrank ) )
 ORDER BY title;

ROLLBACK;
\echo '--- ROLLED BACK: no persistent change to the database ---'
