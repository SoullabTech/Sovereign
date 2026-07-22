# SMCC Phase 0 — Baseline of record

**Branch:** `fix/ios-conversation-contract` created from `clean-main-no-secrets` (production).
**Authority:** `MOBILE_CHAT_INTERACTION_AUDIT_2026-07-21.md`.

## Commits of record
| | |
|---|---|
| Production (baseline) | `a3457a39f` |
| AIN OS migration boundary | `046ec02c7` |
| Last known-good (AIN Engine) | `046ec02c7^` |
| Undeployed session patches (preserve, do **not** apply) | `stash@{0}` |

## Desktop / Chromium baseline
Renders normally. The failure is **iOS visual-viewport-specific** and does **not** reproduce in Blink or on desktop (confirmed by all five investigators; "works on Chrome" per Larry/Kelly). Therefore desktop = **known-good; must not regress.** The in-app Chromium preview cannot exercise the bug or a fix — it is not an acceptance surface for this work.

## Device verification owner
**Kelly** (iPhone Safari). Every phase's definition of done is a real-iPhone acceptance test; this is the true rate-limiter.

## Implementation isolation
All code work runs in a **dedicated git worktree** on `fix/ios-conversation-contract`, so the extensive uncommitted WIP on `feature/practitioner-program-platform` is untouched. The **dev-only diagnostic overlay** (active element · inferred keyboard state · `visualViewport` dims · composer rect · scroll height/position · pinned state · textarea mount identity · composition start/end · focus/blur causes) is built as the **first artifact in that worktree** — wired and smoke-tested, gated dev-only (never shown to members) — rather than authored speculatively, per verify-not-guess.

## Pre-fix iPhone baseline capture — for Kelly (run now)
Record the **current (broken)** behavior on iPhone Safari at `soullab.life` → `/maia`, before any fix, so we have the "before" of before/after. Screen-record each:
1. **One-tap keyboard:** enter text mode, tap the field once. *(Expect: caret without keyboard / needs multiple taps.)*
2. **Typing continuity:** type a sentence slowly, then quickly. *(Expect: keyboard drops / text reverts.)*
3. **Response growth:** send a prompt that yields a long reply, keyboard open. *(Expect: reply behind keyboard / below fold / page jump.)*
4. **Keyboard lifecycle:** open, close, reopen; rotate portrait→landscape→portrait. *(Expect: displaced composer / stale inset.)*

These recordings become the baseline the Phase-by-phase "after" recordings are measured against.

## Next
Phase 1 spec (`SMCC_PHASE1_INPUT_OWNERSHIP_SPEC.md`) awaits Kelly's approval. On approval: set up the worktree → build+wire the diagnostic overlay → implement Phase 1 (input ownership) → Kelly device-verifies → Phase 2.
