# Practitioner Studio — Production-Grounded Inventory (2026-06-06)

**Purpose**: Establish *what actually exists, what is merely wired, and what is truly being used* before any navigation / rail decision. The rail question ("which surfaces deserve permanent real estate?") cannot be answered from memory or from code-reading alone — the **Used** column requires production evidence. This is the Co-lab discoverability lesson generalized: *technically wired ≠ in the path people actually travel.*

**Method**: Code-read for Exists/Wired (two Explore passes) + exact `COUNT(*)` and `to_regclass` existence checks against the production `maia_consciousness` DB on minisforum. Live-row *estimates* from `pg_stat_user_tables` were stale (reported `members=2`; real count is 67) — all figures below are exact `COUNT(*)`.

**Cohort context**: `members = 67`, `practitioners = 13`. The practitioner persona is populated and real, not hypothetical.

---

## The 12 surfaces

| # | Surface | Exists | Wired | Used (production evidence) | Primary user | Verdict |
|---|---------|--------|-------|----------------------------|--------------|---------|
| 1 | **Practice Portal** (`/studio/portal`) | ✓ | ✓ → `practitioner_clients`, `client_invites` (both tables exist) | **0 rows** | Practitioner | Built + wired, **not yet used** |
| 2 | **Session Room** (`/studio/session-room`) | ✓ | ✓ → `scribe_sessions`, `studio_session_markers` | 69 sessions **but 65 are Kelly (tester)**; 2 real actors (Lauri, Jondi), both stale (Mar/Apr) | Practitioner | **Dogfooded, not adopted** (see Attribution §) |
| 3 | **Communications** (`/studio/comms`) | ✓ | ✗ UI is mock; only `POST /api/notifications/sms` is real (no comms table) | n/a | Practitioner | Placeholder UI + real SMS endpoint |
| 4 | **Tasks** (`/studio/tasks`) | ✓ | ✓ → `studio_tasks`, `member_energy_state` | **2 rows** (last 2026-06-06) | Practitioner | Wired, **trace use only** |
| 5 | **Marketing** (`/studio/marketing`) | ✓ | ✗ hardcoded `mockStats`, no backend | 0 | Practitioner | **Showroom** |
| 6 | **Media Studio** (`/studio/media`) | ✓ | ✓ → `media_projects` (table exists) | **0 rows** | Practitioner | Built + wired, **not yet used** |
| 7 | **Live Camera** (`/studio/camera`) | ✓ | ✗ browser-only (MediaDevices), no server | n/a | Practitioner | **Showroom / browser-only** |
| 8 | **Vault** (`/studio/vault`) | ✓ (page) | ✗ **`vault_files` table ABSENT** → `/api/vault/files` 404s | 0 / broken | Practitioner | **DEAD** — page calls a nonexistent API |
| 9 | **Co-lab** (`/team`; `/studio/teams`) | ✓ | ✓ → `team_messages`, `team_dm_messages`, `team_presence`, `studio_decisions` (note: `teams` table ABSENT — `/studio/teams` likely stub; the live surface is `/team`) | recent activity **100% Kelly**; channel msgs 7/7 Kelly; non-Kelly DMs stale (Mar); decisions feature has 8 distinct owners but pre-May & direct (not via Co-lab loop) | Team | **Kelly-dogfooded; not yet a shared space** (see Attribution §) |
| 10 | **MAIA — studio consultation** (`/studio/maia`) | ✓ | ✓ → oracle conversation | Member-facing MAIA substrate is the platform's most-used system (`conversation_memory_uses` 46k, `agent_runs` 24k); studio-*scoped* consultation logging unverified | Member / Practitioner | Member-MAIA **LIVE**; studio-scope unverified |
| 11 | **Tools** (`/studio/tools`) | ✓ | ✗ static directory / affiliate links | n/a | Practitioner | **Showroom** |
| 12 | **Settings** (`/studio/settings`) | ✓ | ✓ → `studio_settings` (table exists) | **0 rows** | Practitioner | Built + wired, **~not yet used** |

