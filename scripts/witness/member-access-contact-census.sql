-- MEMBER-ACCESS-01 · STAGE 6 → 7 GATE · READ-ONLY PRODUCTION CENSUS
--
--   ssh soullab@minisforum "docker exec -i maia-postgres psql -U soullab maia_consciousness" \
--     < scripts/witness/member-access-contact-census.sql
--
-- SELECT ONLY. No INSERT, UPDATE, DELETE, DDL. No authored or member content:
-- addresses are never printed, only counted and shaped.
--
-- WHAT THIS CAN AND CANNOT ESTABLISH  (read before interpreting any number)
-- ========================================================================
-- Three different facts were requested. Production distinguishes them unevenly:
--
--   ADDRESS PRESENT       countable exactly.
--
--   ADDRESS VERIFIED      countable only as a FLOOR. `members.email_verified` is
--                         written by exactly one route — app/api/members/verify-email.
--                         The email-CODE flow, which is the live default door, never
--                         sets it. A member who has signed in by code fifty times
--                         still reads email_verified = false. Treat this column as
--                         "verified by the token-link flow", never as "verified".
--
--   ADDRESS DELIVERABLE   NOT countable as such, and deliberately not manufactured
--                         here. The mail ledger records PROVIDER ACCEPTANCE, never
--                         recipient delivery (no bounce or complaint webhook exists),
--                         and its `member_ref` is derived in application code rather
--                         than stored as a member id, so it cannot be joined to
--                         members in SQL at all.
--
-- ONE REAL POSITIVE SIGNAL EXISTS, and it is not in the mail ledger:
--
--   magic_link_tokens.used_at IS NOT NULL
--     ⟹ a magic link was CLICKED (magic-link/route.ts:300 is the only writer)
--     ⟹ the message reached a human who acted on it
--     This proves delivery AND control together. It is the strongest contact
--     evidence Soullab holds.
--
-- ⛔ AND THE AMBIGUOUS SET, WHICH MUST NOT BE COUNTED AS ANYTHING:
--   `used = true` with `used_at IS NULL` has THREE indistinguishable causes —
--   redeemed by code, invalidated by a newer request (magic-link/route.ts:100),
--   or attempt-capped (email-code/verify:96). Nothing in the row separates them.
--   Counting it as evidence would manufacture exactly the deliverable population
--   this census was told not to invent.

\echo '=================== CENSUS A · AMBIGUOUS CONTACT ==================='

WITH c AS (
  SELECT lower(btrim(email)) AS contact, id
  FROM members
  WHERE email IS NOT NULL AND btrim(email) <> ''
), sets AS (
  SELECT contact, count(DISTINCT id) AS n
  FROM c GROUP BY contact HAVING count(DISTINCT id) > 1
)
SELECT
  (SELECT count(*)               FROM sets)                    AS distinct_ambiguous_contacts,
  (SELECT coalesce(sum(n),0)     FROM sets)                    AS members_affected,
  (SELECT coalesce(max(n),0)     FROM sets)                    AS largest_ambiguity_set,
  (SELECT count(*)               FROM sets WHERE n = 2)        AS sets_of_exactly_2,
  (SELECT count(*)               FROM sets WHERE n > 2)        AS sets_greater_than_2,
  (SELECT count(*)               FROM members)                 AS members_total;

\echo ''
\echo '=================== CENSUS B · CONTACT EVIDENCE ==================='
\echo 'Mutually exclusive. "verified" below means the token-link flow ONLY.'

WITH ev AS (
  SELECT
    m.id,
    (m.email IS NULL OR btrim(m.email) = '')            AS no_contact,
    coalesce(m.email_verified, false)                   AS verified_tokenlink,
    EXISTS (
      SELECT 1 FROM magic_link_tokens t
      WHERE t.member_id = m.id AND t.used_at IS NOT NULL
    )                                                   AS clicked_a_link
  FROM members m
)
SELECT
  count(*) FILTER (WHERE no_contact)                                           AS s1_no_contact_address,
  count(*) FILTER (WHERE NOT no_contact AND NOT verified_tokenlink
                     AND NOT clicked_a_link)                                   AS s2_present_verification_unknown,
  count(*) FILTER (WHERE NOT no_contact AND verified_tokenlink
                     AND NOT clicked_a_link)                                   AS s3_verified_tokenlink_only,
  count(*) FILTER (WHERE NOT no_contact AND NOT verified_tokenlink
                     AND clicked_a_link)                                       AS s4_positive_delivery_only,
  count(*) FILTER (WHERE NOT no_contact AND verified_tokenlink
                     AND clicked_a_link)                                       AS s5_verified_and_delivered,
  0                                                                            AS s6_known_delivery_failure_UNAVAILABLE,
  count(*)                                                                     AS members_total
