# Standard 6: Cognition Standards

> The system should feel like it notices — not like it reacts. Most of the time, nothing should surface.

## Purpose

Define when, how, and how little MAIA's visible intelligence should appear. This is the standard that prevents the system from becoming busy, intrusive, or over-explanatory.

## Non-Negotiable Rules

### R1. Sparse by default
Most of the time, the right panel should show world content only — no cognition items. Cognition signals should appear at most 2-3 times per 30-minute session. The absence of signals should feel like quiet presence, not emptiness.

### R2. Noticing, not generating
Cognition signals must reflect something MAIA actually detected in conversation (pattern match, theme recurrence, sacred text resonance). They must never be fabricated, random, or generated to fill space. Mock signals are dev-only — prohibited in production.

### R3. Maximum visible items: 2
The ConversationInsightPanel renders at most 2 items. Older items fade out as new ones arrive. Never show 3+ items simultaneously — that shifts from "noticing" to "briefing."

### R4. Relevance-gated display
Items with relevance < 0.3 must not render at all (not even at low opacity). Items with relevance 0.3-0.5 render at 40% opacity. Items above 0.7 render at full opacity. This prevents low-confidence noise from cluttering the panel.

### R5. No auto-opening panels
A cognition signal must never auto-open the right panel. Signals only appear if the panel is already open. World hints (rail breathing) provide the only ambient signal — a subtle invitation, not a demand.

### R6. World hints are single-breath
When MAIA detects something relevant to a world, that world's icon breathes once (2s animation, single cycle). Not a persistent glow. Not a badge. Not a notification count. A breath. One. Then it's done.

### R7. No proactive voice offers (Phase 7+)
MAIA must not speak unsolicited suggestions until the capability orchestration standards (Standard 5) define the suggestion → confirmation flow. Current system: display-only cognition, no voice offers.

### R8. Dismissal clears permanently
If a user dismisses a cognition item (closes panel, navigates away, or clicks dismiss), that specific insight must not reappear. Dismissed = gone.

## Approved Cognition Types (first wave)

| Type | Description | Trigger | World |
|------|------------|---------|-------|
| `pattern-match` | A recurring theme detected across conversations | Oracle response analysis | Patterns |
| `sacred-resonance` | Connection to a wisdom tradition the user has explored | Participatory reality theme detection | Wisdom |
| `theme-emergence` | A significant theme emerging in the current conversation | Theme signal scoring | Journal |

### Deferred types (not yet approved)
| Type | Status | Reason |
|------|--------|--------|
| `prior-thread` | Deferred | Requires memory system wiring |
| `capability-offer` | Deferred | Requires capability orchestration (Standard 5) |
| `relationship-thread` | Deferred | Relationships world not semantically stable |

## Frequency Limits

| Metric | Limit | Rationale |
|--------|-------|-----------|
| Max insights per 30-min session | 3 | More = briefing, not noticing |
| Max visible simultaneously | 2 | More = density, not intelligence |
| Min interval between new insights | 20 seconds | Prevents rapid-fire surfacing |
| Max world hints per 5 minutes | 2 | More = notification system, not presence |

## Thresholds: When NOT to Surface

| Condition | Action |
|-----------|--------|
| Voice is actively flowing (isVoiceFlowing = true) | Suppress new insights — don't interrupt |
| Right panel is closed | Do not open it — use rail hint only |
| User just dismissed an insight | 60s cooldown before next |
| Conversation is < 2 minutes old | No insights — too early to notice anything |
| Relevance < 0.3 | Do not render |

## Current State (Phase 6.5)

| Element | Status |
|---------|--------|
| ConversationInsightPanel | Built, production-ready |
| World hints (rail-breath) | Built, animation defined |
| Mock signals | Dev-only (gated by `NODE_ENV === 'development'`) |
| Real signals | Not wired — oracle/memory integration pending |
| Frequency governance | Not implemented — mock uses simple timer |
| Dismissal | Not implemented |
| Voice suppression | Not implemented |

## Current Gaps

| Gap | Severity | Fix |
|-----|----------|-----|
| No real cognition source wired | MEDIUM | Wire participatory reality theme detection → cognition events |
| No frequency governance | MEDIUM | Add session-level counter and min-interval enforcement |
| No dismissal handling | LOW | Add onDismiss callback to ConversationInsightPanel |
| No voice-flow suppression | LOW | Check isVoiceFlowing before surfacing |
| No conversation-age gate | LOW | Track conversation start time, suppress for first 2 min |

## Anti-Patterns

| Anti-pattern | Why it's wrong | What to do instead |
|-------------|----------------|-------------------|
| Frequent insight surfacing | Feels like notifications, not awareness | Keep sparse (max 3 per 30 min) |
| Auto-opening right panel for insights | Breaks user attention | Use rail hints only; panel must be manually opened |
| Persistent world icon glow | Feels like unread count | Single breath, then done |
| Insights during active speech | Interrupts the voice relationship | Suppress during isVoiceFlowing |
| Fabricated/random insights | Destroys trust | Only surface what was actually detected |
| High-frequency mock signals | Trains users to expect noise | Mock signals are dev-only, low frequency |

## Acceptance Criteria

- [ ] Real cognition signals wired to at least one source (participatory reality detection)
- [ ] Frequency limits enforced (max 3 per session, min 20s interval)
- [ ] Voice-flow suppression active
- [ ] Dismissal handling implemented
- [ ] Mock signals confirmed dev-only (not in production builds)
- [ ] No cognition item appears without a real detection backing it
- [ ] Rail hints are single-cycle only

## Recommended Sequence

1. Wire participatory reality theme detection → cognition events
2. Add frequency governance (session counter + interval enforcement)
3. Add voice-flow suppression
4. Add dismissal handling
5. Add conversation-age gate (no insights < 2 min)
6. Remove mock signals entirely (they've served their purpose)
