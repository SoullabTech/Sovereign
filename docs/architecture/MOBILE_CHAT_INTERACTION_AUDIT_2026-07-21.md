# Mobile Chat Interaction Audit — MAIA Conversation on iOS

**Date:** 2026-07-21
**Status:** Authority document for the **AIN OS — Sovereign Mobile Conversation Contract (SMCC)** initiative (working branch `fix/ios-conversation-contract`). Investigate-complete; no implementation applied.
**Elevation (Kelly, 2026-07-21):** this is not a one-surface fix — it is AIN OS infrastructure. The recovered contract becomes a reusable capability every conversational surface (Now What?, Practitioner Portal, Soullab, native app, future AIN experiences) inherits. Sequence: **prove on MAIA → codify in AIN OS → inherit everywhere.**
**Method:** Five parallel read-only investigators over the clean production baseline (`a3457a39f`), with local experimental patches stashed (`stash@{0}`) so the audit reflects shipped code, not this session's attempts.

> **Governing standard (constitutional):** The mobile contract is not satisfied when the interface merely renders; it is satisfied when **touch, keyboard, focus, text composition, viewport movement, scrolling, and response growth remain one continuous interaction.**
>
> **Reference environment:** iOS Safari. iOS Chrome and Android Chrome must remain sound; desktop must not regress.

---

## 0. The decisive question, answered

> *At what point did the interaction cease to be continuous — and was that continuity previously intentional, incidental, or absent?*

- **When:** commit **`046ec02c7`** (2026-04-02, *"MAIA spatial shell — talk-first architecture"*) — the AIN Engine → AIN OS shell migration. Enabled by default (`db0094d14`, `b0db53bdd`; flag `spatialMaiaShell: true` at `lib/utils/feature-flags.ts:52`, force-migrated `:77-81`).
- **Was it intentional, incidental, or absent?** **Incidental.** The old surface never had explicit keyboard code (`visualViewport` has *never* appeared in `OracleConversation.tsx` — confirmed by `git log -S`). Continuity was a free byproduct of a **definite-height `h-screen flex flex-col` container with a single bounded scroll owner.** The migration kept the conversation logic and dropped that container.

**Therefore the remedy is not "add the keyboard code the old build had" (it had none). It is: restore the structural contract the old geometry provided *for free*, remove the latent input faults it happened to mask, and redesign scroll + geometry to a deliberately higher iOS-first standard.**

---

## 1. Phase 0 baseline (facts of record)

