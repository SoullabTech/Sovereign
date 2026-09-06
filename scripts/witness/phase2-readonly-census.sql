-- Phase 2 read-only production census — DB items (C1–C18 scope; C3 as checklist).
--
-- Authority: docs/programme/PHASE2_READONLY_CENSUS_SPEC_2026-09-06.md (founder, RUN AUTHORIZED
-- 2026-09-06 for C1–C18). Companion for the log-marker items:
-- scripts/witness/phase2-readonly-census-logs.sh.
--
-- BINDING TERMS (founder, verbatim):
--   READ ONLY
--   no schema mutation
--   no product mutation
--   no production writes
--   exact production SHA recorded
--   query / log window recorded
--   counts and distributions preferred over member content
--   no claim beyond what the instrument actually observes
--
-- WHAT THIS SCRIPT IS
--   SELECT-only. No CREATE, no TEMP TABLE, no INSERT/UPDATE/DELETE, no function
--   definitions. Every statement returns a count or a distribution (GROUP BY). No
--   member-authored text is ever selected: where a text column is read for
--   classification (C4 breakthrough trigger class, C17 about_practice check) only a
--   boolean / length / count leaves the query. Member ids appear only as 8-char
--   prefixes and only in C15, where the spec itself names two members.
--
-- SANCTUARY
--   Rows carrying posture_at_creation = 'sanctuary' (conversation_turns, agent_runs,
--   integration_passes — migration 20260718000001_s5_provenance_substrate.sql) are
--   excluded wherever that column exists. The other tables queried here carry no
--   sanctuary marker (the write paths are gated by !isSanctuary upstream:
--   app/api/sovereign/app/maia/list/route.ts:398, :1731); nothing can be excluded
--   on those tables and the census does not claim to have done so.
--
-- SCHEMA SOURCES
--   Every table/column is cited above its query with `-- source:`. Migrations are
--   database/migrations/<file>. Three tables predate the migration ledger and are
--   created only in the production schema snapshot
--   database/baseline/0001_baseline_2026-09-01.sql (cited as baseline:<line>):
--   bead_events, developmental_memories, integration_passes. Their later columns are
--   cited to the altering migration. Nothing here was verified against the live
--   database — this session had no production access.
--
-- WINDOWS
--   Spec windows are literal date filters marked `-- window:`. The census baseline
--   date is 2026-08-13 (spec C4; ranked map counts dated 2026-08-13). Items without a
--   spec window report all-time AND since 2026-08-13 where cheap.
--
-- Run (production, from the Mac Studio). NOTE: do NOT pass -v ON_ERROR_STOP=1 — the
-- script sets it off so one missing column does not stop the rest:
--   ssh soullab@minisforum 'docker exec -i maia-postgres psql -U soullab maia_consciousness' \
--     < scripts/witness/phase2-readonly-census.sql
--
-- Record the output verbatim, together with the production SHA and window printed
-- by phase2-readonly-census-logs.sh, in
-- docs/programme/MAIA_WHOLE_ORGANISM_MAP/CENSUS_RESULTS_<date>.md
-- (record format: spec §"Record format per item").

\set ON_ERROR_STOP off
-- Acceptance condition (founder 2026-09-06): read-only ENFORCED, not merely intended. Every
-- statement below runs in its own read-only transaction; a write would fail here even if one
-- were present. Verified on acceptance: 59 SELECT · 1 WITH · 1 SHOW · 0 DDL/DML.
SET default_transaction_read_only = on;
SHOW default_transaction_read_only;
\set QUIET on
\pset footer off
\set QUIET off

\echo
\echo '════════════════════════════════════════════════════════════════'
\echo ' PHASE 2 READ-ONLY CENSUS — DB ITEMS'
\echo ' READ ONLY · no schema mutation · no product mutation · no production writes'
\echo '════════════════════════════════════════════════════════════════'
\echo
\echo 'RUN RECORD — observed_at, database, server. The production SHA is NOT readable from'
\echo 'SQL: record it from  docker exec maia-sovereign printenv GIT_COMMIT  (the logs script'
\echo 'prints it first). Census baseline window: since 2026-08-13.'
SELECT
  NOW()                       AS observed_at,
  current_database()          AS database,
  current_user                AS run_as,
  version()                   AS server_version,
  '2026-08-13'::date          AS census_window_since,
  (NOW() - INTERVAL '30 days')::date AS thirty_day_window_since;

\echo
\echo 'Read-only assertion for the session (transaction_read_only is a session setting;'
\echo 'this script issues no writes regardless of its value).'
SHOW transaction_read_only;

-- ───────────────────────────────────────────────────────────────────
\echo
\echo '════════════════════════════════════════════════════════════════'
\echo ' C1  OpenAI TTS egress on canonical path  (A1 / X6)'
\echo '     Counts: [openai-tts:*] lines vs [tts.resolve] kokoro — LOGS ITEM.'
\echo '     Rule: extent only; does not decide permissibility.'
\echo '════════════════════════════════════════════════════════════════'
\echo '-- LOGS ITEM: see phase2-readonly-census-logs.sh §C1. No SQL. (member_settings.allow_cloud_voice'
\echo '   is a preference column, not an egress record; not counted here to avoid a claim beyond the instrument.)'

-- ───────────────────────────────────────────────────────────────────
\echo
\echo '════════════════════════════════════════════════════════════════'
\echo ' C2  Ephemeral-requested turns that still wrote  (A2 / X4)'
\echo '     Counts: requestedMode="ephemeral" vs [Sovereign/Writeback] Memory formed — LOGS ITEM.'
\echo '     Rule: any nonzero = breach extent.'
\echo '════════════════════════════════════════════════════════════════'
\echo '-- LOGS ITEM: see phase2-readonly-census-logs.sh §C2. No SQL.'
\echo '   Note (code-read): the writeback gate at list/route.ts:1731 tests !isSanctuary only, not'
\echo '   memoryMode; the two log lines share no turn id, so same-turn pairing is not observable.'

