# Writer's Studio — Listen + Publish combined release review

Date: 2026-10-10. Status: engineering evidence only. No migration, ingress change, production deployment or beta entitlement granted.

## Integrated engineering candidate
- Worktree: /Users/soullab/ws-beta-publish-rehearsal-20261010
- Branch: fix/ws-beta-publish-rehearsal-20261010
- Source beta candidate: 6d36fcf0c88144196ab3d6bac654387880f7dca1
- Bounded Publish preparation commit: e0d4d3e325d739f66db4cf82e4e68214a7f32c26; cherry-picked as a92b0a7368.
- Incorporates live Scarlett voice field, mono routing, original and converted WAV downloads, section-return repair, explicit Listen-only small-cohort gate, feedback mode, and target-aware KDP/Kindle/print/Soullab Press preparation.
- Soullab Press is always optional, never an automatic submission, agreement, rights transfer, or acceptance.

## Local evidence
- 6 Listen Vitest suites: 29/29 passed.
- 11 focused Studio Jest suites, including Publish: 58/58 passed. Total 87/87 for this declared subset; NOT a full-repository regression certification.
- Separate localhost browser with authenticated local test account opened Publish and read live preflight for ELEMENTAL_ALCHEMY with 262 sections. GET /api/sovereign/manuscripts/{id}/render returned HTTP 200.
- The panel offered Amazon KDP and Soullab Press and made the author-decision boundary visible. No POST/PATCH/PUT/DELETE was emitted in the observed browser review.
- Initial instantaneous panel inspection was too early; subsequent settled-view inspection displayed all choices. No output file was actually generated or published.
- Listen source-authority and upload safeguards remain separate: the normal member source POST and reviewed edit paths are intentionally held closed in the candidate.
- No full production build at this combined head; no Safari or independent member session walkthrough yet.

## Production observations — read-only
- Running application image identity: c9e4f7f7e.
- Existing developmental_readings CHECK is for the eight pre-overview lenses. Migration 20261002000002 expands it and rewrites a trigger validation function.
- member_manuscripts has the required UNIQUE (id,member_id) supporting the pending completion-check owner FK.
- Five referenced parent tables were observed present: developmental_readings, living_works, member_manuscripts, members, proposal_versions. This is prerequisite inspection, not old-reader compatibility or per-prefix certification.
- Four pending migrations between live reader and candidate remain absent from the production schema_migrations ledger. Reader-only quick prepare/cutover is therefore not eligible.
- Running maia-caddy observed healthy, but its active Caddyfile does not contain the source-write fence paths. Independent Materials engineering branch fix/materials-beta-server-gate-20261008 already includes a separately reviewed candidate and a 2026-10-10 exact-live-file, matching-Caddy-version preflight in docs/ops/SOURCE_CUSTODY_CADDY_EDGE_PREFLIGHT_2026-10-10.md. That record expressly says authorization has NOT been granted and the fence is NOT installed.
- The Caddy-only proposal would temporarily refuse POST/PUT/PATCH to /api/writers-studio/sources and /api/book-studio/workbench/uploads collection/item paths (HTTP 423), including founder Book Studio sanctuary-metadata PATCH. GET/DELETE are outside its new matcher. It would not authorize source reopening, database migration or application deployment.

## Rolling invited-writer roster observations
- The roster remains uncapped and invitation-only.
- Read-only production ops_contacts name matching found Andrea Fagan active and member-linked, Nathan Kane and Andrea Nezat active but unlinked. Other named prospective writers were not returned under those names. Member-directory read separately found Nathan Kane in the founder/CTO authorization class and Andrea Fagan as an ordinary member. Contact status is not sign-in proof.
- CJ Puotinen is on the proposed roster on evidence of a September 3 message about Writer's Studio testing; validated email and linked Soullab membership remain unknown. Do not invent identity, send mail, or grant access yet.
- General production beta contact census includes 41 linked active contacts: do not admit all of them to this specifically approved pilot.

## Next lawfully possible action and STOP
1. Independently approve Caddy-only source-writing fence scope, then re-witness exact production Caddyfile hash/version/current ingress and validate insertion-only overlay before any installation. Maintain rollback and untouched old application. Source-custody engineering lane owns the action.
2. Separately commission migration review-custody record/review/trace at exact old reader, pending set and candidate hash. Prove old-reader and prefix compatibility, lock behavior, crash recovery and rollback before schema writes.
3. Verify one approved ordinary member's sign-in and access, one excluded ordinary member, two different manuscript owners, mobile Safari, publish/read-only, Listen recording/download and Work return against a frozen final build. Resolve any upload-onboarding promise before invitations.
4. Freeze exact image, rehearse prepare, and obtain independent cutover approval with immediate 30-minute observation.

STOP: no production installation, migration, deployment, security grant or beta enrollment is authorized by this note.
