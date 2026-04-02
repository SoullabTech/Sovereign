# Standard 3: Talk-First Interaction Standards

> Voice is the spine. UI is the field. These standards govern how speech and screen interact.

## Purpose

Define production-grade rules for voice-driven interaction so that MAIA feels like a conversational companion, not a voice-controlled dashboard.

## Non-Negotiable Rules

### R1. Voice command activation — conservative by default
All navigation voice commands MUST require the "MAIA" prefix (e.g., "MAIA, open journal"). No casual conversational mentions of world names may trigger navigation. This prevents false positives during natural speech.

**Current status**: Enforced. All `world-navigate-*` patterns in `voiceCommands.ts` require `maia,?` regex prefix.

### R2. No UI lockout during calm mode
Any interaction (pointer move, click, keyboard press, mic tap) must immediately restore full chrome visibility. Calm mode is de-emphasis, not disappearance.

**Current status**: Enforced. `revealChrome()` fires on pointermove, pointerdown, keydown. Hover overrides via CSS.

### R3. User intent beats ambient behavior
If a user explicitly opens a right panel (by clicking a world), the system must not auto-close it during voice flow. The `userPinnedPanel` flag governs this.

**Current status**: Enforced.

### R4. Voice state mapping — honest, not aspirational
Only map voice states that can be reliably detected. Do not introduce semantic states (like "breakthrough") until detection infrastructure exists. Current approved states: `idle`, `listening`, `processing`, `responding`.

**Current status**: Enforced. No `breakthrough` state.

### R5. No proactive voice offers (yet)
MAIA must not speak unsolicited suggestions until the cognition standards (Wave 2) define when this is appropriate. Current system is listen-respond only.

### R6. Center field follows voice, voice does not follow center
The visual environment responds to voice state (particles, glow, calm mode). Voice behavior is never altered by UI state. The center reacts to speech — speech does not react to pixels.

## Voice Command Registry (Production-Approved)

| Command | Phrases | Target | Status |
|---------|---------|--------|--------|
| Return to center | "MAIA, back to center" / "MAIA, come back" / "MAIA, go home" | `maia` | Approved |
| Open Journal | "MAIA, open journal" / "MAIA, let's journal this" | `journal` | Approved |
| Show Patterns | "MAIA, show patterns" / "MAIA, show my patterns" | `patterns` | Approved |
| Go to Depth | "MAIA, go deeper" / "MAIA, take this to depth" | `depth` | Approved |
| Open Wisdom | "MAIA, open wisdom" / "MAIA, sacred texts" | `wisdom` | Approved |
| Move to Studio | "MAIA, move to studio" / "MAIA, this is studio work" | `studio` | Approved |

### Not yet approved for voice
- Ideas (world not semantically stable)
- Relationships (world not semantically stable)
- Any capability invocation ("save this", "schedule this") — requires capability standards

## Voice State to Visual Mapping

| Voice State | Center Field | Left Rail | Top Bar |
|-------------|-------------|-----------|---------|
| `idle` | Gentle drift, amber glow | Full opacity | Full opacity |
| `listening` | Particles converge, opacity rises | Full opacity (or calm if sustained) | Full opacity (or calm) |
| `processing` | Teal glow shift, subtle shimmer | Calm mode after 1.5s debounce | Calm mode after 1.5s |
| `responding` | Particles pulse outward, gold glow | Calm mode + active icon warm glow | Calm mode |

## Calm Mode Timing

| Trigger | Timing |
|---------|--------|
| Engage calm | 1.5s after `isVoiceFlowing` becomes true |
| Disengage calm | 0.5s after `isVoiceFlowing` becomes false |
| Interaction reveal | Immediate (0ms) |
| Re-engage after interaction | 3s (if voice still flowing) |
| Calm opacity level | 15% (visible, not invisible) |

## Current Gaps

| Gap | Severity | Fix |
|-----|----------|-----|
| Voice presence state is coarse (`hasActiveSession` only) | MEDIUM | Wire ContinuousConversation state events for `listening`/`processing`/`responding` distinction. Not blocking for default-on. |
| Amplitude hardcoded to 0 | LOW | Wire `onAudioLevelChange` callback. Particles won't pulse until wired. |
| No voice command rejection logging | MEDIUM | Add structured logging for commands that match but are rejected (if any). Currently all matches dispatch. |
| No negative test for false positives | HIGH | Must test: natural conversation mentioning "journal", "patterns", "studio" without "MAIA" prefix should not trigger navigation. |

## Acceptance Criteria

- [ ] All voice commands require "MAIA" prefix — verified by test
- [ ] False positive test: 10 natural conversation fragments containing world names do not trigger navigation
- [ ] Calm mode engages/disengages within specified timing
- [ ] Any interaction restores chrome immediately
- [ ] User-pinned panels survive voice flow
- [ ] Voice state drives center field visuals (even if coarse)

## Recommended Next Steps

1. Write false-positive test cases for voice commands
2. Wire finer voice presence state from ContinuousConversation
3. Wire amplitude from audio level callbacks
4. Add structured logging for voice command matches (accepted/rejected)
5. Define voice command expansion criteria for Wave 2
