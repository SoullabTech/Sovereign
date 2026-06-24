# SoulComms Multi-Team — Route & UI Restructure Spec

**Date**: 2026-06-09
**Status**: Spec for review. Migration (DB spine) DONE + verified on dev. Tasks 4–7 below not yet built.
**Branch**: TBD (off `clean-main-no-secrets`)

---

## Locked decisions (do not relitigate)

| Decision | Call |
|---|---|
| Team container | Reuse `studio_teams` (platform-wide team spine) |
| Membership / access gate | `studio_team_members` — sole answer to "who belongs here" |
| Channels | Team-scoped (`team_channels.team_id`), `UNIQUE(team_id, slug)` |
| Routing | `/team/[teamSlug]/[channelSlug]` — team identity in the URL, never hidden state |
| DMs | **Global.** `team_dm_*` untouched (no `team_id`). Route stays top-level `/team/dm/[id]` |
| Seed teams | `soullab` (legacy history + participants) · `all-practitioners` (active practitioners, clean) |
| New teams | Explicit (via creation surface). Channels lazily provisioned. |

**Invariant**: *Teams own shared spaces. People own direct relationships.*

---

## Data model (post-migration — already applied to dev)

- `studio_teams.slug` — NOT NULL UNIQUE, URL segment.
- `studio_team_members` — exists (created by this feature's migration).
- `team_channels.team_id` — NOT NULL FK → `studio_teams`; `UNIQUE(team_id, slug)`.
- `team_dm_*` — unchanged (global).
- **Reserved slugs** — CHECK constraints in the schema block team slugs `{admin, dm, for-you, decisions, invite, new, settings}` and channel slugs `{admin, settings, members, new}`. Slug-shadowing of static routes is structurally impossible, not just app-guarded.
- Seeded: `soullab` (owner + Co-lab participants), `all-practitioners` (active practitioners).

---

## The cookie question (resolved)

A `last-active-team` cookie is used **only as a default selector**, never as the source of channel identity:
- **Channel identity** always comes from the URL `[teamSlug]`. No ambiguity, deep-links/notifications are unambiguous.
- The cookie answers only "which team's channel list should the sidebar show when I'm on a **non-team** route" (a global DM, For-You, etc.) and "where does bare `/team` redirect." This is UI convenience, not state the data model depends on.

---

## Route boundary (v1)

| Route | Scope | Notes |
|---|---|---|
| `/team` | redirect | → `/team/[lastActiveOrFirstTeam]` (cookie default; falls back to first membership) |
| `/team/[teamSlug]` | redirect | → that team's `#general` (lazy-provision if the team has no channels) |
| `/team/[teamSlug]/[channelSlug]` | **team-scoped** | the channel view |
| `/team/[teamSlug]/admin` | **team admin** | that team's channels, membership, invites, team settings |
| `/team/admin` | **platform admin (global)** | distinct jurisdiction: create teams, practitioner commons, global moderation, platform settings. Needs a platform-admin authz signal (see open items) |
| `/team/dm/[dmId]` | **global** | interpersonal DM, top-level |
| `/team/for-you` | **global (v1)** | attention across all teams; team-scoping deferred |
| `/team/decisions` | **global (v1)** | team-scoping deferred |
| `/team/invite/[token]` | unchanged | |

Bare-route redirects (`/team`, `/team/[teamSlug]`) resolve the member's teams from `studio_team_members`; a member with zero teams gets an empty state (should not happen post-seed, but handle it).

**Admin is two jurisdictions** (do not collapse): `/team/admin` is *platform* administration (create teams, practitioner commons, global moderation, platform settings) — kept global, **not** moved under `[teamSlug]`. `/team/[teamSlug]/admin` is *team* administration (channels, membership, invites, team settings). Preserving both now avoids retrofitting a platform layer later. The existing `/team/admin` channel-admin surface becomes the platform surface; team-channel management moves under `[teamSlug]/admin`.

---

## Milestone boundaries (scope discipline — Kelly review 2026-06-09)

Keep these as separate PRs. Routing must **not** absorb notification / DM / commons work — the review surface explodes otherwise.

| Milestone | Scope | Checkpoint |
|---|---|---|
| **M1 — team data model** | DONE: migration (spine, slugs, `team_id`, seeds, reserved slugs) | applied + verified on dev |
| **M2 — routing identity** | dir move, layout/TeamShell team-context, redirects incl. legacy `/team/<channel>` shim, admin split, **in-app nav links only** (sidebar / channelview / decisions / leftrail / signin). Page-level membership 404. **NOT** notifications, **NOT** exhaustive backend enforcement. | `npm run typecheck` + round-trip: `/team/soullab/general` loads → post → reload → deep link works → `/team/general` redirects |
| **M3 — access enforcement** | reuse the M2 `isMember()` helper at **every backend path** (listChannels, getChannelBySlug, post message, post reaction, channel metadata) + cross-team boundary matrix | A∈X / B∈Y: every cross-boundary read **and** write 404s/403s |
| **M4 — UI polish** | switcher, "+ New team" creation, empty states | — |
| **Later (own PRs)** | notification / email / mobile deep-links; DM→channel refs; For-You / Decisions team-scoping; commons | — |

Highest risk is **link identity**, not the DB. The legacy redirect shim is the single backward-compat net for every old URL producer (bookmarks, cached, stored).

## Task 4 — Routing restructure (M2)

1. Move `app/team/[channelSlug]/` → `app/team/[teamSlug]/[channelSlug]/`. Add `app/team/[teamSlug]/page.tsx` (redirect to `#general` + lazy provision).
2. `app/team/page.tsx` → resolve default team (cookie → first membership), redirect.
3. `app/team/layout.tsx` / `TeamShell` — carry `currentTeamId` + `currentTeamSlug`. On team routes it comes from the URL param; on global routes (DM/for-you) from the cookie default. Validate membership: if the member is not in `studio_team_members` for `[teamSlug]`, 404 (not redirect — avoids leaking team existence).
4. `signin?next=` redirects updated to team-aware paths.
5. **Admin split**: leave `app/team/admin/` in place as the *platform* admin surface (global). Add `app/team/[teamSlug]/admin/` for *team* admin (channels/membership/invites/settings). Move the existing channel-management UI under the team path; keep team-creation + commons + global moderation at the platform path.

## Task 5 — Link sites + deep-links (13 sites from the surface map)

- `TeamSidebar`: channel links `/team/${slug}` → `/team/${teamSlug}/${slug}`; DM links unchanged (global); for-you/decisions/admin per boundary table.
- `ChannelView`, `TeamDecisionsView` (`/team/${channelSlug}` → team-aware), `MaiaLeftRail`, `InviteAcceptClient`.
- `lib/team/notifications.ts` — mention/thread deep-links must embed `teamSlug` so "mentioned you in #general" opens the correct team. Resolve `teamSlug` from the channel's `team_id` at send time.

## Task 6 — Access gate + lazy provisioning

- `ChannelService.listChannels(memberId, teamId)`: add `WHERE tc.team_id = $teamId` AND membership check (`EXISTS studio_team_members(teamId, memberId)`), preserving the existing `is_private` / `team_channel_members` logic *within* the team.
- `getChannelBySlug` → `getChannelBySlug(teamId, slug)` (slug no longer globally unique).
- Channel-create route (`/api/team/channels`): require `team_id`; caller must be a team member; INSERT includes `team_id`.
- **Lazy `#general`**: when `/team/[teamSlug]` is opened and the team has 0 channels, idempotently create `#general` (`ON CONFLICT (team_id, slug) DO NOTHING`, `created_by` = team owner, `channel_type='announcement'`). Single helper, called from the team landing redirect.

## Task 7 — Switcher + creation surface

- Team switcher in `TeamSidebar` (simpler than `components/studio/TeamSwitcher.tsx` — no personal/practice axis). Lists `studio_team_members` teams for the member; selecting sets the cookie + navigates to that team's `#general`.
- "+ New team" → reuse **`POST /api/studio/teams`**. Extend that route to: generate a unique `slug`, add creator as `owner` in `studio_team_members`, and lazily seed `#general`. This is the literal answer to "how do I create multiple teams."

---

## Verification gate

1. `npm run typecheck` + `npm run smoke`.
2. Round-trip: create a 2nd team → it has its own isolated `#general`; a channel created in team A is absent from team B; switcher swaps context; deep-link `/team/soullab/general` opens the right team; a non-member hitting `/team/<otherteam>/general` gets 404.
3. DMs: a DM opens from any team context; same single thread regardless of active team.

---

## Deploy notes (prod)

- Prod has **not** run the migration. Before deploy, verify `studio_team_members` / `team_channels.team_id` via `information_schema` (not just `schema_migrations` — known runner phantom-record trap).
- The participant-based `soullab` seed runs against **prod's** real `team_messages` / `team_channel_reads` / `team_reactions` → correct prod roster automatically. No manual roster curation needed at deploy.
- Migration is idempotent; runner records checksum (don't edit after the runner applies it).

## Deferred (not in this cut)

- Team-scoping for For-You and Decisions.
- Team invites (`studio_team_invites`) wired to SoulComms — v1 seeds membership directly.
- Boundaried client/engagement DMs (the future "team-scoped DM" feature).
- `viewer` role → read-only enforcement in chat (currently membership = access; role nuance deferred).
- **Platform-admin authz** for `/team/admin` — *resolved*: gate on the existing `admin` role (`members.roles`, via `lib/security/requireAccess.ts` `requireAdmin`). Team admin (`/team/[teamSlug]/admin`) gates on `studio_team_members` role `owner`/`admin` for that team. No new authz primitive needed; wire when the admin surfaces are built.
- Full platform-admin feature set (practitioner-commons management, global moderation, platform settings) is incremental — the route exists as the jurisdiction; capabilities land over time.