-- ───────────────────────────────────────────────────────────────────
\echo
\echo '════════════════════════════════════════════════════════════════'
\echo ' C3  Sanctuary control reachability  (A2 / X5) — NAVIGATION WALK, NOT A QUERY'
\echo '     Rule: walk record, not a count. One read-only House walk under a member account.'
\echo '════════════════════════════════════════════════════════════════'
\echo 'CHECKLIST — OBSERVATION ONLY (founder correction 2026-09-06). The authorization is'
\echo 'navigation and observation. DO NOT toggle any control. DO NOT alter any default. DO NOT'
\echo 'send a test turn. Testing whether Sanctuary state propagates to a live session is a'
\echo 'SEPARATE founder act, not part of this census. Record for each path: is the control'
\echo 'reachable, what does it currently say, what is its visible state, how many taps from /maia,'
\echo 'and is the surface a CONTROL or merely DESCRIPTIVE.'
\echo
\echo '  [ ] 3.1  Account default — /maia/settings → AccountSettings "Sanctuary Mode Default"'
\echo '           (components/account/AccountSettings.tsx:2137-2144). Storage is CLIENT-SIDE:'
\echo '           localStorage key maia_sanctuary_default (lib/storage/sovereign.ts:130-133).'
\echo '           Record only: reachable? taps from /maia? current visible state? copy? control or label?'
\echo '           Do NOT change it. Whether a fresh device inherits it is a propagation question — out of scope.'
\echo '  [ ] 3.2  Whether the account default reaches a live session — NOT OBSERVED IN THIS WALK.'
\echo '           It would require starting a session with the default ON (a state change and a turn).'
\echo '           Record as NOT OBSERVABLE UNDER THIS AUTHORIZATION; propagation is a separate act.'
\echo '  [ ] 3.3  Voice HUD toggle — components/voice/VoiceHUD.tsx:204-226 (title "Sanctuary ON/OFF").'
\echo '  [ ] 3.4  Chat input indicator — components/chat/ChatGPTStyleInput.tsx:218 ("Sanctuary Mode -'
\echo '           This session won t be remembered") and components/chat/SacredChatInput.tsx:312'
\echo '           ("Sanctuary is on · Not saved to memory"). Record whether each is a control or a label.'
\echo '  [ ] 3.5  Session lobby — components/session/SovereignLobby.tsx:278 (Sanctuary notice).'
\echo '  [ ] 3.6  Privacy page — /maia/privacy (app/maia/privacy/page.tsx:149-175). Record whether the'
\echo '           Sanctuary block is a control or descriptive copy only.'
\echo '  [ ] 3.7  Session-start API — app/api/maia/session/start/route.ts:11,23,59-60 accepts'
\echo '           privacyMode=sanctuary. Record which UI surface (if any) sends it.'
\echo '  [ ] 3.8  Shell — components/maia/MaiaShell.tsx:114,255-258 reads isSanctuary from voice state.'
\echo '           Record the visible indication while ON (invariant 4: unambiguous indication).'
\echo '  [ ] 3.9  Onboarding — record whether Sanctuary is mentioned or reachable during'
\echo '           /begin → /onboarding (CLAUDE.md onboarding flow). Expected: not a control.'
\echo '  [ ] 3.10 For every path above: number of taps from /maia to the control; whether the state'
\echo '           survives reload; whether toggling mid-session is offered or refused.'
\echo
\echo '-- No SQL for C3.'

-- ───────────────────────────────────────────────────────────────────
\echo
\echo '════════════════════════════════════════════════════════════════'
\echo ' C4  System-authored records by kind/month  (A3 / X3)'
\echo '     Counts per month since 2026-08-13: relational observer rows, rupture rows,'
\echo '     memory_type=pattern rows, breakthrough_moments by trigger class, maia_reflection'
\echo '     non-null, spiral-state rows.  Rule: —'
\echo '════════════════════════════════════════════════════════════════'
-- window: since 2026-08-13 (spec C4)

\echo
\echo '4.a  Relational observer rows — relationship_entries by kind × month'
\echo '     (observer writes: lib/consciousness/relationalObserver.ts:172 member_relationships,'
\echo '      :192 relationship_entries, :207 relationship_entry_patterns)'
-- source: database/migrations/20260403000001_relationship_field_v1.sql (relationship_entries: kind, created_at; kinds checkin|note|reflection|threshold|rupture|repair)
SELECT
  date_trunc('month', created_at)::date AS month,
  kind,
  COUNT(*)                               AS rows,
  COUNT(DISTINCT member_id)              AS members
FROM relationship_entries
WHERE created_at >= '2026-08-13'
GROUP BY 1, 2
ORDER BY 1, 2;

\echo
\echo '4.b  relationship_entry_patterns (system pattern_hint rows) by month'
-- source: database/migrations/20260409000001_relationship_entry_patterns.sql (detected_at, member_id, pattern_id, expires_at)
SELECT
  date_trunc('month', detected_at)::date AS month,
  COUNT(*)                                AS rows,
  COUNT(DISTINCT member_id)               AS members,
  COUNT(*) FILTER (WHERE expires_at IS NOT NULL AND expires_at <= NOW()) AS expired_rows
FROM relationship_entry_patterns
WHERE detected_at >= '2026-08-13'
GROUP BY 1
ORDER BY 1;

\echo
\echo '4.c  Rupture rows — member_relational_signals by rupture_state × month; source_turn_id basis'
\echo '     (06 asks: confirm source_turn_id still 0/N)'
-- source: database/migrations/20260409000010_member_relational_signals.sql (rupture_state none|strained|ruptured|unclear, source, source_turn_id, created_at)
SELECT
  date_trunc('month', created_at)::date AS month,
  COALESCE(rupture_state, '(null)')      AS rupture_state,
  source,
  COUNT(*)                               AS rows,
  COUNT(*) FILTER (WHERE source_turn_id IS NULL OR source_turn_id = 0) AS rows_without_source_turn,
  COUNT(DISTINCT member_id)              AS members
FROM member_relational_signals
WHERE created_at >= '2026-08-13'
GROUP BY 1, 2, 3
ORDER BY 1, 2, 3;

\echo
\echo '4.d  Rupture kind in relationship_entries (kind = rupture) all-time vs window'
-- source: database/migrations/20260403000001_relationship_field_v1.sql
SELECT
  COUNT(*)                                          AS rupture_entries_all_time,
  COUNT(*) FILTER (WHERE created_at >= '2026-08-13') AS rupture_entries_since_window,
  COUNT(DISTINCT member_id)                         AS members_all_time
FROM relationship_entries
WHERE kind = 'rupture';

\echo
\echo '4.e  developmental_memories by memory_type × month (03: all live rows expected memory_type=pattern)'
-- source: database/baseline/0001_baseline_2026-09-01.sql:8559 (developmental_memories: memory_type, formed_at, user_id);
--         formed_at/valid_from/valid_to added by database/migrations/20251231_memory_architecture_enhancements.sql
SELECT
  date_trunc('month', formed_at)::date AS month,
  memory_type,
  COUNT(*)                              AS rows,
  COUNT(DISTINCT user_id)               AS members,
  COUNT(*) FILTER (WHERE confirmed_by_user) AS confirmed_by_member
FROM developmental_memories
WHERE formed_at >= '2026-08-13'
GROUP BY 1, 2
ORDER BY 1, 2;

\echo
\echo '4.f  breakthrough_moments by trigger class × month — regex re-classification of the insight'
\echo '     text using the detector patterns (lib/consciousness/relationalObserver.ts:7-10; 03 cites'
\echo '     MemoryWriteback.ts:779 for the gratitude trigger). Only counts leave the query.'
\echo '     A row can match several classes; classes are reported independently.'
-- source: database/migrations/014_relationship_memory_tables.sql (breakthrough_moments: insight, element, integrated, "timestamp", user_id)
SELECT
  date_trunc('month', "timestamp")::date AS month,
  COUNT(*)                                AS rows,
  COUNT(DISTINCT user_id)                 AS members,
  COUNT(*) FILTER (WHERE insight ~* 'thank you.*profound|deeply grateful')            AS class_gratitude,
  COUNT(*) FILTER (WHERE insight ~* 'breakthrough|epiphany|realized|just understood')  AS class_realization,
  COUNT(*) FILTER (WHERE insight ~* 'now i see|finally get|makes sense now')           AS class_seeing,
  COUNT(*) FILTER (WHERE insight ~* 'i never thought|changed my mind|new perspective') AS class_perspective,
  COUNT(*) FILTER (WHERE insight !~* 'thank you.*profound|deeply grateful|breakthrough|epiphany|realized|just understood|now i see|finally get|makes sense now|i never thought|changed my mind|new perspective') AS class_unmatched,
  COUNT(*) FILTER (WHERE integrated)      AS integrated_true
