# Prod ⇄ clean-main Reconciliation Plan (2026-06-14)

- **Status**: Executed in PR `reconcile/prod-superset-2026-06-14` — admin-auth security work ported onto clean-main (typecheck clean; admin_roles migration rollback-validated). Awaiting review + founder-directed merge, then deploy #451.
- **Trigger**: `Deploy #451` hard-stopped — prod is a diverged fork, not a fast-forward target. Per the reconciliation-not-deployment rule, a branch switch here would revert live work.
- **Goal**: make `clean-main` a verified superset of production, then deploy that unified branch (carrying #451 + #452).

## Divergence

- prod (minisforum) is on `fix/studio-calendar-timezone-edit` @ `2280b647a` — **not** an ancestor of `clean-main`.
- prod has **9 commits** not in clean-main (by patch-id); clean-main is **106 commits ahead** on a different lineage.
- A `git checkout clean-main` on prod would revert prod's 9 commits, including a live security fix.

## Per-area reconciliation map

Patch-id via `git cherry`; content via file-presence + key-string checks on `origin/clean-main-no-secrets`. "Already reconciled" = content present on clean-main (via #450), but **not yet behaviorally diffed** — confirm equivalence during PR review.

| prod commit | area | status on clean-main | action |
|---|---|---|---|
| `e58b3107a` vault 0777 | `Dockerfile` | patch-id equivalent (`git cherry -`) | none |
| `c0d59be2a` monitoring dashboard | `app/admin/monitoring`, `lib/monitoring`, mig `20260613000001` | files + migration present | verify-equivalent |
| `119aa6002` monitoring expand | `app/admin/monitoring`, `app/api/voice`, mig `20260613000002` | files + migration present | verify-equivalent |
| `33044bedf` MAIAUptime status | `app/status`, `app/api/status` | present | verify-equivalent |
| `44bd76e5c` CTO ops dashboard | `app/admin/ops`, `scripts/maia-monitor.js` | present | verify-equivalent |
| `90bcce4de` video-room URL | `app/studio/session-room`, `app/studio/settings` | present (markers found) | verify-equivalent |
| `60a3769fb` partnerSlugs | `lib/masters/{types,kelly,nathan}.ts` | present (count matches) | verify-equivalent |
| **`2280b647a` #449 admin-auth security** | `lib/admin/adminAuth.ts` | **ABSENT** | **PORT (critical)** |
| **`c652f095b` role-based admin auth** | `lib/admin/adminAuth.ts`, `app/api/admin/*`, `components/auth/UnifiedAuth.tsx`, `app/admin/research`, mig `20260612100001_admin_roles` | **ABSENT (code + migration)** | **PORT (critical)** |

## The one genuine gap: admin-auth security

Confirmed: `lib/admin/adminAuth.ts` does not exist on clean-main, and `database/migrations/20260612100001_admin_roles.sql` is missing. On prod, `adminAuth` enforces a verified session (x-session-token / maia_session validated against `auth_sessions`, unexpired, not revoked) + `admin_role`, and **rejects a bare `x-member-id`** (privilege-escalation guard). It is imported by 4 prod routes:

- `app/api/admin/auth/route.ts`
- `app/api/admin/members/admin-role/route.ts`
- `app/api/admin/research/directives/route.ts`
- `app/api/admin/research/overview/route.ts`

Deploying clean-main without porting this = a live admin-auth security regression. This is the reason the deploy was stopped.

## Port plan (steps 4–6, pending go-ahead)

1. Branch off `clean-main`: `reconcile/prod-superset-2026-06-14`.
2. Port the admin-auth security work (decisions, not raw commits): `lib/admin/adminAuth.ts`; `database/migrations/20260612100001_admin_roles.sql`; the 4 admin routes' guards (merge against clean-main's current versions of those routes — expect conflict judgment); `components/auth/UnifiedAuth.tsx`; `app/admin/research` pages.
3. Verify clean-main's versions of the "already reconciled" areas are behaviorally equivalent to prod (diff each; port any prod-only deltas).
4. Build + typecheck + `check:no-supabase`; confirm the admin_roles migration applies in a rollback transaction.
5. Open the reconciliation PR.

## Required preservation proofs (in the PR)

- [ ] #449 admin-auth protection present in the unified branch (verified-session + reject-bare-x-member-id + admin_role; `admin_roles` migration included)
- [ ] monitoring/status features preserved
- [ ] video-room URL preserved
- [ ] partnerSlugs preserved
- [ ] vault 0777 fix preserved or already equivalent (already equivalent — `git cherry -`)
- [ ] #451 + #452 preserved (already on clean-main)

## After reconciliation

- Deploy the unified branch (only then is it a fast-forward / true superset).
- Process fix: prod should track one canonical branch (`clean-main`), not a feature fork, so this divergence cannot recur.
