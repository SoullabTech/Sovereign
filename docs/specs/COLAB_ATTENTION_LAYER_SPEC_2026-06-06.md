# Co-lab Attention & Notification Layer — Spec

- **Date**: 2026-06-06
- **Status**: PROPOSED · Designed-layer (nothing here is Live yet — the §IX first receipt is the Live gate)
- **Claim discipline**: Live/Designed/Vision · Center of Gravity = *Designed* · Failure Test in §VI
- **Authors**: Kelly (boundary, primitive, MVP shape, first receipt) + Claude (ground-truth reconciliation, lifecycle, structural safeguards, wire-points)
- **Branch**: `chore/marketing-claim-architecture` (spec only — no code in this change)
- **Governs**: the Co-lab (`/team`) surface only. This is *Slack-for-the-practice* (team coordination), **not** the MAIA companion relationship. The "no attachment capture" vow applies here in its team-coordination form: **serve the work, do not manufacture pull.**
- **Update 2026-06-06**: D1 + D2 settled by Kelly (see §IV) — build path unblocked. Spec remains PROPOSED (MVP §V unbuilt). D2 resolved as *narrow "Opened" semantics* (a timestamp, not a privacy toggle), which changed the status model — see §II/§III.
- **Update 2026-06-06 (substrate pivot)**: steps 1–4 built + §IX HTTP receipt 11/11, but **NOT committed** — per Kelly the `attention_items` substrate is being generalized to a **polymorphic source** (B-substrate, A-surface) *before* commit, while the migration is still unshipped. The hard-FK schema in §II/§XI is **superseded** by [`ATTENTION_SUBSTRATE_GENERALIZATION_2026-06-06.md`](ATTENTION_SUBSTRATE_GENERALIZATION_2026-06-06.md). The lifecycle, boundary §0, decisions §IV, and safeguards §VI all carry forward unchanged.

> "The table is easy and the meaning is risky." — Kelly, 2026-06-06.
> This spec leads with the boundary on purpose. The schema is obvious enough to build; it is important enough to name before code.

---

## §0 — The Boundary (read first)

An **attention item** is a **sender-declared loop**: a human explicitly placed a claim on another human's attention, and that claim stays open until the recipient closes it.

It **is**:
- created only by an explicit human act (a mention, a request, an assignment)
- owned by the **recipient**, who alone opens it and moves it to `resolved` / `declined`
- a bounded obligation — it has an author, a source message, and an end state

It is **NOT**:
- **algorithmic engagement** — nothing the system *infers* you'd want creates an item
- **"bring people back"** — there is no re-engagement nudge, streak, or "we miss you"
- **popularity / relevance ranking** — the queue is ordered deterministically, never scored by predicted engagement
- **surveillance** — `opened` state exists only to inform the sender ("the loop reached you") and to suppress the digest; it carries no inference of agreement/reception/consent, and is never read for analytics, ranking, or training

These four negations are not aspirational copy. §VI makes each one structurally enforced and checkable. If any is violated, the layer has failed its boundary regardless of technical merit (MAIA Oath standard).

**Why this layer is sovereignty-positive when it holds the boundary:** today, an unanswered ask in Co-lab lives in ambiguity (did they see it? do they owe me a reply? am I ghosting them?). Making the loop *explicit* — with `request` to declare it and `decline` to honestly close it — replaces guilt and guesswork with a bounded, mutually-visible state. That **increases** agency. The risk is the opposite drift (instant pings, manufactured urgency, read-surveillance pressure); §VI is the price of avoiding it.

---

## §I — What already exists (do not re-build)

Ground-truthed against the codebase 2026-06-06. ~60% of the originally-imagined "notification layer" is already Live.

| Capability | Status | Evidence |
|---|---|---|
| Unread badges (channel + DM list) | **Live** | `components/team/TeamSidebar.tsx:534`, `:448` |
| Channel-level last-read cursor | **Live** | `team_channel_reads(channel_id, member_id, last_read_at)` — `database/migrations/20260321000001_team_messaging.sql:78`; `markChannelRead()` on send at `app/api/team/channels/[channelId]/messages/route.ts:86` |
| Message-kind selector | **Live** | `build·question·decision·insight` — `components/team/MessageInput.tsx:156`, `database/migrations/20260321000004_team_message_kinds.sql:6` |
| Decision → Task loop w/ provenance | **Live (deployed)** | `app/api/team/decisions/[decisionId]/tasks/route.ts`; `database/migrations/20260606000001_colab_decision_task_provenance.sql` |
| Email on DM / thread-reply / @mention | **Live (immediate)** | `lib/team/notifications.ts` (Resend, fire-and-forget) |
| @mention parsing | **Partial** | regex `/@(\w+)/g` at `lib/team/notifications.ts:150` — parsed at send, **never stored** |
| SSE realtime | **Partial** | only a `messages` event — `app/api/team/channels/[channelId]/stream/route.ts:50` |
| Sender-side "opened" receipt | **Absent** | — |
| @mention as queryable identity | **Absent** | — |
| "Needs response" / assigned-to-you state | **Absent** | — |
| App-level attention rollup / "For You" inbox | **Absent** | — |