FROM breakthrough_moments
WHERE "timestamp" >= '2026-08-13'
GROUP BY 1
ORDER BY 1;

\echo
\echo '4.g  breakthrough_moments all-time totals and element distribution'
-- source: database/migrations/014_relationship_memory_tables.sql
SELECT
  COALESCE(element, '(null)') AS element,
  COUNT(*)                    AS rows,
  COUNT(DISTINCT user_id)     AS members,
  MIN("timestamp")::date      AS first_row,
  MAX("timestamp")::date      AS last_row
FROM breakthrough_moments
GROUP BY 1
ORDER BY 2 DESC;

\echo
\echo '4.h  maia_reflection non-null — relationship_entries by month (MAIA text persisted into the member timeline,'
\echo '     app/api/relationships/[id]/checkin/route.ts:97-103)'
-- source: database/migrations/20260403000001_relationship_field_v1.sql (maia_reflection); kind tag database/migrations/20260504000001_relationship_entries_maia_reflection_kind.sql
SELECT
  date_trunc('month', created_at)::date AS month,
  COUNT(*)                               AS entries,
  COUNT(*) FILTER (WHERE maia_reflection IS NOT NULL) AS with_maia_reflection,
  COUNT(DISTINCT member_id) FILTER (WHERE maia_reflection IS NOT NULL) AS members_with_maia_reflection
FROM relationship_entries
WHERE created_at >= '2026-08-13'
GROUP BY 1
ORDER BY 1;

\echo
\echo '4.i  Spiral-state rows — member_spiral_state by month created and month last updated'
-- source: database/migrations/20260213200001_member_spiral_state.sql (member_id, dominant_element, phase, motion, relational_phase, created_at, updated_at)
SELECT
  date_trunc('month', created_at)::date AS month_created,
  COUNT(*)                               AS rows_created,
  COUNT(*) FILTER (WHERE updated_at >= '2026-08-13') AS rows_updated_since_window
FROM member_spiral_state
GROUP BY 1
ORDER BY 1;

\echo
\echo '4.j  Spiral-state distribution (all rows): dominant_element × relational_phase; motion'
-- source: database/migrations/20260213200001_member_spiral_state.sql
SELECT dominant_element, relational_phase, COUNT(*) AS rows
FROM member_spiral_state
GROUP BY 1, 2
ORDER BY 1, 2;
SELECT COALESCE(motion, '(null)') AS motion, COUNT(*) AS rows
FROM member_spiral_state
GROUP BY 1
ORDER BY 2 DESC;

-- ───────────────────────────────────────────────────────────────────
\echo
\echo '════════════════════════════════════════════════════════════════'
\echo ' C5  Cognitive-profile coverage  (A5 / X1a, rank 3) — RUN EARLY'
\echo '     Fraction of members / turns with a non-null cognitive profile; regulation lines in LOGS.'
\echo '     Rule: ≈0 → X1a/X1b calibration inert, downgrade.'
\echo '════════════════════════════════════════════════════════════════'
\echo 'NOTE: there is no cognitive_profiles table in any migration or in the baseline. The profile is'
\echo 'built at request time from cognitive_turn_events (lib/consciousness/cognitiveProfileService.ts:'
\echo '16-17 returns null when the member has no rows; reader lib/consciousness/cognitiveEventsService.ts:136,'
\echo 'no time window, LIMIT only). "Non-null profile" is therefore measured as: member has ≥1'
\echo 'cognitive_turn_events row. This is the instrument; it is not the same as a stored profile.'

\echo
\echo '5.a  Member coverage: members with ≥1 cognitive_turn_events row vs all members vs members active since window'
-- source: database/migrations/016_cognitive_turn_events.sql (user_id text, bloom_level, bypassing_spiritual, bypassing_intellectual, scaffolding_used, created_at)
-- source: database/migrations/20260103000001_members.sql (members.id uuid)
-- source: database/migrations/015_conversation_turns.sql (conversation_turns: user_id text, role, created_at); posture_at_creation: database/migrations/20260718000001_s5_provenance_substrate.sql:213
-- window: since 2026-08-13 for "active"
SELECT
  (SELECT COUNT(*) FROM members)                                                    AS members_total,
  (SELECT COUNT(DISTINCT user_id) FROM cognitive_turn_events)                       AS members_with_any_cognitive_row,
  (SELECT COUNT(DISTINCT user_id) FROM conversation_turns
     WHERE role = 'user' AND created_at >= '2026-08-13'
       AND posture_at_creation IS DISTINCT FROM 'sanctuary')                        AS members_active_since_window,
  (SELECT COUNT(DISTINCT c.user_id) FROM cognitive_turn_events c
     WHERE EXISTS (SELECT 1 FROM conversation_turns t
                   WHERE t.user_id = c.user_id AND t.role = 'user' AND t.created_at >= '2026-08-13'
                     AND t.posture_at_creation IS DISTINCT FROM 'sanctuary'))       AS active_members_with_cognitive_rows,
  ROUND(100.0 * (SELECT COUNT(DISTINCT user_id) FROM cognitive_turn_events)
        / NULLIF((SELECT COUNT(*) FROM members), 0), 1)                             AS pct_members_with_profile_source;

\echo
\echo '5.b  Turn coverage since window: cognitive_turn_events rows vs member turns (role=user, non-sanctuary)'
-- source: as 5.a
-- window: since 2026-08-13
SELECT
  (SELECT COUNT(*) FROM cognitive_turn_events WHERE created_at >= '2026-08-13')        AS cognitive_rows_since_window,
  (SELECT COUNT(*) FROM conversation_turns
     WHERE role = 'user' AND created_at >= '2026-08-13'
       AND posture_at_creation IS DISTINCT FROM 'sanctuary')                            AS member_turns_since_window,
  ROUND(100.0 * (SELECT COUNT(*) FROM cognitive_turn_events WHERE created_at >= '2026-08-13')
        / NULLIF((SELECT COUNT(*) FROM conversation_turns
                  WHERE role = 'user' AND created_at >= '2026-08-13'
                    AND posture_at_creation IS DISTINCT FROM 'sanctuary'), 0), 1)     AS pct_turns_with_cognitive_row;