| Item | Value |
|---|---|
| Current production commit | **`a3457a39f`** (2026-07-21, Merge #672 reflection-beta-v0) |
| AIN OS migration boundary | **`046ec02c7`** (2026-04-02) |
| Last known-good "AIN Engine" state | **`046ec02c7^`** |
| Default-on flip | `db0094d14`, `b0db53bdd` (`spatialMaiaShell`) |
| Working branch to create | `fix/ios-conversation-contract` |
| Stashed experimental patches (do **not** apply) | `stash@{0}` — 3 fixes across `OracleConversation.tsx`, `ModernTextInput.tsx` |
| History caveat | repo squashed at `d0a99cabc` (2025-11-23); pre-Nov lineage not visible |

**Surface / shell stack:** `/maia` → `app/maia/page.tsx` → (flag on) `MaiaShell` → `MaiaCenterField` → `OracleConversation`. Composer = `ModernTextInput`. Global CSS: `app/globals.css`, `app/styles/mobile-fixes.css`.

---

## 2. Old vs New shell

**OLD — `046ec02c7^:app/maia/page.tsx` (≈:657):**
```
<div class="h-screen overflow-hidden flex flex-col">   ← definite viewport height
  └─ chat region: flex-1 flex overflow-hidden          ← ONE bounded scroll owner
     └─ OracleConversation (sized against a real height)
```
Definite height → single bounded scroll region → composer contained → Safari scrolls the focused input into view naturally. Keyboard-safe **by geometry**.

**NEW — `app/maia/page.tsx:703-729` + shell:**
```
MaiaShell root  min-h-screen                    (MaiaShell.tsx:224)
  └─ <main class="ml-14 mt-12 transition-all">  NO HEIGHT   (MaiaShell.tsx:254)
     └─ MaiaCenterField h-full overflow-hidden flex flex-col (MaiaCenterField.tsx:87)  ← h-full ⇒ unresolvable
        └─ OracleConversation  min-h-screen overflow-hidden  (OracleConversation.tsx:6862)
           ├─ message pane  fixed  height:calc(100vh - 300px)  (:8036-8049)
           └─ composer      fixed  bottom:calc(2.5rem + env(safe-area-inset-bottom))  (:8515)
```
`h-full` resolves against an auto-height `<main>` → **no definite height; the document grows and scrolls.** Composer is viewport-`fixed` and the pane is `100vh` — neither tracks the visual viewport when the iOS keyboard opens.

Viewport export (`app/layout.tsx:63-74`): `viewportFit:"cover"`, `maximumScale:1.2`, `userScalable:true`, **no `interactiveWidget`**.

---

## 3. Root cause (one sentence)

**The spatial-shell migration replaced a definite-height, viewport-owning `h-screen flex flex-col` container with a `min-h-screen` shell whose margin-offset `<main>` leaves `h-full` unresolvable — dissolving the single bounded scroll owner — so on iOS Safari the layout viewport stays at full `100vh` while the visual viewport shrinks under the keyboard, and the unchanged `position:fixed` composer + `calc(100vh - 300px)` math cannot follow it.** Everything users see (page-jump, half-hidden panel, answer below the fold, flaky one-tap focus) is downstream of this, amplified by two pre-existing input faults and a very high render cadence.

---

## 4. Findings — classified

Each finding: **Observed failure · Technical mechanism · Category · Historical evidence · Confidence · Remedy type · Verification.**
Categories per the agreed rule: **Regression** (worked before, lost) · **Latent defect** (fault pre-existed, old shell concealed it) · **Patch-induced degradation** (*requires* a demonstrable before/after tied to a committed fix).

### F1 — Page jumps; message panel half-hidden; answer below the fold
- **Mechanism:** lost definite-height chain → unresolvable `h-full` → document scroll; `fixed` composer + `100vh` pane can't track the visual viewport (`MaiaShell.tsx:254`, `MaiaCenterField.tsx:87`, `OracleConversation.tsx:6862,8036-8049,8515`).
- **Category:** **Regression.** **Evidence:** definite-height container present at `046ec02c7^`, removed at `046ec02c7`. **Confidence:** High.
- **Remedy:** **Restore** (definite-height chain *inside* the spatial shell). **Verify:** keyboard-lifecycle device test — no jump on open/close/reopen/rotate.

### F2 — Keyboard needs multiple taps to open
- **Mechanism:** non-gesture programmatic focus (`ModernTextInput.tsx:472` `autoFocus`; parent `setTimeout(...focus(),100)` `OracleConversation.tsx:3493-3504`) sets `activeElement` without raising the iOS keyboard; the `document.activeElement` guard (`:3496`) then treats the field as ready, so the reopening tap is swallowed until a blur+refocus.
- **Category:** **Latent defect** (autofocus never opens the iOS keyboard in *any* shell; focus model unchanged across the migration). **Confidence:** High (mechanism); Medium on why now more visible.
- **Remedy:** **Remove** non-gesture autofocus on touch (tap-only). **Verify:** one-tap-opens-keyboard device test.

### F3 — Keyboard disappears while typing
- **Mechanism:** **dual source of truth** — `ModernTextInput` keeps internal `value` state (`:84`, `<textarea value={value}>` `:459`) reconciled from props by an effect whose deps include `value` itself (`:184-189`); a lagged parent frame writes stale `draftMessage` back into the controlled textarea mid-keystroke, aborting WebKit composition. Amplified because the component is **not `React.memo`** (`:53`) under a parent that re-renders on every streamed word and every 60fps amplitude tick.
- **Category:** **Latent defect** (fault lives in `ModernTextInput`, shell-independent; also the most likely reason the failure now reaches **Chrome** — a state-sequence exposure, *not* proven patch-induced). **Confidence:** High.
- **Remedy:** **Remove** the reconciliation loop → one authoritative value. **Verify:** 60s continuous typing during a streamed reply; autocorrect/predictive/emoji/paste/multiline/compose.

### F4 — Answer doesn't scroll up; view chases an off-screen bottom
- **Mechanism:** auto-scroll effect fires `messagesEndRef.scrollIntoView({behavior:'smooth'})` on every `messages` change (`:3268-3270`); streaming appends **per word** via `setMessages` (`:3949-3953`), so smooth scroll re-triggers 5–15×/reply and never settles; and the target sits inside a `100vh` region whose bottom is below the usable iOS viewport (ties to F1). Single scroll owner confirmed (`:8057`) — **no nested-scroll conflict**; this is geometry + timing.
- **Category:** **Latent defect** (scroll-chasing) **compounded by Regression** (geometry). **Confidence:** Medium-High.
- **Remedy:** **Redesign** — deterministic scroll policy (`PINNED_TO_LATEST` / `USER_SCROLLED_AWAY` / `RETURNING_TO_LATEST`) using container measurements, not per-token `scrollIntoView`; + Restore geometry. **Verify:** long-response readability + user-scroll-authority tests.

### F5 — Monolith render pressure
- **Mechanism:** `OracleConversation.tsx` = **9,407 lines, 72 `useState`, 52 `useEffect`, 0 `useMemo`, 0 `React.memo`**; voice amplitude fires ~3 setStates/frame at 60fps (`:1601-1602,1685,2068-2069,3274`); composer is un-memoized in-tree.
- **Category:** **Amplifier, not first cause.** React preserves a stable `<textarea>`'s focus across pure re-renders; no `key`/conditional above the composer is driven by high-frequency state. The monolith produces lag/jank and makes the discrete faults harsher and harder to reason about — it does **not** by itself eject the keyboard. **Confidence:** High.
- **Remedy:** **Redesign** (isolate the interaction-critical subtree; amplitude → refs/CSS var) — **last**, after correctness. **Verify:** typing responsiveness during voice animation in a 100+ message session.

### F6 — (Secondary risk) Double conversation mount on sub-rooms
- **Mechanism:** `MaiaPresence` is globally mounted (`bb4e3ceb3`, 2026-07-17) and suppressed by **exact-match** only (`lib/maia/presence/place.ts:69` `FULL_CONVERSATION_ROUTES`; gate `MaiaPresence.tsx:145`). `/maia` is safe; **`/maia/ideas`, `/maia/moments` are not** — they can mount a second `OracleConversation`.
- **Category:** **Latent defect / introduced risk** (specific commit, but not the `/maia` cause). **Confidence:** Medium (needs device confirmation). **Remedy:** **Remove/fix** suppression to cover sub-rooms. **Verify:** confirm single instance on sub-rooms.

### Patch-induced degradation — **none proven**
Per the agreed bar (a demonstrable before/after regression tied to a committed fix), **no finding qualifies.** `141bdeda9` (*"lift message container above composer footprint"*) is a **compensation layered on the post-migration geometry**, not proven to have worsened behavior. This session's stashed patches **never shipped** and cannot be causal. Chrome instability is classified **latent-exposed-under-load** (F3), not patch-induced. The category stays empty until earned.

---

## 5. Restoration plan — ordered dependency chain

Order is a hard dependency: measuring keyboard geometry before the textarea/focus lifecycle is stable yields false readings. **One phase, verified on a real iPhone, before the next.**

`input ownership → focus semantics → render isolation → viewport geometry → scroll policy → performance reduction`

**Discipline — do NOT jump to geometry first.** Geometry (F1) is the most *visually* painful failure and the biggest *visible* win (~70–80% of the chaos), which makes it the tempting first move. Resist it. **F3 (dual-source input) is the most likely reason the failure now reaches Chrome** — it is causal, not cosmetic. Fixing geometry before the input/focus lifecycle is stable produces **false positives**: a surface that *looks* recovered while the keyboard still drops intermittently, now harder to attribute against a cleaner-looking layout. Correctness order, not visible-impact order.

- **Phase 0 — Baseline.** Record commits (§1), create `fix/ios-conversation-contract`, keep `stash@{0}` unapplied, land this doc, capture baseline recordings on iPhone Safari / iPhone Chrome / desktop Safari / desktop Chrome.
- **Phase 1 — Input ownership (Remove).** Collapse `ModernTextInput` to one authoritative value; delete the self-reconciling effect (F3). Tests: rapid type, delete, selection-replace, autocorrect, predictive, emoji, paste, multiline, composition events. Draft must survive while MAIA responds.
- **Phase 2 — Focus semantics (Remove).** No non-gesture focus on touch; keyboard begins only from a real tap (F2). Desktop may keep intentional autofocus. Processing/responding transitions must not refocus. Voice→text returns in one tap.
- **Phase 3 — Render isolation (Redesign, minimal).** Extract/memoize the composer subtree so streaming words and amplitude ticks don't traverse it (F5, interaction-critical slice only). Stable textarea node; streaming a reply must not alter keyboard/focus.
- **Phase 4 — Viewport geometry (Restore first, then enhance).** **Highest-leverage single change:** give the shell a definite-height chain so `MaiaCenterField`'s `h-full` resolves — make `MaiaShell` root `h-dvh` and its `<main>` a `flex-1 min-h-0` child (`MaiaShell.tsx:224,254`); bound the message list as `flex-1 min-h-0 overflow-y-auto`; retire the `calc(100vh - 300px)` pane math and the viewport-`fixed` composer in favor of an in-flow/sticky bottom child of the definite column. Add `interactiveWidget:'resizes-content'` + move shell `100vh`→`100dvh`. A `visualViewport` controller (mirroring the working `app/journey/page.tsx:121-146` pattern) is the **fallback** only if residual gaps remain on device — not the first tool. Formally retire orphaned CSS: `.with-keyboard`, `.keyboard-visible .input-area`, `.input-area`, `.mobile-container`. One viewport source of truth; no duplicate CSS+JS keyboard systems.
- **Phase 4b — iOS Excellence Layer (Redesign — only after geometry is verified on device).** Raise the recovered surface toward native-app parity. Additive polish owned here: **spring-based keyboard transitions** (no sudden jumps); **touch ergonomics** (tap targets, thumb zones, dynamic composer growth); **predictive-keyboard support** (autocorrect, dictation, emoji, swipe typing); **resilience to Safari chrome changes** (toolbar collapse, address-bar movement). Its scroll-quality and performance targets are delivered by Phases 5–6; 4b sets the bar they meet. **Acceptance standard: a user should not be able to tell whether MAIA is native or web.**
- **Phase 5 — Scroll policy (Redesign).** Deterministic controller with the three explicit states (F4); pin-unless-user-scrolled-away; quiet "latest" affordance; keyboard-open must not read as user scroll; respect reduced-motion.
- **Phase 6 — Render pressure (Redesign, last).** Amplitude out of top-level state → refs / animation-local / isolated visualizer; memoize message bubbles; no full-tree rebuild per streamed word. No user-visible behavior change.

---

## 6. Device acceptance tests (definition of done)

**Not** satisfied by typecheck, automated tests, desktop preview, or Chromium emulation. **Authority = continuous interaction on a real iPhone.**

- **Keyboard & focus:** enter text mode → one tap opens keyboard → type continuously 60s (keyboard stays, no text loss/revert, autocorrect works) → send → one tap to start next.
- **Response growth:** long reply, keyboard open → reply readable above keyboard → viewport follows while pinned → no jump/oscillation.
- **User-scroll authority:** scroll up mid-reply → auto-scroll stops → "latest" affordance appears → one action returns to bottom.
- **Keyboard lifecycle:** open/close/reopen; voice→text→voice→text; rotate P→L→P; background & restore Safari → no stale inset, blank region, or displaced composer.
- **Long-session stability:** 100+ messages, streamed reply, typing during voice animation → responsive typing, stable scroll.
- **Cross-browser:** iOS Safari (current), iOS Chrome (current), desktop Safari, desktop Chrome, one Android Chrome device.

---

## 7. Instrumentation (dev-only; never shown to members)

Optional diagnostic overlay / structured console trace, enable-able during device testing, exposing: active element · inferred keyboard open/closed · `visualViewport` dimensions · composer bounding rect · scroll container height & position · pinned/unpinned state · textarea mount identity · composition start/end · focus/blur causes.

---

## 8. Completion evidence (required to call it done)

1. Root causes fixed (mapped to F1–F6). 2. Files changed. 3. Tests added. 4. Before/after interaction diagrams. 5. Real-device test matrix. 6. Screen recordings: one-tap keyboard · uninterrupted typing · long streamed reply · scroll-away-and-return · keyboard close/reopen. 7. Performance before/after. 8. Remaining limitations, stated plainly.

---

## 9. Strategic framing — AIN OS Sovereign Mobile Conversation Contract (SMCC)

The recovered contract becomes **AIN OS infrastructure**, not a one-surface fix. Every conversational surface — Now What?, Practitioner Portal, Soullab, the native app, future AIN experiences — inherits it, and none ever re-discovers keyboard geometry, viewport behavior, focus semantics, scroll policy, or composer lifecycle again.

**Sequence (doctrine-aligned):** **prove on MAIA → codify in AIN OS → inherit everywhere.**
```
proof → recognition → extraction → capability
```
NOT `framework → implementation → exceptions → patches`. We earn the module by making *this* surface excellent on a real iPhone first; the abstraction is lifted from proven code, never designed ahead of it.

**Eventual SMCC modules** (extraction targets, *not* build-first artifacts): `ViewportController` · `ComposerController` · `FocusController` · `ScrollController` · `KeyboardController` · `ConversationLifecycle`. Unlike the original AIN Engine behavior — which was *accidentally* inherited from sound geometry — the SMCC will be **intentional, observable, testable, and reusable.**

**Initiative-level acceptance standard:** a user should not be able to tell whether MAIA is native or web.

---

## Appendix — evidence index

- **Migration:** `046ec02c7`; defaults `db0094d14`,`b0db53bdd`; flag `lib/utils/feature-flags.ts:52,77-81`; squash `d0a99cabc`.
- **Shell:** `app/maia/page.tsx:703-729` (new) / `046ec02c7^:657` (old); `MaiaShell.tsx:224,254`; `MaiaCenterField.tsx:87`.
- **Geometry:** `OracleConversation.tsx:6862,8036-8049,8515`; viewport `app/layout.tsx:63-74`.
- **Focus:** `ModernTextInput.tsx:472`; `OracleConversation.tsx:3493-3504,8563`.
- **Input state:** `ModernTextInput.tsx:84,184-189,459`; not memo `:53`.
- **Scroll:** owner `OracleConversation.tsx:8057`; effect `:3268-3270`; per-word stream `:3949-3953`.
- **Render:** 9,407 lines; amplitude `:1601-1602,1685,2068-2069,3274`.
- **Orphaned CSS:** `mobile-fixes.css` `.with-keyboard :154-156`, `.input-area :62`, `.keyboard-visible .input-area :122`, `.mobile-container :51-59`; last touched `bd92b602d`.
- **visualViewport (only working instance):** `app/journey/page.tsx:121-146`.
- **Sub-room risk:** `bb4e3ceb3`; `lib/maia/presence/place.ts:69`; `MaiaPresence.tsx:145`.
- **Prior compensation:** `141bdeda9`.