**Implication:** the missing thing is not "notifications." It is the **per-(recipient, message) attention record** — the join that turns "a new message exists" into "*you* have an open loop." Everything Absent above is a *view over that one record*.

---

## §II — The primitive

```sql
attention_items
  id              uuid pk
  recipient_id    uuid not null   -- whose attention is claimed (FK members)
  source_message_id uuid not null -- the message that created the loop (FK team_messages)
  source_channel_id uuid not null -- denormalized for fast "For You" scoping (FK team_channels)
  kind            text not null   -- mention | request | assignment | thread_reply
  status          text not null default 'open'  -- open | resolved | declined  (CLOSURE state only)
  created_by      uuid not null   -- the human author of the loop (FK members) — NEVER null, NEVER system
  created_at      timestamptz not null default now()
  opened_at       timestamptz     -- set when recipient FIRST opens it; does NOT close the loop
  resolved_at     timestamptz     -- set on resolved OR declined
```

Constraints (these encode the boundary — see §VI):
- `created_by` **NOT NULL** + FK to `members` → no system-authored items, structurally.
- `CHECK (kind IN ('mention','request','assignment','thread_reply'))`
- `CHECK (status IN ('open','resolved','declined'))` — closure only; "opened" is the `opened_at` timestamp, not a status (opening ≠ closing)
- Idempotency: `UNIQUE (recipient_id, source_message_id, kind)` → one mention message can't spam a recipient with duplicate items.
- Indexes: `(recipient_id, status, created_at DESC)` for the For You query; `(source_message_id)` for the sender's opened/resolved display.

**Opening ≠ closing (D2).** An item stays `open` whether or not it's been opened; only the recipient's explicit `resolve`/`decline` closes it. "Opened" is a *fact* (`opened_at IS NOT NULL`), not a lifecycle state. The schema deliberately has **no** field for read-depth / agreement / reception / consent — so "Opened" structurally cannot leak any of those meanings.

### Two layers, not a replacement
`team_channel_reads` (Live) is the **ambient unread** layer — "this channel has stuff you haven't read," drives the sidebar badge. It stays exactly as-is.
`attention_items` (new) is the **directed attention** layer — "*you* specifically have N open loops." Different grain, different purpose. They coexist; the new table does not touch the read-cursor system.

### Two distinct "kinds" — do not conflate
| | `team_messages.message_kind` | `attention_items.kind` |
|---|---|---|
| Answers | what the message **is** (authored property) | why it's in **your** queue (the relation) |
| Values | build·question·decision·insight·**request** | mention·request·assignment·thread_reply |
| Example | Kelly posts a message tagged `request` that @-mentions Jondi | → creates an item `kind='request'` for Jondi |
| Example | A normal message @-mentions Jondi | → creates an item `kind='mention'` for Jondi |

So `message_kind='request'` **elevates** that message's @mentions from `mention` → `request` items. (See §IV-D1 for the no-mention case.)

---

## §III — Kinds & lifecycle

**Kinds, by signal strength** (this ordering is also the deterministic For You sort — §VI-S2):
1. `request` — strongest. Sender explicitly asked this recipient to respond/act. Closed only by explicit `resolved`/`declined`.
2. `assignment` — a task was assigned to the recipient (composes with the Live decision→task loop). *Phase 2 — seam defined in §X, not built in MVP.*
3. `mention` — the recipient was named. Informational-but-directed.
4. `thread_reply` — someone replied in a thread the recipient is part of. Lowest signal.

**Status = closure only (`open | resolved | declined`). "Opened" is a timestamp, not a status — opening a loop does not close it.**
```
        (creation)
            │
            ▼
          open ───────────────────► resolved
   (recipient opens → opened_at      └────────► declined
    set; status STAYS open)
```
- **opening** (recipient views the item/thread): sets `opened_at`. For `request`/`assignment`, status **stays `open`** — viewing is not closing. For `mention`/`thread_reply` (low-signal, no reply obligation), opening **auto-resolves** (`open → resolved`) per §IV-D3.
- `open → resolved` / `→ declined`: **always explicit**, recipient-only act (request/assignment). Sets `resolved_at`.
- the sender sees **"Opened"** (from `opened_at`) then **"Resolved"/"Declined"** (from status) — see §IV-D2 for the narrow meaning of "Opened".

