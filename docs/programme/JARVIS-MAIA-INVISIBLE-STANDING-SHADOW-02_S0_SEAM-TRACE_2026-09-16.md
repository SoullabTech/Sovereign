# INVISIBLE-STANDING-SHADOW-02 — S0 final-egress seam trace

## Trace result

The first plausible seam at `maiaService.ts` ~3703 is **not final**. After `finalizeMemberFacingText()`, `text` may still change via:

- AIN shape rewrite (`text = rewritten.trim()`),
- SELFLET marker stripping,
- `scrubIdentityDisclaimers()`.

The last stable member-facing text is immediately after `scrubIdentityDisclaimers()` and before the final `return { text, ... }` at the tail of `getMaiaResponse()`.

Therefore the live shadow is bound there.

## Existing persistence divergence — explicitly not repaired here

`addConversationExchange(...)` and `TurnsStore.addExchange(...)` currently occur **before** the late AIN/identity transformations. The durable assistant text can therefore differ from the final returned bytes in paths where a late transform fires.

This is pre-existing. SHADOW-02 does not claim:

- that persisted assistant text equals final returned text;
- that the audit can later be reconstructed from durable conversation history;
- that audio always equals the final returned text (voice synthesis also occurs earlier).

The shadow's first contract is narrower: audit the bytes that `getMaiaResponse()` actually returns to the Writer's Studio caller.

## Handoff boundary

Writer canonical handoff remains at the existing generation crossing:

`renderTurnForCognition → generateText() invoked → onHandoff() → await result`

The shadow call is far downstream of that crossing and must never enter or alter receipt semantics.
