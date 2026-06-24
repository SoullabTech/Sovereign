# Co-lab vs. Kaizen Echo — Capability Gap Map

**Date:** 2026-06-06
**Trigger:** Evaluating a Kaizen Echo lifetime deal (Slack-alternative SaaS) "for Co-lab."
**Verdict in one line:** *Echo's LTD buys a hosted, less-integrated version of what Co-lab already is — at the cost of the self-hosted vow. Don't adopt it as infrastructure; mine ~4 feature ideas.*

---

## Status calibration (read first)

Every "HAVE / EXCEEDS" row below means **present in the codebase** — migration + API route + component all found. It does **not** assert per-feature production liveness. What *is* confirmed live: the Studio shell and the Co-lab module in the Practice Portal sidebar (observed in-app 2026-06-06). Per-feature runtime verification (do messages/reactions/read-receipts actually round-trip in prod?) is a separate pass — see "Verification" below. This follows the house rule: *built ≠ wired ≠ surfacing ≠ verified.*

---

## Co-lab is actually two surfaces (structural note)

Both are branded "Co-lab"; they are different implementations serving different functions:

| Surface | Route | Tables | Function |
|---|---|---|---|
| **Chat workspace** | `/team` (the module href) | `team_channels`, `team_messages`, `team_reactions`, `team_presence`, `team_channel_reads`, `team_dm_*`, `team_invites` | Slack/Echo-equivalent real-time messaging |
| **Shared-field / delegation** | `/studio/teams` | `studio_teams`, `studio_team_members` (owner/admin/member/viewer), team-scoped `triage`/`agent_tasks`/`shipments`/`daily_log`/`clarity_artifacts` | Collaborative work artifacts + delegation |

→ **Open question for you:** is the two-surface split intentional (chat vs. shared-work), or drift that should consolidate? Not deciding here.

---

## The map: Echo's pitch vs. what exists

✅ HAVE · ⭐ EXCEEDS (Echo has nothing equivalent) · △ PARTIAL · ❌ GAP

| Echo feature | Status | Where it lives in MAIA |
|---|---|---|
| Channels / workspaces | ✅ | `team_channels`, `app/team/[channelSlug]` |
| Public/private channels + who-can-see | ⭐ | `is_private` + `team_channel_members` + `ChannelVisibilityToggle` (participant-count preview + 403 enforcement on revoke) |
| Client privacy isolation (John ≠ Peter) | ✅ | private-channel membership; `practitioner_clients` isolation |
| Threaded replies | ✅ | `team_messages.parent_id`; `ChannelView` thread panel |
| Reactions | ✅ | `team_reactions` |
| Read receipts | ✅ | `team_channel_reads` |
| Presence | ✅ | `team_presence` |
| Direct messages | ✅ | `team_dm_threads/messages`, `app/team/dm` |
| Email invites + roles | ✅ | `team_invites`, `studio_team_invites` (owner/admin/member/viewer) |
| Real-time updates | ✅ | SSE cursor in `ChannelView` |
| Message classification / badges | ⭐ | `message_kind` (build·question·decision·insight) — semantic, quieter than Echo |
| Field-shaped channel semantics | ⭐ | `ChannelPurposeHeader` (archetype, responseMode, purposeBlock) — Echo structurally can't have this |
| Shared work items / delegation | ⭐ | `studio_teams` + team-scoped triage/tasks/shipments; Command Center "Quick Delegate" |
| File storage ("Flow") | ✅ | Vault (`app/studio/vault`) — sovereign |
| Recording + transcript (Echo's "Space", partial) | ✅ | Session Room (recording, transcript, MAIA) |
| AI / agentic features (Echo lists as **planned**) | ⭐ | MAIA in-stack: Consult MAIA, `agent-tasks`, Quick Delegate to maia-dev — shipped, not "planned" |
| Unlimited external users | ✅ (advantage) | self-hosted → no per-seat license to begin with |
| **Topics / sub-channels inside a channel** | ❌ | channels are flat — *real gap* |
| **Inline polls** | ❌ | no poll table anywhere — *real gap (small build)* |
| **Inline to-do inside a channel** | △ | tasks exist & are team-scopable (`studio_tasks`, `studio_agent_tasks.team_id`) but not rendered inline in chat — *wire, not build* |
| **Video call from a channel** | △ | `comms_channels` supports video provider (livekit/jitsi) + Live Camera module exist; not wired to a "start meeting" button in a channel — *wire* |
| **Internal + external comms unified in one inbox** | △ | internal = `team_channels`; external/client = `comms_spine` (`comms_threads`/`comms_messages`) + portal messaging — two systems, not one surface — *architecture question* |
| **Auto-sync recordings/transcripts → chat (Echo's "planned")** | ❌ | Session Room → Co-lab channel not wired — *wire* |

**Tally:** of ~23 Echo capabilities, MAIA already **has or exceeds ~16**. Two of Echo's headline "coming soon" items (agentic features, recording→chat sync) are either shipped here or one wire away, *because MAIA + Session Room already exist.*

---

## Sovereignty / canon verdict

Adopting Echo as infrastructure would:
- Break **self-hosted by design** + **no third party between users and their data** (client/practitioner conversations on someone else's server).
- Trip the **Federated Relational Architecture** collapse signature: SaaS vocabulary ("Teams / Workspaces / channels / admin-billing") imported into a practitioner surface.
- Take on **LTD lock-in risk** — betting a relationship layer on an early-stage SaaS's survival, the exact dependency the architecture rejects.

**Where Slack/Echo is genuinely fine:** *internal Soullab team logistics only* (cultural-production/ops coordination) — that's not Co-lab. Member/practitioner/client conversation stays sovereign.

---

## What to actually mine from Echo (roadmap, not a purchase)

Ordered by effort. Each re-expressed in field-shaped vocabulary, built on the existing stack:

1. **Topics / sub-channels** (❌→build) — the one structurally-missing primitive. Sub-grouping within a channel (e.g. per-client "recordings / homework / admin").
2. **Recording → Co-lab wire** (❌→wire) — drop a Session Room recording+transcript into a channel/topic. Highest leverage; both halves already exist.
3. **Inline to-do in channel** (△→wire) — surface team-scoped `studio_tasks` inside `ChannelView`.
4. **Video-call-from-channel** (△→wire) — a "start meeting" affordance using the existing livekit/jitsi `comms_channels` provider.
5. **Inline polls** (❌→small build) — `team_polls` + a `poll` message_kind. Lowest priority.
6. **Internal+external unification** (△→architecture) — deliberately deferred; merging `team_channels` with `comms_spine` is a design decision, not a feature. *Do not collapse without a gravitational-center call* (Federated Relational canon).

---

## Verification (next pass, if wanted)

Confirm per-feature prod liveness before treating any ✅ as Live:
- `app/team` channel send/receive round-trip under auth
- `team_channel_reads` actually advancing (read receipts)
- `ChannelVisibilityToggle` 403 enforcement on revoke
- Session Room recording artifact persistence

Until then: **Co-lab module = Live; feature rows = built-in-codebase, runtime-unverified.**
