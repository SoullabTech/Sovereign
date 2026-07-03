# Member Lifecycle Management — Disable / Archive / Hard Delete

- **Date**: 2026-06-10
- **Branch**: `feat/member-lifecycle-admin` (off `origin/clean-main-no-secrets` @ `bd1fb4a70`)
- **Status**: Phase 1 in build (lifecycle states + admin surface). Phase 2 (Hard Delete) specified, not built.
- **Authority**: Kelly directive 2026-06-10 — *"Delete should not be a single action. Support Disable, Archive, and Hard Delete as separate operations, with Hard Delete requiring an explicit typed confirmation and clear visibility into what data will be removed."*

## Problem

There is no admin capability to remove or suspend a member. The only existing path is the
self-service `app/api/members/delete-account/route.ts`, which is **stale and unsafe**: it deletes
from `member_sessions` (the live session table is `auth_sessions`), references legacy tables, and is
not admin-gated. Beyond that, there is no way to *pause* an account without destroying its data.

"Delete" conflates three genuinely different needs:

| Operation | Sign-in | Active surfaces | Data | Reversible |
|---|---|---|---|---|
| **Disable** | blocked | shows (badge) | preserved | yes |
| **Archive** | blocked | hidden | preserved | yes |
| **Hard Delete** | n/a | gone | **erased** | **no** |

Disable and Archive touch *no* member data — they are safe and reversible. Hard Delete is
irreversible and, in this schema, genuinely dangerous (see §Cascade Reality). They are therefore
separated, and Hard Delete is deferred to a prod-verified Phase 2.

## Cascade Reality (why Hard Delete is Phase 2)

Measured against the local DB on 2026-06-10:

- **133 FK constraints** point at `members`: **83 `CASCADE`**, **30 `NO ACTION`**, **20 `SET NULL`**.
  The 30 `NO ACTION` constraints mean a naive `DELETE FROM members` would **fail** with FK violations.
- **~250 base-table columns** named `member_id` / `user_id`, many with **no** FK at all (loose refs).
- **23 views** carry these columns (cannot be deleted from).
- Audit/legacy tables (`users`, `audit_logs`, `data_access_logs`, `rlm_audit_log`) reference members
  but must **never** be purged.
- **The local DB's FK set does not match the migrations** (e.g. `auth_sessions`' declared
  `ON DELETE CASCADE` is absent locally). Therefore *local ≠ prod*, and Hard Delete must be verified
  against the production schema before it is enabled.

Conclusion: Hard Delete requires a curated, transactional, prod-verified purge — not a one-liner —
which is exactly why it is its own operation and its own phase.

---

## Phase 1 — Lifecycle states + admin surface (safe, reversible)

### Schema

`members.status` is the single source of truth. Hard Delete is **not** a status — it removes the row.

```sql
ALTER TABLE members
  ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'disabled', 'archived')),
  ADD COLUMN status_changed_at TIMESTAMPTZ,
  ADD COLUMN status_changed_by UUID,   -- actor (admin member id); no FK to survive admin deletion
  ADD COLUMN status_reason TEXT;
-- partial index for the management list (active is the common case, excluded)
CREATE INDEX members_status_idx ON members (status) WHERE status <> 'active';
```

### Enforcement (single chokepoint)

All 12 sign-in / session-mint entry points funnel through `createSession()` in
`lib/auth/serverSessions.ts`. Enforcement lives there: before inserting a session, it reads
`status` and refuses any member whose status is not `active`. One check covers every entry point
(password, magic link, Apple/Google SSO, biometric, WebAuthn, dev-login, team-invite register).

Existing live sessions are handled at status-change time: `setMemberStatus()` calls
`revokeAllSessions()` on disable/archive, so a paused member is logged out immediately rather than
waiting for token expiry. (Optional future defense-in-depth: a status join in `validateSession()` —
deliberately omitted in Phase 1 to keep the per-request hot path light; revoke-on-change is
sufficient for correctness.)

