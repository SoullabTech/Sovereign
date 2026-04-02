# Production Hardening Roadmap

> Single execution sequence derived from Standards 1-8. Every item has a clear gate: must-do, should-do, or later.

---

## Tier 1: Must Do Before Default-On

These block the `spatialMaiaShell` flag from defaulting to `true`.

### 1.1 Privacy & Logging Audit
**Source**: Standards 4, 8
**Files**: All `components/maia/`, `lib/maia/`, `lib/voice/voiceCommands.ts`
**Task**: Audit every console.log and ensure no transcript content is logged. Replace debug logs with structured, privacy-safe logging.
**Checkpoint**: Code review before proceeding.

### 1.2 Sanctuary Mode Check
**Source**: Standard 8 (R5)
**Files**: `components/maia/MaiaShell.tsx`
**Task**: Before surfacing any cognition insight or triggering world hints, check if Sanctuary Mode is active. If active: empty insights, no hints.
**Dependency**: Need to identify how Sanctuary state is currently tracked (likely in OracleConversation or VoiceHUD settings).

### 1.3 Reduced Motion Support
**Source**: Standard 7 (R4)
**Files**: `components/maia/MaiaCenterField.tsx`
**Task**: Add `prefers-reduced-motion` media query check. When active: disable particle animations, disable glow color shifts, keep static background.
**Dependency**: None.

### 1.4 Safari Calm Mode Test
**Source**: Standard 7 (R3)
**Task**: Manual test of calm mode opacity transitions in Safari. Verify no `backdrop-blur` glitch on MaiaTopBar and MaiaLeftRail.
**Dependency**: None. Manual verification.

### 1.5 Capacitor/iOS Smoke Test
**Source**: Standard 7
**Task**: Test spatial shell in iOS simulator via Capacitor build. Verify: safe area insets, fixed positioning, backdrop-blur rendering.
**Dependency**: Requires Capacitor build pipeline access.

### 1.6 Mock Cognition Removal Confirmation
**Source**: Standard 6 (R2)
**Files**: `components/maia/MaiaShell.tsx`
**Task**: Verify mock signals are confirmed dev-only. Consider removing entirely if real signals are not imminent.
**Status**: Already gated behind `NODE_ENV === 'development'`. Confirmed.

---

## Tier 2: Should Do Soon After Default-On

These improve quality but don't block initial rollout.

### 2.1 Wire Finer Voice Presence State
**Source**: Standard 3
**Files**: `app/maia/page.tsx`, potentially `components/OracleConversation.tsx` (read-only)
**Task**: Map ContinuousConversation state events to `listening`, `processing`, `responding` instead of coarse `hasActiveSession` → `listening`.
**Dependency**: Need to identify which CC callbacks/events are available without modifying CC.

### 2.2 Wire Voice Amplitude
**Source**: Standards 3, 7
**Files**: `app/maia/page.tsx`
**Task**: Connect `onAudioLevelChange` callback to VoiceStateProvider amplitude. Must throttle to 10-15Hz via rAF batching (Standard 7 R2).
**Dependency**: 2.1 (voice state wiring).

### 2.3 Structured Logging Implementation
**Source**: Standard 4
**Files**: All spatial shell components
**Task**: Replace remaining console.log debug traces with structured logger. Log: world changes, voice navigation, calm mode, insight surfacing. Never log transcript.
**Dependency**: 1.1 (privacy audit).

### 2.4 Feature Flag Toggle Integration Test
**Source**: Standard 4
**Files**: New test file
**Task**: Automated test that toggles `spatialMaiaShell` on/off and verifies: no console errors, no state leaks, both paths render correctly.
**Dependency**: None.

### 2.5 Wire First Real Cognition Source
**Source**: Standard 6
**Files**: `app/api/oracle/conversation/route.ts` (read), `components/maia/MaiaShell.tsx`
**Task**: Connect participatory reality theme detection → cognition events. Replace mock signals with real detection output.
**Dependency**: 1.2 (sanctuary check), 2.3 (structured logging).

