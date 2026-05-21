# Conversational Keep — iOS Capacitor Smoke Test Plan

**Phase**: 1.5B verification (before claim of done)

**Posture**: separate Capacitor smoke test — voice loop verification, not just visual render. Per [docs/specs/CONVERSATIONAL_KEEP_INTEGRATION.md](./CONVERSATIONAL_KEEP_INTEGRATION.md) §7, item 7.

**Governed by**:
- [docs/canon/THE_CLEARING.md](../canon/THE_CLEARING.md)
- [CLAUDE.md](../../CLAUDE.md) — iOS / Capacitor invariants

---

## Why this test is separate from existing infrastructure

The existing iOS test infrastructure verifies build / static-export / route inclusion. It does not specifically verify that **the voice loop remains intact** when a sidecar layer is added to the live conversation path.

The keep sidecar is non-blocking by design — but "non-blocking in theory" and "non-blocking on iOS in practice" are different claims. Capacitor's WebView, the streaming TTS pipeline, the cookie/header auth path, and the static-export exclusion list all interact in ways that have surprised this codebase before (per CLAUDE.md "known recurring traps"). This test plan exists to verify the sidecar doesn't subtly destabilize any of those.

---

## Pre-conditions

1. Migrations applied to local PostgreSQL:
   - `member_memory_atoms`
   - `member_lens_passes`
   - `member_keep_preferences`
2. Test member exists with valid `members.id`, `onboarded = true`.
3. iOS build path is clean: `scripts/capacitor-patch-routes.sh` runs without error.
4. Both feature flags configurable from `.env.production` and `.env.local`:
   - `CONVERSATIONAL_KEEP_ENABLED`
   - `NEXT_PUBLIC_CONVERSATIONAL_KEEP_ENABLED`
5. Test device or simulator with iOS 17+ and the MAIA Capacitor app installed via Xcode.

---

## Test matrix

Each scenario is run **twice** — once with flag OFF, once with flag ON — unless otherwise noted. The OFF runs are the regression baseline: the conversation must behave **identically to pre-1.5B**.

### Scenario 1 — Flag OFF baseline

**Setup**: both env flags set to `false`. Rebuild and reinstall iOS app.

**Steps**:
1. Open app. Sign in as test member.
2. Tap holoflower to activate voice.
3. Speak: *"Hello MAIA."*
4. Wait for MAIA's spoken reply + text bubble.
5. Speak: *"Tell me what you remember about me."*
6. Wait for reply.

**Pass criteria**:
- Voice loop completes both turns (mic → MAIA → audio plays → mic re-enables).
- No errors in Xcode console related to `conversational-keep`.
- No `KeepAffordance` rendered (does not exist when flag off).
- Message bubbles identical to pre-1.5B (no `keepIntent` field affecting display).
- `getValidMemberId` and `x-member-id` header continue to function (existing iOS auth path).

**Fail signals**:
- Any voice loop interruption.
- Any console error mentioning `psyche`, `keep`, or `conversational`.
- Visual change in message bubble layout.

---

### Scenario 2 — Flag ON, no salience signals

**Setup**: both env flags set to `true`. Rebuild and reinstall.

**Steps**:
1. Open app, sign in.
2. Voice: *"Hello MAIA."* — turn 1
3. Voice: *"How was your day?"* — turn 2 (off-topic, no salience)
4. Voice: *"What time is it?"* — turn 3 (no salience)
5. Voice: *"Tell me a story."* — turn 4 (no salience)

**Pass criteria**:
- Voice loop completes all 4 turns.
- No `KeepAffordance` renders (no salience signal triggered).
- No console errors.
- Server logs show keep sidecar ran (look for `[conv-keep]` log line) but no offer surfaced.

**Fail signals**:
- Affordance renders on a turn without a salience signal — that's a false positive in the scorer.
- Console error in keep pipeline.
- Voice loop stutter or stall.

---

### Scenario 3 — Flag ON, direct filing command (high confidence)

**Setup**: flags ON from Scenario 2.

**Steps**:
1. Voice / text input: *"I keep thinking about leaving my job."*
2. Voice / text input: *"Keep this for me."*

