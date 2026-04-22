# MAIA Decision/Change Recognition — Implementation Plan

**Status:** Implementation-ready. Design pass 2 complete (post-creation behavior, authorship, persistence revised).
**Date:** 2026-04-22 (design pass 2 same-day)

---

## Epistemic status (read first)

This plan proceeds on **design judgment + synthetic stress test**, not on empirical validation from a real transition-rich MAIA thread.

What is true:
- Spec logic has been stress-tested against synthetic input and is internally coherent.
- Restraint behavior is implicitly validated by one real 5-turn thread (spec would correctly have fired zero times).
- Signal classes, thresholds, naming templates, and cooldowns are defined and locked in conversation.

What is **not** yet true:
- No real MAIA thread has been scored where a decision commitment or X→Y shift clearly formed.
- The claim "current MAIA recognizes meaning but does not operationalize transitions" is a product prior, not empirical finding from this session.
- The necessity of the spec — whether reality requires it — remains untested.

Implementation behind a feature flag is appropriate because it preserves optionality. A single real-thread test with the flag active will be the true validation gate before rollout to members.

---

## 1. What exists now

### Oracle conversation route
- `app/api/oracle/conversation/route.ts`
- `ConversationBody` type at ~L365-376. Currently accepts: `userId`, `sessionId`, `message`, `conversationHistory`, `element`, `userName`, `relationshipContextId`, `askMode`.
- `extractConversationInsights()` at L265-363 — already detects patterns (realizations, emotional shifts, reframes, breakthroughs). Used for learning pipeline, not prompt injection.
- Fire-and-forget telemetry pattern established: `logMaiaTurn`, `logOpusAxiomsForTurn`, `logOracleUsage` — all non-blocking.

### Detection precedent
- `lib/consciousness/participatoryRealityHelper.ts`
- `detectThemes(text, currentElement?, minScore=1) → ThemeSignal[]` — pure function, language-marker scoring.
- `storeThemeSignal(memberId, signal, opts) → void` — fire-and-forget, swallows DB errors, never blocks.
- Backing table: `member_theme_signals` (migration 20260316000001). Structural metadata only, no session content.
- **This is the pattern to copy for Decision/Change recognition.**

### Ideas surface (member-side)
- Thread UI: `app/maia/ideas/[id]/page.tsx` (`IdeaWorkspacePage`).
- Block types currently supported: `note`, `decision`, `change`, `maia_reflection`.
- Append endpoint: `POST /api/ideas/[id]/blocks` accepts `block_type ∈ {note, decision, change}`.
- MAIA reflections written via `POST /api/ideas/[id]/ask-maia` as `maia_reflection` blocks.
- `maia_reflection` blocks render inline with Sparkles icon, muted amber accent (`BLOCK_STYLES['maia_reflection']`).
- **Recent cleanup:** user-facing "Convert to Decision / Shift" buttons removed from Ideas.

### Decision/Change backend
- **Studio-side** (practitioner): `studio_decisions`, `studio_changes` — rich models with council, hexagrams, iterations. Not directly applicable to member-side Ideas flow.
- **Member-side** (Ideas): no dedicated Decision/Change entity. Stored as rows in `member_idea_blocks` with `block_type` discriminator.
- **Gap:** commit `ae27968f1` ("allow note → decision/shift conversion via PATCH") is referenced in memory but not visible in this worktree. Likely exists on main — must be confirmed before implementation.

### Feature flags
- `lib/utils/feature-flags.ts` — interface + DEFAULT_FLAGS + `isFeatureEnabled()`.
- Precedent: `participatoryReality` flag (OFF by default, wiring pending).
- Adding a flag: add to interface, add to DEFAULT_FLAGS, check with `isFeatureEnabled()`.

---

## 2. What can be reused

| Need | Reuse |
|---|---|
| Detection module shape | `detectThemes` / `storeThemeSignal` pattern from `participatoryRealityHelper.ts` |
| Fire-and-forget writes | Same pattern — no await, errors swallowed, never blocks oracle |
| Feature flag | Existing flags file + `isFeatureEnabled()` convention |
| Block creation | `POST /api/ideas/[id]/blocks` with `block_type: 'decision' \| 'change'` already accepts these types |
| MAIA rendering | `maia_reflection` block rendering already exists; affordance slot attaches below response content |
| Decision/Change strip | Existing "last 2–3 decisions" strip at top of Ideas thread — reuse for the lightweight index |