\echo
\echo '5.c  Rows per member (profile depth) — histogram; cognitiveProfileService stability needs ≥3 (:154, :227)'
-- source: database/migrations/016_cognitive_turn_events.sql
SELECT
  CASE WHEN n = 1 THEN '1' WHEN n = 2 THEN '2' WHEN n < 10 THEN '3-9' WHEN n < 50 THEN '10-49' ELSE '50+' END AS rows_per_member,
  COUNT(*) AS members
FROM (SELECT user_id, COUNT(*) AS n FROM cognitive_turn_events GROUP BY user_id) s
GROUP BY 1
ORDER BY MIN(n);

\echo
\echo '5.d  Bloom level × bypassing flags distribution (all rows) — feeds X1a calibration inputs'
-- source: database/migrations/016_cognitive_turn_events.sql
SELECT
  bloom_level,
  COUNT(*)                                       AS rows,
  COUNT(*) FILTER (WHERE bypassing_spiritual)    AS bypassing_spiritual,
  COUNT(*) FILTER (WHERE bypassing_intellectual) AS bypassing_intellectual,
  COUNT(*) FILTER (WHERE scaffolding_used)       AS scaffolding_used
FROM cognitive_turn_events
GROUP BY 1
ORDER BY 1;

-- ───────────────────────────────────────────────────────────────────
\echo
\echo '════════════════════════════════════════════════════════════════'
\echo ' C6  Awareness-level distribution  (X1a / S3)'
\echo '     Bead-count histogram across levels 1–7.'
\echo '     Rule: >90% at 1–2 → ladder inert and mislabelling.'
\echo '════════════════════════════════════════════════════════════════'
\echo 'Reproduces the live inference exactly: bead_events, last 30 days, spiralogic_element non-null'
\echo '(lib/sovereign/maiaService.ts:452-462); <20 beads → getConsciousnessPolicy returns null (:471);'
\echo 'inferAwarenessLevel thresholds lib/consciousness/awareness-levels.ts:234-262 (window_days is a'
\echo 'constant 30, so the window_days<7 branch never fires). Level 1 below therefore means "no policy".'
-- source: database/baseline/0001_baseline_2026-09-01.sql:5860 (bead_events: user_id, spiralogic_element, "timestamp") — no CREATE in database/migrations
-- window: last 30 days (live inference window)
WITH per_el AS (
  SELECT user_id, spiralogic_element AS element, COUNT(*) AS n
  FROM bead_events
  WHERE "timestamp" > NOW() - INTERVAL '30 days'
    AND spiralogic_element IS NOT NULL
  GROUP BY 1, 2
),
totals AS (
  SELECT user_id, SUM(n) AS total_beads, COUNT(*) AS elements_engaged
  FROM per_el GROUP BY 1
),
pct AS (
  SELECT p.user_id, p.element, 100.0 * p.n / t.total_beads AS pct
  FROM per_el p JOIN totals t USING (user_id)
),
feat AS (
  SELECT
    t.user_id,
    t.total_beads,
    t.elements_engaged,
    MAX(pct.pct) AS max_pct,
    MIN(pct.pct) AS min_pct,
    BOOL_OR(pct.element = 'aether' AND pct.pct > 10) AS has_aether
  FROM totals t JOIN pct USING (user_id)
  GROUP BY 1, 2, 3
),
lvl AS (
  SELECT
    user_id, total_beads, has_aether,
    (elements_engaged >= 3 AND max_pct < 35 AND min_pct > 5) AS is_balanced
  FROM feat
),
scored AS (
  SELECT
    user_id, total_beads,
    CASE
      WHEN total_beads < 20 THEN 1
      WHEN total_beads < 50 THEN 2
      WHEN has_aether AND is_balanced AND total_beads > 200 THEN 7
      WHEN has_aether AND total_beads > 150 THEN 6
      WHEN is_balanced AND total_beads > 100 THEN 5
      WHEN total_beads > 75 THEN 4
      ELSE 3
    END AS level
  FROM lvl
)
SELECT
  level,
  CASE level WHEN 1 THEN 'newcomer (<20 beads → policy null)' WHEN 2 THEN 'explorer' WHEN 3 THEN 'practitioner'
             WHEN 4 THEN 'student' WHEN 5 THEN 'integrator' WHEN 6 THEN 'teacher' WHEN 7 THEN 'master' END AS label,
  COUNT(*)                                        AS members,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 1) AS pct_of_members_with_beads,
  MIN(total_beads)                                AS min_beads,
  MAX(total_beads)                                AS max_beads
FROM scored
GROUP BY 1
ORDER BY 1;

\echo
\echo '6.b  Members with NO bead in the 30-day window (never enter the ladder) vs members with beads'
-- source: as above; members: database/migrations/20260103000001_members.sql
SELECT
  (SELECT COUNT(*) FROM members) AS members_total,
  (SELECT COUNT(DISTINCT user_id) FROM bead_events
     WHERE "timestamp" > NOW() - INTERVAL '30 days' AND spiralogic_element IS NOT NULL) AS members_with_beads_30d,
  (SELECT COUNT(DISTINCT user_id) FROM bead_events) AS members_with_beads_ever;

-- ───────────────────────────────────────────────────────────────────
\echo
\echo '════════════════════════════════════════════════════════════════'
\echo ' C7  WisdomRouter activation  (A6 / X9) — LOGS ITEM (30 days)'
\echo '════════════════════════════════════════════════════════════════'
\echo '-- LOGS ITEM: see phase2-readonly-census-logs.sh §C7. No SQL.'

-- ───────────────────────────────────────────────────────────────────
\echo
\echo '════════════════════════════════════════════════════════════════'
\echo ' C8  Greeting tiers  (rank 6 / X11)'
\echo '     relationship_essences rows with morphic_resonance > 0.5; encounter_count distribution.'
\echo '     Rule: 0 → recognition/recollection tiers latent, not live.'
\echo '════════════════════════════════════════════════════════════════'
\echo 'Tier gates (code): recognition = encounter_count > 1 (lib/services/greetingService.ts:124);'
\echo 'recollection = morphic_resonance > 0.5 AND encounter_count > 3 (:164).'
-- source: database/migrations/20251223_create_holoflower_tables.sql (relationship_essences: encounter_count, morphic_resonance, first_encounter, last_encounter)
SELECT
  COUNT(*)                                                             AS rows,
  COUNT(DISTINCT user_id)                                              AS members,
  COUNT(*) FILTER (WHERE morphic_resonance > 0.5)                      AS morphic_gt_0_5,
  COUNT(*) FILTER (WHERE encounter_count > 1)                          AS recognition_tier_eligible,
  COUNT(*) FILTER (WHERE morphic_resonance > 0.5 AND encounter_count > 3) AS recollection_tier_eligible,
  COUNT(*) FILTER (WHERE last_encounter >= '2026-08-13')               AS rows_touched_since_window
FROM relationship_essences;

\echo
\echo '8.b  encounter_count distribution'
-- source: as above
SELECT
  CASE WHEN encounter_count <= 1 THEN '0-1' WHEN encounter_count <= 3 THEN '2-3' WHEN encounter_count <= 10 THEN '4-10'
       WHEN encounter_count <= 50 THEN '11-50' ELSE '51+' END AS encounter_bucket,
  COUNT(*) AS rows
