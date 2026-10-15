# Jarvis — Writer's Studio beta consent gate

**Date:** 2026-10-15
**Disposition:** ISOLATED SOURCE + FICTIONAL DATABASE QUALIFICATION. NOT DEPLOYED. REAL TESTER ADMISSION CLOSED.

## Accepted current baseline
- Current protected beta: `5c44ce936f2325270d94fe5d0074758bde7be6f1`, working at `https://beta.soullab.life/signin`.
- Production, public Caddy route, beta DB and persistent original-file vault unchanged.
- Beta access currently requires exact writer allowlist + active tester contact but DOES NOT YET require dedicated beta consent. This is the gap the candidate addresses.
- The founder/CTO's separate verified internal witness route is not equivalent to or evidence of participant consent.

## Candidate implementation (separate branch; no migration applied live)
- Proposed additive migration: `20261015000001_writer_studio_beta_consent_events.sql`.
- Minimal metadata-only event sequence: member UUID, actor UUID (self-member invariant), accepted/revoked decision, exact policy version, SHA-256 of approved notice, monotonic sequence ID and timestamp. No source content, email, message, filename or IP captured.
- App admission requires all THREE participant conditions: exact approved member ID, currently active Writer's Studio tester contact, and latest `accept` event matching the exact configured notice version and hash.
- Missing/unapproved notice, later revocation, old version, changed text hash, unknown member or database failure => access refused.
- No consent-writing endpoint or approved member-facing notice was invented. The candidate **cannot** be deployed as-is without locking the fictional testers out: sign-in currently invokes the full admission check.

## Two-step entry contract required before deployment
1. **Pre-consent candidate:** verified credentials + exact cohort allowlist/contact; no Work, manuscript, MAIA or protected API permission. The separate `writerStudioBetaPreConsentCandidate()` function is available for this future pathway but is NOT by itself a grant.
2. **Member-visible notice:** final approved text and immutable SHA-256; explicit individual action accepted by the member through their VERIFIED authenticated session (never an email-link assumption, admin surrogate, or client-supplied member ID).
3. **Consent event:** one append-only event written server-side using the verified member as both subject and actor. The database equality constraint is not a substitute for authenticating this POST endpoint.
4. **Full Studio permission:** edge authorization checks the latest consent event for the active policy, on every protected entry request. Future policy revisions require fresh consent.
5. **Revocation:** append member revocation and deny subsequent writing/model access. Preserve a separate member-authenticated route for exporting and deleting the member's own writing after revocation, subject to agreed retention and recovery terms.
6. **Deletion and custody:** include retention of original uploads, backup treatment on revocation/deletion and an audited erasure schedule; existing deletion and vault obligations remain separate.
7. **Independent signoff:** approve exact consent wording, third-party model disclosures, retention/backup text, proof of self-acceptance, access enforcement, and privacy review.

## Qualification already performed
- 30/30 targeted consent/admission/authentication tests passed.
- 184/184 broader Studio/beta tests across 15 suites passed.
- Proposed SQL applied cleanly to a **restored fictional** PostgreSQL database in a Docker internal network with no exposed port; public beta schema unchanged.
- Eight fictional database receipt checks passed: initial absence; valid member acceptance; later revocation wins; old notice refused; changed hash refused; fresh exact acceptance restores; cross-member actor mismatch rejected by CHECK; exactly five test event records retained.
- Only fictional members were used; no invitation, real consent, account enrollment, paid MAIA call or production change occurred.

## Release blockers
- An actual, approved consent notice is not available. Do not invent acceptance or auto-grant consent.
- Complete two-step pre-consent screen/API/Caddy exception design, strictly protected by session authentication; the closed beta sign-in cannot require full consent before allowing the member to reach the consent screen.
- Qualified member revocation followed by protected self-export and self-deletion.
- Independent real-data encrypted offsite backup with separately administered key custody is still not qualified. T7 itself remains unencrypted.
- Human privacy/security review and named real-tester approval remain required.
- No automatic unclaimed-upload deletion has been approved; the 24-hour figure remains a **hypothetical test parameter**, not a live policy.

**Do not apply the migration, configure a policy version/hash, modify the public Caddy policy, or admit real members without separate review and approval.**
