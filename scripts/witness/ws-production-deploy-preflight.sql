-- WRITERS-STUDIO-PRODUCTION-DEPLOY-01 · Phase A — production preflight.
--
-- ⛔ READ ONLY. Every statement is a SELECT. Nothing here writes, and nothing
-- here is a migration. It is run BEFORE the deploy, against production, to
-- answer the four Phase A items and to PREDICT whether the seven migrations
-- will apply — because `deploy-production.sh` orders build → swap → verify →
-- migrate, and its migrate step only `log_warn`s on failure while still
-- printing "Deployment complete!".
--
-- ⭐⭐ THE TWO STATEMENTS THAT CAN FAIL AGAINST REAL PRODUCTION ROWS are the only
-- ones in the batch that touch PRE-EXISTING tables. Everything else creates new
-- tables or alters tables this batch itself created (and which are therefore
-- empty). Those two are predicted directly below, so a failure is discovered
-- here rather than in a warn line after the swap.

\pset pager off
\echo '════ 1 · MIGRATION LEDGER — are the seven applied? ════'
SELECT m.name,
       CASE WHEN s.filename IS NULL THEN 'PENDING' ELSE 'APPLIED' END AS state
  FROM (VALUES
    ('20260914000001_proposal_succession.sql'),
    ('20260914000002_manuscript_revision_offers.sql'),
    ('20260914000003_proposal_chains_member_identity.sql'),
    ('20260914000004_manuscript_revision_authorizations.sql'),
    ('20260914000005_editorial_ontology.sql'),
    ('20260915000001_ask_threads_subject_preparation.sql'),
    ('20260915000002_editorial_turn_bindings.sql')
  ) AS m(name)
  LEFT JOIN schema_migrations s ON s.filename = m.name
 ORDER BY m.name;

\echo ''
\echo '════ 2 · WILL THE MIGRATIONS APPLY? — predicted against real rows ════'
\echo '-- ⛔ Any row here that is not 0 is a STOP: the migration WILL fail.'
SELECT
  /* `ALTER TABLE ask_threads VALIDATE CONSTRAINT ask_threads_one_subject`
     scans every existing row. Pre-migration `proposal_chain_id` does not exist,
     so the predicate reduces to `anchor IS NOT NULL`. */
  (SELECT count(*) FROM ask_threads WHERE anchor IS NULL)
    AS "one_subject · rows that would FAIL validation",
  /* `ADD CONSTRAINT ask_turns_thread_index_speaker_key UNIQUE
     (thread_id, turn_index, speaker)` fails on any duplicate group. */
  (SELECT count(*) FROM (
     SELECT thread_id, turn_index, speaker
       FROM ask_turns GROUP BY 1,2,3 HAVING count(*) > 1) d)
    AS "ask_turns UNIQUE · duplicate groups",
  (SELECT count(*) FROM ask_threads) AS "ask_threads rows",
  (SELECT count(*) FROM ask_turns)   AS "ask_turns rows";

\echo ''
\echo '-- ⚠️ Do the new tables already exist? (they must NOT, before the deploy)'
SELECT c.relname AS table_name, 'ALREADY PRESENT — investigate' AS note
  FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
 WHERE n.nspname = 'public' AND c.relkind = 'r'
   AND c.relname IN ('proposal_chains','proposal_versions',
                     'manuscript_revision_offers','manuscript_revision_authorizations',
                     'proposal_chain_insights','proposal_chain_directions',
                     'editorial_turn_bindings');

\echo ''
\echo '════ 3 · THE REAL WORK — is there a live Chapter 10 to write in? ════'
\echo '-- ⛔ The Studio working draft, NEVER the founder-knowledge corpus copy.'
SELECT mm.id AS manuscript_id, mm.title, m.username AS owner,
       lw.id IS NOT NULL                      AS "declared as a Living Work",
       d.id IS NOT NULL                       AS "has a working draft",
       d.section_addressable_at IS NOT NULL    AS "SECTION-ADDRESSABLE",
       (SELECT count(*) FROM manuscript_draft_sections s WHERE s.draft_id = d.id)
                                              AS "draft sections",
       d.revision_count
  FROM member_manuscripts mm
  JOIN members m ON m.id = mm.member_id
  LEFT JOIN manuscript_working_drafts d ON d.manuscript_id = mm.id
  LEFT JOIN living_work_expressions lwe
         ON lwe.expression_id = mm.id AND lwe.expression_type = 'manuscript'
  LEFT JOIN living_works lw ON lw.id = lwe.living_work_id
 WHERE mm.title ILIKE '%alchem%'
 ORDER BY mm.created_at;

\echo ''
\echo '-- Chapter 10, by heading. ⛔ Position is NOT assumed to be the number.'
SELECT s.position, left(coalesce(s.heading,'(no heading)'), 60) AS heading,
       length(ds.text) AS draft_chars, ds.id IS NOT NULL AS addressable
  FROM manuscript_sections s
  JOIN member_manuscripts mm ON mm.id = s.manuscript_id
  LEFT JOIN manuscript_draft_sections ds ON ds.source_section_id = s.id
 WHERE mm.title ILIKE '%alchem%'
   AND (s.heading ILIKE '%chapter 10%' OR s.heading ILIKE '%chapter ten%'
        OR s.heading ILIKE '%10%')
 ORDER BY s.position;

\echo ''
\echo '-- ⚠️ CONTEXT: every section, so "Chapter 10" is IDENTIFIED, not guessed.'
SELECT s.position, left(coalesce(s.heading,'(no heading)'), 50) AS heading,
       length(s.body) AS source_chars
  FROM manuscript_sections s
  JOIN member_manuscripts mm ON mm.id = s.manuscript_id
 WHERE mm.title ILIKE '%alchem%'
 ORDER BY s.position;

\echo ''
\echo '════ 4 · EXISTING RELATIONSHIPS — what the walk would return to ════'
-- ⚠️ `to_regclass` rather than a bare count: this whole script runs under
-- ON_ERROR_STOP=1, and one absent table would abort the preflight AFTER the
-- expensive checks above rather than reporting a NULL beside them.
SELECT (SELECT count(*) FROM ask_threads)                       AS ask_threads_total,
       (SELECT count(*) FROM ask_threads WHERE anchor->>'on' = 'work')
                                                                AS work_anchored,
       CASE WHEN to_regclass('public.manuscript_structure_proposals') IS NULL
            THEN NULL
            ELSE (SELECT count(*) FROM manuscript_structure_proposals) END
                                                                AS readings;
