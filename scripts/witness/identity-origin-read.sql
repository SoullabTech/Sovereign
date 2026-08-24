-- AUTH-IDENTITY-ORIGIN-01 · Part A — database chronology. Read-only.
--
-- QUESTION
--   What mechanism created member B on 2026-02-03 18:05:28? Not "prove magic link created B".
--
-- WHY THE PASSKEY PREFIX IS THE DECISIVE FIELD
--   Every member-minting path in the codebase stamps a distinct passkey prefix:
--       GOOGLE-<12 hex>      app/api/auth/signin/google/callback   (+ native-callback)
--       APPLE-<12 hex>       app/api/auth/signin/apple/callback    (+ native-callback)
--       ML-<epoch>-<6>       app/api/members/enter                 (email + password)
--       NOWWHAT-<token>      app/api/now-what/register
--       SOULLAB-<6>          app/api/team/invite/[token]/register
--   So B's own passkey prefix names its creating path directly — stronger than any timestamp
--   correlation. Query 1 reads it.
--
-- DATA DISCIPLINE
--   The two candidates are read in full. Every other member appears ONLY as a uuid prefix with
--   derived flags: no other member's username, email, or name is selected. Passkeys are shown
--   as their prefix only, never the secret body.
--
-- Run:
--   git show <SHA>:scripts/witness/identity-origin-read.sql | \
--   ssh soullab@minisforum "docker exec -i maia-postgres psql -U soullab -d maia_consciousness \
--     -v a=ce284751-e457-42f6-89b6-bc07d0876682 -v b=49ae4717-2b3a-4189-b25d-2bef95b1a45a"

\pset pager off
\pset format aligned
\set ON_ERROR_STOP 0
\set VERBOSITY terse

BEGIN;
SET TRANSACTION READ ONLY;
SET LOCAL statement_timeout = '60s';

\echo ''
\echo '════ 1. DECISIVE — which minting path stamped each candidate ════'
SAVEPOINT p;
SELECT CASE WHEN id = :'a'::uuid THEN 'A (canonical)' ELSE 'B (legacy)' END AS candidate,
       split_part(passkey, '-', 1)                     AS passkey_prefix,
       length(passkey)                                 AS passkey_len,
       username, onboarded, onboarding_step, created_at, last_sign_in,
       (password_hash IS NOT NULL AND password_hash <> '') AS has_password
  FROM members WHERE id IN (:'a'::uuid, :'b'::uuid) ORDER BY created_at;
ROLLBACK TO SAVEPOINT p; RELEASE SAVEPOINT p;

\echo ''
\echo '════ 2. MAGIC-LINK CHRONOLOGY FOR B — earliest surviving token vs member creation ════'
\echo '(earliest SURVIVING token is not "first token ever" unless retention is complete)'
SAVEPOINT p;
SELECT count(*) AS tokens, min(created_at) AS earliest, max(created_at) AS latest,
       min(created_at) - (SELECT created_at FROM members WHERE id = :'b'::uuid) AS earliest_minus_member_created,
       count(*) FILTER (WHERE expires_at < now()) AS expired_still_present
  FROM magic_link_tokens WHERE member_id = :'b'::uuid;
ROLLBACK TO SAVEPOINT p; RELEASE SAVEPOINT p;

\echo ''
\echo '════ 2b. RETENTION COMPLETENESS — do expired tokens survive database-wide? ════'
\echo '(if expired rows persist, no cleanup is pruning history and chronology can be trusted;'
\echo ' if none survive, earliest-surviving proves nothing about earliest-ever)'
SAVEPOINT p;
SELECT count(*) AS all_tokens, count(*) FILTER (WHERE expires_at < now()) AS expired_present,
       min(created_at) AS earliest_anywhere
  FROM magic_link_tokens;
ROLLBACK TO SAVEPOINT p; RELEASE SAVEPOINT p;

\echo ''
\echo '════ 3. DOES THE GENERATED-USERNAME SHAPE RECUR? (others by uuid prefix only) ════'
\echo '(shape = email local-part + exactly 4 hex chars — the OAuth callback generator)'
SAVEPOINT p;
SELECT split_part(passkey, '-', 1)                     AS passkey_prefix,
       count(*)                                        AS members,
       count(*) FILTER (WHERE username ~ '[0-9a-f]{4}$') AS username_ends_4hex,
       count(*) FILTER (WHERE onboarded)               AS onboarded,
       count(*) FILTER (WHERE last_sign_in IS NULL)    AS never_signed_in,
       min(created_at) AS earliest, max(created_at) AS latest
  FROM members GROUP BY 1 ORDER BY 2 DESC;
ROLLBACK TO SAVEPOINT p; RELEASE SAVEPOINT p;

\echo ''
\echo '════ 3b. THE COHORT B BELONGS TO — OAuth-stamped members, no member named ════'
SAVEPOINT p;
SELECT left(m.id::text, 8) || '…'                      AS member_prefix,
       (m.id = :'b'::uuid)                             AS is_candidate_b,
       split_part(m.passkey, '-', 1)                   AS passkey_prefix,
       m.onboarded, m.last_sign_in IS NULL             AS never_signed_in,
       m.created_at,
       EXISTS (SELECT 1 FROM oauth_accounts o WHERE o.member_id = m.id) AS has_oauth_link
  FROM members m
 WHERE split_part(m.passkey, '-', 1) IN ('GOOGLE', 'APPLE')
 ORDER BY m.created_at;
ROLLBACK TO SAVEPOINT p; RELEASE SAVEPOINT p;

\echo ''
\echo '════ 4. THE PREDICTION THIS TRACE MAKES ════'
\echo 'If B was minted by the OAuth callback whose oauth_accounts INSERT then failed on the'
\echo 'missing profile_data column, then: B.passkey_prefix = GOOGLE, B has no password,'
\echo 'B.last_sign_in IS NULL (that route never writes it), and other GOOGLE-stamped members'
\echo 'created before 2026-07-06 should ALSO lack an oauth link. Query 3b tests the last one.'

ROLLBACK;
\echo ''
\echo 'NO WRITES WERE PERFORMED — READ ONLY transaction, ended in ROLLBACK.'
\echo 'No passkey body, token value, or other member identifier was selected.'