FROM relationship_essences
GROUP BY 1
ORDER BY MIN(encounter_count);

\echo
\echo '8.c  morphic_resonance distribution'
-- source: as above
SELECT
  CASE WHEN morphic_resonance IS NULL THEN '(null)' WHEN morphic_resonance <= 0.3 THEN '0-0.3' WHEN morphic_resonance <= 0.5 THEN '0.3-0.5'
       WHEN morphic_resonance <= 0.8 THEN '0.5-0.8' ELSE '0.8-1.0' END AS morphic_bucket,
  COUNT(*) AS rows
FROM relationship_essences
GROUP BY 1
ORDER BY MIN(COALESCE(morphic_resonance, -1));

-- ───────────────────────────────────────────────────────────────────
\echo
\echo '════════════════════════════════════════════════════════════════'
\echo ' C9  FAST share of turns  (rank 7 / X12) — LOGS ITEM'
\echo '════════════════════════════════════════════════════════════════'
\echo '-- LOGS ITEM: see phase2-readonly-census-logs.sh §C9. DB companion below is a different'
\echo '   instrument (rows written by the elemental trace, not the router) — reported as such.'
\echo
\echo '9.b  DB companion: agent_runs processing_profile share since window (non-sanctuary)'
-- source: database/migrations/20260122000002_fix_agent_runs_schema.sql (agent_runs); processing_profile: database/migrations/20260112000010_add_origin_route_and_processing_profile.sql:8; posture_at_creation: database/migrations/20260718000001_s5_provenance_substrate.sql:382
-- window: since 2026-08-13
SELECT
  COALESCE(processing_profile, '(null)') AS processing_profile,
  COUNT(DISTINCT COALESCE(req_id, id::text)) AS turns_approx,
  COUNT(*)                                AS rows
FROM agent_runs
WHERE created_at >= '2026-08-13'
  AND posture_at_creation IS DISTINCT FROM 'sanctuary'
GROUP BY 1
ORDER BY 3 DESC;

-- ───────────────────────────────────────────────────────────────────
\echo
\echo '════════════════════════════════════════════════════════════════'
\echo ' C10 Socratic regeneration  (rank 8 / X13)'
\echo '     socratic_validator_events by code × decision × tier; FIRE_IN_WATER regenerations.'
\echo '════════════════════════════════════════════════════════════════'
\echo 'Tier = route column (written as processingPath.toLowerCase(), lib/sovereign/maiaService.ts:~691).'
\echo 'Decisions: ALLOW | FLAG | REGENERATE | BLOCK (lib/validation/socraticValidator.ts:87-96).'

\echo
\echo '10.a  decision × route since window'
-- source: database/migrations/20260115000009_socratic_validator_events.sql (route, decision, ruptures jsonb, regenerated, regeneration_attempt, created_at)
-- window: since 2026-08-13
SELECT
  COALESCE(route, '(null)') AS route,
  decision,
  COUNT(*)                                   AS events,
  COUNT(*) FILTER (WHERE regenerated)        AS regenerated,
  COUNT(DISTINCT user_id)                    AS members
FROM socratic_validator_events
WHERE created_at >= '2026-08-13'
GROUP BY 1, 2
ORDER BY 1, 2;

\echo
\echo '10.b  rupture code × severity × route × decision since window (ruptures jsonb array elements)'
-- source: as above; element shape {code, severity} per lib/validation/socraticValidator.ts:235 (code) and severity CRITICAL|VIOLATION|WARNING (maiaService.ts:~697-699)
-- window: since 2026-08-13
SELECT
  r->>'code'                AS code,
  r->>'severity'            AS severity,
  COALESCE(e.route, '(null)') AS route,
  e.decision,
  COUNT(*)                  AS occurrences,
  COUNT(*) FILTER (WHERE e.regenerated) AS on_regenerated_events
FROM socratic_validator_events e
CROSS JOIN LATERAL jsonb_array_elements(CASE WHEN jsonb_typeof(e.ruptures) = 'array' THEN e.ruptures ELSE '[]'::jsonb END) AS r
WHERE e.created_at >= '2026-08-13'
GROUP BY 1, 2, 3, 4
ORDER BY 5 DESC;

\echo
\echo '10.c  FIRE_IN_WATER: events carrying the code, and how many were regenerated'
-- source: as above
-- window: all-time and since 2026-08-13
SELECT
  COUNT(*)                                                   AS fire_in_water_events_all_time,
  COUNT(*) FILTER (WHERE regenerated)                        AS regenerated_all_time,
  COUNT(*) FILTER (WHERE created_at >= '2026-08-13')         AS fire_in_water_since_window,
  COUNT(*) FILTER (WHERE regenerated AND created_at >= '2026-08-13') AS regenerated_since_window
FROM socratic_validator_events
WHERE jsonb_typeof(ruptures) = 'array'
  AND EXISTS (SELECT 1 FROM jsonb_array_elements(ruptures) r WHERE r->>'code' = 'FIRE_IN_WATER');

\echo
\echo '10.d  Volume by month (all decisions) — is the validator writing at all?'
-- source: as above
SELECT date_trunc('month', created_at)::date AS month, COUNT(*) AS events, COUNT(*) FILTER (WHERE regenerated) AS regenerated
FROM socratic_validator_events
GROUP BY 1 ORDER BY 1;

-- ───────────────────────────────────────────────────────────────────
\echo
\echo '════════════════════════════════════════════════════════════════'
\echo ' C11 Bloom scaffolding / default facet / Atlas reachability  (X1a, X8)'
\echo '     [Dialectical Scaffold] count → LOGS; agent_runs MythicAtlas × status × primary=UNKNOWN::UNKNOWN;'
\echo '     default-facet memory integrations.'
\echo '════════════════════════════════════════════════════════════════'

\echo
\echo '11.a  Bloom scaffolding (DB side): cognitive_turn_events with scaffolding_used / scaffolding_prompt present, by month'
-- source: database/migrations/016_cognitive_turn_events.sql (scaffolding_used, scaffolding_prompt, created_at)
-- window: since 2026-08-13
SELECT
  date_trunc('month', created_at)::date AS month,
  COUNT(*)                                          AS cognitive_rows,
  COUNT(*) FILTER (WHERE scaffolding_prompt IS NOT NULL) AS scaffold_prompt_present,
  COUNT(*) FILTER (WHERE scaffolding_used)          AS scaffolding_used,
  COUNT(DISTINCT user_id) FILTER (WHERE scaffolding_used) AS members_scaffolded
FROM cognitive_turn_events
WHERE created_at >= '2026-08-13'
GROUP BY 1 ORDER BY 1;

