# Pro Studio / MAIA R5i — Chart-Origin Eligibility in Prompt Readers
2026-10-14 · **LOCAL SECURITY INTEGRATION CANDIDATE — NO BETA DEPLOYMENT**

## Exact ancestry, preservation, and failures
- Parent/frozen failed R5h integrated candidate:
  `2887e4480f4c26871caae9bb91e3fbfbcbb9e828`, remains unmodified.
- Isolated new R5i worktree:
  `/Volumes/T7 Shield/pro-studio-r5i-origin-reader-20261014`
  branch `fix/pro-studio-r5i-origin-reader-20261014`.
- R5h itself combined R5gA `612cc9b53f4dfcca2693cd0fcf2a521cbf43d872`
  (R5f atomic consent/identity and verified recall preferences) with
  **129 direct and three manually reconciled paths** from the exact R4L
  chart-private patch staged digest
  `ee7cd2bb4d5280415e9be9cd0642386d2e86fb718aa69726c2a3b28c8340d5e5`.
  The R4L source includes four held SQL migrations, founder-disabled
  official chart SEND, protected-origin registries, origin inheritance,
  unknown-history quarantine, natal/BaZi implicit transfer OFF.
- Previous R5h: 440/440 tests, no-new-TypeScript errors (212 vs baseline
  239), production build and compiled History GET/POST passed.
  A second direct **runtime** test using the real MAIA developmental loader
  on a restored fictional PG16 **FAILED**: a chart-derived memory
  labeled `origin_scope='ordinary'` but pointing to protected chart
  session `fiction-chart-once-A` was admitted for prompting. Source
  `lib/maia/memoryLoaders.ts:loadRecentDevelopmentalMemories` lacked the
  protected-origin anti-join despite checking ordinary+known source label.
  Failed source SHA remains review evidence; do not relabel R5h PASS.

## R5i correction — SQL source authority, not UI classification
1. Developmental prompt-reader SQL now requires authenticated member ownership,
   `origin_scope='ordinary'`, non-null source_session_id and a
   `NOT EXISTS` check against BOTH the immutable
   `astro_maia_protected_origins` and `astro_maia_transfer_grants`
   registries. A separate source-exchange ancestry check disqualifies a
   row whose `source_session_id` is deliberately/mistakenly listed as
   ordinary but whose `source_exchange_id` was actually created in a
   protected chart session.
2. Member-marked episodic recall now excludes the same protected session
   registry both through `source_session_id` and originating
   `source_turn_id`. Explicitly marking an old chart conversation does
   NOT, alone, authorize chart reuse in a later conversation.
3. Missing source registries trigger SQL failure and the existing
   reader's empty-array fail-closed behavior. No read becomes permission
   on database outage; unrelated, correctly source-qualified ordinary
   material remains eligible.
4. No new migration or feature activation; official R4F transfer
   `R4F_MAIA_SEND_ACTIVATION_APPROVED = false` remains hard-OFF.

## Specific actual fictional PostgreSQL verification
The revised exact R5i source ran the real `memoryLoaders` functions
on a disposable PG16 with R4F–R4I migrations, fictional A/B accounts,
registered chart origin and an explicit ordinary recall setting:
- Ordinary A cross-session turn remained prompt-eligible.
- A registered one-time chart prior turn did not reach the prompt block.
- Ordinary A developmental memory remained eligible.
- Protected-chart-derived memory labeled ordinary was excluded.
- A derivative with ordinary source_session_id but protected
  source_exchange_id was also excluded.
- Historical unknown-provenance memory was quarantined.
- Member-marked ordinary episode remained eligible, but member-marked
  protected chart episode and misleading ordinary session label with
  protected source_turn_id were excluded.
- Deleting the one-use chart grant did not remove its immutable
  protected-origin marker or reopen any chart/derivative/episode recall.
- Member B was denied all A prior conversation.
Tests were fictional/localhost only, with automatic database teardown.

New focused source tests check member/SQL predicates, both registries,
episode source lineage, fail-closed unavailable registry and ordinary
eligibility. Re-run exact full Jest/TypeScript/production-build after
freezing candidate before a technical release-qualification claim.

## Specific limits, including user-provided nonclassified chart text
**This proves only registered chart-origin/provenance protection**. An
arbitrary chart passage pasted by a member into an old unclassified
ordinary chat (with no protected registry, source tagging or per-passage
receipt) cannot be inferred safely from text alone. The separate
chart-passage recall grant and historical mixed-content provenance
adjudication remain unimplemented and are an explicit Class A
privacy/release blocker. A broad privacy blanket that disables all
prior conversation would also disable settled ordinary continuity
and is NOT accepted as a substitute.

The R4L subset is not the entire parallel Writer's Studio R4L
candidate. Further independent QA must inspect all other memory
writers and prompt producers, voice/Scribe and theme/episodic
historical ancestry, per-passage revocation and historical restore.

## Release holds
- Independently qualified human Class A security/privacy acceptance,
  including founder's interim-review role/independence distinction.
- R20 separately signed deletion-safe recovery and revocation-safe
  historical backups.
- Genuine full MAIA model/voice response, member-owned continuity,
  consent and physical iOS Safari.
- Exact production image, ingress cache/feature flags, backup rollback,
  consented cohort and distinct founder/operator exact tester-only GO.
- Zero production/live member operations, merges or tester invitations.

Tracking:
https://github.com/SoullabTech/Sovereign/issues/1817
https://github.com/SoullabTech/Sovereign/issues/1819
https://github.com/SoullabTech/Sovereign/issues/1816
