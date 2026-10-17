# R72 — Member-authored proposals, current Writer consent, and protected author Apply/Undo

**October 17, 2026 · isolated Mac Studio source from R71 `5d675493456ff079026df88315a38f0d1954b583` · local fictional-only · production five-writer beta HOLD**

## Product direction proven without fabricating MAIA

R71 accepted a real PC3/WebKit selected passage → reviewed synthetic revision → separate author Apply → separately approved Undo on actual localhost Next.js and PostgreSQL, with immutable Source and seven appended draft history revisions. Its options were hardcoded test strings and there was **no active member notice, approved consent, or authorship record**.

R72 replaces those options in its **fiction-only** environment with **two formulations typed by the fictional writer** into the actual Studio. A real, member-authenticated local Next route stages a single immutable `proposal_chains` locus, then two `proposal_versions` in genuine repository schema; the author is *server-derived as `member`*, not browser-supplied. The R54 editorial panel then presents the member's own stored versions, and R71's existing same-transaction one-use approval and canonical section-native writer performs explicitly reviewed Apply and separately reviewed Undo. Only the existing proposal-version store holds alternate wording; R71's approval ledger holds no prose.

**No content may be presented as MAIA-authored merely because a client or row claims `author='maia'`.** The R72 resolver currently accepts `author='member'` only. MAIA authorship requires an independently verified actual MAIA producing turn, provider and exact model attribution, provenance-bearing proposal custody and current consent; none has been staged or inferred in this acceptance.

## Real app beta consent reused, not reinvented

The same disposable PostgreSQL16 setup applies the actual `20261015000001_writer_studio_beta_consent_events.sql` schema plus existing `proposal_chains`/ `proposal_versions`. Only invented members, sessions and a tiny isolated compatibility `ops_contacts` seed exist. The fixture generates a synthetic, conspicuously nonproduction notice and SHA-256 and seeds one member's initial `accept`; it does not alter any production notice or account.

The R72 backend calls actual `verifiedBetaConsentNotice`, `explicitlyApprovedWriterMember`, and `writersStudioBetaAccess`, then also reads latest consent event inside the same draft transaction. This check applies to stage, review, Apply, Undo review, Undo, and state read when the exact R72 flag is on. An explicit fictional member revocation appends a later `revoke` event. A subsequent real authenticated editorial GET and a subsequent proposal-stage POST both return 403. There is no automatic reacceptance.

This establishes *sequential current-consent enforcement*, not an independent atomic cross-process revocation/key fence. Real hosted consent changes must be serialized with manuscript commits and reviewed before production approval.

## Constrained source and activation

- New: `lib/writersStudio/recovery/r72MemberProposalConsent.ts` — current-consent and member-owned proposal/version lookup; MAIA attribution refused.
- New: `app/api/writers-studio/r72-fixture-proposals/route.ts` — development **localhost only**, exact fiction flags, fict `ws_atomic` database, verified session, same-origin POST, closed request vocabulary. This is not a production writer service.
- Existing R71 author-action module, R71 route and PC3 bridge are extended **only** when `R72_MEMBER_PROPOSALS_FIXTURE=fictional-only` and corresponding browser-only fiction flag are set. R71 normal/default-off behavior and older editorial routes stay held.
- R71's `wsR71FictionalApproval.sql` remains under `scripts/ops/fixtures`, outside all production migrations; R72 adds no production schema. All real proposals in this test use existing source migrations, applied exclusively to disposable PG.
- The R72 WebKit runner streams only step-name markers, not writer or proposed text, to a private evidence log. A WebKit teardown hang in an earlier trial was isolated to per-context closure; the owning browser now closes its disposable contexts together, with cleanup checked.

## Precommit physical acceptance

Unique failed and successful runs are preserved. **R72 precommit v4** passed:
- **74/74** genuine WebKit browser assertions: Press import/retry, real Write and Review, ordinary author Save/History/restore, exact passage selection, two manually entered member formulations in immutable succession, contextual choice, explicit one-use Apply, independent Undo review, explicit Undo, and 390px mobile Press/Review.
- **60/60** disposable PostgreSQL16/schema/session/consent/revision/ownership/privacy/cleanup checks. Seven immutable draft revisions remain, Source is unchanged, one Work/Source/Draft survives, exactly two immutable proposal versions have `author='member'` and the correct member/manuscript/draft/section/base version.
- Browser attempts to assert MAIA authorship were rejected **400**; 0 `author='maia'` proposal versions were created. Replay of each spent Apply/Undo token returned **409**; foreign Origin **403**; another authenticated member was denied the manuscript, draft, revision history, editor approval state and Apply token.
- The member's later consent revoke became latest by `seq`, and both further editorial-state read and further proposal staging were denied **403**.
- No external model/provider requests or real member data. No production changes, GitHub push, PR, merge, deployment or beta enrollment. Temporary WebKit, Next.js, vault files and exclusively owned PostgreSQL container were closed/removed.

**Precommit evidence:** `/Volumes/T7 Shield/ws-beta-r72-member-proposals-consent-precommit-v4-20261017/`. An exact-commit postcommit run is required before this source can be frozen.

## Explicit outstanding beta gates

R72 accepts only invented member-written proposals in a disposable database. It **does not** provide genuine MAIA inference and exact model attribution, a real production consent notice, encrypted private proposal custody or publisher keys, production database/WAL/backup encryption, consent-vs-commit revocation fencing, cold/offsite restore, source migration of legacy plaintext, document uploads/exports, clean shipping typecheck/image, Mac Safari and physical iPhone author workflow, or founder-approved real canary admission.

The approved product direction remains conventional, production-grade writer security first. An independently managed sovereign key service may be a later upgrade. The next beta-critical junction is verified MAIA turn/proposal provenance and production-compatible confidential proposal persistence, with **no silent promotion** from an observation to a member-approved version. Do not bypass the R71 one-use author approval or enable legacy plaintext editorial routes.

## Reproduction boundary

Re-run only after a clean committed isolated R72 candidate, using cached `postgres:16.13`, no `.env` or `.env.local`, and a NEW T7 evidence path with both R63/R66 fictional-only flags. The runner itself creates ephemeral synthetic notice/consent and marks the R71/R72 service flags; do not configure these in an actual hosted service.