**Ownership (sovereignty rule):** only `recipient_id` may set `opened_at` or move an item to `resolved`/`declined`. The sender may **withdraw** (a hard delete of their own item) but may never mark another person's item opened/resolved. Enforced in the PATCH route (§XI) by checking the actor against `recipient_id` (opened/status changes) vs `created_by` (withdraw).

**`declined` is a feature, not a failure.** It lets a recipient honestly close a loop they won't action ("not me / won't do this") instead of ghosting. The sender sees `declined`; that is healthier than indefinite `open`. (Tone/visibility nuance in §IV-D5.)

---

## §IV — Decisions table (locked vs open)

Kelly LOCKED: the primitive fields, the §0 boundary, the §V MVP, the §IX receipt, "email only for request/mention + delayed/digest."

| # | Decision | Disposition | Note |
|---|---|---|---|
| D1 | `request` with **no @mention** | **LOCKED (Kelly, 2026-06-06)** | No @mention → **no attention item** (visible as a request-shaped message, but creates no obligation). `request` + `@Jondi` → creates a `request` item for Jondi. Rationale: *"Request = this message is request-shaped; `@Jondi` = this request is **for** Jondi."* Without the @mention requirement, Request becomes a broadcast obligation — exactly the hidden attention-capture the boundary forbids. |
| D2 | Visibility & meaning of the recipient's open state | **LOCKED (Kelly, 2026-06-06)** | (a) **Visible to sender** — the sender must be able to tell the loop *reached* the person, else we recreate the "did they even see this?" problem the layer exists to solve. (b) **Label = "Opened", not "Seen"** — less psychologically loaded; a mechanical fact, not "you've been seen, now you owe me." (c) **Narrow semantics**: Opened = recipient opened the item. It does **NOT** imply agreed / accepted / responded / completed / consented — and the schema has **no field** that could carry those, so it cannot leak them. (d) **No privacy toggle in MVP** — too many settings obscure the primitive; honest labelling does the work. Revisit a per-member opt-out later only if a team context demands it. Recipient retains Decline / Resolve / Reply. |
| D3 | `mention` / `thread_reply` **auto-resolve on open**? | **PROPOSED-LOCK: yes** | Low-signal kinds carry no reply obligation; auto-resolving when opened keeps the For You queue honest. `request`/`assignment` never auto-resolve (opening sets `opened_at`, status stays `open`). |
| D4 | Who can **withdraw / resolve** | **LOCKED** | Recipient owns `opened`/`resolved`/`declined`. Sender may withdraw (delete own item) only. (§III ownership rule.) |
| D5 | Sender sees **`declined`** | **PROPOSED-LOCK: yes, visible** | Honest close beats ghosting. Surface it plainly, neutrally (no "rejected" framing). |
| D6 | Notification **consent gate** | **PROPOSED-LOCK** | `attention_notifications_enabled DEFAULT TRUE` per member — opt-out, mirrors the project's `conversational_recall_enabled` pattern. Consent infrastructure, not polish. |
| D7 | **DM** attention items in MVP? | **PROPOSED-LOCK: no** | DMs already email the recipient (`notifyDMRecipient`). MVP = channels only; fold DMs in Phase 2. (`message_kind` already exists on `team_dm_messages`, so the door is open.) |
| D8 | **Urgent / force-immediate** email escape hatch | **PROPOSED-LOCK: no (Phase 2)** | MVP email = digest only (§VIII). An "urgent" override is a Phase-2 escape hatch, deliberately excluded to protect the boundary first. |

---

## §V — MVP scope (Kelly's 5 steps → existing seams)

1. **Add `request` as a message kind.**
   - Migration: extend the `message_kind` CHECK to include `'request'` on **both** `team_messages` and `team_dm_messages` (note: Postgres CHECK alter = `DROP CONSTRAINT` + `ADD CONSTRAINT`; the existing constraint is auto-named — look it up or re-create named).
   - UI: add to `KIND_OPTIONS` + the `MessageKind` type at `components/team/MessageInput.tsx:156`; add a high-signal badge render at `components/team/MessageBubble.tsx:107` (request should show a badge — unlike `build`, which is the silent default).