\echo
\echo '11.b  Atlas reachability: agent_runs agent_name=MythicAtlas × status × source × (primary = UNKNOWN::UNKNOWN)'
\echo '      (finalFacet = atlasResult?.primary ?? UNKNOWN::UNKNOWN, lib/sovereign/maiaService.ts:3021; stub source atlas-stub, 02)'
-- source: database/migrations/20260122000002_fix_agent_runs_schema.sql (agent_name, status, source, output_json, created_at); posture_at_creation: 20260718000001_s5_provenance_substrate.sql:382
-- window: since 2026-08-13
SELECT
  COALESCE(status, '(null)')  AS status,
  COALESCE(source, '(null)')  AS source,
  (output_json->>'primary' = 'UNKNOWN::UNKNOWN')      AS primary_is_unknown,
  (output_json->>'primary') IS NULL                   AS primary_is_null,
  COUNT(*)                    AS rows,
  COUNT(DISTINCT user_id)     AS members
FROM agent_runs
WHERE agent_name = 'MythicAtlas'
  AND created_at >= '2026-08-13'
  AND posture_at_creation IS DISTINCT FROM 'sanctuary'
GROUP BY 1, 2, 3, 4
ORDER BY 5 DESC;

\echo
\echo '11.c  Default-facet memory integrations: developmental_memories.facet_code distribution since window'
\echo '      (EARTH-1 default when Atlas absent, maiaService.ts:3570; whether that value lands in facet_code'
\echo '       is inferred from the write path, not verified here — read the distribution, not a verdict)'
-- source: database/baseline/0001_baseline_2026-09-01.sql:8559 (developmental_memories.facet_code, formed_at)
-- window: since 2026-08-13
SELECT
  COALESCE(facet_code, '(null)') AS facet_code,
  COUNT(*)                        AS rows,
  COUNT(DISTINCT user_id)         AS members
FROM developmental_memories
WHERE formed_at >= '2026-08-13'
GROUP BY 1
ORDER BY 2 DESC;

-- ───────────────────────────────────────────────────────────────────
\echo
\echo '════════════════════════════════════════════════════════════════'
\echo ' C12 Corpus Callosum row volumes  (X8)'
\echo '     agent_runs by origin_route × processing_profile × agent_name;'
\echo '     integration_passes distinct paradoxes_held / tensions_named / confidence values.'
\echo '     Rule: constants confirmed → X8 claim finding observed.'
\echo '════════════════════════════════════════════════════════════════'

\echo
\echo '12.a  agent_runs by origin_route × processing_profile × agent_name since window (non-sanctuary)'
-- source: database/migrations/20260122000002_fix_agent_runs_schema.sql; origin_route/processing_profile: 20260112000010_add_origin_route_and_processing_profile.sql:8; posture: 20260718000001_s5_provenance_substrate.sql:382
-- window: since 2026-08-13
SELECT
  COALESCE(origin_route, '(null)')       AS origin_route,
  COALESCE(processing_profile, '(null)') AS processing_profile,
  COALESCE(agent_name, '(null)')         AS agent_name,
  COUNT(*)                               AS rows,
  COUNT(DISTINCT user_id)                AS members
FROM agent_runs
WHERE created_at >= '2026-08-13'
  AND posture_at_creation IS DISTINCT FROM 'sanctuary'
GROUP BY 1, 2, 3
ORDER BY 4 DESC;

\echo
\echo '12.b  agent_runs last 24h (CLAUDE.md ops diagnostic form)'
-- source: as 12.a
-- window: last 24 hours
SELECT COALESCE(origin_route, '(null)') AS origin_route, COALESCE(processing_profile, '(null)') AS processing_profile, COUNT(*) AS rows
FROM agent_runs
WHERE created_at > NOW() - INTERVAL '24 hours'
  AND posture_at_creation IS DISTINCT FROM 'sanctuary'
GROUP BY 1, 2 ORDER BY 3 DESC;

\echo
\echo '12.c  integration_passes: distinct paradoxes_held / tensions_named / confidence values with counts'
\echo '      (02 G2: audit rows assert paradox-holding, tension and confidence that no mechanism performs;'
\echo '       a single value each across all rows = constant confirmed)'
-- source: database/baseline/0001_baseline_2026-09-01.sql:10547 (integration_passes: paradoxes_held jsonb, tensions_named jsonb, confidence real, created_at) — no CREATE in database/migrations;
--         origin_route/processing_profile: 20260112000010_add_origin_route_and_processing_profile.sql:13; posture_at_creation: 20260718000001_s5_provenance_substrate.sql:387
-- window: since 2026-08-13
SELECT 'paradoxes_held' AS field, COALESCE(paradoxes_held::text, '(null)') AS value, COUNT(*) AS rows
FROM integration_passes
WHERE created_at >= '2026-08-13' AND posture_at_creation IS DISTINCT FROM 'sanctuary'
GROUP BY 1, 2
UNION ALL
SELECT 'tensions_named', COALESCE(tensions_named::text, '(null)'), COUNT(*)
FROM integration_passes
WHERE created_at >= '2026-08-13' AND posture_at_creation IS DISTINCT FROM 'sanctuary'
GROUP BY 1, 2
UNION ALL
SELECT 'confidence', COALESCE(confidence::text, '(null)'), COUNT(*)
FROM integration_passes
WHERE created_at >= '2026-08-13' AND posture_at_creation IS DISTINCT FROM 'sanctuary'
GROUP BY 1, 2
ORDER BY 1, 3 DESC;

\echo
\echo '12.d  integration_passes distinct-value counts (one number each) and volumes by profile'
-- source: as 12.c
SELECT
  COUNT(*)                              AS rows_since_window,
  COUNT(DISTINCT paradoxes_held::text)  AS distinct_paradoxes_held,
  COUNT(DISTINCT tensions_named::text)  AS distinct_tensions_named,
  COUNT(DISTINCT confidence)            AS distinct_confidence,
  COUNT(DISTINCT coherence_score)       AS distinct_coherence_score,
  COUNT(DISTINCT depth_score)           AS distinct_depth_score,
  COUNT(DISTINCT integration_method)    AS distinct_integration_method
FROM integration_passes
WHERE created_at >= '2026-08-13' AND posture_at_creation IS DISTINCT FROM 'sanctuary';
SELECT COALESCE(origin_route, '(null)') AS origin_route, COALESCE(processing_profile, '(null)') AS processing_profile, COUNT(*) AS rows
FROM integration_passes
WHERE created_at >= '2026-08-13' AND posture_at_creation IS DISTINCT FROM 'sanctuary'
GROUP BY 1, 2 ORDER BY 3 DESC;

-- ───────────────────────────────────────────────────────────────────
\echo
\echo '════════════════════════════════════════════════════════════════'
\echo ' C13 Field telemetry  (X8 / 09)'
\echo '     field_orchestrator_telemetry sources; unified completions within 250 ms; pfi_element on FAST.'
\echo '════════════════════════════════════════════════════════════════'
\echo 'LIMIT: ms is the whole-orchestrator duration per row (lib/field/fieldOrchestratorTelemetry.ts:45-48);'
\echo 'the 250 ms figure is the per-module timeout (lib/field/fieldOrchestrator.ts:13,158). A row with'
\echo 'unified in sources and ms <= 250 is the observable proxy for "unified completed within budget";'
\echo 'per-branch timing is not recorded and is not claimed.'

