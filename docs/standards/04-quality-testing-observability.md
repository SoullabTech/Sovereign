# Standard 4: Quality, Testing, and Observability

> The spatial shell must be verifiable, observable, and regression-safe before becoming the default experience.

## Purpose

Define what must be tested, logged, and monitored for the spatial shell and talk-first system to operate reliably in production.

## Non-Negotiable Rules

### R1. Feature flag toggle must be regression-free
Toggling `spatialMaiaShell` from false to true (or true to false) must produce zero console errors, zero visual glitches, and zero state leaks. The legacy path must remain byte-for-byte functional.

### R2. No user-sensitive content in logs
Voice command logs must never contain transcript content. Only log: command ID, action type, world target, accepted/rejected. Never log what the user said.

### R3. Every voice command must be testable
Each command pattern must have at least one positive match test and one negative (false positive) test.

### R4. Calm mode must not block interaction
Any combination of voice state + calm mode + user interaction must result in usable UI within 200ms.

## Test Matrix

### Unit Tests Needed

| Component | Test | Priority |
|-----------|------|----------|
| `voiceCommands.ts` | Each world-navigate pattern matches expected phrases | HIGH |
| `voiceCommands.ts` | Casual "journal" / "patterns" / "studio" without "MAIA" prefix do NOT match | HIGH |
| `voiceNavigationBridge.ts` | `dispatchVoiceNavigation` fires correct CustomEvent | MEDIUM |
| `voiceNavigationBridge.ts` | `onVoiceNavigate` receives and parses event correctly | MEDIUM |
| `voiceStateContext.tsx` | `isVoiceFlowing` derives correctly from presenceState | LOW |
| `voiceStateContext.tsx` | `isConversationActive` derives correctly | LOW |
| `maiaNav.ts` | `getWorld()` returns correct config for each ID | LOW |
| `maiaNav.ts` | `getPanelForWorld()` returns correct panel for each world | LOW |
| `capabilities.ts` | `getCapability()` finds each registered capability | LOW |
| `capabilities.ts` | `getCapabilitiesForWorld()` returns correct subset | LOW |

### Integration Tests Needed

| Scenario | Test | Priority |
|----------|------|----------|
| Feature flag off | Legacy path renders, no spatial shell components mount | HIGH |
| Feature flag on | Spatial shell renders, OracleConversation preserves state | HIGH |
| World navigation | Click each world icon, verify right panel opens with correct content | MEDIUM |
| Calm mode cycle | Simulate voice flow, verify chrome fades, simulate interaction, verify restore | MEDIUM |
| Voice navigation | Dispatch voice navigate event, verify world changes | MEDIUM |
| Panel pin | Open panel manually, simulate voice flow, verify panel stays open | MEDIUM |

### End-to-End Tests Needed

| Scenario | Test | Priority |
|----------|------|----------|
| Full conversation | Start voice conversation, verify center field responds, verify calm mode, verify chrome restore on pause | HIGH |
| Voice world switch | Say "MAIA, open journal" during conversation, verify transition | HIGH |
| Studio boundary | Say "MAIA, move to studio", verify route change to /studio | MEDIUM |

## Logging Matrix

### Must Log (structured, not console.log)

| Event | Data | Privacy |
|-------|------|---------|
| Voice command matched | `{ command, action, worldTarget, timestamp }` | Safe — no transcript |
| Voice navigation dispatched | `{ worldId, source, timestamp }` | Safe |
| World changed | `{ from, to, trigger: 'click' \| 'voice', timestamp }` | Safe |
| Calm mode entered/exited | `{ state, trigger, timestamp }` | Safe |
| Right panel opened/closed | `{ world, trigger: 'click' \| 'auto', pinned, timestamp }` | Safe |
| Cognition insight surfaced | `{ type, worldId, relevance, timestamp }` | Safe — no content |

### Must NOT Log

| Data | Reason |
|------|--------|
| Voice transcript content | Privacy — user speech is sacred |
| Conversation messages | Privacy — conversation content is sovereign |
| Personal identifiers in insight summaries | Privacy — insight text may contain personal context |
| Full voiceCommandResult objects | May contain transcript fragments |

### Current Logging Gaps

| Gap | Location | Fix |
|-----|----------|-----|
| 3 console.log() in MaiaModalManager | Lines 137, 144, 150 | Remove or route to structured logger |
| Voice nav bridge uses console.log | `voiceNavigationBridge.ts` | Replace with structured log (low priority — debug only) |
| Shell mock insight timer has no logging | `MaiaShell.tsx` | Add insight-surfaced log when mock signals fire |
| No world-change logging | `MaiaShell.tsx` | Add structured log in `handleWorldChange` |

## Observability

### Metrics to Track (when production logging is wired)

| Metric | Purpose |
|--------|---------|
| Voice commands per session (accepted) | Measures talk-first adoption |
| Voice commands per session (rejected/no-match) | Measures false positive rate |
| World transitions per session (by trigger: click vs voice) | Measures if voice is becoming primary |
| Calm mode duration per session | Measures sustained voice engagement |
| Right panel open duration by world | Measures which worlds are valued |
| Insight surface rate | Measures cognition frequency (should stay low) |
| Insight dismissal rate | Measures if cognition is intrusive |

## Acceptance Criteria

- [ ] Voice command unit tests pass (positive + negative for each command)
- [ ] Feature flag toggle test passes (no errors in either direction)
- [ ] All console.log() replaced with structured logging or removed
- [ ] No user-sensitive content appears in any log
- [ ] Calm mode interaction test passes (restore within 200ms)
- [ ] Panel pin test passes (user-opened panels survive voice flow)

## Recommended Implementation Sequence

1. Write voice command unit tests (positive + negative) — highest value
2. Remove console.log from MaiaModalManager
3. Write feature flag toggle integration test
4. Add structured logging for world changes and voice navigation
5. Write calm mode interaction test
6. Write panel pin survival test
7. Define observability dashboard for post-launch monitoring