**Adjacent surface not in the 12 but with real use**: `studio_changes` = **15 rows** (last 2026-06-01) — the field-mode "Changes / life-transition" tracker.

---

## What the data says about the center of gravity

1. **The platform's real usage center of gravity is member-facing MAIA**, not the practitioner Studio — `conversation_memory_uses` 46,784; `agent_runs` 23,878; `supervision_transcript_segments` 12,811. The Studio is a younger, lighter layer on top of a heavily-used consciousness substrate.

2. **Within the Studio, only two surfaces show real, recent operational use**: **Session Room** (69 sessions) and **Co-lab** (29 decisions + 19 DMs, active today). This confirms the working suspicion — *Studio is largely a container of historical / aspirational surfaces; Co-lab and Session Room are the live operational ones* — with one correction: 13 practitioner records and 69 scribe sessions mean the practitioner workflow is real, not speculative.

3. **The rest of the 12 splits three ways**: built-but-0-rows (Practice Portal, Media, Settings, Tasks≈trace), showrooms with no backend (Marketing, Live Camera, Tools, Comms), and **one dead surface** (Vault → missing table, will 404).

---

## Attribution § — RESOLVED (2026-06-06, decisive)

Ran distinct-actor + recency attribution, netting out `members.tester`. The raw row counts above are heavily inflated by developer/dogfood activity. Corrected reading:

**Cohort**: 67 members; **63 non-testers**; 4 testers. But only **2 members carry `is_practitioner = true`**, despite **13 rows in the `practitioners` table** (10 real names + 3 Kelly test accounts). → *Practitioner records and the `is_practitioner` member flag are out of sync.*

**Per-surface real (non-Kelly) usage:**
| Surface | Total rows | Kelly (tester) | Distinct real actors | Recency of real use |
|---|---|---|---|---|
| Session Room (`scribe_sessions`) | 69 | **65** | 2 (Lauri, Jondi) | stale — Mar / Apr 2026 |
| Co-lab channel (`team_messages`) | 7 | **7** | 0 | n/a |
| Co-lab DMs (`team_dm_messages`) | 19 | 13 | 2 (Debra, Cece) | stale — Mar 2026 |
| Co-lab decisions (`studio_decisions`) | 29 | 3 recent | **8 distinct owners** | mostly direct + pre-May; Co-lab *loop* = Kelly-only (1 capturer) |
| Changes (`studio_changes`) | 15 | 4 | 1 (Cece) + 10 unattributed | Jun 1 (unattributed) / Mar |

**Conclusions:**
1. **Neither Session Room nor Co-lab is a shared operational space yet.** Both are primarily Kelly's dogfooding. The only multi-actor, currently-recurring surface on the platform is **member-facing MAIA**.
2. **The practitioner cohort is real as records, not as usage.** ~10 real practitioners onboarded (Jan–Jun 2026); the operational surfaces show ~0 sustained use by them. **The gap to launch is activation, not navigation.**
3. **The decisions feature is the broadest non-Kelly Studio footprint** (8 distinct practice-owners) — but it went quiet after mid-May and was used *directly*, not through the Co-lab loop. Looks like an adoption push that lost momentum (retention gap), not a discoverability gap.
4. **Suspected blocker (hypothesis, not yet verified):** 13 practitioner records vs 2 `is_practitioner` flags. If `/api/studio/whoami` gates on `is_practitioner`, ~11 practitioners are bounced to `/studio/create` and never reach their Studio. This is the single most likely "the door is locked" explanation for near-zero usage, and a fast code-read to confirm. **If true, it outranks every rail/navigation question for the launch goal.**

**Implication for the rail decision:** promoting Co-lab is still defensible, but it is a **founder trajectory bet + forcing function** built on Kelly's conviction and dogfooding — *not* a response to observed practitioner behavior. It should be named as such. By observed multi-actor use, the only current anchor is MAIA.

---