### 2.6 Cognition Frequency Governance
**Source**: Standard 6
**Files**: `components/maia/MaiaShell.tsx` or new `lib/maia/cognitionGovernor.ts`
**Task**: Add session-level counter (max 3 per 30 min), minimum interval (20s), voice-flow suppression, conversation-age gate (no insights < 2 min).
**Dependency**: 2.5 (real cognition source).

### 2.7 Insight Dismissal Handling
**Source**: Standard 6 (R8)
**Files**: `components/maia/panels/ConversationInsightPanel.tsx`, `components/maia/MaiaShell.tsx`
**Task**: Add dismiss button/gesture on insights. Dismissed insights never reappear in session.
**Dependency**: 2.5.

---

## Tier 3: Later Refinements

### 3.1 Wire First 3 Capabilities to Voice
**Source**: Standard 5
**Files**: `lib/voice/voiceCommands.ts`, `lib/maia/voiceNavigationBridge.ts`
**Task**: Wire `journal.create`, `journal.save`, `journal.dream` to voice commands with suggestion → confirmation flow.
**Dependency**: 2.5 (cognition), Standard 5 lifecycle implemented.

### 3.2 VoiceDoorway Component
**Source**: Standard 5
**Files**: New `components/maia/VoiceDoorway.tsx`
**Task**: Subtle pill/card that appears when MAIA suggests a capability. User confirms by voice ("yes") or tap.
**Dependency**: 3.1.

### 3.3 Mobile Viewport Pass
**Source**: Standard 7
**Files**: `components/maia/MaiaLeftRail.tsx`, `components/maia/MaiaShell.tsx`
**Task**: Hide left rail on viewports < 768px. Use bottom navigation or collapsible hamburger. Test touch targets (44x44 minimum).
**Dependency**: Desktop spatial shell stable and default-on.

### 3.4 Right Panel Transform-Based Animation
**Source**: Standard 7 (R5)
**Files**: `components/maia/MaiaShell.tsx`
**Task**: Replace `marginRight` center field offset with `transform: translateX` for smoother panel open/close during voice flow.
**Dependency**: None, but low priority.

### 3.5 Sheet State Context Extraction
**Source**: Standard 2
**Files**: `app/maia/page.tsx`, new `lib/maia/sheetContext.tsx`
**Task**: Lift 20+ sheet state variables from page.tsx to a context provider. Reduces page.tsx complexity.
**Dependency**: Default-on stable.

### 3.6 Remove Legacy Path
**Source**: Standard 2
**Files**: `app/maia/page.tsx`
**Task**: Remove the `else` branch (legacy layout) after flag has been default-on for sufficient time.
**Dependency**: Default-on for all users, no regression reports.

### 3.7 Incremental Rollout Tooling
**Source**: Standard 8 (R4)
**Task**: Build member-ID-based flag override for staged rollout (internal team → beta → all).
**Dependency**: None.

---

## Dependency Graph

```
1.1 (privacy audit) ──→ 2.3 (structured logging)
1.2 (sanctuary check) ──→ 2.5 (real cognition)
1.3 (reduced motion) ──→ [standalone]
1.4 (safari test) ──→ [standalone]
1.5 (capacitor test) ──→ [standalone]

2.1 (voice state) ──→ 2.2 (amplitude)
2.3 (logging) ──→ 2.5 (cognition)
2.5 (cognition) ──→ 2.6 (governance) ──→ 2.7 (dismissal)
2.5 (cognition) ──→ 3.1 (capabilities)
3.1 (capabilities) ──→ 3.2 (VoiceDoorway)
```

## Rollout Stages (Standard 8 R4)

| Stage | Audience | Gate |
|-------|----------|------|
| 1 | Developer (localStorage toggle) | Current — already available |
| 2 | Internal team (member ID override) | Tier 1 complete + visual review |
| 3 | Beta testers (settings opt-in) | Tier 1 + 2.1-2.4 complete |
| 4 | Default-on new sessions | Tier 1 + Tier 2 complete |
| 5 | Default-on all users | 48h of Tier 4 with no regression |
