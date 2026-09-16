-- SOURCE-CUSTODY-PII-01 · ACT 4 — founder-side, READ-ONLY production queries.
--
-- ⛔ RUN AS-IS. Every query returns COUNTS, PATHS and CLASSIFICATIONS ONLY.
-- No name, address, passcode or chunk text is selected. Nothing here writes.
-- The results are safe to paste into the programme record verbatim.
--
-- Why this file exists: the session that found the defect cannot reach a
-- database (no DATABASE_URL, localhost:5432 closed, minisforum unreachable), so
-- §A and §D are founder-side by necessity, not by preference.
--
-- ⛔ DO NOT INFER ABSENCE FROM THE SOURCE DELETION. Commit bedecf302 removed
-- three tester-email files from data/ain/source/, which closes FUTURE ingestion.
-- It says nothing about rows already in ain_knowledge_chunks. That is what A1
-- is for.
--
--   ssh soullab@minisforum
--   docker exec -i maia-postgres psql -U soullab maia_consciousness \
--     < scripts/witness/source-custody-act4-founder-queries.sql

\echo '=== A1 · Did the known tester-email sources enter the retrieval corpus? ==='
-- The decisive query. Any row here means unauthorized operational-human-record
-- use in MAIA's knowledge corpus, and §B authorizes immediate targeted removal.
SELECT source_file, count(*) AS chunks
FROM ain_knowledge_chunks
WHERE source_file ILIKE '%BETA_TESTER_EMAILS%'
   OR source_file ILIKE '%BETA_INVITATION_EMAIL%'
GROUP BY source_file
ORDER BY chunks DESC;

\echo ''
\echo '=== A2 · Corpus size and shape, for proportion ==='
SELECT count(*) AS total_chunks, count(DISTINCT source_file) AS distinct_sources
FROM ain_knowledge_chunks;

\echo ''
\echo '=== A3 · Broader sweep: which sources carry human-record signals? ==='
-- ⚠️ BROADER THAN A CONSUMER-DOMAIN REGEX, DELIBERATELY. This lane has twice
-- watched a narrow detector produce false confidence. Three independent signals
-- are counted separately so a hit can be classified rather than acted on
-- blindly. §B forbids deleting on a detector hit alone — classify first.
SELECT source_file,
       count(*) FILTER (
         WHERE chunk_text ~ '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}'
       ) AS chunks_with_any_email,
       count(*) FILTER (
         WHERE chunk_text ~* '\m(passcode|passkey|password|api[_-]?key|secret)\M\s*[:=]'
       ) AS chunks_with_credential_shape,
       count(*) FILTER (
         WHERE chunk_text ~* '\m(beta[ _-]?tester|contact list|mailing list|invitation list)\M'
       ) AS chunks_with_roster_shape,
       count(*) AS chunks_total
FROM ain_knowledge_chunks
GROUP BY source_file
HAVING count(*) FILTER (
         WHERE chunk_text ~ '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}'
            OR chunk_text ~* '\m(passcode|passkey|password|api[_-]?key|secret)\M\s*[:=]'
            OR chunk_text ~* '\m(beta[ _-]?tester|contact list|mailing list|invitation list)\M'
       ) > 0
ORDER BY 2 DESC, 4 DESC;

\echo ''
\echo '=== A4 · Distinct email-shaped strings per flagged source (COUNT ONLY) ==='
-- Distinguishes "one support address in a published essay" from "a roster".
-- The addresses themselves are never selected.
SELECT source_file,
       count(DISTINCT m[1]) AS distinct_email_strings
FROM ain_knowledge_chunks,
     LATERAL regexp_matches(chunk_text, '([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})', 'g') AS m
GROUP BY source_file
ORDER BY distinct_email_strings DESC
LIMIT 40;

\echo ''
\echo '=== D1 · Legacy contact cohort vs durable member identity (COUNTS ONLY) ==='
-- ⛔ EMAIL IS THE ONLY CANDIDATE BRIDGE, AND THAT IS ITSELF A FINDING.
-- lib/ganesha/contacts.ts carries synthetic local ids ('beta-001', …) with no
-- member_id field, so there is no existing relation between a legacy contact
-- and a durable member. Per the ruling, the plaintext passcode must NOT be used
-- as the identity key.
--
-- Replace the VALUES list founder-side with the 48 contact emails, normalized
-- to lower(trim(...)). ⛔ Do not paste that list, or this query's input, into
-- the programme record — only the counts below.
WITH legacy(email) AS (
  VALUES (NULL::text)  -- founder: substitute the normalized contact emails here
)
SELECT
  count(*) FILTER (WHERE m.id IS NOT NULL)                      AS uniquely_reconciled,
  count(*) FILTER (WHERE m.id IS NULL)                          AS no_durable_member,
  count(*) FILTER (WHERE dupes.n > 1)                           AS ambiguous_duplicate_match,
  count(*)                                                      AS legacy_total
FROM legacy l
LEFT JOIN LATERAL (
  SELECT id FROM members WHERE lower(trim(email)) = lower(trim(l.email)) LIMIT 1
) m ON true
LEFT JOIN LATERAL (
  SELECT count(*) AS n FROM members WHERE lower(trim(email)) = lower(trim(l.email))
) dupes ON true
WHERE l.email IS NOT NULL;

\echo ''
\echo '=== D2 · Is email reliable as a one-time reconciliation key? ==='
-- If duplicates exist, email alone cannot reconcile and some records need human
-- adjudication. Counts only.
SELECT count(*)                                        AS members_total,
       count(*) FILTER (WHERE email IS NULL)           AS members_without_email,
       count(DISTINCT lower(trim(email)))              AS distinct_normalized_emails,
       count(*) - count(DISTINCT lower(trim(email)))   AS collisions_after_normalization
FROM members;

\echo ''
\echo '=== D3 · Invite substrate readiness for R12 (COUNTS ONLY) ==='
SELECT status, count(*) AS invites
FROM invites
GROUP BY status
ORDER BY invites DESC;

\echo ''
\echo '=== END — paste counts and source paths only. No personal values. ==='