**Pass criteria**:
- After step 2, MAIA's normal reply appears.
- A persistent `Kept "Keep this for me."` (or similar) confirmation appears as a footnote beneath MAIA's response.
- The atom appears in `/maia/keep-capture` portfolio (open in browser or new tab to verify).
- Voice loop continues (mic re-enables after MAIA's reply).

**Fail signals**:
- No confirmation appears.
- Confirmation appears but atom not in portfolio.
- Voice loop fails to re-enable.
- Confirmation rendered as MAIA's prose (interpretation leak — must be the static affordance text).

---

### Scenario 4 — Flag ON, salience signal triggers offer

**Setup**: flags ON. Fresh conversation (≥3 turns deep to clear `minTurnsBeforeOffer`).

**Steps**:
1. Voice: *"Hello MAIA."* (turn 1)
2. Voice: *"I've been thinking about a lot."* (turn 2)
3. Voice: *"How does it work?"* (turn 3)
4. Voice: *"This is something I want to remember."* (turn 4 — explicit_remember signal)

**Pass criteria**:
- After turn 4, MAIA's reply appears.
- Beneath the reply, the affordance renders: `Keep this for me? [Keep] [Not now] [Stop asking]`.
- Tapping `[Keep]` morphs the affordance to a persistent `Kept "..."` note.
- The atom appears in portfolio.
- Subsequent turns do not surface another offer (cooldown active).

**Fail signals**:
- Affordance does not render.
- Affordance text contains interpretation (anything beyond the standard doorway phrasing).
- Tap on `[Keep]` does not register OR causes voice loop interruption.
- Multiple offers in immediate succession (cooldown broken).

---

### Scenario 5 — Flag ON, member says "Stop asking"

**Setup**: flags ON. Continue from Scenario 4 or start fresh.

**Steps**:
1. Trigger an offer (use salience phrase like Scenario 4).
2. Tap `[Stop asking]` on the affordance.
3. In subsequent turns, deliberately use salience phrases (*"this matters"*, *"I want to remember"*).

**Pass criteria**:
- After step 2, persistent confirmation: *"I'll stop offering. You can say 'ask again' when you want."*
- No further affordances appear in subsequent turns, even with salience triggers.
- `member_keep_preferences.offers_paused = true` in DB (verify via psql or admin tool).
- Voice loop unaffected.

**Fail signals**:
- Pause not honored in subsequent turns.
- DB state not updated.
- Voice loop interruption when pause is recorded.

---

### Scenario 6 — Flag ON, member says "you can ask again"

**Setup**: continuation of Scenario 5 (paused state).

**Steps**:
1. Voice / text: *"You can ask again."*
2. In subsequent turns, use salience phrases.

**Pass criteria**:
- DB state: `member_keep_preferences.offers_paused = false`.
- Affordances begin surfacing again on salience signals (after `minTurnsBeforeOffer` + `cooldownAfterOfferTurns` from the last offer, if any).
- Voice loop unaffected.

**Fail signals**:
- Pause not lifted.
- Offers surface immediately bypassing cooldown rules (rare; should only happen if `lastOfferTurnInSession` is unset).

---

### Scenario 7 — Chaos test: server-side keep error

**Setup**: flags ON. Temporarily break the keep sidecar (e.g., simulate DB failure by stopping the local postgres while keeping the app running, OR force a throw inside the sidecar try block during build).

**Steps**:
1. Voice / text: *"I want to remember this."* (salience signal)
2. Observe.

**Pass criteria**:
- MAIA's reply appears normally (text bubble + voice).
- Voice loop continues to next turn.
- No affordance renders for this turn.
- Server log shows `[conv-keep] sidecar error (non-fatal)` with the underlying error.
- No client-side error / crash / interruption.

**Fail signals**:
- MAIA's reply fails to render.
- Voice loop interruption.
- Visible error in WebView.

**This is the load-bearing chaos test for the non-blocking guarantee.**

---

### Scenario 8 — x-member-id header path verification

**Setup**: flags ON. iOS specifically (cookies don't cross-origin in WebView per CLAUDE.md).

**Steps**:
1. Trigger a keep flow (any scenario 3–6).
2. In Xcode network log, inspect requests to:
   - `/api/oracle/conversation` (existing)
   - `/api/psyche/conversational-keep/respond` (new)
3. Verify `x-member-id` header present on BOTH.

**Pass criteria**:
- Both requests carry `x-member-id`.
- Both succeed (200 / 201).
- DB writes verify the member is correctly identified.

**Fail signals**:
- 401 Unauthorized on respond endpoint.
- Header missing — indicates `apiFetch` wrapper is not being used for the affordance's `fetch()` call. (Note: the affordance uses raw `fetch()` with `credentials: 'include'` — this works on web cookies but iOS needs the header. **If this fails, the fix is to route the affordance's fetch through `apiFetch` from `@/lib/http/apiBase`.**)

**Important**: this scenario is the most likely place for an iOS-specific failure. Pay attention.

---

### Scenario 9 — Capacitor static export route verification

**Setup**: clean iOS build via `scripts/build-ios.sh`.

**Steps**:
1. Run the build script.
2. Verify in build output that the following routes are correctly classified:
   - `/api/psyche/conversational-keep/respond` — server-only (in EXCLUDED_DYNAMIC_ROUTES if `force-dynamic`)
   - `/api/psyche/portfolio/*` — server-only (same)
3. After install, verify the app does NOT attempt to load `/maia/keep-capture` as a static route during cold start.

**Pass criteria**:
- Build script completes without warnings about psyche routes.
- App cold-starts to `/maia` (existing behavior).
- `/maia/keep-capture` is reachable only by explicit navigation.

**Fail signals**:
- Build warning about static export incompatibility.
- App crash on cold start.
- `/maia/keep-capture` attempts to render in static-only mode.

---

### Scenario 10 — End-to-end iOS-only verification

**Setup**: flags ON. Real device or simulator, no DevTools shortcuts.

**Steps**:
1. Sign in fresh.
2. Have a 6-turn voice conversation.
3. Use *"I keep thinking about this"* in turn 4.
4. Accept the offer when it appears.
5. Use *"Stop asking"* in turn 6.
6. Force-quit and reopen the app.
7. Start a new conversation.
8. Use salience phrases for several turns.

**Pass criteria**:
- Step 4: affordance renders correctly on touch device.
- Step 4: `[Keep]` tap is responsive (no double-tap, no delay > 500ms).
- Step 5: pause confirmation appears.
- Steps 7–8: pause persists across session restart. No offers surface.

**Fail signals**:
- Any touch responsiveness issue specific to iOS (z-index, hit-target size, scroll containment).
- Pause does not persist (governor persistence failure).
- Visual glitch in WebView rendering.

---

## Pass/fail summary

**For Phase 1.5B to be considered "shipped" on iOS**, all 10 scenarios must pass.

If any scenario fails:
1. Document the failure (screenshot + Xcode console + server log).
2. Set `CONVERSATIONAL_KEEP_ENABLED=false` immediately to disable on production.
3. Open a defect with the failing scenario number.
4. Do not re-enable until the defect is resolved and the failing scenario re-tested.

**The flag is the rollback.** No code revert needed for fast disable.

---

## What this plan does NOT test

- Server unit tests for the parsers / scorer / governor (handled by 1.5E).
- Web browser smoke tests (mostly covered by the web path; iOS-specific concerns are this plan's focus).
- Long-running stability (multi-day sessions, sleep/wake cycles).
- Multi-user behavior (only single-member tested).
- Sanctuary Mode interaction (keep is structurally suppressed; out of 1.5B scope).
- Practitioner / shared-thread surfaces.

These are post-Phase-1 concerns or covered elsewhere.

---

## Apply order (per Kelly's decision)

1. ✓ Draft this iOS smoke test plan (this document)
2. ☐ Apply `app/api/oracle/conversation/route.ts` patch
3. ☐ Verify route build + types pass
4. ☐ Apply `components/OracleConversation.tsx` patch
5. ☐ Verify web conversation works (flag on + flag off)
6. ☐ Run iOS / Capacitor smoke path (this plan, scenarios 1–10)
