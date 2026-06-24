# SoulComms M2 — Delta Handoff

```
Owner: feature/team-soulcomms
Scope: M2 routing restructure (and M3/M4 per the canonical spec)
```

**Canonical spec:** [`SOULCOMMS_MULTI_TEAM_SPEC_2026-06-09.md`](./SOULCOMMS_MULTI_TEAM_SPEC_2026-06-09.md)
**Superseded (context only):** [`SOULCOMMS_TEAM_IN_URL_2026-06-09.md`](./SOULCOMMS_TEAM_IN_URL_2026-06-09.md)

These are **architectural decisions + one migration**, handed over for integration at the owner's discretion. **Not** implementation ownership — the `feature/team-soulcomms` session drives all route work. No `app/team/*` changes were made by this session; nothing was committed (committing the untracked M1 elsewhere would fork it).

---

## Pre-M2 checklist (owner — do this first)

**Before any route work, `git status` on the M2 branch must show only:**

```
canonical M1  (20260609000001_soulcomms_multi_team.sql)
adopted 002   (20260609000002_soulcomms_practitioner_commons_channels.sql)
intended route files (app/team/*, redirects)
```

This keeps the shared working tree from carrying **stray superseded artifacts** into the route branch. In particular: the superseded [`SOULCOMMS_TEAM_IN_URL_2026-06-09.md`](./SOULCOMMS_TEAM_IN_URL_2026-06-09.md) is **context only** — commit it (if at all) separately; it must **not** ride along in the M2 route commit. The working tree this handoff was written in also carries ~55 unrelated WIP files — stage explicitly, never `git add -A`.

---

## 1. Practitioner commons channels migration (gap-filler — ready to adopt)

**File:** `database/migrations/20260609000002_soulcomms_practitioner_commons_channels.sql` (untracked, in the working tree)

- Seeds 4 channels into `all-practitioners`: `announcements` (`channel_type='announcement'`), `general`, `introductions`, `support`.
- M1 (`20260609000001_soulcomms_multi_team.sql`) seeds the *teams + membership* but **not** these channels. Per the product shape, `all-practitioners` ships with these four.
- Idempotent (`ON CONFLICT (team_id, slug) DO NOTHING`); safe no-op if `all-practitioners` absent; `created_by` = team owner; timestamp `002` applies after M1.
- Owner action: pull into `feature/team-soulcomms` and commit alongside M1, or fold into M1's seed block.

## 2. Reserved-slug constraints

- `/team/[teamSlug]/[channelSlug]` collides with existing **member-global static routes**. Next.js resolves static before dynamic, so they keep working — but these names must be **reserved** (never assignable as a `teamSlug`): `for-you`, `dm`, `decisions`, `admin`, `invite`.
- Enforce a `teamSlug` **blocklist at team creation**.
- Rename `app/team/[channelSlug]` → `app/team/[teamSlug]/[channelSlug]` is required (Next.js forbids two differently-named dynamic segments at one path level).

## 3. Admin-jurisdiction split (membership policy ≠ migration)

- M1 seeds `soullab` = **ALL current members** (preserves today's open "everyone sees every channel" access). Lowest-risk migration behavior.
- Roster curation is an **administrative action** via `/team/[teamSlug]/admin`, done **after** team-admin exists — never a schema-rollout concern. Do not revoke access during the structural migration.

## 4. Global DM decision

- DMs are **GLOBAL**. `team_dm_*` stays untouched (no `team_id`). DM route stays top-level `/team/dm/[id]`, **not** under `[teamSlug]`.
- Invariant: *"Teams own shared spaces. People own direct relationships."* (Already in the canonical spec — confirming alignment.)

## 5. Cookie-as-selector-only decision

- Team identity lives in the **URL**, never hidden state. No "current team" cookie exists today; none should be introduced as **authority**.
- If a client selector is ever added (remember last-opened team), it is a **convenience default only** — the URL is always authoritative. The studio-side `TeamContextProvider.currentTeamId` (localStorage) must **not** become the access source for chat.

---

## Corrections surfaced during reconciliation (verify against canonical)

- **`practitioners.member_id` EXISTS** (`20260114000001_practitioner_themes.sql:149`, indexed) — first-class link for auto-membership; M1 already uses it. (An earlier "no member_id" claim in this session was wrong.)
- **`studio_team_members` is ABSENT in the live DB** — canonical studio migration `20260202100001` only partially landed. M1 correctly CREATEs it `IF NOT EXISTS`.
- **Capacitor/iOS:** the nested dynamic route `[teamSlug]/[channelSlug]` must be checked against `scripts/capacitor-patch-routes.sh` / `EXCLUDED_DYNAMIC_ROUTES` for the static export.

## What was NOT done (held per ownership rule)

No `app/team/*` edits · no route-directory moves · no redirects · no deep-link changes · no new M2 branch · no commits. Held until the owner drives.