\echo
\echo '13.a  sources distribution (unnested) × path since window'
-- source: database/migrations/20260215210000_field_orchestrator_telemetry.sql (path, ms, sources text[], truncated, pfi_element, created_at)
-- window: since 2026-08-13
SELECT
  COALESCE(path, '(null)') AS path,
  s.source,
  COUNT(*)                 AS rows
FROM field_orchestrator_telemetry t
CROSS JOIN LATERAL unnest(COALESCE(t.sources, ARRAY[]::text[])) AS s(source)
WHERE t.created_at >= '2026-08-13'
GROUP BY 1, 2
ORDER BY 1, 3 DESC;

\echo
\echo '13.b  Rows by path: total, empty sources, unified present, unified present AND ms <= 250'
-- source: as above
SELECT
  COALESCE(path, '(null)') AS path,
  COUNT(*)                                                       AS rows,
  COUNT(*) FILTER (WHERE sources IS NULL OR cardinality(sources) = 0) AS rows_no_sources,
  COUNT(*) FILTER (WHERE 'unified' = ANY(sources))               AS unified_present,
  COUNT(*) FILTER (WHERE 'unified' = ANY(sources) AND ms <= 250) AS unified_present_within_250ms,
  COUNT(*) FILTER (WHERE truncated)                              AS truncated,
  ROUND(AVG(ms))                                                 AS avg_ms,
  MAX(ms)                                                        AS max_ms
FROM field_orchestrator_telemetry
WHERE created_at >= '2026-08-13'
GROUP BY 1
ORDER BY 2 DESC;

\echo
\echo '13.c  pfi_element histogram on FAST since window'
-- source: as above
SELECT COALESCE(pfi_element, '(null)') AS pfi_element, COUNT(*) AS rows
FROM field_orchestrator_telemetry
WHERE created_at >= '2026-08-13' AND path = 'FAST'
GROUP BY 1 ORDER BY 2 DESC;

\echo
\echo '13.d  pfi_field_work_safe × unified_coherence_level on FAST since window (X1 field-safety input)'
-- source: as above (pfi_field_work_safe, unified_coherence_level)
SELECT COALESCE(pfi_field_work_safe::text, '(null)') AS pfi_field_work_safe, COALESCE(unified_coherence_level, '(null)') AS unified_coherence_level, COUNT(*) AS rows
FROM field_orchestrator_telemetry
WHERE created_at >= '2026-08-13' AND path = 'FAST'
GROUP BY 1, 2 ORDER BY 3 DESC;

-- ───────────────────────────────────────────────────────────────────
\echo
\echo '════════════════════════════════════════════════════════════════'
\echo ' C14 Pattern ledger / member patterns  (X3, rank 5)'
\echo '     pattern_ledger / member_patterns by status; whether the Active Patterns block ever renders.'
\echo '     Rule: 0 rows → block latent.'
\echo '════════════════════════════════════════════════════════════════'
\echo 'Rendering marker: NONE exists — lib/memory/MemberLiveContext.ts:505-512 builds the block without'
\echo 'a log line (see logs script §C14). Reader filters in code: status NOT IN (retired) '
\echo '(lib/patterns/getMemberPatterns.ts:110), status NOT IN (rejected, retired) (PatternDetectionService.ts:305).'
\echo 'Rows in a renderable status are the ceiling of rendering, not evidence that it rendered.'

\echo
\echo '14.a  pattern_ledger by status (all-time) and members'
-- source: database/migrations/20260204100001_pattern_ledger.sql + 20260315120000_pattern_ledger.sql (status emerging|offered|confirmed|partial|rejected|retired, member_id, times_offered, created_at)
SELECT
  status,
  COUNT(*)                                  AS rows,
  COUNT(DISTINCT member_id)                 AS members,
  COUNT(*) FILTER (WHERE times_offered > 0) AS ever_offered,
  COUNT(*) FILTER (WHERE created_at >= '2026-08-13') AS rows_since_window
FROM pattern_ledger
GROUP BY 1
ORDER BY 2 DESC;

\echo
\echo '14.b  member_patterns by status (all-time) and members'
-- source: database/migrations/20260316000003_member_patterns.sql (status emerging|offered|confirmed|rejected, member_id, created_at)
SELECT
  status,
  COUNT(*)                  AS rows,
  COUNT(DISTINCT member_id) AS members,
  COUNT(*) FILTER (WHERE created_at >= '2026-08-13') AS rows_since_window
FROM member_patterns
GROUP BY 1
ORDER BY 2 DESC;

\echo
\echo '14.c  Members holding at least one renderable pattern_ledger row (status NOT IN retired, rejected)'
-- source: as 14.a
SELECT
  COUNT(DISTINCT member_id) AS members_with_renderable_rows,
  COUNT(*)                  AS renderable_rows
FROM pattern_ledger
WHERE status NOT IN ('retired', 'rejected');

-- ───────────────────────────────────────────────────────────────────
\echo
\echo '════════════════════════════════════════════════════════════════'
\echo ' C15 Decay reaching the prompt  (rank 5 / TM F2)'
\echo '     Rendered bullets for the two F2 members via the existing selectionTrace.'
\echo '     Rule: answers the Temporal Memory open question.'
\echo '════════════════════════════════════════════════════════════════'
\echo '-- NOT RUNNABLE AS SPECIFIED: selectionTrace is derived in-process after the maxBullets cut'
\echo '   (lib/memory/MemoryBundle.ts:164-188) and is neither persisted to any table nor written to a'
\echo '   log line; the only consumer holds it in a local variable (app/api/voice/stream-conversation/'
\echo '   route.ts:1172,1205). The log side has only the bullet COUNT ([MemoryBundle] Built: N bullets,'
\echo '   MemoryBundle.ts:182) — see logs script §C15. Capturing rendered bullets for members'
\echo '   17a14614 / 2cea65b7 needs a trace emission, which is a code change and is not authorized here.'
\echo
\echo '15.b  Nearest persisted observable: memory_transition_records for the two F2 members'
\echo '      (retrieved → eligible → offered → injected counts by source_type; whether this table is'
\echo '       written on the live path is not established by this query — zero rows is also a finding)'
-- source: database/migrations/20260804000001_memory_transition_records.sql (member_id uuid, source_type, retrieved_count, eligible_count, offered_count, injected_count, selection_reasons, created_at)
-- window: since 2026-08-13
SELECT
  LEFT(member_id::text, 8) AS member_prefix,
  source_type,
  COUNT(*)                 AS records,
  SUM(retrieved_count)     AS retrieved,
  SUM(eligible_count)      AS eligible,
  SUM(offered_count)       AS offered,
  SUM(injected_count)      AS injected,
  MAX(created_at)::date    AS last_record
FROM memory_transition_records
WHERE member_id::text LIKE '17a14614%' OR member_id::text LIKE '2cea65b7%'
GROUP BY 1, 2
ORDER BY 1, 2;

