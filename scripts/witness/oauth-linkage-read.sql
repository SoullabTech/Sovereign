-- OAUTH LINKAGE READ — narrow, read-only. Step 2 of the identity investigation.
--
-- WHY
--   The census found oauth_accounts A=0 / B=1: the legacy identity is OAuth-linked and the
--   canonical one is not. This reads that single linkage to establish the account-link
--   mechanism. Run it only AFTER the repaired census is stable.
--
-- WHAT IT ESTABLISHES
--   member_id, provider, linkage creation/update time, whether a corresponding linkage exists
--   for the canonical candidate, and how the linkage time correlates with each member's
--   creation time.
--
-- WHAT IT CANNOT ESTABLISH — stated so the output is not over-read
--   That a Google login CREATED the legacy member rather than linking to the canonical one.
--   Timestamps can strengthen or weaken that reading; they cannot prove it. Proving it needs
--   the code path that handles "OAuth identity not found" at sign-in, which is a source trace,
--   not a query. The honest ladder:
--       KNOWN        B has one OAuth linkage; A has none.
--       IF provider  = google -> B is Google-linked.
--       NOT PROVEN   Google login minted B rather than linking to A.
--
-- SECRETS ARE NEVER SELECTED
--   access_token, refresh_token and token_expires_at are reported ONLY as booleans (present or
--   not). provider_user_id is a stable account identifier, so only its first 6 characters and
--   its length are shown — enough to tell two linkages apart, not enough to republish the
--   subject id. No other member's row is read: aggregate counts only.
--
-- Run:
--   git show origin/claude/member-identity-portrait-split-y4zhaq:scripts/witness/oauth-linkage-read.sql | \
--   ssh soullab@minisforum "docker exec -i maia-postgres psql -U soullab -d maia_consciousness \
--     -v a=ce284751-e457-42f6-89b6-bc07d0876682 \
--     -v b=49ae4717-2b3a-4189-b25d-2bef95b1a45a"

\pset pager off
\pset format aligned
\set ON_ERROR_STOP 0
\set VERBOSITY terse

BEGIN;
SET TRANSACTION READ ONLY;
SET LOCAL statement_timeout = '60s';

\echo ''
\echo '════ 1. OAUTH LINKAGES HELD BY THE TWO CANDIDATES ════'
\echo '(absence of a row for a candidate IS the finding for that candidate)'
SAVEPOINT p;
SELECT o.member_id::text,
       CASE WHEN o.member_id = :'a'::uuid THEN 'A (canonical)' ELSE 'B (legacy)' END AS candidate,
       o.provider,
       left(o.provider_user_id, 6) || '…'        AS provider_user_id_prefix,
       length(o.provider_user_id)                AS provider_user_id_len,
       (o.email IS NOT NULL)                     AS provider_email_present,
       (o.name  IS NOT NULL)                     AS provider_name_present,
       (o.access_token  IS NOT NULL)             AS has_access_token,
       (o.refresh_token IS NOT NULL)             AS has_refresh_token,
       o.created_at, o.updated_at
  FROM oauth_accounts o
 WHERE o.member_id IN (:'a'::uuid, :'b'::uuid)
 ORDER BY o.created_at;
ROLLBACK TO SAVEPOINT p; RELEASE SAVEPOINT p;

\echo ''
\echo '════ 2. TIME CORRELATION — member creation vs linkage creation ════'
\echo '(a linkage created at the same instant as the member is consistent with minting;'
\echo ' a linkage created long after is consistent with linking. Neither is proof.)'
SAVEPOINT p;
SELECT CASE WHEN m.id = :'a'::uuid THEN 'A (canonical)' ELSE 'B (legacy)' END AS candidate,
       m.created_at                              AS member_created,
       m.last_sign_in,
       m.onboarded,
       o.created_at                              AS linkage_created,
       (o.created_at - m.created_at)             AS linkage_minus_member_created
  FROM members m
  LEFT JOIN oauth_accounts o ON o.member_id = m.id
 WHERE m.id IN (:'a'::uuid, :'b'::uuid)
 ORDER BY m.created_at;
ROLLBACK TO SAVEPOINT p; RELEASE SAVEPOINT p;

\echo ''
\echo '════ 3. IS OAUTH LINKING USED ELSEWHERE? (aggregates only — no other member is named) ════'
SAVEPOINT p;
SELECT provider,
       count(*)                        AS linkages,
       count(DISTINCT member_id)       AS distinct_members,
       min(created_at)                 AS earliest,
       max(created_at)                 AS latest
  FROM oauth_accounts
 GROUP BY provider
 ORDER BY 2 DESC;
ROLLBACK TO SAVEPOINT p; RELEASE SAVEPOINT p;

\echo ''
\echo '════ 4. MEMBERS CREATED NEAR THE LEGACY IDENTITY (count only — no rows enumerated) ════'
\echo '(a cluster here would suggest a sign-in path minting members; a lone row would not)'
SAVEPOINT p;
SELECT count(*) AS members_created_within_5_min_of_legacy_identity
  FROM members
 WHERE created_at BETWEEN (SELECT created_at - interval '5 minutes' FROM members WHERE id = :'b'::uuid)
                      AND (SELECT created_at + interval '5 minutes' FROM members WHERE id = :'b'::uuid);
ROLLBACK TO SAVEPOINT p; RELEASE SAVEPOINT p;

ROLLBACK;

\echo ''
\echo 'NO WRITES WERE PERFORMED — READ ONLY transaction, ended in ROLLBACK.'
\echo 'No token, secret, or full provider subject id was selected.'
\echo 'This read authorizes no relinking, no merge, and no member edit.'