**What must be added:**
1. Signal detection module (`lib/maia/decisionChangeRecognition.ts` or similar) — language-marker scoring for Decision/Change signals with medium/strong graduation.
2. Naming injection — MAIA's response must include the naming line when detection fires.
3. Invitation affordance — inline button below MAIA response, wired to existing block-create endpoint.
4. Recognition state tracking — cooldown, decline history, oscillation detection. Persistence strategy: new table `member_idea_maia_recognition_state` (thread_id, member_id, last_offered_at, declined_count, cooldown_until).
5. X → Y extraction — utility that returns `{ x, y } | null` where both must be near-verbatim substrings of user turns.
6. Post-creation behavior — MAIA's next-turn behavior after a Decision/Change is created (stabilize, not decompose).
7. Distinct card rendering for created Decision/Change in the thread (differentiate from reflection blocks).

---

## 3. Exact insertion points

### a) Detection + naming in oracle response
- **File:** `app/api/oracle/conversation/route.ts`
- **Insertion:** after response text is generated, before streaming/return. Detect signal against user's most recent message + last N turns. If signal is strong enough and restraint allows, prepend naming line to MAIA response and set `inviteAffordance: 'decision' | 'change' | null` on the response payload.
- **Why here:** mirrors the existing `extractConversationInsights` location and uses the same conversation history the route already has in scope.
- **Do not** modify the system prompt composition. Recognition is post-response analysis, not prompt-time steering.

### b) Recognition module
- **New file:** `lib/maia/decisionChangeRecognition.ts`
- **Exports:** `detectDecisionSignal(text, history)`, `detectChangeSignal(text, history)`, `extractXY(text)`, `selectNamingLine(signal, history)`, `checkRestraint(memberId, threadId, signal)`.
- Shape and fire-and-forget discipline mirrors `participatoryRealityHelper.ts`.

### c) Recognition event log (revised — append-only)
- **New migration:** `database/migrations/20260422XXXXXX_member_idea_recognition_events.sql`
- **Table:** `member_idea_recognition_events` (append-only; no mutation)
  - `id` BIGSERIAL
  - `thread_id` UUID (references member_ideas.id)
  - `member_id` UUID
  - `fired_at` TIMESTAMPTZ DEFAULT now()
  - `event_type` TEXT CHECK IN (`naming_fired`, `invitation_offered`, `invitation_accepted`, `invitation_declined`, `invitation_ignored`)
  - `signal_kind` TEXT CHECK IN (`decision`, `change`)
  - `signal_strength` TEXT CHECK IN (`medium`, `strong`)
  - `meta` JSONB (X/Y snippets, block_id on accept, turn_index)
  - Index on (thread_id, fired_at DESC)
- **Why append-only:** no race conditions, no mutation bugs, full audit trail, telemetry-friendly.
- **Query patterns:**
  - Cooldown: `max(fired_at) where thread_id = X and event_type = 'naming_fired'` vs 2-turn threshold
  - Decline count: `count where thread_id = X and event_type in ('invitation_declined','invitation_ignored')`
  - Oscillation: read last 2-3 events, compare signal_kind
  - Quiet zone: `max(fired_at) where event_type = 'invitation_accepted'` vs 3-turn threshold

### d) Block creation path
- **Existing:** `POST /api/ideas/[id]/blocks` with `block_type: 'decision' | 'change'`.
- **Confirm:** presence of PATCH convert endpoint (`ae27968f1`) on main. If present, reuse. If not, the existing POST is sufficient for MAIA-initiated creation since we're not converting an existing note, we're creating a new block from the MAIA-recognized moment.
- **Payload additions needed:** `origin: 'maia_recognition'`, `recognition_strength: 'medium' | 'strong'`, `xy?: { x: string, y: string }` (for changes with clean extraction). These are metadata only; may sit in a `meta` JSONB column or be added as columns.

### e) Inline affordance rendering
- **File:** `app/maia/ideas/[id]/page.tsx`
- **Location:** sibling to existing `maia_reflection` block rendering.
- **Behavior:** if the `maia_reflection` block carries `invite: 'decision' | 'change'` metadata, render an inline button ("Save as Decision" / "Mark as Change") below the response text.
- **On click:** POST to `/api/ideas/[id]/blocks` with block_type + recognition metadata; render the returned block as a distinct card (border/icon/spacing differ from reflection blocks).
- **On dismiss/ignore:** fire-and-forget increment to `declined_count` in recognition state table.