### Active-surface filtering

`archived` members disappear from functional active surfaces; `disabled` members remain visible
(so they can be re-enabled and so collaborators see a paused account). Surfaces filtered with
`status <> 'archived'`:

- `getTeamMembers()` in `lib/auth/teamPermissions.ts`
- nostr channel auto-join (`app/api/nostr/channels/route.ts`)
- admin dashboard active count (`app/api/admin/command-center/members/route.ts`)

The admin members management list shows **all** statuses (it is the console for managing them).

### Audit

Reuses the existing `audit_logs` table + `logAuthEvent()` (`lib/security/authAudit.ts`). New
`AuthAction`s: `member_disabled`, `member_archived`, `member_reactivated`, `member_hard_deleted`.
The target member id goes in `resource_id`; the acting admin + reason go in `metadata`. Audit is
written for every lifecycle change.

### Admin gate

New `lib/auth/requireAdmin.ts` validates an admin secret (sent via `x-admin-secret` header, or
`adminSecret` query) against `LABTOOLS_SECRET || LABTOOLS_ADMIN_PASSWORD` — the same secret the
existing `app/api/admin/library/videos` route enforces. This is genuine server-side enforcement
(the `/api/admin/auth` token is unverifiable and is **not** relied upon for authorization). Every
mutating member route requires it.

> Note: the secret is a bearer credential sent per request over HTTPS — acceptable for a
> founder-operated console. A signed/HMAC admin session token is a future hardening, out of scope here.

### Surfaces

- `GET  /api/admin/members` — list members + status (admin-gated).
- `POST /api/admin/members/[memberId]/status` — `{ status: 'disabled'|'archived'|'active', reason? }`.
- `app/admin/members/page.tsx` — searchable list, status badges, Disable/Enable/Archive with
  confirmation. A Hard Delete affordance is present but routes to the Phase 2 flow (disabled until
  Phase 2 ships).

### Phase 1 non-goals

No row deletion, no data purge, no changes to the self-service `delete-account` route (folded into
Phase 2). No member-facing UI changes. No deploy without explicit approval.

---

## Phase 2 — Hard Delete (specified; build after Phase 1 + prod verification)

- **`lib/members/purge.ts`**
  - `buildMemberDataManifest(memberId)` — **dynamic discovery**: enumerate every base table
    referencing the member (FKs to `members` ∪ columns named `member_id`/`user_id`/etc.), **minus a
    denylist** (views auto-excluded; `users`, `audit_logs`, `data_access_logs`, `rlm_audit_log`, and
    any system/audit tables retained). Returns `[{ table, column, rowCount }]`. This powers the
    "visibility into what will be removed" requirement and adapts as new member tables are added.
  - `hardDeleteMember(memberId, actorId)` — runs the whole manifest in **one transaction** (children
    first → survives the 30 `NO ACTION` FKs), audits **before** deleting (so the trail survives),
    then `DELETE FROM members`.
- **API**: `DELETE /api/admin/members/[memberId]` with typed confirmation (echo username/email);
  `GET …?preview=1` returns the manifest.
- **UI**: modal shows the manifest (tables + row counts) and requires typing the username to confirm.
- **Fold the stale self-service route**: rewrite `app/api/members/delete-account/route.ts` to call
  `hardDeleteMember()` so there is exactly one correct deletion path.
- **Gate before enabling**: run `buildMemberDataManifest` read-only against the **prod** schema and
  dry-run on a throwaway member, because local ≠ prod FK state.

---

## Sovereignty alignment

- **Right to erasure**: Hard Delete is true removal (no stealth retention), consistent with the
  Sanctuary/consent posture — but irreversible, so it is gated behind typed confirmation + a manifest
  preview + a real admin check.
- **Disable/Archive** give a non-destructive way to honor "this person is done / paused" without
  erasing a life's worth of context, and are fully reversible.
- **Auditability**: every status change and (Phase 2) deletion is recorded with actor + reason.