\echo
\echo '15.c  memory_transition_records volume since window (all members) — is the table live at all?'
-- source: as above
SELECT source_type, COUNT(*) AS records, COUNT(DISTINCT member_id) AS members, MAX(created_at)::date AS last_record
FROM memory_transition_records
WHERE created_at >= '2026-08-13'
GROUP BY 1 ORDER BY 2 DESC;

\echo
\echo '15.d  F2 precondition still holds? Developmental pool size for the two members (top-12 cut applies when > 12)'
-- source: database/baseline/0001_baseline_2026-09-01.sql:8559 (developmental_memories); valid_to: 20251231_memory_architecture_enhancements.sql
SELECT
  LEFT(user_id::text, 8) AS member_prefix,
  COUNT(*) FILTER (WHERE content_text IS NOT NULL AND (valid_to IS NULL OR valid_to > NOW())) AS open_candidate_rows,
  (COUNT(*) FILTER (WHERE content_text IS NOT NULL AND (valid_to IS NULL OR valid_to > NOW())) > 12) AS top12_is_a_cut
FROM developmental_memories
WHERE user_id::text LIKE '17a14614%' OR user_id::text LIKE '2cea65b7%'
GROUP BY 1
ORDER BY 1;

-- ───────────────────────────────────────────────────────────────────
\echo
\echo '════════════════════════════════════════════════════════════════'
\echo ' C16 consciousness_journey_stage writer  (10 D9)'
\echo '     Null-count. Rule: —'
\echo '════════════════════════════════════════════════════════════════'
\echo 'Table is user_relationship_context (the map page names it relationship_contexts; the store reads'
\echo 'user_relationship_context — lib/memory/stores/RelationshipContextStore.ts:37).'
-- source: database/migrations/20241202000001_create_session_memory_tables.sql (user_relationship_context: consciousness_journey_stage, total_sessions, updated_at)
SELECT
  COUNT(*)                                                    AS rows,
  COUNT(*) FILTER (WHERE consciousness_journey_stage IS NULL) AS stage_null,
  COUNT(*) FILTER (WHERE consciousness_journey_stage IS NOT NULL) AS stage_not_null,
  COUNT(*) FILTER (WHERE updated_at >= '2026-08-13')          AS rows_updated_since_window
FROM user_relationship_context;

\echo
\echo '16.b  Distinct stage labels (system vocabulary, not member content) with counts'
-- source: as above
SELECT COALESCE(consciousness_journey_stage, '(null)') AS stage, COUNT(*) AS rows
FROM user_relationship_context
GROUP BY 1 ORDER BY 2 DESC;

-- ───────────────────────────────────────────────────────────────────
\echo
\echo '════════════════════════════════════════════════════════════════'
\echo ' C17 Practice cycles  (rank 4 / 07, 08)'
\echo '     member_field_note_threads with responds_to_thread_id; practice_sessions count;'
\echo '     occupancy ratings; about_practice row for now-what.'
\echo '════════════════════════════════════════════════════════════════'

\echo
\echo '17.a  member_field_note_threads: total, replies (responds_to_thread_id), by authorship × consent_state'
-- source: database/migrations/20260626000001_member_field_note_threads.sql (authorship, consent_state, member_confirmed, created_at); responds_to_thread_id: database/migrations/20260828000002_field_note_responds_to.sql
SELECT
  authorship,
  consent_state,
  COUNT(*)                                                AS threads,
  COUNT(*) FILTER (WHERE responds_to_thread_id IS NOT NULL) AS replies,
  COUNT(*) FILTER (WHERE member_confirmed)                AS member_confirmed,
  COUNT(DISTINCT member_id)                               AS members,
  COUNT(*) FILTER (WHERE created_at >= '2026-08-13')      AS threads_since_window
FROM member_field_note_threads
GROUP BY 1, 2
ORDER BY 3 DESC;

\echo
\echo '17.b  Reply chains by month since window'
-- source: as above
-- window: since 2026-08-13
SELECT date_trunc('month', created_at)::date AS month,
       COUNT(*) AS threads,
       COUNT(*) FILTER (WHERE responds_to_thread_id IS NOT NULL) AS replies,
       COUNT(DISTINCT member_id) FILTER (WHERE responds_to_thread_id IS NOT NULL) AS members_replying
FROM member_field_note_threads
WHERE created_at >= '2026-08-13'
GROUP BY 1 ORDER BY 1;

\echo
\echo '17.c  practice_sessions count by session_type × processing_status; practitioners'
-- source: database/migrations/20260110000001_practice_sessions.sql (practitioner_id, session_type, processing_status, started_at, created_at)
SELECT
  COALESCE(session_type::text, '(null)')      AS session_type,
  COALESCE(processing_status::text, '(null)') AS processing_status,
  COUNT(*)                                    AS sessions,
  COUNT(DISTINCT practitioner_id)             AS practitioners,
  COUNT(*) FILTER (WHERE created_at >= '2026-08-13') AS sessions_since_window
FROM practice_sessions
GROUP BY 1, 2
ORDER BY 3 DESC;

\echo
\echo '17.d  Occupancy ratings: score histogram (1-5), practitioners, clients'
-- source: database/migrations/20260312000002_session_occupancy_ratings.sql (score smallint, practitioner_id, client_id, rated_at)
SELECT
  score,
  COUNT(*)                        AS ratings,
  COUNT(DISTINCT practitioner_id) AS practitioners,
  COUNT(DISTINCT client_id)       AS clients,
  COUNT(*) FILTER (WHERE rated_at >= '2026-08-13') AS ratings_since_window
FROM session_occupancy_ratings
GROUP BY 1
ORDER BY 1;

\echo
\echo '17.e  about_practice row for now-what — presence, length, ratification, and whether the invented'
\echo '      domain word "attention" (07: PRACTICE_FIELD_SCOPE_MISMATCH_FINDING) still appears.'
\echo '      The text itself is NOT selected. Column is field_slug (the spec says slug).'
-- source: database/migrations/20260701000001_practice_fields.sql (about_practice, status); field_slug: database/migrations/20260710000001_practice_field_slug.sql; identity_ratified_at: database/migrations/20260710000002_practice_field_revisions.sql
SELECT
  field_slug,
  status,
  (about_practice IS NOT NULL)            AS about_practice_present,
  LENGTH(about_practice)                  AS about_practice_chars,
  (about_practice ILIKE '%attention%')    AS mentions_attention,
  identity_ratified_at,
  updated_at::date                        AS updated_on
FROM practice_fields
WHERE field_slug = 'now-what';

\echo
\echo '════════════════════════════════════════════════════════════════'
\echo ' C18 Voice feedback-prevention rejects  (05 V4) — LOGS ITEM'
\echo '════════════════════════════════════════════════════════════════'
\echo '-- LOGS ITEM: see phase2-readonly-census-logs.sh §C18 (NOT RUNNABLE from container logs —'
\echo '   the marker is a browser-side console.warn, components/OracleConversation.tsx:6735). No SQL.'

\echo
\echo 'Done. SELECT-only; no writes issued; scope C1–C18.'
