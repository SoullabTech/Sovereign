# ASTRO-R4J — Fail-closed account deletion containment

**October 13, 2026 · Source-only isolated security candidate · Not a production release**

## Approved founder policy, distinct from release authorization

Private charts stay private until deliberate member-selected sharing. One Send does not authorize future recall. Unknown historical privacy provenance is withheld rather than deleted. Account deletion must prevent material from reappearing through any backup restore. These are governing policies, **not independent Class A approval or permission to run a member deletion**.

## Reproduced R4I security regression

R4I's `app/api/members/delete-account/route.ts` swallowed each governed content count query error. If all reads failed, an authenticated username-confirmed delete could proceed and falsely return success. A fictional fault-injection Jest test reproduced this exact HTTP 200 behavior, without accessing real member data.

R4I's same-database, immutable-looking `astro_maia_protected_origins` marker corrects a narrow foreign key compatibility issue but is not an independent R20 deletion signer or rollback-resistant recovery record. A networkless fictional PostgreSQL 16 test demonstrated a private conversation row still stored after raw member deletion and a pre-delete raw SQL snapshot restoring member, grant, and private turn.

## R4J source correction

- **Authenticated identity:** The member is derived from the verified server session. A conflicting body member claim fails with 403; unauthenticated requests fail with 401. Correct member username is a confirmation, not an authority grant.
- **Fail-closed inspection:** Every defined `GOVERNED_CONTENT` count is required. Missing table, column, DB read permission, timeouts, other query failures, missing/multiple/malformed count rows, and counts outside safe integer range become a 503 `privacy_preflight_unavailable`. Never translate unknown into zero. No partial inventory is returned after a failure.
- **Unconditional R20 custody HOLD:** Even all verified known counts equal to zero cannot establish that historic SQL backups, manuscript Source, attachments, snapshots, other stores, or external model copies have been deleted. This route returns 409 `deletion_incomplete_unavailable` with `accountChanged:false`, not success. The prior member/session-deleting transaction and `clearSessionCookie` are removed, not gated by an environment switch.
- **Truthful UI:** The account-settings panel calls the operation **Check Deletion Status**, informs the member that the check deletes no data, renders failure/status messages in a visible alert, and does not clear browser identity or navigate away on non-2xx responses.
- **No R20 signing claim:** No outbox, independent signing, high-water witness, real vault restore, or member erasure has been implemented by R4J. The REST path does not register a support ticket; users are directed to contact support separately.

## Testing and scope

- Expanded adversarial tests exercise early and late count failures, wrong owner, guest, malformed counts, permission denial, timeouts, zero-content holder, retained chart grant, and zero destructive transactions.
- Inherited security tests must continue passing, except assertions of unsafe legacy deletion behavior which are replaced with explicit denial tests.
- Source-only mocks are not a substitute for independently reviewed production-shaped PostgreSQL identity and outbox integration, full-workspace TypeScript, authenticated mobile Safari, live cloud signer or backup recovery certification.

## Independent Class A review required

The reviewer must examine the **exact hash-frozen R4J source** and decide PASS/REVISE/HOLD for the correction, separately from R20's still-open entire account deletion capability. An eventual erasure service must implement independently signed, authenticated deletion obligations committed with an exact database/Source/object manifest, consistent non-resurrecting history replay, independently pinned monotonic witness, proper consent and retention handling, and quarantined restore before any member-facing API. A single flag reversal or re-enabling this old transaction is prohibited as a release workaround.

**Disposition:** R4J bounded correction may be source-qualified; **member account deletion remains unavailable**. R20 external signer/recovery Class A and combined beta remain HOLD. MAIA chart Send remains OFF. No production app, schema, backup, signer or member content changed.
