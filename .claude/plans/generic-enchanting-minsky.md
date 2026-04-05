# Ideas Panel: Interactive Incubation Field

## Context

The Ideas panel currently shows captured ideas as passive read-only cards. Kelly wants it to become an **interactive workspace** where ideas can be manually entered, developed through stages, saved for continued processing, and supported by MAIA along the way. The DB schema already has everything needed — status lifecycle (`raw → developed → shipped → archived`), engagement tracking (`edit_count`, `total_time_spent`), and event logging (`creative_attempt_events`) — but none of it is wired to the UI.

## What changes

### 1. IdeasPanel.tsx — Rewrite as interactive incubation field
**File:** `components/maia/panels/IdeasPanel.tsx`

**Add:**
- **Manual input field** at the top — textarea to type new ideas directly (not just from conversation capture). Submit saves via `POST /api/ideas/capture` with `source: 'manual'`, `capture_mode: 'manual'`
- **Expandable idea cards** — click a card to expand it into an editable view:
  - Edit title and description inline
  - Status progression chips: `seed → developing → ready → actualized` (maps to DB: `raw → developed → shipped → archived`)
  - "Add a note" field — appends timestamped notes to `content_text`
  - "Ask MAIA" button — sends the idea as context into the conversation (via a callback prop to OracleConversation)
- **Status filtering** — toggle to filter by stage (all / active / actualized)
- **Visual lifecycle** — each card shows a small dot or indicator for its stage, color-coded

**UI language (Kelly's voice, to be reviewed by her):**
- Input placeholder: *"What's forming?"*
- Stages: Seed / Developing / Ready / Actualized
- Empty state: *"Ideas will gather here as they emerge"* (keep existing)

### 2. Individual idea API — PATCH for updates
**New file:** `app/api/ideas/[id]/route.ts`

- `PATCH /api/ideas/:id` — update title, description (content_text), status
  - Auth: session-based, must own the idea
  - Increments `edit_count` on each update
  - Logs event to `creative_attempt_events` (type: 'edit')
- `DELETE /api/ideas/:id` — soft archive (set status='archived'), not hard delete

### 3. "Ask MAIA" integration — Pre-fill as continuation
**File:** `components/maia/panels/IdeasPanel.tsx` + `components/maia/MaiaRightPanelHost.tsx`

- Add `onAskMaia?: (ideaText: string) => void` callback prop to IdeasPanel
- Thread it from MaiaRightPanelHost ← MaiaShell ← OracleConversation
- When clicked, pre-fills the main conversation input with natural continuation framing:
  ```
  I'd like to explore this more...
  [idea text]
  ```
- Cursor active, text fully editable — the member can reshape before speaking
- **Never auto-sends.** Never locks the text. It should feel like the idea is now alive in the conversation, not like a command was issued.
- **Sovereignty:** The idea enters MAIA's main field of meaning (not a side-thread). This preserves continuity, memory, and the guide invocation model. MAIA reflects and supports — never takes ownership.
- **Phase 2 (later):** Inline mini-chat for quick probing, with "Continue in MAIA" to elevate. Not now.

### 4. Manual capture endpoint update
**File:** `app/api/ideas/capture/route.ts`

- Already supports manual capture — just ensure `source: 'manual'` and `capture_mode: 'manual'` are accepted (they are, but currently hardcoded to `'conversation'` and `'heuristic_confirmed'`). Fix to accept from body.

## Files to modify
1. `components/maia/panels/IdeasPanel.tsx` — major rewrite (interactive field)
2. `app/api/ideas/[id]/route.ts` — new (PATCH/DELETE for individual ideas)
3. `app/api/ideas/capture/route.ts` — minor fix (accept source/capture_mode from body)
4. `components/maia/MaiaRightPanelHost.tsx` — thread onAskMaia callback

## Files NOT to modify
- Database schema — `creative_attempts` already has all needed columns
- `lib/consciousness/ideaDetection.ts` — heuristic detection is separate and working
- Oracle conversation route — no changes needed there

## What this does NOT do (scope boundary)
- No AI-generated idea expansion (MAIA doesn't auto-develop ideas — member drives)
- No complex Kanban/board UI — this stays a sidebar panel, not a project manager
- No new database tables or migrations

## Verification
1. Open Ideas panel (lightbulb icon in left rail)
2. Type an idea in the input field → should save and appear as a card
3. Click a card → should expand with editable title, description, stage chips
4. Change status to "Developing" → should persist on refresh
5. Click "Ask MAIA" → idea text should appear in conversation input
6. Check DB: `SELECT status, edit_count FROM creative_attempts WHERE type='idea'` — should reflect updates