### f) Feature flag
- **File:** `lib/utils/feature-flags.ts`
- **Flag name:** `maiaIdeasDecisionRecognition` (or similar — confirm naming convention).
- **Default:** `false`.
- **Gate:** all detection, naming, invitation, and state writes behind this flag. Flag off → current behavior unchanged.

### g) Authorship invariants (design pass 2)
These are hard constraints on any code touching Decision/Change creation:

1. **Creation requires explicit member click.** No auto-create, no delayed create, no deferred save. The POST to the blocks endpoint originates from a user interaction, not from a server-side background job.
2. **`author_id` = member_id on created blocks.** Metadata may include `origin: 'maia_recognition'` and `recognition_strength` for provenance, but these are tags, not authorship claims.
3. **Card content is the member's words.** The created block's body is extracted from the member's recent turns (see §3h below). MAIA's naming line ("This is taking the shape of a decision") never becomes the block body.
4. **Button copy names the member's action:** "Save as Decision" / "Mark as Change." Never passive constructions implying MAIA's authorship.
5. **Decline is first-class.** Ignoring the affordance is a valid member action; the system treats ignore = decline for state purposes after 2 turns without engagement.
6. **No duplicate objects in the same semantic window.** If a user rephrases a decision within the cooldown window, the system does not create multiple Decisions. Enforced via event log: if `invitation_accepted` for the same `signal_kind` fired in the last N turns (N = cooldown length), further naming is suppressed for that kind.
7. **Sanctuary mode absolute gate.** If the session is in Sanctuary mode, detection does not run, events are not logged, invitations do not appear. Full no-op. This is a hard precondition at the top of the detection module.

### h) Card content extraction (v1 spec)
When a member accepts a Decision or Change invitation, the block body is extracted as follows:

**Decision:**
- Take the most recent sentence from the member containing the strongest commitment signal
- Preferred patterns: "I'm going to…", "This is what I want to…", "I've decided…", "I'll…"
- Fallback: the member's last complete turn
- No summarization, no rewriting, no MAIA paraphrase

**Change:**
- If X → Y extraction succeeded (both sides near-verbatim from user text), store `x_text`, `y_text` as separate fields; body is the member's turn that contained both
- If only one side is extractable, store full turn as body with `x_text` or `y_text` as available
- Fallback: last user turn, no X/Y fields

If extraction produces an empty string or fails for any reason, fall back to the last user turn verbatim. Never fabricate content.

### i) Quiet zone specification (design pass 2)
After a Decision or Change is created, a **quiet zone** of 3 turns activates for that thread. During the quiet zone:

- **Suppressed:** naming (any strength), invitation (either kind), questions that re-open the created object ("is this really what you want?", "have you considered…?")
- **Allowed:** normal conversation, engagement with adjacent material, integration questions *only if raised by the member first*

For Change specifically:
- MAIA tracks forward with Y (the new position) in its own framing
- MAIA does not police reversion if the member returns to X — members are free to change their mind
- MAIA does not flag "you said earlier…" patterns

Quiet zone length K = 3 turns is a starting value. Real-thread observation will tell us if it's too short, too long, or right.

---

## 4. Recommended implementation sequence

Each step minimal and reversible. Flag stays off until final verification step.

1. **Migration + flag** — Create recognition state table; add feature flag (off). Verify migration registered.
2. **Detection module** — Pure function layer in `lib/maia/decisionChangeRecognition.ts` with unit tests against the locked signal definitions. No route wiring yet.
3. **State persistence** — `loadRecognitionState(threadId, memberId)` + `upsertRecognitionState(...)` fire-and-forget helpers. Unit tests.
4. **Oracle route wiring** — Post-response detection + naming line injection + `invite` metadata on returned block. Flag-gated. No UI changes yet.
5. **UI affordance** — Inline button below MAIA blocks carrying `invite` metadata. Flag-gated on client.
6. **Distinct card rendering** — Styling for Decision/Change blocks created via MAIA recognition.
7. **Post-creation behavior** — MAIA's next-turn stabilization rule (see §5 open question).
8. **Real-thread test with flag on** — the actual validation gate. One natural transition-rich thread, score actual behavior.
9. **Decide: keep, tune thresholds, or remove.**

