# Admin member-permissions view — access census (read-only) · 2026-11-07

**Status: census done; first pass stopped before code (more systems and conflicting authority found). Kelly ruled the recommended scope on 2026-11-07 (Q1–Q4 all as recommended); built per §Build below. Not deployed.**
Branch `feature/admin-member-permissions-20261107` from `clean-main-no-secrets` @ `ec4561c99`. Code-read only; no production read, no data change.

## The four named in the brief (confirmed)

| # | Permission | Lives in | Opens | Who may change today |
|---|---|---|---|---|
| 1 | Tier | `members.tier` (code uses `free`/`pro`; migrations also admit `personal`, `subscriber`, `vip` in different eras) | 30 `minTier:'pro'` routes in `config/accessMatrix.ts` — ⚠️ tier failures are currently waived in `proxy.ts` (development), so tier opens nothing today | Stripe/billing paths; no admin UI |
| 2 | Roles | `members.roles text[]` | `rolesAnyOf` in `config/accessMatrix.ts`; `/admin` = role `admin` (its `minTier: 'pro'` is currently waived: `proxy.ts` skips tier failures during development but still enforces roles); `beta_tester` bypasses tier gates on mobile | No admin UI found |
| 3 | Admin level | `members.admin_role` | `checkAdminAuth` (`lib/admin/adminAuth.ts`) | founder/cto via `/api/admin/members/admin-role` |
| 4 | Writer's Studio | `ops_contacts` beta_tester/active + `metadata.writers_studio_beta` (+ founder/cto admin levels) | Writer's Studio pilot (`lib/writersStudio/betaAccessServer.ts`) | Founder pipeline / hand SQL |

## Additional per-member gates found (not in the brief)

| Permission | Lives in | Opens | Changed by |
|---|---|---|---|
| Field Lab tester | `members.tester` boolean (`lib/auth/tester.ts`, `lib/auth/entitlements.ts` → `labs.preview`) | `/maia/field-lab`, relational navigation | **The member** (opt-in toggle, `/api/members/tester`) |
| Founder (env) | `FOUNDER_MEMBER_IDS` env (`lib/founder/founderAuth.ts`, 47 files use `requireFounder`) | `/api/founder/*`, Book Studio drafts, Circles API, harness | Editing production env on minisforum |
| Lab Tools | `LAB_ACCESS_MEMBER_IDS` env ∪ founders (`lib/access/labAccess.ts`) | Lab Tools | env |
| Early Field cohort | `EARLY_FIELD_ENABLED` + `EARLY_FIELD_MEMBER_IDS` env (`lib/access/earlyFieldAccess.ts`) | Early Field | env |
| Circle access | `CIRCLE_ACCESS_MEMBER_IDS` env (`lib/circles/circleAccess.ts`) — currently founder-only | Circles API, `/commons/join` | env |
| Pro Studio Reflect beta | `PRO_STUDIO_REFLECT_BETA_MEMBER_IDS` env | `/pro-studio/reflect` | env |
| Other env cohorts | `MAIA_RELATIONAL_FIELD_SHADOW_MEMBER_IDS`, `FEATURE_MAIA_IDEAS_DECISION_RECOGNITION_MEMBER_IDS`, `MAIA_LONGTERM_WRITEBACK_ALLOWLIST` | behaviour flags, not surfaces | env |
| Team role | `studio_team_members.role` (owner/admin/member/viewer), `lib/auth/teamPermissions.ts`; 5 routes | team surfaces | team owners/admins |
| Practitioner | `practitioners` row, mirrored to `members.is_practitioner` | practitioner/caseload surfaces | `/api/studio/personal/enter`, `/api/practitioners/create` |
| Minor columns | `practitioner_tier` (pricing prompt only), `developmental_tier` (youth), `invite_tier`, `stewardship_tier` | narrow, mostly non-gating | various |

Prior art: `GET /api/admin/beta-testers` already reads four "beta" signals together (tester, roles∋beta_tester, ops_contacts, EARLY_FIELD env).