2. **Store `@mentions` as real recipient-linked attention items.**
   - `lib/team/notifications.ts:150` (`notifyChannelMentions`) becomes the **creation site**: at the point username→`member.id` resolves (`:177`), `INSERT` an `attention_items` row (`kind = message_kind==='request' ? 'request' : 'mention'`).
   - **Remove the inline `resend.emails.send`** here — email moves to the digest sweep (§VIII). Creation = synchronous DB insert; email = async/deferred.
   - Caller `lib/team/ChannelService.ts:406` must pass `message_kind` + `messageId` so the creator knows the kind and the `source_message_id`.

3. **Add a "For You" surface.**
   - New route `GET app/api/team/attention/route.ts` → current member's items, deterministic order (§VI-S2).
   - New component `components/team/ForYou.tsx`, mounted in `TeamShell`, with a count indicator. MVP polls (reuse the existing 500ms–3s message-poll cadence); a dedicated SSE event is Phase 2 (§X).

4. **Sender sees `sent / Opened / Resolved`.**
   - Sender-side display reads `attention_items` by `source_message_id` (the `(source_message_id)` index). Render "Opened" (from `opened_at`) then "Resolved"/"Declined" on the message bubble. **No D2 toggle in MVP** — honest labelling ("Opened", narrow semantics) does the work.

5. **Email only for `request` / `mention`, delayed / digest-based.**
   - `maia-comms-worker` digest sweep (§VIII). One digest per recipient per window, unopened items only, respects D6 consent. No second nudge.

---

## §VI — Structural safeguards (the boundary, made mechanical)

Each §0 negation maps to an enforceable, auditable safeguard:

- **S1 — No system-authored items.** `created_by` NOT NULL + FK members. **Audit:** `SELECT count(*) FROM attention_items WHERE created_by IS NULL` must always be `0`. No code path may insert with a synthetic/system author.
- **S2 — No engagement ranking.** The For You query orders strictly by `(kind priority, created_at DESC)` — a fixed `CASE` on kind, never a model or score. Code-reviewable; no relevance/"suggested" field exists on the table.
- **S3 — No re-engagement.** The digest sweep sends **at most one** email per recipient per window, **only** for items still `open` AND unopened (`opened_at IS NULL`) past the delay. No streaks, no "we miss you," no escalation ladder, no second reminder. **Audit:** digest job has exactly one send path, guarded by `status='open' AND opened_at IS NULL AND not-yet-digested`.
- **S4 — No surveillance.** `opened_at` is read by exactly two consumers: (a) the sender-side display, (b) the digest-suppression check. It is never joined into analytics, ranking, or any training/aggregation path. The schema has **no** field for read-depth / agreement / reception / consent — narrow "Opened" semantics (D2c) are enforced by *absence*, not policy.
- **S5 — Recipient owns status.** Setting `opened_at` and transitions to `resolved`/`declined` require `actor == recipient_id`. Sender's only write is `withdraw` (delete own `created_by` row).

### Failure Test (claim-discipline)
> This layer has **failed its boundary** if any of the following is ever true:
> 1. an `attention_items` row exists with no human author (S1 breach), or
> 2. any email it sends is a re-engagement nudge rather than a one-shot unopened-digest (S3 breach), or
> 3. `opened`/read state is read by anything other than the sender-display and the digest-suppression, **or** any field is added that records read-depth / agreement / reception / consent (S4 breach).
>
> Each is a single, checkable query or code path. Failing any one invalidates the feature regardless of how well it works.

---

## §VII — Sovereignty Invariant check (CLAUDE.md mandatory)

1. **Does this increase user agency?** **Yes.** `request` lets a sender declare a bounded ask; `decline` lets a recipient honestly close it; the recipient owns resolution. Replaces ghosting/guilt/guesswork with mutually-visible state. *Residual risk:* opened-pressure → mitigated by D2's narrow "Opened" semantics (a mechanical fact — never agreement/consent/completion; the schema cannot infer read-depth).
2. **Does this push life outward into the world?** **Yes.** Co-lab coordination → action. Composes with the Live decisions→tasks→done loop; moves work toward completion rather than inward toward the app.
3. **Does this reduce the system's psychological centrality over time?** **Honest answer: NEUTRAL if the safeguards hold; NEGATIVE if they don't.** A notification layer's default gravity is to *increase* centrality (pull people back). It stays neutral **only** because of §VI — digest-not-instant (S3), sender-declared-not-algorithmic (S1), no manufactured pull (S2). The safeguards are not garnish; they are the condition under which this feature is allowed to ship. **If §VI cannot be held, the feature does not ship** (third invariant = a no).

---

## §VIII — Email / digest design

