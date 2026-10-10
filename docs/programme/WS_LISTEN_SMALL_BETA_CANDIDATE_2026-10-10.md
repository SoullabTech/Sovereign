# Writer's Studio Listen — Small Beta Candidate (2026-10-10)

## Disposition: PREPARED FOR RELEASE REVIEW — NOT AUTHORIZED TO DEPLOY

Engineering branch: fix/ws-listen-beta-candidate-20261010.

Components:
- Voice-field Listen baseline: 304d97f7ed85788ab42f211e6ce28f3015e27692
- Section-return repair: 93ab268961
- Explicit original/converted WAV download options: edd8523dd9
- Server-only Listen cohort gate + feedback: 0d417abe5a859d0fc7b81bd1a8f182be3e2b7f7f
- Canonical Writers Studio page checks a verified identity and Listen entitlement before rendering Listen. Write, Develop and Review are unchanged.
- Original WebM/M4A remains available. Converted WAV is 48 kHz/24-bit PCM, labelled as conversion, not lossless original.
- Audio stays in the browser session only. Every author must download takes before leaving.

## Verified evidence

- Final candidate: 29 Listen Vitest tests passed (six suites), including exact cohort admission, WAV RIFF encoding, mic meters and mono route.
- Final candidate: 53 targeted Jest tests passed (ten suites), including Write section return, hierarchy, safety holds and Listen feedback mode.
- Browser negative test: unconfigured Listen denied, recording interface absent; Write still usable.
- WAV download positive browser test was completed on the earlier separated feature branch: synthetic microphone produced a valid 48 kHz 24-bit mono WAV and kept the original available. Repeat on the exact final candidate before rollout.
- Founder witnessed live Scarlett microphone gain/meter functionality on local Studio. Real source recording/download/replay and mobile Safari require final acceptance on the integrated target.
- Repository-wide compilation/build is NOT certified; a prior broad core TypeScript check reported unrelated existing errors. Require final-build proof or bounded diagnosis at exact release SHA.

## Production access boundary

Production running reader at review: c9e4f7f7e. Read-only roster count: 52 nondeleted general beta tester contacts, 52 active, **41 linked and active**. These 41 are NOT automatically the small Writer's Studio cohort.

Separate server-only environment allowlists:
- WRITERS_STUDIO_LISTEN_BETA_MEMBER_IDS: explicit, exact verified identities. Each must also hold an active linked beta-tester record.
- WRITERS_STUDIO_LISTEN_WITNESS_MEMBER_IDS: exact approved founder/testing witnesses for environments where founder accounts are not marked by admin_role. No broad team-admin admission or wildcard allowed.
- Without allowlist configuration, ordinary beta accounts are refused. Existing founder_witness authority remains accepted.
- No member was enrolled or granted access through this review.

Test two distinct authenticated accounts for exact admission and cross-member refusal before sending invites. Some new beta writers may need manuscript import: Materials/source saving still returns HTTP 423, so unrestricted importing is out of scope and must not be promised. Offer this pilot only for established manuscripts unless the Sanctuary + crash-safe upload review completes.

## Database and release STOP

Four production-pending SQL migrations relative to reader c9e4f7f7e:
1. 20261002000002_writer_studio_chapter_overview_lens.sql — changes existing developmental_readings CHECK/function; old-reader compatibility critical.
2. 20261005000001_writer_studio_work_directives.sql — append-only Work directive/event tables.
3. 20261006000001_writer_studio_completion_checks.sql — writer completion adjudications.
4. 20261007000001_craft_version_choices.sql — saved choice table.

None is applied in the production ledger. The reader-only quick prepare/cutover path refuses pending migrations. A separately approved full migration/release rehearsal is required.

Required order:
1. Authorize, install and verify the Caddy safety fence for old/new ingress, including legacy source writers.
2. Prepare exact pending-set, old-reader compatibility and review custody record/review/trace evidence. Prove crash recovery, filesystem custody and old/new coexistence. Stop on gaps.
3. Build and rehearse the exact candidate in a schema-compatible environment, including rollback and real nonfounder access/isolation, desktop/Mac/mobile Safari and Listen recorder/download.
4. Freeze image/artifact and run gated prepare; separately authorize cutover and 30-minute observation with rollback readiness.
5. Only after those gates: invite the few specifically approved beta writers.

No migration, production schema change, access change, provider call, beta invitation or deployment was made. This evidence does not authorize deployment.