## Conflicting authority (the reasons to stop)

1. **Two founders.** `admin_role = 'founder'` (DB, editable in the admin UI) and `FOUNDER_MEMBER_IDS` (env) are independent. Setting someone's admin level to founder in Studio does **not** open `/api/founder/*`; removing it does not close it.
2. **The shared admin password is a founder.** `checkAdminAuth` path 2 (`x-admin-password` / Bearer) returns `role: 'founder'` with no member identity. An "owner-only" route built on `checkAdminAuth` therefore also admits anyone holding that password, and its audit row cannot name a person. For a page that grants Pro, admin roles and founder standing, that is the weakest point.
3. **Env allowlists cannot be edited from a web view** without the app writing its own production env, which no ruling authorizes. They can be shown read-only at most.
4. **`members.tester` is member-owned** (opt-in, per its migration comment). An admin "add" control would override a member's own consent act.
5. **Tier has no single vocabulary** (`free/pro` in code; `personal`, `subscriber`, `vip` in older constraints), and granting `pro` by hand bypasses billing.

## Questions for Kelly (answered 2026-11-07: all as recommended)

- **Q1 scope:** edit only the four in the brief, and show the rest read-only? *(recommended)*
- **Q2 password path:** should these write routes refuse the shared-password path and require a signed-in founder/cto session? *(recommended: yes, so every audit row names a person)*
- **Q3 two founders:** show both and label them, or reconcile them later as a separate lane? *(recommended: show both, reconcile separately)*
- **Q4 tester:** read-only, because the member owns it? *(recommended: yes)*

## Build (per the ruling)

- `lib/admin/memberPermissions.ts`: authority check, validation, change application, audit writer, env allowlist reader.
- `app/api/admin/members/permissions/route.ts`: `GET` lists every member's permissions; `POST` makes one change.
- `components/admin/MemberPermissionsSection.tsx`: the Studio → Settings → Admin view, now showing all permissions with search and add/remove controls.

**Authority.** The caller must be a signed-in owner (admin level founder or cto, proven by a verified session). No admin identity gets 401. A non-owner admin, or anyone using the shared admin password, gets 403. This applies to the read and every write, server-side. The existing `admin-role` route and `GET /api/admin/members` are unchanged.

**Editable:** tier (free/personal/pro), roles (add from admin, steward, curator, practitioner, partner, member, beta_tester; any existing role may be removed), admin level, Writer's Studio pilot.

**Writer's Studio.** Granting updates the member's most recent non-deleted `ops_contacts` beta_tester row: it merges `writers_studio_beta: true` into the metadata, keeping the rest, and sets the stage to `active`. If no such row exists, it creates one with `source='platform'`. Removing merges `writers_studio_beta: false` into every such row. Rows are never deleted, and the stage is left alone.

**Protections.** An owner cannot remove their own owner standing (founder or cto) here; this is slightly wider than the brief, which named founder only. The last founder can never be removed. Both refusals return 409 and write nothing.

**Audit.** Each change writes one `audit_logs` row in the same transaction: `user_id` is the actor, `resource_id` is the target, and `action_type` is `admin.member_permission_changed`. The metadata holds the change and its before and after values. Admin level changes also write `admin_role_grants`. Refused attempts are already recorded in `admin_access_log` by `checkAdminAuth`. **No migration.**

**Read-only display:** Field Lab tester, practitioner, team roles, membership of the env allowlists, and whether Writer's Studio admission comes through the founder/cto admin level.

**Not done.** The two founder authorities are not reconciled. The shared password is not removed from other admin routes. Nothing was deployed or written to production.

**Evidence.** `app/api/admin/members/permissions/__tests__/route.test.ts` passes 41 tests: 403 for non-owners and the shared password on every write and the read, 401 when unauthenticated, the audit content, the admin_role_grants ledger, last-founder and own-standing protection, Writer's Studio create/merge/no-delete, and validation. `npm run typecheck` reports 214 errors against a baseline of 214, so no regressions. `check:no-supabase` is clean. The view has not been walked in a browser.
