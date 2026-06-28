# Attention Substrate Generalization — Spec

- **Date**: 2026-06-06
- **Status**: PROPOSED · Designed-layer
- **Builds on**: `docs/specs/COLAB_ATTENTION_LAYER_SPEC_2026-06-06.md` (the lifecycle, boundary §0, and safeguards §VI carry forward unchanged)
- **Decision**: **B (universal substrate), A (Co-lab-only first surface)** — Kelly, 2026-06-06
- **Why now**: migration `20260606000002` is **unshipped, zero prod rows** — the cheapest possible moment to make `attention_items` source-agnostic. Ship the hard-FK version and B later costs a generalization migration + backfill; doing it now costs an edit.

> **Core doctrine: Universal attention substrate; Co-lab-only first surface.**
> The *table* becomes origin-agnostic now. The only *surface* that ships is Co-lab's For You. MAIA / Studio / unified-inbox surfaces are held until the Co-lab surface proves out (browser receipt + deploy) — we get the future path without prematurely building the universal inbox.

---

## §1 — What changes, what doesn't

**Changes (this spec):** the two Co-lab foreign keys become a polymorphic source. That's it at the data layer.

**Unchanged (carried from the parent spec):** the boundary (§0 — sender-declared loop, not engagement/ranking/surveillance), the lifecycle (`open → opened_at → resolved/declined`, opening ≠ closing), every safeguard S1–S5, decisions D1/D3/D5, and the §IX receipt semantics. Generalizing the *origin* must not touch the *meaning*.

---

## §2 — The generalized primitive

```sql
attention_items
  id              uuid pk
  recipient_id    uuid not null → members        -- universal (unchanged)
  created_by      uuid not null → members        -- universal, human author (S1)
  source_type     text not null                  -- WHERE it came from
  source_id       uuid not null                  -- the originating entity's id (NO db FK — polymorphic)
  source_context  jsonb not null default '{}'    -- denormalized display + link payload (see §4)
  kind            text not null                  -- the RELATION (see §5)
  status          text not null default 'open'   -- open | resolved | declined  (closure only)
  created_at      timestamptz not null default now()
  opened_at       timestamptz                    -- receipt, not closure
  resolved_at     timestamptz
```

**Removed:** `source_message_id` (FK team_messages), `source_channel_id` (FK team_channels).
**Added:** `source_type`, `source_id`, `source_context`.

Indexes:
- dedup unique: `(recipient_id, source_type, source_id, kind)` — generalizes the old `(recipient, message, kind)`.
- For You: `(recipient_id, status, created_at DESC)` (unchanged).
- digest hot-set: partial `WHERE status='open' AND opened_at IS NULL` (unchanged).
- sender display: `(source_type, source_id)` — replaces the old `(source_message_id)` index.

`recipient_id` and `created_by` stay hard FKs to `members` — `members` is universal, never polymorphic, always resolvable.

---

## §3 — Source registry / materializers (adapter pattern)

`source_type` is an open enum resolved by a **registry of adapters** — the same federation/adapter shape as the Direct Recall Resolver (`lib/memory/directRecall/*`). Each adapter owns how its origin builds and renders an attention item:

```ts
interface AttentionSourceAdapter {
  type: string;                                   // 'colab_message'
  buildContext(originEntity): AttentionContext;   // denormalize excerpt + deepLink at creation time
  liveResolve?(item): Promise<boolean>;           // does the source still exist? (for tombstoning the action)
  purgeFor?(sourceId): Promise<void>;             // source-delete hook (see §4 tombstone)
}
```

**Initial adapter (built):** `colab_message`.
**Planned source_types (Cat-1 HELD — named, not built):** `session_followup`, `practitioner_invite`, `journal_response`, `relationship_loop`, `team_summons`. Each is its own future spec — *naming them does not authorize building them.*

---

## §4 — `source_context` as display source-of-truth + tombstone model

The polymorphic `source_id` has **no FK**, so we lose the `ON DELETE CASCADE` the team_messages FK gave for free. We replace it deliberately:

1. **`source_context` is the display source-of-truth.** The For You list renders entirely from `source_context` (`excerpt`, `deepLink`, optional `title`) + a single `members` join for the author's name. It **never joins the origin table.** This both decouples the substrate *and* makes the list query faster than the current join-per-source version.

   Minimal contract every adapter must satisfy:
   ```json
   { "excerpt": "≤280 chars for the list", "deepLink": "/path to act on it", "...": "source-specific extras" }
   ```
   For `colab_message`: `{ excerpt, deepLink: "/team/<slug>", channelSlug, channelName }`.

2. **Tombstone when the source disappears.** Because display reads from context, an item still renders after its origin is deleted. The *action* degrades: `liveResolve()` false → the surface shows "source no longer available" and lets the recipient resolve/dismiss. No dangling join, no crash.

3. **Source-owned best-effort purge.** Each origin's hard-delete path calls `purgeAttentionForSource(type, id)` (e.g. Co-lab message delete → purge `colab_message` items). This restores the cascade behavior at the app layer.