FROM ev;

\echo ''
\echo 's6 is structurally 0: no bounce/complaint evidence exists in this system.'
\echo 'It is printed as a named absence so it is never read as "no failures".'

\echo ''
\echo '=================== MIGRATION POPULATIONS A / B / C ==================='
\echo 'Founder rule: a contact may resolve identity only if UNIQUE **and** VERIFIED.'
\echo 'Evidence for VERIFIED here = token-link flag OR a clicked magic link.'

WITH c AS (
  SELECT lower(btrim(email)) AS contact, id
  FROM members WHERE email IS NOT NULL AND btrim(email) <> ''
), dup AS (
  SELECT contact FROM c GROUP BY contact HAVING count(DISTINCT id) > 1
), ev AS (
  SELECT
    m.id,
    (m.email IS NULL OR btrim(m.email) = '')  AS no_contact,
    lower(btrim(m.email))                     AS contact,
    (coalesce(m.email_verified,false) OR EXISTS (
       SELECT 1 FROM magic_link_tokens t
       WHERE t.member_id = m.id AND t.used_at IS NOT NULL)) AS has_evidence
  FROM members m
)
SELECT
  count(*) FILTER (WHERE NOT no_contact AND contact NOT IN (SELECT contact FROM dup)
                     AND has_evidence)                                   AS pop_A_unique_and_evidenced,
  count(*) FILTER (WHERE NOT no_contact AND contact IN (SELECT contact FROM dup)) AS pop_B_ambiguous,
  count(*) FILTER (WHERE no_contact
                     OR (contact NOT IN (SELECT contact FROM dup) AND NOT has_evidence))
                                                                         AS pop_C_under_evidenced,
  count(*)                                                               AS members_total
FROM ev;

\echo ''
\echo 'pop_C is the B3 cohort denominator: one-time assisted enrolment may be'
\echo 'required before any legacy door retires. pop_B must be reconciled without'
\echo 'guessing. Neither number authorizes any change.'

\echo ''
\echo '=================== CENSUS C · P-1 PROOF-OF-CONTROL EVIDENCE ==================='
\echo 'Added Stage 7A. Empty until P-1 is deployed and members sign in normally.'
\echo 'This is the number expected to RISE on its own, with no member asked to act.'

SELECT
  count(DISTINCT member_id)                                                AS members_with_any_proof,
  count(*)                                                                 AS proof_events_total,
  count(*) FILTER (WHERE mechanism = 'email_code')                         AS via_email_code,
  count(*) FILTER (WHERE mechanism = 'magic_link')                         AS via_magic_link,
  count(*) FILTER (WHERE mechanism = 'email_verification_token')           AS via_token_link,
  count(*) FILTER (WHERE contact_fingerprint IS NULL)                      AS rows_without_contact_attribution,
  min(observed_at)                                                         AS first_observed,
  max(observed_at)                                                         AS last_observed
FROM contact_control_proofs;

\echo ''
\echo 'rows_without_contact_attribution > 0 means EMAIL_LEDGER_FINGERPRINT_KEY was'
\echo 'unset when those rows were written. The proof about the MEMBER still stands;'
\echo 'only the contact-level join is missing. Not a failure — a named limit.'
\echo ''
\echo 'AND THE COUNT THAT MUST TRAVEL WITH THESE NUMBERS: proof writes are'
\echo 'best-effort and under-report. Read proofWriteFailuresTotal() from the'
\echo 'running container alongside this table, or report the figures as a FLOOR.'
