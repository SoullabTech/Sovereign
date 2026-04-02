# Standard 8: Security, Privacy, and Release Gating

> MAIA holds intimate human conversation. Every architectural choice must protect that trust.

## Purpose

Define privacy boundaries, safe logging rules, and release criteria for the spatial shell and talk-first system. This is the final gate before any feature defaults on.

## Non-Negotiable Rules

### R1. No voice transcript in logs
Voice command processing must log only: command ID, action type, world target, matched/rejected, timestamp. Never the transcript. Never fragments. Never phonetic approximations. User speech is sovereign.

### R2. No conversation content in cognition signals
Cognition events (insights, world hints) must contain only structural metadata: type, worldId, relevance, timestamp. Never conversation text. Never user quotes. Never paraphrased content. The insight `summary` field must be a generic description of the signal type, not a reflection of what was said.

### R3. No personal data in right panel content
Panel components (Patterns, Journal, Wisdom, etc.) link to existing pages that handle their own data loading and privacy. Panel components themselves must not fetch, cache, or display personal data inline.

### R4. Feature flag rollout must be incremental
`spatialMaiaShell` must be rolled out in this order:
1. Developer testing (current: manual localStorage toggle)
2. Internal team testing (specific member IDs)
3. Beta tester opt-in (feature flags page in settings)
4. Default-on for new sessions
5. Default-on for all users

Each stage requires passing the acceptance criteria from Standards 1-7.

### R5. Sanctuary mode must survive the spatial shell
If Sanctuary Mode is active, the spatial shell must not surface cognition signals, create insight logs, or trigger world hints. Sanctuary = no signals, no awareness display, no data. The voice relationship is held; the system forgets.

### R6. Voice navigation must not leak intent
Voice command matches must not be stored, aggregated, or used for analytics beyond session-scoped counters. Knowing that a user said "MAIA, open journal" is knowing something about their state. That knowledge must not persist beyond the session unless explicitly consented.

### R7. No third-party telemetry from spatial shell
The spatial shell must not send data to any external service (Sentry, analytics, etc.) without explicit review. Internal structured logging (console or server-side) only.

## Privacy Boundaries by Component

| Component | May access | Must NOT access |
|-----------|-----------|-----------------|
| MaiaShell | Voice state (presence, amplitude), active world | Conversation content, user data |
| MaiaTopBar | Explorer name, behavior mode | Conversation content |
| MaiaLeftRail | Active world, world hints | User data, conversation content |
| MaiaRightPanelHost | Insight metadata (type, relevance) | Insight content derived from speech |
| ConversationInsightPanel | Insight type, title (generic), relevance | Conversation quotes, personal data |
| VoiceNavigationBridge | World target, command ID | Transcript content |
| VoiceCommands (world-navigate) | Normalized transcript for matching | Must not store or log the transcript |

## Safe Logging Rules

### Allowed in production logs

```
[VoiceNav] command=world-navigate-journal action=world-navigate worldId=journal ts=1712044800000
[Shell] world-changed from=maia to=journal trigger=voice ts=1712044800000
[Shell] calm-mode entered ts=1712044800000
[Shell] calm-mode exited trigger=interaction ts=1712044803000
[Cognition] insight-surfaced type=pattern-match worldId=patterns relevance=0.6 ts=1712044820000
```

### Prohibited in any log

```
[VoiceNav] transcript="I need to write about my mother"  ← PROHIBITED
[Cognition] summary="User discussing grief about mother" ← PROHIBITED
[Shell] user said "open journal" about family topic       ← PROHIBITED
```

## Release Gate Checklist

Before `spatialMaiaShell` defaults to `true`:

### Architecture (Standards 1-2)
- [ ] No center competition — verified by visual review
- [ ] No new surfaces — verified by file audit
- [ ] Single ownership per concern — verified by component matrix
- [ ] Feature flag toggles cleanly — verified by integration test
- [ ] Console.log removed from all spatial shell components

### Interaction (Standard 3)
- [ ] All voice commands require MAIA prefix — verified by 47 unit tests
- [ ] False-positive prevention — verified by 23 negative test cases
- [ ] Calm mode timing correct — verified by manual test
- [ ] User-pinned panels survive voice flow — verified by manual test

### Quality (Standard 4)
- [ ] Voice command tests passing (47/47)
- [ ] No user-sensitive content in any log — verified by code review
- [ ] Feature flag toggle test passing

### Capability (Standard 5)
- [ ] No capability auto-executes — verified by code review
- [ ] Manual navigation continues to work — verified by manual test

### Cognition (Standard 6)
- [ ] Mock signals dev-only — verified by `NODE_ENV` gate
- [ ] No fabricated insights in production — verified by code review
- [ ] Max 2 visible items enforced

### Performance (Standard 7)
- [ ] `prefers-reduced-motion` respected
- [ ] Safari calm mode tested (no backdrop-blur glitch)
- [ ] Spatial shell tested in Capacitor/iOS simulator

### Privacy (Standard 8)
- [ ] No transcript in logs — verified by code review
- [ ] No conversation content in cognition signals — verified by code review
- [ ] Sanctuary mode compatibility confirmed
- [ ] No third-party telemetry from spatial shell

## Current Gaps

| Gap | Severity | Fix |
|-----|----------|-----|
| Sanctuary mode not checked in cognition signal path | MEDIUM | Add sanctuary check before surfacing any insight |
| No structured logging yet (console.log debug traces remain in bridge) | LOW | Replace with structured logger when available |
| No incremental rollout mechanism beyond localStorage | LOW | Add member-ID-based flag override for team testing |
| Voice command debug logs include command ID but not transcript — confirm | LOW | Audit all console.log in voiceCommands.ts world-navigate section |

## Anti-Patterns

| Anti-pattern | Why it's wrong | What to do instead |
|-------------|----------------|-------------------|
| Logging voice transcripts for "debugging" | Privacy violation | Log command ID + action only |
| Storing voice command history | Creates behavioral profile | Session-scoped counters only |
| Cognition summaries that quote the user | Feels surveillance-like | Use generic type descriptions |
| Sending spatial shell events to Sentry | Third-party data exposure | Internal logging only |
| Enabling flag for all users without staged rollout | High blast radius if bugs exist | Follow 5-stage rollout |

## Acceptance Criteria

- [ ] All privacy boundaries verified by code review
- [ ] Sanctuary mode integration confirmed
- [ ] No transcript content in any log path
- [ ] Incremental rollout plan documented and followed
- [ ] Release gate checklist fully passed before default-on

## Recommended Sequence

1. Audit all console.log in spatial shell for transcript leaks
2. Add sanctuary mode check to cognition signal path
3. Document 5-stage rollout plan with specific member IDs for stage 2
4. Run full release gate checklist
5. Enable for internal team (stage 2)
6. Collect feedback for 48h
7. Enable for beta testers (stage 3)
8. Default-on (stage 4-5) after feedback review
