# SoulComms — Team-in-URL Routing + Practitioner Commons

> ## ⚠️ SUPERSEDED — 2026-06-09
> **Canonical spec:** [`SOULCOMMS_MULTI_TEAM_SPEC_2026-06-09.md`](./SOULCOMMS_MULTI_TEAM_SPEC_2026-06-09.md)
> **M2 owner:** `feature/team-soulcomms` (established SoulComms line: PRs #172/#174/#180/#181; migration verified on dev).
> This document is **retained for context only** — the decisions here converged with the canonical spec.
> Delta package handed to the owner: [`SOULCOMMS_M2_DELTAS_HANDOFF_2026-06-09.md`](./SOULCOMMS_M2_DELTAS_HANDOFF_2026-06-09.md).
> **Do not build M2 from this file.**

**Status:** Superseded (was: Decided, Kelly 2026-06-09). M1 migration drafted, **not yet applied**.
**Fork resolved:** cookie-based "current team" vs URL team context → **URL wins.** (No current-team cookie exists today; we are not introducing one.)

---

## 1. Decision

Team chat ("SoulComms" / "Co-lab") becomes multi-team, with the team explicit in the URL:

```
/team/[teamSlug]/[channelSlug]
```

`studio_teams` is the **canonical team table**. Chat is a **per-team capability** of any `studio_team` — not a separate system. Every `studio_team` is eligible to become a SoulComms workspace.

## 2. Product shape

Two structural tiers, **both modeled as `studio_teams`**:

**Platform commons — `all-practitioners`** (seeded, auto-membership)
- `announcements`
- `general`
- `introductions`
- `support` (Support / Questions)

**Individual teams — `soullab`, `heather-studio`, `jondi-circle`, …** (private, membership-gated)
- private channels
- sessions
- client / practice work

**Key rule:** every active practitioner **auto-belongs to `all-practitioners`** (common field — everyone can orient together), **but private/team work stays bounded** inside the specific `studio_team`, governed by `studio_team_members`.

This yields both: (1) a common field, and (2) distinct, private teams.

Example routes:
```
/team/all-practitioners/announcements
/team/all-practitioners/general
/team/soullab/general
/team/heather-studio/general
```

## 3. Seeded vs lazy provisioning

- **Platform teams seeded eagerly in M1:** `soullab` (adopts existing channels) and `all-practitioners` (4 commons channels). These are known up front.
- **Individual practitioner teams:** `#general` is **lazily provisioned on first open by a team member.** New teams do not pre-create channels.

## 4. Schema changes (M1)

`studio_teams`
- ADD `slug TEXT UNIQUE NOT NULL` — the URL namespace. Backfill `slugify(name)` for existing rows.

`team_channels` (today: no `team_id`; `slug TEXT NOT NULL UNIQUE` globally — `database/migrations/20260321000001_team_messaging.sql:8`)
- ADD `team_id UUID NOT NULL REFERENCES studio_teams(id)`.
- DROP global `UNIQUE(slug)`; ADD `UNIQUE(team_id, slug)`.

**Backfill (the one destructive-adjacent step):**
1. Create `soullab` + `all-practitioners` teams.
2. ⚠️ **Existing channels (general/exec/ops/dev/design/random) + their live messages → `soullab`.** *Assumption open to veto: existing Co-lab history belongs to the internal Soullab team, not the practitioner commons. The exec/ops/dev/design channels are internal-ops by name, so this is the natural home.*
3. Seed `all-practitioners` channels.
4. **Auto-membership:** `all-practitioners` is seeded with every active practitioner that has a linked member — `JOIN practitioners p ON p.status='active' AND p.member_id IS NOT NULL`. (`practitioners.member_id` exists — added in `20260114000001_practitioner_themes.sql:149`, indexed.) `soullab` is seeded with **ALL current members**, which preserves today's open "everyone sees every channel" access; curating that roster down is a deliberate follow-up enabled by the new gate, not baked in. Owner enrolled in both platform teams.

**Resolved from schema:**
- `owner_id` for seeded teams = earliest member by `created_at` (matches the existing channel-seed convention).
- ⚠️ `studio_team_members` is **absent in the live DB** — the canonical studio migration `20260202100001` only partially landed. **M1 (`soulcomms_multi_team`) CREATEs it `IF NOT EXISTS`** rather than depending on that file.
- Admin role = `members.roles TEXT[]` (`isAdmin = roles.includes('admin')`, `lib/hooks/useSession.ts:205`); no `members.is_admin` column.

## 5. Routing (M2)

- Rename `app/team/[channelSlug]` → `app/team/[teamSlug]/[channelSlug]` (Next.js forbids two differently-named dynamic segments at one path level, so the channel page moves down a level).
- **Reserved teamSlugs** (static routes resolve before dynamic, so they keep working but can never be a team slug): `for-you`, `dm`, `decisions`, `admin`, `invite`. These stay **member-global / cross-team**. Enforce a teamSlug blocklist at team creation.
- **Redirect** old `/team/[slug]` → `/team/soullab/[slug]` so existing links survive.
- **Capacitor:** the nested dynamic route must be checked against `scripts/capacitor-patch-routes.sh` / `EXCLUDED_DYNAMIC_ROUTES` for the iOS static export.

## 6. Access control + provisioning (M3)

- `listChannels(memberId)` → `listChannels(memberId, teamId)`, scoped to teams the member belongs to.
- Team access: member must be in `studio_team_members` for the team behind `teamSlug` (`all-practitioners` is auto-populated). Non-members → 403/404. *Note: today every public channel is visible to every authenticated member — this introduces real per-team access control.*
- Lazy `#general`: on first open of a team that has no channels, a **member** triggers get-or-create.
- Auto-add hook on practitioner activation → keep `all-practitioners` membership current.

## 7. Components + notifications (M4)

- Sidebar / ChannelView links become `/team/${teamSlug}/${channelSlug}` (today `components/team/TeamSidebar.tsx` builds `/team/${slug}`).
- Team switcher UI: list the member's teams; `all-practitioners` always present.
- **Open item — colab-badge:** today one global count (directed attention + unread DMs — `app/api/team/colab-badge/route.ts`). DMs are cross-team; channel mentions are team-scoped. **Proposal:** keep the global badge, add per-team unread dots in the switcher. **Decision deferred to M4.**

## 8. Migration safety

- M1 is a single transaction: additive columns + backfill + constraint swap. Reversible (drop columns/constraint; existing message rows are untouched, `team_id` is derived).
- Applied via `scripts/apply-migrations.sh` (tracked in `schema_migrations`) — **not** by `docker compose up --build`. Verify `information_schema.columns`, not just the migration record (phantom-record trap, per OPS notes).

## 9. Build order

1. **M1** — schema + teams + membership. **Canonical file: `database/migrations/20260609000001_soulcomms_multi_team.sql`** (written by a concurrent session; adopted over an earlier duplicate `_team_in_url.sql`, now deleted). Adds `studio_team_members` (defensive create), `studio_teams.slug`, `team_channels.team_id`, `UNIQUE(team_id, slug)`; seeds `soullab` (all members) + `all-practitioners` (active practitioners). **Plus `20260609000002_soulcomms_practitioner_commons_channels.sql`** — seeds the 4 commons channels (the one thing the canonical M1 omitted).
2. **M2** — routes (`[teamSlug]/[channelSlug]`, reserved-slug guard, redirect, Capacitor check).
3. **M3** — team-scoped channel list + access control + lazy `#general` (+ roster curation if desired).
4. **M4** — sidebar/ChannelView links + team switcher + badge decision.

> **Coordination flag:** two untracked SoulComms migrations existed in the working tree minutes apart — a concurrent session is building this feature. Converged on `_multi_team.sql`; recommend consolidating sessions before M2 to avoid divergence.

## 10. Open items (need Kelly)

- [ ] **Confirm existing channels adopt into `soullab`** (§4.2) — the one live-data assumption in M1. Veto before the migration runs if Co-lab history should land elsewhere.
- [ ] **`soullab` roster** — M1 seeds **all current members** (preserves current open access). Confirm, or flag that you want it curated to founders/staff (a follow-up the gate now enables).
- [ ] **colab-badge:** global vs per-team (§7) — deferred to M4, not blocking.
- [ ] **Consolidate concurrent sessions** building this feature (§9 flag).

**Resolved (no longer open):** auto-membership source = `practitioners.member_id` where `status='active'` (column confirmed to exist). `owner_id` = earliest member. `studio_team_members` created defensively (absent in live DB).