- **Home:** `maia-comms-worker` (existing background container). Not inline in the request path.
- **Sweep:** periodic (e.g. every N minutes). Select `attention_items` where `status='open'` AND `opened_at IS NULL` (unopened) AND `created_at < now() - <delay>` AND not-yet-digested AND `kind IN ('request','mention')` AND recipient `attention_notifications_enabled` (D6). Group by `recipient_id`; send **one** digest per recipient; mark digested.
- **Replaces** the immediate per-mention `resend.emails.send` at `lib/team/notifications.ts:188`. Behavior change is intentional: current = instant-per-mention (noisy); new = batched-when-unopened (boundary-aligned).
- Reuse the existing Resend client / `lib/comms/emailRouter.ts` (BYO vs managed) — no new transport.
- **One** digest only. If still unopened next window: **no** second email (S3). Once `opened_at` is set, the sender sees "Opened" — that *is* the signal; no nudge.

---

## §IX — First receipt (the Live gate)

> Kelly sends `@Jondi` a **Request** in a Co-lab channel
> → an `attention_items` row is created: `recipient=Jondi, kind=request, status=open, created_by=Kelly, source_message_id=<msg>`
> → Jondi sees it in **For You**
> → after the delay window, **one** digest email points Jondi to it (because still unopened)
> → Jondi opens the thread (`opened_at` set — status stays `open`), responds, marks **resolved** (`→ resolved`, `resolved_at` set)
> → Kelly sees **Opened → Resolved** on the message

**Stage language** (project contact-fidelity discipline — *built ≠ wired ≠ surfacing ≠ verified*):
- table + route + creation-site wired = **reachable**
- first real item surfacing in a member's For You under authenticated load = **verified-surfacing**
- the full open→opened→resolved chain observed end-to-end under authenticated load = **Live**

Do not let the first `INSERT … RETURNING` row inflate into "Live." Live = the whole chain, observed.

---

## §X — Explicitly out of scope / deferred

Frozen-plan discipline — these are named so they are not silently smuggled into the MVP:
- `assignment`-kind items from the decision→task loop — **Phase 2.** Seam: when `POST /api/team/decisions/[decisionId]/tasks` assigns an assignee, emit an `attention_items` row `kind='assignment'`. *Defined here, not built now.*
- DM attention items — **Phase 2** (D7).
- SSE push event for live For You / live opened-state — **Phase 2** (MVP polls).
- Cross-channel app-level rollup badge / notification bell / notification center — **Phase 2.**
- Urgent / force-immediate email override — **Phase 2** (D8).
- **NEVER** (boundary violation): any relevance/popularity ranking, any "suggested"/"you might want to see" surface, any system-inferred item, any re-engagement campaign.

---

## §XI — Migration & wire-points (concrete; no code in this change)

| Seam | File | Change |
|---|---|---|
| New table | `database/migrations/<ts>_colab_attention_items.sql` (new) | `attention_items` per §II + indexes + constraints |
| Enum extend | same or sibling migration | add `'request'` to `message_kind` CHECK on `team_messages` **and** `team_dm_messages` (DROP+ADD named constraint) |
| Consent col | same migration | `members.attention_notifications_enabled boolean NOT NULL DEFAULT true` (D6). No seen-receipt toggle in MVP (D2d) |
| Creation site | `lib/team/notifications.ts:143` | `notifyChannelMentions` → INSERT attention_items at `:177`; **remove** inline email send `:188` |
| Caller | `lib/team/ChannelService.ts:406` | pass `message_kind` + `messageId` through |
| Compose UI | `components/team/MessageInput.tsx:156` | add `'request'` to `KIND_OPTIONS` + `MessageKind` type |
| Badge UI | `components/team/MessageBubble.tsx:107` | add `request` badge (high-signal) |
| For You API | `app/api/team/attention/route.ts` (new) | `GET` list (deterministic order, S2); `PATCH` opened / resolve / decline (S5 actor check); `DELETE` withdraw (created_by) |
| For You UI | `components/team/ForYou.tsx` (new) + mount in `TeamShell` | list + count; poll |
| Sender receipt | `components/team/MessageBubble.tsx` | read items by `source_message_id`; show sent / Opened / Resolved (no toggle in MVP) |
| Digest | `maia-comms-worker` | sweep job per §VIII |

---

## Appendix — pre-flight before any code (CLAUDE.md)

- `npm run check:no-supabase` · `npm run typecheck` (note: repo typecheck script is hollow — validate changed files against the full-`tsc` baseline) · `npm run preflight`
- This spec authorizes the **MVP (§V)** only. Phase 2 (§X) requires a separate spec or an explicit Kelly directive.
