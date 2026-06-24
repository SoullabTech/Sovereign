# Production Drift — Side-by-Side Reconciliation (Phase 2A evidence)

- **Date**: 2026-06-14
- **Principle (Kelly)**: *Port decisions, not commits.* The commits are old containers for intent; preserve the production **capability**, then choose the better implementation.
- **Method**: read-only `git show` comparison of prod-live (`60a3769fb`, `fix/studio-calendar-timezone-edit`) vs clean-main (`origin/clean-main-no-secrets`, `bd40ef104`). Merge-base `ec78bf52e`. Nothing changed.
- **Verdict**: the outcome is **mixed per-area** — neither branch is canonical wholesale. Plus a **live security finding** (Area 2) that outranks the reconciliation.

## ⚠️ Headline: live admin-auth privilege escalation on prod (Area 2)

Prod's role-based admin auth (`lib/admin/adminAuth.ts:checkAdminAuth`, from `c652f095b`) **accepts a raw `x-member-id` header and grants admin if that UUID has `admin_role` set — with no session-token proof** (`adminAuth.ts:58,66-68`). Anyone who knows or guesses an admin member's UUID gets admin. Clean-main does **not** have this hole (it's shared-password only). This is almost certainly **live on the running prod container** (built 06-13 from this branch). **Close this before anything else** — it is independent of the deploy decision.

## Synthesis table

| Area | Canonical | Action | Conflict |
|---|---|---|---|
| 1. Video-room URL | **prod** (clean-main lacks it entirely) | re-apply ~13-line capability onto clean-main's #414 session-room | small, manual |
| 2. Admin auth | **prod's role *model***, but **fix the hole** | port role-based auth + audit log; **require `x-session-token`**, drop localStorage password | needs **security review** |
| 3. Monitoring (`/admin/monitoring`) | **prod** (additive; not a duplicate of clean-main's bug-`/admin/monitor`) | bring prod's uptime/system/voice dashboard + 2 migrations into clean-main; keep clean-main's bug pipe | additive |
| 4. Admin home / CTO | **MERGE both** | union the nav: clean-main's bug pipe **+** prod's System Monitor/Operations/Feedback | merge |

**Branch-wide answer:** clean-main is canonical for the **session-room base (#414 Relationship Memory)** and the **bug pipe (`/admin/monitor`, #424)**; prod is canonical for **video-room, the uptime/system/voice monitor, the CTO ops cockpit, the monitor script, and the role-auth *model*** (with the security fix). Reconcile by taking the better of each — not by switching branches.

---

## Area 1 — Session Room / video-room URL  (commit `90bcce4de`)

- **Prod-live behavior**: practitioner sets a "Video Room" URL in Settings → Integrations (`studio/settings/page.tsx:1399`, persisted `POST /api/studio/settings` key `video_room_url`); Session Room renders an "Open Video Call" link when present (`studio/session-room/page.tsx:846`). Bring-your-own-link; Session Room stays for notes/transcript.
- **Clean-main behavior**: **no video-room capability at all** (`videoRoomUrl` 0 refs). That session-room region was rewritten by **#414 Relationship Memory** (client-link / keep-link-private consent controls).
- **Overlap**: both have the Settings Integrations section; neither embeds a video room.
- **Missing-from-clean-main**: the whole feature (settings field + save + "Open Video Call").
- **Missing-from-prod**: clean-main's **#414 Relationship Memory** consent surface (prod built on older session-room).
- **Risk if clean-main wins**: practitioners silently lose a shipped feature (visible regression).
- **Risk if prod-live wins**: replaying the old commit would drop #414's consent controls (sovereignty regression).
- **Recommendation**: **not superseded; port the capability.** Re-apply the ~13-line block (`videoRoomUrl` state + fetch + the `<a>`) onto clean-main's #414 session-room by hand; the settings half auto-merges. Small, canonical, low-risk. Confirm `/api/studio/settings?key=video_room_url` exists on clean-main.

## Area 2 — UnifiedAuth / role-based admin auth  (commit `c652f095b`) — SECURITY

- **Prod-live behavior**: durable **role-based** model — `members.admin_role` ∈ {founder,cto,practitioner_admin,operations,tester}, founder-only role-grant API, every attempt → `admin_access_log`; `LABTOOLS_ADMIN_PASSWORD` as fallback. **But** `checkAdminAuth` trusts a bare `x-member-id` header (no session proof) → privilege escalation (see headline).
- **Clean-main behavior**: **shared-password only** (`LABTOOLS_ADMIN_PASSWORD`), password persisted in `localStorage['soullab_admin_secret']` (XSS-readable). No roles, no audit log.
- **Overlap**: both ship the UnifiedAuth front door; the `.tsx` diff is **2 cosmetic lines**. Both keep the shared-password path.
- **Missing-from-clean-main**: `adminAuth.ts`, `admin_role` column + `admin_access_log` migration, founder-only role API, per-member revocable admin, audit logging.
- **Missing-from-prod**: clean-main's localStorage password persistence (intentionally dropped — good).
- **Risk if clean-main wins**: loses durable roles + revocation + audit; keeps password-in-localStorage. (But avoids the header-trust hole.)
- **Risk if prod-live wins**: ships the **`x-member-id` header-trust privilege escalation** — must be closed first.
- **Recommendation**: port the **role-based capability + audit log** (canonical, more accountable), **but require `x-session-token` validation (reject bare `x-member-id`)** and drop `storeAdminPassword`. **Dedicated security review required before either path ships.**

## Area 3 — Admin monitoring  (commits `c0d59be2a` + `119aa6002`)

- **Prod-live behavior**: dedicated **uptime + system-health dashboard** at `/admin/monitoring` (90-bar uptime, response times, 24h/7d %, incidents; CPU/disk/Docker, deploy freshness, Ollama/whisper voice health). New files clean-main lacks: `lib/monitoring/maiaMonitor.ts`, `/api/admin/monitoring/*`, `/api/voice/health`, migrations `20260613000001/2_monitoring_system.sql`. Also `/admin/ops` (456 LOC) — a 2nd consumer of the same API.
- **Clean-main behavior**: **no** `/admin/monitoring`/`maiaMonitor`/monitoring schema. Its `/admin/monitor` is a **different thing** — the **bug/feedback triage board** (canonical bug pipe, #424). Name collision only.
- **Overlap**: none semantically. The duplication that *does* exist is **inside prod**: `/admin/ops` and `/admin/monitoring` render the same data.
- **Missing-from-clean-main**: the entire uptime/system/voice dashboard + 2 migrations.
- **Missing-from-prod**: nothing here (prod also has clean-main's bug `/admin/monitor`).
- **Risk if clean-main wins**: loses live uptime/system/voice monitoring + `/admin/ops` (ops-visibility regression; nav 404s).
- **Risk if prod-live wins**: must apply 2 migrations on prod DB; carries the `/admin/ops`↔`/admin/monitoring` internal redundancy.
- **Recommendation**: **one canonical = prod's `/admin/monitoring`** (additive, not a competing copy). Bring it into clean-main as one squashed feature (6 new files + `/admin/ops` + page edits + both migrations). Keep clean-main's `/admin/monitor` (bugs). Separately decide whether `/admin/ops` folds into `/admin/monitoring` to retire prod's internal duplication.

## Area 4 — Admin home / CTO dashboard  (commit `44bd76e5c`)

- **Prod-live behavior**: admin home nav exposes **Feedback Inbox, System Monitor → `/admin/monitoring`, Operations → `/admin/ops`** (`admin/page.tsx:184-189`); full ops stack incl. `/admin/ops` CTO cockpit + standalone `scripts/maia-monitor.js` + `monitor.env.example` (zero-dep external watcher, Twilio/Resend alerts).
- **Clean-main behavior**: admin home keeps **Monitor → `/admin/monitor`** = the **Monitor Field** bug/feedback triage inbox (#424, Kelly-ratified canonical bug pipe). No Feedback Inbox / System Monitor / Operations.
- **Overlap**: only the word "Monitor" — destinations differ.
- **Missing-from-clean-main**: `/admin/monitoring`, `/admin/ops`, the monitor script, the ops nav links.
- **Missing-from-prod**: clean-main's `/admin/monitor` bug pipe and its nav wiring (`10fdf42e9` not an ancestor of prod) — **prod has no bug-triage link at all.**
- **Risk if clean-main wins**: lose the CTO ops cockpit + uptime dashboard + monitor script.
- **Risk if prod-live wins**: lose the #424 canonical bug pipe (Kelly ratified it); deep links to `/admin/monitor` 404.
- **Recommendation**: **MERGE, do not supersede** — complementary, not competing. Clean-main's admin home should end with **both**: keep `Monitor → /admin/monitor` (bugs) **and** add `System Monitor → /admin/monitoring` + `Operations → /admin/ops` + `Feedback Inbox`. Union the nav array; **rename to kill the Monitor/System-Monitor confusion**. Port `scripts/maia-monitor.js` + `monitor.env.example` independently (zero conflict).

---

## Reconciliation plan (revised Phase 2A, per-area)

0. **(URGENT, independent of deploy)** Close the prod `x-member-id` admin header-trust hole.
1. **Auth** — security review → port role model + audit log with session-token validation; drop localStorage password.
2. **Monitoring** — port prod's `/admin/monitoring` + `/admin/ops` + `/api/admin/monitoring*` + `/api/voice/health` + 2 migrations into clean-main as one feature; keep clean-main's `/admin/monitor` (bugs).
3. **Admin home** — union the nav (bug pipe + ops/uptime/feedback); rename for clarity.
4. **Video-room** — re-apply the ~13-line capability onto clean-main's #414 session-room.
5. **Independent, no conflict** — cherry-pick `scripts/maia-monitor.js` + `monitor.env.example`; partnerSlugs (`60a3769fb`, tiny) applies clean.
6. Then Phase 2B–E (postgres parameterize, Caddy, GIT_COMMIT, .bak cleanup) → Phase 3 deliberate deploy → Phase 4 verify → Phase 5 #446 five-zeros gate.

This is one reconciliation PR (or a small stack), reviewed, that makes clean-main a true superset of live prod capability — *then* prod moves to clean-main as a deliberate release, with no regression.