---

## 5. Risks & open questions

### Real-thread validation gap
The spec has not met real production data yet. Risks:
- Detection may fire in contexts we haven't anticipated (common idioms, quoted speech, hypothetical language).
- X → Y extraction may produce cringeworthy quotes when user phrasing is messy.
- Naming lines may feel templated on repeat.
- **Mitigation:** flag-gated rollout; first test is Kelly-facing, not member-facing; willingness to tune or abandon based on real output.

### Post-creation behavior — RESOLVED (design pass 2)
**Rule:** silence on the creation turn. The act of clicking is the closure. MAIA does not respond to the creation event itself. The next member message starts a new turn as normal, but the quiet zone (§3i) is active for 3 turns to prevent destabilization of the created object.

This preserves authorship: the click closes the moment, not MAIA's acknowledgment.

### PATCH convert endpoint ambiguity
Commit `ae27968f1` is referenced in memory as adding note → decision/shift conversion via PATCH, but the endpoint is not visible in this worktree. Must be confirmed on main before implementation. If absent, POST-with-metadata is sufficient for MAIA-initiated creation.

### Studio vs member-side Decision/Change model
`studio_decisions` and `studio_changes` are rich, practitioner-facing. Member-side Ideas stores decisions/changes as `member_idea_blocks` rows. The spec does not require member-side to adopt the studio schema — keeping them separate is correct. But if later work wants member-side Decisions to travel into studio council workflow, a bridge table will be needed. Out of scope for this plan; flagging for future awareness.

### Predictive-pattern risk
If medium-level naming ("starting to settle into a direction") fires too often, members learn the invitation is coming. This erodes the recognition vs invitation separation the spec preserves. The cooldown and frequency targets (< 1 naming per 3–5 reflections, 2-turn cooldown) exist to prevent this but must be enforced strictly in the detection module — not added as an afterthought.

### Sovereignty invariant check — RESOLVED (design pass 2)
- **Does this increase user agency?** Yes — members opt in to formalize; no auto-conversion.
- **Does this push life outward into the world?** Yes — formless reflections become named objects the member can revisit and act on.
- **Does this reduce MAIA's psychological centrality over time?** **Yes**, via the silence-on-creation + quiet zone + member-authored-card rules. MAIA recognizes and offers, the member closes and authors. MAIA stays peripheral to the object's existence once created.

### Sanctuary mode interaction
If Sanctuary mode is active, detection does not run. No events logged, no invitations appear, no block metadata written. This is a hard precondition at the top of the detection module. Covered by §3g.7 but named here because Sanctuary is an absolute boundary per project canon.

---

## 6. Minimal feature-flagged rollout plan

1. All code flag-gated behind `maiaIdeasDecisionRecognition` (default off).
2. Migration applied and registered.
3. Typecheck + unit tests pass.
4. Flag flipped on for a single internal account (Kelly).
5. Run one natural transition-rich thread. Score actual MAIA behavior against spec.
6. If clean: broaden to small beta cohort. If drift: tune thresholds (not templates). If wrong problem: revert and revisit.
7. No flag flip to members until post-creation behavior is designed and verified.

---

## 7. What this plan does not do

- Does not write any code.
- Does not claim real-thread validation where none exists.
- Does not lock the post-creation behavior — that is a separate design pass.
- Does not touch studio-side Decision/Change tables or practitioner workflows.
- Does not modify the oracle system prompt — recognition is post-response analysis only.

---

## Next step

Implementation behind feature flag. Sequence:
1. Feature flag added (default off)
2. Migration for `member_idea_recognition_events`
3. Detection module (pure functions, unit-testable) — includes Sanctuary gate, quiet-zone check, extraction helper
4. **Pause for review** before oracle route wiring
5. Oracle route wiring (flag-gated)
6. UI affordance + distinct card rendering (flag-gated)
7. Typecheck + tests
8. Real-thread test with flag on (Kelly account first)
9. Decide: keep, tune thresholds, or revert

## What remains unresolved

- **PATCH convert endpoint confirmation** — need to check main branch for commit `ae27968f1`. Non-blocking for implementation since POST path suffices for MAIA-initiated creation.
- **K = 3 as quiet zone length** — starting value, will tune from real-thread observation.
- **Naming convention for feature flag** — `maiaIdeasDecisionRecognition` proposed; confirm against existing flag naming patterns on first edit.