## Access & Activation § — RESOLVED (2026-06-06): the bottleneck is the MAIA→Studio crossing, not access

Traced the full access path (`/api/studio/whoami` → `getCurrentPractitioner` → `app/studio/layout.tsx`) plus auth/usage reality.

**The identity gate keys on the `practitioners` row, NOT the flag.** `getCurrentPractitioner` (`lib/auth/getCurrentPractitioner.ts:37-56`) runs `SELECT … FROM practitioners WHERE member_id=$1 AND status='active'`. `members.is_practitioner` is **never read by the gate** — only the camelCase `isPractitioner` *response field* from whoami is. → the flag mismatch (13 practitioner rows vs 2 flags set) is **vestigial, not a blocker**. The earlier "locked door" hypothesis is **FALSIFIED**. All 12 active-status practitioners pass the gate and reach `/studio`; only suspended `Kelly Nezat` is bounced to `/studio/create` (`layout.tsx:125`).

**Auth is open and actively used.** 0 failed sign-ins across all 10 real practitioners. 6/10 signed in within 30 days (Tara 13 auth-sessions, Nathan 3, Andrea Fagan 3, + Andrea, Jondi, Rob).

**But their sessions go to member-facing MAIA, not the Studio.** Last-30d member MAIA sessions: **Tara 19, Andrea Fagan 9, Nathan 5**, Andrea 3, Jondi/Rob 2, kristen 1 — against **0** non-tester Studio operational activity. They return for MAIA-as-companion; the practitioner tooling layer has not activated.

**Resolved funnel:** Auth OPEN+used → Identity gate OPEN → lands in MAIA, returns → **does NOT cross into Studio tooling.** The blocker is product-validation of the MAIA→practice bridge — not access, not navigation, not feature-completeness.

**This reorders the priority stack:** rail/discoverability and feature-completion are both premature — they optimize a room engaged users aren't entering. Highest-leverage next move = talk to the engaged practitioners (Tara, Andrea Fagan, Nathan): *what would make you bring your practice work into MAIA?* — and build only the single bridge their answer names.

**Unambiguous defects to fix regardless of strategy:** dead Vault route (`vault_files` table absent → 404) and the vestigial `is_practitioner` mismatch (cosmetic — nothing branches on it, but clean it for sanity).

---

## Implications for the rail decision (SUPERSEDED — see Access & Activation § above; rail is premature)

The honest synthesis is that usage data answers two of the three rail questions but **not** the third:

- **PRUNE (data-clear)**: Vault is broken — fix or pull before launch. Marketing / Live Camera / Tools / Comms are showrooms — hide-by-default, do not give rail space.
- **PROVEN (data-clear)**: Session Room, Co-lab, and member-MAIA have earned standing by use.
- **THE BET (data cannot answer)**: The remaining built-but-unused surfaces (Practice Portal, Tasks, Scheduling, Settings) are unused *because the Studio has not been offered to practitioners yet* — not because practitioners rejected them. So the rail is partly a **design bet on the practitioner's intended daily path**, to be validated against real usage after onboarding, not a pure optimization of existing traffic.

**Sequence (per Kelly's framing)**: complete/​harden this inventory → decide global-rail vs Studio vs behind-nav → *then* finalize Co-lab promotion + attention-count placement. The clipping fix is independent and folds into the next UI pass regardless.

---

## Data-name reconciliations (for whoever queries next)

- Session Room tables are **`scribe_sessions` + `studio_session_markers`**, not the `rl_sessions` / `session_transcript_segments` an earlier code-read guessed. (`supervision_transcript_segments` 12,811 belongs to MAIA's internal supervision system, **not** practitioner scribe.)
- **`teams` and `vault_files` tables do not exist** in production. `/studio/teams` and `/studio/vault` reference backends that aren't there.
- `practitioner_clients`, `client_invites`, `media_projects`, `studio_settings`, `member_energy_state` **all exist** but Portal/Media/Settings carry **0 rows**.
