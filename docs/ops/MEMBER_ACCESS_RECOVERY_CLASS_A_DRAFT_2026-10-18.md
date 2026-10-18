# Member Access recovery — Class A isolated draft

**Standing:** SOURCE CANDIDATE ONLY · no founder release act · do not merge, migrate, deploy or send real mail.

**Runtime membrane:** Both issuance and redemption refuse with HTTP 503 unless `MEMBER_ACCESS_RECOVERY_ENABLED=1`. The flag is unset by default. Fictional CI explicitly opts in. The setting does **not** itself authorize production use or schema deployment.

## Purpose

An authorized founder uses **Admin Command Center → Member Access** to initiate recovery for a selected existing member. The member sets their own password. The administrator never chooses, sees, emails or stores the replacement password. Separate from the legacy /reset-password and /api/admin/reset-member-password routes.

## Authority, scope and record

- **Founder verified member session only**: checkAdminAuth(req, ['founder']) AND via='member' and a real memberId. The shared LABTOOLS_ADMIN_PASSWORD is **not** sufficient to issue a recovery link, even though Command Center's older AuthGate accepts that secret for navigation. An operator without a real founder member session receives a clear 403; do not weaken to fix a UX failure.
- Exact approved browser Origin required on issuance and redemption; Origin:null, absent or foreign origin is rejected. Browser cookie is never treated as ownership of a targeted member without founder standing. A body-supplied member ID is only the *target*, not actor.
- Issuance transaction locks founder and target rows, has a durable five/hour issuer ceiling, revokes prior outstanding administrator links, records issuer, target, delivery mode/reason and a SHA-256 hash of a freshly generated 256-bit random bearer.
- A separate new table admin_member_recovery_tokens records issuance/delivery/redemption. It does not store the raw bearer. No actual member credentials or recovery links are written to application logs.
- Email: provider acceptance only, not confirmed delivery, 30-minute expiry; failed acceptance revokes the link. A pending receipt is not redeemable.
- Exceptional private handoff: only after explicit identity-verification acknowledgment; 10-minute expiry, one-time link returned on the authenticated founder response, displayed in volatile component state and cleared after successful copying or dismissal. This is still a sensitive bearer capability; do not send by open chat or public support channels.
- Member receives link with a URL fragment (not HTTP query), which the new /member-recovery page removes from the address bar on first load. Token held in component state only. New password 12+ Unicode code points, <=72 UTF-8 bytes to avoid bcrypt truncation; password is hashed using the existing approved passwordUtils implementation.
- Redemption is **one database transaction**: claim locked token row, change only the token-bound member's password, revoke auth_sessions, record token redemption. If any step fails the entire transaction rolls back. Concurrent replays cannot both claim.
- Member's password never appears in admin response, logs or admin UI. The member must sign in again.

## Hard separation / risks

1. **Schema deployment:** This PR includes a new PostgreSQL migration. Merging it to canonical could cause the **next unrelated full production deploy to apply the migration automatically**. Do not merge before a separate founder-approved schema/deploy plan and reversible backup witness.
2. The legacy self-service /api/members/reset-password route still has plaintext tokens, non-atomic password-and-token updates, weak password minimum and raw email logging. It is **not repaired** by this member-admin flow. Replacing it is a different member-facing Class A scope; until reconciled, its risk remains.
3. [PR #1847](https://github.com/SoullabTech/Sovereign/pull/1847) handles POST admin-password audit and emergency reset-secret strengthening. No overlapping source files in this candidate. Neither draft authorizes merging the other.
4. [Issue #1848](https://github.com/SoullabTech/Sovereign/issues/1848) tracks the privileged terminal reset script. It remains executable and is **not affected** by this browser-based workflow.
5. The legacy Command Center UI treats a decorative local session marker as navigation access; real authority for Member Access is enforced server-side. A proper admin session experience may require separate product work; do not equate navigation access with verified founder status.
6. Origin validation is fixed to known production hosts and local development; test any alternate admin domain before release. Native iOS clients are not presumed compatible.
7. Email transport may be unavailable; isolated fictional email results cannot prove real delivery. Live provider testing and real handoff/identity policy are separately authorized, never performed in this draft.
8. All requested changes are separate from JARVIS R7 and unrelated platform lanes. The protected 33-entry dirty worktree remains untouched.

## Test and release gates

- Hermetic Jest tests must prove denied forged/absent/wrong-role session, password fallback refusal, non-verified handoff refusal, expired/used/replayed token refusal, hashed storage, delivery errors, issuance quota, session revocation, SQL rollback and Unicode/bcrypt boundary.
- An ephemeral PostgreSQL integration witness is required before production: apply the migration against a **fictional empty database**, verify actual transaction atomicity/concurrency, unique token constraints, rollback and no member data leakage. A mocked test is not a substitute.
- CI build, TypeScript no-regression and migration bootstrap checks must pass on the exact candidate SHA. Full external security review of token handling, session theft risk, rate limiting and email/handoff transport is owed.
- Founder release authorization must explicitly cover the schema deploy, live identity method, rollback and emergency-recovery handoff. No merge or deployment without a new decision.