4. **Optional GC sweep (later, with the digest worker):** remove closed items older than N days and open items whose `liveResolve` is missing past a grace window. Not in this spec's scope.

> Note: `excerpt` is denormalized → it can go stale if the source is edited. Acceptable for short-lived loops; the deep-link always resolves the live source for the actual content.

---

## §5 — `kind` (relation) vs `source_type` (origin) — kept distinct

Do not collapse these. `source_type` = *where it came from*; `kind` = *what relation it is to me*.

- `kind` (relation): `request · mention · assignment · thread_reply` (current) → expands with `invite · summons · followup · response` as sources land.
- A practitioner invite = `source_type='practitioner_invite'`, `kind='invite'`. A session follow-up = `source_type='session_followup'`, `kind='followup'`.

The deterministic For You ordering (S2) sorts by a `kind` priority map (request/invite/summons high; mention/reply low), then recency — never by a score.

---

## §6 — Surfaces & scoping

`listAttentionItems(recipientId, { sourceTypes?, kinds? })` — surfaces scope by passing filters.

- **Co-lab For You (the ONLY surface shipped now):** unscoped → shows all the member's open loops. Since `colab_message` is the only *source* today, this is colab-only in practice, with zero code change needed when other sources arrive.
- **MAIA glyph, Studio inbox, unified center:** HELD. Each is a scoped read over the same table — additive, no substrate change. Each requires its own surface spec + receipt before shipping.

---

## §7 — MAIA sovereignty constraint (LOCKED, Kelly)

**No red-badge engagement loop in MAIA.** Per-surface badge policy:

| Surface | Badge policy | Why |
|---|---|---|
| Co-lab, Studio | Count badge OK | Coordination contexts — directed attention is the job |
| **MAIA** | **No count, no red dot, no color-alarm, no auto-surfacing mid-reflection** | Reflection/continuity space — a Slack-style bell cuts against the 3rd Sovereignty Invariant (reduce psychological centrality) |

Any future MAIA attention surface must be **quiet, peripheral, opt-in** (revealed on intent, not pushed) and must pass its own Sovereignty Invariant check (increase agency? push life outward? reduce centrality?). A notification center is *exactly* the kind of thing that turns a reflective space into an engagement loop — the boundary binds hardest here. This is a surface rule; the substrate is neutral.

---

## §8 — Migration & code delta from the current (Co-lab) build

The current build (steps 1–4, uncommitted) becomes the colab adapter over the generalized substrate. **Lifecycle, route shape, ForYou UI, MessageBubble states, and the §IX receipt all stay** — only the source plumbing changes.

| File | Delta |
|---|---|
| `database/migrations/20260606000002_*.sql` | **Rewrite** (unshipped → safe): drop the two team FKs from the design; add `source_type`/`source_id`/`source_context` + regeneralized indexes. Re-apply to local dev (drop local table first — 0 rows). |
| `lib/team/attention.ts` | Add generic `createAttentionItem({recipientId, createdBy, sourceType, sourceId, sourceContext, kind})` + `purgeAttentionForSource(type,id)`. `createAttentionItemsForMessage` becomes a thin colab caller that builds `source_context` and delegates. `listAttentionItems` reads `source_context` (drop the team_* joins). `getSenderAttentionStates` keys by `(source_type,source_id)`. |
| `lib/team/attention/adapters/colabMessage.ts` (new) | The first `AttentionSourceAdapter` (buildContext / liveResolve / purgeFor). |
| `app/api/team/attention/route.ts` | Unchanged (operates on item ids + lifecycle). |
| `components/team/ForYou.tsx` | Read `excerpt` + `deepLink` from item (now context-derived) instead of `channelSlug`/`messageExcerpt` directly. |
| `components/team/MessageBubble.tsx`, messages GET route | Sender-state enrichment keys by `source_type='colab_message'` + `source_id IN (msgIds)`. Behavior identical. |
| Co-lab message delete path | Call `purgeAttentionForSource('colab_message', msgId)` (replaces the lost cascade). |

**Unchanged:** the route's open/resolve/decline/withdraw, S1–S5, D1/D3/D5, the chat-safety try/catch, the sidebar For You link.

---

## §9 — Out of scope / deferred

- Building **any non-colab adapter** (session/practitioner/journal/relationship) — Cat-1 held, each its own spec.
- Building **MAIA / Studio / unified-inbox surfaces** — held until Co-lab surface proves (browser receipt + deploy).
- **Digest worker (step 5)** — still held per Kelly, until the in-app loop proves.
- GC sweep — pairs with the digest worker, later.

---

## §10 — Revised receipt

The §IX HTTP receipt (parent spec) **re-runs against the generalized schema** with `source_type='colab_message'` and must still pass **11/11** (send→For You→open→Opened→resolve→Resolved, + D1/D5/S5/mention). Generalization is correct only if the Co-lab behavior is byte-for-byte preserved. Then: browser visual receipt → deploy gate (migration ordering + tsc-vs-baseline).
