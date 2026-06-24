# Studio Beta Readiness Map — Collaborative Operating Environment

**Date:** 2026-06-06
**Frame (Kelly):** Don't ask "what features are missing?" Ask "what must 2 therapists + 1 engineer accomplish *together*?" Test Studio as an operating environment, not a feature collection. Readiness = the team can discuss → decide → assign → follow through → preserve continuity, without leaving for Slack/email/Docs.
**Method:** every status below is code-grounded (file/table cited). House ladder: built ≠ wired ≠ surfacing ≠ verified.

---

## Headline

The **chat layer is ready to use Monday.** The two wires that turn chat into an *operating environment* — **decision retrieval** and **discussion → task** — are exactly the gaps you predicted would force exits. Both are **small builds** (the data models already exist; only the retrieval view and the one-move wire are missing). Your instinct was right; here's the precise reality under each item.

---

## Priority sequence — code-grounded status

### 1. Team Channels — ✅ READY (smoke-verify first)
- Create channels: `POST /api/team/channels` → `INSERT INTO team_channels`. Your 5 (`#beta-testing #member-experience #session-room #engineering #release-readiness`) are creatable today.
- Public/private + membership, DMs (`/team/dm`), presence, read receipts, threads, admin panel — all built (`components/team/*`).
- **Gap:** none structural. **Caveat:** runtime-unverified end-to-end. → smoke-verify before Week 1 (send/receive, read receipts advancing, private 403 on revoke).

### 2. Decision Capture — ⚠️ HALF-BUILT (the #1 readiness gap)
- **Capture ✅:** `MessageInput.tsx` lets you tag a message `decision` (KIND_OPTIONS); `MessageBubble.tsx` renders a Decision badge.
- **Retrieval ❌:** there is **no decisions view, no kind filter, and no message search in `/team` at all.** The only search in the team UI is *member* search; `ChannelView` does an in-memory `find()` by id. **"What did we decide last week?" is not answerable today.**
- **Extra finding — decisions are fragmented across two systems:** a *separate* `studio_decisions` subsystem exists (`app/studio/decisions/*` + the Command Center "Decisions Needed" card). A decision tagged in a channel does **not** appear there, and vice versa. Two disconnected meanings of "decision."
- → **Build before Week 2 (small):** a decisions view over `team_messages WHERE message_kind='decision'` (per-channel + cross-channel, time-scoped). Decide later whether to unify with `studio_decisions`.

### 3. Discussion → Task — ❌ MISSING (the #2 readiness gap)
- **Task model ✅:** `studio_tasks` (status todo/in_progress/delegated/completed, priority, `assignee`, `team_id`, subtasks JSONB) — solid.
- **The wire ❌:** **no "make task" action anywhere in `components/team`**, and `studio_tasks` has no message/channel reference. *A decision cannot become a task in one move* — your stated leave-Studio trigger, confirmed.
- **Wrinkle:** `studio_tasks.team_id` points at `studio_teams` (the `/studio/teams` surface), but channels live in `team_channels` (the `/team` surface) — the two-Co-lab-surface split. For beta, simplest wire ignores `studio_teams` scoping: "Make task" on a message → `studio_tasks` insert with `assignee` + a new `source_message_id` link.
- → **Build before Week 3 (small-medium).**

### 4. Session → Co-lab — ❌ SPEC'D, not built
- `docs/specs/SESSION_ROOM_TO_COLAB_WIRE_SPEC_2026-06-06.md`. Correctly sequenced *behind* #2 and #3.

### 5. Video / Voice from channel — ❌ infra-only
- `comms_channels` supports livekit/jitsi provider; Live Camera module exists; **not wired to a channel "start meeting" affordance.** Lowest priority.

---

## Role success criteria — quick verdict

| Practitioner | Status |
|---|---|
| review member journeys | ✅ separate (Clients/Caseload modules) |
| share insights w/ practitioner | ✅ channels/DMs + `insight` kind (but can't retrieve insights as a set — same gap as decisions) |
| hand off a case/thread | ⚠️ DMs exist; **no structured case/thread handoff** in `/team` |
| discuss a session w/o losing context | ✅ threads (`ThreadPanel`) |
| create practices/reflections | ✅ channel `archetype`/`purposeBlock` + MAIA reflect |

| Engineer | Status |
|---|---|
| understand what happened | ⚠️ readable in-channel, **no search** |
| find decisions | ❌ **not retrievable** (see #2) |
| find action items | ❌ no task-in-channel (see #3) |
| trace work | ❌ no message→task→decision links yet |
| coordinate releases | ✅ a `#release-readiness` channel works for discussion |

| Team | Status |
|---|---|
| discuss | ✅ | make a decision | ⚠️ tag yes, find no | assign responsibility | ❌ | follow through | ❌ (no task wire) | preserve continuity | ⚠️ chat persists; cross-system continuity is #4 |

---

## What to ignore for beta (confirmed)

Reactions + emojis **already exist** (`team_reactions`, `handleReact`) — don't invest further, don't remove. Polls **don't exist** — keep it that way. No Slack parity. (Matches gap-map ranking.)

---

## Roadmap (your structure, annotated with the minimum builds)

- **Pre-Week 1:** smoke-verify `/team` (the gate to "use Monday"). Create the 5 channels.
- **Week 1 — use as primary team layer.** You'll feel the decision-retrieval gap immediately; that's the signal, not a surprise.
- **Before Week 2:** build **decisions view** (#2). Then run real practitioner collaboration Week 2.
- **Before Week 3:** build **discussion → task** (#3). Then run release/eng coordination Week 3.
- **Week 4 — log every exit** (email/text/Slack/Zoom/Docs). Each exit = next priority. Expect: session→Co-lab (#4) and case-handoff to surface here.

## The readiness verdict

> Studio can be *used* as a team operating environment Monday — but it cannot yet *close the loop* (decide → find → assign → trace). The two missing wires are small and pre-identified. Build them in the Week-1→2 and Week-2→3 gaps, driven by the exits the team actually hits.
